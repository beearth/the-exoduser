'use strict';

// Actual full updateE, etype42 producer/callback and projectile request helpers.
// Synthetic entities/world, geometry/LOS/flow-field and presentation leaves are
// stubs. spawnProj records requests before pool/backend normalization/collision.
// No main-loop timer decrement, native game/input/render/audio/save is tested.
// Only etype42's special shot is exercised, not all special/boss attack branches.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const {parse} = require('acorn');

const root = path.resolve(__dirname, '..');
const hash = text => crypto.createHash('sha256').update(text).digest('hex');
const guard = "if(e.s==='eShootWind'){e._swFire=null;e._swChargeEl=null;e.s='idle';e.st2=0}";
const names = ['EL', 'ELC', 'ETYPE_RANGE', 'updateE', 'dst', 'atkTicketRelease',
  '_isDruidFinale', '_druidFinaleUpdate', '_cancelProjCharge', '_fireChargedProj',
  '_tickProjCharge', 'eProjAt', '_beanRoll', '_eMouthXY', '_emitEnemyShot',
  '_prepareDarkSphere', '_projectileParryClass', '_fieldEnemyCanShoot'];

function production(filename) {
  const html = fs.readFileSync(path.join(root, filename), 'utf8');
  const matches = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
    .filter(m => m[1].includes('function updateE('));
  assert.equal(matches.length, 1, `${filename}: actual script is unambiguous`);
  const script = matches[0][1], ast = parse(script, {ecmaVersion: 'latest'});
  const node = name => {
    const matches = ast.body.filter(n =>
      (n.type === 'FunctionDeclaration' && n.id.name === name) ||
      (n.type === 'VariableDeclaration' && n.declarations.some(d => d.id.name === name)));
    assert.equal(matches.length, 1, `${filename}: actual declaration ${name}`);
    return matches[0];
  };
  const text = n => script.slice(n.start, n.end);
  const update = text(node('updateE'));
  // The inverse is only an old-contact memory control, never a live-source edit.
  assert.equal(update.split(guard).length - 1, 2, `${filename}: two adopted contacts`);
  const code = [...new Set(names.map(node))].sort((a, b) => a.start - b.start).map(text).join('\n');
  return {filename, main: filename === 'game.html', sha: hash(html), code,
    oldCode: code.replaceAll(guard, ''), updateSha: hash(update),
    updateLine: html.slice(0, matches[0].index + matches[0][0].indexOf(script) + node('updateE').start).split('\n').length};
}
const sources = ['game.html', 'game-easy-test.html'].map(production);
console.log(JSON.stringify({kind: 'enemy-special-shot-live-source',
  sources: sources.map(({filename, sha, updateSha, updateLine}) => ({filename, sha, updateSha, updateLine})),
  boundary: 'full updateE; actual etype42 callback and shot request formula; stub world/presentation/spawn sink; main loop/native/backend untested'}));

function fixture(source, old = false) {
  const shots = [], events = [];
  const e = {etype: 42, alive: true, ib: false, x: 0, y: 0, r: 14, hp: 100, mhp: 100,
    baseAtk: 25, atk: 25, speed: 1, facing: 0, el: 3, col: '#9933cc',
    s: 'idle', st2: 20, kb: {x: 0, y: 0}, mods: [], elite: 0,
    _aAtkM: 1, _aSpdM: 1, poise: 4, maxPoise: 4, poiseR: 0,
    _fmAbsorbCd: 9999, _fmSpitT: 0, _fmSpitCd: 9999,
    projT: 9999, projCd: 240, _projChargeT: 0,
    stunned: 0, _frozen: 0, _hitStun: 0, _mSfxCd: 9999};
  const record = name => (...args) => events.push([name, ...args]);
  const sandbox = {e, ens: [e], P: {x: 100, y: 0, r: 12, iframes: 0, s: 'idle', kb: {x: 0, y: 0}},
    G: {stage: 0, rifts: [], atkTickets: 0, maxAtkTickets: 999},
    window: {}, _DEMO_MODE: false, _DEMO_LAST_STAGE: 3, _gameFrame: 0,
    _mSfxPlaying: 3, _canMvTile: () => true, canMv: () => false,
    hasLOS: () => false, _ffDir: () => null, shQuery: () => [],
    _pushOutWall: () => {throw Error('unexpected wall path');},
    _ffMoveE: () => {throw Error('unexpected flow movement');},
    _T: text => text, addTxt: record('text'), addParts: record('parts'),
    poolPart: record('particle'), SFX: {magic: record('magic')},
    spawnProj: props => {shots.push(JSON.parse(JSON.stringify(props))); return props;}};
  const ctx = vm.createContext(sandbox);
  vm.runInContext(old ? source.oldCode : source.code, ctx,
    {filename: `${old ? 'old-contact-memory' : 'actual-live'}-${source.filename}`});
  return {source, old, e, ctx, shots, events, tick: sp => ctx.updateE(e, sp),
    run: (frames, sp = 1) => {for (let i = 0; i < frames; i++) ctx.updateE(e, sp);}};
}
function prepareSpecial(f) {
  f.tick(1); // Actual etype42 branch registers its own function and 60f timer.
  assert.equal(f.e.s, 'eShootWind'); assert.equal(f.e.st2, 60);
  assert.equal(f.e._swChargeEl, 3); assert.equal(typeof f.e._swFire, 'function');
  assert.equal(f.shots.length, 0);
  return f.e._swFire;
}
function ordinaryPending(f) {
  Object.assign(f.e, {_projChargeT: 9, _projChargeCol: '#a44cff',
    _projChargeBean: 'dark', _projChargeParryClass: 'magic'});
}
function assertOrdinaryCleared(f) {
  assert.equal(f.e._projChargeT, 0); assert.equal(f.e._projChargeCol, null);
  assert.equal(f.e._projChargeBean, null);
  assert.equal(f.e._projChargeParryClass, f.source.main ? null : 'magic');
}
function assertSpecialCleared(f) {
  assert.equal(f.e._swFire, null); assert.equal(f.e._swChargeEl, null);
  assert.equal(f.e.s, 'idle'); assert.equal(f.e.st2, 0);
}
function resumeWithoutOuterLoopClaim(f) {
  // Outer-loop stun decrement is deliberately not modeled: select its post-stun state.
  f.e.stunned = 0; f.e._hitStun = 0;
  f.run(61);
}
function snapshot(f) {
  return {shots: f.shots, events: f.events,
    state: JSON.parse(JSON.stringify({...f.e, _swFire: typeof f.e._swFire}))};
}

