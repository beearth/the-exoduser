// RM-2: 걷기 격자 부분 확대(1타일=1글자). '.'=걷기 'v'=카메라 쪽 막힘(북쪽 16칸·좌우 5칸 안에 걷기 → 높이 0.9u 이하) 'T'=높은 덩어리 허용 막힘
// 사용: node tools/rm2/zoom.mjs x0 y0 x1 y1 [--data ...]
import fs from 'fs';
import path from 'path';
const a = process.argv.slice(2).filter(s => !s.startsWith('--')).map(Number);
const di = process.argv.indexOf('--data'); const D = di > 0 ? process.argv[di + 1] : 'unity/Assets/Exoduser/Remodel/CH1_2/Data';
const w = JSON.parse(fs.readFileSync(path.join(D, 'ch1_2_walk.json'), 'utf8'));
const N = w.N, M = w.M, W = (x, y) => x >= 0 && y >= 0 && x < N && y < M && w.rows[y][x] === '0';
const south = (x, y) => { for (let yy = y - 16; yy < y; yy++) for (let xx = x - 5; xx <= x + 5; xx++) if (W(xx, yy)) return true; return false; };
const [x0, y0, x1, y1] = a;
let h = '    '; for (let x = x0; x <= x1; x++) h += x % 10 === 0 ? String((x / 10) % 10) : (x % 5 === 0 ? '|' : ' ');
console.log(h);
for (let y = y0; y <= y1; y++) { let l = String(y).padStart(3) + ' '; for (let x = x0; x <= x1; x++) l += W(x, y) ? '.' : south(x, y) ? 'v' : 'T'; console.log(l); }
