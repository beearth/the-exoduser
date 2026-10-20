# 1장 4에리어 원본 추적·이식 순서안 — 2026-10-20

작업 `trace-maps-ch1` / 브랜치 `codex/trace-maps-ch1-20261020`. **추적 문서만 작성했다. 구현·게임 완성·시각 인수 보고서가 아니다.** 후속 구현자는 §4의 단위별 파일·명령·검증·소유권을 따른다. 모든 `game.html` 행은 fetch 뒤 생성한 이 worktree의 main 기준이며 R의 뒤처진 HTML을 사용하지 않았다.

| 기준 | 고정 값 / 경계 |
|---|---|
| 원격 main / 시작 HEAD | `f84e26ee0bbc929fb595b4c0af292b423588f325` |
| 원본 game.html SHA256 | `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |
| 조사 worktree | `/Users/fordeargamers/exoduser-wt/trace-maps-ch1` |
| 원로그 L | `/Users/fordeargamers/exoduser-wt/_out/trace-maps-ch1/` |
| 허용 변경 | 이 새 문서 1개. 훅이 요구할 경우에만 `docs/CHANGELOG_SYNC.md` 최상단 새 절 |
| 보호 | `docs/2_3`, Q/E, 세이브 형식은 **보호**. 변경 제안 없음. 원본 HTML/JS/PNG·Godot 코드·데이터·테스트·설계 docs 수정 없음 |
| 검수 해석 | 아래 VM 값은 원본 함수 발췌의 데이터 관측. 실제 브라우저 initStage/전투·Godot Main·실창 플레이는 이번에 실행하지 않음. 그 범위는 **미확인** |

## 0. 선행 문서·중복 방지

`orders/WORK_BOARD.md`의 TRACE-MAPS-CH1 행이 본 문서 소유자다. `FDG_GAME_DEVELOPMENT_PLAN.md`의 P3 콘텐츠/맵 원본 계약과 P4 진행 연결, `FDG_FEATURE_INVENTORY_20261020.md:370–378`의 MAP-00~03을 읽었다. inventory는 과거 고정 HEAD의 분모 표이므로 P3 병합 후 상태로 소급 수정하지 않았다. P3-001(pit_poison), P3-002(소환굴), P3-003(지역)은 이미 main에 있으며 **재구현하지 않는 의존성**이다.

| 선행 자료 | 조사에 적용한 내용 |
|---|---|
| `_MAP_SSOT_INDEX.md` / `EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md` 전체 | 최신 상단 이력과 단계 SSOT 우선. MASTER→LARGE OUTER MASS→MEDIUM→GROUND→PLAYABLE→LANDMARK→SMALL→CAMERA→TECH 순서. 기술 PASS와 시각 판정 분리 |
| `맵디테일.md` / `EXODUSER_MAP_BIBLE_v3 (1).md:24–87` / `맵구성_1장.md` | 넓은 피부 바닥·동맥·부패 생체나무 콘셉트, 1장 4에리어. 구 250×250/grid·일반 숲 시안을 현행 지형으로 승격하지 않음 |
| `맵오브젝트_에셋목록.md`, `CH1_SI1_ACTUAL_STAGE_GEOMETRY.md`, `REGION_CLEAR_GATE_20260930.md`, `MAP_RUNTIME_ARCHITECTURE.md` | 등록 메타와 실제 배치·충돌·렌더는 별도. si1 전용 geometry와 4분면 클리어 계약 확인 |
| `docs/1전체그래픽세팅/1전체그래픽세팅_MASTER.md`, `맵_화면효과_전수조사.md` | 옛 그래픽 목표/행 번호와 현재 baked·living·조명 코드 구분 |
| `FDG_MAP_SOURCE_SCENE.md`, `FDG_GODOT_PORT_MAP_RESOURCE_FIRST_20261013.md`, `FDG_NATIVE_MAP_PACK_20261012.md`, `FDG_WORLD_TRANSITION.md`, `FDG_WORLD_MAP_WAYPOINT.md` | Studio CPU fixture/저작 preview, 독립 폐허 숲길 pack, Godot stage0 제품을 구분. source pin과 최신 원본 차이 확인 |
| 기존 `FDG_SOURCE_TRACE_INVENTORY/QUICKSLOT/REVIVE_SHIELD/SAVE/SETTINGS_20261020.md` | 저장·입력·장비·에너지쉴드 소유권/미이식 경계 참고만. 다른 추적 문서와 해당 담당 파일 변경0 |
| 진행 중 적·보스·로비 추적/구현 | P2-008a-FIX/P2-008b의 enemy_factory·적 actor, TRACE-BOSS-CH1의 보스 패턴, TRACE-LOBBY의 챕터 연출은 해당 담당. 여기서는 맵 입출력 접점만 기록 |

## 1. 최신 원본 행 번호 전수 추적

### 1.1 에리어·지형 데이터의 실제 선택 경로

`CHAPTER_STAGES`의 4/6/4/7/5/6/3은 장별 에리어 수다. **si0~3 네 에리어**, production layout의 **8개 시각 구역**, 지역 시스템의 **4개 전투 분면**, 별도 **128×108 보스 아레나**는 서로 다른 단위다. `FIXED_MAPS[1..3]`를 그대로 Godot로 옮기면 현행 본편 맵과 다르다.

| ID | 원본 위치 | 데이터·실행 계약 |
|---|---|---|
| S01 | game.html:62–71 | maps_data.js, si1 geometry, production layout와 CH1 living/sway/face/rot-trees/moat/foreground/boundary 외부 모듈 순서 |
| S02 | 16631–16676 | T40; CHAPTER_STAGES/TOTAL_STAGES35, SI_TO_HELL/FLOOR; 대표 face=si0; dungeon ready 목록11/16/33은 모두 false. CH1 특수 dungeon 없음 |
| S03 | 16677–16711 | CH1 theme ROTTEN FOREST/썩은 숲; UI 이름 썩은 숲 1~4구역; monLv100; 보스 순서 다크드루이드/독버섯 거인/지옥기형/다크드루이드 |
| S04 | 3463–3477,16643–16648 | editor/mapTest/stage/bosstest/classic/mapqa/fieldrebuild/plate는 별도 gate. 기본 demo build면 si0 클리어 뒤 종료. 전체 4에리어 플레이 보장 아님 |
| S05 | 29549–29559 | STAGES35개, mw/mh200 고정. face 이외 type 계산은 legacy 분류이고 실제 _getFixedMapForStage 선택과 구분. mkRng seed 전이 보존 |
| S06 | 29762–29927 | FIXED_MAPS 외부 참조; _ORIG_GRID_1/2/3·300확대/zone0 변환은 구/시험 경로. 현행 CH1 기본 selector에서 쓰지 않음 |
| S07 | 29928–30041 | RLE encoder; stage0 forest polygon, 일반 path/basin/rect, stage0 north gate helper. 29972의 CH1_1_PRODUCTION가 없을 때만 수학 forest fallback |
| S08 | 30042–30085 | _cloneField11은 항상 FIXED_MAPS[0] 깊은 복제. si0 forestBoundary→production RLE, si1 CH1_SI1_GEOMETRY.buildRLE, 나머지는 compose basin/path 없으면 [1,40000]. si0 hole70/170→74/168; si>0 hole좌표는 path/basin 또는 mkRng(si*7919+17) 지터 |
| S09 | 30135–30147 | plate 시험 우선→특수 dungeon ready 분기→FIXED_MAPS[0] 존재시 cloneField11. 템플릿 부재일 때만 개별 FIXED_MAPS[si]/null |
| S10 | 31533–31569 | initStage: 이전 actor/projectile/object/효과 정리→selector→genFromTemplate, null만 genGauntlet. start room을 바닥 검색(r1..29) 후 (tile+.5)*40로 P배치. 자원·상태 reset은 별도 owner/보호 계약 |
| S11 | maps_data.js:6–55 | 본편 clone의 실제 공통 원천: rooms6, corridors5, features3, corridorSpawns2, tileRLE[1,40000], 수동 hole9, player_start marker1. 아래 표 참조 |
| S12 | assets/map/ch1/production_finish/layout.js:3–39 | 53점 경계, center sample(x+.5,y+.5), 200² RLE, 8개 semantic region. version20260916-finish-1. 이 8개는 전투 분면 아님 |
| S13 | assets/map/ch1/geometry/ch1_si1_geometry.js:4–106 | si1 전용 7구역/랜드마크/spine/widthSamples/bypass. ellipse+tube→border seal→1/2 RLE. 별도 높이 아님 |

`maps_data.js:10–22` 공통 rooms: s/start(100,185;rx14,ry6), r1/combat(100,155;18,10), f/forge(100,120;8,5), r2/combat(80,85;16,9), r3/combat(120,50;16,9), b/boss(100,18;20,12). `f`라는 room 분류가 실제 대장간 오브젝트 존재를 보장하지 않는다. `maps_data.js:58…` 개별 si1/2/3 원본 격자 데이터는 보존 대상이나 기본 selector의 실소비는 위 S08이다.

### 1.2 생성 이후 타일·소환굴·충돌·배치 변환

| ID | game.html 행 | 원본 동작·필드 |
|---|---|---|
| G01 | 29037–29146 | circle/ellipse/rect/cross/corridor·smooth·connectivity·bossDistMap. genGauntlet29149…는 템플릿 없는 폴백으로만 유지 |
| G02 | 30218–30268 | map 초기1; tileRLE coverage95% 검사(특수force예외); rooms 항상 구성, carving은 RLE 없을 때. editor1→runtime0, 나머지→1. _floorTiles 수집 |
| G03 | 30270–30334 | 독립 ruined-forest QA template는 조기 return. 기본 RLE는 보스방 재carve/pillars/type4 처리를 추가하므로 polygon-only nav와 최종 G.map은 같지 않음 |
| G04 | 30335–30442 | boss room 보완·경계 방향 스캔·entry/게이트/출구 생성. si0만 north helper 재적용: gate99..101/y5/type3, exit99..101/y7/type2. si1은 실제 gate y31/exit y33 |
| G05 | 30443–30485 | RLE 없는 맵 연결 보완, 통로 widen, boss distance cell map. 순서를 바꾸면 최종 타일 해시 달라짐 |
| G06 | 30486–30529 | RLE hole 후보 순서: tmpl.spawnHoles→objs hole_s/m/l→rooms.spawns→corridorSpawns. typeS/M/기타 .3/.5/.8; room grade .3+grade*.25. 간격²<250000 제외, cap50(복도부터 제거) |
| G07 | 30530–30582 | 비RLE 방별 보완과 최소6개 보장. 임의 새 배치 알고리즘으로 대체하지 않음 |
| G08 | 30583–30626 | 벽 위 hole r1..14 perimeter순서 바닥0 검색→주변11×11 floor30미만 제거→path 부족시 보완→_totalSpawned 계산. floor 위 후보를 자동 center snap하는 조건도 보존 |
| G09 | 30628–30694 | 출구failsafe·portal타일6/바닥연결·G.rooms/map/mw/mh/exits/bossGate/bossAlive/spawnHoles. tmpl.objs marker/시스템id제외; floor_eye별도; 일반 o.x*T/o.y*T(손배치 +.5와 다름) |
| G10 | 17487,17519–17805,18392–18502 | retired ID Set, CH_DECO등록, OBJ_META 초기77개, 기존dict in-place merge/후처리 flag/rotTree/occ추가. §1.5 등록표 전 항목의 행·값 참조 |
| G11 | 25735–25878 | initMapObjects는 이전 editor objects 필터/충돌체 hole·start·boss clearance, grid200, _floorAt는0/4, nearFloor r1..9. bonfire/trap 생성은 주석; lore/HP3 breakable 존재 |
| G12 | 25879–26058 | 장별 compose/empty/lane/rim/grove, lm/mega 실제 바닥보정·scale. si0/si1 hand gate는 자동배치 차단. si2/si3 자동 compose는 별도 실행 단계 |
| G13 | 26059–26081 | handProps 전부 순회, _nearFloor→(tile+.5)*T. dense는 겹침skip 우회/noGrid1; role/region 보존. scale은 stage0 또는10..13만 전달, rot 정규화 |
| G14 | 26083–26471 | 바닥데칼·unique·provided wall/floor·large/scatter·editor복원→renderLayer/y정렬. 퇴역ID는 렌더/충돌 제외. si2/si3 최종 MAP_OBJS 개수는 이 조사 VM에서 실행하지 않아 미확인 |
| G15 | 31682–31712 | _colObjs prefilter/colParts회전사각형; noCol/retired 제외. colW/H/Sz에scale, ellipse colOy는scale없이+1회. tile1/bounds/hill·bonewall→object 순; strict ellipse<1. canMv 네 모서리 |
| G16 | 31690–31710 | stage0/비arena hill(cx147,cy98,rx18,ry9,inner.84,outer1.04), 서쪽ramp x125..135/y98/half1.8→3. ramp smoothstep logicalheight; band isW. 실제3D지형높이와 동일 주장 금지 |
| G17 | 19793 | _cacheExitCenter는 G.exits 평균 tile좌표. source VM 관측에서는 이 소비자만 no-op; 후속 exporter는 원함수까지 발췌 가능 |

### 1.3 에리어별 실제 데이터 관측

L/source-inspect.cjs는 최신 worktree HTML의 AST expression/function을 발췌하고 `maps_data.js`·layout·si1 geometry를 같은 VM에서 읽었다. 전역 `Math.random`만 seed20261020 LCG(1664525,1013904223,mod2³²)로 고정했다. 원본 selector의 기본 clone 분기와 `genFromTemplate`, 실제 `_spawnHoleCount`를 실행했다. 브라우저·DOM·initMapObjects·mkEn·Main 부팅은 없다. `_cacheExitCenter`만 관측용 no-op다. 바닥·게이트·소환굴 데이터를 실제 플레이/전체 MAP_OBJS로 승격하지 않는다.

| 에리어 | 지형 원천 | runtime타일 값:개수 | START px | 게이트/출구(tile) | hole개수/총량; 분면 NW/NE/SW/SE | 손배치 입력 |
|---|---|---|---|---|---|---|
| 1-1 / si0 | production53점/8구역 | {'0': 19958, '1': 19755, '2': 3, '3': 3, '4': 281} | [4020, 7420] | gate y5; exits [{"x":99,"y":7},{"x":100,"y":7},{"x":101,"y":7}] | 14 / 168; [23, 60, 53, 32] | 36 |
| 1-2 / si1 | 전용geometry7구역 | {'0': 13588, '1': 25590, '2': 3, '4': 819} | [4020, 7420] | gate y31; exits [{"x":99,"y":33},{"x":100,"y":33},{"x":101,"y":33}] | 13 / 1000; [250, 300, 250, 200] | 12 |
| 1-3 / si2 | 기본 [1,40000] | {'0': 38986, '1': 36, '2': 3, '4': 975} | [4020, 7420] | gate y5; exits [{"x":99,"y":7},{"x":100,"y":7},{"x":101,"y":7}] | 13 / 1000; [250, 300, 250, 200] | 자동 compose; 최종수 미확인 |
| 1-4 / si3 | 기본 [1,40000] | {'0': 38986, '1': 36, '2': 3, '4': 975} | [4020, 7420] | gate y5; exits [{"x":99,"y":7},{"x":100,"y":7},{"x":101,"y":7}] | 14 / 1100; [250, 400, 250, 200] | 자동 compose; 최종수 미확인 |

모든 행은 40000타일/200×200/T40이다. si0 최종 tile SHA256은 `655b5c872be2c42c1f202d14728b1c9ee8741eff5bf1a6655461d113564fc0aa`, si1은 `c7994170661e29348e27bdad098020edcb761a11943e68bdea60f9d744236dc1`, si2/3 공통은 `5b40eb67c1aa3fd6ad407f9af06db91f549456bcd9c7d91ed31265c5a3a3b87e`. 이 해시는 seed를 고정한 발췌 실행의 **타일 배열 bytes**다. 브라우저 런타임·물리 종주 인수 해시가 아니다.

#### 소환굴 최종 후보 전수표 (px, timer 제외)

같은 selector/seed 실행의 순서다. `room=1` 또는 corridor `-1`은 원본 후보 생성 메타이며 실제 방 포함판정으로 보정하지 않는다. si1~3 total은 source 계산값이고 Godot에는 아직 해당 stage 소비가 없다. 원본의 timer RNG를 실제 세이브나 P3 owner에 새로 쓰도록 제안하지 않는다.

**si0** — 근거 game.html:30042–30085,30486–30626/31030; 입력 maps_data.js:10–17,36–51.

| 순서 | x | y | size | room | 원본 수량 |
|---|---|---|---|---|---|
| 0 | 2980 | 6740 | 0.5 | 1 | 15 |
| 1 | 5620 | 6420 | 0.3 | 1 | 8 |
| 2 | 2220 | 5620 | 0.5 | 1 | 15 |
| 3 | 5620 | 5220 | 0.3 | 1 | 8 |
| 4 | 3220 | 4220 | 0.5 | 1 | 15 |
| 5 | 5220 | 3220 | 0.5 | 1 | 15 |
| 6 | 2420 | 2420 | 0.3 | 1 | 8 |
| 7 | 5620 | 1820 | 0.5 | 1 | 15 |
| 8 | 4020 | 1020 | 0.8 | 1 | 15 |
| 9 | 3780 | 6220 | 0.3 | 1 | 8 |
| 10 | 3060 | 3420 | 0.55 | 1 | 15 |
| 11 | 4820 | 1900 | 0.8 | 1 | 15 |
| 12 | 4020 | 5540 | 0.3 | -1 | 8 |
| 13 | 4020 | 4140 | 0.3 | -1 | 8 |

**si1** — 근거 game.html:30042–30085,30486–30626/31030; 입력 maps_data.js:10–17,36–51.

| 순서 | x | y | size | room | 원본 수량 |
|---|---|---|---|---|---|
| 0 | 3380 | 6740 | 0.5 | 1 | 100 |
| 1 | 5460 | 6060 | 0.3 | 1 | 50 |
| 2 | 1780 | 6060 | 0.5 | 1 | 100 |
| 3 | 5820 | 5700 | 0.3 | 1 | 50 |
| 4 | 2780 | 3820 | 0.5 | 1 | 100 |
| 5 | 4580 | 2580 | 0.5 | 1 | 100 |
| 6 | 2380 | 2780 | 0.3 | 1 | 50 |
| 7 | 4860 | 3860 | 0.5 | 1 | 100 |
| 8 | 3780 | 6220 | 0.3 | 1 | 50 |
| 9 | 3380 | 3420 | 0.55 | 1 | 100 |
| 10 | 4820 | 1900 | 0.8 | 1 | 100 |
| 11 | 4020 | 5540 | 0.3 | -1 | 50 |
| 12 | 4020 | 4140 | 0.3 | -1 | 50 |

**si2** — 근거 game.html:30042–30085,30486–30626/31030; 입력 maps_data.js:10–17,36–51.

| 순서 | x | y | size | room | 원본 수량 |
|---|---|---|---|---|---|
| 0 | 3300 | 7260 | 0.5 | 1 | 100 |
| 1 | 5500 | 6500 | 0.3 | 1 | 50 |
| 2 | 1620 | 5100 | 0.5 | 1 | 100 |
| 3 | 6020 | 5300 | 0.3 | 1 | 50 |
| 4 | 2860 | 3900 | 0.5 | 1 | 100 |
| 5 | 5140 | 3700 | 0.5 | 1 | 100 |
| 6 | 1740 | 2340 | 0.3 | 1 | 50 |
| 7 | 6180 | 2180 | 0.5 | 1 | 100 |
| 8 | 3780 | 6220 | 0.3 | 1 | 50 |
| 9 | 3060 | 3420 | 0.55 | 1 | 100 |
| 10 | 4820 | 1900 | 0.8 | 1 | 100 |
| 11 | 4020 | 5540 | 0.3 | -1 | 50 |
| 12 | 4020 | 4140 | 0.3 | -1 | 50 |

**si3** — 근거 game.html:30042–30085,30486–30626/31030; 입력 maps_data.js:10–17,36–51.

| 순서 | x | y | size | room | 원본 수량 |
|---|---|---|---|---|---|
| 0 | 2660 | 6420 | 0.5 | 1 | 100 |
| 1 | 4940 | 6980 | 0.3 | 1 | 50 |
| 2 | 2100 | 5060 | 0.5 | 1 | 100 |
| 3 | 5860 | 4580 | 0.3 | 1 | 50 |
| 4 | 3340 | 3940 | 0.5 | 1 | 100 |
| 5 | 5500 | 2860 | 0.5 | 1 | 100 |
| 6 | 2420 | 2700 | 0.3 | 1 | 50 |
| 7 | 5900 | 1220 | 0.5 | 1 | 100 |
| 8 | 4540 | 1540 | 0.8 | 1 | 100 |
| 9 | 3780 | 6220 | 0.3 | 1 | 50 |
| 10 | 3060 | 3420 | 0.55 | 1 | 100 |
| 11 | 4820 | 2140 | 0.8 | 1 | 100 |
| 12 | 4020 | 5540 | 0.3 | -1 | 50 |
| 13 | 4020 | 4140 | 0.3 | -1 | 50 |

#### 명시 배치 입력 전수표

아래 tile은 **저작 입력**이다. 유효 world anchor는 initMapObjects._nearFloor 결과에 +.5를 적용해야 한다. 특히 소품 크기/피벗/col과 실제 visual 애니메이션은 별도다.

**si0 handProps** — game.html:18133–18169.

| 순서 | id | tile x/y | scale 입력 | role/region |
|---|---|---|---|---|
| 0 | m_ctree13 | 84/184 | 0.85 | 없음/없음 |
| 1 | m_ctree14 | 80/150 | 1.1 | 없음/없음 |
| 2 | m_ctree15 | 30/96 | 0.95 | 없음/없음 |
| 3 | m_ctree16 | 80/36 | 1.15 | 없음/없음 |
| 4 | m_ctree17 | 124/31 | 0.9 | 없음/없음 |
| 5 | m_ctree18 | 176/96 | 1.12 | 없음/없음 |
| 6 | m_ctree19 | 124/149 | 0.88 | 없음/없음 |
| 7 | m_ctree20 | 124/179 | 1.08 | 없음/없음 |
| 8 | m_fbones | 82/180 | 없음→1 | 없음/없음 |
| 9 | corpse | 124/179 | 없음→1 | 없음/없음 |
| 10 | m_c1sroot | 76/154 | 없음→1 | 없음/없음 |
| 11 | m_c1groot | 102/86 | 없음→1 | 없음/없음 |
| 12 | m_c1tree | 102/90 | 없음→1 | 없음/없음 |
| 13 | m_c1sroot | 75/105 | 없음→1 | 없음/없음 |
| 14 | m_c1sbone | 80/29 | 없음→1 | 없음/없음 |
| 15 | corpse | 78/37 | 없음→1 | 없음/없음 |
| 16 | m_fbones | 75/43 | 없음→1 | 없음/없음 |
| 17 | m_c1cocoon | 47/50 | 1.55 | 없음/없음 |
| 18 | m_hang_cage | 39/48 | 없음→1 | 없음/없음 |
| 19 | m_c1spod | 40/57 | 없음→1 | 없음/없음 |
| 20 | m_c1spod | 53/59 | 없음→1 | 없음/없음 |
| 21 | m_c1camp | 45/100 | 1.55 | 없음/없음 |
| 22 | m_sword_pile | 39/104 | 없음→1 | 없음/없음 |
| 23 | m_c1sbone | 48/108 | 없음→1 | 없음/없음 |
| 24 | m_bone_arch | 35/150 | 없음→1 | 없음/없음 |
| 25 | m_c1sroot | 43/158 | 없음→1 | 없음/없음 |
| 26 | m_penta_circle | 147/96 | 없음→1 | 없음/없음 |
| 27 | m_c1altar | 147/97 | 1.45 | 없음/없음 |
| 28 | m_skull_totem | 155/101 | 없음→1 | 없음/없음 |
| 29 | m_fyellow | 140/101 | 없음→1 | 없음/없음 |
| 30 | m_c1sbone | 151/106 | 없음→1 | 없음/없음 |
| 31 | m_c1gtoxic | 168/40 | 없음→1 | 없음/없음 |
| 32 | m_c1pool | 167/43 | 1.55 | 없음/없음 |
| 33 | m_c1gtoxicf | 162/136 | 없음→1 | 없음/없음 |
| 34 | pit_poison | 162/139 | 없음→1 | 없음/없음 |
| 35 | m_c1sroot | 171/150 | 없음→1 | 없음/없음 |

**si1 handProps** — game.html:17972–17987,18172–18177.

| 순서 | id | tile x/y | scale 입력 | role/region |
|---|---|---|---|---|
| 0 | m_c1tree | 83/80 | 없음→1 | LANDMARK/tree |
| 1 | m_c1camp | 49/122 | 없음→1 | LANDMARK/central |
| 2 | m_c1altar | 151/91 | 없음→1 | LANDMARK/tree |
| 3 | m_c1pool | 49/151 | 없음→1 | LANDMARK/toxic |
| 4 | m_c1cocoon | 151/136 | 없음→1 | LANDMARK/cocoon |
| 5 | m_c1sroot | 91/180 | 없음→1 | GAMEPLAY/start |
| 6 | m_c1sbone | 85/162 | 없음→1 | GAMEPLAY/south |
| 7 | m_c1spod | 138/158 | 없음→1 | GAMEPLAY/south |
| 8 | m_c1sroot | 129/128 | 없음→1 | GAMEPLAY/cocoon |
| 9 | m_c1sbone | 79/109 | 없음→1 | GAMEPLAY/central |
| 10 | m_c1spod | 128/83 | 없음→1 | GAMEPLAY/tree |
| 11 | m_c1sbone | 116/43 | 없음→1 | GAMEPLAY/north |

si2 compose(game.html:18178–18186): lm=`m_penta_circle`(.72,.38,400), `m_eye_tree`(.74,.42,380), `m_flesh_ball`(.50,.62,520); mega=`m_mega_head`(.28,.35,980); lgMul1/lgDist720/scMul1; largeBias=`m_ctree,m_flesh,m_penta,m_eye_tree`, uni5종; empty(.50,.88,420),(.50,.14,380),(.50,.48,700); groves(.28,.35,900),(.72,.38,900),(.50,.62,800). 이 값은 정규화좌표→world 및 원메타 sz에 대한 scale로 소비한다.

si3 compose(game.html:18187–18195): lm=`m_throne`(.50,.30,400), `m_bone_arch`(.22,.32,360), `m_flesh_maw`(.78,.32,320); mega=[]; lgMul1.25/lgDist640/scMul.90; largeBias=`m_ctree,m_flesh,m_throne,m_vine,m_rotten`; uni=`m_throne,m_bone_arch,m_flesh_maw,m_skull_altar,m_penta_circle`; empty(.50,.52,1200),(.50,.88,400),(.50,.12,400); rim.22. `m_flesh` 등 retired ID가 풀에 남아 있어도 실제 렌더/충돌 가능으로 세지 않는다.

### 1.4 스폰 지점·전환·클리어·환경 연출

| ID | game.html 행 | 원본 계약 / 이식 경계 |
|---|---|---|
| F01 | 31389–31516,31573–31608 | 비RLE만 room/corridor 일반 적·최소80 보완. RLE는 소환굴 사용. 시작500px 안전반경, tile 끼임 이동, si0 중형2마리는 별도 |
| F02 | 31517–31530 | 시작 중형 etype4/EL.D 두 개: P오프셋(-13,-18),(13,-21)×40 → 현재 START기준(3500,6700),(4540,6580). elite/mod/aura 제거 |
| F03 | 31609–31655 | 시작barrier300틱/r280, 문지기 hell0 etype29 gate(+.5,+3.5)좌표, HP4/ATK2/r1.4/poise80, 호위4..6/반경55, 웨이브8..12/거리100..180. 실제 canMv 허용만 추가. 이후 _regionInit |
| F04 | 31029–31030,35636–35693 | 소환굴 cnt S50/M100/L100; si0 ceil(ceil(base*.5)*.3)=8/15/15. 2000px 접근→90틱→900/수량간격, alive700상한 등 P3-002 의존 |
| F05 | 60973–61067 | si0 필드 앵글러4개 _FB_SITES [[58,158],[148,150],[52,42],[148,42]], _FB_ELS와 매칭. 미스폰=생존 취급으로 지역clear막음. 보스 패턴 구현은 별도 담당 |
| F06 | 61239–61281,61445–61447,61645–61660 | 곰치 _WM_SITES [[70,160],[50,100],[155,70],[72,55]], 화마귀 _FD_SITES [[78,125],[125,125],[78,70],[125,70]]. si0 전용/arena제외 gate. actor/공격 미이식 여부는 적·보스 추적 담당 |
| F07 | 32143–32146,60688–60780 | tick순서 fb→region→worm→firedevil. openfield양변180이상만4분면; total=해당hole 수량합. _regKill은 home 우선/ib제외, gate분면만+.10, .8−1e−9이상+담당앵글러사망이면 latch |
| F08 | 41868–41921 | 지역4/4 + si0 _fbDone으로 _bossUnlocked. 지역 없는 맵만 전역80%+문지기10%폴백. exit tile밟음→bossAlive/비arena이면 조건검사후bossLoadPhase1; 보스사망후출구면stageCleared=true |
| F09 | 30697–30748,30749–30810 | CH1 arena128×108, type0원형. entry tile64/103, boss64/54, exit64/2. 필드백업→기존적남은수kill합산→actor/objects/holes정리→arena교체→P배치/보스생성. arena가기전field clear와stage clear 구분 |
| F10 | 41784–41856 | `_bossLoadT += _dtSp`; phase1 fade=`min(1,T/50)` → arena/namecard130틱 → phase3 fade=`max(0,1−T/50)` → phase4 entry100틱. 보스 사망 후 출구 생성. 보스별 승리 연출과 저장은 별도 담당/보호 |
| F11 | 30149–30215,41857–41867 | 존 상태저장/복원, tile6 포탈. 기본CH1 selector는 _zones=null; 존재한다고4에리어간전환과동일취급하지 않음. 저장형식 **보호** |
| F12 | 41921–42022,42024–42124,43896 | SP+10/타임어택90%/clear결과. nextStage는현장정리→같은장si+1/장끝다음startSi→initStage/BGM; demo si0종료 우선. 기록저장 **보호** |
| E01 | 11036–11290,11204,11226–11234 | CH1 parallax/floor-deco/void_vista/vista/plate gate. 명시si1 vista와si0 production청크는 별도 렌더 경로 |
| E02 | 11610–11765 | production64청크, source core1024+bleed1=1026, world1000/core. 기본 smoothing/root production_finish/version20261008-rotforest-98; request→decode→GPUwarm→ready, timeout/error fallback, viewcover일때만underlay skip |
| E03 | 11767–11900,11903–11908 | south/outer QA baked분기와 camera clamp. 같은파일안에legacy경로존재≠기본소비. 화면완성/시임판정은 미확인 |
| E04 | 25619–25734,26473–27664,31659–31668 | torch/sway/wall eyes/glow/background init, prefab/stream/full cache, tile/gate/props렌더. si0 bginit즉시, 타stagebudget분할 |
| E05 | 26729–26822,31690–31710 | 제단hill의시각/논리height/벽band분리. 상수동일성을물리3D지형완성으로사용하지 않음 |
| E06 | 16651–16656,18498–18523,51922–51931,52369–52480,54488 | depthslice·rotTree·occ/foot·back/front/y정렬; sway/face/rot-trees/hill/moat/foreground/boundary/living.draw와shadow·swamp·organic callback. 외부JS 본문은각모듈원천, HTML호출경계 전수열거 |
| E07 | 4366…,8689,8975…,51463…,55215–55387 | fog/torch/환경광/화면후처리. _TORCH={550,.003,10,darkAlpha0,combatBoost100,lowHpShrink.6,bossBoost150}; CH1고정fog얼룩제외55215. 전체공식은그래픽모듈추적범위, 임의튜닝금지 |
| E08 | 60173–60322,60779–60913 | HUD/미니맵지역·gate·카운터/방향화살표; actual si0시작분면3,total32 →0 / 32. stage progress consumer와독립 UI만있음을구분 |

### 1.5 _OBJ_META·CH1 등록 메타 전수표

다음 77개 초기 메타와 CH1 `_CH_DECO[0]` 110행은 AST 원문에서 뽑았다. 등록은 실제 배치를 뜻하지 않는다. 다른 장 전용 초기 키는 **공용 등록 의존**이며 CH1 신규 배치 제안이 아니다. `m_flesh` 등 퇴역이력은 game.html:17487의 Set으로 판정한다. `file/dir/stageMin/Max/authoredOnly`는 등록·배치 필터 정보이며 모두 `_OBJ_META` 필드로 복사되는 것은 아니다.

최종 metadata는 18483–18486의 **기존 Dict를 유지하는 in-place 병합**이다. sz/light/large/mega/rot/flip은 d값의 JS falsy default, alpha/filter/edgeErase/blend/renderLayer/pivot은 undefined 존재 검사, col/collision/colSz/W/H/colParts/keepAR/squareDraw/wallKit/wallUnit/srcRect/sourceSize/trimOffset/assetOrigin은 d또는prev 규칙을 그대로 적용한다. `_renderLayer`도 별도 key다. `colOy`는 초기메타에서 보존되지만 병합 RHS에 없다. onload의 `_edgeErased/_filterBaked`, 이후 rotTree/occ/footYF는 별도 write다. 단순 `{...prev,...d}`를 완전 동등하다고 구현하면 안 된다.

#### 초기 _OBJ_META 77개 (game.html)

| id | 행 | 초기 필드 원문 |
|---|---|---|
| diablo_hell_corpse_tree | 18393–18393 | `{sz:920,large:1,keepAR:1,sway:.0045}` |
| diablo_hell_torch | 18393–18393 | `{sz:150,keepAR:1}` |
| diablo_hell_torch_flame | 18394–18394 | `{sz:150,keepAR:1,anim:{frames:8,cols:4,rows:2,interval:110}}` |
| dead_tree | 18395–18395 | `{sz:64,col:1,sway:.018}` |
| dead_tree_02 | 18395–18395 | `{sz:64,col:1,sway:.016}` |
| dead_tree_03 | 18395–18395 | `{sz:64,col:1,sway:.014}` |
| skull_pile | 18396–18396 | `{sz:32}` |
| bone_rocks | 18396–18396 | `{sz:32}` |
| poison_pool | 18397–18397 | `{sz:32}` |
| frozen_bones | 18398–18398 | `{sz:32}` |
| lava_crack | 18399–18399 | `{sz:40}` |
| fire_pillar | 18399–18399 | `{sz:64,col:1}` |
| rune_mark | 18400–18400 | `{sz:40}` |
| bones | 18401–18401 | `{sz:32}` |
| vine_roots | 18401–18401 | `{sz:40}` |
| corpse | 18402–18402 | `{sz:40}` |
| eyeball | 18402–18402 | `{sz:24}` |
| eye1_bloodshot | 18402–18402 | `{sz:24}` |
| eye2_terror | 18402–18402 | `{sz:24}` |
| glow_flower_blue | 18403–18403 | `{sz:32,light:1}` |
| glow_flower_yellow | 18403–18403 | `{sz:32,light:1}` |
| centipede | 18404–18404 | `{sz:40}` |
| larva | 18404–18404 | `{sz:32}` |
| minibug | 18404–18404 | `{sz:24}` |
| chitin_debris | 18404–18404 | `{sz:32}` |
| pit_lava | 18407–18407 | `{sz:200,collision:true}` |
| pit_poison | 18407–18407 | `{sz:200,collision:true,colW:80,colH:58,colOy:7}` |
| pit_ice | 18408–18408 | `{sz:200,collision:true}` |
| pit_corpse | 18408–18408 | `{sz:200,collision:true}` |
| pit_bugs | 18408–18408 | `{sz:200,collision:true}` |
| lava_straight | 18411–18411 | `{sz:300,collision:true}` |
| lava_straight_v2 | 18411–18411 | `{sz:300,collision:true}` |
| lava_s | 18412–18412 | `{sz:300,collision:true}` |
| lava_s_v4b | 18412–18412 | `{sz:300,collision:true}` |
| lava_s_v5c | 18412–18412 | `{sz:300,collision:true}` |
| lava_l | 18413–18413 | `{sz:200,collision:true}` |
| lava_l_v6a | 18413–18413 | `{sz:300,collision:true}` |
| lava_l_v6b | 18413–18413 | `{sz:300,collision:true}` |
| lava_l_v6c | 18414–18414 | `{sz:300,collision:true}` |
| lava_l_v6d | 18414–18414 | `{sz:300,collision:true}` |
| lava_l_90 | 18415–18415 | `{sz:200,collision:true,rot:90}` |
| lava_l_180 | 18415–18415 | `{sz:200,collision:true,rot:180}` |
| lava_l_270 | 18415–18415 | `{sz:200,collision:true,rot:270}` |
| boss_gate_col | 18416–18416 | `{sz:250,col:1}` |
| m_ctree1 | 18417–18417 | `{sz:250,col:1,large:1}` |
| m_ctree2 | 18417–18417 | `{sz:250,col:1,large:1}` |
| m_ctree3 | 18417–18417 | `{sz:250,col:1,large:1,eyeOvl:1}` |
| m_ctree4 | 18417–18417 | `{sz:250,col:1,large:1}` |
| m_ctree5 | 18417–18417 | `{sz:250,col:1,large:1,eyeOvl:1}` |
| m_ctree6 | 18417–18417 | `{sz:250,col:1,large:1}` |
| m_ctree7 | 18417–18417 | `{sz:250,col:1,large:1,eyeOvl:1}` |
| m_ctree8 | 18417–18417 | `{sz:250,col:1,large:1}` |
| m_ctree9 | 18417–18417 | `{sz:250,col:1,large:1,eyeOvl:1}` |
| m_ctree10 | 18417–18417 | `{sz:250,col:1,large:1}` |
| m_ctree11 | 18417–18417 | `{sz:250,col:1,large:1}` |
| m_ctree12 | 18417–18417 | `{sz:250,col:1,large:1}` |
| m_atree1 | 18417–18417 | `{sz:250,col:1,large:1,touchAnim:{frames:2,radius:120}}` |
| m_cage_gate | 18418–18418 | `{sz:300,col:1,large:1}` |
| m_sword_pile | 18418–18418 | `{sz:200,col:1,large:1}` |
| m_hang_cage | 18418–18418 | `{sz:280,col:1,large:1}` |
| m_skull_altar | 18419–18419 | `{sz:300,col:1,large:1}` |
| m_obelisk | 18419–18419 | `{sz:300,col:1,large:1}` |
| m_flesh_ball | 18419–18419 | `{sz:270,col:1,large:1}` |
| m_penta_circle | 18420–18420 | `{sz:350,col:1,large:1}` |
| m_flesh_maw | 18420–18420 | `{sz:200,col:1,large:1}` |
| m_skull_totem | 18420–18420 | `{sz:240,col:1,large:1,keepAR:1,colW:30,colH:20,colOy:88}` |
| m_bone_arch | 18421–18421 | `{sz:300,col:1,large:1}` |
| m_eye_tree | 18421–18421 | `{sz:350,col:1,large:1}` |
| m_throne | 18421–18421 | `{sz:250,col:1,large:1}` |
| m_dragon_skeleton | 18422–18422 | `{sz:1500,large:1,keepAR:1,col:1,collision:true,colW:650,colH:350,colOy:-37}` |
| m_dragon_3d | 18423–18423 | `{sz:3000,large:1,keepAR:1,col:1,collision:true,colW:838,colH:715,colOy:-6}` |
| m_usergore1 | 18424–18424 | `{sz:220,keepAR:1}` |
| m_usergore2 | 18424–18424 | `{sz:220,keepAR:1}` |
| m_usergore3 | 18424–18424 | `{sz:220,keepAR:1,anchorBottom:1}` |
| m_usergore4 | 18425–18425 | `{sz:220,keepAR:1,anchorBottom:1}` |
| m_usergore5 | 18425–18425 | `{sz:220,keepAR:1,anchorBottom:1}` |
| m_usergore6 | 18425–18425 | `{sz:220,keepAR:1,anchorBottom:1}` |

#### CH1 _CH_DECO[0] 110개 (game.html; 원문에 있는 모든 필드)

| 순서/id | 행 | 등록 원문 |
|---|---|---|
| 0/m_tree1 | 17521–17521 | `{id:'m_tree1',file:'tree_dead_01.png',sz:100}` |
| 1/m_tree2 | 17521–17521 | `{id:'m_tree2',file:'tree_dead_02.png',sz:100}` |
| 2/m_tree3 | 17521–17521 | `{id:'m_tree3',file:'tree_dead_03.png',sz:100}` |
| 3/m_eye | 17522–17522 | `{id:'m_eye',file:'eyeball.png',sz:40}` |
| 4/m_eye1 | 17522–17522 | `{id:'m_eye1',file:'eye1_bloodshot.png',sz:40}` |
| 5/m_eye2 | 17522–17522 | `{id:'m_eye2',file:'eye2_terror.png',sz:40}` |
| 6/m_poison | 17523–17523 | `{id:'m_poison',file:'poison_pool.png',sz:48}` |
| 7/m_fblue | 17524–17524 | `{id:'m_fblue',file:'glow_flower_blue.png',sz:40,light:1}` |
| 8/m_fyellow | 17524–17524 | `{id:'m_fyellow',file:'glow_flower_yellow.png',sz:40,light:1}` |
| 9/m_fbones | 17525–17525 | `{id:'m_fbones',file:'frozen_bones.png',sz:48}` |
| 10/m_larva | 17526–17526 | `{id:'m_larva',file:'larva.png',sz:56}` |
| 11/m_mini | 17526–17526 | `{id:'m_mini',file:'minibug.png',sz:40}` |
| 12/m_ctree1 | 17534–17534 | `{id:'m_ctree1',file:'cursed_tree_01.png',sz:400,large:1,dir:'collision',colSz:60,hardAlpha:1}` |
| 13/m_ctree2 | 17535–17535 | `{id:'m_ctree2',file:'cursed_tree_02.png',sz:400,large:1,dir:'collision',colSz:60,hardAlpha:1}` |
| 14/m_ctree3 | 17536–17536 | `{id:'m_ctree3',file:'cursed_tree_03.png',sz:400,large:1,dir:'collision',colSz:60,hardAlpha:1}` |
| 15/m_ctree4 | 17537–17537 | `{id:'m_ctree4',file:'cursed_tree_04.png',sz:400,large:1,dir:'collision',colSz:60,hardAlpha:1}` |
| 16/m_ctree5 | 17538–17538 | `{id:'m_ctree5',file:'cursed_tree_05.png',sz:400,large:1,dir:'collision',colSz:60,hardAlpha:1}` |
| 17/m_ctree6 | 17539–17539 | `{id:'m_ctree6',file:'cursed_tree_06.png',sz:400,large:1,dir:'collision',colSz:60,hardAlpha:1}` |
| 18/m_ctree7 | 17540–17540 | `{id:'m_ctree7',file:'cursed_tree_07.png',sz:400,large:1,dir:'collision',colSz:60,hardAlpha:1}` |
| 19/m_ctree8 | 17541–17541 | `{id:'m_ctree8',file:'cursed_tree_08.png',sz:400,large:1,dir:'collision',colSz:60,hardAlpha:1}` |
| 20/m_ctree9 | 17542–17542 | `{id:'m_ctree9',file:'cursed_tree_09.png',sz:400,large:1,dir:'collision',colSz:60,hardAlpha:1}` |
| 21/m_ctree10 | 17543–17543 | `{id:'m_ctree10',file:'cursed_tree_10.png',sz:400,large:1,dir:'collision',colSz:60,hardAlpha:1}` |
| 22/m_ctree11 | 17544–17544 | `{id:'m_ctree11',file:'cursed_tree_11.png',sz:400,large:1,dir:'collision',hardAlpha:1}` |
| 23/m_ctree12 | 17545–17545 | `{id:'m_ctree12',file:'cursed_tree_12.png',sz:400,large:1,dir:'collision',hardAlpha:1}` |
| 24/m_ctree13 | 17547–17547 | `{id:'m_ctree13',file:'rotforest_tree_01.png',sz:400,large:1,col:1,dir:'collision',colSz:60,sharedAtlas:1,stageMax:0,authoredOnly:1}` |
| 25/m_ctree14 | 17548–17548 | `{id:'m_ctree14',file:'rotforest_tree_02.png',sz:400,large:1,col:1,dir:'collision',colSz:60,sharedAtlas:1,stageMax:0,authoredOnly:1}` |
| 26/m_ctree15 | 17549–17549 | `{id:'m_ctree15',file:'rotforest_tree_04.png',sz:400,large:1,col:1,dir:'collision',colSz:60,sharedAtlas:1,stageMax:0,authoredOnly:1}` |
| 27/m_ctree16 | 17550–17550 | `{id:'m_ctree16',file:'rotforest_tree_03.png',sz:400,large:1,col:1,dir:'collision',colSz:60,sharedAtlas:1,stageMax:0,authoredOnly:1}` |
| 28/m_ctree17 | 17551–17551 | `{id:'m_ctree17',file:'rotforest_tree_05.png',sz:400,large:1,col:1,dir:'collision',colSz:60,sharedAtlas:1,stageMax:0,authoredOnly:1}` |
| 29/m_ctree18 | 17552–17552 | `{id:'m_ctree18',file:'rotforest_tree_11.png',sz:400,large:1,col:1,dir:'collision',colSz:60,sharedAtlas:1,stageMax:0,authoredOnly:1}` |
| 30/m_ctree19 | 17553–17553 | `{id:'m_ctree19',file:'rotforest_tree_06.png',sz:400,large:1,col:1,dir:'collision',sharedAtlas:1,stageMax:0,authoredOnly:1}` |
| 31/m_ctree20 | 17554–17554 | `{id:'m_ctree20',file:'rotforest_tree_07.png',sz:400,large:1,col:1,dir:'collision',sharedAtlas:1,stageMax:0,authoredOnly:1}` |
| 32/m_atree1 | 17555–17555 | `{id:'m_atree1',file:'anim_tree_01.png',sz:400,large:1,dir:'collision',hardAlpha:1}` |
| 33/m_cage_gate | 17556–17556 | `{id:'m_cage_gate',file:'cage_gate.png',sz:300,large:1,dir:'collision'}` |
| 34/m_sword_pile | 17557–17557 | `{id:'m_sword_pile',file:'sword_pile.png',sz:200,large:1,dir:'collision'}` |
| 35/m_hang_cage | 17558–17558 | `{id:'m_hang_cage',file:'hang_cage.png',sz:280,large:1,dir:'collision'}` |
| 36/m_skull_altar | 17559–17559 | `{id:'m_skull_altar',file:'skull_altar.png',sz:300,large:1,dir:'collision'}` |
| 37/m_obelisk | 17560–17560 | `{id:'m_obelisk',file:'obelisk.png',sz:300,large:1,dir:'collision'}` |
| 38/m_flesh_ball | 17561–17561 | `{id:'m_flesh_ball',file:'flesh_ball.png',sz:270,large:1,dir:'collision'}` |
| 39/m_penta_circle | 17562–17562 | `{id:'m_penta_circle',file:'penta_circle.png',sz:350,large:1,dir:'collision'}` |
| 40/m_flesh_maw | 17563–17563 | `{id:'m_flesh_maw',file:'flesh_maw.png',sz:200,large:1,dir:'collision'}` |
| 41/m_skull_totem | 17564–17564 | `{id:'m_skull_totem',file:'skull_totem.png',sz:240,large:1,dir:'collision'}` |
| 42/m_bone_arch | 17565–17565 | `{id:'m_bone_arch',file:'bone_arch.png',sz:300,large:1,dir:'collision'}` |
| 43/m_eye_tree | 17566–17566 | `{id:'m_eye_tree',file:'eye_tree.png',sz:350,large:1,dir:'collision'}` |
| 44/m_throne | 17567–17567 | `{id:'m_throne',file:'throne.png',sz:250,large:1,dir:'collision'}` |
| 45/m_mega_statue | 17570–17570 | `{id:'m_mega_statue',file:'mega_statue.png',sz:480,large:1,mega:1,dir:'collision',col:1,colSz:140,keepAR:1}` |
| 46/m_mega_ribs | 17571–17571 | `{id:'m_mega_ribs',file:'mega_ribs.png',sz:900,large:1,mega:1,dir:'collision',col:1,colW:380,colH:150,keepAR:1}` |
| 47/m_mega_chapel | 17572–17572 | `{id:'m_mega_chapel',file:'mega_chapel.png',sz:520,large:1,mega:1,dir:'collision',col:1,colSz:110,keepAR:1}` |
| 48/m_mega_head | 17573–17573 | `{id:'m_mega_head',file:'mega_head.png',sz:720,large:1,mega:1,dir:'collision',col:1,colW:260,colH:160,keepAR:1}` |
| 49/m_flesh_g0 | 17574–17574 | `{id:'m_flesh_g0',file:'flesh_g_0.png',sz:352,scatter:1}` |
| 50/m_flesh_g0f | 17575–17575 | `{id:'m_flesh_g0f',file:'flesh_g_0.png',sz:352,scatter:1,flip:1}` |
| 51/m_flesh_h0 | 17576–17576 | `{id:'m_flesh_h0',file:'flesh_h_0.png',sz:352,scatter:1}` |
| 52/m_flesh_h0f | 17577–17577 | `{id:'m_flesh_h0f',file:'flesh_h_0.png',sz:352,scatter:1,flip:1}` |
| 53/m_tumor00 | 17578–17578 | `{id:'m_tumor00',file:'clean_tumor_0_0.png',sz:150,scatter:1}` |
| 54/m_tumor00f | 17579–17579 | `{id:'m_tumor00f',file:'clean_tumor_0_0.png',sz:150,scatter:1,flip:1}` |
| 55/m_tumor01 | 17580–17580 | `{id:'m_tumor01',file:'clean_tumor_0_1.png',sz:150,scatter:1}` |
| 56/m_tumor01f | 17581–17581 | `{id:'m_tumor01f',file:'clean_tumor_0_1.png',sz:150,scatter:1,flip:1}` |
| 57/m_tumor02 | 17582–17582 | `{id:'m_tumor02',file:'clean_tumor_0_2.png',sz:150,scatter:1}` |
| 58/m_tumor10 | 17583–17583 | `{id:'m_tumor10',file:'clean_tumor_1_0.png',sz:150,scatter:1}` |
| 59/m_tumor11 | 17584–17584 | `{id:'m_tumor11',file:'clean_tumor_1_1.png',sz:150,scatter:1}` |
| 60/m_tumor12 | 17585–17585 | `{id:'m_tumor12',file:'clean_tumor_1_2.png',sz:150,scatter:1}` |
| 61/m_fixblk0 | 17586–17586 | `{id:'m_fixblk0',file:'fixed_black_0.png',sz:150,scatter:1}` |
| 62/m_fixblk1 | 17587–17587 | `{id:'m_fixblk1',file:'fixed_black_1.png',sz:150,scatter:1}` |
| 63/m_fleshwall_a | 17588–17588 | `{id:'m_fleshwall_a',file:'flesh_wall_a.png',sz:300,scatter:1}` |
| 64/m_fleshwall_af | 17589–17589 | `{id:'m_fleshwall_af',file:'flesh_wall_a.png',sz:300,scatter:1,flip:1}` |
| 65/m_fleshwall_b | 17590–17590 | `{id:'m_fleshwall_b',file:'flesh_wall_b.png',sz:300,scatter:1}` |
| 66/m_fleshwall_bf | 17591–17591 | `{id:'m_fleshwall_bf',file:'flesh_wall_b.png',sz:300,scatter:1,flip:1}` |
| 67/m_usergore1 | 17592–17592 | `{id:'m_usergore1',file:'provided_gore_01.png',sz:220,userProvided:1,floorMount:1,stageMin:0,stageMax:34}` |
| 68/m_usergore2 | 17593–17593 | `{id:'m_usergore2',file:'provided_gore_02.png',sz:220,userProvided:1,floorMount:1,stageMin:0,stageMax:34}` |
| 69/m_usergore3 | 17594–17594 | `{id:'m_usergore3',file:'provided_gore_03.png',sz:220,userProvided:1,floorMount:1,stageMin:0,stageMax:34}` |
| 70/m_usergore4 | 17595–17595 | `{id:'m_usergore4',file:'provided_gore_04.png',sz:220,userProvided:1,floorMount:1,stageMin:0,stageMax:34}` |
| 71/m_usergore5 | 17596–17596 | `{id:'m_usergore5',file:'provided_gore_05.png',sz:220,userProvided:1,floorMount:1,stageMin:0,stageMax:34}` |
| 72/m_usergore6 | 17597–17597 | `{id:'m_usergore6',file:'provided_gore_06.png',sz:220,userProvided:1,floorMount:1,stageMin:0,stageMax:34}` |
| 73/m_c1tree | 17600–17600 | `{id:'m_c1tree',file:'prop_corpsetree.png',sz:1450,large:1,dir:'collision',col:1,colW:380,colH:230,keepAR:1}` |
| 74/m_c1bn | 17601–17601 | `{id:'m_c1bn',file:'bound_n.png',sz:640,large:1,dir:'collision',col:1,colW:250,colH:70,keepAR:1}` |
| 75/m_c1bnf | 17602–17602 | `{id:'m_c1bnf',file:'bound_n.png',sz:560,large:1,dir:'collision',col:1,colW:220,colH:62,keepAR:1,flip:1}` |
| 76/m_c1bs | 17603–17603 | `{id:'m_c1bs',file:'bound_s.png',sz:640,large:1,dir:'collision',col:1,colW:250,colH:70,keepAR:1}` |
| 77/m_c1bsf | 17604–17604 | `{id:'m_c1bsf',file:'bound_s.png',sz:560,large:1,dir:'collision',col:1,colW:220,colH:62,keepAR:1,flip:1}` |
| 78/m_c1bw | 17605–17605 | `{id:'m_c1bw',file:'bound_w.png',sz:640,large:1,dir:'collision',col:1,colW:110,colH:230,keepAR:1}` |
| 79/m_c1bwf | 17606–17606 | `{id:'m_c1bwf',file:'bound_w.png',sz:560,large:1,dir:'collision',col:1,colW:98,colH:200,keepAR:1,flip:1}` |
| 80/m_c1be | 17607–17607 | `{id:'m_c1be',file:'bound_e.png',sz:640,large:1,dir:'collision',col:1,colW:95,colH:230,keepAR:1}` |
| 81/m_c1bef | 17608–17608 | `{id:'m_c1bef',file:'bound_e.png',sz:560,large:1,dir:'collision',col:1,colW:85,colH:200,keepAR:1,flip:1}` |
| 82/m_c1cnw | 17609–17609 | `{id:'m_c1cnw',file:'corner_nw.png',sz:480,large:1,dir:'collision',col:1,colSz:170,keepAR:1}` |
| 83/m_c1cne | 17610–17610 | `{id:'m_c1cne',file:'corner_ne.png',sz:480,large:1,dir:'collision',col:1,colSz:170,keepAR:1}` |
| 84/m_c1csw | 17611–17611 | `{id:'m_c1csw',file:'corner_sw.png',sz:480,large:1,dir:'collision',col:1,colSz:170,keepAR:1}` |
| 85/m_c1cse | 17612–17612 | `{id:'m_c1cse',file:'corner_se.png',sz:480,large:1,dir:'collision',col:1,colSz:170,keepAR:1}` |
| 86/m_c1cnef | 17613–17613 | `{id:'m_c1cnef',file:'corner_ne.png',sz:300,large:1,dir:'collision',col:1,colSz:105,keepAR:1,flip:1}` |
| 87/m_c1cswf | 17614–17614 | `{id:'m_c1cswf',file:'corner_sw.png',sz:300,large:1,dir:'collision',col:1,colSz:105,keepAR:1,flip:1}` |
| 88/m_c1camp | 17615–17615 | `{id:'m_c1camp',file:'prop_camp.png',sz:380,large:1,dir:'collision',col:1,colW:130,colH:80,keepAR:1}` |
| 89/m_c1altar | 17616–17616 | `{id:'m_c1altar',file:'prop_altar.png',sz:330,large:1,dir:'collision',col:1,colSz:95,keepAR:1}` |
| 90/m_c1pool | 17617–17617 | `{id:'m_c1pool',file:'prop_pool.png',sz:300,large:1,dir:'collision',col:1,colSz:85,keepAR:1}` |
| 91/m_c1cocoon | 17618–17618 | `{id:'m_c1cocoon',file:'prop_cocoon.png',sz:280,large:1,dir:'collision',col:1,colSz:80,keepAR:1}` |
| 92/m_c1gbattle | 17619–17619 | `{id:'m_c1gbattle',file:'prop_g_battle.png',sz:880,keepAR:1}` |
| 93/m_c1gbattlef | 17620–17620 | `{id:'m_c1gbattlef',file:'prop_g_battle.png',sz:720,keepAR:1,flip:1}` |
| 94/m_c1gbattler | 17621–17621 | `{id:'m_c1gbattler',file:'prop_g_battle.png',sz:640,keepAR:1,rot:9}` |
| 95/m_c1gpath | 17622–17622 | `{id:'m_c1gpath',file:'prop_g_battle.png',sz:460,keepAR:1}` |
| 96/m_c1gpathf | 17623–17623 | `{id:'m_c1gpathf',file:'prop_g_battle.png',sz:400,keepAR:1,flip:1}` |
| 97/m_c1gpock | 17624–17624 | `{id:'m_c1gpock',file:'prop_g_battle.png',sz:620,keepAR:1}` |
| 98/m_c1groot | 17625–17625 | `{id:'m_c1groot',file:'prop_g_root.png',sz:760,keepAR:1}` |
| 99/m_c1grootf | 17626–17626 | `{id:'m_c1grootf',file:'prop_g_root.png',sz:660,keepAR:1,flip:1}` |
| 100/m_c1grootr | 17627–17627 | `{id:'m_c1grootr',file:'prop_g_root.png',sz:600,keepAR:1,rot:-7}` |
| 101/m_c1gtoxic | 17628–17628 | `{id:'m_c1gtoxic',file:'prop_g_toxic.png',sz:550,keepAR:1}` |
| 102/m_c1gtoxicf | 17629–17629 | `{id:'m_c1gtoxicf',file:'prop_g_toxic.png',sz:450,keepAR:1,flip:1}` |
| 103/m_c1gcorpse | 17630–17630 | `{id:'m_c1gcorpse',file:'prop_g_corpse.png',sz:600,keepAR:1}` |
| 104/m_c1gcorpsef | 17631–17631 | `{id:'m_c1gcorpsef',file:'prop_g_corpse.png',sz:500,keepAR:1,flip:1}` |
| 105/m_c1gedge | 17632–17632 | `{id:'m_c1gedge',file:'prop_g_edge.png',sz:800,keepAR:1}` |
| 106/m_c1gedgef | 17633–17633 | `{id:'m_c1gedgef',file:'prop_g_edge.png',sz:760,keepAR:1,flip:1}` |
| 107/m_c1sbone | 17634–17634 | `{id:'m_c1sbone',file:'prop_s_bone.png',sz:150,keepAR:1}` |
| 108/m_c1sroot | 17635–17635 | `{id:'m_c1sroot',file:'prop_s_root.png',sz:150,keepAR:1}` |
| 109/m_c1spod | 17636–17636 | `{id:'m_c1spod',file:'prop_s_pod.png',sz:150,keepAR:1}` |

## 2. docs와 최신 원본의 불일치·상태 차이 (표로만 보고)

이 표는 설계 수정 지시가 아니다. 명시된 과거 이력은 당시 상태로 보존하며, 원본과 현행 요약의 대응이 안 되는 지점을 구분했다.

| ID | 설계/기존 문서 위치 | 최신 원본·실제 파일 | 차이/판정 |
|---|---|---|---|
| D01 | MAP BIBLE:38–42 | 16634,29549–29553,30042–30049 | 표의 vert/grid·si3 250×250은 상단6의200²개정 전 목표. 현행4개 모두200²; 구표를재추출입력으로사용불가 |
| D02 | MAP BIBLE:33,66–77 | 16688–16695 | 숲의기생수/숲의사냥꾼과 runtime보스슬롯 다크드루이드/독버섯거인/지옥기형/다크드루이드 대응불일치. 보스팀소유, 명칭/패턴변경제안없음 |
| D03 | 맵구성_1장.md:3,119–127 | 18133–18169 / map.json props36 | 상단authored62/runtime63, 본문63/123 등 제작시점수치와 현행손배치36 다름. actual전체MAP_OBJS수는별도미확인;36을런타임전체수로치환불가 |
| D04 | 맵구성_1장.md:156–163 | 18172–18177,30049 / si1 geometry:55–106 | si1 basin(cx100,cy122,rx80,ry64) 설명과 전용7구역ellipse/tube마스크+12배치 차이. vista:1은유지되나 basin필드없음 |
| D05 | MAP BIBLE:40–42 / 맵구성_1장:165… | 18178–18195,30049 | si2 버섯미로·si3 뿌리둥지는시각기획; 현행두에리어 [1,40000]clone기하공유. 지형미로구현으로세면안됨 |
| D06 | MAP BIBLE:48 / 맵오브젝트 목록 pit 설명 | 18407,31711 | pit_poison은막히는타원[80,58],offset7. 동일오브젝트에밟으면독DOT필드없음. 환경위험전체가없다고확대하지않음 |
| D07 | MAP BIBLE:80–87 / 맵구성_1장:75 | 25793–25806,31609–31610 | 경계안식처계획과주석bonfire생성차이. 시작barrier는존재하지만안식처저장기능아님. 소환굴9전후vs최종si0 14 |
| D08 | 맵구성_1장:76 지역80% 요약 | 41868–41913,60719–60731 | 4분면80%외 gate분면+.10, si0담당앵글러+_fbDone, 이후보스arena/보스사망출구단계가추가. 4지역clear=에리어clear 아님 |
| D09 | 맵오브젝트_에셋목록 상단95/90차4종나무 | 17548–17555,18500,11615 | 현행rotforest나무id별파일1/2/4/3/5/11/6/7, cache98. 목록의4종/95차는그시점이력;최신등록110행별도필요 |
| D10 | 전체그래픽MASTER:30–33 금지그로테스크/일반비전 | 맵디테일 최신콘셉트 +18122–18169/51922–51931 | 최신CH1피부·동맥·부패생체나무의구체승인과옛마스터문구충돌. 원본변경·새아트제안없음 |
| D11 | 맵_화면효과_전수조사 여러 ~12만/~13만행 | 현재 HTML 전체와E01–08 | 옛행번호는현재649xx줄원본과대응불가. torch등수치가일치하는항목도있어전부오류로판정안함 |
| D12 | FDG_GODOT_PORT_MAP_RESOURCE_FIRST:17–28 | map.json기존PNG vs최신원본재추출 | 문서97차/oldsource핀과현재웹98차·tree5/11/6/7 다름. 재추출92자산중46차이(청크42/나무4), 타일·충돌·배치동일. 제품재인수없음 |
| D13 | FDG_FEATURE_INVENTORY:374–378 | main에P3-001/002/003존재 | 과거snapshot에서지역/소환굴미연결표시는그시점판정. 현재의존으로존재;si1~3·보스·전환이완성됐다는뜻아님 |
| D14 | FDG_WORLD_TRANSITION/FDG_WORLD_MAP_WAYPOINT의fixturePASS | world.gd:22,1109,3194 | CPU World fixture/Studio MAP_PILOT과GodotCH1실제품35에리어전환은별도. 해당문서도등록0을명시하므로이식완료로오독금지 |
| D15 | 2_3·Q/E·세이브 관련자료 | 저장/전투호출부 | **보호**. 변경제안없음. SV-CONTRACT/설정/로비담당의형식을이맵계획이재설계하지않음 |

## 3. 실제 Godot·도구·기존 테스트의 현재 경계

### 3.1 존재하는 파이프라인과 빠진 소비자

| 실제 경로/행 | 이미 존재하는 것 | 빠진 것 / 제한 |
|---|---|---|
| engine/fdg/map-source-adapter.js:140–180,291…,517…,569–624 | stage0-source/manifest 검증, polygon nav/고유 source metadata 보존, preview/명시 hand collider normalization | stage0 + CH1_1_PRODUCTION version고정;1..3거부. Godot export_world를호출하는공통backend아님. 소스높이를새physicalZ로추정안함 |
| godot/tools/export_world.mjs:1–126 | AST발췌→productionlayout→genFromTemplate→40000tile→292wallrect/19collider/36prop/64chunk; PNGbyte복사 | stage0고정, outRoot=도구의부모godot이므로기본실행은제품에씀. 기본sourceRoot=R은이번작업금지;항상최신WT명시. enemy.json도동시생성하는옛1적export이며encounters전체아님 |
| godot/data/map.json:1 | exoduser.godot.ch1-native-first.v1, stage0/200²/T40/8000²;tilehash일치 | 다른stage데이터0. base source SHA5212…는과거전체export; P3pit update에최신4d91…범위출처별도. header를최신전체export로오독금지 |
| godot/scripts/world.gd:905–971,976–981,1100–1144 | 고정map읽기→groundsurface→collision/props/chunks→encounter→ready. typedbakedpublication실제소비 | 맵별resource교체API/전이lifecycle없음. stage0/200²/64chunk guard존재 |
| world.gd:3086–3225,3242–3332 | visiblechunk, wallunion/4bounds, circle/128분할ellipse/hill, analytic네모서리/LOS, Spriteprops, flowfield | 8000/200고정. stage1에도hill를복사해적용하면원본불일치. 물리128분할과원본analytic완전동등미확인 |
| godot/port_modules/map_resource/{producer,litter,ground_provider,ground_surface}.gd | soil brightness.85/saturation.48/tile1024; litter.76/.55/alpha.7/tile512; Worldactualbinding존재 | heldzones/전체환경layer/동적living/si1vista·전용지형소비미완. 독립API/test의성공은제품자원폐쇄증명아님 |
| godot/port_modules/map_resource/{map_view_owner,prop_source_transform,prop_pivot_resolver,prop_nav_adapter,prop_visibility_owner,prop_view_assembly,wall_packet_binding,floor_display_owner}.gd | partial명시view/변환/visibility/벽packet API가존재 | fixture/외부ROOT경로참조가있는모듈과실제Main호출을구분. 파일존재로4에리어조립완료주장불가 |
| world.gd:1475–1707,1913–2033 | source77meta→CHDECOmerge250/current296등록·동일ref/후처리경계의기존sourceowner | 전체JSCanvas/CSS후처리동등성·이번110CH1최신모든값·PNG동등성은미확인. map.propsmetadata는별도정적snapshot |
| godot/scripts/native_spawn_hole_system.gd:1–61,install_native_boot; main.gd:265 | P3-002:최종14/168,접근/분출/RNG/적등록연결. etype0만supported,미지원은journal정직정지 | STAGE0고정,si1..3의1000/1100분모·다른적풀·문지기일괄완성아님 |
| godot/scripts/native_regions.gd:59–118,143–161;main.gd:267… | P3-003:분면total/homekill/clear/banner/HUD/미니맵,실G공유. sourcekill집행연결존재 | _bossUnlocked설정≠arena전이;필드앵글러실actor사망이없으면fullflow차단 |
| godot/scripts/native_screen_lighting.gd:154–239;tests/test_p2003a_lighting.gd | P2-003a원본조명stage연결,draw/snapshot검사존재 | CH1living전체 7모듈/새최신청크·전경·제단모션을전부옮긴것아님 |
| godot/scripts/main.gd:123,176,265–271;native_source_new_run_state.gd:115,175,453 | WorldSTART→P/currentG·stageentryrefill,소환굴후지역설치 | stage0→1→2→3→4의소유/정리/새맵준비·entry·bossarena·clear/nextStage서비스미연결. 저장형식 **보호** |
| godot/tests/test_contracts.gd:73–141 | wallcoverage정확1회/tilealigned/runtimeShape/STARTEXIT/네모서리/범위/BFS계약존재 | BFS는물리캐릭터자연종주증거아님. 이번Godot실행없음 |
| godot/tests/test_p3002_spawn_holes.gd, test_p3003_regions.gd, test_p2002a_hud.gd, test_native_main_source_starter_state.gd | P3/P2actualMain격리회귀파일존재;최근QS-01에서148/0·43/0·36/0은별도작업실행이력 | 여기서재실행/이작업PASS로합산하지않음. 기존testUSERDIR각자사용규칙유지 |
| test/fdgNativePitPoisonSource.test.mjs;engine/fdg/map-source-adapter.js:624… | P3-001 exactpit[80,58]/+7 strictellipse·기존delta경계 | 이번추적은read-only의존,재튜닝/원형화/새collision알고리즘없음 |

### 3.2 이번에 실제 실행한 검사·원로그

테스트·재추출은 모두 이 worktree의 최신 원본을 읽었으며 코드/테스트를 수정하지 않았다. `node`는 v24.15.0. worktree에 acorn이 없어 첫 `require.resolve`는 MODULE_NOT_FOUND였다. 읽기 전용 분석/원문 exporter는 **R의 설치된 acorn 라이브러리만** 사용했다(원본 HTML 입력은 최신 WT). R 파일/설정/node_modules 쓰기0, 새 설치/테스트 임시패치0.

| 실제 명령/입력 | 결과 | 한계/로그 |
|---|---|---|
| node L/source-inspect.cjs | exit0,4에리어값/77초기meta/110CH1deco/36+12손배치 추출 | L/source-inspection.json, source-inspection.stdout.log. VM발췌관측이며브라우저/게임실행아님 |
| node --test test/ch1ProductionFinish.test.js test/ch1Si1AuthoredLayout.test.js test/ch1Si1GeometryRedesign.test.js test/regionClearGate.test.js test/fdgMapSourceAdapter.test.mjs | 전체37:통과28/실패9/skip0,exit1,141.164ms | L/map-tests.stdout.log, map-tests.stderr.log. 전체PASS아님 |
| 위 ch1ProductionFinish | 4통과/1실패 | 기존cullingfixture:59가_moCull미정의. 수정안/임시global주입없음 |
| 위 si1AuthoredLayout / si1GeometryRedesign | 7/0 +10/0 | 12개배치role/region·전용geometry/너비/우회/BFS. 원본실게임시각PASS아님 |
| 위 regionClearGate | 1통과/6실패 | fixture VM에Image미정의(region-block:185). 제품의지역실패라고단정하지않고확인된harness실패만기록 |
| 위 fdgMapSourceAdapter | 6통과/2실패 | test:42/179 pending 기대불일치. P3-001보고서에도같은6/8기준선이력. 테스트약화/어댑터수리없음 |
| 원export_world.mjs 바이트동일복사→L/reextract/tools/export_world.mjs; NODE_PATH=R/node_modules node <복사도구> <최신WT> L/export-evidence | exit0/0.572s:tiles40000,wall292,collider19,props36,chunks64,PNG92개 | 제품exporter실행아님. 출력은L/reextract하위. 원로그reextract.result.json/stdout/stderr/export-evidence/export-receipt.json |
| 재추출JSON/PNG와godot기존데이터비교 | tile/colliders/position동일;JSON변경경로11개;92PNG중46개차이 | L/reextract-comparison.json. source출처3경로+나무4개의texture/file8경로. PNG차이42청크+4나무,자동인수0 |
| Godot/Main/시각/PC | 이번미실행/미확인 | 문서추적단위. 기존검수이력을이실행PASS로재사용안함 |

원 exporter는 `outRoot`를 CLI evidence 인자로 바꿀 수 없다. §4 재추출에서 **도구를 L 아래 byte동일 복사**하는 이유다. 원문 도구를 worktree/godot/tools에서 직접 실행하면 map.json·enemy.json·PNG에 쓰므로 이번에는 그렇게 실행하지 않았다.

## 4. 에리어 단위의 작은 이식 순서안

아래는 **후속 배정 후보**다. 지금 코드/테스트/PNG/설계 변경 승인으로 사용하지 않는다. 새 경로는 조사 기준 main에서 부재임을 확인한다. 다음 구현 전에 fetch/작업판·소유권을 다시 확인한다. `CH1-01`은 공용·기존제품0줄로 바로 독립 구현 가능한 데이터 단위이며, 이후는 각기 새 배정으로 나눈다. 다음 단위가 완료됐다고 이전 시각/플레이 미인수 범위를 지우지 않는다.

### 4.1 1번 CH1-01 — si0 읽기 전용 원본 snapshot·검증 모듈 (구현 지시서)

목표: 현재 이미 소비되는 si0의 **최신 원본 입력과 최종 생성 결과를 추적 가능한 새 artifact로 고정**한다. 기존 map.json/PNG와의 차이를 보고하되 자동 교체하지 않는다. P3 소환굴·지역을 재구현하거나 runtime owner를 설치하지 않는다.

| 항목 | 구현 지시 |
|---|---|
| 만들 파일 | ① godot/tools/export_ch1_area_source.mjs ② godot/data/ch1_map_source/si0.json ③ godot/port_modules/ch1_map_source/producer.gd ④ test/fdgCh1AreaSource.test.mjs ⑤ godot/tests/test_p3004a_ch1_area_source.gd (+Godot생성uid만). 기존파일수정0,공용6개각0줄. runtime연결없음 |
| 추출 CLI (새로 만들 API) | node godot/tools/export_ch1_area_source.mjs <latest-WT-root> <explicit-output-json> --stage 0 --seed 20261020. sourceRoot/output둘다필수,기본R없음. 지원stage0만;1..3입력은unsupported로비정상종료/출력쓰기0. PNG/기존map/enemy/저장/서버/브라우저쓰기0 |
| 원본발췌 | game.html:16631–16711의T/CHAPTER_STAGES/행, _MAP_COMPOSE[0]18122–18171, _OBJ_META18392–18426, CH_DECO[0]17520–17637, selector30042–30085/30135–30147, genFromTemplate30218–30694와아래helper. maps_data.js6–55/layout.js3–39. acorn으로정확AST범위/라인/sha기록,문자열치환으로원함수의값·분기수정금지 |
| helper closure | 29037–29146 carving/smooth/bossDist,26473 _tseed,29928–30041 RLE/forest/path/basin/gate,29556–29559 mkRng,31029–31030 SPAWN_HOLE/_spawnHoleCount. _cacheExitCenter19793도원문발췌하고_exitCX/_exitCY를VM에선언(이번관측no-op를제품추출기에영구복제할필요없음). 보스공격/목적함수stub로타일/총량위조금지 |
| 실행경계 | 기본URL gate를원initializer로평가하여독립QA false 확인(기존export_world참조); _DIABLO_FIELD_QA=false/생산경로, MAP_ALL_FLOOR=false. sourceVM안에서seededMath만사용. _getFixedMapForStage(0)의비plate/비dungeon→clone결과를exact closure로실행하거나동일선택을메타에명시. DOM/initStage/mkEn/initMapObjects 실행범위아님 |
| snapshot JSON 계약 | schema exoduser.ch1-area-source.v1; stage0,source{main_sha,game_sha256,각 외부JSsha,function{line,end,sha256}},grid{width:200,height:200,tile_size:40},tiles40000,runtime_tile_sha256,rooms,exits,boss_gate,start_tile/start_world,hand_props_raw36,initial_obj_meta77,ch1_deco_raw110,spawn_holes_final14(순서/x/y/size/room/count),total_spawned168,region_totals[23,60,53,32],environment_refs(HTML62–71/11615),scope{runtime_bound:false,visual_verified:false,save_access:0}. 값없는필드는미확인/absent구분,원undefined를JSONnull과동등취급하지않고존재mask별도기록 |
| timer/완전성 | 원timer600+random*60는seed고정발췌값일뿐자연부트실측아님. 검사에서는timer를비교대상분리하고seed/소비순서기록. initMapObjects미실행이므로final_MAP_OBJS/최종CH1전체collision 수를새snapshot의입증값으로창작금지 |
| metadata 처리 | 초기77/deco110 raw별도보존. 실효메타를추가하면18486의각필드JStruthy/undefined/prev규칙을그대로구현하고base/merged상태구분. file/dir/amount/등록필드전체가_OBJ_META와동일하다고쓰지않음. onloadflag/rotTree/occ는필요입력과각원본행을별도기록,미실행은미확인 |
| producer API | `extends RefCounted`. `read_area(raw:Variant)->Dictionary`, `validate_area(raw:Variant)->Dictionary`, `compare_stage0_map(raw:Dictionary,existing:Dictionary)->Dictionary` 세 순수 메서드. 입력 수정/노드 생성/자원 load/파일 쓰기/시계/RNG 0. stage·필수 필드·타입·배열 길이·해시·출처 부족은 `NOT_READY`와 reason/원 raw 참조를 반환하며 최상위 value는 없다. 지원하는 read는 `READY`와 원 snapshot value를 반환하고 `scope=source_snapshot_only`를 명시한다. compare는 `compared_fields`와 `unobserved_fields`를 분리한다. data 검증 성공을 full_stage_ready로 명명하지 않는다 |
| Node 핵심단정 | `test/fdgCh1AreaSource.test.mjs`: 최신 WT 원본에서 직접 추출해 tile SHA `655b…` 전체 일치/40000/타일 개수19958,19755,3,3,281; rooms6; START[4020,7420]; gate3@99..101/y5·exit3@y7; hand36/초기77/deco110; holes14/168/분면[23,60,53,32]; pit 초기 메타[80,58]/+7·rawtile[162,139]를 단정한다. 두 번 재추출한 deterministic 필드가 같고 source/기존map/PNG 해시는 그대로여야 한다. 최종 MAP_OBJS/collider 비교 성공은 이 raw snapshot으로 주장하지 않는다 |
| Godot 핵심단정 | `test_p3004a_ch1_area_source.gd`: snapshot JSON의 같은 값/키 존재·순서·입력 불변·반복 질의를 검사한다. missing stage/si1/tiles39999/total167/지역 합 불일치/source SHA 없음은 NOT_READY, 최상위 value 없음, Dictionary/Array 원참조 보존. `compare_stage0_map`은 실제 `map.json`을 명시 인자로 받아 **tiles와 raw hand ID/저작 좌표·deco의 file 차이만** 비교한다. collider/effective position은 이 snapshot에 없으므로 `NOT_OBSERVED`로 남기고 동등성 성공을 반환하지 않는다. 기존 artifact 쓰기와 Main preload/instantiate는 금지 |
| 격리/명령 | EXODUSER-ch1-01-Isolated-20261020. 지정원Godot4.7.2만사용: Godot --headless --path "$WT/godot" --script res://tests/test_p3004a_ch1_area_source.gd. override는작업userdir설정후finally0byte/commit금지. Main부팅아닌puretest임을명시. 새Node/Godot실제실행수치/exit/원stderr를보고서에기록,지금예상PASS수창작금지 |
| 회귀/선행 | 최신 main의 P3-001/002/003을 읽기 전용 의존으로 사용한다. 기존 map/region/HUD suite는 각 파일 USERDIR로 실행한다(§4.8). 기존 Node37/9실패 기준선을 보존하며 실패 수정·선별 실행을 전체 PASS로 포장하지 않는다. acorn은 기존 설치본을 읽기 전용으로 사용하거나 담당 범위에서 정상 의존 준비를 한다. 원본 SHA `4d91…`가 바뀌면 행·기대값을 다시 대조한다 |
| 소유/충돌 | 새tool/data/module/test만소유, 기존export_world/map-source-adapter/P3owner/공용6무수정. WORK_BOARD에새경로배정겹침없음확인. 기존 mapbase출처/수목42+4차이를CH1-01에서자동수용금지. 완료상태=si0 source contract격리검수,환경/전투/전환완료아님 |

### 4.2 2번 CH1-02 — si0 최신 정적 환경 자산 동기화만

| 항목 | 단위 지시 |
|---|---|
| 만들/수정 파일 | 신규 `test/fdgCh1Stage0AssetSnapshot.test.mjs`, `godot/tests/test_p3004b_ch1_stage0_environment.gd`; 허용받은 `godot/data/map.json`의 tree4 texture/file8경로+범위출처, `godot/assets/map/production_finish/`의 실제차이42PNG와 `godot/assets/map/props/`의새나무4PNG만. 기존 exporter/적데이터/공용파일0줄. import sidecar는해당자산만 별도소유확정 |
| 원본/재추출 | game17548–17555,18500/11615/18137–18138. §4.8 명령B로기존도구를L로복사하여새재추출. 기존source.root/game_sha는base출처보존,이번범위갱신출처별도. 타일/collider/배치변경검출시중단 |
| 핵심 검증/격리 | Node에서원본→target92PNGbyte/hash,기존예상차이46개만수용하고tileSHA/292/19/36/64·pit80/58/+7 보존. Godot `EXODUSER-ch1-02-Isolated-20261020`에서chunkTexture1026²/coreRect1/1/1024/1024/world1000·treefile/pivot/scale실소비 검사. START/EARLY/ARENA/SIDE-L/R/LANDMARK/LATE/EXIT 8카메라1x 비교; 시각은별도PASS/RETOUCH/FAIL |
| 선행/충돌 | CH1-01 sourceartifact검수, 맵/ART 자산소유확정, P3pit회귀. 이단위는정적PNG만;동적모듈을동시에추가하지않음. 다른 팀아트/캐시/플레이창변경금지. 현재 visual미확인 |

### 4.3 3번 CH1-03 — si1 지형·12배치 source 데이터 (연결 전)

| 항목 | 단위 지시 |
|---|---|
| 파일 | `godot/tools/export_ch1_area_source.mjs`의stage1분기, 신규 `godot/data/ch1_map_source/si1.json`, `godot/port_modules/ch1_map_source/stage1_contract.gd`, `test/fdgCh1Stage1Source.test.mjs`, `godot/tests/test_p3004c_ch1_stage1_source.gd`. 기존world/main0줄 |
| 원본/재추출 | game17972–17987/18172–18177/30042–30085/30218–30694, si1_geometry.js전체. 새CLI `node godot/tools/export_ch1_area_source.mjs "$WT" "$L/si1.json" --stage 1 --seed 20261020`; 현재미구현명령임을유지. source단계의RLE/mask도최종runtime타일과구분 |
| 검증 | Node/Godot에서 200²/T40, 최종tileSHA c799…,분포0:13588/1:25590/2:3/4:819, START4020/7420, gatey31/exity33(x99..101), rawhand12/랜드마크5/게임7/region7, hole13/total1000/분면250/300/250/200을 단정. `EXODUSER-ch1-03-Isolated-20261020`,새 GDScript는Main0. 소환굴timer발췌조건/seed분리 |
| 선행/충돌 | CH1-01 완료, si1전용모듈·12배치현재보존. P3-002 STAGE0상수을 1로고치는것은금지, 분모read-only출력. 기하/소품추가 재디자인0, 아직플레이가능아님 |

### 4.4 4번 CH1-04 — si1 소비자·전환 전 standalone World

| 항목 | 단위 지시 |
|---|---|
| 파일 | 신규 `godot/scripts/native_ch1_area_world.gd`, `native_ch1_area_resources.gd`, `godot/scenes/ch1_area_preview.tscn`, `godot/tests/test_p3004d_ch1_stage1_world.gd`; 필요한자산을새 `godot/assets/map/ch1_si1/` 아래byte복사. 기존world/main/hud/player0줄을1차경계로고정 |
| 원본/재추출 | 11204/11226–11234/18172–18177/25735–26081/26949…/31711. CH1-03 명령으로latestsi1재추출, vista/floor/currentpropsmetadata원본 path를명시. stage0의hill/colliders/chunks64를si1로무조건복제금지 |
| 검증/격리 | `EXODUSER-ch1-04-Isolated-20261020` standalone격리scene에서 source타일/출구33/12props role/region, nearFloor실효좌표, layer/pivot/currentTexture, tile1exactunion, analyticcanMv/LOS/START→EXIT BFS. Main과실P리소스지정없이fixtureactor설치. 독립8camera/종주+시임/pageerror상응resourceerror/texturemissing기록 |
| 선행/충돌 | CH1-03·사용자별자산배정, map_resource의현행 stage0guard와별도범위. P3소환굴/적자연 생성과 전이는 미연결. 보스팀·enemy_factory타인소유수정0, 제품World일반화는 후속CH1-07 |

### 4.5 5번 CH1-05 — si2 공통필드·군락 compose

| 항목 | 단위 지시 |
|---|---|
| 파일 | stage2 extractor분기/`godot/data/ch1_map_source/si2.json`, 신규 `godot/port_modules/ch1_map_source/stage2_composition.gd`, `test/fdgCh1Stage2Source.test.mjs`, `godot/tests/test_p3004e_ch1_stage2_world.gd`; CH1-04 standalone리소스consumer의stage2명시분기만수정. 공용6개0줄 |
| 원본/재추출 | game18178–18186,30042–30085,25735–26471. CLI §4.1의`--stage 2`새 분기. [1,40000]와 최종보스room/게이트변경순서보존. lm/mega/unique/large/scatter원래 순서를분리port, retiredSet17487보존 |
| 핵심 단정/격리 | `EXODUSER-ch1-05-Isolated-20261020`; tileSHA5b40…/0:38986/1:36/2:3/4:975,gate5/exit7,holes13/1000/분면250/300/250/200. lm3/mega1, groves3의원좌표/size, empty3 정확. 최종 MAP_OBJS는새원본initMapObjects관측fixture을 선행해count/hash/순서를확정(지금미확인, 임의오브젝트수목표금지) |
| 선행/충돌 | CH1-04 standalone·원본 initMapObjects의 완전한 의존 함수와 RNG 입력·시각소유합의. 버섯미로을 추가설계하지않고원본기본필드군락그대로. P3-002확장/적factory는별도담당, 지원없으면정직NR |

### 4.6 6번 CH1-06 — si3 공통필드·둥지 compose

| 항목 | 단위 지시 |
|---|---|
| 파일 | stage3 extractor분기/`godot/data/ch1_map_source/si3.json`, 신규 `godot/port_modules/ch1_map_source/stage3_composition.gd`, `test/fdgCh1Stage3Source.test.mjs`, `godot/tests/test_p3004f_ch1_stage3_world.gd`; standaloneconsumer stage3분기. 공용6개0줄 |
| 원본/재추출 | game18187–18195/30042–30085/25735–26471;새 CLI `--stage 3 --seed 20261020`. 기하는si2동일라도spawn지터seed/compose을 공유 상태로섞지않음 |
| 단정/격리 | `EXODUSER-ch1-06-Isolated-20261020`; tileSHA5b40…/총40000/START4020,7420/gate5,exit7;hole14,total1100,분면250/400/250/200. lm throne/bone_arch/flesh_maw3, mega[], lgMul1.25/lgDist640/scMul.90/rim.22, empty3. 최종prop수/이동종주/8camera는새기준원본실행후검수, 지금미확인 |
| 선행/충돌 | CH1-05 source조립, 보스si3별도담당. 다크드루이드피날레·로비챕터연출구현끼워넣지않음. 원본데모si0종료정책도별도보존. 기존세이브/progress형식 **보호** |

### 4.7 7번 CH1-07 — 4에리어 제품 전환·보스 아레나·클리어 연결 (다시 작은 배정으로 분리)

| 항목 | 단위 지시 |
|---|---|
| 만들 파일 | `godot/scripts/native_ch1_stage_flow.gd`, `native_ch1_boss_arena_map.gd`, `godot/tests/test_p3004g_ch1_stage_flow.gd`, `test/fdgCh1StageFlowSource.test.mjs`. 첫배정=gate/phase순수 정책, 다음=arena맵/준비·owner폐기, 다음=제품호출/clear/nextstage. 한커밋에모두넣지않음 |
| 수정 예정 | main.gd 부팅/기존World리소스선택부, world.gd load/cleanup/bounds/flowfield, hud.gd 맵cache/전이표시만. 최소위치는§5. 적·보스actor/killwriter는해당담당소유허가후에만연결 |
| 원본/재추출 | 30697–30810/41784–41921/43896/60697–60780. stage0..3각snapshot재추출+원본 genBossArena 발췌. arena128×108/T40/entry64,103/boss64,54/exit64,2. 보스 AI반입은다른단위 |
| 핵심 검증 | `EXODUSER-ch1-07-Isolated-20261020`;4분면미클리어/si0fb미완은입구봉인,조건충족에서만phase1→2(130tick)→3→4(100tick), boss사망 전 stageCleared금지, 사망 후 exit에서만clear;완료1회,nextStage순서0→1→2→3→4, demo0에서는종료. 필드actor/projectile/chunk/효과/flowfield폐기·lateasync결과차단을 검사. P3분모/HUD32보존, 보호저장schema변경0 |
| 선행/충돌 | CH1-01~06·P3-001/002/003검수, 실제 필드 앵글러/문지기/보스actor인수가 필수. native_regions._bossUnlocked만true로만들어미지원보스우회금지. TRACE-BOSS-CH1/TRACE-CH1-ENEMIES/TRACE-LOBBY/SV-CONTRACT/P2-008b와구체소유조율전제품공용수정BLOCKED. 순수정책테스트만독립착수가능 |

### 4.8 재추출·실행 명령과 원로그 규칙

명령 A는 CH1-01에서 **새로 구현할 CLI**이며 지금 존재하지 않는다. B는 이번 실제 실행한 기존 stage0 exporter다. C는 후속 Main 회귀 규칙이다.

```sh
# 예시 경로. 후속 구현자는 승인받은 자기 worktree/로그 경로로 지정한다.
WT=/Users/fordeargamers/exoduser-wt/trace-maps-ch1
L=/Users/fordeargamers/exoduser-wt/_out/trace-maps-ch1
GODOT_BIN=/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot
cd "$WT"
# A (후속 구현 후): 한 stage에 한 명시 JSON, 기존 map/PNG 변경 없음
node godot/tools/export_ch1_area_source.mjs "$WT" "$L/si0.json" --stage 0 --seed 20261020
node --test test/fdgCh1AreaSource.test.mjs
# 아래 Godot 명령은 override 격리명을 맞춘 후 실행하고, 종료 시 override를 비운다.
"$GODOT_BIN" --headless --path "$WT/godot" --script res://tests/test_p3004a_ch1_area_source.gd
# CH1-03/05/06에서 stage 1/2/3을 명시적으로 추가한 뒤 각각 재추출한다.

