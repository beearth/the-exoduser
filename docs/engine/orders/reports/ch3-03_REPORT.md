# CH3-03 — si11 원본 snapshot·순수 계약

## 결과와 구현 경계

**순서안 §4.3의 첫 단계인 si11 source snapshot·읽기 전용 계약 구현 및 기술 검수 완료.** CH2-03(f918b9a9)의 source 우선 방식과 CH3-01/02의 파이프라인을 재사용했다. §4.3은 snapshot/순수검사를 먼저 추가하고 실제 독립 소비를 후속으로 다룬다. 이번에는 si11의 실효 initMapObjects·resource manifest·독립 World·Main·State·전투·스폰·지역 진행·전환을 연결하지 않았다. `runtime_bound/full_stage_ready/visual_verified=false`다. 독립 소비를 포함한 실제 3-2 플레이 완료나 시각 승인을 뜻하지 않는다.

| 항목 | 실제 기준 |
|---|---|
| 작업 / 브랜치 | ch3-03 / codex/ch3-03-20261020 |
| 시작 fetch main | 6d987cb8a31d0aadd2b6a8cf1e9a781d1fb76d4d, 사용자 최소 SHA 충족 |
| 의존 / 분기 | CH3-02 dbaf16473cfab078c65b407142276ce352b0cb35가 main에 없어 그 끝에서 --no-checkout 분기·no-cone sparse. 최신 main 정상 merge |
| 구현 기준 merge | 92aefe7a26ce4abe50e86c02ed9a3a97ecd51bb9. 최신 main QA-007도 인수, CHANGELOG만 충돌 해소 |
| 참고 순서안 | FDG_SOURCE_TRACE_MAPS_CH3_20261020.md §4.3, trace-maps-ch3 2eafd158. 원격 추적 원문을 OUT/trace-reference.md로 보존 |
| 원본 | game.html 65,692행 / SHA256 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4 (시작 main과 동일). 기존 HTML/JS/원화/제품 map bytes 보존 |
| 산출물 | si11.json 123475byte / SHA256 e83aa6cc15375623e22255b0f2f90901c5544f7520f83f41b6c9135d30fca406 |
| 원로그 | ~/exoduser-wt/_out/ch3-03/: command/result/stdout/stderr/원문 대조·실패·보호·override 기록 |

## 동일 source 파이프라인의 대상 한정 확장

| 파일 | 역할·변경 |
|---|---|
| godot/tools/export_ch1_area_source.mjs | stage11 지원과 CH3 분류/CLI guard, 원 _iceC/_iceB/mkRng/_ICE11 및 compose11 실행, 기본 editor floor/selector/STG/guard 후보 증거만 추가. 30행 추가/11행 삭제 |
| test/fdgCh3Stage10Source.test.mjs | 이제 지원하는11을 기존 unsupported-stage 목록에서 미지원14로 교체한2행만 변경. 단정 수·stage10 기대값·교차 덮어쓰기 거절·기존 provenance 기대 무수정 |
| godot/data/ch3_map_source/si11.json | schema exoduser.ch3-area-source.v1 / stage11 / source-only 증거 |
| godot/port_modules/ch3_map_source/stage11_contract.gd (+UID) | read_area/validate_area 순수 API. CH1 scalar/hash·CH2 엄격 비교·CH3-01의 동일 catalog/meta/ground/room/scope pin 재사용 |
| test/fdgCh3Stage11Source.test.mjs | 원 AST·독립 기존 VM·全grid·jitter/타이머·STG·asset bytes·0/1/4/10 회귀·CLI 음성검사9개 |
| godot/tests/test_ch3_03_stage11_source.gd (+UID) | 새 격리의 순수 계약·동일 참조/입력불변/실제 global RNG 불변·오염 거절·별도 seed0/uint32 max 검증 |
| 보고서 / CHANGELOG_SYNC | 이 보고서와 기존 형식의 최상단 동기화 절 |

