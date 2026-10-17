> 2026-10-17 p_dot_pool 현행: 원본 PASSIVES 식의 typed reader와 current binding 검사/실제 callback을 추가했다. 현재 map 8/25·미연결17이며, 이전7/18·6/19 등은 당시 기록이다. [계약·원 raw·첫 검수](FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md). 실행판·전체 hurtE 완료 아님.

> 2026-10-17 stat_str 현행 추가: 원본 STAT_STR=1.0의 typed reader와 Services callback을 등록했다. 현재 map 7/25·미연결18이며, 아래 이전 6/19·5/20·4/21은 당시 기록이다. [실제 계약과 새 검수](FDG_NATIVE_NORMAL_ENEMY_STAT_STR_OWNER_20261017.md). 실행판 최신화·full hurtE 완료 아님.


> 현재 콜백 계약 (2026-10-17 player_view 연결): Services 공개 map은 기존 typed4 + lesson + `player_view` = **6개**, 필수 미연결 callback은 **19개**다. 아래 이전 단위의4/21·5/20 또는 player_view 미등록 표기는 당시 source/검수 이력이다. actual ENEMY V5/kernel caller·전체25 ready는 아직 등록/완료가 아니다. 정확 현재계약은 `FDG_NATIVE_NORMAL_ENEMY_PLAYER_VIEW_CALLBACK_20261017.md`를 따른다.


> 현재 콜백 계약 (2026-10-17): 실제 Services 공개 map은 기존 typed4 + `parry_lesson_active` = **5개**, 아직 미연결인 필수 callback은 **20개**다. 아래 이전 단위의 map4/미연결21 및 lesson callback 미등록 표기는 당시 source/검수 이력으로 보존한다. 실제 ENEMY V5/normal hurtE caller·전체25 ready는 아직 등록/완료가 아니다. 이번 연결의 범위는 `FDG_NATIVE_NORMAL_ENEMY_LESSON_CALLBACK_20261017.md`를 따른다.

## 실제 Main lesson file-init/current guard 연결 — 2026-10-14

실제 Main은 World/Player를 생성하기 전에 원 lesson holder를 만들고 Root publish_file_init을1회 소비한다. 원 SOURCE_BOOT/current=false 7개 partial 필드는 입력 이력으로 유지하고 실제 published current guard를 별도로 읽는다. Main wrapper LIVE Callable은 cold에서 null/NOT_READY이며 현재 holder의 게시·교체·철회를 따라간다. 실제Main을 해제하면 wrapper Callable이 무효가 된다. 외부가 강하게 보유한 Root holder의 수명과 Main 권위는 구분한다.

새 실제Main FIRST3그룹30(13/10/7) /4.374504333초/exit0/FAIL0/SCRIPT0/Parse0/ERROR0, Camera2D warning1 보존. production/test수리0, 이전117/145/88/71/원lesson7/137 재연0. 교체2→3/revoke는 명시 actualholder public-test publisher이며 원전체controller 자동진행을 뜻하지 않는다. 현재source G.on=false/pre_stage, controller.tick/start/UI/skipKey/reset/storage/G activation/updategate/HPSTMP automatic은 아직 미연결이다. 최신 API/검증은 FDG_GODOT_MAIN_SOURCE_LESSON_20261014.md 및 FDG_GODOT_MAIN_SOURCE_LESSON_FIRST_20261014.md를 따른다. 아래독립helper/과거인수 상태는 역사로 보존한다.

# 실제 Source Player 초기화 서비스 조립 — 2026-10-14

신규 `native_source_player_initialization_services.gd`를 저장했다. 기존 actual Providers bundle과 같은 Player/World/State/Resources를 ordered dispatcher에 연결하는 weak-reader bridge다. 본 worker의 runtime/import/기존 성공 검사 재연은 0이며, 첫 actual Main 신규 검증·실제 적용 결과는 primary 인수 전이다. 저장된 코드 자체를 전체 bootstrap·공개 플레이·시각 품질 완료로 표시하지 않는다.

## API 및 소유

