// rift-main-stage-clear-admission-v2.candidate.mjs
// ─────────────────────────────────────────────────────────────────────────────
// TASK CH1-RIFT-MAIN-POLICIES-FIX-20261007-BOSS / ROLE BOSS / UUID 72ba2963-…
// COMPLETION-ID CH1-RIFT-MAIN-POLICIES-FIX-20261007-BOSS-CANDIDATE
//
// v1(rift-main-stage-clear-admission.candidate.mjs) 결함 수정판. v1 불변(별도 파일).
//
// P1a (v1 직접 src.X 조회: getter/inherited 발동): v2는 **안전 own-data projection** —
//   Object.getOwnPropertyDescriptor로 각 키를 읽어 accessor(get/set)·inherited(own 없음)·
//   Proxy getOwnPropertyDescriptor trap throw를 **값 호출 없이** 분리. 불안전 → UNKNOWN_UNSAFE_INPUT
//   fail-closed(임의 Error.message 조회 0, thenable await 0).
// P1b (v1 cleared:false→eligible:true, host 계약 위반): rift admission/continue는 **stageCleared===true
//   선결**. cleared=false(playing/boss-arena 전투/loading 등)는 **진입·continue 거절**(STAGE_NOT_CLEARED).
//   정상 clear는 실제 boss arena에서도 발생(game.html:40589-40591) → G._bossArena=true 단독 영구차단 0.
//
// 부수효과 0: SP10 재지급 0(이미 :40591 지급), 보스 backup 재활용 0, clear reset 0, save/G 쓰기 0,
//   await/epoch/host/rootgate 소유 0. 순수 admission policy만. MAP region gate 겹침 0.
//
// 실제 source:line (fresh Read, 발명 0):
//   clear/SP10  game.html:40589 if(!G.bossAlive) / :40590 G.stageCleared=true / :40591 P.sp+=10
//   signed diff game.html:8977 _diffSigned=()=>((OPT.diff??5)-5) 범위 -5..+5 (DIFF_MUL :8975)
//   next diff off  G._stageDiffOff: 필드 :15919 init 0 / :61710 set(o.off) / :29945 monLv 사용 / :61429 reset
//   demo bypass  _DEMO_MODE=true·_DEMO_LAST_STAGE=0(:15852) / nextBtn :61726 demo→nextStage→demo-end,
//                full build → _showNextDiffPop(난이도 선택→_stageDiffOff→continue) = 미래 main route
//   capturedContext = _preArenaBackup(모듈 let :29535, capture :29573, restore :61560; NOT G.*)
// AGENTS.md §6: 맵 배치/발/카메라 아님 → 맵가이드 전체 read 비적용. VISUAL VERDICT: NOT ASSESSED.
// ─────────────────────────────────────────────────────────────────────────────

export const STATUS = Object.freeze(['playing', 'cleared', 'dead', 'fallen', 'retry', 'boss-arena', 'boss-loading']);
export const DIFF_SIGNED_MIN = -5, DIFF_SIGNED_MAX = 5; // game.html:8977

export const RIFT_ADMISSION_REASON = Object.freeze({
  ADMIT_CLEARED_CONTINUE: 'ADMIT_CLEARED_CONTINUE',   // cleared=true → 진입/continue 허용(보상 재지급 0)
  STAGE_NOT_CLEARED: 'STAGE_NOT_CLEARED',             // cleared=false → 거절(P1b: host 계약 선결)
  BLOCKED_TERMINAL: 'BLOCKED_TERMINAL',
  BLOCKED_DEMO_END: 'BLOCKED_DEMO_END',
  BLOCKED_DEAD: 'BLOCKED_DEAD',
  BLOCKED_RETRY_IN_PROGRESS: 'BLOCKED_RETRY_IN_PROGRESS',
  UNKNOWN_UNSAFE_INPUT: 'UNKNOWN_UNSAFE_INPUT',       // getter/accessor/inherited-proxy/trap throw → fail-closed
  INVALID_STAGE: 'INVALID_STAGE', INVALID_STATUS: 'INVALID_STATUS', INVALID_FLAGS: 'INVALID_FLAGS',
});

