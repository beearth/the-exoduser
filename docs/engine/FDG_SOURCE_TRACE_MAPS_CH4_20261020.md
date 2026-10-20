# 4장 7에리어 원본 추적·구현 지시서 — 2026-10-20

작업 `trace-maps-ch4` / 브랜치 `codex/trace-maps-ch4-20261020`. **원본 게임플레이 계약의 추적과 후속 구현 지시서만 제출한다. 맵 구현·Godot 실행·실게임·시각 인수 완료가 아니다.** 사용자가 지정한 목표는 PoE2·No Rest for the Wicked 수준의 깊이·생동감·부분 조명이다. 크기·충돌·스폰·출구·전환 계약은 원문으로 고정하고, 그림·조명·입체감은 Godot 직접 제작의 확장 여지로 분리한다. 웹 화면의 1:1 복제를 완료 조건으로 만들지 않는다.

| 기준 | 고정 값 / 보호 경계 |
|---|---|
| fetch origin/main / 분기 HEAD | `6d987cb8a31d0aadd2b6a8cf1e9a781d1fb76d4d` |
| 마감 main 추가 대조 | `249c26fad989071a94c19128e524ce0bbcb2c8c9` — G/M byte 동일. 맵 관련 CLI·작업판 변동은 §0·§3에 별도 기록, 분기 기준을 소급 변경하지 않음 |
| G = game.html | 65,692행 / 4,195,551byte / SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |
| M = maps_data.js | 103,257행 / 881,757byte / SHA256 `01e74466ea797227d555288592edc959545cb2e44e64e607bf181e7d64c2870e` |
| WT / 원로그 L | `~/exoduser-wt/trace-maps-ch4` / `~/exoduser-wt/_out/trace-maps-ch4/` |
| 제출 | 이 문서 신규1개 + docs/CHANGELOG_SYNC.md 최상단 절. 코드·테스트·공용·설계/LOCK·에셋·저장 변경0 |
| 관측 범위 | 고정 Git blob 정적 읽기와 원문 함수 발췌 Node VM. initStage 전체·initMapObjects·mkEn·브라우저·Godot 실행0 |
| R | HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, branch `codex/mac-live-play-time-main-20261017` / tracked INDEX·WORK 및 index byte 보존 |

## 0. CH2·CH3 형식·선행 결과와 현재 기준

