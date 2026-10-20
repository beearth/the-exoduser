# CH3-04 — si12 원본·독립 소비자

## 1. CH3-03 source-node provenance 실패 판정과 선행 수정

**main6d의 동일 선재 실패로 분류하지 않는다. CH3 체인의 검사 결함으로 판정해 si12 구현 전에 수정했다.** `6d987cb8a31d0aadd2b6a8cf1e9a781d1fb76d4d`에는 `test/fdgCh3Stage10Source.test.mjs`와 `godot/data/ch3_map_source/si10.json` 자체가 없다. 따라서 main6d에서 같은 suite가 1실패한다고 주장할 수 없다. 두 `git show`의 exit128·경로 부재는 OUT/main-presence-*에 보존했다.

CH3-03 `8366ba8de03a7e1adfddecd9291439f106eb7a24` 체인에서 기존 검사를 실제 재현하면 11건 중10통과/1실패다(`provenance-before`). 실패는 snapshot의 기록 `source.main_sha=0119f304`와 현재 ref의 SHA를 내용과 함께 직접 비교했기 때문이다. 원 `game.html`은 두 기록 커밋·main6d·작업 시작 최신main 모두 SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`로 동일하다. 원문 gameplay 데이터 회귀와 구분한다.

사용자 지시에 따라 CH3 소유 테스트만 먼저 고쳤다. 두 기록 main commit의 실제 game bytes를 읽어 snapshot의 선언 SHA 및 서로의 SHA가 모두 같은지 먼저 단정하고, 그 후 main_sha와 기존에 허용하던 extraction_head만 정규화한다. 나머지 전필드·타일·배치·굴·자산·undefined 증거 비교는 그대로다. 가짜 SHA를 양쪽에 함께 넣어도 거절하고 타일 차이가 정규화로 숨겨지지 않는 음성검사를 추가했다. artifact·게임 원본·공용 코드 수정0이다.

수정 후 `provenance-fixed`: **12통과/0실패/0SKIP**, exit0. 기존11개가 전부 통과했고 추가 음성검사1개도 통과했다. si12 구현 전에 별도 정상 커밋 **9af85131cf343db82a5367d391e1d6934a4fa9aa**로 보존했다. 최종 `source-node-fixed`는 CH3-03의 기존62개를 포함해 **72/0**이다(추가 si11 검사9개·provenance 음성검사1개). 해당1실패를 미해결 상태로 넘기지 않는다. 최종 제출은 이 커밋을 포함한 자기 CH3-04 branch만 push한다. 원로그 `~/exoduser-wt/_out/ch3-04/`.

## 2. si12 결과·의존·범위

**si12 원본 snapshot·순수 계약·독립 소비자 기능 검증 완료, 시각 판정 RETOUCH.** 제품 World·Main·State·실제 Player/적·보스/소환굴/지역 진행/전환/저장과 연결하지 않았다. `full_stage_ready=false`다. 사용자가 이번 ID를 si12 / 3-3으로 지정했으므로 미구현 si11 독립 소비를 끼워 넣거나 si13에 착수하지 않았다.

| 항목 | 실제 값 |
|---|---|
| 작업 / branch | ch3-04 / codex/ch3-04-20261020 |
| 고정 의존 | CH3-03 8366ba8de03a7e1adfddecd9291439f106eb7a24에서 분기. 선행 검사 수정9af85131 이후 si12 구현. 최신main merge·rebase0 |
| fetch main | b25a018ace5a3fa65c9c2476a8c3ac92509077b3. 작업 중 공유 origin/main ref가249c26fad989071a94c19128e524ce0bbcb2c8c9로 전진. 두 game bytes도 시작 SHA와 동일 |
| 원본 | 최신main과 동일한 game.html 65692행 / SHA256 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4 |
| source JSON | si12.json 124209byte / SHA256 9076cb8b9111a2c427d069223bc7065c76fb1a4f2307ce686ee262d5465e87b2 |
| resource JSON | si12_resources.json 32788byte / SHA256 012986b08485e088ceb8f02e8749e6359d6d25524b4121c1b328daa404fa372d |
| 두 artifact 출처 | source.main_sha=b25a018a, extraction_head=선행 수정9af85131. 현재 ref 변화만으로 artifact를 다시 쓰지 않음 |
| 참고 | CH3 trace §4.4·CH2-04 보고서/독립 소비 구조를 읽고 재사용. MAP-LOOK·제작 GUIDE v0.9의 게임플레이/표시·기술/시각 분리 적용 |
| 원로그 | ~/exoduser-wt/_out/ch3-04/ — 명령·결과·stdout/stderr·oracle·8뷰/크롭·실패·보호·제출 기록 |

공용 변경0을 지키기 위해 기존 shared source/resource exporter·기존 World/reader/계약·제품 map.json을 수정하지 않았다. 기존 파일 변경은 명시 지시한 CH3 provenance 테스트1개와 docs/CHANGELOG_SYNC 절뿐이다. 보고서를 포함한 두 docs와 새 si12 파일 외 타 담당·Main/world/player/hud/native_normal_enemy_hurte/native_source_new_run_state·P3 owner0줄이다. 새 원화/bitmap 생성·변환·재인코딩·제품 에셋 복사0이다.

## 3. 전용 파이프라인·파일

| 파일 | 역할 |
|---|---|
| godot/tools/export_ch3_stage12_source.mjs | 기존 admitted source exporter의 native observer 재사용. stage11 bootstrap은 원 선언/함수 공급에만 사용, target G/P/MAP_OBJS/exit center·seeded observation RNG를 초기화하고 원 _ICE12/compose12/selector/generator/START/regionInit 실행 |
| godot/tools/export_ch3_stage12_resources.mjs | 같은 si12 private VM을 이어 원 metadata merge/occ-foot/initMapObjects/충돌 함수 실행. 기존 rectangle helper 재사용. 새 resource JSON·외부 oracle만 출력 |
| godot/data/ch3_map_source/si12.json / si12_resources.json | 원 입력·전체 생성 결과·실효 배치/shape·asset bytes/size·게임플레이/표시 미연결 scope |
| godot/port_modules/ch3_map_source/stage12_contract.gd (+UID) | 순수 read_area/validate_area. CH3-03의 동일 meta/catalog/ground/room/scope·CH1 scalar/hash helper 재사용, si12 전필드·타일·굴·타이머·출처·undefined mask 엄격 검증 |
| godot/scripts/native_ch3_stage12_area_resources.gd (+UID) | 순수 source 계약·고정 manifest SHA·전체 bundle 대조·기존11 texture bytes/size 검증, readonly |
| godot/scripts/native_ch3_stage12_area_world.gd (+UID) | CH3-02 subclass. analytic collision/broadphase/prop·CH1 Physics/BFS/swept fixture 재사용. 별도 _ready/defaultfloor/표시광만 구성. 제품 World 인스턴스/연결 아님 |
| godot/scenes/ch3_stage12_area_preview.tscn | 지정 격리에서만 실행하는 독립 scene |
| test/fdgCh3Stage12World.test.mjs | source+resource7검사, fresh native reference/원문 전수·byte·출력 거절·기존 공유 바이트 보존 |
| godot/tests/test_ch3_04_stage12_source.gd / test_ch3_04_stage12_world.gd (+각UID) | 순수393단정 및 실제 독립 scene/GPU815단정·8뷰·A/B·반경 fixture 왕복 |

신규 si12 경로16개(자기 UID5 포함)다. 선행 테스트 수정1개와 docs2개를 합한 작업 전체는19경로다. 선행 수정 후의 제품 커밋은 신규16+docs2만 stage한다.

bootstrap stage11의 snapshot을 stage12로 간주하지 않는다. target 결과의 전필드를 원 si12 VM에서 새로 capture하고, source.pipeline에 bootstrap_stage11/target_stage12·target reset·shared_files_edited0을 명시했다. 원문 AST 기록에는 bootstrap 선언과 실제 _ICE12/compose12를 함께 남겼다. 같은 metadata/asset 참조만 재사용하며 si11의 배치/굴/지역 분모를 복사하지 않았다.

독립 Node reference는 고정8366ba8d의 원 source 도구를 UTF-8 임시 module로 읽어 도구의 stage admission/선택 expression 인덱스만12로 바꾸고, **bootstrap 없이 처음부터 원 native si12를 실행**한다. 게임 함수 본문·원문 데이터·기대값은 수정하지 않는다. 이 fresh VM과 이번 adapter의 전체 tiles/rooms/START/gates/holes/regions/raw 입력·동일 seed 결과가 같고, 별도의 원 resource reference와 bundle/6774 queries/LOS400도 깊은 비교 차이0이다. 원문 함수 호출을 stub으로 바꾸지 않았다.

CLI는 source 도구 `<node-bin> <tool> <root> <json> [--seed uint32]`, resource 도구 `<node-bin> <tool> <root> <external-oracle-json>`다. 내부 출력은 자신의 si12 JSON만, 기존 출력은 같은 schema/stage12만 허용한다. shared map/원문/다른stage·foreign schema·symlink/조상 junction은 쓰기 전에 거절한다. root/Node 경로는 외부 인자이며 하위 Node 호출은 process.execPath, 출력은 UTF-8 임시 파일이다. 새 Godot 검사는 명시 external oracle/alternate JSON을 읽어 OS.execute stdout 첫 조각에 의존하지 않는다. 모든 Godot argv에도 --node-bin을 전달했다.

## 4. 최신 main 원문 값·실효 관측

G는 위 동일 SHA의 game.html 행이다. JSON의 source.symbols에 정확 범위·SHA가 있다.

| 원문 위치 | 실제 값·소비 |
|---|---|
| G17813–17814,17958–17962 /18205 | _ICE12 원 입력21=고정 군집10+원 local seeded 장식11. scale 부재11/rot 부재21·catalog61/base77/cross0. 부재 키 보충0 |
| G16668–16676,30042–30085,30135–30147 | si12 dungeon entry 자체 부재. carrier null+undefined_paths=[/selector_evidence/dungeon_spec], is_dungeon/face=false·기본200²/T40/editorRLE[1,40000]. si10 basin이나 CH2 path 복사0 |
| G30218–30694 /31564–31566 | 최종40000 tile0/1/2/3/4=38986/36/3/0/975. SHA5b40eb67c1aa3fd6ad407f9af06db91f549456bcd9c7d91ed31265c5a3a3b87e. START4020/7420, gate metadata x99..101/y5(tile0), exit y7(tile2)/center4020,300 |
| G16697–16713 | STG12=지옥의 겨울3구역·얼어붙은 감시자·be2·monLv300·hell2/hellFloor2/chapter2·isHellBoss=false. 보스 actor 실행 아님 |
| G31617–31620 부분 | 문지기 후보100,8의 tile4, 요구 tile===0 거절 입력. 실제 mkEn/호위/생존 상태를 실행한 결과로 확대하지 않음 |
| G30486–30626,31029–31030,60697–60718 | 최종14굴/1100, 지역NW250/NE300/SW350/SE200·모두cleared=false/fbIdx-1. source Math.random14회/final3323445034·ordered14 timer. 지역·굴 실제 owner 연결0 |
| G18486,18501–18504,25735–26472 | metadata merge/occ-foot/원 initMapObjects. 초기 gate1, 최종22=hand21+비가시 gate1. hand 이동/생략0, lore/altar/breakable0. init에서 원 RNG2회 추가 소비했으나 제단은 최종0 |
| G31685–31687,31711–31712,31672–31681 | analytic8=원7+타원1, rect0. 원문 colOy/strict </JS truncation/4모서리 반경·LOS16px step 유지. 비가시 gate 원도 포함, prop Physics 노드 설치는 아님 |
| tile Physics | tile1 36개를 겹침 없는4 rectangles로 덮음. 실제 PhysicsDirectSpaceState2D 40000 center/union 오차0 |
| 원화 / 표시 | catalog61참조/35 원파일+ground1 byte pin, 실제 소비11 texture. keepAR/scale/pivot/rotation/flip/alpha·원 srcRect 유무 보존. 현 hand crop0, undefined meta는 별도 mask 유지 |
| query / route | isW6774·canMv6774·LOS400 차이0/0/0. JSON 재해석과 다른871개 입력은 원 f64 LE carrier로 보존. 반경12 BFS179점·swept4px 이동·왕복358점, 제품 전환0 |

순수 계약은 실제 파일 IO 없이 선언된 game/files/symbols·전데이터 pin을 검사한다. main/extraction commit은 형식을 검증하고, 그 커밋의 실제 원문 bytes 검증은 Node가 수행한다. ref 전진만으로 유효한 alternate seed snapshot을 거절하거나 출처 SHA를 가짜로 덮어쓰지 않는다. raw 동일 참조 READY, 오염은 value 없는 NOT_READY/reason/raw이며 RNG/clock/Node/State 쓰기0이다. si12의 absent dungeon을 false 설정이나 빈 객체로 수리하지 않았다.

## 5. 실제 검사·실패·경고

| L prefix | 최종 실제 결과 |
|---|---|
| provenance-before / provenance-fixed | 선행 수정 전11중10/1 → 수정12/0. 첫 절과 별도 수정SHA 참조 |
| new-node-final | 7/0·SKIP0·exit0. fresh VM/source·실효 resource 전수·출력 guard·원본/공유 바이트 |
| source-godot-final | 393/0·exit0·stderr0·ERROR0. 순수 API/전필드 오염·global RNG 불변·실제 seed0/max 증거 |
| camera8 | 실제 GUI Apple M5 Pro/OpenGL, 815/0·ERROR0. texture11·Physics/차등·route·8뷰+OFF1·왕복 |
| source-node-fixed | **72/0**·exit0·SKIP0. 기존 CH1/CH2/CH3 source·World/asset/pit 묶음, provenance1 해결 |
| map-node / map-main6d | 각각37중28통과/9실패·exit1. 전체 실패 이름·순서 동일, raw failure JSON 대조 |
| 기존 순수 / 정적 Godot | CH1-01 63/0·CH1-02 189/0·CH1-03 75/0·CH2-01 362/0·CH3-01 641/0·CH3-03 385/0 |
| 기존 CH3-02 World | 2713/0. isW/canMv16806각·LOS400·tile Physics 차이0, 기존 oracle/원문 bytes 동일 |
| contracts | 5그룹/실패단정0 |
| GUI p3002 / p3003 | 298/0·SKIP0 /43/0, ERROR0 |

이번 Node 묶음의 pit 전용 파일은 **2검사/0실패**다. 이전 CH3-03 요약의 pit6 표기는 원로그와 맞지 않는 집계 오류였고 여기서 바로잡는다. asset 전용6/0과 합치거나 중복 계산하지 않는다.

기존 map9실패는 culling1·adapter pending2·Image 없는 region VM6이다. 이는 main6d archive에서도 실제 같은9개가 재현된다. **이 map9 선재 판정과 첫 절의 CH3 provenance 체인 결함은 서로 다르다.** 모든 실패 이름은 map-node.failures.json/map-main6d.failures.json, 원문 stdout/stderr에 보존했다. 사용자 제공 로비8실패는 별도 이력으로 이번에 실행/수정하지 않았다.

개발 중 실패도 보존했다. 최초 Node6/1은 reference 도구에서 stage 선택 호출만12로 바꾸고 bundle stage10을 남긴 하니스 치환 오류였다. 모든 stage 위치를 바꾸자 native 전수 비교7/0이었다. 최초 순수 Godot1/1은 기존 strict scalar helper가 null을 거절한 것으로, 공용 helper는 건드리지 않고 si12 전용 nullable 비교를 넣어 원 carrier/mask를 보존했다. 이후 alternate2실패는 ref 전진(main b25→249c)만으로 생긴 고정 main pin 문제였다. 선언 commit 형식·실제 내용 pin/Node commit bytes 검증으로 책임을 분리해393/0을 확인했다. 최초 독립 Godot448중1실패는 si10의 차단 지점20,20을 기본 floor에도 벽으로 가정한 검사 오류였다. 실제 native tile1 중심으로 검증해 GPU815/0이었다. 원 nav·collision·threshold·query 수를 통과용으로 고치지 않았다.

기존 Camera2D interpolation 경고 및 P3002 ObjectDB8 종료 누수는 미해결 원문 그대로다. P3002 actor10/unported158·P3003 full_fieldboss_combat=false·kill hook/holes finalization 미연결·CH1-02 source-image4 NOT_READY도 유지했다. 최종 새 검사와 회귀의 SCRIPT ERROR/ERROR는0이다.

## 6. 8뷰·1x 크롭·표현 한계

captures/에 START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT 각각1920×1080, 추가ARENA_LOOK_OFF를 저장했다. 세 크롭 START-1x320² / LANDMARK-1x400×440 / EXIT-1x400×320은 **리사이즈 없는 원 화면 pixel crop**이다. 좌표·원본/크롭SHA는 capture-crops.json에 있다. 9화면과3크롭을 직접 확인했으며 PNG는 Git에 넣지 않는다.

| view 중심tile | 직접 관측·판정 |
|---|---|
| START100,185 | 원 반복바닥만 넓게 보임. 전체 환경·전진 방향 위계/시각 밀도 부족, RETOUCH |
| EARLY114,156 | 원 얼음나무·유해·작은 장식 보이나 asset island와 지면 접지 부족 |
| ARENA100,100 | 중앙 넓은 공간과 좌측 성벽·시체군. 넓은 반복면·독립된 소품 느낌, RETOUCH |
| SIDE_L82,92 / SIDE_R118,164 | 해당 군집을 주변 방향에서 확인. 빈 면·군집 연결/경계 부족 |
| LANDMARK86,101 +1x | 성벽/시체 실루엣·원 pivot은 읽히나 지면의 보라색 원화 테두리·톤/접합·밑동 접지 보완 필요 |
| LATE114,48 | 원 stalag/바닥판/유해. 조밀한 수정·동굴 완성으로 확대하지 않음, 동일 지면 반복 남음 |
| EXIT100,7 +1x | 북쪽 world 바깥 검은 공백·fixture diamond/3칸 목적지 표시. 제품 문/portal/전환 연출 아님 |
| ARENA_LOOK_OFF | ambient/광원/contact shadow ON/OFF 차이 확인. 전체 shader를 제거하는 성능 비교 아님 |

표현은 원 ground PNG를 단일8k world mesh에 repeat, 기존 lit/silhouette shader와 ambient·광원4개(이동fixture1+원 군집3)·contact shadow7을 별도로 사용했다. GradientTexture2D는 메모리 광원 마스크이며 원화 생성/변환이 아니다. 원 데이터/위치/콜리더를 고쳐 시각 문제를 숨기지 않았다. CSS/edge/filter pixel 동일성은 false다. fixture는 실제 Player가 아니고 전투 가독성은 미검수다. 사진의 카메라 이동을 실캐릭터가 모든 촬영점에 종주한 것으로 보고하지 않는다. 실제 fixture 종주는 START→EXIT 및 왕복179×2만 근거다.

VISUAL VERDICT: **RETOUCH**. 반복 지면·성긴 군집·asset island·톤/보라 테두리·접지·북쪽 경계와 실제 collision 기둥의 시각 가독성은 후속 표현 검수가 필요하다. 사용자 요청의 비교 자료/독립 기능 검증을 제출하는 것이며 최종 PoE2·No Rest급 완성이나 제품 gameplay 인수가 아니다. 짧은 fixture sweep90프레임/1468.383ms는 combat FPS·전경/광원 부하·streaming 안정성 근거로 쓰지 않는다.

## 7. 보호·실행·제출

- worktree add --no-checkout 후 no-cone sparse, 새 index를 HEAD tree와 대조했다. 기존 작업/타인 WIP0·main merge/reset/force0. 필요한 Godot·engine/test/tools/관련 docs·JS·회귀 원화 경로만 받았고 웹 대형assets 전체 checkout0이다.
- 최초 materialized tracked2599개 중 선행 수정한 CH3 테스트와 CHANGELOG 외2597개 SHA 동일. 공용 source/resource exporter·실제품6개·map·P3·기존 계약/데이터/scene0줄, 원본PNG bytes 동일. R HEAD/branch/tracked INDEX·WORK도 최종 대조한다.
- Godot4.7.2를 실행할 때마다 지정 pgrep/wc를 기록, camera8 전2개라30초 기다린 뒤1개에서 실행했다. 자기 실행 순차·타 Godot 종료0. 각 파일 상수 격리/신규 EXODUSER-ch3-04-Isolated-20261020·override 매회 작성/finally0byte. 검사 후 빈 override를 제거한다.
- Node 경로는 --node-bin 인자, stdout/stderr는 UTF-8 파일. 선행 보조 하니스의 --node 이름도 외부 경로 인자였으며 이후 --node-bin으로 통일했다. OS.execute 첫 출력 조각 사용0·고정 node binary0. cache는 OUT/it-05의 자기 APFS 사본, R node_modules는 읽기 전용 symlink만 썼다.
- Godot 자동 sidecar228개는 OUT로 이동하고 자기UID5만 제출한다. docs 전체 키워드 검색을 docs-search.log에 남겼고 보고서·CHANGELOG에 현재 상태를 동기화했다.
- 명시 경로만 stage·정상 docs-sync/pre-commit·whitespace 검사 뒤 자기branch 비강제push, 원격SHA대조→DONE(branch/SHA/수치)→자기WT 제거. 보고서·원로그·스크린샷·branch는 남긴다. 실제 최종 SHA/원격/정리/R보호는 submission.json/DONE.txt가 근거다. main push·force push·reset·git add -A·배포0이다.

## MAP PRODUCTION REPORT — GUIDE §23

```text
STAGE: CH3-04 / si12 standalone source consumer, 제품 World/Main/State 미연결
MASTER: 원 default200 field·원21 hand·14굴1100·지역250/300/350/200
        START4020/7420 → EXIT4020/300, 새 route/빙판/절벽 설계0
