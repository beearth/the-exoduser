/* ============================================================================
 * owner-integration 회귀 — SKILL-OWNER-INTEGRATION-20261002
 *   실행: node tools/team-followup-20261001/SKILL/owner-integration-regression.mjs
 *
 * 검증 축:
 *   F  인수 충실도: 통합본 바디(=(function(root){…}))가 검수 지원후보와 바이트 동일.
 *   R  원 owner 결함 재현 → 통합본에서 수정 확인(설치/반환/정리 API).
 *   N  통합본 정상 경로 회귀(trace 완전→RECHARGE, trace 없음/부분→UNKNOWN,
 *      양성대조+취소→PASS, 관측 공백→UNKNOWN, 리스너 대칭, 게임 충전단위 대조).
 *
 * owner 원본(ice-cancel-probe.safe.js)과 지원후보는 읽기 전용으로만 로드한다.
 * ========================================================================= */
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => fs.readFileSync(path.join(here, p), 'utf8');
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');

const ownerSrc = read('../root-review/five-owner-before-skill.js'); // 인수 전 고정 재현본
const candSrc = read('../BALANCE/skill-support-probe.js');   // 검수 지원후보
const integSrc = read('ice-cancel-probe.safe.js'); // 실제 원담당 인수 경로
const MARK = '(function (root) {';
const body = (s) => s.slice(s.indexOf(MARK));

let pass = 0, fail = 0; const fails = [];
function check(name, fn) { try { fn(); pass++; } catch (e) { fail++; fails.push(name + ' :: ' + (e && e.message || e)); console.error('  ✗ ' + name + '\n    ' + (e && e.message || e)); } }

// ── VM 로더 + mock win 하니스(acceptance-check와 동형) ──────────────────────
function load(src) { const sb = {}; vm.runInNewContext(src, sb); return sb.IceCancelProbe; }
function harness(src, reader, options = {}) {
  const IceCancelProbe = load(src);
  const listeners = new Map(), pending = new Map(), attempts = []; let next = 0;
  const win = {
    addEventListener(type, fn) { listeners.set(type, fn); },
    removeEventListener(type) { attempts.push(type); if (options.remove === type) throw new Error('remove ' + type); listeners.delete(type); },
    requestAnimationFrame(fn) { const id = ++next; pending.set(id, fn); return id; },
    cancelAnimationFrame(id) { attempts.push('cancel:' + id); if (options.cancel) throw new Error('cancel before release'); pending.delete(id); },
  };
  const probe = IceCancelProbe.install({ win, readRaw: reader, now: () => 0 });
  return { IceCancelProbe, probe, win, listeners, pending, attempts, options,
    step() { const [id, fn] = pending.entries().next().value; pending.delete(id); fn(); } };
}
const raw = (patch) => ({ aim: false, mp: 100, stk: 0, rech: 100, zones: [], ...patch });

/* ── F: 인수 충실도 ──────────────────────────────────────────────────────── */
check('F1 통합본 바디가 검수 지원후보와 바이트 동일(재작성 아님, 그대로 인수)', () => {
  assert.equal(sha(body(integSrc)), sha(body(candSrc)));
});
check('F2 자원/전투 상수 불변(ICE_MP=40, ICE_STK=1, 리젠 1500/max 2|3)', () => {
  assert.ok(/var ICE_MP = 40;/.test(integSrc), 'ICE_MP=40');
  assert.ok(/var ICE_STK = 1;/.test(integSrc), 'ICE_STK=1');
  assert.ok(/1500/.test(body(integSrc)) && /step\.max !== 2 && step\.max !== 3/.test(body(integSrc)), '리젠 단위/최대스택 원식');
});
check('F3 통합본은 owner 원본과 다르다(결함 수정 반영)', () => {
  assert.notEqual(sha(body(integSrc)), sha(body(ownerSrc)));
});

/* ── R: 원 owner 결함 재현 → 통합본 수정 ──────────────────────────────────── */
// R1 반환API(충전): 두 끝점만으로 충전 오판 → 통합본 UNKNOWN
check('R1 owner: 두끝점 rech100/stk0→rech99/stk1을 recharge로 오판', () => {
  let s = raw({ aim: true }); const env = harness(ownerSrc, () => s);
  s = raw({ stk: 1, rech: 99 }); env.step();
  assert.equal(env.probe.dump().counts.rechargeTicks, 1); // 결함 재현
});
check('R1 통합본: 동일 두끝점은 trace 없어 UNKNOWN(충전/환급 확정 금지)', () => {
  let s = raw({ aim: true }); const env = harness(integSrc, () => s);
  s = raw({ stk: 1, rech: 99 }); env.step();
  const d = env.probe.dump();
  assert.equal(d.counts.rechargeTicks, 0);
  assert.equal(d.counts.stkRefund, 0);
  assert.equal(d.counts.unknownCharge, 1);
  assert.equal(env.probe.verdict().verdict, 'UNKNOWN');
});

