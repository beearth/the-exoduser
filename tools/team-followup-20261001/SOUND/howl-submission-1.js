'use strict';
const { createHowlObserver } = require('./howl-observer.js'); // 또는 위 IIFE 로드 후 globalThis.createHowlObserver
let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? 'PASS ' : 'FAIL ') + m); };

function mkScope(fixedEnter) {
  const scope = {
    G: { _bossLoadPhase: 0, on: true, bossAlive: true, _gameFrame: 0 },
    playSample(key, vol, rate, pri) { this._n = (this._n || 0) + 1; return key + '|' + vol; }
  };
  // 실제 Site A: _enterBossArena 꼬리에서 봉인 포효. fixedEnter=true면 phase2에서 억제(수정본 모의)
  scope._enterBossArena = function (retry) {
    if (!(fixedEnter && scope.G._bossLoadPhase === 2)) scope.playSample('boss_howl', .6, .7);
    return 'arena';
  };
  return scope;
}

// 1) this/인수/반환/예외 보존
(() => {
  const s = mkScope(false); const h = createHowlObserver({ scope: s });
  const r = s.playSample.call({ tag: 'x' }, 'sword_swing1', .85, 1); // nonHowl
  ok(r === 'sword_swing1|0.85', 'return value preserved');
  s.playSample2 = s.playSample;
  const obj = {}; s.playSample.call(obj, 'boss_howl', .6); ok(obj._n === 1, 'this preserved');
  s.playSample = (function (orig) { return function () { throw new Error('boom'); }; })(s.playSample); // 교체 시뮬 생략
  h.uninstall();
})();

// 2) 예외 rethrow + 기록
(() => {
  const s = mkScope(false);
  const bad = () => { throw new Error('boom'); }; s.playSample = bad;
  const h = createHowlObserver({ scope: s });
  let threw = false; try { s.playSample('boss_howl', .6); } catch (e) { threw = e.message === 'boom'; }
  ok(threw, 'exception rethrown'); ok(h.report().counts.phaseup === 1, 'threw call still recorded'); h.uninstall();
})();

// 3) 보스문 정상(미수정) → 중복 2회
(() => {
  const s = mkScope(false); const h = createHowlObserver({ scope: s });
  s.G._bossLoadPhase = 2; s._enterBossArena();            // seal(A)
  s.G._bossLoadPhase = 4; s.playSample('boss_howl', 1.0, .9); // entrance(B)
  s.G._bossLoadPhase = 0;
  const j = h.judge(); ok(j.bossdoor[0].roars === 2 && j.bossdoor[0].verdict === 'FAIL_DUPLICATE', 'bossdoor duplicate detected'); h.uninstall();
})();

// 4) 보스문 정상(수정본) → 1회
(() => {
  const s = mkScope(true); const h = createHowlObserver({ scope: s });
  s.G._bossLoadPhase = 2; s._enterBossArena();            // seal 억제
  s.G._bossLoadPhase = 4; s.playSample('boss_howl', 1.0, .9); // entrance only
  s.G._bossLoadPhase = 0;
  const j = h.judge(); ok(j.bossdoor[0].roars === 1 && j.bossdoor[0].verdict === 'PASS', 'bossdoor fixed = 1 roar'); h.uninstall();
})();

// 5) 재도전 → 1
(() => {
  const s = mkScope(false); const h = createHowlObserver({ scope: s });
  s.G._bossLoadPhase = 0; s._enterBossArena(true);
  ok(h.judge().retry[0].verdict === 'PASS', 'retry 1 roar'); h.uninstall();
})();

// 6) 직행 → 1
(() => {
  const s = mkScope(false); const h = createHowlObserver({ scope: s });
  s.G._bossLoadPhase = 0; s._enterBossArena();
  ok(h.judge().direct[0].verdict === 'PASS', 'direct 1 roar'); h.uninstall();
})();

// 7) phase-up → phaseup 분류, 진입 판정 불변
(() => {
  const s = mkScope(false); const h = createHowlObserver({ scope: s });
  s.G._bossLoadPhase = 0; s.playSample('boss_howl', .8, .9);
  ok(h.report().counts.phaseup === 1, 'phaseup classified'); h.uninstall();
})();

// 8) UNKNOWN: 상태 불명
(() => {
  const s = mkScope(false); s.G = {}; const h = createHowlObserver({ scope: s });
  s.playSample('boss_howl', .8); ok(h.report().counts.UNKNOWN === 1, 'unknown when state missing'); h.uninstall();
})();

// 9) 중복설치 가드
(() => {
  const s = mkScope(false); const h1 = createHowlObserver({ scope: s }); const w = s.playSample;
  const h2 = createHowlObserver({ scope: s }); ok(h1 === h2 && s.playSample === w, 'double-install returns same handle, no re-wrap'); h1.uninstall();
})();

// 10) bounded buffer + dropped, 집계는 유지
(() => {
  const s = mkScope(false); const h = createHowlObserver({ scope: s, maxEvents: 3 });
  for (let i = 0; i < 5; i++) s.playSample('boss_howl', .8);
  ok(h.report().events.length === 3 && h.dropped === 2 && h.report().counts.phaseup === 5, 'bounded buffer drops, tally intact'); h.uninstall();
})();

// 11) cleanup 복원
(() => {
  const s = mkScope(false); const orig = s.playSample; const h = createHowlObserver({ scope: s });
  const res = h.uninstall(); ok(res.cleanlyRestored && s.playSample === orig, 'uninstall restores original');
  s.playSample('boss_howl', .8); ok(h.report().counts.phaseup === 0, 'no recording after uninstall');
})();

console.log(`\n${pass} passed, ${fail} failed`);
