// RM-4 P0-3: 1-4 배치 계획 데이터 생성(결정적). 입력 = 웹 정답 ch1_4_walk/reach/rooms/spawns.json. 출력 = ch1_4_plan.json(스케치·P1 빌더 입력).
// 원칙: 3D 덩어리·랜드마크·독액은 막힘 칸(지도 안 충돌 섬 + 지도 밖 띠)에만. 걷기 칸 위 뿌리 = 지형 질감·데칼(메시 없음). 보스방(값 4, x80~120 y6~30)·게이트는 보스전 총괄 소관이라 비운다.
// 사용: node tools/rm4/plan.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url));
const D = path.join(here, '../../unity/Assets/Exoduser/Remodel/CH1_4/Data');
const J = f => JSON.parse(fs.readFileSync(path.join(D, f), 'utf8'));
const walk = J('ch1_4_walk.json'), reach = J('ch1_4_reach.json'), rooms = J('ch1_4_rooms.json'), spawns = J('ch1_4_spawns.json');
const N = walk.N, M = walk.M, MARGIN = 16;
const blocked = (x, y) => x < 0 || y < 0 || x >= N || y >= M || walk.rows[y][x] === '1';
let seed = 1104; const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

// ---- 보스 소관 영역(배치 금지) ----
const boss = rooms.runtimeRooms.find(r => r.type === 'boss');
const bossZone = { x0: boss.x, y0: 0, x1: boss.x + boss.w - 1, y1: boss.y + boss.h - 1, note: '보스방(G.map 값 4)·기둥 4개·출구(y7)·보스 게이트(y5, boss_gate_col). 보스전 총괄 소관 — RM-4는 덩어리·독액·빛을 두지 않는다' };
const inBoss = (x, y) => x >= bossZone.x0 && x <= bossZone.x1 && y >= bossZone.y0 && y <= bossZone.y1;

// ---- 막힘 섬 분류 ----
const isl = reach.innerBlockedIslands.list;
const tilesOf = b => { const out = []; for (let y = b.bbox[1]; y <= b.bbox[3]; y++) for (let x = b.bbox[0]; x <= b.bbox[2]; x++) if (blocked(x, y)) out.push([x, y]); return out; };
const colAt = b => walk.colObjs.find(o => o.x / 40 >= b.bbox[0] && o.x / 40 <= b.bbox[2] + 1 && o.y / 40 >= b.bbox[1] && o.y / 40 <= b.bbox[3] + 1);
const LANDMARK = {
  '97,57': { id: 'L1', name: '심장 뿌리 매듭', role: '모든 뿌리가 모이는 숲의 심장(웹 m_throne 중앙). 1-4 대표 컷 중심' },
  '41,61': { id: 'L2', name: '뼈 감긴 서쪽 아치', role: '먼저 먹힌 자들의 뼈가 뿌리에 감겨 굳은 아치(웹 m_bone_arch). 진홍 웅덩이 쪽' },
  '153,61': { id: 'L3', name: '동쪽 살 아가리 샘', role: '뿌리 사이 살 아가리가 독액을 토해 내는 주 늪(웹 m_flesh_maw). 독액 쪽' },
  '44,166': { id: 'L4', name: '남서 갈라진 거목', role: 'START 서쪽 첫 인상 — 뿌리가 땅을 갈라 들어 올린 거목(웹 m_ctree12)' },
  '34,19': { id: 'L5', name: '북서 거목 문지기', role: '보스문 앞마당 서쪽을 막는 거목(웹 m_ctree11). 마지막 압축 프레이밍' },
};
const masses = [], landmarks = [], skipped = [];
for (const b of isl) {
  const key = b.bbox[0] + ',' + b.bbox[1], c = colAt(b), tiles = tilesOf(b);
  const cx = (b.bbox[0] + b.bbox[2] + 1) / 2, cy = (b.bbox[1] + b.bbox[3] + 1) / 2;
  if (tiles.some(([x, y]) => inBoss(x, y))) { skipped.push({ bbox: b.bbox, size: b.size, type: c && c.type, why: '보스 소관 영역' }); continue; }
  const lm = LANDMARK[key];
  const m = { kind: lm ? 'landmark' : (b.size >= 21 ? 'knot_large' : 'knot'), bbox: b.bbox, size: b.size, webType: c && c.type, cx, cy, tiles };
  masses.push(m);
  if (lm) landmarks.push({ ...lm, x: cx, y: cy, r: Math.max(b.bbox[2] - b.bbox[0] + 1, b.bbox[3] - b.bbox[1] + 1) / 2, label: lm.id, bbox: b.bbox, webType: c && c.type });
}

