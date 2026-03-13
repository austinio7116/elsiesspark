import state from '../state.js';
import bus from '../EventBus.js';
import { $, $$ } from '../utils.js';
import { pushUndo } from './UndoManager.js';

// ── DOM references (resolved by init) ──
let container = null;
let traceCanvas = null;
let traceCtx = null;
let objectsCanvas = null;
let objectsCtx = null;
let previewCanvas = null;
let previewCtx = null;

// ── Counters ──
let layerIdCounter = 0;
let objectIdCounter = 0;

// ── Layer drag state ──
const _layerDrag = { active: false, layerId: null, li: null, pointerId: null, dropIndex: -1 };

// ═══════════════════════════════════════════════════════
// INIT — resolve DOM references & set up drag listeners
// ═══════════════════════════════════════════════════════
function init() {
  container     = $('#canvas-container');
  traceCanvas   = $('#trace-canvas');
  traceCtx      = traceCanvas.getContext('2d');
  objectsCanvas = $('#objects-canvas');
  objectsCtx    = objectsCanvas.getContext('2d');
  previewCanvas = $('#preview-canvas');
  previewCtx    = previewCanvas.getContext('2d');

  // Document-level listeners for layer drag (works on both desktop and mobile)
  document.addEventListener('pointermove', e => {
    if (!_layerDrag.active) return;
    e.preventDefault();
    const list = $('#layer-list');
    if (!list) return;
    const items = Array.from(list.querySelectorAll('.layer-item'));
    const slot = _layerDragFindSlot(items, e.clientY);
    _layerDrag.dropIndex = slot;
    _layerDragShowIndicator(list, items, slot);
  });
  document.addEventListener('pointerup', e => {
    if (!_layerDrag.active) return;
    _layerDrag.active = false;
    if (_layerDrag.li) _layerDrag.li.classList.remove('dragging');
    _layerDragClearIndicator();
    const list = $('#layer-list');
    if (!list) { _layerDrag.li = null; return; }
    const items = Array.from(list.querySelectorAll('.layer-item'));
    const slot = _layerDragFindSlot(items, e.clientY);
    // Convert visual slot to layers array index.
    // Visual list is reversed: visual index 0 = layers[layers.length-1]
    // Visual slot i means "insert so it becomes visual position i"
    // which is layers array index (layers.length - slot)
    const dragIdx = state.layers.findIndex(l => l.id === _layerDrag.layerId);
    if (dragIdx === -1) { _layerDrag.li = null; return; }
    let targetIdx = state.layers.length - slot;
    // Adjust for removal offset
    if (dragIdx < targetIdx) targetIdx--;
    if (targetIdx < 0) targetIdx = 0;
    if (targetIdx >= state.layers.length) targetIdx = state.layers.length - 1;
    if (dragIdx !== targetIdx) {
      reorderLayer(dragIdx, targetIdx);
    }
    _layerDrag.li = null;
  });
  document.addEventListener('pointercancel', () => {
    if (!_layerDrag.active) return;
    _layerDrag.active = false;
    if (_layerDrag.li) _layerDrag.li.classList.remove('dragging');
    _layerDragClearIndicator();
    _layerDrag.li = null;
  });
}

// ═══════════════════════════════════════════════════════
// CANVAS SETUP & ZOOM
// ═══════════════════════════════════════════════════════
function setupCanvas() {
  const area = $('#canvas-area');
  const pad = 10;
  const w = Math.floor((area ? area.clientWidth  : 390) - pad);
  const h = Math.floor((area ? area.clientHeight : 600) - pad);
  state.canvasWidth  = w;
  state.canvasHeight = h;
  traceCanvas.width   = w;
  traceCanvas.height  = h;
  objectsCanvas.width = w;
  objectsCanvas.height = h;
  previewCanvas.width = w;
  previewCanvas.height = h;
  bus.emit('applyBackground', state.selectedBackground);
}

