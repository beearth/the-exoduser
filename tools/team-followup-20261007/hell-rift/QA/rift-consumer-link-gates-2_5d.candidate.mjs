/*
 * rift-consumer-link-gates-2_5d.candidate.mjs
 * GOAL CH1-RIFT-CONSUMER-LINK-20261007 · ROLE QA · CANDIDATE (not acceptance).
 * COMPLETION-ID: CH1-RIFT-CONSUMER-LINK-20261007-CONSUMER-LINK-GATES-CANDIDATE
 *
 * Typed/invariant/actual-evidence link gates for binding a NEW consumer to the current root snapshot.
 * Distinct from the retouch/evidence gates (v1/v2/v3): this file gates the LINK contract —
 *   bounds finite+order+world-containment · remaining>=0 · SHA 64-hex · pin==source · and keeps the
 *   real public assessRegistration byte-parse+await path. Every verdict is fail-closed: a missing
 *   typed observation ⇒ PENDING; a present-but-wrong observation (NaN/negative/out-of-order/out-of-
 *   world/short-sha/pin-mismatch) ⇒ FAIL; a PASS requires real evidence.
 *
 * A format echo / self-report / "8-camera" by NAME ONLY is NEVER promoted to a real WebGL/native/
 * audio PASS — name-only ⇒ PENDING, and a claimed-PASS on name-only ⇒ FAIL. This module touches no
 * renderer/GPU/本編; a source trace ≠ editor/screen/native/listen/reward/save/A-grade (root-owned).
 *
 * Consumes (read-only): tools/2_5d/scene-registration.mjs assessRegistration (byte-parse + await of
 * the pin-verified canonical, scene-registration.mjs:141); tools/2_5d/rift-terrain.mjs RIFT_TERRAIN
 * (clip 0..8000, sceneSha256 c508e70d…). nav pin a4508… is the scene walkable nav.
 *
 * Verify (single separate stdin run; FAIL ⇒ external nonzero): see completion report.
 */

import { assessRegistration } from '../../../2_5d/scene-registration.mjs';
import { RIFT_TERRAIN } from '../../../2_5d/rift-terrain.mjs';

const num = v => typeof v === 'number' && Number.isFinite(v);
const isThenable = v => v && (typeof v === 'object' || typeof v === 'function') && typeof v.then === 'function';
const F = (cls, detail) => ({ pass: false, cls, detail });
const P = (cls, detail) => ({ pass: true, cls, detail });
const PEND = (cls, detail) => ({ pass: null, cls, detail });
const fieldState = (o, k, ok) => !o || typeof o !== 'object' || !(k in o) ? 'absent' : (ok(o[k]) ? 'ok' : 'bad');

export const LINK = Object.freeze({
  world: RIFT_TERRAIN.clip,                                   // {left:0,top:0,right:8000,bottom:8000}
  scenePin: RIFT_TERRAIN.sceneSha256,                         // c508e70d…
  navPin: 'a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179',
  sha64: /^[0-9a-f]{64}$/,
  endId: 'CH1-RIFT-CONSUMER-LINK-20261007-CONSUMER-LINK-GATES-CANDIDATE',
});

// (1) bounds: all four sides finite, ordered (left<right, top<bottom), contained in world.
export function checkBounds(bounds, world = LINK.world) {
  if (!bounds || typeof bounds !== 'object') return PEND('bounds', 'no bounds observation — PENDING');
  for (const s of ['left', 'right', 'top', 'bottom']) { const st = fieldState(bounds, s, num); if (st === 'absent') return PEND('bounds', `side '${s}' not observed — PENDING`); if (st === 'bad') return F('bounds', `side '${s}'=${bounds[s]} non-finite — misobserved`); }
  if (!(bounds.left < bounds.right) || !(bounds.top < bounds.bottom)) return F('bounds', `order invalid L${bounds.left}<R${bounds.right} T${bounds.top}<B${bounds.bottom}`);
  if (bounds.left < world.left || bounds.right > world.right || bounds.top < world.top || bounds.bottom > world.bottom) return F('bounds', `not contained in world ${JSON.stringify(world)}`);
  return P('bounds', `finite, ordered, within world`);
}

