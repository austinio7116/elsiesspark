import Brush from './Brush.js';
import { hslToRgb } from '../utils.js';

export default class RainbowBrush extends Brush {
  constructor() {
    super('rainbow');
  }

  _computeNormals(pts) {
    const raw = [];
    for (let i = 0; i < pts.length; i++) {
      let dx, dy;
      if (pts.length === 1) { dx = 1; dy = 0; }
      else if (i === 0) { dx = pts[1].x - pts[0].x; dy = pts[1].y - pts[0].y; }
      else if (i === pts.length - 1) { dx = pts[i].x - pts[i - 1].x; dy = pts[i].y - pts[i - 1].y; }
      else { dx = pts[i + 1].x - pts[i - 1].x; dy = pts[i + 1].y - pts[i - 1].y; }
      const len = Math.hypot(dx, dy) || 1;
      raw.push({ x: -dy / len, y: dx / len });
    }
    const normals = [];
    const r = Math.min(8, Math.floor(pts.length / 3));
    for (let i = 0; i < pts.length; i++) {
      let sx = 0, sy = 0;
      for (let j = Math.max(0, i - r); j <= Math.min(pts.length - 1, i + r); j++) {
        sx += raw[j].x; sy += raw[j].y;
      }
      const len = Math.hypot(sx, sy) || 1;
      normals.push({ x: sx / len, y: sy / len });
    }
    return normals;
  }

  _buildClipPath(tgt, pts, normals, halfW) {
    tgt.beginPath();
    tgt.moveTo(pts[0].x + normals[0].x * halfW, pts[0].y + normals[0].y * halfW);
    for (let i = 1; i < pts.length - 1; i++) {
      const cx = pts[i].x + normals[i].x * halfW;
      const cy = pts[i].y + normals[i].y * halfW;
      const nx = pts[i + 1].x + normals[i + 1].x * halfW;
      const ny = pts[i + 1].y + normals[i + 1].y * halfW;
      tgt.quadraticCurveTo(cx, cy, (cx + nx) / 2, (cy + ny) / 2);
    }
    const last = pts.length - 1;
    tgt.lineTo(pts[last].x + normals[last].x * halfW, pts[last].y + normals[last].y * halfW);

    const endAngle = Math.atan2(normals[last].y, normals[last].x);
    tgt.arc(pts[last].x, pts[last].y, halfW, endAngle, endAngle + Math.PI, true);

    for (let i = pts.length - 2; i > 0; i--) {
      const cx = pts[i].x - normals[i].x * halfW;
      const cy = pts[i].y - normals[i].y * halfW;
      const px = pts[i - 1].x - normals[i - 1].x * halfW;
      const py = pts[i - 1].y - normals[i - 1].y * halfW;
      tgt.quadraticCurveTo(cx, cy, (cx + px) / 2, (cy + py) / 2);
    }
    tgt.lineTo(pts[0].x - normals[0].x * halfW, pts[0].y - normals[0].y * halfW);

    const startAngle = Math.atan2(-normals[0].y, -normals[0].x);
    tgt.arc(pts[0].x, pts[0].y, halfW, startAngle, startAngle + Math.PI, true);

    tgt.closePath();
  }

