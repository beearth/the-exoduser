import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('laser family tuning keeps base beam near whirlwind DPS and fusion beams stacked', () => {
  assert.match(gameHtml, /omniBeam:\{b:0\.332,g:0\.14\}/);
  assert.match(gameHtml, /const _beamDoHit=P\._beamHitFrame%4===0;/);
  assert.match(gameHtml, /const _beamTickDmgMul=2;/);
  assert.match(
    gameHtml,
    /const _dmgMul=_isElemBeam\?\(0\.5\+\(_emLv2-1\)\*\.06\)\*\(5\/6\):2\.5;/
  );
  assert.match(gameHtml, /const _branchHit=new Set\(\);/);
});

test('beam gear bonus is wired into laser formulas', () => {
  assert.match(gameHtml, /function pBeamMul\(\)\{return 1\+Math\.max\(0,\(hm\(\)\.beamDmg\|\|0\)\)\*0\.08\}/);
  assert.match(
    gameHtml,
    /const _beamDmgBase=magicRef\(\)\*statInt\(\)\*pMagicMul\(\)\*pBeamMul\(\)\*_skMul\('omniBeam'\)\*_fuseMul\('omniBeam'\);/
  );
});

test('stormBeam fusion lasers apply their declared global damage bonus', () => {
  assert.match(gameHtml, /const _sbMul=1\.2; \/\/ 20% 전체 강화/);
  assert.match(
    gameHtml,
    /const _sbDmgBase=~~\(magicRef\(\)\*statInt\(\)\*pMagicMul\(\)\*pBeamMul\(\)\*_skMul\('omniBeam'\)\*_fuseMul\('omniBeam'\)\*_sbMul\);/
  );
});
