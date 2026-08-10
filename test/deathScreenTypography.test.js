import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('death screen typography follows the restrained gothic language of the gameplay HUD', async () => {
  const game = await readFile(path.join(rootDir, 'game.html'), 'utf8');
  assert.match(game, /\.dt\{[^}]*font-family:var\(--font-hell-title\)[^}]*font-size:clamp\(2rem,2\.9vw,2\.84rem\)[^}]*color:rgba\(218,210,193,\.94\)/);
  assert.match(game, /\.ds\{[^}]*font-family:var\(--font-hell\)[^}]*color:rgba\(198,184,158,\.82\)/);
  assert.match(game, /#dInfo\{[^}]*font-family:'Cinzel',var\(--font-hell\)[^}]*font-size:clamp\(\.92rem,1vw,1\.12rem\)/);
  assert.match(game, /\.retry\{[^}]*font-family:var\(--font-hell-title\)/);
  assert.match(game, /\.retry\{[^}]*border:1px solid rgba\(141,124,96,\.58\)/);
  assert.match(game, /<button class="retry retry-lobby" id="toLobbyBtn">로비로 돌아가기<\/button>/);
  assert.doesNotMatch(game, /\.retry\{[^}]*font-family:'Noto Sans KR'/);
});
