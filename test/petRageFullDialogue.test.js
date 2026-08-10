import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('guides the player to detonate full rage with the Space rage skill', () => {
  const line = '분노는 스페이스키 분노스킬로 폭발시킬 수 있어! 지금이야!!!';
  const occurrences = gameHtml.match(new RegExp(line, 'g')) || [];

  assert.equal(occurrences.length, 2);
  assert.match(gameHtml, /if\(P\.rage>=100\)_petSayCD\('rage_full'/);
  assert.match(gameHtml, /if\(P\.rage>=100\)_petBidCD\('rage_full2'/);
});
