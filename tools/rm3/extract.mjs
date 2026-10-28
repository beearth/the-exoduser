// RM-3: 웹 1-3(G.stage===2) 정답 데이터 추출. C04-ORACLE extract.mjs(claude/unity-pc-c04-oracle-20261027) 복사본에
// 스테이지 인자·충돌 오브젝트 상세·시드 고정 실행을 더했다.
// 원본 = origin/main 의 game.html(커밋본)·maps_data.js. 작업 트리의 미커밋 수정은 쓰지 않는다
// (Playwright route로 game.html 요청에 커밋본 blob을 끼워 넣는다). 서버(3333)는 정적 서빙용으로만 쓰고 건드리지 않는다.
// 사용: node tools/rm3/extract.mjs [--stage 2] [--out unity/Assets/Exoduser/Remodel/CH1_3/Data] [--png-out I:/EXODUSER-Storage/rm3]
//        [--runs 5] [--seeds 11,22,33] [--main-repo G:/exoduser] [--ref origin/main]
// --seeds: 실행마다 Math.random 을 mulberry32(seed)로 바꿔 무작위 범위를 본다(무시드 runs 와 별도).
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import zlib from 'zlib';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const here = path.dirname(fileURLToPath(import.meta.url));
const STAGE = +arg('stage', 2);
const NAME = 'ch1_' + (STAGE + 1);
const OUT = path.resolve(arg('out', path.join(here, '../../unity/Assets/Exoduser/Remodel/CH1_' + (STAGE + 1) + '/Data')));
const PNG_OUT = path.resolve(arg('png-out', 'I:/EXODUSER-Storage/rm' + (STAGE + 1)));
const RUNS = +arg('runs', 5);
const SEEDS = arg('seeds', '11,22,33').split(',').filter(Boolean).map(Number);
const MAIN = arg('main-repo', 'G:/exoduser');
const REF = arg('ref', 'origin/main');
const BASE = arg('base', 'http://127.0.0.1:3333');
const CHROME = arg('chrome', 'C:/Program Files/Google/Chrome/Application/chrome.exe');
const { chromium } = createRequire(path.join(MAIN, 'package.json'))('playwright');
const sha256 = b => crypto.createHash('sha256').update(b).digest('hex');
const git = (...a) => execFileSync('git', ['-C', MAIN, ...a], { maxBuffer: 256 * 1024 * 1024 });
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(PNG_OUT, { recursive: true });

const gameBlob = git('show', `${REF}:game.html`);
const mapsBlob = git('show', `${REF}:maps_data.js`);
const refSha = git('rev-parse', REF).toString().trim();
const diskGame = fs.readFileSync(path.join(MAIN, 'game.html'));
const diskMaps = fs.readFileSync(path.join(MAIN, 'maps_data.js'));
const gameLines = gameBlob.toString('utf8').split('\n');
const lineOf = re => { const i = gameLines.findIndex(l => re.test(l)); return i < 0 ? null : i + 1; };

const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--mute-audio'] });

