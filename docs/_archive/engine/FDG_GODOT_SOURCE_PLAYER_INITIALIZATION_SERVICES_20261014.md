> 2026-10-17 ENGINE 현행: callback **12/25·미13**. play_time은 el_mul 바로 다음에 동일 Services self의 arity0 Callable로 등록했다. owner 첫 격리 공개 API 검수는 인수됐으며 자연 clock·실게임 인수는 미확인이다. D9는 직전 공통 소스 인수이며, 이번 main/I/R 소스 정렬은 아래 통합 정본과 단위 receipt의 실제 HEAD·tree를 기준으로 확인한다. V12 후보는 소스 인수·첫 FAIL·별도 보완 한정성공으로 구분하며 제품 copy·World hook은 수행하지 않았다. 아래 이전 단계 숫자·원검수 결과는 당시 이력으로 보존한다. 실제 local/remote commit 상태는 단위 receipt를 따른다.

> 2026-10-17 ENGINE WIP 현행: 실제 callback **9/25·미16**. 신규 격리 행동41/41과 신규 map 경계 static9/9만 인수 범위다. 원 첫 parse 실패는 보존한다. 이 WIP를 main/R/served·전체 게임 최신화 완료로 해석하지 않는다.

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


## 2026-10-17 ENGINE WIP: Main 소유 l_eq 이식

이 절은 현재 ENGINE WIP의 추가 구현 상태다. 기존 본문·동기화 checkpoint·과거 검수 결과는 해당 당시 기록으로 보존한다.

| 항목 | 현재 코드와 검증 상태 |
|---|---|
| 소유/최초값 | actual Main 인스턴스 하나를 native source-script context 하나로 대응하는 신규 설계. Main private Variant _source_l_eq_cache=null 선언 1회; Formula/Services/actor 교체는 초기화 사유가 아니다. |
| 실제 경로 | Main source-init 경계→Services weak current bridge→Formula.l_eq(stat)→Main-owned lazy query→State의 같은 actual INV/slot/item/special에 한정된 누락 필드 복원. 값은 actual legendarySpecial.val에서만 파생, 범용 setter 없음. |
| 순서/값 | cache={} 설치 후 INV/17 slot 순회. 첫 non-undefined, defined null/false/0/빈 문자열/NaN 보존·raw truthy 또는 숫자0. native 미표현 undefined/ToPropertyKey/prototype operand는 raw/prefix를 포함한 typed partial, retry/clear/rollback 없음. |
| cache hit/수명 | domain/INV/writer eager 조회 없이 새 metadata ownership guard. 같은 Main의 helper/actor 교체에도 cache 유지, 옛 caller와 Main 유실 거부. 기존 ordered affix/reference invalidation sink와 원 5개 reset 위치는 l_eq reset 권위로 확장하지 않음. |
| 등록/검수 | 현재 ENGINE WIP callback map **9/25·미16**. 기존8 뒤 실제 l_eq=Callable(self,read_normal_enemy_legendary_equipment) 하나를 추가했다. 원 첫 fixture parse 실패·행동0은 보존하고 header5줄만 수정한 새 namespace의 최초 신규 행동41/41 PASS도 별도 유지한다. 이번 등록 경계만 새 static9/9, 기존 행동·parser·static 검수 재실행0. 전체 hurtE 연결·실게임·main/R/served 반영은 미완이다. |
| 범위/한계 | full Main/Services.configure/State 자연 lifecycle·실 INV/save·원 JS boot/restore·게임/export/PC 최신판 완료 증거 없음. 초기 plan metadata에 불필요한 Q/E 선언·필드 및 Main876 Q currentOptions 할당 한 줄/Frame metadata도 포함됐으며 원본 보존·캐시 권위에서 제외. 실제 Q/E 실행·변경 없음. |

정확한 API·17 slot·최초 실패 로그·미소유 범위는 [Main 전설 장비 캐시 계약](FDG_NATIVE_MAIN_LEGENDARY_EQUIPMENT_CACHE_20261017.md)에 기록한다.


## 2026-10-17 ENGINE WIP: typed rand 실제 소유 경계

