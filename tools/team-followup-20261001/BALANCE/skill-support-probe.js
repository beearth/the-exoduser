/* BALANCE 지원 미적용 후보: 충전은 완전 update trace 없으면 UNKNOWN.
   원 SKILL 소스는 보존. rechargeTrace는 별도 계측의 명시 증거이며 기본 reader는 제공하지 않음. */
/* ============================================================================
 * SKILL-03 iceStorm 취소→다음 LMB 입력경계 관측기 — 안전화 사본
 *   작업 ID: SKILL-03-OBSERVER-FIX
 *   원본: r-input-evidence/evidence.zip!candidates/SKILL.js
 *         (sha256 aeded94120a1186da3983a4975efd06ed7c610644bab2ba0c3a11f0a4f756b1f)
 *   작성: Mac SKILL 팀 / 2026-10-01 / 실브라우저 미실행(정적 보강 + mock 자가검사만).
 *
 * 이 사본은 game.html·자원 공식·전투·생산 코드를 전혀 바꾸지 않는다. 읽기 전용
 * 관측기이며, 실게임 입력·덤프 수집은 QA 종료 인계 전 보류한다. "실행 준비 완료"가
 * 아니라 "검증결과.md + validation-manifest(SKILL) 게이트를 반영한 안전화 후보"다.
 *
 * ── 원본 게이트(검증결과.md / manifest static_review) → 본 사본의 반영 ──────
 *  G1  "중복 설치 시 이전 핸들을 잃음"(원본 :1 IIFE 즉시 재대입, :53 dispose)
 *        → install()이 기존 win.__iceCancelProbe.dispose('reinstall')를 먼저 호출.
 *          dispose는 rAF·리스너3개 해제 후 네임스페이스(win.__iceCancelProbe)도 비운다.
 *  G2  "flags 빈 배열은 무관측/미장착/미설치에도 나오므로 정상 PASS 근거 아님"
 *        → verdict()에 양성대조(정상 설치 1회 실제 포착) 필수화. 미포착이면 UNDETERMINED.
 *  G3  "유효 표본수/이벤트를 필수 게이트로" / "snap 실패는 null로 조용히 무시"
 *        → 구간(mark)별 validSamples/nullSamples 집계. 표본0 구간은 PASS 금지(UNDETERMINED).
 *  G4  "전체 P.mp 감소는 다른 MP 소비도 잡는다"
 *        → iceStorm 설치는 (신규 iceStorm 존 +1) ∧ (dStk===-1) ∧ (dMp===-40) 서명으로만 확정.
 *          설치 없는 dMp<0 = OTHER_MP_SPEND(아이스스톰 아님)로 분리 기록.
 *  G5  "zones 개수 차이는 기존 장판 만료와 신규 설치가 상쇄될 수 있다"
 *        → 존 객체 식별(Set)로 '신규 설치'와 '만료'를 각각 센다. 순증(net)만 보지 않는다.
 *  G6  "aimTransitions는 aim 필드 있는 모든 표본을 반환하므로 실제 전환 배열과 다름"
 *        → aim이 직전 대비 실제로 바뀐 프레임만 aimTransitions에 담는다.
 *  G7  (추가) rAF 샘플링은 MBjust 단일 tick edge와 주기가 다름 / 같은 프레임 RMB·LMB 경합·
 *        실제 일반공격 발동은 추가 근거 필요 → 한계를 limitations에 명시.
 *  G8  (SKILL-ICE-CANCEL-EDGE 보강) 리젠·취소 자원 정합성:
 *        · 충전 확인은 연속 updateSeq/전체 rechargeTrace의 실제 만료·리셋·최대스택 대조가 필요.
 *          증거 없는 스택 증가는 UNKNOWN이며 환급 확정 아님.
 *        · 취소 = 조준 ON→OFF ∧ 비설치. 취소 분기는 자원 무변(P._isAiming=false만)이나
 *          매 프레임 리젠 블록과 겹칠 수 있으므로 적법 리젠 완료는 부작용 아님.
 *          취소 프레임에 설치/스택감소/부적법 스택증가가 섞이면 CANCEL_SIDE_EFFECT?.
 *        · 3팀-후속검토 '실입력·리젠 경계 미실시' + SKILL03 '조준 시작 이후 자원 변경 재검사' 대응.
 *
 * ── 심볼 결선(검증 game.html, 줄번호는 후속 수정으로 이동 가능) ────────────
 *   MBjust def 12298, 프레임 flush 12765(엣지 1프레임만 유효), mousedown set 12798.
 *   weapon:'mouse0' 6061 → 취소 후 LMB는 아이스스톰이 아니라 무기 공격 라우트.
 *   iceStorm 조준/취소/설치 블록 34987–35014:
 *     취소 MBjust[2]||K['Escape'] 34993 → P._isAiming=false
 *     설치 MBjust[0] 34994 → 중복존/스택0/MP<40 검사 후 P.mp-=40(35006),
 *          G._fireZones.push({...type:'iceStorm',maxT:600}) 35007, P._isStk-- 35014.
 *   ⇒ 설치의 유일한 권위 서명 = 신규 iceStorm 존 + mp-40 + stk-1 동시발생.
 *
 * ── 사용(실게임, QA 종료 인계 후 총괄/QA가 명시 호출) ───────────────────────
 *   const probe = IceCancelProbe.install();           // 기존 관측기 자동 dispose
 *   probe.mark('A'); ... probe.mark('F');             // 입력 순서 명세(§산출2)대로
 *   const out = probe.dump(); const v = probe.verdict(); probe.dispose();
 * ========================================================================== */
