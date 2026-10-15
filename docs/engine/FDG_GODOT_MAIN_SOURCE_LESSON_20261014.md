# 실제 Main source lesson holder 연결 — 2026-10-14

실제 Native Main에 원 `parry_lesson_source` holder를 생성·보유하고 원 file-init 리터럴을 게시하는 경로를 저장했다. cold Main의 null/NOT_READY와 실제 게시된 inactive false를 구분하며, Main의 물리적 수명에 묶인 LIVE guard callable을 공개한다. 본 worker runtime/import/기존 성공 재연은 0이다. 첫 actual Main lesson consumer 검수는 primary 대기이며, 코드 저장을 controller·자동 회복·공개 플레이 완료로 표시하지 않는다.

## 소유 / 원 공급자

| 항목 | 실제 경계 |
|---|---|
| 소유 코드 | `godot/scripts/main.gd`의 SourceLesson preload/field/file-init lifetime/readonly getter 구간만. 기존 `_ready()` 맨 앞에 file-init 호출1 추가 |
| 소유 문서 | 이 파일만. Player/World/State/Authority/Providers/SourceRegenPhase/Root producer·기존 Main 함수 본문·asset/타인 WIP 변경0 |
| 사전 backup | parent `273dcd22`(docs-only, code parent a465), Main WORK=HEAD 12497B/SHA `8876496ff8cb15ccf02322a816e9d85be4e981143ec6a4e9d02eb5c30394d64b`. 외부 `dependency-main-source-lesson-first/worker/before-edit/main.work`, `main.head`, `receipt.json`; 새 SSOT WORK/HEAD 부재 |
| Root FINAL | `team-port/parry_lesson_source/handoff.json`, producer22931B/SHA `3f6693c821cbe3d8aeb81cab2629cc073dba733c8181da1fd3dc9aace900be3e`. 원 Root7/137 유효 성공 동결; 이 worker의 재검사/해시 재계산/수정0 |
| 원 source | `R parry-lesson.js:2-6` file-init 및 `R game.html:33360` guard. 원 controller/start/storage/source 전체를 새로 조사하거나 복제하지 않음 |

## 실제 초기화 / 수명

| 단계 / 필드 | 정확한 동작 |
|---|---|
| `SourceLessonScript` | 원 `res://port_modules/parry_lesson_source/producer.gd` preload. 같은 Root module을 사용하며 placeholder/fake guard 객체 생성0 |
| `source_lesson:RefCounted` | actual Main의 강참조 field. `_ready()` 이전에는 null; 실제 file-init 단계에서 같은 Main이 생성·보유 |
| `_ready()` 첫 단계 | `_publish_native_source_lesson_file_init()`를 `process_mode`·World/Player/source new-run construction보다 먼저 호출. source 파일 리터럴 게시가 character/stage 초기화보다 앞서는 순서를 유지. Native instance file-init 위치이며 원 전체 JS loader/controller 동등 증거는 아님 |
| once guard | `_source_lesson_file_init_attempted`를 publication 앞에 true로 설정해 같은 Main에서 중복 게시0. 원 callable/tick/frame/게임 시계를 대신하지 않음 |
| physical provenance | Main actual script.resource_path=`res://scripts/main.gd` 확인. provenance에 `caller:'Main._ready/file_init'`, 실제 `native_main_instance_id`, 실제 `main_resource_path`, `native_phase:'before_World_Player_source_construction'`, 원 file-init reference를 기록. Object/Node 자체를 provenance에 저장0 |
| 실제 publish | 새 원 holder에서 `publish_file_init('native_main_binding',provenance)` 1회. source module은 원7 literal을 실제 current 객체로 설치. 부팅 packet을 current lesson으로 전달하지 않음 |
| boot input | `SourceLessonScript.source_constructor_packet()`를 1회 보관해 원 `status:'SOURCE_BOOT'/current:false/chapter_present:false`를 그대로 snapshot에 제공. current publication과 별도 입력 기록 |
| publish 계수 | Main `_source_lesson_file_init_publish_calls`는 실제 `publish_file_init` 호출 횟수. 정상 최초1이며 cold0. Root 자체 epoch/publish/read_guard 계수와 다른 영역; frame/tick/자연회복 횟수 아님 |
| 수명 | getter가 same Main의 queue deletion 여부·actual script·동일 Root holder script/liveness를 확인. Main freed 후 Main-bound Callable.is_valid=false이며 외부가 holder를 따로 보유해도 실제 Main의 권위와 구분 |
| SourceRoot flags | producer의 `main_binding_proven:false/full_main_ready:false` provenance/snapshot 값을 수정하지 않음. Main wrapper의 `holder_retained_by_actual_Main`은 현재 물리적 custody 판정만 |

## 공개 API

