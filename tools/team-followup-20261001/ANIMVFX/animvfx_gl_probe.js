/*
 * ANIMVFX-GL-PROBE-FIX — 독립 GL 피격/사망/부활 관측 프로브 (브라우저 read-gate + install/dispose)
 * 소유: ANIMVFX / 터미널 8. 경로: tools/team-followup-20261001/ANIMVFX/animvfx_gl_probe.js
 *
 * r-input-20261001/candidates/ANIMVFX.js(= evidence.zip:candidates/ANIMVFX.js)의 독립 사본·보강.
 * 검증결과.md ANIMVFX 게이트 반영:
 *   (1) 임시 WebGL2 컨텍스트 생성 제거 — document.createElement('canvas').getContext('webgl2')로
 *       일회용 GL을 만들고 참조를 버리던 줄(:20)을 삭제. GL 존재는 게임 실제 백엔드로만 판정.
 *   (2) flashPathReady에 실제 플래시 모드 e._ensGLMode===1(몹 단위)과 게임 진행/일시정지(G.on/G.paused)를 반영.
 *   (3) GL null 구분(contextLost=null=측정불가)은 타당하므로 유지.
 * 추가: 실행/일시정지 게이트, 정리/재설치(dispose·중복설치 가드), GL없음/contextLost/표본0/
 *       동일 객체 부활 vs 새 구울을 구분하는 기록 스키마.
 *
 * ★ 이 파일은 "브라우저에서 실행하지 않는다"(ANIMVFX은 QA 종료 인계 전 게임/브라우저 보류).
 *   본 세션 검수는 node --check 구문 검사 + mock 검증기(animvfx_gl_validator.mjs)뿐이다.
 *   게임 상태 불변(read-only read-gate + 복원 가능한 래퍼). hurtE·death/alive·보상·시체·쿨다운 미접촉.
 */