총10경로: 신규6 + 공유 source exporter/기존 stage10 검사2 + docs2다. 맵 공유 예외는 CH1-02 조건(파이프라인 재추출·대상 한정·맵/지역/굴 회귀)을 적용했다. 제품 map.json·원 exporter/export_world·기존 CH1/CH2/CH3 data/계약/World/reader·공용 main/world/hud/player/native_normal_enemy_hurte/native_source_new_run_state·P3 소환굴/지역·다른 담당 파일의 구현 변경0줄이다. 새 bitmap·원화 생성/변환/재인코딩/제품 이송0이다.

새 Node는 CH3-02의 변경 전 shared exporter를 임시 UTF-8 module로 읽어 stage0/1/4/10 전체 결과의 깊은 동일성을 확인했다. 더불어 변경 전 도구의 native observer 안에서 원문 compose11·genFromTemplate·START·regionInit을 독립 실행하여 si11의 전40000 tile/rooms/holes/regions/문/START를 대조했다. 새 도구의 결과를 자기 기대값으로 복사한 PASS가 아니다. 기존 optional observer는 snapshot capture 뒤에만 실행하며 observer의 VM 변경이 snapshot으로 새지 않는 것도 검증했다.

## 최신 main 원문 행과 정확 값

G는 위 SHA game.html 행이다. JSON에는 AST/본문의 행 범위와 SHA, 읽은 파일 전부의 SHA를 저장한다. 전수 raw 배치와 소환굴은 JSON 및 기존 trace 부록을 함께 읽는다.

| id / 근거 | 실제 관측 |
|---|---|
| G16668–16676 / G30135–30147 | dungeon11 ready=false, is_dungeon=false/is_face=false, FIXED_MAPS[0] clone 선택. 기본200×200/T40 필드. 문서의300²·빙판 관성·절벽 낙하를 새 gameplay 계약으로 만들지 않음 |
| G17813–17814,17952–17956 / G18204 | 원 _iceC/_iceB 및 지역 seed11001/11002/11004로 만든 raw18. 고정9+지역seed 장식9, scale 부재9/rot 부재18, cross0. compose hand1/dense1/lm[]·empty2개를 그대로 보존 |
| G30042–30085 | editor tileRLE=[1,40000], 원 mkRng(11*7919+17)의9굴 지터·clamp18..182. si10 basin/CH2 path/CH1 hill 추가0 |
| G30218–30694 | 최종40000 tile:0/1/2/3/4=38986/36/3/0/975, SHA5b40eb67c1aa3fd6ad407f9af06db91f549456bcd9c7d91ed31265c5a3a3b87e. 원 generator의 room/기둥/exit/굴 후처리 결과 |
| G30335–30442,31564–31566 | room6·STARTtile100,185/world4020,7420. gate metadata x99..101/y5(실제tile0), exit x99..101/y7(tile2), exit 중심100,7. code3타일0 유지 |
| G31617–31620(부분 범위) | G._bossCx/G._gateY+3로 후보100,8·actual tile4. 원 tile===0 조건 false를 기록. 실제 mkEn·문지기 null/생존·처치·호위를 실행한 증거가 아님 |
| G16697–16713 / 원 EL·HELL_THEMES·HELL_BOSSES | STG11=HELL WINTER / 지옥의 겨울2구역 / 서리의 기사·be2·monLv300·hell2/hellFloor1/chapter2·isHellBoss=false. 보스 actor 생성/패턴은 미확인 |
| G30486–30626 / G31029–31030 | 최종13굴·1050, 원 순서/size/room/alive0/count 보존. 원9굴 뒤 자동 추가4굴, 마지막굴 room=-1. stage0 할인/si10 좌표·650분모 복사0 |
| G60697–60718 | NW350/NE300/SW250/SE150. cleared 전부false·fbIdx 전부-1. si10의 SW초기clear를 이식하지 않음. 실제 진행 owner writer 없음 |
| G17693–17758 /18392–18426 | raw CH3 catalog61/base77, 원화61참조/35개 파일+ground1. source.files38=game/maps+36원화. byte/hash 참조만, 최종 실효 콜리더 NOT_OBSERVED |

seed20261020 생성기의 실제 Math.random 소비는13회, 최종 state2962398007이다. 모든 최종13굴 timer는 해당 draw1..13의 `600+state/4294967296*60` 그대로다. _iceB의 지역 seeded RNG와 clone 지터 mkRng는 이13회의 Math.random과 다른 native RNG다. Node가 원 mkRng의 첫9후보 좌표와 ordered13 timer를 독립 계산했고, 별도 실제 snapshot seed0/4294967295도 생성해 Godot 계약 READY를 확인했다. 순수 계약은 산술 증거만 검증하며 실제 RNG·clock·G/State를 진전시키지 않는다.

