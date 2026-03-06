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
  const FILE_STICKERS = [
    { name: 'Dino',        src: 'assets/stickers/sticker_02.png' },
    { name: 'Cupcake',     src: 'assets/stickers/sticker_04.png' },
    { name: 'Caticorn',    src: 'assets/stickers/sticker_06.png' },
    { name: 'Cloud',       src: 'assets/stickers/sticker_08.png' },
    { name: 'Palette',     src: 'assets/stickers/sticker_10.png' },
    { name: 'Sloth',       src: 'assets/stickers/sticker_12.png' },
    { name: 'Ice Cream',   src: 'assets/stickers/sticker_14.png' },
    { name: 'Jelly',       src: 'assets/stickers/sticker_16.png' },
    { name: 'Glue',        src: 'assets/stickers/sticker_18.png' },
    { name: 'Strawberry',  src: 'assets/stickers/sticker_20.png' },
    { name: 'Narwhal',     src: 'assets/stickers/sticker_22.png' },
    { name: 'Yarn',        src: 'assets/stickers/sticker_24.png' },
    { name: 'Eggplant',    src: 'assets/stickers/sticker_26.png' },
    { name: 'Octopus',     src: 'assets/stickers/sticker_28.png' },
    { name: 'Flying Pig',  src: 'assets/stickers/sticker_30.png' },
    { name: 'Paint',       src: 'assets/stickers/sticker_32.png' },
  ];

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
    traceImage: null,
    strokePoints: [],
    // Stickers
    stickerMode: null,
    stickerPos: null,
    stickerDragging: false,
    stickerRotation: 0,
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

  // ── Layer counter ─────────────────────────────────────
  let layerIdCounter = 0;

  // ═══════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════
  function init() {
    container     = $('#canvas-container');
    traceCanvas   = $('#trace-canvas');
    traceCtx      = traceCanvas.getContext('2d');
    previewCanvas = $('#preview-canvas');
    previewCtx    = previewCanvas.getContext('2d');

    loadSavedSwatches();
    renderSavedSwatches();
    buildColorGrid();
    buildBackgroundGrid();
    renderStickers();
    bindEvents();
    showView('room');
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

  function onEnterGallery() {
    renderGallery();
  }

  // ═══════════════════════════════════════════════════════
  // CANVAS SETUP & ZOOM
  // ═══════════════════════════════════════════════════════
  function setupCanvas() {
    const w = state.canvasWidth;
    const h = state.canvasHeight;
    container.style.width  = w + 'px';
    container.style.height = h + 'px';
    traceCanvas.width   = w;
    traceCanvas.height  = h;
    previewCanvas.width = w;
    previewCanvas.height = h;
    applyBackground(state.selectedBackground);
  }

  function fitZoom() {
    const area = $('#canvas-area');
    if (!area) return;
    const pad = 24;
    const scaleX = (area.clientWidth  - pad) / state.canvasWidth;
    const scaleY = (area.clientHeight - pad) / state.canvasHeight;
    state.zoom = Math.min(scaleX, scaleY);
    state.fitZoomLevel = state.zoom;
    applyZoom();
  }

  function applyZoom() {
    if (container) container.style.transform = `scale(${state.zoom})`;
    const resetBtn = $('#btn-zoom-reset');
    if (resetBtn) {
      const atFit = Math.abs(state.zoom - (state.fitZoomLevel || state.zoom)) < 0.005;
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
    const layer = { id, name: name || `Layer ${id}`, canvas, ctx, visible: true };
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
      const li = document.createElement('li');
      li.className = 'layer-item' + (l.id === state.activeLayerId ? ' active' : '');
      li.innerHTML = `
        <input type="checkbox" class="layer-visibility" ${l.visible ? 'checked' : ''}>
        <span class="layer-name">${l.name}</span>
        <button class="layer-delete">&times;</button>
      `;
      li.querySelector('.layer-name').addEventListener('click', () => {
        state.activeLayerId = l.id;
        renderLayerList();
      });
      li.querySelector('.layer-visibility').addEventListener('change', e => {
        l.visible = e.target.checked;
        l.canvas.style.display = l.visible ? '' : 'none';
      });
      li.querySelector('.layer-delete').addEventListener('click', () => removeLayer(l.id));
      list.appendChild(li);
    }
  }

  // ═══════════════════════════════════════════════════════
  // UNDO / REDO
  // ═══════════════════════════════════════════════════════
  function captureState() {
    return state.layers.map(l => ({
      id: l.id, name: l.name, visible: l.visible,
      data: l.canvas.toDataURL(),
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
      layer.canvas.style.display = sd.visible ? '' : 'none';
    });
    renderLayerList();
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

  function startStroke(e) {
    e.preventDefault();
    trackPointer(e);

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
      }
      return;
    }
    if (touch.isGesture || touch.pointers.size > 1) return;

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
    state.strokePoints = [pos];
    if (state.activeBrush === 'sprinkles')   drawSprinkle(layer.ctx, pos.x, pos.y);
    else if (state.activeBrush === 'fairylights') drawFairyLight(layer.ctx, pos.x, pos.y);
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
        state.zoom = Math.max(0.1, Math.min(4, touch.pinchStartValue * scale));
        applyZoom();
      }
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

    if (brush === 'pen' || brush === 'marker') {
      ctx.save();
      ctx.lineCap  = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth   = state.brushSize;
      ctx.strokeStyle = state.color;
      ctx.globalAlpha = brush === 'marker' ? state.brushOpacity * 0.5 : state.brushOpacity;
      if (brush === 'marker') ctx.globalCompositeOperation = 'multiply';
      ctx.beginPath();
      ctx.moveTo(state.lastX, state.lastY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.restore();
    } else if (brush === 'eraser') {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineCap  = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth   = state.brushSize;
      ctx.globalAlpha = state.brushOpacity;
      ctx.beginPath();
      ctx.moveTo(state.lastX, state.lastY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.restore();
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
    if (state.stickerMode && state.stickerDragging && !touch.isGesture) {
      commitSticker();
      return;
    }
    if (touch.pointers.size === 0) touch.isGesture = false;
    state.isDrawing = false;
    state.strokePoints = [];
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
    if (sw) sw.style.background = state.color;
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
    exitStickerMode();
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
    const { img } = state.stickerMode;
    const { w, h } = stickerDims();
    const { x, y } = state.stickerPos;
    layer.ctx.save();
    layer.ctx.translate(x, y);
    layer.ctx.rotate(state.stickerRotation * Math.PI / 180);
    layer.ctx.drawImage(img, -w / 2, -h / 2, w, h);
    layer.ctx.restore();
    exitStickerMode();
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
      }
      el.textContent = bg.label;
      el.addEventListener('click', () => {
        state.selectedBackground = bg.id;
        $$('.bg-thumb').forEach(t => t.classList.remove('selected'));
        el.classList.add('selected');
        applyBackground(bg.id);
      });
      grid.appendChild(el);
    });
  }

  function applyBackground(bgId) {
    if (!container) return;
    const bg = BACKGROUNDS.find(b => b.id === bgId);
    if (!bg) return;
    if (bg.pattern === 'grid') {
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
  // SHEET SYSTEM
  // ═══════════════════════════════════════════════════════
  function openSheet(id) {
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
  function exportPNG() {
    const merged = document.createElement('canvas');
    merged.width  = state.canvasWidth;
    merged.height = state.canvasHeight;
    const mctx = merged.getContext('2d');
    mctx.fillStyle = '#ffffff';
    mctx.fillRect(0, 0, merged.width, merged.height);
    state.layers.forEach(l => { if (l.visible) mctx.drawImage(l.canvas, 0, 0); });
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
          id: l.id, name: l.name, visible: l.visible,
          data: l.canvas.toDataURL(),
        })),
        activeLayerId: state.activeLayerId,
      };
      // Thumbnail from first visible layer
      projectData.thumbnail = state.layers.find(l => l.visible)?.canvas.toDataURL('image/jpeg', 0.5) || '';

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

    // Setup canvas
    state.canvasWidth  = projectData.canvasWidth  || 1080;
    state.canvasHeight = projectData.canvasHeight || 1080;
    setupCanvas();

    // Restore background
    if (projectData.background) {
      state.selectedBackground = projectData.background;
      applyBackground(projectData.background);
    }

    // Restore layers
    (projectData.layers || []).forEach(ld => {
      const layer = addLayer(ld.name);
      layer.visible = ld.visible;
      layer.canvas.style.display = ld.visible ? '' : 'none';
      const img = new Image();
      img.onload = () => layer.ctx.drawImage(img, 0, 0);
      img.src = ld.data;
    });

    layerIdCounter = Math.max(...(projectData.layers || []).map(l => l.id || 0), 0);
    state.activeLayerId = projectData.activeLayerId || state.layers[0]?.id;
    renderLayerList();
    updateUndoRedoButtons();
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
      if (state.stickerMode) {
        if (e.shiftKey) state.stickerRotation += e.deltaY > 0 ? 15 : -15;
        else state.stickerMode.size = Math.max(16, Math.min(600, state.stickerMode.size + (e.deltaY > 0 ? -8 : 8)));
        drawStickerPreview();
      } else {
        state.zoom = Math.max(0.05, Math.min(8, state.zoom * (e.deltaY > 0 ? 0.92 : 1.08)));
        applyZoom();
      }
    }, { passive: false });

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
      showView('room');
    });
    $('#btn-done').addEventListener('click', () => {
      saveProject();
      closeSheet();
      exitStickerMode();
      showView('room');
    });

    // ── Gallery navigation ──
    $('#btn-back-gallery').addEventListener('click', () => showView('room'));
    $('#btn-gallery-draw').addEventListener('click', () => showView('draw'));

    // ── News navigation ──
    $('#btn-back-news').addEventListener('click', () => showView('room'));

    // ── Bottom toolbar buttons ──
    $$('.tb-btn[data-tool]').forEach(btn => {
      btn.addEventListener('click', () => {
        const tool = btn.dataset.tool;
        if (tool === 'eraser') {
          // Toggle eraser directly, no sheet
          exitStickerMode();
          $$('.brush-btn').forEach(b => b.classList.remove('active'));
          state.activeBrush = 'eraser';
          // Visual active on toolbar
          $$('.tb-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        } else if (tool === 'undo') {
          undo();
        } else if (tool === 'redo') {
          redo();
        } else {
          openSheet(tool);
          // Brush tool activates brush sheet but also marks btn
          $$('.tb-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        }
      });
    });

    // Mark brushes button as default active
    $$('.tb-btn[data-tool="brushes"]').forEach(b => b.classList.add('active'));

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
        // Set brushes tool as active in toolbar
        $$('.tb-btn').forEach(b => b.classList.remove('active'));
        $$('.tb-btn[data-tool="brushes"]').forEach(b => b.classList.add('active'));
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
        if (state.stickerMode) { exitStickerMode(); return; }
        closeSheet();
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
