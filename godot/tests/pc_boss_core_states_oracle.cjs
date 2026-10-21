// PC-BOSS-CORE (2026-10-22) — 미이식 switch 상태(40749–40758/40798–40814/40869–40903/41327–41335)와
// 보스 전역 큐(37015–37053/37067/37069/37071/37079/37129)·보스 지뢰(34671·34678–34687) 원본 VM oracle.
const SNAPSHOT = require('../source_snapshot/snapshot.cjs');
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const arg = k => (process.argv.find(a => a.startsWith(k + '=')) || '').slice(k.length + 1);
const casesFile = arg('--cases-file'), outFile = arg('--out-file');
assert(casesFile && outFile);
const lines = SNAPSHOT.readBytes().toString().split('\n');
const L = n => lines[n - 1];
assert(L(40749).trim() === "case'bossShockWind':" && L(40758).includes("e.s='recover';e.st2=55}break}"));
assert(L(40798).trim() === "case'bossSummonWind':{" && L(40814).trim() === '}break}');
assert(L(40869).trim() === "case'bossSpinWind':{" && L(40891).trim() === "case'bossMineWind':{" && L(40903).trim() === '}break}');
assert(L(41327).trim() === "case'bossPoisonDash':{" && L(41335).includes("if(e.st2<=0){e.s='recover';e.st2=25}break}"));
assert(L(37015).trim() === 'if(G._chaseAoes&&G._chaseAoes.length>0){' && L(37053).trim() === '}');
for (const n of [37067, 37069, 37071, 37079, 37129]) assert(L(n).trim().startsWith('if(G._'));
assert(L(34671).trim().startsWith('p.life-=sp*0.667;let _dead=false;') && L(34678).trim() === 'if(p.mine){' && L(34688).trim() === '}');
assert(L(14344).startsWith('function elMul(a,d)') && L(31723).startsWith('function dst(') && L(16996).startsWith('function _hurtProjectilePlayer('));
const pad = n => '\n'.repeat(n - 1);
const take = (a, b) => { let s = ''; for (let n = a; n <= b; n++) s += L(n) + '\n'; return s; };
const FILE = 'exoduser-game.html';
const helpers = pad(14344) + L(14344) + '\n' + '\n'.repeat(16996 - 14344 - 1) + L(16996) + '\n' + '\n'.repeat(31723 - 16996 - 1) + L(31723) + '\n';
let sw = pad(40748) + 'function __sw(e,sp){switch(e.s){\n' + take(40749, 40758) + '\n'.repeat(40798 - 40758 - 1) + take(40798, 40814)
  + '\n'.repeat(40869 - 40814 - 1) + take(40869, 40903) + '\n'.repeat(41327 - 40903 - 1) + take(41327, 41335) + '}}\n';
let qu = pad(37014) + 'function __q(sp){\n' + take(37015, 37053) + '\n'.repeat(37067 - 37053 - 1) + L(37067) + '\n\n' + L(37069) + '\n\n' + L(37071) + '\n'
  + '\n'.repeat(37079 - 37071 - 1) + L(37079) + '\n}\n';
