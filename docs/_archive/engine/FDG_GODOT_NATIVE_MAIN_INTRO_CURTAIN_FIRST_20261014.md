> **2026-10-14 실제 Main 커튼 그림자 연결:** 원 R25 view에 ART R26 shadow child를 bind했다. 새actualMain1/8checks firstPASS(1.977740209초), product수리·oldsuccess재연0. blur80/alpha.95/sigma40/hairline잔여~.014; z45 mapping/visibleGPU/publicpixel/controller는미완. SKILL old22는canonical불일치로Main미채택/Gwriter0. [그림자 연결 정본](FDG_GODOT_NATIVE_MAIN_INTRO_SHADOW_FIRST_20261014.md).

# 실제 Main 인트로 커튼 UI 서비스 · 2026-10-14

Main은 ART의 원 `intro_curtain_view.gd`를 기존 실제 HUD CanvasLayer에 연결한다. 처음에는 숨겨져 있으며, 아직 원 intro controller가 자동 호출하지 않는다. native_ui_service 바인딩과 원본 800ms 전환/900ms 종료 callback을 소비했다. source G.on/600frames·전체 startup·게임 완성·GPU 픽셀은 미인수다.

| 위치 / 공개 API | 현재 정확 계약 |
|---|---|
| Main._ready | 기존 HUD add_child/bind/signals 직후 `_bind_native_intro_curtain_view`. 신규 Actor/asset 생성0; 원 Control1개만 HUD 자식 SourceIntroCurtain으로 bind, hidden |
| `get_native_intro_curtain_view()` | 실제 Main/HUD/view 동일 Tree·parent·physical script·queued/lost 검사. 실제 current Control 또는 null; 이전 ready 캐시 대체0 |
| `get_native_intro_curtain_snapshot()` | schema fdg-native-main-intro-curtain-service-v1, readiness_scope native_ui_service, READY/NOT_READY, bound/hidden/parent/elapsed_ms/progress; source_controller_bound/source_startup_activation_bound/full_main_ready/public_play_proven=false, gpu_render=NOT_PROVEN |
| ART 원 view | SHA7288dda28f57b46c7e3bfd7581ed6a6cbb3103ec07c4326cfd753a71f5c2029b 그대로. `bind(parent)` / `show_closed()` / `open(on_done)` / `hide_now()` / `elapsed_ms()` / `progress()` / `panel_rects()` / `terminate()` |
| 원 UI 값 | 상하 height50%, pointer ignore, PROCESS_MODE_ALWAYS / Time.get_ticks_msec; transition800ms cubic-bezier(.4,0,.2,1), timeout900ms 이후 hide/callback1회 |
| 원 색·경계 | EDGE #030303 / MID rgba(18,14,11,.94), border1px rgba(133,111,79,.33), 8px 안쪽 hairline rgba(184,157,110,.55) |
| source frame600 | game63808 intro-curtain ENTRY의 P.iframes600은 별도 source_startup_activation owner. view와 Main UI 바인딩은 P/G/lesson 쓰기0; 900ms UI 끝으로600을 옮기지 않음 |
| 현재 시각 잔여 | inset shadow80px 및 CSS parentz45 mapping 공급은 ART 후속/중앙 계약 미연결. parent_z45_bound=false, not_rendered 원목록 보존; 실제 native HUD.layer10. GPU/publicpixels 미인수 |

## 실제 Main 최초 소비와 실패 이력

| 실행 | 결과 / 경계 |
|---|---|
| 첫 actualMain UI episode1 | 신규15checks 중14PASS/1FAIL; 3.880316125초/exit1/SCRIPT0/Parse0/ERROR0/CameraWARNING1. 실패1은 wallclock timeout callback, done0/elapsed 미관측 |
| 새 실패 항목 only episode1 | `test_native_main_intro_curtain_timeout_failed_only.gd` 단일check1 PASS; 3.249070791초/exit0/SCRIPT0/Parse0/ERROR0/CameraWARNING1. 기존 성공14·전체15·ART원12 재연0 |
| 직접 관측 | 50ms SceneTreeTimer 첫 반환은 실제 wall0ms / Engine process frame0 / view elapsed0. 실제 wall1249ms 후 callback1, callback elapsed906ms, transition_donetrue, hidden, processingfalse, tree_pausedtrue |
| 분류·한계 | 검사 타이머의 프레임 delta를 실제 wall-clock으로 취급한 fixture 문제. 원 첫1.05s timer의 반환 wallms는 계측하지 않았으므로 precise값을 소급하지 않는다. 신규50ms 조기반환 및 원view906ms 결과가 해당 분류 근거다 |
| 고유 최종 | 첫14 valid + 실패only1 clean = 고유15 PASS. 첫15 전체clean이라고 표현하지 않음. 제품 수리0, 새 실패 전용leaf1, 성공 suite 재연0 |
| 실제 UI 동작 | 같은 Main의 실제 HUD child, hidden bind, 원view close/open, 별도 testTreepaused 중wall timeoutcallback1, hide cancellationcallback0, terminate즉시publicview null/NR. source G.on before/after false |

