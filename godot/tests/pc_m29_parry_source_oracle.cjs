// PC-M29-PARRY independent oracle: runs UNTOUCHED game.html statements in a Node VM.
// Extracted verbatim: isPWin(G38469), _lParryWinTicks(G16622), _PARRY_WIN(G8670), doParry(G38470-38575),
// _poiseHit(G19972-19998), eModHitP(G31098-31116), case'eCharge'(G40527-40538).
// Every other identifier is a recording stub. No product-module imports. Output is a UTF-8 JSON file.
// INTEG-9 (2026-10-22): source bytes = immutable snapshot godot/source_snapshot/game.html (snapshot.cjs, SHA-pinned
// dee094fd…1f05209 = main 91e2774b7; 이전 4d911cdd…85e5d4 = e556b617), same as the Mac bc2_*/demo11_16 oracles. Root game.html moves (189899b4… title line) and is never read.
// The first positional arg is kept for caller compatibility but not used for bytes.
'use strict';
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const [sourcePath, outputPath] = process.argv.slice(2);
assert(sourcePath && outputPath, 'usage: node oracle.cjs <game.html> <out.json>');
const SNAPSHOT = require('../source_snapshot/snapshot.cjs');
const raw = SNAPSHOT.readBytes(); // throws on snapshot SHA mismatch
const sha256 = crypto.createHash('sha256').update(raw).digest('hex');
const lines = raw.toString('utf8').split('\n');
// 91e2774b7 스냅샷 갱신(2026-10-22): 원본 유골함 mkItem에 2줄 삽입(새 16156-16157). 이 oracle의 행 번호(G…)는 포트 영수증·
// 고정 데이터와 같은 이전 스냅샷 e556b617 좌표로 유지하고, 바이트를 읽을 때만 새 위치로 옮긴다(16156 이상 +2).
// 삽입 줄을 가로지르는 구간은 거절한다(해당 구간은 새 좌표로 따로 다뤄야 함).
const SHIFT_AT = 16156, SHIFT_BY = 2;
assert(lines[SHIFT_AT - 1].includes('원시 효과 키') && lines[SHIFT_AT].startsWith('    if(item.legendarySpecial)delete item[item.legendarySpecial.stat];'), 'G16156-16157 inserted ossuary lines (91e2774b7)');
const snapLine = (n) => (n >= SHIFT_AT ? n + SHIFT_BY : n);
const L = (n) => lines[snapLine(n) - 1];
const span = (a, b) => { assert(a >= SHIFT_AT || b < SHIFT_AT, 'span straddles 91e2774b7 insertion: ' + a + '-' + b); return lines.slice(snapLine(a) - 1, snapLine(b)).join('\n'); };
// Exact anchors (fail loudly if the source moved).
assert(L(8670).startsWith('var _PARRY_WIN=16;'), 'G8670 _PARRY_WIN');
assert(L(16622).startsWith('function _lParryWinTicks(){'), 'G16622');
assert(L(19972).startsWith('function _poiseHit(e, amt, label){') && L(19999).startsWith('// 보스 포이즈 리셋'), 'G19972 _poiseHit');
assert(L(31098).startsWith('function eModHitP(e){') && L(31116) === '}', 'G31098 eModHitP');
assert(L(38469).startsWith('function isPWin(){') && L(38470).startsWith('function doParry('), 'G38469/38470');
assert(L(38575).includes("showPH('PARRY!','#ffdd00');}"), 'G38575 doParry end');
assert(L(40527).trim() === "case'eCharge':{" && L(40538).includes("if(e.st2<=0){e.s='recover';e.st2=30}break}"), 'G40527-40538 eCharge');
assert(L(40533).includes('if(isPWin()){P.parryBank=(P.parryBank||0)+(e.atk||10);'), 'G40533');
assert(L(40534).includes("doParry(e.atk,e.x,e.y,false,e.el);_poiseHit(e,20)}"), 'G40534');
assert(L(40535).includes('else if(P.s!==\'charge\'){hurtP(~~(e.atk*30*elMul(e.el,ar().el)));eModHitP(e);'), 'G40535');

