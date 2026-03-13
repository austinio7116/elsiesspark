// Cherry Blossom tree renderer
// Wide horizontal spreading branches, clusters of small 5-petal pink/white flowers,
// smooth dark reddish-brown bark, small bronze-tinted leaves
export default function renderCherry(ctx, h) {
  const { rng, opacity, brushSize, leafHsl, hslToRgb,
          leafDensity, branchDensity, seed,
          bezPt, drawTrunk, fractalGrow, seedFromTrunk,
          filterByDensity, filterBranches, renderBranches, makeBark } = h;

  // Smooth dark reddish-brown bark
  const bark = makeBark(10 / 360, 0.35, 0.22);
  drawTrunk(bark);

  const blossomClusters = [];

  const fg = fractalGrow({
    // Wide horizontal spreading
    spread: 0.4, spreadRange: 0.25,
    nKidsProb: 0.45,
    lenDecay: 0.58, lenRange: 0.14,
    widthDecay: 0.65, widthRange: 0.08,
    onTerminal({ sx, sy, mx, my, ex, ey, endW, depth, width }) {
      const out = [];
      // Small leaves
      const baseLSize = Math.max(3, brushSize * (0.3 + rng() * 0.25));
      out.push({ x: ex, y: ey, size: baseLSize });
      for (const bt of [0.35 + rng() * 0.15, 0.65 + rng() * 0.15]) {
        const mp = bezPt(sx, sy, mx, my, ex, ey, bt);
        out.push({
          x: mp.x + (rng() - 0.5) * width * 1.2,
          y: mp.y + (rng() - 0.5) * width * 1.2,
          size: baseLSize * (0.6 + rng() * 0.4)
        });
      }
      // Dense blossom clusters at most branch tips
      if (rng() > 0.25) {
        const clusterSize = Math.max(5, brushSize * (0.5 + rng() * 0.4));
        const nFlowers = 3 + Math.floor(rng() * 5);
        blossomClusters.push({
          x: ex, y: ey,
          size: clusterSize,
          count: nFlowers
        });
      }
      return out;
    }
  });

  seedFromTrunk(fg.grow);

  const branches = filterBranches(fg.branches, branchDensity, seed + 99999);
  renderBranches(branches, bark);

  const foliage = filterByDensity(fg.foliage, leafDensity, seed + 99998);

  // Filter blossoms
  let renderClusters = blossomClusters;
  const fRng = h.createRng(seed + 88888);
  if (leafDensity < 1) {
    renderClusters = blossomClusters.filter(() => fRng() < (0.3 + leafDensity * 0.7));
  } else if (leafDensity > 1) {
    renderClusters = [];
    for (const cl of blossomClusters) {
      renderClusters.push(cl);
      if (fRng() < (leafDensity - 1) * 0.5) {
        renderClusters.push({
          ...cl,
          x: cl.x + (fRng() - 0.5) * cl.size * 1.5,
          y: cl.y + (fRng() - 0.5) * cl.size * 1.5,
          count: cl.count + Math.floor(fRng() * 2)
        });
      }
    }
  }

  // Leaf helper — small bronze/copper-tinted leaves
  function leaf() {
    const r = hslToRgb(
      leafHsl[0] + (rng() - 0.5) * 0.05 + 0.02,
      Math.min(1, leafHsl[1] - 0.05 + rng() * 0.1),
      Math.max(0.25, Math.min(0.55, leafHsl[2] + (rng() - 0.5) * 0.15))
    );
    return `rgb(${r[0]},${r[1]},${r[2]})`;
  }

  // Render leaves — small, slightly serrated
  for (const lc of foliage) {
    const n = Math.max(1, Math.round((3 + Math.floor(rng() * 4)) * leafDensity));
    for (let k = 0; k < n; k++) {
      const a = rng() * Math.PI * 2;
      const d = rng() * lc.size * 0.5;
      const lx = lc.x + Math.cos(a) * d;
      const ly = lc.y + Math.sin(a) * d;
      const ls = lc.size * (0.25 + rng() * 0.3);
      const la = rng() * Math.PI * 2;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(la);
      ctx.fillStyle = leaf();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      // Small pointed leaf
      ctx.bezierCurveTo(ls * 0.2, -ls * 0.3, ls * 0.7, -ls * 0.2, ls, 0);
      ctx.bezierCurveTo(ls * 0.7, ls * 0.2, ls * 0.2, ls * 0.3, 0, 0);
      ctx.fill();
      ctx.restore();
      ctx.globalAlpha = opacity;
    }
  }

  // Render blossom clusters — 5-petal cherry blossoms
  for (const cl of renderClusters) {
    for (let fi = 0; fi < cl.count; fi++) {
      const fx = cl.x + (rng() - 0.5) * cl.size * 1.5;
      const fy = cl.y + (rng() - 0.5) * cl.size * 1.5;
      const fs = cl.size * (0.3 + rng() * 0.35);

      // Petal colour: white to pink
      const pinkAmt = 0.3 + rng() * 0.7;
      const pH = (345 + rng() * 20) / 360;
      const pS = 0.2 + pinkAmt * 0.4;
      const pL = 0.8 + (1 - pinkAmt) * 0.15;
      const pCol = hslToRgb(pH, pS, Math.min(0.97, pL));
      const petalCol = `rgb(${pCol[0]},${pCol[1]},${pCol[2]})`;

      // 5 petals evenly spaced
      const baseAngle = rng() * Math.PI * 2;
      for (let pi = 0; pi < 5; pi++) {
        const pa = baseAngle + (pi / 5) * Math.PI * 2;
        const px = fx + Math.cos(pa) * fs * 0.15;
        const py = fy + Math.sin(pa) * fs * 0.15;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(pa);
        ctx.fillStyle = petalCol;
        ctx.globalAlpha = opacity * (0.8 + rng() * 0.2);
        ctx.beginPath();
        // Heart-shaped petal with notch
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(fs * 0.12, -fs * 0.18, fs * 0.35, -fs * 0.22, fs * 0.4, -fs * 0.08);
        ctx.bezierCurveTo(fs * 0.42, -fs * 0.02, fs * 0.38, fs * 0.02, fs * 0.4, fs * 0.08);
        ctx.bezierCurveTo(fs * 0.35, fs * 0.22, fs * 0.12, fs * 0.18, 0, 0);
        ctx.fill();
        ctx.restore();
      }

      // Centre — small yellow-pink dot with stamens
      ctx.globalAlpha = opacity * 0.9;
      ctx.fillStyle = `rgb(${220 + Math.floor(rng() * 30)},${180 + Math.floor(rng() * 40)},${120 + Math.floor(rng() * 40)})`;
      ctx.beginPath();
      ctx.arc(fx, fy, fs * 0.08, 0, Math.PI * 2);
      ctx.fill();

      // Tiny stamens
      const nSt = 3 + Math.floor(rng() * 3);
      for (let si = 0; si < nSt; si++) {
        const sa = rng() * Math.PI * 2;
        const sLen = fs * (0.12 + rng() * 0.1);
        ctx.strokeStyle = `rgb(${200 + Math.floor(rng() * 50)},${160 + Math.floor(rng() * 50)},${80 + Math.floor(rng() * 40)})`;
        ctx.lineWidth = Math.max(0.3, fs * 0.02);
        ctx.globalAlpha = opacity * 0.7;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx + Math.cos(sa) * sLen, fy + Math.sin(sa) * sLen);
        ctx.stroke();
        // Anther dot
        ctx.fillStyle = `rgb(${220 + Math.floor(rng() * 35)},${140 + Math.floor(rng() * 50)},${60 + Math.floor(rng() * 40)})`;
        ctx.beginPath();
        ctx.arc(fx + Math.cos(sa) * sLen, fy + Math.sin(sa) * sLen, fs * 0.02, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = opacity;
    }
  }
}
