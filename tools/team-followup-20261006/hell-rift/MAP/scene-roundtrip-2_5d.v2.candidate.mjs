/* MAP 2.5D scene↔editor roundtrip consumer v2 — CH1-2_5D-CONSUMER-CORRECTION-20261006-MAP-V2-CANDIDATE
 *
 * Read-only. Writes NO source pixels / scene / nav / editor history / gameplay save. Supersedes v1
 * (scene-roundtrip-2_5d.candidate.mjs, kept as history) with three corrections from root's semantic review:
 *   1) Canonical deep compare: nav ARRAY identity + start/exit/world + 4 resident feet (order/npcId/x/y/height)
 *      + 3 foreground masks (objectId/footY/x/y/w/h/pivot/polygon vertices). A count-only match with tampered
 *      values is fail-closed.
 *   2) No unconditional SHA: `sourceSceneSha256` is exposed ONLY after the real canonical bytes hash to the pin
 *      (status VERIFIED). No provider → UNKNOWN; mismatch → FAIL. No VERIFIED claim before hashing.
 *   3) Projection roundtrip (pure math) and editor save/import/export roundtrip are SEPARATE results; no editor
 *      provider → PENDING. rotation/flipX/non-foot-pivot transforms are unsupported → fail-closed/UNKNOWN.
 *      Height-less depth stays inferred_trial_geometry (physicalHeight UNKNOWN).
 *
 * Grounded (no fabrication): MapSceneCore.validate/canWalk (tools/map-scene-core.js:50,110);
 *   residentPaintingProfile/residentDialogueAnchors (tools/map-scene-rift-residents.mjs:27,53);
 *   RIFT_TERRAIN + worldToScene/sceneToWorld (tools/2_5d/rift-terrain.mjs:7,52,60-64).
 */
import '../../../map-scene-core.js';
import { residentPaintingProfile, residentDialogueAnchors } from '../../../map-scene-rift-residents.mjs';
import { RIFT_TERRAIN } from '../../../2_5d/rift-terrain.mjs';

const K = globalThis.MapSceneCore;
const EPS = 1e-6;
const finite = (n, label) => { if (typeof n !== 'number' || !Number.isFinite(n)) throw new Error(label + ' 유한수 오류'); return n; };

async function sha256hex(bytes, hasher) {
  if (typeof hasher === 'function') return hasher(bytes);
  if (globalThis.crypto?.subtle) {
    const buf = bytes instanceof ArrayBuffer ? bytes : (bytes.buffer ?? new Uint8Array(bytes).buffer);
    return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', buf)), b => b.toString(16).padStart(2, '0')).join('');
  }
  throw new Error('hash provider 없음');
}

/* VERIFIED only on real hash match; UNKNOWN if no provider; FAIL on mismatch. Never VERIFIED before hashing. */
export async function verifyBytes(bytes, pin, hasher) {
  let sha;
  try { sha = await sha256hex(bytes, hasher); } catch (e) { return { status: 'UNKNOWN', reason: e.message, sha: null, pin }; }
  if (sha !== pin) return { status: 'FAIL', reason: 'SHA256 불일치', sha, pin };
  return { status: 'VERIFIED', sha, pin };
}

function footMasks(p) {
  const foot = p.layers.find(l => l.id === 'foot');
  return (foot?.objects || [])
    .filter(o => o.mask && o.id.startsWith('obj-') && !o.id.startsWith('obj-resident-'))
    .map(o => ({ objectId: o.id, x: o.x, y: o.y, width: o.width, height: o.height, pivotX: o.pivotX, pivotY: o.pivotY, rotation: o.rotation, flipX: o.flipX, mask: o.mask }));
}

