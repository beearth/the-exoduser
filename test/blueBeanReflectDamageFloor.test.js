import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('reflected blue beans use a player-based minimum damage floor', () => {
  assert.match(
    gameHtml,
    /function pParryBlueBeanBase\(p\)\{return Math\.max\(p\.dmg,~~\(magicRef\(\)\*statInt\(\)\*pMagicMul\(\)\*0\.8\)\);\}/
  );
  const uses = gameHtml.match(/const _rBase=pParryBlueBeanBase\(p\);/g) || [];
  assert.equal(uses.length, 3);
});
