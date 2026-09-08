import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gameHtml = readFileSync(new URL('../game.html', import.meta.url), 'utf8');

function loadVolleySpec() {
  const start = gameHtml.indexOf('function _druidParryVolleySpec(');
  assert.ok(start >= 0, 'druid parry-volley spec must exist');
  const end = gameHtml.indexOf('\n}', start) + 2;
  assert.ok(end > start + 1, 'druid parry-volley spec must be complete');
  return Function(`${gameHtml.slice(start, end)};return _druidParryVolleySpec`)();
}

test('druid fire-devil barrage keeps phase scaling without a slow alternation mode', () => {
  const spec = loadVolleySpec();
  assert.deepEqual(spec(0, 0), { interval: 90, count: 5 });
  assert.deepEqual(spec(4, 1), { interval: 66, count: 9 });
  assert.deepEqual(spec(99, 2), { interval: 66, count: 9 });
});

test('druid cadence reuses the fire-devil comet profile and removes slow bean shots', () => {
  const start = gameHtml.indexOf('// [DRUID-PARRY-RHYTHM]');
  const end = gameHtml.indexOf('// [다크드루이드] orb 탄막', start);
  assert.ok(start >= 0 && end > start, 'druid parry rhythm integration block must exist');
  const block = gameHtml.slice(start, end);
  assert.match(block, /_spawnBossProjectile\(_dpvB,/);
  assert.match(block, /el:EL\.F/);
  assert.match(block, /col:'#66dd22'/);
  assert.match(block, /sz:2,r:10/);
  assert.match(block, /fireMagic:true,_typed:true/);
  assert.match(block, /'Q!'/);
  assert.match(block, /_druidParryVolley:true/);
  assert.doesNotMatch(block, /redBean:/);
  assert.doesNotMatch(block, /waterBean:/);
  assert.doesNotMatch(block, /blackBean/);
});

test('projectile pooling clears the druid volley marker before reuse', () => {
  const start = gameHtml.indexOf('function _resetProj(');
  const end = gameHtml.indexOf('\n}', start) + 2;
  assert.ok(start >= 0 && end > start, 'projectile reset function must exist');
  const reset = Function(`${gameHtml.slice(start, end)};return _resetProj`)();
  const projectile = { _druidParryVolley: true };
  reset(projectile);
  assert.equal(projectile._druidParryVolley, false);
});

test('druid parry volleys bypass the global one-in-three moving bullet drop', () => {
  const start = gameHtml.indexOf('function spawnProj(');
  const end = gameHtml.indexOf('function _recycleProj(', start);
  assert.ok(start >= 0 && end > start, 'spawnProj block must exist');
  const spawnBlock = gameHtml.slice(start, end);
  assert.match(spawnBlock, /if\(!p\._commit&&!p\._druidParryVolley\)/);
});

test('enemy fire comets render thirty-five percent smaller without changing their hitbox', () => {
  const start = gameHtml.indexOf('function _enemyMagicCometVisualScale(');
  assert.ok(start >= 0, 'enemy magic comet visual scaling helper must exist');
  const end = gameHtml.indexOf('\n}', start) + 2;
  const scaleFor = Function('EL', `${gameHtml.slice(start, end)};return _enemyMagicCometVisualScale`)({ F: 1 });

  assert.equal(scaleFor(1), 0.65, 'fire comets must render at 65% of their former size');
  assert.equal(scaleFor(3), 1, 'non-fire comet visuals must keep their existing size');
  assert.match(gameHtml, /_fSz\*2\.2\*_enemyMagicCometVisualScale\(_fEl\)/,
    'fast fire comets must use the same visual-only reduction');
  assert.match(gameHtml, /_normalMagicCometLength\(p\.sz\)\*_enemyMagicCometVisualScale\(_nEl\)/,
    'normal fire comets, including the druid volley, must use the reduction');
  const volleyStart = gameHtml.indexOf('// [DRUID-PARRY-RHYTHM]');
  const volleyEnd = gameHtml.indexOf('// [?ㅽ겕?쒕（?대뱶] orb ?꾨쭑', volleyStart);
  const volleyBlock = gameHtml.slice(volleyStart, volleyEnd);
  assert.match(volleyBlock, /sz:2,r:10/,
    'the druid input size and collision radius must remain unchanged');
});
