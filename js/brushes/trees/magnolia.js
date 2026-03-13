// Magnolia tree renderer — upward-pointing blossoms with folding petals
export default function renderMagnolia(ctx, h) {
  const { rng, opacity, brushSize, leafHsl, hslToRgb,
          leafDensity, branchDensity, seed,
          bezPt, drawTrunk, fractalGrow, seedFromTrunk,
          filterByDensity, filterBranches, renderBranches, makeBark } = h;

  const bark = makeBark(25 / 360, 0.45, 0.28);
  drawTrunk(bark);

  const flowers = [];

  const fg = fractalGrow({
    angleModifier(a, depth) {
      const upAngle = -Math.PI / 2;
      const biasStrength = depth < 2 ? 0.4 : 0.25;
      return a * (1 - biasStrength) + upAngle * biasStrength;
    },
    spread: 0.3, spreadRange: 0.2,
    onTerminal({ sx, sy, mx, my, ex, ey, endW, depth, width }) {
      const baseLSize = Math.max(5, brushSize * (0.6 + rng() * 0.5));
      const out = [{ x: ex, y: ey, size: baseLSize * (1.2 + rng() * 0.5) }];
      for (const bt of [0.3 + rng() * 0.15, 0.6 + rng() * 0.15]) {
        const mp = bezPt(sx, sy, mx, my, ex, ey, bt);
        const spread = width * 1.2 + baseLSize * 0.3;
        out.push({
          x: mp.x + (rng() - 0.5) * spread,
          y: mp.y + (rng() - 0.5) * spread,
          size: baseLSize * (0.8 + rng() * 0.6)
        });
      }
      // Flower at some branch tips
      if (rng() > 0.65) {
        const flowerSize = Math.max(7, brushSize * (0.85 + rng() * 0.7));
        const openness = rng();
        flowers.push({
          x: ex + (rng() - 0.5) * endW * 2,
          y: ey + (rng() - 0.5) * endW * 2,
          size: flowerSize,
          open: openness
        });
      }
      return out;
    }
  });

  seedFromTrunk(fg.grow);

  const branches = filterBranches(fg.branches, branchDensity, seed + 99999);
  renderBranches(branches, bark);

  const foliage = filterByDensity(fg.foliage, leafDensity, seed + 99998);

  // Filter flowers by leaf density
  let renderFlowers = flowers;
  if (leafDensity < 1) {
    const fRng = h.createRng(seed + 88888);
    renderFlowers = flowers.filter(() => fRng() < (0.3 + leafDensity * 0.7));
  } else if (leafDensity > 1) {
    const fRng = h.createRng(seed + 88888);
    renderFlowers = [];
    for (const f of flowers) {
      renderFlowers.push(f);
      if (fRng() < (leafDensity - 1) * 0.4) {
        renderFlowers.push({
          ...f,
          x: f.x + (fRng() - 0.5) * f.size * 2,
          y: f.y + (fRng() - 0.5) * f.size * 2,
          size: f.size * (0.7 + fRng() * 0.4)
        });
      }
    }
  }

  // Leaf helper — darker, glossier
  function leaf() {
    const r = hslToRgb(
      leafHsl[0] + (rng() - 0.5) * 0.04,
      Math.min(1, leafHsl[1] + 0.05 + (rng() - 0.3) * 0.1),
      Math.max(0.18, Math.min(0.45, leafHsl[2] - 0.05 + (rng() - 0.5) * 0.12))
    );
    return `rgb(${r[0]},${r[1]},${r[2]})`;
  }

  // Render leaves — large, glossy, elliptical
  for (const lc of foliage) {
    const n = Math.max(1, Math.round((3 + Math.floor(rng() * 4)) * leafDensity));
    for (let k = 0; k < n; k++) {
      const a = rng() * Math.PI * 2;
      const d = rng() * lc.size * 0.5;
      const lx = lc.x + Math.cos(a) * d;
      const ly = lc.y + Math.sin(a) * d;
      const ls = lc.size * (0.4 + rng() * 0.4);
      const la = rng() * Math.PI * 2;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(la);
      ctx.fillStyle = leaf();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(ls * 0.25, -ls * 0.42, ls * 0.75, -ls * 0.42, ls, 0);
      ctx.bezierCurveTo(ls * 0.75, ls * 0.42, ls * 0.25, ls * 0.42, 0, 0);
      ctx.fill();
      ctx.globalAlpha = opacity * 0.15;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(ls * 0.45, -ls * 0.08, ls * 0.2, ls * 0.08, la * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = opacity * 0.3;
      ctx.strokeStyle = leaf();
      ctx.lineWidth = Math.max(0.3, ls * 0.03);
      ctx.beginPath();
      ctx.moveTo(ls * 0.05, 0);
      ctx.lineTo(ls * 0.9, 0);
      ctx.stroke();
      ctx.restore();
      ctx.globalAlpha = opacity;
    }
  }

  // Draw petal helper
  function drawMagnoliaPetal(px, py, baseAngle, ps, layer, foldAmt) {
    const flowerPink = 0.2 + rng() * 0.6;
    const pinkAmt = layer === 'inner' ? flowerPink * 1.2 : flowerPink;
    const baseH = (340 + rng() * 15) / 360;
    const baseS = 0.15 + Math.min(1, pinkAmt) * 0.45;
    const baseL = 0.75 + (1 - Math.min(1, pinkAmt)) * 0.18;
    const bCol = hslToRgb(baseH, baseS, Math.min(0.97, baseL));
    const tipS = 0.02 + Math.min(1, pinkAmt) * 0.08;
    const tipL = 0.93 + (1 - Math.min(1, pinkAmt)) * 0.05;
    const tCol = hslToRgb(baseH, tipS, Math.min(0.99, tipL));

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(baseAngle);

    if (foldAmt < 0.15) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-ps * 0.16, -ps * 0.28, -ps * 0.22, -ps * 0.65, -ps * 0.1, -ps * 0.88);
      ctx.bezierCurveTo(-ps * 0.03, -ps * 0.97, ps * 0.03, -ps * 0.97, ps * 0.1, -ps * 0.88);
      ctx.bezierCurveTo(ps * 0.22, -ps * 0.65, ps * 0.16, -ps * 0.28, 0, 0);
      ctx.fillStyle = `rgb(${bCol[0]},${bCol[1]},${bCol[2]})`;
      ctx.globalAlpha = opacity * (0.85 + rng() * 0.15);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-ps * 0.12, -ps * 0.5);
      ctx.bezierCurveTo(-ps * 0.18, -ps * 0.7, -ps * 0.08, -ps * 0.94, 0, -ps * 0.96);
      ctx.bezierCurveTo(ps * 0.08, -ps * 0.94, ps * 0.18, -ps * 0.7, ps * 0.12, -ps * 0.5);
      ctx.bezierCurveTo(ps * 0.05, -ps * 0.6, -ps * 0.05, -ps * 0.6, -ps * 0.12, -ps * 0.5);
      ctx.fillStyle = `rgb(${tCol[0]},${tCol[1]},${tCol[2]})`;
      ctx.globalAlpha = opacity * 0.5;
      ctx.fill();
    } else {
      const bendY = -ps * 0.48;
      const halfW = ps * 0.14;
      const foldDx = Math.sin(0) * ps * 0.6 * foldAmt;
      const foldDy = -ps * 0.42 * (1 - foldAmt * 0.5);
      const tipX = foldDx;
      const tipY = bendY + foldDy;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-ps * 0.14, -ps * 0.15, -halfW, -ps * 0.35, -halfW, bendY);
      ctx.lineTo(halfW, bendY);
      ctx.bezierCurveTo(halfW, -ps * 0.35, ps * 0.14, -ps * 0.15, 0, 0);
      ctx.fillStyle = `rgb(${bCol[0]},${bCol[1]},${bCol[2]})`;
      ctx.globalAlpha = opacity * (0.85 + rng() * 0.15);
      ctx.fill();
      const upperW = ps * 0.12;
      ctx.beginPath();
      ctx.moveTo(-halfW, bendY);
      ctx.bezierCurveTo(-halfW + foldDx * 0.3, bendY + foldDy * 0.3, tipX - upperW * 1.5, tipY + ps * 0.04, tipX, tipY);
      ctx.bezierCurveTo(tipX + upperW * 1.5, tipY + ps * 0.04, halfW + foldDx * 0.3, bendY + foldDy * 0.3, halfW, bendY);
      ctx.fillStyle = `rgb(${tCol[0]},${tCol[1]},${tCol[2]})`;
      ctx.globalAlpha = opacity * (0.8 + rng() * 0.15);
      ctx.fill();
    }

    ctx.globalAlpha = opacity * 0.08;
    ctx.strokeStyle = `rgb(${bCol[0]},${bCol[1]},${bCol[2]})`;
    ctx.lineWidth = Math.max(0.3, ps * 0.015);
    ctx.beginPath();
    ctx.moveTo(0, -ps * 0.05);
    ctx.lineTo(0, -ps * 0.45);
    ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = opacity;
  }

  // Render flowers
  for (const fl of renderFlowers) {
    const fs = fl.size;
    const nPetals = 6 + Math.floor(rng() * 3);
    const baseX = fl.x;
    const baseY = fl.y;
    const openAmt = fl.open;

    // Stamens behind petals — only visible on open flowers
    if (openAmt > 0.4) {
      const showAlpha = Math.min(1, (openAmt - 0.4) * 2.5);
      const nStamens = 5 + Math.floor(rng() * 5);
      for (let si = 0; si < nStamens; si++) {
        const stamenX = baseX + (rng() - 0.5) * fs * 0.12;
        const stamenH = fs * (0.45 + rng() * 0.3);
        const lean = (rng() - 0.5) * fs * 0.08;
        ctx.strokeStyle = `rgb(${160 + Math.floor(rng() * 40)},${170 + Math.floor(rng() * 40)},${100 + Math.floor(rng() * 40)})`;
        ctx.lineWidth = Math.max(0.4, fs * 0.015);
        ctx.globalAlpha = opacity * 0.6 * showAlpha;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(stamenX, baseY);
        ctx.lineTo(stamenX + lean, baseY - stamenH);
        ctx.stroke();
        ctx.fillStyle = `rgb(${180 + Math.floor(rng() * 60)},${150 + Math.floor(rng() * 50)},${30 + Math.floor(rng() * 50)})`;
        ctx.globalAlpha = opacity * 0.75 * showAlpha;
        ctx.beginPath();
        ctx.ellipse(stamenX + lean, baseY - stamenH, fs * 0.02, fs * 0.035, rng() * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = opacity;
    }

    // Outer petals
    const outerCount = Math.ceil(nPetals * 0.55);
    const outerSplay = 0.4 + openAmt * 1.2;
    for (let k = 0; k < outerCount; k++) {
      const splayAngle = ((k / outerCount) - 0.5) * outerSplay + (rng() - 0.5) * 0.12;
      const ps = fs * (0.65 + rng() * 0.2);
      const offsetX = Math.sin(splayAngle) * fs * 0.05;
      const offsetY = Math.abs(splayAngle) * fs * 0.03;
      const foldAmt = openAmt * (0.6 + rng() * 0.4);
      drawMagnoliaPetal(baseX + offsetX, baseY + offsetY, splayAngle, ps, 'outer', foldAmt);
    }

    // Inner petals
    const innerCount = nPetals - outerCount;
    const innerSplay = 0.25 + openAmt * 0.3;
    for (let k = 0; k < innerCount; k++) {
      const splayAngle = ((k / innerCount) - 0.5) * innerSplay + (rng() - 0.5) * 0.1;
      const ps = fs * (0.45 + rng() * 0.15);
      const offsetX = Math.sin(splayAngle) * fs * 0.02;
      const foldAmt = openAmt * (0.1 + rng() * 0.2);
      drawMagnoliaPetal(baseX + offsetX, baseY, splayAngle, ps, 'inner', foldAmt);
    }

    ctx.globalAlpha = opacity;
  }
}
