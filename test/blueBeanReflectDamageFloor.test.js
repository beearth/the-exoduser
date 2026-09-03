import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('reflected blue beans use a player-based minimum damage floor', () => {
  assert.match(
    gameHtml,
    /function pParryProjDmg\(bulletDmg,isQ\)\{[\s\S]*?const _kiFloor=~~\(meleeRef\(\)\*14\*statStr\(\)\*pAtkMul\(\)\);return Math\.max\(_calc,_kiFloor\);\}/
  );
  const uses = gameHtml.match(/pParryProjDmg\(p\.dmg,(?:true|false|_sbPW)\)/g) || [];
  assert.ok(uses.length >= 12);
  assert.doesNotMatch(gameHtml, /function pParryBlueBeanBase\(/);
});
