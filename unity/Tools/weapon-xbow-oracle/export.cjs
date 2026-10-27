// PC-B05 weapon / crossbow oracle exporter. Runs the ORIGINAL web code in a Node VM and writes oracle.json; Program.cs (.NET 8) compares
// WeaponCatalog.cs / Simulation.Crossbow.cs with it. Nothing expected is typed by hand: the catalog tables, _autoBowSpec, _fireXbow, the pooled projectile
// objects (_mkPProj/_resetPProj/_recyclePProj/_getPProj), the auto fire block and the player projectile loop of update() are all cut out of game.html.
// usage: node export.cjs --source <web game.html> [--out oracle.json]
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), crypto = require('node:crypto');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const SRC = path.resolve(arg('--source', 'G:/exoduser/game.html')), OUT = path.resolve(arg('--out', path.join(__dirname, 'oracle.json')));
const text = fs.readFileSync(SRC, 'utf8'), lines = text.split('\n');
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const blocks = [];
function at(prefix, occ = 0) { let n = 0; for (let i = 0; i < lines.length; i++) if (lines[i].startsWith(prefix) && n++ === occ) return i + 1; throw new Error('source drift: ' + prefix); }
function record(a, b, label) { const body = lines.slice(a - 1, b).join('\n'); blocks.push({ label, from: a, to: b, sha256: sha(body) }); return body + '\n'; }
function line(prefix) { const n = at(prefix); return record(n, n, prefix.slice(0, 40)); }
function fn(prefix) {
  const a = at(prefix); let depth = 0, started = false;
  for (let i = a - 1; i < lines.length; i++) {
    let str = null, esc = false; const s = lines[i];
    for (let c = 0; c < s.length; c++) {
      const ch = s[c], nx = s[c + 1];
      if (str) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === str) str = null; continue; }
      if (ch === '/' && nx === '/') break;
      if (ch === "'" || ch === '"' || ch === '`') { str = ch; continue; }
      if (ch === '{') { depth++; started = true; } else if (ch === '}') depth--;
    }
    if (started && depth === 0) return record(a, i + 1, prefix.slice(0, 40));
  }
  throw new Error('unbalanced ' + prefix);
}
// a statement block opened on line `startPrefix`, closed by the first later line that is exactly `endLine`
function block(startPrefix, endLine, extra = 0) {
  const a = at(startPrefix); let b = a + 1;
  while (lines[b - 1] !== endLine) { b++; if (b > a + 600) throw new Error('source drift: end of ' + startPrefix); }
  return record(a, b + extra, startPrefix.slice(0, 40));
}
const J = o => JSON.parse(JSON.stringify(o, (k, v) => (v === undefined ? null : v)));
const noop = () => undefined;

// ---- the web source, assembled once ----
const catalogSrc = block('const WTYPES={', '};') + line('const WTYPE_KEYS=') + block('const BOWTYPES={', '};') + line('const BTYPE_KEYS=') + line('const RARITY_MUL=');
const bowSrc = [
  line('const _PPROJ_POOL='), line('const _pprojFree='), fn('function _mkPProj(){'), fn('function _resetPProj(p){'), fn('function _recyclePProj(p){'), fn('function _getPProj(){'),
  line('const XBOW_RANGE='), line('const XBOW_INTERVAL='), line('const XBOW_DMG='), line('const XBOW_SPEED='), line('const XBOW_PIERCE='),
  fn('function _autoBowSpec(){'), line('let _xbowTimer=0;'), line('let _xbowTarget=null;'), line('let _xbowEquipped=true;'),
  fn('function bw(){'), fn('function enhMulAtk(n){'), fn('function _slotFlatAtk(it){'), fn('function _lvB(){'), fn('function bowRef(){'),
  fn('function _passDmgSum(type){'), fn('function pBowMul(){'), fn('function pXbowMul(){'), fn('function pBowCost(){'), fn('function pBowRange(){'), fn('function pXbowSpd(){'),
  fn('function _stDisc(key){'), fn('function dst(a,b,c,d){'), fn('function _fireXbow(tx,ty){'), fn('function _autoFireBowSkill(tx,ty){'),
].join('');
const autoFireSrc = block('  if(_xbowEquipped&&P&&P.hp>0&&INV.equipped.bow){', '  }');
const projLoopSrc = block('  {let w=0;for(let i=0;i<pProjs.length;i++){', '  }pProjs.length=w;', 1);
const wrapped = bowSrc + 'function __autoFireFrame(){\n' + autoFireSrc + '}\nfunction __projFrame(){\n' + projLoopSrc + '}\n';

// ---- catalog ----
const sections = {};
{
  const ctx = vm.createContext({}); vm.runInContext(catalogSrc + 'globalThis.__c=JSON.stringify({WTYPES,BOWTYPES,RARITY_MUL,WTYPE_KEYS,BTYPE_KEYS})', ctx);
  sections.catalog = JSON.parse(ctx.__c);
}

