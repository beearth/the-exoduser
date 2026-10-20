# TI-01 — 인벤토리 크기·분류·격자·자리 검사 (2026-10-20)

작업ID `ti-01`, 브랜치 `codex/ti-01-20261020`. 인벤토리 추적 순서안 **§5.3 / 2번 단위**를 읽기 전용 모듈로 구현했다. 실제 State/ResourceAuthority와 TI-00 bridge에 명시적 actor/item fixture를 사용했으며 actual Main/UI/장착/pickup/저장 배선은 없다.

## 기준·의존·복구

| 항목 | 실제 근거 |
| --- | --- |
| 기존 worktree / HEAD | `/Users/fordeargamers/exoduser-wt/ti-01`, `7e9e3984d96d57b79274a08293a4fb539dd2ae39` / `codex/ti-01-20261020`. 기존 TI-00 끝에서 이미 분기되어 있었으며 새 worktree/다른 브랜치로 우회하지 않음 |
| 최신 main 읽기 기준 | R에서 fetch 후 `origin/main=284d7faf49295b2f5061937a47ce96038032ed3c`. 이 main의 `FDG_SOURCE_TRACE_INVENTORY_20261020.md` §5.3을 Git object로 읽음. 원문 사본 `origin-main-inventory-trace.md` |
| 선행 의존 | **TI-00 `7e9e3984`는 이 main의 조상이 아님**(`preflight.json`). 사용자 지시에 따라 TI-00 기반을 유지. TI-00 제품/테스트 무수정·main 병합/rebase 없음. 이 브랜치를 인수하려면 TI-00도 선행 인수 필요 |
| 원본 동일성 | latest-main `game.html` bytes와 의존 checkout의 파일 SHA-256 동일. `latest-main-game.html.sha256`·`source-ranges.txt`에 현재 원본 행 보존. 실행 제품은 TI-00 기반이며 전체 최신 main 실행이라고 주장하지 않음 |
| 재부팅 중단 상태 | index 부재·19:37 생성0byte index.lock, 초기 표시 staged D15020·untracked309. HEAD 생성 외 이전 커밋/신규 TI-01 작업물 없음. 원 상태 `initial-status.z`·Git metadata 백업 보존 |
| 복구 | 잠금에 열린 소유 프로세스 없음 확인 후 보존·이동, `read-tree HEAD`로 없는 index 재구성(작업 파일 변경0). 실제 미checkout D6827과 중단된0byte PNG1개 확인. `checkout-index --stdin`으로 누락 경로만 복구·기존 완전 파일 덮어쓰기0. NFC/NFD alias7건은 already exists로 덮어쓰기 거절(exit1), 그대로 보존. 0byte PNG는 원본9421byte의 strict prefix임을 확인·백업 후 HEAD bytes로 복구. 최종 기존 tracked diff 빈 상태 확인(`checkout-recovery.json`·`after-checkout-recovery-tracked.diff-status`) |
| R | `/Users/fordeargamers/Projects/exoduser-migration-20261001`; branch `codex/mac-live-play-time-main-20261017`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, tracked INDEX/WORK 빈 상태를 전후 대조. R 파일/스테이징 변경 없음 |

복구는 작업 시작 당시의 불완전 checkout을 완성한 것이며 제품 변경으로 커밋하지 않는다. `git reset`·브랜치 checkout·삭제 commit·전체 staging은 하지 않았다. 중단 흔적과 첫 진단 명령 중 대량 index diff 조회를 중단한 사실도 원로그/metadata로 구분한다.

## 산출 API·원본 근거

| 신규 `godot/scripts/native_inventory_layout.gd` API | 계약 / 최신 main 원본 행 |
| --- | --- |
| `source_item_size(item)` | Dictionary만 정상 item 접점. weapon+wtype→bow+btype→canonical slot→[1,1]. 17장비2×2·근접7종2×2·석궁3종2×2·bonePart1×1, unknown weapon/bow subtype은 slot2×2, future-slot+wtype=sword는1×1. null은 정상 fallback으로 수용하지 않고 null 반환. `game.html:15829–15834,16183–16187` |
| `source_item_category(item)` | ossuary/bonePart만 ossuary, 나머지 equipment. null/비Dictionary는 null. `:16188` |
| `source_inventory_rows(bag_max)` | `max(10,ceil(bag_max*4/10))`. BAG_MAX는 caller의 정수 입력이며 제품 기본300/전역 권위를 만들지 않음. 열10, rows300/24/26/30/301→120/10/11/12/121. `:16180–16181` |
| `build_grid(bag,skip,item,bag_max)` | 새 행/셀 배열에 원 bag index를 기록. 좌표 하나라도 null/누락이면 skip. item=null이면 모든 카테고리, Dictionary면 같은 카테고리만. **skip item도 grid에 채움**, 같은 셀은 뒤 index가 덮어씀. `:16189–16199` |
| `find_space(bag,w,h,skip,item,bag_max)` | y→x 좌상단 우선. -1 또는 skip index인 셀만 허용, 공간 없음 null. bag.length>=BAG_MAX의 보편 hard cap을 넣지 않음. `:16200–16210` |
| `can_place(bag,index,gx,gy,bag_max)` | 원 item 크기·음수/오른쪽/아래 경계·같은 분류 충돌/자기 index 예외 검사. 위치 쓰기/아이템 이동 없음. `:16247–16256` |

