// RM-4 P0: 웹 1-4(si=3, 기생수의 둥지) 걷기·방·스폰 정답 추출. C04-ORACLE extract.mjs(claude/unity-pc-c04-oracle-20261027)를 si 인자로 넓힌 것.
// 원본 = origin/main 커밋본 game.html·maps_data.js (Playwright route로 끼워 넣는다. 디스크 미커밋 수정은 쓰지 않는다). 서버(3333)는 정적 서빙용으로만 쓴다.
// 사용: node tools/rm4/extract.mjs [--si 3] [--runs 5] [--out unity/Assets/Exoduser/Remodel/CH1_4/Data] [--main-repo G:/exoduser] [--ref origin/main]
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import zlib from 'zlib';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const here = path.dirname(fileURLToPath(import.meta.url));
const SI = +arg('si', 3);
const TAG = 'ch1_' + (SI + 1);
const OUT = path.resolve(arg('out', path.join(here, '../../unity/Assets/Exoduser/Remodel/CH1_' + (SI + 1) + '/Data')));
const PNG_OUT = path.resolve(arg('png-out', 'I:/EXODUSER-Storage/rm' + (SI + 1)));
const RUNS = +arg('runs', 5);
const MAIN = arg('main-repo', 'G:/exoduser');
const REF = arg('ref', 'origin/main');
const BASE = arg('base', 'http://127.0.0.1:3333');
const CHROME = arg('chrome', 'C:/Program Files/Google/Chrome/Application/chrome.exe');
const { chromium } = createRequire(path.join(MAIN, 'package.json'))('playwright');
const sha256 = b => crypto.createHash('sha256').update(b).digest('hex');
const GIT = arg('git', 'C:/Program Files/Git/mingw64/bin/git.exe');
const git = (...a) => execFileSync(GIT, ['-C', MAIN, ...a], { maxBuffer: 256 * 1024 * 1024 });
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(PNG_OUT, { recursive: true });

const gameBlob = git('show', `${REF}:game.html`);
const mapsBlob = git('show', `${REF}:maps_data.js`);
const refSha = git('rev-parse', REF).toString().trim();
const gameLines = gameBlob.toString('utf8').split('\n');
const lineOf = re => { const i = gameLines.findIndex(l => re.test(l)); return i < 0 ? null : i + 1; };

const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--mute-audio'] });
const log = (...a) => console.error(new Date().toISOString().slice(11, 19), ...a);

