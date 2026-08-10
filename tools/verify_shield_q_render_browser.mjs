import { chromium } from 'playwright';

let browser;
try {
  browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://127.0.0.1:3333/game.html?test=1', { waitUntil: 'commit', timeout: 10000 });
  await page.waitForTimeout(5000);
  const result = await page.evaluate(async () => {
    const until = performance.now() + 10000;
    while (!_saReady && performance.now() < until) await new Promise((resolve) => setTimeout(resolve, 50));
    if (!_saReady) return { ready: false };
    while ((!_BONFIRE_BARRIER_IMG.complete || _BONFIRE_BARRIER_IMG.naturalWidth === 0) && performance.now() < until) await new Promise((resolve) => setTimeout(resolve, 50));
    _ensWarmDone = false; _wqLen = 0; _wqIdx = 0; _warmupEnsAtlas();
    while (!_saWarmDone && performance.now() < until) await new Promise((resolve) => setTimeout(resolve, 50));
    while (!_bonfireBarrierWarmDone && performance.now() < until) await new Promise((resolve) => setTimeout(resolve, 50));
    const oldState = { s: P.s, st2: P.st2, sbBurst: G._sbBurst, sbParryT: P._sbParryT, parryT: P.parryT };
    try {
      P.s = 'sBlock'; P.st2 = 999; P._sbParryT = 20; P.parryT = 0;
      const times = [];
      for (let i = 0; i < 4; i++) {
        G._sbBurst = null;
        const start = performance.now(); drawP(); times.push(performance.now() - start);
      }
      return { ready: true, warmed: _saWarmDone, bonfireWarmed: _bonfireBarrierWarmDone, bonfireReady: _BONFIRE_BARRIER_IMG.naturalWidth > 0, playerAtlasReady: !!(_atlasP_img && _atlasP_img.naturalWidth > 0), playerAtlasWarmed: _playerAtlasGpuWarmDone, times };
    } finally { Object.assign(P, { s: oldState.s, st2: oldState.st2, _sbParryT: oldState.sbParryT, parryT: oldState.parryT }); G._sbBurst = oldState.sbBurst; }
  });
  const output = { result, errors };
  if (!result.ready || !result.warmed || !result.bonfireWarmed || (result.playerAtlasReady && !result.playerAtlasWarmed) || result.times.length !== 4 || !result.times.every(Number.isFinite) || errors.length) throw new Error(JSON.stringify(output));
  console.log(JSON.stringify(output));
} finally {
  if (browser) await browser.close();
}
