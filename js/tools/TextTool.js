// ═══════════════════════════════════════════════════════
// TEXT TOOL
// ═══════════════════════════════════════════════════════
import state from '../state.js';
import bus from '../EventBus.js';
import { showToast } from '../utils.js';
import CanvasManager from '../engine/CanvasManager.js';
import { pushUndo } from '../engine/UndoManager.js';
import ObjectRenderer from '../engine/ObjectRenderer.js';

export function enterTextMode(text, font, size, bold, italic, align = 'center') {
  exitStickerMode();
  exitTextMode();
  exitSelectMode();
  state.textMode = { text, font, size, bold, italic, align };
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

const FONT_MAP = {
  'Nunito':            "'Nunito', sans-serif",
  'serif':             "Georgia, 'Times New Roman', serif",
  'monospace':         "'Courier New', monospace",
  'cursive':           "'Segoe Script', cursive",
  'Pacifico':          "'Pacifico', cursive",
  'Dancing Script':    "'Dancing Script', cursive",
  'Fredoka One':       "'Fredoka One', cursive",
  'Caveat':            "'Caveat', cursive",
  'Permanent Marker':  "'Permanent Marker', cursive",
  'Indie Flower':      "'Indie Flower', cursive",
  'Lobster':           "'Lobster', cursive",
  'Shadows Into Light': "'Shadows Into Light', cursive",
  'Satisfy':           "'Satisfy', cursive",
  'Orbitron':          "'Orbitron', sans-serif",
  'Audiowide':         "'Audiowide', cursive",
  'Press Start 2P':    "'Press Start 2P', cursive",
};

export function textFontStr(tm) {
  let s = '';
  if (tm.italic) s += 'italic ';
  if (tm.bold) s += 'bold ';
  s += tm.size + 'px ';
  s += FONT_MAP[tm.font] || "'Nunito', sans-serif";
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
  const align = state.textMode.align || 'center';
  CanvasManager.previewCtx.fillStyle = state.color;
  CanvasManager.previewCtx.textAlign = align;
  CanvasManager.previewCtx.textBaseline = 'middle';
  CanvasManager.previewCtx.fillText(text, x, y);
  CanvasManager.previewCtx.restore();
  // Dashed bounding box
  CanvasManager.previewCtx.save();
  CanvasManager.previewCtx.font = textFontStr(state.textMode);
  const tw = CanvasManager.previewCtx.measureText(text).width;
  const th = size * 1.2;
  let bx = x - tw / 2;
  if (align === 'left') bx = x;
  else if (align === 'right') bx = x - tw;
  CanvasManager.previewCtx.strokeStyle = 'rgba(232,114,92,0.5)';
  CanvasManager.previewCtx.lineWidth = 1.5;
  CanvasManager.previewCtx.setLineDash([4, 4]);
  CanvasManager.previewCtx.strokeRect(bx - 6, y - th / 2 - 2, tw + 12, th + 4);
  CanvasManager.previewCtx.setLineDash([]);
  CanvasManager.previewCtx.restore();
}

export function commitText() {
  if (!state.textMode || !state.textPos) return;
  const layer = CanvasManager.getActiveLayer();
  if (!layer || !layer.visible) return;
  pushUndo();
  const { text, font, size, bold, italic, align } = state.textMode;
  const { x, y } = state.textPos;
  const newObj = {
    id: CanvasManager.nextObjectId(), type: 'text',
    x, y, rotation: 0,
    text, font, fontSize: size, bold, italic,
    align: align || 'center',
    color: state.color, opacity: state.brushOpacity,
  };
  layer.objects.push(newObj);
  ObjectRenderer.appendToLayerCache(layer, newObj);
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
