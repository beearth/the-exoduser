// Native editor data only. The caller injects the authored scene/template baseline.
export const MAX_MAP_PACK_BYTES = 32768;

const PREFIX = '#fdg-pack=';
const OBJECT_COUNT = 38;
const ENCOUNTER_ENEMY_COUNT = 4;
const NATIVE_FACTORY_CLEARANCE = 10;
const ROOT_KEYS = ['version', 'id', 'name', 'baseSceneId', 'map', 'start', 'exit', 'camera', 'enemies', 'objects', 'dependencies'];
const MAP_KEYS = ['mw', 'mh', 'tileSize', 'tileRLE'];
const POINT_KEYS = ['x', 'y'];
const CAMERA_KEYS = ['projection', 'yaw', 'pitch', 'distance', 'zoom', 'near'];
const ENEMY_KEYS = ['x', 'y', 'etype', 'skin'];
const ENCOUNTER_ENEMY_KEYS = [...ENEMY_KEYS, 'instanceId'];
const SOURCE_OBJECT_KEYS = ['id', 'x', 'y', 'scale', 'noCol', 'fdgUpright'];
const OBJECT_KEYS = [...SOURCE_OBJECT_KEYS, 'instanceId'];
const DEPENDENCY_KEYS = ['kind', 'id'];
const LOCKED_OBJECT_KEYS = ['id', 'scale', 'noCol', 'fdgUpright'];
const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor', 'toJSON']);
const CONTROL = /[\u0000-\u001f\u007f-\u009f]/u;
const JSON_TEXT_CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/u;
const utf8 = new TextEncoder();

function wellFormed(value) {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(++i);
      if (!(next >= 0xdc00 && next <= 0xdfff)) return false;
    } else if (code >= 0xdc00 && code <= 0xdfff) return false;
  }
  return true;
}

// Read descriptors, never getters/toJSON. Snapshot before any schema reads or cloning.
function snapshotJson(value, label = 'pack') {
  const ancestors = new Set();
  let nodes = 0;
  function copy(input, path, depth) {
    if (++nodes > MAX_MAP_PACK_BYTES || depth > 64) throw new TypeError(`${path}: JSON structure exceeds the inspection limit`);
    if (input === null || typeof input === 'boolean') return input;
    if (typeof input === 'string') {
      if (CONTROL.test(input) || !wellFormed(input)) throw new TypeError(`${path}: control characters or malformed Unicode are forbidden`);
      return input;
    }
    if (typeof input === 'number') {
      if (!Number.isFinite(input)) throw new TypeError(`${path}: numbers must be finite`);
      return input;
    }
    if (typeof input !== 'object') throw new TypeError(`${path}: only plain JSON values are accepted`);
    const array = Array.isArray(input);
    if (Object.getPrototypeOf(input) !== (array ? Array.prototype : Object.prototype)) throw new TypeError(`${path}: custom prototypes are forbidden`);
    if (ancestors.has(input)) throw new TypeError(`${path}: JSON cycles are forbidden`);
    const descriptors = Object.getOwnPropertyDescriptors(input);
    const keys = Reflect.ownKeys(descriptors);
    if (keys.some(key => typeof key !== 'string')) throw new TypeError(`${path}: symbol keys are forbidden`);
    const length = array ? descriptors.length?.value : 0;
    if (array && (!Number.isSafeInteger(length) || length > MAX_MAP_PACK_BYTES)) throw new TypeError(`${path}: array exceeds the inspection limit`);
    const dataKeys = array ? keys.filter(key => key !== 'length') : keys;
    if (array && (dataKeys.length !== length || dataKeys.some((key, index) => key !== String(index)))) throw new TypeError(`${path}: arrays must be dense and have no custom properties`);
    ancestors.add(input);
    const output = array ? [] : {};
    for (const key of dataKeys) {
      const descriptor = descriptors[key];
      if (FORBIDDEN_KEYS.has(key) || CONTROL.test(key) || !wellFormed(key)) throw new TypeError(`${path}.${key}: forbidden JSON key`);
      if (!Object.hasOwn(descriptor, 'value') || !descriptor.enumerable) throw new TypeError(`${path}.${key}: accessors and hidden properties are forbidden`);
      output[key] = copy(descriptor.value, `${path}.${key}`, depth + 1);
    }
    ancestors.delete(input);
    return output;
  }
  return copy(value, label, 0);
}

