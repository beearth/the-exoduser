import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const server = readFileSync(new URL('../server.cjs', import.meta.url), 'utf8');

test('static non-HTML assets support ETag revalidation while HTML remains no-cache', () => {
  assert.match(server, /const _etag=.*stat\.size\.toString\(16\).*Math\.floor\(stat\.mtimeMs\)\.toString\(16\)/);
  assert.match(server, /if\(!_isHtml&&req\.headers\['if-none-match'\]===_etag\)\{/);
  assert.match(server, /res\.writeHead\(304, \{ 'Cache-Control': _cache, 'ETag': _etag \}\);/);
  assert.match(server, /_h\['ETag'\] = _etag;/);
  assert.match(server, /\? 'no-cache, no-store, must-revalidate'\n\s*: 'public, max-age=3600';/);
});
