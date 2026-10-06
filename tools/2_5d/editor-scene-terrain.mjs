/* ROOT-EDITOR-EDITED-SCENE-TERRAIN-20261007.
 * Private, validated EDITOR_SNAPSHOT -> image planes + the same snapshot's nav.
 * No canonical fetch, authored height, source edits, renderer, RAF or timers.
 */
import '../map-scene-core.js';

export const EDITOR_SCENE_TERRAIN = Object.freeze({
  completionId: 'ROOT-EDITOR-EDITED-SCENE-TERRAIN-20261007',
  source: 'EDITOR_SNAPSHOT', angle: 50, scale: 400, maskSampleLongEdge: 256,
  layerOrderStride: 2001, physicalHeight: 'UNKNOWN', canonicalVerified: false,
  mainAccepted: false, nativeAccepted: false, ownsRAF: false, ownsRenderer: false
});
const ROOT = new URL('../../', import.meta.url);
const finite = (value, label) => {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(label + ' 유한수 필요');
  return value;
};
// Copy own JSON data without invoking accessors/toJSON, including cross-frame data.
function detachedData(value, seen = new Set(), budget = {left: 150000}, depth = 0) {
  if (--budget.left < 0 || depth > 64) throw new Error('편집 씬 상태 규모 오류');
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') return finite(value, '편집 씬 숫자');
  if (!value || typeof value !== 'object' || seen.has(value)) throw new Error('편집 씬 JSON 데이터 필요');
  const proto = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && proto !== null && Object.getPrototypeOf(proto) !== null) throw new Error('편집 씬 plain 데이터 필요');
  if (Object.getOwnPropertyDescriptor(value, 'then')) throw new Error('편집 씬 thenable 거절');
  seen.add(value);
  const out = Array.isArray(value) ? [] : Object.create(null);
  for (const key of Object.keys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !Object.hasOwn(descriptor, 'value') || key === '__proto__') throw new Error('편집 씬 accessor/key 거절');
    out[key] = detachedData(descriptor.value, seen, budget, depth + 1);
  }
  seen.delete(value); return out;
}
async function defaultLoadImage(src) {
  if (typeof globalThis.Image !== 'function') throw new Error('편집 씬 Image decoder 필요');
  const image = new Image();
  image.src = new URL(src, ROOT).href;
  try { await image.decode(); }
  catch (cause) { image.src = ''; throw cause; }
  return {image, release() { image.src = ''; }};
}
function polygonCoverage(points) {
  let area = 0;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) area += points[j].x * points[i].y - points[i].x * points[j].y;
  return Math.abs(area) / 2;
}

/**
 * loadImage(src,{signal}) -> {image,release?}. Image is borrowed/read-only;
 * an explicit release method transfers that handle's release ownership here.
 * All Texture/geometry/material instances are created and owned by this factory.
 * AbortSignal closes loading/publication; a late returned owned handle is released.
 */