// ---- 지도 밖 외곽 띠(막힘) ----
const rim = [
  { side: 'west', x0: -MARGIN, y0: -MARGIN, x1: -1, y1: M + MARGIN - 1, height: '높게(옆면)' },
  { side: 'east', x0: N, y0: -MARGIN, x1: N + MARGIN - 1, y1: M + MARGIN - 1, height: '높게(옆면)' },
  { side: 'north', x0: 0, y0: -MARGIN, x1: N - 1, y1: -1, height: '높게(플레이어 뒤)' },
  { side: 'south', x0: 0, y0: M, x1: N - 1, y1: M + MARGIN - 1, height: 'y200~215 0.9u 이하, 그 남쪽만 시선 쐐기(§카메라)' },
];

// ---- 독성 강: 서·동 외곽 띠에서 남→북, 북쪽 외곽 띠에서 중앙(보스문 뒤)으로 수렴 ----
const riverW = { id: 'riverW', dir: '남→북→동(보스문 뒤로 수렴)', w: 4, pts: [[-6, 214], [-7, 170], [-5, 120], [-8, 70], [-6, 30], [-4, -4], [30, -7], [70, -6], [96, -9]] };
const riverE = { id: 'riverE', dir: '남→북→서(보스문 뒤로 수렴)', w: 4, pts: [[206, 214], [207, 165], [205, 115], [208, 60], [205, 25], [203, -4], [170, -6], [130, -7], [104, -9]] };
const heartSink = { id: 'heartSink', note: '두 강이 만나 보스문(100,5) 뒤 둥지 심장(지도 밖 y<0)으로 스며든다 = 2장 입구 방향(CH2 뼈대 §4.1)', x: 100, y: -11 };
// 지류: 지도 안으로 들어오지 않는다. 외곽 띠의 벽 균열에서 강으로 떨어지는 작은 낙차만.
const falls = [[-2, 150], [-2, 92], [-2, 40], [201, 138], [201, 84], [201, 30], [40, -2], [160, -2]].map(([x, y], i) => ({ id: 'fall' + i, x, y }));

// ---- 독액 웅덩이(섬 안, 몸체/기슭 구분) ----
const poolOf = (bbox, id, role) => { const t = []; for (let y = bbox[1]; y <= bbox[3]; y++) for (let x = bbox[0]; x <= bbox[2]; x++) if (blocked(x, y)) { const shore = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !blocked(x + dx, y + dy)); t.push([x, y, shore ? 'shore' : 'body']); } return { id, role, bbox, tiles: t.map(([x, y]) => [x, y]), body: t.filter(v => v[2] === 'body').length, shore: t.filter(v => v[2] === 'shore').length }; };
const toxicPools = [
  poolOf([153, 61, 159, 67], 'poolE', 'L3 주 늪 — 살 아가리가 토한 독액. 아가리 둥치 칸 제외, 몸체 칸에만 독액'),
  poolOf([31, 151, 33, 153], 'poolSW', '작은 스밈(서쪽 가장자리, 서쪽 강 쪽)'),
  poolOf([62, 187, 64, 189], 'poolS', 'START 남서 작은 스밈 — 첫 인상은 작게(맵 보드 §6.1 R1 규칙)'),
];

