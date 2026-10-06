/*
 * rift-main-evidence-contract.candidate.mjs
 * TASK CH1-RIFT-MAIN-PARALLEL-20261007-QA · ROLE QA · CANDIDATE (not acceptance).
 * COMPLETION-ID: CH1-RIFT-MAIN-PARALLEL-20261007-QA-CANDIDATE
 *
 * Pure contract validator for root's main-rift integration EVIDENCE. The main integration is an
 * UNIMPLEMENTED PLAN (RIFT_DIALOGUE_PUBLIC_CONSUMER_20261007.md §ROOT-RIFT-MAIN-SAVE-INTEGRATION-PLAN
 * / §RAW55). This validator never promotes a plan/fixture to acceptance:
 *   - raw/fixture/link/iframe/lab-only evidence ⇒ NEVER native / real-reward / A-grade PASS;
 *   - ACK / shaderRegistered / LINK=true alone ⇒ NOT a visual PASS; contact VISUAL FAIL / default OFF
 *     is respected (02f39ad0 contact ON nav-stain = VISUAL FAIL, default OFF);
 *   - a SCHEDULED transition ≠ a COMMITTED stage advance: showStageTransition(callback) (game.html:61610)
 *     only schedules; nextStage() (game.html:42482, G.stage++) is the commit; _dbReady at game.html:3440;
 *   - session dialogue is actualGrant:false / committed:false (dialogue doc line 14) — never durable.
 *
 * Strict plain-OWN-data: every boolean / sampleCount / traceID / fullSHA / sourceCandidate / mainActual
 * must be an OWN data property (Object.getOwnPropertyDescriptor .value), not a getter/inherited/thenable.
 * Getters are NEVER executed (detected via descriptor). absent ⇒ PENDING; getter/inherited/thenable/
 * wrong-type ⇒ FAIL (misobservation). The 6 native stages need INDEPENDENT evidence each (no aggregate).
 *
 * This validator touches no renderer/GPU/本編; a source/fixture trace ≠ 本編/native6/visual/listen/
 * real-reward-save/A-grade (root-owned). Verify: single separate stdin run (see completion report).
 */

const isThenable = v => v && (typeof v === 'object' || typeof v === 'function') && typeof v.then === 'function';
const F = (cls, detail) => ({ pass: false, cls, detail });
const P = (cls, detail) => ({ pass: true, cls, detail });
const PEND = (cls, detail) => ({ pass: null, cls, detail });
const SHA64 = /^[0-9a-f]{64}$/;
const FIXTURE_KINDS = new Set(['fixture', 'raw', 'link', 'iframe', 'lab', 'sourceCandidate', 'candidate']);

// own-data field state WITHOUT executing any getter
function fieldKind(o, k) {
  if (!o || typeof o !== 'object') return 'no-object';
  const d = Object.getOwnPropertyDescriptor(o, k);
  if (!d) return 'absent';                         // missing or inherited (own-only)
  if (typeof d.get === 'function' || typeof d.set === 'function') return 'getter';
  if (isThenable(d.value)) return 'thenable';
  return 'own';
}
const ownVal = (o, k) => Object.getOwnPropertyDescriptor(o, k).value;
// evaluate one own-data field: returns {state, value?}
function own(o, k, pred) {
  const kind = fieldKind(o, k);
  if (kind === 'no-object' || kind === 'absent') return { state: 'absent' };
  if (kind === 'getter' || kind === 'thenable') return { state: 'bad', why: kind };
  const v = ownVal(o, k);
  return { state: pred(v) ? 'ok' : 'bad', value: v, why: pred(v) ? null : 'type' };
}
const bool = v => typeof v === 'boolean';
const trueB = v => v === true;
const str = v => typeof v === 'string' && v.length > 0;
const int0 = v => Number.isInteger(v) && v >= 0;
const fin0 = v => typeof v === 'number' && Number.isFinite(v) && v >= 0;

// require a set of OWN fields; absent⇒PENDING, bad(getter/thenable/type)⇒FAIL, all ok⇒true
function requireOwn(cls, o, spec) {
  if (!o || typeof o !== 'object') return PEND(cls, 'no evidence object — PENDING');
  const absent = [], bad = [];
  for (const [k, pred, label] of spec) { const r = own(o, k, pred); if (r.state === 'absent') absent.push(k); else if (r.state === 'bad') bad.push(`${k}(${r.why || label || 'type'})`); }
  if (bad.length) return F(cls, `misobserved own-data: ${bad.join(', ')}`);
  if (absent.length) return PEND(cls, `missing typed observation: ${absent.join(', ')} — PENDING`);
  return null; // all ok
}
// a native/reward/A-grade gate can never be met by a fixture/lab/link/iframe kind
function fixtureBlock(cls, o, gate) {
  const r = own(o, 'kind', str);
  if (r.state === 'ok' && FIXTURE_KINDS.has(r.value)) return F(cls, `${gate}: kind='${r.value}' is fixture/lab/link/iframe — cannot establish ${gate} (never promoted)`);
  return null;
}

