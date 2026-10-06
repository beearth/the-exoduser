/* MAP rift main-entry continuation gate — CH1-RIFT-MAIN-ENTRY-GATE-20261007-MAP-CANDIDATE
 *
 * Isolated candidate ESM. Does NOT modify game.html / save / public / editor / docs / Git. Writes NO
 * reward / INV / quest / save. A dbSave/pickup=true is NOT a durable-grant ACK; this gate only gates the
 * stage-transition continuation. All P/G access is through borrowed injected functions (root supplies them).
 *
 * Insertion boundary (read-only, source:line):
 *   game.html:61718  async function _proceedNextStage(){
 *   game.html:61719    if(_dbReady)await dbSave();           // ← gate slots AFTER this
 *   game.html:61720    showStageTransition(()=>nextStage()); // ← and BEFORE this (resumeStage == this continuation)
 *   nextStage() game.html:42482 handles demo-end / chapter boundary / doWin(final). stage advance lives there, not here.
 *
 * Plain state / stage-identity contract — fields VERIFIED to exist in the real runtime (grep evidence):
 *   stage         = G.stage          (int; persisted as save game.stage)        — EXISTS (game.html:42482 et al.)
 *   stageCleared  = G.stageCleared   (bool, in-memory)                          — EXISTS (8 refs)
 *   difficultyOff = G._stageDiffOff  (stage difficulty OFFSET; set game.html:61711) — EXISTS (there is NO G.difficulty, 0 refs)
 *   revision      = NOT_PRESENT      — the save has NO version/revision field (docs/15 세이브+데이터구조 line 99
 *                   "신규 버전 필드 없이 멱등 복구"; 0 G.revision refs). NOT fabricated here.
 * root must supply readState()->{stage, stageCleared, status, difficultyOff} where status ∈
 *   'clear-continue' | 'dead' | 'final' | 'demo' | 'unknown'. Only stageCleared===true && status==='clear-continue'
 *   enters the rift; everything else fails closed and leaves the existing victory/demo path unchanged.
 *
 * Lifetime: OWNED = epoch, phase, resumed flag, and the exit handle returned by enterRift (this gate releases it
 *   exactly once). BORROWED = readState / checkpoint / enterRift / resumeStage (never released here).
 */
