import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_MAP_PACK_BYTES, createNativeMapPack, validateNativeMapPack, compileNativeMapPack,
  serializeNativeMapPack, encodeNativeMapPackFragment, decodeNativeMapPackFragment
} from '../engine/fdg/native-map-pack.js';
import { RUINED_FOREST_SCENE, createRuinedForestTemplate } from '../engine/fdg/ruined-forest-scene.js';

const baseline = () => ({ scene: structuredClone(RUINED_FOREST_SCENE), template: createRuinedForestTemplate() });
const jsonFragment = value => '#fdg-pack=' + encodeURIComponent(JSON.stringify(value));
function rejected(pack, base, label) {
  const result = validateNativeMapPack(pack, base);
  assert.equal(result.ok, false, label);
  assert.ok(result.errors.length, label);
  assert.throws(() => compileNativeMapPack(pack, base), /Invalid native map pack/, label);
  assert.throws(() => serializeNativeMapPack(pack, base), /Invalid native map pack/, label);
}

test('authored factory fixes all 38 instance slots and derives unique native dependencies', () => {
  const base = baseline(), original = structuredClone(base), pack = createNativeMapPack(base);
  assert.deepEqual(validateNativeMapPack(pack, base), { ok: true, errors: [] });
  assert.equal(pack.version, 1);
  assert.equal(pack.id, base.scene.id);
  assert.equal(pack.baseSceneId, base.scene.id);
  assert.equal(pack.objects.length, 38);
  assert.deepEqual(pack.objects.map(object => object.instanceId), Array.from({ length: 38 }, (_, i) => `prop-${String(i + 1).padStart(3, '0')}`));
  assert.deepEqual(pack.map, { mw: 72, mh: 84, tileSize: 40, tileRLE: base.template.tileRLE });
  const assets = [...new Set(base.template.objs.map(object => object.id))];
  const skins = [...new Set(base.scene.enemies.map(enemy => enemy.skin))];
  assert.deepEqual(pack.dependencies, [...assets.map(id => ({ kind: 'map-object', id })), ...skins.map(id => ({ kind: 'monster-skin', id }))]);
  assert.deepEqual(base, original);
  pack.map.tileRLE[0] = 99; pack.camera.pitch = 9; pack.objects[0].x = 9;
  assert.deepEqual(base, original);
});

test('Korean/emoji metadata and quarter-tile edit survive fragment roundtrip into actual native bindings', () => {
  const base = baseline(), pack = createNativeMapPack(base);
  pack.name = '폐허 숲길 · 편집본 😀'; pack.id = 'ruined-forest-edited';
  pack.objects[0].x += .25; pack.objects[0].y -= .5;
  const fragment = encodeNativeMapPackFragment(pack, base), compiled = decodeNativeMapPackFragment(fragment, base);
  assert.ok(fragment.startsWith('#fdg-pack=%7B'));
  assert.deepEqual(compiled.pack, pack);
  assert.equal(compiled.scene.name, pack.name);
  for (const key of ['start', 'exit', 'camera', 'enemies', 'regions']) assert.deepEqual(compiled.scene[key], base.scene[key]);
  assert.deepEqual(compiled.template.tileRLE, pack.map.tileRLE);
  assert.deepEqual(compiled.template.rooms, base.template.rooms);
  assert.equal(compiled.template.objs[0]._fdgInstanceId, 'prop-001');
  assert.equal(Object.hasOwn(compiled.template.objs[0], 'instanceId'), false);
  assert.equal(compiled.template.objs[0].x, pack.objects[0].x);
  assert.equal(compiled.template.objs[0].y, pack.objects[0].y);
  assert.deepEqual(compiled.receipt.changedObjects, [{ instanceId: 'prop-001', id: pack.objects[0].id, from: { x: base.template.objs[0].x, y: base.template.objs[0].y }, to: { x: pack.objects[0].x, y: pack.objects[0].y } }]);
  assert.equal(compiled.receipt.objects, 38);
  assert.equal(compiled.receipt.source, 'fragment');
  assert.equal(compiled.receipt.id, pack.id);
  assert.equal(compiled.receipt.bytes, Buffer.byteLength(serializeNativeMapPack(pack, base), 'utf8'));
});

