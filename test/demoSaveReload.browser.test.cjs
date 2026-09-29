const test = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

for(const file of ['game.html','game-easy-test.html'])test(`${file} demo starts with Spike Trap in slot 1 and preserves skill assignments`, { timeout: 120000 }, async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  try {
    const context = await browser.newContext(); // Isolated storage; never touches the player's save.
    const page = await context.newPage();
    await page.route('**/*', route => {
      const request = route.request();
      if(new URL(request.url()).pathname.startsWith('/api/')&&request.method()!=='GET')return route.abort();
      if(new URL(request.url()).pathname==='/api/mats')return route.fulfill({json:{ok:true,mats:1000}});
      if (['image', 'media', 'font'].includes(request.resourceType())) return route.abort();
      return route.continue();
    });
    await page.goto(`http://localhost:3333/${file}?demo=1`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => _dbReady === true && typeof P === 'object', { timeout: 30000 });
    const initial = await page.evaluate(() => ({lv:P.lv, trap:P.skills.spikeTrap, slots:[...SKILL_SLOTS]}));
    assert.equal(initial.lv, 1);
    assert.equal(initial.trap, 1);
    assert.equal(initial.slots[0], 'spikeTrap');
    assert.equal(initial.slots[4], 'giantSlam');
    assert.equal(initial.slots[5], 'holyDome');
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
       slot1: SKILL_SLOTS[0], trap: P.skills.spikeTrap,
    }));
    // The full progress-save contract belongs to game.html; the easy harness has a legacy serializer.
    if(file==='game.html')assert.deepEqual(restored, {
      lv: 7, transLvCount: 2, fuseProfSec: 25,
      grit: 3, kills: 41, mats: 4321, playTime: 777,
      slot1: 'spikeTrap', trap: 1,
    });
    else assert.deepEqual({lv:restored.lv,kills:restored.kills,slot1:restored.slot1,trap:restored.trap}, {lv:7,kills:41,slot1:'spikeTrap',trap:1});
    // Player-chosen placements survive a restart rather than being forced back to slot 1.
    await page.evaluate(async()=>{G.paused=true;SKILL_SLOTS[0]=null;SKILL_SLOTS[1]='spikeTrap';await dbSave();});
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>_dbReady===true&&typeof P==='object',{timeout:30000});
    assert.deepEqual(await page.evaluate(()=>SKILL_SLOTS.slice(0,2)),[null,'spikeTrap']);
    // Old saves produced by the missing initial assignment recover through the existing restore path.
    await page.evaluate(async()=>{G.paused=true;P.lv=1;SKILL_SLOTS[0]=null;SKILL_SLOTS[1]=null;await dbSave();});
    await page.reload({waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>_dbReady===true&&typeof P==='object',{timeout:30000});
    assert.equal(await page.evaluate(()=>SKILL_SLOTS[0]),'spikeTrap');
  } finally {
    await browser.close();
  }
});
