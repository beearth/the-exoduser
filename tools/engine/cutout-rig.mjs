// Original-cell cutout data and Canvas2D rendering. No DOM, clock or storage.
export const CUTOUT_SOURCE = Object.freeze({
  asset: 'assets/sprites/boss/boss_dark_druid_8dir_v3.png',
  imageWidth: 1656, imageHeight: 1240, x: 0, y: 0, width: 414, height: 620,
});
export const CUTOUT_LIMITS = Object.freeze({ parts: 16, points: 64, name: 200, json: 1000000 });
const EPSILON = 1e-8;
const normalized = new WeakSet();

function objectData(raw, required, optional = [], label = 'object') {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new TypeError(label + ': 객체가 필요합니다.');
  const prototype = Object.getPrototypeOf(raw);
  if (prototype !== Object.prototype && prototype !== null) throw new TypeError(label + ': 일반 데이터 객체만 허용합니다.');
  const descriptors = Object.getOwnPropertyDescriptors(raw);
  const allowed = new Set([...required, ...optional]);
  for (const key of Reflect.ownKeys(descriptors)) {
    if (typeof key !== 'string' || !allowed.has(key) || !('value' in descriptors[key])) {
      throw new TypeError(label + ': 알 수 없는 필드 또는 accessor는 허용하지 않습니다.');
    }
  }
  const values = Object.create(null);
  for (const key of required) {
    if (!Object.hasOwn(descriptors, key)) throw new TypeError(label + ': 필수 필드 ' + key);
    values[key] = descriptors[key].value;
  }
  for (const key of optional) if (Object.hasOwn(descriptors, key)) values[key] = descriptors[key].value;
  return values;
}

function arrayData(raw, min, max, label) {
  if (!Array.isArray(raw) || Object.getPrototypeOf(raw) !== Array.prototype) throw new TypeError(label + ': 일반 배열이 필요합니다.');
  const length = Object.getOwnPropertyDescriptor(raw, 'length').value;
  if (!Number.isSafeInteger(length) || length < min || length > max) throw new RangeError(label + ': 배열 길이 범위를 벗어났습니다.');
  const descriptors = Object.getOwnPropertyDescriptors(raw);
  const keys = Reflect.ownKeys(descriptors);
  if (keys.length !== length + 1) throw new TypeError(label + ': sparse 배열/추가 필드는 허용하지 않습니다.');
  const result = [];
  for (let index = 0; index < length; index++) {
    const descriptor = descriptors[index];
    if (!descriptor || !('value' in descriptor)) throw new TypeError(label + ': accessor/hole은 허용하지 않습니다.');
    result.push(descriptor.value);
  }
  return result;
}

function number(raw, min, max, label) {
  if (typeof raw !== 'number' || !Number.isFinite(raw) || raw < min || raw > max) throw new RangeError(label + ': 유한 숫자 범위를 확인하세요.');
  return raw;
}

function name(raw, limit, label) {
  if (typeof raw !== 'string' || !raw.trim() || raw.length > limit) throw new TypeError(label + ': 비어 있지 않은 문자열이 필요합니다.');
  return raw;
}

function point(raw, label) {
  const values = arrayData(raw, 2, 2, label);
  return Object.freeze([
    number(values[0], 0, CUTOUT_SOURCE.width, label + '.x'),
    number(values[1], 0, CUTOUT_SOURCE.height, label + '.y'),
  ]);
}

function cross(a, b, c) {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
}

function onSegment(a, b, p) {
  return Math.abs(cross(a, b, p)) <= EPSILON &&
    p[0] >= Math.min(a[0], b[0]) - EPSILON && p[0] <= Math.max(a[0], b[0]) + EPSILON &&
    p[1] >= Math.min(a[1], b[1]) - EPSILON && p[1] <= Math.max(a[1], b[1]) + EPSILON;
}

function intersects(a, b, c, d) {
  const abC = cross(a, b, c);
  const abD = cross(a, b, d);
  const cdA = cross(c, d, a);
  const cdB = cross(c, d, b);
  if (((abC > EPSILON && abD < -EPSILON) || (abC < -EPSILON && abD > EPSILON)) &&
      ((cdA > EPSILON && cdB < -EPSILON) || (cdA < -EPSILON && cdB > EPSILON))) return true;
  return onSegment(a, b, c) || onSegment(a, b, d) || onSegment(c, d, a) || onSegment(c, d, b);
}

