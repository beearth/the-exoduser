수신·첫 Read는 이미 마쳤고(`playSample(key,vol,rate,pri)` 시그니처 확인, 최상위 함수 선언), 이번은 관측기 작성입니다. 이전 경로 읽기 결과는 재작성하지 않습니다. 실행 가능한 관측기 JS·판정 규칙·모의 테스트를 제출합니다(파일 미작성·게임/음성/서버 미실행 — root가 저장·모의검증).

## 관측기 설계 요지
- `playSample`를 래핑해 호출마다 **자원명(args[0])·볼륨(args[1])·rate(args[2])·pri(args[3])·시점**을 수집. 원 함수의 `this/인수/반환/예외`를 보존(원 호출 후 기록, 예외는 그대로 rethrow).
- 경로 구별은 **추측 없이 주입된 런타임 상태로만** 판정: `_enterBossArena`를 얇게 래핑해 진입 시 `retry` 인수와 `_bossLoadPhase`(진입 시점)를 컨텍스트로 기록 → 봉인 포효(A)를 boss-door/재도전/직행으로 분류. 입장 포효(B)는 `_bossLoadPhase===4`, 교전 phase-up(C)은 `_enterBossArena` 밖 + 교전 중으로 분류. 정보 부족 시 **UNKNOWN**.
- 중복설치 가드(래퍼 태그), cleanup(원본 복원·불가 시 보고), bounded ring buffer + dropped 카운트, 집계(counts)는 버퍼와 독립 유지.

## 관측기 JS

