import Brush from './Brush.js';
import { hslToRgb } from '../utils.js';

export default class RainbowBrush extends Brush {
  constructor() {
    super('rainbow');
  }

  render(ctx, obj) {
    const pts = obj.points;
    const opacity = obj.opacity || 1;
    const soft = obj.softness || 0;
    const useSoft = soft > 0;

    const tgt = useSoft ? Brush.getSoftTmpCtx(ctx.canvas.width, ctx.canvas.height) : ctx;
    if (useSoft) {
      tgt.save();
      tgt.translate(obj.x, obj.y);
      tgt.rotate(obj.rotation * Math.PI / 180);
      tgt.scale(obj.scale || 1, obj.scale || 1);
    }

    const numBands = Math.max(14, Math.round(obj.brushSize * 0.8));
    const bandWidth = obj.brushSize / numBands;

    // Compute raw normals at each point
    const rawNormals = [];
    for (let i = 0; i < pts.length; i++) {
      let dx, dy;
      if (pts.length === 1) { dx = 1; dy = 0; }
      else if (i === 0) { dx = pts[1].x - pts[0].x; dy = pts[1].y - pts[0].y; }
      else if (i === pts.length - 1) { dx = pts[i].x - pts[i - 1].x; dy = pts[i].y - pts[i - 1].y; }
      else { dx = pts[i + 1].x - pts[i - 1].x; dy = pts[i + 1].y - pts[i - 1].y; }
      const len = Math.hypot(dx, dy) || 1;
      rawNormals.push({ x: -dy / len, y: dx / len });
    }

    // Smooth normals with a moving average
    const normals = [];
    const smoothR = Math.min(4, Math.floor(pts.length / 6));
    for (let i = 0; i < pts.length; i++) {
      let sx = 0, sy = 0, cnt = 0;
      for (let j = Math.max(0, i - smoothR); j <= Math.min(pts.length - 1, i + smoothR); j++) {
        sx += rawNormals[j].x; sy += rawNormals[j].y; cnt++;
      }
      const len = Math.hypot(sx, sy) || 1;
      normals.push({ x: sx / len, y: sy / len });
    }

    tgt.lineCap = 'round';
    tgt.lineJoin = 'round';
    tgt.lineWidth = bandWidth + 1.5;
    tgt.globalAlpha = opacity;

    for (let b = 0; b < numBands; b++) {
      const t = b / (numBands - 1);
      const hue = t * 270;
      const rgb = hslToRgb(hue / 360, 1, 0.5);
      const offset = (b - (numBands - 1) / 2) * bandWidth;
      tgt.strokeStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
      tgt.beginPath();
      const ox0 = pts[0].x + normals[0].x * offset;
      const oy0 = pts[0].y + normals[0].y * offset;
      tgt.moveTo(ox0, oy0);
      if (pts.length === 1) {
        tgt.lineTo(ox0, oy0);
      } else {
        for (let i = 1; i < pts.length - 1; i++) {
          const cx = pts[i].x + normals[i].x * offset;
          const cy = pts[i].y + normals[i].y * offset;
          const nx = pts[i + 1].x + normals[i + 1].x * offset;
          const ny = pts[i + 1].y + normals[i + 1].y * offset;
          tgt.quadraticCurveTo(cx, cy, (cx + nx) / 2, (cy + ny) / 2);
        }
        const last = pts.length - 1;
        tgt.lineTo(pts[last].x + normals[last].x * offset, pts[last].y + normals[last].y * offset);
      }
      tgt.stroke();
    }

    if (useSoft) {
      tgt.restore();
      ctx.restore();
      ctx.save();
      ctx.filter = `blur(${soft * obj.brushSize * 0.4}px)`;
      ctx.drawImage(tgt.canvas, 0, 0);
      ctx.filter = 'none';
    }
  }
}
