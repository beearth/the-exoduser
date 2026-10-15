import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultProject } from '../engine/fdg/catalog.js';
import { LIMITS, ProjectStore, Signals, findRoute, isLocalAsset, validateProject } from '../engine/fdg/project.js';

// Geometry mutations below affect fresh disposable test documents only.
// They are fixtures for validator failures, not authored production stages.
function openProject() {
  const project = createDefaultProject();
  project.map.tiles = new Array(200 * 200).fill(1);
  project.map.start = { x: 100, y: 180 };
  project.map.exit = { x: 100, y: 20 };
  project.map.objects = [];
  return project;
}

function invalid(project, pattern, options) {
  let result;
  assert.doesNotThrow(() => { result = validateProject(project, options); });
  assert.equal(result.ok, false);
  assert.ok(result.errors.length > 0);
  if (pattern) assert.match(result.errors.join('\n'), pattern);
  return result;
}

test('catalog default is valid, connected, and validation does not mutate the authored document', () => {
  const project = createDefaultProject(), before = structuredClone(project);
  const result = validateProject(project);
  assert.equal(result.ok, true, result.errors.join('\n'));
  assert.equal(result.route.connected, true);
  assert.deepEqual(result.route.path[0], project.map.start);
  assert.deepEqual(result.route.path.at(-1), project.map.exit);
  assert.deepEqual(project, before);
});

test('each default catalog call returns independent resources and map storage', () => {
  const first = createDefaultProject(), second = createDefaultProject();
  first.map.tiles[0] = first.map.tiles[0] === 1 ? 0 : 1;
  first.characters[0].sprite.frameWidth = 999;
  first.preview.characterId = 'changed';
  assert.notEqual(first.map.tiles[0], second.map.tiles[0]);
  assert.equal(second.characters[0].sprite.frameWidth, 48);
  assert.equal(second.preview.characterId, 'exoduser_warrior');
});

test('malformed top-level inputs return validation errors rather than throwing', async t => {
  for (const [label, value] of [['null', null], ['undefined', undefined], ['array', []], ['text', 'invalid'], ['number', 7], ['empty object', {}]]) {
    await t.test(label, () => invalid(value));
  }
});

test('malformed resource collections and nested values return validation errors', async t => {
  const cases = [
    ['truthy skills object', p => { p.skills = {}; }, /skills/],
    ['skills string', p => { p.skills = 'bad'; }, /skills/],
    ['null characters', p => { p.characters = null; }, /characters/],
    ['truthy VFX object', p => { p.vfx = {}; }, /vfx/],
    ['null skill entry', p => { p.skills = [null]; }, /skills/],
    ['null map', p => { p.map = null; }, /map/],
    ['object tiles', p => { p.map.tiles = {}; }, /map.tiles/],
    ['object objects', p => { p.map.objects = {}; }, /map.objects/],
    ['null object entry', p => { p.map.objects = [null]; }, /map.objects/],
    ['null sprite', p => { p.characters[0].sprite = null; }, /sprite/],
    ['null animation entry', p => { p.characters[0].animations.walk = null; }, /animations/],
    ['null preview', p => { p.preview = null; }, /preview/],
  ];
  for (const [label, mutate, pattern] of cases) {
    await t.test(label, () => { const project = createDefaultProject(); mutate(project); invalid(project, pattern); });
  }
});

test('duplicate IDs are rejected within every resource collection', async t => {
  for (const group of ['characters', 'skills', 'vfx']) {
    await t.test(group, () => {
      const project = createDefaultProject();
      project[group].push(structuredClone(project[group][0]));
      invalid(project, /중복 id/);
    });
  }
});

test('decorative object IDs must be unique', () => {
  const project = openProject();
  const object = { id: 'qa-prop', name: 'QA prop', x: 100, y: 110, src: 'assets/vfx/vfx_landing_fire.png', scale: 1, layer: 'world', collision: false };
  project.map.objects = [object, { ...object, x: 106 }];
  invalid(project, /중복 id/);
});

test('missing skill VFX and preview resource references are rejected', async t => {
  const cases = [
    ['skill VFX', p => { p.skills[0].vfx = 'missing-vfx'; }, /연결된 VFX/],
    ['preview character', p => { p.preview.characterId = 'missing-character'; }, /preview.characterId/],
    ['preview skill', p => { p.preview.skillId = 'missing-skill'; }, /preview.skillId/],
    ['preview VFX', p => { p.preview.vfxId = 'missing-vfx'; }, /preview.vfxId/],
  ];
  for (const [label, mutate, pattern] of cases) {
    await t.test(label, () => { const project = createDefaultProject(); mutate(project); invalid(project, pattern); });
  }
});

