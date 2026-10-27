// compare.mjs 자기 시험: (1) 웹 oracle을 Unity 형식으로 바꿔 넣으면 차이 0, (2) 타일 하나를 바꾸면 그 하나만 잡힌다, (3) 소환굴 하나를 옮기면 그 하나만 잡힌다.
// 사용: node tools/c04-oracle/selftest.mjs   (종료코드 0 = 모두 기대대로)
import path from 'path';
import { fileURLToPath } from 'url';
import { compare, loadOracle } from './compare.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const oracle = loadOracle(path.join(here, '../../docs/engine/c04_oracle'));
const { N, M } = oracle;
const asUnity = () => ({
  walk: Array.from({ length: M }, (_, y) => Array.from({ length: N }, (_, x) => oracle.walk[y * N + x])),
  start: oracle.reach.start, exit: oracle.reach.exits.map(e => e.tile),
  spawns: [
    ...oracle.spawns.holesRuntime.map(h => ({ room: h.geomRoom, tx: h.tx, ty: h.ty, grade: 0 })),
    ...oracle.spawns.enemies.perRun[0].map(e => ({ room: e.geomRoom, tx: e.tx, ty: e.ty, etype: e.etype, grade: 0 })),
  ],
});
let fail = 0;
const expect = (name, ok, extra = '') => { console.log((ok ? 'OK   ' : 'FAIL ') + name + (extra ? ' — ' + extra : '')); if (!ok) fail++; };

// (1) 동일 입력 → 차이 0
const r0 = compare(asUnity(), oracle);
expect('동일 입력: 모든 항목 PASS', r0.pass.allIdentical, JSON.stringify(r0.pass));

// (2) 열린 곳의 걷기 타일 하나를 막힘으로 → 걷기 차이 정확히 1, 도달 차이도 그 타일 하나뿐
let pick = null;
for (let y = 3; y < M - 3 && !pick; y++) for (let x = 3; x < N - 3 && !pick; x++) {
  if (oracle.walk[y * N + x]) continue;
  let open = true; for (let dy = -2; dy <= 2 && open; dy++) for (let dx = -2; dx <= 2; dx++) if (oracle.walk[(y + dy) * N + x + dx]) { open = false; break; }
  if (open) pick = [x, y];
}
const u2 = asUnity(); u2.walk[pick[1]][pick[0]] = 1;
const r2 = compare(u2, oracle);
expect(`타일 (${pick}) 걷기→막힘: 걷기 차이 1개, 그 타일`, r2.checks.walk.webWalkUnityBlocked.count === 1 && r2.checks.walk.webBlockedUnityWalk.count === 0 && r2.checks.walk.webWalkUnityBlocked.tiles[0][0] === pick[0] && r2.checks.walk.webWalkUnityBlocked.tiles[0][1] === pick[1]);
expect('같은 변경: 도달 차이도 그 타일 하나', r2.checks.reach.reachedOnlyInWeb.count === 1 && r2.checks.reach.reachedOnlyInUnity.count === 0);
expect('같은 변경: 스폰 항목은 영향 없음', r2.pass.C04_4_holesMatch && r2.pass.C04_4_fixedEnemiesMatch && r2.pass.C04_4_enemyCountsInRange);

// (2b) 막힘 타일 하나를 걷기로(바깥 경계, 도달 집합과 이어짐) → 걷기 차이 1
let edge = null;
for (let y = 3; y < M - 3 && !edge; y++) for (let x = 3; x < N - 3 && !edge; x++) { if (oracle.walk[y * N + x] && !oracle.walk[y * N + x + 1] && oracle.walk[(y - 1) * N + x] && oracle.walk[(y + 1) * N + x] && oracle.walk[y * N + x - 1]) edge = [x, y]; }
const u2b = asUnity(); u2b.walk[edge[1]][edge[0]] = 0;
const r2b = compare(u2b, oracle);
expect(`타일 (${edge}) 막힘→걷기: 걷기 차이 1개, 도달 차이는 Unity 쪽 1개`, r2b.checks.walk.webBlockedUnityWalk.count === 1 && r2b.checks.walk.webWalkUnityBlocked.count === 0 && r2b.checks.reach.reachedOnlyInUnity.count === 1);

// (3) 소환굴 하나를 5타일 옮기면 그 굴만 누락+초과
const u3 = asUnity(); const hi = u3.spawns.findIndex(s => s.etype === undefined); u3.spawns[hi].tx += 5;
const r3 = compare(u3, oracle);
expect('소환굴 1개 이동: 누락 1 + 초과 1', r3.checks.spawns.holesMissingInUnity.length === 1 && r3.checks.spawns.holesExtraInUnity.length === 1 && !r3.pass.C04_4_holesMatch);

// (4) EXIT가 막히면 EXIT 도달 실패로 잡힌다(출구 앞 타일을 전부 막기보다 출구 타일 자체를 막음)
const u4 = asUnity(); for (const [x, y] of u4.exit) u4.walk[y][x] = 1;
const r4 = compare(u4, oracle);
expect('출구 타일을 막으면 EXIT 도달 FAIL', !r4.pass.C04_1_exitReachable);

console.log(fail ? `자기 시험 실패 ${fail}건` : '자기 시험 전부 통과');
process.exit(fail ? 1 : 0);
