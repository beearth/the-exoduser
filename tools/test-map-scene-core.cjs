'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const sandbox = vm.createContext({ module: { exports: {} } });
vm.runInContext(fs.readFileSync(path.join(__dirname, 'map-scene-core.js'), 'utf8'), sandbox, { filename: 'map-scene-core.js' });
const K = sandbox.module.exports;
const plain = value => JSON.parse(JSON.stringify(value));
const frame = h => JSON.stringify({ project: h.project, undo: h.undoStack, redo: h.redoStack, pending: h.pending });

function scene() {
  return {
    format: 'exoduser-map-scene', version: 1, name: 'Transaction fixture',
    world: { cols: 10, rows: 10, tileSize: 40 },
    assets: [{ id: 'root', name: 'Root', src: 'assets/map/root.png', width: 100, height: 100, crop: { x: 0, y: 0, w: 100, h: 100 } }],
    layers: [
      { id: 'back', name: 'Back', visible: true, locked: false, sort: 'flat', parallax: .2, objects: [] },
      { id: 'ground', name: 'Ground', visible: true, locked: false, sort: 'foot', parallax: 1, objects: [{ id: 'root-1', assetId: 'root', name: 'Root 1', x: 100, y: 100, width: 100, height: 100, pivotX: .5, pivotY: 1, rotation: 0, opacity: 1, flipX: false }] },
      { id: 'front', name: 'Front', visible: true, locked: false, sort: 'flat', parallax: 1, objects: [] }
    ],
    walkable: Array(100).fill(1), start: { x: 20, y: 380 }, exit: { x: 380, y: 20 },
    cameras: [{ id: 'start-camera', name: 'Start', x: 20, y: 380 }]
  };
}
const object = p => p.layers[1].objects[0];

test('malformed import preserves project, undo, redo and an active first-input transaction', () => {
  const h = new K.History(scene());
  h.change(p => { object(p).opacity = .7; });
  h.change(p => { object(p).opacity = .4; });
  h.undo();
  h.begin(); object(h.project).width = 120;
  const before = frame(h), identity = h.project;
  const mutations = [
    p => { delete p.layers; }, p => { delete p.start; }, p => { p.walkable.pop(); },
    p => { p.assets[0].src = '../../outside.png'; }, p => { object(p).width = 0; }
  ];
  for (const mutate of mutations) {
    const invalid = scene(); mutate(invalid);
    assert.throws(() => h.import(invalid));
    assert.equal(frame(h), before);
    assert.equal(h.project, identity);
  }
});

test('valid import is one reversible edit and does not retain caller references', () => {
  const h = new K.History(scene()), original = plain(h.project), incoming = scene();
  incoming.name = 'Imported'; incoming.layers.reverse(); incoming.start.x = 60;
  h.import(incoming);
  const imported = plain(h.project);
  incoming.name = 'Mutated by caller'; incoming.walkable[0] = 0;
  assert.deepEqual(plain(h.project), imported);
  assert.equal(h.undoStack.length, 1);
  assert.equal(h.undo(), true); assert.deepEqual(plain(h.project), original);
  assert.equal(h.redo(), true); assert.deepEqual(plain(h.project), imported);
});

test('invalid property edit rolls back without discarding a previous redo branch', () => {
  const h = new K.History(scene()); h.change(p => { object(p).width = 120; }); h.undo();
  const before = frame(h);
  assert.throws(() => h.change(p => { object(p).width = -5; }));
  assert.equal(frame(h), before);
  assert.equal(h.redo(), true); assert.equal(object(h.project).width, 120);
});

test('the first slider input and repeated input events form a single undo transaction', () => {
  const h = new K.History(scene());
  h.begin(); object(h.project).opacity = .8;
  h.begin(); object(h.project).opacity = .35;
  assert.equal(h.end(), true); assert.equal(h.undoStack.length, 1);
  assert.equal(h.undo(), true); assert.equal(object(h.project).opacity, 1);
  assert.equal(h.redo(), true); assert.equal(object(h.project).opacity, .35);
});

test('layer order, visibility and parallax all survive undo and redo', () => {
  const h = new K.History(scene()), original = plain(h.project.layers);
  h.change(p => { p.layers.reverse(); p.layers[0].visible = false; p.layers[2].parallax = .6; });
  const reordered = plain(h.project.layers);
  assert.deepEqual(reordered.map(l => l.id), ['front', 'ground', 'back']);
  h.undo(); assert.deepEqual(plain(h.project.layers), original);
  h.redo(); assert.deepEqual(plain(h.project.layers), reordered);
});

