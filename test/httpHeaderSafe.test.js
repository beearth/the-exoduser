import test from 'node:test';
import assert from 'node:assert/strict';
import { toSafeHeaderValue } from '../src/httpHeaderSafe.js';

test('keeps ASCII header value as-is', () => {
  const value = 'C:/project/game.html';
  assert.equal(toSafeHeaderValue(value), value);
});

test('encodes non-ASCII header value for HTTP headers', () => {
  const value = 'C:\\Users\\심도진\\Desktop\\hell\\game.html';
  const safe = toSafeHeaderValue(value);
  assert.equal(safe, encodeURIComponent(value));
  assert.match(safe, /^[\x20-\x7E]*$/);
});
