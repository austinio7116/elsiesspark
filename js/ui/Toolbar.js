// ═══════════════════════════════════════════════════════
// TOOLBAR — main toolbar, submenu, keyboard shortcuts,
//           brush/eraser/opacity sliders, layer/sticker/text sheet bindings
// ═══════════════════════════════════════════════════════
import state from '../state.js';
import bus from '../EventBus.js';
import { $, $$, showToast } from '../utils.js';
import { openSheet, closeSheet, addSwipeDismiss, updateBrushOptions, updateBrushPreview } from './SheetManager.js';

// ═══════════════════════════════════════════════════════
// SUBMENU HELPERS
// ═══════════════════════════════════════════════════════
let submenu = null;

function toggleSubmenu() {
  submenu.classList.toggle('hidden');
  if (!submenu.classList.contains('hidden')) {
    $('#select-toolbar')?.classList.add('hidden');
  }
}

function closeSubmenu() {
  submenu.classList.add('hidden');
}

// ═══════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════
export function initToolbar() {
  submenu = $('#toolbar-submenu');

  // ── Tools submenu ──
  $$('.tb-sub-btn[data-subtool]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tool = btn.dataset.subtool;
      $$('.tb-sub-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      closeSubmenu();

      if (tool === 'text') {
        openSheet('text');
      } else if (tool === 'brushes') {
        openSheet('brushes');
      } else {
        // stickers, backgrounds, etc.
        openSheet(tool);
      }
    });
  });

  // ── Select toolbar buttons ──
  $$('[data-selact]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.selact;
      if (action === 'delete') bus.emit('deleteSelectedObject');
      else if (action === 'copy') bus.emit('copySelectedObject');
      else if (action === 'up') bus.emit('moveSelectedObjectUp');
      else if (action === 'down') bus.emit('moveSelectedObjectDown');
      else if (action === 'front') bus.emit('moveSelectedObjectToFront');
      else if (action === 'back') bus.emit('moveSelectedObjectToBack');
      else if (action === 'mirror') bus.emit('mirrorSelectedObject');
    });
  });

  // ── Main toolbar buttons ──
  $$('.tb-btn[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tool = btn.dataset.tool;
      if (tool === 'tools-menu') {
        toggleSubmenu();
        return;
      }
      closeSubmenu();
      if (tool === 'eraser') {
        bus.emit('exitStickerMode');
        bus.emit('exitTextMode');
        bus.emit('exitSelectMode');
        $$('.brush-btn').forEach(b => b.classList.remove('active'));
        state.activeBrush = 'eraser';
        $$('.tb-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        openSheet('eraser');
      } else if (tool === 'pointer') {
        bus.emit('enterSelectMode');
        $$('.tb-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      } else if (tool === 'undo') {
        bus.emit('undo');
      } else if (tool === 'redo') {
        bus.emit('redo');
      } else {
        openSheet(tool);
      }
    });
  });

  // ── Layer sheet: background & export shortcuts ──
  $('#btn-open-backgrounds')?.addEventListener('click', () => {
    closeSheet();
    setTimeout(() => openSheet('backgrounds'), 100);
  });
  $('#btn-layer-export')?.addEventListener('click', () => {
    const exportBtn = $('#btn-export');
    if (exportBtn) exportBtn.click();
  });

  // ── Clear canvas ──
  $('#btn-clear-canvas')?.addEventListener('click', () => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box">
        <h3>Clear Canvas?</h3>
        <p>This will erase all layers and start fresh. Are you sure?</p>
        <div class="modal-actions">
          <button class="modal-btn-cancel">Cancel</button>
          <button class="modal-btn-danger">Clear</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('.modal-btn-cancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('.modal-btn-danger').addEventListener('click', () => {
      overlay.remove();
      bus.emit('resetToNewCanvas');
      bus.emit('view:enterDraw');
      closeSheet();
    });
  });

  // ── Sheet overlay dismiss ──
  $('#sheet-overlay').addEventListener('click', closeSheet);

  // ── Sheet close buttons ──
  $$('.sheet-close-btn').forEach(btn => {
    btn.addEventListener('click', () => closeSheet());
  });

  // ── Add swipe-dismiss to all sheets ──
  $$('.bottom-sheet').forEach(sheet => addSwipeDismiss(sheet));

  // ── Opacity slider ──
  const opacitySlider = $('#brush-opacity');
  if (opacitySlider) {
    opacitySlider.addEventListener('input', e => {
      state.brushOpacity = parseInt(e.target.value) / 100;
      $('#opacity-label').textContent = e.target.value + '%';
      updateBrushPreview();
    });
  }

  // ── Brush sheet ──
  $$('.brush-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.brush-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeBrush = btn.dataset.brush;
      bus.emit('exitStickerMode');
      bus.emit('exitTextMode');
      bus.emit('exitSelectMode');
      updateBrushOptions();
      // Set tools-menu as active in main bar, Draw as active in submenu
      $$('.tb-btn').forEach(b => b.classList.remove('active'));
      $('#btn-tools-menu')?.classList.add('active');
      $$('.tb-sub-btn').forEach(b => b.classList.remove('active'));
      $$('.tb-sub-btn[data-subtool="brushes"]').forEach(b => b.classList.add('active'));
    });
  });

  // ── Sprinkles density slider ──
  const densitySlider = $('#sprinkles-density');
  if (densitySlider) {
    densitySlider.addEventListener('input', e => {
      state.sprinklesDensity = parseInt(e.target.value);
      $('#sprinkles-density-label').textContent = state.sprinklesDensity;
    });
  }

  // ── Tree leaf density slider ──
  const treeLeafSlider = $('#tree-leaf-density');
  if (treeLeafSlider) {
    treeLeafSlider.addEventListener('input', e => {
      state.treeLeafDensity = parseInt(e.target.value);
      $('#tree-leaf-density-label').textContent = state.treeLeafDensity;
    });
  }

  // ── Tree branch density slider ──
  const treeBranchSlider = $('#tree-branch-density');
  if (treeBranchSlider) {
    treeBranchSlider.addEventListener('input', e => {
      state.treeBranchDensity = parseInt(e.target.value);
      $('#tree-branch-density-label').textContent = state.treeBranchDensity;
    });
  }

  // ── Fairy lights colour toggle ──
  const flToggle = $('#fairylights-color-toggle');
  if (flToggle) {
    flToggle.addEventListener('click', () => {
      const on = flToggle.dataset.on === 'true';
      flToggle.dataset.on = on ? 'false' : 'true';
      state.fairylightsUseColor = !on;
    });
  }

  // ── Brush size slider ──
  const sizeSlider = $('#brush-size');
  if (sizeSlider) {
    sizeSlider.addEventListener('input', e => {
      state.brushSize = parseInt(e.target.value);
      $('#brush-size-label').textContent = state.brushSize;
      updateBrushPreview();
    });
  }

  // ── Brush softness slider ──
  const softnessSlider = $('#brush-softness');
  if (softnessSlider) {
    softnessSlider.addEventListener('input', e => {
      state.brushSoftness = parseInt(e.target.value) / 100;
      $('#brush-softness-label').textContent = e.target.value + '%';
      updateBrushPreview();
    });
  }

  // ── Eraser size slider ──
  const eraserSlider = $('#eraser-size');
  if (eraserSlider) {
    eraserSlider.addEventListener('input', e => {
      state.eraserSize = parseInt(e.target.value);
      $('#eraser-size-label').textContent = state.eraserSize;
    });
  }

  // ── Layers sheet ──
  $('#btn-add-layer')?.addEventListener('click', () => {
    bus.emit('addLayer');
    bus.emit('pushUndo');
  });

  // ── Sticker touch controls ──
  $('#sticker-shrink')?.addEventListener('click', () => {
    if (!state.stickerMode) return;
    state.stickerMode.size = Math.max(16, state.stickerMode.size - 12);
    bus.emit('drawStickerPreview');
  });
  $('#sticker-grow')?.addEventListener('click', () => {
    if (!state.stickerMode) return;
    state.stickerMode.size = Math.min(600, state.stickerMode.size + 12);
    bus.emit('drawStickerPreview');
  });
  $('#sticker-rotate-left')?.addEventListener('click', () => {
    if (!state.stickerMode) return;
    state.stickerRotation -= 15;
    bus.emit('drawStickerPreview');
  });
  $('#sticker-rotate-right')?.addEventListener('click', () => {
    if (!state.stickerMode) return;
    state.stickerRotation += 15;
    bus.emit('drawStickerPreview');
  });
  $('#sticker-cancel')?.addEventListener('click', () => bus.emit('exitStickerMode'));

  // ── Text sheet ──
  const textSizeSlider = $('#text-size');
  if (textSizeSlider) {
    textSizeSlider.addEventListener('input', e => {
      $('#text-size-label').textContent = e.target.value;
    });
  }
  $$('.text-font-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.text-font-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  $('#text-bold')?.addEventListener('click', e => {
    e.currentTarget.classList.toggle('active');
  });
  $('#text-italic')?.addEventListener('click', e => {
    e.currentTarget.classList.toggle('active');
  });
  $('#btn-place-text')?.addEventListener('click', () => {
    const input = $('#text-input');
    const text = input?.value.trim();
    if (!text) { showToast('Type something first!'); return; }
    const fontBtn = document.querySelector('.text-font-btn.active');
    const font = fontBtn?.dataset.font || 'Nunito';
    const size = parseInt($('#text-size')?.value || 48);
    const bold = $('#text-bold')?.classList.contains('active') || false;
    const italic = $('#text-italic')?.classList.contains('active') || false;
    closeSheet();
    bus.emit('enterTextMode', text, font, size, bold, italic);
  });

  // ── Background sheet ──
  $('#btn-import-image')?.addEventListener('click', () => $('#file-import').click());
  $('#file-import')?.addEventListener('change', e => {
    if (e.target.files[0]) bus.emit('importTraceImage', e.target.files[0]);
    e.target.value = '';
  });
  $('#btn-clear-trace')?.addEventListener('click', () => bus.emit('clearTrace'));
  $('#btn-export')?.addEventListener('click', () => bus.emit('exportPNG'));

  // ── Keyboard shortcuts ──
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (state.selectMode && state.selectedObject) {
        state.selectedObject = null;
        bus.emit('clearPreviewCanvas');
        bus.emit('renderObjects');
        bus.emit('updateSelectToolbar');
        return;
      }
      if (state.textMode) { bus.emit('exitTextMode'); return; }
      if (state.stickerMode) { bus.emit('exitStickerMode'); return; }
      closeSheet();
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (state.selectMode && state.selectedObject && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        bus.emit('deleteSelectedObject');
        return;
      }
    }
    if (e.target.tagName === 'INPUT') return;
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); e.shiftKey ? bus.emit('redo') : bus.emit('undo'); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); bus.emit('redo'); }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); bus.emit('saveProject'); }
  });

  // ── Draw view navigation ──
  $('#btn-back-room')?.addEventListener('click', () => {
    closeSheet();
    bus.emit('exitStickerMode');
    bus.emit('exitTextMode');
    bus.emit('exitSelectMode');
    bus.emit('showView', 'room');
  });
  $('#btn-done')?.addEventListener('click', async () => {
    bus.emit('saveProject');
    closeSheet();
    bus.emit('exitStickerMode');
    bus.emit('exitTextMode');
    bus.emit('exitSelectMode');
    bus.emit('spark:setPrompt', null);
    // Advance to next spark; go to inspire to pick another
    bus.emit('inspire:advance');
    bus.emit('showView', 'inspire');
  });

  // ── Zoom reset button ──
  $('#btn-zoom-reset')?.addEventListener('click', () => bus.emit('fitZoom'));

  // ── Window resize ──
  window.addEventListener('resize', () => { if (state.currentView === 'draw') bus.emit('fitZoom'); });

  // ── Listen for closeSheet events from other modules ──
  bus.on('closeSheet', closeSheet);
}
