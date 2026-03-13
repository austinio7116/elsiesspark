import state from '../state.js';
import bus from '../EventBus.js';
import { $ } from '../utils.js';
import brushes from '../brushes/index.js';
import CanvasManager from './CanvasManager.js';
import { pushUndo } from './UndoManager.js';

// ── Selection constants ──
const HANDLE_SIZE = 10;

// ── Temp canvas for soft-brush rendering (reused) ──
let _softTmpCanvas, _softTmpCtx;
function _getSoftTmpCtx(w, h) {
  if (!_softTmpCanvas) {
    _softTmpCanvas = document.createElement('canvas');
    _softTmpCtx = _softTmpCanvas.getContext('2d');
  }
  _softTmpCanvas.width = w;
  _softTmpCanvas.height = h;
  return _softTmpCtx;
}

// ── Temp canvas for per-layer rendering (reused) ──
let _layerTmpCanvas, _layerTmpCtx;
function getLayerTmpCanvas() {
  if (!_layerTmpCanvas) {
    _layerTmpCanvas = document.createElement('canvas');
    _layerTmpCtx = _layerTmpCanvas.getContext('2d');
  }
  _layerTmpCanvas.width = state.canvasWidth;
  _layerTmpCanvas.height = state.canvasHeight;
  return { canvas: _layerTmpCanvas, ctx: _layerTmpCtx };
}

// ═══════════════════════════════════════════════════════
// FONT STRING
// ═══════════════════════════════════════════════════════
function textObjFontStr(obj) {
  let s = '';
  if (obj.italic) s += 'italic ';
  if (obj.bold) s += 'bold ';
  s += obj.fontSize + 'px ';
  if (obj.font === 'cursive') s += "'Segoe Script', cursive";
  else if (obj.font === 'serif') s += "Georgia, 'Times New Roman', serif";
  else if (obj.font === 'monospace') s += "'Courier New', monospace";
  else s += "'Nunito', sans-serif";
  return s;
}

// ═══════════════════════════════════════════════════════
// OBJECT DIMENSIONS
// ═══════════════════════════════════════════════════════
function getObjectDims(obj) {
  if (obj.type === 'sticker') {
    const s = obj.size;
    if (obj.aspect >= 1) return { w: s, h: s / obj.aspect };
    return { w: s * obj.aspect, h: s };
  }
  if (obj.type === 'stroke') {
    const scale = obj.scale || 1;
    return { w: (obj.baseWidth || 10) * scale, h: (obj.baseHeight || 10) * scale };
  }
  // text — measure width
  const objectsCtx = CanvasManager.objectsCtx;
  objectsCtx.save();
  objectsCtx.font = textObjFontStr(obj);
  const tw = objectsCtx.measureText(obj.text).width;
  objectsCtx.restore();
  return { w: tw, h: obj.fontSize * 1.2 };
}

// ═══════════════════════════════════════════════════════
// DRAW OBJECT TO CANVAS
// ═══════════════════════════════════════════════════════
function drawObjectTo(ctx, obj) {
  ctx.save();
  ctx.translate(obj.x, obj.y);
  ctx.rotate(obj.rotation * Math.PI / 180);
  if (obj.scaleX && obj.scaleX !== 1) ctx.scale(obj.scaleX, 1);
  if (obj.type === 'sticker') {
    const { w, h } = getObjectDims(obj);
    ctx.drawImage(obj.img, -w / 2, -h / 2, w, h);
  } else if (obj.type === 'text') {
    ctx.font = textObjFontStr(obj);
    ctx.fillStyle = obj.color;
    ctx.globalAlpha = obj.opacity;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(obj.text, 0, 0);
  } else if (obj.type === 'stroke') {
    const scale = obj.scale || 1;
    ctx.scale(scale, scale);
    // Delegate to brush registry
    const brush = brushes[obj.brush];
    if (brush) {
      brush.render(ctx, obj);
    }
  }
  ctx.restore();
}

// ═══════════════════════════════════════════════════════
// RENDER ALL OBJECTS
// ═══════════════════════════════════════════════════════
function renderObjects() {
  const objectsCanvas = CanvasManager.objectsCanvas;
  const objectsCtx = CanvasManager.objectsCtx;
  if (!objectsCanvas) return;
  objectsCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
  state.layers.forEach(l => {
    if (!l.visible || !l.objects || l.objects.length === 0) return;
    const hasEraser = l.objects.some(o => o.brush === 'eraser');
    if (hasEraser) {
      // Render layer to temp canvas so eraser stays layer-scoped
      const tmp = getLayerTmpCanvas();
      tmp.ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
      l.objects.forEach(obj => drawObjectTo(tmp.ctx, obj));
      objectsCtx.globalAlpha = l.opacity ?? 1;
      objectsCtx.drawImage(tmp.canvas, 0, 0);
    } else {
      objectsCtx.globalAlpha = l.opacity ?? 1;
      l.objects.forEach(obj => drawObjectTo(objectsCtx, obj));
    }
  });
  objectsCtx.globalAlpha = 1;
  drawSelectionHandles();
}

