/* MAP rift foreground-registry 2.5D consumer v2 — CH1-RIFT-QUALITY-FIX-20261007-FOREGROUND-CONTRACT-V2-CANDIDATE
 *
 * Read-only. Writes NO source/scene/nav/sourcePNG/pixels/public/game/save. Standalone (does NOT import the v1 raw).
 * Fixes four real defects in the v1 candidate (1a9f6ac3…, kept unmodified as history):
 *   1) renderOrder used arbitrary 10+idx. v2 uses the ROOT shared continuous foot order
 *      riftResidentFootOrder(footY) = 30 + (footY-4320)/8000*10 (rift-resident-billboards.mjs:39-41,:201;
 *      comment :38 "use this same continuous order for hero meshes; east horn remains order 30").
 *   2) texture=null/invalid must NOT be promoted to BUILT. v2 requires a valid THREE texture (isTexture===true);
 *      otherwise PENDING (no GPU/visual claim).
 *   3) Canonical contract enforced: world 8000×8000, angle 50, scale 400, exactly 3 objects, and per-object
 *      opacity / layer visibility / pivot(0,1) / crop-in-bounds / mask checks.
 *   4) resources/throw/dispose: build is throw-safe (partial resources disposed on error) and dispose() is idempotent.
 *
 * Grounded (source:line): foreground mesh/UV/footY contract rift-terrain.mjs:157,:160,:162-163; projection
 *   scene-registration.mjs:80-86; shared foot order rift-resident-billboards.mjs:39-41; pins rift-terrain.mjs:10-11.
 */
import '../../../map-scene-core.js';
import { RIFT_TERRAIN } from '../../../2_5d/rift-terrain.mjs';
import { projection, compareToCanonical } from '../../../2_5d/scene-registration.mjs';
import { riftResidentFootOrder } from '../../../2_5d/rift-resident-billboards.mjs';

const K = globalThis.MapSceneCore;
const FOREGROUND_IDS = Object.freeze(['obj-west-root', 'obj-east-horn', 'obj-south-root']);
const PLATE_SRC = 'assets/map/hell_rift/resident_layers_20261006/clean-plate-v1.png';
const PLATE_SIZE = 1254, CANON = Object.freeze({ world: 8000, angle: 50, scale: 400 });

export function foregroundRegistry(scene, { worldSize = CANON.world } = {}) {
  const p = K.validate(scene);
  const foot = p.layers.find(l => l.id === 'foot');
  const worldW = p.world.cols * p.world.tileSize, worldH = p.world.rows * p.world.tileSize;
  const canonical = worldW === CANON.world && worldH === CANON.world;
  if (!foot) return { ok: false, canonical, reason: 'foot layer 없음', entries: [] };
  const entries = [];
  for (const id of FOREGROUND_IDS) {
    const o = foot.objects.find(x => x.id === id);
    if (!o) { entries.push({ objectId: id, status: 'FAIL', reason: '객체 없음' }); continue; }
    const a = p.assets.find(x => x.id === o.assetId);
    const issues = [];
    if (!foot.visible) issues.push('foot layer 비표시 (visibility)');
    if (!a) issues.push('asset 없음');
    if (a && a.src !== PLATE_SRC) issues.push('src≠clean-plate (원PNG cutout 아님): ' + a.src);
    if (a && (a.width !== PLATE_SIZE || a.height !== PLATE_SIZE)) issues.push('asset 크기≠' + PLATE_SIZE);
    if (a && (a.crop.x < 0 || a.crop.y < 0 || a.crop.x + a.crop.w > a.width || a.crop.y + a.crop.h > a.height)) issues.push('crop 범위 밖');
    if ((o.maskFeather ?? 0) !== 0) issues.push('maskFeather≠0 (전경 cutout은 hard clip; alphaFeather0 보존 위반)');
    if (o.pivotX !== 0 || o.pivotY !== 1) issues.push('pivot≠(0,1)');
    if (o.rotation !== 0 || o.flipX) issues.push('rotation/flip 미지원 (UNKNOWN)');
    if (!(typeof o.opacity === 'number' && o.opacity >= 0 && o.opacity <= 1)) issues.push('opacity 범위 오류');
    if (!o.mask || o.mask.length < 3) issues.push('mask 부족');
    const left = o.x, top = o.y - o.height;
    const worldPolygon = (o.mask || []).map(([mx, my]) => [left + mx * o.width, top + my * o.height]);
    const atlasUV = a ? worldPolygon.map(([px, py]) => [(a.crop.x + (px - left) / o.width * a.crop.w) / PLATE_SIZE, 1 - (a.crop.y + (py - top) / o.height * a.crop.h) / PLATE_SIZE]) : [];
    const globalUV = worldPolygon.map(([px, py]) => [px / worldSize, 1 - py / worldSize]);
    entries.push({
      objectId: id, footY: o.y, renderOrder: riftResidentFootOrder(o.y), status: issues.length ? 'FAIL' : 'VERIFIED', issues,
      xy: { x: o.x, y: o.y, width: o.width, height: o.height, pivotX: o.pivotX, pivotY: o.pivotY }, opacity: o.opacity, maskFeather: o.maskFeather ?? 0,
      assetId: o.assetId, src: a?.src, cleanPlateSha256: RIFT_TERRAIN.cleanPlateSha256, crop: a ? { ...a.crop } : null,
      maskPts: (o.mask || []).length, worldPolygon, atlasUV, globalUV
    });
  }
  entries.sort((x, y) => x.footY - y.footY);
  return { ok: canonical && entries.length === 3 && entries.every(e => e.status === 'VERIFIED'), canonical, count: entries.length, orderByFootY: entries.map(e => e.objectId), entries };
}