| 항목 | 현행 코드/한계 |
|---|---|
| actual registry | 현행 ENGINE WIP10/25·미15. 기존9 뒤 rand=Callable(self,read_normal_enemy_random_unit) 인자0을 등록했다. V9 scalar _rand에Dict직결0/전체hurtE·최신게임완료아님. |
| 새 API | Main.is_native_source_rand_context_current(Services,World), Services.is_native_main_random_bridge_current 및read_normal_enemy_random_unit()->Dictionary, World.read_native_source_random_unit(Main,Services,receipt)->Dictionary. |
| 기존 API 보존 | World.sample_native_random_unit()->float 선언0arg 유지. private공유구현1개가counter+=1→동일float(randi())/2^32를단1회수행, legacy는null/typed는freshreceipt로같은구현을호출한다. optionalarg 변경안미채택·publicbody자체는위임으로변경. |
| 실제 완료 | Services의percall localreceipt에계산완료뒤에만rawsample을기록. 정상0는READY0, marker부재/default0은NR/UNKNOWN, preloss만명시NONE·query0, postloss/typedmalformedreturn도원rawreceipt/read_result·소비prefix보존. 새persistent RNGstate/cache/epoch·retry/rollback/추가draw0. |
| 부분 지원 | 실제float finite[0,1)완료·전후sameowner/Script/liveTree가새경계READY조건. unexpectedraw는UNSUPPORTED/raw보존/값cast·clamp·전역finite0. primitive내부무관측failure와원JS/stream동등은미증명. |
| 첫 검수 | 신규정적9/9·신규격리행동30/30/exit0/result존재·양로그diagnostics0. primitiveleaf대역·명시holder/Statepredicate·default0/typedmalformedreturn모사범위, 실RNG/엔진abort/자연fullMainWorld동등아님. old41/95/진단/통과parse재연0. |
| 보존 | sourceWIP는I만·최종ROOT인수전main/R/served0. 원첫실패/selector·thread과대범위이력과그한계를새성공으로소급수정하지않는다. |

정확signature·schema·freshreceipt구조한계·검수범위는[typed rand 소유경계](FDG_NATIVE_NORMAL_ENEMY_RAND_OWNER_20261017.md)에기록한다.


## 2026-10-17 ENGINE WIP: rand 10번째 실제 등록

| 항목 | 현재 상태 |
|---|---|
| registry | eq_affix,u_eq,p_atk_mul,melee_ref,parry_lesson_active,player_view,stat_str,p_dot_pool,l_eq,rand 순서. 실제10/25·미15. |
| callback | 같은 Services self의 read_normal_enemy_random_unit()->Dictionary 인자0. purpose/line은인자가아니며기존Main공개getter의forwarding을재사용한다. |
| 변경 경계 | Services map literal1개만추가. 기존9/helper/owner/sharedsampler/수식/primitive/Main/World본문은그대로다. |
| 새 검수 | 등록delta static7/7, runtime0. 키10/기존9순서·sameSelf/method·0arg·typedWorld route·다른Services bytes보존·생성시추가reader/RNG/domainquery0 확인. 기존readinessguard 전체query0은미입증이다. |
| 보존/한계 | 기존30/41/95·진단/통과parse재연0. main/R·실게임·producer/V9제품copy·scalarDict직결·ENEMY TASK·Worldhook·dummy25우회0. 이전실패/범위초과이력도그대로다. |


## 2026-10-17 normal hurtE el_mul typed owner (owner WIP 당시 기록; 현재 registry11은 후속 등록 표 참조)

