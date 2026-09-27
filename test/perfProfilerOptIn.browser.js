import assert from 'node:assert/strict';
import { test } from 'node:test';
import { chromium } from 'playwright';

test('300마리 초과에서도 일반 플레이는 진단 후킹을 설치하지 않고 perf 모드는 설치한다', async () => {
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding'],
  });
  try {
    for (const debug of [false, true]) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`http://127.0.0.1:3333/game.html?bosstest=3${debug ? '&perf=1' : ''}`, { waitUntil: 'commit' });
      await page.waitForFunction(() => typeof G !== 'undefined' && G && typeof P !== 'undefined' && P && typeof mkEn === 'function' && typeof _PERF_PROF !== 'undefined' && Array.isArray(ens), null, { timeout: 30000 });
      await page.waitForTimeout(8000);
      const alive = await page.evaluate(() => {
        G._cutsceneDone = true;
        try { _cutsceneState = null; } catch {}
        if (!(G.mw > 0)) initStage(G.stage || 3);
        G.on = true;
        let count = 0;
        for (const e of ens) if (e?.alive) count++;
        for (let i = 0; count <= 310 && i < 1500; i++) {
          const angle = i * 2.39996;
          const radius = 110 + (i % 12) * 20;
          const e = mkEn(P.x + Math.cos(angle) * radius, P.y + Math.sin(angle) * radius, G.stage, 6, false, i % 5, -1);
          if (e) { e.alive = true; ens.push(e); count++; }
        }
        return count;
      });
      assert.ok(alive > 300, `spawned ${alive} enemies`);
      await page.waitForFunction(expected => _PERF_PROF.enabled === expected, debug, { timeout: 10000 });
      const state = await page.evaluate(() => ({ enabled: _PERF_PROF.enabled, hooked: _PERF_PROF._hooked }));
      assert.deepEqual(state, { enabled: debug, hooked: debug });
      assert.deepEqual(errors, []);
      await page.close();
    }
  } finally {
    await browser.close();
  }
});
