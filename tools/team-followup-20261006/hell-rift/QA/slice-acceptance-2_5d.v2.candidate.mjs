/*
 * slice-acceptance-2_5d.v2.candidate.mjs
 * GOAL CH1-2_5D-CHARACTER-MAP-SLICE-20261006 · ROLE QA · CANDIDATE (not production acceptance).
 * OFFICIAL-COMPLETION-ID: CH1-2_5D-CONSUMER-CORRECTION-20261006-QA-V2-CANDIDATE
 *
 * Correction of two consume points from the v1 candidate, per root's source review:
 *
 * (1) foot-drift — v1 FAILed when a crop's ABSOLUTE source h/anchorY/referenceHeight differed
 *     across frames. That false-flags a normal high-resolution rig: silvertail/walk cells are
 *     per-frame trimmed (w/h/anchorX vary) yet the GROUNDING invariant — the VERTICAL normalized
 *     foot origin anchorY/h and the referenceHeight — stays constant (observed:
 *     silvertail/walk anchorY/h=1.0000 all frames; druid 1.0000; warrior 0.9583; referenceHeight
 *     constant). The engine maps that cell anchor at pixelScale=height/referenceHeight
 *     (character-rigs.mjs:75-78), so per-frame absolute variance is expected, not drift.
 *     v2 therefore: (a) checks the VERTICAL normalized foot origin + referenceHeight are invariant
 *     (a real cell-calibration fault if not); (b) judges actual world drift ONLY from an observed
 *     world ground-contact provider — never from bone-local samples. No world observation ⇒ PENDING.
 *
 * (2) real-nav wrapper — the terrain exposes canWalk(x,y,r=12) (3-arg WORLD form, rift-terrain.mjs:124,
 *     a bound wrapper over K.canWalk(source,x,y,r)); this is NOT MapSceneCore.canWalk(scene,x,y,r).
 *     v2 exposes two explicit constructors so callers never conflate the two shapes, and the world
 *     bound-inset (world-lab.mjs:56: bounds±r AND canWalk) is applied.
 *
 * HONESTY: createCharacterRig needs a browser THREE runtime; this module never stubs THREE or claims
 * a GPU/screen PASS. The world-foot/nav observables are injected by root's 3387 harness (UNKNOWN until
 * supplied → PENDING, never faked). A green pure/cell layer is a SOURCE gate only — not screen,
 * native, audio, A-grade, meaning-review, or 3387 integration (all root-owned). fixture/mock ≠ done.
 *
 * Run (self-check, no THREE):  node tools/team-followup-20261006/hell-rift/QA/slice-acceptance-2_5d.v2.candidate.mjs
 */

import { CHARACTER_RIG_CONFIG as CONFIG, characterRigFrame } from '../../../2_5d/character-rig-catalog.mjs';

const num = v => typeof v === 'number' && Number.isFinite(v);
const F = (cls, detail) => ({ pass: false, cls, detail });
const P = (cls, detail) => ({ pass: true, cls, detail });
const PEND = (cls, detail) => ({ pass: null, cls, detail });

export const V2 = Object.freeze({
  boneCount: CONFIG.boneCount,
  footOriginTol: 1e-3,        // vertical normalized foot origin (anchorY/h) invariance, fractional
  worldFootDriftTol: 4,       // observed world ground-contact drift at a HELD pose, world px
  navRadius: 12,
  endId: 'CH1-2_5D-CONSUMER-CORRECTION-20261006-QA-V2-CANDIDATE',
});

/** Normalized foot origin of a frame rect: fraction of the cell where the foot anchor sits.
 *  vy (anchorY/h) is the grounding axis; vx (anchorX/w) is lateral centering (informational). */
export function normalizedFootOrigin(frame) {
  if (!frame || !num(frame.w) || !num(frame.h) || !num(frame.anchorX) || !num(frame.anchorY) || frame.w <= 0 || frame.h <= 0)
    throw new Error('frame rect {w,h,anchorX,anchorY} 오류');
  return { vy: frame.anchorY / frame.h, vx: frame.anchorX / frame.w, referenceHeight: frame.referenceHeight };
}

/** (1) Corrected foot-drift.
 *  snapshots: real snapshot() objects. Required per snapshot: id, mode, direction, height,
 *  source{h,anchorY,referenceHeight}. Optional injected observable: worldFoot{x,y} (WORLD ground
 *  contact, from object3d world position / terrain.worldToScene, world-lab.mjs:64). */
