# 5장 5에리어 원본 추적·구현 지시서 — 2026-10-20

작업 `trace-maps-ch5` / 브랜치 `codex/trace-maps-ch5-20261020`. **원본 게임플레이 계약의 추적·후속 구현 지시서만 제출한다. 코드 구현·Godot 실행·제품 플레이·시각 인수 완료가 아니다.** 사용자 목표는 웹 화면 1:1 복제가 아닌 **PoE2·No Rest for the Wicked급 깊이·생동감·부분 조명**이다. 크기·충돌·스폰·지역·이벤트·출구/전환은 현재 원문을 추적하고, 시각 제작은 §4의 Godot 확장 범위로 분리한다.

| 기준 | 고정 값 / 보호 경계 |
|---|---|
| fetch origin/main / 분기 HEAD | `823c24baee3f6c5f058ebfd7776721e86f80bd18` |
| 마감 main 추가 대조 | `0105159934d0c2a8b167bd51518dca1e0fafe50a` — G/M·제품 접점 byte 동일, CH2 resource writer 변경은 §0에 별도 기록. 분기 SHA 소급 변경0 |
| G = game.html | 65,692행 / 4,195,551byte / SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |
| M = maps_data.js | 103,257행 / 881,757byte / SHA256 `01e74466ea797227d555288592edc959545cb2e44e64e607bf181e7d64c2870e` |
| WT / 원로그 L | `~/exoduser-wt/trace-maps-ch5` / `~/exoduser-wt/_out/trace-maps-ch5/` |
| 제출 | 이 문서 신규1개 + docs/CHANGELOG_SYNC.md 맨 위 절. 코드·테스트·공용·설계/LOCK·원화·저장 변경0 |
| 관측 범위 | 고정 Git blob 정적 읽기·원문 함수 발췌 Node VM. initStage 전체/initMapObjects/mkEn/실제 보스 처치·브라우저·Godot 실행0 |
| R 보호 | HEAD dd49171c5b88e211575a41f185395d6c0a14b184 / branch codex/mac-live-play-time-main-20261017. tracked INDEX/WORK 보존 |

## 0. CH4 형식·선행 결과와 현재 기준

main의 [CH4 문서](FDG_SOURCE_TRACE_MAPS_CH4_20261020.md) 형식·깊이를 따른다. selector→생성 snapshot→순수 계약→실효 배치·독립 소비자→실제 진행/시각 인수 순서와 원문 부재/관측 전 데이터를 구분하는 파이프라인을 재사용한다. CH4의 당시 main 미포함·CLI 상황은 당시 기록이며 이번 기준으로 소급 복사하지 않는다.

| 자료 / 현재 기준 | 재사용 / 남은 의존 |
|---|---|
| main CH4 trace | source-audit 발췌 VM·행/SHA 색인·legacy와기본selector 구분·굴/등록/자산 부록·원화와 collider·공용 접점·MAP PRODUCTION REPORT 형식. CH4 자료의 palette/arena/벽눈6/94굴을 CH5 값으로 옮기지 않음 |
| main CH1/CH2 pipeline | 단일 `export_ch1_area_source.mjs`는 **0/1/4 + snapshot 뒤 observeNative** 지원. CH2 source/resource/reader/독립 World 존재. CH5 지원은 없음. `cli_paths.mjs`의 플랫폼별 직접 실행·경로 helper는 보존 대상 |
| CH3 인수 체인 | 사용자 확인 CH3-03→04→05 끝 `f0ad1a3235133650d1286d8ecfb488b3b1006584`, provenance 선행 수정9af85131 포함. 이번 main의 source 도구에는 stage10/11/12/13 지원 없음. PC 순서 CH2-04→CH1-06→CH3 끝 최신main 일괄merge는 **별도 지시까지 실행0**, CH3-06 HOLD 유지 |
| GUIDE / SSOT | 제작 GUIDE v0.9의 MASTER→OUTER MASS→MEDIUM→GROUND→PLAYABLE→LANDMARK→SMALL→CAMERA→TECH. _MAP_SSOT_INDEX 269–279의 runtime field200²·로어/런타임 보스 매핑 분리·내부 무로딩. CH5 전용 DESIGN LOCK은 해당 index에서 미확인 |
| MAP-LOOK / 개조 전략§8 | 표시 전용 CanvasModulate/부분 광원·요철 shader·접지/가림·시차/입자 후보. 현재 profile은 CH1 전용이며 CH5 수치·성능·실제 화면은 미확인 |
| FEATURE_INVENTORY | MAP-21~25(395–399행) / BOSS-21~25(435–439행)는 제품 CH5 consumer 없음. 원화 존재를 플레이 가능으로 세지 않는 상태를 유지. 기존 inventory/작업판 수정0 |

L/reference-sources에 실제 main 도구·제품 접점·CH4 문서/개조 전략을 고정했다. CH3 chain은 후속 의존이지 이번 branch의 merge 입력이 아니다. 이번은 최신 main에서만 분기했고 타 worktree WIP를 인수본으로 읽지 않았다.

마감시 공유 origin/main은 `0105159934d0c2a8b167bd51518dca1e0fafe50a`로 전진했다. G/M·공유 source exporter·Main/World/Player·굴/지역/MAP-LOOK은 분기 기준과 byte 동일하다. CH2 resource writer는 **실제 기록 commit의 game bytes 확인 후 main_sha만 다른 동일 content이면 버전관리 manifest bytes를 유지/복원**하도록 보강됐다. 원문 생성/배치 관측 로직 변경은 아니다. L/main-drift.json·latest-map-tools.patch·latest-main-sources가 근거다. 후속 CH5 resource/CLI는 이 보강과 OS helper를 보존하고 옛 writer로 되돌리지 않는다. CH3 체인 merge·도구 재맞춤 자체는 이번에 실행하지 않았다.

## 1. 최신 원본 행 전수 추적

G/M은 위 고정 blob이다. L/source-index-21~25.json은 각92개 원문 symbol의 file/line/end/SHA를, static-source-index.json은 M 정의 전체와 CH5 규칙·이벤트의 정적 범위를 갖는다. 부록 E의 상수 SHA는 AST initializer expression(선언 prefix 제외), 함수는 function 전체, M은 `FIXED_MAPS[n]=` 포함 assignment~object end, 추가 이벤트 범위는 명시 행 텍스트다. 같은 이름/행도 발췌 경계가 다르면 SHA를 교환하지 않는다. 적·보스 전체 AI 인수는 별도 담당 범위다.

### 1.1 장·에리어·selector·생성·START

| ID / 원본 행 | CH5 실제 계약 |
|---|---|
| S01 / G16631–16713 | T40·hell4/startSi21/stages5 → si21~25/floor0~4. STG HELL LEGION/지옥 군단 N구역·monLv500·EL.D=3·보스 전쟁의 잔해/뼈산의 왕/악마 사령관/철벽 기사단장/군단 지휘관. si25만 isHellBoss=true |
| S02 / G3463–3477,16643–16648 | 빈 URL·production gate 기준. 기본 demo는 stage0 종료, stage/mapTest/editor query 실행을 CH5 자연 부트 성공으로 세지 않음. 전체 initStage 실행0 |
| S03 / G16668–16676,30135–30147 | 대표 face si21. **21~25 dungeon spec 자체 부재**, isDungeon=false. FIXED_MAPS[0] 존재·특수 gate OFF일 때 모두 `_cloneField11(si)`이며 M의 개별21~25는 기본 선택되지 않음 |
| S04 / M6–55, G30042–30085 | 베이스0의200²/rooms6/corridors5/features3/corridorSpawns2/수동굴9/objs player_start1. CH5 compose 부재 → editorRLE[1,40000]. 원 mkRng(si*7919+17)로9굴 ±18 지터·18..182 clamp, 방/복도 spawn marker는 별도 보존 |
| S05 / G18118–18207 | compose 키0/1/2/3/4/10/11/12/13. **21~25 compose·handProps 미정의**. 빈 authored[]/lm[]로 채우지 않음. G17808 DECO_FORCE_AUTO=false지만 실제 gate는 `force \|\| !(compose && (path\|\|hand))`, 부재 CH5에서 자동 배치 경로는 남음. OFF 주석만 보고 전역 비활성이라고 오판 금지 |
| S06 / G30218–30334 | RLE coverage 검사→editor1을runtime0, 나머지를wall1로 변환. RLE 경로에서 일반 room/corridor carve/연결 보정은 비실행. room 메타는 남고 뒤 boss floor4·pillar·gate/exit 처리가 최종 grid를 바꿈 |
| S07 / G30335–30442,30646–30694 | boss gate metadata x99..101/y5·exit x99..101/y7(3폭), generator의 비가시 boss_gate_col4020/160. tile3=0이어도 gate/차단체 부재로 읽지 않음. CH1/si10 북문 재작성 비실행 |
| S08 / G30486–30626 | 수동굴→hole_* objects→room.spawns→corridorSpawns·거리²250000 gate→cap50/최소6 보완→벽위 spiral r<15/tile0 이동→주변11² floor0<30 제거→분모 확정. CH5 최종64굴은 부록 A. 탈락한 굴의 timer RNG 소비를 지우지 않음 |
| S09 / G31533–31569 | selector/gen→원 START room floor0 탐색 r1..29→(tile+.5)*T. 전부 tile100,185/world4020,7420. 뒤 자원 refill/idle/iframes360·KB/poison/slow reset은 Player/State 소유 접점이며 이번 실행 안 함 |
| S10 / G31573–31655 | RLE에서 room/corridor 직접 적 스폰·최소80 보완·P 근접굴 삭제 비실행. 문지기 후보 etype59/EL.D@(4020,340)는 tile100,8===0 조건인데 관측값4. 실제 mkEn·호위/문지기 상태는 전체 initStage 미실행으로 미확인 |
| S11 / G31656–31669,63513 | regionInit→cam/pets/cache→torch/background queue. CH5의 initMapObjects는 별도 지연 단계. stage0의 강제 `_tickBgInit(9999)` 예외를 복사하지 않으며 배치·이미지·collision 준비 전 fullstage READY 금지 |

