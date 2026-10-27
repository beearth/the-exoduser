// C04-ORACLE 대조: Unity 덤프를 웹 oracle(docs/engine/c04_oracle/)과 비교해 차이 보고서(JSON + md)를 만든다.
// 사용: node tools/c04-oracle/compare.mjs <unity_dump.json> [--oracle docs/engine/c04_oracle] [--out <dir>] [--tol 2] [--max-list 2000]
// Unity 덤프 형식은 docs/engine/c04_oracle/README.md 참고:
//   { "walk": 200x200 (행 배열의 배열 | 행 문자열 배열 | 길이 40000 평탄 배열; 0=걷기 1=막힘),
//     "start": [tx,ty], "exit": [tx,ty] 또는 [[tx,ty],...],
//     "spawns": [{ "room": 방 인덱스 또는 id, "tx", "ty", "etype"(적이면 숫자, 소환굴이면 생략/-1), "grade" }] }
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export function normalizeWalk(w, N, M) {
  const out = new Uint8Array(N * M);
  if (!Array.isArray(w)) throw new Error('walk must be an array');
  if (typeof w[0] === 'number') { if (w.length !== N * M) throw new Error(`flat walk length ${w.length} != ${N * M}`); for (let i = 0; i < N * M; i++) out[i] = w[i] ? 1 : 0; return out; }
  if (w.length !== M) throw new Error(`walk rows ${w.length} != ${M}`);
  for (let y = 0; y < M; y++) {
    const row = w[y]; if (row.length !== N) throw new Error(`walk row ${y} length ${row.length} != ${N}`);
    for (let x = 0; x < N; x++) out[y * N + x] = (typeof row === 'string' ? row[x] !== '0' : row[x]) ? 1 : 0;
  }
  return out;
}

export function bfs(walk, N, M, sx, sy) {
  const dist = new Int32Array(N * M).fill(-1);
  if (sx < 0 || sy < 0 || sx >= N || sy >= M) return dist;
  const q = [sy * N + sx]; dist[q[0]] = 0;
  for (let h = 0; h < q.length; h++) {
    const c = q[h], x = c % N, y = (c / N) | 0;
    for (const [dx, dy] of DIRS) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= N || ny >= M) continue; const ni = ny * N + nx; if (dist[ni] >= 0 || walk[ni]) continue; dist[ni] = dist[c] + 1; q.push(ni); }
  }
  return dist;
}

export function loadOracle(dir) {
  const rd = f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  const walkJ = rd('ch1_1_walk.json'), reach = rd('ch1_1_reach.json'), rooms = rd('ch1_1_rooms.json'), spawns = rd('ch1_1_spawns.json');
  const N = walkJ.N, M = walkJ.M;
  return { N, M, walk: normalizeWalk(walkJ.rows, N, M), partial: walkJ.partial.tiles, reach, rooms, spawns };
}

