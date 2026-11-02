const fs = require('fs');
const path = require('path');
const { chromium } = require(path.join(process.env.EXO_NODE_MODULES || 'G:/exoduser/node_modules', 'playwright'));
const out = process.argv[2];
const boss = process.argv[3] === 'boss';
if (!out) throw new Error('output directory required');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  // Disallow writes to the shared server. This run has a fresh browser context and a unique test slot.
  await context.route('**/api/**', async route => {
    if (!['GET', 'HEAD'].includes(route.request().method())) return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"qaWriteBlocked":true}' });
    return route.continue();
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const url = 'http://127.0.0.1:3333/game.html?classic=1&test=1' + (boss ? '&bosstest=0' : '') + '&slot=FULLRUN_QA_' + Date.now();
  const rows = [];
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    for (let i = 0; i < 45; i++) {
      const state = await page.evaluate(() => {
        try { if (typeof Howler !== 'undefined') Howler.mute(true); if (typeof BGM !== 'undefined' && BGM.setVolume) BGM.setVolume(0); } catch (_) {}
        if (typeof _cutsceneState !== 'undefined' && _cutsceneState === 'INTRO_CUTSCENE' && typeof _cutsceneEnd === 'function') _cutsceneEnd();
        return { on: typeof G !== 'undefined' && G.on, intro: typeof G !== 'undefined' && !!G._intro };
      });
      if (state.on && !state.intro) break;
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }
    await page.evaluate(() => {
      try { if (window._parryLesson && _parryLesson.skipAll) _parryLesson.skipAll(); if (window._systemLesson && _systemLesson.skipAll) _systemLesson.skipAll(); } catch (_) {}
      if (typeof G !== 'undefined') G.paused = false;
    });
    for (let i = 0; i < 7; i++) {
      const row = await page.evaluate(() => ({ on: typeof G !== 'undefined' && G.on, p: typeof P !== 'undefined' ? { x: P.x, y: P.y, hp: P.hp, level: P.lv } : null, g: typeof G !== 'undefined' ? { kills: G.kills, paused: G.paused, stage: G.stage } : null }));
      rows.push(row);
      await page.screenshot({ path: path.join(out, `field-${i * 10}.png`) });
      await page.mouse.move(1150, 500); await page.mouse.down();
      if (i % 2 === 0) await page.keyboard.down('a'); else await page.keyboard.down('d');
      await page.waitForTimeout(10000);
      await page.keyboard.up('a'); await page.keyboard.up('d'); await page.mouse.up();
    }
    await page.keyboard.press('Tab'); await page.waitForTimeout(400); await page.screenshot({ path: path.join(out, 'inventory.png') });
    await page.keyboard.press('Tab'); await page.keyboard.press('k'); await page.waitForTimeout(400); await page.screenshot({ path: path.join(out, 'skills.png') });
  } finally {
    fs.writeFileSync(path.join(out, 'receipt.json'), JSON.stringify({ scope: 'Live origin/main 3333 classic; input reference, supported story/practice skip; server writes blocked; no full-clear claim', fixture: boss ? 'web bosstest=0 direct arena entry' : 'new field', url, rows, errors }, null, 2));
    await browser.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
