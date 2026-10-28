// M1-REGION R-A oracle exporter: runs the ORIGINAL web code in a Node VM and writes oracle.json; Program.cs (.NET 8) compares Simulation.Regions.cs / StageFlow.cs with it.
// Original pieces: _spawnHoleCount, _regionInit, _regionIdxAt, _regKill, _regionRatio, _regionClearedCount, _regionFbAlive, _regionCheckClears, _regionTick
// the Hell Gate unlock block of checkRooms with G._regions present and the HUD "지역 처치" row (60585~60586). No expected value is typed by hand.
// usage: node export.cjs --source <web game.html (origin/main)> [--out oracle.json]
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), crypto = require('node:crypto');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const SRC = path.resolve(arg('--source', 'G:/exoduser/game.html')), OUT = path.resolve(arg('--out', path.join(__dirname, 'oracle.json')));
const text = fs.readFileSync(SRC, 'utf8'), lines = text.split('\n');
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const blocks = [];
function at(prefix, occ = 0) { let n = 0; for (let i = 0; i < lines.length; i++) if (lines[i].startsWith(prefix) && n++ === occ) return i + 1; throw new Error('source drift: ' + prefix); }
function record(a, b, label) { const body = lines.slice(a - 1, b).join('\n'); blocks.push({ label, from: a, to: b, sha256: sha(body) }); return body + '\n'; }
function span(a, label) {   // from line a until its braces balance
  let depth = 0, started = false;
  for (let i = a - 1; i < lines.length; i++) {
    let str = null, esc = false; const s = lines[i];
    for (let c = 0; c < s.length; c++) {
      const ch = s[c], nx = s[c + 1];
      if (str) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === str) str = null; continue; }
      if (ch === '/' && nx === '/') break;
      if (ch === "'" || ch === '"' || ch === '`') { str = ch; continue; }
      if (ch === '{') { depth++; started = true; } else if (ch === '}') depth--;
    }
    if (started && depth === 0) return record(a, i + 1, label);
  }
  throw new Error('unbalanced ' + label);
}
const fn = (prefix, occ = 0) => span(at(prefix, occ), prefix.slice(0, 40));
const one = prefix => record(at(prefix), at(prefix), prefix.slice(0, 40));
const J = o => JSON.parse(JSON.stringify(o, (k, v) => (v === undefined ? null : v)));
const noop = () => undefined;
const sections = {};

let seed = 20261028;   // mulberry32: deterministic case generation
const rnd = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pick = a => a[Math.floor(rnd() * a.length)];

// ---- the original source, once ----
const holeSrc = one('const SPAWN_HOLE=') + one('function _spawnHoleCount(');
const regSrc = one('const _REG_DIRS_KO=') + one('const _REG_DIRS_EN=') + one('const _REG_CH1_KO=') + one('const _REG_CH1_EN=') + one('const _REG_FB_TO_REG=') + one('const _REG_CLEAR_RATIO=') +
  one('function _regionIdxAt(') + fn('function _regionInit(si){') + fn('function _regionFbAlive(r){') + one('function _regionRatio(') + one('function _regionClearedCount(') +
  fn('function _regKill(e){') + fn('function _regionCheckClears(){') + fn('function _regionTick(){');
const unlockSrc = span(at('  if(!G._bossArena&&G.bossAlive&&!G._bossUnlocked){'), 'checkRooms Hell Gate unlock');

function makeCtx(G, P) {
  const ctx = vm.createContext({
    Math, G, P, T: 40, _gameFrame: 0, _mmDirty: 0, _shDirty: false, banners: 0, clearsAnnounced: 0,
    _L: (k, e) => k, _T: k => k, SFX: { magic: () => { ctx.clearsAnnounced++; }, victory: noop }, _petSayCD: noop, _petSayUrgent: noop, addTxt: noop,
    _regionBannerShow: () => { ctx.banners++; }, _FB_ELS: [2, 1, 3, 4]
  });
  vm.runInContext(holeSrc + regSrc, ctx);
  return ctx;
}