test('compiled pack, native scene/template and receipt are independently cloned from input and each other', () => {
  const base = baseline(), saved = structuredClone(base), pack = createNativeMapPack(base);
  pack.objects[0].x += .25;
  const result = compileNativeMapPack(pack, base), savedPack = structuredClone(pack);
  result.pack.objects[0].x = 70;
  assert.equal(result.template.objs[0].x, savedPack.objects[0].x);
  assert.equal(result.receipt.changedObjects[0].to.x, savedPack.objects[0].x);
  result.template.objs[0].scale = 100; result.template.rooms[0].cx = 99;
  result.template.tileRLE[0] = 99; result.scene.camera.pitch = 99; result.scene.enemies[0].skin = 'changed';
  result.receipt.dependencies[0].id = 'changed'; result.receipt.changedObjects[0].from.x = 99;
  assert.equal(result.pack.dependencies[0].id, savedPack.dependencies[0].id);
  assert.equal(result.pack.camera.pitch, savedPack.camera.pitch);
  assert.equal(result.pack.enemies[0].skin, savedPack.enemies[0].skin);
  assert.equal(result.pack.map.tileRLE[0], savedPack.map.tileRLE[0]);
  assert.deepEqual(pack, savedPack);
  assert.deepEqual(base, saved);
});

test('runtime/combat/code injection and edits to geometry/navigation/camera/enemies fail closed', () => {
  const base = baseline();
  const edits = [
    pack => { pack.runtime = { hp: 999 }; }, pack => { pack.code = 'alert(1)'; }, pack => { pack.combat = { dmg: 999 }; },
    pack => { pack.map.collision = []; }, pack => { pack.map.rooms = []; }, pack => { pack.map.nav = 'free'; },
    pack => { pack.map.mw++; }, pack => { pack.map.mh++; }, pack => { pack.map.tileSize = 20; },
    pack => { pack.map.tileRLE[0] = 0; }, pack => { pack.map.tileRLE[1]++; },
    pack => { pack.start.x += .25; }, pack => { pack.exit.y += .25; }, pack => { pack.camera.zoom = 1; },
    pack => { pack.camera.fov = 60; }, pack => { pack.enemies[0].dmg = 99; }, pack => { pack.enemies[0].hp = 99; },
    pack => { pack.enemies[0].etype = 4; }, pack => { pack.enemies[0].skin = 'other_asset'; },
    pack => { pack.enemies[0].x++; }, pack => { pack.enemies.reverse(); }, pack => { pack.baseSceneId = 'other-scene'; },
    pack => { pack.version = 2; }, pack => { delete pack.exit; }
  ];
  edits.forEach((edit, i) => { const pack = createNativeMapPack(base); edit(pack); rejected(pack, base, `protected edit ${i}`); });
});

test('asset identity, source sizing/collision/upright fields and authored object slots stay protected', () => {
  const base = baseline();
  const edits = [
    pack => { pack.objects[0].id = 'https://example.test/asset.png'; }, pack => { pack.objects[0].id = pack.objects[1].id; },
    pack => { pack.objects[0].scale += .25; }, pack => { pack.objects[0].noCol = 0; }, pack => { pack.objects[0].fdgUpright = false; },
    pack => { pack.objects[0].src = '/new.png'; }, pack => { pack.objects[0].url = 'https://example.test'; },
    pack => { pack.objects[0].dmg = 1; }, pack => { pack.objects[0].instanceId = 'prop-999'; },
    pack => { pack.objects[1].instanceId = pack.objects[0].instanceId; }, pack => { pack.objects.reverse(); },
    pack => { pack.objects.pop(); }, pack => { pack.objects.push(structuredClone(pack.objects[0])); }
  ];
  edits.forEach((edit, i) => { const pack = createNativeMapPack(base); edit(pack); rejected(pack, base, `source edit ${i}`); });
});

