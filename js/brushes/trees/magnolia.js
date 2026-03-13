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
      // moveTo(0,0) -> (lx, ly)
      ctx.moveTo(lx, ly);
      // bezierCurveTo(ls*0.25, -ls*0.42, ls*0.75, -ls*0.42, ls, 0)
      ctx.bezierCurveTo(
        lx + ls * 0.25 * cos - (-ls * 0.42) * sin,
        ly + ls * 0.25 * sin + (-ls * 0.42) * cos,
        lx + ls * 0.75 * cos - (-ls * 0.42) * sin,
        ly + ls * 0.75 * sin + (-ls * 0.42) * cos,
        lx + ls * cos,
        ly + ls * sin
      );
      // bezierCurveTo(ls*0.75, ls*0.42, ls*0.25, ls*0.42, 0, 0)
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
  const petalTipPalette = [];
  for (let i = 0; i < PETAL_PAL_SIZE; i++) {
    const pinkAmt = 0.2 + (i / (PETAL_PAL_SIZE - 1)) * 0.6;
    const baseH = (340 + (i % 3) * 7) / 360;
    const baseS = 0.15 + Math.min(1, pinkAmt) * 0.45;
    const baseL = 0.75 + (1 - Math.min(1, pinkAmt)) * 0.18;
    const bCol = hslToRgb(baseH, baseS, Math.min(0.97, baseL));
    petalBasePalette.push(`rgb(${bCol[0]},${bCol[1]},${bCol[2]})`);
    const tipS = 0.02 + Math.min(1, pinkAmt) * 0.08;
    const tipL = 0.93 + (1 - Math.min(1, pinkAmt)) * 0.05;
    const tCol = hslToRgb(baseH, tipS, Math.min(0.99, tipL));
    petalTipPalette.push(`rgb(${tCol[0]},${tCol[1]},${tCol[2]})`);
  }

  // Collect all stamen and petal data
  const stamenLines = [];  // { sx, sy, ex, ey, lw, strokeCol }
  const stamenAnthers = []; // { cx, cy, rx, ry, rot, fillCol }
  const petalRecords = []; // all petal data for batch rendering

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
        const sR = 160 + Math.floor(rng() * 40);
        const sG = 170 + Math.floor(rng() * 40);
        const sB = 100 + Math.floor(rng() * 40);
        const lw = Math.max(0.4, fs * 0.015);
        stamenLines.push({
          sx: stamenX, sy: baseY,
          ex: stamenX + lean, ey: baseY - stamenH,
          lw,
          strokeCol: `rgb(${sR},${sG},${sB})`,
          alpha: opacity * 0.6 * showAlpha
        });
        const aR = 180 + Math.floor(rng() * 60);
        const aG = 150 + Math.floor(rng() * 50);
        const aB = 30 + Math.floor(rng() * 50);
        const aRot = rng() * 0.3;
        stamenAnthers.push({
          cx: stamenX + lean, cy: baseY - stamenH,
          rx: fs * 0.02, ry: fs * 0.035,
          rot: aRot,
          fillCol: `rgb(${aR},${aG},${aB})`,
          alpha: opacity * 0.75 * showAlpha
        });
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
      // Consume rng() values matching original drawMagnoliaPetal order
      rng(); // flowerPink
      rng(); // baseH
      const baseAlpha = 0.85 + rng() * 0.15;
      let foldAlpha;
      if (foldAmt >= 0.15) {
        foldAlpha = 0.8 + rng() * 0.15;
      }
      const colIdx = Math.floor(rng() * PETAL_PAL_SIZE) % PETAL_PAL_SIZE;
      petalRecords.push({
        px: baseX + offsetX, py: baseY + offsetY,
        angle: splayAngle, ps, layer: 'outer', foldAmt,
        colIdx, baseAlpha,
        foldAlpha: foldAmt >= 0.15 ? foldAlpha : undefined
      });
    }

    // Inner petals
    const innerCount = nPetals - outerCount;
    const innerSplay = 0.25 + openAmt * 0.3;
    for (let k = 0; k < innerCount; k++) {
      const splayAngle = ((k / innerCount) - 0.5) * innerSplay + (rng() - 0.5) * 0.1;
      const ps = fs * (0.45 + rng() * 0.15);
      const offsetX = Math.sin(splayAngle) * fs * 0.02;
      const foldAmt = openAmt * (0.1 + rng() * 0.2);
      // Consume rng() values matching original drawMagnoliaPetal order
      rng(); // flowerPink
      rng(); // baseH
      const baseAlpha = 0.85 + rng() * 0.15;
      let foldAlpha;
      if (foldAmt >= 0.15) {
        foldAlpha = 0.8 + rng() * 0.15;
      }
      const colIdx = Math.floor(rng() * PETAL_PAL_SIZE) % PETAL_PAL_SIZE;
      petalRecords.push({
        px: baseX + offsetX, py: baseY,
        angle: splayAngle, ps, layer: 'inner', foldAmt,
        colIdx, baseAlpha,
        foldAlpha: foldAmt >= 0.15 ? foldAlpha : undefined
      });
    }
  }

  // Batch render stamens — group by lineWidth
  ctx.lineCap = 'round';
  const stamensByLw = new Map();
  for (const s of stamenLines) {
    const lwKey = s.lw.toFixed(2);
    if (!stamensByLw.has(lwKey)) stamensByLw.set(lwKey, []);
    stamensByLw.get(lwKey).push(s);
  }
  for (const [lwKey, group] of stamensByLw) {
    ctx.lineWidth = parseFloat(lwKey);
    for (const s of group) {
      ctx.strokeStyle = s.strokeCol;
      ctx.globalAlpha = s.alpha;
      ctx.beginPath();
      ctx.moveTo(s.sx, s.sy);
      ctx.lineTo(s.ex, s.ey);
      ctx.stroke();
    }
  }

  // Batch anther ellipses
  for (const a of stamenAnthers) {
    ctx.fillStyle = a.fillCol;
    ctx.globalAlpha = a.alpha;
    ctx.beginPath();
    ctx.ellipse(a.cx, a.cy, a.rx, a.ry, a.rot, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = opacity;

  // Helper: rotate point (px, py) around (cx, cy) by angle a
  function rot(cx, cy, px, py, cos, sin) {
    return [cx + px * cos - py * sin, cy + px * sin + py * cos];
  }

  // Batch render petals grouped by base colour index
  for (let ci = 0; ci < PETAL_PAL_SIZE; ci++) {
    // First pass: base shapes for this colour
    ctx.fillStyle = petalBasePalette[ci];
    for (const p of petalRecords) {
      if (p.colIdx !== ci) continue;
      const { px, py, angle: a, ps, foldAmt, baseAlpha } = p;
      const cos = Math.cos(a), sin = Math.sin(a);
      ctx.globalAlpha = opacity * baseAlpha;
      ctx.beginPath();

      if (foldAmt < 0.15) {
        // Flat petal base shape
        const [mx, my] = rot(px, py, 0, 0, cos, sin);
        ctx.moveTo(mx, my);
        ctx.bezierCurveTo(
          ...rot(px, py, -ps * 0.16, -ps * 0.28, cos, sin),
          ...rot(px, py, -ps * 0.22, -ps * 0.65, cos, sin),
          ...rot(px, py, -ps * 0.1, -ps * 0.88, cos, sin)
        );
        ctx.bezierCurveTo(
          ...rot(px, py, -ps * 0.03, -ps * 0.97, cos, sin),
          ...rot(px, py, ps * 0.03, -ps * 0.97, cos, sin),
          ...rot(px, py, ps * 0.1, -ps * 0.88, cos, sin)
        );
        ctx.bezierCurveTo(
          ...rot(px, py, ps * 0.22, -ps * 0.65, cos, sin),
          ...rot(px, py, ps * 0.16, -ps * 0.28, cos, sin),
          ...rot(px, py, 0, 0, cos, sin)
        );
      } else {
        // Folded petal — lower cup
        const bendY = -ps * 0.48;
        const halfW = ps * 0.14;
        const [mx, my] = rot(px, py, 0, 0, cos, sin);
        ctx.moveTo(mx, my);
        ctx.bezierCurveTo(
          ...rot(px, py, -ps * 0.14, -ps * 0.15, cos, sin),
          ...rot(px, py, -halfW, -ps * 0.35, cos, sin),
          ...rot(px, py, -halfW, bendY, cos, sin)
        );
        const [lhx, lhy] = rot(px, py, halfW, bendY, cos, sin);
        ctx.lineTo(lhx, lhy);
        ctx.bezierCurveTo(
          ...rot(px, py, halfW, -ps * 0.35, cos, sin),
          ...rot(px, py, ps * 0.14, -ps * 0.15, cos, sin),
          ...rot(px, py, 0, 0, cos, sin)
        );
      }
      ctx.fill();
    }

    // Second pass: tip shapes for this colour
    ctx.fillStyle = petalTipPalette[ci];
    for (const p of petalRecords) {
      if (p.colIdx !== ci) continue;
      const { px, py, angle: a, ps, foldAmt, foldAlpha } = p;
      const cos = Math.cos(a), sin = Math.sin(a);

      if (foldAmt < 0.15) {
        // Flat petal tip highlight
        ctx.globalAlpha = opacity * 0.5;
        ctx.beginPath();
        ctx.moveTo(...rot(px, py, -ps * 0.12, -ps * 0.5, cos, sin));
        ctx.bezierCurveTo(
          ...rot(px, py, -ps * 0.18, -ps * 0.7, cos, sin),
          ...rot(px, py, -ps * 0.08, -ps * 0.94, cos, sin),
          ...rot(px, py, 0, -ps * 0.96, cos, sin)
        );
        ctx.bezierCurveTo(
          ...rot(px, py, ps * 0.08, -ps * 0.94, cos, sin),
          ...rot(px, py, ps * 0.18, -ps * 0.7, cos, sin),
          ...rot(px, py, ps * 0.12, -ps * 0.5, cos, sin)
        );
        ctx.bezierCurveTo(
          ...rot(px, py, ps * 0.05, -ps * 0.6, cos, sin),
          ...rot(px, py, -ps * 0.05, -ps * 0.6, cos, sin),
          ...rot(px, py, -ps * 0.12, -ps * 0.5, cos, sin)
        );
        ctx.fill();
      } else {
        // Folded petal — upper fold
        const bendY = -ps * 0.48;
        const halfW = ps * 0.14;
        const foldDx = 0; // Math.sin(0) * ... = 0
        const foldDy = -ps * 0.42 * (1 - foldAmt * 0.5);
        const tipX = foldDx;
        const tipY = bendY + foldDy;
        const upperW = ps * 0.12;
        ctx.globalAlpha = opacity * (foldAlpha !== undefined ? foldAlpha : 0.85);
        ctx.beginPath();
        ctx.moveTo(...rot(px, py, -halfW, bendY, cos, sin));
        ctx.bezierCurveTo(
          ...rot(px, py, -halfW + foldDx * 0.3, bendY + foldDy * 0.3, cos, sin),
          ...rot(px, py, tipX - upperW * 1.5, tipY + ps * 0.04, cos, sin),
          ...rot(px, py, tipX, tipY, cos, sin)
        );
        ctx.bezierCurveTo(
          ...rot(px, py, tipX + upperW * 1.5, tipY + ps * 0.04, cos, sin),
          ...rot(px, py, halfW + foldDx * 0.3, bendY + foldDy * 0.3, cos, sin),
          ...rot(px, py, halfW, bendY, cos, sin)
        );
        ctx.fill();
      }
    }
  }

  ctx.globalAlpha = opacity;
}
