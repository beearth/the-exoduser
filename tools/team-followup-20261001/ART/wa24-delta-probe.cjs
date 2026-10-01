/* wa24 델타 프로브 (ART-WA24-DELTA-CANDIDATE) — 읽기 전용·순수 함수.
 *
 * 목적: wa24 관측기(wa24-observer.cjs)/원 후보(candidates/ART.js)의 "실제 차이 vs 미관측" 분류를 점검하고,
 *       가장 큰 미완료 결함인 **크롭(crop)** 을 결정적으로 예측하는 독립 패치 + 회귀를 제공한다.
 *       근거가 픽셀 렌더에 의존하는 차원(자막 가독성)은 UNKNOWN 판정을 돌려 거짓 PASS 를 막는다.
 *
 * 엔진 진실(game.html, 2026-10-01 HEAD 30a204a7 직접 Read):
 *   - 레터박스:    :60742-60746   (16:9 클램프 → 콘텐츠박스 cw,ch)
 *   - cover draw:  :60796-60801   (imgR>cR → 좌우컷 / else 상하컷 dy=(ch-dh)*.1)
 *   - fade:        :60767-60773   (lineElapsed 기반; 매 프레임 :60749 흑색 클리어 → fade-from-black)
 *   - active-cut:  :60713-60733   (엔진은 _cutLineIdx + _cutLineStartMs 기반. ln.t 는 :60755 보이스 동기 전용)
 *   - shake:       :60627         ((sin(t*.047)*mag*2)|0 → 정수 ±2), 자막 미적용(:60779-60802 내부에만)
 *   - ease:        :60313         (out = t=>1-(1-t)*(1-t))
 *
 * ★핵심 결함(분류): 관측기/후보는 활성 컷을 `_cutsceneStartMs + t` 로 찾는다.
 *   그러나 엔진 재생축은 `_cutLineIdx`(라인 인덱스) + `_cutLineStartMs`(라인별 시작) 이며,
 *   프레임 오버슈트·클릭진행·스킵·보이스동기로 wall-clock 이 누적 드리프트한다.
 *   → 관측기가 보고하는 zoom/shake/fade/경계 샘플이 엔진 실제 렌더값과 어긋날 수 있다(아래 회귀로 증명).
 *   본 모듈은 엔진과 동일한 라인-인덱스 축 샘플러(correctedSampler)를 함께 제공한다.
 *
 * 사용(테스트): require('./wa24-delta-probe.cjs')
 * 사용(브라우저): 콘솔에 붙여넣으면 window.__wa24delta 로 순수 함수 노출(상태 변경 없음).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.__wa24delta = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // 엔진 상수 복제(:60313, :60627).
  const EASE = {
    linear: (t) => t,
    in: (t) => t * t,
    out: (t) => 1 - (1 - t) * (1 - t),
    inout: (t) => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
  };
  function cutShake(mag, t) { return mag ? { x: (Math.sin(t * 0.047) * mag * 2) | 0, y: (Math.cos(t * 0.053) * mag * 2) | 0 } : { x: 0, y: 0 }; }

  // wa24 라인(game.html:60343) 과 원본 규격.
  const WA24 = { id: 'wa24', img: 'warintro/cin_fallhell_custom.jpg', t: 73600, dur: 2400, narr: 1,
                 speaker: null, text: '그리고 지옥에 떨어진다.', col: undefined,
                 cam: { zs: 1.08, ze: 1.04, ease: 'out' }, vfx: { vig: .5, shake: 1 }, fade: { type: 'cross', in: 400 } };
  const WA24_IMG = { naturalWidth: 2560, naturalHeight: 1440 }; // MAP-ART-인수검토.md:108 / ART_TEAM_MASTER §204

  // ── 레터박스 (game.html:60742-60746) ──
  function predictLetterbox(fullW, fullH) {
    const maxAR = 16 / 9, curAR = fullW / fullH;
    let lbX = 0, lbY = 0, cw = fullW, ch = fullH;
    if (curAR > maxAR) { cw = ~~(fullH * maxAR); lbX = ~~((fullW - cw) / 2); }
    else if (curAR < 9 / 16) { ch = ~~(fullW / (9 / 16)); lbY = ~~((fullH - ch) / 2); }
    return { cw, ch, lbX, lbY, letterboxed: (cw !== fullW || ch !== fullH) };
  }

  // ── cover draw (game.html:60796-60801) ──
  function predictCover(natW, natH, cw, ch) {
    const imgR = natW / natH, cR = cw / ch;
    let dw, dh, dx, dy, branch;
    if (imgR > cR) { branch = 'fit-height/cut-sides'; dh = ch; dw = ch * imgR; dx = (cw - dw) / 2; dy = 0; }
    else { branch = 'fit-width/cut-topbottom'; dw = cw; dh = cw / imgR; dx = 0; dy = (ch - dh) * .1; }
    // 숨겨지는(잘리는) 양 계산: 콘텐츠박스(cw×ch) 밖으로 나가는 부분.
    const hiddenLeft = Math.max(0, -dx), hiddenRight = Math.max(0, (dx + dw) - cw);
    const hiddenTop = Math.max(0, -dy), hiddenBottom = Math.max(0, (dy + dh) - ch);
    const cutFracX = dw > 0 ? (hiddenLeft + hiddenRight) / dw : 0;
    const cutFracY = dh > 0 ? (hiddenTop + hiddenBottom) / dh : 0;
    return {
      branch, imgR: +imgR.toFixed(4), cR: +cR.toFixed(4),
      dw: +dw.toFixed(2), dh: +dh.toFixed(2), dx: +dx.toFixed(2), dy: +dy.toFixed(2),
      hidden: { left: +hiddenLeft.toFixed(2), right: +hiddenRight.toFixed(2), top: +hiddenTop.toFixed(2), bottom: +hiddenBottom.toFixed(2) },
      cutFracX: +cutFracX.toFixed(4), cutFracY: +cutFracY.toFixed(4)
    };
  }

  // 크롭 판정 임계(판단 근거는 result 문서에 기록). 전사=중앙, 좌우 첨탑·상단 지옥문 눈이 프레임 끝 쪽 주요 요소.
  const CROP_MINOR = 0.02, CROP_MAJOR = 0.15;
  function cropVerdict(frac) {
    if (frac <= CROP_MINOR) return 'OK';
    if (frac <= CROP_MAJOR) return 'MINOR';
    return 'MAJOR';
  }

  /** wa24 크롭 예측: 뷰포트 전체 크기 → 레터박스 → cover → 판정. 순수·결정적, 브라우저 불필요. */
  function predictWa24Crop(fullW, fullH, natW, natH) {
    natW = natW || WA24_IMG.naturalWidth; natH = natH || WA24_IMG.naturalHeight;
    const lb = predictLetterbox(fullW, fullH);
    const cov = predictCover(natW, natH, lb.cw, lb.ch);
    const axis = cov.cutFracX >= cov.cutFracY ? 'X' : 'Y';
    const frac = Math.max(cov.cutFracX, cov.cutFracY);
    const vd = cropVerdict(frac);
    let verdict;
    if (vd === 'OK') verdict = 'OK_FULLFRAME';
    else verdict = (axis === 'X' ? 'CROP_SIDE_' : 'CROP_TB_') + vd;
    return { fullW, fullH, viewAR: +(fullW / fullH).toFixed(4), letterbox: lb, cover: cov, cutAxis: axis, cutFrac: +frac.toFixed(4), verdict };
  }

  // ── fade (game.html:60769-60773) ──
  function fadeAlpha(lineElapsed, dur, fadeIn, fadeOut) {
    const fi = fadeIn || 400, fo = fadeOut || 0;
    let a = 1;
    if (lineElapsed < fi) a = lineElapsed / fi;
    if (fo && lineElapsed > dur - fo) a = Math.min(a, (dur - lineElapsed) / fo);
    return Math.max(0, Math.min(1, a));
  }

  // ── zoom (game.html:60783-60786) ──
  function zoomAt(lineElapsed, dur, cam) {
    const c = cam || { zs: 1, ze: 1 };
    const t = Math.min(1, lineElapsed / (dur || 1));
    const ef = EASE[c.ease || 'linear'] || EASE.linear;
    return c.zs + (c.ze - c.zs) * ef(t);
  }

  /**
   * ★엔진 진실축 샘플러(결함 수정): _cutLineIdx + _cutLineStartMs 기반.
   * state = { lines, lineIdx, lineStartMs, now } → 엔진이 실제로 렌더하는 값.
   */
  function correctedSampler(state) {
    const { lines, lineIdx, lineStartMs, now } = state;
    const ln = lines[lineIdx];
    if (!ln) return { active: null, reason: 'lineIdx 범위 밖' };
    const lineElapsed = now - lineStartMs;
    return {
      base: 'line-index(_cutLineIdx+_cutLineStartMs)',
      active: ln.id, lineElapsed: +lineElapsed.toFixed(1),
      fadeAlpha: +fadeAlpha(lineElapsed, ln.dur, (ln.fade || {}).in, (ln.fade || {}).out).toFixed(4),
      zoom: +zoomAt(lineElapsed, ln.dur, ln.cam).toFixed(4),
      shake: cutShake((ln.vfx || {}).shake || 0, now)
    };
  }

  /** 관측기/후보의 (틀린) 시퀀스-시간 축: _cutsceneStartMs + t. 드리프트 증명용. */
  function legacySampler(state) {
    const { lines, cutsceneStartMs, now } = state;
    const e = now - cutsceneStartMs;
    const ln = lines.find((x) => e >= x.t && e < x.t + x.dur);
    if (!ln) return { base: 'seq-time(_cutsceneStartMs+t)', active: null, e: +e.toFixed(1) };
    const el = e - ln.t;
    return {
      base: 'seq-time(_cutsceneStartMs+t)',
      active: ln.id, e: +e.toFixed(1), lineElapsed: +el.toFixed(1),
      fadeAlpha: +fadeAlpha(el, ln.dur, (ln.fade || {}).in, (ln.fade || {}).out).toFixed(4),
      zoom: +zoomAt(el, ln.dur, ln.cam).toFixed(4),
      shake: cutShake((ln.vfx || {}).shake || 0, now)
    };
  }

  // ── 자막(나레이션) 기하 (game.html:60810-60843) — 결정적 부분만. ──
  function subtitleGeometry(ln, cw, ch) {
    const nFs = ln.title ? Math.max(24, ch * .075) : Math.max(14, ch * .031);
    const nLh = nFs * 1.5;
    // 단일 라인 가정(wa24 짧은 문장). 다중 래핑은 wrapText(cw*.84) 필요 → 폭 의존.
    const baseCy = ln.title ? ch * .5 : ch * .88;
    return {
      font: (ln.title ? 'bold ' : '') + (~~nFs) + 'px "Noto Sans KR",sans-serif',
      color: ln.col || (ln.title ? '#d4af37' : '#d8d4cc'), // wa24: col 미지정 → 뼈색 #d8d4cc
      align: 'center', baseline: 'middle',
      y_singleLine: +baseCy.toFixed(1), lineHeight: +nLh.toFixed(2),
      wrapWidth: +(cw * .84).toFixed(1),
      readabilityOverlay: 'rgba(0,0,0,0.35) 전체', // :60811
      shadow: '#000 blur6 offsetY1',
      shakeApplies: false // ★소스 검증(:60779-60802 image save/restore 내부에만 shake)
    };
  }

  /** 자막 "시각 가독성" 판정은 픽셀 렌더 없이는 불가 → UNKNOWN(거짓 PASS 방지). */
  function subtitleVisualVerdict(evidence) {
    const e = evidence || {};
    if (!e.pixelSampled) {
      return {
        verdict: 'UNKNOWN',
        reason: '자막 시각 가독성(대비·잘림·겹침)은 캔버스 픽셀 판독 필요. JS 상태만으로 판정 불가.',
        computable: ['위치(y)', '색', '폰트', 'shake 독립성', 'wrap 폭'],
        needsForPass: ['실제 렌더 1x 스크린샷', '하단 계단 대비 측정', '프레임 내 잘림 확인'],
        gate: 'QA 종료 인계 후 브라우저 실측'
      };
    }
    // 픽셀 증거가 주어지면 그 결과를 그대로 반영(여기서는 생성하지 않음).
    return { verdict: e.legible ? 'PASS' : 'FAIL', reason: '픽셀 증거 기반', source: 'caller' };
  }

  const SOURCE_REFS = {
    letterbox: 'game.html:60742-60746', cover: 'game.html:60796-60801',
    fade: 'game.html:60767-60773', activeCut: 'game.html:60713-60733',
    shake: 'game.html:60627', ease: 'game.html:60313', narration: 'game.html:60810-60843'
  };
  const SAMPLING_CONTRACT = {
    correctBase: ['_cutLineIdx', '_cutLineStartMs', '_cutsceneGetLines() 순서(PRO/ko=PROLOGUE_LINES.ko)'],
    wrongBase: ['_cutsceneStartMs', 'line.t'],
    note: 'line.t 는 보이스 동기 전용(:60755). 활성 컷·경과·zoom·shake·fade 는 반드시 라인-인덱스 축으로 샘플.'
  };

  return {
    EASE, cutShake, WA24, WA24_IMG, CROP_MINOR, CROP_MAJOR, SOURCE_REFS, SAMPLING_CONTRACT,
    predictLetterbox, predictCover, cropVerdict, predictWa24Crop,
    fadeAlpha, zoomAt, correctedSampler, legacySampler,
    subtitleGeometry, subtitleVisualVerdict
  };
});
