import { validateRigProject, RIG_LIMITS } from './rig-project.js?v=torso-depth-r7';

export const RIG_SLERP_LINEAR_THRESHOLD = 0.9995;
export const RIG_POSE_QUATERNION_TOLERANCE = 1e-6;
const IDENTITY_ROTATION = Object.freeze([0, 0, 0, 1]);
const zero = () => [0, 0, 0];
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const vector = value => Array.isArray(value) && value.length === 3 && Array.from(value).every(Number.isFinite);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export class RigProjectValidationError extends TypeError {
  constructor(errors) {
    super(`Invalid FDG rig evaluation: ${errors.join('; ')}`);
    this.name = 'RigProjectValidationError';
    this.errors = [...errors];
  }
}

const fail = message => { throw new RigProjectValidationError([message]); };

function quaternionMultiply(a, b) {
  const [ax, ay, az, aw] = a, [bx, by, bz, bw] = b;
  return [aw * bx + ax * bw + ay * bz - az * by,
    aw * by - ax * bz + ay * bw + az * bx,
    aw * bz + ax * by - ay * bx + az * bw,
    aw * bw - ax * bx - ay * by - az * bz];
}

function normalizeQuaternion(value) {
  const length = Math.hypot(...value);
  if (!Number.isFinite(length) || length === 0) fail('Rotation produced a nonfinite or zero quaternion.');
  return value.map(component => component / length);
}

/** Intrinsic XYZ, column vectors: R = Rx * Ry * Rz, quaternion [x,y,z,w]. */
export function rigQuaternionFromEuler(euler) {
  if (!vector(euler)) fail('Euler rotation must contain three finite radians.');
  const [x, y, z] = euler.map(angle => angle / 2);
  return normalizeQuaternion(quaternionMultiply(quaternionMultiply(
    [Math.sin(x), 0, 0, Math.cos(x)], [0, Math.sin(y), 0, Math.cos(y)]),
  [0, 0, Math.sin(z), Math.cos(z)]));
}

/** Shortest-path interpolation; antipodal quaternion signs represent one rotation. */
export function rigQuaternionSlerp(from, to, amount) {
  if (!Array.isArray(from) || from.length !== 4 || !from.every(Number.isFinite)
    || !Array.isArray(to) || to.length !== 4 || !to.every(Number.isFinite)
    || !Number.isFinite(amount) || amount < 0 || amount > 1) fail('Slerp needs finite quaternion arrays and amount in 0..1.');
  const a = normalizeQuaternion(from), b = normalizeQuaternion(to);
  let dot = a.reduce((sum, value, index) => sum + value * b[index], 0);
  if (dot < 0) { for (let index = 0; index < 4; index += 1) b[index] = -b[index]; dot = -dot; }
  dot = clamp(dot, 0, 1);
  if (dot > RIG_SLERP_LINEAR_THRESHOLD) return normalizeQuaternion(a.map((value, index) => value + (b[index] - value) * amount));
  const theta = Math.acos(dot), denominator = Math.sin(theta);
  const aWeight = Math.sin((1 - amount) * theta) / denominator;
  const bWeight = Math.sin(amount * theta) / denominator;
  return normalizeQuaternion(a.map((value, index) => value * aWeight + b[index] * bWeight));
}

function rigidMatrix(translation, q) {
  const [x, y, z, w] = q, xx = x * x, yy = y * y, zz = z * z;
  const xy = x * y, xz = x * z, yz = y * z, wx = w * x, wy = w * y, wz = w * z;
  return [1 - 2 * (yy + zz), 2 * (xy + wz), 2 * (xz - wy), 0,
    2 * (xy - wz), 1 - 2 * (xx + zz), 2 * (yz + wx), 0,
    2 * (xz + wy), 2 * (yz - wx), 1 - 2 * (xx + yy), 0,
    ...translation, 1];
}

