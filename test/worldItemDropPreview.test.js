import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('drop preview query spawns isolated rarity samples only when explicitly enabled', async () => {
  const game = await readFile(path.join(rootDir, 'game.html'), 'utf8');

  assert.match(game, /const _DROP_PREVIEW=new URLSearchParams\(window\.location\.search\)\.get\('dropPreview'\)==='1';/);
  assert.match(game, /function _spawnWorldDropPreview\(\)/);
  assert.match(game, /\['weapon',EL\.F,1\],\['bow',EL\.I,2\],\['ring1',EL\.D,3\],\['armor',EL\.L,4\],\['helmet',EL\.H,5\]/);
  assert.match(game, /if\(_DROP_PREVIEW\)_spawnWorldDropPreview\(\);/);
  assert.match(game, /if\(_DROP_PREVIEW\)dbSave=async\(\)=>\{\};/);
});
