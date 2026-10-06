/*
 * rift-retouch-consumer-acceptance-2_5d.candidate.mjs
 * COMMON_GOAL CH1-RIFT-QUALITY-NOW-20261007 · ROLE QA · CANDIDATE (not acceptance).
 * OFFICIAL_COMPLETION_ID: CH1-RIFT-QUALITY-NOW-20261007-RETOUCH-GATES-CANDIDATE
 *
 * READONLY retouch-gate predicates for the new rift consumers. Every verdict is fail-closed:
 * a PASS REQUIRES a real observation field; absent observation ⇒ PENDING (never PASS). It drives no
 * browser, imports nothing from WIP root modules, and mutates nothing. A source trace is NOT an
 * editor/screen/native/listen/save/本編/IK/A-grade PASS (CH1_2_5D_PRODUCTION_GOALS 2026-10-08 Gate:
 * current VISUAL VERDICT = RETOUCH; fixture/lab does not pass the Gate). Map rules below follow
 * EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9 §13 (visual/collision separation) and GATE 4 (line 739).
 *
 * UNIT 1 — consumer registration / lifetime / observation-basis predicates.
 * UNIT 2 — counterexamples: real-editor-vs-format/echo · async reject · original-raw tampering ·
 *          nav/material leak · boundary & special-motion UNKNOWN · attack residue.
 *
 * Anchors (read-only): MapSceneCore.validate throws on an invalid scene (map-scene-core.js:84);
 * rig update() mode contract idle|walk|run|attack + direction 0..7 (character-rigs.mjs:132), attack
 * pose branch (character-rigs.mjs:123-128); createRiftPersistentActions is sync-only, thenable→BLOCKED
 * (rift-persistent-actions candidate); terrain clip/bounds + canWalk(x,y,r) (rift-terrain.mjs:123-124).
 *
 * Run (self-check meta-asserts the predicates; exits nonzero if any predicate misbehaves):
 *   node tools/team-followup-20261007/hell-rift/QA/rift-retouch-consumer-acceptance-2_5d.candidate.mjs
 */

const num = v => typeof v === 'number' && Number.isFinite(v);
const isThenable = v => v && (typeof v === 'object' || typeof v === 'function') && typeof v.then === 'function';
const F = (cls, detail) => ({ pass: false, cls, detail });
const P = (cls, detail) => ({ pass: true, cls, detail });
const PEND = (cls, detail) => ({ pass: null, cls, detail });

export const RETOUCH = Object.freeze({
  motions: Object.freeze(['idle', 'walk', 'run', 'attack']),   // character-rigs.mjs:132
  directions: 8,
  endId: 'CH1-RIFT-QUALITY-NOW-20261007-RETOUCH-GATES-CANDIDATE',
});

// ── UNIT 1 ──────────────────────────────────────────────────────────────────
// registration: a consumer counts as registered only when it is the non-null factory return with
// its declared method set. null (unsupported scene / missing module) ⇒ NOT registered ⇒ PENDING.
export function checkRegistration(consumer, requiredMethods = []) {
  if (consumer === undefined) return PEND('registration', 'no consumer observation supplied — PENDING');
  if (consumer === null) return PEND('registration', 'factory returned null (unsupported scene / module absent) — not registered, PENDING (not PASS)');
  if (typeof consumer !== 'object') return F('registration', `consumer is ${typeof consumer}, not a factory object`);
  const missing = requiredMethods.filter(m => typeof consumer[m] !== 'function');
  return missing.length ? F('registration', `registered object missing method(s): ${missing.join(', ')}`)
                        : P('registration', `registered with methods [${requiredMethods.join(',')}]`);
}

