> **2026-10-14 실제 Main 자원 실패 시작 중단:** 현재 Main은 sprite 검사 NOT_READY에서 새Player/source holders/World를 정리하고 physics/input off 후 camera/HUD/capture 생성 전 종료한다. 새 실제Main negative episode1/원Warrior public lifecycle fault1/첫12검증 PASS(1.851974083초), 예상push_error1·예상밖ERROR0/SCRIPT0/WARNING0/수리재연0. 이전99f6의29검증은 동결. 캐릭터24장·24FPS/model/치마 품질·source startup/GPU 미완은 유지한다. [실패 경로 정본](FDG_GODOT_NATIVE_MAIN_SPRITE_STARTUP_LOSS_FIRST_20261014.md).

# FDG Godot 실제 캐릭터 자원 유실 시 시작 중단 검사 (2026-10-14)

상태: 새 **negative-only** 실제 Main 소비자 테스트 작성, 실행 전. 예정 assertion과 예상 stderr는 실제 PASS 관측이 아니다. Main 제품 수정·격리 실행·stage·UID·checkpoint는 ENGINE 총괄 소유다.

| 소유 파일 | 역할 |
|---|---|
| `godot/tests/test_native_main_sprite_startup_loss.gd` | 새로운 실제 Main 생성자 1회, 공개 Node 수명 유실 1회 episode |
| 본 문서 | 예정 12 assertion·예상 diagnostic·인수 경계 기록 |

## 문제와 제품 동작

Main이 실제 Player/Warrior 자원을 검사한 결과를 기록해도 이후 camera/HUD/capture 생성으로 진행하면 깨진 캐릭터를 가진 플레이가 시작된다. 제품 담당은 최초 읽기 결과가 READY가 아니면 `_stop_source_player_startup`을 호출하고 새 Player/World를 해제하며 Main physics/unhandled input을 비활성화한 뒤 `_ready`에서 반환한다. 실패한 첫 report와 읽기 횟수는 진단용으로 보존한다.

새 검사는 source/G/HP/texture/state 값을 가짜로 채우지 않는다. 공개 `main.child_entered_tree` 신호로 실제 `Player`의 공개 `ready` 신호에 콜백을 연결한다. 원 Player `_ready`가 만든 `Warrior`가 실제 AnimatedSprite2D/Player 자식임을 확인한 뒤 그 노드만 `queue_free()`한다. 콜백은 Player의 실제 생성 뒤, Main의 `add_child(player)` 복귀 앞에서 실행돼 Inspector가 `target_queued_for_deletion`을 읽는다. 새 body·Texture·provider·clock을 생성하거나 바꾸지 않는다.

## 새로운 단일 episode의 예정 12 assertion

| # | 검증 | 기대 |
|---:|---|---|
| 1 | 공개 수명 오류의 실제 대상 | 실제 Player 진입1, fault callback1 |
| 2 | 잘못된 대체 노드 금지 | 원 Warrior AnimatedSprite2D, parent=실제 Player |
| 3 | 시작 읽기 | `startup_readonly_calls=1` |
| 4 | 실제 검사 판정 | 첫 `report.status=NOT_READY`, `reason=target_queued_for_deletion` |
| 5 | 오류 보존 | 첫 report.errors에 실제 `target_queued_for_deletion` |
| 6 | 새 actor/world 정리 | Main.player/world null 또는 freed, 실제 입력 노드 weakref도 소멸 |
| 7 | 플레이 owner 생성 중단 | Main.camera/hud/capture 없음 |
| 8 | 트리 노드 생성 중단 | `GameplayCamera`/`HUD`/`PerformanceCapture` 없음 |
| 9 | Main 처리 중단 | physics/unhandled input 비활성 |
| 10 | 현재 공개 getter | `NOT_READY/actual_player_missing`, frames/targets 실제 읽기0 |
| 11 | 실패 진단 유지 | 저장된 report 불변, 시작 읽기 횟수1 유지 |
| 12 | 판정 범위 | native_loaded_resources, full/public false, source wait NOT_PROVEN, stage 게시 false |

출력 marker는 `NATIVE_MAIN_SPRITE_STARTUP_LOSS_FIRST`다. 실제 실패0이면 exit0, 아니면 exit1이며 새 Main은 episode 종료 때 해제한다. Main 생성1/public fault1은 출력에 기록한다. 성공했던 첫29 및 원32·117/145/88/71 성공 suite 재실행·fixture 읽기·복사0.

## 예상 stderr와 실제 실행 인수

| 항목 | 예상 / 책임 |
|---|---|
| 제품 `push_error` | 정확1, `Native source player startup rejected: native_player_sprite_not_ready:target_queued_for_deletion` |
| SCRIPT/parse 오류 | 0 기대 |
| 출력의 expected 필드 | 예상 diagnostic을 기록한 값. stderr 실제 관측치로 승격 금지 |
| 첫 실행·elapsed·stderr | 중앙 executor가 새 격리 stage에서 이 테스트만 실행해 보충 |
| 실패·수리 | raw 최초 결과 보존, 실패한 신규 범위만 수리. 기존 성공 suite 반복 금지 |

원본 boot G.on·source post-stage/intro gate·save/API·사용자 paused UI·서버·PNG·import cache·전투 수치·Q/E·확정 `docs/2_3 돌진+패링+방패시스템/` 변경0. 검사기 자원 READY는 캐릭터24고유장/24FPS·의상/모델 잘림·GPU 렌더/성능 완료가 아니다. 이번 범위 **VISUAL VERDICT: RETOUCH** — 시각 제작 또는 공개 화면 검수0.

관련 1차 근거는 [실제 Main 자원 소비 계약](FDG_GODOT_NATIVE_MAIN_SPRITE_READINESS_FIRST_20261014.md)과 [읽기 전용 Inspector 정본](FDG_GODOT_PORT_NATIVE_SPRITE_RESOURCE_READINESS_FIRST_20261014.md)이다. 새 코드 작성 뒤 전체 docs `rg`/`grep -r` 관련 검색은 아래 결과에 기록한다.

| docs 관련 검색 | 상태 |
|---|---|
| `get_native_player_sprite_readiness\|target_queued_for_deletion\|_stop_source_player_startup\|native_player_sprite_not_ready` | 새 코드 작성 뒤 전체 docs `rg -l` 및 `grep -r -l -E` 실행 완료, 각각 **3개 문서** 매칭. 공통 문서·기존 성공 기록은 다른 소유자 범위로 수정0 |
