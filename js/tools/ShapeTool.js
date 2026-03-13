// ═══════════════════════════════════════════════════════
// SHAPES SYSTEM (vector shapes placed like stickers)
// ═══════════════════════════════════════════════════════
import state from '../state.js';
import bus from '../EventBus.js';
import { $, parseSvgAspect } from '../utils.js';
import { SHAPES } from '../constants/stickers.js';
import { _startStickerMode } from './StickerTool.js';

export function renderShapes() {
  const list = $('#shape-list');
  if (!list) return;
  list.innerHTML = '';
  SHAPES.forEach(sh => {
    const btn = document.createElement('button');
    btn.className = 'sticker-btn';
    btn.title = sh.name;
    btn.innerHTML = sh.svg;
    btn.querySelector('svg').style.cssText = 'width:36px;height:36px';
    btn.addEventListener('click', () => { enterShapeMode(sh); bus.emit('closeSheet'); });
    list.appendChild(btn);
  });
}

export function enterShapeMode(shape) {
  // Shapes use the sticker pipeline — generate an SVG with the current color
  const coloredSvg = shape.svg.replace(/currentColor/g, state.color);
  const aspect = parseSvgAspect(coloredSvg);
  const blob   = new Blob([coloredSvg], { type: 'image/svg+xml' });
  const url    = URL.createObjectURL(blob);
  const img    = new Image();
  img.onload   = () => { URL.revokeObjectURL(url); _startStickerMode('shape:' + shape.name, img, aspect); };
  img.src      = url;
}