const inPage = (si) => {
  G._cutsceneDone = true; if (!P) P = mkP(); G.stage = si; initStage(si);
  // si≠0은 initMapObjects(소품·충돌물)가 initStage 안이 아니라 게임 루프의 _bgInitQueue에서 돈다(RM-3 확인). 첫 프레임들과 같은 상태로 큐를 비운다.
  const bgBefore = { done: _bgInitDone, idx: _bgInitIdx, n: _bgInitQueue.length, objs: MAP_OBJS.length };
  if (!_bgInitDone) _tickBgInit(9999);
  const bgAfter = { done: _bgInitDone, idx: _bgInitIdx, objs: MAP_OBJS.length };
  _ensureColObjs();
  const N = G.mw, M = G.mh, TT = T;
  const walk = new Array(N * M), tileOnly = new Array(N * M), partial = [];
  const OFF = [[-10, -10], [10, -10], [-10, 10], [10, 10]];
  // 가속: 실제 isW를 그대로 부르되, CELL×CELL 타일 칸마다 그 칸(+샘플 여유 10px)에 닿을 수 있는 충돌 오브젝트만 _colObjs에 잠시 남긴다.
  // 닿지 않는 오브젝트는 isW에서 true를 낼 수 없으므로 판정 결과는 전체 목록과 같다. _ensureColObjs는 MAP_OBJS 참조·길이만 보므로 재구성되지 않는다.
  const ALL = _colObjs.slice(), CELL = 4, PAD = 12;
  const reach = o => { const pm = _OBJ_META[o.type] || {}; return o._colRect ? Math.hypot(o._colW, o._colH) : (o._colW ? Math.max(o._colW, o._colH + Math.abs(pm.colOy || 0)) : o._colSz) + 1; };
  const objR = ALL.map(reach);
  try {
    for (let cy0 = 0; cy0 < M; cy0 += CELL) for (let cx0 = 0; cx0 < N; cx0 += CELL) {
      const x0 = cx0 * TT - PAD, x1 = (cx0 + CELL) * TT + PAD, y0 = cy0 * TT - PAD, y1 = (cy0 + CELL) * TT + PAD;
      _colObjs.length = 0;
      for (let k = 0; k < ALL.length; k++) { const o = ALL[k], r = objR[k]; if (o.x + r >= x0 && o.x - r <= x1 && o.y + r >= y0 && o.y - r <= y1) _colObjs.push(o); }
      for (let ty = cy0; ty < Math.min(M, cy0 + CELL); ty++) for (let tx = cx0; tx < Math.min(N, cx0 + CELL); tx++) {
        const cx = tx * TT + TT / 2, cy = ty * TT + TT / 2;
        const c = isW(cx, cy, true) ? 1 : 0; walk[ty * N + tx] = c;
        tileOnly[ty * N + tx] = G.map[ty][tx] === 1 ? 1 : 0;
        let mask = 0; for (let k = 0; k < 4; k++) if ((isW(cx + OFF[k][0], cy + OFF[k][1], true) ? 1 : 0) !== c) mask |= 1 << k;
        if (mask) partial.push([tx, ty, c, mask]);
      }
    }
  } finally { _colObjs.length = 0; for (const o of ALL) _colObjs.push(o); }
  // 가속 검산: 무작위 2000점을 전체 목록 isW와 비교(불일치 0이어야 함)
  let accelMismatch = 0; { let s = 12345; const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    for (let k = 0; k < 2000; k++) { const tx = ~~(rnd() * N), ty = ~~(rnd() * M); const c = isW(tx * TT + TT / 2, ty * TT + TT / 2, true) ? 1 : 0; if (c !== walk[ty * N + tx]) accelMismatch++; } }
  const vals = {}; for (let ty = 0; ty < M; ty++) for (let tx = 0; tx < N; tx++) { const v = G.map[ty][tx]; vals[v] = (vals[v] || 0) + 1; }
  const m = G.map.map(r => r.join('')).join('|');
  const tmpl = _cloneField11(si);
  const roomOf = (tx, ty) => { for (let i = 0; i < G.rooms.length; i++) { const r = G.rooms[i]; if (tx >= r.x && tx < r.x + r.w && ty >= r.y && ty < r.y + r.h) return i; } return -1; };
  const ptx = ~~(P.x / TT), pty = ~~(P.y / TT);
  // 충돌 오브젝트 형상(웹 isW 순서 그대로): rect(회전) / ellipse(colW·colH·colOy) / circle(colSz)
  const col = _colObjs.filter(o => !o.noCol).map(o => {
    const pm = _OBJ_META[o.type] || {};
    if (o._colRect) return { type: o.type, shape: 'rect', x: Math.round(o.x), y: Math.round(o.y), hw: +o._colW.toFixed(1), hh: +o._colH.toFixed(1), rot: +(o._colRot || 0).toFixed(4) };
    if (o._colW) return { type: o.type, shape: 'ellipse', x: Math.round(o.x), y: Math.round(o.y), rx: +o._colW.toFixed(1), ry: +o._colH.toFixed(1), oy: pm.colOy || 0 };
    return { type: o.type, shape: 'circle', x: Math.round(o.x), y: Math.round(o.y), r: +o._colSz.toFixed(1) };
  });
  return {
    N, M, T: TT, walk, tileOnly, partial, mapVals: vals, mapType: G.mapType, accelMismatch, colObjCount: ALL.length, bgInit: { before: bgBefore, after: bgAfter },
    tileHash: sha(m), tmplRooms: tmpl.rooms, tmplSpawnHoles: tmpl.spawnHoles, tmplCorridorSpawns: tmpl.corridorSpawns, tmplFeatures: tmpl.features, tmplCorridors: tmpl.corridors,
    gRooms: G.rooms.map((r, i) => ({ i, type: r.type, x: r.x, y: r.y, w: r.w, h: r.h, cx: r.cx, cy: r.cy })),
    start: [ptx, pty], playerPx: [Math.round(P.x), Math.round(P.y)],
    exits: G.exits.map(e => [e.x, e.y]), exitTileValues: G.exits.map(e => G.map[e.y][e.x]),
    bossGate: (G.bossGate || []).map(e => [e.x, e.y]), gateY: G._gateY, bossCx: G._bossCx, bossCy: G._bossCy,
    holes: G.spawnHoles.map(s => ({ tx: ~~(s.x / TT), ty: ~~(s.y / TT), px: [Math.round(s.x), Math.round(s.y)], size: +s.size.toFixed(3), room: s.room, geomRoom: roomOf(~~(s.x / TT), ~~(s.y / TT)), blocked: isW(s.x, s.y, true) ? 1 : 0 })),
    ens: ens.map(e => ({ tx: ~~(e.x / TT), ty: ~~(e.y / TT), px: [Math.round(e.x), Math.round(e.y)], etype: e.etype, elite: e.elite ? 1 : 0, lv: e.lv, r: e.r, hp: e.mhp, geomRoom: roomOf(~~(e.x / TT), ~~(e.y / TT)), blocked: isW(e.x, e.y, true) ? 1 : 0 })),
    mapObjs: MAP_OBJS.map(o => { const pm = _OBJ_META[o.type] || {}; return { type: o.type, x: Math.round(o.x), y: Math.round(o.y), scale: o.scale || 1, noCol: o.noCol ? 1 : 0, col: (pm.collision || pm.col) ? 1 : 0, sz: pm.sz || null }; }),
    colObjs: col, hillActive: !_FDG_RUINED_FOREST_FIRST && G.stage === 0,
    hell: SI_TO_HELL[si], floor: SI_TO_FLOOR[si], gKeysBoss: Object.keys(G).filter(k => /boss|gate|arena/i.test(k)),
  };
  function sha(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }
};

