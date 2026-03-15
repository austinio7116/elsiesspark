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

// ── Temp canvas for eraser compositing (reused) ──
let _eraserTmpCanvas, _eraserTmpCtx;
function _getEraserTmpCtx(w, h) {
  if (!_eraserTmpCanvas) {
    _eraserTmpCanvas = document.createElement('canvas');
    _eraserTmpCtx = _eraserTmpCanvas.getContext('2d');
  }
  _eraserTmpCanvas.width = w;
  _eraserTmpCanvas.height = h;
  return _eraserTmpCtx;
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

// ── Per-layer render cache ──
// Each layer gets a cached canvas. We track a revision counter per layer;
// when objects change, bump the revision and the cache is invalidated.
const _layerCaches = new Map(); // layerId -> { rev, canvas, ctx }

function _getLayerCache(layerId) {
  let entry = _layerCaches.get(layerId);
  if (!entry) {
    const canvas = document.createElement('canvas');
    canvas.width = state.canvasWidth;
    canvas.height = state.canvasHeight;
    entry = { rev: -1, canvas, ctx: canvas.getContext('2d') };
    _layerCaches.set(layerId, entry);
  }
  if (entry.canvas.width !== state.canvasWidth || entry.canvas.height !== state.canvasHeight) {
    entry.canvas.width = state.canvasWidth;
    entry.canvas.height = state.canvasHeight;
    entry.rev = -1; // force re-render on resize
  }
  return entry;
}

function invalidateLayerCache(layerId) {
  const entry = _layerCaches.get(layerId);
  if (entry) entry.rev = -1;
}

function invalidateAllLayerCaches() {
  for (const entry of _layerCaches.values()) entry.rev = -1;
}

// ── Temp canvas for pixel-level hit testing ──
let _hitCanvas, _hitCtx;
function _getHitCtx() {
  if (!_hitCanvas) {
    _hitCanvas = document.createElement('canvas');
    _hitCtx = _hitCanvas.getContext('2d', { willReadFrequently: true });
  }
  return { canvas: _hitCanvas, ctx: _hitCtx };
}

// ── Drag cache: layer rendered WITHOUT the dragged object ──
// Built once at drag start, reused every frame during drag.
let _dragCache = null; // { layerId, objectId, excludeIds, canvas, ctx }

function beginDragCache(layer, draggedObj) {
  if (!layer || !draggedObj) return;
  if (!_dragCache) {
    const c = document.createElement('canvas');
    _dragCache = { layerId: null, objectId: null, excludeIds: null, canvas: c, ctx: c.getContext('2d') };
  }
  _dragCache.canvas.width = state.canvasWidth;
  _dragCache.canvas.height = state.canvasHeight;
  _dragCache.layerId = layer.id;
  _dragCache.objectId = draggedObj.id;
  _dragCache.excludeIds = null;
  // Render every object on the layer EXCEPT the dragged one
  _dragCache.ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
  layer.objects.forEach(obj => {
    if (obj.id !== draggedObj.id) drawObjectTo(_dragCache.ctx, obj);
  });
}

function beginMultiDragCache(layer, excludeObjects) {
  if (!layer || !excludeObjects || excludeObjects.length === 0) return;
  if (!_dragCache) {
    const c = document.createElement('canvas');
    _dragCache = { layerId: null, objectId: null, excludeIds: null, canvas: c, ctx: c.getContext('2d') };
  }
  _dragCache.canvas.width = state.canvasWidth;
  _dragCache.canvas.height = state.canvasHeight;
  _dragCache.layerId = layer.id;
  _dragCache.objectId = null;
  const ids = new Set(excludeObjects.map(o => o.id));
  _dragCache.excludeIds = ids;
  _dragCache.ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
  layer.objects.forEach(obj => {
    if (!ids.has(obj.id)) drawObjectTo(_dragCache.ctx, obj);
  });
}

function endDragCache() {
  if (_dragCache) {
    _dragCache.layerId = null;
    _dragCache.objectId = null;
    _dragCache.excludeIds = null;
  }
}

// ── Mark a layer's object cache as dirty ──
function markLayerDirty(layer) {
  if (!layer) return;
  layer._objectRev = (layer._objectRev || 0) + 1;
}

// ── Incrementally add a single new object to the layer cache ──
// Avoids re-rendering all existing objects on the layer.
function appendToLayerCache(layer, obj) {
  if (!layer) return;
  const cache = _getLayerCache(layer.id);
  const rev = layer._objectRev || 0;
  if (cache.rev !== rev) {
    // Cache already stale — fall back to full re-render
    markLayerDirty(layer);
    return;
  }
  // Draw just the new object onto the existing cached canvas
  drawObjectTo(cache.ctx, obj);
  // Keep cache and layer revision in sync (no full re-render needed)
  layer._objectRev = rev + 1;
  cache.rev = layer._objectRev;
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
  if (obj.type === 'group') {
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
function _drawObjectDirect(ctx, obj) {
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

function drawObjectTo(ctx, obj) {
  // Groups: compute absolute transforms for each child and draw independently
  if (obj.type === 'group') {
    _drawGroupAbsolute(ctx, obj);
    return;
  }
  if (obj.eraserPaths && obj.eraserPaths.length > 0) {
    // Render to temp canvas, apply erase paths, then composite
    const w = state.canvasWidth, h = state.canvasHeight;
    const tmpCtx = _getEraserTmpCtx(w, h);
    tmpCtx.clearRect(0, 0, w, h);
    _drawObjectDirect(tmpCtx, obj);
    // Apply erase paths with destination-out
    tmpCtx.save();
    tmpCtx.globalCompositeOperation = 'destination-out';
    tmpCtx.globalAlpha = 1;
    tmpCtx.translate(obj.x, obj.y);
    tmpCtx.rotate(obj.rotation * Math.PI / 180);
    if (obj.scaleX && obj.scaleX !== 1) tmpCtx.scale(obj.scaleX, 1);
    const scale = obj.type === 'stroke' ? (obj.scale || 1) : 1;
    tmpCtx.scale(scale, scale);
    for (const ep of obj.eraserPaths) {
      tmpCtx.lineCap = 'round';
      tmpCtx.lineJoin = 'round';
      tmpCtx.lineWidth = ep.brushSize / scale;
      tmpCtx.strokeStyle = '#000';
      tmpCtx.beginPath();
      const pts = ep.points;
      tmpCtx.moveTo(pts[0].x, pts[0].y);
      if (pts.length === 1) {
        tmpCtx.lineTo(pts[0].x, pts[0].y);
      } else {
        for (let i = 1; i < pts.length - 1; i++) {
          const mx = (pts[i].x + pts[i + 1].x) / 2;
          const my = (pts[i].y + pts[i + 1].y) / 2;
          tmpCtx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
        }
        tmpCtx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      }
      tmpCtx.stroke();
    }
    tmpCtx.restore();
    // Composite result to target
    ctx.drawImage(_eraserTmpCanvas, 0, 0);
  } else {
    _drawObjectDirect(ctx, obj);
  }
}

// Draw a group by computing absolute-space transforms for each child.
// This avoids nested canvas transforms and works correctly with eraser paths
// and soft brushes that render to temp canvases.
function _drawGroupAbsolute(ctx, group) {
  if (!group.children || group.children.length === 0) return;
  const groupRot = (group.rotation || 0) * Math.PI / 180;
  const groupScale = group.scale || 1;
  const cos = Math.cos(groupRot), sin = Math.sin(groupRot);
  const gsx = group.scaleX || 1;

  for (const child of group.children) {
    // Compute child's absolute position in canvas space
    const rx = child.x * groupScale * gsx;
    const ry = child.y * groupScale;
    const absX = group.x + rx * cos - ry * sin;
    const absY = group.y + rx * sin + ry * cos;
    const absRotation = (child.rotation || 0) + (group.rotation || 0);

    // Build a full copy of the child with absolute transforms
    const absChild = { ...child };
    absChild.x = absX;
    absChild.y = absY;
    absChild.rotation = absRotation;

    // Scale depends on object type
    if (child.type === 'sticker') {
      absChild.size = child.size * groupScale;
    } else if (child.type === 'text') {
      absChild.fontSize = Math.round(child.fontSize * groupScale);
    } else if (child.type === 'stroke') {
      absChild.scale = (child.scale || 1) * groupScale;
    }

    // Mirror
    if (gsx !== 1) {
      absChild.scaleX = (child.scaleX || 1) * gsx;
    }

    // Draw the child as a normal standalone object
    drawObjectTo(ctx, absChild);
  }
}

// ═══════════════════════════════════════════════════════
// RENDER ALL OBJECTS
// ═══════════════════════════════════════════════════════
function renderObjects() {
  const objectsCanvas = CanvasManager.objectsCanvas;
  const objectsCtx = CanvasManager.objectsCtx;
  if (!objectsCanvas) return;
  objectsCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
  const dragging = _dragCache && _dragCache.layerId !== null;
  state.layers.forEach(l => {
    if (!l.visible || !l.objects || l.objects.length === 0) return;
    // Fast path: if we're dragging objects on this layer, use the
    // pre-built drag cache and only re-draw dragged objects on top.
    if (dragging && l.id === _dragCache.layerId) {
      objectsCtx.globalAlpha = l.opacity ?? 1;
      objectsCtx.drawImage(_dragCache.canvas, 0, 0);
      if (_dragCache.excludeIds) {
        // Multi-drag: re-draw all excluded objects
        l.objects.forEach(o => {
          if (_dragCache.excludeIds.has(o.id)) drawObjectTo(objectsCtx, o);
        });
      } else if (_dragCache.objectId) {
        const draggedObj = l.objects.find(o => o.id === _dragCache.objectId);
        if (draggedObj) drawObjectTo(objectsCtx, draggedObj);
      }
      return;
    }
    // Use per-layer cache: only re-render if revision changed
    const rev = l._objectRev || 0;
    const cache = _getLayerCache(l.id);
    if (cache.rev !== rev) {
      cache.ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
      l.objects.forEach(obj => drawObjectTo(cache.ctx, obj));
      cache.rev = rev;
    }
    objectsCtx.globalAlpha = l.opacity ?? 1;
    objectsCtx.drawImage(cache.canvas, 0, 0);
  });
  objectsCtx.globalAlpha = 1;
  if (state.selectedObjects.length > 0) {
    drawMultiSelectionHandles();
  } else {
    drawSelectionHandles();
  }
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

function hitTestPixel(px, py, obj) {
  // Render the object to an offscreen canvas and check the pixel alpha
  const { canvas, ctx } = _getHitCtx();
  if (canvas.width !== state.canvasWidth || canvas.height !== state.canvasHeight) {
    canvas.width = state.canvasWidth;
    canvas.height = state.canvasHeight;
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  drawObjectTo(ctx, obj);
  // Sample a small area around the click point for tolerance
  const radius = 3;
  const x0 = Math.max(0, Math.floor(px - radius));
  const y0 = Math.max(0, Math.floor(py - radius));
  const x1 = Math.min(canvas.width, Math.ceil(px + radius + 1));
  const y1 = Math.min(canvas.height, Math.ceil(py + radius + 1));
  const w = x1 - x0, h = y1 - y0;
  if (w <= 0 || h <= 0) return false;
  const data = ctx.getImageData(x0, y0, w, h).data;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] > 0) return true;
  }
  return false;
}

function hitTestObject(px, py) {
  // Only test objects on the active layer
  const layer = CanvasManager.getActiveLayer();
  if (!layer || !layer.objects) return null;
  for (let i = layer.objects.length - 1; i >= 0; i--) {
    const obj = layer.objects[i];
    // Quick bounding-box pre-check, then pixel-level verification
    if (isPointInObject(px, py, obj) && hitTestPixel(px, py, obj)) return obj;
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
  state.selectedObjects = [];
  state.selectDrag = null;
  const previewCtx = CanvasManager.previewCtx;
  previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
  bus.emit('updateSelectToolbar');
}

// ═══════════════════════════════════════════════════════
// MULTI-SELECTION (box select)
// ═══════════════════════════════════════════════════════

// Test if an object has any non-transparent pixels inside a rectangle
function objectHasPixelsInRect(obj, rect) {
  const { canvas, ctx } = _getHitCtx();
  if (canvas.width !== state.canvasWidth || canvas.height !== state.canvasHeight) {
    canvas.width = state.canvasWidth;
    canvas.height = state.canvasHeight;
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  drawObjectTo(ctx, obj);
  const x0 = Math.max(0, Math.floor(rect.x));
  const y0 = Math.max(0, Math.floor(rect.y));
  const x1 = Math.min(canvas.width, Math.ceil(rect.x + rect.w));
  const y1 = Math.min(canvas.height, Math.ceil(rect.y + rect.h));
  const rw = x1 - x0, rh = y1 - y0;
  if (rw <= 0 || rh <= 0) return false;
  // Sample pixels — for large rects, stride to avoid scanning millions of pixels
  const data = ctx.getImageData(x0, y0, rw, rh).data;
  const totalPixels = rw * rh;
  const stride = totalPixels > 50000 ? Math.ceil(totalPixels / 50000) : 1;
  for (let i = 3; i < data.length; i += 4 * stride) {
    if (data[i] > 0) return true;
  }
  return false;
}

// Find all objects on the active layer with pixel data inside the given rect
function boxSelectObjects(rect) {
  const layer = CanvasManager.getActiveLayer();
  if (!layer || !layer.objects) return [];
  const matches = [];
  for (const obj of layer.objects) {
    if (objectHasPixelsInRect(obj, rect)) {
      matches.push(obj);
    }
  }
  return matches;
}

// Compute axis-aligned bounding box for a set of objects (in canvas coords)
function getMultiSelectionBounds(objects) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const obj of objects) {
    const { w, h } = getObjectDims(obj);
    const hw = w / 2, hh = h / 2;
    const a = (obj.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(a), sin = Math.sin(a);
    // Four corners of the object's bounding box
    for (const [lx, ly] of [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]]) {
      const rx = obj.x + lx * cos - ly * sin;
      const ry = obj.y + lx * sin + ly * cos;
      if (rx < minX) minX = rx;
      if (rx > maxX) maxX = rx;
      if (ry < minY) minY = ry;
      if (ry > maxY) maxY = ry;
    }
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY,
           cx: (minX + maxX) / 2, cy: (minY + maxY) / 2 };
}

function getMultiSelectionCorners(objects) {
  const b = getMultiSelectionBounds(objects);
  const hw = b.w / 2 + 6, hh = b.h / 2 + 6;
  return {
    tl: { x: b.cx - hw, y: b.cy - hh },
    tr: { x: b.cx + hw, y: b.cy - hh },
    bl: { x: b.cx - hw, y: b.cy + hh },
    br: { x: b.cx + hw, y: b.cy + hh },
    rotHandle: { x: b.cx, y: b.cy - hh - 28 },
    cx: b.cx, cy: b.cy,
  };
}

function drawMultiSelectionHandles() {
  if (state.selectedObjects.length === 0) return;
  const c = getMultiSelectionCorners(state.selectedObjects);
  const ctx = CanvasManager.previewCtx;
  ctx.save();
  // Dashed bounding box
  ctx.strokeStyle = 'rgba(92,140,232,0.8)';
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
  ctx.strokeStyle = 'rgba(92,140,232,0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(topMid.x, topMid.y);
  ctx.lineTo(c.rotHandle.x, c.rotHandle.y);
  ctx.stroke();
  // Corner handles
  [c.tl, c.tr, c.bl, c.br].forEach(p => {
    ctx.fillStyle = 'white';
    ctx.strokeStyle = '#5c8ce8';
    ctx.lineWidth = 2;
    ctx.fillRect(p.x - HANDLE_SIZE / 2, p.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
    ctx.strokeRect(p.x - HANDLE_SIZE / 2, p.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
  });
  // Rotation handle (circle)
  ctx.beginPath();
  ctx.arc(c.rotHandle.x, c.rotHandle.y, 7, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.strokeStyle = '#5c8ce8';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Object count label
  ctx.fillStyle = '#5c8ce8';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${state.selectedObjects.length} selected`, c.cx, c.br.y + 16);
  ctx.restore();
}

function hitTestMultiHandle(px, py) {
  if (state.selectedObjects.length === 0) return null;
  const c = getMultiSelectionCorners(state.selectedObjects);
  const threshold = HANDLE_SIZE + 4;
  function near(p) { return Math.abs(px - p.x) < threshold && Math.abs(py - p.y) < threshold; }
  if (near(c.rotHandle)) return 'rotate';
  if (near(c.tl)) return 'scale-tl';
  if (near(c.tr)) return 'scale-tr';
  if (near(c.bl)) return 'scale-bl';
  if (near(c.br)) return 'scale-br';
  // Check if inside the bounding box for move
  const b = getMultiSelectionBounds(state.selectedObjects);
  if (px >= b.x - 8 && px <= b.x + b.w + 8 && py >= b.y - 8 && py <= b.y + b.h + 8) return 'move';
  return null;
}

// Draw the selection box (marquee) while dragging
function drawSelectBox() {
  if (!state.selectBox) return;
  const ctx = CanvasManager.previewCtx;
  const b = state.selectBox;
  const x = Math.min(b.startX, b.endX);
  const y = Math.min(b.startY, b.endY);
  const w = Math.abs(b.endX - b.startX);
  const h = Math.abs(b.endY - b.startY);
  ctx.save();
  ctx.fillStyle = 'rgba(92,140,232,0.1)';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = 'rgba(92,140,232,0.7)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 3]);
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);
  ctx.restore();
}

// ═══════════════════════════════════════════════════════
// GROUP OBJECTS (permanent grouping)
// ═══════════════════════════════════════════════════════
function groupSelectedObjects() {
  // Ungroup: if a single group is selected, explode it back into individual objects
  if (state.selectedObject && state.selectedObject.type === 'group') {
    ungroupSelectedObject();
    return;
  }
  if (state.selectedObjects.length < 2) return;
  const layer = CanvasManager.getActiveLayer();
  if (!layer) return;
  pushUndo();
  const objects = state.selectedObjects;
  // Compute group center
  const bounds = getMultiSelectionBounds(objects);
  const cx = bounds.cx, cy = bounds.cy;
  // Build children with positions relative to group center
  const children = objects.map(obj => {
    const child = JSON.parse(JSON.stringify(obj));
    // Preserve non-serializable properties
    if (obj.img) child.img = obj.img;
    child.x = obj.x - cx;
    child.y = obj.y - cy;
    return child;
  });
  // Compute baseWidth/baseHeight for the group
  const baseWidth = bounds.w;
  const baseHeight = bounds.h;
  // Remove original objects from layer
  const ids = new Set(objects.map(o => o.id));
  layer.objects = layer.objects.filter(o => !ids.has(o.id));
  // Create group object
  const groupObj = {
    id: CanvasManager.nextObjectId(),
    type: 'group',
    x: cx, y: cy,
    rotation: 0,
    scale: 1,
    scaleX: 1,
    children: children,
    baseWidth: baseWidth,
    baseHeight: baseHeight,
  };
  layer.objects.push(groupObj);
  markLayerDirty(layer);
  // Select the new group
  state.selectedObjects = [];
  state.selectedObject = groupObj;
  const previewCtx = CanvasManager.previewCtx;
  previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
  renderObjects();
  bus.emit('updateSelectToolbar');
  bus.emit('scheduleAutosave');
}

function ungroupSelectedObject() {
  const group = state.selectedObject;
  if (!group || group.type !== 'group') return;
  const layer = CanvasManager.getActiveLayer();
  if (!layer) return;
  pushUndo();
  const groupRot = (group.rotation || 0) * Math.PI / 180;
  const groupScale = group.scale || 1;
  const cos = Math.cos(groupRot), sin = Math.sin(groupRot);
  const gsx = group.scaleX || 1;
  // Convert children back to absolute positions
  const restored = group.children.map(child => {
    const obj = { ...child };
    // Compute absolute position
    const rx = child.x * groupScale * gsx;
    const ry = child.y * groupScale;
    obj.x = group.x + rx * cos - ry * sin;
    obj.y = group.y + rx * sin + ry * cos;
    obj.rotation = (child.rotation || 0) + (group.rotation || 0);
    // Apply group scale to child size
    if (child.type === 'sticker') {
      obj.size = child.size * groupScale;
    } else if (child.type === 'text') {
      obj.fontSize = Math.round(child.fontSize * groupScale);
    } else if (child.type === 'stroke') {
      obj.scale = (child.scale || 1) * groupScale;
    }
    if (gsx !== 1) {
      obj.scaleX = (child.scaleX || 1) * gsx;
    }
    obj.id = CanvasManager.nextObjectId();
    return obj;
  });
  // Replace group with restored children at same position in layer
  const idx = layer.objects.findIndex(o => o.id === group.id);
  if (idx >= 0) {
    layer.objects.splice(idx, 1, ...restored);
  }
  markLayerDirty(layer);
  state.selectedObject = null;
  state.selectedObjects = restored;
  const previewCtx = CanvasManager.previewCtx;
  previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
  renderObjects();
  bus.emit('updateSelectToolbar');
  bus.emit('scheduleAutosave');
}

// ═══════════════════════════════════════════════════════
// OBJECT MANIPULATION (delete, copy, reorder, mirror)
// ═══════════════════════════════════════════════════════
function deleteSelectedObject() {
  const layer = CanvasManager.getActiveLayer();
  if (!layer) return;
  // Multi-selection delete
  if (state.selectedObjects.length > 0) {
    pushUndo();
    const ids = new Set(state.selectedObjects.map(o => o.id));
    layer.objects = layer.objects.filter(o => !ids.has(o.id));
    markLayerDirty(layer);
    state.selectedObjects = [];
    const previewCtx = CanvasManager.previewCtx;
    previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
    renderObjects();
    bus.emit('updateSelectToolbar');
    bus.emit('scheduleAutosave');
    return;
  }
  if (!state.selectedObject) return;
  pushUndo();
  const idx = layer.objects.findIndex(o => o.id === state.selectedObject.id);
  if (idx >= 0) layer.objects.splice(idx, 1);
  markLayerDirty(layer);
  state.selectedObject = null;
  const previewCtx = CanvasManager.previewCtx;
  previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
  renderObjects();
  bus.emit('updateSelectToolbar');
  bus.emit('scheduleAutosave');
}

// ── Helper: clone a single object, preserving img refs ──
function _cloneObject(orig) {
  const clone = JSON.parse(JSON.stringify(orig));
  clone.id = CanvasManager.nextObjectId();
  if (orig.img) clone.img = orig.img;
  if (orig.type === 'group' && orig.children) {
    for (let i = 0; i < orig.children.length; i++) {
      if (orig.children[i].img) clone.children[i].img = orig.children[i].img;
    }
  }
  return clone;
}

function copySelectedObject() {
  const layer = CanvasManager.getActiveLayer();
  if (!layer) return;
  // Multi-selection copy
  if (state.selectedObjects.length > 0) {
    pushUndo();
    const clones = [];
    for (const orig of state.selectedObjects) {
      const clone = _cloneObject(orig);
      clone.x += 20;
      clone.y += 20;
      layer.objects.push(clone);
      clones.push(clone);
    }
    markLayerDirty(layer);
    state.selectedObjects = clones;
    renderObjects();
    bus.emit('updateSelectToolbar');
    return;
  }
  if (!state.selectedObject) return;
  pushUndo();
  const clone = _cloneObject(state.selectedObject);
  clone.x += 20;
  clone.y += 20;
  layer.objects.push(clone);
  markLayerDirty(layer);
  state.selectedObject = clone;
  renderObjects();
  drawSelectionHandles();
}

function moveSelectedObjectUp() {
  const layer = CanvasManager.getActiveLayer();
  if (!layer) return;
  if (state.selectedObjects.length > 0) {
    pushUndo();
    _moveMultiInLayer(layer, state.selectedObjects, 1);
    return;
  }
  if (!state.selectedObject) return;
  const idx = layer.objects.findIndex(o => o.id === state.selectedObject.id);
  if (idx < 0 || idx >= layer.objects.length - 1) return;
  pushUndo();
  [layer.objects[idx], layer.objects[idx + 1]] = [layer.objects[idx + 1], layer.objects[idx]];
  markLayerDirty(layer);
  renderObjects();
  drawSelectionHandles();
}

function moveSelectedObjectDown() {
  const layer = CanvasManager.getActiveLayer();
  if (!layer) return;
  if (state.selectedObjects.length > 0) {
    pushUndo();
    _moveMultiInLayer(layer, state.selectedObjects, -1);
    return;
  }
  if (!state.selectedObject) return;
  const idx = layer.objects.findIndex(o => o.id === state.selectedObject.id);
  if (idx <= 0) return;
  pushUndo();
  [layer.objects[idx], layer.objects[idx - 1]] = [layer.objects[idx - 1], layer.objects[idx]];
  markLayerDirty(layer);
  renderObjects();
  drawSelectionHandles();
}

// Move multiple selected objects up (+1) or down (-1) in the layer stack
function _moveMultiInLayer(layer, objects, direction) {
  const ids = new Set(objects.map(o => o.id));
  if (direction > 0) {
    // Move up: iterate backwards so we don't skip
    for (let i = layer.objects.length - 2; i >= 0; i--) {
      if (ids.has(layer.objects[i].id) && !ids.has(layer.objects[i + 1].id)) {
        [layer.objects[i], layer.objects[i + 1]] = [layer.objects[i + 1], layer.objects[i]];
      }
    }
  } else {
    // Move down: iterate forwards
    for (let i = 1; i < layer.objects.length; i++) {
      if (ids.has(layer.objects[i].id) && !ids.has(layer.objects[i - 1].id)) {
        [layer.objects[i], layer.objects[i - 1]] = [layer.objects[i - 1], layer.objects[i]];
      }
    }
  }
  markLayerDirty(layer);
  renderObjects();
}

function moveSelectedObjectToFront() {
  const layer = CanvasManager.getActiveLayer();
  if (!layer) return;
  if (state.selectedObjects.length > 0) {
    pushUndo();
    const ids = new Set(state.selectedObjects.map(o => o.id));
    const selected = layer.objects.filter(o => ids.has(o.id));
    const rest = layer.objects.filter(o => !ids.has(o.id));
    layer.objects = rest.concat(selected);
    markLayerDirty(layer);
    renderObjects();
    return;
  }
  if (!state.selectedObject) return;
  const idx = layer.objects.findIndex(o => o.id === state.selectedObject.id);
  if (idx < 0 || idx >= layer.objects.length - 1) return;
  pushUndo();
  const [obj] = layer.objects.splice(idx, 1);
  layer.objects.push(obj);
  markLayerDirty(layer);
  renderObjects();
  drawSelectionHandles();
}

function moveSelectedObjectToBack() {
  const layer = CanvasManager.getActiveLayer();
  if (!layer) return;
  if (state.selectedObjects.length > 0) {
    pushUndo();
    const ids = new Set(state.selectedObjects.map(o => o.id));
    const selected = layer.objects.filter(o => ids.has(o.id));
    const rest = layer.objects.filter(o => !ids.has(o.id));
    layer.objects = selected.concat(rest);
    markLayerDirty(layer);
    renderObjects();
    return;
  }
  if (!state.selectedObject) return;
  const idx = layer.objects.findIndex(o => o.id === state.selectedObject.id);
  if (idx <= 0) return;
  pushUndo();
  const [obj] = layer.objects.splice(idx, 1);
  layer.objects.unshift(obj);
  markLayerDirty(layer);
  renderObjects();
  drawSelectionHandles();
}

function mirrorSelectedObject() {
  const layer = CanvasManager.getActiveLayer();
  if (!layer) return;
  if (state.selectedObjects.length > 0) {
    pushUndo();
    // Mirror each object's scaleX AND reflect positions around group center
    const bounds = getMultiSelectionBounds(state.selectedObjects);
    for (const obj of state.selectedObjects) {
      if (obj.scaleX === undefined) obj.scaleX = 1;
      obj.scaleX *= -1;
      // Reflect x position around the group center
      obj.x = 2 * bounds.cx - obj.x;
    }
    markLayerDirty(layer);
    renderObjects();
    return;
  }
  if (!state.selectedObject) return;
  pushUndo();
  const obj = state.selectedObject;
  if (obj.scaleX === undefined) obj.scaleX = 1;
  obj.scaleX *= -1;
  markLayerDirty(layer);
  renderObjects();
  drawSelectionHandles();
}

// ── Clear erase paths from selected object ──
function clearErasePaths() {
  if (!state.selectedObject) return;
  if (!state.selectedObject.eraserPaths || state.selectedObject.eraserPaths.length === 0) return;
  pushUndo();
  state.selectedObject.eraserPaths = [];
  const layer = CanvasManager.getActiveLayer();
  markLayerDirty(layer);
  renderObjects();
  drawSelectionHandles();
}

// ── Listen for bus events ──
bus.on('renderObjects', renderObjects);
bus.on('invalidateAllLayerCaches', invalidateAllLayerCaches);
bus.on('clearErasePaths', clearErasePaths);

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
  markLayerDirty,
  invalidateAllLayerCaches,
  appendToLayerCache,
  beginDragCache,
  beginMultiDragCache,
  endDragCache,
  // Multi-selection
  boxSelectObjects,
  getMultiSelectionBounds,
  getMultiSelectionCorners,
  drawMultiSelectionHandles,
  hitTestMultiHandle,
  drawSelectBox,
  groupSelectedObjects,
};

export default ObjectRenderer;
