import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// MAP (claude-native-6) — native-easy-hook-candidate-validation
//
// 목적: Claude-provider/MAP가 "읽기전용"으로 판별한 쉬운판 3FAIL(S03/S04/M15)의
//       단일 근본원인 — game-easy-test.html에 (a) production layout include 와
//       (b) _buildCh1StartForestRLE 의 CH1_1_PRODUCTION hook 한 줄이 없음 —을,
//       그 두 가지만 "메모리 후보"로 주입한 실제 생성함수 재현으로 검증한다.
//       geometry/RLE/좌표를 새로 정의하지 않고 production layout.js(SSOT)와
//       main의 hook 한 줄을 그대로 사용한다. easy HTML/에셋은 디스크에서 불변
//       (읽기전용). 후보는 "미적용"이며 제품 채택 결정은 하지 않는다.
//
// 기존 23검사/BFS는 재실행하지 않는다. 여기서는 최소 반례(legacy drift 재현)와
// 후보 대조(hook 주입 후 parity 해소 여부)만 수행한다.
// ---------------------------------------------------------------------------

const ROOT = '/Users/fordeargamers/Projects/exoduser-migration-20261001';
const OWN = ROOT + '/tools/team-followup-20261002/claude-native-6/MAP';
const read = p => readFileSync(ROOT + '/' + p, 'utf8');
const sha = text => createHash('sha256').update(text).digest('hex');
const json = x => JSON.stringify(x);
const git = (...args) => execFileSync('git', args, {
  cwd: ROOT, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' }, encoding: 'utf8',
}).trim();

// main의 production hook (game.html:28742) — SSOT에서 그대로 복사, 새 정의 아님.
const HOOK_LINE = "  if(typeof CH1_1_PRODUCTION!=='undefined')return CH1_1_PRODUCTION.buildRLE(mw,mh);";
// easy 빌더 머리글 — 이 지점 바로 뒤에 hook 한 줄만 삽입하는 것이 후보의 전부.
const BUILDER_HEAD = 'function _buildCh1StartForestRLE(mw,mh){\n';
const BUILDER_NEXT = '  const n=mw*mh,g=new Uint8Array(n)';

// easy 소스에 "후보"를 메모리에서 주입: hook 한 줄만 추가. (디스크 미변경)
function injectHookCandidate(easySource) {
  const anchor = BUILDER_HEAD + BUILDER_NEXT;
  assert.equal(easySource.indexOf(anchor), easySource.lastIndexOf(anchor),
    'easy 빌더 앵커는 정확히 1회 등장해야 함');
  assert.ok(easySource.includes(anchor), 'easy 빌더 앵커 확인');
  return easySource.replace(anchor, BUILDER_HEAD + HOOK_LINE + '\n' + BUILDER_NEXT);
}

// ---- 소스 추출 유틸 (실제 game.html 함수를 바이트 그대로 추출; 게임 부트스트랩 없음) ----
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

// 실제 생성 경로(_cloneField11→genFromTemplate)를 격리 VM에서 그대로 실행.
// project-teams/MAP fixture와 동일 추출 기법(= 검증된 fixture 복사)이며
// 새 게임 사본/격자 캐시를 만들지 않는다. layout(=production SSOT)을 선로드.
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
  return { context, functions: extracted, rngCalls: () => rngCalls, forbiddenCalls: () => forbiddenCalls };
}

