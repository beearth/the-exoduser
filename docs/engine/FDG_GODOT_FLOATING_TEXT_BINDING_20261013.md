## 현재 ENGINE 연결 — 2026-10-14 숫자 atlas startup

기존 실제 World floating text adapter에 원 supplier를 장수명 child로 연결했다. 원 font preflight 후 deferred startup에서 `await bake_native()`를 한 번 실행하고 유효480×168 Texture2D만 기존 `supply_to(floating_text)`로 한 번 전달한다. texture는 adapter·baker·consumer가 유지하며 별도 text/native physics driver와 매frame bake는 0이다.

| 실제 경로 / 필드 | 결과 |
|---|---|
| 새 native startup | actual World→adapter→baker1/bake1/supply1→기존 numeric consumer. 새 고유1 FIRST PASS / 3.094918416초 / exit0·assert0·ERROR0·SCRIPT ERROR0 |
| headless startup | actual World→baker1/bake1/supply0·`unavailable_headless`·viewport0·gap true. 별도 새 고유1 FIRST PASS / 1.483481초. 이 결과를 native 렌더 성공으로 합치지 않음 |
| runtime texture | atlas480×168 / cell48×56 / rows3·digits10, constructor native fixture 요청640×360·actual root1280×720. 실제 World admission `123` crit row1→digit region48/96/144×56, 각각48×56 draw dispatch. native aging0·새 screenshot0 |
| lifecycle / snapshot | before/after await 실제 World/adapter/producer/baker parent·Tree·queued guard. `number_atlas_startup_status/bake_calls/supply_calls/supplier_live/runtime_texture_size/build_report/clock_owner` 추가. late completion은 교체된 backend에 전달하지 않음 |
| 경계 | 실제 native supply가 연결되었으므로 supplier 부재 gap과 구분한다. headless gap·원 Pirata font/baseline/crop/browser raster fidelity·본편 자연 피해숫자 caller·공개 pixels/최저240는 미완. 원 source6/미10·frozen shipping5/미11, 기존 numeric pool40/post3 clock 보존 |

두 실행의 각각 Camera interpolation warning1건은 실제 ledger에 별도로 보존했다. 정상 코드 검사에서 error는 없으며 기존 atlas9/105·8probe, Ctxt4·Cground3 등 기인수 성공 재실행0/원 PNG hash·copy·import0이다. startup 공급자의 새 UID는 actual Godot ResourceUID metadata1회로 생성했으며 코드 검사/asset import가 아니다. [정확한 새 SSOT](FDG_GODOT_NUMBER_ATLAS_BINDING_20261014.md)의 **VISUAL VERDICT: RETOUCH**를 유지한다.

---

# FDG Godot floating text 실제 World binding — 2026-10-13

현재 상태: **실제 World/HitFX 연결 및 고유 4그룹 PASS = 최초3 + 새 lifecycle1**이다. 부모 첫 fresh isolated stage에서 exit0 / 5.653511290999999초 / ERROR0 / assertion0을 확인했으며 당시 제품·검사 수리0/성공 재실행0이었다. 이후 읽기 전용 리뷰에서 발견한 backend lifecycle 경계를 수리하고 독립 새1만 첫 실행하여 exit0 / 5.107139167초 / ERROR0 / assertion0을 확인했다. 앞선 성공3은 재실행0이며 첫3 실패 수리라는 이력이 아니다. 기존 producer의 16고유/148검사 및 10 pixel probe는 동결된 별도 단위이며 이번 신규 검사 결과로 재사용하지 않는다. 숫자 아틀라스 원본은 여전히 없으며 전체 시각 판정은 **RETOUCH**이다.

## 1. 소유·정본·백업

