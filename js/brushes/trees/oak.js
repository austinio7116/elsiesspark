// Oak tree renderer — classic spreading deciduous tree (optimised)
export default function renderOak(ctx, h) {
  const { rng, opacity, brushSize, leafHsl, hslToRgb,
          leafDensity, branchDensity, seed,
          bezPt, drawTrunk, fractalGrow, seedFromTrunk,
          filterByDensity, filterBranches, renderBranches, makeBark } = h;

  const bark = makeBark(25 / 360, 0.45, 0.28);
  drawTrunk(bark);

  const fg = fractalGrow({
    onTerminal({ sx, sy, mx, my, ex, ey, endW, depth, width }) {
      const baseLSize = Math.max(4, brushSize * (0.5 + rng() * 0.4));
      const out = [{ x: ex, y: ey, size: baseLSize * (1 + rng() * 0.5) }];
      for (const bt of [0.25 + rng() * 0.15, 0.55 + rng() * 0.15]) {
        const mp = bezPt(sx, sy, mx, my, ex, ey, bt);
        const spread = width * 1.5 + baseLSize * 0.4;
        out.push({
          x: mp.x + (rng() - 0.5) * spread,
          y: mp.y + (rng() - 0.5) * spread,
          size: baseLSize * (0.7 + rng() * 0.5)
        });
      }
      if (endW > 1.5 && rng() > 0.3) {
        const et = 0.4 + rng() * 0.4;
        const ep = bezPt(sx, sy, mx, my, ex, ey, et);
        out.push({
          x: ep.x + (rng() - 0.5) * width * 3,
          y: ep.y + (rng() - 0.5) * width * 3,
          size: baseLSize * (0.8 + rng() * 0.4)
        });
      }
      return out;
    }
  });

  seedFromTrunk(fg.grow);
  const branches = filterBranches(fg.branches, branchDensity, seed + 99999);
  renderBranches(branches, bark);
  const foliage = filterByDensity(fg.foliage, leafDensity, seed + 99998);

  // Pre-generate leaf colour palette
  const leafPalette = [];
  for (let i = 0; i < 8; i++) {
    const r = hslToRgb(
      leafHsl[0] + (rng() - 0.5) * 0.07,
      Math.min(1, leafHsl[1] + (rng() - 0.2) * 0.12),
      Math.max(0.22, Math.min(0.7, leafHsl[2] + (rng() - 0.4) * 0.18))
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
      const n = Math.max(1, Math.round((4 + Math.floor(rng() * 5)) * leafDensity));
      for (let k = 0; k < n; k++) {
        const colIdx = Math.floor(rng() * leafPalette.length);
        const a = rng() * Math.PI * 2;
        const d = rng() * lc.size * 0.6;
        const lx = lc.x + Math.cos(a) * d;
        const ly = lc.y + Math.sin(a) * d;
        const ls = lc.size * (0.3 + rng() * 0.4);
        const la = rng() * Math.PI * 2;

        if (colIdx !== ci) continue;
        count++;

        // Compute rotated bezier points directly
        const cos = Math.cos(la), sin = Math.sin(la);
        // Control points for leaf shape: (0,0), (ls*0.3, -ls*0.38), (ls*0.78, -ls*0.22), (ls, 0)
        // then back: (ls*0.78, ls*0.22), (ls*0.3, ls*0.38), (0, 0)
        const c1x = ls * 0.3, c1y = -ls * 0.38;
        const c2x = ls * 0.78, c2y = -ls * 0.22;
        const ex = ls, ey = 0;
        const c3x = ls * 0.78, c3y = ls * 0.22;
        const c4x = ls * 0.3, c4y = ls * 0.38;

        ctx.moveTo(lx, ly);
        ctx.bezierCurveTo(
          lx + c1x * cos - c1y * sin, ly + c1x * sin + c1y * cos,
          lx + c2x * cos - c2y * sin, ly + c2x * sin + c2y * cos,
          lx + ex * cos, ly + ex * sin
        );
        ctx.bezierCurveTo(
          lx + c3x * cos - c3y * sin, ly + c3x * sin + c3y * cos,
          lx + c4x * cos - c4y * sin, ly + c4x * sin + c4y * cos,
          lx, ly
        );
      }
    }
    if (count > 0) ctx.fill();
  }
  ctx.globalAlpha = opacity;
}
