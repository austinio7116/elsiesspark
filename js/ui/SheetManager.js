// ── Sheet system (bottom sheets, brush preview, swipe dismiss) ──
import state from '../state.js';
import bus from '../EventBus.js';
import { $, $$ } from '../utils.js';

// ── Brush preview on brush-preview-canvas ────────────
export function updateBrushPreview() {
  const canvas = $('#brush-preview-canvas');
  if (!canvas) return;
  const show = state.activeBrush === 'pen' || state.activeBrush === 'marker' || state.activeBrush === 'line';
  canvas.style.display = show ? '' : 'none';
  if (!show) return;

  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth * dpr;
  const h = canvas.clientHeight * dpr;
  if (w === 0 || h === 0) return; // guard: prevent InvalidStateError
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);

  const size = state.brushSize * dpr;
  const soft = state.brushSoftness;
  const color = state.color;
  const isMarker = state.activeBrush === 'marker';
  const isLine = state.activeBrush === 'line';
  const alpha = isMarker ? state.brushOpacity * 0.5 : state.brushOpacity;

  // Draw a smooth S-curve stroke preview (or diagonal line for line tool)
  const pad = Math.max(size * 0.5 + soft * size * 0.5, 12 * dpr);
  const x0 = pad, x1 = w - pad;
  const cy = h / 2;
  const amp = Math.min((h - size) / 2 - soft * size * 0.3, h * 0.28);

  function drawPreviewStroke(tc) {
    tc.lineCap = 'round';
    tc.lineJoin = 'round';
    tc.lineWidth = size;
    tc.strokeStyle = color;
    tc.globalAlpha = alpha;
    tc.beginPath();
    if (isLine) {
      tc.moveTo(x0, cy + amp);
      tc.lineTo(x1, cy - amp);
    } else {
      tc.moveTo(x0, cy);
      tc.bezierCurveTo(x0 + (x1 - x0) * 0.33, cy - amp, x0 + (x1 - x0) * 0.66, cy + amp, x1, cy);
    }
    tc.stroke();
  }

  if (soft > 0) {
    const tmp = document.createElement('canvas');
    tmp.width = w; tmp.height = h;
    const tc = tmp.getContext('2d');
    drawPreviewStroke(tc);
    ctx.filter = `blur(${soft * size * 0.4}px)`;
    ctx.drawImage(tmp, 0, 0);
    ctx.filter = 'none';
  } else {
    drawPreviewStroke(ctx);
  }
}

// ── Show/hide brush-specific option panels ───────────
export function updateBrushOptions() {
  $$('.brush-options').forEach(el => el.classList.add('hidden'));
  const opt = $(`#brush-opt-${state.activeBrush}`);
  if (opt) opt.classList.remove('hidden');
  // Hide shared size slider when paint is active (paint has its own)
  const sizeRow = $('.size-row');
  if (sizeRow) {
    sizeRow.style.display = state.activeBrush === 'paint' ? 'none' : '';
  }
  // Sync shared size slider to state.brushSize when switching away from paint
  const sizeSlider = $('#brush-size');
  if (sizeSlider && state.activeBrush !== 'paint') {
    sizeSlider.value = state.brushSize;
    const sizeLabel = $('#brush-size-label');
    if (sizeLabel) sizeLabel.textContent = state.brushSize;
  }
  // Show softness slider only for pen, marker, and line
  const softnessRow = $('#softness-row');
  if (softnessRow) {
    const show = state.activeBrush === 'pen' || state.activeBrush === 'marker' || state.activeBrush === 'line';
    softnessRow.style.display = show ? '' : 'none';
  }
  // Rainbow has its own opacity slider; other brushes use the main one
  if (state.activeBrush === 'rainbow') {
    const rSlider = $('#rainbow-opacity');
    if (rSlider) state.brushOpacity = parseInt(rSlider.value) / 100;
  } else {
    const slider = $('#brush-opacity');
    if (slider) state.brushOpacity = parseInt(slider.value) / 100;
  }
  updateBrushPreview();
}

// ── Open a bottom sheet ──────────────────────────────
export function openSheet(id) {
  // Close the tools submenu whenever a sheet opens
  const sub = $('#toolbar-submenu');
  if (sub) sub.classList.add('hidden');
  if (state.openSheet === id) { closeSheet(); return; }
  if (state.openSheet) {
    const prev = $('#sheet-' + state.openSheet);
    if (prev) { prev.classList.remove('open'); prev.classList.add('hidden'); }
  }
  const sheet = $('#sheet-' + id);
  const overlay = $('#sheet-overlay');
  if (!sheet) return;
  state.openSheet = id;
  sheet.classList.remove('hidden');
  // Trigger layout before adding open class for transition
  sheet.getBoundingClientRect();
  sheet.classList.add('open');
  overlay.classList.remove('hidden');
  const previewCanvas = $('#preview-canvas');
  if (previewCanvas) previewCanvas.style.pointerEvents = 'none';

  // Show/hide brush-specific options
  if (id === 'brushes') {
    updateBrushOptions();
  }
  // Lazy-init spectrum/hue canvases via bus event
  if (id === 'color') {
    setTimeout(() => {
      if ($('#tab-spectrum').classList.contains('active')) {
        bus.emit('color:drawSpectrum');
        bus.emit('color:drawHueBar');
      }
    }, 50);
  }
}

// ── Close current sheet ──────────────────────────────
export function closeSheet() {
  if (!state.openSheet) return;
  const sheet = $('#sheet-' + state.openSheet);
  if (sheet) {
    sheet.classList.remove('open');
    // Hide after transition
    setTimeout(() => { sheet.classList.add('hidden'); }, 340);
  }
  $('#sheet-overlay').classList.add('hidden');
  state.openSheet = null;
  const previewCanvas = $('#preview-canvas');
  if (previewCanvas) previewCanvas.style.pointerEvents = '';
}

// ── Swipe-down to dismiss ────────────────────────────
export function addSwipeDismiss(sheetEl) {
  let startY = 0, isDragging = false;
  sheetEl.querySelector('.sheet-handle').addEventListener('pointerdown', e => {
    startY = e.clientY; isDragging = true;
    sheetEl.style.transition = 'none';
  }, { passive: true });
  document.addEventListener('pointermove', e => {
    if (!isDragging) return;
    const dy = Math.max(0, e.clientY - startY);
    sheetEl.style.transform = `translateY(${dy}px)`;
  }, { passive: true });
  document.addEventListener('pointerup', e => {
    if (!isDragging) return;
    isDragging = false;
    sheetEl.style.transition = '';
    sheetEl.style.transform = '';
    if (e.clientY - startY > 80) closeSheet();
  });
}