[CH2 문서](FDG_SOURCE_TRACE_MAPS_CH2_20261020.md)의 selector→생성 snapshot→순수 계약→독립 소비자→실제 진행 구조와, [고정 CH3 문서](https://github.com/beearth/the-exoduser/blob/2eafd158a5ba6f804aee6f0f891f8a00a44c0c0c/docs/engine/FDG_SOURCE_TRACE_MAPS_CH3_20261020.md)의 source/실효 배치/제품/시각 판정 구분을 따른다. 기존 문서의 당시 main 미포함·원격 미게시 표현은 그 시점의 기록이다. **이번 main에는 CH1/CH2 추적 문서와 CH2-02 소비자가 있으며, CH3 추적 문서·stage10 도구 확장은 main에 없다.** 참조 브랜치를 이 문서 브랜치로 병합하지 않았다.

| 자료 / 고정 SHA | 읽은 범위·재사용·현재 한계 |
|---|---|
| CH2 trace `18070adfaa99da8e31c5dfcc8264b5d9b0982107` | 원격·main 문서 및 L/trace-maps-ch2 자료. 입력 부재와 빈 배열 구별, 지역/문/별도 arena·source-only와 actual World 분리 |
| CH3 trace `2eafd158a5ba6f804aee6f0f891f8a00a44c0c0c` | L/trace-maps-ch3 보고서·관측 스크립트·부록 형식. 원문 AST/행/SHA, 전체 굴/등록/자원 전수표, 지시서·공용 접점·MAP PRODUCTION REPORT 재사용 |
| CH1-04 `5487245c3d857927cf8c0634d0ea5edb05650340` | 독립 resource/world·원문 query·fixture 수명. 현재 main에도 존재. 실제 Player·전투·전환 완료 근거가 아님 |
| CH2-01 `4013102a82c9ddc3bd7d0f75ba0159438f86d93f` / CH2-02 `77a96cb8d69993f06f6d110a5d92d9be5e3827e3` | main 단일 source exporter의 stage0/1/4·observeNative, 실제 initMapObjects/analytic query 발췌·독립 CH2 World·보고서. stage4 기술 인수와 RETOUCH를 CH4 완료로 옮기지 않음 |
| CH3-01 `fcd7fcaaafd2cb653bc05805233d2823cfa406f7` | 원격 도구는 stage0/1/4/10, stage10 순수 계약·snapshot·보고서. main의 CH2-02 observer와 동시에 보존할 통합 의존. 원격 source-only 완료를 main의 stage10/CH4 runtime 존재로 읽지 않음 |
| P3-003 `919f6a28ab4e64e8a07cd403551777d8dbc77e6a` / main native_regions | 일반4분면·지역 gate 계산과 실제 Main/World/State identity 소유. CH4 실제 fieldboss/적·progression 설치는 별도 인수 |
| WORK_BOARD / FEATURE_INVENTORY | maps 작업은 TRACE-MAPS-CH1 131행·CH2 완료 표기, CH4 같은 문서 소유 진행 행 없음. inventory MAP-14~20(389~395행)은 없음. 기존 담당 파일/행 수정0 |
| 맵 SSOT·GUIDE v0.9 | GUIDE 1,047행 전부 읽음. SSOT index 272~285행의 field200²·로어/런타임 보스 분리·내부 무로딩. CH4 전용 DESIGN LOCK은 index에서 확인되지 않음. 기존 LOCK은 읽기 전용 |
| MAP_LOOK_GODOT_PASS1 / 개조 전략 §8 | 원본 시뮬레이션 계약 유지, 표현은 Godot 제작. 현재 CH1 프로파일·부분 광원/요철/그림자·시차·생동감 체계 재사용 후보. CH4 구성·품질·성능은 미확인 |

참조 ref·파일 목록·원본 코드/보고서 사본은 L/reference-refs.json·reference-sources/에 고정했다. 타 worktree의 미커밋 자료를 읽어 인수본으로 만들지 않았다. 마감 main249c26fa에서 G/M·world/Main/Player·지역·굴·MAP-LOOK·inventory는 기준과 byte 동일했다. 두 맵 도구는 QA-007b의 `cli_paths.mjs` 경로 helper 사용으로 바뀌었으며 stage 지원0/1/4·observer·생성 본문은 유지됐다. 작업판에는 CH-MAP-PIN(기존 hand12·CH2 resource_manifest_pin) 배정 요청이 추가됐다. 그 코드/테스트 소유와 이 CH4 문서 소유는 겹치지 않으며 해당 결함을 이번에 수정하거나 재판정하지 않았다. L/main-drift.json·latest-main-sources/·latest-map-tools.patch가 근거다. 후속 도구 변경은 CH1/CH2/CH3 및 CH-MAP-PIN 담당과 단일 exporter 소유 인수가 선행이며 새 중복 exporter로 우회하지 않는다.

## 1. 최신 원본 행 전수 추적

아래 G/M은 모두 위 main의 고정 blob이다. 선택·크기·START·굴·오브젝트·지형·이벤트·출구·전환을 입력과 실제 소비 경계로 나눈 색인이다. L/source-index-14~20.json의 AST symbol91개씩과 static-source-index.json이 정확한 시작/끝 행·발췌 SHA를 가진다. 적·보스 AI 전체와 피해/QE 집행은 다른 담당 범위다. G 상수의 source-index/부록 E SHA는 AST initializer expression(선언 prefix 제외), static-source-index의 G 전체 선언 SHA는 const/let/var prefix 포함이다. static의 속성별 항목은 해당 value expression, M FIXED_MAPS 정의는 assignment prefix 포함이다. 같은 symbol·행이어도 발췌 byte 범위가 다르면 SHA가 다르므로 두 기준을 교환하지 않는다.

### 1.1 장·에리어·기본 selector·생성·START

| ID / 원본 행 | CH4 실제 계약 |
|---|---|
| S01 / G16631–16713 | T40, CHAPTER_STAGES hell3/startSi14/stages7 → si14~20/floor0~6. STG 공개명 FLAME OF AGONY/화염지대 1~7구역, monLv400·EL.F. boss 순서 화염 악마/불기둥 수호자/용암의 심장/화염 전사/화염 쌍두/불벌레 군주/화염 감옥지기. si20만 isHellBoss=true |
| S02 / G3463–3477,16643–16648 | 빈 URL의 production selector 기준. 기본 빌드 demo는 si0 종료이며 stage/mapTest/editor query는 CH4 자연 부트 성공의 증거가 아님. 전체 initStage 실행0 |
| S03 / G16668–16676,30135–30147 | 대표 face는 si14. `_DUNGEON_SPEC[16]={name:'화산 심장',ready:false}`라 si16도 field clone. plate/특수 우선 gate가 꺼지고 FIXED_MAPS[0]이 있으면 전부 `_cloneField11(si)` 선택 |
| S04 / M6–55, G30042–30085 | 실제 베이스는 FIXED_MAPS[0]:200²·rooms6/corridors5/features3/corridorSpawns2/수동굴9/objs player_start1. CH4는 compose가 없으므로 `[1,40000]` RLE와 `mkRng(si*7919+17)` 굴 지터±18/clamp18..182. CH1 polygon·CH3 basin·다리/용암 길을 추가하지 않음 |
| S05 / G18118–18207 | `_MAP_COMPOSE`에는 0/1/2/3/4/10/11/12/13만. **14~20 compose·handProps는 undefined**다. hand0개라는 완성된 명시배치 배열이나 빈 lm/mega를 창작하지 않는다. 이 부재 때문에 자동 장식/기본 중앙 landmark/unique/scatter가 활성 경로가 됨 |
| S06 / G30218–30334 | `_hasTileRLE` 유효 coverage 검사 뒤 에디터1→runtime floor0, 그 외→wall1. RLE일 때 일반 room/corridor carving·연결검사·통로넓히기 분기는 비실행. room metadata는 남고 뒤 boss room 처리·타입4·pillar/문/출구가 최종 grid를 바꿈 |
| S07 / G30335–30442,30646–30694 | 보스방 연결 방향 scan→게이트 metadata→mouthOff2의 exit3폭·진입3줄×5칸. CH1/si10 전용 북문 재작성은 CH4에서 비실행. final code3=0이지만 bossGate metadata99..101/y5·exit y7·generator의 boss_gate_col@(4020,160) 1개가 있음. tile3 부재를 문/차단체 부재로 읽지 않음 |
| S08 / G30486–30626 | RLE 수동굴→hole_* objs→rooms.spawns→corridorSpawns 순서, 거리²<250000 중복 배제·cap50. 최소6 보완→벽 위 spiral r<15의 tile0 이동→주변11×11 floor0<30 제거→_totalSpawned 확정. 최종94굴은 부록 A. source timer draw 수와 최종 굴 수가 같지 않은 에리어 있음 |
| S09 / G31533–31569 | actors/effects/기존 state 정리→selector→genFromTemplate→start room floor0 탐색(r1..29)→(tile+.5)*T. 모두 START tile100/185→world4020/7420. 이후 자원 full refill·idle/iframes360·KB/poison/slow 등 reset은 실제 Player/State 권위 접점 |
| S10 / G31573–31655 | RLE여서 일반 room/corridor 자동 적·최소80 보완·P근접굴 삭제는 비실행. 안전 반경500·bonfire300ticks/r280. 문지기 후보 etype59/EL.F@(4020,340)는 tile100/8===0일 때만 스폰. 관측 grid의 해당 값은4로 조건 불충족 입력. `_gateGuard` 실제 결과는 전체 initStage 미실행으로 미관측 |
| S11 / G31656–31669,63513 | 최종굴 후 regionInit→cam/pets/cache→initTorchLights→배경큐. CH4의 initWallEyes·initMapObjects는 큐의 별도 단계. si0의 `_tickBgInit(9999)` 즉시완료 예외를 CH4에 복사0. 이미지·object·collision 준비 전 full stage READY 주장 금지 |

### 1.2 7개 에리어 원문 발췌 VM 관측

L/source-audit.mjs는 CH3 관측 방식을 **Git 밖에서만** CH4에 적용했다. 고정 Git blob의 상수·원 함수 본문을 AST로 발췌해 selector→genFromTemplate→정확 START 구문→_regionInit을 평가했다. 원문에 해당 stage의 compose 키가 없음을 AST로 먼저 확인한 후 그 부재 projection을 전달했다. 원 함수의 연산·분기·loop는 바꾸지 않았다. Math.random만 seed20261020의 LCG(uint32 imul1664525+1013904223, /2³²)로 고정했고 원 mkRng/_tseed는 그대로다. 실제 부트 RNG 정책이 아니다.

| 에리어 / si | 원 STG 보스 | 지형 / raw hand | 굴수 | 분모 | NW,NE,SW,SE | timer RNG회 | next si |
|---|---|---|---|---|---|---|---|
| 4-1 / 14 | 화염 악마 | 기본floor / 미정의 | 14 | 1100 | 150,400,350,200 | 14 | 15 |
| 4-2 / 15 | 불기둥 수호자 | 기본floor / 미정의 | 14 | 1100 | 350,300,250,200 | 14 | 16 |
| 4-3 / 16 | 용암의 심장 | 기본floor / 미정의 | 13 | 1050 | 150,300,450,150 | 13 | 17 |
| 4-4 / 17 | 화염 전사 | 기본floor / 미정의 | 13 | 1000 | 250,300,250,200 | 14 | 18 |
| 4-5 / 18 | 화염 쌍두 | 기본floor / 미정의 | 14 | 1100 | 250,300,300,250 | 14 | 19 |
| 4-6 / 19 | 불벌레 군주 | 기본floor / 미정의 | 13 | 1000 | 250,300,250,200 | 14 | 20 |
| 4-7 / 20 | 화염 감옥지기 | 기본floor / 미정의 | 13 | 1000 | 150,300,350,200 | 14 | 21 |


전부200×200/T40/40,000타일, tile0/1/2/3/4=`38986/36/3/0/975`, tile byte SHA256=`5b40eb67c1aa3fd6ad407f9af06db91f549456bcd9c7d91ed31265c5a3a3b87e`. START4020/7420, gate metadata x99..101/y5, exit x99..101/y7/center100,7은 같다. 같은 grid여도 굴 지터/후보 탈락/순서·분모·STG 보스·층 seed가 다르다. 지역 합계는 NW/NE/SW/SE 순서다. x=100 경계는 동측이다. 전 지역 total>0·fbIdx=-1로 CH1 앵글러 요구0.

`hand_props_raw`, `compose`, `gate_guard`는 관측 JSON의 null carrier와 `undefined_paths`로 구분했다. 마지막은 generator/START/region 발췌에서 아직 쓰지 않은 필드라는 의미이며 실제 문지기를 null로 초기화한 initStage 결과가 아니다. 독립 tile-only BFS에서 START→세 exit 연결을 확인했지만 boss_gate_col·자동 props·플레이어 반경·문 권위가 빠져 **실제 종주 PASS가 아니다**.

### 1.3 maps_data.js의 legacy 개별 맵 — 기본 경로에서는 선택되지 않음

M의 개별14~20 정의를 지웠거나 없는 것으로 간주하지 않는다. 아래는 선언된 legacy 크기/메타다. 현재 기본은 S03의 clone이며 si16의 ready=false도 유지한다. FIXED_MAPS[0] 미존재 fallback·ready 승인 변경·QA/특수 mode는 다른 분기다. 선언 크기를 기본 CH4 크기로 바꾸지 않는다. 객체/방 세부 입력은 L/si14~20.json의 legacy_fixed, 선언 행/전체 blob SHA는 static-source-index.json에 남겼다.

| si | 선언 행 | legacy 크기 | rooms | corridors | features | corridorSpawns | objs | RLE 숫자수 / coverage |
|---|---|---|---|---|---|---|---|---|
| 14 | M22851–24664 | 240×240 | 6 | 5 | 2 | 3 | 13 | 1510 / 57600 |
| 15 | M24667–26779 | 250×125 | 7 | 7 | 3 | 3 | 15 | 1702 / 31250 |
| 16 | M26782–30195 | 250×250 | 8 | 7 | 3 | 3 | 18 | 3002 / 62500 |
| 17 | M30198–33629 | 255×255 | 9 | 8 | 0 | 5 | 22 | 2966 / 65025 |
| 18 | M33632–36853 | 260×130 | 10 | 9 | 2 | 3 | 23 | 2710 / 33800 |
| 19 | M36856–40901 | 260×260 | 10 | 9 | 1 | 4 | 24 | 3546 / 67600 |
| 20 | M83183–87051 | 196×166 | 25 | 0 | 0 | 0 | 미정의 | 3070 / 32536 |


### 1.4 오브젝트·자동 배치·충돌 계약

CH4 전용 등록은 `_CH_DECO[3]` 7개(부록 B)이며 그중 large/col6개·scatter1개다. `m_c4p1b`는 prop_a의 sz330/flip1 변형이다. 선언상 pit/fire 이름을 실제 용암 피해·주기적 트랩·발광 완료로 읽지 않는다. hand source가 없으므로 CH3 raw405 같은 수를 CH4에 복사하지 않는다.

| ID / 원본 행 | 소비·충돌·오브젝트 이벤트 경계 |
|---|---|
| O01 / G17487,17519–17808,18392–18426,18468–18488 | retired Set·초기meta77→CH4 raw7 메타 in-place merge·이미지 경로 등록. absent/undefined/null/명시0 보존, alpha/pivot/colSz 등 merge 권위. source dir=collision의 이미지 이름과 collider 역할은 원 col/collision으로 판정. Image 완료/404 fallback/후처리는 실제 callback 영역 |
| O02 / G25735–25806 | 기존 editor objects 보존 필터→MAP_OBJS 재구성·200px hash grid·_visR. 먼저 기존 editor 충돌체는 소환굴에서 `<250+자기 colR`, 시작/보스 중심에서 `<300`이면 제거한다. 그 뒤 자동 배치 hash에는 소환굴 colR200·시작/보스 colR300을 등록한다. 두 단계의 반경을 혼용하지 않는다. _nearFloor는 tile0 또는4, 반경1..9 순서. 정적 metadata나 raw 후보를 최종 MAP_OBJS 수로 세지 않음 |
| O03 / G25807–25852,25875–25884 | lore 최대3의 방별 seed/벽 인접 검사, textIdx=stage*3+loreIdx. breakable은 combat room 조건부1~3·hp3·loot .80mat/.95potion/else none. stage>=5 altar는 Math.random<.6·한 combat room 후보/바닥/거리 gate. CH4는 별도 quest/고정 보상 event를 선언하지 않음 |
| O04 / G25854–25873,32798–32828 | 자동 trap 배치는 **주석 비활성화**. 일반 trap/DOT runtime loop는 남아 있으나 m_c4pit/m_c4fire에 dot·dmgPct/period 설정이 없음. 적/보스 fireZone·스킬 용암을 맵의 2초 불기둥 writer로 대체하지 않음 |
| O05 / G25914–26004 | CH4에는 compose.path/hand가 없어 large 자동 배치 경로. floor0/4 수집, `_tseed(stage*13+7,hell*97+3)`. open field lgBase=min56/max28/trunc(floors/700*(1+min(.85,floor*.22))), lgMinDist760. 실제 side비중은 trunc(lgMax*.35), 나머지 center(주석80%와 구분). 여백·같은type1200·boss/exit/portal400·굴200·주변17² floor>=220 등을 검사 |
| O06 / G26034–26047,26106–26163 | 기본 중앙 landmark=`m_c4p1`, nearFloor(100,100)→(4020,4020) 후보. 별도 unique pool `[m_c4p1,m_c4p2,m_c4brazier,m_c4pit,m_c4fire]`에 seed(stage*71+13,hell*53+7)/최대300시도·minDist880. 등록5가 곧 성공5 보장은 아님 |
| O07 / G26278–26328 | scatter pool=`m_c4crack`; open base=min90/max40/trunc(floors/420), 거리400·START/BOSS300·주변7²floor·동일type1200/최대5 재선택. floor 후보수37,597이면 목표89. 목표 수는 성공한 실효 개수가 아님 |
| O08 / G26329–26370 | 일반 배치 목표=max50/min140/trunc(floors/260). **CH4 normalDeco는 비어 있어 baseDeco7 전체로 fallback**하며 large도 다시 선택될 수 있음. retry8·hash거리/굴200·주변9²floor>=60 등의 실제 조건 보존. “일반 배치는 비충돌 소품만”으로 단순화 금지 |
| O09 / G26054–26081,26372–26418,26420–26472 | CH4에는 hand/painted path 없음; 손배치·off-path 특수 pass는 미선택. hell0/1 자동 벽눈 sprite props pass도 비선택. editor objects 복원→grid wrapping 해제→metadata renderLayer/y 정렬. 최종 render/collider/cache는 후속 실효 관측 의존 |
| O10 / G31682–31712 | object identity/length 변경 때 collision prefilter 재구축. retired/noCol 제외·circle/ellipse/rotated colParts strict 판정. CH4 raw colSz=72/60/70/80/80/50, 그림 flip/keepAR를 임의 wall rectangle로 바꾸지 않음. canMv는 네 corner. gate generic size250→기본 colSz100 산출 역시 별도 유지 |
| O11 / G32829–32853 | interact lore<60/read flag, breakable<50/hp감소→자원/물약 원래 owner, altar<60/used·buff·3자원 refill 흐름. NW 계열 상호작용 담당 접점이며 이번 native 연결/기존 writer 수정0 |

초기 `_dcFloors=37,597`의 산술로 si14 large 목표53·si15~20 목표56, scatter89·일반140이지만 **실효 배치 수·성공률·콜리더 수는 이번 미관측**이다. 전체 initMapObjects를 실행해 seed·선행 editor/gate objects·metadata merge를 동일하게 넘긴 후에만 확정한다. 이미 main에 있는 CH2-02 `observeNative`와 source resource 추출 구조가 그 접점이다. 표현을 바꾸더라도 게임플레이 collider/상호작용 footprint는 이 실효 계약과 별도로 고정한다.

### 1.5 생동감·조명·지형 표현의 원문 근거

| 원본 행 | 확인한 범위 / Godot 표현과 분리 |
|---|---|
| G16683,26475–26494,26524–26529 | palette w#3e1c22/f#180a0c/ac#ff8844·EL.F, ground `assets/map/ch4/ground.png?v=20260816-detail`, boss palette. 현재 전장 정체성의 근거이며 같은 Canvas 필터/광원 수치를 요구하는 규정 아님 |
| G26570–26610 | hell3의 저밀도 주황 radial ground marks. 시각용 그림이며 runtime0 타일에 용암 피해를 부여하는 코드가 아님. RLE1→runtime0과 설계의 높이0=용암을 혼동 금지 |
| G25619–25645,25680–25731 | initTorchLights의 `_torchCnt=0;return`, initSwayObjects/_initEyes/initGlowObjects 초기 return. 함수가 배경큐에 있다는 이유로 횃불·흔들림·glow가 실제 생성됐다고 세지 않음 |
| G25668–25677,31664,52079–52091 | **CH4 전용 initWallEyes는 활성 함수**: hell===3, max8·wall값>=1/adjacent tile0·_tseed(tx+400,ty+400) gate<.05. 원문을 별도 VM 호출해 같은 grid의6개 상태를 관측(부록 D). radius/눈동자·blinkInterval3,000~8,000ms; renderer는 sheet 준비·화면 cull·blink phase>.95 제외·8방향 frame/radius*3/alpha.85. 초기화 데이터 관측과 실제 깜빡임 화면은 별개 |
| G25654–25665 | 공통 `assets/map/eye_bloodshot_8dir.png`의 40×40 frame/8방향 mapping. 소스 byte는 부록 C. main Godot 같은 경로 파일/해당 world identifier는 미발견. 이미지 자체는 9프레임 시트라는 원 주석과 방향별 사용을 구분 |
| G4638–4695 | 플레이어·보스·실제 화염 fireZone·일부 generic altar의 광원 수집, quality/lighting gate. static light 목록에 m_c4brazier/fire/pit 분기가 없어 이름만으로 포인트 광원 완성을 추정하지 않음. boss/스킬 fireZone을 맵 트랩으로 승격0 |
| G31664–31668,63513 | 배경 작업 큐와 재초기화. stage 교체/실패/cold load가 시각 모듈 수명·collision 준비와 맞물린다. 순수 source snapshot의 READY와 실제 GPU/texture/native stage READY는 별도 |

CH4 등록7참조/고유6파일 총2,389,001byte와 ground1파일390,666byte는 main의 대응 Godot blob과 모두 동일했다. 공통 eye 시트4,125byte는 소스에 있으나 `godot/assets/map/eye_bloodshot_8dir.png`는 없다. 파일 존재·해시 검사는 image decode/GPU warm/최종 scene closure/실제 표현 인수가 아니다. 이 작업은 자산 생성·변환·복사0이며 대형 에셋 폴더를 checkout하지 않고 Git blob으로 대조했다.

### 1.6 스폰·지역·문·arena·클리어·에리어 전환

| ID / G 행 | 반드시 보존할 게임플레이 계약 |
|---|---|
| F01 / G30977–31022 | CH4 HELL_SPAWN은31개 [etype,weight](부록 B). 공통 ranged Set25개 중 교집합이 선택에 관여. 50% ranged 가중 branch, 나머지 최대12회 nonranged CDF→fallback2. rollEl은 EL.F .45 선행편향 뒤6원소 균등 선택이라 “전체45% 화염”으로 단순화 금지 |
| F02 / G31029–31030,35636–35693 | size<=.3=S50, <=.5=M100, 그 외 L100. CH1 si0 할인8/15 적용0. _gameFrame<120 중지→거리²<4,000,000 trigger→다음 loop90ticks delay→interval trunc(900/total), alive>=700이면CD30. 후보120+random300+size150·30회 isW(skipBone)→spiral<20→중심 fallback. mkEn 거절도 _spawned 증가·reviveIframes15·완료굴 제거/진행곡선 보존 |
| F03 / G31573–31655 | room/corridor spawn marker는 RLE에서 직접 적 스폰이 아니라 굴 입력으로 소비된다. etype59 문지기 hp4배/atk2배/r1.4배/poise80·호위4~6/주변8~12는 tile0 gate 안쪽만. 관측tile4 조건과 실제 actor 실행 미확인을 구분 |
| F04 / G60688–60732,60766–60793 | mw/mh>=180이면4분면. CH4 방위명·fbIdx=-1, kill은 _homeX/_homeY 우선·ib 제외. 지역분모는 최종굴 합, 문지기 +.10은 gate지역만, ratio>=.8−1e−9와 cleared latch. 15tick throttle·입장 히스테리시스/배너 권위 보존 |
| F05 / G41868–41921 | CH4는4지역/4개 clear→bossUnlocked. si0의 _fbDone 추가 요구0. 작은맵만 전역80% fallback. 출구tile 밟음+bossAlive+비arena+unlock일 때 bossLoadPhase1. region clear·gate·stageCleared를 하나의 flag로 합치지 않음 |
| F06 / G30697–30814 | hell3→arena type3 **팔각형**128×108, CH4의7보스 공통. hw62/hh52/cut19·entry64/103·boss64/54·exit64/1은 처치 전벽. grid1/4/5=1613/11831/380, byte SHA `d3db10e3eaaff06b4f7fd7686daca1655c8dca3cd2dcf2147ccf00eb0b9f197f`. field200²와 별도·기둥 없는 arena. field 백업/남은 적 kill합산·actor/holes/obj 정리 순서 유지 |
| F07 / G41782–41849 | 로딩50/130/50/100ticks 단계. 30frame poll에서 boss 및 revive 대기 종료 확인→bossAlive=false·clearTime 고정→chest·arena exit3폭 개방. 보스 부활/최종 사망은 보스 담당 권위 |
| F08 / G41917–41957,43896,63657–63664 | 보스 사망 뒤 exit→stageCleared/+10SP/결과 UI→사용자 다음 진행→showStageTransition→nextStage. **14→15→16→17→18→19→20→21**(5장 시작). si20은 게임 전체 승리 아님, doWin은 stage>=35. 90%kill은 타임어택 기록조건이며 gate/clear에 새로 추가하지 않음 |
| F09 / G30149–30215,30646–30675,41857–41867 | 공통 zone portal6/zone cache 경로는 있으나 기본selector의 G._zones=null, clone template에 portals 없음. 실제 CH4에 내부 zone 로딩/새 save serialization이 있다고 가정0 |
| F10 / G31669,35877–35881,43872,43899 | stage/boss/death/victory BGM은 별도 sound 담당 접점. 맵 snapshot/preview에서 dummy audio READY·중복 State·가짜 kill로 actual progression을 채우지 않음 |

## 2. docs 불일치·미확인 표

설계/LOCK/기존 문서를 고치지 않고 표로 전달한다. source의 현재 동작과 향후 시각 목표·새 게임플레이 제안을 구분한다.

| docs 위치 | 기록 / 목표 | 현재 원본·관측 | 처리·보호 |
|---|---|---|---|
| EXODUSER_MAP_BIBLE_v3 (1).md:205–229 | 7에리어·화염 원소, 크기250/300/350/350/300/350/300²와 vert/horiz/grid | 7·EL.F는 일치한다. 기본은 모두200²·같은 RLE floor clone이다. 상세 에리어명은 docs 콘셉트명이고 STG는 화염지대 N구역이다 | source 크기·동선을 고정한다. 옛 크기로 확대해야 원본 이식이라는 지시를 하지 않는다 |
| 같은 문서:222–237 | 용암 낙하 즉사/큰 피해·주기2초 불기둥·화염벽·스윙 체인·좁은 다리 | si16 ready=false, CH4 compose 없음. 등록에는 충돌/장식이 있고 자동 trap 배치는 주석이다. 환경 writer의 실제 연결은 미확인이다. 문서 안에도 즉사/큰 피해 표현 차이가 있다 | 새 피해·낙하·이동 기믹을 임의 구현하지 않는다. 연출만 변경하거나 별도 게임플레이 승인·owner 추적이 필요하다 |
| 같은 문서:248–261 | 용암의 심장(3)/화염 쌍두(5) 미니보스·최종96px·대성당형 기둥없음 | STG는 각 에리어의 정식 boss slot, si20은 최종이다. CH4 arena는 모두 팔각형128×108·기둥없음 | 로어/런타임 매핑 양쪽을 보존한다. 기둥없음은 일치하고 형태 차이는 보고한다. 보스 HP·모션·수치 변경0 |
| 맵구성_지옥전체.md:6–17,26,37–39 | 한 번의 하강·용암 벌판 중앙 거대 화로, 2~7장 구역 구성 없음 | 기본 CH4 중앙 landmark는 m_c4p1, 화로 m_c4brazier는 자동/unique 후보다. 지형은 openfield다. SSOT index275는 기존 선형순서를 수직상승으로 재해석한다 | 상하 세계 서술은 docs 간 차이이며 진행14→21은 불변이다. 거대 화로 공간 구성은 별도 MASTER에서 다루고 고정 source 좌표나 확정 collider로 날조하지 않는다 |
| _MAP_SSOT_INDEX.md:272–285 | runtime field200² LOCK·기존 BOSS 매핑·내부 무로딩 | 기본 CH4 field 크기는 일치한다. 별도 arena는128×108이며 CH4 구역별 LOCK은 해당 index에서 미확인이다 | 게임플레이 크기와 큰 세상 연출 범위를 분리한다. 구역 LOCK 부재를 이유로 새 collision을 설계하지 않는다 |
| MAP_RUNTIME_ARCHITECTURE.md:113–125 | runtime1만 solid, walkable은 prop/bone/hill도 포함. 옛 행 번호와 tile4 fallback 서술 | 현재 G31711의 판정은 일치한다. CH4 tile4=975·arena4/5는 실제 floor다. editor0=용암→runtime wall1 decode의 raw/runtime 구분이 필요하다 | 현재 G행과 함수명을 기록한다. tile0을 새 용암·높이0으로 해석하지 않는다. code3=0이어도 gate metadata/collider를 보존한다 |
| REGION_CLEAR_GATE_20260930.md:3–61 | 4분면 각80%·gate 지역 문지기10%·최종 굴 뒤 초기화 | 공통 계약은 일치한다. CH4는 fbIdx−1·모든 분모 nonzero다. 문지기 후보 tile4로 항상 스폰된다는 보장은 없다 | 4지역과 7에리어를 구분한다. CH1 앵글러 추가·강제 gatekill·분모 보정0 |
| GUIDE v0.9:§1–§2 | 사각형 전체 필드 뒤 scatter 금지·보통6~10 visual region | 원본은 generic200²/자동 배치·게임플레이 지역4개다 | source 사실을 지우지 않는다. visual MASTER에서6~10개 구성층을 제안할 수 있지만 gameplay4지역·동선/굴/콜리더는 불변이다. 실제 가독성·품질은 미확인이다 |
| MAP_LOOK_GODOT_PASS1_20261020.md:80,94 / 개조 전략§8 | 시각1차 RETOUCH·현재1-1 전용·새 장 표현 직접 제작 | main DATA_FILE은 map_look_ch1.json이고 props/chunk 경로도 CH1 고정이다. CH4 프로파일·열빛·실창·성능 인수는 없다 | CH1 광원37/근경27 등을 CH4 수치로 복사하지 않는다. §4에서 확장·품질 gate를 별도로 다룬다 |
| CH2/CH3 추적 문서§0·§3 | 당시 CH2-02 원격 미게시·과거 main 지원 범위 | 이번 main에는 CH2-02·observeNative가 있고 CH3-01은 원격 단계다 | 오래된 미게시 상태를 복사하지 않는다. 실제 main과 후속 후보를 분리하며 기존 문서는 수정하지 않는다 |

## 3. 현재 Godot main: 이미 있는 의존과 빠진 소비자

아래 행 번호는 분기 기준6d987cb8a다. 마감249c26fa에서 게임플레이 관련 파일은 동일하고 두 도구의 import/CLI wrapper 행만 달라졌다. `cli_paths.mjs`의 isInsideRoot/isMatchingSnapshot/isDirectExecution을 보존하며 OS별 직접 실행/출력경로 판단을 옛 문자열 비교로 되돌리지 않는다.

| 실제 최신 main 파일 / 위치 | 재사용 가능한 것 / CH4에 빠진 것 |
|---|---|
| godot/tools/export_world.mjs:1–15 / engine/fdg/map-source-adapter.js |CH1_1_PRODUCTION stage0 제품 export. 제품map.json 교체 경로이므로 이번 실행0. CH4순수JSON을제품맵으로승격하지않음 |
| godot/tools/export_ch1_area_source.mjs:31–34,85–111,150–162,172–198 |stage0/1/4·명시root/output·출처/undefined·snapshot뒤observeNative존재. stage14·CH4schema/데코3·compose부재/CLI의hand_props_raw.length대응은없음. 원격CH3-01 stage10확장과mainobserver보존필요 |
| godot/tools/export_ch1_area_resources.mjs / export_ch2_area_resources.mjs |정확initMapObjects·metadata/prefilter/isW/canMv/LOS·동일VMobserver재사용접점. CH4자동large/unique/scatter/normal fallback·선행gate/editor상태·최종분모/프로파일별실효데이터관측없음 |
| godot/port_modules/ch1_map_source/stage1_contract.gd / ch2_map_source/stage4_contract.gd |기존정수/해시/literal·Shared.same/동일raw참조/NOT_READY형식. CH4snapshot/순수계약없음. CH4시각을CH2HAND105/PHYSICS수치로강제0 |
| native_ch1_area_resources/world.gd / native_ch2_area_resources/world.gd |독립source-reader/analytic props·타일Physics/fixture수명 재사용가능. 현재si1/si4한정. CH4실제Player/상호작용/스폰/지역/보스·전환READY없음 |
| world.gd:22–23,336–342,661–667,745,905–971,1109이후 |제품map/encounters는stage0. CH4등록7과원화경로는이미publication에있음. Godot7원화blob동일. 등록존재≠4장맵선택/배치/렌더/종주인수. bakedpublication은stage0·64청크한정 |
| world.gd:3160이후 / player.gd·factory |타일/prop query·4corner・실Player이동/적등록owner가존재. CH4source collider/질의결과·미지원etype factory·actual G/P와stage14수명연결은별도인수. 같은그림테두리로collision생성0 |
| native_spawn_hole_system.gd:37,214,333,435,518이후 |STAGE=0·특정actor factory·현재G배치/수거owner. CH4분모·31etype/EL.F편향·상한/owner종료/지역kill귀속 인수없음. 상수0만14로교체금지 |
| native_regions.gd:42–58,81–106,126–159,246이후 |일반분면/장명/kill/clear계산, actualMain/World/Player/State identity. CH4최종굴·actualstage에반영됐다는증거없음. 계산가능성과연결완료는별도 |
| main.gd:106,238,265–280,1004 / native_source_new_run_state.gd |부트·player/world·source state·굴→지역·MAP-LOOK설치·native시계접점은있음. 장별field/arena교체·sourceowner교체/종료·리필·clearUI·14→21전환은후속통합권위 |
| native_map_look.gd:13–21,63–114 / native_screen_lighting.gd |CH1DATA_FILE·고정props/chunks·부분광/요철/그림자·시차/생동감/효과광. CH4입력/ground/자동배치props/wall-eye·열기profile·초기화실패시원복·성능/가독성인수없음 |
| 공통eye sheet / sound·적·보스 담당 |원본sheet는존재하나같은Godot경로없음. CH4보스/31etype전체·BGM실제전환은이번미검수. 더미노드/가짜HP·kill·항상READY로대체0 |

### 3.1 실제 검산과 원로그

관측/source-audit-03 및 독립 replay는 각각 exit0/stderr0이다. 각 si JSON 전체 깊은 비교, 타일길이/byte SHA·타일총계·굴분모/독립분면합·부재mask·START/gate/initial collider·문지기후보tile4·팔각arena·tile-only연결·wall-eye6·scope·자원byte를 **94항목/차이0**으로 검산했다(L/audit-checks.json). 이는 source 정적/VM 검산이며 게임 테스트 PASS 수가 아니다. 초기2회도 관측 성공이고 generator_objects·wall_eye 관측필드를 추가한 후 최종/재현본으로 고정했다. 초기성공을중복합산하지않았다.

L에는원문전체·maps_data정의행색인·source-index91symbol×7·si14~20.json·area-summary·replay·고정참조·docs검색·byte대조·보존검증을남겼다. 제품/테스트/원본수정0, Godot0·브라우저0·GUI0·실게임0·시각캡처0·FPS0·saveIO0이다. Godot 실행이 없어 pgrep 대기 분기/override 작성도0. 기존회귀·선재로비8실패/맵9실패/CH3layout1실패를이번결과로재판정하지않는다.

## 4. 표현 확장 여지 — 게임플레이 불변의 별도 제작 범위

아래는 사용자 방향을 구체화한 **후속 제안**이며 source에 이미 구현됐다는 뜻이 아니다. 깊이/생동감/부분조명 수치는 실제카메라/전투/성능검수 전 미확인이다. 새hazard·낙하·대미지·스윙 이동·플랫폼·막힌길·출구이동은표현확장에끼우지않는다.

| 제작 축 | CH4 제안 / 보존·인수 조건 |
|---|---|
| MASTER / world depth |field200²·START/EXIT/최종holes/지역십자/collider를overlay로잠그고, PLAY/RIM/OUTER의원경화산·검은암벽·사슬질량·용암하부깊이를구성. 원문generic사각field+scatter는완성목표가아님. 실제walkable을깎거나그림계단을collision으로만들지않고8카메라의차이를설계 |
| LARGE→MEDIUM→GROUND |화산암mass/거대한화로/쇠사슬anchor를비보행/시각층에서계층화하고큰접합부터연결. charredrock·열변색/재·접지그림자가바닥과붙게제작. 랜드마크는원col/interactionfootprint를보존한표현과시각전용mass를구분. objectcount나CH1청크64를목표로삼지않음 |
| 부분 조명 |차가운재그늘과국소적인따뜻한화로·균열/불기둥광의대비, 플레이어/전투광이바위옆면과바닥요철에닿는구성. 현재m_c4fire/brazier는표시이름일뿐auto광owner없음. 새CH4profile·visible/neighbor선택·동시광예산과on/off성능은측정후확정, CH1반경/개수복사0 |
| 생동감 |원문벽눈6개데이터를현대적표현의관측근거로삼고, 화로불씨·재·국소연무·기포/열미세왜곡·사슬미세흔들림을시각전용으로제안. 입력/적AI/RNG/스폰tick과분리한표시시계, pause/재입장/종료cleanup·노드/texture누수·가림을검수. 시트부재를임의빈그림READY로대체0 |
| 원근/가림 |전경사슬/암석·어두운열안개·원경굴곡의약한시차, 플레이어·적·탄막위전경은가림완화/고스트정책필요. 지도/조준/loot/hit-query좌표는world그대로. 투명도/커버리지/스크롤seam의수치는후속검수로확정 |
| 7에리어 변화 |docs명칭을시각구성의workinglabel로만사용: 입구의낮은열→불기둥빛기둥→심장부원경화로→검은소굴→추격전가독성→동굴사이드질량→감옥관문압축과arena해방. 실제화염트랩/좁은다리/추격스폰을새로추가한다는지시가아님. source굴/출구/동선은각snapshot대로 |
| 인수 |GUIDE순서 MASTER→OUTER MASS→MEDIUM→GROUND→PLAYABLE→LANDMARK→SMALL→CAMERA→TECH. 8카메라 START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT, 실제Player/다수적/탄막/패링색/loot가독성·광원ON/OFF·pause·입출구재진입·cache수명·GPU/성능별도인수. 자동source검산≠VISUAL PASS |

## 5. CH4-01부터 작은 구현 단위 목록

후속배정의제안이며이번구현0. 순수원본→실효gameplay→독립소비자를먼저확정하고표현은§4의별도인수로진행한다. 공용Main/State/World·다른담당/공유추출기소유권미인수면필요위치만보고하고BLOCKED다. 같은gridSHA를이유로다른에리어의굴/seed/boss를복사하지않는다.

| 단위 | 범위 | 산출·검수 | 의존·완료 경계 |
|---|---|---|---|
| CH4-01 | si14 source snapshot·순수 계약 | 인수된 단일 exporter stage14 + si14.json/stage14_contract·검사. 실제 제품 미연결 | 공유도구 소유 인수, §5.1 지시서 |
| CH4-02 | si14 실효 배치·독립 소비자 | CH2 observeNative/원 initMapObjects·충돌을 발췌하고 신규 export_ch4_area_resources/native_ch4_area_resources/world·preview 후보. raw7을 실효개수로 치환0 | CH4-01·CH1/CH2 reader/World API 인수. 실제 Player/스폰 미인수면 fixture 범위 |
| CH4-03 | si15 source·순수 계약 | 동일 exporter stage15/si15.json/stage15_contract·전용 검사. 굴14/1100·지역350,300,250,200·불기둥 수호자 | CH4-01 방식, 불기둥 지대(문서명). si16 ready=false/si20 다음21·isHellBoss 보존 |
| CH4-04 | si15 실효 배치·독립 소비 | CH4-02의 CH4 전용 reader/World에 stage15 입력을 확장. 해당 stage 자동 seed·메타/원 질의·START→EXIT·수명 검수 | 바로 앞 source 단위. 다른 stage·공용0줄. 전체 배치가 다름을 검사, 시각은 §4 별도 |
| CH4-05 | si16 source·순수 계약 | 동일 exporter stage16/si16.json/stage16_contract·전용 검사. 굴13/1050·지역150,300,450,150·용암의 심장 | CH4-01 방식, 화산 심장(문서명). si16 ready=false/si20 다음21·isHellBoss 보존 |
| CH4-06 | si16 실효 배치·독립 소비 | CH4-02의 CH4 전용 reader/World에 stage16 입력을 확장. 해당 stage 자동 seed·메타/원 질의·START→EXIT·수명 검수 | 바로 앞 source 단위. 다른 stage·공용0줄. 전체 배치가 다름을 검사, 시각은 §4 별도 |
| CH4-07 | si17 source·순수 계약 | 동일 exporter stage17/si17.json/stage17_contract·전용 검사. 굴13/1000·지역250,300,250,200·화염 전사 | CH4-01 방식, 화염 악마 소굴(문서명). si16 ready=false/si20 다음21·isHellBoss 보존 |
| CH4-08 | si17 실효 배치·독립 소비 | CH4-02의 CH4 전용 reader/World에 stage17 입력을 확장. 해당 stage 자동 seed·메타/원 질의·START→EXIT·수명 검수 | 바로 앞 source 단위. 다른 stage·공용0줄. 전체 배치가 다름을 검사, 시각은 §4 별도 |
| CH4-09 | si18 source·순수 계약 | 동일 exporter stage18/si18.json/stage18_contract·전용 검사. 굴14/1100·지역250,300,300,250·화염 쌍두 | CH4-01 방식, 지옥 사냥개 터(문서명). si16 ready=false/si20 다음21·isHellBoss 보존 |
| CH4-10 | si18 실효 배치·독립 소비 | CH4-02의 CH4 전용 reader/World에 stage18 입력을 확장. 해당 stage 자동 seed·메타/원 질의·START→EXIT·수명 검수 | 바로 앞 source 단위. 다른 stage·공용0줄. 전체 배치가 다름을 검사, 시각은 §4 별도 |
| CH4-11 | si19 source·순수 계약 | 동일 exporter stage19/si19.json/stage19_contract·전용 검사. 굴13/1000·지역250,300,250,200·불벌레 군주 | CH4-01 방식, 불벌레 동굴(문서명). si16 ready=false/si20 다음21·isHellBoss 보존 |
| CH4-12 | si19 실효 배치·독립 소비 | CH4-02의 CH4 전용 reader/World에 stage19 입력을 확장. 해당 stage 자동 seed·메타/원 질의·START→EXIT·수명 검수 | 바로 앞 source 단위. 다른 stage·공용0줄. 전체 배치가 다름을 검사, 시각은 §4 별도 |
| CH4-13 | si20 source·순수 계약 | 동일 exporter stage20/si20.json/stage20_contract·전용 검사. 굴13/1000·지역150,300,350,200·화염 감옥지기 | CH4-01 방식, 감옥지기의 관문(문서명). si16 ready=false/si20 다음21·isHellBoss 보존 |
| CH4-14 | si20 실효 배치·독립 소비 | CH4-02의 CH4 전용 reader/World에 stage20 입력을 확장. 해당 stage 자동 seed·메타/원 질의·START→EXIT·수명 검수 | 바로 앞 source 단위. 다른 stage·공용0줄. 전체 배치가 다름을 검사, 시각은 §4 별도 |
| CH4-15 | CH4 대표 시각 vertical slice / 7에리어 profile | §4 MASTER→OUTER MASS→GROUND부터, 독립 소비자와 실제 CH4 props/굴/ground를 읽는 전용 look 후보·8카메라/전투 가독성·ON/OFF 성능 | CH4-02 이후 대표1에리어부터 가능. 공유 native_map_look 변경은 소유 인수. source gameplay 불변 |
| CH4-16 | 실제 actor·굴·지역·문·arena 설치 | 각 실제 G/P/world identity·31etype factory·홀수명·kill귀속·4/4→출구→별도 팔각arena·보스/revive·출구 | 권위 인수 전 HOLD/BLOCKED. dummy actor/가짜 kill·항상 READY 금지 |
| CH4-17 | 에리어14→21 전환·재입장·결과 | 명시 stage lifecycle/clear UI·BGM/HUD·입장 refill·실패/사망/재시작·종료 cache 정리·기존 save 보호 | CH4-16·Main/State/Player/sound owner. 공용 줄·위치 확정 전 HOLD |
| CH4-18 | 7에리어 실제 플레이·시각 인수 | 실제 Player/다수 적/탄막/패링·loot/region·보스·다음장 종주, 8카메라×7 및 광원 ON/OFF·성능·재입장 검수 | 원문 동등성/기술/실전/시각을 별도 판정. 미완 범위를 PASS로 합치지 않음 |


### 5.1 1번 CH4-01 — si14 원본 snapshot·순수 계약 구현 지시서

| 항목 | 바로 실행 가능한 후속 지시 |
|---|---|
| 목표 / 비목표 | si14의 읽기 전용 source snapshot과 순수 계약만 만든다. 실제 Main/World/Player/적/문/보스·MAP-LOOK 설치는 0이다. runtime_bound/full_stage_ready/visual_verified=false를 유지한다. 원화는 byte 참조만 하며 제품 복사·신규 미디어 생성은 하지 않는다 |
| 기준·의존 | fetch 후 최신 main의 원본 SHA를 재확인한다. 현재 main 단일 exporter는 0/1/4+observeNative를 지원한다. 원격 CH3-01 fcd7fcaa의 0/1/4/10 확장은 별도 의존이다. 후속 기준에서 둘 다 인수·통합됐는지 확인한다. 마감 main249c26fa의 QA-007b cli_paths helper도 보존하고 CH-MAP-PIN 담당과 exporter 소유 충돌을 확인한다. 도구 담당의 stage14 확장 승인이 없으면 BLOCKED다. 이전 파일 전체로 덮어 observer/stage10을 잃지 않는다. 선행이 main 미반영이면 정확한 SHA·정상 통합·의존을 기록한다 |
| 수정 허용 후보 | 인수된 `godot/tools/export_ch1_area_source.mjs`의 stage14 선택/schema/CLI/부재 처리만 수정한다. §6의 공용6파일·제품 map.json/encounters.json·기존 snapshot·도구 소유자가 승인하지 않은 hunk는 0줄이다. 다른 stage 변경이 필요하면 소유 범위를 먼저 확정한다 |
| 신규 후보 | `godot/data/ch4_map_source/si14.json`, `godot/port_modules/ch4_map_source/stage14_contract.gd`, `test/fdgCh4Stage14Source.test.mjs`, `godot/tests/test_ch4_01_stage14_source.gd`와 자기 UID2·보고서. 경로/API는 후속 제안이며 이미 있는 제품 파일이 아니다 |
| 추출 closure | G16631–16713·M6–55·G30042–30085/30135–30147/30218–30694·정확 START31564–31566·region60697–60718을 사용한다. _MAP_COMPOSE 전체 키/행/SHA를 AST로 읽어 14 부재를 증명한 뒤 해당 부재 projection을 사용한다. mkRng/_tseed/원 함수의 분기·연산·순서는 그대로다. genGauntlet/QA map을 대신 선택하지 않는다 |
| 구체 도구 접점 | 분기 기준의 31–34행 support gate(마감 CLI helper import로 +1행), 85–111행 authored/chapter/deco 선택·generated capture, 128행 이후 장별 refs/schema, 150–162행 provenance/observeNative, 172–198행 CLI 허용·출력 summary. stage14는 hell3/chapter4/rawdeco3다. **expression(_MAP_COMPOSE,14)의 missing-property throw와 CLI hand_props_raw.length 직접 접근을 부재 계약에 맞게 처리한다.** []로 메워 통과시키지 않는다. 기존 0/1/4 및 인수된 10 출력·observeNative의 의미·byte 회귀를 검사한다 |
| CLI | `node godot/tools/export_ch1_area_source.mjs <explicit-source-root> <explicit-output-json> --stage 14 --seed 20261020`. 기본 sourceRoot=R을 두지 않는다. root 안 출력은 godot/data/ch4_map_source/si14.json만 허용한다. 외부 명시 JSON 이외의 기존 타 schema/다른 stage/제품 map·symlink 조상(끊긴 link/junction 포함)·잘못된 seed·미지원 stage는 쓰기 전에 거절한다. 기존 CLI 보호를 완화하지 않는다 |
| schema / 출처 | 제안 `exoduser.ch4-area-source.v1` / stage14. source.main_sha와 extraction_head를 분리한다. game/maps 파일 SHA·symbol file/line/end/SHA·selector 문장을 기록한다. §1의 hash 발췌 범위를 함께 읽는다. 원본 SHA가 바뀌면 재관측·재인수하고 옛 기대값에 맞추려고 원본을 변경하지 않는다 |
| grid / 시작·문 | 200²/T40·40000·0/1/2/3/4=38986/36/3/0/975·tile SHA5b40eb67…b87e. template 초기 RLE[1,40000]와 최종 grid를 구분한다. START tile100/185→world4020/7420. gate99..101/y5 metadata·exit/y7·generator boss_gate_col4020/160·문지기 후보100/8 tile4를 보존한다. code3=0을 고치지 않는다 |
| spawn / region | si14 최종14굴/1100·NW150/NE400/SW350/SE200. 부록 A.1의 모든 좌표·size/room/count·순서·timer를 보존한다. 원 _regionInit의 4지역 모두 cleared=false·fbIdx−1·gate 분면과 경계를 검사한다. seed20261020/draw14/final3323445034·timer600+unit*60은 재현용 관측이며 자연 부트 RNG 정책과 구분한다 |
| 부재·등록·참조 | compose·hand_props_raw·gate_guard의 undefined_paths를 null carrier와 함께 보존한다. CH4 raw7/초기 meta77·등록7참조/고유6파일+ground1의 path/byte/SHA를 기록한다. 기본 입력 파일은 game/maps+원화7=9개다. 전체 scene closure로 확대하지 않는다. generator의 실제 gate objects를 누락하거나 새로 만들지 않는다 |
| ambient 분리 | 이번 trace의 initWallEyes6개는 명시 선택 관측으로 함수/상수 pin·raw 상태를 별도로 저장할 수 있다. 원문 frame40/8방향/시트 참조와 scope를 명시한다. 미선택이면 NOT_OBSERVED로 남기며 부록 D를 새로 관측한 척 붙이지 않는다. 추가 image hash는 별도 ambient reference이고 기본9개 입력과 구분한다 |
| scope | source_snapshot_only / save_access0 / init_map_objects_executed=false / final_MAP_OBJS,effective_prop_positions,prop_colliders=NOT_OBSERVED. raw7등록·large 목표53/scatter89/일반140을 실효 개수로 저장하지 않는다. gate_guard undefined를 실제 null 생성 결과라고 말하지 않는다 |
| 순수 API | 기존 CH1 stage1의 integer/hex/literal와 CH2 Shared.same을 재사용한다. read_area/validate_area는 READY value=원 raw 동일 참조/scope, NOT_READY reason/raw 동일 참조·최상위 value 없음이다. IO/Node/RNG/clock/노드/State/저장쓰기·입력 보정은 0이다. Node는 파일 byte를 검증하고 순수 계약은 명시 pin/구조를 검증한다 |
| 독립 Node 검증 | 최신 원문 AST→selector→generator→START/region 전체 깊은 비교, tile SHA·모든 굴/분모/분면/region·seed/timer·메타7/원화 byte/부재 mask·출처 범위를 검사한다. 같은 seed 재현, CLI 쓰기 전 거절, 기존 0/1/4/(인수된10) 전체 재추출 비교를 수행한다. observer 없는 결과를 보존하고 snapshot 뒤 observer 변경이 capture에 역전파되지 않는지 검사한다 |
| Godot 순수 검증(후속) | 실제 JSON·원 raw 동일 참조·반복·입력 불변을 검사한다. 누락 출처·wrongstage/null·tile39999·holes 순서/size/room·분모/경계·부재의 [] 치환·asset pin·허위 runtime READY를 거절한다. 실제 Main/World 생성은 0이다. test_contracts·기존 CH1/CH2/인수 CH3 순수 회귀는 각 파일 격리 상수를 사용한다 |
| 격리·하니스 | 제안 userdir는 `EXODUSER-ch4-01-Isolated-20261020`. 후속 Godot의 매 실행 전 `pgrep -f "Godot.app/Contents/MacOS/Godot" \| wc -l`이 2 이상이면 30초씩 대기·재확인한다. UTF-8 임시 파일 또는 모든 출력 조각 join·node 경로 인자·명시 source-root/source-game을 사용한다. override 작성이 필요한 후속 하니스는 해당 지시의 finally 정리 규칙을 따른다. 이번 문서는 Godot0이다 |
| 완료·인수 | 신규 Node/Godot 실제 결과·원본/제품/타 담당 불변·정상 훅·경로 지정 staging·자기 branch push/원격 SHA·DONE/WT 정리를 제출한다. 순수 READY는 CH4 제품 맵/실전/화면 승인이 아니다. 기존 선재 실패를 제외·skip·가짜 PASS로 합산하지 않는다 |

## 6. 공용·다른 담당 접점 — 이번 모두0줄

| 현재 파일·위치 | 후속에 필요한 접점 / 선행 권위 |
|---|---|
| export_ch1_area_source.mjs:31,85–111,150–162,172–198 |CH4-01의유일한공유도구후보. CH1/CH2/CH3소유인수와0/1/4/(10)회귀선행. 새중복source추출기금지. 이번도구변경0 |
| main.gd:106/238/265–280/1004 |field/arena소유수명·native시계·MAP-LOOK/BGM/Player순서·실패종료. CH4-16/17에서owner확정후만. 새공용시계·Main분기덧칠0 |
| world.gd:22/905–971/984/1109이후/충돌쿼리 |stage별데이터/자원/맵교체·actualActor동적등록/prop충돌/시각수명. 현재제품CH1 map.json을자동교체하지않음. CH4독립소비자는먼저신규파일로설계 |
| native_spawn_hole_system / enemy_factory / 보스 담당 |actualG/P·31etype/기존RNG·홀수명·kill권위·동적사망/보스부활. 소유권확인전상수교체·ordinaryactor대체·가짜kill금지 |
| native_regions.gd / hud.gd |7에리어의4지역분모/배너/문·미니맵/결과표시와같은actualstate. HUD생성/저장권위를복제하지않음. MAP_LOOK의visual region을새게임플레이지역으로사용0 |
| native_source_new_run_state.gd / player.gd |stage진입/재입장자원·iframe/KB/reset·field/arena현재state·owner교체. 기존G/P·slot형식·load=stage재시작보존. 새serializer/중복State금지 |
| native_map_look.gd:13–21/63–114 / lighting/maplook 담당 |CH4표시profile·벽눈시트/자산선택·부분 조명·pause/종료원복. 현재CH1profile을전역수정하지않고소유자API/장별profile확장의인수부터. 충돌·Q/E·타이밍변경0 |

이 문서의 **공용6파일**은 `godot/scripts/main.gd`, `world.gd`, `player.gd`, `hud.gd`, `native_normal_enemy_hurte.gd`, `native_source_new_run_state.gd`다(모두 같은 scripts 디렉터리). 공유 source exporter와 P3·MAP-LOOK·factory 파일도 별도 담당 소유이며 수정 승인을 자동 부여하지 않는다.

접속의 실제 추가 줄 수는 **미확인**이다. 이 표는 권한 승인이나 패치가 아니다. source-only 첫 단위는공유도구인수외제품공용0줄로설계하고, 실제진행연결은미완의존을분명히보고한다.

## 7. MAP PRODUCTION REPORT — GUIDE §23, 문서 전용 관측

| 항목 | 이번 결과·미관측 경계 |
|---|---|
| STAGE / MASTER |CH4 si14~20·게임플레이field200²/START/EXIT/굴94/분모7350/4분면·별도팔각arena추적. 새MASTER/레벨제작0 |
| OUTER MASS / LARGE |원문등록7/고유6원화·자동배치formula/원화byte존재확인. 새로운mass/composite/asset·시각접합제작0 |
| MEDIUM / GROUND |기존메타/충돌/초기RLE/최종tile구분. 바닥요철·열안개·광원·접지그림자후속제안만 |
| PLAYABLE / LANDMARK |START→exit tile-only연결검산, 실제prop/canMv반경/Player/적/interaction/지역/보스/다음장종주미확인 |
| CAMERA QA |8뷰·실창1x·전투광·시각연속성·전체맵/카메라미관측·캡처0 |
| TECH QA |원문발췌/replay exit0·stderr0·94검산차이0. Godot/브라우저/404/성능/시각인수0. 원문벽눈초기화6개는표시성공증거가아님 |
| FILES / GIT |신규추적md1+CHANGELOG최상단절만. source/product/test/shared/asset/save0줄. 정상훅·자기branch·원격SHA→DONE→자기WT제거 |
| VISUAL VERDICT |**NOT_OBSERVED / 미확인** — 시각PASS/RETOUCH판정실행없음. 기존CH1MAP-LOOK·CH2-02RETOUCH를CH4결과로사용0 |
| NEXT PASS |CH4-01후속배정가능. 공유도구소유인수없으면BLOCKED. 표현제작은§4·CH4-15에서별도인수 |

## 부록 A. 최종 소환굴 전수표 — 94개

G30042–30085의 clone/jitter와 G30486–30626의 후보·보정·탈락 후 순서다. 좌표는 world pixel이며 r/tile 좌표가 아니다. raw M0의9굴만 복사하지 않고 rooms.spawns/corridorSpawns 경유 입력을 함께 읽는다. 아래 JSON의 timer는 seed 관측값, 실제 부트의 고정 정책이 아니다. 각 count는 G31030 원문 값이며 room=1이 actual actor 배치 완료를 뜻하지 않는다.

### A.1 si14 — 14굴 / 1100

| 순서 | 원문 발췌 평가값 |
|---|---|
| 0 | `{"x":2980,"y":7300,"size":0.5,"timer":626.6127036558464,"alive":0,"room":1,"count":100}` |
| 1 | `{"x":5980,"y":6460,"size":0.3,"timer":604.7168261278421,"alive":0,"room":1,"count":50}` |
| 2 | `{"x":2340,"y":5980,"size":0.5,"timer":649.1745246900246,"alive":0,"room":1,"count":100}` |
| 3 | `{"x":5460,"y":5660,"size":0.3,"timer":659.873741492629,"alive":0,"room":1,"count":50}` |
| 4 | `{"x":2580,"y":4020,"size":0.5,"timer":633.7220967421308,"alive":0,"room":1,"count":100}` |
| 5 | `{"x":5020,"y":2540,"size":0.5,"timer":627.2437736671418,"alive":0,"room":1,"count":100}` |
| 6 | `{"x":2260,"y":1820,"size":0.3,"timer":616.527377567254,"alive":0,"room":1,"count":50}` |
| 7 | `{"x":5660,"y":1940,"size":0.5,"timer":607.309211846441,"alive":0,"room":1,"count":100}` |
| 8 | `{"x":4140,"y":1500,"size":0.8,"timer":600.0127756269649,"alive":0,"room":1,"count":100}` |
| 9 | `{"x":3780,"y":6220,"size":0.3,"timer":639.5145520661026,"alive":0,"room":1,"count":50}` |
| 10 | `{"x":3060,"y":3420,"size":0.55,"timer":613.9419078407809,"alive":0,"room":1,"count":100}` |
| 11 | `{"x":4820,"y":1900,"size":0.8,"timer":648.3127542212605,"alive":0,"room":1,"count":100}` |
| 12 | `{"x":4020,"y":5540,"size":0.3,"timer":641.384222083725,"alive":0,"room":-1,"count":50}` |
| 13 | `{"x":4020,"y":4140,"size":0.3,"timer":646.4279907848686,"alive":0,"room":-1,"count":50}` |

### A.2 si15 — 14굴 / 1100

| 순서 | 원문 발췌 평가값 |
|---|---|
| 0 | `{"x":2340,"y":6940,"size":0.5,"timer":626.6127036558464,"alive":0,"room":1,"count":100}` |
| 1 | `{"x":5660,"y":6420,"size":0.3,"timer":604.7168261278421,"alive":0,"room":1,"count":50}` |
| 2 | `{"x":2180,"y":5100,"size":0.5,"timer":649.1745246900246,"alive":0,"room":1,"count":100}` |
| 3 | `{"x":5740,"y":5500,"size":0.3,"timer":659.873741492629,"alive":0,"room":1,"count":50}` |
| 4 | `{"x":3460,"y":3780,"size":0.5,"timer":633.7220967421308,"alive":0,"room":1,"count":100}` |
| 5 | `{"x":5820,"y":3820,"size":0.5,"timer":627.2437736671418,"alive":0,"room":1,"count":100}` |
| 6 | `{"x":2700,"y":3060,"size":0.3,"timer":616.527377567254,"alive":0,"room":1,"count":50}` |
| 7 | `{"x":6300,"y":2380,"size":0.5,"timer":607.309211846441,"alive":0,"room":1,"count":100}` |
| 8 | `{"x":3780,"y":1580,"size":0.8,"timer":600.0127756269649,"alive":0,"room":1,"count":100}` |
| 9 | `{"x":3780,"y":6220,"size":0.3,"timer":639.5145520661026,"alive":0,"room":1,"count":50}` |
| 10 | `{"x":3060,"y":3420,"size":0.55,"timer":613.9419078407809,"alive":0,"room":1,"count":100}` |
| 11 | `{"x":4820,"y":1900,"size":0.8,"timer":648.3127542212605,"alive":0,"room":1,"count":100}` |
| 12 | `{"x":4020,"y":5540,"size":0.3,"timer":641.384222083725,"alive":0,"room":-1,"count":50}` |
| 13 | `{"x":4020,"y":4140,"size":0.3,"timer":646.4279907848686,"alive":0,"room":-1,"count":50}` |

### A.3 si16 — 13굴 / 1050

| 순서 | 원문 발췌 평가값 |
|---|---|
| 0 | `{"x":2620,"y":6180,"size":0.5,"timer":626.6127036558464,"alive":0,"room":1,"count":100}` |
| 1 | `{"x":5060,"y":6140,"size":0.3,"timer":604.7168261278421,"alive":0,"room":1,"count":50}` |
| 2 | `{"x":1660,"y":6140,"size":0.5,"timer":649.1745246900246,"alive":0,"room":1,"count":100}` |
| 3 | `{"x":3260,"y":4380,"size":0.5,"timer":659.873741492629,"alive":0,"room":1,"count":100}` |
| 4 | `{"x":5260,"y":3500,"size":0.5,"timer":633.7220967421308,"alive":0,"room":1,"count":100}` |
| 5 | `{"x":2260,"y":2820,"size":0.3,"timer":627.2437736671418,"alive":0,"room":1,"count":50}` |
| 6 | `{"x":5100,"y":2500,"size":0.5,"timer":616.527377567254,"alive":0,"room":1,"count":100}` |
| 7 | `{"x":3700,"y":6380,"size":0.8,"timer":607.309211846441,"alive":0,"room":1,"count":100}` |
| 8 | `{"x":3780,"y":6220,"size":0.3,"timer":600.0127756269649,"alive":0,"room":1,"count":50}` |
| 9 | `{"x":3060,"y":3420,"size":0.55,"timer":639.5145520661026,"alive":0,"room":1,"count":100}` |
| 10 | `{"x":4820,"y":1900,"size":0.8,"timer":613.9419078407809,"alive":0,"room":1,"count":100}` |
| 11 | `{"x":4020,"y":5540,"size":0.3,"timer":648.3127542212605,"alive":0,"room":-1,"count":50}` |
| 12 | `{"x":4020,"y":4140,"size":0.3,"timer":641.384222083725,"alive":0,"room":-1,"count":50}` |

### A.4 si17 — 13굴 / 1000

| 순서 | 원문 발췌 평가값 |
|---|---|
| 0 | `{"x":2260,"y":7300,"size":0.5,"timer":626.6127036558464,"alive":0,"room":1,"count":100}` |
| 1 | `{"x":5780,"y":6980,"size":0.3,"timer":604.7168261278421,"alive":0,"room":1,"count":50}` |
| 2 | `{"x":1740,"y":5060,"size":0.5,"timer":649.1745246900246,"alive":0,"room":1,"count":100}` |
| 3 | `{"x":5860,"y":5580,"size":0.3,"timer":659.873741492629,"alive":0,"room":1,"count":50}` |
| 4 | `{"x":2700,"y":3860,"size":0.5,"timer":633.7220967421308,"alive":0,"room":1,"count":100}` |
| 5 | `{"x":5140,"y":3820,"size":0.5,"timer":627.2437736671418,"alive":0,"room":1,"count":100}` |
| 6 | `{"x":2100,"y":1860,"size":0.3,"timer":616.527377567254,"alive":0,"room":1,"count":50}` |
| 7 | `{"x":5660,"y":1260,"size":0.5,"timer":607.309211846441,"alive":0,"room":1,"count":100}` |
| 8 | `{"x":3780,"y":6220,"size":0.3,"timer":639.5145520661026,"alive":0,"room":1,"count":50}` |
| 9 | `{"x":3060,"y":3420,"size":0.55,"timer":613.9419078407809,"alive":0,"room":1,"count":100}` |
| 10 | `{"x":4820,"y":1900,"size":0.8,"timer":648.3127542212605,"alive":0,"room":1,"count":100}` |
| 11 | `{"x":4020,"y":5540,"size":0.3,"timer":641.384222083725,"alive":0,"room":-1,"count":50}` |
| 12 | `{"x":4020,"y":4140,"size":0.3,"timer":646.4279907848686,"alive":0,"room":-1,"count":50}` |

### A.5 si18 — 14굴 / 1100

| 순서 | 원문 발췌 평가값 |
|---|---|
| 0 | `{"x":3460,"y":6420,"size":0.5,"timer":626.6127036558464,"alive":0,"room":1,"count":100}` |
| 1 | `{"x":5300,"y":6380,"size":0.3,"timer":604.7168261278421,"alive":0,"room":1,"count":50}` |
| 2 | `{"x":2700,"y":5820,"size":0.5,"timer":649.1745246900246,"alive":0,"room":1,"count":100}` |
| 3 | `{"x":5580,"y":5020,"size":0.3,"timer":659.873741492629,"alive":0,"room":1,"count":50}` |
| 4 | `{"x":3060,"y":4580,"size":0.5,"timer":633.7220967421308,"alive":0,"room":1,"count":100}` |
| 5 | `{"x":5180,"y":2900,"size":0.5,"timer":627.2437736671418,"alive":0,"room":1,"count":100}` |
| 6 | `{"x":1900,"y":2620,"size":0.3,"timer":616.527377567254,"alive":0,"room":1,"count":50}` |
| 7 | `{"x":5780,"y":2100,"size":0.5,"timer":607.309211846441,"alive":0,"room":1,"count":100}` |
| 8 | `{"x":3300,"y":1500,"size":0.8,"timer":600.0127756269649,"alive":0,"room":1,"count":100}` |
| 9 | `{"x":4260,"y":6220,"size":0.3,"timer":639.5145520661026,"alive":0,"room":1,"count":50}` |
| 10 | `{"x":3060,"y":3420,"size":0.55,"timer":613.9419078407809,"alive":0,"room":1,"count":100}` |
| 11 | `{"x":4820,"y":1900,"size":0.8,"timer":648.3127542212605,"alive":0,"room":1,"count":100}` |
| 12 | `{"x":4020,"y":5540,"size":0.3,"timer":641.384222083725,"alive":0,"room":-1,"count":50}` |
| 13 | `{"x":4020,"y":4140,"size":0.3,"timer":646.4279907848686,"alive":0,"room":-1,"count":50}` |

### A.6 si19 — 13굴 / 1000

| 순서 | 원문 발췌 평가값 |
|---|---|
| 0 | `{"x":3340,"y":6620,"size":0.5,"timer":626.6127036558464,"alive":0,"room":1,"count":100}` |
| 1 | `{"x":5700,"y":5820,"size":0.3,"timer":604.7168261278421,"alive":0,"room":1,"count":50}` |
| 2 | `{"x":2460,"y":5820,"size":0.5,"timer":649.1745246900246,"alive":0,"room":1,"count":100}` |
| 3 | `{"x":5420,"y":5220,"size":0.3,"timer":659.873741492629,"alive":0,"room":1,"count":50}` |
| 4 | `{"x":2740,"y":3780,"size":0.5,"timer":633.7220967421308,"alive":0,"room":1,"count":100}` |
| 5 | `{"x":5460,"y":3100,"size":0.5,"timer":627.2437736671418,"alive":0,"room":1,"count":100}` |
| 6 | `{"x":2620,"y":2020,"size":0.3,"timer":616.527377567254,"alive":0,"room":1,"count":50}` |
| 7 | `{"x":5060,"y":2500,"size":0.5,"timer":607.309211846441,"alive":0,"room":1,"count":100}` |
| 8 | `{"x":3780,"y":6220,"size":0.3,"timer":639.5145520661026,"alive":0,"room":1,"count":50}` |
| 9 | `{"x":3380,"y":3420,"size":0.55,"timer":613.9419078407809,"alive":0,"room":1,"count":100}` |
| 10 | `{"x":4820,"y":1900,"size":0.8,"timer":648.3127542212605,"alive":0,"room":1,"count":100}` |
| 11 | `{"x":4020,"y":5540,"size":0.3,"timer":641.384222083725,"alive":0,"room":-1,"count":50}` |
| 12 | `{"x":4020,"y":4140,"size":0.3,"timer":646.4279907848686,"alive":0,"room":-1,"count":50}` |

### A.7 si20 — 13굴 / 1000

| 순서 | 원문 발췌 평가값 |
|---|---|
| 0 | `{"x":3100,"y":7300,"size":0.5,"timer":626.6127036558464,"alive":0,"room":1,"count":100}` |
| 1 | `{"x":4980,"y":6780,"size":0.3,"timer":604.7168261278421,"alive":0,"room":1,"count":50}` |
| 2 | `{"x":1620,"y":5780,"size":0.5,"timer":649.1745246900246,"alive":0,"room":1,"count":100}` |
| 3 | `{"x":5980,"y":4860,"size":0.3,"timer":659.873741492629,"alive":0,"room":1,"count":50}` |
| 4 | `{"x":3060,"y":4660,"size":0.5,"timer":633.7220967421308,"alive":0,"room":1,"count":100}` |
| 5 | `{"x":5140,"y":2580,"size":0.5,"timer":627.2437736671418,"alive":0,"room":1,"count":100}` |
| 6 | `{"x":2060,"y":2140,"size":0.3,"timer":616.527377567254,"alive":0,"room":1,"count":50}` |
| 7 | `{"x":5940,"y":1380,"size":0.5,"timer":607.309211846441,"alive":0,"room":1,"count":100}` |
| 8 | `{"x":3780,"y":6220,"size":0.3,"timer":639.5145520661026,"alive":0,"room":1,"count":50}` |
| 9 | `{"x":3060,"y":3420,"size":0.55,"timer":613.9419078407809,"alive":0,"room":1,"count":100}` |
| 10 | `{"x":4820,"y":1900,"size":0.8,"timer":648.3127542212605,"alive":0,"room":1,"count":100}` |
| 11 | `{"x":4020,"y":5540,"size":0.3,"timer":641.384222083725,"alive":0,"room":-1,"count":50}` |
| 12 | `{"x":4020,"y":4140,"size":0.3,"timer":646.4279907848686,"alive":0,"room":-1,"count":50}` |

## 부록 B. CH4 등록·스폰 풀 전수

### B.1 G17759–17767 — raw 등록7개

meta merge 이전 원문이다. absent/undefined/null/명시0의 차이는 L의 undefined mask/초기meta77·원 merge 함수와 함께 검수한다. 단순 circle 반경과 원화 sz·flip·dir를 분리한다. 최종 배치/콜리더 개수는 미관측이다.

| 원본 행 | 등록 원값 |
|---|---|
| 17760 | `{"id":"m_c4p1","file":"prop_a.png","sz":400,"large":1,"dir":"collision","col":1,"colSz":72,"keepAR":1}` |
| 17761 | `{"id":"m_c4p1b","file":"prop_a.png","sz":330,"large":1,"dir":"collision","col":1,"colSz":60,"keepAR":1,"flip":1}` |
| 17762 | `{"id":"m_c4p2","file":"prop_b.png","sz":360,"large":1,"dir":"collision","col":1,"colSz":70,"keepAR":1}` |
| 17763 | `{"id":"m_c4brazier","file":"prop_brazier.png","sz":300,"large":1,"dir":"collision","col":1,"colSz":80,"keepAR":1}` |
| 17764 | `{"id":"m_c4pit","file":"pit_lava.png","sz":200,"large":1,"dir":"collision","col":1,"collision":1,"colSz":80}` |
| 17765 | `{"id":"m_c4fire","file":"fire_pillar.png","sz":220,"large":1,"dir":"collision","col":1,"colSz":50,"keepAR":1}` |
| 17766 | `{"id":"m_c4crack","file":"lava_crack.png","sz":56,"scatter":1}` |

### B.2 G30977 — HELL_SPAWN[3] 전체31개

G30991 ranged Set과의 교집합을 별도 표시했다. weight는 전체 CDF 입력이며 고정 출현 수나 최종 ranged 확률이 아니다.

| 순서 | etype | weight | _RANGED_ET 포함 |
|---|---|---|---|
| 0 | 0 | 5 | 아니오 |
| 1 | 1 | 2 | 예 |
| 2 | 2 | 10 | 아니오 |
| 3 | 3 | 5 | 아니오 |
| 4 | 4 | 5 | 아니오 |
| 5 | 5 | 4 | 아니오 |
| 6 | 6 | 5 | 아니오 |
| 7 | 7 | 8 | 예 |
| 8 | 8 | 2 | 예 |
| 9 | 9 | 5 | 예 |
| 10 | 10 | 14 | 아니오 |
| 11 | 11 | 5 | 아니오 |
| 12 | 12 | 8 | 아니오 |
| 13 | 13 | 2 | 예 |
| 14 | 14 | 6 | 아니오 |
| 15 | 15 | 3 | 아니오 |
| 16 | 16 | 6 | 예 |
| 17 | 17 | 4 | 예 |
| 18 | 18 | 6 | 아니오 |
| 19 | 19 | 3 | 아니오 |
| 20 | 50 | 8 | 아니오 |
| 21 | 51 | 4 | 아니오 |
| 22 | 52 | 6 | 아니오 |
| 23 | 53 | 3 | 예 |
| 24 | 54 | 4 | 예 |
| 25 | 55 | 10 | 아니오 |
| 26 | 56 | 5 | 아니오 |
| 27 | 57 | 2 | 아니오 |
| 28 | 58 | 4 | 아니오 |
| 29 | 59 | 1 | 아니오 |
| 30 | 47 | 10 | 아니오 |

`_RANGED_ET` 원 Set25개 = `[1,7,8,9,13,16,17,25,26,34,38,42,45,46,48,53,54,66,71,76,78,82,84,86,88]`. `HELL_EL[3]` 원문 평가값 = `[1,0.45]`(EL.F=1). CH4 pool에는 원거리 교집합 9개이며 원거리/비원거리 가중 분기와 재시도는 G30994–31022 그대로다.

## 부록 C. 원화 byte 참조·현재 Godot 대응

Git blob 읽기 대조만 수행했다. image decode/실제 화면/완전한 scene closure 검사가 아니다. URI query는 파일 경로 hash에서만 분리한다. 자산 변환·복사·생성0.

| 참조 | 원본 경로 | byte | SHA256 | Godot 대응 |
|---|---|---|---|---|
| m_c4p1 | assets/map/ch4/collision/prop_a.png | 554645 | 9b74c0c19cad7b4eb2b3c3f1a5c86cf19f10f7a08e028a33a49aab03aaa26357 | 동일 byte |
| m_c4p1b | assets/map/ch4/collision/prop_a.png | 554645 | 9b74c0c19cad7b4eb2b3c3f1a5c86cf19f10f7a08e028a33a49aab03aaa26357 | 동일 byte |
| m_c4p2 | assets/map/ch4/collision/prop_b.png | 686206 | a3e1bedad1652f39b4a248f217e4bf096b62a4f68417492bee6af579a8415d4b | 동일 byte |
| m_c4brazier | assets/map/ch4/collision/prop_brazier.png | 1118648 | 6334b66893d9efa30f8861cd4f69c1683702d8bf08943ad75fc6eae0108304a7 | 동일 byte |
| m_c4pit | assets/map/ch4/collision/pit_lava.png | 26658 | 303f73dd5eb646d192c1903c1fddc1ae7fb4bca3a3ce5305868ca791bcd04808 | 동일 byte |
| m_c4fire | assets/map/ch4/collision/fire_pillar.png | 1880 | 49c55b8e072e7f5023d9f398d48ba45a0fc644989bc3815679c99ab3f477a9fa | 동일 byte |
| m_c4crack | assets/map/ch4/floor_objects/lava_crack.png | 964 | 361c37f0643560ec3045ed4adc431e5f58fd7e4aef5aca624bfae8322dd81b63 | 동일 byte |
| gt_ch4 | assets/map/ch4/ground.png | 390666 | b95a6826e35645891d418a81d71854d15c6c828de4c1711e231696ae2c4ea48a | 동일 byte |
| common eye sheet | assets/map/eye_bloodshot_8dir.png | 4125 | 3e435f5fd84d9720cc6efdb7fb13045a01ec74635b77a9baa4a5f4e4c00e6906 | 동일 Godot 경로 없음 |

## 부록 D. 원문 initWallEyes 별도 관측6개

G25669–25677을 generator grid에서 별도로 호출한 상태값이며 initStage 배경큐/renderer·실제 blinking 성공이 아니다. 원 _tseed를 사용해7개 에리어에서 동일6개다. 최대8이 목표8을 보장하지 않는다. CH1/CH2의 MAP_OBJS 눈깔과 별도 WALL_EYES 배열이다.

| 순서 | 원문 상태 |
|---|---|
| 0 | `{"x":3383.9739286964636,"y":251.91017150967855,"radius":44.125990129134614,"pupilR":13.237797038740384,"pupilOff":17.650396051653846,"veinCount":2,"blinkTimer":0,"blinkInterval":3553.414505232784}` |
| 1 | `{"x":4338.473091129434,"y":259.2506408734483,"radius":9.009597779721766,"pupilR":2.70287933391653,"pupilOff":3.6038391118887065,"veinCount":2,"blinkTimer":0,"blinkInterval":6970.165254534299}` |
| 2 | `{"x":4620.337915425346,"y":258.0780124701923,"radius":9.8699665087601,"pupilR":2.96098995262803,"pupilOff":3.9479866035040403,"veinCount":2,"blinkTimer":0,"blinkInterval":4075.632572674953}` |
| 3 | `{"x":4827.156586655023,"y":307.16522694433354,"radius":20.85544467384715,"pupilR":6.2566334021541445,"pupilOff":8.34217786953886,"veinCount":3,"blinkTimer":0,"blinkInterval":3544.5778372439454}` |
| 4 | `{"x":4414.866929056527,"y":1177.7097368276259,"radius":9.63558292558211,"pupilR":2.8906748776746327,"pupilOff":3.854233170232844,"veinCount":2,"blinkTimer":0,"blinkInterval":4527.4156450887285}` |
| 5 | `{"x":3933.700041772658,"y":1211.3637501007709,"radius":8.451666833111862,"pupilR":2.5355000499335585,"pupilOff":3.3806667332447446,"veinCount":2,"blinkTimer":0,"blinkInterval":7606.22996306337}` |

## 부록 E. 원문 symbol 행 색인

G는 위 고정 game.html이다. 선언/closure와 관측 실행 함수·읽기만 한 소비 경계를 함께 색인한다. 표에 있다는 이유로 전체 함수를 실행했다고 읽지 않는다. 정확 SHA·maps_data 정의 전체 SHA는 L/source-index-14~20.json / static-source-index.json. G 상수의 부록 E/source-index는 initializer expression, static G 전체 선언은 선언 prefix 포함·속성별 값은 value expression, M 정의는 assignment prefix 포함이다. 같은 행/이름이라도 이 발췌 범위를 구분한다. source 함수 본문 치환0이며 미실행 소비자를 stub READY로 붙이지 않았다.

| symbol | 원본 행 | SHA256 |
|---|---|---|
| _mapTestReq | G3465–3465 | 6c615771192f87fb8fbbd34255a0388ddd44126181f357f9b255c9e76a1bd094 |
| _stageTestReq | G3466–3466 | 0b55c61df00c2a3f7c68747c45e7b6fe0514b10fe1cfd0ddf3590e57fe46e43a |
| _classicMap | G3469–3469 | 92a52bca28b1d1cb9c2ffb6e6f87eafcac6bf935d79409bba9e23c2072893e03 |
| _MAP_QA_MODE | G3470–3470 | e2e645be5329a59465c35d93132af75631ced957d63ce876364d0009287ff930 |
| _DIABLO_FIELD_QA | G3471–3471 | 3b2c28e599d5b5c534ed077e169e5c4bcce2b1e69379c172ed1cf85e8aa8573a |
| _wantPlateTest | G3475–3475 | 6252bdd9a47b29ffee3f2e10d429768edf169bea3dbc439a68ec3b3d1b6f676e |
| _buildStaticLights | G4639–4652 | 857ded78b50b80dd815099a21123b441fca80c1039241766236285a695be2cab |
| _collectLights | G4653–4692 | bd123059ee03ab508ffdb0042c1ece4b28e5cb5061cbfd9e6f7df0fb6451d27c |
| _renderLighting | G4693–4730 | fbae4ad03efda613389f40c6dcb0ab4831b0eec52eefb7f5600124eb289b2b6e |
| _fdgProjectiveTextureGate | G4746–4746 | a207b178ae66a58acbb8bd1c686c9da980f1fe83749e822125174f2534461ce4 |
| _FDG_RUINED_FOREST_FIRST | G4747–4747 | 2a10bc3fdd393a66716408327768925323952e8a548e689d9b31a623e1464da7 |
| EL | G14333–14333 | 60bb41cacfe8407ccf122df5a789413edfcd2d418140d00412e2db051cf385aa |
| T | G16631–16631 | d59eced1ded07f84c145592f65bdf854358e009c5cd705f5215bf18697fed103 |
| CHAPTER_STAGES | G16633–16641 | 8891e0b3139efbef7cb81a34dfafb58254179954707350c96311ffd5636c98e9 |
| TOTAL_STAGES | G16642–16642 | 9f14025af0065b30e47e23ebb3b491d39ae8ed17d33739e5ff3827ffb3634953 |
| stage_index_arrays | G16658–16667 | bb68183648fa4310b6f053af521031960f2a9e963129b54355c1b6389d6e3216 |
| stage_face_dungeon | G16668–16675 | 71b677315ffb6c330d76f8857b8158281d01e6cb2839d0463fb15cb82fe3bce6 |
| _isFaceMap | G16675–16675 | 0d737b2e7ddcf23e21830c5cb1b3494fcf2b2e42c8c460207d5db9748c054376 |
| _isDungeonMap | G16676–16676 | b77a5b53d9be68a53308a638f0bac0f25571b9c1bcb5a58709c1fbc4d79eb6f5 |
| HELL_THEMES | G16679–16687 | 61f2ac554fc4fc6fc52af79a760885fb5bc7b85e7fc0593fcd210c4cb715ef20 |
| HELL_BOSSES | G16688–16696 | 0359df1166dc48e785574d5d1456cfcb3202637fc6f111b2e4520a4942e8c384 |
| stage_display | G16697–16714 | a1d181f15b933030ad9423a7ce55cf655bcd94d243207c6436775fabb7bd8089 |
| _CH_DECO.3 | G17759–17767 | aae1f084d0b39f3b5a080c767efaa6c479368132a70e760e08eda75879a874e0 |
| _MAP_COMPOSE | G18118–18207 | c391ea0ee33da474a4a999eca7be281897bf7f7ae633290998c76a4bbb92c186 |
| _OBJ_META | G18392–18426 | 82449e9c92065c0ab08bc61b6ced27b9764cc0cc5f07be89dd7a61efe1da15fc |
| _filterMapSprite | G18454–18457 | 0a6995911ab3dc709c699c68824a665715a87d92fbddd439f0b3828e46af0153 |
| _edgeEraseMapSprite | G18458–18467 | 7beaaa451b43837af5557491272a5f9e38b048ed677c593dedfbcc8a9529bc19 |
| _cacheExitCenter | G19793–19793 | 5dba8f4c496c5840254479d292d4652b84121ae5a115555838b2a18951d89ef1 |
| initTorchLights | G25619–25642 | dfb403022a029df9b5dbde2f9bddba7f1beb027cc9aac70c711485450ae9bd72 |
| initSwayObjects | G25644–25653 | db23818852209590d5f419b123899a920088690cd510bf407eb102be8d27895f |
| _eyeDirFrame | G25659–25666 | b23ad055ce092fbd0bbe99f7c2e488b576f142e5034b5ad4a51410ff5fa0e652 |
| WALL_EYES_MAX | G25668–25668 | 2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3 |
| initWallEyes | G25669–25677 | 568e0a4b7b38483388294306e52f287e0b97a0fe24a662a3bd6a586df7b510da |
| initGlowObjects | G25721–25731 | b461c035c3d5ff1f549cf88a5bbb3419587976ac0404e65093bdb8395f3f5f4d |
| initMapObjects | G25735–26472 | 169e7dcdad981ebc246ab8f8a12d84067b39a15aa3b5f1b2fd9431b5edf67334 |
| _nearFloor | G25778–25778 | 619cdaabb02ce92fcff475ac360b43f9d183a2d469d5dfab032028cb3c7a8a7c |
| _tseed | G26473–26473 | cbec39520ab3e318228a166eb1869cbe2bccd5667cb376e56f65fe9c3f9e1815 |
| _hellWinterFloorImg | G26531–26544 | 33f2447f801f5326e210e32ec49f6fe1d1ed92a7776da8c7e8ec0b1a03111a87 |
| _paintHellFloorBaseTone | G26557–26563 | 1a97e28a8148d4e2fd64b8de1daf74e5e04ff1a212bc84888eac6705ecde7a24 |
| _paintHellFloorMarks | G26564–26610 | 334f4eaa2271cacff6c10232705901bf0ae5fa1051dd0236e11eb27d8fcce983 |
| _tCarveCircle | G29037–29044 | aec27b9c4e506c8be80ce8411ad52fae1795f6ae399b36492b5eefa071bd3374 |
| _tCarveEllipse | G29045–29051 | 5b68cdcb042ca9258f6005516341da9aac0d0ecd36b66d63849c5b68ccb98b8a |
| _tCarveRect | G29052–29057 | 0b60ed9400e29fe28b34bce5d1aad8222a283119e51ec76cf032f60eaa25e76f |
| _tCarveCross | G29058–29070 | f47dc8ca89744dc13d9e7f9756d7c3bb0374d0a7b93e938e8becdb885ca7cd69 |
| _tCarveCorridor | G29071–29117 | 603da06fecc0a91ed74fea7cd5f8e7f628833f06bc0b7493f68d1506dc6c1bef |
| _tCaveSmooth | G29118–29129 | 6197aaae8348389a2655542843de6fee6fc7a84f381b789e439093b5bf948f8f |
| _tBossDistMap | G29138–29146 | 6c7ae9d33a94fff9403eb0ce0ca2c13f1e927ac54e3336d65f78f2e0ed714e7b |
| mkRng | G29556–29559 | c74098c60d18aa9b633a637592e212270d63d4e9b9e43df81e635a6b9168d065 |
| _rleEncodeGrid | G29928–29932 | 40f329fbac442ca0b38fad42f469bfe165340f754ba6aa92095ff87be0cdb952 |
| _buildCh1StartForestRLE | G29971–29986 | 28caed8b821d9e5c30047823b039e42cc88ae25f445072f0550a0f53d16225db |
| _paintPathDisk | G29987–29992 | b579f89df7e2dbaeea93bcf52f9916d087d4a24a4ea080db4988f0bd988d168f |
| _paintPathSeg | G29993–29996 | 04d0626aca8adc7a779e72e8315ac8e1e033df27c6be5071c28a3ceb5c7cb9bc |
| _buildWalkPathRLE | G29997–30007 | d05c76ade7dc09e6f2d1e790b72af882a9710de92533d8a32facd28f30810fbd |
| _buildBasinRLE | G30008–30020 | 2d570c8f4064f3ff4f1d6766ee0f8ff824fe8236adaec35c0ddfdbe2deaeb78c |
| _applyCh1StartNorthGate | G30021–30027 | 9bae0a90422beeef9ecaae99893ae82b589bd12a42e5cf9696667e87f91e0a18 |
| _applyHellWinterNorthGate | G30028–30034 | 7612112d63902e0ce43efc0d5b153090bf0a8a7f287c0d713974fe0049659cc9 |
| _buildColRectRLE | G30035–30041 | 3f28ea34a381b8b88eaac917f477fea8027aaed5be97b9f5e20f1685df42ead4 |
| _cloneField11 | G30042–30085 | d26f2f4b43ee281e13d176ed5651670498d46ecb09bb5e2d7fd7c55cc4b8e616 |
| _getFixedMapForStage | G30135–30147 | a63c3cb93b59e0751729610dc163855606bb41a6bc1839d5ecd85feb5400c690 |
| MAP_ALL_FLOOR | G30217–30217 | fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa |
| genFromTemplate | G30218–30694 | a71d895cc30de270f2146ea2aa44b8da520d65eafac19c043b4c12094647957d |
| genBossArena | G30697–30747 | ab3c27e8526db39d41728b956e94c5d860cd4e8f33356deaf650e9aec36203e4 |
| _enterBossArena | G30749–30814 | 01f063493e7b07deed6ae1f8925ffb09c54f0fd03070bf3d3e27cd2cf79d365b |
| HELL_SPAWN.3 | G30977–30977 | 49395178dcdecc7be76ee871c6487fb0244fee9282a89bda677a0ab9375f8dad |
| HELL_EL.3 | G30985–30985 | b3b90fa82caedef278c4492a37928f8d968ff13b42cf5a7116c549befc0a767a |
| _RANGED_ET | G30991–30991 | 8f17a6c8d5e19e93bd22a4e1b118828e3418c68247e235635f75cd2fe0b0af20 |
| rollEtype | G30993–31016 | b816226c2ae3db962ca2d82dc4730ab8817e6cbc314a42509dea6ee791f23d71 |
| rollEl | G31017–31022 | 84f0a33ae64d8d6a47eaaa8d46dd0084c315c3ac4b999a549593b6f6d55efbd6 |
| SPAWN_HOLE | G31029–31029 | 1ccea0b8a0bc7045e1d71a8752d0aaf2c0a828b2d20852b6755df39f8c6713d5 |
| _spawnHoleCount | G31030–31030 | 2df8140e22cd52fd550b5bd8d879d310e227d364d8c30791261b58a6cf7a6a1f |
| initStage | G31533–31670 | bbe78a98843ed1abbdafb0260ddeee9acbd220fd584894a7919e9e6a3cb0d431 |
| initStage.start_position | G31564–31566 | 71f7a032cd6f272110488e0adf7fd47b52f5b799a2a7d8be0ee116090c64ea7a |
| _appendRotatedColParts | G31685–31685 | e06e280ad0741c3d0d84c7de30dff51985e5a22259c28959f239e0aa9ab7e0b1 |
| _rebuildColObjs | G31686–31686 | 244522b4da6bdb78401690fddad00ad1a521fdef5ce68145e055a39019b7fea9 |
| _ensureColObjs | G31687–31687 | c68faf791b13410a5c5f258418961669f9db64172a7e7607b22afb5eb72851df |
| isW | G31711–31711 | 96db02d1f1d52890105c319d760a0592cdfc0a679d39a8fe5793b5d4bce12388 |
| canMv | G31712–31712 | fc0ebf7b6a24afd582d9010734def79bce2649c2d0118934d8c2cc8917dc2c4c |
| nextStage | G43896–43896 | 9e53b012d584d296e004dbb15fe3f52bf9cab0b37ac825d6a426dc65562c9321 |
| doWin | G43897–43921 | e5d5016004de55e7b40a9fc5188e27825478578dec08e18b38d4e9127c333109 |
| _REG_DIRS_KO | G60688–60688 | 6e34c82a5a9490c2696ff15a8bdee556d18b674d1b651c0c8f318b6958641afb |
| _REG_DIRS_EN | G60689–60689 | 6c95142a75fb88a0f13633e67fdf73901d5d59f991ffbb5a75f43fbb8d793b60 |
| _REG_CH1_KO | G60690–60690 | 41e6acf7ec0ddd97c1b14c9282c63fbf1716cc667458e7f5a62c8b236ccd0302 |
| _REG_CH1_EN | G60691–60691 | 29575dc13e05eff25267a402011faeadf7fbb99097dcc287dcd250fe3dbaede7 |
| _REG_FB_TO_REG | G60694–60694 | 1b928d7b68dcb31d8fc4e1f464e3657806dd31847e900e102fe7820a9b085d80 |
| _regionIdxAt | G60696–60696 | 5d193c43981afa0497a6de111d0fa54eddba47929025b8cbed4371f8fb37a336 |
| _regionInit | G60697–60718 | 94ffd97b032d3dfe35a8ab306f75b7323bc2f5e391c684475c0ab037b8097e9f |
| _regionFbAlive | G60719–60724 | f93e40789d4cae0deb80c2ce9ec669b0117a8da6d7c2eec7cfc26b08bf4752ee |
| _regionRatio | G60725–60725 | 739445c2f33f0bb6c79390f405303414c48a6b97559cd3bf8e88449d9643b2d6 |
| _regKill | G60728–60732 | 03c12ed8ce7c6b00399ac0897d95e61d6f5ce7758b2f3c5054767ff6b7a43b15 |
| _regionCheckClears | G60766–60778 | e593ea14bba03fed89b4a4416db15a70fda6d86d7e1ac038afd4322b0bdc8cea |
| _regionTick | G60779–60793 | 6e7cb97b324fc2a29ac13358d992afca16983fb428c79eee1f21add2cb945352 |

M 정의는 기본 베이스0 및 legacy14~20을 전수 색인했다.

| symbol | 원본 행 | SHA256 |
|---|---|---|
| FIXED_MAPS.0 | M6–55 | c4b676b8f7ffcd29f70a3c4251bc23e11fdb8247e8eb2660341ca8dff86f6943 |
| FIXED_MAPS.14 | M22851–24664 | 255adf2c85a104a2f4a1cdfb9fdd43e67be7db0f3ad889a4bc86150ee4d4b884 |
| FIXED_MAPS.15 | M24667–26779 | 261893123a28387d5fa71d9a23a68a07b30916c9b2abdde4a15b201678bb3e52 |
| FIXED_MAPS.16 | M26782–30195 | b53ad38e54d16a28771daf98036e372b857593fbf7e53b7eabc80dcd6f757ea7 |
| FIXED_MAPS.17 | M30198–33629 | 90c8f5b51e8fd160b0f324b2d6000762d2174610cc43e30f69595d931723c1de |
| FIXED_MAPS.18 | M33632–36853 | f422bd395eaaf6de9d6ed185ca7733212cd938877fa42be9af4125d154bc9189 |
| FIXED_MAPS.19 | M36856–40901 | 37176c8981b928ca1b365a03da08546e52fb649f5fb951d45f649f5f3c14e5d2 |
| FIXED_MAPS.20 | M83183–87051 | fd4e7c85551610dd31adbfb2da6c86bd6353aeba4b06a3c4e97beaa64bf08473 |
