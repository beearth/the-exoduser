import { validateRigProject } from './rig-project.js?v=torso-depth-r7';
import { isLocalAsset } from './project.js?v=tail-sequence-r4-final';

export const RIG_SCENE_VERSION = 1;
export const RIG_SCENE_LIMITS = Object.freeze({
  resources: 8, nodes: 32, worldSize: 8000, minScale: 1, maxScale: 128, transitionDuration: 10,
});
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const reservedIds = new Set(['__proto__', 'prototype', 'constructor']);
const validText = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 120 && !/[\x00-\x1f\x7f]/.test(value);
const validId = value => validText(value) && !reservedIds.has(value);

// Reject non-JSON extensions before reading their properties or invoking toJSON.
function checkJsonData(value) {
  const pending = [value], seen = new WeakSet();
  while (pending.length) {
    const item = pending.pop();
    if (item === null || typeof item === 'string' || typeof item === 'boolean' || (typeof item === 'number' && Number.isFinite(item))) continue;
    if (typeof item !== 'object' || (!Array.isArray(item) && ![Object.prototype, null].includes(Object.getPrototypeOf(item))) || Object.getOwnPropertySymbols(item).length) throw new TypeError('JSON 값만 저장할 수 있습니다.');
    if (seen.has(item)) continue;
    seen.add(item);
    for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(item))) {
      if (Array.isArray(item) && key === 'length') continue;
      if (!Object.hasOwn(descriptor, 'value') || !descriptor.enumerable || (Array.isArray(item) && (String(Number(key)) !== key || !Number.isInteger(Number(key)) || Number(key) < 0 || Number(key) >= item.length))) throw new TypeError('JSON 데이터 속성만 저장할 수 있습니다.');
      pending.push(descriptor.value);
    }
  }
  JSON.stringify(value, (_key, item) => {
    if (item === undefined) throw new TypeError('빈 배열 셀 또는 undefined는 저장할 수 없습니다.');
    return item;
  });
}

