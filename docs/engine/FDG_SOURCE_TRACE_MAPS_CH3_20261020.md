# 3장 4에리어 원본 추적·이식 순서안 — 2026-10-20

작업 `trace-maps-ch3` / 브랜치 `codex/trace-maps-ch3-20261020`. **원본 게임플레이 계약의 추적·이식 설계만 제출한다. 제품 구현·Godot 실행·시각 인수 완료가 아니다.** 원본은 에리어·스폰·충돌·전환·클리어·지역의 근거이며, 맵 표현은 사용자가 지정한 PoE2·No Rest for the Wicked 수준의 입체감·생동감·부분 광원을 목표로 Godot에서 제작한다. 웹판 그림·필터·광원을 1:1 재현하는 것이 이 문서의 완료 조건은 아니다.

| 기준 | 고정 값 / 경계 |
|---|---|
| fetch origin/main / 분기 HEAD | a00893ad9b93750d7ce70b90f5bd501b578daccb |
| game.html | 65,692행 / SHA256 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4 |
| WT / 원로그 L | `~/exoduser-wt/trace-maps-ch3` / `~/exoduser-wt/_out/trace-maps-ch3/` |
| 허용 변경 | 이 문서 신규 1개 + CHANGELOG_SYNC 최상단 절. 제품 코드·기존 테스트·에셋·SSOT 수정 0 |
| 관측 범위 | 고정 Git blob 정적 읽기·원문 함수 발췌 Node VM. 브라우저 initStage 전체·mkEn·initMapObjects·Godot 실행 0 |
| 보호 | R HEAD/branch/tracked INDEX/WORK, 공용 main/world/player/hud/State, 타 담당 파일·Q/E·저장·사용자 데이터 |

## 0. 선행 문서·CH1/CH2 결과와 재사용 경계

최신 main에는 [CH1 추적 문서](FDG_SOURCE_TRACE_MAPS_CH1_20261020.md)가 있고 **CH2 추적 문서는 없다**. 게시된 `origin/codex/trace-maps-ch2-20261020`의 고정 SHA로 같은 문서를 읽었다. 아래는 원격에서 읽은 구현 결과이며 이번 브랜치로 병합하지 않았다. 타 worktree의 미커밋 진행분은 건드리지 않았다. CH2 문서의 “CH1-04 원격 미게시”는 당시 이력이고 이번에는 실제 원격 CH1-04가 있다.

