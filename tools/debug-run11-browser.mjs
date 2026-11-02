// 1-1 완주 자동 검사 (디버깅 총괄, 2026-11-03) — headless·음소거·세이브 차단(POST /api 가짜 200).
// 사용: node tools/debug-run11-browser.mjs <출력폴더> [기준URL=http://127.0.0.1:3333]  (node_modules가 있는 체크아웃에서 실행)
// 단계: 컷신 스페이스 길게 → 연습 건너뛰기 → 필드 전투 → 지옥문 → 보스 아레나 → 보스전 → 처치 → 출구 → 다음 버튼.
// 보드: docs/engine/DEBUG_LEAD_BOARD_20261103.md
import { chromium } from 'playwright';
const OUT = process.argv[2]; const BASE = process.argv[3] || 'http://127.0.0.1:3333';
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--mute-audio', '--use-angle=d3d11', '--ignore-gpu-blocklist'] });
const log = []; let cur = 'boot'; const phases = [];
const keys = ['KeyW', 'KeyD', 'KeyS', 'KeyA'];
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  await page.route('**/api/**', r => r.request().method() === 'GET' ? r.continue() : r.fulfill({ status: 200, body: '{"ok":true}' }));
  page.on('pageerror', e => log.push({ at: cur, kind: 'pageerror', msg: (e.stack || e.message).split('\n').slice(0, 4).join(' | ') }));
  page.on('console', m => { const t = m.text(); if (m.type() === 'error' || /CRASH/.test(t)) log.push({ at: cur, kind: m.type(), msg: t.slice(0, 300) }); });
  page.on('response', r => { if (r.status() >= 400) log.push({ at: cur, kind: 'http' + r.status(), msg: r.url().slice(0, 200) }); });
  await page.goto(BASE + '/game.html?test=1&testchar=1&slot=dbg-run11-1103', { waitUntil: 'commit' });
  const skip = page.getByText(/연습 건너뛰기|Skip practice/).first(); await page.waitForTimeout(8000);
  for (let i = 0; i < 15; i++) { if (await skip.isVisible().catch(() => false)) { await page.waitForTimeout(1000); await skip.click(); break; } if (await page.evaluate(() => typeof G !== 'undefined' && G.on && !window._parryLesson?.active)) break; await page.keyboard.down('Space'); await page.waitForTimeout(2600); await page.keyboard.up('Space'); await page.keyboard.down('KeyW'); await page.waitForTimeout(500); await page.keyboard.up('KeyW'); await page.waitForTimeout(1500); }
  await page.waitForFunction(() => G.on, null, { timeout: 30000 });
  // 진행 검사이므로 매 입력마다 HP·무적을 채운다. 죽으면 Space가 사망 메뉴 '다시 일어서라'를 눌러 필드로 되돌아간다.
  const fight = async (n, killNear) => { for (let j = 0; j < n; j++) {
    await page.evaluate(() => { P.hp = P.mhp; P.iframes = 99999; });
    const k = keys[j % 4]; await page.keyboard.down(k);
    await page.mouse.click(700 + (j % 5) * 40, 380 + (j % 3) * 60);
    for (const s of ['Digit1', 'KeyQ', 'KeyE', 'Space', 'ShiftLeft', 'KeyF']) if (Math.random() < .3) await page.keyboard.press(s);
    await page.waitForTimeout(300); await page.keyboard.up(k);
    if (killNear) await page.evaluate(() => { for (const e of [...ens]) if (e && e.alive && e.hp > 0 && !e.ib && Math.hypot(e.x - P.x, e.y - P.y) < 700) { e.eShield = 0; hurtE(e, e.hp + 1, 0, true); } });
  } };
  const snap = async (name) => { const s = await page.evaluate(() => ({ stage: G.stage, on: G.on, arena: !!G._bossArena, bossAlive: !!G.bossAlive, cleared: !!G.stageCleared, ens: ens.filter(e => e && e.alive).length, hp: Math.round(P.hp), mhp: P.mhp, kills: G._stageKills, lv: P.lv, title: document.title })); phases.push({ name, ...s }); await page.screenshot({ path: `${OUT}/${name}.png` }); };
  cur = 'field'; await page.evaluate(() => { P.iframes = 99999; }); await fight(60, true); await snap('1_field');
  cur = 'gate'; const ent = await page.evaluate(() => { G._fbDone = true; G._bossUnlocked = true; const ex = G.exits[~~(G.exits.length / 2)]; if (!ex) return null; P.x = (ex.x + .5) * T; P.y = (ex.y + .5) * T; return ex; });
  phases.push({ name: 'gateExit', ent });
  await page.waitForFunction(() => G._bossArena && !!findBoss(), null, { timeout: 60000 }).catch(e => log.push({ at: cur, kind: 'harness', msg: 'boss arena not reached ' + e.message.slice(0, 80) }));
  await page.waitForTimeout(3000); await snap('2_arena');
  // 아레나 진입이 무적을 초기화하므로 보스전 동안 다시 건다(하니스가 플레이어 사망으로 끊기지 않게)
  cur = 'boss'; await page.evaluate(() => { P.iframes = 99999; const b = findBoss(); if (b) { P.x = b.x; P.y = b.y + 160; } }); await fight(50, false); await snap('3_bossfight');
  cur = 'bossKill'; const killTrace = [];
  for (let i = 0; i < 40; i++) {
    const st = await page.evaluate(() => { P.iframes = 99999; P.hp = P.mhp; const b = findBoss(); if (!b || !b.alive || b.hp <= 0) return null; const before = b.hp; b.eShield = 0; hurtE(b, Math.max(b.mhp * .2, 1), 0, true);
      return { before: Math.round(before), after: Math.round(b.hp), mhp: Math.round(b.mhp), s: b.s, inv: b.inv || b.invuln || b._inv || 0, phase: b.phase || b._phase || 0, alive: b.alive }; });
    if (!st) break; killTrace.push(st); await page.waitForTimeout(700);
  }
  phases.push({ name: 'killTrace', first: killTrace.slice(0, 4), last: killTrace.slice(-3), n: killTrace.length });
  await page.waitForTimeout(6000); await snap('4_bossDead');
  cur = 'exit'; const ex2 = await page.evaluate(() => { const ex = G.exits[0]; if (!ex) return null; P.x = (ex.x + .5) * T; P.y = (ex.y + .5) * T; return { ex, n: G.exits.length }; });
  phases.push({ name: 'arenaExit', ex2 });
  await page.waitForTimeout(5000); await snap('5_clear');
  cur = 'next'; const nb = page.getByText(/다음 구역으로|다음 난관으로/).first();
  if (await nb.isVisible().catch(() => false)) { await nb.click(); } else { log.push({ at: cur, kind: 'harness', msg: 'next button not visible' }); }
  await page.waitForTimeout(5000); await snap('6_after');
  console.log(JSON.stringify({ phases, log: log.slice(0, 80), logCount: log.length }, null, 1));
} catch (e) { console.log(JSON.stringify({ fatal: String(e).slice(0, 400), at: cur, phases, log: log.slice(0, 60) }, null, 1)); }
finally { await browser.close(); }
