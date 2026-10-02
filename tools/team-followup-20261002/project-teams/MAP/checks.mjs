import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = '/Users/fordeargamers/Projects/exoduser-migration-20261001';
const OWN = ROOT + '/tools/team-followup-20261002/project-teams/MAP';
const read = p => readFileSync(ROOT + '/' + p, 'utf8');
const sha = text => createHash('sha256').update(text).digest('hex');
const json = x => JSON.stringify(x);
const git = (...args) => execFileSync('git', args, {
  cwd: ROOT, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' }, encoding: 'utf8',
}).trim();

// Extract source bytes, skipping quoted text and comments. No HTML/game bootstrap.
function balanced(source, start, open = '{', close = '}') {
  const begin = source.indexOf(open, start);
  assert.ok(begin >= start, 'opening source delimiter');
  let depth = 0, quote = null, comment = null;
  for (let i = begin; i < source.length; i++) {
    const ch = source[i], next = source[i + 1];
    if (comment === 'line') { if (ch === '\n') comment = null; continue; }
    if (comment === 'block') { if (ch === '*' && next === '/') { comment = null; i++; } continue; }
    if (quote) { if (ch === '\\') i++; else if (ch === quote) quote = null; continue; }
    if (ch === '/' && next === '/') { comment = 'line'; i++; continue; }
    if (ch === '/' && next === '*') { comment = 'block'; i++; continue; }
    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue; }
    if (ch === open) depth++;
    if (ch === close && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error('Unclosed source delimiter');
}
function fn(source, name) {
  const m = new RegExp('function ' + name + '\\s*\\(').exec(source);
  assert.ok(m, name + ' exists');
  return balanced(source, m.index);
}
function declaration(source, name, open = '{', close = '}') {
  const m = new RegExp('const ' + name + '=').exec(source);
  assert.ok(m, name + ' exists');
  return balanced(source, m.index, open, close) + ';';
}
function makeFixture(source, maps, layout, randomValue = .5) {
  const functions = ['_rleEncodeGrid', '_buildCh1StartForestRLE', '_applyCh1StartNorthGate', '_cloneField11',
    'genFromTemplate', '_tCarveCircle', '_tCarveEllipse', '_tCarveRect', '_tCarveCross',
    '_tCarveCorridor', '_tBossDistMap', '_spawnHoleCount', '_cacheExitCenter',
    '_appendRotatedColParts', '_rebuildColObjs', '_ensureColObjs', '_ch1HillRampAt',
    '_ch1HillBandBlocks', 'isW', 'canMv'];
  const extracted = Object.fromEntries(functions.map(n => [n, fn(source, n)]));
  const composeStart = source.indexOf('0:{hand:1,dense:1,lm:[],mega:[],forestBoundary:1,');
  assert.ok(composeStart > 0);
  const compose = balanced(source, composeStart + 2);
  const decoStart = source.indexOf('  0:[', source.indexOf('const _CH_DECO='));
  const deco = balanced(source, decoStart + 4, '[', ']');
  const fixedStart = maps.indexOf('FIXED_MAPS[0]=');
  const fixed = balanced(maps, fixedStart + 'FIXED_MAPS[0]='.length);
  const handStart = source.indexOf('if(_cmp&&_cmp.handProps){');
  const hand = balanced(source, handStart);
  const metaMergeStart = source.indexOf('    const _prev=_OBJ_META[d.id]||{};');
  const metaMergeEnd = source.indexOf('\n  }', metaMergeStart);
  const metaMerge = source.slice(metaMergeStart, metaMergeEnd);
  const retired = source.split('\n').find(l => l.startsWith('const _RETIRED_MAP_OBJECT_TYPES='));
  const spawn = source.split('\n').find(l => l.startsWith('const SPAWN_HOLE='));
  const tile = source.split('\n').find(l => l.startsWith('const T='));
  assert.match(source, /var MAP_ALL_FLOOR=false;/);
  const math = Object.create(Math); let rngCalls = 0, forbiddenCalls = 0;
  math.random = () => { rngCalls++; return randomValue; };
  const context = vm.createContext({ Math: math, console: { log() {}, warn() {} },
    G: { stage: 0, _boneWalls: [], _bossArena: false }, MAP_OBJS: [], SI_TO_HELL: [0],
    _DIABLO_FIELD_QA: false, MAP_ALL_FLOOR: false, _exitCX: 0, _exitCY: 0,
    _colObjs: [], _colObjsSrc: null, _colObjsN: -1, _colScaleLogged: false,
    _visR: () => 0, _moGrid: {}, _moGridMaxR: 0,
    _gridNear() { forbiddenCalls++; throw Error('dense authored placement must bypass grid guard'); },
    Image() { forbiddenCalls++; throw Error('No image requests'); },
  });
  vm.runInContext(layout, context, { timeout: 1000 });
  assert.equal(vm.runInContext('typeof CH1_1_PRODUCTION', context), 'object', 'authored production layout loaded');
  vm.runInContext(tile + '\n' + spawn + '\n' + retired + '\n' + declaration(source, '_OBJ_META') +
    '\nconst _MAP_COMPOSE={0:' + compose + '};\nconst CH1_DECO=' + deco + ';\n' +
    'for(const d of CH1_DECO){' + metaMerge + '}\nconst FIXED_MAPS=[' + fixed + '];\n' +
    declaration(source, '_CH1_HILL') + '\n' + Object.values(extracted).join('\n') +
    '\nif(typeof CH1_1_PRODUCTION!=="object")throw Error("production layout shadowed by source extraction");\n' +
    'const template=_cloneField11(0); genFromTemplate(template,0);\n' +
    'const map=G.map,_cmp=_MAP_COMPOSE[0],hell=0;\n' + fn(source, '_floorAt') + '\n' +
    fn(source, '_nearFloor') + '\n' + hand + '\n_ensureColObjs();\n' +
    'globalThis.sourceData={tileSize:T,template,compose:_MAP_COMPOSE[0],meta:_OBJ_META,colliders:_colObjs};',
    context, { timeout: 3000 });
  return { context, functions: extracted, blocks: { compose, deco, fixed, hand, metaMerge },
    rngCalls: () => rngCalls, forbiddenCalls: () => forbiddenCalls };
}

function connected(context, radius = 15) {
  const { G, canMv } = context, width = G.mw, height = G.mh, T = context.sourceData.tileSize;
  const walk = new Uint8Array(width * height), parent = new Int32Array(width * height).fill(-1);
  const at = p => [(p % width + .5) * T, (Math.floor(p / width) + .5) * T];
  for (let p = 0; p < walk.length; p++) { const [x, y] = at(p); walk[p] = +canMv(x, y, radius); }
  const start = 185 * width + 100, q = [];
  if (walk[start]) { q.push(start); parent[start] = start; }
  let rejectedEdges = 0;
  for (let k = 0; k < q.length; k++) {
    const p = q[k], x = p % width, y = Math.floor(p / width);
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nx = x + dx, ny = y + dy, n = ny * width + nx;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height || !walk[n] || parent[n] >= 0) continue;
      const [wx, wy] = at(p); let clear = true;
      // Every 5 world px along each 40px cardinal edge; this is a sampled static fixture.
      for (let s = 5; s <= T; s += 5) if (!canMv(wx + dx * s, wy + dy * s, radius)) { clear = false; break; }
      if (clear) { parent[n] = p; q.push(n); } else rejectedEdges++;
    }
  }
  function path(target) {
    if (parent[target] < 0) return null;
    const cells = []; for (let p = target;; p = parent[p]) { cells.push(p); if (p === start) break; }
    cells.reverse(); return cells;
  }
  return { walk, parent, visited: q.length, rejectedEdges, at, path, start };
}

