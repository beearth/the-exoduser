/*
 * rift-retouch-consumer-acceptance-2_5d.v3.candidate.mjs
 * GOAL CH1-RIFT-QUALITY-FIX-20261007 · ROLE QA · CANDIDATE (not acceptance).
 * COMPLETION CH1-RIFT-QUALITY-FIX-20261007-EVIDENCE-GATES-V3-CANDIDATE
 *
 * v3 fixes a P1 defect in v2's evidence gate: v2 compared the scene against a CALLER-SUPPLIED
 * `i.canonical` that was SEPARATE from the hash-verified bytes, so a self-canonical or a nav 2-tile
 * swap keeping walkableCount 1192 PASSed. v3 removes the caller canonical entirely and consumes the
 * REAL public `assessRegistration` (scene-registration.mjs:141), which pins `canonicalBytes` to
 * RIFT_TERRAIN.sceneSha256 (c508e70d…) and derives the canonical ONLY from those pin-verified bytes,
 * comparing walkable tile-by-tile (count match ≠ identity) and exposing sourceSceneSha256 only after
 * VERIFIED. A tampered scene ⇒ canonicalCompare FAIL.
 *
 * Also hardened (strict field typing; NaN/wrong-observation ⇒ FAIL, absent ⇒ PENDING):
 *   - attackRemaining/attackFramesRemaining present-but-non-finite ⇒ FAIL (misobservation);
 *   - lifetime disposed/isOpen must be strict boolean; navOffenders must be an array; extent/clip
 *     side present-but-non-finite ⇒ FAIL;
 *   - checkUnobserved: null is NOT an observation (physicalHeight:null ⇒ PENDING), wired into the
 *     real aggregation;
 *   - VERIFIED registration without a SHA ⇒ not PASS; FORMAT_VERIFIED ≠ VERIFIED; native/audio/
 *     height/foot UNKNOWN ⇒ PENDING. Source trace ≠ editor/screen/native/listen/foot/IK/本編/A-grade.
 *
 * Verify (single separate stdin run; imports this candidate + real source; FAIL ⇒ nonzero):
 *   node --input-type=module <<'NODE'  (see completion report)
 */

import { assessRegistration, editorRoundtrip } from '../../../2_5d/scene-registration.mjs';

const num = v => typeof v === 'number' && Number.isFinite(v);
const isThenable = v => v && (typeof v === 'object' || typeof v === 'function') && typeof v.then === 'function';
const nonEmptyObj = v => v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0;
const F = (cls, detail) => ({ pass: false, cls, detail });
const P = (cls, detail) => ({ pass: true, cls, detail });
const PEND = (cls, detail) => ({ pass: null, cls, detail });
// field typing: 'absent' ⇒ PENDING, 'bad' ⇒ FAIL (misobserved), 'ok'
const fieldState = (obj, key, ok) => !(key in obj) ? 'absent' : (ok(obj[key]) ? 'ok' : 'bad');

export const RETOUCH3 = Object.freeze({
  motions: Object.freeze(['idle', 'walk', 'run', 'attack']),
  directions: 8,
  pin: 'c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a', // RIFT_TERRAIN.sceneSha256
  endId: 'CH1-RIFT-QUALITY-FIX-20261007-EVIDENCE-GATES-V3-CANDIDATE',
});

export function checkAwaited(value, label = 'result') {
  return isThenable(value) ? F('awaited', `${label} is a thenable — must be awaited (unawaited async import/save/load)`) : P('awaited', `${label} is settled`);
}

