'use strict';

// Actual source acceptance: whole registered keydown/gameConfirm/salvage helpers,
// and actual renderInv filter + bulk-junk statements. DOM/event transport,
// localization, detail/render layout, audio and save sinks are doubles.
// No browser/native input, app, disk save, full renderer or detached-button test.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const {parseExpressionAt} = require('acorn');
const ROOT = path.resolve(__dirname, '..');
const baseline = process.argv.includes('--baseline');
const sha = x => createHash('sha256').update(x).digest('hex');
const ORIGINAL_CALLBACK = "async()=>{\n        if(!await gameConfirm(_L(\"{p0} 쓰레기 {p1}개를 일괄 분해합니다.<br>{p2} {p3} 악의 획득.<br><br>{p4} 중요잠금 아이템은 제외됩니다.<br>{p5} 복구 불가!\",\"{p0} Bulk salvage {p1} junk items.<br>{p2} {p3} Malice gained.<br><br>{p4} Favorited items excluded.<br>{p5} Cannot undo!\",{p0:_glyph('trash','#cc9944',15),p1:_jkItems.length,p2:_glyph('demon','#cc66ff',15),p3:_jkTot,p4:_glyph('warn','#ffaa33',15),p5:_glyph('warn','#ff6644',15)}),null,null,true))return;\n        INV.bag=INV.bag.filter(it=>!_jkItems.includes(it));\n        G.mats+=_jkTot;_invSalSel.clear();INV.selected=null;\n        SFX.pickup();dbSaveNow();renderInv();\n      }";
const clone = x => JSON.parse(JSON.stringify(x));

function extract(text) {
  const blocks = [];
  function part(name, start, end) {
    assert(start >= 0 && end > start, name);
    const code = text.slice(start, end);
    blocks.push({name, line: text.slice(0, start).split('\n').length,
      bytes: Buffer.byteLength(code), sha256: sha(code)});
    return code;
  }
  function fn(name) {
    const match = new RegExp('^function ' + name + '\\(', 'm').exec(text);
    assert(match, name);
    return part(name, match.index, parseExpressionAt(text, match.index, {ecmaVersion: 'latest'}).end);
  }
  const renderStart = text.indexOf('function renderInv(');
  const renderer = parseExpressionAt(text, renderStart, {ecmaVersion: 'latest'});
  const statements = renderer.body.body;
  const declaration = name => statements.findIndex(n => n.type === 'VariableDeclaration' &&
    n.declarations.some(d => d.id.name === name));
  const fi = declaration('filtered'), ji = declaration('_jkBtn');
  assert(fi >= 0 && statements[fi + 1].type === 'ForStatement');
  assert(ji >= 0 && statements[ji + 1].type === 'IfStatement');
  const filter = part('actual renderInv filter statements', statements[fi].start, statements[fi + 1].end);
  const bulk = part('actual renderInv bulk-junk statements', statements[ji].start, statements[ji + 1].end);
  const marker = "addEventListener('keydown',";
  const keyStart = text.indexOf(marker + 'e=>{') + marker.length;
  assert(keyStart >= marker.length, 'whole keydown registration');
  const keyAst = parseExpressionAt(text, keyStart, {ecmaVersion: 'latest'});
  assert.equal(keyAst.type, 'ArrowFunctionExpression');
  const key = part('whole registered global keydown', keyStart, keyAst.end);
  const modalDeclarations = text.indexOf("const _gcEl=document.getElementById('gcModal');");
  const modalFunction = text.indexOf('function gameConfirm(', modalDeclarations);
  const modal = part('actual modal declarations + whole gameConfirm', modalDeclarations,
    parseExpressionAt(text, modalFunction, {ecmaVersion: 'latest'}).end);
  const callbackMarker = '_jkBtn.onclick=';
  const cbStart = text.indexOf(callbackMarker, statements[ji].start) + callbackMarker.length;
  assert(cbStart >= callbackMarker.length);
  const cbEnd = parseExpressionAt(text, cbStart, {ecmaVersion: 'latest'}).end;
  const callback = part('actual bulk callback', cbStart, cbEnd);
  const program = [fn('_itemEconomyRarity'), fn('salvageVal'), fn('_invCategoryMatches'), modal,
    'let _invHover=-1;',
    'function renderInv(){observeRender();\n' + filter + '\n' + bulk + '\n}',
    marker + key + ');'].join('\n');
  new vm.Script(program);
  return {program, blocks, callback, cbStart, cbEnd};
}

class DomDouble {
  constructor(id) {
    this.id = id; this.dataset = {}; this.style = {}; this.textContent = ''; this.innerHTML = '';
    this.classes = new Set();
    this.classList = {contains: x => this.classes.has(x), add: x => this.classes.add(x), remove: x => this.classes.delete(x)};
  }
  click() { return this.onclick?.({target: this}); }
  closest() { return null; }
}
const SCENARIOS = ['normal', 'modal-cancel', 'before-fav', 'before-junk-cleared',
  'pending-keyF', 'pending-keyX', 'pending-removed', 'pending-replaced',
  'pending-equipped', 'new-junk-after-confirm', 'mixed-original-only',
  'all-invalid-keyF', 'before-all-invalid', 'cancel-after-keyF'];
