import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_MAP_PACK_BYTES, createNativeMapPack, createNativeEncounterMapPack, validateNativeMapPack,
  compileNativeMapPack, serializeNativeMapPack, encodeNativeMapPackFragment, decodeNativeMapPackFragment,
  parseNativeMapPackJson
} from '../engine/fdg/native-map-pack.js';
import { RUINED_FOREST_SCENE, createRuinedForestTemplate } from '../engine/fdg/ruined-forest-scene.js';

const baseline = () => ({ scene: structuredClone(RUINED_FOREST_SCENE), template: createRuinedForestTemplate() });
const ids = ['enemy-001', 'enemy-002', 'enemy-003', 'enemy-004'];
function reject(pack, base, label) {
  const result = validateNativeMapPack(pack, base);
  assert.equal(result.ok, false, label); assert.ok(result.errors.length, label);
  assert.throws(() => compileNativeMapPack(pack, base), /Invalid native map pack/, label);
  assert.throws(() => createNativeEncounterMapPack(base, pack), /Invalid native map pack/, label);
}
function floorCells(base) {
  const cells = [];
  for (let i = 0; i < base.template.tileRLE.length; i += 2) cells.push(...Array(base.template.tileRLE[i + 1]).fill(base.template.tileRLE[i]));
  return cells;
}

test('encounter: v1 compatibility and v2 promotion preserve source props/dependencies and copy authored enemy slots without aliasing', () => {
  const base = baseline(), savedBase = structuredClone(base), v1 = createNativeMapPack(base);
  v1.objects[34].x = 44; v1.name = '폐허 숲길 · 배치본';
  const savedV1 = structuredClone(v1), promoted = createNativeEncounterMapPack(base, v1), fresh = createNativeEncounterMapPack(base);
  assert.equal(v1.version, 1); assert.equal(promoted.version, 2);
  assert.deepEqual(promoted.enemies.map(enemy => enemy.instanceId), ids);
  assert.deepEqual(promoted.enemies.map(({ instanceId, ...enemy }) => enemy), base.scene.enemies);
  for (const key of ['id', 'name', 'baseSceneId', 'map', 'start', 'exit', 'camera', 'objects', 'dependencies']) assert.deepEqual(promoted[key], v1[key]);
  assert.deepEqual(validateNativeMapPack(promoted, base), { ok: true, errors: [] });
  assert.equal(fresh.objects[34].x, 43); assert.deepEqual(compileNativeMapPack(fresh, base).receipt.changedEnemies, []);
  fresh.enemies[0].x = 34; fresh.enemies[0].y = 62;
  assert.deepEqual(compileNativeMapPack(fresh, base).receipt.changedEnemies[0].world, { x: 1380, y: 2500 });
  const nativeV1 = compileNativeMapPack(v1, base);
  assert.deepEqual(nativeV1.scene.enemies, base.scene.enemies);
  assert.deepEqual(Object.keys(nativeV1.receipt), ['id', 'source', 'bytes', 'objects', 'changedObjects', 'dependencies']);
  const invalidV1 = structuredClone(v1); invalidV1.enemies[0].x += .25; reject(invalidV1, base, 'v1 initial placement stays protected');
  const copiedV2 = createNativeEncounterMapPack(base, promoted);
  copiedV2.enemies[0].x = 32; copiedV2.objects[34].x = 45; copiedV2.dependencies[0].id = 'changed';
  assert.deepEqual(promoted.objects, v1.objects); assert.equal(promoted.enemies[0].x, 31);
  assert.deepEqual(v1, savedV1); assert.deepEqual(base, savedBase);
});