// P1 fix: grade the REAL assessRegistration. Bytes-hash(pin) and structural(canonical-from-pinned-bytes)
// are distinct; a VERIFIED pin without a SHA, or VERIFIED structural without sourceSceneSha256, is NOT PASS.
export function gradeRegistration(assess) {
  if (isThenable(assess)) return [F('registration-evidence', 'assessRegistration not awaited (thenable)')];
  if (!assess || typeof assess !== 'object') return [PEND('registration-evidence', 'no assessRegistration result — PENDING')];
  const out = [];
  const pin = assess.pin || {};
  if (pin.status === 'VERIFIED') out.push(typeof pin.sha === 'string' && pin.sha.length === 64 ? P('bytes-hash', `source bytes SHA256 VERIFIED (${pin.sha.slice(0, 8)})`) : F('bytes-hash', 'pin VERIFIED without a 64-hex SHA — rejected'));
  else if (pin.status === 'UNKNOWN') out.push(PEND('bytes-hash', `bytes hash UNKNOWN: ${pin.reason || ''}`));
  else out.push(F('bytes-hash', `pin ${pin.status}: ${pin.reason || ''}`));
  const cc = assess.canonicalCompare || {};
  if (cc.status === 'VERIFIED') out.push(typeof assess.sourceSceneSha256 === 'string' ? P('structural', 'structural (canonical-from-pinned-bytes) VERIFIED, SHA exposed') : F('structural', 'structural VERIFIED without exposed sourceSceneSha256 — rejected'));
  else if (cc.status === 'FAIL') out.push(F('structural', `structural tamper: ${(cc.diffs || [cc.reason]).slice(0, 4).join('; ')}`));
  else out.push(PEND('structural', `structural ${cc.status || 'UNKNOWN'}: ${cc.reason || 'canonicalBytes 미제공/미검증'}`));
  out.push(assess.walkableCount === 1192 ? P('walkable-count', '1192') : F('walkable-count', `walkableCount ${assess.walkableCount}≠1192`));
  return out;
}

// editor evidence: VERIFIED(real)→PASS; FORMAT_VERIFIED→PENDING(not acceptance); PENDING→PENDING; FAIL→FAIL.
export function gradeEditorEvidence(editorResult) {
  if (isThenable(editorResult)) return F('editor-evidence', 'editorRoundtrip not awaited (thenable)');
  if (!editorResult || typeof editorResult.status !== 'string') return PEND('editor-evidence', 'no editorRoundtrip result — PENDING');
  switch (editorResult.status) {
    case 'VERIFIED': return editorResult.realEditor === true ? P('editor-evidence', 'real browser export/import evidence (VERIFIED)') : F('editor-evidence', 'VERIFIED without realEditor flag');
    case 'FORMAT_VERIFIED': return PEND('editor-evidence', 'FORMAT_VERIFIED only — format round-trip, no browser export-download evidence ⇒ NOT acceptance (PENDING)');
    case 'PENDING': return PEND('editor-evidence', `editor PENDING: ${editorResult.reason || 'no provider'}`);
    default: return F('editor-evidence', `editor ${editorResult.status}: ${editorResult.reason || (editorResult.diffs || []).join('; ')}`);
  }
}

export function checkLifetime(consumer, afterTeardown) {
  if (consumer === undefined || consumer === null) return PEND('lifetime', 'no live consumer — PENDING');
  if (typeof consumer.dispose !== 'function' && typeof consumer.close !== 'function') return F('lifetime', 'no dispose()/close() teardown');
  if (!afterTeardown || typeof afterTeardown !== 'object') return PEND('lifetime', 'no teardown-after observation — PENDING');
  const d = fieldState(afterTeardown, 'disposed', v => typeof v === 'boolean'), o = fieldState(afterTeardown, 'isOpen', v => typeof v === 'boolean');
  if (d === 'bad' || o === 'bad') return F('lifetime', 'disposed/isOpen present but not boolean — misobserved');
  if (d === 'absent' && o === 'absent') return PEND('lifetime', 'no explicit disposed/isOpen boolean (e.g. {}) — PENDING');
  const live = afterTeardown.disposed === false || afterTeardown.isOpen === true;
  return live ? F('lifetime', `still live after teardown ${JSON.stringify(afterTeardown)}`) : P('lifetime', 'torn down');
}

export function checkOriginalIntegrity(beforePins, afterPins) {
  if (!nonEmptyObj(beforePins) || !nonEmptyObj(afterPins)) return PEND('original-integrity', 'source pins absent/empty — PENDING');
  const bk = Object.keys(beforePins).sort(), ak = Object.keys(afterPins).sort();
  if (bk.join() !== ak.join()) return F('original-integrity', `pin key set changed [${bk}]→[${ak}]`);
  const changed = bk.filter(k => afterPins[k] !== beforePins[k]);
  return changed.length ? F('original-integrity', `source raw tampered: ${changed.join(', ')}`) : P('original-integrity', `${bk.length} source pins unchanged`);
}

