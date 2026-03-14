// ── Project Manager — save, load, autosave, export PNG, import trace, canvas reset ──
import state from '../state.js';
import bus from '../EventBus.js';
import { $, showToast } from '../utils.js';
import { dbPut, dbGetAll } from '../db.js';
import { STICKERS, SHAPES, FILE_STICKERS } from '../constants/stickers.js';
import { BACKGROUNDS } from '../constants/backgrounds.js';
import { PROMPTS as PROMPTS_LIST } from '../constants/prompts.js';
import ObjectRenderer from '../engine/ObjectRenderer.js';

// ── External references resolved lazily via bus callbacks ──
// These avoid circular imports; CanvasManager exposes them
let _canvasManager = null;
function cm() {
  if (!_canvasManager) {
    // Dynamically import to avoid circular dependency at module load time
    throw new Error('ProjectManager: CanvasManager not yet registered. Call ProjectManager.registerCanvasManager() first.');
  }
  return _canvasManager;
}

// ═══════════════════════════════════════════════════════
// AUTOSAVE (debounced)
// ═══════════════════════════════════════════════════════
let autosaveTimer = null;
let autosaveDirty = false;

function scheduleAutosave() {
  autosaveDirty = true;
  if (autosaveTimer) clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(doAutosave, 2000);
}

function doAutosave() {
  if (!autosaveDirty) return;
  if (state.layers.length > 0 && state.currentView === 'draw') {
    saveProject(true);
    autosaveDirty = false;
  }
}

function initAutosaveListeners() {
  // Save on page unload so nothing is lost on refresh
  window.addEventListener('beforeunload', () => {
    if (autosaveDirty && state.layers.length > 0) {
      saveProject(true);
    }
  });
  // Also save when the tab becomes hidden
  window.addEventListener('visibilitychange', () => {
    if (document.hidden && autosaveDirty && state.layers.length > 0) {
      saveProject(true);
      autosaveDirty = false;
    }
  });
}

// ═══════════════════════════════════════════════════════
// SAVE / LOAD (multi-project)
// ═══════════════════════════════════════════════════════
async function saveProject(silent) {
  try {
    const id = state.currentProjectId || Date.now();
    state.currentProjectId = id;

    const projectData = {
      id: id,
      sortOrder: id,
      date: new Date().toLocaleDateString(),
      prompt: $('#draw-prompt-text')?.textContent || '',
      canvasWidth: state.canvasWidth,
      canvasHeight: state.canvasHeight,
      background: state.selectedBackground,
      layers: await Promise.all(state.layers.map(async l => ({
        id: l.id, name: l.name, visible: l.visible, opacity: l.opacity ?? 1,
        dataBlob: await new Promise(resolve => l.canvas.toBlob(resolve, 'image/png')),
        objects: (l.objects || []).map(o => {
          const s = { ...o };
          if (s.type === 'sticker') { delete s.img; }
          return s;
        }),
      }))),
      activeLayerId: state.activeLayerId,
    };
    // Thumbnail: merge all visible layers onto background
    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width  = state.canvasWidth;
    thumbCanvas.height = state.canvasHeight;
    const tctx = thumbCanvas.getContext('2d');
    renderBackground(tctx, thumbCanvas.width, thumbCanvas.height);
    state.layers.forEach(l => renderLayerToCanvas(tctx, l));
    tctx.globalAlpha = 1;
    projectData.thumbnailBlob = await new Promise(resolve => thumbCanvas.toBlob(resolve, 'image/png'));

    await dbPut(projectData);
    if (!silent) showToast('Saved!');
  } catch (e) {
    console.error('Save failed:', e);
    if (!silent) showToast('Save failed.');
  }
}