test('a collision brush stroke can break a route and undo restores the complete grid', () => {
  const h = new K.History(scene()), before = plain(h.project.walkable);
  assert.equal(K.route(h.project).pass, true);
  h.begin();
  for (let x = 0; x < 10; x++) h.project.walkable[5 * 10 + x] = 0;
  h.end();
  assert.equal(K.route(h.project).pass, false);
  h.undo(); assert.deepEqual(plain(h.project.walkable), before); assert.equal(K.route(h.project).pass, true);
  h.redo(); assert.equal(K.route(h.project).pass, false);
});

test('undo commits the pending edit before reversal, and a new branch clears redo', () => {
  const h = new K.History(scene());
  h.begin(); object(h.project).x = 220;
  assert.equal(h.undo(), true); assert.equal(object(h.project).x, 100);
  assert.equal(h.redoStack.length, 1);
  h.change(p => { object(p).x = 180; });
  assert.equal(h.redo(), false); assert.equal(object(h.project).x, 180);
});

test('a no-op transaction leaves existing redo usable', () => {
  const h = new K.History(scene()); h.change(p => { object(p).y = 150; }); h.undo();
  const before = frame(h);
  assert.equal(h.change(() => {}), false); assert.equal(frame(h), before);
  assert.equal(h.redo(), true); assert.equal(object(h.project).y, 150);
});

test('history keeps the last forty real edits without losing their redo order', () => {
  const h = new K.History(scene());
  for (let i = 1; i <= 45; i++) h.change(p => { object(p).x = 100 + i; });
  assert.equal(h.undoStack.length, 40);
  for (let i = 0; i < 40; i++) assert.equal(h.undo(), true);
  assert.equal(object(h.project).x, 105); assert.equal(h.undo(), false);
  for (let i = 0; i < 40; i++) assert.equal(h.redo(), true);
  assert.equal(object(h.project).x, 145); assert.equal(h.redo(), false);
});

test('large imported image strings trim history at the serialized 64MB budget while retaining undo', () => {
  const p = scene(); p.assets[0].src = 'data:image/png;base64,' + 'A'.repeat(8000000);
  const h = new K.History(p);
  for (let i = 1; i <= 9; i++) h.change(next => { object(next).x = 100 + i; });
  const size = h.undoStack.reduce((n, snapshot) => n + JSON.stringify(snapshot).length, 0);
  assert.ok(size <= 64000000, 'large assets must not multiply beyond the history budget');
  assert.ok(h.undoStack.length > 0 && h.undoStack.length < 9);
  assert.equal(h.undo(), true); assert.equal(object(h.project).x, 108);
  assert.equal(h.redo(), true); assert.equal(object(h.project).x, 109);
});

test('RLE round trips preserve row boundaries and normalize adjacent identical runs', () => {
  const grid = Array.from({ length: 100 }, (_, i) => i % 10 >= 3 && i % 10 <= 6 ? 1 : 0);
  assert.deepEqual(Array.from(K.decode(K.encode(grid), grid.length)), grid);
  const redundant = K.decode([0, 20, 0, 30, 1, 50], 100);
  assert.deepEqual(Array.from(K.encode(redundant)), [0, 50, 1, 50]);
});

test('RLE rejects malformed runs and both shorter and longer decoded grids', () => {
  for (const rle of [null, [0], [2, 100], [0, 0], [0, -1], [0, .5], [0, Infinity], [0, 99], [0, 101], [0, 50, 1, 49], []]) {
    assert.throws(() => K.decode(rle, 100), undefined, 'RLE ' + JSON.stringify(rle));
  }
});

