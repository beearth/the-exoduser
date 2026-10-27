// RM-2: 웹 1-2(si=1) 걷기·방·스폰 정답 추출. C04-ORACLE(tools/c04-oracle/extract.mjs, 브랜치 claude/unity-pc-c04-oracle-20261027) 방식을 따른다.
// 원본 = origin/main 커밋본. game.html뿐 아니라 같은 출처의 코드 요청(html·js·json·css, ch1_si1_geometry.js 등) 전부를 커밋본 blob으로 끼워 넣는다
// (main 체크아웃 디스크에 다른 세션 미커밋 수정이 있을 수 있으므로). 이미지·소리와 커밋본에 없는 경로(/api 등)는 서버로 넘긴다(지형·충돌에 영향 없음). 서버(3333)는 건드리지 않는다.
// 사용: node tools/rm2/extract.mjs [--si 1] [--runs 5] [--out unity/Assets/Exoduser/Remodel/CH1_2/Data] [--png I:/EXODUSER-Storage/rm2/ch1_2_collision.png]
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import zlib from 'zlib';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const here = path.dirname(fileURLToPath(import.meta.url));
const SI = +arg('si', 1);
const NAME = 'ch1_' + (SI + 1);
const OUT = path.resolve(arg('out', path.join(here, '../../unity/Assets/Exoduser/Remodel/CH1_' + (SI + 1) + '/Data')));
const PNG = arg('png', 'I:/EXODUSER-Storage/rm' + (SI + 1) + '/' + NAME + '_collision.png');
const RUNS = +arg('runs', 5);
const MAIN = arg('main-repo', 'G:/exoduser');
const REF = arg('ref', 'origin/main');
const BASE = arg('base', 'http://127.0.0.1:3333');
const CHROME = arg('chrome', 'C:/Program Files/Google/Chrome/Application/chrome.exe');
const { chromium } = createRequire(path.join(MAIN, 'package.json'))('playwright');
const sha256 = b => crypto.createHash('sha256').update(b).digest('hex');
const git = (...a) => execFileSync('git', ['-C', MAIN, ...a], { maxBuffer: 512 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(path.dirname(PNG), { recursive: true });

const refSha = git('rev-parse', REF).toString().trim();
const blobCache = new Map(), served = new Map(), passed = new Set();
const blobOf = rel => {
  if (blobCache.has(rel)) return blobCache.get(rel);
  let b = null; try { b = git('show', `${refSha}:${rel}`); } catch { b = null; }
  blobCache.set(rel, b); return b;
};
const MIME = { html: 'text/html; charset=utf-8', js: 'application/javascript; charset=utf-8', mjs: 'application/javascript; charset=utf-8', css: 'text/css; charset=utf-8', json: 'application/json', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml', mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav', woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf', glb: 'model/gltf-binary', wasm: 'application/wasm' };

const browser = await chromium.launch({ headless: true, executablePath: CHROME, args: ['--mute-audio'] });

const inPage = (si) => {
  G._cutsceneDone = true; if (!P) P = mkP(); G.stage = si; initStage(si);
  // si≠0은 initMapObjects(소품·충돌물)가 _bgInitQueue로 미뤄진다(initStage 끝에서 si===0만 즉시 실행). 큐를 비워야 충돌물이 들어간다(RM-3 공유, 10-28).
  const bgQueued = !_bgInitDone; if (!_bgInitDone) _tickBgInit(9999);
  const N = G.mw, M = G.mh, TT = T;
  const walk = new Array(N * M), partial = [];
  const OFF = [[-10, -10], [10, -10], [-10, 10], [10, 10]];
  for (let ty = 0; ty < M; ty++) for (let tx = 0; tx < N; tx++) {
    const cx = tx * TT + TT / 2, cy = ty * TT + TT / 2;
    const c = isW(cx, cy, true) ? 1 : 0; walk[ty * N + tx] = c;
    let mask = 0; for (let k = 0; k < 4; k++) if ((isW(cx + OFF[k][0], cy + OFF[k][1], true) ? 1 : 0) !== c) mask |= 1 << k;
    if (mask) partial.push([tx, ty, c, mask]);
  }
  const mapRows = G.map.map(r => r.join(''));
  const roomOf = (tx, ty) => { for (let i = 0; i < G.rooms.length; i++) { const r = G.rooms[i]; if (tx >= r.x && tx < r.x + r.w && ty >= r.y && ty < r.y + r.h) return i; } return -1; };
  const tmpl = _getFixedMapForStage(si);
  const geo = globalThis.CH1_SI1_GEOMETRY && si === 1 ? (({ regions, landmarks, spine, widthSamples, bypassPaths }) => ({ regions, landmarks, spine, widthSamples, bypassPaths }))(CH1_SI1_GEOMETRY) : null;
  _ensureColObjs();
  const pc = _MAP_COMPOSE[si] || null;
  return {
    N, M, T: TT, walk, partial, mapRows, tileHash: sha(mapRows.join('|')),
    tmplRooms: tmpl.rooms, tmplSpawnHoles: tmpl.spawnHoles, tmplCorridorSpawns: tmpl.corridorSpawns || null, tmplFeatures: tmpl.features || null,
    gRooms: G.rooms.map((r, i) => ({ i, type: r.type, x: r.x, y: r.y, w: r.w, h: r.h, cx: r.cx, cy: r.cy })),
    start: [~~(P.x / TT), ~~(P.y / TT)], playerPx: [P.x, P.y],
    exits: G.exits.map(e => [e.x, e.y]), exitTileValues: G.exits.map(e => G.map[e.y][e.x]),
    bossGate: (G.bossGate || []).map(e => [e.x, e.y]), gateY: G._gateY ?? null, bossCx: G._bossCx ?? null, bossCy: G._bossCy ?? null,
    gateGuard: G._gateGuard ? { tx: ~~(G._gateGuard.x / TT), ty: ~~(G._gateGuard.y / TT) } : null,
    holes: G.spawnHoles.map(s => ({ tx: ~~(s.x / TT), ty: ~~(s.y / TT), px: [Math.round(s.x), Math.round(s.y)], size: +s.size.toFixed(3), count: _spawnHoleCount(s.size, si), room: s.room, geomRoom: roomOf(~~(s.x / TT), ~~(s.y / TT)), blocked: isW(s.x, s.y, true) ? 1 : 0 })),
    ens: ens.map(e => ({ tx: ~~(e.x / TT), ty: ~~(e.y / TT), px: [Math.round(e.x), Math.round(e.y)], etype: e.etype, elite: e.elite ? 1 : 0, lv: e.lv, r: e.r, hp: e.mhp, geomRoom: roomOf(~~(e.x / TT), ~~(e.y / TT)), blocked: isW(e.x, e.y, true) ? 1 : 0 })),
    regions: (G._regions || []).map(r => ({ id: r.id, nameKo: r.nameKo, x0: r.x0, y0: r.y0, x1: r.x1, y1: r.y1, total: r.total, cleared: r.cleared })), regGateIdx: G._regGateIdx,
    mapObjs: MAP_OBJS.map(o => ({ type: o.type, x: Math.round(o.x), y: Math.round(o.y), tx: ~~(o.x / TT), ty: ~~(o.y / TT), scale: o.scale || 1, noCol: o.noCol ? 1 : 0, role: o.role || null, region: o.region || null })),
    colObjs: _colObjs.filter(o => !o.noCol).map(o => ({ type: o.type, x: Math.round(o.x), y: Math.round(o.y), rect: o._colRect ? 1 : 0, rot: o._colRot ? +o._colRot.toFixed(4) : 0, w: o._colW ? +o._colW.toFixed(1) : 0, h: o._colH ? +o._colH.toFixed(1) : 0, sz: o._colSz ? +o._colSz.toFixed(1) : 0, colOy: (_OBJ_META[o.type] && _OBJ_META[o.type].colOy) || 0 })),
    hillActive: !_FDG_RUINED_FOREST_FIRST && G.stage === 0, mapType: G.mapType ?? null, bgQueueFlushed: bgQueued, bgInitDone: _bgInitDone,
    compose: pc ? { keys: Object.keys(pc), empty: pc.empty || null, basin: pc.basin || null, hasPath: !!pc.path } : null,
    geometry: geo,
  };
  function sha(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }
};

const runs = [];
for (let r = 0; r < RUNS; r++) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route(BASE + '/**', route => {
    const u = new URL(route.request().url());
    const rel = decodeURIComponent(u.pathname.replace(/^\/+/, '')) || 'index.html';
    if (/\.(mp3|ogg|wav|m4a|mp4|webm)$/i.test(rel)) { passed.add('(aborted media) ' + rel.replace(/\/[^/]*$/, '/*')); return route.abort(); }
    if (!/\.(html|js|mjs|json|css)$/i.test(rel)) { passed.add(rel.replace(/\/[^/]*$/, '/*')); return route.continue(); }
    const b = blobOf(rel);
    if (!b) { passed.add(rel); return route.continue(); }
    served.set(rel, sha256(b));
    const ext = (rel.split('.').pop() || '').toLowerCase();
    return route.fulfill({ status: 200, contentType: MIME[ext] || 'application/octet-stream', body: b });
  });
  const t0 = Date.now(), step = s => console.error(`run ${r + 1}/${RUNS} ${s} +${((Date.now() - t0) / 1000).toFixed(1)}s`);
  await page.goto(BASE + '/game.html', { waitUntil: 'commit', timeout: 60000 }); step('goto');
  await page.waitForFunction(() => typeof G !== 'undefined' && G && typeof initStage === 'function' && typeof isW === 'function', null, { timeout: 90000, polling: 200 }); step('ready');
  await page.waitForTimeout(2500);
  const d = await page.evaluate(inPage, SI); step('extracted');
  d.pageErrors = errs.slice(0, 5);
  runs.push(d);
  // page.close()가 진행 중인 route 요청 때문에 멈추는 경우가 있어(10-28 실측) 가로채기를 먼저 풀고 5초만 기다린다.
  await page.unrouteAll({ behavior: 'ignoreErrors' }).catch(() => {});
  await Promise.race([page.close().catch(() => {}), new Promise(res => setTimeout(res, 5000))]); step('closed, served ' + served.size);
}
// browser.close()가 끝나지 않고 멈추는 경우가 있어(10-28 실측 12분) 10초만 기다린다. 남은 브라우저는 process.exit 뒤 정리한다.
await Promise.race([browser.close(), new Promise(r => setTimeout(r, 10000))]);

const hashOf = o => sha256(JSON.stringify(o));
const det = {
  runs: RUNS, tileHash: new Set(runs.map(r => r.tileHash)).size === 1, walk: new Set(runs.map(r => hashOf(r.walk))).size === 1, partial: new Set(runs.map(r => hashOf(r.partial))).size === 1,
  spawnHolePositions: new Set(runs.map(r => hashOf(r.holes.map(h => [h.tx, h.ty, h.size])))).size === 1, exits: new Set(runs.map(r => hashOf(r.exits))).size === 1, start: new Set(runs.map(r => hashOf(r.start))).size === 1,
  colObjs: new Set(runs.map(r => hashOf(r.colObjs))).size === 1, regions: new Set(runs.map(r => hashOf(r.regions))).size === 1,
};
const R = runs[0], N = R.N, M = R.M;

// BFS (타일 중심 4방향)
const [sx, sy] = R.start;
const dist = new Int32Array(N * M).fill(-1); const q = [sy * N + sx]; dist[sy * N + sx] = 0;
for (let h = 0; h < q.length; h++) { const c = q[h], x = c % N, y = (c / N) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= M) continue; const ni = ny * N + nx; if (dist[ni] >= 0 || R.walk[ni]) continue; dist[ni] = dist[c] + 1; q.push(ni); } }
const reachedN = [...dist].filter(v => v >= 0).length;
const adj = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && ny >= 0 && nx < N && ny < M && dist[ny * N + nx] >= 0; });
const exitInfo = R.exits.map(([x, y]) => ({ tile: [x, y], centerBlocked: R.walk[y * N + x], reached: dist[y * N + x] >= 0, dist: dist[y * N + x], adjacentReached: adj(x, y) }));
const gateInfo = R.bossGate.map(([x, y]) => ({ tile: [x, y], centerBlocked: R.walk[y * N + x], reached: dist[y * N + x] >= 0, dist: dist[y * N + x] }));
// 도달 불가 걷기 섬 + 걷기 영역 안의 막힘 섬(보이지 않는 벽 후보: 바깥 막힘과 연결되지 않은 막힘 성분)
const comps = (pred) => { const seen = new Uint8Array(N * M), out = []; for (let i = 0; i < N * M; i++) { if (!pred(i) || seen[i]) continue; const comp = [i]; seen[i] = 1; let edge = false; for (let h = 0; h < comp.length; h++) { const c = comp[h], x = c % N, y = (c / N) | 0; if (x === 0 || y === 0 || x === N - 1 || y === M - 1) edge = true; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= M) continue; const ni = ny * N + nx; if (seen[ni] || !pred(ni)) continue; seen[ni] = 1; comp.push(ni); } } let x0 = N, y0 = M, x1 = 0, y1 = 0; for (const c of comp) { const x = c % N, y = (c / N) | 0; x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } out.push({ size: comp.length, bbox: [x0, y0, x1, y1], touchesBorder: edge }); } return out.sort((a, b) => b.size - a.size); };
const unreached = comps(i => !R.walk[i] && dist[i] < 0);
const blockedIslands = comps(i => !!R.walk[i]).filter(c => !c.touchesBorder);

