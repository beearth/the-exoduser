// PREP (not committed yet): web chain-dash pass-through hit loop oracle. Runs the ORIGINAL snippet of game.html (the `_dashActive` per-frame enemy hit loop, STR branch)
// in a Node VM and records, per frame, which enemies were hit with which damage / angle / hurtE options / knock-back. The C# side (Simulation.PlayerCombat dash step) will compare.
// usage: node export.cjs --source <origin/main game.html> [--out oracle.json]
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), crypto = require('node:crypto');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const SRC = path.resolve(arg('--source', '/tmp/web_main.html')), OUT = path.resolve(arg('--out', path.join(__dirname, 'oracle.json')));
const text = fs.readFileSync(SRC, 'utf8'), lines = text.split('\n');
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
function at(prefix, occ = 0) { let n = 0; for (let i = 0; i < lines.length; i++) if (lines[i].startsWith(prefix) && n++ === occ) return i + 1; throw new Error('source drift: ' + prefix); }
const a = at('    const _csActiveNow=P._chainSlashActive;'), b = at('    // ── 기동칼날개: 이동 중 광역 베기');
const hitSrc = lines.slice(a - 1, b - 1).join('\n');
const blocks = [{ label: 'dash path hit loop', from: a, to: b - 1, sha256: sha(hitSrc) }];
let seed = 20261028;
const rnd = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pick = x => x[Math.floor(rnd() * x.length)];
const noop = () => undefined;
const M = {}; for (const k of Object.getOwnPropertyNames(Math)) M[k] = Math[k]; M.random = () => .5;
const dstSrc = lines.find(l => l.startsWith('function dst(')), eqSrc = '';

const cases = [];
for (let k = 0; k < 160; k++) {
  const chargeBoost = pick([0, 0, 1, 2, 5, 10, 20]), baseAtk = pick([0, 5, 40, 300, 12000]), armor = pick([{}, { charge: 0 }, { charge: 7 }, { charge: 120, el: 2 }, { charge: 900, el: 3 }, { el: 1 }]);
  const dashBoost = pick([0, 0, .15, .4, .9]), tier = pick([1, 2, 3]);
  const n = pick([1, 3, 8, 20]);
  const enemies = []; for (let i = 0; i < n; i++) enemies.push({ x: 200 + Math.round(rnd() * 1200), y: -60 + Math.round(rnd() * 120), r: pick([8, 14, 22, 40]), alive: rnd() < .9, el: pick([0, 1, 2, 3, 4, 5]) });
  // the player is pulled along y=0 from x=0 to ~1400 in steps of 14..63 px; the same enemy is hit once (harpHits dedupe)
  const step = pick([14, 31, 63]), frames = Math.ceil(1500 / step);
  const P = { x: 0, y: 0, r: 15, baseAtk, skills: { chargeBoost } };
  const hits = []; const hitLog = [];
  const G = { hitStop: 0, shake: 0 };
  const ens = enemies.map((e, i) => ({ __i: i, x: e.x, y: e.y, r: e.r, alive: e.alive, el: e.el, kb: { x: 0, y: 0 } }));
  const ctx = vm.createContext({
    Math: M, P, G, OPT: { hitStop: 100, shake: 100 }, _shCacheBuf: [], _shCacheFrom: function (arr) { ctx._shCacheBuf = arr; },
    shQuery: (x, y, r) => ens.filter(e => e.alive && Math.hypot(e.x - x, e.y - y) <= r + 200), _harpHits: [], _harpSk: 'charge', _harpTier: tier, _fuseMul: () => 1,
    ar: () => armor, statStr: () => 1, _eqAffix: id => (id === 'dashBoost' ? dashBoost : 0), _T: s => s, addTxt: noop, poolPart: noop, ELP: ['#bbb', '#f52', '#38f', '#93c', '#fe0', '#f8c', '#8a4'],
    hurtE: (e, dmg, ang, flag, opts, el) => { hitLog.push({ i: e.__i, dmg, ang, flag, opts: JSON.parse(JSON.stringify(opts)), el: el === undefined ? null : el }); },
    dst: (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
  });
  vm.runInContext('function __hit(){' + hitSrc + '}', ctx);
  const trace = [];
  for (let f = 0; f < frames; f++) {
    P.x = f * step; P.y = 0; hitLog.length = 0;
    vm.runInContext('__hit()', ctx);
    if (hitLog.length) trace.push({ f, px: P.x, hits: hitLog.map(h => ({ ...h, kb: { x: ens[h.i].kb.x, y: ens[h.i].kb.y } })) });
  }
  cases.push({ chargeBoost, baseAtk, armor, dashBoost, tier, step, frames, enemies, trace, totalHits: trace.reduce((s, t) => s + t.hits.length, 0) });
}
fs.writeFileSync(OUT, JSON.stringify({ source: { file: path.basename(SRC), sha256: sha(text) }, blocks, cases }));
console.log(JSON.stringify({ out: OUT, lines: [a, b - 1], cases: cases.length, hits: cases.reduce((s, c) => s + c.totalHits, 0), sample: cases.find(c => c.totalHits).trace[0].hits[0] }));
