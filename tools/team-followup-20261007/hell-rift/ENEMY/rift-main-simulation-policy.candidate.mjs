// ════════════════════════════════════════════════════════════════════════
//  rift-main-simulation-policy.candidate.mjs
//  OFFICIAL-COMPLETION-ID: CH1-RIFT-MAIN-PARALLEL-20261007-ENEMY-CANDIDATE
//  배정: TASK CH1-RIFT-MAIN-PARALLEL-20261007-ENEMY (ROLE ENEMY)
//
//  mainRift active host 수명 동안 **어떤 parent(본편 game.html) 시뮬레이션을 동결**하고
//  **어떤 UI/전환을 계속**해야 하는지 결정하는 **순수(pure) detached policy**.
//  데이터만 반환한다 — 아무것도 변이하지 않음: G.paused 미변경·새 spawn 0·timer/RAF 0·
//  enemy/projectile 상태 저장 0·게임 실행 0. "전체 게임 자동 동결 완료"를 주장하지 않는다.
//  freeze 는 host 가 **별도 게이트**로 적용할 신호이며, 원본의 기존 inactive tick 을 보존한다.
//
//  ── 실제 본문 Read (game.html, fresh Read / 파일존재·검색과 구분) ─────────
//   update() @30914 → 입력/토글 처리 후 **`if(G.paused)return` @30938** 이 이후 전체 sim(enemy/
//     projectile/spawn/poison/damage) 과 `_gameFrame++` @30943 를 스킵. draw() @50212 / loop() @60004
//     는 paused 여도 계속(UI/HUD 유지) → **기존 paused tick = sim 동결 + draw 지속**(이 정책이 바꾸지 않음).
//   패널이 G.paused 를 구동: togglePanel @42635 / openPanel @42636 / closePanel @42664 /
//     closeAllPanels @42665 / 스킬팝업 @45571·@45466 / 레벨업 오버레이 @61514·@61516 (= ESC/인벤 경계).
//   ★누락되기 쉬운 hotpath: keydown 핸들러가 **독립적으로 `!G.paused`** 를 검사(@12749,12752,12758,
//     12764,12802,12806,12818,12822,12826,12832,12836,12841) → update() 게이트와 별개로 입력 시 발동.
//     host freeze 가 update-return 만 흉내 내면 이 입력 hotpath 를 **놓친다**(캘러가 입력도 게이트해야 함).
//   combat sim hotpath(동결 대상): 적 pre-loop(오라/둔화/덫) @33187 → 적 AI LOD 루프 updateE @33245/
//     33248/33251/33254(def @37269) · 소환굴 스폰 @34362 · hurtE @40779 · hurtP @42015 ·
//     DOT poison/burn 적용 @23411/@23413/@31088 · projectile life step `p.life-=sp` @18743.
//   (proj 이동 루프 헤더 정확 라인은 미확정 → PENDING, 발명하지 않음.)
//
//  AI/spawn/damage/collision/save/원본18assets 변경 0. 공유 billboard/원본 수정 0.
//  보호 2_3/Q-only magic·blackBean(E 패링0)/어택티켓 금지/기존23/사용자 save/LOCK/SSOT 보존.
//  맵 geometry/배치/발/카메라 작업 아님 → map guide 전체 Read 를 선행완료로 주장 0. VISUAL=미관측 RETOUCH.
// ════════════════════════════════════════════════════════════════════════

export const HOST_STATES = Object.freeze(['active','entering','restoring','disposed','stale-identity','unknown']);

// 동결 대상 combat sim 서브시스템 + 실 source:line (캘러 skip-flags)
export const COMBAT_SKIP_FLAGS = Object.freeze([
  Object.freeze({ flag:'enemyAI',        src:'game.html:33187 pre-loop / 33245,33248,33251,33254 updateE(def 37269)' }),
  Object.freeze({ flag:'summonPitSpawn', src:'game.html:34362 (소환굴 트리거 스폰)' }),
  Object.freeze({ flag:'projectileStep', src:'game.html:18743 (p.life-=sp); 이동 루프 헤더 PENDING' }),
  Object.freeze({ flag:'damage',         src:'game.html:40779 hurtE / 42015 hurtP' }),
  Object.freeze({ flag:'dotPoisonBurn',  src:'game.html:23411,23413,31088 (poison/burn 적용)' }),
  Object.freeze({ flag:'gameFrameTick',  src:'game.html:30943 (_gameFrame++)' }),
]);

