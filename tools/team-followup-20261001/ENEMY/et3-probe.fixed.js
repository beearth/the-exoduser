/* ENEMY-TYPE3-PROBE-FIX — 정규 필드 etype3 자연 첫 탄막 관측 프로브 (교정본)
 * 원본: docs/0마스터플랜/mac-resume-20261001/r-input-evidence/evidence.zip!candidates/ENEMY.js
 * 정적검증: 같은 zip!candidates/검증결과.md + validation-manifest.json (ENEMY static_review)
 * 대조 기준 소스: game.html HEAD 30a204a7 (sha256 593a7a9d84c78402f04c50c94ae169e237e49751ad58d8640e78e672850728f2)
 *
 * 수정 범위 = 관측 정확성 결함 5건만. 탄 수명·스폰·전투 수치·어택티켓은 건드리지 않는다(관측 전용).
 *
 * [F1] lexical G/P/ens/projs/ETYPE_RANGE 접근
 *   소스 근거: game.html:15778 `let G`, 15783 `let P,ens,projs`, 29473 `const ETYPE_RANGE`.
 *   window.G/P/ens/ETYPE_RANGE 공개 대입 없음(grep 0건). 원본은 root.G 등 window 속성으로 읽어 undefined.
 *   → 베어 식별자(typeof 가드)로 읽는다. 함수 _fireChargedProj/_spawnBossProjectile 은
 *     최상위 function 선언이라 전역 바인딩=window 속성이며 재대입 시 내부 호출부
 *     (game.html:18893 `_fireChargedProj(e)`, 37337 `_tickProjCharge→_fireChargedProj`)가 그 값을 해석한다.
 *
 * [F2] projT 재설정 차징 감지
 *   소스 근거: game.html:38970 `if(e.projT<=0&&d<_eRange){e.projT=e.projCd; … 38975 e._projChargeT=60}`.
 *   차징 개시 바로 그 프레임에 projT 가 projCd(≈240, 양수)로 즉시 리셋된다.
 *   원본의 `lastProjT>0 && projT<=0 && _projChargeT>0` 판정은 projT 가 이미 양수라 차징 시작을 놓친다.
 *   → `_projChargeT` 의 0/undefined → 양수 전이로 차징 개시를 포착한다.
 *
 * [F3] 실제 투사체 commit 이후 판정
 *   소스 근거: game.html:18860 _fireChargedProj → 매 분기 spawnProj({..._commit:true}) 1발 + _cancelProjCharge.
 *   원본은 orig 호출 '전' firstFire 를 기록해 실제 커밋을 증명하지 못한다.
 *   → orig 를 먼저 호출하고, projs 길이 증가(≥1)로 커밋을 확인한 뒤에만 firstFire 를 확정한다.
 *
 * [F4] 개체 전환 / 실제 simulation tick
 *   소스 근거: G.frame 은 game.html 어디에도 대입되지 않아 항상 undefined(원본 curFrame()→ -1).
 *     실제 physics-tick 카운터는 `let _gameFrame`(30689) 이며 physics tick 당 1회 증가(30727).
 *   원본은 rAF 콜백 수를 tick 으로 세어 고주사율에서 450tick 예산이 왜곡되고, 대상 사망 후
 *     새 개체로 갈아타며 residency/firstFire/chargeStart 를 섞는다.
 *   → tick 회계는 `_gameFrame` 증가분으로만 센다(rAF 는 스케줄러일 뿐). 대상은 1회 고정하고,
 *     대상이 사라지면 섞지 않고 targetLost 로 관측을 종료한다.
 *
 * [F5] wrapper 소유권 / 재설치
 *   원본 stop 은 현재 바인딩이 자기 wrapper 인지 확인하지 않고 복원하며, install 중복 호출 시
 *     wrapper 를 원본으로 다시 저장할 수 있다.
 *   → wrapper 에 소유 태그(__et3probe)를 달고, 설치 시 기존 자기 wrapper 는 먼저 dispose(원함수 복원)한 뒤
 *     재설치한다. stop 은 현재 바인딩===자기 wrapper 일 때만 복원하고 namespace 를 정리한다.
 *
 * read-only: 게임 수치/배열에 쓰지 않는다. 함수 바인딩은 pass-through wrapper 로만 교체·복원한다.
 */
