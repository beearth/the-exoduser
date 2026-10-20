# Main / State 기능 등록 설계 — main-registry-design

2026-10-21 · PC 총괄 승인 전 브랜치 시제품. 기준 origin/main `0138c5bb9188d27cee10cb1a901d075092ddb88f`. 최신 웹 본편의 완성 범위나 PC 실행·동기화 완료를 뜻하지 않는다.

## 조사와 충돌 원인

`git log --oneline -40 -- godot/scripts/main.gd godot/scripts/native_source_new_run_state.gd`와 first-parent 40건의 실제 patch를 대조했다. merge patch는 첫 부모와 비교하고 원래 feature commit은 별도로 확인하여 동일 변경을 기능 수로 중복 계산하지 않는다. 전체 목록은 제출 로그 history.txt에 보존한다. Main의 preload/멤버/_ready와 State의 owner·transaction 구역이 여러 작업의 공통 편집점이다.

| 패턴 | 실제 커밋·추가 구역 | 등록 계약·제약 |
|---|---|---|
| 설치·수명 | DEMO11-27 `2b3aa748` ForgeScript/source_forge/패널 생성, -34 `abb80c75` boss actor, -35 `727f6a02` projectile install | 기능 디렉터리의 자기 descriptor가 생성·연결·해제 담당. required service ID/버전·의존성 선언, Main 인스턴스별 1회. State/world/player 준비 이전 설치 금지 |
| 정확한 틱 위치 | -25 `88d9a0e1` Main physics 선두에서 advance_native 지연 예약 | `physics_entry_deferred` 슬롯. 예약 위치와 실행 위치를 구분. 현재 60Hz·delta×60·Engine physics serial 그대로. child regen 이후라는 기존 부분 이식 계약만 유지 |
| 신호·표시 | -40 `1888729c` native_sound_event/공유 SND 소비, -27 패널, -21 `e0485424` world drops 어댑터 | boot HUD/world-ready 슬롯에서 연결. signal owner·중복방지·disconnect 책임을 descriptor가 소유. 표시 관찰자가 피해 writer가 되지 않음 |
| State 명령·소유권 | -17 `c698aa86` skill management commit, -18 `bfa524f0` fusion/undo, -20 `726cf925` XP cap/handoff, -27 forge transaction, PC `a28117c1` stat refresh/protected restore | registry는 writer 권한을 부여하지 않음. 기존 State 검증 entrypoint 유지. 향후 State 내부 capability adapter를 PC가 승인·추출한 뒤 ID별 command handler 등록. method-name 위임으로 검증 우회 금지 |
| 저장·런타임 필드 | -25 potion runtime은 P/INV/save 스키마 확장 아님. -20 저장 handoff도 IO 구현 아님. 기존 source_save_collector는 save_globals owner 부재로 HOLD | 저장 가능한 필드와 transient 필드 구분. 수집기 호출 하나를 추가하는 것만으로 실제 저장 구현이라 보고하지 않음. 기존 save schema 보존·아래 계약 적용 |

## 완성 계약 제안과 최소 구현의 경계

공용 중앙 목록을 매 기능마다 수정하면 충돌이 이동할 뿐이다. 기능마다 `scripts/native_features/<id>.gd` 하나를 추가하고 자기 모듈을 참조한다. 부팅 1회 discovery 후 compile/freeze한다. 파일명 정렬은 발견 재현성만 보장하고 실행 순서는 명시적 슬롯·order가 결정한다. exported `.gd.remap`도 원래 `.gd` 경로로 load한다. 배포는 export-all-resources 또는 이 디렉터리를 포함하는 검증된 생성 manifest가 필수다. 이번 PCK/Windows export 검증은 하지 않았다. 디렉터리·스크립트 실패를 조용히 누락하지 않으며 완성판에서는 scene 진입 자체를 실패 처리한다. 현재 시제품은 ready=false·push_error 후 dispatch 차단이며 UI 오류 화면까지 구현하지 않았다.

제안 descriptor v1은 id/version/requires, install(context, registrar), uninstall()을 가진다. context는 Main 전체 writable 노출 대신 read service·기존 검증 command·widget host capability를 제공한다. 새 기능에서 Main/State 멤버 추가 금지. 기존 source_potion은 identity 검증 호환 때문에 이번에만 유지한다. 지금은 register_feature(registry, main) 최소 API만 구현했으며 capability 격리·아래 나머지 슬롯은 설계다.

