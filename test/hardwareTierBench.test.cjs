const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function benchmarkFrom(file) {
  const html = readFileSync(path.join(__dirname, '..', file), 'utf8');
  const start = html.indexOf('function _benchTick(){');
  const end = html.indexOf('\nlet _gpuScoreCache=', start);
  assert.ok(start >= 0 && end > start, `${file}: benchmark source found`);
  let time = 0;
  const document = { hidden: false };
  const context = vm.createContext({
    document,
    performance: { now: () => time },
    localStorage: { getItem: () => 'saved' },
    OPT: { bloom: true },
    $: () => null,
    _applyTierPreset: () => { throw new Error('saved settings must stay untouched'); },
  });
  vm.runInContext(`let _benchDone=false,_benchFrames=[],_benchStart=0,_gpuScoreCache=4,_hwTier='?',_hwGPU='test';\n${html.slice(start, end)}`, context);
  return {
    tick(ms, hidden = false) {
      time += ms;
      document.hidden = hidden;
      vm.runInContext('_benchTick()', context);
    },
    state() {
      return vm.runInContext('({done:_benchDone,frames:_benchFrames.length,tier:_hwTier})', context);
    },
  };
}

function diagnosticFrom(file) {
  const html = readFileSync(path.join(__dirname, '..', file), 'utf8');
  const start = html.indexOf('function _updateDiagUI(){');
  const end = html.indexOf('\n// 진단 UI 갱신', start);
  assert.ok(start >= 0 && end > start, `${file}: diagnostic source found`);
  const ids = ['diagTier', 'diagGpu', 'diagGL', 'diagTierDesc', 'diagBenchFps'];
  const nodes = Object.fromEntries(ids.map(id => [id, { textContent: '', style: {}, offsetParent: {} }]));
  const context = vm.createContext({
    $: id => nodes[id],
    _T: text => text,
    _L: ko => ko,
    _benchDone: true,
    _benchFrames: [],
    _hwGPU: 'test GPU',
    _hwTier: 'A',
    _useGPU: false,
    _useGL: true,
  });
  vm.runInContext(`${html.slice(start, end)}\n_updateDiagUI()`, context);
  return nodes;
}

for (const file of ['game.html', 'game-easy-test.html']) {
  test(`${file}: hidden frames do not downgrade the hardware tier`, () => {
    const bench = benchmarkFrom(file);
    for (let i = 0; i < 5; i++) bench.tick(8);
    for (let i = 0; i < 20; i++) bench.tick(1000, true);
    assert.equal(bench.state().frames, 0, 'hidden frames must discard the partial sample');
    for (let i = 0; i < 120; i++) bench.tick(8);
    assert.equal(bench.state().done, true);
    assert.equal(bench.state().tier, 'S');
  });

  test(`${file}: an interrupted frame restarts the benchmark`, () => {
    const bench = benchmarkFrom(file);
    for (let i = 0; i < 20; i++) bench.tick(8);
    bench.tick(520);
    assert.equal(bench.state().frames, 0, 'a 520ms pause must discard the partial sample');
    for (let i = 0; i < 120; i++) bench.tick(8);
    assert.equal(bench.state().done, true);
    assert.equal(bench.state().tier, 'S');
  });

  test(`${file}: continuous slow frames still finish with tier C`, () => {
    const bench = benchmarkFrom(file);
    for (let i = 0; i < 120; i++) bench.tick(250);
    assert.equal(bench.state().done, true);
    assert.equal(bench.state().tier, 'C');
  });

  test(`${file}: a platform that skips the benchmark does not show zero FPS`, () => {
    const nodes = diagnosticFrom(file);
    assert.equal(nodes.diagTier.textContent, 'A');
    assert.equal(nodes.diagBenchFps.textContent, '벤치 미실시');
  });
}
