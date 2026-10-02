'use strict';

// Portable live-source test: tracked location is test/<this filename>.
// Candidate review selects an ignored input directory explicitly. No source edits.
// Runs the entire actual pure helper and the existing actual indicator IfStatement.
// X is a recording sink; full draw loop, pixels, culling, boss assets and native
// timing are not executed. Combat state/timers are synthetic inputs, not AI policy.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const {tokenizer} = require('acorn');
const inputDir = process.env.EXODUSER_WINDUP_INPUT_DIR || path.resolve(__dirname, '..');
const sha = text => crypto.createHash('sha256').update(text).digest('hex');

function actualBlock(html, marker) {
  assert.equal(html.split(marker).length - 1, 1, `unique contact ${marker}`);
  const start = html.indexOf(marker), lex = tokenizer(html.slice(start), {ecmaVersion: 'latest'});
  let depth = 0, entered = false, end = 0;
  for (;;) {
    const t = lex.getToken();
    assert.notEqual(t.type.label, 'eof', 'complete actual body');
    if (t.type.label === '{') {depth++; entered = true;}
    if (t.type.label === '}') depth--;
    if (entered && depth === 0) {end = start + t.end; break;}
  }
  return {text: html.slice(start, end), line: html.slice(0, start).split('\n').length};
}
function source(filename, dir = inputDir, suffix = '') {
  const html = fs.readFileSync(path.join(dir, filename + suffix), 'utf8');
  const helper = actualBlock(html, 'function _enemyWindupRemaining(e){');
  const renderer = actualBlock(html, 'if(_enemyWindupRemaining(e)>0){');
  // Inverse predicate is the historical original contact with the same body.
  const oldRenderer = renderer.text.replace('if(_enemyWindupRemaining(e)>0){', 'if(e._atkWindup>0){');
  return {filename, sha: sha(html), helper, renderer, oldRenderer};
}
const sources = ['game.html', 'game-easy-test.html'].map(file => source(file));
const literalSources = process.env.EXODUSER_WINDUP_LITERAL_DIR ?
  ['game.html', 'game-easy-test.html'].map(file => source(file, process.env.EXODUSER_WINDUP_LITERAL_DIR, '.literal')) : null;
console.log(JSON.stringify({kind: 'windup-indicator-source-sink', writesProduction: false,
  inputs: sources.map(s => ({file: s.filename, sha: s.sha, helper: {sha: sha(s.helper.text), line: s.helper.line},
    renderer: {sha: sha(s.renderer.text), line: s.renderer.line}})),
  boundary: 'whole actual helper + actual indicator branch; X sink; full draw/AI/native/pixels untested'}));

function fixture(s, useOldPredicate = false) {
  const draws = [], writes = [], state = {globalAlpha: .42};
  const X = new Proxy({fillText: (...args) => draws.push({args, state: {...state}})}, {
    get: (target, key) => key in target ? target[key] : state[key],
    set: (target, key, value) => {state[key] = value; writes.push([key, value]); return true;}});
  const ctx = vm.createContext({X, sa: .42});
  vm.runInContext(s.helper.text + '\nfunction observedIndicator(e){' +
    (useOldPredicate ? s.oldRenderer : s.renderer.text) + '\n}', ctx);
  return {ctx, draws, writes, state};
}
const base = () => ({alive: true, ib: false, s: 'windup', st2: 20, x: 25, y: 44, r: 14});
const rows = [
  ['positive', {}, 20], ['fractional', {st2: .5}, .5], ['zero', {st2: 0}, 0],
  ['negative', {st2: -1}, 0], ['NaN', {st2: NaN}, 0], ['Infinity', {st2: Infinity}, 0],
  ['undefined', {st2: undefined}, 0], ['non-number', {st2: '20'}, 0],
  ['idle', {s: 'idle'}, 0], ['recover', {s: 'recover'}, 0], ['attack', {s: 'attack'}, 0],
  ['stunned', {stunned: 1}, 0], ['frozen', {_frozen: 1}, 0], ['hitStun', {_hitStun: 1}, 0],
  ['dead', {alive: false}, 0], ['stale legacy flag in idle', {s: 'idle', _atkWindup: 99}, 0]
];
for (const s of sources) {
  for (const [name, overrides, remaining] of rows) {
    test(`${s.filename}: actual helper/indicator ${name}`, () => {
      const f = fixture(s), e = {...base(), ...overrides}, before = {...e};
      assert.equal(f.ctx._enemyWindupRemaining(e), remaining);
      f.ctx.observedIndicator(e);
      assert.deepEqual(e, before, 'display helper and branch mutate no entity data');
      assert.equal(f.draws.length, remaining > 0 ? 1 : 0);
      if (remaining > 0) {
        assert.deepEqual(f.draws[0], {args: ['❗', 25, 22], state: {
          globalAlpha: .9, fillStyle: '#ff4444', font: 'bold 16px "Noto Sans KR"', textAlign: 'center'}});
        assert.equal(f.state.globalAlpha, .42);
        const old = fixture(s, true);
        old.ctx.observedIndicator({...e, _atkWindup: remaining});
        assert.deepEqual(f.draws, old.draws, 'existing appearance body unchanged');
        assert.deepEqual(f.writes, old.writes);
      } else assert.deepEqual(f.writes, []);
    });
  }
  test(`${s.filename}: null entity returns zero and submits no indicator`, () => {
    const f = fixture(s); assert.equal(f.ctx._enemyWindupRemaining(null), 0);
    f.ctx.observedIndicator(null); assert.deepEqual(f.draws, []);
  });
  test(`${s.filename}: root nonboss guard preserves old boss zero-indicator boundary`, () => {
    const e = {...base(), ib: true}, live = fixture(s), old = fixture(s, true);
    assert.equal(live.ctx._enemyWindupRemaining(e), 0);
    live.ctx.observedIndicator(e); old.ctx.observedIndicator(e);
    assert.equal(live.draws.length, 0); assert.equal(old.draws.length, 0);
    if (literalSources) {
      const literal = fixture(literalSources.find(l => l.filename === s.filename));
      assert.equal(literal.ctx._enemyWindupRemaining(e), 20);
      literal.ctx.observedIndicator(e); assert.equal(literal.draws.length, 1);
    }
    // This is a synthetic source-sink policy boundary, not native boss coverage.
  });
}
