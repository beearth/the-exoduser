# CH3-02 — si10 실효 배치·충돌·독립 소비자

## 1. 결과·인수 범위

**구현 완료: CH3 si10의 원문 실효 배치와 독립 fixture preview. VISUAL VERDICT: RETOUCH.** 추적 문서 §4.2를 CH1-04/CH2-02와 같은 resource → readonly reader → standalone world → 전용 Node/Godot 검증으로 구현했다. 실제 Main/Player/State/적·보스/소환굴·지역/문·에리어 전환·BGM 연결은 하지 않았다. Main·공용 연결이 없어 이 단위를 구현했으며, 실제 게임 통합은 추적 문서 §4.6의 권위 인수 전 HOLD다. 다음 단위는 착수하지 않았다.

| id / 항목 | 실제 값·근거 |
|---|---|
| 작업 / branch | ch3-02 / codex/ch3-02-20261020 |
| 시작 fetch main | 26c050a99a711e793a6c2413395acda09b0c1614 (사용자 최소 SHA 충족) |
| 필수 의존 | main 미포함 CH3-01 fcd7fcaaafd2cb653bc05805233d2823cfa406f7 끝에서 --no-checkout 분기·sparse-checkout. 이후 최신 main 정상 merge |
| 구현 기준 merge | 15285a4ec68902f74ac33bebd3003cfb6fdf01f4. rebase/force 없음 |
| CH1/CH2 인수 | CH1-04 5487245c3d857927cf8c0634d0ea5edb05650340 / CH2-02 77a96cb8d69993f06f6d110a5d92d9be5e3827e3 읽기. 두 소비자는 시작 main에 포함 |
| merge 해소 | CHANGELOG의 의존 절과 최신 main 전체 suffix 보존. shared source exporter의 CH3 stage10 및 main의 optional observeNative를 함께 보존. 구현 기준 이후 shared exporter 자체 수정0 |
| 원문 고정 | game.html 65,692행 / SHA256 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4. 원문·웹JS·원화·기존 Godot 에셋 수정0 |
| 출처 구분 | CH3-01 si10.json은 main0119f304·extraction_head007f4667의 인수본 그대로. 새 si10_resources.json은 시작 main26c050a99 관측본, 414261byte / SHA b0dd43bdba3d91ae9390f782020a271f0486736c170d96aa2e531b7b1738e831 |
| 공유 ref 변동 | 검사 중 타 세션의 origin/main이 6d987cb8a31d0aadd2b6a8cf1e9a781d1fb76d4d로 전진. game bytes는 위 SHA와 동일. 기존 artifact의 provenance를 덮어쓰지 않았음 |
| 원로그 | ~/exoduser-wt/_out/ch3-02/ — 모든 command/result/stdout/stderr, oracle, screenshots, 실패·원문 대조·보호 검사 포함 |

## 2. 제품 파일·파이프라인

| 신규 파일 | 역할 |
|---|---|
| godot/tools/export_ch3_area_resources.mjs | 동일 native 생성 VM의 post-snapshot observer에서 원문 metadata merge/occ-foot/initMapObjects/충돌 함수를 실행. 새 JSON·외부 oracle만 출력 |
| godot/data/ch3_map_source/si10_resources.json | 실제 MAP_OBJS·실효 좌표·shape·원화 bytes/hash·crop·출처·미확인 scope |
| godot/scripts/native_ch3_area_resources.gd (+ UID) | CH3-01 순수 계약 + manifest pin + 전체 bundle 대조 + 기존 texture22의 hash/size 검증. readonly |
| godot/scripts/native_ch3_area_world.gd (+ UID) | CH2 World를 상속해 CH1 tile Physics/BFS/swept fixture 및 CH2 표시용 alpha 처리를 재사용. 독립 si10 표시·원문 analytic collision |
| godot/scenes/ch3_area_preview.tscn | Main을 열지 않는 전용 scene. 지정 작업 격리가 아니면 소비 거절 |
| test/fdgCh3Stage10World.test.mjs | 원문·전수 조정·bytes·shape/f64·0/1/4/10 파이프라인·쓰기 거절 검사7개 |
| godot/tests/test_ch3_02_stage10_world.gd (+ UID) | 실제 로드/Physics·원문 query differential·반경 fixture 종주·look ON/OFF·GPU8지점 |
| docs/engine/orders/reports/ch3-02_REPORT.md / docs/CHANGELOG_SYNC.md | 이 보고서·기존 형식 최상단 절 |