| 항목 | 현재 범위 |
|---|---|
| worker 제품 | `godot/scripts/native_floating_text_adapter.gd` 신규 제작. 부모 실제 engine metadata `native_floating_text_adapter.gd.uid=uid://cwyr3fivvq60h` 공급 완료; worker 재생성0 |
| worker 검사 | `godot/tests/test_native_floating_text_binding.gd` 기존 성공3 본문 동결 및 독립 lifecycle 그룹1 추가, `--only=<group,...>` 지원; worker 실행/import 0 |
| worker 문서 | 이 정본과 외부 `dependency-floating-text-integration-first/worker/` receipt만 |
| 부모 제품 | `world.gd`, `native_projectile_hit_fx.gd`의 실제 adapter 설치/공개 caller/priority3 post 연결. worker 편집 0 |
| producer | `godot/port_modules/floating_text/producer.gd` 실제 재사용; 수정·기존 검사·probe 재실행 0. [기존 단위](FDG_GODOT_PORT_FLOATING_TEXT_FIRST_20261013.md)의 역사 본문은 동결 |
| 새 경로 초기 상태 | worker `before-write-owned-absence.json`: 새 adapter/uid/test/doc WORK 부재. HEAD 권위는 부모 `before-edit-receipt.json`: 신규 HEAD 없음 |
| 공용 백업 | 부모 `before-edit-receipt.json`의 World/HitFX WORK+HEAD bytes 보존. 이미 처음 저장된 adapter는 **post-first-save WORK backup**으로 명시되며 기존 제품 사전 백업이라고 표현하지 않는다 |
| 선행 | floating text 기존 정본과 producer API를 먼저 읽음. 맵 guide 1047행 및 §23 완독 retained 기준 적용. 원 source16/PNG/hash/기완료 proof 재조회 0 |
| UID 첫 metadata | 부모 `metadata-first/uid-first-receipt.json`: engine ResourceUID-only exit0 / .273894583초 / ERROR0 / import0 / test0. producer metadata `uid://bykv0ho4bwtpi`도 부모가 공급했으며 기존 producer 본문·검사 수리/재실행으로 계산하지 않음 |
| lifecycle 수리 백업 | `worker/lifecycle-repair/before-lifecycle-repair.json` 및 `0.work/1.work/2.work`에 당시 READY adapter/test/SSOT bytes 보존. 신규 lifecycle 검사 실행 전 source review이며 runtime FAIL로 기록하지 않음 |

## 2. 실제 공급과 API

| API / 책임 | 정확한 소비 |
|---|---|
| adapter `configure(world:Node2D)->bool` | World가 실제 Tree 안에 있는지, 필수 5getter/콜백, context schema/clock/budget, frame≥0, 실제 registry Array 및 기존 font를 자식 생성 전 확인. 성공 후 producer 하나를 자신의 자식으로 설치 |
| World `get_native_frame()->float` | 실제 priority−1 World clock 읽기. adapter에 새로운 global clock/물리 driver 없음 |
| World `get_native_world_identity()->Array` | 실제 ens reference. 동일 내용의 복사 Array는 실제 identity가 아님 |
| World `get_native_projectile_fx_context()->Dictionary` | `schema=exoduser.godot.native-projectile-fx-context.v1`, `clock_mode=godot_delta_native60`, `budget_scope=new_native_hit_fx_only` 유지. scoped 새 HitFX budget를 whole source 설정으로 승격하지 않음 |
| World `localize_native_text(value:Variant)->Variant` | 현행 ko identity. producer admission에서 값 Variant를 그대로 유지. 다른 언어·settings·원 `_T` 전체 조합 완료 주장은 없음 |
| World `get_native_text_font()->Font` | 기존 `res://assets/fonts/NotoSansKR.ttf` ResourceLoader 공급. 실제 Font 및 동일 resource_path를 preflight. 새 font/PNG 제작·copy·hash·import 0 |
| adapter `emit_native_text(x:float,y:float,text:Variant,color:Variant,life:Variant=null,size:Variant=null,num_str:Variant=null)->bool` | 실제 World 부모/Tree/context 확인 후 유한 x/y만 받음. 원 world position을 producer `to_local` **한 번** 적용한 뒤 원 producer `add_txt`에 7인자 전달 |
| adapter `advance_native_text(ticks:float,actual_frame:float,world_identity:Variant)->bool` | 실제 World frame/token/dt와 일치하고 frame 및 epoch가 마지막 성공보다 증가할 때만 `native_tick(ticks)` 한 번. SceneTree pause·중복·stale frame·잘못된 dt·복사 token은 pool 시간 변경 없이 false |
| adapter `get_snapshot()->Dictionary` | configured/ready/error, deep pool, live_count, next_slot, 마지막 frame/epoch, clock/emit rejection 수, 실제 producer counters, 실제 view/draw plan/trace/font status/NUM gap. 반환 pool 수정으로 제품 pool을 바꿀 수 없음 |
| backend readiness | actual producer parent가 adapter이고 Tree 안에 있으며 queued deletion이 아니어야 함. adapter 자체 queued deletion도 unready. 단순 object 유효성만으로 detached/reparented backend를 ready로 보고하지 않음 |
| 장수명 callback | localizer 대상은 실제 World Node; render 대상은 그 World 아래 adapter Node. 로컬 RefCounted Callable lifetime 문제를 사용하지 않음 |
| 배치 | adapter와 producer 모두 `z_as_relative=false`, `z_index=4002`로 기존 dark text 레이어 보존 |
| process | adapter의 자체 `_process`/자동 physics 없음. producer는 `PROCESS_MODE_ALWAYS`에서 원 `_process` redraw만 소비하여 pause 중에도 텍스트를 그릴 수 있음. renderer가 life clock을 추가하지 않음 |