// ---- 빛 웅덩이: 26타일 지터 격자. 한 화면(1600x900, LOOK-001 ≈ 40x30타일)에 진홍 1~2 + 독액 0~2 = 2~4개(L-1·L-2). 서로 10타일(400px) 이상, 사이는 어둡게(W7) ----
const gridPools = []; let ph = 0, pt = 0;
for (let gy = 44; gy <= 196; gy += 26) for (let gx = 10; gx <= 192; gx += 26) {
  const x = Math.round(gx + (rnd() - .5) * 10), y = Math.round(gy + (rnd() - .5) * 10);
  if (inBoss(x, y) || y < 34) continue;
  if (gridPools.some(p => Math.hypot(p.x - x, p.y - y) < 10)) continue;
  const nearToxic = toxicPools.some(t => Math.hypot(x - (t.bbox[0] + t.bbox[2]) / 2, y - (t.bbox[1] + t.bbox[3]) / 2) < 12) || x < 14 || x > 186;
  const kind = nearToxic ? 'toxic' : 'hell';
  const r = kind === 'hell' ? +(5 + rnd() * 2).toFixed(1) : +(3 + rnd() * 1.5).toFixed(1); // 타일. 진홍 200~280u(5~7타일), 독액 120~180u(3~4.5타일)
  const xx = kind === 'toxic' && (x < 14 || x > 186) ? (x < 100 ? 3 : 196) : x;
  if (gridPools.some(p => Math.hypot(p.x - xx, p.y - y) < 10)) continue;
  gridPools.push({ kind, x: xx, y, r, label: kind === 'hell' ? 'H' + (++ph) : 'T' + (++pt) });
}
const pools = gridPools.filter(p => p.kind === 'toxic'); // 독액 13개: 외곽 띠·섬 쪽, P0 그대로
// P0 판정 조건 1(맵 총괄 10-28): 진홍은 주 동선(START→보스문)과 랜드마크 접근로를 따라 무리 짓고, 먼 들판은 어둡게 비운다. 총 20개 안팎.
// 동선은 x=100 중심선을 따라 ±8 지그재그(진홍 반경 5~7타일), 접근로는 동선에서 갈라지는 길을 따라 1~2개씩. 독액과는 10타일 이상.
const hellSpec = [
  // 주 동선 START(100,185) → R1 → 대장간(100,120) → 심장 L1(100,60) → 보스문 앞(100,34)
  ['H1', 92, 181, 6], ['H2', 108, 165, 5.5], ['H3', 93, 149, 6.5], ['H4', 108, 133, 5.5], ['H5', 92, 117, 6], ['H6', 108, 101, 6], ['H7', 92, 85, 6.5],
  ['HL1', 100, 69, 8, 'L1 심장 남쪽 앞(큰 반경·느린 숨, 대표 컷)'], ['H8', 109, 49, 6], ['H9', 91, 41, 6], ['H10', 103, 35, 5],
  // 랜드마크 접근로
  ['HL2', 53, 66, 7, 'L2 아치 동쪽'], ['H11', 74, 83, 5.5], ['H12', 136, 74, 6], ['H13', 121, 92, 5.5],
  ['HL4', 61, 168, 6.5, 'L4 거목 동쪽'], ['H14', 78, 157, 5.5],
  ['H15', 147, 150, 6], ['H16', 126, 176, 5.5], ['H17', 172, 100, 5.5],
];
for (const [label, x, y, r, anchor] of hellSpec) pools.push({ kind: 'hell', x, y, r, label, ...(anchor ? { anchor } : {}) });
pools.push({ kind: 'toxic', x: 150, y: 64, r: 4.5, label: 'TL3', anchor: 'L3 늪 서쪽 기슭' });
const poolSepViolations = []; for (let i = 0; i < pools.length; i++) for (let j = i + 1; j < pools.length; j++) { const d = Math.hypot(pools[i].x - pools[j].x, pools[i].y - pools[j].y); if (d < 10) poolSepViolations.push([pools[i].label, pools[j].label, +d.toFixed(1)]); }
// 화면(40x30타일) 창 안 웅덩이 수: 동선 창(중심 x85~115) / 먼 들판 창 분포
const winCount = (cx, cy) => pools.filter(p => Math.abs(p.x - cx) <= 20 && Math.abs(p.y - cy) <= 15).length;
const hist = (list) => { const h = {}; for (const [cx, cy] of list) { const n = winCount(cx, cy); h[n] = (h[n] || 0) + 1; } return h; };
const routeWins = [], farWins = [];
for (let cy = 48; cy <= 184; cy += 4) for (let cx = 20; cx <= 180; cx += 4) { if (blocked(cx, cy)) continue; (cx >= 85 && cx <= 115 ? routeWins : farWins).push([cx, cy]); }
const lightWindowHist = { route: hist(routeWins), far: hist(farWins), routeWindows: routeWins.length, farWindows: farWins.length };

