/* MAP rift foreground-registry 2.5D consumer — CH1-RIFT-QUALITY-NEXT-20261007-FOREGROUND-REGISTRY-CANDIDATE
 *
 * Read-only. Writes NO source/scene/nav/sourcePNG/public/game/save. Original clean-plate PNG cutouts only; no new pixels.
 * Root terrain foreground-sorts ONLY obj-east-horn (tools/2_5d/rift-terrain.mjs:157-163). This registry + Three
 * caller consumes ALL THREE foot foregrounds (west-root/east-horn/south-root) with the exact object
 * XY/pivot/mask/atlasUV/globalUV/footY-order contract. Residents are a separate consumer. Height is not inferred.
 *
 * Grounded (source:line):
 *   - foreground mesh/UV/footY contract — tools/2_5d/rift-terrain.mjs:157 (points), :160 (positions+atlasUV), :163 (occluder{objectId,footY,polygon})
 *   - projection worldToScene/sceneToWorld — tools/2_5d/scene-registration.mjs:80-86 (ROOT-ADOPTED consumer)
 *   - clean-plate pin aa64cb7b… + scene pin — tools/2_5d/rift-terrain.mjs:10-11
 *   - foreground objects maskFeather=0 (hard clip), pivot(0,1), opacity1, src=clean-plate — v2 scene
 */
import '../../../map-scene-core.js';
import { RIFT_TERRAIN } from '../../../2_5d/rift-terrain.mjs';
import { projection, compareToCanonical } from '../../../2_5d/scene-registration.mjs';

const K = globalThis.MapSceneCore;
const FOREGROUND_IDS = Object.freeze(['obj-west-root', 'obj-east-horn', 'obj-south-root']);
const PLATE_SRC = 'assets/map/hell_rift/resident_layers_20261006/clean-plate-v1.png';
const PLATE_SIZE = 1254, WORLD = 8000;

/* Exact per-object contract + full source pin/spec verification. Order: footY ascending (back→front). */
export function foregroundRegistry(scene, { worldSize = WORLD } = {}) {
  const p = K.validate(scene);
  const foot = p.layers.find(l => l.id === 'foot');
  if (!foot) return { ok: false, reason: 'foot layer 없음', entries: [] };
  const entries = [];
  for (const id of FOREGROUND_IDS) {
    const o = foot.objects.find(x => x.id === id);
    if (!o) { entries.push({ objectId: id, status: 'FAIL', reason: '객체 없음' }); continue; }
    const a = p.assets.find(x => x.id === o.assetId);
    const issues = [];
    if (!a) issues.push('asset 없음');
    if (a && a.src !== PLATE_SRC) issues.push('src≠clean-plate (원PNG cutout 아님): ' + a.src);
    if (a && (a.width !== PLATE_SIZE || a.height !== PLATE_SIZE)) issues.push('asset 크기≠' + PLATE_SIZE);
    if (a && (a.crop.x < 0 || a.crop.y < 0 || a.crop.x + a.crop.w > a.width || a.crop.y + a.crop.h > a.height)) issues.push('crop 범위 밖');
    if ((o.maskFeather ?? 0) !== 0) issues.push('maskFeather≠0 (전경 cutout은 hard clip; alphaFeather0 보존 위반)');
    if (o.pivotX !== 0 || o.pivotY !== 1) issues.push('pivot≠(0,1)');
    if (o.rotation !== 0 || o.flipX) issues.push('rotation/flip 미지원 (UNKNOWN)');
    if (!o.mask || o.mask.length < 3) issues.push('mask 부족');
    const left = o.x, top = o.y - o.height;   // pivot(0,1)
    const worldPolygon = (o.mask || []).map(([mx, my]) => [left + mx * o.width, top + my * o.height]);
    const atlasUV = a ? worldPolygon.map(([px, py]) => [(a.crop.x + (px - left) / o.width * a.crop.w) / PLATE_SIZE, 1 - (a.crop.y + (py - top) / o.height * a.crop.h) / PLATE_SIZE]) : [];
    const globalUV = worldPolygon.map(([px, py]) => [px / worldSize, 1 - py / worldSize]);
    entries.push({
      objectId: id, footY: o.y, status: issues.length ? 'FAIL' : 'VERIFIED', issues,
      xy: { x: o.x, y: o.y, width: o.width, height: o.height, pivotX: o.pivotX, pivotY: o.pivotY }, opacity: o.opacity, maskFeather: o.maskFeather ?? 0,
      assetId: o.assetId, src: a?.src, cleanPlateSha256: RIFT_TERRAIN.cleanPlateSha256, crop: a ? { ...a.crop } : null,
      maskPts: (o.mask || []).length, worldPolygon, atlasUV, globalUV
    });
  }
  entries.sort((x, y) => x.footY - y.footY);   // footY-order contract: ascending (back→front)
  return { ok: entries.every(e => e.status === 'VERIFIED'), count: entries.length, orderByFootY: entries.map(e => e.objectId), entries };
}