// 브라우저 안에서 도는 추출기. 반환값은 JSON 직렬화 가능해야 한다.
const inPage = (STAGE) => {
  G._cutsceneDone = true; if (!P) P = mkP(); G.stage = STAGE; initStage(STAGE);
  // si≠0은 initMapObjects(소품·충돌물)가 initStage 안이 아니라 게임 루프의 _bgInitQueue에서 돈다(initStage 끝, si===0만 즉시).
  // 런타임 첫 프레임들과 같은 상태를 얻으려고 큐를 한 번에 비운다.
  const bgBefore = { done: _bgInitDone, idx: _bgInitIdx, n: _bgInitQueue.length, objs: MAP_OBJS.length };
  if (!_bgInitDone) _tickBgInit(9999);
  const bgAfter = { done: _bgInitDone, idx: _bgInitIdx, objs: MAP_OBJS.length };
  const N = G.mw, M = G.mh, TT = T;
  const walk = new Array(N * M), partial = [];
  const OFF = [[-10, -10], [10, -10], [-10, 10], [10, 10]];
  for (let ty = 0; ty < M; ty++) for (let tx = 0; tx < N; tx++) {
    const cx = tx * TT + TT / 2, cy = ty * TT + TT / 2;
    const c = isW(cx, cy, true) ? 1 : 0; walk[ty * N + tx] = c;
    let mask = 0; for (let k = 0; k < 4; k++) if ((isW(cx + OFF[k][0], cy + OFF[k][1], true) ? 1 : 0) !== c) mask |= 1 << k;
    if (mask) partial.push([tx, ty, c, mask]);
  }
  const m = G.map.map(r => r.join('')).join('|');
  // si>0 필드는 FIXED_MAPS[0]을 복제해 지형·소환굴만 바꾼다(_cloneField11). 소환굴 지터는 mkRng(si*7919+17)로 결정적.
  const tmpl = STAGE === 0 ? FIXED_MAPS[0] : _cloneField11(STAGE);
  const roomOf = (tx, ty) => { for (let i = 0; i < G.rooms.length; i++) { const r = G.rooms[i]; if (tx >= r.x && tx < r.x + r.w && ty >= r.y && ty < r.y + r.h) return i; } return -1; };
  const st = G.rooms.find(r => r.type === 'start') || G.rooms[0];
  let sx = st.cx, sy = st.cy;
  const ptx = ~~(P.x / TT), pty = ~~(P.y / TT);
  return {
    N, M, T: TT, walk, partial,
    tileHash: sha(m), tmplRooms: tmpl.rooms, tmplSpawnHoles: tmpl.spawnHoles, tmplCorridorSpawns: tmpl.corridorSpawns, tmplFeatures: tmpl.features,
    gRooms: G.rooms.map((r, i) => ({ i, type: r.type, x: r.x, y: r.y, w: r.w, h: r.h, cx: r.cx, cy: r.cy })),
    start: [ptx, pty], startRoomCenter: [sx, sy], playerPx: [P.x, P.y],
    exits: G.exits.map(e => [e.x, e.y]), exitTileValues: G.exits.map(e => G.map[e.y][e.x]),
    bossGate: (G.bossGate || []).map(e => [e.x, e.y]), gateY: G._gateY, bossCx: G._bossCx, bossCy: G._bossCy,
    holes: G.spawnHoles.map(s => ({ tx: ~~(s.x / TT), ty: ~~(s.y / TT), px: [Math.round(s.x), Math.round(s.y)], size: +s.size.toFixed(3), room: s.room, geomRoom: roomOf(~~(s.x / TT), ~~(s.y / TT)), blocked: isW(s.x, s.y, true) ? 1 : 0 })),
    ens: ens.map(e => ({ tx: ~~(e.x / TT), ty: ~~(e.y / TT), px: [Math.round(e.x), Math.round(e.y)], etype: e.etype, elite: e.elite ? 1 : 0, lv: e.lv, r: e.r, hp: e.mhp, geomRoom: roomOf(~~(e.x / TT), ~~(e.y / TT)), blocked: isW(e.x, e.y, true) ? 1 : 0 })),
    mapObjs: MAP_OBJS.map(o => ({ type: o.type, x: Math.round(o.x), y: Math.round(o.y), noCol: o.noCol ? 1 : 0, scale: o.scale || 1 })),
    colObjs: (_ensureColObjs(), _colObjs.length),
    colObjList: _colObjs.map(o => ({ type: o.type, x: Math.round(o.x), y: Math.round(o.y), shape: o._colRect ? 'rect' : (o._colW ? 'ellipse' : 'circle'),
      w: +(o._colW || 0).toFixed(1), h: +(o._colH || 0).toFixed(1), r: +(o._colSz || 0).toFixed(1), rot: +(o._colRot || 0).toFixed(3), oy: (_OBJ_META[o.type] || {}).colOy || 0, scale: o.scale || 1 })),
    hillActive: !_FDG_RUINED_FOREST_FIRST && G.stage === 0, mapType: G.mapType, hill: _CH1_HILL,
    bgInit: { before: bgBefore, after: bgAfter },
    compose: JSON.parse(JSON.stringify(_MAP_COMPOSE[STAGE] || null)), tileRLEHead: (tmpl.tileRLE || []).slice(0, 8),
  };
  function sha(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }
};