function loadProject(projectData) {
  const cmRef = cm();
  // Clear existing layers
  state.layers.forEach(l => l.canvas.remove());
  state.layers = [];
  cmRef.setLayerIdCounter(0);
  state.undoStack = [];
  state.redoStack = [];
  state.currentProjectId = projectData.id;

  // Restore canvas at saved dimensions (don't recalculate from viewport)
  const w = projectData.canvasWidth  || 1080;
  const h = projectData.canvasHeight || 1080;
  state.canvasWidth  = w;
  state.canvasHeight = h;
  cmRef.traceCanvas.width   = w;
  cmRef.traceCanvas.height  = h;
  cmRef.objectsCanvas.width = w;
  cmRef.objectsCanvas.height = h;
  cmRef.previewCanvas.width = w;
  cmRef.previewCanvas.height = h;

  // Restore background
  if (projectData.background) {
    state.selectedBackground = projectData.background;
    bus.emit('applyBackground', projectData.background);
  }

  // Restore layers
  (projectData.layers || []).forEach(ld => {
    const layer = cmRef.addLayer(ld.name);
    layer.visible = ld.visible;
    layer.opacity = ld.opacity ?? 1;
    layer.canvas.style.display = ld.visible ? '' : 'none';
    layer.canvas.style.opacity = layer.opacity;
    const img = new Image();
    img.onload = () => {
      layer.ctx.drawImage(img, 0, 0);
      // Restore objects after raster is loaded
      if (ld.objects) {
        layer.objects = ld.objects.map(o => {
          const obj = { ...o };
          if (obj.type === 'sticker' && !obj.img) {
            const sticker = STICKERS.find(s => s.name === obj.name);
            const fileSt  = FILE_STICKERS.find(s => s.name === obj.name);
            // Check for shape objects (name starts with "shape:")
            const shapeName = obj.name && obj.name.startsWith('shape:') ? obj.name.slice(6) : null;
            const shape = shapeName ? SHAPES.find(s => s.name === shapeName) : null;
            if (sticker) {
              const blob = new Blob([sticker.svg], { type: 'image/svg+xml' });
              const url = URL.createObjectURL(blob);
              const simg = new Image();
              simg.onload = () => { URL.revokeObjectURL(url); obj.img = simg; ObjectRenderer.invalidateAllLayerCaches(); bus.emit('renderObjects'); };
              simg.src = url;
            } else if (shape) {
              const svgStr = shape.svg.replace(/currentColor/g, obj.shapeColor || '#000000');
              const blob = new Blob([svgStr], { type: 'image/svg+xml' });
              const url = URL.createObjectURL(blob);
              const simg = new Image();
              simg.onload = () => { URL.revokeObjectURL(url); obj.img = simg; ObjectRenderer.invalidateAllLayerCaches(); bus.emit('renderObjects'); };
              simg.src = url;
            } else if (fileSt) {
              const simg = new Image();
              simg.crossOrigin = 'anonymous';
              simg.onload = () => { obj.img = simg; ObjectRenderer.invalidateAllLayerCaches(); bus.emit('renderObjects'); };
              simg.src = fileSt.src;
            }
          }
          return obj;
        });
      }
    };
    // Support both blob (IndexedDB) and data URL (imported file) formats
    if (ld.dataBlob instanceof Blob) {
      const origOnload = img.onload;
      const blobURL = URL.createObjectURL(ld.dataBlob);
      img.onload = function() {
        URL.revokeObjectURL(blobURL);
        origOnload.call(this);
      };
      img.src = blobURL;
    } else if (ld.data) {
      img.src = ld.data;
    }
  });

  cmRef.setLayerIdCounter(Math.max(...(projectData.layers || []).map(l => l.id || 0), 0));
  state.activeLayerId = projectData.activeLayerId || state.layers[0]?.id;
  cmRef.renderLayerList();
  bus.emit('updateUndoRedoButtons');
  ObjectRenderer.invalidateAllLayerCaches();
  setTimeout(() => bus.emit('renderObjects'), 100);
  if (projectData.prompt) {
    const el = $('#draw-prompt-text');
    if (el) el.textContent = projectData.prompt;
  }
}

// ═══════════════════════════════════════════════════════
// EXPORT PNG
// ═══════════════════════════════════════════════════════
function exportPNG() {
  const merged = document.createElement('canvas');
  merged.width  = state.canvasWidth;
  merged.height = state.canvasHeight;
  const mctx = merged.getContext('2d');
  renderBackground(mctx, merged.width, merged.height);
  state.layers.forEach(l => renderLayerToCanvas(mctx, l));
  mctx.globalAlpha = 1;
  const link = document.createElement('a');
  link.download = 'elsies-spark-' + Date.now() + '.png';
  link.href = merged.toDataURL('image/png');
  link.click();
}

