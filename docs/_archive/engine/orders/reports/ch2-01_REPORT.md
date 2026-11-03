# CH2-01 — si4 원본 snapshot·읽기 전용 계약

2026-10-20 KST · 작업ID `ch2-01` · **source snapshot·순수 계약 구현 및 관련 회귀 완료 / 총괄 검수 대기.** 제품 Main/World, 전환, 실효 오브젝트·충돌, 적·보스, Godot 표현은 연결하지 않았다. 2-1 플레이 가능·시각 완료를 뜻하지 않는다.

## 기준·의존·작은 worktree

| 항목 | 실제 확인 |
| --- | --- |
| 최신 main | 명시 fetch한 `origin/main=e556b617190c325ca39f5add04357f5dea5ca87e`. 종료 전 원격 main도 같은 SHA |
| 분기·의존 | 필수 추출기가 있는 CH1-03 `aada9b28b066cfb1c23487c6c0a8036e18fba3f7`가 main에 없어 그 끝에서 `codex/ch2-01-20261020` 분기. CH1-01 `677b86fa`·CH1-02 `d0f7eaf4` 포함 의존 |
| 지시서 | `codex/trace-maps-ch2-20261020`의 `18070adf:docs/engine/FDG_SOURCE_TRACE_MAPS_CH2_20261020.md` §4.1. 최신 사용자 지시가 공유 맵 파이프라인의 대상 한정 변경·재추출·맵/지역/소환굴 회귀를 허용 |
| CH1-04 | 시작 fetch에는 ref가 없었으나 작업 중 `5487245c3d857927cf8c0634d0ea5edb05650340`이 게시되어 fetch·보고서와 소비자 파이프라인을 읽음. CH1-03 대비 기존 exporter·stage0/1 contract·si0/si1 snapshot 변경0. CH1-04는 si1 독립 소비자이며 source-only CH2-01의 필수 코드 의존은 CH1-03까지다. CH1-04의 자체 검수 수치를 이번 실행으로 세지 않음 |
| 원본 | 위 main과 WT `game.html` byte 동일, SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 원본 함수·상수·분기 문자열 수정0 |
| sparse | 지정 `worktree add --no-checkout -b ... <CH1-03 SHA>` 후 no-cone sparse/read-tree. Godot·engine/test/tools·원본 JS/JSON·필수 문서와 회귀용 CH1 원화92개/CH2 원화29개만 선택. 웹 assets 전체 checkout0. 약742MiB |
| R | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, branch `codex/mac-live-play-time-main-20261017`. 시작 tracked INDEX/WORK 차이0. R 소스·INDEX·branch·기존 앱/서버 조작0; fetch ref/worktree 관리 메타데이터만 사용 |

## 구현·공유 파이프라인 변경 범위

| 파일 | 실제 변경 |
| --- | --- |
| `godot/tools/export_ch1_area_source.mjs` | 기존 `buildAreaSnapshot`/CLI에 stage4만 추가(37행 추가/17행 삭제). 같은 exact AST→원 selector→원 genFromTemplate→정확 START 발췌→원 regionInit 경로. stage0/1은 기존 동작 유지, stage0 wrapper는0 전용 유지 |
| `godot/data/ch2_map_source/si4.json` | 신규121465byte. `exoduser.ch2-area-source.v1`, 원본·함수 행/SHA, 40000타일·rooms·START/게이트/출구, raw배치105·카탈로그47/77, path22/초기RLE798, 굴11/분모900/지역, 원화47참조·중복제외29파일 byte/hash |
| `godot/port_modules/ch2_map_source/stage4_contract.gd` | 신규 RefCounted의 순수 `read_area(raw)`/`validate_area(raw)`. 기존 CH1-03의 수치/타입/hex/digest helper 재사용. 원본 raw 필드·순서·타일 해시·출처 pin·경로·RLE·자산 참조·timer seed·지역 합계를 검사 |
| `test/fdgCh2Stage4Source.test.mjs` | 신규11건. 독립 원문 AST/IIFE·path helper 실행, 전체 grid SHA/카운트, raw105/47/77, asset bytes, 생성기/행/SHA, 원래 CH1-03 도구와 stage0/1 전체 깊은 일치, CLI 실패 전 쓰기 방지 |
| `godot/tests/test_ch2_01_stage4_source.gd` | 신규362단정. 실제 JSON·순수 API·동일 참조·반복·입력 불변, 전체 배치105/등록47/자산47/출처59 각각의 오염 거절, 잘못된 타입·stage·타일/순서·RLE·분모·runtime 주장 거절 |
| UID2 / 문서 | 위 신규 contract/test의 Godot 생성 UID2만 포함. 이 보고서와 CHANGELOG_SYNC 최상단 절. 총9경로 |

