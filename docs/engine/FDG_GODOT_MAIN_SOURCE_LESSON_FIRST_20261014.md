# Actual Main source lesson consumer FIRST — 2026-10-14

실제 `res://scenes/main.tscn`이 원 `parry_lesson_source` holder를 생성·강하게 보유하고 원 file-init publisher를 호출하는 새 연결의 첫 검수에서 **신규3그룹30개 검사**가 모두 통과했다. production FINAL overlay 및 primary START 후 고립 headless에서1회 실행했다. 원 독립 producer 성공137개 검사와 다른 기존 성공군은 읽기·복사·재실행하지 않았다. 이 결과는 원 전체 lesson controller·자동진행·자동회복의 완료 증거가 아니다.

| 제품 / 소유 | 실제 범위 |
|---|---|
| production | `native_consumer_tests` worker가 actual Main의 source_lesson const/field/file-init 강참조·snapshot·live Callable wrapper를 작성. 본 검수 worker는 Main/helper/Player/World/dispatcher/UID/Git 변경0 |
| 검수 | 신규 `godot/tests/test_native_main_source_lesson.gd` 및 본 문서, 외부 `dependency-main-source-lesson-first/tests/` 원 proof·receipt |
| 실제 holder | 원 `godot/port_modules/parry_lesson_source/producer.gd` RefCounted, Main 보유. 원 수치·controller 로직 재구현0 |
| source file-init | 원 실제 publisher 호출→active=false, chapter 필드 없음. guard는 정확 `{parry_lesson_active:false}`이고 임의chapter0/2 제조0 |
| live service | actual Main `get_native_source_lesson_callable()`는 `Callable(self,'_read_native_source_lesson_guard')` Node wrapper. 호출마다 실제 holder의 기존 `get_dispatcher_lesson_callable()`를 읽으며 epoch 고정0 |
| cold / current | Tree/file-init 전 actual Main wrapper는 null. 같은 이미 받은 wrapper는 실제 file-init 이후 현재 guard를 읽는다. 원 static SOURCE_BOOT packet을 current로 위장하지 않음 |
| 공개 snapshot | `get_native_source_lesson_snapshot()`는 status/guard_ready/holder_retained_by_actual_Main/native_main_instance_id, file_init_attempted/file_init_publish_calls/file_init_error/source_boot_input/publish_result/holder/guard_detail를 제공. raw_current_reference_is_not_guard_authority=true, lesson_controller_bound/automatic_source_regeneration_bound/full_main_ready/public_play_proven=false. 원 holder main_binding_proven=false는 원 공급자의 독립 범위로 보존 |
| fixture replacements | 실제 holder의 public `publish_current`로 chapter2/chapter3 Dictionary를 명시 `own_constructor_fixture` origin에 발행. 이는 현재 객체 교체를 관측하는 test fixture이며 실제 Main controller 자동진행/튜토리얼 chapter진행 구현 주장0 |
| revoked current | public revoke 후 기존 live callback과 새 wrapper는 null/NOT_READY. false fallback으로 회복을 허용하지 않음 |
| lifecycle | actual Main.free 후 Node wrapper invalid, invalid Callable 호출0. test가 Root holder를 강하게 보유하면 그 authority는 별도로 남을 수 있으므로 Main loss→Root자동revoke 가정0 |
| 미완 | lesson 전체 UI/input/update/render·Player/spawn/save/restore·stage 전환·새 run reset·자동dispatcher lesson 연결·자동회복·fullMain·publicpixel/240FPS |

| 신규 고유 group | actual consumer oracle | 실행 상태 |
|---|---|---|
| `file_init_actual_main` | actual Main cold→file-init/current holder inactive/chapter absent / same already-received current callback / snapshot 준비와 fullcontroller 분리 | FIRST CLEAN PASS13 |
| `live_callable_replacement_and_revoke` | actual holder에 명시 fixture2→fixture3 replacement / 기존 Main callback 최신값 / revoke null / epoch changes | FIRST CLEAN PASS10 |
| `main_loss_physical_gate` | actual Main free→weakMain null / actual Node callback invalid / test-retained RefCounted authority·guard의 별도 수명 | FIRST CLEAN PASS7 |

