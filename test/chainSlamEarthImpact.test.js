import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('Chain Crush uses three forward fissures instead of shared pillar-like slam artwork', () => {
  assert.match(gameHtml, /halfW:36\+\(_csLv-1\)\*2/);
  assert.match(gameHtml, /maxT:32,hits:\[\],col:'#b9a58a',kind:'chainSlam'/);
  assert.match(gameHtml, /if\(w\.kind==='chainSlam'\)\{_drawChainSlamCleave\(w\);continue\}/);
  assert.doesNotMatch(gameHtml, /_isChainSlamHero/);
  assert.doesNotMatch(gameHtml, /playVFXAng\('chain_slam_impact',/);
});
