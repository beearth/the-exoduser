/*
 * rift-main-evidence-contract-v2.candidate.mjs
 * TASK CH1-RIFT-MAIN-POLICIES-FIX-20261007-QA · ROLE QA · CANDIDATE (not acceptance).
 * COMPLETION-ID: CH1-RIFT-MAIN-POLICIES-FIX-20261007-QA-CANDIDATE
 * Fixes v1 (tools/team-followup-20261007/hell-rift/QA/rift-main-evidence-contract.candidate.mjs, read-only).
 *
 * v1 P1 defects fixed here:
 *  (1) v1 read `v.then` directly (isThenable) and read top sections (g.trace…) directly → triggers a
 *      `then`/section getter; v1's getOwnPropertyDescriptor had no try/catch → a Proxy descriptor-trap
 *      throw escaped. v2 reads EVERYTHING via a try/caught descriptor path, never executes a getter,
 *      detects thenable via descriptor / `instanceof Promise` (never reads `.then`), and a descriptor
 *      throw ⇒ caught FAIL.
 *  (2) v1 accepted `observed:true`-only for native6, `capturedPixels:true`-only for visual, and
 *      missing-kind for audio/durable — acceptance-promotion errors. v2 SEPARATES FORMAT_VALID from
 *      ACCEPTANCE: a well-formed shape is FORMAT_VALID only; ACCEPTANCE stays PENDING unless the real
 *      tokens are present (same full-candidate pin + trace + direct-observation + per-stage
 *      screen+input + real listen + durable readback + real-screen VISUAL VERDICT PASS).
 *  (3) v1's 6-stage set invented `return_commit` and split death/revive. v2 uses the official
 *      MILESTONE-CH1-1-PLAYABLE-20261002.md "QA 실제 경로 6단계" order:
 *      start → combat_loot → boss_open → boss_fight → death_revive → retry (사망부활 one stage; no return_commit).
 *
 * A FORMAT validator never auto-confirms an evidence fact. totals.formatValid is a count of
 * format-valid shapes, NOT a real-review count. raw/lab/fixture/observed-only/capturedPixels-only/
 * no-kind/no-SHA/other-candidate/incomplete-6 ⇒ main/native/audio/save/A-grade FALSE (PENDING/FAIL).
 * Source/file ≠ 本編/native6/시각·청취/실reward/save/A-grade (root-owned).
 *
 * Verify: single separate stdin run (see completion report). No renderer/GPU/本編 touched.
 */

const F = (cls, detail) => ({ pass: false, cls, detail });
const P = (cls, detail) => ({ pass: true, cls, detail });
const PEND = (cls, detail) => ({ pass: null, cls, detail });
const SHA64 = /^[0-9a-f]{64}$/;
const FIXTURE_KINDS = new Set(['fixture', 'raw', 'link', 'iframe', 'lab', 'sourceCandidate', 'candidate']);
const REAL_KINDS = new Set(['mainActual', 'native', 'browser-native']);
export const STAGES6 = Object.freeze(['start', 'combat_loot', 'boss_open', 'boss_fight', 'death_revive', 'retry']);

// ── safe own-data access: never executes a getter, never reads `.then`, catches Proxy traps ──
function safeDesc(o, k) { try { return { ok: true, d: Object.getOwnPropertyDescriptor(o, k) }; } catch (e) { return { ok: false, err: (e && e.name) || 'throw' }; } }
function thenableSafe(v) {
  if (v instanceof Promise) return true;
  if (v && (typeof v === 'object' || typeof v === 'function')) { try { const td = Object.getOwnPropertyDescriptor(v, 'then'); if (td && (typeof td.get === 'function' || typeof td.value === 'function')) return true; } catch { return true; } }
  return false;
}
// {state:'no-object'|'throw'|'absent'|'getter'|'thenable'|'own', value?}
function field(o, k) {
  if (!o || (typeof o !== 'object' && typeof o !== 'function')) return { state: 'no-object' };
  const s = safeDesc(o, k); if (!s.ok) return { state: 'throw', err: s.err };
  const d = s.d; if (!d) return { state: 'absent' };
  if (typeof d.get === 'function' || typeof d.set === 'function') return { state: 'getter' };
  if (thenableSafe(d.value)) return { state: 'thenable' };
  return { state: 'own', value: d.value };
}
// own-data field evaluated against a predicate → 'absent'|'bad'|'ok' (+value)
function own(o, k, pred) {
  const f = field(o, k);
  if (f.state === 'no-object' || f.state === 'absent') return { state: 'absent' };
  if (f.state === 'throw' || f.state === 'getter' || f.state === 'thenable') return { state: 'bad', why: f.state };
  return { state: pred(f.value) ? 'ok' : 'bad', value: f.value, why: pred(f.value) ? null : 'type' };
}
const bool = v => typeof v === 'boolean';
const str = v => typeof v === 'string' && v.length > 0;
const int0 = v => Number.isInteger(v) && v >= 0;
const fin0 = v => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const obj = v => v && typeof v === 'object';