test('the real Hell Rift navigation snapshot has the canonical hash and a south-to-north route', () => {
  const ctx = vm.createContext({ window: {} });
  vm.runInContext(fs.readFileSync(path.join(root, 'assets/map/hell_rift/interspace_20261005/layout.js'), 'utf8'), ctx);
  const raw = ctx.window.HELL_RIFT_INTERSPACE.variants.interspace, p = scene();
  p.world = { cols: raw.w, rows: raw.h, tileSize: raw.T };
  p.walkable = K.decode(raw.tileRLE, raw.w * raw.h);
  p.start = { x: (raw.start.x + .5) * raw.T, y: (raw.start.y + .5) * raw.T };
  p.exit = { x: (raw.exit.x + .5) * raw.T, y: (raw.exit.y + .5) * raw.T };
  assert.equal(p.walkable.length, 40000);
  assert.equal(p.walkable.reduce((n, v) => n + v, 0), 4107);
  assert.equal(crypto.createHash('sha256').update(Buffer.from(p.walkable)).digest('hex'), '52bd839614a9d1adad767d472357438c1d58a338ac52639705e9b8ad20a3bbdb');
  assert.deepEqual(p.start, { x: 4020, y: 7740 }); assert.deepEqual(p.exit, { x: 4020, y: 1740 });
  assert.equal(K.route(K.validate(p)).pass, true);
  assert.equal(K.canWalk(p, (102 + .5) * 40, (102 + .5) * 40), false, 'central chasm stays non-walkable');
  assert.deepEqual(Array.from(K.decode(K.encode(p.walkable), 40000)), Array.from(p.walkable));
});

test('blocked endpoints fail without searching, and a complete barrier remains disconnected', () => {
  const p = scene(); p.walkable[90] = 0;
  assert.equal(K.route(p).pass, false); assert.equal(K.route(p).visited, 0);
  p.walkable[90] = 1; p.walkable[9] = 0;
  assert.equal(K.route(p).pass, false); assert.equal(K.route(p).visited, 0);
  p.walkable[9] = 1;
  for (let x = 0; x < 10; x++) p.walkable[5 * 10 + x] = 0;
  assert.equal(K.route(p).pass, false);
});

test('player clearance rejects a walkable center whose body corners touch a blocked tile or map edge', () => {
  const p = scene(); p.walkable[4 * 10 + 4] = 0;
  assert.equal(K.canWalk(p, 205, 180), false);
  assert.equal(K.canWalk(p, 221, 180), true);
  assert.equal(K.canWalk(p, 5, 100), false);
  assert.equal(K.canWalk(p, 395, 100), false);
});

test('noncentral pivot selection inverts ninety-degree rotation and horizontal flip correctly', () => {
  const o = { x: 1000, y: 2000, width: 200, height: 100, pivotX: .25, pivotY: .8, rotation: 90, flipX: true };
  const q = K.local(o, 1060, 2040);
  assert.ok(Math.abs(q.x - 10) < 1e-9); assert.ok(Math.abs(q.y - 20) < 1e-9);
  assert.equal(K.hit(o, 1060, 2040), true);
  assert.equal(K.hit(o, 1030, 1840), false);
  assert.deepEqual(plain(K.local(o, 1000, 2000)), { x: 50, y: 80 });
  o.flipX = false;
  const unflipped = K.local(o, 1060, 1960);
  assert.ok(Math.abs(unflipped.x - 10) < 1e-9); assert.ok(Math.abs(unflipped.y - 20) < 1e-9);
});

test('resizing a rotated flipped object follows the dragged corner and keeps the opposite corner fixed', () => {
  const o = { x: 1000, y: 2000, width: 200, height: 100, pivotX: .25, pivotY: .8, rotation: 90, flipX: true };
  const result = K.resize(o, 940, 1750, false);
  assert.deepEqual(plain(result), { width: 300, height: 140, x: 968, y: 1975 });
  const resized = { ...o, ...plain(result) };
  const fixed = K.local(resized, 1080, 2050), dragged = K.local(resized, 940, 1750);
  assert.ok(Math.abs(fixed.x) < 1e-9 && Math.abs(fixed.y) < 1e-9, 'original top-left stays fixed');
  assert.ok(Math.abs(dragged.x - 300) < 1e-9 && Math.abs(dragged.y - 140) < 1e-9, 'new bottom-right follows pointer');
  assert.equal(o.width, 200); assert.equal(o.x, 1000, 'resize helper does not mutate transaction origin');
});

test('aspect-locked resize preserves the image ratio and fixed corner after rotation and flip', () => {
  const o = { x: 1000, y: 2000, width: 200, height: 100, pivotX: .25, pivotY: .8, rotation: 90, flipX: true };
  const result = K.resize(o, 940, 1750, true);
  assert.deepEqual(plain(result), { width: 300, height: 150, x: 960, y: 1975 });
  assert.equal(result.width / result.height, 2);
  const fixed = K.local({ ...o, ...plain(result) }, 1080, 2050);
  assert.ok(Math.abs(fixed.x) < 1e-9 && Math.abs(fixed.y) < 1e-9);
});