const runs = [];
for (let r = 0; r < RUNS; r++) {
  log('run', r, 'newPage'); const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/game.html*', route => route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: gameBlob }));
  await page.route('**/maps_data.js*', route => route.fulfill({ status: 200, contentType: 'application/javascript; charset=utf-8', body: mapsBlob }));
  await page.goto(BASE + '/game.html', { waitUntil: 'commit', timeout: 60000 });
  await page.waitForFunction(() => typeof G !== 'undefined' && G && typeof initStage === 'function' && typeof isW === 'function', null, { timeout: 60000, polling: 200 });
  log('run', r, 'loaded'); await page.waitForTimeout(2500);
  // 멈춤 진단(RM-3 방식): 60초 안에 끝나지 않으면 CDP로 호출 스택을 찍고 중단한다(재시도하지 않음).
  const cdp = await page.context().newCDPSession(page); await cdp.send('Debugger.enable');
  const stacks = []; cdp.on('Debugger.paused', ev => { stacks.push(ev.callFrames.slice(0, 12).map(f => f.functionName + '@' + (f.location.lineNumber + 1))); cdp.send('Debugger.resume').catch(() => {}); });
  let hung = true; const wd = setTimeout(async () => { if (!hung) return; await cdp.send('Debugger.pause').catch(() => {}); setTimeout(() => { log('HUNG run', r, JSON.stringify(stacks)); process.exit(2); }, 3000); }, 60000);
  const d = await page.evaluate(inPage, SI); hung = false; clearTimeout(wd);
  d.pageErrors = errs.slice(0, 3); log('run', r, 'evaluated', d.N + 'x' + d.M, 'colObjs', d.colObjCount, 'accelMismatch', d.accelMismatch);
  runs.push(d); await Promise.race([page.close().catch(() => {}), new Promise(res => setTimeout(res, 5000))]);
}
// 이 PC에서 headless Chrome 종료가 멈추는 일이 있어 5초만 기다린다(RM-3·probe3 확인). 남으면 PID를 로그로 남긴다.
const bproc = browser.process && browser.process();
await Promise.race([browser.close().catch(() => {}), new Promise(res => setTimeout(res, 5000))]);
if (bproc && bproc.exitCode === null) { log('browser still alive pid', bproc.pid, '-> kill'); try { bproc.kill('SIGKILL'); } catch {} }