export function createRiftMainEntryGate({ readState, checkpoint, enterRift, resumeStage } = {}) {
  for (const [k, v] of [['readState', readState], ['checkpoint', checkpoint], ['enterRift', enterRift], ['resumeStage', resumeStage]])
    if (typeof v !== 'function') throw new Error(k + ' 함수가 필요합니다 (borrowed)');

  let epoch = 0, phase = 'idle', exitHandle = null, enteredStage = null, resumed = false, disposed = false;
  const releasedHandles = new WeakSet();
  const releaseHandle = (h) => { if (!h || (typeof h === 'object' && releasedHandles.has(h))) return; if (typeof h === 'object') releasedHandles.add(h); try { h.dispose?.(); } catch { /* idempotent */ } try { h.restore?.(); } catch { /* idempotent */ } };
  const clearContinue = (s) => !!s && s.stageCleared === true && s.status === 'clear-continue' && Number.isInteger(s.stage);
  const readStateSafe = () => { try { return { ok: true, state: readState() }; } catch (e) { return { ok: false, error: e.message }; } };

  async function enter() {
    if (disposed) return { entered: false, reason: 'disposed', fallthrough: true };
    if (phase !== 'idle') return { entered: false, reason: '중복/in-flight enter 차단', fallthrough: false };
    const r0 = readStateSafe();
    if (!r0.ok) return { entered: false, reason: 'readState throw: ' + r0.error, fallthrough: true };
    if (!clearContinue(r0.state)) return { entered: false, reason: 'clear 아님/dead/final/demo/unknown — 기존 victory/demo 경로 불변', status: r0.state?.status, fallthrough: true };
    const myEpoch = ++epoch; phase = 'entering';
    let okCp;
    try { okCp = await checkpoint(); } catch (e) { phase = 'idle'; return { entered: false, reason: 'checkpoint throw: ' + e.message, fallthrough: true }; }
    if (disposed || epoch !== myEpoch) { phase = disposed ? 'done' : 'idle'; return { entered: false, reason: 'invalidated(checkpoint) — 자동 resume 없음' }; }
    if (okCp === false) { phase = 'idle'; return { entered: false, reason: 'checkpoint 실패', fallthrough: true }; }
    const r1 = readStateSafe();                          // latest re-check: stage change / no-longer-clear → fail closed
    if (!r1.ok) { phase = 'idle'; return { entered: false, reason: 'readState(latest) throw: ' + r1.error, fallthrough: true }; }
    if (!clearContinue(r1.state) || r1.state.stage !== r0.state.stage) { phase = 'idle'; return { entered: false, reason: 'checkpoint 후 stage/clear 변경 — 진입 중단', fallthrough: true }; }
    let handle;
    try { handle = await enterRift(onRiftExit); } catch (e) { phase = 'idle'; return { entered: false, reason: 'enterRift throw: ' + e.message, fallthrough: true }; }
    if (disposed || epoch !== myEpoch) { releaseHandle(handle); phase = disposed ? 'done' : 'idle'; return { entered: false, reason: 'invalidated(late) — handle 폐기 1회, 자동 resume 없음' }; }
    exitHandle = handle; enteredStage = r1.state.stage; phase = 'rift';
    return { entered: true, stage: enteredStage, difficultyOff: r1.state.difficultyOff };
  }

  /* Rift exit signal from the borrowed port. Deliberately does NOT auto-resume — only explicit user continue resumes. */
  function onRiftExit() { return { autoResume: false, note: 'user continue 필요' }; }

  /* User-triggered continue: re-check latest stage/clear/lifetime, resumeStage exactly once (no double nextStage). */
  function continueStage() {
    if (disposed) return { resumed: false, reason: 'disposed' };
    if (phase !== 'rift') return { resumed: false, reason: 'rift 진입 상태 아님' };
    if (resumed) return { resumed: false, reason: '중복 continue 차단 (resumeStage/nextStage 1회)' };
    const r = readStateSafe();
    if (!r.ok) return { resumed: false, reason: 'readState throw: ' + r.error };
    if (r.state.stage !== enteredStage || r.state.status === 'dead') return { resumed: false, reason: 'continue 시 stage/lifetime 변경 — resume 중단', fallClosed: true };
    resumed = true; phase = 'resuming';
    try { resumeStage(); } catch (e) { return { resumed: false, reason: 'resumeStage throw: ' + e.message }; }
    releaseHandle(exitHandle); exitHandle = null; phase = 'done';
    return { resumed: true, stage: r.state.stage };
  }

  function cancel() { if (disposed || phase === 'done') return; epoch++; releaseHandle(exitHandle); exitHandle = null; phase = 'idle'; }   // invalidate in-flight; late handle released once; no resume
  function dispose() { if (disposed) return; disposed = true; epoch++; releaseHandle(exitHandle); exitHandle = null; phase = 'done'; }
  function snapshot() { return { phase, disposed, resumed, enteredStage, epoch }; }

  return Object.freeze({ enter, continue: continueStage, cancel, dispose, snapshot, onRiftExit });
}

export const RIFT_MAIN_ENTRY_GATE = Object.freeze({
  completionId: 'CH1-RIFT-MAIN-ENTRY-GATE-20261007-MAP-CANDIDATE',
  boundary: 'game.html:61718 _proceedNextStage — after await dbSave, before showStageTransition(()=>nextStage())',
  stateContract: { stage: 'G.stage', stageCleared: 'G.stageCleared', difficultyOff: 'G._stageDiffOff', revision: 'NOT_PRESENT (save has no version/revision field)' },
  invariants: 'fail-closed unless clear-continue; no duplicate/in-flight enter; async checkpoint→latest re-check→enterRift once; no auto-resume; user continue re-checks then resumeStage once; late handle released once; no reward/INV/quest/save writes; dbSave/pickup≠grant ACK',
  owned: 'epoch/phase/resumed/exit handle (released once)', borrowed: 'readState/checkpoint/enterRift/resumeStage',
  mutates: 'none — read-only candidate; real game.html wiring + native/UI/audio + durable reward/save are root-owned gates (PENDING)'
});
