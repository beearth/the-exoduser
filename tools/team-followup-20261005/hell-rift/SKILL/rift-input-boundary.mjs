// rift-input-boundary.mjs
// SKILL 역할 (UUID ec0868f8-7ba5-42f8-b7ca-20e63d4ebda4) 독립 어댑터 후보 — 생산 미채택.
// 공식 배정: ROOT-CLAUDE8-EXISTING-ROLE-ASSIGNMENT-20261006 §11 (CH1_1_A_GRADE_PRODUCTION_20261005.md)
// 책임: 전투/대화/설정 간 입력 소유(ownership) · held/blur/retry · Q전용 magic 패링.
//
// 이 파일은 game.html 실제 소스의 입력 경계 규칙을 "읽기 전용으로 재현"한 독립 모듈이다.
//   - game.html / 보호 2_3(돌진·패링·방패) / 확정 수치 / root 입력코드를 import·수정하지 않는다.
//   - 아래 상수는 소스 관측값의 미러일 뿐이며, 밸런스 변경이 아니다 (확정 수치 변경 0).
//   - 생산 연결·채택 아님. 어댑터는 소스 계약을 테스트 가능한 순수 함수로 고정한 후보다.
//
// 소스 provenance (2026-10-06 checkout, game.html):
//   · BINDS/BINDS2 기본값            game.html:6107-6125
//   · keydown 소유 precedence         game.html:12710-12846
//   · keyup / 사슬 릴리즈              game.html:12862-12897
//   · _clearHeldInput (blur/visibility) game.html:12901-12911
//   · sticky-key 강제해제 (mouse)      game.html:12912-12927
//   · _chkAct/_chkJust/_chkHeld/isAct/isJust/isHeld  game.html:13817-13822
//   · Q전용 패링 (sBlock) 진입         game.html:31829-31831, 13826-13841, _tryKiSlashQCancel
//   · _sdTapBuf / _sdTapOk (E 탭버퍼)   game.html:12749, 37163-37164
//   · 에디터 actor 이동/held 정리      docs/4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md §4
//
// 참고 선행문서: CH1_1_A_GRADE_PRODUCTION_20261005.md §1·§3·§11,
//   MAP_SCENE_EDITOR_20261005.md §4, HELL_RIFT_EDITOR_RESULT_20261006.md.
// 보호 경계: 기존 2_3·Q전용·어택티켓 금지 규칙을 반영만 하고 완화하지 않는다.

'use strict';

/* ────────────────────────────────────────────────────────────────────────
 * 1. 기본 바인딩 — game.html:6107-6125 미러 (frozen, 수정 금지)
 * ──────────────────────────────────────────────────────────────────────── */
export const BINDS_DEFAULT = Object.freeze({
  up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD',
  weapon: 'mouse0', shield: 'KeyE',
  bow: 'Space', charge: 'ShiftLeft',
  parry: 'KeyQ',
  beam: 'mouse2', forge: 'KeyG',
  inventory: 'Tab', settings: 'Escape',
  interact: 'KeyR', storage: 'KeyN', stats: 'KeyJ', skill: 'KeyK',
  skillCycle: 'KeyL', irisToggle: 'KeyY', bladeToggle: 'KeyU',
});
export const BINDS2_DEFAULT = Object.freeze({
  up: null, down: null, left: null, right: null,
  weapon: null, shield: null,
  bow: null, charge: null,
  parry: null, beam: null, skill: null,
  forge: null, inventory: null, settings: null,
  interact: null, storage: null, stats: null,
  skillCycle: null, irisToggle: null, bladeToggle: null,
});

/* ────────────────────────────────────────────────────────────────────────
 * 2. 패링 계약 — game.html:31831 등 미러 (확정 수치, 수정 금지)
 *    Q전용: 패링(데빌포스 흡수 / sBlock)은 BINDS.parry='KeyQ' 로만 진입.
 *    E(BINDS.shield='KeyE')는 "칼등 처내기(sDraw)" 별도 메커니즘 — magic 패링 불가.
 * ──────────────────────────────────────────────────────────────────────── */
