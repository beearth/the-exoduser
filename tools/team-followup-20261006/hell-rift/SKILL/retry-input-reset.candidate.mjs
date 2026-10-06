// retry-input-reset.candidate.mjs
// SKILL 역할 (UUID ec0868f8-7ba5-42f8-b7ca-20e63d4ebda4) 생산후보 — production 미적용.
// 배정: CLAUDE8-PROD-SKILL-20261006-0220 / 선행: ROOT-RIFT-DIALOGUE-PREVIEW-INTEGRATION-20261006
//
// 목적: 0123/0124 에서 확인한 retry/await-held lifecycle 불일치 1건의
//   "최소 적용 가능한 source-pinned patch"를 순수 함수로 산출한다.
//   결함: 사망→재도전 공통 경계(retryBtn.onclick)에 _clearHeldInput() 호출이 없어
//        사망 시점 held(K/KH/MB/_dashHold/_beamHold/aiming)가 respawn 첫 프레임 전투로 샌다.
//   수정: 루프 재활성(G.on=true) 직전에 _clearHeldInput() 1회를 삽입한다 (await 무관 경계).
//
// 이 파일은 game.html 을 쓰지 않는다. source 문자열을 받아 변경 문자열/패치데이터를 "반환"만 한다.
//   - 입력정책/보호2_3/Q전용 magic/E-불가/어택티켓/확정수치 변경 0.
//   - _clearHeldInput 기존 의미(12901-12909) 그대로, 호출 위치만 추가.
//   - production 적용·docs 동기화·backup/Git·native 검수는 원총괄(root) 소유.
//
// source 핀 (이 후보가 작성·검증된 기준 checkout):
//   game.html SHA256 = 4f4eba2596c33f4e0c28e1e68ac224560e17c944cdbe9596ad9956c7578e3ccd
//   game.html bytes  = 4039085 (file) / utf8-string SHA 동일
//   anchor 'updateQS();G.on=true;' 는 해당 checkout 에서 유일(1건). (grep -c 확인)
//
// strict rebase (CLAUDE8-RESIDENT-SKILL-20261006-0324 ①):
//   git HEAD 6e9a7a7dedfcc66d9005330249ded0f0a0812526 에서 game.html 내용 SHA 가
//   위 PINNED 와 '동일'함을 확인 → 핀 변경 불필요(no-op rebase). patch0, Q-only/2_3/수치 보존.
//   내용이 달라졌으면 PINNED_GAME_HTML_SHA256 를 현행값으로 교체해야 strict 적용된다.

'use strict';

/* ── 핀 상수 (frozen) ─────────────────────────────────────────────────── */
export const PINNED_GAME_HTML_SHA256 =
  '4f4eba2596c33f4e0c28e1e68ac224560e17c944cdbe9596ad9956c7578e3ccd';
export const PINNED_GAME_HTML_BYTES = 4039085;
// 핀이 검증된 checkout. 내용 SHA 는 HEAD 와 독립이나, 추적을 위해 함께 고정한다.
export const PINNED_AT_GIT_HEAD = '6e9a7a7dedfcc66d9005330249ded0f0a0812526';

// retry 공통 경계 — 루프 재활성 직전. OLD 는 핀 checkout 에서 유일.
export const RETRY_OLD = 'updateQS();G.on=true;';
export const RETRY_NEW =
  'updateQS();_clearHeldInput();G.on=true;'; // 재도전 입력 경계: 동기 복원 후 G.on 직전 held/latch 정리

// 핸들러 시작 서명 — await/G.on 구간 스캔용.
export const HANDLER_SIGNATURE = "$('retryBtn').onclick=async()=>{";

/* ── SHA256 (node 가용 시 계산, 아니면 caller 제공) ───────────────────── */
async function _sha256(str) {
  try {
    const { createHash } = await import('node:crypto');
    return createHash('sha256').update(str, 'utf8').digest('hex');
  } catch {
    return null; // 브라우저/비-node: caller 가 opts.sourceSha 로 제공
  }
}

