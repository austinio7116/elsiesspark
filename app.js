(function () {
  'use strict';

  // ── Daily Prompts ──
  const PROMPTS = [
    "Draw your favorite animal wearing a hat",
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
    "A crow wearing jewelry",
    "A platypus detective",
    "An otter floating with a book",
    "A sandcastle kingdom",
    "A moose in a canoe"
  ];

  // ── Sticker definitions (inline SVG) ──
  const STICKERS = [
    { name: 'star', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="32,4 40,24 62,26 46,40 50,62 32,50 14,62 18,40 2,26 24,24" fill="#f7c948" stroke="#e6b422" stroke-width="1.5"/></svg>' },
    { name: 'heart', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 56 C16 42 4 30 4 18 A14 14 0 0 1 32 14 A14 14 0 0 1 60 18 C60 30 48 42 32 56Z" fill="#e87461" stroke="#c9533f" stroke-width="1.5"/></svg>' },
    { name: 'flower', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="20" r="10" fill="#f0a0c0"/><circle cx="20" cy="32" r="10" fill="#f0a0c0"/><circle cx="44" cy="32" r="10" fill="#f0a0c0"/><circle cx="26" cy="44" r="10" fill="#f0a0c0"/><circle cx="38" cy="44" r="10" fill="#f0a0c0"/><circle cx="32" cy="32" r="7" fill="#f7c948"/></svg>' },
    { name: 'cloud', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40"><ellipse cx="24" cy="26" rx="16" ry="12" fill="white" stroke="#ccc" stroke-width="1"/><ellipse cx="40" cy="24" rx="14" ry="14" fill="white" stroke="#ccc" stroke-width="1"/><ellipse cx="32" cy="14" rx="12" ry="10" fill="white" stroke="#ccc" stroke-width="1"/></svg>' },
    { name: 'moon', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M40 8 A24 24 0 1 0 40 56 A18 18 0 1 1 40 8Z" fill="#f7e78a" stroke="#d4c35a" stroke-width="1.5"/></svg>' },
    { name: 'rainbow', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 44"><path d="M8 40 A32 32 0 0 1 72 40" fill="none" stroke="#e54" stroke-width="4"/><path d="M12 40 A28 28 0 0 1 68 40" fill="none" stroke="#f90" stroke-width="4"/><path d="M16 40 A24 24 0 0 1 64 40" fill="none" stroke="#fd0" stroke-width="4"/><path d="M20 40 A20 20 0 0 1 60 40" fill="none" stroke="#4b4" stroke-width="4"/><path d="M24 40 A16 16 0 0 1 56 40" fill="none" stroke="#48f" stroke-width="4"/><path d="M28 40 A12 12 0 0 1 52 40" fill="none" stroke="#a4e" stroke-width="4"/></svg>' },
    { name: 'sparkle', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 2 L36 26 L60 32 L36 38 L32 62 L28 38 L4 32 L28 26 Z" fill="#f7c948" stroke="#d4a820" stroke-width="1"/></svg>' },
    { name: 'butterfly', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><ellipse cx="20" cy="22" rx="14" ry="16" fill="#c490e0" stroke="#9060b0" stroke-width="1" transform="rotate(-15 20 22)"/><ellipse cx="44" cy="22" rx="14" ry="16" fill="#c490e0" stroke="#9060b0" stroke-width="1" transform="rotate(15 44 22)"/><ellipse cx="22" cy="42" rx="10" ry="14" fill="#e0a0d0" stroke="#9060b0" stroke-width="1" transform="rotate(-10 22 42)"/><ellipse cx="42" cy="42" rx="10" ry="14" fill="#e0a0d0" stroke="#9060b0" stroke-width="1" transform="rotate(10 42 42)"/><line x1="32" y1="12" x2="32" y2="58" stroke="#555" stroke-width="2"/></svg>' },
    { name: 'leaf', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M10 54 Q10 20 32 8 Q54 20 54 54 Z" fill="#6ab04c" stroke="#3a7a2c" stroke-width="1.5"/><line x1="32" y1="12" x2="32" y2="54" stroke="#3a7a2c" stroke-width="1.5"/></svg>' },
    { name: 'music', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><ellipse cx="18" cy="50" rx="10" ry="7" fill="#555"/><ellipse cx="50" cy="44" rx="10" ry="7" fill="#555"/><line x1="28" y1="50" x2="28" y2="10" stroke="#555" stroke-width="3"/><line x1="60" y1="44" x2="60" y2="8" stroke="#555" stroke-width="3"/><path d="M28 10 Q44 4 60 8" fill="none" stroke="#555" stroke-width="3"/></svg>' },
  ];

  // ── File-based stickers (PNG assets) ──
  const FILE_STICKERS = [
    { name: 'Dino', src: 'assets/stickers/sticker_02.png' },
    { name: 'Cupcake', src: 'assets/stickers/sticker_04.png' },
    { name: 'Caticorn', src: 'assets/stickers/sticker_06.png' },
    { name: 'Cloud', src: 'assets/stickers/sticker_08.png' },
    { name: 'Palette', src: 'assets/stickers/sticker_10.png' },
    { name: 'Sloth', src: 'assets/stickers/sticker_12.png' },
    { name: 'Ice Cream', src: 'assets/stickers/sticker_14.png' },
    { name: 'Jelly', src: 'assets/stickers/sticker_16.png' },
    { name: 'Glue', src: 'assets/stickers/sticker_18.png' },
    { name: 'Strawberry', src: 'assets/stickers/sticker_20.png' },
    { name: 'Narwhal', src: 'assets/stickers/sticker_22.png' },
    { name: 'Yarn', src: 'assets/stickers/sticker_24.png' },
    { name: 'Eggplant', src: 'assets/stickers/sticker_26.png' },
    { name: 'Octopus', src: 'assets/stickers/sticker_28.png' },
    { name: 'Flying Pig', src: 'assets/stickers/sticker_30.png' },
    { name: 'Paint', src: 'assets/stickers/sticker_32.png' },
  ];

  const DEFAULT_SWATCHES = [
    '#222222', '#ffffff', '#e87461', '#f7c948', '#6ab04c',
    '#4a90d9', '#9b59b6', '#e0a080', '#f0a0c0', '#7ec8e3',
    '#c0c0c0', '#8b5e3c'
  ];

  // ── State ──
  const state = {
    canvasWidth: 1200,
    canvasHeight: 800,
    zoom: 1,
    activeBrush: 'pen',
    brushSize: 4,
    brushOpacity: 1,
    color: '#222222',
    layers: [],       // { id, name, canvas, ctx, visible }
    activeLayerId: null,
    undoStack: [],
    redoStack: [],
    maxUndoSteps: 30,
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    traceImage: null,
    swatches: [...DEFAULT_SWATCHES],
    strokePoints: [],
    // Sticker placement state
    stickerMode: null,    // { svg, img, size } when placing a sticker
    stickerPos: null,     // { x, y } current position during placement
    stickerDragging: false,
    stickerRotation: 0,
  };

  // ── DOM references ──
  const $ = (sel) => document.querySelector(sel);
  const container = $('#canvas-container');
  const traceCanvas = $('#trace-canvas');
  const traceCtx = traceCanvas.getContext('2d');
  const previewCanvas = $('#preview-canvas');
  const previewCtx = previewCanvas.getContext('2d');

  // ── Initialization ──
  function init() {
    setCanvasSize(state.canvasWidth, state.canvasHeight);
    addLayer('Layer 1');
    renderLayerList();
    renderSwatches();
    renderStickers();
    showDailyPrompt();
    bindEvents();
    updateUndoRedoButtons();
    tryLoadProject();
  }

  // ── Canvas sizing ──
  function setCanvasSize(w, h) {
    state.canvasWidth = w;
    state.canvasHeight = h;
    container.style.width = w + 'px';
    container.style.height = h + 'px';
    traceCanvas.width = w;
    traceCanvas.height = h;
    previewCanvas.width = w;
    previewCanvas.height = h;
    state.layers.forEach(l => {
      l.canvas.width = w;
      l.canvas.height = h;
    });
    fitZoom();
  }

  function fitZoom() {
    const area = $('#canvas-area');
    const padded = 40;
    const scaleX = (area.clientWidth - padded) / state.canvasWidth;
    const scaleY = (area.clientHeight - padded) / state.canvasHeight;
    state.zoom = Math.min(1, scaleX, scaleY);
    applyZoom();
  }

  function applyZoom() {
    container.style.transform = `scale(${state.zoom})`;
    $('#zoom-label').textContent = Math.round(state.zoom * 100) + '%';
  }

  // ── Layer management ──
  let layerIdCounter = 0;

  function addLayer(name) {
    const id = ++layerIdCounter;
    const canvas = document.createElement('canvas');
    canvas.width = state.canvasWidth;
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
    const layer = state.layers[idx];
    layer.canvas.remove();
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
    list.innerHTML = '';
    for (let i = state.layers.length - 1; i >= 0; i--) {
      const l = state.layers[i];
      const li = document.createElement('li');
      li.className = 'layer-item' + (l.id === state.activeLayerId ? ' active' : '');
      li.innerHTML = `
        <input type="checkbox" class="layer-visibility" ${l.visible ? 'checked' : ''} title="Toggle visibility">
        <span class="layer-name">${l.name}</span>
        <button class="layer-delete" title="Delete layer">&times;</button>
      `;
      li.querySelector('.layer-name').addEventListener('click', () => {
        state.activeLayerId = l.id;
        renderLayerList();
      });
      li.querySelector('.layer-visibility').addEventListener('change', (e) => {
        l.visible = e.target.checked;
        l.canvas.style.display = l.visible ? '' : 'none';
      });
      li.querySelector('.layer-delete').addEventListener('click', () => removeLayer(l.id));
      list.appendChild(li);
    }
  }

  // ── Undo / Redo ──
  function captureState() {
    return state.layers.map(l => ({
      id: l.id,
      name: l.name,
      visible: l.visible,
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
    if (state.undoStack.length === 0) return;
    state.redoStack.push(captureState());
    restoreState(state.undoStack.pop());
    updateUndoRedoButtons();
  }

  function redo() {
    if (state.redoStack.length === 0) return;
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
    $('#btn-undo').disabled = state.undoStack.length === 0;
    $('#btn-redo').disabled = state.redoStack.length === 0;
  }

  // ── Multi-touch / gesture tracking ──
  const touch = {
    pointers: new Map(),   // pointerId -> { x, y }
    pinchStartDist: 0,
    pinchStartValue: 0,    // zoom level or sticker size at pinch start
    pinchStartAngle: 0,
    rotateStartValue: 0,
    isGesture: false,       // true when 2+ fingers are down
  };

  function trackPointer(e) {
    touch.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  }

  function untrackPointer(e) {
    touch.pointers.delete(e.pointerId);
    if (touch.pointers.size < 2) touch.isGesture = false;
  }

  function getPinchData() {
    const pts = [...touch.pointers.values()];
    if (pts.length < 2) return null;
    const dx = pts[1].x - pts[0].x;
    const dy = pts[1].y - pts[0].y;
    return {
      dist: Math.hypot(dx, dy),
      angle: Math.atan2(dy, dx) * 180 / Math.PI,
      midX: (pts[0].x + pts[1].x) / 2,
      midY: (pts[0].y + pts[1].y) / 2,
    };
  }

  // ── Drawing ──
  function getCanvasPos(e) {
    const rect = previewCanvas.getBoundingClientRect();
    const scaleX = state.canvasWidth / rect.width;
    const scaleY = state.canvasHeight / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function startStroke(e) {
    e.preventDefault();
    trackPointer(e);

    // Two-finger gesture start
    if (touch.pointers.size === 2) {
      touch.isGesture = true;
      state.isDrawing = false; // cancel any single-finger stroke in progress
      state.strokePoints = [];
      const pinch = getPinchData();
      touch.pinchStartDist = pinch.dist;
      touch.pinchStartAngle = pinch.angle;
      if (state.stickerMode) {
        touch.pinchStartValue = state.stickerMode.size;
        touch.rotateStartValue = state.stickerRotation;
      } else {
        touch.pinchStartValue = state.zoom;
      }
      return;
    }

    // Ignore if already in a gesture
    if (touch.isGesture || touch.pointers.size > 1) return;

    // Sticker placement mode
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

    if (state.activeBrush === 'sprinkles') {
      drawSprinkle(layer.ctx, pos.x, pos.y);
    } else if (state.activeBrush === 'fairylights') {
      drawFairyLight(layer.ctx, pos.x, pos.y);
    }
  }

  function moveStroke(e) {
    e.preventDefault();
    trackPointer(e);

    // Handle two-finger pinch/rotate gesture
    if (touch.isGesture && touch.pointers.size >= 2) {
      const pinch = getPinchData();
      if (!pinch) return;
      const scale = pinch.dist / touch.pinchStartDist;
      if (state.stickerMode) {
        // Pinch to resize sticker
        state.stickerMode.size = Math.max(16, Math.min(600,
          touch.pinchStartValue * scale));
        // Two-finger rotate sticker
        const angleDelta = pinch.angle - touch.pinchStartAngle;
        state.stickerRotation = touch.rotateStartValue + angleDelta;
        // Move sticker to midpoint of gesture
        const rect = previewCanvas.getBoundingClientRect();
        const sx = state.canvasWidth / rect.width;
        const sy = state.canvasHeight / rect.height;
        state.stickerPos = {
          x: (pinch.midX - rect.left) * sx,
          y: (pinch.midY - rect.top) * sy,
        };
        drawStickerPreview();
      } else {
        // Pinch to zoom canvas
        state.zoom = Math.max(0.1, Math.min(4, touch.pinchStartValue * scale));
        applyZoom();
      }
      return;
    }

    // Single finger: sticker preview follows pointer
    if (state.stickerMode) {
      const pos = getCanvasPos(e);
      state.stickerPos = pos;
      drawStickerPreview();
      return;
    }
    if (!state.isDrawing) return;
    const layer = getActiveLayer();
    if (!layer) return;
    const pos = getCanvasPos(e);
    state.strokePoints.push(pos);

    const ctx = layer.ctx;
    const brush = state.activeBrush;

    if (brush === 'pen' || brush === 'marker') {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = state.brushSize;
      ctx.strokeStyle = state.color;
      ctx.globalAlpha = brush === 'marker' ? state.brushOpacity * 0.5 : state.brushOpacity;
      if (brush === 'marker') {
        ctx.globalCompositeOperation = 'multiply';
      }
      ctx.beginPath();
      ctx.moveTo(state.lastX, state.lastY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.restore();
    } else if (brush === 'eraser') {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = state.brushSize;
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
    // Commit sticker on pointer up if we were dragging it (single finger)
    if (state.stickerMode && state.stickerDragging && !touch.isGesture) {
      commitSticker();
      return;
    }
    // If all fingers are up after a gesture, reset
    if (touch.pointers.size === 0) {
      touch.isGesture = false;
    }
    state.isDrawing = false;
    state.strokePoints = [];
  }

  // ── Procedural Brushes ──
  function drawSprinkle(ctx, x, y) {
    const count = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < count; i++) {
      ctx.save();
      ctx.globalAlpha = state.brushOpacity;
      const spread = state.brushSize * 3;
      const sx = x + (Math.random() - 0.5) * spread;
      const sy = y + (Math.random() - 0.5) * spread;
      const r = Math.random() * state.brushSize * 0.5 + 1;
      const shapes = ['circle', 'rect', 'line'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const hueShift = Math.floor(Math.random() * 60) - 30;
      ctx.fillStyle = shiftHue(state.color, hueShift);
      ctx.strokeStyle = shiftHue(state.color, hueShift);
      ctx.lineWidth = Math.max(1, r * 0.5);

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
    ctx.lineWidth = Math.max(1, state.brushSize * 0.4);
    ctx.lineCap = 'round';

    const dist = Math.hypot(x2 - x1, y2 - y1);
    const amplitude = state.brushSize * 1.5;
    const freq = 0.08;
    const steps = Math.max(2, Math.floor(dist));

    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const bx = x1 + (x2 - x1) * t;
      const by = y1 + (y2 - y1) * t;
      const perpX = -(y2 - y1) / (dist || 1);
      const perpY = (x2 - x1) / (dist || 1);
      const wave = Math.sin((state.strokePoints.length + i) * freq) * amplitude;
      const px = bx + perpX * wave;
      const py = by + perpY * wave;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Occasional leaves
    if (Math.random() < 0.15) {
      const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * amplitude * 2;
      const my = (y1 + y2) / 2 + (Math.random() - 0.5) * amplitude * 2;
      ctx.fillStyle = shiftHue(state.color, 20);
      ctx.beginPath();
      ctx.ellipse(mx, my, state.brushSize * 0.8, state.brushSize * 0.3, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawFairyLightSegment(ctx, x1, y1, x2, y2) {
    ctx.save();
    ctx.globalAlpha = state.brushOpacity * 0.6;
    ctx.strokeStyle = state.color;
    ctx.lineWidth = Math.max(1, state.brushSize * 0.2);
    ctx.setLineDash([4, 4]);

    const dist = Math.hypot(x2 - x1, y2 - y1);
    const sag = state.brushSize * 0.8;
    const perpX = -(y2 - y1) / (dist || 1);
    const perpY = (x2 - x1) / (dist || 1);
    const cx = (x1 + x2) / 2 + perpX * sag * Math.sin(state.strokePoints.length * 0.1);
    const cy = (y1 + y2) / 2 + perpY * sag * Math.sin(state.strokePoints.length * 0.1);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(cx, cy, x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function drawFairyLight(ctx, x, y) {
    if (Math.random() > 0.3) return;
    ctx.save();
    const radius = state.brushSize * 0.6 + Math.random() * state.brushSize * 0.4;
    const colors = ['#f7c948', '#e87461', '#7ec8e3', '#f0a0c0', '#6ab04c', '#ffffff'];
    const c = colors[Math.floor(Math.random() * colors.length)];
    ctx.globalAlpha = state.brushOpacity * 0.8;
    ctx.fillStyle = c;
    ctx.shadowColor = c;
    ctx.shadowBlur = radius * 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ── Color helpers ──
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
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    return [h, s, l];
  }

  function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  // ── Swatches ──
  function renderSwatches() {
    const container = $('#color-swatches');
    container.innerHTML = '';
    state.swatches.forEach(c => {
      const el = document.createElement('div');
      el.className = 'swatch' + (c === state.color ? ' active' : '');
      el.style.background = c;
      if (c === '#ffffff') el.style.border = '2px solid #ddd';
      el.addEventListener('click', () => {
        state.color = c;
        $('#color-picker').value = c;
        renderSwatches();
      });
      container.appendChild(el);
    });
  }

  // ── Stickers ──
  function renderStickers() {
    const list = $('#sticker-list');
    list.innerHTML = '';

    // Inline SVG stickers
    STICKERS.forEach(st => {
      const btn = document.createElement('button');
      btn.className = 'sticker-btn';
      btn.title = st.name;
      btn.innerHTML = st.svg;
      btn.querySelector('svg').style.width = '28px';
      btn.querySelector('svg').style.height = '28px';
      btn.addEventListener('click', () => { enterStickerMode(st); closeToolbarIfMobile(); });
      list.appendChild(btn);
    });

    // File-based PNG stickers
    FILE_STICKERS.forEach(st => {
      const btn = document.createElement('button');
      btn.className = 'sticker-btn sticker-btn-img';
      btn.title = st.name;
      const img = document.createElement('img');
      img.src = st.src;
      img.alt = st.name;
      img.draggable = false;
      btn.appendChild(img);
      btn.addEventListener('click', () => { enterStickerModeFromFile(st); closeToolbarIfMobile(); });
      list.appendChild(btn);
    });
  }

  function parseSvgAspect(svgStr) {
    const match = svgStr.match(/viewBox="[\s]*([^\s"]+)[\s]+([^\s"]+)[\s]+([^\s"]+)[\s]+([^\s"]+)"/);
    if (match) {
      const vw = parseFloat(match[3]);
      const vh = parseFloat(match[4]);
      if (vw > 0 && vh > 0) return vw / vh;
    }
    return 1;
  }

  function enterStickerMode(sticker) {
    // Exit any previous sticker mode
    exitStickerMode();

    const size = state.brushSize * 6 + 40;
    const aspect = parseSvgAspect(sticker.svg);
    const blob = new Blob([sticker.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      state.stickerMode = { svg: sticker.svg, img, size, name: sticker.name, aspect };
      state.stickerPos = { x: state.canvasWidth / 2, y: state.canvasHeight / 2 };
      state.stickerRotation = 0;
      state.stickerDragging = false;
      previewCanvas.style.cursor = 'none';
      container.classList.add('sticker-mode');
      document.querySelectorAll('.sticker-btn').forEach(b => b.classList.remove('placing'));
      document.querySelectorAll('.sticker-btn').forEach(b => {
        if (b.title === sticker.name) b.classList.add('placing');
      });
      $('#sticker-touch-controls').classList.remove('hidden');
      drawStickerPreview();
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (isTouchDevice) {
        showToast('Tap to place. Pinch to resize & rotate.');
      } else {
        showToast('Click to place. Scroll to resize. Shift+scroll to rotate. Esc to cancel.');
      }
    };
    img.src = url;
  }

  function enterStickerModeFromFile(sticker) {
    exitStickerMode();

    const size = state.brushSize * 6 + 40;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const aspect = img.naturalWidth / img.naturalHeight || 1;
      state.stickerMode = { img, size, name: sticker.name, aspect };
      state.stickerPos = { x: state.canvasWidth / 2, y: state.canvasHeight / 2 };
      state.stickerRotation = 0;
      state.stickerDragging = false;
      previewCanvas.style.cursor = 'none';
      container.classList.add('sticker-mode');
      document.querySelectorAll('.sticker-btn').forEach(b => b.classList.remove('placing'));
      document.querySelectorAll('.sticker-btn').forEach(b => {
        if (b.title === sticker.name) b.classList.add('placing');
      });
      $('#sticker-touch-controls').classList.remove('hidden');
      drawStickerPreview();
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (isTouchDevice) {
        showToast('Tap to place. Pinch to resize & rotate.');
      } else {
        showToast('Click to place. Scroll to resize. Shift+scroll to rotate. Esc to cancel.');
      }
    };
    img.src = sticker.src;
  }

  function exitStickerMode() {
    state.stickerMode = null;
    state.stickerPos = null;
    state.stickerDragging = false;
    previewCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
    previewCanvas.style.cursor = 'crosshair';
    container.classList.remove('sticker-mode');
    document.querySelectorAll('.sticker-btn').forEach(b => b.classList.remove('placing'));
    $('#sticker-touch-controls').classList.add('hidden');
  }

  function stickerDims() {
    const { size, aspect } = state.stickerMode;
    // size controls the larger dimension; the other scales by aspect ratio
    let w, h;
    if (aspect >= 1) {
      w = size;
      h = size / aspect;
    } else {
      w = size * aspect;
      h = size;
    }
    return { w, h };
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

    // Draw size/rotation hint ring
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

  // ── Daily Prompt ──
  function showDailyPrompt() {
    const today = new Date().toDateString();
    let seed = 0;
    for (let i = 0; i < today.length; i++) seed += today.charCodeAt(i);
    const idx = seed % PROMPTS.length;
    $('#prompt-text').textContent = PROMPTS[idx];
  }

  function randomPrompt() {
    const idx = Math.floor(Math.random() * PROMPTS.length);
    $('#prompt-text').textContent = PROMPTS[idx];
  }

  // ── Image Import (Tracing) ──
  function importTraceImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        state.traceImage = img;
        traceCtx.clearRect(0, 0, state.canvasWidth, state.canvasHeight);
        const scale = Math.min(state.canvasWidth / img.width, state.canvasHeight / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (state.canvasWidth - w) / 2;
        const y = (state.canvasHeight - h) / 2;
        traceCtx.drawImage(img, x, y, w, h);
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

  // ── Export ──
  function exportPNG() {
    const merged = document.createElement('canvas');
    merged.width = state.canvasWidth;
    merged.height = state.canvasHeight;
    const mctx = merged.getContext('2d');
    mctx.fillStyle = '#ffffff';
    mctx.fillRect(0, 0, merged.width, merged.height);

    state.layers.forEach(l => {
      if (l.visible) mctx.drawImage(l.canvas, 0, 0);
    });

    const link = document.createElement('a');
    link.download = 'elsies-spark-' + Date.now() + '.png';
    link.href = merged.toDataURL('image/png');
    link.click();
  }

  // ── Save / Load (localStorage) ──
  function saveProject() {
    try {
      const data = {
        canvasWidth: state.canvasWidth,
        canvasHeight: state.canvasHeight,
        swatches: state.swatches,
        layers: state.layers.map(l => ({
          id: l.id,
          name: l.name,
          visible: l.visible,
          data: l.canvas.toDataURL(),
        })),
        activeLayerId: state.activeLayerId,
      };
      localStorage.setItem('elsiespark-project', JSON.stringify(data));
      showToast('Project saved!');
    } catch (e) {
      showToast('Save failed: storage may be full.');
    }
  }

  function loadProject() {
    showGallery();
  }

  function tryLoadProject() {
    const raw = localStorage.getItem('elsiespark-project');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      restoreProject(data);
    } catch (e) {
      // Ignore corrupt data
    }
  }

  function restoreProject(data) {
    // Remove existing layers
    state.layers.forEach(l => l.canvas.remove());
    state.layers = [];

    state.canvasWidth = data.canvasWidth || 1200;
    state.canvasHeight = data.canvasHeight || 800;
    $('#canvas-width').value = state.canvasWidth;
    $('#canvas-height').value = state.canvasHeight;

    container.style.width = state.canvasWidth + 'px';
    container.style.height = state.canvasHeight + 'px';
    traceCanvas.width = state.canvasWidth;
    traceCanvas.height = state.canvasHeight;
    previewCanvas.width = state.canvasWidth;
    previewCanvas.height = state.canvasHeight;

    if (data.swatches) {
      state.swatches = data.swatches;
      renderSwatches();
    }

    data.layers.forEach(ld => {
      const layer = addLayer(ld.name);
      layer.id = ld.id;
      layer.visible = ld.visible;
      layer.canvas.style.display = ld.visible ? '' : 'none';
      const img = new Image();
      img.onload = () => layer.ctx.drawImage(img, 0, 0);
      img.src = ld.data;
    });

    layerIdCounter = Math.max(...data.layers.map(l => l.id), 0);
    state.activeLayerId = data.activeLayerId || state.layers[0]?.id;
    renderLayerList();
    fitZoom();
  }

  function showGallery() {
    const raw = localStorage.getItem('elsiespark-project');
    const body = $('#modal-body');
    if (!raw) {
      body.innerHTML = '<p>No saved projects found.</p>';
    } else {
      try {
        const data = JSON.parse(raw);
        body.innerHTML = '<div class="gallery-grid"></div>';
        const grid = body.querySelector('.gallery-grid');
        const item = document.createElement('div');
        item.className = 'gallery-item';

        // Generate thumbnail from first visible layer
        const thumbLayer = data.layers.find(l => l.visible) || data.layers[0];
        item.innerHTML = `
          <img src="${thumbLayer ? thumbLayer.data : ''}" alt="Saved project">
          <div class="gallery-label">Saved Project</div>
          <div class="gallery-actions">
            <button class="btn-gallery-load">Load</button>
            <button class="btn-gallery-delete">Delete</button>
          </div>
        `;
        item.querySelector('.btn-gallery-load').addEventListener('click', () => {
          restoreProject(data);
          closeModal();
          showToast('Project loaded!');
        });
        item.querySelector('.btn-gallery-delete').addEventListener('click', () => {
          localStorage.removeItem('elsiespark-project');
          closeModal();
          showToast('Project deleted.');
        });
        grid.appendChild(item);
      } catch (e) {
        body.innerHTML = '<p>Error reading saved data.</p>';
      }
    }
    showModal('Load Project');
  }

  // ── Modal ──
  function showModal(title) {
    $('#modal-title').textContent = title;
    $('#modal-overlay').classList.remove('hidden');
  }

  function closeModal() {
    $('#modal-overlay').classList.add('hidden');
  }

  // ── Toast ──
  function showToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.style.cssText = 'position:fixed;bottom:60px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:8px 20px;border-radius:20px;font-size:13px;z-index:10000;opacity:0;transition:opacity 0.3s;pointer-events:none;';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    setTimeout(() => { toast.style.opacity = '0'; }, 2000);
  }

  // ── New Canvas ──
  function newCanvas() {
    if (!confirm('Start a new canvas? Unsaved work will be lost.')) return;
    state.layers.forEach(l => l.canvas.remove());
    state.layers = [];
    state.undoStack = [];
    state.redoStack = [];
    layerIdCounter = 0;
    clearTrace();
    addLayer('Layer 1');
    renderLayerList();
    updateUndoRedoButtons();
  }

  // ── Resize ──
  function resizeCanvas() {
    const w = parseInt($('#canvas-width').value) || 1200;
    const h = parseInt($('#canvas-height').value) || 800;
    if (w === state.canvasWidth && h === state.canvasHeight) return;

    pushUndo();
    // Save current content
    const layerData = state.layers.map(l => ({
      id: l.id,
      data: l.ctx.getImageData(0, 0, state.canvasWidth, state.canvasHeight),
    }));

    setCanvasSize(w, h);

    // Restore content
    layerData.forEach(ld => {
      const layer = state.layers.find(l => l.id === ld.id);
      if (layer) layer.ctx.putImageData(ld.data, 0, 0);
    });
  }

  // ── Toolbar toggle (mobile) ──
  function closeToolbarIfMobile() {
    const toolbar = $('#toolbar');
    if (toolbar.classList.contains('open')) {
      toggleToolbar();
    }
  }

  function toggleToolbar() {
    const toolbar = $('#toolbar');
    const open = toolbar.classList.toggle('open');
    let backdrop = document.getElementById('toolbar-backdrop');
    if (open) {
      if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'toolbar-backdrop';
        document.getElementById('app').appendChild(backdrop);
        backdrop.addEventListener('click', toggleToolbar);
      }
      backdrop.classList.add('visible');
    } else if (backdrop) {
      backdrop.classList.remove('visible');
    }
  }

  // ── Event Binding ──
  function bindEvents() {
    // Drawing events on preview canvas
    previewCanvas.addEventListener('pointerdown', startStroke);
    previewCanvas.addEventListener('pointermove', moveStroke);
    previewCanvas.addEventListener('pointerup', endStroke);
    previewCanvas.addEventListener('pointerleave', endStroke);
    previewCanvas.addEventListener('pointercancel', endStroke);
    previewCanvas.style.touchAction = 'none';

    // Scroll to resize sticker / pinch-to-zoom canvas on desktop
    previewCanvas.addEventListener('wheel', (e) => {
      if (state.stickerMode) {
        e.preventDefault();
        if (e.shiftKey) {
          state.stickerRotation += e.deltaY > 0 ? 15 : -15;
        } else {
          const delta = e.deltaY > 0 ? -8 : 8;
          state.stickerMode.size = Math.max(16, Math.min(600, state.stickerMode.size + delta));
        }
        drawStickerPreview();
      } else if (e.ctrlKey || e.metaKey) {
        // Ctrl+scroll to zoom canvas (desktop trackpad pinch fires this)
        e.preventDefault();
        const factor = e.deltaY > 0 ? 0.95 : 1.05;
        state.zoom = Math.max(0.1, Math.min(4, state.zoom * factor));
        applyZoom();
      }
    }, { passive: false });

    // Hamburger menu toggle
    $('#btn-menu').addEventListener('click', toggleToolbar);

    // Sticker touch control buttons
    $('#sticker-shrink').addEventListener('click', () => {
      if (!state.stickerMode) return;
      state.stickerMode.size = Math.max(16, state.stickerMode.size - 12);
      drawStickerPreview();
    });
    $('#sticker-grow').addEventListener('click', () => {
      if (!state.stickerMode) return;
      state.stickerMode.size = Math.min(600, state.stickerMode.size + 12);
      drawStickerPreview();
    });
    $('#sticker-rotate-left').addEventListener('click', () => {
      if (!state.stickerMode) return;
      state.stickerRotation -= 15;
      drawStickerPreview();
    });
    $('#sticker-rotate-right').addEventListener('click', () => {
      if (!state.stickerMode) return;
      state.stickerRotation += 15;
      drawStickerPreview();
    });
    $('#sticker-cancel').addEventListener('click', () => {
      exitStickerMode();
    });

    // Brush selection
    document.querySelectorAll('.brush-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (state.stickerMode) exitStickerMode();
        document.querySelectorAll('.brush-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeBrush = btn.dataset.brush;
        closeToolbarIfMobile();
      });
    });

    // Brush size
    $('#brush-size').addEventListener('input', (e) => {
      state.brushSize = parseInt(e.target.value);
      $('#brush-size-label').textContent = state.brushSize + 'px';
    });

    // Brush opacity
    $('#brush-opacity').addEventListener('input', (e) => {
      state.brushOpacity = parseInt(e.target.value) / 100;
      $('#brush-opacity-label').textContent = e.target.value + '%';
    });

    // Color
    $('#color-picker').addEventListener('input', (e) => {
      state.color = e.target.value;
      renderSwatches();
    });

    // Layer add
    $('#btn-add-layer').addEventListener('click', () => {
      addLayer();
      pushUndo();
    });

    // Undo/Redo
    $('#btn-undo').addEventListener('click', undo);
    $('#btn-redo').addEventListener('click', redo);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.stickerMode) {
        exitStickerMode();
        return;
      }
      if (e.target.tagName === 'INPUT') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo(); else undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveProject();
      }
    });

    // Zoom
    $('#btn-zoom-in').addEventListener('click', () => {
      state.zoom = Math.min(4, state.zoom * 1.2);
      applyZoom();
    });
    $('#btn-zoom-out').addEventListener('click', () => {
      state.zoom = Math.max(0.1, state.zoom / 1.2);
      applyZoom();
    });
    $('#btn-zoom-fit').addEventListener('click', fitZoom);

    // Top actions
    $('#btn-new').addEventListener('click', newCanvas);
    $('#btn-save').addEventListener('click', saveProject);
    $('#btn-load').addEventListener('click', loadProject);
    $('#btn-export').addEventListener('click', exportPNG);

    // Resize
    $('#btn-resize').addEventListener('click', resizeCanvas);

    // Import
    $('#btn-import-image').addEventListener('click', () => $('#file-import').click());
    $('#file-import').addEventListener('change', (e) => {
      if (e.target.files[0]) importTraceImage(e.target.files[0]);
      e.target.value = '';
    });
    $('#btn-clear-trace').addEventListener('click', clearTrace);

    // Prompt
    $('#prompt-refresh').addEventListener('click', randomPrompt);

    // Modal
    $('#modal-close').addEventListener('click', closeModal);
    $('#modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal();
    });

    // Window resize
    window.addEventListener('resize', fitZoom);
  }

  // ── Start ──
  init();
})();