// ---- deterministic generator shared with the C# test (Simulation's own LCG) ----
function lcg(seed) { let s = seed >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }

function makeScenario(k) {
  const r = lcg(1000 + k * 7919), pick = a => a[Math.floor(r() * a.length)], f32 = Math.fround;
  const types = ['crossbow', 'repeater', 'arcane'], type = types[k % 3];
  const bow = { slot: 'bow', btype: type, atk: 5 + Math.floor(r() * 400), enh: Math.floor(r() * 3), bowSpd: pick([1, 1.2, 1.5, 1.8, 2.25, 0.96, 0, 3.3]), bowRange: pick([0, 665, 760, 839, 881, 500]),
    bonusRange: pick([0, 1, 2, 3]), bowProjSpd: pick([22, 22, 0, 13, 30]), el: Math.floor(r() * 5), affixes: [] };
  if (r() < .5) bow.affixes.push({ id: pick(['sharpAtk', 'brutalAtk', 'ruinAtk']), value: Math.floor(r() * 90) });
  const aff = { pierceFlat: pick([0, 0, 100, 400, 950]), rangedDmgPct: 0, projDmgPct: 0, critRateBow: 0, stCostRed: pick([0, 0, -.2]) };
  const dex = Math.floor(r() * 60), lv = 1 + Math.floor(r() * 120);
  const walls = []; for (let i = 0; i < pick([0, 1, 2, 3]); i++) walls.push([f32(300 + r() * 900), f32(-300 + r() * 600), f32(30 + r() * 80), f32(60 + r() * 300)]);   // x, y, w, h
  if (k % 4 === 3) walls.push([f32(260 + r() * 120), -500, 40, 1000]);   // a tall near wall: bolts bounce (dist < maxDist/2) or die on it
  const enemies = []; const n = 2 + Math.floor(r() * 9), cluster = r() < .5;
  for (let i = 0; i < n; i++) enemies.push({ x: f32(cluster ? 500 + r() * 300 : 100 + r() * 1200), y: f32(cluster ? -60 + r() * 120 : -400 + r() * 800), r: f32(20 + r() * 20), hp: pick([5, 400, 3000, 200000, 1e9]) });
  return { seed: 50000 + k, bow, aff, dex, lv, baseAtk: 15 + Math.floor(r() * 10), stamina: pick([100, 100, 21, 20.5, 19.9, 100]), maxStamina: 100,
    passives: { pAtk: pick([0, 0, 2]), pHuman: pick([0, 0, 3]), pBow: pick([0, 0, 4]), pXbow: pick([0, 0, 6]) }, fan: pick([0, 0, 3]), crit: pick([0, 25]), legendary: r() < .25,
    player: { x: f32(r() * 200), y: f32(-50 + r() * 100) }, walls, enemies, frames: 420, toggles: r() < .3 ? [150, 160] : [], poolPrime: pick([0, 0, 0, 3]) };
}

