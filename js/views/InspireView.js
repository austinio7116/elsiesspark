// ── Inspire View — daily spark cards with prompts ──
import state from '../state.js';
import bus from '../EventBus.js';
import { $ } from '../utils.js';
import { PROMPTS, MORIAH_PROMPTS } from '../constants/prompts.js';
import { showView } from './ViewRouter.js';

// ═══════════════════════════════════════════════════════
// MODULE STATE
// ═══════════════════════════════════════════════════════
let inspireIndex = 0;
let inspireSparks = [];
let inspireExhausted = false;
let activeSparkPrompt = null; // currently selected spark for drawing
let inspireDay = null; // track which day we initialized for

// ═══════════════════════════════════════════════════════
// DAILY SPARK GENERATOR
// ═══════════════════════════════════════════════════════
function getDailySparks() {
  const today = new Date().toDateString();
  let seed = 0;
  for (let i = 0; i < today.length; i++) seed += today.charCodeAt(i);
  // Pick 2 from PROMPTS + 1 from MORIAH_PROMPTS using seeded pseudo-random
  const picked = [];
  let s = seed;
  // Pick 2 unique standard prompts
  while (picked.length < 2) {
    s = (s * 9301 + 49297) % 233280;
    const idx = s % PROMPTS.length;
    if (!picked.includes(PROMPTS[idx])) picked.push(PROMPTS[idx]);
  }
  // Pick 1 Moriah prompt
  s = (s * 9301 + 49297) % 233280;
  const mIdx = s % MORIAH_PROMPTS.length;
  picked.push(MORIAH_PROMPTS[mIdx]);
  // Shuffle using seed so order is consistent for the day
  s = (s * 9301 + 49297) % 233280;
  const insertPos = s % 3;
  const moriah = picked.pop();
  picked.splice(insertPos, 0, moriah);
  return picked;
}

// ═══════════════════════════════════════════════════════
// INSPIRE CARD BUILDER
// ═══════════════════════════════════════════════════════

// Color palettes matching the screenshot aesthetic
const INSPIRE_PALETTES = [
  { bg: '#f08080', accent1: '#f4a7a7', accent2: '#80ddb0', accent3: '#60b8c8' },
  { bg: '#5cc8e8', accent1: '#e87878', accent2: '#6aaa6a', accent3: '#60b8c8' },
  { bg: '#7ec89c', accent1: '#e87878', accent2: '#6aaa6a', accent3: '#5090d0' },
  { bg: '#c490e0', accent1: '#f0c060', accent2: '#80d8b0', accent3: '#e87878' },
  { bg: '#f0b860', accent1: '#e87878', accent2: '#80c8e8', accent3: '#80d890' },
  { bg: '#f490b0', accent1: '#80d8b0', accent2: '#f0c060', accent3: '#6090d0' },
];

// Shape types: circle, pentagon, rounded-rect
const INSPIRE_SHAPES = ['circle', 'pentagon', 'rect'];

function buildInspireCard(promptText, index) {
  const palette = INSPIRE_PALETTES[index % INSPIRE_PALETTES.length];
  const shapeType = INSPIRE_SHAPES[index % INSPIRE_SHAPES.length];

  // Set background via SVG deco
  const deco = $('#inspire-deco');
  const w = 400, h = 780;
  // Procedural floating shapes
  const seed = promptText.length + index * 37;
  const shapes = [];
  // Background fill
  shapes.push(`<rect width="${w}" height="${h}" fill="${palette.bg}"/>`);
  // Decorative circle (top-left area)
  const cx1 = 40 + (seed * 7) % 60, cy1 = 120 + (seed * 3) % 100;
  shapes.push(`<circle cx="${cx1}" cy="${cy1}" r="${30 + (seed % 15)}" fill="${palette.accent1}" opacity="0.8"/>`);
  // Decorative diamond (bottom-left)
  const dx = 50 + (seed * 5) % 80, dy = h - 200 + (seed * 2) % 80;
  const ds = 25 + (seed % 15);
  shapes.push(`<polygon points="${dx},${dy - ds} ${dx + ds},${dy} ${dx},${dy + ds} ${dx - ds},${dy}" fill="${palette.accent2}" opacity="0.85"/>`);
  // Decorative pentagon (bottom-right)
  const px = w - 60 - (seed * 4) % 60, py = h - 180 + (seed * 6) % 60;
  const pr = 25 + (seed % 10);
  let pentPts = '';
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI * 2 * i / 5) - Math.PI / 2;
    pentPts += `${px + pr * Math.cos(a)},${py + pr * Math.sin(a)} `;
  }
  shapes.push(`<polygon points="${pentPts.trim()}" fill="${palette.accent3}" opacity="0.85"/>`);
  deco.innerHTML = shapes.join('');
  deco.setAttribute('viewBox', `0 0 ${w} ${h}`);

  // Central shape — build SVG without destroying the prompt text element
  const shapeEl = $('#inspire-shape');
  let shapeSvg;
  if (shapeType === 'circle') {
    shapeSvg = '<svg viewBox="0 0 260 260"><circle cx="130" cy="130" r="130" fill="white"/></svg>';
  } else if (shapeType === 'pentagon') {
    let pts = '';
    for (let i = 0; i < 5; i++) {
      const a = (Math.PI * 2 * i / 5) - Math.PI / 2;
      pts += `${130 + 130 * Math.cos(a)},${130 + 130 * Math.sin(a)} `;
    }
    shapeSvg = `<svg viewBox="0 0 260 260"><polygon points="${pts.trim()}" fill="white"/></svg>`;
  } else {
    shapeSvg = '<svg viewBox="0 0 260 240"><rect x="0" y="0" width="260" height="240" rx="6" fill="white"/></svg>';
  }

  // Set shape SVG + re-create prompt text and go label inside
  shapeEl.innerHTML = shapeSvg + `<p id="inspire-prompt-text" class="inspire-prompt-text"></p><span class="inspire-go-label" style="text-decoration-color:${palette.bg}">Let's go</span>`;

  // Prompt text
  $('#inspire-prompt-text').textContent = promptText;
}