| id / 항목 | 코드와 일치하는 현재 계약 |
|---|---|
| 소유 / 필드2 | Main._native_source_elements:Variant의 실제 mutable Dictionary1개, 초기값 P0/F1/I2/D3/L4/H5/E6. _native_source_elements_owner_script:WeakRef는 생성시 actual get_script() 증거1개. 초기화 marker·late bind·query-time 생성·loss 재capture/재생성0. |
| 수명 | 같은 Main에서 actor/State/Services/Formula 교체는 같은 EL identity. 새 Main은 별도 object라는 exact field holder 검증 대상. 원JS 선언/TDZ와 Main 생성·weak 구성 시점은 다르며 원current EL property 불변/자연Main 수명 동등 증거가 아니다. |
| API / 인자2 | Formula.el_mul(a:Variant,d:Variant)->Dictionary, Services.read_normal_enemy_element_multiplier(a:Variant,d:Variant)->Dictionary. Main.read_native_source_element_multiplier(a,d,formula,services,state,providers)->Dictionary가 실제 소유자다. |
| 원 순서 / 2.0 | F→I, I→F, D→L, L→D, D→H, H→D, E→L, L→E 순서. 각 if의 첫 actual own-member를 읽고 a와 strict 비교가 참일 때만 둘째를 읽는다. 반복 key도 재조회하며 eager7 snapshot/고정쌍 lookup0. |
| 원 꼬리 / 0.5 / 1.0 | 모든 pair 실패 뒤 a===d일 때만 actual EL.P를 읽는다. P와 strict 다르면0.5, 그 밖 정상 완료1.0. owner loss·오류·지원밖에1/0 fallback하지 않는다. |
| 부분 strict 지원 | bool/String/null(JS null만), safe integer int [-9007199254740991,9007199254740991], 모든 float(NaN/±Infinity/±0 포함). int/float는 Number 관계, bool≠number, NaN!==NaN. safe-int는 JS 표현 지원경계이며 게임 수치 cap이 아니다. cast/clamp/전역 finite guard0. |
| 지원밖 | huge int/StringName/undefined 미확정 carrier/Array/Dictionary/Object reference 등은 raw type·a/d reference를 보존한 NOT_READY, top-level value 없음. structural equality/자동 int0·String 변환0. missing/inherited/getter/prototype EL 지원은 미완. |
| guard / 실제 객체 | pre/post weak current identities·actual Script resources·같은 live Tree/World 및 State/Resources parent/current role·claim metadata. Main actual Script는 witness WeakRef와 is_same. 동기 no-await/no-event-pump이며 기존 bind3/legacy preTree 경로는 변경하지 않는다. |
| 진단 / 실패 prefix | 실제 방문 key/presence/raw value·type만 EL_reads에 쌓는다. 전체 EL map getter0. postloss는 원 owner packet을 수정/삭제/clone하지 않고 새 NOT_READY.read_result에 동일 reference로 보존한다. retry/rollback/refund0. has/key 접근 전체 횟수는 별도 계측되지 않으면 static 범위다. |
| owner WIP 당시 등록 / 소비 | 당시 실제 callback map10 / 미등록15. 현재11/미14는 후속 등록 표를 따른다. el_mul 등록11·V11·World hook·다른 consumer·scalar default0 소비0. 기존 방어구 scalar adapter와 별개의 typed API이며 그 adapter/원 game.html 수식은 변경0. |
| 검수 | 원 첫 영향 fixture와 source boundary static은 아래의 별도 기록으로 보존한다. 실행별 증거를 아래 표로 구분한다. 원 첫 실행 wholefalse는 보존하며, 승인된 입력 구성 수정 후 실패 행과 당시 미실행 경계만 새25case/74check+setup4에서 통과했다. 단일 전체 재실행 PASS가 아니며 제품 코드 수정/원기대 완화/기통과45 재연은 없다. 현재 완료는 명시 holder의 typed owner 부분 검증까지다. full Main/원JS realm/full25/fullhurtE/최신 실행 게임/PC 완료는 미확인. |


### 실행별 검증 기록과 현재 WIP 범위

