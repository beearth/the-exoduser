// rift-main-stage-clear-admission.candidate.mjs
// ─────────────────────────────────────────────────────────────────────────────
// TASK CH1-RIFT-MAIN-PARALLEL-20261007-BOSS / ROLE BOSS / UUID 72ba2963-…
// COMPLETION-ID CH1-RIFT-MAIN-PARALLEL-20261007-BOSS-CANDIDATE
//
// rift(지옥의 틈) main 진입의 **순수 eligibility 정책**. plain own-data만 입력받아 진입 가능
// 여부·이유 enum·필요 evidence를 산출한다. **부수효과 0**: 보상/SP10 재지급 0, 보스 backup
// 재활용 0, 죽음/부활 수정 0, save/G 쓰기 0, await/epoch/host/transition 소유 0.
// MAP V2 region gate와 소유 겹침 0 — 이 모듈은 **사전 eligibility policy**만.
//
// stageclear 이미-보상 증거(SP10 @game.html:40591)와 rift 진입을 **구분**: 정책은 진입 가부만
// 판정하고 reward를 승격하지 않는다(grantsReward 항상 false).
//
// 실제 G/코드 필드 매핑(root game-adapter가 공급; 없는 필드는 존재 가정 0):
//   REQUIRED_FIELDS 참조. 실제 없는 단일 G.status/G.diff는 어댑터 합성(아래 source:line 명시).
// ─────────────────────────────────────────────────────────────────────────────

export const STATUS = Object.freeze(['playing', 'cleared', 'dead', 'fallen', 'retry', 'boss-arena', 'boss-loading']);

export const RIFT_ADMISSION_REASON = Object.freeze({
  ELIGIBLE_FRESH_ENTRY: 'ELIGIBLE_FRESH_ENTRY',             // 미클리어·playing → 신규 진입 가능
  ELIGIBLE_RESUME_CAPTURED: 'ELIGIBLE_RESUME_CAPTURED',     // capturedContext 존재 → 진행 보존 재개
  ALREADY_REWARDED_CLEAR: 'ALREADY_REWARDED_CLEAR',         // cleared=true → 진입 가능하나 SP10 재지급 0
  BLOCKED_TERMINAL: 'BLOCKED_TERMINAL',                     // doWin/최종
  BLOCKED_DEMO_END: 'BLOCKED_DEMO_END',                     // demo 종료 지점
  BLOCKED_DEAD: 'BLOCKED_DEAD',                             // dead/fallen — 죽음/부활은 정책이 수정 0
  BLOCKED_RETRY_IN_PROGRESS: 'BLOCKED_RETRY_IN_PROGRESS',   // retry/보스 재도전 — backup 재활용 0
  BLOCKED_BOSS_ARENA: 'BLOCKED_BOSS_ARENA',                 // 보스 아레나/로딩 중
  INVALID_STAGE: 'INVALID_STAGE', INVALID_STATUS: 'INVALID_STATUS', INVALID_FLAGS: 'INVALID_FLAGS',
});

// 어댑터가 공급할 실제 필드/없음/source:line (존재 가정 금지).
export const REQUIRED_FIELDS = Object.freeze({
  stage: { gField: 'G.stage', exists: true, src: 'game.html(전역 스테이지 int)' },
  cleared: { gField: 'G.stageCleared', exists: true, src: 'game.html:40590 set true / :42482,:61565,:30386 reset false' },
  status: { gField: 'NONE(어댑터 합성)', exists: false, composeFrom: 'G.stageCleared(40590)+P.s(dead/fallen)+G._bossArena+G._bossLoadPhase+retry', src: 'game.html checkRooms/die/retryBtn' },
  capturedContext: { gField: '_preArenaBackup(모듈 스코프 let, NOT G.*)', exists: true, src: 'game.html:29535 선언 / :29573 capture / :61560 restore' },
  diff: { gField: 'NONE(어댑터 합성)', exists: false, composeFrom: '_diffSigned()', src: 'game.html:40700' },
  bossRetry: { gField: 'NONE(어댑터 합성)', exists: false, composeFrom: 'retryBtn 분기(_retryDruidFinale/arena-backup/field-retry)', src: 'game.html:61539-61565' },
  terminal: { gField: 'NONE(어댑터 합성)', exists: false, composeFrom: 'doWin()(TOTAL_STAGES) 또는 demo-end', src: 'game.html:42483 doWin / :42482,:61726 demo-end' },
  demo: { gField: '_DEMO_MODE + _DEMO_LAST_STAGE', exists: true, src: 'game.html:15852 _DEMO_LAST_STAGE=0' },
});

