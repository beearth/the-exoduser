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
    const maxEvents = opts.maxEvents === undefined ? 512 : opts.maxEvents;
    const maxEpisodes = opts.maxEpisodes === undefined ? maxEvents : opts.maxEpisodes;
    for (const limit of [maxEvents, maxEpisodes]) {
      if (!Number.isSafeInteger(limit) || limit < 1 || limit > 4096)
        throw new RangeError('observer capacities must be integers from 1 to 4096');
    }
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
        if (st.phaseAtEntry === 0) return 'direct_seal'; // 알려진 비전환 phase 0일 때만 direct
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
                       : (prevPhase === 0) ? 'direct'
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
