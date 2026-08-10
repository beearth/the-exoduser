import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('game-start dialogue uses the true viewport center on ultrawide displays', async () => {
  const game = await readFile(path.join(rootDir, 'game.html'), 'utf8');

  assert.match(game, /<div id="introText"[\s\S]*<div id="introTextPanel"[\s\S]*id="introTextKr"[\s\S]*id="introTextEn"/);
  assert.match(game, /#introText\s*\{[\s\S]*justify-content:\s*center[\s\S]*padding-left:\s*0/);
  assert.match(game, /#introTextPanel\s*\{[\s\S]*position:\s*relative[\s\S]*border-left:\s*none[\s\S]*border-right:\s*none[\s\S]*box-shadow:\s*none/);
  assert.match(game, /const msgKr=\$\('introTextKr'\),msgEn=\$\('introTextEn'\);[\s\S]*msgKr\.textContent=ln\.ko;msgEn\.textContent=ln\.en;/);
});

test('three-step start guide uses the true viewport center without a mobile override', async () => {
  const game = await readFile(path.join(rootDir, 'game.html'), 'utf8');

  assert.match(game, /<div id="introKeys"[\s\S]*<div class="intro-key-panel">/);
  assert.match(game, /#introKeys\s*\{[\s\S]*justify-content:\s*center[\s\S]*padding-left:\s*0/);
  assert.match(game, /#introDiff\s*\{[\s\S]*justify-content:\s*center[\s\S]*padding-left:\s*0/);
  assert.match(game, /\.intro-key-panel\s*\{[\s\S]*width:\s*min\(44vw,650px\)[\s\S]*border-left:\s*none[\s\S]*border-top:\s*none[\s\S]*border-bottom:\s*none/);
  assert.doesNotMatch(game, /\.intro-key-panel::before\s*\{\s*content:\s*['"]GUIDE['"]/);
  assert.match(game, /#ikTitle\s*\{[\s\S]*font-size:\s*clamp\(2rem,2\.9vw,2\.84rem\)/);
  assert.match(game, /#ikBody\s*\{[\s\S]*font-size:\s*clamp\(1\.45rem,1\.8vw,1\.8rem\)/);
  assert.match(game, /#ikHint\s*\{[\s\S]*font-size:\s*1rem/);
  assert.doesNotMatch(game, /@media\s*\(max-width:\s*760px\)\s*\{[^}]*#introText/s);
  assert.match(game, /if\(step<_INTRO_KEY_STEPS\.length-1\)\{[\s\S]*setTimeout\(\(\)=>_showIntroKeys\(step\+1\),350\)/);
});
