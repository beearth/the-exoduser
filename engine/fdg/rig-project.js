import { Signals, clone } from './project.js?v=torso-depth-r7';

export const RIG_VERSION = 1;
export const RIG_LIMITS = Object.freeze({
  bones: 64, vertices: 4096, triangles: 8192, materials: 64, clips: 32, keys: 256, tracks: 64,
  influences: 4, history: 80, fileBytes: 2 * 1024 * 1024, coordinate: 10000,
  rotation: 100 * Math.PI, weightTolerance: 1e-6,
  textureDimension: 4096,
});
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const reservedIds = new Set(['__proto__', 'prototype', 'constructor']);
const validText = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 120 && !/[\x00-\x1f\x7f]/.test(value);
const validId = value => validText(value) && !reservedIds.has(value);
const validTextureSource = value => {
  if (typeof value !== 'string' || value.length === 0 || value.length > 2048 || /[\x00-\x20\x7f\\]/.test(value)
    || value.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(value)) return false;
  try {
    const path = decodeURIComponent(value.split(/[?#]/, 1)[0]);
    return path.length > 0 && !path.split('/').some(part => part === '.' || part === '..') && !path.includes('\\');
  } catch { return false; }
};

/** Independent generic 3D engine probe. Preset skin weights are explicit authored data. */
export function createDefaultRigProject() {
  const heights = [0, 1, 2, 3], widths = [.5, .55, .45, .35], depths = [.4, .4, .35, .3];
  const vertices = heights.flatMap((y, index) => {
    const x = widths[index], z = depths[index];
    return [[-x, y, -z], [x, y, -z], [x, y, z], [-x, y, z]];
  });
  const triangles = [];
  for (let ring = 0; ring < 3; ring += 1) for (let side = 0; side < 4; side += 1) {
    const a = ring * 4 + side, b = ring * 4 + (side + 1) % 4;
    triangles.push([a, b + 4, b], [a, a + 4, b + 4]);
  }
  triangles.push([0, 1, 2], [0, 2, 3], [12, 14, 13], [12, 15, 14]);
  const ringWeights = [
    [{ boneId: 'root', weight: 1 }],
    [{ boneId: 'root', weight: .4 }, { boneId: 'spine', weight: .6 }],
    [{ boneId: 'spine', weight: .6 }, { boneId: 'head', weight: .4 }],
    [{ boneId: 'head', weight: 1 }],
  ];
  const keys = (times, rotations) => times.map((time, index) => ({ time, translation: [0, 0, 0], rotation: [...rotations[index]] }));
  return {
    rigVersion: RIG_VERSION, id: 'fdg-rig-probe', name: 'FDG · 3D 리그·스킨 시험체',
    skeleton: { id: 'probe_skeleton', bones: [
      { id: 'root', name: '루트', parent: null, translation: [0, 0, 0], rotation: [0, 0, 0] },
      { id: 'spine', name: '척추', parent: 'root', translation: [0, 1, 0], rotation: [0, 0, 0] },
      { id: 'head', name: '머리', parent: 'spine', translation: [0, 1, 0], rotation: [0, 0, 0] },
    ] },
    mesh: { id: 'probe_mesh', skeletonId: 'probe_skeleton', vertices, triangles,
      weights: heights.flatMap((_, index) => Array.from({ length: 4 }, () => clone(ringWeights[index]))),
    },
    materials: [
      { id: 'iron', name: '철빛', meshId: 'probe_mesh', skeletonId: 'probe_skeleton', color: '#91abbf' },
      { id: 'ember', name: '잿불빛', meshId: 'probe_mesh', skeletonId: 'probe_skeleton', color: '#cb6646' },
    ],
    clips: [
      { id: 'sway', name: '좌우 흔들림', duration: 2, fps: 24, loop: true,
        tracks: [{ boneId: 'spine', keys: keys([0, 1, 2], [[0, 0, -.35], [0, 0, .35], [0, 0, -.35]]) }],
      },
      { id: 'bow', name: '숙이기', duration: 1.5, fps: 30, loop: false, tracks: [
        { boneId: 'spine', keys: keys([0, .75, 1.5], [[0, 0, 0], [.55, 0, 0], [0, 0, 0]]) },
        { boneId: 'head', keys: keys([0, .75, 1.5], [[0, 0, 0], [.2, 0, 0], [0, 0, 0]]) },
      ] },
    ],
    preview: { materialId: 'iron', clipId: 'sway', time: 0, playing: false, pose: {}, camera: { yaw: -.65, pitch: .32, zoom: 1 } },
  };
}

/** Structural authoring validation only: no rendering, imports or automatic skin weighting. */
export function validateRigProject(project) {
  const errors = [], fail = message => errors.push(message);
  const text = (value, path, id = false) => {
    if (!(id ? validId(value) : validText(value))) fail(`${path}: 1~120자${id ? ' 고유 ID(예약 키 제외)' : ' 이름'}가 필요합니다.`);
  };
  const number = (value, path, min, max = Infinity) => {
    if (!Number.isFinite(value) || value < min || value > max) fail(`${path}: 유한한 ${min}~${max} 값이 필요합니다.`);
  };
  const vector = (value, path, bound) => {
    if (!Array.isArray(value) || value.length !== 3 || !value.every(component => Number.isFinite(component) && Math.abs(component) <= bound)) fail(`${path}: ±${bound} 이내 유한한 3성분 배열이 필요합니다.`);
  };
  const transform = (value, path) => {
    if (!record(value)) { fail(`${path}: translation/rotation 객체가 필요합니다.`); return; }
    vector(value.translation, `${path}.translation`, RIG_LIMITS.coordinate);
    vector(value.rotation, `${path}.rotation`, RIG_LIMITS.rotation);
  };
  const list = (value, path, max, min = 1) => {
    if (!Array.isArray(value) || value.length < min || value.length > max) { fail(`${path}: ${min}~${max}개 배열이 필요합니다.`); return []; }
    return value;
  };
  const identify = (items, path) => {
    const ids = new Set();
    items.forEach((item, index) => {
      if (!record(item)) { fail(`${path}[${index}]: 객체가 필요합니다.`); return; }
      text(item.id, `${path}[${index}].id`, true); text(item.name, `${path}[${index}].name`);
      if (ids.has(item.id)) fail(`${path}[${index}].id: 중복 ID입니다.`);
      if (validId(item.id)) ids.add(item.id);
    });
    return ids;
  };
  if (!record(project)) return { ok: false, errors: ['rig 프로젝트 객체가 필요합니다.'] };
  if (project.rigVersion !== RIG_VERSION) fail(`rigVersion: 지원 버전은 ${RIG_VERSION}입니다.`);
  text(project.id, 'id', true); text(project.name, 'name');

  const skeleton = record(project.skeleton) ? project.skeleton : {};
  if (!record(project.skeleton)) fail('skeleton: 단일 스켈레톤 객체가 필요합니다.');
  text(skeleton.id, 'skeleton.id', true);
  const bones = list(skeleton.bones, 'skeleton.bones', RIG_LIMITS.bones), boneIds = identify(bones, 'skeleton.bones');
  const parents = new Map();
  for (const [index, bone] of bones.entries()) {
    if (!record(bone)) continue;
    const path = `skeleton.bones[${index}]`;
    transform(bone, path);
    if (bone.parent !== null && (!validId(bone.parent) || !boneIds.has(bone.parent))) fail(`${path}.parent: null 또는 기존 bone ID가 필요합니다.`);
    if (bone.parent === bone.id) fail(`${path}.parent: 자기 자신을 부모로 둘 수 없습니다.`);
    if (validId(bone.id) && !parents.has(bone.id)) parents.set(bone.id, bone.parent);
  }
  const visited = new Set();
  for (const initial of parents.keys()) {
    const path = new Set(); let id = initial;
    while (id !== null && parents.has(id) && !visited.has(id)) {
      if (path.has(id)) { fail(`skeleton.bones: 부모 순환이 있습니다 (${id}).`); break; }
      path.add(id); id = parents.get(id);
    }
    for (const seen of path) visited.add(seen);
  }

  const mesh = record(project.mesh) ? project.mesh : {};
  if (!record(project.mesh)) fail('mesh: 단일 메시 객체가 필요합니다.');
  text(mesh.id, 'mesh.id', true);
  if (!validId(mesh.skeletonId) || mesh.skeletonId !== skeleton.id) fail('mesh.skeletonId: 프로젝트 skeleton.id와 일치해야 합니다.');
  const vertices = list(mesh.vertices, 'mesh.vertices', RIG_LIMITS.vertices);
  vertices.forEach((vertex, index) => vector(vertex, `mesh.vertices[${index}]`, RIG_LIMITS.coordinate));
  const triangles = list(mesh.triangles, 'mesh.triangles', RIG_LIMITS.triangles);
  triangles.forEach((triangle, index) => {
    if (!Array.isArray(triangle) || triangle.length !== 3 || !triangle.every(vertex => Number.isInteger(vertex) && vertex >= 0 && vertex < vertices.length) || new Set(triangle).size !== 3) fail(`mesh.triangles[${index}]: 서로 다른 유효 vertex index 3개가 필요합니다.`);
  });
  if (mesh.uvs !== undefined) {
    if (!Array.isArray(mesh.uvs) || mesh.uvs.length !== vertices.length) fail('mesh.uvs: 각 vertex에 대응하는 UV 배열이 필요합니다.');
    else mesh.uvs.forEach((uv, index) => {
      if (!Array.isArray(uv) || uv.length !== 2 || !uv.every(value => Number.isFinite(value) && value >= 0 && value <= 1)) fail(`mesh.uvs[${index}]: 0~1 유한한 [u,v]가 필요합니다.`);
    });
  }
  if (mesh.drawOrder !== undefined && (!Array.isArray(mesh.drawOrder) || mesh.drawOrder.length !== triangles.length
    || !mesh.drawOrder.every(layer => Number.isInteger(layer) && Math.abs(layer) <= RIG_LIMITS.triangles))) fail(`mesh.drawOrder: triangle마다 ±${RIG_LIMITS.triangles} 이내 정수 layer가 필요합니다.`);
  if (mesh.faceColors !== undefined && (!Array.isArray(mesh.faceColors) || mesh.faceColors.length !== triangles.length
    || !Array.from(mesh.faceColors).every(color => color === null || typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color)))) fail('mesh.faceColors: triangle마다 null(기존 재질) 또는 #rrggbb 저작 면 색상이 필요합니다.');
  const weights = list(mesh.weights, 'mesh.weights', RIG_LIMITS.vertices);
  if (!Array.isArray(mesh.weights) || mesh.weights.length !== vertices.length) fail('mesh.weights: 각 vertex에 대응하는 가중치 배열이 필요합니다.');
  for (const [index, influences] of weights.entries()) {
    const path = `mesh.weights[${index}]`, entries = list(influences, path, RIG_LIMITS.influences), seen = new Set();
    let sum = 0;
    for (const [influenceIndex, influence] of entries.entries()) {
      if (!record(influence)) { fail(`${path}[${influenceIndex}]: boneId/weight 객체가 필요합니다.`); continue; }
      if (!validId(influence.boneId) || !boneIds.has(influence.boneId)) fail(`${path}[${influenceIndex}].boneId: 기존 bone ID가 필요합니다.`);
      if (seen.has(influence.boneId)) fail(`${path}: 같은 bone의 가중치를 중복할 수 없습니다.`);
      seen.add(influence.boneId);
      if (!Number.isFinite(influence.weight) || influence.weight <= 0 || influence.weight > 1) fail(`${path}[${influenceIndex}].weight: 유한한 0초과~1 값이 필요합니다.`);
      else sum += influence.weight;
    }
    if (Math.abs(sum - 1) > RIG_LIMITS.weightTolerance) fail(`${path}: 가중치 합은 1 (허용 오차 ${RIG_LIMITS.weightTolerance})이어야 합니다.`);
  }

  const materials = list(project.materials, 'materials', RIG_LIMITS.materials), materialIds = identify(materials, 'materials');
  const textureSizes = new Map();
  for (const [index, material] of materials.entries()) {
    if (!record(material)) continue;
    const path = `materials[${index}]`;
    if (!validId(material.meshId) || material.meshId !== mesh.id) fail(`${path}.meshId: 프로젝트 mesh.id와 일치해야 합니다.`);
    if (!validId(material.skeletonId) || material.skeletonId !== skeleton.id) fail(`${path}.skeletonId: 호환 skeleton.id가 필요합니다.`);
    if (typeof material.color !== 'string' || !/^#[0-9a-f]{6}$/i.test(material.color)) fail(`${path}.color: #rrggbb 색상이 필요합니다.`);
    if (material.texture !== undefined) {
      const texture = material.texture;
      if (!record(texture)) { fail(`${path}.texture: src/width/height 객체가 필요합니다.`); continue; }
      if (!validTextureSource(texture.src)) fail(`${path}.texture.src: traversal 없는 로컬 HTTP 경로가 필요합니다.`);
      for (const axis of ['width', 'height']) if (!Number.isInteger(texture[axis]) || texture[axis] < 1 || texture[axis] > RIG_LIMITS.textureDimension) fail(`${path}.texture.${axis}: 1~${RIG_LIMITS.textureDimension} 정수 치수가 필요합니다.`);
      if (!Array.isArray(mesh.uvs)) fail(`${path}.texture: mesh.uvs가 필요합니다.`);
      const size = `${texture.width}x${texture.height}`;
      if (textureSizes.has(texture.src) && textureSizes.get(texture.src) !== size) fail(`${path}.texture: 같은 src의 선언 치수가 일치해야 합니다.`);
      textureSizes.set(texture.src, size);
    }
  }

  const clips = list(project.clips, 'clips', RIG_LIMITS.clips), clipIds = identify(clips, 'clips');
  for (const [clipIndex, clip] of clips.entries()) {
    if (!record(clip)) continue;
    const path = `clips[${clipIndex}]`;
    if (!Number.isFinite(clip.duration) || clip.duration <= 0) fail(`${path}.duration: 유한한 0초과 값이 필요합니다.`);
    number(clip.fps, `${path}.fps`, 1, 120);
    if (typeof clip.loop !== 'boolean') fail(`${path}.loop: boolean이 필요합니다.`);
    const tracks = list(clip.tracks, `${path}.tracks`, RIG_LIMITS.tracks), trackIds = new Set();
    for (const [trackIndex, track] of tracks.entries()) {
      const trackPath = `${path}.tracks[${trackIndex}]`;
      if (!record(track)) { fail(`${trackPath}: track 객체가 필요합니다.`); continue; }
      if (!validId(track.boneId) || !boneIds.has(track.boneId)) fail(`${trackPath}.boneId: 기존 bone ID가 필요합니다.`);
      if (trackIds.has(track.boneId)) fail(`${trackPath}: 같은 bone track을 중복할 수 없습니다.`);
      trackIds.add(track.boneId);
      const keys = list(track.keys, `${trackPath}.keys`, RIG_LIMITS.keys, 2);
      if (keys.length && keys[0]?.time !== 0) fail(`${trackPath}.keys: 첫 key time은 0이어야 합니다.`);
      if (keys.length && clip.loop === true && keys.at(-1)?.time !== clip.duration) fail(`${trackPath}.keys: loop의 마지막 key time은 duration이어야 합니다.`);
      let previous = -1;
      for (const [keyIndex, key] of keys.entries()) {
        const keyPath = `${trackPath}.keys[${keyIndex}]`;
        if (!record(key)) { fail(`${keyPath}: key 객체가 필요합니다.`); continue; }
        transform(key, keyPath);
        if (!Number.isFinite(key.time) || key.time < 0 || key.time > clip.duration) fail(`${keyPath}.time: 0~duration 범위의 유한한 시간이 필요합니다.`);
        if (keyIndex > 0 && !(key.time > previous)) fail(`${keyPath}.time: key 시간이 엄격히 증가해야 합니다.`);
        previous = key.time;
      }
    }
  }

  const preview = record(project.preview) ? project.preview : {};
  if (!record(project.preview)) fail('preview: 미리보기 객체가 필요합니다.');
  if (!validId(preview.materialId) || !materialIds.has(preview.materialId)) fail('preview.materialId: 기존 호환 material ID가 필요합니다.');
  if (preview.clipId !== null && (!validId(preview.clipId) || !clipIds.has(preview.clipId))) fail('preview.clipId: null(바인드 자세) 또는 기존 clip ID가 필요합니다.');
  number(preview.time, 'preview.time', 0);
  if (typeof preview.playing !== 'boolean') fail('preview.playing: boolean이 필요합니다.');
  if (!record(preview.pose)) fail('preview.pose: bone ID별 수동 offset 객체가 필요합니다.');
  else for (const [boneId, pose] of Object.entries(preview.pose)) {
    if (!validId(boneId) || !boneIds.has(boneId)) fail(`preview.pose[${boneId}]: 기존 bone ID가 필요합니다.`);
    transform(pose, `preview.pose[${boneId}]`);
  }
  if (preview.camera !== undefined) {
    if (!record(preview.camera)) fail('preview.camera: yaw/pitch/zoom 객체가 필요합니다.');
    else {
      number(preview.camera.yaw, 'preview.camera.yaw', -Math.PI, Math.PI);
      number(preview.camera.pitch, 'preview.camera.pitch', -Math.PI / 3, Math.PI / 3);
      number(preview.camera.zoom, 'preview.camera.zoom', .5, 2);
    }
  }

  // Bound saved data as UTF-8 JSON and reject values structuredClone/export could change or fail on.
  if (errors.length === 0) {
    try {
      // Inspect descriptors before JSON.stringify can invoke a user-supplied toJSON method.
      const pending = [project], seen = new WeakSet();
      while (pending.length) {
        const value = pending.pop();
        if (value === null || typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))) continue;
        if (typeof value !== 'object' || (!Array.isArray(value) && ![Object.prototype, null].includes(Object.getPrototypeOf(value))) || Object.getOwnPropertySymbols(value).length) throw new TypeError('JSON 값만 저장할 수 있습니다.');
        if (seen.has(value)) continue;
        seen.add(value);
        for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
          if (Array.isArray(value) && key === 'length') continue;
          if (!Object.hasOwn(descriptor, 'value') || !descriptor.enumerable ||
              (Array.isArray(value) && (String(Number(key)) !== key || !Number.isInteger(Number(key)) || Number(key) < 0 || Number(key) >= value.length))) throw new TypeError('JSON 데이터 속성만 저장할 수 있습니다.');
          pending.push(descriptor.value);
        }
      }
      const json = JSON.stringify(project, function (key, value) {
        const original = key === '' && this[key] === project ? project : this[key];
        if (original === undefined || ['function', 'symbol', 'bigint'].includes(typeof original) ||
            (typeof original === 'number' && !Number.isFinite(original)) ||
            (record(original) && ![Object.prototype, null].includes(Object.getPrototypeOf(original)))) throw new TypeError('JSON 값만 저장할 수 있습니다.');
        return value;
      });
      if (new TextEncoder().encode(json).byteLength > RIG_LIMITS.fileBytes) fail(`프로젝트 파일: UTF-8 JSON ${RIG_LIMITS.fileBytes}bytes (2MiB) 이하여야 합니다.`);
    } catch (error) {
      fail(`프로젝트 JSON: ${error.message}`);
    }
  }
  return { ok: errors.length === 0, errors };
}

