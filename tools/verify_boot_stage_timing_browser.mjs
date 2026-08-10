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
  const bootLogs = [];
  const slowAssets = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    const text = message.text();
    if (text.startsWith('[BOOT PERF]')) bootLogs.push(text);
    if (text.startsWith('[BOOT ASSET SLOW]')) slowAssets.push(text);
  });
  await page.goto('http://127.0.0.1:3333/game.html?perf=1', { waitUntil: 'commit', timeout: 10000 });
  const deadline = Date.now() + 60000;
  while (!bootLogs.length && Date.now() < deadline) await page.waitForTimeout(200);
  const output = { bootLogs, slowAssets, errors };
  if (!bootLogs.length || errors.length) throw new Error(JSON.stringify(output));
  console.log(JSON.stringify(output));
} finally {
  if (browser) await browser.close();
}
