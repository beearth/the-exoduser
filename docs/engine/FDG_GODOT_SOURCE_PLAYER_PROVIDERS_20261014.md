## 중앙 실제 Main 파생 수치 최초 연결 — 2026-10-14

실제 Main은 시작 장비25 및 actual current G/P/STATS/PASSIVES/INV 공급자 이후, 새 Player Tree 진입 전에 원본 ordered dispatcher와 전용 Player/State/ResourceAuthority sink를 결합한다. 원 Health initial plan1·Resource plan1을 캡처해 `_effStats` → HP → DEF/poise/baseAtk/speed → 자원 → 공통 결정 보정 → 방어구 → 견갑 → 캐시 무효화1·fresh recalcSt 순서로 28개 실제 write를 소비했다. 실제 source OPT35/current_pre_restore에서 diff5→signed0을 읽고, raw 이동속도는 실제 물리×60 변환 뒤 Tree 진입에도 유지된다.

새 고유5그룹117 clean은 최초성공4/69 + sharedcrystal INVALID44만 수리한 첫clean48이다. 처음 실행은 exit1/SCRIPT_ERROR1/FAIL1이며 전체5 PASS가 아니었다. production repair0, test fixture 수정2곳, 성공4/old145·88·71·원 helper 검사 재연0. 단일 original17slot loop/lvB1-query 전체 parity, G stage/fullbootstrap, 원본 자동 회복, 공개 pixel/24장24FPS/최소사양240FPS는 아직 미완이다. 실제 constructor ST200 / Tree ST200.14 / MST332는 재검수 실행에서의 관측값이며 상수·원본 자동회복 결과가 아니다. 최초 실패의 ST 두 숫자는 NOT_OBSERVED로 보존한다. Player 기존 회복 본문은 변경하지 않았다.

현재 API·세부 검증·이력은 FDG_GODOT_MAIN_SOURCE_PLAYER_INITIALIZATION_FIRST_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SINKS_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SERVICES_20261014.md를 따른다. 아래 독립 helper/이전 커밋의 부족·검사 이력은 당시 상태로 보존한다. source Main-full/derived readiness는 false다.

# 실제 Source Player provider 구성 — 2026-10-14

<!-- SOURCE_PLAYER_PROVIDERS_ADAPTER_API_BEGIN -->
## Adapter API

`godot/scripts/native_source_player_providers.gd`의 `ExoduserNativeSourcePlayerProviders`는 동일 실제 새 Player의 원 provider를 구성하는 `RefCounted`다. 실제 `native_source_new_run_state.gd`와 `native_source_resource_authority.gd`가 먼저 source constructor 상태를 소유해야 한다. 제공된 현재값을 기본값으로 보충하지 않으며 원 helper를 복제하거나 source 공식을 다시 만들지 않는다. 전체 Main/파생값 적용/공개 플레이는 아직 별도 인수다.

| 공개 API | 정확 계약 |
|---|---|
| `configure(player:Node2D, world:Node, state:Node, resources:Node)->bool` | actor 최초 Tree 진입·ready 전 1회. 실제 State/Resources script·동일 actor/world·source getter5 Dictionary·현재 ownership/lifecycle을 검증한다. 원 helper 객체를 생성·구성한 후에만 player weak owner/persistent initialized metadata를 설치한다. source Player/resource/State dictionary 쓰기·원 회복/스탯 명령 실행은 0. 실패한 candidate helper는 폐기한다. |
| `get_native_source_player()->Node2D` / `get_native_source_world()->Node` | 동일 유효 owner 참조; freed/queued/reparented/removed actor, 같은 Tree/World.player 불일치, source owner 손실이면 null. |
| `is_native_source_providers_ready()->bool` | 구성/실제 ownership/보존된 provider 수명 및 실제 raw grit 값 준비. preTree 구성 상태도 true가 가능하나 SourceParameters 명령 sink·전체 Main 준비를 뜻하지 않는다. |
| `get_provider_bundle()->Dictionary` | 아래 실제 instance/reader를 담은 새 shallow dictionary. lifecycle 손실이면 `{}`이며 fake empty source 상태로 바꾸지 않는다. parameter provider map도 shallow copy다. |
| `get_provider(name:String)->Object` | 아래 10개 이름의 같은 원 instance; 알 수 없는 이름 또는 lifecycle 손실은 null. |
| `get_snapshot()->Dictionary` | 구성/owner 상태·원 binding 결과 deep copy·원 grit boot provenance·실제 raw holder 상태·원 SourceParameters readiness/provider keys·미인수 경계. 스탯/자원/HP/AI/clock setter는 없다. |