// ---- _spawnHoleCount ----
{
  const ctx = makeCtx({ _regions: null }, null), out = [];
  for (const si of [0, 1, 2, 3, 10]) for (const size of [0, .1, .2, .3, .30001, .4, .5, .50001, .55, .8, 1, 2]) out.push({ si, size, count: vm.runInContext('_spawnHoleCount(' + size + ',' + si + ')', ctx) });
  sections.holeCount = out;
}

// ---- _regionInit: random maps / holes / guard ----
const snapshot = G => G._regions ? J({ midX: G._regMidX, midY: G._regMidY, gateIdx: G._regGateIdx, regions: G._regions.map(r => ({ total: r.total, kills: r.kills, cleared: r.cleared, fbIdx: r.fbIdx })) }) : { midX: G._regMidX, midY: G._regMidY, gateIdx: G._regGateIdx, regions: null };
function randomInit() {
  const dims = pick([[200, 200], [180, 180], [179, 200], [200, 179], [100, 100], [250, 300], [180, 400], [400, 180], [181, 182]]);
  const mw = dims[0], mh = dims[1], si = pick([0, 0, 0, 1, 2, 5]);
  const holes = []; const n = pick([0, 1, 3, 8, 14, 14, 20, 30]);
  const midX = mw / 2, midY = mh / 2;
  for (let i = 0; i < n; i++) {
    const edge = rnd() < .3;   // on / next to the dividing lines: the < comparison matters
    const x = edge ? (midX * 40 + pick([-40, -1, 0, 1, 39, 40])) : rnd() * mw * 40, y = edge ? (midY * 40 + pick([-40, -1, 0, 1, 39, 40])) : rnd() * mh * 40;
    holes.push({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100, size: pick([.2, .3, .45, .5, .55, .8, 1]) });
  }
  const gate = rnd() < .75 ? { bossCx: Math.floor(rnd() * mw), gateY: Math.floor(rnd() * 12) } : null;
  const guard = gate && rnd() < .7 ? { x: Math.round(rnd() * mw * 40 * 100) / 100, y: Math.round(rnd() * mh * 40 * 100) / 100 } : (rnd() < .3 ? { x: midX * 40, y: midY * 40 } : null);
  return { mw, mh, si, holes, gate, guard, fbDone: rnd() < .5 };
}
function buildG(c) {
  return { on: true, stage: c.si, mw: c.mw, mh: c.mh, map: [[0]], spawnHoles: c.holes.map(h => ({ x: h.x, y: h.y, size: h.size })), _gateGuard: c.guard ? { x: c.guard.x, y: c.guard.y } : null,
    _bossCx: c.gate ? c.gate.bossCx : null, _gateY: c.gate ? c.gate.gateY : null, _fbDone: c.fbDone, _fbSpawned: false, _fieldBosses: null, _bossArena: false, _bossLoadPhase: 0, _gateGuardKilled: false, _stageKills: 0 };
}
{
  const out = [];
  for (let k = 0; k < 400; k++) {
    const c = randomInit(), G = buildG(c);
    const ctx = makeCtx(G, { x: 4020, y: 7420 });
    vm.runInContext('_regionInit(' + c.si + ')', ctx);
    out.push({ c, web: snapshot(G) });
  }
  sections.init = out;
}

