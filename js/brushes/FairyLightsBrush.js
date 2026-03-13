import Brush from './Brush.js';
import { rgbToHsl, hslToRgb } from '../utils.js';

export default class FairyLightsBrush extends Brush {
  constructor() {
    super('fairylights');
  }

  render(ctx, obj) {
    const pts = obj.points;
    const opacity = obj.opacity || 1;

    const seed = obj.id || 0;
    const rng = (function(s) { return function() { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; }; })(seed);
    ctx.globalAlpha = opacity;

    // Compute arc lengths for point sampling
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
          };
        }
      }
      return { x: pts[pts.length - 1].x, y: pts[pts.length - 1].y };
    }

    // Bulb colors — warm festive palette or single colour from selection
    const useSelectedColor = obj.fairylightsUseColor;
    let bulbColors;
    if (useSelectedColor) {
      const hex = obj.color;
      const cr2 = parseInt(hex.slice(1, 3), 16), cg2 = parseInt(hex.slice(3, 5), 16), cb2 = parseInt(hex.slice(5, 7), 16);
      const bHsl = rgbToHsl(cr2, cg2, cb2);
      // Generate shades of the selected colour
      bulbColors = [];
      for (let i = 0; i < 5; i++) {
        const lAdj = bHsl[2] + (i - 2) * 0.08;
        const hAdj = bHsl[0] + (i - 2) * 0.02;
        const c = hslToRgb(hAdj, Math.min(1, bHsl[1] + 0.1), Math.max(0.25, Math.min(0.85, lAdj)));
        bulbColors.push(c);
      }
    } else {
      bulbColors = [
        [255, 200, 60], [230, 80, 80], [100, 200, 120],
        [90, 160, 230], [220, 130, 200], [255, 160, 60], [180, 130, 255],
      ];
    }

    const bulbSpacing = Math.max(12, obj.brushSize * 1.2);
    const bulbR = Math.max(2, obj.brushSize * 0.3);

    // Pre-compute bulb positions
    const bulbs = [];
    for (let d = bulbSpacing * 0.5; d < totalLen; d += bulbSpacing * (0.8 + rng() * 0.4)) {
      const p = pointAtArc(d);
      const colorIdx = Math.floor(rng() * bulbColors.length);
      bulbs.push({ wx: p.x, wy: p.y, bc: bulbColors[colorIdx] });
    }

    // Draw each bulb — clasp at wire, bulb body hangs below
    for (const b of bulbs) {
      const wx = b.wx, wy = b.wy;  // wire attachment point
      const bc = b.bc;
      // Clasp sits right at the wire, bulb hangs below it
      const claspH = bulbR * 0.4;
      const bulbTopY = wy + claspH;  // top of glass starts just below clasp
      const bulbCenterY = bulbTopY + bulbR * 0.9;  // center of the round part

      // Outer glow centered on bulb body
      const glowR = bulbR * 3.5;
      const glow = ctx.createRadialGradient(wx, bulbCenterY, bulbR * 0.3, wx, bulbCenterY, glowR);
      glow.addColorStop(0, `rgba(${bc[0]},${bc[1]},${bc[2]},0.3)`);
      glow.addColorStop(0.5, `rgba(${bc[0]},${bc[1]},${bc[2]},0.08)`);
      glow.addColorStop(1, `rgba(${bc[0]},${bc[1]},${bc[2]},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(wx, bulbCenterY, glowR, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(wx, wy);

      // Metallic clasp — small trapezoid at wire level
      const capW = bulbR * 0.4;
      ctx.fillStyle = 'rgba(180,175,155,0.95)';
      ctx.beginPath();
      ctx.moveTo(-capW * 0.7, 0);
      ctx.lineTo(-capW, claspH);
      ctx.lineTo(capW, claspH);
      ctx.lineTo(capW * 0.7, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(140,135,120,0.7)';
      ctx.lineWidth = Math.max(0.4, bulbR * 0.05);
      ctx.stroke();

      // Pear-shaped glass bulb — wide at top, tapers to point at bottom
      const bTop = claspH;  // top of glass meets bottom of clasp
      const bulbGrad = ctx.createRadialGradient(-bulbR * 0.15, bTop + bulbR * 0.5, bulbR * 0.1, 0, bTop + bulbR * 0.7, bulbR * 1.2);
      bulbGrad.addColorStop(0, `rgba(${Math.min(255, bc[0] + 100)},${Math.min(255, bc[1] + 100)},${Math.min(255, bc[2] + 100)},0.95)`);
      bulbGrad.addColorStop(0.5, `rgba(${bc[0]},${bc[1]},${bc[2]},0.9)`);
      bulbGrad.addColorStop(1, `rgba(${Math.max(0, bc[0] - 50)},${Math.max(0, bc[1] - 50)},${Math.max(0, bc[2] - 50)},0.85)`);
      ctx.fillStyle = bulbGrad;
      ctx.beginPath();
      // Start at top-center where clasp meets glass
      ctx.moveTo(0, bTop);
      // Right side: go wide then curve down to point
      ctx.bezierCurveTo(bulbR * 0.5, bTop, bulbR * 1.1, bTop + bulbR * 0.3, bulbR * 1.1, bTop + bulbR * 0.9);
      ctx.bezierCurveTo(bulbR * 1.1, bTop + bulbR * 1.5, bulbR * 0.4, bTop + bulbR * 2.0, 0, bTop + bulbR * 2.2);
      // Left side: mirror
      ctx.bezierCurveTo(-bulbR * 0.4, bTop + bulbR * 2.0, -bulbR * 1.1, bTop + bulbR * 1.5, -bulbR * 1.1, bTop + bulbR * 0.9);
      ctx.bezierCurveTo(-bulbR * 1.1, bTop + bulbR * 0.3, -bulbR * 0.5, bTop, 0, bTop);
      ctx.fill();

      // Glass reflection highlight
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath();
      ctx.ellipse(-bulbR * 0.3, bTop + bulbR * 0.7, bulbR * 0.2, bulbR * 0.5, -0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Draw the wire on top
    const wireWidth = Math.max(0.8, obj.brushSize * 0.06);
    ctx.strokeStyle = 'rgba(60,55,45,0.8)';
    ctx.lineWidth = wireWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
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
  }
}