| bundle 객체 키 | 원 소유 클래스/실제 연결 |
|---|---|
| `affix` | `equipment_affix_reader`의 `configure_inventory_reader(actual INV reader)`; 원 `_eqAffix` 캐시를 유지한다. |
| `reference` | `combat_reference_source`의 inventory/player/stats reader 세 개 → 원 `bind_combat_stat_formula(formula)`로 실제 melee/magic ref 연결. `_lvB`, `eq_stat`, ref 산술을 bundle에서 계산하지 않는다. |
| `formula` | `combat_stat_formula`에 현재 P/INV·같은 affix를 구성하고, reference 및 current passives public bind API를 사용한다. STR/INT/DEF/QE 기본값 제조 0. |
| `passives` | `player_passives_source.configure_current_passives_reader(actual PASSIVES reader)` → `bind_combat_stat_formula(formula,SOURCE_CURRENT)`. 새 derive/reset/restore 0. |
| `rates` | `regeneration_stat_source.configure(actual PASSIVES, actual P, actual INV reader)`; 실제 `.read_source_rates()` / `.read_regen_mul()`은 후속 원 소비자가 호출한다. 자동 rate 조회/advance 0. |
| `fusion` | `fusion_star_source.configure(actual P reader)`; 실제 source `_fused`를 읽는 원 `fuse_star`를 제공한다. 빈 fused/별등급을 새로 만들지 않는다. |
| `crystal` | `player_crystal_resource_source` 원 instance의 `with_crystal_effects_provider`를 통해 원 conditional `crystal_effects` Callable을 추가한다. 원 support 준비 실패는 구성 거절하며 actual equipped crystal 생성/변형 0. |
| `raw_grit` | BUILD 원 `save_adapter/raw_grit_restore.gd` holder. 원 `player_grit_source.source_boot_grit().raw`를 `{_grit:raw}`로 **최초 initialize 1회**하여 실제 current holder를 구성한다. 원 선언 raw0, provenance `game.html:28556 let _grit=0`; boot packet은 SOURCE_BOOT/current=false/ready=false 그대로 보존한다. restore/apply_plan/refund_all/unpublish 호출 0. |
| `grit` | `player_grit_source`의 실제 공개 `configure(current_container_reader,'_grit','new_run/source_raw_grit_declaration')`. `configure_current_container_reader`라는 API는 없다. 이후 current holder 부재/비숫자/비유한은 원 0 대체 없이 NOT_READY다. |
| `parameters` | `player_resource_parameters_source`의 원 필수8 + conditional1 provider를 구성한다. 실제 resource command sink는 `Callable()`로 비우므로 원 `readiness()`는 `ready=false,missing=['resource_sink'],conditional_unbound=[]`다. applyStats/recalcSt/순서대입/캐시 무효화는 후속 primary caller 소유다. |

| bundle reader/SourceParameters 키 | 정확 공개 원 API |
|---|---|
| `current_g/current_p/current_stats/current_passives/current_inventory` | 실제 State getter5를 weak bridge로 읽으며 같은 owned current Dictionary reference를 전달한다. snapshot을 current 공급원으로 사용하지 않는다. 없는 domain을 `{}`/0으로 보충하지 않는다. |
| `fuse_star` | `Callable(fusion,'fuse_star')` — 원 `(skill_id)->{status,value,reason,...}`. |
| `grit_total` | `Callable(parameters,'read_source_grit_total')` — 원 `_grit_total` 1회 소유 getter. bundle의 wrapper/5항 재계산/사전조회 0. sink 미바인딩과 이 순수 원 getter의 값 준비는 별개다. |
| `parameter_providers.player/stats/passives/inventory` | 실제 reader4. |
| `parameter_providers.eq_affix/eq_stat/lv_b` | 같은 실제 affix `eq_affix`, reference `eq_stat/lv_b` 원 메서드. |
| `parameter_providers.grit` | 원 `grit.with_grit_provider`가 추가한 실제 `provide_grit` Callable. |
| `parameter_providers.crystal_effects` | 원 `crystal.with_crystal_effects_provider`가 추가한 원 conditional Callable. 필수8과 구분한다. |

