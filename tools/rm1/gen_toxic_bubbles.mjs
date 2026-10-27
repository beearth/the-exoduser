// RM-1 독성 기포 스폰 데이터 (VFX RM1 "기포"가 읽는다, 데이터만). toxic_river_path.json의 독액 몸체 칸에만 점을 놓는다.
// 몸체 = 강 수로 칸(기슭 1칸 뒤, 전부 비보행) + R2 동쪽 뿌리 웅덩이 role=body 칸. 기슭·둥치 칸 제외. 점 간 1.5타일 이상.
// 사용: node tools/rm1/gen_toxic_bubbles.mjs [--seed 1102]
import fs from 'fs';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const SEED = +arg('seed', 1102), A = 'unity/Assets/Exoduser/Remodel/CH1_1/Data';
const river = JSON.parse(fs.readFileSync(A + '/toxic_river_path.json', 'utf8'));
const walk = JSON.parse(fs.readFileSync(A + '/unity_1_1_walk_dump.json', 'utf8'));
const T = river.tileSize, HALF = river.channelHalfWidthTiles, N = 200;
function rng(s) { return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rand = rng(SEED), R = (a, b) => a + (b - a) * rand();
const MIN = 1.5, WIN = [60, 138, 140, 192];                       // 슬라이스 컬러맵 창(타일) — START·R1 컷에서 보이는 구간
const blocked = (x, y) => x < 0 || y < 0 || x >= N || y >= N || walk.walk[y][x] === '1';
const pts = [];
const far = (x, y) => pts.every(p => Math.hypot(p.fx - x, p.fy - y) >= MIN);
const add = (fx, fy, surface) => { pts.push({ fx, fy, surface }); };

// 강: 몸체 3칸당 1점 안팎. 줄마다 후보를 뽑아 간격·몸체 조건을 만족하면 채택(남→북 순서, 줄 단위로 확률 1 → 간격 필터가 밀도를 정한다).
for (const [name, surface] of [['L', 'riverL'], ['R', 'riverR']]) {
  const rows = river.rivers[name].filter(p => p.tx >= WIN[0] && p.tx <= WIN[2] && p.ty >= WIN[1] && p.ty <= WIN[3]);
  for (const p of rows) for (let k = 0; k < 12; k++) {
    const fx = p.tx + R(-(HALF - 0.35), HALF - 0.35), fy = p.ty + R(0.1, 0.9);   // 수로 반폭 안쪽 여유 0.35칸
    if (Math.floor(fx) < 0 || !blocked(Math.floor(fx), p.ty)) continue;           // 몸체 칸은 비보행
    if (!far(fx, fy)) continue;
    if (rand() > 0.85) continue;
    add(fx, fy, surface); break;
  }
}
// R2 동쪽 뿌리 웅덩이: body 칸에 7점(6~8) — 칸 안쪽 0.2 여유, 둥치·기슭 칸 제외
const pool = river.pools.find(p => p.name === 'R2_EAST_TOXIC_ROOT_POOL'), body = pool.tiles.filter(t => t.role === 'body');
let n = 0, guard = 0;
while (n < 7 && guard++ < 4000) { const t = body[(rand() * body.length) | 0], fx = t.tx + R(0.2, 0.8), fy = t.ty + R(0.2, 0.8); if (!far(fx, fy)) continue; add(fx, fy, 'poolE'); n++; }

const points = pts.map(p => ({ x: Math.round(p.fx * T), y: Math.round(p.fy * T), tx: Math.floor(p.fx), ty: Math.floor(p.fy), surface: p.surface, size: +R(0.6, 1.4).toFixed(2), period: +R(2.5, 7.0).toFixed(2), phase: +R(0, 1).toFixed(2) }));
// 검증: 몸체 칸(비보행) 확인, 최소 간격
let minD = 1e9, offBody = 0; for (let i = 0; i < pts.length; i++) { if (!blocked(Math.floor(pts[i].fx), Math.floor(pts[i].fy))) offBody++; for (let j = i + 1; j < pts.length; j++) minD = Math.min(minD, Math.hypot(pts[i].fx - pts[j].fx, pts[i].fy - pts[j].fy)); }
const bySurface = {}; for (const p of points) bySurface[p.surface] = (bySurface[p.surface] || 0) + 1;
const out = { note: 'RM-1 독성 기포 스폰. x,y = 웹 px(원점 좌상단, y 아래로 증가), tx,ty = 타일. 독액 몸체 칸에만. VFX는 점마다 size·period·phase로 비동기 스폰(L9).', seed: SEED, source: 'toxic_river_path.json', tile: T,
  toWorld: 'worldX = x / 100, worldY = -y / 100 (Core 2D 월드: 웹 px / 100, y 아래 = 음수; 3D 층 Z는 RM-1 씬 규칙)', points,
  checks: { count: points.length, bySurface, minPairDistTiles: +minD.toFixed(2), pointsOffBlockedTile: offBody } };
fs.writeFileSync(A + '/toxic_bubble_spawns.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify(out.checks));
