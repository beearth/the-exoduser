/*
 * slice-acceptance-2_5d.v3.candidate.mjs
 * GOAL CH1-2_5D-CHARACTER-MAP-SLICE-20261006 · ROLE QA · CANDIDATE (not production acceptance).
 * OFFICIAL-COMPLETION-ID: CH1-2_5D-STRICT-CONSUMER-FIX-20261006-QA-V3-CANDIDATE
 *
 * Fixes three real defects root found in v2 (v1/v2 left unchanged):
 *
 * (1) v2 treated the cross-frame invariance of anchorY/h as a REQUIRED grounding condition. But
 *     setGeometry (character-rigs.mjs:74-79) maps each frame's foot anchor to the mesh origin
 *     (y=(norm·h-(h-anchorY))·pixelScale ⇒ anchor row → 0), so a per-frame anchorY/h (or anchorX/w)
 *     difference from normal padding/crop trimming does NOT move the world foot. v3 therefore splits:
 *       • checkFrameSpec — validates each frame rect is WELL-FORMED (in-asset, anchor in-cell, refH>0);
 *         it does NOT require cross-frame anchor invariance.
 *       • checkFootDrift — judges actual grounding ONLY from an observed world ground contact.
 *
 * (2) worldFoot is WORLD px. object3d.position / worldToScene are THREE SCENE units (÷scale). v3
 *     ships an explicit provider that inverts via terrain.sceneToWorld(object3d.getWorldPosition(v))
 *     → {x,y} world px (rift-terrain.mjs:61-65). No world observation ⇒ PENDING. The terrain and
 *     core realNav (x,y,r) wrappers stay distinct (terrain.canWalk(x,y,r) ≠ K.canWalk(scene,x,y,r)).
 *
 * (3) v2's frame loop swallowed every exception as "frame end", so a bad id / a frame-0 source throw
 *     silently PASSed. v3 iterates the catalog's DECLARED frames[mode] count exactly and treats any
 *     characterRigFrame exception (and an unknown id / bad count) as FAIL (fail-closed).
 *
 * HONESTY: createCharacterRig needs a browser THREE runtime; this module never stubs THREE for a
 * verdict or claims a GPU/screen PASS. World-foot/nav observables come from root's 3387 harness
 * (UNKNOWN until supplied → PENDING). A green source layer is a SOURCE gate only — not screen,
 * native, audio, A-grade, meaning-review, canonical docs, or 3387 adoption (all root-owned).
 *
 * Run (self-check, no THREE):  node tools/team-followup-20261006/hell-rift/QA/slice-acceptance-2_5d.v3.candidate.mjs
 */

import { CHARACTER_RIG_CATALOG as CATALOG, CHARACTER_RIG_CONFIG as CONFIG, characterRigFrame } from '../../../2_5d/character-rig-catalog.mjs';

const num = v => typeof v === 'number' && Number.isFinite(v);
const F = (cls, detail) => ({ pass: false, cls, detail });
const P = (cls, detail) => ({ pass: true, cls, detail });
const PEND = (cls, detail) => ({ pass: null, cls, detail });

export const V3 = Object.freeze({
  ids: Object.freeze(['warrior', 'silvertail', 'dark-druid']),
  modes: Object.freeze(['idle', 'walk', 'run', 'attack']),
  directions: 8,
  boneCount: CONFIG.boneCount,
  worldFootDriftTol: 4,            // observed WORLD-px ground-contact drift at a HELD pose
  navRadius: 12,
  endId: 'CH1-2_5D-STRICT-CONSUMER-FIX-20261006-QA-V3-CANDIDATE',
});

// ── (1a) source-spec validation: a frame rect must be well-formed; NO cross-frame invariance ──
export function validateFrameRect(frame, asset) {
  if (!frame || !asset) return 'frame/asset missing';
  if (!num(frame.x) || !num(frame.y) || !num(frame.w) || !num(frame.h)) return 'non-finite rect';
  if (frame.w <= 0 || frame.h <= 0) return 'empty/negative cell';
  if (frame.x < 0 || frame.y < 0 || frame.x + frame.w > asset.width || frame.y + frame.h > asset.height)
    return `cell [${frame.x},${frame.y},${frame.w},${frame.h}] exceeds asset ${asset.width}×${asset.height}`;
  if (!num(frame.anchorX) || !num(frame.anchorY) || frame.anchorX < 0 || frame.anchorX > frame.w || frame.anchorY < 0 || frame.anchorY > frame.h)
    return 'foot anchor outside cell';
  if (!(frame.referenceHeight > 0)) return 'referenceHeight ≤ 0';
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
      ? out.push(F('foot-drift', `${k}: world ground-contact drift ${span.toFixed(2)} > ${V3.worldFootDriftTol} world px at held pose`))
      : out.push(P('foot-drift', `${k}: world ground contact stable over ${g.length} frames (${span.toFixed(2)} ≤ ${V3.worldFootDriftTol} px)`));
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
  return { endId: V3.endId, sections, totals: { fail, pass, pending }, boundary: 'SOURCE gate only — world-foot/nav observables + 3387 integration + screen/native/audio/A-grade are root-owned (UNEXECUTED).' };
}