/* Deep field compare against the canonical (parsed) scene — fail-closed on identity, not count. */
export function compareToCanonical(scene, canonical) {
  const a = K.validate(scene), b = K.validate(canonical), diffs = [];
  if (a.walkable.length !== b.walkable.length) diffs.push('walkable length ' + a.walkable.length + '≠' + b.walkable.length);
  else { let n = 0; for (let i = 0; i < a.walkable.length; i++) if (a.walkable[i] !== b.walkable[i]) n++; if (n) diffs.push('walkable ' + n + ' tiles differ (count match ≠ identity)'); }
  for (const k of ['cols', 'rows', 'tileSize']) if (a.world[k] !== b.world[k]) diffs.push('world.' + k);
  for (const k of ['start', 'exit']) if (a[k].x !== b[k].x || a[k].y !== b[k].y) diffs.push(k + ' moved');
  const ra = residentDialogueAnchors(a) || [], rb = residentDialogueAnchors(b) || [];
  if (ra.length !== rb.length) diffs.push('resident count ' + ra.length + '≠' + rb.length);
  else for (let i = 0; i < ra.length; i++) {
    if (ra[i].npcId !== rb[i].npcId) diffs.push('resident[' + i + '] order/npcId ' + ra[i].npcId + '≠' + rb[i].npcId);
    if (ra[i].x !== rb[i].x || ra[i].y !== rb[i].y) diffs.push(ra[i].npcId + ' foot moved');
    if (ra[i].labelHeight !== rb[i].labelHeight) diffs.push(ra[i].npcId + ' height changed');
  }
  const fa = footMasks(a), fb = footMasks(b);
  if (fa.length !== fb.length) diffs.push('foreground count ' + fa.length + '≠' + fb.length);
  else for (let i = 0; i < fa.length; i++) {
    const x = fa[i], y = fb[i];
    if (x.objectId !== y.objectId) diffs.push('foreground[' + i + '] order/id');
    for (const k of ['x', 'y', 'width', 'height', 'pivotX', 'pivotY', 'rotation', 'flipX']) if (x[k] !== y[k]) diffs.push(x.objectId + '.' + k + ' changed');
    if (x.mask.length !== y.mask.length) diffs.push(x.objectId + ' mask vertex count');
    else for (let j = 0; j < x.mask.length; j++) if (x.mask[j][0] !== y.mask[j][0] || x.mask[j][1] !== y.mask[j][1]) diffs.push(x.objectId + ' mask vertex[' + j + '] moved');
  }
  return { ok: diffs.length === 0, diffs };
}

/* rotation/flipX/non-foot pivot are unsupported by the fixed-angle projection → fail-closed/UNKNOWN. */
export function transformSupport(scene) {
  const p = K.validate(scene), unsupported = [];
  const foot = p.layers.find(l => l.id === 'foot');
  for (const o of (foot?.objects || [])) {
    if (o.rotation !== 0) unsupported.push(o.id + ' rotation≠0 (UNKNOWN)');
    if (o.flipX) unsupported.push(o.id + ' flipX (UNKNOWN)');
    if (!o.id.startsWith('obj-resident-') && (o.pivotX !== 0 || o.pivotY !== 1)) unsupported.push(o.id + ' non-foot pivot (UNKNOWN)');
    if (o.id.startsWith('obj-resident-') && (o.pivotX !== 0.5 || o.pivotY !== 1)) unsupported.push(o.id + ' resident non-foot pivot (UNKNOWN)');
  }
  return { ok: unsupported.length === 0, unsupported };
}

export function projection({ angle = 50, scale = 400, centre = RIFT_TERRAIN.centre } = {}) {
  finite(angle, '카메라 각도'); finite(scale, '지형 배율');
  if (angle < 10 || angle > 85 || scale <= 0 || scale > 32000) throw new Error('지형 카메라/배율 범위 오류');
  const theta = angle * Math.PI / 180, sin = Math.sin(theta), cos = Math.cos(theta);
  const worldToScene = (x, y, h = 0) => ({ x: (finite(x, 'world x') - centre.x) / scale, y: finite(h, '높이') / scale, z: ((finite(y, 'world y') - centre.y) + h * cos) / (scale * sin) });
  const sceneToWorld = (v) => ({ x: centre.x + finite(v.x, 'scene x') * scale, y: centre.y + (finite(v.z, 'scene z') * sin - finite(v.y, 'scene y') * cos) * scale, h: v.y * scale });
  return { angle, scale, centre: { ...centre }, theta, sin, cos, worldToScene, sceneToWorld };
}

function registrationPoints(p) {
  const res = residentDialogueAnchors(p) || [];
  const pts = [{ id: 'start', x: p.start.x, y: p.start.y }, { id: 'exit', x: p.exit.x, y: p.exit.y }, ...res.map(r => ({ id: r.npcId, x: r.x, y: r.y }))];
  for (const f of footMasks(p)) f.mask.forEach(([mx, my], i) => pts.push({ id: f.objectId + '#' + i, x: f.x + mx * f.width, y: (f.y - f.height * f.pivotY) + my * f.height }));
  return pts;
}

/* Pure-math world↔scene projection roundtrip (ground h=0). Always computable. */
export function projectionRoundtrip(scene, opts = {}) {
  const p = K.validate(scene), proj = projection(opts), issues = [];
  let maxRoundtripWorldError = 0;
  for (const pt of registrationPoints(p)) {
    const back = proj.sceneToWorld(proj.worldToScene(pt.x, pt.y, 0));
    const err = Math.max(Math.abs(back.x - pt.x), Math.abs(back.y - pt.y));
    if (err > maxRoundtripWorldError) maxRoundtripWorldError = err;
    if (err > EPS) issues.push('projection roundtrip ' + pt.id + ' Δ' + err.toFixed(6));
  }
  return { ok: issues.length === 0, kind: 'projection', projection: { angle: proj.angle, scale: proj.scale, centre: proj.centre }, maxRoundtripWorldError, issues };
}