let trace = [], rng = [], rngUnits = [], rngCursor = 0, inside = 0, cfg = {};
const rec = (name) => (...args) => { if (!inside) trace.push({ call: name, args: JSON.parse(JSON.stringify(args)) }); return undefined; };
const ctx = {
  console, Infinity, NaN, undefined, Object, Array, JSON, Number, String, Boolean, Set, Map,
  Math: Object.create(Math),
  window: { _parryLesson: undefined, _tvfx2: [] },
  EL: { P: 0, F: 1, I: 2, D: 3, L: 4, H: 5, E: 6 }, ELC: {},
  OPT: { hitStop: 100, shake: 100 }, _HS: { parry: 12 }, PASSIVES: {}, _uqS: { parryOrbT: 0, kiPreT: 0, hdF: 0, shieldBankT: 0, shieldBankAmt: 0, poiseOrbT: 0 },
  _TVFX2_COMBOS: [{}, {}, { layers: [] }], _tvfx2Imgs: {}, _HARP_GAUGE_MAX: 100, _harpGauge: 0, _uqScCtx: null,
  SFX: { deflect: rec('SFX.deflect'), detonate: rec('SFX.detonate'), groggy: rec('SFX.groggy') },
  dst: (a, b, c, d) => Math.sqrt((c - a) ** 2 + (d - b) ** 2),
  canMv: () => true, _T: (s) => s, _r: (a) => a,
};
ctx.Math.random = () => { const u = rngUnits[rngCursor++ % rngUnits.length]; rng.push(u); return u; };
for (const name of ['addTxt', 'poolPart', 'playSample', '_petOnParry', '_gpVibrate', '_tickSkyCrusherRecharge', '_petSayCD', 'doHitFlash',
  'showPH', '_addBoom', 'bigImpact', 'shake', 'addParts', '_rainbowImpact', '_dark02Impact', '_loadBossWaterImpactClip', '_loadBossFireImpactClip',
  'hurtE', '_slamStormBlast', '_detonateBlast']) ctx[name] = rec(name);
ctx._eqAffix = (k) => (cfg.eqAffix || {})[k] || 0;
ctx._uEq = () => 0;
ctx._lEq = (k) => (k === '_lCapeParry' ? (cfg.cape || 0) : 0);
ctx._rageMax = () => 100;
ctx._skyCrusherChargeCount = () => 3;
ctx._isFused = () => false;
ctx.ar = () => ({ el: 0 });
ctx.elMul = (a, d) => { trace.push({ call: 'elMul', args: [a, d] }); return cfg.elMul === undefined ? 1 : cfg.elMul; };
ctx.meleeRef = () => 0; ctx.statStr = () => 0; ctx.shQuery = () => [];
vm.createContext(ctx);
vm.runInContext(L(8670), ctx);
// top-level `var`/`function` declarations become context properties.
for (const code of [L(16622), span(19972, 19998), span(31098, 31116), L(38469), span(38470, 38575)]) vm.runInContext(code, ctx, { filename: 'game.html' });
vm.runInContext('function chargeTick(e,sp){switch(e.s){\n' + span(40527, 40538) + '\n}}', ctx, { filename: 'game.html' });
// Wrap the real functions with order recorders (still executing the untouched bodies).
for (const name of ['doParry', '_poiseHit', 'eModHitP', 'isPWin']) {
  const real = ctx[name];
  ctx[name] = function (...args) {
    if (!inside) trace.push({ call: name, args: JSON.parse(JSON.stringify(args)) });
    if (name === 'isPWin') return real.apply(this, args);
    inside++; try { return real.apply(this, args); } finally { inside--; }
  };
}
ctx.hurtP = (...args) => { trace.push({ call: 'hurtP', args }); };
const clone = (x) => JSON.parse(JSON.stringify(x));

function player(over) {
  return Object.assign({ x: 0, y: 0, r: 15, iframes: 0, s: 'idle', st2: 0, _sbParryT: 0, _kiParryT: 0, parryBank: 0,
    hp: 100, mhp: 350, st: 10, mst: 100, mp: 5, mmp: 100, poise: 2, maxPoise: 4, rage: 0, skills: {}, _gslCd: 0, _scCd: 0,
    _sBashChgMul: 1, kb: { x: 0, y: 0 } }, over || {});
}
function enemy(over) {
  return Object.assign({ s: 'eCharge', x: 50, y: 0, r: 22, atk: 7, el: 0, col: '#bbbbbb', echDx: -1, echDy: 0, _chgSpd: 32, st2: 10,
    poise: 50, maxPoise: 50, poiseR: 33, stunned: 0, alive: true, ib: false, mods: ['M29'] }, over || {});
}

