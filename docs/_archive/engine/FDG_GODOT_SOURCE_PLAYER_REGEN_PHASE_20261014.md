## Native 기본 합체 E 파동 — 2026-10-15 현행

| 범위 | 현재 구현 |
|---|---|
| 실제 소비 | 기본 shieldFuse의 _autoShieldThrow→실제 post-move wave 이동·사각 공간명중/Enemy HP·KB·소스 _stCd/_stWingT·실제 생성40보호·기존 source 입자/원근 quad 및 자연 gbBean의 같은 carrier blue 반사 연결. 추가 ST0. |
| 수치 | L=max(1,min(maliceSwipe 또는1,shieldThrow 또는1)), cooldown=max(120,720−15L), 기본705. M=(1+.05(L−1))×clamp(charge,1,3), maxDist210M/r50M/w95M/속도12. source 피해·실fusion/affix 및 wave 반사 base(true)×1.5/life120/gb유지. |
| 검수·후보 | 새 GPU/Main3에서 고유23 PASS/제품ERROR0·기존 Camera2DWarning각1. 실제 자연 명중과 자연 탄→blue 피해/최대차징 확인. 새 native-review-e-wave-20261015 후보는 기존camera0b도 포함, 초기pause/명시선택/수동재개. 기존 실행본 자동교체0. |
| 한계 | DEFAULT_FUSED_WAVE_PARTIAL/E_CONTROL_PARTIAL/latest_full_game=false/RETOUCH. 비합체·다른탄·boss/full hurtE/doParry·고유모션/audio·전체스킬24고유장24FPS 미완. blackBean은 Q only/E 제외. |
| 상세 | FDG_GODOT_NATIVE_FIRST_20261013.md의 e-default-fused-wave-20261015 절이 API·공식·입자·소유·첫검수·새후보의 현행 SSOT다. 아래 이전 파동/40보호 미채택 문장은 그 이전 제출의 이력이며 현재 상태를 덮어쓰지 않는다. |

## E 제어·실제 타격 부분 연결 — 2026-10-15