// lifetime: a consumer must expose teardown and be torn down on scene-switch/dispose. Needs a
// before/after observation; a consumer still live after teardown ⇒ FAIL.
export function checkLifetime(consumer, afterTeardown) {
  if (consumer === undefined || consumer === null) return PEND('lifetime', 'no live consumer to observe — PENDING');
  const hasTeardown = typeof consumer.dispose === 'function' || typeof consumer.close === 'function';
  if (!hasTeardown) return F('lifetime', 'consumer exposes no dispose()/close() teardown');
  if (afterTeardown === undefined) return PEND('lifetime', 'teardown-after observation not supplied (e.g. {disposed} / isOpen) — PENDING');
  const live = afterTeardown.disposed === false || afterTeardown.isOpen === true;
  return live ? F('lifetime', `consumer still live after teardown (${JSON.stringify(afterTeardown)})`)
              : P('lifetime', 'torn down after scene-switch/dispose');
}

// observation-basis: enforce that a PASS is backed by a real observation, else PENDING.
export function requireObservation(value, cls, label) {
  return value === undefined || value === null ? PEND(cls, `${label}: no real observation — PENDING (not PASS)`) : null;
}

// ── UNIT 2 counterexamples ────────────────────────────────────────────────────
// real editor vs format/echo: a real editor load REJECTS a structurally-invalid scene
// (MapSceneCore.validate throws, map-scene-core.js:84); an echo/format-mirror returns it.
export function checkRealEditorNotEcho(editorPort) {
  if (!editorPort || typeof editorPort.load !== 'function') return PEND('editor-vs-echo', 'editorPort.load not supplied — PENDING');
  const invalid = { format: 'NOT-exoduser-map-scene', version: 999 };
  let rejected = false, threw = null;
  try { const r = editorPort.load(invalid); rejected = (r === null || r === undefined); }
  catch (e) { rejected = true; threw = e.message; }
  return rejected ? P('editor-vs-echo', `real editor rejects invalid scene${threw ? ` (threw: ${threw})` : ''}`)
                  : F('editor-vs-echo', 'load accepted a structurally-invalid scene → format/echo mock, not the real editor');
}

// async reject: a sync-contract consumer result must never be a thenable; a thenable ⇒ BLOCKED,
// and a resolved thenable is NOT a PASS (cannot confirm durability synchronously).
export function checkAsyncReject(consumerResult) {
  if (consumerResult === undefined) return PEND('async-reject', 'no consumer result observed — PENDING');
  if (isThenable(consumerResult)) return F('async-reject', 'consumer returned a thenable — sync contract requires BLOCKED/fail-closed, a Promise is never read as success');
  return P('async-reject', 'consumer result is sync (no thenable)');
}

// original-raw tampering: pinned source bytes (PNG/scene sha) must be identical before/after.
export function checkOriginalIntegrity(beforePins, afterPins) {
  if (!beforePins || !afterPins) return PEND('original-integrity', 'before/after source pins not supplied — PENDING');
  const changed = [];
  for (const k of Object.keys(beforePins)) if (afterPins[k] !== beforePins[k]) changed.push(`${k}: ${String(beforePins[k]).slice(0, 8)}→${String(afterPins[k]).slice(0, 8)}`);
  return changed.length ? F('original-integrity', `source raw tampered: ${changed.join(', ')}`)
                        : P('original-integrity', `${Object.keys(beforePins).length} source pins unchanged`);
}

// nav/material leak: drawn material must stay inside the clip and never paint a non-walkable contact
// cell (guideline §13 / GATE 4, line 739). drawnExtents: {left,right,top,bottom} world px.
export function checkNavMaterialLeak(drawnExtents, clip, offenders) {
  if (!drawnExtents || !clip) return PEND('nav-material-leak', 'drawn extents / clip bounds not observed — PENDING');
  const out = [];
  if (drawnExtents.left < clip.left || drawnExtents.right > clip.right || drawnExtents.top < clip.top || drawnExtents.bottom > clip.bottom)
    out.push(`material extent ${JSON.stringify(drawnExtents)} exceeds clip ${JSON.stringify(clip)}`);
  if (Array.isArray(offenders) && offenders.length) out.push(`${offenders.length} material pixel(s) on non-walkable contact cells: ${offenders.slice(0, 4).map(o => `(${o.x},${o.y})`).join(' ')}`);
  return out.length ? F('nav-material-leak', out.join(' | ')) : P('nav-material-leak', 'drawn material within clip; no paint on non-walkable contact cells');
}

