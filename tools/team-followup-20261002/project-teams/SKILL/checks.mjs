// 생산 인수 전: checks.mjs --record / 인수 후: checks.mjs --require-production --record
// 생산 파일은 읽기만 한다. --record만 같은 폴더의 evidence.json을 갱신한다.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const files = ['game.html', 'game-easy-test.html'];
const patchPath = 'tools/team-followup-20261002/combat-review/mortar-integration-targets.patch';
const frozenPath = 'tools/team-followup-20261001/SKILL/mortar-confirm-source-before.txt';
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const startedAtUTC = new Date().toISOString();
const head = git(['rev-parse', 'HEAD']);
const statusCount = () => git(['status', '--short', '--untracked-files=all']).split('\n').filter(Boolean).length;
const startChanges = statusCount();
const checks = [], observations = [], provenance = {};
const indexPath = path.join(root, '.git/index');
const indexBefore = hash(fs.readFileSync(indexPath));
const protectedFiles = [...files, 'server.cjs', 'node-main.js', 'index.html', 'ui-panels.js',
  'tools/team-followup-20261002/project-teams/SKILL/task.md', patchPath, frozenPath];
const protectedBefore = Object.fromEntries(protectedFiles.map(rel => [rel, hash(fs.readFileSync(path.join(root, rel)))]));
const check = (name, execute) => {
  try { execute(); checks.push({ name, status: 'PASS' }); }
  catch (error) { checks.push({ name, status: 'FAIL', message: String(error) }); }
};

function fn(source, name) {
  const marker = 'function ' + name + '(';
  const start = source.indexOf(marker);
  assert.ok(start >= 0, 'missing ' + name);
  assert.equal(source.indexOf(marker, start + marker.length), -1, 'ambiguous ' + name);
  const line = source.slice(start, source.indexOf('\n', start));
  if (line.includes('}')) return line;
  const end = source.indexOf('\n}', start);
  assert.ok(end > start, 'missing close ' + name);
  return source.slice(start, end + 2);
}
function obj(source, name) {
  const start = source.indexOf('const ' + name + '={');
  const end = source.indexOf('\n};', start);
  assert.ok(start >= 0 && end > start, 'missing ' + name);
  return source.slice(start, end + 3);
}
function slices(source) {
  const start = source.indexOf("case 'maliceMortar':");
  const end = source.indexOf("case 'boneWall':", start);
  const comment = source.indexOf('// ═══ 폭풍소환 — 조준');
  const confirmStart = source.indexOf('if(P._mmAiming){', comment);
  const confirmEnd = source.indexOf('// ═══ 벽소환', confirmStart);
  assert.ok(start >= 0 && end > start && comment >= 0 && confirmStart > comment && confirmEnd > confirmStart);
  return {
    aim: source.slice(start + "case 'maliceMortar':".length, end).trimEnd(),
    confirm: source.slice(confirmStart, confirmEnd).trimEnd(),
    fire: fn(source, 'fireMaliceMortar'),
    costs: ['_COST_BASE', '_COST_SK', '_COST_DPS'].map(name => obj(source, name)).join('\n') + '\n' +
      ['_skLv', '_dpsCostMul', 'pMagicCost', 'mpCost', 'useMp', '_r'].map(name => fn(source, name)).join('\n')
  };
}
const frozen = fn(read(frozenPath), 'fireMaliceMortar');
const patch = read(patchPath);
const guards = files.map(file => {
  const start = patch.indexOf('--- a/' + file + '\n');
  const end = patch.indexOf('--- a/', start + 1);
  assert.ok(start >= 0, 'missing patch target ' + file);
  const lines = patch.slice(start, end < 0 ? undefined : end).split('\n');
  assert.equal(lines[1], '+++ b/' + file);
  assert.equal(lines.filter(line => line.startsWith('@@')).length, 1);
  assert.equal(lines.filter(line => line.startsWith('-') && !line.startsWith('---')).length, 0);
  const added = lines.filter(line => line.startsWith('+') && !line.startsWith('+++'));
  assert.equal(added.length, 1, 'reuse exactly one existing added line');
  return '\n' + added[0].slice(1);
});
assert.equal(guards[0], guards[1]);
const guard = guards[0];
const signature = 'function fireMaliceMortar(_tx,_ty){';
const candidate = frozen.replace(signature, signature + guard);
function mode(fire) {
  if (fire === frozen) return 'unapplied';
  if (fire === candidate) return 'applied';
  throw new Error('fireMaliceMortar drift: frozen/approved candidate byte mismatch; root review required');
}
function acceptanceFire(fire, requireProduction = false) {
  const currentMode = mode(fire);
  if (requireProduction) assert.equal(currentMode, 'applied', 'production guard is still unapplied');
  return currentMode === 'applied' ? fire : candidate;
}

