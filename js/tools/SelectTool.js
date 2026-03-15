// ═══════════════════════════════════════════════════════
// SELECT TOOL
// ═══════════════════════════════════════════════════════
import state from '../state.js';
import bus from '../EventBus.js';
import { $ } from '../utils.js';
import CanvasManager from '../engine/CanvasManager.js';
import ObjectRenderer from '../engine/ObjectRenderer.js';

export function enterSelectMode() {
  state.selectMode = true;
  state.selectedObject = null;
  state.selectedObjects = [];
  state.selectBox = null;
  bus.emit('exitStickerMode');
  bus.emit('exitTextMode');
  CanvasManager.previewCanvas.style.cursor = 'default';
  CanvasManager.previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
  updateSelectToolbar();
}

export function exitSelectMode() {
  state.selectMode = false;
  state.selectedObject = null;
  state.selectedObjects = [];
  state.selectDrag = null;
  state.selectBox = null;
  CanvasManager.previewCanvas.style.cursor = 'crosshair';
  CanvasManager.previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
  updateSelectToolbar();
}

export function updateSelectToolbar() {
  const bar = $('#select-toolbar');
  if (!bar) return;
  const hasSelection = state.selectMode && (state.selectedObject || state.selectedObjects.length > 0);
  if (hasSelection) {
    bar.classList.remove('hidden');
  } else {
    bar.classList.add('hidden');
  }
  // Show/hide group button: visible for multi-selection (group) or selected group (ungroup)
  const groupBtn = bar.querySelector('[data-selact="group"]');
  if (groupBtn) {
    const isGroup = state.selectedObject && state.selectedObject.type === 'group';
    const isMulti = state.selectedObjects.length >= 2;
    groupBtn.classList.toggle('hidden', !isGroup && !isMulti);
    const label = groupBtn.querySelector('span');
    if (label) label.textContent = isGroup ? 'Ungroup' : 'Group';
  }
}

// Re-export object manipulation functions from ObjectRenderer
export const deleteSelectedObject = () => ObjectRenderer.deleteSelectedObject();
export const copySelectedObject = () => ObjectRenderer.copySelectedObject();
export const moveSelectedObjectUp = () => ObjectRenderer.moveSelectedObjectUp();
export const moveSelectedObjectDown = () => ObjectRenderer.moveSelectedObjectDown();
export const moveSelectedObjectToFront = () => ObjectRenderer.moveSelectedObjectToFront();
export const moveSelectedObjectToBack = () => ObjectRenderer.moveSelectedObjectToBack();
export const mirrorSelectedObject = () => ObjectRenderer.mirrorSelectedObject();

// Bus listeners
bus.on('enterSelectMode', enterSelectMode);
bus.on('exitSelectMode', exitSelectMode);
bus.on('updateSelectToolbar', updateSelectToolbar);
