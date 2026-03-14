// ── Gallery View — display, open, delete, archive, import/export projects ──
import state from '../state.js';
import bus from '../EventBus.js';
import { $, showToast, dataURLtoBlob, blobToDataURL } from '../utils.js';
import { dbGetAll, dbDelete, dbPut, dbGetStorageEstimate } from '../db.js';
import { showView } from './ViewRouter.js';

// ═══════════════════════════════════════════════════════
// GALLERY RENDERING
// ═══════════════════════════════════════════════════════
let galleryFilter = 'all'; // 'all' | 'favourites'

async function loadAllProjects() {
  try {
    return await dbGetAll();
  } catch (e) {
    console.error('Failed to load projects:', e);
    return [];
  }
}

async function toggleFavourite(projectId) {
  const projects = await loadAllProjects();
  const p = projects.find(pr => pr.id === projectId);
  if (!p) return;
  p.favourite = !p.favourite;
  await dbPut(p);
  renderGallery();
}

async function renderGallery() {
  const grid  = $('#gallery-grid');
  const empty = $('#gallery-empty');
  if (!grid) return;
  grid.innerHTML = '';
  const allProjects = await loadAllProjects();
  const projects = galleryFilter === 'favourites'
    ? allProjects.filter(p => p.favourite)
    : allProjects;
  const count = $('#gallery-count');
  if (count) {
    let storageInfo = '';
    try {
      const est = await dbGetStorageEstimate();
      if (est) {
        const usedMB = (est.used / 1024 / 1024).toFixed(1);
        storageInfo = ' · ' + usedMB + ' MB used';
      }
    } catch (_) {}
    count.textContent = allProjects.length + (allProjects.length === 1 ? ' drawing' : ' drawings') + storageInfo;
  }

  if (projects.length === 0) {
    if (empty) empty.classList.remove('hidden');
    return;
  }
  if (empty) empty.classList.add('hidden');

  projects.forEach(p => {
    const el = document.createElement('div');
    el.className = 'gallery-thumb';
    const img = document.createElement('img');
    // Support both blob and data URL thumbnails
    if (p.thumbnailBlob instanceof Blob) {
      img.src = URL.createObjectURL(p.thumbnailBlob);
    } else {
      img.src = p.thumbnail || '';
    }
    img.alt = p.prompt || 'Drawing';
    el.appendChild(img);
    const label = document.createElement('div');
    label.className = 'gallery-thumb-label';
    label.textContent = p.date || '';
    el.appendChild(label);
    // Favourite button
    const favBtn = document.createElement('button');
    favBtn.className = 'gallery-thumb-fav' + (p.favourite ? ' active' : '');
    favBtn.title = p.favourite ? 'Remove from favourites' : 'Add to favourites';
    favBtn.innerHTML = '<svg viewBox="0 0 20 20" width="16" height="16" fill="' + (p.favourite ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17s-7-4.5-7-9a4 4 0 018 0 4 4 0 018 0c0 4.5-7 9-7 9z"/></svg>';
    favBtn.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); toggleFavourite(p.id); });
    favBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
    el.appendChild(favBtn);
    // Archive button (export + delete)
    const archBtn = document.createElement('button');
    archBtn.className = 'gallery-thumb-archive';
    archBtn.title = 'Archive (export & remove)';
    archBtn.innerHTML = '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="14" height="5" rx="1"/><path d="M4 8v8a1 1 0 001 1h10a1 1 0 001-1V8"/><path d="M8 12h4"/></svg>';
    archBtn.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); archiveProject(p.id); });
    archBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
    el.appendChild(archBtn);
    // Export button
    const expBtn = document.createElement('button');
    expBtn.className = 'gallery-thumb-export';
    expBtn.title = 'Export to file';
    expBtn.innerHTML = '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14v3h14v-3"/><polyline points="10,12 10,3"/><polyline points="6,7 10,3 14,7"/></svg>';
    expBtn.addEventListener('click', (e) => { e.stopPropagation(); e.preventDefault(); exportProject(p.id); });
    expBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
    el.appendChild(expBtn);
    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'gallery-thumb-delete';
    delBtn.innerHTML = '&times;';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      showDeleteModal(p.id);
    });
    // Block pointer events from reaching the thumb underneath
    delBtn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
    });
    el.appendChild(delBtn);
    // Thumb click — open project for editing
    let thumbDown = null;
    el.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.gallery-thumb-delete, .gallery-thumb-export, .gallery-thumb-archive, .gallery-thumb-fav')) return;
      thumbDown = { x: e.clientX, y: e.clientY };
    });
    el.addEventListener('pointerup', (e) => {
      if (e.target.closest('.gallery-thumb-delete, .gallery-thumb-export, .gallery-thumb-archive, .gallery-thumb-fav')) return;
      if (thumbDown) {
        const dx = e.clientX - thumbDown.x, dy = e.clientY - thumbDown.y;
        if (dx * dx + dy * dy < 15 * 15) {
          bus.emit('project:load', p);
          bus.emit('spark:setPrompt', p.prompt || 'Drawing');
          const promptEl = $('#draw-prompt-text');
          if (promptEl) promptEl.textContent = p.prompt || 'Drawing';
          showView('draw');
          bus.emit('fitZoom');
        }
      }
      thumbDown = null;
    });
    grid.appendChild(el);
  });
}

