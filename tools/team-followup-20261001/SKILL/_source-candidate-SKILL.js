window.__iceCancelProbe = (() => {
  // iceStorm 취소→다음 LMB 입력경계 읽기 관측기. 생산코드 무변경·입력 무간섭.
  const CAP = 1200;                     // 프레임 링버퍼 상한
  const frames = [], events = [];
  let f = 0, raf = 0, disposed = false;
  const now = () => (performance.now() | 0);
  const iceZones = () => { try { return (G._fireZones || []).reduce((n, z) => n + (z && z.type === 'iceStorm' ? 1 : 0), 0); } catch { return -1; } };
  const snap = () => { try { return { aim: !!P._isAiming, mp: +P.mp, stk: +P._isStk, rech: +P._isRech, zones: iceZones(),
    mb0: !!MBjust[0], mb2: !!MBjust[2], esc: !!(K && K.Escape) }; } catch { return null; } };

  // ── DOM 입력 로그 (캡처단계, 무간섭) ──
  const onDown = e => events.push({ k: e.button === 0 ? 'LMB' : e.button === 2 ? 'RMB' : ('B' + e.button), ph: 'down', t: now(), f });
  const onUp   = e => events.push({ k: e.button === 0 ? 'LMB' : e.button === 2 ? 'RMB' : ('B' + e.button), ph: 'up',   t: now(), f });
  const onCtx  = () => events.push({ k: 'contextmenu', ph: 'fire', t: now(), f });
  addEventListener('mousedown', onDown, { capture: true, passive: true });
  addEventListener('mouseup',   onUp,   { capture: true, passive: true });
  addEventListener('contextmenu', onCtx, { capture: true, passive: true });

  // ── 프레임 샘플 + 지연발동/잔류소비 검출 ──
  let prev = snap();
  const tick = () => {
    if (disposed) return;
    const s = snap();
    if (s) {
      // 이전 프레임 대비 iceStorm 효과 변화
      const dZone = prev ? s.zones - prev.zones : 0;
      const dMp   = prev ? s.mp   - prev.mp   : 0;
      const dStk  = prev ? s.stk  - prev.stk  : 0;
      const installed = dZone > 0;                               // 실제 설치 발생
      const resSpent  = dMp < 0 || dStk < 0;                     // 자원 감소 발생
      // 지연발동 신호: 조준 OFF 상태에서 설치/자원소모가 일어나면 누수(버그)
      const aimWasOff = prev && !prev.aim && !s.aim;
      const flag = (installed || resSpent) && aimWasOff ? 'DELAYED_FIRE?'
                 : (resSpent && !installed) ? 'RESIDUAL_SPEND?'  // 자원만 깎이고 설치 없음
                 : null;
      if (dZone || dMp || dStk || flag || (prev && prev.aim !== s.aim))
        frames.push({ f, t: now(), ...s, dZone, dMp, dStk, flag });
      prev = s;
    }
    f++;
    if (frames.length > CAP) frames.splice(0, frames.length - CAP);
    if (events.length > CAP) events.splice(0, events.length - CAP);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return {
    mark: label => events.push({ k: 'MARK', label: String(label), t: now(), f }),   // 입력 단계 수동 구분용
    dump: () => ({ head: 'dd3bdc18', sampledFrames: f,
      flags: frames.filter(r => r.flag),
      aimTransitions: frames.filter(r => 'aim' in r),
      events: events.slice(), frames: frames.slice() }),
    dispose: () => { disposed = true; cancelAnimationFrame(raf);
      removeEventListener('mousedown', onDown, { capture: true });
      removeEventListener('mouseup', onUp, { capture: true });
      removeEventListener('contextmenu', onCtx, { capture: true });
      return 'disposed'; }
  };
})();
