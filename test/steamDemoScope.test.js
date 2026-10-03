import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const packageUrl = new URL('../package.json', import.meta.url);
const lobbyUrl = new URL('../index.html', import.meta.url);
const builderUrl = new URL('../build-nwjs.mjs', import.meta.url);

test('Steam full package and public web demo have independent entrypoints', async () => {
  const [pkgText, lobby, builder] = await Promise.all([
    readFile(packageUrl, 'utf8'),
    readFile(lobbyUrl, 'utf8'),
    readFile(builderUrl, 'utf8'),
  ]);
  const pkg = JSON.parse(pkgText);

  assert.equal(pkg.main, 'http://localhost:3350/index.html');
  assert.ok(lobby.includes("const _LOBBY_BUILD=window.EXODUSER_BUILD_TARGET||'demo';"));
  assert.match(lobby, /const _demoParam=_LOBBY_BUILD==='demo'\?'&demo=1':'';/);
  assert.match(builder, /runtimeManifest\(pkg,release\)/);
});
test('public web entrypoints retain demo scope without a packaged full marker', async () => {
  const [lobby, game] = await Promise.all([
    readFile(lobbyUrl, 'utf8'),
    readFile(new URL('../game.html', import.meta.url), 'utf8'),
  ]);

  assert.ok(lobby.includes("const _LOBBY_BUILD=window.EXODUSER_BUILD_TARGET||'demo';"));
  assert.ok(game.includes("const _DEMO_MODE=(window.EXODUSER_BUILD_TARGET||'demo')==='demo';"));
  assert.match(await readFile(new URL('../build-target.js',import.meta.url),'utf8'),/\|\|'demo';/);
  assert.ok(game.includes("window.location.href=_DEMO_MODE?'/?lobby=1&demo=1':'/?lobby=1';"));
  assert.doesNotMatch(lobby, /const _LOBBY_BUILD=location\.search\.includes\('demo'\)/);
  assert.doesNotMatch(game, /const _DEMO_MODE=_BIC\|\|location\.search\.includes\('demo'\)/);
});