function inside(polygon, p) {
  let result = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[j];
    const b = polygon[i];
    if (onSegment(a, b, p)) return true;
    if ((a[1] > p[1]) !== (b[1] > p[1]) &&
        p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) result = !result;
  }
  return result;
}

function simplePolygon(raw) {
  const polygon = arrayData(raw, 3, CUTOUT_LIMITS.points, 'polygon').map((value, index) => point(value, 'polygon[' + index + ']'));
  let twiceArea = 0;
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];
    const c = polygon[(i + 2) % polygon.length];
    if (Math.abs(a[0] - b[0]) <= EPSILON && Math.abs(a[1] - b[1]) <= EPSILON) throw new Error('polygon: 중복점/길이 0인 변은 허용하지 않습니다.');
    if (Math.abs(cross(a, b, c)) <= EPSILON &&
        (a[0] - b[0]) * (c[0] - b[0]) + (a[1] - b[1]) * (c[1] - b[1]) > EPSILON) {
      throw new Error('polygon: 인접한 변이 되짚어 겹칩니다.');
    }
    twiceArea += a[0] * b[1] - b[0] * a[1];
    for (let j = i + 1; j < polygon.length; j++) {
      if (j === i + 1 || (i === 0 && j === polygon.length - 1)) continue;
      if (intersects(a, b, polygon[j], polygon[(j + 1) % polygon.length])) throw new Error('polygon: 자기 교차/비인접 접촉은 허용하지 않습니다.');
    }
  }
  if (Math.abs(twiceArea) <= EPSILON) throw new Error('polygon: 면적이 0인 부위는 허용하지 않습니다.');
  return Object.freeze(polygon);
}

function overlapping(a, b) {
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      if (intersects(a[i], a[(i + 1) % a.length], b[j], b[(j + 1) % b.length])) return true;
    }
  }
  return inside(a, b[0]) || inside(b, a[0]);
}

function poseData(parts, raw) {
  const entries = arrayData(raw, 0, CUTOUT_LIMITS.parts, 'pose');
  const byId = new Map();
  const ids = new Set(parts.map(part => part.id));
  for (const entry of entries) {
    const data = objectData(entry, ['id', 'angleDegrees', 'x', 'y'], [], 'pose entry');
    const id = name(data.id, 80, 'pose.id');
    if (!ids.has(id) || byId.has(id)) throw new Error('pose: 없는 부위 또는 중복 id입니다.');
    byId.set(id, Object.freeze({
      id, angleDegrees: number(data.angleDegrees, -90, 90, 'angleDegrees'),
      x: number(data.x, -CUTOUT_SOURCE.width, CUTOUT_SOURCE.width, 'pose.x'),
      y: number(data.y, -CUTOUT_SOURCE.height, CUTOUT_SOURCE.height, 'pose.y'),
    }));
  }
  return Object.freeze(parts.map(part => byId.get(part.id) || Object.freeze({ id: part.id, angleDegrees: 0, x: 0, y: 0 })));
}

export function normalizeCutoutRig(raw) {
  if (normalized.has(raw)) return raw;
  const data = objectData(raw, ['format', 'version', 'name', 'source', 'parts'], ['pose'], 'rig');
  if (data.format !== 'exoduser-cutout-rig' || data.version !== 1) throw new Error('exoduser-cutout-rig / version 1이 필요합니다.');
  const source = objectData(data.source, Object.keys(CUTOUT_SOURCE), [], 'source');
  for (const key of Object.keys(CUTOUT_SOURCE)) if (source[key] !== CUTOUT_SOURCE[key]) throw new Error('source: 승인된 원본의 첫 셀만 사용할 수 있습니다.');
  const ids = new Set();
  const parts = arrayData(data.parts, 0, CUTOUT_LIMITS.parts, 'parts').map(rawPart => {
    const part = objectData(rawPart, ['id', 'name', 'polygon', 'pivot'], [], 'part');
    const id = name(part.id, 80, 'part.id');
    if (ids.has(id)) throw new Error('parts: 중복 id입니다.');
    ids.add(id);
    return Object.freeze({
      id, name: name(part.name, 100, 'part.name'),
      polygon: simplePolygon(part.polygon), pivot: point(part.pivot, 'pivot'),
    });
  });
  for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
    if (overlapping(parts[i].polygon, parts[j].polygon)) throw new Error('parts: 부위 사이 교차/접촉/겹침/포함은 허용하지 않습니다.');
  }
  const result = Object.freeze({
    format: 'exoduser-cutout-rig', version: 1, name: name(data.name, CUTOUT_LIMITS.name, 'rig.name'),
    source: CUTOUT_SOURCE, parts: Object.freeze(parts), pose: poseData(parts, data.pose === undefined ? [] : data.pose),
  });
  normalized.add(result);
  return result;
}

