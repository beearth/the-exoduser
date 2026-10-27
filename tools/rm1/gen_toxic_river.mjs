// RM-1 독성 강 경로 데이터 (데이터만, 렌더 없음). Core CanMove 격자(unity_1_1_walk_dump.json = --unity-c04-dump 결과, C04 oracle 차이 0)의 경계를 따라
// 양 사이드(L/R) 남→북으로 흐르는 수로 중심선과 비보행 늪 1곳을 시드 고정으로 만든다. 수로는 비보행 칸 안에만 놓고(기슭 1칸을 보행 칸과 사이에 둔다), 걷기 판정은 건드리지 않는다.
// 사용: node tools/rm1/gen_toxic_river.mjs [--seed 1101] [--y0 120] [--y1 192]
import fs from 'fs';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const SEED = +arg('seed', 1101), YN = +arg('y0', 120), YS = +arg('y1', 192);
const A = 'unity/Assets/Exoduser/Remodel/CH1_1/Data';
const d = JSON.parse(fs.readFileSync(A + '/unity_1_1_walk_dump.json', 'utf8'));
const N = 200, M = 200, blocked = (x, y) => x < 0 || y < 0 || x >= N || y >= M || d.walk[y][x] === '1';
function rng(s) { return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rand = rng(SEED);

// START에서 도달 가능한 걷기 영역(4방향)
const reach = new Uint8Array(N * M), q = [d.start[1] * N + d.start[0]]; reach[q[0]] = 1;
for (let h = 0; h < q.length; h++) { const c = q[h], x = c % N, y = (c / N) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (blocked(nx, ny) || reach[ny * N + nx]) continue; reach[ny * N + nx] = 1; q.push(ny * N + nx); } }
// 비보행 칸에서 가장 가까운 도달 가능 걷기 칸까지의 거리(체비쇼프, 다원 BFS)
const dist = new Int16Array(N * M).fill(-1); const q2 = []; for (let i = 0; i < N * M; i++) if (reach[i]) { dist[i] = 0; q2.push(i); }
for (let h = 0; h < q2.length; h++) { const c = q2[h], x = c % N, y = (c / N) | 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= M || dist[ny * N + nx] >= 0) continue; dist[ny * N + nx] = dist[c] + 1; q2.push(ny * N + nx); } }

const SHORE = 1, HALF = 1.5;                     // 보행 칸과 수로 사이 기슭 1칸, 수로 폭 3칸
function side(sign) {                             // sign -1 = L(서), +1 = R(동)
  const rows = [];
  for (let y = YS; y >= YN; y--) {                // 남→북
    let b = -1; if (sign < 0) { for (let x = 0; x < N; x++) if (reach[y * N + x]) { b = x; break; } } else { for (let x = N - 1; x >= 0; x--) if (reach[y * N + x]) { b = x; break; } }
    if (b < 0) continue; rows.push({ y, b });
  }
  // 경계 → 바깥쪽 offset(기슭 + 반폭 + 시드 구불거림), 이동평균으로 부드럽게
  const raw = rows.map((r, i) => ({ y: r.y, x: r.b + sign * (SHORE + HALF + 1 + 1.2 * Math.sin(i * 0.13 + SEED) + (rand() - .5) * 0.8) }));
  const sm = raw.map((p, i) => { let s = 0, n = 0; for (let k = -6; k <= 6; k++) { const j = i + k; if (j < 0 || j >= raw.length) continue; s += raw[j].x; n++; } return { y: p.y, x: s / n }; });
  // 비보행 검증: 수로 폭 안의 모든 칸이 막힘이고 보행 칸과 1칸 이상 떨어져야 한다 → 아니면 중심을 바깥으로 민다
  const pts = [], dropped = []; let fixed = 0;
  for (const p of sm) {
    let cx = p.x, valid = false; for (let t = 0; t < 24; t++) { let ok = true; for (let x = Math.floor(cx - HALF); x <= Math.ceil(cx + HALF); x++) { if (!blocked(x, p.y) || dist[p.y * N + x] < SHORE + 1) { ok = false; break; } } if (ok) { valid = true; break; } cx += sign * 0.5; fixed++; }
    if (valid) pts.push({ ty: p.y, tx: +cx.toFixed(2) }); else dropped.push(p.y);
  }
  let bad = 0, tiles = 0; for (const p of pts) for (let x = Math.floor(p.tx - HALF); x <= Math.ceil(p.tx + HALF); x++) { tiles++; if (!blocked(x, p.ty) || dist[p.ty * N + x] < SHORE + 1) bad++; }
  return { pts, bad, tiles, fixed, dropped };
}
const L = side(-1), R = side(+1);

// 비보행 늪 1곳: 슬라이스 창 안에서 START·R1 컷에 들어오는 범위(x70~130, y150~192)의 보행 영역과 가장 먼 막힌 칸 중 L/R 수로에서 6칸 이상 떨어진 곳
let best = null;
for (let y = 150; y <= 192; y++) for (let x = 70; x <= 130; x++) { const dd = dist[y * N + x]; if (dd < 3 || !blocked(x, y)) continue; if (!best || dd > best.dd) best = { x, y, dd }; }
const swamp = best && { tx: best.x, ty: best.y, rx: Math.max(1.5, Math.min(4, best.dd * 0.6)), ry: Math.max(1.5, Math.min(3, best.dd * 0.45)), distToWalkable: best.dd };
let swampBad = 0; if (swamp) for (let y = Math.floor(swamp.ty - swamp.ry); y <= Math.ceil(swamp.ty + swamp.ry); y++) for (let x = Math.floor(swamp.tx - swamp.rx); x <= Math.ceil(swamp.tx + swamp.rx); x++) { const e = ((x - swamp.tx) / swamp.rx) ** 2 + ((y - swamp.ty) / swamp.ry) ** 2; if (e <= 1 && !blocked(x, y)) swampBad++; }

const out = { note: 'RM-1 독성 강 경로 데이터. 좌표 = 타일(소수), 남(ty 큼)→북(ty 작음). 수로는 비보행 칸 안(기슭 1칸 뒤)에만 있다.', seed: SEED, tileSize: 40, channelHalfWidthTiles: HALF, shoreTiles: SHORE,
  source: 'Remodel/CH1_1/Data/unity_1_1_walk_dump.json', yRange: [YN, YS], rivers: { L: L.pts, R: R.pts }, swamp,
  checks: { channelTilesTested: L.tiles + R.tiles, channelTilesOnWalkableOrShore: L.bad + R.bad, nudgedSteps: L.fixed + R.fixed, droppedRows: { L: L.dropped, R: R.dropped }, swampTilesOnWalkable: swampBad } };
fs.writeFileSync(A + '/toxic_river_path.json', JSON.stringify(out));
const inWin = p => p.tx >= 60 && p.tx <= 140 && p.ty >= 138 && p.ty <= 192;
console.log(JSON.stringify({ L: L.pts.length, R: R.pts.length, Lwin: L.pts.filter(inWin).length, Rwin: R.pts.filter(inWin).length, swamp, checks: out.checks }));
