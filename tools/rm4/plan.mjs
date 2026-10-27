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
const pools = []; let ph = 0, pt = 0;
for (let gy = 44; gy <= 196; gy += 26) for (let gx = 10; gx <= 192; gx += 26) {
  const x = Math.round(gx + (rnd() - .5) * 10), y = Math.round(gy + (rnd() - .5) * 10);
  if (inBoss(x, y) || y < 34) continue;
  if (pools.some(p => Math.hypot(p.x - x, p.y - y) < 10)) continue;
  const nearToxic = toxicPools.some(t => Math.hypot(x - (t.bbox[0] + t.bbox[2]) / 2, y - (t.bbox[1] + t.bbox[3]) / 2) < 12) || x < 14 || x > 186;
  const kind = nearToxic ? 'toxic' : 'hell';
  const r = kind === 'hell' ? +(5 + rnd() * 2).toFixed(1) : +(3 + rnd() * 1.5).toFixed(1); // 타일. 진홍 200~280u(5~7타일), 독액 120~180u(3~4.5타일)
  const xx = kind === 'toxic' && (x < 14 || x > 186) ? (x < 100 ? 3 : 196) : x;
  if (pools.some(p => Math.hypot(p.x - xx, p.y - y) < 10)) continue;
  pools.push({ kind, x: xx, y, r, label: kind === 'hell' ? 'H' + (++ph) : 'T' + (++pt) });
}
// 랜드마크 고정 웅덩이(진홍 1~2 = 큰 반경·느린 숨, L-2 위계 ①)
pools.push({ kind: 'hell', x: 100, y: 68, r: 8, label: 'HL1', anchor: 'L1 심장 남쪽 앞' }, { kind: 'hell', x: 52, y: 66, r: 7, label: 'HL2', anchor: 'L2 아치 동쪽' }, { kind: 'toxic', x: 150, y: 64, r: 4.5, label: 'TL3', anchor: 'L3 늪 서쪽 기슭' });

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

const plan = {
  si: 3, stage: '1-4', margin: MARGIN, generatedBy: 'tools/rm4/plan.mjs', seed: 1104,
  identity: '기생수의 둥지 = 숲의 심장. 사방이 트인 넓은 둥지 바닥을 뿌리가 덮고, 모든 뿌리가 북쪽 보스문으로 모인다',
  bossZone, rim, toxicRibbons: [riverW, riverE], heartSink, falls, toxicPools,
  landmarks, masses: masses.map(m => ({ kind: m.kind, bbox: m.bbox, size: m.size, webType: m.webType, tiles: m.tiles })), skippedIslands: skipped,
  lightPools: pools, shafts, story, occlusion,
  counts: { islands: isl.length, massIslands: masses.length, landmarks: landmarks.length, skippedBoss: skipped.length, massTiles, massTilesSouthOfWalk, lightPools: pools.length, hell: pools.filter(p => p.kind === 'hell').length, toxic: pools.filter(p => p.kind === 'toxic').length },
};
fs.writeFileSync(path.join(D, 'ch1_4_plan.json'), JSON.stringify(plan));
console.log(JSON.stringify({ counts: plan.counts, landmarks: landmarks.map(l => [l.id, l.x, l.y, l.r, l.webType]), skipped, toxicPools: toxicPools.map(t => [t.id, t.body, t.shore]) }, null, 1));