export const PARRY_CONTRACT = Object.freeze({
  key: 'parry',            // 액션명 (실제 키는 BINDS.parry = 'KeyQ')
  mpCost: 10,              // P.mp -= 10
  parryWindowFrames: 20,   // P._sbParryT = 20
  cooldownBaseFrames: 30,  // P._sbCd = ~~(30 * (1 + shieldCdRed))
  state: 'sBlock',         // 진입 상태
  qOnly: true,             // E/shield 로는 트리거 불가
});

/* shield(E) 탭버퍼 — game.html:37163-37164 미러 */
export const SHIELD_TAP_FRAMES = 3; // G.frame - _sdTapBuf <= 3

/* 에디터 시험 이동 계약 — MAP_SCENE_EDITOR_20261005.md §4 미러 */
export const ACTOR_MOVE = Object.freeze({
  speedWorldPxPerSec: 320,
  dtMaxSec: 0.05,
  diagonalNormalized: true,
});

/* ────────────────────────────────────────────────────────────────────────
 * 3. 입력 소유(ownership) precedence — game.html keydown 핸들러 순서 미러
 *    소스의 조기 return 순서를 그대로 열거한다.
 * ──────────────────────────────────────────────────────────────────────── */
export const OWNER = Object.freeze({
  CUTSCENE: 'cutscene',     // INTRO_CUTSCENE: ESC/Space/Enter/Z
  BIND_LISTEN: 'bindListen',// 설정 키 리바인드 캡처 (listeningBind)
  ESC_BACK: 'escBack',      // ESC 뒤로가기 (서브상태→패널→설정)
  SYS_COMBO: 'sysCombo',    // Ctrl/Meta 브라우저 단축키 차단
  PANEL: 'panel',           // 포커스된 패널(inv/settings/crBag)이 Space/Enter/Tab 소유
  PARRY_LESSON: 'parryLesson', // 패링 튜토리얼 키 게이트
  COMBAT: 'combat',         // 기본 게임플레이 입력 (K/KH 기록)
});

/**
 * keydown 1건의 소유자를 결정한다 (실제 소스 분기 순서와 동일).
 * ctx: {
 *   cutsceneActive, isRepeat, listeningBind, panelBackAvailable,
 *   ctrlOrMeta, targetInFocusedPanelControl, parryLessonActive, parryLessonAllowsKey
 * }
 * 반환: { owner, consumed, preventDefault } — consumed=true면 전투 입력으로 흘러가지 않음.
 */
export function resolveKeydownOwner(code, ctx = {}) {
  const repeat = !!ctx.isRepeat;

  // (1) 컷씬 — game.html:12712-12716
  if (ctx.cutsceneActive) {
    if (!repeat && code === 'Escape') return _own(OWNER.CUTSCENE, true, true);
    if (code === 'Space')             return _own(OWNER.CUTSCENE, true, true);
    if (!repeat && (code === 'Enter' || code === 'KeyZ')) return _own(OWNER.CUTSCENE, true, true);
  }

  // (2) ESC 뒤로가기 — game.html:12718-12722 (listeningBind 취소 → 패널백 → 설정토글)
  if (code === 'Escape' && !repeat) {
    return _own(OWNER.ESC_BACK, true, true);
  }

  // (3) Ctrl/Meta 조합 — game.html:12725-12728 (ControlLeft/Right 단독은 통과)
  if (ctx.ctrlOrMeta && code !== 'ControlLeft' && code !== 'ControlRight') {
    return _own(OWNER.SYS_COMBO, true, true);
  }

  // (4) 설정 키 리바인드 캡처 — game.html:12729-12738 (Escape 포함 모든 키 흡수)
  if (ctx.listeningBind) {
    return _own(OWNER.BIND_LISTEN, true, true);
  }

  // (5) 패링 레슨 게이트 — game.html:12744
  if (ctx.parryLessonActive && !ctx.parryLessonAllowsKey) {
    return _own(OWNER.PARRY_LESSON, true, true);
  }

  // (6) 포커스된 패널이 활성/탐색 키 소유 — game.html:12746
  //     (Space/Enter/NumpadEnter/Tab 가 inv/settings/crBag 컨트롤 안에서 발생)
  if (ctx.targetInFocusedPanelControl &&
      (code === 'Space' || code === 'Enter' || code === 'NumpadEnter' || code === 'Tab')) {
    return _own(OWNER.PANEL, true, false); // 패널 네이티브 처리, preventDefault 안 함
  }

  // (7) 기본 전투 입력 — game.html:12747 이후 (K[code]=true; KH[code]=true)
  return _own(OWNER.COMBAT, false, false);
}

