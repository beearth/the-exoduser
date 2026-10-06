/*
 * rift-retouch-consumer-acceptance-2_5d.v2.candidate.mjs
 * GOAL CH1-RIFT-QUALITY-NEXT-20261007 · ROLE QA · CANDIDATE (not acceptance).
 * COMPLETION CH1-RIFT-QUALITY-NEXT-20261007-EVIDENCE-GATES-V2-CANDIDATE
 *
 * v2 fixes a concrete fail-OPEN defect in the v1 retouch gates: v1's lifetime/original-integrity/
 * nav-leak/attack/motion predicates PASS on empty `{}`/missing input (absence-of-evidence read as
 * PASS). v2 requires EXPLICIT observed fields — empty/missing ⇒ PENDING — and grades the editor /
 * bytes / structural gates against the REAL public registration API (read-only import), never a
 * fabricated provider.
 *
 * Real API consumed (read-only): tools/2_5d/scene-registration.mjs —
 *   editorRoundtrip(baseline, provider)  (async): null provider→PENDING; provider.save mutating input
 *     →FAIL; format-only→FORMAT_VERIFIED; real browser evidence (kind:'browser-export-import',
 *     evidence.actualDownload&&actualImport&&isolatedContext&&url 3387&&artifactSha256==hash(saved))
 *     →VERIFIED; artifact SHA mismatch→FAIL (scene-registration.mjs:111-131).
 *   verifyBytes(bytes,pin,hasher) (async) = BYTES-HASH VERIFIED (scene-registration.mjs:31-36).
 *   compareToCanonical(scene,canonical) = STRUCTURAL/string deepEqual of protected keys (…:57-66).
 *
 * Fail-closed throughout: FORMAT_VERIFIED is NOT acceptance; a required field absent ⇒ PENDING;
 * source bytes-hash and structural compare are kept distinct; UNKNOWN height/foot/native/audio ⇒
 * PENDING. No unused observation is counted as PASS. Source trace ≠ editor/screen/native/listen/
 * save/本編/IK/A-grade (root-owned); guideline §17/§22: tooling PASS is never a visual PASS.
 *
 * Verify (single stdin run; consumes the real API + real scene; FAIL→nonzero):
 *   node tools/team-followup-20261007/hell-rift/QA/rift-retouch-consumer-acceptance-2_5d.v2.candidate.mjs
 */

import { editorRoundtrip, verifyBytes, compareToCanonical } from '../../../2_5d/scene-registration.mjs';

const num = v => typeof v === 'number' && Number.isFinite(v);
const isThenable = v => v && (typeof v === 'object' || typeof v === 'function') && typeof v.then === 'function';
const nonEmptyObj = v => v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length > 0;
const F = (cls, detail) => ({ pass: false, cls, detail });
const P = (cls, detail) => ({ pass: true, cls, detail });
const PEND = (cls, detail) => ({ pass: null, cls, detail });

export const RETOUCH2 = Object.freeze({
  motions: Object.freeze(['idle', 'walk', 'run', 'attack']),
  directions: 8,
  endId: 'CH1-RIFT-QUALITY-NEXT-20261007-EVIDENCE-GATES-V2-CANDIDATE',
});

// A result that is still a thenable was not awaited — never grade it (async import/save rejection miss).
export function checkAwaited(value, label = 'result') {
  return isThenable(value) ? F('awaited', `${label} is a thenable — must be awaited before grading (unawaited async import/save/load)`) : P('awaited', `${label} is a settled value`);
}

// Grade the REAL editorRoundtrip result. VERIFIED(real evidence)→PASS; FORMAT_VERIFIED→PENDING
// (format round-trip only, NOT acceptance); PENDING→PENDING; FAIL→FAIL; thenable→FAIL (not awaited).
export function gradeEditorRoundtrip(result) {
  if (isThenable(result)) return F('editor-evidence', 'editorRoundtrip result not awaited (thenable)');
  if (!result || typeof result.status !== 'string') return PEND('editor-evidence', 'no editorRoundtrip result — PENDING');
  switch (result.status) {
    case 'VERIFIED': return result.realEditor === true ? P('editor-evidence', 'real browser export/import evidence (VERIFIED)') : F('editor-evidence', 'status VERIFIED without realEditor flag');
    case 'FORMAT_VERIFIED': return PEND('editor-evidence', 'FORMAT_VERIFIED only — format round-trip, no browser export-download evidence → NOT acceptance (PENDING)');
    case 'PENDING': return PEND('editor-evidence', `editor PENDING: ${result.reason || 'no provider'}`);
    default: return F('editor-evidence', `editor ${result.status}: ${result.reason || (result.diffs || []).join('; ')}`);
  }
}

