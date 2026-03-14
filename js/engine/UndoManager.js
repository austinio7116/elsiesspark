import state from '../state.js';
import bus from '../EventBus.js';
import { $ } from '../utils.js';

export function captureState() {
  return state.layers.map(l => ({
    id: l.id, name: l.name, visible: l.visible, opacity: l.opacity ?? 1,
    data: l.canvas.toDataURL(),
    objects: l.objects ? l.objects.map(o => {
      const copy = { ...o };
      if (copy.points) copy.points = copy.points.map(p => ({ ...p }));
      return copy;
    }) : [],
  }));
}

export function pushUndo() {
  state.undoStack.push(captureState());
  if (state.undoStack.length > state.maxUndoSteps) state.undoStack.shift();
  state.redoStack = [];
  updateUndoRedoButtons();
}

export function undo() {
  if (!state.undoStack.length) return;
  state.redoStack.push(captureState());
  restoreState(state.undoStack.pop());
  updateUndoRedoButtons();
  bus.emit('scheduleAutosave');
}

export function redo() {
  if (!state.redoStack.length) return;
  state.undoStack.push(captureState());
  restoreState(state.redoStack.pop());
  updateUndoRedoButtons();
  bus.emit('scheduleAutosave');
}

function restoreState(snapshot) {
  snapshot.forEach(sd => {
    const layer = state.layers.find(l => l.id === sd.id);
    if (!layer) return;
    const img = new Image();
    img.onload = () => {
      layer.ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
      layer.ctx.drawImage(img, 0, 0);
    };
    img.src = sd.data;
    layer.visible = sd.visible;
    layer.opacity = sd.opacity ?? 1;
    layer.objects = sd.objects ? sd.objects.map(o => {
      const copy = { ...o };
      if (copy.points) copy.points = copy.points.map(p => ({ ...p }));
      return copy;
    }) : [];
    layer.canvas.style.display = sd.visible ? '' : 'none';
    layer.canvas.style.opacity = layer.opacity;
  });
  state.selectedObject = null;
  bus.emit('invalidateAllLayerCaches');
  bus.emit('renderLayerList');
  bus.emit('renderObjects');
  bus.emit('updateSelectToolbar');
}

export function updateUndoRedoButtons() {
  const u = $('#btn-undo');
  const r = $('#btn-redo');
  if (u) u.style.opacity = state.undoStack.length ? '1' : '0.35';
  if (r) r.style.opacity = state.redoStack.length ? '1' : '0.35';
}
