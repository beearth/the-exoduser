import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

function expCurve(file) {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const start = source.indexOf('function _calcMaxExp(lv){');
  const end = source.indexOf('function addExp(', start);
  assert.ok(start >= 0 && end > start, `${file}: runtime EXP curve exists`);
  return new Function(`${source.slice(start, end)}; return _calcMaxExp;`)();
}

function restoreExp(file) {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const start = source.indexOf('function _restoreExpProgress(pd){');
  const end = source.indexOf('function dbRestore(', start);
  assert.ok(start >= 0 && end > start, `${file}: isolated legacy EXP migration exists`);
  const curve = expCurve(file);
  return new Function('_calcMaxExp', `${source.slice(start, end)}; return _restoreExpProgress;`)(curve);
}

function restorePlayerExp(file, player) {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const start = source.indexOf('function dbRestore(d){');
  const end = source.indexOf('// SP/AP:', start);
  assert.ok(start >= 0 && end > start, `${file}: common save restore exists`);
  const prefix = source.slice(start, end);
  const run = new Function('d', 'P', '_restoreExpProgress', 'CHAR_LIST', '_charIdx', '_loadCharAtlas',
    `${prefix} return {lv:P.lv,exp:P.exp,maxExp:P.maxExp}; } return dbRestore(d);`);
  return run(JSON.parse(JSON.stringify({charIdx: 0, player})), {}, restoreExp(file), [{}], 0, () => {});
}

for (const file of ['game.html', 'game-easy-test.html']) {
  test(`${file}: transcend EXP stays positive beyond signed 32-bit range`, () => {
    const curve = expCurve(file);
    assert.equal(curve(1000), 5_010_000);
    assert.equal(curve(1461), 2_139_440_000);
    assert.equal(curve(1462), 2_148_690_000);
    assert.equal(curve(1500), 2_515_010_000);
    assert.equal(JSON.parse(JSON.stringify({lv: 1462, maxExp: curve(1462)})).maxExp, 2_148_690_000);
  });

  test(`${file}: invalid legacy transcend EXP recovers without changing valid saves`, () => {
    const restore = restoreExp(file);
    assert.deepEqual(restore({lv: 1462, exp: -2146277297, maxExp: -2146277296}),
      {exp: 0, maxExp: 2_148_690_000});
    assert.deepEqual(restore({lv: 1462, exp: 100, maxExp: 2_148_690_000}),
      {exp: 100, maxExp: 2_148_690_000});
    assert.deepEqual(restore({lv: 10, exp: 12, maxExp: 44}),
      {exp: 12, maxExp: 44});
    assert.deepEqual(restorePlayerExp(file, {lv: 1462, exp: -2146277297, maxExp: -2146277296}),
      {lv: 1462, exp: 0, maxExp: 2_148_690_000});
    assert.deepEqual(restorePlayerExp(file, {lv: 1462, exp: 100, maxExp: 2_148_690_000}),
      {lv: 1462, exp: 100, maxExp: 2_148_690_000});
    assert.deepEqual(restorePlayerExp(file, {lv: 10, exp: 12, maxExp: 44}),
      {lv: 10, exp: 12, maxExp: 44});
  });
}