export function createForegroundOccluders(scene, { THREE = null, angle = CANON.angle, scale = CANON.scale, plateTexture = null } = {}) {
  const reg = foregroundRegistry(scene);
  if (!reg.canonical) return { status: 'FAIL', reason: 'world≠8000² (non-canonical)', registry: reg };
  if (angle !== CANON.angle || scale !== CANON.scale) return { status: 'UNKNOWN', reason: 'non-canonical angle/scale (order 보정 불일치)', registry: reg };
  if (!reg.ok) return { status: 'FAIL', reason: 'registry 검증 실패', diffs: reg.entries.flatMap(e => e.issues || []) };
  if (!THREE || !THREE.ShapeUtils?.triangulateShape || !THREE.Group || !THREE.BufferGeometry) return { status: 'PENDING', reason: 'Three/GPU 미제공 — 실제 메시/화면 미관찰', orderByFootY: reg.orderByFootY, registry: reg };
  if (!(plateTexture && plateTexture.isTexture === true)) return { status: 'PENDING', reason: 'clean-plate 텍스처 미제공/무효 (null·invalid→BUILT 승격0)', orderByFootY: reg.orderByFootY, registry: reg };
  const proj = projection({ angle, scale }), theta = angle * Math.PI / 180;
  const group = new THREE.Group(); group.name = 'rift-foreground-registry-v2';
  const resources = [], occluders = [];
  let disposed = false;
  const dispose = () => { if (disposed) return; disposed = true; for (const r of resources) { try { r.dispose?.(); } catch { /* idempotent-safe */ } } group.removeFromParent?.(); resources.length = 0; };
  try {
    for (const e of reg.entries) {
      const points = e.worldPolygon, pos = [], uv = [];
      const tris = THREE.ShapeUtils.triangulateShape(points.map(q => new THREE.Vector2(q[0], q[1])), []);
      for (const tri of tris) for (const i of tri) { const pt = points[i], av = e.atlasUV[i]; pos.push((pt[0] - e.xy.x) / scale, (e.xy.y - pt[1]) / scale, 0); uv.push(av[0], av[1]); }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      const mat = new THREE.MeshBasicMaterial({ map: plateTexture, transparent: true, alphaTest: 0.01, side: THREE.DoubleSide });
      resources.push(g, mat);
      const mesh = new THREE.Mesh(g, mat); mesh.name = e.objectId;
      const s = proj.worldToScene(e.xy.x, e.xy.y); mesh.position.set(s.x, s.y, s.z);
      mesh.rotation.x = -theta; mesh.renderOrder = e.renderOrder;   // shared continuous foot order
      group.add(mesh);
      occluders.push({ objectId: e.objectId, footY: e.footY, renderOrder: e.renderOrder, object3d: mesh, polygon: points.map(q => ({ x: q[0], y: q[1] })), atlasUV: e.atlasUV });
    }
  } catch (e) { dispose(); return { status: 'FAIL', reason: '메시 생성 실패: ' + e.message }; }
  return {
    status: 'BUILT', object3d: group, occluders, orderByFootY: reg.orderByFootY, dispose,
    snapshot: () => ({ count: occluders.length, orderByFootY: reg.orderByFootY, renderOrders: occluders.map(o => +o.renderOrder.toFixed(4)), feather: 0, newPixels: 0, source: 'clean-plate cutout', disposed, gpuObserved: false, visualAccepted: false })
  };
}

export function compareForegroundRegistration(scene, canonical) {
  const whole = compareToCanonical(scene, canonical);
  return { ok: whole.ok, foregroundDiffs: whole.diffs.filter(d => FOREGROUND_IDS.some(id => d.includes(id)) || d.startsWith('assets') || d.startsWith('layers')), allDiffs: whole.diffs };
}

export const RIFT_FOREGROUND_REGISTRY_V2 = Object.freeze({
  completionId: 'CH1-RIFT-QUALITY-FIX-20261007-FOREGROUND-CONTRACT-V2-CANDIDATE',
  supersedes: 'rift-foreground-registry-2_5d.candidate.mjs (v1, unmodified)',
  foregroundIds: FOREGROUND_IDS, scene: RIFT_TERRAIN.scene, cleanPlateSha256: RIFT_TERRAIN.cleanPlateSha256,
  orderFormula: 'riftResidentFootOrder(footY) = 30 + (footY-4320)/8000*10 (shared actor/resident/foreground)',
  canonical: CANON, textureRequiredForBuilt: true, disposeIdempotent: true,
  mutates: 'none — read-only; actual Three mesh + GPU/same-camera visual review are root-owned gates (PENDING)'
});
