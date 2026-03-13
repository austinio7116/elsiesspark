import state from '../state.js';
import bus from '../EventBus.js';
import { $ } from '../utils.js';
import CanvasManager from './CanvasManager.js';
import ObjectRenderer from './ObjectRenderer.js';

// ═══════════════════════════════════════════════════════
// MULTI-TOUCH TRACKING (module-local)
// ═══════════════════════════════════════════════════════
const touch = {
  pointers: new Map(),
  pinchStartDist: 0,
  pinchStartValue: 0,
  pinchStartAngle: 0,
  rotateStartValue: 0,
  pinchStartMidX: 0,
  pinchStartMidY: 0,
  pinchStartPanX: 0,
  pinchStartPanY: 0,
  isGesture: false,
};

function trackPointer(e) {
  touch.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
}

function untrackPointer(e) {
  touch.pointers.delete(e.pointerId);
  if (touch.pointers.size < 2) touch.isGesture = false;
}

function getPinchData() {
  const pts = [...touch.pointers.values()];
  if (pts.length < 2) return null;
  const dx = pts[1].x - pts[0].x, dy = pts[1].y - pts[0].y;
  return {
    dist: Math.hypot(dx, dy),
    angle: Math.atan2(dy, dx) * 180 / Math.PI,
    midX: (pts[0].x + pts[1].x) / 2,
    midY: (pts[0].y + pts[1].y) / 2,
  };
}

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════
function getActiveLayer() {
  return state.layers.find(l => l.id === state.activeLayerId);
}

function getActiveSize() {
  return state.activeBrush === 'eraser' ? state.eraserSize : state.brushSize;
}

function getCanvasPos(e) {
  const rect = CanvasManager.previewCanvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) * (state.canvasWidth  / rect.width),
    y: (e.clientY - rect.top)  * (state.canvasHeight / rect.height),
  };
}

// ═══════════════════════════════════════════════════════
// COMPOSITE SCRATCH TO LAYER
// ═══════════════════════════════════════════════════════
function compositeScratchToLayer(layer, brush) {
  const objectsCtx = CanvasManager.objectsCtx;
  const previewCtx = CanvasManager.previewCtx;

  if (brush === 'eraser') {
    // Eraser: re-render objects, then apply eraser stroke with destination-out on objectsCanvas
    bus.emit('renderObjects');
    objectsCtx.save();
    objectsCtx.globalCompositeOperation = 'destination-out';
    objectsCtx.globalAlpha = 1;
    objectsCtx.drawImage(state.scratchCanvas, 0, 0);
    objectsCtx.restore();
    return;
  }
  // Draw live stroke preview onto previewCanvas (sits on top of everything)
  previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
  previewCtx.save();
  // Procedural brushes handle their own opacity in drawObjectTo
  const isProc = (brush === 'sprinkles' || brush === 'vine' || brush === 'fairylights' || brush === 'glitz' || brush === 'rainbow' || brush === 'tree' || brush === 'water' || brush === 'grass' || brush === 'fur');
  previewCtx.globalAlpha = isProc ? 1 : (brush === 'marker' ? state.brushOpacity * 0.5 : state.brushOpacity);
  if (state.brushSoftness > 0 && (brush === 'pen' || brush === 'marker')) {
    previewCtx.filter = `blur(${state.brushSoftness * getActiveSize() * 0.4}px)`;
  }
  previewCtx.drawImage(state.scratchCanvas, 0, 0);
  previewCtx.filter = 'none';
  previewCtx.restore();
}

