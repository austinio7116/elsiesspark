import Brush from './Brush.js';
import { rgbToHsl, hslToRgb } from '../utils.js';

export default class GrassBrush extends Brush {
  constructor() {
    super('grass');
  }

  render(ctx, obj) {
    const pts = obj.points;
    const opacity = obj.opacity || 1;
    const seed = obj.id || 0;
    const rng = this.createRng(seed);
    const { r: cr, g: cg, b: cb, hsl: baseHsl } = this.parseColor(obj.color);
    const bSize = obj.brushSize;

    // Path length
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
    function normalAtDist(d) {
      const idx = Math.min(pts.length - 1, Math.max(0, Math.floor((d / totalLen) * (pts.length - 1))));
      let dx, dy;
      if (idx === 0 && pts.length > 1) { dx = pts[1].x - pts[0].x; dy = pts[1].y - pts[0].y; }
      else if (idx >= pts.length - 1 && pts.length > 1) { dx = pts[pts.length - 1].x - pts[pts.length - 2].x; dy = pts[pts.length - 1].y - pts[pts.length - 2].y; }
      else { dx = pts[idx + 1].x - pts[idx - 1].x; dy = pts[idx + 1].y - pts[idx - 1].y; }
      const len = Math.hypot(dx, dy) || 1;
      return { nx: -dy / len, ny: dx / len };
    }
    if (totalLen < 1) return;

    // Draw blades at intervals along the stroke
    const bladeSpacing = Math.max(1.5, bSize * 0.06);
    const bladeCount = Math.max(5, Math.floor(totalLen / bladeSpacing));

    for (let b = 0; b < bladeCount; b++) {
      const d = (b / bladeCount) * totalLen + (rng() - 0.5) * bladeSpacing * 0.8;
      const p = pointAtDist(d);
      const n = normalAtDist(d);

      // Spread blades across the brush width
      const spread = (rng() - 0.5) * bSize * 1.2;
      const baseX = p.x + n.nx * spread;
      const baseY = p.y + n.ny * spread;

      // Blade height — varies, taller near center of brush, shorter at edges
      const edgeFactor = 1 - Math.abs(spread) / (bSize * 0.7);
      const bladeH = bSize * (0.8 + rng() * 1.2) * Math.max(0.3, edgeFactor);

      // Blade grows upward (negative Y) with some lean
      const lean = (rng() - 0.5) * bSize * 0.6;
      const tipX = baseX + lean;
      const tipY = baseY - bladeH;

      // Control point for the bend — creates natural grass curve
      const bendX = baseX + lean * (0.3 + rng() * 0.4) + (rng() - 0.5) * bSize * 0.2;
      const bendY = baseY - bladeH * (0.4 + rng() * 0.3);

      // Color: base is darker, tip is lighter/yellower
      const hueShift = (rng() - 0.5) * 0.06;
      const baseSat = Math.min(1, baseHsl[1] * (0.9 + rng() * 0.3));
      const baseLight = Math.max(0.08, baseHsl[2] * (0.6 + rng() * 0.3));
      const tipLight = Math.min(0.9, baseHsl[2] + 0.1 + rng() * 0.15);

      // Draw blade as tapered stroke (thick at base, thin at tip)
      const baseWidth = Math.max(0.5, bSize * 0.03 + rng() * bSize * 0.025);

      // Draw in two halves for taper effect
      const baseRgb = hslToRgb(baseHsl[0] + hueShift, baseSat, baseLight);
      const tipRgb = hslToRgb(baseHsl[0] + hueShift + 0.02, baseSat * 0.8, tipLight);

      // Lower half — thicker, darker
      ctx.globalAlpha = opacity * (0.6 + rng() * 0.35);
      ctx.strokeStyle = `rgb(${baseRgb[0]},${baseRgb[1]},${baseRgb[2]})`;
      ctx.lineWidth = baseWidth;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.quadraticCurveTo(bendX, bendY, tipX, tipY);
      ctx.stroke();

      // Overlay lighter tip half
      const midX = (baseX + bendX + tipX) / 3;
      const midY = (baseY + bendY + tipY) / 3;
      ctx.globalAlpha = opacity * (0.3 + rng() * 0.3);
      ctx.strokeStyle = `rgb(${tipRgb[0]},${tipRgb[1]},${tipRgb[2]})`;
      ctx.lineWidth = baseWidth * 0.5;
      ctx.beginPath();
      ctx.moveTo(midX, midY);
      ctx.quadraticCurveTo((bendX + tipX) / 2, (bendY + tipY) / 2, tipX, tipY);
      ctx.stroke();

      // Occasional seed head or small detail at blade tip
      if (rng() > 0.9) {
        ctx.globalAlpha = opacity * 0.4;
        const seedRgb = hslToRgb(baseHsl[0] + 0.05, baseHsl[1] * 0.5, tipLight + 0.1);
        ctx.fillStyle = `rgb(${seedRgb[0]},${seedRgb[1]},${seedRgb[2]})`;
        ctx.beginPath();
        ctx.arc(tipX, tipY, baseWidth * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Ground shadow along the base of the stroke
    ctx.globalAlpha = opacity * 0.08;
    const groundRgb = hslToRgb(baseHsl[0], baseHsl[1] * 0.6, Math.max(0.03, baseHsl[2] * 0.25));
    ctx.strokeStyle = `rgb(${groundRgb[0]},${groundRgb[1]},${groundRgb[2]})`;
    ctx.lineWidth = bSize * 0.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    this.drawSmoothPath(ctx, pts);
  }
}
