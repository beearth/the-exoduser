/* ============================================================================
 * MAP-020 M5 수동입력 관측기 (manual-input observer) — 상태쓰기 0
 * 세션 d447a49d / Mac MAP / 2026-10-02
 * 원 하니스 m5-walk-harness.safe.js 는 보존. 이 파일은 그 대안으로,
 *   K[] 쓰기·합성 KeyboardEvent·P 좌표 순간배치를 전혀 하지 않고
 *   "실제 사용자 입력"을 관측만 한다.
 *
 * ── 안전 계약 (검증결과.md G1~G3 + 이번 지시) ────────────────────────────
 *  [NO-WRITE]  게임 상태(K/KH/P/G.map/충돌/적/카메라)에 쓰지 않는다. 전부 읽기.
 *  [READ]      현재좌표 P.x/P.y, 전방벽 "원식" isW(px,py) 네이티브 호출, K[code]
 *              (사용자가 실제로 누른 상태) 를 읽어 표본을 만든다.
 *  [PASSIVE]   keydown/keyup/blur/visibilitychange 는 {passive:true}로 "관측만".
 *              preventDefault·K/KH 수정·_clearHeldInput 호출 없음(게임이 알아서 함).
 *  [CLEANUP]   stop()/abort()/오류 시 리스너 제거 + interval 정리를 보장(finally).
 *  [FOCUS]     blur/hidden 경계에서 현재 leg를 종료(focus-lost)하고 샘플을 끊는다.
 *  출력은 기존 evidence gate(m5-evidence-gate.cjs judge)에 그대로 투입된다.
 *  실게임/화면/8뷰 검수는 root 단독 후속 — 이번 시각 PASS 금지. 미방문 8뷰=UNKNOWN.
 * ========================================================================== */