// ═══════════════════════════════════════════════════════
// START STROKE
// ═══════════════════════════════════════════════════════
function startStroke(e) {
  e.preventDefault();
  trackPointer(e);

  // Close tools submenu on canvas interaction
  const sub = $('#toolbar-submenu');
  if (sub && !sub.classList.contains('hidden')) sub.classList.add('hidden');

  if (touch.pointers.size === 2) {
    touch.isGesture = true;
    state.isDrawing = false;
    state.strokePoints = [];
    const pinch = getPinchData();
    touch.pinchStartDist  = pinch.dist;
    touch.pinchStartAngle = pinch.angle;
    if (state.stickerMode) {
      touch.pinchStartValue   = state.stickerMode.size;
      touch.rotateStartValue  = state.stickerRotation;
    } else {
      touch.pinchStartValue = state.zoom;
      touch.pinchStartMidX  = pinch.midX;
      touch.pinchStartMidY  = pinch.midY;
      touch.pinchStartPanX  = state.panX;
      touch.pinchStartPanY  = state.panY;
    }
    return;
  }
  if (touch.isGesture || touch.pointers.size > 1) return;

  const previewCtx = CanvasManager.previewCtx;

  // ── Select mode ──
  if (state.selectMode) {
    const pos = getCanvasPos(e);
    const handle = ObjectRenderer.hitTestHandle(pos.x, pos.y);
    if (handle) {
      bus.emit('pushUndo');
      const obj = state.selectedObject;
      state.selectDrag = {
        type: handle, startX: pos.x, startY: pos.y,
        origX: obj.x, origY: obj.y,
        origSize: obj.size || obj.fontSize || obj.scale || 1,
        origRotation: obj.rotation,
      };
    } else {
      const hit = ObjectRenderer.hitTestObject(pos.x, pos.y);
      if (hit) {
        bus.emit('pushUndo');
        state.selectedObject = hit;
        state.selectDrag = {
          type: 'move', startX: pos.x, startY: pos.y,
          origX: hit.x, origY: hit.y,
          origSize: hit.size || hit.fontSize || hit.scale || 1,
          origRotation: hit.rotation,
        };
        previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
        bus.emit('drawSelectionHandles');
        bus.emit('updateSelectToolbar');
      } else {
        state.selectedObject = null;
        state.selectDrag = null;
        previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
        bus.emit('renderObjects');
        bus.emit('updateSelectToolbar');
      }
    }
    return;
  }
  if (state.textMode) {
    const pos = getCanvasPos(e);
    state.textPos = pos;
    state.textDragging = true;
    bus.emit('drawTextPreview');
    return;
  }
  if (state.stickerMode) {
    const pos = getCanvasPos(e);
    state.stickerPos = pos;
    state.stickerDragging = true;
    bus.emit('drawStickerPreview');
    return;
  }
  const layer = getActiveLayer();
  if (!layer || !layer.visible) return;
  bus.emit('pushUndo');
  state.isDrawing = true;
  const pos = getCanvasPos(e);
  state.lastX = pos.x;
  state.lastY = pos.y;
  state.lastMidX = pos.x;
  state.lastMidY = pos.y;
  state.strokePoints = [pos];
  state.pendingStrokeId = CanvasManager.nextObjectId();  // Pre-assign ID for consistent RNG
  const brush = state.activeBrush;
  // All strokes use scratch canvas -> preview canvas for correct z-order
  state.directDraw = false;
  {
    // Always save pre-stroke state so we can convert to object
    if (!state.preStrokeCanvas) {
      state.preStrokeCanvas = document.createElement('canvas');
      state.preStrokeCtx = state.preStrokeCanvas.getContext('2d');
    }
    state.preStrokeCanvas.width = state.canvasWidth;
    state.preStrokeCanvas.height = state.canvasHeight;
    state.preStrokeCtx.drawImage(layer.canvas, 0, 0);
    // Set up scratch canvas for opacity-correct rendering
    if (!state.scratchCanvas) {
      state.scratchCanvas = document.createElement('canvas');
      state.scratchCtx = state.scratchCanvas.getContext('2d');
    }
    state.scratchCanvas.width = state.canvasWidth;
    state.scratchCanvas.height = state.canvasHeight;
    if (brush === 'pen' || brush === 'marker' || brush === 'eraser' || brush === 'line') {
      // Draw initial dot on scratch canvas
      const sctx = state.scratchCtx;
      sctx.lineCap = 'round';
      sctx.lineJoin = 'round';
      sctx.lineWidth = getActiveSize();
      sctx.strokeStyle = brush === 'eraser' ? '#fff' : state.color;
      sctx.beginPath();
      sctx.moveTo(pos.x, pos.y);
      sctx.lineTo(pos.x, pos.y);
      sctx.stroke();
      compositeScratchToLayer(layer, brush);
    }
    // Procedural brushes (glitz, sprinkles, vine, fairylights, rainbow, tree) just collect points
  }
}

