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

test('dark sphere has a fixed violet identity and never uses the rainbow renderer', () => {
  const darkSphere = between('// ── 암흑 구체 (Q 전용):', '// ── 물속성 파란콩:');
  assert.match(darkSphere, /if\(p\.gbBean\)\{\s*_drawDarkSphere\(p,fa,_sSc\);continue;\s*\}/);
  assert.doesNotMatch(darkSphere, /_drawClassicRainbow/);

  const roll = between('function _beanRoll(', '// 몬스터 입 오프셋');
  assert.match(roll, /gbBean:true/);
  assert.match(roll, /el:EL\.D,col:'#a44cff'/,
    'the dedicated dark sphere spawn must be dark-element violet, never ice-green');
});

test('rainbow visuals belong only to the dedicated blackBean projectile', () => {
  const rainbow = between('// ── 무지개탄:', '// ── 블루콩:');
  assert.match(rainbow, /if\(p\.blackBean\)\{\s*_drawClassicRainbow\(p,fa,_sSc\);continue;\s*\}/);
});

test('large energy projectiles retain one source element instead of an all-element identity', () => {
  const elemMove = between("case'elemBall':{", "case'swordWave':{");
  assert.match(elemMove, /el:e\.el/);
  assert.doesNotMatch(elemMove, /_allEl/);

  const anglerEnergy = between('function _fbFireEnergy(', 'function _fbClear(');
  assert.match(anglerEnergy, /el:fb\.el/);
  const fireEnergy = between('function _fdFireEnergy(', 'function _fdDrawFly(');
  assert.match(fireEnergy, /el:EL\.F/);
});