test('encounter: quarter placements compile to independent native bindings and exact factory-world receipts through JSON and fragment roundtrip', t => {
  const base = baseline(), savedBase = structuredClone(base), pack = createNativeEncounterMapPack(base);
  pack.name = '폐허 숲길 · 교전 배치 😀'; pack.objects[34].x = 44;
  pack.enemies[0].x = 31.25; pack.enemies[0].y = 55.5;
  pack.enemies[2].x = 30.5; pack.enemies[2].y = 43.25;
  const savedPack = structuredClone(pack), result = compileNativeMapPack(pack, base);
  assert.deepEqual(result.scene.enemies, pack.enemies.map(({ instanceId, ...enemy }) => ({ ...enemy, _fdgInstanceId: instanceId })));
  assert.ok(result.scene.enemies.every(enemy => !Object.hasOwn(enemy, 'instanceId')));
  assert.equal(result.receipt.version, 2); assert.equal(result.receipt.enemies, 4); assert.equal(result.receipt.objects, 38);
  assert.deepEqual(result.receipt.changedEnemies, [
    { instanceId: 'enemy-001', etype: 0, skin: 'rot_knight', from: { x: 31, y: 55 }, to: { x: 31.25, y: 55.5 }, world: { x: 1270, y: 2240 } },
    { instanceId: 'enemy-003', etype: 1, skin: 'bone_archer', from: { x: 30, y: 43 }, to: { x: 30.5, y: 43.25 }, world: { x: 1240, y: 1750 } }
  ]);
  assert.equal(result.receipt.dependencies.length, 23); assert.deepEqual(result.receipt.dependencies, pack.dependencies);
  assert.equal(result.receipt.bytes, Buffer.byteLength(serializeNativeMapPack(pack, base), 'utf8'));
  assert.equal(result.template.objs[34]._fdgInstanceId, 'prop-035'); assert.equal(result.template.objs[34].x, 44);
  for (const key of ['start', 'exit', 'camera', 'regions']) assert.deepEqual(result.scene[key], base.scene[key]);
  assert.deepEqual(result.template.tileRLE, base.template.tileRLE);
  assert.deepEqual(decodeNativeMapPackFragment(encodeNativeMapPackFragment(pack, base), base), result);
  assert.deepEqual(parseNativeMapPackJson(JSON.stringify(pack, null, 2), base), result);
  t.diagnostic(JSON.stringify({ version: result.receipt.version, bytes: result.receipt.bytes, enemies: 4, objects: 38,
    dependencies: 23, changedEnemies: result.receipt.changedEnemies }));
  result.pack.enemies[0].x = 10; result.scene.enemies[0].y = 10; result.receipt.changedEnemies[0].world.x = 10;
  result.receipt.changedEnemies[0].to.y = 10; result.receipt.dependencies[0].id = 'mutated'; result.template.objs[34].x = 10;
  assert.equal(result.scene.enemies[0].x, 31.25); assert.equal(result.pack.enemies[0].y, 55.5);
  assert.deepEqual(pack, savedPack); assert.deepEqual(base, savedBase);
  assert.equal(result.pack.dependencies[0].id, savedPack.dependencies[0].id);
});

test('encounter: floor validation follows the actual half-tile factory foot and existing canMv 10px corners across floor/wall boundaries', () => {
  const base = baseline(), cells = floorCells(base), width = 72;
  const floorToWall = cells.findIndex((cell, index) => cell === 1 && index % width < width - 1 && cells[index + 1] === 2);
  const wallToFloor = cells.findIndex((cell, index) => cell === 2 && index % width < width - 1 && cells[index + 1] === 1);
  assert.ok(floorToWall >= 0 && wallToFloor >= 0);
  const pack = createNativeEncounterMapPack(base);
  pack.enemies[0].x = floorToWall % width + .75; pack.enemies[0].y = Math.floor(floorToWall / width);
  assert.equal(cells[Math.floor(pack.enemies[0].y) * width + Math.floor(pack.enemies[0].x)], 1);
  assert.match(validateNativeMapPack(pack, base).errors.join('; '), /factory foot.*RLE floor 1/);
  reject(pack, base, 'authored input cell is floor but actual foot crosses into wall');
  pack.enemies[0].x = floorToWall % width + .25;
  assert.equal(cells[Math.floor(pack.enemies[0].y + .5) * width + Math.floor(pack.enemies[0].x + .5)], 1, 'foot center itself is floor');
  assert.match(validateNativeMapPack(pack, base).errors.join('; '), /canMv 10px corners.*RLE floor 1/);
  reject(pack, base, 'center floor but existing native 10px corner clearance enters a wall');
  pack.enemies[0].x = wallToFloor % width + .75; pack.enemies[0].y = Math.floor(wallToFloor / width);
  assert.equal(cells[Math.floor(pack.enemies[0].y) * width + Math.floor(pack.enemies[0].x)], 2);
  assert.equal(validateNativeMapPack(pack, base).ok, true, 'actual foot is floor even when the unshifted authored input cell is wall');
  for (const [axis, value] of [['x', -.25], ['x', 72], ['x', 71.75], ['y', 84], ['y', 83.75], ['x', .1],
    ['x', '31.25'], ['y', null], ['x', NaN], ['y', Infinity], ['x', undefined]]) {
    const invalid = createNativeEncounterMapPack(base); invalid.enemies[0][axis] = value; reject(invalid, base, `${axis} invalid coordinate`);
  }
  const wall = createNativeEncounterMapPack(base); wall.enemies[0].x = 0; wall.enemies[0].y = 0; reject(wall, base, 'RLE nonfloor');
});

