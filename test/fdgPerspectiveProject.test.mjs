import test from 'node:test';
import assert from 'node:assert/strict';
import { createPerspectiveProject } from '../engine/fdg/perspective-project.js';
import { createDefaultProject } from '../engine/fdg/catalog.js';
import { validateProject, ProjectStore } from '../engine/fdg/project.js';
import { createTerrainScene } from '../engine/fdg/terrain-scene.js';

test('camera work copy keeps locked nav, start, exit and real character resources', () => {
  const source = createDefaultProject(), project = createPerspectiveProject();
  assert.deepEqual(project.map.tiles, source.map.tiles);
  assert.deepEqual(project.map.start, source.map.start);
  assert.deepEqual(project.map.exit, source.map.exit);
  assert.deepEqual(project.characters, source.characters);
  assert.equal(project.provenance.cameraStudy.copiedPoeAssets, false);
  assert.ok(project.map.objects.length > 0);
  for (const object of project.map.objects) {
    assert.equal(project.map.tiles[object.y * 200 + object.x], 1);
    assert.equal(object.collision, false);
    for (const other of project.map.objects) if (object !== other) assert.ok(Math.hypot(object.x - other.x, object.y - other.y) >= 5);
  }
  const result = validateProject(project);
  assert.equal(result.ok, true, result.errors.join('\n'));
});

test('optional camera rejects invalid lens and incompatible terrain authority', () => {
  const source = createDefaultProject();
  assert.equal(validateProject(source, { geometry: false }).ok, true);
  for (const [key, value] of [['projection', 'unknown'], ['pitch', 0], ['distance', 599], ['near', 129], ['zoom', Infinity]]) {
    const project = createPerspectiveProject(); project.viewCamera[key] = value;
    assert.equal(validateProject(project, { geometry: false }).ok, false, key);
  }
  const project = createPerspectiveProject(); project.terrainScene = createTerrainScene(project.map);
  const result = validateProject(project, { geometry: false });
  assert.ok(result.errors.some(error => error.startsWith('viewCamera:')));
});

test('camera edits undo and JSON roundtrip preserve authored extensions', () => {
  const project = createPerspectiveProject(); project.viewCamera.note = { authority: 'ENGINE_AUTHORING' };
  const store = new ProjectStore(project);
  store.change('lens', next => { next.viewCamera.distance = 1800; });
  assert.equal(store.project.viewCamera.distance, 1800);
  assert.equal(store.undo(), true);
  assert.deepEqual(store.project, project);
  assert.equal(store.redo(), true);
  const reopened = JSON.parse(JSON.stringify(store.project));
  assert.equal(validateProject(reopened, { geometry: false }).ok, true);
  assert.equal(reopened.viewCamera.distance, 1800);
  assert.deepEqual(reopened.viewCamera.note, project.viewCamera.note);
  store.dispose();
});
