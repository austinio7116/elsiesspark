// ═══════════════════════════════════════════════════════
// COLOR PICKER — grid, spectrum, sliders, saved swatches
// ═══════════════════════════════════════════════════════
import state from '../state.js';
import bus from '../EventBus.js';
import { $, $$, showToast, hslToHex, hexToHsl } from '../utils.js';
import { updateBrushPreview } from './SheetManager.js';
import ObjectRenderer from '../engine/ObjectRenderer.js';
import CanvasManager from '../engine/CanvasManager.js';
import { renderBackground, renderLayerToCanvas } from '../io/ProjectManager.js';

// ── Spectrum drag state ──
let spectrumDragging = false;
let hueDragging = false;

// ═══════════════════════════════════════════════════════
// SET COLOR GLOBALLY
// ═══════════════════════════════════════════════════════
export function setColor(hex) {
  state.color = hex;
  updateColorSwatch();
  syncSlidersTabs(hex);
  updateColorGridSelection();
  // Update selected stroke / text color
  if (state.selectMode && state.selectedObject && (state.selectedObject.type === 'stroke' || state.selectedObject.type === 'text')) {
    bus.emit('pushUndo');
    state.selectedObject.color = hex;
    ObjectRenderer.markLayerDirty(CanvasManager.getActiveLayer());
    bus.emit('renderObjects');
    bus.emit('drawSelectionHandles');
  }
  // Update selected shape color
  if (state.selectMode && state.selectedObject && state.selectedObject.type === 'sticker' && state.selectedObject.name && state.selectedObject.name.startsWith('shape:')) {
    bus.emit('pushUndo');
    bus.emit('shape:recolor', hex);
  }
}

// ═══════════════════════════════════════════════════════
// COLOR SWATCH (toolbar button)
// ═══════════════════════════════════════════════════════
export function updateColorSwatch() {
  const sw = $('#tb-color-swatch');
  if (!sw) return;
  sw.style.background = state.color;
  sw.style.backgroundClip = 'padding-box';
  sw.style.boxShadow = 'inset 0 0 0 2.5px white';
  updateBrushPreview();
}

// ═══════════════════════════════════════════════════════
// GRID TAB
// ═══════════════════════════════════════════════════════
function buildColorGrid() {
  const grid = $('#color-grid');
  if (!grid) return;
  grid.innerHTML = '';
  // Grayscale column
  const grays = [100, 90, 75, 62, 50, 38, 25, 12, 5, 0];
  grays.forEach(l => {
    const c = hslToHex(0, 0, l);
    grid.appendChild(makeColorCell(c));
  });
  // Hue columns (12 hues x 10 lightnesses)
  const hues = [0, 20, 40, 60, 90, 140, 180, 210, 240, 270, 300, 330, 355];
  const lights = [95, 85, 75, 65, 55, 45, 35, 25, 15, 6];
  hues.forEach(h => {
    lights.forEach(l => {
      const c = hslToHex(h, 75, l);
      grid.appendChild(makeColorCell(c));
    });
  });
}

function makeColorCell(hex) {
  const el = document.createElement('div');
  el.className = 'color-cell';
  el.style.background = hex;
  if (hex === state.color) el.classList.add('selected');
  el.addEventListener('click', () => { setColor(hex); bus.emit('closeSheet'); });
  el.dataset.color = hex;
  return el;
}

export function updateColorGridSelection() {
  $$('.color-cell').forEach(el => {
    el.classList.toggle('selected', el.dataset.color === state.color);
  });
}