// boundary & special-motion: a mode outside idle/walk/run/attack, direction outside 0..7, or a world
// position outside bounds is UNKNOWN — reported PENDING; a consumer that claimed PASS on them ⇒ FAIL.
export function checkMotionBoundary(sample, bounds, claimedPass = false) {
  if (!sample) return PEND('motion-boundary', 'no motion/position sample — PENDING');
  const reasons = [];
  if (!RETOUCH.motions.includes(sample.mode)) reasons.push(`special/unknown motion '${sample.mode}'`);
  if (!Number.isInteger(sample.direction) || sample.direction < 0 || sample.direction >= RETOUCH.directions) reasons.push(`direction ${sample.direction} out of 0..7`);
  if (bounds && num(sample.x) && num(sample.y) && (sample.x < bounds.left || sample.x > bounds.right || sample.y < bounds.top || sample.y > bounds.bottom)) reasons.push(`position (${sample.x},${sample.y}) outside bounds`);
  if (!reasons.length) return P('motion-boundary', `${sample.mode}/d${sample.direction} within contract`);
  return claimedPass ? F('motion-boundary', `consumer claimed PASS on UNKNOWN: ${reasons.join('; ')}`)
                     : PEND('motion-boundary', `UNKNOWN (not PASS): ${reasons.join('; ')}`);
}

// attack residue: after attack ends (mode left attack, or attack phase complete) no attack hitbox /
// VFX / held attack pose may persist (10-08 Gate SKILL unit "이전 공격 잔존0"; pose branch character-rigs.mjs:123-128).
export function checkAttackResidue(postAttack) {
  if (!postAttack) return PEND('attack-residue', 'no post-attack snapshot — PENDING');
  if (postAttack.mode === 'attack' && postAttack.attackComplete !== true) return PEND('attack-residue', 'still mid-attack — PENDING (observe after attack ends)');
  const residue = [];
  if (postAttack.attackActive === true) residue.push('attackActive');
  if (postAttack.hitboxActive === true) residue.push('hitboxActive');
  if (postAttack.attackVfxAlive === true) residue.push('attackVfxAlive');
  if (postAttack.attackPoseHeld === true) residue.push('attackPoseHeld');
  if (postAttack.heldKeys && Array.isArray(postAttack.heldKeys) && postAttack.heldKeys.length) residue.push(`heldKeys[${postAttack.heldKeys.join(',')}]`);
  return residue.length ? F('attack-residue', `attack residue after end: ${residue.join(', ')}`)
                        : P('attack-residue', 'attack state cleared (neutral idle/facing, no hitbox/VFX/held)');
}

export function runRetouchGates(i = {}) {
  const sections = {
    registration: [checkRegistration(i.consumer, i.requiredMethods || [])],
    lifetime: [checkLifetime(i.consumer, i.afterTeardown)],
    'editor-vs-echo': [checkRealEditorNotEcho(i.editorPort)],
    'async-reject': [checkAsyncReject(i.consumerResult)],
    'original-integrity': [checkOriginalIntegrity(i.beforePins, i.afterPins)],
    'nav-material-leak': [checkNavMaterialLeak(i.drawnExtents, i.clip, i.navOffenders)],
    'motion-boundary': [checkMotionBoundary(i.motionSample, i.bounds, i.claimedPass)],
    'attack-residue': [checkAttackResidue(i.postAttack)],
  };
  let fail = 0, pass = 0, pending = 0;
  for (const rows of Object.values(sections)) for (const r of rows) r.pass === false ? fail++ : r.pass === true ? pass++ : pending++;
  return { endId: RETOUCH.endId, sections, totals: { fail, pass, pending }, boundary: 'READONLY source predicate — real observation required; fixture/lab ≠ editor/screen/native/listen/save/本編/IK/A-grade (root-owned).' };
}

