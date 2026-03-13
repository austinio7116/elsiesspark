import Brush from './Brush.js';
import { rgbToHsl, hslToRgb } from '../utils.js';

export default class WaterBrush extends Brush {
  constructor() {
    super('water');
  }

  render(ctx, obj) {
    const pts = obj.points;
    const opacity = obj.opacity || 1;
    const seed = obj.id || 0;
    const rng = this.createRng(seed);
    const { r: cr, g: cg, b: cb, hsl: baseHsl } = this.parseColor(obj.color);
    const bSize = obj.brushSize;

    // Path utilities
    function getNormal(i) {
      let dx, dy;
      if (i === 0 && pts.length > 1) { dx = pts[1].x - pts[0].x; dy = pts[1].y - pts[0].y; }
      else if (i >= pts.length - 1 && pts.length > 1) { dx = pts[pts.length - 1].x - pts[pts.length - 2].x; dy = pts[pts.length - 1].y - pts[pts.length - 2].y; }
      else { dx = pts[i + 1].x - pts[i - 1].x; dy = pts[i + 1].y - pts[i - 1].y; }
      const len = Math.hypot(dx, dy) || 1;
      return { nx: -dy / len, ny: dx / len, tx: dx / len, ty: dy / len };
    }
    const segLens = [];
    let totalLen = 0;
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
      return getNormal(idx);
    }
    if (totalLen < 1) return;

    // ── Derived colors (5-color water palette from art theory) ──
    // Deep: darker, more saturated — simulates depth absorption (Beer-Lambert)
    const deepRgb = hslToRgb(baseHsl[0], Math.min(1, baseHsl[1] * 1.3), Math.max(0.05, baseHsl[2] * 0.45));
    // Mid: the base color itself
    const midRgb = [cr, cg, cb];
    // Shadow: darkest tone for wave troughs
    const shadowRgb = hslToRgb(baseHsl[0], Math.min(1, baseHsl[1] * 1.1), Math.max(0.03, baseHsl[2] * 0.3));
    // Highlight: bright, slightly warm-shifted (specular reflects light source, usually warm)
    const hlHue = baseHsl[0] + 0.02;
    const hlRgb = hslToRgb(hlHue, baseHsl[1] * 0.3, Math.min(0.97, baseHsl[2] + 0.4));
    // Subsurface scatter: more saturated, shifted toward teal/cyan
    const sssHue = baseHsl[0] + (baseHsl[0] < 0.5 ? 0.03 : -0.03);
    const sssRgb = hslToRgb(sssHue, Math.min(1, baseHsl[1] * 1.5 + 0.15), Math.min(0.7, baseHsl[2] + 0.15));

