import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function sliceBetween(src, startToken, endToken) {
  const start = src.indexOf(startToken);
  assert.ok(start >= 0, `missing ${startToken}`);
  const end = src.indexOf(endToken, start + startToken.length);
  assert.ok(end > start, `missing ${endToken} after ${startToken}`);
  return src.slice(start, end);
}

const tick = sliceBetween(gameHtml, 'function _wmTick(){', 'function _wmDraw(){');

test('CH1-1 곰치(지상뱀장어) are placed on the map, not gated behind 1500px travel', () => {
  assert.match(gameHtml, /const _WM_COUNT=4/);
  assert.match(gameHtml, /const _WM_SITES=\[\[70,160\],\[50,100\],\[155,70\],\[72,55\]\]/);
  assert.match(gameHtml, /const _WM_WAKE=1000/);
  assert.doesNotMatch(tick, /dst\(P\.x,P\.y,G\._wmEntryX[\s\S]{0,80}\)<1500/);
  assert.match(tick, /G\.stage===0/);
  assert.match(gameHtml, /asleep:asleep\?1:0/);
});

test('곰치 wake by approaching a home tile and emerge instead of staying buried', () => {
  assert.match(tick, /_WM_WAKE/);
  assert.match(tick, /_wmAppear\(w\)/);
  assert.match(tick, /w\.asleep/);
});
