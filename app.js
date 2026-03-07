(function () {
  'use strict';

  // ── Daily Prompts ─────────────────────────────────────
  const PROMPTS = [
    "Draw your favourite animal wearing a hat",
    "A cozy treehouse with fairy lights",
    "An underwater tea party",
    "A cat riding a skateboard",
    "Your dream garden",
    "A cloud shaped like something funny",
    "A tiny dragon baking cookies",
    "A robot walking a dog",
    "Sunset over a candy landscape",
    "A penguin at the beach",
    "An enchanted forest path",
    "A house made of books",
    "A friendly monster under the bed",
    "Your breakfast as a character",
    "A snail racing a turtle",
    "A wizard's messy desk",
    "A bird delivering mail",
    "An alien visiting a farm",
    "A superhero with a silly power",
    "Dancing mushrooms in the rain",
    "A sleeping fox in autumn leaves",
    "A ship sailing through clouds",
    "A frog prince at a ball",
    "Your pet as a secret agent",
    "A bicycle made of flowers",
    "An owl reading by candlelight",
    "Goldfish in outer space",
    "A haunted gingerbread house",
    "A bear having a picnic",
    "Mountains made of pillows",
    "A submarine shaped like a whale",
    "A fairy fixing a rainbow",
    "Your shoe as a tiny house",
    "A horse with butterfly wings",
    "Rainy day through a window",
    "A cactus wearing sunglasses",
    "An octopus juggling",
    "A ladybug's birthday party",
    "Northern lights over an igloo",
    "A mouse exploring a library",
    "A hot air balloon festival",
    "A gnome tending a garden",
    "Your hand holding something magical",
    "A lighthouse in a storm",
    "A chameleon on a rainbow",
    "A duck in a top hat",
    "An elephant painting a picture",
    "A mermaid's treasure collection",
    "Fireworks over a small town",
    "A bunny astronaut on the moon",
    "A steampunk teapot",
    "Butterflies migrating at sunset",
    "A fox and a crow sharing lunch",
    "A yeti making a snow angel",
    "A pirate map to something silly",
    "A hedgehog in a leaf boat",
    "A phoenix rising from campfire",
    "Jellyfish lanterns in the deep sea",
    "A deer wearing a scarf",
    "A miniature city in a terrarium",
    "Wolves howling at a disco ball",
    "A narwhal with a party hat",
    "A sloth in a hammock",
    "Bees building a honey castle",
    "A Viking ship on a calm lake",
    "Crystals growing in a cave",
    "A koala on a unicycle",
    "A treehouse connected by bridges",
    "Storm in a teacup",
    "A gecko climbing a skyscraper",
    "A polar bear in a flower field",
    "Koi fish in a puddle",
    "A witch's cat mixing potions",
    "A llama wearing a poncho",
    "A giant mushroom village",
    "Paper airplanes in a tornado",
    "A walrus at a jazz club",
    "A field of windmills at dusk",
    "An iguana surfing",
    "A cozy blanket fort",
    "A capybara spa day",
    "A peacock at a fashion show",
    "Origami animals coming to life",
    "A badger's underground kitchen",
    "A hummingbird and a flower talking",
    "Stargazing from a rooftop",
    "A raccoon's treasure hoard",
    "A panda playing in snow",
    "A lamp that lights up dreams",
    "A seal balancing the Earth",
    "Vines growing over an old car",
    "A flamingo ice skating",
    "Tide pools full of tiny worlds",
    "A squirrel's acorn collection",
    "A snowglobe with your town inside",
    "A crow wearing jewellery",
    "A platypus detective",
    "An otter floating with a book",
    "A sandcastle kingdom",
    "A moose in a canoe",
  ];

  // ── Inline SVG Stickers ───────────────────────────────
  const STICKERS = [
    { name: 'star',        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="32,4 40,24 62,26 46,40 50,62 32,50 14,62 18,40 2,26 24,24" fill="#f7c948" stroke="#e6b422" stroke-width="1.5"/></svg>' },
    { name: 'heart',       svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 56 C16 42 4 30 4 18 A14 14 0 0 1 32 14 A14 14 0 0 1 60 18 C60 30 48 42 32 56Z" fill="#e87461" stroke="#c9533f" stroke-width="1.5"/></svg>' },
    { name: 'flower',      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="20" r="10" fill="#f0a0c0"/><circle cx="20" cy="32" r="10" fill="#f0a0c0"/><circle cx="44" cy="32" r="10" fill="#f0a0c0"/><circle cx="26" cy="44" r="10" fill="#f0a0c0"/><circle cx="38" cy="44" r="10" fill="#f0a0c0"/><circle cx="32" cy="32" r="7" fill="#f7c948"/></svg>' },
    { name: 'cloud',       svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40"><ellipse cx="24" cy="26" rx="16" ry="12" fill="white" stroke="#ccc" stroke-width="1"/><ellipse cx="40" cy="24" rx="14" ry="14" fill="white" stroke="#ccc" stroke-width="1"/><ellipse cx="32" cy="14" rx="12" ry="10" fill="white" stroke="#ccc" stroke-width="1"/></svg>' },
    { name: 'moon',        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M40 8 A24 24 0 1 0 40 56 A18 18 0 1 1 40 8Z" fill="#f7e78a" stroke="#d4c35a" stroke-width="1.5"/></svg>' },
    { name: 'rainbow',     svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 44"><path d="M8 40 A32 32 0 0 1 72 40" fill="none" stroke="#e54" stroke-width="4"/><path d="M12 40 A28 28 0 0 1 68 40" fill="none" stroke="#f90" stroke-width="4"/><path d="M16 40 A24 24 0 0 1 64 40" fill="none" stroke="#fd0" stroke-width="4"/><path d="M20 40 A20 20 0 0 1 60 40" fill="none" stroke="#4b4" stroke-width="4"/><path d="M24 40 A16 16 0 0 1 56 40" fill="none" stroke="#48f" stroke-width="4"/><path d="M28 40 A12 12 0 0 1 52 40" fill="none" stroke="#a4e" stroke-width="4"/></svg>' },
    { name: 'sparkle',     svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 2 L36 26 L60 32 L36 38 L32 62 L28 38 L4 32 L28 26 Z" fill="#f7c948" stroke="#d4a820" stroke-width="1"/></svg>' },
    { name: 'butterfly',   svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><ellipse cx="20" cy="22" rx="14" ry="16" fill="#c490e0" stroke="#9060b0" stroke-width="1" transform="rotate(-15 20 22)"/><ellipse cx="44" cy="22" rx="14" ry="16" fill="#c490e0" stroke="#9060b0" stroke-width="1" transform="rotate(15 44 22)"/><ellipse cx="22" cy="42" rx="10" ry="14" fill="#e0a0d0" stroke="#9060b0" stroke-width="1" transform="rotate(-10 22 42)"/><ellipse cx="42" cy="42" rx="10" ry="14" fill="#e0a0d0" stroke="#9060b0" stroke-width="1" transform="rotate(10 42 42)"/><line x1="32" y1="12" x2="32" y2="58" stroke="#555" stroke-width="2"/></svg>' },
    { name: 'leaf',        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M10 54 Q10 20 32 8 Q54 20 54 54 Z" fill="#6ab04c" stroke="#3a7a2c" stroke-width="1.5"/><line x1="32" y1="12" x2="32" y2="54" stroke="#3a7a2c" stroke-width="1.5"/></svg>' },
    { name: 'music',       svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><ellipse cx="18" cy="50" rx="10" ry="7" fill="#555"/><ellipse cx="50" cy="44" rx="10" ry="7" fill="#555"/><line x1="28" y1="50" x2="28" y2="10" stroke="#555" stroke-width="3"/><line x1="60" y1="44" x2="60" y2="8" stroke="#555" stroke-width="3"/><path d="M28 10 Q44 4 60 8" fill="none" stroke="#555" stroke-width="3"/></svg>' },
  ];

  // ── File-based stickers (PNG assets) ─────────────────
  // Dynamically loaded from assets/stickers/manifest.json
  let FILE_STICKERS = [];

  // ── Backgrounds ───────────────────────────────────────
  const BACKGROUNDS = [
    { id: 'white',   label: 'White',    style: '#ffffff' },
    { id: 'cream',   label: 'Cream',    style: '#fdf6e3' },
    { id: 'grid',    label: 'Grid',     style: null,    pattern: 'grid' },
    { id: 'dots',    label: 'Dots',     style: null,    pattern: 'dots' },
    { id: 'lined',   label: 'Lined',    style: null,    pattern: 'lined' },
    { id: 'sunset',  label: 'Sunset',   style: 'linear-gradient(160deg, #fce4ec 0%, #f8bbd0 50%, #f48fb1 100%)' },
    { id: 'ocean',   label: 'Ocean',    style: 'linear-gradient(160deg, #e0f7fa 0%, #80deea 50%, #00bcd4 100%)' },
    { id: 'forest',  label: 'Forest',   style: 'linear-gradient(160deg, #f1f8e9 0%, #c5e1a5 50%, #8bc34a 100%)' },
    { id: 'dusk',    label: 'Dusk',     style: 'linear-gradient(160deg, #311b92 0%, #7b1fa2 50%, #e91e63 100%)' },
    { id: 'candy',   label: 'Candy',    style: 'linear-gradient(160deg, #fff9c4 0%, #f8bbd0 50%, #e1bee7 100%)' },
    { id: 'sky',     label: 'Sky',      style: 'linear-gradient(180deg, #bbdefb 0%, #e3f2fd 60%, #fff9c4 100%)' },
    { id: 'dark',    label: 'Night',    style: '#1a1a2e' },
  ];

  // ── State ─────────────────────────────────────────────
  const state = {
    // Views
    currentView: 'room',
    openSheet: null,
    // Canvas
    canvasWidth: 1080,
    canvasHeight: 1080,
    zoom: 1,
    panX: 0,
    panY: 0,
    fitZoomLevel: 1,
    // Tools
    activeBrush: 'pen',
    brushSize: 4,
    brushOpacity: 1,
    color: '#222222',
    // Layers
    layers: [],
    activeLayerId: null,
    // Undo
    undoStack: [],
    redoStack: [],
    maxUndoSteps: 30,
    // Drawing
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    lastMidX: 0,
    lastMidY: 0,
    traceImage: null,
    strokePoints: [],
    scratchCanvas: null,
    scratchCtx: null,
    preStrokeCanvas: null,
    preStrokeCtx: null,
    directDraw: false,
    // Stickers
    stickerMode: null,
    stickerPos: null,
    stickerDragging: false,
    stickerRotation: 0,
    // Text tool
    textMode: null,   // { text, font, size, bold, italic }
    textPos: null,
    textDragging: false,
    // Select tool
    selectMode: false,
    selectedObject: null,
    selectDrag: null,  // { type, startX, startY, origX, origY, origSize, origFontSize, origRotation }
    // Color picker
    spectrumHue: 0,
    spectrumS: 0,
    spectrumL: 13,
    savedSwatches: [],
    // Background
    selectedBackground: 'white',
  };

  // ── DOM helpers ───────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // Canvas elements (resolved after DOM ready)
  let container, traceCanvas, traceCtx, previewCanvas, previewCtx;
  let objectsCanvas, objectsCtx;

  // ── Counters ────────────────────────────────────────────
  let layerIdCounter = 0;
  let objectIdCounter = 0;

  // ═══════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════
  function init() {
    container     = $('#canvas-container');
    traceCanvas   = $('#trace-canvas');
    traceCtx      = traceCanvas.getContext('2d');
    objectsCanvas = $('#objects-canvas');
    objectsCtx    = objectsCanvas.getContext('2d');
    previewCanvas = $('#preview-canvas');
    previewCtx    = previewCanvas.getContext('2d');

    loadSavedSwatches();
    renderSavedSwatches();
    buildColorGrid();
    buildBackgroundGrid();
    renderStickers();
    loadCustomGradients();
    bindEvents();
    showView('room');
    // Load dynamic assets (stickers & background images from folders)
    loadDynamicStickers();
    loadDynamicBackgrounds();
  }

  function loadDynamicStickers() {
    fetch('assets/stickers/manifest.json')
      .then(r => r.ok ? r.json() : [])
      .then(files => {
        FILE_STICKERS = files.map(f => ({
          name: f.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '),
          src: 'assets/stickers/' + f,
        }));
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
  // VIEW ROUTER
  // ═══════════════════════════════════════════════════════
  function showView(id) {
    $$('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + id).classList.add('active');
    state.currentView = id;
    if (id === 'draw')    onEnterDraw();
    if (id === 'gallery') onEnterGallery();
    if (id === 'profile') onEnterProfile();
    if (id === 'room')    centerRoomPan();
  }

  // ═══════════════════════════════════════════════════════
  // ROOM HORIZONTAL PAN
  // ═══════════════════════════════════════════════════════
  let roomPanX = 0, roomPanMin = 0, roomPanReady = false;

  function centerRoomPan() {
    if (!roomPanReady) return;
    const scene = $('#room-scene');
    const pan = $('#room-pan');
    roomPanMin = scene.clientWidth - pan.scrollWidth;
    roomPanX = roomPanMin / 2; // center
    pan.style.transform = 'translateX(' + roomPanX + 'px)';
  }

  function initRoomPan() {
    const scene = $('#room-scene');
    const pan = $('#room-pan');
    const img = $('#room-bg');
    let dragging = false, startX = 0, startPanX = 0, movedDistance = 0;

    // Once image loads, size the pan container and center it
    function onReady() {
      const ratio = img.naturalWidth / img.naturalHeight;
      const panW = scene.clientHeight * ratio;
      pan.style.width = panW + 'px';
      roomPanMin = scene.clientWidth - panW;
      roomPanX = roomPanMin / 2; // center
      pan.style.transform = 'translateX(' + roomPanX + 'px)';
      roomPanReady = true;
    }

    if (img.complete && img.naturalWidth) onReady();
    else img.addEventListener('load', onReady);
    window.addEventListener('resize', () => { if (roomPanReady) onReady(); });

    // Suppress clicks on hotspots if we were dragging
    scene.addEventListener('click', e => {
      if (movedDistance > 8) {
        e.stopPropagation();
        e.preventDefault();
      }
    }, true);

    scene.addEventListener('pointerdown', e => {
      movedDistance = 0;
      // Don't start pan if clicking on a hotspot button
      if (e.target.closest('.room-hotspot')) return;
      if (roomPanMin >= 0) return; // image fits, no pan needed
      dragging = true;
      startX = e.clientX;
      startPanX = roomPanX;
      pan.style.transition = 'none';
    });

    scene.addEventListener('pointermove', e => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      movedDistance = Math.abs(dx);
      roomPanX = Math.max(roomPanMin, Math.min(0, startPanX + dx));
      pan.style.transform = 'translateX(' + roomPanX + 'px)';
    });

    scene.addEventListener('pointerup', () => { dragging = false; });
    scene.addEventListener('pointercancel', () => { dragging = false; });
  }

  function onEnterDraw() {
    // First entry: set up canvas
    if (state.layers.length === 0) {
      setupCanvas();
      addLayer('Layer 1');
    }
    showDailyPrompt();
    fitZoom();
    updateUndoRedoButtons();
    updateColorSwatch();
  }

  function onEnterProfile() {
    const canvas = $('#profile-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const saved = localStorage.getItem('elsie-profile-pic');
    if (saved) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = saved;
    }
  }

  function onEnterGallery() {
    loadProfileAvatar();
    renderGallery();
  }

  // ═══════════════════════════════════════════════════════
  // CANVAS SETUP & ZOOM
  // ═══════════════════════════════════════════════════════
  function setupCanvas() {
    const area = $('#canvas-area');
    const pad = 10;
    const w = Math.floor((area ? area.clientWidth  : 390) - pad);
    const h = Math.floor((area ? area.clientHeight : 600) - pad);
    state.canvasWidth  = w;
    state.canvasHeight = h;
    traceCanvas.width   = w;
    traceCanvas.height  = h;
    objectsCanvas.width = w;
    objectsCanvas.height = h;
    previewCanvas.width = w;
    previewCanvas.height = h;
    applyBackground(state.selectedBackground);
  }

  function fitZoom() {
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;
    state.fitZoomLevel = 1;
    applyZoom();
  }

  function applyZoom() {
    if (!container) return;
    const area = $('#canvas-area');
    const areaW = area.clientWidth;
    const areaH = area.clientHeight;
    // Container is native canvas size; transform handles zoom + pan
    container.style.width  = state.canvasWidth + 'px';
    container.style.height = state.canvasHeight + 'px';
    [traceCanvas, objectsCanvas, previewCanvas, ...state.layers.map(l => l.canvas)]
      .filter(Boolean)
      .forEach(c => { c.style.width = state.canvasWidth + 'px'; c.style.height = state.canvasHeight + 'px'; });
    // Center in area, then apply pan offset
    const tx = (areaW - state.canvasWidth * state.zoom) / 2 + state.panX;
    const ty = (areaH - state.canvasHeight * state.zoom) / 2 + state.panY;
    container.style.transformOrigin = '0 0';
    container.style.transform = `translate(${tx}px, ${ty}px) scale(${state.zoom})`;
    const resetBtn = $('#btn-zoom-reset');
    if (resetBtn) {
      const atFit = Math.abs(state.zoom - (state.fitZoomLevel || state.zoom)) < 0.005
                 && Math.abs(state.panX) < 1 && Math.abs(state.panY) < 1;
      resetBtn.classList.toggle('hidden', atFit);
    }
  }

  // ═══════════════════════════════════════════════════════
  // LAYER SYSTEM
  // ═══════════════════════════════════════════════════════
  function addLayer(name) {
    const id = ++layerIdCounter;
    const canvas = document.createElement('canvas');
    canvas.width  = state.canvasWidth;
    canvas.height = state.canvasHeight;
    canvas.className = 'drawing-canvas';
    canvas.style.zIndex = id;
    container.insertBefore(canvas, previewCanvas);
    const ctx = canvas.getContext('2d');
    const layer = { id, name: name || `Layer ${id}`, canvas, ctx, visible: true, opacity: 1, objects: [] };
    state.layers.push(layer);
    state.activeLayerId = id;
    renderLayerList();
    return layer;
  }

  function removeLayer(id) {
    if (state.layers.length <= 1) return;
    const idx = state.layers.findIndex(l => l.id === id);
    if (idx === -1) return;
    state.layers[idx].canvas.remove();
    state.layers.splice(idx, 1);
    if (state.activeLayerId === id) {
      state.activeLayerId = state.layers[Math.min(idx, state.layers.length - 1)].id;
    }
    renderLayerList();
    pushUndo();
  }

  function getActiveLayer() {
    return state.layers.find(l => l.id === state.activeLayerId);
  }

  function renderLayerList() {
    const list = $('#layer-list');
    if (!list) return;
    list.innerHTML = '';
    for (let i = state.layers.length - 1; i >= 0; i--) {
      const l = state.layers[i];
      const pct = Math.round((l.opacity ?? 1) * 100);
      const li = document.createElement('li');
      li.className = 'layer-item' + (l.id === state.activeLayerId ? ' active' : '');
      li.innerHTML = `
        <div class="layer-row">
          <input type="checkbox" class="layer-visibility" ${l.visible ? 'checked' : ''}>
          <span class="layer-name">${l.name}</span>
          <button class="layer-delete">&times;</button>
        </div>
        <div class="layer-opacity-row">
          <label class="layer-opacity-label">Opacity</label>
          <input type="range" class="layer-opacity-slider" min="0" max="100" value="${pct}">
          <span class="layer-opacity-val">${pct}%</span>
        </div>
      `;
      li.querySelector('.layer-name').addEventListener('click', () => {
        state.activeLayerId = l.id;
        renderLayerList();
      });
      li.querySelector('.layer-visibility').addEventListener('change', e => {
        l.visible = e.target.checked;
        l.canvas.style.display = l.visible ? '' : 'none';
        renderObjects();
      });
      li.querySelector('.layer-delete').addEventListener('click', () => removeLayer(l.id));
      li.querySelector('.layer-opacity-slider').addEventListener('input', e => {
        l.opacity = parseInt(e.target.value) / 100;
        l.canvas.style.opacity = l.opacity;
        li.querySelector('.layer-opacity-val').textContent = e.target.value + '%';
        renderObjects();
      });
      list.appendChild(li);
    }
  }

  // ═══════════════════════════════════════════════════════
  // UNDO / REDO
  // ═══════════════════════════════════════════════════════
  function captureState() {
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

  function pushUndo() {
    state.undoStack.push(captureState());
    if (state.undoStack.length > state.maxUndoSteps) state.undoStack.shift();
    state.redoStack = [];
    updateUndoRedoButtons();
  }

  function undo() {
    if (!state.undoStack.length) return;
    state.redoStack.push(captureState());
    restoreState(state.undoStack.pop());
    updateUndoRedoButtons();
  }

  function redo() {
    if (!state.redoStack.length) return;
    state.undoStack.push(captureState());
    restoreState(state.redoStack.pop());
    updateUndoRedoButtons();
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
    renderLayerList();
    renderObjects();
  }

  function updateUndoRedoButtons() {
    const u = $('#btn-undo'), r = $('#btn-redo');
    if (u) u.style.opacity = state.undoStack.length ? '1' : '0.35';
    if (r) r.style.opacity = state.redoStack.length ? '1' : '0.35';
  }

  // ═══════════════════════════════════════════════════════
  // MULTI-TOUCH TRACKING
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

  function trackPointer(e)   { touch.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY }); }
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
  // DRAWING ENGINE
  // ═══════════════════════════════════════════════════════
  function getCanvasPos(e) {
    const rect = previewCanvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (state.canvasWidth  / rect.width),
      y: (e.clientY - rect.top)  * (state.canvasHeight / rect.height),
    };
  }

  function compositeScratchToLayer(layer, brush) {
    const ctx = layer.ctx;
    // Restore pre-stroke state using drawImage (GPU-batched, no render flush)
    ctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
    ctx.drawImage(state.preStrokeCanvas, 0, 0);
    // Composite scratch canvas with desired opacity and blend mode
    ctx.save();
    ctx.globalAlpha = brush === 'marker' ? state.brushOpacity * 0.5 : state.brushOpacity;
    if (brush === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else if (brush === 'marker') {
      ctx.globalCompositeOperation = 'multiply';
    }
    ctx.drawImage(state.scratchCanvas, 0, 0);
    ctx.restore();
  }

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

    // ── Select mode ──
    if (state.selectMode) {
      const pos = getCanvasPos(e);
      const handle = hitTestHandle(pos.x, pos.y);
      if (handle) {
        pushUndo();
        const obj = state.selectedObject;
        state.selectDrag = {
          type: handle, startX: pos.x, startY: pos.y,
          origX: obj.x, origY: obj.y,
          origSize: obj.size || obj.fontSize || obj.scale || 1,
          origRotation: obj.rotation,
        };
      } else {
        const hit = hitTestObjects(pos.x, pos.y);
        if (hit) {
          pushUndo();
          state.selectedObject = hit;
          state.selectDrag = {
            type: 'move', startX: pos.x, startY: pos.y,
            origX: hit.x, origY: hit.y,
            origSize: hit.size || hit.fontSize || hit.scale || 1,
            origRotation: hit.rotation,
          };
          previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
          drawSelectionHandles();
        } else {
          state.selectedObject = null;
          state.selectDrag = null;
          previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
          renderObjects();
        }
      }
      return;
    }
    if (state.textMode) {
      const pos = getCanvasPos(e);
      state.textPos = pos;
      state.textDragging = true;
      drawTextPreview();
      return;
    }
    if (state.stickerMode) {
      const pos = getCanvasPos(e);
      state.stickerPos = pos;
      state.stickerDragging = true;
      drawStickerPreview();
      return;
    }
    const layer = getActiveLayer();
    if (!layer || !layer.visible) return;
    pushUndo();
    state.isDrawing = true;
    const pos = getCanvasPos(e);
    state.lastX = pos.x;
    state.lastY = pos.y;
    state.lastMidX = pos.x;
    state.lastMidY = pos.y;
    state.strokePoints = [pos];
    const brush = state.activeBrush;
    // Pen at full opacity: draw directly to layer (no scratch canvas needed)
    state.directDraw = (brush === 'pen' && state.brushOpacity >= 1);
    if (brush === 'pen' || brush === 'marker' || brush === 'eraser') {
      // Always save pre-stroke state for pen/marker so we can convert to object
      if (brush === 'pen' || brush === 'marker') {
        if (!state.preStrokeCanvas) {
          state.preStrokeCanvas = document.createElement('canvas');
          state.preStrokeCtx = state.preStrokeCanvas.getContext('2d');
        }
        state.preStrokeCanvas.width = state.canvasWidth;
        state.preStrokeCanvas.height = state.canvasHeight;
        state.preStrokeCtx.drawImage(layer.canvas, 0, 0);
      }
      if (state.directDraw) {
        // Direct draw: just draw the dot on the layer
        const ctx = layer.ctx;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = state.brushSize;
        ctx.strokeStyle = state.color;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.restore();
      } else {
        // Set up scratch canvas for opacity-correct rendering
        if (!state.scratchCanvas) {
          state.scratchCanvas = document.createElement('canvas');
          state.scratchCtx = state.scratchCanvas.getContext('2d');
        }
        state.scratchCanvas.width = state.canvasWidth;
        state.scratchCanvas.height = state.canvasHeight;
        // Save pre-stroke state as a canvas (GPU-friendly, avoids putImageData flicker)
        if (!state.preStrokeCanvas) {
          state.preStrokeCanvas = document.createElement('canvas');
          state.preStrokeCtx = state.preStrokeCanvas.getContext('2d');
        }
        state.preStrokeCanvas.width = state.canvasWidth;
        state.preStrokeCanvas.height = state.canvasHeight;
        state.preStrokeCtx.drawImage(layer.canvas, 0, 0);
        // Draw initial dot on scratch canvas
        const sctx = state.scratchCtx;
        sctx.lineCap = 'round';
        sctx.lineJoin = 'round';
        sctx.lineWidth = state.brushSize;
        sctx.strokeStyle = brush === 'eraser' ? '#fff' : state.color;
        sctx.beginPath();
        sctx.moveTo(pos.x, pos.y);
        sctx.lineTo(pos.x, pos.y);
        sctx.stroke();
        // Composite scratch onto layer
        compositeScratchToLayer(layer, brush);
      }
    } else if (brush === 'sprinkles') {
      drawSprinkle(layer.ctx, pos.x, pos.y);
    } else if (brush === 'fairylights') {
      drawFairyLight(layer.ctx, pos.x, pos.y);
    }
  }

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
        const rect = previewCanvas.getBoundingClientRect();
        state.stickerPos = {
          x: (pinch.midX - rect.left) * (state.canvasWidth  / rect.width),
          y: (pinch.midY - rect.top)  * (state.canvasHeight / rect.height),
        };
        drawStickerPreview();
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
        applyZoom();
      }
      return;
    }

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
        const scale = Math.max(0.1, dist1 / dist0);
        if (obj.type === 'sticker') {
          obj.size = Math.max(16, Math.min(600, d.origSize * scale));
        } else if (obj.type === 'text') {
          obj.fontSize = Math.max(12, Math.min(300, Math.round(d.origSize * scale)));
        } else if (obj.type === 'stroke') {
          obj.scale = Math.max(0.1, Math.min(10, d.origSize * scale));
        }
      }
      previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
      renderObjects();
      return;
    }
    if (state.textMode && state.textDragging) {
      state.textPos = getCanvasPos(e);
      drawTextPreview();
      return;
    }
    if (state.stickerMode) {
      state.stickerPos = getCanvasPos(e);
      drawStickerPreview();
      return;
    }
    if (!state.isDrawing) return;
    const layer = getActiveLayer();
    if (!layer) return;
    const pos = getCanvasPos(e);
    state.strokePoints.push(pos);
    const ctx   = layer.ctx;
    const brush = state.activeBrush;

    if (brush === 'pen' || brush === 'marker' || brush === 'eraser') {
      if (state.directDraw) {
        // Direct draw: draw just this segment onto the layer
        const ctx = layer.ctx;
        const midX = (state.lastX + pos.x) / 2;
        const midY = (state.lastY + pos.y) / 2;
        ctx.save();
        ctx.lineCap  = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = state.brushSize;
        ctx.strokeStyle = state.color;
        ctx.beginPath();
        ctx.moveTo(state.lastMidX, state.lastMidY);
        ctx.quadraticCurveTo(state.lastX, state.lastY, midX, midY);
        ctx.stroke();
        ctx.restore();
        state.lastMidX = midX;
        state.lastMidY = midY;
      } else {
        // Scratch canvas path: redraw entire stroke each frame
        const sctx = state.scratchCtx;
        sctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
        sctx.lineCap  = 'round';
        sctx.lineJoin = 'round';
        sctx.lineWidth = state.brushSize;
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
        compositeScratchToLayer(layer, brush);
      }
    } else if (brush === 'sprinkles') {
      drawSprinkle(ctx, pos.x, pos.y);
    } else if (brush === 'vine') {
      drawVineSegment(ctx, state.lastX, state.lastY, pos.x, pos.y);
    } else if (brush === 'fairylights') {
      drawFairyLightSegment(ctx, state.lastX, state.lastY, pos.x, pos.y);
      drawFairyLight(ctx, pos.x, pos.y);
    }
    state.lastX = pos.x;
    state.lastY = pos.y;
  }

  function endStroke(e) {
    untrackPointer(e);
    if (state.selectMode && state.selectDrag) {
      if (state.selectDrag.type !== 'move' || state.selectDrag.startX !== state.selectedObject?.x) {
        // Object was modified — push undo
        // (undo was already captured in the next startStroke that modifies)
      }
      state.selectDrag = null;
      return;
    }
    if (state.textMode && state.textDragging && !touch.isGesture) {
      commitText();
      return;
    }
    if (state.stickerMode && state.stickerDragging && !touch.isGesture) {
      commitSticker();
      return;
    }
    if (touch.pointers.size === 0) touch.isGesture = false;
    // Final composite for clean stroke end
    if (state.isDrawing && state.strokePoints.length > 0) {
      const layer = getActiveLayer();
      if (layer) {
        const brush = state.activeBrush;
        if (brush === 'pen' || brush === 'marker' || brush === 'eraser') {
          if (state.directDraw) {
            // Direct draw: draw final segment
            const ctx = layer.ctx;
            ctx.save();
            ctx.lineCap  = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = state.brushSize;
            ctx.strokeStyle = state.color;
            ctx.beginPath();
            ctx.moveTo(state.lastMidX, state.lastMidY);
            ctx.lineTo(state.lastX, state.lastY);
            ctx.stroke();
            ctx.restore();
          } else {
            // Scratch canvas: final full-path composite
            const sctx = state.scratchCtx;
            sctx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
            sctx.lineCap  = 'round';
            sctx.lineJoin = 'round';
            sctx.lineWidth = state.brushSize;
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
            compositeScratchToLayer(layer, brush);
          }
        }
        // Convert pen/marker strokes to selectable objects
        if ((brush === 'pen' || brush === 'marker') && state.strokePoints.length > 0) {
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
          layer.objects.push({
            id: ++objectIdCounter, type: 'stroke',
            x: cx, y: cy, rotation: 0, scale: 1,
            points: relPoints,
            color: state.color,
            brushSize: state.brushSize,
            opacity: state.brushOpacity,
            brush: brush,
            baseWidth: maxX - minX + state.brushSize * 2,
            baseHeight: maxY - minY + state.brushSize * 2,
          });
          renderObjects();
        }
      }
    }
    state.isDrawing = false;
    state.strokePoints = [];
    state.directDraw = false;
  }

  // ── Procedural Brushes ────────────────────────────────
  function drawSprinkle(ctx, x, y) {
    const count = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < count; i++) {
      ctx.save();
      ctx.globalAlpha = state.brushOpacity;
      const spread = state.brushSize * 3;
      const sx = x + (Math.random() - 0.5) * spread;
      const sy = y + (Math.random() - 0.5) * spread;
      const r  = Math.random() * state.brushSize * 0.5 + 1;
      const shapes = ['circle', 'rect', 'line'];
      const shape  = shapes[Math.floor(Math.random() * shapes.length)];
      const hShift = Math.floor(Math.random() * 60) - 30;
      ctx.fillStyle   = shiftHue(state.color, hShift);
      ctx.strokeStyle = shiftHue(state.color, hShift);
      ctx.lineWidth   = Math.max(1, r * 0.5);
      if (shape === 'circle') {
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      } else if (shape === 'rect') {
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(Math.random() * Math.PI);
        ctx.fillRect(-r, -r * 0.4, r * 2, r * 0.8);
        ctx.restore();
      } else {
        const angle = Math.random() * Math.PI;
        ctx.beginPath();
        ctx.moveTo(sx - Math.cos(angle) * r, sy - Math.sin(angle) * r);
        ctx.lineTo(sx + Math.cos(angle) * r, sy + Math.sin(angle) * r);
        ctx.lineCap = 'round';
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawVineSegment(ctx, x1, y1, x2, y2) {
    ctx.save();
    ctx.globalAlpha = state.brushOpacity;
    ctx.strokeStyle = shiftHue(state.color, -10);
    ctx.lineWidth   = Math.max(1, state.brushSize * 0.4);
    ctx.lineCap     = 'round';
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const amp  = state.brushSize * 1.5;
    const steps = Math.max(2, Math.floor(dist));
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t   = i / steps;
      const bx  = x1 + (x2 - x1) * t;
      const by  = y1 + (y2 - y1) * t;
      const px  = -(y2 - y1) / (dist || 1);
      const py  =  (x2 - x1) / (dist || 1);
      const w   = Math.sin((state.strokePoints.length + i) * 0.08) * amp;
      if (i === 0) ctx.moveTo(bx + px * w, by + py * w);
      else         ctx.lineTo(bx + px * w, by + py * w);
    }
    ctx.stroke();
    if (Math.random() < 0.15) {
      const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * amp * 2;
      const my = (y1 + y2) / 2 + (Math.random() - 0.5) * amp * 2;
      ctx.fillStyle = shiftHue(state.color, 20);
      ctx.beginPath();
      ctx.ellipse(mx, my, state.brushSize * 0.8, state.brushSize * 0.3, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawFairyLightSegment(ctx, x1, y1, x2, y2) {
    ctx.save();
    ctx.globalAlpha  = state.brushOpacity * 0.6;
    ctx.strokeStyle  = state.color;
    ctx.lineWidth    = Math.max(1, state.brushSize * 0.2);
    ctx.setLineDash([4, 4]);
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const sag  = state.brushSize * 0.8;
    const px   = -(y2 - y1) / (dist || 1);
    const py   =  (x2 - x1) / (dist || 1);
    const cx   = (x1 + x2) / 2 + px * sag * Math.sin(state.strokePoints.length * 0.1);
    const cy   = (y1 + y2) / 2 + py * sag * Math.sin(state.strokePoints.length * 0.1);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(cx, cy, x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawFairyLight(ctx, x, y) {
    if (Math.random() > 0.3) return;
    const r = state.brushSize * 0.6 + Math.random() * state.brushSize * 0.4;
    const colors = ['#f7c948','#e87461','#7ec8e3','#f0a0c0','#6ab04c','#ffffff'];
    const c = colors[Math.floor(Math.random() * colors.length)];
    ctx.save();
    ctx.globalAlpha  = state.brushOpacity * 0.8;
    ctx.fillStyle    = c;
    ctx.shadowColor  = c;
    ctx.shadowBlur   = r * 2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── Color helpers ─────────────────────────────────────
  function shiftHue(hex, amount) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const hsl = rgbToHsl(r, g, b);
    hsl[0] = (hsl[0] + amount / 360 + 1) % 1;
    const rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
    return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if      (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else                h = ((r - g) / d + 4) / 6;
    }
    return [h, s, l];
  }

  function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  function hslToHex(h, s, l) {
    const rgb = hslToRgb(h / 360, s / 100, l / 100);
    return '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('');
  }

  function hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const [h, s, l] = rgbToHsl(r, g, b);
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  // ── Set color globally ────────────────────────────────
  function setColor(hex) {
    state.color = hex;
    updateColorSwatch();
    syncSlidersTabs(hex);
    updateColorGridSelection();
  }

  function updateColorSwatch() {
    const sw = $('#tb-color-swatch');
    if (!sw) return;
    sw.style.background = state.color;
    sw.style.backgroundClip = 'padding-box';
    sw.style.boxShadow = 'inset 0 0 0 2.5px white';
  }

  // ═══════════════════════════════════════════════════════
  // COLOR PICKER
  // ═══════════════════════════════════════════════════════

  // ── Grid tab ─────────────────────────────────────────
  function buildColorGrid() {
    const grid = $('#color-grid');
    if (!grid) return;
    grid.innerHTML = '';
    // Grayscale column
    const grays = [100, 90, 75, 62, 50, 38, 25, 12, 5, 0];
    grays.forEach(l => {
      const c = hslToHex(0, 0, l);
      grid.appendChild(makeColorCell(c));
    });
    // Hue columns (12 hues × 10 lightnesses)
    const hues = [0, 20, 40, 60, 90, 140, 180, 210, 240, 270, 300, 330, 355];
    const lights = [95, 85, 75, 65, 55, 45, 35, 25, 15, 6];
    hues.forEach(h => {
      lights.forEach(l => {
        const c = hslToHex(h, 75, l);
        grid.appendChild(makeColorCell(c));
      });
    });
  }

  function makeColorCell(hex) {
    const el = document.createElement('div');
    el.className = 'color-cell';
    el.style.background = hex;
    if (hex === state.color) el.classList.add('selected');
    el.addEventListener('click', () => { setColor(hex); closeSheet(); });
    el.dataset.color = hex;
    return el;
  }

  function updateColorGridSelection() {
    $$('.color-cell').forEach(el => {
      el.classList.toggle('selected', el.dataset.color === state.color);
    });
  }

  // ── Spectrum tab ──────────────────────────────────────
  let spectrumDragging = false;
  let hueDragging = false;

  function drawSpectrum() {
    const canvas = $('#spectrum-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = canvas.offsetWidth * window.devicePixelRatio || 300;
    const h = canvas.height = canvas.offsetHeight * window.devicePixelRatio || 180;
    canvas.style.width  = (canvas.width  / window.devicePixelRatio) + 'px';
    canvas.style.height = (canvas.height / window.devicePixelRatio) + 'px';

    // White → current hue (left-right), then black overlay (top-bottom)
    const hue = state.spectrumHue;
    const gradH = ctx.createLinearGradient(0, 0, w, 0);
    gradH.addColorStop(0, `hsl(${hue},0%,100%)`);
    gradH.addColorStop(1, `hsl(${hue},100%,50%)`);
    ctx.fillStyle = gradH;
    ctx.fillRect(0, 0, w, h);
    const gradV = ctx.createLinearGradient(0, 0, 0, h);
    gradV.addColorStop(0, 'rgba(0,0,0,0)');
    gradV.addColorStop(1, 'rgba(0,0,0,1)');
    ctx.fillStyle = gradV;
    ctx.fillRect(0, 0, w, h);
    updateSpectrumCursor();
  }

  function drawHueBar() {
    const canvas = $('#hue-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = canvas.offsetWidth  * window.devicePixelRatio || 300;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio || 22;
    canvas.style.width  = (canvas.width  / window.devicePixelRatio) + 'px';
    canvas.style.height = (canvas.height / window.devicePixelRatio) + 'px';
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    for (let i = 0; i <= 360; i += 30) {
      grad.addColorStop(i / 360, `hsl(${i},100%,50%)`);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    updateHueCursor();
  }

  function updateSpectrumCursor() {
    const cursor  = $('#spectrum-cursor');
    const wrapper = $('#spectrum-wrapper');
    if (!cursor || !wrapper) return;
    const w = wrapper.clientWidth, h = wrapper.querySelector('canvas').offsetHeight;
    // S goes 0-100 (left=0, right=100), L goes 0-100 (bottom=100, top=0) but in HSV terms:
    // We use S and a brightness value
    const x = (state.spectrumS / 100) * w;
    const y = (1 - (state.spectrumL / 100)) * h;
    cursor.style.left = x + 'px';
    cursor.style.top  = y + 'px';
    cursor.style.background = state.color;
  }

  function updateHueCursor() {
    const cursor  = $('#hue-cursor');
    const wrapper = $('#hue-wrapper');
    if (!cursor || !wrapper) return;
    cursor.style.left = (state.spectrumHue / 360) * wrapper.clientWidth + 'px';
  }

  function pickFromSpectrum(e) {
    const canvas = $('#spectrum-canvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top,  rect.height));
    state.spectrumS = Math.round((x / rect.width)  * 100);
    const brightness = Math.round((1 - y / rect.height) * 100);
    // Convert HSV-like (hue, S, brightness) to HSL
    const hue  = state.spectrumHue;
    const s    = state.spectrumS;
    const v    = brightness;
    const lRaw = v * (2 - s / 100) / 2;
    const sHSL = lRaw === 0 || lRaw === 100 ? 0 : (v - lRaw) / Math.min(lRaw, 100 - lRaw) * 100;
    state.spectrumL = Math.round(lRaw);
    const hex = hslToHex(hue, Math.round(sHSL), Math.round(lRaw));
    state.color = hex;
    updateColorSwatch();
    updateSpectrumCursor();
    updateSlidersFromColor();
  }

  function pickFromHueBar(e) {
    const canvas = $('#hue-canvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    state.spectrumHue = Math.round((x / rect.width) * 360);
    updateHueCursor();
    drawSpectrum();
    // Re-pick from the same relative position in spectrum
    const hex = hslToHex(state.spectrumHue, state.spectrumS, state.spectrumL || 50);
    state.color = hex;
    updateColorSwatch();
    updateSlidersFromColor();
  }

  // ── Sliders tab ───────────────────────────────────────
  function updateSlidersFromColor() {
    const [h, s, l] = hexToHsl(state.color);
    const sh = $('#slider-h'), ss = $('#slider-s'), sl = $('#slider-l');
    if (sh) { sh.value = h; $('#val-h').textContent = h; }
    if (ss) { ss.value = s; $('#val-s').textContent = s + '%'; }
    if (sl) { sl.value = l; $('#val-l').textContent = l + '%'; }
    const preview = $('#slider-preview');
    if (preview) preview.style.background = state.color;
  }

  function updateSlidersDisplay() {
    const h = parseInt($('#slider-h').value);
    const s = parseInt($('#slider-s').value);
    const l = parseInt($('#slider-l').value);
    $('#val-h').textContent = h;
    $('#val-s').textContent = s + '%';
    $('#val-l').textContent = l + '%';
    const hex = hslToHex(h, s, l);
    state.color = hex;
    updateColorSwatch();
    const preview = $('#slider-preview');
    if (preview) preview.style.background = hex;
  }

  function syncSlidersTabs(hex) {
    const [h, s, l] = hexToHsl(hex);
    state.spectrumHue = h;
    state.spectrumS   = s;
    state.spectrumL   = l;
    updateSlidersFromColor();
    if ($('#tab-spectrum').classList.contains('active')) {
      drawSpectrum();
      drawHueBar();
    }
  }

  // ── Saved swatches ────────────────────────────────────
  function loadSavedSwatches() {
    try {
      const raw = localStorage.getItem('elsiespark-swatches');
      state.savedSwatches = raw ? JSON.parse(raw) : ['#e87461','#f7c948','#6ab04c','#4a90d9','#9b59b6'];
    } catch (_) {
      state.savedSwatches = ['#e87461','#f7c948','#6ab04c','#4a90d9','#9b59b6'];
    }
  }

  function saveSwatch() {
    if (state.savedSwatches.includes(state.color)) return;
    state.savedSwatches.unshift(state.color);
    if (state.savedSwatches.length > 8) state.savedSwatches.pop();
    localStorage.setItem('elsiespark-swatches', JSON.stringify(state.savedSwatches));
    renderSavedSwatches();
    showToast('Colour saved!');
  }

  function renderSavedSwatches() {
    const row = $('#saved-swatches');
    if (!row) return;
    row.innerHTML = '';
    state.savedSwatches.forEach(c => {
      const el = document.createElement('div');
      el.className = 'saved-swatch' + (c === state.color ? ' active' : '');
      el.style.background = c;
      el.addEventListener('click', () => { setColor(c); });
      row.appendChild(el);
    });
  }

  // ═══════════════════════════════════════════════════════
  // STICKER SYSTEM
  // ═══════════════════════════════════════════════════════
  function renderStickers() {
    const list = $('#sticker-list');
    if (!list) return;
    list.innerHTML = '';
    STICKERS.forEach(st => {
      const btn = document.createElement('button');
      btn.className = 'sticker-btn';
      btn.title = st.name;
      btn.innerHTML = st.svg;
      btn.querySelector('svg').style.cssText = 'width:36px;height:36px';
      btn.addEventListener('click', () => { enterStickerMode(st); closeSheet(); });
      list.appendChild(btn);
    });
    FILE_STICKERS.forEach(st => {
      const btn = document.createElement('button');
      btn.className = 'sticker-btn sticker-btn-img';
      btn.title = st.name;
      const img = document.createElement('img');
      img.src = st.src; img.alt = st.name; img.draggable = false;
      btn.appendChild(img);
      btn.addEventListener('click', () => { enterStickerModeFromFile(st); closeSheet(); });
      list.appendChild(btn);
    });
  }

  function parseSvgAspect(svgStr) {
    const m = svgStr.match(/viewBox="[\s]*([^\s"]+)[\s]+([^\s"]+)[\s]+([^\s"]+)[\s]+([^\s"]+)"/);
    if (m) { const vw = parseFloat(m[3]), vh = parseFloat(m[4]); if (vw > 0 && vh > 0) return vw / vh; }
    return 1;
  }

  function _startStickerMode(name, img, aspect) {
    exitTextMode();
    exitStickerMode();
    exitSelectMode();
    const size = state.brushSize * 6 + 40;
    state.stickerMode     = { img, size, name, aspect };
    state.stickerPos      = { x: state.canvasWidth / 2, y: state.canvasHeight / 2 };
    state.stickerRotation = 0;
    state.stickerDragging = false;
    previewCanvas.style.cursor = 'none';
    container.classList.add('sticker-mode');
    $$('.sticker-btn').forEach(b => b.classList.toggle('placing', b.title === name));
    $('#sticker-touch-controls').classList.remove('hidden');
    drawStickerPreview();
    const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    showToast(touch ? 'Tap to place. Pinch to resize & rotate.' : 'Click to place. Scroll to resize. Shift+scroll to rotate. Esc to cancel.');
  }

  function enterStickerMode(sticker) {
    const aspect = parseSvgAspect(sticker.svg);
    const blob   = new Blob([sticker.svg], { type: 'image/svg+xml' });
    const url    = URL.createObjectURL(blob);
    const img    = new Image();
    img.onload   = () => { URL.revokeObjectURL(url); _startStickerMode(sticker.name, img, aspect); };
    img.src      = url;
  }

  function enterStickerModeFromFile(sticker) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => _startStickerMode(sticker.name, img, img.naturalWidth / img.naturalHeight || 1);
    img.src    = sticker.src;
  }

  function exitStickerMode() {
    if (!state.stickerMode) return;
    state.stickerMode = null;
    state.stickerPos  = null;
    state.stickerDragging = false;
    previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
    previewCanvas.style.cursor = 'crosshair';
    container.classList.remove('sticker-mode');
    $$('.sticker-btn').forEach(b => b.classList.remove('placing'));
    $('#sticker-touch-controls').classList.add('hidden');
  }

  function stickerDims() {
    const { size, aspect } = state.stickerMode;
    if (aspect >= 1) return { w: size, h: size / aspect };
    return { w: size * aspect, h: size };
  }

  function drawStickerPreview() {
    if (!state.stickerMode || !state.stickerPos) return;
    const { img } = state.stickerMode;
    const { w, h } = stickerDims();
    const { x, y } = state.stickerPos;
    previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
    previewCtx.save();
    previewCtx.globalAlpha = 0.7;
    previewCtx.translate(x, y);
    previewCtx.rotate(state.stickerRotation * Math.PI / 180);
    previewCtx.drawImage(img, -w / 2, -h / 2, w, h);
    previewCtx.restore();
    const radius = Math.max(w, h) / 2 + 4;
    previewCtx.save();
    previewCtx.strokeStyle = 'rgba(232,114,92,0.5)';
    previewCtx.lineWidth = 1.5;
    previewCtx.setLineDash([4, 4]);
    previewCtx.beginPath();
    previewCtx.arc(x, y, radius, 0, Math.PI * 2);
    previewCtx.stroke();
    previewCtx.setLineDash([]);
    previewCtx.restore();
  }

  function commitSticker() {
    if (!state.stickerMode || !state.stickerPos) return;
    const layer = getActiveLayer();
    if (!layer || !layer.visible) return;
    pushUndo();
    const { img, name, aspect, size } = state.stickerMode;
    const { x, y } = state.stickerPos;
    layer.objects.push({
      id: ++objectIdCounter, type: 'sticker',
      x, y, rotation: state.stickerRotation,
      img, name, aspect, size,
    });
    exitStickerMode();
    renderObjects();
  }

  // ═══════════════════════════════════════════════════════
  // TEXT TOOL
  // ═══════════════════════════════════════════════════════

  function enterTextMode(text, font, size, bold, italic) {
    exitStickerMode();
    exitTextMode();
    exitSelectMode();
    state.textMode = { text, font, size, bold, italic };
    state.textPos  = { x: state.canvasWidth / 2, y: state.canvasHeight / 2 };
    state.textDragging = false;
    previewCanvas.style.cursor = 'text';
    drawTextPreview();
    const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    showToast(touch ? 'Tap to place your text.' : 'Click to place. Scroll to resize. Esc to cancel.');
  }

  function exitTextMode() {
    if (!state.textMode) return;
    state.textMode = null;
    state.textPos  = null;
    state.textDragging = false;
    previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
    previewCanvas.style.cursor = 'crosshair';
  }

  function textFontStr(tm) {
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

  function drawTextPreview() {
    if (!state.textMode || !state.textPos) return;
    const { text, font, size, bold, italic } = state.textMode;
    const { x, y } = state.textPos;
    previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
    previewCtx.save();
    previewCtx.globalAlpha = 0.7;
    previewCtx.font = textFontStr(state.textMode);
    previewCtx.fillStyle = state.color;
    previewCtx.textAlign = 'center';
    previewCtx.textBaseline = 'middle';
    previewCtx.fillText(text, x, y);
    previewCtx.restore();
    // Dashed bounding box
    const metrics = previewCtx.measureText(text);
    previewCtx.save();
    previewCtx.font = textFontStr(state.textMode);
    const tw = previewCtx.measureText(text).width;
    const th = size * 1.2;
    previewCtx.strokeStyle = 'rgba(232,114,92,0.5)';
    previewCtx.lineWidth = 1.5;
    previewCtx.setLineDash([4, 4]);
    previewCtx.strokeRect(x - tw / 2 - 6, y - th / 2 - 2, tw + 12, th + 4);
    previewCtx.setLineDash([]);
    previewCtx.restore();
  }

  function commitText() {
    if (!state.textMode || !state.textPos) return;
    const layer = getActiveLayer();
    if (!layer || !layer.visible) return;
    pushUndo();
    const { text, font, size, bold, italic } = state.textMode;
    const { x, y } = state.textPos;
    layer.objects.push({
      id: ++objectIdCounter, type: 'text',
      x, y, rotation: 0,
      text, font, fontSize: size, bold, italic,
      color: state.color, opacity: state.brushOpacity,
    });
    exitTextMode();
    renderObjects();
  }

  // ═══════════════════════════════════════════════════════
  // OBJECT SYSTEM (render, hit-test, select)
  // ═══════════════════════════════════════════════════════

  function getObjectDims(obj) {
    if (obj.type === 'sticker') {
      const s = obj.size;
      if (obj.aspect >= 1) return { w: s, h: s / obj.aspect };
      return { w: s * obj.aspect, h: s };
    }
    if (obj.type === 'stroke') {
      const scale = obj.scale || 1;
      return { w: (obj.baseWidth || 10) * scale, h: (obj.baseHeight || 10) * scale };
    }
    // text — measure width
    objectsCtx.save();
    objectsCtx.font = textObjFontStr(obj);
    const tw = objectsCtx.measureText(obj.text).width;
    objectsCtx.restore();
    return { w: tw, h: obj.fontSize * 1.2 };
  }

  function textObjFontStr(obj) {
    let s = '';
    if (obj.italic) s += 'italic ';
    if (obj.bold) s += 'bold ';
    s += obj.fontSize + 'px ';
    if (obj.font === 'cursive') s += "'Segoe Script', cursive";
    else if (obj.font === 'serif') s += "Georgia, 'Times New Roman', serif";
    else if (obj.font === 'monospace') s += "'Courier New', monospace";
    else s += "'Nunito', sans-serif";
    return s;
  }

  function drawObjectTo(ctx, obj) {
    ctx.save();
    ctx.translate(obj.x, obj.y);
    ctx.rotate(obj.rotation * Math.PI / 180);
    if (obj.type === 'sticker') {
      const { w, h } = getObjectDims(obj);
      ctx.drawImage(obj.img, -w / 2, -h / 2, w, h);
    } else if (obj.type === 'text') {
      ctx.font = textObjFontStr(obj);
      ctx.fillStyle = obj.color;
      ctx.globalAlpha = obj.opacity;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(obj.text, 0, 0);
    } else if (obj.type === 'stroke') {
      const scale = obj.scale || 1;
      ctx.scale(scale, scale);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = obj.brushSize;
      ctx.strokeStyle = obj.color;
      ctx.globalAlpha = obj.brush === 'marker' ? (obj.opacity || 1) * 0.5 : (obj.opacity || 1);
      const pts = obj.points;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      if (pts.length === 1) {
        ctx.lineTo(pts[0].x, pts[0].y);
      } else {
        for (let i = 1; i < pts.length - 1; i++) {
          const mx = (pts[i].x + pts[i + 1].x) / 2;
          const my = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function renderObjects() {
    if (!objectsCanvas) return;
    objectsCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
    state.layers.forEach(l => {
      if (!l.visible || !l.objects) return;
      objectsCtx.globalAlpha = l.opacity ?? 1;
      l.objects.forEach(obj => drawObjectTo(objectsCtx, obj));
    });
    objectsCtx.globalAlpha = 1;
    drawSelectionHandles();
  }

  // ── Hit testing ──
  function isPointInObject(px, py, obj) {
    const dx = px - obj.x, dy = py - obj.y;
    const a = -obj.rotation * Math.PI / 180;
    const lx = dx * Math.cos(a) - dy * Math.sin(a);
    const ly = dx * Math.sin(a) + dy * Math.cos(a);
    const { w, h } = getObjectDims(obj);
    return Math.abs(lx) <= w / 2 + 8 && Math.abs(ly) <= h / 2 + 8;
  }

  function hitTestObjects(px, py) {
    // Only test objects on the active layer
    const layer = getActiveLayer();
    if (!layer || !layer.objects) return null;
    for (let i = layer.objects.length - 1; i >= 0; i--) {
      if (isPointInObject(px, py, layer.objects[i])) return layer.objects[i];
    }
    return null;
  }

  // ── Selection handles ──
  const HANDLE_SIZE = 10;

  function getSelectionCorners(obj) {
    const { w, h } = getObjectDims(obj);
    const hw = w / 2 + 6, hh = h / 2 + 6;
    const a = obj.rotation * Math.PI / 180;
    const cos = Math.cos(a), sin = Math.sin(a);
    function rot(lx, ly) {
      return { x: obj.x + lx * cos - ly * sin, y: obj.y + lx * sin + ly * cos };
    }
    return {
      tl: rot(-hw, -hh), tr: rot(hw, -hh),
      bl: rot(-hw, hh),  br: rot(hw, hh),
      rotHandle: rot(0, -hh - 28),
    };
  }

  function drawSelectionHandles() {
    const obj = state.selectedObject;
    if (!obj) return;
    const c = getSelectionCorners(obj);
    const ctx = previewCtx;
    ctx.save();
    // Dashed bounding box
    ctx.strokeStyle = 'rgba(232,114,92,0.8)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(c.tl.x, c.tl.y);
    ctx.lineTo(c.tr.x, c.tr.y);
    ctx.lineTo(c.br.x, c.br.y);
    ctx.lineTo(c.bl.x, c.bl.y);
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
    // Rotation line
    const topMid = { x: (c.tl.x + c.tr.x) / 2, y: (c.tl.y + c.tr.y) / 2 };
    ctx.strokeStyle = 'rgba(232,114,92,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(topMid.x, topMid.y);
    ctx.lineTo(c.rotHandle.x, c.rotHandle.y);
    ctx.stroke();
    // Corner handles
    [c.tl, c.tr, c.bl, c.br].forEach(p => {
      ctx.fillStyle = 'white';
      ctx.strokeStyle = '#e8725c';
      ctx.lineWidth = 2;
      ctx.fillRect(p.x - HANDLE_SIZE / 2, p.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
      ctx.strokeRect(p.x - HANDLE_SIZE / 2, p.y - HANDLE_SIZE / 2, HANDLE_SIZE, HANDLE_SIZE);
    });
    // Rotation handle (circle)
    ctx.beginPath();
    ctx.arc(c.rotHandle.x, c.rotHandle.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.strokeStyle = '#e8725c';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  function hitTestHandle(px, py) {
    const obj = state.selectedObject;
    if (!obj) return null;
    const c = getSelectionCorners(obj);
    const threshold = HANDLE_SIZE + 4;
    function near(p) { return Math.abs(px - p.x) < threshold && Math.abs(py - p.y) < threshold; }
    if (near(c.rotHandle)) return 'rotate';
    if (near(c.tl)) return 'scale-tl';
    if (near(c.tr)) return 'scale-tr';
    if (near(c.bl)) return 'scale-bl';
    if (near(c.br)) return 'scale-br';
    if (isPointInObject(px, py, obj)) return 'move';
    return null;
  }

  function enterSelectMode() {
    state.selectMode = true;
    state.selectedObject = null;
    exitStickerMode();
    exitTextMode();
    previewCanvas.style.cursor = 'default';
    previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
  }

  function exitSelectMode() {
    state.selectMode = false;
    state.selectedObject = null;
    state.selectDrag = null;
    previewCanvas.style.cursor = 'crosshair';
    previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
  }

  function deleteSelectedObject() {
    if (!state.selectedObject) return;
    const layer = getActiveLayer();
    if (!layer) return;
    pushUndo();
    const idx = layer.objects.findIndex(o => o.id === state.selectedObject.id);
    if (idx >= 0) layer.objects.splice(idx, 1);
    state.selectedObject = null;
    previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
    renderObjects();
  }

  // ═══════════════════════════════════════════════════════
  // BACKGROUNDS
  // ═══════════════════════════════════════════════════════
  function buildBackgroundGrid() {
    const grid = $('#background-grid');
    if (!grid) return;
    grid.innerHTML = '';
    BACKGROUNDS.forEach(bg => {
      const el = document.createElement('div');
      el.className = 'bg-thumb' + (bg.id === state.selectedBackground ? ' selected' : '');
      el.title = bg.label;
      if (bg.imageSrc) {
        el.style.backgroundImage = 'url("' + encodeURI(bg.imageSrc) + '")';
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
        el.style.color = 'transparent'; // hide label for image backgrounds
      } else {
        el.style.background = bg.style || '#fff';
        if (bg.pattern === 'grid') {
          el.style.backgroundImage = 'linear-gradient(#e0e0e0 1px,transparent 1px),linear-gradient(90deg,#e0e0e0 1px,transparent 1px)';
          el.style.backgroundSize = '12px 12px';
          el.style.backgroundColor = '#fff';
        } else if (bg.pattern === 'dots') {
          el.style.backgroundImage = 'radial-gradient(circle, #ccc 1px, transparent 1px)';
          el.style.backgroundSize = '10px 10px';
          el.style.backgroundColor = '#fff';
        } else if (bg.pattern === 'lined') {
          el.style.backgroundImage = 'linear-gradient(transparent 87%, #a8c0e0 87%)';
          el.style.backgroundSize = '100% 18px';
          el.style.backgroundColor = '#fafcff';
        } else if (bg.customGradient) {
          el.style.background = bg.style;
        }
        el.textContent = bg.label;
      }
      el.addEventListener('click', () => {
        state.selectedBackground = bg.id;
        $$('.bg-thumb').forEach(t => t.classList.remove('selected'));
        el.classList.add('selected');
        applyBackground(bg.id);
      });
      grid.appendChild(el);
    });
    // Render custom gradient creator button
    const addBtn = document.createElement('div');
    addBtn.className = 'bg-thumb bg-thumb-add';
    addBtn.textContent = '+';
    addBtn.title = 'Custom gradient';
    addBtn.addEventListener('click', openGradientCreator);
    grid.appendChild(addBtn);
  }

  function applyBackground(bgId) {
    if (!container) return;
    const bg = BACKGROUNDS.find(b => b.id === bgId);
    if (!bg) return;
    if (bg.imageSrc) {
      container.style.backgroundImage = 'url("' + encodeURI(bg.imageSrc) + '")';
      container.style.backgroundSize = 'cover';
      container.style.backgroundPosition = 'center';
      container.style.backgroundColor = '#ffffff';
      // Cache loaded image for export
      if (!bg._img) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => { bg._img = img; };
        img.src = encodeURI(bg.imageSrc);
      }
    } else if (bg.pattern === 'grid') {
      container.style.backgroundImage = 'linear-gradient(#e0e0e0 1px,transparent 1px),linear-gradient(90deg,#e0e0e0 1px,transparent 1px)';
      container.style.backgroundSize = '40px 40px';
      container.style.backgroundColor = '#ffffff';
    } else if (bg.pattern === 'dots') {
      container.style.backgroundImage = 'radial-gradient(circle, #ccc 1.5px, transparent 1.5px)';
      container.style.backgroundSize = '28px 28px';
      container.style.backgroundColor = '#ffffff';
    } else if (bg.pattern === 'lined') {
      container.style.backgroundImage = 'linear-gradient(transparent 94%, #b0c8e8 94%)';
      container.style.backgroundSize = '100% 36px';
      container.style.backgroundColor = '#fafcff';
    } else {
      container.style.backgroundImage = 'none';
      container.style.backgroundColor = '';
      container.style.background = bg.style || '#ffffff';
    }
  }

  // ═══════════════════════════════════════════════════════
  // CUSTOM GRADIENT CREATOR
  // ═══════════════════════════════════════════════════════
  let customGradients = []; // { id, label, style, customGradient: true }

  function loadCustomGradients() {
    try {
      const raw = localStorage.getItem('elsie-custom-gradients');
      if (raw) {
        customGradients = JSON.parse(raw);
        customGradients.forEach(g => {
          if (!BACKGROUNDS.find(b => b.id === g.id)) BACKGROUNDS.push(g);
        });
      }
    } catch (_) {}
  }

  function saveCustomGradients() {
    localStorage.setItem('elsie-custom-gradients', JSON.stringify(customGradients));
  }

  function openGradientCreator() {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'gradient-creator-overlay';
    const modal = document.createElement('div');
    modal.id = 'gradient-creator';
    modal.innerHTML = `
      <div class="gc-header">
        <span class="gc-title">Create Gradient</span>
        <button class="gc-close">&times;</button>
      </div>
      <div class="gc-preview" id="gc-preview"></div>
      <div class="gc-controls">
        <label class="gc-label">Angle: <span id="gc-angle-val">160</span>&deg;</label>
        <input type="range" id="gc-angle" min="0" max="360" value="160" class="gc-slider">
        <div class="gc-stops" id="gc-stops"></div>
        <button id="gc-add-stop" class="gc-btn-small">+ Add Color</button>
      </div>
      <div class="gc-actions">
        <button id="gc-cancel" class="gc-btn">Cancel</button>
        <button id="gc-save" class="gc-btn gc-btn-primary">Save</button>
      </div>
    `;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    let stops = [
      { color: '#ff9a9e', pos: 0 },
      { color: '#fad0c4', pos: 50 },
      { color: '#ffecd2', pos: 100 },
    ];

    function buildCSS() {
      const sorted = [...stops].sort((a, b) => a.pos - b.pos);
      const angle = document.getElementById('gc-angle').value;
      return 'linear-gradient(' + angle + 'deg, ' +
        sorted.map(s => s.color + ' ' + s.pos + '%').join(', ') + ')';
    }

    function updatePreview() {
      document.getElementById('gc-preview').style.background = buildCSS();
      document.getElementById('gc-angle-val').textContent = document.getElementById('gc-angle').value;
    }

    function renderStops() {
      const container = document.getElementById('gc-stops');
      container.innerHTML = '';
      stops.forEach((s, i) => {
        const row = document.createElement('div');
        row.className = 'gc-stop-row';
        row.innerHTML = '<input type="color" value="' + s.color + '" class="gc-color-input">' +
          '<input type="range" min="0" max="100" value="' + s.pos + '" class="gc-slider gc-pos-slider">' +
          (stops.length > 2 ? '<button class="gc-remove-stop">&times;</button>' : '');
        row.querySelector('.gc-color-input').addEventListener('input', e => {
          s.color = e.target.value; updatePreview();
        });
        row.querySelector('.gc-pos-slider').addEventListener('input', e => {
          s.pos = parseInt(e.target.value); updatePreview();
        });
        const rm = row.querySelector('.gc-remove-stop');
        if (rm) rm.addEventListener('click', () => { stops.splice(i, 1); renderStops(); updatePreview(); });
        container.appendChild(row);
      });
    }

    renderStops();
    updatePreview();

    document.getElementById('gc-angle').addEventListener('input', updatePreview);
    document.getElementById('gc-add-stop').addEventListener('click', () => {
      stops.push({ color: '#ffffff', pos: 50 });
      renderStops();
      updatePreview();
    });
    modal.querySelector('.gc-close').addEventListener('click', () => overlay.remove());
    document.getElementById('gc-cancel').addEventListener('click', () => overlay.remove());
    document.getElementById('gc-save').addEventListener('click', () => {
      const css = buildCSS();
      const id = 'custom-grad-' + Date.now();
      const bg = { id, label: 'Custom', style: css, customGradient: true };
      BACKGROUNDS.push(bg);
      customGradients.push(bg);
      saveCustomGradients();
      state.selectedBackground = id;
      applyBackground(id);
      buildBackgroundGrid();
      overlay.remove();
    });
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  }

  // ═══════════════════════════════════════════════════════
  // SHEET SYSTEM
  // ═══════════════════════════════════════════════════════
  function openSheet(id) {
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
    if (previewCanvas) previewCanvas.style.pointerEvents = 'none';

    // Lazy-init spectrum/hue canvases
    if (id === 'color') {
      setTimeout(() => {
        if ($('#tab-spectrum').classList.contains('active')) {
          drawSpectrum();
          drawHueBar();
        }
      }, 50);
    }
  }

  function closeSheet() {
    if (!state.openSheet) return;
    const sheet = $('#sheet-' + state.openSheet);
    if (sheet) {
      sheet.classList.remove('open');
      // Hide after transition
      setTimeout(() => { sheet.classList.add('hidden'); }, 340);
    }
    $('#sheet-overlay').classList.add('hidden');
    state.openSheet = null;
    if (previewCanvas) previewCanvas.style.pointerEvents = '';
  }

  // ── Swipe-down to dismiss ─────────────────────────────
  function addSwipeDismiss(sheetEl) {
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

  // ═══════════════════════════════════════════════════════
  // DAILY PROMPT
  // ═══════════════════════════════════════════════════════
  function showDailyPrompt() {
    const today = new Date().toDateString();
    let seed = 0;
    for (let i = 0; i < today.length; i++) seed += today.charCodeAt(i);
    const text = PROMPTS[seed % PROMPTS.length];
    const el = $('#draw-prompt-text');
    if (el) el.textContent = text;
  }

  // ═══════════════════════════════════════════════════════
  // IMAGE IMPORT (TRACING)
  // ═══════════════════════════════════════════════════════
  function importTraceImage(file) {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        state.traceImage = img;
        traceCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
        const scale = Math.min(state.canvasWidth / img.width, state.canvasHeight / img.height);
        const w = img.width * scale, h = img.height * scale;
        traceCtx.drawImage(img, (state.canvasWidth - w) / 2, (state.canvasHeight - h) / 2, w, h);
        traceCanvas.style.display = '';
        $('#btn-clear-trace').hidden = false;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function clearTrace() {
    traceCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
    state.traceImage = null;
    traceCanvas.style.display = 'none';
    $('#btn-clear-trace').hidden = true;
  }

  // ═══════════════════════════════════════════════════════
  // EXPORT
  // ═══════════════════════════════════════════════════════
  function renderBackground(ctx, w, h) {
    const bg = BACKGROUNDS.find(b => b.id === state.selectedBackground);
    if (!bg) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h); return; }
    if (bg.imageSrc && bg._img) {
      // Draw image background covering the canvas
      const iw = bg._img.width, ih = bg._img.height;
      const scale = Math.max(w / iw, h / ih);
      const sw = iw * scale, sh = ih * scale;
      ctx.drawImage(bg._img, (w - sw) / 2, (h - sh) / 2, sw, sh);
    } else if (bg.imageSrc) {
      // Image not loaded yet, fill white as fallback
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
    } else if (bg.pattern === 'grid') {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 1;
      for (let x = 0; x <= w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y <= h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    } else if (bg.pattern === 'dots') {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#cccccc';
      for (let x = 14; x < w; x += 28) for (let y = 14; y < h; y += 28) {
        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
      }
    } else if (bg.pattern === 'lined') {
      ctx.fillStyle = '#fafcff'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#b0c8e8'; ctx.lineWidth = 1;
      for (let y = 36; y <= h; y += 36) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    } else if (bg.style && bg.style.includes('linear-gradient')) {
      const colors = bg.style.match(/#[0-9a-fA-F]{3,8}/g) || ['#ffffff'];
      const angle = parseFloat(bg.style.match(/(\d+)deg/) ? bg.style.match(/(\d+)deg/)[1] : '180');
      const rad = (angle - 90) * Math.PI / 180;
      const cx = w / 2, cy = h / 2, len = Math.max(w, h);
      const grad = ctx.createLinearGradient(
        cx - Math.cos(rad) * len / 2, cy - Math.sin(rad) * len / 2,
        cx + Math.cos(rad) * len / 2, cy + Math.sin(rad) * len / 2
      );
      colors.forEach((c, i) => grad.addColorStop(i / Math.max(colors.length - 1, 1), c));
      ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = bg.style || '#ffffff'; ctx.fillRect(0, 0, w, h);
    }
  }

  function exportPNG() {
    const merged = document.createElement('canvas');
    merged.width  = state.canvasWidth;
    merged.height = state.canvasHeight;
    const mctx = merged.getContext('2d');
    renderBackground(mctx, merged.width, merged.height);
    state.layers.forEach(l => {
      if (!l.visible) return;
      mctx.globalAlpha = l.opacity ?? 1;
      mctx.drawImage(l.canvas, 0, 0);
      // Draw objects for this layer
      if (l.objects) l.objects.forEach(obj => drawObjectTo(mctx, obj));
    });
    mctx.globalAlpha = 1;
    const link = document.createElement('a');
    link.download = 'elsies-spark-' + Date.now() + '.png';
    link.href = merged.toDataURL('image/png');
    link.click();
  }

  // ═══════════════════════════════════════════════════════
  // SAVE / LOAD (multi-project)
  // ═══════════════════════════════════════════════════════
  function saveProject() {
    try {
      const projectData = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        prompt: $('#draw-prompt-text')?.textContent || '',
        canvasWidth: state.canvasWidth,
        canvasHeight: state.canvasHeight,
        background: state.selectedBackground,
        layers: state.layers.map(l => ({
          id: l.id, name: l.name, visible: l.visible, opacity: l.opacity ?? 1,
          data: l.canvas.toDataURL(),
          objects: (l.objects || []).map(o => {
            const s = { ...o };
            // Can't serialize Image — save reference info instead
            if (s.type === 'sticker') { delete s.img; }
            return s;
          }),
        })),
        activeLayerId: state.activeLayerId,
      };
      // Thumbnail: merge all visible layers onto background
      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.width  = state.canvasWidth;
      thumbCanvas.height = state.canvasHeight;
      const tctx = thumbCanvas.getContext('2d');
      renderBackground(tctx, thumbCanvas.width, thumbCanvas.height);
      state.layers.forEach(l => {
        if (!l.visible) return;
        tctx.globalAlpha = l.opacity ?? 1;
        tctx.drawImage(l.canvas, 0, 0);
        if (l.objects) l.objects.forEach(obj => drawObjectTo(tctx, obj));
      });
      tctx.globalAlpha = 1;
      projectData.thumbnail = thumbCanvas.toDataURL('image/png');

      let projects = loadAllProjects();
      // Check if updating an existing project (same session) — use current ID if set
      if (state.currentProjectId) {
        const idx = projects.findIndex(p => p.id === state.currentProjectId);
        if (idx >= 0) { projects[idx] = { ...projectData, id: state.currentProjectId }; }
        else { projects.unshift(projectData); state.currentProjectId = projectData.id; }
      } else {
        state.currentProjectId = projectData.id;
        projects.unshift(projectData);
      }
      // Keep max 20 projects
      projects = projects.slice(0, 20);
      localStorage.setItem('elsiespark-projects', JSON.stringify(projects));
      showToast('Saved!');
    } catch (e) {
      showToast('Save failed — storage may be full.');
    }
  }

  function loadAllProjects() {
    try {
      const raw = localStorage.getItem('elsiespark-projects');
      if (raw) return JSON.parse(raw);
      // Migrate legacy single-project save
      const legacy = localStorage.getItem('elsiespark-project');
      if (legacy) { const p = JSON.parse(legacy); p.id = Date.now(); return [p]; }
    } catch (_) {}
    return [];
  }

  function loadProject(projectData) {
    // Clear existing layers
    state.layers.forEach(l => l.canvas.remove());
    state.layers = [];
    layerIdCounter = 0;
    state.undoStack = [];
    state.redoStack = [];
    state.currentProjectId = projectData.id;

    // Restore canvas at saved dimensions (don't recalculate from viewport)
    const w = projectData.canvasWidth  || 1080;
    const h = projectData.canvasHeight || 1080;
    state.canvasWidth  = w;
    state.canvasHeight = h;
    traceCanvas.width   = w;
    traceCanvas.height  = h;
    objectsCanvas.width = w;
    objectsCanvas.height = h;
    previewCanvas.width = w;
    previewCanvas.height = h;

    // Restore background
    if (projectData.background) {
      state.selectedBackground = projectData.background;
      applyBackground(projectData.background);
    }

    // Restore layers
    (projectData.layers || []).forEach(ld => {
      const layer = addLayer(ld.name);
      layer.visible = ld.visible;
      layer.opacity = ld.opacity ?? 1;
      layer.canvas.style.display = ld.visible ? '' : 'none';
      layer.canvas.style.opacity = layer.opacity;
      const img = new Image();
      img.onload = () => {
        layer.ctx.drawImage(img, 0, 0);
        // Restore objects after raster is loaded
        if (ld.objects) {
          layer.objects = ld.objects.map(o => {
            const obj = { ...o };
            if (obj.type === 'sticker' && !obj.img) {
              // Reconstruct Image from sticker name
              const sticker = STICKERS.find(s => s.name === obj.name);
              const fileSt  = FILE_STICKERS.find(s => s.name === obj.name);
              if (sticker) {
                const blob = new Blob([sticker.svg], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const simg = new Image();
                simg.onload = () => { URL.revokeObjectURL(url); obj.img = simg; renderObjects(); };
                simg.src = url;
              } else if (fileSt) {
                const simg = new Image();
                simg.crossOrigin = 'anonymous';
                simg.onload = () => { obj.img = simg; renderObjects(); };
                simg.src = fileSt.src;
              }
            }
            return obj;
          });
        }
      };
      img.src = ld.data;
    });

    layerIdCounter = Math.max(...(projectData.layers || []).map(l => l.id || 0), 0);
    state.activeLayerId = projectData.activeLayerId || state.layers[0]?.id;
    renderLayerList();
    updateUndoRedoButtons();
    setTimeout(() => renderObjects(), 100);
    if (projectData.prompt) {
      const el = $('#draw-prompt-text');
      if (el) el.textContent = projectData.prompt;
    }
  }

  // ═══════════════════════════════════════════════════════
  // GALLERY VIEW
  // ═══════════════════════════════════════════════════════
  function renderGallery() {
    const grid  = $('#gallery-grid');
    const empty = $('#gallery-empty');
    if (!grid) return;
    grid.innerHTML = '';
    const projects = loadAllProjects();
    const count = $('#gallery-count');
    if (count) count.textContent = projects.length + (projects.length === 1 ? ' drawing' : ' drawings');

    if (projects.length === 0) {
      if (empty) empty.classList.remove('hidden');
      return;
    }
    if (empty) empty.classList.add('hidden');

    projects.forEach(p => {
      const el = document.createElement('div');
      el.className = 'gallery-thumb';
      const img = document.createElement('img');
      img.src = p.thumbnail || '';
      img.alt = p.prompt || 'Drawing';
      el.appendChild(img);
      const label = document.createElement('div');
      label.className = 'gallery-thumb-label';
      label.textContent = p.date || '';
      el.appendChild(label);
      el.addEventListener('click', () => {
        loadProject(p);
        showView('draw');
        fitZoom();
      });
      grid.appendChild(el);
    });
  }

  // ═══════════════════════════════════════════════════════
  // PROFILE PICTURE EDITOR
  // ═══════════════════════════════════════════════════════
  function initProfileEditor() {
    const canvas = $('#profile-canvas');
    const ctx = canvas.getContext('2d');
    let drawing = false;
    let lastX = 0, lastY = 0;
    let lastMidX = 0, lastMidY = 0;
    let color = '#333333';
    let size = 4;
    let erasing = false;

    // Load existing profile pic onto canvas
    const saved = localStorage.getItem('elsie-profile-pic');
    if (saved) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = saved;
    }

    // Update gallery avatar on load
    loadProfileAvatar();

    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches ? e.touches[0] : e;
      return {
        x: (touch.clientX - rect.left) * (canvas.width / rect.width),
        y: (touch.clientY - rect.top) * (canvas.height / rect.height),
      };
    }

    canvas.addEventListener('pointerdown', e => {
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      drawing = true;
      const pos = getPos(e);
      lastX = pos.x;
      lastY = pos.y;
      lastMidX = pos.x;
      lastMidY = pos.y;
      // Draw dot
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineWidth = size;
      if (erasing) {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.strokeStyle = color;
      }
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.restore();
    });

    canvas.addEventListener('pointermove', e => {
      if (!drawing) return;
      e.preventDefault();
      const pos = getPos(e);
      const midX = (lastX + pos.x) / 2;
      const midY = (lastY + pos.y) / 2;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = size;
      if (erasing) {
        ctx.globalCompositeOperation = 'destination-out';
      } else {
        ctx.strokeStyle = color;
      }
      ctx.beginPath();
      ctx.moveTo(lastMidX, lastMidY);
      ctx.quadraticCurveTo(lastX, lastY, midX, midY);
      ctx.stroke();
      ctx.restore();
      lastMidX = midX;
      lastMidY = midY;
      lastX = pos.x;
      lastY = pos.y;
    });

    canvas.addEventListener('pointerup', () => { drawing = false; });
    canvas.addEventListener('pointercancel', () => { drawing = false; });

    // Color buttons
    $$('.profile-color').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.profile-color').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        color = btn.dataset.color;
        erasing = false;
        $('#btn-profile-eraser').classList.remove('active');
      });
    });

    // Size buttons
    $$('.profile-size').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.profile-size').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        size = parseInt(btn.dataset.size, 10);
      });
    });

    // Clear
    $('#btn-profile-clear').addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    // Eraser toggle
    $('#btn-profile-eraser').addEventListener('click', () => {
      erasing = !erasing;
      $('#btn-profile-eraser').classList.toggle('active', erasing);
    });

    // Save
    $('#btn-save-profile').addEventListener('click', () => {
      // Save circular crop as profile picture
      const out = document.createElement('canvas');
      out.width = 200;
      out.height = 200;
      const octx = out.getContext('2d');
      octx.beginPath();
      octx.arc(100, 100, 100, 0, Math.PI * 2);
      octx.closePath();
      octx.clip();
      octx.fillStyle = '#ffffff';
      octx.fillRect(0, 0, 200, 200);
      octx.drawImage(canvas, 0, 0);
      const dataURL = out.toDataURL('image/png');
      localStorage.setItem('elsie-profile-pic', dataURL);
      loadProfileAvatar();
      showToast('Profile picture saved!');
      showView('room');
    });
  }

  function loadProfileAvatar() {
    const saved = localStorage.getItem('elsie-profile-pic');
    const avatarEl = $('#gallery-avatar');
    if (saved && avatarEl) {
      avatarEl.innerHTML = '';
      const img = document.createElement('img');
      img.src = saved;
      img.alt = 'Profile';
      img.width = 80;
      img.height = 80;
      img.style.borderRadius = '50%';
      img.style.display = 'block';
      avatarEl.appendChild(img);
    }
  }

  // ═══════════════════════════════════════════════════════
  // TOAST
  // ═══════════════════════════════════════════════════════
  function showToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#3d3429;color:#fff;padding:10px 22px;border-radius:22px;font-size:13px;font-weight:700;z-index:10000;opacity:0;transition:opacity 0.3s;pointer-events:none;white-space:nowrap;';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 2200);
  }

  // ═══════════════════════════════════════════════════════
  // BIND EVENTS
  // ═══════════════════════════════════════════════════════
  function bindEvents() {

    // ── Drawing canvas ──
    previewCanvas.addEventListener('pointerdown', startStroke);
    previewCanvas.addEventListener('pointermove', moveStroke);
    previewCanvas.addEventListener('pointerup',   endStroke);
    previewCanvas.addEventListener('pointerleave',endStroke);
    previewCanvas.addEventListener('pointercancel',endStroke);
    previewCanvas.style.touchAction = 'none';

    previewCanvas.addEventListener('wheel', e => {
      e.preventDefault();
      if (state.textMode) {
        state.textMode.size = Math.max(12, Math.min(200, state.textMode.size + (e.deltaY > 0 ? -4 : 4)));
        drawTextPreview();
      } else if (state.stickerMode) {
        if (e.shiftKey) state.stickerRotation += e.deltaY > 0 ? 15 : -15;
        else state.stickerMode.size = Math.max(16, Math.min(600, state.stickerMode.size + (e.deltaY > 0 ? -8 : 8)));
        drawStickerPreview();
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
        applyZoom();
      }
    }, { passive: false });

    // ── Room pan (horizontal drag/swipe) ──
    initRoomPan();

    // ── Room hotspots ──
    $('#hotspot-easel').addEventListener('click', () => showView('draw'));
    $('#hotspot-gallery').addEventListener('click', () => showView('gallery'));
    $('#hotspot-bell').addEventListener('click', () => showView('news'));
    $('#hotspot-lightbulb').addEventListener('click', () => {
      const prompts = PROMPTS;
      const idx = Math.floor(Math.random() * prompts.length);
      showToast(prompts[idx]);
    });
    $('#hotspot-cat').addEventListener('click', () => {
      const overlay = $('#tutorial-overlay');
      overlay.classList.toggle('hidden');
    });
    $('#tutorial-overlay').addEventListener('click', () => {
      $('#tutorial-overlay').classList.add('hidden');
    });

    // ── Draw view navigation ──
    $('#btn-back-room').addEventListener('click', () => {
      closeSheet();
      exitStickerMode();
      exitTextMode();
      exitSelectMode();
      showView('room');
    });
    $('#btn-done').addEventListener('click', () => {
      saveProject();
      closeSheet();
      exitStickerMode();
      exitTextMode();
      exitSelectMode();
      showView('room');
    });

    // ── Gallery navigation ──
    $('#btn-back-gallery').addEventListener('click', () => showView('room'));
    $('#btn-gallery-draw').addEventListener('click', () => showView('draw'));

    // ── Profile picture ──
    $('#hotspot-profile').addEventListener('click', () => showView('profile'));
    $('#btn-back-profile').addEventListener('click', () => showView('room'));
    initProfileEditor();

    // ── News navigation ──
    $('#btn-back-news').addEventListener('click', () => showView('room'));

    // ── Tools submenu ──
    const submenu = $('#toolbar-submenu');
    const toolsMenuBtn = $('#btn-tools-menu');

    function toggleSubmenu() {
      submenu.classList.toggle('hidden');
    }

    function closeSubmenu() {
      submenu.classList.add('hidden');
    }

    // Submenu item clicks
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
          exitStickerMode();
          exitTextMode();
          exitSelectMode();
          $$('.brush-btn').forEach(b => b.classList.remove('active'));
          state.activeBrush = 'eraser';
          $$('.tb-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        } else if (tool === 'pointer') {
          enterSelectMode();
          $$('.tb-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        } else if (tool === 'undo') {
          undo();
        } else if (tool === 'redo') {
          redo();
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

    // ── Sheet overlay dismiss ──
    $('#sheet-overlay').addEventListener('click', closeSheet);

    // ── Sheet close buttons ──
    $$('.sheet-close-btn').forEach(btn => {
      btn.addEventListener('click', () => closeSheet());
    });

    // ── Add swipe-dismiss to all sheets ──
    $$('.bottom-sheet').forEach(sheet => addSwipeDismiss(sheet));

    // ── Color sheet tabs ──
    $$('.sheet-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.sheet-tab').forEach(t => t.classList.remove('active'));
        $$('.tab-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const panelId = 'tab-' + tab.dataset.tab;
        document.getElementById(panelId).classList.add('active');
        if (tab.dataset.tab === 'spectrum') {
          setTimeout(() => { drawSpectrum(); drawHueBar(); }, 30);
        }
      });
    });

    // Spectrum canvas interactions
    const specCanvas = $('#spectrum-canvas');
    if (specCanvas) {
      specCanvas.addEventListener('pointerdown', e => { spectrumDragging = true; pickFromSpectrum(e); });
      specCanvas.addEventListener('pointermove', e => { if (spectrumDragging) pickFromSpectrum(e); });
      specCanvas.addEventListener('pointerup',   () => spectrumDragging = false);
      specCanvas.style.touchAction = 'none';
    }

    const hueCanvas = $('#hue-canvas');
    if (hueCanvas) {
      hueCanvas.addEventListener('pointerdown', e => { hueDragging = true; pickFromHueBar(e); });
      hueCanvas.addEventListener('pointermove', e => { if (hueDragging) pickFromHueBar(e); });
      hueCanvas.addEventListener('pointerup',   () => hueDragging = false);
      hueCanvas.style.touchAction = 'none';
    }

    // Sliders tab
    ['h', 's', 'l'].forEach(id => {
      const el = $('#slider-' + id);
      if (el) el.addEventListener('input', updateSlidersDisplay);
    });

    // Opacity slider
    const opacitySlider = $('#brush-opacity');
    if (opacitySlider) {
      opacitySlider.addEventListener('input', e => {
        state.brushOpacity = parseInt(e.target.value) / 100;
        $('#opacity-label').textContent = e.target.value + '%';
      });
    }

    // Save swatch
    $('#btn-save-swatch')?.addEventListener('click', saveSwatch);

    // ── Brush sheet ──
    $$('.brush-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.brush-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeBrush = btn.dataset.brush;
        exitStickerMode();
        exitTextMode();
        exitSelectMode();
        // Set tools-menu as active in main bar, Draw as active in submenu
        $$('.tb-btn').forEach(b => b.classList.remove('active'));
        $('#btn-tools-menu')?.classList.add('active');
        $$('.tb-sub-btn').forEach(b => b.classList.remove('active'));
        $$('.tb-sub-btn[data-subtool="brushes"]').forEach(b => b.classList.add('active'));
        closeSheet();
      });
    });

    const sizeSlider = $('#brush-size');
    if (sizeSlider) {
      sizeSlider.addEventListener('input', e => {
        state.brushSize = parseInt(e.target.value);
        $('#brush-size-label').textContent = state.brushSize;
      });
    }

    // ── Layers sheet ──
    $('#btn-add-layer')?.addEventListener('click', () => {
      addLayer();
      pushUndo();
    });

    // ── Sticker touch controls ──
    $('#sticker-shrink')?.addEventListener('click', () => {
      if (!state.stickerMode) return;
      state.stickerMode.size = Math.max(16, state.stickerMode.size - 12);
      drawStickerPreview();
    });
    $('#sticker-grow')?.addEventListener('click', () => {
      if (!state.stickerMode) return;
      state.stickerMode.size = Math.min(600, state.stickerMode.size + 12);
      drawStickerPreview();
    });
    $('#sticker-rotate-left')?.addEventListener('click', () => {
      if (!state.stickerMode) return;
      state.stickerRotation -= 15; drawStickerPreview();
    });
    $('#sticker-rotate-right')?.addEventListener('click', () => {
      if (!state.stickerMode) return;
      state.stickerRotation += 15; drawStickerPreview();
    });
    $('#sticker-cancel')?.addEventListener('click', () => exitStickerMode());

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
      enterTextMode(text, font, size, bold, italic);
    });

    // ── Background sheet ──
    $('#btn-import-image')?.addEventListener('click', () => $('#file-import').click());
    $('#file-import')?.addEventListener('change', e => {
      if (e.target.files[0]) importTraceImage(e.target.files[0]);
      e.target.value = '';
    });
    $('#btn-clear-trace')?.addEventListener('click', clearTrace);
    $('#btn-export')?.addEventListener('click', exportPNG);

    // ── Keyboard shortcuts ──
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        if (state.selectMode && state.selectedObject) {
          state.selectedObject = null;
          previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
          renderObjects();
          return;
        }
        if (state.textMode) { exitTextMode(); return; }
        if (state.stickerMode) { exitStickerMode(); return; }
        closeSheet();
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectMode && state.selectedObject && e.target.tagName !== 'INPUT') {
          e.preventDefault();
          deleteSelectedObject();
          return;
        }
      }
      if (e.target.tagName === 'INPUT') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveProject(); }
    });

    // ── Zoom reset button ──
    $('#btn-zoom-reset')?.addEventListener('click', () => fitZoom());

    // ── Window resize ──
    window.addEventListener('resize', () => { if (state.currentView === 'draw') fitZoom(); });
  }

  // ── Boot ─────────────────────────────────────────────
  init();

})();
