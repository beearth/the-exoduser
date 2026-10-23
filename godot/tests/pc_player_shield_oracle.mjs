// PC-PLAYER-SHIELD oracle: runs the ORIGINAL game.html hurtP()/die() bodies (extracted by name) and the
// update() energy-shield regen statement (extracted by text, G32758~32762) with pShieldCdMul/pMRegenMul/_lvB
// in a VM. UTF-8 file in/out only (Windows OS.execute console output is not trusted).
//   node pc_player_shield_oracle.mjs --source-game=<game.html> --cases-file=<in.json> --out-file=<out.json>
import fs from 'node:fs'; import vm from 'node:vm'; import crypto from 'node:crypto';
const arg = n => process.argv.slice(2).find(x => x.startsWith(n + '='))?.slice(n.length + 1);
const file = arg('--source-game'), input = arg('--cases-file'), out = arg('--out-file');
if (!file || !input || !out) throw Error('explicit --source-game --cases-file --out-file required');
const src = fs.readFileSync(file, 'utf8');
function blockFrom(start) {
  let i = src.indexOf('{', start), depth = 0;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === "'" || c === '"' || c === '`') { const q = c; i++; while (i < src.length && src[i] !== q) { if (src[i] === '\\') i++; i++; } continue; }
    if (c === '/' && src[i + 1] === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) return src.slice(start, i + 1); }
  }
  throw Error('unbalanced block at ' + start);
}
const lineOf = idx => src.slice(0, idx).split('\n').length;
function fn(name) {
  const m = new RegExp('^function ' + name + '\\(', 'm').exec(src); if (!m) throw Error('source function missing: ' + name);
  return { name, line: lineOf(m.index), text: blockFrom(m.index) };
}
function oneLineFn(name) { // e.g. function pMRegenMul(){return …}    // comment
  const m = new RegExp('^function ' + name + '\\(\\)\\{[^\\n]*', 'm').exec(src); if (!m) throw Error('source function missing: ' + name);
  return { name, line: lineOf(m.index), text: blockFrom(m.index) };
}
function block(needle) {
  const idx = src.indexOf(needle); if (idx < 0) throw Error('source block missing: ' + needle);
  return { name: needle.slice(0, 40), line: lineOf(idx), text: blockFrom(idx) };
}
const hurtP = fn('hurtP'), die = fn('die');
const pShieldCdMul = oneLineFn('pShieldCdMul'), pMRegenMul = oneLineFn('pMRegenMul'), lvB = oneLineFn('_lvB');
const regen = block('if(P.mshield>0){\n    if(P.shieldRegenT>0)');
if (!/P\.shieldRegenT-=sp\*\(\(1\/pShieldCdMul\(\)\)\|\|1\)/.test(regen.text)) throw Error('regen statement drifted');