### 1.2 5개 에리어 원문 발췌 VM 관측

CH4의 Git 밖 관측 하니스를 CH5 인덱스/장 등록에 맞춰 재사용했다. 고정 원문 AST 상수·함수 본문 그대로 selector→genFromTemplate→정확 START31564–31566→regionInit을 실행했다. AST에서 해당 compose 키가 없음을 먼저 확인한 후 부재 projection만 전달했다. 원 함수 연산·분기·순서를 바꾸지 않았고 Math.random만 seed20261020의 LCG uint32 관측으로 고정했다. 이는 실제 부트 RNG 정책이 아니다.

| 에리어 / si | 원 STG 보스 | 지형 / raw hand | 굴 | 분모 | NW,NE,SW,SE | timer draw | next |
|---|---|---|---|---|---|---|---|
| 5-1 / 21 | 전쟁의 잔해 | 기본floor / 미정의 | 13 | 1000 | 150,300,350,200 | 14 | 22 |
| 5-2 / 22 | 뼈산의 왕 | 기본floor / 미정의 | 12 | 900 | 150,300,250,200 | 13 | 23 |
| 5-3 / 23 | 악마 사령관 | 기본floor / 미정의 | 13 | 1000 | 150,300,350,200 | 14 | 24 |
| 5-4 / 24 | 철벽 기사단장 | 기본floor / 미정의 | 13 | 1000 | 250,200,350,200 | 13 | 25 |
| 5-5 / 25 | 군단 지휘관 | 기본floor / 미정의 | 13 | 1000 | 250,300,250,200 | 14 | 26 |

전부200×200/T40·40,000타일, tile0/1/2/3/4=**38986/36/3/0/975**·SHA256 **5b40eb67c1aa3fd6ad407f9af06db91f549456bcd9c7d91ed31265c5a3a3b87e**. START4020/7420·gate99..101/y5·exit99..101/y7/center100,7. 같은 tile hash를 다른 에리어의 굴/seed/boss 복사의 근거로 쓰지 않는다. 지역4개는 각각 total>0/cleared=false/fbIdx−1이며 x=100 경계는 동측이다.

si21/23/25는 draw14 중 인덱스8(0기준)의 굴이 탈락해 timer0..7,9..13만 남는다. si22는 draw13 중 같은 인덱스8이 탈락해0..7,9..12, si24는13회 전부 남는다. seed20261020 최종 RNG state는 draw14=3323445034/draw13=2962398007이다.

`compose`, `hand_props_raw`, `gate_guard`는 null carrier+undefined_paths다. 마지막은 발췌 범위에서 아직 생성하지 않은 문지기 필드라는 뜻이며 실제 initStage가 null 문지기를 만들었다는 주장이 아니다. tile-only BFS START→3 exit 연결 검산은 prop/반경/문 권위가 빠져 실제 Player 종주 PASS가 아니다.

### 1.3 maps_data.js legacy 개별 맵 — 기본 경로와 분리

아래 정의는 존재하지만 기본 selector는 M0 clone을 선택한다. FIXED_MAPS[0] 부재 fallback·special/QA gate는 다른 입력이다. 크기/START/forge/spawn marker와 room/corridor/feature는 L/si21~25.json의 legacy_fixed 및 부록 D에 보존했다. declared room spawn을 기본 runtime 적 배치로 합산하지 않는다.

| si | 선언 행 | legacy 크기 | rooms | corridors | features | corridorSpawns | objs | RLE 숫자수 / coverage |
|---|---|---|---|---|---|---|---|---|
| 21 | M40904–43075 | 260×260 | 6 | 5 | 2 | 3 | 13 | 1866 / 67600 |
| 22 | M43078–45370 | 270×135 | 7 | 7 | 2 | 3 | 15 | 1930 / 36450 |
| 23 | M45373–49120 | 270×270 | 8 | 7 | 2 | 5 | 20 | 3322 / 72900 |
| 24 | M49123–53125 | 280×280 | 9 | 8 | 3 | 2 | 20 | 3542 / 78400 |
| 25 | M87054–91781 | 221×186 | 25 | 0 | 0 | 0 | 미정의 | 3926 / 41106 |

### 1.4 오브젝트·자동 배치·충돌·상호작용

CH5 raw 등록9=large/col7+scatter2(부록 B). 고유 PNG7종이다. prop_a와banner의 flip 변형을 별도 등록으로 세되 새 원화로 세지 않는다. tomb/weapon_pile은 retired이며 복원하지 않는다.

| ID / 원본 행 | 원문 계약·관측 전 경계 |
|---|---|
| O01 / G17487,17768–17780,18392–18426,18468–18488 | 초기meta77→CH5 raw9 in-place merge/이미지 등록. colSz75/62/90/50/50/55/60, keepAR/flip·absent/undefined/null/0 구별. dir=collision이라는 파일명만으로 collider를 만들지 않음. 이미지 callback/오류 fallback은 실제 로드 영역 |
| O02 / G25735–25806 | 기존 editor/gate 객체 필터→MAP_OBJS 재구성/hash200px. editor 충돌체는 굴거리<250+colR, START/BOSS<300이면 제거. 이후 자동배치 hash의 굴200/START·BOSS300 예약과 구별. _nearFloor는0/4·r1..9 원 순서 |
| O03 / G25807–25852,25875–25884 | lore 최대3(방·벽/seed gate,textIdx=stage*3+loreIdx)·combat breakable 조건부1~3/hp3·loot .80mat/.95potion/else none. stage>=5 altar는 random<.6/one combat room/floor-distance 조건. 실제 생성 수는 미확인 |
| O04 / G25854–25873,32798–32828 | 자동 trap 배치는 주석이다. 기존 trap/DOT runtime loop 존재가 CH5 bone-trap/배너버프 writer의 구현 근거는 아님. raw9에 해당 이벤트 필드는 없음 |
| O05 / G25914–26004 | compose path/hand 부재로 large 자동 경로. seed(stage*13+7,hell*97+3). openfield density=1+min(.85,floor*.22), target=min56/max28/trunc(floors/700*density), minDist760. side는 trunc(target*.35), 주석80%와 구별. 같은type1200·boss/exit/portal400·굴200·주변17²floor>=220 조건 |
| O06 / G26034–26047,26106–26163 | 기본 중앙 landmark=m_c5p1·nearFloor100,100 후보. unique pool=[m_c5p1,m_c5p2,m_c5banner,m_c5totem,m_c5arch], seed(stage*71+13,hell*53+7), minDist880/최대300시도. 목록5≠성공5 |
| O07 / G26278–26328 | scatter=bones/deco_bones_04 두종. target=min90/max40/trunc(floors/420)·거리400/START·BOSS300/주변7²floor·동일type1200/최대5 재선택. 목표89는 두종 각각89나 성공89를 뜻하지 않음 |
| O08 / G26329–26370 | 일반target=max50/min140/trunc(floors/260). normalDeco가 비어 **baseDeco9 전체 fallback**(large/scatter 포함), retry8/hash거리·굴200/주변9²floor>=60. 비충돌 소품만이라고 단순화 금지 |
| O09 / G26054–26081,26372–26472 | CH5 hand/painted-path pass 없음, hell0/1 자동눈깔props도 비선택. editor 객체 복원→metadata renderLayer/y sort. generator gate1과 최종 gate 잔존 여부/전체 MAP_OBJS를 혼동하지 않음 |
| O10 / G31682–31712 | identity/length 변경 시 prefilter 재구축, retired/noCol 제외·circle/ellipse/rotated colParts strict 판정. 원화 크기/flip을 임의 Physics 사각형으로 치환0. canMv 4corner·LOS16px 간격 원 권위. generic gate의 sz250→colSz100도 별도 보존 |
| O11 / G32829–32853 | lore<60/read·breakable<50/hp·loot·altar<60/used/buff/자원 refill 원 owner. 맵팀이 중복 자원 writer/저장 필드를 만들지 않음 |

_dcFloors=37,597에서 si21 large 목표53, si22~25 목표56·scatter89·일반140의 산술만 확인했다. **전체 initMapObjects 미실행으로 성공 개수·실효 앵커·lore/altar·콜리더 수는 미확인**이다. raw9나 목표 숫자를 manifest에 최종 결과로 적지 않는다. 후속은 실제 metadata merge/선행 editor/gate·동일 RNG/seed를 넘겨 원 함수를 관측해야 한다.

### 1.5 지형·빛·생동감의 원문 근거

| 원문 행 | 확인 범위 / 표현 확장 경계 |
|---|---|
| G16684,26480,26490,26517–26529 | w#3c3624/f#18140c/ac#ffcc44·EL.D·gt_ch5=assets/map/ch5/ground.png?v=20260816-detail. 뼈가루/황토/검은 군단 palette 근거, 같은 Canvas filter/광원 수를 강제하는 규정 아님 |
| G26564–26610(hell4:26597–26599) | tile0/2/4/5/6에 hash gate 후 rgba(214,196,150,alpha)의 작은 rect marks. 높이/계단/손상·뼈 스폰 writer 아님. editor RLE1→runtime floor0과 설계 height0=hazard를 혼용0 |
| G25619–25653,25680–25731 | torch/sway/glow/eye 초기화의 early return. 선언돼 있다는 이유로 실제 횃불·banner sway/glow가 설치됐다고 세지 않음 |
| G25668–25677 | initWallEyes는 hell!==3이면 return. **CH5 관측 WALL_EYES=[]**, CH4의6개 벽눈을 복제0. 원 함수 비실행 경로와 로드 실패/미관측을 구분 |
| G4639–4730 | 기존 static/dynamic light 수집·renderLighting 경계는 공통. CH5 profile에 원래 국소광이 완성됐다는 주장은 미확인. 표시시계와 simulation/Player 자원 tick 분리 |
| G53858–53874,52489 | 일부60~69 actor 장식/산소방울의 맥동은 적·item 렌더 코드다. 맵의 자동 조명·환경 생동감 인수와 별도. 이번 화면 관측0 |