function _own(owner, consumed, preventDefault) {
  return { owner, consumed, preventDefault };
}

/* ────────────────────────────────────────────────────────────────────────
 * 4. 입력 상태 머신 — K/KH/MB/MBjust 와 isAct/isJust/isHeld 재현
 *    game.html:13817-13822 의 엣지 소비(_chkJust) 의미까지 동일하게 구현.
 * ──────────────────────────────────────────────────────────────────────── */
export function createInputBoundary(opts = {}) {
  const binds = { ...BINDS_DEFAULT, ...(opts.binds || {}) };
  const binds2 = { ...BINDS2_DEFAULT, ...(opts.binds2 || {}) };

  const K = Object.create(null);       // per-frame press state (엣지 소비 대상)
  const KH = Object.create(null);      // held buffer
  const MB = Object.create(null);      // mouse button held
  const MBjust = Object.create(null);  // mouse button just-pressed (엣지)

  // 패링 레슨 훅 (옵션) — isAct/isJust/isHeld 의 action 게이트
  let lessonAllows = opts.lessonAllows || null; // (action) => boolean

  // E 탭버퍼 — game.html:12749, 37163-37164
  let sdTapBuf = -999;

  function _chkAct(b) {
    if (!b) return false;
    if (b.startsWith('mouse')) return !!MB[+b.slice(5)];
    return !!K[b];
  }
  function _chkJust(b) {
    if (!b) return false;
    if (b.startsWith('mouse')) {
      const n = +b.slice(5);
      if (MBjust[n]) { MBjust[n] = false; return true; }
      return false;
    }
    if (K[b]) { K[b] = false; return true; } // 읽으면 소비
    return false;
  }
  function _chkHeld(b) {
    if (!b) return false;
    if (b.startsWith('mouse')) return !!MB[+b.slice(5)];
    return !!KH[b];
  }
  function _lessonBlocks(action) {
    return !!lessonAllows && !lessonAllows(action);
  }

  const api = {
    K, KH, MB, MBjust,
    binds, binds2,

    // ── 이벤트 주입 ─────────────────────────────────────────────
    keydown(code, { repeat = false, frame = 0 } = {}) {
      K[code] = true; KH[code] = true;
      // E(shield) 탭버퍼 스탬프 — 초고속 탭에서 keyup 이 K 지우기 전 보존
      if (!repeat && (code === binds.shield || code === binds2.shield)) sdTapBuf = frame;
    },
    keyup(code) { K[code] = false; KH[code] = false; },
    mousedown(button) { MB[button] = true; MBjust[button] = true; },
    mouseup(button) { MB[button] = false; },

    // ── 쿼리 — game.html:13819-13822 미러 ───────────────────────
    isAct(action) {
      if (_lessonBlocks(action)) return false;
      return _chkAct(binds[action]) || _chkAct(binds2[action]);
    },
    isJust(action) {
      if (_lessonBlocks(action)) return false;
      return _chkJust(binds[action]) || _chkJust(binds2[action]);
    },
    isHeld(action) {
      if (_lessonBlocks(action)) return false;
      return _chkHeld(binds[action]) || _chkHeld(binds2[action]);
    },

    // ── E 탭버퍼 — game.html:37164 ──────────────────────────────
    shieldTapOk(frame) {
      if (sdTapBuf >= 0 && frame - sdTapBuf <= SHIELD_TAP_FRAMES) { sdTapBuf = -999; return true; }
      return false;
    },
    clearShieldTap() { sdTapBuf = -999; }, // E 소비 시 (game.html:31355 등)

    // ── held/blur 정리 — game.html:12901-12911 (_clearHeldInput) ──
    // blur / visibilitychange(hidden) / 시험 종료 / 로딩 시작 공통.
    clearHeldInput() {
      for (const k in K) K[k] = false;
      for (const k in KH) KH[k] = false;
      for (const b in MB) MB[b] = false;
      for (const b in MBjust) MBjust[b] = false;
      sdTapBuf = -999;
      if (typeof api.onClearHeld === 'function') api.onClearHeld(); // dashHold/beamHold/aiming 외부 상태 훅
    },

    // ── sticky-key 강제해제 — game.html:12912-12927 ─────────────
    // 포인터 이벤트에서 Shift modifier 가 안 눌려있으면 KH 잔류 Shift 해제
    // (패드 정상 홀드/주입은 보호: gamepadActive/injectedShift 가드).
    stickyKeyRelease({ shiftDown = false, gamepadActive = false, injectedShift = false } = {}) {
      if (!gamepadActive && !injectedShift && !shiftDown) {
        if (KH['ShiftLeft']) KH['ShiftLeft'] = false;
        if (KH['ShiftRight']) KH['ShiftRight'] = false;
      }
    },

    setLessonAllows(fn) { lessonAllows = fn; },
  };
  return api;
}

