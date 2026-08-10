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
  const result = await page.evaluate(() => ({
    hasCanvas: !!G._dvgCvs,
    stageMatches: G._dvgStage === G.stage,
    widthMatches: G._dvgW === C.width,
    canvasMatches: G._dvgCvs?.width === C.width && G._dvgCvs?.height === C.height,
  }));
  const output = { result, errors };
  if (!result.hasCanvas || !result.stageMatches || !result.widthMatches || !result.canvasMatches || errors.length) throw new Error(JSON.stringify(output));
  console.log(JSON.stringify(output));
} finally {
  if (browser) await browser.close();
}