// Bytes-hash (verifyBytes) and structural compare (compareToCanonical) are DISTINCT evidences.
export function gradeBytesVsStructure(bytesResult, structuralResult) {
  const out = [];
  if (!bytesResult || typeof bytesResult.status !== 'string') out.push(PEND('bytes-hash', 'verifyBytes result absent — PENDING'));
  else out.push(bytesResult.status === 'VERIFIED' ? P('bytes-hash', `source bytes SHA256 VERIFIED (${String(bytesResult.sha).slice(0, 8)})`) : bytesResult.status === 'UNKNOWN' ? PEND('bytes-hash', `bytes hash UNKNOWN: ${bytesResult.reason}`) : F('bytes-hash', `bytes ${bytesResult.status}: ${bytesResult.reason || ''}`));
  if (!structuralResult || typeof structuralResult.ok !== 'boolean') out.push(PEND('structural', 'compareToCanonical result absent — PENDING (distinct from bytes hash)'));
  else out.push(structuralResult.ok ? P('structural', 'structural deepEqual of protected keys VERIFIED') : F('structural', `structural diff: ${(structuralResult.diffs || []).slice(0, 4).join('; ')}`));
  return out;
}

// FIXED: empty `{}` afterTeardown no longer PASSes — require an explicit disposed/isOpen boolean.
export function checkLifetime(consumer, afterTeardown) {
  if (consumer === undefined || consumer === null) return PEND('lifetime', 'no live consumer — PENDING');
  if (typeof consumer.dispose !== 'function' && typeof consumer.close !== 'function') return F('lifetime', 'no dispose()/close() teardown');
  if (!afterTeardown || typeof afterTeardown !== 'object' || (typeof afterTeardown.disposed !== 'boolean' && typeof afterTeardown.isOpen !== 'boolean'))
    return PEND('lifetime', 'teardown-after observation lacks explicit disposed/isOpen boolean (e.g. {} ) — PENDING, not PASS');
  const live = afterTeardown.disposed === false || afterTeardown.isOpen === true;
  return live ? F('lifetime', `still live after teardown ${JSON.stringify(afterTeardown)}`) : P('lifetime', 'torn down after scene-switch/dispose');
}

// FIXED: empty pins no longer PASS — require matching non-empty key sets.
export function checkOriginalIntegrity(beforePins, afterPins) {
  if (!nonEmptyObj(beforePins) || !nonEmptyObj(afterPins)) return PEND('original-integrity', 'before/after source pins absent or empty — PENDING (not PASS)');
  const bk = Object.keys(beforePins).sort(), ak = Object.keys(afterPins).sort();
  if (bk.join() !== ak.join()) return F('original-integrity', `pin key set changed: [${bk}]→[${ak}]`);
  const changed = bk.filter(k => afterPins[k] !== beforePins[k]).map(k => `${k}: ${String(beforePins[k]).slice(0, 8)}→${String(afterPins[k]).slice(0, 8)}`);
  return changed.length ? F('original-integrity', `source raw tampered: ${changed.join(', ')}`) : P('original-integrity', `${bk.length} source pins unchanged`);
}

// FIXED: empty extents/clip no longer PASS — require all four numeric sides on both.
export function checkNavMaterialLeak(drawnExtents, clip, offenders) {
  const sides = o => o && ['left', 'right', 'top', 'bottom'].every(s => num(o[s]));
  if (!sides(drawnExtents) || !sides(clip)) return PEND('nav-material-leak', 'drawn extents / clip bounds not fully observed — PENDING');
  const out = [];
  if (drawnExtents.left < clip.left || drawnExtents.right > clip.right || drawnExtents.top < clip.top || drawnExtents.bottom > clip.bottom)
    out.push(`extent ${JSON.stringify(drawnExtents)} exceeds clip ${JSON.stringify(clip)}`);
  if (Array.isArray(offenders) && offenders.length) out.push(`${offenders.length} material px on non-walkable contact cells`);
  return out.length ? F('nav-material-leak', out.join(' | ')) : P('nav-material-leak', 'material within clip; no non-walkable contact paint (guideline §13/GATE4)');
}

// FIXED: coord-less walk no longer PASS — position requires observed x/y; special motion ⇒ UNKNOWN.
export function checkMotionBoundary(sample, bounds, claimedPass = false) {
  if (!sample || typeof sample.mode !== 'string') return PEND('motion-boundary', 'no motion sample (mode) — PENDING');
  const reasons = [];
  if (!RETOUCH2.motions.includes(sample.mode)) reasons.push(`special/unknown motion '${sample.mode}'`);
  if (!Number.isInteger(sample.direction) || sample.direction < 0 || sample.direction >= RETOUCH2.directions) reasons.push(`direction ${sample.direction} out of 0..7`);
  if (reasons.length) return claimedPass ? F('motion-boundary', `claimed PASS on UNKNOWN: ${reasons.join('; ')}`) : PEND('motion-boundary', `UNKNOWN (not PASS): ${reasons.join('; ')}`);
  if (!num(sample.x) || !num(sample.y)) return PEND('motion-boundary', `${sample.mode}/d${sample.direction}: position (x,y) not observed — PENDING (coord-less, not PASS)`);
  if (bounds && (sample.x < bounds.left || sample.x > bounds.right || sample.y < bounds.top || sample.y > bounds.bottom))
    return claimedPass ? F('motion-boundary', `claimed PASS outside bounds (${sample.x},${sample.y})`) : PEND('motion-boundary', `position (${sample.x},${sample.y}) outside bounds — UNKNOWN`);
  return P('motion-boundary', `${sample.mode}/d${sample.direction} @(${sample.x},${sample.y}) within contract`);
}