/* ────────────────────────────────────────────────────────────────────────
 * 5. Q전용 magic 패링 — 진입 조건 미러 + E 불가 가드
 *    game.html:31829-31831 / _tryKiSlashQCancel(13826-13841) 미러.
 * ──────────────────────────────────────────────────────────────────────── */
/**
 * 패링을 트리거하려는 액션이 "Q전용" 규칙을 지키는지 검증한다.
 * magic 패링은 action==='parry'(= BINDS.parry='KeyQ') 로만 가능. shield(E)는 거부.
 */
export function assertParryActionAllowed(action) {
  if (action === 'shield') return false;           // E = 칼등 처내기, magic 패링 아님
  return action === 'parry';                        // Q 전용
}

/**
 * sBlock(magic 패링) 진입 가능 여부 — 순수 판정.
 * state: { mp, sbCd, qIsIceOrb, qIsPeaceShield }
 * (얼음보주/평화의보호 변형은 별도 분기이며 여기선 기본 데미지감소 보호막 조건만.)
 */
export function canMagicParry(state = {}) {
  const { mp = 0, sbCd = 0, qIsIceOrb = false, qIsPeaceShield = false } = state;
  if (qIsIceOrb) return false;        // Q: 얼음보주 분기
  if (qIsPeaceShield) return false;   // Q: 평화의 보호 분기 (mp>0 조건 별도)
  return sbCd <= 0 && mp >= PARRY_CONTRACT.mpCost;
}

/**
 * 패링 진입 결과(확정 수치) 미러 — 상태 전이 값만 반환. 실제 P 변형은 소스 소유.
 * 확정 수치 변경 0: mp 소비/parryT/쿨다운은 PARRY_CONTRACT 그대로.
 */
export function magicParryTransition({ shieldCdRed = 0 } = {}) {
  return Object.freeze({
    state: PARRY_CONTRACT.state,                 // 'sBlock'
    mpDelta: -PARRY_CONTRACT.mpCost,             // -10
    parryT: PARRY_CONTRACT.parryWindowFrames,    // 20
    cooldown: ~~(PARRY_CONTRACT.cooldownBaseFrames * (1 + shieldCdRed)), // ~~(30*(1+red))
    st2: 999,
  });
}

/* ────────────────────────────────────────────────────────────────────────
 * 6. 에디터 시험 캐릭터 이동 — MAP_SCENE_EDITOR_20261005.md §4 미러
 *    축별 충돌(canWalk 주입), 대각 정규화, dt clamp, blocked=제자리 idle.
 * ──────────────────────────────────────────────────────────────────────── */
