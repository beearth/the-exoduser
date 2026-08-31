import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function loadHill(stage = 0) {
  const block = gameHtml.match(/\/\/ CH1-1 HIGH GROUND START([\s\S]*?)\/\/ CH1-1 HIGH GROUND END/);
  assert.ok(block, 'CH1-1 high-ground implementation block must exist');
  const context = { G: { stage }, T: 40, Math };
  vm.createContext(context);
  vm.runInContext(`${block[1]};globalThis.hill={spec:_CH1_HILL,blocks:_ch1HillBandBlocks,height:_ch1HillHeightAt}`, context);
  return context.hill;
}

test('CH1-1 altar hill is stage-local and only its ramp crosses the cliff band', () => {
  const hill = loadHill(0);
  assert.deepEqual({ cx: hill.spec.cx, cy: hill.spec.cy }, { cx: 147, cy: 98 });
  assert.equal(hill.spec.ry, 9, 'altar hill depth must match the existing CH1 ground-edge silhouette');
  assert.ok(hill.height(147 * 40, 98 * 40) >= 0.99, 'altar plateau must be actual height level 1');
  assert.equal(hill.blocks(147 * 40, 89 * 40), true, 'north cliff face must block direct ascent');
  assert.equal(hill.blocks(165 * 40, 98 * 40), true, 'east cliff face must block direct ascent');
  assert.equal(hill.blocks(129 * 40, 98 * 40), false, 'west ramp must open the cliff band');
  assert.ok(hill.height(126 * 40, 98 * 40) > 0 && hill.height(126 * 40, 98 * 40) < 1,
    'ramp must interpolate from low ground to the plateau');
  assert.equal(hill.blocks(100 * 40, 100 * 40), false, 'locked north-south route must remain untouched');
  assert.equal(hill.height(100 * 40, 100 * 40), 0, 'main route remains low ground');

  const otherStage = loadHill(1);
  assert.equal(otherStage.blocks(147 * 40, 85 * 40), false, 'hill collision must not leak into SI2');
  assert.equal(otherStage.height(147 * 40, 98 * 40), 0, 'hill height must not leak into SI2');
});

test('CH1-1 hill participates in world collision and renders below authored props', () => {
  assert.match(gameHtml, /function isW\([^)]*\).*?_ch1HillBandBlocks\(px,py\)/s,
    'isW must include the authored hill cliff band');
  assert.match(gameHtml, /function _drawCh1Hill\(ctx\)/,
    'hill needs a dedicated top-down plateau/ramp renderer');
  const mapDraw = gameHtml.indexOf('if(_streamVpCvs){X.drawImage(_streamVpCvs');
  const hillDraw = gameHtml.indexOf('_drawCh1Hill(X);');
  const objectDraw = gameHtml.indexOf('// ── 환경 데코 렌더링 ──', hillDraw);
  assert.ok(mapDraw >= 0 && hillDraw > mapDraw && objectDraw > hillDraw,
    'hill must draw after the map floor and before props/entities');
});