test('resize snaps image-local dimensions instead of rotated world axes', () => {
  const o = { x: 1000, y: 2000, width: 200, height: 100, pivotX: .25, pivotY: .8, rotation: 90, flipX: true };
  assert.deepEqual(plain(K.resize(o, 943, 1744, false, 40)), { width: 320, height: 120, x: 984, y: 1970 });
});

test('resize bounds prevent negative or oversized objects, including aspect-locked extremes', () => {
  const o = { x: 0, y: 0, width: 200, height: 100, pivotX: 0, pivotY: 0, rotation: 0, flipX: false };
  const tiny = K.resize(o, -100, -100, false), large = K.resize(o, 40000, 50000, false), aspect = K.resize(o, 40000, 50000, true);
  assert.deepEqual(plain(tiny), { width: 1, height: 1, x: 0, y: 0 });
  assert.deepEqual(plain(large), { width: 32000, height: 32000, x: 0, y: 0 });
  assert.deepEqual(plain(aspect), { width: 32000, height: 16000, x: 0, y: 0 });
});

function worldPoint(o, u, v) {
  const theta = o.rotation * Math.PI / 180;
  const lx = (u - o.pivotX) * o.width * (o.flipX ? -1 : 1), ly = (v - o.pivotY) * o.height;
  return { x: o.x + lx * Math.cos(theta) - ly * Math.sin(theta), y: o.y + lx * Math.sin(theta) + ly * Math.cos(theta) };
}
function samePoint(actual, expected, message) {
  assert.ok(Math.abs(actual.x - expected.x) < 1e-9 && Math.abs(actual.y - expected.y) < 1e-9, message);
}

test('reanchor preserves all bitmap corners, source foot and mask vertices after arbitrary rotation and flip', () => {
  for (const rotation of [0, 90, -137]) for (const flipX of [false, true]) {
    const mask = Object.freeze([[0, 0], [1, .2], [.7, 1], [.12, .45]].map(Object.freeze));
    const o = Object.freeze({ x: 1200.25, y: -60.5, width: 137.25, height: 91.75, pivotX: .3, pivotY: .65, rotation, flipX, mask });
    const before = JSON.stringify(o), points = [[0, 0], [1, 0], [0, 1], [1, 1], [.5, 1], ...mask];
    for (const [px, py] of [[.12, .88], [0, 0], [1, 1], [.5, 1]]) {
      const result = K.reanchor(o, px, py), after = { ...o, ...plain(result) };
      assert.deepEqual(Object.keys(result).sort(), ['pivotX', 'pivotY', 'x', 'y']);
      samePoint(result, worldPoint(o, px, py), 'new anchor is the old world location of the picked bitmap point');
      for (const [u, v] of points) {
        const expected = worldPoint(o, u, v);
        samePoint(worldPoint(after, u, v), expected, 'reanchor must not move a source/mask point');
        const inverse = K.local(after, expected.x, expected.y);
        samePoint(inverse, { x: u * o.width, y: v * o.height }, 'existing local/hit transform still matches the unchanged world image');
      }
      assert.equal(JSON.stringify(o), before); assert.equal(after.mask, o.mask);
    }
    assert.deepEqual(plain(K.reanchor(o, o.pivotX, o.pivotY)), { x: o.x, y: o.y, pivotX: o.pivotX, pivotY: o.pivotY });
  }
});

test('reanchor is one reversible schema-v1 edit and leaves navigation, clearance, route and assets intact', () => {
  const p = scene(), o = object(p); o.rotation = -137; o.flipX = true; o.mask = [[0, 0], [1, .2], [.7, 1]];
  const h = new K.History(p), before = plain(h.project), grid = h.project.walkable;
  const navHash = crypto.createHash('sha256').update(Buffer.from(grid)).digest('hex'), route = plain(K.route(h.project));
  const samples = [[20, 20], [5, 100], [221, 180], [380, 380]], clearance = samples.map(([x, y]) => K.canWalk(h.project, x, y));
  const geometry = [h.project.world, h.project.assets, h.project.start, h.project.exit, h.project.cameras].map(plain);
  h.change(next => { const selected = object(next); Object.assign(selected, K.reanchor(selected, .17, .43)); });
  const after = plain(h.project), reloaded = K.validate(JSON.parse(JSON.stringify(h.project)));
  assert.equal(h.undoStack.length, 1); assert.deepEqual(plain(reloaded), after); assert.equal(reloaded.version, 1);
  assert.deepEqual(Object.keys(object(reloaded)).sort(), Object.keys(object(before)).sort());
  assert.deepEqual([h.project.world, h.project.assets, h.project.start, h.project.exit, h.project.cameras].map(plain), geometry);
  assert.equal(crypto.createHash('sha256').update(Buffer.from(h.project.walkable)).digest('hex'), navHash);
  assert.deepEqual(samples.map(([x, y]) => K.canWalk(h.project, x, y)), clearance); assert.deepEqual(plain(K.route(h.project)), route);
  assert.equal(h.undo(), true); assert.deepEqual(plain(h.project), before);
  assert.equal(h.redo(), true); assert.deepEqual(plain(h.project), after);
});

