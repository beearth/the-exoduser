// PC-BOSS-CHASE (2026-10-22) — 1-1 보스방 B02 장면 원본 VM oracle.
// 고정 스냅샷(source_snapshot/game.html dee094fd)의 원문 함수·상수를 줄 번호 그대로 VM에서 실행한다. 제품 모듈 import 0.
// 장면: genBossArena(0) → mkEn(보스 중심, si0, etype0, ib) → 플레이어 입구 정지 →
//   로딩 상태(2 네임카드 130 → 3 페이드인 50 → 4 입장 100, 4의 첫 틱 stunned90·reviveIframes110) → B02 900틱.
// 틱마다 update()의 원문 순서(32154 _ffBuild → 34351 몸통 충돌 → 34396 오라 리셋·34415 화톳불·34421 적 루프 → checkRooms 41786 로딩)를 따른다.
// 사용:
//   node pc_boss_chase_oracle.cjs --units=<st2,facing,projT,bossPatT,orbit,erratic> [--seed=N] [--trace-file=out.json]
//   node pc_boss_chase_oracle.cjs --sweep=72 [--seed=N] --out-file=out.json   (facing 단위만 바꾼 표)
const SNAPSHOT = require('../source_snapshot/snapshot.cjs');
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const arg = (k, fb = '') => { const a = process.argv.find(s => s.startsWith(k + '=')); return a ? a.slice(k.length + 1) : fb; };
const lines = SNAPSHOT.readBytes().toString().split('\n');
const L = n => lines[n - 1];
const FILE = 'exoduser-game.html';

// ── 원문 범위 추출 ──
function lineOf(prefix) { const i = lines.findIndex(l => l.startsWith(prefix)); assert(i >= 0, 'anchor ' + prefix); return i + 1; }
function fnEnd(start) {
  const s = L(start); let depth = 0, seen = false;
  for (const ch of s) { if (ch === '{') { depth++; seen = true; } else if (ch === '}') depth--; }
  if (seen && depth === 0) return start;
  let i = start + 1; while (!(L(i) === '}' || L(i).startsWith('}'))) i++; return i;
}
function constEnd(start) { // 데이터 상수: 괄호 깊이 0 에서 ';'
  let depth = 0;
  for (let i = start; i < start + 400; i++) {
    const s = L(i); let inStr = null;
    for (let k = 0; k < s.length; k++) {
      const ch = s[k];
      if (inStr) { if (ch === '\\') k++; else if (ch === inStr) inStr = null; continue; }
      if (ch === "'" || ch === '"' || ch === '`') { inStr = ch; continue; }
      if (ch === '/' && s[k + 1] === '/') break;
      if ('([{'.includes(ch)) depth++; else if (')]}'.includes(ch)) depth--;
      else if (ch === ';' && depth === 0) return i;
    }
  }
  throw Error('constEnd ' + start);
}
const pieces = [];
const addFn = name => { const s = lineOf('function ' + name + '('); pieces.push([s, fnEnd(s)]); };
const addConst = (decl) => { const s = lineOf(decl); pieces.push([s, constEnd(s)]); };
const addLines = (s, e) => pieces.push([s, e]);
// 줄 번호 앵커(스냅샷 dee094fd)
assert(L(30699).startsWith('function genBossArena(si){'));
assert(L(31122).startsWith('function mkEn(x,y,si,etype,ib,el,room){'));
assert(L(38317).startsWith('function _bossIdleMove(e,d,sp){'));
assert(L(38375).startsWith('function _bossAI(e,sp,d){'));
assert(L(38586).startsWith('function updateE(e,sp){'));
assert(L(32154).includes('_ffTimer+=_dtSp;if(_ffTimer>=.25){_ffTimer=0;_ffBuild()}'));
assert(L(34350).includes('보스 몸통 충돌'));
assert(L(34396).startsWith('  for(let _ei=0;_ei<ens.length;_ei++){const e=ens[_ei];if(!e.alive)continue;'));
assert(L(34421).startsWith('  for(let _ei=0;_ei<ens.length;_ei++){const e=ens[_ei];'));
assert(L(34551) === '  }' && L(34552).includes('오브젝트 풀 파티클'));
assert(L(41786).startsWith('  if(G._bossLoadPhase>0){'));
assert(L(41816) === '  }' && L(41817).includes('tile=3'));
for (const n of ['_r', '_isNormalDruidBoss', '_isDruidFinale', 'findBoss', '_poiseReset', '_cancelProjCharge', '_tickProjCharge',
  'isRareEtype', '_enemyHpPacing', 'mkEn', 'genBossArena', 'hasLOS', '_ch1HillRampAt', '_ch1HillBandBlocks', 'isW', 'canMv', 'safePt',
  '_isWallTile', '_canMvTile', '_pushOutWall', 'dst', 'dst2', '_ffBuild', '_ffDir', '_ffMoveE', '_eWallStuck', '_bossScore',
  '_bossStartPattern', '_bossPhaseCheck', '_bossIdleMove', '_bossAI', 'updateE', 'atkTicketRequest', '_druidFinaleUpdate',
  '_spikeTrapSlowPct', 'shake', '_bossSfx', '_assignMobSkin', '_assignBossSkin']) addFn(n);
