/* MAP rift foreground VIEW-DATA consumer — CH1-RIFT-CONSUMER-LINK-20261007-FOREGROUND-VIEW-DATA-CANDIDATE
 *
 * Read-only browser-consumer DATA builder. Does NOT replace/modify root's renderer, occluders, or nav-alpha shader.
 * Produces per-foreground diagnostics (order / original crop·source / nav pin / nonWalkableOnly / bounds) from a
 * validated canonical scene, and merges a REAL public terrain snapshot when observed; otherwise UNKNOWN/unobserved.
 *
 * Grounded (source:line):
 *   - foreground build + renderOrder 30+(y-4320)/8000*10 + nav-alpha shader (nonWalkableOnly) — rift-terrain.mjs:162-189
 *   - terrain snapshot.foreground {objectId,footY,renderOrder,opacity,maskPoints,triangles,sourceCrop,feather,nonWalkableOnly}
 *     + openingComposite.opacity (abyss 0.38) — rift-terrain.mjs:195
 *   - shared foot order riftResidentFootOrder — rift-resident-billboards.mjs:39-41
 *   - character idle/active wave 0.32/1 (rig-side, NOT foreground) — character-rigs.mjs:113
 *   - pins (scene c508e70d…, cleanPlate aa64cb7b…) — rift-terrain.mjs:10-11
 */
import '../../../map-scene-core.js';
import { RIFT_TERRAIN } from '../../../2_5d/rift-terrain.mjs';
import { riftResidentFootOrder } from '../../../2_5d/rift-resident-billboards.mjs';

const K = globalThis.MapSceneCore;
const FOREGROUND_IDS = Object.freeze(['obj-west-root', 'obj-east-horn', 'obj-south-root']);
const PLATE_SRC = 'assets/map/hell_rift/resident_layers_20261006/clean-plate-v1.png';
const PLATE_SIZE = 1254, WORLD = 8000;
/* Distinct opacity references — a foreground is material opacity 1, never the abyss .38 or the rig wave .32. */
export const OPACITY_REFERENCE = Object.freeze({ foreground: 1, abyssOpening: 0.38, characterIdleWave: 0.32, characterActiveWave: 1, note: 'distinct; arbitrary/.25 opacity or 16² placeholder is not a valid foreground' });

function polyBounds(points) {
  const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
  return { left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
}
function pointInPoly(poly, x, y) { let inside = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside; } return inside; }
/* Raw footprint walkable overlap (diagnostic). Root zeroes foreground alpha over walkable tiles in-shader. */
function footprintWalkableTiles(scene, poly, bounds) {
  const t = scene.world.tileSize; let walk = 0, total = 0;
  for (let ty = Math.floor(bounds.top / t); ty <= Math.floor(bounds.bottom / t); ty++)
    for (let tx = Math.floor(bounds.left / t); tx <= Math.floor(bounds.right / t); tx++) {
      const cx = tx * t + t / 2, cy = ty * t + t / 2;
      if (!pointInPoly(poly, cx, cy)) continue; total++;
      if (K.canWalk(scene, cx, cy, 0)) walk++;
    }
  return { interiorTiles: total, walkableTiles: walk };
}