export const REQUIRED_FIELDS = Object.freeze({
  stage: { gField: 'G.stage', exists: true },
  cleared: { gField: 'G.stageCleared', exists: true, src: 'game.html:40590 set / :42482,:61565,:30386 reset' },
  status: { gField: 'NONE(어댑터 합성)', exists: false, composeFrom: 'G.stageCleared+P.s(dead/fallen)+G._bossArena+G._bossLoadPhase+retry' },
  capturedContext: { gField: '_preArenaBackup(모듈 let, NOT G.*)', exists: true, src: 'game.html:29535/29573/61560' },
  diff: { gField: 'NONE(어댑터 합성)', exists: false, composeFrom: '_diffSigned()', src: 'game.html:8977 범위 -5..+5' },
  stageDiffOff: { gField: 'G._stageDiffOff', exists: true, src: 'game.html:15919 init / :61710 set / :29945 use' },
  bossRetry: { gField: 'NONE(어댑터 합성)', exists: false, composeFrom: 'retryBtn 분기', src: 'game.html:61539-61565' },
  terminal: { gField: 'NONE(어댑터 합성)', exists: false, composeFrom: 'doWin()/demo-end', src: 'game.html:42483/42482/61726' },
  demo: { gField: '_DEMO_MODE+_DEMO_LAST_STAGE', exists: true, src: 'game.html:15852' },
});

const SIDE_EFFECT_CONTRACT = Object.freeze({ implicitGrant: false, grantsReward: false, reGrantsSP10: false, reusesBossBackup: false, resetsClear: false, modifiesDeathRevive: false, writesSave: false, ownsTransition: false });
const PROJECT_KEYS = Object.freeze(['stage', 'cleared', 'status', 'capturedContext', 'diff', 'stageDiffOff', 'bossRetry', 'terminal', 'demo']);

const isBool = v => v === true || v === false;
const isPlainObjOrNull = v => v === null || (typeof v === 'object' && v !== null && !Array.isArray(v) && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null));

function verdict(reason, eligible, requiredEvidence, note, extra) {
  return Object.freeze({ eligible, reason, requiredEvidence: Object.freeze(requiredEvidence), ...SIDE_EFFECT_CONTRACT, ...(extra || {}), note });
}

// 안전 own-data projection: 값 getter 호출 없이 descriptor로 읽음. accessor/proxy-throw → unsafe. inherited → absent(undefined).
function project(src) {
  if (src === null || typeof src !== 'object') return { unsafe: false, data: {} }; // 비객체 → 전부 absent → 이후 INVALID
  const data = {};
  for (const k of PROJECT_KEYS) {
    let desc;
    try { desc = Object.getOwnPropertyDescriptor(src, k); } // Proxy trap throw 가능 → catch
    catch { return { unsafe: true, key: k }; }
    if (desc === undefined) { data[k] = undefined; continue; } // own 없음(inherited/absent)
    if ('get' in desc || 'set' in desc) return { unsafe: true, key: k }; // accessor 거절(getter 미호출)
    data[k] = desc.value;
  }
  return { unsafe: false, data };
}

