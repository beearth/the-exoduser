/* ROOT-PUBLIC-EXPERIMENT contact-shade derivative; source/scene/nav pixels are unchanged.
 * One asynchronous factory, one owned quad, no prepare/reload/RAF/timer. GPU and
 * visual acceptance belong to the caller; this does not restore plate resolution.
 */
export const RIFT_CONTACT_UNDERLAY_PROVENANCE = Object.freeze({
  status: 'ROOT-PUBLIC-EXPERIMENT',
  source: 'tools/team-followup-20261007/hell-rift/ANIMVFX/rift-cliff-contact-underlay-2_5d.candidate.mjs',
  sourceBytes: 10558,
  sourceSHA256: '42c881af73d0ad67461ea794e09e310901f98a2b7d2ef53e6319b310edcb6af0',
  completionId: 'CH1-RIFT-SEAM-CONTACT-20261007-ANIMVFX-CANDIDATE',
  visualVerdict: 'FAIL',
  defaultEnabled: false,
  scope: '독립 2.5D 보행 경계 음영 비교 · 타일 경계 노출로 기본 비활성 · 본편 미채택'
});
export const RIFT_CONTACT_UNDERLAY = Object.freeze({
  grid: 200, tile: 40, world: 8000, navCells: 1192,
  navSHA256: 'a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179',
  sceneSHA256: 'c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a',
  contactTiles: 1.5, contactWidthWorld: 60, strength: 0.42, color: 0x05080a,
  renderOrder: 6, groundLift: 1.25, maxCenterAlpha: 0.28,
  blend: 'normal-dark', bandFilter: 'linear', hardFilter: 'nearest',
  sourceNavByteEncoding: '0/1', hardMaskByteEncoding: '0/255', hardMaskNormalizedEncoding: '0/1',
  physicalHeight: 'UNKNOWN', resolutionRestored: false
});
const C = RIFT_CONTACT_UNDERLAY;
const finite = value => typeof value === 'number' && Number.isFinite(value);
function own(value, key) {
  if (!value || typeof value !== 'object') throw new Error('접지 데이터 객체 필요');
  const d = Object.getOwnPropertyDescriptor(value, key);
  if (d && !Object.hasOwn(d, 'value')) throw new Error('접지 데이터 accessor 금지: ' + key);
  return d?.value;
}
function plain(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(label + ' plain 객체 필요');
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) throw new Error(label + ' prototype 오류');
  if (own(value, 'then') !== undefined) throw new Error(label + ' thenable 금지');
  return value;
}
function copyNavigation(source) {
  plain(source, '접지 scene');
  const world = plain(own(source, 'world'), '접지 world'), pins = plain(own(source, 'sourcePins'), '접지 pins');
  if (own(world, 'cols') !== C.grid || own(world, 'rows') !== C.grid || own(world, 'tileSize') !== C.tile ||
    own(pins, 'nav') !== C.navSHA256 || own(pins, 'walkableCount') !== C.navCells) throw new Error('접지 canonical world/nav 등록 불일치');
  const values = own(source, 'walkable');
  if (!Array.isArray(values) || values.length !== C.grid * C.grid) throw new Error('접지 nav 200² 배열 필요');
  const nav = new Uint8Array(values.length); let count = 0;
  for (let i = 0; i < values.length; i++) {
    const d = Object.getOwnPropertyDescriptor(values, String(i));
    if (!d || !Object.hasOwn(d, 'value') || (d.value !== 0 && d.value !== 1)) throw new Error('접지 nav 값/accessor 오류');
    nav[i] = d.value; count += d.value;
  }
  if (count !== C.navCells) throw new Error('접지 nav1192 불일치');
  return nav;
}
function buildBand(nav) {
  const bytes = new Uint8Array(nav.length * 4), radius = Math.ceil(C.contactTiles + 0.5);
  let bandCells = 0, maxAlpha = 0, maxByte = 0;
  for (let y = 0; y < C.grid; y++) for (let x = 0; x < C.grid; x++) {
    const i = y * C.grid + x, at = i * 4; bytes[at + 3] = 255;
    if (!nav[i]) continue;
    let nearest = Infinity;
    for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
      if (dx === 0 && dy === 0) continue;
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= C.grid || yy >= C.grid || !nav[yy * C.grid + xx]) nearest = Math.min(nearest, Math.hypot(dx, dy));
    }
    const distance = Math.max(0, nearest - 0.5);
    const alpha = distance < C.contactTiles ? C.strength * (1 - distance / C.contactTiles) : 0;
    const byte = Math.round(alpha * 255); bytes[at] = bytes[at + 1] = bytes[at + 2] = byte;
    if (byte > 0) bandCells++;
    maxAlpha = Math.max(maxAlpha, alpha); maxByte = Math.max(maxByte, byte);
  }
  return {bytes, bandCells, maxAlpha, maxByte};
}