export function checkNavMaterialLeak(drawnExtents, clip, offenders) {
  const sideState = o => { if (!o || typeof o !== 'object') return 'absent'; let bad = false, absent = false; for (const s of ['left', 'right', 'top', 'bottom']) { if (!(s in o)) absent = true; else if (!num(o[s])) bad = true; } return bad ? 'bad' : absent ? 'absent' : 'ok'; };
  const de = sideState(drawnExtents), cl = sideState(clip);
  if (de === 'bad' || cl === 'bad') return F('nav-material-leak', 'extent/clip side present but non-finite (NaN) — misobserved');
  if (de !== 'ok' || cl !== 'ok') return PEND('nav-material-leak', 'drawn extents / clip bounds not fully observed — PENDING');
  if (offenders !== undefined && !Array.isArray(offenders)) return F('nav-material-leak', 'navOffenders present but not an array — misobserved');
  const out = [];
  if (drawnExtents.left < clip.left || drawnExtents.right > clip.right || drawnExtents.top < clip.top || drawnExtents.bottom > clip.bottom) out.push('material extent exceeds clip');
  if (Array.isArray(offenders) && offenders.length) out.push(`${offenders.length} material px on non-walkable contact cells`);
  return out.length ? F('nav-material-leak', out.join(' | ')) : P('nav-material-leak', 'material within clip; no non-walkable contact paint (§13/GATE4)');
}

export function checkMotionBoundary(sample, bounds, claimedPass = false) {
  if (!sample || typeof sample.mode !== 'string') return PEND('motion-boundary', 'no motion sample (mode) — PENDING');
  const reasons = [];
  if (!RETOUCH3.motions.includes(sample.mode)) reasons.push(`special motion '${sample.mode}'`);
  if (!Number.isInteger(sample.direction) || sample.direction < 0 || sample.direction >= RETOUCH3.directions) reasons.push(`direction ${sample.direction} out of 0..7`);
  if (reasons.length) return claimedPass ? F('motion-boundary', `claimed PASS on UNKNOWN: ${reasons.join('; ')}`) : PEND('motion-boundary', `UNKNOWN: ${reasons.join('; ')}`);
  const xs = fieldState(sample, 'x', num), ys = fieldState(sample, 'y', num);
  if (xs === 'bad' || ys === 'bad') return F('motion-boundary', 'position x/y present but non-finite — misobserved');
  if (xs === 'absent' || ys === 'absent') return PEND('motion-boundary', `${sample.mode}/d${sample.direction}: position not observed — PENDING (coord-less)`);
  if (bounds && (sample.x < bounds.left || sample.x > bounds.right || sample.y < bounds.top || sample.y > bounds.bottom))
    return claimedPass ? F('motion-boundary', `claimed PASS outside bounds (${sample.x},${sample.y})`) : PEND('motion-boundary', `(${sample.x},${sample.y}) outside bounds — UNKNOWN`);
  return P('motion-boundary', `${sample.mode}/d${sample.direction}@(${sample.x},${sample.y}) within contract`);
}

export function checkAttackResidue(postAttack) {
  if (!postAttack || typeof postAttack.mode !== 'string') return PEND('attack-residue', 'no post-attack snapshot (mode) — PENDING');
  if (postAttack.mode === 'attack' && postAttack.attackComplete !== true) return PEND('attack-residue', 'still mid-attack — PENDING');
  const residue = [];
  for (const f of ['attackActive', 'hitboxActive', 'attackVfxAlive', 'attackPoseHeld']) { const st = fieldState(postAttack, f, v => typeof v === 'boolean'); if (st === 'bad') return F('attack-residue', `${f} present but not boolean — misobserved`); if (st === 'ok' && postAttack[f] === true) residue.push(f); }
  for (const f of ['attackRemaining', 'attackFramesRemaining']) { const st = fieldState(postAttack, f, num); if (st === 'bad') return F('attack-residue', `${f} present but non-finite (NaN) — misobserved`); if (st === 'ok' && postAttack[f] > 0) residue.push(`${f}=${postAttack[f]}`); }
  if ('heldKeys' in postAttack) { if (!Array.isArray(postAttack.heldKeys)) return F('attack-residue', 'heldKeys present but not an array — misobserved'); if (postAttack.heldKeys.length) residue.push(`heldKeys[${postAttack.heldKeys.join(',')}]`); }
  return residue.length ? F('attack-residue', `attack residue after end: ${residue.join(', ')}`) : P('attack-residue', 'attack state cleared');
}