// 정책이 절대 하지 않는 것(불변식 — 출력에도 명시).
const SIDE_EFFECT_CONTRACT = Object.freeze({ grantsReward: false, reGrantsSP10: false, reusesBossBackup: false, modifiesDeathRevive: false, writesSave: false, ownsTransition: false });

const isBool = v => v === true || v === false;
const isPlainObjOrNull = v => v === null || (typeof v === 'object' && v !== null && !Array.isArray(v) && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null));

function verdict(reason, eligible, requiredEvidence, note) {
  return Object.freeze({ eligible, reason, requiredEvidence: Object.freeze(requiredEvidence), ...SIDE_EFFECT_CONTRACT, note });
}

// 순수 정책. 입력은 plain own-data. 각 필드 1회 읽어 방어 복사(getter 반복/변조 비의존). 출력 frozen.
export function riftAdmission(input) {
  const src = (input && typeof input === 'object') ? input : {};
  // 1회 읽기(프로토타입/게터 트릭 비의존 — 원시값으로 캡처)
  const stage = src.stage, cleared = src.cleared, status = src.status, captured = src.capturedContext,
    diff = src.diff, bossRetry = src.bossRetry, terminal = src.terminal, demo = src.demo;

  if (!Number.isInteger(stage) || stage < 0) return verdict(RIFT_ADMISSION_REASON.INVALID_STAGE, false, ['stage: 음이 아닌 정수 필요'], `stage=${String(stage)}`);
  if (!isBool(cleared) || !isBool(bossRetry) || !isBool(terminal) || !isBool(demo)) return verdict(RIFT_ADMISSION_REASON.INVALID_FLAGS, false, ['cleared/bossRetry/terminal/demo: boolean 필요'], null);
  if (typeof status !== 'string' || !STATUS.includes(status)) return verdict(RIFT_ADMISSION_REASON.INVALID_STATUS, false, [`status ∈ ${STATUS.join('|')}`], `status=${String(status)}`);
  if (!(diff === undefined || diff === null || (typeof diff === 'number' && Number.isFinite(diff)))) return verdict(RIFT_ADMISSION_REASON.INVALID_FLAGS, false, ['diff: null|유한수'], null);
  if (!isPlainObjOrNull(captured)) return verdict(RIFT_ADMISSION_REASON.INVALID_FLAGS, false, ['capturedContext: null|plain object(own-data)'], null);

  // 우선순위(결정적, fail-closed)
  if (terminal) return demo ? verdict(RIFT_ADMISSION_REASON.BLOCKED_DEMO_END, false, ['demo 종료 — rift 진입 0'], 'demo-end(42482/61726)')
    : verdict(RIFT_ADMISSION_REASON.BLOCKED_TERMINAL, false, ['doWin/최종 — rift 진입 0'], 'doWin(42483)');
  if (status === 'dead' || status === 'fallen') return verdict(RIFT_ADMISSION_REASON.BLOCKED_DEAD, false, ['죽음/부활 선결(정책이 수정 0)'], 'die(42311)');
  if (bossRetry || status === 'retry') return verdict(RIFT_ADMISSION_REASON.BLOCKED_RETRY_IN_PROGRESS, false, ['retry transition 완료 대기(backup 재활용 0)'], 'retryBtn(61539)');
  if (status === 'boss-arena' || status === 'boss-loading') return verdict(RIFT_ADMISSION_REASON.BLOCKED_BOSS_ARENA, false, ['보스 아레나/로딩 종료 선결'], null);

  if (cleared) return verdict(RIFT_ADMISSION_REASON.ALREADY_REWARDED_CLEAR, true,
    ['SP10 이미 지급(40591) — 재지급 0', 'rift 진입은 보상과 분리', '어댑터: 다음 rift 지형/진입점 준비'],
    '이미-보상 clear ≠ rift 진입 보상. 진입 허용·보상 승격 0.');
  // 미클리어 playing
  return captured
    ? verdict(RIFT_ADMISSION_REASON.ELIGIBLE_RESUME_CAPTURED, true, ['capturedContext(진행 보존) 재개 — backup 변조 0', '어댑터: _preArenaBackup 소유 유지'], '진행 보존 재개(29573/61560)')
    : verdict(RIFT_ADMISSION_REASON.ELIGIBLE_FRESH_ENTRY, true, ['오픈필드 rift main·보스 아레나 아님 확인', 'initStage 컨텍스트'], '신규 진입');
}

export const evaluate = riftAdmission;
export default { STATUS, RIFT_ADMISSION_REASON, REQUIRED_FIELDS, SIDE_EFFECT_CONTRACT, riftAdmission, evaluate };