- 부팅: owners_ready → world_ready → hud_ready → scene_enter. 서비스 의존 DAG를 부팅 중 검증하고 cycle/missing/version mismatch는 실패. scene_exit는 역순 해제, queued callback은 기존 owner 수명 guard를 지킨다. 전역 singleton이나 이전 Main 참조를 재사용하지 않는다.
- 틱: 원문과 native 실제 호출 위치를 각각 장부에 고정. render clock, physics entry, player regen 후, damage 후 등은 서로 다른 슬롯이다. 기존 함수를 동일 위치의 단일 dispatch로 치환하고 슬롯 내부는 고유 order 오름차순. 동률·중복 ID 거부, frozen 후 변경 거부. 전투 핵심 슬롯 신설·재배치는 PC 담당이며 이번 변경 없음. 두 함수가 서로 다른 시점에 있었다면 같은 슬롯로 합치지 않는다.
- 저장 수집: profile별 기존 source_save_collector의 필수 reader 집합을 먼저 검증. callback(context)→READY/value 또는 NOT_READY/reason. key namespace·version·필수 여부·writer authority·허용 필드를 부팅에 고정. 모든 결과를 detached 임시 packet에 모은 뒤 충돌/누락/비유한수 실패 시 전체 HOLD, 부분 저장 IO 금지. transient potion serial·registry 배열은 저장하지 않는다. 기존 직렬화 필드를 새 namespace로 강제 이동하지 않는다.
- 복원: schema migration/검증 → owners 준비 → 순서별 restore plan → 기존 State writer로 commit → refresh → scene_enter. schema/version/unknown key 정책은 기존 저장 SSOT 우선. 원자 적용 불가능하면 시작 전 validation과 복구 packet 필요. 재진입·중복 request ID도 기존 transaction 의미 보존. 미등록 필수 기능이 있으면 실패하며 실제 사용자 세이브로 시험하지 않는다.
- HUD: host/anchor/z-order/visibility/pause policy를 등록. 등록자는 자기 widget만 생성·해제하고 부모 컨테이너 전체 교체 금지. 입력: action ID·default binding·priority·consume·pause context 등록, conflict는 부팅에서 거부. 기존 InputMap/설정 owner 우선, polling/한 번만 실행/hold/release 순서를 각각 보존. Q/E·이동·패링·피해 경로는 PC 승인 전 등록 대상으로 전환하지 않는다.

## 이번 시제품

`native_feature_registry.gd`: instance 초기화 중 디렉터리 탐색 1회, ID/order 중복과 invalid Callable 거부, seal에서 정렬 후 `_callbacks: Array[Callable]` 사전 구성. 틱에서는 준비된 배열을 순회하며 같은 Callable에 `call_deferred(main, source_ticks, serial)`만 예약한다. 목록 생성 API/get_property_list/get_method_list/get_signal_list/get_children/keys/values/filter/map/duplicate/정렬/디렉터리 탐색을 새 틱 경로에서 호출하지 않는다. 동적 등록·타이머·추가 physics owner 없음.

`native_features/auto_hp_potion.gd`: 기존 Potion.new와 advance_native 등록을 소유. order=100. Main.source_potion identity·Main 수명 유지. Main은 preload/멤버 초기화/physics 선두 호출 3곳만 교체. State·potion 계산·회복·자동사용 gate·피해·이동·패링·방패·docs/2_3 수정 없음. 등록 지점은 **틱 슬롯 1개**, 저장 수집은 미구현이다.

120fps 프레임 예산은 8.33ms이며 현재 시뮬레이션은 60Hz다. 목표를 달성한 측정 결과로 혼동하지 않는다. 신규 dispatch는 O(n)·사전 배열 순회, deferred queue 비용은 기존 기능 호출 1개와 동일한 예약 개수다. 부팅 비용은 프레임 예산에서 분리 측정한다. Callable dispatch 자체의 추가 비용은 남으므로 수용 전 PC 동일 머신·동일 seed·동일 구간 baseline/candidate 교차 실행으로 frame CPU p50/p95/p99·max·late tick·메모리·등록 수를 기록한다. capture I/O·디버그 snapshot은 측정 구간에서 제외한다. 8.33ms 초과 또는 baseline 회귀가 있으면 승인 보류. 이번 headless 검사는 성능 측정·실플레이 QA가 아니다.

## 이전 순서와 동작 불변 증명

