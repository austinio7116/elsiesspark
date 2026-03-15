import { chromium } from 'playwright';
import path from 'path';
import { execSync } from 'child_process';
import fs from 'fs';

const BASE = 'http://localhost:8000';
const OUT = path.resolve('screenshots/trees');
const FRAMES = path.resolve('screenshots/trees/_frames');

const TREE_TYPES = [
  { mode: 'default', label: 'oak' },
  { mode: 'magnolia', label: 'magnolia' },
  { mode: 'willow', label: 'willow' },
  { mode: 'cherry', label: 'cherry' },
  { mode: 'pine', label: 'pine' },
  { mode: 'palm', label: 'palm' },
  { mode: 'maple', label: 'maple' },
  { mode: 'birch', label: 'birch' },
];

async function drawStroke(page, points, steps = 30) {
  const totalSegments = points.length - 1;
  const stepsPerSeg = Math.max(1, Math.floor(steps / totalSegments));

  await page.mouse.move(points[0][0], points[0][1]);
  await page.mouse.down();
  for (let seg = 0; seg < totalSegments; seg++) {
    const [x1, y1] = points[seg];
    const [x2, y2] = points[seg + 1];
    for (let i = 1; i <= stepsPerSeg; i++) {
      const t = i / stepsPerSeg;
      await page.mouse.move(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, { steps: 1 });
      await page.waitForTimeout(15);
    }
  }
  await page.mouse.up();
  await page.waitForTimeout(800);
}

// Capture a frame using full page screenshot
async function captureFrame(page, filepath) {
  await page.screenshot({ path: filepath });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(FRAMES, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 500, height: 700 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // Load & navigate to draw
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('#app:not(.app-loading)', { timeout: 15000 });
  await page.waitForTimeout(800);
  await page.click('#hotspot-easel');
  await page.waitForTimeout(1000);
  const onInspire = await page.$('#view-inspire.active');
  if (onInspire) {
    const btn = await page.$('#inspire-shape');
    if (btn) { await btn.click(); await page.waitForTimeout(1000); }
  }
  if (!(await page.$('#view-draw.active'))) {
    await page.evaluate(() => {
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById('view-draw').classList.add('active');
    });
    await page.waitForTimeout(1000);
  }

  // Set green colour via sliders
  await page.click('#tb-color-btn');
  await page.waitForTimeout(400);
  await page.click('.sheet-tab[data-tab="sliders"]');
  await page.waitForTimeout(300);
  for (const [id, val] of [['slider-h', 130], ['slider-s', 65], ['slider-l', 40]]) {
    const slider = await page.$(`#${id}`);
    if (slider) {
      await slider.evaluate((el, v) => { el.value = v; el.dispatchEvent(new Event('input')); }, val);
      await page.waitForTimeout(100);
    }
  }
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // Get canvas bounds
  const canvas = await page.$('#preview-canvas');
  const box = await canvas.boundingBox();
  const cx = box.x + box.width / 2;
  const bottom = box.y + box.height * 0.82;
  const trunkHeight = box.height * 0.5;

  for (const tree of TREE_TYPES) {
    console.log(`Drawing ${tree.label}...`);

    // Clear canvas (undo all)
    for (let i = 0; i < 15; i++) {
      await page.keyboard.down('Control');
      await page.keyboard.press('z');
      await page.keyboard.up('Control');
      await page.waitForTimeout(30);
    }
    await page.waitForTimeout(300);

    // Select tree mode
    await page.click('#btn-tools-menu');
    await page.waitForTimeout(300);
    await page.click('.tb-sub-btn[data-subtool="brushes"]');
    await page.waitForTimeout(400);
    await page.click('.brush-btn[data-brush="tree"]');
    await page.waitForTimeout(200);
    await page.click(`.mode-btn[data-mode="${tree.mode}"]`);
    await page.waitForTimeout(200);
    const sizeSlider = await page.$('#brush-size');
    if (sizeSlider) {
      await sizeSlider.evaluate(el => { el.value = 25; el.dispatchEvent(new Event('input')); });
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);

    const isPine = tree.mode === 'pine';
    const forkY = bottom - trunkHeight * 0.4;
    const branchEndY = bottom - trunkHeight * 0.85;
    const branchSpread = box.width * 0.25;

    let frameIdx = 0;
    const frameDir = path.join(FRAMES, tree.label);
    fs.mkdirSync(frameDir, { recursive: true });

    // Frame 0: blank canvas
    const f0 = path.join(frameDir, `${String(frameIdx++).padStart(3, '0')}.png`);
    await captureFrame(page, f0);

    if (isPine) {
      await drawStroke(page, [[cx, bottom], [cx, bottom - trunkHeight * 1.1]], 30);
      await page.waitForTimeout(400);
      const f1 = path.join(frameDir, `${String(frameIdx++).padStart(3, '0')}.png`);
      await captureFrame(page, f1);
    } else {
      // Tree 1: straight up
      await drawStroke(page, [[cx, bottom], [cx, bottom - trunkHeight]], 30);
      await page.waitForTimeout(400);
      const f1 = path.join(frameDir, `${String(frameIdx++).padStart(3, '0')}.png`);
      await captureFrame(page, f1);

      // Tree 2: up trunk then fork LEFT
      await drawStroke(page, [
        [cx - 4, bottom],
        [cx - 4, forkY],
        [cx - branchSpread, branchEndY]
      ], 30);
      await page.waitForTimeout(400);
      const f2 = path.join(frameDir, `${String(frameIdx++).padStart(3, '0')}.png`);
      await captureFrame(page, f2);

      // Tree 3: up trunk then fork RIGHT
      await drawStroke(page, [
        [cx + 4, bottom],
        [cx + 4, forkY],
        [cx + branchSpread, branchEndY]
      ], 30);
      await page.waitForTimeout(400);
      const f3 = path.join(frameDir, `${String(frameIdx++).padStart(3, '0')}.png`);
      await captureFrame(page, f3);
    }

    // Build animated GIF from frames
    // Delays: blank=0.5s, each tree=1.5s, final=3s
    const gifPath = path.join(OUT, `tree-${tree.label}.gif`);
    const frames = fs.readdirSync(frameDir).filter(f => f.endsWith('.png')).sort();
    let cmd = 'convert -loop 0';
    frames.forEach((f, i) => {
      let delay;
      if (i === 0) delay = 50;                    // 0.5s blank
      else if (i === frames.length - 1) delay = 300; // 3s final hold
      else delay = 150;                            // 1.5s per tree
      cmd += ` -delay ${delay} "${path.join(frameDir, f)}"`;
    });
    cmd += ` -layers Optimize "${gifPath}"`;
    execSync(cmd);

    const sizeMB = (fs.statSync(gifPath).size / 1024 / 1024).toFixed(1);
    console.log(`  -> ${gifPath} (${sizeMB}MB)`);
  }

  // Clean up
  fs.rmSync(FRAMES, { recursive: true, force: true });

  await browser.close();
  console.log('\nAll tree GIFs saved to screenshots/trees/');
}

main().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