| API / 산출물 | 실제 계약 |
|---|---|
| `configure(player:Node2D,world:Node,state:Node,resources:Node,providers:Object,dispatcher:Object,bridges:Dictionary={})->bool` | 6인자 production 기본 구성. actor Tree 진입 전만 허용하며 동일 actual Main/World/Player/source owners·current5 domain·원 provider10과 dispatcher 공개 cache API를 확인한다. 성공 후 같은 Services 재configure0. optional7 bridges는 실제 attack plan Callable만 가능 |
| `get_services()->Dictionary` | lifecycle 유효할 때만 아래 schema/helper5/provider_maps5/Callable6를 가진 실제 서비스 dictionary. Object와 Callable은 이 authority 경로에만 공급하며 snapshot에 내보내지 않음 |
| `is_source_context_ready()->bool` | same actual source owners/현재 domain/owned OPT identity/lifecycle 준비. preTree 구성과 이후 sameTree read-only 소비가 가능하며 dispatcher configure 전 getter가 아직 null인 상황을 actor 오류로 취급하지 않음 |
| `read_current_options()->Variant` | 실제 SourceOptions의 같은 current Dictionary reference. 누락/교체/owner 손실은 null이며 OPT 필드 보충0 |
| `get_source_options_state()->Object` | 유효 context에서만 실제 보유 SourceOptions 객체. Main publication·설정 restore 실행을 의미하지 않음 |
| `get_snapshot()->Dictionary` | source current/lifecycle, helper명/맵키, OPT35·phase·signed status, G.on, cohort_id, delegate/invalidate 계수 및 범위 진단. JSON-safe primitive/Dictionary/Array만; Object/Callable/Node/WeakRef 유출0. nonfinite/비직렬화 값은 진단 문자열로만 표시하며 provider 값 보정에 사용하지 않음 |
| 소유 2파일 | `godot/scripts/native_source_player_initialization_services.gd`, 이 문서. Main/Player/State/Authority/Providers/원 helper/다른 문서·WIP는 편집0 |
| 사전 부재 | parent `7432c0912ccafae79305e16d66449e4565a1fd71` 기준 두 신규 경로 WORK/HEAD 없음. 외부 `dependency-source-player-initialization-first/services/before-save/new-path-absence.json`; Git mutation0 |

## Dispatcher 서비스 계약

schema는 `exoduser.godot.source-player-initialization-services.v1`이다. Main은 Services와 Dispatcher를 실제 강참조하고, Services는 context·dispatcher를 WeakRef로만 보유한다. `Readers`가 원 helper에 유지되더라도 reader→Services는 WeakRef여서 소유자 유실을 오래된 값으로 감추지 않는다.

| key | 실제 값 / 위임 |
|---|---|
| `health` | 새 원 `player_health_parameters_source` instance |
| `defense_speed` | 새 원 `player_defense_speed_parameters_source` instance |
| `shield_poise` | 새 원 `player_shield_poise_parameters_source` instance |
| `effective_stats` | 새 원 `player_effective_stats_source` instance |
| `resource_parameters` | 기존 Providers bundle의 같은 `parameters` instance; 두번째 ResourceParameters 생성0 |
| `provider_maps` | 위 helper5의 원 PROVIDER 상수에 맞춘 Callable dictionary5. helper configure·source run은 dispatcher 책임 |
| `source_ready()` | 실제 source context bool. fullBootstrap/Main-full 준비와 별개 |
| `cohort_context()` | `{cohort_id,authority:'actual_Main/source_player_initialization',current_main:true}`. 실제 Main script path/World.parent/Main fields identity가 유효할 때만. id는 Services 실제 ObjectID와 정적 `applyStats_prefix` 문자열이며 새 clock0 |
| `write_sink(packet,index)` | actual `State.commit_native_source_initialization_write(packet,index)` 1회 위임. State의 실제 Actor/Resources/ownedP 선택을 복제하지 않음. writer는 preTree·unparented actor·pause 아님이 필수 |
| `invalidate_sink(packet)` | 원 `invalidate_eq_caches`/`game.html:16934`/targets `['_eqAffixCache','_eqStatCache']`/writes[]의 정확4키와 dispatcher-active·constructor gate를 확인한 뒤 같은 actual Affix.invalidate_affix_cache→Reference.invalidate_eq_stat_cache 각각1회. 다른 cache·source 상태 쓰기0 |
| `attack_early_plan()` | 실제 새 Root BaseAtk instance의 `plan_early_packet()`를 1회 위임. 원 내부 current before/plan 및 공식 `early_packet`을 사용; scalar.run/sink 이중 호출0 |
| `attack_crystal_plan()` | 같은 Root BaseAtk의 `plan_crystal()`를 1회 위임. configure_crystal_reader에 실제 dispatcher captured crystal과 actual currentP reader 제공 |