const CONTROL_SCENARIOS = ['normal', 'modal-cancel', 'new-junk-after-confirm', 'cancel-after-keyF'];

async function run(program, scenario) {
  const nodes = new Map(['invPanel', 'invJunkBtn', 'gcModal', 'gcMsg', 'gcOk', 'gcCancel'].map(id => [id, new DomDouble(id)]));
  nodes.get('invPanel').classes.add('on');
  nodes.get('invPanel').dataset.inventoryPage = 'equipment';
  const events = [], listeners = new Map();
  const item = (id, rarity = 0) => ({id, name: id, slot: 'armor', rarity, tier: 0, enh: 0, junk: true, fav: false});
  const A = item('A'), B = item('B', 1), C = item('C', 2), R = item('R'), N = item('N');
  const single = ['all-invalid-keyF', 'before-all-invalid'].includes(scenario);
  const bag = single ? [A] : scenario === 'mixed-original-only' ? [A, B, C] : [A, B];
  const record = name => (...args) => events.push({name, args});
  const context = vm.createContext({Element: DomDouble,
    document: {getElementById: id => nodes.get(id)}, $: id => nodes.get(id),
    addEventListener: (name, listener) => {assert(!listeners.has(name)); listeners.set(name, listener);},
    window: {}, listeningBind: null, K: {}, KH: {}, BINDS: {}, BINDS2: {},
    INV: {bag, equipped: {armor: null}, selected: 0}, _invSalSel: new Set([0]),
    G: {on: true, paused: true, mats: 500}, P: {x: 0, y: 0, lv: 10, s: 'idle'},
    invFilter: {slot: null, rarity: null, el: null},
    _glyph: () => '', _L: (ko, en, args = {}) => ko.replace(/\{([^}]+)\}/g, (m, k) => String(args[k] ?? m)),
    observeRender: record('renderInv'), _invRenderDetail: record('detail'),
    SFX: {pickup: record('SFX.pickup')}, dbSaveNow: record('dbSaveNow')});
  context.Math = Object.create(Math);
  let rng = 0;
  context.Math.random = () => {rng++; throw Error('unexpected RNG');};
  vm.runInContext(program, context);
  vm.runInContext('renderInv()', context);
  assert(listeners.has('keydown'), 'actual whole keydown registered');
  events.length = 0;
  if (scenario === 'before-fav' || scenario === 'before-all-invalid') {A.fav = true; A.junk = false;}
  if (scenario === 'before-junk-cleared') A.junk = false;
  const work = nodes.get('invJunkBtn').click(); // Connected current button; no saved detached callback invocation.
  assert(work && typeof work.then === 'function');
  const opened = nodes.get('gcModal').classes.has('on');
  const quote = nodes.get('gcMsg').innerHTML;
  const key = code => {
    const event = {code, target: nodes.get('gcOk'), repeat: false, ctrlKey: false, metaKey: false,
      preventDefault: record('keydown.preventDefault'), stopPropagation() {}};
    listeners.get('keydown')(event); // Synthetic transport into whole actual registered listener.
    assert.equal(A.fav, code === 'KeyF');
    assert.equal(A.junk, false);
  };
  if (opened) {
    if (['pending-keyF', 'all-invalid-keyF', 'cancel-after-keyF', 'mixed-original-only'].includes(scenario)) key('KeyF');
    if (scenario === 'pending-keyX') key('KeyX');
    if (scenario === 'pending-removed') context.INV.bag.splice(0, 1);
    if (scenario === 'pending-replaced') context.INV.bag[0] = R;
    if (scenario === 'pending-equipped') context.INV.equipped.armor = A; // Synthetic inconsistent bag/equip boundary.
    if (scenario === 'new-junk-after-confirm') context.INV.bag.push(N);
    if (scenario === 'mixed-original-only') {context.INV.bag[2] = R; context.INV.bag.push(N);}
    nodes.get(['modal-cancel', 'cancel-after-keyF'].includes(scenario) ? 'gcCancel' : 'gcOk').click();
  }
  await work;
  const result = clone({opened, quote, closed: !nodes.get('gcModal').classes.has('on'),
    bag: context.INV.bag.map(it => it.id), equipped: context.INV.equipped.armor?.id ?? null,
    mats: context.G.mats, selected: context.INV.selected, salvageSelected: [...context._invSalSel],
    A: {fav: A.fav, junk: A.junk}, B: {fav: B.fav, junk: B.junk}, events, rng});
  return result;
}

