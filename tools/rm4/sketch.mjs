// RM-4 P0-3: 탑뷰 스케치. 걷기 격자(ch1_4_walk.json) 위에 배치 계획(ch1_4_plan.json)의 요소를 그린다. 4px/타일, 800x800.
// 사용: node tools/rm4/sketch.mjs [--si 3] [--out I:/EXODUSER-Storage/rm4/ch1_4_plan_topview.png]
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const here = path.dirname(fileURLToPath(import.meta.url));
const SI = +arg('si', 3), TAG = 'ch1_' + (SI + 1);
const dataDir = path.join(here, '../../unity/Assets/Exoduser/Remodel/CH1_' + (SI + 1) + '/Data');
const OUT = path.resolve(arg('out', 'I:/EXODUSER-Storage/rm' + (SI + 1) + '/' + TAG + '_plan_topview.png'));
const walk = JSON.parse(fs.readFileSync(path.join(dataDir, TAG + '_walk.json'), 'utf8'));
const rooms = JSON.parse(fs.readFileSync(path.join(dataDir, TAG + '_rooms.json'), 'utf8'));
const spawns = JSON.parse(fs.readFileSync(path.join(dataDir, TAG + '_spawns.json'), 'utf8'));
const plan = JSON.parse(fs.readFileSync(path.join(dataDir, TAG + '_plan.json'), 'utf8'));
const N = walk.N, M = walk.M, S = 4, O = +(plan.margin || 16), W = (N + 2 * O) * S, H = (M + 2 * O) * S;
const px = Buffer.alloc(W * H * 3);
const put = (x, y, c, a = 1) => { x = Math.round(x) + O * S; y = Math.round(y) + O * S; if (x < 0 || y < 0 || x >= W || y >= H) return; const o = (y * W + x) * 3; for (let k = 0; k < 3; k++) px[o + k] = Math.round(px[o + k] * (1 - a) + c[k] * a); };
const B = (x, y) => walk.rows[y][x] === '1', TO = (x, y) => walk.tileOnlyRows.rows[y][x] === '1';
for (let y = -O; y < M + O; y++) for (let x = -O; x < N + O; x++) {
  const c = (x < 0 || y < 0 || x >= N || y >= M) ? [30, 24, 26] : !B(x, y) ? [58, 70, 52] : (TO(x, y) ? [16, 13, 13] : [70, 48, 36]);
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) put(x * S + i, y * S + j, c);
}
// 계획 요소 (좌표는 타일)
const disc = (cx, cy, r, c, a) => { for (let y = (cy - r) * S; y <= (cy + r) * S; y++) for (let x = (cx - r) * S; x <= (cx + r) * S; x++) { const dx = x / S - cx, dy = y / S - cy; if (dx * dx + dy * dy <= r * r) put(x, y, c, a); } };
const ring = (cx, cy, r, c) => { for (let k = 0; k < 900; k++) { const t = k / 900 * 2 * Math.PI; put((cx + Math.cos(t) * r) * S, (cy + Math.sin(t) * r) * S, c); } };
const line = (x0, y0, x1, y1, c, w = 1) => { const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * S); for (let k = 0; k <= n; k++) { const t = k / n; for (let j = -w; j <= w; j++) for (let i = -w; i <= w; i++) put((x0 + (x1 - x0) * t) * S + i, (y0 + (y1 - y0) * t) * S + j, c); } };
const rect = (x0, y0, x1, y1, c, a) => { for (let y = y0 * S; y < (y1 + 1) * S; y++) for (let x = x0 * S; x < (x1 + 1) * S; x++) put(x, y, c, a); };
const outline = (x0, y0, x1, y1, c) => { line(x0, y0, x1 + 1, y0, c, 0); line(x0, y1 + 1, x1 + 1, y1 + 1, c, 0); line(x0, y0, x0, y1 + 1, c, 0); line(x1 + 1, y0, x1 + 1, y1 + 1, c, 0); };
// 3x5 숫자·대문자 일부
const F = { 0: '111101101101111', 1: '010110010010111', 2: '111001111100111', 3: '111001111001111', 4: '101101111001001', 5: '111100111001111', 6: '111100111101111', 7: '111001001001001', 8: '111101111101111', 9: '111101111001111', L: '100100100100111', T: '111010010010010', H: '101101111101101', P: '111101111100100', S: '111100111001111', E: '111100111100111', X: '101101010101101', B: '110101110101110', G: '111100101101111', R: '110101110101101', O: '111101101101111', C: '111100100100111', A: '010101111101101', M: '101111111101101', W: '101101111111101', F: '111100110100100' };
const text = (s, x, y, c, sc = 2) => { let ox = x * S - O * S * 0; for (const ch of String(s)) { const g = F[ch]; if (g) for (let r = 0; r < 5; r++) for (let q = 0; q < 3; q++) if (g[r * 3 + q] === '1') for (let j = 0; j < sc; j++) for (let i = 0; i < sc; i++) { put(ox + q * sc + i + 1, y * S + r * sc + j + 1, [0, 0, 0]); put(ox + q * sc + i, y * S + r * sc + j, c); } ox += 4 * sc; } };
const COL = { mass: [120, 90, 160], landmark: [230, 120, 60], toxic: [150, 140, 40], toxicRiver: [120, 112, 30], hell: [210, 40, 30], shaft: [255, 110, 90], occl: [80, 160, 220], story: [240, 220, 170], fg: [140, 200, 140] };
// 뿌리 흐름선(얇은 뼈색) · 낮은 등줄기(굵은 주황) · 심장→보스문 줄기. 굵기는 w0→w1(타일)로 북쪽(끝)일수록 커진다.
const FLOWC = [196, 182, 140], RIDGEC = [235, 150, 70];
if (plan.rootFlow) for (const l of plan.rootFlow.lines) for (let k = 0; k + 1 < l.pts.length; k++) {
  const t = k / (l.pts.length - 1), w = (l.w0 + (l.w1 - l.w0) * t) * S / 2, c = l.ridge ? RIDGEC : FLOWC;
  line(l.pts[k][0], l.pts[k][1], l.pts[k + 1][0], l.pts[k + 1][1], c, Math.max(0, Math.round(w) - (l.ridge ? 0 : 1)));
}
if (plan.rootFlow) { const h = plan.rootFlow.heart; ring(h[0], h[1], plan.rootFlow.heartR, [255, 240, 200]); const g = plan.rootFlow.gateFront; disc(g[0], g[1], 1.2, [255, 240, 200], .9); text('HEART', h[0] + 6, h[1] - 8, [255, 240, 200]); text('GATE', g[0] + 3, g[1] - 4, [255, 240, 200]); }
// P1 창 경계(y32 북쪽은 이번 슬라이스 밖)
if (plan.P1) { const w = plan.P1; for (let x = w.x0; x <= w.x1 + 1; x += 2) put(x * S, w.y0 * S, [255, 255, 255]); text('P1', 4, w.y0 + 1, [255, 255, 255]); }
for (const o of plan.occlusion || []) { rect(o.x0, o.y0, o.x1, o.y1, COL.occl, .22); outline(o.x0, o.y0, o.x1, o.y1, COL.occl); }
for (const r of plan.toxicRibbons || []) for (let k = 0; k + 1 < r.pts.length; k++) line(r.pts[k][0], r.pts[k][1], r.pts[k + 1][0], r.pts[k + 1][1], COL.toxicRiver, Math.max(1, Math.round((r.w || 1) * S / 2)));
for (const t of plan.toxicPools || []) for (const [x, y] of t.tiles || []) rect(x, y, x, y, COL.toxic, .85);
for (const m of plan.masses || []) { for (const [x, y] of m.tiles || []) rect(x, y, x, y, COL.mass, .35); }
for (const l of plan.landmarks || []) { disc(l.x, l.y, l.r || 3, COL.landmark, .55); ring(l.x, l.y, l.r || 3, COL.landmark); text(l.label, l.x + (l.r || 3) + 1, l.y - 1, COL.landmark); }
for (const p of plan.lightPools || []) { ring(p.x, p.y, p.r, p.kind === 'hell' ? COL.hell : COL.toxic); disc(p.x, p.y, .8, p.kind === 'hell' ? COL.hell : COL.toxic, 1); if (p.anchor) text(p.label, p.x + 1, p.y + 1, p.kind === 'hell' ? COL.hell : [210, 200, 80]); }
for (const s of plan.shafts || []) { line(s.x0, s.y0, s.x1, s.y1, COL.shaft, 1); disc(s.x1, s.y1, 1.2, COL.shaft, .8); }
for (const s of plan.story || []) { disc(s.x, s.y, 1.4, COL.story, .9); text(s.label, s.x + 2, s.y - 1, COL.story); }
// 웹 정답 표식: 방 사각형, START, EXIT, 보스 게이트, 소환굴
for (const r of rooms.runtimeRooms) outline(r.x, r.y, r.x + r.w - 1, r.y + r.h - 1, [70, 150, 190]);
for (const h of spawns.holesRuntime) disc(h.tx + .5, h.ty + .5, 1.1, [255, 220, 40], .9);
for (const [x, y] of rooms.exit.tiles) rect(x, y, x, y, [255, 255, 255], 1);
for (const [x, y] of rooms.bossGate.tiles) rect(x, y, x, y, [230, 230, 120], 1);
disc(rooms.start[0] + .5, rooms.start[1] + .5, 2, [80, 140, 255], 1);
// PNG
const crcT = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc = b => { let c = 0xFFFFFFFF; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
const raw = Buffer.alloc((W * 3 + 1) * H); for (let y = 0; y < H; y++) { raw[y * (W * 3 + 1)] = 0; px.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3); }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]));
console.log('wrote', OUT);
