import Brush from './Brush.js';
import { rgbToHsl, hslToRgb } from '../utils.js';

export default class VineBrush extends Brush {
  constructor() {
    super('vine');
  }

  render(ctx, obj) {
    const pts = obj.points;
    const opacity = obj.opacity || 1;

    const seed = obj.id || 0;
    const rng = (function(s) { return function() { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; }; })(seed);
    const hex = obj.color;
    const cr = parseInt(hex.slice(1, 3), 16), cg = parseInt(hex.slice(3, 5), 16), cb = parseInt(hex.slice(5, 7), 16);
    const baseHsl = rgbToHsl(cr, cg, cb);
    ctx.globalAlpha = opacity;

    // Draw main vine stem — smooth curve following the stroke path
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const stemWidth = Math.max(1.5, obj.brushSize * 0.15);
    const stemRgb = hslToRgb(baseHsl[0], Math.min(1, baseHsl[1] * 0.9), Math.max(0.15, baseHsl[2] * 0.6));
    ctx.strokeStyle = `rgb(${stemRgb[0]},${stemRgb[1]},${stemRgb[2]})`;
    ctx.lineWidth = stemWidth;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    if (pts.length <= 2) {
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    } else {
      for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i].x + pts[i + 1].x) / 2;
        const my = (pts[i].y + pts[i + 1].y) / 2;
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    }
    ctx.stroke();

    // Compute cumulative arc length for even spacing
    const arcLens = [0];
    for (let i = 1; i < pts.length; i++) {
      arcLens.push(arcLens[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    }
    const totalLen = arcLens[arcLens.length - 1];
    if (totalLen < 2) return;

    function pointAtArc(d) {
      for (let i = 1; i < arcLens.length; i++) {
        if (arcLens[i] >= d) {
          const segT = (d - arcLens[i - 1]) / (arcLens[i] - arcLens[i - 1] || 1);
          return {
            x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * segT,
            y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * segT,
            nx: -(pts[i].y - pts[i - 1].y), ny: pts[i].x - pts[i - 1].x
          };
        }
      }
      return { x: pts[pts.length - 1].x, y: pts[pts.length - 1].y, nx: 0, ny: -1 };
    }

    // Draw leaves along the vine
    const leafSpacing = Math.max(10, obj.brushSize * 1.2);
    let side = 1;
    for (let d = leafSpacing * 0.5; d < totalLen - leafSpacing * 0.3; d += leafSpacing * (0.7 + rng() * 0.6)) {
      const p = pointAtArc(d);
      const nLen = Math.hypot(p.nx, p.ny) || 1;
      const nx = p.nx / nLen, ny = p.ny / nLen;
      side *= -1;
      const leafSize = obj.brushSize * (0.5 + rng() * 0.5);

      // Short stem from vine to leaf
      const stemLen = leafSize * 0.4 + rng() * leafSize * 0.3;
      const stemEndX = p.x + nx * side * stemLen;
      const stemEndY = p.y + ny * side * stemLen;
      ctx.strokeStyle = `rgb(${stemRgb[0]},${stemRgb[1]},${stemRgb[2]})`;
      ctx.lineWidth = stemWidth * 0.6;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(stemEndX, stemEndY);
      ctx.stroke();

      // Draw leaf — teardrop shape
      ctx.save();
      ctx.translate(stemEndX, stemEndY);
      const leafDir = Math.atan2(stemEndY - p.y, stemEndX - p.x) + (rng() - 0.5) * 0.4;
      ctx.rotate(leafDir);

      // Leaf body — varying green shades
      const leafLightness = baseHsl[2] + (rng() - 0.3) * 0.2;
      const leafRgb = hslToRgb(baseHsl[0] + (rng() - 0.5) * 0.06, Math.min(1, baseHsl[1] + 0.1), Math.max(0.2, Math.min(0.75, leafLightness)));
      ctx.fillStyle = `rgb(${leafRgb[0]},${leafRgb[1]},${leafRgb[2]})`;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(leafSize * 0.3, -leafSize * 0.45, leafSize * 0.8, -leafSize * 0.3, leafSize, 0);
      ctx.bezierCurveTo(leafSize * 0.8, leafSize * 0.3, leafSize * 0.3, leafSize * 0.45, 0, 0);
      ctx.fill();

      // Leaf vein (center line)
      const veinRgb = hslToRgb(baseHsl[0], baseHsl[1] * 0.6, Math.min(0.9, leafLightness + 0.15));
      ctx.strokeStyle = `rgb(${veinRgb[0]},${veinRgb[1]},${veinRgb[2]})`;
      ctx.lineWidth = Math.max(0.5, stemWidth * 0.3);
      ctx.beginPath();
      ctx.moveTo(leafSize * 0.1, 0);
      ctx.lineTo(leafSize * 0.85, 0);
      ctx.stroke();

      // Side veins
      ctx.lineWidth = Math.max(0.4, stemWidth * 0.2);
      for (let v = 0.3; v < 0.8; v += 0.2) {
        ctx.beginPath();
        ctx.moveTo(leafSize * v, 0);
        ctx.lineTo(leafSize * (v + 0.12), -leafSize * 0.15);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(leafSize * v, 0);
        ctx.lineTo(leafSize * (v + 0.12), leafSize * 0.15);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Curling tendrils
    for (let d = leafSpacing; d < totalLen; d += leafSpacing * (1.5 + rng() * 2)) {
      if (rng() > 0.5) continue;
      const p = pointAtArc(d);
      const nLen = Math.hypot(p.nx, p.ny) || 1;
      const nx = p.nx / nLen, ny = p.ny / nLen;
      const tSide = rng() > 0.5 ? 1 : -1;
      const curls = 1.5 + rng() * 1.5;
      const tendrilLen = obj.brushSize * (0.6 + rng() * 0.8);
      ctx.strokeStyle = `rgb(${stemRgb[0]},${stemRgb[1]},${stemRgb[2]})`;
      ctx.lineWidth = Math.max(0.5, stemWidth * 0.4);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      const spiralSteps = 20;
      for (let s = 1; s <= spiralSteps; s++) {
        const st = s / spiralSteps;
        const radius = tendrilLen * st * 0.3;
        const angle = st * curls * Math.PI * 2;
        const tx = p.x + nx * tSide * tendrilLen * st + Math.cos(angle) * radius;
        const ty = p.y + ny * tSide * tendrilLen * st + Math.sin(angle) * radius;
        ctx.lineTo(tx, ty);
      }
      ctx.stroke();
    }
  }
}
