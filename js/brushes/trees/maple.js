// Maple tree renderer (optimised)
// V-shaped upright branching, grey bark, 5-pointed star-shaped leaves
export default function renderMaple(ctx, h) {
  const { rng, opacity, brushSize, leafHsl, hslToRgb,
          leafDensity, branchDensity, seed,
          bezPt, drawTrunk, fractalGrow, seedFromTrunk,
          filterByDensity, filterBranches, renderBranches, makeBark } = h;

  const bark = makeBark(30 / 360, 0.15, 0.32);
  drawTrunk(bark);

  const fg = fractalGrow({
    angleModifier(a, depth) {
      const upAngle = -Math.PI / 2;
      const biasStrength = depth < 2 ? 0.3 : 0.15;
      return a * (1 - biasStrength) + upAngle * biasStrength;
    },
    spread: 0.5, spreadRange: 0.25,
    nKidsProb: 0.5,
    lenDecay: 0.65, lenRange: 0.15,
    widthDecay: 0.66, widthRange: 0.08,
    onTerminal({ sx, sy, mx, my, ex, ey, endW, depth, width }) {
      const baseLSize = Math.max(5, brushSize * (0.5 + rng() * 0.4));
      const out = [{ x: ex, y: ey, size: baseLSize * (1.1 + rng() * 0.5) }];
      for (const bt of [0.3 + rng() * 0.15, 0.6 + rng() * 0.15]) {
        const mp = bezPt(sx, sy, mx, my, ex, ey, bt);
        const spread = width * 1.5 + baseLSize * 0.4;
        out.push({
          x: mp.x + (rng() - 0.5) * spread,
          y: mp.y + (rng() - 0.5) * spread,
          size: baseLSize * (0.7 + rng() * 0.5)
        });
      }
      if (endW > 1.5 && rng() > 0.35) {
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

  // Pre-generate colour palette
  const leafPalette = [];
  for (let i = 0; i < 8; i++) {
    const r = hslToRgb(
      leafHsl[0] + (rng() - 0.5) * 0.08,
      Math.min(1, leafHsl[1] + (rng() - 0.2) * 0.15),
      Math.max(0.2, Math.min(0.65, leafHsl[2] + (rng() - 0.4) * 0.2))
    );
    leafPalette.push(`rgb(${r[0]},${r[1]},${r[2]})`);
  }

  // Batch maple leaves by colour — no save/restore, compute star points directly
  ctx.globalAlpha = opacity * 0.85;
  for (let ci = 0; ci < leafPalette.length; ci++) {
    ctx.fillStyle = leafPalette[ci];
    ctx.beginPath();
    let count = 0;

    for (const lc of foliage) {
      const n = Math.max(1, Math.round((3 + Math.floor(rng() * 4)) * leafDensity));
      for (let k = 0; k < n; k++) {
        const colIdx = Math.floor(rng() * leafPalette.length);
        const a = rng() * Math.PI * 2;
        const d = rng() * lc.size * 0.9;
        const lx = lc.x + Math.cos(a) * d;
        const ly = lc.y + Math.sin(a) * d;
        const ls = lc.size * (0.3 + rng() * 0.4);
        const la = rng() * Math.PI * 2;
        // Consume RNG for star point variation (must match regardless of colour)
        const outerRs = [];
        const innerRs = [];
        for (let pi = 0; pi < 5; pi++) {
          outerRs.push(ls * 0.5 * (0.85 + rng() * 0.3));
          innerRs.push(ls * 0.2 * (0.8 + rng() * 0.4));
        }

        if (colIdx !== ci) continue;
        count++;

        // Draw 5-pointed star at (lx, ly) rotated by la
        const cos = Math.cos(la), sin = Math.sin(la);
        for (let pi = 0; pi < 5; pi++) {
          const outerA = (pi / 5) * Math.PI * 2 - Math.PI / 2;
          const innerA = ((pi + 0.5) / 5) * Math.PI * 2 - Math.PI / 2;
          const ox = Math.cos(outerA) * outerRs[pi];
          const oy = Math.sin(outerA) * outerRs[pi];
          const ix = Math.cos(innerA) * innerRs[pi];
          const iy = Math.sin(innerA) * innerRs[pi];
          const rotOx = lx + ox * cos - oy * sin;
          const rotOy = ly + ox * sin + oy * cos;
          const rotIx = lx + ix * cos - iy * sin;
          const rotIy = ly + ix * sin + iy * cos;
          if (pi === 0) ctx.moveTo(rotOx, rotOy);
          else ctx.lineTo(rotOx, rotOy);
          ctx.lineTo(rotIx, rotIy);
        }
        ctx.closePath();
      }
    }
    if (count > 0) ctx.fill();
  }
  ctx.globalAlpha = opacity;
}