  _tracePath(tgt, pts, normals, offset, extend) {
    let sx, sy;
    if (pts.length >= 2 && extend) {
      const dx = pts[1].x - pts[0].x, dy = pts[1].y - pts[0].y;
      const len = Math.hypot(dx, dy) || 1;
      sx = pts[0].x - (dx / len) * extend + normals[0].x * offset;
      sy = pts[0].y - (dy / len) * extend + normals[0].y * offset;
    } else {
      sx = pts[0].x + normals[0].x * offset;
      sy = pts[0].y + normals[0].y * offset;
    }
    tgt.moveTo(sx, sy);
    if (pts.length === 1) {
      tgt.lineTo(sx, sy);
      return;
    }
    tgt.lineTo(pts[0].x + normals[0].x * offset, pts[0].y + normals[0].y * offset);
    for (let i = 1; i < pts.length - 1; i++) {
      const cx = pts[i].x + normals[i].x * offset;
      const cy = pts[i].y + normals[i].y * offset;
      const nx = pts[i + 1].x + normals[i + 1].x * offset;
      const ny = pts[i + 1].y + normals[i + 1].y * offset;
      tgt.quadraticCurveTo(cx, cy, (cx + nx) / 2, (cy + ny) / 2);
    }
    const last = pts.length - 1;
    const lx = pts[last].x + normals[last].x * offset;
    const ly = pts[last].y + normals[last].y * offset;
    tgt.lineTo(lx, ly);
    if (extend) {
      const dx = pts[last].x - pts[last - 1].x, dy = pts[last].y - pts[last - 1].y;
      const len = Math.hypot(dx, dy) || 1;
      tgt.lineTo(lx + (dx / len) * extend, ly + (dy / len) * extend);
    }
  }

  render(ctx, obj) {
    const pts = obj.points;
    const opacity = obj.opacity || 1;
    const soft = obj.softness || 0;

    // Aggressively downsample — keep roughly every 8th point
    let decimated = pts;
    if (pts.length > 6) {
      const targetCount = Math.max(4, Math.ceil(pts.length / 8));
      const step = (pts.length - 1) / (targetCount - 1);
      decimated = [];
      for (let i = 0; i < targetCount; i++) {
        decimated.push(pts[Math.round(i * step)]);
      }
    }
    const smoothPts = decimated;
    const normals = this._computeNormals(smoothPts);

    const widthMultiplier = 2.5;
    const effectiveSize = obj.brushSize * widthMultiplier;
    const halfW = effectiveSize / 2;
    const numBands = Math.max(20, Math.round(obj.brushSize * 1.5));
    const bandSpacing = effectiveSize / numBands;

    // Draw onto getSoftTmpCtx — same pattern PenBrush uses for softness
    const tgt = Brush.getSoftTmpCtx(ctx.canvas.width, ctx.canvas.height);
    tgt.save();
    tgt.translate(obj.x, obj.y);
    tgt.rotate(obj.rotation * Math.PI / 180);
    tgt.scale(obj.scale || 1, obj.scale || 1);

    // Clip to rounded outline
    tgt.save();
    this._buildClipPath(tgt, smoothPts, normals, halfW);
    tgt.clip();

    // Draw solid rainbow bands
    tgt.lineCap = 'butt';
    tgt.lineJoin = 'round';
    tgt.lineWidth = bandSpacing + 1;
    tgt.globalAlpha = 1;

    for (let b = 0; b < numBands; b++) {
      const t = b / (numBands - 1);
      const hue = t * 270;
      const rgb = hslToRgb(hue / 360, 1, 0.5);
      const offset = (b - (numBands - 1) / 2) * bandSpacing;
      tgt.strokeStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
      tgt.beginPath();
      this._tracePath(tgt, smoothPts, normals, offset, halfW);
      tgt.stroke();
    }

    tgt.restore(); // remove clip
    tgt.restore(); // remove translate/rotate/scale

    // Composite back onto ctx with blur — must undo ctx's transform first
    // ctx has been translated/scaled by drawObjectTo, so reset to identity
    ctx.restore(); // undo drawObjectTo's save/translate/scale
    ctx.save();
    const blurAmount = effectiveSize * 0.2 + (soft > 0 ? soft * obj.brushSize * 0.4 : 0);
    ctx.globalAlpha = opacity;
    ctx.filter = `blur(${blurAmount}px)`;
    ctx.drawImage(tgt.canvas, 0, 0);
    ctx.filter = 'none';
    ctx.restore();
    // Re-save so drawObjectTo's final ctx.restore() is balanced
    ctx.save();
  }
}