### 1.6 CH5 고유 게임플레이 규칙·스폰·지역·문·arena·전환

군단 로어/이미지만 보고 **수중 계열의 현행 코드를 제거하거나 순수 표현으로 취급하지 않는다.** 아래는 원문 사실이며 맵팀이 Player/QE·적/보스 owner를 대행할 권한은 아니다.

| ID / 원본 행 | 확인한 계약 / 실제 연결 경계 |
|---|---|
| F01 / G30979,30985,30991–31030 | HELL_SPAWN[4] 31etype/weight합151(부록 B)·원거리Set 교집합8. rollEtype은 .5 원거리 가중분기/나머지 CDF 최대12 재시도·fallback2. rollEl은 EL.D bias .45 후6원소 균등경로(최종 dark확률을45%로 고정하지 않음). S50/M100/L100, CH1 stage0 축소계수 적용0 |
| F02 / G31029–31168,35636–35693 | 소환굴 활성/거리·시계/RNG/alive cap·적 factory·_homeX/_homeY/킬 귀속·완료 owner. 원문 분모를 실제 actor 스폰 가능 수로 속이지 않음. 31etype native 지원 미확인 |
| F03 / G32746–32756 | hell4에서 st=max(0,st−mst*.02/60*sp). st<=0/iframes<=0일 때 seaDmg=~~(mhp*.05/60*sp), >0일 때 hp=max(1,hp−seaDmg). 매갱신 정수 절삭으로0이 될 수 있어 “실효 무조건 초당5%/즉사”라고 바꾸지 않음. 같은 hell이므로 코드상 field/arena 구분 gate 없음, 실제 소비 인수는 미확인 |
| F04 / G33018–33043 | 일반 이동 분기의 seaMul: 잡힘/마비>0이면0, 아니면 hell4 .7/다른장1. web/freeze와 곱하고 canMv 축별 이동. 잡힘/마비 timer와KB 감쇠·행동 gate. 이를 모든 돌진/패링에 동일 .7을 추가하는 지시로 확대0 |
| F05 / G42913–42916,32925–32931,52489 | etype60~69 사망시 random<.3 산소방울 drop·위치±10. R 상호작용 흐름의 !chestOpened·거리<30일 때 picked=true/st=min(mst,st+mst*.2)·첫1개 후break. 자동 근접획득·항상drop·새재화/save권위가 아님 |
| F06 / G30831/30881,31325–31336,39810–40022,42917–42945 | 원60~69는 심해보행자/아귀/해파리/갑각/익사자/장어/산호/인어/거대어/대사도 코드 계열. 잡기·마비·수역 등 실제 AI/사망 효과 접점. STG의 군단 보스명만으로 actor AI identity를 같다고 단정0. 전체 mkEn/보스 리바이브/스킬 실행은 미확인·별도 보스담당 |
| F07 / G31573–31655 | 문지기 후보etype59/EL.D·hp4배/atk2배/r1.4배/poise80·호위4~6/주변8~12는 tile0 gate 안쪽. candidate tile4 조건불충족과 실제 actor 미관측을 구별 |
| F08 / G60688–60732,60766–60793 | 200²는4분면, 최종굴 합/원래home 좌표 kill(ib 제외)·지역ratio>=.8−1e−9·문지기+.10은 gate지역만·latch·15tick throttle. CH5 fbIdx−1/CH1 앵글러 요구0. 5에리어와4지역 구별 |
| F09 / G41868–41917 | 비arena/bossAlive·4/4지역clear→bossUnlocked. si0 _fbDone 예외는 CH5 적용0. exit tile를 밟아야 bossLoadPhase1, 지역 없는 작은맵만 전역80% fallback. stageCleared와 unlock을 합치지 않음 |
| F10 / G30697–30814 | hell4→arena type4 **타원형128×108**, 별도 공간/기둥 없음. nx=(x−64)/62,ny=(y−54)/52, nx²+ny²<=1·경계rune5. entry64,103/boss64,54/exit64,1. tile1/4/5=3713/9791/320, SHAc924ca37e517565cc21bd145d0908d4ba72ad27750c1560f131d75102a62cd91. field백업·잔여nonboss킬합산/actor·굴·props정리·90iframe·bossfactory 원순서 |
| F11 / G41782–41856 | loading50/130/50/100ticks·30frame poll·boss/revive 종료 확인→bossAlive=false/clearTime/chest/exit3폭. 별도 arena before/isolated exit geometry도 원문으로 관측했으나 실제 보스 처치·전이 PASS 아님 |
| F12 / G41917–41957,43896,63657–63664 | 보스 사망 뒤 exit→stageCleared/+10SP/결과UI→사용자 다음 진행→showStageTransition/nextStage. **21→22→23→24→25→26(6장)**, si25는 전체승리 아님(stage>=35에 doWin). 기록용90%kill을 새clear조건으로 추가0 |
| F13 / G30149–30215,30646–30675,41857–41867 | 공통 zone/portal6/cache는 있으나 기본 G._zones=null·clone template portals 없음. CH5 내부 zone save/로딩을 날조하지 않음. legacy에도 portals 미정의 |
| F14 / G31669,35877–35881,43872/43899,63481–63497 | stage/boss/death/victory BGM·arena death backup 복원·재진입/Player reset은 Main/State/사운드/보스 담당. 이번 save schema/오디오·dummy progression 설치0 |

아레나 관측은 원 genBossArena(si) 반환 맵을 임시 G geometry carrier에 넣고 G41841–41850의 원 exit 분기만 실행한 뒤 finally field G를 복원했다. before/after 차이는 x63..65/y1의 **1→0 세칸**, exits 메타는 center64,1 한개다. cache/VFX/kill/actor를 stub READY로 호출하지 않았다. before/after 전체 맵과 source scope는 각 si JSON에 있다.

## 2. docs 불일치·미확인 표

기존 설계/LOCK/타 담당 문서0줄. 로어·향후 목표와 현재 게임플레이를 한 표에 병기하며 원본 동작을 설계 쪽으로 몰래 고치지 않는다.

| docs 위치 | 기록 / 목표 | 현재 원본·관측 | 처리·보호 |
|---|---|---|---|
| MAP_BIBLE_v3 (1).md:265–285 | 5에리어·300/350/350/350/300²·vert/horiz/grid·개별명 | 5개 일치, 기본모두200² clone. STG는 지옥 군단N구역. 개별 M 정의도 설계크기와 다름 | 크기/동선은 현 source 계약. docs명은 시각 working label 가능, source 크기 확대0 |
| 같은문서:287–304 | 성벽 높이공격·깃발근처버프·뼈산 밟으면spawn·파괴공성무기·텐트매복·군단형 몬스터 | 등록9에는 해당 writer/이벤트필드 없음. generic lore/altar/breakable과60~69 해양계AI·O2/감속 규칙 존재 | generic props를 새buff/trap/계단/적 AI로 바꾸지 않음. 이벤트별 실제 writer·Player/적 owner 인수 전 미확인/HOLD |
| 같은문서:306–319 / BOSS_CANONICAL_MAPPING.md:58–62 | 미니보스2/4·군단 지휘관·십자형arena/4방향증원 | 이름/si22,24,25 매핑은 일치, 런타임STG는5개 boss slot. 원 arena는 **타원형128×108**. 명칭만으로 문서의 강화/소환AI 인수 완료 아님 | 양쪽 명칭 보존. 실제 AI/스폰/리바이브는 보스 담당, geometry는 타원 원문 보존 |
| WORLD_STRUCTURE_SSOT.md:74 | 5장/물리·암흑/5개/21~25 | 장·범위 일치, STG be=EL.D·spawn bias[3,.45]. 원 추가수중규칙은 이 요약에 없음 | 원 규칙 누락이 삭제 승인 아님. 노출/밸런스 변경은 별도 결정 |
| 맵구성_지옥전체.md:7–15,27 / 맵제작_SSOT.md:274 | 이미 진 전쟁·공성탑/해골깃발의 장 얼굴 | 기본 중앙landmark m_c5p1, unique5자동후보. generic clone/원화9만으로 완성공성탑 환경 인수 불가 | 시각 MASTER에서 활용하되 source상 없는 위치·collider·이벤트 확정값으로 날조0 |
| 맵오브젝트_에셋목록.md:197,330,623,861 | retired wpile·gt_ch5·banner380/col50·CH5 unique5 | 해당값 일치. 실제raw9는large7/scatter2·자동unique pool5이고 성공5 보장없음 | 삭제 자산 복원0, 등록·목표·실효성공수 분리. PNG byte만 확인 |
| tilemap-editor.html.bak/.bak2/.broken의 CH5뇌전 | tesla/spark crystal/thunder mark 구카테고리 | 현 `_CH_DECO[4]`·STG·G32746 규칙의 권위 아님 | 백업 editor를 기본 source로 채택0, 번개 기믹을 신규 구현0 |
| _MAP_SSOT_INDEX.md:269–279 | field200²/로어↔runtime 분리/내부 무로딩 LOCK | 기본field일치, arena128×108 별도. CH5구역별LOCK은 해당 index미확인 | world depth 확장은PLAY/RIM/OUTER 표시계층. 크기/경로/스폰 수정 승인으로 해석0 |
| MAP_RUNTIME_ARCHITECTURE / REGION_CLEAR_GATE | tile1 solid·prop/hill 별도·최종굴4분면80% | 원 isW/canMv·region 계산과 일치. 원문행 이동/현재tile3없음·gate는 남음 | CH1 hill/angler·새region분모 복제0, 최종 source 함수/행으로 검사 |
| GUIDE v0.9 §1–2 / MAP-LOOK:80,94 | scatter로완성금지·6~10시각지역·현재1-1 RETOUCH | CH5 source자동배치/게임플레이지역4. CH1프로파일수치/품질을CH5로이전할근거없음 | 시각6~10구성층 제안은 가능, gameplay4지역불변. 광원개수/성능은미확인 |

## 3. 현재 Godot main: 의존과 빠진 소비자