| 수명/상태/미인수 | 현재 계약 |
|---|---|
| persistent 1bind | actor metadata `native_source_player_providers_initialized` + weak `native_source_player_providers_owner`. bundle이 해제되어도 같은 actor 둘째 구성·raw grit 재선언을 허용하지 않는다. actor의 다른 source claim은 변경하지 않는다. |
| preTree→live | State/Resources holder는 초기 unparented 또는 같은 World 자식만 허용하고, actor가 Tree에 진입한 뒤에는 실제 동일 World 자식·같은 Tree여야 한다. canonical Main에서는 Player와 World가 같은 Main의 자식이며 Player의 World 자식 조건을 만들지 않는다. Player 소유는 실제 `get_combat_world()==world`·World.player 동일 actor·같은 Tree로 검증한다. 강제 reparent 0, Tree에서 빠진 ready actor의 preTree fallback 0. |
| retention | bundle이 원 provider10 + bridge를 보관한다. source helper가 bridge Callable owner를 보관하더라도 bridge→bundle은 WeakRef라 cycle을 만들지 않는다. 외부가 보관한 옛 helper의 reader도 bundle/Node 손실이면 null로 거절한다. freed 판별은 `is_instance_valid`를 타입 검사보다 먼저 적용한다. |
| 캐시 | configure의 원 cache 초기화만 사용한다. 장비가 바뀐 뒤 `_eqAffix`/`_eqStat` 원 무효화 시점과 ordered sink는 후속 실제 caller 담당이며 binder가 변경을 추정하지 않는다. |
| snapshot 상태 | `binding_ready`와 원 `source_parameters.ready`를 분리한다. `source_grit_boot_input`은 그대로 보존하고 `raw_grit_current`는 실제 생성한 holder getter다. 현재 grit의 입력 0을 누락 current fallback으로 쓰지 않는다. |
| 실행 경계 | `resource_sink_installed_by_bundle=false`, applyStats0/recalcSt0, rate advance/clock/input=false, 공식 재구현=false, raw grit reset/restore/plan=false. HP/DEF/speed/shield/poise source wiring 및 실제 derived command sink는 이 binder가 구성하지 않는다. |
| 전체 권위 | `main_full_ready=false`, `derived_parameter_application_proven=false`, `hp_def_speed_shield_poise_configured=false`, `public_play_proven=false`. 실제 Main boot 단계/원 canonical RNG/state/script 전체동등·시각·성능 인수로 승격하지 않는다. |

<!-- SOURCE_PLAYER_PROVIDERS_ADAPTER_API_END -->

## actual Main 최초 소비 검증 — 2026-10-14

고유 **5그룹145 clean검사**는 첫성공4그룹132와 scriptERROR가난 consumer만13 재검한 합이다. 첫전체 실행은141assert/exit0이었지만 `Dictionary == int` fixture SCRIPTERROR1로 **NOT_PASS**다. 해당 consumer에서 error전9개 검사는INVALID이고 이후성공13으로대체하며, 제품수리0·fixture leaf수리1·성공4그룹재연0·전체5최종재연0이다.

| 그룹 | 고유 clean 수 | 관측 |
|---|---:|---|
| startup_state_and_items | 94 | actualMain SourceState fullmkP/G40/STATS5/PAS26/INV17, 실제sameitem 15장착+10bag, entries26/RNG913/time25/level70; bootcurrentfalse와actualcurrent별도 |
| public_actor_sync | 8 | 공개attack/damage→실제currentP HP250/ST190.175/MP160/stateidle; actor/state/HP/clock 시험용setter0 |
| original_provider_consumers | 13 | 수리후실패그룹만firstclean. 현재actualINV→originalAffix/CRef/Rates/Fusion holyDome0, ownedrawGrit0→publicgritTotal READY/value0. Parameters는sink미설치NR |
| once_and_tree_gates | 11 | 재생성ALREADY_ATTEMPTED/RNG913→913; actualTree/preTree/persistentclaim경계 |
| lifecycle_and_grit_loss | 19 | rawholder unpublish→NOTREADY/value:null(grit_not_number:Nil), State.free→reader/providerNR; actualresource리필0 |

첫실행4.267587541초, affected-only2.191662083초, 둘째ERROR0/exit0. 최초 오류coroutine의Main 미cleanup 때문에 다음두그룹에독립Main이동시에존재한이력을보존한다. 성공4는자기Main/World/actor/currentreader/Worldcounter 직접참조 assertion만인수하고 globalcurrentCamera/groups/FPS 의미는주장하지않는다. 원시attempt1/2와local-scene proof는 E/dependency-main-source-starter-state-first/tests/worker-test-receipt.json에남는다.

SourceParameters의현재 P/Crystal requirement 진단문자열2개는첫성공뒤 metadata-only로현재실제supplier에맞췄다. 식/숫자/함수/분기/keys변경0이고원testedbytes와finalbytes/diff를따로보존한다. 나머지production11+test는actualtestedstage와exactbytes동일이다. UID9은실제GodotResourceUID 생성(metadata0groups/0imports/.598615542초), userdata는EXODUSER-MainSourceStarter-Isolated-20261014다. 기존source성공test/GUI/save/userQA/server/기존asset해시·복사·import0이다.

실제파일init+starter+provider-binding완료와post-applyStats파생/fullbootstrap/actualOPT/diffSigned/automaticregen/이미지품질/24장24FPS/최저240은별도다. 현재다음source부분은미완으로표시한다.