# B (이미 실제 확인): 기존 exporter 출력 위치를 도구의 상대경로로 격리
mkdir -p "$L/reextract/tools"
cp "$WT/godot/tools/export_world.mjs" "$L/reextract/tools/export_world.mjs"
NODE_PATH=/Users/fordeargamers/Projects/exoduser-migration-20261001/node_modules   node "$L/reextract/tools/export_world.mjs" "$WT" "$L/export-evidence"
# 기존 원문 도구는 enemy.json과 PNG도 생성한다. 제품으로 자동 복사/덮어쓰기하지 않는다.
```

Godot binary는 `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`만 사용한다. `override.cfg`의 `application/config/use_custom_user_dir=true`, `application/config/custom_user_dir_name`을 각 suite의 **실제 상수**와 일치시킨 뒤 실행하고 매번 finally에서 비운다. override는 커밋하지 않는다. 기존 suite에 새 단위 격리명을 강요하지 않는다.

| 회귀 script | 격리 이름 / 명령 뒤 인수 |
|---|---|
| test_contracts.gd | 파일이 강제하는 이름 유무를 최신 파일에서 확인; Main 미부팅 map만 우선 `-- --only=map`, 전체는별도실행기록 |
| test_p3002_spawn_holes.gd | `EXODUSER-P3002-Isolated-20261020`; 원본168/14와 미지원 etype의 정직한 기록을 검증 |
| test_p3003_regions.gd | `EXODUSER-P3003-Isolated-20261020`; actual분면23/60/53/32·합168 |
| test_native_main_source_starter_state.gd | `EXODUSER-MainSourceStarter-Isolated-20261014`;G초기40+지역7+_totalSpawned1=48,frame 이후 추가 키와구분 |
| test_p2002a_hud.gd | `EXODUSER-P2002A-Isolated-20261020`;시작0 / 32, SKIP/forcedfixture 수를숨기지않음 |

실제 각 명령은 `Godot --headless --path "$WT/godot" --script res://tests/<파일>`이다. 실행 경로/HEAD/기준main/argv/override명/exit/time/stdout/stderr를 단위별 L에 저장한다. Main을 띄우는 heavy 검수와 QA 첫처치/다른 게임 측정을 겹치지 않는다. 신규 테스트는 `git add -f -- <정확경로>`, 그 외도 경로 지정만 사용한다. 기존 테스트 실패를 고쳐야 할 경우 본 단위 소유권을 확대하지 않고 실패 원문을 보고한다.

