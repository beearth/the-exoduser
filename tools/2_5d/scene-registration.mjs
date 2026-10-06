// ROOT-ADOPTED derivative for the isolated 3387 lab. No editor provider is supplied here:
// pin/canonical/projection VERIFIED does not promote editorRoundtrip PENDING to acceptance.
export const SCENE_REGISTRATION_PROVENANCE = Object.freeze({
  status:'ROOT-ADOPTED', role:'MAP',
  endId:'CH1-2_5D-STRICT-CONSUMER-FIX-20261006-MAP-V3-CANDIDATE',
  source:'tools/team-followup-20261006/hell-rift/MAP/scene-roundtrip-2_5d.v3.candidate.mjs',
  sourceBytes:11746, sourceSha256:'e10b79849bdf34230daaaab6c976a759229ee14953ed9d6f467f65e333de555c',
  rootAdaptation:'async save/import + FORMAT_VERIFIED separate from actual browser evidence',
  adaptationGoal:'CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006'
});

import '../map-scene-core.js';
import { residentPaintingProfile, residentDialogueAnchors } from '../map-scene-rift-residents.mjs';
import { RIFT_TERRAIN } from './rift-terrain.mjs';

const K = globalThis.MapSceneCore;
const EPS = 1e-6;
const finite = (n, label) => { if (typeof n !== 'number' || !Number.isFinite(n)) throw new Error(label + ' 유한수 오류'); return n; };

/* Fix 3: respect byteOffset/byteLength so only the exact view is hashed. */
function viewBuffer(bytes) {
  if (bytes instanceof ArrayBuffer) return bytes;
  if (ArrayBuffer.isView(bytes)) return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  return new Uint8Array(bytes).buffer;
}
async function sha256hex(bytes, hasher) {
  if (typeof hasher === 'function') return hasher(bytes);
  if (globalThis.crypto?.subtle) return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', viewBuffer(bytes))), b => b.toString(16).padStart(2, '0')).join('');
  throw new Error('hash provider 없음');
}
export async function verifyBytes(bytes, pin, hasher) {
  let sha;
  try { sha = await sha256hex(bytes, hasher); } catch (e) { return { status: 'UNKNOWN', reason: e.message, sha: null, pin }; }
  if (sha !== pin) return { status: 'FAIL', reason: 'SHA256 불일치', sha, pin };
  return { status: 'VERIFIED', sha, pin };
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return a === b;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (const k of ka) { if (!Object.hasOwn(b, k) || !deepEqual(a[k], b[k])) return false; }
  return true;
}
function firstDiff(a, b, path = '') {
  if (deepEqual(a, b)) return null;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return path || '(root)';
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) { if (!deepEqual(a?.[k], b?.[k])) { const sub = firstDiff(a?.[k], b?.[k], path ? path + '.' + k : k); if (sub) return sub; } }
  return path || '(root)';
}

/* Fix 1: deep-compare the entire protected payload against canonical; count match with any tampered field = FAIL. */
const PROTECTED_KEYS = ['world', 'walkable', 'start', 'exit', 'sourcePins', 'assets', 'layers', 'residentLayerReview'];
export function compareToCanonical(scene, canonical) {
  const a = K.validate(scene), b = K.validate(canonical), diffs = [];
  // walkable identity (not just length/count)
  if (a.walkable.length !== b.walkable.length) diffs.push('walkable length ' + a.walkable.length + '≠' + b.walkable.length);
  else { let n = 0; for (let i = 0; i < a.walkable.length; i++) if (a.walkable[i] !== b.walkable[i]) n++; if (n) diffs.push('walkable ' + n + ' tiles differ (count match ≠ identity)'); }
  for (const key of PROTECTED_KEYS) {
    if (key === 'walkable') continue;
    if (!deepEqual(a[key], b[key])) diffs.push(key + ' changed @ ' + firstDiff(a[key], b[key], key));
  }
  return { ok: diffs.length === 0, diffs };
}