/** Optional render-only consumer data for an ordinary schemaVersion:1 FDG project. */
export function validateRigScene(scene) {
  const errors = [], fail = message => errors.push(message);
  if (!record(scene)) return { ok: false, errors: ['rigScene: 장면 객체가 필요합니다.'] };
  try { checkJsonData(scene); }
  catch (error) { return { ok: false, errors: [`rigScene JSON: ${error.message}`] }; }
  const text = (value, path, id = false) => {
    if (!(id ? validId(value) : validText(value))) fail(`${path}: 1~120자${id ? ' ID(예약 키 제외)' : ' 이름'}가 필요합니다.`);
  };
  const number = (value, path, min, max = Infinity) => {
    if (!Number.isFinite(value) || value < min || value > max) fail(`${path}: 유한한 ${min}~${max} 값이 필요합니다.`);
  };
  const list = (value, path, max) => {
    if (!Array.isArray(value) || value.length > max) { fail(`${path}: 0~${max}개 배열이 필요합니다.`); return []; }
    return value;
  };
  const identify = (items, path) => {
    const ids = new Set();
    for (const [index, item] of items.entries()) {
      if (!record(item)) { fail(`${path}[${index}]: 객체가 필요합니다.`); continue; }
      text(item.id, `${path}[${index}].id`, true); text(item.name, `${path}[${index}].name`);
      if (ids.has(item.id)) fail(`${path}[${index}].id: 중복 ID입니다.`);
      if (validId(item.id)) ids.add(item.id);
    }
  };
  if (scene.version !== RIG_SCENE_VERSION) fail(`rigScene.version: 지원 버전은 ${RIG_SCENE_VERSION}입니다.`);
  const resources = list(scene.resources, 'rigScene.resources', RIG_SCENE_LIMITS.resources);
  const nodes = list(scene.nodes, 'rigScene.nodes', RIG_SCENE_LIMITS.nodes);
  identify(resources, 'rigScene.resources'); identify(nodes, 'rigScene.nodes');
  const usable = new Map();
  for (const [index, resource] of resources.entries()) {
    if (!record(resource)) continue;
    const result = validateRigProject(resource.project);
    for (const error of result.errors) fail(`rigScene.resources[${index}].project.${error}`);
    if (result.ok && validId(resource.id) && !usable.has(resource.id)) usable.set(resource.id, resource.project);
  }
  for (const [index, node] of nodes.entries()) {
    if (!record(node)) continue;
    const path = `rigScene.nodes[${index}]`;
    text(node.resourceId, `${path}.resourceId`, true);
    const rig = usable.get(node.resourceId);
    if (!rig) fail(`${path}.resourceId: 검증된 기존 rig 리소스를 참조해야 합니다.`);
    if (!Array.isArray(node.position) || node.position.length !== 3) fail(`${path}.position: [worldX, worldY, heightZ] 좌표가 필요합니다.`);
    else {
      number(node.position[0], `${path}.position[0]`, 0, RIG_SCENE_LIMITS.worldSize);
      number(node.position[1], `${path}.position[1]`, 0, RIG_SCENE_LIMITS.worldSize);
      number(node.position[2], `${path}.position[2]`, -RIG_SCENE_LIMITS.worldSize, RIG_SCENE_LIMITS.worldSize);
    }
    number(node.scale, `${path}.scale`, RIG_SCENE_LIMITS.minScale, RIG_SCENE_LIMITS.maxScale);
    if (typeof node.visible !== 'boolean') fail(`${path}.visible: boolean이 필요합니다.`);
    text(node.materialId, `${path}.materialId`, true);
    if (rig && !rig.materials.some(material => material.id === node.materialId && material.meshId === rig.mesh.id && material.skeletonId === rig.skeleton.id)) fail(`${path}.materialId: 해당 rig의 호환 재질 ID가 필요합니다.`);
    if (node.clipId !== null) {
      text(node.clipId, `${path}.clipId`, true);
      if (rig && !rig.clips.some(clip => clip.id === node.clipId)) fail(`${path}.clipId: null 또는 해당 rig의 clip ID가 필요합니다.`);
    }
    number(node.time, `${path}.time`, 0);
    if (node.returnTo !== undefined) {
      const target = node.returnTo, targetPath = `${path}.returnTo`;
      if (!record(target)) fail(`${targetPath}: 복귀 클립 설정 객체가 필요합니다.`);
      else {
        text(target.clipId, `${targetPath}.clipId`, true);
        if (!rig?.clips.some(clip => clip.id === target.clipId && clip.loop === true)) fail(`${targetPath}.clipId: 해당 rig의 loop 클립이 필요합니다.`);
        number(target.transitionSeconds, `${targetPath}.transitionSeconds`, 0, RIG_SCENE_LIMITS.transitionDuration);
      }
    }
    if (node.transition !== undefined && node.transition !== null) {
      const transition = node.transition, transitionPath = `${path}.transition`;
      if (!record(transition)) { fail(`${transitionPath}: null 또는 전환 객체가 필요합니다.`); continue; }
      if (transition.fromClipId !== null) {
        text(transition.fromClipId, `${transitionPath}.fromClipId`, true);
        if (rig && !rig.clips.some(clip => clip.id === transition.fromClipId)) fail(`${transitionPath}.fromClipId: null 또는 해당 rig의 clip ID가 필요합니다.`);
      }
      number(transition.fromTime, `${transitionPath}.fromTime`, 0);
      number(transition.duration, `${transitionPath}.duration`, 0, RIG_SCENE_LIMITS.transitionDuration);
      if (transition.duration === 0) fail(`${transitionPath}.duration: 0보다 커야 합니다.`);
      number(transition.elapsed, `${transitionPath}.elapsed`, 0, Number.isFinite(transition.duration) ? transition.duration : 0);
    }
  }
  // One explicit authoring event. Native combat/frame metadata remains opaque JSON.
  if (scene.sequence !== undefined) {
    const sequence = scene.sequence, path = 'rigScene.sequence';
    if (!record(sequence)) fail(`${path}: 명시된 시퀀스 객체가 필요합니다.`);
    else {
      text(sequence.id, `${path}.id`, true);
      text(sequence.nodeId, `${path}.nodeId`, true);
      text(sequence.clipId, `${path}.clipId`, true);
      const node = nodes.find(item => record(item) && item.id === sequence.nodeId);
      const rig = node && usable.get(node.resourceId);
      const clip = rig?.clips.find(item => item.id === sequence.clipId);
      if (!node || !rig) fail(`${path}.nodeId: 검증된 기존 노드가 필요합니다.`);
      if (!clip || clip.loop !== false) fail(`${path}.clipId: 해당 노드의 non-loop clip이 필요합니다.`);
      if (sequence.autoStart !== undefined && typeof sequence.autoStart !== 'boolean') fail(`${path}.autoStart: boolean이 필요합니다.`);
      if (sequence.entryTransitionSeconds !== undefined) number(sequence.entryTransitionSeconds, `${path}.entryTransitionSeconds`, 0, RIG_SCENE_LIMITS.transitionDuration);
      number(sequence.startTime, `${path}.startTime`, 0, clip?.duration ?? 0);
      if (sequence.startTime === 0) fail(`${path}.startTime: 0보다 큰 demo 초 값이 필요합니다.`);
      if (!Array.isArray(sequence.offset) || sequence.offset.length !== 2) fail(`${path}.offset: [worldDx,worldDy]가 필요합니다.`);
      else sequence.offset.forEach((value, axis) => number(value, `${path}.offset[${axis}]`, -RIG_SCENE_LIMITS.worldSize, RIG_SCENE_LIMITS.worldSize));
      const atlas = sequence.atlas, atlasPath = `${path}.atlas`;
      if (!record(atlas)) fail(`${atlasPath}: 실제 이미지 시트 선언이 필요합니다.`);
      else {
        if (!isLocalAsset(atlas.src)) fail(`${atlasPath}.src: 로컬 이미지 경로가 필요합니다.`);
        const integer = (key, min, max) => {
          number(atlas[key], `${atlasPath}.${key}`, min, max);
          if (!Number.isInteger(atlas[key])) fail(`${atlasPath}.${key}: 정수가 필요합니다.`);
        };
        integer('frameWidth', 1, 4096); integer('frameHeight', 1, 4096);
        integer('columns', 1, 256); integer('rows', 1, 256); integer('frames', 1, 4096);
        if (atlas.frames > atlas.columns * atlas.rows) fail(`${atlasPath}.frames: 시트 용량을 초과합니다.`);
        number(atlas.fps, `${atlasPath}.fps`, 1, 120);
        number(atlas.scale, `${atlasPath}.scale`, .1, 10);
        number(atlas.anchorX, `${atlasPath}.anchorX`, 0, 1); number(atlas.anchorY, `${atlasPath}.anchorY`, 0, 1);
        if (atlas.loop !== undefined && atlas.loop !== false) fail(`${atlasPath}.loop: 시퀀스는 non-loop만 지원합니다.`);
        if (atlas.directions !== undefined) fail(`${atlasPath}.directions: 시퀀스는 단일 이미지 시트만 지원합니다.`);
      }
    }
  }
  const camera = scene.camera;
  if (!record(camera)) fail('rigScene.camera: 카메라 객체가 필요합니다.');
  else {
    number(camera.x, 'rigScene.camera.x', 0, RIG_SCENE_LIMITS.worldSize);
    number(camera.y, 'rigScene.camera.y', 0, RIG_SCENE_LIMITS.worldSize);
    if (typeof camera.follow !== 'boolean') fail('rigScene.camera.follow: boolean이 필요합니다.');
    number(camera.yaw, 'rigScene.camera.yaw', -Math.PI, Math.PI);
    number(camera.pitch, 'rigScene.camera.pitch', -Math.PI / 3, Math.PI / 3);
  }
  return { ok: errors.length === 0, errors };
}

/** Deep-copy an existing authored rig; this factory generates no mesh or gameplay. */
export function createRigScene(rigProject, { position = [0, 0, 0], resourceId = 'rig_probe', nodeId = 'rig_node_probe', name = '3D 시험 노드' } = {}) {
  const validation = validateRigProject(rigProject);
  if (!validation.ok) throw new TypeError(validation.errors.join('\n'));
  const scene = {
    version: RIG_SCENE_VERSION,
    resources: [{ id: resourceId, name: rigProject.name, project: structuredClone(rigProject) }],
    nodes: [{ id: nodeId, name, resourceId, position: structuredClone(position), scale: 48, visible: true,
      materialId: rigProject.preview.materialId, clipId: rigProject.preview.clipId, time: rigProject.preview.time }],
    camera: { x: position?.[0], y: position?.[1], follow: false, yaw: -.65, pitch: .32 },
  };
  const result = validateRigScene(scene);
  if (!result.ok) throw new TypeError(result.errors.join('\n'));
  return scene;
}