// 실제 aim/confirm/fire/cost/_r를 VM에서 실행한다. 아래 외부 환경만 fixture다.
function rig(source, fire, config = {}, fused = false, randomValues = [0.2]) {
  const side = { random: [], magic: [], sample: [], shake: [], messages: [] };
  const discount = { passive: config.passive || 0, affix: config.affix || 0, unique: config.unique || 0 };
  const P = { x: 10, y: 20, facing: 0.4, mp: 9999,
    skills: { maliceMortar: config.lv || 1, iceOrb: fused ? 1 : 0 },
    _mmAiming: false, _mmCharging: false, _mmCd: 0, _ioCd: 0, _mmDist: 150 };
  let randomIndex = 0;
  const c = { P, G: { cam: { x: 0, y: 0 } }, PASSIVES: { pMagic: discount.passive },
    KH: {}, K: {}, MBjust: [false, false, false], sp: 1,
    _eqAffix: key => { assert.equal(key, 'mpCostRed'); return discount.affix; },
    _uEq: key => { assert.equal(key, '_uHelmMagic'); return discount.unique; },
    _isFused: key => { assert.equal(key, 'iceMortar'); return fused; },
    SFX: { magic: element => side.magic.push(element) }, EL: { I: 'ice', D: 'dark' },
    playSample: (...args) => side.sample.push(args), shake: value => side.shake.push(value),
    showPH: (...args) => side.messages.push(args), _T: value => value,
    _gpActive: false, mouse: { x: 0, y: 0 }, VW: 0, VH: 0,
    Math: Object.assign(Object.create(Math), { random: () => {
      assert.ok(randomIndex < randomValues.length, 'unexpected extra source RNG call');
      const value = randomValues[randomIndex++]; side.random.push(value); return value;
    } }) };
  vm.createContext(c);
  vm.runInContext('let _lastCost=0;\n' + source.costs + '\n' + fire +
    '\nfunction aim(keyCode){let _skOk=false;switch(1){case 1:' + source.aim + '}return _skOk;}' +
    '\nfunction confirm(){' + source.confirm + '}\nfunction lastCost(){return _lastCost;}', c);
  const state = () => JSON.parse(JSON.stringify({ P, bomb: c.G._mmBomb || null, lastCost: c.lastCost(), side }));
  const tick = ({ hold = false, left = false, right = false, escape = false } = {}) => {
    c.KH.Digit1 = hold; c.MBjust[0] = left; c.MBjust[2] = right; c.K.Escape = escape;
    c.confirm();
    // upstream input-reset은 fixture다. 생산 update 전체를 실행했다고 주장하지 않는다.
    c.MBjust.fill(false); c.K.Escape = false;
  };
  return { c, P, side, discount, cost: () => c.mpCost('mortar'), state, tick,
    aim: () => c.aim('Digit1') };
}
function start(r, extra = 0) {
  r.P.mp = r.cost() + extra;
  assert.equal(r.aim(), true);
  assert.equal(r.P._mmAiming, true);
}
function trigger(r, input) {
  if (input === 'release') { r.tick({ hold: true }); r.tick(); }
  else r.tick({ left: true });
}
function blocked(r, mp) {
  assert.equal(r.c.G._mmBomb, undefined);
  assert.equal(r.P.mp, mp);
  assert.equal(r.P._mmAiming, true);
  assert.equal(r.P._mmCd, 0);
  assert.equal(r.c.lastCost(), 0);
  assert.deepEqual(r.side.random, []);
  assert.deepEqual(r.side.magic, []);
  assert.deepEqual(r.side.sample, []);
  assert.deepEqual(r.side.shake, []);
  assert.deepEqual(r.side.messages, [['MP 부족!', '#4488ff']]);
}
const configs = [
  { lv: 1, expected: 50 }, { lv: 10, expected: 207 },
  { lv: 5, passive: 5, expected: 96 }, { lv: 20, affix: 0.1, expected: 344 },
  { lv: 10, passive: 10, affix: 0.3, expected: 83 }, { lv: 5, unique: 0.25, expected: 90 }
];
const rngBranches = [[0.2], [0.8, 0.2, 0.25], [0.8, 0.8, 0.75]];
const actualSources = {};
check('approved frozen SHA', () => assert.equal(hash(frozen), 'cdeeead948d5518c6beeb8f3eee4fbf38eed8cc785165738f7150f8c375f2f49'));
check('pre/post production selector has no double insertion', () => {
  assert.equal(acceptanceFire(frozen), candidate);
  assert.equal(acceptanceFire(candidate, true), candidate);
  assert.throws(() => acceptanceFire(frozen, true), /still unapplied/);
  assert.throws(() => mode(candidate + '\n/* drift */'), /drift/);
});