1. 이번 자동 물약: 호출 인자, deferred 큐 삽입 위치, HP/mats/cd/통계/레슨·paused gate·중복 serial 불변을 검사한다. registry order/중복/동결과 direct-vs-dispatch trace 비교 및 기존 420사례 oracle/actual Main suite 사용.
2. 관찰 전용 sound consumer·HUD widget: 기존 signal 순서/횟수, node parent·layer·pause·teardown 비교. 하나씩 이전하고 기존 suite 및 화면 검수. 화면 PASS를 unit PASS로 대체하지 않는다.
3. Forge·skill/fusion UI/command 진입점: State writer는 그대로 둔 채 호출자부터 이전. 같은 seed·입력에 P/G/INV/PASSIVES/통계·request replay 결과·참조 identity 및 실패 전후 쓰기 수 비교.
4. 드랍·boss assembler 등 world-ready 설치: accepted 모듈만 이동. spawn/kill/event 순서와 lifecycle·scene 재시작·queued free 검증. 맵·전투 owner 변경은 별도 PC 작업.
5. PC가 State capability 추출 승인 후 저장 수집/복원: 기존 다섯 profile JSON 구조·필드 타입·undefined/null 차이·원순서 read/write trace·복구 실패 무변경 검사. save_globals 부재 HOLD를 우회하지 않음. combat registry는 마지막 별도 승인 단위.

매 단계 baseline commit과 candidate를 동일 고정 입력/난수/clock으로 실행하여 정확한 ordered event trace와 owner snapshot을 비교한다. float는 원래 표현이 같아야 하며 임의 tolerance로 회귀를 숨기지 않는다. baseline 출력→candidate 기대값 생성 금지, 원본 oracle 및 독립 기존 테스트 재사용. 한 단계 한 commit·docs·원격 복구 SHA 확보 후 PC 총괄이 병합한다.

## 검수 기록

결과는 아래 최종 검수 절에 추가한다. 로그: `~/exoduser-wt/_out/main-registry-design/`. 실행 userdir는 override.cfg로 격리하며 실제 EXODUSER-Godot-Native-First 사용 금지. override.cfg는 제출하지 않는다. PC 실행·실제 저장·PCK export·화면 QA·120fps 측정은 이번 범위 밖 미검증이다.

### 최종 검수 — 2026-10-21 Mac Godot 4.7.2

| 검사 | 결과·근거 |
|---|---|
| 신규 동작 불변 | test_main_registry.gd **13 checks / 0 failures**, exit0. direct legacy vs frozen dispatch의 인자·deferred 큐 순서 동일, 중복 ID/order 및 late 등록 거부, 실제 Main 부팅 전 registry/potion 생성, 잘못된 owner 무변경. registry.log |
| 기존 기능 회귀 | 수정하지 않은 test_demo11_25b_auto_potion.gd **2560 assertions / 0 failures**, 원본 game.html JS **420 cases**, exit0. 실제 Main 정상 intro/lesson→회복·gate·재호출 검사 포함. potion.log. 기존 Camera2D interpolation WARNING 1건, ERROR 0 |
| 환경·정적 검사 | import exit0/ERROR0. Godot 시작 전 프로세스 수가 2여서 각 30초 대기 후 import/신규 검사, 기존 회귀 시작 전 1 확인. 두 실행 모두 override.cfg의 격리 userdir guard 통과. 새 tick 함수는 사전 Callable 배열만 순회; 목록 생성은 boot/seal에만 존재. git diff --check 통과. State·player·world·docs/2_3 diff0 |
| 남은 승인·검수 | PC 총괄 승인·PC 실행·실제 저장/복원·화면·export resource inclusion·120fps 8.33ms 예산 실측 미완. 이 브랜치는 설계+최소 시제품이며 전 기능 registry 전환 완료가 아님 |

재현: 이 브랜치의 godot/override.cfg에 application/config/custom_user_dir_name을 신규 검사에서는 EXODUSER-main-registry-Isolated-20261021, 기존 suite에서는 EXODUSER-demo11-25b-Isolated-20261021로 설정한 뒤 Godot `--headless --path godot --script res://tests/test_main_registry.gd` 및 `--script res://tests/test_demo11_25b_auto_potion.gd -- --node-bin=<절대 Node 경로>` 실행. override는 로컬 전용이며 커밋하지 않는다. 동시 Godot 2 이상이면 30초 대기하고 대형 빌드/다른 QA와 중첩하지 않는다.