/* ── 독립 최소 분기: 핸들러 시작~anchor 사이에 await 가 있는가 ──────────
 * 현재 핀 checkout 의 유일 await(dbSave)는 G.on=true 이후이므로 false 가 정상.
 * 만약 누군가 G.on 이전에 await 를 넣으면, 단일 경계로는 재latch 를 막지 못하므로
 * post-await 보조 경계가 추가로 필요함을 신호한다 (stdin 재현으로 검증된 규칙).
 */
export function detectAwaitBeforeGon(source) {
  const h = source.indexOf(HANDLER_SIGNATURE);
  if (h < 0) return { handlerFound: false, awaitBeforeGon: false };
  const a = source.indexOf(RETRY_OLD, h);
  const aNew = source.indexOf(RETRY_NEW, h);
  const gonIdx = a >= 0 ? a : aNew; // 적용 전/후 모두 대응
  if (gonIdx < 0) return { handlerFound: true, awaitBeforeGon: false, gonFound: false };
  const slice = source.slice(h + HANDLER_SIGNATURE.length, gonIdx);
  return {
    handlerFound: true,
    gonFound: true,
    awaitBeforeGon: /\bawait\b/.test(slice),
  };
}

/**
 * retry 입력 경계 패치 데이터를 생성한다 (순수 — 파일 쓰기 없음).
 *
 * @param {string} source  game.html 전체 소스 문자열
 * @param {object} [opts]
 *   opts.sourceSha     : caller 가 계산한 source SHA256 (node 밖에서 필수)
 *   opts.allowShaDrift : true 면 SHA 핀 불일치여도 anchor 기반 적용 허용 (기본 false)
 * @returns {Promise<object>} 적용 가능 시 patched 문자열 포함, 아니면 ok:false + reason
 */
export async function generateRetryInputResetPatch(source, opts = {}) {
  if (typeof source !== 'string' || source.length === 0) {
    return { ok: false, reason: 'invalid-source' };
  }

  const sourceSha = opts.sourceSha || (await _sha256(source));
  const shaMatch = sourceSha === PINNED_GAME_HTML_SHA256;
  const base = {
    completedId: 'ROOT-RIFT-DIALOGUE-PREVIEW-INTEGRATION-20261006',
    taskId: 'CLAUDE8-PROD-SKILL-20261006-0220',
    sourceSha,
    pinnedSha: PINNED_GAME_HTML_SHA256,
    pinnedAtGitHead: PINNED_AT_GIT_HEAD,
    shaMatch,
    bytes: source.length,
    anchor: { old: RETRY_OLD, new: RETRY_NEW },
  };

  // (A) 중복 적용 거절 — NEW 가 이미 있으면 패치 불필요.
  if (source.includes(RETRY_NEW)) {
    return { ...base, ok: false, reason: 'already-applied' };
  }

  // (B) anchor 존재/유일성 — drift/모호 거절.
  let idx = source.indexOf(RETRY_OLD);
  if (idx < 0) {
    return { ...base, ok: false, reason: 'anchor-not-found' };
  }
  if (source.indexOf(RETRY_OLD, idx + 1) >= 0) {
    return { ...base, ok: false, reason: 'ambiguous-anchor' };
  }

  // (C) SHA 핀 — 불일치면 기본 거절(다른 checkout/타세션 변경 반영 방지).
  if (!shaMatch && !opts.allowShaDrift) {
    return { ...base, ok: false, reason: 'sha-pin-mismatch', hint: 'opts.allowShaDrift=true 로 anchor 기반 강제 적용 가능' };
  }

  // (D) await-전-G.on 독립 분기.
  const awaitInfo = detectAwaitBeforeGon(source);

  // 패치 문자열 생성 (반환만, 쓰기 0). 단일 치환 = 유일 anchor.
  const patched = source.slice(0, idx) + RETRY_NEW + source.slice(idx + RETRY_OLD.length);

  return {
    ...base,
    ok: true,
    offset: idx,
    patched,
    patchedBytes: patched.length,
    diff: { old: RETRY_OLD, new: RETRY_NEW, offset: idx },
    awaitInfo,
    // 현재 핀: awaitBeforeGon=false → 이 단일 경계로 충분.
    // awaitBeforeGon=true 면 production 적용 담당이 post-await 보조 경계를 추가해야 함.
    needsSecondaryBoundary: awaitInfo.awaitBeforeGon === true,
    note: awaitInfo.awaitBeforeGon
      ? '핸들러 시작~G.on 사이 await 존재: 단일 경계 불충분, post-await 보조 _clearHeldInput 필요'
      : '동기 경로(await 없음): G.on 직전 단일 _clearHeldInput 로 충분',
  };
}