| 실행·증거 보호 | 현재 계약 |
|---|---|
| stage | primary만 생산 overlay. `dependency-main-source-lesson-first/stage/godot`, basea465 code/cachemetadata·원 assets/data/imported readonly symlinks·oldtests copied0 |
| userdata | `EXODUSER-MainSourceLesson-Isolated-20261014` exact guard. 기존 userQA/latest-session/save/화면 접근0 |
| metadata/runtime | 신규 runtime1회. UID 생성은 primary-only; worker 생성0. Godot absolute4.7.2/headless, editor/import/GUI/server 실행0 |
| caller cleanup | 각 group 전후 caller가 자신이 만든 Main 제거/free. await 그룹 실패에도 남은 Main을 caller가 정리, 동일Tree 동시Main0 |
| 첫 검사 | 신규3그룹만1회. 모든stdout/stderr/exit/elapsed/ERROR/Parse/SCRIPT 및 group별 assertions 보존. exit0만으로 cleanPASS 판정0 |
| 영향 검사 | 실패/INVALID 해당group만 수리·재검. clean 성공 및 원137/old117·145·88·71 재연0 |
| 백업 | 신규 test/doc WORK와 HEAD 부재 확인·읽기전용 HEAD query receipt를 `tests/backup-before-draft/`에 보존. Git mutation0 |
| docs 동기화 | 코드 작성 후 docs 전체 관련 키워드 rg 및 literal grep 저장. 보호2_3·마케팅 본문 수정0 |

## 23. MAP PRODUCTION REPORT

| 단계 | 이번 검수 범위 |
|---|---|
| MASTER / LARGE OUTER MASS / MEDIUM / GROUND / LANDMARK / SMALL DETAIL | 기존 geometry·nav·collision·배치·원 에셋 변경0, retained 맵가이드1047줄 및 SSOT 적용 |
| PLAYABLE / COMBAT | actual Main scene의 lesson guard publication과 수명만 관측 예정. 원 Q/E·HP·자원 수치·판정 변경0 |
| CAMERA QA / TECH QA | 고립 actual Main CameraTree 첫 신규3/30 통과. 공개/GUI/픽셀검수0 |
| VISUAL VERDICT | **RETOUCH — NO PUBLIC PIXEL QA**. source guard 설치는 튜토리얼 controller·시각 품질·출시 완료 증거가 아님 |

## 최초 실행 ledger

| attempt | 선택 / 실제 결과 | 증거 / 한계 |
|---|---|---|
| 01 | 신규 actualMain3그룹만 / 30assert / FAIL0 / SCRIPT_ERROR0 / Parse0 / ERROR0 / exit0 / 4.374504333초 | 외부 `tests/attempt01-stdout.txt`, stderr, receipt, input snapshot·command·hash를 보존. 기존 Camera2D interpolation physics-mode warning1이며 오류로 재분류하지 않음 |
| caller cleanup | 소유 Main3의 cleanup IDs를 기록, 각 group 전후 제거/free | 같은Tree 동시Main0. Main 해제 후 invalid Node Callable은 호출하지 않음 |
| 실제 초기 상태 | cold Main wrapper null→file-init inactive current / chapter 없음 / publish1 / source constructor input current=false 유지 | holder 강참조를 가진 actualMain guard 준비와 원 holder의 독립 main_binding_proven=false를 구분 |
| 명시 fixture | 실제 holder public publisher로 chapter2→3 및 revoke | 이미 받은 live Main callback은 새값·null을 읽음. 이 호출은 테스트 발행이며 native controller 자동진행 구현이 아님 |
| lifetime | 실제 Main.free→weakMain null / Node callable invalid. test-retained RefCounted holder는 CURRENT_LESSON/READY inactive를 유지 | Root가 Main loss를 자동revoke한다고 가정하지 않았고, freedMain snapshot/getter를 호출하지 않음 |
| 변경·재연 | production/test 수리0 / clean 재연0 / old117·145·88·71·Root137 재연0 / worker UID0 | fullMain/controller/automatic lesson·resource regeneration/public play 준비false 유지 |

실행은 `--headless --path <isolated-stage> --script res://tests/test_native_main_source_lesson.gd`로 신규3그룹만 선택했다. 기존 pausedGodot/browser/node3333/API/save/userQA를 사용하지 않았다. 실제 표시 FPS·source physics 순서·HP/resource guard 소비·전체 튜토리얼 lifecycle·UI/input/save/restore 검수는 이번30개에 포함하지 않는다.
