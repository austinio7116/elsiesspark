import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import path from 'path';

const BASE = 'http://localhost:8000';
const SHOTS = path.resolve('screenshots');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();

  // ── Load & wait for app ──
  await page.goto(BASE, { waitUntil: 'networkidle' });
  // Wait for loading screen to go away
  await page.waitForSelector('#app:not(.app-loading)', { timeout: 15000 });
  await page.waitForTimeout(800); // let animations settle

  // 1. Room view
  await page.screenshot({ path: `${SHOTS}/01-room.png` });
  console.log('✓ 01-room');

  // ── Navigate to Draw ──
  // Easel may go to 'inspire' first if no active prompt — handle both
  await page.click('#hotspot-easel');
  await page.waitForTimeout(1000);

  // If we landed on inspire, click the draw button there
  const onInspire = await page.$('#view-inspire.active');
  if (onInspire) {
    // Screenshot inspire first since we're here
    await page.screenshot({ path: `${SHOTS}/15-inspire.png` });
    console.log('✓ 15-inspire (early)');

    // Click the spark card shape to start drawing with that prompt
    const drawBtn = await page.$('#inspire-shape');
    if (drawBtn) {
      await drawBtn.click();
      await page.waitForTimeout(1000);
    }
  }

  // If still not on draw, try clicking through the DOM directly
  const onDraw = await page.$('#view-draw.active');
  if (!onDraw) {
    // Force the view change via DOM manipulation
    await page.evaluate(() => {
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById('view-draw').classList.add('active');
    });
    await page.waitForTimeout(1000);
  }
  await page.waitForTimeout(600);

  // 2. Canvas (empty, toolbar visible)
  await page.screenshot({ path: `${SHOTS}/02-canvas.png` });
  console.log('✓ 02-canvas');

  // 3. Tools submenu expanded
  await page.click('#btn-tools-menu');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${SHOTS}/03-toolbar-submenu.png` });
  console.log('✓ 03-toolbar-submenu');

  // 4. Brushes sheet
  await page.click('.tb-sub-btn[data-subtool="brushes"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SHOTS}/04-brushes.png` });
  console.log('✓ 04-brushes');

  // Select sprinkles to show brush-specific options
  await page.click('.brush-btn[data-brush="sprinkles"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${SHOTS}/04b-brush-sprinkles.png` });
  console.log('✓ 04b-brush-sprinkles');

  // Select tree brush
  await page.click('.brush-btn[data-brush="tree"]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${SHOTS}/04c-brush-tree.png` });
  console.log('✓ 04c-brush-tree');

  // Close brushes sheet
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // 5. Paint sheet
  await page.click('#btn-tools-menu');
  await page.waitForTimeout(300);
  await page.click('.tb-sub-btn[data-subtool="paint"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SHOTS}/05-paint.png` });
  console.log('✓ 05-paint');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // 6. Colour picker
  await page.click('#tb-color-btn');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SHOTS}/06-color-grid.png` });
  console.log('✓ 06-color-grid');

  // Spectrum tab
  await page.click('.sheet-tab[data-tab="spectrum"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${SHOTS}/06b-color-spectrum.png` });
  console.log('✓ 06b-color-spectrum');

  // Sliders tab
  await page.click('.sheet-tab[data-tab="sliders"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${SHOTS}/06c-color-sliders.png` });
  console.log('✓ 06c-color-sliders');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // 7. Text sheet
  await page.click('#btn-tools-menu');
  await page.waitForTimeout(300);
  await page.click('.tb-sub-btn[data-subtool="text"]');
  await page.waitForTimeout(500);
  // Type some example text
  const textInput = await page.$('#text-input');
  if (textInput) {
    await textInput.fill('Hello World!');
  }
  await page.screenshot({ path: `${SHOTS}/07-text.png` });
  console.log('✓ 07-text');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // 8. Stickers sheet
  await page.click('#btn-tools-menu');
  await page.waitForTimeout(300);
  await page.click('.tb-sub-btn[data-subtool="stickers"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SHOTS}/08-stickers.png` });
  console.log('✓ 08-stickers');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // 9. Shapes sheet
  await page.click('#btn-tools-menu');
  await page.waitForTimeout(300);
  await page.click('.tb-sub-btn[data-subtool="shapes"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SHOTS}/09-shapes.png` });
  console.log('✓ 09-shapes');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // 10. Layers sheet
  const layersBtn = await page.$('.tb-btn[data-tool="layers"]');
  if (layersBtn) {
    await layersBtn.click();
  } else {
    // Try submenu approach
    await page.click('#btn-tools-menu');
    await page.waitForTimeout(300);
    const layersSub = await page.$('.tb-sub-btn[data-subtool="layers"]');
    if (layersSub) await layersSub.click();
  }
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SHOTS}/10-layers.png` });
  console.log('✓ 10-layers');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // 11. Backgrounds sheet
  await page.click('#btn-tools-menu');
  await page.waitForTimeout(300);
  await page.click('.tb-sub-btn[data-subtool="backgrounds"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SHOTS}/11-backgrounds.png` });
  console.log('✓ 11-backgrounds');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  // 12. Draw something to show eraser and selection
  // Draw a simple stroke on the canvas
  const canvas = await page.$('#preview-canvas');
  if (canvas) {
    const box = await canvas.boundingBox();
    if (box) {
      const cx = box.x + box.width / 2;
      const cy = box.y + box.height / 2;

      // Draw a wavy line (scaled for mobile width)
      const hw = Math.min(120, box.width / 3);
      await page.mouse.move(cx - hw, cy);
      await page.mouse.down();
      for (let i = -hw; i <= hw; i += 8) {
        await page.mouse.move(cx + i, cy + Math.sin(i / 20) * 35, { steps: 2 });
      }
      await page.mouse.up();
      await page.waitForTimeout(500);

      // Draw another stroke
      await page.mouse.move(cx - hw * 0.75, cy + 60);
      await page.mouse.down();
      for (let i = -hw * 0.75; i <= hw * 0.75; i += 8) {
        await page.mouse.move(cx + i, cy + 60 + Math.cos(i / 18) * 30, { steps: 2 });
      }
      await page.mouse.up();
      await page.waitForTimeout(500);

      await page.screenshot({ path: `${SHOTS}/12-drawing.png` });
      console.log('✓ 12-drawing');

      // 13. Select mode with object selected
      await page.click('.tb-btn[data-tool="pointer"]');
      await page.waitForTimeout(300);
      // Click on the stroke we drew
      await page.mouse.click(cx, cy);
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SHOTS}/13-selection.png` });
      console.log('✓ 13-selection');

      // Deselect
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      // 14. Eraser
      await page.click('.tb-btn[data-tool="eraser"]');
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SHOTS}/14-eraser.png` });
      console.log('✓ 14-eraser');
    }
  }

  // ── Navigate back to Room ──
  await page.click('#btn-back-room').catch(() => {});
  await page.waitForTimeout(1000);

  // If not on room, force it
  const onRoom = await page.$('#view-room.active');
  if (!onRoom) {
    await page.evaluate(() => {
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById('view-room').classList.add('active');
    });
    await page.waitForTimeout(600);
  }

  // ── Inspire (if not already captured) ──
  if (!onInspire) {
    await page.click('#hotspot-lightbulb');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `${SHOTS}/15-inspire.png` });
    console.log('✓ 15-inspire');

    // Back to room
    await page.evaluate(() => {
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      document.getElementById('view-room').classList.add('active');
    });
    await page.waitForTimeout(600);
  }

  // ── Gallery ──
  await page.evaluate(() => {
    document.getElementById('hotspot-gallery').click();
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SHOTS}/16-gallery.png` });
  console.log('✓ 16-gallery');

  await browser.close();
  console.log('\nAll screenshots saved to screenshots/');
}

main().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