/** Independent validated authoring history. Render/playback state is managed by the caller. */
export class RigProjectStore {
  #project; #past = []; #future = [];
  signals = new Signals();
  constructor(project) { this.#assert(project); this.#project = clone(project); }
  #assert(project) {
    const result = validateRigProject(project);
    if (!result.ok) throw new TypeError(result.errors.join('\n'));
  }
  get project() { return clone(this.#project); }
  get canUndo() { return this.#past.length > 0; }
  get canRedo() { return this.#future.length > 0; }
  change(label, mutate) { const next = clone(this.#project); mutate(next); return this.replace(next, label); }
  replace(project, label = '리그 프로젝트 불러오기') {
    this.#assert(project);
    if (JSON.stringify(project) === JSON.stringify(this.#project)) return false;
    this.#past.push({ project: this.#project, label });
    if (this.#past.length > RIG_LIMITS.history) this.#past.shift();
    this.#project = clone(project); this.#future = [];
    this.signals.emit('changed', { project: this.project, label }); return true;
  }
  undo() {
    if (!this.canUndo) return false;
    const previous = this.#past.pop();
    this.#future.push({ project: this.#project, label: previous.label }); this.#project = previous.project;
    this.signals.emit('changed', { project: this.project, label: `${previous.label} 취소` }); return true;
  }
  redo() {
    if (!this.canRedo) return false;
    const next = this.#future.pop();
    this.#past.push({ project: this.#project, label: next.label }); this.#project = next.project;
    this.signals.emit('changed', { project: this.project, label: `${next.label} 다시 실행` }); return true;
  }
  dispose() { this.signals.clear(); }
}