아래는 고정 823c24baee3f6c5f058ebfd7776721e86f80bd18의 실제 파일을 읽은 결과다. main 전체 Git path 중 ch5/stage21~25 명명16개는 전부 assets 경로이며 CH5 source/contract/reader/World 경로는 없다(L/godot-ch5-paths.json). 일반 유틸/장제목 상수의 존재와 stage별 게임 연결을 구분한다.

| main 파일 / 위치 | 있는 것 / CH5에 빠진 것 |
|---|---|
| export_world.mjs / world.gd:22–23,906–971,1072/1109 | 제품map.json/encounters.json stage0·200²/청크64 제약. CH5 snapshot을제품map으로자동교체0 |
| export_ch1_area_source.mjs:33,85–111,151–164,172–198 | 지원0/1/4·observeNative·정확출처·scope·CLI helper. stage21/schema/chapter4-deco선택·compose부재·CLI hand.length부재대응없음. CH3끝후속통합과도구소유인수필수 |
| export_ch1_area_resources / export_ch2_area_resources | native metadata/initMapObjects·같은VM observer·isW/canMv/LOS·asset/hash pipeline. CH5자동seed/unique/normal fallback·최종gate/lore/콜리더 실효관측없음. 마감main CH2writer의같은내용/실제commitbytes 검증후manifest유지 정책은후속보존 |
| ch1_map_source/stage1_contract / ch2_map_source/stage4_contract | pure integer/hex/literal/hash/same·동일raw READY/NOT_READY API. CH5 source/contract없음. 부재carrier null을받는지 helper정확검사 필요 |
| native_ch1_area_resources/world / native_ch2_area_resources/world | strict manifest·tile Physics/analytic props·fixture 수명. CH5전용inputs/실제Player/interaction/스폰/문/arena연결없음 |
| world.gd:343–351,668–676 | CH5원9meta/경로등록존재, 원고유PNG7+ground byte일치. 등록/텍스처존재≠si21..25선택/실효배치/렌더/제품플레이인수 |
| enemy_factory.gd:60–61,151 / native_spawn_hole_system:37,214/333/435이후 | factory source requiresCH1 stage0, holes STAGE0·현factory/owner. CH5 31etype·EL.D·개별굴분모/수명·실제kill·지역귀속 인수없음. 상수0만21교체0 |
| native_regions.gd:42–106,126–159,243–261 | 일반4분면·CHAPTER_STARTS21·장제목존재. actualG/P/World/Main identity와최종CH5굴 설치완료증거없음. 5장표제가능성을진행완료로세지않음 |
| main.gd:106,125–138,238,265–280 / source_new_run_state | 부트/Player.set_world·SourceNewRunState·굴→지역·MAP-LOOK 설치접점. field/arena owner 교체/clear/21→26진행은없음. 새clock/중복State 생성0 |
| player.gd / native_normal_enemy_hurte / state 소유 | 현재P자원·이동·피해·효과소유. G32746 st drain/HP절삭·일반이동seaMul·잡기/마비/O2 pickup 등 실제소비 확인은미확인. 자료 JSON의9999타이머필드만으로구현주장0 |
| native_map_look.gd:13–21,93–119 / native_screen_lighting | DATA_FILE map_look_ch1.json·PROP_DIR고정·부분광/요철/그림자/가림/시차. CH5실효props/굴입력profile·천/먼지·국소광·cleanup/실전가독성/성능인수없음 |
| 보스/사운드/HUD 담당 | stage별보스factory·revive/kill·BGM/보스전/지역표시·결과/미니맵권위 인수필요. CH3통합HOLD를CH5문서작업으로해제0 |

### 3.1 검산·원로그·미실행 범위

source-audit와 별도 새VM replay는 각각 exit0/stderr0이다. 각 si JSON 전체 깊은 일치·타일길이/byte SHA/개수·최종굴 count/분모/독립분면합·부재mask/START/gate/initial object/문지기후보·별도타원/runes의독립수식·출구3칸차이·tile-only BFS·RNG탈락순서·PNG byte를 **90항목/차이0**으로검산했다(L/audit-checks.json). 이는 **source/정적·VM 산술 검산 수**이며 신규 게임테스트 PASS 수가 아니다.

L에는원G/M·5개si全JSON/replay·92symbol×5색인·M0/21~25정의전체행/SHA·CH5규칙정적발췌·legacy입력·원화byte·docs검색210매칭행·도구/접점사본·보호/제출검증을보존했다. 전체initStage/initMapObjects/mkEn·브라우저·Godot·GUI·404·FPS·캡처·실제세이브IO0이다. Godot실행이없으므로pgrep대기/override작성0, 기존회귀·알려진로비8/맵9/타팀결함의새판정0이다.

## 4. 표현 확장안 — 게임플레이 불변의 별도 제작 범위

아래는 **후속 제안**이다. source에이미구현된환경이나승인된새게임플레이가아니다. 스태미나/O2/감속을그림연출만으로대체하거나삭제하지않으며, 군단로어와원수중규칙의관계는총괄/게임플레이담당결정이필요하다. 원문바이트를수정해설계와맞추지않는다.

| 제작 축 | CH5 확장안 / 보존·인수 조건 |
|---|---|
| MASTER / 깊이 | field200²·START/EXIT·굴/지역십자/실효collider overlay 잠금후 PLAY/RIM/OUTER에전쟁폐허·기울어진공성탑·해골깃발·요새상부/하부원경을구성. 바닥한장+scatter를완성목표로삼지않음. 수직mass/난간/단차그림은읽히되새고저차공격·낙하/막힌길을생성0 |
| LARGE→MEDIUM→GROUND | 거대한전쟁구조를원경/비보행시각층에계층화하고중형골조/천/갑주잔해를바닥의뼈가루·흙·접지/마모로연결. source상콜리더/상호작용anchor와시각전용mass구분, retired무기더미복원0. 새소품숫자나world청크64를품질목표로삼지않음 |
| 부분광 | 암갈색/차가운그늘과요새틈/천뒤에서새는국소의탁한호박빛·Player/전투광의옆면/바닥반응. 깃발/토템이원자동광원이라는주장은하지않음. 장profile과visible/neighbor선택·동시광예산·가림/normal강도는실측후확정, CH1광원37/반경/근경27복사0 |
| 생동감 | 원깃발의밑동고정천끝미세흔들림·먼지/재/뼈가루입자·공성줄/쇠사슬의약한미동·정체된저층안개제안. 신규O2spawn/버프/적AI를표시용으로재구현0. 표시시계·seed는simulation과분리, pause/입장/재진입/종료/실패cleanup·누수/가림검사 |
| 원근 / 가림 | 경계밖기울어진탑/뼈아치/깃발대의희미한전경시차와멀리겹치는요새층, 걷는영역·Player/적/탄막/loot위가림완화정책. minimap·조준·hit-query/world좌표는불변. coverage/alpha/시차/성능수치는미확인 |
| 5에리어구분 | docs workinglabel만시각축으로: 5-1패전입구/먼공성탑→5-2뼈가루/낮은골조밀도→5-3병영천/큰진입mass→5-4기사단의높은깃발/그늘→5-5요새압축/arena해방. 뼈밟으면spawn·매복텐트·버프깃발·진형적을새게임플레이로추가하는지시가아님 |
| 전투/품질인수 | GUIDE순서로큰실루엣/접합부터확정, 8뷰START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT·실창1x·전투Player/다수적/탄막/패링색/loot·부분광ON/OFF·일시정지/재입장·seam/cache수명·GPU성능검사. 원문검산통과≠VISUAL PASS. 렌더2D/2.5D/3D선택도별도실측/소유자결정 |

## 5. CH5-01부터 작은 구현 단위 목록

후속 배정 제안이며 이번 구현0이다. source→실효배치/독립소비자를 먼저 확정하고, 표시/실제진행은 별도인수한다. 공용/도구/타담당 권위가 필요하면 필요한 위치만 보고 BLOCKED/HOLD, 다른stage나원본을통과용수정하지않는다.

| 단위 | 범위 | 산출·검수 | 의존·완료 경계 |
|---|---|---|---|
| CH5-01 | si21 source snapshot·순수계약 | 인수된 단일 exporter stage21/si21.json/stage21_contract·검사. 굴13/1000·150,300,350,200·전쟁의잔해 | §5.1 지시서. 실제World/Main/State0 |
| CH5-02 | si21 실효배치·독립소비자 | 동일VM metadata/initMapObjects·analyticquery·CH5resource/reader/fixture·8뷰/1x·RETOUCH여부 | CH5-01 및 기존CH1/CH2 API인수. raw9/자동목표를실효로대체0 |
| CH5-03 | si22 source·순수계약 | 동일 exporter/전용JSON·contract·검사. 굴12/900·지역150,300,250,200·뼈산의 왕 | CH5-01 방식, 뼈 산(docs명). stage별seed/탈락timer·si25장보스/다음26보존 |
| CH5-04 | si22 실효배치·독립소비 | 해당stage 자동seed/원메타·전체질의·tile Physics·START→EXIT/수명·8뷰/1x | 바로앞source·CH5-02 API인수. 다른stage/공용0줄, 실Player/전투미연결이면fixture범위 |
| CH5-05 | si23 source·순수계약 | 동일 exporter/전용JSON·contract·검사. 굴13/1000·지역150,300,350,200·악마 사령관 | CH5-01 방식, 악마 병영(docs명). stage별seed/탈락timer·si25장보스/다음26보존 |
| CH5-06 | si23 실효배치·독립소비 | 해당stage 자동seed/원메타·전체질의·tile Physics·START→EXIT/수명·8뷰/1x | 바로앞source·CH5-02 API인수. 다른stage/공용0줄, 실Player/전투미연결이면fixture범위 |
| CH5-07 | si24 source·순수계약 | 동일 exporter/전용JSON·contract·검사. 굴13/1000·지역250,200,350,200·철벽 기사단장 | CH5-01 방식, 기사단 진지(docs명). stage별seed/탈락timer·si25장보스/다음26보존 |
| CH5-08 | si24 실효배치·독립소비 | 해당stage 자동seed/원메타·전체질의·tile Physics·START→EXIT/수명·8뷰/1x | 바로앞source·CH5-02 API인수. 다른stage/공용0줄, 실Player/전투미연결이면fixture범위 |
| CH5-09 | si25 source·순수계약 | 동일 exporter/전용JSON·contract·검사. 굴13/1000·지역250,300,250,200·군단 지휘관 | CH5-01 방식, 지휘관의 요새(docs명). stage별seed/탈락timer·si25장보스/다음26보존 |
| CH5-10 | si25 실효배치·독립소비 | 해당stage 자동seed/원메타·전체질의·tile Physics·START→EXIT/수명·8뷰/1x | 바로앞source·CH5-02 API인수. 다른stage/공용0줄, 실Player/전투미연결이면fixture범위 |
| CH5-11 | 대표시각 vertical slice / 5개profile | §4 MASTER→OUTER MASS→GROUND부터·원실효props/굴입력·부분광/생동감·8카메라/전투가독성/ON-OFF | CH5-02이후대표1에리어부터, MAP-LOOK owner인수. simulation불변 |
| CH5-12 | 실제actor·굴·지역·문·arena / CH5규칙 | actualG/P/world·31etype·자원drain/일반감속/O2·kill/4지역/문·별도타원arena/보스revive | Main/Player/State/적·보스/P3권위인수전 HOLD. 단계별분리배정가능, dummyactor/가짜kill0 |
| CH5-13 | 21→26 lifecycle / 결과·다음장 | field/arena 소유교체·HUD/BGM·Player reset/refill·사망/재시작/재입장·종료cache·save보호 | CH5-12·Main/State/sound owner. save schema/중복clock/강제소생 새설계0 |
| CH5-14 | 5에리어실제플레이·시각인수 | Player/다수적/지역/굴/보스/다음장종주·8카메라×5/1x·광원가독성·재입장/GPU/성능 | source/기술/실전/시각각별도판정. 미완영역PASS합산0 |

