## 현재 actualMain 초기 상태 / 공급자 — 2026-10-14

실제 Main은 원 fullmkP/G40/STATS5/PASSIVES26/INV17 source 상태를 명시설치하고 원 actualRNG/time→StarterFactory25를 실제sameidentity로 소비했다. 실제 current holder→Affix/CRef/Formula/Passives/Rates/Fusion/Crystal/currentGrit/rawholder/SourceParameters10이 연결된다. SOURCE_BOOT/currentfalse 이력은그대로이며 설치된현재값은별도진실이다. 첫고유5그룹145는 최초성공4/132+scriptERROR가난consumer만13재검한결과다. 원HP·MP·ST 파생/전체applyStats/recalcSt/actualOPT/diffSigned/fullbootstrap/자동회복은아직미완이다. 아래 독립helper 과거검사·당시부족이력은보존하며 최신중앙상태는 FDG_GODOT_SOURCE_NEW_RUN_STATE_20261014.md 및 FDG_GODOT_SOURCE_PLAYER_PROVIDERS_20261014.md를따른다.

## 중앙 회복 phase 최초 연결 — 2026-10-14

원 dispatcher와 실제 Player/World/SourceResourceAuthority가 presence→영역HP→MP→ST→rates 사전계산→자연HP→자연ST→MP를 실제 Tree에서 소비했다. 첫6그룹88 clean PASS이며 원 helper 성공 검사 재연0이다. 이 실행의 G/INV/PASSIVES/hpR/lesson/init witness는 명시 constructor fixture다. 실제 Main 시작 장비25·파생HP/MP/ST·전체초기화는 아직 미완이다. 최신 API·clock·null/lifecycle·검증 한계는 docs/engine/FDG_GODOT_SOURCE_PLAYER_REGEN_PHASE_20261014.md 및 FDG_GODOT_FRACTIONAL_HP_SINK_20261014.md가 현재 중앙 상태다. 아래 독립 source 테스트 이력과 수치는 보존한다.

# FDG Godot 자원 재생 실제 연결 — 2026-10-14

## Adapter API

`godot/scripts/native_resource_regeneration_adapter.gd`는 신규 `RefCounted` composition adapter다. 완료된 strict producer·source-rate supplier·holyDome reader를 그대로 재사용한다. 이 API 섹션은 새 중앙 연결 코드의 계약이며 기존 FIRST 5개 그룹/458검사 등 성공 검사의 재실행·본편 실제 MP/current G 권위·공개 플레이·240 성능 인수 기록이 아니다.

| 공개 API | 정확한 소비 |
|---|---|
| `configure(player:Node2D,world:Node,authority:Object,rates:Object,dome:Object,lesson:Callable,phase_ready:Callable)->bool` | 실제 동일 Player/World/Tree·get_combat_world/world.player identity, 실제 authority3메서드·source supplier2·zeroarg reader2·현재 필드7·strict phase·World clock/context를 구성 전에 검사. configure preflight는 local strict `plan_native(0,guard)`로 output shape/current base를 확인하며 resource dispatch0. 실패 시 실제 Player/World/resource/children/registry 변경0 |
| `get_native_regen_player()->Node2D` | 유효한 실제 동일 Player 또는 null. 별도 Player 생성0 |
| `get_native_regen_world()->Node` | 유효한 실제 동일 World 또는 null. 별도 World 생성0 |
| `is_native_regen_ready()->bool` | 마지막 실제 source plan readiness + 현재 binding/lifecycle/current P/lesson/phase gate. rates·dome 값을 추가 query하지 않는다. 초기 strict preflight가 유효하면 source-ready flag true. 실제 strict plan NOT_READY면 false, 다음 fresh-frame 실제 advance가 유효해지면 복구 가능. 전체 current G/INV 값의 매순간 권위 증명은 아님 |
| `advance_native(ticks:float,frame:float,ens:Variant)->bool` | actualWorld-only pause·finite·dt/frame/epoch·ens 참조 identity·configure시 generation·stale/duplicate gate가 provider query보다 선행. caller가 World scalar를 그대로 전달하므로 frame/dt 비교는 approximate가 아닌 **exact**. 근접 offset도 거절 시 authority/rates/dome/lesson/phase query0·phase reserve0. 유효 phase는 원 strict `advance_native(ticks,lesson_guard)` 정확1회, 자체 physics/render clock0 |
| `get_snapshot()->Dictionary` | configured/ready/error, 실제 strict last_result·last_packet deep copy, last_source_plan_ready·authority_contract_broken, clock_calls/clock_rejections·last_native_frame/epoch, commit_attempts/successes·packet_rejections·producer_dispatch_count 및 source phase/readiness/원자성 경계 |