// ═══════════════════════════════════════════════════════
// DELETE MODAL
// ═══════════════════════════════════════════════════════
function showDeleteModal(projectId) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box">
      <h3>Delete Drawing?</h3>
      <p>This can't be undone. Are you sure you want to delete this drawing?</p>
      <div class="modal-actions">
        <button class="modal-btn-cancel">Cancel</button>
        <button class="modal-btn-danger">Delete</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('.modal-btn-cancel').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  overlay.querySelector('.modal-btn-danger').addEventListener('click', async () => {
    await deleteProject(projectId);
    overlay.remove();
    renderGallery();
  });
}

async function deleteProject(projectId) {
  await dbDelete(projectId);
  if (state.currentProjectId === projectId) {
    state.currentProjectId = null;
  }
}

// ═══════════════════════════════════════════════════════
// EXPORT / IMPORT / ARCHIVE
// ═══════════════════════════════════════════════════════
async function exportProject(projectId) {
  const projects = await loadAllProjects();
  const p = projects.find(pr => pr.id === projectId);
  if (!p) { showToast('Project not found'); return; }
  // Convert blobs to base64 data URLs for portable JSON export
  const exportData = { ...p };
  if (exportData.thumbnailBlob instanceof Blob) {
    exportData.thumbnail = await blobToDataURL(exportData.thumbnailBlob);
    delete exportData.thumbnailBlob;
  }
  if (exportData.layers) {
    exportData.layers = await Promise.all(exportData.layers.map(async l => {
      const lCopy = { ...l };
      if (lCopy.dataBlob instanceof Blob) {
        lCopy.data = await blobToDataURL(lCopy.dataBlob);
        delete lCopy.dataBlob;
      }
      return lCopy;
    }));
  }
  const data = JSON.stringify(exportData);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const name = (p.prompt || 'drawing').replace(/[^a-z0-9]+/gi, '_').substring(0, 40);
  a.download = name + '.elsie';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Exported!');
}

async function archiveProject(projectId) {
  await exportProject(projectId);
  await deleteProject(projectId);
  renderGallery();
  showToast('Archived & removed from storage');
}

async function importProjectFromFile(file) {
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data.layers || !Array.isArray(data.layers)) {
        showToast('Invalid file format');
        return;
      }
      // Assign a new ID to avoid collisions
      data.id = Date.now();
      data.sortOrder = data.id;
      // Convert base64 data URLs to blobs for IndexedDB storage
      for (const layer of data.layers) {
        if (layer.data && typeof layer.data === 'string') {
          layer.dataBlob = await dataURLtoBlob(layer.data);
          delete layer.data;
        }
      }
      if (data.thumbnail && typeof data.thumbnail === 'string') {
        data.thumbnailBlob = await dataURLtoBlob(data.thumbnail);
        delete data.thumbnail;
      }
      await dbPut(data);
      renderGallery();
      showToast('Imported!');
    } catch (e) {
      showToast('Failed to import — invalid file');
    }
  };
  reader.readAsText(file);
}

// ═══════════════════════════════════════════════════════
// PROFILE AVATAR (shared with gallery hero)
// ═══════════════════════════════════════════════════════
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
// INIT
// ═══════════════════════════════════════════════════════
function initGalleryView() {
  // ── Gallery navigation ──
  $('#btn-back-gallery').addEventListener('click', () => showView('room'));
  $('#btn-gallery-draw').addEventListener('click', () => showView('draw'));

  // ── Filter tabs ──
  const tabs = document.querySelectorAll('#gallery-tabs .gallery-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      galleryFilter = tab.dataset.filter || 'all';
      renderGallery();
    });
  });

  // ── Import button wiring ──
  const importBtn = $('#btn-gallery-import');
  const importInput = $('#import-file-input');
  if (importBtn && importInput) {
    importBtn.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) importProjectFromFile(file);
      importInput.value = '';
    });
  }

  // ── Enter gallery view ──
  bus.on('view:enterGallery', async () => {
    loadProfileAvatar();
    await renderGallery();
  });
}

export { initGalleryView, renderGallery, deleteProject, loadProfileAvatar, loadAllProjects };
export default { initGalleryView, renderGallery, deleteProject, loadProfileAvatar, loadAllProjects };
