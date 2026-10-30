// PC-B03 oracle exporter: executes the ORIGINAL game.html functions (skill multipliers, ST/MP costs, activateSpikeTrap / activateGiantSlam + _gSlamHit /
// activateHolyDome / activateIceOrb + activateIceShatter, the dome regeneration line) in a Node VM and writes oracle.json, which Program.cs (.NET 8)
// compares with Runtime/Core/Skills/SkillRules.cs. No expected value is typed by hand. usage: node export.cjs [--source <game.html>] [--out oracle.json] [--check]
//  --check : re-extract and fail when any extracted block's sha256 differs from the committed oracle.json (source drift) instead of writing.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const SRC = path.resolve(arg('--source', 'G:/exoduser/game.html')), OUT = path.resolve(arg('--out', path.join(__dirname, 'oracle.json'))), CHECK = process.argv.includes('--check');
const text = fs.readFileSync(SRC, 'utf8'), lines = text.split('\n');
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const blocks = [];
function record(from, to, label) { const body = lines.slice(from - 1, to).join('\n'); blocks.push({ label, from, to, sha256: sha(body) }); return body + String.fromCharCode(10); }
function indexes(prefix) { const r = []; lines.forEach((l, i) => { if (l.trimStart().startsWith(prefix)) r.push(i + 1); }); return r; }
function at(prefix, occ = 0) { const r = indexes(prefix); if (r.length <= occ) throw new Error('source drift: no line starts with "' + prefix + '" (occurrence ' + occ + ')'); return r[occ]; }
function line(prefix, occ = 0) { const n = at(prefix, occ); return record(n, n, prefix.slice(0, 48)); }
function span(startPrefix, endPrefix, { occ = 0, inclusive = false } = {}) {
  const a = at(startPrefix, occ); let b = a + 1;
  while (b <= lines.length && !lines[b - 1].trimStart().startsWith(endPrefix)) { b++; if (b > a + 600) throw new Error('span too long for ' + startPrefix); }
  return record(a, inclusive ? b : b - 1, startPrefix.slice(0, 40) + '..');
}
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
const noopUsed = new Set();
function scope(base, noops) {
  return new Proxy(base, {
    has(t, k) { if (typeof k !== 'string') return false; if (k in t) return true; if (noops.includes(k)) return true; return false; },
    get(t, k) { if (k in t) return t[k]; if (typeof k === 'string' && noops.includes(k)) { noopUsed.add(k); return () => undefined; } return undefined; },
    set(t, k, v) { t[k] = v; return true; },
  });
}
const SFXP = new Proxy({}, { get: () => () => undefined });
function load(src, base, expose, noops = []) { if (!('SFX' in base)) base.SFX = SFXP; const s = scope(base, noops); return new Function('__s', 'with(__s){' + src + '\nreturn {' + expose.join(',') + '};}')(s); }
const J = o => JSON.parse(JSON.stringify(o, (k, v) => (v === undefined ? null : v)));
function grid(axes, n, seed = 20261027) {
  const keys = Object.keys(axes), out = [], seen = new Set(), push = c => { const k = JSON.stringify(c); if (!seen.has(k)) { seen.add(k); out.push(c); } };
  const base = {}; keys.forEach(k => { base[k] = axes[k][0]; });
  push({ ...base }); for (const k of keys) for (const v of axes[k]) push({ ...base, [k]: v });
  let x = seed >>> 0 || 1; const rnd = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
  let guard = 0; while (out.length < n && guard++ < n * 30) { const c = {}; for (const k of keys) c[k] = axes[k][Math.floor(rnd() * axes[k].length)]; push(c); }
  return out;
}
const NOOP = ['playSample', 'playSampleAt', '_r', 'addTxt', 'addParts', 'poolPart', 'shake', 'showPH', '_T', 'updateQS', '_addSkProf', 'dbSaveNow', 'playVFXAng'];
const sections = {};
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

// ---- 1. _SK_MUL / _skMul ----
{
  const src = [span('const _SK_MUL={', '};', { inclusive: true }), fn('function _skMul(')].join('\n');
  const P = { skills: {} };
  const ns = load(src, { P }, ['_SK_MUL', '_skMul']);
  const cases = [];
  for (const id of Object.keys(ns._SK_MUL)) for (const lv of range(1, 20)) { P.skills[id] = lv; cases.push({ id, lv, out: ns._skMul(id) }); }
  P.skills = {}; cases.push({ id: 'giantSlam', lv: 0, out: ns._skMul('giantSlam') });
  P.skills.nope = 5; cases.push({ id: 'nope', lv: 5, out: ns._skMul('nope') });
  sections.skMul = J({ cases });
}

