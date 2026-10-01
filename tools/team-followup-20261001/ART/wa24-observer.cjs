/* wa24 타임라인 인수 관측기 v2 (읽기 전용·결함 수정판)
 *
 * 출처: /Users/fordeargamers/Documents/Codex/2026-10-01/dho/outputs/r-input-20261001/candidates/ART.js
 * 검증 근거: 같은 폴더 검증결과.md / validation-manifest.json (ART.js :70, :75, :79 지적)
 *
 * 이 파일이 고친 것(원 후보 대비):
 *   D1  표본 0에서도 within_pm2 가 true 가 되던 오탐 → n>0 일 때만 판정, verdict 를 PASS/FAIL/INCOMPLETE 로 분리.
 *       (표본 0 이면 절대 PASS 안 됨. "검사 안 함"을 "통과"로 보고하지 않는다.)
 *   D2  cleanup 이 rAF 만 취소하고 safety timeout·window 이름을 남기던 누수 → finish() 가 rAF·timeout·namespace 전부 정리, 멱등.
 *   D3  중복 설치 시 이전 핸들을 잃던 문제 → 생성 시 기존 인스턴스를 먼저 dispose 하고 installSeq 로 추적.
 *   D4  PRO 시퀀스·wa24 경계 포착을 verdict 필수 조건으로 승격(모델 DRIFT·경계 미포착·표본 0 은 PASS 불가).
 *   D5  [LIVE-CALLSITE 20261002] 실제 호출부 시간축 수정. 이전 tick() 은 _cutsceneStartMs+L.t(seq-time)로
 *       activeCut 을 골라 엔진 실제 재생축과 불일치했다. 엔진은 _cutLineIdx + _cutLineStartMs 로 라인을 고르고
 *       _cutsceneGetLines() 순서를 쓴다(game.html:60704-60807, :60713-60733). 이제 line-index 축으로 샘플한다.
 *       검수된 correctedSampler(wa24-delta-probe) 는 env.sampler 의존주입으로 연결하며(브라우저 UMD 를 ESM require 로
 *       깨지 않음), 미주입 시 동일 공식의 builtin 으로 대체한다. 활성 라인 목록은 env.getLines() 계약으로 받는다.
 *
 * 게임 상태·렌더 경로 변경 없음. 순수 전역 읽기 + 순수 함수(_ease, _cutShake) 샘플.
 * 원화·로더 불변. 실제 컷신 인수(?test=1&cutscene=1 PRO 재생)는 QA 종료 인계 뒤 별도.
 *
 * 사용(브라우저): 이 파일 전체를 콘솔에 붙여넣으면 IIFE 로 자동 설치됨(파일 확장자 무관).
 * 사용(테스트): require('./wa24-observer.cjs').createWa24Observer(env) 로 mock env 주입.
 *   (.cjs 로 둔 이유: 저장소 package.json 이 "type":"module" 이라 .js 는 ESM 으로 로드돼 UMD 가 깨짐.)
 */