export function transformSupport(scene) {
  const p = K.validate(scene), unsupported = [];
  for (const o of (p.layers.find(l => l.id === 'foot')?.objects || [])) {
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
function footMasks(p) {
  return (p.layers.find(l => l.id === 'foot')?.objects || [])
    .filter(o => o.mask && o.id.startsWith('obj-') && !o.id.startsWith('obj-resident-'))
    .map(o => ({ objectId: o.id, x: o.x, y: o.y, width: o.width, height: o.height, pivotY: o.pivotY, mask: o.mask }));
}
function registrationPoints(p) {
  const pts = [{ id: 'start', x: p.start.x, y: p.start.y }, { id: 'exit', x: p.exit.x, y: p.exit.y }, ...(residentDialogueAnchors(p) || []).map(r => ({ id: r.npcId, x: r.x, y: r.y }))];
  for (const f of footMasks(p)) f.mask.forEach(([mx, my], i) => pts.push({ id: f.objectId + '#' + i, x: f.x + mx * f.width, y: (f.y - f.height * f.pivotY) + my * f.height }));
  return pts;
}
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

/* Fix 2: pristine baseline; throwaway clone to provider; compare reloaded vs baseline; flag input mutation. */
export async function editorRoundtrip(baseline, editorProvider = null) {
  if (!editorProvider || typeof editorProvider.save !== 'function' || typeof editorProvider.load !== 'function')
    return { status: 'PENDING', reason: 'editor save/import/export provider 없음', kind: 'editor' };
  try {
    const passed = K.clone(baseline);
    const saved = await editorProvider.save(passed);
    if (!deepEqual(passed, baseline)) return { status: 'FAIL', kind: 'editor', reason: 'provider.save 가 입력을 변조함 (input mutation)' };
    const reloaded = await editorProvider.load(saved);
    const cmp = compareToCanonical(reloaded, baseline);         // against pristine baseline, never a mutated one
    // Format-only providers cannot establish that the real browser editor exported/imported.
    const proof=editorProvider.evidence;
    const actual=typeof saved==='string' && editorProvider.kind==='browser-export-import' && proof?.actualDownload===true
      && proof?.actualImport===true && proof?.isolatedContext===true
      && proof?.url==='http://127.0.0.1:3387/editor.html' && typeof proof?.artifactSha256==='string'
      && /^[a-f0-9]{64}$/.test(proof.artifactSha256);
    if(actual && await sha256hex(new TextEncoder().encode(saved))!==proof.artifactSha256)
      return {status:'FAIL',kind:'editor',reason:'export artifact SHA256 불일치',realEditor:false};
    return { status: cmp.ok ? (actual?'VERIFIED':'FORMAT_VERIFIED') : 'FAIL', kind:'editor',
      realEditor:actual, evidence:actual?structuredClone(proof):null, diffs:cmp.diffs };
  } catch (e) { return { status: 'FAIL', kind: 'editor', reason: e.message }; }
}

function inferredTrialGeometry(p) {
  const abyss = p.layers.find(l => l.id === 'abyss')?.objects.find(o => o.sourceParallax !== undefined);
  return [
    ...(abyss ? [{ objectId: abyss.id, kind: 'abyss-depth', authoredDepth: RIFT_TERRAIN.authoredDepth, physicalHeight: 'UNKNOWN' }] : []),
    ...footMasks(p).map(f => ({ objectId: f.objectId, kind: 'foreground-cutout', physicalHeight: 'UNKNOWN' }))
  ];
}

export async function assessRegistration(scene, { canonicalBytes = null, hasher = null, editorProvider = null, angle = 50, scale = 400 } = {}) {
  const baseline = K.clone(K.validate(scene));                  // pristine validated baseline (input never mutated)
  const result = {
    completionId: 'CH1-2_5D-STRICT-CONSUMER-FIX-20261006-MAP-V3-CANDIDATE',
    pin: { status: 'UNKNOWN', reason: 'canonicalBytes 미제공' },
    canonicalCompare: { status: 'UNKNOWN', reason: 'canonicalBytes 미제공' },
    transforms: transformSupport(baseline),
    projectionRoundtrip: projectionRoundtrip(baseline, { angle, scale }),
    editorRoundtrip: await editorRoundtrip(baseline, editorProvider),
    profileValid: !!residentPaintingProfile(baseline),
    walkableCount: baseline.walkable.filter(Boolean).length,
    inferred_trial_geometry: inferredTrialGeometry(baseline),
    physicalHeight: 'UNKNOWN', nativeAccepted: false, visualAssessed: false
  };
  if (canonicalBytes) {
    result.pin = await verifyBytes(canonicalBytes, RIFT_TERRAIN.sceneSha256, hasher);
    if (result.pin.status === 'VERIFIED') {
      try {
        const canonical = JSON.parse(new TextDecoder().decode(canonicalBytes));
        const cmp = compareToCanonical(baseline, canonical);
        result.canonicalCompare = { ...cmp, status: cmp.ok ? 'VERIFIED' : 'FAIL' };
        result.sourceSceneSha256 = result.pin.sha;              // exposed only after VERIFIED
      } catch (e) { result.canonicalCompare = { status: 'FAIL', reason: 'canonical 비교 실패: ' + e.message }; }
    } else {
      result.canonicalCompare = { status: 'UNVERIFIED', reason: 'canonical bytes 미검증(pin ' + result.pin.status + ') — 비교 생략, SHA 비노출' };
    }
  }
  result.ok = result.pin.status === 'VERIFIED' && result.canonicalCompare.status === 'VERIFIED'
    && result.transforms.ok && result.projectionRoundtrip.ok && result.profileValid && result.walkableCount === 1192
    && result.editorRoundtrip.status !== 'FAIL';                // editor FAIL ⇒ ok=false; PENDING is distinct (not a failure)
  return result;
}

export const SCENE_ROUNDTRIP_2_5D_V3 = Object.freeze({
  completionId: 'CH1-2_5D-STRICT-CONSUMER-FIX-20261006-MAP-V3-CANDIDATE',
  supersedes: 'scene-roundtrip-2_5d.v2.candidate.mjs (kept as history)',
  scene: RIFT_TERRAIN.scene, pin: RIFT_TERRAIN.sceneSha256 + ' (verify before trusting)',
  fixes: ['full protected-payload deep compare (sourcePins/assets/layers/opacity/crop/abyss)', 'editor FAIL in ok + baseline-not-mutated + save-mutation flag', 'SHA respects byteOffset/byteLength'],
  mutates: 'none — read-only; adoption/visual/native/A-grade are root-owned gates',
  physicalHeight: 'UNKNOWN (inferred_trial_geometry for height-less cliffs)'
});
