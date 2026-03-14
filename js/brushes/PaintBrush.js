import Brush from './Brush.js';

// Paint brush — thick overlapping bristle paths with paint simulation.
//
// Bristles spread apart as the stroke begins (paint being pushed out),
// maintain width through the body, and gather back in at the end.
// Bristle widths are generous (overlap factor > 1) so neighbouring
// bristles blend into each other, simulating wet paint being pushed
// together.  A light blur pass at the end softens the seams between
// bristles without losing the visible streak texture.
//
// Offscreen canvas at full opacity; single composite with user opacity.

const HEADS = {
  // startW/endW: fraction of full width at the very start/end of stroke
  // rampIn/rampOut: how many brush-widths to reach full / taper from
  flat:    { widthRatio: 1.0,  bristleDensity: 0.70, edgeSoftness: 0.0,  blurPx: 0.8,
             startW: 0.85, endW: 0.6, rampIn: 1.0, rampOut: 1.5 },
  round:   { widthRatio: 0.6,  bristleDensity: 0.75, edgeSoftness: 0.5,  blurPx: 1.0,
             startW: 0.3,  endW: 0.15, rampIn: 3.0, rampOut: 2.5 },
  fan:     { widthRatio: 1.6,  bristleDensity: 0.45, edgeSoftness: 0.0,  blurPx: 0.5,
             startW: 0.25, endW: 0.35, rampIn: 4.0, rampOut: 2.0 },
  filbert: { widthRatio: 0.8,  bristleDensity: 0.70, edgeSoftness: 0.3,  blurPx: 0.9,
             startW: 0.45, endW: 0.25, rampIn: 2.5, rampOut: 2.0 },
  detail:  { widthRatio: 0.3,  bristleDensity: 0.80, edgeSoftness: 0.5,  blurPx: 1.2,
             startW: 0.5,  endW: 0.3,  rampIn: 1.5, rampOut: 1.5 },
};

export { HEADS as PAINT_HEADS };

let _offCanvas = null, _offCtx = null;
let _blurCanvas = null, _blurCtx = null;

function ensureCanvas(ref, w, h) {
  if (!ref.c) { ref.c = document.createElement('canvas'); ref.x = ref.c.getContext('2d'); }
  if (ref.c.width !== w || ref.c.height !== h) {
    ref.c.width = w; ref.c.height = h;
  } else {
    ref.x.clearRect(0, 0, w, h);
  }
  return ref;
}

const _off = { c: null, x: null };
const _blur = { c: null, x: null };

