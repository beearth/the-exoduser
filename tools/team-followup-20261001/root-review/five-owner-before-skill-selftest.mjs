/* ============================================================================
 * SKILL-03 안전화 관측기 mock 자가검사 (실브라우저/게임 미실행, node 전용)
 *   대상: ./ice-cancel-probe.safe.js
 *   실행: node tools/team-followup-20261001/SKILL/ice-cancel-probe.selftest.mjs
 *
 * 검증결과.md / manifest(SKILL) 게이트를 mock으로 확인한다:
 *   T1 리스너·rAF 설치/정리 대칭(G1 cleanup)
 *   T2 재설치 시 이전 관측기 dispose → 리스너/rAF 누수 없음(G1 re-install)
 *   T3 유효표본0 → UNDETERMINED(PASS 금지)(G3)
 *   T4 양성대조(정상 설치) 포착 + 정상 설치 분류(G2, G4)
 *   T5 설치 없는 MP 감소 = OTHER_MP_SPEND로 분리(아이스스톰 아님)(G4)
 *   T6 장판 만료와 신규 설치 상쇄(net 0) 상황에서 신규 설치 식별(G5)
 *   T7 설치 없는 스택 감소 = 잔류소모 누수 신호 → SUSPECT
 * ========================================================================== */
import { fileURLToPath } from 'url';
import path from 'path';

// 관측기는 브라우저 콘솔 붙여넣기용 평문 스크립트라 export가 없다. 루트 package.json이
// type:module이므로 .js는 ESM으로 로드되고, IIFE가 globalThis.IceCancelProbe를 부수효과로 세팅한다.
const here = path.dirname(fileURLToPath(import.meta.url));
await import(path.join(here, 'ice-cancel-probe.safe.js'));
const IceCancelProbe = globalThis.IceCancelProbe;
if (!IceCancelProbe || typeof IceCancelProbe.install !== 'function') {
  console.error('로드 실패: globalThis.IceCancelProbe.install 없음'); process.exit(1);
}

let passed = 0, failed = 0;
const fails = [];
function ok(cond, msg) { if (cond) { passed++; } else { failed++; fails.push(msg); console.error('  ✗ ' + msg); } }
function eq(a, b, msg) { ok(a === b, msg + ` (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`); }

// ── mock window: addEventListener/removeEventListener 기록 + 수동 rAF 스케줄러 ──
function makeWin() {
  const live = { mousedown: [], mouseup: [], contextmenu: [] };
  const added = { mousedown: 0, mouseup: 0, contextmenu: 0 };
  const removed = { mousedown: 0, mouseup: 0, contextmenu: 0 };
  let pending = null, nextId = 1;
  const win = {
    __iceCancelProbe: null,
    addEventListener(type, fn) { if (live[type]) { live[type].push(fn); added[type]++; } },
    removeEventListener(type, fn) { if (live[type]) { const i = live[type].indexOf(fn); if (i !== -1) { live[type].splice(i, 1); removed[type]++; } } },
    requestAnimationFrame(fn) { pending = fn; return nextId++; },
    cancelAnimationFrame() { pending = null; },
  };
  return {
    win, added, removed,
    liveCount: () => live.mousedown.length + live.mouseup.length + live.contextmenu.length,
    hasPending: () => pending !== null,
    step: () => { const fn = pending; pending = null; if (fn) fn(); },
  };
}
// 고정 now로 결정적 타임스탬프
const now = () => 0;
function mkRaw(aim, mp, stk, rech, zones) { return { aim, mp, stk, rech, zones: zones || [] }; }