// ═══════════════════════════════════════════════════════
// MOVE STROKE
// ═══════════════════════════════════════════════════════
function moveStroke(e) {
  e.preventDefault();
  trackPointer(e);

  if (touch.isGesture && touch.pointers.size >= 2) {
    const pinch = getPinchData();
    if (!pinch) return;
    const scale = pinch.dist / touch.pinchStartDist;
    if (state.stickerMode) {
      state.stickerMode.size = Math.max(16, Math.min(600, touch.pinchStartValue * scale));
      state.stickerRotation  = touch.rotateStartValue + (pinch.angle - touch.pinchStartAngle);
      const rect = CanvasManager.previewCanvas.getBoundingClientRect();
      state.stickerPos = {
        x: (pinch.midX - rect.left) * (state.canvasWidth  / rect.width),
        y: (pinch.midY - rect.top)  * (state.canvasHeight / rect.height),
      };
      bus.emit('drawStickerPreview');
    } else {
      const newZoom = Math.max(0.1, Math.min(4, touch.pinchStartValue * scale));
      const area = $('#canvas-area');
      const areaRect = area.getBoundingClientRect();
      const areaW = area.clientWidth;
      const areaH = area.clientHeight;
      // Canvas point under the initial pinch midpoint
      const oldCX = (areaW - state.canvasWidth * touch.pinchStartValue) / 2 + touch.pinchStartPanX;
      const oldCY = (areaH - state.canvasHeight * touch.pinchStartValue) / 2 + touch.pinchStartPanY;
      const canvasX = (touch.pinchStartMidX - areaRect.left - oldCX) / touch.pinchStartValue;
      const canvasY = (touch.pinchStartMidY - areaRect.top  - oldCY) / touch.pinchStartValue;
      // Keep that canvas point under the current midpoint + allow pan
      const newBaseCX = (areaW - state.canvasWidth * newZoom) / 2;
      const newBaseCY = (areaH - state.canvasHeight * newZoom) / 2;
      state.panX = pinch.midX - areaRect.left - newBaseCX - canvasX * newZoom;
      state.panY = pinch.midY - areaRect.top  - newBaseCY - canvasY * newZoom;
      state.zoom = newZoom;
      bus.emit('applyZoom');
    }
    return;
  }

  const previewCtx = CanvasManager.previewCtx;

  // ── Select mode drag ──
  if (state.selectMode && state.selectDrag && state.selectedObject) {
    const pos = getCanvasPos(e);
    const d = state.selectDrag;
    const obj = state.selectedObject;
    if (d.type === 'move') {
      obj.x = d.origX + (pos.x - d.startX);
      obj.y = d.origY + (pos.y - d.startY);
    } else if (d.type === 'rotate') {
      const a1 = Math.atan2(d.startY - d.origY, d.startX - d.origX);
      const a2 = Math.atan2(pos.y - obj.y, pos.x - obj.x);
      obj.rotation = d.origRotation + (a2 - a1) * 180 / Math.PI;
    } else if (d.type.startsWith('scale')) {
      const dist0 = Math.hypot(d.startX - d.origX, d.startY - d.origY) || 1;
      const dist1 = Math.hypot(pos.x - obj.x, pos.y - obj.y);
      const scaleVal = Math.max(0.1, dist1 / dist0);
      if (obj.type === 'sticker') {
        obj.size = Math.max(16, Math.min(600, d.origSize * scaleVal));
      } else if (obj.type === 'text') {
        obj.fontSize = Math.max(12, Math.min(300, Math.round(d.origSize * scaleVal)));
      } else if (obj.type === 'stroke') {
        obj.scale = Math.max(0.1, Math.min(10, d.origSize * scaleVal));
      }
    }
    previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
    bus.emit('renderObjects');
    return;
  }
  if (state.textMode && state.textDragging) {
    state.textPos = getCanvasPos(e);
    bus.emit('drawTextPreview');
    return;
  }
  if (state.stickerMode) {
    state.stickerPos = getCanvasPos(e);
    bus.emit('drawStickerPreview');
    return;
  }
  if (!state.isDrawing) return;
  const layer = getActiveLayer();
  if (!layer) return;
  const pos = getCanvasPos(e);
  state.strokePoints.push(pos);
  const brush = state.activeBrush;
  // Line tool: keep only start and end points for a straight line
  if (brush === 'line') {
    state.strokePoints = [state.strokePoints[0], pos];
  }

  {
    // Scratch canvas path: redraw entire stroke each frame
    const sctx = state.scratchCtx;
    sctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
    if (brush === 'pen' || brush === 'marker' || brush === 'eraser' || brush === 'line') {
      sctx.lineCap  = 'round';
      sctx.lineJoin = 'round';
      sctx.lineWidth = getActiveSize();
      sctx.strokeStyle = brush === 'eraser' ? '#fff' : state.color;
      const pts = state.strokePoints;
      sctx.beginPath();
      sctx.moveTo(pts[0].x, pts[0].y);
      if (pts.length === 1) {
        sctx.lineTo(pts[0].x, pts[0].y);
      } else {
        for (let i = 1; i < pts.length - 1; i++) {
          const mx = (pts[i].x + pts[i + 1].x) / 2;
          const my = (pts[i].y + pts[i + 1].y) / 2;
          sctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
        }
        sctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      }
      sctx.stroke();
    } else {
      // Procedural brushes (glitz, sprinkles, vine, fairylights): render via drawObjectTo
      const pts = state.strokePoints;
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      pts.forEach(p => { if (p.x < minX) minX = p.x; if (p.y < minY) minY = p.y; if (p.x > maxX) maxX = p.x; if (p.y > maxY) maxY = p.y; });
      const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
      const relPts = pts.map(p => ({ x: p.x - cx, y: p.y - cy }));
      const tmpObj = {
        id: state.pendingStrokeId, type: 'stroke', x: cx, y: cy, rotation: 0, scale: 1,
        points: relPts, color: state.color, brushSize: getActiveSize(),
        opacity: state.brushOpacity, brush: brush,
        baseWidth: maxX - minX + getActiveSize() * 2,
        baseHeight: maxY - minY + getActiveSize() * 2,
        sprinklesDensity: state.sprinklesDensity,
        fairylightsUseColor: state.fairylightsUseColor,
        treeLeafDensity: state.treeLeafDensity,
        treeBranchDensity: state.treeBranchDensity,
        treeMode: state.treeMode,
      };
      ObjectRenderer.drawObjectTo(sctx, tmpObj);
    }
    compositeScratchToLayer(layer, brush);
  }
  state.lastX = pos.x;
  state.lastY = pos.y;
}