첫 test의 cancellation 타이머는 실제 소요 wallms를 계측하지 않았으므로 정확900ms 경과 증거로 계산하지 않는다. callback cancellation과 hidden/processingfalse는 직접 관측했다. 두 테스트는 새 isolated SceneTree만 pause/unpause하며 보호된 인간Main과 무관하다. 새 자체상태/clock/HP/G setter·manual `_process`/native tick 호출0. callback info는 원 view가 실제 시계에서 제공했다.

## 함께 정상 checkpoint로 인수하는 source API

| 산출 / 원 검증 | 현재 scope·잔여 |
|---|---|
| native_new_run_bootstrap_source producer 공용 `plan_g_assignment(step_id, actual_context)` | Root final32976B/SHA63e21659e4e109675d502b684b81e86e48c95e2528d0ce16a13419daf180a2da. 원 `_g_fields` 재사용; 기존몸체 변경0. Root첫9그룹292clean은동결/재연0, 실제 Main G 쓰기0 |
| public IDs / context | g_initial_reset/g_cutscene/stage_test_override/boss_test_override; decision.branch fresh_no_save 명시, 실제 stage_test_req/load_shared_mats/boss_test_req Callables. missing/arity/value 오류NR, loaded restore 제외 |
| initial18fields 순서 | head@index6(5)→cache_exit_center@index7→boss@index8(4)→hud_counters@index9→tail@index10(9)→storage_reset@index11. flattened18을 barrier 전 일괄쓰기하지 않음; sourceCurrent/applied/main_ready=false |
| source_startup_activation 원 producer | Root final16045B/SHA4469b746e0e0a0495dc5b62bb330df1b1f01469f10626dec07a63895d2881268. 기존 Root14/791 constructor protocol 검증은 동결·읽기/복사/재연0. actualMain owner8poststage/4intro/publisher/sink 미연결 |
| globals/stage 실제 설치 | 실제 mats/request/newRun decision·persegment sink/readback/원 cacheHUDstorage 순서 미완. UI ready나initializer.completed를 source completion으로 바꾸지 않음 |

위 새 source API 인수는 기술 산출을 정상 Git으로 보존하는 것이다. Root의 기존 테스트 파일은 이 checkpoint에 포함하지 않으며 Root 성공 수를 이 UI 검증에 합산하지 않는다. source activation 원 branches boss300/nonzero300/intro-entry600은 원 계약이며 이 UI 테스트의 무적 관측이 아니다.

## 보호·증거

Code/cache metadata 격리 사본과 readonly assets/data/imported 링크 사용. custom userdata EXODUSER-MainIntroCurtain-Isolated-20261014, qa/latest-session.json 생성false. 최초metadataUID2(0.273098709초)+실패leafUID1(0.26145275초)+frozenStartupUID1(0.266034958초), 모두primary WORK·stage부재확인/duplicate0/import0/runtime group0. Root모듈 primitive/body/asset 복제·source구현중복0. 기존 실행화면 Main37406/browser/server3333/Save/API/shipping export 조작0.

headless Main viewport1920×1080은 창영역 수치일 뿐 GPU/공개 pixels/Windows최소240FPS 측정이 아니다. 현재 캐릭터2/8/8/9장·1.25/7.5FPS·목표24고유장/24FPS0/32 유지. 원화의 치마·전신·무기/모델링/움직임/VFX 인수와 전체 stage/game완료는 미완이다. map geometry/collision/outer mass/원근 수정0. **VISUAL VERDICT: RETOUCH**.

증거 E/dependency-native-main-intro-curtain-first/{before-edit,stage-preparation.json,metadata,tests/attempt01-receipt.json,tests/attempt02-receipt.json,tests/final-first-ledger.json,docs-search,checkpoint}. 정상 code+docs receipt는 checkpoint/checkpoint-receipt.json.
