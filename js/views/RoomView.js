// ── Room View — home hub with hotspots and horizontal pan ──
import state from '../state.js';
import bus from '../EventBus.js';
import { $ } from '../utils.js';
import { showView } from './ViewRouter.js';

let roomPanX = 0;
let roomPanMin = 0;
let roomPanReady = false;
let activeSparkPrompt = null;

// ═══════════════════════════════════════════════════════
// ROOM HORIZONTAL PAN
// ═══════════════════════════════════════════════════════
function centerRoomPan() {
  if (!roomPanReady) return;
  // Defer to next frame so the view has been laid out after display:flex
  requestAnimationFrame(() => {
    const scene = $('#room-scene');
    const pan = $('#room-pan');
    const img = $('#room-bg');
    if (!scene || !img || !img.naturalWidth) return;
    // Recalculate pan width from image aspect ratio (same as onReady)
    const ratio = img.naturalWidth / img.naturalHeight;
    const panW = scene.clientHeight * ratio;
    pan.style.width = panW + 'px';
    roomPanMin = scene.clientWidth - panW;
    roomPanX = roomPanMin / 2; // center
    pan.style.transform = 'translateX(' + roomPanX + 'px)';
  });
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

  scene.addEventListener('pointerup', () => {
    dragging = false;
    pan.style.transition = '';
  });

  scene.addEventListener('pointercancel', () => {
    dragging = false;
    pan.style.transition = '';
  });
}

// ═══════════════════════════════════════════════════════
// ROOM HOTSPOT BINDINGS
// ═══════════════════════════════════════════════════════
function initRoomView() {
  initRoomPan();

  // ── Room hotspots ──
  $('#hotspot-easel').addEventListener('click', () => {
    if (activeSparkPrompt) {
      showView('draw'); // resume current drawing
    } else {
      showView('inspire'); // pick a spark first
    }
  });
  $('#hotspot-gallery').addEventListener('click', () => showView('gallery'));
  $('#hotspot-bell').addEventListener('click', () => showView('news'));
  $('#hotspot-lightbulb').addEventListener('click', () => {
    showView('inspire');
  });
  $('#hotspot-cat').addEventListener('click', () => {
    const overlay = $('#tutorial-overlay');
    const pan = $('#room-pan');
    overlay.classList.toggle('hidden');
    pan.classList.toggle('tutorial-active');
  });
  $('#tutorial-overlay').addEventListener('click', () => {
    $('#tutorial-overlay').classList.add('hidden');
    $('#room-pan').classList.remove('tutorial-active');
  });

  // ── News navigation ──
  $('#btn-back-news').addEventListener('click', () => showView('room'));

  // Listen for view:enterRoom to center pan
  bus.on('view:enterRoom', centerRoomPan);
}

// ── Active spark prompt accessors ──
function getActiveSparkPrompt() {
  return activeSparkPrompt;
}

function setActiveSparkPrompt(prompt) {
  activeSparkPrompt = prompt;
}

// Allow other modules to read/write active spark prompt via bus
bus.on('spark:setPrompt', prompt => { activeSparkPrompt = prompt; });

export { initRoomView, centerRoomPan, getActiveSparkPrompt, setActiveSparkPrompt };
export default { initRoomView, centerRoomPan, getActiveSparkPrompt, setActiveSparkPrompt };
