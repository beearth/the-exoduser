// PC-COMBAT-PACK-B independent oracle: runs UNTOUCHED game.html statements in a Node VM.
// Extracted verbatim: elMul(G14344), _mkPProj/_resetPProj/_recyclePProj/_getPProj(G17309-17362),
// _hurtFieldMobs(G18733-18756), the pProjs update block(G35176-35630), hurtE(G42110-43119).
// PC-FOLLOWUPS: also _fmXY/_fmCanHit(G18628-18634), _fmDeathFx/_fmApply(G18677-18712), _fbAliveCount/_fbMarkDead
// (G61031-61042) so field-boss contacts inside the pProjs block run the real source writers.
// Every other identifier resolves to a recording stub (Proxy `with` scope). No product-module imports.
// Math.random call sites are classified by their SOURCE LINE (stack trace, lineOffset aligned):
// gameplay lines consume the scenario-supplied values in order; presentation lines get 0.5.
// usage: node oracle.cjs <game.html> <scenario.json> <out.json>   (UTF-8 files)
// INTEG-9 (2026-10-22): source bytes = immutable snapshot godot/source_snapshot/game.html (snapshot.cjs, SHA-pinned
// 4d911cdd…85e5d4), same as the Mac bc2_*/demo11_16 oracles. Root game.html moves (189899b4… title line) and is never read.
// The first positional arg is kept for caller compatibility (PC test / Mac adapter pass it) but not used for bytes.
'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const [sourcePath, scenarioPath, outputPath] = process.argv.slice(2);
assert(sourcePath && scenarioPath && outputPath, 'usage: node oracle.cjs <game.html> <scenario.json> <out.json>');
const SNAPSHOT = require('../source_snapshot/snapshot.cjs');
const raw = SNAPSHOT.readBytes(); // throws on snapshot SHA mismatch
const sha256 = crypto.createHash('sha256').update(raw).digest('hex');
const lines = raw.toString('utf8').split('\n');
const L = (n) => lines[n - 1];
const span = (a, b) => lines.slice(a - 1, b).join('\n');
// ── exact anchors (fail loudly if the source moved) ──
assert(L(14344).startsWith('function elMul(a,d){'), 'G14344 elMul');
assert(L(17309).startsWith('function _mkPProj(){') && L(17330).startsWith('function _resetPProj(p){'), 'G17309/17330');
assert(L(17359).startsWith('function _recyclePProj(p){') && L(17360).startsWith('function _getPProj(){') && L(17362) === '}', 'G17359-17362');
assert(L(18733).startsWith('function _hurtFieldMobs(') && L(18756) === '}', 'G18733-18756');
assert(L(18628).startsWith('function _fmXY(m,isFb){') && L(18629).startsWith('function _fmCanHit(m,isFb){') && L(18634) === '}', 'G18628-18634');
assert(L(18677).startsWith('function _fmDeathFx(m,isFb,dmg){') && L(18699).startsWith('function _fmApply(m,dmg,isFb){') && L(18712) === '}', 'G18677-18712');
assert(L(18692).includes('Math.random()<.8') && L(18693).includes('Math.random()*_gPick.length') && L(18694).includes("Math.random()<.5?'flesh'"), 'G18692-18694 fm gore');
assert(L(61031).startsWith('function _fbAliveCount(){') && L(61036).startsWith('function _fbMarkDead(fb){') && L(61042) === '}', 'G61031-61042');
assert(L(35176) === '  {let w=0;for(let i=0;i<pProjs.length;i++){' && L(35629) === '  }pProjs.length=w;' && L(35630) === '  }', 'G35176-35630 pProjs block');
assert(L(35617).includes('if(!e.alive&&p.normalBow){') && L(35572).includes('Math.random()<_sP'), 'G35617/35572');
assert(L(42110) === 'function hurtE(e,dmg,ang,noSound,opts,atkEl=0){' && L(43118).startsWith('  }finally{_shBufI--}') && L(43119) === '}', 'G42110-43119 hurtE');
assert(L(42270).includes('const _isArrow=!_isPure&&opts&&opts.maxDist!==undefined&&!opts.magic;'), 'G42270 _isArrow');
assert(L(42466).includes('opts.normalBow'), 'G42466 _isRanged normalBow');
assert(L(24729).startsWith('const _UNDEAD_ET=new Set(['), 'G24729 _UNDEAD_ET');
assert(L(16507).startsWith('function nc(){') && L(16509).startsWith('function rg2(){') && L(27892).startsWith('function _hunterMul(e){') && L(28016).startsWith('function _predBonus(e){'), 'G16507/27892/28016');
assert(L(17448).startsWith('const XBOW_DMG=28;') && L(17450).startsWith('const XBOW_PIERCE=false;'), 'G17448/17450');