| 공급자 | 정확한 API / 형태 |
|---|---|
| identity | `authority.get_native_regen_player()->Node2D`가 실제 같은 Player |
| state | `authority.read_native_regen_state()->Dictionary`: `s,st,mst,mp,mmp,stR,mpR` 전부 존재. s는 String/StringName, 나머지6 유한 numeric이며 bool/string/null/NaN/Inf는 미공급. s/ST/maxST는 실제 Player.state/stamina/max_stamina와 **exact** 일치. MP/base 값은 실제 authority에서 제공하며 native export/0/.28/중립값으로 채우지 않음 |
| source rates | 실제 `res://port_modules/regeneration_stat_source/producer.gd` 인스턴스의 `read_source_rates()` 및 readiness. 내부 source-ordered MP→ST pre-holy `_mpr_pre_holy/_str_pre_holy`를 그대로 strict producer가 1회 소비. source detail base는 현재 P.mpR/P.stR와 같아야 함. aggregate alias·base0 보정·추가 holy 배율0 |
| holyDome | 실제 `res://port_modules/holy_dome_presence_source/producer.gd` 인스턴스의 `in_holy_dome_value()` 및 readiness. 실제 current G/P reader가 없으면 null/NOT_READY를 보존. 유효 false→hd_mul1, 유효 true→hd_mul2이며 배율은 strict producer 안에서만 적용 |
| lesson | zeroarg `Callable()->Dictionary`: `parry_lesson_active:bool`, active이면 `parry_lesson_chapter:int`. active&&chapter2는 rate 계산 뒤 원 guard_skip/dispatch0. 없는 guard를 false로 대체0 |
| phase | zeroarg `Callable()->bool` **실제 true** 필수. source `after_holy_dome_flat_and_hp_before_demon_rev_cd`, 즉 holy flat+HP 후·demonRevCd 전 witness. 현재 Main publisher가 없으면 NOTREADY. constructor witness를 실제 Main phase 완료로 승격0 |
| lifecycle | Object/RefCounted 유효성; provider가 Node면 같은 SceneTree 안에서 queued deletion이 아니어야 함. lesson/phase owner 강하게 유지. 원 producer의 Callable owner retention으로 adapter↔producer 강한 순환 참조가 생기지 않도록 내부 weak-owner bridge가 state/sink를 전달 |
| freed binding gate | 저장된 World/Player/authority/rates/dome를 Variant-safe `_live`로 먼저 검사한 뒤 typed Node/Object helper에 전달. `_live`는 **is_instance_valid 선행 → is Object → Node queued 검사** 순서로 해제된 Variant의 type 검사 오류도 피한다. 해제된 참조는 readiness=false·advance/commit 거절이며 authority commit0·legacy fallback0. advance 앞단에서 잃은 binding은 source 실행0; 이미 source sink dispatch에 진입한 뒤의 거절은 producer dispatched1/authority commit0일 수 있음. snapshot의 phase Callable도 World 유효성 검사 후에만 전달. commit 내부 lifecycle 변경은 sticky contract_broken으로 보고하며 actor/resource rollback0 |