자기 단위 총12경로(제품/검사10 + docs2)만 제출한다. `map.json`, `export_world.mjs`, 기존 CH1/CH2 resource/source/World 및 Main·world·hud·player·native_normal_enemy_hurte·native_source_new_run_state, P3 owner의 구현 변경은 모두0줄이다. 기준 merge에서 인수된 source exporter는 별도 이력이다. 공유 map 필드 변경이 없어 CH1-02의 제한된 예외를 사용할 필요가 없었다. 그래도 파이프라인 전 단계 재추출과 맵·지역·굴 회귀를 수행했다.

## 3. 최신 원문 값·실효 결과

표의 G는 위 SHA의 최신 main game.html 행이다. manifest에는 실행한 AST 조각의 시작/끝 행과 SHA를 전부 저장했다. 메타데이터 부재/undefined/null/0를 원본 snapshot에서 보충하지 않는다.

| id / 원문 위치 | 관측 값·Godot 소비 |
|---|---|
| si10 생성 / CH3-01 인수 | T40·200×200·최종40000타일. tile0/1/2/3/4=25364/14329/3/3/301. START(4020,7420), exit 중심(4020,300) |
| hand IIFE G17816–17950 / initMapObjects G25735–26472 | authored346 → 실제 hand343. 15개는 원문 nearFloor에 따라 이동, 3개는 floor를 찾지 못해 배치되지 않음. 임의343개 잘라내기0 |
| 배치 생략 전수 | index163 m_c3hellcorpsefieldf tile181,166 / index171 m_sword_pile tile24,31 / index178 m_hang_cage tile181,34. manifest hand_adjustments346에 순서·성공/실패·실효 좌표 전수 |
| 초기 객체 / 최종 객체 | 초기 boss_gate_col(4020,160)1개. 최종345=hand343+altar1+boss_gate_col1. 비가시 gate는 collision_only, altar는 미연결 fixture 표지 |
| 제단 G25871–25880 | stage>=5·combat room·random<.6 및 room 선택으로 init 중 RNG2회 추가 소비. 생성기7회 뒤 같은 native RNG를 이어 사용. 제단 world(4020,6220), hell2/used=false. CH2 lore/RNG0 기대를 복사하지 않음 |
| metadata G18486 /18501–18504 | CH1 cross5 및 CH3 원문 등록을 원문 순서 merge·occ-foot. 새 State/공용 meta registry 없음 |
| crop G17478–17484 / draw G52440–52461 | 실제 sourceSize/srcRect/trimOffset·pivot·scale·회전·flip·alpha 및 render layer 소비. crop 적용 hand87개. CSS filter/edgeErase 선언은 남기며 픽셀 동일성 false |
| collision G31685–31687 /31711–31712 | 최종105=회전 rect48+ellipse5+circle52(보이지 않는 gate 포함). part 변환·colOy·strict < 및 truncation은 원문값. Godot prop Physics shape가 아닌 analytic 질의 권위 |
| tile Physics | tile1 14329개를 중복 없이 정확히 덮는228 rectangles. 실제 PhysicsDirectSpaceState2D로 40000 cell center 확인·오차0 |
| f64 carrier | query 입력과 collider operand/cos/sin을 IEEE754 LE base64로 전달. Godot JSON 재해석과 달라지는 query 입력2082개를 원문 bits로 보존 |
| analytic 가속 | private256px bucket·1px conservative 경계 확장, collider 원문 순서 보존. shape 비교식은 원문 float64. 저장/원본 map/RNG/owner 변경 없음 |
| 원문 oracle | isW16806 / canMv16806 / LOS400. 무작위·범위 밖·반경12·strict shape경계·rect part seam 포함, Godot 차이0/0/0 |
| fixture route | 반경12 BFS route179점 → swept 4px 간격 실제 이동으로 START→arena→북쪽 exit 중심 도달. side pocket 등은 oracle/8지점 QA로 확인. 실제 플레이어·문열기·전투/전환은 미확인 |
| assets | 기존 원화22개(지면1+오브젝트21) source/Godot bytes/hash/PNG size 일치. 원본 생성·가공·변환·제품 복사0, 새 image asset0 |
| source-only 지역/굴 | CH3-01의 holes7/650·지역100/300/0/250·SW초기clear 인수값 보존. 이 World는 actual holes/region 진행을 소유하지 않음 |

