// ═══════════════════════════════════════════════════════
// Elsie's Spark — Main Entry Point (ES Modules)
// ═══════════════════════════════════════════════════════
import state from './state.js';
import bus from './EventBus.js';
import { $, $$ } from './utils.js';
import { openDB, migrateFromLocalStorage } from './db.js';
import { BACKGROUNDS } from './constants/backgrounds.js';
import { FILE_STICKERS } from './constants/stickers.js';

// Engine
import CanvasManager from './engine/CanvasManager.js';
import { initDrawingEngine } from './engine/DrawingEngine.js';
import ObjectRenderer from './engine/ObjectRenderer.js';
import { updateUndoRedoButtons, pushUndo, undo, redo } from './engine/UndoManager.js';

// Tools (importing also registers bus listeners)
import { renderStickers } from './tools/StickerTool.js';
import { renderShapes } from './tools/ShapeTool.js';
import './tools/SelectTool.js';
import './tools/TextTool.js';

// UI
import { initColorPicker, updateColorSwatch } from './ui/ColorPicker.js';
import { buildBackgroundGrid, initBackgroundManager, applyBackground } from './ui/BackgroundManager.js';
import { initToolbar } from './ui/Toolbar.js';

// Views
import { showView, initViewRouter } from './views/ViewRouter.js';
import { initRoomView, centerRoomPan } from './views/RoomView.js';
import { initGalleryView, renderGallery, loadProfileAvatar } from './views/GalleryView.js';
import { initProfileView } from './views/ProfileView.js';
import { initInspireView } from './views/InspireView.js';

// IO
import { initProjectManager, registerCanvasManager, saveProject, exportPNG, importTraceImage, clearTrace, resetToNewCanvas } from './io/ProjectManager.js';

// ═══════════════════════════════════════════════════════
// WIRE UP BUS EVENTS (cross-module communication)
// ═══════════════════════════════════════════════════════

// ObjectRenderer needs drawObjectTo accessible for ProjectManager
bus._drawObjectTo = ObjectRenderer.drawObjectTo;

bus.on('renderObjects', () => ObjectRenderer.renderObjects());
bus.on('drawSelectionHandles', () => ObjectRenderer.drawSelectionHandles());
bus.on('updateUndoRedoButtons', () => updateUndoRedoButtons());
bus.on('renderLayerList', () => CanvasManager.renderLayerList());
bus.on('setLayerIdCounter', (val) => CanvasManager.setLayerIdCounter(val));
bus.on('applyZoom', () => CanvasManager.applyZoom());
bus.on('fitZoom', () => CanvasManager.fitZoom());
bus.on('applyBackground', (bgId) => applyBackground(bgId));
bus.on('renderGallery', () => renderGallery());
bus.on('addLayer', (name, callback) => {
  const layer = CanvasManager.addLayer(name);
  if (callback) callback(layer);
});

// Undo/Redo
bus.on('pushUndo', () => pushUndo());
bus.on('undo', () => undo());
bus.on('redo', () => redo());

// Object manipulation (SelectTool registers its own listeners, but Toolbar also emits these)
bus.on('deleteSelectedObject', () => ObjectRenderer.deleteSelectedObject());
bus.on('copySelectedObject', () => ObjectRenderer.copySelectedObject());
bus.on('moveSelectedObjectUp', () => ObjectRenderer.moveSelectedObjectUp());
bus.on('moveSelectedObjectDown', () => ObjectRenderer.moveSelectedObjectDown());
bus.on('moveSelectedObjectToFront', () => ObjectRenderer.moveSelectedObjectToFront());
bus.on('moveSelectedObjectToBack', () => ObjectRenderer.moveSelectedObjectToBack());
bus.on('mirrorSelectedObject', () => ObjectRenderer.mirrorSelectedObject());

// IO events
bus.on('saveProject', () => saveProject());
bus.on('exportPNG', () => exportPNG());
bus.on('importTraceImage', (file) => importTraceImage(file));
bus.on('clearTrace', () => clearTrace());
bus.on('resetToNewCanvas', () => resetToNewCanvas());

// Canvas events
bus.on('clearPreviewCanvas', () => {
  CanvasManager.previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
});

// Text tool entry via bus
import { enterTextMode } from './tools/TextTool.js';
bus.on('enterTextMode', (text, font, size, bold, italic) => enterTextMode(text, font, size, bold, italic));

// ═══════════════════════════════════════════════════════
// DYNAMIC ASSET LOADING
// ═══════════════════════════════════════════════════════
function loadDynamicStickers() {
  fetch('assets/stickers/manifest.json')
    .then(r => r.ok ? r.json() : [])
    .then(files => {
      FILE_STICKERS.length = 0;
      files.forEach(f => {
        FILE_STICKERS.push({
          name: f.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '),
          src: 'assets/stickers/' + f,
        });
      });
      renderStickers();
    })
    .catch(() => {});
}

function loadDynamicBackgrounds() {
  fetch('assets/backgrounds/manifest.json')
    .then(r => r.ok ? r.json() : [])
    .then(files => {
      files.forEach(f => {
        const id = 'img-' + f.replace(/[^a-zA-Z0-9]/g, '_');
        const label = f.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ').substring(0, 16);
        if (!BACKGROUNDS.find(b => b.id === id)) {
          BACKGROUNDS.push({ id, label, style: null, imageSrc: 'assets/backgrounds/' + f });
        }
      });
      buildBackgroundGrid();
    })
    .catch(() => {});
}

// ═══════════════════════════════════════════════════════
// VIEW ENTRY CALLBACKS
// ═══════════════════════════════════════════════════════
bus.on('view:enterDraw', () => {
  if (state.layers.length === 0) {
    CanvasManager.setupCanvas();
    CanvasManager.addLayer('Layer 1');
  }
  CanvasManager.fitZoom();
  updateUndoRedoButtons();
  updateColorSwatch();
});

// Note: view:enterGallery, view:enterProfile, view:enterInspire, view:enterRoom
// are handled by their respective view modules internally.

// ═══════════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════════
async function init() {
  // Initialize canvas manager (sets up DOM references)
  CanvasManager.init();

  // Initialize IndexedDB and migrate from localStorage
  await openDB();
  await migrateFromLocalStorage();

  // Initialize UI modules
  initColorPicker();
  initBackgroundManager();
  buildBackgroundGrid();
  renderStickers();
  renderShapes();

  // Initialize engine modules
  initDrawingEngine();

  // Initialize IO
  registerCanvasManager(CanvasManager);
  initProjectManager();

  // Initialize views
  initViewRouter();
  initRoomView();
  initGalleryView();
  initProfileView();
  initInspireView();

  // Initialize toolbar (event bindings)
  initToolbar();

  // Show initial view
  showView('room');

  // Load dynamic assets
  loadDynamicStickers();
  loadDynamicBackgrounds();
}

init();