test('asset paths reject remote URLs, traversal, encoded traversal, executable files, and query fragments', async t => {
  const paths = [
    'https://example.invalid/player.png', 'http://example.invalid/player.png', '//example.invalid/player.png',
    'data:image/png;base64,AAAA', 'javascript:alert(1).png', 'file:///tmp/player.png', 'C:\\assets\\player.png',
    '../player.png', 'img/../player.png', './img/player.png', 'img/./player.png',
    '%2e%2e/player.png', 'img/%2e%2e/player.png', 'img/%2E%2E%2Fplayer.png',
    'img/player.png?v=1', 'img/player.png#frame', 'img/player.js', 'img/\u0000player.png',
  ];
  for (const src of paths) {
    await t.test(JSON.stringify(src), () => {
      assert.equal(isLocalAsset(src), false, `unsafe asset accepted: ${src}`);
      const project = createDefaultProject(); project.characters[0].sprite.src = src;
      invalid(project, /sprite.src/);
    });
  }
  for (const src of ['img/exoduser_warrior/south.png', 'assets/vfx/fire_1.webp', 'assets/참조 이미지.PNG']) assert.equal(isLocalAsset(src), true, src);
});

test('sprite dimensions, animation offsets, and direction paths cannot point outside their declared sheet', async t => {
  const cases = [
    ['sheet capacity', p => { p.characters[0].sprite.frames = 999; }, /시트 용량/],
    ['animation end', p => { p.characters[0].animations.walk.start = 20; }, /시트 프레임 범위/],
    ['unknown direction', p => { p.characters[0].sprite.directions.up = 'img/player.png'; }, /directions.up/],
    ['unsafe direction image', p => { p.characters[0].sprite.directions.south = '../player.png'; }, /directions.south/],
    ['invalid row', p => { p.characters[0].animations.walk.row = 9; }, /walk.row/],
  ];
  for (const [label, mutate, pattern] of cases) {
    await t.test(label, () => { const project = createDefaultProject(); mutate(project); invalid(project, pattern); });
  }
});

test('finite numeric values and integer particle counts are required', () => {
  const project = createDefaultProject();
  project.characters[0].speed = Infinity;
  project.skills[0].cost = NaN;
  project.vfx[0].count = 1.5;
  const result = invalid(project);
  for (const pattern of [/characters\[0\].speed/, /skills\[0\].cost/, /vfx\[0\].count/]) assert.match(result.errors.join('\n'), pattern);
});

test('map dimensions and tile count preserve the 200 by 200 at 40px contract', async t => {
  for (const [label, mutate] of [
    ['width', p => { p.map.width = 199; }],
    ['tile size', p => { p.map.tileSize = 20; }],
    ['missing tile', p => { p.map.tiles.pop(); }],
    ['unknown tile', p => { p.map.tiles[0] = 4; }],
  ]) await t.test(label, () => { const project = openProject(); mutate(project); invalid(project, /맵 계약|map.tiles/); });
});

test('a complete blocked band is detected as a disconnected south to north route', () => {
  const project = openProject();
  project.map.tiles.fill(0, 99 * 200, 100 * 200);
  const result = invalid(project, /경로가 끊어/);
  assert.equal(result.route.connected, false);
  assert.deepEqual(result.route.path, []);
});

test('spawn and exit on blocked tile types are rejected', async t => {
  for (const target of ['start', 'exit']) for (const tile of [0, 2, 3]) {
    await t.test(`${target} on tile ${tile}`, () => {
      const project = openProject(), point = project.map[target];
      project.map.tiles[point.y * 200 + point.x] = tile;
      invalid(project, /이동 가능한 바닥/);
    });
  }
});

test('south start and north exit orientation is enforced independently of route connectivity', () => {
  const project = openProject(); project.map.start = { x: 100, y: 40 }; project.map.exit = { x: 100, y: 160 };
  const result = invalid(project, /6시.*12시/);
  assert.equal(result.route.connected, true);
});

test('route search considers character clearance in a one-tile corridor', () => {
  const map = { width: 7, height: 7, tileSize: 40, tiles: new Array(49).fill(0), start: { x: 3, y: 5 }, exit: { x: 3, y: 1 } };
  for (let y = 1; y <= 5; y++) map.tiles[y * 7 + 3] = 1;
  assert.equal(findRoute(map, 12).connected, true);
  assert.equal(findRoute(map, 21).connected, false);
});

test('structural validation can allow a temporarily disconnected editor document before route QA', () => {
  const project = openProject(); project.map.tiles.fill(0, 99 * 200, 100 * 200);
  const result = validateProject(project, { geometry: false });
  assert.equal(result.ok, true, result.errors.join('\n'));
  assert.equal(result.route, null);
});

test('invalid edits preserve the current document and leave history and events untouched', () => {
  const store = new ProjectStore(createDefaultProject()), before = store.project;
  let changes = 0; store.signals.on('changed', () => changes++);
  assert.throws(() => store.change('invalid cost', project => { project.skills[0].cost = -1; }), /cost/);
  assert.deepEqual(store.project, before);
  assert.equal(store.canUndo, false); assert.equal(store.canRedo, false); assert.equal(changes, 0);
});