/* Three caller — builds all three foreground cutout meshes exactly as rift-terrain.mjs:157-163, generalized.
 * Original clean-plate texture only (no new pixel). Requires THREE; without it → PENDING (GPU unobserved).
 * Caller owns lifetime via dispose(). alphaTest keeps hard-clip (feather=0) cutouts. */
export function createForegroundOccluders(scene, { THREE = null, angle = 50, scale = 400, plateTexture = null } = {}) {
  const reg = foregroundRegistry(scene);
  if (!reg.ok) return { status: 'FAIL', reason: 'registry 검증 실패', diffs: reg.entries.flatMap(e => e.issues || []) };
  if (!THREE || !THREE.ShapeUtils?.triangulateShape || !THREE.Group || !THREE.BufferGeometry) return { status: 'PENDING', reason: 'Three/GPU 미제공 — 실제 메시/화면 미관찰', orderByFootY: reg.orderByFootY, registry: reg };
  const proj = projection({ angle, scale }), theta = angle * Math.PI / 180, group = new THREE.Group(); group.name = 'rift-foreground-registry';
  const resources = [], occluders = [];
  reg.entries.forEach((e, idx) => {
    const points = e.worldPolygon, pos = [], uv = [];
    const tris = THREE.ShapeUtils.triangulateShape(points.map(q => new THREE.Vector2(q[0], q[1])), []);
    for (const tri of tris) for (const i of tri) {
      const pt = points[i], av = e.atlasUV[i];
      pos.push((pt[0] - e.xy.x) / scale, (e.xy.y - pt[1]) / scale, 0);
      uv.push(av[0], av[1]);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    const mat = new THREE.MeshBasicMaterial(plateTexture ? { map: plateTexture, transparent: true, alphaTest: 0.01, side: THREE.DoubleSide } : { transparent: true, side: THREE.DoubleSide });
    resources.push(g, mat);
    const mesh = new THREE.Mesh(g, mat); mesh.name = e.objectId;
    const s = proj.worldToScene(e.xy.x, e.xy.y); mesh.position.set(s.x, s.y, s.z);
    mesh.rotation.x = -theta; mesh.renderOrder = 10 + idx;   // footY-ascending draw order
    group.add(mesh);
    occluders.push({ objectId: e.objectId, footY: e.footY, object3d: mesh, polygon: points.map(q => ({ x: q[0], y: q[1] })), atlasUV: e.atlasUV });
  });
  return {
    status: 'BUILT', object3d: group, occluders, orderByFootY: reg.orderByFootY,
    dispose() { for (const r of resources) r.dispose?.(); group.removeFromParent?.(); },
    snapshot: () => ({ count: occluders.length, orderByFootY: reg.orderByFootY, feather: 0, newPixels: 0, source: 'clean-plate cutout', gpuObserved: false, visualAccepted: false })
  };
}

/* Fail-closed registration vs canonical for the 3 foregrounds (reuses ROOT-ADOPTED compareToCanonical). */
export function compareForegroundRegistration(scene, canonical) {
  const whole = compareToCanonical(scene, canonical);
  const fgDiffs = whole.diffs.filter(d => FOREGROUND_IDS.some(id => d.includes(id)) || d.startsWith('assets') || d.startsWith('layers'));
  return { ok: whole.ok, foregroundDiffs: fgDiffs, allDiffs: whole.diffs };
}

export const RIFT_FOREGROUND_REGISTRY = Object.freeze({
  completionId: 'CH1-RIFT-QUALITY-NEXT-20261007-FOREGROUND-REGISTRY-CANDIDATE',
  foregroundIds: FOREGROUND_IDS, scene: RIFT_TERRAIN.scene, cleanPlateSha256: RIFT_TERRAIN.cleanPlateSha256,
  contract: 'object XY/pivot/mask/atlasUV(crop/1254)/globalUV(world/8000)/footY-order; feather=0 hard clip; clean-plate cutout only, no new pixel',
  rootTerrain: 'rift-terrain.mjs sorts only east-horn; this registry covers all 3',
  mutates: 'none — read-only; actual Three mesh + GPU/same-camera visual review are root-owned gates (PENDING)'
});