(() => {
  'use strict';
  const NS = '__ANIMVFX_GL_PROBE__';
  const safe = (f, d = null) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };

  // ── 공통: 게임 백엔드/게이트 스냅샷 (read-only) ──────────────────────────────
  function backendSnapshot() {
    const glObj = safe(() => GL, null);
    const glPresent = glObj !== null && typeof glObj === 'object';
    // contextLost — GL 객체가 있을 때만 실제 호출. 없으면 null(측정불가). 과거 raw의 fallback true와 구분.
    let contextLost = null, contextLostSource;
    if (glPresent && typeof glObj.isContextLost === 'function') {
      contextLost = safe(() => glObj.isContextLost(), null);
      contextLostSource = (contextLost === null) ? 'call-threw' : 'measured';
    } else {
      contextLostSource = glPresent ? 'no-isContextLost-method' : 'GL-null(not-applicable)';
    }
    const useGL = safe(() => _useGL, null);
    const useGPU = safe(() => _useGPU, null);
    const backend = useGPU === true ? 'webgpu' : (useGL === true ? 'webgl2' : 'canvas2d-or-unknown');
    // WebGL2 인스턴싱 파이프라인 초기화 여부 (§11 GL 플래시 루프 전제). per-mob _ensGLMode와 다른 전역 레벨 지표.
    const ensGLProg = safe(() => !!_ensGLProg, null);
    const ensGLVao = safe(() => !!_ensGLVao, null);
    const glInstInitialized = glPresent && ensGLProg === true && ensGLVao === true;
    const options = {
      fpsCap: safe(() => OPT && OPT.fpsCap, null), quality: safe(() => OPT && OPT.quality, null),
      resScale: safe(() => OPT && OPT.resScale, null),
      webgpuParam: safe(() => new URLSearchParams(location.search).get('webgpu'), null),
      isMac: safe(() => IS_MAC, null), isElectron: safe(() => IS_ELECTRON, null),
      navigatorGpu: safe(() => !!navigator.gpu, null),
      visibility: safe(() => document.visibilityState, null), hidden: safe(() => document.hidden, null),
      bootActive: safe(() => _bootLoadActive, null), warmDone: safe(() => _ensWarmDone, null),
      gameOn: safe(() => G && G.on, null), paused: safe(() => G && G.paused, null)
    };
    // 직전 draw 기준 GL 구동 지표(after-draw에서만 신뢰; ens8GLTotal은 프레임 큐 수=비누적)
    const glDrawCounters = {
      dbgEns8GL: safe(() => _dbgEns8GL, null), ens8GLTotal: safe(() => _ens8GLTotal, null),
      dbgEnsGL: safe(() => _dbgEnsGL, null), ensGLModeGlobal: safe(() => _ensGLMode, null)
    };
    return { glObj, glPresent, contextLost, contextLostSource, useGL, useGPU, backend,
      ensGLProg, ensGLVao, glInstInitialized, options, glDrawCounters };
  }

  // ── per-mob 실제 _ensGLMode===1 샘플링 (플래시 GL 경로 전제, 임시 GL 생성 없음) ──
  // ens[] 각 몹의 e._ensGLMode(0/1)·_hitFlash·alive·_reviveTimer를 읽어 GL 플래시 모드 몹을 집계.
  function enemyGLSample() {
    const ens = safe(() => (typeof ens !== 'undefined' ? ens : null), null) || safe(() => window.ens, null);
    if (!ens || typeof ens.length !== 'number') {
      return { ensReadable: false, total: null, glFlashModeMobs: null, hfActiveMobs: null,
        glFlashAndHf: null, note: 'ens[] 미접근(realm/비공개) — per-mob _ensGLMode 측정불가' };
    }
    let total = 0, glFlashModeMobs = 0, hfActiveMobs = 0, glFlashAndHf = 0, aliveMobs = 0;
    for (let i = 0; i < ens.length; i++) {
      const e = ens[i]; if (!e) continue; total++;
      if (e.alive) aliveMobs++;
      const glm = (e._ensGLMode === 1);           // ← 실제 플래시 GL 경로 게이트(§11 game.html:5199)
      const hf = (typeof e._hitFlash === 'number' && e._hitFlash > 0);
      if (glm) glFlashModeMobs++;
      if (hf) hfActiveMobs++;
      if (glm && hf) glFlashAndHf++;              // 이 프레임 GL 플래시가 실제로 그려질 몹
    }
    return { ensReadable: true, total, aliveMobs, glFlashModeMobs, hfActiveMobs, glFlashAndHf,
      note: 'glFlashModeMobs=e._ensGLMode===1 몹 수(전역 _ensGLMode와 구분). after-draw에서만 _ensGLMode 신뢰.' };
  }

  // ── read-gate: 1회 스냅샷(게임 상태 불변) ──────────────────────────────────
  function readGate() {
    const b = backendSnapshot();
    const es = enemyGLSample();
    const runGate = b.options.gameOn === true && b.options.paused === false;   // 실행/일시정지 게이트
    const visGate = b.options.visibility === 'visible' && b.options.hidden === false;
    const bootGate = b.options.bootActive === false && b.options.warmDone === true;

    let glAbsenceCause;
    if (b.backend === 'webgl2')
      glAbsenceCause = b.glInstInitialized
        ? (b.contextLost === true ? 'webgl2-context-lost' : 'none(webgl2-active)')
        : 'webgl2-pipeline-not-initialized';
    else if (b.backend === 'webgpu')
      glAbsenceCause = 'webgpu-backend-selected (설계상 GL-instancing 비활성; 실패 아님)';
    else
      glAbsenceCause = 'webgl2-unavailable-or-canvas2d (게임 백엔드 기준; 임시 GL 생성 미수행)';

    // 플래시 GL 경로 준비: 백엔드·파이프라인·context + 가시/부팅 + 실행/일시정지 게이트.
    const flashPathReady =
      b.backend === 'webgl2' && b.glInstInitialized && b.contextLost === false &&
      visGate && bootGate && runGate;

    return {
      probe: 'animvfx-gl-readgate', version: 2, readonly: true, mutatedGameState: false,
      now: safe(() => performance.now(), null),
      backend: b.backend, useGL: b.useGL, useGPU: b.useGPU, glPresent: b.glPresent,
      contextLost: b.contextLost, contextLostSource: b.contextLostSource,   // GL=null → contextLost:null (가짜 true 아님)
      glInstInitialized: b.glInstInitialized, ensGLProg: b.ensGLProg, ensGLVao: b.ensGLVao,
      glDrawCounters: b.glDrawCounters, options: b.options,
      gates: { runGate, visGate, bootGate },
      enemyGL: es,
      flashPathReady, glAbsenceCause,
      deathReviveVerdictPremise: flashPathReady
        ? 'GL 플래시 경로 READY — 정규 옵션으로 사망/부활 첫 after-draw 수명 캡처 진행 가능(QA 조율)'
        : ('GL 플래시 경로 NOT READY — 사망/부활 GL 수명은 미검수로 남김. cause=' + glAbsenceCause +
           (runGate ? '' : ' / run-gate 미충족(G.on!==true || G.paused===true)')),
      macGlForceHint: (b.options.isMac === true && b.backend === 'webgpu')
        ? 'Mac 기본=WebGPU(_bootRenderer). WebGL2 플래시 경로 검수는 정규 옵션 ?webgpu=0 으로 GL 부팅 시 활성(총괄 순차 실행).'
        : null,
      note: '임시 GL 생성 제거(capability 캔버스 없음). contextLost=null=측정불가(GL 미존재). ' +
            'glFlashModeMobs=e._ensGLMode===1(per-mob). dbgEns8GL/ens8GLTotal은 직전 draw 기준·after-draw에서만 신뢰.'
    };
  }

  // ── install/dispose: draw/update 래퍼로 프레임별 after-draw/after-update 샘플 기록 ──
  //   정리/재설치: 재설치 전 기존 dispose 호출(중복 래퍼 누적·원본 유실 방지).
  function install(opts) {
    opts = opts || {};
    const limit = opts.limit | 0 || 20000;
    const durationMs = opts.durationMs | 0 || 12000;

    // 중복 설치 가드 — 기존 핸들이 있으면 먼저 정리(원본 복원 후 재설치)
    const prev = safe(() => window[NS], null);
    if (prev && typeof prev.dispose === 'function') { try { prev.dispose(); } catch (e) { /* noop */ } }

    const g = backendSnapshot();
    const rec = {
      name: 'animvfx-gl-probe', version: 2, running: true, dropped: 0, limit, durationMs,
      records: [], updates: 0, draws: 0, pageRafs: 0, samplingErrors: 0, conflicts: 0,
      // 동일 객체 부활 vs 새 구울 추적용 id 생애(관측 시작 이후만)
      idLifecycle: {}, transitionRows: [],
      regularBootAttested: !!opts.regularBootAttested,
      startBackend: g.backend, startGates: { gameOn: g.options.gameOn, paused: g.options.paused }
    };

    // 원본 보관(복원용). window에 노출된 함수만 안전하게 래핑.
    const origUpdate = safe(() => (typeof window.update === 'function' ? window.update : null), null);
    const origDraw = safe(() => (typeof window.draw === 'function' ? window.draw : null), null);
    let origRaf = safe(() => (typeof window.requestAnimationFrame === 'function' ? window.requestAnimationFrame.bind(window) : null), null);
    const wrapAvailable = !!(origUpdate || origDraw);
    rec.wrapAvailable = wrapAvailable;
    rec.wrapNote = wrapAvailable ? 'window.update/draw 래핑' :
      'window.update/draw 미노출(lexical) — 래핑 불가. read-gate 스냅샷만 유효. 래핑 경로는 정규 노출 realm에서만.';

    function pushDrop() { if (rec.records.length >= rec.limit) { rec.dropped++; return true; } return false; }

    // id 생애 추적 — 같은 id의 alive false→true = "동일 객체 부활", 처음 보는 id(etype 100~102 포함) = 신규 객체(구울 후보)
    function trackLifecycle(e, phase) {
      if (!e || e.id == null) return null;
      const id = e.id, lc = rec.idLifecycle;
      let ev = null;
      if (!lc[id]) {
        lc[id] = { firstEtype: e.etype, lastAlive: !!e.alive, deadSeen: false };
        ev = (e.etype >= 100 && e.etype <= 102) ? 'new-object-ghoul-candidate' : 'first-observed-object';
      } else {
        const st = lc[id];
        if (st.lastAlive && !e.alive) { st.deadSeen = true; ev = 'death-observed'; }
        else if (!st.lastAlive && e.alive && st.deadSeen) { ev = 'same-object-revive'; } // 같은 객체 부활(신규 구울 아님)
        st.lastAlive = !!e.alive;
      }
      return ev;
    }

    function sampleEns(phase) {
      if (pushDrop()) return;
      const ens = safe(() => window.ens, null) || safe(() => (typeof ens !== 'undefined' ? ens : null), null);
      const bs = backendSnapshot();
      if (!ens || typeof ens.length !== 'number') { rec.samplingErrors++; return; }
      for (let i = 0; i < ens.length; i++) {
        const e = ens[i]; if (!e) continue;
        if (pushDrop()) return;
        const ev = trackLifecycle(e, phase);
        rec.records.push({
          phase, now: safe(() => performance.now(), null),
          updates: rec.updates, draws: rec.draws, pageRafs: rec.pageRafs,
          id: e.id, etype: e.etype, ib: !!e.ib,
          hf: safe(() => e._hitFlash, null), alive: !!e.alive,
          reviveTimer: safe(() => e._reviveTimer, null),
          glMode: (phase === 'after-draw') ? safe(() => e._ensGLMode, null) : null, // after-draw에서만 _ensGLMode 신뢰
          events: ev ? [ev] : [],
          visibility: bs.options.visibility, hidden: bs.options.hidden,
          bootActive: bs.options.bootActive, warmDone: bs.options.warmDone,
          useGL: bs.useGL, contextLost: bs.contextLost,
          ensDrawn: bs.glDrawCounters.dbgEns8GL, ensQueued: bs.glDrawCounters.ens8GLTotal,
          cap: bs.options.fpsCap, gameOn: bs.options.gameOn, paused: bs.options.paused,
          runtimeGate: (bs.options.gameOn === true && bs.options.paused === false),
          regularBootAttested: rec.regularBootAttested,
          glDrawEvidence: (safe(() => _dbgEns8GL, 0) > 0)
        });
      }
    }

    const wUpdate = origUpdate ? function () { const r = origUpdate.apply(this, arguments); rec.updates++; sampleEns('after-update'); return r; } : null;
    const wDraw = origDraw ? function () { const r = origDraw.apply(this, arguments); rec.draws++; sampleEns('after-draw'); return r; } : null;
    const wRaf = origRaf ? function (cb) { return origRaf(function (ts) { rec.pageRafs++; return cb(ts); }); } : null;

    if (wUpdate) window.update = wUpdate;
    if (wDraw) window.draw = wDraw;
    if (wRaf) window.requestAnimationFrame = wRaf;

    // install 스냅샷 1회(관측 시작점)
    sampleEns('install');

    const handle = {
      rec,
      snapshot() { return readGate(); },
      dispose() {
        // 정리: 내가 설치한 래퍼일 때만 원본 복원(타 래퍼 덮어썼으면 conflict 기록, 강제복원 안 함)
        if (window.update === wUpdate && origUpdate) window.update = origUpdate; else if (wUpdate) rec.conflicts++;
        if (window.draw === wDraw && origDraw) window.draw = origDraw; else if (wDraw) rec.conflicts++;
        if (origRaf) window.requestAnimationFrame = origRaf;
        rec.running = false;
        if (window[NS] === handle) { try { delete window[NS]; } catch (e) { window[NS] = null; } }
        return rec;
      }
    };
    try { window[NS] = handle; } catch (e) { /* noop */ }

    // 자동 종료(관측 시간 경과 시 정리) — 실행은 QA/정규 부팅에서. 여기선 소스 계약만.
    if (durationMs > 0 && typeof setTimeout === 'function') {
      handle._timer = setTimeout(() => { try { handle.dispose(); } catch (e) { /* noop */ } }, durationMs);
    }
    return handle;
  }

  function dispose() {
    const h = safe(() => window[NS], null);
    if (h && typeof h.dispose === 'function') return h.dispose();
    return null;
  }

  const api = { readGate, install, dispose, enemyGLSample, backendSnapshot };
  // 브라우저: window.ANIMVFX_GL_PROBE 로 노출. Node(module): module.exports.
  try { if (typeof window !== 'undefined') window.ANIMVFX_GL_PROBE = api; } catch (e) { /* noop */ }
  try { if (typeof module !== 'undefined' && module.exports) module.exports = api; } catch (e) { /* noop */ }
  return api;
})();