const runs = [], seededRuns = [];
const plan = [...Array.from({ length: RUNS }, () => null), ...SEEDS];
for (let r = 0; r < plan.length; r++) {
  const seed = plan[r];
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  if (seed != null) await page.addInitScript(s => { let a = s >>> 0; Math.random = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }, seed);
  await page.route('**/game.html*', route => route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: gameBlob }));
  await page.route('**/maps_data.js*', route => route.fulfill({ status: 200, contentType: 'application/javascript; charset=utf-8', body: mapsBlob }));
  await page.goto(BASE + '/game.html', { waitUntil: 'commit', timeout: 30000 });
  await page.waitForFunction(() => typeof G !== 'undefined' && G && typeof initStage === 'function' && typeof isW === 'function', null, { timeout: 60000, polling: 200 });
  await page.waitForTimeout(2500);
  // 멈춤 진단: 60초 안에 끝나지 않으면 CDP로 호출 스택을 찍고 중단한다(재시도하지 않음).
  const cdp = await page.context().newCDPSession(page); await cdp.send('Debugger.enable');
  const stacks = []; cdp.on('Debugger.paused', ev => { stacks.push(ev.callFrames.slice(0, 12).map(f => f.functionName + '@' + (f.location.lineNumber + 1))); cdp.send('Debugger.resume').catch(() => {}); });
  let hung = true; const wd = setTimeout(async () => { if (!hung) return; await cdp.send('Debugger.pause').catch(() => {}); setTimeout(() => { console.error('HUNG run', r, 'seed', seed, JSON.stringify(stacks)); process.exit(2); }, 3000); }, 60000);
  const d = await page.evaluate(inPage, STAGE); hung = false; clearTimeout(wd);
  d.pageErrors = errs.slice(0, 3); d.seed = seed;
  (seed == null ? runs : seededRuns).push(d); await page.close();
}
// headless Chrome 종료가 이 PC에서 멈추는 일이 있어(WebGL context lost 뒤) 5초만 기다린다.
await Promise.race([browser.close().catch(() => {}), new Promise(r => setTimeout(r, 5000))]);

// ---- 결정성 점검 ----
const hashOf = o => sha256(JSON.stringify(o));
const walkHashes = runs.map(r => hashOf(r.walk)), partialHashes = runs.map(r => hashOf(r.partial));
const holeHashes = runs.map(r => hashOf(r.holes.map(h => [h.tx, h.ty, h.size, h.room])));
const det = {
  runs: RUNS, tileHash: [...new Set(runs.map(r => r.tileHash))].length === 1, walk: new Set(walkHashes).size === 1, partial: new Set(partialHashes).size === 1,
  spawnHolePositions: new Set(holeHashes).size === 1, exits: new Set(runs.map(r => hashOf(r.exits))).size === 1, start: new Set(runs.map(r => hashOf(r.start))).size === 1,
  seeds: SEEDS, walkSameAcrossSeeds: seededRuns.every(r => hashOf(r.walk) === walkHashes[0]),
  walkDiffTilesVsRun0PerSeed: seededRuns.map(r => r.walk.reduce((a, v, i) => a + (v !== runs[0].walk[i] ? 1 : 0), 0)),
  colObjsPerSeed: seededRuns.map(r => r.colObjs), colObjsPerRun: runs.map(r => r.colObjs),
  holesSameAcrossSeeds: seededRuns.every(r => hashOf(r.holes.map(h => [h.tx, h.ty, h.size, h.room])) === holeHashes[0]),
  enemyCountPerSeed: seededRuns.map(r => r.ens.length),
};
const R = runs[0], N = R.N, M = R.M;

// ---- BFS ----
const sx = R.start[0], sy = R.start[1];
const dist = new Int32Array(N * M).fill(-1);
const q = [sy * N + sx]; dist[sy * N + sx] = 0; // START 타일이 막힘이면 reach.json startBlocked=true로 기록
for (let h = 0; h < q.length; h++) {
  const c = q[h], x = c % N, y = (c / N) | 0;
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= M) continue;
    const ni = ny * N + nx; if (dist[ni] >= 0 || R.walk[ni]) continue; dist[ni] = dist[c] + 1; q.push(ni);
  }
}
const reached = []; for (let i = 0; i < N * M; i++) if (dist[i] >= 0) reached.push([i % N, (i / N) | 0]);
// 출구 타일(map===2)은 center 판정이 막힘일 수 있어 인접 도달도 따로 본다
const exitInfo = R.exits.map(([x, y]) => ({ tile: [x, y], centerBlocked: R.walk[y * N + x], reached: dist[y * N + x] >= 0, dist: dist[y * N + x],
  adjacentReached: [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && ny >= 0 && nx < N && ny < M && dist[ny * N + nx] >= 0; }) }));