(function (root) {
  'use strict';

  var CAP = 1200;                 // 프레임/이벤트 링버퍼 상한
  var ICE_MP = 40;                // 설치 MP 비용 (game.html:35006, SSOT 자원리젠+소모공식.md)
  var ICE_STK = 1;               // 설치 스택 비용 (game.html:35014)

  // ── 기본 게임상태 리더 (실게임 전역 스크립트 심볼 직접 참조). mock은 opts.readRaw 주입. ──
  //   반환: { aim, mp, stk, rech, zones:[iceStorm 존 객체…] } 또는 null(읽기 실패).
  //   zones는 "개수"가 아니라 "객체 배열"이라 식별 기반 신규/만료 분리가 가능하다(G5).
  function defaultReadRaw() {
    try {
      var g = (typeof G !== 'undefined') ? G : root.G;
      var p = (typeof P !== 'undefined') ? P : root.P;
      if (!g || !p) return null;
      var fz = g._fireZones || [];
      var zones = [];
      for (var i = 0; i < fz.length; i++) { var z = fz[i]; if (z && z.type === 'iceStorm') zones.push(z); }
      return {
        aim: !!p._isAiming,
        mp: +p.mp,
        stk: +p._isStk,
        rech: +p._isRech,
        zones: zones
      };
    } catch (e) { return null; }
  }

  function createProbe(opts) {
    opts = opts || {};
    var win = opts.win || root;
    var hasRAF = typeof win.requestAnimationFrame === 'function';
    var raf = opts.raf || (hasRAF ? win.requestAnimationFrame.bind(win) : null);
    var caf = opts.caf || (hasRAF ? win.cancelAnimationFrame.bind(win) : function () {});
    var readRaw = opts.readRaw || defaultReadRaw;
    var perf = (typeof performance !== 'undefined') ? performance : null;
    var now = opts.now || function () { return (perf ? perf.now() : Date.now()) | 0; };

    if (!raf) throw new Error('IceCancelProbe: requestAnimationFrame 없음 — 실게임 전제 미충족');

    var frames = [], events = [];
    var f = 0, rafId = 0, disposed = false;
    var curMark = null;                              // 현재 구간 라벨
    var marks = Object.create(null);                 // 구간별 집계 { validSamples, nullSamples, firstFrame }
    var seenZones = (typeof WeakSet !== 'undefined') ? new WeakSet() : null; // 이미 센 iceStorm 존(G5)
    var seenFallback = [];                            // WeakSet 없을 때 폴백(객체 identity 배열)
    var prevLive = [];                               // 직전 프레임 생존 iceStorm 존(만료 계산용)
    var prev = null;                                 // 직전 스칼라 스냅({aim,mp,stk,rech})
    var positiveControl = null;                       // 최초로 포착한 "정상 설치"(양성대조)
    var installCount = 0, otherMpCount = 0, residualStkCount = 0, delayedCount = 0;
    var rechargeTicks = 0, stkRefundCount = 0, cancelCount = 0, cancelSideEffectCount = 0;
    var unknownChargeCount = 0, observationGaps = 0, errors = [], listenerRecords = [];
    function errorRecord(phase, error) { errors.push({ phase: phase, message: String(error && error.message || error) }); }
    function chargeEvidence(raw, delta) {
      if (!(delta > 0)) return 'NONE';
      var trace = raw.rechargeTrace;
      if (!prev || !Number.isInteger(prev.updateSeq) || !Number.isInteger(raw.updateSeq) || raw.updateSeq <= prev.updateSeq || !Array.isArray(trace) || trace.length > CAP || trace.length !== raw.updateSeq - prev.updateSeq) return 'UNKNOWN';
      var timer = prev.rech, stack = prev.stk, gained = 0;
      for (var index = 0; index < trace.length; index++) {
        var step = trace[index];
        if (!step || step.updateSeq !== prev.updateSeq + index + 1 || step.beforeRech !== timer || step.beforeStk !== stack || !Number.isFinite(timer) || !Number.isInteger(stack) || !Number.isFinite(step.sp) || step.sp <= 0 || (step.max !== 2 && step.max !== 3) || stack < 0 || stack > step.max) return 'UNKNOWN';
        if (stack < step.max) { timer -= step.sp; if (timer <= 0) { stack = Math.min(step.max, stack + 1); gained++; timer = stack < step.max ? 1500 : 0; } }
        if (step.afterRech !== timer || step.afterStk !== stack) return 'UNKNOWN';
      }
      return timer === raw.rech && stack === raw.stk && gained === delta ? 'RECHARGE' : 'UNKNOWN';
    }

    function seenHas(z) { return seenZones ? seenZones.has(z) : seenFallback.indexOf(z) !== -1; }
    function seenAdd(z) { if (seenZones) seenZones.add(z); else if (seenFallback.indexOf(z) === -1) seenFallback.push(z); }

    // 신규 설치 수(식별 기반): 현 존 중 아직 안 센 것. 만료 수: 직전 생존 중 현재 없는 것.
    function diffZones(curZones) {
      var newInstalls = 0, k;
      for (k = 0; k < curZones.length; k++) { if (!seenHas(curZones[k])) { newInstalls++; seenAdd(curZones[k]); } }
      var expired = 0;
      for (k = 0; k < prevLive.length; k++) { if (curZones.indexOf(prevLive[k]) === -1) expired++; }
      return { newInstalls: newInstalls, expired: expired };
    }

    function bumpMark(valid) {
      var m = curMark || '(none)';
      var e = marks[m] || (marks[m] = { validSamples: 0, nullSamples: 0, firstFrame: f });
      if (valid) e.validSamples++; else e.nullSamples++;
    }

    function tick() {
      // The scheduled callback has been consumed, even if it runs after disposal.
      rafId = 0;
      if (disposed) return;
      try { sampleTick(); }
      catch (error) { errorRecord('raf-process', error); api.dispose('processing-error'); }
    }

    function sampleTick() {
      var raw;
      try { raw = readRaw(); } catch (error) { errorRecord('raf-read', error); api.dispose('reader-error'); return; }
      if (raw == null) {
        observationGaps++;
        prev = null;
        bumpMark(false);                             // G3: null도 표본으로 집계(조용히 버리지 않음)
      } else {
        bumpMark(true);
        var zd = diffZones(raw.zones || []);
        var dMp = prev ? (raw.mp - prev.mp) : 0;
        var dStk = prev ? (raw.stk - prev.stk) : 0;
        var isInstall = zd.newInstalls > 0;
        // G4: 아이스스톰 설치 서명 = 신규 존 + mp-40 + stk-1 동시
        var isIceCost = isInstall && dStk === -ICE_STK && dMp === -ICE_MP;
        // 분리 기록: 설치 없이 MP만 감소 = 다른 스킬/행동의 MP 소비(아이스스톰 아님)
        var otherMp = !isInstall && dMp < 0;
        // 아이스스톰 고유 자원(스택)이 설치 없이 감소 = 누수 신호(MP보다 특이적)
        var residualStk = !isInstall && dStk < 0;
        var chargeStatus = chargeEvidence(raw, dStk);
        var legitRecharge = chargeStatus === 'RECHARGE';
        var unknownCharge = chargeStatus === 'UNKNOWN';
        var stkRefund = false;  // 리젠 완료 아닌 스택 증가(dStk>1 포함)
        // 조준 OFF 유지 프레임에서 설치 = 지연 발동(버그 신호)
        var aimOffBoth = prev && !prev.aim && !raw.aim;
        var delayed = isInstall && aimOffBoth;
        // ── 취소 경계 ─────────────────────────────────────────────────────
        //   취소 = 조준 ON→OFF 이면서 이번 프레임 설치 아님(MBjust[0] 미발생).
        //   취소 분기는 P._isAiming=false만 한다(자원 무변). 단, 리젠 블록은 매 프레임
        //   독립 실행되므로 취소 프레임이 적법 리젠 완료와 겹칠 수 있다(부작용 아님).
        //   부작용 = 취소 프레임에 설치/스택감소/부적법 스택증가가 섞인 경우.
        var isCancel = prev && prev.aim && !raw.aim && !isInstall;
        var cancelSideEffect = isCancel && (isInstall || residualStk || stkRefund || zd.newInstalls > 0);

        var flag = null;
        if (delayed) { flag = 'DELAYED_FIRE?'; delayedCount++; }
        else if (residualStk) { flag = 'RESIDUAL_STK_SPEND?'; residualStkCount++; }
        else if (stkRefund) { flag = 'STK_REFUND?'; stkRefundCount++; }
        if (cancelSideEffect) { flag = flag || 'CANCEL_SIDE_EFFECT?'; cancelSideEffectCount++; }
        if (isInstall) installCount++;
        if (otherMp) otherMpCount++;
        if (legitRecharge) rechargeTicks += dStk;
        if (unknownCharge) unknownChargeCount++;
        if (isCancel) cancelCount++;
        if (isIceCost && !positiveControl) {
          positiveControl = { frame: f, t: now(), mark: curMark, dMp: dMp, dStk: dStk, newInstalls: zd.newInstalls };
        }

        var aimChanged = prev && (prev.aim !== raw.aim);
        if (zd.newInstalls || zd.expired || dMp || dStk || flag || aimChanged || otherMp || isCancel) {
          frames.push({
            f: f, t: now(), mark: curMark,
            aim: raw.aim, mp: raw.mp, stk: raw.stk, rech: raw.rech, zoneCount: (raw.zones || []).length,
            newInstalls: zd.newInstalls, expired: zd.expired, dMp: dMp, dStk: dStk,
            isInstall: isInstall, isIceCost: isIceCost, otherMp: otherMp,
            legitRecharge: legitRecharge, stkRefund: stkRefund, chargeStatus: chargeStatus, unknownCharge: unknownCharge,
            isCancel: !!isCancel, cancelSideEffect: !!cancelSideEffect,
            aimChanged: !!aimChanged, flag: flag
          });
        }
        prev = { aim: raw.aim, mp: raw.mp, stk: raw.stk, rech: raw.rech, updateSeq: raw.updateSeq };
        prevLive = (raw.zones || []).slice();
      }
      f++;
      if (frames.length > CAP) frames.splice(0, frames.length - CAP);
      if (events.length > CAP) events.splice(0, events.length - CAP);
      try { rafId = raf(tick); } catch (error) { errorRecord('raf-schedule', error); api.dispose('schedule-error'); }
    }

    // ── DOM 입력 로그(캡처단계, 무간섭: passive, preventDefault/stopPropagation 없음) ──
    var listenOpts = { capture: true, passive: true };
    function onDown(e) { events.push({ k: btn(e), ph: 'down', t: now(), f: f, mark: curMark }); }
    function onUp(e) { events.push({ k: btn(e), ph: 'up', t: now(), f: f, mark: curMark }); }
    function onCtx() { events.push({ k: 'contextmenu', ph: 'fire', t: now(), f: f, mark: curMark }); }
    function btn(e) { return e.button === 0 ? 'LMB' : e.button === 2 ? 'RMB' : ('B' + e.button); }

    var listenersAdded = false;

    var api = {
      _isProbe: true,
      mark: function (label) { curMark = String(label); events.push({ k: 'MARK', label: curMark, t: now(), f: f }); return curMark; },
      // G6: aim이 직전 대비 실제로 바뀐 프레임만
      aimTransitions: function () { return frames.filter(function (r) { return r.aimChanged; }); },
      dump: function () {
        return {
          taskId: 'SKILL-03-OBSERVER-FIX', sampledFrames: f,
          counts: { install: installCount, otherMp: otherMpCount, residualStk: residualStkCount, delayed: delayedCount,
            rechargeTicks: rechargeTicks, unknownCharge: unknownChargeCount, stkRefund: stkRefundCount, cancel: cancelCount, cancelSideEffect: cancelSideEffectCount },
          positiveControl: positiveControl, errors: errors.slice(), disposed: disposed,
          unknownCharges: frames.filter(function (row) { return row.unknownCharge; }),
          marks: marks,
          flags: frames.filter(function (r) { return r.flag; }),
          otherMpFrames: frames.filter(function (r) { return r.otherMp; }),
          installs: frames.filter(function (r) { return r.isInstall; }),
          recharges: frames.filter(function (r) { return r.legitRecharge; }),
          refunds: frames.filter(function (r) { return r.stkRefund; }),
          cancels: frames.filter(function (r) { return r.isCancel; }),
          aimTransitions: frames.filter(function (r) { return r.aimChanged; }),
          events: events.slice(), frames: frames.slice()
        };
      },
      // G2+G3: 양성대조 미포착 또는 유효표본0이면 PASS 금지(UNDETERMINED).
      verdict: function (region) {
        var reasons = [];
        if (errors.length || unknownChargeCount || observationGaps) return { verdict: 'UNKNOWN', region: region || null, reason: '충전 증거 부족 또는 관측/정리 예외', errors: errors.slice(), unknownCharge: unknownChargeCount, observationGaps: observationGaps };
        var m = region ? marks[region] : null;
        if (region && (!m || m.validSamples === 0)) {
          return { verdict: 'UNDETERMINED', region: region || null,
            reason: '유효 표본 0 — 관측 불가(미실행/미장착/읽기실패). PASS 금지.' };
        }
        if (!positiveControl) {
          return { verdict: 'UNDETERMINED', region: region || null,
            reason: '양성대조 미포착 — 관측기가 정상 설치(신규존+mp-40+stk-1)를 한 번도 못 봄. 누수 없음을 신뢰할 수 없음.' };
        }
        var leak = delayedCount > 0 || residualStkCount > 0 || stkRefundCount > 0 || cancelSideEffectCount > 0;
        if (delayedCount) reasons.push('지연발동 ' + delayedCount);
        if (residualStkCount) reasons.push('잔류스택소모 ' + residualStkCount);
        if (stkRefundCount) reasons.push('스택환급 ' + stkRefundCount);
        if (cancelSideEffectCount) reasons.push('취소부작용 ' + cancelSideEffectCount);
        return {
          verdict: leak ? 'SUSPECT' : 'PASS', region: region || null,
          positiveControlFrame: positiveControl.frame,
          observed: { cancels: cancelCount, rechargeTicks: rechargeTicks },
          reason: leak ? ('누수 신호: ' + reasons.join(', '))
                       : ('양성대조 포착 + 취소 ' + cancelCount + '회·리젠완료 ' + rechargeTicks +
                          '회 관측, 지연발동/잔류스택/환급/취소부작용 0. (무기공격 라우트 발동은 2차 확인 필요)')
        };
      },
      limitations: [
        'rAF 샘플링 주기 ≠ MBjust 단일 시뮬레이션 tick 엣지(12765 flush). 같은 프레임 RMB·LMB 경합은 추가 tick 근거 필요.',
        '취소 후 LMB의 무기공격(weapon=mouse0,6061) 실제 발동은 본 관측기 1차 신호 아님 — 공격 상태 필드로 2차 확인.',
        '패드 경로·합체(holyIce) 자동 존·본편 카메라 실플레이는 범위 밖.',
        '구문/정적 PASS를 게임 기능 PASS로 확대하지 않음.'
      ],
      _diag: function () { return { listenersAdded: listenersAdded, remainingListeners: listenerRecords.length, errors: errors.length, disposed: disposed, rafId: rafId, sampledFrames: f }; },
      dispose: function (why) {
        if (disposed && listenerRecords.length === 0 && rafId === 0) return 'already-disposed';
        disposed = true;
        // Preserve a failed cancellation handle so a later dispose can retry it.
        if (rafId !== 0) {
          try { caf(rafId); rafId = 0; } catch (error) { errorRecord('cancel-raf', error); }
        }
        var remaining = [];
        for (var index = 0; index < listenerRecords.length; index++) {
          var record = listenerRecords[index];
          try { win.removeEventListener(record.type, record.handler, listenOpts); }
          catch (error) { errorRecord('remove-' + record.type, error); remaining.push(record); }
        }
        listenerRecords = remaining;
        listenersAdded = remaining.length > 0;
        // G1: 네임스페이스도 비운다(단, 이후 다른 probe가 이미 자리를 차지했으면 건드리지 않음).
        try { if (win.__iceCancelProbe === api) win.__iceCancelProbe = null; } catch (e) {}
        return 'disposed' + (why ? '(' + why + ')' : '');
      }
    };
    try {
      if (typeof win.addEventListener === 'function') {
        [{type:'mousedown',handler:onDown},{type:'mouseup',handler:onUp},{type:'contextmenu',handler:onCtx}].forEach(function (record) {
          listenerRecords.push(record);
          win.addEventListener(record.type, record.handler, listenOpts);
          listenersAdded = true;
        });
      }
      var initial = readRaw();
      if (initial) {
        prev = { aim: initial.aim, mp: initial.mp, stk: initial.stk, rech: initial.rech, updateSeq: initial.updateSeq };
        prevLive = (initial.zones || []).slice();
        for (var index = 0; index < prevLive.length; index++) seenAdd(prevLive[index]);
      } else { observationGaps++; }
      rafId = raf(tick);
    } catch (error) { errorRecord('install', error); api.dispose('install-error'); }
    return api;
  }

  // G1: 재설치 시 기존 관측기를 먼저 dispose → rAF·리스너 누수 방지.
  function install(opts) {
    opts = opts || {};
    var win = opts.win || root;
    try {
      if (win.__iceCancelProbe && typeof win.__iceCancelProbe.dispose === 'function') {
        win.__iceCancelProbe.dispose('reinstall');
      }
    } catch (e) {}
    var probe = createProbe(opts);
    try { if (!probe._diag().disposed) win.__iceCancelProbe = probe; } catch (e) {}
    return probe;
  }

  var IceCancelProbe = { install: install, createProbe: createProbe, defaultReadRaw: defaultReadRaw };
  try { root.IceCancelProbe = IceCancelProbe; } catch (e) {}
  if (typeof module !== 'undefined' && module.exports) module.exports = IceCancelProbe;
  return IceCancelProbe;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
