// RM-3: 웹 1-3 걷기 격자의 막힘 섬(4방향 연결 성분)과 그 섬을 만든 충돌 오브젝트를 묶는다.
// 입력 = Data/ch1_3_walk.json (extract.mjs 결과). 출력 = Data/ch1_3_blocked_islands.json
// 카메라 쪽 판정: LOOK-001(pitch .85, distance 1400px)에서 카메라는 플레이어 남쪽 ~23타일. 섬의 북쪽 16칸 안에 걷기 칸이 있으면 camSide=1(높이 0.9u 상한, RM-1 규칙).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(here, '../../unity/Assets/Exoduser/Remodel/CH1_3/Data');
const W = JSON.parse(fs.readFileSync(path.join(DATA, 'ch1_3_walk.json'), 'utf8'));
const N = W.N, M = W.M, T = W.tile, blk = (x, y) => W.rows[y][x] === '1';
const seen = new Uint8Array(N * M), out = [];
for (let y = 0; y < M; y++) for (let x = 0; x < N; x++) {
  if (!blk(x, y) || seen[y * N + x]) continue;
  const comp = [[x, y]]; seen[y * N + x] = 1;
  for (let h = 0; h < comp.length; h++) { const [cx, cy] = comp[h]; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = cx + dx, ny = cy + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= M || seen[ny * N + nx] || !blk(nx, ny)) continue; seen[ny * N + nx] = 1; comp.push([nx, ny]); } }
  let x0 = N, y0 = M, x1 = 0, y1 = 0, sx = 0, sy = 0; for (const [a, b] of comp) { x0 = Math.min(x0, a); y0 = Math.min(y0, b); x1 = Math.max(x1, a); y1 = Math.max(y1, b); sx += a; sy += b; }
  // 카메라 쪽: 섬 칸 바로 북쪽 1~16칸에 걷기 칸이 있는가
  let camSide = 0; for (const [a, b] of comp) { for (let k = 1; k <= 16 && !camSide; k++) { const yy = b - k; if (yy < 0) break; if (!blk(a, yy)) camSide = 1; } if (camSide) break; }
  const objs = W.colObjList.filter(o => { const tx = Math.floor(o.x / T), ty = Math.floor(o.y / T); return comp.some(([a, b]) => Math.abs(a - tx) <= Math.ceil((o.r || o.w) / T) + 1 && Math.abs(b - ty) <= Math.ceil((o.r || o.h) / T) + 1); })
    .map(o => ({ type: o.type, px: [o.x, o.y], tile: [+(o.x / T).toFixed(1), +(o.y / T).toFixed(1)], shape: o.shape, rPx: o.r, wPx: o.w, hPx: o.h }));
  out.push({ id: out.length, size: comp.length, bbox: [x0, y0, x1, y1], center: [+(sx / comp.length).toFixed(1), +(sy / comp.length).toFixed(1)], camSide, source: objs.length ? 'colObj' : 'tile', objs });
}
out.sort((a, b) => b.size - a.size); out.forEach((o, i) => o.id = i);
fs.writeFileSync(path.join(DATA, 'ch1_3_blocked_islands.json'), JSON.stringify({ note: '웹 1-3(si2) 막힘 섬. camSide=1이면 북쪽 16칸 안에 걷기 칸이 있어 카메라 쪽 높이 0.9u 상한(RM-1 규칙)', from: 'ch1_3_walk.json', count: out.length, camSideCount: out.filter(o => o.camSide).length, islands: out }, null, 1));
console.log(out.length, 'islands; camSide', out.filter(o => o.camSide).length);
for (const o of out) console.log(o.id, o.size, JSON.stringify(o.bbox), o.camSide, o.source, o.objs.map(q => q.type + '@' + q.tile.join(',')).join(' '));
