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

test('Spike Trap slow is increased by about 30 percent while staying a slow, not a stun', () => {
  const slow = Function(`${extractFunction('_spikeTrapSlowPct')};return _spikeTrapSlowPct` )();
  assert.equal(slow(1), 0.91);
  assert.equal(slow(10), 0.95);
});

test('Spike Trap damage is reduced to half of its current formula', () => {
  const damage = Function(
    'magicRef', 'statInt', 'pMagicMul', '_skMul',
    `${extractFunction('_spikeTrapDmg')};return _spikeTrapDmg`
  )(() => 2, () => 100, () => 1, () => 10);
  assert.equal(damage(1), 1000);
});
