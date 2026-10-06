/* Read-only, static resident artwork consumer for the independent 2.5D lab.
 * The source scene, atlas, navigation and foot coordinates are never written.
 * Display enlargement is explicit; it is not a new rig, animation or gameplay NPC.
 */
import { RESIDENT_PREVIEW, RESIDENT_GROUNDING, residentPaintingProfile } from '../map-scene-rift-residents.mjs';

export const RIFT_RESIDENT_BILLBOARDS = Object.freeze({
  sceneSha256: 'c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a',
  navSha256: 'a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179',
  atlas: RESIDENT_PREVIEW.atlas,
  atlasSha256: RESIDENT_PREVIEW.atlasSha256,
  atlasSize: RESIDENT_PREVIEW.size,
  defaultDisplayScale: 1.8,
  minDisplayScale: .5,
  maxDisplayScale: 3,
  footBoundaryY: 4320,
  footOrderAtBoundary: 30,
  footOrderWorldSpan: 8000,
  footOrderSpan: 10,
  shadowOrder: 15,
  shadowSceneHeight: .002,
  shadowOpacity: .26,
  shadowSegments: 48
});
const rootURL = new URL('../../', import.meta.url);
const identities = Object.freeze([
  Object.freeze({ key: 'haran', npcId: 'rift-rest-haran', x: 4660, y: 6660 }),
  Object.freeze({ key: 'berin', npcId: 'rift-gift-berin', x: 6020, y: 5580 }),
  Object.freeze({ key: 'nessa', npcId: 'rift-request-nessa', x: 6300, y: 5020 }),
  Object.freeze({ key: 'dorik', npcId: 'rift-prepare-dorik', x: 5220, y: 2500 })
]);
const finite = (value, label) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(label + ' 유한수 오류');
  return value;
};
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/** Use this same continuous order for hero meshes; the east horn remains order 30. */
export function riftResidentFootOrder(footY) {
  const c = RIFT_RESIDENT_BILLBOARDS;
  return c.footOrderAtBoundary + (finite(footY, '주민 발 Y') - c.footBoundaryY) / c.footOrderWorldSpan * c.footOrderSpan;
}

async function loadPinnedAtlas(THREE, resources) {
  const c = RIFT_RESIDENT_BILLBOARDS;
  const response = await fetch(new URL(c.atlas, rootURL), { cache: 'no-store', redirect: 'error' });
  if (!response.ok) throw new Error('주민 원자료 로딩 실패: HTTP ' + response.status);
  const bytes = await response.arrayBuffer();
  if (!globalThis.crypto?.subtle) throw new Error('주민 SHA256 검증을 사용할 수 없습니다');
  const hash = Array.from(new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
  if (hash !== c.atlasSha256) throw new Error('주민 원자료 SHA256 불일치');
  const url = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (image.naturalWidth !== c.atlasSize || image.naturalHeight !== c.atlasSize) throw new Error('주민 원본 이미지 크기 불일치');
    const texture = new THREE.Texture(image);
    resources.add(texture);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    // Independent atlas UVs must not sample neighbouring residents through atlas mipmaps.
    texture.generateMipmaps = false;
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;
    return { texture, byteLength: bytes.byteLength, hash };
  } finally { URL.revokeObjectURL(url); }
}

function sourceResidents(terrain) {
  const c = RIFT_RESIDENT_BILLBOARDS, info = terrain.snapshot(), source = terrain.sourceSceneSnapshot();
  if (info.disposed || info.sourceSceneSha256 !== c.sceneSha256 || info.navSha256 !== c.navSha256 ||
      source.sourcePins?.residentAtlas !== c.atlasSha256 || !residentPaintingProfile(source)) {
    throw new Error('주민 정본 scene/profile 등록 불일치');
  }
  const scale = finite(info.scale, '주민 지형 배율'), angle = finite(info.angle, '주민 지형 각도');
  if (scale <= 0 || angle < 10 || angle > 85) throw new Error('주민 지형 배율/각도 범위 오류');
  const foot = source.layers.find(l => l.id === 'foot');
  const residents = identities.map(identity => {
    const objectId = 'obj-resident-' + identity.key, assetId = 'resident-' + identity.key;
    const objects = source.layers.flatMap(l => l.objects).filter(o => o.id === objectId);
    const assets = source.assets.filter(a => a.id === assetId);
    if (objects.length !== 1 || assets.length !== 1 || !foot.objects.includes(objects[0])) throw new Error('주민 원자료 identity 불일치: ' + identity.key);
    const o = objects[0], a = assets[0];
    if (o.assetId !== assetId || o.x !== identity.x || o.y !== identity.y ||
        o.maskFeather !== undefined || o.sourceParallax !== undefined || a.src !== c.atlas ||
        a.width !== c.atlasSize || a.height !== c.atlasSize) throw new Error('주민 원자료 변형/발 좌표 불일치: ' + identity.key);
    // The helper validates exact crop, pivot (.5,1), aspect, rotation 0 and opacity 1.
    return { npcId: identity.npcId, objectId, assetId, name: o.name,
      x: o.x, y: o.y, width: o.width, height: o.height,
      pivotX: o.pivotX, pivotY: o.pivotY, rotation: o.rotation,
      opacity: o.opacity, flipX: o.flipX, crop: { ...a.crop } };
  });
  return { residents, scale, angle, sourceSceneSha256: info.sourceSceneSha256, navSha256: info.navSha256 };
}

