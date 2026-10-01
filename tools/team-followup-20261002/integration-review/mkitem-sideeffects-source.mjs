import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { parseExpressionAt } from 'acorn';

// Independent review fixture. Does not load a page, play audio, start a server,
// modify owner files, or substitute mkItem/rollAffixes in the accepted runs.
const root = new URL('../../../', import.meta.url);
const hash = value => createHash('sha256').update(value).digest('hex');
const snapshot = value => JSON.parse(JSON.stringify(value));
const records = [];
const groups = [];
const sources = [];
const constants = ['EL', 'RARITY_MUL', 'SLOT_NAMES', 'SLOT_EMOJI', '_AFSLOT',
  'AFFIX_POOL', 'IMPLICIT_TABLE', 'LEGENDARY_SPECIAL', 'UNIQUE_SPECIAL',
  'ANC_ROSTER', '_BONE_PARTS', '_BONE_PART_KO', '_PICKUP_SFX_POOL', 'ITEM_SIZE',
  'WTYPE_SIZE', 'BTYPE_SIZE', 'INV_COLS', 'RARITY_N', 'RARITY_N_EN',
  '_DEMO_AFFIX_BANNED', 'BAG_MAX'];
const functions = ['rollAffixes', 'mkItem', 'mkBonePart', '_grantOssuaryIfNeeded',
  '_boneRegister', '_ossSetComplete', '_ancPartPts', '_r', 'playItemPickupSfx',
  'pickupItem', '_itemSz', '_invRows', '_invGrid', '_invFindSpace', '_rarName'];

function extract(source, name, constant) {
  let anchor = `function ${name}(`;
  if (constant) {
    anchor = [`const ${name}=`, `let ${name}=`].find(a => source.includes(a));
    assert.ok(anchor, `declaration ${name}`);
  }
  const start = source.indexOf(anchor);
  assert.ok(start >= 0, anchor);
  const end = parseExpressionAt(source, constant ? start + anchor.length : start,
    { ecmaVersion: 'latest' }).end;
  return { name, sha256: hash(source.slice(start, end)), start, end,
    bytes: Buffer.byteLength(source.slice(start, end)),
    code: source.slice(start, end) + (constant ? ';' : '') };
}

function run(file, blocks, { name, seed, demo, collection, full, held, rarity = 0,
  tier = 0, part = 'skull', mutant = null }) {
  const calls = { samples: [], notifications: [], texts: [], shakes: [],
    saves: 0, recalcSt: 0, pickedUp: 0, mkItem: [] };
  const inventory = { bag: [], equipped: {}, ossCollect: snapshot(collection || {}) };
  if (full) for (let y = 0; y < 120; y++) for (let x = 0; x < 10; x++) {
    inventory.bag.push({ slot: 'bonePart', name: 'occupied fixture', _gx: x, _gy: y });
  }
  const existingOssuary = { id: 42, slot: 'ossuary', name: 'existing fixture' };
  if (held === 'equipped') inventory.equipped.ossuary = existingOssuary;
  if (held === 'bag') inventory.bag.push(existingOssuary);
  const trace = [];
  let state = seed >>> 0;
  let phase = 'bone_creation';
  let origin = 'mkBonePart';
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const value = state / 4294967296;
    trace.push({ phase, origin, value });
    return value;
  };
  const sandbox = { INV: inventory, P: { lv: 42, x: 100, y: 200 },
    _DEMO_MODE: demo, Date: { now: () => 1700000000000 },
    performance: { now: () => 1000 },
    Math: Object.assign(Object.create(Math), { random }),
    _L: ko => ko, _T: s => s,
    notify: s => calls.notifications.push(s),
    addTxt: (...args) => calls.texts.push(args),
    shake: n => calls.shakes.push(n),
    recalcSt: () => calls.recalcSt++,
    dbSaveForce: () => calls.saves++,
    window: { _systemLesson: { pickedUp: () => calls.pickedUp++ } },
    playSample: (...args) => calls.samples.push(args) };
  const context = vm.createContext(sandbox);
  vm.runInContext(blocks.map(b => b.code).join('\n'), context,
    { timeout: 1000, filename: `${file}:source-extract` });
  const mkItem = context.mkItem;
  context.mkItem = (...args) => {
    const priorOrigin = origin, rngStart = trace.length;
    origin = 'mkItem';
    try {
      const result = mkItem.apply(context, args);
      calls.mkItem.push({ args: snapshot(args), item: snapshot(result),
        rngCalls: trace.length - rngStart });
      return result;
    } finally { origin = priorOrigin; }
  };
  for (const name of ['rollAffixes', '_r']) {
    const original = context[name];
    context[name] = (...args) => {
      const priorOrigin = origin;
      origin = name;
      try { return original.apply(context, args); }
      finally { origin = priorOrigin; }
    };
  }
  if (mutant === 'stub_mkItem') context.mkItem = (...args) => {
    const result = { slot: 'ossuary', name: 'stub', rarity: 5 };
    calls.mkItem.push({ args, item: result });
    return result;
  };
  if (mutant === 'omit_registration_pitch') {
    const bone = blocks.find(b => b.name === '_boneRegister').code;
    assert.ok(bone.includes("_r(1.2,.1)"));
    vm.runInContext(bone.replace('_r(1.2,.1)', '1.2'), context);
  }
  const item = context.mkBonePart(0, part, tier, rarity);
  assert.ok(item);
  const creationRng = trace.length;
  const before = snapshot(inventory);
  const originalBag = inventory.bag;
  phase = 'pickup';
  origin = 'pickup selection';
  const result = context.pickupItem(item);
  const pickupTrace = trace.slice(creationRng);
  return { file, name, seed, demo, mutant, result, calls: snapshot(calls),
    item: snapshot(item), inventory: snapshot(inventory), before,
    bagIdentityPreserved: inventory.bag === originalBag,
    rng: { creation: creationRng, pickup: pickupTrace.length, trace },
    nextRng: state, stubs: ['playSample audio backend', 'notify translation backend',
      'addTxt visual backend', 'shake visual backend', 'recalcSt stats backend',
      'dbSaveForce storage backend', 'systemLesson backend',
      'Date/performance fixture clocks', 'P.lv=42 fixture', '_DEMO_MODE fixture'] };
}

