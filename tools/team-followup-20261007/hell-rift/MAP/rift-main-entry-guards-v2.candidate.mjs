/* MAP rift main-entry gate v2 (guards) — CH1-RIFT-MAIN-ENTRY-GUARDS-V2-20261007-MAP-CANDIDATE
 *
 * Isolated candidate ESM. Does NOT modify game.html / save / public / editor / docs / Git. Writes NO
 * reward / INV / quest / save. dbSave/pickup=true is NOT a durable-grant ACK. Standalone (does not import raw55).
 * Hardens three real defects of v1 (rift-main-entry-gate.candidate.mjs, kept unmodified):
 *   1) Detached admission + async epoch: readState is admitted ONLY as a frozen own-primitive snapshot
 *      {stage(int>=0), stageCleared(bool), status(enum), difficultyOff(finite), contextId(opaque primitive)}.
 *      getter/thenable/null/proto/unknown → fail closed. Every await re-reads & re-checks ALL fields (incl.
 *      after enterRift). A stale (cancel→new-enter) checkpoint/enterRift resolve/reject/throw never writes the
 *      new phase. checkpoint succeeds on === true only; false/unknown/reject/throw/stale ⇒ fallthrough, no auto nextStage.
 *   2) Handle lifetime: a valid handle MUST have an OWN data `restore` function (optional OWN `dispose`);
 *      null/accessor/Promise/wrong handle is not a success. restore→dispose each run once, reentrant/double-cleanup
 *      /partial-failure safe (mirrors tools/2_5d/editor-preview-host.mjs:117 wrapper). No reactivation after success.
 *   3) Delayed commit: showStageTransition fires its callback 5000ms later (game.html:61633). continue() does not
 *      finalize at click time; it hands resumeStage a ONE-SHOT commit() guard. root wires
 *      resumeStage = commit => showStageTransition(() => { if (commit()) nextStage(); }). commit() re-admits &
 *      re-checks identity+epoch at the delayed moment; false on cancel/dispose/clear/status/difficulty/context
 *      change or a 2nd call. scheduled ≠ committed; only commit()===true counts as advance.
 *
 * State contract (fields VERIFIED in runtime): stage=G.stage, stageCleared=G.stageCleared,
 *   difficultyOff=G._stageDiffOff (offset; there is NO G.difficulty). revision = NOT_PRESENT (save has no
 *   version/revision field, docs/15 세이브+데이터구조 line 99). contextId = root-local opaque token (root wrapper
 *   captures P/char); NOT a claimed game field. root supplies readState/checkpoint/enterRift/resumeStage.
 *
 * Insertion (read-only): game.html:61718 _proceedNextStage — after `await dbSave()`, before `showStageTransition(()=>nextStage())`.
 * Lifetime: OWNED = epoch/phase/admitted/committed flags + wrapped handle (restore→dispose once). BORROWED = the 4 injected fns.
 */
const STATUS = new Set(['clear-continue', 'dead', 'final', 'demo', 'unknown']);
const PRIMITIVE = new Set(['string', 'number', 'bigint', 'symbol', 'boolean']);
const ownData = (o, k) => { const d = Object.getOwnPropertyDescriptor(o, k); return d && !d.get && !d.set ? { has: true, value: d.value } : { has: false }; };
const ownFn = (o, k) => { const d = Object.getOwnPropertyDescriptor(o, k); return !!d && typeof d.value === 'function' && !d.get && !d.set; };