| 실행 / 실제 범위 | 결과 / 해석 한계 |
|---|---|
| 원 source boundary static | 14/14. 코드 추가·기존 bind3/guard/getter/원9+rand/등록 순서 보존을 확인한 정적 경계다. 이번 마감에서 재실행하지 않는다. 전제품 compile 증거가 아니다. |
| 원 첫 owner 실행 | 23case/46check 중45true/1false, exit1, wholefalse 보존. 앞22case45true는 당시 증거이며 재연0. safe_int_mixed_float 원literal9007199254740991.0/기대0.5는 원파일 그대로다. 당시 진단 문자열 a=9007199254740991,d=9007199254740990.0만으로 원당시 binary값을 소급하지 않는다. |
| 별도 숫자 primitive 진단 | 8측정, Variant8/typed7 비교, exit0. 이 Godot4.7.2 새runner의 Array/typed float literal은433ffffffffffffe, int→float/정확bit control은433fffffffffffff. 같은 represented control값은 혼합비교true. 이 범위 literal형성 discrepancy이며 내부parser 원인·전Godot 정확성·원첫실행 bits의 소급 증거가 아니다. 제품 cast/coercion 변경0. |
| 새 입력 구성 수정 + 첫 미실행 경계 | 새25case/74uniquecheck 전true, 별도 setup4true, exit0. d=float(9007199254740991)만 QA에서 구성하고 a/기대0.5/conditionalP/assertion loop는 그대로다. 입력 타입·정수문자열·정확IEEE64ff를 ownerquery 전에 확인했다. 원45통과 재연0, split실행들을 단일 whole-run PASS로 합산하지 않는다. |
| 새 실행의 실제 한계 | same frozen 추출 newfield/method와 명시 metadata holder 대역. 두독립 holder의 EL별도객체/actualScript WeakRef field witness, 같은Main role교체 ELidentity, lazy/repeatedmember/rawargs/rawresult/postloss prefix를 해당대역 범위로 검증했다. 실제 Main/StateResources 자연configure·Script교체 자연수명·JSboot/current원EL·실게임 actor재개 증거는 아니다. 방문 진단외 Dictionary.has/key 전체횟수는 계측하지 않았다. |
| 현재 source contract | Main actual mutable EL1 + ScriptWeakRef1의 fields2. Formula.el_mul(a,d)와 Services.read_normal_enemy_element_multiplier(a,d)는 typed Dictionary/인자2. pre/post metadata guard·actual Script identity·동기 동일EL object, 원8pair/lazyP/normal2·0.5·1·NR rawref 계약은 위 표 그대로다. 신규 EL writer/marker/latebind/재capture/재생성/전역eq변경0. |
| owner WIP 당시 연결·미완 | 당시 actual callback10/미등록15·EL미등록 기록이다. 현재11/미14는 후속 등록 표를 따른다. 등록11/V11/Worldhook/15dummy/25presence 우회0. 기존9callback 각 부분지원 한계를 승격하지 않는다. full25/fullhurtE/자연runtime/최신 실행 게임/PC 완료는 미완이다. |
| 기록 보존 | 원firstfailure·pre-generation separator guard실패/실UTC未·새helper 위치교정·CRLF정규화 위반/승인prefix복원·source_* initializer metadata 범위초과 이력을 보존한다. 과거에 무접근·append-only·wholeclean이었다고 소급하지 않는다. |
| 문서 검색 범위 | 이전 uncapped928후보/100matchinglines41paths는 matching-line 단위(한줄내keyword dedup)이며 after-scan은append/newownerdoc 작성 전이다. regex전체횟수/성공decode파일수/UnicodeDecodeError 경로는未기록. 이번에는 허용18문서의 현재상태만 새경계1회로 확인하며 전수완결을 발명하지 않는다. |


상세: docs/engine/FDG_NATIVE_NORMAL_ENEMY_EL_MUL_OWNER_20261017.md. 과거 단계의 완료/실패 기록은 해당 당시 범위로 보존한다.


## 2026-10-17 현재 normal hurtE el_mul 11번째 provider 등록