| 원 packet / 단일 commit | 정확한 계약 |
|---|---|
| shape | `{kind:'natural_regen',source:'game.html:33359-33364',writes:[{field:'st',before,value,cap_field:'mst'},{field:'mp',before,value,cap_field:'mmp'}]}`. 쓰기2개·ST→MP 순서·각4field 외 다른 resource 쓰기0 |
| before | strict producer가 읽은 실제 state7과 commit 직전 fresh authority/current Player가 같아야 함. 두 before는 각각 current st/mp와 같아야 함 |
| value / cap | value는 유한 수치이며 실제 fresh mst/mmp 이하. source `Math.min`으로 cap 초과 현재값을 내려오는 동작을 보존하므로 현재 st>mst/mp>mmp를 임의 거절하지 않음. rate 음수·after 음수에 새로운 min0 clamp를 만들지 않음 |
| source math | idle: `ST=min(mst,st+_str/8*ticks)`, `MP=min(mmp,mp+_mpr/8*ticks)`. active: `/16`, beam MP만 `*.5`. source `_mpr_pre_holy*hd_mul` 먼저, `_str_pre_holy*hd_mul` 다음. adapter는 이 식을 다시 계산하거나 수치 보정하지 않음 |
| commit | `authority.commit_native_regen_resources(packet)->bool` 1회. false이면 두 resource 변경0; true이면 두 before/current cap를 다시 검증한 뒤 ST→MP 둘을 원자 적용. caller synchronous·reentrancy/lifecycle/readonly getter 계약 필수 |
| readback | false 뒤 state 변화 또는 true 뒤 실제 ST/MP write·cap/base/state 불일치, nonbool ack는 `authority_contract_broken` sticky/readyfalse. adapter는 두 내부 쓰기의 순서·원자성을 외부에서 완전히 증명하거나 이미 잘못 적용된 opaque state를 rollback할 수 없음. source packet과 fresh-before·결과 readback 및 authority 계약이 증거 경계 |
| counters | `clock_calls`: 실제 strict advance 횟수. `commit_attempts`: authority 실제 commit 호출 횟수, `commit_successes`: true+일치 readback 횟수. strict producer `dispatched=1`은 adapter sink 호출이며 adapter precommit gate가 거절하면 authority commit0일 수 있음 |
| phase reserve | 유효 admitted phase는 source NOT_READY 또는 mutation없는 sinkfalse라도 frame/epoch를 예약하여 같은 actualFrame을 재실행하지 않음. 다음 freshFrame은 source 복구 시도 가능. badclock 거절은 마지막 source-ready flag도 그대로 유지 |

World clock은 실제 `get_native_frame()/get_native_world_identity()/get_native_projectile_fx_context()`만 읽는다. context schema는 `exoduser.godot.native-projectile-fx-context.v1`, clock_mode는 `godot_delta_native60`, 실제 유한 양수 dt_sp 및 비음수 정수 frame_reset_epoch가 필요하다. 내용이 같은 새 Array도 source ens와 같은 참조가 아니므로 거절한다. 새로운 게임 시간·authority setter·HP/위치/상태 주입·gameplay private hook은 만들지 않는다.

공유 Player/World hook과 기존 `.28/divisor` 재생 대체는 primary 소유다. 정상 bound flag와 새 strict 호출은 기존 재생과 배타적이어야 하며, provider가 사라져도 `.28` fallback을 다시 켜면 안 된다. 실제 Main MP/current G/INV/PASSIVES/lesson/원 phase 권위가 없으면 설치 false가 정확한 상태다. actual Player/World Tree와 constructor authority를 결합한 신규 기술 fixture도 Main 권위·자연 원본 전체 시스템·공개 플레이 증거가 아니다. source producer3개·기존 성공 suites·PNG/cache/import는 이 adapter 작업에서 수정/재검사0이다.

## 실제 Player / World 소비 위치