const gateInfo = R.bossGate.map(([x, y]) => ({ tile: [x, y], centerBlocked: R.walk[y * N + x], reached: dist[y * N + x] >= 0, dist: dist[y * N + x] }));
// 도달 불가 섬(걷기 가능 + 미도달): 연결 성분
const seen = new Uint8Array(N * M), islands = [];
for (let i = 0; i < N * M; i++) {
  if (R.walk[i] || dist[i] >= 0 || seen[i]) continue;
  const comp = [i]; seen[i] = 1;
  for (let h = 0; h < comp.length; h++) { const c = comp[h], x = c % N, y = (c / N) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= M) continue; const ni = ny * N + nx; if (seen[ni] || R.walk[ni] || dist[ni] >= 0) continue; seen[ni] = 1; comp.push(ni); } }
  let x0 = N, y0 = M, x1 = 0, y1 = 0; for (const c of comp) { const x = c % N, y = (c / N) | 0; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  islands.push({ size: comp.length, bbox: [x0, y0, x1, y1], first: [comp[0] % N, (comp[0] / N) | 0] });
}
islands.sort((a, b) => b.size - a.size);

// ---- 스폰 ----
const holesRt = R.holes;
const rtHoleSet = holesRt.map(h => [h.tx, h.ty]);
const defHoles = [];
const T0 = R.T;
for (const sh of R.tmplSpawnHoles || []) defHoles.push({ src: 'tmpl.spawnHoles', tx: sh.x, ty: sh.y, type: sh.type });
for (const rd of R.tmplRooms) for (const sp of rd.spawns || []) defHoles.push({ src: 'rooms[' + rd.id + '].spawns', tx: rd.cx + sp.dx, ty: rd.cy + sp.dy, grade: sp.grade, room: rd.id });
for (const cs of R.tmplCorridorSpawns || []) defHoles.push({ src: 'corridorSpawns', tx: cs.x, ty: cs.y, grade: cs.grade });
const near = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
for (const d of defHoles) { const best = rtHoleSet.map((h, i) => [near([d.tx, d.ty], h), i]).sort((a, b) => a[0] - b[0])[0]; d.nearestRuntimeHole = best ? { index: best[1], distTiles: +best[0].toFixed(2) } : null; }
const fixedEns = runs.map(r => r.ens);
// 적: 모든 실행에 같은 etype·좌표로 나오는 것 = 고정, 나머지 = 무작위
const key = e => e.etype + '@' + e.tx + ',' + e.ty;
const fixedKeys = [...new Set(runs[0].ens.map(key))].filter(k => runs.every(r => r.ens.some(e => key(e) === k)));
const perRoomCounts = {};
for (const r of runs) { const c = {}; for (const e of r.ens) c[e.geomRoom] = (c[e.geomRoom] || 0) + 1; for (const k of new Set([...Object.keys(c), ...Object.keys(perRoomCounts)])) (perRoomCounts[k] ||= []).push(c[k] || 0); }
const roomRange = Object.fromEntries(Object.entries(perRoomCounts).map(([k, v]) => [k, { min: Math.min(...v), max: Math.max(...v), perRun: v }]));
const spawnJson = {
  note: '웹 1-' + (STAGE + 1) + ' 스폰 정답(si=' + STAGE + '). holes = 런타임 소환굴(G.spawnHoles) 위치 — 5회 실행 모두 동일. enemies = initStage(0) 직후 ens[] — 일부 고정, 보스방 호위는 무작위. 소환굴은 타이머로 이후 몬스터를 낸다(이 파일은 그 시점은 다루지 않음).',
  holesRuntime: holesRt, holesDefinition: defHoles,
  enemies: { perRun: fixedEns, fixedAcrossAllRuns: fixedKeys.map(k => { const e = runs[0].ens.find(e => key(e) === k); return { etype: e.etype, tx: e.tx, ty: e.ty, px: e.px, geomRoom: e.geomRoom }; }), roomCountRange: roomRange, totalRange: [Math.min(...runs.map(r => r.ens.length)), Math.max(...runs.map(r => r.ens.length))],
    bossRoomEtypeSets: runs.map(r => r.ens.filter(e => e.geomRoom === R.gRooms.findIndex(x => x.type === 'boss')).map(e => e.etype).sort((a, b) => a - b)) },
  blocked: { holes: holesRt.filter(h => h.blocked).length, enemiesPerRun: runs.map(r => r.ens.filter(e => e.blocked).length), enemiesBlockedList: runs.flatMap((r, i) => r.ens.filter(e => e.blocked).map(e => ({ run: i, etype: e.etype, tx: e.tx, ty: e.ty }))) },
  determinism: { holePositions: det.spawnHolePositions },
};
const nWalk = R.walk.reduce((a, v) => a + (v ? 0 : 1), 0);
const reachJson = {
  start: R.start, startBlocked: R.walk[sy * N + sx], startPlayerPx: R.playerPx, exits: exitInfo, bossGateTiles: gateInfo, gateY: R.gateY, bossCx: R.bossCx,
  walkableTiles: nWalk, blockedTiles: N * M - nWalk, reachedTiles: reached.length, unreachedWalkableTiles: nWalk - reached.length, islandCount: islands.length, islands: islands.slice(0, 200), islandsTruncated: islands.length > 200,
  reached,
};
fs.writeFileSync(path.join(OUT, NAME + '_walk.json'), JSON.stringify({ stage: STAGE, map: '1장 ' + (STAGE + 1) + '구역 썩은숲', N, M, tile: R.T, encoding: 'rows[ty] = string of N chars; 0=walkable 1=blocked (isW at tile centre, skipBone)', rows: Array.from({ length: M }, (_, y) => R.walk.slice(y * N, y * N + N).join('')), partial: { note: '[tx,ty,centerBlocked,cornerMask] — 4 corners (±10px) disagree with centre; mask bit0=(-,-) bit1=(+,-) bit2=(-,+) bit3=(+,+)', count: R.partial.length, tiles: R.partial }, counts: { walkable: nWalk, blocked: N * M - nWalk }, hillActive: R.hillActive, hill: R.hill, colObjs: R.colObjs, mapObjCount: R.mapObjs.length, mapObjs: R.mapObjs, colObjList: R.colObjList, bgInit: R.bgInit, compose: R.compose, tileRLEHead: R.tileRLEHead }));
fs.writeFileSync(path.join(OUT, NAME + '_rooms.json'), JSON.stringify({ templateRooms: R.tmplRooms, runtimeRooms: R.gRooms, start: R.start, startRoomCenter: R.startRoomCenter, exit: { tiles: R.exits, tileValues: R.exitTileValues, note: 'G.exits (map===2). 보스 게이트 타일은 reach.json bossGateTiles' }, bossGate: { tiles: R.bossGate, gateY: R.gateY, bossCx: R.bossCx, bossCy: R.bossCy }, features: R.tmplFeatures }, null, 1));
fs.writeFileSync(path.join(OUT, NAME + '_reach.json'), JSON.stringify(reachJson));
fs.writeFileSync(path.join(OUT, NAME + '_spawns.json'), JSON.stringify(spawnJson, null, 1));

