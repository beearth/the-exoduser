import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function sliceBetween(src, startToken, endToken) {
  const start = src.indexOf(startToken);
  assert.ok(start >= 0, `missing ${startToken}`);
  const end = src.indexOf(endToken, start + startToken.length);
  assert.ok(end > start, `missing ${endToken} after ${startToken}`);
  return src.slice(start, end);
}

const tick = sliceBetween(gameHtml, 'function _fbTick(){', 'function _fbDraw(){');
const draw = sliceBetween(gameHtml, 'function _fbDraw(){', 'function _wmLockDest(w){');

test('first angler spawn starts hid with vanish reverse emerge, not the body sprite', () => {
  const spawn = tick.slice(tick.indexOf('if(!G._fbSpawned'), tick.indexOf('var fb=G._fieldBoss'));
  assert.match(spawn, /hid:1/);
  assert.match(spawn, /tpT:54/);
  assert.match(spawn, /spawnIn:1/);
  assert.match(spawn, /tpX:_sx,tpY:_sy/);
  assert.match(spawn, /return; \/\/ 같은 프레임 tpT 감소 방지/);
  assert.doesNotMatch(spawn, /hid:0/);
  assert.doesNotMatch(spawn, /tpT:0/);
});

test('spawn emerge skips old-location vanish and first-land smash', () => {
  assert.match(draw, /!fb\.spawnIn/);
  assert.match(tick, /fb\.spawnIn/);
  const land = tick.slice(tick.indexOf('if(fb.tpT===0)'), tick.indexOf('}else if(fb.tpCd>0)'));
  assert.match(land, /playVFXAng\('kraken_tp'/);
  assert.match(land, /_isSpawn|spawnIn/);
  assert.match(land, /if\(!_isSpawn\)|if\(!fb\.spawnIn\)|if\(!_isSpawn&&/);
});
