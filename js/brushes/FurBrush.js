import Brush from './Brush.js';
import { rgbToHsl, hslToRgb } from '../utils.js';

export default class FurBrush extends Brush {
  constructor() {
    super('fur');
  }

  render(ctx, obj) {
    const pts = obj.points;
    const opacity = obj.opacity || 1;
    const seed = obj.id || 0;
    const rng = this.createRng(seed);
    const { r: cr, g: cg, b: cb, hsl: baseHsl } = this.parseColor(obj.color);
    const bSize = obj.brushSize;

    // Path utilities
    let totalLen = 0;
    const segLens = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const sl = Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
      segLens.push(sl);
      totalLen += sl;
    }
    function pointAtDist(d) {
      d = Math.max(0, Math.min(totalLen, d));
      let accum = 0;
      for (let i = 0; i < segLens.length; i++) {
        if (accum + segLens[i] >= d || i === segLens.length - 1) {
          const t = segLens[i] > 0 ? (d - accum) / segLens[i] : 0;
          return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * t, y: pts[i].y + (pts[i + 1].y - pts[i].y) * t };
        }
        accum += segLens[i];
      }
      return pts[pts.length - 1];
    }
    function tangentAtDist(d) {
      const idx = Math.min(pts.length - 1, Math.max(0, Math.floor((d / totalLen) * (pts.length - 1))));
      let dx, dy;
      if (idx === 0 && pts.length > 1) { dx = pts[1].x - pts[0].x; dy = pts[1].y - pts[0].y; }
      else if (idx >= pts.length - 1 && pts.length > 1) { dx = pts[pts.length - 1].x - pts[pts.length - 2].x; dy = pts[pts.length - 1].y - pts[pts.length - 2].y; }
      else { dx = pts[idx + 1].x - pts[idx - 1].x; dy = pts[idx + 1].y - pts[idx - 1].y; }
      const len = Math.hypot(dx, dy) || 1;
      return { tx: dx / len, ty: dy / len, nx: -dy / len, ny: dx / len };
    }
    if (totalLen < 1) return;

    // ── Layer 0: Soft blurred base line for body/volume ──
    const furBlur = obj.furBlur != null ? obj.furBlur : 0.5;
    if (furBlur > 0) {
      ctx.save();
      const blurRadius = Math.max(2, bSize * furBlur * 1.2);
      ctx.filter = `blur(${blurRadius}px)`;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = bSize * (0.6 + furBlur * 1.2);
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = `rgb(${cr},${cg},${cb})`;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Helper: draw a single fur strand as a tapered wavy curve
    function drawStrand(sx, sy, angle, length, baseW, waveAmp, waveFreq, rgb, alpha) {
      const steps = Math.max(4, Math.floor(length / 3));
      const stepLen = length / steps;
      ctx.globalAlpha = opacity * alpha;
      ctx.lineCap = 'round';

      let cx = sx, cy = sy;
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const taper = 1 - t * t; // quadratic taper — thick at root, thin at tip
        const w = Math.max(0.2, baseW * taper);
        const wave = Math.sin(i * waveFreq + seed * 0.01) * waveAmp * (0.5 + t);
        const perpX = -Math.sin(angle);
        const perpY = Math.cos(angle);
        const nx = cx + Math.cos(angle) * stepLen + perpX * wave;
        const ny = cy + Math.sin(angle) * stepLen + perpY * wave;

        // Darken slightly toward tip
        const tBlend = t * 0.15;
        const segR = Math.max(0, Math.round(rgb[0] * (1 - tBlend)));
        const segG = Math.max(0, Math.round(rgb[1] * (1 - tBlend)));
        const segB = Math.max(0, Math.round(rgb[2] * (1 - tBlend)));
        ctx.strokeStyle = `rgb(${segR},${segG},${segB})`;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        cx = nx; cy = ny;
      }
    }

    // ── Layer 1: Undercoat — short, dense, lighter/softer strands ──
    const undercoatSpacing = Math.max(1, bSize * 0.04);
    const undercoatCount = Math.max(8, Math.floor(totalLen / undercoatSpacing));
    for (let u = 0; u < undercoatCount; u++) {
      const d = (u / undercoatCount) * totalLen + (rng() - 0.5) * undercoatSpacing;
      const p = pointAtDist(d);
      const t = tangentAtDist(d);

      const spread = (rng() - 0.5) * bSize * 1.0;
      const sx = p.x + t.nx * spread;
      const sy = p.y + t.ny * spread;

      const angle = Math.atan2(t.ty, t.tx) + (rng() - 0.5) * 0.8;
      const length = bSize * (0.3 + rng() * 0.4);
      const baseW = Math.max(0.3, bSize * 0.02 + rng() * bSize * 0.015);

      const ucRgb = hslToRgb(
        baseHsl[0] + (rng() - 0.5) * 0.03,
        baseHsl[1] * (0.5 + rng() * 0.3),
        Math.min(0.9, baseHsl[2] + 0.15 + rng() * 0.1)
      );

      drawStrand(sx, sy, angle, length, baseW, bSize * 0.01, 2 + rng() * 2, ucRgb, 0.2 + rng() * 0.15);
    }

    // ── Layer 2: Guard hairs — longer, more varied, define the fur silhouette ──
    const guardSpacing = Math.max(1.5, bSize * 0.07);
    const guardCount = Math.max(6, Math.floor(totalLen / guardSpacing));
    for (let g = 0; g < guardCount; g++) {
      const d = (g / guardCount) * totalLen + (rng() - 0.5) * guardSpacing;
      const p = pointAtDist(d);
      const t = tangentAtDist(d);

      const spread = (rng() - 0.5) * bSize * 1.2;
      const sx = p.x + t.nx * spread;
      const sy = p.y + t.ny * spread;

      const angle = Math.atan2(t.ty, t.tx) + (rng() - 0.5) * 1.2;
      const length = bSize * (0.6 + rng() * 0.9);
      const baseW = Math.max(0.4, bSize * 0.025 + rng() * bSize * 0.02);

      const lightVar = (rng() - 0.5) * 0.2;
      const guardRgb = hslToRgb(
        baseHsl[0] + (rng() - 0.5) * 0.04,
        Math.min(1, baseHsl[1] * (0.8 + rng() * 0.4)),
        Math.max(0.05, Math.min(0.85, baseHsl[2] + lightVar))
      );

      const waveAmp = bSize * (0.01 + rng() * 0.02);
      const waveFreq = 1.5 + rng() * 2;

      drawStrand(sx, sy, angle, length, baseW, waveAmp, waveFreq, guardRgb, 0.4 + rng() * 0.35);
    }

    // ── Layer 3: Highlight hairs — sparse, very thin, bright, catch-light strands ──
    const hlCount = Math.max(2, Math.floor(totalLen / (bSize * 1.5)));
    for (let h = 0; h < hlCount; h++) {
      const d = rng() * totalLen;
      const p = pointAtDist(d);
      const t = tangentAtDist(d);

      const spread = (rng() - 0.5) * bSize * 0.8;
      const sx = p.x + t.nx * spread;
      const sy = p.y + t.ny * spread;

      const angle = Math.atan2(t.ty, t.tx) + (rng() - 0.5) * 0.6;
      const length = bSize * (0.5 + rng() * 0.7);
      const baseW = Math.max(0.2, bSize * 0.012);

      const hlRgb = hslToRgb(
        baseHsl[0],
        baseHsl[1] * 0.3,
        Math.min(0.95, baseHsl[2] + 0.3 + rng() * 0.1)
      );

      drawStrand(sx, sy, angle, length, baseW, bSize * 0.005, 3, hlRgb, 0.15 + rng() * 0.15);
    }
  }
}