// ---- 2. stCost / mpCost ----
{
  const src = [span('const _COST_BASE={', '};', { inclusive: true }), span('const _COST_SK={', '};', { inclusive: true }), span('const _COST_DPS={', '};', { inclusive: true }),
    line('function _skLv('), line('function _dpsCostMul('), line('function _stDisc('), fn('function stCost('), fn('function mpCost('),
    line('function pAtkCost('), line('function pMeleeStCost('), line('function pMagicCost(')].join('\n');
  const ctx = { pAtk: 0, pMelee: 0, pMagic: 0, stRed: 0, mpRed: 0, hm: 0 };
  const P = { skills: {}, mst: 100 }, PASSIVES = { get pAtk() { return ctx.pAtk; }, get pMelee() { return ctx.pMelee; }, get pMagic() { return ctx.pMagic; }, pBow: 0 };
  const base = { P, PASSIVES, _gxFiring: 0, _eqAffix: id => id === 'stCostRed' ? ctx.stRed : id === 'mpCostRed' ? ctx.mpRed : 0, _uEq: id => id === '_uHelmMagic' ? ctx.hm : 0, window: {}, showPH() { }, _T: s => s };
  const ns = load(src, base, ['stCost', 'mpCost']);
  const st = [], mp = [];
  for (const c of grid({ lv: range(1, 20), mst: [100, 135, 200, 333.7, 500, 1000], pAtk: [0, 3, 10], pMelee: [0, 5, 10], stRed: [0, -0.2, -0.5, 0.1] }, 700)) {
    Object.assign(ctx, c); P.skills.giantSlam = c.lv; P.mst = c.mst; st.push({ ...c, out: ns.stCost('giantSlam') });
  }
  ctx.stRed = 0; ctx.pAtk = 0; ctx.pMelee = 0;
  for (const c of grid({ lv: range(1, 20), pMagic: [0, 3, 10, 15], mpRed: [0, 0.1, 0.5], hm: [0, 0.05] }, 300)) {
    Object.assign(ctx, c); P.skills.iceOrb = c.lv; mp.push({ ...c, out: ns.mpCost('iceOrb') });
  }
  sections.cost = J({ st, mp });
}

// ---- 3. activateSpikeTrap + _spikeTrapSlowPct ----
{
  const src = [line('function _spikeTrapSlowPct('), line('function _spikeTrapDmg('), fn('function activateSpikeTrap('), span('const _SK_MUL={', '};', { inclusive: true }), fn('function _skMul('), fn('function _malCost('), line('const _MALICE_COST_MUL='), line('const EL=')].join('\n');
  const ctx = { magicRef: 10, mul: 1.4, cdRed: 0, mats: 100 };
  const P = { x: 120.5, y: -40.25, skills: {}, _gcCd: 0 }, G = { mats: 0 };
  const base = { P, G, _isFused: () => false, _cdRed: () => ctx.cdRed, magicRef: () => ctx.magicRef, statInt: () => 1, pMagicMul: () => ctx.mul };
  const ns = load(src, base, ['activateSpikeTrap', '_spikeTrapSlowPct'], NOOP);
  const cases = [];
  for (const c of grid({ lv: range(1, 20), magicRef: [10, 100.5, 1234.7, 5000.25], mul: [1.4, 2.8, 3.19, 0.7], cdRed: [0, -0.3, -0.5, 0.2], mats: [4, 5, 100] }, 400)) {
    Object.assign(ctx, c); P.skills.spikeTrap = c.lv; P._gcCd = 0; G.mats = c.mats; delete G._fireZones;
    ns.activateSpikeTrap();
    cases.push({ ...c, out: { mats: G.mats, cd: P._gcCd, zone: G._fireZones ? G._fireZones[0] : null } });
  }
  P.skills.spikeTrap = 1; G.mats = 4; P._gcCd = 0; delete G._fireZones; ns.activateSpikeTrap(); cases.push({ lv: 1, magicRef: ctx.magicRef, mul: ctx.mul, cdRed: ctx.cdRed, mats: 4, out: { mats: G.mats, cd: P._gcCd, zone: G._fireZones ? G._fireZones[0] : null } });
  const slow = range(1, 25).map(lv => ({ lv, out: ns._spikeTrapSlowPct(lv) }));
  sections.spikeTrap = J({ cases, slow });
}