test('reanchor rejects invalid normalized pivots or source transforms without mutating the object', () => {
  const o = plain(object(scene())), before = plain(o);
  for (const [x, y] of [[-.01, .5], [1.01, .5], [.5, -.01], [.5, 1.01], [NaN, .5], [.5, Infinity], ['.5', .5], [.5, null], [undefined, .5]]) {
    assert.throws(() => K.reanchor(o, x, y)); assert.deepEqual(o, before);
  }
  for (const invalid of [null, [], { ...o, width: 0 }, { ...o, height: Infinity }, { ...o, x: 40001 }, { ...o, y: NaN }, { ...o, pivotX: -.1 }, { ...o, pivotY: 1.1 }, { ...o, rotation: 361 }, { ...o, flipX: 1 }]) {
    assert.throws(() => K.reanchor(invalid, .5, 1));
  }
});

test('out-of-bounds reanchor is rejected atomically without consuming undo or a redo branch', () => {
  for (const fields of [
    { x: 39950, y: 100, rotation: 0, flipX: false, to: [1, 1] },
    { x: -39950, y: 100, rotation: 0, flipX: false, to: [0, 1] },
    { x: 39950, y: 100, rotation: 90, flipX: false, to: [.5, 0] },
    { x: 39950, y: 100, rotation: 0, flipX: true, to: [0, 1] },
    { x: 100, y: 39950, rotation: 0, flipX: false, to: [.5, 1] }
  ]) {
    const p = scene(), o = object(p), { to, ...transform } = fields;
    Object.assign(o, transform, { width: 200, height: 200, pivotY: fields.y === 39950 ? 0 : 1 });
    const h = new K.History(p); h.change(next => { object(next).opacity = .4; }); h.undo();
    const before = frame(h), origin = JSON.stringify(object(h.project));
    assert.throws(() => K.reanchor(object(h.project), ...to)); assert.equal(JSON.stringify(object(h.project)), origin);
    assert.throws(() => h.change(next => { const selected = object(next); Object.assign(selected, K.reanchor(selected, ...to)); }));
    assert.equal(frame(h), before); assert.equal(h.redo(), true); assert.equal(object(h.project).opacity, .4);
  }
  const edge = { ...plain(object(scene())), x: 40000, y: -40000 };
  assert.deepEqual(plain(K.reanchor(edge, edge.pivotX, edge.pivotY)), { x: 40000, y: -40000, pivotX: .5, pivotY: 1 });
});

test('a rotated and flipped silhouette mask rejects the transparent half of an image rectangle', () => {
  const o = { x: 1000, y: 2000, width: 200, height: 100, pivotX: .25, pivotY: .8, rotation: 90, flipX: true, mask: [[0, 0], [1, 0], [0, 1]] };
  assert.equal(K.hit(o, 1055, 2000), true);  // image-local (50,25)
  assert.equal(K.hit(o, 1005, 1900), false); // image-local (150,75), inside bbox but outside triangle
  assert.equal(K.hit(o, 1000, 2000), false); // pivot (50,80) is outside the triangular silhouette
});

test('concave masks preserve a cutout without splitting the object into multiple rectangles', () => {
  const o = { x: 0, y: 0, width: 100, height: 100, pivotX: 0, pivotY: 0, rotation: 0, flipX: false, mask: [[0, 0], [1, 0], [1, .3], [.3, .3], [.3, 1], [0, 1]] };
  assert.equal(K.hit(o, 10, 70), true); assert.equal(K.hit(o, 70, 10), true); assert.equal(K.hit(o, 70, 70), false);
});

