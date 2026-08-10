import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const game = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('pooled player projectiles retain and clear one hit Set instead of recreating it on spawn', () => {
  assert.match(game, /_gwStk:0,_pierced:0,_hitSet:new Set\(\),_plagueTargets:null/);
  assert.match(game, /p\._gwStk=p\._pierced=0;p\._hitSet\.clear\(\);p\._plagueTargets=p\._lastPlagueE=null;/);
  assert.doesNotMatch(game, /_pp\._hitSet=new Set\(\)/);
  assert.match(game, /function _recyclePProj\(p\)\{if\(p\._hitSet\)p\._hitSet\.clear\(\);/);
});