function env(c, log) {
  const P = structuredClone(c.P);
  const rnd = [...(c.random || [])];
  const M = Object.create(Math); M.random = () => (rnd.length ? rnd.shift() : (c.random_default ?? 0.99));
  const eDef = c.energyDef || 0;
  const noop = () => {};
  const G = { _bossLoadPhase: 0, _sStats: { dmgTaken: 0, dodges: 0, parries: 0, deaths: 0 }, _pStats: null, hitStop: 0, shake: 0,
    playTime: 0, slowMo: 0, _fireZones: null, stage: 0 };
  const e = {
    P, G, Math: M, window: {}, _now: 0, _harpActive: false, _dashActive: false,
    STATS: structuredClone(c.STATS || { str: 0, dex: 0, int: 0, vit: 0, lck: 0 }),
    PASSIVES: structuredClone(c.PASSIVES || { pGuard: 0, pMRegen: 0, pDemon: 0, pHuman: 0 }),
    OPT: { hitStop: 100, shake: 100, parts: 100 }, _HS: { pStun: 6 }, DR_CAP: 0.75, INV: { equipped: {} },
    scrFlash: null, scrFlashA: 0, _uqS: { shieldBankCd: 0, shieldBankT: 0, shieldBankAmt: 0 },
    _BOOTH_MODE: false, _boothDeadF: -1, _gxTurret: null, _xbowEquipped: false,
    _petOnHit: noop, _eqStat: () => 0, _eqAffix: id => (c.affix && c.affix[id]) || 0, _eqImplicit: () => 0,
    _lEq: () => 0, _uEq: id => (c.uEq && c.uEq[id]) || 0, _rageMax: () => 100,
    SFX: { beamStop: noop, groggy: noop }, playSample: noop, _r: v => v, shake: noop, doHitFlash: noop, addParts: noop,
    addTxt: (x, y, t, col, life) => log.txt.push({ dy: y - P.y, t, col, life }),
    poolPart: (x, y, vx, vy, col, sz, life) => log.parts.push({ vx, vy, col, sz, life }),
    _T: s => s, _L: s => s, doParry: noop, wp: () => ({}), _detonateBlast: noop, pGuardAbsorb: () => 0, pShieldBlock: () => 0,
    _isFocusState: () => false, _isKiCharging: () => false, _isFused: () => false, enhMul: () => 0,
    sh: () => ({}), ar: () => ({}), cp: () => ({}), bt: () => ({}), gl: () => ({}), pt: () => ({}),
    hm: () => ({ eDef }), nc: () => ({}), rg1: () => ({}), rg2: () => ({}), blt: () => ({}),
    _gritTotal: () => 0, pDefAdd: () => 0, _playProjectileHitSfx: noop, _addPhysicalBite: noop, _logDmg: noop,
    shQuery: () => [], hurtE: noop, meleeRef: () => 0, statStr: () => 1, poolPartSkill: noop,
    ultUnmute: noop, _stopShieldLoop: noop, dst: () => 9e9,
    die: null,
  };
  return e;
}
const pick = (P, keys) => { const o = {}; for (const k of keys) if (k in P) o[k] = P[k]; return o; };
const FIELDS = ['hp', 'shield', 'mshield', 'shieldRegenT', 's', 'iframes', 'poise'];
const rows = [];
for (const c of JSON.parse(fs.readFileSync(input, 'utf8'))) {
  const log = { txt: [], parts: [], dieCalls: 0, trace: [] };
  const e = env(c, log);
  let code;
  if (c.op === 'hit') {
    code = die.text + '\n' + lvB.text + '\n' + hurtP.text + '\n'
      + 'const __die=die;die=function(){__log.dieCalls++;return __die();};\n'
      + 'hurtP(__dmg,__opts);';
    e.__dmg = c.dmg; e.__opts = c.opts === undefined ? undefined : structuredClone(c.opts); e.__log = log;
  } else if (c.op === 'regen') {
    // 같은 update()의 sp를 틱마다 넣고, 각 틱 뒤 P.shield/shieldRegenT를 기록.
    code = pShieldCdMul.text + '\n' + pMRegenMul.text + '\n' + lvB.text + '\n'
      + 'for(const sp of __sps){' + regen.text + '\n__log.trace.push({shield:P.shield,shieldRegenT:P.shieldRegenT});}';
    e.__sps = c.sps; e.__log = log;
  } else throw Error('unknown op ' + c.op);
  let error = null;
  try { vm.runInNewContext(code, e); } catch (x) { error = String(x && x.stack || x); }
  rows.push({ name: c.name, op: c.op, error, p: pick(e.P, FIELDS), dmgTaken: e.G._sStats.dmgTaken,
    die_calls: log.dieCalls, texts: log.txt, parts: log.parts.length, part_colors: [...new Set(log.parts.map(p => p.col))],
    trace: log.trace });
}
const slices = [hurtP, die, regen, pShieldCdMul, pMRegenMul, lvB];
fs.writeFileSync(out, JSON.stringify({
  rows, slice_sha256: crypto.createHash('sha256').update(slices.map(p => p.text).join('\n')).digest('hex'),
  source_sha256: crypto.createHash('sha256').update(src).digest('hex'),
  source_functions: slices.map(p => ({ name: p.name, line: p.line })),
}), 'utf8');