export function riftAdmission(input) {
  const pr = project(input);
  if (pr.unsafe) return verdict(RIFT_ADMISSION_REASON.UNKNOWN_UNSAFE_INPUT, false, ['own-data plain 값 필요(getter/accessor/proxy 거절)'], `unsafe field: ${pr.key}`);
  const { stage, cleared, status, capturedContext: captured, diff, stageDiffOff, bossRetry, terminal, demo } = pr.data;

  if (!Number.isInteger(stage) || stage < 0) return verdict(RIFT_ADMISSION_REASON.INVALID_STAGE, false, ['stage: 음이 아닌 정수(own-data)'], `stage=${String(stage)}`);
  if (!isBool(cleared) || !isBool(bossRetry) || !isBool(terminal) || !isBool(demo)) return verdict(RIFT_ADMISSION_REASON.INVALID_FLAGS, false, ['cleared/bossRetry/terminal/demo: boolean'], null);
  if (typeof status !== 'string' || !STATUS.includes(status)) return verdict(RIFT_ADMISSION_REASON.INVALID_STATUS, false, [`status ∈ ${STATUS.join('|')}`], `status=${String(status)}`);
  if (!(diff === undefined || diff === null || (Number.isInteger(diff) && diff >= DIFF_SIGNED_MIN && diff <= DIFF_SIGNED_MAX))) return verdict(RIFT_ADMISSION_REASON.INVALID_FLAGS, false, [`diff: null|정수 ${DIFF_SIGNED_MIN}..${DIFF_SIGNED_MAX}(game.html:8977)`], `diff=${String(diff)}`);
  if (!(stageDiffOff === undefined || stageDiffOff === null || Number.isInteger(stageDiffOff))) return verdict(RIFT_ADMISSION_REASON.INVALID_FLAGS, false, ['stageDiffOff: null|정수(G._stageDiffOff)'], null);
  if (!isPlainObjOrNull(captured)) return verdict(RIFT_ADMISSION_REASON.INVALID_FLAGS, false, ['capturedContext: null|plain object'], null);

  // 결정적·fail-closed 우선순위
  if (terminal) return demo
    ? verdict(RIFT_ADMISSION_REASON.BLOCKED_DEMO_END, false, ['demo 종료(nextBtn :61726→demo-end) — rift main 진입 0'], 'demo route')
    : verdict(RIFT_ADMISSION_REASON.BLOCKED_TERMINAL, false, ['doWin(:42483) 최종 — 진입 0'], null);
  if (status === 'dead' || status === 'fallen') return verdict(RIFT_ADMISSION_REASON.BLOCKED_DEAD, false, ['죽음/부활 선결(정책 수정 0)'], 'die(:42311)');
  if (bossRetry || status === 'retry') return verdict(RIFT_ADMISSION_REASON.BLOCKED_RETRY_IN_PROGRESS, false, ['retry transition 완료 대기(backup 재활용 0)'], 'retryBtn(:61539)');

  // P1b: rift admission/continue는 cleared===true 선결. boss-arena에서도 정상 clear 발생 → cleared 기준.
  if (cleared !== true) return verdict(RIFT_ADMISSION_REASON.STAGE_NOT_CLEARED, false,
    ['stageCleared===true 선결(:40590). cleared=false는 진입/continue 거절'], `status=${status}, boss-arena 단독 영구차단 아님(cleared 기준)`);

  // cleared===true → 진입/continue 허용. 보상은 이미 :40591 지급 → 재지급 0. demo/main route 분리.
  return verdict(RIFT_ADMISSION_REASON.ADMIT_CLEARED_CONTINUE, true,
    ['SP10 이미 지급(:40591) 재지급 0', 'route: ' + (demo ? 'demo-bypass(:61726→demo-end)' : 'main-rift(_showNextDiffPop→_stageDiffOff)'), captured ? 'capturedContext 보존 재개(backup 변조 0)' : 'initStage 컨텍스트'],
    'cleared 진입 허용·보상 승격 0. boss-arena clear 포함.',
    { route: demo ? 'demo-bypass' : 'main-rift', stageDiffOff: stageDiffOff ?? 0, signedDiff: (diff ?? null) });
}

export const evaluate = riftAdmission;
export default { STATUS, DIFF_SIGNED_MIN, DIFF_SIGNED_MAX, RIFT_ADMISSION_REASON, REQUIRED_FIELDS, SIDE_EFFECT_CONTRACT, riftAdmission, evaluate };
