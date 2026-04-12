import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('parry grants +10 malice instead of +100', () => {
  assert.match(
    gameHtml,
    /function doParry[\s\S]*?G\.mats\+=10;addTxt\(P\.x,P\.y-60,_T\('👿악의\+10'\),'#cc44ff',40\);/
  );
  assert.doesNotMatch(
    gameHtml,
    /function doParry[\s\S]*?G\.mats\+=100;addTxt\(P\.x,P\.y-60,_T\('👿악의\+100'\),'#cc44ff',40\);/
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