// (1) remaining counters must be finite >= 0 when present; negative/NaN ⇒ FAIL, absent ⇒ PENDING.
export function checkRemaining(obj, fields = ['remaining']) {
  if (!obj || typeof obj !== 'object') return [PEND('remaining', 'no counter observation — PENDING')];
  return fields.map(f => {
    const st = fieldState(obj, f, num);
    if (st === 'absent') return PEND('remaining', `'${f}' not observed — PENDING`);
    if (st === 'bad') return F('remaining', `'${f}'=${obj[f]} non-finite — misobserved`);
    return obj[f] >= 0 ? P('remaining', `'${f}'=${obj[f]} ≥ 0`) : F('remaining', `'${f}'=${obj[f]} < 0`);
  });
}

// (1) SHA must be 64-hex; present-but-malformed ⇒ FAIL, absent ⇒ PENDING.
export function checkSha64(value, label = 'sha') {
  if (value === undefined || value === null) return PEND('sha', `${label} not observed — PENDING`);
  if (typeof value !== 'string' || !LINK.sha64.test(value)) return F('sha', `${label} not 64-hex: ${String(value).slice(0, 16)}`);
  return P('sha', `${label} 64-hex (${value.slice(0, 8)})`);
}

// (1) pin==source: the snapshot's nav/scene sha must equal the pinned source values.
export function checkPinMatchesSource(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return [PEND('pin-source', 'no snapshot — PENDING')];
  const out = [];
  for (const [key, pin] of [['navSha256', LINK.navPin], ['sourceSceneSha256', LINK.scenePin]]) {
    const v = snapshot[key];
    if (v === undefined || v === null) out.push(PEND('pin-source', `${key} not observed (not yet VERIFIED?) — PENDING`));
    else if (typeof v !== 'string' || !LINK.sha64.test(v)) out.push(F('pin-source', `${key} malformed: ${String(v).slice(0, 16)}`));
    else out.push(v === pin ? P('pin-source', `${key} == source pin (${pin.slice(0, 8)})`) : F('pin-source', `${key} ${v.slice(0, 8)} ≠ source pin ${pin.slice(0, 8)}`));
  }
  return out;
}

// (3) actual evidence: WebGL/native/audio/camera PASS requires the listed boolean evidence fields all
// true. name-only / self-report ⇒ PENDING; a consumer CLAIMING pass on name-only ⇒ FAIL.
export function checkActualEvidence(evidence, kind, requiredTrue = [], claimedPass = false) {
  if (!evidence || typeof evidence !== 'object') return claimedPass ? F('actual-evidence', `${kind}: claimed PASS with no evidence object`) : PEND('actual-evidence', `${kind}: no evidence object — PENDING`);
  const missing = requiredTrue.filter(f => evidence[f] !== true);
  if (!missing.length) return P('actual-evidence', `${kind}: evidence [${requiredTrue.join(',')}] all true`);
  return claimedPass ? F('actual-evidence', `${kind}: claimed PASS but missing/false evidence: ${missing.join(', ')}`) : PEND('actual-evidence', `${kind}: evidence missing/false ${missing.join(', ')} — PENDING`);
}

