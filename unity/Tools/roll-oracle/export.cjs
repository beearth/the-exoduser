// PC-B07 roll oracle exporter: runs the ORIGINAL web functions (_canRoll, activateRoll, _finishRoll, the _tickBladeDash roll branch, _applyBlinkWeakPath,
// _uqMoveRefund) in a Node VM and writes oracle.json; Program.cs (.NET 8) compares Simulation.Roll.cs / RollRules.cs with it. No expected value is typed by hand.
// usage: node export.cjs --source <web game.html at origin/main 614cf73a0 or later> [--out oracle.json]
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
// _tickBladeDash body is only exercised for its roll branch; the lightning (non roll) tail needs hundreds of globals, so cut the function at the roll finish and keep the move part
function tickRollSrc() {
  const a = at('function _tickBladeDash(sp){'); let b = a;
  while (!lines[b - 1].includes('if(P._bdRoll){_finishRoll();return}')) { b++; if (b > a + 40) throw new Error('source drift: roll finish line'); }
  return record(a, b, '_tickBladeDash..roll') + '}}\n';
}
const J = o => JSON.parse(JSON.stringify(o, (k, v) => (v === undefined ? null : v)));
const noop = () => undefined;
const consts = line('const _HARP_GAUGE_COST=') + line('const _ROLL_DIST=');
function makeCtx(over) {
  const base = { P: null, _harpGauge: 225, _HARP_GAUGE_MAX: 225, G: { }, isAct: k => !!(over.act && over.act[k]), isHeld: k => !!(over.held && over.held[k]), addTxt: noop, playSample: noop, addParts: noop, shake: noop, poolPart: noop,
    _r: () => 1, _isKiCharging: () => over.kiCharging === true, _isFused: () => false, _applyBlinkWeakPath: noop, _uqMoveRefund: noop, SFX: new Proxy({}, { get: () => noop }),
    canMvBlink: (x, y, r) => over.wall === undefined || x < over.wall, canMv: (x, y, r) => over.wall === undefined || x < over.wall, _T: s => s, Math };
  return vm.createContext(base);
}
const gauges = [0, 44.9, 45, 45.1, 90, 100.5, 224.99, 225];
const sections = {};

// ---- constants ----
{ const c = makeCtx({}); vm.runInContext(consts, c); sections.constants = J(vm.runInContext('({dist:_ROLL_DIST,frames:_ROLL_FRAMES,iframes:_ROLL_IFRAMES,cost:_ROLL_GAUGE_COST})', c)); }

// ---- _canRoll ----
{ const src = consts + fn('function _canRoll(){'), out = [];
  for (const g of gauges) for (const moveT of [undefined, 0, 0.5, 3, 6]) { const c = makeCtx({}); vm.runInContext(src, c); c._harpGauge = g; c.P = { _bdMoveT: moveT }; vm.runInContext('_harpGauge=' + g, c); out.push({ in: { gauge: g, moveT: moveT === undefined ? null : moveT }, out: vm.runInContext('_canRoll()', c) }); }
  sections.canRoll = out; }

// ---- activateRoll ----
{ const src = consts + fn('function activateRoll(dir){'), out = [];
  const states = ['idle', 'sBlock', 'whirlwind', 'beam', 'sDraw', 'kiGather', 'wSwing', 'stagger', 'wRecover', 'wWindup'];
  for (const dir of [0, 1, 2, 3]) for (let m = 0; m < 16; m++) for (const gauge of [44.9, 45, 100, 225]) for (const st of states) for (const ki of [false, true]) for (const iframes of [0, 3, 9]) {
    if (ki && st !== 'wWindup') continue;   // _isKiCharging() is true only while winding up
    const act = { up: !!(m & 1), down: !!(m & 2), left: !!(m & 4), right: !!(m & 8) };
    const c = makeCtx({ act, kiCharging: ki }); const p = { s: st, st2: 0, iframes, x: 100, y: 200, facing: 1.5, _bdMoveT: 0 };
    vm.runInContext(src, c); c.P = p; vm.runInContext('_harpGauge=' + gauge, c);
    const txt = []; c.addTxt = (x, y, t) => txt.push(t);   // overwritten global is read through the context
    vm.runInContext('addTxt=(x,y,t)=>{__t.push(t)}', Object.assign(c, { __t: txt }));
    vm.runInContext('activateRoll(' + dir + ')', c);
    out.push({ in: { dir, act, gauge, state: st, kiCharging: ki, iframes }, out: J({ gauge: vm.runInContext('_harpGauge', c), s: p.s, st2: p.st2, moveT: p._bdMoveT, ang: p._bdAng, roll: p._bdRoll === true, pre: p._preBdState === undefined ? null : p._preBdState, facing: p.facing, iframes: p.iframes, cells: txt[0] || null }) });
  }
  sections.activateRoll = out; }

