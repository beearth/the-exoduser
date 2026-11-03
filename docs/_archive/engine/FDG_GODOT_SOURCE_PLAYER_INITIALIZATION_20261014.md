# 실제 source applyStats 초기화 dispatcher — 2026-10-14

<!-- SOURCE_PLAYER_INITIALIZATION_ADAPTER_API_BEGIN -->
## Adapter API

`godot/scripts/native_source_player_initialization.gd`의 `ExoduserNativeSourcePlayerInitialization`는 원 applyStats의 서로 끼워 넣어야 하는 쓰기를 **새 실제 Player의 Tree 진입 전에 수동 1회** 연결하는 `RefCounted`다. 원 Health/DEFspeed/ShieldPoise/effective5/ResourceParameters producer와 실제 State/Authority sink를 사용한다. 수식·기본값·자동 physics·공용 Player/State/Authority 코드·restore·save는 이 dispatcher가 소유하지 않는다.

| 공개 API | 정확 계약 |
|---|---|
| `configure(player:Node2D,world:Node,state:Node,resources:Node,services:Dictionary)->bool` | 실제 동일 owner/script·preTree·service/helper/provider callback liveness 및 source readiness 검증 후 원 helper5의 public configure를 결합한다. sink/capture bridge는 WeakRef owner를 사용한다. 필수 callback·원 cached Health consumer가 없으면 NOT_READY이며 계산/actor 쓰기 0. |
| `initialize_new_run()->Dictionary` | 수동 최초 1회. upstream 입장 실패는 actor 쓰기 0. 입장 후 attempt_id=1을 예약하고 captured plans/cohort·각 원 phase·단일 write sink를 순서대로 소비한다. 이후 source error/sink false는 후단을 중단하며 이미 적용한 prefix는 rollback하지 않는다. 같은 actor의 두 번째 시도·재진입·live Tree actor 초기화는 거절한다. |
| `get_native_source_initialization_player()->Node2D` / `get_native_source_initialization_world()->Node` | configure 성공한 같은 실제 참조. 완료 전 preTree ownership, 완료 후 canonical Main의 Player/World 형제 sameTree + World.player + State/Resources World 자식 placement를 읽기 전용 검증한다. null/freed/queued/reparent/lost identity는 null. 완료 뒤 Tree 설치는 새 write 권한이 아니다. |
| `is_native_source_initialization_active()->bool` | 단1회 실행 중·미완료·실제 동일 owner·unparented preTree actor·비일시정지일 때만 true. source 초기화 command sink의 동기 guard이며 clock/timer setter가 아니다. 실제 actor를 부모에 붙인 뒤나 ready actor에 대한 재초기화 권한은 없다. |
| `get_native_source_initialization_write_tag()->Dictionary` | 승인 원 write sink **호출 중에만** `{field,source,kind,pass_id}`. source는 원 write.source, kind는 원 packet.kind. 원 HP/DSP packet.pass_id는 그대로, pass_id가 없는 원 packet은 **packet 수정 없이 tag만** attempt binding id1 사용. 그외 `{}`. |
| `get_native_source_initialization_completion()->Dictionary` | `{completed,owner_identity_valid,attempt_id,committed_writes,source_anchor_order_complete,main_full_ready:false}`. 완료 사실과 현재 물리적 ownership을 함께 제공하는 readonly receipt. |
| `read_captured_resource_plan()->Variant` | 현재 실제 초기화 중에 이미 1회 계산한 원 Resource plan의 deep copy, 없거나 비활성이면 null. 추가 plan 호출 0. |
| `read_captured_crystal_stats()->Variant` | 실제 `P._crystalStats@28600`가 같은 captured plan 값으로 쓰인 뒤에만 `{status:'READY',value:actual P._crystalStats,stage:'actual_source_28600:cohort:<id>'}`. 계획값만으로 current를 만들지 않는다. |
| `read_captured_cohort()` / `read_current_initialization_cohort_id()` | 실제 활성 prefix cohort deep copy / id, 그외 null. actual context id/authority/current_main은 서비스가 명시 제공해야 하며 private fixture를 actual Main으로 승격하지 않는다. |
| `read_hp_initial_gap()->Dictionary` | 원 DSP `HpInitialGapSeam.read()` 결과. actual mhp28582를 쓰고 gap을 연 동안만 READY; hpR28592 전에 close한다. gap 밖은 NOT_READY. 공개 open/setter는 없다. |
| `get_snapshot()->Dictionary` | 마지막 실제 trace/results/cohort, capture 횟수·소진 resource indices·실제 committed write count·completion·오류/잔여. state/HP/position/clock 조작은 없다. |

