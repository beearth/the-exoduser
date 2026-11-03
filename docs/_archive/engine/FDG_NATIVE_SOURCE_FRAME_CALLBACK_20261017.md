# Native source-frame callback 실제 소비 — 2026-10-17

| 항목 | 정확 현재 코드 계약 |
|---|---|
| module | godot/port_modules/source_frame_entry/producer.gd, 원 v3 18138B SHA256 af7252a174a34a050e7cb01d8fdc8157b42b0664d233021ae9bb0d7f7ee0fab0 동일 byte. schema exoduser.godot.source-frame-entry.v3. 원 source game hash는 NOT_RECORDED. |
| 같은 owner | Services._source_frame_entry:RefCounted가 같은 private _source_update_clock(prefix v2 52e1ec05)을 configure 주입받는다. 별도 prefix/clock을 만들지 않는다. Frame.declare의 dt_sp 진단은 prefix_already_declared다. |
| 선언 수명 | _source_frame_declared_once false→성공true, same Services 수명 중 재구성/철회 뒤 재선언 거절. discard는 active token과 Frame을 해제하지만 once를 되돌리지 않는다. |
| source literal | Frame의 now/acc/prev_ts/game_time=0. module의 clamp max50/min0과 prefix PHYS_STEP1000/60ms를 보존한다. 미상 lastLoopTs/fpsCapInterval/didUpdate 초기 선언은 미상이며, 실제 callback fpsCap0 분기에서 lastLoopTs가 할당된 것과 구별한다. |
| 실제 호출 위치 | Main._process의 platform capture→현재 Services input admission window→Frame native callback→window 종료→기존 audio/Q. 실제 Main/current source_initialization_services·weak Main/World/Services/prefix·새 serial/실 raw timestamp를 기존 authority가 재검증한 동기 경로다. |
| 호출 ID | native-main-process/Main ObjectID/Services ObjectID/native render serial 형태의 opaque String. ObjectID 부호는 의미 없으며 시간/physics/gc 값이 아니다. 같은 Services의 엄격히 증가한 입력 serial만 발급되므로 지난 ID를 다시 발급하지 않는다. |
| 실제 토큰 검증 | Services.is_native_source_frame_callback_current(caller:Node,callback_id:Variant)->bool. String/current active ID·같은 Main/current Services·열린 input window·현재 serial/실 timestamp와 같은 prefix/Frame 수명·identity를 확인한다. |
| 별도 입력 계약 | scope=SOURCE_NATIVE_RENDER_CALLBACK, timestamp=numeric, callback_token=같은 begin_frame String ID, clock_domain=godot_engine_monotonic_milliseconds. actual wrapper가 검증한 현재 native-port invocation이다. browser RAF를 실행했다고 주장하지 않는다. |
| raw 보존 | 기존 LAST_NATIVE_PLATFORM_RENDER_INPUT_ONLY packet은 수정하지 않는다. 같은 동기 window의 실제 소유자가 새 native context를 별도로 만든다. 마지막 진단 sample의 scope를 교체한 것이 아니다. |
| 시간 fallback | Main.read_native_source_frame_monotonic_now(caller:RefCounted,serial:int)->Variant는 같은 live input window에서만 Time.get_ticks_usec()/1000.0을 읽는다. 실제 timestamp가0일 때만 이 값을 performance_now로 제공한다. Date.now/상수0·1 대체 없음. |
| 실제 원 순서 | begin_frame(ID)→native phase_timestamp(context)→실제 Services.read_current_options의 phase_fps_cap→phase_gap_frame_callbacks(null). 원 순서를 앞당기지 않으며 다른 단계는 실행하지 않는다. |
| 최초 callback 전 | source_native_callback_not_entered NR. configure/declare만으로 actual frame 입력이 실행됐다고 표시하지 않는다. |
| 첫 NR | actual source frame resets/_sfxFrameReset/패드/profiling owner가 없어 gap_frame_callbacks에서 PARTIAL_NOT_READY / owner_gap_no_receipt. 적용 timestamp/fps_cap/lastLoopTs prefix는 보존한다. 기존 audio/Q를 해당 source body 완료로 인정하지 않는다. |
| 종료/재사용 | Frame.end_frame은 invocation 상태만 닫고 active callback flag=false/active ID 빈 문자열로 폐기한다. 역사 last ID와 pure module의 last_token은 진단/중복거절 이력으로 남으며 현재 권한이 아니다. wrapper는 inactive·다른 current ID·지난 serial을 거절한다. |
| identity | Frame script와 private injected _prefix가 같은 Services의 현재 prefix인지 검증한다. module 손실/다른 prefix/Services 교체/current source context 손실은 NR이고 자동 재생성하지 않는다. |
| World/manifest | 기존 실제 World→Main→Services reader는 현재 first_unowned_phase와 NR을 읽는다. source_clock_ready=false/sp_published=false/source_update_returned=false, sp/dt/native_epoch payload 없음. configure/declare/is_ready나 timestamp 소비를 게임 clock 준비로 승격하지 않는다. |

