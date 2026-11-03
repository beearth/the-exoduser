> **2026-10-14 실제 Main 커튼 서비스:** 기존 HUD에 ART 원view를 hidden bind하고 실제900ms callback을 소비했다. 첫15 중14valid/1FAIL→실패only1clean(906ms callback1), 제품수리0·성공재연0. sourcecontroller/G.on/600frames/GPU/fullMain 미연결, shadow80px/z45 gap 유지. 함께Root G-only publicplanner9/292와 Startup 원producer14/791를 동결기술scope로 정상 보존하며 실제Gwriter/18fields 일괄ACK0. [Main 커튼 정본](FDG_GODOT_NATIVE_MAIN_INTRO_CURTAIN_FIRST_20261014.md).

# FDG Godot 실제 Main/HUD 인트로 커튼 소비 검사 (2026-10-14)

상태: 새 실제 Main UI 소비자 테스트 작성, **실행 전**. root view 기존 성공12 및 이전 Main 성공29/117 등 suite 재실행·fixture 읽기·복사0. Main 제품 연결·원 R25 view 인수·격리 실행·UID·checkpoint는 중앙 엔진 담당 소유다.

| 소유 파일 | 목적 |
|---|---|
| `godot/tests/test_native_main_intro_curtain.gd` | 실제 Main 1회 episode의 기존 HUD/원 커튼 UI 소비·일시정지 wallclock·수명 정리 검사 |
| 본 문서 | 예정 15 assertion·실시간 단위·원 시작 상태 미활성 경계 기록 |

## 원본 / 공개 서비스 계약

| API / 근거 | 정확한 계약 |
|---|---|
| Main `get_native_intro_curtain_view()` | 실제 Main이 보유한 기존 HUD CanvasLayer 자식 `SourceIntroCurtain` Control, 같은 Tree·유효한 수명 또는 null |
| Main `get_native_intro_curtain_snapshot()` | native UI 서비스 READY/NOT_READY와 source controller/full play/GPU 미인수 기록 |
| 원 R25 `intro_curtain_view.gd` | `bind(parent)`, `show_closed()`, `open(on_done)`, `hide_now()`, `elapsed_ms()`, `progress()`, `panel_rects()`, `terminate()` |
| 표시 방식 | Main에서 기존 HUD에 딱1개 Control을 연결하고 처음에는 hidden. actor/body/texture 추가0 |
| 처리 / 입력 | 원 view `PROCESS_MODE_ALWAYS`, `MOUSE_FILTER_IGNORE` |
| 원 CSS628..630 | **800ms** transform transition (`cubic-bezier(.4,0,.2,1)`) |
| 원63832..36 | **900ms** wallclock timeout 뒤 hide + caller callback1회 |
| 원63808 | `P.iframes=600`은 원 startup controller의 별도 native frame 값. 이번 view/테스트가 쓰거나 증명하지 않음 |
| 기존 current G | 공개 `source_state.read_current_g()`로 on=false 전후 읽기만 함. source/G/HP/private clock setter0 |
| 표시 잔여 | R25 원 view의 inset shadow80px 미렌더, parent z45 contract 미연결. R26 source-finish 재인수/재검사0 |

## 신규 단일 episode의 예정 15 assertion

| # | 검증 | 목적 |
|---:|---|---|
| 1 | 동일 cold Main getter null/NOT_READY | 아직 HUD에 연결되지 않은 상태 구분 |
| 2 | 실제 HUD 자식 / same Tree | 가짜 UI parent 금지 |
| 3 | 첫 바인딩 hidden/READY | 시작 controller 자동 실행0 |
| 4 | PROCESS_ALWAYS / pointer ignore | 원 wallclock 표시 계약 소비 |
| 5 | Main Player1 / HUD SourceIntroCurtain1 | actor/body/커튼 중복0 |
| 6 | source/full/public/GPU/z45 판정 경계 | UI service를 전체 startup 완료로 승격 금지 |
| 7 | 실제 G.on=false before | 가짜 false fixture가 아닌 기존 owner 읽기 |
| 8 | 공개 show_closed | 실제 parent 안의 view를 표시 |
| 9 | 새 격리 SceneTree paused 중 open | 인간의 앱/UI 접근0, 이 test Tree만 일시정지 |
| 10 | 실제900ms 이상 / callback1 / 숨김 | 공개 API 실제 wallclock 동작 |
| 11 | 실제 G.on=false after | 표시 callback이 source game을 활성화하지 않음 |
| 12 | 새 open→hide_now 취소 | 실제 추가1.05초 후 callback0/hidden/process off |
| 13 | hidden 후 실제 custody 유지 | 숨김과 서비스 소멸 구분 |
| 14 | terminate 직후 public null/NOT_READY | queued 수명 손실 즉시 반영 |
| 15 | 종료도 좁은 범위 | source/full/public/GPU/z45 미인수 유지 |

공개 원 view 호출 외에 `_process` 수동 호출·`_t0` 변경·가짜 callback 상태·source readiness 쓰기0. 두 대기는 각각 `SceneTree.create_timer(1.05, true)`로 실제 시간 진행을 기다리고 test Tree paused에서도 timer/process가 동작하도록 한다. Timer 자체는 새 검사의 대기 도구이며 원 view 시간 공급자를 교체하지 않는다. view 완료 info의 actual `elapsed_ms`를 출력하되 원 900ms 하한만 검사하며 flaky 상한을 발명하지 않는다.

