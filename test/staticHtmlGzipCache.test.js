import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const server = readFileSync(new URL('../server.cjs', import.meta.url), 'utf8');

test('gzip HTML is cached by the file version while asset streams stay available', () => {
  assert.match(server, /const GZIP_HTML_CACHE = new Map\(\);/);
  assert.match(server, /function gzipHtmlCached\(filePath, stat\) \{/);
  assert.match(server, /const _gzipCacheKey = stat\.size \+ ':' \+ Math\.floor\(stat\.mtimeMs\);/);
  assert.match(server, /if \(_gzip && _isHtml\) \{/);
  assert.match(server, /const _gzipBody = await gzipHtmlCached\(filePath, stat\);/);
  assert.match(server, /_h\['Content-Length'\] = _gzipBody\.length;/);
  assert.match(server, /const file200 = fs\.createReadStream\(filePath\);/);
});