export function compare(unity, oracle, opt = {}) {
  const tol = opt.tol ?? 2, maxList = opt.maxList ?? 2000;
  const { N, M } = oracle;
  const cap = a => a.length > maxList ? a.slice(0, maxList) : a;
  const rep = { generatedAt: new Date().toISOString(), tolTiles: tol, checks: {}, pass: {} };

  // ---- 걷기 격자 ----
  const uw = normalizeWalk(unity.walk, N, M);
  const webWalkUnityBlocked = [], webBlockedUnityWalk = [];
  const partialSet = new Set(oracle.partial.map(p => p[1] * N + p[0]));
  for (let i = 0; i < N * M; i++) {
    if (oracle.walk[i] === uw[i]) continue;
    const t = [i % N, (i / N) | 0, partialSet.has(i) ? 1 : 0]; // 3번째 값 1 = 웹에서도 부분 막힘 타일(경계 판정 차이일 수 있음)
    (oracle.walk[i] === 0 ? webWalkUnityBlocked : webBlockedUnityWalk).push(t);
  }
  rep.checks.walk = { webWalkUnityBlocked: { count: webWalkUnityBlocked.length, tiles: cap(webWalkUnityBlocked), onWebPartial: webWalkUnityBlocked.filter(t => t[2]).length },
    webBlockedUnityWalk: { count: webBlockedUnityWalk.length, tiles: cap(webBlockedUnityWalk), onWebPartial: webBlockedUnityWalk.filter(t => t[2]).length }, tileFormat: '[tx,ty,onWebPartial]' };
  rep.pass.C04_2_walkIdentical = webWalkUnityBlocked.length === 0 && webBlockedUnityWalk.length === 0;

  // ---- 도달(BFS) ----
  const [usx, usy] = unity.start || [-1, -1];
  const ud = bfs(uw, N, M, usx, usy);
  const [wsx, wsy] = oracle.reach.start;
  const wd = bfs(oracle.walk, N, M, wsx, wsy);
  const webOnly = [], unityOnly = [];
  for (let i = 0; i < N * M; i++) { if (wd[i] >= 0 && ud[i] < 0) webOnly.push([i % N, (i / N) | 0]); else if (wd[i] < 0 && ud[i] >= 0) unityOnly.push([i % N, (i / N) | 0]); }
  const uExits = (Array.isArray(unity.exit?.[0]) ? unity.exit : unity.exit ? [unity.exit] : []);
  const webExits = oracle.reach.exits.map(e => e.tile);
  const exitReachedUnity = uExits.map(([x, y]) => ({ tile: [x, y], reached: x >= 0 && y >= 0 && x < N && y < M && ud[y * N + x] >= 0, dist: ud[y * N + x] }));
  rep.checks.reach = {
    startUnity: unity.start, startWeb: oracle.reach.start, startSame: usx === wsx && usy === wsy, startBlockedInUnity: usx >= 0 ? uw[usy * N + usx] : null,
    webReachedTiles: wd.reduce((a, v) => a + (v >= 0 ? 1 : 0), 0), unityReachedTiles: ud.reduce((a, v) => a + (v >= 0 ? 1 : 0), 0),
    reachedOnlyInWeb: { count: webOnly.length, tiles: cap(webOnly) }, reachedOnlyInUnity: { count: unityOnly.length, tiles: cap(unityOnly) },
    exitWeb: webExits, exitUnity: uExits, exitSameTiles: JSON.stringify([...webExits].sort()) === JSON.stringify([...uExits].sort()), exitReachedUnity,
    exitReachedWeb: oracle.reach.exits.map(e => ({ tile: e.tile, reached: e.reached, dist: e.dist })),
  };
  rep.pass.C04_1_exitReachable = exitReachedUnity.length > 0 && exitReachedUnity.every(e => e.reached);
  rep.pass.C04_1_reachSetIdentical = webOnly.length === 0 && unityOnly.length === 0;

  // ---- 스폰 ----
  const sp = unity.spawns || [];
  const isEnemy = s => typeof s.etype === 'number' && s.etype >= 0;
  const uHoles = sp.filter(s => !isEnemy(s)), uEns = sp.filter(isEnemy);
  const dist2 = (a, b) => Math.hypot(a.tx - b.tx, a.ty - b.ty);
  // 소환굴: 웹 런타임 소환굴 14개 각각에 tol 안의 Unity 소환굴이 하나씩 대응해야 한다
  const wHoles = oracle.spawns.holesRuntime.map(h => ({ tx: h.tx, ty: h.ty, size: h.size }));
  const used = new Set(), holeMissing = [];
  for (const h of wHoles) { let bi = -1, bd = 1e9; uHoles.forEach((u, i) => { if (used.has(i)) return; const d = dist2(h, u); if (d < bd) { bd = d; bi = i; } }); if (bi >= 0 && bd <= tol) used.add(bi); else holeMissing.push({ web: h, nearestUnityDistTiles: bi >= 0 ? +bd.toFixed(2) : null }); }
  const holeExtra = uHoles.filter((_, i) => !used.has(i)).map(u => ({ tx: u.tx, ty: u.ty, room: u.room }));
  // 고정 적(모든 웹 실행에 같은 etype·좌표): Unity에 같은 etype이 tol 안에 있어야 한다
  const fixed = oracle.spawns.enemies.fixedAcrossAllRuns, usedE = new Set(), fixedMissing = [];
  for (const f of fixed) { let bi = -1, bd = 1e9; uEns.forEach((u, i) => { if (usedE.has(i) || u.etype !== f.etype) return; const d = dist2(f, u); if (d < bd) { bd = d; bi = i; } }); if (bi >= 0 && bd <= tol) usedE.add(bi); else fixedMissing.push({ web: f, nearestSameEtypeDistTiles: bi >= 0 ? +bd.toFixed(2) : null }); }
  // 방별 적 수: 웹은 방 사각형(runtimeRooms) 기준으로 센 5회 범위. Unity room 값이 숫자·id면 그대로, 없으면 좌표로 방을 정한다.
  const rooms = oracle.rooms.runtimeRooms;
  const roomOfTile = (tx, ty) => { const r = rooms.find(r => tx >= r.x && tx < r.x + r.w && ty >= r.y && ty < r.y + r.h); return r ? r.i : -1; };
  const uCounts = {}; for (const u of uEns) { const r = roomOfTile(u.tx, u.ty); uCounts[r] = (uCounts[r] || 0) + 1; }
  const range = oracle.spawns.enemies.roomCountRange, roomDiff = [];
  for (const k of new Set([...Object.keys(range), ...Object.keys(uCounts)])) { const g = uCounts[k] || 0, r = range[k] || { min: 0, max: 0 }; if (g < r.min || g > r.max) roomDiff.push({ room: +k, unity: g, webMin: r.min, webMax: r.max }); }
  const tot = oracle.spawns.enemies.totalRange;
  const blockedU = sp.filter(s => s.tx >= 0 && s.ty >= 0 && s.tx < N && s.ty < M && uw[s.ty * N + s.tx]).map(s => ({ tx: s.tx, ty: s.ty, etype: s.etype ?? null, room: s.room }));
  rep.checks.spawns = {
    unityHoles: uHoles.length, unityEnemies: uEns.length, webHoles: wHoles.length, webEnemiesTotalRange: tot,
    holesMissingInUnity: holeMissing, holesExtraInUnity: holeExtra, fixedEnemiesMissingInUnity: fixedMissing,
    enemyRoomCountOutsideWebRange: roomDiff, enemyTotalInWebRange: uEns.length >= tot[0] && uEns.length <= tot[1],
    spawnsOnUnityBlockedTiles: { count: blockedU.length, list: cap(blockedU), webBaseline: oracle.spawns.blocked.holes + Math.max(...oracle.spawns.blocked.enemiesPerRun) },
    note: '적 수·종류는 보스방 호위가 웹에서도 무작위라 범위로 비교한다. 소환굴 위치·고정 적(3)은 정확 비교.',
  };
  rep.pass.C04_4_holesMatch = holeMissing.length === 0 && holeExtra.length === 0;
  rep.pass.C04_4_fixedEnemiesMatch = fixedMissing.length === 0;
  rep.pass.C04_4_enemyCountsInRange = roomDiff.length === 0 && rep.checks.spawns.enemyTotalInWebRange;
  rep.pass.C04_4_noSpawnOnBlocked = blockedU.length === 0;
  rep.pass.allIdentical = Object.values(rep.pass).every(Boolean);
  return rep;
}

