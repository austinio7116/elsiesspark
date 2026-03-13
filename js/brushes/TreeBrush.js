import Brush from './Brush.js';
import { rgbToHsl, hslToRgb } from '../utils.js';
import renderOak from './trees/oak.js';
import renderMagnolia from './trees/magnolia.js';
import renderWillow from './trees/willow.js';
import renderCherry from './trees/cherry.js';
import renderPine from './trees/pine.js';
import renderPalm from './trees/palm.js';
import renderMaple from './trees/maple.js';
import renderBirch from './trees/birch.js';

const TYPES = {
  default: renderOak,
  magnolia: renderMagnolia,
  willow: renderWillow,
  cherry: renderCherry,
  pine: renderPine,
  palm: renderPalm,
  maple: renderMaple,
  birch: renderBirch,
};

export default class TreeBrush extends Brush {
  constructor() {
    super('tree');
  }

  render(ctx, obj) {
    const pts = obj.points;
    const seed = obj.id || 0;
    const rng = this.createRng(seed);
    const opacity = obj.opacity || 1;
    ctx.globalAlpha = opacity;

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

    const hex = obj.color;
    const colR = parseInt(hex.slice(1, 3), 16), colG = parseInt(hex.slice(3, 5), 16), colB = parseInt(hex.slice(5, 7), 16);
    const leafHsl = rgbToHsl(colR, colG, colB);
    const trunkW = Math.max(5, obj.brushSize);
    const topP = ptAt(trunkEnd);
    const topD = dirAt(trunkEnd);
    const trunkAngle = Math.atan2(topD.dy, topD.dx);
    const topW = trunkW * 0.28;
    const maxDepth = Math.max(4, Math.min(7, Math.ceil(Math.log2(Math.max(trunkEnd, 40)) + 1)));
    const leafDensity = (obj.treeLeafDensity || 5) / 5;
    const branchDensity = (obj.treeBranchDensity || 5) / 5;
    const trunkBaseY = ptAt(0).y;

    // ── Bezier helpers ──
    function bezPt(sx, sy, mx, my, ex, ey, t) {
      const u = 1 - t;
      return { x: u * u * sx + 2 * u * t * mx + t * t * ex,
               y: u * u * sy + 2 * u * t * my + t * t * ey };
    }
    function cubicBez(p0x, p0y, c1x, c1y, c2x, c2y, p1x, p1y, t) {
      const u = 1 - t;
      return {
        x: u*u*u*p0x + 3*u*u*t*c1x + 3*u*t*t*c2x + t*t*t*p1x,
        y: u*u*u*p0y + 3*u*u*t*c1y + 3*u*t*t*c2y + t*t*t*p1y
      };
    }

    // ── Branch drawing helpers ──
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

    function drawLimb(sx, sy, mx, my, ex, ey, w0, w1, barkFn) {
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
      ctx.fillStyle = barkFn(0);
      ctx.fill();
      ctx.lineWidth = Math.max(0.5, w0 * 0.04);
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.strokeStyle = barkFn(-0.1);
      ctx.beginPath();
      ctx.moveTo(leftPts[0].x, leftPts[0].y);
      for (let i = 1; i < leftPts.length; i++) ctx.lineTo(leftPts[i].x, leftPts[i].y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rightPts[0].x, rightPts[0].y);
      for (let i = 1; i < rightPts.length; i++) ctx.lineTo(rightPts[i].x, rightPts[i].y);
      ctx.stroke();
      // Bark texture
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
        ctx.strokeStyle = barkFn(-0.06 + rng() * 0.03);
        ctx.globalAlpha = opacity * (0.1 + rng() * 0.15);
        ctx.beginPath();
        ctx.moveTo(p.x + nx2 * (off2 - hw2 * 0.3), p.y + ny2 * (off2 - hw2 * 0.3));
        ctx.lineTo(p.x + nx2 * (off2 + hw2 * 0.3), p.y + ny2 * (off2 + hw2 * 0.3));
        ctx.stroke();
      }
      ctx.globalAlpha = opacity;
    }