### 5.1 1번 CH5-01 — si21 원본 snapshot·순수 계약 구현 지시서

| 항목 | 바로 실행 가능한 후속 지시 |
|---|---|
| 목표 / 범위 | si21 readonly source snapshot·순수 read_area/validate_area만 만든다. Main/제품World/State/Player/적/문/보스/굴·지역 owner/MAP-LOOK 설치0, runtime_bound/full_stage_ready/visual_verified=false. 원화 byte참조만·생성/변환/제품복사0 |
| 기준·의존 | 작업시fetch후최신main의G/M SHA·지원stage를재확인. 현재main0/1/4+observer, 별도CH3체인f0ad1a32는사용자지정순서후통합예정. CH1/CH2/CH3·PC도구재맞춤/cli_paths owner인수선행. 승인없는공유hunk필요시 BLOCKED, 옛파일로전체덮어observer/stage/CLI보호를잃지않음 |
| 수정후보 / 금지 | 인수된 export_ch1_area_source.mjs의stage21 선택/schema/장데코/부재/CLI경로만대상필드한정. 제품map.json/encounters·기존snapshots/공용6·P3/State/저장0줄. 동시소유도구상태확인전새중복exporter/우회등록추가0 |
| 신규후보 | godot/data/ch5_map_source/si21.json, godot/port_modules/ch5_map_source/stage21_contract.gd, test/fdgCh5Stage21Source.test.mjs, godot/tests/test_ch5_01_stage21_source.gd·자기UID2·docs/engine/orders/reports/ch5-01_REPORT.md. 아직제품파일아님 |
| 추출closure | G16631–16713·M6–55·G30042–30085/30135–30147/30218–30694·START31564–31566·region60697–60718. _MAP_COMPOSE전체AST키/행/SHA→21부재증명후projection. 원mkRng/_tseed/generator연산·순서보존. QA map/legacy21로대신선택0 |
| 구체도구접점 | 현재33 support gate,85–111 authored/CH_DECO선택·capture,128이후asset/schema,151–164 provenance/observer,172–198 CLI/출력. si21→hell4/장5/CH_DECO[4]다. expression(_MAP_COMPOSE,21)의missing throw와 CLI hand_props_raw.length를부재계약에맞게처리, []로수리0. isInsideRoot/isMatchingSnapshot/isDirectExecution helper와OS별경로동작보존 |
| CLI / 쓰기보호 | 제안 `<node-bin> <tool> <explicit-source-root> <explicit-output-json> --stage 21 --seed 20261020`. sourceRoot=R 기본값0, 내부출력자기si21 JSON만/외부명시JSON만. 타schema/stage·제품map·symlink조상/끊긴link/junction·잘못된seed·지원밖stage를쓰기전거절. CLI허용확장은소유자인수범위내 |
| schema/출처 | 제안 exoduser.ch5-area-source.v1/stage21. source.main_sha/extraction_head 분리,game/maps·원화SHA/bytes·symbol file/line/end/SHA·selector문장. 원SHA변경시재관측/재인수, 원본문을예전기대값에맞추는수정0. Node에서기록commit의실제gamebytes를먼저검사한뒤출처차이만정규화 |
| grid / START·문 | 200²/T40/40000·tile38986/36/3/0/975·SHA5b40eb67…b87e. 초기editorRLE[1,40000]와최종타일구별. START100,185→4020,7420,gate99..101/y5/exit99..101/y7·initialboss_gate_col4020,160·문지기후보100,8 tile4. tile3=0/gate유지 |
| 굴 / 지역 / RNG | si21 최종13굴/1000·NW150/NE300/SW350/SE200, 부록A.1의순서/좌표/size/room/count/timer전수고정. 모두cleared=false/fbIdx−1. seed20261020/draw14/final3323445034,살아남은timer인덱스0..7,9..13. 인덱스8이탈락했어도난수소비삭제0; seed0/max실제관측·동일입력재현 |
| 부재 / 등록 / 자산 | compose/hand_props_raw·아직미실행gate_guard 부재를null carrier+undefined mask로보존. null/absent/0/[]구별. raw9/base77/9참조·고유7PNG+ground1(전체입력파일10=G/M+8원화)·원path/bytes/SHA. 원meta/pivot/flip/col 선언을render확정값으로승격0 |
| arena / 규칙범위 | CH4-01과동일source최소범위로field우선, 추가arena를선택하면원genBossArena21/128×108타원·처치전벽/원3폭opening·scope를별도검증하고실제kill/진입미연결표시. 미선택이면NOT_OBSERVED. G32746 st/O2/seaMul 규칙은정적참조만·Player/상태writer설치0 |
| scope / API | source_snapshot_only/save_access0/init_map_objects_executed=false,final_MAP_OBJS/실효배치/prop_colliders=NOT_OBSERVED. raw9·목표53/89/140은최종성공수아님. READY의value/raw동일참조,NOT_READY는reason/raw동일참조·최상위value없음. IO/RNG/clock/Node/State/저장·입력보정0, 기존helper의null carrier비교지원확인 |
| 독립Node검증 | 최신원문AST→selector/gen/START/region전체깊은일치,타일SHA·굴/분모/분면/seed/timer·raw9/base77·원화byte/부재mask·출처검사. 동일seed/0/max·출력거절·기존0/1/4 및인수된CH3단위전데이터재추출/observer회귀. snapshot뒤observer변경역전파0. 원함수stub/가짜PASS0 |
| 후속Godot순수검증 | 실제JSON READY/동일참조/반복/불변·globalRNG불변,wrongstage/null/누락키/출처·tile39999/같은count다른hash·굴순서/size/room/timer/분모/경계·부재[]치환·assetpin·허위runtimeReady거절. test_contracts 및관련CH1/CH2/인수CH3순수/맵/지역/굴회귀. 제품Main/World부트0인새순수검사와기존회귀부트를구분 |
| 격리 / 하니스 | 새 userdir EXODUSER-ch5-01-Isolated-20261020, 기존검사는파일상수. Godot매실행전 `pgrep -f "Godot.app/Contents/MacOS/Godot" \| wc -l`이2이상이면30초대기/재확인. stdout전조각join또는UTF-8임시파일·node경로 --node-bin/명시source-root/source-game. override실행마다작성/finally비움. 이번문서Godot0 |
| 완료인수 | 정상pre-commit/docs-sync·경로지정stage·자기branch push/원격SHA→DONE/자기WT제거·R불변·원로그/실제수치. source READY를실제CH5/시각/전투승인으로세지않으며선재실패를skip/제외해가짜합계0 |

## 6. 공용·다른 담당 접점 — 이번 모두0줄

| 파일·현재 위치 | 후속 필요·권위 |
|---|---|
| export_ch1_area_source.mjs:33/85–111/151–164/172–198 | CH5-01의공유도구후보. CH1/CH2/CH3/PC순차재맞춤소유인수·stage입력부재/CLI/observer회귀선행, 이번변경0 |
| main.gd:106/125–138/238/265–280 | 실제world/player/state identity·굴→지역/표시·field/arena lifecycle/실패종료·전환시계. CH5-12/13에서Main소유자확정후만 |
| world.gd:22/343–351/668–676/906–971/1109이후 | stage별맵/충돌·동적actor·texture/cache·현재Player연결. 제품stage0고정file을임의교체0, 독립CH5소비자는먼저자기경로설계 |
| native_spawn_hole_system / enemy_factory / 보스담당 | 실제31etype/EL.D·holealive/RNG/킬귀속·보스revive·타원arena수명인수. ordinaryactor/dummykill로대체금지 |
| native_regions.gd / hud.gd | 최종굴4분면·clear/문/장제목·미니맵cache/결과/동일actualstate. 표시용시각region을게임플레이지역으로저장0 |
| player.gd / native_normal_enemy_hurte / native_source_new_run_state | CH5st/HP절삭·seaMul/잡기/마비·O2실제owner·stage/arena현재G/P/진입refill/iframe·deathreset. Q/E/기존자원공식·저장schema/중복State쓰기0 |
| native_map_look.gd:13–21/93–119 / screen lighting | CH5profile·실효props/굴읽기·부분광/시차/천/먼지/가림·pause/원복/cleanup. 현CH1전역profile수정0, 별도소유자인수 |
| sound/Main/postStage | 실제stage/보스/사망/결과/BGM전환 owner. 기존SND HOLD를맵문서로해제하거나audioReady날조0 |

