// RM-2 P0-2: 웹 정답(ch1_2_*.json)과 Unity 쪽 1-2 걷기 격자를 대조한다.
// Unity 1-2는 unity/main에 없다(Core 데이터 = 1-1 ch1_map.json뿐). 대충 변환본이 로컬 브랜치 claude/unity-pc-maps-rough-20261027
// (7d59aa487, 원격 미게시)의 Resources/Data/maps_rough.json에만 있어 그것과 비교한다. 막힘 판정은 SourceMap.Blocked와 같다(타일값 1·3 = 막힘).
// 사용: node tools/rm2/compare_rough.mjs --rough <maps_rough.json> [--data unity/Assets/Exoduser/Remodel/CH1_2/Data] [--si 1] [--rough-ref 7d59aa487]
import fs from 'fs';
import path from 'path';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const SI = +arg('si', 1), NAME = 'ch1_' + (SI + 1), D = arg('data', 'unity/Assets/Exoduser/Remodel/CH1_' + (SI + 1) + '/Data');
const walk = JSON.parse(fs.readFileSync(path.join(D, NAME + '_walk.json'), 'utf8'));
const rooms = JSON.parse(fs.readFileSync(path.join(D, NAME + '_rooms.json'), 'utf8'));
const sp = JSON.parse(fs.readFileSync(path.join(D, NAME + '_spawns.json'), 'utf8'));
const rough = JSON.parse(fs.readFileSync(arg('rough'), 'utf8')).stages.find(s => s.si === SI);
const N = walk.N, M = walk.M;
const webB = (x, y) => walk.rows[y][x] === '1';
const uB = (x, y) => { const v = rough.tiles[y * N + x]; return v === '1' || v === '3'; };
const webOnlyWalk = [], unityOnlyWalk = [];
const partial = new Set(walk.partial.tiles.map(t => t[1] * N + t[0]));
for (let y = 0; y < M; y++) for (let x = 0; x < N; x++) { const a = webB(x, y), b = uB(x, y); if (a === b) continue; (a ? unityOnlyWalk : webOnlyWalk).push([x, y, partial.has(y * N + x) ? 1 : 0]); }
const bbox = l => l.length ? l.reduce((b, [x, y]) => [Math.min(b[0], x), Math.min(b[1], y), Math.max(b[2], x), Math.max(b[3], y)], [N, M, 0, 0]) : null;
const pair = a => { const o = []; for (let i = 0; i < a.length; i += 2) o.push([a[i], a[i + 1]]); return o; };
const uHoles = []; for (let i = 0; i < rough.holes.length; i += 4) uHoles.push({ tx: ~~(rough.holes[i] / 40), ty: ~~(rough.holes[i + 1] / 40), size: rough.holes[i + 2] / 1000 });
const wHoles = sp.holesRuntime.map(h => ({ tx: h.tx, ty: h.ty, size: h.size }));
const holeMatch = wHoles.map(h => { const best = uHoles.map(u => Math.hypot(u.tx - h.tx, u.ty - h.ty)).sort((a, b) => a - b)[0]; return { ...h, nearestUnityTiles: best == null ? null : +best.toFixed(2) }; });
const res = {
  web: { source: 'ch1_2_receipt.json', walkable: walk.counts.walkable, start: rooms.start, exits: rooms.exit.tiles, gate: rooms.bossGate.tiles, holes: wHoles.length },
  unity: { status: 'unity/main 미이식(Resources/Data에 ch1_map.json=1-1만). 대충 변환본만 로컬 브랜치에 있음', branch: 'claude/unity-pc-maps-rough-20261027', ref: arg('rough-ref', '7d59aa487'), file: 'unity/Assets/Exoduser/Resources/Data/maps_rough.json', walkable: [...rough.tiles].filter((v, i) => !uB(i % N, (i / N) | 0)).length, start: [~~(rough.startX / 40), ~~(rough.startY / 40)], exits: pair(rough.exits), gate: pair(rough.gate), holes: uHoles.length },
  diff: {
    webWalkUnityBlocked: { count: webOnlyWalk.length, onWebPartial: webOnlyWalk.filter(t => t[2]).length, bbox: bbox(webOnlyWalk), tiles: webOnlyWalk.slice(0, 400) },
    webBlockedUnityWalk: { count: unityOnlyWalk.length, onWebPartial: unityOnlyWalk.filter(t => t[2]).length, bbox: bbox(unityOnlyWalk), tiles: unityOnlyWalk.slice(0, 400) },
    start: JSON.stringify(rooms.start) === JSON.stringify([~~(rough.startX / 40), ~~(rough.startY / 40)]),
    exits: JSON.stringify(rooms.exit.tiles) === JSON.stringify(pair(rough.exits)),
    gate: JSON.stringify(rooms.bossGate.tiles) === JSON.stringify(pair(rough.gate)),
    holes: { web: wHoles.length, unity: uHoles.length, perWebHole: holeMatch },
  },
};
fs.writeFileSync(path.join(D, NAME + '_core_compare.json'), JSON.stringify(res, null, 1));
const d = res.diff;
console.log(JSON.stringify({ webWalk: res.web.walkable, unityWalk: res.unity.walkable, webWalkUnityBlocked: [d.webWalkUnityBlocked.count, d.webWalkUnityBlocked.onWebPartial, d.webWalkUnityBlocked.bbox], webBlockedUnityWalk: [d.webBlockedUnityWalk.count, d.webBlockedUnityWalk.onWebPartial, d.webBlockedUnityWalk.bbox], start: d.start, exits: d.exits, gate: d.gate, webGate: res.web.gate, unityGate: res.unity.gate, holes: [wHoles.length, uHoles.length], holeFar: holeMatch.filter(h => h.nearestUnityTiles > 2).length }));
