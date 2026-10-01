/* ============================================================================
 * MAP-20261002-CLEANUP-RETRY 회귀 — 초기hidden/정리재시도/중복start 부분정리
 *   node tools/team-followup-20261001/MAP/cleanup-retry-fixture.cjs
 *
 * root persistence 재현기(root-review/persistence-cycle-counterexamples.mjs)의
 * 2반례와 동일 환경으로 RED→GREEN을 검증하고, 재시도 성공·중복 start 부분정리
 * 예외(핸들 유실 방지)까지 확인한다. 게임/브라우저/서버 미기동(vm 오프라인).
 * ========================================================================== */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const SRC = fs.readFileSync(path.join(__dirname, 'manual-input-observer.js'), 'utf8');

let PASS = 0, FAIL = 0; const log = [];
function check(name, cond, detail) {
  if (cond) { PASS++; console.log('  PASS ' + name); }
  else { FAIL++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
  log.push({ name, ok: !!cond, detail: cond ? undefined : detail });
}

function mapEnv({ failRemoveOnce = false } = {}) {
  const listeners = new Map(), timers = new Map();
  let next = 0, removeFails = failRemoveOnce ? 1 : 0;
  function target() {
    return {
      hidden: false, _hasFocus: true,
      hasFocus() { return this._hasFocus; },
      addEventListener(type, fn) { listeners.set(fn, type); },
      removeEventListener(type, fn) { if (removeFails > 0) { removeFails--; throw new Error('one-time remove'); } listeners.delete(fn); },
    };
  }
  const doc = target(), root = target();
  Object.assign(root, {
    document: doc,
    G: { stage: 0, map: Array.from({ length: 200 }, () => Array(200).fill(0)) },
    P: { x: 6660, y: 6140 }, K: { KeyS: true }, T: 40, isW: () => false,
    performance: { now: () => 10 }, AbortController, console: { error() {}, log() {} },
    setInterval(fn) { const id = ++next; timers.set(id, fn); return id; },
    clearInterval(id) { timers.delete(id); },
  });
  root.window = root;
  vm.runInNewContext(SRC, root);
  return {
    root, doc, listeners, timers,
    step() { for (const fn of [...timers.values()]) fn(); },
    fire(type) { for (const [fn, t] of [...listeners]) if (t === type) fn({ type }); },
    keydown(code) { for (const [fn, t] of [...listeners]) if (t === 'keydown') fn({ type: 'keydown', code }); },
  };
}

// ── CR1 초기 hidden → 표본 0 ─────────────────────────────────────────────────
console.log('\n[CR1] 시작 시 doc.hidden=true → 표본/leg 0');
{
  const e = mapEnv(); e.doc.hidden = true;
  const ctl = e.root._m5manualStart();
  e.step();
  const r = ctl.stop();
  const samples = r.legs.reduce((n, l) => n + l.samples.length, 0);
  check('CR1a GREEN: 표본 0', samples === 0, 'samples=' + samples);
  check('CR1b leg 0', r.legs.length === 0);
  check('CR1c start-hidden 기록', r.focusEvents.some((x) => x.type === 'start-hidden'));
}

// ── CR1' 초기 unfocused(hasFocus=false) → 표본 0 ────────────────────────────
console.log('\n[CR1\'] 시작 시 hasFocus()=false → 표본 0');
{
  const e = mapEnv(); e.doc._hasFocus = false;
  const ctl = e.root._m5manualStart();
  e.step();
  const r = ctl.stop();
  check('CR1\'a GREEN: 표본 0', r.legs.reduce((n, l) => n + l.samples.length, 0) === 0);
  check('CR1\'b start-unfocused 기록', r.focusEvents.some((x) => x.type === 'start-unfocused'));
}

// ── CR2 초기 hidden 후 명시적 visible+keydown으로 재개 ────────────────────────
console.log('\n[CR2] 초기 hidden → visible+새 keydown 재개');
{
  const e = mapEnv(); e.doc.hidden = true;
  const ctl = e.root._m5manualStart();
  e.step();                                  // 숨김 → 0
  e.doc.hidden = false; e.fire('visibilitychange'); // 명시적 visible 복귀
  e.step();                                  // 새 keydown 없음 → 여전히 0
  const mid = ctl._state.legs.reduce((n, l) => n + l.samples.length, 0) + (ctl._state.cur ? ctl._state.cur.samples.length : 0);
  e.keydown('KeyS'); e.step(); e.step();     // 새 입력 → 재개
  const r = ctl.stop();
  const total = r.legs.reduce((n, l) => n + l.samples.length, 0);
  check('CR2a visible만으로는 재개 안 함', mid === 0, 'mid=' + mid);
  check('CR2b 새 keydown 후 재개', total > 0, 'total=' + total);
}

// ── CR3 clearInterval 1회 예외 → 재시도로 정리(핸들 보존) ─────────────────────
console.log('\n[CR3] clearInterval 1회 실패 → stop 재시도로 GREEN');
{
  const e = mapEnv();
  let fail = true;
  e.root.clearInterval = (id) => { if (fail) throw new Error('one-time failure'); e.timers.delete(id); };
  const ctl = e.root._m5manualStart();
  const r1 = ctl.stop();                     // 1차: 실패 → 핸들 보존, partial
  check('CR3a 1차 실패 시 cleanup=partial', r1.cleanup === 'partial-unknown-retry-possible', String(r1.cleanup));
  check('CR3b 1차 실패 시 핸들 보존(null 아님)', ctl._state.interval !== null, 'handle=' + ctl._state.interval);
  check('CR3c 1차 후 잔여 timer 1', e.timers.size === 1, 'timers=' + e.timers.size);
  check('CR3d teardownErrors에 retry 기록', (r1.teardownErrors || []).some((x) => x.op === 'clearInterval' && x.retry === true));
  fail = false;
  const r2 = ctl.stop();                     // 2차: 재시도 성공
  check('CR3e GREEN: 재시도 후 timer 0', e.timers.size === 0, 'timers=' + e.timers.size);
  check('CR3f GREEN: 핸들 null', ctl._state.interval === null);
  check('CR3g GREEN: cleanup=ok', r2.cleanup === 'ok', String(r2.cleanup));
}

// ── CR4 removeEventListener 1회 예외 → 재시도로 정리 ─────────────────────────
console.log('\n[CR4] removeEventListener 1회 실패 → stop 재시도로 GREEN');
{
  const e = mapEnv({ failRemoveOnce: true });
  const ctl = e.root._m5manualStart();
  const before = e.listeners.size;
  const r1 = ctl.stop();                     // 1차: remove 1건 실패 → 보존
  check('CR4a 1차 cleanup=partial', r1.cleanup === 'partial-unknown-retry-possible', String(r1.cleanup));
  check('CR4b 실패 핸들 보존', ctl._state.listeners.length >= 1, 'remain=' + ctl._state.listeners.length);
  const r2 = ctl.stop();                     // 2차: 재시도 성공
  check('CR4c GREEN: listener 0', e.listeners.size === 0, 'listeners=' + e.listeners.size);
  check('CR4d GREEN: cleanup=ok', r2.cleanup === 'ok', String(r2.cleanup));
  check('CR4e 보존 핸들 소진', ctl._state.listeners.length === 0);
}

// ── CR5 중복 start 부분정리 예외 → 핸들 유실 방지(크래시 없음) ────────────────
console.log('\n[CR5] 중복 start 시 기존 인스턴스 정리 예외 → 유실 방지');
{
  const e = mapEnv({ failRemoveOnce: true }); // 첫 인스턴스 teardown의 remove 1건 실패
  const first = e.root._m5manualStart();
  let threw = false, second;
  try { second = e.root._m5manualStart(); } catch (x) { threw = true; }
  check('CR5a 중복 start가 예외로 중단되지 않음', threw === false);
  check('CR5b first는 superseded로 폐기 시도', first.getResult() && first.getResult().stopReason === 'superseded-by-new-start', first.getResult() && first.getResult().stopReason);
  check('CR5c first 부분정리 기록(partial)', first.getResult() && first.getResult().cleanup === 'partial-unknown-retry-possible', first.getResult() && first.getResult().cleanup);
  check('CR5d first 핸들 유실 안 됨(보존)', first._state.listeners.length >= 1, 'remain=' + first._state.listeners.length);
  // second는 정상 설치·정리 가능
  const r2 = second.stop();
  check('CR5e second 정상 정리(ok)', r2.cleanup === 'ok', String(r2.cleanup));
}

console.log('\n==== 결과: ' + PASS + ' PASS / ' + FAIL + ' FAIL ====');
console.log('CLEANUP_RETRY_FIXTURE_JSON ' + JSON.stringify({ pass: PASS, fail: FAIL, results: log }));
process.exit(FAIL ? 1 : 0);