for (const file of files) {
  try {
    const s = slices(read(file));
    actualSources[file] = s;
    const currentMode = mode(s.fire);
    const testedFire = acceptanceFire(s.fire);
    provenance[file] = { currentMode, sourceSHA256: protectedBefore[file],
      sliceSHA256: Object.fromEntries(Object.entries(s).map(([key, value]) => [key, hash(value)])),
      candidateFireSHA256: hash(candidate), testedFireSHA256: hash(testedFire) };
    check(file + ' production application Gate', () => acceptanceFire(s.fire, process.argv.includes('--require-production')));
    check(file + ' frozen defect and current-state classification', () => {
      for (const [label, fire] of [['frozen', frozen], ['current', s.fire]]) {
        const r = rig(s, fire, { lv: 10 }); start(r); r.P.mp = r.cost() - 0.25; trigger(r, 'release');
        if (label === 'frozen' || currentMode === 'unapplied') {
          assert.ok(r.c.G._mmBomb); assert.equal(r.P.mp, 0); assert.equal(r.P._mmCd, 660);
        } else blocked(r, r.cost() - 0.25);
        observations.push({ file, label, mode: label === 'frozen' ? 'baseline' : currentMode, state: r.state() });
      }
    });
    for (const config of configs) {
      const label = JSON.stringify(config);
      check(file + ' actual dynamic cost ' + label, () => assert.equal(rig(s, testedFire, config).cost(), config.expected));
      for (const input of ['click', 'release']) {
        check(file + ' cost minus 0.25 ' + input + ' ' + label, () => {
          const r = rig(s, testedFire, config); start(r); r.P.mp = config.expected - 0.25;
          trigger(r, input); blocked(r, config.expected - 0.25);
        });
      }
      for (const fused of [false, true]) for (const randomValues of rngBranches) {
        check(file + ' exact-cost full state/RNG parity ' + label + ' fuse=' + fused + ' rng=' + randomValues.join(','), () => {
          const baseline = rig(s, frozen, config, fused, randomValues);
          const accepted = rig(s, testedFire, config, fused, randomValues);
          for (const r of [baseline, accepted]) { start(r); trigger(r, 'release'); }
          assert.deepEqual(accepted.state(), baseline.state());
          assert.equal(accepted.P.mp, 0); assert.equal(accepted.c.lastCost(), config.expected);
          assert.equal(accepted.P._mmCd, 660); assert.equal(accepted.P._ioCd, fused ? 600 : 0);
          assert.equal(accepted.c.G._mmBomb.iceFuse, fused); assert.equal(accepted.c.G._mmBomb.phase, 'throw');
          assert.equal(accepted.c.G._mmBomb.r, 400 + (config.lv - 1) * 18);
          assert.equal(accepted.side.random.length, randomValues.length);
          assert.deepEqual(accepted.side.magic, [fused ? 'ice' : 'dark']);
          assert.equal(accepted.side.sample.length, 1); assert.deepEqual(accepted.side.shake, [5]);
        });
      }
    }
    for (const discountKey of ['passive', 'affix', 'unique']) {
      check(file + ' confirm rechecks changed ' + discountKey + ' discount', () => {
        const config = { lv: 5, [discountKey]: discountKey === 'passive' ? 5 : 0.2 };
        const r = rig(s, testedFire, config); start(r); const beforeCost = r.cost();
        if (discountKey === 'passive') r.c.PASSIVES.pMagic = 0;
        else r.discount[discountKey] = 0;
        const afterCost = r.cost(); assert.ok(afterCost > beforeCost);
        trigger(r, 'click'); blocked(r, beforeCost);
        observations.push({ file, discountKey, beforeCost, afterCost, state: r.state() });
      });
    }
    for (const input of ['click', 'release']) {
      check(file + ' failed ' + input + ' does not auto retry after MP recovery', () => {
        const r = rig(s, testedFire, { lv: 10 }); start(r); r.P.mp = r.cost() - 0.25;
        trigger(r, input); blocked(r, r.cost() - 0.25);
        assert.equal(r.P._mmCharging, false);
        r.P.mp = r.cost(); const sideBefore = JSON.stringify(r.side);
        for (let frame = 0; frame < 8; frame++) r.tick();
        assert.equal(r.c.G._mmBomb, undefined); assert.equal(r.P.mp, r.cost());
        assert.equal(JSON.stringify(r.side), sideBefore);
        r.tick({ left: true }); assert.ok(r.c.G._mmBomb); assert.equal(r.P.mp, 0);
        assert.equal(r.side.sample.length, 1); assert.equal(r.P._mmAiming, false);
      });
    }
    for (const cancel of ['right', 'escape']) for (const lowMP of [false, true]) {
      check(file + ' cancel wins over simultaneous click/release ' + cancel + ' lowMP=' + lowMP, () => {
        const r = rig(s, testedFire); start(r); r.tick({ hold: true });
        if (lowMP) r.P.mp = r.cost() - 0.25;
        const beforeMP = r.P.mp; r.tick({ left: true, [cancel]: true });
        assert.equal(r.P._mmAiming, false); assert.equal(r.P._mmCharging, false);
        assert.equal(r.P.mp, beforeMP); assert.equal(r.c.G._mmBomb, undefined);
        assert.deepEqual(r.side, { random: [], magic: [], sample: [], shake: [], messages: [] });
        r.tick({ left: true }); assert.equal(r.c.G._mmBomb, undefined);
      });
    }
    check(file + ' successful duplicate confirm cannot consume twice', () => {
      const r = rig(s, testedFire, { lv: 10 }); start(r, 300); trigger(r, 'click');
      const bomb = r.c.G._mmBomb; const success = r.state();
      for (let frame = 0; frame < 3; frame++) r.tick({ left: true });
      assert.equal(r.c.G._mmBomb, bomb); assert.deepEqual(r.state(), success);
      // 기존 dispatcher의 재입력은 throw를 즉시 착지시킨다. 추가 소비와 구분한다.
      const baseline = rig(s, frozen, { lv: 10 }); start(baseline, 300); trigger(baseline, 'click');
      assert.equal(r.aim(), false); assert.equal(baseline.aim(), false);
      assert.equal(r.c.G._mmBomb, bomb); assert.equal(bomb.t, bomb.maxT);
      assert.equal(r.P.mp, success.P.mp); assert.deepEqual(r.side, success.side);
      assert.deepEqual(r.state(), baseline.state());
    });
    check(file + ' failed iceMortar preserves existing vortex/ioCd', () => {
      const r = rig(s, testedFire, { lv: 10 }, true); start(r); r.P.mp = r.cost() - 0.25;
      const existing = { phase: 'vortex', sentinel: 'fixture' }; r.c.G._mmBomb = existing; r.P._ioCd = 77;
      trigger(r, 'release'); assert.equal(r.c.G._mmBomb, existing); assert.equal(r.P._ioCd, 77);
      assert.equal(r.P._mmCd, 0); assert.equal(r.P._mmAiming, true); assert.equal(r.P.mp, r.cost() - 0.25);
      assert.deepEqual(r.side.random, []); assert.deepEqual(r.side.magic, []);
    });
    check(file + ' caller world target and overpayment use exact cost', () => {
      const r = rig(s, testedFire, { lv: 10 }); start(r, 1.25); trigger(r, 'release');
      assert.equal(r.P._mmDist, 174); assert.equal(r.P.mp, 1.25); assert.equal(r.c.lastCost(), 207);
      assert.equal(r.c.G._mmBomb.tx, 10 + Math.cos(0.4) * 174);
      assert.equal(r.c.G._mmBomb.ty, 20 + Math.sin(0.4) * 174);
    });
    check(file + ' controls detect hardcoded50 and off-by-one guards', () => {
      const hardcoded = candidate.replace(guard, guard.replace("mpCost('mortar')", '50'));
      const r = rig(s, hardcoded, { lv: 10 }); start(r); r.P.mp = 206.75; trigger(r, 'click');
      assert.throws(() => blocked(r, 206.75), assert.AssertionError);
      const offByOne = candidate.replace('P.mp<mpCost', 'P.mp<=mpCost');
      const exact = rig(s, offByOne, { lv: 10 }); start(exact); trigger(exact, 'click');
      assert.throws(() => assert.ok(exact.c.G._mmBomb), assert.AssertionError);
    });
  } catch (error) { checks.push({ name: file + ' source extraction/provenance', status: 'FAIL', message: String(error) }); }
}
check('main/easy actual slices parity', () => assert.deepEqual(actualSources[files[0]], actualSources[files[1]]));
check('production, owner inputs, task and shared index stayed byte-identical', () => {
  for (const [rel, beforeSHA] of Object.entries(protectedBefore)) assert.equal(hash(fs.readFileSync(path.join(root, rel))), beforeSHA, rel);
  assert.equal(hash(fs.readFileSync(indexPath)), indexBefore, 'shared index');
});
const validation = { startedAtUTC, completedAtUTC: new Date().toISOString(), head,
  requireProduction: process.argv.includes('--require-production'), startChanges, endChanges: statusCount(),
  protectedBefore, sharedIndexSHA256: indexBefore, checksSHA256: hash(fs.readFileSync(fileURLToPath(import.meta.url))),
  inputs: { normalizedPatch: { path: patchPath, sha256: hash(patch) }, frozen: { path: frozenPath, sha256: hash(read(frozenPath)) } },
  provenance, checks, observations, pass: checks.filter(item => item.status === 'PASS').length,
  fail: checks.filter(item => item.status === 'FAIL').length,
  productionWrite: false, limits: [
    'Actual aim/confirm/fire/cost/_r source slices; whole update/game/DOM/physics not run',
    'PASSIVES/equipment/fusion/SFX/sample/input-reset are fixtures; source RNG sequence only, no whole-game RNG or listening claim',
    'Readiness PASS may use memory patch; --require-production fails until both real production functions match approved candidate',
    'Frozen or candidate byte drift fails closed; new legitimate source changes require root review',
    'No server, UI, game, physical gamepad, build, install, Git writes or source mutation'
  ] };
if (process.argv.includes('--record')) {
  const evidencePath = path.join(here, 'evidence.json');
  const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
  evidence.executions ||= [];
  evidence.executions.push(validation);
  fs.writeFileSync(evidencePath, JSON.stringify(evidence, null, 2) + '\n');
}
console.log(JSON.stringify({ pass: validation.pass, fail: validation.fail, head, requireProduction: validation.requireProduction,
  mode: Object.fromEntries(Object.entries(provenance).map(([file, value]) => [file, value.currentMode])),
  failed: checks.filter(item => item.status === 'FAIL'), evidenceRecorded: process.argv.includes('--record') }, null, 2));
process.exitCode = validation.fail ? 1 : 0;