// 1) isPWin truth table (real isPWin + real _lParryWinTicks via _lEq stub).
const pwin = [];
const states = ['idle', 'sBash', 'sBlock', 'peaceShield', 'whirlwind', 'beam', 'elecRepent', 'charge', 'sRecover', 'kiGather'];
for (const s of states) for (const st2 of [20, 4.0001, 4, 0]) for (const sb of [0, 0.5]) for (const ki of [0, 1]) for (const cape of [0, 0.25, 1]) {
  cfg = { cape }; ctx.P = player({ s, st2, _sbParryT: sb, _kiParryT: ki });
  trace = [];
  const value = ctx.isPWin();
  pwin.push({ state: s, st2, sb_parry_t: sb, ki_parry_t: ki, cape, value, l_parry_win_ticks: ctx._lParryWinTicks() });
}

// 2) eCharge contact cases (real branch). The enemy has already moved this tick inside the branch.
const cases = [];
function runCase(name, p, e, c) {
  cfg = c || {}; trace = []; rng = []; rngCursor = 0; rngUnits = cfg.units || [0.75, 0.25, 0.6];
  const P = player(p), E = enemy(e);
  ctx.P = P; ctx.G = { _pStats: null, _sStats: null, hitStop: 0, slowMo: 0, shake: 0, frame: 100, playTime: 0, mats: 0, _fireZones: null };
  ctx.PASSIVES = cfg.passives || {};
  const before = { P: clone(P), e: clone(E) };
  let bankWriteIndex = -1;
  const proxyP = new Proxy(P, { set(t, k, v) { if (k === 'parryBank' && !inside && bankWriteIndex < 0) { bankWriteIndex = trace.length; trace.push({ call: 'P.parryBank=', args: [v] }); } t[k] = v; return true; } });
  ctx.P = proxyP;
  const kbBefore = { x: P.kb.x, y: P.kb.y };
  ctx.chargeTick(E, cfg.sp || 1);
  cases.push({ name, input: before, sp: cfg.sp || 1, elMul: cfg.elMul === undefined ? 1 : cfg.elMul, passives: ctx.PASSIVES, eqAffix: cfg.eqAffix || {},
    order: trace.map((t) => t.call), trace, rng_draws: rng.length,
    after: { P: clone(P), e: clone(E), G: clone(ctx.G) },
    kb_delta: { x: P.kb.x - kbBefore.x, y: P.kb.y - kbBefore.y } });
}
runCase('parry_sBlock_window', { s: 'sBlock', _sbParryT: 10 }, {});
runCase('parry_idle_release_window', { s: 'idle', _sbParryT: 5 }, { atk: 0 });
runCase('parry_sBash_window_poise_break', { s: 'sBash', st2: 10 }, { poise: 15 });
runCase('parry_boss_poise_break', { s: 'sBlock', _sbParryT: 3 }, { ib: true, poise: 10 });
runCase('parry_boss_poise_immune', { s: 'sBlock', _sbParryT: 3 }, { ib: true, poise: 10, _pImmune: 5 });
runCase('parry_regen_bonus', { s: 'sBlock', _sbParryT: 10, hp: 340 }, {}, { passives: { pRegen: 2 }, eqAffix: { parryBonus: 0.1 } });
runCase('damage_idle', { s: 'idle' }, { atk: 7, el: 0 }, { elMul: 1 });
runCase('damage_idle_ice_element', { s: 'idle', y: 5 }, { atk: 9, el: 2 }, { elMul: 1.25 });
runCase('charge_state_immune', { s: 'charge' }, {});
runCase('iframes_skip', { s: 'sBlock', _sbParryT: 10, iframes: 3 }, {});
runCase('sBash_after_window_damage', { s: 'sBash', st2: 4 }, {});

fs.writeFileSync(outputPath, JSON.stringify({ source_sha256: sha256, source_snapshot: 'source_snapshot/game.html', source_lines: { isPWin: 38469, lParryWinTicks: 16622, PARRY_WIN: 8670,
  doParry: [38470, 38575], poiseHit: [19972, 19998], eModHitP: [31098, 31116], eCharge: [40527, 40538] },
  pwin, cases }, null, 1), 'utf8');
console.log('ORACLE_OK pwin=' + pwin.length + ' cases=' + cases.length);