// ---- 결정성 ----
const hashOf = o => sha256(JSON.stringify(o));
const det = {
  runs: RUNS, tileHash: new Set(runs.map(r => r.tileHash)).size === 1, walk: new Set(runs.map(r => hashOf(r.walk))).size === 1,
  partial: new Set(runs.map(r => hashOf(r.partial))).size === 1, colObjs: new Set(runs.map(r => hashOf(r.colObjs))).size === 1,
  mapObjs: new Set(runs.map(r => hashOf(r.mapObjs))).size === 1,
  spawnHolePositions: new Set(runs.map(r => hashOf(r.holes.map(h => [h.tx, h.ty, h.size])))).size === 1,
  exits: new Set(runs.map(r => hashOf(r.exits))).size === 1, start: new Set(runs.map(r => hashOf(r.start))).size === 1,
};
const R = runs[0], N = R.N, M = R.M;
// 실행마다 걷기가 다르면: 모든 실행에서 걷기 = 확정 걷기, 하나라도 막힘 = 변동 칸
const varTiles = []; for (let i = 0; i < N * M; i++) { const s = new Set(runs.map(r => r.walk[i])); if (s.size > 1) varTiles.push([i % N, (i / N) | 0, runs.map(r => r.walk[i]).join('')]); }

// ---- BFS (run0, 타일 중심 4방향) ----
const bfs = (walkArr, sx, sy) => {
  const dist = new Int32Array(N * M).fill(-1); const q = [sy * N + sx]; dist[sy * N + sx] = 0;
  for (let h = 0; h < q.length; h++) { const c = q[h], x = c % N, y = (c / N) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= M) continue; const ni = ny * N + nx; if (dist[ni] >= 0 || walkArr[ni]) continue; dist[ni] = dist[c] + 1; q.push(ni); } }
  return dist;
};
const [sx, sy] = R.start; const dist = bfs(R.walk, sx, sy);
const exitInfo = R.exits.map(([x, y]) => ({ tile: [x, y], centerBlocked: R.walk[y * N + x], reached: dist[y * N + x] >= 0, dist: dist[y * N + x],
  adjacentReached: [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && ny >= 0 && nx < N && ny < M && dist[ny * N + nx] >= 0; }) }));
const gateInfo = R.bossGate.map(([x, y]) => ({ tile: [x, y], centerBlocked: R.walk[y * N + x], reached: dist[y * N + x] >= 0, dist: dist[y * N + x] }));
const comps = (pred) => { const seen = new Uint8Array(N * M), out = []; for (let i = 0; i < N * M; i++) { if (!pred(i) || seen[i]) continue; const comp = [i]; seen[i] = 1; for (let h = 0; h < comp.length; h++) { const c = comp[h], x = c % N, y = (c / N) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= M) continue; const ni = ny * N + nx; if (seen[ni] || !pred(ni)) continue; seen[ni] = 1; comp.push(ni); } } let x0 = N, y0 = M, x1 = 0, y1 = 0; for (const c of comp) { const x = c % N, y = (c / N) | 0; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } out.push({ size: comp.length, bbox: [x0, y0, x1, y1], first: [comp[0] % N, (comp[0] / N) | 0] }); } return out.sort((a, b) => b.size - a.size); };
const islands = comps(i => !R.walk[i] && dist[i] < 0);
// 막힘 성분 중 지도 가장자리에 닿지 않는 것 = 걷기 영역 안 막힘 섬(P1 '보이지 않는 벽 0' 대상)
const blockedComps = comps(i => R.walk[i]);
const innerBlocked = blockedComps.filter(c => c.bbox[0] > 0 && c.bbox[1] > 0 && c.bbox[2] < N - 1 && c.bbox[3] < M - 1);

