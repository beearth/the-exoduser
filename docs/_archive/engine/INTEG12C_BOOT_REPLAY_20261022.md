# INTEG-12c — 영상 pause 소유권·리플레이 수명

기준 origin/codex/demo11-integ12-20261022 `bee0968e256337a239d25a032c871ec31987f295`. 같은 브랜치, 별도 INTEG-12c worktree. 스킬창·PC 테스트/코어 변경 없음.

| 대상 | 원인 | 현행 계약 | 원본/검수 근거 |
|---|---|---|---|
| 로비 → 전사 이야기 → Main | 개별 영화가 tree.paused를 저장하지만 로비가 이전 영화를 소유/종료하지 않아 겹친 영화가 true를 상속 가능 | 로비 _movie 단일 소유. 다음 영화 begin 전에 이전 finish로 원래 pause 복원. _launching으로 중복 launch/영상 차단. 영화 finish와 exit_tree는 소유 pause를 1회 반납하고 finished는 복원 뒤 발행 | index.html finishCin2461, 생성3421; character-story-player.js finish는 overlay 제거 후 promise resolve |
| lifecycle 리플레이 | starter lifecycle이 main.source_state.free() 수행. 기존 life310은 main 유효성만 검사 후 해제 State read; headless 검사는 뒤여서 보호 불능 | headless 최우선 반환. tree/queued/Main/State 수명 검사 후 read. frame_post_draw 뒤 generation/owner/viewport/RID/Image 재검사. State reader가 null을 반환하는 authority-loss 경계도 Dictionary 확인으로 거부. exit_tree에서 generation 무효화·timer 중지·render target 비활성 | test_native_main_source_starter_state lifecycle; 기존 signal11/exit-6 로그 |
| replay 표시 | capture 안전성 보강 | World2D 전용480×270,10Hz,50프레임 순환·HP/ST/MP/SH 값·기존 재생/skip 일정 유지. tick 목록 API/ResourceLoader/매틱 할당 신규 없음 | source_snapshot/game.html43618–43719; PARITY_UI_03 |
| intro01 story null | 재사용 namespace에서 saved run 복원이 먼저 적용 | Mac 하니스 intro01/E2E는 매 실행 UUID namespace. E2E에는 실제 namespace를 --isolated-userdir로 전달. 고정 equality PC fixture는 변경 없음. 명시 storage=on 보존 | Main447 saved restore 우선은 저장 이어하기와 일치하므로 제품 분기 순서 변경 없음 |
| dummy texture | 조사·단회 결과는 아래 기록 | VRAM-01 weak cache는 살아 있는 TextureRect/Rail의 strong ref를 해제하지 않음. PC oracle 변경 없음 | 원로그 texture_2d_initialize dummy t=null, GDScript stack 없음 |

검수 결과와 실제 GUI 캡처·E2E18단계는 외부 `~/exoduser-wt/_out/INTEG-12c/DONE.txt`에 최종 기록한다. 영상 motion/audio HOLD와 기존 맵/UI 시각 차이를 이번 안전 수정의 PASS로 바꾸지 않는다.

## 단회 검수 중간 확정

| 검사 | assertions/checks | 실패 | 결과 |
|---|---:|---:|---|
| native_main_source_starter_state | 148 | 0 | PASS, lifecycle 전체 포함·exit0 |
| intro01 | 12 | 0 | PASS, UUID 격리·실제 Space 홀드 |
| p1002f_dedicated_hurte | 358 | 0 | PASS, dummy t=null 미재현·PC 테스트 변경0 |
| 42 | 0 | — | 실행 인자 --map11=off 누락으로 시작 전 거부(exit2). 1회 제한에 따라 재실행0. 검증 미완료 |
| 44_pets | 75 | 0 | PASS |
| product | 47 | 0 | PASS |
| 실제 GUI | 수동 경로1회 | 0 engine errors | 시네마틱 다시보기→생성→전사 Space→INTRO/guide Space→필드 W 이동. 자연 사망 후 replay 표시 추가 확인. exit0 |

위 실행 SCRIPT ERROR0·signal11/exit-6 재발0. 42의 제품 ERROR1을 숨기지 않는다. 원본 Godot 앱 접근은 기존 프로젝트 매니저로 해석되어 실제 입력을 하지 않았다. 별도 식별자의 동일 엔진 복사본을 ad-hoc 서명 후 자기 GUI에만 입력했고 원본/PID81277은 보존했다. GUI 캡처 field.png와 replay.png·원로그는 외부 출력에 있다. generic 하니스는 GUI에 _RESULT가 없어 false로 집계하므로 수동 GUI 관측과 구분한다.

VRAM-01은 inventory 최초 open과 close 이벤트 및 WeakRef 캐시만 변경한다. 실제 소비 TextureRect/Rail은 strong ref를 보유한다. 이번 PC combat fixture는 해당 close를 호출하지 않으며 테스트/보호 코어를 수정하지 않았다. 단회 p1002f 전체 PASS로 이전 dummy 오류의 지속 재현은 확인되지 않았으나, 엔진 C++ backtrace나 texture RID가 없는 이전 로그만으로 원인 해결을 단정하지 않는다. 무근거로 캐시 수명을 되돌리거나 PC oracle을 완화하지 않았다.

## 최종 E2E와 검수 한계

storage=on·주입0·실행1회: **overall NOT_READY / PASS7·NOT_READY11·FAIL0**, exit0·SCRIPT ERROR0·engine errors0·native signal11/exit-6 재발0. 공통 수집기의 PASS는 오류0/실패0 조건일 뿐 제품 전체 E2E PASS가 아니다. PASS13 목표 미달.

| # | 단계 | 결과 |
|---:|---|---|
| 1 | isolation | PASS |
| 2 | new_game | PASS |
| 3 | character_create | PASS |
| 4 | intro_skip | PASS |
| 5 | field_MAP11 | PASS |
| 6 | enemy_kill | NOT_READY |
| 7 | item_pickup | NOT_READY |
| 8 | equip | NOT_READY |
| 9 | auto_potion | NOT_READY |
| 10 | level_up | NOT_READY |
| 11 | stat_passive_invest | NOT_READY |
| 12 | revival_interface | PASS |
| 13 | bossroom_gate | NOT_READY |
| 14 | boss_defeat_signal | NOT_READY |
| 15 | clear | NOT_READY |
| 16 | demo_end | NOT_READY |
| 17 | save_handoff | PASS |
| 18 | lobby_return | NOT_READY |

자연 처치 전 HP0으로 drop/장비/level/성장 단계가 이어지지 않았다. 실제 Retry Button으로 respawn APPLIED·HP562 복원 및 scene_reloaded=true를 확인했다. 보스방 prerequisites·실제 클리어/로비 반환은 NOT_READY이며 상태·HP·drop/EXP 주입 또는 판정 완화0. 원본 전체 receipt는 외부 e2e/stages.json.

마지막 검토에서 추가한 State reader Variant-null 거부2곳은 위 suite/GUI 이후 보강이다. 최종 life --check-only exit0·오류0으로 문법 검증했고 각1회 제한에 따라 suite/GUI 재실행0. 기존 valid 경로의 표시/수치 변경은 없지만 최종 두 거부 분기의 동작 재검수로 과장하지 않는다. 42 미검수·dummy 오류 정확한 원인·E2E PASS13은 남은 항목이다.