function fitZoom() {
  state.zoom = 1;
  state.panX = 0;
  state.panY = 0;
  state.fitZoomLevel = 1;
  applyZoom();
}

function applyZoom() {
  if (!container) return;
  const area = $('#canvas-area');
  const areaW = area.clientWidth;
  const areaH = area.clientHeight;
  // Container is native canvas size; transform handles zoom + pan
  container.style.width  = state.canvasWidth + 'px';
  container.style.height = state.canvasHeight + 'px';
  [traceCanvas, objectsCanvas, previewCanvas, ...state.layers.map(l => l.canvas)]
    .filter(Boolean)
    .forEach(c => { c.style.width = state.canvasWidth + 'px'; c.style.height = state.canvasHeight + 'px'; });
  // Center in area, then apply pan offset
  const tx = (areaW - state.canvasWidth * state.zoom) / 2 + state.panX;
  const ty = (areaH - state.canvasHeight * state.zoom) / 2 + state.panY;
  container.style.transformOrigin = '0 0';
  container.style.transform = `translate(${tx}px, ${ty}px) scale(${state.zoom})`;
  const resetBtn = $('#btn-zoom-reset');
  if (resetBtn) {
    const atFit = Math.abs(state.zoom - (state.fitZoomLevel || state.zoom)) < 0.005
               && Math.abs(state.panX) < 1 && Math.abs(state.panY) < 1;
    resetBtn.classList.toggle('hidden', atFit);
  }
}

// ═══════════════════════════════════════════════════════
// LAYER SYSTEM
// ═══════════════════════════════════════════════════════
function addLayer(name) {
  const id = ++layerIdCounter;
  const canvas = document.createElement('canvas');
  canvas.width  = state.canvasWidth;
  canvas.height = state.canvasHeight;
  canvas.className = 'drawing-canvas';
  canvas.style.zIndex = id;
  container.insertBefore(canvas, previewCanvas);
  const ctx = canvas.getContext('2d');
  const layer = { id, name: name || `Layer ${id}`, canvas, ctx, visible: true, opacity: 1, objects: [] };
  state.layers.push(layer);
  state.activeLayerId = id;
  renderLayerList();
  return layer;
}

function removeLayer(id) {
  if (state.layers.length <= 1) return;
  const idx = state.layers.findIndex(l => l.id === id);
  if (idx === -1) return;
  state.layers[idx].canvas.remove();
  state.layers.splice(idx, 1);
  if (state.activeLayerId === id) {
    state.activeLayerId = state.layers[Math.min(idx, state.layers.length - 1)].id;
  }
  renderLayerList();
  pushUndo();
}

function getActiveLayer() {
  return state.layers.find(l => l.id === state.activeLayerId);
}

// ── Layer drag helpers ──
function _layerDragFindSlot(items, y) {
  for (let i = 0; i < items.length; i++) {
    const rect = items[i].getBoundingClientRect();
    const mid = rect.top + rect.height / 2;
    if (y < mid) return i;
  }
  return items.length;
}

function _layerDragClearIndicator() {
  const list = $('#layer-list');
  if (!list) return;
  const old = list.querySelector('.layer-drop-indicator');
  if (old) old.remove();
}

function _layerDragShowIndicator(list, items, slot) {
  _layerDragClearIndicator();
  const indicator = document.createElement('div');
  indicator.className = 'layer-drop-indicator';
  if (slot < items.length) {
    list.insertBefore(indicator, items[slot]);
  } else {
    list.appendChild(indicator);
  }
}