// ═══════════════════════════════════════════════════════
// HIT TESTING
// ═══════════════════════════════════════════════════════
function isPointInObject(px, py, obj) {
  const dx = px - obj.x, dy = py - obj.y;
  const a = -obj.rotation * Math.PI / 180;
  const lx = dx * Math.cos(a) - dy * Math.sin(a);
  const ly = dx * Math.sin(a) + dy * Math.cos(a);
  const { w, h } = getObjectDims(obj);
  return Math.abs(lx) <= w / 2 + 8 && Math.abs(ly) <= h / 2 + 8;
}

function hitTestObject(px, py) {
  // Only test objects on the active layer
  const layer = CanvasManager.getActiveLayer();
  if (!layer || !layer.objects) return null;
  for (let i = layer.objects.length - 1; i >= 0; i--) {
    if (isPointInObject(px, py, layer.objects[i])) return layer.objects[i];
  }
  return null;
}

// ═══════════════════════════════════════════════════════
// SELECTION HANDLES
// ═══════════════════════════════════════════════════════
function getSelectionCorners(obj) {
  const { w, h } = getObjectDims(obj);
  const hw = w / 2 + 6, hh = h / 2 + 6;
  const a = obj.rotation * Math.PI / 180;
  const cos = Math.cos(a), sin = Math.sin(a);
  function rot(lx, ly) {
    return { x: obj.x + lx * cos - ly * sin, y: obj.y + lx * sin + ly * cos };
  }
  return {
    tl: rot(-hw, -hh), tr: rot(hw, -hh),
    bl: rot(-hw, hh),  br: rot(hw, hh),
    rotHandle: rot(0, -hh - 28),
  };
}