// FORMAT: all listed own fields present+typed (absent⇒PENDING, getter/thenable/throw/type⇒FAIL).
function formatOf(cls, o, spec) {
  if (!o || typeof o !== 'object') return PEND(cls, 'no evidence object — PENDING');
  const absent = [], bad = [];
  for (const [k, pred] of spec) { const r = own(o, k, pred); if (r.state === 'absent') absent.push(k); else if (r.state === 'bad') bad.push(`${k}(${r.why})`); }
  if (bad.length) return F(cls, `misobserved own-data (getter/thenable/proxy-throw/type): ${bad.join(', ')}`);
  if (absent.length) return PEND(cls, `FORMAT incomplete, missing: ${absent.join(', ')} — PENDING`);
  return P(cls, 'FORMAT_VALID');
}
const V = (o, k) => own(o, k, () => true).value;           // safe read of an already-format-validated field
// a known REAL kind is required for native/audio/durable acceptance; fixture/absent ⇒ never accept.
function realKind(o) { const r = own(o, 'kind', str); if (r.state !== 'ok') return { state: 'absent' }; if (FIXTURE_KINDS.has(r.value)) return { state: 'fixture', value: r.value }; return { state: REAL_KINDS.has(r.value) ? 'real' : 'unknown', value: r.value }; }

// each gate → { format, acceptance }. acceptance PASS needs the real tokens; else PENDING (never from format alone).
function gate(cls, e, spec, acceptanceFn, expectedPin) {
  const format = formatOf(cls, e, spec);
  if (format.pass !== true) return { format, acceptance: PEND(cls, 'ACCEPTANCE blocked — FORMAT not valid') };
  // candidate-pin binding: acceptance requires the SAME full-candidate pin when one is expected
  if (expectedPin) { const pr = own(e, 'candidatePin', str); if (pr.state !== 'ok') return { format, acceptance: PEND(cls, 'ACCEPTANCE: candidatePin not observed — PENDING') }; if (!SHA64.test(pr.value)) return { format, acceptance: F(cls, 'candidatePin not 64-hex') }; if (pr.value !== expectedPin) return { format, acceptance: F(cls, `candidatePin ≠ expected (other candidate: ${pr.value.slice(0, 8)}≠${expectedPin.slice(0, 8)})`) }; }
  return { format, acceptance: acceptanceFn(e) };
}