// ---- 붉은 빛줄기(L-2·D12): 뿌리 지붕 틈 ----
const shafts = [
  { id: 'S_START', x0: 112, y0: 172, x1: 104, y1: 182, note: 'START 오른쪽 위 틈' },
  { id: 'S_L4', x0: 58, y0: 158, x1: 50, y1: 166, note: 'L4 거목 위' },
  { id: 'S_HEART', x0: 108, y0: 54, x1: 100, y1: 64, note: 'L1 심장 위로 모이는 빛 — 1-4 대표 컷' },
  { id: 'S_GATE', x0: 106, y0: 30, x1: 100, y1: 38, note: '보스문 앞마당(보스방 밖 y≥32)' },
];

// ---- W8 이야기 ----
const story = [
  { id: 'W8a', x: 104, y: 59, label: 'C', note: 'L1 매듭 속 고치들 — 먼저 먹힌 자들이 뿌리에 감겨 잠든 듯(STY-D7 얼굴 원칙). 섬 칸 안' },
  { id: 'W8b', x: 44, y: 62, label: 'B', note: 'L2 아치 뼈 — 뿌리가 뼈를 감아 올린 문. 글자·묘비 없음' },
  { id: 'W8c', x: 100, y: 46, label: 'D', note: '드루이드가 끌고 간 자국 데칼(걷기 칸 바닥, 시각 전용) L1→보스문' },
];

// ---- 카메라 가림(LOOK-001, 카메라 남쪽) ----
// 걷기 칸이 북쪽 16칸 이내에 있는 막힘 칸 위 덩어리 = 플레이어와 카메라 사이. 1-4는 사방이 열려 지도 안 모든 섬이 해당.
const southOfWalk = (x, y) => { for (let yy = y - 16; yy < y; yy++) for (let xx = x - 5; xx <= x + 5; xx++) if (!blocked(xx, yy)) return true; return false; };
let massTiles = 0, massTilesSouthOfWalk = 0; for (const m of masses) for (const [x, y] of m.tiles) { massTiles++; if (southOfWalk(x, y)) massTilesSouthOfWalk++; }
const occlusion = [
  { id: 'O_rimS', x0: 0, y0: 200, x1: 199, y1: 215, note: '남쪽 외곽 띠 — START·남쪽 걷기 칸 바로 앞. 0.9u 이하' },
  ...masses.filter(m => m.kind !== 'knot').map(m => ({ id: 'O_' + (m.kind === 'landmark' ? landmarks.find(l => l.bbox === m.bbox).id : m.bbox.join('_')), x0: m.bbox[0], y0: m.bbox[1], x1: m.bbox[2], y1: m.bbox[3], note: m.kind })),
];