attack 결과에 `ready` key가 없는 경우 원 `status=='READY'`일 때만 integration `ready=true` 메타를 추가한다. 원 packet/수치/expr/source 값을 변환하지 않는다. source callback 결과가 Dictionary가 아니거나 owner가 사라지면 NOT_READY/packet:null이다. optional bridges의 실제 callback이 유실되면 default로 바꿔 성공시키지 않는다.

| BaseAtk 공식 packet | 원 위치 / 수치 책임 |
|---|---|
| EARLY kind | `apply_stats_base_attack_early`, packet.source=`game.html:28587-28588`, write.source=`game.html:28588`. 원 G.on/stage 식은 Root producer만 소유; 서비스의 15/2/8 재계산·NORMAL fake0 공급0 |
| CRYSTAL kind | `apply_stats_base_attack_crystal`, packet/write.source=`game.html:28602`. 원 `P.baseAtk+=~~_cr.atk`와 ToInt32는 Root producer만 소유 |
| planning-only | 실제 G/P reader를 configure하고 legacy sink와 packet sink는 비워 둠. 원 readiness의 missing sink/packet_sink는 snapshot에 그대로 남는다. plan readiness와 적용 완료를 혼동하지 않음 |
| optional7 | `{attack_early_plan:Callable,attack_crystal_plan:Callable}`의 supplied 실제 함수만 위임 가능. 값/공식/성공용 fixture 제조0 |

## 현재 readers와 공유 plan

| 소비자 | provider keys / 실제 공급 |
|---|---|
| ResourceParameters | `player/stats/passives/inventory`→실 bundle reader; `eq_affix/eq_stat/lv_b`→같은 original Affix/Reference; `grit/crystal_effects`→기존 parameter_providers의 실제 Callable. conditional key는 원 map에 있을 때만 추가 |
| Health | `player/stats/passives/inventory/g/diff_signed/eq_affix/eq_implicit/lv_b/crystal_stats/grit_hp_flat`. G/P/STATS/PAS/INV는 같은 owned current Dict, implicit은 같은 Formula.eq_implicit, grit_hp_flat은 같은 Parameters.read_source_grit_total |
| DSP | `player/passives/eq_affix/eq_implicit/grit_total/resource_plan/hp_mhp_28582` |
| Shield/Poise | `player/inventory/eq_affix/resource_plan` |
| Effective | `player/stats/cohort/current_cohort` |
| current helper 호출 | 호출 때마다 actual bundle/context를 검증하고 같은 original instance의 공개 함수를 호출. owner 유실 뒤 cached Affix/Reference 값을 직접 반환하는 우회0 |
| 공유 cache | 아래 public dispatcher readers로만 위임. 동일 pass plan/crystal/cohort를 Services에서 다시 만들거나 계산하지 않음 |

| 공유 reader | 실제 공개 API / 초기 상태 |
|---|---|
| resource_plan | `read_captured_resource_plan()->Variant` |
| crystal_stats / BaseAtk crystal | `read_captured_crystal_stats()->Variant`; 실제 source28600 뒤만 유효한 `{status,value:sameCr,stage}` |
| cohort | `read_captured_cohort()->Variant` |
| current_cohort | `read_current_initialization_cohort_id()->Variant` |
| hp_mhp_28582 | `read_hp_initial_gap()->Dictionary` |
| configured-before-run | 위 cache가 아직 null인 것은 초기 상태다. fake plan/빈 crystal/zero cohort로 채우지 않음. dispatcher는 자신의 공개 weak bridge로 해당 provider key를 바인딩하며 실제 source 순서에 따라 cache를 만든다 |

## 실제 OPT·context·수명