READY는 `value=원 raw 동일 참조`, scope=source_snapshot_only·source_only_stage11이다. NOT_READY는 reason/raw 동일 참조와 value 부재, 입력 불변이다. 부재/undefined/null/0를 강제로 보충하지 않으며 si11의 undefined_paths는 실제[]다. FILES/SYMBOLS/타일 byte hash·전수 목록·부재 키·source schema·장별 stage·seed 증거를 검증한다. source pin은 선언 증거이고 실제 원문 bytes 검증은 Node가 수행한다.

CLI는 `node <exporter> <explicit-root> <explicit-json> --stage 11 --seed 20261020`. root 내부는 ch3_map_source/si11.json만 허용, 기존 출력도 같은 schema/stage11일 때만 쓴다. 다른 stage/제품map/원문·foreign schema·잘못된 stage/seed·symlink/조상 junction을 쓰기 전에 거절한다. Node 경로는 하니스 --node 인자로 받고, 하위 실행은 process.execPath를 사용한다. QA-007의 outputSymlink helper를 새 검사에서도 재사용해 Windows에서는 동일 조상 거절을 junction으로 검증하도록 했으며 skip/catch로 PASS하지 않는다. PC 실행은 미확인이다.

## 실제 검사·실패와 경고

| 원로그 prefix | 실제 결과 | 범위 |
|---|---|---|
| extract | exit0·snapshot 생성 | JSON만, 원문/PNG 변경0 |
| new-node-final |9통과/0실패/0SKIP·exit0 |원문 독립 대조·全grid·18배치·35파일·타이머·기존0/1/4/10·CLI |
| new-godot |385단정/0실패·exit0·stderr0·ERROR0 |순수 read/validate·오염거절·RNG불변·seed2종·Main/World0·save0 |
| source-node |62중61통과/1실패·exit1 |CH1-01/03·CH2-01/02·CH3-01/02·asset6·pit6. 기존 CH3-01 provenance1 실패 그대로 |
| ch3-source-final |11중10통과/1실패·exit1 |최종 unsupported 목록11→14 변경 검증. 위와 같은 provenance 실패1 |
| provenance-proof |exit0 |CH3-01/CH1-04 기록 main SHA 외 내용차이0, 기록 커밋들의 game bytes 동일성을 먼저 증명. 기존 fixture/검사 기대 변경0 |
| map-node / map-main-control |각37중28통과/9실패·exit1 |시작main6d 원본 archive로 기존9실패의 전체 이름/순서 동일 재현, 새실패0 |
| contracts | 5그룹 / 실패0·exit0·ERROR0 | 자체 상수 없어 작업 격리 사용 |
| ch1-01 | 63 / 실패0·exit0·ERROR0 | 기존 격리 상수 |
| ch1-02 | 189 / 실패0·exit0·ERROR0 | 기존 격리 상수 |
| ch1-03 | 75 / 실패0·exit0·ERROR0 | 기존 격리 상수 |
| ch2-01 | 362 / 실패0·exit0·ERROR0 | 기존 격리 상수 |
| ch3-01 | 641 / 실패0·exit0·ERROR0 | 기존 격리 상수 |
| ch3-02 | 2713 / 실패0·exit0·ERROR0 | 기존 격리 상수 |
| p3002 | 298 / 실패0·exit0·ERROR0 | GUI·SKIP0 |
| p3003 | 43 / 실패0·exit0·ERROR0 | GUI·기존 격리 상수 |

기존 source-node의 CH1·CH2 순수29, CH2 World7, CH3 World7, asset6, pit6은 통과했다. CH3-01의 `replay and committed snapshot agree; absent undefined/null/zero remain separate and protected bytes unchanged`는 artifact.main_sha0119f304 대비 현재6d987cb8로 실패한다. 원 test가 이미 허용하는 extraction_head 차이 외에는 main_sha만 다르고 나머지 전데이터 차이0임을 별도 proof로 확인했다. 원 test 실패는 유지하고 PASS로 집계하지 않았다.