export function runChecks() {
  const startedAt = new Date().toISOString(), head = git('rev-parse', 'HEAD');
  const inputPaths = ['game.html', 'game-easy-test.html', 'index.html', 'server.cjs', 'node-main.js',
    'maps_data.js', 'assets/map/ch1/production_finish/layout.js', 'ch1-boundary-edge.js',
    'ch1-border-foreground.js', 'assets/map/ch1/production_finish/outer90_sources/placements.json',
    'tools/team-followup-20261002/project-teams/MAP/task.md'];
  const before = Object.fromEntries(inputPaths.map(p => [p, sha(read(p))]));
  const source = read('game.html'), easy = read('game-easy-test.html'), maps = read('maps_data.js');
  const layout = read('assets/map/ch1/production_finish/layout.js'), results = [];
  const check = (id, name, f) => { try { f(); results.push({ id, name, status: 'PASS' }); }
    catch (error) { results.push({ id, name, status: 'FAIL', reason: error.message }); } };
  const main = makeFixture(source, maps, layout), alt = makeFixture(easy, maps, layout);
  const { context: c } = main, { G, isW, canMv, sourceData: d } = c;
  const raw = vm.runInContext('CH1_1_PRODUCTION.buildRLE(200,200)', c);
  const rawGrid = []; for (let i=0;i<raw.length;i+=2) for(let n=0;n<raw[i+1];n++) rawGrid.push(raw[i]===1?0:1);
  const point = (x, y) => ({ world: [x,y], tile: [Math.trunc(x/40), Math.trunc(y/40)],
    tileValue: G.map[Math.trunc(y/40)][Math.trunc(x/40)], isW: isW(x,y), canMvR15: canMv(x,y,15) });
  const approach = point(6660,6140), badCamera = point(7000,6900), anchor = point(7000,6880);
  const graph = connected(c), target = 153*200+166, route = graph.path(target);
  const fgSource = read('ch1-border-foreground.js');
  const fgPrefix = fgSource.slice(0, fgSource.indexOf('  const imgCache='));
  assert.ok(fgPrefix.length > 1000);
  const fgContext = vm.createContext({});
  vm.runInContext(fgPrefix + 'root.sourceForeground={instances:INSTANCES,masses:MASSES,pip:pip};})(globalThis);', fgContext);
  const foreground = fgContext.sourceForeground, m5 = foreground.instances.find(x=>x.id==='M5');
  const placement = JSON.parse(read(inputPaths[9])).massPlacements[5];
  const projected = [], fringe = [];
  for(let p=0;p<graph.walk.length;p++) if(graph.walk[p]) {
    const [x,y]=graph.at(p);
    if(x>=m5.x&&x<=m5.x+m5.w&&y>=m5.y&&y<=m5.y+m5.h) {
      projected.push(p); if(!foreground.pip(x,y)) fringe.push(p);
    }
  }
  let southStop = null;
  for(let y=6141;y<=6900;y++) if(!canMv(6660,y,15)){ southStop=point(6660,y); break; }
  const pit = c.MAP_OBJS.find(o=>o.type==='pit_poison');
  const pitPoint = point(pit.x,pit.y);
  const parityFunctions = ['_buildCh1StartForestRLE','_applyCh1StartNorthGate','_cloneField11',
    'genFromTemplate','_rebuildColObjs','_ensureColObjs','_ch1HillRampAt','_ch1HillBandBlocks','isW','canMv'];
  check('S01','생산 연결과 200×200/T40 계약',()=>{assert.equal(d.tileSize,40);assert.equal(G.mw,200);assert.equal(G.mh,200);assert.match(source,/assets\/map\/ch1\/production_finish\/layout\.js/);assert.equal(d.compose.forestBoundary,1);});
  check('S02','RLE 전량 40000셀 및 크기 가드',()=>{assert.equal(rawGrid.length,40000);assert.throws(()=>vm.runInContext('CH1_1_PRODUCTION.buildRLE(199,200)',c));});
  check('S03','양쪽 생산 핵심 함수/배치/메타 병합 원문 일치',()=>{for(const n of parityFunctions)assert.equal(main.functions[n],alt.functions[n],n);for(const n of Object.keys(main.blocks))assert.equal(main.blocks[n],alt.blocks[n],n);});
  check('S04','생산 genFromTemplate 전체 실행 결과 양쪽 일치',()=>assert.equal(sha(json(G.map)),sha(json(alt.context.G.map))));
  check('S05','실제 북측 출입 계약',()=>{assert.equal(G._gateY,5);assert.deepEqual(JSON.parse(json(G.exits)),[{x:99,y:7},{x:100,y:7},{x:101,y:7}]);for(const x of [99,100,101]){assert.equal(G.map[5][x],3);assert.equal(G.map[7][x],2);}});
  check('S06','기존 START와 실제 mkP 반경15 계약',()=>{assert.match(fn(source,'mkP'),/return\{x:0,y:0,r:15,/);assert.deepEqual(graph.at(graph.start),[4020,7420]);assert.equal(canMv(4020,7420,15),true);assert.equal(d.template.rooms.find(r=>r.type==='start').cy,185);});
  check('M01','접근점166,153 통행',()=>{assert.equal(approach.tileValue,0);assert.equal(approach.isW,false);assert.equal(approach.canMvR15,true);});
  check('M02','7000,6900 촬영점은 벽 반례',()=>{assert.equal(badCamera.tileValue,1);assert.equal(badCamera.isW,true);assert.equal(badCamera.canMvR15,false);});
  check('M03','M5 에셋 앵커와 보행점 분리',()=>{assert.equal(anchor.tileValue,1);assert.equal(foreground.pip(7000,6880),false);assert.equal(canMv(7000,6880,15),false);});
  check('M04','M5 전경 원배치 및 모드 데이터 일치',()=>{const m=foreground.masses.find(x=>x[0]===5);assert.deepEqual(Array.from(m).slice(1,5),placement.slice(0,4));assert.equal(!!m[5],placement[4]);assert.equal(m[6],'fg');});
  check('M05','START→접근점 반경15 샘플 경로 존재',()=>assert.ok(route&&route.length>1));
  check('M06','검출 경로 모든 중간 샘플 canMv 통과',()=>{for(let i=1;i<route.length;i++){const [x,y]=graph.at(route[i-1]),[nx,ny]=graph.at(route[i]);for(let s=0;s<=8;s++)assert.equal(canMv(x+(nx-x)*s/8,y+(ny-y)*s/8,15),true);}});
  check('M07','같은 경로 역방향 START 복귀 소스 통과',()=>{assert.ok(route);for(let i=route.length-1;i>0;i--){const [x,y]=graph.at(route[i]),[nx,ny]=graph.at(route[i-1]);for(let s=0;s<=8;s++)assert.equal(canMv(x+(nx-x)*s/8,y+(ny-y)*s/8,15),true);}});
  check('M08','M5 투영 사각과 겹치는 보행셀 전량 연결',()=>{assert.ok(projected.length>0);assert.equal(projected.filter(p=>graph.parent[p]<0).length,0);});
  check('M09','polygon 밖 보행셀을 벽으로 오분류하지 않음',()=>{assert.ok(fringe.length>0);for(const p of fringe){const [x,y]=graph.at(p);assert.equal(canMv(x,y,15),true);assert.equal(foreground.pip(x,y),false);}});
  check('M10','남쪽 직진의 첫 막힘과 네 모서리 반례',()=>{assert.ok(southStop);assert.equal(southStop.canMvR15,false);assert.equal(southStop.isW,false);assert.equal(southStop.tileValue,0);assert.ok(canMv(6660,southStop.world[1]-1,15));});
  check('M11','타일 바닥만으로 통행 승인하는 오판 반례',()=>{assert.equal(pitPoint.tileValue,0);assert.equal(pitPoint.isW,true);assert.equal(pitPoint.canMvR15,false);assert.equal(d.meta.pit_poison.collision,true);});
  check('M12','실제 collider·scale 캐시 및 전경 군락 비충돌',()=>{assert.equal(pit._colSz,80);assert.ok(d.colliders.length>0);assert.equal(d.colliders.some(o=>o.type==='M5'),false);assert.equal(d.colliders.some(o=>o.x===7000&&o.y===6880),false);});
  check('M13','아웃오브바운드 벽 거부',()=>{assert.equal(isW(-40,6140),true);assert.equal(isW(8000,6140),true);assert.equal(canMv(8000,6140,15),false);});
  const rngAlt=makeFixture(source,maps,layout,.9);
  const localGrid = ctx => ctx.G.map.slice(140,180).map(row=>row.slice(140,200));
  check('M14','스폰/북측 카빙 RNG 변경에도 M5 국소 타일 동일',()=>{assert.ok(main.rngCalls()>0);assert.equal(sha(json(localGrid(c))),sha(json(localGrid(rngAlt.context))));});
  check('M15','양쪽 접근·벽·남쪽 정지 판정 동일',()=>{for(const p of [approach,badCamera,anchor,southStop]){assert.equal(alt.context.isW(...p.world),p.isW);assert.equal(alt.context.canMv(...p.world,15),p.canMvR15);}});
  check('G01','UI/이미지 요청·비적용 그리드 가드 호출 없음',()=>{assert.equal(main.forbiddenCalls(),0);assert.equal(alt.forbiddenCalls(),0);assert.equal(rngAlt.forbiddenCalls(),0);});
  const after=Object.fromEntries(inputPaths.map(p=>[p,sha(read(p))]));
  check('G02','보호 생산11입력 실행 전후 SHA 동일',()=>assert.deepEqual(after,before));
  let rawDifference=0,fringeCreated=0;for(let p=0;p<40000;p++)if(rawGrid[p]!==G.map[Math.floor(p/200)][p%200]){rawDifference++;if(rawGrid[p]===1&&G.map[Math.floor(p/200)][p%200]===0)fringeCreated++;}
  const corners=[]; if(route)for(let i=0;i<route.length;i++){if(i===0||i===route.length-1||route[i]-route[i-1]!==route[i+1]-route[i])corners.push(graph.at(route[i]));}
  const functionEvidence=Object.fromEntries(Object.entries(main.functions).map(([n,text])=>[n,{sha256:sha(text),line:source.slice(0,source.indexOf(text)).split('\n').length,bytes:Buffer.byteLength(text)}]));
  return { taskId:'m5-tile-reachability', startedAt, finishedAt:new Date().toISOString(), head,
    node:process.version, fixture:'production functions/data extracted into isolated Node VM; no game bootstrap',
    randomFixtureValues:[.5,.9], randomCalls:main.rngCalls(), boneWallsFixture:'empty; dynamic encounter not simulated',
    counts:{pass:results.filter(r=>r.status==='PASS').length,fail:results.filter(r=>r.status==='FAIL').length}, results,
    inputsBefore:before,inputsAfter:after,functions:functionEvidence,
    parity:{
      mainProductionLayoutHook: /assets\/map\/ch1\/production_finish\/layout\.js/.test(source),
      easyProductionLayoutHook: /assets\/map\/ch1\/production_finish\/layout\.js/.test(easy),
      functions:Object.fromEntries(parityFunctions.map(n=>[n,{equal:main.functions[n]===alt.functions[n],mainSHA256:sha(main.functions[n]),easySHA256:sha(alt.functions[n])}])),
      blocks:Object.fromEntries(Object.keys(main.blocks).map(n=>[n,{equal:main.blocks[n]===alt.blocks[n],mainSHA256:sha(main.blocks[n]),easySHA256:sha(alt.blocks[n])}])),
      easyGeneratedMapSHA256:sha(json(alt.context.G.map)),
      easyPoints:Object.fromEntries(Object.entries({approach,badCamera,anchor,southStop}).map(([n,p])=>[n,{world:p.world,tileValue:alt.context.G.map[p.tile[1]][p.tile[0]],isW:alt.context.isW(...p.world),canMvR15:alt.context.canMv(...p.world,15)}])),
      note:'easy comparison loads the same pure layout definition in the isolated VM; easy has no production script/hook and its extracted builder still uses the legacy fallback',
    },
    geometry:{fixtureGeneratedMapSHA256:sha(json(G.map)),rawLayoutRLEConvertedDifferenceCells:rawDifference,
      rawWallToRuntimeFloorCells:fringeCreated,walkableR15Centres:graph.walk.reduce((a,b)=>a+b,0),
      startConnectedCentres:graph.visited,rejectedSampledEdges:graph.rejectedEdges,
      handProps:d.compose.handProps.length,placedMapObjects:c.MAP_OBJS.length,collisionObjects:d.colliders.length},
    points:{start:point(4020,7420),approach,badCamera,assetAnchor:anchor,southFirstBlocked:southStop,
      southPreviousCentre:point(6660,southStop.world[1]-1),
      southBlockedCornerProbes:[[-15,-15],[15,-15],[-15,15],[15,15]].map(([dx,dy])=>point(6660+dx,southStop.world[1]+dy)),pitCounterexample:pitPoint},
    route:{radius:15,nodeSpacing:40,edgeSampleSpacing:5,nodeCount:route?.length||0,turnWorldPoints:corners,
      claim:'static sampled START to known approach and reverse only; not trusted input or named pocket full-route acceptance'},
    m5:{sourcePlacement:placement,projectedBounds:{x:m5.x,y:m5.y,w:m5.w,h:m5.h,anchorY:m5.anchorY},
      projectedWalkableCentres:projected.length,projectedUnreachableCentres:projected.filter(p=>graph.parent[p]<0).length,
      outsidePolygonWalkableCentres:fringe.length,fringeExamples:fringe.slice(0,5).map(p=>graph.at(p)),
      semanticPocket:'No separate M5 pocket/entrance polygon or gameplay region ID; sprite rectangle is diagnostic extent only'},
    gates:{actualEightViews:'0/8 new',actualTrustedMovement:0,fullPocketToEntranceRoute:'UNMEASURED',
      occlusionCombatPageerrorLoadingPerformance:'UNMEASURED',visualVerdict:'RETOUCH',productionApplied:false} };
}

if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]) {
  const output=runChecks();
  if(process.argv.includes('--evidence')) {
    const path=OWN+'/evidence.json', prior=existsSync(path)?JSON.parse(readFileSync(path,'utf8')):{};
    prior.executions??=[];prior.executions.push(output);prior.latest=output;
    writeFileSync(path,JSON.stringify(prior,null,2)+'\n');
  }
  console.log(JSON.stringify(output,null,2));
  if(output.counts.fail)process.exitCode=1;
}
