/*
 * slice-acceptance-2_5d.candidate.mjs
 * GOAL CH1-2_5D-CHARACTER-MAP-SLICE-20261006 · ROLE QA · CANDIDATE (not production acceptance).
 * OFFICIAL-COMPLETION-ID: CH1-2_5D-CHARACTER-MAP-SLICE-20261006-QA-CANDIDATE
 *
 * Independent acceptance consumer for the 2.5D character/map slice (warrior / silvertail /
 * dark-druid). It detects FIVE distinct failure classes, each tied to the REAL rig API:
 *   invalid-cell · bone-fixed · nav-out-of-bounds · foot-drift · resize-mismatch   (+ loading-failure)
 *
 * It anchors ONLY to exports that exist today (read-only):
 *   tools/2_5d/character-rig-catalog.mjs → CHARACTER_RIG_CATALOG, CHARACTER_RIG_CONFIG,
 *     CHARACTER_RIG_DIRECTIONS, characterRigFrame(id,mode,direction,index)
 *       → frame {path,x,y,w,h,anchorX,anchorY,referenceHeight}
 *   tools/2_5d/character-rigs.mjs → createCharacterRig(id,{THREE,height}) → {object3d,update,snapshot,dispose}
 *     snapshot() → {id,name,kind,height,mode,direction,frame,elapsed,disposed,vertices,triangles,
 *       boneCount,meshCount,weightChecks,maxWeightError,source{…},samples{torso,head,arm-left,robe-left,foot-left:{position,quaternion}},assets,limits}
 *
 * HONESTY: `createCharacterRig` needs a browser THREE runtime (SkinnedMesh/Bone/Skeleton) + decoded
 * Image; this module NEVER stubs THREE or claims a live run. The snapshot/nav detectors CONSUME
 * observables supplied by root's 3387 browser harness (the UNKNOWN providers below). The pure
 * catalog/cell/asset layer runs in Node now. A green pure layer is a SOURCE gate — NOT screen,
 * native, audio, A-grade, or full-game acceptance, and not the world-lab harness re-run.
 *
 * UNKNOWN providers (must be injected by root; absent → reported PENDING, never faked):
 *   - snapshots: an ordered array of real snapshot() objects from a driven rig (varied mode/phase/height)
 *   - nav: { scene, canWalk(scene,x,y,radius) } from the active 3387 scene (MapSceneCore.canWalk)
 *   - io: { readFile(path)->Uint8Array/Buffer, sha256(bytes)->hex } for the asset integrity precheck
 *
 * Run (pure layer only):  node tools/team-followup-20261006/hell-rift/QA/slice-acceptance-2_5d.candidate.mjs
 */

import {
  CHARACTER_RIG_CATALOG as CATALOG,
  CHARACTER_RIG_CONFIG as CONFIG,
  CHARACTER_RIG_DIRECTIONS as DIRECTIONS,
  characterRigFrame,
} from '../../../2_5d/character-rig-catalog.mjs';

export const SLICE = Object.freeze({
  ids: Object.freeze(['warrior', 'silvertail', 'dark-druid']),
  modes: Object.freeze(['idle', 'walk', 'run', 'attack']),
  directions: DIRECTIONS.length,            // 8
  boneCount: CONFIG.boneCount,              // 12
  meshCount: 1,
  sampleKeys: Object.freeze(['torso', 'head', 'arm-left', 'robe-left', 'foot-left']),
  footLiftTolWorld: 0.02,                   // lateral foot slide tolerance (world units, fraction of height)
  endId: 'CH1-2_5D-CHARACTER-MAP-SLICE-20261006-QA-CANDIDATE',
});

const F = (cls, detail, extra = {}) => ({ pass: false, cls, detail, ...extra });
const P = (cls, detail, extra = {}) => ({ pass: true, cls, detail, ...extra });
const num = v => typeof v === 'number' && Number.isFinite(v);

// ── loading-failure precheck (pure; needs an io provider) ───────────────────
// A catalog asset whose file is missing / wrong size / wrong sha will make the browser
// acquireImage() reject ("원자료 크기 불일치"/"읽지 못했습니다"); catch it before the screen.
export async function checkAssets(io) {
  if (!io || typeof io.readFile !== 'function' || typeof io.sha256 !== 'function')
    return [{ pass: null, cls: 'loading-failure', detail: 'UNKNOWN provider io{readFile,sha256} not supplied — asset integrity PENDING' }];
  const out = [];
  for (const id of SLICE.ids) {
    for (const a of CATALOG[id].assets) {
      try {
        const bytes = await io.readFile(a.path);
        const len = bytes.byteLength ?? bytes.length;
        if (len !== a.bytes) { out.push(F('loading-failure', `${a.path} size ${len}≠${a.bytes}`, { id })); continue; }
        const sha = await io.sha256(bytes);
        if (sha !== a.sha256) { out.push(F('loading-failure', `${a.path} sha ${sha.slice(0, 8)}≠${a.sha256.slice(0, 8)}`, { id })); continue; }
        out.push(P('loading-failure', `${a.path} ${a.width}×${a.height} ok`, { id }));
      } catch (e) { out.push(F('loading-failure', `${a.path}: ${e.message}`, { id })); }
    }
  }
  return out;
}

