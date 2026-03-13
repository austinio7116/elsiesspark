// ── DOM helpers ───────────────────────────────────────
export const $ = (sel) => document.querySelector(sel);
export const $$ = (sel) => document.querySelectorAll(sel);

// ── Toast notification ────────────────────────────────
export function showToast(msg) {
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

// ── Color conversion utilities ────────────────────────
export function rgbToHsl(r, g, b) {
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

export function hslToRgb(h, s, l) {
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

export function hslToHex(h, s, l) {
  const rgb = hslToRgb(h / 360, s / 100, l / 100);
  return '#' + rgb.map(v => v.toString(16).padStart(2, '0')).join('');
}

export function hexToHsl(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const [h, s, l] = rgbToHsl(r, g, b);
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function shiftHue(hex, amount) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const hsl = rgbToHsl(r, g, b);
  hsl[0] = (hsl[0] + amount / 360 + 1) % 1;
  const rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
  return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
}

// Parse base HSL from a hex color (returns { h, s, l } as fractional 0-1 values)
export function parseHexToHslFrac(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const [h, s, l] = rgbToHsl(r, g, b);
  return { h, s, l };
}

// ── Seeded pseudo-random number generator ─────────────
export function createRng(seed) {
  let s = seed;
  return function() {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

// ── SVG aspect ratio parser ───────────────────────────
export function parseSvgAspect(svgStr) {
  const m = svgStr.match(/viewBox="[\s]*([^\s"]+)[\s]+([^\s"]+)[\s]+([^\s"]+)[\s]+([^\s"]+)"/);
  if (m) { const vw = parseFloat(m[3]), vh = parseFloat(m[4]); if (vw > 0 && vh > 0) return vw / vh; }
  return 1;
}

// ── Blob / DataURL conversion ─────────────────────────
export function dataURLtoBlob(dataURL) {
  return fetch(dataURL).then(r => r.blob());
}

export function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
