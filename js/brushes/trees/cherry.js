// Cherry Blossom tree renderer — optimised
// Wide horizontal spreading branches, clusters of small 5-petal pink/white flowers,
// smooth dark reddish-brown bark, small bronze-tinted leaves
export default function renderCherry(ctx, h) {
  const { rng, opacity, brushSize, leafHsl, hslToRgb,
          leafDensity, branchDensity, seed,
          bezPt, drawTrunk, fractalGrow, seedFromTrunk,
          filterByDensity, filterBranches, renderBranches, makeBark } = h;

  // Smooth dark reddish-brown bark
  const bark = makeBark(10 / 360, 0.35, 0.22);
  drawTrunk(bark);

  const blossomClusters = [];

  const fg = fractalGrow({
    // Wide horizontal spreading
    spread: 0.4, spreadRange: 0.25,
    nKidsProb: 0.45,
    lenDecay: 0.58, lenRange: 0.14,
    widthDecay: 0.65, widthRange: 0.08,
    onTerminal({ sx, sy, mx, my, ex, ey, endW, depth, width }) {
      const out = [];
      // Small leaves
      const baseLSize = Math.max(3, brushSize * (0.3 + rng() * 0.25));
      out.push({ x: ex, y: ey, size: baseLSize });
      for (const bt of [0.35 + rng() * 0.15, 0.65 + rng() * 0.15]) {
        const mp = bezPt(sx, sy, mx, my, ex, ey, bt);
        out.push({
          x: mp.x + (rng() - 0.5) * width * 1.2,
          y: mp.y + (rng() - 0.5) * width * 1.2,
          size: baseLSize * (0.6 + rng() * 0.4)
        });
      }
      // Dense blossom clusters at most branch tips
      if (rng() > 0.25) {
        const clusterSize = Math.max(5, brushSize * (0.5 + rng() * 0.4));
        const nFlowers = 3 + Math.floor(rng() * 5);
        blossomClusters.push({
          x: ex, y: ey,
          size: clusterSize,
          count: nFlowers
        });
      }
      return out;
    }
  });

  seedFromTrunk(fg.grow);

  const branches = filterBranches(fg.branches, branchDensity, seed + 99999);
  renderBranches(branches, bark);

  const foliage = filterByDensity(fg.foliage, leafDensity, seed + 99998);

  // Filter blossoms
  let renderClusters = blossomClusters;
  const fRng = h.createRng(seed + 88888);
  if (leafDensity < 1) {
    renderClusters = blossomClusters.filter(() => fRng() < (0.3 + leafDensity * 0.7));
  } else if (leafDensity > 1) {
    renderClusters = [];
    for (const cl of blossomClusters) {
      renderClusters.push(cl);
      if (fRng() < (leafDensity - 1) * 0.5) {
        renderClusters.push({
          ...cl,
          x: cl.x + (fRng() - 0.5) * cl.size * 1.5,
          y: cl.y + (fRng() - 0.5) * cl.size * 1.5,
          count: cl.count + Math.floor(fRng() * 2)
        });
      }
    }
  }

  // --- Pre-generate leaf colour palette (8 colours) ---
  const leafPalette = [];
  for (let i = 0; i < 8; i++) {
    const r = hslToRgb(
      leafHsl[0] + (rng() - 0.5) * 0.05 + 0.02,
      Math.min(1, leafHsl[1] - 0.05 + rng() * 0.1),
      Math.max(0.25, Math.min(0.55, leafHsl[2] + (rng() - 0.5) * 0.15))
    );
    leafPalette.push(`rgb(${r[0]},${r[1]},${r[2]})`);
  }

  // --- Pre-generate petal colour palette (8 shades white-pink) ---
  const petalPalette = [];
  for (let i = 0; i < 8; i++) {
    const pinkAmt = 0.3 + rng() * 0.7;
    const pH = (345 + rng() * 20) / 360;
    const pS = 0.2 + pinkAmt * 0.4;
    const pL = 0.8 + (1 - pinkAmt) * 0.15;
    const pCol = hslToRgb(pH, pS, Math.min(0.97, pL));
    petalPalette.push(`rgb(${pCol[0]},${pCol[1]},${pCol[2]})`);
  }

  // --- Collect all leaf data ---
  // Each leaf: { lx, ly, ls, la, colIdx }
  const allLeaves = [];
  for (const lc of foliage) {
    const n = Math.max(1, Math.round((3 + Math.floor(rng() * 4)) * leafDensity));
    for (let k = 0; k < n; k++) {
      const a = rng() * Math.PI * 2;
      const d = rng() * lc.size * 0.5;
      const lx = lc.x + Math.cos(a) * d;
      const ly = lc.y + Math.sin(a) * d;
      const ls = lc.size * (0.25 + rng() * 0.3);
      const la = rng() * Math.PI * 2;
      const colIdx = Math.floor(rng() * leafPalette.length);
      allLeaves.push({ lx, ly, ls, la, colIdx });
    }
  }

  // --- Batch leaf fills by colour ---
  // Leaf shape: moveTo(0,0), bezier(ls*0.2,-ls*0.3, ls*0.7,-ls*0.2, ls,0),
  //             bezier(ls*0.7,ls*0.2, ls*0.2,ls*0.3, 0,0)
  // Rotated point: lx + px*cos(la) - py*sin(la), ly + px*sin(la) + py*cos(la)
  ctx.globalAlpha = opacity;
  for (let ci = 0; ci < leafPalette.length; ci++) {
    ctx.fillStyle = leafPalette[ci];
    ctx.beginPath();
    for (const lf of allLeaves) {
      if (lf.colIdx !== ci) continue;
      const { lx, ly, ls, la } = lf;
      const cosA = Math.cos(la);
      const sinA = Math.sin(la);

      // moveTo(0,0) => (lx, ly)
      ctx.moveTo(lx, ly);

      // bezierCurveTo(ls*0.2, -ls*0.3, ls*0.7, -ls*0.2, ls, 0)
      const cp1x = ls * 0.2, cp1y = -ls * 0.3;
      const cp2x = ls * 0.7, cp2y = -ls * 0.2;
      const epx = ls,        epy = 0;
      ctx.bezierCurveTo(
        lx + cp1x * cosA - cp1y * sinA, ly + cp1x * sinA + cp1y * cosA,
        lx + cp2x * cosA - cp2y * sinA, ly + cp2x * sinA + cp2y * cosA,
        lx + epx * cosA  - epy * sinA,  ly + epx * sinA  + epy * cosA
      );

      // bezierCurveTo(ls*0.7, ls*0.2, ls*0.2, ls*0.3, 0, 0)
      const cp3x = ls * 0.7, cp3y = ls * 0.2;
      const cp4x = ls * 0.2, cp4y = ls * 0.3;
      ctx.bezierCurveTo(
        lx + cp3x * cosA - cp3y * sinA, ly + cp3x * sinA + cp3y * cosA,
        lx + cp4x * cosA - cp4y * sinA, ly + cp4x * sinA + cp4y * cosA,
        lx, ly
      );
    }
    ctx.fill();
  }

  // --- Collect ALL petal, stamen, centre data across all clusters/flowers ---
  // Petal: { px, py, pa, fs, colIdx, alpha }
  const allPetals = [];
  // Centre: { fx, fy, radius, colour }
  const allCentres = [];
  // Stamen line: { ox, oy, ex, ey, lw, strokeCol }
  const allStamens = [];
  // Anther dot: { x, y, radius, fillCol }
  const allAnthers = [];

  for (const cl of renderClusters) {
    for (let fi = 0; fi < cl.count; fi++) {
      const fx = cl.x + (rng() - 0.5) * cl.size * 1.5;
      const fy = cl.y + (rng() - 0.5) * cl.size * 1.5;
      const fs = cl.size * (0.3 + rng() * 0.35);

      // Consume rng values for colour (maintaining determinism) but use palette
      const _pinkAmt = rng();  // was: 0.3 + rng() * 0.7
      const _pH = rng();       // was: (345 + rng() * 20) / 360
      const petalColIdx = Math.floor(rng() * petalPalette.length);

      // 5 petals evenly spaced
      const baseAngle = rng() * Math.PI * 2;
      for (let pi = 0; pi < 5; pi++) {
        const pa = baseAngle + (pi / 5) * Math.PI * 2;
        const px = fx + Math.cos(pa) * fs * 0.15;
        const py = fy + Math.sin(pa) * fs * 0.15;
        const alpha = opacity * (0.8 + rng() * 0.2);
        allPetals.push({ px, py, pa, fs, colIdx: petalColIdx, alpha });
      }

      // Centre dot
      const cR = rng(), cG = rng(), cB = rng();
      allCentres.push({
        fx, fy,
        radius: fs * 0.08,
        colour: `rgb(${220 + Math.floor(cR * 30)},${180 + Math.floor(cG * 40)},${120 + Math.floor(cB * 40)})`
      });

      // Stamens
      const nSt = 3 + Math.floor(rng() * 3);
      for (let si = 0; si < nSt; si++) {
        const sa = rng() * Math.PI * 2;
        const sLen = fs * (0.12 + rng() * 0.1);
        const sR1 = rng(), sG1 = rng(), sB1 = rng();
        const lw = Math.max(0.3, fs * 0.02);
        const ex = fx + Math.cos(sa) * sLen;
        const ey = fy + Math.sin(sa) * sLen;
        allStamens.push({
          ox: fx, oy: fy, ex, ey, lw,
          strokeCol: `rgb(${200 + Math.floor(sR1 * 50)},${160 + Math.floor(sG1 * 50)},${80 + Math.floor(sB1 * 40)})`
        });
        // Anther dot
        const aR = rng(), aG = rng(), aB = rng();
        allAnthers.push({
          x: ex, y: ey,
          radius: fs * 0.02,
          fillCol: `rgb(${220 + Math.floor(aR * 35)},${140 + Math.floor(aG * 50)},${60 + Math.floor(aB * 40)})`
        });
      }
    }
  }

  // --- Batch blossom petals by colour index ---
  // Petal shape at origin:
  //   moveTo(0,0)
  //   bezier(fs*0.12,-fs*0.18, fs*0.35,-fs*0.22, fs*0.4,-fs*0.08)
  //   bezier(fs*0.42,-fs*0.02, fs*0.38,fs*0.02, fs*0.4,fs*0.08)
  //   bezier(fs*0.35,fs*0.22, fs*0.12,fs*0.18, 0,0)
  // Group by colour; within each colour group, sub-group by similar alpha
  for (let ci = 0; ci < petalPalette.length; ci++) {
    // Collect petals for this colour
    const group = [];
    for (const pt of allPetals) {
      if (pt.colIdx !== ci) continue;
      group.push(pt);
    }
    if (group.length === 0) continue;

    // Sort by alpha and batch in chunks of similar alpha
    group.sort((a, b) => a.alpha - b.alpha);
    let batchStart = 0;
    while (batchStart < group.length) {
      const baseAlpha = group[batchStart].alpha;
      let batchEnd = batchStart;
      while (batchEnd < group.length && group[batchEnd].alpha - baseAlpha < 0.05) batchEnd++;

      ctx.fillStyle = petalPalette[ci];
      ctx.globalAlpha = baseAlpha + 0.025; // midpoint of batch range
      ctx.beginPath();
      for (let i = batchStart; i < batchEnd; i++) {
        const { px, py, pa, fs } = group[i];
        const cosA = Math.cos(pa);
        const sinA = Math.sin(pa);

        // moveTo(0,0) => (px, py)
        ctx.moveTo(px, py);

        // bezierCurveTo(fs*0.12, -fs*0.18, fs*0.35, -fs*0.22, fs*0.4, -fs*0.08)
        {
          const c1x = fs * 0.12, c1y = -fs * 0.18;
          const c2x = fs * 0.35, c2y = -fs * 0.22;
          const epx = fs * 0.4,  epy = -fs * 0.08;
          ctx.bezierCurveTo(
            px + c1x * cosA - c1y * sinA, py + c1x * sinA + c1y * cosA,
            px + c2x * cosA - c2y * sinA, py + c2x * sinA + c2y * cosA,
            px + epx * cosA - epy * sinA, py + epx * sinA + epy * cosA
          );
        }

        // bezierCurveTo(fs*0.42, -fs*0.02, fs*0.38, fs*0.02, fs*0.4, fs*0.08)
        {
          const c1x = fs * 0.42, c1y = -fs * 0.02;
          const c2x = fs * 0.38, c2y = fs * 0.02;
          const epx = fs * 0.4,  epy = fs * 0.08;
          ctx.bezierCurveTo(
            px + c1x * cosA - c1y * sinA, py + c1x * sinA + c1y * cosA,
            px + c2x * cosA - c2y * sinA, py + c2x * sinA + c2y * cosA,
            px + epx * cosA - epy * sinA, py + epx * sinA + epy * cosA
          );
        }

        // bezierCurveTo(fs*0.35, fs*0.22, fs*0.12, fs*0.18, 0, 0)
        {
          const c1x = fs * 0.35, c1y = fs * 0.22;
          const c2x = fs * 0.12, c2y = fs * 0.18;
          ctx.bezierCurveTo(
            px + c1x * cosA - c1y * sinA, py + c1x * sinA + c1y * cosA,
            px + c2x * cosA - c2y * sinA, py + c2x * sinA + c2y * cosA,
            px, py
          );
        }
      }
      ctx.fill();
      batchStart = batchEnd;
    }
  }

  // --- Batch centre dots: single beginPath ---
  ctx.globalAlpha = opacity * 0.9;
  ctx.beginPath();
  for (const c of allCentres) {
    ctx.moveTo(c.fx + c.radius, c.fy);
    ctx.arc(c.fx, c.fy, c.radius, 0, Math.PI * 2);
  }
  if (allCentres.length > 0) {
    ctx.fillStyle = allCentres[Math.floor(allCentres.length / 2)].colour;
    ctx.fill();
  }

  // --- Batch stamens: group by similar lineWidth ---
  ctx.lineCap = 'round';
  ctx.globalAlpha = opacity * 0.7;
  // Sort by lineWidth and batch
  allStamens.sort((a, b) => a.lw - b.lw);
  {
    let batchStart = 0;
    while (batchStart < allStamens.length) {
      const baseLW = allStamens[batchStart].lw;
      let batchEnd = batchStart;
      while (batchEnd < allStamens.length && allStamens[batchEnd].lw - baseLW < 0.3) batchEnd++;

      ctx.lineWidth = baseLW + 0.15;
      // Within this lw batch, group by stroke colour
      // Since colours are unique, draw each line but share beginPath where possible
      // Best we can do: one beginPath per sub-batch, single stroke colour
      for (let i = batchStart; i < batchEnd; i++) {
        ctx.strokeStyle = allStamens[i].strokeCol;
        ctx.beginPath();
        ctx.moveTo(allStamens[i].ox, allStamens[i].oy);
        ctx.lineTo(allStamens[i].ex, allStamens[i].ey);
        ctx.stroke();
      }
      batchStart = batchEnd;
    }
  }

  // --- Batch anther dots: single beginPath per colour ---
  // Anthers have unique colours, but we can at least batch all into fewer calls
  // by grouping into one fill call per dot (unavoidable with unique colours).
  // However, we can avoid repeated fillStyle sets by doing them all in sequence.
  ctx.globalAlpha = opacity * 0.7;
  ctx.beginPath();
  for (const a of allAnthers) {
    ctx.moveTo(a.x + a.radius, a.y);
    ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
  }
  // Use a single mid-range anther colour for the whole batch
  if (allAnthers.length > 0) {
    ctx.fillStyle = allAnthers[Math.floor(allAnthers.length / 2)].fillCol;
    ctx.fill();
  }

  ctx.globalAlpha = opacity;
}
