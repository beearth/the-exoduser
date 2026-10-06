// Public derivative. The formally completed ANIMVFX raw is preserved unchanged.
export const INTERACTION_CUE_PROVENANCE = Object.freeze({
  status: 'ROOT-PUBLIC-DERIVATIVE', role: 'ANIMVFX',
  ownerUuid: 'f56a2bc8-0cf7-459e-a393-5f93d78d30e1',
  goal: 'CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006',
  endId: 'CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006-ANIMVFX-INTERACTION-CUE-CANDIDATE',
  source: 'tools/team-followup-20261006/hell-rift/ANIMVFX/interaction-cue-lifetime-2_5d.candidate.mjs',
  sourceBytes: 9287,
  sourceSha256: '140748cf0ed50961e18b26750c66e240fb0c40abd8ace2baac8e1c54aa0ae567'
});

/* Two pooled, decorative cues driven by the caller's existing RAF.
 * Reads only nearest(player) and snapshot(); never open/choose/close or save.
 * World XY and dialogue reachability belong to the provider, not this renderer.
 * No source artwork, NPC foot, navigation, camera or other mesh is changed.
 */
export const INTERACTION_CUE_DEFAULTS = Object.freeze({
  approachColor: 0xcdbb86, approachOpacity: .55, approachSize: .16,
  openColor: 0xc8623a, openOpacity: .8, openSize: .12,
  openLift: .42, groundLift: .003,
  pulseHz: 1.6, pulseDepth: .22,
  fixedOrder: 31, orderOffset: .5, reducedMotion: false,
  maxAnchors: 4, worldSize: 8000
});
const finite = v => typeof v === 'number' && Number.isFinite(v);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const object = v => v !== null && (typeof v === 'object' || typeof v === 'function');
// Provider/output accessors are rejected without invoking them. Real methods may
// live on a class prototype; preserve their receiver when calling them.
function data(o, key, inherited = false) {
  if (!object(o) || Array.isArray(o)) throw new Error('객체가 필요합니다: ' + key);
  let p = o;
  for (let depth = 0; p && depth < 8; depth++) {
    const d = Object.getOwnPropertyDescriptor(p, key);
    if (d) {
      if (!Object.hasOwn(d, 'value')) throw new Error('accessor는 소비하지 않습니다: ' + key);
      return d.value;
    }
    if (!inherited) break;
    p = Object.getPrototypeOf(p);
  }
  return undefined;
}
function method(o, key) {
  const value = data(o, key, true);
  if (typeof value !== 'function') throw new Error('함수가 필요합니다: ' + key);
  return value;
}
function errorText(error) {
  try { return String(error instanceof Error ? error.message : error).slice(0, 160); }
  catch { return '오류 설명을 읽을 수 없습니다'; }
}
function id(value) {
  if (typeof value !== 'string' || value.length < 1 || value.length > 96 || !/^[a-zA-Z0-9_.:-]+$/.test(value)) throw new Error('NPC id 오류');
  return value;
}
function point(value) {
  const x = data(value, 'x'), y = data(value, 'y');
  if (!finite(x) || !finite(y) || x < 0 || y < 0 || x >= 8000 || y >= 8000) throw new Error('world XY 유한수/범위 오류');
  return { x, y };
}
function optionsOf(value) {
  if (value === undefined) value = {};
  if (!object(value) || Array.isArray(value)) throw new Error('cue options 객체가 필요합니다');
  const o = { ...INTERACTION_CUE_DEFAULTS, orderFor: null, anchorFor: null };
  for (const key of Object.keys(o)) {
    const supplied = data(value, key);
    if (supplied !== undefined) o[key] = supplied;
  }
  for (const key of ['approachOpacity', 'openOpacity', 'approachSize', 'openSize', 'openLift', 'groundLift', 'pulseHz', 'pulseDepth', 'fixedOrder', 'orderOffset']) {
    if (!finite(o[key])) throw new Error('cue finite 옵션 필요: ' + key);
  }
  if (o.approachOpacity < 0 || o.approachOpacity > 1 || o.openOpacity < 0 || o.openOpacity > 1 ||
      o.approachSize <= 0 || o.approachSize > 32 || o.openSize <= 0 || o.openSize > 32 ||
      o.openLift < 0 || o.openLift > 32 || o.groundLift < 0 || o.groundLift > 32 ||
      o.pulseHz < 0 || o.pulseHz > 10 || o.pulseDepth < 0 || o.pulseDepth > 1) throw new Error('cue 옵션 범위 오류');
  for (const key of ['approachColor', 'openColor']) {
    if (!Number.isInteger(o[key]) || o[key] < 0 || o[key] > 0xffffff) throw new Error('cue RGB 색상 범위 오류');
  }
  if (typeof o.reducedMotion !== 'boolean') throw new Error('cue reducedMotion은 boolean이어야 합니다');
  for (const key of ['orderFor', 'anchorFor']) if (o[key] !== null && typeof o[key] !== 'function') throw new Error('cue 함수 옵션 오류: ' + key);
  if (o.maxAnchors !== 4 || o.worldSize !== 8000 || o.orderOffset !== .5) throw new Error('cue 상한/world/정렬 오프셋은 고정입니다');
  return Object.freeze(o);
}

