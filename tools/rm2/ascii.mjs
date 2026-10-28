// RM-2: 걷기 격자를 2×2 타일 = 1글자로 줄여 출력(계획용 확인 도구). '.'=걷기 '#'=막힘 '+'=섞임, S/E/G/H/e/T = 시작/출구/게이트/소환굴/적/충돌 오브젝트
// 사용: node tools/rm2/ascii.mjs [--data unity/Assets/Exoduser/Remodel/CH1_2/Data] [--name ch1_2] [--step 2]
import fs from 'fs';
import path from 'path';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const D = arg('data', 'unity/Assets/Exoduser/Remodel/CH1_2/Data'), NAME = arg('name', 'ch1_2'), S = +arg('step', 2);
const walk = JSON.parse(fs.readFileSync(path.join(D, NAME + '_walk.json'), 'utf8'));
const rooms = JSON.parse(fs.readFileSync(path.join(D, NAME + '_rooms.json'), 'utf8'));
const sp = JSON.parse(fs.readFileSync(path.join(D, NAME + '_spawns.json'), 'utf8'));
const N = walk.N, M = walk.M, W = (x, y) => x >= 0 && y >= 0 && x < N && y < M && walk.rows[y][x] === '0';
const mark = new Map(); const put = (x, y, c) => mark.set(((y / S) | 0) * 1000 + ((x / S) | 0), c);
for (const o of walk.colObjs) put(~~(o.x / 40), ~~(o.y / 40), 'T');
for (const h of sp.holesRuntime) put(h.tx, h.ty, 'H');
for (const e of sp.enemies.perRun[0]) put(e.tx, e.ty, 'e');
for (const [x, y] of rooms.bossGate.tiles) put(x, y, 'G');
for (const [x, y] of rooms.exit.tiles) put(x, y, 'E');
put(rooms.start[0], rooms.start[1], 'S');
let hdr = '    '; for (let x = 0; x < N; x += S) hdr += (x % 20 === 0) ? String((x / 10) % 10) : ' ';
const out = [hdr];
for (let y = 0; y < M; y += S) {
  let line = String(y).padStart(3) + ' ';
  for (let x = 0; x < N; x += S) {
    const k = ((y / S) | 0) * 1000 + ((x / S) | 0);
    if (mark.has(k)) { line += mark.get(k); continue; }
    let w = 0; for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) w += W(x + i, y + j) ? 1 : 0;
    line += w === 0 ? '#' : w === S * S ? '.' : '+';
  }
  out.push(line);
}
console.log(out.join('\n'));
