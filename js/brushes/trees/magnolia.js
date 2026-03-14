// Magnolia tree renderer — upward-pointing blossoms with gradient petals
export default function renderMagnolia(ctx, h) {
  const { rng, opacity, brushSize, leafHsl, hslToRgb,
          leafDensity, branchDensity, seed,
          bezPt, drawTrunk, fractalGrow, seedFromTrunk,
          filterByDensity, filterBranches, renderBranches, makeBark } = h;

  const bark = makeBark(25 / 360, 0.45, 0.28);
  drawTrunk(bark);

  const blossoms = [];  // mixed flowers & buds in branch order

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
      // Branch tip angle — buds point along the branch
      const branchAngle = Math.atan2(ey - sy, ex - sx);
      // Flower or bud at some branch tips (same overall count as before)
      if (rng() > 0.65) {
        const flowerSize = Math.max(7, brushSize * (0.85 + rng() * 0.7));
        const openness = rng();
        const bx = ex + (rng() - 0.5) * endW * 2;
        const by = ey + (rng() - 0.5) * endW * 2;
        // ~25% of would-be flowers become buds instead
        if (openness < 0.25) {
          blossoms.push({
            type: 'bud',
            x: bx, y: by,
            size: flowerSize * 0.85,
            angle: branchAngle + (rng() - 0.5) * 0.3
          });
        } else {
          blossoms.push({
            type: 'flower',
            x: bx, y: by,
            size: flowerSize,
            open: openness
          });
          rng(); // consume bud angle rng for determinism
        }
      } else {
        // Consume same rng() calls for determinism
        rng(); rng(); rng(); rng(); rng();
      }
      return out;
    }
  });

  seedFromTrunk(fg.grow);

  const branches = filterBranches(fg.branches, branchDensity, seed + 99999);
  renderBranches(branches, bark);

  const foliage = filterByDensity(fg.foliage, leafDensity, seed + 99998);

  // Filter blossoms by leaf density (flowers & buds together, preserving order)
  let renderBlossoms = blossoms;
  if (leafDensity < 1) {
    const fRng = h.createRng(seed + 88888);
    renderBlossoms = blossoms.filter(() => fRng() < (0.3 + leafDensity * 0.7));
  } else if (leafDensity > 1) {
    const fRng = h.createRng(seed + 88888);
    renderBlossoms = [];
    for (const b of blossoms) {
      renderBlossoms.push(b);
      const threshold = b.type === 'bud' ? (leafDensity - 1) * 0.3 : (leafDensity - 1) * 0.4;
      const spreadFactor = b.type === 'bud' ? 1.5 : 2;
      const sizeRange = b.type === 'bud' ? 0.3 : 0.4;
      if (fRng() < threshold) {
        renderBlossoms.push({
          ...b,
          x: b.x + (fRng() - 0.5) * b.size * spreadFactor,
          y: b.y + (fRng() - 0.5) * b.size * spreadFactor,
          size: b.size * (0.7 + fRng() * sizeRange)
        });
      }
    }
  }

  // Pre-generate leaf colour palette (8 colours)
  const LEAF_PAL_SIZE = 8;
  const leafPalette = [];
  for (let i = 0; i < LEAF_PAL_SIZE; i++) {
    const hVar = (i / LEAF_PAL_SIZE - 0.5) * 0.04;
    const sVar = 0.05 + ((i % 3) - 1) * 0.05;
    const lVar = -0.05 + ((i % 5) / 4 - 0.5) * 0.12;
    const r = hslToRgb(
      leafHsl[0] + hVar,
      Math.min(1, leafHsl[1] + sVar),
      Math.max(0.18, Math.min(0.45, leafHsl[2] + lVar))
    );
    leafPalette.push(`rgb(${r[0]},${r[1]},${r[2]})`);
  }

  // Collect all leaf data, consuming rng() in same order as original
  const leafData = [];
  for (const lc of foliage) {
    const n = Math.max(1, Math.round((3 + Math.floor(rng() * 4)) * leafDensity));
    for (let k = 0; k < n; k++) {
      const a = rng() * Math.PI * 2;
      const d = rng() * lc.size * 0.5;
      const lx = lc.x + Math.cos(a) * d;
      const ly = lc.y + Math.sin(a) * d;
      const ls = lc.size * (0.4 + rng() * 0.4);
      const la = rng() * Math.PI * 2;
      // Consume rng() calls matching original: first leaf() = 3 calls, second leaf() = 3 calls
      rng(); // first leaf() h variation
      rng(); // first leaf() s variation
      rng(); // first leaf() l variation
      rng(); // second leaf() h variation
      rng(); // second leaf() s variation
      rng(); // second leaf() l variation
      const colIdx = Math.floor(rng() * LEAF_PAL_SIZE) % LEAF_PAL_SIZE;
      leafData.push({ lx, ly, ls, la, colIdx });
    }
  }

  // Batch leaf fills by colour — compute rotated bezier points directly
  ctx.globalAlpha = opacity;
  for (let ci = 0; ci < LEAF_PAL_SIZE; ci++) {
    ctx.fillStyle = leafPalette[ci];
    ctx.beginPath();
    for (let i = 0; i < leafData.length; i++) {
      const ld = leafData[i];
      if (ld.colIdx !== ci) continue;
      const { lx, ly, ls, la } = ld;
      const cos = Math.cos(la), sin = Math.sin(la);
      ctx.moveTo(lx, ly);
      ctx.bezierCurveTo(
        lx + ls * 0.25 * cos - (-ls * 0.42) * sin,
        ly + ls * 0.25 * sin + (-ls * 0.42) * cos,
        lx + ls * 0.75 * cos - (-ls * 0.42) * sin,
        ly + ls * 0.75 * sin + (-ls * 0.42) * cos,
        lx + ls * cos,
        ly + ls * sin
      );
      ctx.bezierCurveTo(
        lx + ls * 0.75 * cos - ls * 0.42 * sin,
        ly + ls * 0.75 * sin + ls * 0.42 * cos,
        lx + ls * 0.25 * cos - ls * 0.42 * sin,
        ly + ls * 0.25 * sin + ls * 0.42 * cos,
        lx, ly
      );
    }
    ctx.fill();
  }

  // Pre-generate petal colour palettes (6 shades each)
  const PETAL_PAL_SIZE = 6;
  const petalBasePalette = [];
  const petalMidPalette = [];
  for (let i = 0; i < PETAL_PAL_SIZE; i++) {
    const pinkAmt = 0.25 + (i / (PETAL_PAL_SIZE - 1)) * 0.55;
    const baseH = (340 + (i % 3) * 7) / 360;
    const baseS = 0.2 + Math.min(1, pinkAmt) * 0.42;
    const baseL = 0.72 + (1 - Math.min(1, pinkAmt)) * 0.15;
    const bCol = hslToRgb(baseH, baseS, Math.min(0.92, baseL));
    petalBasePalette.push(`rgb(${bCol[0]},${bCol[1]},${bCol[2]})`);
    const midS = 0.06 + Math.min(1, pinkAmt) * 0.12;
    const midL = 0.88 + (1 - Math.min(1, pinkAmt)) * 0.06;
    const mCol = hslToRgb(baseH, midS, Math.min(0.97, midL));
    petalMidPalette.push(`rgb(${mCol[0]},${mCol[1]},${mCol[2]})`);
  }

  // Helper: rotate point (px, py) around (cx, cy) by angle a
  function rot(cx, cy, px, py, cos, sin) {
    return [cx + px * cos - py * sin, cy + px * sin + py * cos];
  }

  // Render flowers and buds interleaved in branch order
  ctx.lineCap = 'round';
  for (const item of renderBlossoms) {
    if (item.type === 'flower') {
      const fl = item;
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
          const sR = 160 + Math.floor(rng() * 40);
          const sG = 170 + Math.floor(rng() * 40);
          const sB = 100 + Math.floor(rng() * 40);
          const lw = Math.max(0.4, fs * 0.015);
          ctx.lineWidth = lw;
          ctx.strokeStyle = `rgb(${sR},${sG},${sB})`;
          ctx.globalAlpha = opacity * 0.6 * showAlpha;
          ctx.beginPath();
          ctx.moveTo(stamenX, baseY);
          ctx.lineTo(stamenX + lean, baseY - stamenH);
          ctx.stroke();
          const aR = 180 + Math.floor(rng() * 60);
          const aG = 150 + Math.floor(rng() * 50);
          const aB = 30 + Math.floor(rng() * 50);
          const aRot = rng() * 0.3;
          ctx.fillStyle = `rgb(${aR},${aG},${aB})`;
          ctx.globalAlpha = opacity * 0.75 * showAlpha;
          ctx.beginPath();
          ctx.ellipse(stamenX + lean, baseY - stamenH, fs * 0.02, fs * 0.035, aRot, 0, Math.PI * 2);
          ctx.fill();
        }
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
        rng(); // flowerPink
        rng(); // baseH
        const baseAlpha = 0.85 + rng() * 0.15;
        if (foldAmt >= 0.15) { rng(); } // foldAlpha
        const colIdx = Math.floor(rng() * PETAL_PAL_SIZE) % PETAL_PAL_SIZE;
        const px = baseX + offsetX, py = baseY + offsetY;
        const pcos = Math.cos(splayAngle), psin = Math.sin(splayAngle);
        const tipWorld = rot(px, py, 0, -ps * 0.96, pcos, psin);
        const grad = ctx.createLinearGradient(px, py, tipWorld[0], tipWorld[1]);
        grad.addColorStop(0, petalBasePalette[colIdx]);
        grad.addColorStop(0.35, petalBasePalette[colIdx]);
        grad.addColorStop(0.65, petalMidPalette[colIdx]);
        grad.addColorStop(1, '#fff');
        ctx.globalAlpha = opacity * baseAlpha;
        ctx.fillStyle = grad;
        ctx.beginPath();
        const [mx, my] = rot(px, py, 0, 0, pcos, psin);
        ctx.moveTo(mx, my);
        ctx.bezierCurveTo(
          ...rot(px, py, -ps * 0.16, -ps * 0.28, pcos, psin),
          ...rot(px, py, -ps * 0.22, -ps * 0.65, pcos, psin),
          ...rot(px, py, -ps * 0.1, -ps * 0.88, pcos, psin)
        );
        ctx.bezierCurveTo(
          ...rot(px, py, -ps * 0.03, -ps * 0.97, pcos, psin),
          ...rot(px, py, ps * 0.03, -ps * 0.97, pcos, psin),
          ...rot(px, py, ps * 0.1, -ps * 0.88, pcos, psin)
        );
        ctx.bezierCurveTo(
          ...rot(px, py, ps * 0.22, -ps * 0.65, pcos, psin),
          ...rot(px, py, ps * 0.16, -ps * 0.28, pcos, psin),
          ...rot(px, py, 0, 0, pcos, psin)
        );
        ctx.fill();
      }

      // Inner petals
      const innerCount = nPetals - outerCount;
      const innerSplay = 0.25 + openAmt * 0.3;
      for (let k = 0; k < innerCount; k++) {
        const splayAngle = ((k / innerCount) - 0.5) * innerSplay + (rng() - 0.5) * 0.1;
        const ps = fs * (0.45 + rng() * 0.15);
        const offsetX = Math.sin(splayAngle) * fs * 0.02;
        const foldAmt = openAmt * (0.1 + rng() * 0.2);
        rng(); // flowerPink
        rng(); // baseH
        const baseAlpha = 0.85 + rng() * 0.15;
        if (foldAmt >= 0.15) { rng(); } // foldAlpha
        const colIdx = Math.floor(rng() * PETAL_PAL_SIZE) % PETAL_PAL_SIZE;
        const px = baseX + offsetX, py = baseY;
        const pcos = Math.cos(splayAngle), psin = Math.sin(splayAngle);
        const tipWorld = rot(px, py, 0, -ps * 0.96, pcos, psin);
        const grad = ctx.createLinearGradient(px, py, tipWorld[0], tipWorld[1]);
        grad.addColorStop(0, petalBasePalette[colIdx]);
        grad.addColorStop(0.35, petalBasePalette[colIdx]);
        grad.addColorStop(0.65, petalMidPalette[colIdx]);
        grad.addColorStop(1, '#fff');
        ctx.globalAlpha = opacity * baseAlpha;
        ctx.fillStyle = grad;
        ctx.beginPath();
        const [mx, my] = rot(px, py, 0, 0, pcos, psin);
        ctx.moveTo(mx, my);
        ctx.bezierCurveTo(
          ...rot(px, py, -ps * 0.16, -ps * 0.28, pcos, psin),
          ...rot(px, py, -ps * 0.22, -ps * 0.65, pcos, psin),
          ...rot(px, py, -ps * 0.1, -ps * 0.88, pcos, psin)
        );
        ctx.bezierCurveTo(
          ...rot(px, py, -ps * 0.03, -ps * 0.97, pcos, psin),
          ...rot(px, py, ps * 0.03, -ps * 0.97, pcos, psin),
          ...rot(px, py, ps * 0.1, -ps * 0.88, pcos, psin)
        );
        ctx.bezierCurveTo(
          ...rot(px, py, ps * 0.22, -ps * 0.65, pcos, psin),
          ...rot(px, py, ps * 0.16, -ps * 0.28, pcos, psin),
          ...rot(px, py, 0, 0, pcos, psin)
        );
        ctx.fill();
      }

    } else {
      // ── Render bud ──
      const bud = item;
      const bs = bud.size;
      const bx = bud.x;
      const by = bud.y;
      const ba = bud.angle + Math.PI / 2;
      const cos = Math.cos(ba), sin = Math.sin(ba);

      // Bud petal — pointed teardrop, pink-to-white gradient
      const colIdx = Math.floor(rng() * PETAL_PAL_SIZE) % PETAL_PAL_SIZE;
      const tipPt = rot(bx, by, 0, -bs, cos, sin);
      const budGrad = ctx.createLinearGradient(bx, by, tipPt[0], tipPt[1]);
      budGrad.addColorStop(0, petalBasePalette[colIdx]);
      budGrad.addColorStop(0.5, petalMidPalette[colIdx]);
      budGrad.addColorStop(1, '#fff');

      ctx.globalAlpha = opacity * 0.92;
      ctx.fillStyle = budGrad;
      ctx.beginPath();
      const [m0x, m0y] = rot(bx, by, 0, 0, cos, sin);
      ctx.moveTo(m0x, m0y);
      ctx.bezierCurveTo(
        ...rot(bx, by, -bs * 0.18, -bs * 0.15, cos, sin),
        ...rot(bx, by, -bs * 0.2, -bs * 0.55, cos, sin),
        ...rot(bx, by, 0, -bs, cos, sin)
      );
      ctx.bezierCurveTo(
        ...rot(bx, by, bs * 0.2, -bs * 0.55, cos, sin),
        ...rot(bx, by, bs * 0.18, -bs * 0.15, cos, sin),
        ...rot(bx, by, 0, 0, cos, sin)
      );
      ctx.fill();

      // Left sepal
      const sepalH = 30 / 360;
      const sepalS = 0.25 + rng() * 0.1;
      const sepalL = 0.45 + rng() * 0.12;
      const sCol1 = hslToRgb(sepalH, sepalS, sepalL);
      ctx.fillStyle = `rgb(${sCol1[0]},${sCol1[1]},${sCol1[2]})`;
      ctx.globalAlpha = opacity * 0.85;
      ctx.beginPath();
      ctx.moveTo(...rot(bx, by, 0, bs * 0.05, cos, sin));
      ctx.bezierCurveTo(
        ...rot(bx, by, -bs * 0.16, -bs * 0.05, cos, sin),
        ...rot(bx, by, -bs * 0.18, -bs * 0.25, cos, sin),
        ...rot(bx, by, -bs * 0.11, -bs * 0.45, cos, sin)
      );
      ctx.bezierCurveTo(
        ...rot(bx, by, -bs * 0.04, -bs * 0.5, cos, sin),
        ...rot(bx, by, bs * 0.04, -bs * 0.42, cos, sin),
        ...rot(bx, by, bs * 0.03, -bs * 0.3, cos, sin)
      );
      ctx.bezierCurveTo(
        ...rot(bx, by, bs * 0.01, -bs * 0.15, cos, sin),
        ...rot(bx, by, -bs * 0.01, -bs * 0.02, cos, sin),
        ...rot(bx, by, 0, bs * 0.05, cos, sin)
      );
      ctx.fill();

      // Right sepal
      const sepalS2 = 0.25 + rng() * 0.1;
      const sepalL2 = 0.45 + rng() * 0.12;
      const sCol2 = hslToRgb(sepalH, sepalS2, sepalL2);
      ctx.fillStyle = `rgb(${sCol2[0]},${sCol2[1]},${sCol2[2]})`;
      ctx.beginPath();
      ctx.moveTo(...rot(bx, by, 0, bs * 0.05, cos, sin));
      ctx.bezierCurveTo(
        ...rot(bx, by, bs * 0.16, -bs * 0.05, cos, sin),
        ...rot(bx, by, bs * 0.18, -bs * 0.25, cos, sin),
        ...rot(bx, by, bs * 0.11, -bs * 0.45, cos, sin)
      );
      ctx.bezierCurveTo(
        ...rot(bx, by, bs * 0.04, -bs * 0.5, cos, sin),
        ...rot(bx, by, -bs * 0.04, -bs * 0.42, cos, sin),
        ...rot(bx, by, -bs * 0.03, -bs * 0.3, cos, sin)
      );
      ctx.bezierCurveTo(
        ...rot(bx, by, -bs * 0.01, -bs * 0.15, cos, sin),
        ...rot(bx, by, bs * 0.01, -bs * 0.02, cos, sin),
        ...rot(bx, by, 0, bs * 0.05, cos, sin)
      );
      ctx.fill();
    }
  }

  ctx.globalAlpha = opacity;
}
