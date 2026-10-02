'use strict';

// Live-source calculation regression only. UI, VFX, sound and save leaves are
// recording stubs; no DOM, native input/audio, storage or complete game runs.
// Equipment fixtures have no crystals. The distinct crystal implementations,
// gameplay XP producers and the full stat-panel renderer are not exercised.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const {parse} = require('acorn');

const root = path.resolve(__dirname, '..');
const sha = text => crypto.createHash('sha256').update(text).digest('hex');
const panel = fs.readFileSync(path.join(root, 'stat-panel-ui.js'), 'utf8');
const functions = ['addExp', 'applyStats', 'recalcSt', '_lvB', '_gritTotal',
  '_gritHpFlat', '_gritMpFlat', '_gritStFlat', '_eqStatRebuild', '_eqStat',
  '_eqAffixRebuild', '_eqAffix', '_eqImplicit', 'pPredSpd', 'nc',
  '_getTodayStr', '_canTransLv', '_calcMaxExp'];
const declarations = ['SLOT_NAMES', 'PASSIVE_DEF', 'PASSIVES', 'STATS', '_grit',
  '_eqStatCache', '_eqAffixCache', '_diffSigned', '_DEMO_LV_CAP'];

function readProduction(filename) {
  const html = fs.readFileSync(path.join(root, filename), 'utf8');
  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
  const matches = scripts.filter(m => m[1].includes('function addExp('));
  assert.equal(matches.length, 1, `${filename}: unambiguous actual script`);
  const script = matches[0][1];
  const ast = parse(script, {ecmaVersion: 'latest'});
  const nodeFor = name => {
    const matches = ast.body.filter(n =>
      (n.type === 'FunctionDeclaration' && n.id.name === name) ||
      (n.type === 'VariableDeclaration' && n.declarations.some(d => d.id.name === name)));
    assert.equal(matches.length, 1, `${filename}: actual declaration ${name}`);
    return matches[0];
  };
  const names = [...declarations, ...functions];
  const isMain = filename === 'game.html';
  if (isMain) names.push('_passiveQueueItems', '_processPassiveQueue');
  const nodes = [...new Set(names.map(nodeFor))];
  const init = ast.body.filter(n => n.type === 'ExpressionStatement' &&
    script.slice(n.start, n.end) === 'PASSIVE_DEF.forEach(p=>PASSIVES[p.key]=0);');
  assert.equal(init.length, 1, `${filename}: actual passive initialization`);
  nodes.push(init[0]);
  nodes.sort((a, b) => a.start - b.start);
  return {filename, isMain, htmlSha: sha(html), code: nodes.map(n => script.slice(n.start, n.end)).join('\n'),
    fragments: Object.fromEntries(names.map(name => {
      const n = nodeFor(name);
      return [name, {sha: sha(script.slice(n.start, n.end)), line: html.slice(0,
        matches[0].index + matches[0][0].indexOf(script) + n.start).split('\n').length}];
    }))};
}

const sources = ['game.html', 'game-easy-test.html'].map(readProduction);
console.log(JSON.stringify({kind: 'level-up-live-source', sources: sources.map(s => ({
  file: s.filename, sha: s.htmlSha, addExp: s.fragments.addExp,
  applyStats: s.fragments.applyStats, passiveQueue: s.fragments._processPassiveQueue || null})),
  statPanelSha: sha(panel), boundary: 'actual extracted calculations; synthetic state; recording UI/audio/save leaves; no crystals/native/whole-game'}));