// ---- sequences: kills, guard death, the 15-frame tick and its gating ----
{
  const out = [];
  for (let k = 0; k < 300; k++) {
    const c = randomInit(); c.si = pick([0, 0, 1]); c.mw = pick([200, 200, 200, 190]); c.mh = pick([200, 200, 210]);
    if (c.gate) c.gate.bossCx = Math.min(c.gate.bossCx, c.mw - 1);   // the gate has to stand inside the (re-rolled) map
    const G = buildG(c), ctx = makeCtx(G, { x: 4020, y: 7420 });
    vm.runInContext('_regionInit(' + c.si + ')', ctx);
    const ops = [], trace = [];
    let frame = 0;
    const R = G._regions;
    const nOps = 10 + Math.floor(rnd() * 40);
    for (let o = 0; o < nOps; o++) {
      const r = rnd(); let op;
      if (r < .5 && R) {   // a kill born in a random region (sometimes died elsewhere, sometimes no home, sometimes a boss)
        const idx = Math.floor(rnd() * 4);
        const bx = ((idx & 1) ? G.mw / 2 + rnd() * G.mw / 2 : rnd() * G.mw / 2) * 40, by = ((idx >> 1) ? G.mh / 2 + rnd() * G.mh / 2 : rnd() * G.mh / 2) * 40;
        const noHome = rnd() < .1, ib = rnd() < .05, guard = !!(!G._gateGuardKilled && G._gateGuard && rnd() < .15);
        op = { op: 'kill', x: noHome ? bx : rnd() * G.mw * 40, y: noHome ? by : rnd() * G.mh * 40, hx: noHome ? null : bx, hy: noHome ? null : by, ib, guard };
        if (noHome) { op.x = bx; op.y = by; }
        const e = { x: op.x, y: op.y, ib };
        if (!noHome) { e._homeX = bx; e._homeY = by; }
        vm.runInContext('_regKill', ctx)(e);
        if (guard) { G._gateGuardKilled = true; G._gateGuard = null; }
      } else if (r < .55 && R) {   // a mass of kills in one region: crosses the 80 % line
        const idx = Math.floor(rnd() * 4), cnt = 1 + Math.floor(rnd() * 25);
        const bx = ((idx & 1) ? G.mw / 2 + 5 : 5) * 40, by = ((idx >> 1) ? G.mh / 2 + 5 : 5) * 40;
        op = { op: 'kills', n: cnt, hx: bx, hy: by };
        for (let i = 0; i < cnt; i++) vm.runInContext('_regKill', ctx)({ x: bx, y: by, _homeX: bx, _homeY: by, ib: false });
      } else if (r < .6) {
        op = { op: 'flags', on: rnd() < .85, arena: rnd() < .2, load: pick([0, 0, 0, 1, 4]), fbDone: rnd() < .6 };
        G.on = op.on; G._bossArena = op.arena; G._bossLoadPhase = op.load; G._fbDone = op.fbDone;
      } else {
        op = { op: 'advance', n: pick([1, 5, 14, 15, 16, 29, 30, 31, 45]) };
        for (let i = 0; i < op.n; i++) { frame++; ctx._gameFrame = frame; vm.runInContext('_regionTick()', ctx); }
      }
      ops.push(op); trace.push({ frame, state: snapshot(G), kills: G._regions ? G._regions.map(x => x.kills) : null, count: R ? vm.runInContext('_regionClearedCount()', ctx) : 0, ratios: R ? R.map((x, i) => vm.runInContext('_regionRatio', ctx)(x, i)) : null, banners: ctx.banners });
    }
    out.push({ c, ops, trace });
  }
  sections.sequence = out;
}

// ---- Hell Gate unlock block with G._regions present (checkRooms 42069~) ----
{
  const out = [];
  for (const stage of [0, 1, 2]) for (const fbDone of [false, true]) for (let mask = 0; mask < 16; mask++) for (const arena of [false, true]) for (const alive of [true, false]) for (const already of [false, true]) {
    const msgs = [];
    const G = { _bossArena: arena, bossAlive: alive, _bossUnlocked: already, _totalSpawned: 168, _stageKills: 168, _gateGuardKilled: true, stage, _fbDone: fbDone, _regions: [0, 1, 2, 3].map(i => ({ cleared: !!(mask & (1 << i)), total: 10, kills: 10, fbIdx: -1 })) };
    const ctx = vm.createContext({ Math, G, P: { x: 0, y: 0 }, _shDirty: false, _mmDirty: 0, _L: (k, e) => k, addTxt: (x, y, t) => msgs.push(t), SFX: { victory: noop }, _petSayUrgent: noop });
    vm.runInContext('function _regionClearedCount(){const R=G._regions;if(!R)return 0;let n=0;for(let i=0;i<4;i++)if(R[i].cleared)n++;return n}', ctx);
    vm.runInContext('function __u(){' + unlockSrc + '}', ctx); vm.runInContext('__u()', ctx);
    out.push({ stage, fbDone, mask, arena, alive, already, unlocked: G._bossUnlocked === true, announced: msgs.length });
  }
  sections.unlock = out;
}

