import Brush from './Brush.js';
import { rgbToHsl, hslToRgb } from '../utils.js';

export default class TreeBrush extends Brush {
  constructor() {
    super('tree');
  }

  render(ctx, obj) {
    const pts = obj.points;
    const seed = obj.id || 0;
    const rng = this.createRng(seed);
    const opacity = obj.opacity || 1;
    const mode = obj.treeMode || 'default';
    ctx.globalAlpha = opacity;

    // Arc-length utilities
    const arcLens = this.computeArcLengths(pts);
    const totalLen = arcLens[arcLens.length - 1];
    if (totalLen < 2) return;

    const self = this;
    function ptAt(d) {
      d = Math.max(0, Math.min(d, totalLen));
      return self.pointAtArc(pts, arcLens, d);
    }
    function dirAt(d) {
      d = Math.max(0.01, Math.min(d, totalLen));
      for (let i = 1; i < arcLens.length; i++) {
        if (arcLens[i] >= d) {
          const dx = pts[i].x - pts[i - 1].x, dy = pts[i].y - pts[i - 1].y;
          const l = Math.hypot(dx, dy) || 1;
          return { dx: dx / l, dy: dy / l };
        }
      }
      return { dx: 0, dy: -1 };
    }

    // Crown detection
    let hasCrown = false, crownCX = 0, crownCY = 0, crownR = 0, trunkEnd = totalLen;
    if (pts.length > 10) {
      const from = Math.floor(pts.length * 0.35);
      const end = pts[pts.length - 1];
      for (let i = from; i < pts.length - 5; i++) {
        if (Math.hypot(end.x - pts[i].x, end.y - pts[i].y) < obj.brushSize * 3) {
          hasCrown = true;
          const cp = pts.slice(i);
          let sx = 0, sy = 0;
          cp.forEach(p => { sx += p.x; sy += p.y; });
          crownCX = sx / cp.length; crownCY = sy / cp.length;
          let mr = 0;
          cp.forEach(p => { mr = Math.max(mr, Math.hypot(p.x - crownCX, p.y - crownCY)); });
          crownR = Math.max(mr, obj.brushSize * 2);
          trunkEnd = arcLens[i];
          break;
        }
      }
    }

    // Color helpers
    const hex = obj.color;
    const colR = parseInt(hex.slice(1, 3), 16), colG = parseInt(hex.slice(3, 5), 16), colB = parseInt(hex.slice(5, 7), 16);
    const leafHsl = rgbToHsl(colR, colG, colB);
    const barkBaseH = 25 / 360, barkBaseS = 0.45, barkBaseL = 0.28;

    function bark(lAdj) {
      const r = hslToRgb(barkBaseH + (rng() - 0.5) * 0.02, barkBaseS, Math.max(0.1, Math.min(0.48, barkBaseL + lAdj)));
      return `rgb(${r[0]},${r[1]},${r[2]})`;
    }
    function leaf() {
      if (mode === 'magnolia') {
        // Magnolia leaves: darker, glossier, slightly bluer-green
        const r = hslToRgb(
          leafHsl[0] + (rng() - 0.5) * 0.04,
          Math.min(1, leafHsl[1] + 0.05 + (rng() - 0.3) * 0.1),
          Math.max(0.18, Math.min(0.45, leafHsl[2] - 0.05 + (rng() - 0.5) * 0.12))
        );
        return `rgb(${r[0]},${r[1]},${r[2]})`;
      }
      if (mode === 'willow') {
        // Willow leaves: lighter, yellower-green, more muted
        const r = hslToRgb(
          leafHsl[0] + (rng() - 0.3) * 0.06,
          Math.min(1, leafHsl[1] - 0.05 + (rng() - 0.3) * 0.1),
          Math.max(0.3, Math.min(0.65, leafHsl[2] + 0.05 + (rng() - 0.4) * 0.15))
        );
        return `rgb(${r[0]},${r[1]},${r[2]})`;
      }
      const r = hslToRgb(
        leafHsl[0] + (rng() - 0.5) * 0.07,
        Math.min(1, leafHsl[1] + (rng() - 0.2) * 0.12),
        Math.max(0.22, Math.min(0.7, leafHsl[2] + (rng() - 0.4) * 0.18))
      );
      return `rgb(${r[0]},${r[1]},${r[2]})`;
    }

    const leafDensity = (obj.treeLeafDensity || 5) / 5;
    const branchDensity = (obj.treeBranchDensity || 5) / 5;
    const trunkW = Math.max(5, obj.brushSize);

    // Draw tapered trunk as filled polygon
    const nSamples = Math.max(12, Math.floor(trunkEnd / 2.5));
    const leftE = [], rightE = [];
    for (let i = 0; i <= nSamples; i++) {
      const t = i / nSamples;
      const d = t * trunkEnd;
      const p = ptAt(d);
      const dr = dirAt(d);
      const nx = -dr.dy, ny = dr.dx;
      const taper = 1 - t * 0.72;
      const hw = trunkW * 0.5 * taper;
      leftE.push({ x: p.x + nx * hw, y: p.y + ny * hw });
      rightE.push({ x: p.x - nx * hw, y: p.y - ny * hw });
    }

    ctx.beginPath();
    ctx.moveTo(leftE[0].x, leftE[0].y);
    for (let i = 1; i < leftE.length; i++) ctx.lineTo(leftE[i].x, leftE[i].y);
    for (let i = rightE.length - 1; i >= 0; i--) ctx.lineTo(rightE[i].x, rightE[i].y);
    ctx.closePath();
    ctx.fillStyle = bark(0);
    ctx.fill();

    ctx.lineWidth = Math.max(0.6, trunkW * 0.035);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = bark(-0.1);
    ctx.beginPath();
    ctx.moveTo(leftE[0].x, leftE[0].y);
    for (let i = 1; i < leftE.length; i++) ctx.lineTo(leftE[i].x, leftE[i].y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rightE[0].x, rightE[0].y);
    for (let i = 1; i < rightE.length; i++) ctx.lineTo(rightE[i].x, rightE[i].y);
    ctx.stroke();

    // Bark texture
    for (let i = 2; i < nSamples - 1; i++) {
      if (rng() > 0.6) continue;
      const t = i / nSamples;
      const d = t * trunkEnd;
      const p = ptAt(d);
      const dr = dirAt(d);
      const nx = -dr.dy, ny = dr.dx;
      const taper = 1 - t * 0.72;
      const hw = trunkW * 0.5 * taper;
      const off = (rng() - 0.5) * hw * 0.7;
      ctx.strokeStyle = bark(-0.06 + rng() * 0.03);
      ctx.lineWidth = Math.max(0.4, trunkW * 0.025);
      ctx.globalAlpha = opacity * (0.12 + rng() * 0.18);
      ctx.beginPath();
      ctx.moveTo(p.x + nx * (off - hw * 0.3), p.y + ny * (off - hw * 0.3));
      ctx.lineTo(p.x + nx * (off + hw * 0.3), p.y + ny * (off + hw * 0.3));
      ctx.stroke();
    }
    ctx.globalAlpha = opacity;

    // Quadratic bezier helper
    function bezPt(sx, sy, mx, my, ex, ey, t) {
      const u = 1 - t;
      return { x: u * u * sx + 2 * u * t * mx + t * t * ex,
               y: u * u * sy + 2 * u * t * my + t * t * ey };
    }

    // Cubic bezier helper (for willow curtains)
    function cubicBez(p0x, p0y, c1x, c1y, c2x, c2y, p1x, p1y, t) {
      const u = 1 - t;
      return {
        x: u*u*u*p0x + 3*u*u*t*c1x + 3*u*t*t*c2x + t*t*t*p1x,
        y: u*u*u*p0y + 3*u*u*t*c1y + 3*u*t*t*c2y + t*t*t*p1y
      };
    }

    // Draw a tapered branch segment
    function drawTapered(sx, sy, mx, my, ex, ey, w0, w1, col) {
      const len = Math.hypot(ex - sx, ey - sy);
      const segs = Math.max(4, Math.ceil(len / 2));
      ctx.lineCap = 'round';
      ctx.strokeStyle = col;
      for (let i = 0; i < segs; i++) {
        const t0 = i / segs, t1 = (i + 1) / segs;
        const p0 = bezPt(sx, sy, mx, my, ex, ey, t0);
        const p1 = bezPt(sx, sy, mx, my, ex, ey, t1);
        ctx.lineWidth = w0 + (w1 - w0) * (t0 + t1) * 0.5;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
      }
    }

    // Draw thick limb as filled tapered polygon
    function drawLimb(sx, sy, mx, my, ex, ey, w0, w1) {
      const nSeg = Math.max(8, Math.ceil(Math.hypot(ex - sx, ey - sy) / 2));
      const leftPts = [], rightPts = [];
      for (let i = 0; i <= nSeg; i++) {
        const t = i / nSeg;
        const p = bezPt(sx, sy, mx, my, ex, ey, t);
        const dtx = 2 * (1 - t) * (mx - sx) + 2 * t * (ex - mx);
        const dty = 2 * (1 - t) * (my - sy) + 2 * t * (ey - my);
        const dl = Math.hypot(dtx, dty) || 1;
        const nx = -dty / dl, ny = dtx / dl;
        const hw = (w0 + (w1 - w0) * t) * 0.5;
        leftPts.push({ x: p.x + nx * hw, y: p.y + ny * hw });
        rightPts.push({ x: p.x - nx * hw, y: p.y - ny * hw });
      }

      ctx.beginPath();
      ctx.moveTo(leftPts[0].x, leftPts[0].y);
      for (let i = 1; i < leftPts.length; i++) ctx.lineTo(leftPts[i].x, leftPts[i].y);
      const tipP = bezPt(sx, sy, mx, my, ex, ey, 1);
      ctx.arc(tipP.x, tipP.y, w1 * 0.5, Math.atan2(leftPts[nSeg].y - tipP.y, leftPts[nSeg].x - tipP.x),
              Math.atan2(rightPts[nSeg].y - tipP.y, rightPts[nSeg].x - tipP.x));
      for (let i = rightPts.length - 1; i >= 0; i--) ctx.lineTo(rightPts[i].x, rightPts[i].y);
      const baseP = bezPt(sx, sy, mx, my, ex, ey, 0);
      ctx.arc(baseP.x, baseP.y, w0 * 0.5, Math.atan2(rightPts[0].y - baseP.y, rightPts[0].x - baseP.x),
              Math.atan2(leftPts[0].y - baseP.y, leftPts[0].x - baseP.x));
      ctx.closePath();
      ctx.fillStyle = bark(0);
      ctx.fill();

      ctx.lineWidth = Math.max(0.5, w0 * 0.04);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeStyle = bark(-0.1);
      ctx.beginPath();
      ctx.moveTo(leftPts[0].x, leftPts[0].y);
      for (let i = 1; i < leftPts.length; i++) ctx.lineTo(leftPts[i].x, leftPts[i].y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rightPts[0].x, rightPts[0].y);
      for (let i = 1; i < rightPts.length; i++) ctx.lineTo(rightPts[i].x, rightPts[i].y);
      ctx.stroke();

      // Bark texture stripes
      ctx.lineWidth = Math.max(0.3, w0 * 0.025);
      for (let i = 2; i < nSeg - 1; i++) {
        if (rng() > 0.55) continue;
        const t = i / nSeg;
        const p = bezPt(sx, sy, mx, my, ex, ey, t);
        const dtx2 = 2 * (1 - t) * (mx - sx) + 2 * t * (ex - mx);
        const dty2 = 2 * (1 - t) * (my - sy) + 2 * t * (ey - my);
        const dl2 = Math.hypot(dtx2, dty2) || 1;
        const nx2 = -dty2 / dl2, ny2 = dtx2 / dl2;
        const hw2 = (w0 + (w1 - w0) * t) * 0.5;
        const off2 = (rng() - 0.5) * hw2 * 0.6;
        ctx.strokeStyle = bark(-0.06 + rng() * 0.03);
        ctx.globalAlpha = opacity * (0.1 + rng() * 0.15);
        ctx.beginPath();
        ctx.moveTo(p.x + nx2 * (off2 - hw2 * 0.3), p.y + ny2 * (off2 - hw2 * 0.3));
        ctx.lineTo(p.x + nx2 * (off2 + hw2 * 0.3), p.y + ny2 * (off2 + hw2 * 0.3));
        ctx.stroke();
      }
      ctx.globalAlpha = opacity;
    }

    // Collect geometry
    const branches = [];
    const leaves = [];
    const willowCurtains = []; // willow only: hanging strand data
    const magnoliaFlowers = []; // magnolia only

    // Recursive fractal growth
    function grow(sx, sy, angle, len, width, depth, maxD) {
      if (depth > maxD || width < 0.4 || len < 1.5) return;

      const bendAmt = depth < 2 ? 0.25 : 0.45;
      const bend = (rng() - 0.5) * bendAmt;

      let mx, my, ex, ey;

      if (mode === 'magnolia') {
        // Magnolia: bias branches strongly upward
        const upAngle = -Math.PI / 2;
        const biasStrength = depth < 2 ? 0.4 : 0.25;
        const biasedAngle = angle * (1 - biasStrength) + upAngle * biasStrength;
        const midA = biasedAngle + bend;
        mx = sx + Math.cos(midA) * len * 0.5;
        my = sy + Math.sin(midA) * len * 0.5;
        ex = sx + Math.cos(biasedAngle + bend * 0.5) * len;
        ey = sy + Math.sin(biasedAngle + bend * 0.5) * len;
      } else if (mode === 'willow') {
        // Willow structural branches: grow outward/slightly up, wider spread
        const midA = angle + bend;
        mx = sx + Math.cos(midA) * len * 0.5;
        my = sy + Math.sin(midA) * len * 0.5;
        ex = sx + Math.cos(angle + bend * 0.5) * len;
        ey = sy + Math.sin(angle + bend * 0.5) * len;
      } else {
        const midA = angle + bend;
        mx = sx + Math.cos(midA) * len * 0.5;
        my = sy + Math.sin(midA) * len * 0.5;
        ex = sx + Math.cos(angle + bend * 0.5) * len;
        ey = sy + Math.sin(angle + bend * 0.5) * len;
      }

      const endW = width * (0.68 + rng() * 0.06);
      branches.push({ sx, sy, mx, my, ex, ey, w0: width, w1: endW, depth });

      const isSmall = depth >= maxD - 2 || endW < 3;

      if (mode === 'willow') {
        // Willow: at terminal or near-terminal branches, spawn hanging curtains
        if (isSmall && depth >= 2) {
          const endAngle = Math.atan2(ey - my, ex - mx);
          const nCurtains = 2 + Math.floor(rng() * 3);
          for (let ci = 0; ci < nCurtains; ci++) {
            const curtainLen = trunkEnd * (0.35 + rng() * 0.45);
            // Start direction: follows branch, then curves downward
            const startDx = Math.cos(endAngle);
            const startDy = Math.sin(endAngle);
            const horizDrift = (rng() - 0.5) * curtainLen * 0.3;
            willowCurtains.push({
              x: ex + (rng() - 0.5) * endW,
              y: ey + (rng() - 0.5) * endW,
              dx: startDx, dy: startDy,
              len: curtainLen,
              drift: horizDrift,
              width: Math.max(0.3, endW * 0.15)
            });
          }
        }
        // Also add some sparse leaves at branch junctions
        if (isSmall) {
          const baseLSize = Math.max(2, obj.brushSize * (0.15 + rng() * 0.15));
          leaves.push({ x: ex, y: ey, size: baseLSize, type: 'willow' });
        }
      } else if (mode === 'magnolia') {
        if (isSmall) {
          // Magnolia leaves: fewer but larger, glossy ovals
          const baseLSize = Math.max(5, obj.brushSize * (0.6 + rng() * 0.5));
          leaves.push({ x: ex, y: ey, size: baseLSize * (1.2 + rng() * 0.5), type: 'magnolia' });
          for (const bt of [0.3 + rng() * 0.15, 0.6 + rng() * 0.15]) {
            const mp = bezPt(sx, sy, mx, my, ex, ey, bt);
            const spread = width * 1.2 + baseLSize * 0.3;
            leaves.push({
              x: mp.x + (rng() - 0.5) * spread,
              y: mp.y + (rng() - 0.5) * spread,
              size: baseLSize * (0.8 + rng() * 0.6),
              type: 'magnolia'
            });
          }
          // Magnolia flowers at branch tips — fewer, larger, more spaced
          if (rng() > 0.65) {
            const flowerSize = Math.max(7, obj.brushSize * (0.85 + rng() * 0.7));
            const openness = rng(); // 0 = tight bud, 1 = fully open
            magnoliaFlowers.push({
              x: ex + (rng() - 0.5) * endW * 2,
              y: ey + (rng() - 0.5) * endW * 2,
              size: flowerSize,
              open: openness
            });
          }
        }
      } else {
        // Default tree leaves
        if (isSmall) {
          const baseLSize = Math.max(4, obj.brushSize * (0.5 + rng() * 0.4));
          leaves.push({ x: ex, y: ey, size: baseLSize * (1 + rng() * 0.5), type: 'default' });
          for (const bt of [0.25 + rng() * 0.15, 0.55 + rng() * 0.15]) {
            const mp = bezPt(sx, sy, mx, my, ex, ey, bt);
            const spread = width * 1.5 + baseLSize * 0.4;
            leaves.push({
              x: mp.x + (rng() - 0.5) * spread,
              y: mp.y + (rng() - 0.5) * spread,
              size: baseLSize * (0.7 + rng() * 0.5),
              type: 'default'
            });
          }
          if (endW > 1.5 && rng() > 0.3) {
            const et = 0.4 + rng() * 0.4;
            const ep = bezPt(sx, sy, mx, my, ex, ey, et);
            leaves.push({
              x: ep.x + (rng() - 0.5) * width * 3,
              y: ep.y + (rng() - 0.5) * width * 3,
              size: baseLSize * (0.8 + rng() * 0.4),
              type: 'default'
            });
          }
        }
      }

      if (depth >= maxD || endW < 1.2) return;

      const endAngle = Math.atan2(ey - my, ex - mx);

      if (mode === 'willow') {
        // Willow: wider spread to create umbrella shape, fewer depth levels
        // since curtains provide the visual mass
        const nKids = rng() > 0.45 ? 3 : 2;
        const spread = 0.45 + rng() * 0.3;
        for (let c = 0; c < nKids; c++) {
          const frac = nKids === 2
            ? (c === 0 ? -1 : 1) * (spread * (0.7 + rng() * 0.6))
            : (c - 1) * spread * (0.7 + rng() * 0.6);
          const childAngle = endAngle + frac;
          const childW = endW / Math.sqrt(nKids) * (0.85 + rng() * 0.3);
          const childLen = len * (0.6 + rng() * 0.18);
          grow(ex, ey, childAngle, childLen, Math.max(0.4, childW), depth + 1, maxD);
        }
      } else if (mode === 'magnolia') {
        const nKids = rng() > 0.55 ? 3 : 2;
        const spread = 0.3 + rng() * 0.2;
        for (let c = 0; c < nKids; c++) {
          const frac = nKids === 2
            ? (c === 0 ? -1 : 1) * (spread * (0.7 + rng() * 0.6))
            : (c - 1) * spread * (0.7 + rng() * 0.6);
          const childAngle = endAngle + frac;
          const childW = endW / Math.sqrt(nKids) * (0.85 + rng() * 0.3);
          const childLen = len * (0.62 + rng() * 0.16);
          grow(ex, ey, childAngle, childLen, Math.max(0.4, childW), depth + 1, maxD);
        }
      } else {
        const nKids = rng() > 0.55 ? 3 : 2;
        const spread = 0.35 + rng() * 0.25;
        for (let c = 0; c < nKids; c++) {
          const frac = nKids === 2
            ? (c === 0 ? -1 : 1) * (spread * (0.7 + rng() * 0.6))
            : (c - 1) * spread * (0.7 + rng() * 0.6);
          const childAngle = endAngle + frac;
          const childW = endW / Math.sqrt(nKids) * (0.85 + rng() * 0.3);
          const childLen = len * (0.62 + rng() * 0.16);
          grow(ex, ey, childAngle, childLen, Math.max(0.4, childW), depth + 1, maxD);
        }
      }
    }

    // Seed the fractal from trunk top
    const topP = ptAt(trunkEnd);
    const topD = dirAt(trunkEnd);
    const trunkAngle = Math.atan2(topD.dy, topD.dx);
    const topW = trunkW * 0.28;
    const maxDepth = Math.max(4, Math.min(7, Math.ceil(Math.log2(Math.max(trunkEnd, 40)) + 1)));

    if (hasCrown) {
      const toCrown = Math.atan2(crownCY - topP.y, crownCX - topP.x);
      const mainLen = Math.max(crownR * 0.5, trunkEnd * 0.12);
      grow(topP.x, topP.y, toCrown, mainLen, topW, 0, maxDepth);
      const nPri = 3 + Math.floor(rng() * 2);
      for (let i = 0; i < nPri; i++) {
        const a = toCrown + (rng() - 0.5) * 1.6;
        grow(topP.x, topP.y, a, mainLen * (0.55 + rng() * 0.35), topW * (0.6 + rng() * 0.3), 0, maxDepth);
      }
      let sideF = 1;
      for (let frac = 0.3 + rng() * 0.08; frac < 0.85; frac += 0.1 + rng() * 0.08) {
        sideF *= -1;
        const d = frac * trunkEnd;
        const p = ptAt(d);
        const dr = dirAt(d);
        const nx = -dr.dy * sideF, ny = dr.dx * sideF;
        const taper = 1 - frac * 0.72;
        const hw = trunkW * 0.5 * taper;
        const bx = p.x + nx * hw;
        const by = p.y + ny * hw;
        const outA = Math.atan2(ny, nx);
        const bAngle = outA + (rng() - 0.5) * 0.4;
        const bW = topW * taper * (0.4 + rng() * 0.3);
        const bLen = mainLen * (0.25 + rng() * 0.25);
        grow(bx, by, bAngle, bLen, Math.max(0.6, bW), 1, maxDepth);
      }
    } else {
      const mainLen = trunkEnd * (0.22 + rng() * 0.12);
      grow(topP.x, topP.y, trunkAngle, mainLen, topW, 0, maxDepth);

      let sideFlag = 1;
      const sideStart = mode === 'willow' ? 0.25 : 0.18;
      const sideStep = mode === 'willow' ? 0.1 : 0.08;
      for (let frac = sideStart + rng() * 0.06; frac < 0.93; frac += sideStep + rng() * 0.06) {
        sideFlag *= -1;
        const d = frac * trunkEnd;
        const p = ptAt(d);
        const dr = dirAt(d);
        const nx = -dr.dy * sideFlag, ny = dr.dx * sideFlag;
        const taper = 1 - frac * 0.72;
        const hw = trunkW * 0.5 * taper;
        const bx = p.x + nx * hw;
        const by = p.y + ny * hw;
        const outAngle = Math.atan2(ny, nx);
        const upBias = frac * 0.4;
        const bAngle = outAngle * (1 - upBias) + trunkAngle * upBias + (rng() - 0.5) * 0.3;
        const lenScale = 0.3 + frac * 0.7;
        const bW = topW * taper * (0.45 + rng() * 0.35);
        const bLen = mainLen * (0.3 + rng() * 0.3) * lenScale;
        const depthStart = frac < 0.35 ? 2 : 1;
        grow(bx, by, bAngle, bLen, Math.max(0.6, bW), depthStart, maxDepth);
      }
    }

    // Density filters
    const filterRng = this.createRng(seed + 99999);

    let renderBranches = branches;
    if (branchDensity !== 1) {
      if (branchDensity < 1) {
        renderBranches = branches.filter(br => {
          if (br.depth <= 1) return true;
          return filterRng() < (0.3 + branchDensity * 0.7);
        });
      } else {
        renderBranches = [];
        for (const br of branches) {
          renderBranches.push(br);
          if (br.depth >= 2 && filterRng() < (branchDensity - 1) * 0.5) {
            const off = (filterRng() - 0.5) * br.w0 * 2;
            renderBranches.push({
              ...br,
              sx: br.sx + off, sy: br.sy + off,
              mx: br.mx + off, my: br.my + off,
              ex: br.ex + off, ey: br.ey + off,
              w0: br.w0 * 0.8, w1: br.w1 * 0.8
            });
          }
        }
      }
    }

    let renderLeaves = leaves;
    if (leafDensity !== 1) {
      if (leafDensity < 1) {
        renderLeaves = leaves.filter(() => filterRng() < (0.2 + leafDensity * 0.8));
      } else {
        renderLeaves = [];
        for (const lc of leaves) {
          renderLeaves.push(lc);
          const extraCount = Math.floor((leafDensity - 1) * 2 * filterRng());
          for (let ei = 0; ei < extraCount; ei++) {
            renderLeaves.push({
              ...lc,
              x: lc.x + (filterRng() - 0.5) * lc.size * 1.5,
              y: lc.y + (filterRng() - 0.5) * lc.size * 1.5,
              size: lc.size * (0.6 + filterRng() * 0.5)
            });
          }
        }
      }
    }

    // Filter willow curtains by branch density
    let renderCurtains = willowCurtains;
    if (branchDensity < 1) {
      renderCurtains = willowCurtains.filter(() => filterRng() < (0.3 + branchDensity * 0.7));
    } else if (branchDensity > 1) {
      renderCurtains = [];
      for (const c of willowCurtains) {
        renderCurtains.push(c);
        if (filterRng() < (branchDensity - 1) * 0.6) {
          renderCurtains.push({
            ...c,
            x: c.x + (filterRng() - 0.5) * 6,
            drift: c.drift + (filterRng() - 0.5) * c.len * 0.15
          });
        }
      }
    }

    // Filter magnolia flowers by leaf density
    let renderFlowers = magnoliaFlowers;
    if (leafDensity < 1) {
      renderFlowers = magnoliaFlowers.filter(() => filterRng() < (0.3 + leafDensity * 0.7));
    } else if (leafDensity > 1) {
      renderFlowers = [];
      for (const f of magnoliaFlowers) {
        renderFlowers.push(f);
        if (filterRng() < (leafDensity - 1) * 0.4) {
          renderFlowers.push({
            ...f,
            x: f.x + (filterRng() - 0.5) * f.size * 2,
            y: f.y + (filterRng() - 0.5) * f.size * 2,
            size: f.size * (0.7 + filterRng() * 0.4)
          });
        }
      }
    }

    // Compute trunk base Y for willow floor clamping
    const trunkBaseY = ptAt(0).y;

    // ── Render branches ──
    renderBranches.sort((a, b) => a.depth - b.depth);
    for (const br of renderBranches) {
      if (br.depth < 2 && br.w0 > 2) {
        drawLimb(br.sx, br.sy, br.mx, br.my, br.ex, br.ey, br.w0, br.w1);
      } else {
        const col = bark((br.depth * 0.02) + (rng() - 0.5) * 0.04);
        drawTapered(br.sx, br.sy, br.mx, br.my, br.ex, br.ey, br.w0, br.w1, col);
      }
    }

    const leafCountScale = leafDensity;

    // ── Render willow curtains ──
    // Each curtain: a long thin strand that starts at a branch tip going in the
    // branch direction, then curves smoothly downward like a hanging vine.
    // Small narrow leaves are scattered along each strand.
    if (mode === 'willow') {
      for (const c of renderCurtains) {
        // Build cubic bezier: start → follow branch dir → curve down → hang straight
        // Clamp all Y values so curtains never droop below trunk base
        const p0x = c.x, p0y = c.y;
        const forwardDist = c.len * 0.2;
        const c1x = p0x + c.dx * forwardDist;
        const c1y = Math.min(p0y + c.dy * forwardDist, trunkBaseY);
        const c2x = p0x + c.drift * 0.5 + c.dx * forwardDist * 0.3;
        const c2y = Math.min(p0y + c.len * 0.65, trunkBaseY);
        const p1x = p0x + c.drift;
        const p1y = Math.min(p0y + c.len, trunkBaseY);

        // Draw the curtain strand as a tapered line
        const nSegs = Math.max(10, Math.ceil(c.len / 3));
        ctx.lineCap = 'round';
        for (let i = 0; i < nSegs; i++) {
          const t0 = i / nSegs, t1 = (i + 1) / nSegs;
          const pa = cubicBez(p0x, p0y, c1x, c1y, c2x, c2y, p1x, p1y, t0);
          const pb = cubicBez(p0x, p0y, c1x, c1y, c2x, c2y, p1x, p1y, t1);
          const w = c.width * (1 - t0 * 0.85);
          ctx.strokeStyle = bark(0.05 + (rng() - 0.5) * 0.04);
          ctx.lineWidth = Math.max(0.3, w);
          ctx.globalAlpha = opacity * (0.6 + rng() * 0.3);
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.stroke();
        }
        ctx.globalAlpha = opacity;

        // Scatter small narrow willow leaves along this curtain
        const nLeaves = Math.max(2, Math.round((c.len / 10) * leafCountScale));
        for (let li = 0; li < nLeaves; li++) {
          const t = (li + rng() * 0.8) / nLeaves;
          const lp = cubicBez(p0x, p0y, c1x, c1y, c2x, c2y, p1x, p1y, t);
          const ls = Math.max(3, obj.brushSize * (0.25 + rng() * 0.2)) * (1 - t * 0.3);
          // Get tangent direction for leaf orientation
          const tNext = Math.min(1, t + 0.02);
          const lpNext = cubicBez(p0x, p0y, c1x, c1y, c2x, c2y, p1x, p1y, tNext);
          const tangent = Math.atan2(lpNext.y - lp.y, lpNext.x - lp.x);
          // Leaves point along the strand with slight variation
          const la = tangent + (rng() - 0.5) * 0.5;
          const side = (rng() > 0.5 ? 1 : -1) * (rng() * ls * 0.6);
          const perpX = -Math.sin(tangent) * side;
          const perpY = Math.cos(tangent) * side;

          ctx.save();
          ctx.translate(lp.x + perpX, lp.y + perpY);
          ctx.rotate(la);
          ctx.fillStyle = leaf();
          ctx.globalAlpha = opacity * (0.7 + rng() * 0.3);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          // Narrow lanceolate leaf
          ctx.bezierCurveTo(ls * 0.12, -ls * 0.12, ls * 0.88, -ls * 0.08, ls * 1.3, 0);
          ctx.bezierCurveTo(ls * 0.88, ls * 0.08, ls * 0.12, ls * 0.12, 0, 0);
          ctx.fill();
          ctx.restore();
          ctx.globalAlpha = opacity;
        }
      }
    }

    // ── Render leaves ──
    for (const lc of renderLeaves) {
      if (lc.type === 'magnolia') {
        // Magnolia leaves: large, glossy, elliptical/oval
        const n = Math.max(1, Math.round((3 + Math.floor(rng() * 4)) * leafCountScale));
        for (let k = 0; k < n; k++) {
          const a = rng() * Math.PI * 2;
          const d = rng() * lc.size * 0.5;
          const lx = lc.x + Math.cos(a) * d;
          const ly = lc.y + Math.sin(a) * d;
          const ls = lc.size * (0.4 + rng() * 0.4);
          const la = rng() * Math.PI * 2;
          ctx.save();
          ctx.translate(lx, ly);
          ctx.rotate(la);
          ctx.fillStyle = leaf();
          ctx.beginPath();
          // Large oval/elliptical leaf shape
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(ls * 0.25, -ls * 0.42, ls * 0.75, -ls * 0.42, ls, 0);
          ctx.bezierCurveTo(ls * 0.75, ls * 0.42, ls * 0.25, ls * 0.42, 0, 0);
          ctx.fill();
          // Glossy highlight
          ctx.globalAlpha = opacity * 0.15;
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.ellipse(ls * 0.45, -ls * 0.08, ls * 0.2, ls * 0.08, la * 0.3, 0, Math.PI * 2);
          ctx.fill();
          // Midrib
          ctx.globalAlpha = opacity * 0.3;
          ctx.strokeStyle = leaf();
          ctx.lineWidth = Math.max(0.3, ls * 0.03);
          ctx.beginPath();
          ctx.moveTo(ls * 0.05, 0);
          ctx.lineTo(ls * 0.9, 0);
          ctx.stroke();
          ctx.restore();
          ctx.globalAlpha = opacity;
        }
      } else if (lc.type === 'willow') {
        // Sparse small leaves at branch junctions (most willow foliage is on curtains)
        const n = Math.max(1, Math.round(2 * leafCountScale));
        for (let k = 0; k < n; k++) {
          const a = rng() * Math.PI * 2;
          const d = rng() * lc.size * 0.3;
          const lx = lc.x + Math.cos(a) * d;
          const ly = lc.y + Math.sin(a) * d;
          const ls = lc.size * (0.3 + rng() * 0.3);
          const la = Math.PI * 0.3 + (rng() - 0.5) * 1.0;
          ctx.save();
          ctx.translate(lx, ly);
          ctx.rotate(la);
          ctx.fillStyle = leaf();
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(ls * 0.12, -ls * 0.12, ls * 0.88, -ls * 0.08, ls * 1.3, 0);
          ctx.bezierCurveTo(ls * 0.88, ls * 0.08, ls * 0.12, ls * 0.12, 0, 0);
          ctx.fill();
          ctx.restore();
          ctx.globalAlpha = opacity;
        }
      } else {
        // Default oak-style leaves
        const n = Math.max(1, Math.round((5 + Math.floor(rng() * 7)) * leafCountScale));
        for (let k = 0; k < n; k++) {
          const a = rng() * Math.PI * 2;
          const d = rng() * lc.size * 0.6;
          const lx = lc.x + Math.cos(a) * d;
          const ly = lc.y + Math.sin(a) * d;
          const ls = lc.size * (0.3 + rng() * 0.4);
          const la = rng() * Math.PI * 2;
          ctx.save();
          ctx.translate(lx, ly);
          ctx.rotate(la);
          ctx.fillStyle = leaf();
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(ls * 0.3, -ls * 0.38, ls * 0.78, -ls * 0.22, ls, 0);
          ctx.bezierCurveTo(ls * 0.78, ls * 0.22, ls * 0.3, ls * 0.38, 0, 0);
          ctx.fill();
          ctx.strokeStyle = leaf();
          ctx.lineWidth = Math.max(0.3, ls * 0.04);
          ctx.globalAlpha = opacity * 0.35;
          ctx.beginPath();
          ctx.moveTo(ls * 0.08, 0);
          ctx.lineTo(ls * 0.85, 0);
          ctx.stroke();
          ctx.restore();
          ctx.globalAlpha = opacity;
        }
      }
    }

    // ── Render magnolia flowers ──
    // Magnolia blossoms: petals bunched upward. Closed flowers are tight buds.
    // Open flowers have outer petals that bend/fold at the midpoint as they
    // flop open with age. Stamens are tall vertical filaments drawn behind
    // petals, peeking up from inside the cup.
    if (mode === 'magnolia') {
      for (const fl of renderFlowers) {
        const fs = fl.size;
        const nPetals = 6 + Math.floor(rng() * 3);
        const baseX = fl.x;
        const baseY = fl.y;
        const openAmt = fl.open; // 0 = tight bud, 1 = fully open

        const flowerPink = 0.2 + rng() * 0.6;

        // Draw a petal that bends at the midpoint when open.
        // foldAmt: 0 = straight upward, 1 = upper half folds outward
        function drawMagnoliaPetal(px, py, baseAngle, ps, layer, foldAmt) {
          const pinkAmt = layer === 'inner' ? flowerPink * 1.2 : flowerPink;
          const baseH = (340 + rng() * 15) / 360;
          const baseS = 0.15 + Math.min(1, pinkAmt) * 0.45;
          const baseL = 0.75 + (1 - Math.min(1, pinkAmt)) * 0.18;
          const bCol = hslToRgb(baseH, baseS, Math.min(0.97, baseL));
          const tipS = 0.02 + Math.min(1, pinkAmt) * 0.08;
          const tipL = 0.93 + (1 - Math.min(1, pinkAmt)) * 0.05;
          const tCol = hslToRgb(baseH, tipS, Math.min(0.99, tipL));

          ctx.save();
          ctx.translate(px, py);
          ctx.rotate(baseAngle);

          if (foldAmt < 0.15) {
            // Straight petal — no fold
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-ps * 0.16, -ps * 0.28, -ps * 0.22, -ps * 0.65, -ps * 0.1, -ps * 0.88);
            ctx.bezierCurveTo(-ps * 0.03, -ps * 0.97, ps * 0.03, -ps * 0.97, ps * 0.1, -ps * 0.88);
            ctx.bezierCurveTo(ps * 0.22, -ps * 0.65, ps * 0.16, -ps * 0.28, 0, 0);
            ctx.fillStyle = `rgb(${bCol[0]},${bCol[1]},${bCol[2]})`;
            ctx.globalAlpha = opacity * (0.85 + rng() * 0.15);
            ctx.fill();

            // White tip
            ctx.beginPath();
            ctx.moveTo(-ps * 0.12, -ps * 0.5);
            ctx.bezierCurveTo(-ps * 0.18, -ps * 0.7, -ps * 0.08, -ps * 0.94, 0, -ps * 0.96);
            ctx.bezierCurveTo(ps * 0.08, -ps * 0.94, ps * 0.18, -ps * 0.7, ps * 0.12, -ps * 0.5);
            ctx.bezierCurveTo(ps * 0.05, -ps * 0.6, -ps * 0.05, -ps * 0.6, -ps * 0.12, -ps * 0.5);
            ctx.fillStyle = `rgb(${tCol[0]},${tCol[1]},${tCol[2]})`;
            ctx.globalAlpha = opacity * 0.5;
            ctx.fill();
          } else {
            // Folding petal: lower half goes straight up, upper half bends outward
            // The bend point is at ~50% of petal height
            const bendY = -ps * 0.48;
            const halfW = ps * 0.14; // width at bend point
            // Upper half folds outward: the tip swings out proportional to foldAmt
            // Direction of fold follows the baseAngle (outward from centre)
            const foldDx = Math.sin(0) * ps * 0.6 * foldAmt; // in local coords, fold is +X
            const foldDy = -ps * 0.42 * (1 - foldAmt * 0.5); // less upward as it folds more
            const tipX = foldDx;
            const tipY = bendY + foldDy;

            // Lower half (straight, narrow)
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-ps * 0.14, -ps * 0.15, -halfW, -ps * 0.35, -halfW, bendY);
            ctx.lineTo(halfW, bendY);
            ctx.bezierCurveTo(halfW, -ps * 0.35, ps * 0.14, -ps * 0.15, 0, 0);
            ctx.fillStyle = `rgb(${bCol[0]},${bCol[1]},${bCol[2]})`;
            ctx.globalAlpha = opacity * (0.85 + rng() * 0.15);
            ctx.fill();

            // Upper half (folding outward from bend point)
            const upperW = ps * 0.12;
            ctx.beginPath();
            ctx.moveTo(-halfW, bendY);
            ctx.bezierCurveTo(
              -halfW + foldDx * 0.3, bendY + foldDy * 0.3,
              tipX - upperW * 1.5, tipY + ps * 0.04,
              tipX, tipY
            );
            ctx.bezierCurveTo(
              tipX + upperW * 1.5, tipY + ps * 0.04,
              halfW + foldDx * 0.3, bendY + foldDy * 0.3,
              halfW, bendY
            );
            // Tip is lighter/whiter
            ctx.fillStyle = `rgb(${tCol[0]},${tCol[1]},${tCol[2]})`;
            ctx.globalAlpha = opacity * (0.8 + rng() * 0.15);
            ctx.fill();
          }

          // Subtle centre vein
          ctx.globalAlpha = opacity * 0.08;
          ctx.strokeStyle = `rgb(${bCol[0]},${bCol[1]},${bCol[2]})`;
          ctx.lineWidth = Math.max(0.3, ps * 0.015);
          ctx.beginPath();
          ctx.moveTo(0, -ps * 0.05);
          ctx.lineTo(0, -ps * 0.45);
          ctx.stroke();

          ctx.restore();
          ctx.globalAlpha = opacity;
        }

        // Draw stamens FIRST (behind petals) — only visible on open flowers
        if (openAmt > 0.4) {
          const showAlpha = Math.min(1, (openAmt - 0.4) * 2.5);
          const nStamens = 5 + Math.floor(rng() * 5);
          for (let si = 0; si < nStamens; si++) {
            // Tall thin filaments pointing upward from the centre
            const stamenX = baseX + (rng() - 0.5) * fs * 0.12;
            const stamenH = fs * (0.45 + rng() * 0.3);
            const lean = (rng() - 0.5) * fs * 0.08; // slight lean

            // Filament (thin vertical line)
            ctx.strokeStyle = `rgb(${160 + Math.floor(rng() * 40)},${170 + Math.floor(rng() * 40)},${100 + Math.floor(rng() * 40)})`;
            ctx.lineWidth = Math.max(0.4, fs * 0.015);
            ctx.globalAlpha = opacity * 0.6 * showAlpha;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(stamenX, baseY);
            ctx.lineTo(stamenX + lean, baseY - stamenH);
            ctx.stroke();

            // Anther (small oval at tip)
            ctx.fillStyle = `rgb(${180 + Math.floor(rng() * 60)},${150 + Math.floor(rng() * 50)},${30 + Math.floor(rng() * 50)})`;
            ctx.globalAlpha = opacity * 0.75 * showAlpha;
            ctx.beginPath();
            ctx.ellipse(stamenX + lean, baseY - stamenH, fs * 0.02, fs * 0.035, rng() * 0.3, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = opacity;
        }

        // Outer/back petals
        const outerCount = Math.ceil(nPetals * 0.55);
        const outerSplay = 0.4 + openAmt * 1.2;
        for (let k = 0; k < outerCount; k++) {
          const splayAngle = ((k / outerCount) - 0.5) * outerSplay + (rng() - 0.5) * 0.12;
          const ps = fs * (0.65 + rng() * 0.2);
          const offsetX = Math.sin(splayAngle) * fs * 0.05;
          const offsetY = Math.abs(splayAngle) * fs * 0.03;
          // Outer petals fold more when flower is open
          const foldAmt = openAmt * (0.6 + rng() * 0.4);
          drawMagnoliaPetal(baseX + offsetX, baseY + offsetY, splayAngle, ps, 'outer', foldAmt);
        }

        // Inner/front petals: tighter, less fold
        const innerCount = nPetals - outerCount;
        const innerSplay = 0.25 + openAmt * 0.3;
        for (let k = 0; k < innerCount; k++) {
          const splayAngle = ((k / innerCount) - 0.5) * innerSplay + (rng() - 0.5) * 0.1;
          const ps = fs * (0.45 + rng() * 0.15);
          const offsetX = Math.sin(splayAngle) * fs * 0.02;
          const foldAmt = openAmt * (0.1 + rng() * 0.2);
          drawMagnoliaPetal(baseX + offsetX, baseY, splayAngle, ps, 'inner', foldAmt);
        }

        ctx.globalAlpha = opacity;
      }
    }
  }
}
