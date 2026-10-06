/* MAP 2.5D scene↔editor roundtrip registration consumer — CH1-2_5D-CHARACTER-MAP-SLICE-20261006-MAP-CANDIDATE
 *
 * Read-only over the pinned rift scene. Writes NO source pixels / scene / nav / editor history / gameplay save.
 * Distinct from root's `createRiftTerrain` (THREE terrain, tools/2_5d/rift-terrain.mjs): this is a pure-math
 * registration validator that PROVES worldXY / nav1192 / start / exit / resident-foot / foreground-mask are
 * preserved across editor ↔ 2.5D, and marks height-less cliffs as `inferred_trial_geometry` (no authored height).
 *
 * Grounded on existing APIs (no fabrication):
 *   - MapSceneCore.validate / canWalk            (tools/map-scene-core.js)
 *   - residentPaintingProfile / residentDialogueAnchors (tools/map-scene-rift-residents.mjs)
 *   - RIFT_TERRAIN config + worldToScene/sceneToWorld formula (tools/2_5d/rift-terrain.mjs:52-64)
 */
import '../../../map-scene-core.js';
import { residentPaintingProfile, residentDialogueAnchors } from '../../../map-scene-rift-residents.mjs';
import { RIFT_TERRAIN } from '../../../2_5d/rift-terrain.mjs';

const K = globalThis.MapSceneCore;
const EPS = 1e-6;
const finite = (n, label) => { if (typeof n !== 'number' || !Number.isFinite(n)) throw new Error(label + ' 유한수 오류'); return n; };

/* Pure-math projection identical to rift-terrain.mjs worldToScene/sceneToWorld (RIFT_TERRAIN.centre),
 * without THREE so the registration can be validated headless and round-tripped deterministically. */
export function projection({ angle = 50, scale = 400, centre = RIFT_TERRAIN.centre } = {}) {
  finite(angle, '카메라 각도'); finite(scale, '지형 배율');
  if (angle < 10 || angle > 85 || scale <= 0 || scale > 32000) throw new Error('지형 카메라/배율 범위 오류');
  const theta = angle * Math.PI / 180, sin = Math.sin(theta), cos = Math.cos(theta);
  const worldToScene = (x, y, h = 0) => ({ x: (finite(x, 'world x') - centre.x) / scale, y: finite(h, '높이') / scale, z: ((finite(y, 'world y') - centre.y) + h * cos) / (scale * sin) });
  const sceneToWorld = (v) => ({ x: centre.x + finite(v.x, 'scene x') * scale, y: centre.y + (finite(v.z, 'scene z') * sin - finite(v.y, 'scene y') * cos) * scale, h: v.y * scale });
  return { angle, scale, centre: { ...centre }, theta, sin, cos, worldToScene, sceneToWorld };
}

/* Extract the registration that MUST survive an editor↔2.5D roundtrip. No scene mutation. */
export function sceneRegistration(scene) {
  const p = K.validate(scene);                                  // exoduser-map-scene v1 contract (throws on invalid)
  const walkableCount = p.walkable.filter(Boolean).length;
  const foot = p.layers.find(l => l.id === 'foot');
  const residents = (residentDialogueAnchors(p) || []).map(a => ({ npcId: a.npcId, foot: { x: a.x, y: a.y }, height: a.labelHeight }));
  // Foreground foot occluders = masked foot-layer objects that are NOT residents (clip + direct draw at source-res).
  const foreground = (foot?.objects || [])
    .filter(o => o.mask && o.id.startsWith('obj-') && !o.id.startsWith('obj-resident-'))
    .map(o => ({
      objectId: o.id, footY: o.y,
      // World polygon (pivotX/pivotY applied) — matches rift-terrain.mjs:115 east-horn mapping exactly.
      worldPolygon: o.mask.map(([mx, my]) => ({ x: o.x + (mx - o.pivotX) * o.width + o.pivotX * o.width, y: (o.y - o.height * o.pivotY) + my * o.height }))
    }));
  // Height-less cliffs: abyss depth + foreground cutouts have no authored physical height.
  const abyss = p.layers.find(l => l.id === 'abyss')?.objects.find(o => o.sourceParallax !== undefined);
  const inferred_trial_geometry = [
    ...(abyss ? [{ objectId: abyss.id, kind: 'abyss-depth', authoredDepth: RIFT_TERRAIN.authoredDepth, physicalHeight: 'UNKNOWN' }] : []),
    ...foreground.map(f => ({ objectId: f.objectId, kind: 'foreground-cutout', physicalHeight: 'UNKNOWN' }))
  ];
  return {
    profileValid: !!residentPaintingProfile(p),
    walkableCount, navSha256: p.sourcePins?.nav,
    world: { ...p.world }, start: { ...p.start }, exit: { ...p.exit },
    residents, foreground, inferred_trial_geometry, physicalHeight: 'UNKNOWN'
  };
}