| 항목 | 정확 계약 / 한계 |
|---|---|
| OPT 구성 | 원 SourceOptions.initialize_source_boot(false) 1회: 실제 Godot nonElectron false. 이어 `set_current_phase('current_pre_restore')`; 같은 실제 object/map을 signedDifficulty.configure_current_opt_reader에 연결 |
| source OPT35 | 원 defaults35를 원 initializer만 생성. source parts80/diff5/fpsCap0 등은 원 값이며 renderer cap240과 다른 domain이다. 이 서비스의 NORMAL label·signed0 literal·restore fallback0 |
| signed difficulty | 원 `diff_signed()`가 호출 때마다 실제 OPT reader를 읽는다. 공급자는 값을 미리 계산/cache하지 않음; metadata phase는 Main publication 증거가 아님 |
| OPT identity/loss | source initializer의 actual current Dict identity를 보관. map 교체·원35 필드 손실·옵션 owner 손실은 NR. 같은 actual map의 source 값은 그대로 읽으며 설정값 clamp·coercion 재구현0 |
| actual Main | `World.get_parent()`의 script resource_path=`res://scripts/main.gd`; 같은 Main의 world/player/source_state/source_resources/source_providers/source_initialization fields가 보유한 actual 객체와 일치. main.gd preload cycle0 |
| beforeTree→live read | 처음 configure는 actor Tree 진입/ready 전. 이후 actual sameTree/World.player 동일 actor여야 현재 readers를 유지. Tree에서 빠진 ready actor를 새 생성자로 위장하지 않음 |
| same State/Resources | 실제 스크립트와 각 public Player/World getter·같은 원 Providers ownership을 대조. State/Resources의 foreign reparent, queued/free owner, Main/World 재배치/교체, lost Providers/Dispatcher는 NR |
| source G | actual G는 현재 source boot `on=false/pre_stage`. 실제 field를 읽는 것이며 전체 initStage/source global bootstrap 완료로 표시하지 않음 |
| writer/read 분리 | pause/current read는 source context와 writer guard를 분리. live Tree actor에 source initialization write0; Node/clock/HP/position/state setter0 |
| 보존 | Main/Player/State/Authority/Providers/원 source helpers·frozen source16/맵/원 asset/blackBean/QE/protected2_3 본문 변경0. 새 PNG 복사/해시/import0 |

## 실행 상태와 기록

| 항목 | 현재 상태 |
|---|---|
| 실제 산출물 | 신규 production bridge 저장. helper configure/run·actual source writes·실제 Main 부트 검증은 primary가 첫 새 단위로 실행 |
| worker 실행 | runtime0/import0/Main0/GUI0/server0/Git mutation0/old success 재실행0 |
| 준비와 완료 구분 | source_context_ready는 실제 현재 object/lifecycle의 준비만. full_bootstrap_ready/main_full_ready/public_play_proven=false |
| 아직 주장하지 않는 결과 | 첫 parse/PASS/전체 applyStats·full stage bootstrap/공개 입력 교전/시각 품질/240FPS 달성. 최초 검수 결과는 별도 primary ledger |
| 관련 검색 | 코드 후 docs 전체 rg와 literal recursive grep 수행; 외부 services/docs-search-receipt.json 및 두 원시 로그에 범위 기록. 다른 담당 소유 현재 문서는 primary 동기화 |

## 23. MAP PRODUCTION REPORT

| 항목 | 결과 |
|---|---|
| MASTER / LARGE / MEDIUM / GROUND / LANDMARK / SMALL DETAIL | 원 geometry/collision/nav/environment/START·EXIT/배치 변경0. retained 맵 제작 가이드1047줄 적용 |
| PLAYABLE / COMBAT | actual same source context→ordered dispatcher 서비스 조립만. source G.pre_stage 및 전체 bootstrap 한계 유지 |
| CAMERA QA | 기존 인간 앱/Web 화면 조작0·새 픽셀 검수0 |
| TECH QA | 새 runtime/parse/import 대기, 기존 성공 반복0 |
| VISUAL VERDICT | RETOUCH — actor 모델/원화24장24FPS/글리프 품질/최저사양240 성능은 이 서비스 조립 증거로 승격하지 않음 |

## Source sample globals 실제 소유 — 2026-10-17

