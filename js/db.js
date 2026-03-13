// IndexedDB Storage (replaces localStorage for projects)
import { dataURLtoBlob } from './utils.js';

const DB_NAME = 'elsiespark-db';
const DB_VERSION = 1;
const STORE_NAME = 'projects';
let _db = null;

export function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('date', 'sortOrder', { unique: false });
      }
    };
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onerror = () => reject(req.error);
  });
}

export async function dbPut(project) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(project);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function dbGetAll() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => {
      const results = req.result || [];
      results.sort((a, b) => (b.sortOrder || 0) - (a.sortOrder || 0));
      resolve(results);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function dbDelete(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function dbGetStorageEstimate() {
  if (navigator.storage && navigator.storage.estimate) {
    const est = await navigator.storage.estimate();
    return { used: est.usage || 0, quota: est.quota || 0 };
  }
  return null;
}

// Migrate from localStorage to IndexedDB (one-time)
export async function migrateFromLocalStorage() {
  const migrated = localStorage.getItem('elsiespark-migrated-to-idb');
  if (migrated) return;
  try {
    let projects = [];
    const raw = localStorage.getItem('elsiespark-projects');
    if (raw) projects = JSON.parse(raw);
    else {
      const legacy = localStorage.getItem('elsiespark-project');
      if (legacy) { const p = JSON.parse(legacy); p.id = Date.now(); projects = [p]; }
    }
    for (let i = 0; i < projects.length; i++) {
      const p = projects[i];
      p.sortOrder = p.id || Date.now() - i;
      if (p.layers) {
        for (const layer of p.layers) {
          if (layer.data && typeof layer.data === 'string') {
            layer.dataBlob = await dataURLtoBlob(layer.data);
            delete layer.data;
          }
        }
      }
      if (p.thumbnail && typeof p.thumbnail === 'string') {
        p.thumbnailBlob = await dataURLtoBlob(p.thumbnail);
        delete p.thumbnail;
      }
      await dbPut(p);
    }
    localStorage.setItem('elsiespark-migrated-to-idb', '1');
  } catch (e) {
    console.warn('Migration from localStorage failed:', e);
  }
}