// ---- the enemy list hard cap (update(), 34540~34562): > 800 entries -> 700; culled enemies count as kills ----
{
  const a = at('  if(ens.length>800){'), capSrc = span(a, 'update ens hard cap');
  const dst2 = one('function dst2(');
  const out = [];
  for (let k = 0; k < 120; k++) {
    const n = pick([100, 700, 800, 801, 830, 900, 1000, 1200, 1700, 2500]);
    const P = { x: 4000 + Math.round((rnd() - .5) * 1000), y: 4000 + Math.round((rnd() - .5) * 1000) };
    const ens = [];
    for (let i = 0; i < n; i++) {
      const r = rnd();
      const e = { __i: i, alive: true, ib: false, _reviveTimer: 0, x: Math.round(rnd() * 8000), y: Math.round(rnd() * 8000) };
      if (rnd() < .3) { e.x = P.x + Math.round((rnd() - .5) * 400); e.y = P.y + Math.round((rnd() - .5) * 400); }   // a cluster at the player
      if (rnd() < .1) { e.x = P.x + 300; e.y = P.y; }                                                                // exact ties
      if (r < .02) e.ib = true; else if (r < .06) { e.alive = false; e._reviveTimer = 1 + Math.floor(rnd() * 100); } else if (r < .3) e.alive = false;
      ens.push(e);
    }
    const input = ens.map(e => ({ x: e.x, y: e.y, alive: e.alive, ib: e.ib, reviveTimer: e._reviveTimer }));
    const G = { kills: 0, _stageKills: 0, _aliveEns: 0 }; const regKilled = [];
    const ctx = vm.createContext({ Math, G, P, ens, console: { warn: noop }, _shDirty: false, _regKill: e => regKilled.push(e.__i) });
    vm.runInContext(dst2 + 'function __cap(){' + capSrc + '}', ctx); vm.runInContext('__cap()', ctx);
    out.push({ n, P, input, kept: ctx.ens.map(e => e.__i), kills: G.kills, stageKills: G._stageKills, regKilled });
  }
  sections.cap = out;
}

// ---- HUD "지역 처치" row (#mmLvl killCnt, 60584~60586): the current region min(kills, total) / total, else G._stageKills / G._totalSpawned (LT-5) ----
{
  const a = at('  const _regCur=(G._regions&&G._regCurIdx>=0)?'), hudSrc = record(a, a + 1, 'hud killCnt');
  const out = [];
  for (let k = 0; k < 400; k++) {
    const regions = rnd() < .75 ? [0, 1, 2, 3].map(i => ({ id: i, total: pick([0, 1, 14, 30, 47, 60]), kills: pick([0, 1, 5, 13, 14, 15, 17, 18, 47, 60, 61]), cleared: rnd() < .3, fbIdx: -1 })) : null;
    const G = { _regions: regions, _regCurIdx: pick([-1, 0, 1, 2, 3]), _stageKills: pick([undefined, 0, 3, 17, 120]), _totalSpawned: pick([undefined, 0, 14, 168]) };
    const el = {}, ctx = vm.createContext({ Math, G, $: () => el, _hudPulse: noop, _hudReadableNumber: v => String(v) });
    vm.runInContext('function __hk(){' + hudSrc + 'return {k:_stageK,t:_killTotal}}', ctx);
    const r = vm.runInContext('__hk()', ctx);
    out.push(J({ regions, curIdx: G._regCurIdx, stageKills: G._stageKills, totalSpawned: G._totalSpawned, k: r.k, t: r.t, text: el.textContent }));
  }
  sections.hudKills = out;
}

const result = { source: { file: path.basename(SRC), sha256: sha(text), note: 'web game.html [REGION] block + checkRooms Hell Gate unlock' }, blocks, sections };
fs.writeFileSync(OUT, JSON.stringify(result));
console.log(JSON.stringify({ out: OUT, blocks: blocks.length, holeCount: sections.holeCount.length, init: sections.init.length, sequence: sections.sequence.length, unlock: sections.unlock.length, cap: sections.cap.length, hudKills: sections.hudKills.length }));
