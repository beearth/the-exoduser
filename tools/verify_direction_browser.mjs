import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const outDir = 'tmp/direction-browser';
const directions = {
  '12': [640, 120], '1': [890, 170], '3': [1080, 360], '5': [890, 550],
  '6': [640, 600], '7': [390, 550], '9': [200, 360], '11': [390, 170],
};

async function waitForAtlas(page) {
  await page.waitForFunction(() => !!P && !!G && !!G.on && !!_atlasMask, null, { timeout: 60000 });
}

async function captureCharacter(page, charIndex, name) {
  await page.evaluate((index) => _loadCharAtlas(index), charIndex);
  await page.waitForTimeout(1000);
  await waitForAtlas(page);
  const result = {};
  for (const [clock, [x, y]] of Object.entries(directions)) {
    await page.mouse.move(x, y);
    await page.waitForTimeout(150);
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(100);
    result[clock] = await page.evaluate(() => ({
      facing: P.facing,
      facingDir: _facingDir8(P.facing),
      playerState: P.s,
      charIdx: _charIdx,
      mouseFacing: _mouseFacing,
      gamepad: _gpActive,
    }));
    await page.keyboard.up('KeyD');
    await page.waitForTimeout(100);
    await page.screenshot({ path: `${outDir}/${name}-${clock}.png` });
    const playerScreen = await page.evaluate(() => {
      const rect = C.getBoundingClientRect();
      return {
        x: rect.left + (P.x - G.cam.x + VW / 2) * rect.width / VW,
        y: rect.top + (P.y - G.cam.y + VH / 2) * rect.height / VH,
      };
    });
    await page.screenshot({
      path: `${outDir}/${name}-${clock}-player.png`,
      clip: { x: Math.max(0, playerScreen.x - 96), y: Math.max(0, playerScreen.y - 96), width: 192, height: 192 },
    });
  }
  return result;
}

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const consoleErrors = [];
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});
await page.goto('http://127.0.0.1:3333/game.html?test=1&testchar=1&slot=direction-browser', { waitUntil: 'networkidle' });
await page.waitForTimeout(5000);
console.log('BOOT_STATE', JSON.stringify(await page.evaluate(() => ({
  p: typeof P,
  playerReady: !!P,
  g: typeof G,
  atlas: typeof _atlasMask,
  atlasReady: !!_atlasMask,
  boot: document.getElementById('bootLoading')?.textContent,
  canvases: document.querySelectorAll('canvas').length,
}))));
await waitForAtlas(page);
const result = {
  warrior: await captureCharacter(page, 0, 'warrior'),
  silvertail: await captureCharacter(page, 1, 'silvertail'),
  consoleErrors,
};
await writeFile(`${outDir}/result.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