| id / 현재 계약 | 구현 상태와 범위 |
|---|---|
| registry / 현재 | Services.get_normal_enemy_damage_provider_callbacks의 기존 rand 다음에 "el_mul": Callable(self, "read_normal_enemy_element_multiplier") 한 entry를 추가했다. 실제 literal 등록11 / required25 중 미등록14. 과거10/미15·EL미등록 표는 해당 당시 단계 이력이며 현재값은 이 표다. |
| 원10 순서 | eq_affix, u_eq, p_atk_mul, melee_ref, parry_lesson_active, player_view, stat_str, p_dot_pool, l_eq, rand를 그대로 두고 마지막 el_mul만 추가. 기존 entry·getter guard·reader/Formula/Main 몸체와 반환·기존9+rand 부분지원 한계는 변경0. |
| self / 인자2 | 새 Callable은 동일 Services self와 read_normal_enemy_element_multiplier(a:Variant,d:Variant)->Dictionary를 연결한다. Formula.el_mul(a:Variant,d:Variant)->Dictionary, Main 실제소유자 연결의 a,d 인자2와 raw type/reference는 그대로다. |
| 생성 / query 경계 | 새 literal Callable 생성은 reader/Formula/Main/domain/RNG를 호출하지 않는다. 기존 getmap membership/readiness guard 자체가 부수조회0이라는 주장은 하지 않는다. 새등록 확인은 정적경계1회/runtime0이며 Scriptload/QA/parse 재연0. |
| 실제 owner / fields2 | Main actual mutable EL Dictionary1 + actual Script witness WeakRef1. 초기 EL P0/F1/I2/D3/L4/H5/E6. query의 current Script는 witness actual object와 is_same; query-time 생성/재capture/ownerloss재생성·marker/latebind/Formula ELcache·map copy/publisher0. |
| 원 if / lazy 순서 | F→I,I→F,D→L,L→D,D→H,H→D,E→L,L→E 순서의 실제 EL member 조회. 첫 비교가 참일 때만 둘째를 읽고 반복 key는 재조회. 마지막 a===d일 때만 P; 정상완료2/0.5/1, eager7 snapshot/fixedpair lookup·실패1/0 fallback0. |
| 부분 strict 지원 | bool/String/null(JSnull만), safe integer native int [-9007199254740991,9007199254740991] 및 float NaN/Infinity/±0, mixed Number 관계. bool≠number/NaN!==NaN, StringName 자동String0. safe-int는 JS표현 지원경계이고 게임수치 cap이 아니다. product cast/clamp/전역finite/globaleq수정0. |
| 미지원 / raw failure | hugeint/StringName/미확정 undefined carrier/ArrayDictObject reference와 missing/inherited/getter/prototype EL 범위는 typed NOT_READY/raw type·args·실방문prefix·reference 보존/topvalue 없음. postloss fresh NR.read_result는 원ownerpacket을 수정·삭제·clone하지 않고 같은ref로 보존. retry/rollback/refund0. |
| 수명·수행 한계 | 같은Main role교체의 동일EL/newholder 별도EL·Scriptwitness/후손Tree경계/rawref는 명시holder 범위 검증이다. 원JS 선언/TDZ·Main 생성/weak구성 시점·current원EL property권위·불변/실StateResources 자연수명과 동등이라고 주장하지 않는다. legacy preTree/기존guard/getter코드 불변. |
| 소비·통합 미완 | registered11은 실제 typed consumer V11 연결이나 World fullhook 완료가 아니다. ENEMY V11 source/QA·Worldhook·미14 dummy·required25 gate 우회0. 원scalar float/default0로 Dictionary를 소비하도록 바꾸지 않았다. full25/fullhurtE·최신 실행게임/PC·전체 진행률/밸런스 완성은 미완이다. |
| 원 source 정적경계 | 원14/14는 당시 source 보존 정적검사이며 재실행0. 이후 owner WIP docs8/8도 별도 당시 문서경계로 보존. 이번에는 새 literal11/원10순서/타몸체/MainFormula불변/arity2/self·생성query0만 새정적1회/runtime0. |
| 원 first failure | 원23case/46check=45true1false/exit1/wholefalse·원decimal literal/기대0.5는 보존. 앞22case45true는 당시 증거, 재연0. 당시 formatted diagnostic을 실제floatbits로 소급하지 않는다. |
| 별도 numeric 진단 | 새숫자8측정·Variant8/typed7비교/exit0에서 이 실행의 float literal433ffffffffffffe와 converted/bitcontrol433fffffffffffff를 구별했다. 같은 represented값 비교true이며 내부parser 원인/전Godot 정확성·원실패당시bits 소급증명0. |
| 새 입력 수정·첫 미실행 경계 | 승인된 QA 입력 d=float(9007199254740991)만 별도구성, a/기대0.5/Ptrue/assertionloop 불변. 새25case74true/setup4true/exit0는 그 명시holder 범위이며 원45 재연0·서로다른 실행을 단일 wholePASS로 합산0. 제품코드수리나 지원정책변경이 아니다. |
| 역사·보호 | 원firstfailure·CRLF정규화 위반/승인prefix복원·source_* initializer 범위초과·pre-generation separator guard/UTC未 이력은 보존. 과거 무접근/wholeclean 소급0. 보호2_3/marketing/capture·MAP/ART/rig·원game.html 변경0. |
| 검색 metadata | 이번 새영향 scan은 후보929/UTF8성공751/해독제외178, matching-line649/경로114. matching snippets는 줄내dedup/cap없음이며 전체 regex발생수나 모든 binary/text 내용을 완결했다고 주장하지 않는다. 이전928/100/41 및 decode未 한계는 당시 기록으로 보존하며 소급보충하지 않는다. |