// ── invalid-cell (pure; runs now) ───────────────────────────────────────────
// Every id×mode×dir×index cell from characterRigFrame must lie inside its asset and carry a
// usable foot anchor; an out-of-bounds/empty cell renders torn or blank art.
export function checkCells() {
  const out = [];
  for (const id of SLICE.ids) {
    const e = CATALOG[id];
    for (const mode of SLICE.modes) {
      const frames = e.frames[mode];
      if (!Number.isInteger(frames) || frames < 1) { out.push(F('invalid-cell', `${id}/${mode} frame count ${frames}`, { id, mode })); continue; }
      for (let d = 0; d < SLICE.directions; d++) for (let i = 0; i < frames; i++) {
        let f;
        try { f = characterRigFrame(id, mode, d, i); }
        catch (e2) { out.push(F('invalid-cell', `${id}/${mode}/d${d}/i${i} threw: ${e2.message}`, { id, mode, d, i })); continue; }
        const info = e.assets.find(a => a.path === f.path);
        const bad =
          !info ? 'asset not in catalog' :
          !num(f.x) || !num(f.y) || !num(f.w) || !num(f.h) ? 'non-finite rect' :
          f.x < 0 || f.y < 0 || f.w <= 0 || f.h <= 0 ? 'empty/negative rect' :
          f.x + f.w > info.width || f.y + f.h > info.height ? `cell ${f.x + f.w}×${f.y + f.h} exceeds asset ${info.width}×${info.height}` :
          f.anchorX < 0 || f.anchorX > f.w || f.anchorY < 0 || f.anchorY > f.h ? 'foot anchor outside cell' :
          !(f.referenceHeight > 0) ? 'referenceHeight≤0' : null;
        if (bad) out.push(F('invalid-cell', `${id}/${mode}/d${d}/i${i}: ${bad}`, { id, mode, d, i, frame: f }));
      }
    }
  }
  return out.length ? out : [P('invalid-cell', `${SLICE.ids.length} rigs × all cells within asset bounds + foot anchor in-cell`)];
}

// ── snapshot shape guard (the concrete required-snapshot condition) ─────────
function requireSnap(s, where) {
  if (!s || typeof s !== 'object') return `snapshot ${where}: not an object`;
  for (const k of ['id', 'mode', 'direction', 'frame', 'height', 'boneCount', 'meshCount', 'vertices', 'triangles', 'weightChecks', 'disposed'])
    if (!(k in s)) return `snapshot ${where}: missing '${k}' (provider incomplete — not faked)`;
  if (!s.source || !num(s.source.anchorY) || !num(s.source.referenceHeight) || !num(s.source.h)) return `snapshot ${where}: source{anchorY,referenceHeight,h} missing`;
  if (!s.samples) return `snapshot ${where}: samples missing`;
  for (const key of SLICE.sampleKeys) if (!s.samples[key] || !Array.isArray(s.samples[key].position)) return `snapshot ${where}: samples['${key}'].position missing`;
  return null;
}