// 적: 모든 실행에 같은 etype·좌표 = 고정
const key = e => e.etype + '@' + e.tx + ',' + e.ty;
const fixedKeys = [...new Set(R.ens.map(key))].filter(k => runs.every(r => r.ens.some(e => key(e) === k)));
const perRoom = {}; for (const r of runs) { const c = {}; for (const e of r.ens) c[e.geomRoom] = (c[e.geomRoom] || 0) + 1; for (const k of new Set([...Object.keys(c), ...Object.keys(perRoom)])) (perRoom[k] ||= []).push(c[k] || 0); }
const defHoles = [];
for (const sh of R.tmplSpawnHoles || []) defHoles.push({ src: 'tmpl.spawnHoles', tx: sh.x, ty: sh.y, type: sh.type });
for (const rd of R.tmplRooms || []) for (const sp of rd.spawns || []) defHoles.push({ src: 'rooms[' + rd.id + '].spawns', tx: rd.cx + sp.dx, ty: rd.cy + sp.dy, grade: sp.grade, room: rd.id });
for (const cs of R.tmplCorridorSpawns || []) defHoles.push({ src: 'corridorSpawns', tx: cs.x, ty: cs.y, grade: cs.grade });
for (const d of defHoles) { const best = R.holes.map((h, i) => [Math.hypot(d.tx - h.tx, d.ty - h.ty), i]).sort((a, b) => a[0] - b[0])[0]; d.nearestRuntimeHole = best ? { index: best[1], distTiles: +best[0].toFixed(2) } : null; }

