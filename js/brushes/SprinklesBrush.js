import Brush from './Brush.js';
import { rgbToHsl, hslToRgb } from '../utils.js';

export default class SprinklesBrush extends Brush {
  constructor() {
    super('sprinkles');
  }

  render(ctx, obj) {
    const pts = obj.points;
    const opacity = obj.opacity || 1;

    const seed = obj.id || 0;
    const rng = (function(s) { return function() { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; }; })(seed);
    const hex = obj.color;
    const cr = parseInt(hex.slice(1, 3), 16), cg = parseInt(hex.slice(3, 5), 16), cb = parseInt(hex.slice(5, 7), 16);
    const baseHsl = rgbToHsl(cr, cg, cb);
    const density = obj.sprinklesDensity || 5;
    const step = Math.max(2, obj.brushSize * (1.4 - density * 0.1));
    for (let i = 0; i < pts.length - 1; i++) {
      const dx = pts[i + 1].x - pts[i].x;
      const dy = pts[i + 1].y - pts[i].y;
      const segLen = Math.hypot(dx, dy);
      const steps = Math.max(1, Math.floor(segLen / step));
      for (let j = 0; j < steps; j++) {
        const t = j / steps;
        const bx = pts[i].x + dx * t;
        const by = pts[i].y + dy * t;
        const count = Math.max(1, Math.floor(density * 0.4));
        for (let k = 0; k < count; k++) {
          const spread = obj.brushSize * 1.5;
          const sx = bx + (rng() - 0.5) * spread * 2;
          const sy = by + (rng() - 0.5) * spread * 2;
          const r = rng() * obj.brushSize * 0.2 + obj.brushSize * 0.1;
          const hueShift = (rng() - 0.5) * 0.15;
          const satAdj = Math.min(1, baseHsl[1] + 0.2);
          const lightAdj = Math.max(0.4, Math.min(0.8, baseHsl[2] + (rng() - 0.3) * 0.3));
          const rgb = hslToRgb(baseHsl[0] + hueShift, satAdj, lightAdj);
          ctx.globalAlpha = (rng() * 0.3 + 0.7) * opacity;
          const shape = rng();
          if (shape < 0.3) {
            // Heart
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(rng() * 0.6 - 0.3);
            ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
            const hr = r * 0.7;
            ctx.beginPath();
            ctx.moveTo(0, hr * 0.5);
            ctx.bezierCurveTo(-hr, -hr * 0.3, -hr * 0.5, -hr * 1.3, 0, -hr * 0.4);
            ctx.bezierCurveTo(hr * 0.5, -hr * 1.3, hr, -hr * 0.3, 0, hr * 0.5);
            ctx.fill();
            ctx.restore();
          } else if (shape < 0.55) {
            // Star
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(rng() * Math.PI * 2);
            ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
            const sr = r * 0.8;
            const spikes = 4 + Math.floor(rng() * 2);
            ctx.beginPath();
            for (let s = 0; s < spikes * 2; s++) {
              const ang = (s / (spikes * 2)) * Math.PI * 2;
              const rad = s % 2 === 0 ? sr : sr * 0.4;
              if (s === 0) ctx.moveTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
              else ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
            }
            ctx.closePath();
            ctx.fill();
            // Highlight dot in center
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.arc(0, 0, sr * 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else if (shape < 0.8) {
            // Circle dot with highlight
            ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
            ctx.beginPath();
            ctx.arc(sx, sy, r * 0.55, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.beginPath();
            ctx.arc(sx - r * 0.12, sy - r * 0.12, r * 0.2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Short capsule sprinkle
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(rng() * Math.PI);
            ctx.lineCap = 'round';
            ctx.lineWidth = r * 0.7;
            ctx.strokeStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
            const len = r * 1.4;
            ctx.beginPath();
            ctx.moveTo(-len, 0);
            ctx.lineTo(len, 0);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    }
  }
}