// ── bone-fixed: Bone/SkinnedMesh must actually deform across phases ──────────
// Two+ snapshots spanning different (mode|frame|elapsed) whose bone samples are byte-identical =
// a static billboard, not a skinned rig. Also guards structural bone/mesh/weight contract.
export function checkBoneMotion(snapshots) {
  if (!Array.isArray(snapshots) || snapshots.length < 2)
    return [{ pass: null, cls: 'bone-fixed', detail: 'UNKNOWN provider: need ≥2 driven snapshots (varied mode/phase) — PENDING' }];
  const out = [];
  for (const [i, s] of snapshots.entries()) { const err = requireSnap(s, `#${i}`); if (err) return [F('bone-fixed', err)]; }
  for (const s of snapshots) {
    if (s.boneCount !== SLICE.boneCount) out.push(F('bone-fixed', `${s.id}: boneCount ${s.boneCount}≠${SLICE.boneCount}`, { id: s.id }));
    if (s.meshCount !== SLICE.meshCount) out.push(F('bone-fixed', `${s.id}: meshCount ${s.meshCount}≠1`, { id: s.id }));
    if (!(s.weightChecks > 0)) out.push(F('bone-fixed', `${s.id}: weightChecks 0 — setGeometry never ran`, { id: s.id }));
    if (!(s.triangles > 0) || !(s.vertices > 0)) out.push(F('bone-fixed', `${s.id}: empty geometry v${s.vertices}/t${s.triangles}`, { id: s.id }));
  }
  // group per id; within a group, differing (mode|frame|elapsed) must change bone samples
  const byId = new Map();
  for (const s of snapshots) { (byId.get(s.id) || byId.set(s.id, []).get(s.id)).push(s); }
  for (const [id, group] of byId) {
    const distinctPose = new Set(group.map(s => `${s.mode}|${s.frame}|${s.elapsed}`));
    if (distinctPose.size < 2) { out.push({ pass: null, cls: 'bone-fixed', detail: `${id}: only one pose provided — motion PENDING`, id }); continue; }
    const sig = s => SLICE.sampleKeys.map(k => s.samples[k].position.join(',') + '/' + (s.samples[k].quaternion || []).join(',')).join('|');
    const sigs = new Set(group.map(sig));
    if (sigs.size < 2) out.push(F('bone-fixed', `${id}: bone samples identical across ${distinctPose.size} distinct poses — rig is static`, { id }));
    else out.push(P('bone-fixed', `${id}: ${sigs.size} distinct bone poses over ${distinctPose.size} frames`, { id }));
  }
  return out;
}

// ── foot-drift: the foot baseline must stay put within a (mode,direction) ────
// source.anchorY/referenceHeight/h fix the contact line; they must not vary across frames of the
// same mode+direction (setGeometry only re-runs on cell-dim/anchor change). Lateral foot slide
// beyond tolerance also fails. (Intended vertical lift in walk/run pose is allowed.)
export function checkFootGround(snapshots) {
  if (!Array.isArray(snapshots) || snapshots.length < 2)
    return [{ pass: null, cls: 'foot-drift', detail: 'UNKNOWN provider: need ≥2 snapshots at the same mode+direction — PENDING' }];
  for (const [i, s] of snapshots.entries()) { const err = requireSnap(s, `#${i}`); if (err) return [F('foot-drift', err)]; }
  const out = [], groups = new Map();
  for (const s of snapshots) { const k = `${s.id}|${s.mode}|${s.direction}`; (groups.get(k) || groups.set(k, []).get(k)).push(s); }
  for (const [k, g] of groups) {
    if (g.length < 2) continue;
    const base = g[0], driftRef = g.find(s => s.source.anchorY !== base.source.anchorY || s.source.referenceHeight !== base.source.referenceHeight || s.source.h !== base.source.h);
    if (driftRef) { out.push(F('foot-drift', `${k}: foot baseline moved (anchorY/refH/h) across frames`, { group: k })); continue; }
    const xs = g.map(s => s.samples['foot-left'].position[0]), span = Math.max(...xs) - Math.min(...xs);
    const tol = base.height * SLICE.footLiftTolWorld;
    if (span > tol) out.push(F('foot-drift', `${k}: foot-left lateral slide ${span.toFixed(4)} > ${tol.toFixed(4)}`, { group: k }));
    else out.push(P('foot-drift', `${k}: foot baseline stable over ${g.length} frames`, { group: k }));
  }
  return out.length ? out : [{ pass: null, cls: 'foot-drift', detail: 'no same-(mode,direction) frame pair supplied — PENDING' }];
}

// ── nav-out-of-bounds: a proposed world foot point must be walkable ──────────
// update() is explicitly observational (no movement/clamp); nav is the caller's gate. The
// consumer asserts the foot point against the scene's canWalk(scene,x,y,radius).
export function checkNav(footPoints, nav) {
  if (!nav || typeof nav.canWalk !== 'function' || nav.scene === undefined)
    return [{ pass: null, cls: 'nav-out-of-bounds', detail: 'UNKNOWN provider: nav{scene,canWalk} not supplied — PENDING' }];
  if (!Array.isArray(footPoints) || !footPoints.length)
    return [{ pass: null, cls: 'nav-out-of-bounds', detail: 'no foot points supplied — PENDING' }];
  const r = num(nav.radius) ? nav.radius : 12, out = [];
  for (const p of footPoints) {
    if (!p || !num(p.x) || !num(p.y)) { out.push(F('nav-out-of-bounds', `bad foot point ${JSON.stringify(p)}`)); continue; }
    let ok; try { ok = nav.canWalk(nav.scene, p.x, p.y, r) === true; } catch (e) { out.push(F('nav-out-of-bounds', `canWalk threw: ${e.message}`, { p })); continue; }
    ok ? out.push(P('nav-out-of-bounds', `${p.id || 'foot'}(${p.x},${p.y}) walkable r${r}`, { p })) : out.push(F('nav-out-of-bounds', `${p.id || 'foot'}(${p.x},${p.y}) NOT walkable r${r}`, { p }));
  }
  return out;
}