export function checkFootDrift(snapshots) {
  if (!Array.isArray(snapshots) || snapshots.length < 2)
    return [PEND('foot-drift', 'need ≥2 snapshots at the same mode+direction — PENDING')];
  for (const [i, s] of snapshots.entries())
    if (!s?.source || !num(s.source.h) || !num(s.source.anchorY) || !num(s.source.referenceHeight) || !num(s.height))
      return [F('foot-drift', `snapshot #${i}: source{h,anchorY,referenceHeight} / height missing (provider incomplete — not faked)`)];
  const out = [], groups = new Map();
  for (const s of snapshots) { const k = `${s.id}|${s.mode}|${s.direction}`; (groups.get(k) || groups.set(k, []).get(k)).push(s); }
  for (const [k, g] of groups) {
    if (g.length < 2) continue;
    // (a) grounding invariant: VERTICAL normalized foot origin + referenceHeight constant.
    //     Absolute h/anchorY/anchorX/w variance (hi-res trimmed cells) is NORMAL and not flagged.
    const vy = g.map(s => s.source.anchorY / s.source.h);
    const vySpan = Math.max(...vy) - Math.min(...vy);
    const rhVary = g.some(s => s.source.referenceHeight !== g[0].source.referenceHeight);
    if (vySpan > V2.footOriginTol || rhVary) {
      out.push(F('foot-drift', `${k}: vertical foot-origin anchorY/h variance ${vySpan.toExponential(2)}${rhVary ? ' + referenceHeight changed' : ''} — contact-height calibration inconsistent`));
      continue;
    }
    // (b) real world drift: only from an observed world ground contact. bone-local never decides it.
    if (!g.every(s => s.worldFoot && num(s.worldFoot.x) && num(s.worldFoot.y))) {
      out.push(PEND('foot-drift', `${k}: anchorY/h stable (${vy[0].toFixed(4)}); world drift UNKNOWN — inject worldFoot{x,y} (object3d world pos / terrain.worldToScene, world-lab.mjs:64), captured at a HELD pose. PENDING`));
      continue;
    }
    const xs = g.map(s => s.worldFoot.x), ys = g.map(s => s.worldFoot.y);
    const span = Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    span > V2.worldFootDriftTol
      ? out.push(F('foot-drift', `${k}: world ground-contact drift ${span.toFixed(2)} > ${V2.worldFootDriftTol} world px at held pose`))
      : out.push(P('foot-drift', `${k}: anchorY/h stable + world ground contact stable over ${g.length} frames`));
  }
  return out.length ? out : [PEND('foot-drift', 'no same-(mode,direction) frame pair supplied — PENDING')];
}

/** Pure, source-only grounding calibration check across every id×mode×direction's frames —
 *  verifies the VERTICAL foot origin is frame-invariant without any world observation. */
export function checkFootCalibration(catalogIds = ['warrior', 'silvertail', 'dark-druid'], modes = ['idle', 'walk', 'run', 'attack']) {
  const out = [];
  for (const id of catalogIds) for (const mode of modes) {
    for (let d = 0; d < 8; d++) {
      let n; try { n = frameCount(id, mode); } catch (e) { out.push(F('foot-drift', `${id}/${mode}: ${e.message}`)); break; }
      if (n < 2) continue;
      const vy = [];
      for (let i = 0; i < n; i++) { try { const o = normalizedFootOrigin(characterRigFrame(id, mode, d, i)); vy.push(o.vy); } catch (e) { out.push(F('foot-drift', `${id}/${mode}/d${d}/i${i}: ${e.message}`)); vy.length = 0; break; } }
      if (vy.length >= 2) { const span = Math.max(...vy) - Math.min(...vy); if (span > V2.footOriginTol) out.push(F('foot-drift', `${id}/${mode}/d${d}: anchorY/h variance ${span.toExponential(2)} across frames`)); }
    }
  }
  return out.length ? out : [P('foot-drift', 'all rigs: vertical foot origin (anchorY/h) frame-invariant per direction (absolute crop size variance ignored)')];
}
function frameCount(id, mode) { for (let i = 0; ; i++) { try { characterRigFrame(id, mode, 0, i); } catch { return i; } if (i > 64) return i; } }