export function foregroundViewData(scene, { terrainSnapshot = null } = {}) {
  const p = K.validate(scene);
  const worldW = p.world.cols * p.world.tileSize, worldH = p.world.rows * p.world.tileSize;
  const canonicalWorld = worldW === WORLD && worldH === WORLD;
  const foot = p.layers.find(l => l.id === 'foot');
  const pinCheck = {
    kind: 'declared-match (not byte-hash; hashing needs canonical bytes)',
    scene: { declared: RIFT_TERRAIN.sceneSha256, scenePinNav: p.sourcePins?.nav, cleanPlate: p.sourcePins?.cleanPlate },
    cleanPlateMatches: p.sourcePins?.cleanPlate === RIFT_TERRAIN.cleanPlateSha256,
    navPresent: typeof p.sourcePins?.nav === 'string'
  };
  const foregrounds = [];
  for (const id of FOREGROUND_IDS) {
    const o = foot?.objects.find(x => x.id === id); if (!o) { foregrounds.push({ objectId: id, status: 'FAIL', reason: '객체 없음' }); continue; }
    const a = p.assets.find(x => x.id === o.assetId);
    const issues = [];
    if (!a || a.src !== PLATE_SRC) issues.push('src≠clean-plate');
    if (a && (a.width !== PLATE_SIZE || a.height !== PLATE_SIZE)) issues.push('plate≠1254²');
    if (o.opacity !== OPACITY_REFERENCE.foreground) issues.push('opacity≠1 (' + o.opacity + ')');
    if ((o.maskFeather ?? 0) !== 0) issues.push('feather≠0');
    if (o.pivotX !== 0 || o.pivotY !== 1) issues.push('pivot≠(0,1)');
    const points = (o.mask || []).map(([mx, my]) => [o.x + mx * o.width, (o.y - o.height) + my * o.height]);
    const bounds = polyBounds(points);
    const fp = footprintWalkableTiles(p, points, bounds);
    foregrounds.push({
      objectId: id, footY: o.y, renderOrder: riftResidentFootOrder(o.y), sceneOpacity: o.opacity,
      source: a?.src, sourceCrop: a ? { ...a.crop } : null, cleanPlateSha256: RIFT_TERRAIN.cleanPlateSha256,
      maskPoints: (o.mask || []).length, bounds,
      footprintWalkableTiles: fp,
      nonWalkableOnly: { renderedShaderEnforced: true, source: 'rift-terrain.mjs:189 nav-alpha shader zeroes alpha over walkable', rawFootprintWalkableTiles: fp.walkableTiles },
      status: issues.length ? 'FAIL' : 'VERIFIED', issues
    });
  }
  foregrounds.sort((x, y) => (x.footY ?? 0) - (y.footY ?? 0));

  let snapshot;
  if (terrainSnapshot && Array.isArray(terrainSnapshot.foreground)) {
    const byId = new Map(terrainSnapshot.foreground.map(f => [f.objectId, f]));
    const consistency = foregrounds.filter(f => f.status === 'VERIFIED').map(f => {
      const s = byId.get(f.objectId); if (!s) return { objectId: f.objectId, ok: false, reason: 'snapshot 누락' };
      const orderOk = Math.abs((s.renderOrder ?? NaN) - f.renderOrder) < 1e-6;
      const opacityOk = s.opacity === OPACITY_REFERENCE.foreground;
      const cropOk = s.sourceCrop && s.sourceCrop.x === f.sourceCrop.x && s.sourceCrop.w === f.sourceCrop.w;
      return { objectId: f.objectId, ok: orderOk && opacityOk && cropOk && s.nonWalkableOnly === true && (s.feather ?? 0) === 0, orderOk, opacityOk, cropOk, nonWalkableOnly: s.nonWalkableOnly, opacity: s.opacity };
    });
    snapshot = {
      observed: true, sourceSceneMatches: terrainSnapshot.sourceSceneSha256 === RIFT_TERRAIN.sceneSha256,
      walkableCount: terrainSnapshot.walkableCount, openingOpacity: terrainSnapshot.openingComposite?.opacity,
      foreground: terrainSnapshot.foreground, consistency, consistent: consistency.every(c => c.ok),
      gpuObserved: false, visualAccepted: false, note: 'snapshot is public data; GPU/screen itself not observed headless'
    };
  } else {
    snapshot = { observed: false, status: 'UNKNOWN', reason: '실제 public terrain snapshot 미제공 (브라우저/GPU 미관측)' };
  }

  return {
    completionId: 'CH1-RIFT-CONSUMER-LINK-20261007-FOREGROUND-VIEW-DATA-CANDIDATE',
    world: { width: worldW, height: worldH, canonical: canonicalWorld, expected: WORLD },
    plate: { size: PLATE_SIZE, src: PLATE_SRC, pin: RIFT_TERRAIN.cleanPlateSha256 },
    pinCheck, opacityReference: OPACITY_REFERENCE,
    foregrounds, orderByFootY: foregrounds.map(f => f.objectId),
    snapshot, height: 'UNKNOWN', nativeAccepted: false, visualAccepted: false,
    ok: canonicalWorld && pinCheck.cleanPlateMatches && pinCheck.navPresent && foregrounds.length === 3 && foregrounds.every(f => f.status === 'VERIFIED')
  };
}

export const RIFT_FOREGROUND_VIEW_DATA = Object.freeze({
  completionId: 'CH1-RIFT-CONSUMER-LINK-20261007-FOREGROUND-VIEW-DATA-CANDIDATE',
  role: 'read-only browser consumer data; no renderer/occluder/shader change',
  scene: RIFT_TERRAIN.scene, cleanPlateSha256: RIFT_TERRAIN.cleanPlateSha256, foregroundIds: FOREGROUND_IDS,
  distinguishes: 'foreground opacity 1 vs abyss 0.38 vs character wave 0.32/1; observed snapshot vs UNKNOWN unobserved',
  mutates: 'none — read-only; actual GPU/same-camera visual review are root-owned gates (PENDING)'
});
