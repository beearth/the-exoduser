// RM-2 P0-3: 배치 계획(ch1_2_plan.json)을 웹 걷기 격자 위에 검증하고 탑뷰 스케치 PNG(4px/타일)를 그린다.
// 검증: 랜드마크·독액·마른 물길 = 막힘 칸 안에만 / tall 랜드마크 = 카메라 쪽 가림 구역(북쪽 16칸·좌우 5칸 안에 걷기) 밖 / 빛 웅덩이 = 걷기 칸 / 컷 화면당 빛 웅덩이 수.
// 사용: node tools/rm2/sketch.mjs [--plan tools/rm2/ch1_2_plan.json] [--data unity/Assets/Exoduser/Remodel/CH1_2/Data] [--out I:/EXODUSER-Storage/rm2/ch1_2_topview.png] [--copy tools/rm2/ch1_2_topview.png]
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const plan = JSON.parse(fs.readFileSync(arg('plan', 'tools/rm2/ch1_2_plan.json'), 'utf8'));
const D = arg('data', 'unity/Assets/Exoduser/Remodel/CH1_2/Data');
const walk = JSON.parse(fs.readFileSync(path.join(D, 'ch1_2_walk.json'), 'utf8'));
const rooms = JSON.parse(fs.readFileSync(path.join(D, 'ch1_2_rooms.json'), 'utf8'));
const sp = JSON.parse(fs.readFileSync(path.join(D, 'ch1_2_spawns.json'), 'utf8'));
const N = walk.N, M = walk.M, W = (x, y) => x >= 0 && y >= 0 && x < N && y < M && walk.rows[y][x] === '0';
const camSide = (x, y) => { for (let yy = y - 16; yy < y; yy++) for (let xx = x - 5; xx <= x + 5; xx++) if (W(xx, yy)) return true; return false; };
const tilesOf = s => {
  const o = [];
  if (s.shape === 'rect') { const [x0, y0, x1, y1] = s.r; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) o.push([x, y]); }
  else if (s.shape === 'ellipse') { const [cx, cy, rx, ry] = s.r; for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) { const dx = (x + .5 - (cx + .5)) / rx, dy = (y + .5 - (cy + .5)) / ry; if (dx * dx + dy * dy <= 1) o.push([x, y]); } }
  else if (s.shape === 'island') { const [x0, y0, x1, y1] = s.r; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (!W(x, y)) o.push([x, y]); }
  else if (s.shape === 'lines') for (const [x0, y0, x1, y1] of s.lines) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let i = 0; i <= n; i++) o.push([Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n)]); }
  return o;
};
const report = { landmarks: [], toxic: [], pools: [], cuts: [] };
const check = (item, tall) => { const t = tilesOf(item); return { id: item.id, tiles: t.length, onWalk: t.filter(([x, y]) => W(x, y)).length, tallInCamSide: tall ? t.filter(([x, y]) => !W(x, y) && camSide(x, y)).length : 0 }; };
for (const l of plan.landmarks) { const r = check(l, l.tall); if (l.pair) { const p = check({ ...l.pair, id: l.id + 'b' }, l.tall); r.tiles += p.tiles; r.onWalk += p.onWalk; r.tallInCamSide += p.tallInCamSide; } r.tall = !!l.tall; r.camSideTiles = tilesOf(l).filter(([x, y]) => camSide(x, y)).length; report.landmarks.push(r); }
report.fills = (plan.fills || []).map(f => ({ ...check(f, false), camSideTiles: tilesOf(f).filter(([x, y]) => camSide(x, y)).length }));
for (const t of [...plan.toxic, plan.dryBed]) report.toxic.push(check(t, false));
// 걷기 영역 안 막힘 섬마다 계획 요소(랜드마크·채움·독액)가 덮는지 = 보이지 않는 벽 0 계획
const planned = new Set([...plan.landmarks, ...(plan.fills || []), ...plan.toxic].flatMap(s => tilesOf(s).map(([x, y]) => y * N + x)));
const islandRes = walk.blockedIslandsInsideWalk.map(is => { const [x0, y0, x1, y1] = is.bbox; let n = 0, c = 0; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (!W(x, y)) { n++; if (planned.has(y * N + x)) c++; } return { bbox: is.bbox, tiles: n, covered: c }; });
report.islands = islandRes;
for (const p of plan.hellPools) report.pools.push({ id: p.id, onWalk: W(p.p[0], p.p[1]) });
const S = plan.screen;
const inCut = (c, [x, y]) => x >= c[0] - S.halfW && x <= c[0] + S.halfW && y >= c[1] - S.north && y <= c[1] + S.south;
for (const c of plan.cuts) report.cuts.push({ id: c.id, c: c.c, hellPools: plan.hellPools.filter(p => inCut(c.c, p.p)).map(p => p.id), toxicLights: plan.toxic.filter(t => inCut(c.c, t.light)).map(t => t.id), shafts: plan.hellPools.filter(p => p.shaft && inCut(c.c, p.p)).length });
// 카메라 쪽 가림 구역 통계
let camLow = 0, tallOk = 0; for (let y = 0; y < M; y++) for (let x = 0; x < N; x++) if (!W(x, y)) { if (camSide(x, y)) camLow++; else tallOk++; }
report.zones = { blocked: camLow + tallOk, cameraSideLow: camLow, tallAllowed: tallOk, rule: '막힘 칸 중 북쪽 16칸·좌우 5칸 안에 걷기 칸이 있으면 카메라 쪽(높이 0.9u 이하), RM-1 Rm1SliceBuilder.SouthOfWalk와 같은 규칙' };
report.ok = report.landmarks.every(r => r.onWalk === 0 && r.tallInCamSide === 0) && report.fills.every(r => r.onWalk === 0) && report.toxic.every(r => r.onWalk === 0) && report.pools.every(p => p.onWalk) && report.islands.every(i => i.covered === i.tiles);

