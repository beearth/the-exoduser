/* ============================================================================
 * m5-walk-harness.safe.js mock 정적/행위 검사 (MAP-020-M5-PREFLIGHT)
 * 실게임·브라우저 없이 Node에서 하니스의 게이트/정리/중단만 검증한다.
 *   node tools/team-followup-20261001/MAP/mock-harness-check.cjs
 * 검증 항목:
 *   T1 바인드 해석: 커스텀 BINDS 읽기(변경 없음) + 기본 WASD 폴백
 *   T2 포커스/바인드/생존 착수 게이트: 미충족 시 throw & 좌표/키 미변경
 *   T3 flatline = 즉시 STOP (기록만 X)  — 검증결과 G3
 *   T4 정상 완료 시 interval 정리 + 모든 키 해제 + 맵 시그니처 불변
 *   T5 외부 AbortController 취소 시 즉시 STOP + 키 해제 + 남은 leg 미실행 — G2
 *   T6 생존 게이트: leg 도중 HP0 → STOP(player-dead) + 키 해제
 *   T7 포커스 상실: leg 도중 blur → STOP(focus-lost) + 키 해제
 * ========================================================================== */
'use strict';
const path = require('path');
const fs = require('fs');
const HARNESS = path.join(__dirname, 'm5-walk-harness.safe.js');
const HARNESS_SRC = fs.readFileSync(HARNESS, 'utf8');