configure는 Readers 생성 뒤 신규 _initialize_source_sample_globals()로 native_source_sample_globals.gd의 원 선언 boot1을 한 번 소유한다. 신규 공개 read_current_sample_context(caller:Node)->Dictionary는 기존 context identity/lifecycle과 같은 weak Main caller를 검증한 뒤 현재 owner의 값을 읽는다. owner 부재/철회는 NR이며 getter 재초기화·fallback1 없음. discard는 owner를 해제한다. 실제 Main fireball sample dispatcher가 이 current getter를 소비하고 projectile delivery 준비는 별개 NR로 유지한다. 첫 fixture parse 실패/수리 후16 PASS와 실제 전체 Main 미실행 한계는 FDG_NATIVE_FIREBALL_SAMPLE_GLOBALS_20261017.md를 따른다.

## Source clock 선언·렌더 입력 authority — 2026-10-17

동일 Services가 prefix v2 원 instance를 소유하고 configure의 sample globals 뒤/OPT 전에 declare_dt_sp를1회 소비한다. _source_clock_declared_once는 discard에도 유지하여 owner 손실 뒤 재선언을 거절한다. 신규 capture_native_source_render_input(Main,input)->bool은 같은 actual Main/current Services·동기 input window·새 raw serial/timestamp를 검증하며, true는 플랫폼입력 수락뿐이다. 신규 read_source_clock_input_snapshot(Main)와 read_current_source_projectile_context(World)는 현재 timestamp·실OPT fpsCap까지연결/첫gap_frame_callbacks body미연결을 NR로 유지한다. 같은 caller/scope 생성·실callback16 PASS 및 실제 SourceState/context 미실행 한계는 FDG_NATIVE_SOURCE_CLOCK_INPUT_AUTHORITY_20261017.md를 따른다.

## 실제 native source-frame callback — 2026-10-17

같은 Services가 Frame v3 configure에기존 private prefix를주입하고선언한다. actualinput admission 동기window에서opaque String 호출ID를발급하고별도 SOURCE_NATIVE_RENDER_CALLBACK context로timestamp→실current OPT fpsCap까지만소비한다. rawLAST scope변경0/첫gap_frame_callbacks는owner_gap_no_receipt PARTIAL_NR. active ID는호출끝폐기,history ID는현재권한아님. Frame/prefix identity·철회/재선언거절 및새16첫PASS/원검사재연0의정확범위는 FDG_NATIVE_SOURCE_FRAME_CALLBACK_20261017.md를따른다. 전체source context/Main scene/throw 종료는未.


## 일반 hurtE 실제 provider 4 Callable 접점 — 2026-10-17

| 변경 위치 | 현재 계약 |
|---|---|
| Main/Services | Main.get_native_normal_enemy_damage_provider_callbacks()는 현재 Services 소유 eq_affix/u_eq/p_atk_mul/melee_ref 네 Callable만 반환한다. 매조회 same Main/Services/actor/World/State/Resources/Providers 수명을 확인하고 기존 Main affix API 또는 current bundle의 원 Dictionary를 그대로 소비한다. 다섯 current domain/OPT eager 조회·scalar fallback·숫자 snapshot 없음. |
| 기존 context | _source_owner_error로 기존 ownership prefix만 추출하고 _context_error의 current_g→current_p→current_stats→current_passives→current_inventory→OPT 검사 순서를 유지한다. |
| 검증/미완 | 새 method-extraction/명시 holder·provider 대역 fixture 첫31/31 PASS/양로그0. 실제 전체 Main/configure/원 provider 수식·V4 caller·다른21 owner·전체 normal hurtE·게임/export/PC는 미검증/미연결이다. 후보 V4 첫108중3FAIL 이력은 별도 보존하며 제품 채택0. |

정확 API·raw status/metadata·수명 reason·검수 범위는 [FDG_NATIVE_NORMAL_ENEMY_PROVIDER_BINDING_20261017.md](FDG_NATIVE_NORMAL_ENEMY_PROVIDER_BINDING_20261017.md)를 따른다. 앞선 개별 단위의 당시 미연결/실패/검수 기록은 이력으로 유지한다.


## 실제 parry_lesson_active Callable 연결 (2026-10-17)

