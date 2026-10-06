// ROOT-ADOPTED read-only derivative; immutable submitted v3 and its official end remain preserved.
// P2 corrected here: finite positive referenceHeight and asset dimensions; Node self-check excluded.
// Observations measure the actor's mapped origin, not the skinned heel/pixels or IK contact.
export const SLICE_ACCEPTANCE_PROVENANCE = Object.freeze({
  status:'ROOT-ADOPTED', role:'QA',
  endId:'CH1-2_5D-STRICT-CONSUMER-FIX-20261006-QA-V3-CANDIDATE',
  source:'tools/team-followup-20261006/hell-rift/QA/slice-acceptance-2_5d.v3.candidate.mjs',
  sourceBytes:13173, sourceSha256:'d5be0daa4a4581be086840a97a5b9678775d216706586e60f08b4344eb5b0886'
});

import { CHARACTER_RIG_CATALOG as CATALOG, CHARACTER_RIG_CONFIG as CONFIG, characterRigFrame } from './character-rig-catalog.mjs';

const num = v => typeof v === 'number' && Number.isFinite(v);
const F = (cls, detail) => ({ pass: false, cls, detail });
const P = (cls, detail) => ({ pass: true, cls, detail });
const PEND = (cls, detail) => ({ pass: null, cls, detail });

export const V3 = Object.freeze({
  ids: Object.freeze(['warrior', 'silvertail', 'dark-druid']),
  modes: Object.freeze(['idle', 'walk', 'run', 'attack']),
  directions: 8,
  boneCount: CONFIG.boneCount,
  worldFootDriftTol: 4,            // observed WORLD-px actor origin drift at a HELD pose
  navRadius: 12,
  endId: 'CH1-2_5D-STRICT-CONSUMER-FIX-20261006-QA-V3-CANDIDATE',
});

// ── (1a) source-spec validation: a frame rect must be well-formed; NO cross-frame invariance ──
export function validateFrameRect(frame, asset) {
  if (!frame || !asset) return 'frame/asset missing';
  if (!num(asset.width) || !num(asset.height) || asset.width <= 0 || asset.height <= 0) return 'invalid asset dimensions';
  if (!num(frame.x) || !num(frame.y) || !num(frame.w) || !num(frame.h)) return 'non-finite rect';
  if (frame.w <= 0 || frame.h <= 0) return 'empty/negative cell';
  if (frame.x < 0 || frame.y < 0 || frame.x + frame.w > asset.width || frame.y + frame.h > asset.height)
    return `cell [${frame.x},${frame.y},${frame.w},${frame.h}] exceeds asset ${asset.width}×${asset.height}`;
  if (!num(frame.anchorX) || !num(frame.anchorY) || frame.anchorX < 0 || frame.anchorX > frame.w || frame.anchorY < 0 || frame.anchorY > frame.h)
    return 'foot anchor outside cell';
  if (!num(frame.referenceHeight) || frame.referenceHeight <= 0) return 'referenceHeight must be finite and > 0';
  return null;
}

// (1a + 3) exact iteration over DECLARED frames; any exception / bad id / bad count = FAIL.
export function checkFrameSpec(ids = V3.ids, modes = V3.modes) {
  const out = [];
  for (const id of ids) {
    const entry = CATALOG[id];
    if (!entry) { out.push(F('frame-spec', `unknown id '${id}' — not in catalog`)); continue; }
    for (const mode of modes) {
      const n = entry.frames?.[mode];
      if (!Number.isInteger(n) || n < 1) { out.push(F('frame-spec', `${id}/${mode}: declared frame count ${n} invalid`)); continue; }
      for (let d = 0; d < V3.directions; d++) for (let i = 0; i < n; i++) {
        let f;
        try { f = characterRigFrame(id, mode, d, i); }
        catch (e) { out.push(F('frame-spec', `${id}/${mode}/d${d}/i${i}: characterRigFrame threw "${e.message}"`)); continue; }
        const asset = entry.assets.find(a => a.path === f.path);
        const err = !asset ? 'frame.path not in catalog assets' : validateFrameRect(f, asset);
        if (err) out.push(F('frame-spec', `${id}/${mode}/d${d}/i${i}: ${err}`));
      }
    }
  }
  return out.length ? out : [P('frame-spec', `${ids.length} rigs × DECLARED frames: every cell well-formed (in-asset, anchor in-cell, refH>0); per-frame anchor variance intentionally allowed`)];
}

// ── (2) world-foot provider contract: SCENE units → WORLD px via terrain.sceneToWorld ──
// raw object3d.position / worldToScene are SCENE units (÷scale); NEVER read them as world px.
export function worldFootProvider(terrain, THREE) {
  if (!terrain || typeof terrain.sceneToWorld !== 'function') throw new Error('terrain.sceneToWorld 필요');
  if (!THREE || typeof THREE.Vector3 !== 'function') throw new Error('THREE.Vector3 필요 (scene→world 역변환)');
  return function observeWorldFoot(object3d) {
    if (!object3d || typeof object3d.getWorldPosition !== 'function') throw new Error('object3d.getWorldPosition 필요');
    const scenePos = object3d.getWorldPosition(new THREE.Vector3());  // SCENE units
    const w = terrain.sceneToWorld(scenePos);                          // → WORLD px {x,y,h}
    if (!num(w.x) || !num(w.y)) throw new Error('sceneToWorld가 유한 world px를 반환하지 않음');
    return { x: w.x, y: w.y };                                         // WORLD px
  };
}

