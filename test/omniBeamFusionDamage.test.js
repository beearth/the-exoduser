import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('sixFuse luminescence beam targets about 1500% total DPS at level 1', () => {
  assert.match(gameHtml, /omniBeam:\{b:0\.083,g:0\.035\}/);
  assert.match(gameHtml, /const _beamDoHit=P\._beamHitFrame%2===0;/);
  assert.match(
    gameHtml,
    /const _dmgMul=_isElemBeam\?\(0\.5\+\(_emLv2-1\)\*\.06\):5(?:\.0+)?;/
  );
});
