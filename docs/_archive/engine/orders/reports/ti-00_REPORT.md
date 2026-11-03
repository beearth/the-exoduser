# TI-00 — actual INV 읽기 계약 구현·격리 검수

| 항목 | 결과 |
|---|---|
| 작업/브랜치 | `ti-00` / `codex/ti-00-20261020` |
| 기준 | fetch 후 `origin/main=f84e26ee0bbc929fb595b4c0af292b423588f325`에서 새 worktree `/Users/fordeargamers/exoduser-wt/ti-00` 생성 |
| 지시서 | 이 스레드의 추적 보강 `baecb4b7cdec297073bd037a284d331d31762a83`의 TI-00을 Git object로 읽기 참조. 기존 추적 문서/main 병합·수정 없음 |
| 신규 결과 | **10그룹·142단정·실패0·exit0·stderr0**. actual State/ResourceAuthority + 명시적 actor fixture, actual Main=false |
| 산출물 | 신규 모듈1·신규 테스트1·이 보고서·허용된 CHANGELOG 절 |
| 보호 | 여섯 공용 파일/기존 테스트/P2-006a 제품 파일/웹 원본/설계 문서 수정0. Q/E·2_3·세이브 형식 보호 |
| 원로그 | `/Users/fordeargamers/exoduser-wt/_out/ti-00/` |
| 제출 SHA | 이 문서와 같은 최종 커밋 및 원격 대조는 OUT의 `DONE.txt`·`remote-verify.json`에 기록. 자기 브랜치만 push |

## 1. 구현과 원본 근거

| 파일/API | 계약 |
|---|---|
| `godot/scripts/native_inventory_contract.gd` | 신규51행. RefCounted/WeakRef bridge. INV 권위 생성·Node 추가·owner 초기화 없음 |
| `bind_source_state(owner: Node) -> bool` | 이전 binding 제거→live/삭제예약/정확한 State script/getter 검사→WeakRef만 보관. foreign/null/queued false. 초기화 전 exact State는 구조적으로 bind=true/read=null 가능 |
| `read_current_inventory() -> Variant` | 매번 기존 getter를 호출하여 **현재 INV Dictionary 자체** 반환. owner 소실/원 getter null/구조 부족은 null. 이전 성공 cache·snapshot·새 빈 INV 대체 없음 |
| `source_slot_names() -> Array` | 기존 equipment_affix_reader.SLOT_NAMES 사본. caller 배열 변경이 canonical에 영향0 |
| `godot/tests/test_native_inventory_contract.gd` | 신규351행. 실제 holder/자원 authority와 테스트 Player/World를 구분, Main/저장/실플레이 인수로 쓰지 않음 |

native admission은 bag:Array, equipped:Dictionary, selected 키, ossCollect:Dictionary와 canonical17 equipped 키만 검사한다. 추가 top-level/slot/item/중첩 필드·selected 값은 보존한다. 원본 JS validator가 아닌 native 접점 조건이다. owner 컨테이너를 freeze하지 않는다. BAG_MAX/크기/분류/격자/필터/선택/장착/캐시/자원/입력/저장 writer는 없다.

| 최신 main 원본/기존 Godot 근거 | 재사용·검사 값 |
|---|---|
| `game.html:15176` | 슬롯17 순서: weapon, shield, boots, armor, helmet, bow, gloves, pants, belt, necklace, ring1, ring2, cape, bracelet, headband, ossuary, headband2 |
| `game.html:16174–16179,63948` | fresh INV의4key·bag0·17slot null·selected=null·ossCollect={} |
| `godot/port_modules/equipment_affix_reader/producer.gd:25–28` | canonical SLOT_NAMES 재사용 |
| `godot/port_modules/native_new_run_bootstrap_source/producer.gd:59–62` | fresh key 집합. live 삽입 순서를 canonical 순서로 쓰지 않음 |
| `godot/scripts/native_source_new_run_state.gd:115–159,184–185,922–979` | 실제 getter와 유효한 pre-Tree seam. fixture constructor1회, 제품에서 재호출0 |
| `godot/scripts/native_source_resource_authority.gd:58–81,448–475` | 실제 자원 authority·기존 source_boot_parameters 사용 |
| State `:91–113` / Player `:68–69` | fixture hp/mhp/r/iframes는 source_boot_p, state/facing은 실제 초기값. ST/MST는 기존 authority가 설치 |

## 2. 신규 검수

최신 사용자 지시의 정확한 격리 이름 **`EXODUSER-ti-00-Isolated-20261020`**을 사용했다. 문서의 이전 예시 이름보다 우선하며 테스트 첫 동작에서 OS userdir basename을 검사하고 다르면 exit2 한다.