const nWalk = R.walk.reduce((a, v) => a + (v ? 0 : 1), 0);
const rows = Array.from({ length: M }, (_, y) => R.walk.slice(y * N, y * N + N).join(''));
fs.writeFileSync(path.join(OUT, NAME + '_walk.json'), JSON.stringify({
  stage: SI, area: '1-' + (SI + 1), N, M, tile: R.T, encoding: 'rows[ty] = N chars; 0=walkable 1=blocked (isW at tile centre, skipBone=true)',
  rows, mapRows: { note: 'G.map 원값(0 바닥 1 벽 2 출구)', rows: R.mapRows },
  partial: { note: '[tx,ty,centerBlocked,cornerMask] — 4 corners (±10px) disagree with centre; bit0=(-,-) bit1=(+,-) bit2=(-,+) bit3=(+,+)', count: R.partial.length, tiles: R.partial },
  counts: { walkable: nWalk, blocked: N * M - nWalk, reached: reachedN, unreachedWalkable: nWalk - reachedN },
  unreachedIslands: unreached, blockedIslandsInsideWalk: blockedIslands,
  hillActive: R.hillActive, colObjs: R.colObjs, mapObjs: R.mapObjs,
}));
fs.writeFileSync(path.join(OUT, NAME + '_rooms.json'), JSON.stringify({
  templateRooms: R.tmplRooms, runtimeRooms: R.gRooms, start: R.start, startPlayerPx: R.playerPx,
  exit: { tiles: R.exits, tileValues: R.exitTileValues, reach: exitInfo }, bossGate: { tiles: R.bossGate, reach: gateInfo, gateY: R.gateY, bossCx: R.bossCx, bossCy: R.bossCy }, gateGuard: R.gateGuard,
  features: R.tmplFeatures, regions: R.regions, regGateIdx: R.regGateIdx, compose: R.compose, geometry: R.geometry,
}, null, 1));
fs.writeFileSync(path.join(OUT, NAME + '_spawns.json'), JSON.stringify({
  note: '웹 1-' + (SI + 1) + ' 스폰 정답. holesRuntime = G.spawnHoles(count=_spawnHoleCount). enemies = initStage 직후 ens[] — fixedAcrossAllRuns는 ' + RUNS + '회 모두 같은 etype·타일.',
  holesRuntime: R.holes, holesDefinition: defHoles,
  enemies: { perRun: runs.map(r => r.ens), fixedAcrossAllRuns: fixedKeys.map(k => { const e = R.ens.find(e => key(e) === k); return { etype: e.etype, tx: e.tx, ty: e.ty, px: e.px, geomRoom: e.geomRoom }; }), roomCountRange: Object.fromEntries(Object.entries(perRoom).map(([k, v]) => [k, { min: Math.min(...v), max: Math.max(...v), perRun: v }])), totalRange: [Math.min(...runs.map(r => r.ens.length)), Math.max(...runs.map(r => r.ens.length))] },
  regionTotals: R.regions.map(r => ({ id: r.id, total: r.total })),
  blocked: { holes: R.holes.filter(h => h.blocked).length, enemiesPerRun: runs.map(r => r.ens.filter(e => e.blocked).length) },
}, null, 1));