/**
 * One verified atlas texture, four UV-cropped camera-facing bodies and ground shadows.
 * update() belongs to the caller's existing RAF; no input, timer, scene/save write,
 * dialogue, reward, skeletal motion or runtime lighting grade is introduced here.
 */
export async function createRiftResidentBillboards({ THREE, terrain, camera, scene,
  displayScale = RIFT_RESIDENT_BILLBOARDS.defaultDisplayScale } = {}) {
  const c = RIFT_RESIDENT_BILLBOARDS;
  finite(displayScale, '주민 표시 배율');
  if (displayScale < c.minDisplayScale || displayScale > c.maxDisplayScale) throw new Error('주민 표시 배율 범위 오류 (.5…3)');
  if (!THREE?.Group || !THREE.PlaneGeometry || !THREE.CircleGeometry || !THREE.MeshBasicMaterial ||
      !THREE.Mesh || !THREE.Texture || !THREE.Quaternion || !scene?.add || !scene?.remove ||
      !camera?.getWorldQuaternion || !terrain?.sourceSceneSnapshot || !terrain?.snapshot ||
      !terrain?.worldToScene || !terrain?.canWalk) throw new Error('주민 2.5D 소비자 런타임이 없습니다');
  const data = sourceResidents(terrain), object3d = new THREE.Group(), resources = new Set(), bodies = [];
  object3d.name = 'Hell Rift · source-preserving resident billboards';
  const cameraQuaternion = new THREE.Quaternion();
  const actor = { x: 0, y: 0 };
  let disposed = false, atlas = null, attached = false, actorKnown = false, cleanupErrors = [];
  const clean = () => {
    if (disposed) return;
    disposed = true;
    if (attached) { scene.remove(object3d); attached = false; }
    object3d.clear();
    for (const resource of resources) {
      try { resource.dispose(); } catch (error) { cleanupErrors.push(String(error?.message || error)); }
    }
    resources.clear();
    if (atlas?.texture) atlas.texture.image = null;
  };
  const records = () => bodies.map(({ source: s, width, height, mesh, shadow, radiusX, radiusY }) => ({
    npcId: s.npcId, objectId: s.objectId, assetId: s.assetId, name: s.name, x: s.x, y: s.y,
    source: { width: s.width, height: s.height, pivotX: s.pivotX, pivotY: s.pivotY,
      rotation: s.rotation, opacity: s.opacity, flipX: s.flipX, crop: { ...s.crop } },
    display: { scale: displayScale, width, height, sceneWidth: width / data.scale,
      sceneHeight: height / data.scale, pivotX: s.pivotX, pivotY: s.pivotY },
    renderOrder: mesh.renderOrder, visible: !disposed && object3d.visible && mesh.visible,
    shadow: { visible: !disposed && object3d.visible && shadow.visible, radiusX, radiusY,
      renderOrder: c.shadowOrder, sceneHeight: c.shadowSceneHeight, opacity: c.shadowOpacity },
    distance: actorKnown ? Math.hypot(s.x - actor.x, s.y - actor.y) : null
  }));
  const update = (actorX, actorY) => {
    if (disposed) return false;
    if (actorX !== undefined || actorY !== undefined) {
      const x = finite(actorX, '주민 관측 player X'), y = finite(actorY, '주민 관측 player Y');
      actor.x = x; actor.y = y; actorKnown = true;
    }
    if (terrain.snapshot().disposed) { clean(); return false; }
    camera.getWorldQuaternion(cameraQuaternion);
    if (!Number.isFinite(cameraQuaternion.x) || !Number.isFinite(cameraQuaternion.y) ||
        !Number.isFinite(cameraQuaternion.z) || !Number.isFinite(cameraQuaternion.w)) {
      clean(); throw new Error('주민 camera quaternion 불일치');
    }
    for (const b of bodies) b.foot.quaternion.copy(cameraQuaternion);
    return true;
  };
  try {
    atlas = await loadPinnedAtlas(THREE, resources);
    if (terrain.snapshot().disposed) throw new Error('주민 로딩 중 지형이 종료되었습니다');
    const shadowGeometry = new THREE.CircleGeometry(1, c.shadowSegments);
    resources.add(shadowGeometry);
    const shadowMaterial = new THREE.MeshBasicMaterial({ color: 0x030a0c, transparent: true,
      opacity: c.shadowOpacity, depthTest: false, depthWrite: false, side: THREE.DoubleSide });
    resources.add(shadowMaterial);
    const sin = Math.sin(data.angle * Math.PI / 180), g = RESIDENT_GROUNDING;
    for (const s of data.residents) {
      const width = s.width * displayScale, height = s.height * displayScale;
      const geometry = new THREE.PlaneGeometry(width / data.scale, height / data.scale);
      resources.add(geometry);
      geometry.translate((.5 - s.pivotX) * width / data.scale, (s.pivotY - .5) * height / data.scale, 0);
      const uv = geometry.getAttribute('uv');
      for (let i = 0; i < uv.count; i++) uv.setXY(i,
        (s.crop.x + uv.getX(i) * s.crop.w) / c.atlasSize,
        1 - (s.crop.y + (1 - uv.getY(i)) * s.crop.h) / c.atlasSize);
      uv.needsUpdate = true;
      const material = new THREE.MeshBasicMaterial({ map: atlas.texture, side: THREE.DoubleSide,
        transparent: true, opacity: s.opacity, depthTest: false, depthWrite: false, toneMapped: false });
      resources.add(material);
      const mesh = new THREE.Mesh(geometry, material), foot = new THREE.Group();
      mesh.name = s.objectId; mesh.rotation.z = -s.rotation * Math.PI / 180;
      mesh.scale.x = s.flipX ? -1 : 1; mesh.renderOrder = riftResidentFootOrder(s.y);
      foot.name = s.npcId + ' · source foot'; foot.position.copy(terrain.worldToScene(s.x, s.y));
      foot.add(mesh); object3d.add(foot);
      // Shared lab-style ground ellipse, not the editor's nav-clipped radial paint.
      const radiusX = clamp(width * g.widthRatio, g.minRadiusX, g.maxRadiusX);
      const radiusY = clamp(height * g.heightRatio, g.minRadiusY, g.maxRadiusY);
      const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
      shadow.name = s.objectId + ' · ground shadow'; shadow.position.copy(terrain.worldToScene(s.x, s.y));
      shadow.position.y += c.shadowSceneHeight; shadow.rotation.x = -Math.PI / 2;
      shadow.scale.set(radiusX / data.scale, radiusY / (data.scale * sin), 1);
      shadow.renderOrder = c.shadowOrder;
      shadow.visible = terrain.canWalk(s.x, s.y, g.radius) === true;
      object3d.add(shadow);
      bodies.push({ source: s, width, height, foot, mesh, shadow, radiusX, radiusY });
    }
    update();
    scene.add(object3d); attached = true;
    return Object.freeze({ object3d, update, residents: records, dispose: clean,
      snapshot: () => ({ disposed, count: disposed ? 0 : bodies.length, displayScale,
        sourceSceneSha256: data.sourceSceneSha256, navSha256: data.navSha256,
        atlas: { path: c.atlas, sha256: atlas.hash, bytes: atlas.byteLength,
          width: c.atlasSize, height: c.atlasSize, textures: disposed ? 0 : 1,
          minFilter: 'LinearFilter', magFilter: 'LinearFilter', generateMipmaps: false },
        footOrder: '30 + (footY - 4320) / 8000 * 10', shadowOrder: c.shadowOrder,
        staticArtwork: true, skeletalAnimation: false, lightingGradeApplied: false,
        dialogueImplemented: false, actualGrant: false, nativeAccepted: false,
        actor: actorKnown ? { ...actor } : null, residents: records(), cleanupErrors: [...cleanupErrors] })
    });
  } catch (error) { clean(); throw error; }
}
