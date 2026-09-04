import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function between(startMarker, endMarker) {
  const start = gameHtml.indexOf(startMarker);
  const end = gameHtml.indexOf(endMarker, start);
  assert.ok(start >= 0 && end > start, `${startMarker} block must exist`);
  return gameHtml.slice(start, end);
}

test('water blue-bean renders from the supplied 4x4 ice sheet', () => {
  const draw = between('function _drawWaterBean(', 'function _drawClassicRainbow(');
  assert.match(draw, /_drawWaterIceSheet\(p,fa,sSc,0\)/);
  assert.match(gameHtml, /const _WATER_ICE_SHEET_COLS=4,_WATER_ICE_SHEET_ROWS=4/);
  assert.match(gameHtml, /function _drawWaterIceSheet\(p,fa,sSc,row,progress=0\)/);
});

test('water blue-bean bursts into ice on Q parry and on player impact', () => {
  assert.match(gameHtml, /function _waterBeanIceBurst\(x,y,parried\)/);
  const burst = between('function _waterBeanIceBurst(', '// ═══ Dark 02 임팩트');
  assert.match(burst, /_addBoom\(x,y,parried\?96:72,parried\?72:66,parried\?'waterIceParry':'waterIceHit'\)/);

  const genericParry = between('// ══ 일반탄: 원래 좁은 범위로 판정', 'if(!_pHit&&p.friendly&&!_bigBall)');
  assert.match(genericParry, /const _waterBeanParry=!!p\.waterBean/);
  assert.match(genericParry, /if\(_waterBeanParry\)_waterBeanIceBurst\(p\.x,p\.y,true\)/);

  assert.match(gameHtml, /if\(p\.waterBean\)\{_waterBeanIceBurst\(p\.x,p\.y,false\);P\._freezeSlow=/);
});

test('water blue-bean uses row 3 for parry and row 4 for player-hit impacts', () => {
  assert.ok(existsSync(new URL('../assets/vfx/water_ice_barrage_sheet.png', import.meta.url)));
  assert.match(gameHtml, /if\(_bv\.col==='waterIceParry'\|\|_bv\.col==='waterIceHit'\)/);
  assert.match(gameHtml, /_drawWaterIceSheet\(\{x:bx,y:by\},_waterIceAlpha,_waterIceScale,_bv\.col==='waterIceParry'\?2:3,_ep\)/);
});