(function (root, factory) {
  // UMD: Node(테스트) 에서는 exports, 브라우저에서는 자동 설치 + window.__wa24obsFactory 노출.
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const api = factory();
    root.__wa24obsFactory = api;
    // 브라우저 자동 설치: 실제 페이지 realm 의 전역을 eval 로 읽는다.
    if (typeof window !== 'undefined' && typeof requestAnimationFrame === 'function') {
      api.installBrowser();
    }
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const NS = '__wa24obs';

  // 소스 대조 기대값 (드리프트 감지) — 원 후보와 동일.
  const EXPECT = {
    wa23: { t: 68200, dur: 5400, img: 'warintro/cin_remember.jpg', fadeIn: 1 },
    wa24: { t: 73600, dur: 2400, img: 'warintro/cin_fallhell_custom.jpg', col: undefined,
            cam: { zs: 1.08, ze: 1.04, ease: 'out' }, vfx: { vig: .5, shake: 1 }, fadeIn: 400 },
    wa25: { t: 76000, dur: 2900, img: null, fadeIn: 400 }
  };

  /**
   * 관측기 팩토리. env 로 모든 부작용(시간·프레임·타이머·전역읽기·호스트)을 주입받아
   * 실제 브라우저와 mock 환경에서 동일 로직을 돌린다.
   *
   * env = {
   *   readGlobal(name) -> any|undefined   // 스크립트 스코프 const/let 접근 (브라우저: eval, mock: 테이블)
   *   now() -> number                      // performance.now() 대체
   *   scheduleFrame(cb) -> id              // requestAnimationFrame 대체
   *   cancelFrame(id)                      // cancelAnimationFrame 대체
   *   scheduleTimeout(cb, ms) -> id        // setTimeout 대체
   *   cancelTimeout(id)                    // clearTimeout 대체
   *   host -> object                       // namespace 를 붙일 객체 (브라우저: window)
   *   getLines() -> array|undefined        // [D5] 현재 재생 중 라인 목록(_cutsceneGetLines 순서). 미제공 시 PROLOGUE_LINES.ko 폴백
   *   sampler({lines,lineIdx,lineStartMs,now}) -> {active,lineElapsed,zoom,shake,fadeAlpha}  // [D5] 검수 correctedSampler 주입(선택). 미주입 시 builtin
   *   log(...)/warn(...)                   // 콘솔 (옵션)
   * }
   */
  function createWa24Observer(env) {
    const log = env.log || function () {};
    const warn = env.warn || function () {};
    const host = env.host;

    // D3: 중복 설치 방어 — 기존 인스턴스가 있으면 먼저 정리하고 설치 순번을 이어받는다.
    let priorInstallSeq = 0;
    if (host && host[NS]) {
      const prev = host[NS];
      warn('[wa24obs] 이미 실행 중 — 기존 인스턴스 cleanup 후 재설치');
      priorInstallSeq = (prev.installSeq || 0);
      try { if (typeof prev.cleanup === 'function') prev.cleanup(); } catch (e) { warn('[wa24obs] 이전 cleanup 실패', e); }
      // 이전 cleanup 이 자기 소유일 때만 namespace 를 지우므로, 혹시 남아있으면 여기서 비운다.
      if (host[NS] === prev) { try { delete host[NS]; } catch (e) { host[NS] = undefined; } }
    }
    const installSeq = priorInstallSeq + 1;

    const readG = env.readGlobal;
    const PL = readG('PROLOGUE_LINES');
    const shakeFn = readG('_cutShake');
    // [D5] 활성 라인 목록 계약: env.getLines() 우선, 없으면 PROLOGUE_LINES.ko 폴백(PRO/ko).
    const getLines = typeof env.getLines === 'function'
      ? env.getLines
      : function () { return PL && PL.ko; };
    // [D5] 엔진 fade 식(game.html:60769-60773).
    function computeFade(le, dur, fi, fo) {
      fi = fi || 400; fo = fo || 0; let a = 1;
      if (le < fi) a = le / fi;
      if (fo && le > (dur || 0) - fo) a = Math.min(a, ((dur || 0) - le) / fo);
      return Math.max(0, Math.min(1, a));
    }
    // [D5] builtin 라인-인덱스 샘플러 — 검수 correctedSampler 와 동일 공식(engine :60783-60791).
    function builtinSample(args) {
      const lines = args.lines, ln = lines && lines[args.lineIdx];
      if (!ln) return { active: null };
      const lineElapsed = args.now - args.lineStartMs;
      const dur = ln.dur || 1, tt = Math.max(0, Math.min(1, lineElapsed / dur));
      const cam = ln.cam || { zs: 1, ze: 1 };
      const easeMap = readG('_ease') || {};
      const efn = easeMap[cam.ease || 'linear'] || easeMap.linear || function (t) { return t; };
      const zoom = cam.zs + (cam.ze - cam.zs) * efn(tt);
      const sk = shakeFn ? shakeFn((ln.vfx || {}).shake || 0, args.now) : { x: 0, y: 0 };
      const fd = ln.fade || {};
      return { active: ln.id, lineElapsed, zoom: +zoom.toFixed(4), shake: sk, fadeAlpha: +computeFade(lineElapsed, dur, fd.in, fd.out).toFixed(4) };
    }
    // [D5] 의존주입 우선: 검수된 correctedSampler 가 있으면 그것을, 없으면 builtin.
    const sampleFn = typeof env.sampler === 'function'
      ? function (a) { return env.sampler(a); }
      : builtinSample;

    // --- 모델(소스 대조) 검사 ---
    const model = {}; let modelOk = true; let modelEntries = 0;
    if (PL && PL.ko) {
      for (const id of ['wa23', 'wa24', 'wa25']) {
        const L = PL.ko.find((x) => x.id === id), e = EXPECT[id]; const diff = [];
        if (!L) { diff.push('엔트리없음'); }
        else {
          modelEntries++;
          if (L.t !== e.t) diff.push(`t ${L.t}≠${e.t}`);
          if (L.dur !== e.dur) diff.push(`dur ${L.dur}≠${e.dur}`);
          if ((L.img || null) !== (e.img || null)) diff.push(`img ${L.img}≠${e.img}`);
          if (((L.fade || {}).in) !== e.fadeIn) diff.push(`fadeIn ${(L.fade || {}).in}≠${e.fadeIn}`);
          if (id === 'wa24') {
            if ('col' in L) diff.push(`col 지정됨(${L.col}) — 기본 #d8d4cc 기대`);
            const c = L.cam || {}; if (c.zs !== 1.08 || c.ze !== 1.04 || c.ease !== 'out') diff.push('cam 불일치');
            if ((L.vfx || {}).shake !== 1) diff.push('shake≠1');
          }
        }
        model[id] = { ok: !diff.length, diff }; if (diff.length) modelOk = false;
      }
    } else { modelOk = false; }
    // D4: PRO 라인 테이블 자체가 없으면 PASS 불가.
    if (!PL || !PL.ko) modelOk = false;
    log('[wa24obs] 모델 대조', modelOk ? 'PASS' : 'DRIFT', model);

    // --- 라이브 샘플 ---
    const samples = []; const marks = {};
    const shakeRange = { xmin: Infinity, xmax: -Infinity, ymin: Infinity, ymax: -Infinity, nonzero: 0, n: 0 };
    let raf = 0, safetyTimer = 0, stopped = false, started = false, cachedResult = null;

    // [D5] 라인-인덱스 재생축 tick. 엔진과 동일하게 _cutLineIdx + _cutLineStartMs 로 활성 라인을 고른다.
    let lastLineStartMs = null; // 역행 감지용
    function tick() {
      if (stopped) return;
      const state = readG('_cutsceneState');
      const now = env.now();
      const lineIdx = readG('_cutLineIdx');
      const lineStartMs = readG('_cutLineStartMs');
      const lines = getLines();
      // [D5] 라인 idx/시각 누락이면 샘플 보류(미확정) — 추측값 생성 금지.
      if (state === 'INTRO_CUTSCENE' && Array.isArray(lines) && Number.isFinite(lineIdx) && Number.isFinite(lineStartMs)) {
        if (lastLineStartMs !== null && lineStartMs < lastLineStartMs) marks.reverse_seen = 1; // 역행 기록만
        lastLineStartMs = lineStartMs;
        const s = sampleFn({ lines: lines, lineIdx: lineIdx, lineStartMs: lineStartMs, now: now });
        const L = lines[lineIdx];
        if (L && s && s.active && s.lineElapsed >= 0) { // 음수 경과(역행/미시작)는 샘플 제외
          const el = s.lineElapsed;
          const sk = s.shake || { x: 0, y: 0 };
          if (L.id === 'wa24') {
            shakeRange.n++; if (sk.x || sk.y) shakeRange.nonzero++;
            shakeRange.xmin = Math.min(shakeRange.xmin, sk.x); shakeRange.xmax = Math.max(shakeRange.xmax, sk.x);
            shakeRange.ymin = Math.min(shakeRange.ymin, sk.y); shakeRange.ymax = Math.max(shakeRange.ymax, sk.y);
          }
          if (!marks['enter_' + L.id]) {
            marks['enter_' + L.id] = +el.toFixed(0);
            log(`[wa24obs] ▶ ${L.id} 진입 lineElapsed=${el.toFixed(0)}ms (idx=${lineIdx}, dur=${L.dur}, fadeIn=${(L.fade || {}).in})`);
          }
          if (['wa23', 'wa24', 'wa25'].includes(L.id))
            samples.push({ id: L.id, idx: lineIdx, el: +el.toFixed(0), zoom: s.zoom != null ? +(+s.zoom).toFixed(4) : null, sx: sk.x, sy: sk.y, fade: s.fadeAlpha != null ? +(+s.fadeAlpha).toFixed(4) : null });
          // [D5] done: wa25 가 fade-in 을 통과하면 수집 종료 (line-index 기준).
          if (L.id === 'wa25' && el >= (((L.fade || {}).in) || 400) && marks['enter_wa25'] && !marks.done) {
            marks.done = 1;
            log('[wa24obs] ✔ wa25 fade-in 통과 — 수집 종료. cleanup() 호출.');
            finish(); return;
          }
        }
      }
      raf = env.scheduleFrame(tick);
    }

    function computeVerdict() {
      // D1·D4: PASS 는 아래 모두 충족할 때만.
      const reasons = [];
      if (!modelOk) reasons.push('model_drift');
      if (!marks['enter_wa24']) reasons.push('wa24_경계_미포착');
      if (shakeRange.n === 0) reasons.push('wa24_표본0');
      const within = shakeRange.n > 0
        && shakeRange.xmin >= -2 && shakeRange.xmax <= 2
        && shakeRange.ymin >= -2 && shakeRange.ymax <= 2;
      if (shakeRange.n > 0 && !within) reasons.push('shake_±2초과');

      let verdict;
      if (reasons.length === 0) verdict = 'PASS';
      else if (reasons.includes('model_drift') || reasons.includes('shake_±2초과')) verdict = 'FAIL';
      else verdict = 'INCOMPLETE'; // 경계 미포착·표본0 = 검사 미완(통과 아님)
      return { verdict, within_pm2: within, reasons };
    }

    function summary() {
      const v = computeVerdict();
      // Infinity 잔재(표본0)를 null 로 정리해 소비측 오판 방지.
      const sr = {
        xmin: shakeRange.n ? shakeRange.xmin : null, xmax: shakeRange.n ? shakeRange.xmax : null,
        ymin: shakeRange.n ? shakeRange.ymin : null, ymax: shakeRange.n ? shakeRange.ymax : null,
        nonzero: shakeRange.nonzero, n: shakeRange.n,
        within_pm2: v.within_pm2 // D1: n>0 일 때만 true
      };
      return {
        installSeq,
        timeBase: 'line-index',        // [D5] _cutLineIdx + _cutLineStartMs (seq-time 아님)
        verdict: v.verdict,            // D1/D4: PASS | FAIL | INCOMPLETE
        verdictReasons: v.reasons,
        modelCheck: { ok: modelOk, entries: modelEntries, detail: model },
        marks,
        boundaryCaptured: { wa23: !!marks['enter_wa23'], wa24: !!marks['enter_wa24'], wa25: !!marks['enter_wa25'], done: !!marks.done },
        windows: { transition_in_wa24: [73600, 74000], cut_wa24: [73600, 76000], transition_in_wa25: [76000, 76400] },
        shake_wa24: sr,
        subtitle_fixed: { source: 'game.html:60650-60651 자막은 cx.restore() 후 렌더, shake 항 없음 — 소스 추론, 시각 실측 아님', applied: false },
        sampleCount: samples.length, samples: samples.slice(-600)
      };
    }

    // D2: 멱등 전체 정리 — rAF·safety timeout·namespace 모두 해제.
    function finish() {
      if (stopped) return cachedResult;
      stopped = true;
      if (raf) { env.cancelFrame(raf); raf = 0; }
      if (safetyTimer) { env.cancelTimeout(safetyTimer); safetyTimer = 0; }
      const s = summary();
      cachedResult = s;
      if (api) api.result = s;
      // 자기 소유일 때만 namespace 제거(다른 인스턴스가 이미 덮어썼으면 건드리지 않음).
      if (host && host[NS] === api) { try { delete host[NS]; } catch (e) { host[NS] = undefined; } }
      log('[wa24obs] 요약', s);
      return s;
    }

    function start() {
      if (started) return api; // 중복 start 방지
      started = true;
      raf = env.scheduleFrame(tick);
      safetyTimer = env.scheduleTimeout(function () {
        if (!stopped) { warn('[wa24obs] 120s 안전 타임아웃 — 종료'); finish(); }
      }, 120000);
      log('[wa24obs] 시작. wa24(73.6s)까지 재생되면 자동 포착. 수동 종료: window.__wa24obs.cleanup()');
      return api;
    }

    const api = {
      installSeq,
      cleanup: finish,
      snapshot: summary,
      start,
      result: null,
      _samples: samples,
      _marks: marks,
      _shakeRange: shakeRange,
      get stopped() { return stopped; }
    };
    if (host) host[NS] = api;
    return api;
  }

  /** 브라우저 실제 설치: 페이지 realm 전역을 eval 로 읽는 env 를 구성해 바로 start. */
  function installBrowser() {
    const readGlobal = function (n) { try { return eval(n); } catch (e) { return undefined; } }; // eslint-disable-line no-eval
    const env = {
      readGlobal: readGlobal,
      now: function () { return performance.now(); },
      scheduleFrame: function (cb) { return requestAnimationFrame(cb); },
      cancelFrame: function (id) { return cancelAnimationFrame(id); },
      scheduleTimeout: function (cb, ms) { return setTimeout(cb, ms); },
      cancelTimeout: function (id) { return clearTimeout(id); },
      host: window,
      // [D5] 활성 라인 목록: 엔진의 _cutsceneGetLines() 순서를 우선, 없으면 _cutSeq+lang 로 폴백.
      // (읽기 전용 — _cutsceneGetLines 는 순수 getter. 상태 변경 없음.)
      getLines: function () {
        try {
          var f = readGlobal('_cutsceneGetLines');
          if (typeof f === 'function') { var r = f(); if (Array.isArray(r)) return r; }
        } catch (e) {}
        try {
          var seq = readGlobal('_cutSeq');
          var src = seq === 'INTRO' ? readGlobal('INTRO_CUTSCENE_LINES') : readGlobal('PROLOGUE_LINES');
          var opt = readGlobal('OPT'); var lang = (opt && opt.lang) || 'ko';
          return src && (src[lang] || src.ko);
        } catch (e) { return undefined; }
      },
      // 브라우저에서는 ESM require 로 UMD 를 깨지 않는다 → builtin 샘플러 사용(검수 공식 동일). sampler 미주입.
      log: console.log.bind(console),
      warn: console.warn.bind(console)
    };
    return createWa24Observer(env).start();
  }

  return { createWa24Observer: createWa24Observer, installBrowser: installBrowser, EXPECT: EXPECT, NS: NS };
});