marker `NATIVE_MAIN_INTRO_CURTAIN_FIRST` JSON에 새 실제 Main 생성1회·callback 실제 시간·취소 callback 수·G.on 전후 관측을 기록한다. 실패0이면 exit0, 아니면 exit1. 격리 userdir·원 자산 readonly 공급·새 stage는 중앙 담당이 준비한다. 실측 GPU/FPS·공개 pixels 증거가 아니며 **VISUAL VERDICT: RETOUCH**다.

원 1차 문서는 [R25 표시 계약](FDG_GODOT_PORT_CHARACTER_CLIP_FIRST_20261013.md)과 [source startup gate](FDG_GODOT_SOURCE_STARTUP_GATES_20261014.md)다. `docs/2_3 돌진+패링+방패시스템/`, 전투 수치/Q/E/save/API·사용자 paused 앱/browser·3333 서버·PNG/캐시·Git 변경0.

| 전체 docs 관련 검색 | 결과 |
|---|---|
| `intro_curtain_view\|get_native_intro_curtain\|SourceIntroCurtain\|_openIntroCurtain` | 새 코드 작성 뒤 전체 docs `rg -l` 및 `grep -r -l -E` 실행 완료, 각각 **4개 문서** 매칭. 다른 소유자의 공통 문서/기존 성공 기록 변경0 |

## 최초 실제 Main 실행과 실패 항목만의 새 검사

최초 15 assertion 실행 결과는 **14 PASS / 1 FAIL**, exit1이다. 실패는 `actual_wallclock_timeout_hides_view_and_calls_once` 하나이며 `done_calls=0`, `callback_elapsed_ms=null`, 실제 source G.on=false가 관측됐다. SCRIPT/parse/ERROR0, CameraWARNING1. 이 시점의 전체15 PASS를 선언하지 않는다. 최초 raw 결과는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/dependency-native-main-intro-curtain-first/tests/attempt01-receipt.json`에 보존한다.

최초 fixture는 실제 wallclock 확인 없이 `SceneTreeTimer(1.05)` 반환 직후 완료를 검사했다. Main 생성의 큰 이전 frame delta를 새 timer가 같은 frame에서 소비했을 가능성은 **추론**이며 아직 확정하지 않는다. `Time.get_ticks_msec()`와 원 view의 공개 `elapsed_ms()` 관측으로 실제 대기 시간을 먼저 분리한다. 제품 R25 view와 Main은 이 검사 담당이 수정하지 않는다.

| 새 failed-only 코드 / API | 범위 |
|---|---|
| `godot/tests/test_native_main_intro_curtain_timeout_failed_only.gd` | 새 실제 Main 생성1회, 기존 실패 assertion **1개만** 확인 |
| 원 view 호출 | actual Main getter의 실제 기존 HUD view → 공개 `show_closed/open(on_done)` |
| 대기 조건 | 실제 monotonic `Time.get_ticks_msec()` 기준 **1200ms** deadline. `create_timer(0.05, true)` 반환을 반복하되 timer elapsed를 실제 wallclock으로 간주하지 않음 |
| 동기 관측 | open 전 / 첫 timer 반환 뒤 / deadline 뒤: 실제 wall ticks, 공개 elapsed_ms/phase/is_processing/visible, tree paused, Engine process frame, callback 횟수/완료 info |
| 실제 G | 공개 current owner의 on 전후 읽기만 출력. 기존 통과한 source-state assertion 재실행0 |
| 유일 assertion | 실제 callback1, callback elapsed≥900ms, transition_done=true, view hidden |
| 금지 유지 | private `_process/_t0`·수동 native tick·가짜 clock/state 쓰기0. 기존 성공14·원12·전체15 suite 복사/재실행0 |
| 신규 실행 | 이 담당은 실행0/UID0/Git0. 중앙 executor가 새 leaf만 실행하고 첫 관측 결과를 인수 |

새 출력 marker는 `NATIVE_MAIN_INTRO_CURTAIN_TIMEOUT_FAILED_ONLY`이며 `checks=1`, `successful_cases_replayed=0`, 실제 timer 반환 wall delta와 deadline 결과를 기록한다. 테스트 출력의 초기 classification은 `UNCLASSIFIED_PENDING_PRIMARY_REVIEW`다. 실제 관측 전 제품 오류 또는 fixture 오류로 단정하지 않는다. 전체 품질·원본600iframe·source controller/GPU/public pixel은 여전히 미인수다.

새 failed-only 코드 작성 뒤 전체 docs에 `intro_curtain_view|get_native_intro_curtain|SceneTreeTimer|actual_wallclock_timeout_hides_view_and_calls_once`를 `rg -l` 및 `grep -r -l -E`로 검색했으며 각각 **2개 문서**가 매칭됐다. 본 문서의 최초 실패 이력을 추가했고 다른 소유자의 Main/R25/공통 문서/확정2_3 변경0이다.