| 항목 | 현재 계약 |
|---|---|
| Services map | 기존 eq_affix/u_eq/p_atk_mul/melee_ref 순서 뒤 parry_lesson_active를 한 개 추가한5개. 값은 같은 Services 소유 Callable이며 `read_normal_enemy_parry_lesson_active()->Dictionary`를 가리킨다. 나머지20은 미연결이다. |
| 실제 조회 | 기존 ownership-only _normal_enemy_provider_error 통과→기존 actual Main.read_native_normal_enemy_lesson_status1회→같은 ownership prefix를 재확인한다. current5domain/OPT/chapter/guard/controller eager조회나 새원천/state 없음. 기존4 helper와 dispatch·query순서 불변. |
| 원 결과 | 정상 context면 READY/NR/지원 밖 metadata도 원 Main Dictionary reference 그대로. 조회 중 cohort 유실은 status NOT_READY/readyfalse/active생략 + actual_normal_enemy_lesson_context_lost/context_reason와 원 read_result를 보존한다. unknownfalse/scalar 변환 없음. |
| 새 검수 | 실제 새 Services/Main 메서드+명시 holder/provider/lesson API stand-in의 최초25/25PASS, exit0·양로그 ERROR/WARNING/leak0. map생성query0/다섯키순서/같은Service·lesson1회/미준비raw·전후Service/actor/World/SourceOwner교체·sourceMain교체/epoch/queued와raw중첩 보존. 25는 검사 수이며25owner ready가 아니다. |
| 검증 한계 | full Main/Services.configure/실제 SourceLesson publication/원수식/V5제품copy·caller·게임 미검증/미등록. old49/31/9/108/parse 재연0. 첫25 뒤 map설명 comment만 Four→Five로 바꿨으며 fixture 원hash는 당시값 유지·실행한 메서드본체는현재와정확대조한다. |

기존 단위의 실패·성공·원자료 시각과 자연publication 미검증 한계는 바꾸지 않는다. callback5 노출을 전체hurtE/최신게임 완료로 세지 않는다.


## 실제 player_view rawP 콜백 연결 (2026-10-17)

| 항목 | 현재 계약 |
|---|---|
| 등록/API | 기존5 순서뒤 player_view → Callable(currentServices,read_normal_enemy_player_view), 인자0/Variant. map6·미연결19. Main의 기존 getter delegation은 불변이다. |
| 실제 조회 | 기존 ownership-only prefix→같은 actualState.read_current_p1회→동일prefix. 유효하면원ownedP reference 그대로, 원null 또는pre/post context유실이면null. 새status/envelope/복사/filter/optional필드·기본0추가없음. |
| sync/수명 | State 기존getter가ownedP의hp/mhp/x/y/s 및기존다른필드를동기화한다는공개계약을소비한다. Actor/Resource를새로쓰지않는다. post loss 전에이미적용된ownedP sync를rollback/환불하지않는다. 다른domain/OPT/chapter/clock선조회없음. |
| 새 검수 | 실제Services wrapper/Main getter메서드+명시State/public-P sync·holder/provider 대역의첫26/26PASS,exit0·양로그 ERROR/WARNING/leak0. map0query/6키·같은Services/P1query/sameP와optional identity·freshP/원null·전후교체/보존된sync·Main유실을확인. 기존State본문·fullconfigure·자연runtime은검증하지않았다. |
| 미완 | 기존5/ownership본문불변. old25/64/49/31/9/108/parse·성공proof 재연0. V5/unusedkernelcopy·실caller·19dummy·25presence우회0. full25/fullhurtE/latestfullfalse/실게임·PC/export未 유지. |

이전 각단위의수송/시각/원실패·stand-in검수한계를소급하지않는다. 26은새검사수이며엔진전체완료율/25owner준비가아니다.


## 원본 stat_str 공개 연결 — 2026-10-17

