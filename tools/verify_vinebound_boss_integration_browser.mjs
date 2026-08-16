import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const outputDir = 'tmp/vinebound-boss-integration';
await mkdir(outputDir, { recursive: true });

const errors = [];
const bossLogs = [];
const failedResponses = [];
let browser;

try {
  browser = await chromium.launch({
    headless: false,
    executablePath: chromePath,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => { if (response.status() >= 400) failedResponses.push({ status: response.status(), url: response.url() }); });
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
    if (message.text().startsWith('[BOSS3D]')) bossLogs.push(message.text());
  });

  await page.goto('http://127.0.0.1:3333/game.html?test=1&testchar=1', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForFunction(() => typeof P !== 'undefined' && typeof G !== 'undefined' && G.on, null, { timeout: 60000 });
  await page.locator('#c').click({ position: { x: 20, y: 20 } });

  const entry = await page.evaluate(() => {
    G._bossUnlocked = true;
    const exit = G.exits[~~(G.exits.length / 2)];
    P.x = (exit.x + .5) * T;
    P.y = (exit.y + .5) * T;
    P.iframes = 99999;
    return { stage: G.stage, exit, bossUnlocked: G._bossUnlocked };
  });
  await page.waitForFunction(() => G._bossArena && !!findBoss() && window._b3Active && !!window._b3dbg, null, { timeout: 60000 });
  await page.waitForFunction(() => window._b3dbg?.size?.x > 2.5, null, { timeout: 60000 });
  await page.evaluate(() => {
    const boss = findBoss();
    P.x = boss.x;
    P.y = boss.y + 140;
    G.cam.x = P.x;
    G.cam.y = P.y;
  });
  await page.waitForTimeout(2500);

  const clip = async (name) => {
    const box = await page.locator('#boss3dCvs').boundingBox();
    if (box) await page.screenshot({ path: `${outputDir}/${name}.png`, clip: box });
  };
  const holdState = async (state) => page.evaluate((next) => {
    clearInterval(window.__vineboundStateHold);
    window.__vineboundStateHold = setInterval(() => {
      const boss = findBoss();
      if (!boss) return;
      boss.s = next;
      boss.stunned = 0;
      boss.vx = 0;
      boss.vy = 0;
    }, 16);
  }, state);

  await holdState('idle');
  await page.waitForTimeout(300);
  await clip('idle-a');
  await page.waitForTimeout(5200);
  await clip('idle-loop');
  await holdState('eWalk');
  await page.waitForTimeout(350);
  await clip('walk');
  await holdState('bossDash');
  await page.waitForTimeout(350);
  await clip('run');
  await holdState('bossSlam');
  await page.waitForTimeout(350);
  await clip('slam');
  await holdState('idle');
  await page.waitForTimeout(350);
  await clip('idle-return');

  const hpSync = await page.evaluate(() => {
    const boss = findBoss();
    const before = boss.hp;
    boss.hp = Math.floor(boss.mhp * .8);
    return { before, after: boss.hp, max: boss.mhp };
  });
  await page.waitForTimeout(300);
  const hpBarWidth = await page.locator('#bossBar .bhf').evaluate((el) => getComputedStyle(el).width);

  bossLogs.length = 0;
  await page.evaluate(() => { G.stage = 4; });
  await page.waitForFunction(() => window._b3Active, null, { timeout: 5000 });
  await page.waitForTimeout(1800);
  await page.evaluate(() => { G.stage = 0; });
  await page.waitForTimeout(2200);
  await clip('chapter1-after-swap');
  await page.evaluate(() => { clearInterval(window.__vineboundStateHold); G.stage = 0; });

  const runtime = await page.evaluate(() => {
    const boss = findBoss();
    return {
      bossArena: G._bossArena,
      active: window._b3Active,
      stage: G.stage,
      bossAlive: !!boss?.alive,
      bossState: boss?.s,
      foot: { x: window._b3footScreenX, y: window._b3footScreenY },
      overlayCanvas: !!document.querySelector('#boss3dCvs'),
      overlay: (() => {
        const pivot = window._b3dbg?.pivot;
        const model = pivot?.children?.[0];
        const anchor = pivot?.parent;
        return pivot ? {
          anchorVisible: anchor.visible,
          anchorPosition: anchor.position.toArray(),
          pivotPosition: pivot.position.toArray(),
          pivotRotation: pivot.rotation.toArray(),
          pivotScale: pivot.scale.toArray(),
          modelPosition: model?.position.toArray(),
          modelVisible: model?.visible,
          modelChildren: model?.children.length,
          footAlignmentPx: Math.abs(document.querySelector('#boss3dCvs').clientHeight / 2 - anchor.position.y - window._b3footScreenY),
          meshes: (() => {
            const meshes = [];
            model?.traverse((node) => {
              if (!node.isMesh) return;
              const material = Array.isArray(node.material) ? node.material[0] : node.material;
              node.geometry.computeBoundingBox();
              meshes.push({
                visible: node.visible,
                materialVisible: material?.visible,
                opacity: material?.opacity,
                transparent: material?.transparent,
                bboxMin: node.geometry.boundingBox?.min.toArray(),
                bboxMax: node.geometry.boundingBox?.max.toArray(),
              });
            });
            return meshes;
          })(),
        } : null;
      })(),
    };
  });
  const result = { entry, hpSync, hpBarWidth, runtime, bossLogs, errors, failedResponses };
  await writeFile(`${outputDir}/result.json`, JSON.stringify(result, null, 2));
  if (errors.length || failedResponses.length || !runtime.bossArena || !runtime.active || !runtime.bossAlive || runtime.overlay?.footAlignmentPx > 2 || runtime.overlay?.pivotScale?.[1] > 90 || bossLogs.filter((line) => /Model loaded \(hell:(1|0)\)/.test(line)).join('|') !== '[BOSS3D] Model loaded (hell:1) 1.9x2.2x1.8|[BOSS3D] Model loaded (hell:0) 2.7x2.2x1.2') {
    throw new Error(`vinebound integration failed: ${JSON.stringify(result)}`);
  }
  console.log(JSON.stringify(result));
} finally {
  if (browser) await browser.close();
}