// ---- _tickBladeDash roll branch + _finishRoll (trajectory) ----
{ const src = consts + fn('function _rollStepDist(step){') + fn('function _finishRoll(){') + tickRollSrc(), out = [];
  const angles = [0, Math.PI / 4, Math.PI / 2, 3 * Math.PI / 4, Math.PI, -3 * Math.PI / 4, -Math.PI / 2, -Math.PI / 4, 0.3, -2.1];
  for (const ang of angles) for (const wall of [undefined, 1000, 1030, 1100, 1160]) for (const pre of [null, 'sBlock']) for (const parry of [false, true]) for (const mp of [0, 5]) {
    const c = makeCtx({ wall, act: { parry }, held: {} }); const p = { s: 'bladeDash', st2: 18, x: 1000, y: 500, r: 15, mp, st: 5, _bdMoveT: 18, _bdAng: ang, _bdRoll: true, _preBdState: pre, iframes: 5 };
    vm.runInContext(src, c); c.P = p; const frames = [];
    for (let f = 0; f < 24 && p._bdMoveT > 0; f++) {
      vm.runInContext('_tickBladeDash(1)', c);
      frames.push({ x: p.x, y: p.y, moveT: p._bdMoveT, s: p.s, st2: p.st2, roll: p._bdRoll === true });
    }
    out.push({ in: { ang, wall: wall === undefined ? null : wall, pre, parry, mp }, out: J({ frames, s: p.s }) });
  }
  sections.trajectory = out; }

// ---- u_n02 _applyBlinkWeakPath ----
{ const src = fn('function _applyBlinkWeakPath(ang,len){'), out = [];
  let seed = 7; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let k = 0; k < 120; k++) {
    const ang = rnd() * Math.PI * 2 - Math.PI, enemies = [];
    for (let i = 0; i < 8; i++) enemies.push({ x: 1000 + (rnd() - .5) * 500, y: 500 + (rnd() - .5) * 500, r: 10 + rnd() * 40, alive: rnd() > .15, _blinkWeak: rnd() > .7 ? 0.9 : 0, _blinkWeakT: 0 });
    const v = [0.5, 0.75, 1.0][k % 3]; const c = makeCtx({}); c._uEq = () => v; c.dst = (a, b, x, y) => Math.hypot(a - x, b - y); c.shQuery = () => enemies; c.P = { x: 1000, y: 500 };
    vm.runInContext(src, c); const before = JSON.parse(JSON.stringify(enemies)); vm.runInContext('_applyBlinkWeakPath(' + ang + ',' + 250 * 0.7 + ')', c);
    out.push({ in: { ang, v, enemies: before }, out: enemies.map(e => ({ weak: e._blinkWeak, t: e._blinkWeakT })) });
  }
  sections.blinkWeak = out; }

// ---- u_d06 _uqMoveRefund ----
{ const src = fn('function _uqMoveRefund(cost){'), out = [];
  for (const warpT of [0, 1, 180]) for (const v of [0, 0.1, 0.2, 0.3]) for (const gauge of [0, 44.9, 100, 200, 224, 225]) for (const cost of [0, 45, 98]) {
    const c = makeCtx({}); c._uqS = { warpT }; c._uEq = () => v; c.P = { x: 0, y: 0 }; vm.runInContext(src, c); vm.runInContext('_harpGauge=' + gauge, c);
    vm.runInContext('_uqMoveRefund(' + cost + ')', c);
    out.push({ in: { warpT, v, gauge, cost }, out: J({ gauge: vm.runInContext('_harpGauge', c), warpT: c._uqS.warpT }) });
  }
  sections.warpRefund = out; }

const result = { source: { file: path.basename(SRC), sha256: sha(text), note: 'web game.html (roll: 614cf73a0; 18 frame ease-out: 574cc2158)' }, blocks, sections };
fs.writeFileSync(OUT, JSON.stringify(result));
console.log(JSON.stringify({ out: OUT, blocks: blocks.length, canRoll: sections.canRoll.length, activateRoll: sections.activateRoll.length, trajectory: sections.trajectory.length, blinkWeak: sections.blinkWeak.length, warpRefund: sections.warpRefund.length }));
