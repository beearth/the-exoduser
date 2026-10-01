import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { sources, files, functionSource, expression, noop, dst, sha } from './source.mjs';

// Full updateE is executed unchanged. Only external geometry, rendering and sound
// services are stubbed explicitly; missing dependencies throw rather than auto-noop.
function setup(source, etype, state = 'idle') {
  const calls = { edge: [], charged: [], contact: [] };
  const math = Object.create(Math); math.random = () => 0.5;
  const env = {
    Math: math, window: {}, P: { x: 0, y: 0, r: 12, iframes: 0, s: 'idle' },
    G: { rifts: [], atkTickets: 0, maxAtkTickets: 3, stage: 0 },
    dst, _canMvTile: () => true, canMv: () => true, isW: () => false,
    hasLOS: () => true, _ffDir: () => null, _ffMoveE: noop,
    _mSfxPlaying: 3, _ETYPE_SFX: {}, _ARCH_SFX: {},
    _isDruidFinale: () => false, _druidFinaleUpdate: () => false,
    shQuery: () => [], addParts: noop, addTxt: noop, playSample: noop,
    _T: x => x, SFX: {}, EL: { P: 0, D: 1, I: 2, F: 3 }, ELC: ['white'],
    _eMouthXY: e => ({ x: e.x, y: e.y }),
    _spawnBossProjectile: (_e, shot) => calls.edge.push(shot),
    spawnProj: shot => calls.charged.push(shot), hurtP: value => calls.contact.push(value)
  };
  env.ETYPE_RANGE = evaluateArray(source, 'const ETYPE_RANGE=');
  assert.ok(source.includes('atkTickets:0,maxAtkTickets:3'), 'ANCHOR_FAIL actual initial ticket counters');
  const excluded = expression(source, 'function updateE('); // Fail if actual function disappears.
  assert.ok(excluded.code.includes('switch(e.s)'));
  const noProj = source.match(/window\._noProjEtypes=(\{[^;]+\});/);
  assert.ok(noProj, 'ANCHOR_FAIL actual projectile exclusion map');
  env._noProjEtypes = new Function('return ' + noProj[1])();
  const context = vm.createContext(env);
  for (const name of ['atkTicketRequest', 'atkTicketRelease', '_cancelProjCharge', '_fireChargedProj', '_tickProjCharge', 'updateE'])
    vm.runInContext(functionSource(source, name), context);
  const enemy = { etype, s: state, st2: state === 'windup' ? 1 : 0,
    x: 20, y: 0, r: 14, speed: 0, kb: { x: 0, y: 0 }, hp: 875, mhp: 875,
    poise: 100, maxPoise: 100, baseAtk: 30, atk: 30, alive: true, ib: false,
    el: 0, col: 'white', mods: [], elite: 0, _alerted: true,
    _aAtkM: 1, _aSpdM: 1, projCd: 240, projT: 0 };
  return { enemy, calls, env, step: sp => context.updateE(enemy, sp) };
}
function evaluateArray(source, anchor) {
  const offset = source.indexOf(anchor);
  assert.ok(offset >= 0, 'ANCHOR_FAIL ' + anchor);
  const text = source.slice(offset + anchor.length);
  const node = expression('function tmp(){return ' + text.slice(0, text.indexOf(';')) + ';}', 'function tmp(');
  return new Function('return (' + node.code + ')()')();
}

for (const file of files) {
  const source = sources[file];
  test(`${file}: actual updateE windup→attack→recover edge (induced entry, not natural attack proof)`, () => {
    const evidence = [];
    for (const etype of [0, 3]) for (const sp of [0.25, 0.5, 1, 1.5, 2, 3, 4, 6]) {
      const run = setup(source, etype, 'windup');
      run.enemy.projT = 9999;
      let ticks = 0;
      while (run.enemy.s !== 'recover' && ticks++ < 1000) run.step(sp);
      assert.equal(run.enemy.s, 'recover');
      assert.equal(run.calls.edge.length, etype === 3 ? 0 : 1);
      evidence.push({ etype, sp, shots: run.calls.edge.length, ticks });
    }
    console.log(JSON.stringify({ file, sha: sha(source), inducedEdge: evidence }));
  });
  test(`${file}: etype3 natural idle path can fire via charged projectile (not an attackless enemy)`, () => {
    const run = setup(source, 3);
    const states = new Set();
    for (let i = 0; i < 301; i++) { run.step(1); states.add(run.enemy.s); }
    assert.ok(run.calls.charged.length > 0, 'actual idle→charge→_fireChargedProj must emit');
    assert.equal(run.calls.edge.length, 0);
    assert.equal(run.calls.contact.length, 0);
    console.log(JSON.stringify({ file, natural: { states: [...states], charged: run.calls.charged.length,
      edge: run.calls.edge.length, contact: run.calls.contact.length } }));
  });
  test(`${file}: existing eCircle→windup path preserves etype3 latent edge omission`, () => {
    const run = setup(source, 3, 'eCircle');
    run.enemy.projT = 9999;
    const states = new Set();
    for (let i = 0; i < 100 && run.enemy.s !== 'recover'; i++) { run.step(1); states.add(run.enemy.s); }
    assert.ok(states.has('windup') && states.has('attack') && states.has('recover'));
    assert.equal(run.calls.edge.length, 0);
    console.log(JSON.stringify({ file, inducedCircle: { states: [...states], edge: run.calls.edge.length } }));
  });
}
