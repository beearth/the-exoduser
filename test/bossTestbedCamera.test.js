import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const gameHtml = readFileSync(join(repoRoot, 'game.html'), 'utf8');

test('bosstest keeps the player centered instead of moving the player to the boss', () => {
  const block = gameHtml.match(/const _btParam[\s\S]*?\},2000\);/i)?.[0] || '';
  assert.match(block, /_enterBossArena\(\);/);
  assert.match(block, /window\._btBoss\s*=\s*ens\.find\(e=>e\.ib\)/);
  assert.doesNotMatch(block, /P\.x\s*=\s*window\._btBoss\.x/);
  assert.match(gameHtml, /if\(!window\._btActive&&G\._bossRef&&G\._bossRef\.alive\)/);
  assert.match(gameHtml, /if\(!window\._btActive\)\{\s*if\(_mwPx<=VW\)/);
});
