// C04-ORACLE-2: 웹 1-1 진행·클리어·게이트 규칙(C04-3)과 보스 아레나(C04-5) 정답 추출.
// 원본 = origin/main 의 game.html(커밋본)·maps_data.js (Playwright route). 디스크 game.html 수정은 쓰지 않는다.
// 테스트 훅(receipt에 기록): window._btFramePause=true 로 원래 loop 정지 → update()를 직접 호출해 프레임을 센다,
//   매 프레임 P.hp=P.mhp·P.iframes=999, 적 처치는 hurtE(e,1e9,0,true) / 앵글러는 _fmApply(fb,1e9,true), 플레이어는 순간이동.
// 사용: node tools/c04-oracle/extract-progress.mjs [--out docs/engine/c04_oracle] [--runs 3] [--main-repo G:/exoduser] [--ref origin/main]
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(arg('out', path.join(here, '../../docs/engine/c04_oracle')));
const RUNS = +arg('runs', 3);
const MAIN = arg('main-repo', 'G:/exoduser');
const REF = arg('ref', 'origin/main');
const BASE = arg('base', 'http://127.0.0.1:3333');
const CHROME = arg('chrome', 'C:/Program Files/Google/Chrome/Application/chrome.exe');
const { chromium } = createRequire(path.join(MAIN, 'package.json'))('playwright');
const sha256 = b => crypto.createHash('sha256').update(b).digest('hex');
const git = (...a) => execFileSync('git', ['-C', MAIN, ...a], { maxBuffer: 256 * 1024 * 1024 });
fs.mkdirSync(OUT, { recursive: true });