export function checkRegistration(consumer, requiredMethods = []) {
  if (consumer === undefined) return PEND('registration', 'no consumer observation — PENDING');
  if (consumer === null) return PEND('registration', 'factory returned null (unsupported/absent) — PENDING');
  if (typeof consumer !== 'object' || Object.keys(consumer).length === 0) return F('registration', 'empty/invalid consumer');
  const missing = requiredMethods.filter(m => typeof consumer[m] !== 'function');
  return missing.length ? F('registration', `missing method(s): ${missing.join(', ')}`) : P('registration', `registered [${requiredMethods.join(',')}]`);
}

// null is NOT an observation. field absent/null/'UNKNOWN', or an acceptance flag !== true ⇒ PENDING.
export function checkUnobserved(snapshot, field, { acceptanceFlag = false } = {}) {
  if (!snapshot || typeof snapshot !== 'object') return PEND('unobserved', `no snapshot for '${field}' — PENDING`);
  const v = snapshot[field];
  if (v === undefined || v === null || v === 'UNKNOWN' || (acceptanceFlag && v !== true))
    return PEND('unobserved', `'${field}'=${JSON.stringify(v)} not observed/accepted — PENDING (≠ fixture PASS)`);
  return P('unobserved', `'${field}' observed: ${JSON.stringify(v)}`);
}

export async function runEvidenceGates(i = {}) {
  let assess = null;
  try { assess = await assessRegistration(i.scene, { canonicalBytes: i.canonicalBytes || null, hasher: i.hasher || null, editorProvider: i.editorProvider || null }); }
  catch (e) { assess = { error: e.message }; }
  const editor = assess && assess.editorRoundtrip ? assess.editorRoundtrip : (i.editorProvider ? await editorRoundtrip(i.scene, i.editorProvider).catch(e => ({ status: 'FAIL', reason: e.message })) : null);
  const sections = {
    'registration-evidence': assess.error ? [F('registration-evidence', `assessRegistration threw: ${assess.error}`)] : gradeRegistration(assess),
    'editor-evidence': [gradeEditorEvidence(editor)],
    'physical-unobserved': [checkUnobserved(assess, 'physicalHeight'), checkUnobserved(assess, 'nativeAccepted', { acceptanceFlag: true }), checkUnobserved(assess, 'visualAssessed', { acceptanceFlag: true })],
    registration: [checkRegistration(i.consumer, i.requiredMethods || [])],
    lifetime: [checkLifetime(i.consumer, i.afterTeardown)],
    'original-integrity': [checkOriginalIntegrity(i.beforePins, i.afterPins)],
    'nav-material-leak': [checkNavMaterialLeak(i.drawnExtents, i.clip, i.navOffenders)],
    'motion-boundary': [checkMotionBoundary(i.motionSample, i.bounds, i.claimedPass)],
    'attack-residue': [checkAttackResidue(i.postAttack)],
  };
  let fail = 0, pass = 0, pending = 0;
  for (const rows of Object.values(sections)) for (const r of rows) r.pass === false ? fail++ : r.pass === true ? pass++ : pending++;
  return { endId: RETOUCH3.endId, sections, totals: { fail, pass, pending }, boundary: 'READONLY evidence predicate — canonical derived only from pin-verified bytes; FORMAT_VERIFIED/fixture ≠ editor/screen/native/listen/foot/IK/本編/A-grade (root-owned).' };
}
