// M1-REGION R-B oracle exporter: runs the ORIGINAL web code of the abyssal angler in a Node VM and writes oracle.json; Program.cs (.NET 8) compares Simulation.FieldBoss.cs with it.
// Original pieces: _fbHp, _fbMk, _fbTick, _fbTickOne, _fbMarkDead, _fbAliveCount, _fbFaceFrame, _fbEsca, _fbFireEnergy, _fmXY, _fmCanHit, _fmApply, _hurtFieldMobs,
// _fieldEnemyCanShoot, _emitEnemyShot, _tickEnemyShotWarnings, _regionFbAlive. Particles / sounds / camera effects are stubs. No expected value is typed by hand.
// usage: node export.cjs --source <web game.html (origin/main)> [--out oracle.json]
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), crypto = require('node:crypto');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const SRC = path.resolve(arg('--source', 'G:/exoduser/game.html')), OUT = path.resolve(arg('--out', path.join(__dirname, 'oracle.json')));
const text = fs.readFileSync(SRC, 'utf8'), lines = text.split('\n');
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const blocks = [];
function at(prefix, occ = 0) { let n = 0; for (let i = 0; i < lines.length; i++) if (lines[i].startsWith(prefix) && n++ === occ) return i + 1; throw new Error('source drift: ' + prefix); }
function record(a, b, label) { const body = lines.slice(a - 1, b).join('\n'); blocks.push({ label, from: a, to: b, sha256: sha(body) }); return body + '\n'; }
function span(a, label) {
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
const noop = () => undefined;

let seed = 20261028;
const rnd = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pick = a => a[Math.floor(rnd() * a.length)];

const src = one('const _FB_HP_MUL=') + one('const _FB_COUNT=') + one('const _FB_WAKE=') + one('const _FB_SITES=') + one('const _FB_ELS=') + one('const _FB_EN_CHG=') + one('const ELC=') +
  one('function dst(') + one('function _fbElCol(') + one('function _fbHp(') + fn('function _fbFaceFrame(fb,px,py){') + fn('function _fbEsca(fb){') + fn('function _fbFireEnergy(fb){') +
  one('function _fbClear(') + fn('function _fbAliveCount(){') + fn('function _fbMarkDead(fb){') + fn('function _fbMk(tx,ty,el){') + fn('function _fbTick(){') + fn('function _fbTickOne(fb){') +
  one('function _fmXY(') + fn('function _fmCanHit(m,isFb){') + fn('function _fmApply(m,dmg,isFb){') + fn('function _hurtFieldMobs(x,y,hitR,dmg,hitSet,parryShot){') +
  fn('function _fieldEnemyCanShoot(e){') + fn('function _emitEnemyShot(e,props){') + fn('function _tickEnemyShotWarnings(sp){') + fn('function _regionFbAlive(r){');

const M = {}; for (const k of Object.getOwnPropertyNames(Math)) M[k] = Math[k]; M.random = () => .5;

function makeWorld(lv, px, py) {
  const log = { hurtP: [], shots: [], showPH: [], slams: 0, frame: 0 };
  const G = { on: true, stage: 0, _bossArena: false, cam: { x: px, y: py }, _regions: null };
  const P = { x: px, y: py, r: 15, lv, iframes: 0, s: 'idle', kb: { x: 0, y: 0 } };
  const ctx = vm.createContext({
    Math: M, G, P, T: 40, VW: 1920, VH: 1080, EL: { P: 0, F: 1, I: 2, D: 3, L: 4, H: 5, E: 6 }, _gameFrame: 0, ens: [], window: {}, _FDG_RUINED_FOREST_FIRST: false, _MAP_QA_MODE: false,
    showPH: (t, c) => log.showPH.push({ frame: log.frame, text: t, col: c }), poolPart: noop, _addTpSmoke: noop, shake: noop, SFX: { magic: noop, detonate: noop }, _addTpBolt: noop, playVFXAng: noop, _addBlastLight: noop,
    _fmDeathFx: noop, hurtP: d => log.hurtP.push({ frame: log.frame, dmg: d }), addTxt: (x, y, t) => { if (t === '💥심해강타!') log.slams++; }, _T: k => k, _L: (k, e) => k, _loadKrakenWaterOrbClip: noop,
    spawnProj: p => { log.shots.push({ frame: log.frame, x: p.x, y: p.y, vx: p.vx, vy: p.vy, dmg: p.dmg, el: p.el, life: p.life, sz: p.sz, r: p.r, col: p.col, elemBall: !!p.elemBall, fbEnergy: !!p.fbEnergy, titanEye: !!p.titanEye, commit: !!p._commit }); return p; },
    _prepareDarkSphere: noop, _projectileParryClass: () => 'normal', _playTell: noop, addParts: noop, _fdMarkDead: noop
  });
  vm.runInContext(src, ctx);
  return { ctx, G, P, log };
}

const snap = G => (G._fieldBosses || []).map(fb => fb ? ({ x: fb.x, y: fb.y, hp: fb.hp, mhp: fb.mhp, atk: fb.atk, alive: fb.alive, t: fb.t, frame: fb.frame, hitCd: fb.hitCd, shotCd: fb.shotCd, tpCd: fb.tpCd, tpT: fb.tpT, tpX: fb.tpX, tpY: fb.tpY, hid: fb.hid, burst: fb.burst, burstGap: fb.burstGap, spawnIn: fb.spawnIn, asleep: fb.asleep, enChg: fb.enChg }) : null);

// ---- constants / formulas ----
{
  const w = makeWorld(1, 0, 0), out = { hp: [], sites: JSON.parse(JSON.stringify(vm.runInContext('_FB_SITES', w.ctx))), els: vm.runInContext('_FB_ELS', w.ctx), wake: vm.runInContext('_FB_WAKE', w.ctx), count: vm.runInContext('_FB_COUNT', w.ctx), mk: [] };
  for (const lv of [0, 1, 2, 9, 10, 50, 100, 250, 499, 500, 1000]) out.hp.push({ lv, hp: vm.runInContext('_fbHp(' + lv + ')', w.ctx) });
  for (const lv of [0, 1, 7, 10, 100, 500]) { const w2 = makeWorld(lv, 0, 0); const fb = vm.runInContext('_fbMk(58,158,2)', w2.ctx); out.mk.push({ lv, fb: JSON.parse(JSON.stringify(fb)) }); }
  var constants = out;
}
// ---- faces / feeler ----
const faces = [];
{
  const w = makeWorld(1, 0, 0);
  for (let k = 0; k < 400; k++) {
    const fb = { x: Math.round(rnd() * 8000), y: Math.round(rnd() * 8000), t: Math.floor(rnd() * 200), frame: Math.floor(rnd() * 16) };
    const px = fb.x + Math.round((rnd() - .5) * 600), py = fb.y + Math.round((rnd() - .5) * 600);
    faces.push({ fb, px, py, face: vm.runInContext('_fbFaceFrame', w.ctx)(fb, px, py), esca: JSON.parse(JSON.stringify(vm.runInContext('_fbEsca', w.ctx)(fb))) });
  }
}

// ---- scenarios: the player walks around the anglers, gets hit by / hits them ----
const scenarios = [];
const FRAMES = 1500;   // random scenarios; the tours run 4 x 380
for (let sc = 0; sc < 21; sc++) {
  const lv = pick([1, 1, 5, 10, 60, 250]);
  const site = pick([[58, 158], [148, 150], [52, 42], [148, 42]]);
  const sx = (site[0] + .5) * 40, sy = (site[1] + .5) * 40;
  const start = { x: sx + pick([-1400, -1100, -900, -500, -250, 0, 300, 700]) + Math.round(rnd() * 80), y: sy + pick([-1100, -600, -300, 0, 400, 900]) + Math.round(rnd() * 80) };
  const plan = [];   // per-frame player position + optional hit
  let x = start.x, y = start.y, tx = start.x, ty = start.y; const hits = [];
  const hitSets = [];
  for (let f = 1; f <= FRAMES; f++) {
    if (f % 90 === 1) { const mode = rnd(); if (mode < .5) { tx = sx + (rnd() - .5) * 700; ty = sy + (rnd() - .5) * 700; } else if (mode < .75) { tx = sx + (rnd() - .5) * 2600; ty = sy + (rnd() - .5) * 2600; } else { tx = x + (rnd() - .5) * 200; ty = y + (rnd() - .5) * 200; } }
    const dx = tx - x, dy = ty - y, d = Math.hypot(dx, dy) || 1, sp = Math.min(d, 6); x += dx / d * sp; y += dy / d * sp;
    const step = { f, x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
    if (rnd() < .05) { step.iframes = pick([0, 0, 30]); }
    if (rnd() < .06) step.hit = { x: sx + (rnd() - .5) * 500, y: sy + (rnd() - .5) * 500, r: pick([8, 55, 120, 200]), dmg: pick([1, 3.7, 40, 900, 12000.9, 0.2]), set: pick([-1, -1, 0, 1]) };
    plan.push(step);
  }
  scenarios.push({ lv, start, plan });
}
// tours: wake each angler in turn and kill it with one big hit (death -> _fbMarkDead -> the flag when the last one dies)
const SITES = [[58, 158], [148, 150], [52, 42], [148, 42]];
for (const order of [[0, 1, 2, 3], [3, 1, 0, 2], [2, 3, 1, 0]]) {
  const lv = pick([1, 20, 300]); const plan = []; let f = 0;
  for (const k of order) {
    const sx = (SITES[k][0] + .5) * 40, sy = (SITES[k][1] + .5) * 40;
    for (let i = 0; i < 380; i++) {
      f++; const step = { f, x: sx + 500 + Math.round(i % 7), y: sy + 100 };
      if (i === 200) step.hit = { x: sx, y: sy, r: 250, dmg: 5e7, set: -1 };
      if (i === 205) step.hit = { x: sx, y: sy, r: 250, dmg: 5e7, set: -1 };   // already dead: nothing left to hit
      plan.push(step);
    }
  }
  scenarios.push({ lv, start: { x: plan[0].x, y: plan[0].y }, plan });
}
const results = [];
for (const sc of scenarios) {
  const w = makeWorld(sc.lv, sc.start.x, sc.start.y), { ctx, G, P, log } = w;
  const trace = [], sets = [new Set(), new Set()];
  for (const st of sc.plan) {
    log.frame = st.f; ctx._gameFrame = st.f;
    P.x = st.x; P.y = st.y; G.cam.x = P.x; G.cam.y = P.y; P.iframes = st.iframes || 0; P.kb.x = 0; P.kb.y = 0;
    const h0 = log.hurtP.length, s0 = log.shots.length, p0 = log.showPH.length, sl0 = log.slams;
    vm.runInContext('_fbTick()', ctx); vm.runInContext('_tickEnemyShotWarnings(1)', ctx);
    let hitRes = null;
    if (st.hit) { const set = st.hit.set < 0 ? null : sets[st.hit.set]; hitRes = vm.runInContext('_hurtFieldMobs', ctx)(st.hit.x, st.hit.y, st.hit.r, st.hit.dmg, set); }
    const ev = (log.hurtP.length > h0 || log.shots.length > s0 || log.showPH.length > p0 || log.slams > sl0 || st.hit);
    if (ev || st.f % 6 === 0) trace.push({ f: st.f, px: P.x, py: P.y, bosses: snap(G), done: !!G._fbDone, spawned: !!G._fbSpawned, hitRes, slams: log.slams - sl0 });
  }
  const regionAlive = [0, 1, 2, 3].map(i => vm.runInContext('_regionFbAlive', ctx)({ fbIdx: i }));
  results.push({ lv: sc.lv, plan: sc.plan, trace, hurtP: log.hurtP, shots: log.shots, showPH: log.showPH, slams: log.slams, done: !!G._fbDone, regionAlive });
}

const result = { source: { file: path.basename(SRC), sha256: sha(text), note: 'web game.html abyssal angler (_fb*), _fmApply/_hurtFieldMobs, _emitEnemyShot' }, blocks, constants, faces, frames: FRAMES, scenarios: results };
fs.writeFileSync(OUT, JSON.stringify(result));
console.log(JSON.stringify({ out: OUT, blocks: blocks.length, scenarios: results.length, size: fs.statSync(OUT).size, shots: results.reduce((a, r) => a + r.shots.length, 0), hurtP: results.reduce((a, r) => a + r.hurtP.length, 0), slams: results.reduce((a, r) => a + r.slams, 0), announced: results.filter(r => r.showPH.length).length, done: results.filter(r => r.done).length }));