// ---- 4. activateGiantSlam (call arguments of _gSlamHit, cooldown, costs) with rage 0 ----
{
  const src = [fn('function activateGiantSlam('), span('const _SK_MUL={', '};', { inclusive: true }), fn('function _skMul('), fn('function _malCost('), line('const _MALICE_COST_MUL='), line('const EL=')].join('\n');
  const ctx = { meleeRef: 40, cdRed: 0, mats: 100, rage: 0, pRage: 0, rageDmg: 0 };
  const P = { x: 10, y: 20, facing: 0.7, rage: 0, skills: {}, st: 100, mst: 100, s: 'idle', st2: 0, iframes: 0 }, G = { mats: 0, hitStop: 0, slowMo: 0, shake: 0, _fireZones: [] };
  const hit = [], stc = [];
  const base = { P, G, window: {}, OPT: { shake: 100, parts: 100 }, _gSlamHit: (...a) => { hit.push(a); }, useStPct: k => { stc.push(k); }, _isFused: () => false, _cdRed: () => ctx.cdRed, _eqAffix: id => id === 'rageDmg' ? ctx.rageDmg : 0,
    PASSIVES: { get pRage() { return ctx.pRage; } }, meleeRef: () => ctx.meleeRef, statStr: () => 1, wp: () => ({ el: 0 }), _uEq: () => 0, _rageMax: () => 100, Math, _detonateAssaultFlames() { }, poolPart() { }, _addLavaErupt() { }, playSample() { }, _r() { return 1; }, shake() { } };
  const ns = load(src, base, ['activateGiantSlam'], NOOP);
  const cases = [];
  for (const c of grid({ lv: range(1, 20), meleeRef: [20, 40, 123.4, 999.9], cdRed: [0, -0.3, -0.5, 0.2], mats: [9, 10, 100], rage: [0, 0, 25, 60, 100], pRage: [0, 3, 10], rageDmg: [0, 0.3] }, 260)) {
    Object.assign(ctx, c); P.rage = c.rage; P.skills.giantSlam = c.lv; P._gslCd = 0; G.mats = c.mats; hit.length = 0; stc.length = 0; G._gSlamWave = [];
    ns.activateGiantSlam();
    cases.push({ ...c, out: { mats: G.mats, cd: P._gslCd, state: P.s, st2: P.st2, hit: hit[0] || null, waves: G._gSlamWave.map(w => ({ r: w.r, maxR: w.maxR, maxT: w.maxT })), st: stc.length } });
  }
  sections.giantSlam = J({ cases });
}

// ---- 5. _gSlamHit enemy effects ----
{
  const src = [fn('function _gSlamHit('), line('const _MINI_STUN='), line('function elMul('), line('const EL=')].join('\n');
  const ctx = { pAtkMul: 0.7, lv: 1 };
  const P = { x: 0, y: 0, _atkBon: 0, _gslLv: 1, skills: { giantSlam: 1 } };
  const calls = { hurt: [], poise: [] }; let list = [];
  const base = { P, ELC: [], ELP: [], OPT: { parts: 100 }, pAtkMul: () => ctx.pAtkMul, shQuery: () => list, _shBufI: 0, dst: (a, b, c, d) => Math.sqrt((c - a) ** 2 + (d - b) ** 2), hurtE: (e, d, a, ...r) => { calls.hurt.push({ d, a }); e.hp -= d; if (e.hp <= 0) e.alive = false; },
    _poiseHit: (e, amt) => { calls.poise.push(amt); return false; }, _hurtFieldMobs() { }, shake() { }, addTxt() { }, poolPart() { }, _T: s => s };
  const ns = load(src, base, ['_gSlamHit'], NOOP);
  const cases = [];
  for (const c of grid({ lv: range(1, 20), pAtkMul: [0.7, 1.19, 2.3], dmg: [10, 777, 123456], dist: [0, 100, 399, 499, 520, 700], boss: [false, true], poise: [0, 3], mhp: [100, 100000], maxPoise: [8, 100] }, 260)) {
    ctx.pAtkMul = c.pAtkMul; P._gslLv = c.lv; P.skills.giantSlam = c.lv; P._atkBon = 0; calls.hurt.length = 0; calls.poise.length = 0;
    const e = { alive: true, x: c.dist, y: 0, r: 15, el: 0, hp: c.mhp, mhp: c.mhp, ib: c.boss, poise: c.poise, maxPoise: c.maxPoise, stunned: 0, kb: { x: 0, y: 0 } };
    list = [e];
    ns._gSlamHit(0, 500 + (c.lv - 1) * 15, Math.PI, c.dmg, 0, 0, 1.0);
    cases.push({ ...c, out: { hurt: calls.hurt[0] || null, poise: calls.poise[0] ?? null, stunned: e.stunned, ePoise: e.poise, alive: e.alive, kbx: e.kb.x } });
  }
  sections.slamHit = J({ cases });
}