function multiplyMatrix(a, b) {
  const result = Array(16).fill(0);
  for (let column = 0; column < 4; column += 1) for (let row = 0; row < 4; row += 1) {
    for (let offset = 0; offset < 4; offset += 1) result[column * 4 + row] += a[offset * 4 + row] * b[column * 4 + offset];
  }
  return result;
}

function inverseRigidMatrix(matrix) {
  const [x, y, z] = matrix.slice(12, 15);
  return [matrix[0], matrix[4], matrix[8], 0,
    matrix[1], matrix[5], matrix[9], 0,
    matrix[2], matrix[6], matrix[10], 0,
    -(matrix[0] * x + matrix[1] * y + matrix[2] * z),
    -(matrix[4] * x + matrix[5] * y + matrix[6] * z),
    -(matrix[8] * x + matrix[9] * y + matrix[10] * z), 1];
}

function transformPoint(matrix, point) {
  return [0, 1, 2].map(row => matrix[row] * point[0] + matrix[4 + row] * point[1] + matrix[8 + row] * point[2] + matrix[12 + row]);
}

function hierarchyWorld(bones, localMatrices, definitions) {
  const worlds = new Map();
  const visit = id => {
    if (worlds.has(id)) return worlds.get(id);
    const bone = definitions.get(id), local = localMatrices.get(id);
    const world = bone.parent === null ? [...local] : multiplyMatrix(visit(bone.parent), local);
    worlds.set(id, world);
    return world;
  };
  for (const bone of bones) visit(bone.id);
  return worlds;
}

function clipTime(clip, seconds) {
  if (!clip.loop) return clamp(seconds, 0, clip.duration);
  const remainder = seconds % clip.duration;
  return remainder < 0 ? remainder + clip.duration : remainder;
}

function trackSample(track, time) {
  const keys = track.keys;
  if (time <= keys[0].time) return { translation: [...keys[0].translation], rotation: [...keys[0].rotation] };
  if (time >= keys.at(-1).time) return { translation: [...keys.at(-1).translation], rotation: [...keys.at(-1).rotation] };
  let low = 0, high = keys.length - 1;
  while (high - low > 1) { const middle = Math.floor((low + high) / 2); if (keys[middle].time <= time) low = middle; else high = middle; }
  const from = keys[low], to = keys[high], amount = (time - from.time) / (to.time - from.time);
  return { translation: from.translation.map((value, axis) => value + (to.translation[axis] - value) * amount),
    rotation: rigQuaternionSlerp(from.rotation, to.rotation, amount) };
}

function sampleOffsets(bones, clip, time) {
  const offsets = new Map(bones.map(bone => [bone.id, { translation: zero(), rotation: [...IDENTITY_ROTATION] }]));
  if (clip) for (const track of clip.tracks) offsets.set(track.boneId, trackSample(track, clipTime(clip, time)));
  return offsets;
}

function prepareRig(project) {
  const bones = project.skeleton.bones;
  const definitions = new Map(bones.map(bone => [bone.id, bone]));
  const bindRotations = new Map(), bindLocal = new Map();
  for (const bone of bones) {
    const rotation = rigQuaternionFromEuler(bone.rotation);
    bindRotations.set(bone.id, rotation);
    bindLocal.set(bone.id, rigidMatrix(bone.translation, rotation));
  }
  const bindWorld = hierarchyWorld(bones, bindLocal, definitions);
  const inverseBindWorld = new Map(bones.map(bone => [bone.id, inverseRigidMatrix(bindWorld.get(bone.id))]));
  const influences = project.mesh.weights.map(weights => {
    const total = weights.reduce((sum, influence) => sum + influence.weight, 0);
    return weights.map(influence => ({ boneId: influence.boneId, weight: influence.weight / total }));
  });
  const clips = new Map(project.clips.map(clip => [clip.id, { ...clip,
    tracks: clip.tracks.map(track => ({ ...track, keys: track.keys.map(key => ({
      time: key.time, translation: [...key.translation], rotation: rigQuaternionFromEuler(key.rotation),
    })) })),
  }]));
  return { project, bones, definitions, bindRotations, bindWorld, inverseBindWorld, influences, clips,
    materials: new Map(project.materials.map(material => [material.id, material])) };
}