공유 파일의 변경은 위 추출기 하나에 한정했다. stage4일 때 `_CH2S4`, compose4, `_CH_DECO[1]`, CH2 schema/path/asset 참조만 선택한다. CH1 layout·baked manifest·외부 환경 JS를 si4의 환경 완료 근거로 붙이지 않는다. CH2 이미지 파일은 읽어 길이·SHA만 기록하며 Image·오브젝트 초기화를 실행하지 않는다.

원래 CH1-03 도구의 Git blob을 독립 임시 모듈로 읽어 **stage0와 stage1을 전부 재추출하고 확장본 결과와 깊은 비교0차이**를 확인했다. 제품 `map.json`, 기존 si0/si1 JSON, adapter/export_world, P3-002/003와 공용6파일은0줄이다. PNG 교체·재인코딩·생성0이므로 CH1-02의 제품 필드 승격/원화 복사는 수행할 필요가 없었다.

## 원본 값·API 경계

| 항목 | 최신 main 근거 | 관측 값 / 계약 |
| --- | --- | --- |
| 선택 | game30042~30085/30135~30147 | FIXED_MAPS[0] clone + compose4 path. legacy FIXED_MAPS[4] 직접 사용 아님 |
| grid/타일 | game30218~30694 | 200×200/T40,0/1/2/3/4=`10722/28395/3/0/880`; byte SHA `4e965948e59fed49b7de6c2936ca24aa774e858532a7e22780d72519050eb3c8` |
| START/게이트/출구 | maps_data6~55, game31564~31566/30335~30442 | rooms6, START tile100/185→world4020/7420, gate metadata x99..101/y31, exits y33, exit center100/33. gate metadata가 있어도 code3 타일0, 강제 칠하기0 |
| 저작 입력 | game17991~18117/18197~18201 | hand105: backfill9/boundary50/landmark18/detail6/mask4/filler12/seam6. zone13은 전투4분면과 별개. 원래 absent rot78·overlap9·raw 키/순서 보존 |
| path | game18198/29997~30007 |22점, w30/authoredWidth1, 동측 dead-end의 중복점 그대로. 초기 editor RLE798숫자/399쌍/coverage40000. 원 generator 후 최종 타일과 분리 |
| raw 카탈로그 | game17638~17698/18392~18426 | CH2 등록47/초기 meta77. raw 충돌 선언51·mega참조17이며 실효 collider 총수 아님 |
| 자산 참조 | CH2 raw file/dir |47참조/29원화, `source.files`는 game/maps_data와 원화29개=31. 모든 원화와 기존 Godot 대응 파일의 byte SHA 일치. 로딩·시각 인수 증거 아님 |
| 굴/분모/지역 | game30486~30626/31029~31030/60697~60718 |11개/900/북서250·북동200·남서300·남동150. CH1 stage0의8/15 할인이나168 분모 재사용0 |
| timer | 원 generator + seed20261020 | LCG11회/final998000637. 선언 seed를 순수 산술로 재검산하며 실제 RNG·clock을 진전시키지 않음. 자연 부트 timer 실측 아님 |
| provenance | 원 AST 발췌 | `source.main_sha=e556b617…`, `source.extraction_head=aada9b28…` 구분. 순수 계약은 선언 pin/형식을 검증하고 실제 원본/자산 bytes는 Node가 대조. 계약 자체 파일 IO0 |