// ---- 6. holy dome ----
{
  const src = [fn('function activateHolyDome('), line('function _fuseMul(')].join('\n');
  const P = { x: 5, y: 6, skills: {}, _hdCd: 0 }, G = { _fireZones: [] };
  const ns = load(src, { P, G, _isFused: () => false }, ['activateHolyDome'], NOOP);
  const cases = [];
  for (const lv of range(1, 20)) { P.skills.holyDome = lv; P.skills.holyPrison = 0; P._hdCd = 0; G._fireZones = []; ns.activateHolyDome(); cases.push({ lv, out: { cd: P._hdCd, zones: G._fireZones.map(z => ({ type: z.type, r: z.r, maxT: z.maxT, lv: z.lv })) } }); }
  // per-frame regeneration line (inside update)
  const ln = line('if(_inHolyDome&&P.hp>0){');
  const regen = [];
  for (const lv of range(1, 20)) for (const fm of [1, 1.2, 1.5]) {
    const Pp = { hp: 10, mhp: 1e9, mp: 10, mmp: 1e9, st: 10, mst: 1e9 };
    load('const sp=1;let _inHolyDome=true,_hdLv=' + lv + ';\n' + ln, { P: Pp, _fuseMul: () => fm, Math }, []);
    regen.push({ lv, fm, out: Pp.hp - 10 });
  }
  sections.holyDome = J({ cases, regen });
}

// ---- 7. ice orb ----
{
  const src = [fn('function activateIceOrb('), fn('function activateIceShatter('), span('const _SK_MUL={', '};', { inclusive: true }), fn('function _skMul('), line('const EL='),
    span('const _COST_BASE={', '};', { inclusive: true }), span('const _COST_SK={', '};', { inclusive: true }), span('const _COST_DPS={', '};', { inclusive: true }), line('function _skLv('), line('function _dpsCostMul('), fn('function mpCost('), fn('function useMp(')].join('\n');
  const ctx = { magicRef: 20, mul: 1.4, mp: 500 };
  const P = { x: 100, y: 200, r: 15, skills: {}, mp: 500, s: 'idle', _ioCd: 0 }, G = { _fireZones: [] };
  const pProjs = [], ens = [], rec = {};
  const base = { P, G, pProjs, ens, _lastCost: 0, magicRef: () => ctx.magicRef, statInt: () => 1, pMagicMul: () => ctx.mul, pMagicCost: () => 1, _getPProj: () => ({ _hitSet: new Set() }), _uqS: { iceCastId: 0, iceUsed: 0, iceHit: null }, _VFX_SHEETS: {}, _vfxAnims: [], _gameTime: 0,
    dst: (a, b, c, d) => Math.sqrt((c - a) ** 2 + (d - b) ** 2), hurtE: (e, d, a) => { rec.hurt.push(d); }, Math };
  const ns = load(src, base, ['activateIceOrb', 'activateIceShatter'], NOOP);
  const cases = [];
  for (const c of grid({ lv: range(1, 20), magicRef: [10, 100.5, 1234.7], mul: [1.4, 2.8, 0.7], mp: [50, 500] }, 120)) {
    Object.assign(ctx, c); P.skills.iceOrb = c.lv; P.mp = c.mp; P._ioCd = 0; pProjs.length = 0; ens.length = 0; rec.hurt = [];
    ens.push({ alive: true, x: 100 + 10, y: 200, r: 15 });
    ns.activateIceOrb(); const bon = P._ioBon, mpAfter = P.mp;
    Math.random = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
    ns.activateIceShatter();
    cases.push({ ...c, out: { bon, mpAfter, cd: P._ioCd, blades: pProjs.length, bladeDmg: pProjs[0] ? pProjs[0].dmg : null, r0: pProjs[0] ? Math.hypot(pProjs[0].x - 100, pProjs[0].y - 200) : null, hurt: rec.hurt[0] ?? null } });
  }
  sections.iceOrb = J({ cases });
}

