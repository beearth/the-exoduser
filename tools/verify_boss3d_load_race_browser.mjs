import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const outputDir = 'tmp/boss3d-load-race';
const resultPath = `${outputDir}/result.json`;

await mkdir(outputDir, { recursive: true });

let raceEnabled = false;
let delayedVineLoads = 0;
const modelLoads = [];
const errors = [];
const consoleMessages = [];
let browser;
let page;

try {
  browser = await chromium.launch({
    headless: false,
    executablePath: chromePath,
    args: ['--enable-webgl', '--ignore-gpu-blocklist'],
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  await context.route('**/assets/3d/*.glb', async (route) => {
    const url = route.request().url();
    if (url.endsWith('Meshy_AI_Vinebound_Sentinel_biped_Animation_Idle_withSkin.glb') || url.endsWith('Meshy_AI_1_biped_Animation_Alert_withSkin.glb')) {
      const response = await route.fetch();
      if (raceEnabled && url.endsWith('Meshy_AI_Vinebound_Sentinel_biped_Animation_Idle_withSkin.glb') && delayedVineLoads++ === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }
      await route.fulfill({
        response,
        body: await response.body(),
        headers: { ...response.headers(), 'cache-control': 'no-store' },
      });
      return;
    }
    await route.continue();
  });
  page = await context.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    consoleMessages.push(`[${message.type()}] ${message.text()}`);
    if (message.type() === 'error') errors.push(message.text());
    const match = message.text().match(/^\[BOSS3D\] Model loaded \(hell:(-?\d+)\)/);
    if (match) modelLoads.push(Number(match[1]));
  });

  await page.goto('http://127.0.0.1:3333/game.html?test=1&testchar=1', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);
  const b3LoaderType = await page.evaluate(() => typeof window._b3loadModel);
  if (b3LoaderType !== 'function') throw new Error(`window._b3loadModel unavailable: ${b3LoaderType}`);

  modelLoads.length = 0;
  raceEnabled = true;
  await page.evaluate(() => {
    window._b3loadModel(0);
    window._b3loadModel(1);
    window._b3loadModel(0);
  });
  await page.waitForFunction(() => {
    const anchor = window._b3dbg?.pivot?.parent;
    return window._b3dbg?.size?.x > 2.5 && anchor?.parent?.children.length === 4 && anchor.children.length === 1;
  }, null, { timeout: 60000 });
  await page.waitForTimeout(300);

  const sceneState = await page.evaluate(() => {
    const anchor = window._b3dbg?.pivot?.parent;
    return { sceneChildren: anchor?.parent?.children.length, anchorChildren: anchor?.children.length };
  });
  const result = { modelLoads, errors, b3LoaderType, delayedVineLoads, sceneState };
  await writeFile(resultPath, JSON.stringify(result, null, 2));
  if (errors.length || modelLoads.length !== 1 || modelLoads[0] !== 0 || sceneState.sceneChildren !== 4 || sceneState.anchorChildren !== 1) {
    throw new Error(`boss3d async race regression failed: ${JSON.stringify(result)}`);
  }
  console.log(JSON.stringify(result));
} catch (error) {
  await writeFile(resultPath, JSON.stringify({ modelLoads, errors, consoleMessages, failure: error.message }, null, 2));
  throw error;
} finally {
  if (browser) await browser.close();
}