| 참조 / 고정 원격 SHA | 실제 읽은 산출물·재사용 / 인수 한계 |
|---|---|
| CH1 trace: main, 게시 tip 668cfdedf62dd4758057c4c16ea185fffa0c424f | §1 selector/생성·충돌/전환, §3 파이프라인, §4 지시서, §5 공용 접점 형식 |
| CH2 trace: 18070adfaa99da8e31c5dfcc8264b5d9b0982107 | [6에리어 추적·순서안](https://github.com/beearth/the-exoduser/blob/18070adfaa99da8e31c5dfcc8264b5d9b0982107/docs/engine/FDG_SOURCE_TRACE_MAPS_CH2_20261020.md). source-only와 실효 배치·실게임·시각 인수를 분리하는 형식 |
| CH1-01: 677b86fa2e4afcfd7ee6e3d4ef4d7f18e7834152 | exporter·순수 producer·새 검사/보고서. 원본 snapshot과 기존 제품 map.json 분리 |
| CH1-02: d0f7eaf4875ec2c2649a1e724e01a528769665cd | 제한 필드 자산 동기화 도구·검사/보고서. 보존·바이트 대조 방식만 재사용. CH1 청크64·나무·언덕을 CH3로 복사하지 않는다 |
| CH1-03: aada9b28b066cfb1c23487c6c0a8036e18fba3f7 | selector→genFromTemplate→정확 START→regionInit·AST 출처/행/SHA·undefined mask·stage1_contract. 순수 READY는 source_snapshot_only |
| CH1-04: 5487245c3d857927cf8c0634d0ea5edb05650340 | resource exporter·native_ch1_area_resources/world·preview scene·검사/보고서. si1의 실제 initMapObjects/collision 발췌와 독립 World를 분리. fixture actor이며 적·스폰·전환 없는 기술 preview: 이를 실제 플레이어·CH3 완성으로 확대하지 않는다 |
| CH2-01: 4013102a82c9ddc3bd7d0f75ba0159438f86d93f | 단일 export_ch1_area_source.mjs의 stage0/1/4, stage4_contract, Node/Godot 검사·보고서. 좁은 장별 선택·다른 stage 보존·CLI 출력 보호·actual 원화 byte 참조 방식. stage10~13은 아직 지원하지 않는다 |
| 맵 SSOT index / 제작 GUIDE / REGION_CLEAR_GATE / MAP_RUNTIME_ARCHITECTURE | MASTER→OUTER MASS→MEDIUM→GROUND→PLAYABLE→LANDMARK→SMALL→CAMERA→TECH, visual/collision 분리·원래 지역/문 순서 보존. 제작 GUIDE v0.9 전부 읽음 |
| MAP_LOOK_GODOT_PASS1_20261020.md / Godot 개조 전략 §8 | 웹 표현 복제가 아닌 Godot 직접 제작. 충돌·동선·스폰·지역은 불변. 현재 data/map_look_ch1.json·props/chunks 경로는 CH1용이며 CH3 프로파일 인수는 별도 |

이번 확인 시 원격 `codex/ch2-02-*`는 없었다. CH2-02 실제 World 결과·CH1 후보들의 main 병합/제품 진행 인수 여부를 추정하지 않는다. 상세 ref/변경 파일/읽은 코드·보고서는 L/reference-refs.txt와 reference-sources/에 고정했다.

## 1. 최신 원본 행 전수 추적

G=`a00893ad9b93750d7ce70b90f5bd501b578daccb:game.html`, M=`동일 SHA:maps_data.js`. 아래는 4에리어의 선택·입력·소비 단계 전체 색인이고, 부록은 raw hand 405개/등록61개/굴46개를 전수 기록한다. 공통 helper의 본문/함수행·SHA는 L/source-index-10~13.json, 원문은 L/game.html.source.txt에 보존한다. 적·보스의 전체 공격 AI는 별도 담당 범위이며 여기서는 생성/권한 접점까지만 추적했다.

### 1.1 장·선택·생성·START 계약

| ID / 원본 행 | 실제 계약 |
|---|---|
| S01 / G16631–16713 | T40, hell2/startSi10/stages4→si10~13/floor0~3. 공개명 지옥의 겨울/HELL WINTER, STG 표시 지옥의 겨울 1~4구역·monLv300·EL.I. boss 순서 얼음 망령/서리의 기사/얼어붙은 감시자/얼음 속 봉인 괴물, si13만 isHellBoss |
| S02 / G3463–3477,16643–16648 | 빈 URL의 실제 기본 selector를 기준으로 한다. demo 기본 종료는 si0이며 QA/stage query가 곧 si10 자연 부트를 보장하지 않는다. 전체 initStage 부트는 미확인 |
| S03 / G16668–16676,30135–30147 | 대표 face는 si10. _DUNGEON_SPEC[11].ready=false라 si11도 기본 필드. 특수/plate 우선 gate가 꺼졌고 FIXED_MAPS[0]가 있으면 stage별 legacy 고정맵 대신 _cloneField11 사용 |
| S04 / M6–55, G29549–29559 | FIXED_MAPS[0]의 rooms6/corridors5/features3/corridorSpawns2/원 hand hole9를 clone. mw/mh200. rooms/spawn marker는 metadata이며 RLE에서 자동 몬스터 생성의 증거가 아님 |
| S05 / G17813–17968,18203–18206 | si10=_HELLWINTER10 IIFE, si11~13=_ICE11/12/13 + _iceC/_iceB. 전부 hand1/dense1/lm[]. si10만 mega[]/basin(cx100,cy100,rx90,ry88,gateX100,gateY5,gateW12). raw hand346/18/21/20 |
| S06 / G29928–29932,30008–30020,30042–30085 | si10 basin→RLE, 복제 원굴9의 x100/y 보간. si11~13은 [1,40000] editor floor + mkRng(si*7919+17) 지터/clamp18..182. CH1 polygon/hill/path를 추가하지 않는다 |
| S07 / G30218–30334 | RLE coverage/force 검사→1을 floor0, 나머지를 wall1로 해석. RLE이면 일반 room/corridor carving·room pillar 쓰기 생략. rooms는 별도 생성. 뒤 boss room/게이트/폭 확장 등으로 최종 grid는 초기 RLE와 달라진다 |
| S08 / G30335–30442,30028–30034 | 공통 boss room/출구 처리 뒤 **si10만** 북쪽 x88..112/y2..35 floor, gate3개99..101/y5와 exit3개/y7을 다시 쓴다. 다른 에리어의 bossGate metadata를 code3 타일 존재로 오인하지 않는다 |
| S09 / G30486–30626 | 굴 후보→추가/보정→벽 위 spiral r<15의 floor0 검색→주변11×11 floor30미만 제거→최종 _totalSpawned. seed 고정 Math.random은 timer 관측용이며 실제 플레이 RNG 증거 아님 |
| S10 / G31533–31569 | actor/effect/상태 정리→selector→generator→start room의 floor0 검색(r1..29)→(tile+.5)*40. START 모든 에리어 tile100/185, world4020/7420. 자원/상태 full refill·iframes360 등은 원래 State/Player 권위에 위임 |
| S11 / G31573–31614 | RLE이므로 room/corridor 자동 적·최소80보완·START 근접굴 삭제는 비실행. CH1 start medium2는 si0 전용. 안전반경500·bonfire300ticks/r280은 전체 initStage에서의 순서로 구분 |
| S12 / G31615–31655 | 문지기 etype49/EL.I 후보(100.5,8.5)*40. **tile===0**일 때만 생성·hp×4/atk×2/r×1.4/poise80,호위4~6/주변8~12 후보. si10의 후보tile0, si11~13은tile4라 해당 gate 분기는 거절될 입력이다. mkEn·호위 실생존은 이번 미확인. 소환굴 확정 후 regionInit |
| S13 / G31656–31669 | camera/pets·map cache·background initMapObjects·BGM. si0만 즉시 _tickBgInit(9999). 선언 snapshot에 실제 이미지/충돌 준비·BGM·장면 READY를 붙이지 않는다 |

### 1.2 4에리어의 원문 발췌 VM 관측

원격 CH1-03/CH2-01 계열 추출 방식을 L의 관측 harness에 재사용했다. 제품 도구 수정 없이 고정 Git blob에서 필요한 선언·함수 원문을 AST로 읽고 selector→genFromTemplate→정확 START 발췌→_regionInit을 실행했다. stage별 IIFE와 helper는 원문 그대로이며 Math.random만 seed20261020 LCG(imul1664525+1013904223,uint32/2³²)로 주입했다. DOM/Image/mkEn/initStage 전체/initMapObjects 실행은 0이다. 원래 mkRng·연산·분기 치환은 없다.

| 에리어 / si / 보스 | 입력·raw hand / 충돌선언 후보 | 최종 tile0/1/2/3/4 | 굴수 / 분모 / NW,NE,SW,SE | timer RNG회 |
|---|---|---|---|---|
| 3-1 /10/얼음 망령 | basin /346 /102 | 25364/14329/3/3/301 | 7 /650 /100,300,0,250 | 7 |
| 3-2 /11/서리의 기사 | 기본 floor /18 /6 | 38986/36/3/0/975 | 13 /1050 /350,300,250,150 | 13 |
| 3-3 /12/얼어붙은 감시자 | 기본 floor /21 /7 | 38986/36/3/0/975 | 14 /1100 /250,300,350,200 | 14 |
| 3-4 /13/얼음 속 봉인 괴물 | 기본 floor /20 /8 | 38986/36/3/0/975 | 12 /950 /150,300,350,150 | 13 |

grid는 전부200×200/T40. tile byte SHA: si10=`1a585fa2fe597e1413c370d55bd1f300134f3428f8008eec2aaaf538c0d74cee`, si11~13=`5b40eb67c1aa3fd6ad407f9af06db91f549456bcd9c7d91ed31265c5a3a3b87e`다. 모든 gate metadata x99..101/y5·exit y7/center100,7이다. **si11~13 code3=0을 수정하지 않았다.** 동일 grid SHA라도 raw hand·굴 좌표/순서·분모·보스가 다르다. VM의 gate_guard는 전체 initStage를 실행하지 않아 undefined carrier(null + undefined_paths=/gate_guard)이며 실제 문지기 null/부재 판정을 실행한 값이 아니다. 충돌선언 후보는 raw meta의 col/collision과 raw 배치만 센 것이며, 최종 MAP_OBJS 수·콜리더 수가 아니다(colParts는 한 instance에서 여러 collider를 만든다).

si10의 남서 분모0은 원문 _regionInit에서 초기 cleared=true, 다른 분면 fbIdx=-1이다. x=100 경계는 동측 소속이다. 빈 분면에 새 굴/앵글러를 채우거나 모든 지역에 동일 분모를 배분하지 않는다. 독립 tile-only BFS는 START→exit 연결을 관측했으나 prop 충돌·플레이어 반경·실제 문 권위가 빠져 **실제 종주 PASS가 아니다**.

### 1.3 오브젝트·충돌·자원 경계

| 원본 행 | 반드시 보존할 게임플레이 계약 / 표현 분리 |
|---|---|
| G17487,17520–17758,18392–18426 | retired Set, 초기 meta77, CH_DECO[2]61개. si10은 CH1 등록의 cage_gate/sword_pile/hang_cage/obelisk/bone_arch도 사용한다. col이 없는 CH_DECO 덮어쓰기로 기존 col을 지우지 않는 in-place merge 의미가 중요 |
| G18427–18488 | Image 등록/메타 merge, srcRect/sourceSize/trimOffset/pivot/keepAR·scale·alpha 명시0·undefined/키 부재 구분. 이미지 로딩/후처리 _filterBaked/_edgeErased는 실제 callback 결과이고 raw 선언과 다름 |
| G25735–25825,25914–26081 | 시스템·자동/hand 선택→_nearFloor(H.x\|0,H.y\|0)→(tile+.5)*40. metadata 미존재·근처floor 미발견이면 skip. dense는 overlap skip 우회/noGrid. raw 좌표≠실효 위치. role/region 전달, scale은 si0 또는10~13에서만, rot은 원 modulo 정규화 |
| G26073–26075 | **CH3 hand scale·quarter-turn을 전달한다.** CH2에서 scale 미전달이었다는 설명을 CH3에 복사하면 틀린다. absent scale과 명시1, rot0과 키 부재도 구분 |
| G26430–26472 | 자동 눈·editor 복원·renderLayer/y 정렬. raw hand346을 final authored343(기존 docs 실측)으로 임의 잘라 snapshot에 저장하지 않는다. 이번 실효 배치/누락3의 실제 identity는 미확인 |
| G31682–31712 | identity/length 변경 시 collision prefilter. retired/noCol 제외. colParts는 object rotation으로 offset 회전 + part rotation, w/h/offset에 scale 적용. rotated rect는 strict <, ellipse/circle도 strict <. colOy는 ellipse에서 별도 적용, canMv는 4모서리. srcRect/그림자/광원을 collider로 만들지 않는다 |
| G31689–31709 | _CH1_HILL은 stage0 전용이라 CH3 높이/동선에 복사0. MAP-LOOK의 높이감과 실제 이동 지형 권위를 분리 |

CH3 wall kit는 I36/L2/END4/GATE2 raw instance, I/end는 part1·L/gate는 part2다. I scale1·기본rot0/90/180/270, L pivot(.27,.5), gate pivot(.5,.36)·squareDraw·분리된2part 사이 중앙 개방은 gameplay 검수 대상이다. 표현용 BACK/MID/FRONT/GROUND mass와 crop 모듈에 col이 없으면 벽을 추가하지 않는다. 원본 등록 전체값·raw 배치는 부록 A/B가 근거다.

원화 byte 읽기 대조에서 CH_DECO[2] **61참조/중복 제외35파일(47,650,724byte)**는 모두 main의 `godot/assets/map/ch3/` 대응 blob과 동일했다. si10에서 사용하는 CH1 cross 등록5개도 해당 source/godot byte 동일이며, 합하면66참조/40파일이다. `ground_hellwinter.png` 1파일도 동일(3,562,028byte/SHA589f7b60…9636a6). 부록 C에 경로·크기·SHA를 기록한다. 이것은 catalogue 범위의 byte 존재 검사다. gate/portal·generic system object 등을 포함한 최종 scene 전체 자원 closure·Image decoding·GPU 준비·시각 품질은 **미확인**이다. 에셋 생성·변환·복사 0.

### 1.4 스폰·지역·문·보스·클리어·에리어 전환

| ID / G 행 | CH3 실제 계약과 미확인 경계 |
|---|---|
| F01 /30975,30985–31022 | CH3 HELL_SPAWN30개 [etype,weight]는 부록 B. _RANGED_ET 25개를 사용: 50% ranged 가중선택, 나머지 최대12회 nonranged CDF→fallback2. CH1 start 제외/정확50:50 전용 분기 금지. rollEl은 EL.I .45 편향 후 [P,F,I,D,L,H] 균등 추가 |
| F02 /31029–31030,35636–35693 | S<=.3→50/M<=.5→100/L→100. si0 할인8/15 적용0. _gameFrame<120 차단→거리²<4,000,000이면 trigger·다음 loop 90ticks delay→interval trunc(900/total). alive>=700이면CD30. 후보120+random300+size150/30회 isW(skipBone=true), 실패 spiral<20→중심 fallback. mkEn 실패도 _spawned 증가, reviveIframes15, 진행곡선·완료굴 제거 보존 |
| F03 /31573–31655 | tileRLE이므로 room/corridorSpawn marker는 자연 적 배치로 실행되지 않는다. 문지기/호위·bonfire·분모 확정 후 regionInit. generation에서 timer만 관측한 VM과 실제 전투 RNG 소비를 분리 |
| F04 /60688–60732,60766–60793 | 180이상 grid는4분면. CH3 지역명은 방위, fbIdx=-1/앵글러 요구0. kill은 _homeX/_homeY 우선·ib 제외. 문지기 +.10은 gate 분면만. ratio>=.8−1e−9와 cleared latch, 빈 지역은 초기 조용히 clear. 15ticks throttle와 gate 표시 갱신 보존 |
| F05 /41868–41921 | CH3는 지역4/4면 bossUnlocked(si0의 _fbDone 추가 요구0). 지역 없는 소형맵만 전역80% fallback. exit tile 밟음+bossAlive+비arena+unlock에서 bossLoadPhase1. 지역 clear를 stageCleared로 대체하지 않는다 |
| F06 /30697–30814 | hell2→arena type2 **십자형**, 모든 si10~13 공통128×108. armW37/armH31, entry64/103·boss64/54·exit64/1(처치 전 벽). field 백업/남은 적 kill 합산·actor/holes/obj 정리→별도 arena. si13 필드와 보스 arena를 동일 map으로 만들지 않는다 |
| F07 /41782–41849 | loading50/130/50/100ticks 단계. 30frame 간격 boss/revive 대기 판정→bossAlive=false/clearTime 고정→chest·arena exit3폭 개방. 보스 공격/부활 권위는 별도 담당 |
| F08 /41917–41957,43896,63657–63664 | 보스 사망 뒤 exit에서 stageCleared→결과 UI→사용자 다음진행 showStageTransition→nextStage. si10→11→12→13→14(다음 장 startSi). si13이 전체 승리는 아니며 doWin은 stage>=35. clear에서 SP+10, 90%kill은타임어택기록조건이지clear gate가아님. _showClearResult/통계·저장은기존권위. 실제 UI·입력·save 소비 인수는 미확인 |
| F09 /30149–30215,41857–41867 | 공통 zone portal tile6/저장·복원 경로가 있으나 기본 CH3 selector는 _zones=null이다. 이번 4필드에 자동 zone portal이 존재한다고 간주하지 않는다. 저장 형식 변경 제안0 |
| F10 /31669,35877–35881,43872,43899 | stage/boss/death/victory BGM은 별도 sound owner 접점. SND-09의 Main/postStage 연결은 BLOCKED 보고 e0150fca 상태다. CH3 맵 순수 계약에 dummy audio READY를 추가하지 않는다 |

원문 genBossArena를 별도 실행한 grid: tile1/4/5=3121/10255/448, SHA `eb4fcbd7b527d2efb2ed36c7b80251d26fca10d7178dc0edbe031887e1da8033`. 네 stage 동일이다. 이것도 arena 생성 데이터이며 실제 보스/진입/클리어 인수는 아니다.

### 1.5 시각 원본 기록과 MAP-LOOK 접점

| 원본 / 현행 참고 | 기록 목적과 Godot 표현 접점 |
|---|---|
| G16682,26475–26529 | w#20262b/f#080b0e/ac#7a201b·EL.I는 현재 palette 근거. 공개명/어두운 전장 정체성과 물리/전환 계약을 구분. Godot 광원 수치로 그대로 강제하지 않는다 |
| G26531–26610 | hell2 ground_hellwinter macro2048·mirror soft-light .14·어두운 tone rgba(6,8,10,.49),저밀도 ash/frozen blood/dead ice 흔적. 시각 이력일 뿐 CH3 게임플레이 collider/빙판 관성 근거 아님 |
| G52295–52479,18454–18467 | si10 filter brightness(.46)/contrast(1.34)/saturate(.18), crop/alpha/edgeErase/blend 등의 웹 표현 기록. Godot에서 같은 필터/Canvas 합성을 완료 조건으로 강제하지 않는다. collider/footprint가 바뀌면 별도 게임플레이 차이로 검수 |
| G25619–25731,4358–4365,4653–4730,55215–55387 | torch/sway/glow 초기 return·기존 화면 효과 gate를 별도 확인해야 한다. 등록상 얼음/눈/안개 이름만으로 지속 빙결/트랩·동적광 완성을 추정하지 않는다 |
| MAP_LOOK 문서 §1–§6 | 부분 광원/요철 shader/접지 그림자/foreground 시차/생동감/전투광 개념을 재사용. 현재 DATA_FILE=map_look_ch1.json·PROP_DIR/CHUNK_DIR은 CH1 고정. CH3 전용 입력·owner 종료/재입장·sourceG/맵 불변 검수를 먼저 설계해야 한다 |

새 CH3 시각 제작은 MASTER/OUTER MASS부터 제작 GUIDE 순서를 지킨다. 어둠 속 플레이어·적·탄막·패링·loot 가독성, 동선/스폰/hit query 불변, 8카메라(START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT), 광원 ON/OFF 성능은 별도 인수한다. 이번에는 그림/에셋/shader/광원 생성·화면 촬영 0. “PoE2·No Rest 수준”은 사용자 목표이지 이미 달성한 품질 판정이 아니다.

## 2. docs 불일치·상태 차이 표

설계 SSOT를 이번에 수정하지 않고 관측 차이를 전달한다. 예전 문서의 PASS/실측은 이력이며 새 Godot 결과로 재집계하지 않는다.

| docs 위치 | 기록 / 목표 | 현재 원본 또는 확인 상태 | 후속 처리 |
|---|---|---|---|
| EXODUSER_MAP_BIBLE_v3 (1).md:149–169 |4에리어; si10 200²·open field, si11/12/13 300/350/300²·horiz/vert/grid |4개수·si10 크기는 일치. 기본 selector는 전부200², si10 basin·나머지 기본 floor. STG는 정식 generic 1~4구역, 상세 에리어명은 docs 이름 |차이를 표기하고 옛 크기/맵 타입으로 source snapshot을 창작하지 않는다 |
| 같은문서:156,171–176 |얼음 동굴/미끄러운 바닥, 관성·파괴벽/비밀통로·접근 각성·고드름·냉기 안개 축적 |CH3 hand/메타/기본 selector에서 이들 환경 mechanic의 실제 writer 연결은 확인하지 못했다. 다른 스킬/적의 _freezeSlow를 환경 구현으로 읽지 않는다 |**미확인**. 이동/환경/적 담당 권위 추적 전 신규 mechanic 추가 금지 |
| 같은문서:190–200 |보스 팔각형·Phase2 얼음 바닥/분신 |hell2 genBossArena는 십자형128×108, 네 에리어 모두 동일. 보스 공격 전체 검수는 이 작업 밖 |원본 grid 근거 우선 기록. 보스 패턴과 환경 목표는 별도 추적/배정 |
| CH3_1_HELL_WINTER_IMPLEMENTATION.md:30–45,64,130,300 |open-air hell/author346/runtime343/과거 VISUAL FINAL PASS |raw346은 이번 VM에서 일치. runtime343·누락3 identity·실효 collider는 이번 미관측. 문서 상단 2026-10-14 metadata 이력은 원리소스 권위 범위 |원문 기록과 현재 Godot 실제 게임/시각 READY 분리. 346을343으로 잘라 데이터 수정 금지 |
| 같은문서:27·과거 CH153차 문구 / _MAP_SSOT_INDEX:278 |CH1 경과와 CH3 LOCK/과거 시각 인수 혼재 |CH1 source 청크·언덕 수치와 CH3 gameplay를 혼합할 수 없다. CH3 style LOCK은 현재 사용자 MAP-LOOK 방향과 함께 읽음 |웹 픽셀 복제를 새 계약으로 강제하지 않는다. style 변경 필요 항목은 담당 LOCK 검토 |
| REGION_CLEAR_GATE_20260930.md:3–32 |큰 필드4지역/각80%·문지기10% |공통계약 일치. CH3 fbIdx=-1, si10 SW분모0 초기clear. si11~13 문지기 후보tile4로원문spawn조건거절 입력 |4지역을4에리어로 혼동하거나 새 분모/항상 문지기를 보장하지 않는다. 실제 종주는 미확인 |
| 1전체그래픽세팅_MASTER.md:133–140 |지옥의 겨울 w#20262b/f#080b0e/ac#7a201b |G16682 palette와 일치한다. frozen asset 경로/번역의 구 얼음굴 이름은 별도로 남아 있음 |일치도 명시한다. 경로 호환용 식별자를 자동 rename하지 않는다. 최신 사용자 목표와 source 계약 분리 |
| MAP_LOOK_GODOT_PASS1_20261020.md:80,94 |1차 RETOUCH, 2장 이후 데이터 잔여·현재1-1전용 |CH3 profile·광원/성능/전투 시각 인수 **미확인**. CH1의37광원/27전경/region색을 CH3 수치로 이식0 |표현 담당의 CH3 구성·owner 전환/정리와 별도 비교 증거 필요 |
| CH2 trace §0/§3 |CH1-04 원격 미게시 당시 상태 |이번5487245c 실제 독립 World/보고서 존재, runtime은fixture범위 |선행 상태만 갱신해 재사용. CH2/CH3 자연 전투 완료로 확대0 |

## 3. Godot 의존·빠진 것

| 실제 파일 / 최신 main 또는 고정 후보 | 재사용 가능한 것 / 빠진 소비자 |
|---|---|
| main godot/tools/export_world.mjs:1–15 / engine/fdg/map-source-adapter.js:140–173 |CH1_1_PRODUCTION/stage0 제품 export 경로. 기본 R/제품 출력이 있어 이번 실행0. CH3 snapshot을 넣어 제품map.json을 자동 교체하면 안 된다 |
| CH2-01 export_ch1_area_source.mjs:30,85–111,후반 CLI |기존 단일 AST 추출기·stage0/1/4·출처/undefined·보호 출력 재사용. stage10 지원·장3 schema·basin/CH3+cross 등록·ground refs·CLI guard는 미구현. 소유자 인수 없이 다른 추출기 복제0 |
| CH1-04 export_ch1_area_resources.mjs / native_ch1_area_resources/world.gd |실효 initMapObjects·엄격 collision·독립 자원/World 수명 구조 재사용 후보. 현재si1 전용·fixture actor이며 CH3 colParts/quarter-turn/바뀐표현/30종 적·전환을 구현했다고 주장할 수 없음 |
| main world.gd:22,905–971,1072,1109,3127–3242 |res://data/map.json·stage0/64청크 계약, tile/prop query 존재. CH3 source raw image/meta도 registry에 있지만 stage10 선택·설치·종료/다음맵 수명은 별도. current object metadata publication과 실제 CH3 배치/렌더·field READY를 구분 |
| main world.gd:478–480, CH3 image registry·assets/map/ch3/ |CH3 원화35·cross5·ground1 byte 존재를 확인. “CH3 자산 없음”이 아님. CSS filter native gap/메타 post-load 상태·전체 closure·crop/pivot·실효 collider/시각 검수는 별도 |
| main native_spawn_hole_system.gd:37,214,333,435,518 이후 |STAGE=0·기존 소환/분모/실factory 한정 owner. CH3의650/1050/1100/950·rollEtype30종/실제현재G·사망귀속 연결은 별도 인수 필요. 상수0만10으로 바꿔 CH3 완료 처리 금지 |
| main native_regions.gd:59–106,143–159,243–261 |공통 분모·4분면/장 제목·kill/clear 계약 재사용. actual stage10+world+최종holes와 동일권위 연결·문·전환을 새로 검수해야 한다. source-only VM에서 가능했다는 이유로 current Main에 이미 연결됐다고 주장0 |
| main main.gd:123–130,175–181,265–280 / State:175,453 |현재 world/Player·stageentry·굴→지역 설치 순서 존재. 신규 진행/owner 교체·재입장·refill·기존 startup/save 보호·다음 stage authority는 총괄 통합 과제 |
| main native_map_look.gd:13–21,63–114 / native_screen_lighting.gd |CH1전용 profile·고정props/chunk·실제CanvasModulate/PointLight2D/shader. CH3 프로파일/독립 소비자·종료시원복·광원cache수명·battle 가독성·성능 인수 빠짐 |
| SND-09 / bosses·enemies 담당 |Main/postStage BGM 연결 BLOCKED(e0150fca), CH3 적·보스 전체 factory와 natural clear 미확인. dummy callback/가짜 kill·항상READY/중복State로 메우지 않는다 |

### 3.1 이번 실제 검산·원로그

L/source-audit.mjs는 Git 밖 관측 스크립트다. 제품 exporter/원본은 수정하지 않았다. 최종 source-audit-final/replay는 각각 exit0/stderr0, 전체 4개 JSON 깊은 비교·타일 길이/SHA·굴합·독립 분면합·catalog 고유성·tile-only 연결·arena 크기·미연결 scope·대응 원화 byte 검산 **48항목/차이0**이다. 검산 항목 전부는 audit-checks.json에 있고, **게임 테스트 PASS 수치가 아니다**. 원문 source-index·area-summary·si10~13.json·replay/·source-occurrences·Git/docs검색·고정 참조 코드/보고서를 남겼다.

관측 도구 초안은1회 Array AST를 Object.properties로 읽어 실패했고, 자산 범위 확대 편집 중1회 문자열 구문 오류가 있었다. 둘 다 원본 변경 없이 Git 밖 harness만 교정했다. 초기 실패 source-audit.stderr.log/source-audit-03.stderr.log를 보존하며 최종 성공으로 덮지 않았다. source-audit-02/-04는 중간 성공이며 수치 중복 집계0이다.

이번 제품/테스트 코드변경0·Godot0·브라우저0·PCM/청감0·캡처0·성능0·실제전투/전환0. Godot 실행 전 pgrep 대기는 실행 자체가 없어서 진입0이고 override 작성0이다. 관련 Node 회귀 전체도 실행하지 않았다. 선행 보고서의 PASS/맵9실패·로비8실패는 이번 결과로 재판정/재집계하지 않는다.

## 4. 에리어 단위 이식 순서안

이번 구현은 없다. CH1/CH2와 같은 **원문 snapshot→순수 계약→실효 gameplay data/독립 소비자→Godot 표현→자연 진행** 순서를 재사용한다. source 계약은 원문 보존 검수이고 표현 단계는 MAP-LOOK 제작/가독성 검수다. 웹 화면을 그대로 옮기는 단계로 바꾸지 않는다. 후속에서 공용/타 담당 변경이 필요하면 권위 인수·통합을 먼저 확정한다.

### 4.1 1번 CH3-01 — si10 읽기 전용 원본 snapshot·순수 계약 (구현 지시서)

| 항목 | 후속 구현 지시 |
|---|---|
| 목표 / 비목표 |si10 gameplay source snapshot과 순수검증만. 실제 Main/World/전투·시각 READY 없음. 원화 byte 참조만, 신규 미디어/변환/복사0 |
| 선행 / 기준 |fetch 최신main의 game SHA/행 재확인. 현재 도구 의존은 CH2-01 4013102a(기존0/1/4 보존), CH1-03 aada9b28 기반. main 미병합이면 인수된 끝에서 분기·의존 명시. shared exporter 소유자 CH1/CH2의 stage10 확장 인수가 안 되면 **BLOCKED**, 별도 중복 추출기 신설0 |
| 수정 / 신규 파일 후보 |인수된 godot/tools/export_ch1_area_source.mjs의stage10 분기만; 신규 godot/data/ch3_map_source/si10.json, godot/port_modules/ch3_map_source/stage10_contract.gd, test/fdgCh3Stage10Source.test.mjs, godot/tests/test_ch3_01_stage10_source.gd. 파일/API는 신규 제안. 기존map.json/PNG/State/공용/다른stage JSON0줄 |
| 추출 원문 |G16631–16713,17813–17950,18203,CH_DECO2=17693–17758/공통cross 등록17520–17637/초기meta77. M6–55. _getFixedMapForStage/_cloneField11/_buildBasinRLE/genFromTemplate/_applyHellWinterNorthGate/정확START/_regionInit 및 closure를 기존 동일 추출 방식으로 재사용. 값·분기·연산/loop 치환0 |
| 도구 확장 위치 |CH2-01 exporter의 지원stage gate(30), 선언 선택85–93, generated 데이터103–111, 장별path/asset/source schema·CLI 출력 guard 구역. stage10에서만_HELLWINTER10/compose10/CH3+사용cross meta와basin 선택. 기존CH1/CH2 환경자료를 CH3 완료근거로붙이지 않음 |
| CLI 제안 |node godot/tools/export_ch1_area_source.mjs <explicit-source-root> <explicit-output-json> --stage 10 --seed 20261020. root 안은 godot/data/ch3_map_source/si10.json만. sourceRoot 기본R 없음. 제품map·다른stage/장·기존타schema·symlink/이상seed/지원외stage는 쓰기 전 거절. 기존0/1/4 guard 보존 |
| snapshot |schema exoduser.ch3-area-source.v1/stage10. source main_sha/extraction_head/fileSHA/symbol line,end,SHA/selection·grid200²/T40·tile40000/SHA1a585f…·counts25364/14329/3/3/301·rooms6·START100,185→4020,7420·gate99..101/5 code3=3·exits/y7·basin 원값/초기RLE·rawhand346·CH3deco61/cross5/initial77·굴7/650/지역100,300,0,250·SW초기clear·generationseed/draw7·undefined_paths |
| 자원/메타 |장3catalog61참조/35파일, si10cross5/5파일·ground1파일의 경로·바이트/SHA 참조. colParts/srcRect/pivot·absent/undefined/null/명시0 원값 보존. 이미지 로드/후처리·실효 col 확정은 하지 않음. 완전한 scene dependency closure로 범위 확대0 |
| scope |runtime_bound=false/visual_verified=false/init_map_objects_executed=false/save_access0/full_stage_ready=false. final_MAP_OBJS/effective_prop_positions/prop_colliders=NOT_OBSERVED. raw346/충돌선언후보102를 final343/실효collider로 바꾸지 않음 |
| 순수 API 제안 |read_area(raw:Variant)/validate_area(raw:Variant). READY value=원snapshot 동일참조·scope=source_snapshot_only, NOT_READY reason/raw동일참조·최상위value없음. 입력 보정/깊은복제State·파일IO/RNG/clock/노드/저장0. 선언SHA 검증과 실제bytes 검증(Node)의 책임 구분 |
| Node 검증 |독립 최신원문 AST/IIFE +전체재추출 비교. 전체grid/SHA/START/basin/초기RLE·원문346배치 전필드/순서·61등록/cross5·소환굴7좌표/수량/분면·SW0clear·gate code3/metadata·타이머seed. 같은seed 전체일치·손상데이터 거절·CLI쓰기전거절. 기존0/1/4 재추출 깊은비교로 회귀검사 |
| Godot 순수 검증(후속만) |실제snapshot/해시/순서·동일참조·반복/입력불변. null/wrongstage/누락출처·tiles39999/좌표·raw순서·colParts·분모/분면손상·runtime완료주장은 NOT_READY. Main/World생성0. test_contracts 및 기존 CH1/CH2 순수검사는 각상수격리 사용 |
| 격리 / 실행 |새 격리 EXODUSER-ch3-01-Isolated-20261020. 후속 Godot전 지정 pgrep/wc>=2이면30초씩대기·실행마다override/finally비움. 이번 문서에서는 Godot실행0. 원로그·원격SHA대조·DONE·WT정리는 작업별지시 준수 |
| 완료 경계 |source-only 제출·정상 훅·자기branch push·remote검증. 기술자동검사≠시각PASS. 실제맵/30종 적/문/보스/다음장·MAP-LOOK은 다음단위. 최신gameSHA가다르면 원문 재관측하며 예전기대값을맞추려고 원본변경0 |

### 4.2 2번 CH3-02 — si10 실효 게임플레이 배치·독립 소비자

CH3-01와 CH1-04 자원/World 계약을 먼저 인수한다. 신규 `native_ch3_area_resources.gd`, `native_ch3_area_world.gd`, `ch3_area_preview.tscn` 및 전용검사 후보에서 명시snapshot을 읽고 공용 Main/world/hud/player는1차0줄이다. 정확 _nearFloor/메타merge·scale/rot/colParts를 원문에서 관측하여 raw346→실효 placement/콜리더를 확정한다. START→전투 공간→side pocket→gate/exit의 tile+prop+반경 경계와 회전rect·ellipse·colOy·part seam을 검사한다. 최종 수를 기존343에 맞춰 잘라내지 않는다. 실제 actor/spawn/region owner 미인수면 fixture preview 범위로만 반환한다.

시각은 gameplay data와 분리해 MAP-LOOK담당의 CH3 MASTER/OUTER MASS→GROUND 구성에 연결한다. 원본 웹 필터·bake·grid renderer 재작성 자체를 의무로 삼지 않는다. 기존 원화는 byte 참조, 새 제작/가공은 별도 지시 범위다. 독립 preview와 실제 플레이어 전투·자연 전환/시각PASS는 별도 인수한다.

### 4.3 3번 CH3-03 — si11 / 3-2 source→독립 소비 (분리 배정)

같은 exporter의 stage11 지원·`ch3_map_source/si11.json`/`stage11_contract.gd`와 순수검사를 먼저 추가한다. 원문 ready=false dungeon gate/defaultfloor·raw18·굴13/1050·NW350/NE300/SW250/SE150·서리의 기사·code3=0/문지기후보tile4를 검증한다. 실제 후속소비에서 기존 독립World/쿼리 계약을 재사용한다. “300²횡방향/빙판관성·절벽낙하”를 현행source로 창작하지 않는다. 해당 gameplay 목표는 별도 결정·권위 추적이 필요하다. 시각의 협곡 높이감/부분 냉광·안개는 gameplay통과후 MAP-LOOK 별도 제작/QA다.

### 4.4 4번 CH3-04 — si12 / 3-3 source→독립 소비 (분리 배정)

stage12 snapshot/계약·전용검사: raw21·기본floor·굴14/1100·지역250,300,350,200·얼어붙은 감시자. si11과 같은tileSHA라도 전데이터를 복사하지 않는다. 후속소비에서 충돌 선언7·실효배치·corpse/장벽/랜드마크·지역권위를 검수한다. “350²수직감옥/접근각성”은 실제writer 확인 전미확인. 표현은 별도 MAP-LOOK 구성으로 시체/빙벽의 높이감·전투가독성 인수한다.

### 4.5 5번 CH3-05 — si13 / 3-4 source→독립 소비 (분리 배정)

stage13 snapshot/계약: raw20·굴12/950·지역150,300,350,150·isHellBoss=true/얼음 속 봉인 괴물. 봉인괴수 시각 prop와 실제 보스actor의 권위를 구분한다. 필드200²와별도십자arena128×108 입력·처치전exit벽·처치후3폭개방을검증한다. “300²grid/팔각형”을현행계약으로대체0. 후속소비는 actual보스factory와소유자 인수 전fixture/runtime미연결표시를유지한다.

### 4.6 6번 CH3-06 — 실제 스폰·지역·문·arena·다음장 통합 (권위 인수 전 HOLD)

네 source/독립소비와적·보스 factory·Main/State/World 통합·HUD·BGM 담당 인수가 선행이다. 새 source진행flow가실제 G/P/holes/kill/지역을읽고,굴→지역→4/4문→exit→arena→보스/revive→exit→결과→다음stage순서를소유해야한다. 기존P3 owner를복제하거나stage0상수교체로대신하지않는다. si13→14,전환취소/사망/재시작/재입장/종료cache정리·동일spawn분모·Player자원·save보호를검증한다. 공용변경·상태권위가확정되지않으면 **BLOCKED**로 필요위치만보고한다. 시각은 MAP-LOOK별도프로파일·8카메라/전투광가독성/ON-OFF성능인수까지별도상태로남긴다.

## 5. 공용·다른 담당 파일 접점 (이번 모두 0줄)

아래는 최신 main의 읽은 위치와 후보 범위이며 구현 패치나 확정 추가행 수가 아니다. 첫 CH3-01 순수 계약은 shared exporter 인수 외 기존 제품0줄로 설계한다. 공용 변경은 별도 총괄 결정·소유자 인수 없이는 진행하지 않는다.

| 파일·현재 위치 | 후속 필요 / 예상 최소 범위·근거 |
|---|---|
| godot/tools/export_ch1_area_source.mjs(원격CH2-01):30,85–111,장별 schema/CLI |단일파이프라인 stage10확장·현재0/1/4보존. 정확행수미확인. CH1/CH2도구소유자인수필수,불가하면BLOCKED |
| godot/scripts/main.gd:123–130,175–181,265–280 |world/START/현재State·굴→지역설치·재진입flow·종료. 설치약4–8줄/전환callback약4–8줄후보이나실API/최종행수**미확인**. stage0새게임skill 지급을일반nextstage에반복하지않음 |
| godot/scripts/world.gd:22,954–971,1072,1109,3127–3242 |현재고정stage0/map.json·64chunks제약과 실제collision권위. 1차독립CH3consumer로우회설계,제품world변경0. natural stage입력/수명인수시필요범위/행수**미확인** |
| godot/scripts/native_spawn_hole_system.gd:37,214,333,435,518 이후 |실제stage/30종factory/굴수명·RNG·분모연결. stage0고정상수만고치지않는다. 담당P3와인수범위/행수**미확인**,순수단위0줄 |
| godot/scripts/native_regions.gd:59–106,143–159,243–261 |기존 actual currentG/world/최종holes/kill/문을같은owner로연결. 원래초기화/분모재계산시점보존. 1차0줄;binding약2–6줄후보,정확API/행수미확인 |
| godot/scripts/hud.gd:58–65,88–90,952–999 |맵교체시미니맵cache무효화·지역/문/보스/에리어갱신. callback2–4+mapbinding2–4줄후보,UI소유자인수전미확인 |
| godot/scripts/player.gd:127–131 |기존 set_world/get_combat_world·START전달,우선0줄. 필요시참조교체1–2줄후보,이동/자원/Q/E공식재작성금지 |
| godot/scripts/native_source_new_run_state.gd:175,453 |기존currentG/P·stageentry/refill/readiness위임. 1차0줄,전이위임약2–6줄후보·실API미확인. 저장schema필드추가0 |
| godot/scripts/native_map_look.gd:13–21,63–114 / native_screen_lighting.gd |CH3profile·독립world입력·광원/재질/안개·정리/원복범위는MAP-LOOK담당확정필요. 실제줄수**미확인**. CH1profile색/광원좌표복제0·충돌/스폰/지역쓰기0 |
| 보스·적 factory / SND-09 Main/postStage |actualCH3적/보스alive·kill·refill/사운드호출과명확한ownership필요. 위치/줄수미확인. 공격패턴·저장·사운드HOLD를맵팀dummy로채우지않음 |

## 6. 미확인·제출 검수 경계

- 전수 추적 완료 대상은 4에리어의 selector/생성입력/hand·카탈로그·굴·지역·충돌·전환/클리어 접점과 이식 설계다. 실게임 종주/실효배치/실제전투·보스·청감·GPU품질/성능/PC-Mac 인수는 **미확인**이다.
- 문서/CHANGELOG 두 파일만 stage, staged whitespace·정상 docs-sync/pre-commit 훅·기존파일 byte·R HEAD/branch/tracked INDEX/WORK 보존을 검사한다. main push/force push/rebase/git add -A/훅우회0.
- 자기branch 비강제push·원격SHA대조→Git밖 L/DONE.txt에branch/SHA/수치기록→자기sparseWT제거. 원로그/이문서사본/branch유지. 실제제출SHA·정리·R최종은submission.json/DONE.txt가근거다.

### MAP PRODUCTION REPORT — 제작 GUIDE §23 / 추적 문서 단위

| 항목 | 이번 관측·한계 |
|---|---|
| STAGE / MASTER |CH3 si10~13 원본gameplay추적·이식설계. 새레벨/route재디자인0 |
| OUTER MASS / LARGE / MEDIUM |원문basin·wallkit/colParts와표현mass구분,CH3catalog61/cross5 byte참조. 새composite·asset제작0,접합품질미관측 |
| GROUND |원문RLE/최종tile/height권위와Godot시각요철분리. 광원·shader·바닥생성0 |
| PLAYABLE / LANDMARK |START/gate/굴/분면·POI/rawhand전수. tile연결검산≠반경/prop포함종주. actualcombat·interaction미확인 |
| CAMERA QA |START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 미촬영·미관측 |
| TECH QA |원문발췌VM/반복 exit0·stderr0·48검산차이0,Godot/브라우저/실게임검사0. 자동검산은시각PASS아님 |
| FILES / GIT |추적md1+CHANGELOG절만. source/product/test/shared/otherowner0줄·에셋생성/변환/복사0. 원격SHA확인후DONE/WT정리 |
| VISUAL VERDICT |**NOT_OBSERVED / 미확인** — 이번 시각승인없음. 과거웹VISUAL FINAL PASS·CH1 MAP-LOOK RETOUCH는별도이력 |
| NEXT PASS |CH3-01 지시서만후속배정가능. 공용/도구소유권미인수시BLOCKED. CH3 표현은MAP-LOOK담당별도인수 |

## 부록 A. raw 명시 배치 전수표

아래는 원문 IIFE/helper의 **평가 순서 그대로**다. 좌표는 입력 tile이고 _nearFloor 후 실효world가 아니다. JSON에 없는 scale/rot/role 키는 원래 부재이며 null/0/1로 임의 보충하지 않았다. si10은 G17816–17950, si11 G17952–17956, si12 G17958–17962, si13 G17964–17968; helper G17813–17814가 근거다. 충돌선언은 부록 B와 초기meta를 함께 읽는다. 시각배치 전체를Godot복제로강제하는표가아니며실효collision/동선관련입력의출처다.

### A.1 si10 — 346개

| 순서 | raw 원문 평가값 |
|---|---|
| 0 | `{"id":"m_c3hellritual","x":100,"y":100,"scale":4.7}` |
| 1 | `{"id":"m_c3wall_i","x":88,"y":28,"rot":0}` |
| 2 | `{"id":"m_c3wall_i","x":80,"y":36,"rot":0}` |
| 3 | `{"id":"m_c3wall_i","x":72,"y":44,"rot":0}` |
| 4 | `{"id":"m_c3wall_i","x":64,"y":52,"rot":0}` |
| 5 | `{"id":"m_c3wall_i","x":56,"y":60,"rot":0}` |
| 6 | `{"id":"m_c3wall_i","x":48,"y":68,"rot":0}` |
| 7 | `{"id":"m_c3wall_i","x":40,"y":76,"rot":0}` |
| 8 | `{"id":"m_c3wall_i","x":32,"y":84,"rot":0}` |
| 9 | `{"id":"m_c3wall_i","x":24,"y":92,"rot":0}` |
| 10 | `{"id":"m_c3wall_i","x":112,"y":28,"rot":90}` |
| 11 | `{"id":"m_c3wall_i","x":120,"y":36,"rot":90}` |
| 12 | `{"id":"m_c3wall_i","x":128,"y":44,"rot":90}` |
| 13 | `{"id":"m_c3wall_i","x":136,"y":52,"rot":90}` |
| 14 | `{"id":"m_c3wall_i","x":144,"y":60,"rot":90}` |
| 15 | `{"id":"m_c3wall_i","x":152,"y":68,"rot":90}` |
| 16 | `{"id":"m_c3wall_i","x":160,"y":76,"rot":90}` |
| 17 | `{"id":"m_c3wall_i","x":168,"y":84,"rot":90}` |
| 18 | `{"id":"m_c3wall_i","x":176,"y":92,"rot":90}` |
| 19 | `{"id":"m_c3wall_i","x":176,"y":108,"rot":180}` |
| 20 | `{"id":"m_c3wall_i","x":168,"y":116,"rot":180}` |
| 21 | `{"id":"m_c3wall_i","x":160,"y":124,"rot":180}` |
| 22 | `{"id":"m_c3wall_i","x":152,"y":132,"rot":180}` |
| 23 | `{"id":"m_c3wall_i","x":144,"y":140,"rot":180}` |
| 24 | `{"id":"m_c3wall_i","x":136,"y":148,"rot":180}` |
| 25 | `{"id":"m_c3wall_i","x":128,"y":156,"rot":180}` |
| 26 | `{"id":"m_c3wall_i","x":120,"y":164,"rot":180}` |
| 27 | `{"id":"m_c3wall_i","x":112,"y":172,"rot":180}` |
| 28 | `{"id":"m_c3wall_i","x":24,"y":108,"rot":270}` |
| 29 | `{"id":"m_c3wall_i","x":32,"y":116,"rot":270}` |
| 30 | `{"id":"m_c3wall_i","x":40,"y":124,"rot":270}` |
| 31 | `{"id":"m_c3wall_i","x":48,"y":132,"rot":270}` |
| 32 | `{"id":"m_c3wall_i","x":56,"y":140,"rot":270}` |
| 33 | `{"id":"m_c3wall_i","x":64,"y":148,"rot":270}` |
| 34 | `{"id":"m_c3wall_i","x":72,"y":156,"rot":270}` |
| 35 | `{"id":"m_c3wall_i","x":80,"y":164,"rot":270}` |
| 36 | `{"id":"m_c3wall_i","x":88,"y":172,"rot":270}` |
| 37 | `{"id":"m_c3wall_l","x":16,"y":100,"rot":0}` |
| 38 | `{"id":"m_c3wall_l","x":184,"y":100,"rot":180}` |
| 39 | `{"id":"m_obelisk","x":150,"y":125,"scale":0.58}` |
| 40 | `{"id":"m_obelisk","x":132,"y":150,"scale":0.58}` |
| 41 | `{"id":"m_obelisk","x":68,"y":150,"scale":0.58}` |
| 42 | `{"id":"m_obelisk","x":50,"y":125,"scale":0.58}` |
| 43 | `{"id":"m_obelisk","x":50,"y":75,"scale":0.58}` |
| 44 | `{"id":"m_obelisk","x":68,"y":50,"scale":0.58}` |
| 45 | `{"id":"m_obelisk","x":132,"y":50,"scale":0.58}` |
| 46 | `{"id":"m_obelisk","x":150,"y":75,"scale":0.58}` |
| 47 | `{"id":"m_c3wall_gate","x":100,"y":21,"rot":0}` |
| 48 | `{"id":"m_c3wall_gate","x":100,"y":179,"rot":180}` |
| 49 | `{"id":"m_c3hellback_mass","x":100,"y":12,"scale":0.92}` |
| 50 | `{"id":"m_c3hellback_mass","x":129,"y":16,"scale":1.02}` |
| 51 | `{"id":"m_c3hellback_mass","x":155,"y":28,"scale":0.9}` |
| 52 | `{"id":"m_c3hellback_mass","x":176,"y":48,"scale":1.07}` |
| 53 | `{"id":"m_c3hellback_mass","x":187,"y":75,"scale":0.95}` |
| 54 | `{"id":"m_c3hellback_mass","x":188,"y":105,"scale":1.02}` |
| 55 | `{"id":"m_c3hellback_mass","x":181,"y":132,"scale":0.9}` |
| 56 | `{"id":"m_c3hellback_mass","x":164,"y":157,"scale":1.06}` |
| 57 | `{"id":"m_c3hellback_mass","x":139,"y":176,"scale":0.94}` |
| 58 | `{"id":"m_c3hellback_mass","x":110,"y":187,"scale":1.03}` |
| 59 | `{"id":"m_c3hellback_mass","x":80,"y":184,"scale":0.91}` |
| 60 | `{"id":"m_c3hellback_mass","x":52,"y":171,"scale":1.08}` |
| 61 | `{"id":"m_c3hellback_mass","x":30,"y":151,"scale":0.96}` |
| 62 | `{"id":"m_c3hellback_mass","x":16,"y":126,"scale":1.04}` |
| 63 | `{"id":"m_c3hellback_mass","x":12,"y":96,"scale":0.93}` |
| 64 | `{"id":"m_c3hellback_mass","x":18,"y":67,"scale":1.07}` |
| 65 | `{"id":"m_c3hellback_mass","x":35,"y":42,"scale":0.95}` |
| 66 | `{"id":"m_c3hellback_mass","x":61,"y":23,"scale":1.02}` |
| 67 | `{"id":"m_c3hellrampart_shell","x":100,"y":15,"scale":1.14}` |
| 68 | `{"id":"m_c3hellrampart_mid_a","x":128,"y":18,"scale":1.05}` |
| 69 | `{"id":"m_c3hellrampart_shell","x":153,"y":28,"scale":1.22}` |
| 70 | `{"id":"m_c3hellrampart_mid_b","x":171,"y":46,"scale":1.1}` |
| 71 | `{"id":"m_c3hellrampart_mid_a","x":184,"y":66,"scale":1.18}` |
| 72 | `{"id":"m_c3hellrampart_shell","x":188,"y":90,"scale":1.08}` |
| 73 | `{"id":"m_c3hellrampart_mid_b","x":187,"y":116,"scale":1.25}` |
| 74 | `{"id":"m_c3hellrampart_shell","x":178,"y":139,"scale":1.12}` |
| 75 | `{"id":"m_c3hellrampart_mid_a","x":164,"y":160,"scale":1.2}` |
| 76 | `{"id":"m_c3hellrampart_mid_b","x":141,"y":177,"scale":1.06}` |
| 77 | `{"id":"m_c3hellrampart_shell","x":114,"y":186,"scale":1.17}` |
| 78 | `{"id":"m_c3hellrampart_mid_a","x":86,"y":186,"scale":1.23}` |
| 79 | `{"id":"m_c3hellrampart_shell","x":59,"y":177,"scale":1.08}` |
| 80 | `{"id":"m_c3hellrampart_mid_b","x":36,"y":160,"scale":1.21}` |
| 81 | `{"id":"m_c3hellrampart_mid_a","x":22,"y":139,"scale":1.11}` |
| 82 | `{"id":"m_c3hellrampart_shell","x":13,"y":115,"scale":1.24}` |
| 83 | `{"id":"m_c3hellrampart_mid_b","x":12,"y":88,"scale":1.05}` |
| 84 | `{"id":"m_c3hellrampart_shell","x":18,"y":63,"scale":1.19}` |
| 85 | `{"id":"m_c3hellrampart_mid_a","x":35,"y":38,"scale":1.13}` |
| 86 | `{"id":"m_c3hellrampart_mid_b","x":60,"y":23,"scale":1.26}` |
| 87 | `{"id":"m_c3hellrampart_mid_a","x":80,"y":14,"scale":1.16}` |
| 88 | `{"id":"m_c3hellground_shadow","x":100,"y":19,"scale":1.55}` |
| 89 | `{"id":"m_c3hellground_shadow","x":130,"y":23,"scale":1.38}` |
| 90 | `{"id":"m_c3hellground_shadow","x":158,"y":36,"scale":1.62}` |
| 91 | `{"id":"m_c3hellground_shadow","x":178,"y":63,"scale":1.44}` |
| 92 | `{"id":"m_c3hellground_shadow","x":181,"y":96,"scale":1.58}` |
| 93 | `{"id":"m_c3hellground_shadow","x":174,"y":128,"scale":1.36}` |
| 94 | `{"id":"m_c3hellground_shadow","x":155,"y":155,"scale":1.64}` |
| 95 | `{"id":"m_c3hellground_shadow","x":128,"y":176,"scale":1.42}` |
| 96 | `{"id":"m_c3hellground_shadow","x":96,"y":181,"scale":1.6}` |
| 97 | `{"id":"m_c3hellground_shadow","x":64,"y":171,"scale":1.4}` |
| 98 | `{"id":"m_c3hellground_shadow","x":38,"y":151,"scale":1.66}` |
| 99 | `{"id":"m_c3hellground_shadow","x":21,"y":124,"scale":1.46}` |
| 100 | `{"id":"m_c3hellground_shadow","x":19,"y":91,"scale":1.56}` |
| 101 | `{"id":"m_c3hellground_shadow","x":27,"y":59,"scale":1.38}` |
| 102 | `{"id":"m_c3hellground_shadow","x":49,"y":35,"scale":1.63}` |
| 103 | `{"id":"m_c3hellground_shadow","x":76,"y":22,"scale":1.43}` |
| 104 | `{"id":"m_c3hellrubble_front_a","x":100,"y":24,"scale":1.14}` |
| 105 | `{"id":"m_c3hellrubble_front_b","x":139,"y":31,"scale":1.06}` |
| 106 | `{"id":"m_c3hellrubble_front_a","x":168,"y":52,"scale":1.2}` |
| 107 | `{"id":"m_c3hellrubble_front_b","x":177,"y":86,"scale":1.1}` |
| 108 | `{"id":"m_c3hellrubble_front_a","x":174,"y":121,"scale":1.18}` |
| 109 | `{"id":"m_c3hellrubble_front_b","x":155,"y":151,"scale":1.04}` |
| 110 | `{"id":"m_c3hellrubble_front_a","x":126,"y":174,"scale":1.22}` |
| 111 | `{"id":"m_c3hellrubble_front_b","x":88,"y":177,"scale":1.08}` |
| 112 | `{"id":"m_c3hellrubble_front_a","x":55,"y":163,"scale":1.16}` |
| 113 | `{"id":"m_c3hellrubble_front_b","x":30,"y":139,"scale":1.02}` |
| 114 | `{"id":"m_c3hellrubble_front_a","x":23,"y":103,"scale":1.2}` |
| 115 | `{"id":"m_c3hellrubble_front_b","x":27,"y":68,"scale":1.06}` |
| 116 | `{"id":"m_c3hellrubble_front_a","x":52,"y":39,"scale":1.18}` |
| 117 | `{"id":"m_c3hellrubble_front_b","x":76,"y":26,"scale":1.04}` |
| 118 | `{"id":"m_c3helltower_shell","x":178,"y":85,"scale":1.12}` |
| 119 | `{"id":"m_c3helltower_shell","x":167,"y":58,"scale":1.06}` |
| 120 | `{"id":"m_c3helltower_shell","x":144,"y":30,"scale":1.15}` |
| 121 | `{"id":"m_c3helltower_shell","x":116,"y":18,"scale":0.87}` |
| 122 | `{"id":"m_c3helltower_shell","x":84,"y":18,"scale":1.16}` |
| 123 | `{"id":"m_c3helltower_shell","x":56,"y":30,"scale":0.89}` |
| 124 | `{"id":"m_c3helltower_shell","x":33,"y":58,"scale":1.05}` |
| 125 | `{"id":"m_c3helltower_shell","x":22,"y":85,"scale":1.1}` |
| 126 | `{"id":"m_c3helltower_shell","x":22,"y":115,"scale":0.86}` |
| 127 | `{"id":"m_c3helltower_shell","x":33,"y":142,"scale":1.02}` |
| 128 | `{"id":"m_c3helltower_shell","x":56,"y":170,"scale":0.9}` |
| 129 | `{"id":"m_c3helltower_shell","x":84,"y":182,"scale":0.85}` |
| 130 | `{"id":"m_c3helltower_shell","x":116,"y":182,"scale":0.92}` |
| 131 | `{"id":"m_c3helltower_shell","x":144,"y":170,"scale":0.88}` |
| 132 | `{"id":"m_c3helltower_shell","x":167,"y":142,"scale":1.04}` |
| 133 | `{"id":"m_c3helltower_shell","x":178,"y":115,"scale":1.14}` |
| 134 | `{"id":"m_c3hellgate_shell","x":100,"y":12}` |
| 135 | `{"id":"m_c3hellsil_spire_a","x":62,"y":30,"scale":1.06}` |
| 136 | `{"id":"m_c3hellsil_pillar","x":74,"y":22,"scale":1.1}` |
| 137 | `{"id":"m_c3hellsil_spire_b","x":88,"y":20,"scale":0.94}` |
| 138 | `{"id":"m_c3hellsil_spire_a","x":132,"y":28,"scale":1.02}` |
| 139 | `{"id":"m_c3hellsil_pillar","x":172,"y":60,"scale":1.08}` |
| 140 | `{"id":"m_c3hellsil_pillar","x":178,"y":82,"scale":1.04}` |
| 141 | `{"id":"m_c3hellsil_spire_b","x":176,"y":104,"scale":0.96}` |
| 142 | `{"id":"m_c3hellsil_pillar","x":170,"y":128,"scale":1.06}` |
| 143 | `{"id":"m_c3hellsil_rubble_a","x":118,"y":180,"scale":1.04}` |
| 144 | `{"id":"m_c3hellsil_rubble_b","x":132,"y":174,"scale":0.92}` |
| 145 | `{"id":"m_c3hellsil_rubble_a","x":146,"y":168,"scale":1.08}` |
| 146 | `{"id":"m_c3hellsil_spire_a","x":78,"y":182,"scale":0.98}` |
| 147 | `{"id":"m_c3hellsil_spire_b","x":30,"y":66,"scale":1.02}` |
| 148 | `{"id":"m_c3hellsil_pillar","x":22,"y":88,"scale":1.06}` |
| 149 | `{"id":"m_c3hellsil_spire_a","x":24,"y":110,"scale":0.94}` |
| 150 | `{"id":"m_c3hellsil_rubble_b","x":34,"y":138,"scale":1.08}` |
| 151 | `{"id":"m_c3hellcarcass","x":38,"y":151,"scale":2.1}` |
| 152 | `{"id":"m_hang_cage","x":24,"y":140,"scale":0.85}` |
| 153 | `{"id":"m_c3hellcorpsefieldf","x":54,"y":159,"scale":0.72}` |
| 154 | `{"id":"m_sword_pile","x":47,"y":137,"scale":0.82}` |
| 155 | `{"id":"m_hang_cage","x":31,"y":166,"scale":0.66}` |
| 156 | `{"id":"m_c3fbones","x":58,"y":145}` |
| 157 | `{"id":"m_c3bones","x":21,"y":157}` |
| 158 | `{"id":"m_c3deco","x":43,"y":169}` |
| 159 | `{"id":"m_cage_gate","x":163,"y":153,"scale":0.88}` |
| 160 | `{"id":"m_hang_cage","x":177,"y":137,"scale":0.7}` |
| 161 | `{"id":"m_c3hellcorpsefield","x":146,"y":161,"scale":0.68}` |
| 162 | `{"id":"m_obelisk","x":157,"y":134,"scale":0.72}` |
| 163 | `{"id":"m_c3hellcorpsefieldf","x":181,"y":166,"scale":0.58}` |
| 164 | `{"id":"m_c3fbones","x":141,"y":146}` |
| 165 | `{"id":"m_c3bones","x":174,"y":155}` |
| 166 | `{"id":"m_c3deco","x":153,"y":171}` |
| 167 | `{"id":"m_c3hellcorpsefieldf","x":35,"y":48,"scale":0.72}` |
| 168 | `{"id":"m_c3hellcorpsefield","x":56,"y":60,"scale":0.76}` |
| 169 | `{"id":"m_bone_arch","x":27,"y":67,"scale":0.56}` |
| 170 | `{"id":"m_hang_cage","x":57,"y":35,"scale":0.64}` |
| 171 | `{"id":"m_sword_pile","x":24,"y":31,"scale":0.72}` |
| 172 | `{"id":"m_c3fbones","x":52,"y":43}` |
| 173 | `{"id":"m_c3bones","x":17,"y":58}` |
| 174 | `{"id":"m_c3deco","x":47,"y":68}` |
| 175 | `{"id":"m_c3helldormant","x":160,"y":47,"scale":1.42}` |
| 176 | `{"id":"m_c3wall_end","x":174,"y":65,"rot":90}` |
| 177 | `{"id":"m_c3hellcorpsefieldf","x":145,"y":60,"scale":0.66}` |
| 178 | `{"id":"m_hang_cage","x":181,"y":34,"scale":0.62}` |
| 179 | `{"id":"m_hang_cage","x":144,"y":31,"scale":0.72}` |
| 180 | `{"id":"m_c3fbones","x":151,"y":39}` |
| 181 | `{"id":"m_c3bones","x":184,"y":53}` |
| 182 | `{"id":"m_c3deco","x":164,"y":70}` |
| 183 | `{"id":"m_c3hellexecution","x":29,"y":99,"scale":1.62}` |
| 184 | `{"id":"m_c3hellprison","x":166,"y":101,"scale":1.48}` |
| 185 | `{"id":"m_c3hellprison","x":174,"y":112,"scale":0.96}` |
| 186 | `{"id":"m_c3wall_end","x":45,"y":128,"rot":270}` |
| 187 | `{"id":"m_c3hellcorpsefield","x":53,"y":91,"scale":0.6}` |
| 188 | `{"id":"m_c3wall_end","x":158,"y":137,"rot":90}` |
| 189 | `{"id":"m_c3hellcorpsefieldf","x":148,"y":91,"scale":0.62}` |
| 190 | `{"id":"m_c3hellcorpsefield","x":65,"y":158,"scale":0.62}` |
| 191 | `{"id":"m_c3hellcorpsefieldf","x":58,"y":130,"scale":0.58}` |
| 192 | `{"id":"m_c3hellcorpsefieldf","x":137,"y":158,"scale":0.6}` |
| 193 | `{"id":"m_c3hellcorpsefield","x":143,"y":128,"scale":0.56}` |
| 194 | `{"id":"m_bone_arch","x":66,"y":35,"scale":0.72}` |
| 195 | `{"id":"m_obelisk","x":58,"y":75,"scale":0.52}` |
| 196 | `{"id":"m_c3wall_end","x":137,"y":34,"rot":180}` |
| 197 | `{"id":"m_obelisk","x":143,"y":76,"scale":0.5}` |
| 198 | `{"id":"m_c3hellcorpsefield","x":76,"y":177,"scale":0.55}` |
| 199 | `{"id":"m_c3hellcorpsefieldf","x":124,"y":177,"scale":0.62}` |
| 200 | `{"id":"m_c3hellcorpsefieldf","x":52,"y":158,"scale":0.72}` |
| 201 | `{"id":"m_c3hellcorpsefield","x":70,"y":166,"scale":0.55}` |
| 202 | `{"id":"m_c3hellcorpsefieldf","x":132,"y":166,"scale":0.62}` |
| 203 | `{"id":"m_c3hellcorpsefield","x":150,"y":155,"scale":0.7}` |
| 204 | `{"id":"m_c3hellcorpsefieldf","x":172,"y":126,"scale":0.58}` |
| 205 | `{"id":"m_c3hellcorpsefield","x":173,"y":78,"scale":0.66}` |
| 206 | `{"id":"m_c3hellcorpsefieldf","x":154,"y":57,"scale":0.55}` |
| 207 | `{"id":"m_c3hellcorpsefield","x":132,"y":36,"scale":0.62}` |
| 208 | `{"id":"m_c3hellcorpsefieldf","x":68,"y":36,"scale":0.58}` |
| 209 | `{"id":"m_c3hellcorpsefield","x":46,"y":55,"scale":0.7}` |
| 210 | `{"id":"m_c3hellcorpsefieldf","x":28,"y":78,"scale":0.55}` |
| 211 | `{"id":"m_c3hellcorpsefield","x":27,"y":124,"scale":0.62}` |
| 212 | `{"id":"m_c3hellcorpsefieldf","x":62,"y":118,"scale":0.58}` |
| 213 | `{"id":"m_c3hellcorpsefield","x":138,"y":82,"scale":0.6}` |
| 214 | `{"id":"m_c3hellcorpsefield","x":62,"y":82,"scale":0.52}` |
| 215 | `{"id":"m_c3hellcorpsefieldf","x":138,"y":118,"scale":0.56}` |
| 216 | `{"id":"m_c3hellcorpsefieldf","x":48,"y":78,"scale":0.54}` |
| 217 | `{"id":"m_c3hellcorpsefield","x":49,"y":122,"scale":0.6}` |
| 218 | `{"id":"m_c3hellcorpsefieldf","x":78,"y":49,"scale":0.56}` |
| 219 | `{"id":"m_c3hellcorpsefield","x":122,"y":49,"scale":0.62}` |
| 220 | `{"id":"m_c3hellcorpsefieldf","x":151,"y":78,"scale":0.58}` |
| 221 | `{"id":"m_c3hellcorpsefield","x":151,"y":122,"scale":0.54}` |
| 222 | `{"id":"m_c3hellcorpsefieldf","x":78,"y":151,"scale":0.62}` |
| 223 | `{"id":"m_c3hellcorpsefield","x":122,"y":151,"scale":0.56}` |
| 224 | `{"id":"m_c3hellcorpsefieldf","x":30,"y":94,"scale":0.52}` |
| 225 | `{"id":"m_c3hellcorpsefield","x":30,"y":112,"scale":0.58}` |
| 226 | `{"id":"m_c3hellcorpsefieldf","x":42,"y":142,"scale":0.55}` |
| 227 | `{"id":"m_c3hellcorpsefield","x":62,"y":165,"scale":0.6}` |
| 228 | `{"id":"m_c3hellcorpsefieldf","x":80,"y":176,"scale":0.52}` |
| 229 | `{"id":"m_c3hellcorpsefield","x":120,"y":176,"scale":0.58}` |
| 230 | `{"id":"m_c3hellcorpsefieldf","x":138,"y":165,"scale":0.55}` |
| 231 | `{"id":"m_c3hellcorpsefield","x":158,"y":142,"scale":0.6}` |
| 232 | `{"id":"m_c3hellcorpsefieldf","x":170,"y":112,"scale":0.52}` |
| 233 | `{"id":"m_c3hellcorpsefield","x":170,"y":88,"scale":0.58}` |
| 234 | `{"id":"m_c3hellground_dark","x":64,"y":72,"rot":15}` |
| 235 | `{"id":"m_c3hellground_dark","x":82,"y":54,"scale":0.92,"rot":55}` |
| 236 | `{"id":"m_c3hellground_dark","x":118,"y":54,"scale":1.04,"rot":105}` |
| 237 | `{"id":"m_c3hellground_dark","x":136,"y":72,"scale":0.94,"rot":145}` |
| 238 | `{"id":"m_c3hellground_dark","x":146,"y":100,"scale":1.08,"rot":195}` |
| 239 | `{"id":"m_c3hellground_dark","x":136,"y":128,"scale":0.96,"rot":235}` |
| 240 | `{"id":"m_c3hellground_dark","x":118,"y":146,"scale":1.02,"rot":285}` |
| 241 | `{"id":"m_c3hellground_dark","x":82,"y":146,"scale":0.9,"rot":325}` |
| 242 | `{"id":"m_c3hellground_dark","x":64,"y":128,"scale":1.06,"rot":25}` |
| 243 | `{"id":"m_c3hellground_dark","x":54,"y":100,"scale":0.94,"rot":75}` |
| 244 | `{"id":"m_c3hellground_dark","x":64,"y":100,"rot":125}` |
| 245 | `{"id":"m_c3hellground_dark","x":136,"y":100,"scale":0.92,"rot":175}` |
| 246 | `{"id":"m_c3hellground_plate","x":48,"y":54,"scale":0.94,"rot":10}` |
| 247 | `{"id":"m_c3hellground_plate","x":72,"y":32,"scale":1.04,"rot":45}` |
| 248 | `{"id":"m_c3hellground_plate","x":128,"y":32,"scale":0.92,"rot":80}` |
| 249 | `{"id":"m_c3hellground_plate","x":152,"y":54,"scale":1.02,"rot":120}` |
| 250 | `{"id":"m_c3hellground_plate","x":168,"y":78,"scale":0.9,"rot":155}` |
| 251 | `{"id":"m_c3hellground_plate","x":168,"y":122,"scale":1.06,"rot":195}` |
| 252 | `{"id":"m_c3hellground_plate","x":152,"y":146,"scale":0.94,"rot":230}` |
| 253 | `{"id":"m_c3hellground_plate","x":128,"y":168,"scale":1.02,"rot":270}` |
| 254 | `{"id":"m_c3hellground_plate","x":72,"y":168,"scale":0.92,"rot":305}` |
| 255 | `{"id":"m_c3hellground_plate","x":48,"y":146,"scale":1.04,"rot":340}` |
| 256 | `{"id":"m_c3hellground_plate","x":32,"y":122,"scale":0.9,"rot":20}` |
| 257 | `{"id":"m_c3hellground_plate","x":32,"y":78,"scale":1.06,"rot":70}` |
| 258 | `{"id":"m_c3hellfissure","x":100,"y":45,"scale":1.35,"rot":8}` |
| 259 | `{"id":"m_c3hellfissure","x":128,"y":50,"scale":1.18,"rot":34}` |
| 260 | `{"id":"m_c3hellfissure","x":150,"y":70,"scale":1.42,"rot":67}` |
| 261 | `{"id":"m_c3hellfissure","x":158,"y":100,"scale":1.22,"rot":95}` |
| 262 | `{"id":"m_c3hellfissure","x":150,"y":130,"scale":1.34,"rot":122}` |
| 263 | `{"id":"m_c3hellfissure","x":128,"y":150,"scale":1.16,"rot":151}` |
| 264 | `{"id":"m_c3hellfissure","x":100,"y":155,"scale":1.4,"rot":181}` |
| 265 | `{"id":"m_c3hellfissure","x":72,"y":150,"scale":1.2,"rot":207}` |
| 266 | `{"id":"m_c3hellfissure","x":50,"y":130,"scale":1.36,"rot":238}` |
| 267 | `{"id":"m_c3hellfissure","x":42,"y":100,"scale":1.14,"rot":266}` |
| 268 | `{"id":"m_c3hellfissure","x":50,"y":70,"scale":1.38,"rot":294}` |
| 269 | `{"id":"m_c3hellfissure","x":72,"y":50,"scale":1.18,"rot":326}` |
| 270 | `{"id":"m_c3hellfissure","x":117,"y":58,"scale":0.92,"rot":18}` |
| 271 | `{"id":"m_c3hellfissure","x":142,"y":83,"scale":1.02,"rot":74}` |
| 272 | `{"id":"m_c3hellfissure","x":142,"y":117,"scale":0.94,"rot":116}` |
| 273 | `{"id":"m_c3hellfissure","x":117,"y":142,"scale":1.04,"rot":164}` |
| 274 | `{"id":"m_c3hellfissure","x":83,"y":142,"scale":0.96,"rot":224}` |
| 275 | `{"id":"m_c3hellfissure","x":58,"y":117,"scale":1.02,"rot":278}` |
| 276 | `{"id":"m_hang_cage","x":42,"y":42,"scale":0.58}` |
| 277 | `{"id":"m_hang_cage","x":25,"y":90,"scale":0.64}` |
| 278 | `{"id":"m_hang_cage","x":25,"y":110,"scale":0.56}` |
| 279 | `{"id":"m_hang_cage","x":42,"y":158,"scale":0.62}` |
| 280 | `{"id":"m_hang_cage","x":158,"y":158,"scale":0.58}` |
| 281 | `{"id":"m_hang_cage","x":175,"y":110,"scale":0.64}` |
| 282 | `{"id":"m_hang_cage","x":175,"y":90,"scale":0.56}` |
| 283 | `{"id":"m_hang_cage","x":158,"y":42,"scale":0.62}` |
| 284 | `{"id":"m_obelisk","x":82,"y":30,"scale":0.44}` |
| 285 | `{"id":"m_obelisk","x":118,"y":30,"scale":0.5}` |
| 286 | `{"id":"m_obelisk","x":160,"y":82,"scale":0.46}` |
| 287 | `{"id":"m_obelisk","x":160,"y":118,"scale":0.52}` |
| 288 | `{"id":"m_obelisk","x":118,"y":170,"scale":0.44}` |
| 289 | `{"id":"m_obelisk","x":82,"y":170,"scale":0.5}` |
| 290 | `{"id":"m_obelisk","x":40,"y":118,"scale":0.46}` |
| 291 | `{"id":"m_obelisk","x":40,"y":82,"scale":0.52}` |
| 292 | `{"id":"m_c3fbones","x":52,"y":31}` |
| 293 | `{"id":"m_c3bones","x":31,"y":52}` |
| 294 | `{"id":"m_c3deco","x":31,"y":148}` |
| 295 | `{"id":"m_c3fbones","x":52,"y":169}` |
| 296 | `{"id":"m_c3bones","x":148,"y":169}` |
| 297 | `{"id":"m_c3deco","x":169,"y":148}` |
| 298 | `{"id":"m_c3fbones","x":169,"y":52}` |
| 299 | `{"id":"m_c3bones","x":148,"y":31}` |
| 300 | `{"id":"m_c3deco","x":58,"y":58}` |
| 301 | `{"id":"m_c3fbones","x":142,"y":58}` |
| 302 | `{"id":"m_c3bones","x":142,"y":142}` |
| 303 | `{"id":"m_c3deco","x":58,"y":142}` |
| 304 | `{"id":"m_hang_cage","x":46,"y":24,"scale":0.58}` |
| 305 | `{"id":"m_hang_cage","x":63,"y":18,"scale":0.52}` |
| 306 | `{"id":"m_obelisk","x":76,"y":24,"scale":0.42}` |
| 307 | `{"id":"m_c3fbones","x":91,"y":16,"scale":0.9}` |
| 308 | `{"id":"m_hang_cage","x":137,"y":19,"scale":0.56}` |
| 309 | `{"id":"m_hang_cage","x":157,"y":30,"scale":0.62}` |
| 310 | `{"id":"m_obelisk","x":174,"y":54,"scale":0.44}` |
| 311 | `{"id":"m_c3deco","x":181,"y":72,"scale":0.9}` |
| 312 | `{"id":"m_hang_cage","x":184,"y":124,"scale":0.58}` |
| 313 | `{"id":"m_hang_cage","x":176,"y":146,"scale":0.54}` |
| 314 | `{"id":"m_obelisk","x":159,"y":169,"scale":0.46}` |
| 315 | `{"id":"m_c3bones","x":139,"y":181,"scale":0.9}` |
| 316 | `{"id":"m_hang_cage","x":122,"y":184,"scale":0.56}` |
| 317 | `{"id":"m_hang_cage","x":77,"y":183,"scale":0.52}` |
| 318 | `{"id":"m_obelisk","x":57,"y":173,"scale":0.42}` |
| 319 | `{"id":"m_c3fbones","x":39,"y":164,"scale":0.9}` |
| 320 | `{"id":"m_hang_cage","x":23,"y":143,"scale":0.58}` |
| 321 | `{"id":"m_hang_cage","x":16,"y":121,"scale":0.54}` |
| 322 | `{"id":"m_obelisk","x":20,"y":91,"scale":0.44}` |
| 323 | `{"id":"m_c3deco","x":24,"y":68,"scale":0.9}` |
| 324 | `{"id":"m_c3hellcorpsefieldf","x":44,"y":28,"scale":0.48}` |
| 325 | `{"id":"m_c3hellcorpsefield","x":156,"y":35,"scale":0.52}` |
| 326 | `{"id":"m_c3hellcorpsefieldf","x":174,"y":132,"scale":0.5}` |
| 327 | `{"id":"m_c3hellcorpsefield","x":145,"y":174,"scale":0.54}` |
| 328 | `{"id":"m_c3hellcorpsefieldf","x":55,"y":171,"scale":0.5}` |
| 329 | `{"id":"m_c3hellcorpsefield","x":25,"y":116,"scale":0.48}` |
| 330 | `{"id":"m_c3bones","x":118,"y":18,"scale":0.9}` |
| 331 | `{"id":"m_c3deco","x":18,"y":102,"scale":0.9}` |
| 332 | `{"id":"m_c3fbones","x":76,"y":96}` |
| 333 | `{"id":"m_c3bones","x":83,"y":109}` |
| 334 | `{"id":"m_c3deco","x":72,"y":122}` |
| 335 | `{"id":"m_c3fbones","x":128,"y":91}` |
| 336 | `{"id":"m_c3bones","x":119,"y":112}` |
| 337 | `{"id":"m_c3deco","x":132,"y":125}` |
| 338 | `{"id":"m_c3fbones","x":87,"y":64}` |
| 339 | `{"id":"m_c3bones","x":116,"y":61}` |
| 340 | `{"id":"m_c3hellcenter_stain","x":84,"y":94,"scale":0.78,"rot":18}` |
| 341 | `{"id":"m_c3hellcenter_stain","x":116,"y":108,"scale":0.72,"rot":211}` |
| 342 | `{"id":"m_c3hellcenter_plate","x":88,"y":112,"scale":0.68,"rot":54}` |
| 343 | `{"id":"m_c3hellcenter_plate","x":114,"y":86,"scale":0.62,"rot":227}` |
| 344 | `{"id":"m_c3hellcenter_vein","x":89,"y":98,"scale":0.74,"rot":286}` |
| 345 | `{"id":"m_c3hellcenter_vein","x":111,"y":102,"scale":0.66,"rot":104}` |

### A.2 si11 — 18개

| 순서 | raw 원문 평가값 |
|---|---|
| 0 | `{"id":"m_c3rampart","x":86,"y":154,"scale":0.76}` |
| 1 | `{"id":"m_c3crystals","x":91,"y":145,"scale":0.5}` |
| 2 | `{"id":"m_c3debris","x":82,"y":162,"scale":0.7}` |
| 3 | `{"id":"m_c3bones","x":86,"y":150}` |
| 4 | `{"id":"m_c3fbones","x":85,"y":145}` |
| 5 | `{"id":"m_c3bones","x":81,"y":157}` |
| 6 | `{"id":"m_c3cliff","x":114,"y":102,"scale":0.78}` |
| 7 | `{"id":"m_c3ridge","x":110,"y":113,"scale":0.52}` |
| 8 | `{"id":"m_c3debris","x":118,"y":94,"scale":0.75}` |
| 9 | `{"id":"m_c3deco","x":121,"y":106}` |
| 10 | `{"id":"m_c3fbones","x":112,"y":109}` |
| 11 | `{"id":"m_c3bones","x":122,"y":106}` |
| 12 | `{"id":"m_c3bridge","x":86,"y":48,"scale":0.8}` |
| 13 | `{"id":"m_c3stalag","x":91,"y":58,"scale":0.52}` |
| 14 | `{"id":"m_c3gcrack","x":81,"y":41,"scale":0.72}` |
| 15 | `{"id":"m_c3fbones","x":80,"y":57}` |
| 16 | `{"id":"m_c3bones","x":87,"y":53}` |
| 17 | `{"id":"m_c3bones","x":90,"y":46}` |

### A.3 si12 — 21개

| 순서 | raw 원문 평가값 |
|---|---|
| 0 | `{"id":"m_c3tree","x":114,"y":156,"scale":0.76}` |
| 1 | `{"id":"m_c3corpse","x":110,"y":146,"scale":0.58}` |
| 2 | `{"id":"m_c3debris","x":118,"y":164,"scale":0.72}` |
| 3 | `{"id":"m_c3deco","x":111,"y":160}` |
| 4 | `{"id":"m_c3deco","x":115,"y":153}` |
| 5 | `{"id":"m_c3bones","x":109,"y":153}` |
| 6 | `{"id":"m_c3rampart","x":86,"y":101,"scale":0.92}` |
| 7 | `{"id":"m_c3corpse","x":91,"y":111,"scale":0.7}` |
| 8 | `{"id":"m_c3corpse","x":82,"y":92,"scale":0.5}` |
| 9 | `{"id":"m_c3gdark","x":88,"y":104,"scale":0.86}` |
| 10 | `{"id":"m_c3bones","x":75,"y":103}` |
| 11 | `{"id":"m_c3deco","x":85,"y":108}` |
| 12 | `{"id":"m_c3fbones","x":93,"y":96}` |
| 13 | `{"id":"m_c3bones","x":91,"y":107}` |
| 14 | `{"id":"m_c3fbones","x":85,"y":90}` |
| 15 | `{"id":"m_c3stalag","x":114,"y":48,"scale":0.72}` |
| 16 | `{"id":"m_c3corpse","x":110,"y":58,"scale":0.6}` |
| 17 | `{"id":"m_c3gplates","x":119,"y":41,"scale":0.72}` |
| 18 | `{"id":"m_c3deco","x":106,"y":50}` |
| 19 | `{"id":"m_c3fbones","x":122,"y":46}` |
| 20 | `{"id":"m_c3deco","x":111,"y":44}` |

### A.4 si13 — 20개

| 순서 | raw 원문 평가값 |
|---|---|
| 0 | `{"id":"m_c3tree","x":114,"y":156,"scale":0.78}` |
| 1 | `{"id":"m_c3crystals","x":110,"y":147,"scale":0.5}` |
| 2 | `{"id":"m_c3debris","x":118,"y":164,"scale":0.72}` |
| 3 | `{"id":"m_c3bones","x":109,"y":156}` |
| 4 | `{"id":"m_c3deco","x":117,"y":149}` |
| 5 | `{"id":"m_c3bones","x":110,"y":164}` |
| 6 | `{"id":"m_c3ritual","x":86,"y":102,"scale":0.84}` |
| 7 | `{"id":"m_c3sealshrine","x":86,"y":98,"scale":0.84}` |
| 8 | `{"id":"m_c3crystals","x":91,"y":109,"scale":0.52}` |
| 9 | `{"id":"m_c3cagef","x":81,"y":90,"scale":0.62}` |
| 10 | `{"id":"m_c3deco","x":90,"y":101}` |
| 11 | `{"id":"m_c3bones","x":81,"y":99}` |
| 12 | `{"id":"m_c3bones","x":90,"y":100}` |
| 13 | `{"id":"m_c3deco","x":88,"y":110}` |
| 14 | `{"id":"m_c3sealbeast","x":108,"y":46}` |
| 15 | `{"id":"m_c3crystals","x":120,"y":55,"scale":0.52}` |
| 16 | `{"id":"m_c3stalag","x":117,"y":36,"scale":0.5}` |
| 17 | `{"id":"m_c3bones","x":124,"y":44}` |
| 18 | `{"id":"m_c3fbones","x":121,"y":49}` |
| 19 | `{"id":"m_c3fbones","x":119,"y":52}` |

## 부록 B. CH3 등록61개·cross 등록·생성굴 전수표

등록 순서는 G17693–17758의 원문 순서다. 모든 키/배열/명시0를 보존한다. filter/edgeErase/srcRect 등은 표현 메타이고 colParts/scale/colSz 등은 실제 게임플레이 query 소비와 함께 검수한다. dir=collision만으로충돌을판정하지않고col/collision을읽는다.

| 순서 | CH_DECO[2] raw 등록 | 원본 행 |
|---|---|---|
| 0 | `{"id":"m_c3p1","file":"prop_a.png","sz":400,"large":1,"dir":"collision","col":1,"colSz":72,"keepAR":1}` | G17694 |
| 1 | `{"id":"m_c3p1b","file":"prop_a.png","sz":330,"large":1,"dir":"collision","col":1,"colSz":60,"keepAR":1,"flip":1}` | G17695 |
| 2 | `{"id":"m_c3p2","file":"prop_b.png","sz":360,"large":1,"dir":"collision","col":1,"colSz":70,"keepAR":1}` | G17696 |
| 3 | `{"id":"m_c3shrine","file":"prop_iceshrine.png","sz":360,"large":1,"dir":"collision","col":1,"colSz":85,"keepAR":1}` | G17697 |
| 4 | `{"id":"m_c3cage","file":"prop_icecage.png","sz":360,"large":1,"dir":"collision","col":1,"colSz":40,"keepAR":1}` | G17698 |
| 5 | `{"id":"m_c3cagef","file":"prop_icecage.png","sz":360,"large":1,"dir":"collision","col":1,"colSz":40,"keepAR":1,"flip":1}` | G17699 |
| 6 | `{"id":"m_c3pit","file":"pit_ice.png","sz":200,"large":1,"dir":"collision","col":1,"collision":1,"colSz":80}` | G17700 |
| 7 | `{"id":"m_c3fbones","file":"frozen_bones.png","sz":56,"scatter":1}` | G17701 |
| 8 | `{"id":"m_c3bones","file":"bones.png","sz":44,"scatter":1}` | G17702 |
| 9 | `{"id":"m_c3deco","file":"deco_bones_03.png","sz":48,"scatter":1}` | G17703 |
| 10 | `{"id":"m_c3ritual","file":"prop_ice_ritual.png","sz":380,"keepAR":1}` | G17705 |
| 11 | `{"id":"m_c3hellritual","file":"prop_hellwinter_ritual.png","sz":380,"keepAR":1,"alpha":0.56}` | G17706 |
| 12 | `{"id":"m_c3debris","file":"prop_ice_debris.png","sz":150,"scatter":1}` | G17707 |
| 13 | `{"id":"m_c3gsnow","file":"prop_ice_gsnow.png","sz":200,"scatter":1}` | G17708 |
| 14 | `{"id":"m_c3gcrack","file":"prop_ice_gcrack.png","sz":240,"scatter":1}` | G17709 |
| 15 | `{"id":"m_c3gplates","file":"prop_ice_gplates.png","sz":200,"scatter":1}` | G17710 |
| 16 | `{"id":"m_c3gdark","file":"prop_ice_gdark.png","sz":190,"scatter":1}` | G17711 |
| 17 | `{"id":"m_c3sealshrine","file":"prop_ice_sealshrine.png","sz":400,"large":1,"dir":"collision","col":1,"colSz":92,"keepAR":1}` | G17713 |
| 18 | `{"id":"m_c3crystals","file":"prop_ice_crystals.png","sz":340,"large":1,"dir":"collision","col":1,"colSz":80,"keepAR":1}` | G17714 |
| 19 | `{"id":"m_c3tree","file":"prop_ice_tree.png","sz":410,"large":1,"dir":"collision","col":1,"colSz":62,"keepAR":1}` | G17715 |
| 20 | `{"id":"m_c3corpse","file":"prop_ice_corpsepile.png","sz":300,"large":1,"dir":"collision","col":1,"colSz":96,"keepAR":1}` | G17716 |
| 21 | `{"id":"m_c3stalag","file":"prop_ice_stalag.png","sz":320,"large":1,"dir":"collision","col":1,"colSz":82,"keepAR":1}` | G17717 |
| 22 | `{"id":"m_c3sealbeast","file":"prop_ice_sealbeast.png","sz":400,"large":1,"dir":"collision","col":1,"colSz":92,"keepAR":1}` | G17718 |
| 23 | `{"id":"m_c3rampart","file":"prop_ice_rampart.png","sz":470,"large":1,"dir":"collision","col":1,"colW":210,"colH":72,"keepAR":1}` | G17719 |
| 24 | `{"id":"m_c3hellrampart","file":"prop_hellwinter_rampart.png","sz":520,"large":1,"dir":"collision","col":1,"colW":210,"colH":72,"keepAR":1}` | G17720 |
| 25 | `{"id":"m_c3helltower","file":"prop_hellwinter_tower.png","sz":620,"large":1,"dir":"collision","col":1,"colSz":92,"keepAR":1}` | G17721 |
| 26 | `{"id":"m_c3hellback_mass","file":"prop_hellwinter_rampart.png","dir":"collision","sz":1450,"large":1,"keepAR":1,"alpha":0.52,"renderLayer":-4}` | G17722 |
| 27 | `{"id":"m_c3hellrampart_shell","file":"prop_hellwinter_rampart.png","dir":"collision","sz":1100,"large":1,"keepAR":1,"sharedAtlas":1,"alpha":0.82,"renderLayer":-2}` | G17723 |
| 28 | `{"id":"m_c3hellrampart_mid_a","file":"prop_hellwinter_rampart.png","srcRect":[0,180,900,790],"sourceSize":[1632,970],"trimOffset":[0,180],"sharedAtlas":1,"assetOrigin":"runtime-crop","dir":"collision","sz":1700,"large":1,"keepAR":1,"alpha":0.84,"renderLayer":-2}` | G17724 |
| 29 | `{"id":"m_c3hellrampart_mid_b","file":"prop_hellwinter_rampart.png","srcRect":[780,0,852,850],"sourceSize":[1632,970],"trimOffset":[780,0],"sharedAtlas":1,"assetOrigin":"runtime-crop","dir":"collision","sz":1700,"large":1,"keepAR":1,"alpha":0.86,"renderLayer":-2}` | G17725 |
| 30 | `{"id":"m_c3helltower_shell","file":"prop_hellwinter_tower.png","dir":"collision","sz":1300,"large":1,"keepAR":1,"alpha":0.9,"renderLayer":-2}` | G17726 |
| 31 | `{"id":"m_c3hellgate_shell","file":"prop_hellwinter_gate.png","sz":980,"large":1,"keepAR":1,"alpha":0.92,"renderLayer":-2}` | G17727 |
| 32 | `{"id":"m_c3hellrubble_front_a","file":"prop_hellwinter_rampart.png","srcRect":[0,540,900,430],"sourceSize":[1632,970],"trimOffset":[0,540],"sharedAtlas":1,"assetOrigin":"runtime-crop","sz":1200,"large":1,"keepAR":1,"alpha":0.86,"renderLayer":-1,"dir":"collision"}` | G17728 |
| 33 | `{"id":"m_c3hellrubble_front_b","file":"prop_hellwinter_rampart.png","srcRect":[720,470,912,500],"sourceSize":[1632,970],"trimOffset":[720,470],"sharedAtlas":1,"assetOrigin":"runtime-crop","sz":1200,"large":1,"keepAR":1,"alpha":0.82,"renderLayer":-1,"dir":"collision"}` | G17729 |
| 34 | `{"id":"m_c3hellsil_spire_a","file":"prop_hellwinter_rampart.png","srcRect":[20,20,820,380],"sourceSize":[820,380],"trimOffset":[0,0],"sharedAtlas":1,"assetOrigin":"runtime-crop","dir":"collision","sz":480,"large":1,"keepAR":1,"alpha":0.68,"renderLayer":-1}` | G17730 |
| 35 | `{"id":"m_c3hellsil_spire_b","file":"prop_hellwinter_rampart.png","srcRect":[860,0,740,420],"sourceSize":[740,420],"trimOffset":[0,0],"sharedAtlas":1,"assetOrigin":"runtime-crop","dir":"collision","sz":460,"large":1,"keepAR":1,"alpha":0.66,"renderLayer":-1}` | G17731 |
| 36 | `{"id":"m_c3hellsil_pillar","file":"prop_hellwinter_rampart.png","srcRect":[360,250,300,650],"sourceSize":[300,650],"trimOffset":[0,0],"sharedAtlas":1,"assetOrigin":"runtime-crop","dir":"collision","sz":500,"large":1,"keepAR":1,"alpha":0.7,"renderLayer":-1}` | G17732 |
| 37 | `{"id":"m_c3hellsil_rubble_a","file":"prop_hellwinter_rampart.png","srcRect":[0,540,900,430],"sourceSize":[900,430],"trimOffset":[0,0],"sharedAtlas":1,"assetOrigin":"runtime-crop","dir":"collision","sz":430,"large":1,"keepAR":1,"alpha":0.62,"renderLayer":-1}` | G17733 |
| 38 | `{"id":"m_c3hellsil_rubble_b","file":"prop_hellwinter_rampart.png","srcRect":[0,540,900,430],"sourceSize":[900,430],"trimOffset":[0,0],"sharedAtlas":1,"assetOrigin":"runtime-crop","dir":"collision","sz":430,"large":1,"keepAR":1,"flip":1,"alpha":0.58,"renderLayer":-1}` | G17734 |
| 39 | `{"id":"m_c3hellground_shadow","file":"prop_ice_gdark.png","sz":760,"keepAR":1,"alpha":0.22,"renderLayer":-11,"filter":"grayscale(1) brightness(.26) contrast(1.25)"}` | G17735 |
| 40 | `{"id":"m_c3hellground_dark","file":"prop_ice_gdark.png","sz":620,"keepAR":1,"alpha":0.055,"renderLayer":-10}` | G17736 |
| 41 | `{"id":"m_c3hellground_plate","file":"prop_ice_gplates.png","sz":500,"keepAR":1,"alpha":0.035,"renderLayer":-10}` | G17737 |
| 42 | `{"id":"m_c3hellfissure","file":"prop_ice_gcrack.png","sz":430,"keepAR":1,"alpha":0.24,"renderLayer":-9,"filter":"grayscale(1) sepia(1) saturate(7) hue-rotate(315deg) brightness(.72)","blend":"screen"}` | G17738 |
| 43 | `{"id":"m_c3hellcenter_stain","file":"prop_ice_gdark.png","sz":320,"keepAR":1,"alpha":0.1,"renderLayer":1,"filter":"grayscale(1) brightness(.46) contrast(1.28) saturate(.16)"}` | G17739 |
| 44 | `{"id":"m_c3hellcenter_plate","file":"prop_ice_gplates.png","sz":280,"keepAR":1,"alpha":0.055,"renderLayer":1,"filter":"grayscale(1) brightness(.42) contrast(1.2)"}` | G17740 |
| 45 | `{"id":"m_c3hellcenter_vein","file":"prop_ice_gcrack.png","sz":260,"keepAR":1,"alpha":0.11,"renderLayer":1,"filter":"grayscale(1) sepia(1) saturate(6) hue-rotate(315deg) brightness(.56)","blend":"screen"}` | G17741 |
| 46 | `{"id":"m_c3wall_i","file":"prop_hellwinter_wall_atlas.png","srcRect":[12,12,1111,1137],"sourceSize":[1254,1254],"trimOffset":[95,66],"sharedAtlas":1,"assetOrigin":"crop-atlas","sz":520,"large":1,"dir":"collision","col":1,"keepAR":1,"wallKit":"CH3_HELLWINTER_V1","wallUnit":8,"colParts":[{"x":0,"y":0,"w":270,"h":52,"rot":-45}]}` | G17742 |
| 47 | `{"id":"m_c3wall_l","file":"prop_hellwinter_wall_atlas.png","srcRect":[1135,12,618,1106],"sourceSize":[1254,1254],"trimOffset":[323,75],"sharedAtlas":1,"assetOrigin":"crop-atlas","sz":420,"large":1,"dir":"collision","col":1,"keepAR":1,"pivotX":0.27,"pivotY":0.5,"wallKit":"CH3_HELLWINTER_V1","wallUnit":8,"colParts":[{"x":112,"y":-82,"w":152,"h":52,"rot":-45},{"x":112,"y":82,"w":152,"h":52,"rot":45}]}` | G17743 |
| 48 | `{"id":"m_c3wall_end","file":"prop_hellwinter_wall_atlas.png","srcRect":[1765,12,882,897],"sourceSize":[1254,1254],"trimOffset":[182,174],"sharedAtlas":1,"assetOrigin":"crop-atlas","sz":520,"large":1,"dir":"collision","col":1,"keepAR":1,"wallKit":"CH3_HELLWINTER_V1","wallUnit":8,"colParts":[{"x":0,"y":0,"w":238,"h":52,"rot":-45}]}` | G17744 |
| 49 | `{"id":"m_c3wall_gate","file":"prop_hellwinter_wall_atlas.png","srcRect":[12,1161,1482,646],"sourceSize":[1536,1024],"trimOffset":[20,229],"sharedAtlas":1,"assetOrigin":"crop-atlas","sz":650,"large":1,"dir":"collision","col":1,"keepAR":1,"squareDraw":1,"pivotX":0.5,"pivotY":0.36,"wallKit":"CH3_HELLWINTER_V1","wallUnit":8,"colParts":[{"x":-220,"y":135,"w":110,"h":44,"rot":-45},{"x":220,"y":135,"w":110,"h":44,"rot":45}]}` | G17745 |
| 50 | `{"id":"m_c3hellcarcass","file":"prop_hellwinter_carcass.png","sz":760,"large":1,"dir":"collision","col":1,"colW":220,"colH":88,"keepAR":1,"edgeErase":0.08}` | G17746 |
| 51 | `{"id":"m_c3helldormant","file":"prop_hellwinter_dormant.png","sz":650,"large":1,"dir":"collision","col":1,"colW":170,"colH":96,"keepAR":1,"edgeErase":0.1}` | G17747 |
| 52 | `{"id":"m_c3hellexecution","file":"prop_hellwinter_execution.png","sz":720,"large":1,"dir":"collision","col":1,"colW":165,"colH":76,"keepAR":1,"edgeErase":0.03}` | G17748 |
| 53 | `{"id":"m_c3hellprison","file":"prop_hellwinter_prison.png","sz":560,"large":1,"dir":"collision","col":1,"colW":145,"colH":88,"keepAR":1,"edgeErase":0.03}` | G17749 |
| 54 | `{"id":"m_c3hellgate","file":"prop_hellwinter_gate.png","sz":820,"large":1,"keepAR":1}` | G17750 |
| 55 | `{"id":"m_c3hellcorpsefield","file":"prop_hellwinter_corpsefield.png","sz":400,"large":1,"keepAR":1}` | G17751 |
| 56 | `{"id":"m_c3hellcorpsefieldf","file":"prop_hellwinter_corpsefield.png","sz":400,"large":1,"keepAR":1,"flip":1}` | G17752 |
| 57 | `{"id":"m_c3bridge","file":"prop_ice_bridge.png","sz":490,"large":1,"dir":"collision","col":1,"colW":220,"colH":60,"keepAR":1}` | G17753 |
| 58 | `{"id":"m_c3cavwall","file":"prop_ice_cavwall.png","sz":560,"large":1,"dir":"collision","col":1,"colW":150,"colH":80,"keepAR":1}` | G17755 |
| 59 | `{"id":"m_c3cliff","file":"prop_ice_cliff.png","sz":560,"large":1,"dir":"collision","col":1,"colSz":120,"keepAR":1}` | G17756 |
| 60 | `{"id":"m_c3ridge","file":"prop_ice_ridge.png","sz":560,"large":1,"dir":"collision","col":1,"colW":150,"colH":55,"keepAR":1}` | G17757 |

si10의 CH1 cross 등록은 G17520–17637, 초기 col은 G18418–18421에서 유지된다. 다른장전체prop배치를복사하지않는다.

| id | 초기 meta | CH1 raw 등록 |
|---|---|---|
| m_cage_gate | `{"sz":300,"col":1,"large":1}` | `{"id":"m_cage_gate","file":"cage_gate.png","sz":300,"large":1,"dir":"collision"}` |
| m_sword_pile | `{"sz":200,"col":1,"large":1}` | `{"id":"m_sword_pile","file":"sword_pile.png","sz":200,"large":1,"dir":"collision"}` |
| m_hang_cage | `{"sz":280,"col":1,"large":1}` | `{"id":"m_hang_cage","file":"hang_cage.png","sz":280,"large":1,"dir":"collision"}` |
| m_obelisk | `{"sz":300,"col":1,"large":1}` | `{"id":"m_obelisk","file":"obelisk.png","sz":300,"large":1,"dir":"collision"}` |
| m_bone_arch | `{"sz":300,"col":1,"large":1}` | `{"id":"m_bone_arch","file":"bone_arch.png","sz":300,"large":1,"dir":"collision"}` |

HELL_SPAWN[2] 원문 G30975의 순서/가중치 전체: `[[0,5],[1,2],[2,10],[3,4],[4,4],[5,8],[6,3],[7,6],[8,3],[9,1],[10,2],[11,2],[12,10],[13,1],[14,4],[15,2],[16,5],[17,1],[18,1],[19,1],[40,8],[41,7],[42,2],[43,14],[44,8],[45,3],[46,2],[47,14],[48,2],[49,1]]`. 합계 136이며 몬스터종수/마릿수분모와구분한다.

_RANGED_ET 전체(G30991): `[1,7,8,9,13,16,17,25,26,34,38,42,45,46,48,53,54,66,71,76,78,82,84,86,88]`.

### B.si10 소환굴 7개 / 650마리

원문 generator G30486–30626 뒤 순서다. x/y는 **world px**, size/room/count는 원값. timer는 seed VM 관측값이며 replay/JSON에 전정밀도로 보존했다. 자연부트 타이머를 고정하라는 지시가 아니다.

| 순서 | x/y px | size | room | count |
|---|---|---|---|---|
| 0 | 4020/2180 | 0.5 | 1 | 100 |
| 1 | 4020/3100 | 0.5 | 1 | 100 |
| 2 | 4020/4020 | 0.5 | 1 | 100 |
| 3 | 4020/4900 | 0.3 | 1 | 50 |
| 4 | 4020/5820 | 0.8 | 1 | 100 |
| 5 | 3060/3420 | 0.55 | 1 | 100 |
| 6 | 4820/1900 | 0.8 | 1 | 100 |

### B.si11 소환굴 13개 / 1050마리

원문 generator G30486–30626 뒤 순서다. x/y는 **world px**, size/room/count는 원값. timer는 seed VM 관측값이며 replay/JSON에 전정밀도로 보존했다. 자연부트 타이머를 고정하라는 지시가 아니다.

| 순서 | x/y px | size | room | count |
|---|---|---|---|---|
| 0 | 2940/7300 | 0.5 | 1 | 100 |
| 1 | 6300/6020 | 0.3 | 1 | 50 |
| 2 | 2100/5980 | 0.5 | 1 | 100 |
| 3 | 5940/5540 | 0.3 | 1 | 50 |
| 4 | 3700/3780 | 0.5 | 1 | 100 |
| 5 | 5660/3060 | 0.5 | 1 | 100 |
| 6 | 2100/2260 | 0.3 | 1 | 50 |
| 7 | 5740/2340 | 0.5 | 1 | 100 |
| 8 | 3940/1260 | 0.8 | 1 | 100 |
| 9 | 3780/6220 | 0.3 | 1 | 50 |
| 10 | 3060/3420 | 0.55 | 1 | 100 |
| 11 | 4820/1900 | 0.8 | 1 | 100 |
| 12 | 4020/5540 | 0.3 | -1 | 50 |

### B.si12 소환굴 14개 / 1100마리

원문 generator G30486–30626 뒤 순서다. x/y는 **world px**, size/room/count는 원값. timer는 seed VM 관측값이며 replay/JSON에 전정밀도로 보존했다. 자연부트 타이머를 고정하라는 지시가 아니다.

| 순서 | x/y px | size | room | count |
|---|---|---|---|---|
| 0 | 2500/7260 | 0.5 | 1 | 100 |
| 1 | 5140/6220 | 0.3 | 1 | 50 |
| 2 | 2060/4980 | 0.5 | 1 | 100 |
| 3 | 5060/5180 | 0.3 | 1 | 50 |
| 4 | 2700/4140 | 0.5 | 1 | 100 |
| 5 | 5420/2500 | 0.5 | 1 | 100 |
| 6 | 2060/2340 | 0.3 | 1 | 50 |
| 7 | 5100/1260 | 0.5 | 1 | 100 |
| 8 | 3580/1140 | 0.8 | 1 | 100 |
| 9 | 3780/6220 | 0.3 | 1 | 50 |
| 10 | 3060/3420 | 0.55 | 1 | 100 |
| 11 | 4820/1900 | 0.8 | 1 | 100 |
| 12 | 4020/5540 | 0.3 | -1 | 50 |
| 13 | 4020/4140 | 0.3 | -1 | 50 |

### B.si13 소환굴 12개 / 950마리

원문 generator G30486–30626 뒤 순서다. x/y는 **world px**, size/room/count는 원값. timer는 seed VM 관측값이며 replay/JSON에 전정밀도로 보존했다. 자연부트 타이머를 고정하라는 지시가 아니다.

| 순서 | x/y px | size | room | count |
|---|---|---|---|---|
| 0 | 2620/6500 | 0.5 | 1 | 100 |
| 1 | 5620/6540 | 0.3 | 1 | 50 |
| 2 | 2500/5420 | 0.5 | 1 | 100 |
| 3 | 5260/4500 | 0.3 | 1 | 50 |
| 4 | 3540/4100 | 0.5 | 1 | 100 |
| 5 | 4620/3140 | 0.5 | 1 | 100 |
| 6 | 2540/2180 | 0.3 | 1 | 50 |
| 7 | 6020/1780 | 0.5 | 1 | 100 |
| 8 | 3780/6220 | 0.3 | 1 | 50 |
| 9 | 3060/3420 | 0.55 | 1 | 100 |
| 10 | 4820/1900 | 0.8 | 1 | 100 |
| 11 | 4020/5540 | 0.3 | -1 | 50 |

## 부록 C. 원화 바이트 참조 명세

장3catalog35 + si10cross5의 중복제외40파일과ground1이다. source와`godot/`대응path의Git blob bytes가동일했다. byte읽기만하며이미지복사/생성/변환은하지않았다. scene전체closure/실제load보장은아니다.

| source path | byte | SHA256 |
|---|---|---|
| `assets/map/ch1/collision/bone_arch.png` | 153345 | `df27ca9bbbb319d2aab2a7ae9034377d8a806b1a9a129ada6d10dbb4a8c57db7` |
| `assets/map/ch1/collision/cage_gate.png` | 124456 | `3d26038f4a93683015244baf881cc38284d8c02ffebbb4f63c1a7f6db870d055` |
| `assets/map/ch1/collision/hang_cage.png` | 93930 | `750727d9a7b1e1af2770ee3a6e5cb5915c9c17984e3e40f08bb62d6e0ff30ecc` |
| `assets/map/ch1/collision/obelisk.png` | 92592 | `1ccbc8e488ecd6ceaca2a731145000a2025856bd4bef6bf7bb657e3bda101994` |
| `assets/map/ch1/collision/sword_pile.png` | 124536 | `3cd5cbf4dd31b5ccbff5354133c4ea15a82c2a0a12755431f389cdc74f577379` |
| `assets/map/ch3/collision/pit_ice.png` | 18132 | `7e4a502e021464af2e6deb45b39b9b3c1f0356dfbf58b57db1128aa91567ca69` |
| `assets/map/ch3/collision/prop_a.png` | 705704 | `b7c3c33da9bea4be507ca37a5d6e6addcb0362ca836e8930ef46d0e9cc6df4a7` |
| `assets/map/ch3/collision/prop_b.png` | 1101813 | `85c3b1b6e557eab842f94edd92d214e463ddce62e15652b74c2f81d1ba79f9f6` |
| `assets/map/ch3/collision/prop_hellwinter_carcass.png` | 2496867 | `b5367f029e03f3455072e0bbeb4db91b761504f0e555ce8887f65f933289bfb0` |
| `assets/map/ch3/collision/prop_hellwinter_dormant.png` | 2414914 | `93bdc62df58cb1d936b1ee7f1ef54866c97a14da4cd39755238ea626a7c271cc` |
| `assets/map/ch3/collision/prop_hellwinter_execution.png` | 2372548 | `91f46719301e610ed1ceedd63ec09027d2797ed929ba564e5885b3512ce1a768` |
| `assets/map/ch3/collision/prop_hellwinter_prison.png` | 2370330 | `42bf360555e75659313e6952bfe17dad050e355355e6dc6451b86696458e3879` |
| `assets/map/ch3/collision/prop_hellwinter_rampart.png` | 2173061 | `9e37364e2dd4887455d0d7360910e8a176b8271da03275816d73bef91227c77c` |
| `assets/map/ch3/collision/prop_hellwinter_tower.png` | 1353575 | `594cc42a67fdd21f56291db802809872db451dc7a258f4cf9406b99b42e6e3d2` |
| `assets/map/ch3/collision/prop_hellwinter_wall_atlas.png` | 2358543 | `1d7fc79153a6552b793c8578c424072d05c28d9dcfe15f71ba07a317b8c05e95` |
| `assets/map/ch3/collision/prop_ice_bridge.png` | 868400 | `31fcf8f0218b797a33982aada0c777239e825c350073a99efc817d879b2dbc93` |
| `assets/map/ch3/collision/prop_ice_cavwall.png` | 1212929 | `077767331f2ebf26636ee8c7b492d96f2409233ec87818db26749d8dc06940d6` |
| `assets/map/ch3/collision/prop_ice_cliff.png` | 1726392 | `9e0a380b836c701573eba294314a790fbf3a8001e819999c8f491ca862465700` |
| `assets/map/ch3/collision/prop_ice_corpsepile.png` | 1289583 | `0b2b9d97e93bdf245747f000138849860f2d323c7552f29c4bc34152f95197b6` |
| `assets/map/ch3/collision/prop_ice_crystals.png` | 1105274 | `b2bbd6b7277fc0f13a5a64362cf7ff40910abceecb588b93051cab7daac93b6f` |
| `assets/map/ch3/collision/prop_ice_rampart.png` | 948497 | `d33eda56e6b99ca60109eb088687372b8d7e0088b7c816bb30792219c60cca12` |
| `assets/map/ch3/collision/prop_ice_ridge.png` | 1127066 | `98042a700b4c034f41844fb942c3ce4917556adc041fba58fa1834fa6aaebf25` |
| `assets/map/ch3/collision/prop_ice_sealbeast.png` | 1261343 | `654c330e4d0284d428ce671bbc6f37e806a117af63272d5b058e6e161cb55419` |
| `assets/map/ch3/collision/prop_ice_sealshrine.png` | 1433354 | `dcb264de3ef54f4d40ccbc6b8df96484576a711c32f8e44ea85ab7c989067490` |
| `assets/map/ch3/collision/prop_ice_stalag.png` | 1267597 | `8addecddb200b2d5139252faabc2319715790b129f5e477682bd9363cb0d6585` |
| `assets/map/ch3/collision/prop_ice_tree.png` | 962508 | `df1e091f46da0024377ad5200f477c332d5bc6e2b2f4a93c55ad9e15df1b056e` |
| `assets/map/ch3/collision/prop_icecage.png` | 1581175 | `f8d96bead04ce3aaa511b9598bd7b19e40e047cea11b028714e1b4ec0fd03fab` |
| `assets/map/ch3/collision/prop_iceshrine.png` | 1554484 | `8cc5eb4f606e30187e13d58b2b2cc42601b9e6183a76b8729286d9c18743bcfc` |
| `assets/map/ch3/floor_objects/bones.png` | 1125 | `55a36681f65d529bed059b3778d19ca4a91e6c8deea5274b32b4f704b0faff67` |
| `assets/map/ch3/floor_objects/deco_bones_03.png` | 1649 | `780b9f205c1b6ab2f3a967caf8c7b7194d50f1a6c59145207c157aabd52ef6a2` |
| `assets/map/ch3/floor_objects/frozen_bones.png` | 726 | `8e0e200d8b750f7b1a84ef73831f2cca60cff028964258b7824691743aa46c7f` |
| `assets/map/ch3/floor_objects/prop_hellwinter_corpsefield.png` | 1968580 | `e75a55d9a90bdcd7c042dc775a0431bbab13a5f97ab8e2a590d867c7851386cd` |
| `assets/map/ch3/floor_objects/prop_hellwinter_gate.png` | 2300357 | `371401168dce1d225743b2e3ec674c7407998bd9cf0b4fea5a8a320a92273d3f` |
| `assets/map/ch3/floor_objects/prop_hellwinter_ritual.png` | 2776687 | `356d5246f4b6c936ffae0b48755571278db82f81ae49f070892063c62a83277e` |
| `assets/map/ch3/floor_objects/prop_ice_debris.png` | 959680 | `b38ac048b1f11274555d31f103c3b472da224d10b21ee1f3a37412399387dc0c` |
| `assets/map/ch3/floor_objects/prop_ice_gcrack.png` | 467262 | `61fba271d1bc726ff8ae75fe579fc657cde28e940e9914da1365ce2243b296fe` |
| `assets/map/ch3/floor_objects/prop_ice_gdark.png` | 1214038 | `6cda1b697e85dfb5f82bd17b2b5e224edc2c4520d83f6e33546de43b09d3d1eb` |
| `assets/map/ch3/floor_objects/prop_ice_gplates.png` | 1179933 | `dc621edc8f1503c32547a1acfc8fe9a5856f95ce84b804e110b4fd47c71ef51c` |
| `assets/map/ch3/floor_objects/prop_ice_gsnow.png` | 1055847 | `a8f20123f6ca399d0613ac12f3c99c6f6498c4b56a22ecb235fc47b6160cbc09` |
| `assets/map/ch3/floor_objects/prop_ice_ritual.png` | 2020751 | `5cf245288f7a2892eeb31e180aab04b5d400fe032f0e576acf2f37040b48b61a` |
| `assets/map/ch3/ground_hellwinter.png` | 3562028 | `589f7b60139cbbba1f0c0174885c363e3fc6545fddd21988941761bd359636a6` |

## 부록 D. 원문 발췌 인덱스

공통/si10은아래,si11~13은각각_ICE11/12/13·compose11/12/13으로바뀐다. exact본문SHA는 L/source-index-10~13.json에있다. 이인덱스에는관측을위해읽기만한함수도포함되며initStage전체/오브젝트/전투실행을뜻하지않는다.

| symbol | game.html 행 |
|---|---|
| `T` | 16631–16631 |
| `TOTAL_STAGES` | 16642–16642 |
| `CHAPTER_STAGES` | 16633–16641 |
| `_stageTestReq` | 3466–3466 |
| `_mapTestReq` | 3465–3465 |
| `_classicMap` | 3469–3469 |
| `_MAP_QA_MODE` | 3470–3470 |
| `_DIABLO_FIELD_QA` | 3471–3471 |
| `_fdgProjectiveTextureGate` | 4746–4746 |
| `_FDG_RUINED_FOREST_FIRST` | 4747–4747 |
| `MAP_ALL_FLOOR` | 30217–30217 |
| `SPAWN_HOLE` | 31029–31029 |
| `_REG_DIRS_KO` | 60688–60688 |
| `_REG_DIRS_EN` | 60689–60689 |
| `_REG_CH1_KO` | 60690–60690 |
| `_REG_CH1_EN` | 60691–60691 |
| `_REG_FB_TO_REG` | 60694–60694 |
| `stage_index_arrays` | 16658–16667 |
| `stage_face_dungeon` | 16668–16675 |
| `mkRng` | 29556–29559 |
| `_iceC` | 17813–17813 |
| `_iceB` | 17814–17814 |
| `_HELLWINTER10` | 17816–17950 |
| `_MAP_COMPOSE.10` | 18203–18203 |
| `_OBJ_META` | 18392–18426 |
| `_CH_DECO.2` | 17693–17758 |
| `_wantPlateTest` | 3475–3475 |
| `_isFaceMap` | 16675–16675 |
| `_isDungeonMap` | 16676–16676 |
| `_rleEncodeGrid` | 29928–29932 |
| `_buildCh1StartForestRLE` | 29971–29986 |
| `_paintPathDisk` | 29987–29992 |
| `_paintPathSeg` | 29993–29996 |
| `_buildWalkPathRLE` | 29997–30007 |
| `_buildBasinRLE` | 30008–30020 |
| `_buildColRectRLE` | 30035–30041 |
| `_cloneField11` | 30042–30085 |
| `_getFixedMapForStage` | 30135–30147 |
| `_tCarveCircle` | 29037–29044 |
| `_tCarveEllipse` | 29045–29051 |
| `_tCarveRect` | 29052–29057 |
| `_tCarveCross` | 29058–29070 |
| `_tCarveCorridor` | 29071–29117 |
| `_tCaveSmooth` | 29118–29129 |
| `_tBossDistMap` | 29138–29146 |
| `_tseed` | 26473–26473 |
| `_applyCh1StartNorthGate` | 30021–30027 |
| `_applyHellWinterNorthGate` | 30028–30034 |
| `_spawnHoleCount` | 31030–31030 |
| `_cacheExitCenter` | 19793–19793 |
| `genFromTemplate` | 30218–30694 |
| `_regionFbAlive` | 60719–60724 |
| `_regionIdxAt` | 60696–60696 |
| `_regionInit` | 60697–60718 |
| `initStage.start_position` | 31564–31566 |
| `EL` | 14333–14333 |
| `HELL_THEMES` | 16679–16687 |
| `HELL_BOSSES` | 16688–16696 |
| `stage_display` | 16697–16714 |
| `HELL_SPAWN.2` | 30975–30975 |
| `_RANGED_ET` | 30991–30991 |
| `HELL_EL.2` | 30985–30985 |
| `genBossArena` | 30697–30747 |
| `_appendRotatedColParts` | 31685–31685 |
| `_rebuildColObjs` | 31686–31686 |
| `_nearFloor` | 25778–25778 |
| `_filterMapSprite` | 18454–18457 |
| `_edgeEraseMapSprite` | 18458–18467 |
| `_hellWinterFloorImg` | 26531–26544 |
| `_paintHellFloorBaseTone` | 26557–26563 |
| `_paintHellFloorMarks` | 26564–26610 |
| `initMapObjects` | 25735–26472 |
| `_ensureColObjs` | 31687–31687 |
| `isW` | 31711–31711 |
| `canMv` | 31712–31712 |
| `_enterBossArena` | 30749–30814 |
| `rollEtype` | 30993–31016 |
| `rollEl` | 31017–31022 |
| `_regKill` | 60728–60732 |
| `_regionRatio` | 60725–60725 |
| `_regionCheckClears` | 60766–60778 |
| `_regionTick` | 60779–60793 |
| `initStage` | 31533–31670 |
| `nextStage` | 43896–43896 |
| `doWin` | 43897–43921 |
| `_CH_DECO.0` | 17520–17637 |
