import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRigSourceContract, rigSourceIdentity, RigSourceContractError } from '../engine/fdg/rig-source-contract.js';
import { installDruidSlamNativeBridge, loadDruidSlamNativeBridge } from '../engine/fdg/dark-druid-slam-bridge.js';

const fixture = () => JSON.parse(readFileSync(new URL('../tools/fdg-studio/fixtures/dark-druid-slam-contact-r5.rig.json', import.meta.url), 'utf8'));
const f0 = Object.freeze({
  id: 'assets/sprites/boss/boss_dark_druid_f0.png',
  src: 'assets/sprites/boss/boss_dark_druid_f0.png',
  width: 355, height: 541,
  sha256: '74060fc68eb5f6dd76771272e973b2c5038e2939286c411cb2bc9a5bbcf0fa68',
});
const freezeTree = value => {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freezeTree);
    Object.freeze(value);
  }
  return value;
};

test('actual f0 identity follows material and sourceSha256 without mutation or approval', () => {
  const project = freezeTree(fixture()), previous = structuredClone(project);
  assert.deepEqual(rigSourceIdentity(project), f0);
  const contract = createRigSourceContract(f0);
  assert.deepEqual(contract.validate(project), f0);
  assert.deepEqual(project, previous);
  assert.ok(Object.isFrozen(contract));
  assert.ok(Object.isFrozen(contract.expected));
  assert.ok(Object.isFrozen(contract.validate(project)));
  const explicitId = fixture();
  explicitId.provenance.sourceId = 'declared-source-id';
  const declared = { ...f0, id: 'declared-source-id' };
  assert.deepEqual(createRigSourceContract(declared).validate(explicitId), declared);
  assert.throws(() => contract.validate(explicitId), RigSourceContractError);
  assert.deepEqual(rigSourceIdentity({}), { id: null, src: null, width: null, height: null, sha256: null });
});

test('source path, dimensions, hash and provenance consistency independently reject stale rig metadata', () => {
  const project = fixture();
  for (const changed of [
    { id: 'unselected-next-source' },
    { src: 'assets/sprites/boss/unselected-source.png' },
    { width: 356 }, { height: 542 }, { sha256: '1'.repeat(64) },
  ]) assert.throws(() => createRigSourceContract({ ...f0, ...changed }).validate(project), RigSourceContractError);
  const changedSource = fixture();
  changedSource.provenance.source = 'assets/sprites/boss/unselected-source.png';
  changedSource.provenance.sourceId = f0.id;
  assert.throws(() => createRigSourceContract(f0).validate(changedSource), /provenance.source differs/);
  const changedSize = fixture();
  changedSize.provenance.sourceSize = [356, 541];
  assert.throws(() => createRigSourceContract(f0).validate(changedSize), /provenance.sourceSize differs/);
  const missingHash = fixture();
  delete missingHash.provenance.sourceSha256;
  assert.throws(() => createRigSourceContract(f0).validate(missingHash), /sha256:/);
  // Hypothetical manifest for rejection only; no new candidate is selected or loaded.
  const unselected = { id: 'unselected-next-source', src: 'assets/sprites/boss/unselected-source.png',
    width: 1024, height: 1536, sha256: '2'.repeat(64) };
  assert.throws(() => createRigSourceContract(unselected).validate(project), RigSourceContractError);
});

test('expected contract validation owns a stable five-field copy before any async use', () => {
  const selected = { ...f0 }, contract = createRigSourceContract(selected);
  selected.id = 'later-label'; selected.src = 'later.png'; selected.width = 1;
  selected.height = 1; selected.sha256 = 'f'.repeat(64);
  assert.deepEqual(contract.expected, f0);
  assert.deepEqual(contract.validate(fixture()), f0);
  assert.throws(() => { contract.expected.src = 'changed.png'; }, TypeError);
  assert.throws(() => { contract.validate = () => null; }, TypeError);
  const invalid = [null, [], {},
    ...['', ' ', 7, 'a\u0000b', 'x'.repeat(2049)].map(id => ({ ...f0, id })),
    ...['', 'https://example.invalid/source.png', '//example.invalid/a.png', '../a.png',
      'assets/%2e%2e/a.png', 'assets\\a.png', 'assets/a b.png', 'assets/%invalid.png'].map(src => ({ ...f0, src })),
    ...[0, -1, 4097, 355.5, NaN, Infinity, '355', null, undefined].flatMap(value =>
      [{ ...f0, width: value }, { ...f0, height: value }]),
    ...['', 'f'.repeat(63), 'f'.repeat(65), 'F'.repeat(64), 'g'.repeat(64), 12, null].map(sha256 => ({ ...f0, sha256 }))];
  for (const value of invalid) assert.throws(() => createRigSourceContract(value), RigSourceContractError);
  let reads = 0;
  const accessor = { ...f0, get src() { reads++; return reads === 1 ? f0.src : '../not-valid.png'; } };
  assert.deepEqual(createRigSourceContract(accessor).expected, f0);
  assert.equal(reads, 1);
});