export function runChecks() {
  const startedAt = new Date().toISOString(), head = git('rev-parse', 'HEAD');
  const inputPaths = ['game.html', 'game-easy-test.html',
    'assets/map/ch1/production_finish/layout.js', 'ch1-border-foreground.js', 'ch1-boundary-edge.js', 'maps_data.js'];
  const before = Object.fromEntries(inputPaths.map(p => [p, sha(read(p))]));

  const mainSrc = read('game.html'), easySrc = read('game-easy-test.html'), maps = read('maps_data.js');
  const layout = read('assets/map/ch1/production_finish/layout.js');
  const easyCandidateSrc = injectHookCandidate(easySrc); // 메모리 후보, 디스크 무변경

  const results = [];
  const check = (id, name, f) => { try { f(); results.push({ id, name, status: 'PASS' }); }
    catch (error) { results.push({ id, name, status: 'FAIL', reason: error.message }); } };

  // 소스 레벨 include 게이트 (production layout / foreground / edge 스크립트)
  const inc = (src, re) => re.test(src);
  const layoutRe = /assets\/map\/ch1\/production_finish\/layout\.js/;
  const fgRe = /ch1-border-foreground\.js/;
  const edgeRe = /ch1-boundary-edge\.js/;
  const srcGate = {
    mainLayoutInclude: inc(mainSrc, layoutRe), easyLayoutInclude: inc(easySrc, layoutRe),
    mainForegroundInclude: inc(mainSrc, fgRe), easyForegroundInclude: inc(easySrc, fgRe),
    mainEdgeInclude: inc(mainSrc, edgeRe), easyEdgeInclude: inc(easySrc, edgeRe),
    easyHookInBuilder: inc(easySrc, /CH1_1_PRODUCTION!==/),
    mainHookInBuilder: inc(mainSrc, /CH1_1_PRODUCTION!==/),
  };

  // 세 fixture: main(기준) / easyLegacy(현행 drift) / easyCandidate(hook 후보 주입)
  const main = makeFixture(mainSrc, maps, layout);
  const easyLegacy = makeFixture(easySrc, maps, layout);
  const easyCandidate = makeFixture(easyCandidateSrc, maps, layout);

  const builderMain = main.functions._buildCh1StartForestRLE;
  const builderLegacy = easyLegacy.functions._buildCh1StartForestRLE;
  const builderCand = easyCandidate.functions._buildCh1StartForestRLE;

  const mapSha = ctx => sha(json(ctx.G.map));
  const probePoints = [[6660, 6140], [7000, 6900], [7000, 6880], [6660, 6304], [6660, 6305]];
  const probe = (ctx, x, y) => ({ world: [x, y],
    tileValue: ctx.G.map[Math.trunc(y / 40)][Math.trunc(x / 40)],
    isW: ctx.isW(x, y), canMvR15: ctx.canMv(x, y, 15) });
  const probeAll = ctx => probePoints.map(([x, y]) => probe(ctx, x, y));
  const pMain = probeAll(main.context), pLegacy = probeAll(easyLegacy.context), pCand = probeAll(easyCandidate.context);

  // raw production RLE (layout SSOT 직접 호출) — main vs candidate 동일해야 함
  const rawMain = vm.runInContext('CH1_1_PRODUCTION.buildRLE(200,200)', main.context);
  const rawCand = vm.runInContext('CH1_1_PRODUCTION.buildRLE(200,200)', easyCandidate.context);

  // ---------------- 최소 반례 (현행 drift 재현) ----------------
  check('C01', '소스 게이트: main은 production layout include·hook 보유, easy는 미보유', () => {
    assert.equal(srcGate.mainLayoutInclude, true, 'main layout include');
    assert.equal(srcGate.mainHookInBuilder, true, 'main hook');
    assert.equal(srcGate.easyLayoutInclude, false, 'easy layout include 없음');
    assert.equal(srcGate.easyHookInBuilder, false, 'easy hook 없음');
  });
  check('C02', '최소 반례: easy 빌더 == main 빌더 - hook 한 줄 (바이트 단일 차이)', () => {
    assert.notEqual(builderLegacy, builderMain, 'easy 빌더는 main과 다름');
    // easy 빌더에 hook 한 줄만 넣으면 main 빌더와 바이트 동일해야 함
    const reconstructed = builderLegacy.replace(BUILDER_HEAD + BUILDER_NEXT,
      BUILDER_HEAD + HOOK_LINE + '\n' + BUILDER_NEXT);
    assert.equal(reconstructed, builderMain, '유일 차이 = hook 한 줄');
  });
  check('C03', 'legacy drift: main G.map SHA != easy(legacy) G.map SHA (S04 재현)', () => {
    assert.notEqual(mapSha(main.context), mapSha(easyLegacy.context));
  });
  check('C04', 'legacy drift: (6660,6305) canMv main=false / easy=true (M15 재현)', () => {
    const i = probePoints.findIndex(([x, y]) => x === 6660 && y === 6305);
    assert.equal(pMain[i].canMvR15, false, 'main 막힘');
    assert.equal(pLegacy[i].canMvR15, true, 'easy legacy 통행');
  });

  // ---------------- 후보 대조 (hook 주입 후 parity 해소) ----------------
  check('P03', 'S03 해소: easyCandidate 빌더 == main 빌더 (바이트 동일)', () => {
    assert.equal(builderCand, builderMain);
  });
  check('P04', 'S04 해소: easyCandidate G.map SHA == main G.map SHA', () => {
    assert.equal(mapSha(easyCandidate.context), mapSha(main.context));
  });
  check('P15', 'M15 해소: 5개 탐침점 isW/canMv main == easyCandidate', () => {
    for (let i = 0; i < probePoints.length; i++) {
      assert.equal(pCand[i].isW, pMain[i].isW, 'isW ' + probePoints[i]);
      assert.equal(pCand[i].canMvR15, pMain[i].canMvR15, 'canMv ' + probePoints[i]);
      assert.equal(pCand[i].tileValue, pMain[i].tileValue, 'tile ' + probePoints[i]);
    }
  });
  check('P06', 'SSOT 무변경: candidate raw RLE == main raw RLE (layout.js buildRLE 그대로)', () => {
    assert.equal(json(rawCand), json(rawMain));
    assert.equal(rawMain.length % 2, 0, 'RLE pair');
  });
  check('P07', '미적용·디스크 무변경: 주입은 메모리 문자열 1줄뿐, easy HTML 불변', () => {
    assert.equal(easyCandidateSrc.length - easySrc.length, HOOK_LINE.length + 1, 'hook 한 줄+개행만 추가');
    const after = sha(read('game-easy-test.html'));
    assert.equal(after, before['game-easy-test.html'], 'easy HTML SHA 불변');
  });
  check('G01', 'UI/이미지 요청·그리드 가드 호출 없음(세 fixture)', () => {
    assert.equal(main.forbiddenCalls(), 0);
    assert.equal(easyLegacy.forbiddenCalls(), 0);
    assert.equal(easyCandidate.forbiddenCalls(), 0);
  });
  const after = Object.fromEntries(inputPaths.map(p => [p, sha(read(p))]));
  check('G02', '보호 입력 6개 실행 전후 SHA 동일', () => assert.deepEqual(after, before));

  return {
    taskId: 'native-easy-hook-candidate-validation', startedAt, finishedAt: new Date().toISOString(), head,
    node: process.version,
    fixture: 'production functions/data extracted into isolated Node VM; no game bootstrap; easy hook candidate injected in-memory only',
    candidate: {
      productionApplied: false, diskModified: false,
      injectedHookLine: HOOK_LINE, injectedHookLineSHA256: sha(HOOK_LINE),
      injectedBytes: HOOK_LINE.length + 1,
      note: 'memory-only: production layout include(이미 VM 선로드) + _buildCh1StartForestRLE hook 한 줄. geometry/RLE/좌표 신규 정의 0.',
    },
    sourceGate: srcGate,
    builders: {
      mainSHA256: sha(builderMain), legacySHA256: sha(builderLegacy), candidateSHA256: sha(builderCand),
      candidateEqualsMain: builderCand === builderMain, legacyEqualsMain: builderLegacy === builderMain,
    },
    generatedMapSHA256: { main: mapSha(main.context), easyLegacy: mapSha(easyLegacy.context), easyCandidate: mapSha(easyCandidate.context) },
    rawRLE: { mainSHA256: sha(json(rawMain)), candidateSHA256: sha(json(rawCand)), equal: json(rawMain) === json(rawCand) },
    probePoints: { main: pMain, easyLegacy: pLegacy, easyCandidate: pCand },
    inputsBefore: before, inputsAfter: after,
    layoutSSOT: { path: 'assets/map/ch1/production_finish/layout.js', sha256: before['assets/map/ch1/production_finish/layout.js'] },
    separateVisualGate: {
      note: 'foreground/edge 스크립트 누락은 별도 시각 Gate(생성함수 parity와 무관).',
      easyMissingForeground: !srcGate.easyForegroundInclude, easyMissingEdge: !srcGate.easyEdgeInclude,
      status: 'UNMEASURED(시각/8뷰 미수행)',
    },
    counts: { pass: results.filter(r => r.status === 'PASS').length, fail: results.filter(r => r.status === 'FAIL').length }, results,
    gates: { actualEightViews: '0/8', visualVerdict: 'RETOUCH', productionApplied: false,
      rawSHAReverify: 'current input SHA는 이번 실행에서 측정; 원격 ref 대조는 총괄 단계' },
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const output = runChecks();
  if (process.argv.includes('--evidence')) {
    const path = OWN + '/evidence.json', prior = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {};
    prior.executions ??= []; prior.executions.push(output); prior.latest = output;
    writeFileSync(path, JSON.stringify(prior, null, 2) + '\n');
  }
  console.log(JSON.stringify(output, null, 2));
  if (output.counts.fail) process.exitCode = 1;
}