현재 native Main은 공개 E→sDraw(10tick 게이트/.5이동)→tap 또는 kiGather(2배속/.18이동)→sBash20→sRecover ToInt32(28/(1+현재pParry×.1))→정상종료를 실제 P/ST/World/명시profile과 연결했다. 비용은5+((maliceSwipe||1)−1)×2를 tap release 또는 charge 진입1회, charged release 재차감0. Silver 차징만 원150+175×(mult−1) 전진과 진입8iframe, 원Normal E 공간hit/HP·KB8/stun60을 소비한다. 첫actualMain/GPU1/20.469초/새18PASS/제품ERROR0·Camera보간경고2, 옛Q/공간/독립군 재연0. 기본shieldFuse의 별도파동·40보호·쿨다운, E투사체패링·고유모션/연출 등은 미채택이므로 E_CONTROL_PARTIAL/fullEfalse/latestfullfalse/RETOUCH. [정확API·필드·수치·자연타격·새후보·MAP REPORT](FDG_GODOT_NATIVE_FIRST_20261013.md#e-control-partial-20261015)를 따른다. 아래 과거 E 전체 미연결 표기는 이 부분 범위에서만 현행 계약으로 대체한다.

## Q 다크볼 실제 성공 반사 — 2026-10-15

현재 START의 실제 gbBean만 공개Q→같은 탄 반사→기존 blue 원 clock·자연 AoE/정상 적 피해에 연결했다. live 원 pParryProjDmg base×2 ToInt32/life200, actual HP·ST·MP 성공보상/iframe25/poise+1, 실제 World128px source-order query를 소비한다. 실제 blackBean과 구분하며 black 자연 caller/E/full doParry 보상·audio/FX/core absorb 등은 미완이다. Q_CONTROL_PARTIAL/latestfullfalse/RETOUCH를 유지한다. [정확한 API·원 수치·실패1과 영향검수1·새 후보·MAP REPORT](FDG_GODOT_NATIVE_FIRST_20261013.md#q-dark-reflection-20261015)를 따른다. 아래 과거 “반사 전부 미연결” 표기는 다크볼 범위에서만 현행 계약으로 대체한다.

## 2026-10-15 현재 Q 제어와 버전 범위

현재 실제 Main은 Q_CONTROL_PARTIAL: 진입MP10, 홀드 MP=max(0,MP−최대MP×0.000833×sp), 이동0.35배, 반경100+400×clamp(hold/240,0,1), 해제창12tick을 실제 source MP/P와 연결했다. 원 초기창20/cooldown30×(1+shieldCdRed), 단일60Hz clock을 유지한다. fullQE·반사carrier·E·Space·기폭팔/평화방패·저장복원·24고유장24FPS·전체 최신 이식은 미완이다. 초기 미채택 반사창에 무료 무적을 만들지 않으며 창 이후 원 실패흡수식(min(0.25,block_base×0.5),×1.3)을 기존 실제 피해 경로에서 소비한다.

새 검토본은 native-review-q-control-20261015이며 기존 native-review-input-20261015는 보존한다. 자산·모듈 읽기 링크를 포함한 별도 snapshot이므로 최신 원본 전체/독립 배포본이 아니다. GUI 자동실행0. [정확한 API·수치·실패/영향 검수·새 후보·MAP REPORT](FDG_GODOT_NATIVE_FIRST_20261013.md#실제-q-홀드해제-제어와-검토본-범위--2026-10-15)를 따른다. 아래는 이전 checkpoint 이력이며 Q owner 미바인딩·공간 명중 미검증의 당시 표기는 현행 계약으로 대체한다.

## 실제 Main lesson file-init/current guard 연결 — 2026-10-14

실제 Main은 World/Player를 생성하기 전에 원 lesson holder를 만들고 Root publish_file_init을1회 소비한다. 원 SOURCE_BOOT/current=false 7개 partial 필드는 입력 이력으로 유지하고 실제 published current guard를 별도로 읽는다. Main wrapper LIVE Callable은 cold에서 null/NOT_READY이며 현재 holder의 게시·교체·철회를 따라간다. 실제Main을 해제하면 wrapper Callable이 무효가 된다. 외부가 강하게 보유한 Root holder의 수명과 Main 권위는 구분한다.

새 실제Main FIRST3그룹30(13/10/7) /4.374504333초/exit0/FAIL0/SCRIPT0/Parse0/ERROR0, Camera2D warning1 보존. production/test수리0, 이전117/145/88/71/원lesson7/137 재연0. 교체2→3/revoke는 명시 actualholder public-test publisher이며 원전체controller 자동진행을 뜻하지 않는다. 현재source G.on=false/pre_stage, controller.tick/start/UI/skipKey/reset/storage/G activation/updategate/HPSTMP automatic은 아직 미연결이다. 최신 API/검증은 FDG_GODOT_MAIN_SOURCE_LESSON_20261014.md 및 FDG_GODOT_MAIN_SOURCE_LESSON_FIRST_20261014.md를 따른다. 아래독립helper/과거인수 상태는 역사로 보존한다.

## 중앙 실제 Main 파생 수치 최초 연결 — 2026-10-14

실제 Main은 시작 장비25 및 actual current G/P/STATS/PASSIVES/INV 공급자 이후, 새 Player Tree 진입 전에 원본 ordered dispatcher와 전용 Player/State/ResourceAuthority sink를 결합한다. 원 Health initial plan1·Resource plan1을 캡처해 `_effStats` → HP → DEF/poise/baseAtk/speed → 자원 → 공통 결정 보정 → 방어구 → 견갑 → 캐시 무효화1·fresh recalcSt 순서로 28개 실제 write를 소비했다. 실제 source OPT35/current_pre_restore에서 diff5→signed0을 읽고, raw 이동속도는 실제 물리×60 변환 뒤 Tree 진입에도 유지된다.

새 고유5그룹117 clean은 최초성공4/69 + sharedcrystal INVALID44만 수리한 첫clean48이다. 처음 실행은 exit1/SCRIPT_ERROR1/FAIL1이며 전체5 PASS가 아니었다. production repair0, test fixture 수정2곳, 성공4/old145·88·71·원 helper 검사 재연0. 단일 original17slot loop/lvB1-query 전체 parity, G stage/fullbootstrap, 원본 자동 회복, 공개 pixel/24장24FPS/최소사양240FPS는 아직 미완이다. 실제 constructor ST200 / Tree ST200.14 / MST332는 재검수 실행에서의 관측값이며 상수·원본 자동회복 결과가 아니다. 최초 실패의 ST 두 숫자는 NOT_OBSERVED로 보존한다. Player 기존 회복 본문은 변경하지 않았다.

현재 API·세부 검증·이력은 FDG_GODOT_MAIN_SOURCE_PLAYER_INITIALIZATION_FIRST_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SINKS_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SERVICES_20261014.md를 따른다. 아래 독립 helper/이전 커밋의 부족·검사 이력은 당시 상태로 보존한다. source Main-full/derived readiness는 false다.

## 현재 actualMain 초기 상태 / 공급자 — 2026-10-14

실제 Main은 원 fullmkP/G40/STATS5/PASSIVES26/INV17 source 상태를 명시설치하고 원 actualRNG/time→StarterFactory25를 실제sameidentity로 소비했다. 실제 current holder→Affix/CRef/Formula/Passives/Rates/Fusion/Crystal/currentGrit/rawholder/SourceParameters10이 연결된다. SOURCE_BOOT/currentfalse 이력은그대로이며 설치된현재값은별도진실이다. 첫고유5그룹145는 최초성공4/132+scriptERROR가난consumer만13재검한결과다. 원HP·MP·ST 파생/전체applyStats/recalcSt/actualOPT/diffSigned/fullbootstrap/자동회복은아직미완이다. 아래 독립helper 과거검사·당시부족이력은보존하며 최신중앙상태는 FDG_GODOT_SOURCE_NEW_RUN_STATE_20261014.md 및 FDG_GODOT_SOURCE_PLAYER_PROVIDERS_20261014.md를따른다.

# Godot source Player 회복 phase — 2026-10-14

<!-- SOURCE_PLAYER_REGEN_PHASE_ADAPTER_API_BEGIN -->
## Adapter API

`godot/scripts/native_source_player_regeneration_phase.gd`의 `ExoduserNativeSourcePlayerRegenerationPhase`는 실제 동일 Player/World의 회복 phase를 연결하는 `RefCounted`다. 원 producer의 공식·캐시·수치를 수정하지 않는다. 자동 physics/input driver는 없으며 Main의 실제 초기화·G/P/INV/PASSIVES 공급원이 없으면 `NOT_READY`다. 현재 이 API의 제작과 실제 Main 전체 공급원 인수·공개 플레이 인수는 별개다.

| 공개 메서드 | 정확 계약 |
|---|---|
| `configure(player:Node2D, world:Node, authority:Object, services:Dictionary)->bool` | 최초 1회; 실제 동일 Tree/Player/World·Authority·원 provider script·callback arity/lifecycle·실제 Main 초기화 witness를 먼저 검증한다. constructor 검수용 P/G/resources를 읽으나 actor/resource 쓰기 및 회복 plan/advance는 0회다. 실패하면 actor/resource 변경 0. |
| `get_native_regen_player()->Node2D` / `get_native_regen_world()->Node` | 실제 동일 참조를 읽으며 freed/queued owner는 null. |
| `is_native_regen_ready()->bool` | binding/Main-init witness + 마지막 실제 source phase 상태. 추가 Dome/rates 값 조회 0. source 값이 사라진 뒤에는 false이며 다음 fresh 실제 frame에서 공급원 회복을 다시 시도할 수 있다. |
| `advance_native(ticks:float, frame:float, ens:Variant)->bool` | World의 실제 `dt_sp`/frame/epoch/Array 객체 identity와 정확 일치하는 fresh phase만 1회 입장. pause/stale/duplicate/copied identity/비유한/재진입/freed owner는 provider query 전에 거절. 입장 후 source 오류나 sink 거절도 해당 frame을 소진한다. |
| `get_native_source_commit_phase()->String` | 실제 입장한 동일 World phase의 동기 sink 호출 동안만 아래 tag를 반환한다. provider 조회·단계 사이·pause·phase 변경·외부 호출에는 빈 문자열. |
| `get_snapshot()->Dictionary` | deep copy `trace`, `counts`, `last_results`, 실제 마지막 frame/epoch, 오류/준비도/commit tag 및 미인수 범위를 반환한다. HP/ST/MP/clock setter는 없다. |

| `services` 키 | 정확 제공 형태/권위 |
|---|---|
| `schema` | `exoduser.godot.source-player-regeneration-services.v1` |
| `rates` | 실제 `regeneration_stat_source/producer.gd` instance; `read_source_rates()` 원 `_mpr`→`_str` 순서 및 pre-holy 값. |
| `affix` | 실제 `equipment_affix_reader/producer.gd` instance; 원 `eq_affix('skillBoost')` 및 HP `lifeHealPow` 조회. |
| `passives` | 실제 `player_passives_source/producer.gd` instance; 원 HP의 `read_current_passives()` 조회. boot/0값을 누락된 current 공급원 대신 발명하지 않는다. |
| `current_g` / `current_p` | 인자 0 Callable→현재 Dictionary. P의 `s,hp,mhp,x,y`는 동일 실제 Player와 일치하고 `hpR`는 실제 제공된 유한 값이어야 한다. Dome와 flat은 같은 cache G/P를 공유한다. HP는 flat 이후 P를 다시 읽는다. |
| `fuse_star` | 인자 1 Callable(`holyDome`)→원 `{status:'READY',value,reason}`. 원 flat producer가 fuse/skillBoost 공식을 계산한다. |
| `hp_sink` | 인자 1 `Callable(authority,'commit_native_source_hp')`→정확 bool. 같은 Authority 객체/메서드의 직접 endpoint만 허용하고 관측 wrapper·임의 true Callable은 거절한다. true는 동일 Player HP를 그 scalar로 쓰고 false는 HP 변경 0이어야 한다. |
| `flat_resource_sink` | 인자 1 `Callable(authority,'commit_native_holy_flat_resources')`→정확 bool. 같은 Authority 직접 endpoint가 원 flat HP 결과에 이어 MP→ST를 소비하며 wrapper/다른 객체/메서드는 거절한다. 양 자원의 false 변경 0/true 원 결과 적용은 이 실제 sink의 원자 계약이며 dispatcher가 회복 공식을 중복하지 않는다. Authority의 두 sink 및 `bind_native_source_regeneration_phase(phase)` 메서드도 configure 필수다. |
| `lesson` | 인자 0 Callable→`{parry_lesson_active:bool, active일 때 parry_lesson_chapter:int}`. HP 이후에만 읽는다. |
| `main_init_ready` | 인자 0 Callable→정확 bool true. 공급원의 현재 Main 초기화 권위 witness; 누락은 false. constructor fixture witness를 실제 Main 완성으로 승격하지 않는다. |

| 실제 입장한 단계 | 순서/정확 횟수/소비 |
|---|---|
| 1 `dome` | 원 `holy_dome_presence_source.presence_detail()` 1회. 같은 판정/index를 flat·HP·Natural에 cache로 전달하며 거리 판정 재호출 0. |
| 2 `holy_flat` | 원 `holy_dome_flat_heal_source.advance_native(ticks)` 1회. heal일 때 HP sink → 같은 결과의 flat resource sink(MP→ST). outside/HP guard skip은 정상 다음 단계 진행. |
| 3 `rates_precompute` | 실제 rates `read_source_rates()` 1회. READY·pre-holy 값 2개·mp/st detail/status/value/base·`holy_dome='external'`의 구조만 검증하고 source 오류이면 HP 이전에 중단한다. |
| 4 `hp` | 원 `hp_regeneration_source.advance_native(ticks)` 1회. 원 `source_providers(rates,affix,passives,cached_holy)`를 사용한다. HP 자신의 `read_regen_mul()`은 별도 원 함수 조회이며 MP/ST에 재곱하지 않는다. `guard_skip`은 정상 진행. |
| 5 `lesson` / 6 `natural` | lesson 1회 → 원 strict `resource_regeneration_source.advance_native(ticks,lesson)` 1회. 현재 resources는 HP 뒤에 읽고 cache rates/holy를 소비한다. extra `plan_native(0,guard)`는 0회. lesson guard skip은 대입 0. |

| sink tag | 실제 sink/쓰기 순서 |
|---|---|
| `holy_flat_hp` | scalar 원 flat HP |
| `holy_flat_mpst` | 원 flat 결과 `{status,reason,outcome,source,sp,presence_status,selected_index,level_raw,level_raw_present,level_origin,level,star,skill_boost,fuse_mul,flat_amount,hp_packet:{hp_before,mhp,new_hp},shared_guard_active,mpst_flat_amount,dispatched,applied}`를 그대로 전달. 원 source `game.html:33348-33352,45027-45032,45088`; HP 적용 후 MP→ST. 계산된 +Inf flat을 원 Math.min이 유한 cap으로 수렴시키는 동작은 sink가 보존한다. |
| `hp_natural` | 원 HP producer scalar. 원 packet `{hp_before,hp_after,hpr,regen_div,sp}`는 snapshot 진단이며 sink 인자가 아니다. |
| `natural_resources` | 원 `{kind:'natural_regen',source:'game.html:33359-33364',writes:[{field:'st',before,value,cap_field:'mst'},{field:'mp',before,value,cap_field:'mmp'}]}`. 양 before/cap 및 실제 read-through 상태 검증 후 Authority 1회 commit, false 불변/true 정확값 readback. source Math.min의 over-cap downclamp를 임의 max/clamp로 바꾸지 않는다. |

| snapshot 경로/상수 | 현재 값/의미 |
|---|---|
| `trace` / `last_results` | 마지막 실제 단계/sink 순서; results keys=`presence,holy_flat,rates_precompute,hp,natural`, 미진입 후단은 없음. |
| `counts` | 누적 `dome,holy_flat,flat_resource_sink,rates_precompute,hp,lesson,natural,current_g,current_p,resource_state,hp_sinks,natural_resource_sink,clock_admitted,clock_rejected`. configure의 readonly preflight는 실제 source phase 횟수로 합산하지 않는다. |
| World context | `exoduser.godot.native-projectile-fx-context.v1`, `clock_mode='godot_delta_native60'`, 유한 positive `dt_sp`, 비음수 정수 `frame_reset_epoch`; frame/dt는 오차 허용 없는 정확 비교, `ens`는 내용이 아닌 Array reference identity. |
| lifetime | 원 producer→bridge→dispatcher는 WeakRef; 실제 provider/readers는 바인딩 보존. freed 판별은 `is_instance_valid`를 타입 판별 전에 호출한다. |
| `dome_evaluations_per_admitted_phase` / `natural_plans_before_hp` | 1 / 0. 단계 중 source 오류는 후단 0회이며 이전에 이미 적용한 실제 source 쓰기는 rollback하지 않는다. |
| `pre_hp_validation_scope` | cache rates 구조/status만 HP 전에 검증한다. 실제 MP/ST base와 holy 배율 이후 산술의 malformed/nonfinite 검증은 원 Natural의 HP 뒤 단계에 남는다. 이를 검증하기 위한 extra P/lesson query·Natural plan을 만들지 않는다. |
| 미인수 | 실제 Main 모든 current G/INV/PASSIVES/derived stats 공급원, 공개 플레이/시각/FPS 인수는 별도다. `full_main_source_authority_proven=false`, `public_play_proven=false`, 자동 physics/input=false, 공식 재구현=false. 정상 source 오류/불변 sink 거절은 다음 frame 복구 가능, sink lifecycle/형식/readback 계약 파손은 sticky false. |

<!-- SOURCE_PLAYER_REGEN_PHASE_ADAPTER_API_END -->

## 최초 실제 Tree 검증

Godot4.7.2 headless 고립 actualMain 실행 **6그룹88 PASS**, exit0/ERROR0, 9.640316458초. 첫 실행1회이며 product/fixture 수리0·성공/이전 source 검사 재연0이다.

| 그룹 | 검사 수 | 직접 관측 |
|---|---:|---|
| source_order_once | 21 | 실제 clock8에 dome/flat/rates/HP/lesson/natural 각8, HP sink16. trace=`dome→holy_flat→holy_flat_hp→holy_flat_mpst→rates_precompute→hp→hp_natural→lesson→natural→natural_resources`; ST191.95/HP252.6 |
| fractional_hp_damage | 20 | public 피해→실제 source 회복 HP250.6→public 피해2→248.6; 최대350 cap과0 사망. QE positiveHP<1 공개Q는 별도 미측정 |
| lesson_flat_continues | 11 | lesson chapter2: admitted2/flat HP·MP·ST2/natural sink0; HP250.6/ST190.4 |
| actual_clock_rejects | 12 | 실제 beforePlayer probe로 copyens/stale/dt offset/pause/duplicate 거절 시 query/reserve0. 수동physics/privateclocksetter0 |
| source_nr_stops_later | 13 | rates NR 때 이미 적용한 영역 prefix HP250.4/ST190.4 보존, rates 이후 HP/natural0, 기존.28 fallback0 |
| lifecycle_fail_closed | 11 | provider 유실 후 Player binding 유지(true), readyfalse; source/legacy 추가회복0 |

실제 SceneTree/Main/Player/World/SourceResourceAuthority와 originalFusion→Flat→HP/Natural production을 소비했다. G/INV/PASSIVES/lesson/hpR/main-init witness는 생성자 fixture이며 원 시작 장비25 및 실제 Main 파생/전체초기화 완료가 아니다. pixel/GPU/240FPS/캐릭터24장24FPS 검증은0이다.

새 UID6은 Godot ResourceUID.create_id/id_to_text로 exact 신규 script만 생성했다(metadata-only0groups/0imports/0.620797667초). stage userdata는 `EXODUSER-SourceRegenPhase-Isolated-20261014`, 기존 사용자 QA/save 파일 접근0, GUI/서버/기존 PNG 해시·복사·import0이다. 권위 기록은 E/dependency-source-player-regeneration-phase-first/tests/attempt-01-runtime-receipt.json 및 worker-test-receipt.json이다.