| 그룹 | 단정 | 실제 검수 |
|---|---:|---|
| TI00-T01 | 4 | 독립17slot literal·중복0·반환 사본 |
| TI00-T02 | 25 | fresh4key/빈 bag/17null·actual holder key 집합 |
| TI00-T03 | 10 | pre-Tree actual getter·동일 INV/하위 참조·freeze 없음 |
| TI00-T04 | 10 | nonempty/추가 필드·중첩 참조·값 보존 |
| TI00-T05 | 8 | 현재 item/bag/INV 교체 즉시 반영·cache 없음 |
| TI00-T06 | 9 | foreign/null/unbound/uninitialized·실패 bind 후 이전 연결 제거 |
| TI00-T07 | 12 | 재bind·queued/free·authority 소실 후 null |
| TI00-T08 | 38 | 필수 키/타입/17slot 부족 거절·자동 수선0 |
| TI00-T09 | 17 | 정상/실패 read 전후 자원/metadata/claim/holder 불변 |
| TI00-T10 | 9 | 자기 fixture 정리·WeakRef 수명·정확 userdir |
| 합계 | **142** | **10그룹·실패0** |

최종 로그는 `ti00-02.*`이다. 수정 전143/0이었던 `ti00-01.*`도 보존했다. 최종에서 삽입 순서 구현 세부를 고정하던 불필요한 단정1개만 제거했다. 제품의 RNG/time/save/input 호출 추가0은 정적 호출 검토와 실제 관측을 구분해서 확인했다.

## 3. 실행 환경과 격리

원앱 Godot는 `4.7.2.stable.official.ed1daf0bf`이다.

- 신규 검수는 OUT의 최소 `contract-project/project.godot`와 자기 WT scripts/port_modules/tests/data symlink로 실행했다. Main·Player/World scene·이미지/오디오 preload·override 설정·editor import 없이 처음부터 통과했다.
- 회귀는 canonical project.godot를 유지하고 custom userdir 이름만 바꾼 OUT의 `regression-project/`에서 자기 WT 리소스를 읽었다. cache는 OUT 프로젝트에 생성했다. import1회·exit0·stderr0.
- Main 부팅12종에만 OUT override.cfg를 각 기존 테스트 상수로 설정하고 child 종료 직후 비웠다. nonMain3종은 project 설정만 사용했다. **WT godot/override.cfg는 생성0**.
- 기존 게임 창·실제 `EXODUSER-Godot-Native-First` 폴더에 접근/입력하지 않았다. 실제 source는 자기 WT이고 OUT projection을 사용한 검증이며 WT 런처 직접 기동·실창·패키지 검수와 구분한다.

OUT `run-tests.py`와 `*.command.json/process.json/stdout.log/stderr.log/engine.log`에 실제 명령·PID·exit·원로그가 있다. 재현 명령은 아래와 같다.

~~~sh
python3 ~/exoduser-wt/_out/ti-00/run-tests.py contract
python3 ~/exoduser-wt/_out/ti-00/run-tests.py import
python3 ~/exoduser-wt/_out/ti-00/run-tests.py regression
~~~

하위 실제 명령은 원앱 절대경로와 `--headless --path <OUT 실행 프로젝트> --log-file <개별 로그> --script res://tests/<테스트 파일>`이다.

## 4. 지정 회귀15종

exit만으로 PASS 처리하지 않고 RESULT·수행 단정/검사군·GROUPS·skipped 여부를 확인했다. 단정수와 검사군수는 별도로 적는다.

| test (godot/tests/) | 수행 수치 | 실패 | exit | 격리 이름 | stderr ERROR |
|---|---:|---:|---:|---|---:|
| `test_contracts.gd` | 5 cases | 0 | 0 | `EXODUSER-ti-00-Contracts-Isolated-20261020` | 0 |
| `test_p2002a_hud.gd` | 36 assertions | 0 | 0 | `EXODUSER-P2002A-Isolated-20261020` | 0 |
| `test_p2002b_minimap_corner.gd` | 16 assertions | 0 | 0 | `EXODUSER-P2002B-Isolated-20261020` | 0 |
| `test_p2001h_curtain_spawn.gd` | 124 assertions | 0 | 0 | `EXODUSER-P2001H-Isolated-20261020` | 0 |
| `test_p2001i_boot_intro.gd` | 18 assertions | 0 | 0 | `EXODUSER-P2001I-Isolated-20261020` | 1 |
| `test_p2001j_lesson_clock.gd` | 21 assertions | 0 | 0 | `EXODUSER-P2001J-Isolated-20261020` | 0 |
| `test_p2001k_lesson_practice.gd` | 32 assertions | 0 | 0 | `EXODUSER-P2001K-Isolated-20261020` | 0 |
| `test_p2001l_lesson_steps.gd` | 66 assertions | 0 | 0 | `EXODUSER-P2001L-Isolated-20261020` | 0 |
| `test_p3002_spawn_holes.gd` | 298 assertions | 0 | 0 | `EXODUSER-P3002-Isolated-20261020` | 0 |
| `test_p3003_regions.gd` | 43 assertions | 0 | 0 | `EXODUSER-P3003-Isolated-20261020` | 0 |
| `test_native_main_source_starter_state.gd` | 148 assertions | 0 | 0 | `EXODUSER-MainSourceStarter-Isolated-20261014` | 0 |
| `test_encounter_factory.gd` | 3 cases | 0 | 0 | `EXODUSER-ti-00-EncounterFactory-Isolated-20261020` | 0 |
| `test_p1002f_dedicated_hurte.gd` | 317 assertions | 0 | 0 | `EXODUSER-P1002F-Isolated-20261020` | 0 |
| `test_p1002g_kislash_hurte.gd` | 168 assertions | 1 | 1 | `EXODUSER-P1002G-Isolated-20261020` | 0 |
| `test_native_qe_binding.gd` | 155 assertions | 0 | 0 | `EXODUSER-ti-00-QEBinding-Isolated-20261020` | 0 |