```javascript
'use strict';
/* S-11 howl observer (PREP) — read-only instrumentation, no production edit.
   createHowlObserver({ scope, playSampleName, enterScope, enterName, getG, howlKeys, maxEvents, recordAll }) */
(function (root) {
  const TAG = '__howlObs__';
  const nowMs = () => (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

  function createHowlObserver(opts) {
    opts = opts || {};
    const scope = opts.scope || (typeof globalThis !== 'undefined' ? globalThis : root);
    const psName = opts.playSampleName || 'playSample';
    const enterScope = opts.enterScope || scope;
    const enterName = opts.enterName || '_enterBossArena';
    const howlKeys = new Set(opts.howlKeys || ['boss_howl', 'boss_howl1']);
    const recordAll = !!opts.recordAll;
    const maxEvents = (opts.maxEvents | 0) || 512;
    const getG = opts.getG || function () { return scope.G; };

    const ctx = { inEnter: false, enterDepth: 0, enterRetry: false, enterPhaseAtEntry: undefined,
                  episodeId: 0, enterAvailable: false };
    const counts = { bossdoor_seal: 0, bossdoor_entrance: 0, retry_seal: 0, direct_seal: 0,
                     phaseup: 0, UNKNOWN: 0, nonHowl: 0 };
    const episodes = new Map();   // episodeId -> {kind, phaseAtEntry, retry, seal, entrance, startT}
    const events = []; let dropped = 0;
    let openBossdoorEpisode = null;
    let installed = false;

    function pushEvent(ev) { if (events.length >= maxEvents) { events.shift(); dropped++; } events.push(ev); }

    function snapState() {
      const G = getG && getG();
      return {
        enterAvailable: ctx.enterAvailable, inEnter: ctx.inEnter, retry: ctx.enterRetry,
        phaseAtEntry: ctx.enterPhaseAtEntry, episodeId: ctx.episodeId,
        bossLoadPhase: G ? G._bossLoadPhase : undefined,
        on: G ? G.on : undefined,
        bossAlive: G ? (G.bossAlive !== undefined ? G.bossAlive : (G._bossRef ? true : undefined)) : undefined,
        frame: G ? G._gameFrame : undefined
      };
    }

    function classify(key, st) {
      if (!howlKeys.has(key)) return 'nonHowl';
      if (st.enterAvailable && st.inEnter) {
        if (st.phaseAtEntry === 2) return 'bossdoor_seal';   // 보스문 정상: phase2에서 _enterBossArena 호출
        if (st.retry === true) return 'retry_seal';          // 재도전: _enterBossArena(true)
        return 'direct_seal';                                 // 직행/테스트: phase 미개입
      }
      if (st.bossLoadPhase === 4) return 'bossdoor_entrance'; // 입장 연출(phase4) 포효
      if (!st.enterAvailable) return 'UNKNOWN';               // enter 래핑 불가 → seal/phaseup 구별 불가, 추측 금지
      if (st.on === true && st.bossAlive === true) return 'phaseup'; // 교전 중 페이즈업 포효
      return 'UNKNOWN';
    }

    function record(args, threw) {
      const key = args[0], st = snapState(), cls = classify(key, st);
      counts[cls] = (counts[cls] || 0) + 1;
      const ev = { t: nowMs(), key: key, vol: args[1], rate: args[2], pri: args[3], cls: cls,
                   inEnter: st.inEnter, retry: st.retry, phaseAtEntry: st.phaseAtEntry,
                   bossLoadPhase: st.bossLoadPhase, frame: st.frame, episodeId: st.episodeId, threw: !!threw };
      if (cls !== 'nonHowl' || recordAll) pushEvent(ev);
      if (cls === 'bossdoor_seal' || cls === 'retry_seal' || cls === 'direct_seal') {
        const e = episodes.get(st.episodeId); if (e) e.seal++;
      } else if (cls === 'bossdoor_entrance' && openBossdoorEpisode != null) {
        const e = episodes.get(openBossdoorEpisode); if (e) e.entrance++;
      }
    }

    const origPs = scope[psName];
    if (typeof origPs !== 'function')
      return { installed: false, reason: psName + ' not found', counts, events, report, judge, uninstall() {} };
    if (origPs[TAG]) return origPs[TAG];   // double-install guard: return existing handle, no re-wrap

    function psWrapper() {
      let ret, threw = false, err;
      try { ret = origPs.apply(this, arguments); }   // preserve this/args/return
      catch (e) { threw = true; err = e; }
      try { record(arguments, threw); } catch (_) { /* observer never breaks the game */ }
      if (threw) throw err;                           // preserve exception
      return ret;
    }

    const origEnter = enterScope[enterName];
    let enterWrapper = null;
    if (typeof origEnter === 'function' && !origEnter[TAG]) {
      ctx.enterAvailable = true;
      enterWrapper = function () {
        const G = getG && getG();
        const prevPhase = G ? G._bossLoadPhase : undefined;
        if (ctx.enterDepth === 0) {
          ctx.inEnter = true; ctx.enterRetry = !!arguments[0]; ctx.enterPhaseAtEntry = prevPhase;
          ctx.episodeId++;
          const kind = prevPhase === 2 ? 'bossdoor' : (ctx.enterRetry ? 'retry' : 'direct');
          episodes.set(ctx.episodeId, { kind, phaseAtEntry: prevPhase, retry: ctx.enterRetry, seal: 0, entrance: 0, startT: nowMs() });
          if (kind === 'bossdoor') openBossdoorEpisode = ctx.episodeId;
        }
        ctx.enterDepth++;
        let ret, threw = false, err;
        try { ret = origEnter.apply(this, arguments); }
        catch (e) { threw = true; err = e; }
        ctx.enterDepth--;
        if (ctx.enterDepth === 0) ctx.inEnter = false;
        if (threw) throw err;
        return ret;
      };
    }

    function report() {
      const eps = []; episodes.forEach((v, k) => eps.push(Object.assign({ episodeId: k }, v)));
      return { installed, enterAvailable: ctx.enterAvailable, counts: Object.assign({}, counts),
               dropped, events: events.slice(), episodes: eps };
    }

    function judge() {
      const res = { bossdoor: [], retry: [], direct: [], phaseup: counts.phaseup, unknown: counts.UNKNOWN };
      episodes.forEach((e, k) => {
        if (e.kind === 'bossdoor') {
          const roars = e.seal + e.entrance;
          const verdict = roars === 0 ? 'UNKNOWN' : roars >= 2 ? 'FAIL_DUPLICATE' : 'PASS';
          res.bossdoor.push({ episodeId: k, seal: e.seal, entrance: e.entrance, roars, verdict });
        } else if (e.kind === 'retry') {
          res.retry.push({ episodeId: k, seal: e.seal, verdict: e.seal === 1 ? 'PASS' : e.seal === 0 ? 'FAIL_MISSING' : 'FAIL_EXTRA' });
        } else if (e.kind === 'direct') {
          res.direct.push({ episodeId: k, seal: e.seal, verdict: e.seal === 1 ? 'PASS' : e.seal === 0 ? 'FAIL_MISSING' : 'FAIL_EXTRA' });
        }
      });
      return res;
    }

    function uninstall() {
      let clean = true;
      if (scope[psName] === psWrapper) scope[psName] = origPs; else clean = false;
      if (enterWrapper) { if (enterScope[enterName] === enterWrapper) enterScope[enterName] = origEnter; else clean = false; }
      installed = false;
      return { cleanlyRestored: clean };   // false = 다른 래퍼가 위에 설치됨 → 안전하게 완전복원 불가
    }

    scope[psName] = psWrapper;
    if (enterWrapper) enterScope[enterName] = enterWrapper;
    installed = true;
    const handle = { installed: true, reason: null, ctx, counts, events, report, judge, uninstall,
                     get dropped() { return dropped; } };
    psWrapper[TAG] = handle; if (enterWrapper) enterWrapper[TAG] = handle;
    return handle;
  }

  root.createHowlObserver = createHowlObserver;
  if (typeof module !== 'undefined' && module.exports) module.exports = { createHowlObserver };
})(typeof globalThis !== 'undefined' ? globalThis : this);
```