function snapshotOffsets(prepared, value) {
  if (!Array.isArray(value) || value.length !== prepared.bones.length) fail('fromPose must contain every bone exactly once.');
  const offsets = new Map();
  for (const entry of value) {
    if (!record(entry) || !prepared.definitions.has(entry.id) || offsets.has(entry.id)
      || !vector(entry.translation) || entry.translation.some(component => Math.abs(component) > RIG_LIMITS.coordinate)
      || !Array.isArray(entry.rotationQuaternion) || entry.rotationQuaternion.length !== 4
      || !entry.rotationQuaternion.every(Number.isFinite)
      || !Number.isFinite(Math.hypot(...entry.rotationQuaternion))
      || Math.abs(Math.hypot(...entry.rotationQuaternion) - 1) > RIG_POSE_QUATERNION_TOLERANCE) {
      fail('fromPose needs each existing bone once, bounded finite translation and a unit rotationQuaternion.');
    }
    offsets.set(entry.id, { translation: [...entry.translation], rotation: [...entry.rotationQuaternion] });
  }
  return offsets;
}

function validateOptions(prepared, options) {
  if (!record(options)) fail('Evaluation options must be an object.');
  const { project } = prepared;
  const { materialId = project.preview.materialId, clipId = project.preview.clipId,
    time = project.preview.time, pose = project.preview.pose, blend = null } = options;
  const material = prepared.materials.get(materialId);
  if (!material) fail(`Unknown materialId: ${String(materialId)}.`);
  const getClip = id => { const clip = id === null ? null : prepared.clips.get(id); if (id !== null && !clip) fail(`Unknown clipId: ${String(id)}.`); return clip; };
  const clip = getClip(clipId);
  if (!Number.isFinite(time)) fail('Evaluation time must be finite seconds.');
  if (!record(pose)) fail('Manual pose must be a boneId-to-offset object.');
  for (const [id, value] of Object.entries(pose)) {
    if (!prepared.definitions.has(id) || !record(value) || !vector(value.translation) || !vector(value.rotation)
      || value.translation.some(component => Math.abs(component) > RIG_LIMITS.coordinate)
      || value.rotation.some(component => Math.abs(component) > RIG_LIMITS.rotation)) fail(`Manual pose ${id} needs an existing bone and finite translation/rotation triples within the project limits.`);
  }
  let fromClip = null, fromPose = null;
  if (blend !== null) {
    if (!record(blend) || !Number.isFinite(blend.amount) || blend.amount < 0 || blend.amount > 1) fail('Blend needs an object and finite amount in 0..1.');
    if ('fromPose' in blend) {
      if ('fromClipId' in blend || 'fromTime' in blend) fail('Blend cannot mix fromPose with fromClipId/fromTime.');
      fromPose = snapshotOffsets(prepared, blend.fromPose);
    } else {
      if (!Number.isFinite(blend.fromTime)) fail('Clip blend needs finite fromTime and amount in 0..1.');
      fromClip = getClip(blend.fromClipId);
    }
  }
  return { material, clip, clipId, time, pose, blend, fromClip, fromPose };
}

function blendOffsets(bones, from, target, amount) {
  for (const bone of bones) {
    const a = from.get(bone.id), b = target.get(bone.id);
    target.set(bone.id, { translation: a.translation.map((value, axis) => value + (b.translation[axis] - value) * amount),
      rotation: rigQuaternionSlerp(a.rotation, b.rotation, amount) });
  }
}

function applyManualOffsets(bones, offsets, pose) {
  for (const bone of bones) {
    const offset = offsets.get(bone.id), manual = Object.hasOwn(pose, bone.id) ? pose[bone.id] : undefined;
    const translation = offset.translation.map((value, axis) => value + (manual?.translation[axis] ?? 0));
    const rotation = normalizeQuaternion(quaternionMultiply(offset.rotation, manual ? rigQuaternionFromEuler(manual.rotation) : IDENTITY_ROTATION));
    offsets.set(bone.id, { translation, rotation });
  }
}

