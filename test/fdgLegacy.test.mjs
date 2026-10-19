import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { decodeTileRLE, encodeTileRLE, importFixedMap, exportFixedMap } from '../engine/fdg/legacy.js';
import { createDefaultProject } from '../engine/fdg/catalog.js';
import { SOURCE_MAP } from '../engine/fdg/source-map.js';
import { validateProject } from '../engine/fdg/project.js';
import { captureSourceMap } from '../tools/fdg-catalog.mjs';

const template = () => ({
  mw: 200, mh: 200, tileRLE: [1, 40000],
  rooms: [{ id: 's', type: 'start', cx: 100.8, cy: 185.9, rx: 14, ry: 6 }, { id: 'b', type: 'boss', cx: 100, cy: 18, lore: 'preserve' }],
  corridors: [{ from: 's', to: 'b', width: 10 }],
  spawnHoles: [{ x: 70, y: 170, type: 'M' }],
  objs: [{ id: 'player_start', x: 100, y: 190, scale: 1.2 }],
  authoredUnknown: { label: 'keep me', values: [3, 7, 11] },
});

test('RLE covers the full 200×200 map and preserves all editor tile types', () => {
  const tiles = decodeTileRLE([0, 10000, 1, 10000, 2, 10000, 3, 10000]);
  assert.equal(tiles.length, 40000);
  assert.deepEqual([tiles[0], tiles[10000], tiles[20000], tiles[30000]], [0, 1, 2, 3]);
  assert.deepEqual(encodeTileRLE(tiles), [0, 10000, 1, 10000, 2, 10000, 3, 10000]);
  assert.deepEqual(decodeTileRLE(encodeTileRLE(Uint8Array.from(tiles))), tiles);
});

test('RLE rejects zero-length, incomplete, oversized and malformed input', () => {
  for (const rle of [[], [1], [1, 0], [1, -1], [1, 1.5], [1, 39999], [1, 40001], [4, 40000], [1, Number.MAX_SAFE_INTEGER + 1], [1, 20000, 1, 20001], ['1', 40000]]) assert.throws(() => decodeTileRLE(rle));
  for (const tiles of [[], [4], [NaN], [1.5]]) assert.throws(() => encodeTileRLE(tiles));
  assert.throws(() => decodeTileRLE([1, 1], 0, 200));
  assert.throws(() => decodeTileRLE([1, 1], 1001, 1001));
});

test('FIXED_MAP roundtrip retains unknown source keys and does not mutate either input', () => {
  const source = template(), before = structuredClone(source);
  const map = importFixedMap(source, { id: 'roundtrip', name: '원본 보존' });
  assert.deepEqual(map.start, { x: 100, y: 185 });
  assert.deepEqual(map.exit, { x: 100, y: 18 });
  assert.equal(map.tileSize, 40);
  assert.deepEqual(map.objects, []);
  map.start = { x: 98, y: 184 }; map.exit = { x: 102, y: 7 }; map.tiles[0] = 2;
  const mapBefore = structuredClone(map);
  const exported = exportFixedMap(map);
  assert.deepEqual(exported.authoredUnknown, before.authoredUnknown);
  assert.deepEqual(exported.spawnHoles, before.spawnHoles);
  assert.deepEqual(exported.corridors, before.corridors);
  assert.equal(exported.rooms[1].lore, 'preserve');
  assert.deepEqual(exported.rooms.map(r => [r.cx, r.cy]), [[98, 184], [102, 7]]);
  assert.deepEqual(exported.objs[0], { id: 'player_start', x: 98, y: 184, scale: 1.2 });
  assert.deepEqual(decodeTileRLE(exported.tileRLE), map.tiles);
  assert.deepEqual(source, before);
  assert.deepEqual(map, mapBefore);
});

test('FIXED_MAP adapters reject resizing, malformed markers and blocked endpoints', () => {
  assert.throws(() => importFixedMap({ ...template(), mw: 210 }));
  assert.throws(() => importFixedMap({ ...template(), rooms: [] }));
  const outside = template(); outside.rooms[0].cx = 200;
  assert.throws(() => importFixedMap(outside));
  const map = importFixedMap(template());
  assert.throws(() => exportFixedMap({ ...map, width: 201 }));
  assert.throws(() => exportFixedMap({ ...map, tileSize: 32 }));
  assert.throws(() => exportFixedMap({ ...map, tiles: [1] }));
  map.tiles[map.start.y * 200 + map.start.x] = 2;
  assert.throws(() => exportFixedMap(map));
});

