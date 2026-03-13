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

  function leaf() {
    const r = hslToRgb(
      leafHsl[0] + (rng() - 0.3) * 0.06,
      Math.min(1, leafHsl[1] - 0.05 + (rng() - 0.3) * 0.1),
      Math.max(0.3, Math.min(0.65, leafHsl[2] + 0.05 + (rng() - 0.4) * 0.15))
    );
    return `rgb(${r[0]},${r[1]},${r[2]})`;
  }

  // Render curtains
  for (const c of renderCurtains) {
    const p0x = c.x, p0y = c.y;
    const forwardDist = c.len * 0.2;
    const c1x = p0x + c.dx * forwardDist;
    const c1y = Math.min(p0y + c.dy * forwardDist, trunkBaseY);
    const c2x = p0x + c.drift * 0.5 + c.dx * forwardDist * 0.3;
    const c2y = Math.min(p0y + c.len * 0.65, trunkBaseY);
    const p1x = p0x + c.drift;
    const p1y = Math.min(p0y + c.len, trunkBaseY);

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

    // Leaves along curtain
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

      ctx.save();
      ctx.translate(lp.x + perpX, lp.y + perpY);
      ctx.rotate(la);
      ctx.fillStyle = leaf();
      ctx.globalAlpha = opacity * (0.7 + rng() * 0.3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(ls * 0.12, -ls * 0.12, ls * 0.88, -ls * 0.08, ls * 1.3, 0);
      ctx.bezierCurveTo(ls * 0.88, ls * 0.08, ls * 0.12, ls * 0.12, 0, 0);
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha = opacity;
    }
  }

  // Sparse branch-junction leaves
  const foliage = filterByDensity(fg.foliage, leafDensity, seed + 99998);
  for (const lc of foliage) {
    const n = Math.max(1, Math.round(2 * leafDensity));
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
  }
}