// 충돌 오버레이 PNG (4px/tile) — I 드라이브
const S = 4, W = N * S, H = M * S, px = Buffer.alloc(W * H * 3);
const put = (x, y, c) => { if (x < 0 || y < 0 || x >= W || y >= H) return; const o = (y * W + x) * 3; px[o] = c[0]; px[o + 1] = c[1]; px[o + 2] = c[2]; };
const fill = (tx, ty, c) => { for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) put(tx * S + i, ty * S + j, c); };
const partSet = new Set(R.partial.map(p => p[1] * N + p[0]));
for (let y = 0; y < M; y++) for (let x = 0; x < N; x++) { const i = y * N + x; let c = R.walk[i] ? [18, 14, 14] : dist[i] >= 0 ? [52, 92, 60] : [150, 40, 130]; if (partSet.has(i)) c = R.walk[i] ? [170, 100, 20] : [200, 150, 40]; fill(x, y, c); }
for (const r of R.gRooms) { for (let x = r.x; x < r.x + r.w; x++) { put(x * S, r.y * S, [60, 160, 200]); put(x * S, (r.y + r.h) * S, [60, 160, 200]); } for (let y = r.y; y < r.y + r.h; y++) { put(r.x * S, y * S, [60, 160, 200]); put((r.x + r.w) * S, y * S, [60, 160, 200]); } }
const dot = (tx, ty, c, rr) => { for (let j = -rr; j <= rr; j++) for (let i = -rr; i <= rr; i++) put(tx * S + 2 + i, ty * S + 2 + j, c); };
for (const h of R.holes) dot(h.tx, h.ty, h.blocked ? [255, 60, 60] : [255, 220, 40], 4);
for (const e of R.ens) dot(e.tx, e.ty, e.blocked ? [255, 60, 60] : [255, 120, 40], 2);
dot(sx, sy, [80, 140, 255], 6); for (const [x, y] of R.exits) dot(x, y, [255, 255, 255], 3); for (const [x, y] of R.bossGate) dot(x, y, [230, 230, 120], 2);
const crcT = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc = b => { let c = 0xFFFFFFFF; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
const raw = Buffer.alloc((W * 3 + 1) * H); for (let y = 0; y < H; y++) { raw[y * (W * 3 + 1)] = 0; px.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3); }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
fs.writeFileSync(PNG, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]));