READY는 `value=원 snapshot 동일 참조`, `scope=source_snapshot_only`, `runtime_bound=false`, `full_stage_ready=false`, `visual_verified=false`다. NOT_READY는 `reason`과 원 `raw` 참조를 반환하고 최상위 `value`가 없다. 입력을 수리하거나 일부 값만 성공으로 반환하지 않는다. 최종_MAP_OBJS·effective_prop_positions·prop_colliders는 `NOT_OBSERVED`다.

CLI는 `node godot/tools/export_ch1_area_source.mjs <sourceRoot> <output> --stage 4 --seed 20261020`이다. 기본 R은 없다. root 안에서는 `godot/data/ch2_map_source/si4.json`만 허용하고, 밖에서는 명시 JSON 경로에 출력한다. 기존 파일은 같은 CH2 schema·stage4 snapshot만 재출력할 수 있다. stage2/3/5~9·이상 seed·제품 map/다른 stage 경로·symlink·타 schema/다른 stage의 기존 JSON은 쓰기 전에 거절한다. 기존 stage0/1 출력 계약은 보존했다.

## 실행·회귀·원로그

원로그 L=`~/exoduser-wt/_out/ch2-01/`. 기존 원본 Godot4.7.2를 사용했다. 매 실행 전 지정 pgrep/wc를 기록했고 모두 count1에서 시작했다. 2이상이면30초 대기하는 launcher를 사용했으며 타인 Godot 종료0, 자기 엔진 순차 실행이다. 매 실행 override 작성 후 finally0byte; 제품 project.godot 변경0이다.

신규는 `EXODUSER-ch2-01-Isolated-20261020`, CH1-01/02/03과 P3002/3003는 각 테스트 상수의 격리명을 그대로 사용했다. 신규 Godot는 실제 OS userdir도 검사한다. 독립 pure-project가 자기 module/data/test를 참조하고 Main/World/노드 생성0·사용자 save IO0이다. import cache는 자기 이전 IT-05 cache를 APFS clone한 새 OUT cache이며 원 cache 쓰기0이다.

| 원로그 prefix | 실제 결과 | 비고 |
| --- | --- | --- |
| extract | exit0 | 새 si4 JSON. 기존 map/PNG 쓰기0 |
| new-node-final |11통과/0실패/0SKIP, exit0·stderr0 | 최초 new-node도11/0. 최종 standalone exit receipt를 따로 보존; 수치 중복 합산0 |
| new-godot |362단정/0실패, exit0·stderr0·ERROR0 | Main0/World0/runtime_bound=false |
| ch1-source-node |18통과/0실패/0SKIP, exit0·stderr0 | CH1-01/03 각각9건 모두 실행 |
| ch1-assets-node |6통과/0실패/0SKIP, exit0·stderr0 | 기존 exporter 파이프라인 재추출,92PNG·대상 필드/geometry 보존 검사 |
| pit-node |6통과/0실패, exit0·stderr0 | 기존 pit source·hand collider delta 검사 |
| map-node |37건 중28통과/9실패, exit1 | 기존 CH1-03 baseline의 실패9개 이름/순서 동일, 새 실패0. 실패를 제외하거나 기대값을 낮추지 않음 |
| import | exit0·stderr0·ERROR0 | 신규 UID2 생성. 소유 밖 자동 생성 sidecar111개는 OUT/generated-sidecars로 보존 이동하여 제출 제외 |
| ch1-01 / ch1-03 |63/0 /75/0, 각각 exit0·stderr0·ERROR0 | 기존 순수 snapshot 계약 |
| ch1-02 |189단정/0실패, exit0·stderr0·ERROR0 | 실제 stage0 World 정적 환경, Main0·simulation0 |
| contracts |5그룹/실패단정0, exit0·stderr0·ERROR0 | 전체 계약 |
| p3002 |6그룹298단정/0실패/0SKIP, exit0·ERROR0 | 실제 렌더러 GUI에서 실행, 기존 Camera2D/ObjectDB 경고 유지 |
| p3003 |43단정/0실패, exit0·ERROR0 | core/display/actual, 기존 Camera2D 경고 유지 |

