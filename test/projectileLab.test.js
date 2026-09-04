import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const serverCode = readFileSync(new URL('../server.cjs', import.meta.url), 'utf8');

test('projectile lab has a direct local-server entry point', () => {
  assert.match(serverCode, /pathname === '\/projectile-lab'/);
  assert.match(serverCode, /Location: '\/game\.html\?test=1&testchar=1&projectilelab=1'/);
});

test('projectile lab isolates one real projectile at a time and exposes the full parry taxonomy', () => {
  assert.match(gameHtml, /const _PROJECTILE_LAB=.*get\('projectilelab'\)==='1'/);
  assert.match(gameHtml, /function _projectileLabFire\(id\)/);
  assert.match(gameHtml, /function _projectileLabClear\(keepLab\)/);
  assert.match(gameHtml, /_labProjectile/);

  for (const [id, input] of [
    ['fireRed', 'Q'], ['physicalRed', 'E'], ['titanEye', 'E'],
    ['fireMagic', 'Q'], ['water', 'Q'], ['physical', 'E'],
    ['dark', 'Q'], ['mine', 'Q'], ['trap', 'Q'], ['blackBean', 'Q'],
  ]) {
    assert.match(gameHtml, new RegExp(`${id}:[\\s\\S]{0,360}input:'${input}'`),
      `${id} must visibly declare its expected input`);
  }
});

test('projectile lab UI is assembled with DOM nodes without replacing a parent tree', () => {
  const start = gameHtml.indexOf('// ═══ PROJECTILE LAB');
  assert.ok(start >= 0, 'projectile lab block must exist');
  const block = gameHtml.slice(start, gameHtml.indexOf('// ═══ PROJECTILE LAB END', start));
  assert.doesNotMatch(block, /\.innerHTML\s*=/,
    'the test panel must not replace a parent DOM tree with innerHTML');
  assert.match(block, /document\.createElement/);
  assert.match(block, /textContent/);
});

test('projectile lab always uses the standard 100-to-500px Q shield instead of a fusion Q override', () => {
  const start = gameHtml.indexOf('// ═══ PROJECTILE LAB');
  const end = gameHtml.indexOf('// ═══ PROJECTILE LAB END', start);
  const block = gameHtml.slice(start, end);

  assert.match(block, /P\._fused\.stormBeam=false/,
    'the all-fusions test character must not override Q with peaceShield in the projectile lab');
  assert.match(block, /P\.activeQSk='detonate'/,
    'the projectile lab must select the standard Q shield action explicitly');
});