// (3) camera board: 8 NAME strings are not a render PASS. names-only ⇒ PENDING; claimed ⇒ FAIL.
export function checkCameraBoard(cameraBoard, claimedPass = false) {
  if (!Array.isArray(cameraBoard) || !cameraBoard.length) return PEND('camera-board', 'no camera board observed — PENDING');
  const nameOnly = cameraBoard.every(c => typeof c === 'string' || (c && typeof c === 'object' && !c.capturedPixels && !c.renderEvidence));
  if (nameOnly) return claimedPass ? F('camera-board', `claimed PASS on ${cameraBoard.length} camera NAMES with no render evidence`) : PEND('camera-board', `${cameraBoard.length} camera names only (no capturedPixels/renderEvidence) — PENDING`);
  const missing = cameraBoard.filter(c => !(c && (c.capturedPixels === true || c.renderEvidence === true)));
  return missing.length ? F('camera-board', `${missing.length}/${cameraBoard.length} cameras lack render evidence`) : P('camera-board', `${cameraBoard.length} cameras carry render evidence`);
}

// (2) registration link: consume the real assessRegistration byte-parse+await path. missing ⇒ PENDING.
export function gradeRegistrationLink(assess) {
  if (isThenable(assess)) return [F('registration-link', 'assessRegistration not awaited (thenable)')];
  if (!assess || typeof assess !== 'object' || assess.error) return [assess?.error ? F('registration-link', `assessRegistration threw: ${assess.error}`) : PEND('registration-link', 'no assessRegistration result — PENDING')];
  const out = [];
  const pin = assess.pin || {};
  out.push(pin.status === 'VERIFIED' ? checkSha64(pin.sha, 'pin.sha') : pin.status === 'UNKNOWN' ? PEND('registration-link', `pin UNKNOWN: ${pin.reason || ''}`) : F('registration-link', `pin ${pin.status}: ${pin.reason || ''}`));
  const cc = assess.canonicalCompare || {};
  out.push(cc.status === 'VERIFIED' ? (typeof assess.sourceSceneSha256 === 'string' ? P('registration-link', 'canonical(from pinned bytes) VERIFIED + SHA exposed') : F('registration-link', 'canonical VERIFIED without sourceSceneSha256')) : cc.status === 'FAIL' ? F('registration-link', `canonical tamper: ${(cc.diffs || [cc.reason]).slice(0, 3).join('; ')}`) : PEND('registration-link', `canonical ${cc.status || 'UNKNOWN'}: ${cc.reason || ''}`));
  out.push(assess.walkableCount === 1192 ? P('registration-link', 'walkableCount 1192') : F('registration-link', `walkableCount ${assess.walkableCount}≠1192`));
  return out;
}

export async function runConsumerLinkGates(i = {}) {
  let assess = null;
  if (i.scene !== undefined) { try { assess = await assessRegistration(i.scene, { canonicalBytes: i.canonicalBytes || null, hasher: i.hasher || null, editorProvider: i.editorProvider || null }); } catch (e) { assess = { error: e.message }; } }
  const pinSource = assess && assess.pin?.status === 'VERIFIED' ? { navSha256: i.snapshot?.navSha256, sourceSceneSha256: assess.sourceSceneSha256 } : (i.snapshot || null);
  const sections = {
    'registration-link': i.scene === undefined ? [PEND('registration-link', 'no scene supplied — PENDING')] : gradeRegistrationLink(assess),
    bounds: [checkBounds(i.bounds)],
    remaining: checkRemaining(i.counters, i.remainingFields || ['remaining']),
    sha: [checkSha64(i.sha, i.shaLabel || 'sha')],
    'pin-source': checkPinMatchesSource(pinSource),
    'actual-evidence': [checkActualEvidence(i.evidence, i.evidenceKind || 'webgl', i.evidenceRequired || [], i.claimedPass)],
    'camera-board': [checkCameraBoard(i.cameraBoard, i.claimedPass)],
  };
  let fail = 0, pass = 0, pending = 0;
  for (const rows of Object.values(sections)) for (const r of rows) r.pass === false ? fail++ : r.pass === true ? pass++ : pending++;
  return { endId: LINK.endId, sections, totals: { fail, pass, pending }, boundary: 'READONLY link gate — pin==source + typed invariants; name-only/fixture ≠ WebGL/native/audio/editor/reward/save/A-grade (root-owned).' };
}