function fixture(source, config = {}) {
  const settings = structuredClone(config);
  const calls = {apply: 0, recalc: 0, queue: 0, queueResults: [], rankCosts: []};
  const effects = [];
  const P = {lv: settings.lv || 1, exp: 0, maxExp: 0, sp: 0, ap: settings.ap || 0,
    x: 100, y: 200, hp: 0, mp: 0, st: 0, shield: 0, skills: {},
    _passiveQueue: settings.queue || []};
  const sandbox = {P, G: {on: true, stage: 0}, OPT: {diff: 5},
    INV: {equipped: settings.equipped || {}}, _BIC: true, _DEMO_MODE: !!settings.demo,
    calls, settings, SFX: {levelup: () => effects.push(['sound'])},
    showPH: (...args) => effects.push(['notice', ...args]),
    addTxt: (...args) => effects.push(['text', ...args]),
    _T: text => text, _levelUpVfx: {trigger: (player, stage, levels, demonic) =>
      effects.push(['vfx', player === P, stage, levels, demonic])},
    dbSaveForce: () => effects.push(['save'])};
  const ctx = vm.createContext(sandbox);
  vm.runInContext(panel, ctx, {filename: 'actual-stat-panel-ui.js'});
  vm.runInContext(source.code, ctx, {filename: `actual-${source.filename}-calculations`});
  vm.runInContext(`
    Object.assign(STATS, settings.stats || {});
    Object.assign(PASSIVES, settings.passives || {});
    _grit = settings.grit || 0;
    {
      const actualApply = applyStats, actualRecalc = recalcSt;
      applyStats = function(...args) { calls.apply++; return actualApply.apply(this, args); };
      recalcSt = function(...args) { calls.recalc++; return actualRecalc.apply(this, args); };
      const actualCost = ExoduserStatsPanel.rankCost;
      ExoduserStatsPanel.rankCost = function(rank) {
        const cost = actualCost(rank); calls.rankCosts.push([rank, cost]); return cost;
      };
    }
  `, ctx);
  if (source.isMain) vm.runInContext(`{
    const actualQueue = _processPassiveQueue;
    _processPassiveQueue = function(...args) {
      calls.queue++; const result = actualQueue.apply(this, args);
      calls.queueResults.push(result); return result;
    };
  }`, ctx);
  ctx.applyStats();
  P.maxExp = ctx._calcMaxExp(P.lv);
  const initial = settings.current || [37, 23, 17, 11];
  [P.hp, P.mp, P.st, P.shield] = initial;
  calls.apply = calls.recalc = calls.queue = 0;
  calls.queueResults.length = calls.rankCosts.length = effects.length = 0;
  return {source, ctx, P, calls, effects,
    maxima: () => [P.mhp, P.mmp, P.mst, P.mshield],
    resources: () => [P.hp, P.mp, P.st, P.shield],
    passive: name => vm.runInContext(`PASSIVES[${JSON.stringify(name)}]`, ctx),
    expTo: target => {let exp = 0; for (let lv = P.lv; lv < target; lv++) exp += ctx._calcMaxExp(lv); return exp;}};
}

function expectedRecovery(before, maxima) {
  return before.map((amount, i) => Math.min(maxima[i], amount + (i < 3 ? Math.floor(maxima[i] * .2) : 0)));
}
function assertNoEffects(f) {
  assert.deepEqual(f.calls, {apply: 0, recalc: 0, queue: 0, queueResults: [], rankCosts: []});
  assert.deepEqual(f.effects, []);
}
function assertLevelEffects(f, levels) {
  assert.equal(f.effects.filter(e => e[0] === 'sound').length, 1);
  assert.equal(f.effects.filter(e => e[0] === 'save').length, 1);
  assert.deepEqual(f.effects.filter(e => e[0] === 'vfx'), [['vfx', true, 0, levels, false]]);
  assert.equal(f.calls.queue, f.source.isMain ? 1 : 0);
}
const equipped = {boots: {bStr: 2, bDex: 3, bInt: 4, bGrit: 5,
  bonusHp: 11, bonusMp: 13, bonusShield: 17, bonusSt: 19, enh: 2,
  affixes: [], crystals: []}};