function verify(scenario, result) {
  let bag, mats;
  if (['normal', 'new-junk-after-confirm'].includes(scenario)) {bag = scenario === 'normal' ? [] : ['N']; mats = 3500;}
  else if (['modal-cancel', 'cancel-after-keyF'].includes(scenario)) {bag = ['A', 'B']; mats = 500;}
  else if (['all-invalid-keyF', 'before-all-invalid'].includes(scenario)) {bag = ['A']; mats = 500;}
  else if (scenario === 'pending-removed') {bag = []; mats = 2500;}
  else if (scenario === 'pending-replaced') {bag = ['R']; mats = 2500;}
  else if (scenario === 'mixed-original-only') {bag = ['A', 'R', 'N']; mats = 2500;}
  else {bag = ['A']; mats = 2500;}
  assert.deepEqual(result.bag, bag, 'only originally quoted and currently eligible objects may be removed');
  assert.equal(result.mats, mats, 'reward must match only actual current eligible removals');
  assert(result.closed, 'actual modal resolution must close the modal');
  const committed = mats > 500;
  assert.equal(result.events.filter(e => e.name === 'SFX.pickup').length, +committed);
  assert.equal(result.events.filter(e => e.name === 'dbSaveNow').length, +committed);
  const keyUsed = ['pending-keyF', 'pending-keyX', 'all-invalid-keyF', 'cancel-after-keyF', 'mixed-original-only'].includes(scenario);
  assert.equal(result.events.filter(e => e.name === 'renderInv').length, +committed + +keyUsed);
  assert.equal(result.selected, committed ? null : 0);
  assert.deepEqual(result.salvageSelected, committed ? [] : [0]);
  assert.equal(result.rng, 0);
  if (scenario === 'before-all-invalid') assert.equal(result.opened, false, 'invalid entry must not open a confirmation');
  if (scenario === 'before-fav' || scenario === 'before-junk-cleared') {
    assert.match(result.quote, /쓰레기 1개/);
    assert.match(result.quote, /2000 악의 획득/);
  }
}

(async () => {
  const sources = ['game.html', 'game-easy-test.html'].map(file => {
    const bytes = fs.readFileSync(path.join(ROOT, file));
    return {file, bytes: bytes.length, sha256: sha(bytes), text: bytes.toString('utf8')};
  });
  const rows = [], controls = [], failures = [], fixtureErrors = [];
  let pass = 0, fail = 0, contexts = 0;
  for (const source of sources) {
    const current = extract(source.text);
    if (baseline) assert.equal(current.callback, ORIGINAL_CALLBACK);
    else assert(current.callback.includes('const _canJunk='), 'production current guard missing');
    const original = baseline ? current : extract(source.text.slice(0, current.cbStart) + ORIGINAL_CALLBACK + source.text.slice(current.cbEnd));
    source.blocks = current.blocks;
    for (const scenario of SCENARIOS) {
      let result;
      try {
        contexts++; result = await run(current.program, scenario);
      } catch (e) {fixtureErrors.push({file: source.file, scenario, name: e.name, error: e.message}); continue;}
      rows.push({file: source.file, scenario, result});
      try {verify(scenario, result); pass++;}
      catch (e) {fail++; failures.push({file: source.file, scenario, error: e.message});}
    }
    if (!baseline) for (const scenario of CONTROL_SCENARIOS) {
      contexts += 2;
      const currentResult = await run(current.program, scenario), originalResult = await run(original.program, scenario);
      assert.deepEqual(currentResult, originalResult, 'normal/cancel effects, quote and state must equal exact original source');
      controls.push({file: source.file, scenario, equal: true, result: currentResult});
    }
    delete source.text;
    assert.equal(sha(fs.readFileSync(path.join(ROOT, source.file))), source.sha256);
  }
  console.log(JSON.stringify({mode: baseline ? 'actual-disk-baseline' : 'actual-disk-final-with-exact-original-controls',
    counts: {groups: pass + fail, pass, fail, fixtureErrors: fixtureErrors.length, sourceContexts: contexts, normalControls: controls.length},
    sources, rows, controls, failures, fixtureErrors,
    limits: ['Whole registered keydown F/X and whole actual gameConfirm/gcOk/cancel executed through synthetic DOM/event transport.',
      'Only actual renderInv filter and bulk-junk statements; full renderer/layout/focus/detail excluded.',
      'Before-entry and bag/equip identity mutations are synthetic boundaries; mixed duplicate bag/equip state is synthetic.',
      'Partial successful batch clears selection as original successful commit; no eligible batch leaves current selection untouched.',
      'Newly added junk is outside originally quoted object set; no detached-button lifetime or GPB candidate.',
      'Audio/save/detail/localization are observer doubles; real keyboard/native/storage/audio/RAF/app/full game UNKNOWN.'],
    fixtureFilesWritten: 0, productionWritesByTest: 0, existingTestsRepeated: 0}));
  process.exitCode = fail || fixtureErrors.length ? 1 : 0;
})().catch(error => {console.error(JSON.stringify({fixturePreparationError: {name: error.name, error: error.message}})); process.exitCode = 2;});
