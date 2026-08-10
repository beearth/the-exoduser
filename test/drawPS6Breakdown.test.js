import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('S6 spikes report pre-player effects, player rendering, and remaining weapon/overlay work separately', () => {
  assert.match(gameHtml, /var _s6PlayerStart=0,_s6PlayerEnd=0;/);
  assert.match(gameHtml, /_s6PlayerStart=performance\.now\(\);\n\s*\/\/ ══ PLAYER SPRITE/);
  assert.match(gameHtml, /_s6PlayerEnd=performance\.now\(\);\n\s*\/\/ ══ 쓰러짐 카운트다운 렌더/);
  assert.match(gameHtml, /if\(_dpT6>4\)console\.log\('\[S6-SUB\] prePlayer:'\+\(_s6PlayerStart-_dpS5\)\.toFixed\(1\)\+' player:'\+\(_s6PlayerEnd-_s6PlayerStart\)\.toFixed\(1\)\+' weapon\+overlay:'\+\(_dpS6-_s6PlayerEnd\)\.toFixed\(1\)\);/);
});
