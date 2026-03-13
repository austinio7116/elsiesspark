// Silver Birch tree renderer
// WHITE bark with dark horizontal lenticels/diamond marks, slender trunk,
// delicate drooping branch tips, small triangular/diamond-shaped light green leaves
// WIDE graceful spread — birch branches reach outward broadly
export default function renderBirch(ctx, h) {
  const { rng, opacity, brushSize, leafHsl, hslToRgb,
          trunkEnd, trunkW, trunkBaseY,
          topP, topD, trunkAngle, topW, maxDepth,
          leafDensity, branchDensity, seed,
          ptAt, dirAt, bezPt, drawTapered, drawLimb,
          fractalGrow, seedFromTrunk,
          filterByDensity, filterBranches, makeBark } = h;

  // Silver birch bark — very pale, almost white
  function birchBark(lAdj) {
    const r = hslToRgb(
      40 / 360 + (rng() - 0.5) * 0.02,
      0.05 + rng() * 0.05,
      Math.max(0.7, Math.min(0.95, 0.88 + lAdj + (rng() - 0.5) * 0.04))
    );
    return `rgb(${r[0]},${r[1]},${r[2]})`;
  }

  // Draw trunk — custom for birch (white with lenticels)
  const nSamples = Math.max(12, Math.floor(trunkEnd / 2.5));
  const leftE = [], rightE = [];
  // Birch trunks are slender
  for (let i = 0; i <= nSamples; i++) {
    const t = i / nSamples;
    const d = t * trunkEnd;
    const p = ptAt(d);
    const dr = dirAt(d);
    const nx = -dr.dy, ny = dr.dx;
    const taper = 1 - t * 0.65;
    const hw = trunkW * 0.4 * taper;
    leftE.push({ x: p.x + nx * hw, y: p.y + ny * hw });
    rightE.push({ x: p.x - nx * hw, y: p.y - ny * hw });
  }

  // Fill white trunk
  ctx.beginPath();
  ctx.moveTo(leftE[0].x, leftE[0].y);
  for (let i = 1; i < leftE.length; i++) ctx.lineTo(leftE[i].x, leftE[i].y);
  for (let i = rightE.length - 1; i >= 0; i--) ctx.lineTo(rightE[i].x, rightE[i].y);
  ctx.closePath();
  ctx.fillStyle = birchBark(0);
  ctx.fill();

  // Subtle edge lines
  ctx.lineWidth = Math.max(0.4, trunkW * 0.02);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = birchBark(-0.15);
  ctx.beginPath();
  ctx.moveTo(leftE[0].x, leftE[0].y);
  for (let i = 1; i < leftE.length; i++) ctx.lineTo(leftE[i].x, leftE[i].y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(rightE[0].x, rightE[0].y);
  for (let i = 1; i < rightE.length; i++) ctx.lineTo(rightE[i].x, rightE[i].y);
  ctx.stroke();

  // Lenticels — dark horizontal dash marks
  for (let i = 1; i < nSamples; i++) {
    if (rng() > 0.45) continue;
    const t = i / nSamples;
    const d = t * trunkEnd;
    const p = ptAt(d);
    const dr = dirAt(d);
    const nx = -dr.dy, ny = dr.dx;
    const taper = 1 - t * 0.65;
    const hw = trunkW * 0.4 * taper;
    const nDashes = 1 + Math.floor(rng() * 2);
    for (let di = 0; di < nDashes; di++) {
      const off = (rng() - 0.5) * hw * 1.2;
      const dashW = hw * (0.2 + rng() * 0.4);
      const lentL = 0.12 + rng() * 0.15;
      const lCol = hslToRgb(30 / 360, 0.3 + rng() * 0.2, lentL);
      ctx.strokeStyle = `rgb(${lCol[0]},${lCol[1]},${lCol[2]})`;
      ctx.lineWidth = Math.max(0.4, trunkW * 0.015 + rng() * trunkW * 0.01);
      ctx.globalAlpha = opacity * (0.4 + rng() * 0.3);
      ctx.beginPath();
      ctx.moveTo(p.x + nx * (off - dashW * 0.5), p.y + ny * (off - dashW * 0.5));
      ctx.lineTo(p.x + nx * (off + dashW * 0.5), p.y + ny * (off + dashW * 0.5));
      ctx.stroke();
    }
  }

  // Diamond/V marks at base
  for (let i = 0; i < Math.floor(nSamples * 0.3); i++) {
    if (rng() > 0.35) continue;
    const t = (i + rng() * 0.5) / nSamples;
    const d = t * trunkEnd;
    const p = ptAt(d);
    const dr = dirAt(d);
    const nx = -dr.dy, ny = dr.dx;
    const taper = 1 - t * 0.65;
    const hw = trunkW * 0.4 * taper;
    const off = (rng() - 0.5) * hw * 0.8;
    const diamondSize = hw * (0.15 + rng() * 0.15);
    const dCol = hslToRgb(25 / 360, 0.3, 0.15 + rng() * 0.1);
    ctx.fillStyle = `rgb(${dCol[0]},${dCol[1]},${dCol[2]})`;
    ctx.globalAlpha = opacity * (0.3 + rng() * 0.25);
    ctx.beginPath();
    const cx = p.x + nx * off, cy = p.y + ny * off;
    ctx.moveTo(cx, cy - diamondSize);
    ctx.lineTo(cx + diamondSize * 0.6, cy);
    ctx.lineTo(cx, cy + diamondSize);
    ctx.lineTo(cx - diamondSize * 0.6, cy);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = opacity;

  // Branches — birch has wide graceful spread with delicate drooping tips
  const fg = fractalGrow({
    // WIDER spread for broader canopy
    spread: 0.5, spreadRange: 0.3,
    nKidsProb: 0.5,
    // LONGER branches — less decay so branches reach further
    lenDecay: 0.68, lenRange: 0.15,
    widthDecay: 0.65, widthRange: 0.08,
    // Slight droop at finer branches
    angleModifier(a, depth) {
      if (depth >= 3) {
        return a + 0.12; // slight downward bias at tips
      }
      return a;
    },
    onTerminal({ sx, sy, mx, my, ex, ey, endW, depth, width }) {
      const baseLSize = Math.max(3, brushSize * (0.3 + rng() * 0.25));
      const out = [{ x: ex, y: ey, size: baseLSize * (0.8 + rng() * 0.4) }];
      for (const bt of [0.25 + rng() * 0.15, 0.5 + rng() * 0.15, 0.75 + rng() * 0.1]) {
        const mp = bezPt(sx, sy, mx, my, ex, ey, bt);
        const spread = width * 1.5 + baseLSize * 0.4;
        out.push({
          x: mp.x + (rng() - 0.5) * spread,
          y: mp.y + (rng() - 0.5) * spread,
          size: baseLSize * (0.5 + rng() * 0.4)
        });
      }
      return out;
    }
  });

  // Seed with wider side branches starting earlier
  seedFromTrunk(fg.grow, { sideStart: 0.15, sideEnd: 0.92, sideStep: 0.07, sideStepRange: 0.05 });

  // Filter and render branches
  const filteredBranches = filterBranches(fg.branches, branchDensity, seed + 99999);

  filteredBranches.sort((a, b) => a.depth - b.depth);
  for (const br of filteredBranches) {
    if (br.depth < 2 && br.w0 > 1.5) {
      drawLimb(br.sx, br.sy, br.mx, br.my, br.ex, br.ey, br.w0, br.w1, birchBark);
    } else {
      const darkBark = hslToRgb(
        30 / 360 + (rng() - 0.5) * 0.02,
        0.2 + rng() * 0.1,
        0.3 + rng() * 0.15
      );
      const col = `rgb(${darkBark[0]},${darkBark[1]},${darkBark[2]})`;
      drawTapered(br.sx, br.sy, br.mx, br.my, br.ex, br.ey, br.w0, br.w1, col);
    }
  }

  const foliage = filterByDensity(fg.foliage, leafDensity, seed + 99998);

  // Pre-generate leaf colour palette
  const leafPalette = [];
  for (let i = 0; i < 8; i++) {
    const r = hslToRgb(
      leafHsl[0] + (rng() - 0.5) * 0.06,
      Math.min(1, leafHsl[1] + (rng() - 0.2) * 0.12),
      Math.max(0.3, Math.min(0.65, leafHsl[2] + 0.05 + (rng() - 0.4) * 0.15))
    );
    leafPalette.push(`rgb(${r[0]},${r[1]},${r[2]})`);
  }

  // Batch leaves by colour — compute rotated points directly, no save/restore
  for (let ci = 0; ci < leafPalette.length; ci++) {
    ctx.fillStyle = leafPalette[ci];
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    let count = 0;

    for (const lc of foliage) {
      const n = Math.max(1, Math.round((5 + Math.floor(rng() * 6)) * leafDensity));
      for (let k = 0; k < n; k++) {
        const colIdx = Math.floor(rng() * leafPalette.length);
        const a = rng() * Math.PI * 2;
        const d = rng() * lc.size * 0.5;
        const lx = lc.x + Math.cos(a) * d;
        const ly = lc.y + Math.sin(a) * d;
        const ls = lc.size * (0.2 + rng() * 0.3);
        const la = rng() * Math.PI * 2;
        // Consume alpha RNG to maintain determinism
        rng();

        if (colIdx !== ci) continue;
        count++;

        // Compute rotated bezier points directly
        const cos = Math.cos(la), sin = Math.sin(la);
        // Birch leaf shape control points (triangular/diamond)
        // Original: moveTo(0, -ls*0.05), bezier to (ls*0.45, -ls*0.15),
        //           bezier to (ls*0.55, 0), bezier back to (0, ls*0.05)
        const p0x = 0, p0y = -ls * 0.05;
        const c1x = ls * 0.15, c1y = -ls * 0.35;
        const c2x = ls * 0.35, c2y = -ls * 0.45;
        const e1x = ls * 0.45, e1y = -ls * 0.15;
        const c3x = ls * 0.5, c3y = 0;
        const c4x = ls * 0.48, c4y = ls * 0.1;
        const e2x = ls * 0.55, e2y = 0;
        const c5x = ls * 0.35, c5y = ls * 0.45;
        const c6x = ls * 0.15, c6y = ls * 0.35;
        const e3x = 0, e3y = ls * 0.05;

        ctx.moveTo(
          lx + p0x * cos - p0y * sin,
          ly + p0x * sin + p0y * cos
        );
        ctx.bezierCurveTo(
          lx + c1x * cos - c1y * sin, ly + c1x * sin + c1y * cos,
          lx + c2x * cos - c2y * sin, ly + c2x * sin + c2y * cos,
          lx + e1x * cos - e1y * sin, ly + e1x * sin + e1y * cos
        );
        ctx.bezierCurveTo(
          lx + c3x * cos - c3y * sin, ly + c3x * sin + c3y * cos,
          lx + c4x * cos - c4y * sin, ly + c4x * sin + c4y * cos,
          lx + e2x * cos - e2y * sin, ly + e2x * sin + e2y * cos
        );
        ctx.bezierCurveTo(
          lx + c5x * cos - c5y * sin, ly + c5x * sin + c5y * cos,
          lx + c6x * cos - c6y * sin, ly + c6x * sin + c6y * cos,
          lx + e3x * cos - e3y * sin, ly + e3x * sin + e3y * cos
        );
      }
    }
    if (count > 0) ctx.fill();
  }
  ctx.globalAlpha = opacity;
}
