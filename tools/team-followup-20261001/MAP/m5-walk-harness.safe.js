/* ============================================================================
 * MAP-020 M5 주머니 보행 하니스 — 안전화 사본 (MAP-020-M5-PREFLIGHT)
 * 원본: r-input-evidence/evidence.zip!candidates/MAP.js
 *       (sha256 ee72db6d3efae293680a35781ca96e995b59bade995a93f936909bea3d2ca27f)
 * 작성: Mac MAP 팀 / 2026-10-01 / 실행하지 않음(정적 보강 + mock 검사만).
 *
 * 이 사본은 game.html·공용 함수·맵·충돌을 바꾸지 않는다. 실게임 실행은
 * QA 종료 인계 전 보류한다. 본 파일은 "실행 준비 완료"가 아니라 "검증결과.md
 * MAP.js 게이트를 반영한 안전화 후보"다.
 *
 * ── 검증결과.md(MAP.js) 게이트 → 본 사본의 반영 ──────────────────────────
 *  G1 "읽기 전용 아님": K[] 직접쓰기·합성키 입력(원본 :28), P 좌표 순간배치(:52)
 *      → [STATE-CHANGE] 주석으로 명시 분류. 아래 §마킹 규약 참조.
 *  G2 외부 취소·finally·오류 시 키 해제 없음
 *      → 모든 leg를 try/finally로 감싸 키 해제+interval 정리 보장. 전역
 *        AbortController(window._m5fixAbort)로 외부 취소 지원.
 *  G3 flatline은 기록만 하고 중단하지 않음(:42,:44)
 *      → flatline 감지 시 즉시 leg를 종료(STOP)하도록 구현 정정. 문구도 일치.
 *  (추가) 포커스/바인드/생존 게이트: 원본 전제(§3)만 있던 것을 실제 런타임
 *        게이트로 승격. 미충족이면 착수 자체를 거부(throw)한다.
 *
 * ── 마킹 규약(정적 식별용) ──────────────────────────────────────────────
 *  [STATE-CHANGE] : 런타임 상태를 바꾸는 줄(검수 PASS 아님, SETUP 성격).
 *  [KEY-INPUT]    : 합성 키 이벤트/ K[] 쓰기.
 *  [COORD-WRITE]  : P.x / P.y 좌표 쓰기.
 *  [READ-ONLY]    : 읽기 전용 관측/감사.
 *  [GATE]         : 착수 전 전제 검사(미충족 시 거부).
 *  [CLEANUP]      : 취소/정상/오류 공통 정리 경로.
 * ========================================================================== */