for (const source of sources) {
  test(`${source.filename}: ordinary XP below threshold changes no resources, maxima or pending AP`, () => {
    const f = fixture(source, {queue: ['pFortify']});
    f.P.exp = f.P.maxExp - 2;
    const before = f.resources(), maxima = f.maxima();
    f.ctx.addExp(3, false); // Actual /3, necklace and affix XP path.
    assert.equal(f.P.exp, f.P.maxExp - 1);
    assert.equal(f.P.lv, 1); assert.equal(f.P.sp, 0); assert.equal(f.P.ap, 0);
    assert.deepEqual(f.resources(), before); assert.deepEqual(f.maxima(), maxima);
    assert.deepEqual(Array.from(f.P._passiveQueue), ['pFortify']);
    assertNoEffects(f);
  });

  test(`${source.filename}: actual BIC DEMO100 cap clamps XP without healing or recalculation`, () => {
    const f = fixture(source, {lv: 100, demo: true});
    assert.equal(vm.runInContext('_DEMO_LV_CAP', f.ctx), 100);
    f.P.exp = f.P.maxExp + 10;
    const before = f.resources(), maxima = f.maxima();
    f.ctx.addExp(10000, true);
    assert.equal(f.P.exp, f.P.maxExp - 1); assert.equal(f.P.lv, 100);
    assert.deepEqual(f.resources(), before); assert.deepEqual(f.maxima(), maxima);
    assertNoEffects(f);
  });

  test(`${source.filename}: one earned level refreshes actual level/grit maxima then heals once`, () => {
    const f = fixture(source);
    const before = f.resources();
    f.ctx.addExp(f.expTo(2), true);
    assert.deepEqual(f.maxima(), [306, 103, 101, 105]);
    assert.deepEqual(f.resources(), expectedRecovery(before, f.maxima()));
    assert.equal(f.P.sp, 3); assert.equal(f.P.ap, 1); assert.equal(f.P.exp, 0);
    assert.equal(f.P.maxExp, f.ctx._calcMaxExp(2));
    assert.equal(f.calls.apply, 1); assert.equal(f.calls.recalc, 1);
    assertLevelEffects(f, 1);
  });

  test(`${source.filename}: multi-level batch uses final maxima and one 20% heal`, () => {
    const f = fixture(source), control = fixture(source, {lv: 4});
    const before = f.resources();
    f.ctx.addExp(f.expTo(4), true);
    assert.equal(f.P.lv, 4); assert.equal(f.P.sp, 9); assert.equal(f.P.ap, 2);
    assert.deepEqual(f.maxima(), control.maxima());
    assert.deepEqual(f.maxima(), [312, 106, 102, 110]);
    assert.deepEqual(f.resources(), expectedRecovery(before, control.maxima()));
    assert.equal(f.calls.apply, 1); assert.equal(f.calls.recalc, 1);
    assertLevelEffects(f, 3);
  });

  test(`${source.filename}: equipment bonus, enhancement and grit survive final resource refresh`, () => {
    const f = fixture(source, {lv: 2, equipped});
    assert.deepEqual(f.maxima(), [334, 129, 125, 142]);
    const before = f.resources();
    f.ctx.addExp(f.expTo(4), true);
    assert.deepEqual(f.maxima(), [340, 132, 126, 147]);
    assert.deepEqual(f.resources(), expectedRecovery(before, f.maxima()));
    assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(P._effStats)', f.ctx)),
      {str: 4, dex: 5, int: 6, vit: 0, lck: 2});
    assert.equal(f.calls.apply, 1); assert.equal(f.calls.recalc, 1);
    assertLevelEffects(f, 2);
  });

  test(`${source.filename}: existing Fortify/Vital amounts survive intermediate clamp; shield gains no heal`, () => {
    const options = {equipped, passives: {pFortify: 2, pVital: 3, pStamina: 2, pHuman: 1}};
    const f = fixture(source, options), control = fixture(source, {...options, lv: 2});
    [f.P.hp, f.P.mp, f.P.st, f.P.shield] = f.maxima().map((max, i) => max - [7, 5, 3, 9][i]);
    const before = f.resources();
    f.ctx.addExp(f.expTo(2), true);
    assert.deepEqual(f.maxima(), control.maxima());
    assert.deepEqual(f.resources(), expectedRecovery(before, control.maxima()));
    assert.equal(f.P.hp, f.P.mhp); assert.equal(f.P.mp, f.P.mmp); assert.equal(f.P.st, f.P.mst);
    assert.equal(f.P.shield, before[3]);
    assert.equal(f.calls.apply, 1); assert.equal(f.calls.recalc, 1);
    assert.equal(f.passive('pFortify'), 2); assert.equal(f.passive('pVital'), 3);
    assertLevelEffects(f, 1);
  });

  test(`${source.filename}: batch crossing BIC DEMO cap heals only its single accepted level`, () => {
    const f = fixture(source, {lv: 99, demo: true}), control = fixture(source, {lv: 100, demo: true});
    const before = f.resources();
    f.ctx.addExp(f.expTo(102), true);
    assert.equal(f.P.lv, 100); assert.equal(f.P.exp, f.P.maxExp - 1);
    assert.equal(f.P.sp, 3); assert.equal(f.P.ap, 1);
    assert.deepEqual(f.maxima(), control.maxima());
    assert.deepEqual(f.resources(), expectedRecovery(before, control.maxima()));
    assert.equal(f.calls.apply, 1); assert.equal(f.calls.recalc, 1);
    assertLevelEffects(f, 1);
  });
}