    // ── Trunk drawing ──
    function drawTrunk(barkFn) {
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
      ctx.fillStyle = barkFn(0);
      ctx.fill();
      ctx.lineWidth = Math.max(0.6, trunkW * 0.035);
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.strokeStyle = barkFn(-0.1);
      ctx.beginPath();
      ctx.moveTo(leftE[0].x, leftE[0].y);
      for (let i = 1; i < leftE.length; i++) ctx.lineTo(leftE[i].x, leftE[i].y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(rightE[0].x, rightE[0].y);
      for (let i = 1; i < rightE.length; i++) ctx.lineTo(rightE[i].x, rightE[i].y);
      ctx.stroke();
      // Bark texture lines
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
        ctx.strokeStyle = barkFn(-0.06 + rng() * 0.03);
        ctx.lineWidth = Math.max(0.4, trunkW * 0.025);
        ctx.globalAlpha = opacity * (0.12 + rng() * 0.18);
        ctx.beginPath();
        ctx.moveTo(p.x + nx * (off - hw * 0.3), p.y + ny * (off - hw * 0.3));
        ctx.lineTo(p.x + nx * (off + hw * 0.3), p.y + ny * (off + hw * 0.3));
        ctx.stroke();
      }
      ctx.globalAlpha = opacity;
      return { leftE, rightE, nSamples };
    }

    // ── Fractal growth ──
    function fractalGrow(opts = {}) {
      const {
        angleModifier = null,
        spread = 0.35, spreadRange = 0.25,
        nKidsProb = 0.55,
        lenDecay = 0.62, lenRange = 0.16,
        widthDecay = 0.68, widthRange = 0.06,
        bendEarly = 0.25, bendLate = 0.45,
        onTerminal = null,
      } = opts;
      const branches = [];
      const foliage = [];

      function grow(sx, sy, angle, len, width, depth, maxD) {
        if (depth > maxD || width < 0.4 || len < 1.5) return;
        const bendAmt = depth < 2 ? bendEarly : bendLate;
        const bend = (rng() - 0.5) * bendAmt;
        let a = angle;
        if (angleModifier) a = angleModifier(a, depth);
        const midA = a + bend;
        const mx = sx + Math.cos(midA) * len * 0.5;
        const my = sy + Math.sin(midA) * len * 0.5;
        const ex = sx + Math.cos(a + bend * 0.5) * len;
        const ey = sy + Math.sin(a + bend * 0.5) * len;
        const endW = width * (widthDecay + rng() * widthRange);
        branches.push({ sx, sy, mx, my, ex, ey, w0: width, w1: endW, depth });
        const isSmall = depth >= maxD - 2 || endW < 3;
        if (isSmall && onTerminal) {
          foliage.push(...onTerminal({ sx, sy, mx, my, ex, ey, endW, depth, width }));
        }
        if (depth >= maxD || endW < 1.2) return;
        const nKids = rng() > nKidsProb ? 3 : 2;
        const sp = spread + rng() * spreadRange;
        const endAngle = Math.atan2(ey - my, ex - mx);
        for (let c = 0; c < nKids; c++) {
          const frac = nKids === 2
            ? (c === 0 ? -1 : 1) * (sp * (0.7 + rng() * 0.6))
            : (c - 1) * sp * (0.7 + rng() * 0.6);
          const childAngle = endAngle + frac;
          const childW = endW / Math.sqrt(nKids) * (0.85 + rng() * 0.3);
          const childLen = len * (lenDecay + rng() * lenRange);
          grow(ex, ey, childAngle, childLen, Math.max(0.4, childW), depth + 1, maxD);
        }
      }
      return { grow, branches, foliage };
    }

    // ── Seed branches from trunk ──
    function seedFromTrunk(growFn, opts = {}) {
      const { sideStart = 0.18, sideEnd = 0.93, sideStep = 0.08, sideStepRange = 0.06 } = opts;
      if (hasCrown) {
        const toCrown = Math.atan2(crownCY - topP.y, crownCX - topP.x);
        const mainLen = Math.max(crownR * 0.5, trunkEnd * 0.12);
        growFn(topP.x, topP.y, toCrown, mainLen, topW, 0, maxDepth);
        const nPri = 3 + Math.floor(rng() * 2);
        for (let i = 0; i < nPri; i++) {
          const a = toCrown + (rng() - 0.5) * 1.6;
          growFn(topP.x, topP.y, a, mainLen * (0.55 + rng() * 0.35), topW * (0.6 + rng() * 0.3), 0, maxDepth);
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
          const bx = p.x + nx * hw, by = p.y + ny * hw;
          const outA = Math.atan2(ny, nx);
          const bAngle = outA + (rng() - 0.5) * 0.4;
          const bW = topW * taper * (0.4 + rng() * 0.3);
          const bLen = mainLen * (0.25 + rng() * 0.25);
          growFn(bx, by, bAngle, bLen, Math.max(0.6, bW), 1, maxDepth);
        }
      } else {
        const mainLen = trunkEnd * (0.22 + rng() * 0.12);
        growFn(topP.x, topP.y, trunkAngle, mainLen, topW, 0, maxDepth);
        let sideFlag = 1;
        for (let frac = sideStart + rng() * 0.06; frac < sideEnd; frac += sideStep + rng() * sideStepRange) {
          sideFlag *= -1;
          const d = frac * trunkEnd;
          const p = ptAt(d);
          const dr = dirAt(d);
          const nx = -dr.dy * sideFlag, ny = dr.dx * sideFlag;
          const taper = 1 - frac * 0.72;
          const hw = trunkW * 0.5 * taper;
          const bx = p.x + nx * hw, by = p.y + ny * hw;
          const outAngle = Math.atan2(ny, nx);
          const upBias = frac * 0.4;
          const bAngle = outAngle * (1 - upBias) + trunkAngle * upBias + (rng() - 0.5) * 0.3;
          const lenScale = 0.3 + frac * 0.7;
          const bW = topW * taper * (0.45 + rng() * 0.35);
          const bLen = mainLen * (0.3 + rng() * 0.3) * lenScale;
          const depthStart = frac < 0.35 ? 2 : 1;
          growFn(bx, by, bAngle, bLen, Math.max(0.6, bW), depthStart, maxDepth);
        }
      }
    }

