import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('guides the player to detonate full rage with the Space rage skill', () => {
  const line = '분노가 찼어! 스페이스로 분노 스킬을 터뜨려!';
  const occurrences = gameHtml.match(new RegExp("'cat','" + line + "'", 'g')) || [];

  assert.equal(occurrences.length, 2);
  assert.match(gameHtml, /if\(P\.rage>=100\)_petSayCD\('rage_full'/);
  assert.match(gameHtml, /if\(P\.rage>=100\)_petBidCD\('rage_full2'/);
});