// ---- 충돌 오버레이 PNG (4px/tile) ----
const S = 4, W = N * S, H = M * S, px = Buffer.alloc(W * H * 3);
const put = (x, y, c) => { if (x < 0 || y < 0 || x >= W || y >= H) return; const o = (y * W + x) * 3; px[o] = c[0]; px[o + 1] = c[1]; px[o + 2] = c[2]; };
const fill = (tx, ty, c) => { for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) put(tx * S + i, ty * S + j, c); };
const partSet = new Set(R.partial.map(p => p[1] * N + p[0]));
for (let y = 0; y < M; y++) for (let x = 0; x < N; x++) {
  const i = y * N + x; let c;
  if (R.walk[i]) c = [18, 14, 14]; else if (dist[i] >= 0) c = [52, 92, 60]; else c = [150, 40, 130];
  if (partSet.has(i)) c = R.walk[i] ? [170, 100, 20] : [200, 150, 40];
  fill(x, y, c);
}
const ring = (cx, cy, rx, ry, c) => { for (let a = 0; a < 720; a++) { const t = a / 720 * 2 * Math.PI; put(Math.round((cx + .5 + Math.cos(t) * rx) * S), Math.round((cy + .5 + Math.sin(t) * ry) * S), c); } };
for (const r of R.gRooms) { for (let x = r.x; x < r.x + r.w; x++) { put(x * S, r.y * S, [60, 160, 200]); put(x * S, (r.y + r.h) * S, [60, 160, 200]); } for (let y = r.y; y < r.y + r.h; y++) { put(r.x * S, y * S, [60, 160, 200]); put((r.x + r.w) * S, y * S, [60, 160, 200]); } }
for (const t of R.tmplRooms) ring(t.cx, t.cy, t.rx, t.ry, [90, 220, 240]);
const dot = (tx, ty, c, rr) => { for (let j = -rr; j <= rr; j++) for (let i = -rr; i <= rr; i++) put(tx * S + 2 + i, ty * S + 2 + j, c); };
for (const h of holesRt) dot(h.tx, h.ty, h.blocked ? [255, 60, 60] : [255, 220, 40], 4);
for (const e of R.ens) dot(e.tx, e.ty, e.blocked ? [255, 60, 60] : [255, 120, 40], 2);
dot(R.start[0], R.start[1], [80, 140, 255], 6);
for (const [x, y] of R.exits) dot(x, y, [255, 255, 255], 3);
for (const [x, y] of R.bossGate) dot(x, y, [230, 230, 120], 2);
const crcT = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc = b => { let c = 0xFFFFFFFF; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
const raw = Buffer.alloc((W * 3 + 1) * H); for (let y = 0; y < H; y++) { raw[y * (W * 3 + 1)] = 0; px.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3); }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
fs.writeFileSync(path.join(PNG_OUT, NAME + '_collision.png'), Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]));