test('image source validation rejects external code, traversal, unsupported formats and blank paths', () => {
  for (const src of ['', 'https://example.com/root.png', 'javascript:alert(1)', '../../root.png', 'assets/../root.png', 'assets/%2e%2e/root.png', 'assets\\root.png', 'assets/root.svg', 'data:text/html;base64,PHNjcmlwdD4=', 'data:image/svg+xml;base64,PHN2Zz4=']) {
    const p = scene(); p.assets[0].src = src; assert.throws(() => K.validate(p), undefined, src || '(blank)');
  }
  for (const src of ['assets/map/root.png', 'img/characters/body.webp', 'assets/map/root.JPG', 'data:image/png;base64,AA==']) {
    const p = scene(); p.assets[0].src = src; assert.equal(K.validate(p).assets[0].src, src);
  }
});

test('duplicate asset, layer and global object IDs are rejected', () => {
  const p1 = scene(); p1.assets.push(plain(p1.assets[0])); assert.throws(() => K.validate(p1));
  const p2 = scene(); p2.layers[2].id = p2.layers[0].id; assert.throws(() => K.validate(p2));
  const p3 = scene(); p3.layers[2].objects.push(plain(object(p3))); assert.throws(() => K.validate(p3));
  const p4 = scene(); object(p4).assetId = 'missing-image'; assert.throws(() => K.validate(p4));
});

test('camera IDs remain unique so a saved camera can be selected unambiguously', () => {
  const p = scene(); p.cameras.push({ ...p.cameras[0], name: 'Other view', x: 200 });
  assert.throws(() => K.validate(p));
});

test('named scene URLs allow only local map scene JSON without traversal', () => {
  assert.equal(K.projectSource('assets/map/hell_rift/editor_result_20261006/hell-rift.scene.json'), 'assets/map/hell_rift/editor_result_20261006/hell-rift.scene.json');
  for(const value of ['https://example.com/a.scene.json','/api/slots','assets/map/../a.scene.json','assets/map/%2e%2e/a.scene.json','assets/map/a.json','assets/map/a.scene.json?x=1','assets/map/a.scene.json#x']) assert.throws(()=>K.projectSource(value));
});

test('soft masks and image-only parallax require a valid fixed silhouette', () => {
  const p=scene(),o=object(p);o.mask=[[0,0],[1,0],[1,1],[0,1]];o.maskFeather=120;o.sourceParallax=.965;
  const valid=K.validate(p);assert.equal(object(valid).maskFeather,120);assert.equal(object(valid).sourceParallax,.965);
  for(const [key,value] of [['maskFeather',-1],['maskFeather',161],['maskFeather',NaN],['sourceParallax',-1],['sourceParallax',1.01]]) {const q=plain(p);object(q)[key]=value;assert.throws(()=>K.validate(q));}
  delete o.mask;assert.throws(()=>K.validate(p));
});

test('out-of-range geometry and malformed masks are rejected before becoming a project', () => {
  const edits = [
    p => { p.world.cols = 9; }, p => { p.world.rows = 301; }, p => { p.world.cols = 10.5; },
    p => { p.world.tileSize = 7; }, p => { p.assets[0].width = 8193; }, p => { p.assets[0].crop.w = 101; },
    p => { p.assets[0].crop.x = -1; }, p => { object(p).height = 32001; }, p => { object(p).x = Infinity; },
    p => { object(p).pivotX = 1.1; }, p => { object(p).rotation = 361; }, p => { object(p).opacity = -1; },
    p => { object(p).flipX = 1; }, p => { object(p).mask = [[0, 0], [1, 0]]; },
    p => { object(p).mask = [[0, 0], [1, 0], [.5, 1.1]]; }, p => { object(p).mask = [[0, 0], [1, 0], [1]]; },
    p => { p.layers[0].parallax = 1.01; }, p => { p.layers[0].sort = 'unknown'; },
    p => { p.walkable[0] = 2; }, p => { p.start.x = 400; }, p => { p.exit.y = -1; }, p => { p.cameras[0].x = 401; }
  ];
  for (const edit of edits) { const p = scene(); edit(p); assert.throws(() => K.validate(p)); }
});

test('validation returns a detached project and leaves the caller intact', () => {
  const p = scene(), expected = plain(p), validated = K.validate(p);
  validated.layers[1].objects[0].x = 300; validated.walkable[0] = 0;
  assert.deepEqual(p, expected);
});