test('encounter: authored enemy count/order/ids/types/skins stay exact and runtime/source fields and unsupported versions fail closed', () => {
  const base = baseline(), edits = [
    pack => { pack.enemies.pop(); }, pack => { pack.enemies.push(structuredClone(pack.enemies[0])); },
    pack => { pack.enemies.reverse(); }, pack => { pack.enemies[0].instanceId = 'enemy-999'; },
    pack => { pack.enemies[1].instanceId = pack.enemies[0].instanceId; }, pack => { delete pack.enemies[0].instanceId; },
    pack => { pack.enemies[0].etype = 1; }, pack => { pack.enemies[0].etype = '0'; },
    pack => { pack.enemies[0].skin = 'https://example.invalid/skin.png'; }, pack => { pack.enemies[0].skin = 'skull_brute'; },
    ...['src', 'url', 'assetURL', 'hp', 'dmg', 'ai', 'code', 'hook'].map(key => pack => { pack.enemies[0][key] = 'forbidden'; }),
    ...[0, 3, '2', 1].map(version => pack => { pack.version = version; })
  ];
  for (const [i, edit] of edits.entries()) { const pack = createNativeEncounterMapPack(base); edit(pack); reject(pack, base, `protected enemy edit ${i}`); }
});

test('encounter: v2 placement permission keeps geometry/start/exit/camera, all 38 prop sources and exact 23 dependencies protected', () => {
  const base = baseline(), edits = [
    pack => { pack.map.tileRLE[0] = 1; }, pack => { pack.map.mw = 73; }, pack => { pack.map.tileSize = 20; },
    pack => { pack.map.nav = []; }, pack => { pack.start.x++; }, pack => { pack.exit.y++; }, pack => { pack.camera.zoom = 1; },
    pack => { pack.objects[0].id = 'm_c1tree'; }, pack => { pack.objects[0].scale = 5; }, pack => { pack.objects[0].noCol = 0; },
    pack => { pack.objects[0].fdgUpright = false; }, pack => { pack.objects.pop(); }, pack => { pack.objects[0].instanceId = 'prop-999'; },
    pack => { pack.dependencies.pop(); }, pack => { pack.dependencies.push(structuredClone(pack.dependencies[0])); },
    pack => { pack.dependencies[0].url = 'https://example.invalid'; }, pack => { pack.dependencies[0].id = 'missing'; },
    pack => { pack.dependencies.reverse(); }, pack => { pack.runtime = { hp: 999 }; }
  ];
  for (const [i, edit] of edits.entries()) { const pack = createNativeEncounterMapPack(base); edit(pack); reject(pack, base, `protected world edit ${i}`); }
});

test('encounter: descriptor inspection rejects getters/hooks/prototypes/cycles without invoking hostile coercion', () => {
  const base = baseline(); let invoked = 0;
  const edits = [
    pack => { Object.defineProperty(pack.enemies[0], 'x', { enumerable: true, get() { invoked++; return 31; } }); },
    pack => { pack.enemies[0].toJSON = () => { invoked++; return {}; }; },
    pack => { pack.enemies[0].x = { [Symbol.toPrimitive]() { invoked++; return 31; } }; },
    pack => { Object.setPrototypeOf(pack.enemies[0], { x: 31 }); },
    pack => { pack.enemies[0].x = pack; }, pack => { delete pack.enemies[0]; },
    pack => { Object.defineProperty(pack.enemies[0], 'hidden', { value: 1 }); }
  ];
  for (const [i, edit] of edits.entries()) { const pack = createNativeEncounterMapPack(base); edit(pack); reject(pack, base, `hostile input ${i}`); }
  assert.equal(invoked, 0);
});

