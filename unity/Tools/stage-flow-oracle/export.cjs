// PC-C07 stage-flow oracle exporter: runs the ORIGINAL web code in a Node VM and writes oracle.json; Program.cs (.NET 8) compares BossArena.cs / StageFlow.cs with it.
// Original pieces: genBossArena + SI_TO_HELL (all 35 stages), the exit-opening snippet of checkRooms, _applyCh1StartNorthGate, the boss-load phase machine + the 30-frame
// cadence of checkRooms, the Hell Gate unlock block, the exit-tile gate block. No expected value is typed by hand.
// usage: node export.cjs --source <web game.html> --map <unity/Assets/Exoduser/Resources/Data/ch1_map.json> [--out oracle.json]
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), crypto = require('node:crypto');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i < 0 ? d : process.argv[i + 1]; };
const SRC = path.resolve(arg('--source', 'G:/exoduser/game.html')), OUT = path.resolve(arg('--out', path.join(__dirname, 'oracle.json')));
const MAP = path.resolve(arg('--map', path.join(__dirname, '../../Assets/Exoduser/Resources/Data/ch1_map.json')));
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
const J = o => JSON.parse(JSON.stringify(o, (k, v) => (v === undefined ? null : v)));
const noop = () => undefined;
const sections = {};

// ---- SI_TO_HELL (derived by the web's own loop) + genBossArena ----
const chapterSrc = record(at('const CHAPTER_STAGES=['), at('const CHAPTER_STAGES=[') + 8, 'CHAPTER_STAGES') + record(at('const TOTAL_STAGES='), at('const TOTAL_STAGES='), 'TOTAL_STAGES') +
  record(at('const SI_TO_HELL='), at('const SI_TO_HELL=') + 8, 'SI_TO_HELL init + loop');
const arenaSrc = fn('function genBossArena(si){');
const exitSnipStart = at('      if(G._bossArena&&G._bossArenaExit){');
const exitSnip = record(exitSnipStart + 1, exitSnipStart + 7, 'checkRooms exit opening');
{
  const out = [];
  for (let si = 0; si < 35; si++) {
    const ctx = vm.createContext({ Math, G: null }); vm.runInContext(chapterSrc + arenaSrc, ctx);
    const a = vm.runInContext('genBossArena(' + si + ')', ctx);
    const flat = []; for (let y = 0; y < a.mh; y++) for (let x = 0; x < a.mw; x++) flat.push(a.map[y][x]);
    // exit opening exactly as checkRooms does it, on a copy
    const G = { map: a.map.map(r => [...r]), mw: a.mw, mh: a.mh, _bossArenaExit: { x: a.exitX, y: a.exitY } };
    vm.runInContext('(function(G){' + exitSnip + '})', ctx)(G);
    const opened = []; for (let y = 0; y < G.mh; y++) for (let x = 0; x < G.mw; x++) opened.push(G.map[y][x]);
    out.push({ si, hell: vm.runInContext('SI_TO_HELL[' + si + ']', ctx), mw: a.mw, mh: a.mh, exitX: a.exitX, exitY: a.exitY, entryX: a.entryX, entryY: a.entryY, bossX: a.bossX, bossY: a.bossY, room: J(a.rooms[0]), tiles: flat, opened });
  }
  sections.arena = out;
}

// ---- field gate: _applyCh1StartNorthGate on a blank map, compared with the Unity map data (tiles 2 / 3) ----
{
  const m = JSON.parse(fs.readFileSync(MAP, 'utf8'));
  const ctx = vm.createContext({ Math }); vm.runInContext(fn('function _applyCh1StartNorthGate(map,mw,mh){'), ctx);
  const mw = m.width, mh = m.height, map = Array.from({ length: mh }, () => Array(mw).fill(1));
  const g = J(vm.runInContext('_applyCh1StartNorthGate', ctx)(map, mw, mh));
  sections.field = { width: mw, height: mh, tiles: m.tiles, web: { bossCx: g.bossCx, gateY: g.gateY, exitY: 7, exits: g.exits, gateTiles: g.gateTiles } };
}

// ---- boss-load phase machine + the 30-frame cadence (checkRooms 41925-41961) ----
{
  const a = at('  if(G._bossLoadPhase>0){'), loadSrc = span(a, 'checkRooms boss-load phases');
  const crt = record(at('  G._crT=(G._crT||0)+1;'), at('  G._crT=(G._crT||0)+1;') + 2, 'checkRooms _crT cadence');
  const out = [];
  for (const withBoss of [true, false]) {
    const G = { _bossLoadPhase: 1, _bossLoadT: 0, _bossLoadFade: 0, _crT: 17, stage: 0, _bossGateNear: true, slowMo: 0 };
    const P = { s: 'wSwing', st2: 5 }; const boss = withBoss ? { stunned: 0, reviveIframes: 0, x: 1, y: 1, r: 10 } : null;
    let entered = 0, introAt = -1, tickNo = 0;
    const ctx = vm.createContext({ Math, G, P, _dtSp: 1, findBoss: () => boss, shake: noop, poolPart: noop, _addBlastLight: noop, _bossSfx: () => null, playSample: noop, _r: () => 1, _bossLine: noop,
      _enterBossArena: () => { entered = tickNo; G._crT = 0; } });
    vm.runInContext('function __tick(){' + loadSrc + crt + 'return true}', ctx);
    const trace = [];
    for (tickNo = 1; tickNo <= 420; tickNo++) {
      const before = boss ? [boss.stunned, boss.reviveIframes] : null;
      const heavy = vm.runInContext('__tick()', ctx) === true;
      if (boss && introAt < 0 && boss.stunned === 90) introAt = tickNo;
      trace.push({ phase: G._bossLoadPhase, t: G._bossLoadT, fade: G._bossLoadFade, heavy, pState: P.s, pSt2: P.st2, entered: entered === tickNo });
    }
    out.push({ withBoss, startCrT: 17, entered, introAt, introStunned: boss ? boss.stunned : null, introRevive: boss ? boss.reviveIframes : null, trace });
  }
  sections.loadPhases = out;
}

