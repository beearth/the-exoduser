import test from 'node:test';
import assert from 'node:assert/strict';

import { buildPixelLabRequest } from '../src/pixellabProxy.js';

test('buildPixelLabRequest builds url, method, and auth header', () => {
  const req = buildPixelLabRequest({
    baseUrl: 'https://api.example.com/v1',
    apiKey: 'abc-123',
    path: '/images',
    method: 'POST',
    body: { prompt: 'hello' },
  });

  assert.equal(req.url, 'https://api.example.com/v1/images');
  assert.equal(req.init.method, 'POST');
  assert.equal(req.init.headers.Authorization, 'Bearer abc-123');
  assert.equal(req.init.headers['Content-Type'], 'application/json');
  assert.equal(req.init.body, JSON.stringify({ prompt: 'hello' }));
});

test('buildPixelLabRequest rejects unsafe path', () => {
  assert.throws(() => {
    buildPixelLabRequest({
      baseUrl: 'https://api.example.com/v1',
      apiKey: 'abc-123',
      path: 'images',
      method: 'GET',
    });
  }, /path must start with \//i);
});

test('buildPixelLabRequest rejects missing api key', () => {
  assert.throws(() => {
    buildPixelLabRequest({
      baseUrl: 'https://api.example.com/v1',
      apiKey: '',
      path: '/images',
      method: 'GET',
    });
  }, /api key/i);
});