// ---- 스폰 ----
const defHoles = [];
for (const sh of R.tmplSpawnHoles || []) defHoles.push({ src: 'tmpl.spawnHoles', tx: sh.x, ty: sh.y, type: sh.type });
for (const rd of R.tmplRooms || []) for (const sp of rd.spawns || []) defHoles.push({ src: 'rooms[' + rd.id + '].spawns', tx: rd.cx + sp.dx, ty: rd.cy + sp.dy, grade: sp.grade, room: rd.id });
for (const cs of R.tmplCorridorSpawns || []) defHoles.push({ src: 'corridorSpawns', tx: cs.x, ty: cs.y, grade: cs.grade });
const rtHoleSet = R.holes.map(h => [h.tx, h.ty]);
for (const d of defHoles) { const best = rtHoleSet.map((h, i) => [Math.hypot(d.tx - h[0], d.ty - h[1]), i]).sort((a, b) => a[0] - b[0])[0]; d.nearestRuntimeHole = best ? { index: best[1], distTiles: +best[0].toFixed(2) } : null; }
const key = e => e.etype + '@' + e.tx + ',' + e.ty;
const fixedKeys = [...new Set(runs[0].ens.map(key))].filter(k => runs.every(r => r.ens.some(e => key(e) === k)));
const perRoomCounts = {};
for (const r of runs) { const c = {}; for (const e of r.ens) c[e.geomRoom] = (c[e.geomRoom] || 0) + 1; for (const k of new Set([...Object.keys(c), ...Object.keys(perRoomCounts)])) (perRoomCounts[k] ||= []).push(c[k] || 0); }
const roomRange = Object.fromEntries(Object.entries(perRoomCounts).map(([k, v]) => [k, { min: Math.min(...v), max: Math.max(...v), perRun: v }]));
const bossRoomIdx = R.gRooms.findIndex(x => x.type === 'boss');
const spawnJson = {
  si: SI, note: `웹 1-${SI + 1} 스폰 정답. holes = 런타임 소환굴(G.spawnHoles). enemies = initStage(${SI}) 직후 ens[] — 고정/무작위 구분. 소환굴 타이머 몬스터는 범위 밖.`,
  holesRuntime: R.holes, holesDefinition: defHoles, holesPerRunIdentical: det.spawnHolePositions, holesPerRun: det.spawnHolePositions ? undefined : runs.map(r => r.holes),
  enemies: { perRun: runs.map(r => r.ens), fixedAcrossAllRuns: fixedKeys.map(k => { const e = runs[0].ens.find(e => key(e) === k); return { etype: e.etype, tx: e.tx, ty: e.ty, px: e.px, geomRoom: e.geomRoom }; }),
    roomCountRange: roomRange, totalRange: [Math.min(...runs.map(r => r.ens.length)), Math.max(...runs.map(r => r.ens.length))],
    bossRoomEtypeSets: runs.map(r => r.ens.filter(e => e.geomRoom === bossRoomIdx).map(e => e.etype).sort((a, b) => a - b)) },
  blocked: { holes: R.holes.filter(h => h.blocked).length, enemiesPerRun: runs.map(r => r.ens.filter(e => e.blocked).length) },
};
const nWalk = R.walk.reduce((a, v) => a + (v ? 0 : 1), 0);
const nTileWalk = R.tileOnly.reduce((a, v) => a + (v ? 0 : 1), 0);
const reached = []; for (let i = 0; i < N * M; i++) if (dist[i] >= 0) reached.push([i % N, (i / N) | 0]);
const reachJson = {
  si: SI, start: R.start, startBlocked: R.walk[sy * N + sx], startPlayerPx: R.playerPx, exits: exitInfo, bossGateTiles: gateInfo, gateY: R.gateY, bossCx: R.bossCx,
  walkableTiles: nWalk, blockedTiles: N * M - nWalk, reachedTiles: reached.length, unreachedWalkableTiles: nWalk - reached.length, islandCount: islands.length, islands: islands.slice(0, 200),
  innerBlockedIslands: { note: '걷기 영역 안 막힘 성분(지도 가장자리에 닿지 않음) — P1 보이지 않는 벽 0 대상', count: innerBlocked.length, list: innerBlocked },
  reached,
};
const rows = a => Array.from({ length: M }, (_, y) => a.slice(y * N, y * N + N).join(''));
fs.writeFileSync(path.join(OUT, TAG + '_walk.json'), JSON.stringify({ si: SI, stage: '1-' + (SI + 1), N, M, tile: R.T, mapType: R.mapType,
  encoding: 'rows[ty] = string of N chars; 0=walkable 1=blocked (isW at tile centre, skipBone)', rows: rows(R.walk),
  tileOnlyRows: { note: 'G.map===1 만(충돌 오브젝트 제외). rows와 다른 칸 = 오브젝트 충돌이 만든 막힘', rows: rows(R.tileOnly), walkable: nTileWalk },
  mapValueCounts: R.mapVals, partial: { note: '[tx,ty,centerBlocked,cornerMask] ±10px', count: R.partial.length, tiles: R.partial },
  counts: { walkable: nWalk, blocked: N * M - nWalk, objectBlockedOnWalkTile: nTileWalk - nWalk },
  variableTiles: { note: '실행마다 걷기 판정이 다른 칸 [tx,ty,runBits]', count: varTiles.length, tiles: varTiles.slice(0, 5000) },
  colObjs: R.colObjs, mapObjCount: R.mapObjs.length, mapObjs: R.mapObjs }));