let lava = pad(37128) + 'function __lava(sp){\n' + L(37129) + '\n}\n';
let mine = pad(34670) + 'function __mine(mines,sp){const kept=[];for(const p of mines){\n' + L(34671) + '\n' + '\n'.repeat(34678 - 34671 - 1) + take(34678, 34688) + 'kept.push(p)}return kept}\n';
const dec = v => { if (v && typeof v === 'object' && !Array.isArray(v)) { if ('__f64' in v) return Buffer.from(v.__f64, 'hex').readDoubleLE(0); const o = {}; for (const k in v) o[k] = dec(v[k]); return o; } if (Array.isArray(v)) return v.map(dec); return v; };
const bits = v => { const b = Buffer.alloc(8); b.writeDoubleLE(v); return b.toString('hex'); };
const enc = v => { if (typeof v === 'number') return { __f64: bits(v) }; if (Array.isArray(v)) return v.map(enc); if (v && typeof v === 'object') { const o = {}; for (const k of Object.keys(v)) { if (v[k] === undefined) continue; o[k] = enc(v[k]); } return o; } return v; };
const results = [];
for (const c0 of JSON.parse(fs.readFileSync(casesFile, 'utf8')).cases) {
  const c = dec(c0);
  const trace = [];
  const q = { rng: [...(c.env.rng || [])], canMv: [...(c.env.canMv || [])], pwin: [...(c.env.pwin || [])] };
  const ctx = { Math: Object.create(Math), console };
  ctx.Math.random = () => { const u = q.rng.length ? q.rng.shift() : 0.5; trace.push(['rng', u]); return u; };
  ctx.P = c.p;
  const gt = Object.assign({ stage: 0 }, c.g || {});
  ctx.G = new Proxy(gt, { set(t, k, v) { trace.push(['g', k, v]); t[k] = v; return true; } });
  if (c.mode === 'misc') { const arr = gt._poisonPools || []; gt._poisonPools = new Proxy(arr, { get(t, k) { if (k === 'push') return (...it) => { for (const x of it) trace.push(['append', '_poisonPools', JSON.parse(JSON.stringify(x))]); return t.push(...it); }; return t[k]; } }); }
  ctx.OPT = { shake: 100 };
  ctx.EL = { P: 0, F: 1, I: 2, D: 3, L: 4, H: 5, E: 6 };
  ctx.ELC = ['#bbbbbb', '#ff5522', '#3388ff', '#9933cc', '#ffee00', '#ff88cc', '#88aa44'];
  ctx.ar = () => ({ el: c.env.armorEl || 0 });
  ctx._T = s => s; ctx._L = ko => ko;
  ctx.SFX = new Proxy({}, { get: (_, k) => (...a) => trace.push(['present', 'SFX.' + k, a]) });
  for (const n of ['addParts', 'poolPart', 'playVFXAng']) ctx[n] = (...a) => trace.push(['present', n, a]);
  ctx.shake = n => trace.push(['shake', n]);
  ctx.addTxt = (x, y, t, col, life) => trace.push(['text', x, y, t, col, life]);
  ctx.hurtP = (d, o) => trace.push(['hurtP', d, { dtype: (o && o.dtype) || '', druidPoison: !!(o && o.druidPoison) }]);
  ctx.isPWin = () => q.pwin.length ? q.pwin.shift() : false;
  ctx.doParry = () => trace.push(['parry', ctx.P.parryBank || 0]);
  ctx._poiseHit = (e, amt) => trace.push(['poiseHit', amt]);
  ctx._spawnBossProjectile = (e, props) => trace.push(['spawn', JSON.parse(JSON.stringify(props))]);
  ctx.canMv = (x, y, r) => { const v = q.canMv.length ? q.canMv.shift() : true; trace.push(['canMv', x, y, r, v]); return v; };
  ctx.mkEn = (x, y, si, et, ib, el) => { trace.push(['summon', x, y, et, el]); return { hp: 100 }; };
  ctx.ens = [];
  ctx._recycleProj = () => {};
  ctx._isDruidFinale = () => false;
  ctx.playVFXAng = (...a) => trace.push(['present', 'playVFXAng', a]);
  vm.createContext(ctx);
  vm.runInContext(helpers, ctx, { filename: FILE });
  vm.runInContext(sw, ctx, { filename: FILE });
  vm.runInContext(qu, ctx, { filename: FILE });
  vm.runInContext(lava, ctx, { filename: FILE });
  vm.runInContext(mine, ctx, { filename: FILE });
  const out = { id: c.id, mode: c.mode };
  try {
    if (c.mode === 'misc') { ctx.__sw(c.e, c.sp); out.enemy = c.e; }
    else if (c.mode === 'queue') { ctx.__q(c.sp); ctx.__lava(c.sp); }
    else { out.mines = ctx.__mine(c.mines, c.sp); }
  } catch (err) { out.error = String(err.stack || err); }
  const gOut = {};
  for (const k of ['_chaseAoes', '_fissures', '_tideWaves', '_seekerMines', '_poisonPools', '_lavaPools']) if (gt[k] !== undefined) gOut[k] = Array.from(gt[k]);
  out.g = JSON.parse(JSON.stringify(gOut));
  out.player = c.p; out.trace = trace;
  results.push(enc(out));
}
fs.writeFileSync(outFile, JSON.stringify({ sha256: SNAPSHOT.sha256, results }));
console.log(JSON.stringify({ cases: results.length }));