function context() {
  let draws = 0;
  return {
    save() {}, restore() {}, translate() {}, scale() {}, setTransform() {}, transform() {},
    beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, clip() {}, fill() {},
    drawImage() { draws++; },
    getTransform() { return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }; },
    get draws() { return draws; },
  };
}
function consumer() {
  const scope = {
    _bossStartPattern(actor) { actor.s = 'bossSlamWind'; actor.st2 = 26; return 'original-native-start'; },
    _drawDruidBoss() { return 'original-native-draw'; },
    _btScaleMul: 1, _BOSS_GLOW: false,
  };
  const options = { scope, getStage: () => 0, clipId: 'dark-druid-native-slam-contact-r5',
    canvasFactory: () => ({ width: 0, height: 0, getContext: () => context() }) };
  const actor = { ib: true, s: 'idle', st2: 0, _bossPhase: 0, r: 44, hp: 100, alive: true,
    facing: 0, x: 100, y: 200, stunned: 0, _hitStun: 0 };
  const draw = bridge => {
    assert.equal(scope._bossStartPattern(actor, { id: 'slam' }), 'original-native-start');
    const output = context();
    assert.equal(scope._drawDruidBoss(output, actor, 1, 0, { dw: 4.6, dh: 7.1, glow: '#00ff00' }), true);
    assert.equal(output.draws, 3);
    return bridge.getRenderSnapshot(actor);
  };
  return { scope, options, actor, draw };
}

async function mockedLoader(project, callback, onFetch = () => {}) {
  const keys = ['fetch', 'Image', 'location'];
  const previous = Object.fromEntries(keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const calls = { images: 0, fetches: [], sources: [] };
  globalThis.fetch = async url => {
    calls.fetches.push(url.href); onFetch();
    return { ok: true, json: async () => structuredClone(project) };
  };
  globalThis.location = { origin: 'https://local.invalid' };
  globalThis.Image = class {
    constructor() { calls.images++; this.naturalWidth = project.materials[0].texture.width; this.naturalHeight = project.materials[0].texture.height; }
    set src(value) { calls.sources.push(value); this.onload(); }
  };
  try { return await callback(calls); }
  finally {
    for (const key of keys) {
      if (previous[key]) Object.defineProperty(globalThis, key, previous[key]);
      else delete globalThis[key];
    }
  }
}

test('actual loader rejects a different manifest before image construction and isolates pending expectations', async () => {
  const project = fixture(), c = consumer();
  await mockedLoader(project, async calls => {
    await assert.rejects(loadDruidSlamNativeBridge({ ...c.options,
      expectedSource: { ...f0, src: 'assets/sprites/boss/unselected-source.png' } }), RigSourceContractError);
    assert.equal(calls.images, 0);
    assert.equal(calls.sources.length, 0);
    assert.equal(calls.fetches.length, 1);
  });
  const selected = { ...f0 };
  await mockedLoader(project, async calls => {
    const bridge = await loadDruidSlamNativeBridge({ ...c.options, rigUrl: './explicit-selected-rig.json', expectedSource: selected });
    assert.equal(calls.images, 1);
    assert.deepEqual(calls.sources, ['https://local.invalid/' + f0.src]);
    const snapshot = c.draw(bridge);
    assert.deepEqual(snapshot.sourceIdentity, f0);
    snapshot.sourceIdentity.src = 'mutated-output.png';
    snapshot.sourceIdentity.sha256 = '0'.repeat(64);
    assert.deepEqual(bridge.getRenderSnapshot(c.actor).sourceIdentity, f0);
    assert.equal(snapshot.rigId, project.id);
    bridge.uninstall();
  }, () => {
    selected.id = 'mutated-while-loading'; selected.src = 'mutated.png'; selected.width = 1;
    selected.height = 1; selected.sha256 = '0'.repeat(64);
  });
});

test('omitted expectedSource preserves default loader and legacy consumption while diagnostics declare actual data', async () => {
  const project = fixture(), c = consumer();
  delete project.provenance.sourceSha256;
  await mockedLoader(project, async calls => {
    const bridge = await loadDruidSlamNativeBridge(c.options);
    assert.ok(calls.fetches[0].endsWith('/tools/fdg-studio/fixtures/dark-druid-boss-slam-r3.rig.json?v=boss-slam-r3-final'));
    assert.equal(calls.images, 1);
    assert.deepEqual(c.draw(bridge).sourceIdentity, { ...f0, sha256: null });
    bridge.uninstall();
  });
  const image = { naturalWidth: 355, naturalHeight: 541 };
  assert.throws(() => installDruidSlamNativeBridge({ ...c.options, rig: project, image, expectedSource: f0 }), RigSourceContractError);
  assert.throws(() => installDruidSlamNativeBridge({ ...c.options, rig: project,
    image: { naturalWidth: 1, naturalHeight: 1 } }), /decoded selected source texture dimensions/);
});

test('provided root-relative source remains local and preserves its exact declared identity', async () => {
  const project = fixture(), c = consumer();
  project.materials[0].texture.src = '/' + f0.src;
  project.provenance.source = '/' + f0.src;
  const expectedSource = { ...f0, id: '/' + f0.id, src: '/' + f0.src };
  await mockedLoader(project, async calls => {
    const bridge = await loadDruidSlamNativeBridge({ ...c.options, expectedSource });
    assert.equal(calls.images, 1);
    assert.deepEqual(calls.sources, ['https://local.invalid/' + f0.src]);
    assert.equal(new URL(calls.sources[0]).origin, 'https://local.invalid');
    assert.deepEqual(c.draw(bridge).sourceIdentity, expectedSource);
    assert.equal(project.materials[0].texture.src, expectedSource.src);
    bridge.uninstall();
  });
});