// ── gates ──
export function checkTrace(e, expectedPin) {
  return gate('trace', e, [['fullSHA', str], ['traceID', str], ['directObservation', bool]],
    o => !SHA64.test(V(o, 'fullSHA')) ? F('trace', 'fullSHA not 64-hex') : V(o, 'directObservation') !== true ? PEND('trace', 'no direct-observation basis — PENDING') : P('trace', 'direct-observed trace + 64-hex pin'), expectedPin);
}
export function checkEntry(e) {
  return gate('entry', e, [['handleValid', bool], ['token', v => str(v) || Number.isFinite(v)], ['stage', int0], ['clearStatusFresh', bool], ['difficulty', str]],
    o => V(o, 'handleValid') !== true ? F('entry', 'invalid handle') : V(o, 'clearStatusFresh') !== true ? PEND('entry', 'clear/status not fresh — PENDING') : P('entry', 'valid fresh handle+token+stage'));
}
export function checkStageCommit(e) {
  return gate('stage-commit', e, [['transitionScheduled', bool], ['stageCommitted', bool]],
    o => V(o, 'stageCommitted') !== true ? PEND('stage-commit', 'SCHEDULED ≠ COMMITTED (nextStage/G.stage++ not observed) — PENDING')
      : (own(o, 'stageBefore', int0).state === 'ok' && own(o, 'stageAfter', int0).state === 'ok' && own(o, 'saveAckVerified', v => v === true).state === 'ok')
        ? (V(o, 'stageAfter') > V(o, 'stageBefore') ? P('stage-commit', `committed ${V(o, 'stageBefore')}→${V(o, 'stageAfter')} + save ACK`) : F('stage-commit', 'no stage delta'))
        : PEND('stage-commit', 'committed claimed but stageBefore/After/saveAck not fully observed — PENDING'));
}
export function checkSessionDialogue(e) {
  return gate('session-dialogue', e, [['scope', str], ['actualGrant', bool], ['committed', bool]],
    o => (V(o, 'actualGrant') === true || V(o, 'committed') === true) ? F('session-dialogue', 'session must be actualGrant:false/committed:false (durable → durable-gift)')
      : V(o, 'scope') === 'editor-session-only' ? P('session-dialogue', 'session-only observation (not durable)') : PEND('session-dialogue', `scope='${V(o, 'scope')}' — PENDING`));
}
// native6: FORMAT = stages object present; ACCEPTANCE = exact 6 ordered IDs each with screen(captured)+input+stage evidence; observed-only ⇒ PENDING.
export function checkNative6(e, expectedPin) {
  const format = formatOf('native6', e, [['stages', obj]]);
  if (format.pass !== true) return { format, acceptance: PEND('native6', 'ACCEPTANCE blocked — FORMAT not valid') };
  const rk = realKind(e);
  if (rk.state === 'fixture') return { format, acceptance: F('native6', `kind='${rk.value}' fixture/lab — native6 FALSE`) };
  const srcR = own(e, 'source', str); if (srcR.state === 'ok' && ['ack', 'link', 'shaderRegistered', 'shader', 'selfReport'].includes(srcR.value)) return { format, acceptance: F('native6', `native6 from '${srcR.value}' — ACK/LINK/shader not native`) };
  if (rk.state !== 'real') return { format, acceptance: PEND('native6', `kind not a known real kind (${rk.value ?? 'absent'}) — PENDING`) };
  const stages = V(e, 'stages'), miss = [];
  for (const id of STAGES6) {
    const sr = own(stages, id, obj); if (sr.state !== 'ok') { miss.push(id); continue; }
    const st = sr.value;
    if (own(st, 'screen', v => v === 'captured').state !== 'ok') miss.push(`${id}.screen!=captured`);   // observed-flag alone insufficient
    if (own(st, 'input', v => v === 'observed').state !== 'ok') miss.push(`${id}.input`);
    if (own(st, 'visualVerdict', v => v === 'PASS').state !== 'ok') miss.push(`${id}.visualVerdict!=PASS`);
  }
  // reject an incorrect ordered set (extra/renamed stages) explicitly
  const extra = Object.keys(stages).filter(k => !STAGES6.includes(k));
  if (extra.length) return { format, acceptance: F('native6', `unexpected stage id(s): ${extra.join(',')} (exact 6 only; no return_commit)`) };
  return { format, acceptance: miss.length ? PEND('native6', `6-stage real evidence incomplete: ${miss.slice(0, 6).join(', ')} — PENDING`) : P('native6', 'all 6 stages: captured screen + observed input + VISUAL PASS') };
}
export function checkAudio(e) {
  const format = formatOf('audio', e, [['played', bool], ['sampleCount', fin0]]);
  if (format.pass !== true) return { format, acceptance: PEND('audio', 'ACCEPTANCE blocked — FORMAT not valid') };
  const rk = realKind(e);
  if (rk.state === 'fixture') return { format, acceptance: F('audio', `kind='${rk.value}' fixture — audio FALSE`) };
  if (rk.state !== 'real') return { format, acceptance: PEND('audio', `no known real kind (${rk.value ?? 'absent'}) — PENDING (no-kind ≠ listened)`) };
  if (V(e, 'played') !== true || V(e, 'sampleCount') < 1) return { format, acceptance: PEND('audio', 'not observed played with samples — PENDING') };
  return { format, acceptance: own(e, 'listened', v => v === true).state === 'ok' ? P('audio', `real listen, ${V(e, 'sampleCount')} sample(s)`) : PEND('audio', 'played flag without actual listen attestation — PENDING') };
}
export function checkDurableGift(e) {
  const format = formatOf('durable-gift', e, [['itemId', str], ['inventoryAdmitted', bool], ['ledgerDedup', bool], ['savedTogether', bool], ['readbackVerified', bool], ['actualGrant', bool]]);
  if (format.pass !== true) return { format, acceptance: PEND('durable-gift', 'ACCEPTANCE blocked — FORMAT not valid') };
  const rk = realKind(e);
  if (rk.state === 'fixture') return { format, acceptance: F('durable-gift', `kind='${rk.value}' fixture — durable FALSE`) };
  if (rk.state !== 'real') return { format, acceptance: PEND('durable-gift', `no known real kind (${rk.value ?? 'absent'}) — PENDING (no-kind ≠ durable)`) };
  if (V(e, 'actualGrant') !== true) return { format, acceptance: PEND('durable-gift', 'session-only / pickupItem|dbSave alone — PENDING') };
  for (const k of ['inventoryAdmitted', 'ledgerDedup', 'savedTogether', 'readbackVerified']) if (V(e, k) !== true) return { format, acceptance: PEND('durable-gift', `actualGrant but ${k}≠true — PENDING`) };
  return { format, acceptance: P('durable-gift', `durable ${V(e, 'itemId')}: admit+dedup+saved-together+readback ACK`) };
}
export function checkSaveAck(e) {
  return gate('save-ack', e, [['atomicInventoryLedger', bool], ['readbackVerified', bool], ['dbSaveResolved', bool]],
    o => (V(o, 'atomicInventoryLedger') === true && V(o, 'readbackVerified') === true) ? P('save-ack', 'atomic inventory+ledger + readback') : PEND('save-ack', 'dbSave resolve alone ≠ atomic readback ACK — PENDING'));
}
export function checkVisual(e) {
  const co = own(e, 'contactEffectOn', bool); if (co.state === 'ok' && co.value === true) return { format: P('visual', 'FORMAT_VALID'), acceptance: F('visual', 'contact effect ON = known VISUAL FAIL (default OFF)') };
  const cap = own(e, 'capturedPixels', bool);
  if (cap.state === 'bad') return { format: F('visual', `capturedPixels ${cap.why}`), acceptance: PEND('visual', 'blocked') };
  if (cap.state === 'absent') return { format: PEND('visual', 'no captured-pixel observation — PENDING'), acceptance: PEND('visual', 'ACK/shader/LINK ≠ visual PASS — PENDING') };
  const rk = realKind(e);
  if (rk.state === 'fixture') return { format: P('visual', 'FORMAT_VALID'), acceptance: F('visual', `kind='${rk.value}' fixture — visual FALSE`) };
  // capturedPixels alone is NOT acceptance: require a real-screen VISUAL VERDICT PASS
  const vv = own(e, 'visualVerdict', str);
  const acc = (cap.value === true && vv.state === 'ok' && vv.value === 'PASS') ? P('visual', 'captured pixels + VISUAL VERDICT PASS') : PEND('visual', 'capturedPixels alone ≠ acceptance; need VISUAL VERDICT PASS — PENDING (RETOUCH default)');
  return { format: P('visual', 'FORMAT_VALID'), acceptance: acc };
}