/**
 * x/y, held 입력, dt 로 다음 위치를 계산한다 (순수).
 * held: { up, down, left, right } boolean
 * canWalk: (x, y) => boolean  (radius12 5점 검사는 호출측 책임)
 * 반환: { x, y, dx, dy, moving }
 */
export function stepActorMove(x, y, held, dt, canWalk) {
  const dtc = Math.min(ACTOR_MOVE.dtMaxSec, Math.max(0, dt || 0));
  let ix = (held.right ? 1 : 0) - (held.left ? 1 : 0);
  let iy = (held.down ? 1 : 0) - (held.up ? 1 : 0);
  if (ix === 0 && iy === 0) return { x, y, dx: 0, dy: 0, moving: false };
  if (ACTOR_MOVE.diagonalNormalized && ix !== 0 && iy !== 0) {
    const inv = 1 / Math.SQRT2; ix *= inv; iy *= inv;
  }
  const step = ACTOR_MOVE.speedWorldPxPerSec * dtc;
  let nx = x, ny = y;
  // 축별 충돌 검사 — 막힌 축은 제자리 (dx/dy 로 heading/moving 갱신)
  const tx = x + ix * step;
  if (!canWalk || canWalk(tx, y)) nx = tx;
  const ty = y + iy * step;
  if (!canWalk || canWalk(nx, ty)) ny = ty;
  const dx = nx - x, dy = ny - y;
  return { x: nx, y: ny, dx, dy, moving: (dx !== 0 || dy !== 0) };
}

/* ────────────────────────────────────────────────────────────────────────
 * 7. 인라인 자가검증 (직접 실행 시에만). 별도 TASK/report 파일 금지 규칙 준수.
 *    node tools/team-followup-20261005/hell-rift/SKILL/rift-input-boundary.mjs
 * ──────────────────────────────────────────────────────────────────────── */