function restoreInspireContent() {
  const content = $('.inspire-content');
  content.innerHTML = `
    <div class="inspire-shape-wrap">
      <button id="inspire-shape" class="inspire-shape" aria-label="Start drawing with this prompt">
        <p id="inspire-prompt-text" class="inspire-prompt-text"></p>
        <span class="inspire-go-label">Let's go</span>
      </button>
    </div>
  `;
  // Re-bind shape as button
  $('#inspire-shape').addEventListener('click', onInspireGo);
}

// ═══════════════════════════════════════════════════════
// VIEW ENTER / CARD NAVIGATION
// ═══════════════════════════════════════════════════════
function onEnterInspire() {
  const today = new Date().toDateString();
  if (inspireDay !== today) {
    // New day — reset everything
    inspireSparks = getDailySparks();
    inspireIndex = 0;
    inspireExhausted = false;
    inspireDay = today;
  }
  // Restore DOM if we're coming back from "come back tomorrow" state
  if (!$('#inspire-shape')) {
    restoreInspireContent();
  }
  showInspireCard();
}

function showInspireCard() {
  const content = $('.inspire-content');
  const nextBtn = $('#btn-inspire-next');

  if (inspireExhausted) {
    // Show "come back tomorrow" then allow cycling
    content.innerHTML = `
      <div class="inspire-shape-wrap">
        <p class="inspire-done-msg">You've seen all 3 sparks for today!</p>
        <p class="inspire-done-msg" style="font-size:16px;font-weight:600;opacity:0.7;margin-top:8px;">Come back tomorrow for new ones</p>
        <button class="inspire-back-btn" id="btn-inspire-cycle">See them again</button>
        <button class="inspire-back-btn" id="btn-inspire-home">Back to room</button>
      </div>
    `;
    // Neutral background
    const deco = $('#inspire-deco');
    deco.setAttribute('viewBox', '0 0 400 780');
    deco.innerHTML = '<rect width="400" height="780" fill="#d4cfc8"/>';
    nextBtn.style.display = 'none';
    $('#btn-inspire-back-room').style.display = 'none';

    $('#btn-inspire-cycle').addEventListener('click', () => {
      inspireIndex = 0;
      inspireExhausted = false;
      restoreInspireContent();
      showInspireCard();
    });
    $('#btn-inspire-home').addEventListener('click', () => {
      showView('room');
    });
    return;
  }

  buildInspireCard(inspireSparks[inspireIndex], inspireIndex);
  nextBtn.style.display = '';
  $('#btn-inspire-back-room').style.display = '';
}

// ═══════════════════════════════════════════════════════
// GO — start drawing with selected spark
// ═══════════════════════════════════════════════════════
function onInspireGo() {
  const prompt = inspireSparks[inspireIndex];
  function startNewDrawing() {
    activeSparkPrompt = prompt;
    bus.emit('spark:setPrompt', prompt);
    const el = $('#draw-prompt-text');
    if (el) el.textContent = prompt;
    showView('draw');
  }
  // Emit event so ProjectManager can check for unsaved content and handle save/reset
  bus.emit('project:promptSaveAndReset', startNewDrawing);
}

// ═══════════════════════════════════════════════════════
// INSPIRE INDEX ADVANCE (called after "Done" in draw view)
// ═══════════════════════════════════════════════════════
function advanceInspire() {
  inspireIndex++;
  if (inspireIndex >= inspireSparks.length) {
    inspireExhausted = true;
  }
}

// ═══════════════════════════════════════════════════════
// ACTIVE SPARK ACCESSORS
// ═══════════════════════════════════════════════════════
function getActiveSparkPrompt() {
  return activeSparkPrompt;
}

function setActiveSparkPrompt(prompt) {
  activeSparkPrompt = prompt;
}

function getInspireState() {
  return { inspireIndex, inspireSparks, inspireExhausted, activeSparkPrompt };
}

// ═══════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════
function initInspireView() {
  // ── Inspire shape click (initial binding) ──
  $('#inspire-shape').addEventListener('click', onInspireGo);

  // ── Inspire navigation ──
  $('#btn-inspire-back-room').addEventListener('click', () => showView('room'));
  $('#btn-inspire-next').addEventListener('click', () => {
    inspireIndex++;
    if (inspireIndex >= inspireSparks.length) {
      inspireExhausted = true;
    }
    showInspireCard();
  });

  // ── Enter inspire view ──
  bus.on('view:enterInspire', onEnterInspire);

  // ── Allow other modules to set the active spark prompt ──
  bus.on('spark:setPrompt', prompt => { activeSparkPrompt = prompt; });

  // ── Allow other modules to clear the active spark ──
  bus.on('spark:clear', () => { activeSparkPrompt = null; });

  // ── Allow other modules to advance the inspire index ──
  bus.on('inspire:advance', advanceInspire);
}

export {
  initInspireView,
  onEnterInspire,
  showInspireCard,
  onInspireGo,
  advanceInspire,
  getActiveSparkPrompt,
  setActiveSparkPrompt,
  getInspireState,
  getDailySparks,
};
export default {
  initInspireView,
  advanceInspire,
  getActiveSparkPrompt,
  setActiveSparkPrompt,
  getDailySparks,
};
