import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const directions = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];
await mkdir('tmp/direction-browser', { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
await page.setContent(`<!doctype html><style>
body{margin:0;background:#222;color:#fff;font:28px sans-serif;padding:20px}
.row{display:flex;gap:20px;align-items:center;margin:14px 0}.label{width:210px}
img{width:960px;height:96px;image-rendering:pixelated;background:#000}
</style>${directions.map((direction) => `<div class="row"><div class="label">${direction}</div><img src="http://127.0.0.1:3333/img/exoduser_silvertail/${direction}.png"></div>`).join('')}`);
await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0));
await page.screenshot({ path: 'tmp/direction-browser/silvertail-sources-large.png', fullPage: true });
await page.setContent(`<!doctype html><style>
body{margin:0;background:#222;color:#fff;font:28px sans-serif;padding:20px;display:grid;grid-template-columns:repeat(4, 1fr);gap:20px}
.card{padding:12px;background:#111}.label{margin-bottom:8px}canvas{width:384px;height:384px;image-rendering:pixelated;background:#000}
</style>${directions.map((direction) => `<div class="card"><div class="label">${direction}</div><canvas data-direction="${direction}" width="48" height="48"></canvas></div>`).join('')}`);
await page.evaluate(async (allDirections) => {
  await Promise.all(allDirections.map(async (direction) => {
    const image = new Image();
    image.src = `http://127.0.0.1:3333/img/exoduser_silvertail/${direction}.png`;
    await image.decode();
    const canvas = document.querySelector(`canvas[data-direction="${direction}"]`);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, 0, 0, 48, 48, 0, 0, 48, 48);
  }));
}, directions);
await page.screenshot({ path: 'tmp/direction-browser/silvertail-idles-8x.png', fullPage: true });
await page.setContent(`<!doctype html><style>
body{margin:0;background:#222;color:#fff;font:24px sans-serif;padding:20px;display:grid;grid-template-columns:repeat(4, 1fr);gap:20px}
.card{padding:12px;background:#111}.label{margin-bottom:8px}.pair{display:flex;gap:8px}.caption{font-size:18px}canvas{width:176px;height:176px;image-rendering:pixelated;background:#000}
</style>${directions.map((direction) => `<div class="card"><div class="label">${direction}</div><div class="pair"><div><div class="caption">idle</div><canvas data-direction="${direction}" data-frame="0" width="48" height="48"></canvas></div><div><div class="caption">walk 1</div><canvas data-direction="${direction}" data-frame="2" width="48" height="48"></canvas></div></div></div>`).join('')}`);
await page.evaluate(async (allDirections) => {
  await Promise.all(allDirections.map(async (direction) => {
    const image = new Image();
    image.src = `http://127.0.0.1:3333/img/exoduser_silvertail/${direction}.png`;
    await image.decode();
    document.querySelectorAll(`canvas[data-direction="${direction}"]`).forEach((canvas) => {
      const frame = Number(canvas.dataset.frame);
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(image, frame * 48, 0, 48, 48, 0, 0, 48, 48);
    });
  }));
}, directions);
await page.screenshot({ path: 'tmp/direction-browser/silvertail-idle-walk-compare.png', fullPage: true });
await browser.close();