// ---- P1 창(맵 총괄 승인 ①): 지형 x0~199 × y32~199 + 지도 밖 띠 16타일. y<32는 이번 슬라이스 밖(보스방 연출은 보스전 총괄과 맞춘다) ----
const P1 = { x0: 0, y0: 32, x1: 199, y1: 199, rimTiles: MARGIN, note: 'y<32(보스방·게이트·북쪽 필드·L5)는 이번 슬라이스 밖. 북쪽 가장자리 y32는 FOG-LOW로 사라지게 처리' };

// ---- 뿌리 흐름선·등줄기 (P0 판정 조건 2) ----
// 모든 뿌리가 북쪽 심장(L1)으로 모이고, 심장에서 보스문 앞(100,34)으로 굵은 줄기가 이어진다. 굵기·밀도는 북쪽일수록 커진다.
// 흐름선 = 바닥 데칼 곡선(시각 전용, 걷기 칸 위 메시 없음). 등줄기 = 그중 굵은 7줄, 지형 높이 0.04u 이하의 낮은 둔덕(충돌·덩어리 아님, 시선 쐐기 이내).
const HEART = [100.5, 60.5], HEART_R = 4.6, GATE_FRONT = [100.5, 34];
const bez = (p0, p1, p2, t) => [(1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0], (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]];
const flowLines = [];
const starts = [];
for (let x = 6; x <= 194; x += 15) starts.push([x + (rnd() - .5) * 6, 197 + rnd() * 1.5]);          // 남쪽 가장자리 13
for (let y = 74; y <= 182; y += 18) { starts.push([2 + rnd() * 2, y + (rnd() - .5) * 6]); starts.push([196 + rnd() * 2, y + (rnd() - .5) * 6]); } // 서·동 가장자리 14
starts.push([100, 196], [96, 195], [104, 195]); // START에서 곧게 올라오는 줄기 3
for (const st of starts) {
  const dx = HEART[0] - st[0], dy = HEART[1] - st[1], L = Math.hypot(dx, dy);
  const ang = Math.atan2(dy, dx), ex = [HEART[0] - Math.cos(ang) * HEART_R, HEART[1] - Math.sin(ang) * HEART_R]; // 심장 둘레에서 끝난다
  const side = (st[0] < 100 ? -1 : 1) * (rnd() < .5 ? 1 : .6), bend = L * (0.10 + rnd() * 0.14) * side;
  const mid = [(st[0] + ex[0]) / 2 + (-dy / L) * bend * -1, (st[1] + ex[1]) / 2 + (dx / L) * bend * -1];
  const pts = []; for (let k = 0; k <= 16; k++) pts.push(bez(st, mid, ex, k / 16).map(v => +v.toFixed(2)));
  flowLines.push({ id: 'F' + flowLines.length, pts, w0: +(0.30 + rnd() * 0.15).toFixed(2), w1: +(0.9 + rnd() * 0.4).toFixed(2), ridge: false });
}
// 굵은 등줄기 7: 서·남서·남·남동·동 방향에서 심장으로
const ridgeFrom = [[4, 120], [22, 190], [70, 197], [100, 196], [130, 197], [178, 190], [196, 120]];
for (const st of ridgeFrom) {
  const dx = HEART[0] - st[0], dy = HEART[1] - st[1], L = Math.hypot(dx, dy), ang = Math.atan2(dy, dx), ex = [HEART[0] - Math.cos(ang) * HEART_R, HEART[1] - Math.sin(ang) * HEART_R];
  const side = st[0] < 100 ? -1 : (st[0] > 100 ? 1 : 0), bend = L * 0.12 * side;
  const mid = [(st[0] + ex[0]) / 2 + (dy / L) * bend, (st[1] + ex[1]) / 2 - (dx / L) * bend];
  const pts = []; for (let k = 0; k <= 20; k++) pts.push(bez(st, mid, ex, k / 20).map(v => +v.toFixed(2)));
  flowLines.push({ id: 'R' + flowLines.filter(l => l.ridge).length, pts, w0: 0.8, w1: 1.7, ridge: true, hMaxU: 0.10 });
}
// 심장 → 보스문 앞 줄기(5가닥, 위로 갈수록 한 점으로 모인다)
for (const k of [-2, -1, 0, 1, 2]) {
  const p0 = [HEART[0] + k * 1.1, HEART[1] - HEART_R], p2 = [GATE_FRONT[0] + k * 0.45, GATE_FRONT[1]], p1 = [HEART[0] + k * 1.6 * (k < 0 ? 1 : 1), (p0[1] + p2[1]) / 2];
  const pts = []; for (let t = 0; t <= 12; t++) pts.push(bez(p0, p1, p2, t / 12).map(v => +v.toFixed(2)));
  flowLines.push({ id: 'T' + (k + 2), pts, w0: 1.0, w1: 1.5, ridge: k === 0, hMaxU: k === 0 ? 0.10 : undefined, trunk: true });
}
// 수렴 지표: 각 선의 표본점에서 선 방향이 가장 가까운 끌개(심장/보스문)를 향하는 정도
const attractorOf = (y) => (y > HEART[1] ? HEART : GATE_FRONT);
let alignSum = 0, alignN = 0, aligned60 = 0;
for (const l of flowLines) for (let k = 0; k + 1 < l.pts.length; k++) {
  const a = l.pts[k], b = l.pts[k + 1], tgt = attractorOf(a[1]), vx = b[0] - a[0], vy = b[1] - a[1], tx = tgt[0] - a[0], ty = tgt[1] - a[1];
  const c = (vx * tx + vy * ty) / ((Math.hypot(vx, vy) * Math.hypot(tx, ty)) || 1); alignSum += c; alignN++; if (c >= 0.5) aligned60++; // cos>=0.5 = 60도 이내
}
const endNearAttractor = flowLines.filter(l => { const e = l.pts[l.pts.length - 1]; return Math.hypot(e[0] - HEART[0], e[1] - HEART[1]) <= HEART_R + 1.5 || Math.hypot(e[0] - GATE_FRONT[0], e[1] - GATE_FRONT[1]) <= 3; }).length;
const rootFlow = { note: '흐름선=바닥 데칼(시각 전용). ridge=낮은 뿌리 둔덕(Terrain 높이 <=0.04u, 충돌·덩어리 아님). trunk=심장→보스문 앞 5가닥', heart: HEART, heartR: HEART_R, gateFront: GATE_FRONT, lines: flowLines,
  convergence: { lines: flowLines.length, ridges: flowLines.filter(l => l.ridge).length, endNearAttractor, meanCosToAttractor: +(alignSum / alignN).toFixed(3), segmentsWithin60deg: +(aligned60 / alignN).toFixed(3) } };

