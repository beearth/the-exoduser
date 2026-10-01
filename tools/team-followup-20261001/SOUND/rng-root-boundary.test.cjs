const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const test = require('node:test');
const root = path.resolve(__dirname, '../../..');
function apply(source, diff) {
  const lines = source.split('\n');
  const hunks = diff.split(/(?=^@@ )/m).slice(1);
  for (const hunk of hunks.reverse()) {
    const [header, ...body] = hunk.trimEnd().split('\n');
    const m = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(header);
    assert(m);
    const old = body.filter(l => l[0] === '-' || l[0] === ' ').map(l => l.slice(1));
    const next = body.filter(l => l[0] === '+' || l[0] === ' ').map(l => l.slice(1));
    assert.deepEqual(lines.slice(+m[1] - 1, +m[1] - 1 + old.length), old);
    lines.splice(+m[1] - 1, old.length, ...next);
  }
  return lines.join('\n');
}
function make(source, options = {}) {
  const player = source.match(/^function playSample\([^\n]+\{[\s\S]*?^\}/m)[0];
  const randomizer = source.match(/^function _r\(v,s\).*$/m)[0];
  const trace = [], returns = [], queue = [{ key: 'existing', vol: .3, rate: .8 }];
  const state = { now: options.now ?? 1030, randomIndex: 0 };
  const math = Object.create(Math);
  math.random = () => { const value = [.11, .72, .33, .64][state.randomIndex++ % 4]; trace.push(['random', value]); return value; };
  const ctx = vm.createContext({
    Math: math, performance: { now() { trace.push(['now', state.now]); return state.now; } },
    _silvertailVoiceKey(k) { trace.push(['key', k]); return k === 'null-alias' ? null : k === 'alias' ? 'boss_howl' : k; },
    _gxVolMul: options.gx ?? 1,
    _isSkillSfx(k) { trace.push(['skill', k]); return k === 'skill'; },
    _isFootstepSfx(k) { trace.push(['foot', k]); return k === 'foot'; },
    _sfxLastT: { boss_howl: 1000, alias: 1000, missing: 1000, skill: 1000, foot: 1000 }, _sfxQueue: queue,
    SFX: { groggy() { trace.push(['groggy']); } },
    G: { stage: 0, _bossLoadPhase: options.phase ?? 0 }, si: 0,
    _bossSfx() { trace.push(['boss-key']); return options.hasBoss === false ? null : { howl: 'boss_howl', howlP: .7 }; },
    setTimeout(fn, ms) { trace.push(['timer', ms]); fn(); }
  });
  vm.runInContext(player + '\n' + randomizer, ctx);
  return {
    ctx, state,
    call(args) { returns.push(ctx.playSample(...args)); },
    seal() { const line = source.split('\n').find(l => l.includes('SFX.groggy();const _bsf=_bossSfx(si);')); vm.runInContext('{\n' + line + '\n}', ctx); },
    sourceBody(body) { vm.runInContext('{\n' + body + '\n}', ctx); },
    result() { return { trace: JSON.parse(JSON.stringify(trace)), returns, randomIndex: state.randomIndex, lastT: JSON.parse(JSON.stringify(ctx._sfxLastT)), queue: JSON.parse(JSON.stringify(queue)) }; }
  };
}
for (const file of ['game.html', 'game-easy-test.html']) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const diffName = file === 'game.html' ? 'rng-main.context.diff' : 'rng-easy.context.diff';
  const candidate = apply(source, fs.readFileSync(path.join(__dirname, diffName), 'utf8'));
  test(file + ': full player state/return/queue at key, volume, priority and 30ms boundaries', () => {
    let cases = 0;
    for (const key of [null, 'null-alias', 'alias', 'missing', 'skill', 'foot'])
      for (const gx of [1, .001]) for (const now of [1029, 1030, 1031]) for (const priority of [0, 1]) {
        const args = [key, .6, 0, priority];
        const before = make(source, { gx, now }); before.call(args); const a = before.result();
        for (const skip of [false, true]) {
          const after = make(candidate, { gx, now }); after.call([...args, skip]); const b = after.result();
          assert.deepEqual(b.trace, a.trace); assert.deepEqual(b.lastT, a.lastT);
          assert.deepEqual(b.returns, a.returns); assert.equal(b.randomIndex, a.randomIndex);
          assert.deepEqual(b.queue, skip ? [{ key: 'existing', vol: .3, rate: .8 }] : a.queue);
          cases++;
        }
      }
    assert.equal(cases, 144);
  });
  test(file + ': actual pitch randomizer and seal -> entrance -> phase-up preserve future state', () => {
    const entrance = source.match(/const _bsf=_bossSfx\(G.stage\);\n\s*playSample\(_bsf\?_bsf.howl:'boss_howl',1.0,[^\n]+/)[0];
    const phaseup = source.match(/SFX.groggy\(\);\n  const _pbsf=_bossSfx\(G.stage\);\n  setTimeout\(\(\)=>\{[\s\S]*?\},120\);/)[0];
    for (const hasBoss of [true, false]) for (const phase of [0, 2]) {
      const a = make(source, { phase, hasBoss, now: 2000 });
      const b = make(candidate, { phase, hasBoss, now: 2000 });
      a.seal(); b.seal();
      for (const h of [a, b]) {
        h.state.now = 5000; h.sourceBody(entrance);
        h.state.now = 6000; h.sourceBody(phaseup);
        h.state.now = 7000; h.call(['ordinary', .5, undefined, 0]);
      }
      const pre = a.result(), post = b.result();
      assert.deepEqual(post.trace, pre.trace); assert.deepEqual(post.lastT, pre.lastT);
      assert.equal(post.randomIndex, pre.randomIndex); assert.deepEqual(post.returns, pre.returns);
      assert.deepEqual(post.queue, phase === 2 ? [pre.queue[0], ...pre.queue.slice(2)] : pre.queue);
    }
  });
  test(file + ': sound loading absent is not invented as a new player gate', () => {
    const a = make(source), b = make(candidate);
    a.call(['missing', .6, .7]); b.call(['missing', .6, .7]);
    assert.deepEqual(b.result(), a.result()); assert.equal(b.result().queue.length, 2);
  });
}