fs.writeFileSync(path.join(OUT, TAG + '_rooms.json'), JSON.stringify({ si: SI, templateRooms: R.tmplRooms, templateCorridors: R.tmplCorridors, runtimeRooms: R.gRooms, start: R.start, startPlayerPx: R.playerPx,
  exit: { tiles: R.exits, tileValues: R.exitTileValues }, bossGate: { tiles: R.bossGate, gateY: R.gateY, bossCx: R.bossCx, bossCy: R.bossCy }, features: R.tmplFeatures, gKeysBoss: R.gKeysBoss, hell: R.hell, floor: R.floor }, null, 1));
fs.writeFileSync(path.join(OUT, TAG + '_reach.json'), JSON.stringify(reachJson));
fs.writeFileSync(path.join(OUT, TAG + '_spawns.json'), JSON.stringify(spawnJson, null, 1));

// ---- 충돌 오버레이 PNG (4px/tile) → I 드라이브 ----
const S = 4, W = N * S, H = M * S, px = Buffer.alloc(W * H * 3);
const put = (x, y, c) => { if (x < 0 || y < 0 || x >= W || y >= H) return; const o = (y * W + x) * 3; px[o] = c[0]; px[o + 1] = c[1]; px[o + 2] = c[2]; };
const fill = (tx, ty, c) => { for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) put(tx * S + i, ty * S + j, c); };
const partSet = new Set(R.partial.map(p => p[1] * N + p[0]));
for (let y = 0; y < M; y++) for (let x = 0; x < N; x++) {
  const i = y * N + x; let c;
  if (R.walk[i]) c = R.tileOnly[i] ? [18, 14, 14] : [90, 60, 40]; else if (dist[i] >= 0) c = [52, 92, 60]; else c = [150, 40, 130];
  if (partSet.has(i)) c = R.walk[i] ? [170, 100, 20] : [200, 150, 40];
  fill(x, y, c);
}
for (const r of R.gRooms) { for (let x = r.x; x < r.x + r.w; x++) { put(x * S, r.y * S, [60, 160, 200]); put(x * S, (r.y + r.h) * S, [60, 160, 200]); } for (let y = r.y; y < r.y + r.h; y++) { put(r.x * S, y * S, [60, 160, 200]); put((r.x + r.w) * S, y * S, [60, 160, 200]); } }
const dot = (tx, ty, c, rr) => { for (let j = -rr; j <= rr; j++) for (let i = -rr; i <= rr; i++) put(tx * S + 2 + i, ty * S + 2 + j, c); };
for (const h of R.holes) dot(h.tx, h.ty, h.blocked ? [255, 60, 60] : [255, 220, 40], 4);
for (const e of R.ens) dot(e.tx, e.ty, e.blocked ? [255, 60, 60] : [255, 120, 40], 2);
dot(R.start[0], R.start[1], [80, 140, 255], 6);
for (const [x, y] of R.exits) dot(x, y, [255, 255, 255], 3);
for (const [x, y] of R.bossGate) dot(x, y, [230, 230, 120], 2);
const crcT = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc = b => { let c = 0xFFFFFFFF; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
const raw = Buffer.alloc((W * 3 + 1) * H); for (let y = 0; y < H; y++) { raw[y * (W * 3 + 1)] = 0; px.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3); }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
fs.writeFileSync(path.join(PNG_OUT, TAG + '_collision.png'), Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]));