## 5. 공용 파일 접점 목록 (이번 각0줄)

최소 줄 수는 **후속 설계 견적**이며 정확 구현 diff가 아니다. 현재 CH1-01~06은 공용0줄을 경계로 삼았다. CH1-07 제품 연결은 별도 담당 승인 후 최신 행·타인 diff를 다시 확인한다.

| 공용 파일 / 현행 위치 | 후속 필요한 접점 | 최소 수정 견적/충돌 |
|---|---|---|
| main.gd:123–128,176–181,265–271 | 초기World/readiness·P START·stageentry·hole확정→regioninit 순서;stageflow설치/전이중owner정리 | 새flow설치호출약4–8줄+전이callback4–8줄. 실field이름/최종줄수 **미확인**. P2-008b/로비/저장/스킬초기화소유와조율 |
| world.gd:22,905–971,976–981,1109,3086–3225,3242–3332 | 단일MAP_FILE선택·stage0guard·200/8000고정·hill적용·chunk/props/physics/flowfield설치/폐기 | 맵준비/폐기위임call각2–4줄, bounds/stride를문맥 값로읽는각1줄. 전체diff최소 수는 **미확인**(기존포괄guard여러곳). 성급한전체 stage허용금지 |
| hud.gd:58–65,88–90,952–999 | 에리어/World 교체 때 미니맵 cache·지역/exit/보스 표시를 갱신한다. 기존 시작 HUD0/32 보존 | cache 무효화 호출 약2–4줄과 새 맵 binding 약2–4줄 예상. 정확 최종 줄 수는 **미확인**. P2-009a UI 담당 소유 확인 후 |
| player.gd:127–131 (`set_world`/`get_combat_world`), 기존 이동 query | 다른 에리어에서도 같은 world query와 새 START를 전달한다. 이동/능력 공식 재작성은 필요하지 않음 | 우선0줄. 필요하면 world 참조 교체 약1–2줄. 정확 접점은 flow owner 선택 후 **미확인**. Q/E **보호** |
| native_normal_enemy_hurte.gd::_kill_pipeline (원42702대응) | 이미P3-003 _regKill→home분면 기록연결있음. 후속보스사망 통지만해당담당계약으로분리 | 현재새수정필요0줄. 보스actor인수전다크드루이드처치를일반enemy death로위조금지 |
| native_source_new_run_state.gd:115,175,453 | currentG의stage/map/regions/hole분모/entryrefill실제 owner와flow연결;신규 run과nextstage구분 | pureCH1-01는 0줄. 소유state전이위임 약 2–6줄예상, 실API **미확인**. 초기G/저장payload/QE보호형식변경제안없음 |

