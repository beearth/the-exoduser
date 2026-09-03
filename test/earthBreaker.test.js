import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('removed earthBreaker skill cannot re-enter the registry or dispatch path', () => {
  assert.doesNotMatch(gameHtml, /id:'earthBreaker'/);
  assert.doesNotMatch(gameHtml, /case 'earthBreaker':/);
  assert.doesNotMatch(gameHtml, /function activateEarthBreaker\(/);
  assert.doesNotMatch(gameHtml, /function _earthBreakerHitCount\(/);
  assert.doesNotMatch(gameHtml, /function _earthBreakerSplitDamage\(/);
});