// ═══════════════════════════════════════════════════════
// SPECTRUM TAB
// ═══════════════════════════════════════════════════════
function drawSpectrum() {
  const canvas = $('#spectrum-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.offsetWidth  || 300;
  const cssH = canvas.offsetHeight || 180;
  canvas.width  = cssW * dpr;
  canvas.height = cssH * dpr;
  const w = canvas.width;
  const h = canvas.height;

  // White -> current hue (left-right), then black overlay (top-bottom)
  const hue = state.spectrumHue;
  const gradH = ctx.createLinearGradient(0, 0, w, 0);
  gradH.addColorStop(0, `hsl(${hue},0%,100%)`);
  gradH.addColorStop(1, `hsl(${hue},100%,50%)`);
  ctx.fillStyle = gradH;
  ctx.fillRect(0, 0, w, h);
  const gradV = ctx.createLinearGradient(0, 0, 0, h);
  gradV.addColorStop(0, 'rgba(0,0,0,0)');
  gradV.addColorStop(1, 'rgba(0,0,0,1)');
  ctx.fillStyle = gradV;
  ctx.fillRect(0, 0, w, h);
  updateSpectrumCursor();
}

function drawHueBar() {
  const canvas = $('#hue-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.offsetWidth  || 300;
  const cssH = canvas.offsetHeight || 22;
  canvas.width  = cssW * dpr;
  canvas.height = cssH * dpr;
  const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
  for (let i = 0; i <= 360; i += 30) {
    grad.addColorStop(i / 360, `hsl(${i},100%,50%)`);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  updateHueCursor();
}

function updateSpectrumCursor() {
  const cursor  = $('#spectrum-cursor');
  const wrapper = $('#spectrum-wrapper');
  if (!cursor || !wrapper) return;
  const w = wrapper.clientWidth, h = wrapper.querySelector('canvas').offsetHeight;
  const x = (state.spectrumS / 100) * w;
  const y = (1 - (state.spectrumV / 100)) * h;
  cursor.style.left = x + 'px';
  cursor.style.top  = y + 'px';
  cursor.style.background = state.color;
}

function updateHueCursor() {
  const cursor  = $('#hue-cursor');
  const wrapper = $('#hue-wrapper');
  if (!cursor || !wrapper) return;
  cursor.style.left = (state.spectrumHue / 360) * wrapper.clientWidth + 'px';
}

function pickFromSpectrum(e) {
  const canvas = $('#spectrum-canvas');
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
  const y = Math.max(0, Math.min(e.clientY - rect.top,  rect.height));
  state.spectrumS = Math.round((x / rect.width)  * 100);
  const brightness = Math.round((1 - y / rect.height) * 100);
  state.spectrumV = brightness;
  // Convert HSV (hue, S, brightness) to HSL
  const hue  = state.spectrumHue;
  const s    = state.spectrumS;
  const v    = brightness;
  const lRaw = v * (2 - s / 100) / 2;
  const sHSL = lRaw === 0 || lRaw === 100 ? 0 : (v - lRaw) / Math.min(lRaw, 100 - lRaw) * 100;
  state.spectrumL = Math.round(lRaw);
  const hex = hslToHex(hue, Math.round(sHSL), Math.round(lRaw));
  state.color = hex;
  updateColorSwatch();
  updateSpectrumCursor();
  updateSlidersFromColor();
  updateColorGridSelection();
}

function pickFromHueBar(e) {
  const canvas = $('#hue-canvas');
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
  state.spectrumHue = Math.round((x / rect.width) * 360);
  updateHueCursor();
  drawSpectrum();
  // Re-pick from the same relative position in spectrum (convert HSV to HSL)
  const sv = state.spectrumS, vv = state.spectrumV || 50;
  const lRaw = vv * (2 - sv / 100) / 2;
  const sHSL = lRaw === 0 || lRaw === 100 ? 0 : (vv - lRaw) / Math.min(lRaw, 100 - lRaw) * 100;
  const hex = hslToHex(state.spectrumHue, Math.round(sHSL), Math.round(lRaw));
  state.color = hex;
  updateColorSwatch();
  updateSlidersFromColor();
  updateColorGridSelection();
}

// ═══════════════════════════════════════════════════════
// SLIDERS TAB
// ═══════════════════════════════════════════════════════
function updateSlidersFromColor() {
  const [h, s, l] = hexToHsl(state.color);
  const sh = $('#slider-h'), ss = $('#slider-s'), sl = $('#slider-l');
  if (sh) { sh.value = h; $('#val-h').textContent = h; }
  if (ss) { ss.value = s; $('#val-s').textContent = s + '%'; }
  if (sl) { sl.value = l; $('#val-l').textContent = l + '%'; }
  const preview = $('#slider-preview');
  if (preview) preview.style.background = state.color;
}

function updateSlidersDisplay() {
  const h = parseInt($('#slider-h').value);
  const s = parseInt($('#slider-s').value);
  const l = parseInt($('#slider-l').value);
  $('#val-h').textContent = h;
  $('#val-s').textContent = s + '%';
  $('#val-l').textContent = l + '%';
  const hex = hslToHex(h, s, l);
  state.color = hex;
  updateColorSwatch();
  const preview = $('#slider-preview');
  if (preview) preview.style.background = hex;
  // Sync spectrum from HSL
  const sF = s / 100, lF = l / 100;
  const v = lF + sF * Math.min(lF, 1 - lF);
  const sv = v === 0 ? 0 : 2 * (1 - lF / v);
  state.spectrumHue = h;
  state.spectrumS   = Math.round(sv * 100);
  state.spectrumV   = Math.round(v * 100);
  state.spectrumL   = l;
  drawSpectrum();
  drawHueBar();
  updateHueCursor();
  updateColorGridSelection();
}

export function syncSlidersTabs(hex) {
  const [h, s, l] = hexToHsl(hex);
  state.spectrumHue = h;
  // Convert HSL (s, l) to HSV (s, v) for spectrum cursor
  const sF = s / 100, lF = l / 100;
  const v = lF + sF * Math.min(lF, 1 - lF);
  const sv = v === 0 ? 0 : 2 * (1 - lF / v);
  state.spectrumS   = Math.round(sv * 100);
  state.spectrumV   = Math.round(v * 100);
  state.spectrumL   = l;
  updateSlidersFromColor();
  if ($('#tab-spectrum').classList.contains('active')) {
    drawSpectrum();
    drawHueBar();
  }
}

// ═══════════════════════════════════════════════════════
// SAVED SWATCHES
// ═══════════════════════════════════════════════════════
function loadSavedSwatches() {
  try {
    const raw = localStorage.getItem('elsiespark-swatches');
    state.savedSwatches = raw ? JSON.parse(raw) : ['#e87461','#f7c948','#6ab04c','#4a90d9','#9b59b6'];
  } catch (_) {
    state.savedSwatches = ['#e87461','#f7c948','#6ab04c','#4a90d9','#9b59b6'];
  }
}

function saveSwatch() {
  if (state.savedSwatches.includes(state.color)) return;
  state.savedSwatches.unshift(state.color);
  if (state.savedSwatches.length > 8) state.savedSwatches.pop();
  localStorage.setItem('elsiespark-swatches', JSON.stringify(state.savedSwatches));
  renderSavedSwatches();
  showToast('Colour saved!');
}

function renderSavedSwatches() {
  const row = $('#saved-swatches');
  if (!row) return;
  row.innerHTML = '';
  state.savedSwatches.forEach(c => {
    const el = document.createElement('div');
    el.className = 'saved-swatch' + (c === state.color ? ' active' : '');
    el.style.background = c;
    el.addEventListener('click', () => { setColor(c); });
    row.appendChild(el);
  });
}

// ═══════════════════════════════════════════════════════
// EYEDROPPER — pick any color from the canvas
// ═══════════════════════════════════════════════════════
let _eyedropperActive = false;
let _eyedropperCanvas = null; // merged snapshot of all visible layers + background
let _eyedropperCtx = null;

function _buildEyedropperSnapshot() {
  if (!_eyedropperCanvas) {
    _eyedropperCanvas = document.createElement('canvas');
    _eyedropperCtx = _eyedropperCanvas.getContext('2d', { willReadFrequently: true });
  }
  _eyedropperCanvas.width = state.canvasWidth;
  _eyedropperCanvas.height = state.canvasHeight;
  renderBackground(_eyedropperCtx, state.canvasWidth, state.canvasHeight);
  state.layers.forEach(l => renderLayerToCanvas(_eyedropperCtx, l));
  _eyedropperCtx.globalAlpha = 1;
}

function _eyedropperCanvasPos(e) {
  const rect = CanvasManager.previewCanvas.getBoundingClientRect();
  return {
    x: Math.round((e.clientX - rect.left) * (state.canvasWidth / rect.width)),
    y: Math.round((e.clientY - rect.top) * (state.canvasHeight / rect.height)),
  };
}

function _rgbToHex(r, g, b) {
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

function _updateLoupe(e, cx, cy) {
  const loupe = $('#eyedropper-loupe');
  const loupeCanvas = $('#loupe-canvas');
  const label = $('#loupe-color-label');
  if (!loupe || !loupeCanvas || !_eyedropperCtx) return;

  // Position loupe above the finger/cursor (offset up so it's visible)
  const offsetY = 90;
  loupe.style.left = (e.clientX - 60) + 'px';
  loupe.style.top = (e.clientY - 120 - offsetY) + 'px';

  // Draw magnified view (8x zoom, 15x15 pixel area -> 120x120 canvas)
  const lctx = loupeCanvas.getContext('2d');
  const zoom = 8;
  const sampleSize = Math.floor(120 / zoom); // 15 pixels
  const half = Math.floor(sampleSize / 2);
  lctx.clearRect(0, 0, 120, 120);
  lctx.imageSmoothingEnabled = false;
  // Source rect from the snapshot
  const sx = Math.max(0, cx - half);
  const sy = Math.max(0, cy - half);
  const sw = Math.min(sampleSize, state.canvasWidth - sx);
  const sh = Math.min(sampleSize, state.canvasHeight - sy);
  if (sw > 0 && sh > 0) {
    lctx.drawImage(_eyedropperCanvas, sx, sy, sw, sh, 0, 0, sw * zoom, sh * zoom);
  }

  // Read center pixel color
  const px = Math.max(0, Math.min(cx, state.canvasWidth - 1));
  const py = Math.max(0, Math.min(cy, state.canvasHeight - 1));
  const data = _eyedropperCtx.getImageData(px, py, 1, 1).data;
  const hex = _rgbToHex(data[0], data[1], data[2]);
  label.textContent = hex.toUpperCase();
  label.style.background = hex;
  // Use contrasting text
  const luma = data[0] * 0.299 + data[1] * 0.587 + data[2] * 0.114;
  label.style.color = luma > 140 ? '#000' : '#fff';
}

function _eyedropperDown(e) {
  if (!_eyedropperActive) return;
  e.preventDefault();
  e.stopPropagation();
  const loupe = $('#eyedropper-loupe');
  if (loupe) loupe.classList.remove('hidden');
  const pos = _eyedropperCanvasPos(e);
  _updateLoupe(e, pos.x, pos.y);
}

function _eyedropperMove(e) {
  if (!_eyedropperActive) return;
  e.preventDefault();
  e.stopPropagation();
  const loupe = $('#eyedropper-loupe');
  if (!loupe || loupe.classList.contains('hidden')) return;
  const pos = _eyedropperCanvasPos(e);
  _updateLoupe(e, pos.x, pos.y);
}

function _eyedropperUp(e) {
  if (!_eyedropperActive) return;
  e.preventDefault();
  e.stopPropagation();
  const loupe = $('#eyedropper-loupe');
  if (loupe) loupe.classList.add('hidden');
  // Sample the final pixel
  const pos = _eyedropperCanvasPos(e);
  const px = Math.max(0, Math.min(pos.x, state.canvasWidth - 1));
  const py = Math.max(0, Math.min(pos.y, state.canvasHeight - 1));
  if (_eyedropperCtx) {
    const data = _eyedropperCtx.getImageData(px, py, 1, 1).data;
    const hex = _rgbToHex(data[0], data[1], data[2]);
    setColor(hex);
    showToast('Color picked!');
  }
  exitEyedropper();
}

function _eyedropperKeydown(e) {
  if (e.key === 'Escape') exitEyedropper();
}

function enterEyedropper() {
  _eyedropperActive = true;
  _buildEyedropperSnapshot();
  const btn = $('#btn-eyedropper');
  if (btn) btn.classList.add('active');
  // Close the color sheet so the canvas is visible
  bus.emit('closeSheet');
  // Intercept pointer events on the preview canvas
  const preview = CanvasManager.previewCanvas;
  preview.style.cursor = 'crosshair';
  preview.addEventListener('pointerdown', _eyedropperDown, { capture: true });
  preview.addEventListener('pointermove', _eyedropperMove, { capture: true });
  preview.addEventListener('pointerup', _eyedropperUp, { capture: true });
  preview.addEventListener('pointercancel', _eyedropperCancel, { capture: true });
  preview.style.touchAction = 'none';
  document.addEventListener('keydown', _eyedropperKeydown);
}

function _eyedropperCancel(e) {
  if (!_eyedropperActive) return;
  const loupe = $('#eyedropper-loupe');
  if (loupe) loupe.classList.add('hidden');
  exitEyedropper();
}

function exitEyedropper() {
  _eyedropperActive = false;
  const btn = $('#btn-eyedropper');
  if (btn) btn.classList.remove('active');
  const preview = CanvasManager.previewCanvas;
  preview.style.cursor = state.selectMode ? 'default' : 'crosshair';
  preview.removeEventListener('pointerdown', _eyedropperDown, { capture: true });
  preview.removeEventListener('pointermove', _eyedropperMove, { capture: true });
  preview.removeEventListener('pointerup', _eyedropperUp, { capture: true });
  preview.removeEventListener('pointercancel', _eyedropperCancel, { capture: true });
  document.removeEventListener('keydown', _eyedropperKeydown);
}

// ═══════════════════════════════════════════════════════
// INIT — build grid, bind spectrum & slider events
// ═══════════════════════════════════════════════════════
export function initColorPicker() {
  // Build initial UI
  loadSavedSwatches();
  renderSavedSwatches();
  buildColorGrid();

  // ── Color sheet tabs ──
  $$('.sheet-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.sheet-tab').forEach(t => t.classList.remove('active'));
      $$('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panelId = 'tab-' + tab.dataset.tab;
      document.getElementById(panelId).classList.add('active');
      if (tab.dataset.tab === 'spectrum') {
        setTimeout(() => { drawSpectrum(); drawHueBar(); }, 30);
      }
    });
  });

  // ── Spectrum canvas interactions ──
  const specCanvas = $('#spectrum-canvas');
  if (specCanvas) {
    specCanvas.addEventListener('pointerdown', e => { spectrumDragging = true; pickFromSpectrum(e); });
    specCanvas.addEventListener('pointermove', e => { if (spectrumDragging) pickFromSpectrum(e); });
    specCanvas.addEventListener('pointerup',   () => spectrumDragging = false);
    specCanvas.style.touchAction = 'none';
  }

  const hueCanvas = $('#hue-canvas');
  if (hueCanvas) {
    hueCanvas.addEventListener('pointerdown', e => { hueDragging = true; pickFromHueBar(e); });
    hueCanvas.addEventListener('pointermove', e => { if (hueDragging) pickFromHueBar(e); });
    hueCanvas.addEventListener('pointerup',   () => hueDragging = false);
    hueCanvas.style.touchAction = 'none';
  }

  // ── HSL sliders ──
  ['h', 's', 'l'].forEach(id => {
    const el = $('#slider-' + id);
    if (el) el.addEventListener('input', updateSlidersDisplay);
  });

  // ── Save swatch button ──
  $('#btn-save-swatch')?.addEventListener('click', saveSwatch);

  // ── Eyedropper button ──
  $('#btn-eyedropper')?.addEventListener('click', () => {
    if (_eyedropperActive) exitEyedropper();
    else enterEyedropper();
  });

  // ── Bus events for lazy-init spectrum from SheetManager ──
  bus.on('color:drawSpectrum', drawSpectrum);
  bus.on('color:drawHueBar', drawHueBar);
}