export function normalizeCutoutPose(rig, raw) {
  const data = normalizeCutoutRig(rig);
  return raw === data.pose || raw === undefined ? data.pose : poseData(data.parts, raw);
}

function transformed(point, pivot, pose) {
  const angle = pose.angleDegrees * Math.PI / 180;
  const x = point[0] - pivot[0];
  const y = point[1] - pivot[1];
  return [pivot[0] + pose.x + x * Math.cos(angle) - y * Math.sin(angle),
    pivot[1] + pose.y + x * Math.sin(angle) + y * Math.cos(angle)];
}

export function cutoutBounds(rig, rawPose) {
  const data = normalizeCutoutRig(rig);
  const pose = normalizeCutoutPose(data, rawPose);
  let minX = 0, minY = 0, maxX = CUTOUT_SOURCE.width, maxY = CUTOUT_SOURCE.height;
  data.parts.forEach((part, index) => part.polygon.forEach(point => {
    const [x, y] = transformed(point, part.pivot, pose[index]);
    minX = Math.min(minX, x); minY = Math.min(minY, y);
    maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
  }));
  return Object.freeze({ minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY });
}

function polygonPath(context, polygon) {
  context.moveTo(polygon[0][0], polygon[0][1]);
  for (let index = 1; index < polygon.length; index++) context.lineTo(polygon[index][0], polygon[index][1]);
  context.closePath();
}

export function renderCutoutRig(context, image, rig, rawPose) {
  const data = normalizeCutoutRig(rig);
  const pose = normalizeCutoutPose(data, rawPose);
  if (!image || image.naturalWidth !== CUTOUT_SOURCE.imageWidth || image.naturalHeight !== CUTOUT_SOURCE.imageHeight) {
    throw new Error('원본 이미지 크기는 1656×1240이어야 합니다.');
  }
  const source = CUTOUT_SOURCE;
  const draw = () => context.drawImage(image, source.x, source.y, source.width, source.height, 0, 0, source.width, source.height);
  const changed = data.parts.map((part, index) => ({ part, value: pose[index] }))
    .filter(({ value }) => value.angleDegrees !== 0 || value.x !== 0 || value.y !== 0);
  const rest = changed.length === 0;
  context.save();
  try {
    context.globalAlpha = 1;
    context.globalCompositeOperation = 'source-over';
    context.filter = 'none';
    context.shadowBlur = 0;
    context.shadowColor = 'rgba(0,0,0,0)';
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.imageSmoothingEnabled = false;
    if (rest) {
      draw();
      return Object.freeze({ mode: 'original', drawCalls: 1, partPasses: 0, source });
    }
    context.save();
    try {
      context.beginPath();
      context.rect(0, 0, source.width, source.height);
      for (const { part } of changed) polygonPath(context, part.polygon);
      context.clip('evenodd');
      draw();
    } finally { context.restore(); }
    changed.forEach(({ part, value }) => {
      context.save();
      try {
        context.translate(part.pivot[0] + value.x, part.pivot[1] + value.y);
        context.rotate(value.angleDegrees * Math.PI / 180);
        context.translate(-part.pivot[0], -part.pivot[1]);
        context.beginPath();
        polygonPath(context, part.polygon);
        context.clip('evenodd');
        draw();
      } finally { context.restore(); }
    });
    return Object.freeze({ mode: 'cutout', drawCalls: 1 + changed.length, partPasses: changed.length, source });
  } finally { context.restore(); }
}