for (const c of ['const T=', 'const BOSS_MOVES=', 'const BOSS_COMBOS=', 'const BOSS_PHASES=', 'const ETYPE_RANGE=', 'const EL=',
  'const ELC=', 'const DIFF_LV_OFF=', 'const DIFF_MUL=', 'const ELITE_TIERS=', 'const ETYPE_ERES=', 'const _ETYPE_SFX=', 'const _ARCH_SFX=',
  'const _CH1_OPENING_EXCLUDED_ET=', 'const _DEMO_LAST_STAGE=', 'const ETYPE_HP=', 'const ETYPE_ATK=', 'const _ETYPE_SPD_RAW=', 'const ETYPE_SPD=',
  'const ETYPE_R=', 'const ETYPE_POISE=', 'const ETYPE_COL=', 'const _MOB8_TOTAL=', 'const _CH1_HILL=', 'const _FF_CELL=', 'const _ffOut=', 'const _BOSS_SFX=']) addConst(c);
// _BOSS_MOVESET 0~3 (9960~9970)
{ const s = lineOf('const _BOSS_MOVESET=[];'); const e = lineOf('_BOSS_MOVESET[0]=new Set(_BOSS_MOVESET[3]);'); addLines(s, e); }
// 정적 줄(let 선언) — 플로우필드 상태
addLines(31747, 31747);
pieces.sort((a, b) => a[0] - b[0]);
for (let i = 1; i < pieces.length; i++) assert(pieces[i][0] > pieces[i - 1][1], 'overlap ' + pieces[i - 1] + ' ' + pieces[i]);
// update() 틱 조각: 원문 줄을 그대로, 감싸는 함수 머리는 바로 앞 빈 줄에 둔다.
const TICK = [[32154, 32154], [34351, 34351], [34396, 34551]];
const LOAD = [41786, 41816];
for (const [s, e] of TICK) for (const p of pieces) assert(!(p[0] <= e && p[1] >= s), 'tick overlap');

function buildCode() {
  let code = '', cur = 1;
  const all = pieces.map(p => ({ s: p[0], e: p[1], kind: 'top' }));
  all.push({ s: TICK[0][0], e: TICK[TICK.length - 1][1], kind: 'tick' });
  all.push({ s: LOAD[0], e: LOAD[1], kind: 'load' });
  all.sort((a, b) => a.s - b.s);
  for (const p of all) {
    if (p.kind === 'top') {
      code += '\n'.repeat(p.s - cur); for (let n = p.s; n <= p.e; n++) code += L(n) + '\n'; cur = p.e + 1;
    } else if (p.kind === 'tick') {
      code += '\n'.repeat(TICK[0][0] - 1 - cur) + 'function __tick(sp,_dtSp){\n'; cur = TICK[0][0];
      for (const [s, e] of TICK) { code += '\n'.repeat(s - cur); for (let n = s; n <= e; n++) code += L(n) + '\n'; cur = e + 1; }
      code += '}\n'; cur++;
    } else {
      code += '\n'.repeat(p.s - 1 - cur) + 'function __checkRoomsLoad(_dtSp){\n'; cur = p.s;
      for (let n = p.s; n <= p.e; n++) code += L(n) + '\n'; cur = p.e + 1;
      code += '}\n'; cur++;
    }
  }
  return code;
}
const CODE = buildCode();

