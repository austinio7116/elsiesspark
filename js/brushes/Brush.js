import { rgbToHsl, hslToRgb, createRng } from '../utils.js';

export default class Brush {
  constructor(name) {
    this.name = name;
  }

  // Override in subclasses to render the brush stroke
  render(ctx, obj) {
    throw new Error('render() must be implemented by subclass');
  }

  // Common helpers available to all brushes
  parseColor(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b, hsl: rgbToHsl(r, g, b) };
  }

  createRng(seed) {
    return createRng(seed);
  }

  // Draw smooth curve through points (used by pen, marker, eraser, line)
  drawSmoothPath(ctx, pts) {
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
  }

  // Compute arc lengths for a set of points
  computeArcLengths(pts) {
    const arcLens = [0];
    for (let i = 1; i < pts.length; i++) {
      arcLens.push(arcLens[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    }
    return arcLens;
  }

  // Get point at a given arc-length distance
  pointAtArc(pts, arcLens, d) {
    const totalLen = arcLens[arcLens.length - 1];
    d = Math.max(0, Math.min(d, totalLen));
    for (let i = 1; i < arcLens.length; i++) {
      if (arcLens[i] >= d) {
        const segT = (d - arcLens[i - 1]) / (arcLens[i] - arcLens[i - 1] || 1);
        return {
          x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * segT,
          y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * segT,
          nx: -(pts[i].y - pts[i - 1].y),
          ny: pts[i].x - pts[i - 1].x
        };
      }
    }
    return { x: pts[pts.length - 1].x, y: pts[pts.length - 1].y, nx: 0, ny: -1 };
  }

  // Shared temp canvas for soft-brush rendering (reused across all soft brushes)
  static _softTmpCanvas = null;
  static _softTmpCtx = null;

  static getSoftTmpCtx(w, h) {
    if (!Brush._softTmpCanvas) {
      Brush._softTmpCanvas = document.createElement('canvas');
      Brush._softTmpCtx = Brush._softTmpCanvas.getContext('2d');
    }
    Brush._softTmpCanvas.width = w;
    Brush._softTmpCanvas.height = h;
    return Brush._softTmpCtx;
  }
}
