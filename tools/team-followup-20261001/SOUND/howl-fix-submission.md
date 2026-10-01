4개 실패 원인과 제출 코드를 실제로 읽었습니다. 모두 수정한 완성본과 회귀 테스트를 제출합니다(파일 미작성·실행 안 함 — root가 저장·검증).

## 수정 매핑 (실패 → 조치)
1. **getG 예외가 arena 실행 차단**: `enterWrapper`/`snapState`의 모든 상태 읽기를 `safe()`로 감싸 예외를 삼키고 `undefined` 반환 → 원 `_enterBossArena`가 항상 실행·반환.
2. **phase/retry 정보 누락을 direct로 추정**: 증거 없을 때 `kind='unknown'`, `classify`는 `phaseAtEntry`가 숫자일 때만 `direct_seal`, 아니면 **UNKNOWN**. `judge`는 unknown episode를 direct/retry에 넣지 않음.
3. **phase4 전 seal 1회를 PASS로 오판**: bossdoor verdict를 `seal===0 && entrance===1`일 때만 PASS, `roars>=2`는 FAIL_DUPLICATE, 그 외(미완료 seal·무포효)는 **UNKNOWN**.
4. **episodes Map 무제한**: `maxEpisodes`(기본 `maxEvents`)로 상한, 초과 시 최상위(oldest) 제거 + `droppedEpisodes` 집계, 제거된 open episode는 `openBossdoorEpisode=null`.
- 추가 요구: frame은 `G._gameFrame` 추정 금지 → **기본 `null`**, `getFrame` 주입 시만 사용. 양 wrapper this/args/return/throw 보존, `disabled` 플래그로 다른 wrapper 보존·cleanup·reinstall 안전.

## 완성 JS

