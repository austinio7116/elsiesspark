// Willow tree renderer — hanging curtain strands with narrow leaves
export default function renderWillow(ctx, h) {
  const { rng, opacity, brushSize, leafHsl, hslToRgb,
          leafDensity, branchDensity, seed,
          trunkEnd, trunkBaseY,
          bezPt, cubicBez, drawTrunk, fractalGrow, seedFromTrunk,
          filterByDensity, filterBranches, renderBranches, makeBark } = h;

  const bark = makeBark(25 / 360, 0.45, 0.28);
  drawTrunk(bark);

  const curtains = [];

  const fg = fractalGrow({
    spread: 0.45, spreadRange: 0.3,
    nKidsProb: 0.45,
    lenDecay: 0.6, lenRange: 0.18,
    onTerminal({ sx, sy, mx, my, ex, ey, endW, depth }) {
      const out = [];
      // Spawn hanging curtains at terminal branches
      if (depth >= 2) {
        const endAngle = Math.atan2(ey - my, ex - mx);
        const nCurtains = 2 + Math.floor(rng() * 3);
        for (let ci = 0; ci < nCurtains; ci++) {
          const curtainLen = trunkEnd * (0.35 + rng() * 0.45);
          const startDx = Math.cos(endAngle);
          const startDy = Math.sin(endAngle);
          const horizDrift = (rng() - 0.5) * curtainLen * 0.3;
          curtains.push({
            x: ex + (rng() - 0.5) * endW,
            y: ey + (rng() - 0.5) * endW,
            dx: startDx, dy: startDy,
            len: curtainLen,
            drift: horizDrift,
            width: Math.max(0.3, endW * 0.15)
          });
        }
      }
      // Sparse leaves at branch junctions
      const baseLSize = Math.max(2, brushSize * (0.15 + rng() * 0.15));
      out.push({ x: ex, y: ey, size: baseLSize });
      return out;
    }
  });

  seedFromTrunk(fg.grow, { sideStart: 0.25, sideStep: 0.1 });

  const branches = filterBranches(fg.branches, branchDensity, seed + 99999);
  renderBranches(branches, bark);

  // Filter curtains by branch density
  let renderCurtains = curtains;
  const cRng = h.createRng(seed + 77777);
  if (branchDensity < 1) {
    renderCurtains = curtains.filter(() => cRng() < (0.3 + branchDensity * 0.7));
  } else if (branchDensity > 1) {
    renderCurtains = [];
    for (const c of curtains) {
      renderCurtains.push(c);
      if (cRng() < (branchDensity - 1) * 0.6) {
        renderCurtains.push({
          ...c,
          x: c.x + (cRng() - 0.5) * 6,
          drift: c.drift + (cRng() - 0.5) * c.len * 0.15
        });
      }
    }
  }

  // --- Optimization 1: Pre-generate leaf colour palette (8 colours) ---
  const PALETTE_SIZE = 8;
  const leafPalette = [];
  for (let i = 0; i < PALETTE_SIZE; i++) {
    const r = hslToRgb(
      leafHsl[0] + (rng() - 0.3) * 0.06,
      Math.min(1, leafHsl[1] - 0.05 + (rng() - 0.3) * 0.1),
      Math.max(0.3, Math.min(0.65, leafHsl[2] + 0.05 + (rng() - 0.4) * 0.15))
    );
    leafPalette.push(`rgb(${r[0]},${r[1]},${r[2]})`);
  }

  // --- Collect all curtain strand segments and leaves ---
  // segData: { ox, oy, ex, ey, w (rounded to 0.5), strokeStyle, alpha }
  const segBuckets = new Map(); // key: rounded lineWidth -> array of segments
  // leafData: { lx, ly, ls, la, colIdx, alpha }
  const curtainLeaves = [];

  for (const c of renderCurtains) {
    const p0x = c.x, p0y = c.y;
    const forwardDist = c.len * 0.2;
    const c1x = p0x + c.dx * forwardDist;
    const c1y = Math.min(p0y + c.dy * forwardDist, trunkBaseY);
    const c2x = p0x + c.drift * 0.5 + c.dx * forwardDist * 0.3;
    const c2y = Math.min(p0y + c.len * 0.65, trunkBaseY);
    const p1x = p0x + c.drift;
    const p1y = Math.min(p0y + c.len, trunkBaseY);

    // Collect strand segments
    const nSegs = Math.max(10, Math.ceil(c.len / 3));
    for (let i = 0; i < nSegs; i++) {
      const t0 = i / nSegs, t1 = (i + 1) / nSegs;
      const pa = cubicBez(p0x, p0y, c1x, c1y, c2x, c2y, p1x, p1y, t0);
      const pb = cubicBez(p0x, p0y, c1x, c1y, c2x, c2y, p1x, p1y, t1);
      const w = Math.max(0.3, c.width * (1 - t0 * 0.85));
      const roundedW = Math.round(w * 2) / 2; // round to 0.5px steps
      const strokeStyle = bark(0.05 + (rng() - 0.5) * 0.04);
      const alpha = opacity * (0.6 + rng() * 0.3);
      if (!segBuckets.has(roundedW)) segBuckets.set(roundedW, []);
      segBuckets.get(roundedW).push({ ox: pa.x, oy: pa.y, ex: pb.x, ey: pb.y, strokeStyle, alpha });
    }

    // Collect curtain leaves
    const nLeaves = Math.max(2, Math.round((c.len / 10) * leafDensity));
    for (let li = 0; li < nLeaves; li++) {
      const t = (li + rng() * 0.8) / nLeaves;
      const lp = cubicBez(p0x, p0y, c1x, c1y, c2x, c2y, p1x, p1y, t);
      const ls = Math.max(3, brushSize * (0.25 + rng() * 0.2)) * (1 - t * 0.3);
      const tNext = Math.min(1, t + 0.02);
      const lpNext = cubicBez(p0x, p0y, c1x, c1y, c2x, c2y, p1x, p1y, tNext);
      const tangent = Math.atan2(lpNext.y - lp.y, lpNext.x - lp.x);
      const la = tangent + (rng() - 0.5) * 0.5;
      const side = (rng() > 0.5 ? 1 : -1) * (rng() * ls * 0.6);
      const perpX = -Math.sin(tangent) * side;
      const perpY = Math.cos(tangent) * side;
      const colIdx = Math.floor(rng() * PALETTE_SIZE) % PALETTE_SIZE;
      const alpha = opacity * (0.7 + rng() * 0.3);

      curtainLeaves.push({
        lx: lp.x + perpX, ly: lp.y + perpY,
        ls, la, colIdx, alpha
      });
    }
  }

  // --- Optimization 2: Batch-render strand segments grouped by lineWidth ---
  ctx.lineCap = 'round';
  for (const [w, segs] of segBuckets) {
    ctx.lineWidth = w;
    for (const s of segs) {
      ctx.strokeStyle = s.strokeStyle;
      ctx.globalAlpha = s.alpha;
      ctx.beginPath();
      ctx.moveTo(s.ox, s.oy);
      ctx.lineTo(s.ex, s.ey);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = opacity;

  // --- Optimization 3: Batch curtain leaves by colour ---
  for (let ci = 0; ci < PALETTE_SIZE; ci++) {
    ctx.fillStyle = leafPalette[ci];
    for (const lf of curtainLeaves) {
      if (lf.colIdx !== ci) continue;
      const { lx, ly, ls, la, alpha } = lf;
      const cos = Math.cos(la), sin = Math.sin(la);

      // Rotate bezier control points directly
      // Original: moveTo(0,0), bezierCurveTo(ls*0.12, -ls*0.12, ls*0.88, -ls*0.08, ls*1.3, 0),
      //           bezierCurveTo(ls*0.88, ls*0.08, ls*0.12, ls*0.12, 0, 0)
      const cp1x = ls * 0.12, cp1y = -ls * 0.12;
      const cp2x = ls * 0.88, cp2y = -ls * 0.08;
      const epx  = ls * 1.3,  epy  = 0;
      const cp3x = ls * 0.88, cp3y = ls * 0.08;
      const cp4x = ls * 0.12, cp4y = ls * 0.12;

      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.bezierCurveTo(
        lx + cp1x * cos - cp1y * sin, ly + cp1x * sin + cp1y * cos,
        lx + cp2x * cos - cp2y * sin, ly + cp2x * sin + cp2y * cos,
        lx + epx * cos - epy * sin,   ly + epx * sin + epy * cos
      );
      ctx.bezierCurveTo(
        lx + cp3x * cos - cp3y * sin, ly + cp3x * sin + cp3y * cos,
        lx + cp4x * cos - cp4y * sin, ly + cp4x * sin + cp4y * cos,
        lx, ly
      );
      ctx.fill();
    }
  }
  ctx.globalAlpha = opacity;

  // --- Optimization 4: Batch junction leaves by colour ---
  const foliage = filterByDensity(fg.foliage, leafDensity, seed + 99998);
  const junctionLeaves = [];
  for (const lc of foliage) {
    const n = Math.max(1, Math.round(2 * leafDensity));
    for (let k = 0; k < n; k++) {
      // Consume ALL rng values before filtering by colour
      const a = rng() * Math.PI * 2;
      const d = rng() * lc.size * 0.3;
      const lx = lc.x + Math.cos(a) * d;
      const ly = lc.y + Math.sin(a) * d;
      const ls = lc.size * (0.3 + rng() * 0.3);
      const la = Math.PI * 0.3 + (rng() - 0.5) * 1.0;
      const colIdx = Math.floor(rng() * PALETTE_SIZE) % PALETTE_SIZE;
      // Two rng calls consumed by the old leaf() function
      rng(); rng();

      junctionLeaves.push({ lx, ly, ls, la, colIdx });
    }
  }

  for (let ci = 0; ci < PALETTE_SIZE; ci++) {
    ctx.fillStyle = leafPalette[ci];
    for (const lf of junctionLeaves) {
      if (lf.colIdx !== ci) continue;
      const { lx, ly, ls, la } = lf;
      const cos = Math.cos(la), sin = Math.sin(la);

      const cp1x = ls * 0.12, cp1y = -ls * 0.12;
      const cp2x = ls * 0.88, cp2y = -ls * 0.08;
      const epx  = ls * 1.3,  epy  = 0;
      const cp3x = ls * 0.88, cp3y = ls * 0.08;
      const cp4x = ls * 0.12, cp4y = ls * 0.12;

      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.bezierCurveTo(
        lx + cp1x * cos - cp1y * sin, ly + cp1x * sin + cp1y * cos,
        lx + cp2x * cos - cp2y * sin, ly + cp2x * sin + cp2y * cos,
        lx + epx * cos - epy * sin,   ly + epx * sin + epy * cos
      );
      ctx.bezierCurveTo(
        lx + cp3x * cos - cp3y * sin, ly + cp3x * sin + cp3y * cos,
        lx + cp4x * cos - cp4y * sin, ly + cp4x * sin + cp4y * cos,
        lx, ly
      );
      ctx.fill();
    }
  }
  ctx.globalAlpha = opacity;
}
