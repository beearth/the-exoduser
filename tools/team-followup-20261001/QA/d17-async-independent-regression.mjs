#!/usr/bin/env node
/* ============================================================================
 * QA D17 비동기 후보 독립 반례 검수 (read-only source review, 게임/서버 미실행)
 *   실행: node tools/team-followup-20261001/QA/d17-async-independent-regression.mjs
 *
 * 1) 기존 d17-lifecycle-roll-candidate(prior)의 비동기 결함 2건을 "독립 fixture"로 재현:
 *    FAIL-A  pending 중 출처 등록/효과 (경계 진행 중 provenance 등록·black-end 이동)
 *    FAIL-B  늦은 finally 출처삭제 / A·B 겹침에서 다른 경계 pending 중 오등록·늦은 clear
 * 2) 완성된 d17-async-boundary-candidate(new)에 "같은 반례"를 적용해 억제/수정 확인.
 *    (ITEM 파일 수정 0 — read-only import)
 * 3) 공통 계약: 기본 비활성, 원함수 this/인수/반환/호출횟수, clear/player/character/zones
 *    교체, 역순 성공/실패, pending 생성/시전.
 *
 * ITEM 검사(d17-*-check)를 복제하지 않고 독립 시나리오로 결함을 증명한다. 보고서만 만들지
 * 않는다. source 검수이며 앱 인수/생산 활성 아님.
 * ========================================================================= */
import assert from 'node:assert/strict';
import { createD17LifecycleReview as PRIOR } from '../../../tools/team-followup-20261001/ITEM/d17-lifecycle-roll-candidate.mjs';
import { createD17LifecycleReview as NEW } from '../../../tools/team-followup-20261001/ITEM/d17-async-boundary-candidate.mjs';

let pass = 0, fail = 0; const fails = [], notes = [];
const check = (n, f) => { try { f(); pass++; console.log('  ✓ ' + n); } catch (e) { fail++; const m = e && e.message || e; fails.push(n + ' :: ' + m); console.log('  ✗ ' + n + '\n      ' + m); } };
const acheck = async (n, f) => { try { await f(); pass++; console.log('  ✓ ' + n); } catch (e) { fail++; const m = e && e.message || e; fails.push(n + ' :: ' + m); console.log('  ✗ ' + n + '\n      ' + m); } };
const note = (m) => notes.push(m);
const flush = async () => { for (let i = 0; i < 6; i++) await Promise.resolve(); await new Promise(r => setTimeout(r, 0)); };
const freshZone = () => ({ type: 'fireAura', follow: false, x: 10, y: 10, t: 0, maxT: 100 });
const HELMET = Object.freeze({ uniqueId: 'UI-17', slot: 'helmet', uniqueRoll: { version: 1, effectId: 'U-D17', stat: '_uBlackZoneGather', unit: 'count', storedValue: 1 } });

// 하니스: options + 스파이 + 상태 setter
function harness(enabled = true) {
  const st = { character: 'A', player: { _bsCasting: false, _bsX: 0, _bsY: 0 }, zones: [] };
  const fireSpy = { count: 0, this: undefined, args: undefined, ret: 'FB' };
  const trapSpy = { count: 0, this: undefined, args: undefined, ret: 'TR' };
  const opts = {
    enabled, reviewOnly: true,
    getPlayer: () => st.player, getCharacterKey: () => st.character, getZones: () => st.zones,
    getEquippedHelmet: () => ({ ...HELMET, uniqueRoll: { ...HELMET.uniqueRoll } }),
    fireBlackStar(...a) { fireSpy.count++; fireSpy.this = this; fireSpy.args = a; st.player._bsCasting = false; return fireSpy.ret; },
    activateSpikeTrap(...a) { trapSpy.count++; trapSpy.this = this; trapSpy.args = a; return trapSpy.ret; },
  };
  // provenance 등록된 fireAura zone 을 black-end 로 이동시키는 시전 1회
  const castOnce = (review, z) => { st.player._bsCasting = true; st.player._bsX = 0; st.player._bsY = 0; review.fireBlackStar(); };
  return { opts, st, fireSpy, trapSpy, castOnce };
}
const asyncOrig = () => { let resolve, reject; const p = new Promise((res, rej) => { resolve = res; reject = rej; }); return { fn: () => p, resolve, reject }; };

