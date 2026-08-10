import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const clocks = ['12', '1', '3', '5', '6', '7', '9', '11'];
await mkdir('tmp/direction-browser', { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1320, height: 1000 } });
await page.setContent(`<!doctype html><style>
body{margin:0;padding:18px;background:#202020;color:#fff;font:20px sans-serif}
.row{display:flex;align-items:center;gap:10px;margin:8px 0}.clock{width:42px;font-size:28px;font-weight:bold}.sheet{position:relative;width:960px;height:96px;background:#000}.sheet img{width:960px;height:96px;image-rendering:pixelated}.frame{position:absolute;top:0;width:96px;height:96px;border-left:1px solid #556}.frame b{position:absolute;top:2px;left:3px;color:#7ff;font-size:14px;text-shadow:1px 1px #000}.idle{background:rgba(255,210,0,.12)}
</style>${clocks.map((clock) => `<div class="row"><div class="clock">${clock}</div><div class="sheet"><img src="http://127.0.0.1:3333/img/exoduser_silvertail/${clock}.png">${Array.from({ length: 10 }, (_, index) => `<div class="frame ${index < 2 ? 'idle' : ''}" style="left:${index * 96}px"><b>${index}</b></div>`).join('')}</div></div>`).join('')}`);
await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0));
await page.screenshot({ path: 'tmp/direction-browser/silvertail-clock-sheets-v9.png', fullPage: true });
await browser.close();
