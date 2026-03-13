// Pine / Evergreen tree renderer
// Conical silhouette. Many branches per tier radiating at varied angles
// (sideways, forward, back). Each branch is densely covered in needle
// clusters — small starbursts of thin lines, NO filled shapes/blobs.
// Sub-branches sprout along main branches. The effect is a thick,
// textured, triangular tree made entirely of needles.
export default function renderPine(ctx, h) {
  const { rng, opacity, brushSize, leafHsl, hslToRgb,
          leafDensity, branchDensity, seed,
          trunkEnd, trunkW,
          topP, trunkAngle,
          ptAt, dirAt, bezPt,
          drawTapered, makeBark } = h;

  const bark = makeBark(25 / 360, 0.25, 0.2);

  function needleCol() {
    const r = hslToRgb(
      leafHsl[0] + (rng() - 0.5) * 0.04,
      Math.min(1, leafHsl[1] + 0.08 + rng() * 0.08),
      Math.max(0.14, Math.min(0.4, leafHsl[2] - 0.06 + (rng() - 0.5) * 0.1))
    );
    return `rgb(${r[0]},${r[1]},${r[2]})`;
  }

  // Thin central trunk (mostly hidden)
  const nSamples = Math.max(10, Math.floor(trunkEnd / 3));
  const leftE = [], rightE = [];
  for (let i = 0; i <= nSamples; i++) {
    const t = i / nSamples;
    const d = t * trunkEnd;
    const p = ptAt(d);
    const dr = dirAt(d);
    const nx = -dr.dy, ny = dr.dx;
    const taper = 1 - t * 0.5;
    const hw = trunkW * 0.2 * taper;
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

  // Build branches — many per tier, at varied angles
  const tiers = Math.max(6, Math.min(16, Math.floor(trunkEnd / 10)));
  const maxCanopyWidth = trunkEnd * (0.38 + rng() * 0.12);
  const allBranches = [];

  for (let tier = 0; tier < tiers; tier++) {
    const tierFrac = 0.08 + (tier / tiers) * 0.88;
    const d = tierFrac * trunkEnd;
    const p = ptAt(d);
    const dr = dirAt(d);
    const perpX = -dr.dy, perpY = dr.dx;

    // Conical width at this height
    const conicalFrac = 1 - tierFrac;
    const tierWidth = maxCanopyWidth * conicalFrac * (0.85 + rng() * 0.3);
    if (tierWidth < 2) continue;

    // 4-6 branches per tier, radiating at many angles
    const nBranches = 4 + Math.floor(rng() * 3);
    for (let bi = 0; bi < nBranches; bi++) {
      // Distribute angles around the trunk: sideways, angled forward/back
      // Use full spread around the trunk direction
      const spreadAngle = ((bi / nBranches) - 0.5) * Math.PI * 1.6 + (rng() - 0.5) * 0.4;
      // Mix of perpendicular (sideways) and trunk-parallel (forward/back) components
      const outX = perpX * Math.cos(spreadAngle) + dr.dx * Math.sin(spreadAngle) * 0.5;
      const outY = perpY * Math.cos(spreadAngle) + dr.dy * Math.sin(spreadAngle) * 0.5;
      const outLen = Math.hypot(outX, outY) || 1;
      const normX = outX / outLen, normY = outY / outLen;

      const hw = trunkW * 0.2 * (1 - tierFrac * 0.5);
      const bx = p.x + normX * hw;
      const by = p.y + normY * hw;

      // Branch angle: outward with slight droop
      const outAngle = Math.atan2(normY, normX) + 0.08 + rng() * 0.12;
      const bLen = tierWidth * (0.6 + rng() * 0.4);
      const bW = Math.max(0.8, trunkW * 0.07 * (1 - tierFrac * 0.4) * (0.6 + rng() * 0.4));

      // For branches angled toward/away from viewer, foreshorten the visual length
      const depthFactor = Math.abs(Math.cos(spreadAngle));
      const visualLen = bLen * (0.4 + depthFactor * 0.6);

      const midA = outAngle + (rng() - 0.5) * 0.15;
      const mx = bx + Math.cos(midA) * visualLen * 0.5;
      const my = by + Math.sin(midA) * visualLen * 0.5;
      const ex = bx + Math.cos(outAngle) * visualLen;
      const ey = by + Math.sin(outAngle) * visualLen;

      // Needle cluster size along this branch
      const clusterSize = Math.max(3, brushSize * (0.25 + conicalFrac * 0.35) * (0.6 + rng() * 0.4));

      allBranches.push({
        sx: bx, sy: by, mx, my, ex, ey,
        w0: bW, w1: bW * 0.25,
        tierFrac, clusterSize,
        branchLen: visualLen,
        depth: 1
      });

      // Sub-branches along this branch
      const nSubs = 2 + Math.floor(rng() * 3);
      for (let si = 0; si < nSubs; si++) {
        const sf = 0.25 + (si / nSubs) * 0.55;
        const sp = bezPt(bx, by, mx, my, ex, ey, sf);
        const subSide = (si % 2 === 0) ? 1 : -1;
        const subAngle = outAngle + subSide * (0.25 + rng() * 0.4) + 0.05;
        const subLen = visualLen * (0.3 + rng() * 0.25) * (1 - sf * 0.3);
        const subW = bW * 0.4 * (1 - sf * 0.3);
        const smx = sp.x + Math.cos(subAngle) * subLen * 0.5;
        const smy = sp.y + Math.sin(subAngle) * subLen * 0.5;
        const sex = sp.x + Math.cos(subAngle) * subLen;
        const sey = sp.y + Math.sin(subAngle) * subLen;

        allBranches.push({
          sx: sp.x, sy: sp.y, mx: smx, my: smy, ex: sex, ey: sey,
          w0: Math.max(0.4, subW), w1: Math.max(0.2, subW * 0.25),
          tierFrac, clusterSize: clusterSize * (0.6 + rng() * 0.3),
          branchLen: subLen,
          depth: 2
        });
      }
    }
  }

  // Filter by branch density
  const bRng = h.createRng(seed + 99999);
  let renderBr = allBranches;
  if (branchDensity < 1) {
    renderBr = allBranches.filter(br => br.depth <= 1 || bRng() < (0.3 + branchDensity * 0.7));
  } else if (branchDensity > 1) {
    renderBr = [];
    for (const br of allBranches) {
      renderBr.push(br);
      if (br.depth >= 2 && bRng() < (branchDensity - 1) * 0.4) {
        const off = (bRng() - 0.5) * br.w0 * 2;
        renderBr.push({ ...br, sx: br.sx+off, sy: br.sy+off, mx: br.mx+off, my: br.my+off, ex: br.ex+off, ey: br.ey+off, w0: br.w0*0.7, w1: br.w1*0.7 });
      }
    }
  }

  // Render from top to bottom (back to front)
  renderBr.sort((a, b) => a.tierFrac - b.tierFrac);

  for (const br of renderBr) {
    // Draw the branch wood
    const col = bark(0.02 + (rng() - 0.5) * 0.04);
    drawTapered(br.sx, br.sy, br.mx, br.my, br.ex, br.ey, br.w0, br.w1, col);

    // Dense needle clusters along the branch — NO blobs, only needle lines
    const steps = Math.max(4, Math.ceil(br.branchLen / 6));
    const cs = br.clusterSize;

    for (let si = 0; si <= steps; si++) {
      const t = si / steps;
      const p = bezPt(br.sx, br.sy, br.mx, br.my, br.ex, br.ey, t);
      const localCS = cs * (1 - t * 0.25);

      // Each cluster point: a starburst of needles
      const nNeedles = Math.max(6, Math.round((10 + Math.floor(rng() * 8)) * leafDensity));
      for (let ni = 0; ni < nNeedles; ni++) {
        // Scatter the needle origin slightly around the branch point
        const ox = p.x + (rng() - 0.5) * localCS * 0.6;
        const oy = p.y + (rng() - 0.5) * localCS * 0.6;
        const na = rng() * Math.PI * 2;
        const needleLen = localCS * (0.3 + rng() * 0.4);

        ctx.strokeStyle = needleCol();
        ctx.lineWidth = Math.max(0.4, localCS * 0.035 + rng() * 0.3);
        ctx.globalAlpha = opacity * (0.55 + rng() * 0.4);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ox + Math.cos(na) * needleLen, oy + Math.sin(na) * needleLen);
        ctx.stroke();
      }
    }

    // Extra needle clusters at branch tip
    const tipNeedles = Math.max(4, Math.round((8 + Math.floor(rng() * 6)) * leafDensity));
    for (let ni = 0; ni < tipNeedles; ni++) {
      const ox = br.ex + (rng() - 0.5) * cs * 0.5;
      const oy = br.ey + (rng() - 0.5) * cs * 0.5;
      const na = rng() * Math.PI * 2;
      const needleLen = cs * (0.35 + rng() * 0.35);
      ctx.strokeStyle = needleCol();
      ctx.lineWidth = Math.max(0.4, cs * 0.035 + rng() * 0.3);
      ctx.globalAlpha = opacity * (0.55 + rng() * 0.4);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + Math.cos(na) * needleLen, oy + Math.sin(na) * needleLen);
      ctx.stroke();
    }
  }

  ctx.globalAlpha = opacity;

  // Pointed tip — needle tuft
  const tipP = ptAt(trunkEnd);
  const tipDir = dirAt(trunkEnd);
  const tipCS = Math.max(4, brushSize * 0.35);
  const tipNeedles = Math.max(8, Math.round(15 * leafDensity));
  for (let ni = 0; ni < tipNeedles; ni++) {
    const ox = tipP.x + (rng() - 0.5) * tipCS * 0.3;
    const oy = tipP.y + (rng() - 0.5) * tipCS * 0.3;
    // Bias needles upward/outward along trunk direction
    const baseA = trunkAngle + (rng() - 0.5) * 1.2;
    const needleLen = tipCS * (0.4 + rng() * 0.4);
    ctx.strokeStyle = needleCol();
    ctx.lineWidth = Math.max(0.4, tipCS * 0.04);
    ctx.globalAlpha = opacity * (0.6 + rng() * 0.35);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + Math.cos(baseA) * needleLen, oy + Math.sin(baseA) * needleLen);
    ctx.stroke();
  }

  ctx.globalAlpha = opacity;
}