/* Editor save→import→export roundtrip. Requires a real editor provider {save, load}; otherwise PENDING. */
export function editorRoundtrip(scene, editorProvider = null) {
  if (!editorProvider || typeof editorProvider.save !== 'function' || typeof editorProvider.load !== 'function')
    return { status: 'PENDING', reason: 'editor save/import/export provider 없음', kind: 'editor' };
  try {
    const saved = editorProvider.save(scene), reloaded = editorProvider.load(saved);
    const cmp = compareToCanonical(reloaded, scene);
    return { status: cmp.ok ? 'VERIFIED' : 'FAIL', kind: 'editor', diffs: cmp.diffs };
  } catch (e) { return { status: 'FAIL', kind: 'editor', reason: e.message }; }
}

function inferredTrialGeometry(p) {
  const abyss = p.layers.find(l => l.id === 'abyss')?.objects.find(o => o.sourceParallax !== undefined);
  return [
    ...(abyss ? [{ objectId: abyss.id, kind: 'abyss-depth', authoredDepth: RIFT_TERRAIN.authoredDepth, physicalHeight: 'UNKNOWN' }] : []),
    ...footMasks(p).map(f => ({ objectId: f.objectId, kind: 'foreground-cutout', physicalHeight: 'UNKNOWN' }))
  ];
}

/* Top-level assessment. canonicalBytes = raw bytes of the pinned scene (fetch/fs); editorProvider optional. */
export async function assessRegistration(scene, { canonicalBytes = null, hasher = null, editorProvider = null, angle = 50, scale = 400 } = {}) {
  const p = K.validate(scene);
  const result = {
    completionId: 'CH1-2_5D-CONSUMER-CORRECTION-20261006-MAP-V2-CANDIDATE',
    pin: { status: 'UNKNOWN', reason: 'canonicalBytes 미제공' },
    canonicalCompare: { status: 'UNKNOWN', reason: 'canonicalBytes 미제공' },
    transforms: transformSupport(scene),
    projectionRoundtrip: projectionRoundtrip(scene, { angle, scale }),
    editorRoundtrip: editorRoundtrip(scene, editorProvider),
    profileValid: !!residentPaintingProfile(p),
    walkableCount: p.walkable.filter(Boolean).length,
    inferred_trial_geometry: inferredTrialGeometry(p),
    physicalHeight: 'UNKNOWN', nativeAccepted: false, visualAssessed: false
  };
  if (canonicalBytes) {
    result.pin = await verifyBytes(canonicalBytes, RIFT_TERRAIN.sceneSha256, hasher);
    if (result.pin.status === 'VERIFIED') {
      // Only parse+compare canonical whose bytes are hash-VERIFIED (trusted). Fail-closed on any parse/compare error.
      try {
        const canonical = JSON.parse(new TextDecoder().decode(canonicalBytes));
        const cmp = compareToCanonical(scene, canonical);
        result.canonicalCompare = { ...cmp, status: cmp.ok ? 'VERIFIED' : 'FAIL' };
        result.sourceSceneSha256 = result.pin.sha; // SHA exposed only after VERIFIED
      } catch (e) { result.canonicalCompare = { status: 'FAIL', reason: 'canonical 비교 실패: ' + e.message }; }
    } else {
      result.canonicalCompare = { status: 'UNVERIFIED', reason: 'canonical bytes 미검증(pin ' + result.pin.status + ') — 비교 생략, SHA 비노출' };
    }
  }
  result.ok = result.pin.status === 'VERIFIED' && result.canonicalCompare.status === 'VERIFIED'
    && result.transforms.ok && result.projectionRoundtrip.ok && result.profileValid && result.walkableCount === 1192;
  return result;
}

export const SCENE_ROUNDTRIP_2_5D_V2 = Object.freeze({
  completionId: 'CH1-2_5D-CONSUMER-CORRECTION-20261006-MAP-V2-CANDIDATE',
  supersedes: 'scene-roundtrip-2_5d.candidate.mjs (v1, preserved)',
  scene: RIFT_TERRAIN.scene, pin: RIFT_TERRAIN.sceneSha256 + ' (verify before trusting)',
  corrections: ['canonical deep compare (identity not count)', 'SHA exposed only when VERIFIED', 'projection vs editor roundtrip separated; editor PENDING without provider; rotation/flip/pivot fail-closed'],
  mutates: 'none — read-only; adoption/visual/native/A-grade are root-owned gates',
  physicalHeight: 'UNKNOWN (inferred_trial_geometry for height-less cliffs)'
});
