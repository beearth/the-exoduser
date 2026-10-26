// VFX 총괄: 원소 피격 임팩트 시트 A/B 실게임 캡처 (2026-10-26)
//  - 정규 부팅(qa_vfx_hitflash_capture.mjs와 같은 경로) 후, 플레이어 주변에 원소별 임팩트를 단계별로 고정 배치해 캡처.
//  - --sheets=<폴더> 를 주면 assets/vfx/impact_el*_sheet.png·impact_basic_sheet.png 요청만 그 폴더 파일로 바꿔 응답(저장소 파일 불변).
//  - 시간 고정: ml을 크게 잡고 t를 비율로 넣어 p=t/ml이 사실상 멈추게 한다(게임 update는 정상 진행).
// 사용: node tools/vfx/capture_hit_impacts.mjs --label=old|new [--sheets=<dir>] [--out=<dir>]
import { chromium } from 'playwright';
import { readFileSync, existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ARG = new Map(process.argv.slice(2).map(a => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] ?? '1'] : [a, '1']; }));
const LABEL = ARG.get('label') || 'cap';
const SHEETS = ARG.get('sheets') || '';
const OUT = ARG.get('out') || os.tmpdir();
const ORIGIN = ARG.get('origin') || 'http://[::1]:3333';
const sleep = ms => new Promise(r => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });

const ctx = await chromium.launchPersistentContext(mkdtempSync(path.join(os.tmpdir(), 'exo-vfx-ab-')), {
  headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  viewport: { width: 1920, height: 1080 },
  args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--no-first-run'],
});
for (const pat of ['**/api/save', '**/api/mats']) await ctx.route(pat, r => r.request().method() === 'POST' ? r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }) : r.continue());
if (SHEETS) {
  await ctx.route(/assets\/vfx\/(impact_el\d_(boss_)?sheet|impact_basic_sheet)\.png/, r => {
    const name = r.request().url().match(/assets\/vfx\/([^?]+)/)[1];
    const f = path.join(SHEETS, name);
    if (!existsSync(f)) return r.continue();
    return r.fulfill({ status: 200, contentType: 'image/png', body: readFileSync(f) });
  });
}
const page = ctx.pages()[0] || await ctx.newPage();
const errors = []; page.on('pageerror', e => errors.push(String(e.message).slice(0, 200)));
await page.goto(ORIGIN + '/game.html', { waitUntil: 'commit' });
await page.waitForFunction(() => { try { return _cutsceneState === 'INTRO_CUTSCENE' || (G.on && !_cutsceneState); } catch (e) { return false; } }, null, { timeout: 90000, polling: 250 }).catch(() => {});
for (let i = 0; i < 3; i++) { await sleep(1500); const still = await page.evaluate(() => { try { if (_cutsceneState === 'INTRO_CUTSCENE') { _cutsceneEnd(); return true; } } catch (e) {} return false; }); if (!still) break; }
for (let i = 0; i < 20; i++) { const st = await page.evaluate(() => { try { if (G.on && !_cutsceneState) return 'on'; } catch (e) {} const b = [...document.querySelectorAll('button')].find(b => b.offsetParent !== null && /^(건너뛰기|Skip)$/.test(b.textContent.trim())); if (b) { b.click(); return 'clicked'; } return 'wait'; }).catch(() => 'wait'); if (st === 'on') break; await sleep(700); }
await page.waitForFunction(() => { try { return G.on && !G.paused && P && !_cutsceneState && _bmcDone; } catch (e) { return false; } }, null, { timeout: 120000, polling: 250 });
await sleep(3000);
await page.evaluate(() => { const b = document.querySelector('.lesson-skip'); if (b && b.offsetParent !== null) b.click(); });
await sleep(5000);

// 게임은 프레임당 임팩트 4개만 그린다(_IMP_DRAW_MAX=4) → 장면당 4개씩 여러 장 캡처
await page.evaluate(() => {
  try { P.iframes = 99999; for (const e of ens) if (e && e.alive && !e.ib) e.x += 5000; } catch (e) {}
  window.__keepImp = setInterval(() => { try { if (P.hp < P.mhp) P.hp = P.mhp; } catch (e) {} }, 200);
});
const ML = 1e9, PH = [0.06, 0.18, 0.34, 0.55];
const scenes = [];
for (const el of [0, 1, 2, 3, 4, 5]) scenes.push({ name: `el${el}`, el, boss: false });
for (const el of [1, 4]) scenes.push({ name: `boss_el${el}`, el, boss: true });
const info = [];
for (const sc of scenes) {
  const r = await page.evaluate(({ sc, ML, PH }) => {
    _impacts.length = 0;
    const gap = sc.boss ? 230 : 120;
    PH.forEach((p, c) => _impacts.push({ x: P.x - gap * 1.5 + c * gap, y: P.y - 140, el: sc.el, ang: -0.6, t: p * ML, ml: ML, sz: sc.boss ? 2.5 : 1.0, type: 'slash', boss: sc.boss }));
    return { n: _impacts.length, img: (sc.boss ? _impElBossSpr : _impElSpr)[sc.el].naturalWidth };
  }, { sc, ML, PH });
  await sleep(400);
  const n2 = await page.evaluate(() => _impacts.length);
  await page.screenshot({ path: path.join(OUT, `hit_ab_${LABEL}_${sc.name}.png`), clip: { x: 960 - 520, y: 540 - 140 - 200, width: 1040, height: 400 } });
  info.push({ ...sc, ...r, after: n2 });
}
writeFileSync(path.join(OUT, `hit_ab_${LABEL}.json`), JSON.stringify({ info, errors }, null, 1));
console.log(LABEL, JSON.stringify(info), 'errors', errors.length);
await ctx.close();
