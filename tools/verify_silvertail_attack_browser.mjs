import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

await mkdir('tmp/direction-browser', { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
await page.goto('http://127.0.0.1:3333/game.html?test=1&testchar=1&slot=silvertail-attack', { waitUntil: 'networkidle' });
await page.waitForFunction(() => !!P && !!G && !!G.on && !!_atlasMask, null, { timeout: 60000 });
await page.evaluate(() => _loadCharAtlas(1));
await page.waitForTimeout(1000);

for (const [name, state] of Object.entries({ kiSlash: { s: 'wSwing', swProg: .5, st2: 3 }, bladeParry: { s: 'sBash', swProg: 0, st2: 10 } })) {
  const point = await page.evaluate((next) => {
    P.s = next.s; P.swProg = next.swProg; P.st2 = next.st2; P.iframes = 999;
    _startSilvertailAttackMotion();
    P._silvAttackStartedAt -= 180;
    const rect = C.getBoundingClientRect();
    return { x: rect.left + (P.x - G.cam.x + VW / 2) * rect.width / VW, y: rect.top + (P.y - G.cam.y + VH / 2) * rect.height / VH };
  }, state);
  await page.waitForTimeout(60);
  await page.screenshot({ path: `tmp/direction-browser/silvertail-${name}.png`, clip: { x: Math.max(0, point.x - 110), y: Math.max(0, point.y - 110), width: 220, height: 220 } });
}
await writeFile('tmp/direction-browser/silvertail-attack-result.json', JSON.stringify({ errors }, null, 2));
console.log(JSON.stringify({ errors }));
await browser.close();