// ── resize-mismatch: height change must rescale, not reshape ─────────────────
// Two snapshots of the same id/mode/direction/frame at different height: structure (vertices,
// triangles, boneCount, source) must be invariant and height must actually differ. The true
// pixel-extent ratio needs object3d.boundingBox (UNKNOWN provider) — reported, not faked.
export function checkResize(a, b) {
  if (!a || !b) return [{ pass: null, cls: 'resize-mismatch', detail: 'UNKNOWN provider: need two snapshots at differing height — PENDING' }];
  for (const [s, w] of [[a, 'A'], [b, 'B']]) { const err = requireSnap(s, w); if (err) return [F('resize-mismatch', err)]; }
  if (a.id !== b.id || a.mode !== b.mode || a.direction !== b.direction || a.frame !== b.frame)
    return [F('resize-mismatch', `pair not same id/mode/dir/frame: ${a.id}/${a.mode}/${a.direction}/${a.frame} vs ${b.id}/${b.mode}/${b.direction}/${b.frame}`)];
  if (a.height === b.height) return [{ pass: null, cls: 'resize-mismatch', detail: 'both heights equal — no resize to assess (PENDING)' }];
  const out = [];
  if (a.vertices !== b.vertices || a.triangles !== b.triangles) out.push(F('resize-mismatch', `topology changed on resize v${a.vertices}/${b.vertices} t${a.triangles}/${b.triangles}`));
  if (a.boneCount !== b.boneCount) out.push(F('resize-mismatch', `boneCount changed on resize ${a.boneCount}/${b.boneCount}`));
  if (a.source.referenceHeight !== b.source.referenceHeight) out.push(F('resize-mismatch', `referenceHeight changed ${a.source.referenceHeight}/${b.source.referenceHeight} (should be calibration-fixed)`));
  if (!out.length) out.push({ pass: null, cls: 'resize-mismatch', detail: `structure invariant across height ${a.height}→${b.height}; geometric extent ratio needs object3d.boundingBox (UNKNOWN provider) to confirm scale==height ratio` });
  return out;
}

// ── orchestrator ────────────────────────────────────────────────────────────
export async function runSliceAcceptance({ io = null, snapshots = null, navFootPoints = null, nav = null, resizePair = null } = {}) {
  const sections = {
    'loading-failure': await checkAssets(io),
    'invalid-cell': checkCells(),
    'bone-fixed': checkBoneMotion(snapshots),
    'foot-drift': checkFootGround(snapshots),
    'nav-out-of-bounds': checkNav(navFootPoints, nav),
    'resize-mismatch': checkResize(resizePair?.[0], resizePair?.[1]),
  };
  let fail = 0, pass = 0, pending = 0;
  for (const rows of Object.values(sections)) for (const r of rows) r.pass === false ? fail++ : r.pass === true ? pass++ : pending++;
  return {
    endId: SLICE.endId, sections,
    totals: { fail, pass, pending },
    boundary: 'SOURCE gate only — screen/native/audio/A-grade/full-game + world-lab harness run are UNEXECUTED (root).',
  };
}

// ── Node CLI: runs the pure layer (catalog/cell) + asset integrity via node:fs ──
const isMain = (() => { try { return import.meta.url === new URL(`file://${process.argv[1]}`).href; } catch { return false; } })();
if (isMain) {
  const { readFile } = await import('node:fs/promises');
  const { createHash } = await import('node:crypto');
  const io = { readFile: p => readFile(p), sha256: b => createHash('sha256').update(b).digest('hex') };
  const report = await runSliceAcceptance({ io });           // snapshot/nav providers absent → PENDING
  const bar = '─'.repeat(74);
  console.log(bar + `\n2.5D slice acceptance — ${SLICE.endId}\n` + bar);
  for (const [cls, rows] of Object.entries(report.sections)) {
    console.log(`\n▸ ${cls}`);
    for (const r of rows) console.log(`  [${r.pass === false ? 'FAIL' : r.pass === true ? 'PASS' : 'PEND'}] ${r.detail}`);
  }
  console.log(`\n${bar}\nTOTAL fail:${report.totals.fail} pass:${report.totals.pass} pending:${report.totals.pending}`);
  console.log(report.boundary + '\n' + bar);
  process.exit(report.totals.fail ? 1 : 0);
}