## 2026-10-17 play_time typed owner — 검증 WIP 소스 경계

| id / 항목 | 코드와 동일한 현행 계약 |
|---|---|
| 공개 API | Services `read_normal_enemy_play_time() -> Dictionary`, arity 0. callback 등록: 실제 12/25, 미13. el_mul 바로 다음 play_time=Callable(self, read_normal_enemy_play_time), 동일 Services self·arity0 |
| Main 검사 | `is_native_source_play_time_context_current(services, state, raw_g=null, require_g_identity=false)`: 총 4인자, 필수 2 / 메타데이터 선택 2 |
| State 검사 | `is_native_play_time_owner_current(main, expected_player, expected_world, expected_resources, raw_g=null, require_g_identity=false)`: 총 6인자, 필수 4 / 선택 2 |
| State 관측 | `read_native_normal_enemy_play_time(main, services) -> Dictionary`, arity 2 |
| Script 증명 메타데이터 | Main `_native_source_play_time_owner_script: WeakRef = weakref(get_script())` 필드 1개, 생성 시 1회. Script 객체 identity 확인용이며 clock 값·counter·writer·setter·epoch는 추가하지 않음 |
| 범위 | 동일 Services self와 weak Main/State → Main의 현재 `source_initialization_services/source_state/player/world/source_resources` → 기존 State `_g`의 literal `playTime`. 새 native source-context mapping이며 원JS G identity/초기화/자연수명/clock 증가 동등성 증거는 아님 |
| 직접 소유 검사 | 실제 Main Script weak witness / Services·State 실제 Script 객체 / 현재 역할 ref / live 같은 Tree와 parent / State strict bool `_initialized` / actor `INITIALIZED_META` strict bool true / `CLAIM_META` live WeakRef(self). Script path 문자열을 실제 Script-token 대신 사용하지 않음 |
| 제외된 검사 | 기존 일반 getter·legacy guard·Provider/Formula를 호출하거나 수정하지 않음. HP/state/facing/resource parameters/regen/clock domain query 없음. 미검증 `world.player`·resource-ready·legacy 전체 권위가 통과했다고 주장하지 않음. pre-Tree는 지원하지 않음 |
| 실제 값 조회 | precheck 실패는 scalar query 0. `_g` ref 확보 후 literal key presence 1회, present일 때 값 lookup 정확히 1회. post는 같은 G ref/역할/Script/Tree/claim만 검사하며 scalar 재조회·같은 값 불변 검사 없음 |
| READY 부분지원 | present finite native int/float. raw type/value 및 int0/float+0/raw-0 보존. int 범위 [-9007199254740991,9007199254740991]는 local 정확표현 지원 부분집합이며 게임 cap·전역 finite 정책이 아님 |
| raw NOT_READY | copied key 미확정/부재, bool/String/StringName/null/NaN/Infinity/reference, int 지원범위 밖, owner pre/postloss. top `value` 없음. 결손을 JS undefined/known absence로 인증하거나 0으로 채우지 않음 |
| 원 ref / prefix | 관측 Dict의 `raw_g/raw_value/raw_owner/raw_main/raw_services/query_prefix`는 원 ref/type/value를 보존. presence prefix 뒤 present면 value prefix만 추가. clone/snapshot/cache strip/JSON 대체/retry/refund/rollback 없음 |
| postloss | State 새 NR envelope의 `read_result`는 원 관측 Dict, Services 새 NR의 `read_result`는 State 원 반환 Dict를 그대로 가리킴. `query_prefix`와 사용 가능한 raw alias도 같은 ref. 기존 Dict의 READY value를 삭제하거나 변형하지 않음 |
| schema | 정상 상태 `READY` 또는 `NOT_READY`; `source/reason` 필수. READY만 `value` 존재. State source `native.State._g.playTime`, Services source `native.Services.play_time`. 원시 값이 관측되지 않은 필드는 임의 null/0 대신 부재로 남김 |
| State reason | `native_play_time_owner_not_current`, `native_play_time_observation_pending_validation`(postloss 안쪽 원기록), `native_play_time_owner_changed_after_observation`, `native_play_time_field_unresolved`, `unsupported_native_play_time_integer`, `unsupported_native_play_time_non_finite`, `unsupported_native_play_time_type` |
| Services reason | `native_play_time_services_owner_not_current`, `native_play_time_services_context_not_current`, `native_play_time_services_owner_changed_after_observation`, `native_play_time_owner_result_malformed` |
| 미래 consumer | 원42328/42329의 서로 다른 lazy 0/1/2 query와 두 번째 write=두 번째 query값을 유지해야 함. owner raw-0와 미래 consumer의 supported numeric0→literal+0 `||0` 투영은 별개. 이번 단위는 callback 등록12만 반영하며 consumer 투영/V11/V12 제품 copy/World hook/13 dummy·25 gate 우회는 구현하지 않음 |
| 검수 현행 | 첫 소스 정적 17개 중15통과2실패(원 wholefalse 보존), 후속 문서·경로 독립2확인 true, 첫 공개 API 격리34case·477확인(설정163·행동314) ROOT 인수. 각 실행은 별개이며 원17 전체 PASS로 합산하지 않음. 실제 게임·자연 clock·원JS identity는 미인수 |
| 현재 한계 | 실제 Main/State clock 필드 presence·진행·게임 실행·PC 배포·전체 hurtE·전체 게임 완료율은 미확인. 이번 보존·등록 단위에서는 새 격리 fixture를 만들거나 재실행하지 않음. 이미 인수한 owner 첫 격리34case477확인은 유지 |