(function (root) {
  'use strict';
  if (typeof G === 'undefined' || typeof P === 'undefined' || typeof T === 'undefined') {
    console.error('M5MANUAL: G/P/T 심볼 없음 — 실게임 전제 미충족');
    return { ok: false, reason: 'no-symbols' };
  }

  // ── [READ] 네이티브 충돌 원식 + 타일 분류기(백업) ─────────────────────────
  const nIsW = (typeof isW === 'function')
    ? ((x, y) => { try { return !!isW(x, y, true); } catch (e) { return null; } })   // 전방벽 원식(네이티브)
    : (() => null);
  const tile = (wx, wy) => [Math.floor(wx / T), Math.floor(wy / T)];
  const wallTile = (wx, wy) => { const [tx, ty] = tile(wx, wy), r = G.map && G.map[ty]; return !(r && r[tx] === 0); };

  // ── [READ] 바인드 해석(변경 없음) ─────────────────────────────────────────
  function resolveBinds() {
    const def = { N: 'KeyW', S: 'KeyS', E: 'KeyD', W: 'KeyA' };
    try {
      const B = (typeof BINDS !== 'undefined') ? BINDS : (root && root.BINDS) ? root.BINDS : null;
      if (!B || typeof B !== 'object') return { map: def, source: 'default-wasd' };
      const pick = (keys) => { for (const k of keys) { if (typeof B[k] === 'string' && B[k]) return B[k]; if (B[k] && typeof B[k].code === 'string') return B[k].code; } return null; };
      return {
        map: {
          N: pick(['up', 'moveUp', 'north', 'U']) || def.N, S: pick(['down', 'moveDown', 'south', 'D']) || def.S,
          E: pick(['right', 'moveRight', 'east', 'R']) || def.E, W: pick(['left', 'moveLeft', 'west', 'L']) || def.W,
        }, source: 'game-binds'
      };
    } catch (e) { return { map: def, source: 'default-wasd(err)' }; }
  }

  // ── [READ] 원본맵 보존 시그니처(쓰기 0 증명용) ────────────────────────────
  const win = { x0: 150, y0: 150, x1: 178, y1: 178 };
  const sig = () => { let h = 2166136261 >>> 0; for (let ty = win.y0; ty <= win.y1; ty++) { const r = (G.map && G.map[ty]) || []; for (let tx = win.x0; tx <= win.x1; tx++) { h = Math.imul(h ^ ((r[tx] | 0) + 1), 16777619) >>> 0; } } return h >>> 0; };

  // ── [READ] 좌표 계약 감사(네이티브 isW 포함) ──────────────────────────────
  const b2w = (b) => b * 1000 / 1024;
  const coordAudit = () => ({
    doc_M5_world: { world: [7000, 6900], wallTile: wallTile(7000, 6900), gameIsW: nIsW(7000, 6900) },
    doc_M5_bake: { world: [b2w(7000), b2w(6900)], wallTile: wallTile(b2w(7000), b2w(6900)), gameIsW: nIsW(b2w(7000), b2w(6900)) },
    approach: { world: [6660, 6140], wallTile: wallTile(6660, 6140), gameIsW: nIsW(6660, 6140) },
  });

  const now = () => (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  const MOVE_CODES = { KeyW: 'N', ArrowUp: 'N', KeyS: 'S', ArrowDown: 'S', KeyD: 'E', ArrowRight: 'E', KeyA: 'W', ArrowLeft: 'W' };

  // ── 관측 세션 ──────────────────────────────────────────────────────────────
  function start(opts) {
    opts = opts || {};
    const doc = (typeof document !== 'undefined') ? document : null;
    const SAMPLE_MS = opts.sampleMs || 50;
    const Kg = (typeof K !== 'undefined') ? K : (root && root.K) || null;
    const binds = resolveBinds();
    const codeToDir = (c) => MOVE_CODES[c] || null;
    const dirDelta = { N: [0, -20], S: [0, 20], E: [20, 0], W: [-20, 0] };

    const AC = (typeof AbortController !== 'undefined') ? new AbortController() : { signal: { aborted: false }, abort() { this.signal.aborted = true; } };
    const st = {
      running: true, startedAt: now(), legs: [], cur: null, lastDir: null,
      focusEvents: [], inputEvents: [], mapRef: G.map, sigBefore: sig(),
      interval: null, listeners: [], abort: AC,
    };

    // 현재 눌린 이동 방향(여러개면 최초 1개). [READ] Kg만 읽음.
    const heldDir = () => {
      if (!Kg) return null;
      for (const c of ['KeyW', 'KeyS', 'KeyD', 'KeyA', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']) {
        if (Kg[c]) { const d = codeToDir(c); if (d) return { dir: d, code: c }; }
      }
      // 바인드가 커스텀이면 binds.map 역참조
      for (const d of ['N', 'S', 'E', 'W']) { const c = binds.map[d]; if (c && Kg[c]) return { dir: d, code: c }; }
      return null;
    };

    const openLeg = (dir, code) => { st.cur = { name: 'obs' + (st.legs.length + 1) + '_' + dir, dir, code, samples: [] }; };
    const closeLeg = (reason) => {
      if (st.cur && st.cur.samples.length) {
        const last = st.cur.samples[st.cur.samples.length - 1];
        st.cur.endPos = { x: last.x, y: last.y };
        st.cur.stopReason = reason || st.cur.stopReason || 'segment-end';
        st.cur.mapUnchanged = st.cur.samples.every((s) => s.mapSame !== false);
        st.legs.push(st.cur);
      }
      st.cur = null; st.lastDir = null;
    };

    // [PASSIVE] 관측 전용 리스너
    const onKey = (ev) => { st.inputEvents.push({ type: ev.type, code: ev.code, t: Math.round(now() - st.startedAt) }); };
    const onBlur = () => { st.focusEvents.push({ type: 'blur', t: Math.round(now() - st.startedAt) }); closeLeg('focus-lost'); };
    const onVis = () => { if (doc && doc.hidden) { st.focusEvents.push({ type: 'hidden', t: Math.round(now() - st.startedAt) }); closeLeg('focus-lost'); } };
    const addL = (tgt, type, fn, o) => { if (tgt && tgt.addEventListener) { tgt.addEventListener(type, fn, o); st.listeners.push({ tgt, type, fn, o }); } };
    addL(doc, 'keydown', onKey, { passive: true, capture: false });
    addL(doc, 'keyup', onKey, { passive: true, capture: false });
    addL(root, 'blur', onBlur, { passive: true });
    addL(doc, 'visibilitychange', onVis, { passive: true });

    const tick = () => {
      try {
        if (st.abort.signal.aborted) { stop('external-abort'); return; }
        const hd = heldDir();
        if (!hd) { if (st.cur) closeLeg('idle'); return; } // 입력 없으면 leg 끊음(관측만)
        if (!st.cur || st.lastDir !== hd.dir) { if (st.cur) closeLeg('dir-change'); openLeg(hd.dir, hd.code); st.lastDir = hd.dir; }
        const d = dirDelta[hd.dir] || [0, 0];
        st.cur.samples.push({
          t: Math.round(now() - st.startedAt),
          x: P.x, y: P.y,                                   // [READ] 현재좌표
          held: !!Kg[hd.code],                              // [READ] 실제 사용자 입력
          wall: nIsW(P.x, P.y),                             // [READ] 플레이어 중심 원식
          wallAhead: wallTile(P.x + d[0], P.y + d[1]),      // [READ] 전방 타일(백업)
          gameWallAhead: nIsW(P.x + d[0], P.y + d[1]),      // [READ] 전방벽 원식(네이티브)
          mapSame: (G.map === st.mapRef),
        });
      } catch (e) { stop('tick-error:' + (e && e.message)); }
    };

    const removeAll = () => { for (const L of st.listeners) { try { L.tgt.removeEventListener(L.type, L.fn, L.o); } catch (e) {} } st.listeners = []; };
    function stop(reason) {
      if (!st.running) return st._result;
      st.running = false;
      try {
        if (st.interval !== null) { clearInterval(st.interval); st.interval = null; } // [CLEANUP]
        closeLeg(reason || 'stopped');
      } finally {
        removeAll();                                         // [CLEANUP] 리스너 제거 보장
      }
      const sigAfter = sig();
      st._result = {
        fixture: 'MAP020-M5-manual',
        mode: 'observe-only',
        stage: G.stage, T, binds,
        coordAudit: coordAudit(),
        legs: st.legs,
        focusEvents: st.focusEvents,
        inputEvents: st.inputEvents,
        mapUnchanged: (G.map === st.mapRef && sigAfter === st.sigBefore),
        mapSig: { before: st.sigBefore, after: sigAfter },
        stopReason: reason || 'stopped',
      };
      try { console.log('M5MANUAL_RESULT_JSON\n' + JSON.stringify(st._result)); } catch (e) {}
      try { if (root) root._m5manual = st._result; } catch (e) {}
      return st._result;
    }

    st.interval = setInterval(tick, SAMPLE_MS);
    const controller = { stop, getResult: () => st._result, isRunning: () => st.running, _abort: AC, _state: st };
    try { if (root) root._m5manualCtl = controller; } catch (e) {}
    return controller;
  }

  // ── evidence gate 번들 변환 ────────────────────────────────────────────────
  // result → judge() 입력. boundaryMap으로 관측 leg를 SSOT 경계명에 수동 매핑할 수
  //  있다(미지정 경계는 gate가 미방문 UNKNOWN 처리). viewTags 없으면 8뷰 UNKNOWN.
  function toGateBundle(result, cfg) {
    cfg = cfg || {};
    const legs = (result.legs || []).map((lg) => {
      const mapped = cfg.boundaryMap && cfg.boundaryMap[lg.name];
      return mapped ? Object.assign({}, lg, { name: mapped }) : lg;
    });
    return {
      legs,
      views: cfg.views || [],
      walkCoverage: cfg.walkCoverage || [],
      coordProbes: result.coordAudit,   // 네이티브 isW 포함 → 좌표계약 평가 가능
    };
  }

  const api = { start, toGateBundle, resolveBinds, coordAudit };
  try { if (root) { root._m5manualStart = start; root._m5manualApi = api; } } catch (e) {}
  if (typeof module !== 'undefined' && module.exports && module.filename && /manual-input-observer/.test(module.filename)) module.exports = api;
  return api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