function renderLayerList() {
  const list = $('#layer-list');
  if (!list) return;
  list.innerHTML = '';
  for (let i = state.layers.length - 1; i >= 0; i--) {
    const l = state.layers[i];
    const pct = Math.round((l.opacity ?? 1) * 100);
    const li = document.createElement('li');
    li.className = 'layer-item' + (l.id === state.activeLayerId ? ' active' : '');
    li.dataset.layerId = l.id;
    li.innerHTML = `
      <div class="layer-row">
        <span class="layer-drag-handle">&#x2630;</span>
        <input type="checkbox" class="layer-visibility" ${l.visible ? 'checked' : ''}>
        <span class="layer-name">${l.name}</span>
        <button class="layer-delete">&times;</button>
      </div>
      <div class="layer-opacity-row">
        <label class="layer-opacity-label">Opacity</label>
        <input type="range" class="layer-opacity-slider" min="0" max="100" value="${pct}">
        <span class="layer-opacity-val">${pct}%</span>
      </div>
    `;
    li.querySelector('.layer-name').addEventListener('click', () => {
      state.activeLayerId = l.id;
      renderLayerList();
    });
    li.querySelector('.layer-visibility').addEventListener('change', e => {
      l.visible = e.target.checked;
      l.canvas.style.display = l.visible ? '' : 'none';
      bus.emit('renderObjects');
    });
    li.querySelector('.layer-delete').addEventListener('click', () => removeLayer(l.id));
    li.querySelector('.layer-opacity-slider').addEventListener('input', e => {
      l.opacity = parseInt(e.target.value) / 100;
      l.canvas.style.opacity = l.opacity;
      li.querySelector('.layer-opacity-val').textContent = e.target.value + '%';
      bus.emit('renderObjects');
    });

    // Drag handle: only starts drag via shared layer-list listeners
    const handle = li.querySelector('.layer-drag-handle');
    handle.addEventListener('pointerdown', e => {
      e.preventDefault();
      e.stopPropagation();
      _layerDrag.active = true;
      _layerDrag.layerId = l.id;
      _layerDrag.li = li;
      _layerDrag.pointerId = e.pointerId;
      li.classList.add('dragging');
    });

    list.appendChild(li);
  }
}

function reorderLayer(fromIdx, toIdx) {
  if (fromIdx === toIdx) return;
  pushUndo();
  const [layer] = state.layers.splice(fromIdx, 1);
  state.layers.splice(toIdx, 0, layer);

  // Update z-indices to match new order
  state.layers.forEach((l, i) => {
    l.canvas.style.zIndex = i + 1;
  });

  renderLayerList();
  bus.emit('renderObjects');
  bus.emit('scheduleAutosave');
}

// ── Canvas position helper ──
function getCanvasPos(e) {
  const rect = previewCanvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (state.canvasWidth  / rect.width),
    y: (e.clientY - rect.top)  * (state.canvasHeight / rect.height),
  };
}

// ── Counter accessors ──
function nextLayerId() {
  return ++layerIdCounter;
}

function nextObjectId() {
  return ++objectIdCounter;
}

function getObjectIdCounter() {
  return objectIdCounter;
}

function setObjectIdCounter(val) {
  objectIdCounter = val;
}

function getLayerIdCounter() {
  return layerIdCounter;
}

function setLayerIdCounter(val) {
  layerIdCounter = val;
}

// ── Listen for bus events ──
bus.on('renderLayerList', renderLayerList);

// ═══════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════
const CanvasManager = {
  init,
  setupCanvas,
  fitZoom,
  applyZoom,
  addLayer,
  removeLayer,
  getActiveLayer,
  renderLayerList,
  reorderLayer,
  getCanvasPos,
  nextLayerId,
  nextObjectId,
  getObjectIdCounter,
  setObjectIdCounter,
  getLayerIdCounter,
  setLayerIdCounter,
  // Getters for DOM references (resolved after init)
  get container()     { return container; },
  get traceCanvas()   { return traceCanvas; },
  get traceCtx()      { return traceCtx; },
  get objectsCanvas() { return objectsCanvas; },
  get objectsCtx()    { return objectsCtx; },
  get previewCanvas() { return previewCanvas; },
  get previewCtx()    { return previewCtx; },
};

export default CanvasManager;
