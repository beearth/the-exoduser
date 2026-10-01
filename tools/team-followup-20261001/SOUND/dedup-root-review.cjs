// Static source-fragment regression. Never writes production files or plays audio.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../../..');
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const results = [];
const sources = [];
const replacement = "  SFX.groggy();const _bsf=_bossSfx(si);const _sealKey=_bsf?_bsf.howl:(Math.random()<.5?'boss_howl':'boss_howl1');const _sealRate=_r(_bsf?_bsf.howlP:.8,.15);if(G._bossLoadPhase!==2)playSample(_sealKey,.6,_sealRate); // 보스 포효";
function run(body, phase, hasBoss, rateSource) {
  const calls = [], timers = [];
  let rng = 0, groggy = 0, lookup = 0;
  const math = Object.create(Math); math.random = () => { rng++; return .25; };
  const G = { _bossLoadPhase: phase, stage: 0 }, before = JSON.stringify(G);
  const context = { G, si: 0, Math: math,
    SFX: { groggy() { groggy++; } },
    _bossSfx() { lookup++; return hasBoss ? { howl: 'custom_howl', howlP: .7 } : null; },
    playSample(...args) { calls.push(args); },
    setTimeout(fn, ms) { timers.push(ms); fn(); } };
  vm.runInNewContext(rateSource + '\n' + body, context);
  assert.equal(JSON.stringify(G), before);
  return { calls, timers, rng, groggy, lookup };
}
for (const file of ['game.html', 'game-easy-test.html']) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const lines = source.split('\n');
  const matching = lines.filter(line => line.includes('SFX.groggy();const _bsf=_bossSfx(si);'));
  assert.equal(matching.length, 1);
  const original = matching[0], index = lines.indexOf(original);
  const rateSource = lines.find(line => line.startsWith('function _r(v,s)'));
  assert(rateSource);
  const entranceIndex = lines.findIndex(line => line.includes("playSample(_bsf?_bsf.howl:'boss_howl',1.0,"));
  const entrance = lines.slice(entranceIndex - 1, entranceIndex + 1).join('\n');
  assert(entrance.includes('const _bsf=_bossSfx(G.stage)'));
  const phaseupIndex = lines.findIndex(line => line.includes('const _pbsf=_bossSfx(G.stage)'));
  const phaseup = lines.slice(phaseupIndex - 1, phaseupIndex + 5).join('\n');
  assert(phaseup.startsWith('  SFX.groggy();') && phaseup.endsWith('},120);'));
  assert(source.includes('G._bossLoadPhase=0;G._bossLoadT=0;G._bossLoadFade=0;G.stageCleared=false;'));
  assert(!source.includes('_sealKey') && !source.includes('_sealRate'));
  for (const hasBoss of [true, false]) {
    for (const phase of [2, 0, undefined]) {
      const pre = run(original, phase, hasBoss, rateSource);
      const post = run(replacement, phase, hasBoss, rateSource);
      assert.equal(post.groggy, pre.groggy); assert.equal(post.lookup, pre.lookup);
      assert.equal(post.rng, pre.rng, 'preserve explicit audio random draws');
      if (phase === 2) assert.equal(post.calls.length, 0);
      else assert.deepEqual(post.calls, pre.calls);
      results.push({ file, phase: phase ?? 'undefined', hasBoss, status: 'PASS', randomDraws: post.rng });
    }
    const sealPre = run(original, 2, hasBoss, rateSource);
    const sealPost = run(replacement, 2, hasBoss, rateSource);
    const enter = run(entrance, 4, hasBoss, rateSource);
    assert.equal(sealPre.calls.length + enter.calls.length, 2);
    assert.equal(sealPost.calls.length + enter.calls.length, 1);
    const up = run(phaseup, 0, hasBoss, rateSource);
    assert.equal(up.calls.length, 1); assert.equal(up.calls[0][1], .8); assert.deepEqual(up.timers, [120]);
    results.push({ file, hasBoss, status: 'PASS', sourceFragments: 'normal door 2->1; entrance volume1; phase-up volume.8 delay120 preserved' });
    const submitted = original.replace('SFX.groggy();const _bsf=', 'SFX.groggy();if(G._bossLoadPhase!==2){const _bsf=').replace('; //', ';} //');
    assert.equal(run(submitted, 2, hasBoss, rateSource).rng, 0);
    assert(sealPre.rng > 0, 'submitted outer guard skips original random draws');
  }
  const candidate = source.replace(original, replacement);
  const contextBefore = lines.slice(index - 1, index + 2);
  const diff = `--- a/${file}\n+++ b/${file}\n@@ -${index},3 +${index},3 @@\n ${contextBefore[0]}\n-${original}\n+${replacement}\n ${contextBefore[2]}\n`;
  fs.writeFileSync(path.join(__dirname, file === 'game.html' ? 'dedup-main.root.diff' : 'dedup-easy.root.diff'), diff);
  assert(source.includes('rate=rate*(0.92+Math.random()*0.16)'));
  sources.push({ file, sourceSha256: sha(source), candidateSha256: sha(candidate), line: index + 1,
    rateSource, entrance, phaseup, changedLines: 1,
    playSampleInternalRandomSource: 'rate=rate*(0.92+Math.random()*0.16)',
    remainingGate: 'Suppressing playSample can skip its gated internal random draw; global RNG equivalence is unverified.' });
  assert.equal(fs.readFileSync(path.join(root, file), 'utf8'), source);
}
const evidence = { status: 'STATIC_SOURCE_CANDIDATE', sources, results,
  limits: ['Source fragments only; full arena/map/game not executed.', 'Retry reset verified in source; retry arena was not executed.', 'Explicit pitch/key random draws preserved; playSample internals not executed.', 'No real audio, production application, NW or visual acceptance.', 'Root patch preserves explicit key/pitch draws only. playSample has another gated Math.random; global RNG/combat trace equivalence is UNVERIFIED. Production acceptance withheld.'] };
fs.writeFileSync(path.join(__dirname, 'dedup-root-evidence.json'), JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify({ checks: results.length, status: evidence.status, productionUnchanged: true }));