## 4. MAP-LOOK 접점·시각 판정

`MAP_LOOK_GODOT_PASS1_20261020.md`와 제작 GUIDE v0.9를 적용했다. 원문 gameplay data와 별개로 단일 ground mesh의 표시 shader, 기존 lit/silhouette shader, CanvasModulate와 PointLight2D7개(이동 fixture1+랜드마크6), contact shadow를 독립 preview 안에 구성했다. 광원 radial은 메모리 GradientTexture2D이며 신규 원본/제품 이미지를 쓰지 않는다. CSS/edgeErase의 웹 픽셀 복제, 실제 CH3 MAP-LOOK profile 인수, 전투 광가독성 완성은 주장하지 않는다. 메모리의 표시용 alpha 처리도 기존 CH2 코드 재사용이며 원화 bytes는 바뀌지 않는다.

look ON/OFF는 ambient/광원/contact shadow 표시만 전환한다. 전환 전후 raw/bundle 전데이터 동일 및256개 원문 query 결과 동일. shader/material 자체를 제거하는 전체 비용 비교는 아니며 FPS 근거도 아니다.

================= MAP PRODUCTION REPORT =================

STAGE: CH3 si10 / CH3-02 independent fixture consumer. 실제 게임 stage 전환 아님.

MASTER
- silhouette: 원문 basin·성곽 perimeter를 보존. 웹1:1 완성 복제나 route 재설계0.
- regions: raw 분면100/300/0/250, 실제 지역 진행 미연결.
- main route: START4020,7420 → 중앙 전장 → EXIT4020,300, 반경 fixture179점.
- side spaces: SIDE L/R의 원문 execution/prison 주변을 촬영. 실제 side 전투 미실행.

OUTER MASS
- LEFT: 원문 execution/성곽 자산 참조, 연결부의 반복 wall strip과 경계가 보임.
- RIGHT: prison/성곽의 높이 음영은 보이나 원화 덩어리의 접합 가독성 보완 필요.
- TOP: 북문·구조물 겹침, 원문좌표 보존. 상단 world 바깥 어둠 경계 보임.
- SOUTH: 시작점에 큰 구조물 겹침이 많아 플레이 위치 가독성 부족.
- major holes: arena/후반의 넓은 지면은 전투 공간을 보존하나 시각 반복감 큼.

LARGE
- source assets: 기존 CH3/CH1 22 texture byte 참조만.
- composites: 신규 bake/composite asset0.
- overlap: START·LANDMARK의 구조 중첩과 sprite 경계가 남음, 기술통과로 숨기지 않음.
- repeated silhouette: 원문 wallkit의 반복·대각 strip이 두드러짐, 최종 MAP-LOOK 인수 전 retouch 필요.

MEDIUM
- connections: 원문 실효 배치·part collision과 display를 분리. 임의 충돌/좌표 수정0.
- remaining holes: 구조→지면 접점과 빈 면의 중간 규모 연결 표현 미완.

GROUND
- shadow: contact silhouette + 부분 광원 bump. 원본 texture/metadata 수정0.
- contamination: source 바닥 참조·표시 색조만, 새 오염/디테일 image0.
- structure integration: 마스크/접촉 음영은 동작하나 반복 지면과 명도 분리 retouch 필요.

