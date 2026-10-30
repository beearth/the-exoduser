// PC-B07 oracle exporter: executes the ORIGINAL game.html functions / statement blocks (chain dash, parry, shield, player poise, enemy poise)
// in a Node VM and writes oracle.json, which Program.cs (.NET 8) compares with Runtime/Core/Combat/*.cs. No expected value is typed by hand: every
// "out" below is produced by running the web source. usage: node export.cjs [--source G:/exoduser/game.html] [--out oracle.json] [--check]
//  --check : re-extract and fail when any extracted block's sha256 differs from the committed oracle.json (source drift) instead of writing.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), crypto = require('node:crypto');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const SRC = path.resolve(arg('--source', 'G:/exoduser/game.html')), OUT = path.resolve(arg('--out', path.join(__dirname, 'oracle.json'))), CHECK = process.argv.includes('--check');
const text = fs.readFileSync(SRC, 'utf8'), lines = text.split('\n');
// 최신 원본의 펫 문구가 호출하는 실제 공유 번역 모듈을 같은 소스 묶음에서 읽는다.
const localeScope = {}; require('node:vm').runInNewContext(fs.readFileSync(path.join(path.dirname(SRC), 'localization-runtime.js'), 'utf8'), localeScope);
const ExoduserI18n = localeScope.ExoduserI18n;
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const blocks = [];
function record(from, to, label) { const body = lines.slice(from - 1, to).join('\n'); blocks.push({ label, from, to, sha256: sha(body) }); return body + String.fromCharCode(10); }   // trailing newline: a last-line `//` comment must not swallow a wrapper's closing brace
function indexes(prefix) { const r = []; lines.forEach((l, i) => { if (l.trimStart().startsWith(prefix)) r.push(i + 1); }); return r; }
function at(prefix, occ = 0) { const r = indexes(prefix); if (r.length <= occ) throw new Error('source drift: no line starts with "' + prefix + '" (occurrence ' + occ + ')'); return r[occ]; }
function line(prefix, occ = 0) { const n = at(prefix, occ); return record(n, n, prefix.slice(0, 48)); }
// first line starting with `startPrefix` .. up to the first LATER line starting with `endPrefix` (that line is included only when inclusive)
function span(startPrefix, endPrefix, { occ = 0, inclusive = false } = {}) {
  const a = at(startPrefix, occ); let b = a + 1;
  while (b <= lines.length && !lines[b - 1].trimStart().startsWith(endPrefix)) { b++; if (b > a + 600) throw new Error('span too long for ' + startPrefix); }
  return record(a, inclusive ? b : b - 1, startPrefix.slice(0, 40) + '..');
}
// function starting at a line: brace matching (strings / comments skipped)
function fn(prefix, occ = 0) {
  const a = at(prefix, occ); let depth = 0, started = false, i = a - 1, str = null, esc = false, blockC = false;
  for (; i < lines.length; i++) {
    const s = lines[i];
    for (let c = 0; c < s.length; c++) {
      const ch = s[c], nx = s[c + 1];
      if (blockC) { if (ch === '*' && nx === '/') { blockC = false; c++; } continue; }
      if (str) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === str) str = null; continue; }
      if (ch === '/' && nx === '/') break;
      if (ch === '/' && nx === '*') { blockC = true; c++; continue; }
      if (ch === "'" || ch === '"' || ch === '`') { str = ch; continue; }
      if (ch === '{') { depth++; started = true; } else if (ch === '}') depth--;
    }
    if (started && depth === 0) return record(a, i + 1, prefix.slice(0, 48));
  }
  throw new Error('unbalanced function ' + prefix);
}
// ---- VM scope: only declared names resolve; `noops` names are silent no-op functions (listed in oracle.json wrapper.noops) ----
const noopUsed = new Set();
function scope(base, noops) {
  return new Proxy(base, {
    has(t, k) { if (typeof k !== 'string') return false; if (k in t) return true; if (noops.includes(k)) return true; return false; },   // anything else resolves in the function scope (declared var/function) or throws ReferenceError at run time: no hidden stubs
    get(t, k) { if (k in t) return t[k]; if (typeof k === 'string' && noops.includes(k)) { noopUsed.add(k); return () => undefined; } return undefined; },
    set(t, k, v) { t[k] = v; return true; },
  });
}
const SFXP = new Proxy({}, { get: () => () => undefined });   // SFX.xxx() audio calls
function load(src, base, expose, noops = []) { base.ExoduserI18n = ExoduserI18n; if (!('_T' in base)) base._T = text => text; if (!('SFX' in base)) base.SFX = SFXP; const s = scope(base, noops); return new Function('__s', 'with(__s){' + src + '\nreturn {' + expose.join(',') + '};}')(s); }
const J = o => JSON.parse(JSON.stringify(o, (k, v) => (v === undefined ? null : v)));
// design of experiments: every single axis value around the first-value base + seeded random full combinations (deterministic xorshift32)
function grid(axes, n, seed = 20261026) {
  const keys = Object.keys(axes), out = [], seen = new Set(), push = c => { const k = JSON.stringify(c); if (!seen.has(k)) { seen.add(k); out.push(c); } };
  const base = {}; keys.forEach(k => { base[k] = axes[k][0]; });
  push({ ...base }); for (const k of keys) for (const v of axes[k]) push({ ...base, [k]: v });
  let x = seed >>> 0 || 1; const rnd = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
  let guard = 0; while (out.length < n && guard++ < n * 30) { const c = {}; for (const k of keys) c[k] = axes[k][Math.floor(rnd() * axes[k].length)]; push(c); }
  return out;
}
const sections = {};
const NOOP_COMMON = ['playSample', '_r', 'addTxt', 'addParts', 'poolPart', 'shake', '_gpVibrate', 'doHitFlash', 'showPH', '_T', 'SFX'];