// update() 게이트(@30938) 와 별개로 입력 시 발동 → freeze 시 캘러가 반드시 함께 게이트할 hotpath
export const INPUT_HOTPATHS_NOT_IN_UPDATE_GATE = Object.freeze([
  Object.freeze({ src:'game.html:12749-12841', note:"keydown '!G.paused' 독립 검사(shield/dash/skill/ult/mask 등) — update-return 흉내만으론 누락" }),
]);

// 원본 pause 모델(이 정책이 바꾸지 않는 불변 계약)
export const PARENT_PAUSE_MODEL = Object.freeze({
  simGate:'game.html:30938 if(G.paused)return (이후 sim 전체 스킵)',
  uiContinues:'game.html:50212 draw() / 60004 loop() paused 중 지속',
  pausedBy:'togglePanel/openPanel/closePanel/closeAllPanels/skillPopup/levelup (@42635,42636,42664,42665,45571,61514)',
  note:'host freeze 는 G.paused 를 쓰지 않는 별도 게이트. 원본 inactive tick(sim 동결+draw 지속) 보존.',
});

const _freeze = (o) => Object.freeze(o);

// ── 순수 정책: (host) → 결정. 변이/부작용 0 ──────────────────────────────
//   host = { state, identity?, expectedIdentity? }
export function riftMainSimulationPolicy(host){
  const h = host || {};
  let state = HOST_STATES.includes(h.state) ? h.state : 'unknown';
  // stale identity: 토큰 불일치면 (명시 state 와 무관하게) 절대 live game 을 동결하지 않음
  if(state !== 'disposed' && state !== 'unknown'
     && h.expectedIdentity != null && h.identity != null && h.identity !== h.expectedIdentity){
    state = 'stale-identity';
  }

  // combat / UI / transition 을 **독립** 계산
  let freezeParentCombat, keepParentUI, keepTransitions, reason;
  switch(state){
    case 'active':
      freezeParentCombat = true;  keepParentUI = true;  keepTransitions = false;
      reason = 'host 전경 활성 — parent combat 동결, UI 유지'; break;
    case 'entering':
      freezeParentCombat = true;  keepParentUI = true;  keepTransitions = true;
      reason = '진입 전환 — combat 동결 시작, 전환 애니/UI 지속'; break;
    case 'restoring':
      freezeParentCombat = true;  keepParentUI = true;  keepTransitions = true;
      reason = '복귀 전환 — parent 아직 비활성, 전환/UI 지속(완료 시 parent 핸드오프)'; break;
    case 'disposed':
      freezeParentCombat = false; keepParentUI = false; keepTransitions = false;
      reason = 'host 해제 — freeze 해제(parent 자체 tick 재개), 정책 inert'; break;
    case 'stale-identity':
      freezeParentCombat = false; keepParentUI = false; keepTransitions = false;
      reason = 'stale host — live game 동결 금지(no-op)'; break;
    default: // unknown
      state = 'unknown';
      freezeParentCombat = false; keepParentUI = false; keepTransitions = false;
      reason = 'unknown — fail-safe: 동결 금지(라이브 game 보호)'; break;
  }

  const simFrozen = freezeParentCombat;
  return _freeze({
    state, reason,
    // combat 게이트
    freezeParentCombat,
    combatSkipFlags: simFrozen ? COMBAT_SKIP_FLAGS : Object.freeze([]),
    // UI/전환 게이트 — combat 과 독립
    ui: _freeze({ keepParentUI, keepTransitions }),
    // 불변 보증
    preserveParentInactiveTick: true,   // 원본 paused tick 모델 미변경
    touchesUserPause: false,            // G.paused 를 쓰지 않음
    writesParentState: false, createsTimerOrRAF: false, spawnsEnemies: false, runsGame: false,
    inputHotpathsToGate: simFrozen ? INPUT_HOTPATHS_NOT_IN_UPDATE_GATE : Object.freeze([]),
    parentPauseModel: PARENT_PAUSE_MODEL,
  });
}

// 편의 getter (pure)
export function shouldFreezeCombat(host){ return riftMainSimulationPolicy(host).freezeParentCombat; }
export function uiFlags(host){ return riftMainSimulationPolicy(host).ui; }