test('FDG visual draft decorations and preview exit survive export and reimport without native object mutation', () => {
  const source = template();
  const nativeObjects = structuredClone(source.objs);
  const map = importFixedMap(source);
  map.exit = { x: 101, y: 7 };
  map.objects = [{ id: 'draft-root', name: '기존 뿌리 장식', x: 80, y: 140, src: 'assets/map/ch1/exposed_root.png', scale: 1.4, layer: 'world', collision: false }];
  const output = exportFixedMap(map);
  assert.deepEqual(output.fdgDraft.visualInstances, map.objects);
  assert.deepEqual(output.fdgDraft.previewExit, map.exit);
  assert.equal(output.fdgDraft.schemaVersion, 1);
  assert.equal(output.fdgDraft.gameplayApplied, false);
  assert.deepEqual(output.authoredUnknown, source.authoredUnknown);
  assert.deepEqual(source.objs, nativeObjects);
  assert.equal(output.objs.length, nativeObjects.length, 'FDG decorations must not become native MAP_OBJS');
  // FDG's stored endpoint is separate from an original/native boss center.
  output.rooms.find(room => room.type === 'boss').cy = 18;
  const restored = importFixedMap(output);
  assert.deepEqual(restored.objects, map.objects);
  assert.deepEqual(restored.exit, map.exit);
  const project = createDefaultProject(); project.map = restored;
  assert.equal(validateProject(project).ok, true);
  output.fdgDraft.visualInstances[0].name = 'changed after import';
  assert.equal(restored.objects[0].name, '기존 뿌리 장식', 'import must clone draft data');
  restored.objects[0].scale = 2;
  assert.equal(map.objects[0].scale, 1.4, 'export must clone draft data');
  assert.throws(() => importFixedMap({ ...source, fdgDraft: { previewExit: { x: 100, y: 200 } } }));
  assert.throws(() => exportFixedMap({ ...map, objects: {} }));
});

test('default map snapshot matches exact reviewed production geometry and has a south→north route', async () => {
  assert.deepEqual(await captureSourceMap(), SOURCE_MAP);
  const project = createDefaultProject();
  const validation = validateProject(project);
  assert.equal(validation.ok, true, validation.errors.join('\n'));
  assert.equal(validation.route.connected, true);
  assert.deepEqual(project.map.start, { x: 100, y: 185 });
  assert.deepEqual(project.map.exit, { x: 100, y: 7 });
  assert.ok(project.map.tiles.includes(0), 'canonical forest wall must not become all-floor');
  assert.ok(project.map.tiles.includes(1));
  const next = createDefaultProject(); project.map.tiles[0] = 3;
  assert.notEqual(next.map.tiles[0], 3, 'catalog projects must not share mutable arrays');
});

test('catalog references real directional PNGs and actual registerVFX sheet dimensions', async () => {
  const project = createDefaultProject();
  const sprites = project.characters.flatMap(ch => Object.values(ch.sprite.directions).map(src => ({ ...ch.sprite, src })));
  sprites.push(...project.vfx.map(vfx => vfx.sprite));
  for (const sprite of sprites) {
    const file = await fs.readFile(new URL(`../${sprite.src}`, import.meta.url));
    assert.equal(file.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', sprite.src);
    assert.equal(file.readUInt32BE(16), sprite.frameWidth * sprite.columns, sprite.src);
    assert.equal(file.readUInt32BE(20), sprite.frameHeight * sprite.rows, sprite.src);
  }
  for (const vfx of project.vfx) {
    assert.ok(vfx.life >= vfx.sprite.frames / vfx.sprite.fps, `${vfx.id}: preview must retain every source sheet frame`);
  }
  assert.ok(project.skills.every(skill => skill.id.startsWith('preview_')));
  assert.equal(project.provenance.gameplayApplied, false);
});