## 6. 미확인·중단 경계와 제출 검수

| 항목 | 상태 |
|---|---|
| 최신 원본 4에리어 selector/타일/명시배치·등록 메타 | 이 문서 표와 VM 원로그로 추적. 다른 장·보스 AI 전체 전수 추적은 범위 밖 |
| si2/si3 실제 initMapObjects 전체수·최종 collider/자동scatter·실시각 | **미확인**. source compose/literal과 실제 소비 완료를 구분 |
| 4에리어 실제 종주·보스/클리어→다음에리어 자연 진행 | **미확인**. 원본 경로 추적과 제품 구현 인수는 별도 |
| 최신 웹 PNG와 기존 Godot PNG 일치 | 92중46차이 실확인. 이 문서에서 교체0. 나무4/청크42 동기화는 CH1-02 별도 |
| 기존 Node map suite | 37중28통과/9실패 실측. 임시fixture/테스트/제품수리0. 이 실패는 추적 문서 제출 장애가 아니지만 전체 기술PASS로 보고불가 |
| 진행 중 다른 담당 | WORK_BOARD의보스/적/로비/세이브/설정/스킬/아이템소유를보존. 공용교체전충돌이면후속구현을BLOCKED로보고하고우회하지않음 |
| R / INDEX / WORK | 시작R HEAD dd49171c5b88e211575a41f185395d6c0a14b184, branch codex/mac-live-play-time-main-20261017, tracked INDEX/WORK clean. 최종원상태검사·자기branch원격SHA는L/DONE.txt와receipt에기록 |
| Git 제출 | 본문은자기최종commitSHA를미리기입하지않음. 정상훅→자기branch비강제push→ls-remote대조→L/DONE.txt. main push/병합/force/reset0 |