// ── (1b) foot-drift: WORLD ground contact only. No anchorY/h invariance test here. ──
export function checkFootDrift(snapshots) {
  if (!Array.isArray(snapshots) || snapshots.length < 2)
    return [PEND('foot-drift', 'need ≥2 snapshots at the same mode+direction — PENDING')];
  for (const [i, s] of snapshots.entries())
    if (!s || !num(s.direction) || typeof s.id !== 'string' || typeof s.mode !== 'string')
      return [F('foot-drift', `snapshot #${i}: id/mode/direction missing (provider incomplete — not faked)`)];
  const out = [], groups = new Map();
  for (const s of snapshots) { const k = `${s.id}|${s.mode}|${s.direction}`; (groups.get(k) || groups.set(k, []).get(k)).push(s); }
  for (const [k, g] of groups) {
    if (g.length < 2) continue;
    if (!g.every(s => s.worldFoot && num(s.worldFoot.x) && num(s.worldFoot.y))) {
      out.push(PEND('foot-drift', `${k}: world drift UNKNOWN — inject worldFoot{x,y} WORLD px via worldFootProvider(terrain,THREE) at a HELD pose (raw object3d.position is SCENE units). PENDING`));
      continue;
    }
    const xs = g.map(s => s.worldFoot.x), ys = g.map(s => s.worldFoot.y);
    const span = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    span > V3.worldFootDriftTol
      ? out.push(F('foot-drift', `${k}: world actor-origin drift ${span.toFixed(2)} > ${V3.worldFootDriftTol} world px at held pose`))
      : out.push(P('foot-drift', `${k}: world actor origin stable over ${g.length} frames (${span.toFixed(2)} ≤ ${V3.worldFootDriftTol} px)`));
  }
  return out.length ? out : [PEND('foot-drift', 'no same-(mode,direction) frame pair — PENDING')];
}

// ── real-nav bound wrappers (unchanged shapes, kept distinct) ──
export function realNavFromTerrain(terrain) {
  if (!terrain || typeof terrain.canWalk !== 'function' || !terrain.bounds) throw new Error('terrain{canWalk(x,y,r),bounds} 필요');
  const b = terrain.bounds;
  const fn = (x, y, r = V3.navRadius) => num(x) && num(y) && num(r) && r >= 0
    && x >= b.left + r && x <= b.right - r && y >= b.top + r && y <= b.bottom - r && terrain.canWalk(x, y, r) === true;
  fn.kind = 'terrain'; return fn;
}
export function realNavFromCore(K, scene) {
  if (!K || typeof K.canWalk !== 'function' || !scene) throw new Error('MapSceneCore.canWalk + scene 필요');
  const fn = (x, y, r = V3.navRadius) => num(x) && num(y) && num(r) && r >= 0 && K.canWalk(scene, x, y, r) === true;
  fn.kind = 'core'; return fn;
}
export function checkNavWorld(footPoints, realNav) {
  if (typeof realNav !== 'function') return [PEND('nav-out-of-bounds', 'UNKNOWN: realNav wrapper not supplied — PENDING')];
  if (!Array.isArray(footPoints) || !footPoints.length) return [PEND('nav-out-of-bounds', 'no foot points — PENDING')];
  const out = [], r = V3.navRadius;
  for (const p of footPoints) {
    if (!p || !num(p.x) || !num(p.y)) { out.push(F('nav-out-of-bounds', `bad foot point ${JSON.stringify(p)}`)); continue; }
    let ok; try { ok = realNav(p.x, p.y, r); } catch (e) { out.push(F('nav-out-of-bounds', `realNav threw: ${e.message}`)); continue; }
    ok ? out.push(P('nav-out-of-bounds', `${p.id || 'foot'}(${p.x},${p.y}) walkable[${realNav.kind}] r${r}`))
       : out.push(F('nav-out-of-bounds', `${p.id || 'foot'}(${p.x},${p.y}) NOT walkable[${realNav.kind}] r${r}`));
  }
  return out;
}

export function runV3({ snapshots = null, realNav = null, footPoints = null } = {}) {
  const sections = { 'frame-spec': checkFrameSpec(), 'foot-drift': checkFootDrift(snapshots || []), 'nav-out-of-bounds': checkNavWorld(footPoints, realNav) };
  let fail = 0, pass = 0, pending = 0;
  for (const rows of Object.values(sections)) for (const r of rows) r.pass === false ? fail++ : r.pass === true ? pass++ : pending++;
  return { endId: V3.endId, sections, totals: { fail, pass, pending }, boundary: 'Source specification + observed actor-origin/nav checks only. Deformed foot pixels/IK, full native play, audio and A-grade remain unaccepted.' };
}
