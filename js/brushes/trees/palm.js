// Palm tree renderer
// Single curved trunk with horizontal stripe texture, bulge/cap at crown,
// crown of long arching fronds originating from a spread area (not a single point),
// with long skinny leaflets that have a visible central fold (V-shaped cross-section).
export default function renderPalm(ctx, h) {
  const { rng, opacity, brushSize, leafHsl, hslToRgb,
          leafDensity, seed,
          trunkEnd, trunkW, trunkBaseY,
          topP, topD, trunkAngle,
          ptAt, dirAt, cubicBez, makeBark } = h;

  // Warm brown bark
  const bark = makeBark(28 / 360, 0.35, 0.32);

  // Draw trunk with horizontal stripe texture
  const nSamples = Math.max(12, Math.floor(trunkEnd / 2.5));
  const leftE = [], rightE = [];
  for (let i = 0; i <= nSamples; i++) {
    const t = i / nSamples;
    const d = t * trunkEnd;
    const p = ptAt(d);
    const dr = dirAt(d);
    const nx = -dr.dy, ny = dr.dx;
    const baseSwell = t < 0.1 ? 1.1 - t : 1;
    const topBulge = t > 0.85 ? 1 + (t - 0.85) * 1.5 : 1;
    const taper = (1 - t * 0.25) * baseSwell * topBulge;
    const hw = trunkW * 0.38 * taper;
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

  ctx.lineWidth = Math.max(0.5, trunkW * 0.03);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.strokeStyle = bark(-0.1);
  ctx.beginPath();
  ctx.moveTo(leftE[0].x, leftE[0].y);
  for (let i = 1; i < leftE.length; i++) ctx.lineTo(leftE[i].x, leftE[i].y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(rightE[0].x, rightE[0].y);
  for (let i = 1; i < rightE.length; i++) ctx.lineTo(rightE[i].x, rightE[i].y);
  ctx.stroke();

  // Horizontal stripes
  for (let i = 1; i < nSamples; i++) {
    const t = i / nSamples;
    const d = t * trunkEnd;
    const p = ptAt(d);
    const dr = dirAt(d);
    const nx = -dr.dy, ny = dr.dx;
    const baseSwell = t < 0.1 ? 1.1 - t : 1;
    const topBulge = t > 0.85 ? 1 + (t - 0.85) * 1.5 : 1;
    const taper = (1 - t * 0.25) * baseSwell * topBulge;
    const hw = trunkW * 0.38 * taper;
    const isLight = (i % 2 === 0);
    const lAdj = isLight ? 0.06 : -0.06;
    ctx.strokeStyle = bark(lAdj + (rng() - 0.5) * 0.03);
    ctx.lineWidth = Math.max(0.6, trunkW * 0.03);
    ctx.globalAlpha = opacity * (0.35 + rng() * 0.2);
    ctx.beginPath();
    const curve = (rng() - 0.5) * hw * 0.12;
    ctx.moveTo(p.x + nx * hw * 0.95, p.y + ny * hw * 0.95);
    ctx.quadraticCurveTo(p.x + dr.dx * curve, p.y + dr.dy * curve,
                         p.x - nx * hw * 0.95, p.y - ny * hw * 0.95);
    ctx.stroke();
  }
  ctx.globalAlpha = opacity;

  // Crown cap
  const capRadius = trunkW * 0.45;
  const capCol = hslToRgb(80 / 360, 0.3, 0.3 + rng() * 0.1);
  ctx.fillStyle = `rgb(${capCol[0]},${capCol[1]},${capCol[2]})`;
  ctx.globalAlpha = opacity * 0.8;
  ctx.beginPath();
  ctx.ellipse(topP.x, topP.y, capRadius, capRadius * 0.7,
              trunkAngle + Math.PI / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = opacity;

  // Crown of fronds
  const nFronds = 10 + Math.floor(rng() * 6);
  const crownX = topP.x;
  const crownY = topP.y;
  const crownSpread = capRadius * 0.8;

  // Pre-generate colour palettes to avoid per-leaflet hslToRgb calls
  const NUM_LIGHT = 6, NUM_DARK = 6, NUM_SPINE = 4;
  const lightCols = [];
  for (let i = 0; i < NUM_LIGHT; i++) {
    const r = hslToRgb(
      leafHsl[0] + (rng() - 0.5) * 0.04,
      Math.min(1, leafHsl[1] + 0.05 + rng() * 0.08),
      Math.max(0.22, Math.min(0.52, leafHsl[2] + 0.03 + (rng() - 0.4) * 0.12))
    );
    lightCols.push(`rgb(${r[0]},${r[1]},${r[2]})`);
  }
  const darkCols = [];
  for (let i = 0; i < NUM_DARK; i++) {
    const r = hslToRgb(
      leafHsl[0] + (rng() - 0.5) * 0.04,
      Math.min(1, leafHsl[1] + 0.08 + rng() * 0.08),
      Math.max(0.12, Math.min(0.38, leafHsl[2] - 0.08 + (rng() - 0.4) * 0.1))
    );
    darkCols.push(`rgb(${r[0]},${r[1]},${r[2]})`);
  }
  const spineCols = [];
  for (let i = 0; i < NUM_SPINE; i++) {
    const r = hslToRgb(
      leafHsl[0] + (rng() - 0.5) * 0.04,
      Math.min(1, leafHsl[1] + 0.05 + rng() * 0.08),
      Math.max(0.18, Math.min(0.42, leafHsl[2] - 0.02 + (rng() - 0.4) * 0.1))
    );
    spineCols.push(`rgb(${r[0]},${r[1]},${r[2]})`);
  }

  // Build fronds
  const fronds = [];
  for (let fi = 0; fi < nFronds; fi++) {
    const baseA = trunkAngle + ((fi / nFronds) - 0.5) * Math.PI * 2;
    const frondAngle = baseA + (rng() - 0.5) * 0.35;
    const frondLen = trunkEnd * (0.5 + rng() * 0.35);
    const archAmount = 0.4 + rng() * 0.6;
    const originOffset = (rng() - 0.5) * crownSpread;
    const perpA = trunkAngle + Math.PI / 2;
    const ox = crownX + Math.cos(perpA) * originOffset + Math.cos(trunkAngle) * (rng() - 0.5) * crownSpread * 0.5;
    const oy = crownY + Math.sin(perpA) * originOffset + Math.sin(trunkAngle) * (rng() - 0.5) * crownSpread * 0.5;
    fronds.push({ angle: frondAngle, len: frondLen, arch: archAmount, ox, oy });
  }

  fronds.sort((a, b) => Math.sin(a.angle) - Math.sin(b.angle));

  // Collect all leaflet geometry, then batch-render by colour.
  // lightHalves[colIdx] and darkHalves[colIdx] each hold arrays of bezier path data.
  const lightHalves = [];
  for (let i = 0; i < NUM_LIGHT; i++) lightHalves.push([]);
  const darkHalves = [];
  for (let i = 0; i < NUM_DARK; i++) darkHalves.push([]);

  for (const fr of fronds) {
    const frondLen = fr.len;
    const archAmount = fr.arch;
    const startX = fr.ox;
    const startY = fr.oy;
    const outDx = Math.cos(fr.angle);
    const outDy = Math.sin(fr.angle);

    const c1x = startX + outDx * frondLen * 0.35;
    const c1y = startY + outDy * frondLen * 0.35 - frondLen * 0.08;
    const c2x = startX + outDx * frondLen * 0.7;
    const c2y = startY + outDy * frondLen * 0.4 + frondLen * archAmount * 0.35;
    const endX = startX + outDx * frondLen * 0.85;
    const endY = startY + outDy * frondLen * 0.5 + frondLen * archAmount * 0.55;

    // Draw spine (few per tree, keep as-is with pre-generated colours)
    ctx.strokeStyle = spineCols[fr.ox & (NUM_SPINE - 1)] || spineCols[0];
    ctx.lineWidth = Math.max(1.2, trunkW * 0.06);
    ctx.lineCap = 'round';
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(c1x, c1y, c2x, c2y, endX, endY);
    ctx.stroke();

    // Collect leaflet geometry
    const nLeaflets = Math.max(12, Math.round((22 + Math.floor(rng() * 12)) * leafDensity));
    for (let li = 0; li < nLeaflets; li++) {
      const t = 0.06 + (li / nLeaflets) * 0.9;
      const lp = cubicBez(startX, startY, c1x, c1y, c2x, c2y, endX, endY, t);

      const tNext = Math.min(1, t + 0.02);
      const lpNext = cubicBez(startX, startY, c1x, c1y, c2x, c2y, endX, endY, tNext);
      const tangent = Math.atan2(lpNext.y - lp.y, lpNext.x - lp.x);

      const leafletLen = frondLen * (0.16 + rng() * 0.08) * (1 - t * 0.4);
      const leafletWidth = leafletLen * 0.07;

      for (const side of [-1, 1]) {
        const leafAngle = tangent + side * (0.4 + rng() * 0.2);
        const lsx = lp.x;
        const lsy = lp.y;
        const lex = lsx + Math.cos(leafAngle) * leafletLen;
        const ley = lsy + Math.sin(leafAngle) * leafletLen;

        const perpDx = -Math.sin(leafAngle);
        const perpDy = Math.cos(leafAngle);

        // Consume rng() to keep the sequence aligned (was used for globalAlpha per half)
        const lightAlpha = opacity * (0.8 + rng() * 0.2);
        const darkAlpha = opacity * (0.75 + rng() * 0.2);

        const lci = li % NUM_LIGHT;
        const dci = li % NUM_DARK;

        // Light half: moveTo(lsx,lsy) -> lineTo(lex,ley) -> bezierCurveTo back
        lightHalves[lci].push(
          lsx, lsy, lex, ley,
          // bezier control points and end (back to start)
          lsx + (lex - lsx) * 0.7 + perpDx * leafletWidth * 0.8,
          lsy + (ley - lsy) * 0.7 + perpDy * leafletWidth * 0.8,
          lsx + (lex - lsx) * 0.3 + perpDx * leafletWidth,
          lsy + (ley - lsy) * 0.3 + perpDy * leafletWidth
        );

        // Dark half: moveTo(lsx,lsy) -> lineTo(lex,ley) -> bezierCurveTo back (opposite side)
        darkHalves[dci].push(
          lsx, lsy, lex, ley,
          lsx + (lex - lsx) * 0.7 - perpDx * leafletWidth * 0.8,
          lsy + (ley - lsy) * 0.7 - perpDy * leafletWidth * 0.8,
          lsx + (lex - lsx) * 0.3 - perpDx * leafletWidth,
          lsy + (ley - lsy) * 0.3 - perpDy * leafletWidth
        );
      }
    }
  }

  // Batch render light halves — one beginPath + fill per colour bucket
  ctx.globalAlpha = opacity * 0.9;
  for (let ci = 0; ci < NUM_LIGHT; ci++) {
    const arr = lightHalves[ci];
    if (arr.length === 0) continue;
    ctx.fillStyle = lightCols[ci];
    ctx.beginPath();
    for (let j = 0; j < arr.length; j += 8) {
      ctx.moveTo(arr[j], arr[j + 1]);
      ctx.lineTo(arr[j + 2], arr[j + 3]);
      ctx.bezierCurveTo(arr[j + 4], arr[j + 5], arr[j + 6], arr[j + 7], arr[j], arr[j + 1]);
    }
    ctx.fill();
  }

  // Batch render dark halves
  ctx.globalAlpha = opacity * 0.85;
  for (let ci = 0; ci < NUM_DARK; ci++) {
    const arr = darkHalves[ci];
    if (arr.length === 0) continue;
    ctx.fillStyle = darkCols[ci];
    ctx.beginPath();
    for (let j = 0; j < arr.length; j += 8) {
      ctx.moveTo(arr[j], arr[j + 1]);
      ctx.lineTo(arr[j + 2], arr[j + 3]);
      ctx.bezierCurveTo(arr[j + 4], arr[j + 5], arr[j + 6], arr[j + 7], arr[j], arr[j + 1]);
    }
    ctx.fill();
  }

  ctx.globalAlpha = opacity;

  // Coconuts
  if (rng() > 0.4) {
    const nCoconuts = 2 + Math.floor(rng() * 3);
    for (let ci = 0; ci < nCoconuts; ci++) {
      const ca = trunkAngle + (rng() - 0.5) * 1.2;
      const cd = capRadius * (0.6 + rng() * 0.5);
      const cx = crownX + Math.cos(ca) * cd;
      const cy = crownY + Math.sin(ca) * cd + brushSize * 0.15;
      const cr = brushSize * (0.12 + rng() * 0.08);
      const cCol = hslToRgb(30 / 360, 0.5, 0.25 + rng() * 0.1);
      ctx.fillStyle = `rgb(${cCol[0]},${cCol[1]},${cCol[2]})`;
      ctx.globalAlpha = opacity * 0.85;
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = opacity;
  }
}