const main = sources.find(s => s.isMain);
test('main AP queue: no AP leaves pending investment and all resources/maxima untouched', () => {
  const f = fixture(main, {queue: ['pFortify'], passives: {pFortify: 2, pVital: 3}});
  const before = f.resources(), maxima = f.maxima();
  assert.equal(f.ctx._processPassiveQueue(), 0);
  assert.deepEqual(f.resources(), before); assert.deepEqual(f.maxima(), maxima);
  assert.equal(f.passive('pFortify'), 2); assert.equal(f.P.ap, 0);
  assert.deepEqual(Array.from(f.P._passiveQueue), ['pFortify']);
  assert.equal(f.calls.apply, 0); assert.equal(f.calls.recalc, 0);
  assert.deepEqual(f.calls.rankCosts.map(pair => Array.from(pair)), [[2, 1]]);
  assert.deepEqual(f.effects, []);
});

test('main AP queue: actual rank-three cost spends two AP once without healing existing high amounts', () => {
  const f = fixture(main, {ap: 2, queue: ['pVital', 'pFortify'],
    passives: {pVital: 3, pFortify: 2}, equipped});
  [f.P.hp, f.P.mp, f.P.st, f.P.shield] = f.maxima().map(max => max - 1);
  const before = f.resources(), maxima = f.maxima();
  assert.equal(f.ctx._processPassiveQueue(), 1);
  assert.deepEqual(f.resources(), before);
  assert.deepEqual(f.maxima(), [maxima[0], maxima[1] + 50, maxima[2], maxima[3]]);
  assert.equal(f.P.ap, 0); assert.equal(f.passive('pVital'), 4); assert.equal(f.passive('pFortify'), 2);
  assert.deepEqual(Array.from(f.P._passiveQueue), ['pFortify']);
  assert.deepEqual(f.calls.rankCosts.map(pair => Array.from(pair)), [[3, 2], [2, 1]]);
  assert.equal(f.calls.apply, 1); assert.equal(f.calls.recalc, 1);
  assert.deepEqual(f.effects, []);
});

test('main earned AP: queue consumes one reservation; both recalculations preserve amounts before one level heal', () => {
  const options = {ap: 1, queue: ['pVital', 'pFortify'], equipped,
    passives: {pVital: 3, pFortify: 2, pStamina: 1}};
  const f = fixture(main, options), control = fixture(main, {...options, lv: 2,
    passives: {...options.passives, pVital: 4}});
  [f.P.hp, f.P.mp, f.P.st, f.P.shield] = f.maxima().map((max, i) => max - [100, 60, 20, 9][i]);
  const before = f.resources();
  f.ctx.addExp(f.expTo(2), true);
  assert.equal(f.P.ap, 0); assert.equal(f.P.sp, 3);
  assert.equal(f.passive('pVital'), 4); assert.equal(f.passive('pFortify'), 2);
  assert.deepEqual(Array.from(f.P._passiveQueue), ['pFortify']);
  assert.deepEqual(f.calls.queueResults, [1]);
  assert.deepEqual(f.calls.rankCosts.map(pair => Array.from(pair)), [[3, 2], [2, 1]]);
  assert.equal(f.calls.apply, 2); assert.equal(f.calls.recalc, 2);
  assert.deepEqual(f.maxima(), control.maxima());
  assert.deepEqual(f.resources(), expectedRecovery(before, control.maxima()));
  assert.equal(f.P.shield, before[3]);
  assertLevelEffects(f, 1);
});