function expectOssuary(record) {
  const oss = record.inventory.equipped.ossuary;
  assert.equal(oss.name, '전대의 유골함');
  assert.equal(oss.rarity, 5); assert.equal(oss.tier, 0); assert.equal(oss.el, 0);
  assert.equal(oss.eDef, 60); assert.equal(oss.bonusMp, 150);
  assert.equal(oss.ancPow, .25); assert.equal(oss.reqLv, 0);
  assert.equal(oss.socketCount, 2); assert.deepEqual(oss.crystals, [null, null]);
  assert.deepEqual(oss.affixes, [{ id: 'ancHP', tier: 3, value: .9 }]);
  assert.equal(oss._implicitVal, 10);
  for (const k of ['bStr', 'bDex', 'bInt', 'bLck', 'bGrit']) assert.equal(oss[k], undefined);
}

const high = { iron_warlord_skull: { r: 5, t: 4 } };
const completeBefore = { iron_warlord_skull: { r: 0, t: 0 },
  iron_warlord_torso: { r: 0, t: 0 }, iron_warlord_arms: { r: 0, t: 0 } };
const cases = [
  { name: 'first_registration_actual_mkItem', held: null },
  { name: 'equipped_registration', held: 'equipped' },
  { name: 'bag_ossuary_registration', held: 'bag' },
  { name: 'duplicate_lower_to_bag', held: 'equipped', collection: high },
  { name: 'duplicate_equal_full_refusal', held: 'equipped', full: true,
    collection: { iron_warlord_skull: { r: 0, t: 0 } } },
  { name: 'duplicate_missing_ossuary_full_refusal', held: null, full: true, collection: high },
  { name: 'fourth_part_unlock', held: 'equipped', collection: completeBefore, part: 'legs' },
];

