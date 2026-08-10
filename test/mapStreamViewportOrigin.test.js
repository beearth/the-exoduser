import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('streamed viewport canvas stays at the world origin used when it was composed', () => {
  assert.match(gameHtml, /const _offX=_drawX,_offY=_drawY;/);
  assert.match(gameHtml, /if\(_streamVpCvs\)\{X\.drawImage\(_streamVpCvs,_streamVpWorldX\|0,_streamVpWorldY\|0\)\}/);
});

test('stream viewport cache refreshes before its two-tile safety margin is exhausted', () => {
  assert.match(gameHtml, /const _vpMoved=Math\.abs\(_streamVpWorldX-_drawX\)>T\*1\|\|Math\.abs\(_streamVpWorldY-_drawY\)>T\*1;/);
});