/** (2) Real-nav bound wrappers — both return a uniform (x,y,r)=>boolean. */
export function realNavFromTerrain(terrain) {
  if (!terrain || typeof terrain.canWalk !== 'function' || !terrain.bounds) throw new Error('terrain{canWalk(x,y,r),bounds} 필요');
  const b = terrain.bounds;
  // 3-arg WORLD form (rift-terrain.mjs:124) + bounds-inset by r (world-lab.mjs:56). NOT (scene,x,y,r).
  const fn = (x, y, r = V2.navRadius) => num(x) && num(y) && num(r) && r >= 0
    && x >= b.left + r && x <= b.right - r && y >= b.top + r && y <= b.bottom - r && terrain.canWalk(x, y, r) === true;
  fn.kind = 'terrain'; fn.bounds = { left: b.left, right: b.right, top: b.top, bottom: b.bottom }; return fn;
}
export function realNavFromCore(K, scene) {
  if (!K || typeof K.canWalk !== 'function' || !scene) throw new Error('MapSceneCore.canWalk + scene 필요');
  // MapSceneCore 4-arg form adapted to (x,y,r); kept separate so a scene is never passed to a terrain wrapper.
  const fn = (x, y, r = V2.navRadius) => num(x) && num(y) && num(r) && r >= 0 && K.canWalk(scene, x, y, r) === true;
  fn.kind = 'core'; return fn;
}
export function checkNavWorld(footPoints, realNav) {
  if (typeof realNav !== 'function')
    return [PEND('nav-out-of-bounds', 'UNKNOWN: realNav wrapper not supplied (use realNavFromTerrain / realNavFromCore) — PENDING')];
  if (!Array.isArray(footPoints) || !footPoints.length)
    return [PEND('nav-out-of-bounds', 'no foot points supplied — PENDING')];
  const out = [], r = V2.navRadius;
  for (const p of footPoints) {
    if (!p || !num(p.x) || !num(p.y)) { out.push(F('nav-out-of-bounds', `bad foot point ${JSON.stringify(p)}`)); continue; }
    let ok; try { ok = realNav(p.x, p.y, r); } catch (e) { out.push(F('nav-out-of-bounds', `realNav threw: ${e.message}`)); continue; }
    ok ? out.push(P('nav-out-of-bounds', `${p.id || 'foot'}(${p.x},${p.y}) walkable[${realNav.kind}] r${r}`))
       : out.push(F('nav-out-of-bounds', `${p.id || 'foot'}(${p.x},${p.y}) NOT walkable[${realNav.kind}] r${r}`));
  }
  return out;
}

export function runV2({ snapshots = null, realNav = null, footPoints = null } = {}) {
  const sections = {
    'foot-calibration': checkFootCalibration(),
    'foot-drift': checkFootDrift(snapshots || []),
    'nav-out-of-bounds': checkNavWorld(footPoints, realNav),
  };
  let fail = 0, pass = 0, pending = 0;
  for (const rows of Object.values(sections)) for (const r of rows) r.pass === false ? fail++ : r.pass === true ? pass++ : pending++;
  return { endId: V2.endId, sections, totals: { fail, pass, pending }, boundary: 'SOURCE gate only — world-foot/nav observables, 3387 integration, screen/native/audio/A-grade are root-owned (UNEXECUTED).' };
}

// ── Node self-check (no THREE): proves the three unit-2 cases without a GPU/screen claim ──
const isMain = (() => { try { return import.meta.url === new URL(`file://${process.argv[1]}`).href; } catch { return false; } })();
if (isMain) {
  const src = i => { const f = characterRigFrame('silvertail', 'walk', 0, i); return { id: 'silvertail', mode: 'walk', direction: 0, height: 0.36, source: { h: f.h, anchorX: f.anchorX, anchorY: f.anchorY, referenceHeight: f.referenceHeight } }; };
  const normal = [src(0), src(1), src(2), src(3)];                                   // real varied crops
  const drift = normal.map((s, i) => ({ ...s, worldFoot: { x: 5480, y: 3740 + i * 10 } }));  // injected world drift
  const held = normal.map(s => ({ ...s, worldFoot: { x: 5480, y: 3740 } }));          // held world foot
  const show = (label, rows) => { console.log(`\n▸ ${label}`); for (const r of rows) console.log(`  [${r.pass === false ? 'FAIL' : r.pass === true ? 'PASS' : 'PEND'}] ${r.detail}`); };
  console.log('─'.repeat(74) + `\nv2 self-check — ${V2.endId}\n` + '─'.repeat(74));
  show('foot-calibration (pure, real catalog)', checkFootCalibration());
  show('A) normal varied silvertail crops, no world provider → must NOT false-FAIL (PENDING)', checkFootDrift(normal));
  show('B) injected real world-foot drift (>4px) → FAIL', checkFootDrift(drift));
  show('C) injected held world foot (stable) → PASS', checkFootDrift(held));
  show('nav: no provider → PENDING', checkNavWorld([{ x: 1, y: 1 }], null));
  show('nav: terrain-shape wrapper (stub canWalk) → walkable/NOT', checkNavWorld(
    [{ id: 'in', x: 5480, y: 3740 }, { id: 'out', x: 50, y: 50 }],
    realNavFromTerrain({ canWalk: (x) => x > 1000, bounds: { left: 0, right: 8000, top: 0, bottom: 8000 } })));
  console.log('\n' + '─'.repeat(74) + `\nBoundary: ${runV2().boundary}\n` + '─'.repeat(74));
}