// ── T1: 리스너·rAF 설치/정리 대칭 ───────────────────────────────────────────
(function T1() {
  console.log('T1 리스너·rAF 설치/정리 대칭');
  const h = makeWin();
  let cur = mkRaw(false, 100, 2, 0, []);
  const p = IceCancelProbe.install({ win: h.win, readRaw: () => cur, now });
  eq(h.added.mousedown, 1, 'T1 mousedown 리스너 1 등록');
  eq(h.added.mouseup, 1, 'T1 mouseup 리스너 1 등록');
  eq(h.added.contextmenu, 1, 'T1 contextmenu 리스너 1 등록');
  eq(h.liveCount(), 3, 'T1 설치 후 활성 리스너 3');
  ok(h.hasPending(), 'T1 rAF 1건 예약됨');
  eq(h.win.__iceCancelProbe, p, 'T1 네임스페이스에 probe 등록');
  p.dispose();
  eq(h.liveCount(), 0, 'T1 dispose 후 활성 리스너 0(누수 없음)');
  ok(!h.hasPending(), 'T1 dispose 후 rAF 취소됨');
  eq(h.win.__iceCancelProbe, null, 'T1 dispose 후 네임스페이스 비움(G1)');
})();

// ── T2: 재설치 시 이전 관측기 dispose(누수 없음) ────────────────────────────
(function T2() {
  console.log('T2 재설치 시 이전 관측기 자동 dispose');
  const h = makeWin();
  let cur = mkRaw(false, 100, 2, 0, []);
  const p1 = IceCancelProbe.install({ win: h.win, readRaw: () => cur, now });
  eq(h.liveCount(), 3, 'T2 1차 설치 후 리스너 3');
  const p2 = IceCancelProbe.install({ win: h.win, readRaw: () => cur, now });
  eq(h.liveCount(), 3, 'T2 재설치 후에도 리스너 3(6으로 누수 안 됨)');
  eq(h.added.mousedown, 2, 'T2 add는 누적 2회(각 설치)');
  eq(h.removed.mousedown, 1, 'T2 remove 1회(이전 probe 정리)');
  ok(p1._diag().disposed, 'T2 이전 probe disposed=true');
  eq(h.win.__iceCancelProbe, p2, 'T2 네임스페이스는 신규 probe');
  ok(h.hasPending(), 'T2 신규 probe rAF 예약됨');
  p2.dispose();
  eq(h.liveCount(), 0, 'T2 최종 dispose 후 리스너 0');
})();

// ── T3: 유효표본0 → UNDETERMINED ────────────────────────────────────────────
(function T3() {
  console.log('T3 유효표본0 → UNDETERMINED(PASS 금지)');
  const h = makeWin();
  const p = IceCancelProbe.install({ win: h.win, readRaw: () => null, now }); // 항상 읽기 실패
  p.mark('C');
  for (let i = 0; i < 5; i++) h.step();
  const d = p.dump();
  eq(d.marks['C'].validSamples, 0, 'T3 구간C 유효표본 0');
  ok(d.marks['C'].nullSamples > 0, 'T3 구간C null표본 집계됨(조용히 버리지 않음)');
  eq(p.verdict('C').verdict, 'UNDETERMINED', 'T3 구간C verdict UNDETERMINED');
  eq(p.verdict().verdict, 'UNDETERMINED', 'T3 전체 verdict도 UNDETERMINED(양성대조 없음)');
  p.dispose();
})();

// ── T4: 양성대조 포착 + 정상 설치 분류 ──────────────────────────────────────
(function T4() {
  console.log('T4 양성대조 포착 + 정상 설치 분류');
  const h = makeWin();
  const zoneB = { type: 'iceStorm', id: 'B' };
  let cur = mkRaw(false, 100, 2, 0, []);     // 베이스라인(조준 off)
  const p = IceCancelProbe.install({ win: h.win, readRaw: () => cur, now });
  p.mark('A'); h.step();                       // 베이스라인 표본
  p.mark('B');
  cur = mkRaw(true, 100, 2, 0, []); h.step();  // 조준 ON
  cur = mkRaw(false, 60, 1, 1500, [zoneB]); h.step(); // 설치: 신규존+mp-40+stk-1, 조준 off
  const d = p.dump();
  ok(d.positiveControl && d.positiveControl.newInstalls === 1, 'T4 양성대조 포착(newInstalls=1)');
  eq(d.counts.install, 1, 'T4 설치 1건 집계');
  eq(d.counts.delayed, 0, 'T4 지연발동 0(정상 설치는 조준 ON→OFF)');
  eq(d.counts.residualStk, 0, 'T4 잔류스택 0');
  const v = p.verdict();
  eq(v.verdict, 'PASS', 'T4 양성대조 있고 누수 없음 → PASS');
  p.dispose();
})();