| 실제 파일 / API | 구현 상태와 적용 위치 |
|---|---|
| `scripts/player.gd` / `bind_native_resource_regeneration(adapter:Object)->bool` | 5개 method·같은 Player/World·exact bool-ready를 확인하고 한 번 바인딩. `_native_resource_regeneration_bound`는 공급자 유실 뒤에도 유지하여 임시율 복귀를 막음 |
| `Player.get_native_resource_regeneration_snapshot()->Dictionary` | adapter snapshot의 deep copy에 실제 persistent `bound` 여부를 추가. adapter가 없으면 `{ready:false,bound:영구바인딩여부}` |
| `scripts/world.gd` / `bind_native_player_resource_regeneration(adapter:Object)->bool` | ready World의 기존 동일 player만 사용. 새 actor·입력·시계 생성0 |
| Player physics 회복 위치 | 기존 HP0 return·held/request_attack 뒤, 이동/state 진행 앞. bound이면 실제 World context.dt_sp/frame/ens를 adapter에 1회 전달. unbound이면 기존 `.28 / (idle?8:16) × delta×60` ST 경로 유지. 두 분기를 합산하지 않음 |
| 사망 / 유실 | 죽은 Player는 기존 HP guard로 회복0. binding 후 authority/G/INV/phase/lifecycle 유실은 source 적용0이며 `.28`로 fallback0 |
| 자료 범위 | 새 adapter와 source Natural/Rates/Dome/Affix dependency closure를 실제 Tree 검사에 사용. 기존 source 성공 검사는 신뢰하고 재실행하지 않음. 원 스킬·HP·poise·Q/E·save·map/충돌 계약 변경0 |

원 전체 순서는 holy predicate33349 → holy flat33352 → ST/MP rate precompute33353~33354 → HP33356~33358 → ST/MP writes33359~33364다. 현재 adapter는 별도 caller phase witness를 받은 뒤 strict rate 읽기와 ST/MP 대입을 함께 수행한다. 원 precompute를 HP 앞에서 공유하고 holy predicate를 전체 phase에서 한 번만 공급하는 통합은 아직 없다. 따라서 `phase_witness_ready=true`인 constructor 검사도 전체 source phase 순서의 완료 증거가 아니다. 실제 Main MP/current G·HP/holy flat producer·공용 phase dispatch 설치는 다음 중앙 연결 범위이며, 이번 packet/수치 순서 PASS와 분리한다.

## 23. MAP PRODUCTION REPORT

| 항목 | 이번 범위 |
|---|---|
| MASTER / LARGE OUTER MASS / MEDIUM / GROUND | 기존 Cground geometry·환경·nav·충돌 보존. 새 맵 제작·배치0 |
| PLAYABLE / COMBAT | 동일 Player·World의 선택 회복 adapter와 단일 ST→MP 소비 경로. 실제 Main 자원·G·원 선행 phase 공급 미연결 |
| LANDMARK / SMALL DETAIL | 기존 데이터 보존, 신규 landmark/detail0 |
| CAMERA QA | 새 격리 World/Player/Camera Tree 검사 대상. 공개 Main 화면·pixel 비교0 |
| TECH QA | 신규 실제 실행 검사와 receipt가 다음 섹션의 권위. 기존 성공 suite·원 자원 재검사0 |
| VISUAL VERDICT | **RETOUCH** — 기술 회복 연결을 모델링·24장/24FPS·전체 교전·최저240 품질로 승격하지 않음 |

## Dependency metadata 최초 인수

실제 Godot `ResourceUID.create_id()`로 신규 source metadata5개만 생성했다. exit0·ERROR0, 0.257134292초, runtime group0·import0. 최초 `tests/new-resource-uid-receipt.json`과 로그를 보존했으며 기존 UID·PNG·캐시 재수입은 0이다.

| 실제 `.gd` resource | 신규 `.gd.uid` |
|---|---|
| `scripts/native_resource_regeneration_adapter.gd` | `uid://dbwghfcomebbr` |
| `port_modules/resource_regeneration_source/producer.gd` | `uid://drsmpujvsa6qg` |
| `port_modules/regeneration_stat_source/producer.gd` | `uid://dfh771w3arryu` |
| `port_modules/holy_dome_presence_source/producer.gd` | `uid://mynmw1maagge` |
| `port_modules/equipment_affix_reader/producer.gd` | `uid://dw5enc7715xhe` |

## 최초 실제 통합 검사 / 실패 보존