// A validated snapshot is serialized without consulting inherited JSON hooks.
function json(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(json).join(',')}]`;
  return `{${Object.keys(value).map(key => `${JSON.stringify(key)}:${json(value[key])}`).join(',')}}`;
}

function clone(value) {
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(clone);
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
}

function record(value) { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function equal(a, b) {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
  const keys = Object.keys(a), other = Object.keys(b);
  return keys.length === other.length && keys.every(key => Object.hasOwn(b, key) && equal(a[key], b[key]));
}

function shape(value, keys, path, errors) {
  if (!record(value)) { errors.push(`${path}: expected an object`); return false; }
  const actual = Object.keys(value);
  for (const key of actual) if (!keys.includes(key)) errors.push(`${path}.${key}: unsupported field`);
  for (const key of keys) if (!Object.hasOwn(value, key)) errors.push(`${path}.${key}: missing field`);
  return true;
}

function instanceId(index) { return `prop-${String(index + 1).padStart(3, '0')}`; }
function enemyInstanceId(index) { return `enemy-${String(index + 1).padStart(3, '0')}`; }
function isQuarterCoordinate(value, bound) {
  return typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value * 4) && value >= 0 && value < bound;
}
function worldPointIsFloor(worldX, worldY, template, tileSize) {
  const x = Math.floor(worldX / tileSize), y = Math.floor(worldY / tileSize);
  if (x < 0 || y < 0 || x >= template.mw || y >= template.mh) return false;
  const index = y * template.mw + x;
  let end = 0;
  for (let i = 0; i < template.tileRLE.length; i += 2) {
    end += template.tileRLE[i + 1];
    if (index < end) return template.tileRLE[i] === 1;
  }
  return false;
}
function footIsFloor(enemy, baseline) {
  const tileSize = baseline.scene.tileSize, x = (enemy.x + .5) * tileSize, y = (enemy.y + .5) * tileSize;
  return [[0, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]].every(([dx, dy]) =>
    worldPointIsFloor(x + dx * NATIVE_FACTORY_CLEARANCE, y + dy * NATIVE_FACTORY_CLEARANCE, baseline.template, tileSize));
}
function dependencies(baseline) {
  const objects = [...new Set(baseline.template.objs.map(object => object.id))];
  const skins = [...new Set(baseline.scene.enemies.map(enemy => enemy.skin))];
  return [...objects.map(id => ({ kind: 'map-object', id })), ...skins.map(id => ({ kind: 'monster-skin', id }))];
}

function readBaseline(input) {
  const baseline = snapshotJson(input, 'baseline');
  if (!record(baseline) || !record(baseline.scene) || !record(baseline.template)) throw new TypeError('baseline: scene and template are required');
  const { scene, template } = baseline;
  if (typeof scene.id !== 'string' || !scene.id.trim() || typeof scene.name !== 'string' || !scene.name.trim()) throw new TypeError('baseline: scene id/name are required');
  if (!Number.isSafeInteger(template.mw) || template.mw < 1 || !Number.isSafeInteger(template.mh) || template.mh < 1 || !Number.isFinite(scene.tileSize) || scene.tileSize <= 0 || scene.width !== template.mw || scene.height !== template.mh) throw new TypeError('baseline: scene/template dimensions must agree');
  if (!Array.isArray(template.tileRLE) || !template.tileRLE.length || template.tileRLE.length % 2) throw new TypeError('baseline: invalid native tileRLE');
  let cells = 0;
  for (let i = 0; i < template.tileRLE.length; i += 2) {
    if (!Number.isSafeInteger(template.tileRLE[i]) || template.tileRLE[i] < 0 || !Number.isSafeInteger(template.tileRLE[i + 1]) || template.tileRLE[i + 1] < 1) throw new TypeError('baseline: invalid native tileRLE run');
    cells += template.tileRLE[i + 1];
  }
  if (cells !== template.mw * template.mh) throw new TypeError('baseline: tileRLE cell count differs from dimensions');
  const errors = [];
  shape(scene.start, POINT_KEYS, 'baseline.start', errors);
  shape(scene.exit, POINT_KEYS, 'baseline.exit', errors);
  shape(scene.camera, CAMERA_KEYS, 'baseline.camera', errors);
  if (!Array.isArray(scene.enemies)) errors.push('baseline.enemies: expected an array');
  else for (const [i, enemy] of scene.enemies.entries()) {
    if (shape(enemy, ENEMY_KEYS, `baseline.enemies.${i}`, errors) && (typeof enemy.skin !== 'string' || !enemy.skin)) errors.push(`baseline.enemies.${i}.skin: missing native skin`);
  }
  if (!Array.isArray(template.objs) || template.objs.length !== OBJECT_COUNT) errors.push(`baseline.objects: expected ${OBJECT_COUNT} authored objects`);
  else for (const [i, object] of template.objs.entries()) {
    if (shape(object, SOURCE_OBJECT_KEYS, `baseline.objects.${i}`, errors) && (typeof object.id !== 'string' || !object.id)) errors.push(`baseline.objects.${i}.id: missing native asset`);
  }
  if (errors.length) throw new TypeError(errors.join('; '));
  return baseline;
}

function baselinePack(baseline) {
  const { scene, template } = baseline;
  return {
    version: 1, id: scene.id, name: scene.name, baseSceneId: scene.id,
    map: { mw: template.mw, mh: template.mh, tileSize: scene.tileSize, tileRLE: clone(template.tileRLE) },
    start: clone(scene.start), exit: clone(scene.exit), camera: clone(scene.camera), enemies: clone(scene.enemies),
    objects: template.objs.map((object, i) => ({ ...clone(object), instanceId: instanceId(i) })),
    dependencies: dependencies(baseline)
  };
}

function check(input, inputBaseline) {
  const errors = [];
  let baseline, pack;
  try { baseline = readBaseline(inputBaseline); } catch (error) { return { ok: false, errors: [String(error.message)] }; }
  try { pack = snapshotJson(input); } catch (error) { return { ok: false, errors: [String(error.message)] }; }
  const bytes = utf8.encode(json(pack)).byteLength;
  if (bytes > MAX_MAP_PACK_BYTES) errors.push(`pack: UTF-8 bytes ${bytes} exceed ${MAX_MAP_PACK_BYTES}`);
  if (!shape(pack, ROOT_KEYS, 'pack', errors)) return { ok: false, errors };
  const expected = baselinePack(baseline);
  if (pack.version !== 1 && pack.version !== 2) errors.push('pack.version: only versions 1 and 2 are supported');
  for (const key of ['id', 'name']) if (typeof pack[key] !== 'string' || !pack[key].trim()) errors.push(`pack.${key}: expected a nonempty string`);
  if (pack.baseSceneId !== expected.baseSceneId) errors.push('pack.baseSceneId: must equal the authored baseline');
  shape(pack.map, MAP_KEYS, 'pack.map', errors);
  if (!equal(pack.map, expected.map)) errors.push('pack.map: native dimensions/tileSize/tileRLE are protected');
  for (const key of ['start', 'exit', 'camera']) {
    shape(pack[key], key === 'camera' ? CAMERA_KEYS : POINT_KEYS, `pack.${key}`, errors);
    if (!equal(pack[key], expected[key])) errors.push(`pack.${key}: must equal the authored baseline`);
  }
  if (!Array.isArray(pack.enemies)) errors.push('pack.enemies: expected an array');
  else if (pack.version === 2) {
    if (pack.enemies.length !== ENCOUNTER_ENEMY_COUNT || expected.enemies.length !== ENCOUNTER_ENEMY_COUNT) errors.push(`pack.enemies: expected exactly ${ENCOUNTER_ENEMY_COUNT} enemies in authored order`);
    for (const [i, enemy] of pack.enemies.entries()) {
      const path = `pack.enemies.${i}`;
      if (!shape(enemy, ENCOUNTER_ENEMY_KEYS, path, errors)) continue;
      const original = expected.enemies[i];
      if (!original) continue;
      if (enemy.instanceId !== enemyInstanceId(i)) errors.push(`${path}.instanceId: must be ${enemyInstanceId(i)} in authored order`);
      for (const key of ['etype', 'skin']) if (!equal(enemy[key], original[key])) errors.push(`${path}.${key}: native source field is protected`);
      let coordinatesValid = true;
      for (const [axis, bound] of [['x', baseline.template.mw], ['y', baseline.template.mh]]) {
        if (!isQuarterCoordinate(enemy[axis], bound)) { errors.push(`${path}.${axis}: expected a quarter-tile coordinate in [0, ${bound})`); coordinatesValid = false; }
      }
      if (coordinatesValid && !footIsFloor(enemy, baseline)) errors.push(`${path}: native factory foot ((x+.5)*tileSize, (y+.5)*tileSize) and canMv ${NATIVE_FACTORY_CLEARANCE}px corners must lie on authored RLE floor 1`);
    }
  } else {
    for (const [i, enemy] of pack.enemies.entries()) shape(enemy, ENEMY_KEYS, `pack.enemies.${i}`, errors);
    if (!equal(pack.enemies, expected.enemies)) errors.push('pack.enemies: native positions/types/skins are protected');
  }
  if (!Array.isArray(pack.objects) || pack.objects.length !== OBJECT_COUNT) errors.push(`pack.objects: expected exactly ${OBJECT_COUNT} objects in authored order`);
  if (Array.isArray(pack.objects)) {
    for (const [i, object] of pack.objects.entries()) {
      const path = `pack.objects.${i}`;
      if (!shape(object, OBJECT_KEYS, path, errors)) continue;
      const original = expected.objects[i];
      if (!original) continue;
      if (object.instanceId !== instanceId(i)) errors.push(`${path}.instanceId: must be ${instanceId(i)} in authored order`);
      for (const key of LOCKED_OBJECT_KEYS) if (!equal(object[key], original[key])) errors.push(`${path}.${key}: native source field is protected`);
      for (const [axis, bound] of [['x', baseline.template.mw], ['y', baseline.template.mh]]) {
        const coordinate = object[axis];
        if (typeof coordinate !== 'number' || !Number.isFinite(coordinate) || !Number.isInteger(coordinate * 4) || coordinate < 0 || coordinate >= bound) errors.push(`${path}.${axis}: expected a quarter-tile coordinate in [0, ${bound})`);
      }
    }
    const bones = pack.objects.flatMap((object, index) => record(object) && object.id === 'm_c1sbone' && typeof object.x === 'number' && typeof object.y === 'number' ? [{ object, index }] : []);
    for (let i = 0; i < bones.length; i++) for (let j = i + 1; j < bones.length; j++) {
      if (Math.hypot(bones[i].object.x - bones[j].object.x, bones[i].object.y - bones[j].object.y) < 5) errors.push(`pack.objects: m_c1sbone ${instanceId(bones[i].index)}/${instanceId(bones[j].index)} spacing must be at least 5 tiles`);
    }
  }
  if (!Array.isArray(pack.dependencies)) errors.push('pack.dependencies: expected an array');
  else {
    const seen = new Set();
    for (const [i, dependency] of pack.dependencies.entries()) {
      if (!shape(dependency, DEPENDENCY_KEYS, `pack.dependencies.${i}`, errors)) continue;
      if (!['map-object', 'monster-skin'].includes(dependency.kind) || typeof dependency.id !== 'string') {
        errors.push(`pack.dependencies.${i}: invalid native reference`);
        continue;
      }
      const reference = `${dependency.kind}:${dependency.id}`;
      if (seen.has(reference)) errors.push(`pack.dependencies.${i}: duplicate native reference`);
      seen.add(reference);
    }
  }
  if (!equal(pack.dependencies, expected.dependencies)) errors.push('pack.dependencies: must exactly match unique authored object assets and monster skins in first-use order');
  return { ok: errors.length === 0, errors, pack, baseline, bytes };
}

function requireValid(input, baseline) {
  const checked = check(input, baseline);
  if (!checked.ok) throw new TypeError(`Invalid native map pack: ${checked.errors.join('; ')}`);
  return checked;
}

export function createNativeMapPack(baseline) {
  const pack = baselinePack(readBaseline(baseline));
  return requireValid(pack, baseline).pack;
}

export function createNativeEncounterMapPack(baseline, sourcePack) {
  const pack = requireValid(sourcePack === undefined ? createNativeMapPack(baseline) : sourcePack, baseline).pack;
  pack.version = 2;
  pack.enemies = pack.enemies.map((enemy, i) => ({ ...enemy, instanceId: enemyInstanceId(i) }));
  return requireValid(pack, baseline).pack;
}

export function validateNativeMapPack(pack, baseline) {
  const { ok, errors } = check(pack, baseline);
  return { ok, errors };
}

export function compileNativeMapPack(input, inputBaseline) {
  const { pack, baseline, bytes } = requireValid(input, inputBaseline);
  const scene = clone(baseline.scene), template = clone(baseline.template);
  scene.name = pack.name;
  for (const key of ['start', 'exit', 'camera', 'enemies']) scene[key] = clone(pack[key]);
  if (pack.version === 2) scene.enemies = pack.enemies.map(enemy => ({
    ...Object.fromEntries(ENEMY_KEYS.map(key => [key, clone(enemy[key])])), _fdgInstanceId: enemy.instanceId
  }));
  template.mw = pack.map.mw; template.mh = pack.map.mh; template.tileRLE = clone(pack.map.tileRLE);
  template.objs = pack.objects.map(object => {
    const nativeObject = Object.fromEntries(SOURCE_OBJECT_KEYS.map(key => [key, clone(object[key])]));
    nativeObject._fdgInstanceId = object.instanceId;
    return nativeObject;
  });
  const changedObjects = pack.objects.flatMap((object, i) => {
    const original = baseline.template.objs[i];
    return object.x === original.x && object.y === original.y ? [] : [{ instanceId: object.instanceId, id: object.id, from: { x: original.x, y: original.y }, to: { x: object.x, y: object.y } }];
  });
  const receipt = { id: pack.id, source: 'fragment', bytes, objects: pack.objects.length, changedObjects, dependencies: clone(pack.dependencies) };
  if (pack.version === 2) {
    receipt.version = 2; receipt.enemies = pack.enemies.length;
    receipt.changedEnemies = pack.enemies.flatMap((enemy, i) => {
      const original = baseline.scene.enemies[i];
      return enemy.x === original.x && enemy.y === original.y ? [] : [{
        instanceId: enemy.instanceId, etype: enemy.etype, skin: enemy.skin,
        from: { x: original.x, y: original.y }, to: { x: enemy.x, y: enemy.y },
        world: { x: (enemy.x + .5) * pack.map.tileSize, y: (enemy.y + .5) * pack.map.tileSize }
      }];
    });
  }
  return { pack: clone(pack), scene, template, receipt };
}

export function serializeNativeMapPack(pack, baseline) {
  return json(requireValid(pack, baseline).pack);
}

export function encodeNativeMapPackFragment(pack, baseline) {
  return PREFIX + encodeURIComponent(serializeNativeMapPack(pack, baseline));
}

// JSON.parse discards duplicate keys; reject them before accepting a decoded pack.
function rejectDuplicateKeys(text, label = 'fragment') {
  const stack = [];
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '{') stack.push(new Set());
    else if (char === '[') stack.push(null);
    else if (char === '}' || char === ']') stack.pop();
    else if (char === '"') {
      const start = i++;
      for (; i < text.length; i++) {
        if (text[i] === '\\') i++;
        else if (text[i] === '"') break;
      }
      let next = i + 1;
      while (/\s/u.test(text[next] ?? '') && next < text.length) next++;
      if (text[next] === ':') {
        const key = JSON.parse(text.slice(start, i + 1)), keys = stack.at(-1);
        if (keys.has(key)) throw new TypeError(`Invalid native map ${label}: duplicate JSON key ${key}`);
        keys.add(key);
      }
    }
  }
}

function parseMapPackText(text, baseline, label, allowFormattingWhitespace) {
  if (typeof text !== 'string') throw new TypeError(`Invalid native map ${label}: expected JSON text`);
  const bytes = utf8.encode(text).byteLength;
  if (bytes > MAX_MAP_PACK_BYTES) throw new TypeError(`Invalid native map ${label}: UTF-8 bytes ${bytes} exceed ${MAX_MAP_PACK_BYTES}`);
  if ((allowFormattingWhitespace ? JSON_TEXT_CONTROL : CONTROL).test(text) || !wellFormed(text)) throw new TypeError(`Invalid native map ${label}: control characters or malformed Unicode are forbidden`);
  let pack;
  try { pack = JSON.parse(text); } catch { throw new TypeError(`Invalid native map ${label}: malformed JSON`); }
  rejectDuplicateKeys(text, label);
  return compileNativeMapPack(pack, baseline);
}

export function parseNativeMapPackJson(text, baseline) {
  if (typeof text !== 'string' || text.length > MAX_MAP_PACK_BYTES) throw new TypeError('Invalid native map JSON: expected bounded JSON text');
  return parseMapPackText(text, baseline, 'JSON', true);
}

export function decodeNativeMapPackFragment(hash, baseline) {
  if (hash === '') {
    const compiled = compileNativeMapPack(createNativeMapPack(baseline), baseline);
    compiled.receipt.source = 'baseline';
    return compiled;
  }
  if (typeof hash !== 'string' || !hash.startsWith(PREFIX) || hash.length > PREFIX.length + MAX_MAP_PACK_BYTES * 3 || CONTROL.test(hash) || !wellFormed(hash)) throw new TypeError('Invalid native map fragment: expected a bounded #fdg-pack= fragment');
  let text;
  try { text = decodeURIComponent(hash.slice(PREFIX.length)); } catch { throw new TypeError('Invalid native map fragment: malformed URI/UTF-8 encoding'); }
  const compiled = parseMapPackText(text, baseline, 'fragment', false);
  compiled.receipt.source = 'fragment';
  return compiled;
}