```javascript
'use strict';
/* S-11 howl observer (PREP, FIX) — read-only instrumentation, no production edit.
   createHowlObserver({ scope, playSampleName, enterScope, enterName, getG, getFrame,
                        howlKeys, maxEvents, maxEpisodes, recordAll }) */
(function (root) {
  const TAG = '__howlObs__';
  const nowMs = () => (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  const safe = (fn) => { try { return fn(); } catch (_) { return undefined; } };

  function createHowlObserver(opts) {
    opts = opts || {};
    const scope = opts.scope || (typeof globalThis !== 'undefined' ? globalThis : root);
    const psName = opts.playSampleName || 'playSample';
    const enterScope = opts.enterScope || scope;
    const enterName = opts.enterName || '_enterBossArena';
    const howlKeys = new Set(opts.howlKeys || ['boss_howl', 'boss_howl1']);
    const recordAll = !!opts.recordAll;
    const maxEvents = (opts.maxEvents | 0) || 512;
    const maxEpisodes = (opts.maxEpisodes | 0) || maxEvents;
    const getG = typeof opts.getG === 'function' ? opts.getG : function () { return scope.G; };
    // 기본 게임 frame은 전역 _gameFrame이며 도달 보장이 없으므로 추정 금지 → 주입 없으면 null.
    const getFrame = typeof opts.getFrame === 'function' ? opts.getFrame : function () { return null; };

    const ctx = { inEnter: false, enterDepth: 0, enterRetry: false, enterPhaseAtEntry: undefined,
                  episodeId: 0, enterAvailable: false };
    const counts = { bossdoor_seal: 0, bossdoor_entrance: 0, retry_seal: 0, direct_seal: 0,
                     phaseup: 0, UNKNOWN: 0, nonHowl: 0 };
    const episodes = new Map();   // episodeId -> {kind, phaseAtEntry, retry, seal, entrance, startT}
    const events = []; let dropped = 0, droppedEpisodes = 0;
    let openBossdoorEpisode = null;
    let installed = false, disabled = false;

    function pushEvent(ev) { if (events.length >= maxEvents) { events.shift(); dropped++; } events.push(ev); }
    function addEpisode(id, obj) {
      episodes.set(id, obj);
      while (episodes.size > maxEpisodes) {
        const oldest = episodes.keys().next().value;
        episodes.delete(oldest); droppedEpisodes++;
        if (oldest === openBossdoorEpisode) openBossdoorEpisode = null;
      }
    }

    function snapState() {
      const G = safe(getG);
      let frame; try { frame = getFrame(); } catch (_) { frame = null; }
      if (frame === undefined) frame = null;
      return {
        enterAvailable: ctx.enterAvailable, inEnter: ctx.inEnter, retry: ctx.enterRetry,
        phaseAtEntry: ctx.enterPhaseAtEntry, episodeId: ctx.episodeId,
        bossLoadPhase: (G && typeof G === 'object') ? G._bossLoadPhase : undefined,
        on: (G && typeof G === 'object') ? G.on : undefined,
        bossAlive: (G && typeof G === 'object')
          ? (G.bossAlive !== undefined ? G.bossAlive : (G._bossRef ? true : undefined)) : undefined,
        frame: frame
      };
    }

    function classify(key, st) {
      if (!howlKeys.has(key)) return 'nonHowl';
      if (st.enterAvailable && st.inEnter) {
        if (st.phaseAtEntry === 2) return 'bossdoor_seal';
        if (st.retry === true) return 'retry_seal';
        if (typeof st.phaseAtEntry === 'number') return 'direct_seal'; // 숫자 증거 있을 때만 direct
        return 'UNKNOWN';                                              // phase/retry 증거 없음 → 추측 금지
      }
      if (st.bossLoadPhase === 4) return 'bossdoor_entrance';
      if (!st.enterAvailable) return 'UNKNOWN';
      if (st.on === true && st.bossAlive === true) return 'phaseup';
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
    if (origPs[TAG]) return origPs[TAG];   // double-install guard

    function psWrapper() {
      if (disabled) return origPs.apply(this, arguments);
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
        if (disabled) return origEnter.apply(this, arguments);
        // 상태 읽기 실패가 원 호출을 막으면 안 됨 → 전부 safe()
        try {
          if (ctx.enterDepth === 0) {
            const G = safe(getG);
            const prevPhase = (G && typeof G === 'object') ? G._bossLoadPhase : undefined;
            ctx.inEnter = true; ctx.enterRetry = (arguments[0] === true); ctx.enterPhaseAtEntry = prevPhase;
            ctx.episodeId++;
            const kind = prevPhase === 2 ? 'bossdoor'
                       : ctx.enterRetry ? 'retry'
                       : (typeof prevPhase === 'number') ? 'direct'
                       : 'unknown';
            addEpisode(ctx.episodeId, { kind, phaseAtEntry: prevPhase, retry: ctx.enterRetry, seal: 0, entrance: 0, startT: nowMs() });
            if (kind === 'bossdoor') openBossdoorEpisode = ctx.episodeId;
          }
          ctx.enterDepth++;
        } catch (_) { /* context setup never blocks the real call */ }
        let ret, threw = false, err;
        try { ret = origEnter.apply(this, arguments); }   // preserve this/args/return
        catch (e) { threw = true; err = e; }
        try { ctx.enterDepth = Math.max(0, ctx.enterDepth - 1); if (ctx.enterDepth === 0) ctx.inEnter = false; } catch (_) {}
        if (threw) throw err;                              // preserve exception
        return ret;
      };
    }

    function report() {
      const eps = []; episodes.forEach((v, k) => eps.push(Object.assign({ episodeId: k }, v)));
      return { installed, disabled, enterAvailable: ctx.enterAvailable, counts: Object.assign({}, counts),
               dropped, droppedEpisodes, maxEvents, maxEpisodes, events: events.slice(), episodes: eps };
    }

    function judge() {
      const res = { bossdoor: [], retry: [], direct: [], phaseup: counts.phaseup, unknown: counts.UNKNOWN };
      episodes.forEach((e, k) => {
        if (e.kind === 'bossdoor') {
          const roars = e.seal + e.entrance;
          let verdict;
          if (e.seal === 0 && e.entrance === 1) verdict = 'PASS';
          else if (roars >= 2) verdict = 'FAIL_DUPLICATE';
          else verdict = 'UNKNOWN';   // 0회 또는 phase4 전 seal(미완료)
          res.bossdoor.push({ episodeId: k, seal: e.seal, entrance: e.entrance, roars, verdict });
        } else if (e.kind === 'retry') {
          res.retry.push({ episodeId: k, seal: e.seal, verdict: e.seal === 1 ? 'PASS' : e.seal === 0 ? 'FAIL_MISSING' : 'FAIL_EXTRA' });
        } else if (e.kind === 'direct') {
          res.direct.push({ episodeId: k, seal: e.seal, verdict: e.seal === 1 ? 'PASS' : e.seal === 0 ? 'FAIL_MISSING' : 'FAIL_EXTRA' });
        }
        // kind 'unknown' → 추측 금지: 판정에 포함하지 않음(counts.UNKNOWN에만 반영)
      });
      return res;
    }

    function uninstall() {
      let clean = true;
      disabled = true;   // 다른 wrapper가 위에 있어도 우리 층은 즉시 무해(pass-through)
      if (scope[psName] === psWrapper) scope[psName] = origPs; else clean = false;
      if (enterWrapper) { if (enterScope[enterName] === enterWrapper) enterScope[enterName] = origEnter; else clean = false; }
      installed = false;
      return { cleanlyRestored: clean };   // false = 상위 wrapper 존재로 완전복원 불가(상위 wrapper 보존)
    }

    scope[psName] = psWrapper;
    if (enterWrapper) enterScope[enterName] = enterWrapper;
    installed = true;
    const handle = { installed: true, reason: null, ctx, counts, events, report, judge, uninstall,
                     get dropped() { return dropped; }, get droppedEpisodes() { return droppedEpisodes; } };
    psWrapper[TAG] = handle; if (enterWrapper) enterWrapper[TAG] = handle;
    return handle;
  }

  root.createHowlObserver = createHowlObserver;
  if (typeof module !== 'undefined' && module.exports) module.exports = { createHowlObserver };
})(typeof globalThis !== 'undefined' ? globalThis : this);
```

## 회귀 테스트 (root 4건 + 추가, node:test)

```javascript
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function load() {
  const c = vm.createContext({ console, performance, module: { exports: {} } });
  vm.runInContext(fs.readFileSync(__dirname + '/howl-submission-1.js', 'utf8'), c); // 수정본 파일명
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
  assert.equal(h.report().events.length, 3); assert.equal(h.dropped, 2); assert.equal(h.report().counts.phaseup, 5);
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
```

## 제약·미실행
- **읽기 전용**: 실제 파일 2개(`howl-submission-0.js`, `howl-root-review.test.cjs`)만 Read. 수정본/테스트는 **답변 코드로 인계**(파일 미작성). root가 `tools/team-followup-20261001/SOUND/`에 저장(예: `howl-submission-1.js`) 후 모의검증.
- 게임/오디오/브라우저/서버/공용 생산파일/Git/새 세션 없음. 생산 hunk 적용은 범위 밖.
- frame은 `G._gameFrame` 추정을 제거하고 기본 `null`, 실제 전역 `_gameFrame`은 root가 `getFrame:()=>_gameFrame`로 올바른 스코프에서 주입해야 값이 들어감(미주입 시 null 명시).

수신·Read 착수·완료를 구분해 보고했습니다. 소유권 밖(저장·검증·적용)은 실행하지 않고 인계합니다.