let PASS = 0, FAIL = 0;
const results = [];
function check(name, cond, detail) {
  if (cond) { PASS++; results.push({ name, ok: true }); console.log('  PASS ' + name); }
  else { FAIL++; results.push({ name, ok: false, detail }); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

// ── 공용 목(mock) 구축 ─────────────────────────────────────────────────────
function makeMap() { // 200x200, 기본 벽(1), 접근 타일[153][166]=0 비벽
  const m = []; for (let y = 0; y < 200; y++) { const r = []; for (let x = 0; x < 200; x++) r.push(1); m.push(r); }
  m[153][166] = 0; // approach(6660,6140) 비벽 — coordAudit 계약과 일치
  return m;
}
function installGlobals(opts = {}) {
  global.T = 40;
  global.G = { stage: opts.stage != null ? opts.stage : 0, paused: !!opts.paused, cam: { x: 0, y: 0 }, map: makeMap() };
  global.P = { x: opts.px != null ? opts.px : 100, y: opts.py != null ? opts.py : 100, hp: opts.hp != null ? opts.hp : 100 };
  global.K = {};
  global.VW = 1600; global.VH = 900;
  if (opts.binds) global.BINDS = opts.binds; else delete global.BINDS;
  // document 스텁(포커스/가시성 제어)
  const d = { _focus: opts.focus !== false, hidden: !!opts.hidden, hasFocus() { return this._focus; }, dispatchEvent() { return true; } };
  global.document = d;
  // KeyboardEvent 미정의 — 하니스는 try/catch로 흡수(headless 경로 검증)
  delete global.KeyboardEvent;
  return d;
}
// 루트 package.json이 type:module이라 .js는 ESM으로 require되지 않는다.
// 하니스는 브라우저 콘솔용 클래식 스크립트이므로, 텍스트를 읽어 현재 CJS
// 전역(G/P/K/document)이 보이는 스코프에서 실행하고 노출된 전역 API를 쓴다.
// (실게임에서 window._m5fixRun / window._m5fixAbort 를 쓰는 것과 동일한 경로.)
function freshHarness() {
  try { delete global._m5fixApi; delete global._m5fixRun; delete global._m5fixAbort; delete global._m5fix; } catch (e) {}
  (0, eval)(HARNESS_SRC); // 전역 스코프에서 실행 → globalThis._m5fixApi 설정
  const api = global._m5fixApi;
  if (!api || typeof api.run !== 'function') throw new Error('하니스 API 노출 실패');
  return api;
}

// 간단 물리: K에 눌린 이동키 방향으로 P 이동. 남/동에 벽(clamp) → flatline 유발.
function startPhysics(realSI, speed = 8, walls = { south: 6300, east: 6740 }) {
  return realSI(() => {
    const K = global.K, P = global.P;
    if (K.KeyS || K.ArrowDown) P.y = Math.min(P.y + speed, walls.south);
    if (K.KeyW || K.ArrowUp) P.y = P.y - speed;
    if (K.KeyD || K.ArrowRight) P.x = Math.min(P.x + speed, walls.east);
    if (K.KeyA || K.ArrowLeft) P.x = P.x - speed;
  }, 20);
}

(async () => {
  const realSI = setInterval, realCI = clearInterval;

  // ── T1 바인드 해석 ──────────────────────────────────────────────────────
  console.log('\n[T1] 바인드 해석');
  {
    installGlobals({ binds: { up: 'KeyI', down: 'KeyK', left: 'KeyJ', right: 'KeyL' } });
    const snapBefore = JSON.stringify(global.BINDS);
    const h = freshHarness();
    const b = h.resolveBinds();
    check('T1a 커스텀 BINDS 읽음', b.source === 'game-binds' && b.map.N === 'KeyI' && b.map.S === 'KeyK' && b.map.E === 'KeyL' && b.map.W === 'KeyJ', JSON.stringify(b.map));
    check('T1b BINDS 원본 미변경', JSON.stringify(global.BINDS) === snapBefore);
    installGlobals({}); // BINDS 없음
    const b2 = freshHarness().resolveBinds();
    check('T1c 기본 WASD 폴백', b2.source === 'default-wasd' && b2.map.N === 'KeyW' && b2.map.S === 'KeyS' && b2.map.E === 'KeyD' && b2.map.W === 'KeyA');
  }

  // ── T2 착수 게이트(미충족 → throw, 상태 미변경) ────────────────────────
  console.log('\n[T2] 착수 게이트');
  for (const g of [
    { label: '일시정지', opt: { paused: true } },
    { label: '포커스 상실', opt: { focus: false } },
    { label: '탭 숨김', opt: { hidden: true } },
    { label: 'HP0(사망)', opt: { hp: 0 } },
    { label: 'stage!=0', opt: { stage: 3 } },
  ]) {
    installGlobals(Object.assign({ px: 11, py: 22 }, g.opt));
    const h = freshHarness();
    let threw = false, errMsg = '';
    try { await h.run(); } catch (e) { threw = true; errMsg = e.message; }
    const noCoordWrite = (global.P.x === 11 && global.P.y === 22);
    const keysClean = Object.values(global.K).every((v) => !v);
    check('T2 ' + g.label + ' → 거부(throw)', threw, errMsg);
    check('T2 ' + g.label + ' → 좌표 미변경', noCoordWrite, 'P=(' + global.P.x + ',' + global.P.y + ')');
    check('T2 ' + g.label + ' → 키 미오염', keysClean);
  }

  // ── T3/T4 정상 실행: flatline STOP + 정리 + 맵 불변 ─────────────────────
  console.log('\n[T3/T4] 정상 실행 · flatline STOP · 정리 · 맵 불변');
  {
    installGlobals({}); // 포커스 O, 생존 O, stage0
    // interval 추적: 하니스가 만든 interval만 센다(물리는 추적 전에 시작).
    const phys = startPhysics(realSI);
    const live = new Set();
    global.setInterval = (fn, ms) => { const id = realSI(fn, ms); live.add(id); return id; };
    global.clearInterval = (id) => { live.delete(id); return realCI(id); };
    const h = freshHarness();
    const out = await h.run();
    global.setInterval = realSI; global.clearInterval = realCI; // 원복
    realCI(phys);
    const reasons = out.legs.map((l) => l.stopReason);
    check('T3 flatline STOP 발생(기록만 아님)', reasons.includes('flatline-blocked'), JSON.stringify(reasons));
    check('T3 flatline leg에 blockedAt 기록', out.legs.some((l) => l.stopReason === 'flatline-blocked' && l.blockedAt));
    check('T4a run 정상 resolve(6 leg)', out.legs.length === 6);
    check('T4b SETUP 좌표배치 적용(비벽 접근점)', out.setupApplied === true && out.setupFrom);
    check('T4c 모든 이동키 해제됨', Object.values(global.K).every((v) => !v), JSON.stringify(global.K));
    check('T4d 하니스 interval 전부 정리', live.size === 0, 'live=' + live.size);
    check('T4e 맵 시그니처 불변', out.mapUnchanged === true && out.mapSig.before === out.mapSig.after);
  }

  // ── T5 외부 Abort → 즉시 STOP, 키 해제, 남은 leg 미실행 ─────────────────
  console.log('\n[T5] 외부 AbortController 취소');
  {
    installGlobals({});
    const phys = startPhysics(realSI, 2); // 느리게 → 타임아웃/플랫 전에 abort 개입
    const h = freshHarness();
    const p = h.run();
    setTimeout(() => { try { global.window ? null : null; } catch (e) {} global._m5fixAbort.abort(); }, 300);
    const out = await p;
    realCI(phys);
    const hasAbort = out.legs.some((l) => l.stopReason === 'external-abort');
    check('T5a 취소 후 external-abort STOP', hasAbort, JSON.stringify(out.legs.map((l) => l.stopReason)));
    check('T5b 취소 후 남은 leg 미실행(6 미만)', out.legs.length < 6, 'legs=' + out.legs.length);
    check('T5c 취소 후 키 해제', Object.values(global.K).every((v) => !v));
  }

  // ── T6 생존 게이트: leg 도중 HP0 → STOP ────────────────────────────────
  console.log('\n[T6] leg 도중 사망');
  {
    installGlobals({});
    const phys = startPhysics(realSI, 2);
    const h = freshHarness();
    const p = h.run();
    setTimeout(() => { global.P.hp = 0; }, 300);
    const out = await p;
    realCI(phys);
    check('T6a HP0 → player-dead STOP', out.legs.some((l) => l.stopReason === 'player-dead'), JSON.stringify(out.legs.map((l) => l.stopReason)));
    check('T6b 사망 후 키 해제', Object.values(global.K).every((v) => !v));
  }

  // ── T7 포커스 상실: leg 도중 blur → STOP ───────────────────────────────
  console.log('\n[T7] leg 도중 포커스 상실');
  {
    const d = installGlobals({});
    const phys = startPhysics(realSI, 2);
    const h = freshHarness();
    const p = h.run();
    setTimeout(() => { d._focus = false; }, 300);
    const out = await p;
    realCI(phys);
    check('T7a blur → focus-lost STOP', out.legs.some((l) => l.stopReason === 'focus-lost'), JSON.stringify(out.legs.map((l) => l.stopReason)));
    check('T7b 포커스 상실 후 키 해제', Object.values(global.K).every((v) => !v));
  }

  console.log('\n==== 결과: ' + PASS + ' PASS / ' + FAIL + ' FAIL ====');
  console.log('MOCK_RESULT_JSON ' + JSON.stringify({ pass: PASS, fail: FAIL, results }));
  process.exit(FAIL ? 1 : 0);
})();