17slot 집합은 TI-00과 같은 기존 `equipment_affix_reader.SLOT_NAMES`를 읽는다. 같은 canonical 배열을 손으로 재정의한 권위나 별도 INV/G/P/cache를 만들지 않았다. 반환 크기 배열과 격자는 새 값이며 caller가 바꿔도 원 입력·다음 조회에 영향 없다.

**JS 기본 인자와 null:** 예정 API의 인자 순서를 유지하고 BAG_MAX를 필수 외부 입력으로 두기 위해 `ITEM_FROM_SKIP` sentinel을 명시 제공한다. `find_space(..., ITEM_FROM_SKIP, bag_max)`는 원본의 생략된 `item=INV.bag[skip]`에 대응하며 `item=null`은 전체 카테고리다. 두 경로를 같은 동작으로 합치지 않았다. `build_grid`도 같은 context 해석을 쓰며 skip 자체를 점유에서 삭제하지 않는다.

**native 입력 경계:** item은 Dictionary, 배치 크기/인덱스/목적 좌표/BAG_MAX는 정수 API다. 기존 bag 좌표는 숫자를 읽으며 양의 상단 초과 셀은 원본처럼 clipping한다. JS 음수/소수 x의 비indexed Array property는 indexed 점유에 넣지 않는다(Godot 음수 index wrap 금지). 음수/소수 row처럼 원 JS가 undefined row에서 throw하는 입력은 null, 문자열/비유한 좌표 등 unsupported native 입력도 null/false로 표시한다. 좌표 강제 정규화·수선·새 schema 저장은 없다. 모든 임의 JS coercion/예외 형태의 전면 동등성을 주장하지 않는다.

## 신규 검증·독립 원본 oracle

`test_native_inventory_layout.gd`는 첫 `_initialize`에서 **`EXODUSER-ti-01-Isolated-20261020`**를 확인하고 불일치 시 exit2·fixture 생성0이다. 테스트의 actor/item/좌표 주입은 명시적 fixture이며 제품 writer로 보고하지 않는다.

| 그룹 | 최종 단정 | 검사 내용 |
| --- | --- | --- |
| sizes_categories_rows | 47 | canonical17·근접7·석궁3·unknown subtype/slot·empty Dictionary/null·두 분류·외부 rows7건 |
| grid_skip_categories | 12 | 10열/최소행·원 index·skip 점유 유지·분류 독립·null 전체 격자·fresh 반환·명시 null/기본 item 차이 |
| space_and_bounds | 12 | 10×120의 (8,118) 허용, x9/y119/음수 거절·잘못된 index·너비/높이 초과·완전 점유/마지막 공간·bag301의 hard cap 없음 |
| source_order_edges | 10 | 동일 item 중복 index/마지막 기록·상단 clipping·negative/fractional x·원본 무효 row·native 타입 거절·falsy holes |
| read_only_actual_holder | 15 | actual State/ResourceAuthority+TI-00 bridge, 같은 INV/bag/equipped/ossCollect/item/opaque 중첩 참조·값·자원 유지. 정상/실패 조회 뒤 좌표/fav/junk/selected 쓰기0·fixture 해제 |
| 합계 | **96/0** | **5그룹, stderr ERROR0·WARNING0·leak0·리소스0·exit0** |

추가로 `verify-js-oracle.cjs`가 기준 main의 **실제 상수4개·함수6개**(`_invRows/_itemSz/_invCategoryKey/_invGrid/_invFindSpace/_invCanPlace`)를 그대로 추출해 Node VM에서 실행했다. 수식을 다시 쓴 모의 oracle이 아니다. 파일 IO/게임 시작/저장 코드는 실행하지 않는다. 독립 literal 단정과 별도로, native에서 관측·출력한 **92사례 중 92일치·불일치0**을 확인했다(`layout-02-oracle.json`, 원문 `source-oracle.js`). 이92건을 native assertion 수에 합산하거나 전 입력 동등성으로 확대하지 않는다.

