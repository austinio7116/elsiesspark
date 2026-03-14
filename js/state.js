// Centralised application state — imported by all modules that need it
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
  brushSize: 20,
  eraserSize: 30,
  brushOpacity: 1,
  brushSoftness: 0,
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
  pendingStrokeId: 0,
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
  // Eraser tool
  eraserMode: false,
  eraserTarget: null,  // the object being erased
  isErasing: false,
  // Color picker
  spectrumHue: 0,
  spectrumS: 0,
  spectrumV: 13,
  spectrumL: 13,
  savedSwatches: [],
  // Background
  selectedBackground: 'white',
  // Brush-specific options
  sprinklesDensity: 5,
  fairylightsUseColor: false,
  treeLeafDensity: 5,
  treeBranchDensity: 5,
  treeMode: 'default',
  rainbowBlur: 0.4,
  furBlur: 0.5,
  paintHead: 'flat',
  paintSize: 20,
  // Project
  currentProjectId: null,
};

export default state;
