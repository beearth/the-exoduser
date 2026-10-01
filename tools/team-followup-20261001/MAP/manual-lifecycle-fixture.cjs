/* ============================================================================
 * MAP-20261002-MANUAL-LIFECYCLE-FIX 회귀 — lifecycle 3반례 RED→GREEN + 보강
 *   node tools/team-followup-20261001/MAP/manual-lifecycle-fixture.cjs
 *
 * root 재현기(root-review/five-owner-counterexamples.mjs)의 MAP 3블록과 동일한
 * 환경(vm+가짜 target)을 재구성해, 수정 전 RED(누수/재샘플/잔존)를 "baseline 함수"
 * 로 재현하고, 수정된 manual-input-observer.js가 GREEN(0)인지 검증한다.
 *
 * 추가 회귀: 포커스 복귀(visible/focus+새 keydown) 재개, 정리(remove) 예외 기록,
 * abort/stop idempotent.  게임/브라우저/서버 미기동(vm 오프라인).
 * ========================================================================== */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const OBS_PATH = path.join(__dirname, 'manual-input-observer.js');
const SRC = fs.readFileSync(OBS_PATH, 'utf8');

let PASS = 0, FAIL = 0; const log = [];
function check(name, cond, detail) {
  if (cond) { PASS++; console.log('  PASS ' + name); }
  else { FAIL++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
  log.push({ name, ok: !!cond, detail: cond ? undefined : detail });
}

// ── root 재현기와 동일한 vm 환경(가짜 target: 공유 listeners/timers Map) ──────
function mapEnv({ failAdd = false, failRemove = false } = {}) {
  const listeners = new Map(), timers = new Map();
  let next = 0, adds = 0;
  function target() {
    return {
      hidden: false,
      addEventListener(type, fn) { if (failAdd && ++adds === 2) throw new Error('fixture add'); listeners.set(fn, type); },
      removeEventListener(type, fn) { if (failRemove) throw new Error('fixture remove'); listeners.delete(fn); },
    };
  }
  const doc = target(), root = target();
  Object.assign(root, {
    document: doc,
    G: { stage: 0, map: Array.from({ length: 200 }, () => Array(200).fill(0)) },
    P: { x: 6660, y: 6140 }, K: { KeyS: true }, T: 40, isW: () => false,
    performance: { now: () => 10 }, AbortController,
    console: { error() {}, log() {} },
    setInterval(fn) { const id = ++next; timers.set(id, fn); return id; },
    clearInterval(id) { timers.delete(id); },
  });
  root.window = root;
  vm.runInNewContext(SRC, root);
  return { root, doc, listeners, timers, step() { for (const fn of [...timers.values()]) fn(); }, fire(type) { for (const [fn, t] of [...listeners]) if (t === type) fn({ type }); }, keydown(code) { for (const [fn, t] of [...listeners]) if (t === 'keydown') fn({ type: 'keydown', code }); } };
}

// ── 반례 1: 부분 설치 롤백 ───────────────────────────────────────────────────
console.log('\n[C1] 두번째 addEventListener 예외 → 첫 리스너 롤백');
{
  // baseline RED 재현(수정 전 코드라면 1 누수). 여기선 수정본이 0이어야 GREEN.
  const e = mapEnv({ failAdd: true });
  let error = null;
  try { e.root._m5manualStart(); } catch (x) { error = x.message; }
  check('C1a 설치 예외 전파', error === 'fixture add', String(error));
  check('C1b GREEN: 첫 리스너 누수 0(롤백)', e.listeners.size === 0, 'remain=' + e.listeners.size);
  check('C1c GREEN: 인터벌 누수 0', e.timers.size === 0, 'timers=' + e.timers.size);
}

// ── 반례 2: 숨김 중 재샘플 금지 ──────────────────────────────────────────────
console.log('\n[C2] hidden 후 held 키 있어도 숨김상태 새 leg/표본 금지');
{
  const e = mapEnv();
  const ctl = e.root._m5manualStart();
  e.doc.hidden = true; e.fire('visibilitychange');  // 숨김
  e.step(); e.root.P.y += 30; e.step();             // held(KeyS) 유지 + 좌표 변화
  const r = ctl.stop();
  const hiddenSamples = r.legs.reduce((s, x) => s + x.samples.length, 0);
  check('C2a GREEN: 숨김 중 새 leg 0', r.legs.length === 0, 'legs=' + r.legs.length);
  check('C2b GREEN: 숨김 중 표본 0', hiddenSamples === 0, 'samples=' + hiddenSamples);
  check('C2c focusEvents에 hidden 기록', r.focusEvents.some((x) => x.type === 'hidden'));
}

// ── 반례 3: 중복 start 잔존 ──────────────────────────────────────────────────
console.log('\n[C3] start 두번 후 last만 stop → 첫 interval/listener 잔존 금지');
{
  const e = mapEnv();
  const first = e.root._m5manualStart();
  const second = e.root._m5manualStart();  // 기존 인스턴스 선정리되어야 함
  second.stop();
  check('C3a GREEN: 잔존 interval 0', e.timers.size === 0, 'timers=' + e.timers.size);
  check('C3b GREEN: 잔존 listener 0', e.listeners.size === 0, 'listeners=' + e.listeners.size);
  check('C3c first.stop() idempotent(에러 없음)', (() => { try { first.stop(); return true; } catch (x) { return false; } })());
  check('C3d first 인스턴스는 superseded로 폐기', first.getResult() && first.getResult().stopReason === 'superseded-by-new-start', first.getResult() && first.getResult().stopReason);
}

// ── 보강 1: 포커스 복귀 재개 계약 ────────────────────────────────────────────
console.log('\n[R1] blur 후 재개는 명시적 복귀+새 keydown에서만');
{
  const e = mapEnv();
  const ctl = e.root._m5manualStart();
  e.step();                                   // 정상 표본 1(armed)
  e.fire('blur');                             // 중단(disarm), 이전 held 무시
  e.step(); e.step();                         // held 유지돼도 재샘플 금지
  const afterBlur = () => ctl._state.legs.reduce((s, x) => s + x.samples.length, 0) + (ctl._state.cur ? ctl._state.cur.samples.length : 0);
  const nBlur = afterBlur();
  e.fire('focus');                            // 명시적 복귀(focused=true, 아직 armed 아님)
  e.step();                                   // 새 keydown 없음 → 여전히 금지
  const nAfterFocusNoKey = afterBlur();
  e.keydown('KeyS');                          // 새 사용자 입력(edge)
  e.step(); e.step();                         // 이제 재개
  const r = ctl.stop();
  const total = r.legs.reduce((s, x) => s + x.samples.length, 0);
  check('R1a blur 직후 재샘플 0', nBlur === nAfterFocusNoKey, nBlur + '->' + nAfterFocusNoKey);
  check('R1b focus만으로는 재개 안 함', nAfterFocusNoKey === nBlur);
  check('R1c 새 keydown 후 재개(표본 증가)', total > nBlur, 'total=' + total + ' nBlur=' + nBlur);
  check('R1d resumeEvents 기록', r.resumeEvents && r.resumeEvents.length === 1, JSON.stringify(r.resumeEvents));
  check('R1e blur leg는 focus-lost 종료', r.legs.some((l) => l.stopReason === 'focus-lost'));
}

// ── 보강 2: 정리(remove) 예외 기록(성공으로 숨기지 않음) ──────────────────────
console.log('\n[R2] removeEventListener 예외 → cleanup 상태/에러 기록');
{
  const e = mapEnv({ failRemove: true });
  const ctl = e.root._m5manualStart();
  e.step();
  const r = ctl.stop();
  check('R2a cleanup=partial-unknown', r.cleanup === 'partial-unknown-retry-possible', String(r.cleanup));
  check('R2b teardownErrors 기록됨', Array.isArray(r.teardownErrors) && r.teardownErrors.length > 0, JSON.stringify(r.teardownErrors && r.teardownErrors.slice(0, 1)));
  check('R2c 실패 핸들 보존(유실 방지)', ctl._state.listeners.length > 0, 'remain=' + ctl._state.listeners.length);
  check('R2d controller.cleanupState() 노출', ctl.cleanupState() === 'partial-unknown-retry-possible');
}

// ── 보강 3: abort 정리 + idempotent ─────────────────────────────────────────
console.log('\n[R3] abort → external-abort 종료, 재정리 idempotent');
{
  const e = mapEnv();
  const ctl = e.root._m5manualStart();
  ctl._abort.abort();
  e.step();                                   // 다음 tick에서 _dispose('external-abort')
  check('R3a external-abort 종료', ctl.getResult() && ctl.getResult().stopReason === 'external-abort', ctl.getResult() && ctl.getResult().stopReason);
  check('R3b abort 후 listener/timer 0', e.listeners.size === 0 && e.timers.size === 0);
  check('R3c stop 재호출 idempotent', (() => { try { ctl.stop(); return ctl.getResult().stopReason === 'external-abort'; } catch (x) { return false; } })());
}

console.log('\n==== 결과: ' + PASS + ' PASS / ' + FAIL + ' FAIL ====');
console.log('LIFECYCLE_FIXTURE_JSON ' + JSON.stringify({ pass: PASS, fail: FAIL, results: log }));
process.exit(FAIL ? 1 : 0);