PLAYABLE
- main arenas: 원문 중앙 ritual 공간, fixture만.
- travel space: 반경12 종주 확인. 실제 actor/camera 전투 동선 미확인.
- breathing space: EARLY/LATE의 넓은 면 보존, 표현이 지나치게 비어 보임.
- threat space: 실제 적/보스·이펙트 미연결.
- combat readability: 전투 미측정. 화면 전반이 어두워 실제 전투 인수 불가.

LANDMARK
- primary: 중앙 ritual 표식, 신호는 읽히지만 크고 반복 지면과 대비 보완 필요.
- secondary: execution/prison/carcass/dormant의 죽은 붉은 부분광·입체 음영.
- tertiary: 기존 small props, 새 scatter0. 제단은 실제 상호작용 없는 단색 fixture 표지.

CAMERA QA (camera8/*.png, 실GPU Apple M5 Pro, 1920×1080)
- START(100,185): 구조 중첩·어두운 fixture 위치. RETOUCH.
- EARLY(100,154): 넓은 바닥 반복과 작은 제단 표지. RETOUCH.
- ARENA(100,100): ritual·부분 명암 확인, 실제 전투 비교 없음.
- SIDE L(32,100): execution 입체감 확인, 대각 wall strip 접점 남음.
- SIDE R(166,101): prison 높이 음영, 주변 반복 지면 접점 남음.
- LANDMARK(38,151): carcass 외곽과 구조 중첩, 가독성 retouch.
- LATE(100,46): 개방 이동면, 반복 지면·시각 밀도 보완 필요.
- EXIT(100,7): 북문과 fixture 도달 확인. 실제 문/전환 미연결.
- ARENA_LOOK_OFF: 추가 A/B1장. 총9 PNG를 직접 확인, 기술 PASS로 시각 PASS 대체0.

TECH QA
- route: actual swept fixture179점, product transition0.
- collision: 원문 쿼리34012건(16806×2+400) 전부 차이0, 실제 tile Physics center/union 차이0.
- pageerror: 웹 미실행, 해당 없음. native SCRIPT ERROR/ERROR0.
- 404: 웹 미실행, 해당 없음. native texture22 로드·hash/size 모두 통과.
- seam: rect/ellipse/circle strict 경계·part seam oracle 비교0차이. 시각 sprite seam은 retouch.
- loading: 정상 import exit0; GPU test exit0·resource_errors없음.
- performance: 60cap 짧은 fixture sweep90 rendered frames/1473.471ms 관측만. combat FPS·ON/OFF 비용·최적화 완료 주장0.

FILES
- stage-owned: 신규 제품/검사10경로, docs2경로.
- concurrent touched: 0. 타 세션 origin/main ref 전진만 관측·미수정.
- unrelated touched: 0. 기준 tracked2572파일은 보고서 작성 전 전부 byte동일.

GIT
- staged: 명시12경로만, git add -A0. test+UID의 기존 ignore는 정확2경로 force-add만.
- commit: 정상 docs-sync/pre-commit 훅 사용. 제출SHA는 OUT/DONE.txt·submission.json에 기록.
- push: 자기 branch만 비강제, 원격 SHA 대조 후 DONE 작성·자기 sparse WT 제거.
- deploy: 0. R·원본·사용자 세이브 보존.

VISUAL VERDICT: **RETOUCH**. 독립 gameplay 소비 기술 완료이며 최종 시각/실게임 완료가 아니다.

NEXT PASS: 총괄의 다음 단위 지시 대기. CH3 MAP-LOOK profile/실제 전투 통합은 각 권위 인수 후 별도 검수. 여기서 Main/shared 연결하지 않음.

## 5. 실제 검사·실패 보존

| 검사 / 로그 prefix | 실제 결과 |
|---|---|
| 새 Node new-node-submission | 7통과/0실패/0SKIP. source·asset·shape·0/1/4/10 재추출·입출력 음성검사 |
| 새 Godot camera8 | 3080검사/0실패, exit0·SCRIPT ERROR0·ERROR0. 9PNG/실GPU. 앞선 headless new-godot2456/0은 별도 실행이며 중복 합산하지 않음 |
| source Godot | CH1-01 63/0, CH1-02 189/0, CH1-03 75/0, CH2-01 362/0, CH3-01 641/0 |
| 기존 standalone World | CH1-04 88/0·CH2-02 894/0. 각각 원문6966/10998 isW·canMv +LOS400의 차이0/0/0. 외부 oracle만 생성, 기존 resource JSON 미재작성 |
| 공통 계약 contracts | 5그룹 통과·failed_assertions0·exit0·stderr0 |
| GUI 소환굴 p3002 | 298/0·SKIP0·ERROR0. actors_registered10/unported_spawns158·ObjectDB8누수 경고 보존. full-game 인정 아님 |
| GUI 지역 p3003 | 43/0·ERROR0. full_fieldboss_combat=false·kill hook/holes finalization 미연결 상태 보존 |
| CH1 asset-regression | 6/0. 원본92 PNG·map8필드·scope·재추출·pit 계약 보존 |
| Node 관련 회귀 node-regression-final | 108건=99통과/9실패/0SKIP, exit1. 실패를 PASS 처리하지 않음. source3장/기존World/맵pack/adapter/pit/CH3layout 묶음 |
| 시작 main26 control main-control-final | 59건=51통과/8실패. 회귀의 동일8개 실패명 재현. main-control의 제품·검사 파일은 git archive26c050a99 원본, 읽기 전용 asset 참조와 rev-parse/show용 metadata만 사용 |
| provenance-proof-final | 기존 CH3-01의 이미 허용된 extraction_head 차이 + main_sha, CH1-04 main_sha 외 데이터 차이0. 각 기록 commit의 game bytes가 동일함을 먼저 확인. 기존 검사/fixture 수정0, 두 원본 suite 실패는 그대로 유지 |

### 남은 Node 실패9개 원문

1. full-map editor zoom expands map-object culling to the visible world bounds — CH3 layout culling 기존1, main control 동일.
2. latest main original full initMapObjects executes with no unseeded RNG; 12 hands plus separate lore — CH1-04 resource.source.main_sha의 e556b617 대 현재6d987cb8 차이, main control 동일. 내용 별도 전수 비교0차이.
3. replay and committed snapshot agree; absent undefined/null/zero remain separate and protected bytes unchanged — CH3-01 source.main_sha의0119f304 대 현재6d987cb8 차이. 기존 test는 extraction_head만 normalize한다. 별도 비교에서 provenance 외 전데이터 차이0. main에는 CH3-01 자체가 없어 main suite 재현 대상이 아니며, 구현 기준의 기존 파일은 byte 보존했다.
4. partial source inspection preserves unknown JSON and explicit 0/1 nav without authorizing a scene — adapter resources.loadDrawAuthority 기대, main control 동일.
5. missing/unknown source stays pending and output budgets retain 4MiB scene within 8MiB world — 같은 adapter 기대, main control 동일.
6. decoded pack reaches native template and enemy factories while basic forest and default stage branches remain protected — _resetInteractInput is not defined, main control 동일.
7. read-only map-pack snapshot reports actual runtime object positions and detaches its receipt from mutable callers — 같은 원문 ReferenceError, main control 동일.
8. editor X/Y listeners validate, export JSON, and create a public game fragment that native play consumes without invalid-edit fallback — 같은 원문 ReferenceError, main control 동일.
9. map-pack public pause button toggles native pause and resume after the existing start button is hidden — 같은 원문 ReferenceError, main control 동일.

### 작업 중 실패·경고

- 초기 새 Node는 CH2의 lore 기대를 가져와6/1 실패. 실제 native si10 altar를 확인해 표시·기대를 수정했다. 다음 실행의6/1은 init RNG0 기대였고, G25871–25880의 두 실제 draw 및 제단 좌표를 독립 계산해2로 수정했다. new-node/new-node-final 실패 로그 보존, 최종7/0.
- Node 회귀 첫 실행들은 sparse의 CH1 ground_dark_soil.png/atlas JSON 부재로 import 단계 실패. 필요한 정확 경로만 materialize한 뒤 최종108건을 실제 실행했다. 전역 asset 폴더 전체 checkout0.
- 외부 보조 작업의 argparse 구분자, 유효하지 않은 node 경로, sparse add의 --no-cone 옵션, 구 Python의 tar filter, PIL 부재는 수정/대체했다. Node/Godot 검사 PASS로 계산하지 않음. 화면은 PNG 원본9장 직접 검수했다.
- 첫 main-control은 .git 없는 fixture 때문에 CH1 tool이 abort. 읽기 전용 metadata를 연결한 최종 control51/8만 근거로 썼다. 최초 provenance-proof는 extraction_head도 달라 실패, 기존 test의 정규화 경계대로 분리한 최종 proof에서만 내용 차이0 확인.
- 기존 Camera2D physics interpolation 경고는 새 scene와 CH1/CH2/P3 GUI에 남는다. P3002 종료 ObjectDB8 경고는 해결하지 않았으며 ERROR와 구분한다. 모든 Godot 실행의 engine/stderr 로그를 그대로 보존했다.
- 사용자 제공 로비8실패는 선재 진단 이력일 뿐 이번 회귀의9실패와 합치지 않는다. 로비 전체는 재실행·수정하지 않았다.

## 6. 보호·실행·제출

- 기준 merge 직후 materialized tracked2572개 SHA256을 저장. 구현·전체 회귀 후2572개 모두 byte 동일(`protected-pre-report.json`). 최종 변경은 새10경로 및 보고서·CHANGELOG뿐이며 원문·map/shared/P3·다른 소유 파일0줄이다. 추가 sparse 원화도 해당 Git blob과 별도 대조한다.
- Godot4.7.2 실행마다 literal `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l` 검사,2 이상은30초씩 대기. import2회·contracts1회·CH1-01 1회 대기 기록. 타 프로세스 종료0·동시 Godot2개 이하 규칙 준수. 각 실행 override를 해당 상수 격리로 만들고 finally0byte, 마지막 빈 파일 제거.
- 새 EXODUSER-ch3-02-Isolated-20261020, 기존 각 파일의 격리 상수를 그대로 사용. 실제 사용자 저장 IO0. Godot cache는 OUT/it-05 검수 cache의 APFS 사본으로 자기 WT에서만 사용, 타 cache 수정0.
- 하니스 stdout은 join/UTF-8 외부 파일, node는 `node-harness.py --node <실제 절대 실행파일>` 인자로 받는다. shell binary 추정 고정값으로 테스트하지 않음.
- Godot 자동 생성 신규 sidecar228개는 OUT/generated-sidecars로 분리하고 자기 신규 UID3개만 제출. R의 읽기 전용 node_modules symlink는 제출/WT 정리 전에 제거한다.
- docs 전체 tracked 키워드 검색을 docs-search.log에 남겼다. 해당 범위의 현재 상태·원본 값·한계는 이 보고서와 최상단 CHANGELOG에 동기화하고 다른 담당 문서는 수정하지 않았다.
- 정상 staged docs-sync·pre-commit·whitespace 검사 뒤 자기 branch만 push, 원격SHA 일치 확인→OUT/DONE.txt(브랜치/SHA/수치)→자기 WT 제거 순서. branch·원로그·이 보고서 사본은 남긴다. 실제 제출/원격/정리 결과는 submission.json/DONE.txt가 근거다.
- R 시작 HEAD dd49171c5b88e211575a41f185395d6c0a14b184 / branch codex/mac-live-play-time-main-20261017 / tracked INDEX·WORK empty를 최종 대조한다. PC 실행·main 반영·배포·실제 전체 CH3 플레이 완료 주장은 없다.