| 새 그룹 | 고유 검사 | 첫 유효 결과 / 관측 |
|---|---:|---|
| `atomic_preflight` | 29 | 최초 PASS. 실제 동일 Player/World에서 MP 누락·bool·NaN, G null/잘못된 형태, phase null/int, INV/PASSIVES null의 9 constructor 변형은 binding·resource mutation0 |
| `attack_paired_once` | 15 | 최초 PASS. 실제 공개 attack으로 ST200→190, 실제 4 source commit 후 ST192/fixture MP24. ST→MP 각각 1대입, `.28` 추가 적용0 |
| `natural_modes_dome` | 73 | 최초 PASS. 공개 attack/release 뒤 실제 state machine이 행동·idle로 돌아옴. 실제 dome supplier의 ×2와 실제 dt_sp별 회복 확인. beam은 공개 native producer가 없어 미관측 |
| `lesson_skip` | 9 | 최초 PASS. chapter2 활성 fixture guard에서 실제 clock5회 진행, ST190/MP20 유지, resource commit0 |
| `actual_clock_guard` | 13 | affected fixture 수리 뒤 첫 clean PASS. actual World 갱신 뒤 Player 앞의 engine-driven probe에서 copy/stale/wrongdt/근접 frame·dt offset 거절, supplier query0·phase reserve0. 같은 실제 frame의 정상 resource commit 정확1. duplicate·pause에서도 query0 |
| `provider_loss_no_legacy` | 18 | affected product lifecycle 수리2회 뒤 첫 clean PASS. G null 및 실제 authority Node.free 양쪽 bound=true·ready=false·ST190/MP20 유지, fallback0·SCRIPT_ERROR0 |
| `packet_and_opaque_rejection` | 13 | 최초 PASS. 실제 source sink의 opaque false4회에 두 자원 무변경. field/before/cap malformed는 production static `_packet_error`의 순수 검증이며 실제 자동 phase의 malformed dispatch로 승격하지 않음 |

고유 **7그룹/170 clean검사**는 최초5/139 + 수리한 clock13 + 수리한 provider-loss18의 합이다. 전체7을 다시 실행한 성공 suite가 아니다. 기존 source 성공 검사·새 clean 그룹 재실행0, 수동 physics·live HP/state/position/clock setter0, 실제 Main authority fixture 승격0.

| 실행 | 실제 검사 / 종료 | 보존 판정 |
|---|---|---|
| attempt01 전체7 | 170 / exit1 / 10.18155325초 | clock assertion FAIL1, provider-loss SCRIPT_ERROR2. 독립 clean5/139만 동결. 전체 PASS로 인수하지 않음 |
| attempt02 affected2만 | 31 / exit0 / 4.2250335초 | clock13 clean PASS. provider-loss18은 assertion FAIL0이어도 SCRIPT_ERROR6 때문에 INVALID 유지 |
| attempt03 provider-loss만 | 18 / exit0 / 3.542043625초 | FAIL0·SCRIPT_ERROR0·ERROR0, 첫 clean PASS. 이전 clean6/152 실행0 |
| 합계 | 실제 assertion 실행219 | 고유 clean170과 구분. 실패/INVALID 원 로그를 덮거나 제외하지 않음 |

제품 수리는 typed helper에 해제된 참조를 넘기기 전의 caller lifecycle 검사, 그리고 Godot의 freed Variant에 `is Object`를 적용하기 전에 `is_instance_valid`를 먼저 평가하는 predicate다. 유실 후 busy 상태와 임시율 복귀를 피한다. clock 검사의 수리는 `await process_frame` 뒤 physics가 꼭 1회라고 가정하던 fixture를 실제 commit.frame별 1회 관측으로 바꾼 것이다. 임의 시계 setter·제품 수치 보정·source module 재구현0.

원 로그·시도별 source snapshot·UID mapping과 판정은 `dependency-resource-regeneration-integration-first/tests/attempt-01-runtime-receipt.json`, `attempt-02-affected-only-runtime-receipt.json`, `attempt-03-provider-only-runtime-receipt.json` 및 worker final receipt가 권위다. actual World/Player/Camera Tree를 사용했지만 MP·G·INV/PASSIVES·lesson/phase는 생성자 fixture다. 공개 Main·전체 source phase·HP/holy flat·캐릭터 모델/24장24FPS·실제 pixels·최저240 성능은 아직 미인수다.