for (const source of sources) {
  test(`${source.filename}: actual etype42 60f completion emits once, clears callback/meta and matches old normal trace`, () => {
    const live = fixture(source), old = fixture(source, true);
    for (const f of [live, old]) {
      prepareSpecial(f); f.run(59);
      assert.equal(f.e.st2, 1); assert.equal(f.shots.length, 0);
      f.tick(1);
      assert.equal(f.shots.length, 1); assert.equal(f.e._swFire, null);
      assert.equal(f.e._swChargeEl, null); assert.equal(f.e.s, 'idle');
      // These are actual eProjAt -> _emitEnemyShot request fields, before backend.
      assert.equal(f.shots[0].dmg, 20); assert.equal(f.shots[0].life, 300);
      assert.equal(f.shots[0].el, 3); assert.equal(f.shots[0]._commit, true);
      assert.equal(f.shots[0].vx, 2.5); assert.equal(f.shots[0].vy, 0);
      f.tick(1); assert.equal(f.shots.length, 1);
    }
    assert.deepEqual(snapshot(live), snapshot(old));
  });

  test(`${source.filename}: stun cancels actual special plus ordinary charge; repeated interruption and later resume emit zero`, () => {
    const f = fixture(source); prepareSpecial(f); f.run(12); ordinaryPending(f);
    f.e.stunned = 30; f.tick(1);
    assertSpecialCleared(f); assertOrdinaryCleared(f);
    assert.equal(f.e.stunned, 30); // updateE does not decrement stun itself.
    assert.equal(f.e._maxStunned, 30);
    f.tick(1); assertSpecialCleared(f); assertOrdinaryCleared(f);
    resumeWithoutOuterLoopClaim(f); assert.equal(f.shots.length, 0);
  });

  test(`${source.filename}: final fractional freeze tick cancels before release, grants ordinary120 immunity and never resumes the old shot`, () => {
    const f = fixture(source); prepareSpecial(f); f.run(59); ordinaryPending(f);
    f.e._frozen = .5; f.e._freezeGauge = 73; f.tick(1);
    assertSpecialCleared(f); assertOrdinaryCleared(f);
    assert.equal(f.e._frozen, 0); assert.equal(f.e._freezeGauge, 0);
    assert.equal(f.e._frozenImmune, 120); assert.equal(f.shots.length, 0);
    f.tick(1); assert.equal(f.e._frozenImmune, 119); assert.equal(f.shots.length, 0);
    f.run(61); assert.equal(f.shots.length, 0);
  });

  test(`${source.filename}: repeated freeze cancellation is idempotent while existing frozen decrement is preserved`, () => {
    const f = fixture(source); prepareSpecial(f); ordinaryPending(f);
    f.e._frozen = 7; f.e._freezeGauge = 80; f.tick(2);
    assertSpecialCleared(f); assertOrdinaryCleared(f);
    assert.equal(f.e._frozen, 5); assert.equal(f.e._freezeGauge, 80);
    assert.equal(f.e._frozenImmune, undefined);
    f.tick(2); assertSpecialCleared(f); assert.equal(f.e._frozen, 3);
    f.tick(4); assert.equal(f.e._frozen, 0); assert.equal(f.e._frozenImmune, 120);
    assert.equal(f.shots.length, 0);
  });

  test(`${source.filename}: boss final freeze tick retains existing300 immunity before any boss AI`, () => {
    const f = fixture(source); prepareSpecial(f); f.e.ib = true;
    f.e._frozen = .25; f.e._freezeGauge = 10; f.tick(1);
    assertSpecialCleared(f); assert.equal(f.e._frozen, 0);
    assert.equal(f.e._freezeGauge, 0); assert.equal(f.e._frozenImmune, 300);
    assert.equal(f.shots.length, 0);
    // No subsequent unfrozen boss AI or immunity application policy is claimed.
  });

  test(`${source.filename}: stun180 cap leaves non-eShootWind state/timer and special metadata unchanged`, () => {
    const f = fixture(source), fire = prepareSpecial(f); ordinaryPending(f);
    Object.assign(f.e, {s: 'recover', st2: 31, stunned: 240});
    f.tick(1); assert.equal(f.e.stunned, 180); assert.equal(f.e._maxStunned, 180);
    assertOrdinaryCleared(f); assert.equal(f.e.s, 'recover'); assert.equal(f.e.st2, 31);
    assert.equal(f.e._swFire, fire); assert.equal(f.e._swChargeEl, 3);
    f.tick(1); assert.equal(f.e.stunned, 180); assert.equal(f.e.st2, 31);
    assert.equal(f.shots.length, 0);
  });

  test(`${source.filename}: freeze preserves non-eShootWind state/timer and metadata while cancelling ordinary charge`, () => {
    const f = fixture(source), fire = prepareSpecial(f); ordinaryPending(f);
    Object.assign(f.e, {s: 'recover', st2: 31, _frozen: 2}); f.tick(1);
    assertOrdinaryCleared(f); assert.equal(f.e._frozen, 1);
    assert.equal(f.e.s, 'recover'); assert.equal(f.e.st2, 31);
    assert.equal(f.e._swFire, fire); assert.equal(f.e._swChargeEl, 3);
    assert.equal(f.shots.length, 0);
  });

  test(`${source.filename}: existing hitStun early return still precedes all charge cancellation`, () => {
    const f = fixture(source), fire = prepareSpecial(f); ordinaryPending(f);
    Object.assign(f.e, {_hitStun: 1, stunned: 20, _frozen: 2}); f.tick(1);
    assert.equal(f.e._swFire, fire); assert.equal(f.e.s, 'eShootWind'); assert.equal(f.e.st2, 60);
    assert.equal(f.e._swChargeEl, 3); assert.equal(f.e._projChargeT, 9);
    assert.equal(f.e.stunned, 20); assert.equal(f.e._frozen, 2);
    f.e._hitStun = 0; f.tick(1); assertSpecialCleared(f); assertOrdinaryCleared(f);
    assert.equal(f.e._frozen, 2); // Stun return precedes frozen decrement too.
  });

  test(`${source.filename}: uninterrupted ordinary charge tick/request remains equal to old source control`, () => {
    const live = fixture(source), old = fixture(source, true);
    for (const f of [live, old]) {
      prepareSpecial(f);
      // Select a normal existing charge; suppress only the independent special callback.
      Object.assign(f.e, {s: 'idle', st2: 90, _swFire: null, _swChargeEl: null});
      ordinaryPending(f); f.e._projChargeT = 60;
      // The easy ordinary producer has no dark-specific bean; retain its normal branch.
      if (!source.main) {f.e._projChargeBean = 'normal'; f.e._projChargeCol = '#9933cc';}
      f.run(59); assert.equal(f.shots.length, 0); assert.equal(f.e._projChargeT, 1);
      f.tick(1); assert.equal(f.shots.length, 1); assertOrdinaryCleared(f);
      assert.equal(f.shots[0].dmg, source.main ? 25 : 20); assert.equal(f.shots[0]._commit, true);
      assert.equal(f.shots[0].el, 3); assert.equal(f.shots[0].gbBean, source.main ? true : undefined);
      f.tick(1); assert.equal(f.shots.length, 1);
    }
    assert.deepEqual(snapshot(live), snapshot(old));
  });

  for (const interruption of ['stun', 'freeze']) {
    test(`${source.filename}: inverse old-contact ${interruption} control reproduces stale actual callback release`, () => {
      const old = fixture(source, true), live = fixture(source);
      for (const f of [old, live]) {
        prepareSpecial(f); f.run(59);
        if (interruption === 'stun') f.e.stunned = 1; else f.e._frozen = 1;
        f.tick(1);
      }
      assert.equal(typeof old.e._swFire, 'function'); assert.equal(old.e.s, 'eShootWind');
      assertSpecialCleared(live);
      resumeWithoutOuterLoopClaim(old); resumeWithoutOuterLoopClaim(live);
      assert.equal(old.shots.length, 1); assert.equal(live.shots.length, 0);
    });
  }
}