공용6파일은 같은 scripts 디렉터리의 main.gd/world.gd/player.gd/hud.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd다. 공유추출기·P3·factory·MAP-LOOK도타담당이다. 실제 추가 줄수/API는 **미확인**이며 이 표는 패치·승인이 아니다. source-only 첫단위는공유도구인수외제품0줄로설계, 실제진행은HOLD다.

## 7. MAP PRODUCTION REPORT — GUIDE §23, 문서 전용

| 항목 | 실제 결과·한계 |
|---|---|
| STAGE / MASTER | CH5 si21~25·기본field200²/START·EXIT/굴64/분모4900/4분면·별도타원arena추적. 새MASTER/레벨제작0 |
| OUTER MASS / LARGE | raw등록9/고유7PNG·자동formula/unique5·원화byte대조. 새mass/composite/asset/시각접합제작0 |
| MEDIUM / GROUND | meta/col·초기RLE/최종tile·황토/뼈가루mark구분. 천/먼지/요철/부분광/접지는후속제안 |
| PLAYABLE / LANDMARK | tile-only START/EXIT연결검산,실효props/반경/Player/적/상호작용·CH5자원/O2·보스/다음장종주미확인 |
| CAMERA QA | 8뷰/1x·실창/전투광·시각연속성/전체맵미관측,캡처0 |
| TECH QA | 원문발췌/replay exit0·stderr0·90산술차이0,Godot/브라우저/404/성능/실게임인수0. CH5 WALL_EYES0은원gate결과 |
| FILES / GIT | 이md1+CHANGELOG최상단절만,source/product/test/shared/asset/save0줄. 정상훅·자기branch/원격SHA→DONE→자기WT제거 |
| VISUAL VERDICT | **NOT_OBSERVED / 미확인**. 이번시각PASS/RETOUCH판정0,기존CH3RETOUCH는별도이력 |
| NEXT PASS | CH5-01후속배정가능. 도구인수없으면BLOCKED,CH5-12/13실제통합은권위인수전HOLD. CH3최신main merge/CH3-06착수0 |

## 부록 A. 최종 소환굴 전수표 — 64개

G30042–30085 clone/jitter·G30486–30626 후보/탈락 후 순서다. world pixel 좌표이며 tile/r이 아니다. M0 수동9개만복사하지않고room/corridor spawn입력까지소비했다. timer는seed관측값/원count는G31030, 실제부트RNG/actor생성완료주장0이다.

### A.1 si21 — 13굴 / 1000

| 순서 | 원문 발췌 평가값 |
|---|---|
| 0 | `{"x":3100,"y":6500,"size":0.5,"timer":626.6127036558464,"alive":0,"room":1,"count":100}` |
| 1 | `{"x":6060,"y":5860,"size":0.3,"timer":604.7168261278421,"alive":0,"room":1,"count":50}` |
| 2 | `{"x":2500,"y":6060,"size":0.5,"timer":649.1745246900246,"alive":0,"room":1,"count":100}` |
| 3 | `{"x":5180,"y":4580,"size":0.3,"timer":659.873741492629,"alive":0,"room":1,"count":50}` |
| 4 | `{"x":3100,"y":4340,"size":0.5,"timer":633.7220967421308,"alive":0,"room":1,"count":100}` |
| 5 | `{"x":5500,"y":3300,"size":0.5,"timer":627.2437736671418,"alive":0,"room":1,"count":100}` |
| 6 | `{"x":2300,"y":1860,"size":0.3,"timer":616.527377567254,"alive":0,"room":1,"count":50}` |
| 7 | `{"x":5780,"y":1220,"size":0.5,"timer":607.309211846441,"alive":0,"room":1,"count":100}` |
| 8 | `{"x":3780,"y":6220,"size":0.3,"timer":639.5145520661026,"alive":0,"room":1,"count":50}` |
| 9 | `{"x":3060,"y":3420,"size":0.55,"timer":613.9419078407809,"alive":0,"room":1,"count":100}` |
| 10 | `{"x":4820,"y":1900,"size":0.8,"timer":648.3127542212605,"alive":0,"room":1,"count":100}` |
| 11 | `{"x":4020,"y":5540,"size":0.3,"timer":641.384222083725,"alive":0,"room":-1,"count":50}` |
| 12 | `{"x":4020,"y":4140,"size":0.3,"timer":646.4279907848686,"alive":0,"room":-1,"count":50}` |

### A.2 si22 — 12굴 / 900

| 순서 | 원문 발췌 평가값 |
|---|---|
| 0 | `{"x":2100,"y":6580,"size":0.5,"timer":626.6127036558464,"alive":0,"room":1,"count":100}` |
| 1 | `{"x":5460,"y":6860,"size":0.3,"timer":604.7168261278421,"alive":0,"room":1,"count":50}` |
| 2 | `{"x":2580,"y":4940,"size":0.5,"timer":649.1745246900246,"alive":0,"room":1,"count":100}` |
| 3 | `{"x":5500,"y":5420,"size":0.3,"timer":659.873741492629,"alive":0,"room":1,"count":50}` |
| 4 | `{"x":3220,"y":3700,"size":0.5,"timer":633.7220967421308,"alive":0,"room":1,"count":100}` |
| 5 | `{"x":5620,"y":2940,"size":0.5,"timer":627.2437736671418,"alive":0,"room":1,"count":100}` |
| 6 | `{"x":2100,"y":1900,"size":0.3,"timer":616.527377567254,"alive":0,"room":1,"count":50}` |
| 7 | `{"x":5260,"y":1500,"size":0.5,"timer":607.309211846441,"alive":0,"room":1,"count":100}` |
| 8 | `{"x":3780,"y":6220,"size":0.3,"timer":639.5145520661026,"alive":0,"room":1,"count":50}` |
| 9 | `{"x":4820,"y":1900,"size":0.8,"timer":613.9419078407809,"alive":0,"room":1,"count":100}` |
| 10 | `{"x":4020,"y":5540,"size":0.3,"timer":648.3127542212605,"alive":0,"room":-1,"count":50}` |
| 11 | `{"x":4020,"y":4140,"size":0.3,"timer":641.384222083725,"alive":0,"room":-1,"count":50}` |

### A.3 si23 — 13굴 / 1000

| 순서 | 원문 발췌 평가값 |
|---|---|
| 0 | `{"x":2740,"y":6780,"size":0.5,"timer":626.6127036558464,"alive":0,"room":1,"count":100}` |
| 1 | `{"x":4900,"y":5700,"size":0.3,"timer":604.7168261278421,"alive":0,"room":1,"count":50}` |
| 2 | `{"x":2860,"y":5100,"size":0.5,"timer":649.1745246900246,"alive":0,"room":1,"count":100}` |
| 3 | `{"x":5540,"y":5820,"size":0.3,"timer":659.873741492629,"alive":0,"room":1,"count":50}` |
| 4 | `{"x":3820,"y":4780,"size":0.5,"timer":633.7220967421308,"alive":0,"room":1,"count":100}` |
| 5 | `{"x":4860,"y":3100,"size":0.5,"timer":627.2437736671418,"alive":0,"room":1,"count":100}` |
| 6 | `{"x":3100,"y":2940,"size":0.3,"timer":616.527377567254,"alive":0,"room":1,"count":50}` |
| 7 | `{"x":5140,"y":2420,"size":0.5,"timer":607.309211846441,"alive":0,"room":1,"count":100}` |
| 8 | `{"x":3780,"y":6220,"size":0.3,"timer":639.5145520661026,"alive":0,"room":1,"count":50}` |
| 9 | `{"x":3380,"y":3420,"size":0.55,"timer":613.9419078407809,"alive":0,"room":1,"count":100}` |
| 10 | `{"x":4820,"y":1900,"size":0.8,"timer":648.3127542212605,"alive":0,"room":1,"count":100}` |
| 11 | `{"x":4020,"y":5540,"size":0.3,"timer":641.384222083725,"alive":0,"room":-1,"count":50}` |
| 12 | `{"x":4020,"y":4140,"size":0.3,"timer":646.4279907848686,"alive":0,"room":-1,"count":50}` |

### A.4 si24 — 13굴 / 1000

| 순서 | 원문 발췌 평가값 |
|---|---|
| 0 | `{"x":2860,"y":6380,"size":0.5,"timer":626.6127036558464,"alive":0,"room":1,"count":100}` |
| 1 | `{"x":5260,"y":7100,"size":0.3,"timer":604.7168261278421,"alive":0,"room":1,"count":50}` |
| 2 | `{"x":1980,"y":5220,"size":0.5,"timer":649.1745246900246,"alive":0,"room":1,"count":100}` |
| 3 | `{"x":5180,"y":5780,"size":0.3,"timer":659.873741492629,"alive":0,"room":1,"count":50}` |
| 4 | `{"x":3100,"y":4860,"size":0.5,"timer":633.7220967421308,"alive":0,"room":1,"count":100}` |
| 5 | `{"x":5900,"y":3220,"size":0.5,"timer":627.2437736671418,"alive":0,"room":1,"count":100}` |
| 6 | `{"x":2980,"y":2620,"size":0.3,"timer":616.527377567254,"alive":0,"room":1,"count":50}` |
| 7 | `{"x":5020,"y":2220,"size":0.5,"timer":607.309211846441,"alive":0,"room":1,"count":100}` |
| 8 | `{"x":3820,"y":1660,"size":0.8,"timer":600.0127756269649,"alive":0,"room":1,"count":100}` |
| 9 | `{"x":3780,"y":6220,"size":0.3,"timer":639.5145520661026,"alive":0,"room":1,"count":50}` |
| 10 | `{"x":3060,"y":3420,"size":0.55,"timer":613.9419078407809,"alive":0,"room":1,"count":100}` |
| 11 | `{"x":4020,"y":5540,"size":0.3,"timer":648.3127542212605,"alive":0,"room":-1,"count":50}` |
| 12 | `{"x":4020,"y":4140,"size":0.3,"timer":641.384222083725,"alive":0,"room":-1,"count":50}` |

