// PC-RP parry-reflect oracle exporter (same helpers as dash-parry-oracle/export.cjs): executes the ORIGINAL game.html functions / statement blocks (chain dash, parry, shield, player poise, enemy poise)
// in a Node VM and writes oracle.json, which Program.cs (.NET 8) compares with Runtime/Core/Combat/*.cs. No expected value is typed by hand: every
// "out" below is produced by running the web source. usage: node export.cjs [--source G:/exoduser/game.html] [--out oracle.json] [--check]
//  --check : re-extract and fail when any extracted block's sha256 differs from the committed oracle.json (source drift) instead of writing.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), crypto = require('node:crypto');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const SRC = path.resolve(arg('--source', 'G:/exoduser/game.html')), OUT = path.resolve(arg('--out', path.join(__dirname, 'oracle.json'))), CHECK = process.argv.includes('--check');
const text = fs.readFileSync(SRC, 'utf8'), lines = text.split('\n');
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
function load(src, base, expose, noops = []) { if (!('SFX' in base)) base.SFX = SFXP; const s = scope(base, noops); return new Function('__s', 'with(__s){' + src + '\nreturn {' + expose.join(',') + '};}')(s); }
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
// 15. parry reflection of enemy bullets (35064-35248: the branch chain of the projectile loop that turns a parried bullet into a blue bean, run as written) ------
{
  const calls = { doParry: [], recycled: 0, hurts: 0, ice: 0 };
  const P = { s: 'idle', st2: 0, _kiParryT: 0, _sbParryT: 0, _sbReleaseR: 0, _sBashChgMul: 1, skills: {}, r: 10, x: 100, y: 100, iframes: 0, parryBank: 0, kb: { x: 0, y: 0 }, _ioActive: false, mhp: 1000, poise: 4 };
  const v = { meleeRef: 10, statStr: 1, pAtkMul: 1, magicRef: 10, statInt: 1, pMagicMul: 1, parryBonus: 0, legSP: 0, bonusRange: 0, wRange: undefined, wpBonus: 0, fused: false, tgt: null };
  const noopFn = () => undefined, z = () => [];
  const base = {
    P, G: { slowMo: 0, shake: 0, hitStop: 0 }, OPT: { shake: 100, hitStop: 100 }, PASSIVES: { pParry: 0, pGuard: 0 }, window: { _parryLesson: { active: false, hit: noopFn, miss: noopFn } },
    meleeRef: () => v.meleeRef, statStr: () => v.statStr, pAtkMul: () => v.pAtkMul, magicRef: () => v.magicRef, statInt: () => v.statInt, pMagicMul: () => v.pMagicMul,
    _eqAffix: k => (k === 'parryBonus' ? v.parryBonus : 0), _lEq: k => (k === '_lShieldParry' ? v.legSP : 0), _uEq: () => 0, sh: () => ({ bonusRange: v.bonusRange }), wp: () => ({ wRange: v.wRange, bonusRange: v.wpBonus }),
    _isFused: () => v.fused, _isFocusState: () => false, pParryRainbowDR: () => 0, ELC: {}, _HS: { pStun: 6 },
    _parryHomingTarget: () => v.tgt, shQuery: z, hurtE: noopFn, dst: (a, b, c, d) => Math.hypot(a - c, b - d), elMul: () => 1, ar: () => ({ el: 0 }),
    _recycleProj: () => { calls.recycled++; }, _hurtProjectilePlayer: () => { calls.hurts++; },
    _resolveBigEnergyParry: noopFn, _startBigEnergyPlayerSlide: noopFn, _fbEnergyBoom: noopFn, _projHitFx: noopFn, _addBoom: noopFn, _spawnSmoke: noopFn, _bigEnergyContactRadius: p => Math.max(p.r || 16, p.sz || 48),
    _waterBeanIceBurst: () => { calls.ice++; }, scrFlash: '', scrFlashA: 0,
    doParry: (dmg, x, y, flag, el, mul, tag) => { calls.doParry.push({ dmg, x, y, el: el === 'red' || el === 'rainbow' ? el : null, mul: mul === undefined ? null : mul, tag: tag === undefined ? null : tag }); },
  };
  const fnSrc = ['function _lParryWinTicks', 'function isPWin', 'function _wingStrikeLevel', 'function _eSkillRangeMul', 'function _isBigEnergy', 'function _projectileParryClass', 'function _physicalProjectileMultiplier', 'function _isPhysicalMouthProjectile',
    'function _sBlockChargeRadius', 'function _sBlockProjectileZone', 'function pParryDmg', 'function pParryProjDmg'].map(n => fn(n)).join('\n');
  const decl = span('const _pCollR=P.r+', 'let _pDist=');
  const block = span('const _qZone=', "else if(P.s==='whirlwind'&&_isFused('whirlDet')&&!p.friendly&&!p.bomb");
  const src = line('var _PARRY_WIN=') + '\n' + line('const EL={') + '\n' + fnSrc + '\n' +
    'function __reflect(p,__d){let pw=0;const projs=[];let _pHit=false;\n' + line('const _bigBall=_isBigEnergy(p);') + '\n' + decl + '\nlet _pDist=__d;let __fell=false;\n' +
    'for(let __o=0;__o<1;__o++){\n' + block + '\n}\n__fell=true;}\nreturn {kept:pw,pHit:_pHit,fell:__fell};}';
  const m = load(src, base, ['__reflect'], NOOP_COMMON);
  const keys = ['x', 'y', 'vx', 'vy', 'dmg', 'life', 'ml', 'friendly', 'redBean', 'titanEye', 'bwBean', 'gbBean', 'waterBean', 'blueBean', 'parryBlueBean', 'magic', 'homing', 'col', '_aoeR', '_aoeDmg', '_fromRainbow', 'elemBall'];
  const protos = [{ el: 1 }, { el: 0 }, { el: 3, dmg: 0 }, { el: 0, redBean: true }, { el: 0, titanEye: true }, { el: 0, bwBean: true }, { el: 2, gbBean: true }, { el: 4, waterBean: true }, { el: 1, blackBean: true }, { el: 5, elemBall: true, _druidStraight: true },
    { el: 5, elemBall: true }, { el: 1, friendly: true }, { el: 1, noParry: true }, { el: 0, noParry: true }, { el: 1, fbEnergy: true }, { el: 1, fdEnergy: true }, { el: 1, mine: true }, { el: 1, bomb: true }, { el: 1, poisonZone: true }, { el: 0, parryClass: 'magic' }, { el: 1, parryClass: 'physical' },
    { el: 0, redBean: true, parryClass: 'magic' }, { el: 1, blueBean: true }, { el: 1, fireMagic: true }, { el: 0, swordWave: true }, { el: 1, dimRift: true }];
  const states = ['idle', 'sBash', 'sBlock', 'peaceShield', 'whirlwind', 'sRecover', 'beam'];
  const cases = [];
  const axes = { proto: protos, dmg: [10, 137, 3000], vel: [[3, 4], [0, 0], [-5, 2], [-9, -1]], sz: [undefined, 1, 2.5], s: states, st2: [3, 15], ki: [0, 3], sb: [0, 5, 20], rel: [0, 300], iframes: [0, 10], io: [false, true], d: [5, 19, 21, 60, 99, 101, 130, 200, 400],
    tgt: [null, [500, 200], [100, -300]], wd: [false, true], cnt: [[10, 1, 1, 10, 1, 1, 0, 0], [40, 1.5, 2, 30, 2, 2.5, .5, 2]], det: [0, 1], chg: [1, 2.5], mt: [[1, 1], [10, 3]], bonus: [0, 12] };
  for (const c of grid(axes, 3000, 20261028)) {
    const [mr, ss, am, mg, si, mm, pb, sp] = c.cnt, [mal, thr] = c.mt;
    Object.assign(P, { s: c.s, st2: c.st2, _kiParryT: c.ki, _sbParryT: c.sb, _sbReleaseR: c.rel, _sBashChgMul: c.chg, skills: { detonate: c.det, maliceSwipe: mal, shieldThrow: thr }, iframes: c.iframes, _ioActive: c.io, parryBank: 0, x: 100, y: 100 });
    Object.assign(v, { meleeRef: mr, statStr: ss, pAtkMul: am, magicRef: mg, statInt: si, pMagicMul: mm, parryBonus: pb, legSP: sp, bonusRange: c.bonus, fused: c.wd, tgt: c.tgt ? { x: c.tgt[0], y: c.tgt[1] } : null });
    base.PASSIVES.pParry = pb > 0 ? 3 : 0;
    const p = { x: 130, y: 90, vx: c.vel[0], vy: c.vel[1], dmg: c.dmg, life: 100, ml: 100, col: '#ff0000', ...c.proto };
    if (c.sz !== undefined) p.sz = c.sz;
    calls.doParry.length = 0; calls.recycled = 0; calls.hurts = 0; calls.ice = 0;
    const pin = { ...p };
    const res = m.__reflect(p, c.d);
    const pout = {}; for (const k of keys) pout[k] = p[k] === undefined ? null : p[k];
    cases.push(J({ in: { p: pin, s: c.s, st2: c.st2, kiParryT: c.ki, sbParryT: c.sb, sbReleaseR: c.rel, sBashChgMul: c.chg, detonate: c.det, maliceSwipe: mal, shieldThrow: thr, bonusRange: c.bonus, pParry: base.PASSIVES.pParry, parryBonus: pb, iframes: c.iframes, io: c.io, pDist: c.d,
      tgt: c.tgt ? { x: c.tgt[0], y: c.tgt[1] } : null, whirlDet: c.wd, meleeRef: mr, statStr: ss, pAtkMul: am, magicRef: mg, statInt: si, pMagicMul: mm, legShieldParry: sp, pr: 10, px: 100, py: 100 },
      out: { kept: res.kept, pHit: res.pHit, fell: res.fell, recycled: calls.recycled, p: pout, doParry: calls.doParry.length ? calls.doParry[0] : null, doParryCount: calls.doParry.length, parryBank: P.parryBank, ice: calls.ice } }));
  }
  sections.reflect = cases;
  // 16. blue-bean flight (34978-34992: the homing block run as written) --------------------------------------------------------------------------------------------------
  {
    const st = { tgt: null }; const b2 = { shQuery: () => (st.tgt ? [st.tgt] : []), dst: (a, b, c, d) => Math.hypot(a - c, b - d), poolPart: noopFn, _prof: { u: 0 } };
    const hsrc = 'function __home(p,sp){\n' + span("if(p.blueBean&&p.friendly&&p.homing){", 'nx = p.x + p.vx * sp;') + '\n}';
    const mh = load(hsrc, b2, ['__home']);
    const turn = [];
    for (const [vx, vy] of [[5, 0], [0, 5], [-3, 4], [7, -7], [0, 0.0001]]) for (const [tx, ty] of [[500, 0], [0, 400], [-300, -50], [130, 90], [100, 300], [100, 480]]) for (const sp of [1, 0.5, 2]) {
      const p = { x: 100, y: 100, vx, vy, blueBean: true, friendly: true, homing: true }; st.tgt = { x: tx, y: ty, alive: true };
      const dist = Math.hypot(tx - 100, ty - 100);
      mh.__home(p, sp);
      turn.push(J({ in: { x: 100, y: 100, vx, vy, tx, ty, sp, inRange: dist < 400 }, out: { vx: p.vx, vy: p.vy } }));
    }
    sections.reflectHoming = turn;
  }
  // 17. reflected bean meets an enemy (35286-35320: contact test + blast with falloff + poison + knockback, the block run as written) ---------------------------------------
  {
    const rec = { hurt: [] };
    const b3 = { P: { skills: {} }, hurtE: (e, d, a, f, o, el) => rec.hurt.push({ i: e.__i, dmg: d, ang: a, f, kb: o && o.kbMult, magic: !!(o && o.magic), blue: !!(o && o.blueBean), parry: !!(o && o.parryBlueBean) }),
      dst: (a, b, c, d) => Math.hypot(a - c, b - d), pDotPool: () => b3.dot, _uqParryPierceRate: () => 0, _addBoom: noopFn, _rainbowImpact: noopFn, _addImpact: noopFn, playVFXAng: noopFn, ELC: {}, G: { shake: 0, slowMo: 0, hitStop: 0 }, OPT: { shake: 100, hitStop: 100 }, _HS: {}, dot: 0, ens: [],
      shQuery: () => b3.ens };
    b3.shQuery = () => b3.ens.slice();
    const bsrc = fn('function _isBigEnergy') + 'function __blast(p){let _pHit=false;const _bigBall=_isBigEnergy(p);\n' + span('if(!_pHit&&p.friendly&&!_bigBall){const _fHitR', 'if(!_pHit)projs[pw++]=p;else _recycleProj(p);') + '\nreturn {pHit:_pHit};}';
    const mb = load(bsrc, b3, ['__blast'], NOOP_COMMON);
    const cases = [];
    const mk = (x, y, r) => ({ __i: 0, alive: true, x, y, r, el: 0, kb: { x: 0, y: 0 }, poisonT: 0, poisonStk: 0, _poisonPool: 0, stunned: 0, _bluHitCD: 0, ib: false, mhp: 1000 });
    for (const c of grid({ proto: [{ dmg: 100 }, { dmg: 100, r: 9 }, { dmg: 0 }, { dmg: 80, _aoeR: 160, _aoeDmg: 200 }, { dmg: 80, _aoeR: 0, _aoeDmg: 0 }, { dmg: 100, redBean: true, _aoeR: 160, _aoeDmg: 200 }, { dmg: 100, _fromRainbow: true }],
      vel: [[3, 4], [0, 0], [-12, 5], [30, 0]], layout: [0, 1, 2, 3, 4, 5], dot: [0, 2.5], pre: [0, 1, 2], big: [false, true] }, 1800, 20261029)) {
      const p = { x: 100, y: 100, vx: c.vel[0], vy: c.vel[1], friendly: true, blueBean: true, parryBlueBean: true, magic: true, homing: true, life: 100, ml: 100, ...c.proto };
      if (c.big) { p.fbEnergy = true; }
      // enemy layouts: contact distances around e.r + hitR, a second enemy in the blast, one outside, one dead, one on cooldown
      const hr = Math.max(6, (p.r || 4) + Math.min(18, Math.sqrt(p.vx * p.vx + p.vy * p.vy) * 0.5));
      const L = [
        [mk(100 + hr + 20 - 1, 100, 20)],
        [mk(100 + hr + 20 + 1, 100, 20)],
        [mk(130, 100, 20), mk(190, 100, 20), mk(100, 260, 20), mk(400, 400, 20)],
        [mk(60, 100, 15), mk(100, 100 + hr + 10, 15)],
        [mk(100, 100, 30)],
        [mk(140, 100, 20), mk(150, 120, 20)],
      ][c.layout];
      if (c.pre === 1 && L.length > 1) L[0].alive = false; if (c.pre === 2) L[0]._bluHitCD = 3;
      L.forEach((e, k) => { e.__i = k; });
      b3.ens = L; b3.dot = c.dot; rec.hurt.length = 0; const cd0 = L.map(e => e._bluHitCD), al0 = L.map(e => e.alive);
      const pin = { ...p };
      const res = mb.__blast(p);
      const en = L.map(e => ({ kbx: e.kb.x, kby: e.kb.y, pt: e.poisonT, ps: e.poisonStk, pp: e._poisonPool, pz: e.poison === undefined ? null : e.poison, st: e.stunned, cd: e._bluHitCD }));
      cases.push(J({ in: { p: pin, dot: c.dot, e: L.map((e, k) => ({ x: e.x, y: e.y, r: e.r, alive: al0[k], cd: cd0[k] })) }, out: { pHit: res.pHit, hurts: rec.hurt, en } }));
    }
    sections.reflectBlast = cases;
  }
}
// ---- output -----------------------------------------------------------------------------------------------------------------
const result = { schema: 'exoduser.unity.parry-reflect-oracle.v1', source: { file: 'game.html', sha256: sha(text), lines: lines.length }, wrapper: { noops: [...noopUsed].sort() }, blocks, sections,
  counts: Object.fromEntries(Object.entries(sections).map(([k, v]) => [k, Array.isArray(v) ? v.length : 1])) };
fs.writeFileSync(OUT, JSON.stringify(result));
console.log(JSON.stringify({ out: OUT, bytes: fs.statSync(OUT).size, blocks: blocks.length, sections: result.counts, noops: result.wrapper.noops }));