// ---- 8. skill level lock / up cost ----
{
  const upCost = fn('function _skillUpSpCost(');
  const lock = line('const _skLvLock=Math.min(20,~~(P.lv/50)+1);', 0);
  const cost = []; const ns = load(upCost + '\nconst _SKILL_UP_COST_PROBE=(c)=>_skillUpSpCost(c);', { Math }, ['_SKILL_UP_COST_PROBE']);
  for (const lv of range(1, 20)) cost.push({ lv, out: ns._SKILL_UP_COST_PROBE(lv) });
  const locks = [];
  for (const lv of [1, 49, 50, 99, 100, 149, 150, 500, 949, 950, 951, 1000, 1461]) {
    const out = load('const P={lv:' + lv + '};\n' + lock, { Math }, ['_skLvLock'])._skLvLock; locks.push({ lv, out });
  }
  sections.level = J({ cost, locks });
}

// 악의구는 시전 시작각과 실제 폴백 발사 본문을 그대로 실행한다. 예상 수치를 손으로 적지 않는다.
{
  const spawn = span('// ── 악의구 (기본 폴백) ──', "_addSkProf('fireball')");
  const src = [span('const _SK_MUL={', '};', { inclusive: true }), fn('function _skMul('), fn('function _execMagicE('),
    'function probe(){' + spawn + '\nreturn pProjs[0];}'].join('\n');
  const ctx = {}, P = { x: 100, y: 200, skills: {}, activeMagicSk: 'fireball' }, pProjs = [];
  const base = { P, pProjs, Math, EL: { D: 3 }, _MAGIC_E_HANDLERS: {}, _gpActive: false,
    useMp: () => ctx.bonus / 2, pMagicSpd: () => ctx.castSpeed, magicRef: () => ctx.magicRef, statInt: () => ctx.statInt,
    pMagicMul: () => ctx.mul, _fuseMul: () => 1, hm: () => ({ bonusRange: ctx.bonusRange }), _getPProj: () => ({}) };
  const ns = load(src, base, ['_execMagicE', 'probe']);
  const cases = [];
  for (const c of grid({ lv: range(1, 20), magicRef: [10, 100.5, 1234.7], statInt: [1, 1.2], mul: [1, 1.4, 2.8], bonus: [0, 20, 50], bonusRange: [0, 2, 5], castSpeed: [2, 2.8, 4], angle: [0, Math.PI / 4, Math.PI, -Math.PI / 2] }, 400)) {
    Object.assign(ctx, c); P.skills.fireball = c.lv; P.facing = c.angle; pProjs.length = 0;
    ns._execMagicE(); const castTicks = P.st2; P.facing += Math.PI / 2;
    cases.push({ ...c, castTicks, out: ns.probe() });
  }
  sections.fireball = J({ cases });
}

const outObj = { generated: 'node export.cjs', source: path.basename(SRC), sourceSha256: sha(text), noopUsed: [...noopUsed].sort(), blocks, sections };
if (CHECK) {
  const old = JSON.parse(fs.readFileSync(OUT, 'utf8')); const drift = [];
  for (const b of outObj.blocks) { const o = old.blocks.find(x => x.label === b.label && x.from === b.from); if (!o || o.sha256 !== b.sha256) drift.push(b.label + ' @' + b.from); }
  if (drift.length) { console.error('source drift: ' + drift.length + ' block(s)\n' + drift.join('\n')); process.exit(2); }
  console.log('oracle blocks unchanged (' + outObj.blocks.length + ')'); process.exit(0);
}
fs.writeFileSync(OUT, JSON.stringify(outObj));
console.log('wrote ' + OUT + ' blocks=' + blocks.length + ' sections=' + Object.keys(sections).join(',') + ' sizeKB=' + (fs.statSync(OUT).size / 1024).toFixed(0));
