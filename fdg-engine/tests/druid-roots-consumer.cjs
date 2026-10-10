'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const output = process.env.FDG_TEST_OUTPUT || path.resolve(__dirname, '../../../.fdg-test-output/druid-roots-consumer');
fs.mkdirSync(output, { recursive: true });
const witness = { unit: 'ROOT-FDG-DRUID-ROOTS-CONSUMER-20261010', epoch: 'source-first', checks: [] };
const result = { unit: witness.unit, epoch: witness.epoch, status: 'RUNNING', groups: [], passedConditions: 0, failedConditions: 0,
  pngDecodes: 0, nativeCalls: 0, oldSuitesExecuted: 0 };
function store() {
  fs.writeFileSync(path.join(output, 'source-first-witness.json'), JSON.stringify(witness, null, 2) + '\n');
  fs.writeFileSync(path.join(output, 'source-first-result.json'), JSON.stringify(result, null, 2) + '\n');
}
function check(id, actual, expected) {
  witness.checks.push({ group: result.groups[result.groups.length - 1], id, actual, expected });
  store(); // Persist observed values before asserting them.
  try { assert.deepEqual(actual, expected); result.passedConditions++; }
  catch (error) { result.failedConditions++; throw error; }
}
function group(name) { result.groups.push(name); }
function state(node, frame, fraction, overrides = {}) {
  return node.syncLegacy(Object.assign({ frame, fraction, maxFrames: 10, effectiveAlpha: 1, alive: true, drawAllowed: true }, overrides));
}
try {
  group('new-module-and-request');
  let imageCalls = 0, fetchCalls = 0;
  globalThis.Image = function () { imageCalls++; throw new Error('Source fixture must not load images'); };
  globalThis.fetch = function () { fetchCalls++; throw new Error('Source fixture must not fetch'); };
  const FDG = require('../src/core.js');
  require('../src/animation.js');
  const extension = require('../src/exoduser.js');
  const node = new FDG.DruidRootsNode({ id: 'external-roots', name: 'Roots' });
  check('module-identity-and-inactive-state', [extension === FDG, node.type, node.visible, node.getDrawState().imageUrl, node.getDrawState().drawAllowed],
    [true, 'DruidRoots', true, '', false]);
  const scale = (22 + 120) * 2 / 256;
  const same = node.request('druid_roots', 120, -45, scale, 7, 0.35, false);
  check('actual-seven-argument-geometry', [same === node, node.legacyRequest, node.width, node.height, node.position, node.rotation, node.getDrawState().pivot, node.getDrawState().blend],
    [true, ['druid_roots', 120, -45, scale, 7, 0.35, false], 284, 284, { x: 120, y: -45, z: 0 }, 0.35, { x: 0.5, y: 0.5 }, 'lighter']);
  check('clip-and-lazy-contract', [node.clip.columns, node.clip.rows, node.clip.frames, node.clip.frameWidth, node.clip.frameHeight,
    node.clip.fps, node.clip.loop, node.getDrawState().imageUrl, node.getDrawState().drawAllowed, imageCalls, fetchCalls],
    [8, 6, 48, 448, 448, 288 / 7, false, '../assets/vfx/boss/druid_roots_48_20261010.png', false, 0, 0]);

  group('external-gates-and-replay');
  node.visible = false;
  state(node, 0, 0, { effectiveAlpha: 0.6 });
  check('external-born-zero-and-common-visibility', [node.currentFrame(), node.properties.opacity, node.visible, node.getDrawState().drawAllowed,
    Object.isFrozen(node.legacyRequest), Object.isFrozen(node.legacySnapshot)], [0, 0.6, false, true, true, true]);
  state(node, 2, 0.5, { drawAllowed: false });
  check('temporary-cull-keeps-url', [node.getDrawState().imageUrl, node.getDrawState().drawAllowed, node.alive, node.currentFrame()],
    ['../assets/vfx/boss/druid_roots_48_20261010.png', false, true, 12]);
  node.request('druid_roots', 9, 10, scale, 7, 0, false);
  check('explicit-replay-same-instance', [node.id, node.currentFrame(), node.drawAllowed, node.visible, node.position.x, node.position.y],
    ['external-roots', 0, false, false, 9, 10]);

  group('forty-eight-normalized-source-cells');
  const cells = [];
  for (let index = 0; index < 48; index++) {
    const legacy = (index + 0.5) * 10 / 48, frame = Math.floor(legacy);
    state(node, frame, legacy - frame);
    const draw = node.getDrawState();
    cells.push([node.currentFrame(), draw.rect.x, draw.rect.y, draw.rect.width, draw.rect.height]);
  }
  check('literal-row-major-midpoint-oracle', cells, Array.from({ length: 48 }, (_, i) => [i, i % 8 * 448 + 1, Math.floor(i / 8) * 448 + 1, 446, 446]));

  group('fdg-clock-independent-and-host-owned-end');
  const tree = new FDG.SceneTree(); tree.root.addChild(node);
  state(node, 3, 0.4, { effectiveAlpha: 0.8 });
  const snapshot = JSON.stringify(node.legacySnapshot), sourceFrame = node.currentFrame();
  tree.advance(0.1); tree.paused = true; tree.stepOnce(); node._process(500);
  check('tree-physics-does-not-advance-legacy', [JSON.stringify(node.legacySnapshot), node.currentFrame(), node.animator.elapsed], [snapshot, sourceFrame, 0]);
  state(node, 10, 0, { alive: false, drawAllowed: false });
  check('ended-snapshot-retained-and-url-retired', [node.legacyProgress, node.currentFrame(), node.getDrawState().imageUrl,
    node.getDrawState().rect, node.getDrawState().drawAllowed, node.parent === tree.root, tree.getNode(node.id) === node], [1, 47, '', null, false, true, true]);

  group('atomic-input-validation');
  state(node, 4, 0.25);
  const original = JSON.stringify(node.toJSON());
  const invalidCalls = [
    () => node.request('other', 1, 2, 1, 7, 0, false),
    () => node.request('druid_roots', 1, 2, 0, 7, 0, false),
    () => node.request('druid_roots', 1, 2, 1, 6, 0, false),
    () => node.syncLegacy({ frame: 1, fraction: 0, maxFrames: 9, effectiveAlpha: 1, alive: true, drawAllowed: true }),
    () => state(node, 10, 0.1),
    () => state(node, 1, NaN),
    () => state(node, 1, 0, { effectiveAlpha: 2 }),
    () => state(node, 1, 0, { alive: 'yes' })
  ];
  const invalid = invalidCalls.map(call => {
    let rejected = false; try { call(); } catch (_) { rejected = true; }
    return [rejected, JSON.stringify(node.toJSON()) === original];
  });
  check('invalid-inputs-preserve-current-request-and-state', invalid, invalidCalls.map(() => [true, true]));
  const blank = new FDG.DruidRootsNode();
  let rejectedUnrequested = false; try { state(blank, 0, 0); } catch (_) { rejectedUnrequested = true; }
  check('snapshot-needs-accepted-request', [rejectedUnrequested, blank.legacySnapshot, blank.getDrawState().imageUrl], [true, null, '']);

  group('scene-json-factory-and-edited-transform');
  node.position.z = 3; node.position.x = 501; node.rotation = -0.2; node.scale.x = 1.3;
  node.metadata = { source: 'accepted-main-request' }; node.properties.tag = { purpose: 'external-phase' };
  const serialized = tree.toJSON();
  const imported = FDG.SceneTree.fromJSON(serialized, FDG.ExoduserFactories);
  const restored = imported.getNode('external-roots');
  check('custom-factory-roundtrip', [restored instanceof FDG.DruidRootsNode, restored.toJSON(), imported.paused], [true, node.toJSON(), true]);
  const restoredSnapshot = JSON.stringify(restored.legacySnapshot);
  imported.stepOnce();
  check('restored-snapshot-is-still-external', [JSON.stringify(restored.legacySnapshot), restored.currentFrame(), restored.getDrawState().rect, Object.isFrozen(restored.legacySnapshot)],
    [restoredSnapshot, node.currentFrame(), node.getDrawState().rect, true]);
  const malformed = structuredClone(serialized);
  malformed.root.children[0].properties.snapshot.maxFrames = 48;
  let rejectedJSON = false; try { FDG.SceneTree.fromJSON(malformed, FDG.ExoduserFactories); } catch (_) { rejectedJSON = true; }
  check('import-rejects-other-lifetime', rejectedJSON, true);

  group('pure-display-and-explicit-removal');
  const drawBefore = JSON.stringify(restored.getDrawState());
  for (let i = 0; i < 3; i++) restored.getDrawState();
  check('repeated-display-is-pure-and-no-image-start', [JSON.stringify(restored.getDrawState()), imageCalls, fetchCalls], [drawBefore, 0, 0]);
  imported.root.removeChild(restored);
  check('host-can-delete-effect', [restored.parent, imported.getNode(restored.id)], [null, null]);
  result.status = 'PASS'; store();
  process.stdout.write(JSON.stringify({ status: result.status, groups: result.groups.length, passedConditions: result.passedConditions, failedConditions: result.failedConditions }) + '\n');
} catch (error) {
  result.status = 'FAIL'; result.error = { name: error.name, message: error.message, stack: error.stack }; store();
  process.stderr.write(error.stack + '\n'); process.exitCode = 1;
}