export function toMarkdown(rep, label = '') {
  const c = rep.checks, p = rep.pass, yn = v => v ? 'PASS' : 'DIFF';
  const L = [];
  L.push(`# C04 oracle 대조 보고서 ${label}`.trim(), '', `생성: ${rep.generatedAt} · 스폰 매칭 허용 ${rep.tolTiles}타일`, '');
  L.push('| 조건 | 결과 | 내용 |', '|---|---|---|');
  L.push(`| C04-1 EXIT 도달 | ${yn(p.C04_1_exitReachable)} | 출구 ${JSON.stringify(c.reach.exitUnity)} Unity 도달 ${JSON.stringify(c.reach.exitReachedUnity.map(e => e.reached))}, 웹 ${JSON.stringify(c.reach.exitWeb)} (타일 일치 ${c.reach.exitSameTiles}) |`);
  L.push(`| C04-1 도달 집합 | ${yn(p.C04_1_reachSetIdentical)} | 웹만 도달 ${c.reach.reachedOnlyInWeb.count} · Unity만 도달 ${c.reach.reachedOnlyInUnity.count} (웹 ${c.reach.webReachedTiles} / Unity ${c.reach.unityReachedTiles}) |`);
  L.push(`| C04-2 걷기 격자 | ${yn(p.C04_2_walkIdentical)} | 웹 걷기→Unity 막힘 ${c.walk.webWalkUnityBlocked.count} (웹 부분막힘 타일 ${c.walk.webWalkUnityBlocked.onWebPartial}) · 웹 막힘→Unity 걷기 ${c.walk.webBlockedUnityWalk.count} (웹 부분막힘 ${c.walk.webBlockedUnityWalk.onWebPartial}) |`);
  L.push(`| C04-4 소환굴 | ${yn(p.C04_4_holesMatch)} | Unity ${c.spawns.unityHoles} / 웹 ${c.spawns.webHoles}, 누락 ${c.spawns.holesMissingInUnity.length}, 초과 ${c.spawns.holesExtraInUnity.length} |`);
  L.push(`| C04-4 고정 적 | ${yn(p.C04_4_fixedEnemiesMatch)} | 누락 ${c.spawns.fixedEnemiesMissingInUnity.length} |`);
  L.push(`| C04-4 적 수 범위 | ${yn(p.C04_4_enemyCountsInRange)} | Unity ${c.spawns.unityEnemies} / 웹 ${JSON.stringify(c.spawns.webEnemiesTotalRange)}, 방별 범위 밖 ${c.spawns.enemyRoomCountOutsideWebRange.length} |`);
  L.push(`| C04-4 막힌 칸 스폰 | ${yn(p.C04_4_noSpawnOnBlocked)} | Unity ${c.spawns.spawnsOnUnityBlockedTiles.count} (웹 기준 ${c.spawns.spawnsOnUnityBlockedTiles.webBaseline}) |`, '');
  L.push(`전체: **${p.allIdentical ? '차이 0' : '차이 있음'}** — 최종 판정은 맵 총괄.`, '');
  const show = (t, a, n = 20) => { if (a.length) L.push(`${t} (앞 ${Math.min(n, a.length)}개 / ${a.length}): ${a.slice(0, n).map(x => JSON.stringify(x)).join(' ')}`, ''); };
  show('웹 걷기→Unity 막힘 타일', c.walk.webWalkUnityBlocked.tiles); show('웹 막힘→Unity 걷기 타일', c.walk.webBlockedUnityWalk.tiles);
  show('웹만 도달', c.reach.reachedOnlyInWeb.tiles); show('Unity만 도달', c.reach.reachedOnlyInUnity.tiles);
  show('누락 소환굴', c.spawns.holesMissingInUnity); show('초과 소환굴', c.spawns.holesExtraInUnity); show('누락 고정 적', c.spawns.fixedEnemiesMissingInUnity); show('방별 범위 밖', c.spawns.enemyRoomCountOutsideWebRange); show('막힌 칸 스폰', c.spawns.spawnsOnUnityBlockedTiles.list);
  return L.join('\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2), arg = (k, d) => { const i = a.indexOf('--' + k); return i >= 0 ? a[i + 1] : d; };
  const input = a.find((x, i) => !x.startsWith('--') && !(i > 0 && a[i - 1].startsWith('--')));
  if (!input) { console.error('usage: node compare.mjs <unity_dump.json> [--oracle dir] [--out dir] [--tol 2] [--max-list 2000]'); process.exit(2); }
  const oracleDir = path.resolve(arg('oracle', path.join(here, '../../docs/engine/c04_oracle')));
  const outDir = path.resolve(arg('out', path.dirname(path.resolve(input))));
  const rep = compare(JSON.parse(fs.readFileSync(input, 'utf8')), loadOracle(oracleDir), { tol: +arg('tol', 2), maxList: +arg('max-list', 2000) });
  fs.mkdirSync(outDir, { recursive: true });
  const base = path.basename(input).replace(/\.json$/, '');
  fs.writeFileSync(path.join(outDir, base + '.compare.json'), JSON.stringify(rep, null, 1));
  fs.writeFileSync(path.join(outDir, base + '.compare.md'), toMarkdown(rep, base));
  console.log(toMarkdown(rep, base).split('\n').slice(0, 14).join('\n'));
  process.exit(rep.pass.allIdentical ? 0 : 1);
}