현재 원시 Dictionary는 JSON wire 형식으로 변환하지 않는다. 강한 참조를 포함한 결과의 동기 관측 범위와 실제 게임의 자연수명 증거는 구분한다. 새 경계는 소유 메타데이터를 관측하는 직접 검사이며 기존 모든 getter나 실행 중 엔진 전체의 순수성을 인증하지 않는다.

## 2026-10-17 검증 WIP 소유 체크포인트

| 구분 | 인수 범위와 한계 |
|---|---|
| 소스·등록 | Main/Services/State 신규4 API와 Main Script 메타데이터1필드. 현재 callback12/25·미13, play_time은 el_mul 바로 다음 동일 Services self·arity0로 등록 |
| 분리된 증거 | 원정적17중15통과2실패 wholefalse / 이후 독립2확인 true / 첫격리34case477확인(설정163·행동314) 인수. 서로 다른 실행을 단일 전체 PASS로 소급하지 않음 |
| 값·ref 경계 | finite native int/float 부분지원, safe int ±9007199254740991은 local 표현 한계. raw-0·원type/ref/prefix와 postloss 원read_result를 보존하며 missing unknown/unsupported/loss는 top value 없는 NR. 0fallback·clone·retry·clock writer 없음 |
| 검수 한계 | 명시 fixture와 predicate probe에서의 검수. 실제 Main/State clock 존재·진행·자연수명·원JS identity·실게임·PC 인수 증거는 아님. raw-0 owner와 미래 consumer numeric0→literal+0 투영은 별개 |
| 후속 consumer | V12 후보 소스3+첫parse2 ROOT 인수. 첫11case43행동true지만 setup5중signed-zero1false·exit1 전체FAIL은 보존. 별도 보완4case19행동+setup4 true·exit0는 첫actual+0 및 둘째 NRnestedREADY/SOURCE_THROW/UNSUPPORTED→UNKNOWN_STATUS에만 한정. 과거 실패와 합산 PASS 금지. 네 준비식 평가 뒤 public 호출 전 검사이므로 fail-fast 실제 고장주입 증명은 아님. 실제 clock/자연MainState/JS/fullgame 미확인. 제품 V12 copy·World hook 없음; callback12 등록은 이번 별도 경계 |
| 보존 단위 | 소유 브랜치 codex/native-play-time-owner-20261017. 문서의 자체 commit SHA를 선행 선언하지 않으며 실제 local/remote SHA·tree·parent·비강제 보존 결과는 아래 단위 receipt를 기준으로 확인 |