function _selfTest() {
  let pass = 0, fail = 0;
  const ok = (name, cond) => { if (cond) { pass++; } else { fail++; console.error('FAIL:', name); } };

  // 기본 바인딩
  ok('parry=KeyQ', BINDS_DEFAULT.parry === 'KeyQ');
  ok('shield=KeyE', BINDS_DEFAULT.shield === 'KeyE');
  ok('parry2=null', BINDS2_DEFAULT.parry === null);

  // Q전용 가드
  ok('parry action allowed', assertParryActionAllowed('parry') === true);
  ok('shield(E) rejected for parry', assertParryActionAllowed('shield') === false);

  // 패링 진입 조건 + 확정 수치
  ok('canMagicParry mp10 cd0', canMagicParry({ mp: 10, sbCd: 0 }) === true);
  ok('no parry mp9', canMagicParry({ mp: 9, sbCd: 0 }) === false);
  ok('no parry on cd', canMagicParry({ mp: 50, sbCd: 5 }) === false);
  ok('no parry iceOrb', canMagicParry({ mp: 50, sbCd: 0, qIsIceOrb: true }) === false);
  const tr = magicParryTransition({ shieldCdRed: 0 });
  ok('parry mp-10', tr.mpDelta === -10);
  ok('parry window 20', tr.parryT === 20);
  ok('parry cd 30', tr.cooldown === 30);
  ok('parry cd red .5 -> 45', magicParryTransition({ shieldCdRed: 0.5 }).cooldown === 45);

  // isJust 엣지 소비
  const ib = createInputBoundary();
  ib.keydown('KeyQ');
  ok('isAct parry held', ib.isAct('parry') === true);
  ok('isJust parry once', ib.isJust('parry') === true);
  ok('isJust parry consumed', ib.isJust('parry') === false); // 한 번 읽으면 소비
  ok('isHeld parry still (KH)', ib.isHeld('parry') === true); // KH 는 keyup 전까지 유지
  ib.keyup('KeyQ');
  ok('isHeld parry cleared', ib.isHeld('parry') === false);

  // 탭버퍼
  const ib2 = createInputBoundary();
  ib2.keydown('KeyE', { frame: 100 });
  ok('shield tap within 3f', ib2.shieldTapOk(102) === true);
  ok('shield tap consumed', ib2.shieldTapOk(102) === false);
  ib2.keydown('KeyE', { frame: 200 });
  ok('shield tap expired >3f', ib2.shieldTapOk(205) === false);

  // blur 정리
  const ib3 = createInputBoundary();
  ib3.keydown('KeyW'); ib3.keydown('ShiftLeft'); ib3.mousedown(0);
  ib3.clearHeldInput();
  ok('blur clears KH', ib3.isHeld('up') === false);
  ok('blur clears MB', ib3.isAct('weapon') === false);

  // sticky-key: Shift modifier 안 눌림 → KH Shift 해제, 패드 보호
  const ib4 = createInputBoundary();
  ib4.keydown('ShiftLeft');
  ib4.stickyKeyRelease({ shiftDown: false, gamepadActive: false, injectedShift: false });
  ok('sticky shift released', ib4.KH['ShiftLeft'] === false);
  ib4.keydown('ShiftLeft');
  ib4.stickyKeyRelease({ shiftDown: false, gamepadActive: true });
  ok('sticky shift protected on pad', ib4.KH['ShiftLeft'] === true);

  // 소유 precedence
  ok('cutscene owns ESC', resolveKeydownOwner('Escape', { cutsceneActive: true }).owner === OWNER.CUTSCENE);
  ok('escBack owns ESC', resolveKeydownOwner('Escape', {}).owner === OWNER.ESC_BACK);
  ok('bindListen steals KeyW', resolveKeydownOwner('KeyW', { listeningBind: true }).owner === OWNER.BIND_LISTEN);
  ok('panel owns Space', resolveKeydownOwner('Space', { targetInFocusedPanelControl: true }).owner === OWNER.PANEL);
  ok('panel Space no preventDefault', resolveKeydownOwner('Space', { targetInFocusedPanelControl: true }).preventDefault === false);
  ok('combat owns KeyQ', resolveKeydownOwner('KeyQ', {}).owner === OWNER.COMBAT);
  ok('combat KeyQ not consumed', resolveKeydownOwner('KeyQ', {}).consumed === false);
  ok('parryLesson blocks disallowed', resolveKeydownOwner('KeyW', { parryLessonActive: true, parryLessonAllowsKey: false }).owner === OWNER.PARRY_LESSON);
  ok('ctrl combo blocked', resolveKeydownOwner('KeyS', { ctrlOrMeta: true }).owner === OWNER.SYS_COMBO);
  ok('ControlLeft passes combos', resolveKeydownOwner('ControlLeft', { ctrlOrMeta: true }).owner === OWNER.COMBAT);

  // actor 이동
  const m1 = stepActorMove(0, 0, { right: true, down: true }, 0.05, () => true);
  ok('diag normalized', Math.abs(Math.hypot(m1.dx, m1.dy) - 320 * 0.05) < 1e-6);
  ok('dt clamped', stepActorMove(0, 0, { right: true }, 10, () => true).x === 320 * ACTOR_MOVE.dtMaxSec);
  const m2 = stepActorMove(0, 0, { right: true }, 0.05, () => false);
  ok('blocked = idle in place', m2.x === 0 && m2.moving === false);

  console.log(`rift-input-boundary self-test: ${pass} pass, ${fail} fail`);
  return fail === 0;
}

// 직접 실행 가드 (import 시 미실행)
if (typeof process !== 'undefined' && process.argv && process.argv[1]) {
  const here = new URL(import.meta.url).pathname;
  if (process.argv[1] === here || process.argv[1].endsWith('rift-input-boundary.mjs')) {
    const ok = _selfTest();
    if (typeof process.exit === 'function') process.exit(ok ? 0 : 1);
  }
}

export default {
  BINDS_DEFAULT, BINDS2_DEFAULT, PARRY_CONTRACT, SHIELD_TAP_FRAMES, ACTOR_MOVE, OWNER,
  resolveKeydownOwner, createInputBoundary,
  assertParryActionAllowed, canMagicParry, magicParryTransition, stepActorMove,
};