for (const file of ['game.html', 'game-easy-test.html']) {
  const source = readFileSync(new URL(file, root), 'utf8');
  const blocks = [...constants.map(n => extract(source, n, true)),
    ...functions.map(n => extract(source, n, false))];
  if (source.includes('function _invCategoryKey(')) blocks.push(extract(source, '_invCategoryKey', false));
  sources.push({ file, sha256: hash(source), blocks: blocks.map(({ code, ...b }) => b) });
  for (const entry of cases) {
    for (const seed of [0, 7, 0xffffffff]) for (const demo of [false, true]) {
      const r = run(file, blocks, { ...entry, seed, demo });
      records.push(r);
      assert.equal(r.rng.creation, 1, 'actual mkBonePart id RNG');
      assert.equal(r.bagIdentityPreserved, true);
      const refusal = entry.full;
      assert.equal(r.result, !refusal);
      assert.equal(r.calls.saves, refusal ? 0 : 1);
      assert.equal(r.calls.mkItem.length, entry.held ? 0 : 1);
      if (!entry.held) { expectOssuary(r); assert.ok(r.rng.pickup > 2, 'actual item generation consumes RNG'); }
      if (refusal) {
        assert.deepEqual(r.inventory.bag, r.before.bag);
        assert.deepEqual(r.inventory.ossCollect, r.before.ossCollect);
        assert.deepEqual(r.calls.samples, []);
        assert.equal(r.item._pickT, undefined);
        if (entry.held) assert.equal(r.rng.pickup, 0);
      } else if (entry.name === 'duplicate_lower_to_bag') {
        assert.equal(r.calls.samples.length, 1);
        assert.match(r.calls.samples[0][0], /^pickup_(item|rummage[1-5])$/);
        assert.equal(r.rng.pickup, 2);
        assert.equal(r.calls.pickedUp, 1);
        assert.equal(r.item._gx, 0); assert.equal(r.item._gy, 0);
        assert.deepEqual(r.inventory.ossCollect, high);
      } else {
        assert.equal(r.calls.samples.length, 1);
        assert.equal(r.calls.samples[0][0], 'ghost_laugh');
        assert.equal(r.calls.samples[0][1], .8);
        assert.ok(r.calls.samples[0][2] >= 1.08 && r.calls.samples[0][2] < 1.32);
        if (entry.held) assert.equal(r.rng.pickup, 1);
        assert.equal(r.calls.pickedUp, 0);
        assert.equal(r.inventory.ossCollect[`iron_warlord_${entry.part || 'skull'}`].r, 0);
        if (entry.name === 'fourth_part_unlock') {
          assert.deepEqual(r.calls.shakes, [2]);
          assert.ok(r.calls.notifications.some(n => n.includes('전대 해금!')));
        }
      }
    }
    groups.push({ file, name: entry.name, status: 'PASS', fixtures: 6 });
  }
  const first = run(file, blocks, { ...cases[0], seed: 7, demo: false });
  const stubbed = run(file, blocks, { ...cases[0], seed: 7, demo: false, mutant: 'stub_mkItem' });
  assert.ok(first.rng.pickup > stubbed.rng.pickup);
  assert.notDeepEqual(first.inventory.equipped.ossuary, stubbed.inventory.equipped.ossuary);
  groups.push({ file, name: 'negative_control_detects_mkItem_stub', status: 'PASS',
    actualPickupRng: first.rng.pickup, stubPickupRng: stubbed.rng.pickup });
  const normal = run(file, blocks, { ...cases[1], seed: 7, demo: false });
  const silentPitch = run(file, blocks, { ...cases[1], seed: 7, demo: false,
    mutant: 'omit_registration_pitch' });
  assert.equal(normal.rng.pickup, 1); assert.equal(silentPitch.rng.pickup, 0);
  assert.notEqual(normal.nextRng, silentPitch.nextRng);
  groups.push({ file, name: 'negative_control_detects_registration_pitch_RNG', status: 'PASS' });
}

const bagEvidence = bag => ({ count: bag.length, sha256: hash(JSON.stringify(bag)),
  items: bag.length < 5 ? bag : undefined,
  fixture: bag.length >= 1200 ? '1200 source-grid bonePart occupiers, generated by the harness (10 columns x 120 rows)' : undefined });
const evidence = { checkedAt: new Date().toISOString(), kind: 'independent_source_fixture',
  groupCount: groups.length, fixtureRuns: records.length, groups, sources,
  records: records.map(({ before, inventory, ...r }) => ({ ...r,
    before: { ...before, bag: bagEvidence(before.bag) },
    inventory: { ...inventory, bag: bagEvidence(inventory.bag) } })),
  productionChanges: 0, ownerSourceChanges: 0, browserRuns: 0, serverRuns: 0,
  audioPlayback: 0, storageWritesByExtractedFunctions: 0,
  limits: ['Source functions execute in VM with synthetic inventory and seeded RNG.',
    'Audio/stat/save/UI helper bodies are not executed; counters record calls only.',
    'No claim about whole-game RNG, decoded audio, native UI, actual saves, or packages.',
    'Missing ossuary is granted before duplicate full-bag refusal in current sources.'] };
writeFileSync(new URL('mkitem-sideeffects-evidence.json', import.meta.url), JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify({ groups: groups.length, fixtureRuns: records.length,
  status: 'PASS', files: sources.map(x => ({ file: x.file, sha256: x.sha256 })),
  firstRegistrationPickupRng: records.filter(r => r.name === cases[0].name)
    .map(r => ({ file: r.file, seed: r.seed, demo: r.demo, count: r.rng.pickup })),
  limits: evidence.limits }, null, 2));