// =====================================================================================================================
// 0. constants
{
  const src = [line('const _HARP_TIER_F='), line('const _HARP_IFRAME='), line('const _HARP_PULL_DUR='), line('const _HARP_SPD='), line('const _HARP_DMG='), line('const _HARP_GAUGE_COST='), line('const _HARP_GAUGE_BASE_CELLS='), line('let _HARP_GAUGE_MAX='),
    line('const _MINI_STUN='), line('const _FULL_STUN='), line('var _PARRY_WIN='), line('const _SD_GRACE=10')].join('\n');
  const hs = span('const _HS={', '};', { inclusive: true });
  const base = { P: { skills: {} }, PASSIVES: { pCharge: 0 }, _HARP_GAUGE_MAX: 0 };
  const m = load(src + '\n' + hs, base, ['_HARP_TIER_F', '_HARP_IFRAME', '_HARP_PULL_DUR', '_HARP_SPD', '_HARP_DMG', '_HARP_GAUGE_COST', '_HARP_GAUGE_BASE_CELLS', '_MINI_STUN', '_FULL_STUN', '_PARRY_WIN', '_SD_GRACE', '_HS']);
  sections.constants = J({ harpTierF: m._HARP_TIER_F, harpIframe: m._HARP_IFRAME, harpPullDur: m._HARP_PULL_DUR, harpSpd: m._HARP_SPD, harpDmg: m._HARP_DMG, harpGaugeCost: m._HARP_GAUGE_COST, harpGaugeBaseCells: m._HARP_GAUGE_BASE_CELLS, miniStun: m._MINI_STUN, fullStun: m._FULL_STUN, parryWin: m._PARRY_WIN, sdGrace: m._SD_GRACE, hitStop: m._HS });
}
// 1. parry window ticks (cape) -------------------------------------------------------------------------------------------
const CAPES = [0, .05, .1, .25, .3, .5, 1, 2];
{
  const base = { _lEq: k => base.eq[k] || 0, eq: {} };
  const m = load(line('var _PARRY_WIN=') + '\n' + fn('function _lParryWinTicks') + '\n' + fn('function _lSbParryT'), base, ['_lParryWinTicks', '_lSbParryT']);
  sections.parryTicks = CAPES.map(cape => { base.eq._lCapeParry = cape; return J({ in: { cape }, out: { winTicks: m._lParryWinTicks(), sbT: m._lSbParryT() } }); });
}
// 2. isPWin --------------------------------------------------------------------------------------------------------------
{
  const P = { s: 'idle', st2: 0, _kiParryT: 0, _sbParryT: 0 };
  const base = { P, _lEq: k => base.eq[k] || 0, eq: {} };
  const m = load(line('var _PARRY_WIN=') + '\n' + fn('function _lParryWinTicks') + '\n' + fn('function isPWin'), base, ['isPWin']);
  const cases = [];
  for (const s of ['sBash', 'sBlock', 'peaceShield', 'whirlwind', 'beam', 'elecRepent', 'idle', 'sDraw', 'sRecover', 'kiGather'])
    for (const st2 of [0, 3, 4, 5, 12, 19, 20, 21, 999]) for (const ki of [0, 5]) for (const sb of [0, 1, 12, 20]) for (const cape of [0, .25, 1]) {
      Object.assign(P, { s, st2, _kiParryT: ki, _sbParryT: sb }); base.eq._lCapeParry = cape; cases.push(J({ in: { s, st2, kiParryT: ki, sbParryT: sb, cape }, out: { win: !!m.isPWin() } }));
    }
  sections.isPWin = cases;
}
// 3. e-swing radius / wing level -----------------------------------------------------------------------------------------
{
  const P = { skills: {} }, base = { P, sh: () => ({ bonusRange: base.bonus }), bonus: 0 };
  const m = load(fn('function _wingStrikeLevel') + '\n' + fn('function _eSkillRangeMul') + '\n' + fn('function _eSwingRadius'), base, ['_wingStrikeLevel', '_eSkillRangeMul', '_eSwingRadius']);
  const cases = [];
  for (const bonus of [0, 1, 5, 12, 50]) for (const mal of [0, 1, 2, 5, 10]) for (const st of [0, 1, 3, 10]) for (const chg of [undefined, 0, 1, 1.5, 2, 3]) {
    base.bonus = bonus; P.skills = { maliceSwipe: mal, shieldThrow: st };
    cases.push(J({ in: { bonusRange: bonus, maliceSwipe: mal, shieldThrow: st, chg: chg ?? null }, out: { level: m._wingStrikeLevel(), rangeMul: m._eSkillRangeMul(), radius: m._eSwingRadius(chg) } }));
  }
  sections.swing = cases;
}
// 4. projectile gate / radii ---------------------------------------------------------------------------------------------
{
  const stmts = ['const _sbPW=', 'const _sbPWDet=', 'const _anyPW=', 'const _sbActive=', 'const _isAtkState=', 'const _chgMP=', 'const _parryR=', 'const _parryRDet=', 'const _releasePW=', 'const _qPulseR=', 'const _rbDeflR='].map(p => line(p));
  const P = { s: 'idle', st2: 0, _kiParryT: 0, _sbParryT: 0, _sbReleaseR: 0, _sBashChgMul: 1, skills: {}, r: 10 };
  const base = { P, _lEq: k => 0, _eqAffix: k => (k === 'parryBonus' ? base.parryBonus : 0), PASSIVES: { pParry: 0 }, sh: () => ({ bonusRange: base.bonusRange }), wp: () => ({ wRange: base.wRange, bonusRange: base.wpBonus }), _pCollR: 0, parryBonus: 0, bonusRange: 0, wRange: undefined, wpBonus: 0 };
  const src = line('var _PARRY_WIN=') + '\n' + fn('function _lParryWinTicks') + '\n' + fn('function isPWin') + '\n' + fn('function _wingStrikeLevel') + '\n' + fn('function _eSkillRangeMul') + '\n' +
    'function __gate(){' + stmts.join('\n') + '\nreturn {sbPW:_sbPW,sbPWDet:_sbPWDet,anyPW:_anyPW,sbActive:_sbActive,isAtkState:_isAtkState,chgMP:_chgMP,parryR:_parryR,parryRDet:_parryRDet,releasePW:_releasePW,qPulseR:_qPulseR,rbDeflR:_rbDeflR};}';
  const m = load(src, base, ['__gate']);
  const cases = [];
  const states = ['idle', 'sBash', 'sBlock', 'peaceShield', 'whirlwind', 'beam', 'elecRepent', 'wSwing', 'charge', 'sRecover'];
  for (const c of grid({ s: states, st2: [3, 4, 5, 15], ki: [0, 3], sb: [0, 5, 20], rel: [0, 300], chg: [undefined, 0, 1, 2.5, 5], det: [0, 1], mt: [[1, 1], [10, 3]], bpp: [[0, 0, 0], [5, 5, .5], [12, 10, 2]], wrwb: [[undefined, 0], [90, 4]] }, 1800)) {
    const { s, st2, ki, sb, rel, chg, det } = c, [mal, thr] = c.mt, [bonus, pp, pb] = c.bpp, [wr, wb] = c.wrwb;
    Object.assign(P, { s, st2, _kiParryT: ki, _sbParryT: sb, _sbReleaseR: rel, _sBashChgMul: chg, skills: { detonate: det, maliceSwipe: mal, shieldThrow: thr } });
    Object.assign(base, { bonusRange: bonus, parryBonus: pb, wRange: wr, wpBonus: wb, _pCollR: 16 }); base.PASSIVES.pParry = pp;
    const o = m.__gate();
    cases.push(J({ in: { s, st2, kiParryT: ki, sbParryT: sb, sbReleaseR: rel, sBashChgMul: chg ?? null, detonate: det, maliceSwipe: mal, shieldThrow: thr, bonusRange: bonus, pParry: pp, parryBonus: pb, wRange: wr ?? null, wpBonusRange: wb, pCollR: 16, cape: 0 }, out: o }));
  }
  sections.gate = cases;
}
// 5. sBlock radius / zone ------------------------------------------------------------------------------------------------
{
  const m = load(fn('function _sBlockChargeRadius') + '\n' + fn('function _sBlockProjectileZone'), {}, ['_sBlockChargeRadius', '_sBlockProjectileZone']);
  sections.sblockRadius = [-5, 0, 1, 30, 60, 119, 120, 239, 240, 241, 300, 1000].map(holdT => J({ in: { holdT }, out: { radius: m._sBlockChargeRadius(holdT) } })).concat([undefined, null].map(h => J({ in: { holdT: null }, out: { radius: m._sBlockChargeRadius(h) } })));
  const zones = [];
  for (const d of [0, 19, 20, 21, 50, 99, 100, 101, 400]) for (const parryT of [-1, 0, 0.5, 12, 20]) zones.push(J({ in: { distance: d, parryT }, out: { zone: m._sBlockProjectileZone(d, parryT) } }));
  sections.sblockZone = zones;
}
// 6. projectile classification ------------------------------------------------------------------------------------------
{
  const P = { s: 'idle', _stWingT: 0 };
  const base = { P, EL: null, _fused: false, _isFused: () => base._fused };
  const src = line('const EL={') + '\n' + fn('function _isBigEnergy') + '\n' + fn('function _projectileParryClass') + '\n' + fn('function _eCanReflectProjectile') + '\n' + fn('function _physicalProjectileMultiplier') + '\n' + fn('function _isPhysicalMouthProjectile');
  const m = load(src, base, ['_projectileParryClass', '_eCanReflectProjectile', '_physicalProjectileMultiplier', '_isPhysicalMouthProjectile']);
  const flags = ['fbEnergy', 'fdEnergy', 'mine', 'trap', 'blackBean', 'friendly', 'noParry', 'bomb', 'web', 'poisonZone', 'iceZone', 'blizzard', 'dimRift', 'elemBall', '_coralSpike', 'gbBean', 'blueBean', 'fireMagic', 'waterBean', 'titanEye', 'bwBean', 'redBean', 'swordWave', 'phantomSword'];
  const protos = [{}];
  for (const f of flags) protos.push({ [f]: true });
  for (const f of ['friendly', 'noParry', 'blackBean', 'redBean', 'titanEye', 'bwBean', 'fbEnergy', 'gbBean', 'swordWave']) for (const g of ['redBean', 'titanEye', 'bwBean', 'swordWave', 'friendly', 'phantomSword']) if (f !== g) protos.push({ [f]: true, [g]: true });
  for (const pc of ['physical', 'magic', 'forbidden']) protos.push({ parryClass: pc }, { parryClass: pc, friendly: true });
  const cases = [];
  for (const proto of protos) for (const el of [undefined, 0, 1, 3, 6]) for (const ctx of [{ s: 'idle', wing: 0, fused: false }, { s: 'sBash', wing: 5, fused: true }, { s: 'sBash', wing: 0, fused: true }, { s: 'sBash', wing: 5, fused: false }]) {
    const p = { ...proto }; if (el !== undefined) p.el = el; Object.assign(P, { s: ctx.s, _stWingT: ctx.wing }); base._fused = ctx.fused;
    cases.push(J({ in: { p: { ...p }, ctxS: ctx.s, stWingT: ctx.wing, shieldFuse: ctx.fused }, out: { cls: m._projectileParryClass(p), canReflect: !!m._eCanReflectProjectile(p), physMul: m._physicalProjectileMultiplier(p), mouth: !!m._isPhysicalMouthProjectile(p) } }));
  }
  cases.push(J({ in: { p: null, ctxS: 'idle', stWingT: 0, shieldFuse: false }, out: { cls: m._projectileParryClass(null), canReflect: !!m._eCanReflectProjectile(null), physMul: m._physicalProjectileMultiplier(null), mouth: !!m._isPhysicalMouthProjectile(null) } }));
  sections.projectile = cases;
}
// 7. passive formulas ----------------------------------------------------------------------------------------------------
{
  const base = { PASSIVES: { pParry: 0, pGuard: 0, pCharge: 0, pRegen: 0 }, _eqAffix: k => (k === 'shieldBlockDR' ? base.sbdr : 0), sbdr: 0 };
  const m = load(['function pParryDmg', 'function pParryRmbSpd', 'function pParryRainbowDR', 'function pGuardAbsorb', 'function pShieldBlock', 'function pShieldMul', 'function pChargeRange', 'function pChargeGauge'].map(p => fn(p)).join('\n'), base, ['pParryDmg', 'pParryRmbSpd', 'pParryRainbowDR', 'pGuardAbsorb', 'pShieldBlock', 'pShieldMul', 'pChargeRange', 'pChargeGauge']);
  const cases = [];
  for (const lv of [0, 1, 2, 5, 9, 10, 11]) for (const sbdr of [0, .1, .25, .5]) { base.PASSIVES.pParry = lv; base.PASSIVES.pGuard = lv; base.PASSIVES.pCharge = lv; base.sbdr = sbdr; cases.push(J({ in: { level: lv, shieldBlockDR: sbdr }, out: { parryDmg: m.pParryDmg(), rmbSpd: m.pParryRmbSpd(), rainbowDR: m.pParryRainbowDR(), guardAbsorb: m.pGuardAbsorb(), shieldBlock: m.pShieldBlock(), shieldMul: m.pShieldMul(), chargeRange: m.pChargeRange(), chargeGauge: m.pChargeGauge() } })); }
  sections.passives = cases;
}
// 8. pParryProjDmg -------------------------------------------------------------------------------------------------------
{
  const v = { meleeRef: 1, statStr: 1, pAtkMul: 1, magicRef: 1, statInt: 1, pMagicMul: 1, parryBonus: 0, legSP: 0, pParry: 0 };
  const base = { PASSIVES: { pParry: 0 }, meleeRef: () => v.meleeRef, statStr: () => v.statStr, pAtkMul: () => v.pAtkMul, magicRef: () => v.magicRef, statInt: () => v.statInt, pMagicMul: () => v.pMagicMul, _eqAffix: k => (k === 'parryBonus' ? v.parryBonus : 0), _lEq: k => (k === '_lShieldParry' ? v.legSP : 0) };
  const m = load(fn('function pParryDmg') + '\n' + fn('function pParryProjDmg'), base, ['pParryProjDmg']);
  const cases = [];
  for (const bd of [0, 1, 7, 50, 333, 1234]) for (const isQ of [false, true]) for (const [mr, ss, am] of [[10, 1, 1], [40, 1.5, 2], [120, 3, 3]]) for (const [mg, si, mm] of [[10, 1, 1], [30, 2, 2.5]]) for (const pb of [0, .5]) for (const sp of [0, 2]) for (const pp of [0, 5]) {
    Object.assign(v, { meleeRef: mr, statStr: ss, pAtkMul: am, magicRef: mg, statInt: si, pMagicMul: mm, parryBonus: pb, legSP: sp }); base.PASSIVES.pParry = pp;
    cases.push(J({ in: { bulletDmg: bd, isQ, meleeRef: mr, statStr: ss, pAtkMul: am, magicRef: mg, statInt: si, pMagicMul: mm, parryBonus: pb, legShieldParry: sp, pParry: pp }, out: { dmg: m.pParryProjDmg(bd, isQ) } }));
  }
  sections.parryProjDmg = cases;
}
// 9. doParry (the whole original function) ------------------------------------------------------------------------------
{
  const doParrySrc = fn('function doParry(');
  const hs = span('const _HS={', '};', { inclusive: true });
  const noops = ['_petOnParry', 'playSample', '_r', 'addTxt', '_gpVibrate', '_T', '_petSayCD', '_tickSkyCrusherRecharge', '_loadBossWaterImpactClip', '_loadBossFireImpactClip', '_addBoom', '_rainbowImpact', '_dark02Impact', 'doHitFlash', 'poolPart', 'showPH', 'shQuery', 'hurtE', 'dst', 'meleeRef', 'statStr', 'SFX'];
  const cases = [];
  const run = (c) => {
    const OPT = { hitStop: c.optHitStop, shake: c.optShake };
    const P = { s: c.s, x: 0, y: 0, iframes: c.iframes, hp: c.hp, mhp: c.mhp, st: c.st, mst: c.mst, mp: c.mp, mmp: c.mmp, poise: c.poise, maxPoise: c.maxPoise, rage: c.rage, _sbParryT: c.sbParryT, skills: { detonate: c.detonate }, parryT: c.parryT, parryBank: 0, _sBashChgMul: c.sBashChgMul, _gslCd: 0, _scCd: 0, _parryCdFrame: -1, _hdCd: 0, kb: { x: 0, y: 0 } };
    const G = { _pStats: null, _sStats: null, mats: c.mats, hitStop: 0, slowMo: 0, shake: 0, frame: 1, playTime: 0, _fireZones: null };
    const base = { P, G, OPT, window: { _parryLesson: c.lesson ? { active: true, physicalParry() {} } : null }, Math, EL: { P: 0, F: 1, I: 2, D: 3, L: 4, H: 5, E: 6 }, ELC: {}, _eqAffix: k => (k === 'parryBonus' ? c.parryBonus : k === 'parryExplosion' ? 0 : 0), PASSIVES: { pRegen: c.pRegen }, _uEq: () => 0, _uqS: {}, _rageMax: () => c.rageMax, _skyCrusherChargeCount: () => 3, _TVFX2_COMBOS: [null, null, { layers: [] }], _tvfx2Imgs: {}, _harpGauge: c.harpGauge, _HARP_GAUGE_MAX: c.harpMax, _isFused: () => false };
    const m = load(hs + '\n' + doParrySrc, base, ['doParry'], noops);
    m.doParry(c.inDmg, undefined, undefined, c.forceQ, c.parryEl, c.resourceMul, c.impactKind);
    return J({ iframes: P.iframes, hp: P.hp, st: P.st, mp: P.mp, poise: P.poise, rage: P.rage, mats: G.mats, harpGauge: base._harpGauge, hitStop: G.hitStop, slowMo: G.slowMo, shake: G.shake });
  };
  const defaults = { s: 'sBash', iframes: 0, hp: 10, mhp: 1000, st: 10, mst: 500, mp: 10, mmp: 400, poise: 1, maxPoise: 4, rage: 0, rageMax: 100, sbParryT: 0, detonate: 0, parryT: 0, sBashChgMul: 1, mats: 0, parryBonus: 0, pRegen: 0, harpGauge: 0, harpMax: 225, optHitStop: 100, optShake: 100, lesson: false, inDmg: 20, forceQ: undefined, parryEl: 0, resourceMul: undefined, impactKind: undefined };
  const grid = [];
  for (const parryEl of [0, 'red', 'rainbow', 3]) for (const resourceMul of [undefined, 1, 3, 10]) for (const [s, forceQ, sb] of [['sBash', undefined, 0], ['sBlock', undefined, 12], ['idle', true, 0], ['peaceShield', undefined, 5], ['idle', undefined, 8]]) for (const [pb, pr] of [[0, 0], [.5, 5], [1.7, 10]]) grid.push({ parryEl, resourceMul, s, forceQ, sbParryT: sb, parryBonus: pb, pRegen: pr });
  for (const c of grid) { const full = { ...defaults, ...c }; cases.push({ in: full, out: run(full) }); }
  // resource clamps, gauge/rage caps, hit-stop options, detonate charge, lesson
  const extra = [{ hp: 990, st: 495, mp: 395, poise: 4, harpGauge: 220, rage: 98, harpMax: 225, rageMax: 100 }, { hp: 1000, st: 500, mp: 400, poise: 3, harpGauge: 225, rage: 100 }, { optHitStop: 0, optShake: 0 }, { optHitStop: 50, optShake: 150 }, { optHitStop: 250, optShake: 33 },
    { detonate: 1, parryT: 30 }, { detonate: 1, parryT: 0 }, { lesson: true }, { iframes: 40 }, { iframes: 10 }, { mats: 12345 }, { inDmg: 0 }, { parryEl: 'rainbow', resourceMul: 3, harpGauge: 200, rage: 90 }, { harpMax: 270, harpGauge: 260 }, { impactKind: 'physicalProjectile', resourceMul: 3 }, { impactKind: 'waterBean', forceQ: true }];
  for (const e of extra) { const full = { ...defaults, ...e }; cases.push({ in: full, out: run(full) }); }
  sections.doParry = cases.map(J);
}
// 10. chain dash --------------------------------------------------------------------------------------------------------
{
  const consts = [line('const _HARP_TIER_F='), line('const _HARP_IFRAME='), line('const _HARP_PULL_DUR='), line('const _HARP_SPD='), line('const _HARP_GAUGE_COST='), line('const _HARP_GAUGE_BASE_CELLS='), line('let _HARP_GAUGE_MAX=')].join('\n');
  const v = { skillA: 0, skillB: 0, pCharge: 0 };
  const base = { P: { skills: {} }, PASSIVES: { pCharge: 0 }, _HARP_GAUGE_MAX: 0 };
  const dist = load(consts + '\n' + fn('function pChargeRange') + '\n' + fn('function _harpDistTier') + '\n' + fn('function _harpAvailableDist'), base, ['_harpDistTier', '_harpAvailableDist']);
  const cases = [];
  for (const cb of [0, 1, 2, 5, 9, 10, 12]) for (const mb of [0, 3, 10]) for (const pc of [0, 1, 5, 10]) for (const tier of [0, 1, 2, 3, 4]) for (const gauge of [-5, 0, 20, 45, 98, 150, 225, 400]) {
    base.P.skills = { chargeBoost: cb, magicBlink: mb }; base.PASSIVES.pCharge = pc;
    cases.push(J({ in: { chargeBoost: cb, magicBlink: mb, pCharge: pc, tier, gauge }, out: { distTier: dist._harpDistTier(tier), available: tier >= 1 && tier <= 3 ? dist._harpAvailableDist(tier, gauge) : null } }));
  }
  sections.harpDist = cases;
}
{
  const tierChain = [line('if(_dashHoldF>=_HARP_TIER_F[3])_dashTier=3;', 0), line('else if(_dashHoldF>=_HARP_TIER_F[2])_dashTier=2;', 0), line('else _dashTier=1;', 0)].join('\n');
  const tierChain2 = [line('if(_dashHoldF>=_HARP_TIER_F[3])_dashTier=3;', 1), line('else if(_dashHoldF>=_HARP_TIER_F[2])_dashTier=2;', 1), line('else _dashTier=1;', 1)].join('\n');
  const base = { _HARP_TIER_F: null, _dashHoldF: 0, _dashTier: 0 };
  const c0 = load(line('const _HARP_TIER_F='), base, ['_HARP_TIER_F']); base._HARP_TIER_F = c0._HARP_TIER_F;
  const a = load('function f(){' + tierChain + '}', base, ['f']), b = load('function f(){' + tierChain2 + '}', base, ['f']);
  const cases = [];
  for (let h = 0; h <= 130; h++) { base._dashHoldF = h; base._dashTier = 0; a.f(); const ta = base._dashTier; base._dashTier = 0; b.f(); if (ta !== base._dashTier) throw new Error('tier chains differ at ' + h); cases.push(J({ in: { holdF: h }, out: { tier: ta } })); }
  sections.chainTier = cases;
}
{
  const consts = [line('const _HARP_TIER_F='), line('const _HARP_GAUGE_COST='), line('const _HARP_GAUGE_BASE_CELLS='), line('let _HARP_GAUGE_MAX=')].join('\n');
  const release = line('const _gCost=Math.min(_harpGauge,_HARP_GAUGE_COST[_dashTier]);') + '\n' + line('const _hStCost=P.mst*0.01*_dashTier;') + '\n' + line('if(_gCost>0&&P.st>=_hStCost){') + '\n' + line('_harpGauge-=_gCost;P.st-=_hStCost;') + '\nfired=true;}';
  const maxDist = line('_harpDist=0;_harpMaxDist=_harpAvailableDist(_tier,_gCost);');
  const v = { _harpGauge: 0, _dashTier: 0, fired: false, _harpMaxDist: 0, _harpDist: 0, _tier: 0 };
  const base = { P: { skills: {}, st: 0, mst: 0 }, PASSIVES: { pCharge: 0 }, get _harpGauge() { return v._harpGauge; }, set _harpGauge(x) { v._harpGauge = x; }, _dashTier: 0, fired: false, _harpMaxDist: 0, _harpDist: 0, _tier: 0, _HARP_GAUGE_MAX: 0 };
  const ctx = {}; // plain object scope so assignments are observable
  Object.assign(ctx, base); delete ctx._harpGauge; ctx._harpGauge = 0;
  const m = load(consts + '\n' + fn('function pChargeRange') + '\n' + fn('function _harpDistTier') + '\n' + fn('function _harpAvailableDist') + '\nfunction rel(){fired=false;' + release + '\nif(fired){' + maxDist + '}}', ctx, ['rel']);
  const cases = [];
  for (const tier of [1, 2, 3]) for (const gauge of [0, 10, 45, 97, 98, 100, 150, 225]) for (const [st, mst] of [[0, 0], [5, 500], [14, 500], [15, 500], [499, 500], [10, 1000]]) for (const [cb, pc] of [[0, 0], [10, 10], [5, 3]]) {
    ctx._dashTier = tier; ctx._tier = tier; ctx._harpGauge = gauge; ctx.P.st = st; ctx.P.mst = mst; ctx.P.skills = { chargeBoost: cb, magicBlink: 0 }; ctx.PASSIVES.pCharge = pc; ctx._harpMaxDist = null;
    m.rel();
    cases.push(J({ in: { tier, gauge, st, mst, chargeBoost: cb, pCharge: pc }, out: { fired: ctx.fired, gauge: ctx._harpGauge, st: ctx.P.st, maxDist: ctx.fired ? ctx._harpMaxDist : null } }));
  }
  sections.chainRelease = cases;
}
{
  const l = line('if(!_pDead&&!(window._parryLesson?.active&&window._parryLesson.chapter===2)){const _hgRegen');
  const ctx = { P: { skills: {} }, PASSIVES: { pCharge: 0 }, pChargeGauge: null, window: { _parryLesson: null }, _pDead: false, _dashHold: false, _harpActive: false, _dashActive: false, _harpGauge: 0, _HARP_GAUGE_MAX: 225, _dtSp: 1 };
  const pg = load(fn('function pChargeGauge'), ctx, ['pChargeGauge']); ctx.pChargeGauge = pg.pChargeGauge;
  const m = load('function reg(){' + l + '}', ctx, ['reg']);
  const cases = [];
  for (const max of [225, 270, 450]) for (const g of [0, 100, 224.9, 225, 300]) for (const cb of [0, 5, 10]) for (const pc of [0, 10]) for (const dtSp of [1, .5, 2]) for (const [hold, ha, da, dead, les] of [[false, false, false, false, false], [true, false, false, false, false], [false, true, false, false, false], [false, false, true, false, false], [false, false, false, true, false], [false, false, false, false, true]]) {
    Object.assign(ctx, { _HARP_GAUGE_MAX: max, _harpGauge: g, _dashHold: hold, _harpActive: ha, _dashActive: da, _pDead: dead, _dtSp: dtSp }); ctx.P.skills = { chargeBoost: cb }; ctx.PASSIVES.pCharge = pc; ctx.window._parryLesson = les ? { active: true, chapter: 2 } : null;
    m.reg();
    cases.push(J({ in: { max, gauge: g, chargeBoost: cb, pCharge: pc, dtSp, hold, harpActive: ha, dashActive: da, dead, lessonCh2: les }, out: { gauge: ctx._harpGauge } }));
  }
  sections.gaugeRegen = cases;
}
{
  const s1 = line('const _harpGaugeCells='), s2 = line('_HARP_GAUGE_MAX=_harpGaugeCells*_HARP_GAUGE_COST[1]+~~(_eqAffix(\'extraST\')||0);');
  const t1 = line('const cells=_isFused(\'dimRush\')'), t2 = line('_HARP_GAUGE_MAX=cells*_HARP_GAUGE_COST[1]+~~(_eqAffix(\'extraST\')||0);');
  const stock = line('P.maxChargeStocks=_dimB?5:'), cd = line('const _chargeCdBase='), cd2 = line('if(P.chargeStocks<P.maxChargeStocks){if(P.chargeCd>0)P.chargeCd-=sp;else{P.chargeStocks++;');
  const ctx = { P: { skills: {}, chargeStocks: 0, maxChargeStocks: 0, chargeCd: 0 }, ar: () => ({ bonusChargeStock: ctx.arS }), bt: () => ({ bonusChargeStock: ctx.btS }), arS: 0, btS: 0, isDimBreach: () => ctx.dim, dim: false, _isFused: k => !!ctx.fused[k], fused: {}, _eqAffix: k => ctx.aff[k] || 0, aff: {}, _HARP_GAUGE_MAX: 0, _harpGauge: 0, sp: 1 };
  const m = load([line('const _HARP_GAUGE_COST='), line('const _HARP_GAUGE_BASE_CELLS=')].join('\n') + '\nfunction __g(){const _cbLvSt=P.skills.chargeBoost||0;const _hasChargeSk=_cbLvSt>=1||(P.skills.magicBlink||0)>=1;const _eqChargeStock=(ar().bonusChargeStock||0)+(bt().bonusChargeStock||0);const _dimB=isDimBreach();\n' + stock + '\n' + s1 + '\n' + s2 + '\nconst _cbLvCd=P.skills.chargeBoost||0;\n' + cd + '\nreturn {cells:_harpGaugeCells,max:_HARP_GAUGE_MAX,maxStocks:P.maxChargeStocks,cdBase:_chargeCdBase};}\nfunction __cd(){const sp=1;' + cd2 + '\n}\nfunction __cd2(){const _cbLvCd=P.skills.chargeBoost||0;const _dimB=isDimBreach();const _hasChargeSk=(P.skills.chargeBoost||0)>=1||(P.skills.magicBlink||0)>=1;' + cd + '\n' + 'return _chargeCdBase;}\nfunction __rt(){const _cbLvSt=P.skills.chargeBoost||0;const _hasChargeSk=_cbLvSt>=1||(P.skills.magicBlink||0)>=1;const dim=isDimBreach();const cells=_isFused(\'dimRush\')?10:_isFused(\'dimThunder\')?9:dim?7:_hasChargeSk?6:_HARP_GAUGE_BASE_CELLS;' + t2.replace('cells*', 'cells*') + '\nreturn {cells,max:_HARP_GAUGE_MAX};}', ctx, ['__g', '__cd', '__rt']);
  // the second site (63460-63465) must produce the same numbers: compare in the loop
  const cases = [];
  for (const [fused, dim] of [[{}, false], [{ dimRush: true }, false], [{ dimThunder: true }, false], [{}, true], [{ dimRush: true, dimThunder: true }, true]]) for (const [cb, mb] of [[0, 0], [1, 0], [0, 1], [10, 0], [25, 3]]) for (const extra of [0, 7.9, 100]) for (const [as, bs] of [[0, 0], [1, 1], [3, 4]]) {
    ctx.fused = fused; ctx.dim = dim; ctx.P.skills = { chargeBoost: cb, magicBlink: mb }; ctx.aff = { extraST: extra }; ctx.arS = as; ctx.btS = bs;
    const o = m.__g(); const o2 = m.__rt(); if (o.cells !== o2.cells || o.max !== o2.max) throw new Error('second gauge-max site differs');
    cases.push(J({ in: { dimRush: !!fused.dimRush, dimThunder: !!fused.dimThunder, dimBreach: dim, chargeBoost: cb, magicBlink: mb, extraST: extra, armorStock: as, bootsStock: bs }, out: o }));
  }
  sections.gaugeMax = cases;
}
{
  const l1 = line('const _hd=dst(P.x,P.y,_harpX,_harpY);'), l2 = line('const _dur=_HARP_PULL_DUR[_harpTier];'), l3 = line('_dashLeft=_dur;'), l4 = line('if(_hd>0){_dashVX=(_harpX-P.x)/_hd*(_hd/_dur);'), l5 = line('else{_dashVX=0;_dashVY=0;_dashLeft=0}'), l0 = line('_dashActive=true;_dashIframe=_HARP_IFRAME[_harpTier];');
  const ctx = { P: { x: 0, y: 0, poise: 0, skills: {}, st: 0 }, _harpX: 0, _harpY: 0, _harpTier: 1, _dashActive: false, _dashIframe: 0, _dashPhase: 0, _dashLeft: 0, _dashVX: 0, _dashVY: 0, _harpHit: true, dst: (a, b, c, d) => Math.hypot(a - c, b - d), _uqS: {}, _addSkProf() {} };
  const pre = [line('const _HARP_PULL_DUR='), line('const _HARP_IFRAME=')].join('\n');
  // l0 also arms the blade-wing auto activation (skills.chainSlash); chainSlash is 0 here so only the first assignments run
  const m = load(pre + '\nfunction pull(){' + l0 + '\n' + l1 + '\n' + l2 + '\n' + l3 + '\n' + l4 + '\n' + l5 + '\n}', ctx, ['pull'], ['addParts', 'addTxt', '_T', 'playSample']);
  const cases = [];
  for (const tier of [1, 2, 3]) for (const [px, py, hx, hy] of [[0, 0, 0, 0], [0, 0, 300, 0], [10, 20, 310, 20], [0, 0, 0, -500], [5, 5, 405, 305], [100, -50, -600, 450], [0, 0, 1200, 0]]) {
    Object.assign(ctx, { _harpTier: tier, _harpX: hx, _harpY: hy, _dashLeft: 99, _dashVX: 99, _dashVY: 99, _dashIframe: 0 }); ctx.P.x = px; ctx.P.y = py; ctx.P.poise = 1;
    m.pull();
    cases.push(J({ in: { tier, px, py, hx, hy }, out: { vx: ctx._dashVX, vy: ctx._dashVY, left: ctx._dashLeft, iframe: ctx._dashIframe, poise: ctx.P.poise } }));
  }
  sections.chainPull = cases;
}
{
  const l1 = line('const _harpStep=Math.min(_dtSp,Math.max(0,_harpMaxDist-_harpDist)/_HARP_SPD);'), l2 = line('_harpDist=Math.min(_harpMaxDist,_harpDist+_HARP_SPD*_harpStep);');
  const ctx = { _dtSp: 1, _harpMaxDist: 0, _harpDist: 0 };
  const m = load(line('const _HARP_SPD=') + '\nfunction fl(){' + l1 + '\n' + l2 + '\nreturn _harpStep;}', ctx, ['fl']);
  const cases = [];
  for (const dtSp of [.5, 1, 2]) for (const maxD of [0, 40, 63, 126, 300, 700, 1200]) for (const d of [0, 20, 62, 63, 299.5, 300, 1199]) { Object.assign(ctx, { _dtSp: dtSp, _harpMaxDist: maxD, _harpDist: d }); const step = m.fl(); cases.push(J({ in: { dtSp, maxDist: maxD, dist: d }, out: { step, dist: ctx._harpDist } })); }
  sections.chainFlight = cases;
}
{
  const step = line('const _dashStep=Math.min(_dtSp,Math.max(0,_dashLeft));'), ifr = line('P.iframes=Math.max(P.iframes,2); // 이동 중 무적'), land = line('P.iframes=Math.max(P.iframes,48); // 착지 0.8초 무적'), lt = line('_harpLandT=30;'), sh = line('if(!isDimBreach()||_slamLand){shake(');
  const ctx = { P: { iframes: 0, x: 0, y: 0, r: 5 }, _dtSp: 1, _dashLeft: 0, _harpTier: 1, _slamLand: false, _harpLandT: 0, isDimBreach: () => ctx.dim, dim: false, shakeAmt: null, _T: s => s, shake(a) { ctx.shakeAmt = a; } };
  const m = load('function st(){' + step + '\n' + ifr + '\n}\nfunction ld(){' + land + '\n' + lt + '\n' + sh + '\n}\n', ctx, ['st', 'ld'], ['_gpVibrate', 'addParts', 'addTxt']);
  const cases = [];
  for (const dtSp of [.5, 1, 2]) for (const left of [0, 0.4, 1, 7, 16]) for (const ifr0 of [0, 1, 5]) { Object.assign(ctx, { _dtSp: dtSp, _dashLeft: left }); ctx.P.iframes = ifr0; m.st(); cases.push(J({ in: { dtSp, left, iframes: ifr0 }, out: { step: Math.min(dtSp, Math.max(0, left)), iframes: ctx.P.iframes } })); }
  sections.chainStep = cases;
  const land2 = [];
  for (const tier of [1, 2, 3]) for (const dim of [false, true]) for (const slam of [false, true]) for (const ifr0 of [0, 30, 48, 60]) { Object.assign(ctx, { _harpTier: tier, dim, _slamLand: slam, shakeAmt: null, _harpLandT: 0 }); ctx.P.iframes = ifr0; m.ld(); land2.push(J({ in: { tier, dimBreach: dim, slamLand: slam, iframes: ifr0 }, out: { iframes: ctx.P.iframes, landT: ctx._harpLandT, shake: ctx.shakeAmt } })); }
  sections.chainLanding = land2;
}
{
  const l = line('_harpActive=true;_harpHit=false;_harpLandT=0;_harpHitE=null;_harpTier=Math.min(3,2+', 0);
  const ctx = { P: { skills: {}, activeChargeSk: 'charge', x: 0, y: 0 }, _harpActive: false, _harpHit: false, _harpLandT: 0, _harpHitE: null, _harpTier: 0, _harpSk: '', _harpHits: [], _dashPhase: 0, _harpX: 0, _harpY: 0, _harpVX: 0, _harpVY: 0, _harpDist: 0, _harpMaxDist: 0, _hDir: 0, _HARP_SPD: 63, _harpDistTier: t => t * 100 };
  const m = load('function cancel(){' + l + '}', ctx, ['cancel']);
  const cases = [];
  for (const cb of [0, 1, 2, 3, 5, 6, 8, 9, 10, 20]) { ctx.P.skills = { chargeBoost: cb }; m.cancel(); cases.push(J({ in: { chargeBoost: cb }, out: { tier: ctx._harpTier } })); }
  sections.chainCancelTier = cases;
}
// 11. player poise / stun ------------------------------------------------------------------------------------------------
{
  const focus = fn('function _isFocusState');
  const ctx = { P: { s: 'idle' } };
  const m = load(focus, ctx, ['_isFocusState']);
  sections.focusState = ['sBlock', 'peaceShield', 'whirlwind', 'beam', 'burstLoop', 'charge', 'bowDraw', 'rainLightning', 'idle', 'sBash', 'sDraw', 'kiGather', 'pStun', 'stagger', 'wSwing', 'sRecover', 'fallen'].map(s => { ctx.P.s = s; return J({ in: { s }, out: { focus: !!m._isFocusState() } }); });
}
{
  const hit = span('P.iframes=0;if(!_isFocusState()&&P.s!==\'pStun\'){', 'if(a>0)addTxt(P.x,P.y-10');   // up to (not including) the damage-number line
  const hsrc = span('const _HS={', '};', { inclusive: true });
  const ctx = { P: { s: 'idle', poise: 4, poiseR: 0, st2: 0, iframes: 7, x: 0, y: 0 }, G: { hitStop: 0 }, OPT: { hitStop: 100 }, _eqAffix: k => ctx.aff[k] || 0, aff: {}, _isKiCharging: () => ctx.kic, kic: false, _isDot: false };
  const m = load(hsrc + '\n' + fn('function _isFocusState') + '\nfunction hit(){if(_isDot){P.iframes=0}else{\n' + hit + '\n}}', ctx, ['hit'], ['SFX', 'poolPart']);
  const cases = [];
  for (const s of ['idle', 'sBash', 'sDraw', 'kiGather', 'pStun', 'sBlock', 'beam', 'wSwing', 'charge']) for (const poise of [0, 1, 2, 4]) for (const [cc, sr] of [[0, 0], [.2, .1], [.4, .4], [1, 1]]) for (const kic of [false, true]) for (const dot of [false, true]) for (const hs of [0, 100, 250]) {
    Object.assign(ctx, { kic, _isDot: dot }); ctx.aff = { ccRes: cc, stunRes: sr }; Object.assign(ctx.P, { s, poise, poiseR: 9, st2: 0, iframes: 7 }); ctx.G.hitStop = 0; ctx.OPT.hitStop = hs;
    m.hit();
    cases.push(J({ in: { s, poise, ccRes: cc, stunRes: sr, kiCharging: kic, dot, optHitStop: hs }, out: { s: ctx.P.s, poise: ctx.P.poise, poiseR: ctx.P.poiseR, st2: ctx.P.st2, iframes: ctx.P.iframes, hitStop: ctx.G.hitStop } }));
  }
  sections.playerHit = cases;
}
{
  const a = at('// 해제 패링: sBlock'), b = at('// 회전기폭 합체: 회전 중', 1);
  const body = record(a, b - 1, 'release/peace/sBlock branches of hurtP');
  const gAbs = fn('function pGuardAbsorb') + '\n' + fn('function pShieldBlock') + '\n' + fn('function _isFocusState');
  const ctx = { P: { s: 'idle', _sbParryT: 0, poise: 4, poiseR: 0, st2: 0, iframes: 0, skills: {}, parryBank: 0, kb: { x: 0, y: 0 }, x: 0, y: 0 }, PASSIVES: { pGuard: 0 }, _eqAffix: k => ctx.aff[k] || 0, aff: {}, calls: [], doParry(...a) { ctx.calls.push(a.map(x => x === undefined ? null : x)); }, shakeAmt: null, shake(a) { ctx.shakeAmt = a; }, _detonateBlast(l) { ctx.blasts.push(l); }, blasts: [], wp: () => ({ el: 0 }), _isDotEarly: false, dmg0: 0 };
  const m = load(gAbs + '\nfunction blk(dmg,opts){const _isDotEarly=opts&&opts.dot;const __r=(function(){\n' + body + '\nreturn "fell";}).call(this);return {dmg,fell:__r==="fell"};}', ctx, ['blk'], ['playSample', 'doHitFlash', 'addTxt', '_T', '_r', 'SFX']);
  const cases = [];
  for (const c of grid({ s: ['sBlock', 'peaceShield', 'idle', 'sBash', 'whirlwind'], sb: [0, 1, 12, 20], dot: [false, true], red: [false, true], dmg: [1, 33, 500], poise: [1, 2, 4], dp: [[0, 0], [1, 130], [1, 20]], gd: [[0, 0], [5, .1], [10, .3]], cs: [[0, 0], [.3, .3]] }, 2500)) {
    const { s, sb, dot, red, dmg, poise } = c, [det, pt] = c.dp, [pg, sbdr] = c.gd, [cc, sr] = c.cs;
    Object.assign(ctx.P, { s, _sbParryT: sb, poise, poiseR: 3, st2: 0, iframes: 0, skills: { detonate: det }, parryBank: 5, parryT: pt, kb: { x: 0, y: 0 } }); ctx.PASSIVES.pGuard = pg; ctx.aff = { shieldBlockDR: sbdr, ccRes: cc, stunRes: sr }; ctx.calls = []; ctx.blasts = []; ctx.shakeAmt = null;
    const opts = { dot, redBean: red }; const r = m.blk(dmg, opts);
    cases.push(J({ in: { s, sbParryT: sb, dot, redBean: red, dmg, poise, detonate: det, parryT: pt, pGuard: pg, shieldBlockDR: sbdr, ccRes: cc, stunRes: sr }, out: { dmg: r.dmg, retFell: !!r.fell, s: ctx.P.s, poise: ctx.P.poise, poiseR: ctx.P.poiseR, st2: ctx.P.st2, iframes: ctx.P.iframes, sbParryT: ctx.P._sbParryT, parryBank: ctx.P.parryBank, doParry: ctx.calls, blasts: ctx.blasts, shake: ctx.shakeAmt, kbMag: Math.hypot(ctx.P.kb.x, ctx.P.kb.y) } }));
  }
  sections.blockBranch = cases;
}
{
  const a = at("case 'stagger':{");
  // from `case 'stagger'` to the closing `break;}` of pStun
  let end = at("case 'pStun':{"); while (!lines[end - 1].trimStart().startsWith('break;}')) end++;
  const body = record(a, end, 'stagger/pStun exits');
  const ctx = { P: { s: 'idle', st2: 0, iframes: 0, poise: 0, poiseR: 0, _bdTrigger: null, _seaParalyzed: 0, _pStunSayF: 0, x: 0, y: 0 }, _gameFrame: 0, K: { ShiftLeft: false }, _dashHold: false, _harpActive: false, _dashActive: false, jc: {}, isJust: k => !!ctx.jc[k], _canMobility: () => ctx.canBd, canBd: false, bd: [], activateMobility: v => ctx.bd.push(v) };
  const m = load('function ex(){switch(P.s){\n' + body + '\n}}', ctx, ['ex'], ['addTxt', '_T']);
  const cases = [];
  for (const s of ['stagger', 'pStun']) for (const st2 of [0, 5]) for (const jc of [{}, { charge: true }, { parry: true }, { skill7: true }]) for (const [sh, dh, ha, da] of [[false, false, false, false], [true, true, false, false], [true, false, true, false], [true, false, false, true], [true, false, false, false]]) for (const [bdT, cbd, sea] of [[null, false, 0], [1, true, 0], [1, true, 5], [1, false, 0]]) {
    Object.assign(ctx.P, { s, st2, iframes: 0, poise: 0, poiseR: 9, _bdTrigger: bdT, _seaParalyzed: sea, _pStunSayF: 0 }); ctx._gameFrame = 1000; ctx.jc = jc; ctx.K.ShiftLeft = sh; Object.assign(ctx, { _dashHold: dh, _harpActive: ha, _dashActive: da, canBd: cbd, bd: [] });
    m.ex();
    cases.push(J({ in: { s, st2, jcCharge: !!jc.charge, jcParry: !!jc.parry, jcSkill7: !!jc.skill7, shiftHeld: sh, dashHold: dh, harpActive: ha, dashActive: da, bdTrigger: bdT, canBladeDash: cbd, seaParalyzed: sea }, out: { s: ctx.P.s, st2: ctx.P.st2, iframes: ctx.P.iframes, poise: ctx.P.poise, poiseR: ctx.P.poiseR, bladeDash: ctx.bd, bdTriggerAfter: ctx.P._bdTrigger } }));
  }
  sections.stunExit = cases;
}
// 12. enemy poise --------------------------------------------------------------------------------------------------------
{
  const pf = fn('function _poiseHit') + '\n' + fn('function _poiseReset');
  const ctx = { _uqScCtx: null, _uEq: () => 0, _uqS: {}, G: { slowMo: 0, _noHitStopT: 0 }, SFX: { groggy() {} }, Math };
  const m = load(pf, ctx, ['_poiseHit', '_poiseReset'], ['addTxt', 'poolPart', '_T', '_tickSkyCrusherRecharge']);
  const cases = [];
  for (const ib of [false, true]) for (const imm of [0, 1, 300]) for (const poise of [1, 20, 100]) for (const amt of [-5, 0, 1, 19, 20, 21, 100, 5000]) for (const stunned of [0, 30, 200]) for (const maxStun of [0, 60, 200]) for (const noHs of [0, 5]) {
    const e = { alive: true, ib, _pImmune: imm, poise, maxPoise: 100, poiseR: 7, stunned, _maxStunned: maxStun, x: 0, y: 0 }; ctx.G.slowMo = 0; ctx.G._noHitStopT = noHs;
    const r = m._poiseHit(e, amt);
    cases.push(J({ in: { ib, pImmune: imm, poise, amt, stunned, maxStunned: maxStun, noHitStopT: noHs }, out: { ret: !!r, poise: e.poise, poiseR: e.poiseR, stunned: e.stunned, maxStunned: e._maxStunned, pImmune: e._pImmune, slowMo: ctx.G.slowMo } }));
  }
  const dead = { alive: false, ib: false, poise: 5, maxPoise: 100, poiseR: 2 }; cases.push(J({ in: { dead: true, amt: 5 }, out: { ret: !!m._poiseHit(dead, 5), poise: dead.poise } }));
  sections.poiseHit = cases;
}
{
  // hurtE poise amount (L42488-42491): condition + `let amt` + boss resistance + staggerBns, then _poiseHit(e,amt)
  const a = at('if(!isDot && (opts && opts.poiseHit) && !(isBoss && e._pImmune > 0)){');
  const head = record(a, a + 3, 'hurtE poise amount');
  const ctx = { _eqAffix: k => (k === 'staggerBns' ? ctx.sb : 0), sb: 0, called: null, _poiseHit: (e, amt) => { ctx.called = amt; return false; } };
  const m = load('function amtF(dmg,psM,isBoss,atkEl,isDot,opts,e){' + head + '\nctx_marker(amt);}}', Object.assign(ctx, { ctx_marker: a => { ctx.called = a; } }), ['amtF']);
  const cases = [];
  for (const dmg of [0, 1, 7, 100, 999, 12345]) for (const psM of [undefined, 0, .5, 1, 1.5, 2]) for (const isBoss of [false, true]) for (const atkEl of [0, 1, 4]) for (const isDot of [false, true]) for (const pi of [0, 1, 300]) for (const sb of [0, 3.7]) for (const poiseHit of [false, true]) {
    ctx.sb = sb; ctx.called = null; const e = { _pImmune: pi }; const opts = { poiseHit, poiseMult: psM };
    m.amtF(dmg, psM === undefined ? 1.0 : psM, isBoss, atkEl, isDot, psM === undefined ? { poiseHit } : opts, e);
    cases.push(J({ in: { dmg, poiseMult: psM ?? null, isBoss, atkEl, isDot, pImmune: pi, staggerBns: sb, poiseHit }, out: { amt: ctx.called } }));
  }
  sections.poiseAmount = cases;
  // groggy damage (x1.5 while stunned) and the poiseMult default
  const g = line('if(e.stunned>0&&!isDot){dmg=~~(dmg*1.5)}');
  const gm = load('function gd(e,dmg,isDot){' + g + '\nreturn dmg;}', {}, ['gd']);
  const gc = [];
  for (const st of [0, .5, 1, 90, 180]) for (const dmg of [0, 1, 3, 100, 777]) for (const isDot of [false, true]) gc.push(J({ in: { stunned: st, dmg, isDot }, out: { dmg: gm.gd({ stunned: st }, dmg, isDot) } }));
  sections.groggyDamage = gc;
  const pm = line('const psM = (opts && opts.poiseMult !== undefined) ? opts.poiseMult : 1.0;');
  const pmf = load('function f(opts){' + pm + '\nreturn psM;}', {}, ['f']);
  sections.poiseMultDefault = [undefined, 0, .5, 2].map(v => J({ in: { poiseMult: v ?? null }, out: { psM: pmf.f(v === undefined ? {} : { poiseMult: v }) } }));
}
{
  // enemy timers / groggy end / ordinary poise regeneration (L34451-34456, 38618-38638, 38663-38666)
  const l1 = line('if(e.stunned>0)e.stunned-=sp;'), l2 = line('if(e._hitStun>0)e._hitStun-=sp;'), l3 = line('if(e._stunImmune>0)e._stunImmune-=sp;'), l4 = line('if(e._pImmune>0)e._pImmune-=sp;'), l5 = line('if(e.stunned<=0&&e._maxStunned){');
  const stunBlock = span('if(e._hitStun>0)return;', '// 이동 판정: 이전 위치와 비교');
  const regen = span('// 포이즈 틱: 일반몹만 자연회복', 'let d=dst(P.x,P.y,e.x,e.y);');
  const ctx = {};
  const m = load(fn('function _poiseReset') + '\nfunction frame(e,sp){\n' + [l1, l2, l3, l4, l5].join('\n') + '\n(function(){\n' + stunBlock + '\n' + regen + '\n})();}', ctx, ['frame'], ['_cancelProjCharge']);
  const cases = [];
  for (const c of grid({ ib: [false, true], stunned: [0, .5, 1, 2, 100, 179, 180, 181, 500], maxS: [0, 90, 180, 300], hit: [0, 1, 3], imm: [0, 1, 2, 300], poise: [0, 50, 100], pr: [0, 150, 199, 200, 250], sp: [1, .5] }, 3000)) {
    const { ib, stunned, maxS, hit, imm, poise, pr, sp } = c;
    const e = { ib, stunned, _maxStunned: maxS, _hitStun: hit, _stunImmune: 3, _pImmune: imm, poise, maxPoise: 100, poiseR: pr, s: 'atk', st2: 77, _teleDropY: 5 };
    m.frame(e, sp);
    cases.push(J({ in: { ib, stunned, maxStunned: maxS, hitStun: hit, pImmune: imm, poise, poiseR: pr, sp }, out: { stunned: e.stunned, maxStunned: e._maxStunned, hitStun: e._hitStun, stunImmune: e._stunImmune, pImmune: e._pImmune, poise: e.poise, poiseR: e.poiseR, s: e.s, st2: e.st2, teleDropY: e._teleDropY } }));
  }
  sections.enemyFrame = cases;
}
// 13. shield / sBlock / charge-slash scalars ------------------------------------------------------------------------------
{
  const sc = line("if(key==='shield')return 5+((P.skills.maliceSwipe||1)-1)*2;");
  const ctx = { P: { skills: {} } };
  const m = load('function sc(key){' + sc + '\nreturn -1;}', ctx, ['sc']);
  sections.shieldCost = [0, 1, 2, 5, 10, 25].map(v => { ctx.P.skills = { maliceSwipe: v }; return J({ in: { maliceSwipe: v }, out: { cost: m.sc('shield') } }); });
  const rec = line("else if(P.st2<=0){P.s='sRecover';P.st2=~~(28/pParryRmbSpd())}");
  const c2 = { P: { s: 'sBash', st2: 0 }, PASSIVES: { pParry: 0 } };
  const m2 = load(fn('function pParryRmbSpd') + '\nfunction rc(){if(false){}\n' + rec + '\n}', c2, ['rc']);
  sections.sRecover = [0, 1, 3, 5, 9, 10, 15].map(v => { c2.PASSIVES.pParry = v; Object.assign(c2.P, { s: 'sBash', st2: 0 }); m2.rc(); return J({ in: { pParry: v }, out: { s: c2.P.s, st2: c2.P.st2 } }); });
  // kiGather: tier by charge, release multiplier, fizzle, forced release at 186
  const tier = line('P._kgTier=P._kgChg>=180?3:P._kgChg>=120?2:P._kgChg>=60?1:0;');
  const relN = at('if(P._kgChg>=18){const _kgTsec'); if (!lines[relN].trimStart().startsWith('else{addTxt(P.x,P.y-30,_T(')) throw new Error('source drift: kiGather fizzle line'); const rel1 = record(relN, relN, 'kiGather release'), rel2 = record(relN + 1, relN + 1, 'kiGather fizzle');
  const auto = line('if(P._kgChg>=186){_kgRelease(3,3);break}');
  const k = { P: { s: 'kiGather', st2: 0, iframes: 0, _kgChg: 0, _kgTier: 0, _sBashChgMul: 1, skills: {}, _stCd: 0 }, _charIdx: 0, window: { _parryLesson: null }, rel: [] };
  const m3 = load(fn('function _kgRelease') + '\nfunction tierF(){' + tier + '}\nfunction relF(){' + rel1 + '\n' + rel2 + '\n}\nfunction autoF(){switch(1){case 1:' + auto + '}}', k, ['tierF', 'relF', 'autoF'], ['_startSilvertailAttackMotion', '_addSkProf', '_playSwordBack', 'playSample', '_autoShieldThrow', 'addTxt', '_T', '_r']);
  const kc = [];
  for (const chg of [0, 5, 17, 17.9, 18, 30, 59, 60, 119, 120, 179, 180, 185, 185.9, 186, 200, 400]) {
    Object.assign(k.P, { s: 'kiGather', _kgChg: chg, _kgTier: 0, _sBashChgMul: 1, iframes: 0, st2: 0 }); m3.tierF(); const tierV = k.P._kgTier;
    Object.assign(k.P, { s: 'kiGather', _kgChg: chg, _kgTier: tierV, _sBashChgMul: 1, iframes: 0, st2: 0 }); m3.relF(); const rl = { s: k.P.s, st2: k.P.st2, mul: k.P._sBashChgMul, chg: k.P._kgChg, tier: k.P._kgTier };
    Object.assign(k.P, { s: 'kiGather', _kgChg: chg, _kgTier: tierV, _sBashChgMul: 1, iframes: 0, st2: 0 }); m3.autoF(); const au = { s: k.P.s, st2: k.P.st2, mul: k.P._sBashChgMul };
    kc.push(J({ in: { kgChg: chg }, out: { tier: tierV, release: rl, auto: au } }));
  }
  sections.kiGather = kc;
  // sBash fire (tap confirmed): stamina gate + state
  const k2 = { P: { s: 'sDraw', st2: 0, st: 0, mst: 100, skills: {}, _stCd: 0, _atkBon: 0, _sBashChgMul: 5 }, _lastCost: 0, PASSIVES: {}, _skLv: () => 1 };
  const m4 = load(fn('function stCost') + '\n' + fn('function useStPct') + '\n' + fn('function _sBashFire'), k2, ['_sBashFire'], ['_startSilvertailAttackMotion', '_addSkProf', '_playSwordBack', 'playSample', '_autoShieldThrow', 'showPH', '_T', '_r']);
  const fc = [];
  for (const st of [0, 4, 5, 6, 7, 9, 100]) for (const mal of [0, 1, 2, 3]) for (const thr of [0, 1]) { Object.assign(k2.P, { s: 'sDraw', st2: 0, st, skills: { maliceSwipe: mal, shieldThrow: thr }, _atkBon: -1, _sBashChgMul: 5 }); k2._lastCost = 0; const r = m4._sBashFire(); fc.push(J({ in: { st, maliceSwipe: mal, shieldThrow: thr }, out: { fired: !!r, st: k2.P.st, s: k2.P.s, st2: k2.P.st2, chgMul: k2.P._sBashChgMul, atkBon: k2.P._atkBon, lastCost: k2._lastCost } })); }
  sections.sBashFire = fc;
  // sBash strike moment (st2 crosses 12) and tap buffer
  const hitL = line('if(P.st2<=12&&P.st2+sp>12){');
  const k3 = { P: { st2: 0 } };
  const m5 = load('function h(sp){let r=false;' + hitL + 'r=true;}\nreturn r;}', k3, ['h']);
  const hc = [];
  for (const st2 of [20, 14, 13.5, 13, 12.5, 12, 11.9, 8, 4, 0]) for (const sp of [.5, 1, 2]) { k3.P.st2 = st2; hc.push(J({ in: { st2, sp }, out: { hit: m5.h(sp) } })); }
  sections.sBashStrike = hc;
  const k4 = { _sdTapBuf: -999, _gameFrame: 0 };
  const m6 = load(line('var _sdTapBuf=-999;') + '\n' + fn('function _sdTapOk') + '\nfunction setBuf(v){_sdTapBuf=v}\nfunction buf(){return _sdTapBuf}', k4, ['_sdTapOk', 'setBuf', 'buf']);
  const tc = [];
  for (const buf of [-999, 0, 5, 100]) for (const fr of [0, 1, 3, 4, 5, 98, 103, 104]) { m6.setBuf(buf); k4._gameFrame = fr; const ok = !!m6._sdTapOk(); tc.push(J({ in: { buf, frame: fr }, out: { ok, bufAfter: m6.buf() } })); }
  sections.sdTap = tc;
  // sBlock enter / per-frame / release
  const e1 = line('if(P.mp<10)return false;'), e2 = line("P.mp-=10;P.s='sBlock';P.st2=999;P._sbParryT=_lSbParryT();"), e3 = line("P._sbCd=~~(30*(1+_eqAffix('shieldCdRed')));");
  const t1 = line('P._sbHoldT=(P._sbHoldT||0)+sp;'), t2 = line('P.mp-=P.mmp*.000833*sp;if(P.mp<0)P.mp=0;'), t3 = line('if(P._sbParryT>0)P._sbParryT-=sp;');
  const r1 = line('const _sbReleaseR=_sBlockChargeRadius(P._sbHoldT);'), r2 = line("P._sbProfDone=false;P.s='idle';P._sbParryT=12;"), r3 = line('P._sbReleaseR=_sbReleaseR;P._sbHoldT=0;');
  const q = { P: { mp: 0, mmp: 0, skills: {}, s: 'idle', st2: 0, _sbParryT: 0, _sbHoldT: 0, _sbReleaseR: 0, parryT: 0, _sbCd: 0 }, _lEq: k => (k === '_lCapeParry' ? q.cape : 0), cape: 0, _eqAffix: k => (k === 'shieldCdRed' ? q.red : 0), red: 0 };
  const m7 = load(fn('function _lSbParryT') + '\n' + fn('function _sBlockChargeRadius') + '\nfunction enter(){' + e1.replace('return false', 'return false') + '\n' + e2 + '\n' + e3 + '\nreturn true;}\nfunction tick(sp){' + t1 + '\n' + t2 + '\n' + t3 + '\n}\nfunction rel(){' + r1 + '\n' + r2 + '\n' + r3 + '\n}', q, ['enter', 'tick', 'rel'], ['_qDetonateFired']);
  const qc = [];
  for (const mp of [0, 9, 9.9, 10, 10.1, 400]) for (const cape of [0, .25, 1]) for (const red of [0, .3, 1.5]) { Object.assign(q.P, { mp, mmp: 400, s: 'idle', st2: 0, _sbParryT: 0, _sbHoldT: 5, _sbReleaseR: 9, parryT: 7, _sbCd: 0 }); q.cape = cape; q.red = red; const r = m7.enter(); qc.push(J({ in: { mp, cape, shieldCdRed: red }, out: { entered: !!r, mp: q.P.mp, s: q.P.s, st2: q.P.st2, sbParryT: q.P._sbParryT, holdT: q.P._sbHoldT, releaseR: q.P._sbReleaseR, parryT: q.P.parryT, sbCd: q.P._sbCd } })); }
  sections.sBlockEnter = qc;
  const tk = [];
  for (const mp of [0, .1, 5, 400]) for (const mmp of [100, 400]) for (const par of [0, .5, 1, 20]) for (const hold of [0, 100, 240]) for (const sp of [.5, 1, 2]) { Object.assign(q.P, { mp, mmp, _sbParryT: par, _sbHoldT: hold }); m7.tick(sp); tk.push(J({ in: { mp, mmp, sbParryT: par, holdT: hold, sp }, out: { mp: q.P.mp, sbParryT: q.P._sbParryT, holdT: q.P._sbHoldT } })); }
  sections.sBlockTick = tk;
  const rl = [];
  for (const hold of [0, 1, 60, 120, 239, 240, 500]) { Object.assign(q.P, { s: 'sBlock', _sbHoldT: hold, _sbParryT: 7, _sbReleaseR: 0 }); m7.rel(); rl.push(J({ in: { holdT: hold }, out: { s: q.P.s, sbParryT: q.P._sbParryT, releaseR: q.P._sbReleaseR, holdT: q.P._sbHoldT } })); }
  sections.sBlockRelease = rl;
}
// 14. sBash strike: damage expression (`_gsDmg2`) and the per-enemy _gSlamHit decision (B07b) -------------------------------------
{
  const dmgLine = line('const _gsDmg2=~~(meleeRef()*2.0');
  const dc = { meleeRef: () => dc.mr, statStr: () => dc.ss, pShieldMul: () => dc.ps, mr: 0, ss: 1, ps: 1, P: { _atkBon: 0 } };
  const dm = load('function f(_sdLv,_chgM){' + dmgLine + '\nreturn _gsDmg2;}', dc, ['f']);
  const cases = [];
  for (const c of grid({ mr: [0, 1, 37, 120, 999.5, 54321], lv: [0, 1, 2, 5, 20], ss: [1, 1.37, 2.5], ps: [1, 1.2], chg: [1, 1.5, 2, 2.4, 3], bon: [0, 7, 16] }, 4000)) {
    dc.mr = c.mr; dc.ss = c.ss; dc.ps = c.ps; dc.P._atkBon = c.bon; const v = dm.f(c.lv, c.chg);
    cases.push(J({ in: { meleeRef: c.mr, maliceSwipe: c.lv, statStr: c.ss, pShieldMul: c.ps, chgMul: c.chg, atkBon: c.bon }, out: { dmg: v, atkBonAfter: dc.P._atkBon } }));
  }
  sections.bashDamage = cases;
}
{
  const gs = fn('function _gSlamHit'), dstF = fn('function dst(a,b,c,d)'), elF = fn('function elMul'), mini = line('const _MINI_STUN=60;');
  const EL = { P: 0, F: 1, I: 2, D: 3, L: 4, H: 5, E: 6 };
  const ctx = { P: { x: 0, y: 0, _atkBon: 0, _gslLv: 0, skills: { giantSlam: 1 } }, _shBufI: 0, OPT: { parts: 100 }, EL, ELC: ['#bbbbbb', '#ff5522', '#3388ff', '#9933cc', '#ffee00', '#ff88cc', '#88aa44'], ELP: ['#dddddd', '#ff6622', '#44aaff', '#bb55ee', '#ffee44', '#ffdd55'],
    cur: null, pam: 1, kills: false, hurt: null, poise: null, texts: [], shQuery: () => [ctx.cur], _T: t => t, addTxt: (x, y, t) => { ctx.texts.push(t); }, poolPart: () => {}, shake: () => {}, _hurtFieldMobs: () => {},
    hurtE: (e, fd, ang, dot, opts, el) => { ctx.hurt = { fd, opts: { kbMult: opts.kbMult, noPoise: !!opts.noPoise, noImpact: !!opts.noImpact }, el }; if (ctx.kills) e.alive = false; },
    _poiseHit: (e, amt) => { ctx.poise = amt; return false; }, pAtkMul: () => ctx.pam };
  const m = load(mini + dstF + '\n' + elF + '\n' + gs + '\nfunction run(dir,range,arcW,dmg,el,kbM,psM,stunRange){return _gSlamHit(dir,range,arcW,dmg,el,kbM,psM,stunRange);}', ctx, ['run', 'elMul']);
  const cases = [], base = [];
  for (const c of grid({ d: [0, 40, 100, 200, 219, 220, 221, 260, 261, 300, 400], r: [10, 20, 36], range: [160, 220, 330], sr: [0, 400], el: [0, 1, 3, 4], eel: [null, 0, 1, 2, 3, 4, 5, 6], ib: [false, true], poise: [0, 1, 100], maxPoise: [100, 31166], stunned: [0, 30, 100], kills: [false, true], raw: [0, 1, 100, 12345], pam: [1, 1.37], bon: [0, 7], gsl: [0, 1, 3, 20], sk: [1, 5] }, 6000)) {
    const e = { alive: true, x: c.d, y: 0, r: c.r, ib: c.ib, poise: c.poise, maxPoise: c.maxPoise, stunned: c.stunned, kb: { x: 0, y: 0 }, el: c.eel === null ? undefined : c.eel };
    ctx.cur = e; ctx.pam = c.pam; ctx.kills = c.kills; ctx.hurt = null; ctx.poise = null; ctx.texts = []; Object.assign(ctx.P, { _atkBon: c.bon, _gslLv: c.gsl, skills: { giantSlam: c.sk } });
    const mult = m.elMul(c.el, e.el);
    m.run(0, c.range, Math.PI * .8, c.raw, c.el, 1.5, .8, c.sr === 0 ? undefined : c.sr);
    cases.push(J({ in: { d: c.d, r: c.r, range: c.range, stunRange: c.sr, mult, ib: c.ib, poise: c.poise, maxPoise: c.maxPoise, stunned: c.stunned, kills: c.kills, raw: c.raw, pAtkMul: c.pam, atkBon: c.bon, gslLv: c.gsl, giantSlam: c.sk },
      out: { hurt: ctx.hurt, kbX: e.kb.x, stunned: e.stunned, poise: e.poise, poiseAmt: ctx.poise, texts: ctx.texts, bonAfter: ctx.P._atkBon } }));
  }
  sections.slamHit = cases;
}
// ---- output -----------------------------------------------------------------------------------------------------------------
const result = { schema: 'exoduser.unity.dash-parry-oracle.v1', source: { file: 'game.html', sha256: sha(text), lines: lines.length, note: 'working-tree file of the extraction machine (may contain uncommitted edits); blocks below are what the oracle actually executed' },
  wrapper: { noops: [...noopUsed].sort(), note: 'identifiers not declared in a section wrapper throw; only these names were allowed as silent no-op functions (audio, text, particles, pet/unique hooks); see README.md for the declared stubs of each section' },
  blocks, sections, counts: Object.fromEntries(Object.entries(sections).map(([k, v]) => [k, Array.isArray(v) ? v.length : 1])) };
if (CHECK) {
  const old = JSON.parse(fs.readFileSync(OUT, 'utf8')); const drift = [];
  for (const b of blocks) { const o = old.blocks.find(x => x.label === b.label && x.sha256 === b.sha256); if (!o) drift.push(b.label + ' @' + b.from + '-' + b.to); }
  if (drift.length) { console.error('SOURCE DRIFT (' + drift.length + ' block(s) differ from the committed oracle):\n ' + drift.join('\n ')); process.exit(1); }
  console.log('source blocks identical to oracle.json (' + blocks.length + ' blocks)'); process.exit(0);
}
fs.writeFileSync(OUT, JSON.stringify(result));
console.log(JSON.stringify({ out: OUT, bytes: fs.statSync(OUT).size, blocks: blocks.length, sections: result.counts, noops: result.wrapper.noops }));