### MAP PRODUCTION REPORT — §23 / 추적 문서 단위

| 필수 항목 | 이번 결과 |
|---|---|
| STAGE | CH1 si0~3 원본추적·이식설계; 제작/게임코드변경0 |
| MASTER | silhouette/regions/main route/side spaces: si0 53점/8semantic,si1 7region,si2/3기본공통필드·compose구분을기록. 새MASTER저작0 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes: 원본gate·경계·타일추적. 자산배치/보정/새보행공간0 |
| LARGE | sourceassets/composites/overlap/repeatedsilhouette: 77초기/110CH1등록·36/12손배치·최신 tree차이추적. 새에셋0 |
| MEDIUM | connections/remainingholes: sourcecarving/nearFloor/hand/auto순서추적, 실접합품질미관측 |
| GROUND | shadow/contamination/structureintegration: sourcebaked/core/world비율·hill/living·기존Godotsoil/litter부분소비추적. 보호geometry변경0 |
| PLAYABLE | arenas/travel/breathing/threat/readability: 원본START/EXIT·spawn·클리어조건표작성. 실플레이/가독성인수0 |
| LANDMARK | primary/secondary/tertiary: si0tree/제단/sidePOI,si1 5landmark,si2/3lm/mega/uni원값기록. 새저작0 |
| CAMERA QA | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT: 이번8화면미촬영/미관측 |
| TECH QA | route/collision:원본 data발췌·구tile/collider동일. pageerror/404/seam/loading/performance:게임검수미실행. Node37/9실패보존, 원문export별도exit0 |
| FILES | stage-owned=새추적md1(훅필요시최상단CHANGELOG절추가만); concurrent/unrelatedcode·test·설계0 |
| GIT | 정확경로stage/정상hook/자기branchpush/remote SHA는DONE/receipt;deploy0 |
| VISUAL VERDICT | **RETOUCH / NOT_OBSERVED** — 기존 문서의 전체 맵 RETOUCH는 이력이며 이번 새 시각 검수는 미실시. 시각 PASS 주장 없음 |
| NEXT PASS | CH1-01만후속배정가능:공용/기존제품0줄source snapshot+purevalidator+신규test. 정적 자산차이는CH1-02, 실전환은CH1-07선행충족후 |


### 문서 독자 검토

독립 읽기 전용 검토에서 CH1-01의 snapshot에 없는 collider/effective position 비교 요구와 실행 변수 정의 누락을 발견했다. 전자는 `NOT_OBSERVED` 비교 범위로 분리하고 후자는 §4.8에 WT/L/Godot 경로·작업 디렉터리·신규 Node 명령을 추가했다. 원본 페이드 공식을 `_bossLoadT/50`으로 재대조했다. 검토자는 원본 SHA·타일/소환굴/명시 배치 수·기존 Godot292/19/36/64와 stage0 제한을 확인했다. 이 검토를 게임 실행 PASS로 세지 않는다.
