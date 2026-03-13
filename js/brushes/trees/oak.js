// Oak tree renderer — classic spreading deciduous tree
export default function renderOak(ctx, h) {
  const { rng, opacity, brushSize, leafHsl, hslToRgb,
          leafDensity, branchDensity, seed,
          bezPt, drawTrunk, fractalGrow, seedFromTrunk,
          filterByDensity, filterBranches, renderBranches, makeBark } = h;

  const bark = makeBark(25 / 360, 0.45, 0.28);

  // Draw trunk
  drawTrunk(bark);

  // Grow branches
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

  // Filter and render
  const branches = filterBranches(fg.branches, branchDensity, seed + 99999);
  renderBranches(branches, bark);

  const foliage = filterByDensity(fg.foliage, leafDensity, seed + 99998);

  // Leaf helper
  function leaf() {
    const r = hslToRgb(
      leafHsl[0] + (rng() - 0.5) * 0.07,
      Math.min(1, leafHsl[1] + (rng() - 0.2) * 0.12),
      Math.max(0.22, Math.min(0.7, leafHsl[2] + (rng() - 0.4) * 0.18))
    );
    return `rgb(${r[0]},${r[1]},${r[2]})`;
  }

  // Render leaves
  for (const lc of foliage) {
    const n = Math.max(1, Math.round((5 + Math.floor(rng() * 7)) * leafDensity));
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