function evaluatePrepared(prepared, options) {
  const { project, bones } = prepared;
  const { material, clip, clipId, time, pose, blend, fromClip, fromPose } = validateOptions(prepared, options);
  const offsets = sampleOffsets(bones, clip, time);
  if (blend && !fromPose) blendOffsets(bones, sampleOffsets(bones, fromClip, blend.fromTime), offsets, blend.amount);
  applyManualOffsets(bones, offsets, pose);
  // A captured localPose already contains source manual offsets. Apply manual only to the target.
  if (fromPose) blendOffsets(bones, fromPose, offsets, blend.amount);
  const posedLocal = new Map(), localPose = [];
  for (const bone of bones) {
    const { translation, rotation } = offsets.get(bone.id);
    posedLocal.set(bone.id, rigidMatrix(bone.translation.map((value, axis) => value + translation[axis]),
      normalizeQuaternion(quaternionMultiply(prepared.bindRotations.get(bone.id), rotation))));
    localPose.push({ id: bone.id, translation, rotationQuaternion: rotation });
  }
  const world = hierarchyWorld(bones, posedLocal, prepared.definitions);
  const skin = new Map(), boneMatrices = bones.map(bone => {
    const inverseBindWorld = prepared.inverseBindWorld.get(bone.id);
    const matrix = multiplyMatrix(world.get(bone.id), inverseBindWorld);
    skin.set(bone.id, matrix);
    return { id: bone.id, bindWorld: [...prepared.bindWorld.get(bone.id)], inverseBindWorld: [...inverseBindWorld],
      world: [...world.get(bone.id)], skin: [...matrix] };
  });
  const vertices = project.mesh.vertices.map((vertex, index) => {
    const result = zero(), influences = prepared.influences[index];
    for (const influence of influences) {
      const transformed = transformPoint(skin.get(influence.boneId), vertex);
      for (let axis = 0; axis < 3; axis += 1) result[axis] += transformed[axis] * influence.weight;
    }
    if (!result.every(Number.isFinite)) fail(`Vertex ${index} evaluation produced a nonfinite coordinate.`);
    return result;
  });
  return { materialId: material.id, meshId: project.mesh.id, skeletonId: project.skeleton.id,
    clipId, time: clip ? clipTime(clip, time) : time, vertices,
    triangles: project.mesh.triangles.map(triangle => [...triangle]), color: material.color,
    ...(project.mesh.uvs === undefined ? {} : { uvs: project.mesh.uvs.map(uv => [...uv]) }),
    ...(project.mesh.drawOrder === undefined ? {} : { drawOrder: [...project.mesh.drawOrder] }),
    ...(project.mesh.faceColors === undefined ? {} : { faceColors: [...project.mesh.faceColors] }),
    ...(material.texture === undefined ? {} : { texture: structuredClone(material.texture) }),
    bonePositions: bones.map(bone => ({ id: bone.id, parent: bone.parent, position: world.get(bone.id).slice(12, 15) })),
    boneMatrices, localPose };
}

/** Evaluate with full project validation each call. No clock or renderer. */
export function evaluateRig(project, options = {}) {
  const validation = validateRigProject(project);
  if (!validation.ok) throw new RigProjectValidationError(validation.errors);
  return evaluatePrepared(prepareRig(project), options);
}

/** Validate and own a project copy; reuse static bind/clip/influence preparation. */
export function compileRigEvaluator(project) {
  const validation = validateRigProject(project);
  if (!validation.ok) throw new RigProjectValidationError(validation.errors);
  let owned;
  try { owned = structuredClone(project); } catch { fail('Compiled rig project must be independently cloneable.'); }
  const prepared = prepareRig(owned);
  return Object.freeze({ evaluate(options = {}) { return evaluatePrepared(prepared, options); } });
}
