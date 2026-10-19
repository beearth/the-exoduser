import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { createHash } from 'node:crypto';

const html = await fs.readFile(new URL('../game.html', import.meta.url), 'utf8');
const sourceStart = html.indexOf('const _druidSheets={};');
const sourceEnd = html.indexOf('// ── 대형보스 글로벌 설정', sourceStart);
const selector = html.slice(sourceStart, sourceEnd);
const moduleStart = html.indexOf('// Explicit rendering opt-in.');
const moduleEnd = html.indexOf('</script>', moduleStart);
const boot = html.slice(moduleStart, moduleEnd).replace(/\bimport\(/g, '__import(');
const sourceSha = 'ceb3843fc1d612601b63dcb33035298da9b92d4ae39e88d986805ec4216e1549';

function setup(query = '', dimensions = [1656, 1240]) {
  const images = [], loads = [], actors = new WeakMap();
  class Image {
    constructor() { images.push(this); }
    set src(value) {
      this.url = value;
      const size = value.includes('8dir_v3') ? dimensions : [887, 1774];
      [this.naturalWidth, this.naturalHeight] = size;
    }
  }
  const scope = { Image, WeakMap, URL, location: { href: 'http://127.0.0.1:3333/game.html' + query },
    performance: { now: () => 450 }, _drawDruidFinaleTell() {},
    _stage1CodexBossMotionKey: actor => actors.get(actor) ?? 'idle',
    _FDG_DRUID_THORN_FIRST: false, G: { stage: 0, stageTime: 0 }, _isDruidFinale: () => false,
    console: { warn() {} }, _FDGDruidQaStorage: { active: true },
    __import: async url => { loads.push({ url }); return { loadDruidSlamNativeBridge: async options => {
      loads.at(-1).options = options; return { id: 'historical-only-test' };
    } }; },
  };
  scope.window = scope;
  const context = vm.createContext(scope);
  vm.runInContext(selector, context);
  for (const image of images) image.onload.call(image);
  const draw = (actor, key = 'idle') => {
    actors.set(actor, key);
    const draws = [], composites = [];
    const canvas = { globalAlpha: 1, save() {}, restore() {}, translate() {}, scale() {}, beginPath() {}, ellipse() {}, fill() {},
      drawImage: (...args) => draws.push(args),
      set globalCompositeOperation(value) { composites.push(value); },
    };
    const result = context._drawDruidBoss(canvas, actor, .8, 0, { dw: 8, dh: 14.1 });
    return { result, draws, composites };
  };
  return { context, images, loads, draw };
}

test('the copied v3 artwork is the exact adopted original, with eight complete cells', async () => {
  const png = await fs.readFile(new URL('../assets/sprites/boss/boss_dark_druid_8dir_v3.png', import.meta.url));
  assert.equal(png.length, 3668669);
  assert.equal(createHash('sha256').update(png).digest('hex'), sourceSha);
  assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [1656, 1240]);
});

test('all eight native idle directions use complete v3 cells, preserve aspect and composite once', () => {
  const { context, draw } = setup();
  const angles = [Math.PI / 2, Math.PI * 3 / 4, Math.PI, -Math.PI * 3 / 4,
    -Math.PI / 2, -Math.PI / 4, 0, Math.PI / 4];
  angles.forEach((facing, direction) => {
    const actor = { x: 10, y: 20, r: 40, s: 'idle', facing, hp: 100 };
    const before = JSON.stringify(actor);
    const { result, draws, composites } = draw(actor);
    assert.equal(result, true);
    assert.equal(draws.length, 1);
    assert.ok(draws[0][0].url.includes('boss_dark_druid_8dir_v3.png?v=ceb3843f'));
    const [, sx, sy, cw, ch, dx, dy, dw, dh] = draws[0];
    assert.deepEqual([sx, sy, cw, ch], [(direction % 4) * 414, Math.floor(direction / 4) * 620, 414, 620]);
    assert.ok(Math.abs(dw / dh - 414 / 620) < 1e-12);
    assert.equal(dx, -dw / 2);
    assert.equal(dy, -dh * .86);
    assert.ok(!composites.includes('lighter'));
    const identity = context._FDGDruidSourceSelection.getDrawnSource(actor);
    assert.equal(identity.sha256, sourceSha);
    assert.equal(identity.nativeDir, direction);
    assert.equal(identity.kind, 'directional-idle');
    const { _nameTopOff, ...unchanged } = actor;
    assert.equal(JSON.stringify(unchanged), before);
  });
});

test('legacy motion is reported as legacy; bad v3 dimensions cannot become ready', () => {
  const { context, draw } = setup();
  for (const [key, sheet, state] of [['walk', 'walk', 'eWalk'], ['slam', 'attack', 'bossSlam']]) {
    const actor = { x: 0, y: 0, r: 40, s: state, facing: 0, hp: 100 };
    const { result, draws } = draw(actor, key);
    assert.equal(result, true);
    assert.equal(draws.length, 3);
    assert.ok(draws[0][0].url.includes('boss_dark_druid_' + sheet + '.png'));
    const identity = context._FDGDruidSourceSelection.getDrawnSource(actor);
    assert.equal(identity.kind, 'legacy-motion');
    assert.equal(identity.sha256, null);
  }
  assert.equal(setup('', [1656, 1241]).draw({ x: 0, y: 0, r: 40, s: 'idle', facing: 0 }).result, false);
});

test('r3/r5 query alone cannot load f0 rig; historical explicit choice sends the exact f0 contract', async () => {
  for (const revision of ['r3', 'r5']) {
    const normal = setup('?fdgDruidSlam=' + revision);
    vm.runInContext(boot, normal.context);
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(normal.loads.length, 0);
    const legacy = setup('?fdgDruidSlam=' + revision + '&fdgDruidSource=legacy-f0');
    vm.runInContext(boot, legacy.context);
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(legacy.loads.length, 1);
    const expected = legacy.loads[0].options.expectedSource;
    assert.equal(expected.id, 'assets/sprites/boss/boss_dark_druid_f0.png');
    assert.equal(expected.src, expected.id);
    assert.equal(expected.width, 355);
    assert.equal(expected.height, 541);
    assert.equal(expected.sha256, '74060fc68eb5f6dd76771272e973b2c5038e2939286c411cb2bc9a5bbcf0fa68');
    assert.ok(legacy.loads[0].url.includes('source-contract-20261012'));
  }
});

test('source readiness works without the old rig, unchanged draws reuse metadata and hidden bodies clear it', () => {
  const { context, draw } = setup();
  assert.equal(context._FDGDruidSourceSelection.isReady(), true);
  assert.equal(context._FDGDruidSlamBridge, undefined);
  const actor = { x: 0, y: 0, r: 40, s: 'idle', facing: 0, hp: 100 };
  context.__actor = actor;
  draw(actor);
  const identity = vm.runInContext('_druidDrawnSources.get(__actor)', context);
  draw(actor);
  assert.strictEqual(vm.runInContext('_druidDrawnSources.get(__actor)', context), identity);
  actor.s = 'bossDruidUnder';
  assert.equal(draw(actor).result, true);
  assert.equal(context._FDGDruidSourceSelection.getDrawnSource(actor), null);
  const legacy = setup('?fdgDruidSource=legacy-f0');
  assert.equal(legacy.context._FDGDruidSourceSelection.isReady(), false);
});