/** Reads a detached canonical nav, checks its full SHA before allocating resources.
 * Caller owns scene registration. The returned mesh owns only two masks, one
 * geometry and one material. Arrays use source rowY; shader samples (u,1-v).
 */
export async function createRiftContactUnderlay({THREE, terrain, enabled = false} = {}) {
  for (const name of ['DataTexture', 'BufferGeometry', 'Float32BufferAttribute', 'MeshBasicMaterial', 'Mesh']) {
    if (typeof THREE?.[name] !== 'function') throw new Error('접지 THREE.' + name + ' 필요');
  }
  for (const name of ['RGBAFormat', 'RedFormat', 'UnsignedByteType', 'NoColorSpace', 'LinearFilter', 'NearestFilter', 'ClampToEdgeWrapping', 'DoubleSide']) {
    if (THREE[name] == null) throw new Error('접지 THREE.' + name + ' 필요');
  }
  if (typeof enabled !== 'boolean' || !globalThis.crypto?.subtle?.digest) throw new Error('접지 enabled/WebCrypto 오류');
  const readScene = own(terrain, 'sourceSceneSnapshot'), toScene = own(terrain, 'worldToScene'), readState = own(terrain, 'snapshot');
  if (typeof readScene !== 'function' || typeof toScene !== 'function' || typeof readState !== 'function') throw new Error('접지 canonical terrain API 필요');
  const terrainState = () => {
    const state = plain(readState.call(terrain), '접지 terrain 상태');
    if (own(state, 'disposed') === true || own(state, 'sourceSceneSha256') !== C.sceneSHA256 || own(state, 'navSha256') !== C.navSHA256 || own(state, 'walkableCount') !== C.navCells) throw new Error('접지 terrain 수명/핀 불일치');
  };
  terrainState();
  const nav = copyNavigation(readScene.call(terrain));
  const digest = new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', nav));
  const hash = Array.from(digest, n => n.toString(16).padStart(2, '0')).join('');
  if (hash !== C.navSHA256) throw new Error('접지 nav fullSHA256 불일치');
  terrainState(); // Borrowed terrain may have been disposed while hashing.
  const bounds = plain(own(terrain, 'bounds'), '접지 bounds');
  if (own(bounds, 'left') !== 0 || own(bounds, 'top') !== 0 || own(bounds, 'right') !== C.world || own(bounds, 'bottom') !== C.world) throw new Error('접지 bounds 8000² 불일치');
  const positions = [], uvs = [];
  for (const [x, y] of [[0, 0], [C.world, 0], [C.world, C.world], [0, C.world]]) {
    const p = toScene.call(terrain, x, y, C.groundLift);
    if (!p || ![p.x, p.y, p.z].every(finite)) throw new Error('접지 world transform 유한수 오류');
    positions.push(p.x, p.y, p.z); uvs.push(x / C.world, 1 - y / C.world);
  }
  // UnsignedByteType textures normalize samples by 255; keep the hashed source
  // nav at 0/1, but encode the separate hard gate at 0/255 for step(.5, sample).
  const hardBytes = nav.map(value => value === 1 ? 255 : 0);
  const band = buildBand(nav), resources = new Set(), releaseErrors = [];
  let mesh = null, geometry = null, material = null, bandTexture = null, hardTexture = null,
    disposed = false, enabledState = enabled, shaderRegistered = false, shaderCalls = 0,
    reason = enabled ? 'prepared-caller-WebGL-required' : 'disabled', error = null, releasedCount = 0;
  const uniforms = {riftContactHard: {value: null}, riftContactEnabled: {value: enabled ? 1 : 0}};
  const track = resource => {resources.add(resource); return resource;};
  function release() {
    for (const resource of resources) {
      try {resource.dispose();} catch (e) {releaseErrors.push(String(e?.message || e));}
      releasedCount++;
    }
    resources.clear();
  }
  function maskTexture(bytes, format, filter) {
    const texture = track(new THREE.DataTexture(bytes, C.grid, C.grid, format, THREE.UnsignedByteType));
    texture.colorSpace = THREE.NoColorSpace; texture.flipY = false;
    texture.magFilter = texture.minFilter = filter; texture.generateMipmaps = false;
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping; texture.needsUpdate = true;
    return texture;
  }
  try {
    bandTexture = maskTexture(band.bytes, THREE.RGBAFormat, THREE.LinearFilter);
    hardTexture = maskTexture(hardBytes, THREE.RedFormat, THREE.NearestFilter);
    uniforms.riftContactHard.value = hardTexture;
    geometry = track(new THREE.BufferGeometry());
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2)); geometry.setIndex([0, 1, 2, 0, 2, 3]);
    material = track(new THREE.MeshBasicMaterial({color: C.color, alphaMap: bandTexture,
      transparent: true, opacity: enabled ? 1 : 0, depthTest: false, depthWrite: false,
      side: THREE.DoubleSide, toneMapped: false}));
    material.name = 'Hell Rift · canonical contact underlay';
    material.customProgramCacheKey = () => 'rift-contact-underlay-linear-band-nearest-nav1192-v2';
    material.onBeforeCompile = shader => {
      if (disposed) {if (shader?.uniforms?.opacity) shader.uniforms.opacity.value = 0; return;}
      shaderCalls++;
      if (typeof shader?.vertexShader !== 'string' || !shader.vertexShader.includes('#include <uv_pars_vertex>') || !shader.vertexShader.includes('#include <uv_vertex>') ||
        typeof shader?.fragmentShader !== 'string' || !shader.uniforms ||
        !shader.fragmentShader.includes('#include <alphamap_pars_fragment>') || !shader.fragmentShader.includes('#include <alphamap_fragment>')) {
        error = '접지 alphaMap shader chunk 불일치'; reason = 'shader-contract-failed-hidden';
        shaderRegistered = false; enabledState = false; uniforms.riftContactEnabled.value = 0;
        material.opacity = 0; if (mesh) mesh.visible = false;
        if (shader?.uniforms?.opacity) shader.uniforms.opacity.value = 0; return;
      }
      shader.fragmentShader = shader.fragmentShader.replace('#include <alphamap_pars_fragment>',
        '#include <alphamap_pars_fragment>\nuniform sampler2D riftContactHard;\nuniform float riftContactEnabled;')
        .replace('#include <alphamap_fragment>', `
#ifdef USE_ALPHAMAP
  // Texture arrays retain canonical rowY; ground UV uses 1-worldY/8000.
  vec2 riftContactUv=vec2(vAlphaMapUv.x,1.0-vAlphaMapUv.y);
  bool riftContactInside=all(greaterThanEqual(riftContactUv,vec2(0.0)))&&all(lessThan(riftContactUv,vec2(1.0)));
  float riftContactGate=riftContactInside?step(.5,texture2D(riftContactHard,riftContactUv).r):0.0;
  diffuseColor.a*=riftContactEnabled*riftContactGate*texture2D(alphaMap,riftContactUv).g;
#else
  diffuseColor.a=0.0;
#endif`);
      Object.assign(shader.uniforms, uniforms); shaderRegistered = true;
      reason = enabledState ? 'contact-underlay-caller-WebGL-required' : 'disabled';
    };
    mesh = new THREE.Mesh(geometry, material); mesh.name = 'rift-canonical-contact-underlay';
    mesh.frustumCulled = false; mesh.renderOrder = C.renderOrder; mesh.visible = enabled;
  } catch (failure) {release(); throw failure;}
  function setEnabled(value) {
    if (disposed || error) return false;
    if (typeof value !== 'boolean') throw new Error('접지 enabled는 boolean 필요');
    enabledState = value; uniforms.riftContactEnabled.value = value ? 1 : 0;
    material.opacity = value ? 1 : 0; mesh.visible = value; reason = value ? 'contact-underlay-caller-WebGL-required' : 'disabled'; return value;
  }
  function snapshot() {
    return Object.freeze({disposed, ready: !disposed && !error, enabled: !disposed && enabledState && !error,
      reason, error, shaderRegistered, shaderCalls, shaderLinkVerification: 'caller-WebGL-required',
      ...C, navFullSHA256Verified: true, rowOrder: 'source-rowY', shaderSampleUV: 'u,1-v',
      bandCells: band.bandCells, maxComputedAlpha: band.maxAlpha, maxStoredAlpha: band.maxByte / 255,
      maxStoredAlphaByte: band.maxByte, walkableOnly: true, textures: disposed ? 0 : 2,
      textureBytes: disposed ? 0 : hardBytes.byteLength + band.bytes.byteLength,
      ownedResources: resources.size, releasedCount, releaseErrors: Object.freeze(releaseErrors.slice()),
      geometry: disposed ? 0 : 1, materials: disposed ? 0 : 1, borrowedResources: 0,
      ownRAF: false, ownTimers: false, sceneWrites: false, navWrites: false, sourcePixelsChanged: false,
      terrainGeometryChanged: false, occluderChanged: false, nativeAccepted: false, visualAssessed: false,
      provenance: RIFT_CONTACT_UNDERLAY_PROVENANCE});
  }
  function dispose() {
    if (disposed) return false; disposed = true; enabledState = false;
    mesh.visible = false;
    try {mesh.removeFromParent();} catch (e) {releaseErrors.push(String(e?.message || e));}
    uniforms.riftContactEnabled.value = 0; uniforms.riftContactHard.value = null;
    try {material.alphaMap = null; material.opacity = 0;} catch (e) {releaseErrors.push(String(e?.message || e));}
    release(); reason = 'disposed'; return true;
  }
  return Object.freeze({object3d: mesh, setEnabled, snapshot, dispose});
}