// ── T5: 설치 없는 MP 감소 = OTHER_MP_SPEND 분리 ─────────────────────────────
(function T5() {
  console.log('T5 설치 없는 MP 감소 = 다른 MP 소비로 분리');
  const h = makeWin();
  const zoneB = { type: 'iceStorm', id: 'B' };
  let cur = mkRaw(false, 100, 2, 0, []);
  const p = IceCancelProbe.install({ win: h.win, readRaw: () => cur, now });
  // 먼저 정상 설치로 양성대조 확보
  cur = mkRaw(true, 100, 2, 0, []); h.step();
  cur = mkRaw(false, 60, 1, 1500, [zoneB]); h.step();
  // 설치 없이 MP만 20 감소(다른 스킬 소비) — 아이스스톰 아님
  cur = mkRaw(false, 40, 1, 1500, [zoneB]); h.step();
  const d = p.dump();
  eq(d.counts.otherMp, 1, 'T5 OTHER_MP_SPEND 1건 분리 집계');
  eq(d.counts.residualStk, 0, 'T5 스택 불변이므로 잔류소모 아님');
  eq(d.flags.length, 0, 'T5 누수 flag 0(MP만 감소는 누수로 오판 안 함)');
  eq(p.verdict().verdict, 'PASS', 'T5 MP 다른소비는 누수 아님 → PASS');
  p.dispose();
})();

// ── T6: 장판 만료 ↔ 신규 설치 상쇄(net 0)에서 신규 설치 식별 ────────────────
(function T6() {
  console.log('T6 장판 만료와 신규 설치 상쇄 상황에서 신규 식별(G5)');
  const h = makeWin();
  const zoneA = { type: 'iceStorm', id: 'A' };  // 기존 존(만료 예정)
  const zoneB = { type: 'iceStorm', id: 'B' };  // 신규 설치
  let cur = mkRaw(false, 100, 2, 0, [zoneA]);    // 설치 시점에 A 이미 생존
  const p = IceCancelProbe.install({ win: h.win, readRaw: () => cur, now });
  p.mark('B');
  cur = mkRaw(true, 100, 2, 0, [zoneA]); h.step();          // 조준 ON, A 유지
  // 같은 프레임: A 만료 + B 신규설치 → zoneCount 1→1 (net 0), 자원 mp-40/stk-1
  cur = mkRaw(false, 60, 1, 1500, [zoneB]); h.step();
  const d = p.dump();
  const installFrame = d.installs[d.installs.length - 1];
  ok(installFrame, 'T6 설치 프레임 포착');
  eq(installFrame.newInstalls, 1, 'T6 신규 설치 1(net 0이어도 식별)');
  eq(installFrame.expired, 1, 'T6 만료 1 별도 집계');
  eq(installFrame.zoneCount, 1, 'T6 존 총수는 1(순증 0)');
  ok(installFrame.isIceCost, 'T6 아이스스톰 설치 서명 확정');
  p.dispose();
})();

// ── T7: 설치 없는 스택 감소 = 잔류소모 누수 → SUSPECT ───────────────────────
(function T7() {
  console.log('T7 설치 없는 스택 감소 = 잔류소모 누수 → SUSPECT');
  const h = makeWin();
  const zoneB = { type: 'iceStorm', id: 'B' };
  let cur = mkRaw(false, 100, 2, 0, []);
  const p = IceCancelProbe.install({ win: h.win, readRaw: () => cur, now });
  // 양성대조 확보
  cur = mkRaw(true, 100, 2, 0, []); h.step();
  cur = mkRaw(false, 60, 1, 1500, [zoneB]); h.step();
  // 설치 없이 스택만 1 감소 = 아이스스톰 고유 자원 누수 신호
  cur = mkRaw(false, 60, 0, 1500, [zoneB]); h.step();
  const d = p.dump();
  eq(d.counts.residualStk, 1, 'T7 잔류스택 소모 1건');
  ok(d.flags.some(fr => fr.flag === 'RESIDUAL_STK_SPEND?'), 'T7 RESIDUAL_STK_SPEND? flag 발생');
  eq(p.verdict().verdict, 'SUSPECT', 'T7 누수 신호 → SUSPECT');
  p.dispose();
})();