### A.5 si25 — 13굴 / 1000

| 순서 | 원문 발췌 평가값 |
|---|---|
| 0 | `{"x":2900,"y":7300,"size":0.5,"timer":626.6127036558464,"alive":0,"room":1,"count":100}` |
| 1 | `{"x":6140,"y":6100,"size":0.3,"timer":604.7168261278421,"alive":0,"room":1,"count":50}` |
| 2 | `{"x":1940,"y":5540,"size":0.5,"timer":649.1745246900246,"alive":0,"room":1,"count":100}` |
| 3 | `{"x":5980,"y":5620,"size":0.3,"timer":659.873741492629,"alive":0,"room":1,"count":50}` |
| 4 | `{"x":2500,"y":3540,"size":0.5,"timer":633.7220967421308,"alive":0,"room":1,"count":100}` |
| 5 | `{"x":5340,"y":3060,"size":0.5,"timer":627.2437736671418,"alive":0,"room":1,"count":100}` |
| 6 | `{"x":1980,"y":1860,"size":0.3,"timer":616.527377567254,"alive":0,"room":1,"count":50}` |
| 7 | `{"x":6260,"y":2060,"size":0.5,"timer":607.309211846441,"alive":0,"room":1,"count":100}` |
| 8 | `{"x":3780,"y":6220,"size":0.3,"timer":639.5145520661026,"alive":0,"room":1,"count":50}` |
| 9 | `{"x":3060,"y":3420,"size":0.55,"timer":613.9419078407809,"alive":0,"room":1,"count":100}` |
| 10 | `{"x":4820,"y":1900,"size":0.8,"timer":648.3127542212605,"alive":0,"room":1,"count":100}` |
| 11 | `{"x":4020,"y":5540,"size":0.3,"timer":641.384222083725,"alive":0,"room":-1,"count":50}` |
| 12 | `{"x":4020,"y":4140,"size":0.3,"timer":646.4279907848686,"alive":0,"room":-1,"count":50}` |

## 부록 B. CH5 등록·스폰 풀 전수

### B.1 G17768–17780 — raw9

meta merge 이전이며 부재 키 보충0. 등록/그림크기와 실제col/실효배치개수는구분한다.

| 원본 행 | 등록 원값 |
|---|---|
| 17769 | `{"id":"m_c5p1","file":"prop_a.png","sz":400,"large":1,"dir":"collision","col":1,"colSz":75,"keepAR":1}` |
| 17770 | `{"id":"m_c5p1b","file":"prop_a.png","sz":330,"large":1,"dir":"collision","col":1,"colSz":62,"keepAR":1,"flip":1}` |
| 17771 | `{"id":"m_c5p2","file":"prop_b.png","sz":380,"large":1,"dir":"collision","col":1,"colSz":90,"keepAR":1}` |
| 17772 | `{"id":"m_c5banner","file":"prop_banner.png","sz":380,"large":1,"dir":"collision","col":1,"colSz":50,"keepAR":1}` |
| 17773 | `{"id":"m_c5bannerf","file":"prop_banner.png","sz":380,"large":1,"dir":"collision","col":1,"colSz":50,"keepAR":1,"flip":1}` |
| 17774 | `{"id":"m_c5totem","file":"skull_totem.png","sz":260,"large":1,"dir":"collision","col":1,"colSz":55,"keepAR":1}` |
| 17775 | `{"id":"m_c5arch","file":"bone_arch.png","sz":300,"large":1,"dir":"collision","col":1,"colSz":60,"keepAR":1}` |
| 17777 | `{"id":"m_c5bones","file":"bones.png","sz":44,"scatter":1}` |
| 17778 | `{"id":"m_c5deco","file":"deco_bones_04.png","sz":48,"scatter":1}` |

### B.2 G30979 — HELL_SPAWN[4] 31개 / weight합151

| 순서 | etype | weight | _RANGED_ET 포함 |
|---|---|---|---|
| 0 | 0 | 4 | 아니오 |
| 1 | 1 | 2 | 예 |
| 2 | 2 | 10 | 아니오 |
| 3 | 3 | 4 | 아니오 |
| 4 | 4 | 3 | 아니오 |
| 5 | 5 | 6 | 아니오 |
| 6 | 6 | 3 | 아니오 |
| 7 | 7 | 7 | 예 |
| 8 | 8 | 2 | 예 |
| 9 | 9 | 1 | 예 |
| 10 | 10 | 3 | 아니오 |
| 11 | 11 | 2 | 아니오 |
| 12 | 12 | 6 | 아니오 |
| 13 | 13 | 2 | 예 |
| 14 | 14 | 10 | 아니오 |
| 15 | 15 | 3 | 아니오 |
| 16 | 16 | 6 | 예 |
| 17 | 17 | 1 | 예 |
| 18 | 18 | 3 | 아니오 |
| 19 | 19 | 2 | 아니오 |
| 20 | 60 | 10 | 아니오 |
| 21 | 61 | 10 | 아니오 |
| 22 | 62 | 4 | 아니오 |
| 23 | 63 | 8 | 아니오 |
| 24 | 64 | 8 | 아니오 |
| 25 | 65 | 10 | 아니오 |
| 26 | 66 | 2 | 예 |
| 27 | 67 | 6 | 아니오 |
| 28 | 68 | 2 | 아니오 |
| 29 | 69 | 1 | 아니오 |
| 30 | 47 | 10 | 아니오 |

_RANGED_ET 원 Set25개=`[1,7,8,9,13,16,17,25,26,34,38,42,45,46,48,53,54,66,71,76,78,82,84,86,88]`, 교집합8개. HELL_EL[4]=`[3,0.45]`(EL.D=3). poolweight는CDF입력이며고정출현수/최종원거리확률이아니다. G30993–31022 분기/재시도를보존한다.

## 부록 C. 원화 byte 참조·현재 Godot 대응

고정 Git blob만 읽어 비교했다. decode/렌더/완전한scene closure 인수가아니다. query는pathhash에서만분리, 원화생성·변환·복사0. 등록9참조/고유7PNG+ground1이다.

| 참조 | 원 경로 | byte | SHA256 | Godot |
|---|---|---|---|---|
| m_c5p1 | assets/map/ch5/collision/prop_a.png | 810994 | 5433f10a73c19bf0603ede1e6f611b6c4f24abd0df2718b0fc22d0db7779a594 | 동일byte |
| m_c5p1b | assets/map/ch5/collision/prop_a.png | 810994 | 5433f10a73c19bf0603ede1e6f611b6c4f24abd0df2718b0fc22d0db7779a594 | 동일byte |
| m_c5p2 | assets/map/ch5/collision/prop_b.png | 1112007 | 8193d1332588d1bd2591e3d310b6c9118ab09b3222fc0097aa7d9a99772da1f2 | 동일byte |
| m_c5banner | assets/map/ch5/collision/prop_banner.png | 1023965 | 84d5af6d45966c49d18fe77e4a60160e0d6cefb2dec6ccb8451c3982fbf28cb4 | 동일byte |
| m_c5bannerf | assets/map/ch5/collision/prop_banner.png | 1023965 | 84d5af6d45966c49d18fe77e4a60160e0d6cefb2dec6ccb8451c3982fbf28cb4 | 동일byte |
| m_c5totem | assets/map/ch5/collision/skull_totem.png | 33032 | 4c5255905708bd025b07e0d377488467e98a91db6bd39c206264d8b164ed3f64 | 동일byte |
| m_c5arch | assets/map/ch5/collision/bone_arch.png | 153345 | df27ca9bbbb319d2aab2a7ae9034377d8a806b1a9a129ada6d10dbb4a8c57db7 | 동일byte |
| m_c5bones | assets/map/ch5/floor_objects/bones.png | 1125 | 55a36681f65d529bed059b3778d19ca4a91e6c8deea5274b32b4f704b0faff67 | 동일byte |
| m_c5deco | assets/map/ch5/floor_objects/deco_bones_04.png | 682 | 71d782d98e64c0121c54769759c2751a6a18ae81073c20d4ccfe87d36490f22e | 동일byte |
| gt_ch5 | assets/map/ch5/ground.png | 384675 | 8a02c7b2f65e3d8feda76ae523ba162e791566d1fba6d97597c1e7a7194688c6 | 동일byte |

## 부록 D. 비선택 legacy의 오브젝트·이벤트 입력

이 표는 M 개별21~25의 입력으로 기본 clone의 START/굴/이벤트가 아니다. room/복도기하·전체spawn marker와feature 상세는L/si21~25.json legacy_fixed 및원M정의에보존했다. 배열부재와[]도구분한다.

