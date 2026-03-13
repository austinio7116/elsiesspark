// ═══════════════════════════════════════════════════════
// STICKER SYSTEM
// ═══════════════════════════════════════════════════════
import state from '../state.js';
import bus from '../EventBus.js';
import { $, $$, showToast, parseSvgAspect } from '../utils.js';
import { STICKERS, FILE_STICKERS } from '../constants/stickers.js';
import CanvasManager from '../engine/CanvasManager.js';
import { pushUndo } from '../engine/UndoManager.js';
import ObjectRenderer from '../engine/ObjectRenderer.js';

export function renderStickers() {
  const list = $('#sticker-list');
  if (!list) return;
  list.innerHTML = '';
  STICKERS.forEach(st => {
    const btn = document.createElement('button');
    btn.className = 'sticker-btn';
    btn.title = st.name;
    btn.innerHTML = st.svg;
    btn.querySelector('svg').style.cssText = 'width:36px;height:36px';
    btn.addEventListener('click', () => { enterStickerMode(st); bus.emit('closeSheet'); });
    list.appendChild(btn);
  });
  FILE_STICKERS.forEach(st => {
    const btn = document.createElement('button');
    btn.className = 'sticker-btn sticker-btn-img';
    btn.title = st.name;
    const img = document.createElement('img');
    img.src = st.src; img.alt = st.name; img.draggable = false;
    btn.appendChild(img);
    btn.addEventListener('click', () => { enterStickerModeFromFile(st); bus.emit('closeSheet'); });
    list.appendChild(btn);
  });
}

export function _startStickerMode(name, img, aspect) {
  exitTextMode();
  exitStickerMode();
  exitSelectMode();
  const size = state.brushSize * 6 + 40;
  state.stickerMode     = { img, size, name, aspect };
  state.stickerPos      = { x: state.canvasWidth / 2, y: state.canvasHeight / 2 };
  state.stickerRotation = 0;
  state.stickerDragging = false;
  CanvasManager.previewCanvas.style.cursor = 'none';
  CanvasManager.container.classList.add('sticker-mode');
  $$('.sticker-btn').forEach(b => b.classList.toggle('placing', b.title === name));
  $('#sticker-touch-controls').classList.remove('hidden');
  drawStickerPreview();
  const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  showToast(touch ? 'Tap to place. Pinch to resize & rotate.' : 'Click to place. Scroll to resize. Shift+scroll to rotate. Esc to cancel.');
}

export function enterStickerMode(sticker) {
  const aspect = parseSvgAspect(sticker.svg);
  const blob   = new Blob([sticker.svg], { type: 'image/svg+xml' });
  const url    = URL.createObjectURL(blob);
  const img    = new Image();
  img.onload   = () => { URL.revokeObjectURL(url); _startStickerMode(sticker.name, img, aspect); };
  img.src      = url;
}

export function enterStickerModeFromFile(sticker) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => _startStickerMode(sticker.name, img, img.naturalWidth / img.naturalHeight || 1);
  img.src    = sticker.src;
}

export function exitStickerMode() {
  if (!state.stickerMode) return;
  state.stickerMode = null;
  state.stickerPos  = null;
  state.stickerDragging = false;
  CanvasManager.previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
  CanvasManager.previewCanvas.style.cursor = 'crosshair';
  CanvasManager.container.classList.remove('sticker-mode');
  $$('.sticker-btn').forEach(b => b.classList.remove('placing'));
  $('#sticker-touch-controls').classList.add('hidden');
}

export function stickerDims() {
  const { size, aspect } = state.stickerMode;
  if (aspect >= 1) return { w: size, h: size / aspect };
  return { w: size * aspect, h: size };
}

export function drawStickerPreview() {
  if (!state.stickerMode || !state.stickerPos) return;
  const { img } = state.stickerMode;
  const { w, h } = stickerDims();
  const { x, y } = state.stickerPos;
  CanvasManager.previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
  CanvasManager.previewCtx.save();
  CanvasManager.previewCtx.globalAlpha = 0.7;
  CanvasManager.previewCtx.translate(x, y);
  CanvasManager.previewCtx.rotate(state.stickerRotation * Math.PI / 180);
  CanvasManager.previewCtx.drawImage(img, -w / 2, -h / 2, w, h);
  CanvasManager.previewCtx.restore();
  const radius = Math.max(w, h) / 2 + 4;
  CanvasManager.previewCtx.save();
  CanvasManager.previewCtx.strokeStyle = 'rgba(232,114,92,0.5)';
  CanvasManager.previewCtx.lineWidth = 1.5;
  CanvasManager.previewCtx.setLineDash([4, 4]);
  CanvasManager.previewCtx.beginPath();
  CanvasManager.previewCtx.arc(x, y, radius, 0, Math.PI * 2);
  CanvasManager.previewCtx.stroke();
  CanvasManager.previewCtx.setLineDash([]);
  CanvasManager.previewCtx.restore();
}

export function commitSticker() {
  if (!state.stickerMode || !state.stickerPos) return;
  const layer = CanvasManager.getActiveLayer();
  if (!layer || !layer.visible) return;
  pushUndo();
  const { img, name, aspect, size } = state.stickerMode;
  const { x, y } = state.stickerPos;
  const obj = {
    id: CanvasManager.nextObjectId(), type: 'sticker',
    x, y, rotation: state.stickerRotation,
    img, name, aspect, size,
  };
  if (name && name.startsWith('shape:')) obj.shapeColor = state.color;
  layer.objects.push(obj);
  exitStickerMode();
  ObjectRenderer.renderObjects();
  bus.emit('scheduleAutosave');
}

// Import peer tool exit functions
import { exitTextMode } from './TextTool.js';
import { exitSelectMode } from './SelectTool.js';

// Bus listeners so other modules can trigger sticker functions
bus.on('exitStickerMode', exitStickerMode);
bus.on('drawStickerPreview', drawStickerPreview);
bus.on('commitSticker', commitSticker);