function drawSelectionHandles() {
  const obj = state.selectedObject;
  if (!obj) return;
  const c = getSelectionCorners(obj);
  const ctx = CanvasManager.previewCtx;
  ctx.save();
  // Dashed bounding box
  ctx.strokeStyle = 'rgba(232,114,92,0.8)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(c.tl.x, c.tl.y);
  ctx.lineTo(c.tr.x, c.tr.y);
  ctx.lineTo(c.br.x, c.br.y);
  ctx.lineTo(c.bl.x, c.bl.y);
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);
  // Rotation line
  const topMid = { x: (c.tl.x + c.tr.x) / 2, y: (c.tl.y + c.tr.y) / 2 };
  ctx.strokeStyle = 'rgba(232,114,92,0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(topMid.x, topMid.y);
  ctx.lineTo(c.rotHandle.x, c.rotHandle.y);
  ctx.stroke();
  // Corner handles
  [c.tl, c.tr, c.bl, c.br].forEach(p => {
    ctx.fillStyle = 'white';
    ctx.strokeStyle = '#e8725c';
    ctx.lineWidth = 2;
    ctx.fillRect(p.x - HANDLE_SIZE / 2, p.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
    ctx.strokeRect(p.x - HANDLE_SIZE / 2, p.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
  });
  // Rotation handle (circle)
  ctx.beginPath();
  ctx.arc(c.rotHandle.x, c.rotHandle.y, 7, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.strokeStyle = '#e8725c';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function hitTestHandle(px, py) {
  const obj = state.selectedObject;
  if (!obj) return null;
  const c = getSelectionCorners(obj);
  const threshold = HANDLE_SIZE + 4;
  function near(p) { return Math.abs(px - p.x) < threshold && Math.abs(py - p.y) < threshold; }
  if (near(c.rotHandle)) return 'rotate';
  if (near(c.tl)) return 'scale-tl';
  if (near(c.tr)) return 'scale-tr';
  if (near(c.bl)) return 'scale-bl';
  if (near(c.br)) return 'scale-br';
  if (isPointInObject(px, py, obj)) return 'move';
  return null;
}

// ═══════════════════════════════════════════════════════
// SELECT / DESELECT
// ═══════════════════════════════════════════════════════
function selectObjectAt(x, y) {
  const hit = hitTestObject(x, y);
  if (hit) {
    state.selectedObject = hit;
    const previewCtx = CanvasManager.previewCtx;
    previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
    drawSelectionHandles();
    bus.emit('updateSelectToolbar');
  } else {
    deselectObject();
    renderObjects();
  }
  return hit;
}

function deselectObject() {
  state.selectedObject = null;
  state.selectDrag = null;
  const previewCtx = CanvasManager.previewCtx;
  previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
  bus.emit('updateSelectToolbar');
}

// ═══════════════════════════════════════════════════════
// OBJECT MANIPULATION (delete, copy, reorder, mirror)
// ═══════════════════════════════════════════════════════
function deleteSelectedObject() {
  if (!state.selectedObject) return;
  const layer = CanvasManager.getActiveLayer();
  if (!layer) return;
  pushUndo();
  const idx = layer.objects.findIndex(o => o.id === state.selectedObject.id);
  if (idx >= 0) layer.objects.splice(idx, 1);
  state.selectedObject = null;
  const previewCtx = CanvasManager.previewCtx;
  previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
  renderObjects();
  bus.emit('updateSelectToolbar');
  bus.emit('scheduleAutosave');
}

function copySelectedObject() {
  if (!state.selectedObject) return;
  const layer = CanvasManager.getActiveLayer();
  if (!layer) return;
  pushUndo();
  const orig = state.selectedObject;
  const clone = JSON.parse(JSON.stringify(orig));
  clone.id = CanvasManager.nextObjectId();
  clone.x += 20;
  clone.y += 20;
  // Preserve non-serializable properties (e.g. img for stickers)
  if (orig.img) clone.img = orig.img;
  layer.objects.push(clone);
  state.selectedObject = clone;
  renderObjects();
  drawSelectionHandles();
}

function moveSelectedObjectUp() {
  if (!state.selectedObject) return;
  const layer = CanvasManager.getActiveLayer();
  if (!layer) return;
  const idx = layer.objects.findIndex(o => o.id === state.selectedObject.id);
  if (idx < 0 || idx >= layer.objects.length - 1) return;
  pushUndo();
  [layer.objects[idx], layer.objects[idx + 1]] = [layer.objects[idx + 1], layer.objects[idx]];
  renderObjects();
  drawSelectionHandles();
}

function moveSelectedObjectDown() {
  if (!state.selectedObject) return;
  const layer = CanvasManager.getActiveLayer();
  if (!layer) return;
  const idx = layer.objects.findIndex(o => o.id === state.selectedObject.id);
  if (idx <= 0) return;
  pushUndo();
  [layer.objects[idx], layer.objects[idx - 1]] = [layer.objects[idx - 1], layer.objects[idx]];
  renderObjects();
  drawSelectionHandles();
}

function moveSelectedObjectToFront() {
  if (!state.selectedObject) return;
  const layer = CanvasManager.getActiveLayer();
  if (!layer) return;
  const idx = layer.objects.findIndex(o => o.id === state.selectedObject.id);
  if (idx < 0 || idx >= layer.objects.length - 1) return;
  pushUndo();
  const [obj] = layer.objects.splice(idx, 1);
  layer.objects.push(obj);
  renderObjects();
  drawSelectionHandles();
}

function moveSelectedObjectToBack() {
  if (!state.selectedObject) return;
  const layer = CanvasManager.getActiveLayer();
  if (!layer) return;
  const idx = layer.objects.findIndex(o => o.id === state.selectedObject.id);
  if (idx <= 0) return;
  pushUndo();
  const [obj] = layer.objects.splice(idx, 1);
  layer.objects.unshift(obj);
  renderObjects();
  drawSelectionHandles();
}

function mirrorSelectedObject() {
  if (!state.selectedObject) return;
  pushUndo();
  const obj = state.selectedObject;
  if (obj.scaleX === undefined) obj.scaleX = 1;
  obj.scaleX *= -1;
  renderObjects();
  drawSelectionHandles();
}

// ── Listen for bus events ──
bus.on('renderObjects', renderObjects);

// ═══════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════
const ObjectRenderer = {
  drawObjectTo,
  renderObjects,
  getObjectDims,
  textObjFontStr,
  hitTestObject,
  drawSelectionHandles,
  hitTestHandle,
  selectObjectAt,
  deselectObject,
  deleteSelectedObject,
  copySelectedObject,
  moveSelectedObjectUp,
  moveSelectedObjectDown,
  moveSelectedObjectToFront,
  moveSelectedObjectToBack,
  mirrorSelectedObject,
  getLayerTmpCanvas,
  isPointInObject,
  getSelectionCorners,
};

export default ObjectRenderer;