/* ═══════════════ 0. 기준 동작(비동기 경계 없음) — 양 후보 동일 ═══════════════ */
for (const [label, make] of [['prior', PRIOR], ['new', NEW]]) {
  check(`[${label}] 기준: 경계 없음 → 등록·시전 시 provenance zone 이 center 로 이동(효과 동작)`, () => {
    const h = harness(); const r = make(h.opts); const z = freshZone(); h.st.zones.push(z);
    assert.equal(r.onInfernoSlamFixedCreated(z), true, '등록 성공');
    h.castOnce(r, z);
    assert.equal(z.x, 0); assert.equal(z.y, 0); // center 로 이동됨
    assert.equal(h.fireSpy.count, 1, '원 fireBlackStar 1회 호출');
  });
  check(`[${label}] 기본 비활성(enabled=false): 등록 false·시전 무효과(원함수만 통과)`, () => {
    const h = harness(false); const r = make(h.opts); const z = freshZone(); h.st.zones.push(z);
    assert.equal(r.onInfernoSlamFixedCreated(z), false, '비활성 등록 0');
    h.castOnce(r, z);
    assert.equal(z.x, 10, '이동 없음'); assert.equal(h.fireSpy.count, 1, '원함수는 통과 호출');
  });
}

/* ═══════════════ 1. 원함수 this/인수/반환/호출횟수 보존 ═══════════════ */
for (const [label, make] of [['prior', PRIOR], ['new', NEW]]) {
  check(`[${label}] wrapBoundary 동기: this/인수/반환/1회 보존`, () => {
    const h = harness(); const r = make(h.opts);
    const recv = { tag: 'recv' }; let seenThis, seenArgs, cnt = 0;
    const orig = function (...a) { cnt++; seenThis = this; seenArgs = a; return 'RET'; };
    const wrapped = r.wrapBoundary(orig);
    const out = wrapped.call(recv, 1, 2, 3);
    assert.equal(out, 'RET'); assert.equal(cnt, 1); assert.equal(seenThis, recv); assert.deepEqual(seenArgs, [1, 2, 3]);
  });
  check(`[${label}] fireBlackStar/activateSpikeTrap: 반환·this·1회 보존(경계 없음)`, () => {
    const h = harness(); const r = make(h.opts); const recv = { tag: 't' };
    const fb = r.fireBlackStar.call(recv, 'x'); const tr = r.activateSpikeTrap.call(recv, 'y');
    assert.equal(fb, 'FB'); assert.equal(tr, 'TR');
    assert.equal(h.fireSpy.count, 1); assert.equal(h.trapSpy.count, 1);
    assert.equal(h.trapSpy.this, recv); assert.deepEqual(h.trapSpy.args, ['y']);
  });
}

/* ═══════════════ 2. clear / player·character·zones 교체 ═══════════════ */
for (const [label, make] of [['prior', PRIOR], ['new', NEW]]) {
  check(`[${label}] character 교체 시 stale provenance 폐기(이전 zone 미이동)`, () => {
    const h = harness(); const r = make(h.opts); const z = freshZone(); h.st.zones.push(z);
    assert.equal(r.onInfernoSlamFixedCreated(z), true);
    h.st.character = 'B';            // 캐릭터 전환 → current() 재구성(clear stale)
    h.castOnce(r, z);
    assert.equal(z.x, 10, '전환 후 이전 provenance 폐기 → 미이동');
  });
  check(`[${label}] zones 배열 교체 시 stale 폐기`, () => {
    const h = harness(); const r = make(h.opts); const z = freshZone(); h.st.zones.push(z);
    assert.equal(r.onInfernoSlamFixedCreated(z), true);
    h.st.zones = [z];                // 새 배열 identity → 재구성
    h.castOnce(r, z);
    assert.equal(z.x, 10, 'zones 교체 후 미이동');
  });
}

