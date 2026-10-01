/* ENEMY owner-integration 회귀 — ENEMY-TICK-UNKNOWN-FIX 인수
 *
 * 목적: ITEM 지원팀이 검수 완료한 tick-health 수정(missing/nonfinite/stalled/backward 물리tick
 *       거짓 FAIL 교정 + rAF↔물리tick 분리)을 원담당(ENEMY) 실제 probe 경로에 인수했을 때
 *       거동이 검수본과 동일한지 확인한다. 검수 로직은 재작성하지 않는다(바이트 동일 인수).
 *
 * 대상:
 *   original   = ENEMY/et3-probe.fixed.js                (인수 전 원담당 probe — 거짓 FAIL_NO_FIRE 재현)
 *   integrated = ENEMY/owner-integration-et3-probe.fixed.js (owner-integration-et3-probe.patch 적용본)
 *   integrated 는 ITEM/enemy-support-probe.js(검수본)와 sha256 동일.
 *
 * 핵심 계약: tick 없는 451 rAF 는 INCONCLUSIVE(physical_tick_unverified). 절대 실제 AI 결함(FAIL_NO_FIRE)로
 *           승격하지 않는다. rAF 수와 물리tick 증가분은 분리 집계한다.
 *
 * 실행: node --test tools/team-followup-20261001/ENEMY/owner-integration-tick.test.mjs
 * read-only: 게임/AI/생산 코드 변경 없음. vm 샌드박스로 로드해 globalThis 미오염.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

const originalPath   = new URL('../root-review/five-owner-before-enemy.js', import.meta.url);
const integratedPath = new URL('./et3-probe.fixed.js', import.meta.url);
const reviewedPath   = new URL('../ITEM/enemy-support-probe.js', import.meta.url);

const original   = fs.readFileSync(originalPath, 'utf8');
const integrated = fs.readFileSync(integratedPath, 'utf8');
const reviewed   = fs.readFileSync(reviewedPath, 'utf8');
const digest = (s) => crypto.createHash('sha256').update(s).digest('hex');

// vm 샌드박스에서 probe 소스를 로드하고, 수동 구동 가능한 호스트를 붙인다.
function setup(source, initialTick = 0) {
  const sandbox = {};
  vm.runInNewContext(source, sandbox);
  let currentTick = initialTick, nextSample = null, callbacks = 0;
  const target = { etype: 3, alive: true, s: 'idle', x: 150, y: 0, projCd: 9999, projT: 9999, _projChargeT: 0 };
  const projectiles = [];
  const registry = { _fireChargedProj: () => projectiles.push({ committed: true }), _spawnBossProjectile: () => {} };
  const originals = { ...registry };
  const host = {
    getTick: () => currentTick, getG: () => ({ on: true }), getP: () => ({ x: 0, y: 0 }),
    getEns: () => [target], getRange: () => ({ 3: 200 }), getProjs: () => projectiles,
    getFn: (name) => registry[name], setFn: (name, fn) => { registry[name] = fn; },
    raf: (cb) => { nextSample = cb; return ++callbacks; }, caf: () => { nextSample = null; }
  };
  const probe = sandbox.__createET3Probe(host);
  probe.install();
  return {
    probe, host, target, registry, originals,
    sample(value = currentTick) { currentTick = value; const cb = nextSample; nextSample = null; cb(); },
    stop() { const r = probe.stop(); assert.equal(registry._fireChargedProj, originals._fireChargedProj, 'stop 후 원함수 복원'); return r; }
  };
}

test('인수 무결성: integrated == ITEM 검수본(sha256 동일, 검수 로직 재작성 없음)', () => {
  assert.equal(digest(integrated), digest(reviewed), 'owner-integration 통합본은 검수본과 바이트 동일해야');
  assert.notEqual(digest(integrated), digest(original), '원담당 원본과는 달라야(패치 적용됨)');
});

test('핵심: tick null + 451 rAF — 원본 FAIL_NO_FIRE 재현, 통합본 INCONCLUSIVE + 물리카운트 0', () => {
  const before = setup(original, null), after = setup(integrated, null);
  for (let f = 0; f < 451; f++) { before.sample(null); after.sample(null); }
  const failed = before.stop(), fixed = after.stop();
  // 원본(인수 전)의 오판정을 재현 — 왜 수정이 필요한지 증거
  assert.equal(failed.verdict, 'FAIL_NO_FIRE');
  assert.equal(failed.residency.inRangeTicks, 451);
  // 통합본: 실제 AI 결함으로 승격하지 않음
  assert.equal(fixed.verdict, 'INCONCLUSIVE');
  assert.equal(fixed.residency.inRangeTicks, 0, 'rAF를 물리tick으로 세지 않음');
  assert.equal(fixed.tickHealth.rafSamples, 451, 'rAF는 분리 집계');
  assert.equal(fixed.tickHealth.physicalAdvances, 0, '물리tick 증가 0');
  assert.equal(fixed.elapsedTicks, null);
  assert.ok(fixed.reasons.some((r) => r.includes('physical_tick_unverified')));
});

for (const [name, value] of [
  ['missing(undefined)', undefined], ['NaN', NaN], ['+Infinity', Infinity], ['-Infinity', -Infinity],
  ['string', '100'], ['negative', -1], ['fractional', 0.5], ['constant/stalled', 10]
]) {
  test(`비정상 물리tick(${name}) 451 rAF 는 INCONCLUSIVE(결함 단정 금지)`, () => {
    const fx = setup(integrated, value);
    for (let f = 0; f < 451; f++) fx.sample(value);
    const r = fx.stop();
    assert.equal(r.verdict, 'INCONCLUSIVE');
    assert.equal(r.residency.aliveTicks, 0);
    assert.equal(r.tickHealth.physicalAdvances, 0);
  });
}

test('무회귀: 정상 단조 물리tick + 고주사율 중복 rAF 에서는 FAIL_NO_FIRE 유지 + 정확 카운트', () => {
  const fx = setup(integrated);
  for (let physics = 1; physics <= 470; physics++) for (let redraw = 0; redraw < 3; redraw++) fx.sample(physics);
  const r = fx.stop();
  assert.equal(r.verdict, 'FAIL_NO_FIRE');
  assert.equal(r.residency.inRangeTicks, 470, '물리tick 당 1회만 집계');
  assert.equal(r.tickHealth.rafSamples, 1410, 'rAF 1410 = 470×3');
  assert.equal(r.tickHealth.physicalAdvances, 470);
  assert.equal(r.elapsedTicks, 470);
});

test('정상 진행 후 backward/reset/missing 발생 시 해당 관측 영구 무효(INCONCLUSIVE)', () => {
  for (const change of [0, null, NaN]) {
    const fx = setup(integrated);
    for (let physics = 1; physics <= 470; physics++) fx.sample(physics);
    fx.sample(change);
    for (let physics = 471; physics <= 480; physics++) fx.sample(physics);
    const r = fx.stop();
    assert.equal(r.verdict, 'INCONCLUSIVE', 'change=' + String(change));
    assert.equal(r.elapsedTicks, null);
  }
});

test('정상 진행 후 정체(stall) 시 무효 — 정체 rAF 를 추가 물리tick 으로 세지 않음', () => {
  const fx = setup(integrated);
  for (let physics = 1; physics <= 470; physics++) fx.sample(physics);
  for (let redraw = 0; redraw < 120; redraw++) fx.sample(470);
  const r = fx.stop();
  assert.equal(r.verdict, 'INCONCLUSIVE');
  assert.equal(r.residency.aliveTicks, 470);
  assert.equal(r.tickHealth.stagnantRafSamples, 120);
  assert.ok(r.tickHealth.issues.includes('stalled_tick'));
});

test('진단된 정체는 같은 probe 안에서 결론 verdict 로 회복 불가', () => {
  const fx = setup(integrated);
  fx.sample(1);
  for (let redraw = 0; redraw < 120; redraw++) fx.sample(1);
  for (let physics = 2; physics <= 500; physics++) fx.sample(physics);
  const r = fx.stop();
  assert.equal(r.verdict, 'INCONCLUSIVE');
  assert.ok(r.tickHealth.issues.includes('stalled_tick'));
});

test('물리tick 공백은 누락 residency 를 외삽하지 않고, 진행 없는 보고는 INCONCLUSIVE', () => {
  const fx = setup(integrated);
  fx.sample(1); fx.sample(500);
  const r = fx.stop();
  assert.equal(r.verdict, 'INCONCLUSIVE');
  assert.equal(r.residency.aliveTicks, 2);
  assert.equal(setup(integrated).stop().verdict, 'INCONCLUSIVE');
});

test('커밋된 발사 증거는 보존하되 tick 없음은 timing PASS 를 만들지 않음', () => {
  const fx = setup(integrated, null);
  fx.sample(null);
  fx.registry._fireChargedProj(fx.target);
  const r = fx.stop();
  assert.ok(r.firstFire && r.firstFire.committed);
  assert.equal(r.verdict, 'INCONCLUSIVE');
});

test('tick getter 예외는 보고 크래시가 아니라 health 이슈', () => {
  const fx = setup(integrated);
  fx.host.getTick = () => { throw new Error('getter unavailable'); };
  fx.sample(1);
  const r = fx.stop();
  assert.equal(r.verdict, 'INCONCLUSIVE');
  assert.ok(r.tickHealth.issues.includes('tick_read_error'));
});