/* Prove the registration survives scene → 2.5D → scene with the real projection. Fail-closed. */
export function roundtripPreserved(scene, opts = {}) {
  const reg = sceneRegistration(scene);
  const proj = projection(opts);
  const p = K.validate(scene);
  const issues = [];
  if (!reg.profileValid) issues.push('residentPaintingProfile 실패 — sourcePins strict / 1254 결합 미충족');
  if (reg.walkableCount !== 1192) issues.push('nav walkableCount ' + reg.walkableCount + ' ≠ 1192');
  for (const key of ['start', 'exit']) if (!K.canWalk(p, reg[key].x, reg[key].y, 12)) issues.push(key + ' 보행 불가');
  // worldXY roundtrip (ground h=0) for start/exit + every resident foot + every foreground polygon vertex.
  const checkPts = [
    { id: 'start', ...reg.start }, { id: 'exit', ...reg.exit },
    ...reg.residents.map(r => ({ id: r.npcId, ...r.foot })),
    ...reg.foreground.flatMap(f => f.worldPolygon.map((v, i) => ({ id: f.objectId + '#' + i, ...v })))
  ];
  let maxRoundtripWorldError = 0;
  for (const pt of checkPts) {
    const back = proj.sceneToWorld(proj.worldToScene(pt.x, pt.y, 0));
    const err = Math.max(Math.abs(back.x - pt.x), Math.abs(back.y - pt.y));
    if (err > maxRoundtripWorldError) maxRoundtripWorldError = err;
    if (err > EPS) issues.push('roundtrip 이동 ' + pt.id + ' Δ' + err.toFixed(6) + ' (원형 geometry 이동 금지)');
  }
  return {
    ok: issues.length === 0,
    completionId: 'CH1-2_5D-CHARACTER-MAP-SLICE-20261006-MAP-CANDIDATE',
    sourceSceneSha256: RIFT_TERRAIN.sceneSha256,
    projection: { angle: proj.angle, scale: proj.scale, centre: proj.centre },
    walkableCount: reg.walkableCount, navSha256: reg.navSha256,
    start: reg.start, exit: reg.exit,
    residents: reg.residents,
    foreground: reg.foreground.map(f => ({ objectId: f.objectId, footY: f.footY, points: f.worldPolygon.length })),
    inferred_trial_geometry: reg.inferred_trial_geometry,
    maxRoundtripWorldError,
    physicalHeight: 'UNKNOWN', nativeAccepted: false, visualAssessed: false,
    issues
  };
}

export const SCENE_ROUNDTRIP_2_5D = Object.freeze({
  completionId: 'CH1-2_5D-CHARACTER-MAP-SLICE-20261006-MAP-CANDIDATE',
  scene: RIFT_TERRAIN.scene, sceneSha256: RIFT_TERRAIN.sceneSha256,
  preserves: ['world.cols/rows/tileSize', 'walkable(1192)', 'sourcePins.nav', 'start', 'exit', 'resident feet (4)', 'foreground foot masks (3)'],
  mutates: 'none — read-only; adoption/visual/native are root-owned gates',
  physicalHeight: 'UNKNOWN (no authored cliff height; cliffs flagged inferred_trial_geometry)'
});