function runScenario(sc) {
  const rng = lcg(sc.seed), events = [];
  const M = Object.create(Math); M.random = rng;
  const P = { x: sc.player.x, y: sc.player.y, hp: 300, st: sc.stamina, mst: sc.maxStamina, baseAtk: sc.baseAtk, lv: sc.lv, facing: 0, atkArc: 0, skills: { fanShot: sc.fan }, _weaponSeal: 0, _altAtk: 0 };
  const INV = { equipped: { bow: JSON.parse(JSON.stringify(sc.bow)) } };
  const enemies = sc.enemies.map((e, i) => ({ x: e.x, y: e.y, r: e.r, hp: e.hp, alive: true, _idx: i, el: 0, kb: { x: 0, y: 0 }, stunned: 0 }));
  const isWall = (x, y) => sc.walls.some(w => x >= w[0] && x < w[0] + w[2] && y >= w[1] && y < w[1] + w[3]);
  let frame = 0;
  const ctx = vm.createContext({
    Math: M, P, INV, G: { _gcT: 0, pets: null, hitStop: 0, cam: { x: 0, y: 0 } }, STATS: { dex: 0, str: 0 }, PASSIVES: { pAtk: sc.passives.pAtk, pHuman: sc.passives.pHuman, pBow: sc.passives.pBow, pXbow: sc.passives.pXbow, pPierce: 0, pCrit: 0 },
    OPT: { parts: 0, deathFx: false, hitStop: 100 }, _HS: { proj: 3 }, pProjs: [], sp: 1, _dtSp: 1, _gxTurret: null, _gxFiring: 0, _charIdx: 0, _shBufI: 0,
    _eqAffix: id => (INV.equipped.bow.affixes || []).reduce((s, a) => s + (a.id === id ? +a.value || 0 : 0), 0) + (sc.aff[id] || 0),
    _eqStat: k => (k === 'Dex' ? sc.dex : 0), _lEq: s => (s === '_lBowCrit' && sc.legendary ? 1 : 0), _uEq: () => 0, statCrit: () => sc.crit, _isFused: () => false, _isMaliceOrb: () => false,
    shQuery: (x, y, rr) => {   // spatial hash of the web: 128 px cells, row by row, insertion (array) order inside a cell
      const c0x = ~~((x - rr) / 128), c1x = ~~((x + rr) / 128), c0y = ~~((y - rr) / 128), c1y = ~~((y + rr) / 128), out = [];
      for (let cy = c0y; cy <= c1y; cy++) for (let cx = c0x; cx <= c1x; cx++) for (const e of enemies) if (e.alive && ~~(e.x / 128) === cx && ~~(e.y / 128) === cy) out.push(e);
      return out;
    },
    isW: isWall, hurtE: (e, dmg, ang) => { events.push([frame, e._idx, dmg]); M.random(); e.hp -= dmg; if (e.hp <= 0) e.alive = false; },
    elMul: () => 1, _hurtFieldMobs: () => false, _projEmit: noop, poolPart: noop, addParts: noop, addTxt: noop, _addImpact: noop, _bladeEchoRecord: noop, _bladeEchoFinish: noop, playSample: noop, playSampleAt: noop,
    _r: () => 1, _T: s => s, shake: noop, ELC: [], ELP: [], hm: () => ({}), _SFX_PRI: {}, _uqS: {}, SFX: new Proxy({}, { get: () => noop }) });
  vm.runInContext(catalogSrc + wrapped, ctx);
  for (let i = 0; i < sc.poolPrime; i++) vm.runInContext('_pprojFree.push(_mkPProj())', ctx);   // recycled objects already in the pool (0 at game start)
  const frames = [];
  for (frame = 0; frame < sc.frames; frame++) {
    if (sc.toggles.includes(frame)) vm.runInContext('_xbowEquipped=!_xbowEquipped;_xbowTimer=0;_xbowTarget=null', ctx);
    vm.runInContext('__autoFireFrame()', ctx);
    vm.runInContext('__projFrame()', ctx);
    const bolts = ctx.pProjs.map(p => [p.x, p.y, p.vx, p.vy, p.dmg, p.dist, p.maxDist, p.bounces || 0, p._pierced || 0, p._pierceRate === undefined ? -1 : p._pierceRate, p._hitSet.size, p.el]);
    frames.push(J({ bolts, timer: vm.runInContext('_xbowTimer', ctx), st: P.st, free: vm.runInContext('_pprojFree.length', ctx), alive: enemies.map(e => e.alive ? 1 : 0).join('') }));
  }
  return { in: sc, out: { events, frames } };
}

sections.autoBowSpec = [];
{
  const ctx = vm.createContext({ PASSIVES: { pBow: 0 }, INV: { equipped: {} }, BOWTYPES: null });
  vm.runInContext(catalogSrc + line('const XBOW_RANGE=') + line('const XBOW_SPEED=') + fn('function bw(){') + fn('function pBowRange(){') + fn('function _autoBowSpec(){'), ctx);
  for (const btype of [undefined, 'crossbow', 'repeater', 'arcane', 'bogus']) for (const bowRange of [undefined, 0, 500, 665, 760, 839, 881, 1200]) for (const bonusRange of [undefined, 0, 1, 3]) for (const projSpd of [undefined, 0, 13, 22]) for (const pBow of [0, 1, 5, 10]) {
    const b = {}; if (btype) b.btype = btype; if (bowRange !== undefined) b.bowRange = bowRange; if (bonusRange !== undefined) b.bonusRange = bonusRange; if (projSpd !== undefined) b.bowProjSpd = projSpd;
    ctx.INV.equipped.bow = b; ctx.PASSIVES.pBow = pBow;
    // an unknown btype is repaired to crossbow by _fixBow on load; the web helper itself then reads BOWTYPES.crossbow
    sections.autoBowSpec.push({ in: { btype: btype || null, bowRange: bowRange === undefined ? null : bowRange, bonusRange: bonusRange === undefined ? null : bonusRange, projSpd: projSpd === undefined ? null : projSpd, pBow }, out: J(vm.runInContext('_autoBowSpec()', ctx)) });
  }
}
sections.scenarios = [];
for (let k = 0; k < 48; k++) sections.scenarios.push(runScenario(makeScenario(k)));

const result = { source: { file: path.basename(SRC), sha256: sha(text), note: 'web game.html auto crossbow (update() auto fire + player projectile loop)' }, blocks, sections };
fs.writeFileSync(OUT, JSON.stringify(result));
const hits = sections.scenarios.reduce((s, c) => s + c.out.events.length, 0), shots = sections.scenarios.reduce((s, c) => s + Math.max(...c.out.frames.map(f => f.bolts.length)), 0);
const pierced = sections.scenarios.reduce((s, c) => s + c.out.frames.reduce((m, f) => Math.max(m, ...f.bolts.map(b => b[8]), 0), 0), 0);
console.log(JSON.stringify({ out: OUT, blocks: blocks.length, autoBowSpec: sections.autoBowSpec.length, scenarios: sections.scenarios.length, hits, maxBoltsSum: shots, piercedSum: pierced }));