test('encounter: editor and fragment parsing share duplicate-key protection while editor formatting and decoded-string controls remain distinct', () => {
  const base = baseline(), pack = createNativeEncounterMapPack(base), text = serializeNativeMapPack(pack, base);
  for (const duplicate of [text.replace('"version":2', '"version":2,"version":2'),
    text.replace('"version":2', '"version":2,"\\u0076ersion":2'), text.replace('"mw":72', '"mw":72,"mw":72'),
    text.replace('"x":31', '"x":31,"\\u0078":31')]) {
    assert.throws(() => parseNativeMapPackJson(duplicate, base), /duplicate JSON key/);
    assert.throws(() => decodeNativeMapPackFragment('#fdg-pack=' + encodeURIComponent(duplicate), base), /duplicate JSON key/);
  }
  const pretty = '\n\t' + JSON.stringify(pack, null, 2) + '\r\n';
  assert.deepEqual(parseNativeMapPackJson(pretty, base).pack, pack);
  assert.throws(() => decodeNativeMapPackFragment('#fdg-pack=' + encodeURIComponent(pretty), base), /control characters/);
  for (const value of ['', '{bad', 'null', '[]', '{}', '\u0000', '\ud800', undefined, 0, { text }]) assert.throws(() => parseNativeMapPackJson(value, base), /Invalid native map/);
  const badName = structuredClone(pack); badName.name = 'bad\nname';
  assert.throws(() => parseNativeMapPackJson(JSON.stringify(badName), base), /control characters/);
  const polluted = text.replace('"version":2', '"version":2,"__proto__":{"polluted":true}');
  assert.throws(() => parseNativeMapPackJson(polluted, base), /forbidden JSON key/); assert.equal({}.polluted, undefined);
});

test('encounter: UTF8 caps cover raw JSON and normalized v2 data; empty fragment remains v1 and malformed explicit fragments cannot replace authored placements', () => {
  const base = baseline(), pack = createNativeEncounterMapPack(base);
  assert.equal(MAX_MAP_PACK_BYTES, 32768);
  const initial = serializeNativeMapPack(pack, base), overhead = Buffer.byteLength(initial) - Buffer.byteLength(pack.name);
  pack.name = '가'.repeat(Math.floor((MAX_MAP_PACK_BYTES - overhead) / 3));
  const compact = serializeNativeMapPack(pack, base), bytes = Buffer.byteLength(compact);
  assert.ok(bytes <= 32768 && bytes >= 32766);
  assert.deepEqual(parseNativeMapPackJson(compact, base).pack, pack);
  assert.deepEqual(decodeNativeMapPackFragment(encodeNativeMapPackFragment(pack, base), base).pack, pack);
  assert.throws(() => parseNativeMapPackJson(' '.repeat(32768 - bytes + 1) + compact, base), /UTF-8 bytes.*exceed 32768|bounded/);
  pack.name += '가'; reject(pack, base, 'v2 Korean UTF8 cap');
  assert.throws(() => parseNativeMapPackJson(JSON.stringify(pack), base), /UTF-8 bytes.*exceed 32768/);
  assert.throws(() => decodeNativeMapPackFragment('#fdg-pack=' + encodeURIComponent(JSON.stringify(pack)), base), /UTF-8 bytes.*exceed 32768/);
  const defaultBundle = decodeNativeMapPackFragment('', base);
  assert.equal(defaultBundle.pack.version, 1); assert.equal(defaultBundle.receipt.source, 'baseline');
  assert.equal(Object.hasOwn(defaultBundle.receipt, 'changedEnemies'), false);
  assert.deepEqual(defaultBundle.scene.enemies, base.scene.enemies);
  for (const fragment of ['#fdg-pack=', '#fdg-pack=%', '#fdg-pack=%C0%AF', '#fdg-pack=%ED%A0%80', '#other=1']) assert.throws(() => decodeNativeMapPackFragment(fragment, base), /Invalid native map/);
});
