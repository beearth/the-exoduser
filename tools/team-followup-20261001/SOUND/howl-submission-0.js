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
