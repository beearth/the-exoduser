'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function load() {
  const c = vm.createContext({ console, performance, module: { exports: {} } });
  vm.runInContext(fs.readFileSync(__dirname + '/howl-observer.cjs', 'utf8'), c); // 수정본 파일명
  return c.module.exports.createHowlObserver;
}

// ── root 재현 4건 ──
test('F1: getG 예외가 원 arena 실행을 막지 않음', () => {
  let calls = 0; const result = {}, scope = { playSample() {}, _enterBossArena() { calls++; return result; } };
  load()({ scope, getG() { throw Error('observation failed'); } });
  assert.equal(scope._enterBossArena(), result); assert.equal(calls, 1);
});
test('F2: phase/retry 증거 없으면 UNKNOWN, direct 추정 금지', () => {
  const scope = { G: {}, playSample() {}, _enterBossArena() { scope.playSample('boss_howl'); } };
  const h = load()({ scope }); scope._enterBossArena();
  assert.equal(h.report().counts.UNKNOWN, 1); assert.equal(h.judge().direct.length, 0);
});
test('F3: phase4 전 seal 1회는 미완료(비-PASS)', () => {
  const scope = { G: { _bossLoadPhase: 2 }, playSample() {}, _enterBossArena() { scope.playSample('boss_howl'); } };
  const h = load()({ scope }); scope._enterBossArena();
  assert.notEqual(h.judge().bossdoor[0].verdict, 'PASS');
  assert.equal(h.judge().bossdoor[0].verdict, 'UNKNOWN');
});
test('F4: episodes 상한(이벤트와 함께)', () => {
  const scope = { G: { _bossLoadPhase: 0 }, playSample() {}, _enterBossArena() { scope.playSample('boss_howl'); } };
  const h = load()({ scope, maxEvents: 3 }); for (let i = 0; i < 8; i++) scope._enterBossArena();
  assert.ok(h.report().episodes.length <= 3); assert.equal(h.report().droppedEpisodes, 5);
});

// ── 추가 검증 ──
test('보스문 정상 수정본: entrance만 → PASS', () => {
  const scope = { G: { _bossLoadPhase: 2 }, playSample() {},
    _enterBossArena() { if (scope.G._bossLoadPhase !== 2) scope.playSample('boss_howl'); } }; // fixed
  const h = load()({ scope }); scope._enterBossArena();
  scope.G._bossLoadPhase = 4; scope.playSample('boss_howl', 1.0); scope.G._bossLoadPhase = 0;
  assert.equal(h.judge().bossdoor[0].verdict, 'PASS');
});
test('보스문 미수정: seal+entrance → FAIL_DUPLICATE', () => {
  const scope = { G: { _bossLoadPhase: 2 }, playSample() {}, _enterBossArena() { scope.playSample('boss_howl', .6); } };
  const h = load()({ scope }); scope._enterBossArena();
  scope.G._bossLoadPhase = 4; scope.playSample('boss_howl', 1.0); scope.G._bossLoadPhase = 0;
  assert.equal(h.judge().bossdoor[0].verdict, 'FAIL_DUPLICATE');
});
test('재도전/직행: seal 1회 PASS', () => {
  const s1 = { G: { _bossLoadPhase: 0 }, playSample() {}, _enterBossArena() { s1.playSample('boss_howl'); } };
  const h1 = load()({ scope: s1 }); s1._enterBossArena(true); assert.equal(h1.judge().retry[0].verdict, 'PASS');
  const s2 = { G: { _bossLoadPhase: 0 }, playSample() {}, _enterBossArena() { s2.playSample('boss_howl'); } };
  const h2 = load()({ scope: s2 }); s2._enterBossArena(); assert.equal(h2.judge().direct[0].verdict, 'PASS');
});
test('this/args/return/throw 보존 — playSample', () => {
  const scope = { G: {}, playSample(k, v) { this._n = (this._n || 0) + 1; return k + '|' + v; } };
  const h = load()({ scope });
  const obj = {}; assert.equal(scope.playSample.call(obj, 'boss_howl', .6), 'boss_howl|0.6');
  assert.equal(obj._n, 1);
  scope.playSample = function () { throw Error('boom'); };
  const h2 = load()({ scope }); let msg = ''; try { scope.playSample('boss_howl'); } catch (e) { msg = e.message; }
  assert.equal(msg, 'boom'); assert.equal(h2.report().counts.UNKNOWN, 1);
});
test('this/args/return/throw 보존 — _enterBossArena', () => {
  const self = {}; const scope = { G: { _bossLoadPhase: 0 }, playSample() {},
    _enterBossArena() { this._ok = true; if (arguments[0] === 'X') throw Error('e'); return 42; } };
  const h = load()({ scope });
  assert.equal(scope._enterBossArena.call(self), 42); assert.equal(self._ok, true);
  let t = false; try { scope._enterBossArena('X'); } catch (_) { t = true; } assert.ok(t);
});
test('bounded events + dropped, 집계 유지', () => {
  const scope = { G: { _bossLoadPhase: 0, on: true, bossAlive: true }, playSample() {} };
  const h = load()({ scope, maxEvents: 3 }); for (let i = 0; i < 5; i++) scope.playSample('boss_howl', .8);
  assert.equal(h.report().events.length, 3); assert.equal(h.dropped, 2);
  // No arena hook was supplied: bounded capture must preserve UNKNOWN rather than infer phase-up.
  assert.equal(h.report().counts.UNKNOWN, 5);
});
test('frame 기본 null, getFrame 주입 시 사용', () => {
  const scope = { G: { _bossLoadPhase: 0, on: true, bossAlive: true, _gameFrame: 999 }, playSample() {} };
  const h = load()({ scope }); scope.playSample('boss_howl'); assert.equal(h.report().events[0].frame, null);
  let gf = 7; const s2 = { G: { _bossLoadPhase: 0, on: true, bossAlive: true }, playSample() {} };
  const h2 = load()({ scope: s2, getFrame: () => gf }); s2.playSample('boss_howl'); assert.equal(h2.report().events[0].frame, 7);
});
test('double-install/ cleanup / reinstall / 다른 wrapper 보존', () => {
  const scope = { G: {}, playSample(k, v) { return 'o:' + k; } }; const orig = scope.playSample;
  const h = load()({ scope }); const w = scope.playSample;
  assert.equal(load()({ scope }), h); assert.equal(scope.playSample, w);     // double-install: 동일 handle, 재래핑 없음
  const other = function () { return 'W:' + w.apply(this, arguments); }; scope.playSample = other; // 상위 wrapper
  const res = h.uninstall(); assert.equal(res.cleanlyRestored, false); assert.equal(scope.playSample, other); // 상위 보존
  scope.playSample('boss_howl'); assert.equal(h.report().counts.phaseup, 0);  // disabled → 기록 안 함
  scope.playSample = orig; const h3 = load()({ scope }); scope.playSample('boss_howl', .8); // reinstall
  assert.equal(h3.report().counts.UNKNOWN + h3.report().counts.phaseup, 1);
});