// ---- 시선 쐐기(맵 총괄 공통 규칙): h <= 0.9 + tan(0.85)*D. D = 덩어리 북쪽 끝에서 북쪽 가장 가까운 걷기 칸 중심까지(u, 1칸=0.4u) ----
const TAN_PITCH = Math.tan(0.85), TILE_U = 0.4;
for (const m of masses) {
  const [x0, y0, x1] = m.bbox; let best = Infinity;
  for (let x = x0; x <= x1; x++) { let topY = null; for (let y = m.bbox[1]; y <= m.bbox[3]; y++) if (blocked(x, y)) { topY = y; break; } if (topY === null) continue; for (let y = topY - 1; y >= Math.max(0, topY - 40); y--) if (!blocked(x, y)) { best = Math.min(best, topY - (y + 0.5)); break; } }
  m.D_u = +(best === Infinity ? 99 : best * TILE_U).toFixed(2); m.hMax_u = +(0.9 + TAN_PITCH * (m.D_u >= 99 ? 0 : m.D_u)).toFixed(2);
}
const hMaxSet = {}; for (const m of masses) hMaxSet[m.hMax_u] = (hMaxSet[m.hMax_u] || 0) + 1;

const plan = {
  si: 3, stage: '1-4', margin: MARGIN, generatedBy: 'tools/rm4/plan.mjs', seed: 1104,
  identity: '기생수의 둥지 = 숲의 심장. 사방이 트인 넓은 둥지 바닥을 뿌리가 덮고, 모든 뿌리가 북쪽 보스문으로 모인다',
  P1, rootFlow, hMaxSet, bossZone, rim, toxicRibbons: [riverW, riverE], heartSink, falls, toxicPools,
  landmarks, masses: masses.map(m => ({ kind: m.kind, bbox: m.bbox, size: m.size, webType: m.webType, D_u: m.D_u, hMax_u: m.hMax_u, tiles: m.tiles })), skippedIslands: skipped,
  lightPools: pools, poolSepViolations, lightWindowHist, shafts, story, occlusion,
  counts: { islands: isl.length, massIslands: masses.length, landmarks: landmarks.length, skippedBoss: skipped.length, massTiles, massTilesSouthOfWalk, lightPools: pools.length, hell: pools.filter(p => p.kind === 'hell').length, toxic: pools.filter(p => p.kind === 'toxic').length },
};
fs.writeFileSync(path.join(D, 'ch1_4_plan.json'), JSON.stringify(plan));