/* ===========================================================================
 * SKILL-ICE-CANCEL-EDGE 보강 — 리젠·취소 자원 정합성(G8) 부정회귀
 * ========================================================================= */

// 공통: 정상 설치 1회로 양성대조 확보 후 setupFrame 상태로 둔다.
function withPositiveControl(h) {
  const zoneB = { type: 'iceStorm', id: 'B' };
  let state = { cur: mkRaw(false, 100, 2, 0, []) };
  const p = IceCancelProbe.install({ win: h.win, readRaw: () => state.cur, now });
  state.cur = mkRaw(true, 100, 2, 0, []); h.step();          // 조준 ON
  state.cur = mkRaw(false, 60, 1, 1500, [zoneB]); h.step();  // 설치(양성대조): stk2→1, mp-40, rech 0→1500
  return { p, state, zoneB };
}

// ── T8: 적법 리젠 완료 인식(플래그 아님) ────────────────────────────────────
(function T8() {
  console.log('T8 적법 리젠 완료(dStk=+1, prev.rech>0) 인식 — 플래그 아님');
  const h = makeWin();
  const { p, state, zoneB } = withPositiveControl(h);
  state.cur = mkRaw(false, 60, 1, 1000, [zoneB]); h.step();  // 리젠 진행(dStk=0)
  state.cur = mkRaw(false, 60, 2, 0, [zoneB]); h.step();     // 리젠 완료: dStk=+1, prev.rech=1000>0
  const d = p.dump();
  eq(d.counts.rechargeTicks, 1, 'T8 적법 리젠 완료 1건 집계');
  eq(d.counts.stkRefund, 0, 'T8 환급 0');
  eq(d.flags.length, 0, 'T8 플래그 0(리젠은 정상)');
  const rf = d.recharges[d.recharges.length - 1];
  ok(rf && rf.legitRecharge && rf.dStk === 1, 'T8 리젠 프레임 legitRecharge=true, dStk=+1');
  eq(p.verdict().verdict, 'PASS', 'T8 PASS 유지');
  p.dispose();
})();

// ── T9: 리젠 아닌 스택 증가 = STK_REFUND(환급/중복) → SUSPECT ────────────────
(function T9() {
  console.log('T9 리젠 완료 아닌 스택 증가 = STK_REFUND → SUSPECT');
  const h = makeWin();
  const { p, state, zoneB } = withPositiveControl(h);
  state.cur = mkRaw(false, 60, 1, 0, [zoneB]); h.step();     // rech 1500→0 (충전기 소거, dStk=0)
  state.cur = mkRaw(false, 60, 2, 0, [zoneB]); h.step();     // dStk=+1 인데 prev.rech=0 → 부적법
  const d = p.dump();
  eq(d.counts.stkRefund, 1, 'T9 스택 환급 1건');
  ok(d.flags.some(fr => fr.flag === 'STK_REFUND?'), 'T9 STK_REFUND? 플래그 발생');
  eq(d.counts.rechargeTicks, 0, 'T9 적법 리젠 0');
  eq(p.verdict().verdict, 'SUSPECT', 'T9 SUSPECT');
  p.dispose();
})();

// ── T9b: 한 프레임 스택 2 증가(dStk>1)도 부적법 ─────────────────────────────
(function T9b() {
  console.log('T9b 한 프레임 dStk=+2(리젠 중이어도 1회 1스택 위반) = STK_REFUND');
  const h = makeWin();
  const { p, state, zoneB } = withPositiveControl(h);
  state.cur = mkRaw(false, 60, 1, 1000, [zoneB]); h.step();  // 리젠 진행
  state.cur = mkRaw(false, 60, 3, 0, [zoneB]); h.step();     // dStk=+2 (prev.rech>0이어도 위반)
  const d = p.dump();
  eq(d.counts.stkRefund, 1, 'T9b dStk>1 환급으로 분류');
  eq(d.counts.rechargeTicks, 0, 'T9b dStk=+2는 적법 리젠 아님');
  eq(p.verdict().verdict, 'SUSPECT', 'T9b SUSPECT');
  p.dispose();
})();

