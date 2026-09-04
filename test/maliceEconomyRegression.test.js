import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('parry grants 1000 base malice and applies the optional resource multiplier', () => {
  assert.match(
    gameHtml,
    /function doParry\(_inDmg,_px,_py,_forceQ,_parryEl,_resourceMul,_impactKind\)[\s\S]*?const _matsAdd=\(_isRedParry\?500:_isRainbowParry\?2000:1000\)\*_resourceBonus;[\s\S]*?G\.mats\+=_matsAdd;/
  );
  assert.match(
    gameHtml,
    /function _resolveBigEnergyParry[\s\S]*?const _bigResourceMul=10;[\s\S]*?doParry\(totalDmg,p\.x,p\.y,true,p\.el,_bigResourceMul\);/
  );
});

test('shared mats migration uses max sync, not additive merge', () => {
  assert.match(
    gameHtml,
    /const _savedMats=Math\.max\(0,Math\.floor\(\+d\.game\.mats\|\|0\)\);/
  );
  assert.match(
    gameHtml,
    /if\(_savedMats>0&&_savedMats!==_sharedMats\)\{_saveSharedMats\(Math\.max\(_sharedMats,_savedMats\)\);d\.game\.mats=0\}/
  );
  assert.doesNotMatch(gameHtml, /_saveSharedMats\(_sharedMats\+_savedMats\)/);
});
