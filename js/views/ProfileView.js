// ── Profile View — draw-your-own profile picture editor ──
import state from '../state.js';
import bus from '../EventBus.js';
import { $, $$, showToast } from '../utils.js';
import { showView } from './ViewRouter.js';
import { loadProfileAvatar } from './GalleryView.js';

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

// ═══════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════
function initProfileView() {
  // ── Navigation ──
  $('#hotspot-profile').addEventListener('click', () => showView('profile'));
  $('#btn-back-profile').addEventListener('click', () => showView('room'));

  // ── Profile editor ──
  initProfileEditor();

  // ── Enter profile view ──
  bus.on('view:enterProfile', onEnterProfile);
}

export { initProfileView, loadProfileAvatar };
export default { initProfileView };