(function (root) {
  'use strict';

  // [READ-ONLY] 심볼 존재 확인 — 실게임 전제. 없으면 착수 거부.
  if (typeof G === 'undefined' || typeof P === 'undefined' || typeof T === 'undefined') {
    const msg = 'M5FIX: G/P/T 심볼 없음 — 실게임 전제 미충족';
    console.error(msg);
    return { ok: false, reason: 'no-symbols', error: msg };
  }

  // ── [GATE] 착수 전 게이트 (미충족이면 던져서 중단) ──────────────────────
  // 키코드 상수와 바인드는 아래 §바인드 해석에서 결정한다.
  const CODES = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

  // §바인드 해석: 게임 커스텀 바인드가 있으면 읽어서 방향→코드로 쓰고,
  //  없으면 기본 WASD. 바인드 자체는 절대 변경하지 않는다. [READ-ONLY]
  function resolveBinds() {
    const def = { N: 'KeyW', S: 'KeyS', E: 'KeyD', W: 'KeyA' };
    try {
      const B = (typeof BINDS !== 'undefined') ? BINDS
              : (root && root.BINDS) ? root.BINDS : null;
      if (!B || typeof B !== 'object') return { map: def, source: 'default-wasd' };
      // 흔한 표기들을 관대하게 수용(up/down/left/right, moveUp 등). 값은 코드 문자열 가정.
      const pick = (keys) => {
        for (const k of keys) {
          if (typeof B[k] === 'string' && B[k]) return B[k];
          if (B[k] && typeof B[k].code === 'string') return B[k].code;
        }
        return null;
      };
      const m = {
        N: pick(['up', 'moveUp', 'north', 'U']) || def.N,
        S: pick(['down', 'moveDown', 'south', 'D']) || def.S,
        E: pick(['right', 'moveRight', 'east', 'R']) || def.E,
        W: pick(['left', 'moveLeft', 'west', 'L']) || def.W,
      };
      return { map: m, source: 'game-binds' };
    } catch (e) {
      return { map: def, source: 'default-wasd(err)' };
    }
  }

  // §생존/포커스/일시정지 — 샘플 중에도 재검사하는 조건자. [READ-ONLY]
  const isAlive = () => {
    try {
      if (P.dead === true || P.isDead === true) return false;
      if (typeof P.hp === 'number' && P.hp <= 0) return false;
      return true;
    } catch (e) { return false; }
  };
  const isFocused = () => {
    try {
      const d = (typeof document !== 'undefined') ? document : null;
      if (!d) return true; // document 없으면 게이트 생략(헤드리스)
      if (typeof d.hidden === 'boolean' && d.hidden) return false;
      if (typeof d.hasFocus === 'function' && !d.hasFocus()) return false;
      return true;
    } catch (e) { return true; }
  };
  const isPaused = () => { try { return !!G.paused; } catch (e) { return false; } };

  function assertGates(binds) {
    const problems = [];
    if (G.stage !== 0) problems.push('stage0 아님(G.stage=' + G.stage + ')');
    if (isPaused()) problems.push('일시정지 상태');
    if (!isFocused()) problems.push('게임 포커스 아님/탭 숨김');
    if (!isAlive()) problems.push('플레이어 사망/HP0 — 생존 게이트 실패');
    if (binds.source.indexOf('default') === 0 && typeof BINDS !== 'undefined') {
      problems.push('BINDS 존재하나 해석 실패 → 기본 WASD 사용(커스텀 바인드면 교체 필요)');
    }
    return problems;
  }

  // ── [READ-ONLY] 타일 분류기 + 게임 isW 병기 ────────────────────────────
  const tile = (wx, wy) => [Math.floor(wx / T), Math.floor(wy / T)];
  const wallTile = (wx, wy) => { const [tx, ty] = tile(wx, wy), r = G.map && G.map[ty]; return !(r && r[tx] === 0); };
  const gIsW = (typeof isW === 'function')
    ? ((wx, wy) => { try { return !!isW(wx, wy); } catch (e) { return null; } })
    : (() => null);

  // ── [READ-ONLY] 좌표 계약 감사: 문서7000,6900 vs 베이크환산 vs 접근점 ───
  const b2w = (b) => b * 1000 / 1024;
  const coordAudit = {
    document: { world: [7000, 6900], tile: tile(7000, 6900), wallTile: wallTile(7000, 6900), gameIsW: gIsW(7000, 6900) },
    bakeConv: { world: [b2w(7000), b2w(6900)], tile: tile(b2w(7000), b2w(6900)), wallTile: wallTile(b2w(7000), b2w(6900)), gameIsW: gIsW(b2w(7000), b2w(6900)) },
    approach: { world: [6660, 6140], tile: tile(6660, 6140), wallTile: wallTile(6660, 6140), gameIsW: gIsW(6660, 6140) }
  };

  // ── [READ-ONLY] 원본맵 보존 시그니처: 포켓 주변 타일창 체크섬 전후 비교 ──
  const win = { x0: 150, y0: 150, x1: 178, y1: 178 };
  const sig = () => { let h = 2166136261 >>> 0; for (let ty = win.y0; ty <= win.y1; ty++) { const r = (G.map && G.map[ty]) || []; for (let tx = win.x0; tx <= win.x1; tx++) { h = Math.imul(h ^ ((r[tx] | 0) + 1), 16777619) >>> 0; } } return h >>> 0; };
  const mapRef = G.map, sigBefore = sig();

  // ── 입력 경로 (게임 K[]+KeyboardEvent) ─────────────────────────────────
  const Kg = (typeof K !== 'undefined') ? K : ((root && root.K) ? root.K : null);
  const hold = (c, on) => {
    if (Kg) Kg[c] = on;                                   // [KEY-INPUT][STATE-CHANGE] K[] 직접 쓰기
    try {
      if (typeof document !== 'undefined' && document.dispatchEvent) {
        document.dispatchEvent(new KeyboardEvent(on ? 'keydown' : 'keyup', { code: c, key: c, bubbles: true })); // [KEY-INPUT]
      }
    } catch (e) { /* headless mock: KeyboardEvent 없을 수 있음 */ }
  };
  const relAll = () => CODES.forEach((c) => hold(c, false)); // [KEY-INPUT][CLEANUP] 모든 이동키 해제

  // ── 외부 취소 지원: 전역 AbortController ───────────────────────────────
  // 총괄/QA가 window._m5fixAbort.abort() 로 즉시 중단 가능.
  const AC = (typeof AbortController !== 'undefined') ? new AbortController() : { signal: { aborted: false }, abort() { this.signal.aborted = true; } };
  try { if (root) root._m5fixAbort = AC; } catch (e) {}
  const aborted = () => { try { return !!AC.signal.aborted; } catch (e) { return false; } };

  // 활성 interval 추적(이중 안전). finally에서 정리.
  let activeInterval = null;
  const clearActive = () => { if (activeInterval !== null) { clearInterval(activeInterval); activeInterval = null; } };

  // ── 샘플러: 50ms. 중단조건 = (G3) flatline 즉시 STOP / 게이트 이탈 / 타임아웃 ──
  const EPS = 0.5, FLAT = 5; // Δ<0.5px 가 5표본(≈250ms) 연속 = 막힘
  const leg = (name, code, maxMs, dir) => new Promise((res, rej) => {
    const pr = { N: [0, -20], S: [0, 20], E: [20, 0], W: [-20, 0] }[dir] || [0, 0];
    const t0 = performance.now(), S = [];
    let flat = 0, last = null, blockedAt = null, stopReason = null;

    const finish = (reason) => {                 // [CLEANUP] 단일 종료 경로
      clearActive();
      hold(code, false);                         // [KEY-INPUT][CLEANUP] 현재 키 해제
      res({ name, code, dir, maxMs, stopReason: reason, blockedAt, endPos: { x: P.x, y: P.y }, samples: S });
    };

    hold(code, true);                            // [KEY-INPUT][STATE-CHANGE] 키 누름 시작
    try {
      activeInterval = setInterval(() => {
        try {
          // [GATE] 매 틱 안전 조건 재검사 — 이탈 시 즉시 STOP
          if (aborted()) return finish('external-abort');
          if (isPaused()) return finish('paused');
          if (!isFocused()) return finish('focus-lost');
          if (!isAlive()) return finish('player-dead'); // 생존 게이트: flatline 중단

          const t = performance.now() - t0;
          S.push({
            t: Math.round(t), x: P.x, y: P.y,
            camx: (G.cam && G.cam.x), camy: (G.cam && G.cam.y),
            held: Kg ? !!Kg[code] : null,
            hp: P.hp, pState: (P._anim || P.state || null), paused: isPaused(),
            wallAhead: wallTile(P.x + pr[0], P.y + pr[1]),
            gameWallAhead: gIsW(P.x + pr[0], P.y + pr[1]),
            mapSame: (G.map === mapRef)
          });

          if (last && Math.hypot(P.x - last.x, P.y - last.y) < EPS) {
            if (++flat >= FLAT) {
              // (G3 정정) flatline = 게임 충돌 결과의 권위적 "막힘" 신호.
              // 기록만 하지 않고 즉시 leg 종료(STOP).
              if (!blockedAt) blockedAt = { x: P.x, y: P.y, t: Math.round(t) };
              return finish('flatline-blocked');
            }
          } else { flat = 0; }
          last = { x: P.x, y: P.y };

          if (t >= maxMs) return finish('timeout');
        } catch (e) {
          // [CLEANUP] 틱 내부 오류도 키·interval 정리 후 reject
          clearActive(); hold(code, false); rej(e);
        }
      }, 50);
    } catch (e) {
      clearActive(); hold(code, false); rej(e);  // [CLEANUP] setInterval 자체 실패
    }
  });

  // ── 실행부 ─────────────────────────────────────────────────────────────
  async function run() {
    const binds = resolveBinds();
    const gateProblems = assertGates(binds);
    if (gateProblems.length) {
      // [GATE] 하나라도 실패하면 착수 거부(상태 변경 전에 중단).
      const err = new Error('M5FIX 게이트 실패: ' + gateProblems.join(' / '));
      console.error(err.message);
      throw err;
    }

    relAll();                                    // [KEY-INPUT][CLEANUP] 시작 전 전 키 해제
    const setupFrom = { x: P.x, y: P.y };        // [READ-ONLY] 원위치 기록

    // [STATE-CHANGE][COORD-WRITE] SETUP(검수 PASS 아님): 검증된 비벽 접근점 1회 배치.
    //  충돌/맵 미변경. approach가 비벽일 때만 수행.
    let setupApplied = false;
    if (!coordAudit.approach.wallTile) { P.x = 6660; P.y = 6140; setupApplied = true; }

    // 방향은 바인드 해석 결과(binds.map)로 코드를 치환 — 바인드 변경 아님.
    const plan = [
      ['A_enter_south', binds.map.S, 2500, 'S'],  // 진입: 남진→막힌 남측 ~y6304
      ['B_inside_north', binds.map.N, 1500, 'N'], // 내부 북상(입구) ~y6137
      ['C_entry_east', binds.map.E, 800, 'E'],    // 입구 동측 개구 ~x6746
      ['D_block_south2', binds.map.S, 2500, 'S'], // 동측 남진→곡선 남측벽 ~y6223
      ['E_exit_north', binds.map.N, 1200, 'N'],   // 이탈(북)
      ['E2_exit_west', binds.map.W, 1200, 'W'],   // 이탈(서) 개활지 복귀
    ];
    const legs = [];
    try {
      for (const [nm, cd, ms, d] of plan) {
        legs.push(await leg(nm, cd, ms, d));
        if (aborted()) break; // [GATE] 외부 취소 시 남은 leg 실행하지 않음
      }
    } finally {
      // [CLEANUP] 정상·예외·외부취소 공통: 모든 키 해제 + 활성 interval 정리.
      clearActive();
      relAll();
    }

    const out = {
      fixture: 'MAP020-M5-walk(safe)',
      stage: G.stage, T,
      binds,
      viewWorld: [typeof VW !== 'undefined' ? VW : null, typeof VH !== 'undefined' ? VH : null],
      coordAudit, setupFrom, setupApplied,
      mapUnchanged: (G.map === mapRef && sig() === sigBefore),
      mapSig: { before: sigBefore, after: sig() },
      legs
    };
    try { console.log('M5FIX_RESULT_JSON\n' + JSON.stringify(out)); } catch (e) {}
    try { if (root) root._m5fix = out; } catch (e) {}
    return out;
  }

  // 자동 실행하지 않는다. 브라우저 콘솔/스크립트 전용 클래식 스크립트이므로
  // API는 전역(window/globalThis)에 노출한다. 실게임에서는 총괄/QA가 명시 호출:
  //   window._m5fixRun().then(r => /* 콘솔 JSON 저장 */)
  //   window._m5fixAbort.abort()  // 즉시 중단
  const api = { run, resolveBinds, assertGates, coordAudit, _abort: AC };
  try { if (root) { root._m5fixRun = run; root._m5fixApi = api; } } catch (e) {}
  // CJS로 require될 경우에도 사용 가능하도록 보조 export(루트 package.json이
  // type:module이면 .js는 ESM이라 이 경로는 보통 미사용 — mock은 전역을 읽는다).
  if (typeof module !== 'undefined' && module.exports && module.filename && /m5-walk-harness/.test(module.filename)) module.exports = api;
  return api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
