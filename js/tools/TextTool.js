// ═══════════════════════════════════════════════════════
// TEXT TOOL
// ═══════════════════════════════════════════════════════
import state from '../state.js';
import bus from '../EventBus.js';
import { showToast } from '../utils.js';
import CanvasManager from '../engine/CanvasManager.js';
import { pushUndo } from '../engine/UndoManager.js';
import ObjectRenderer from '../engine/ObjectRenderer.js';

export function enterTextMode(text, font, size, bold, italic) {
  exitStickerMode();
  exitTextMode();
  exitSelectMode();
  state.textMode = { text, font, size, bold, italic };
  state.textPos  = { x: state.canvasWidth / 2, y: state.canvasHeight / 2 };
  state.textDragging = false;
  CanvasManager.previewCanvas.style.cursor = 'text';
  drawTextPreview();
  const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  showToast(touch ? 'Tap to place your text.' : 'Click to place. Scroll to resize. Esc to cancel.');
}

export function exitTextMode() {
  if (!state.textMode) return;
  state.textMode = null;
  state.textPos  = null;
  state.textDragging = false;
  CanvasManager.previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
  CanvasManager.previewCanvas.style.cursor = 'crosshair';
}

export function textFontStr(tm) {
  let s = '';
  if (tm.italic) s += 'italic ';
  if (tm.bold) s += 'bold ';
  s += tm.size + 'px ';
  if (tm.font === 'cursive') s += "'Segoe Script', cursive";
  else if (tm.font === 'serif') s += "Georgia, 'Times New Roman', serif";
  else if (tm.font === 'monospace') s += "'Courier New', monospace";
  else s += "'Nunito', sans-serif";
  return s;
}

export function drawTextPreview() {
  if (!state.textMode || !state.textPos) return;
  const { text, font, size, bold, italic } = state.textMode;
  const { x, y } = state.textPos;
  CanvasManager.previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
  CanvasManager.previewCtx.save();
  CanvasManager.previewCtx.globalAlpha = 0.7;
  CanvasManager.previewCtx.font = textFontStr(state.textMode);
  CanvasManager.previewCtx.fillStyle = state.color;
  CanvasManager.previewCtx.textAlign = 'center';
  CanvasManager.previewCtx.textBaseline = 'middle';
  CanvasManager.previewCtx.fillText(text, x, y);
  CanvasManager.previewCtx.restore();
  // Dashed bounding box
  const metrics = CanvasManager.previewCtx.measureText(text);
  CanvasManager.previewCtx.save();
  CanvasManager.previewCtx.font = textFontStr(state.textMode);
  const tw = CanvasManager.previewCtx.measureText(text).width;
  const th = size * 1.2;
  CanvasManager.previewCtx.strokeStyle = 'rgba(232,114,92,0.5)';
  CanvasManager.previewCtx.lineWidth = 1.5;
  CanvasManager.previewCtx.setLineDash([4, 4]);
  CanvasManager.previewCtx.strokeRect(x - tw / 2 - 6, y - th / 2 - 2, tw + 12, th + 4);
  CanvasManager.previewCtx.setLineDash([]);
  CanvasManager.previewCtx.restore();
}

export function commitText() {
  if (!state.textMode || !state.textPos) return;
  const layer = CanvasManager.getActiveLayer();
  if (!layer || !layer.visible) return;
  pushUndo();
  const { text, font, size, bold, italic } = state.textMode;
  const { x, y } = state.textPos;
  layer.objects.push({
    id: CanvasManager.nextObjectId(), type: 'text',
    x, y, rotation: 0,
    text, font, fontSize: size, bold, italic,
    color: state.color, opacity: state.brushOpacity,
  });
  exitTextMode();
  ObjectRenderer.renderObjects();
  bus.emit('scheduleAutosave');
}

// Import peer tool exit functions.
import { exitStickerMode } from './StickerTool.js';
import { exitSelectMode } from './SelectTool.js';

// Bus listeners so other modules can trigger text functions
bus.on('exitTextMode', exitTextMode);
bus.on('drawTextPreview', drawTextPreview);
bus.on('commitText', commitText);
