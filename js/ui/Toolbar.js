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
      } else if (tool === 'paint') {
        bus.emit('exitStickerMode');
        bus.emit('exitTextMode');
        bus.emit('exitSelectMode');
        state.eraserMode = false;
        state.eraserTarget = null;
        state.activeBrush = 'paint';
        $$('.tb-btn').forEach(b => b.classList.remove('active'));
        $('#btn-tools-menu')?.classList.add('active');
        openSheet('paint');
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
      else if (action === 'frontback') {
        const fbBtn = $('#btn-frontback');
        const label = fbBtn?.querySelector('span');
        const svg = fbBtn?.querySelector('svg');
        if (label && label.textContent === 'Front') {
          bus.emit('moveSelectedObjectToFront');
          label.textContent = 'Back';
          if (svg) svg.innerHTML = '<path d="M7 7l5 5l5 -5" /><path d="M7 13l5 5l5 -5" />';
        } else {
          bus.emit('moveSelectedObjectToBack');
          if (label) label.textContent = 'Front';
          if (svg) svg.innerHTML = '<path d="M7 11l5 -5l5 5" /><path d="M7 17l5 -5l5 5" />';
        }
      }
      else if (action === 'mirror') bus.emit('mirrorSelectedObject');
      else if (action === 'group') bus.emit('groupSelectedObjects');
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
        // Capture selected object before exiting select mode
        const prevSelected = state.selectedObject;
        bus.emit('exitSelectMode');
        $$('.brush-btn').forEach(b => b.classList.remove('active'));
        state.activeBrush = 'eraser';
        state.eraserMode = true;
        // If an object was selected, keep it as the eraser target
        state.eraserTarget = prevSelected || null;
        state.selectedObject = prevSelected || null;
        $$('.tb-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        openSheet('eraser');
      } else if (tool === 'pointer') {
        state.eraserMode = false;
        state.eraserTarget = null;
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
      state.eraserMode = false;
      state.eraserTarget = null;
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

  // ── Rainbow opacity slider ──
  const rainbowOpSlider = $('#rainbow-opacity');
  if (rainbowOpSlider) {
    rainbowOpSlider.addEventListener('input', e => {
      state.brushOpacity = parseInt(e.target.value) / 100;
      $('#rainbow-opacity-label').textContent = e.target.value + '%';
    });
  }

  // ── Fur blur slider ──
  const furBlurSlider = $('#fur-blur');
  if (furBlurSlider) {
    furBlurSlider.addEventListener('input', e => {
      state.furBlur = parseInt(e.target.value) / 100;
      $('#fur-blur-label').textContent = e.target.value + '%';
    });
  }

  // ── Paint head buttons ──
  $$('.paint-head-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.paint-head-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.paintHead = btn.dataset.head;
      state.activeBrush = 'paint';
      state.eraserMode = false;
      state.eraserTarget = null;
      bus.emit('exitStickerMode');
      bus.emit('exitTextMode');
      bus.emit('exitSelectMode');
      $$('.tb-btn').forEach(b => b.classList.remove('active'));
      $('#btn-tools-menu')?.classList.add('active');
      $$('.tb-sub-btn').forEach(b => b.classList.remove('active'));
      $$('.tb-sub-btn[data-subtool="paint"]').forEach(b => b.classList.add('active'));
    });
  });

  // ── Paint size slider ──
  const paintSizeSlider = $('#paint-size');
  if (paintSizeSlider) {
    paintSizeSlider.addEventListener('input', e => {
      state.paintSize = parseInt(e.target.value);
      $('#paint-size-label').textContent = state.paintSize;
    });
  }

  // ── Paint blend toggle ──
  const blendToggle = $('#paint-blend-toggle');
  if (blendToggle) {
    blendToggle.addEventListener('click', () => {
      const on = blendToggle.dataset.on === 'true';
      blendToggle.dataset.on = on ? 'false' : 'true';
      state.paintBlendMode = !on;
    });
  }

  // ── Rainbow blur slider ──
  const rainbowBlurSlider = $('#rainbow-blur');
  if (rainbowBlurSlider) {
    rainbowBlurSlider.addEventListener('input', e => {
      state.rainbowBlur = parseInt(e.target.value) / 100;
      $('#rainbow-blur-label').textContent = e.target.value + '%';
    });
  }

  // ── Sprinkles density slider ──
  const densitySlider = $('#sprinkles-density');
  if (densitySlider) {
    densitySlider.addEventListener('input', e => {
      state.sprinklesDensity = parseInt(e.target.value);
      $('#sprinkles-density-label').textContent = state.sprinklesDensity;
    });
  }

  // ── Tree mode selector ──
  const treeModeGroup = $('#tree-mode-group');
  if (treeModeGroup) {
    treeModeGroup.addEventListener('click', e => {
      const btn = e.target.closest('.mode-btn');
      if (!btn) return;
      treeModeGroup.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.treeMode = btn.dataset.mode;
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

  // ── Clear erases button ──
  const clearErasesBtn = $('#btn-clear-erases');
  if (clearErasesBtn) {
    clearErasesBtn.addEventListener('click', () => {
      bus.emit('clearErasePaths');
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
      if (state.selectMode && (state.selectedObject || state.selectedObjects.length > 0)) {
        state.selectedObject = null;
        state.selectedObjects = [];
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
      if (state.selectMode && (state.selectedObject || state.selectedObjects.length > 0) && e.target.tagName !== 'INPUT') {
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