맵 Node 실패9개는 다음 원문 그대로다(각 stdout/stderr도 보존).

1. CH1-1 overview keeps distant props visible while other stages keep their culling contract
2. partial source inspection preserves unknown JSON and explicit 0/1 nav without authorizing a scene
3. missing/unknown source stays pending and output budgets retain 4MiB scene within 8MiB world
4. regions split at tile midpoint and totals come from spawn holes per quadrant
5. kills are attributed to the spawn(home) region, not the death position
6. region clears at 80% kills and shows the Hell Gothic purge banner (no showPH toast)
7. stage 0 region additionally requires its Abyssal Angler dead
8. empty region (no holes, no angler) is silently cleared at init
9. gate guard kill grants +10% only to the gate region

culling1·adapter의 resources.loadDrawAuthority 기대2·Image 없는 region VM6이다. `map-main-control`의 제품·검사 입력은 시작 main6d archive이고 byte 동일 assets/JS만 읽기 참조했다. 소환굴·지역의 실제 Godot GUI 회귀와 웹 VM 하니스 오류를 구분한다. 사용자 제공 로비8실패는 이9실패와 별도이며 이번에 재실행/수정하지 않았다.

기존 Camera2D physics interpolation 경고와 P3002 종료 ObjectDB8 누수는 미해결 원 stderr 그대로다. P3002 actors_registered10/unported_spawns158·P3003 full_fieldboss_combat=false·kill hook/holes finalization 미연결, CH1-02 source-image 등록4 NOT_READY도 보존한다. 기존 si10 World의 source isW16806/canMv16806/LOS400·tile Physics/union은 이번 재추출 oracle로 차이0을 확인했다. 기존 si10 resource JSON을 다시 쓰지 않고 oracle만 UTF-8 외부 파일에 저장했다.

## 보호·디스크·실행 기록

- 기준 merge 후 materialized tracked2593개 SHA를 저장. 이후 허용 source exporter·기존 stage10 음성검사·최상단 CHANGELOG 외2590개 byte동일을 최종 대조한다. R HEAD dd49171c5b88e211575a41f185395d6c0a14b184 / codex/mac-live-play-time-main-20261017 / tracked INDEX·WORK empty를 시작·끝에 대조한다.
- 초기 merge가 빈 index 트리를 임시 stash로 처리하며 전체 binary diff에 머문 사실을 관측했다. 자기 index/임시 stash commit 기록을 OUT에 보존한 뒤 해당 자기 diff-tree 자식만 종료하고 정상 merge를 재시도했다. 정확 원인은 미확인이다. CHANGELOG는 CH3 의존 prefix+최신main 전체 suffix를 보존했다. reset/rebase/강제push/훅우회/타인 WIP 처리0.
- 처음 보조 Python의 UTF-8 stdin 파싱이 실패해 제품 변경 전 중단됐다. ASCII 보조 코드/명시 UTF-8 파일로 바꾸어 실제 추출·검사를 수행했다. 실행 안 된 작업을 PASS로 계산하지 않았다.
- 웹 대형 에셋 전체 checkout0. 필요한 Godot/engine/test/tools와 관련 docs·root source·CH1 회귀92 PNG/추가9경로·CH2/CH3 원화/필수JS만 sparse 선택했다. 자기 cache는 기존 OUT/it-05 cache의 APFS 사본이며 원 cache 수정0.
- 매 Godot launch 전 literal `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`, 2 이상이면30초씩 대기한 결과를 process-gate.jsonl에 저장했다. 타 Godot 종료0, 자기 실행 순차, override는 실행별 격리/worker2를 쓰고 finally0byte로 비웠다. 새 격리는 EXODUSER-ch3-03-Isolated-20261020, 기존은 각 파일 상수다.
- 하니스 명령은 argv 배열, stdout/stderr는 UTF-8 임시 파일, node 실행경로는 외부 --node 인자로 받았다. 사용자 원 저장 IO0. engine import exit0·ERROR0.
- Godot 자동 생성 신규 sidecar는 OUT/generated-sidecars로 이동하고 자기 계약/test UID2만 제출한다(그 외228개 OUT 보존). node_modules는 R의 읽기 전용 의존 symlink였으며 마지막 제거한다. docs 키워드 전체 검색은 docs-search.log에 보존, 이 보고서·CHANGELOG에 정확 범위와 수치를 동기화했다.
- 명시10경로만 stage, staged whitespace·정상 docs-sync/pre-commit 훅 후 자기branch만 비강제push한다. 원격SHA대조→OUT/DONE.txt(브랜치·SHA·수치)→자기WT 제거. 최종 SHA/정리/R보호는 submission.json/DONE.txt를 근거로 하며, branch·원로그·보고서 사본을 남긴다. main push·force·git add -A·배포0.