// R2 설치API: 설치 중 reader throw
check('R2 owner: 설치 reader throw 시 리스너3 누수 + 예외 전파', () => {
  const IceCancelProbe = load(ownerSrc); const L = new Map(); let err;
  try {
    IceCancelProbe.install({ win: { addEventListener(t, f) { L.set(t, f); }, removeEventListener(t) { L.delete(t); }, requestAnimationFrame() { return 1; }, cancelAnimationFrame() {} }, readRaw() { throw new Error('install-reader'); } });
  } catch (e) { err = e.message; }
  assert.equal(L.size, 3); assert.equal(err, 'install-reader');
});
check('R2 통합본: 설치 reader throw 시 리스너0·예약0·UNKNOWN·미공개', () => {
  const env = harness(integSrc, () => { throw new Error('install-reader'); });
  assert.equal(env.listeners.size, 0);
  assert.equal(env.pending.size, 0);
  assert.equal(env.probe.verdict().verdict, 'UNKNOWN');
  assert.equal(env.probe._diag().disposed, true);
});

// R3 정리API: removeEventListener 예외가 나머지 정리를 막음
check('R3 owner: remove(mousedown) 예외가 이후 정리 차단(예외 전파·리스너 잔존)', () => {
  const env = harness(ownerSrc, () => raw(), { remove: 'mousedown' });
  let threw = false; try { env.probe.dispose(); } catch { threw = true; }
  assert.equal(threw, true);
  assert.equal(env.attempts.filter((v) => !v.startsWith('cancel')).length, 1); // mousedown에서 멈춤
  assert.equal(env.listeners.size, 3);
});
check('R3 통합본: remove 예외에도 나머지 정리 진행(3시도·실패1만 잔존·UNKNOWN)', () => {
  const env = harness(integSrc, () => raw(), { remove: 'mousedown' });
  env.probe.dispose();
  assert.equal(env.attempts.filter((v) => !v.startsWith('cancel')).length, 3);
  assert.equal(env.listeners.size, 1);
  assert.equal(env.probe.verdict().verdict, 'UNKNOWN');
  env.options.remove = null; env.probe.dispose();
  assert.equal(env.listeners.size, 0); // 재dispose가 다음 정리 완료
});

// R4 정리API(S1): cancelAnimationFrame 예외 시 rafId 보존·재시도
check('R4 owner: cancel 예외를 삼키고 rafId 재시도 불가(예약 영구 잔존)', () => {
  const env = harness(ownerSrc, () => raw(), { cancel: true });
  env.probe.dispose(); env.options.cancel = false; env.probe.dispose(); // 2회차는 already-disposed
  assert.equal(env.pending.size, 1); // 취소 안 됨
});
check('R4 통합본: cancel 예외 시 rafId 보존→재dispose에서 취소 성공(S1)', () => {
  const env = harness(integSrc, () => raw(), { cancel: true });
  env.probe.dispose(); const before = env.pending.size;
  env.options.cancel = false; env.probe.dispose(); const after = env.pending.size;
  assert.equal(before, 1); assert.equal(after, 0);
});

// R5 처리API(S2): rAF 중 필드 getter throw
check('R5 owner: zones getter throw가 콜백 밖으로 전파·리스너3·미dispose', () => {
  let s = raw(); const env = harness(ownerSrc, () => s);
  s = raw(); Object.defineProperty(s, 'zones', { get() { throw new Error('zones-getter'); } });
  let threw = false; try { env.step(); } catch { threw = true; }
  assert.equal(threw, true);
  assert.equal(env.listeners.size, 3);
  assert.equal(env.probe._diag().disposed, false);
});
check('R5 통합본: zones getter throw 기록·dispose·리스너0·UNKNOWN(S2)', () => {
  let s = raw(); const env = harness(integSrc, () => s);
  s = raw(); Object.defineProperty(s, 'zones', { get() { throw new Error('zones-getter'); } });
  let threw; try { env.step(); } catch (e) { threw = e.message; }
  assert.equal(env.listeners.size, 0);
  assert.equal(env.probe._diag().disposed, true);
  assert.equal(env.probe.verdict().verdict, 'UNKNOWN');
});