[체크포인트 단위 receipt](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-PLAY-TIME-OWNER-VALIDATED-WIP-20261017/receipt.json>) · [사용자용 이식 현황](FDG_GODOT_PORT_STATUS.md)


## 2026-10-17 play_time 열두 번째 provider 등록 — 현재 경계

| id / 항목 | 구현·인수 범위와 한계 |
|---|---|
| 등록 / 분모 | 실제 callback 12/25·미13. 전체 게임 이식률이 아닌 일반 적 피해 필수 provider 수 |
| key / target / arity / 순서 | play_time / Callable(self, "read_normal_enemy_play_time") / 0 / 기존11 key 순서를 유지하고 el_mul 바로 뒤에 한 entry만 추가 |
| query 경계 | 새 entry의 Callable 생성 자체는 값 query0. 기존 map getter 및 준비 guard 전체의 순수성은 인증하지 않음 |
| owner / 부분지원 | 기존 finite native int/float 지원 범위·safe int ±9007199254740991·raw-0·raw refs/prefix·NOT_READY 및 postloss 계약 유지. clock counter/writer/setter/default0 추가 없음 |
| 검수 / 분리 | 기존 owner34case477(설정163·행동314) 인수는 유지하며 재실행하지 않음. 원17 중15통과2실패·별도2true, V12 원FAIL 및 별도4case19행동+setup4 한정성공도 각각 보존. 이번 새 검수는 등록 영향 정적 경계만 |
| 소스 / 실행 | D9는 직전 공통 소스 인수이고 owner 브랜치 codex/native-play-time-owner-20261017의 이력은 보존한다. 이번 main/I/R 현재 소스 정렬은 통합 정본·receipt의 실제 HEAD·tree를 따른다. 실제 Main/State clock·자연 실행·JS 동등성·PC·최신 실행 게임은 미인수. V12 제품 copy·World hook·dummy13·25 gate 우회 없음 |
| 보존 증거 | [등록 단위 receipt](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-PLAY-TIME-TWELFTH-PROVIDER-REGISTRATION-20261017/receipt.json>) |


## 2026-10-17 play_time main/I/R 소스 통합 체크포인트 — 현행

| 항목 | 현재 범위와 인수 한계 |
|---|---|
| 직전 인수 / 이번 소스 | 직전 공통 인수 D9(d9b886c). owner 실제 NUL diff42(code3/docs39)에 통합 정본1을 추가한 최종 범위는 실제 union NUL·tree 목록과 아래 receipt를 기준으로 확인. main/I/R의 실제 현재 HEAD·tree·branch·upstream 및 정렬 결과도 receipt 기준 |
| 코드·provider | 인수된 Main/Services/State 코드3 그대로, callback 12/25·미13. play_time은 el_mul 직후 동일 Services self·arity0, 새entry 생성의 값 query0만 확인. 기존 getter/준비 guard 전체 순수성은 인증하지 않음 |
| 값·실패·참조 | finite native int/float 부분지원·safe int ±9007199254740991·raw-0·원 type/ref/prefix·postloss read_result·NOT_READY 계약 그대로. dummy13/25 gate 우회·clock writer/default0 추가 없음 |
| 검수 분리 | 기존 owner34case477(설정163·행동314) 인수, 원17 중15통과2실패와 별도2true는 보존. V12 후보 원11case43행동true/setup signedzero1false·exit1 전체FAIL과 별도4case19행동+setup4 true의 한정 보완은 각각 유지. 원성공 검수·parse 재실행 없음 |
| 실제 실행·보류 | 이번은 소스 정렬이다. 사용자 열린 앱·compiled export·PC 실행·실제 Main/State clock·자연 전투·JS·최신 게임 인수는 미확인. V12 제품 copy·World hook·build/reload/import/PC 전달 없음 |
| 정본 / 증거 | [FDG_NATIVE_NORMAL_ENEMY_PLAY_TIME_MAIN_SYNC_20261017.md](FDG_NATIVE_NORMAL_ENEMY_PLAY_TIME_MAIN_SYNC_20261017.md) · [소스 통합 final receipt](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-PLAY-TIME-MAIN-SOURCE-SYNC-20261017/receipt.json>) |