// ── Node self-check: meta-assert each predicate yields the EXPECTED verdict ──
const isMain = (() => { try { return import.meta.url === new URL(`file://${process.argv[1]}`).href; } catch { return false; } })();
if (isMain) {
  const expect = []; const E = (want, got, label) => expect.push({ ok: got.pass === want, want, got: got.pass, label, detail: got.detail });
  // UNIT1
  E(null, checkRegistration(null, ['draw']), 'registration null→PENDING');
  E(true, checkRegistration({ draw() {}, dispose() {} }, ['draw', 'dispose']), 'registration ok→PASS');
  E(false, checkRegistration({ draw() {} }, ['draw', 'dispose']), 'registration missing method→FAIL');
  E(false, checkLifetime({ dispose() {} }, { disposed: false }), 'lifetime still-live→FAIL');
  E(true, checkLifetime({ dispose() {} }, { disposed: true }), 'lifetime torn-down→PASS');
  E(null, checkLifetime({ dispose() {} }, undefined), 'lifetime no-obs→PENDING');
  // UNIT2
  E(true, checkRealEditorNotEcho({ load: () => { throw new Error('EXODUSER 씬 v1 파일이 아닙니다'); } }), 'editor rejects invalid→PASS');
  E(false, checkRealEditorNotEcho({ load: x => x }), 'echo returns invalid→FAIL');
  E(null, checkRealEditorNotEcho(null), 'editor no-port→PENDING');
  E(false, checkAsyncReject(Promise.resolve(true)), 'thenable→FAIL');
  E(true, checkAsyncReject({ applied: true }), 'sync result→PASS');
  E(false, checkOriginalIntegrity({ png: 'aaaa1111' }, { png: 'bbbb2222' }), 'raw tampered→FAIL');
  E(true, checkOriginalIntegrity({ png: 'aaaa1111' }, { png: 'aaaa1111' }), 'raw unchanged→PASS');
  E(null, checkOriginalIntegrity(null, null), 'raw no-pins→PENDING');
  E(false, checkNavMaterialLeak({ left: -10, right: 8000, top: 0, bottom: 8000 }, { left: 0, right: 8000, top: 0, bottom: 8000 }), 'material past clip→FAIL');
  E(true, checkNavMaterialLeak({ left: 10, right: 7990, top: 10, bottom: 7990 }, { left: 0, right: 8000, top: 0, bottom: 8000 }, []), 'material within clip→PASS');
  E(null, checkNavMaterialLeak(null, null), 'leak no-obs→PENDING');
  E(null, checkMotionBoundary({ mode: 'transform', direction: 0 }, null, false), 'special motion→PENDING');
  E(false, checkMotionBoundary({ mode: 'transform', direction: 0 }, null, true), 'special motion claimed PASS→FAIL');
  E(true, checkMotionBoundary({ mode: 'walk', direction: 3 }, null, false), 'normal motion→PASS');
  E(false, checkAttackResidue({ mode: 'idle', attackActive: true }), 'attack residue→FAIL');
  E(true, checkAttackResidue({ mode: 'idle', attackActive: false, hitboxActive: false }), 'attack cleared→PASS');
  E(null, checkAttackResidue(null), 'attack no-obs→PENDING');

  const bad = expect.filter(e => !e.ok);
  for (const e of expect) console.log(`  [${e.ok ? 'OK ' : 'XX '}] ${e.label} — want ${e.want} got ${e.got}`);
  console.log(`\nmeta: ${expect.length - bad.length}/${expect.length} predicates behaved as expected`);
  console.log('Boundary: ' + runRetouchGates({}).boundary);
  process.exit(bad.length ? 1 : 0);
}