## 3. 단일 admission·단일 post clock

| seam / 수치 | 현재 계약 |
|---|---|
| World startup | adapter를 World child로 먼저 추가 → configure → HitFX sink bind. 실패하면 부모 World startup ready를 허용하지 않음. 실제 Camera가 Main에서 뒤에 만들어져도 font/clock/context preflight는 가능 |
| HitFX `bind_native_floating_text_sink(add_txt:Callable,advance:Callable,snapshot:Callable)->bool` | 실제 부모 제품의 3 Callable binding. persistent bound 표시로 backend가 나중에 사라져도 legacy Label fallback/parallel pool을 새로 만들지 않음 |
| HitFX sink 원자성 | snapshot은 Dictionary이며 `ready`가 실제 bool true인 경우에만 bind. null/string ready를 안전하게 거부하고 partial sink state를 남기지 않음. 성공 재시도는 이전 binding error를 지움. 이 공용 수리는 부모 소유 |
| 일반 caller | World 공개 `emit_native_text(...)`가 adapter로 전달. 공개 `get_native_text_snapshot()`으로 실제 상태 읽기 |
| dark caller | 기존 target y−20 위치 → `(x,y,"💜다크볼!","#cc44ff",30,22,null)` 1회 sink 전달. 위임된 항목의 private `_texts` entry·Label 할당·private aging 0 |
| source 링 | 일반 `TXTS_MAX=40`; 41번째 admission은 slot0 덮어쓰기/next1. 빈 슬롯 채움과 source ring 순서는 producer가 유지. testbed120은 이번 정상 binding에서 지원한다고 주장하지 않음 |
| source default | falsy life→35, falsy size→0, falsy num_str→null. producer 원 truthiness 유지 |
| source 시간 | life>0일 때 `y-=.6*ticks` 다음 `life-=ticks`; 음수 overshoot를 clamp하지 않음. renderer/owner death/cancellation이 별도 시간이나 취소를 추가하지 않음 |
| 실제 post | priority3 HitFX 끝에서 actual context.dt_sp / World frame / ens token을 advance callback에 1회 공급. particles pre, 기존 projectile1, pending birth2와 별도 단계 |
| epoch | context `frame_reset_epoch` 실제 nonnegative 정수. 현재 실제 World update counter이며 adapter는 이를 새 reset scheduler로 정의하지 않음 |
| snapshot counter | `clock_calls`는 수락된 post 횟수. `clock_rejections`와 `emit_rejections`는 pool을 변경하지 않은 거부 요청 수. producer `native_ticks`는 실제 native_tick 호출 횟수 |
| HitFX snapshot `texts` | 기존 private legacy Label 슬롯 수를 유지하는 필드이며 generic pool 수가 아님. 실제 World dark fixture에서 0. standalone unbound old kernel fallback은 부모 제품에 보존하며 이번에 재검사하지 않음 |
| HitFX snapshot `floating_text_sink_bound` / `floating_text_sink_ready` / `floating_text_live_count` | 각각 persistent binding 여부 / 현재 실제 backend status.ready=true 및 3 Callable 유효 여부 / generic sink snapshot의 live_count. 나중의 non-Dictionary status도 안전하게 empty/unready로 처리. generic pool 진단을 기존 `texts` 필드로 덮어쓰지 않음 |
| HitFX metrics 새 4키 | `text_sink_emits`=dark sink가 수락한 전달 수, `text_sink_rejections`=dark sink 거절 수, `text_sink_clock_calls`=post clock 수락 수, `text_sink_clock_rejections`=post clock 거절 수. generic World direct admission은 dark 전달 지표와 별개 |

