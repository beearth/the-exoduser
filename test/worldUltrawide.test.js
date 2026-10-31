import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const game = fs.readFileSync(new URL('../game.html', import.meta.url), 'utf8');
function fn(name) {
  const start = game.indexOf('function ' + name + '(');
  assert.notEqual(start, -1, name);
  const end = game.indexOf('\n}', start);
  const lineEnd = game.indexOf('\n', start);
  return game.slice(start, game.slice(start, lineEnd).endsWith('}') ? lineEnd : end + 2);
}

test('stage=0 selects the full field; plate previews require an explicit art-preview option', () => {
  for (const [stage, mapTest, plate, classic, expected] of [
    [0, '', '', false, false], [-1, '', '', false, false], [1, '', '', false, false],
    [0, '1', '', false, true], [0, 'v4', '', false, true],
    [0, '', 'prod', false, true], [0, '', 'fieldone', false, true],
    [0, '', 'v1', false, true], [0, '1', 'prod', true, false],
  ]) {
    const c = vm.createContext({_stageTestReq:stage, _mapTestReq:mapTest, _kitPlateReq:plate, _classicMap:classic});
    vm.runInContext(fn('_kitPlateIsFieldOne') + '\n' + fn('_wantPlateTest'), c);
    assert.equal(c._wantPlateTest(), expected, JSON.stringify({stage,mapTest,plate,classic}));
  }
});

test('the 8000px production layer cannot be scaled onto a small plate preview', () => {
  const c = vm.createContext({_ch1StartOuterBootFallback:false,_FDG_RUINED_FOREST_FIRST:false,
    G:{stage:0,_bossArena:false},location:{},_CH1_START_OUTER:{stage:0},_CH1_START_OUTER_QUERY_ENABLED:true,
    _isPlateMap:()=>true});
  vm.runInContext(fn('_ch1StartOuterEnabled'), c);
  assert.equal(c._ch1StartOuterEnabled(), false);
  assert.match(game, /if\(_ch1StartOuterEnabled\(\)&&globalThis\.Ch1RotTrees\)Ch1RotTrees\.draw/);
});

test('offscreen placement and cleanup respect the whole logical view, including zoom and camera offset', () => {
  const c = vm.createContext({G:{cam:{x:4020,y:4000},_camZoom:1},VW:3840,VH:1080});
  vm.runInContext(fn('_outsideWorldView'), c);
  assert.equal(c._outsideWorldView(5800,4000,100), false);
  assert.equal(c._outsideWorldView(6100,4000,100), true);
  assert.equal(c._outsideWorldView(4020,4700,100), true);
  c.G._camZoom=.5;
  assert.equal(c._outsideWorldView(7020,4000,100), false);
  assert.equal(c._outsideWorldView(4020,5250,100), true);
  c.VW=1920;c.G._camZoom=1;
  assert.equal(c._outsideWorldView(6600,4000,100), true);
  assert.match(game, /if\(_outsideWorldView\(_lshX,_lshY,e\.r\+100\)&&canMv/);
  assert.match(game, /_cdx\*_cdx\+_cdy\*_cdy>6250000&&_outsideWorldView\(p\.x,p\.y,100\)/);
  assert.equal((game.match(/_cdx\*_cdx\+_cdy\*_cdy>6250000&&_outsideWorldView\(p\.x,p\.y,100\)/g)||[]).length, 2);
});