// ---- PNG ----
const K = 4, PW = N * K, PH = M * K, px = Buffer.alloc(PW * PH * 3);
const put = (x, y, c, a = 1) => { if (x < 0 || y < 0 || x >= PW || y >= PH) return; const o = (y * PW + x) * 3; for (let i = 0; i < 3; i++) px[o + i] = Math.round(px[o + i] * (1 - a) + c[i] * a); };
const fillT = (tx, ty, c, a = 1) => { for (let j = 0; j < K; j++) for (let i = 0; i < K; i++) put(tx * K + i, ty * K + j, c, a); };
for (let y = 0; y < M; y++) for (let x = 0; x < N; x++) fillT(x, y, W(x, y) ? [58, 84, 62] : camSide(x, y) ? [34, 30, 46] : [46, 32, 24]);
// 걷기 칸 경계선
for (let y = 0; y < M; y++) for (let x = 0; x < N; x++) if (W(x, y)) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!W(x + dx, y + dy)) for (let k = 0; k < K; k++) put(dx === 1 ? x * K + K - 1 : dx === -1 ? x * K : x * K + k, dy === 1 ? y * K + K - 1 : dy === -1 ? y * K : y * K + k, [120, 150, 120]);
const ring = (cx, cy, r, c, a = 1) => { for (let t = 0; t < 720; t++) { const q = t / 720 * 2 * Math.PI; put(Math.round((cx + .5) * K + Math.cos(q) * r * K), Math.round((cy + .5) * K + Math.sin(q) * r * K), c, a); } };
const dot = (cx, cy, r, c) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r) put(Math.round((cx + .5) * K) + i, Math.round((cy + .5) * K) + j, c); };
const rect = (x0, y0, x1, y1, c) => { for (let x = x0 * K; x <= (x1 + 1) * K; x++) { put(x, y0 * K, c); put(x, (y1 + 1) * K, c); } for (let y = y0 * K; y <= (y1 + 1) * K; y++) { put(x0 * K, y, c); put((x1 + 1) * K, y, c); } };
// 컷 화면
for (const c of plan.cuts) rect(c.c[0] - S.halfW, c.c[1] - S.north, c.c[0] + S.halfW, c.c[1] + S.south, [200, 200, 210]);
// 독액·마른 물길
for (const t of plan.toxic) for (const [x, y] of tilesOf(t)) fillT(x, y, [120, 104, 30], .9);
for (const [x, y] of tilesOf(plan.dryBed)) fillT(x, y, [110, 80, 60], .55);
// 랜드마크
for (const l of plan.landmarks) { const col = l.tall ? [230, 90, 220] : [250, 170, 240]; for (const s of [l, l.pair].filter(Boolean)) for (const [x, y] of tilesOf(s)) fillT(x, y, col, .75); }
for (const f of plan.fills || []) for (const [x, y] of tilesOf(f)) fillT(x, y, [150, 150, 170], .8);
// 빛 웅덩이·빛줄기·독액광
for (const p of plan.hellPools) { ring(p.p[0], p.p[1], 6, [220, 50, 40]); dot(p.p[0], p.p[1], 3, [220, 50, 40]); if (p.shaft) for (let i = 0; i < 40; i++) put(Math.round((p.p[0] + .5) * K) - 22 + i, Math.round((p.p[1] + .5) * K) - 40 + i, [255, 120, 100]); }
for (const t of plan.toxic) { ring(t.light[0], t.light[1], 4, [200, 200, 70]); }
// 웹 정답 표식
for (const h of sp.holesRuntime) { dot(h.tx, h.ty, 2, [255, 220, 40]); }
dot(rooms.start[0], rooms.start[1], 5, [80, 140, 255]);
for (const [x, y] of rooms.exit.tiles) dot(x, y, 2, [255, 255, 255]);
for (const [x, y] of rooms.bossGate.tiles) dot(x, y, 2, [230, 230, 120]);
// 3x5 글꼴 라벨
const F = { 0: '111101101101111', 1: '010110010010111', 2: '111001111100111', 3: '111001111001111', 4: '101101111001001', 5: '111100111001111', 6: '111100111101111', 7: '111001010010010', 8: '111101111101111', 9: '111101111001111', L: '100100100100111', M: '101111111101101', T: '111010010010010', X: '101101010101101', H: '101101111101101', S: '011100010001110', A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', R: '110101110101101', '-': '000000111000000', F: '111100111100100', E: '111100111100111', P: '110101110100100' };
const text = (s, x, y, c) => { let cx = x; for (const ch of s) { const g = F[ch]; if (g) for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) if (g[j * 3 + i] === '1') for (let u = 0; u < 2; u++) for (let v = 0; v < 2; v++) { put(cx + i * 2 + u, y + j * 2 + v, [0, 0, 0]); put(cx + i * 2 + u - 1, y + j * 2 + v - 1, c); } cx += 8; } };
for (const l of plan.landmarks) { const r = l.r; const [lx, ly] = l.shape === 'rect' ? [r[0], r[1]] : [r[0], r[1]]; text(l.id, lx * K + 6, ly * K - 4, [255, 230, 255]); }
for (const f of plan.fills || []) text(f.id, f.r[2] * K + 6, f.r[1] * K - 2, [210, 210, 230]);
for (const t of plan.toxic) text(t.id, t.light[0] * K + 8, t.light[1] * K + 6, [240, 240, 120]);
for (const p of plan.hellPools) text('H' + p.id.split('_').pop(), p.p[0] * K + 10, p.p[1] * K - 6, [255, 150, 140]);
for (const c of plan.cuts) text(c.id.split(' ')[0], (c.c[0] - S.halfW) * K + 3, (c.c[1] - S.north) * K + 3, [230, 230, 240]);
text('START', rooms.start[0] * K + 12, rooms.start[1] * K + 6, [150, 190, 255]);
const crcT = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc = b => { let c = 0xFFFFFFFF; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
const raw = Buffer.alloc((PW * 3 + 1) * PH); for (let y = 0; y < PH; y++) { raw[y * (PW * 3 + 1)] = 0; px.copy(raw, y * (PW * 3 + 1) + 1, y * PW * 3, (y + 1) * PW * 3); }
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(PW, 0); ihdr.writeUInt32BE(PH, 4); ihdr[8] = 8; ihdr[9] = 2;
const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
const out = arg('out', 'I:/EXODUSER-Storage/rm2/ch1_2_topview.png'); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, png);
const cp = arg('copy', null); if (cp) fs.writeFileSync(cp, png);
fs.writeFileSync(path.join(D, 'ch1_2_plan_check.json'), JSON.stringify(report, null, 1));
console.log(JSON.stringify(report));