// ── Node self-check (no THREE verdict): exercises ONLY the three new-defect cases ──
const isMain = (() => { try { return import.meta.url === new URL(`file://${process.argv[1]}`).href; } catch { return false; } })();
if (isMain) {
  const show = (label, rows) => { console.log(`\n▸ ${label}`); for (const r of rows) console.log(`  [${r.pass === false ? 'FAIL' : r.pass === true ? 'PASS' : 'PEND'}] ${r.detail}`); };
  console.log('─'.repeat(76) + `\nv3 self-check — ${V3.endId}\n` + '─'.repeat(76));
  // (1) normal crop change: real silvertail/walk anchorY/h & anchorX/w vary — must NOT FAIL.
  show('(1) frame-spec on real catalog — per-frame anchor variance allowed', checkFrameSpec());
  // (3) fail-closed: unknown id, and a crafted frame-0 malformation.
  show('(3) unknown id → FAIL (was silent PASS in v2)', checkFrameSpec(['bogus-id'], ['walk']));
  console.log('\n▸ (3) malformed frame rect → spec FAIL');
  console.log('  [' + (validateFrameRect({ x: 0, y: 0, w: 48, h: 48, anchorX: 24, anchorY: 60, referenceHeight: 32 }, { width: 1008, height: 48 }) ? 'FAIL' : 'PASS') + '] anchorY 60 > h 48 → ' + validateFrameRect({ x: 0, y: 0, w: 48, h: 48, anchorX: 24, anchorY: 60, referenceHeight: 32 }, { width: 1008, height: 48 }));
  // (2) unit conversion: SCENE units → WORLD px via sceneToWorld; raw position is NOT world px.
  const scale = 400, centre = { x: 5480, y: 3740 }, angle = 50 * Math.PI / 180, sin = Math.sin(angle), cos = Math.cos(angle);
  const terrainStub = { sceneToWorld: (v) => ({ x: centre.x + v.x * scale, y: centre.y + (v.z * sin - v.y * cos) * scale, h: v.y * scale }) };
  const THREEStub = { Vector3: class { constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; } set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; } } };
  const scenePos = { x: 0.2, y: 0, z: -0.1 };               // SCENE units (what object3d.getWorldPosition yields)
  const obj3d = { getWorldPosition: (t) => t.set(scenePos.x, scenePos.y, scenePos.z) };
  const foot = worldFootProvider(terrainStub, THREEStub)(obj3d);
  console.log('\n▸ (2) worldFoot provider unit conversion');
  console.log(`  [${num(foot.x) && num(foot.y) ? 'PASS' : 'FAIL'}] scenePos(${scenePos.x},${scenePos.y},${scenePos.z}) → WORLD px foot(${foot.x.toFixed(1)}, ${foot.y.toFixed(1)})  (raw .x=${scenePos.x} is NOT world px)`);
  // (2b) foot-drift with provider-produced world foot: held → PASS, drifted → FAIL; absent → PENDING.
  const mk = (wf) => ({ id: 'silvertail', mode: 'idle', direction: 0, worldFoot: wf });
  show('(2) held world foot → PASS', checkFootDrift([mk({ x: 5480, y: 3740 }), mk({ x: 5480, y: 3740 })]));
  show('(2) drifted world foot (>4px) → FAIL', checkFootDrift([mk({ x: 5480, y: 3740 }), mk({ x: 5480, y: 3760 })]));
  show('(2) no world provider → PENDING', checkFootDrift([{ id: 's', mode: 'idle', direction: 0 }, { id: 's', mode: 'idle', direction: 0 }]));
  console.log('\n' + '─'.repeat(76) + `\nBoundary: ${runV3().boundary}\n` + '─'.repeat(76));
}