function angleDiff(a, b) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export default class PaintBrush extends Brush {
  constructor() {
    super('paint');
  }

  render(ctx, obj) {
    const pts = obj.points;
    if (!pts || pts.length === 0) return;

    const opacity = obj.opacity || 1;
    const size = obj.brushSize;
    const headName = obj.paintHead || 'flat';
    const head = HEADS[headName] || HEADS.flat;
    const seed = obj.id || 0;
    const rng = this.createRng(seed);
    const { r, g, b } = this.parseColor(obj.color);

    const arcLens = this.computeArcLengths(pts);
    const totalLen = arcLens[arcLens.length - 1];
    const halfW = size * head.widthRatio * 0.5;

    // Single dot
    if (totalLen < 0.5) {
      ctx.globalAlpha = opacity;
      ctx.fillStyle = obj.color;
      ctx.beginPath();
      ctx.arc(pts[0].x, pts[0].y, halfW, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // Bounding box
    const margin = halfW * 2 + 8;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of pts) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    const ox = minX - margin;
    const oy = minY - margin;
    const ow = Math.ceil(maxX - minX + margin * 2);
    const oh = Math.ceil(maxY - minY + margin * 2);
    if (ow < 1 || oh < 1) return;

    const off = ensureCanvas(_off, ow, oh);
    const oc = off.x;

    // ── Pre-compute path samples with brush-angle inertia ──
    const step = Math.max(1, size * 0.05);
    const stepCount = Math.max(3, Math.floor(totalLen / step));
    const inertia = 0.82;

    const pS = this.pointAtArc(pts, arcLens, 0);
    const pA = this.pointAtArc(pts, arcLens, Math.min(totalLen, step * 4));
    let brushAngle = Math.atan2(pA.y - pS.y, pA.x - pS.x);

    const samples = new Array(stepCount + 1);
    for (let si = 0; si <= stepCount; si++) {
      const d = (si / stepCount) * totalLen;
      const p = this.pointAtArc(pts, arcLens, d);

      const dB = Math.min(totalLen, d + step * 2.5);
      const pB = this.pointAtArc(pts, arcLens, dB);
      const dx = pB.x - p.x;
      const dy = pB.y - p.y;
      if (Math.hypot(dx, dy) > 0.1) {
        const target = Math.atan2(dy, dx);
        brushAngle += angleDiff(brushAngle, target) * (1 - inertia);
      }

      const nx = -Math.sin(brushAngle);
      const ny = Math.cos(brushAngle);

      // Spread envelope — per-head shape, absolute distance based.
      // Flat brush: nearly full width immediately (rigid bristles).
      // Round/detail: starts narrow (tip contact), widens with pressure.
      // Fan: starts narrow, fans out wide.
      const rampIn = halfW * head.rampIn;
      const rampOut = halfW * head.rampOut;
      const distFromEnd = totalLen - d;
      const tIn = Math.min(1, d / Math.max(1, rampIn));
      const tOut = Math.min(1, distFromEnd / Math.max(1, rampOut));
      const spreadIn = head.startW + (1 - head.startW) * smoothStep(tIn);
      const spreadOut = head.endW + (1 - head.endW) * smoothStep(tOut);
      const spread = spreadIn * spreadOut;

      samples[si] = { x: p.x - ox, y: p.y - oy, nx, ny, spread, d };
    }

    // ── Draw bristles ──
    const bristleCount = Math.max(4, Math.floor(halfW * 2 * head.bristleDensity));
    // Overlap factor > 1 so bristles blend into each other
    const bristleWidth = (halfW * 2) / bristleCount * 1.15;

    oc.lineCap = 'round';
    oc.lineJoin = 'round';

    for (let bi = 0; bi < bristleCount; bi++) {
      const bt = bristleCount === 1 ? 0 : (bi / (bristleCount - 1)) * 2 - 1;

      let baseOffset = bt * halfW;

      // Shape adjustments
      if (head.edgeSoftness > 0) {
        baseOffset *= 1 - Math.pow(Math.abs(bt), 1.8) * head.edgeSoftness * 0.4;
      }
      if (headName === 'fan') {
        baseOffset *= 1.0 + Math.abs(bt) * 0.25;
      }

      // Per-bristle colour variation
      const cs = (rng() - 0.5) * 16;
      const br = Math.max(0, Math.min(255, r + cs | 0));
      const bg = Math.max(0, Math.min(255, g + cs | 0));
      const bb = Math.max(0, Math.min(255, b + cs | 0));

      const jitter = (rng() - 0.5) * bristleWidth * 0.25;
      const waveAmp = size * 0.003 * (0.3 + rng() * 0.7);
      const waveFreq = 0.03 + rng() * 0.04;
      const wavePhase = rng() * Math.PI * 2;

      // ── Per-bristle start/end along the path ──
      // Simulates brush tip shape: center bristles protrude most,
      // edge bristles are recessed.  Uses a convex (circular) profile
      // so the tip shape is rounded, not linear.
      const edgeDist = Math.abs(bt); // 0 = center, 1 = edge
      const tipShape = head.edgeSoftness; // 0 = flat tip, 0.5 = rounded

      // Convex profile: sqrt(1 - x^2) gives a circular/dome shape
      // Center bristles (edgeDist=0) get 0 delay, edge bristles get max
      const profile = 1 - Math.sqrt(Math.max(0, 1 - edgeDist * edgeDist));
      const startDelay = profile * tipShape * halfW * 2.0
                       + rng() * halfW * 0.35;
      const endLift = profile * tipShape * halfW * 1.5
                    + rng() * halfW * 0.25;

      // Convert to sample indices, clamped safely
      const firstSi = Math.min(stepCount - 1,
        Math.max(0, Math.floor((startDelay / totalLen) * stepCount)));
      const lastSi = Math.min(stepCount,
        Math.max(firstSi + 1, stepCount - Math.floor((endLift / totalLen) * stepCount)));

      // Edge bristles slightly thinner
      const edgeThin = 1 - Math.pow(edgeDist, 4) * 0.25;
      const w = Math.max(0.5, bristleWidth * edgeThin);

      oc.strokeStyle = `rgb(${br},${bg},${bb})`;
      oc.lineWidth = w;
      oc.globalAlpha = 1;

      oc.beginPath();
      for (let si = firstSi; si <= lastSi; si++) {
        const s = samples[si];
        const wave = Math.sin(si * waveFreq + wavePhase) * waveAmp;
        const off = (baseOffset + jitter + wave) * s.spread;
        const bx = s.x + s.nx * off;
        const by = s.y + s.ny * off;

        if (si === firstSi) oc.moveTo(bx, by);
        else oc.lineTo(bx, by);
      }
      oc.stroke();
    }

    // ── Blur pass to blend bristle seams ──
    // Draws the bristle canvas through a small blur, then composites
    // the sharp original on top so streaks stay visible but seams soften.
    const blurAmt = Math.max(0.5, head.blurPx * (size / 30));
    const bl = ensureCanvas(_blur, ow, oh);
    const bc = bl.x;

    // Blurred copy
    bc.filter = `blur(${blurAmt}px)`;
    bc.drawImage(off.c, 0, 0);
    bc.filter = 'none';

    // Layer sharp bristles on top at reduced opacity so texture shows
    // through the blurred base
    bc.globalAlpha = 0.6;
    bc.drawImage(off.c, 0, 0);
    bc.globalAlpha = 1;

    // Single composite
    ctx.globalAlpha = opacity;
    ctx.drawImage(bl.c, ox, oy);
  }
}

function smoothStep(t) {
  return t * t * (3 - 2 * t);
}
