import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function extractFunction(name) {
  const startToken = `function ${name}(`;
  const start = gameHtml.indexOf(startToken);
  assert.ok(start >= 0, `missing ${name}`);
  let depth = 0;
  let bodyStarted = false;
  for (let i = start; i < gameHtml.length; i++) {
    if (gameHtml[i] === '{') {
      depth++;
      bodyStarted = true;
    } else if (gameHtml[i] === '}') {
      depth--;
      if (bodyStarted && depth === 0) return gameHtml.slice(start, i + 1);
    }
  }
  assert.fail(`unterminated ${name}`);
}

function loadPureFunction(name) {
  const source = extractFunction(name);
  return Function(`"use strict"; ${source}; return ${name};`)();
}

test('death blood animation scales continuously with monster radius', () => {
  const scaleFor = loadPureFunction('_deathBloodScale');
  const radii = [8, 10, 12, 18, 30, 56, 120];
  const scales = radii.map(scaleFor);

  for (let i = 1; i < scales.length; i++) {
    assert.ok(scales[i] > scales[i - 1], `r=${radii[i]} must exceed r=${radii[i - 1]}`);
  }
  assert.ok(scales[0] >= 0.8, 'small deaths must remain visible');
  assert.ok(scales.at(-1) <= 4.8, 'largest deaths must stay bounded');

  const deathFx = extractFunction('deathFX');
  assert.match(deathFx, /_deathBloodScale\(r\)/);
  assert.doesNotMatch(deathFx, /r>20\?2\.1/);
});

test('death impact scales continuously with the original monster radius', () => {
  const sizeFor = loadPureFunction('_deathImpactSize');
  const radii = [8, 10, 12, 18, 30, 56, 120];
  const sizes = radii.map(sizeFor);

  for (let i = 1; i < sizes.length; i++) {
    assert.ok(sizes[i] > sizes[i - 1], `r=${radii[i]} must exceed r=${radii[i - 1]}`);
  }
  assert.deepEqual(sizes, [24, 30, 36, 54, 90, 168, 240]);

  const impact = extractFunction('_addDeathImpact');
  assert.match(impact, /_deathImpactSize\(r\)/);

  const fieldDeath = extractFunction('_fmDeathFx');
  assert.match(fieldDeath, /_addDeathImpact\(p\.x,p\.y,r\)/);
  assert.doesNotMatch(fieldDeath, /Math\.min\(32,r\*\.28\)/);
});
