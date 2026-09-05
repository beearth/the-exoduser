import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const gameHtml = await readFile(new URL('../game.html', import.meta.url), 'utf8');

function updateEBody() {
  const start = gameHtml.indexOf('function updateE(e,sp){');
  const end = gameHtml.indexOf('// ─── [S16g] PET_UPD', start);
  assert.ok(start >= 0 && end > start, 'updateE body must be present');
  return gameHtml.slice(start, end);
}

test('bossRec recovery state returns the boss to idle instead of freezing AI', () => {
  const update = updateEBody();
  assert.match(update, /case['"]bossRec['"]\s*:\s*if\(e\.st2<=0\)\{e\.s\s*=\s*['"]idle['"]/,
    'bossRec must have an update path that reaches idle');
});