export default { generateRetryInputResetPatch, detectAwaitBeforeGon, PINNED_GAME_HTML_SHA256, PINNED_AT_GIT_HEAD, RETRY_OLD, RETRY_NEW };

/* ── 인라인 자가검증 (직접 실행 시에만, stdin/메모리 — 파일 쓰기 0) ───── */
async function _selfTest() {
  let pass = 0, fail = 0;
  const ok = (n, c) => { c ? pass++ : (fail++, console.error('FAIL:', n)); };

  // 합성 소스 — 실제 핸들러 구조를 축약 (4MB 원본 미포함)
  const SYNC = `x;${HANDLER_SIGNATURE} var b=restore(); initStage(0); ${RETRY_OLD} await dbSave(); };`;
  const r1 = await generateRetryInputResetPatch(SYNC, { allowShaDrift: true });
  ok('sync: ok', r1.ok === true);
  ok('sync: inserts clear before G.on', r1.patched.includes('_clearHeldInput();G.on=true;'));
  ok('sync: no await before G.on', r1.awaitInfo.awaitBeforeGon === false);
  ok('sync: no secondary boundary', r1.needsSecondaryBoundary === false);
  ok('sync: single offset', typeof r1.offset === 'number' && r1.offset > 0);

  // 중복 적용 거절
  const DONE = SYNC.replace(RETRY_OLD, RETRY_NEW);
  const r2 = await generateRetryInputResetPatch(DONE, { allowShaDrift: true });
  ok('dup: rejected', r2.ok === false && r2.reason === 'already-applied');

  // anchor 없음 (drift)
  const r3 = await generateRetryInputResetPatch('nothing here;', { allowShaDrift: true });
  ok('missing: rejected', r3.ok === false && r3.reason === 'anchor-not-found');

  // 모호 anchor (2건)
  const AMBIG = `${RETRY_OLD} ... ${RETRY_OLD}`;
  const r4 = await generateRetryInputResetPatch(AMBIG, { allowShaDrift: true });
  ok('ambiguous: rejected', r4.ok === false && r4.reason === 'ambiguous-anchor');

  // SHA 핀 불일치 기본 거절
  const r5 = await generateRetryInputResetPatch(SYNC, { sourceSha: 'deadbeef' });
  ok('sha-mismatch: rejected by default', r5.ok === false && r5.reason === 'sha-pin-mismatch');

  // 독립 분기: G.on 이전 await → 보조 경계 필요 신호
  const ASYNC_BAD = `${HANDLER_SIGNATURE} await loadThing(); ${RETRY_OLD} };`;
  const r6 = await generateRetryInputResetPatch(ASYNC_BAD, { allowShaDrift: true });
  ok('await-before-gon: flagged', r6.ok === true && r6.needsSecondaryBoundary === true);

  console.log(`retry-input-reset.candidate self-test: ${pass} pass, ${fail} fail`);
  console.log('pinned source SHA256:', PINNED_GAME_HTML_SHA256, '/ bytes', PINNED_GAME_HTML_BYTES);
  return fail === 0;
}

if (typeof process !== 'undefined' && process.argv && process.argv[1] &&
    process.argv[1].endsWith('retry-input-reset.candidate.mjs')) {
  _selfTest().then(okAll => { if (typeof process.exit === 'function') process.exit(okAll ? 0 : 1); });
}
