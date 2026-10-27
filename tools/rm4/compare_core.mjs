// RM-4 P0-2: 웹 1-4 정답(ch1_4_walk.json)과 Unity 쪽 걷기 격자 대조. Core는 고치지 않고 차이 목록만 낸다.
// 대상 ① unity/main Resources/Data/ch1_map.json(SourceMap) — 1-4가 들어 있는지 ② maps-rough 브랜치(7d59aa487, unity/main 미병합)의 maps_rough.json si=3.
// 사용: node tools/rm4/compare_core.mjs [--si 3] [--rough I:/EXODUSER-Storage/rm4/maps_rough.json] [--out unity/Assets/Exoduser/Remodel/CH1_4/Data/ch1_4_core_compare.json]
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '../..');
const SI = +arg('si', 3), TAG = 'ch1_' + (SI + 1);
const dataDir = path.join(root, 'unity/Assets/Exoduser/Remodel/CH1_' + (SI + 1) + '/Data');
const OUT = path.resolve(arg('out', path.join(dataDir, TAG + '_core_compare.json')));
const web = JSON.parse(fs.readFileSync(path.join(dataDir, TAG + '_walk.json'), 'utf8'));
const webRooms = JSON.parse(fs.readFileSync(path.join(dataDir, TAG + '_rooms.json'), 'utf8'));
const webSp = JSON.parse(fs.readFileSync(path.join(dataDir, TAG + '_spawns.json'), 'utf8'));
const N = web.N, M = web.M;
const W = i => web.rows[(i / N) | 0][i % N] === '1' ? 1 : 0;
const partial = new Set(web.partial.tiles.map(t => t[1] * N + t[0]));
const res = { si: SI, web: { walkable: web.counts.walkable, blocked: web.counts.blocked } };

// ① unity/main SourceMap 데이터
const ch1map = JSON.parse(fs.readFileSync(path.join(root, 'unity/Assets/Exoduser/Resources/Data/ch1_map.json'), 'utf8'));
res.unityMain = { file: 'unity/Assets/Exoduser/Resources/Data/ch1_map.json', size: [ch1map.width, ch1map.height], startPx: [ch1map.startX, ch1map.startY],
  stagesInRepo: 'ch1_map.json 한 장(1-1)뿐. NativeGame 주석 "Unity has ... only stage 0". 1-' + (SI + 1) + ' = 미이식' , ported: false };

// ② maps-rough 대충 이식본
const roughPath = arg('rough', 'I:/EXODUSER-Storage/rm4/maps_rough.json');
if (fs.existsSync(roughPath)) {
  const rough = JSON.parse(fs.readFileSync(roughPath, 'utf8'));
  const s = rough.stages.find(x => x.si === SI);
  if (s) {
    const R = i => s.tiles[i] === '1' || s.tiles[i] === '3' ? 1 : 0; // SourceMap.Blocked: 1·3 막힘
    const webOnlyWalk = [], roughOnlyWalk = [];
    for (let i = 0; i < N * M; i++) { const a = W(i), b = R(i); if (a === b) continue; const t = [i % N, (i / N) | 0, partial.has(i) ? 1 : 0]; (a === 0 ? webOnlyWalk : roughOnlyWalk).push(t); }
    const holesR = []; for (let k = 0; k < s.holes.length; k += 4) holesR.push([~~(s.holes[k] / 40), ~~(s.holes[k + 1] / 40)]);
    const holesW = webSp.holesRuntime.map(h => [h.tx, h.ty]);
    const near = (a, list) => Math.min(...list.map(b => Math.hypot(a[0] - b[0], a[1] - b[1])));
    res.mapsRough = { branch: 'claude/unity-pc-maps-rough-20261027', commit: '7d59aa487', source: rough.source, note: 'unity/main 미병합. 추출 시점 origin/main이 지금과 다를 수 있다',
      webWalk_roughBlocked: { count: webOnlyWalk.length, onWebPartial: webOnlyWalk.filter(t => t[2]).length, tiles: webOnlyWalk.slice(0, 3000) },
      webBlocked_roughWalk: { count: roughOnlyWalk.length, onWebPartial: roughOnlyWalk.filter(t => t[2]).length, tiles: roughOnlyWalk.slice(0, 3000) },
      start: { web: webRooms.startPlayerPx, rough: [s.startX, s.startY] },
      exits: { web: webRooms.exit.tiles, rough: s.exits }, gate: { web: webRooms.bossGate.tiles, rough: s.gate },
      holes: { web: holesW.length, rough: holesR.length, roughNotNearWeb2: holesR.filter(h => near(h, holesW) > 2).length, webNotNearRough2: holesW.filter(h => near(h, holesR) > 2).length } };
  } else res.mapsRough = { missing: 'si ' + SI + ' 없음' };
} else res.mapsRough = { missing: roughPath };
fs.writeFileSync(OUT, JSON.stringify(res, null, 1));
const brief = JSON.parse(JSON.stringify(res)); if (brief.mapsRough && brief.mapsRough.webWalk_roughBlocked) { brief.mapsRough.webWalk_roughBlocked.tiles = brief.mapsRough.webWalk_roughBlocked.tiles.slice(0, 8); brief.mapsRough.webBlocked_roughWalk.tiles = brief.mapsRough.webBlocked_roughWalk.tiles.slice(0, 8); }
console.log(JSON.stringify(brief, null, 1));