test('invalid imported document after undo preserves both the current document and available redo', () => {
  const store = new ProjectStore(createDefaultProject());
  store.change('rename', project => { project.name = 'Edited'; });
  store.undo(); const before = store.project, malformed = store.project; malformed.skills = {};
  assert.throws(() => store.replace(malformed, 'broken import'), /skills/);
  assert.deepEqual(store.project, before);
  assert.equal(store.canUndo, false); assert.equal(store.canRedo, true);
  assert.equal(store.redo(), true); assert.equal(store.project.name, 'Edited');
});

test('a mutator that throws after changing its draft never commits partial work', () => {
  const store = new ProjectStore(createDefaultProject()), before = store.project;
  assert.throws(() => store.change('failed gesture', project => { project.name = 'Partial'; throw new Error('gesture failed'); }), /gesture failed/);
  assert.deepEqual(store.project, before); assert.equal(store.canUndo, false);
});

test('a multi-field brush or inspector gesture commits and undoes as one action', () => {
  const store = new ProjectStore(openProject()), before = store.project, labels = [];
  store.signals.on('changed', event => labels.push(event.label));
  store.change('brush gesture', project => {
    for (let x = 20; x < 28; x++) project.map.tiles[50 * 200 + x] = 2;
    project.skills[0].range = 240;
  });
  const after = store.project;
  assert.notDeepEqual(after, before);
  assert.equal(store.undo(), true); assert.deepEqual(store.project, before); assert.equal(store.canUndo, false);
  assert.equal(store.redo(), true); assert.deepEqual(store.project, after); assert.equal(store.canRedo, false);
  assert.deepEqual(labels, ['brush gesture', 'brush gesture 취소', 'brush gesture 다시 실행']);
});

test('a no-op gesture creates no undo entry or change event', () => {
  const store = new ProjectStore(createDefaultProject()); let events = 0;
  store.signals.on('changed', () => events++);
  store.change('same value', project => { project.name = project.name; });
  assert.equal(store.replace(store.project), false);
  assert.equal(store.canUndo, false); assert.equal(events, 0);
});

test('constructor inputs and exported snapshots cannot mutate store internals', () => {
  const input = createDefaultProject(), store = new ProjectStore(input), before = store.project;
  input.skills[0].cost = 999;
  input.map.tiles[0] = 3;
  const exported = store.project; exported.characters[0].sprite.frameWidth = 999; exported.map.tiles[0] = 2;
  assert.deepEqual(store.project, before);
});

test('replacement inputs and change-event snapshots cannot leak mutation into committed history', () => {
  const store = new ProjectStore(createDefaultProject()), before = store.project, incoming = store.project;
  incoming.name = 'Imported';
  store.signals.on('changed', event => { event.project.skills[0].cost = 999; event.project.map.tiles[0] = 3; });
  assert.equal(store.replace(incoming), true);
  incoming.name = 'Mutated after import'; incoming.skills[0].cost = 888;
  assert.equal(store.project.name, 'Imported'); assert.equal(store.project.skills[0].cost, before.skills[0].cost);
  store.undo(); assert.deepEqual(store.project, before);
  store.redo(); assert.equal(store.project.name, 'Imported'); assert.equal(store.project.skills[0].cost, before.skills[0].cost);
});

test('editing after undo invalidates the old redo branch', () => {
  const store = new ProjectStore(createDefaultProject());
  store.change('first', project => { project.name = 'First'; });
  store.change('second', project => { project.name = 'Second'; });
  store.undo(); assert.equal(store.project.name, 'First'); assert.equal(store.canRedo, true);
  store.change('new branch', project => { project.name = 'Branch'; });
  assert.equal(store.canRedo, false); assert.equal(store.redo(), false); assert.equal(store.project.name, 'Branch');
  store.undo(); assert.equal(store.project.name, 'First');
});

test('history retains the most recent 80 committed actions and redo restores that window', () => {
  const store = new ProjectStore(createDefaultProject());
  for (let index = 1; index <= LIMITS.history + 5; index++) store.change(`edit ${index}`, project => { project.name = `Version ${index}`; });
  let undos = 0; while (store.undo()) undos++;
  assert.equal(LIMITS.history, 80); assert.equal(undos, 80); assert.equal(store.project.name, 'Version 5');
  let redos = 0; while (store.redo()) redos++;
  assert.equal(redos, 80); assert.equal(store.project.name, 'Version 85');
});

test('Signals subscriptions can be removed individually and clear removes all listeners', () => {
  const signals = new Signals(), events = [];
  const remove = signals.on('changed', value => events.push(`A:${value}`));
  signals.on('changed', value => events.push(`B:${value}`));
  signals.emit('other', 1); signals.emit('changed', 1);
  remove(); remove(); signals.emit('changed', 2);
  signals.clear(); signals.emit('changed', 3);
  assert.deepEqual(events, ['A:1', 'B:1', 'B:2']);
});

test('ProjectStore.dispose detaches observers so later edits do not notify disposed UI', () => {
  const store = new ProjectStore(createDefaultProject()); let events = 0;
  store.signals.on('changed', () => events++);
  store.dispose(); store.dispose();
  store.change('after dispose', project => { project.name = 'Changed'; });
  assert.equal(events, 0);
});