(function (global) {
  'use strict';

  var OWN = '__et3probe';            // wrapper 소유 태그
  var WRAP_NAMES = ['_fireChargedProj', '_spawnBossProjectile'];

  // ── 브라우저 호스트: 베어 lexical 식별자를 안전히 읽고, 함수 전역 바인딩을 교체/복원 ──
  function makeBrowserHost() {
    return {
      getG:    function () { try { return (typeof G    !== 'undefined') ? G    : null; } catch (e) { return null; } },
      getP:    function () { try { return (typeof P    !== 'undefined') ? P    : null; } catch (e) { return null; } },
      getEns:  function () { try { return (typeof ens  !== 'undefined') ? ens  : null; } catch (e) { return null; } },
      getProjs:function () { try { return (typeof projs!== 'undefined') ? projs: null; } catch (e) { return null; } },
      getRange:function () { try { return (typeof ETYPE_RANGE !== 'undefined') ? ETYPE_RANGE : null; } catch (e) { return null; } },
      // _gameFrame: 실제 physics-tick 카운터. G.frame 은 미대입(undefined)이라 쓰지 않는다.
      getTick: function () { try { return (typeof _gameFrame !== 'undefined') ? _gameFrame : null; } catch (e) { return null; } },
      getFn:   function (name) { return (typeof global[name] === 'function') ? global[name] : null; },
      setFn:   function (name, fn) { global[name] = fn; },
      raf:     function (cb) { return global.requestAnimationFrame(cb); },
      caf:     function (id) { try { global.cancelAnimationFrame(id); } catch (e) {} }
    };
  }

  function createProbe(host) {
    var P = {
      KEY: 'et3-natural-firstfire',
      host: host,
      installedTick: null,            // 설치 시 _gameFrame
      target: null,
      spawn: null,                    // 최초 포착 스냅샷
      chargeStartTick: null, chargeStartD: null, chargeStartProjChargeT: null,
      prevProjChargeT: null,          // F2: _projChargeT 전이 추적
      firstFire: null,                // F3: 커밋 확인된 첫 발사
      pendingFire: null,              // orig 호출 직전 스냅샷(커밋 확인 대기)
      edgeFire: null,
      inRangeTicks: 0, aliveTicks: 0, frozenTicks: 0, stunnedTicks: 0,  // F4: _gameFrame 단위
      lastCountedTick: null,          // F4: 같은 tick 중복 집계 방지
      sampleStates: {}, dHistory: [],
      raf: 0, wrapped: {}, done: false, targetLost: false, err: null
    };

    function tick() { var t = host.getTick(); return (typeof t === 'number') ? t : null; }
    function range3() {
      var R = host.getRange();
      var v = R && R[3];
      return (typeof v === 'number' && v > 0) ? v : 200;   // ETYPE_RANGE[3]=200 (game.html:29473~)
    }
    function distToP(e) {
      var pl = host.getP();
      if (!pl || typeof pl.x !== 'number') return Infinity;
      return Math.hypot(pl.x - e.x, pl.y - e.y);
    }
    // 정규 스폰 자연 etype3 1마리(보스/레어/디코이 제외)
    function findTargetEt3() {
      var ens = host.getEns();
      if (!Array.isArray(ens)) return null;
      for (var i = 0; i < ens.length; i++) {
        var e = ens[i];
        if (e && e.alive && e.etype === 3 && !e.ib && !e._isRare && !e._isDecoy) return e;
      }
      return null;
    }

    // ── F5: 소유 기반 설치/복원 ──
    function installWrap(name, make) {
      var cur = host.getFn(name);
      if (cur && cur[OWN]) {                 // 기존 자기 wrapper → 먼저 원복(원함수 재수집 보장)
        var underlying = cur[OWN].orig || null;
        if (underlying) host.setFn(name, underlying);
        cur = host.getFn(name);
      }
      if (!cur) { P.wrapped[name] = false; return; }   // 대상 함수 없음
      var wrapper = make(cur);
      wrapper[OWN] = { orig: cur };
      host.setFn(name, wrapper);
      P.wrapped[name] = wrapper;             // 우리가 설치한 wrapper 참조 보관
    }
    function restoreWrap(name) {
      var mine = P.wrapped[name];
      if (!mine) return;
      var cur = host.getFn(name);
      if (cur === mine && mine[OWN]) host.setFn(name, mine[OWN].orig);  // 소유 일치할 때만 복원
      P.wrapped[name] = false;
    }

    P.install = function () {
      P.installedTick = tick();
      P.prevProjChargeT = null;

      // F3: 정상 차징 발사 경로. orig 를 먼저 호출하고 projs 증가로 커밋 확인 후 firstFire 확정.
      installWrap('_fireChargedProj', function (orig) {
        return function (e) {
          var isTarget = (!P.done && e && e === P.target && !P.firstFire);
          var preLen = isTarget ? ((host.getProjs() || []).length) : 0;
          var preSnap = isTarget ? {
            tick: tick(),
            tickSinceChargeStart: (P.chargeStartTick != null && tick() != null) ? (tick() - P.chargeStartTick) : null,
            s: e.s, projChargeT: e._projChargeT, projCd: e.projCd,
            bean: e._projChargeBean || null, el: e.el, d: distToP(e)
          } : null;
          var ret = orig.apply(this, arguments);   // 원함수 그대로 호출(상태 불변)
          if (isTarget) {
            var postLen = (host.getProjs() || []).length;
            if (postLen > preLen) {                // 실제 투사체 1발 이상 커밋됨
              preSnap.path = 'charged(spawnProj _commit)';
              preSnap.committed = true;
              preSnap.projsDelta = postLen - preLen;
              P.firstFire = preSnap;
            } else {                               // 호출됐으나 커밋 미확인 — 별도 기록, PASS 아님
              P.pendingFire = { tick: preSnap.tick, s: preSnap.s, note: 'orig 호출됐으나 projs 증가 없음(커밋 미확인)' };
            }
          }
          return ret;
        };
      });
      // 에지 경로(_spawnBossProjectile): 강제/eCircle 계열. 자연 차징이 아님.
      installWrap('_spawnBossProjectile', function (orig) {
        return function (e, shot) {
          if (!P.done && e && e === P.target && !P.edgeFire) {
            P.edgeFire = { path: 'edge(_spawnBossProjectile)', tick: tick(), s: e.s, d: distToP(e) };
          }
          return orig.apply(this, arguments);
        };
      });

      var R = range3();
      function sample() {
        if (P.done) return;
        try {
          // F4: 대상 1회 고정. 이미 포착한 대상이 사라지면 섞지 않고 종료 플래그.
          if (!P.target) {
            var e0 = findTargetEt3();
            if (e0) {
              P.target = e0;
              P.spawn = { tick: tick(), s: e0.s, projCd: e0.projCd, projT0: e0.projT,
                st2: e0.st2, el: e0.el, d: distToP(e0), x: e0.x, y: e0.y };
              P.prevProjChargeT = e0._projChargeT || 0;
              P.lastCountedTick = null;
            }
          } else if (!P.target.alive) {
            P.targetLost = true;      // 다른 개체로 갈아타지 않음(혼합 방지)
          }

          if (P.target && !P.targetLost) {
            var tgt = P.target, d = distToP(tgt), tk = tick();
            // F4: _gameFrame 이 실제로 증가한 tick 에서만 residency 집계(rAF 중복 제거)
            var advanced = (tk == null) || (P.lastCountedTick == null) || (tk > P.lastCountedTick);
            if (advanced) {
              P.aliveTicks += tgt.alive ? 1 : 0;
              if (tgt.alive && d < R) P.inRangeTicks++;
              if ((tgt._frozen || 0) > 0) P.frozenTicks++;
              if ((tgt.stunned || 0) > 0) P.stunnedTicks++;
              P.lastCountedTick = tk;
            }
            P.sampleStates[tgt.s] = (P.sampleStates[tgt.s] || 0) + 1;

            // F2: _projChargeT 0/undefined → 양수 전이 = 차징 개시
            var pc = tgt._projChargeT || 0, prev = P.prevProjChargeT || 0;
            if (prev <= 0 && pc > 0 && P.chargeStartTick == null) {
              P.chargeStartTick = tk; P.chargeStartD = d; P.chargeStartProjChargeT = pc;
            }
            P.prevProjChargeT = pc;

            if (P.dHistory.length < 2000 && advanced && tk != null && (tk % 15 === 0))
              P.dHistory.push([tk, Math.round(d), tgt.s, Math.round(tgt.projT || 0), Math.round(pc)]);
          }
        } catch (err) { P.err = String((err && err.stack) || err); }
        P.raf = host.raf(sample);
      }
      P.raf = host.raf(sample);
      return { installedAtTick: P.installedTick, range: R,
        wrapped: WRAP_NAMES.filter(function (k) { return !!P.wrapped[k]; }),
        tickSource: (tick() == null ? 'unavailable(_gameFrame)' : '_gameFrame') };
    };

    P.stop = function () {
      P.done = true;
      if (P.raf) host.caf(P.raf);
      WRAP_NAMES.forEach(restoreWrap);     // F5: 소유 일치 시에만 복원
      return P.report();
    };

    // 단발 샘플(모의 테스트용). 실환경에선 rAF 가 호출.
    P._sampleOnce = function () {
      // install 의 sample 과 동일 로직을 1회만. 테스트에서 raf 를 수동 구동할 때 사용.
      // (install 에서 raf 가 sample 을 재귀 호출하므로, 모의 raf 가 즉시 1회 실행하면 됨)
    };

    // ── 판정 ──
    P.report = function () {
      var R = range3();
      var budget = 300 + 60 + 90;     // F4: _gameFrame(60tps) 기준 sim-tick. projT0 max300 + 차징60 + 여유90
      var nowT = tick();
      var elapsed = (nowT != null && P.installedTick != null) ? (nowT - P.installedTick) : null;
      var v = { verdict: 'INCONCLUSIVE', reasons: [] };

      if (P.err) v.reasons.push('probe_error:' + P.err);

      if (P.targetLost && !P.firstFire) {
        v.verdict = 'INCONCLUSIVE';
        v.reasons.push('포착한 etype3 대상이 발사 전 사망/소멸 — 혼합 방지로 종료(재관측 필요). 공격전무 단정 아님');
      } else if (!P.target) {
        v.verdict = 'FAIL_DETECT';
        v.reasons.push('정규 CH1 필드에서 자연 etype3 미포착(스폰/필드 조건 확인 필요, 공격전무로 단정 금지)');
      } else if (P.firstFire) {
        var okState = P.firstFire.s === 'idle';   // game.html:38915 case'idle' 안에서 차징 개시
        var okPath  = P.firstFire.path.indexOf('charged') === 0;
        var okCommit = P.firstFire.committed === true;
        var ts = P.firstFire.tickSinceChargeStart;
        var okTick = (ts == null) || (ts >= 55 && ts <= 70);  // 차징 60f(_projChargeT=60)
        if (okState && okPath && okCommit) {
          v.verdict = 'PASS';
          v.reasons.push('자연 idle→차징(_projChargeT 60)→_fireChargedProj→spawnProj(_commit) 커밋 1발 확인(projsΔ=' + P.firstFire.projsDelta + ')');
          if (!okTick) v.reasons.push('주의: 차징→발사 간격이 60f(±) 밖 — ' + ts + ' sim-tick');
        } else {
          v.verdict = 'FAIL_PATH';
          if (!okState)  v.reasons.push('첫 발사시 e.s!==idle (' + P.firstFire.s + ') — 자연경로 아님');
          if (!okPath)   v.reasons.push('첫 발사가 charged 경로 아님(' + P.firstFire.path + ')');
          if (!okCommit) v.reasons.push('투사체 커밋(projs 증가) 미확인 — _fireChargedProj 호출만으로 PASS 금지');
        }
      } else if (P.pendingFire) {
        v.verdict = 'FAIL_PATH';
        v.reasons.push('_fireChargedProj 호출됐으나 projs 증가 없음(커밋 실패) — ' + P.pendingFire.note);
      } else if (P.edgeFire) {
        v.verdict = 'FAIL_PATH';
        v.reasons.push('charged 발사 없이 edge(_spawnBossProjectile)만 — 강제/eCircle 경로. 공격전무 재주장 아님');
      } else {
        if (P.inRangeTicks >= 120 && P.aliveTicks >= budget && P.frozenTicks === 0 && P.stunnedTicks === 0) {
          v.verdict = 'FAIL_NO_FIRE';
          v.reasons.push('d<' + R + ' 체류 ' + P.inRangeTicks + ' sim-tick·생존 ' + P.aliveTicks +
            ' sim-tick인데 차징 발사 0 — 자연 발사 누락(실결함 후보)');
        } else {
          v.verdict = 'INCONCLUSIVE';
          v.reasons.push('사거리 체류 ' + P.inRangeTicks + ' sim-tick/생존 ' + P.aliveTicks +
            '/빙결 ' + P.frozenTicks + '/스턴 ' + P.stunnedTicks +
            ' — 미발사가 결함인지 판정 불가(더 오래 사거리 유지 필요)');
        }
      }

      var out = {
        key: P.KEY, observedAt: new Date().toISOString(),
        tickSource: (nowT == null ? 'unavailable(_gameFrame)' : '_gameFrame'),
        gameTickNow: nowT, installedTick: P.installedTick, elapsedTicks: elapsed,
        range: R, budgetTicks: budget,
        spawnSnapshot: P.spawn,
        chargeStart: P.chargeStartTick == null ? null :
          { tick: P.chargeStartTick, d: Math.round(P.chargeStartD), projChargeT: P.chargeStartProjChargeT },
        firstFire: P.firstFire, pendingFire: P.pendingFire, edgeFire: P.edgeFire,
        targetLost: P.targetLost,
        residency: { inRangeTicks: P.inRangeTicks, aliveTicks: P.aliveTicks,
          frozenTicks: P.frozenTicks, stunnedTicks: P.stunnedTicks },
        stateHistogram: P.sampleStates, dHistory: P.dHistory,
        wrapped: WRAP_NAMES.filter(function (k) { return !!P.wrapped[k]; }),
        probeError: P.err
      };
      out.verdict = v.verdict; out.reasons = v.reasons;
      return out;
    };

    return P;
  }

  // 공개: 팩토리(테스트 주입) + 브라우저 자동 부트스트랩
  global.__createET3Probe = createProbe;
  global.__makeET3BrowserHost = makeBrowserHost;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createProbe: createProbe, makeBrowserHost: makeBrowserHost, OWN: OWN, WRAP_NAMES: WRAP_NAMES };
  }
  if (typeof global.requestAnimationFrame === 'function') {
    if (global.__ET3_PROBE && global.__ET3_PROBE.stop) { try { global.__ET3_PROBE.stop(); } catch (e) {} }
    global.__ET3_PROBE = createProbe(makeBrowserHost());
    // 사용: window.__ET3_PROBE.install(); …정규 CH1-1 교전… JSON.stringify(window.__ET3_PROBE.stop())
  }
})(typeof window !== 'undefined' ? window : globalThis);