## 4. 실제 view·glyph·번호 자원 경계

| 항목 | 실제 계약 / 미완 |
|---|---|
| draw 공간 | source world admission과 실제 Camera centre 둘 다 동일 producer child-local로 변환. translated constructor World 첫 검사에서 단일 변환 및 camera centre4020/7420 확인 |
| logical view | 실제 viewport rect 크기 ÷ actual Camera2D.zoom의 x/y. 양축 zoom>0 / 유한 값 필수. Camera 미준비 때 render context `{}` / `render_context_ready=false`; 가짜 camera/view 값 공급 없음 |
| view flags | `float_text_enabled`, `battle_test_active→bt_active`, `hi_fps`는 실제 World context 그대로. 정상 battle_test_active=false |
| cull | source pad200 / hiFPS120은 producer 그대로. admission을 거리 cull로 막지 않음 |
| whitelist | 일반 문자열에서 `시전,그로기,무적,CRIT,사망,탈출,✟,🌋`만 draw; num_str 존재는 source 예외. `경직!`·dark text는 정상 플레이에서 pool admission 후 draw 제외될 수 있음 |
| 일반 glyph | producer 실제 font900/Noto Sans KR, source 8 black offsets+white fill; stored caller color는 일반 glyph색에 사용되지 않는 원 계약 유지. baseline/AA/source canvas 비교는 별도 RETOUCH |
| 숫자 branch | size≥28 +num_str, 실제 producer num_atlas 경로. 원 atlas480×168 / cell48×56 / 10digit×3row가 **미공급**이므로 `number_atlas_gap=true`, status absent, 원 숫자 glyph 완료 주장 없음. ROOT의 별도 `godot/port_modules/number_atlas` 소유 예약/제작은 이 binding에 아직 연결되지 않았으며 현재 gap을 완료로 바꾸지 않음 |
| 진단 | draw plan은 순수 source 계획이며 실제 픽셀 증거가 아님. get_snapshot에 계획을 포함해도 renderer native clock이 진행하지 않음 |

## 5. 신규 검사·실행 ledger

부모 첫 fresh stage 실행의 **3 PASS / FAIL0 / 미완료0**와 이후 독립 lifecycle **새1 FIRST PASS / FAIL0 / 미완료0**를 합쳐 **고유4 PASS**로 동결한다. 최초 권위는 외부 `tests/attempt-01-receipt.json` 및 `attempt-01-observations.json`이며 raw log는 `tests/attempt-01.log`로 보존한다. 후속 권위는 `tests/attempt-02-new-lifecycle-only-receipt.json` 및 observations 파일이다. 최초3 당시 제품·검사 수리0이고 그 후 source review의 새 경계 제품 수리는 별도이며 runtime 실패·fixture 수리0이다. 앞선 성공3 및 옛 suite 반복0, 별도 구문검사·editor import·Main·GUI 실행0이다.

