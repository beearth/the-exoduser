import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('defines large monster death VFX helper', () => {
  assert.match(gameHtml, /function _spawnLargeMonsterDeathFx\(e,ang\)/);
});

test('triggers large monster death VFX during enemy death resolution', () => {
  assert.match(gameHtml, /_spawnLargeMonsterDeathFx\(e,_killAng\);/);
});