**집계:** 15종 전부 실행, 단정 실패0인14종·선재 실패1종, SKIP0. contracts와 encounter_factory는 각각5/3검사군이며 단정수로 합산하지 않았다. stderr ERROR0을 전체에 주장하지 않는다.

`p1002g`는 사용자 지시로 선재 결함(P2-008a etype20 source_field_call_unavailable)으로 지정된1건이다. 이번 직접 출력 원문은 아래와 같고 RESULT는168단정/1실패·halt_count=3·exit1이다. 기존 테스트가 하위 halt reason을 직접 출력하지 않아 이번 작업에서 원인 진단을 추가 확정하지 않았다. 해당 제품/테스트를 고치지 않았다.

~~~text
P1002G_FAIL per_enemy_coverage no native_hurte_halt emitted across combat
~~~

원로그: `reg-test_p1002g_kislash_hurte.stdout.log/stderr.log/engine.log` 및 process.json. 실패를 PASS로 바꾸지 않았다.

`p2001i`는18단정/0실패·exit0이지만 종료 stderr에 다음 원문이 있다. 원인·선재 여부는 추가 확정하지 않았으며 별도 종료 오류로 보존한다.

~~~text
WARNING: 2 ObjectDB instances were leaked at exit (run with --verbose for details).
ERROR: 1 resources still in use at exit (run with --verbose for details).
~~~

여러 Main 회귀의 Camera2D physics interpolation 경고도 원로그 그대로 보존했다. 신규 TI-00 자체는 stderr0이다. 세부 검증값과 그룹 비교 결과는 `regression-results.json`·`regression-verification.json`에 있다.

## 5. 보존·문서 동기화·제출

- 웹 원본과 여섯 공용 파일을 포함한11개 기존 파일을 전후 SHA-256으로 대조했다. 실제 결과는 `source-hashes-before.json`과 `final-preservation.json`에 기록한다. R의 branch/HEAD/INDEX/WORK도 별도 대조한다.
- 사용자 전역 Godot의 기존 `editor_settings-4.7.tres`·`projects.cfg`를 OUT에 먼저 사본 보존하고 전후 해시가 동일함을 확인했다. 실제 세이브 폴더 내용을 읽어 검사하지 않았다.
- OUT cache와 별개로 symlink import가 자기 WT에 .import/.uid sidecar를 생성했다. 목록은 `generated-untracked-import-paths.json`에 보존했으며 제품 변경/스테이징에 포함하지 않는다. 이를 타인 WIP로 정리하거나 전체 add하지 않았다.
- AGENTS 규칙에 따라 docs 전체 키워드 검색을 수행했고120개 매칭행을 `docs-keyword-search.log`에 보존했다. 기존 웹 수치/구조는 불변이며 신규 Godot 읽기 접점과 검수는 이 보고서 및 허용된 CHANGELOG 절에 기록했다. 보호 설계·기존 계획·작업판·추적 문서는 수정하지 않았다.
- 경로 지정 staging과 정상 pre-commit hook으로 제출한다. hook 우회·비활성화·main push/병합·force push/reset은 하지 않는다. 최종 commit/remote SHA 대조·수치는 OUT `DONE.txt`에 기록한다.

**인수 범위:** 읽기 bridge의 격리 holder 계약 검수이다. 실제 Main의 새 bridge 연결·인벤 UI/장착/획득/분해·저장·실창 플레이·시각/성능·패키지는 이번 완료 범위가 아니다. 지정 회귀의 기존1실패 및 종료 ERROR를 보존한 검수 대기 산출물이다.
