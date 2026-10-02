// continuous-QUESTNPC-first-item: new source boundary only; no production writes.
// Real fragments: update guards/pet call, updatePet, pet dispatcher prefix/functions,
// pickupItem, system-lesson.js and tutorial-badges.js. All stubs are listed below.
// The dispatcher tail after the Stage-0 tutorial block is intentionally excluded.
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
assert.equal(repo, '/Users/fordeargamers/Projects/exoduser-migration-20261001');
const sha = text => crypto.createHash('sha256').update(text).digest('hex');
const receipts = [];
const cases = [];
function oneIndex(text, needle, from = 0) {
  const i = text.indexOf(needle, from);
  assert.ok(i >= 0, 'source marker missing: ' + needle);
  assert.equal(text.indexOf(needle, i + needle.length), -1, 'source marker ambiguous: ' + needle);
  return i;
}
function fragment(file, source, name, from, to) {
  assert.ok(to > from);
  const text = source.slice(from, to);
  const r = { file, name, fromLine: source.slice(0, from).split('\n').length,
    toLine: source.slice(0, to - 1).split('\n').length, sha256: sha(text) };
  receipts.push(r);
  return text;
}
function between(file, source, name, first, last) {
  const start = oneIndex(source, first);
  return fragment(file, source, name, start, oneIndex(source, last, start + first.length));
}
function functionText(file, source, name) {
  const start = oneIndex(source, 'function ' + name + '(');
  const brace = source.indexOf('{', start);
  let depth = 0, mode = '';
  for (let i = brace; i < source.length; i++) {
    const c = source[i], n = source[i + 1];
    if (mode === 'line') { if (c === '\n') mode = ''; continue; }
    if (mode === 'block') { if (c === '*' && n === '/') { mode = ''; i++; } continue; }
    if (mode) {
      if (c === '\\') { i++; continue; }
      if (c === mode) mode = '';
      continue;
    }
    if (c === '/' && n === '/') { mode = 'line'; i++; continue; }
    if (c === '/' && n === '*') { mode = 'block'; i++; continue; }
    if (c === "'" || c === '"' || c.charCodeAt(0) === 96) { mode = c; continue; }
    if (c === '{') depth++;
    if (c === '}' && --depth === 0) return fragment(file, source, name, start, i + 1);
  }
  throw new Error('source function boundary changed: ' + name);
}
const lessonPath = path.join(repo, 'system-lesson.js');
const badgePath = path.join(repo, 'tutorial-badges.js');
const lessonSource = fs.readFileSync(lessonPath, 'utf8');
const badgeSource = fs.readFileSync(badgePath, 'utf8');
const supportSources = [{ path: lessonPath, sha256: sha(lessonSource) },
  { path: badgePath, sha256: sha(badgeSource) }];