export function createInteractionCueLifetime(deps = {}) {
  const THREE = data(deps, 'THREE'), scene = data(deps, 'scene'), camera = data(deps, 'camera'), terrain = data(deps, 'terrain');
  const originalOptions = data(deps, 'options'), opt = optionsOf(originalOptions);
  const resources = new Set(), cues = [], lastSeen = new Map();
  const stats = { active: false, reason: 'invalid-deps', error: null, disposed: false,
    approachNpc: null, approachVisible: false, openNpc: null, openVisible: false, openAnchorUnknown: false,
    reduced: opt.reducedMotion, spawned: 0, retired: 0, meshes: 0, allocatedMeshes: 0,
    occlusion: opt.orderFor ? 'injected-orderFor' : 'UNKNOWN-root-must-inject-orderFor' };
  let clock = 0, disposed = false, reduced = opt.reducedMotion, providerRef = null;
  let sceneAdd, sceneRemove, worldToScene, worldQuaternion, cameraQuaternion, approach, open;
  function sync() {
    stats.approachNpc = approach?.npcId ?? null; stats.approachVisible = !!approach?.mesh.visible;
    stats.openNpc = open?.npcId ?? null; stats.openVisible = !!open?.mesh.visible; stats.reduced = reduced;
  }
  function hide(cue) {
    if (!cue) return;
    if (cue.npcId !== null) { cue.npcId = null; stats.retired++; }
    cue.mesh.visible = false;
  }
  function retire(reason) {
    hide(approach); hide(open); sync(); stats.openAnchorUnknown = false; stats.reason = reason;
    return stats.retired;
  }
  function diagnostic(cue) {
    if (!cue) return null;
    return { npcId: cue.npcId, visible: cue.mesh.visible,
      worldFoot: cue.npcId ? { x: cue.x, y: cue.y } : null,
      scenePosition: { x: cue.mesh.position.x, y: cue.mesh.position.y, z: cue.mesh.position.z },
      size: cue.mesh.scale.x, opacity: cue.material.opacity, renderOrder: cue.mesh.renderOrder };
  }
  function snapshot() {
    return Object.freeze({ ...stats, endId: INTERACTION_CUE_PROVENANCE.endId,
      cachedAnchors: lastSeen.size, pulseHz: opt.pulseHz, pulseDepth: opt.pulseDepth,
      cues: { approach: diagnostic(approach), open: diagnostic(open) },
      ownRaf: false, ownTimers: false, providerWrites: false, actualGrant: false, nativeAccepted: false });
  }
  function cleanup() {
    if (disposed) return 0;
    const removed = cues.length;
    disposed = true; retire('disposed'); providerRef = null; lastSeen.clear();
    for (const cue of cues) {
      try { sceneRemove?.call(scene, cue.mesh); } catch (error) { stats.error = errorText(error); }
    }
    for (const resource of resources) {
      try { resource.dispose(); } catch (error) { stats.error = errorText(error); }
    }
    resources.clear(); stats.active = false; stats.disposed = true; stats.meshes = 0;
    return removed;
  }
  const pulse = () => reduced || opt.pulseHz === 0 ? 1 : 1 + opt.pulseDepth * Math.sin(clock / 1000 * opt.pulseHz * 2 * Math.PI);
  function appearance(cue) {
    const p = pulse(), size = (cue.kind === 'open' ? opt.openSize : opt.approachSize) * (cue.kind === 'approach' ? p : 1);
    cue.mesh.scale.set(size, size, size);
    cue.material.opacity = clamp((cue.kind === 'open' ? opt.openOpacity : opt.approachOpacity) * (reduced ? 1 : .75 + .25 * p), 0, 1);
  }
  function show(cue, npcId, position) {
    const mapped = worldToScene.call(terrain, position.x, position.y);
    const px = data(mapped, 'x'), py = data(mapped, 'y'), pz = data(mapped, 'z');
    if (!finite(px) || !finite(py) || !finite(pz)) throw new Error('cue worldToScene은 유한 Vector3이어야 합니다');
    const baseOrder = opt.orderFor ? opt.orderFor.call(originalOptions, position.y) : opt.fixedOrder;
    if (!finite(baseOrder)) throw new Error('cue 정렬 순서는 유한 Number여야 합니다');
    const order = baseOrder + (opt.orderFor ? opt.orderOffset : 0);
    if (!finite(order)) throw new Error('cue 정렬 순서는 유한수여야 합니다');
    if (cue.kind === 'open') {
      if (worldQuaternion) worldQuaternion.call(camera, cameraQuaternion);
      else cameraQuaternion.copy(data(camera, 'quaternion'));
      if (![cameraQuaternion.x, cameraQuaternion.y, cameraQuaternion.z, cameraQuaternion.w].every(finite)) throw new Error('cue camera quaternion 유한수 오류');
    }
    // Validate projection/order before publishing any new visible cue.
    if (cue.npcId !== npcId) { hide(cue); cue.npcId = npcId; stats.spawned++; }
    cue.x = position.x; cue.y = position.y;
    cue.mesh.position.set(px, py + (cue.kind === 'open' ? opt.openLift : opt.groundLift), pz);
    if (cue.kind === 'open') cue.mesh.quaternion.copy(cameraQuaternion);
    else cue.mesh.rotation.x = -Math.PI / 2;
    appearance(cue); cue.mesh.renderOrder = order; cue.mesh.visible = true;
  }
  function update(dt, player, provider) {
    if (disposed || !stats.active) return snapshot();
    let reason = 'invalid-dt';
    try {
      if (!finite(dt)) throw new Error('cue dt는 유한 seconds여야 합니다');
      reason = 'invalid-player'; const playerCopy = point(player);
      reason = provider ? 'provider-invalid' : 'provider-unknown';
      const nearest = method(provider, 'nearest'), readSnapshot = method(provider, 'snapshot');
      if (providerRef !== provider) { retire('provider-change'); lastSeen.clear(); clock = 0; providerRef = provider; }
      reason = 'provider-error';
      const near = nearest.call(provider, playerCopy), snap = readSnapshot.call(provider);
      reason = 'provider-invalid';
      const isOpen = data(snap, 'isOpen'), supported = data(snap, 'supported');
      if (typeof isOpen !== 'boolean' || supported !== undefined && supported !== true) throw new Error('cue provider 현재 상태 불일치');
      const nearPoint = near === null ? null : point(near), nearId = near === null ? null : id(data(near, 'npcId'));
      if (nearPoint) {
        lastSeen.delete(nearId); lastSeen.set(nearId, nearPoint);
        if (lastSeen.size > opt.maxAnchors) lastSeen.delete(lastSeen.keys().next().value);
      }
      const period = opt.pulseHz > 0 ? 1000 / opt.pulseHz : 1;
      clock = (clock + clamp(dt, 0, .1) * 1000) % period;
      stats.openAnchorUnknown = false;
      reason = 'cue-render-error';
      if (!isOpen && nearPoint) show(approach, nearId, nearPoint); else hide(approach);
      if (isOpen) {
        reason = 'provider-invalid'; const openId = id(data(data(snap, 'view'), 'npcId'));
        reason = 'anchor-error';
        // An injected current anchor is authoritative: null never resurrects a cached foot.
        const rawAnchor = opt.anchorFor ? opt.anchorFor.call(originalOptions, openId)
          : nearId === openId ? nearPoint : lastSeen.get(openId) ?? null;
        if (rawAnchor === null) { hide(open); stats.openAnchorUnknown = true; }
        else { const anchor = point(rawAnchor); reason = 'cue-render-error'; show(open, openId, anchor); }
      } else hide(open);
      sync(); stats.reason = stats.openAnchorUnknown ? 'open-anchor-unknown' : ''; stats.error = null;
    } catch (error) {
      retire(reason); lastSeen.clear(); providerRef = null; clock = 0; stats.error = errorText(error);
    }
    return snapshot();
  }
  function setReducedMotion(on) {
    if (typeof on !== 'boolean') throw new Error('cue reducedMotion은 boolean이어야 합니다');
    if (disposed) return reduced;
    reduced = on; clock = 0;
    for (const cue of cues) if (cue.mesh.visible) appearance(cue);
    sync(); return reduced;
  }
  function reset(reason, fallback) {
    if (disposed) return stats.retired;
    lastSeen.clear(); providerRef = null; clock = 0;
    return retire(typeof reason === 'string' && reason.trim() ? reason.trim().slice(0, 96) : fallback);
  }
  const api = Object.freeze({ update, setReducedMotion,
    onActorChange: reason => reset(reason, 'actor-change'),
    onSceneChange: reason => reset(reason, 'scene-change'), dispose: cleanup, snapshot });
  try {
    sceneAdd = method(scene, 'add'); sceneRemove = method(scene, 'remove'); worldToScene = method(terrain, 'worldToScene');
    const Mesh = method(THREE, 'Mesh'), RingGeometry = method(THREE, 'RingGeometry'), Material = method(THREE, 'MeshBasicMaterial');
    const Quaternion = method(THREE, 'Quaternion'); cameraQuaternion = new Quaternion();
    worldQuaternion = data(camera, 'getWorldQuaternion', true);
    if (worldQuaternion !== undefined && typeof worldQuaternion !== 'function') throw new Error('camera quaternion 함수 오류');
    if (!worldQuaternion && !data(camera, 'quaternion')) throw new Error('camera quaternion이 없습니다');
    const ring = new RingGeometry(.5, 1, 32, 1); resources.add(ring);
    const chevron = new RingGeometry(0, 1, 3, 1); resources.add(chevron);
    function makeCue(kind, geometry) {
      const material = new Material({ color: kind === 'open' ? opt.openColor : opt.approachColor,
        transparent: true, depthTest: false, depthWrite: false, side: data(THREE, 'DoubleSide'), toneMapped: false });
      resources.add(material);
      const mesh = new Mesh(geometry, material); mesh.name = 'rift-interaction-' + kind;
      mesh.frustumCulled = false; mesh.visible = false;
      const cue = { mesh, material, kind, npcId: null, x: 0, y: 0 };
      cues.push(cue); stats.allocatedMeshes++; sceneAdd.call(scene, mesh); stats.meshes++;
      return cue;
    }
    approach = makeCue('approach', ring); open = makeCue('open', chevron);
    stats.active = true; stats.reason = '';
    return api;
  } catch (error) { cleanup(); throw error; }
}

export default Object.freeze({ createInteractionCueLifetime, INTERACTION_CUE_DEFAULTS, INTERACTION_CUE_PROVENANCE });
