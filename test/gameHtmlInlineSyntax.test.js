import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

test('every executable inline script in game.html has valid JavaScript syntax', () => {
  const scripts = html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi);
  let index = 0;
  for (const match of scripts) {
    index++;
    const attrs = match[1] || '';
    if (/\bsrc\s*=/.test(attrs)) continue;
    if (/type\s*=\s*["']?(?:importmap|application\/json|module)/i.test(attrs)) continue;
    assert.doesNotThrow(
      () => new vm.Script(match[2], { filename: `game-inline-${index}.js` }),
      `inline script ${index} must parse`,
    );
  }
});
