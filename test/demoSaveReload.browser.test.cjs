const test = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

test('public demo restores saved progress after a fresh page load', { timeout: 120000 }, async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const context = await browser.newContext(); // Isolated storage; never touches the player's save.
    const page = await context.newPage();
    await page.route('**/*', route => {
      const request = route.request();
      if (['image', 'media', 'font'].includes(request.resourceType())) return route.abort();
      return route.continue();
    });
    await page.goto('http://localhost:3333/game.html?demo=1', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => _dbReady === true && typeof P === 'object', { timeout: 30000 });
    const written = await page.evaluate(async () => {
      P.lv = 7;
      P._transLvCount = 2;
      P._fuseProfSec = { spikeTrap: 25 };
      _grit = 3;
      G.kills = 41;
      G.mats = 4321;
      G.playTime = 777;
      G.on = true;
      _lastSaveTime = 0;
      doAutoSave();
      return JSON.parse(localStorage.getItem('hellsave_demo'));
    });
    assert.equal(written.player.lv, 7);
    assert.equal(written.game.mats, 4321);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => _dbReady === true && typeof P === 'object', { timeout: 30000 });
    const restored = await page.evaluate(() => ({
      lv: P.lv, transLvCount: P._transLvCount, fuseProfSec: P._fuseProfSec.spikeTrap,
      grit: _grit, kills: G.kills, mats: G.mats, playTime: G.playTime,
    }));
    assert.deepEqual(restored, {
      lv: 7, transLvCount: 2, fuseProfSec: 25,
      grit: 3, kills: 41, mats: 4321, playTime: 777,
    });
  } finally {
    await browser.close();
  }
});