| 새 그룹 | 독립 실제 관측 / 범위 | 상태 |
|---|---|---|
| `generic_admission_view_and_number_gap` | actual World + actual combat.json Player + translated constructor World + Camera zoom2. World 공개44 admission→실제40ring/ko Variant/단일 local 변환/실제 logical view960×540 및 centre4020/7420/bt_active=false/정상 whitelist 및 cull/NUM gap/deep snapshot 확인. 이 그룹 자동 native ticks0 | FIRST PASS |
| `dark_event_single_pool_actual_post_clock` | actual World 공개 dark hitFX 요청→generic admission1/private entry0/Label0. 실제 automatic16 native ticks / post16회로 life30→14 및 y−9.6 계약 확인. 자연 적 피격이나 픽셀 검수로 주장하지 않음 | FIRST PASS |
| `clock_identity_pause_and_atomic_preflight` | missing-font/120pool World-subclass 생성자 provider preflight의 child0 거부. actual World priority2/3의9 frame에서 copied ens/stale frame/wrong dt·post 뒤 중복 거부, 그리고 paused 요청1을 포함한 거부37회. 실제 pause4 physics signal 동안 pool/frame/clock 유지 | FIRST PASS |
| `backend_lifecycle_and_sink_atomicity` | actual World 생성자와 새 unbound HitFX의 null/string ready 원자 거부→같은 helper의 actual adapter 재bind/error clear. 생성자 provider의 later non-Dictionary payload 안전 처리. actual installed producer remove/reparent/queue_free 및 adapter queue_free 4case 모두 public ready=false/emit=false/기존 pool 불변/sink actualready=false/legacy Label0 확인. 새 helper Tree 추가0/자동 native ticks0 | 독립 새1 FIRST PASS |
| fixture 경계 | 런타임 HP/position/AI/private timer/globalclock setter0. 실제 Player 초기 위치와 World translation·Camera zoom은 생성자 context만. InputMap action 등록은 headless bootstrap이며 공개 input 증거가 아님 | 유지 |
| 실행 계수 | 부모 runtime1 / worker runtime·import0; explicit World/Player physics0; renderer `_draw` 직접호출0. 총 SceneTree physics signal 관측30은 여러 fixture와 pause4를 포함하며 전부 active World frame이라는 주장이 아님. dark16과 clock-probe9는 별도 actual active 관측 | 첫 결과 동결 |
| 옛 단위 | producer16/148+10probe, SOUND15, 기존 kernel/type3/source16/배송 성공 검사를 이번 검사로 재실행하거나 합산하지 않음 | 동결 |

| 첫 실행 ledger | 실제값 |
|---|---|
| backend / 경로 | 부모 `dependency-floating-text-integration-first/isolated-editor/Godot.app/Contents/MacOS/Godot --headless --path stage/godot --script res://tests/test_native_floating_text_binding.gd` |
| duration / 결과 | 5.653511290999999초, exit0, 유효 완료3/PASS3/assertion0/ERROR0 |
| 수정·반복 | 제품 수리0 / fixture 수리0 / 후속 실행0 / 옛 suite replay0 / editor import0 / Main·GUI0 |
| 상태 주입 | runtime HP/position/AI/private timer/globalclock setter0. 생성자 context 및 actual method/automatic physics 관측이며 공개 자연 플레이·픽셀·성능 증거가 아님 |

| 새 lifecycle 실행 ledger | 실제값 |
|---|---|
| 선택 | 동일 fresh stage에서 `--only=backend_lifecycle_and_sink_atomicity`만 실행; 앞선3 replay0 |
| duration / 결과 | 5.107139167초, exit0, 새 유효 완료1/PASS1/assertion0/ERROR0 |
| lifecycle 관측 | remove_producer / reparent_producer / queue_producer / queue_adapter의 4case 모두 pool unchanged / ready=false / sink_bound=true / sink_ready=false / legacy_labels0 |
| 공급 경계 | null(TYPE_NIL0)/string(TYPE_STRING4) ready를 원자 거부한 helper의 actual adapter 재시도 성공. later non-Dictionary status 안전 처리 확인 |
| 계수 | 자동 native ticks0 / 새 helper Tree add0 / explicit World·Player physics0 / `_draw` 직접 호출0 / clock 거부 요청0. SceneTree signal1은 active World tick 증거가 아님 |
| 반복·수리 | 앞선 성공3·옛 suite·import·Main·GUI 재실행0. 실행 중 제품·fixture 수리0이며 사전 source review 새 boundary 수리와 구분 |