| 항목 | 현행 코드와 범위 |
|---|---|
| formula / Services | 기존 STAT_STR=1.0 → 새 stat_str()->Dictionary → read_normal_enemy_strength_multiplier()->Dictionary. 인자 각각0. 원본 _ok의 READY/value(float)/non_finite/source/undefined_reads/reason을 그대로 전달한다. |
| 소유권 / 실패 | 실제 current Main/Services/Providers 검사 전후 및 formula 객체·Script·수명 동일성 검사. 소유권 실패는 NOT_READY/provider=stat_str, query 후에는 read_result 보존. 부재 numeric value/default 0·1 추가 없음. |
| callback 등록 | 기존 6개 뒤 stat_str. 현행 7/25·미18. getter는 formula/current P/domain을 eager query하지 않는다. 기존 여섯 callback·25 presence·원 query 순서 변경 없음. |
| 새 검사 / 제한 | 실제 formula script/새 reader와 정확 추출 Services graph + 명시적 holder stand-in의 첫 신규25/25 PASS, exit0·오류/leak0. full Main 자연 configure·실제 gameplay 미검증, 기존 성공 검사 재실행0. |
| 다음 연결 | 현 V5 stat_str 세 scalar 위치는 typed 미지원이라 실제 바인딩0. 기존 ENEMY V6의 세 위치 typed 처리·인수 후 실제 caller를 연결해야 한다. latest_full_game=false 유지. |

상세 API·raw 예·실패 이유·검수 한계는 [stat_str 실제 소유자 계약](FDG_NATIVE_NORMAL_ENEMY_STAT_STR_OWNER_20261017.md)을 따른다. 기존 State player_view/read_current_p 및 다른 수치·계산식·저장 계약은 변경하지 않았다.


## p_dot_pool 실제 소유자 추가 — 2026-10-17

| 항목 | 현행 소스 계약 |
|---|---|
| 원식 / API | Formula.p_dot_pool()->Dictionary(0): 기존 _container PASSIVES → 1+_passive_or0_mul(actualDict,"pDot",0.05) → 기존 _ok/_fail. 원 pDotPool @game.html:28068. 숫자·식·전역 상태 변경 없음. |
| binding 공개 검사 | Formula.is_passives_reader_bound_to(expected:Callable)->bool, Passives.is_current_passives_reader_bound_to(expected:Callable)->bool. 기존 bound/valid/Callable target·method/equality만 검사하여 추가 domain 조회·저장0. |
| 실제 bridge | Services.read_normal_enemy_dot_pool_multiplier()->Dictionary(0), 기존7 뒤 p_dot_pool. current Main/Services/Providers→같은 Formula/Passives/current_passives Callable/Script·binding을 전후 검사. Formula 1query, 정상 raw 같은 참조·원 status/metadata 유지. |
| 값 / 실패 | 유효Dict 필드 absent/null/falsy/NaN은 원 truthiness로1.0; owner 유실은1/{} 제조0. 기존 bound null→SOURCE_THROW 및 status 손실 경로 불변. invalid String/Infinity의 non_finite 보존; custom Object·전체 문자 grammar는 기존 부분 도메인 한계. context/객체·Script·binding post loss는 top NOT_READY/read_result 원 raw/최상위 numeric value0. |
| 현행 / 검수 | map8/25·미17, 25 presence 불변. 첫 신규 행동76/76+setup37/37 PASS/exit0/양로그 오류·leak0. 실제 Formula/Passives binding·정확 Services +명시 holder/current-reader stand-in 범위, 전체 State/Main·자연 수명·실전 미검증. setup bind query1/runtime query1과 실제 rawgrit/resource 부수조회未검증을 구분한다. |
| 다음 | V6 p_dot_pool scalar 전체4곳(170/173/566/570) typed 미지원·직결0. 첫 접점은170/173이다. 별도 consumer 인수 전 실제 kernel 등록/full25/full hurtE/latest 게임 완료0. |

상세는 [p_dot_pool 실제 소유자 계약](FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md)을 따른다. 원 State/Providers getter 및 Q/E·저장·이전 승인 byte와 source sync 이력을 보존한다.


2026-10-17 사용처 정정: V6 p_dot_pool 전체는4곳(170/173/566/570, 원42163/42164/42426/42429)이며 첫 접점만170/173이다. 모두 not DOT이고, 뒤 두 곳은 각각 poisonDot/fireDot 어픽스값>0 및 해당 스택 write 후 결과<10에서 독립 조회한다. 각 지점 당시의 dmg×0.10 누적식·원 순서·lazy를 보존하며 네 곳 모두 typed 미전파다. [네 곳의 정확 조건](FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md)을 따른다. 원 API/코드·이전 PASS는 변경하지 않는다.