const scenario = JSON.parse(fs.readFileSync(scenarioPath, 'utf8'));
const GAMEPLAY_LINES = new Set([42179, 42211, 42316, 42371, 42372, 42373, 42374, 42375, 42376, 42377, 42378, 42440, 42537, 42604,
  42633, 42635, 42648, 42729, 42730, 42731, 42749, 42794, 42818, 42946, 43092, 43093, 35341, 35365, 35558, 35572, 35585, 35608,
  18692, 18693, 18694]);
const RANDOM_LINE_OFFSET = { hurte: 42110, pproj: 35176, pool: 17309, fieldmobs: 18733 };

function makeRun(cfg) {
  const out = { calls: [], affix_reads: [], random: [], errors: [] };
  let feed = (cfg.rng || []).slice();
  const rec = (name, ret) => (...args) => { out.calls.push({ call: name, args: safe(args) }); return typeof ret === 'function' ? ret(...args) : ret; };
  const ctx = {
    console, Infinity, NaN, undefined, Object, Array, JSON, Number, String, Boolean, Set, Map, Error, isFinite, parseInt, parseFloat,
    Math: Object.create(Math),
    window: { _parryLesson: undefined, _btDmgLog: undefined },
    EL: { P: 0, F: 1, I: 2, D: 3, L: 4, H: 5, E: 6 },
    ELC: ['#fff', '#f80', '#8cf', '#a4f', '#ff4', '#ffc', '#6c4'], ELP: ['#fff', '#f80', '#8cf', '#a4f', '#ff4', '#ffc', '#6c4'],
    OPT: Object.assign({ hitStop: 100, shake: 100, parts: 100, deathFx: true }, cfg.opt || {}),
    _HS: { proj: 3, kill: 6, melee: 4 }, PASSIVES: Object.assign({}, cfg.passives || {}),
    P: Object.assign({ x: 0, y: 0, hp: 100, mhp: 100, s: 'idle', iframes: 0, facing: 0, lv: 1, st: 100, skills: {} }, cfg.P || {}),
    G: Object.assign({ kills: 0, _stageKills: 0, combo: 0, comboTimer: 0, comboMax: 0, _gcT: 0, stage: 0, mats: 0, rifts: [], spawnHoles: [] }, cfg.G || {}),
    _shBufI: 0, _hitSfxCd: 0, _now: 0, _gameFrame: 0, _dtSp: 1, _txtPerFrame: 0, _impPerFrame: 0, _overBudget: false,
    _uqS: { turretHits: 0, iceCastId: 0, iceUsed: 0 }, _gxTurret: null, _SFX_PRI: { PROJ: 1 },
    SFX: new Proxy({}, { get: (_, k) => rec('SFX.' + String(k)) }),
    POT: { hp: { name: 'hp', col: '#3c6' }, st: { name: 'st', col: '#fc3' }, mp: { name: 'mp', col: '#36f' } },
    ELITE_TIERS: [{ dropBonus: 0 }, { dropBonus: 0 }, { dropBonus: 0 }],
    XBOW_PIERCE: false, XBOW_DMG: 28, _PPROJ_POOL: 120,
    dst: (a, b, c, d) => Math.sqrt((c - a) ** 2 + (d - b) ** 2),
    _T: (s) => s, _L: (a) => a,
    INV: { equipped: Object.assign({}, cfg.equipped || {}) },
  };
  ctx.Math.random = () => {
    const st = (new Error()).stack.split('\n');
    let line = -1;
    for (const frame of st) { const m = frame.match(/game\.html:(\d+):\d+/); if (m) { line = +m[1]; break; } }
    if (GAMEPLAY_LINES.has(line)) {
      if (feed.length === 0) { out.errors.push('rng_feed_exhausted@' + line); out.random.push({ line, value: null, gameplay: true }); return 0.999999; }
      const v = feed.shift(); out.random.push({ line, value: v, gameplay: true }); return v;
    }
    out.random.push({ line, value: 0.5, gameplay: false }); return 0.5;
  };
  ctx._eqAffix = (k) => { out.affix_reads.push(String(k)); return (cfg.affix || {})[k] || 0; };
  ctx._uEq = (k) => { out.calls.push({ call: '_uEq', args: [k] }); return (cfg.unique || {})[k] || 0; };
  ctx._lEq = (k) => { out.calls.push({ call: '_lEq', args: [k] }); return (cfg.legend || {})[k] || 0; };
  ctx.statCrit = () => cfg.statCrit; ctx.statCritDmg = () => cfg.statCritDmg; ctx.statStr = () => cfg.statStr;
  ctx.pDotPool = () => 1; ctx._diffSigned = () => 0; ctx._rageMax = () => 100; ctx._isFused = () => false;
  ctx.shQuery = (x, y, r) => (cfg.ens || []).filter((e) => Math.abs(e.x - x) <= r + 256 && Math.abs(e.y - y) <= r + 256);
  // isW: scenario wall predicate = the actual World map snapshot supplied by the Godot test (bounds 8000,
  // tile==1 cells, prop ellipses). The source isW is a tile/collision query; equivalence is checked Godot-side.
  const wm = cfg.wall_model || null; const blocked = new Set((wm && wm.cells || []).map((c) => c[0] + ',' + c[1]));
  ctx.isW = (x, y) => {
    if (wm) {
      if (x < 0 || y < 0 || x >= wm.bounds || y >= wm.bounds) return true;
      if (blocked.has(Math.floor(x / wm.tile_size) + ',' + Math.floor(y / wm.tile_size))) return true;
      for (const p of wm.props || []) { const qx = (x - p[0]) / p[2], qy = (y - p[1]) / p[3]; if (qx * qx + qy * qy < 1) return true; }
      return false;
    }
    return (cfg.walls || []).some((w) => x >= w[0] && x < w[0] + w[2] && y >= w[1] && y < w[1] + w[3]);
  };
  ctx.addPotion = rec('addPotion', true); ctx.rollDrop = rec('rollDrop'); ctx.addExp = rec('addExp');
  ctx._hitSfxForEtype = () => ({ key: 'monster_hit', pitch: 1 });
  ctx._r = (v) => v;
  // hurtE stub for carrier runs only (scenario hurt queue); full hurtE replaces it below when requested.
  const stubHurt = (e, dmg, ang, noSound, opts, atkEl) => {
    const next = (cfg.hurt_results || []).shift() || { killed: false };
    out.calls.push({ call: 'hurtE', args: [e.id, dmg, +ang.toFixed(9), !!noSound, opts === cfg.__packetRef ? 'PACKET_IDENTITY' : 'OTHER', atkEl] });
    if (next.killed) { e.alive = false; e.hp = 0; }
  };
  const proxy = new Proxy(ctx, {
    has: (target, key) => typeof key === 'string' && !(key in globalThis && !(key in target)),
    get: (target, key) => {
      if (key === Symbol.unscopables) return undefined;
      if (key in target) return target[key];
      const f = rec(String(key)); target[key] = f; return f;
    },
    set: (target, key, value) => { target[key] = value; return true; },
  });
  ctx.__px = proxy;
  vm.createContext(ctx);
  const run = (code, start) => vm.runInContext('with(__px){' + code + '\n}', ctx, { filename: 'game.html', lineOffset: start - 1 });
  // Functions declared inside `with` resolve free identifiers through the proxy.
  run(L(14344) + '\n__px.elMul=elMul;', 14344);
  run(L(24729) + '\n__px._UNDEAD_ET=_UNDEAD_ET;', 24729);
  for (const [n, name] of [[16507, 'nc'], [16508, 'rg1'], [16509, 'rg2'], [27892, '_hunterMul'], [28016, '_predBonus']]) run(L(n) + '\n__px.' + name + '=' + name + ';', n);
  run(span(17309, 17362) + '\n__px._mkPProj=_mkPProj;__px._resetPProj=_resetPProj;__px._recyclePProj=_recyclePProj;__px._getPProj=_getPProj;', 17309);
  ctx._pprojFree = [];
  run(span(18733, 18756) + '\n__px._hurtFieldMobs=_hurtFieldMobs;', 18733);
  run(span(18628, 18634) + '\n__px._fmXY=_fmXY;__px._fmCanHit=_fmCanHit;', 18628);
  run(span(18677, 18712) + '\n__px._fmDeathFx=_fmDeathFx;__px._fmApply=_fmApply;', 18677);
  run(span(61031, 61042) + '\n__px._fbAliveCount=_fbAliveCount;__px._fbMarkDead=_fbMarkDead;', 61031);
  run(span(42110, 43119) + '\n__px.hurtE=hurtE;', 42110);
  const realHurt = ctx.hurtE;
  return { out, ctx, run, realHurt, stubHurt, setFeed: (f) => { feed = f.slice(); } };
}