Node 맵9실패는 culling fixture1·adapter pending2·Image 없는 지역 VM6이다. L/map-failure-comparison.json에 기존/현재 실패 이름을 모두 남겼다. P3002의 `actors_registered=10/unported_spawns=158`, 지역 `full_fieldboss_combat=false`와 CH1-02 source-image 등록4개 NOT_READY도 여전하다. 이번 source 구현으로 해결했다고 보고하지 않는다. 기존 P3002 ObjectDB8 누수 및 Camera2D 경고는 원 stderr에 보존했다.

신규 suite의 실제 실패는 없었다. 구현 중에는 원본 hole shape가7필드임을 읽고 검증기를 그에 맞춘 뒤 첫 엔진 실행을 했다. 과거 다른 CH1 작업의 테스트 실패를 이번 실행 이력으로 합산하지 않았다. 사용자 전달 원문 **“로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)”**는 이번 재실행/수정 없이 기록만 한다.

## 보존·제출·후속

선택된 기존 tracked2359파일의 SHA가 모두 같다(L/protected-baseline.json·preservation.json). 공용 main/hud/world/player/native_normal_enemy_hurte/native_source_new_run_state, P3 소환굴·지역, CH1 producer/data, map.json, 원본 HTML/JS/PNG 변경0이다. 신규9경로만 stage하며 `.gitignore`의 test_* 패턴 때문에 신규 Godot 테스트/UID만 정확 경로로 force-add한다. 정상 pre-commit과 허용 CHANGELOG 절을 사용한다. hook 우회·git add -A·main push·force0이다.

자기 branch push·원격 SHA 대조 후 L/DONE.txt를 쓰고 자기 sparse worktree를 제거한다. branch·원로그·최종 artifact/보고서 사본은 남기며, 자기 임시 cache는 검수가 끝난 뒤 정리한다. 실제 SHA/삭제/R 상태는 submission-receipt.json·cleanup-receipt.json에 기록한다. CH2-02는 새 배정 대상으로 남겨 두고 착수하지 않는다.

## MAP PRODUCTION REPORT — §23

```text
STAGE: CH2-01 / si4 source snapshot and pure contract only
MASTER: 원본 path22·raw105·굴11/900·4분면 보존. 재디자인0
OUTER MASS: 원본 mega17·시각 벽/tile 충돌 분리, 새 제작·화면 미검수
LARGE: raw catalog47/원화29 byte 참조만, 생성·가공·제품 승격0
MEDIUM: backfill/filler/seam·rot/overlap/zone 원문 입력 보존, 실효 접합 미검수
GROUND: 초기 path RLE와 최종 tile 구분, 새 Godot 바닥/광원 제작0
PLAYABLE: source 데이터 계약만. 실제 이동/전투/지역/문/arena/전환 소비자 없음
LANDMARK: raw landmark18/mask4, 실효 위치·콜리더 NOT_OBSERVED
CAMERA QA: 신규 START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 미실행
TECH QA: 신규 Node11/0·Godot362/0, CH1/계약/맵/지역/소환굴 회귀 원로그 기록
         기존 맵 Node9실패/누수·Camera2D 경고 보존, 성능·PC 신규 인수 없음
FILES: 공유 source exporter의 stage4 분기 + 신규 snapshot/계약/검사/UID2/docs
       제품 map/원본/공용6/타 담당0줄
GIT: 자기 branch만 정상 commit/push, 원격 일치/DONE 후 자기 WT 제거
VISUAL VERDICT: FAIL — 신규 시각 인수 증거 미실행. 관측된 화면 결함 판정은 아님
NEXT PASS: 별도 CH2-02 배정에서 CH1-04 독립 소비자 파이프라인을 인수해 si4 적용
```