**첫 실행 실패 보존:** `layout-01`은96/0·exit0이었지만 typed Array[String].has(null)에서 stderr ERROR2가 나와 통과로 세지 않았다. empty Dictionary의 slot=nil을 canonical typed 배열에서 조회하기 전 String/StringName 확인을 추가했다. 검사·기대값을 약화하지 않고 `layout-02` 96/0·ERROR0, 원본 oracle92/92를 확인했다. 첫 실행도 원로그·당시 코드 사본·oracle92/92 결과를 그대로 보존하며 최종 성공으로 소급하지 않는다.

## 실제 실행·회귀 결과

| 원로그 basename | 검사/실패 | exit | stderr ERROR | WARNING | Leaked instance | Resource rows | 실제 격리명 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `layout-01` | 96/0 | 0 | 2 | 0 | 0 | 0 | `EXODUSER-ti-01-Isolated-20261020` |
| `layout-02` | 96/0 | 0 | 0 | 0 | 0 | 0 | `EXODUSER-ti-01-Isolated-20261020` |
| `regression-contract` | 142/0 | 0 | 0 | 0 | 0 | 0 | `EXODUSER-ti-00-Isolated-20261020` |
| `import` | import | 0 | 0 | 0 | 0 | 0 | `EXODUSER-ti-01-Isolated-20261020` |
| `regression-contracts` | 5그룹/0실패 | 0 | 0 | 0 | 0 | 0 | `EXODUSER-ti-01-Isolated-20261020` |

회귀는 기존 파일을 그대로 실행한다. `regression-contract`는 TI-00 파일 상수의 `EXODUSER-ti-00-Isolated-20261020`를 사용한다. `test_contracts`에는 자체 격리 상수가 없어 이번 작업 격리명을 쓰며 전체 map/charge/projectile/pause_capture/damage 그룹을 실행하고 `--only`로 줄이지 않는다. 단정수와 그룹수는 다른 분모로 기록한다. 테스트 존재나 exit0만으로 통과를 주장하지 않고 RESULT·실패·stderr를 함께 확인한다.

실행 명령은 각 JSON `cmd`에 절대 Godot 경로·자기 WT 프로젝트·스크립트로 보존했다. 신규/기존 읽기 계약은 이미지/오디오/Main 부팅 없이 먼저 실행했다. contracts 회귀는 import를 선행한다. import는 App Support/Godot 사전 복사와 SHA-256 대조 후 자기 WT에만 수행한다.

## 부하·보호·제출

- 실행 전 매번 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`, 2이상이면30초씩 대기 후0/1일 때만 실행. guards 시각·개수를 각 실행 JSON에 기록했다. Godot는 원앱4.7.2를 사용하며 버전/빌드 문자열은 stdout에 보존한다. 타 작업 프로세스 종료/재시작0.
- 각 실행 직전에 자기 `godot/override.cfg`를 격리명으로 만들고 종료 finally에서0byte로 비운다. 실제 사용자 save 폴더/열린 게임 창 접근·입력0. 제품 save 형식/직렬화/복원·Q/E·2_3 변경0.
- 공용6파일·TI-00·P2-006a(드랍/pickup)·기존 테스트·웹 원본·기존 계획/추적/작업판 변경0. 기존 파일 해시는 `protected-before.json`과 최종 보존 증거로 대조한다. 새 layout은 actual bag writer에 배선하지 않았다.
- docs 키워드 검색은 `docs-keyword-search.txt`에 보존. 관련 새 구현/수치/API/실행 한계는 본 보고서와 CHANGELOG 맨 위 절에 동기화한다. 이전 CHANGELOG는 아래 bytes 그대로 보존한다.
- 자기 신규 모듈/테스트/보고서/CHANGELOG만 경로 지정 staging, 정상 pre-commit hook을 사용한다. `.gitignore test_*`에 해당하는 자기 신규 테스트만 명시 경로로 force-add하며 훅을 우회하지 않는다. main push·force push·git add -A·reset0.
- 원로그·실행 source SHA-256·JS oracle·실패/복구 증거·최종 branch/SHA/수치는 `~/exoduser-wt/_out/ti-01/`와 `DONE.txt`에 보존한다. import가 만든 로컬 sidecar/cache·빈 override.cfg는 커밋 제외.

**인수 범위:** 원본 수치를 따른 읽기 전용 크기/분류/공간 조회와 격리 actual holder 소비다. UI·정렬/필터·장착·pickup·저장·actual Main 배선·실창/PC/전체 인벤토리 완성은 이번 단위 밖이며 완료로 보고하지 않는다.