/* Admit → frozen own-primitive snapshot detached from the live object; null on any violation. */
function admit(raw) {
  if (!raw || typeof raw !== 'object' || typeof raw.then === 'function') return null;
  const f = {};
  for (const k of ['stage', 'stageCleared', 'status', 'difficultyOff', 'contextId']) { const d = ownData(raw, k); if (!d.has) return null; f[k] = d.value; }
  if (!Number.isInteger(f.stage) || f.stage < 0) return null;
  if (typeof f.stageCleared !== 'boolean') return null;
  if (!STATUS.has(f.status)) return null;
  if (typeof f.difficultyOff !== 'number' || !Number.isFinite(f.difficultyOff)) return null;
  if (f.contextId === null || f.contextId === undefined || !PRIMITIVE.has(typeof f.contextId)) return null;
  return Object.freeze({ stage: f.stage, stageCleared: f.stageCleared, status: f.status, difficultyOff: f.difficultyOff, contextId: f.contextId });
}
const sameIdentity = (a, b) => !!a && !!b && a.stage === b.stage && a.stageCleared === b.stageCleared && a.status === b.status && a.difficultyOff === b.difficultyOff && a.contextId === b.contextId;
const clearContinue = (a) => !!a && a.stageCleared === true && a.status === 'clear-continue';

function wrapHandle(raw) {
  if (!raw || typeof raw !== 'object' || typeof raw.then === 'function') return null;
  if (!ownFn(raw, 'restore')) return null;                 // restore REQUIRED (own data function)
  const hasDispose = ownFn(raw, 'dispose');
  let restored = false, released = false;
  return Object.freeze({
    restore() { if (restored || released) return false; restored = true; try { return raw.restore(); } catch { return false; } },
    dispose() { if (released) return false; released = true; try { return hasDispose ? raw.dispose() : false; } catch { return false; } }
  });
}
const teardown = (h) => { if (!h) return; try { h.restore(); } catch { /* once */ } try { h.dispose(); } catch { /* once */ } };

