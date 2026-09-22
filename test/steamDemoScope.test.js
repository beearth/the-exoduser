import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const packageUrl = new URL('../package.json', import.meta.url);
const lobbyUrl = new URL('../index.html', import.meta.url);
const builderUrl = new URL('../build-nwjs.mjs', import.meta.url);

test('the Steam NW.js package starts the public demo lobby', async () => {
  const [pkgText, lobby, builder] = await Promise.all([
    readFile(packageUrl, 'utf8'),
    readFile(lobbyUrl, 'utf8'),
    readFile(builderUrl, 'utf8'),
  ]);
  const pkg = JSON.parse(pkgText);

  assert.equal(pkg.main, 'http://localhost:3333/index.html?demo=1');
  assert.match(lobby, /const _LOBBY_BUILD=location\.search\.includes\('demo'\)\?'demo':'full';/);
  assert.match(lobby, /const _demoParam=_LOBBY_BUILD==='demo'\?'&demo=1':'';/);
  assert.match(builder, /main: pkg\.main,/);
});