const gameBlob = blobOf('game.html');
fs.writeFileSync(path.join(OUT, NAME + '_receipt.json'), JSON.stringify({
  extractedAt: new Date().toISOString(), si: SI, mainRef: REF, mainSha: refSha, mainRepo: MAIN,
  gameHtmlSha256: sha256(gameBlob), sourcePolicy: 'same-origin 코드 요청(html/js/mjs/json/css)을 커밋본 blob으로 fulfill. 이미지·소리·커밋본에 없는 경로는 서버(디스크) 통과',
  servedFromCommit: Object.fromEntries([...served].filter(([k]) => /\.(js|html|json)$/.test(k)).sort()), servedCount: served.size, passedToServer: [...passed].sort(),
  bootSequence: `G._cutsceneDone=true; if(!P)P=mkP(); G.stage=${SI}; initStage(${SI}); if(!_bgInitDone)_tickBgInit(9999) (headless Chrome --mute-audio)`, bgQueueFlushed: runs.map(r => r.bgQueueFlushed),
  bfs: 'tile-centre 4-neighbour from start', determinism: det, pageErrors: runs.map(r => r.pageErrors), collisionPng: PNG,
}, null, 1));

console.log(JSON.stringify({ out: OUT, det, walkable: nWalk, blocked: N * M - nWalk, partial: R.partial.length, reached: reachedN, unreached: unreached.length, blockedIslandsInside: blockedIslands.length, start: R.start, exits: exitInfo, gate: gateInfo, holes: R.holes.length, holesBlocked: R.holes.filter(h => h.blocked).length, ensRange: [Math.min(...runs.map(r => r.ens.length)), Math.max(...runs.map(r => r.ens.length))], fixed: fixedKeys, regions: R.regions.map(r => r.total), colObjs: R.colObjs.length, mapObjs: R.mapObjs.length, passed: [...passed].slice(0, 10), errs: runs.map(r => r.pageErrors.length) }, null, 1));
process.exit(0);
