// Pine / Evergreen tree renderer — optimised
// Conical silhouette. Many branches per tier at varied angles.
// Dense needle clusters rendered as batched line strokes.
export default function renderPine(ctx, h) {
  const { rng, opacity, brushSize, leafHsl, hslToRgb,
          leafDensity, branchDensity, seed,
          trunkEnd, trunkW,
          topP, trunkAngle,
          ptAt, dirAt, bezPt,
          drawTapered, makeBark } = h;

  const bark = makeBark(25 / 360, 0.25, 0.2);

  // Pre-generate a small palette of needle colours to reuse
  const needlePalette = [];
  for (let i = 0; i < 6; i++) {
    const r = hslToRgb(
      leafHsl[0] + (rng() - 0.5) * 0.04,
      Math.min(1, leafHsl[1] + 0.08 + rng() * 0.08),
      Math.max(0.14, Math.min(0.4, leafHsl[2] - 0.06 + (rng() - 0.5) * 0.1))
    );
    needlePalette.push(`rgb(${r[0]},${r[1]},${r[2]})`);
  }

  // Thin central trunk
  const nSamples = Math.max(10, Math.floor(trunkEnd / 3));
  const trunkL = [], trunkR = [];
  for (let i = 0; i <= nSamples; i++) {
    const t = i / nSamples;
    const d = t * trunkEnd;
    const p = ptAt(d);
    const dr = dirAt(d);
    const nx = -dr.dy, ny = dr.dx;
    const hw = trunkW * 0.2 * (1 - t * 0.5);
    trunkL.push({ x: p.x + nx * hw, y: p.y + ny * hw });
    trunkR.push({ x: p.x - nx * hw, y: p.y - ny * hw });
  }
  ctx.beginPath();
  ctx.moveTo(trunkL[0].x, trunkL[0].y);
  for (let i = 1; i < trunkL.length; i++) ctx.lineTo(trunkL[i].x, trunkL[i].y);
  for (let i = trunkR.length - 1; i >= 0; i--) ctx.lineTo(trunkR[i].x, trunkR[i].y);
  ctx.closePath();
  ctx.fillStyle = bark(0);
  ctx.fill();

  // Build branches
  const tiers = Math.max(6, Math.min(14, Math.floor(trunkEnd / 12)));
  const maxCanopyWidth = trunkEnd * (0.38 + rng() * 0.12);
  const allBranches = [];

  for (let tier = 0; tier < tiers; tier++) {
    const tierFrac = 0.08 + (tier / tiers) * 0.88;
    const d = tierFrac * trunkEnd;
    const p = ptAt(d);
    const dr = dirAt(d);
    const perpX = -dr.dy, perpY = dr.dx;
    const conicalFrac = 1 - tierFrac;
    const tierWidth = maxCanopyWidth * conicalFrac * (0.85 + rng() * 0.3);
    if (tierWidth < 2) continue;

    const nBranches = 4 + Math.floor(rng() * 3);
    for (let bi = 0; bi < nBranches; bi++) {
      const spreadAngle = ((bi / nBranches) - 0.5) * Math.PI * 1.6 + (rng() - 0.5) * 0.4;
      const outX = perpX * Math.cos(spreadAngle) + dr.dx * Math.sin(spreadAngle) * 0.5;
      const outY = perpY * Math.cos(spreadAngle) + dr.dy * Math.sin(spreadAngle) * 0.5;
      const outLen = Math.hypot(outX, outY) || 1;
      const normX = outX / outLen, normY = outY / outLen;

      const hw = trunkW * 0.2 * (1 - tierFrac * 0.5);
      const bx = p.x + normX * hw;
      const by = p.y + normY * hw;
      const outAngle = Math.atan2(normY, normX) + 0.08 + rng() * 0.12;
      const depthFactor = Math.abs(Math.cos(spreadAngle));
      const visualLen = tierWidth * (0.6 + rng() * 0.4) * (0.4 + depthFactor * 0.6);
      const bW = Math.max(0.8, trunkW * 0.07 * (1 - tierFrac * 0.4) * (0.6 + rng() * 0.4));
      const midA = outAngle + (rng() - 0.5) * 0.15;
      const mx = bx + Math.cos(midA) * visualLen * 0.5;
      const my = by + Math.sin(midA) * visualLen * 0.5;
      const ex = bx + Math.cos(outAngle) * visualLen;
      const ey = by + Math.sin(outAngle) * visualLen;
      const clusterSize = Math.max(3, brushSize * (0.25 + conicalFrac * 0.35) * (0.6 + rng() * 0.4));

      allBranches.push({ sx: bx, sy: by, mx, my, ex, ey, w0: bW, w1: bW * 0.25,
                          tierFrac, clusterSize, branchLen: visualLen, depth: 1 });

      // Sub-branches
      const nSubs = 1 + Math.floor(rng() * 2);
      for (let si = 0; si < nSubs; si++) {
        const sf = 0.3 + (si / nSubs) * 0.5;
        const sp = bezPt(bx, by, mx, my, ex, ey, sf);
        const subSide = (si % 2 === 0) ? 1 : -1;
        const subAngle = outAngle + subSide * (0.3 + rng() * 0.35) + 0.05;
        const subLen = visualLen * (0.3 + rng() * 0.2) * (1 - sf * 0.3);
        const subW = bW * 0.4 * (1 - sf * 0.3);
        const smx = sp.x + Math.cos(subAngle) * subLen * 0.5;
        const smy = sp.y + Math.sin(subAngle) * subLen * 0.5;
        const sex = sp.x + Math.cos(subAngle) * subLen;
        const sey = sp.y + Math.sin(subAngle) * subLen;
        allBranches.push({ sx: sp.x, sy: sp.y, mx: smx, my: smy, ex: sex, ey: sey,
                            w0: Math.max(0.4, subW), w1: Math.max(0.2, subW * 0.25),
                            tierFrac, clusterSize: clusterSize * (0.6 + rng() * 0.3),
                            branchLen: subLen, depth: 2 });
      }
    }
  }

  // Filter
  const bRng = h.createRng(seed + 99999);
  let renderBr = allBranches;
  if (branchDensity < 1) {
    renderBr = allBranches.filter(br => br.depth <= 1 || bRng() < (0.3 + branchDensity * 0.7));
  }

  renderBr.sort((a, b) => a.tierFrac - b.tierFrac);

  // Collect ALL needle line data first, then batch-render by colour
  // Each needle: { ox, oy, ex, ey, colIdx, lw }
  const needles = [];

  for (const br of renderBr) {
    // Draw branch wood
    const col = bark(0.02 + (rng() - 0.5) * 0.04);
    drawTapered(br.sx, br.sy, br.mx, br.my, br.ex, br.ey, br.w0, br.w1, col);

    // Generate needle data along branch
    const steps = Math.max(3, Math.ceil(br.branchLen / 8));
    const cs = br.clusterSize;

    for (let si = 0; si <= steps; si++) {
      const t = si / steps;
      const p = bezPt(br.sx, br.sy, br.mx, br.my, br.ex, br.ey, t);
      const localCS = cs * (1 - t * 0.25);
      const nN = Math.max(4, Math.round((7 + Math.floor(rng() * 5)) * leafDensity));

      for (let ni = 0; ni < nN; ni++) {
        const ox = p.x + (rng() - 0.5) * localCS * 0.6;
        const oy = p.y + (rng() - 0.5) * localCS * 0.6;
        const na = rng() * Math.PI * 2;
        const nLen = localCS * (0.3 + rng() * 0.4);
        needles.push({
          ox, oy,
          ex: ox + Math.cos(na) * nLen,
          ey: oy + Math.sin(na) * nLen,
          colIdx: Math.floor(rng() * needlePalette.length),
          lw: Math.max(0.4, localCS * 0.035 + rng() * 0.3)
        });
      }
    }

    // Tip needles
    const tipN = Math.max(3, Math.round((6 + Math.floor(rng() * 4)) * leafDensity));
    for (let ni = 0; ni < tipN; ni++) {
      const ox = br.ex + (rng() - 0.5) * cs * 0.5;
      const oy = br.ey + (rng() - 0.5) * cs * 0.5;
      const na = rng() * Math.PI * 2;
      const nLen = cs * (0.35 + rng() * 0.35);
      needles.push({
        ox, oy,
        ex: ox + Math.cos(na) * nLen,
        ey: oy + Math.sin(na) * nLen,
        colIdx: Math.floor(rng() * needlePalette.length),
        lw: Math.max(0.4, cs * 0.035 + rng() * 0.3)
      });
    }
  }

  // Tree tip tuft
  const tipP2 = ptAt(trunkEnd);
  const tipCS = Math.max(4, brushSize * 0.35);
  const tipN2 = Math.max(6, Math.round(12 * leafDensity));
  for (let ni = 0; ni < tipN2; ni++) {
    const ox = tipP2.x + (rng() - 0.5) * tipCS * 0.3;
    const oy = tipP2.y + (rng() - 0.5) * tipCS * 0.3;
    const baseA = trunkAngle + (rng() - 0.5) * 1.2;
    const nLen = tipCS * (0.4 + rng() * 0.4);
    needles.push({
      ox, oy,
      ex: ox + Math.cos(baseA) * nLen,
      ey: oy + Math.sin(baseA) * nLen,
      colIdx: Math.floor(rng() * needlePalette.length),
      lw: Math.max(0.4, tipCS * 0.04)
    });
  }

  // Batch render — group by colour, draw many lines per beginPath
  ctx.lineCap = 'round';
  ctx.globalAlpha = opacity * 0.7;
  for (let ci = 0; ci < needlePalette.length; ci++) {
    // Group by similar lineWidth (round to 0.5 steps)
    const group = needles.filter(n => n.colIdx === ci);
    if (group.length === 0) continue;

    // Sort by lineWidth and batch in chunks of similar width
    group.sort((a, b) => a.lw - b.lw);
    let batchStart = 0;
    while (batchStart < group.length) {
      const baseLW = group[batchStart].lw;
      let batchEnd = batchStart;
      // Group needles within 0.5px of each other
      while (batchEnd < group.length && group[batchEnd].lw - baseLW < 0.5) batchEnd++;

      ctx.strokeStyle = needlePalette[ci];
      ctx.lineWidth = baseLW + 0.25;
      ctx.beginPath();
      for (let i = batchStart; i < batchEnd; i++) {
        ctx.moveTo(group[i].ox, group[i].oy);
        ctx.lineTo(group[i].ex, group[i].ey);
      }
      ctx.stroke();
      batchStart = batchEnd;
    }
  }

  ctx.globalAlpha = opacity;
}