function safe(v) { try { return JSON.parse(JSON.stringify(v, (k, x) => (x instanceof Set ? '[Set]' : (typeof x === 'object' && x && x.__isEnemy ? 'enemy:' + x.id : x)))); } catch (e) { return '[unserializable]'; } }
const fbView = (G) => (Array.isArray(G._fieldBosses) ? G._fieldBosses.map((m) => (m ? { id: m.id, hp: m.hp, hitCd: m.hitCd, alive: m.alive, _deathFxDone: !!m._deathFxDone } : null)) : null);
const packetView = (p) => ({ x: p.x, y: p.y, vx: p.vx, vy: p.vy, dist: p.dist, dmg: p.dmg, bounces: p.bounces || 0, _bounceCool: p._bounceCool || 0, _pierceRate: p._pierceRate === undefined ? null : p._pierceRate, pierce: p.pierce, hitSet: p._hitSet ? [...p._hitSet].map((e) => e.id) : [], trLen: p._trLen });

const results = [];
for (const c of scenario.cases || []) {
  const R = makeRun(c);
  const row = { name: c.name, kind: c.kind };
  try {
    if (c.kind === 'hurte') {
      const e = Object.assign({ __isEnemy: true, id: 'E', kb: { x: 0, y: 0 }, alive: true, mods: [], eRes: [0, 0, 0, 0, 0, 0, 0], s: 'idle', st2: 0, r: 15, x: 0, y: 0 }, c.enemy);
      R.ctx.ens = [e]; c.ens = [e];
      let opts = c.opts;
      if (c.packet) { // real pool packet, configured exactly like _fireXbow G28712
        const pp = R.ctx._getPProj(); Object.assign(pp, c.packet); opts = pp;
        if (c.packet_undefined_kbMult) pp.kbMult = undefined;
      }
      const dmgIn = c.apply_elmul ? (~~(c.dmg * R.ctx.elMul(c.atkEl, e.el))) : c.dmg;
      R.realHurt(e, dmgIn, c.ang, !!c.noSound, opts, c.atkEl);
      row.dmg_in = dmgIn;
      row.enemy_after = { hp: e.hp, eShield: e.eShield, alive: e.alive, kb: e.kb, s: e.s, st2: e.st2, _hitFlash: e._hitFlash, _hitStun: e._hitStun, poise: e.poise, stunned: e.stunned, _alerted: e._alerted, _revived: !!e._revived };
      row.G_after = { kills: R.ctx.G.kills, _stageKills: R.ctx.G._stageKills, combo: R.ctx.G.combo, _dmgPeak: R.ctx.G._dmgPeak || null };
    } else if (c.kind === 'carrier') {
      const ens = c.ens.map((x) => Object.assign({ __isEnemy: true, kb: { x: 0, y: 0 }, alive: true, mods: [], el: 0, hp: 100 }, x));
      R.ctx.ens = ens; c.ens = ens;
      if (c.reuse_pool) { const warm = R.ctx._mkPProj(); R.ctx._recyclePProj(warm); } // pool reuse path (_resetPProj sets _pierceRate)
      const pp = R.ctx._getPProj(); Object.assign(pp, c.packet); c.__packetRef = pp;
      R.ctx.pProjs = [pp]; R.ctx.sp = c.sp; R.ctx.hurtE = R.stubHurt;
      row.reused = c.reuse_pool === true; row.initial = packetView(pp); row.ticks = []; row.fate = 'live';
      const recycledBefore = R.ctx._pprojFree.length;
      for (let t = 0; t < c.ticks && R.ctx.pProjs.length > 0; t++) {
        R.out.calls.push({ call: 'TICK', args: [t] });
        R.run(span(35176, 35630), 35176);
        row.ticks.push({ t, live: R.ctx.pProjs.length, p: packetView(pp), fbs: fbView(R.ctx.G), fbDone: R.ctx.G._fbDone === true });
        if (R.ctx.pProjs.length === 0) { row.fate = R.ctx._pprojFree.length > recycledBefore ? 'recycled' : 'dropped'; row.fate_tick = t; }
      }
    }
  } catch (err) { row.exception = String(err && err.stack || err).split('\n').slice(0, 4).join(' | '); }
  row.affix_reads = R.out.affix_reads;
  row.calls = R.out.calls.filter((x) => ['hurtE', 'TICK', 'hurtP', 'addPotion', 'rollDrop', 'addExp', 'deathFX', '_uEq', '_lEq', 'mkEn', '_spawnBossProjectile'].includes(x.call));
  row.random = R.out.random; row.errors = R.out.errors;
  row.gameplay_random_lines = R.out.random.filter((x) => x.gameplay).map((x) => x.line);
  results.push(row);
}
fs.writeFileSync(outputPath, JSON.stringify({ schema: 'pc-combat-pack-b-oracle.v1', source_sha256: sha256, source_snapshot: path.relative(path.join(__dirname, '..'), SNAPSHOT.sourcePath).split(path.sep).join('/'), cases: results }, null, 1), 'utf8');
console.log('ORACLE_DONE', results.length, results.filter((r) => r.exception).length);