// ---- Unity 빌더 입력(JsonUtility가 읽을 수 있는 평평한 배열만). 걷기 격자 rows 포함, P1 창(y>=32) 안 요소만 ----
const inWin = (y) => y >= P1.y0;
let hn = 0, tn = 0;
const build = {
  rows: walk.rows, window: [P1.x0, P1.y0, P1.x1, P1.y1], margin: MARGIN,
  masses: masses.filter(m => m.bbox[1] >= P1.y0).map(m => { const lm = landmarks.find(l => l.bbox === m.bbox); return { kind: m.kind, id: lm ? lm.id : '', web: m.webType || '', size: m.size, cx: m.cx, cy: m.cy, bx0: m.bbox[0], by0: m.bbox[1], bx1: m.bbox[2], by1: m.bbox[3], hMax: m.hMax_u }; }),
  pools: pools.filter(p => inWin(p.y)).sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'hell' ? -1 : 1)).map(p => ({ name: p.kind === 'hell' ? 'Pool_Hell_' + String(++hn).padStart(2, '0') : 'Pool_Toxic_' + String(++tn).padStart(2, '0'), kind: p.kind, label: p.label, x: p.x, y: p.y, r: p.r })),
  shafts: shafts.filter(sh => sh.y1 >= P1.y0).map(sh => ({ x0: sh.x0, y0: sh.y0, x1: sh.x1, y1: sh.y1 })),
  flow: flowLines.map(l => ({ id: l.id, ridge: !!l.ridge, trunk: !!l.trunk, w0: l.w0, w1: l.w1, xs: l.pts.map(p => p[0]), ys: l.pts.map(p => p[1]) })),
  rivers: [riverW, riverE].map(r => ({ id: r.id, half: r.w / 2, xs: r.pts.map(p => p[0]), ys: r.pts.map(p => p[1]) })),
  toxic: toxicPools.filter(t => t.id === 'poolE').map(t => ({ id: t.id, tx: t.tiles.map(v => v[0]), ty: t.tiles.map(v => v[1]) })),
};
fs.writeFileSync(path.join(D, 'ch1_4_build.json'), JSON.stringify(build));
console.log('build.json masses', build.masses.length, 'pools', build.pools.length, 'hell', hn, 'toxic', tn, 'flow', build.flow.length, 'shafts', build.shafts.length);
console.log(JSON.stringify({ counts: plan.counts, conv: rootFlow.convergence, hMaxSet, lightWindowHist, poolSepViolations, landmarks: landmarks.map(l => [l.id, l.x, l.y, l.r, l.webType]), skipped, toxicPools: toxicPools.map(t => [t.id, t.body, t.shore]) }, null, 1));