// ── T10: 취소 프레임 자원 무변(정상) → 플래그 없음, PASS ─────────────────────
(function T10() {
  console.log('T10 취소(조준 ON→OFF, 비설치, 자원 무변) 정상 → PASS');
  const h = makeWin();
  const { p, state, zoneB } = withPositiveControl(h);
  state.cur = mkRaw(true, 60, 1, 1500, [zoneB]); h.step();   // 재조준 ON
  state.cur = mkRaw(false, 60, 1, 1500, [zoneB]); h.step();  // 취소: aim OFF, 설치X, 자원 무변
  const d = p.dump();
  eq(d.counts.cancel, 1, 'T10 취소 1건 관측');
  eq(d.counts.cancelSideEffect, 0, 'T10 취소 부작용 0');
  eq(d.flags.length, 0, 'T10 플래그 0');
  const cf = d.cancels[d.cancels.length - 1];
  ok(cf && cf.isCancel && cf.dStk === 0 && cf.newInstalls === 0, 'T10 취소 프레임 자원/설치 변화 없음');
  eq(p.verdict().verdict, 'PASS', 'T10 PASS');
  p.dispose();
})();

// ── T11: 취소 프레임이 적법 리젠 완료와 겹침 = 부작용 아님(오탐 방지) ────────
(function T11() {
  console.log('T11 취소 ∧ 적법 리젠 완료 동시 = 부작용 아님(오탐 방지)');
  const h = makeWin();
  const { p, state, zoneB } = withPositiveControl(h);
  state.cur = mkRaw(true, 60, 1, 200, [zoneB]); h.step();    // 재조준 ON, 리젠 임박(rech200)
  state.cur = mkRaw(false, 60, 2, 0, [zoneB]); h.step();     // 취소 ∧ 리젠 완료(dStk=+1, prev.rech=200>0)
  const d = p.dump();
  eq(d.counts.cancel, 1, 'T11 취소 1건');
  eq(d.counts.rechargeTicks, 1, 'T11 적법 리젠 완료 1건');
  eq(d.counts.cancelSideEffect, 0, 'T11 취소 부작용 0(리젠은 매 프레임 독립 실행)');
  eq(d.counts.stkRefund, 0, 'T11 환급 0');
  eq(d.flags.length, 0, 'T11 플래그 0');
  eq(p.verdict().verdict, 'PASS', 'T11 오탐 없이 PASS');
  p.dispose();
})();

// ── T12: 취소 프레임에 스택 감소(부작용) → CANCEL_SIDE_EFFECT + SUSPECT ──────
(function T12() {
  console.log('T12 취소 프레임에 스택 감소 = 취소 부작용 → SUSPECT');
  const h = makeWin();
  const { p, state, zoneB } = withPositiveControl(h);
  state.cur = mkRaw(true, 60, 2, 0, [zoneB]); h.step();      // 재조준 ON
  state.cur = mkRaw(false, 60, 1, 0, [zoneB]); h.step();     // 취소인데 stk 2→1 감소(버그)
  const d = p.dump();
  eq(d.counts.cancel, 1, 'T12 취소 1건');
  eq(d.counts.cancelSideEffect, 1, 'T12 취소 부작용 1건');
  eq(d.counts.residualStk, 1, 'T12 비설치 스택 감소도 잔류소모로 집계');
  const v = p.verdict();
  eq(v.verdict, 'SUSPECT', 'T12 SUSPECT');
  ok(/취소부작용/.test(v.reason), 'T12 verdict 사유에 취소부작용 명시');
  p.dispose();
})();

console.log(`\n결과: ${passed} PASS / ${failed} FAIL`);
if (failed) { console.error('실패 항목:\n - ' + fails.join('\n - ')); process.exit(1); }
process.exit(0);