// FIXED: empty `{}` no longer PASS — require explicit mode; adds attackRemaining/framesRemaining miss.
export function checkAttackResidue(postAttack) {
  if (!postAttack || typeof postAttack.mode !== 'string') return PEND('attack-residue', 'no post-attack snapshot (mode) — PENDING');
  if (postAttack.mode === 'attack' && postAttack.attackComplete !== true) return PEND('attack-residue', 'still mid-attack — observe after attack ends (PENDING)');
  const residue = [];
  for (const f of ['attackActive', 'hitboxActive', 'attackVfxAlive', 'attackPoseHeld']) if (postAttack[f] === true) residue.push(f);
  for (const f of ['attackRemaining', 'attackFramesRemaining']) if (num(postAttack[f]) && postAttack[f] > 0) residue.push(`${f}=${postAttack[f]}`);
  if (Array.isArray(postAttack.heldKeys) && postAttack.heldKeys.length) residue.push(`heldKeys[${postAttack.heldKeys.join(',')}]`);
  return residue.length ? F('attack-residue', `attack residue after end: ${residue.join(', ')}`) : P('attack-residue', 'attack state cleared (neutral idle/facing, no hitbox/VFX/held/remaining)');
}

// registration: a non-null factory return with its method set; null/{}/missing ⇒ PENDING (not PASS).
export function checkRegistration(consumer, requiredMethods = []) {
  if (consumer === undefined) return PEND('registration', 'no consumer observation — PENDING');
  if (consumer === null) return PEND('registration', 'factory returned null (unsupported/absent module) — not registered, PENDING');
  if (typeof consumer !== 'object' || Object.keys(consumer).length === 0) return F('registration', 'empty/invalid consumer object');
  const missing = requiredMethods.filter(m => typeof consumer[m] !== 'function');
  return missing.length ? F('registration', `missing method(s): ${missing.join(', ')}`) : P('registration', `registered with [${requiredMethods.join(',')}]`);
}

// UNKNOWN physical evidence: snapshot field 'UNKNOWN'/absent, or an acceptance flag false ⇒ PENDING.
export function checkUnobserved(snapshot, field, { acceptanceFlag = false } = {}) {
  if (!snapshot || typeof snapshot !== 'object') return PEND('unobserved', `no snapshot for '${field}' — PENDING`);
  const v = snapshot[field];
  if (v === undefined || v === 'UNKNOWN' || (acceptanceFlag && v !== true)) return PEND('unobserved', `'${field}'=${JSON.stringify(v)} not observed/accepted — PENDING (height/foot/native/audio ≠ fixture PASS)`);
  return P('unobserved', `'${field}' observed: ${JSON.stringify(v)}`);
}

export async function runEvidenceGates(i = {}) {
  const editor = await editorRoundtrip(i.baseline, i.editorProvider || null).catch(e => ({ status: 'FAIL', reason: e.message, kind: 'editor' }));
  const bytes = i.canonicalBytes ? await verifyBytes(i.canonicalBytes, i.pin, i.hasher).catch(e => ({ status: 'UNKNOWN', reason: e.message })) : null;
  let structural = null; try { structural = i.scene && i.canonical ? compareToCanonical(i.scene, i.canonical) : null; } catch (e) { structural = { ok: false, diffs: [e.message] }; }
  const sections = {
    'editor-evidence': [gradeEditorRoundtrip(editor)],
    'bytes-vs-structure': gradeBytesVsStructure(bytes, structural),
    registration: [checkRegistration(i.consumer, i.requiredMethods || [])],
    lifetime: [checkLifetime(i.consumer, i.afterTeardown)],
    'original-integrity': [checkOriginalIntegrity(i.beforePins, i.afterPins)],
    'nav-material-leak': [checkNavMaterialLeak(i.drawnExtents, i.clip, i.navOffenders)],
    'motion-boundary': [checkMotionBoundary(i.motionSample, i.bounds, i.claimedPass)],
    'attack-residue': [checkAttackResidue(i.postAttack)],
  };
  let fail = 0, pass = 0, pending = 0;
  for (const rows of Object.values(sections)) for (const r of rows) r.pass === false ? fail++ : r.pass === true ? pass++ : pending++;
  return { endId: RETOUCH2.endId, sections, totals: { fail, pass, pending }, boundary: 'READONLY evidence predicate — real observation required; FORMAT_VERIFIED/fixture ≠ editor/screen/native/listen/save/本編/IK/A-grade (root-owned).' };
}