// trace pins: fullSHA 64-hex + traceID own string (not getter)
export function checkTracePins(e) {
  const req = requireOwn('trace-pins', e, [['fullSHA', v => str(v), 'sha'], ['traceID', str, 'id']]); if (req) return req;
  return SHA64.test(ownVal(e, 'fullSHA')) ? P('trace-pins', `fullSHA 64-hex + traceID own`) : F('trace-pins', `fullSHA not 64-hex: ${String(ownVal(e, 'fullSHA')).slice(0, 16)}`);
}

// (A) entry: valid handle + token ownership + latest stage/clear/difficulty (not stale, not scheduled)
export function checkEntry(e) {
  const req = requireOwn('entry', e, [['handleValid', bool], ['token', v => str(v) || Number.isFinite(v)], ['stage', int0], ['clearStatusFresh', bool], ['difficulty', str]]); if (req) return req;
  if (ownVal(e, 'handleValid') !== true) return F('entry', 'handleValid false (null/invalid/thenable/getter handle not a valid entry)');
  if (ownVal(e, 'clearStatusFresh') !== true) return PEND('entry', 'clear/status not confirmed fresh — PENDING');
  return P('entry', 'valid handle + token + fresh stage/clear/difficulty');
}

// (B) continue: must check FULL fresh clear; same-stage stageCleared=false/final/demo/unknown must not advance
export function checkContinue(e) {
  const req = requireOwn('continue', e, [['freshClearChecked', bool], ['advancedOnUnclear', bool]]); if (req) return req;
  if (ownVal(e, 'freshClearChecked') !== true) return PEND('continue', 'full fresh clearContinue not checked — PENDING');
  return ownVal(e, 'advancedOnUnclear') === true ? F('continue', 'advanced on same-stage unclear/final/demo/unknown — must not') : P('continue', 'continue gated on full fresh clear');
}

// (C) stageCommit: scheduled != committed. require committed stage delta + save ACK.
export function checkStageCommit(e) {
  const req = requireOwn('stage-commit', e, [['transitionScheduled', bool], ['stageCommitted', bool]]); if (req) return req;
  if (ownVal(e, 'stageCommitted') !== true) return PEND('stage-commit', 'transition SCHEDULED but not COMMITTED (nextStage/G.stage++ not observed) — PENDING');
  const d = requireOwn('stage-commit', e, [['stageBefore', int0], ['stageAfter', int0], ['saveAckVerified', trueB]]); if (d) return d;
  return ownVal(e, 'stageAfter') > ownVal(e, 'stageBefore') ? P('stage-commit', `committed stage ${ownVal(e, 'stageBefore')}→${ownVal(e, 'stageAfter')} + save ACK`) : F('stage-commit', 'stageCommitted true but stageAfter not > stageBefore');
}

// (D) session dialogue: valid session observation = actualGrant:false/committed:false/scope session.
export function checkSessionDialogue(e) {
  const req = requireOwn('session-dialogue', e, [['scope', str], ['actualGrant', bool], ['committed', bool]]); if (req) return req;
  if (ownVal(e, 'actualGrant') === true || ownVal(e, 'committed') === true) return F('session-dialogue', 'session dialogue must be actualGrant:false/committed:false (durable claims go through durable-gift)');
  return ownVal(e, 'scope') === 'editor-session-only' ? P('session-dialogue', 'session-only observation (actualGrant:false, committed:false)') : PEND('session-dialogue', `scope='${ownVal(e, 'scope')}' not editor-session-only — PENDING`);
}

// (E) native6: six INDEPENDENT stage evidences; not aggregate; not ACK/LINK/shader; not fixture.
const STAGES6 = ['start', 'combat_loot', 'boss_open', 'death_revive', 'retry', 'return_commit'];
export function checkNative6(e) {
  const fb = fixtureBlock('native6', e, 'native6'); if (fb) return fb;
  const srcR = own(e, 'source', str);
  if (srcR.state === 'ok' && ['ack', 'link', 'shaderRegistered', 'shader', 'selfReport'].includes(srcR.value)) return F('native6', `native6 derived from '${srcR.value}' — ACK/LINK/shader is not native evidence`);
  const stagesR = own(e, 'stages', v => v && typeof v === 'object');
  if (stagesR.state === 'absent') return PEND('native6', 'no per-stage evidence — PENDING');
  if (stagesR.state === 'bad') return F('native6', `stages misobserved (${stagesR.why})`);
  const stages = stagesR.value, missing = [], badS = [];
  for (const s of STAGES6) { const r = own(stages, s, v => v && typeof v === 'object'); if (r.state === 'absent') { missing.push(s); continue; } if (r.state === 'bad') { badS.push(s); continue; } const ind = own(r.value, 'observed', trueB); if (ind.state !== 'ok') missing.push(`${s}.observed`); }
  if (badS.length) return F('native6', `stage evidence misobserved: ${badS.join(', ')}`);
  return missing.length ? PEND('native6', `6-stage independent evidence incomplete: ${missing.join(', ')} — PENDING`) : P('native6', 'all 6 stages independently observed');
}