test('placement accepts finite quarter tiles inside map bounds and rejects fractional/outside/non-JSON numbers', () => {
  const base = baseline(), pack = createNativeMapPack(base);
  for (const [x, y] of [[0, 0], [71.75, 83.75], [4.25, 69.5]]) {
    pack.objects[0].x = x; pack.objects[0].y = y;
    assert.equal(validateNativeMapPack(pack, base).ok, true, `${x}/${y}`);
  }
  for (const [axis, value] of [['x', -.25], ['x', 72], ['y', 84], ['x', .1], ['y', Infinity], ['x', NaN], ['x', undefined], ['y', '2.25']]) {
    const invalid = createNativeMapPack(base); invalid.objects[0][axis] = value;
    rejected(invalid, base, `${axis}=${String(value)}`);
  }
});

test('small bone placement enforces Euclidean five-tile spacing, including the exact boundary', () => {
  const base = baseline(), pack = createNativeMapPack(base), bones = pack.objects.filter(object => object.id === 'm_c1sbone');
  bones[0].x = 10; bones[0].y = 10; bones[1].x = 13; bones[1].y = 14;
  assert.equal(validateNativeMapPack(pack, base).ok, true, '3-4-5 spacing is accepted');
  bones[1].y = 13.75;
  assert.match(validateNativeMapPack(pack, base).errors.join('; '), /spacing must be at least 5/);
  rejected(pack, base, 'less than five tiles');
});

test('duplicate, missing, changed or URL-bearing dependency references are rejected', () => {
  const base = baseline();
  const edits = [
    pack => { pack.dependencies.pop(); }, pack => { pack.dependencies.push(structuredClone(pack.dependencies[0])); },
    pack => { pack.dependencies[1] = structuredClone(pack.dependencies[0]); }, pack => { pack.dependencies.reverse(); },
    pack => { pack.dependencies[0].id = 'missing_native_asset'; }, pack => { pack.dependencies[0].kind = 'script'; },
    pack => { pack.dependencies[0].src = '/asset.png'; }, pack => { pack.dependencies[0].url = 'https://example.test'; }
  ];
  edits.forEach((edit, i) => { const pack = createNativeMapPack(base); edit(pack); rejected(pack, base, `reference edit ${i}`); });
});

test('JSON accessors/hooks are rejected without invocation, alongside custom prototypes and cycles', () => {
  const base = baseline(); let invoked = 0;
  const getter = createNativeMapPack(base);
  Object.defineProperty(getter, 'name', { enumerable: true, get() { invoked++; return 'getter'; } });
  rejected(getter, base, 'getter');
  const hook = createNativeMapPack(base); hook.toJSON = () => { invoked++; return createNativeMapPack(base); };
  rejected(hook, base, 'toJSON hook');
  assert.equal(invoked, 0);
  const custom = createNativeMapPack(base); Object.setPrototypeOf(custom.objects[0], { source: 'runtime' });
  rejected(custom, base, 'custom prototype');
  const cycle = createNativeMapPack(base); cycle.objects[0].x = cycle;
  rejected(cycle, base, 'cycle');
  const sparse = createNativeMapPack(base); delete sparse.map.tileRLE[0];
  rejected(sparse, base, 'sparse array');
  const symbol = createNativeMapPack(base); symbol[Symbol('runtime')] = 1;
  rejected(symbol, base, 'symbol property');
  const hidden = createNativeMapPack(base); Object.defineProperty(hidden, 'runtime', { value: 1 });
  rejected(hidden, base, 'hidden field');
  const pollution = JSON.parse(serializeNativeMapPack(createNativeMapPack(base), base).replace('"version":1', '"version":1,"__proto__":{"polluted":true}'));
  rejected(pollution, base, 'prototype pollution key');
  assert.equal({}.polluted, undefined);
});