export function validateMainEvidence(ev = {}, { expectedCandidatePin = null } = {}) {
  const g = ev;
  const gt = (k) => { const f = field(g, k); return (f.state === 'own') ? f.value : (f.state === 'absent' || f.state === 'no-object') ? undefined : { __misobserved: f.state }; };
  const sections = {
    trace: checkTrace(gt('trace'), expectedCandidatePin),
    entry: checkEntry(gt('entry')),
    'stage-commit': checkStageCommit(gt('stageCommit')),
    'session-dialogue': checkSessionDialogue(gt('sessionDialogue')),
    native6: checkNative6(gt('native6'), expectedCandidatePin),
    audio: checkAudio(gt('audio')),
    'durable-gift': checkDurableGift(gt('durableGift')),
    'save-ack': checkSaveAck(gt('saveAck')),
    visual: checkVisual(gt('visual')),
  };
  let formatValid = 0, acceptancePass = 0, pending = 0, fail = 0;
  for (const s of Object.values(sections)) {
    if (s.format?.pass === true) formatValid++;
    if (s.acceptance?.pass === true) acceptancePass++;
    else if (s.acceptance?.pass === false || s.format?.pass === false) fail++;
    else pending++;
  }
  return {
    completionId: 'CH1-RIFT-MAIN-POLICIES-FIX-20261007-QA-CANDIDATE', sections,
    totals: { formatValid, acceptancePass, pending, fail },
    note: 'totals.formatValid = count of FORMAT-valid shapes, NOT a real-review count; acceptancePass requires real tokens.',
    boundary: 'FORMAT_VALID ≠ ACCEPTANCE. fixture/lab/observed-only/capturedPixels-only/no-kind/no-SHA/other-candidate/incomplete-6 ⇒ main/native/audio/save/A-grade FALSE. root-owned real observation PENDING.',
  };
}