// ═══════════════════════════════════════════════════════
// END STROKE
// ═══════════════════════════════════════════════════════
function endStroke(e) {
  untrackPointer(e);

  const previewCtx = CanvasManager.previewCtx;

  if (state.selectMode && state.selectDrag) {
    if (state.selectDrag.type !== 'move' || state.selectDrag.startX !== state.selectedObject?.x) {
      // Object was modified — undo was already captured in startStroke
    }
    state.selectDrag = null;
    return;
  }
  if (state.textMode && state.textDragging && !touch.isGesture) {
    bus.emit('commitText');
    return;
  }
  if (state.stickerMode && state.stickerDragging && !touch.isGesture) {
    bus.emit('commitSticker');
    return;
  }
  if (touch.pointers.size === 0) touch.isGesture = false;
  // Final composite for clean stroke end
  if (state.isDrawing && state.strokePoints.length > 0) {
    const layer = getActiveLayer();
    if (layer) {
      const brush = state.activeBrush;
      // Convert all strokes to selectable objects
      if (state.strokePoints.length > 0) {
        // Restore the layer canvas to pre-stroke state
        layer.ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
        if (state.preStrokeCanvas) {
          layer.ctx.drawImage(state.preStrokeCanvas, 0, 0);
        }
        // Compute bounding box and center
        const pts = state.strokePoints;
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        pts.forEach(p => {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
        });
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;
        const relPoints = pts.map(p => ({ x: p.x - cx, y: p.y - cy }));
        const activeSize = getActiveSize();
        // For procedural brushes, expand bounding box to account for decorations
        const expandFactor = (brush === 'vine' || brush === 'fairylights') ? 3 : (brush === 'sprinkles' ? 4 : (brush === 'tree' ? 5 : (brush === 'water' || brush === 'grass' || brush === 'fur') ? 3 : 1));
        layer.objects.push({
          id: state.pendingStrokeId, type: 'stroke',
          x: cx, y: cy, rotation: 0, scale: 1,
          points: relPoints,
          color: brush === 'eraser' ? '#000' : state.color,
          brushSize: activeSize,
          opacity: state.brushOpacity,
          softness: state.brushSoftness,
          brush: brush,
          baseWidth: maxX - minX + activeSize * 2 * expandFactor,
          baseHeight: maxY - minY + activeSize * 2 * expandFactor,
          sprinklesDensity: state.sprinklesDensity,
          fairylightsUseColor: state.fairylightsUseColor,
          treeLeafDensity: state.treeLeafDensity,
          treeBranchDensity: state.treeBranchDensity,
          treeMode: state.treeMode,
        });
        previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
        bus.emit('renderObjects');
      }
    }
  }
  state.isDrawing = false;
  state.strokePoints = [];
  state.directDraw = false;
  bus.emit('scheduleAutosave');
}