| services 키 | 실제 공급 계약 |
|---|---|
| `schema` | `exoduser.godot.source-player-initialization-services.v1` |
| helper5 | `health/defense_speed/shield_poise/effective_stats/resource_parameters`는 각각 원 `player_*_source/producer.gd` script의 실제 instance. 사본 공식이나 fixture subclass alias를 사용하지 않는다. |
| `provider_maps` | helper5 이름별 원 public configure provider Dictionary. current P/G/STATS/PASSIVES/INV·실제 OPT→diff_signed·eq_affix/eq_implicit·lv_b/grit/crystal 등을 명시 공급한다. dispatcher는 같은 pass의 resource_plan/crystal_stats/cohort/current_cohort/hp_mhp_28582만 자신의 weak capture/gap bridge로 대체한다. |
| `cohort_context` | 인자0 Callable→`{cohort_id:nonempty String|int,authority:nonempty String,current_main:bool}`. 실제 prefix context이며 기본/fake Main flag를 만들지 않는다. |
| `source_ready` | 인자0 Callable→정확 bool true. 필수 source domain/생산자/실제 sink binding 완료 witness. 누락·false는 계산/대입 전에 거절. |
| `write_sink` | 인자2 Callable(`original_packet:Dictionary,write_index:int`)->정확 bool. 실제 State packet/index 검증 endpoint가 actor fields를 Player endpoint, 자원6을 실제 Authority, 나머지를 owned P로 위임한다. packet.kind/source/writes/before/pass/cohort를 그대로 전달하며 write tag 밖의 임의 setter는 사용하지 않는다. |
| `invalidate_sink` | 인자1 Callable(`original Resource.invalidate_packet()`)->정확 bool. 원 `game.html:16934` / kind=`invalidate_eq_caches` / targets=`_eqAffixCache,_eqStatCache` / writes=[]를 실제 같은 원 affix/reference 캐시에 1회 소비한다. 이후 원 `plan_recalc_st`가 fresh current/cache를 읽는다. |
| `attack_early_plan` | 인자0 실제 Root 공개 producer Callable→READY/ready=true/packet. packet.kind=`apply_stats_base_attack_early`, packet.source=`game.html:28587-28588`, 원 baseAtk write1/source=`game.html:28588`. SourceServices metadata adapter는 원 값의 계산/형변환을 추가하지 않는다. |
| `attack_crystal_plan` | 인자0 실제 Root 공개 producer Callable→READY/ready=true/packet. kind=`apply_stats_base_attack_crystal`, packet+write source=`game.html:28602`, baseAtk write1. 누락을 0/없음으로 치환하지 않는다. |

| 원 anchor 쓰기 순서 | 실제 dispatcher 소비 |
|---|---|
| prefix→28570 | actual STATS prefix snapshot → Health.plan_initial 1회 + Resource.plan_apply_stats 1회 → 같은 cohort로 원 effective5.run_effective_stats 1회, fresh `_effStats` 저장. 추가 HP/resource plan 0. |
| 28582→28592 | 원 `Health.run_captured_initial(plan)` public consumer → Health write0 mhp28582 → 실제 gap open → DSP EARLY run. DSP sink의 첫 baseDef28583 뒤 **poise28584/28585/28586 → ATK28588**을 넣고 speed28589/_oocSpeed28590를 이어 쓴다. gap close → captured Resource stR28591 → Health write1 hpR28592. |
| 28593→28600 | captured Resource mmp28593 → mpR28594 → 같은 단1회 공통 `_crystalStats`28600. |
| 28601→28605 | 원 Health crystal MHP/hp28601 → Root ATK crystal28602 → DSP crystal baseDef28603/speed28604 → Health crystal hpR28605. |
| 28606→28614 | 같은 captured Resource mpR28606 → stR28607 → mmp/mp28608 → 원 조건부 mmp/mp/mpR28611 → 원 조건부 stR28614. 조건부 write가 없는 것을 새로 만들지 않는다. |
| 28617→28623 | 원 Health fortify28617(원 no_write도 정상) → DSP armor28620(no_write도 정상) → 원 Shield mshield28622/shield28623. |
| 28624→16939 | 원 Resource.run_recalc_st만 호출: 실제 invalidate16934 → fresh 원 plan_recalc_st → mst/st16939. 이때 captured Resource applyStats writes가 모두 정확1회 소진됐는지 검사한다. |

| guard / 인수 경계 | 현재 상태 |
|---|---|
| source packet | 원 packet과 write index를 함께 전달한다. Health before_present/before와 pass_id, effective cohort id, 각 write.source/expr는 보존한다. no-pass packet에 pass_id/field를 추가하지 않는다. tag는 별도 port binding metadata다. |
| source 오류 | helper NOT_READY/SOURCE_NON_FINITE/SINK_REJECTED 또는 실제 sink 거절은 이후 phase 0회. 입장한 실패 시도의 partial prefix를 되돌리거나 같은 actor로 재실행하지 않는다. 값/field 부재를 0·중립/boot fallback으로 바꾸지 않는다. |
| captured Health seam | 원 `run_phase(INITIAL)`의 두 번째 plan을 피하면서 실제 pass/acked 상태를 열려면 원 `run_captured_initial(plan)`이 필수다. 미제공 시 명시 NR이며 private helper state override·subclass plan alias·packet 성공 위장 0. |
| sequence와 query | source anchor **write** interleave를 구성한다. 기존 coarse Health/Resource plan을 prefix에서 1회씩 capture하므로 원 JS 모든 helper-query 횟수/시점을 완전히 재현했다고 주장하지 않는다(`full_source_query_order_proven=false`). |
| physics / 전체 Main | `automatic_physics=false`, `automatic_input=false`, 원 공식 재구현=false, `run_health_subset_calls=0`, `run_apply_stats_calls=0`, prefix rollback=false. 이 원 쓰기 완료는 full bootstrap·모든 gameplay 소비·공개 시각/FPS·원 source 전체동등의 증명이 아니다. `main_full_ready=false`, `public_play_proven=false`. |

<!-- SOURCE_PLAYER_INITIALIZATION_ADAPTER_API_END -->