function loadParts(file) {
  const source = fs.readFileSync(file, 'utf8');
  const init = between(file, source, 'pet initial state', 'const _petBubble=', '// v4 변수');
  const priority = between(file, source, 'priority constants/state',
    'const _PET_TIER_COOL=', '// id → 티어 추론');
  const averageStart = oneIndex(source, 'let _petEnemyAvgAtk=');
  const average = fragment(file, source, 'enemy average state', averageStart,
    source.indexOf(';', averageStart) + 1);
  const opacityStart = oneIndex(source, 'const _PET_OP_MAX=');
  const opacity = fragment(file, source, 'pet opacity constant', opacityStart,
    source.indexOf(';', opacityStart) + 1);
  const prefix = between(file, source, '_checkPetDialogue through Stage-0 block',
    'function _checkPetDialogue(){', '  // 탄막 기본 가이드');
  const firstLines = prefix.split('\n').filter(l => l.includes('if(!_petTut.firstItem&&INV.bag.length>=1)'));
  assert.equal(firstLines.length, 1, 'firstItem branch changed');
  const oldLine = firstLines[0];
  assert.ok(oldLine.includes('{_petTut.firstItem=true;_petSayCD('));
  assert.ok(oldLine.endsWith(';return}'));
  const call = oldLine.slice(oldLine.indexOf('_petSayCD('), oldLine.lastIndexOf(';return}'));
  const newLine = oldLine.slice(0, oldLine.indexOf('{')) +
    '{if(' + call + ')_petTut.firstItem=true;return}';
  const patched = prefix.replace(oldLine, newLine);
  assert.notEqual(patched, prefix);
  const guards = between(file, source, 'update prefix through pause guard',
    'function update(){', '  // null 엔트리 정리');
  assert.ok(guards.includes('if(!G.on)return;'));
  assert.ok(guards.includes('if(window._parryLesson&&window._parryLesson.tick())return;'));
  assert.ok(guards.includes('if(_EDITOR_MODE){_editorUpdate();return}'));
  assert.ok(guards.includes('if(G.paused)return;'));
  const petLine = source.split('\n').filter(l => l.trim().startsWith('if(G.pets)updatePet();'));
  assert.equal(petLine.length, 1, 'update pet call changed');
  const petStart = source.indexOf(petLine[0]);
  fragment(file, source, 'update pet call', petStart, petStart + petLine[0].length);
  const functions = ['_petTierOf', '_petSay', '_petSayCD', '_updatePetBubble',
    '_petBidCD', '_petSayUrgent', '_petFireBid', 'updatePet', 'pickupItem']
    .map(name => functionText(file, source, name)).join('\n');
  return { file, sha256: sha(source), init, priority, average, opacity, prefix, patched,
    oldLine, newLine, guards, petLine: petLine[0], functions,
    candidatePrefixSha256: sha(patched + '\n}') };
}
const stubs = [
  'VM DOM/speech/SFX sinks; no real UI/audio',
  'movement functions are no-ops; no map/AI/render/world-spawn simulation',
  'parry tick/active input states represent completed or blocking practice; original update guards execute',
  'keyboard queries false; panel shortcuts/editor body not executed',
  'inventory grid size/space success; ordinary headband rarity1 only; no bone/ring/economy coverage',
  'pickup SFX/stats/save calls counted only; no save/HTTP/storage/file writes',
  'systemTutorial=0 uses actual eligible(); original lesson/badge modules loaded; no badge init event',
  'frame increment and dtSp=1 are harness time; later update and dispatcher tails not executed',
  'identity translation and deterministic Date; no language/pad/browser promise verification'
];
function environment(parts, candidate) {
  const context = vm.createContext({ URLSearchParams });
  const boot = [
    "var trace={shows:[],sfx:[],attempts:[],saveRequests:0,storageWrites:0,pickupSfx:0,recalc:0};",
    "var __parryBlock=false;",
    "var G={on:true,paused:false,stage:0,frame:1,bossAlive:false,_intro:false,pets:{crow:{},cat:{},xbow:{},iris:{}}};",
    "var P={lv:1,hp:100,mhp:100,mp:100,mmp:100,st:100,mst:100,s:'idle',skills:{},x:0,y:0};",
    "var INV={bag:[],equipped:{},selected:null};var STATS={str:0,dex:0,int:0};var ens=[];var SI_TO_HELL={0:0};",
    "var _dtSp=1,_MAP_QA_MODE=false,_DEMO_MODE=false,_DEMO_LAST_STAGE=3,_EDITOR_MODE=false,_bossTestReq=-1,_saving=false;",
    "var location={search:'?slot=questnpc-source-fixture&systemTutorial=0'};",
    "var window={_parryLesson:{seen:true,active:false,tick(){return __parryBlock},dismissed(){return false}}};",
    "var subtitle={style:{opacity:'0'}};var document={readyState:'loading',addEventListener(){},getElementById(){return null}};",
    "var localStorage={getItem(){throw Error('unexpected localStorage read')},setItem(){trace.storageWrites++;throw Error('unexpected localStorage write')}};",
    "var BINDS={},BINDS2={},OPT={lang:'ko'};",
    "const NativeDate=Date;Date=class extends NativeDate{constructor(...args){super(...(args.length?args:[1700000000000]))}static now(){return 1700000000000}};",
    "function $(id){return id==='petSubtitle'?subtitle:null}",
    "function _T(text){return text}function _isDruidFinale(){return false}",
    "function _petBubbleShow(who,txt){trace.shows.push({who,txt});subtitle.style.opacity='0.6'}",
    "function _petSfx(who,urgent){trace.sfx.push({who,urgent})}",
    "function _updateOnePet(){}function _updateGhostXbow(){}function _updateGhostIris(){}",
    "function isJust(){return false}function _chkJust(){return false}function _editorUpdate(){}",
    "function _itemSz(){return [1,1]}function _invFindSpace(){return {x:0,y:0}}",
    "function notify(){}function _rarName(r){return 'R'+r}",
    "function playItemPickupSfx(){trace.pickupSfx++}function playEquipSfx(){}",
    "function recalcSt(){trace.recalc++}function applyStats(){}function dbSaveForce(){trace.saveRequests++}",
    "function _boneRegister(){throw Error('unexpected bone path')}function _grantOssuaryIfNeeded(){throw Error('unexpected bone path')}"
  ].join('\n');
  vm.runInContext(boot, context);
  vm.runInContext(lessonSource, context, { filename: lessonPath });
  vm.runInContext(badgeSource, context, { filename: badgePath });
  const check = (candidate ? parts.patched : parts.prefix) + '\n}';
  // Exact source guard prefix/call; omitted middle update logic is explicit.
  const update = parts.guards + '\nG.frame++; // harness-only frame clock\n' + parts.petLine + '\n}';
  vm.runInContext([parts.init, parts.priority, parts.average, parts.opacity,
    parts.functions, check, update].join('\n'), context, { filename: parts.file + ':fragment' });
  vm.runInContext([
    "const originalSayCD=_petSayCD;",
    "_petSayCD=function(...args){const ok=originalSayCD(...args);trace.attempts.push({id:args[0],accepted:ok});return ok};"
  ].join('\n'), context);
  const run = text => vm.runInContext(text, context);
  const snap = () => JSON.parse(run("JSON.stringify({firstItem:_petTut.firstItem,flags:_petTut," +
    "bubble:_petBubble,dlgCD:_petDlgCD,tierCD:_petTierCD,trace," +
    "bag:INV.bag,equipped:INV.equipped," +
    "guide:{active:window._systemLesson.active,seen:window._systemLesson.seen,closed:window._systemLesson.closed," +
    "checks:Array.from(window._systemLesson.checks),skipped:Array.from(window._systemLesson.skipped)}," +
    "badges:window._tutorialBadges.earned||null})"));
  const tick = n => { for (let i = 0; i < n; i++) run('update()'); };
  const pickup = id => assert.equal(run("pickupItem({id:'" + id + "',slot:'headband',rarity:1,name:'source fixture ordinary gear'})"), true);
  const settle = () => tick(730);
  const prepareSuccess = () => { tick(1); settle(); pickup('seed'); pickup('bag'); tick(1); };
  return { run, snap, tick, pickup, settle, prepareSuccess };
}
function firstAttempts(state) { return state.trace.attempts.filter(a => a.id === 'tut_firstItem'); }
function firstCat(state) { return state.trace.shows.filter(a => a.who === 'cat' && a.txt === '주웠으면 껴야지! TAB!'); }
function noBadgeSideEffects(state) {
  assert.deepEqual(state.guide.checks, []);
  assert.deepEqual(state.guide.skipped, []);
  assert.equal(state.badges, null);
  assert.equal(state.trace.storageWrites, 0);
}
for (const filename of ['game.html', 'game-easy-test.html']) {
  const parts = loadParts(path.join(repo, filename));
  const before = environment(parts, false), after = environment(parts, true);
  // Bubble/CD arise from a real prior tut_start; pickups use real current pickupItem.
  before.pickup('seed'); after.pickup('seed');
  before.tick(1); after.tick(1);
  assert.deepEqual(before.snap(), after.snap());
  before.pickup('bag'); after.pickup('bag');
  const prior = before.snap();
  assert.equal(prior.bubble.who, 'crow');
  assert.ok(prior.bubble.t > 0 && prior.tierCD[1] > 0);
  before.tick(1); after.tick(1);
  const rejectedBefore = before.snap(), rejectedAfter = after.snap();
  assert.equal(rejectedBefore.firstItem, true);
  assert.equal(rejectedAfter.firstItem, false);
  assert.deepEqual(firstAttempts(rejectedBefore), [{ id: 'tut_firstItem', accepted: false }]);
  assert.deepEqual(firstAttempts(rejectedAfter), [{ id: 'tut_firstItem', accepted: false }]);
  assert.equal(rejectedBefore.dlgCD.tut_firstItem, undefined);
  assert.equal(rejectedAfter.dlgCD.tut_firstItem, undefined);
  before.settle(); after.settle();
  const resumedBefore = before.snap(), resumedAfter = after.snap();
  assert.equal(firstAttempts(resumedBefore).filter(a => a.accepted).length, 0);
  assert.equal(firstAttempts(resumedAfter).filter(a => a.accepted).length, 1);
  assert.equal(resumedAfter.firstItem, true);
  assert.equal(resumedBefore.trace.saveRequests, resumedAfter.trace.saveRequests);
  noBadgeSideEffects(resumedBefore); noBadgeSideEffects(resumedAfter);
  cases.push({ source: filename, case: 'reachable-refusal-and-reentry', status: 'PASS',
    currentDesiredBehavior: 'FAIL_OBSERVED: consumed-without-accepted-firstItem',
    candidateDesiredBehavior: 'PASS: rejected flag retained then accepted once',
    generatedPriorBubble: { who: prior.bubble.who, t: prior.bubble.t, tier1CD: prior.tierCD[1] },
    currentAttempts: firstAttempts(resumedBefore).length,
    candidateAttempts: firstAttempts(resumedAfter).length,
    candidateAccepted: firstAttempts(resumedAfter).filter(a => a.accepted).length });
  // Normal path: earlier tut_start fully expires before bag acquisition.
  const normalBefore = environment(parts, false), normalAfter = environment(parts, true);
  normalBefore.prepareSuccess(); normalAfter.prepareSuccess();
  assert.deepEqual(normalBefore.snap(), normalAfter.snap());
  normalBefore.tick(550); normalAfter.tick(550);
  const normal = normalAfter.snap();
  assert.deepEqual(normalBefore.snap(), normal);
  assert.equal(firstAttempts(normal).filter(a => a.accepted).length, 1);
  assert.equal(firstCat(normal).length, 1);
  noBadgeSideEffects(normal);
  cases.push({ source: filename, case: 'normal-path-state-and-dialogue-equivalence', status: 'PASS',
    accepted: 1, firstItemCatShows: 1, inventoryAndSaveStubCallsEqual: true,
    compared: 'flags/bubble/pair/CD/tierCD/message/SFX order/pickup objects/guide/badge/sinks' });
  // Accepted crow speech can still lose its cat pair to real T5 priority.
  const interruptBefore = environment(parts, false), interruptAfter = environment(parts, true);
  interruptBefore.prepareSuccess(); interruptAfter.prepareSuccess();
  interruptBefore.run('P.hp=5'); interruptAfter.run('P.hp=5');
  interruptBefore.tick(1); interruptAfter.tick(1);
  assert.deepEqual(interruptBefore.snap(), interruptAfter.snap());
  assert.equal(interruptAfter.snap().bubble._uid, 'hp_critical');
  interruptBefore.run('P.hp=100'); interruptAfter.run('P.hp=100');
  interruptBefore.tick(730); interruptAfter.tick(730);
  const interrupted = interruptAfter.snap();
  assert.deepEqual(interruptBefore.snap(), interrupted);
  assert.equal(interrupted.firstItem, true);
  assert.equal(firstCat(interrupted).length, 0);
  assert.equal(firstAttempts(interrupted).filter(a => a.accepted).length, 1);
  noBadgeSideEffects(interrupted);
  cases.push({ source: filename, case: 'accepted-then-urgent-interrupted-no-replay', status: 'PASS',
    firstItemAccepted: 1, firstItemCatShows: 0,
    limitation: 'success means crow accepted/pair scheduled; does not prove Diroy pair displayed' });
  // Negative cases execute the original caller guards, not a forged lower-function bubble.
  for (const candidate of [false, true]) {
    for (const setup of ['G.on=false', 'G.paused=true',
      '__parryBlock=true;window._parryLesson.active=true', '_EDITOR_MODE=true', 'G.pets=null']) {
      const guarded = environment(parts, candidate);
      guarded.pickup('seed'); guarded.pickup('bag'); guarded.run(setup); guarded.tick(1);
      const state = guarded.snap();
      assert.equal(state.flags.start, false);
      assert.equal(state.firstItem, false);
      assert.equal(state.trace.attempts.length, 0);
      noBadgeSideEffects(state);
    }
  }
  cases.push({ source: filename, case: 'actual-caller-guards', status: 'PASS',
    guardsPerVariant: 5, variants: 2 });
  supportSources.push({ path: parts.file, sha256: parts.sha256,
    candidatePrefixSha256: parts.candidatePrefixSha256,
    candidateChange: 'firstItem assignment moves after true _petSayCD return; unconditional return preserved',
    currentLine: parts.oldLine, candidateLine: parts.newLine });
}
console.log(JSON.stringify({
  taskId: 'continuous-QUESTNPC-first-item', executionCount: 1,
  proofGroups: cases.length, passGroups: cases.filter(c => c.status === 'PASS').length,
  expectedCurrentDefectCases: 2, productionApplied: false, previousChecksRerun: 0,
  sources: supportSources, fragments: receipts, stubs, cases,
  limits: ['source fragments/VM only, no actual browser/game/UI/audio/save/HTTP',
    'dispatcher after Stage-0 and middle gameplay update excluded; lower-priority starvation not proven absent',
    'accepted firstItem can still lose cat pair; no new cancellation/session/save API']
}, null, 2));

