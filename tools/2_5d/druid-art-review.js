/* A single authored SW image is offered only in the opt-in, frozen boss review. */
(() => {
  'use strict';
  const q = new URLSearchParams(location.search);
  if (q.get('bossReview') !== '1' || q.get('bosstest') !== '0' ||
      q.get('bossArtReview') !== 'druid-sw-max') return;

  const registration = Object.freeze({
    width: 2336, height: 3504, anchorX: 1184, anchorY: 3386,
    bodyHeight: 3356, referenceCellHeight: 620,
    referenceAnchorY: 603, referenceBodyHeight: 591
  });
  const img = new Image();
  let ready = false, failed = false, mode = 'candidate', status = null;
  const updateStatus = () => {
    if (status) status.textContent = failed ? '새 원화 로딩 실패 · 원본 표시' :
      !ready ? '새 원화 불러오는 중 · 원본 표시' :
      mode === 'candidate' ? '새 원화 · SW 정지 비교' : '원본 · SW 정지 비교';
  };
  img.onload = () => {
    ready = img.naturalWidth === registration.width && img.naturalHeight === registration.height;
    failed = !ready;
    updateStatus();
  };
  img.onerror = () => { failed = true; ready = false; updateStatus(); };
  img.src = 'assets/sprites/boss/review/druid_sw_higgsfield_max_20261009.png?v=0327590c';

  function freezeSW(e) {
    if (!e || e !== window._btBoss || !window._btActive || e.hp <= 0) return false;
    if (!window._btPaused && typeof window._btPauseToggle === 'function') window._btPauseToggle();
    if (!e._btFrozen || e.s !== 'idle') return false;
    e.facing = Math.PI * 3 / 4;
    return true;
  }

  function attach(e) {
    if (!window.__bossReview?.isolated || !freezeSW(e) || document.getElementById('druidArtReview')) return;
    const panel = document.createElement('div');
    panel.id = 'druidArtReview';
    panel.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:81;padding:10px 14px;border:1px solid #8b7960;border-radius:8px;background:#171b18ed;color:#eee3ce;font:13px sans-serif;display:grid;gap:7px;max-width:360px';
    const title = document.createElement('strong');
    title.textContent = '드루이드 원화 비교';
    status = document.createElement('span');
    const controls = document.createElement('div');
    controls.style.cssText = 'display:flex;gap:8px';
    for (const [value, label] of [['original', '원본'], ['candidate', '새 원화']]) {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = label;
      button.style.cssText = 'flex:1;padding:7px 12px;border:1px solid #8b7960;border-radius:5px;background:#2c342e;color:#fff4df;cursor:pointer';
      button.addEventListener('click', () => {
        if (!freezeSW(window._btBoss)) return;
        mode = value; updateStatus();
      });
      controls.append(button);
    }
    const note = document.createElement('span');
    note.textContent = 'AI 재개·공격 시 기존 모션으로 돌아갑니다.';
    note.style.cssText = 'font-size:11px;color:#c8c4b7';
    panel.append(title, status, controls, note);
    document.body.append(panel);
    updateStatus();
  }

  function draw(X, e, sa, tdY, spec, stage, nativeDir) {
    if (mode !== 'candidate' || !ready || !window.__bossReview?.isolated ||
        !window._btActive || stage !== 0 || e !== window._btBoss ||
        e.ib !== true || e.alive !== true || !(e.hp > 0) ||
        e._btFrozen !== true || e.s !== 'idle' || nativeDir !== 1 ||
        !Number.isFinite(e.r) || e.r <= 0) return false;
    const dh = e.r * spec.dh;
    const pixelScale = dh * registration.referenceBodyHeight /
      registration.referenceCellHeight / registration.bodyHeight;
    const footY = dh * (registration.referenceAnchorY / registration.referenceCellHeight - .86);
    const breath = Math.sin(performance.now() * .003) * 2;
    const un = 1 / (window._btScaleMul || 1);
    X.save();
    try {
      X.translate(e.x, e.y + (tdY || 0) - 6 + breath);
      X.scale(un, un);
      X.globalCompositeOperation = 'source-over';
      X.globalAlpha = sa;
      X.imageSmoothingEnabled = true;
      X.imageSmoothingQuality = 'high';
      X.drawImage(img, -registration.anchorX * pixelScale,
        footY - registration.anchorY * pixelScale,
        registration.width * pixelScale, registration.height * pixelScale);
      e._nameTopOff = (tdY || 0) - 6 + breath - dh * .86 * un - 10;
    } finally { X.restore(); }
    return true;
  }
  window._druidArtReview = Object.freeze({ attach, draw, registration });
})();