| si / M 정의 | room type 순서 / feature / 객체·복도 입력 |
|---|---|
| 21 / M40904–43075 | rooms=`["start","combat","forge","combat","combat","boss"]` |
| 21 / features | `[{"type":"alcove","x":15,"y":210,"r":4},{"type":"alcove","x":140,"y":166,"r":6}]` |
| 21 / corridorSpawns | `[{"x":95,"y":227,"grade":0},{"x":85,"y":186,"grade":0},{"x":84,"y":111,"grade":2}]` |
| 21 / objs | `[{"x":147,"y":248,"id":"player_start"},{"x":130,"y":166,"id":"forge"},{"x":95,"y":227,"id":"spawn_g0"},{"x":85,"y":186,"id":"spawn_g0"},{"x":84,"y":111,"id":"spawn_g2"},{"x":32,"y":208,"id":"spawn_g1"},{"x":34,"y":209,"id":"spawn_g1"},{"x":21,"y":124,"id":"spawn_g2"},{"x":23,"y":125,"id":"spawn_g2"},{"x":24,"y":124,"id":"spawn_g3"},{"x":213,"y":84,"id":"spawn_g3"},{"x":215,"y":82,"id":"spawn_g3"},{"x":221,"y":82,"id":"spawn_g3"}]` |
| 22 / M43078–45370 | rooms=`["start","combat","combat","forge","combat","combat","boss"]` |
| 22 / features | `[{"type":"alcove","x":151,"y":124,"r":5},{"type":"alcove","x":180,"y":7,"r":8}]` |
| 22 / corridorSpawns | `[{"x":55,"y":55,"grade":0},{"x":123,"y":85,"grade":2},{"x":163,"y":65,"grade":2}]` |
| 22 / objs | `[{"x":10,"y":58,"id":"player_start"},{"x":112,"y":67,"id":"forge"},{"x":55,"y":55,"id":"spawn_g0"},{"x":123,"y":85,"id":"spawn_g2"},{"x":163,"y":65,"id":"spawn_g2"},{"x":40,"y":22,"id":"spawn_g1"},{"x":42,"y":21,"id":"spawn_g1"},{"x":80,"y":121,"id":"spawn_g1"},{"x":81,"y":123,"id":"spawn_g1"},{"x":148,"y":116,"id":"spawn_g3"},{"x":148,"y":114,"id":"spawn_g3"},{"x":146,"y":114,"id":"spawn_g3"},{"x":182,"y":15,"id":"spawn_g3"},{"x":177,"y":18,"id":"spawn_g3"},{"x":178,"y":18,"id":"spawn_g3"}]` |
| 23 / M45373–49120 | rooms=`["start","combat","combat","forge","combat","combat","combat","boss"]` |
| 23 / features | `[{"type":"alcove","x":14,"y":135,"r":5},{"type":"alcove","x":268,"y":98,"r":6}]` |
| 23 / corridorSpawns | `[{"x":172,"y":242,"grade":0},{"x":160,"y":215,"grade":0},{"x":74,"y":178,"grade":1},{"x":64,"y":140,"grade":1},{"x":140,"y":82,"grade":2}]` |
| 23 / objs | `[{"x":110,"y":258,"id":"player_start"},{"x":135,"y":162,"id":"forge"},{"x":172,"y":242,"id":"spawn_g0"},{"x":160,"y":215,"id":"spawn_g0"},{"x":74,"y":178,"id":"spawn_g1"},{"x":64,"y":140,"id":"spawn_g1"},{"x":140,"y":82,"id":"spawn_g2"},{"x":236,"y":225,"id":"spawn_g1"},{"x":239,"y":228,"id":"spawn_g1"},{"x":17,"y":191,"id":"spawn_g1"},{"x":22,"y":194,"id":"spawn_g1"},{"x":35,"y":128,"id":"spawn_g2"},{"x":31,"y":130,"id":"spawn_g2"},{"x":31,"y":130,"id":"spawn_g3"},{"x":249,"y":98,"id":"spawn_g3"},{"x":250,"y":100,"id":"spawn_g3"},{"x":250,"y":98,"id":"spawn_g3"},{"x":28,"y":67,"id":"spawn_g3"},{"x":31,"y":68,"id":"spawn_g3"},{"x":23,"y":66,"id":"spawn_g3"}]` |
| 24 / M49123–53125 | rooms=`["start","combat","combat","combat","forge","combat","combat","combat","boss"]` |
| 24 / features | `[{"type":"alcove","x":14,"y":206,"r":4},{"type":"alcove","x":150,"y":153,"r":8},{"type":"alcove","x":2,"y":94,"r":8}]` |
| 24 / corridorSpawns | `[{"x":176,"y":161,"grade":1},{"x":167,"y":113,"grade":2}]` |
| 24 / objs | `[{"x":103,"y":268,"id":"player_start"},{"x":140,"y":152,"id":"forge"},{"x":176,"y":161,"id":"spawn_g1"},{"x":167,"y":113,"id":"spawn_g2"},{"x":241,"y":241,"id":"spawn_g1"},{"x":243,"y":239,"id":"spawn_g1"},{"x":35,"y":210,"id":"spawn_g1"},{"x":36,"y":209,"id":"spawn_g1"},{"x":254,"y":183,"id":"spawn_g2"},{"x":262,"y":181,"id":"spawn_g2"},{"x":255,"y":183,"id":"spawn_g3"},{"x":247,"y":124,"id":"spawn_g3"},{"x":246,"y":123,"id":"spawn_g3"},{"x":244,"y":122,"id":"spawn_g3"},{"x":15,"y":96,"id":"spawn_g3"},{"x":24,"y":95,"id":"spawn_g3"},{"x":22,"y":96,"id":"spawn_g3"},{"x":238,"y":68,"id":"spawn_g3"},{"x":230,"y":67,"id":"spawn_g3"},{"x":230,"y":68,"id":"spawn_g3"}]` |
| 25 / M87054–91781 | rooms=`["combat","combat","combat","combat","boss","combat","combat","combat","combat","combat","combat","combat","forge","forge","combat","combat","combat","combat","combat","combat","combat","combat","start","combat","combat"]` |
| 25 / features | `[]` |
| 25 / corridorSpawns | `[]` |
| 25 / objs | 미정의 (undefined mask) |

## 부록 E. 원문 symbol 행/SHA 색인

92개 G 원문 발췌 symbol은5개VM에동일위치/SHA로기록된다. 실행함수와읽기만한소비경계를함께색인하므로표존재가전체함수실행을뜻하지않는다. 추가CH5규칙/이벤트는static범위로분리했다.

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
| _CH_DECO.4 | G17768–17780 | 91263915dcf208fc7b652819b3accec04c1b88fcd89a8a84793738347a61eef9 |
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
| HELL_SPAWN.4 | G30979–30979 | a90f4ebccbcd1e9ee15a7edee63d4b0ec0b1314cbb7422fe93f2db578029bedd |
| HELL_EL.4 | G30985–30985 | 267471654f6570948a3b6ef679d6c106d384677e393de66cdb541674588d5e7b |
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
| arena_exit_open_geometry | G41841–41850 | 96cb840ac58e268c140f868184c4a87bcb045acedc375a94a7f0f7f03009f29f |
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

M정의 및추가정적범위(실행관측과구분):

| symbol | 원본 행 | SHA256 |
|---|---|---|
| FIXED_MAPS.0 | M6–55 | c4b676b8f7ffcd29f70a3c4251bc23e11fdb8247e8eb2660341ca8dff86f6943 |
| FIXED_MAPS.21 | M40904–43075 | a20fd58b569859f46fda48c2ac4bdfb436b89f9c40587c946e24e5096968abcb |
| FIXED_MAPS.22 | M43078–45370 | a07b629d60de11a050c89cd5930324c33b676b86c6fcbf9fdca71beb67f4b65f |
| FIXED_MAPS.23 | M45373–49120 | 2823daeda0219d1c8dff75513c51882e6a10ee0f5100ecb9688bee4ea38da4f3 |
| FIXED_MAPS.24 | M49123–53125 | f57f49bee850f413848e7644f6d0777498bf418626520037996f8b403d64c96f |
| FIXED_MAPS.25 | M87054–91781 | 3288d7fef99fdc5048a8727b9081e3939ab24cf070e09a8b55871dac2da43d36 |
| _RETIRED_MAP_OBJECT_TYPES | G17487–17487 | 0dea4a5e305ef0f240def0c6a9f6b0b6db457b1032fd1f091a4bbceb81f3f403 |
| DECO_FORCE_AUTO | G17808–17808 | fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa |
| _GT_FILES | G26517–26528 | 70cb03a6de720bc144212a3f9628325eaac62d54e1eac0e5fe4f0f087d790d9c |
| _GT_HELL_ID | G26529–26529 | 1cde6a87638710cf6ef30eb09efd466d6b06ea4fffb4e7c7e87f42378b022537 |
| _REG_FB_TO_REG | G60694–60694 | 1b928d7b68dcb31d8fc4e1f464e3657806dd31847e900e102fe7820a9b085d80 |
| chapter5_resource_rule | G32746–32756 | 9c8502862ea9983fdf09abe7bd7729096ccbb192616be44b8487d969c0524f6e |
| chapter5_walk_grab_paralyze | G33018–33043 | 2effee62a19791bec6a794537468ecfd74d4e6057313d56aebca39c9c312bd57 |
| oxygen_pickup | G32925–32931 | 585f88f3fa6549a3fcddc464c73c324c1b7543babaf8be3aeaaea3414a90d21d |
| oxygen_drop | G42913–42916 | 3b872a51036251449977c8de844b301ce9e2f993dd0312ab9fcf9f698c1392b0 |
| chapter5_factory_fields | G31325–31336 | d8009fb84b5ec2e5ab1b97b0566ea301132cb92a213779663960f3662815c56f |
| chapter5_AI | G39810–40022 | fde814303339cc9ae5b72fcf71bf85e6a9e0125a8edc60f9b7d8fada5d1631dd |
| chapter5_death_effects | G42917–42945 | 273bf94e291f70215c1748aa2e2c3dd78186cb4d30fd239beeddf248d213a9d5 |
| oxygen_render | G52489–52489 | 6b417f9e76215f3dc73ed954020ba864e05f51eafff830ab072d2355ac73878a |
| chapter5_actor_render | G53858–53874 | e35d4730d49ad2e326de2b78932cd3fee09e652a392a4f9b31a25a29a3d19a4c |
| field_gate_and_clear | G41868–41957 | 9df3fca7e436ed3141d5fa92a1f20b93cc0b5bd0d5674fcf70e49969623f4b22 |
| arena_loading_and_death | G41782–41856 | 25f904c56040c28aabd846524c8e364ab33f65fa93bc4aa6ea7962e74f14db31 |
| map_object_interaction | G32829–32853 | 021b70bd0fa23bbcf37ebc832afce3de64b0d7658284b1fb90e3a16cf6580bf4 |
| background_queue | G63513–63525 | 43c8073854c6d4aef0c0183982cd2d580ce4ed3a27c214681fee3fc366114b96 |