## 판정 규칙

| 경로 | 분류 조건(관측) | 통과 기준 | 실패/UNKNOWN |
|---|---|---|---|
| 보스문 정상 | `inEnter && phaseAtEntry===2`(seal) + `bossLoadPhase===4`(entrance), 같은 episode | roars(seal+entrance)==1 → **PASS** | ≥2 → **FAIL_DUPLICATE**(현재 미수정 상태의 기대값), 0 → UNKNOWN |
| 재도전 | `inEnter && retry===true` | seal==1 → PASS | 0 FAIL_MISSING / ≥2 FAIL_EXTRA |
| 직행/테스트 | `inEnter && phase≠2 && !retry` | seal==1 → PASS | 0 FAIL_MISSING / ≥2 FAIL_EXTRA |
| 교전 phase-up | `!inEnter && !phase4 && on && bossAlive` | 집계만(진입 판정과 무관) | 상태 불명 → UNKNOWN |

- `enterAvailable===false`(=_enterBossArena 래핑 불가)면 seal/phaseup 구별 불가 → **UNKNOWN**으로만 기록(추측 금지).
- 수정 적용 후 기대: 보스문 정상 `seal==0, entrance==1 → roars1 PASS`. 재도전·직행 `seal==1 PASS` 유지. phase-up 불변.

## 모의 테스트 (root 검증용)

```javascript
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
```

## 제약·미실행 (명시)
- **실행 안 함**: 이 세션에서 관측기/테스트를 구동하지 않았습니다(코드·테스트 제출만). root가 SOUND 소유 경로에 저장 후 모의검증.
- **설치 지점 가정**: 관측기는 주입된 `scope`/`getG`에만 의존 — `playSample`가 전역에서 도달 가능하면 기본 `globalThis`로, 폐쇄 스코프면 root가 올바른 참조를 주입해야 내부 호출을 포착(미확인 시 추측 금지로 UNKNOWN 처리).
- **경로 구별**은 주입 상태(`_bossLoadPhase`, retry, `inEnter`)로만 수행 — 정보 없으면 UNKNOWN. 음성 재생·게임/서버 실행·생산/공유문서 편집·병합·삭제·인코딩 없음.
- **생산 hunk 적용은 범위 밖**: 관측기는 수정 전/후(미수정=중복2, 수정=1) 양쪽을 동일 규칙으로 판정하도록만 설계. 양쪽 파일 적용 여부는 보고하지 않습니다.

소유권 밖(파일 저장·모의검증·적용)은 실행하지 않고 인계합니다.
