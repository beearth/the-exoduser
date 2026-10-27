// PC-B09 oracle exporter: executes the ORIGINAL hurtP (+ its helpers) from game.html in a Node VM against a grid of player / hit states and writes oracle.json,
// which Program.cs (.NET 8) compares with Simulation.HurtPlayer (Runtime/Core/Simulation.PlayerHurt.cs). No expected value is typed by hand.
// usage: node export.cjs [--source <game.html>] [--out oracle.json] [--check]
//  --check : re-extract and fail when an extracted block's sha256 differs from the committed oracle.json (source drift) instead of writing.
// Use a committed copy of game.html (git show HEAD:game.html), not the shared working tree.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const SRC = path.resolve(arg('--source', 'G:/exoduser/game.html')), OUT = path.resolve(arg('--out', path.join(__dirname, 'oracle.json'))), CHECK = process.argv.includes('--check');
const text = fs.readFileSync(SRC, 'utf8'), lines = text.split('\n');
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const blocks = [];
function record(from, to, label) { const body = lines.slice(from - 1, to).join('\n'); blocks.push({ label, from, to, sha256: sha(body) }); return body + String.fromCharCode(10); }
function at(prefix, occ = 0) { let n = 0; for (let i = 0; i < lines.length; i++) if (lines[i].trimStart().startsWith(prefix)) { if (n++ === occ) return i + 1; } throw new Error('source drift: no line starts with "' + prefix + '"'); }
function line(prefix, occ = 0) { const n = at(prefix, occ); return record(n, n, prefix.slice(0, 48)); }
function fn(prefix, occ = 0) {
  const a = at(prefix, occ); let depth = 0, started = false, str = null, esc = false, blockC = false;
  for (let i = a - 1; i < lines.length; i++) {
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
const J = o => JSON.parse(JSON.stringify(o, (k, v) => (v === undefined ? null : v)));

// ---- the VM: only declared names resolve; everything the function touches outside this list throws ReferenceError ----
const src = [
  line('const DR_CAP='), line('let _hitFlash={'), fn('function doHitFlash'), fn('function shake('), fn('function _r('),
  fn('function _isFocusState'), fn('function _isKiCharging'), fn('function _lvB'), fn('function pGuardAbsorb'), fn('function pShieldBlock'),
  line('let scrFlash=null,scrFlashA=0;'), fn('function hurtP('),
].join('\n');

// Particle arguments (poolPart(..., 3+Math.random()*3, ...)) are evaluated before the no-op stub runs; in the web they interleave with the gameplay stream, in Unity particles are a
// view concern and never touch the simulation stream. The oracle therefore redirects Math.random() inside poolPart(...) lines to a separate cosmetic stream.
const COSMETIC = /poolPart\(/;
function cosmetic(code) { return code.split('\n').map(l => (COSMETIC.test(l) ? l.replace(/Math\.random\(\)/g, '__cos()') : l)).join('\n'); }
const srcCos = cosmetic(src);
blocks.push({ label: 'transform: poolPart(...) lines use a cosmetic random stream', from: 0, to: 0, sha256: sha(srcCos) });
function makeEnv(c, rnd) {
  const out = { texts: [], samples: [], parryCalls: 0, died: false, rng: 0 };
  const M = Object.create(Math); M.random = () => { out.rng++; return rnd(); };
  const P = {
    s: c.state, st2: c.st2 || 0, hp: c.hp, mhp: c.mhp, shield: c.shield, mshield: c.mshield, shieldRegenT: c.shieldRegenT, poise: c.poise, poiseR: 9,
    iframes: c.iframes || 0, kb: { x: 0, y: 0 }, x: 100, y: 200, lv: c.level, skills: {}, baseDef: c.baseDef, facing: 0,
    _sbParryT: c.sbParryT || 0, _kiChargeActive: !!c.kiCharge, rage: 0, parryBank: 0,
  };
  const G = { shake: 0, hitStop: 0, _flashT: 0, _chromaT: 0 };
  const aff = { dodgeChance: c.dodge || 0, ccRes: c.ccRes || 0, stunRes: c.stunRes || 0, eDefFlat: c.edef || 0, shieldBlockDR: c.shieldBlockDR || 0 };
  const zero = () => 0, noop = () => undefined, empty = () => ({});
  const env = {
    Math: M, P, G, OPT: { shake: 100, hitStop: 100, parts: 100 }, _HS: { pStun: 6 }, PASSIVES: { pGuard: c.pGuard || 0 }, STATS: { dex: c.dex || 0 }, INV: { equipped: {} },
    window: {}, __cos: () => 0.5, SFX: new Proxy({}, { get: () => noop }),
    _eqAffix: k => aff[k] || 0, _eqStat: k => (k === 'Dex' ? 0 : 0), _lEq: zero, _uEq: zero, _uqS: {}, _gritTotal: zero, enhMul: zero, pDefAdd: zero,
    sh: empty, ar: empty, cp: empty, bt: empty, gl: empty, pt: empty, hm: empty, nc: empty, rg1: empty, rg2: empty, blt: empty, wp: empty,
    _petOnHit: noop, _logDmg: noop, _playProjectileHitSfx: noop, _addPhysicalBite: noop, _detonateBlast: noop, _isFused: () => false, _rageMax: () => 100,
    _harpActive: false, _dashActive: false, _gpVibrate: noop, shQuery: () => [], hurtE: noop, meleeRef: zero, statStr: zero, poolPart: noop, addParts: noop,
    _L: (a, b) => a, _T: s => s, die: () => { out.died = true; },
    doParry: () => { out.parryCalls++; },
    addTxt: (x, y, t, col, life) => { out.texts.push({ x, y, t, col, life }); },
    playSample: (key, vol, rate) => { const q = (rate || 1) * (0.92 + M.random() * 0.16); out.samples.push({ key, vol, rate: rate || 1, queued: q }); },
    _now: 0, _unused: 0,
  };
  return { env, out, P, G };
}

function run(c, rndSeq) {
  let ri = 0; const rnd = () => { const v = rndSeq[ri % rndSeq.length]; ri++; return v; };
  const { env, out, P, G } = makeEnv(c, rnd);
  const scope = new Proxy(env, { has(t, k) { return typeof k === 'string' && k in t; }, get(t, k) { return t[k]; }, set(t, k, v) { t[k] = v; return true; } });
  const f = new Function('__s', 'with(__s){' + srcCos + '\nreturn {hurtP, getFlash(){return {col:scrFlash,a:scrFlashA}}, hf(){return _hitFlash}, setFlash(){}};}')(scope);
  const opts = c.opts ? J(c.opts) : undefined;
  const e = { ...c }; void e;
  f.hurtP(c.dmg, opts);
  const fl = f.getFlash(), hf = f.hf();
  return J({
    died: out.died, parryCalls: out.parryCalls, rng: out.rng,
    p: { hp: P.hp, shield: P.shield, shieldRegenT: P.shieldRegenT, poise: P.poise, s: P.s, st2: P.st2, iframes: P.iframes, kbx: P.kb.x, kby: P.kb.y, sbParryT: P._sbParryT },
    shake: G.shake, hitStop: G.hitStop, flashT: G._flashT, chromaT: G._chromaT, scrFlashA: fl.a, hitFlashA: hf.a, hitFlashCol: hf.col, texts: out.texts, samples: out.samples,
  });
}

// ---- grid: every single-axis value around the first-value base + seeded random combinations ----
function grid(axes, n, seed) {
  const keys = Object.keys(axes), res = [], seen = new Set(), push = c => { const k = JSON.stringify(c); if (!seen.has(k)) { seen.add(k); res.push(c); } };
  const base = {}; keys.forEach(k => { base[k] = axes[k][0]; });
  push({ ...base }); for (const k of keys) for (const v of axes[k]) push({ ...base, [k]: v });
  let x = seed >>> 0 || 1; const rr = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
  let g = 0; while (res.length < n && g++ < n * 30) { const c = {}; for (const k of keys) c[k] = axes[k][Math.floor(rr() * axes[k].length)]; push(c); }
  return { cases: res, rr };
}
const axes = {
  state: ['idle', 'idle', 'wSwing', 'wWindup', 'kiGather', 'sDraw', 'stagger', 'pStun', 'sBlock', 'sBlock', 'peaceShield', 'fallen', 'dead'],
  sbParryT: [0, 6],
  hpmhp: [[300, 300], [300, 100], [1000, 1000], [50, 300], [3, 300], [12000, 12000]],
  shpair: [[0, 0], [0, 100], [40, 100], [100, 100], [10, 100], [5000, 5000]],
  shieldRegenT: [0, 50],
  poise: [4, 3, 2, 1],
  dmg: [1, 7, 24, 80, 150, 400, 2000],
  baseDef: [2, 400, 5000, 100000],
  edef: [0, 300],
  opts: [null, { dot: true }, { dtype: 'magic' }, { ang: 1.2 }, { src: { x: 50, y: 60 } }, { dtype: 'parry', ang: -2 }],
  level: [1, 100, 500],
  dex: [0, 0, 1000],
  dodge: [0, 0, 0, 0.2],
  ccRes: [0, 0.3],
  stunRes: [0, 0.4],
  pGuard: [0, 5, 20],
  shieldBlockDR: [0, 0.1],
  iframes: [0, 0, 0, 0, 0, 0, 0, 10],
  rngMode: ['seeded', 'low', 'high'],
};
const g = grid(axes, 3000, 20261027);
const cases = g.cases.map(c => {
  const full = { ...c, hp: c.hpmhp[0], mhp: c.hpmhp[1], shield: c.shpair[0], mshield: c.shpair[1], kiCharge: c.state === 'wWindup' };
  delete full.hpmhp; delete full.shpair;
  const rngSeq = full.rngMode === 'low' ? [0.0001, 0.37, 0.61, 0.83, 0.29, 0.12, 0.74, 0.5, 0.9, 0.05] : full.rngMode === 'high' ? [0.9999, 0.37, 0.61, 0.83, 0.29, 0.12, 0.74, 0.5, 0.9, 0.05] : Array.from({ length: 10 }, () => g.rr());
  return J({ in: full, rng: rngSeq, out: run(full, rngSeq) });
});

const result = { schema: 'exoduser.unity.player-hurt-oracle.v1', source: { file: path.basename(SRC), sha256: sha(text), lines: lines.length }, blocks, sections: { hurt: cases }, counts: { hurt: cases.length } };
if (CHECK) {
  const old = JSON.parse(fs.readFileSync(OUT, 'utf8')); const drift = [];
  for (const b of blocks) { if (!old.blocks.find(x => x.label === b.label && x.sha256 === b.sha256)) drift.push(b.label + ' @' + b.from + '-' + b.to); }
  if (drift.length) { console.error('SOURCE DRIFT:\n ' + drift.join('\n ')); process.exit(1); }
  console.log('source blocks identical to oracle.json (' + blocks.length + ' blocks)'); process.exit(0);
}
fs.writeFileSync(OUT, JSON.stringify(result));
console.log(JSON.stringify({ out: OUT, bytes: fs.statSync(OUT).size, blocks: blocks.length, cases: cases.length }));
