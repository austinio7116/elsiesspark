// Maple tree renderer
// V-shaped upright branching pattern, grey bark, distinctive 5-pointed
// star-shaped leaves with brilliant colour variation
export default function renderMaple(ctx, h) {
  const { rng, opacity, brushSize, leafHsl, hslToRgb,
          leafDensity, branchDensity, seed,
          bezPt, drawTrunk, fractalGrow, seedFromTrunk,
          filterByDensity, filterBranches, renderBranches, makeBark } = h;

  // Grey bark
  const bark = makeBark(30 / 360, 0.15, 0.32);
  drawTrunk(bark);

  const fg = fractalGrow({
    // V-shaped upright growth — branches angle upward more
    angleModifier(a, depth) {
      const upAngle = -Math.PI / 2;
      const biasStrength = depth < 2 ? 0.3 : 0.15;
      return a * (1 - biasStrength) + upAngle * biasStrength;
    },
    spread: 0.38, spreadRange: 0.2,
    nKidsProb: 0.5,
    lenDecay: 0.6, lenRange: 0.15,
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

  // Maple leaf colour — support full colour variation
  function leaf() {
    const r = hslToRgb(
      leafHsl[0] + (rng() - 0.5) * 0.08,
      Math.min(1, leafHsl[1] + (rng() - 0.2) * 0.15),
      Math.max(0.2, Math.min(0.65, leafHsl[2] + (rng() - 0.4) * 0.2))
    );
    return `rgb(${r[0]},${r[1]},${r[2]})`;
  }

  // Render maple leaves — distinctive 5-pointed star shape
  for (const lc of foliage) {
    const n = Math.max(1, Math.round((4 + Math.floor(rng() * 5)) * leafDensity));
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
      ctx.globalAlpha = opacity * (0.8 + rng() * 0.2);

      // 5-pointed maple leaf shape
      ctx.beginPath();
      const r0 = ls * 0.5; // outer radius
      const ri = ls * 0.2; // inner radius
      for (let pi = 0; pi < 5; pi++) {
        const outerA = (pi / 5) * Math.PI * 2 - Math.PI / 2;
        const innerA = ((pi + 0.5) / 5) * Math.PI * 2 - Math.PI / 2;
        // Outer point (with slight variation for organic look)
        const outerR = r0 * (0.85 + rng() * 0.3);
        if (pi === 0) {
          ctx.moveTo(Math.cos(outerA) * outerR, Math.sin(outerA) * outerR);
        } else {
          ctx.lineTo(Math.cos(outerA) * outerR, Math.sin(outerA) * outerR);
        }
        // Inner notch
        const innerR = ri * (0.8 + rng() * 0.4);
        ctx.lineTo(Math.cos(innerA) * innerR, Math.sin(innerA) * innerR);
      }
      ctx.closePath();
      ctx.fill();

      // Leaf veins — lines from centre to each point
      ctx.strokeStyle = leaf();
      ctx.lineWidth = Math.max(0.2, ls * 0.03);
      ctx.globalAlpha = opacity * 0.25;
      for (let pi = 0; pi < 5; pi++) {
        const outerA = (pi / 5) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(outerA) * r0 * 0.7, Math.sin(outerA) * r0 * 0.7);
        ctx.stroke();
      }

      // Petiole (small stem)
      ctx.strokeStyle = leaf();
      ctx.lineWidth = Math.max(0.3, ls * 0.04);
      ctx.globalAlpha = opacity * 0.4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, ls * 0.35);
      ctx.stroke();

      ctx.restore();
      ctx.globalAlpha = opacity;
    }
  }
}