/* ═══════════════ 3. FAIL-A: pending 중 등록/효과 (prior 결함 → new 억제) ═══════════════ */
await acheck('[prior] FAIL-A 재현: 비동기 경계 pending 중 등록 true + 시전 효과 발생(이동)', async () => {
  const h = harness(); const r = PRIOR(h.opts); const ao = asyncOrig();
  r.wrapBoundary(ao.fn)();          // 경계 진행(pending)
  const z = freshZone(); h.st.zones.push(z);
  assert.equal(r.onInfernoSlamFixedCreated(z), true, 'prior: pending 중 등록됨(결함)');
  h.castOnce(r, z);
  assert.equal(z.x, 0, 'prior: pending 중 시전 효과 발생(이동) — 결함');
  ao.resolve('done'); await flush();
});
await acheck('[new] FAIL-A 수정: pending 중 등록 false + 시전은 원함수만(무효과)', async () => {
  const h = harness(); const r = NEW(h.opts); const ao = asyncOrig();
  r.wrapBoundary(ao.fn)();
  assert.equal(r.getPendingCount(), 1, 'pending 1');
  const z = freshZone(); h.st.zones.push(z);
  assert.equal(r.onInfernoSlamFixedCreated(z), false, 'new: pending 중 등록 억제');
  h.castOnce(r, z);
  assert.equal(z.x, 10, 'new: pending 중 이동 없음');
  assert.equal(h.fireSpy.count, 1, 'new: 원 fireBlackStar 는 통과 호출(게임플레이 보존)');
  ao.resolve('done'); await flush();
  assert.equal(r.getPendingCount(), 0, '완료 후 pending 0');
});

/* ═══════════════ 4. FAIL-B: 늦은 finally·A/B 겹침 (prior 결함 → new 억제) ═══════════════ */
await acheck('[prior] FAIL-B 재현: A·B 겹침 — b1 늦은 settle 후 b2 pending 중 오등록·b2 늦은 clear 로 삭제', async () => {
  const h = harness(); const r = PRIOR(h.opts);
  const a1 = asyncOrig(), a2 = asyncOrig();
  r.wrapBoundary(a1.fn)(); r.wrapBoundary(a2.fn)();     // b1,b2 pending
  a1.resolve('d1'); await flush();                       // b1 .finally(clear) 늦게 발화(단일 pending 추적 없음)
  const zC = freshZone(); h.st.zones.push(zC);
  assert.equal(r.onInfernoSlamFixedCreated(zC), true, 'prior: b2 아직 pending인데 등록됨(겹침 결함)');
  a2.resolve('d2'); await flush();                       // b2 .finally(clear) → zC provenance 늦게 삭제
  h.castOnce(r, zC);
  assert.equal(zC.x, 10, 'prior: 늦은 clear 로 등록이 삭제되어 미이동(출처삭제 결함)');
});
await acheck('[new] FAIL-B 수정: 겹침 중 전부 억제, 모든 경계 완료 뒤에만 재개(늦은 clear 없음)', async () => {
  const h = harness(); const r = NEW(h.opts);
  const a1 = asyncOrig(), a2 = asyncOrig();
  r.wrapBoundary(a1.fn)(); r.wrapBoundary(a2.fn)();
  assert.equal(r.getPendingCount(), 2, 'pending 2(겹침 추적)');
  a1.resolve('d1'); await flush();
  assert.equal(r.getPendingCount(), 1, 'b1 완료 후 1');
  const zC = freshZone(); h.st.zones.push(zC);
  assert.equal(r.onInfernoSlamFixedCreated(zC), false, 'new: b2 pending 동안 억제 유지');
  a2.resolve('d2'); await flush();
  assert.equal(r.getPendingCount(), 0, '전부 완료');
  const zD = freshZone(); h.st.zones.push(zD);
  assert.equal(r.onInfernoSlamFixedCreated(zD), true, 'new: 전부 완료 후 재개(정상 등록)');
  h.castOnce(r, zD);
  assert.equal(zD.x, 0, 'new: 완료 후 정상 효과 — 영구 차단 아님');
});