// (F) audio: real played + sampleCount; name-only ⇒ PENDING; claimed from name ⇒ FAIL.
export function checkAudio(e) {
  const fb = fixtureBlock('audio', e, 'audio'); if (fb) return fb;
  const req = requireOwn('audio', e, [['played', bool], ['sampleCount', fin0]]); if (req) return req;
  if (ownVal(e, 'played') !== true) return PEND('audio', 'audio not observed played — PENDING');
  return ownVal(e, 'sampleCount') >= 1 ? P('audio', `audio played, ${ownVal(e, 'sampleCount')} sample(s)`) : PEND('audio', 'played true but 0 samples — PENDING');
}

// (G) durable gift: real itemId + capacity admit + dedup ledger + saved-together + readback ACK + grant.
export function checkDurableGift(e) {
  const fb = fixtureBlock('durable-gift', e, 'durable-gift'); if (fb) return fb;
  const req = requireOwn('durable-gift', e, [['itemId', str], ['inventoryAdmitted', bool], ['ledgerDedup', bool], ['savedTogether', bool], ['readbackVerified', bool], ['actualGrant', bool]]); if (req) return req;
  if (ownVal(e, 'actualGrant') !== true) return PEND('durable-gift', 'session-only / pickupItem/dbSave resolve alone — not durable (actualGrant:false) — PENDING');
  for (const k of ['inventoryAdmitted', 'ledgerDedup', 'savedTogether', 'readbackVerified']) if (ownVal(e, k) !== true) return PEND('durable-gift', `actualGrant claimed but ${k}≠true — PENDING (not durable ACK)`);
  return P('durable-gift', `durable gift ${ownVal(e, 'itemId')}: admitted+dedup+saved-together+readback ACK`);
}

// (H) save ACK: atomic inventory+ledger + readback; dbSave resolve alone ⇒ PENDING.
export function checkSaveAck(e) {
  const req = requireOwn('save-ack', e, [['atomicInventoryLedger', bool], ['readbackVerified', bool], ['dbSaveResolved', bool]]); if (req) return req;
  if (ownVal(e, 'atomicInventoryLedger') === true && ownVal(e, 'readbackVerified') === true) return P('save-ack', 'atomic inventory+ledger save + readback verified');
  return PEND('save-ack', 'dbSave resolve / pickupItem true alone is not an atomic readback ACK — PENDING');
}

// (I) visual: ACK/shaderRegistered/LINK alone ⇒ not visual PASS; contact ON VISUAL FAIL respected.
export function checkVisual(e) {
  if (own(e, 'contactEffectOn', bool).state === 'ok' && ownVal(e, 'contactEffectOn') === true) return F('visual', 'contact effect ON = known VISUAL FAIL (nav-stain); default OFF respected');
  for (const k of ['ack', 'shaderRegistered', 'linked', 'LINK']) { const r = own(e, k, bool); if (r.state === 'ok' && r.value === true) { /* presence noted, never a visual PASS */ } }
  const cap = own(e, 'capturedPixels', bool);
  if (cap.state === 'absent') return PEND('visual', 'ACK/shaderRegistered/LINK are not a visual PASS; no captured-pixel observation — PENDING (VISUAL RETOUCH)');
  if (cap.state === 'bad') return F('visual', `capturedPixels ${cap.why}`);
  const fb = fixtureBlock('visual', e, 'visual'); if (fb) return fb;
  return cap.value === true ? P('visual', 'actual captured-pixel visual observation') : PEND('visual', 'capturedPixels false — PENDING');
}

export function validateMainEvidence(ev = {}) {
  const g = ev || {};
  const sections = {
    'trace-pins': [checkTracePins(g.trace)],
    entry: [checkEntry(g.entry)],
    continue: [checkContinue(g.continue)],
    'stage-commit': [checkStageCommit(g.stageCommit)],
    'session-dialogue': [checkSessionDialogue(g.sessionDialogue)],
    native6: [checkNative6(g.native6)],
    audio: [checkAudio(g.audio)],
    'durable-gift': [checkDurableGift(g.durableGift)],
    'save-ack': [checkSaveAck(g.saveAck)],
    visual: [checkVisual(g.visual)],
  };
  let fail = 0, pass = 0, pending = 0;
  for (const rows of Object.values(sections)) for (const r of rows) r.pass === false ? fail++ : r.pass === true ? pass++ : pending++;
  return { completionId: 'CH1-RIFT-MAIN-PARALLEL-20261007-QA-CANDIDATE', sections, totals: { fail, pass, pending }, boundary: 'READONLY plain-own-data contract — scheduled≠committed, session≠durable, ACK/LINK/shader≠visual, fixture/lab≠native6/reward/A-grade (root-owned, PENDING until real observation).' };
}