/* ── N: 통합본 정상 경로 ─────────────────────────────────────────────────── */
// N1 완전 2-update trace → RECHARGE 2
check('N1 완전 trace(2 update)면 RECHARGE 2, unknownCharge 0', () => {
  let s = raw({ updateSeq: 0 }); const env = harness(integSrc, () => s);
  const trace = [
    { updateSeq: 1, beforeStk: 0, beforeRech: 100, afterStk: 1, afterRech: 1500, max: 3, sp: 100 },
    { updateSeq: 2, beforeStk: 1, beforeRech: 1500, afterStk: 2, afterRech: 1500, max: 3, sp: 1500 },
  ];
  s = raw({ stk: 2, rech: 1500, updateSeq: 2, rechargeTrace: trace }); env.step();
  const d = env.probe.dump();
  assert.equal(d.counts.rechargeTicks, 2);
  assert.equal(d.counts.unknownCharge, 0);
});
// N2 부분 trace → UNKNOWN
check('N2 부분 trace면 UNKNOWN(충전 확정 금지)', () => {
  let s = raw({ updateSeq: 0 }); const env = harness(integSrc, () => s);
  const trace = [{ updateSeq: 2, beforeStk: 1, beforeRech: 1500, afterStk: 2, afterRech: 1500, max: 3, sp: 1500 }];
  s = raw({ stk: 2, rech: 1500, updateSeq: 2, rechargeTrace: trace }); env.step();
  const d = env.probe.dump();
  assert.equal(d.counts.rechargeTicks, 0);
  assert.equal(d.counts.unknownCharge, 1);
  assert.equal(env.probe.verdict().verdict, 'UNKNOWN');
});
// N3 trace 불일치(before/sp/reset/seq) → UNKNOWN
check('N3 trace 원식 위반(before/sp/afterRech/updateSeq) 모두 UNKNOWN', () => {
  for (const patch of [{ beforeRech: 99 }, { sp: 1 }, { afterRech: 99 }, { updateSeq: 2 }]) {
    let s = raw({ updateSeq: 0 }); const env = harness(integSrc, () => s);
    s = raw({ stk: 1, rech: 1500, updateSeq: 1, rechargeTrace: [{ updateSeq: 1, beforeStk: 0, beforeRech: 100, afterStk: 1, afterRech: 1500, max: 3, sp: 100, ...patch }] });
    env.step();
    assert.equal(env.probe.verdict().verdict, 'UNKNOWN', 'patch ' + JSON.stringify(patch));
    env.probe.dispose();
  }
});
// N4 양성대조 설치 + 깨끗한 취소 → PASS (trace 무관: 스택 증가 없음)
check('N4 정상 설치(양성대조)+취소, 스택증가 없음 → PASS', () => {
  const zoneB = { type: 'iceStorm', id: 'B' };
  let s = raw({ stk: 2, rech: 0 }); const env = harness(integSrc, () => s);
  s = raw({ aim: true, stk: 2, rech: 0 }); env.step();                     // 조준 ON
  s = raw({ aim: false, mp: 60, stk: 1, rech: 1500, zones: [zoneB] }); env.step(); // 설치(dStk=-1,dMp=-40)
  s = raw({ aim: true, mp: 60, stk: 1, rech: 1500, zones: [zoneB] }); env.step();  // 재조준
  s = raw({ aim: false, mp: 60, stk: 1, rech: 1500, zones: [zoneB] }); env.step(); // 취소(무변)
  const d = env.probe.dump(); const v = env.probe.verdict();
  assert.equal(d.counts.install, 1);
  assert.ok(d.counts.cancel >= 1);
  assert.equal(d.counts.unknownCharge, 0);
  assert.equal(v.verdict, 'PASS', v.reason);
});
// N5 관측 공백(null) → UNKNOWN, prev 리셋으로 공백 가로지른 delta 미산출
check('N5 null 관측(공백) → observationGaps·UNKNOWN, 공백 후 delta 0', () => {
  let s = raw({ stk: 2 }); let giveNull = false;
  const env = harness(integSrc, () => (giveNull ? null : s));
  giveNull = true; env.step();            // 공백
  giveNull = false; s = raw({ stk: 1 }); env.step(); // 공백 직후: prev=null → dStk 미산출
  const d = env.probe.dump();
  assert.ok(env.probe.verdict().reason.includes('충전 증거 부족') || env.probe.verdict().verdict === 'UNKNOWN');
  assert.equal(env.probe.verdict().verdict, 'UNKNOWN');
  assert.equal(d.counts.residualStk, 0); // 공백 가로질러 stk 2→1을 소모로 오판하지 않음
});
// N6 리스너/예약 대칭(예외 없음)
check('N6 정상 install/dispose 리스너·예약 대칭, 네임스페이스 정리, 재dispose 무해', () => {
  const env = harness(integSrc, () => raw());
  assert.equal(env.listeners.size, 3);
  assert.equal(env.pending.size, 1);
  assert.equal(env.win.__iceCancelProbe, env.probe);
  env.probe.dispose();
  assert.equal(env.listeners.size, 0);
  assert.equal(env.pending.size, 0);
  assert.equal(env.win.__iceCancelProbe, null);
  assert.equal(env.probe.dispose(), 'already-disposed');
});
// N7 게임 충전단위 대조: 리젠 완료 시 rech=stk<max?1500:0 (max 도달 시 0)
check('N7 게임 원식 충전단위: max=2 도달 완료는 afterRech=0, RECHARGE 확정', () => {
  let s = raw({ stk: 1, rech: 1500, updateSeq: 0 }); const env = harness(integSrc, () => s);
  const trace = [{ updateSeq: 1, beforeStk: 1, beforeRech: 1500, afterStk: 2, afterRech: 0, max: 2, sp: 1500 }];
  s = raw({ stk: 2, rech: 0, updateSeq: 1, rechargeTrace: trace }); env.step();
  const d = env.probe.dump();
  assert.equal(d.counts.rechargeTicks, 1);
  assert.equal(d.counts.unknownCharge, 0);
});

console.log(`\nowner-integration 회귀: ${pass} PASS / ${fail} FAIL`);
if (fail) { console.error('실패:\n - ' + fails.join('\n - ')); process.exit(1); }
process.exit(0);