test('UTF-8 byte ceiling applies before serialization and fragment parsing rather than character count', () => {
  assert.equal(MAX_MAP_PACK_BYTES, 32768);
  const base = baseline(), pack = createNativeMapPack(base), initial = serializeNativeMapPack(pack, base);
  const prefixBytes = Buffer.byteLength(initial, 'utf8') - Buffer.byteLength(pack.name, 'utf8');
  pack.name = '가'.repeat(Math.floor((MAX_MAP_PACK_BYTES - prefixBytes) / 3));
  assert.equal(validateNativeMapPack(pack, base).ok, true);
  const nearLimit = serializeNativeMapPack(pack, base);
  assert.ok(Buffer.byteLength(nearLimit, 'utf8') <= MAX_MAP_PACK_BYTES);
  assert.deepEqual(decodeNativeMapPackFragment(encodeNativeMapPackFragment(pack, base), base).pack, pack);
  pack.name += '가';
  assert.ok(JSON.stringify(pack).length < MAX_MAP_PACK_BYTES);
  rejected(pack, base, 'Korean UTF-8 bytes exceed cap');
  assert.throws(() => decodeNativeMapPackFragment(jsonFragment(pack), base), /UTF-8 bytes .* exceed 32768/);
  assert.throws(() => decodeNativeMapPackFragment('#fdg-pack=' + 'x'.repeat(MAX_MAP_PACK_BYTES * 3 + 1), base), /bounded/);
});

test('malformed JSON, URI/UTF-8, controls, missing fields and duplicate JSON keys fail closed', () => {
  const base = baseline(), pack = createNativeMapPack(base);
  for (const hash of ['#other=1', '#fdg-pack=', '#fdg-pack=%', '#fdg-pack=%C0%AF', '#fdg-pack=%ED%A0%80', '#fdg-pack=%7Bbad', '#fdg-pack=null', '#fdg-pack=%00', null, undefined, 0]) {
    assert.throws(() => decodeNativeMapPackFragment(hash, base), /Invalid native map/, String(hash));
  }
  for (const name of ['name\u0000', 'name\r\n', 'name\u0085', '\ud800', '\udc00']) {
    pack.name = name;
    rejected(pack, base, 'control/malformed Unicode string');
    assert.throws(() => decodeNativeMapPackFragment(jsonFragment(pack), base), /Invalid native map/);
  }
  pack.name = '정상 이름';
  const duplicate = serializeNativeMapPack(pack, base).replace('"version":1', '"version":1,"version":1');
  assert.throws(() => decodeNativeMapPackFragment('#fdg-pack=' + encodeURIComponent(duplicate), base), /duplicate JSON key version/);
  const escapedDuplicate = serializeNativeMapPack(pack, base).replace('"version":1', '"version":1,"ver\\u0073ion":1');
  assert.throws(() => decodeNativeMapPackFragment('#fdg-pack=' + encodeURIComponent(escapedDuplicate), base), /duplicate JSON key version/);
  delete pack.camera;
  assert.throws(() => decodeNativeMapPackFragment(jsonFragment(pack), base), /camera/);
});

test('malformed reference/slot types report validation errors without coercion and encoded control text is rejected', () => {
  const base = baseline(), reference = createNativeMapPack(base);
  reference.dependencies[0].kind = { toString: 1 };
  assert.doesNotThrow(() => assert.equal(validateNativeMapPack(reference, base).ok, false));
  const slots = createNativeMapPack(base), bones = slots.objects.filter(object => object.id === 'm_c1sbone');
  bones[0].instanceId = { toString: 1 }; bones[1].x = bones[0].x; bones[1].y = bones[0].y;
  assert.doesNotThrow(() => assert.equal(validateNativeMapPack(slots, base).ok, false));
  const validText = serializeNativeMapPack(createNativeMapPack(base), base);
  assert.throws(() => decodeNativeMapPackFragment('#fdg-pack=%0A' + encodeURIComponent(validText), base), /control/);
});

test('empty fragment compiles baseline independently while an invalid explicit fragment never falls back', () => {
  const base = baseline(), saved = structuredClone(base), result = decodeNativeMapPackFragment('', base);
  assert.equal(result.receipt.source, 'baseline');
  assert.deepEqual(result.receipt.changedObjects, []);
  assert.equal(result.template.objs.length, 38);
  assert.deepEqual(result.pack, createNativeMapPack(base));
  result.template.objs[0].x = 99; result.scene.camera.zoom = 99;
  assert.deepEqual(base, saved);
  const bad = createNativeMapPack(base); bad.enemies[0].hp = 999;
  assert.throws(() => decodeNativeMapPackFragment(jsonFragment(bad), base), /unsupported field/);
  assert.deepEqual(base, saved);
  assert.deepEqual(decodeNativeMapPackFragment('', base).pack, createNativeMapPack(base));
});