### 후속 lifecycle 리뷰와 독립 검사

읽기 전용 리뷰에서 detached/reparented/queued producer도 object가 유효하다는 이유만으로 ready였던 경계를 발견했다. adapter queued deletion도 같은 문제였다. adapter `_binding_ready`의 실제 parent/Tree/queued 상태 확인만 추가하고 admission·native clock·producer 본문을 바꾸지 않았다. 부모는 HitFX의 typed bool-ready preflight와 actualstatus/3callable readiness를 수리했다. 이 리뷰는 제품의 실제 새 수리이며 첫3 실행에서 runtime 실패가 있었다는 의미가 아니다.

`worker/lifecycle-repair/readonly-review-and-new-group-ready.json` 및 두 소유 diff에 원인·수리·기존 성공3 함수 본문 byte equality를 기록했다. 부모는 `--only=backend_lifecycle_and_sink_atomicity`로 새 그룹1만 첫 실행하여 PASS했다. 기존 첫3 PASS·첫5.653511290999999초·16dark/9clock 관측은 그대로 동결하며 4개 모두를 같은 실행/같은 source 검수 이력으로 합치지 않는다.

## 6. 문서 동기화·남은 소비

새 코드 후 docs 전체 관련 keyword `rg`와 literal recursive `grep`를 외부 worker 로그에 저장했다. 최초 두 검색 모두 exit0 / 각각97matches·29paths이며 `worker/docs-search-receipt.json`에 기록했다. lifecycle 코드 수리 뒤 다시 두 검색 모두 exit0 / 각각107matches·30paths를 `worker/lifecycle-repair/docs-search-receipt.json`에 기록했다. 관련 공용 문서 및 부모 소유 source status는 부모가 갱신한다. 보호2_3/원 assets/기존 producer·역사 proof는 변경하지 않는다. CODE+docs 정상 checkpoint는 부모가 담당하며 실제 성공 전 commit 완료로 표시하지 않는다.

남은 단계는 공개 교전에서 glyph/레이어/Camera 비교와 원 숫자 아틀라스 공급·소스 비교다. source 지원6/미10 및 frozen Web/Windows5/미11은 이 floating text 추가로 증가하지 않는다. 다른 addTxt caller 전체 연결·다국어·global budget/room reset/testbed120·최저 Windows1080p240 달성을 주장하지 않는다.

## 23. MAP PRODUCTION REPORT

| 항목 | 판정 |
|---|---|
| MASTER PLAN / 원 geometry·배치 | 기존 canonical map 그대로. 새 map/terrain/nav/배치 제작0 |
| PLAYABLE/COMBAT | actual World caller와 post clock 연결, 최초 fixture3 및 별도 새 lifecycle1 고유4 PASS. 공개 자연 교전 glyph 비교 미검수 |
| CAMERA QA | 실제 Camera/viewport/zoom 및 translated constructor 계약 첫 PASS. 공개 픽셀 판정으로 승격0 |
| TECH QA | 고유4 PASS=최초3+읽기 source review의 새 boundary 수리 후 독립 새1 FIRST PASS. 기존 성공 재실행0. 기존 semantic/pixel 성공을 이번 새 binding의 PASS로 재수입하지 않음 |
| 자원 | 기존 font/producer만 실제 재사용. 원 number atlas gap 유지. 새 PNG/font/copy/hash/import0 |
| VISUAL VERDICT | **RETOUCH** — 실제 public gameplay/canvas 비교/번호 glyph/AA 미검수. 240FPS는 목표이며 실측 달성 주장 없음 |
