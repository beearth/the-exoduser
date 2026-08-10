import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1000, height: 900 }, deviceScaleFactor: 1 });
await page.goto('http://127.0.0.1:3333/game.html', { waitUntil: 'networkidle', timeout: 30000 });
await page.screenshot({ path: 'tmp/healing-domain-recon.png' });
console.log('title:', await page.title());
console.log('buttons:', await page.locator('button').allInnerTexts());
console.log('canvas:', await page.locator('canvas').count());
await browser.close();