OUTER MASS: LEFT/RIGHT/TOP/SOUTH source 군집·입력 보존, 완성 환경 mass 미인수
           상단 경계 공백·성긴 면·실제 기둥 시각 대응은 후속 QA
LARGE: 원 tree/rampart/corpse/stalag byte 참조, 새composite/배치 수리0
MEDIUM: source sprite21·정확 pivot/scale/layer·shadow7, 군집 접지/연결 RETOUCH
GROUND: defaultfloor mesh repeat·기존 lit shader·광원4, 원 tile/충돌 불변
PLAYABLE: radius12 fixture179/왕복358, actual Player·적/보스/굴/지역/전환0
LANDMARK: 원 군집114/156 →86/101 →114/48, 원 제단/lore0
CAMERA QA: 8뷰1920x1080+OFF1+1x크롭3 직접 확인, RETOUCH
TECH QA: Node7/0·순수Godot393/0·GPU815/0, query6774각/LOS400/물리40000 차이0
         공유 바이트·source72/0, map9는main6d동일, contracts5/0·굴298/0·지역43/0
         웹pageerror/404 미실행·해당없음, native load11/ERROR0, 시각seam RETOUCH
         fixture sweep은 combat FPS/성능 완료 주장이 아님
FILES: si12 신규16 + 선행CH3테스트1 + docs2, 공용/타담당0
GIT: 선행수정9af85131 포함·자기branch 정상push/SHA/DONE 후 자기WT 제거
VISUAL VERDICT: RETOUCH
NEXT PASS: 총괄 화면 판정·별도 다음 단위 배정 대기. Main/State 권위 통합은 미착수
```