// xorshift32 (표본용 결정적 RNG; Godot 과 같은 값을 주려면 --units 로 생성 단위를 직접 넣는다)
function prng(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

function makeCtx(units, seed) {
  const rng = prng(seed); const q = [...units]; const st = { draws: 0 };
  const present = {}; const projs = []; const hurts = [];
  const note = n => (...a) => { present[n] = (present[n] || 0) + 1; };
  const ctx = { console, Math: Object.create(Math), Float32Array, Int16Array, Int32Array, Int8Array, Uint8Array, Set, Map, Array, Object, JSON, Number, isFinite };
  ctx.Math.random = () => { st.draws++; return q.length ? q.shift() : rng(); };
  vm.createContext(ctx);
  const pre = [
    'var G={stage:0,map:null,mw:0,mh:0,rooms:[],exits:[],rifts:[],spawnHoles:[],shake:0,hitStop:0,slowMo:0,_bossLoadPhase:0,_bossLoadT:0,_bossLoadFade:0,atkTickets:0,maxAtkTickets:3,cam:{x:0,y:0},_boneWalls:[],_eTierFrame:0};',
    'var P={x:0,y:0,r:15,hp:1000,mhp:1000,s:"idle",st2:0,iframes:0,kb:{x:0,y:0},facing:0,lv:1};', // r:15 = 29019 초기 P
    'var OPT={diff:5,shake:100,bossDebug:false};var ens=[];var worldItems=[];var _deadPool=[];var MAP_OBJS=[];var _colObjs=[];var _OBJ_META={};',
    'var _FDG_RUINED_FOREST_FIRST=false;var _useGPU=false,_useGL=false;var _ESPRITES=[];var IS_MOBILE=false;var _gameFrame=0;var _mSfxPlaying=0;',
    'var VW=1920,VH=1080;var _ffWorker=null,_ffWorkerBusy=false;var STG=[{be:0,monLv:100,bn:"boss"}];var SI_TO_HELL=[0,0,0,0];var _DEMO_MODE=true;',
  ].join('\n');
  vm.runInContext(pre, ctx);
  // 표시·사운드·외부 owner 스텁(값을 바꾸지 않는 표시만; 위치·상태 영향 경로는 원문)
  for (const n of ['addTxt', 'addParts', 'poolPart', 'playSample', 'playVFXAng', '_addBlastLight', '_gpVibrate', '_petSayCD', '_reviveVFX', 'shRebuild', 'rebuildDeadPool'])
    ctx[n] = note(n);
  ctx.SFX = new Proxy({}, { get: (_, k) => note('SFX.' + String(k)) });
  ctx._T = s => s; ctx._L = (a) => a;
  ctx._ensureColObjs = () => {};
  ctx._spawnBossProjectile = (e, props) => { projs.push(props); };
  ctx.performance = { now: () => 0 };
  ctx.shQuery = () => [];
  ctx._fireChargedProj = note('_fireChargedProj'); // 20157: 탄 비행·명중은 이 장면 밖(발사 시각만 기록)
  // hurtP(43418): 시험 장면은 피해 기록만. 원본 비DOT 피격은 P.iframes=0(43581/43584)이라 다음 접촉을 막지 않는다.
  ctx.hurtP = (dmg, opts) => { hurts.push({ t: vm.runInContext('_gameFrame', ctx), dmg, opts: opts || null }); };
  vm.runInContext('var window=globalThis;', ctx); // 브라우저와 같이 window 속성 = 전역(31157 window._noProjEtypes)
  vm.runInContext(CODE, ctx, { filename: FILE });
  return { ctx, st, present, projs, hurts };
}

function loadArena(ctx) {
  const arena = vm.runInContext('genBossArena(0)', ctx);
  if (ARENA === 'rect') { // 사용자 결정 M10(PARITY_BOSS_01): 사각 124×104 = 웹 런타임 _buildStreamChunk export(assets/boss_parity/arena.json)
    const ex = JSON.parse(fs.readFileSync(require('node:path').join(__dirname, '../assets/boss_parity/arena.json'), 'utf8'));
    assert(ex.map.length === arena.mh && ex.map[0].length === arena.mw && ex.boss[0] === arena.bossX && ex.boss[1] === arena.bossY && ex.entry[0] === arena.entryX && ex.entry[1] === arena.entryY);
    arena.map = ex.map;
  }
  return arena;
}

function runCase(units, seed, keepTrace) {
  const { ctx, st, projs } = makeCtx(units, seed);
  const arena = loadArena(ctx);
  vm.runInContext('(a)=>{G.map=a.map;G.mw=a.mw;G.mh=a.mh;G.rooms=a.rooms;G._bossArena=true;P.x=(a.entryX+.5)*T;P.y=(a.entryY+.5)*T;P.iframes=90;}', ctx)(arena);
  const spawn0 = st.draws;
  const e = vm.runInContext('(a)=>{const e=mkEn((a.bossX+.5)*T,(a.bossY+.5)*T,0,0,true,STG[0].be,0);ens.push(e);return e}', ctx)(arena);
  const spawnDraws = st.draws - spawn0;
  // 추적 구간만 원문 실행: 첫 _bossStartPattern(37704) 호출에서 멈춘다(패턴 상태 이후는 BC06~BC10 원본 대조 시험 소관).
  let patStart = null;
  ctx.__patStart = (ee, mv, d, ph, ed) => { patStart = { id: mv.id, idx: mv.idx, d, phase: ph, extraDelay: ed, x: ee.x, y: ee.y, bossPatT: ee.bossPatT, comboSeq: ee._comboSeq ? [...ee._comboSeq] : null, feint: !!ee._feinting }; };
  vm.runInContext('_bossStartPattern=function(e,mv,d,phase,extraDelay){__patStart(e,mv,d,phase,extraDelay)};', ctx);
  const tick = ctx.__tick, load = ctx.__checkRoomsLoad;
  // 31749–31796 워커 지연: 맵 교체(_enterBossArena) 직후 첫 프레임의 _ffDir 는 아직 필드 맵 결과를 읽는다.
  // 필드 맵은 이 장면 밖이라 그 한 틱의 방향은 Godot 이 실제로 쓴 값(--stale-first-dir)을 공급받는다(웹 실측 1틱).
  vm.runInContext('var __stale=null;var __ffOrig=_ffDir;_ffDir=function(x,y){if(__stale)return __stale.d;return __ffOrig(x,y)};', ctx);
  const trace = [];
  const hist = {}; let minD = 1e9; let firstPat = -1;
  // 로딩 2(130) → 3(50) → 4(100): 원본 checkRooms 원문이 단계 전환·입장 경직을 맡는다.
  vm.runInContext('G._bossLoadPhase=2;G._bossLoadT=0;G._bossLoadFade=1;', ctx);
  let t = 0; let phaseB = false; let bT = 0;
  const snap = (k) => ({ k, t, ph: ctx.G._bossLoadPhase, s: e.s, x: e.x, y: e.y, d: Math.hypot(ctx.P.x - e.x, ctx.P.y - e.y), st2: e.st2, stun: e.stunned, al: !!e._alerted, f: e.facing, pat: e.bossPatT });
  while (true) {
    t++;
    vm.runInContext('_gameFrame++;', ctx);
    if (t === 1 && STALE !== undefined) vm.runInContext('__stale={d:' + JSON.stringify(STALE) + '};', ctx);
    tick(1, 1);
    if (t === 1) vm.runInContext('__stale=null;', ctx);
    load(1);
    vm.runInContext('P.s="idle";', ctx); // 플레이어 정지(시험 장면): checkRooms 로딩 중 P.s='idle'과 같은 값
    if (patStart && !phaseB) { firstPat = 0; break; } // 로딩 중 패턴 시작(원본에서 d<=500 이면 가능)
    if (!phaseB && ctx.G._bossLoadPhase === 0) { phaseB = true; bT = 0; if (keepTrace) trace.push(snap('L')); continue; }
    if (keepTrace) trace.push(snap(phaseB ? 'B' : 'L'));
    if (phaseB) {
      bT++;
      hist[e.s] = (hist[e.s] || 0) + 1;
      const d = Math.hypot(ctx.P.x - e.x, ctx.P.y - e.y);
      if (e.alive) minD = Math.min(minD, d);
      if (patStart) { firstPat = bT; break; }
      if (bT >= B02_TICKS) break;
    }
    if (t > 20000) break;
  }
  return {
    arena_kind: ARENA, stale_first_dir: STALE === undefined ? 'none' : STALE, units: units, seed, spawnDraws, spawn: { x: e.x, y: e.y, facing: e.facing },
    arena: { bossX: arena.bossX, bossY: arena.bossY, entryX: arena.entryX, entryY: arena.entryY },
    b02: { hist, min_d: minD, first_pattern_tick: firstPat, first_pattern: patStart, b02_ticks: B02_TICKS,
      // 시험 B02(900틱 안 공격 상태 3종·idle<700)가 원본에서도 성립할 수 없는 경우: 첫 패턴이 900틱 안에 없다.
      b02_window_cannot_pass: firstPat < 0 || firstPat > 900 - 200 },
    beans: projs.length, draws: st.draws, trace: keepTrace ? trace : undefined,
  };
}

// ── A-02 장면: 일반 적 1마리(정예 아님)를 정지 플레이어 접촉 거리에 두고 원문 적 루프·updateE 로 피격 주기를 잰다 ──
// 생성 단위 = Godot fixture(demo11_etype_a_fixture.recipe)와 같은 0.25(spd 31139·r 31141·st2·facing·projT·bossPatT·orbit·erratic).
// rollElite(31065)는 시험 고정값 0(정예 아님) — Godot fixture elite:0 과 같은 상태.
function runMelee(etype, seed, ticks, gap) {
  const { ctx, st, hurts } = makeCtx(new Array(8).fill(0.25), seed);
  const arena = loadArena(ctx);
  vm.runInContext('(a)=>{G.map=a.map;G.mw=a.mw;G.mh=a.mh;G.rooms=a.rooms;G._bossArena=false;P.x=(a.bossX+.5)*T;P.y=(a.bossY+.5)*T;P.iframes=0;G.cam.x=P.x;G.cam.y=P.y;}', ctx)(arena);
  vm.runInContext('rollElite=function(){return 0};', ctx);
  const e = vm.runInContext('(et,gap)=>{const e=mkEn(P.x,P.y,0,et,false,0,0);e.x=P.x+e.r+P.r+gap;e._spawnT=0;ens.push(e);return e}', ctx)(etype, gap);
  const spawnDraws = st.draws;
  const fired = [];
  ctx.__orig_tpc = ctx._tickProjCharge;
  ctx.__fired = () => fired.push(vm.runInContext('_gameFrame', ctx));
  vm.runInContext('_tickProjCharge=function(e,sp){const b=e._projChargeT||0;__orig_tpc(e,sp);if(b>0&&!(e._projChargeT>0))__fired()};', ctx);
  const track = [];
  for (let t = 1; t <= ticks; t++) {
    vm.runInContext('_gameFrame++;', ctx);
    ctx.__tick(1, 1);
    vm.runInContext('P.s="idle";P.kb.x=0;P.kb.y=0;', ctx); // 정지 플레이어(시험 장면)
    if (t <= 240) track.push([t, +e.x.toFixed(3), +e.y.toFixed(3), e.s, +e.st2.toFixed(3)]);
  }
  const melee = hurts.filter(h => !h.opts).map(h => h.t);
  const iv = melee.slice(1).map((t, i) => t - melee[i]);
  return { etype, seed, spawnDraws, r: e.r, atk: e.atk, spd: e.speed, contact_range: e.r + 15 + 8, melee_hits: melee.length, first_hit: melee.length ? melee[0] : -1,
    intervals: iv, other_hurts: hurts.filter(h => h.opts).length, proj_charges_done: fired.length, hurts: hurts.slice(0, 40), track };
}

const ARENA = arg('--arena', 'rect');
// --stale-first-dir=x,y | null | 생략(생략이면 첫 틱도 보스방 필드 — 워커 지연 없는 가정)
const STALE = (() => { const v = arg('--stale-first-dir', ''); if (!v) return undefined; if (v === 'null') return null; const [x, y] = v.split(',').map(Number); return { x, y }; })();
assert(ARENA === 'rect' || ARENA === 'source', '--arena=rect|source');
const sweep = +arg('--sweep', '0');
const B02_TICKS = +arg('--b02-ticks', '900');
const seed = +arg('--seed', '20261022');
const SCENE = arg('--scene', 'chase');
if (SCENE === 'melee') {
  const ets = arg('--etypes', '0,4').split(',').map(Number);
  const seeds = +arg('--seeds', '10');
  const ticks = +arg('--ticks', '1800');
  const gap = +arg('--gap', '-6');
  const out = { schema: 'pc-boss-chase-oracle.melee.v1', snapshot: SNAPSHOT.sha256, ticks, gap, rows: [], summary: [] };
  for (const et of ets) for (let i = 0; i < seeds; i++) out.rows.push(runMelee(et, seed + i, ticks, gap));
  for (const et of ets) {
    const rs = out.rows.filter(r => r.etype === et); const iv = rs.flatMap(r => r.intervals);
    const hist = {}; for (const v of iv) hist[v] = (hist[v] || 0) + 1;
    out.summary.push({ etype: et, runs: rs.length, r: rs[0].r, atk: rs[0].atk, spd: rs[0].spd, hits: rs.map(r => r.melee_hits), first_hit: rs.map(r => r.first_hit),
      iv_n: iv.length, iv_min: Math.min(...iv), iv_max: Math.max(...iv), iv_mean: +(iv.reduce((a, b) => a + b, 0) / iv.length).toFixed(3), iv_hist: hist,
      other: rs.map(r => r.other_hurts), proj: rs.map(r => r.proj_charges_done) });
  }
  const f = arg('--out-file'); if (f) fs.writeFileSync(f, JSON.stringify(out));
  for (const x of out.summary) console.log(JSON.stringify(x));
} else if (sweep > 0) {
  const base = arg('--units', '0.4,0,0.5,0.5,0.5,0.5').split(',').map(Number);
  const rows = [];
  for (let i = 0; i < sweep; i++) {
    const u = [...base]; u[1] = i / sweep; // facing = u*2π
    const r = runCase(u, seed + i, false);
    rows.push({ facing_unit: u[1], facing_deg: +(u[1] * 360).toFixed(1), min_d: +r.b02.min_d.toFixed(2),
      first_pattern_tick: r.b02.first_pattern_tick, first_move: r.b02.first_pattern ? r.b02.first_pattern.id : null, cannot_pass: r.b02.b02_window_cannot_pass });
  }
  const cannot = rows.filter(r => r.cannot_pass).length;
  const ticks = rows.map(r => r.first_pattern_tick).filter(v => v >= 0).sort((a, b) => a - b);
  const out = { schema: 'pc-boss-chase-oracle.sweep.v1', snapshot: SNAPSHOT.sha256, arena: ARENA, seed, n: sweep, b02_ticks: B02_TICKS,
    b02_window_cannot_pass: cannot, first_pattern_tick_min: ticks[0], first_pattern_tick_max: ticks[ticks.length - 1], no_pattern: rows.length - ticks.length, rows };
  const f = arg('--out-file'); if (f) fs.writeFileSync(f, JSON.stringify(out, null, 1));
  const { rows: _r, ...head } = out; console.log(JSON.stringify(head));
} else {
  const units = arg('--units', '').split(',').filter(Boolean).map(Number);
  assert(units.length === 6, '--units 6개(st2,facing,projT,bossPatT,orbit,erratic 단위) 필요');
  const r = runCase(units, seed, true);
  const f = arg('--trace-file'); if (f) fs.writeFileSync(f, JSON.stringify(r));
  const { trace, ...head } = r;
  console.log(JSON.stringify(head));
}