/* ═══════════════ 5. 역순 성공/실패 + pending 생성/시전 ═══════════════ */
await acheck('[new] 역순 완료: b2 먼저 settle 후 b1 — 전부 완료까지 억제, 이후 재개', async () => {
  const h = harness(); const r = NEW(h.opts);
  const a1 = asyncOrig(), a2 = asyncOrig();
  r.wrapBoundary(a1.fn)(); r.wrapBoundary(a2.fn)();
  a2.resolve('d2'); await flush(); assert.equal(r.getPendingCount(), 1, '역순 b2 먼저');
  assert.equal(r.onInfernoSlamFixedCreated(freshZone()), false, '아직 b1 pending → 억제');
  a1.resolve('d1'); await flush(); assert.equal(r.getPendingCount(), 0);
  const z = freshZone(); h.st.zones.push(z);
  assert.equal(r.onInfernoSlamFixedCreated(z), true); h.castOnce(r, z); assert.equal(z.x, 0);
});
await acheck('[new] 실패(reject)도 pending 정리: 거부 후 pending 0, 재개', async () => {
  const h = harness(); const r = NEW(h.opts); const ao = asyncOrig();
  const wrapped = r.wrapBoundary(ao.fn); const p = wrapped();
  assert.equal(r.getPendingCount(), 1);
  ao.reject(new Error('boom')); await p.then(() => {}, () => {}); await flush();
  assert.equal(r.getPendingCount(), 0, 'reject 후 pending 0');
  const z = freshZone(); h.st.zones.push(z);
  assert.equal(r.onInfernoSlamFixedCreated(z), true, '거부 후 재개');
});
check('[new] 동기 throw: pending 누수 없음, 예외 전파', () => {
  const h = harness(); const r = NEW(h.opts);
  const wrapped = r.wrapBoundary(() => { throw new Error('syncfail'); });
  assert.throws(() => wrapped(), /syncfail/);
  assert.equal(r.getPendingCount(), 0, '동기 throw 후 pending 0');
});
check('[prior] 동기 throw: clear 후 예외 전파(this 보존 경로)', () => {
  const h = harness(); const r = PRIOR(h.opts);
  const wrapped = r.wrapBoundary(() => { throw new Error('syncfail'); });
  assert.throws(() => wrapped(), /syncfail/);
});

note('prior(d17-lifecycle-roll-candidate)는 비동기 경계에 대해 단일 pending 추적이 없어 (A) pending 중 등록/효과가 발생하고 (B) 각 경계의 Promise.finally(clear)가 늦게/반복 발화해 겹침·역순에서 provenance 를 오등록 후 늦게 삭제한다. 독립 fixture로 2건 모두 재현.');
note('new(d17-async-boundary-candidate)는 pending Set 으로 진행 중 경계가 하나라도 있으면 등록/시전을 억제하고(원 게임플레이 함수는 통과), 늦은 clear 를 두지 않으며 모든 경계 완료(성공/역순/실패/동기throw) 후에만 재개한다. 같은 반례 전부 억제·정상 재개 확인.');
note('공통: 기본 비활성, 원함수 this/인수/반환/1회 호출, character/zones 교체 시 stale 폐기 확인. 유효 롤(UI-17 _uBlackZoneGather count 1~3)로 효과(이동) 관찰. 생산/앱/저장 미연결 review-only.');
note('한계: fixture 는 player._bsCasting·_bsX/Y·fireAura zone 대역으로 black-end 경로만 관찰. Promise identity·추가 microtask·never-settle·실제 생산 callsite(initStage/dbRestore 등) 장착/전투 부작용은 범위 밖(ITEM check 와 생산 게이트 소관).');

console.log(`\nD17 async 독립 검수: ${pass} PASS / ${fail} FAIL`);
console.log('검수 범위·한계:'); notes.forEach(n => console.log('  - ' + n));
if (fail) { console.error('실패:\n - ' + fails.join('\n - ')); process.exit(1); }
process.exit(0);
