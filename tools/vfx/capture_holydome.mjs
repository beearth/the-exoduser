// VFX 총괄: 회복의 영역(holyDome) 웹 기준 캡처 (2026-10-28, VFX-D19 웹|Unity 1:1 대조용)
//  - 정규 부팅(capture_hit_impacts.mjs와 같은 경로) 후 플레이어 위치에 activateHolyDome()을 실제로 시전하고 전개(15틱)가 끝난 뒤 캡처.
//  - 장면 dome: 장판만 / bullets: 같은 장판 위에 드루이드 독탄(spawnProj _druidPoison) 4발 + 일반 화염탄 3발을 정지 상태로 겹침.
//  - 창 없음·소리 없음, 임시 프로필은 OUT 아래에 만들고 끝나면 삭제.
// 사용: node tools/vfx/capture_holydome.mjs [--out=<dir>] [--origin=http://[::1]:3333]
import { chromium } from 'playwright';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';

const ARG = new Map(process.argv.slice(2).map(a => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] ?? '1'] : [a, '1']; }));
const OUT = ARG.get('out') || 'E:/exoduser-wt/_out/vfx_holydome';
const ORIGIN = ARG.get('origin') || 'http://[::1]:3333';
const sleep = ms => new Promise(r => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });

const PROF = mkdtempSync(path.join(OUT, 'prof-'));
const ctx = await chromium.launchPersistentContext(PROF, {
  headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  viewport: { width: 1920, height: 1080 },
  args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--no-first-run'],
});
try {
  for (const pat of ['**/api/save', '**/api/mats']) await ctx.route(pat, r => r.request().method() === 'POST' ? r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }) : r.continue());
  const page = ctx.pages()[0] || await ctx.newPage();
  const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
  await page.goto(ORIGIN + '/game.html', { waitUntil: 'commit' });
  await page.waitForFunction(() => { try { return _cutsceneState === 'INTRO_CUTSCENE' || (G.on && !_cutsceneState); } catch (e) { return false; } }, null, { timeout: 90000, polling: 250 }).catch(() => {});
  for (let i = 0; i < 3; i++) { await sleep(1500); const still = await page.evaluate(() => { try { if (_cutsceneState === 'INTRO_CUTSCENE') { _cutsceneEnd(); return true; } } catch (e) {} return false; }); if (!still) break; }
  for (let i = 0; i < 20; i++) {
    const st = await page.evaluate(() => { try { if (G.on && !_cutsceneState) return 'on'; } catch (e) {} const b = [...document.querySelectorAll('button')].find(b => b.offsetParent !== null && /^(건너뛰기|Skip)$/.test(b.textContent.trim())); if (b) { b.click(); return 'skip'; } return 'wait'; });
    if (st === 'on') break; await sleep(1000);
  }
  await page.waitForFunction(() => { try { return G.on && !G.paused && P && !_cutsceneState && _bmcDone; } catch (e) { return false; } }, null, { timeout: 120000, polling: 250 });
  await sleep(3000);
  await page.evaluate(() => { const b = document.querySelector('.lesson-skip'); if (b && b.offsetParent !== null) b.click(); });
  await sleep(4000);
  await page.evaluate(() => { P.iframes = 99999; for (const e of ens) if (e && e.alive && !e.ib) e.x += 5000; projs.length = 0; });
  await sleep(1000);
  await page.screenshot({ path: path.join(OUT, 'web_holydome_none.png') });   // 같은 위치·장판 없음: 장판이 더하는 밝기 = dome - none
  await page.evaluate(() => {
    P._hdCd = 0; if (!P.skills.holyDome) P.skills.holyDome = 1; activateHolyDome();
    window.__keep = setInterval(() => { try { P.hp = P.mhp; P.iframes = 99999; } catch (e) {} }, 100);
  });
  await sleep(1500);
  const info = await page.evaluate(() => { const z = (G._fireZones || []).find(z => z.type === 'holyDome'); return z ? { r: z.r, t: z.t, maxT: z.maxT, px: P.x, py: P.y, zx: z.x, zy: z.y, camX: G.cam.x, camY: G.cam.y, cw: C.width, ch: C.height } : null; });
  await page.screenshot({ path: path.join(OUT, 'web_holydome_dome.png') });
  await page.evaluate(() => {
    const pts = [[-150, -210], [190, -70], [-260, 120], [60, 250]];
    for (const [dx, dy] of pts) spawnProj({ x: P.x + dx, y: P.y + dy, vx: 0, vy: 0, sz: 5, r: 4, dmg: 0, life: 6000, _druidPoison: true });
    for (const [dx, dy] of [[250, 190], [-60, -330], [330, -260]]) spawnProj({ x: P.x + dx, y: P.y + dy, vx: .0001, vy: 0, sz: 3, r: 4, el: 1, dmg: 0, life: 6000 });
  });
  await sleep(500);
  await page.screenshot({ path: path.join(OUT, 'web_holydome_bullets.png') });
  writeFileSync(path.join(OUT, 'web_holydome.json'), JSON.stringify({ info, errors }, null, 1));
  console.log(JSON.stringify(info), 'errors', errors.length);
} finally {
  await ctx.close();
  try { rmSync(PROF, { recursive: true, force: true }); } catch (e) {}
}
