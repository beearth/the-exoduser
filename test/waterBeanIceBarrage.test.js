import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function between(startMarker, endMarker) {
  const start = gameHtml.indexOf(startMarker);
  const end = gameHtml.indexOf(endMarker, start);
  assert.ok(start >= 0 && end > start, `${startMarker} block must exist`);
  return gameHtml.slice(start, end);
}

test('water blue-bean renders as a three-shard ice barrage', () => {
  const draw = between('function _drawWaterBean(', 'function _drawClassicRainbow(');
  assert.match(draw, /const shardCount=3/);
  assert.match(draw, /for\(let i=0;i<shardCount;i\+\+\)/);
  assert.match(draw, /#e9fbff/);
  assert.match(draw, /#4ca8ff/);
});

test('water blue-bean bursts into ice on Q parry and on player impact', () => {
  assert.match(gameHtml, /function _waterBeanIceBurst\(x,y,parried\)/);
  const burst = between('function _waterBeanIceBurst(', '// ═══ Dark 02 임팩트');
  assert.match(burst, /_addBoom\(x,y,parried\?96:72,parried\?72:66,'ice'\)/);

  const genericParry = between('// ══ 일반탄: 원래 좁은 범위로 판정', 'if(!_pHit&&p.friendly&&!_bigBall)');
  assert.match(genericParry, /const _waterBeanParry=!!p\.waterBean/);
  assert.match(genericParry, /if\(_waterBeanParry\)_waterBeanIceBurst\(p\.x,p\.y,true\)/);

  assert.match(gameHtml, /if\(p\.waterBean\)\{_waterBeanIceBurst\(p\.x,p\.y,false\);P\._freezeSlow=/);
});