// ═══════════════════════════════════════════════════════
// WHEEL HANDLER (zoom / sticker sizing / text sizing)
// ═══════════════════════════════════════════════════════
function onWheel(e) {
  e.preventDefault();
  if (state.textMode) {
    state.textMode.size = Math.max(12, Math.min(200, state.textMode.size + (e.deltaY > 0 ? -4 : 4)));
    bus.emit('drawTextPreview');
  } else if (state.stickerMode) {
    if (e.shiftKey) state.stickerRotation += e.deltaY > 0 ? 15 : -15;
    else state.stickerMode.size = Math.max(16, Math.min(600, state.stickerMode.size + (e.deltaY > 0 ? -8 : 8)));
    bus.emit('drawStickerPreview');
  } else {
    const oldZoom = state.zoom;
    const newZoom = Math.max(0.05, Math.min(8, oldZoom * (e.deltaY > 0 ? 0.92 : 1.08)));
    const area = $('#canvas-area');
    const areaRect = area.getBoundingClientRect();
    const areaW = area.clientWidth;
    const areaH = area.clientHeight;
    // Canvas point under cursor
    const oldCX = (areaW - state.canvasWidth * oldZoom) / 2 + state.panX;
    const oldCY = (areaH - state.canvasHeight * oldZoom) / 2 + state.panY;
    const canvasX = (e.clientX - areaRect.left - oldCX) / oldZoom;
    const canvasY = (e.clientY - areaRect.top  - oldCY) / oldZoom;
    // Keep that canvas point under cursor
    const newBaseCX = (areaW - state.canvasWidth * newZoom) / 2;
    const newBaseCY = (areaH - state.canvasHeight * newZoom) / 2;
    state.panX = e.clientX - areaRect.left - newBaseCX - canvasX * newZoom;
    state.panY = e.clientY - areaRect.top  - newBaseCY - canvasY * newZoom;
    state.zoom = newZoom;
    bus.emit('applyZoom');
  }
}

// ═══════════════════════════════════════════════════════
// INIT — bind pointer + wheel events to preview canvas
// ═══════════════════════════════════════════════════════
function initDrawingEngine() {
  const previewCanvas = CanvasManager.previewCanvas;

  previewCanvas.addEventListener('pointerdown',   startStroke);
  previewCanvas.addEventListener('pointermove',   moveStroke);
  previewCanvas.addEventListener('pointerup',     endStroke);
  previewCanvas.addEventListener('pointerleave',  endStroke);
  previewCanvas.addEventListener('pointercancel', endStroke);
  previewCanvas.style.touchAction = 'none';

  previewCanvas.addEventListener('wheel', onWheel, { passive: false });
}

// ═══════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════
export {
  initDrawingEngine,
  startStroke,
  moveStroke,
  endStroke,
  getCanvasPos,
  getActiveLayer,
  getActiveSize,
  compositeScratchToLayer,
  trackPointer,
  untrackPointer,
  getPinchData,
  onWheel,
};

export default {
  initDrawingEngine,
  startStroke,
  moveStroke,
  endStroke,
  getCanvasPos,
  getActiveLayer,
  getActiveSize,
  compositeScratchToLayer,
  trackPointer,
  untrackPointer,
  getPinchData,
  onWheel,
  // Expose touch state for external pinch handling
  get touch() { return touch; },
};