// ---- 출처 영수증 ----
const dirty = (() => { try { return git('status', '--short', '--', 'game.html', 'maps_data.js').toString().trim(); } catch { return 'n/a'; } })();
fs.writeFileSync(path.join(OUT, NAME + '_source_receipt.json'), JSON.stringify({
  extractedAt: new Date().toISOString(), mainRef: REF, mainSha: refSha, mainRepo: MAIN,
  gameHtml: { sha256_committed_blob: sha256(gameBlob), sha256_disk_at_extract: sha256(diskGame), usedSource: 'committed blob via Playwright route', diskDiffersFromCommitted: sha256(diskGame) !== sha256(gameBlob) },
  mapsDataJs: { sha256_committed_blob: sha256(mapsBlob), sha256_disk_at_extract: sha256(diskMaps), usedSource: 'committed blob via Playwright route' },
  worktreeStatusOfSources: dirty,
  functions: { isW: lineOf(/^function isW\(px,py,skipBone\)/), _rebuildColObjs: lineOf(/^function _rebuildColObjs/), _ensureColObjs: lineOf(/^function _ensureColObjs/), _ch1HillBandBlocks: lineOf(/^function _ch1HillBandBlocks/), _CH1_HILL: lineOf(/^const _CH1_HILL=/), genFromTemplate: lineOf(/^function genFromTemplate/), initStage: lineOf(/^function initStage/), mkP: lineOf(/^function mkP\(/), _applyCh1StartNorthGate: lineOf(/function _applyCh1StartNorthGate/) },
  bootSequence: 'G._cutsceneDone=true; if(!P)P=mkP(); G.stage=' + STAGE + '; initStage(' + STAGE + '); if(!_bgInitDone)_tickBgInit(9999) in headless Chrome (--mute-audio), game.html/maps_data.js fulfilled from committed blob',
  determinism: det, runs: RUNS, pageErrors: runs.map(r => r.pageErrors),
}, null, 1));

console.log(JSON.stringify({ out: OUT, det, walkable: nWalk, blocked: N * M - nWalk, partial: R.partial.length, reached: reached.length, unreachedWalkable: nWalk - reached.length, islands: islands.length, exits: exitInfo, gate: gateInfo, holes: holesRt.length, holesBlocked: spawnJson.blocked.holes, ensRange: spawnJson.enemies.totalRange, ensBlocked: spawnJson.blocked.enemiesPerRun, fixedEns: spawnJson.enemies.fixedAcrossAllRuns.length, roomRange }, null, 1));
process.exit(0);