    // ══════════════════════════════════════════════════════════
    // LAYER 1: Depth body — graduated transparent fill
    // ══════════════════════════════════════════════════════════
    const bodyStep = Math.max(2, bSize * 0.3);
    for (let d = 0; d <= totalLen; d += bodyStep) {
      const p = pointAtDist(d);
      const gradR = bSize * 0.9;
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, gradR);
      grd.addColorStop(0, `rgba(${deepRgb[0]},${deepRgb[1]},${deepRgb[2]},${0.18 * opacity})`);
      grd.addColorStop(0.45, `rgba(${midRgb[0]},${midRgb[1]},${midRgb[2]},${0.12 * opacity})`);
      grd.addColorStop(0.75, `rgba(${sssRgb[0]},${sssRgb[1]},${sssRgb[2]},${0.07 * opacity})`);
      grd.addColorStop(1, `rgba(${midRgb[0]},${midRgb[1]},${midRgb[2]},0)`);
      ctx.globalAlpha = 1;
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(p.x, p.y, gradR, 0, Math.PI * 2);
      ctx.fill();
    }

    // ══════════════════════════════════════════════════════════
    // LAYER 2: Ripples with crest/trough contrast
    // ══════════════════════════════════════════════════════════
    const numRipples = Math.max(2, Math.floor(bSize * 0.08));
    function drawSmoothRipple(rippleOffset, freq, amp, phase) {
      const step = Math.max(4, totalLen / 30);
      const ripPts = [];
      for (let d = 0; d <= totalLen; d += step) {
        const p = pointAtDist(d);
        const n = normalAtDist(d);
        const wave = Math.sin(d * freq + phase) * amp;
        ripPts.push({ x: p.x + n.nx * (rippleOffset + wave), y: p.y + n.ny * (rippleOffset + wave) });
      }
      if (ripPts.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(ripPts[0].x, ripPts[0].y);
      for (let i = 1; i < ripPts.length - 1; i++) {
        const mx = (ripPts[i].x + ripPts[i + 1].x) / 2;
        const my = (ripPts[i].y + ripPts[i + 1].y) / 2;
        ctx.quadraticCurveTo(ripPts[i].x, ripPts[i].y, mx, my);
      }
      ctx.lineTo(ripPts[ripPts.length - 1].x, ripPts[ripPts.length - 1].y);
      ctx.stroke();
    }
    for (let r = 0; r < numRipples; r++) {
      const rippleOffset = (r / (numRipples - 1) - 0.5) * bSize * 1.2 + (rng() - 0.5) * bSize * 0.1;
      const freq = 0.012 + rng() * 0.02;
      const amp = bSize * (0.03 + rng() * 0.06);
      const phase = rng() * Math.PI * 2;

      // Dark trough
      ctx.globalAlpha = opacity * (0.05 + rng() * 0.05);
      ctx.strokeStyle = `rgb(${shadowRgb[0]},${shadowRgb[1]},${shadowRgb[2]})`;
      ctx.lineWidth = Math.max(0.8, bSize * 0.025);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      drawSmoothRipple(rippleOffset, freq, amp, phase);

      // Bright crest — half wavelength offset
      ctx.globalAlpha = opacity * (0.04 + rng() * 0.05);
      ctx.strokeStyle = `rgb(${hlRgb[0]},${hlRgb[1]},${hlRgb[2]})`;
      ctx.lineWidth = Math.max(0.6, bSize * 0.02);
      drawSmoothRipple(rippleOffset + bSize * 0.015, freq, amp, phase + Math.PI);
    }

    // ══════════════════════════════════════════════════════════
    // LAYER 3: Caustic network
    // ══════════════════════════════════════════════════════════
    const causticLines = Math.max(3, Math.floor(totalLen / (bSize * 2)));
    for (let c = 0; c < causticLines; c++) {
      const startD = rng() * totalLen;
      const lineLen = bSize * (0.5 + rng() * 1.5);
      const startP = pointAtDist(startD);
      const startN = normalAtDist(startD);
      const offN = (rng() - 0.5) * bSize * 0.8;
      const sx = startP.x + startN.nx * offN;
      const sy = startP.y + startN.ny * offN;

      const segs = Math.floor(2 + rng() * 3);
      ctx.globalAlpha = opacity * (0.08 + rng() * 0.1);
      const causticHue = baseHsl[0] + (rng() - 0.5) * 0.04;
      const causticRgb = hslToRgb(causticHue, baseHsl[1] * 0.5, Math.min(0.95, baseHsl[2] + 0.35 + rng() * 0.1));
      ctx.strokeStyle = `rgb(${causticRgb[0]},${causticRgb[1]},${causticRgb[2]})`;
      ctx.lineWidth = Math.max(0.3, bSize * 0.015 + rng() * bSize * 0.02);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      let cx2 = sx, cy2 = sy;
      for (let s = 0; s < segs; s++) {
        const angle = rng() * Math.PI * 2;
        const segR = lineLen / segs * (0.5 + rng());
        const nx = cx2 + Math.cos(angle) * segR;
        const ny = cy2 + Math.sin(angle) * segR;
        const cpx = (cx2 + nx) / 2 + (rng() - 0.5) * segR * 0.6;
        const cpy = (cy2 + ny) / 2 + (rng() - 0.5) * segR * 0.6;
        ctx.quadraticCurveTo(cpx, cpy, nx, ny);
        cx2 = nx; cy2 = ny;
      }
      ctx.stroke();

      // Occasional branching
      if (rng() > 0.5) {
        const brAngle = rng() * Math.PI * 2;
        const brLen = lineLen * (0.3 + rng() * 0.4);
        const bex = cx2 + Math.cos(brAngle) * brLen;
        const bey = cy2 + Math.sin(brAngle) * brLen;
        ctx.globalAlpha = opacity * (0.05 + rng() * 0.06);
        ctx.beginPath();
        ctx.moveTo(cx2, cy2);
        ctx.quadraticCurveTo(
          (cx2 + bex) / 2 + (rng() - 0.5) * brLen * 0.4,
          (cy2 + bey) / 2 + (rng() - 0.5) * brLen * 0.4,
          bex, bey
        );
        ctx.stroke();
      }
    }

    // ══════════════════════════════════════════════════════════
    // LAYER 4: Specular sparkles — 4-point cross-star glints
    // ══════════════════════════════════════════════════════════
    const specCount = Math.max(2, Math.floor(totalLen / (bSize * 2.5)));
    const warmRgb = hslToRgb(0.11, 0.1, 0.98);
    const warmStr = `rgb(${warmRgb[0]},${warmRgb[1]},${warmRgb[2]})`;
    for (let s = 0; s < specCount; s++) {
      const d = rng() * totalLen;
      const p = pointAtDist(d);
      const n = normalAtDist(d);
      const offN2 = (rng() - 0.5) * bSize * 0.6;
      const spx = p.x + n.nx * offN2;
      const spy = p.y + n.ny * offN2;

      const sparkleSize = bSize * (0.05 + rng() * 0.08);
      const specAlpha = 0.25 + rng() * 0.3;
      const rot = rng() * Math.PI * 0.25;

      ctx.save();
      ctx.translate(spx, spy);
      ctx.rotate(rot);

      // Subtle glow behind
      const glowR = sparkleSize * 2.2;
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowR);
      glow.addColorStop(0, `rgba(255,255,255,${0.1 * opacity * specAlpha})`);
      glow.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, glowR, 0, Math.PI * 2);
      ctx.fill();

      // 4 tapered rays
      ctx.globalAlpha = opacity * specAlpha;
      ctx.fillStyle = warmStr;
      const armLen = sparkleSize * (1.8 + rng() * 0.8);
      const armWidth = sparkleSize * (0.1 + rng() * 0.06);
      for (let a = 0; a < 4; a++) {
        const angle = a * Math.PI / 2;
        const ax = Math.cos(angle);
        const ay = Math.sin(angle);
        const px = -ay;
        const py = ax;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(px * armWidth, py * armWidth);
        ctx.lineTo(ax * armLen, ay * armLen);
        ctx.lineTo(-px * armWidth, -py * armWidth);
        ctx.closePath();
        ctx.fill();
      }

      // Center dot
      ctx.globalAlpha = opacity * Math.min(1, specAlpha * 1.2);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(0, 0, sparkleSize * 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // ══════════════════════════════════════════════════════════
    // LAYER 5: Subsurface scattering edge glow
    // ══════════════════════════════════════════════════════════
    const sssStep = Math.max(3, bSize * 0.4);
    for (let d = 0; d <= totalLen; d += sssStep) {
      const p = pointAtDist(d);
      const n = normalAtDist(d);
      for (let side = -1; side <= 1; side += 2) {
        const edgeDist = bSize * (0.55 + rng() * 0.15) * side;
        const ex = p.x + n.nx * edgeDist;
        const ey = p.y + n.ny * edgeDist;
        const edgeGlowR = bSize * (0.15 + rng() * 0.1);
        const grd = ctx.createRadialGradient(ex, ey, 0, ex, ey, edgeGlowR);
        grd.addColorStop(0, `rgba(${sssRgb[0]},${sssRgb[1]},${sssRgb[2]},${0.1 * opacity})`);
        grd.addColorStop(1, `rgba(${sssRgb[0]},${sssRgb[1]},${sssRgb[2]},0)`);
        ctx.globalAlpha = 1;
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(ex, ey, edgeGlowR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ══════════════════════════════════════════════════════════
    // LAYER 6: Distorted broken reflections
    // ══════════════════════════════════════════════════════════
    const reflCount = Math.max(4, Math.floor(totalLen / (bSize * 0.7)));
    for (let r = 0; r < reflCount; r++) {
      const d = rng() * totalLen;
      const p = pointAtDist(d);
      const n = normalAtDist(d);
      const offN3 = (rng() - 0.5) * bSize * 0.7;
      const rx = p.x + n.nx * offN3;
      const ry = p.y + n.ny * offN3;

      const bandLen = bSize * (0.15 + rng() * 0.3);
      const bandLight = baseHsl[2] + (rng() - 0.3) * 0.25;
      const bandRgb = hslToRgb(baseHsl[0], baseHsl[1] * 0.7, Math.max(0.1, Math.min(0.9, bandLight)));
      ctx.globalAlpha = opacity * (0.04 + rng() * 0.05);
      ctx.strokeStyle = `rgb(${bandRgb[0]},${bandRgb[1]},${bandRgb[2]})`;
      ctx.lineWidth = Math.max(0.5, bSize * 0.02 + rng() * bSize * 0.02);
      ctx.lineCap = 'round';
      ctx.beginPath();
      const wobAmp = bSize * 0.02;
      ctx.moveTo(rx - bandLen, ry + (rng() - 0.5) * wobAmp);
      ctx.quadraticCurveTo(
        rx, ry + (rng() - 0.5) * wobAmp * 2,
        rx + bandLen, ry + (rng() - 0.5) * wobAmp
      );
      ctx.stroke();
    }
  }
}
