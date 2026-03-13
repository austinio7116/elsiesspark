// ═══════════════════════════════════════════════════════
// BACKGROUND MANAGER — background grid, apply, custom gradients
// ═══════════════════════════════════════════════════════
import state from '../state.js';
import bus from '../EventBus.js';
import { $, $$ } from '../utils.js';
import { BACKGROUNDS } from '../constants/backgrounds.js';

// ── Custom gradient storage ──
let customGradients = [];

// ═══════════════════════════════════════════════════════
// BACKGROUND GRID
// ═══════════════════════════════════════════════════════
export function buildBackgroundGrid() {
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

// ═══════════════════════════════════════════════════════
// APPLY BACKGROUND
// ═══════════════════════════════════════════════════════
export function applyBackground(bgId) {
  const container = $('#canvas-container');
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
    const stopsContainer = document.getElementById('gc-stops');
    stopsContainer.innerHTML = '';
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
      stopsContainer.appendChild(row);
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
// LOAD DYNAMIC BACKGROUNDS FROM MANIFEST
// ═══════════════════════════════════════════════════════
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
// INIT
// ═══════════════════════════════════════════════════════
export function initBackgroundManager() {
  loadCustomGradients();
  buildBackgroundGrid();
  loadDynamicBackgrounds();

  // Listen for applyBackground events from other modules (e.g. CanvasManager)
  bus.on('applyBackground', applyBackground);
}