export async function createEditorSceneTerrain({THREE, scene, core = globalThis.MapSceneCore,
  loadImage = defaultLoadImage, signal = null, angle = 50, scale = 400, centre = null} = {}) {
  if (!THREE || THREE.REVISION !== '160' || !THREE.Group || !THREE.BufferGeometry ||
      !THREE.Float32BufferAttribute || !THREE.MeshBasicMaterial || !THREE.Texture ||
      !THREE.DataTexture || !THREE.Mesh || !THREE.Vector2 || !THREE.Vector3 ||
      typeof THREE.ShapeUtils?.triangulateShape !== 'function') throw new Error('편집 씬은 저장소 Three r160 필요');
  if (!core || typeof core.validate !== 'function' || typeof core.clone !== 'function' ||
      typeof core.canWalk !== 'function' || typeof loadImage !== 'function') throw new Error('편집 씬 core/loader 필요');
  finite(angle, '카메라 각도'); finite(scale, '투영 배율');
  if (angle < 10 || angle > 85 || scale <= 0 || scale > 32000) throw new Error('편집 씬 투영 범위 오류');
  if (signal !== null && (typeof signal.addEventListener !== 'function' ||
      typeof signal.removeEventListener !== 'function' || typeof signal.aborted !== 'boolean')) throw new Error('편집 씬 AbortSignal 필요');
  const mapChunk = THREE.ShaderChunk?.map_fragment;
  const sampleLine = 'vec4 sampledDiffuseColor = texture2D( map, vMapUv );';
  if (typeof mapChunk !== 'string' || mapChunk.split(sampleLine).length !== 2) throw new Error('편집 씬 r160 map shader 계약 불일치');
  const source = core.validate(detachedData(scene));
  const width = source.world.cols * source.world.tileSize, height = source.world.rows * source.world.tileSize;
  const cx = centre === null ? width / 2 : finite(centre.x, '투영 중심 x');
  const cy = centre === null ? height / 2 : finite(centre.y, '투영 중심 y');
  const theta = angle * Math.PI / 180, sin = Math.sin(theta), cos = Math.cos(theta);
  const object3d = new THREE.Group(); object3d.name = 'Edited scene · independent 2.5D image projection';
  const resources = new Map(), released = new WeakSet(), imageHandles = new WeakSet(), meshes = [], layers = [], records = [], images = new Map(), textures = new Map();
  const failures = {detachFailures: 0, releaseFailures: 0};
  let disposed = false, ready = false, abortCause, hasAbortCause = false, viewX = width / 2, viewY = height / 2;
  const increment = key => { failures[key] = Math.min(Number.MAX_SAFE_INTEGER, failures[key] + 1); };
  function release(ref, errors) {
    if (released.has(ref)) return;
    released.add(ref);
    const cleanup = resources.get(ref); resources.delete(ref);
    try { cleanup(); } catch (cause) { increment('releaseFailures'); errors.push(cause); }
  }
  function own(ref, cleanup) {
    if (!ref || typeof ref !== 'object') throw new Error('편집 씬 소유 자원 반환 오류');
    if (!resources.has(ref)) resources.set(ref, cleanup);
    if (disposed) release(ref, []);
    return ref;
  }
  function cleanup(throwFailures) {
    if (disposed) return false;
    disposed = true; ready = false;
    signal?.removeEventListener('abort', onAbort);
    const errors = [];
    try { object3d.removeFromParent(); } catch (cause) { increment('detachFailures'); errors.push(cause); }
    try { object3d.clear(); } catch (cause) { increment('detachFailures'); errors.push(cause); }
    // Textures/materials/geometries precede explicitly owned source handles.
    for (const ref of resources.keys()) if (!imageHandles.has(ref)) release(ref, errors);
    for (const ref of resources.keys()) if (imageHandles.has(ref)) release(ref, errors);
    meshes.length = records.length = layers.length = 0; images.clear(); textures.clear();
    if (throwFailures && errors.length) throw new AggregateError(errors, '편집 씬 자원 정리 실패');
    return true;
  }
  function onAbort() {
    hasAbortCause = true; abortCause = signal.reason;
    cleanup(false);
  }
  function current() {
    if (signal?.aborted && !disposed) onAbort();
    if (disposed) throw hasAbortCause ? abortCause : new Error('편집 씬 준비 취소됨');
  }
  function attach(parent, child) {
    try { parent.add(child); }
    catch (cause) {
      try { parent.remove(child); } catch (_) { increment('detachFailures'); }
      throw cause;
    }
    if (disposed) {
      try { parent.remove(child); } catch (_) { increment('detachFailures'); }
      current();
    }
  }
  const worldToScene = (x, y, h = 0) => new THREE.Vector3((finite(x, 'world x') - cx) / scale,
    finite(h, '표시 높이') / scale, ((finite(y, 'world y') - cy) + h * cos) / (scale * sin));
  const sceneToWorld = (v, y, z) => {
    const x = typeof v === 'object' ? v.x : v, sy = typeof v === 'object' ? v.y : y, sz = typeof v === 'object' ? v.z : z;
    finite(x, 'scene x'); finite(sy, 'scene y'); finite(sz, 'scene z');
    return {x: cx + x * scale, y: cy + (sz * sin - sy * cos) * scale, h: sy * scale};
  };
  function featherTexture(o) {
    // Match the editor's legacy mask sample dimensions, without its RGB buffer.
    const legacyScale = 1024 / Math.max(o.width, o.height), legacyWidth = Math.max(1, Math.round(o.width * legacyScale)), legacyHeight = Math.max(1, Math.round(o.height * legacyScale));
    const r = 256 / Math.max(legacyWidth, legacyHeight), w = Math.max(1, Math.round(legacyWidth * r)), h = Math.max(1, Math.round(legacyHeight * r));
    const bytes = new Uint8Array(w * h * 4), p = o.mask.map(([x, y]) => [x * o.width, y * o.height]);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      // DataTexture row0 is bottom; authored mask coordinates are top-down.
      const px = (x + .5) / w * o.width, py = (h - y - .5) / h * o.height;
      let inside = false, distance = Infinity;
      for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
        const a = p[i], b = p[j], dx = a[0] - b[0], dy = a[1] - b[1];
        if ((a[1] > py) !== (b[1] > py) && px < (b[0] - a[0]) * (py - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
        const t = Math.max(0, Math.min(1, ((px - b[0]) * dx + (py - b[1]) * dy) / (dx * dx + dy * dy || 1)));
        distance = Math.min(distance, Math.hypot(px - b[0] - t * dx, py - b[1] - t * dy));
      }
      const at = (y * w + x) * 4, a = inside ? Math.min(1, distance / o.maskFeather) : 0;
      bytes[at] = bytes[at + 1] = bytes[at + 2] = 255; bytes[at + 3] = Math.round(255 * a * a * (3 - 2 * a));
    }
    const texture = new THREE.DataTexture(bytes, w, h, THREE.RGBAFormat, THREE.UnsignedByteType);
    own(texture, () => texture.dispose()); current();
    texture.flipY = false; texture.magFilter = texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false; texture.needsUpdate = true; return texture;
  }
  function createGeometry(o, a) {
    const points = (o.mask ?? [[0, 0], [1, 0], [1, 1], [0, 1]]).map(p => new THREE.Vector2(p[0], p[1]));
    const triangles = THREE.ShapeUtils.triangulateShape(points, []), area = polygonCoverage(points);
    let covered = 0;
    for (const tri of triangles) {
      if (tri.length !== 3 || tri.some(i => !Number.isInteger(i) || i < 0 || i >= points.length)) throw new Error('편집 씬 mask 삼각형 오류');
      covered += polygonCoverage(tri.map(i => points[i]));
    }
    if (!triangles.length || area <= 1e-10 || Math.abs(covered - area) > 1e-7) throw new Error('편집 씬 퇴화/비단순 mask 거절');
    const positions = [], uvs = [], localUV = [], r = o.rotation * Math.PI / 180, c = Math.cos(r), s = Math.sin(r), sign = o.flipX ? -1 : 1;
    for (const tri of triangles) for (const i of tri) {
      const {x: u, y: v} = points[i], dx = (u - o.pivotX) * o.width * sign, dy = (v - o.pivotY) * o.height;
      const p = worldToScene(o.x + dx * c - dy * s, o.y + dx * s + dy * c);
      positions.push(p.x, p.y, p.z); localUV.push(u, 1 - v);
      uvs.push((a.crop.x + u * a.crop.w) / a.width, 1 - (a.crop.y + v * a.crop.h) / a.height);
    }
    const geometry = new THREE.BufferGeometry(); own(geometry, () => geometry.dispose());
    current(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setAttribute('editorLocalUV', new THREE.Float32BufferAttribute(localUV, 2));
    geometry.computeVertexNormals(); return geometry;
  }
  function materialFor(o, a, texture) {
    const mask = o.maskFeather ? featherTexture(o) : null;
    const uniforms = {editorSourceOffset: {value: new THREE.Vector2()}, editorSourceLocalOffset: {value: new THREE.Vector2()}, editorMask: {value: mask}};
    const material = new THREE.MeshBasicMaterial({map: texture, transparent: true, opacity: o.opacity,
      depthTest: false, depthWrite: false, side: THREE.DoubleSide, toneMapped: false});
    own(material, () => material.dispose()); current();
    material.customProgramCacheKey = () => 'editor-scene-terrain-r160-v1-' + (mask ? 'feather' : 'hard');
    material.onBeforeCompile = shader => {
      if (disposed) { material.visible = false; return; }
      if (!shader.vertexShader.includes('#include <common>') || !shader.vertexShader.includes('#include <begin_vertex>') ||
          !shader.fragmentShader.includes('#include <common>') || !shader.fragmentShader.includes('#include <map_fragment>')) {
        material.visible = false; throw new Error('편집 씬 shader include 불일치');
      }
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nattribute vec2 editorLocalUV;\nvarying vec2 vEditorLocalUV;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvEditorLocalUV=editorLocalUV;');
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec2 editorSourceOffset;\nuniform vec2 editorSourceLocalOffset;\nvarying vec2 vEditorLocalUV;' + (mask ? '\nuniform sampler2D editorMask;' : ''))
        .replace('#include <map_fragment>', mapChunk.replace(sampleLine, 'vec4 sampledDiffuseColor = texture2D( map, vMapUv + editorSourceOffset );') +
          '\nvec2 editorImageUV=vEditorLocalUV+editorSourceLocalOffset;\ndiffuseColor.a*=step(0.0,editorImageUV.x)*step(editorImageUV.x,1.0)*step(0.0,editorImageUV.y)*step(editorImageUV.y,1.0);' +
          (mask ? '\ndiffuseColor.a*=texture2D(editorMask,vEditorLocalUV).a;' : ''));
    };
    return {material, uniforms, a, o};
  }
  function setViewport(x, y) {
    if (disposed) return false;
    finite(x, '시점 x'); finite(y, '시점 y');
    viewX = x; viewY = y;
    for (const {group, layer} of layers) group.position.set((x - width / 2) * (1 - layer.parallax) / scale, 0,
      (y - height / 2) * (1 - layer.parallax) / (scale * sin));
    for (const {o, a, uniforms} of records) {
      const factor = 1 - (o.sourceParallax ?? 1), dx = (x - width / 2) * factor, dy = (y - height / 2) * factor;
      const r = -o.rotation * Math.PI / 180, lx = (dx * Math.cos(r) - dy * Math.sin(r)) * (o.flipX ? -1 : 1), ly = dx * Math.sin(r) + dy * Math.cos(r);
      // A source drawn at +local offset is sampled at the inverse offset.
      uniforms.editorSourceOffset.value.set(-lx / o.width * a.crop.w / a.width, ly / o.height * a.crop.h / a.height);
      uniforms.editorSourceLocalOffset.value.set(-lx / o.width, ly / o.height);
    }
    return true;
  }
  signal?.addEventListener('abort', onAbort, {once: true});
  try {
    current();
    const byId = new Map(source.assets.map(a => [a.id, a]));
    const visible = source.layers.filter(l => l.visible);
    for (const layer of visible) for (const o of layer.objects) {
      const a = byId.get(o.assetId);
      if (!/^(assets|img)\/[A-Za-z0-9_./ -]+\.(png|jpe?g|webp)$/i.test(a.src) || a.src.split('/').includes('..')) throw new Error('편집 씬 preview는 프로젝트 이미지 경로만 지원합니다');
      if (!images.has(a.src)) {
        const handle = await loadImage(a.src, {signal});
        if (!handle || typeof handle !== 'object') throw new Error('편집 씬 image/release loader 계약 오류');
        const imageDescriptor = Object.getOwnPropertyDescriptor(handle, 'image'), releaseDescriptor = Object.getOwnPropertyDescriptor(handle, 'release');
        if (releaseDescriptor && !Object.hasOwn(releaseDescriptor, 'value')) throw new Error('편집 씬 release accessor 거절');
        const releaseImage = releaseDescriptor?.value;
        if (releaseImage !== undefined && typeof releaseImage !== 'function') throw new Error('편집 씬 release 함수 필요');
        images.set(a.src, handle); imageHandles.add(handle);
        if (releaseImage) own(handle, () => releaseImage.call(handle));
        current();
        if (!imageDescriptor || !Object.hasOwn(imageDescriptor, 'value') || !imageDescriptor.value) throw new Error('편집 씬 image own-data 필요');
        const image = imageDescriptor.value;
        const texture = new THREE.Texture(image); own(texture, () => texture.dispose());
        current(); texture.colorSpace = THREE.SRGBColorSpace; texture.flipY = true;
        texture.magFilter = THREE.LinearFilter; texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.needsUpdate = true; textures.set(a.src, texture);
      }
      const image = images.get(a.src).image;
      if (image.naturalWidth !== a.width || image.naturalHeight !== a.height) throw new Error('편집 씬 원본 이미지 크기 불일치');
    }
    for (const [layerIndex, layer] of source.layers.entries()) {
      if (!layer.visible) continue;
      const group = new THREE.Group(); group.name = layer.id; current(); attach(object3d, group); layers.push({layer, group});
      const sorted = layer.sort === 'foot' ? [...layer.objects].sort((a, b) => a.y - b.y) : layer.objects;
      for (const [rank, o] of sorted.entries()) {
        current(); const a = byId.get(o.assetId), geometry = createGeometry(o, a), record = materialFor(o, a, textures.get(a.src));
        current(); const mesh = new THREE.Mesh(geometry, record.material);
        current(); mesh.name = o.id; current(); mesh.frustumCulled = false; current();
        mesh.renderOrder = layerIndex * 2001 + rank + 1; current(); attach(group, mesh); meshes.push(mesh); records.push(record);
      }
    }
    current(); setViewport(viewX, viewY); current(); ready = true;
    return Object.freeze({object3d, group: object3d, worldToScene, sceneToWorld, setViewport,
      spawn: Object.freeze({...source.start}), bounds: Object.freeze({left: 0, top: 0, right: width, bottom: height}),
      canWalk(x, y, radius = 12) { if (disposed || !Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(radius) || radius < 0) return false; return core.canWalk(source, x, y, radius); },
      sourceSceneSnapshot: () => core.clone(source),
      snapshot: () => Object.freeze({source: 'EDITOR_SNAPSHOT', canonicalVerified: false, ready, disposed,
        width, height, angle, scale, centreX: cx, centreY: cy, viewX, viewY, objects: source.layers.reduce((n, l) => n + l.objects.length, 0),
        visibleObjects: records.length, meshCount: meshes.length, layerCount: source.layers.length, visibleLayers: layers.length,
        textures: textures.size, featherMasks: records.filter(r => r.o.maskFeather > 0).length,
        walkableCount: source.walkable.filter(Boolean).length, physicalHeight: 'UNKNOWN', geometryHeight: 0,
        maskSampleLongEdge: 256, layerOrderStride: 2001, sourceParallaxApplied: true,
        cleanup: Object.freeze({...failures}), mainAccepted: false, nativeAccepted: false}),
      dispose() { return cleanup(true); }});
  } catch (cause) { cleanup(false); throw cause; }
}
