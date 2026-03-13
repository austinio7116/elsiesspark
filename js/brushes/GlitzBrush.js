import Brush from './Brush.js';
import { rgbToHsl, hslToRgb } from '../utils.js';

export default class GlitzBrush extends Brush {
  constructor() {
    super('glitz');
  }

  render(ctx, obj) {
    const pts = obj.points;
    const opacity = obj.opacity || 1;

    // Draw the base stroke first
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = obj.brushSize;
    ctx.strokeStyle = obj.color;
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    if (pts.length === 1) {
      ctx.lineTo(pts[0].x, pts[0].y);
    } else {
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2;
        const my = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    }
    ctx.stroke();

    // Glitter particles on top
    const seed = obj.id || 0;
    const rng = (function(s) { return function() { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; }; })(seed);
    const hex = obj.color;
    const cr = parseInt(hex.slice(1, 3), 16), cg = parseInt(hex.slice(3, 5), 16), cb = parseInt(hex.slice(5, 7), 16);
    const baseHsl = rgbToHsl(cr, cg, cb);
    const step = Math.max(2, obj.brushSize * 0.25);
    for (let i = 0; i < pts.length - 1; i++) {
      const dx = pts[i + 1].x - pts[i].x;
      const dy = pts[i + 1].y - pts[i].y;
      const segLen = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.floor(segLen / step));
      for (let j = 0; j < steps; j++) {
        const t = j / steps;
        const bx = pts[i].x + dx * t;
        const by = pts[i].y + dy * t;
        const count = Math.floor(rng() * 4) + 3;
        for (let k = 0; k < count; k++) {
          const spread = obj.brushSize * 0.5;
          const gx = bx + (rng() - 0.5) * spread * 2;
          const gy = by + (rng() - 0.5) * spread * 2;
          const gr = rng() * obj.brushSize * 0.1 + 0.3;
          const bright = rng() * 0.6 + 0.4;
          const lShift = (rng() - 0.3) * 0.4;
          const particleL = Math.max(0.1, Math.min(0.95, baseHsl[2] + lShift));
          const rgb = hslToRgb(baseHsl[0] + (rng() - 0.5) * 0.03, baseHsl[1], particleL);
          ctx.globalAlpha = bright * opacity;
          ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
          ctx.beginPath();
          ctx.arc(gx, gy, gr, 0, Math.PI * 2);
          ctx.fill();
          if (rng() > 0.6) {
            const hlRgb = hslToRgb(baseHsl[0], baseHsl[1] * 0.3, 0.95);
            ctx.strokeStyle = `rgb(${hlRgb[0]},${hlRgb[1]},${hlRgb[2]})`;
            ctx.lineWidth = 0.5;
            ctx.globalAlpha = bright * 0.9 * opacity;
            const arm = gr * 2.5;
            ctx.beginPath();
            ctx.moveTo(gx - arm, gy); ctx.lineTo(gx + arm, gy);
            ctx.moveTo(gx, gy - arm); ctx.lineTo(gx, gy + arm);
            ctx.stroke();
          }
          if (rng() > 0.85) {
            ctx.globalAlpha = bright * opacity;
            ctx.fillStyle = '#fff';
            const ds = gr * 1.5;
            ctx.beginPath();
            ctx.moveTo(gx, gy - ds); ctx.lineTo(gx + ds * 0.4, gy);
            ctx.lineTo(gx, gy + ds); ctx.lineTo(gx - ds * 0.4, gy);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
    }
  }
}