    // ── Density filtering ──
    function filterByDensity(items, density, filterSeed) {
      const fRng = self.createRng(filterSeed);
      if (density === 1) return items;
      if (density < 1) return items.filter(() => fRng() < (0.2 + density * 0.8));
      const out = [];
      for (const it of items) {
        out.push(it);
        const extra = Math.floor((density - 1) * 2 * fRng());
        for (let i = 0; i < extra; i++) {
          out.push({
            ...it,
            x: it.x + (fRng() - 0.5) * (it.size || 5) * 1.5,
            y: it.y + (fRng() - 0.5) * (it.size || 5) * 1.5,
            size: (it.size || 5) * (0.6 + fRng() * 0.5)
          });
        }
      }
      return out;
    }
    function filterBranches(branches, density, filterSeed) {
      const fRng = self.createRng(filterSeed);
      if (density === 1) return branches;
      if (density < 1) return branches.filter(br => br.depth <= 1 || fRng() < (0.3 + density * 0.7));
      const out = [];
      for (const br of branches) {
        out.push(br);
        if (br.depth >= 2 && fRng() < (density - 1) * 0.5) {
          const off = (fRng() - 0.5) * br.w0 * 2;
          out.push({ ...br, sx: br.sx+off, sy: br.sy+off, mx: br.mx+off, my: br.my+off, ex: br.ex+off, ey: br.ey+off, w0: br.w0*0.8, w1: br.w1*0.8 });
        }
      }
      return out;
    }

    // ── Branch rendering ──
    function renderBranches(branches, barkFn) {
      branches.sort((a, b) => a.depth - b.depth);
      for (const br of branches) {
        if (br.depth < 2 && br.w0 > 2) {
          drawLimb(br.sx, br.sy, br.mx, br.my, br.ex, br.ey, br.w0, br.w1, barkFn);
        } else {
          const col = barkFn((br.depth * 0.02) + (rng() - 0.5) * 0.04);
          drawTapered(br.sx, br.sy, br.mx, br.my, br.ex, br.ey, br.w0, br.w1, col);
        }
      }
    }

    // ── Make bark function ──
    function makeBark(bH, bS, bL) {
      return function(lAdj) {
        const r = hslToRgb(bH + (rng() - 0.5) * 0.02, bS, Math.max(0.1, Math.min(0.48, bL + lAdj)));
        return `rgb(${r[0]},${r[1]},${r[2]})`;
      };
    }

    // ── Build helpers ──
    const h = {
      rng, seed, createRng: s => self.createRng(s),
      ctx, opacity, brushSize: obj.brushSize, color: obj.color, leafHsl,
      pts, arcLens, totalLen, ptAt, dirAt,
      trunkEnd, trunkW, trunkBaseY,
      hasCrown, crownCX, crownCY, crownR,
      topP, topD, trunkAngle, topW, maxDepth,
      leafDensity, branchDensity,
      bezPt, cubicBez, hslToRgb, rgbToHsl,
      drawTapered, drawLimb, drawTrunk,
      fractalGrow, seedFromTrunk,
      filterByDensity, filterBranches,
      renderBranches, makeBark,
    };

    const renderFn = TYPES[obj.treeMode || 'default'] || TYPES.default;
    renderFn(ctx, h);
  }
}
