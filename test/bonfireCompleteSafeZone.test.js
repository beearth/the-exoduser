import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function sourceFunction(name) {
  const start = gameHtml.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `missing ${name}`);
  const bodyStart = gameHtml.indexOf('{', start);
  let depth = 0;
  for (let i = bodyStart; i < gameHtml.length; i++) {
    if (gameHtml[i] === '{') depth++;
    if (gameHtml[i] === '}' && --depth === 0) return gameHtml.slice(start, i + 1);
  }
  assert.fail(`unterminated ${name}`);
}

function loadFunction(name) {
  const source = sourceFunction(name);
  return Function(`${source}; return ${name};`)();
}

test('bonfire exclusion keeps the whole enemy body outside the visible barrier', () => {
  const pushOutside = loadFunction('_pushOutsideBonfire');
  const enemy = { x: 250, y: 0 };
  const moved = pushOutside(enemy, { x: 0, y: 0, r: 280, t: 300 }, 40);

  assert.equal(moved, true);
  assert.equal(enemy.x, 320);
  assert.equal(enemy.y, 0);
});

test('snake silhouettes use their full body reach as bonfire clearance', () => {
  const clearance = loadFunction('_bonfireEnemyClearance');

  assert.equal(clearance({ etype: 36, r: 20 }), 40, 'serpent apostle tail reaches 2r');
  assert.equal(clearance({ etype: 65, r: 20 }), 32, 'eel apostle body reaches 1.6r');
  assert.equal(clearance({ etype: 75, r: 20 }), 30, 'fire snake tail reaches 1.5r');
  assert.equal(clearance({ etype: 10, r: 20 }), 20, 'ordinary enemies use collision radius');
});

test('regular and independent snake movement both use the bonfire exclusion', () => {
  const enemyUpdate = gameHtml.slice(
    gameHtml.indexOf('// ── 화톳불 배리어 타이머 ──'),
    gameHtml.indexOf('// 오브젝트 풀 파티클 업데이트', gameHtml.indexOf('// ── 화톳불 배리어 타이머 ──')),
  );
  const wormLock = sourceFunction('_wmLockDest');
  const wormAppear = sourceFunction('_wmAppear');
  const wormTick = sourceFunction('_wmTick');

  assert.ok(
    enemyUpdate.match(/_pushOutsideBonfire\(e,_bf,_bonfireEnemyClearance\(e\)\)/g)?.length >= 2,
    'regular enemies must be excluded before and after AI movement',
  );
  assert.match(wormLock, /_pushOutsideBonfire\(w,G\._bonfire,75\)/);
  assert.match(wormAppear, /_pushOutsideBonfire\(w,G\._bonfire,75\)/);
  assert.match(wormTick, /_pushOutsideBonfire\(w,G\._bonfire,75\)/);
});
