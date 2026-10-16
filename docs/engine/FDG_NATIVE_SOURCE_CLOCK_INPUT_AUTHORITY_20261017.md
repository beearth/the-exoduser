# Source clock 선언 소유·실제 렌더 입력 연결 — 2026-10-17

상태: source 선언과 현재 native render 입력을 받는 부분만 연결했다. source frame-entry/body/누적 시간/전체 update 반환은 미연결이며, 실제 파이어볼 시간과 발사는 계속 NOT_READY다.

| 항목 / id | 정확 현재 계약 |
|---|---|
| 원 module | godot/port_modules/source_update_clock_prefix/producer.gd. 외부 v2 12722B SHA256 52e1ec05a19ee2f0c02bc7c4c2a320061504c5072c8d20333ec4eb8ca6825f6e와 동일 byte. v1 8ec는 채택하지 않았다. |
| schema / source 근거 | exoduser.godot.source-update-clock-prefix.v2. 원 cached source hash는 NOT_RECORDED. 원 선언60463 / render_front61848 / hitstop32594 / sp32680대 / scheduler61875 위치를 서로 대체하지 않는다. module 첫 주석의 candidate/pure 표현은 원 산출물 이력이며 전체 게임 준비를 뜻하지 않는다. |
| 원 수치 | 선언 dt_sp=1, render reset=1, hitstop dt=0.04, hitstop cap=12, slowMo 계수0.35, PHYS_STEP=1000/60ms. 이 수치는 원 module의 선언/산술이며 현재 실제 게임 clock의 관측값·fallback이 아니다. |
| 실제 owner | Services._source_update_clock에 같은 원 producer instance를 보유한다. configure에서 sample-global 초기화 뒤/OPT 구성 전에 _initialize_source_update_clock()를 호출해 declare_dt_sp()를 1회 소비한다. |
| 선언 수명 | _source_clock_declared_once=false→성공 후 true. 같은 Services 수명 중 재선언/owner 손실 후 자동 생성은 거절. discard가 owner를 해제해도 이 flag를 되돌리지 않는다. 선언 후 실패한 Services의 같은 clock 재생성도 거절하며 새 전체 초기화/복구 flow를 추가하지 않았다. |
| 입력 상태 | _source_clock_input_serial=0, _source_clock_input_timestamp_ms=null. 실제 수락한 native render 입력만 갱신한다. source _now/_acc/_gameTime/_gcT가 아니다. |
| 실제 caller | Main._process: 기존 platform capture → 신규 _advance_native_source_clock_input → 기존 audio/Q body. 입력 window는 이 동기 호출 동안만 열고 닫는다. |
| 실제 입력 API | Services.capture_native_source_render_input(caller:Node,input:Dictionary)->bool. 같은 weak Main/현재 Services, 열린 Main input window, 새 int serial, 지원 numeric timestamp/String scope, 실제 Main 현재 raw reader의 serial/timestamp 일치, 기존 source context 수명을 확인한다. true는 raw 입력 수락만 의미한다. |
| window API | Main.is_native_source_clock_input_phase(caller:RefCounted,serial:int)->bool. 같은 현재 Services·현재 native serial·실 window만 허용. 닫힌 호출 구간 또는 지난 serial은 current source callback 증거가 아니다. |
| context 수명 | 기존 Services._context_error에 더해 Main.source_initialization_services==self 및 같은 prefix script를 확인한다. 기존 source context/lifecycle 검증을 바꾸거나 default G/always-ready를 설치하지 않는다. |
| 진단 API | Main.get_native_source_clock_input_snapshot()→Services.read_source_clock_input_snapshot(Main). ready=false/source_clock_ready=false이며 source 선언 read_dt_sp, prefix history와 마지막 수락 raw serial/timestamp만 진단한다. history는 현재 sp 권위가 아니다. |
| 실제 World 소비 API | World.read_native_source_player_projectile_context()→같은 Main.read_native_source_player_projectile_context(World)→현재 Services.read_current_source_projectile_context(World). 실제 Main/World/caller/source context 수명 필수. |
| 현 clock 응답 | source_frame_entry_owner_unbound로 ready=false, sp_published=false/source_update_returned=false. sp/dt_sp/native_epoch를 임의로 만들지 않는다. 선언1/input accepted를 gameplay sp1로 전달하지 않는다. |
| 기존 flight caller | Main.read_native_fireball_flight_dependencies는 이 World 공개 API를 발견하지만 ready=false이므로 clock dependency NR을 유지한다. 새 source update/MP 비용/실발사 경로를 열지 않는다. |
| manifest | source_clock_input_authority는 실제 Services 현재 진단이며 platform_frame_input과 별도다. content_parity/latest_full_game 완료로 승격하지 않는다. |

## 원 module 중 이번에 실행하지 않는 단계

| 구분 | 원 공개 계약 / 현재 경계 |
|---|---|
| render_front | 원 _dtSp=1 및 imp/txt owner_writes. 실제 원 위치 선행 body가 없어 호출하지 않는다. |
| update | begin_update/current G, system_lesson→g_on→parry_lesson→editor→panel_inputs_gap→paused→body_gap_to_hitstop→hitstop→gap_hitstop_to_sp→sp→end_update. 현재 실제 frame/controller/body owner를 건너뛰어 호출하지 않는다. |
| writer | owner_writes는 계산 요청이지 실제 G 적용이 아니다. 이번 단위 source G/P/HP/MP write0. |
| scheduler | sched_should_step/before_update/after_update는 원 ms 산술 계약이다. native delta/physics60/epoch와 별칭하지 않고 실제 전체 update 반환 없이 acc 소비/didUpdate 완료로 세지 않는다. |
| 후속 frame entry | 아직 채택하지 않았다. 외부 후보의 synthetic scope/token/gap/witness는 실제 Main source callback 권위가 아니다. 원 prefix instance를 중복 생성하거나 선언으로 runtime gap을 채우지 않는다. |

## 새 영향 검수

| 항목 | 관측 및 한계 |
|---|---|
| 첫 실행 | Godot 4.7.2 새 격리 SceneTree 실제 Main._process callback으로16 checks PASS / exit0 / stdout·Godot log ERROR/WARN/leak0. 제품·fixture 실패수리/재실행0. |
| 새 범위 | 원 module 실제 copy/Services 선언 hook/같은 callback serial·timestamp 수락, callback window 종료 후 재사용 거절, Services 교체/원 context 손실/owner 철회/재선언 거절, World의 clock NR 유지. render_front/begin/sp/after 선행 호출0을 확인했다. |
| fixture 경계 | 새 Services/Main/World 메서드 정확 추출과 실제 prefix v2/실 엔진 callback. 기존 Services._context_error와 audio/Q 의존은 명시 fixture 대역이다. 실제 SourceState ready/currentG나 전체 Services.configure/Main scene 실행 증거가 아니다. |
| 구 검사 | 플랫폼12/외부 prefix38·9/ENEMY22/다른 suite 재연0. 이번16을 source/game 전체 동등 개수로 합산하지 않는다. |
| 사전 보존 | 최초 I/R exact10의 분리 INDEX/WORK/UNTRACKED·realparent/nonlink·WORK/HEAD 개별 copy 시각→manifest→first code/각write. 코드 후 docs 검색에서5 관련문서 추가발견→그5 사전보존·extension manifest→각 doc write. 최종15이며 추가5를 첫 code 전이라고 소급하지 않는다. |
| 배포/사용량 | main/R/served/원 이미지·음원·import/save/UI 변경0. 시작 공유 주간 누적40%/일간 미상, 종료는 별도 receipt. source clock·최신 게임·실제 발사 완료 아님. |