// ---- Hell Gate unlock block (checkRooms 42011-42034), region-less branch (G._regions = null) ----
{
  const a = at('  if(!G._bossArena&&G.bossAlive&&!G._bossUnlocked){'), src = span(a, 'checkRooms Hell Gate unlock');
  const out = [];
  for (const stage of [0, 1]) for (const fb of [false, true]) for (const gk of [false, true]) for (const tot of [0, 1, 4, 5, 10, 25, 168]) {
    const kset = new Set([0, 1, tot, Math.max(0, tot - 1), Math.floor(tot * .5), Math.floor(tot * .79), Math.ceil(tot * .8) - 1, Math.ceil(tot * .8), Math.ceil(tot * .7), Math.ceil(tot * .7) - 1]);
    for (const kills of [...kset].sort((x, y) => x - y)) {
      const msgs = [];
      const G = { _bossArena: false, bossAlive: true, _bossUnlocked: false, _totalSpawned: tot, _stageKills: kills, _gateGuardKilled: gk, stage, _fbDone: fb, _regions: null };
      const ctx = vm.createContext({ Math, G, P: { x: 0, y: 0 }, _shDirty: false, _mmDirty: 0, _L: (k, e) => k, addTxt: (x, y, t) => msgs.push(t), SFX: { victory: noop }, _petSayUrgent: noop });
      vm.runInContext('function __u(){' + src + '}', ctx); vm.runInContext('__u()', ctx);
      out.push({ stage, fb, gk, tot, kills, unlocked: G._bossUnlocked === true, announced: msgs.length });
    }
  }
  sections.unlock = out;
}

// ---- exit tile stepped on in the field (checkRooms 42035-42060): angler / sealed / start the load ----
{
  const a = at('  if(!G.stageCleared&&G.exits.length>0&&G._bossLoadPhase<=0){'), head = record(a, a + 25, 'checkRooms exit-tile gate');
  const out = [];
  for (const stage of [0, 1]) for (const fb of [false, true]) for (const unlocked of [false, true]) for (const gk of [false, true]) for (const tot of [0, 5, 168]) for (const kills of [0, 1, 4, 17, 100, 200]) for (const frame of [0, 1, 44, 45, 90, 91]) {
    const msgs = [];
    const G = { stageCleared: false, exits: [{ x: 100, y: 7 }], _bossLoadPhase: 0, bossAlive: true, _bossArena: false, stage, _fbDone: fb, _bossUnlocked: unlocked, _regions: null, _stageKills: kills, _totalSpawned: tot, _gateGuardKilled: gk, _bossLoadT: 5, _bossLoadFade: .5 };
    const ctx = vm.createContext({ Math, G, P: { x: 100.5 * 40, y: 7.5 * 40 }, T: 40, _gameFrame: frame, _L: (k, e) => k, addTxt: (x, y, t) => msgs.push(t), _petSayCD: noop, SFX: { groggy: noop }, poolPart: noop, _regionClearedCount: () => 0 });
    // the block ends after the "boss alive in the field" branch; close the loop / outer ifs by hand (the clear branch that follows is a separate section)
    vm.runInContext('function __x(){' + head.split('\n').slice(0, 26).join('\n') + '}}}}', ctx); vm.runInContext('__x()', ctx);
    const kind = msgs.length === 0 ? null : msgs[0].startsWith('심연') ? 'angler' : 'sealed';
    const pm = msgs.length && kind === 'sealed' ? /(\d+)% \(80%/.exec(msgs[0]) : null;
    out.push({ stage, fb, unlocked, gk, tot, kills, frame, loadPhase: G._bossLoadPhase, msg: kind, pct: pm ? +pm[1] : null });
  }
  sections.exitGate = out;
}

const result = { source: { file: path.basename(SRC), sha256: sha(text), note: 'web game.html checkRooms / genBossArena / _applyCh1StartNorthGate' }, blocks, sections };
fs.writeFileSync(OUT, JSON.stringify(result));
console.log(JSON.stringify({ out: OUT, blocks: blocks.length, arena: sections.arena.length, loadPhases: sections.loadPhases[0].trace.length, unlock: sections.unlock.length, exitGate: sections.exitGate.length }));
