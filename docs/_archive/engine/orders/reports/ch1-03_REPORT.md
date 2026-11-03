# CH1-03 — si1 읽기 전용 원본 데이터·계약

**DONE: si1 지형·12개 손배치·13개 소환굴의 원본 snapshot과 순수 검증 계약을 구현했다.** Godot의 si1 World/전환/적·보스/렌더 소비자는 연결하지 않았다. 기술 검증은 source snapshot 범위이며 1-2 플레이 가능·시각 인수 완료를 뜻하지 않는다.

## 기준·의존·작은 worktree

| 항목 | 실제 값 |
|---|---|
| 작업 / branch | ch1-03 / `codex/ch1-03-20261020` |
| WT / 원로그 L | `~/exoduser-wt/ch1-03` / `/Users/fordeargamers/exoduser-wt/_out/ch1-03/` |
| fetch 최신 main | `e556b617190c325ca39f5add04357f5dea5ca87e` |
| 의존 | CH1-02 `d0f7eaf4875ec2c2649a1e724e01a528769665cd`가 main에 없어 사용자 지시대로 그 끝에서 분기. CH1-01도 해당 계보에 포함 |
| 원본 game.html | main과 WT byte 동일, SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |
| 지시서 | main에 추적 문서 부재. `codex/trace-maps-ch1-20261020:docs/engine/FDG_SOURCE_TRACE_MAPS_CH1_20261020.md` §4.3·§4.8. L/trace-order-reference.md |
| 최신 맵 표현 정책 | main e556b617의 FDG_GODOT_CUSTOM_STRATEGY §8을 읽음. 맵 그림/조명/생동감은 Godot 직접 제작, **충돌·동선·스폰·지역의 원본 게임플레이 계약은 보존**. 이번 단위는 후자의 원본 데이터만 추적 |
| R 보존 | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`. branch·tracked INDEX/WORK 시작/종료 동일, 작업 파일 쓰기0 |

사용자 지정 `git worktree add --no-checkout -b ... <CH1-02 SHA>` 후 `git sparse-checkout set --no-cone --stdin`을 적용했다. 새 --no-checkout worktree의 빈 index를 `git read-tree -mu HEAD`로 초기화해 선택 경로만 실체화했다. 기존 WIP를 reset/checkout한 작업이 아니다. sparse107패턴: godot/docs/engine/test/tools와 원본 JS/JSON·필수 루트 파일, layout/si1 geometry JS, 회귀에 필요한 **원본 PNG92개만** 선택했다. 웹 assets 전체 checkout은 하지 않았다. 패턴·초기화 로그는 L에 보존했다.

최초 checkout 약1.1GiB, import 후 약1.4GiB였다. 작업 종료 시 **push → 원격 SHA 일치 → DONE.txt 작성 → `git worktree remove --force`** 순서로 이 자기 WT만 삭제한다. 브랜치/원격 ref·보고서 사본·원로그는 남는다. 실제 삭제 확인은 L/cleanup.json과 DONE.txt의 최종 항목을 따른다.

## 구현 파일·API

| 파일 | 구현 |
|---|---|
| `godot/tools/export_ch1_area_source.mjs` | 새 `buildAreaSnapshot(root,{stage,seed})`로 stage0/1 지원. stage1에서 원 geometry JS와 `_CH1S1`·`_MAP_COMPOSE.1`을 정확 AST/원문으로 평가하고 원 selector→generator→START→regionInit 실행 |
| `godot/data/ch1_map_source/si1.json` | schema `exoduser.ch1-area-source.v1`, 191974byte. 원본/함수 SHA·행, 최종 tiles/rooms/START/게이트/출구, raw hand12/meta77/deco110, source geometry·mask·RLE, holes13/1000·4분면 기록 |
| `godot/port_modules/ch1_map_source/stage1_contract.gd` | `extends RefCounted`; 순수 `read_area(raw)` / `validate_area(raw)`. 필수 타입/길이·핵심 값·순서·타일/마스크 SHA·RLE coverage·출처 형식·seed 소비 기록 검사 |
| `test/fdgCh1Stage1Source.test.mjs` | 최신 main byte 대조, 독립 원 geometry/IIFE 평가, full tile SHA/카운트,12배치/역할,13굴/분모,14회 RNG 소비, 결정성·기존 파일 불변·미지원 쓰기 거부 |
| `godot/tests/test_p3004c_ch1_stage1_source.gd` | 실제 JSON 입력·동일 참조·반복/불변·잘못된 타입/해시/순서/분모/출처 거부. Main/World0, user save I/O0 |
| `test/fdgCh1AreaSource.test.mjs` | 기존 CLI 음성 목록에서 이제 지원되는1만 제거하고2/3 거부 유지. stage1 CLI 양성 검사는 새 테스트가 수행. stage0 검사를 삭제/선별하지 않음 |
| UID2 | 새 contract/test의 Godot 생성 UID만 포함 |

기존 `buildStage0Snapshot()`은 stage0 전용 wrapper로 유지해 stage1을 계속 거부한다. 기존 stage0 producer/data와 제품 map은0줄이다. CLI는 stage0/1 각각 대응하는 새 si0/si1 snapshot 경로 또는 명시 외부 JSON만 출력한다. stage2/3·잘못된 seed·공유 map/다른 stage 파일 출력은 쓰기 전에 거부한다. 원본 함수 값·분기 문자열 치환, 타일/총량 위조 stub는 추가하지 않았다.

stage1의 `source.main_sha`는 실제 fetch main e556b617, `source.extraction_head`는 추출 WT의 의존 HEAD d0f7eaf4다. 이 둘을 같은 것으로 쓰지 않았다. 원본 HTML/JS/에셋 쓰기0, acorn은 ignored WT node_modules/acorn 링크로 R의 기존 설치본을 읽기만 했다.

검증 READY는 **원 snapshot 동일 참조 + scope=source_snapshot_only + runtime_bound=false + full_stage_ready=false**다. NOT_READY는 reason/raw 동일 참조를 주고 최상위 value는 없다. present undefined/absent/null은 기존 exporter의 mask 규칙을 유지하며 이번 원본은 undefined_paths=[]다. source SHA/행 기록의 형식·선언 pin은 순수 contract가 검사하고, 실제 파일·AST 내용은 Node 검증이 대조한다. contract 자체의 source 파일 읽기·노드/자원 설치·RNG/시계·저장 쓰기는 없다.

## 최신 원본 값

| 항목 | 원본 근거 | 실제 값 |
|---|---|---|
| 원본 선택 | game.html30042–30085/30135–30147 | FIXED_MAPS[0] 깊은 clone + si1 geometry RLE. legacy FIXED_MAPS[1] 단순 복사 아님 |
| grid / 최종 타일 | 30218–30694 | 200×200/T40, 40000. code0/1/2/3/4=`13588/25590/3/0/819` |
| 최종 tile byte SHA | 원문 selector→genFromTemplate 결과 | `c7994170661e29348e27bdad098020edcb761a11943e68bdea60f9d744236dc1` |
| rooms / START | maps_data.js10–22, game31564–31566 | rooms6, tile100/185 → world4020/7420 |
| gate / exits | game30335–30442 | x99/100/101, gate metadata y31 / exits y33, exit center tile100/33 |
| 손배치 | `_CH1S1`17972–17987, compose18172–18177 | 순서 보존12, LANDMARK5/GAMEPLAY7, region 이름7 |
| 초기 카탈로그 | game18392–18426,17520–17637 | 초기 meta77/deco110 raw 별개. 실효 merge/최종 MAP_OBJS 미실행 |
| 소환굴 / 분모 | game30486–30626,31029–31030 | 순서 보존13개 /1000,4분면250/300/250/200 |
| timer | 원 native 생성 + seed20261020 | LCG14회, final state3323445034. 후보 slot8은 timer 소비 후 제거되어 최종13개. 자연 부트 RNG 실측 아님 |
| geometry | ch1_si1_geometry.js 전체106행 | source regions7, landmark anchors8, spine15, widthSamples5, bypass2, treeBlockRadius9 |

**gate 좌표 metadata3개와 runtime tile code3은 별개다.** 원본 최종 si1에는 code3 타일0개이며 임의로3개를 칠하지 않았다. 또한 geometry의7구역·손배치의7개 region 이름·전투4분면은 서로 다른 단위다.

### 원본 mask/RLE와 최종 타일의 구분

`source_geometry.mask`는 원 JS buildMask의40000개0/1 값이고 SHA는 `c540f7be7e05019d9ada9d0d08a1dea55d4f2e7e73f5d023c476f7f676cf7adf`다. `editor_tile_rle`는 원 buildRLE의930숫자/465쌍이며 값1/2는 editor floor/wall이다. mask↔RLE를 전수 대조한다. 이 초기 mask를 최종 runtime 타일과 같다고 취급하지 않는다. 원 generator가 보스방·출구 등 후속 변환을 수행한 최종 결과가 위 c799…다.

### raw hand12 전체

| 순서 | id | tile x/y | role / region |
|---|---|---|---|
| 0 | m_c1tree | 83/80 | LANDMARK/tree |
| 1 | m_c1camp | 49/122 | LANDMARK/central |
| 2 | m_c1altar | 151/91 | LANDMARK/tree |
| 3 | m_c1pool | 49/151 | LANDMARK/toxic |
| 4 | m_c1cocoon | 151/136 | LANDMARK/cocoon |
| 5 | m_c1sroot | 91/180 | GAMEPLAY/start |
| 6 | m_c1sbone | 85/162 | GAMEPLAY/south |
| 7 | m_c1spod | 138/158 | GAMEPLAY/south |
| 8 | m_c1sroot | 129/128 | GAMEPLAY/cocoon |
| 9 | m_c1sbone | 79/109 | GAMEPLAY/central |
| 10 | m_c1spod | 128/83 | GAMEPLAY/tree |
| 11 | m_c1sbone | 116/43 | GAMEPLAY/north |

raw 타일 입력이다. 최종 nearFloor 위치·collider·스프라이트·높이를 의미하지 않는다. 최종 MAP_OBJS/effective_prop_positions/prop_colliders는 NOT_OBSERVED다.

## 실제 검사와 실패 기록

지정 Godot4.7.2만 사용했다. 각 실행 전 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을 검사하고2 이상이면30초 대기했다. suite별 실제 상수/작업 격리명을 적용하고 매번 finally에서 override.cfg를0byte로 비웠다. argv/실제 HEAD/main/exit/시간/격리명/stdout/stderr·engine log는 L의 prefix별 파일이다.

| 원로그 prefix | 실제 결과 | exit / 초 |
|---|---|---|
| new-node | 신규9통과/0실패/0SKIP | 0 /1.732 |
| new-godot-fixed | 신규75단정/0실패 | 0 /0.681 |
| stage0-node | CH1-01 전체9/0 | 0 /2.078 |
| stage0-godot | CH1-01 전체63/0 | 0 /0.359 |
| assets-node | CH1-02 전체6/0, 원본92PNG bytes/hash 대조 | 0 /0.843 |
| assets-godot | CH1-02 실제 World189/0 | 0 /2.602 |
| pit-node | 기존 P3-001 관련6/0 | 0 /3.523 |
| map-node | 전체37:28통과/9실패, 기존9개와 이름 동일·새 실패0 | 1 /0.147 |
| import | 선택된 godot 경로 import | 0 /12.896 |
| contracts | 전체5그룹/실패단정0 | 0 /2.219 |
| p3002 | 전체6그룹298/0·SKIP0 | 0 /8.483 |
| p3003 | core/display/actual43/0 | 0 /7.722 |
| encounter | 전체3그룹/실패단정0 | 0 /3.152 |

신규는 `EXODUSER-ch1-03-Isolated-20261020`이다. 기존 CH1-01/02와 P3002/3003는 각 파일의 격리 상수를 존중했다. 강제 상수가 없는 contracts/encounter/import만 작업 격리명을 사용했다. 새 테스트 자체는 Main/World0이고, 기존 runtime 회귀가 부팅한 stage0과 섞어 보고하지 않는다.

초기 신규 Node는8통과/1실패:4MB `git show game.html`을 받는 기본 maxBuffer 부족(ENOBUFS)이었다. 명시16MiB로 수정해 전체9/0이다. 첫 관측은 L/first-node-observation.json과 해당 Codex 도구 실행 로그, 최종 stdout/stderr는 L/new-node.*에 있다. 초기 신규 Godot는66단정/1실패와 SCRIPT ERROR1: 잘못된 입력 Array를 String과 직접 비교하는 검증기 오류였다. 타입별 literal 비교로 수정하고 배열로 오염된 schema/source/region/hash/scope 등의 음성 검사를 추가하여75/0·stderr ERROR0을 확인했다. 실패는 L/new-godot.*에 그대로 남겼다. 영향받지 않은 기존 통과 suite를 다시 돌려 수치를 불리지 않았다.

최종 신규/CH1-01/02/contracts/P3002/P3003/encounter는 stderr ERROR0이다. 기존 P3002 ObjectDB8누수·Camera2D 경고, P3003 Camera2D 경고는 남았다. 맵 Node9실패도 기존 culling fixture1·adapter pending2·Image 없는 지역 VM6이며 수정/선별하지 않았다. 기존 stage0의 실제168소환 중 actor등록10/미이식158, 지역 full_fieldboss_combat=false와 CH1-02의 source-image 등록4건 NOT_READY도 그대로 기록하며 전투/전체 source wait 완료로 승격하지 않는다.

사용자가 제공한 선재 결함 원문(이번 작업에서 재실행/수정하지 않음):

> 알려진 선재 결함: 로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)는 원문만 기록.

## 보존·제출·후속

L/protected-baseline.json의1243개 실제 선택 파일 SHA가 모두 같다(L/preservation.json). 기존 game/JS/PNG·제품 map.json·si0.json·stage0 producer·map-source-adapter/export_world·공용6개와 P3 지역/소환굴 파일0줄이다. 맵 공유 파일을 수정할 필요가 없어 이번 허용 예외도 사용하지 않았다. P3-002의 stage0 상수와 owner는 그대로 두고 si1의1000은 읽기 전용 데이터로만 출력했다. Q/E·세이브 형식·docs/2_3·타 담당 파일 보존. CH1-03 자체 BLOCKED 없음.

정확한 자기10파일만 경로 지정 stage하며 신규 Godot 테스트는 `git add -f -- <정확 경로>`를 사용한다. 정상 pre-commit docs 훅·CHANGELOG 최상단 절을 적용하고 자기 브랜치만 push한다. main push/force/git add -A/배포0이다. 최종 branch/SHA·원격 ref 일치·수치·삭제 확인은 L/DONE.txt에 기록한다. 삭제 전에 보고서/신규 artifact 사본도 L에 남긴다.

후속 CH1-04 standalone World/렌더/실효 배치·충돌/종주 연결은 새 배정 대상이다. 이번 source READY를 si1 소비자 설치나1-2 플레이 가능으로 바꾸지 않는다. PC 실행/동기화 인수·시각/성능은 미확인이다.

## MAP PRODUCTION REPORT (§23)

```text
STAGE: si1 / CH1-03 source contract only
MASTER: 원본 geometry7구역·spine15·우회2·12 raw hand 입력 보존, 재설계0
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes — 데이터 읽기만, 새 제작/화면 미검수
LARGE: source asset byte 읽기만; composites/overlap/repetition 변경0
MEDIUM: connections/remaining holes — 원본 mask 보존, 새 시각 제작0
GROUND: shadow/contamination/integration — 이번 미구현/미검수
PLAYABLE: source START/EXIT·tile 계약 검사, 실제 이동/전투/렌더 소비자 없음
LANDMARK: raw5 LANDMARK/7 GAMEPLAY, 실효 위치·collider·높이 미관측
CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 미실행
TECH QA: 원 AST·geometry·mask/RLE/최종tile SHA·기본 계약/순서/타입·지정 회귀 실측
         자연 종주·pageerror/404/seam/loading/FPS 신규 측정 미실행
FILES: owned exporter·si1.json·stage1_contract·신규 tests/UID2·stage0 CLI음성목록·docs
       concurrent/unrelated 및 공용6·맵공유3 변경0줄
GIT: 자기 branch만 정상 commit/push; 원격 SHA 확인 뒤 WT 삭제, branch/log 유지
VISUAL VERDICT: FAIL — 시각 인수 증거 미실행. 화면 결함 실측 판정이 아니며 데이터 완료와 별도
NEXT PASS: 별도 CH1-04 배정에서 Godot standalone si1 소비자와 원본 게임플레이 보존 검수
```