| API | 실제 계약 |
|---|---|
| `get_native_source_lesson_callable()->Callable` | `Callable(self,'_read_native_source_lesson_guard')`. 인자0·LIVE이며 epoch 고정0. cold에도 valid callable을 얻을 수 있으나 아직 holder 없음→null/NR. file-init 후 같은 Main wrapper가 실제 Root current를 읽음 |
| `_read_native_source_lesson_guard()->Variant` | actual holder/custody가 유효하면 Root `get_dispatcher_lesson_callable()`의 실제 `read_guard`에 위임1회. holder missing/queued/lost일 때 null. published inactive false로 대체0 |
| `get_native_source_lesson_snapshot()->Dictionary` | `status/guard_ready/holder_retained_by_actual_Main/native_main_instance_id/file_init_attempted/file_init_publish_calls/file_init_error/source_boot_input/publish_result/holder/guard_detail`와 미연결 flags 제공. actual Root snapshot·guard detail을 사용하며 getter나 raw current reference를 권위로 위장하지 않음 |
| snapshot JSON-safe | primitive/Dictionary/Array 진단만 반환. 현재 file-init data는 그대로 보존하고, 미래 외부 provenance의 Object·nonfinite 같은 비직렬화 값은 진단 문자열로만 표시. Root holder/guard의 원 값 수정0, provider 값 보충0 |
| snapshot read counter | snapshot은 Root.read_guard_detail()를 1회 호출하므로 Root `read_guard` 진단 계수가 1 증가. 이후 Root.get_snapshot()을 읽어 그 증가가 포함된 계수를 반환. controller/update/native physics/resource commit은 실행하지 않음 |
| `raw_current_reference_is_not_guard_authority` | true. 원 `get_current_lesson_reference()`의 raw null은 MISSING·witness 등 여러 상태일 수 있으므로 이 getter에 directly bind하거나 inactive 권위로 치환하지 않음 |

## 원 리터럴과 guard

| 원 file-init 필드 순서 | actual 원 값 / 표현 |
|---|---|
| `active` | false |
| `seen` | false |
| `phase` | `'intro'` |
| `step` | 0 |
| `checks` | Array8, 모두 false |
| `shot` | null |
| `heldDirections` | 원 empty Set을 Root Dictionary-as-Set `{}`로 표현 |
| `chapter` | 원 file-init에 absent. chapter1/2 또는 기본0을 Main에서 생성하지 않음 |

| cold / current | 정확한 판정 |
|---|---|
| cold Main.new, Tree 전 | source_lesson null, publish calls0, callable 결과null, snapshot status NOT_READY. lesson 부재를 실제 false로 취급하지 않음 |
| Root file-init publication 후 | actual authority CURRENT_LESSON / source_file_init / origin native_main_binding / epoch1 / publish1. 원 active=false이므로 `&&` shortcircuit, chapter를 읽지 않고 `{parry_lesson_active:false}`를 반환 |
| 후속 current 교체/변경/revoke | LIVE wrapper는 호출 때 Root 현재 holder guard를 읽는다. pinned epoch0·값 cache0·revoke 후 false fallback0. Main은 이 경로에서 publish_current/adopt_start/reset 같은 writer를 생성하거나 호출하지 않음 |
| 원 guard 위치 | game.html33360의 lesson active&&chapter===2가 ST/MP 자연회복만 막음. HP/holy flat은 앞에서 독립. 이 의미는 공급자의 원 guard 계약이며 현재 Main 자동 회복 연결 증거는 아님 |
| typed transport 한계 | active인데 chapter absent/fractional/nonfinite/string이면 Root는 NR. 원 JS의 ===2 false와 다른 기존 축소 경계를 그대로 보존하며 Main에서 값 보정0 |

## 현재 미연결 / 검수 상태

| 항목 | 상태 |
|---|---|
| 원 controller | tick/update/render/start/UI/input/spawn/snapshot/외부 finish restoration 전부 미연결. file-init holder publication만 |
| 새 character hook | skipKey의 실제 URL/char/slot 공급원·resetForNewCharacter·current storage/localStorage/removeItem 연결0. 저장소 접근0 |
| stage | 원 future G.on activation/full source stage bootstrap0. actual current G의 source boot/pre_stage 한계 그대로 |
| SourceRegenPhase | 실제 dispatcher services.lesson 설치·configure/advance 자동 연결0. 기존 dispatcher117/source suites 재연0 |
| Main flags | `lesson_controller_bound:false`, `automatic_source_regeneration_bound:false`, `full_main_ready:false`, `public_play_proven:false` |
| 최초 검증 | MAIN_SOURCE_LESSON_FIRST_VALIDATION_PENDING. primary가 새 actual Main lesson consumer FIRST만 수행 예정; worker parse/runtime/import0 |
| 보호 실행 | 현재 사람 Godot fullscreen/Web34/browser31/3333·3334 조작·리로드·리셋·새 창0, old successes0, Git mutation0 |
| 문서 동기화 | 코드 후 docs 전체 rg와 literal recursive grep 원시 로그·related paths를 외부 worker receipt에 저장. 공통/원 helper 역사 문서는 primary 소유 |

## 23. MAP PRODUCTION REPORT

| 항목 | 결과 |
|---|---|
| MASTER / LARGE / MEDIUM / GROUND / LANDMARK / SMALL DETAIL | 맵/geometry/nav/collision/환경/배치/START·EXIT/원 asset 변경0; retained 가이드1047줄 적용 |
| PLAYABLE / COMBAT | actual Main file-init partial lesson holder와 readonly guard publication. whole tutorial/자동회복/실교전 완료가 아님 |
| CAMERA / TECH QA | worker runtime0·픽셀0. 새 first consumer 검수 대기, 기존 성공 검사 반복0 |
| VISUAL VERDICT | RETOUCH — 공개 모델 품질/24장24FPS/화면/tutorial/최저사양240 검증을 이 수명 연결로 승격하지 않음 |

## 실제 신규 UID metadata

Primary가 WORK와Stage 양쪽 UID 부재를 확인한 뒤 실제ResourceUID API로2개만 생성했다. exit0/ERROR0/0.621807792초/runtime그룹0/import0/중복0.

| 파일 | actual UID |
|---|---|
| `godot/port_modules/parry_lesson_source/producer.gd.uid` | `uid://dhh36vxxnmnn4` |
| `godot/tests/test_native_main_source_lesson.gd.uid` | `uid://cd4aj0u8o7d3p` |