// ── single-run self-check: consumes the REAL api + real scene; meta-asserts the new counterexamples ──
const isMain = (() => { try { return import.meta.url === new URL(`file://${process.argv[1]}`).href; } catch { return false; } })();
if (isMain) {
  const { readFile } = await import('node:fs/promises');
  const { createHash } = await import('node:crypto');
  const sha = s => createHash('sha256').update(s).digest('hex');
  const baseline = JSON.parse(await readFile('assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json', 'utf8'));
  const savedStr = JSON.stringify(baseline);
  const fmtProvider = { save: async s => JSON.stringify(s), load: async str => JSON.parse(str) };               // format-only
  const realProvider = { save: async s => JSON.stringify(s), load: async str => JSON.parse(str), kind: 'browser-export-import',
    evidence: { actualDownload: true, actualImport: true, isolatedContext: true, url: 'http://127.0.0.1:3387/editor.html', artifactSha256: sha(savedStr) } };
  const rejectProvider = { save: async () => { throw new Error('import rejected'); }, load: async x => x };

  const expect = []; const E = (want, got, label) => expect.push({ ok: got.pass === want, want, got: got.pass, label, detail: got.detail });
  // async import rejection 미await + null/format vs real editor
  E(false, checkAwaited(editorRoundtrip(baseline, null)), 'unawaited editorRoundtrip (thenable) → FAIL');
  E(null, gradeEditorRoundtrip(await editorRoundtrip(baseline, null)), 'null provider → PENDING (no fake realeditor PASS)');
  E(null, gradeEditorRoundtrip(await editorRoundtrip(baseline, fmtProvider)), 'format-only → FORMAT_VERIFIED → PENDING (not acceptance)');
  E(true, gradeEditorRoundtrip(await editorRoundtrip(baseline, realProvider)), 'real browser evidence → VERIFIED → PASS');
  E(false, gradeEditorRoundtrip(await editorRoundtrip(baseline, rejectProvider)), 'provider.save rejects → FAIL');
  // bytes-hash vs structural distinction
  const bytesOk = await verifyBytes(new TextEncoder().encode(savedStr), sha(savedStr));
  const bvs = gradeBytesVsStructure(bytesOk, compareToCanonical(baseline, baseline));
  E(true, bvs[0], 'bytes-hash VERIFIED → PASS'); E(true, bvs[1], 'structural deepEqual → PASS');
  E(null, gradeBytesVsStructure(bytesOk, null)[1], 'structural absent → PENDING (distinct from bytes)');
  // fail-OPEN holes now PENDING (not PASS)
  E(null, checkLifetime({ dispose() {} }, {}), '{} teardown → PENDING (was PASS in v1)');
  E(null, checkOriginalIntegrity({}, {}), 'empty pins → PENDING (was PASS in v1)');
  E(null, checkNavMaterialLeak({}, {}), 'empty extents/clip → PENDING');
  E(null, checkMotionBoundary({ mode: 'walk', direction: 0 }, null), 'coord-less walk → PENDING (was PASS in v1)');
  E(null, checkAttackResidue({}), 'empty attack snapshot → PENDING (was PASS in v1)');
  // idle with attackRemaining:1 residue miss now caught
  E(false, checkAttackResidue({ mode: 'idle', attackRemaining: 1 }), 'idle attackRemaining:1 → FAIL');
  E(true, checkAttackResidue({ mode: 'idle', attackActive: false, attackRemaining: 0 }), 'idle cleared → PASS');
  // UNKNOWN physical evidence
  E(null, checkUnobserved({ physicalHeight: 'UNKNOWN' }, 'physicalHeight'), 'UNKNOWN height → PENDING');
  E(null, checkUnobserved({ nativeAccepted: false }, 'nativeAccepted', { acceptanceFlag: true }), 'native not accepted → PENDING');

  const bad = expect.filter(e => !e.ok);
  for (const e of expect) console.log(`  [${e.ok ? 'OK ' : 'XX '}] ${e.label} — want ${e.want} got ${e.got}`);
  console.log(`\nmeta: ${expect.length - bad.length}/${expect.length} predicates behaved as expected`);
  if (bad.length) for (const b of bad) console.log(`  MISMATCH: ${b.label} — ${b.detail}`);
  console.log('Boundary: ' + (await runEvidenceGates({ baseline })).boundary);
  process.exit(bad.length ? 1 : 0);
}