// ═══════════════════════════════════════════════════════
// RENDER HELPERS (for export / thumbnail)
// ═══════════════════════════════════════════════════════
function renderBackground(ctx, w, h) {
  const bg = BACKGROUNDS.find(b => b.id === state.selectedBackground);
  if (!bg) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h); return; }
  if (bg.imageSrc && bg._img) {
    // Draw image background covering the canvas
    const iw = bg._img.width, ih = bg._img.height;
    const scale = Math.max(w / iw, h / ih);
    const sw = iw * scale, sh = ih * scale;
    ctx.drawImage(bg._img, (w - sw) / 2, (h - sh) / 2, sw, sh);
  } else if (bg.imageSrc) {
    // Image not loaded yet, fill white as fallback
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
  } else if (bg.pattern === 'grid') {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    for (let y = 0; y <= h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  } else if (bg.pattern === 'dots') {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#cccccc';
    for (let x = 14; x < w; x += 28) for (let y = 14; y < h; y += 28) {
      ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
    }
  } else if (bg.pattern === 'lined') {
    ctx.fillStyle = '#fafcff'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#b0c8e8'; ctx.lineWidth = 1;
    for (let y = 36; y <= h; y += 36) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  } else if (bg.style && bg.style.includes('linear-gradient')) {
    const colors = bg.style.match(/#[0-9a-fA-F]{3,8}/g) || ['#ffffff'];
    const angle = parseFloat(bg.style.match(/(\d+)deg/) ? bg.style.match(/(\d+)deg/)[1] : '180');
    const rad = (angle - 90) * Math.PI / 180;
    const cx = w / 2, cy = h / 2, len = Math.max(w, h);
    const grad = ctx.createLinearGradient(
      cx - Math.cos(rad) * len / 2, cy - Math.sin(rad) * len / 2,
      cx + Math.cos(rad) * len / 2, cy + Math.sin(rad) * len / 2
    );
    colors.forEach((c, i) => grad.addColorStop(i / Math.max(colors.length - 1, 1), c));
    ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
  } else {
    ctx.fillStyle = bg.style || '#ffffff'; ctx.fillRect(0, 0, w, h);
  }
}

function renderLayerToCanvas(targetCtx, l) {
  if (!l.visible) return;
  const hasEraser = l.objects && l.objects.some(o => o.brush === 'eraser');
  if (hasEraser) {
    const tmp = getLayerTmpCanvas();
    tmp.ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
    tmp.ctx.drawImage(l.canvas, 0, 0);
    l.objects.forEach(obj => ObjectRenderer.drawObjectTo(tmp.ctx, obj));
    targetCtx.globalAlpha = l.opacity ?? 1;
    targetCtx.drawImage(tmp.canvas, 0, 0);
  } else {
    targetCtx.globalAlpha = l.opacity ?? 1;
    targetCtx.drawImage(l.canvas, 0, 0);
    if (l.objects) l.objects.forEach(obj => ObjectRenderer.drawObjectTo(targetCtx, obj));
  }
}

// Reusable temp canvas for compositing layers with eraser objects
let _layerTmpCanvas = null;
function getLayerTmpCanvas() {
  if (!_layerTmpCanvas || _layerTmpCanvas.canvas.width !== state.canvasWidth || _layerTmpCanvas.canvas.height !== state.canvasHeight) {
    const c = document.createElement('canvas');
    c.width = state.canvasWidth;
    c.height = state.canvasHeight;
    _layerTmpCanvas = { canvas: c, ctx: c.getContext('2d') };
  }
  return _layerTmpCanvas;
}

// ═══════════════════════════════════════════════════════
// IMAGE IMPORT (TRACING)
// ═══════════════════════════════════════════════════════
function importTraceImage(file) {
  const cmRef = cm();
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      state.traceImage = img;
      cmRef.traceCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
      const scale = Math.min(state.canvasWidth / img.width, state.canvasHeight / img.height);
      const w = img.width * scale, h = img.height * scale;
      cmRef.traceCtx.drawImage(img, (state.canvasWidth - w) / 2, (state.canvasHeight - h) / 2, w, h);
      cmRef.traceCanvas.style.display = '';
      $('#btn-clear-trace').hidden = false;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function clearTrace() {
  const cmRef = cm();
  cmRef.traceCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
  state.traceImage = null;
  cmRef.traceCanvas.style.display = 'none';
  $('#btn-clear-trace').hidden = true;
}

// ═══════════════════════════════════════════════════════
// CANVAS RESET HELPERS
// ═══════════════════════════════════════════════════════
function canvasHasContent() {
  return state.layers.some(l => {
    const d = l.ctx.getImageData(0, 0, l.canvas.width, l.canvas.height).data;
    for (let i = 3; i < d.length; i += 4) { if (d[i] > 0) return true; }
    return false;
  });
}

function resetToNewCanvas() {
  const cmRef = cm();
  // Remove existing layer canvases
  state.layers.forEach(l => l.canvas.remove());
  state.layers = [];
  cmRef.setLayerIdCounter(0);
  // Clear history so undo can't restore old drawing
  state.undoStack = [];
  state.redoStack = [];
  bus.emit('updateUndoRedoButtons');
  // Detach from any saved project so future saves won't overwrite it
  state.currentProjectId = null;
  autosaveDirty = false;
  if (autosaveTimer) { clearTimeout(autosaveTimer); autosaveTimer = null; }
  // Clear trace image and objects
  cmRef.traceCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
  state.traceImage = null;
  cmRef.traceCanvas.style.display = 'none';
  const clearTraceBtn = $('#btn-clear-trace');
  if (clearTraceBtn) clearTraceBtn.hidden = true;
  cmRef.objectsCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
  cmRef.previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
  // Reset background
  state.selectedBackground = 'white';
  bus.emit('applyBackground', 'white');
  // Leave layers empty — onEnterDraw will call setupCanvas + addLayer
  // when showView('draw') runs, ensuring correct dimensions
}

function promptSaveAndReset(afterReset) {
  // If canvas is empty or brand-new, just reset
  if (!canvasHasContent()) {
    resetToNewCanvas();
    if (afterReset) afterReset();
    return;
  }
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box">
      <h3>Save your drawing?</h3>
      <p>You have unsaved changes. Would you like to save before starting a new drawing?</p>
      <div class="modal-actions modal-actions-triple">
        <button class="modal-btn-cancel">Cancel</button>
        <button class="modal-btn-secondary">Don't Save</button>
        <button class="modal-btn-primary">Save</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('.modal-btn-cancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelector('.modal-btn-secondary').addEventListener('click', () => {
    overlay.remove();
    resetToNewCanvas();
    if (afterReset) afterReset();
  });
  overlay.querySelector('.modal-btn-primary').addEventListener('click', async () => {
    await saveProject(false);
    overlay.remove();
    resetToNewCanvas();
    if (afterReset) afterReset();
  });
}

// ═══════════════════════════════════════════════════════
// DAILY PROMPT (legacy — shown in draw top bar)
// ═══════════════════════════════════════════════════════
function showDailyPrompt() {
  // PROMPTS imported at top of module
  const today = new Date().toDateString();
  let seed = 0;
  for (let i = 0; i < today.length; i++) seed += today.charCodeAt(i);
  const text = PROMPTS_LIST[seed % PROMPTS_LIST.length];
  const el = $('#draw-prompt-text');
  if (el) el.textContent = text;
}

// ═══════════════════════════════════════════════════════
// REGISTER CANVAS MANAGER (avoids circular import)
// ═══════════════════════════════════════════════════════
function registerCanvasManager(canvasManager) {
  _canvasManager = canvasManager;
}

// ═══════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════
function initProjectManager() {
  initAutosaveListeners();

  // Note: btn-export, btn-layer-export, btn-import-image, btn-clear-trace
  // are bound in Toolbar.js to avoid duplicate event listeners.

  // Note: btn-clear-canvas and Ctrl+S are bound in Toolbar.js.
}

// ── Bus event bindings ──
bus.on('scheduleAutosave', scheduleAutosave);
bus.on('project:save', (silent) => saveProject(silent));
bus.on('project:load', loadProject);
bus.on('project:promptSaveAndReset', (afterReset) => {
  if (state.layers.length > 0 && autosaveDirty && canvasHasContent()) {
    promptSaveAndReset(afterReset);
  } else {
    // Always reset to a fresh canvas for the new spark
    resetToNewCanvas();
    if (afterReset) afterReset();
  }
});

export {
  initProjectManager,
  registerCanvasManager,
  saveProject,
  loadProject,
  exportPNG,
  importTraceImage,
  clearTrace,
  scheduleAutosave,
  resetToNewCanvas,
  promptSaveAndReset,
  canvasHasContent,
  renderBackground,
  renderLayerToCanvas,
};

export default {
  initProjectManager,
  registerCanvasManager,
  saveProject,
  loadProject,
  exportPNG,
  importTraceImage,
  clearTrace,
  scheduleAutosave,
  resetToNewCanvas,
  promptSaveAndReset,
  canvasHasContent,
  renderBackground,
  renderLayerToCanvas,
};
