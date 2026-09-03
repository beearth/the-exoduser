import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function extractFunction(name) {
  const start = gameHtml.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} must exist`);
  const bodyStart = gameHtml.indexOf('{', start);
  let depth = 0;
  for (let i = bodyStart; i < gameHtml.length; i++) {
    if (gameHtml[i] === '{') depth++;
    else if (gameHtml[i] === '}' && --depth === 0) return gameHtml.slice(start, i + 1);
  }
  assert.fail(`${name} must have a complete body`);
}

test('skill assignment popup uses the same PNG icon resolver as the quick slots', () => {
  const popup = extractFunction('_openSkillSlotPop');

  assert.match(popup, /const _dispIcon=_skIcon\(sk\.id\)/);
  assert.match(popup, /class="sk-opt-icon"/);
  assert.doesNotMatch(popup, /_dispEmoji=_fId2\?'⚡'/);
});

test('skill assignment popup gives resolved PNG icons a stable square frame', () => {
  assert.match(gameHtml, /\.sk-opt-icon\{[^}]*width:48px;[^}]*height:48px;/);
  assert.match(gameHtml, /\.sk-opt-icon img\{[^}]*width:100%;[^}]*height:100%;[^}]*object-fit:contain;/);
});

test('skill names remain on one line beside the wider PNG icon frame', () => {
  assert.match(gameHtml, /\.sk-opt-name\{[^}]*white-space:nowrap;/);
});