================= MAP PRODUCTION REPORT =================

STAGE: CH3 si11 / CH3-03 source snapshot·순수 계약. 새 scene/실게임 맵 제작 없음.

MASTER
- silhouette: 원 selector의 기본200² field와 raw18을 추적. 문서300² 협곡 설계를 실행한 것이 아님.
- regions: NW350/NE300/SW250/SE150, 모두 미클리어·fbIdx-1.
- main route: START100,185·EXIT100,7 metadata와 전grid 인수, 반경/prop 포함 실종주 미확인.
- side spaces: 원문 raw 군집86,154 /114,102 /86,48과 해당 장식의 source 입력만 보존.

OUTER MASS
- LEFT / RIGHT / TOP / SOUTH: _ICE11/CH3 catalog 원문 참조만. Godot 환경 mass 제작/인수0.
- major holes: 빈 면·동선·충돌과 시각 환경의 역할을 후속 독립 소비에서 분리 검수할 필요.

LARGE
- source assets: CH3 원화35파일+ground1 byte 참조. 새asset0.
- composites / overlap / repeated silhouette: 이번 관측·제작 없음, 미확인.

MEDIUM
- connections / remaining holes: 후속 MAP-LOOK 별도 제작·카메라 검수 전 미확인.

GROUND
- shadow / contamination / structure integration: editor [1,40000]와 최종tile은 추적, shader/광원/시각 depth 제작0.

PLAYABLE
- main arenas / travel space / breathing space / threat space: 원 input·생성grid·굴분모만 검수, 실제 actor·전투 미연결.
- combat readability: 미관측. 빙판 관성·낙하를 창작하지 않음.

LANDMARK
- primary / secondary / tertiary: rampart/crystals → cliff/ridge → bridge/stalag 원 군집과 raw 장식만. 실효 placement/콜리더/interaction NOT_OBSERVED.

CAMERA QA
- START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT: si11 전부 미촬영·미관측. 기존 si10 회귀는 si11 시각 증거 아님.

TECH QA
- route / collision: 全grid·source hash/입력 보존, 실제 si11 Physics/반경 종주는 미확인.
- pageerror / 404: 웹 미실행, 해당 없음. native 계약/기존 회귀 ERROR0.
- seam: 원문 raw/타일 경계 데이터 검증, 시각 seam 미관측.
- loading: JSON/순수 계약 READY, Godot import 통과. 새si11 texture 로드 안 함.
- performance: 순수 검사 실행 시간만 기록. FPS/전투 성능 주장0.

FILES
- stage-owned: 신규6경로, 공유 추출기/음성검사2경로, docs2경로.
- concurrent touched: 0. 정상 main 의존 merge는 별도 이력.
- unrelated touched: 0. 공용6/P3/원본/map/기존 소비자0줄.

GIT
- staged: 명시10경로만. commit/push SHA는 OUT/DONE와 submission 기록.
- commit: 정상 docs-sync/pre-commit·whitespace 검증.
- push: 자기branch만, 원격일치 후 DONE/자기WT 제거.
- deploy: 0.

VISUAL VERDICT: **FAIL (시각 인수 증거 없음)**. source-only 기술 완료와 구분하며 시각 회귀를 발견했다는 뜻은 아님.

NEXT PASS: §4.3 후속 독립 소비에서 같은 World/query 계약으로 실효 initMapObjects·충돌·반경·시각8카메라를 별도 인수. 새 Main/State/shared 연결은 총괄 권위 인수 전 HOLD. 다음 단위는 이번에 착수하지 않는다.
