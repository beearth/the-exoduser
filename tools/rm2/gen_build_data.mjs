// RM-2 P1: 배치 계획(ch1_2_plan.json)을 빌더(Rm2SliceBuilder, JsonUtility)가 읽는 평평한 JSON으로 풀어 쓴다.
// 사용: node tools/rm2/gen_build_data.mjs [--plan tools/rm2/ch1_2_plan.json] [--data unity/Assets/Exoduser/Remodel/CH1_2/Data]
import fs from 'fs';
import path from 'path';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const plan = JSON.parse(fs.readFileSync(arg('plan', 'tools/rm2/ch1_2_plan.json'), 'utf8'));
const D = arg('data', 'unity/Assets/Exoduser/Remodel/CH1_2/Data');
const walk = JSON.parse(fs.readFileSync(path.join(D, 'ch1_2_walk.json'), 'utf8'));
const N = walk.N, M = walk.M, W = (x, y) => x >= 0 && y >= 0 && x < N && y < M && walk.rows[y][x] === '0';
const tilesOf = s => {
  const o = [];
  if (s.shape === 'rect') { const [x0, y0, x1, y1] = s.r; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) o.push([x, y]); }
  else if (s.shape === 'ellipse') { const [cx, cy, rx, ry] = s.r; for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) { const dx = (x + .5 - (cx + .5)) / rx, dy = (y + .5 - (cy + .5)) / ry; if (dx * dx + dy * dy <= 1) o.push([x, y]); } }
  else if (s.shape === 'island') { const [x0, y0, x1, y1] = s.r; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (!W(x, y)) o.push([x, y]); }
  else if (s.shape === 'lines') for (const [x0, y0, x1, y1] of s.lines) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) o.push([Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n)]); }
  return o;
};
const flat = t => { const seen = new Set(), o = []; for (const [x, y] of t) { const k = y * N + x; if (seen.has(k)) continue; seen.add(k); if (!W(x, y)) o.push(x, y); } return o; };   // 걷기 칸은 절대 넣지 않는다
const item = (s, extra = {}) => ({ id: s.id, shape: s.shape || '', r: s.r || [], pair: s.pair ? s.pair.r : [], tall: !!s.tall, maxH: s.maxH || 0, tiles: flat([...tilesOf(s), ...(s.pair ? tilesOf(s.pair) : [])]), light: s.light || [], x: 0, y: 0, shaft: false, ...extra });
const out = {
  note: 'tools/rm2/gen_build_data.mjs가 ch1_2_plan.json에서 생성. tiles = [tx,ty,...] 막힘 칸만(걷기 칸 제외)',
  landmarks: plan.landmarks.map(l => item(l)),
  fills: plan.fills.map(f => item(f)),
  toxic: plan.toxic.map(t => item(t)),
  dry: item(plan.dryBed),
  pools: plan.hellPools.map(p => ({ id: p.id, shape: '', r: [], pair: [], tall: false, maxH: 0, tiles: [], light: [], x: p.p[0], y: p.p[1], shaft: !!p.shaft })),
  cuts: plan.cuts.map(c => ({ id: c.id, shape: '', r: [], pair: [], tall: false, maxH: 0, tiles: [], light: [], x: c.c[0], y: c.c[1], shaft: false })),
};
fs.writeFileSync(path.join(D, 'rm2_build.json'), JSON.stringify(out));
console.log('wrote rm2_build.json', JSON.stringify({ landmarks: out.landmarks.map(l => [l.id, l.tiles.length / 2]), fills: out.fills.map(l => [l.id, l.tiles.length / 2]), toxic: out.toxic.map(l => [l.id, l.tiles.length / 2]), dry: out.dry.tiles.length / 2, pools: out.pools.length }));