export function createRiftMainEntryGate({ readState, checkpoint, enterRift, resumeStage } = {}) {
  for (const [k, v] of [['readState', readState], ['checkpoint', checkpoint], ['enterRift', enterRift], ['resumeStage', resumeStage]])
    if (typeof v !== 'function') throw new Error(k + ' 함수가 필요합니다 (borrowed)');
  let epoch = 0, phase = 'idle', admitted = null, handle = null, committed = false, disposed = false;
  const readAdmit = () => { try { return admit(readState()); } catch { return null; } };

  async function enter() {
    if (disposed) return { entered: false, reason: 'disposed', fallthrough: true };
    if (phase !== 'idle') return { entered: false, reason: '중복/in-flight enter 차단', fallthrough: false };
    const a0 = readAdmit();
    if (!a0) return { entered: false, reason: 'readState admit 실패(getter/thenable/null/필드/unknown)', fallthrough: true };
    if (!clearContinue(a0)) return { entered: false, reason: 'clear 아님/dead/final/demo/unknown — victory/demo 경로 불변', status: a0.status, fallthrough: true };
    const myEpoch = ++epoch; phase = 'entering';
    const current = () => !disposed && epoch === myEpoch;
    // Only a native Promise is awaited; a non-Promise thenable is NOT adopted (avoids a never-settling hang).
    let cp;
    try { const cpRet = checkpoint(); cp = cpRet instanceof Promise ? await cpRet : cpRet; } catch (e) { if (current()) phase = 'idle'; return { entered: false, reason: 'checkpoint throw/reject: ' + e.message, fallthrough: true }; }
    if (!current()) return { entered: false, reason: 'invalidated(checkpoint) — stale, phase 미변경' };
    if (cp !== true) { phase = 'idle'; return { entered: false, reason: 'checkpoint 비승인(=== true 아님/unknown/thenable)', fallthrough: false }; }
    const a1 = readAdmit();
    if (!a1 || !sameIdentity(a0, a1) || !clearContinue(a1)) { phase = 'idle'; return { entered: false, reason: 'checkpoint 후 stage/clear/status/difficulty/context 변경 — 중단', fallthrough: true }; }
    let raw;
    try { const erRet = enterRift(onRiftExit); raw = erRet instanceof Promise ? await erRet : erRet; } catch (e) { if (current()) phase = 'idle'; return { entered: false, reason: 'enterRift throw/reject: ' + e.message, fallthrough: true }; }
    const wrapped = wrapHandle(raw);
    if (!current()) { teardown(wrapped); return { entered: false, reason: 'invalidated(late) — handle 폐기 1회, 자동 resume 없음' }; }
    if (!wrapped) { phase = 'idle'; return { entered: false, reason: '유효하지 않은 handle(restore own fn 없음/accessor/Promise)', fallthrough: true }; }
    const a2 = readAdmit();                                 // final re-check AFTER enterRift await
    if (!a2 || !sameIdentity(a1, a2) || !clearContinue(a2)) { teardown(wrapped); phase = 'idle'; return { entered: false, reason: 'enterRift 후 identity 변경 — handle 폐기', fallthrough: true }; }
    handle = wrapped; admitted = a2; phase = 'rift';
    return { entered: true, stage: a2.stage, contextId: a2.contextId };
  }

  function onRiftExit() { return { autoResume: false }; }   // no auto-resume; explicit user continue required

  function continueStage() {
    if (disposed) return { scheduled: false, reason: 'disposed' };
    if (phase !== 'rift') return { scheduled: false, reason: 'rift 진입 상태 아님(중복/완료 차단)' };
    const a = readAdmit();
    if (!a || !sameIdentity(admitted, a) || a.status === 'dead') return { scheduled: false, reason: 'continue 시 identity/lifetime 변경 — fail-closed', fallClosed: true };
    const schedEpoch = epoch, schedId = admitted;
    const commit = () => {
      if (disposed || epoch !== schedEpoch || committed || phase !== 'scheduled') return false;   // epoch/cancel/dispose/2nd-call/not-scheduled
      const now = readAdmit();                             // delayed (5s) fresh re-admission + identity
      if (!now || !sameIdentity(schedId, now) || now.status === 'dead') return false;
      committed = true; phase = 'committed'; const h = handle; handle = null; teardown(h);           // release rift once at actual advance
      return true;
    };
    phase = 'scheduled';
    let ret;
    try { ret = resumeStage(commit); }
    catch (e) { if (!committed) { phase = 'done'; const h = handle; handle = null; teardown(h); } return { scheduled: false, reason: 'resumeStage throw: ' + e.message, fallClosed: true }; }
    if (ret && typeof ret.then === 'function') ret.then(null, () => { if (!committed && phase === 'scheduled') { phase = 'done'; const h = handle; handle = null; teardown(h); } });
    return { scheduled: true, commit };
  }

  function cancel() { if (disposed || phase === 'committed' || phase === 'done') return; epoch++; const h = handle; handle = null; teardown(h); admitted = null; phase = 'idle'; }
  function dispose() { if (disposed) return; disposed = true; epoch++; const h = handle; handle = null; teardown(h); admitted = null; phase = 'done'; }
  function snapshot() { return { phase, disposed, committed, scheduled: phase === 'scheduled', stage: admitted?.stage ?? null, contextId: admitted?.contextId ?? null, epoch }; }

  return Object.freeze({ enter, continue: continueStage, cancel, dispose, snapshot, onRiftExit });
}

export const RIFT_MAIN_ENTRY_GUARDS_V2 = Object.freeze({
  completionId: 'CH1-RIFT-MAIN-ENTRY-GUARDS-V2-20261007-MAP-CANDIDATE',
  supersedes: 'rift-main-entry-gate.candidate.mjs (v1, unmodified)',
  boundary: 'game.html:61718 _proceedNextStage (after await dbSave, before showStageTransition); 5s delayed callback game.html:61633',
  stateContract: { stage: 'G.stage', stageCleared: 'G.stageCleared', difficultyOff: 'G._stageDiffOff', revision: 'NOT_PRESENT', contextId: 'root-local opaque primitive token (not a game field)' },
  rootWiring: 'resumeStage = commit => showStageTransition(() => { if (commit()) nextStage(); })',
  invariants: 'detached frozen admission; all-fields re-check after every await; stale resolve never writes new phase; checkpoint===true only; own-fn handle restore→dispose once; one-shot delayed commit; scheduled≠committed; no reward/INV/quest/save writes; no reactivation after success',
  mutates: 'none — read-only candidate; real game.html wiring + native/UI/audio + durable grant/save are root-owned gates (PENDING)'
});
