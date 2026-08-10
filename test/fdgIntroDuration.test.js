import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('matches the FDG intro transition to the trimmed three-point-two-second video', () => {
  assert.match(indexHtml, /const FDG_DUR=3200;/);
});