## 적용되지 않은 source 단계

| 범위 | 현재 상태 |
|---|---|
| gap 뒤 | prev_ts 초기화/visibility/raw frameTime/clamp/testbed/framepause/adaptive/render_front/scheduler는 이번 actual flow에서 미도달. literal source carrier acc/game_time/prev_ts는0, frame_time=null, did_update_set_this_frame=false 유지. |
| prefix | render_front/begin_update/sp/after 호출 없음. dt_sp writer는 declaration_60463 그대로이며 G/P/HP/MP·gc write0. |
| 전체 반환 | end_frame은 순수 invocation을 닫는 것일 뿐 source 전체 frame/update 반환·unknown body 완료·acc 소비의 witness가 아니다. |
| source 선언 확인 | 실제 현재 OPT fpsCap0으로 원 fpsCap 단계가 진행됐으므로 추가 R _lastLoopTs/_fpsCapInterval 선언 조사는 하지 않았다. |

## 새 영향 검수

| 항목 | 관측 및 한계 |
|---|---|
| 첫 실행 | Godot4.7.2 새 격리 SceneTree actual Main._process callback16 checks PASS/exit0/두 로그 ERROR/WARN/leak0. 수리·재실행0/원14·16·35·8·9·38·22 재연0. |
| 실제 모듈 | 원 Frame v3/prefix v2와 실제 SourceOptions holder의 initialize_source_boot(false)→CURRENT_PRE_RESTORE를 사용했다. fpsCap0은 그 owned current reference에서 읽었으며 fixture 숫자dict로 대체하지 않았다. |
| actual 입증 | 같은 prefix identity/중복선언0, 실제 시간·ID 소비, active callback에서 ID 유효/monotonic read 가능, 종료 뒤 폐기·직접 replay 거절·새ID 실행 중 과거ID 거절, 첫 NR prefix, source carrier/SP 미진행, World NR/Frame 철회 거절. |
| fixture 전제 | Services._context_error는 명시 observer/stand-in이며 full SourceState/Services.configure/Main scene 실행 증거가 아니다. 기존 audio/Q는 대역. token 관측은 이 mock context에서 실제 wrapper 메서드를 호출한 것이다. |
| 미검수 | 실제 timestamp0 wrapper 분기 자체는 실행하지 않았다(동기 window의 실제 monotonic reader는 관측). unexpected GDScript throw 후 window 종료·모든 actual body/fullclock/가청/실발사/시각/성능 미증명. |
| 사전 보존 | 최초 I/R10경로 분리 INDEX/WORK/UNTRACKED·realparent/nonlink·WORK/HEAD copy 개별시각→manifest, firstwrite 전 metadata를 fresh확인했다. source code 후 docs 검색으로5문서 추가발견→그5 사전보존·extension→각docwrite. 최종15이며 모든15가첫code前이라고 소급하지 않는다. |
| 사용량 | prewrite의41%는 직전 계정 관측 재사용으로 이 단위 시작 직접조회가 아니다. 시작값 미직접관측/일간 소비 미상이며 종료를 별도 receipt에 기록한다. 전용 소비로 귀속하지 않는다. |
| 배포 | main/R/served·원 asset/audio/import/save/UI 변경0. 최신 전체게임·실제 clock/발사 준비 인수 아님. |