fs.writeFileSync(path.join(OUT, TAG + '_receipt.json'), JSON.stringify({
  extractedAt: new Date().toISOString(), si: SI, mainRef: REF, mainSha: refSha, mainRepo: MAIN,
  gameHtmlSha256: sha256(gameBlob), mapsDataJsSha256: sha256(mapsBlob), usedSource: 'committed blobs via Playwright route',
  functions: { isW: lineOf(/^function isW\(px,py,skipBone\)/), _rebuildColObjs: lineOf(/^function _rebuildColObjs/), _cloneField11: lineOf(/^function _cloneField11/), _MAP_COMPOSE: lineOf(/^const _MAP_COMPOSE=/), initStage: lineOf(/^function initStage/), genFromTemplate: lineOf(/^function genFromTemplate/) },
  bootSequence: `G._cutsceneDone=true; if(!P)P=mkP(); G.stage=${SI}; initStage(${SI}); if(!_bgInitDone)_tickBgInit(9999); 걷기 격자는 4x4 타일 칸별 충돌물 부분집합으로 isW 호출(무작위 2000점 전체목록 검산) — 새 페이지 ${RUNS}회, headless Chrome --mute-audio`,
  bgInit: runs.map(r => r.bgInit), colObjCount: runs.map(r => r.colObjCount), accelMismatch: runs.map(r => r.accelMismatch), determinism: det, variableWalkTiles: varTiles.length, pageErrors: runs.map(r => r.pageErrors), collisionPng: path.join(PNG_OUT, TAG + '_collision.png'),
}, null, 1));

console.log(JSON.stringify({ out: OUT, det, mapType: R.mapType, mapVals: R.mapVals, walkable: nWalk, tileOnlyWalkable: nTileWalk, partial: R.partial.length, varTiles: varTiles.length, reached: reached.length, islands: islands.length, innerBlocked: innerBlocked.length,
  start: R.start, exits: exitInfo, gate: gateInfo, rooms: R.gRooms, holes: R.holes.length, holesBlocked: spawnJson.blocked.holes, ensRange: spawnJson.enemies.totalRange, ensBlocked: spawnJson.blocked.enemiesPerRun,
  fixedEns: spawnJson.enemies.fixedAcrossAllRuns, colObjs: R.colObjs.length, mapObjs: R.mapObjs.length, gKeysBoss: R.gKeysBoss, errs: runs.map(r => r.pageErrors) }, null, 1));