const gameBlob = git('show', `${REF}:game.html`);
const mapsBlob = git('show', `${REF}:maps_data.js`);
const refSha = git('rev-parse', REF).toString().trim();
const gameLines = gameBlob.toString('utf8').split('\n');
const lineOf = re => { const i = gameLines.findIndex(l => re.test(l)); return i < 0 ? null : i + 1; };
// 줄 번호 = 커밋본 기준. 함수명 → 정의 줄.
const FN = {};
for (const [k, re] of Object.entries({
  update: /^function update\(\)/, checkRooms: /^function checkRooms\(\)/, initStage: /^function initStage\(/,
  _spawnHoleCount: /^function _spawnHoleCount\(/, _regionInit: /^function _regionInit\(/, _regKill: /^function _regKill\(/,
  _regionCheckClears: /^function _regionCheckClears\(/, _regionTick: /^function _regionTick\(/, _regionRatio: /^function _regionRatio\(/,
  _regionFbAlive: /^function _regionFbAlive\(/, _fbTick: /^function _fbTick\(/, _fbTickOne: /^function _fbTickOne\(/, _fbMarkDead: /^function _fbMarkDead\(/,
  _fmApply: /^function _fmApply\(/, _applyCh1StartNorthGate: /function _applyCh1StartNorthGate\(/, genFromTemplate: /^function genFromTemplate\(/,
  genBossArena: /^function genBossArena\(/, _enterBossArena: /^function _enterBossArena\(/, nextStage: /^function nextStage\(/, hurtE: /^function hurtE\(/,
  mkEn: /^function mkEn\(/, _showClearResult: /^function _showClearResult\(/,
})) FN[k] = lineOf(re);
const LN = {
  summonHoleBlock: lineOf(/h\._spawnTotal==null/), regionsConst: lineOf(/^const _REG_CLEAR_RATIO/), gateOpenBlock: lineOf(/지옥문 개방: 4지역 전부 클리어/),
  exitStepBlock: lineOf(/^\s*if\(!G\.stageCleared&&G\.exits\.length>0&&G\._bossLoadPhase<=0\)/), bossDeathExit: lineOf(/보스 아레나 출구 생성 \(벽에 문 뚫기\)/),
  bossLoadMachine: lineOf(/_bossLoadPhase===1/), guardKill: lineOf(/문지기 사망 → 게이트 해방 연출/), bossGateCol: lineOf(/boss_gate_col'\)\}\)|type:'boss_gate_col'/),
  stageClearStep: lineOf(/보스 아레나에서 출구 밟음 → 스테이지 클리어/),
};

const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--mute-audio'] });

// ───── 브라우저 안 드라이버 ─────
const driver = async (opts) => {
  window._btFramePause = true; if (window._parryLesson) window._parryLesson.seen = true; if (window._systemLesson) window._systemLesson.closed = true;
  G._cutsceneDone = true; if (!P) P = mkP(); G.stage = 0; initStage(0); G.on = true; G.paused = false;
  const TT = T, log = [], notes = {}; const mk = { total: 0, by: {} }; const _mkEn0 = mkEn; mkEn = function () { mk.total++; const st = String((new Error().stack || '').split(String.fromCharCode(10))[2] || '').trim().slice(0, 70); mk.by[st] = (mk.by[st] || 0) + 1; return _mkEn0.apply(this, arguments); }; notes.mk = mk; const rk = { calls: 0, dup: 0, dupBy: {} }; const rkSeen = new WeakSet(); const _rk0 = _regKill; _regKill = function (e) { rk.calls++; if (rkSeen.has(e)) { rk.dup++; const st = String((new Error().stack || '').split(String.fromCharCode(10))[2] || '').trim().slice(0, 60); rk.dupBy[st] = (rk.dupBy[st] || 0) + 1; } rkSeen.add(e); return _rk0.apply(this, arguments); }; notes.rk = rk;
  const clone2 = m => { const a = new Uint8Array(G.mw * G.mh); for (let y = 0; y < G.mh; y++) { const r = m[y]; for (let x = 0; x < G.mw; x++) a[y * G.mw + x] = r[x]; } return a; };
  let prevMap = clone2(G.map), prevW = G.mw, prevH = G.mh;
  const baseMap = prevMap.slice(); // 던전 초기 지형
  let frame0 = _gameFrame;
  const F = () => _gameFrame - frame0;
  const sn = () => ({
    reg: G._regions ? G._regions.map(r => ({ k: r.kills, t: r.total, c: !!r.cleared })) : null,
    gg: !!G._gateGuardKilled, ggAlive: !!G._gateGuard, fbAlive: _fbAliveCount(), fbDone: !!G._fbDone,
    unl: !!G._bossUnlocked, holes: G.spawnHoles.length, ph: G._bossLoadPhase || 0, arena: !!G._bossArena, bossAlive: !!G.bossAlive,
    scl: !!G.stageCleared, exits: G.exits.length, stage: G.stage, gateOpen: !!G.bossGateOpen,
  });
  let prev = sn();
  const holeTrig = new Set(), holeSeen = new Set();
  let holeObjs = G.spawnHoles.slice();
  const ev = (name, extra = {}, tiles) => {
    const e = { frame: F(), sec: +(F() / 60).toFixed(2), event: name, ...extra };
    if (tiles) e.tilesChanged = tiles; log.push(e); return e;
  };
  const diffMap = () => {
    const w = G.mw, h = G.mh;
    if (w !== prevW || h !== prevH) { prevMap = clone2(G.map); prevW = w; prevH = h; return { replaced: true, w, h }; }
    const ch = [];
    for (let y = 0; y < h; y++) { const r = G.map[y]; for (let x = 0; x < w; x++) { const v = r[x], o = prevMap[y * w + x]; if (v !== o) { ch.push([x, y, o, v]); prevMap[y * w + x] = v; } } }
    return ch;
  };
  const step = () => {
    P.hp = P.mhp; P.iframes = 999;
    update();
    const cur = sn();
    // 사건 비교
    if (cur.reg && prev.reg) for (let i = 0; i < 4; i++) if (cur.reg[i].c && !prev.reg[i].c) ev('regionCleared', { index: i, kills: cur.reg[i].k, total: cur.reg[i].t, ratio: +(cur.reg[i].t ? cur.reg[i].k / cur.reg[i].t + ((cur.gg && i === G._regGateIdx) ? .1 : 0) : 1).toFixed(3), cleared: cur.reg.filter(r => r.c).length });
    if (cur.gg && !prev.gg) ev('gateGuardKilled', { regGateIdx: G._regGateIdx });
    if (cur.fbAlive < prev.fbAlive) ev('anglerKilled', { alive: cur.fbAlive });
    if (cur.fbDone && !prev.fbDone) ev('fbDone');
    if (cur.unl && !prev.unl) ev('bossUnlocked', { regionsCleared: cur.reg ? cur.reg.filter(r => r.c).length : null, fbDone: cur.fbDone });
    if (cur.gateOpen !== prev.gateOpen) ev('bossGateOpenFlag', { value: cur.gateOpen });
    if (cur.holes < prev.holes) for (const h of holeObjs) if (!G.spawnHoles.includes(h) && !holeSeen.has(h)) { holeSeen.add(h); ev('spawnHoleRemoved', { tx: ~~(h.x / TT), ty: ~~(h.y / TT), size: +h.size.toFixed(2), spawned: h._spawned, total: h._spawnTotal }); }
    for (const h of G.spawnHoles) if (h._triggered && !holeTrig.has(h)) { holeTrig.add(h); ev('spawnHoleTriggered', { tx: ~~(h.x / TT), ty: ~~(h.y / TT), size: +h.size.toFixed(2), total: h._spawnTotal != null ? h._spawnTotal : _spawnHoleCount(h.size, 0) }); }
    if (cur.ph !== prev.ph) ev('bossLoadPhase', { phase: cur.ph });
    if (cur.arena && !prev.arena) ev('bossArenaEntered');
    if (!cur.bossAlive && prev.bossAlive) ev('bossAlive=false');
    if (cur.exits !== prev.exits) ev('exitsChanged', { count: cur.exits, list: G.exits.map(e => [e.x, e.y]) });
    if (cur.scl && !prev.scl) ev('stageCleared');
    // 타일 변화는 5프레임마다 + 사건 프레임
    if (F() % 5 === 0 || cur.arena !== prev.arena || cur.bossAlive !== prev.bossAlive || cur.unl !== prev.unl || cur.ph !== prev.ph) {
      const ch = diffMap();
      if (ch.replaced) ev('mapReplaced', { w: ch.w, h: ch.h });
      else if (ch.length) ev('tilesChanged', { count: ch.length }, ch);
    }
    prev = cur;
  };
  const stepN = n => { for (let i = 0; i < n; i++) step(); };
  const tele = (tx, ty) => { P.x = (tx + .5) * TT; P.y = (ty + .5) * TT; P.vx = 0; P.vy = 0; };
  const killNormal = () => { let n = 0; for (const e of ens.slice()) if (e && e.alive && !e.ib && !e._isGateGuard) { try { hurtE(e, 1e9, 0, true); } catch (x) { notes.hurtErr = String(x).slice(0, 120); } if (e.alive) { notes.stubborn = (notes.stubborn || 0) + 1; if (!notes.stubbornSample) notes.stubbornSample = []; if (notes.stubbornSample.length < 6) notes.stubbornSample.push({ etype: e.etype, s: e.s, hp: e.hp, dt: e._deathT, rv: e._reviveTimer, sp: e._spawnIn, ph: e.phase, inv: e.invuln }); } n++; } return n; };
  const aliveNormal = () => ens.filter(e => e && e.alive && !e.ib && !e._isGateGuard).length;

  // ── 0. 초기 상태 ──
  const init = {
    regions: G._regions.map(r => ({ id: r.id, name: r.nameKo, total: r.total, fbIdx: r.fbIdx, x0: r.x0, y0: r.y0, x1: r.x1, y1: r.y1 })),
    regGateIdx: G._regGateIdx, regMid: [G._regMidX, G._regMidY], bossUnlocked: !!G._bossUnlocked, bossAlive: !!G.bossAlive, bossGateOpen: !!G.bossGateOpen,
    holes: G.spawnHoles.map(h => ({ tx: ~~(h.x / TT), ty: ~~(h.y / TT), size: +h.size.toFixed(2), count: _spawnHoleCount(h.size, 0), region: (h.y / TT < G._regMidY ? 0 : 2) + (h.x / TT < G._regMidX ? 0 : 1) })),
    gateGuard: G._gateGuard ? { tx: +(G._gateGuard.x / TT).toFixed(2), ty: +(G._gateGuard.y / TT).toFixed(2), etype: G._gateGuard.etype, hp: G._gateGuard.mhp, atk: G._gateGuard.atk, r: G._gateGuard.r, elite: G._gateGuard.elite } : null,
    startTile: [~~(P.x / TT), ~~(P.y / TT)], exits: G.exits.map(e => [e.x, e.y]), bossGateTiles: (G.bossGate || []).map(e => [e.x, e.y]), gateY: G._gateY, bossCx: G._bossCx,
    ensCount: ens.filter(e => e.alive).length, mapSize: [G.mw, G.mh],
    mapVals: { exitRow: [99, 100, 101].map(x => G.map[7][x]), gateRow: [98, 99, 100, 101, 102].map(x => G.map[5][x]) },
    fbSpawned: !!G._fbSpawned,
  };
  ev('stageStart');
  stepN(2);
  if (opts && (opts.scenario === 'edgeA' || opts.scenario === 'edgeB')) {
    const R = G._regions, need = (tot, bonus) => { let k = 0; while (tot > 0 && k / tot + bonus < 0.8 - 1e-9) k++; return k; };
    const chk = () => { stepN(16); return R.map(r => !!r.cleared); };
    const killFb = i => { const fb = G._fieldBosses && G._fieldBosses[i]; if (fb) { fb.hitCd = 0; _fmApply(fb, 1e9, true); } };
    const out = { scenario: opts.scenario, totals: R.map(r => r.total), regGateIdx: G._regGateIdx, rows: [] };
    if (opts.scenario === 'edgeA') {
      R[0].kills = R[0].total; let c = chk();
      out.anglerBlock = { region: 0, kills: R[0].total, total: R[0].total, anglerAlive: true, cleared: c[0] };
      killFb(R[0].fbIdx); c = chk(); out.anglerBlock.clearedAfterAnglerDead = c[0];
      for (let i = 0; i < 4; i++) killFb(R[i].fbIdx);
      for (let i = 1; i < 4; i++) {
        const n = need(R[i].total, 0); R[i].kills = n - 1; let c1 = chk(); const a = c1[i]; R[i].kills = n; c1 = chk();
        out.rows.push({ region: i, total: R[i].total, killsMinus1: n - 1, clearedAtMinus1: a, kills: n, ratio: +(n / R[i].total).toFixed(4), clearedAtN: c1[i] });
      }
      out.fbDone = !!G._fbDone; out.regionsCleared = R.filter(r => r.cleared).length;
    } else {
      const gg = G._gateGuard; if (gg) hurtE(gg, 1e9, 0, true); stepN(2);
      out.guardKilled = !!G._gateGuardKilled;
      for (let i = 0; i < 4; i++) killFb(R[i].fbIdx);
      stepN(2);
      const nb = need(R[1].total, 0.1), n0 = need(R[1].total, 0);
      R[1].kills = nb - 1; let c = chk(); const a = c[1]; R[1].kills = nb; c = chk();
      out.rows.push({ region: 1, bonus: 0.1, total: R[1].total, killsMinus1: nb - 1, clearedAtMinus1: a, kills: nb, ratioWithBonus: +(nb / R[1].total + 0.1).toFixed(4), clearedAtN: c[1], killsNeededWithoutBonus: n0 });
      const nz = need(R[0].total, 0), nzb = need(R[0].total, 0.1); R[0].kills = nzb;
      c = chk(); out.rows.push({ region: 0, bonus: 0, total: R[0].total, kills: nzb, note: 'guard bonus does not apply outside regGateIdx', killsNeededWithoutBonus: nz, clearedAtKills: c[0] });
    }
    return { init, log, notes, edge: out, totalFrames: F() };
  }
  init.fbSpawnedAfter2 = !!G._fbSpawned; init.fbSites = (G._fieldBosses || []).map(f => [~~(f.x / TT), ~~(f.y / TT), f.hp, f.r]);

  // ── 1. 진행 전 출구 시험(봉인 확인) ──
  tele(100, 7); const bf0 = F(); stepN(70);
  notes.exitBlockedAtStart = { stood: [100, 7], frames: F() - bf0, bossLoadPhase: G._bossLoadPhase || 0, unlocked: !!G._bossUnlocked, arena: !!G._bossArena };
  tele(init.startTile[0], init.startTile[1]);

  // ── 2. 소환굴 순회 ──
  const holesOrder = G.spawnHoles.slice();
  let hi = 0;
  for (const h of holesOrder) {
    hi++;
    if (!G.spawnHoles.includes(h)) continue;
    tele(~~(h.x / TT), ~~(h.y / TT));
    let f = 0;
    while (G.spawnHoles.includes(h) && f < 3000) { step(); f++; if (f % 20 === 0) killNormal(); }
    notes['hole' + hi] = { frames: f, removed: !G.spawnHoles.includes(h) };
    killNormal();
  }
  for (let i = 0; i < 6 && aliveNormal(); i++) { killNormal(); stepN(3); }
  ev('holesPhaseDone', { alive: aliveNormal(), killsTotal: G.kills, stageKills: G._stageKills, regionKills: G._regions.map(r => r.kills) });

  // ── 3. 문지기 처치 ──
  const gg = G._gateGuard;
  if (gg) { tele(~~(gg.x / TT), ~~(gg.y / TT) + 2); let f = 0; while (G._gateGuard && f < 600) { hurtE(gg, 1e9, 0, true); step(); f++; } notes.gateGuardFrames = f; killNormal(); stepN(3); }
  notes.afterGuard = { regions: G._regions.map(r => ({ k: r.kills, t: r.total, c: r.cleared })), fbDone: !!G._fbDone, unlocked: !!G._bossUnlocked };

  // ── 4. 출구 시험 2: 지역 N/4 상태에서 앵글러 생존 + 출구 밟기 ──
  tele(100, 7); const bf1 = F(); stepN(70);
  notes.exitBlockedBeforeAnglers = { regionsCleared: G._regions.filter(r => r.cleared).length, bossLoadPhase: G._bossLoadPhase || 0, unlocked: !!G._bossUnlocked, arena: !!G._bossArena, frames: F() - bf1 };

  // ── 5. 앵글러 4마리 ──
  const fbs = (G._fieldBosses || []).slice();
  for (let k = 0; k < fbs.length; k++) {
    const fb = fbs[k]; if (!fb) continue;
    tele(Math.max(2, ~~(fb.x / TT) - 8), ~~(fb.y / TT)); // 1000px(=약 31타일) 이내
    let f = 0; while (fb.asleep && f < 120) { step(); f++; }
    f = 0; while ((fb.hid || fb.tpT > 0) && f < 400) { step(); f++; }
    fb.hitCd = 0; _fmApply(fb, 1e9, true);
    stepN(2);
    notes['angler' + k] = { hp: fb.hp, wokeFrames: f, regionIdxOfSite: _regionIdxAt(fb.homeX, fb.homeY) };
    killNormal();
  }
  // 개방 판정(30프레임 주기) 대기
  let w = 0; while (!G._bossUnlocked && w < 200) { step(); w++; }
  notes.unlockWait = w;
  notes.afterAnglers = { regions: G._regions.map(r => ({ k: r.kills, t: r.total, c: r.cleared })), fbDone: !!G._fbDone, unlocked: !!G._bossUnlocked, bossGateOpenFlag: !!G.bossGateOpen };
  const dungeonMapChanged = (() => { const ch = []; for (let y = 0; y < G.mh; y++) for (let x = 0; x < G.mw; x++) if (G.map[y][x] !== baseMap[y * G.mw + x]) ch.push([x, y, baseMap[y * G.mw + x], G.map[y][x]]); return ch; })();
  notes.dungeonMapChangedTiles = dungeonMapChanged.length;
  notes.bossGateTileValuesAfterUnlock = [99, 100, 101].map(x => G.map[5][x]);
  notes.exitTileValuesAfterUnlock = [99, 100, 101].map(x => G.map[7][x]);

  // ── 6. 보스 아레나 진입 ──
  const dungeonSnap = { stage: G.stage, mw: G.mw, mh: G.mh, bossAlive: !!G.bossAlive };
  tele(100, 7);
  const exitStepFrame = F(); let f6 = 0; while (!G._bossArena && f6 < 600) { step(); f6++; }
  notes.arenaEnterFrames = f6; notes.exitStepFrame = exitStepFrame;
  let arena = null;
  if (G._bossArena) {
    stepN(2);
    const boss = findBoss();
    const walk = []; for (let ty = 0; ty < G.mh; ty++) { let s = ''; for (let tx = 0; tx < G.mw; tx++) s += isW((tx + .5) * TT, (ty + .5) * TT, true) ? '1' : '0'; walk.push(s); }
    const hashS = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; };
    const rowsMap = G.map.map(r => r.join('')).join('|');
    const val = {}; for (let y = 0; y < G.mh; y++) for (let x = 0; x < G.mw; x++) val[G.map[y][x]] = (val[G.map[y][x]] || 0) + 1;
    arena = {
      mw: G.mw, mh: G.mh, rooms: G.rooms.map(r => ({ type: r.type, x: r.x, y: r.y, w: r.w, h: r.h, cx: r.cx, cy: r.cy })),
      entry: G._bossArenaEntry ? [G._bossArenaEntry.x, G._bossArenaEntry.y] : null, exit: G._bossArenaExit ? [G._bossArenaExit.x, G._bossArenaExit.y] : null,
      playerTile: [~~(P.x / TT), ~~(P.y / TT)], playerPx: [Math.round(P.x), Math.round(P.y)],
      boss: boss ? { tx: ~~(boss.x / TT), ty: ~~(boss.y / TT), px: [Math.round(boss.x), Math.round(boss.y)], etype: boss.etype, hp: boss.mhp, r: boss.r, stunned: boss.stunned, reviveIframes: boss.reviveIframes } : null,
      exitsAtEntry: G.exits.map(e => [e.x, e.y]), bossSealed: !!G.bossSealed, tileValueCounts: val,
      exitColumnValues: (() => { const ex = G._bossArenaExit; if (!ex) return null; const o = {}; for (let y = Math.max(0, ex.y - 1); y <= ex.y + 3; y++) o[y] = [ex.x - 2, ex.x - 1, ex.x, ex.x + 1, ex.x + 2].map(x => G.map[y][x]); return o; })(),
      mapHash: hashS(rowsMap), walkHash: hashS(walk.join('|')), walkRows: walk,
      ensAtEntry: ens.filter(e => e.alive).length, bossAlive: !!G.bossAlive,
    };
    // 로딩 연출 끝(phase 0)까지
    let f = 0; while ((G._bossLoadPhase || 0) > 0 && f < 600) { step(); f++; }
    arena.loadDoneAfterEntry = f;
  }

  if (opts && opts.scenario === 'retry' && G._bossArena) {
    const pre = { unlocked: !!G._bossUnlocked, exits: G.exits.length };
    P.hp = 0; P.s = 'dead'; const exp0 = P.exp;
    const b = document.getElementById('retryBtn'); await b.onclick();
    stepN(3);
    const bx = G.rooms.find(r => r.type === 'boss');
    return { init, log, notes, arena, retry: { pre, bossArena: !!G._bossArena, mw: G.mw, mh: G.mh, playerTile: [~~(P.x / TT), ~~(P.y / TT)], playerPx: [Math.round(P.x), Math.round(P.y)], bossAlive: !!G.bossAlive, unlocked: !!G._bossUnlocked, exits: G.exits.map(e => [e.x, e.y]), spawnHoles: G.spawnHoles.length, bossRoomType: bx ? bx.type : null, aliveEns: ens.filter(e => e.alive).length, bossLoadPhase: G._bossLoadPhase || 0, expBefore: exp0, expAfter: P.exp, expectTile: [G._bossCx, G._gateY + 6] }, totalFrames: F() };
  }
  // ── 7. 보스 처치 → 출구 뚫림 → 스테이지 클리어 ──
  let bossKill = null;
  if (G._bossArena) {
    const start = F(); let guard = 0, deaths = 0;
    while (G.bossAlive && guard < 4000) {
      const b = findBoss(); if (b && b.alive) { b.stunned = 0; b.hp = Math.min(b.hp, 1); hurtE(b, 1e9, 0, true); deaths++; }
      stepN(5); guard += 5;
    }
    // 개방 판정 주기 대기
    let w2 = 0; while (G.exits.length === 0 && w2 < 120) { step(); w2++; }
    bossKill = {
      frames: F() - start, hurtCalls: deaths, bossAlive: !!G.bossAlive, exits: G.exits.map(e => [e.x, e.y]),
      exitTileValues: G._bossArenaExit ? [-1, 0, 1].map(d => G.map[G._bossArenaExit.y][G._bossArenaExit.x + d]) : null,
      chest: (typeof worldItems !== 'undefined' && Array.isArray(worldItems)) ? worldItems.filter(i => i && i.type === 'chest').map(i => [~~(i.x / TT), ~~(i.y / TT)]) : null,
    };
    // 출구 타일 밟기
    const ex = G._bossArenaExit; let clearFrames = null;
    if (ex) { tele(ex.x, ex.y); const c0 = F(); let f = 0; while (!G.stageCleared && f < 120) { step(); f++; } clearFrames = F() - c0; bossKill.stageClearedAfterStep = !!G.stageCleared; bossKill.stageClearFrames = clearFrames; bossKill.playerAtClear = [~~(P.x / TT), ~~(P.y / TT)]; }
  }

  // ── 8. 다음 스테이지 ──
  let next = null;
  if (G.stageCleared) {
    try {
      nextStage();
      for (let i = 0; i < 30 && !G.on; i++) { await new Promise(r => setTimeout(r, 50)); }
      next = { demoMode: _DEMO_MODE, demoEndDisplay: document.getElementById('demoEnd') ? document.getElementById('demoEnd').style.display : null, stage: G.stage, mw: G.mw, mh: G.mh, playerTile: [~~(P.x / TT), ~~(P.y / TT)], on: !!G.on, bossArena: !!G._bossArena, exits: G.exits.length };
    } catch (x) { next = { error: String(x).slice(0, 200) }; }
  }
  return { init, log, notes, arena, bossKill, next, dungeonSnap, dungeonMapChanged: dungeonMapChanged.slice(0, 50), totalFrames: F() };
};

const runs = [];
const PLAN = [...Array.from({ length: RUNS }, () => ({ scenario: 'main', target: 'demo(default)' })), { scenario: 'main', target: 'full' }, { scenario: 'retry', target: 'demo(default)' }, { scenario: 'edgeA', target: 'demo(default)' }, { scenario: 'edgeB', target: 'demo(default)' }];
for (let r = 0; r < PLAN.length; r++) {
  const { scenario, target } = PLAN[r];
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.setDefaultTimeout(0);
  if (target === 'full') await page.route('**/build-target.js*', route => route.fulfill({ status: 200, contentType: 'application/javascript; charset=utf-8', body: "window.EXODUSER_BUILD_TARGET='full';" }));
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/game.html*', route => route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: gameBlob }));
  await page.route('**/maps_data.js*', route => route.fulfill({ status: 200, contentType: 'application/javascript; charset=utf-8', body: mapsBlob }));
  await page.goto(BASE + '/game.html?tutorial=0', { waitUntil: 'commit', timeout: 30000 });
  await page.waitForFunction(() => typeof G !== 'undefined' && G && typeof initStage === 'function' && typeof isW === 'function', null, { timeout: 60000, polling: 200 });
  await page.waitForTimeout(2500);
  const t0 = Date.now();
  const d = await page.evaluate(driver, { scenario });
  d.target = target; d.scenario = scenario; d.wallSec = +((Date.now() - t0) / 1000).toFixed(1); d.pageErrors = errs.slice(0, 5);
  // 정적 상수
  d.consts = await page.evaluate(() => ({ REG_CLEAR_RATIO: _REG_CLEAR_RATIO, FB_COUNT: _FB_COUNT, FB_WAKE: _FB_WAKE, FB_SITES: _FB_SITES, REG_FB_TO_REG: _REG_FB_TO_REG, SPAWN_HOLE_CNT: SPAWN_HOLE.cnt, REG_CH1_KO: _REG_CH1_KO, MINE: typeof _FB_HP_MUL !== 'undefined' ? _FB_HP_MUL : null }));
  runs.push(d); console.log('run', r, scenario, target, 'frames', d.totalFrames, 'wall', d.wallSec, 's events', d.log.length, 'errs', d.pageErrors.length);
  await page.close();
}
await browser.close();
fs.writeFileSync(path.join(OUT, '_progress_raw.json'), JSON.stringify({ refSha, FN, LN, runs }));
console.log('raw written');
