> 2026-10-20 QA-001 PC 정정: 이 문서의 과거 FIRST·배송 검수 수치는 당시 이력으로 보존한다. 현재 7종 테스트의 하니스·낡은 기대값 진단, 원본 행 근거, 기준선과 영향 그룹 재검 결과는 [QA-001 PC 보고서](orders/reports/QA-001_REPORT.md)를 따른다. 게임 수치·제품 코드는 변경하지 않았다.

## 실제 Main lesson file-init/current guard 연결 — 2026-10-14

실제 Main은 World/Player를 생성하기 전에 원 lesson holder를 만들고 Root publish_file_init을1회 소비한다. 원 SOURCE_BOOT/current=false 7개 partial 필드는 입력 이력으로 유지하고 실제 published current guard를 별도로 읽는다. Main wrapper LIVE Callable은 cold에서 null/NOT_READY이며 현재 holder의 게시·교체·철회를 따라간다. 실제Main을 해제하면 wrapper Callable이 무효가 된다. 외부가 강하게 보유한 Root holder의 수명과 Main 권위는 구분한다.

새 실제Main FIRST3그룹30(13/10/7) /4.374504333초/exit0/FAIL0/SCRIPT0/Parse0/ERROR0, Camera2D warning1 보존. production/test수리0, 이전117/145/88/71/원lesson7/137 재연0. 교체2→3/revoke는 명시 actualholder public-test publisher이며 원전체controller 자동진행을 뜻하지 않는다. 현재source G.on=false/pre_stage, controller.tick/start/UI/skipKey/reset/storage/G activation/updategate/HPSTMP automatic은 아직 미연결이다. 최신 API/검증은 FDG_GODOT_MAIN_SOURCE_LESSON_20261014.md 및 FDG_GODOT_MAIN_SOURCE_LESSON_FIRST_20261014.md를 따른다. 아래독립helper/과거인수 상태는 역사로 보존한다.

## 중앙 실제 Main 파생 수치 최초 연결 — 2026-10-14

실제 Main은 시작 장비25 및 actual current G/P/STATS/PASSIVES/INV 공급자 이후, 새 Player Tree 진입 전에 원본 ordered dispatcher와 전용 Player/State/ResourceAuthority sink를 결합한다. 원 Health initial plan1·Resource plan1을 캡처해 `_effStats` → HP → DEF/poise/baseAtk/speed → 자원 → 공통 결정 보정 → 방어구 → 견갑 → 캐시 무효화1·fresh recalcSt 순서로 28개 실제 write를 소비했다. 실제 source OPT35/current_pre_restore에서 diff5→signed0을 읽고, raw 이동속도는 실제 물리×60 변환 뒤 Tree 진입에도 유지된다.

새 고유5그룹117 clean은 최초성공4/69 + sharedcrystal INVALID44만 수리한 첫clean48이다. 처음 실행은 exit1/SCRIPT_ERROR1/FAIL1이며 전체5 PASS가 아니었다. production repair0, test fixture 수정2곳, 성공4/old145·88·71·원 helper 검사 재연0. 단일 original17slot loop/lvB1-query 전체 parity, G stage/fullbootstrap, 원본 자동 회복, 공개 pixel/24장24FPS/최소사양240FPS는 아직 미완이다. 실제 constructor ST200 / Tree ST200.14 / MST332는 재검수 실행에서의 관측값이며 상수·원본 자동회복 결과가 아니다. 최초 실패의 ST 두 숫자는 NOT_OBSERVED로 보존한다. Player 기존 회복 본문은 변경하지 않았다.

현재 API·세부 검증·이력은 FDG_GODOT_MAIN_SOURCE_PLAYER_INITIALIZATION_FIRST_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SINKS_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SERVICES_20261014.md를 따른다. 아래 독립 helper/이전 커밋의 부족·검사 이력은 당시 상태로 보존한다. source Main-full/derived readiness는 false다.

## 최초 검사 전 연결 기록 — 2026-10-14

현재 Main 코드는 실제 25개 시작 장비와 공급자 구성 후, Player Tree 진입 전에 `SourceInitializationServices.configure` → 원본 dispatcher.configure → 실제 Player/State/ResourceAuthority의 `bind_native_source_initialization` → `initialize_new_run`을 호출한다. 결과가 READY/completed=true일 때만 Tree 진입을 이어간다. 실패는 원인과 dispatcher/서비스 진단을 `source_initialization_result`에 보존하며 기존 실행이나 저장 데이터를 초기화하지 않는다. 이 문단은 최초 검사 전 제작 기록이다. 현재 새5/117 검증은 위 중앙 인수 기록을 따르며 아래145/88/71은 이전 커밋의 별도 범위다.

| Main API / field | 정확한 현재 계약 |
|---|---|
| `_initialize_source_player_parameters()->bool` | 새 실제 actor의 생성자 단계에서만 원본 source producer·전용 쓰기 소유자를 결합. 일반 HP/스탯 setter나 새 공식 없음 |
| `source_initialization` / `source_initialization_services` | actual Main이 보유하는 RefCounted dispatcher / 실제 옵션·공급자 assembly |
| `source_initialization_result:Dictionary` | 원본 dispatcher 실행 결과 또는 NOT_READY 원인. 결과 값으로 현재 자원이나 완료를 대체하지 않음 |
| `get_native_source_player_initialization_snapshot()->Dictionary` | result/dispatcher/services deep-copy diagnostics. main_full_ready=false / automatic_regeneration_bound=false |
| Capture source metadata | source_mode=`CH1-1 canonical encounter; actual pre-stage source Player parameters`; source_player_initialization은 실제 Main의 진단 snapshot. 고정 NORMAL/boot350를 현재파생값으로 표기하지 않음 |
| 초기화 경계 | 실제 current G는 stage 출판 전 선언 상태이다. 전체 새 실행 bootstrap/저장·스킬·강의 상태·자동 회복·인게임 시각/240FPS 완료를 뜻하지 않음 |

## 현재 actualMain 초기 상태 / 공급자 — 2026-10-14

실제 Main은 원 fullmkP/G40/STATS5/PASSIVES26/INV17 source 상태를 명시설치하고 원 actualRNG/time→StarterFactory25를 실제sameidentity로 소비했다. 실제 current holder→Affix/CRef/Formula/Passives/Rates/Fusion/Crystal/currentGrit/rawholder/SourceParameters10이 연결된다. SOURCE_BOOT/currentfalse 이력은그대로이며 설치된현재값은별도진실이다. 첫고유5그룹145는 최초성공4/132+scriptERROR가난consumer만13재검한결과다. 원HP·MP·ST 파생/전체applyStats/recalcSt/actualOPT/diffSigned/fullbootstrap/자동회복은아직미완이다. 아래 독립helper 과거검사·당시부족이력은보존하며 최신중앙상태는 FDG_GODOT_SOURCE_NEW_RUN_STATE_20261014.md 및 FDG_GODOT_SOURCE_PLAYER_PROVIDERS_20261014.md를따른다.

## 중앙 회복 phase 최초 연결 — 2026-10-14

원 dispatcher와 실제 Player/World/SourceResourceAuthority가 presence→영역HP→MP→ST→rates 사전계산→자연HP→자연ST→MP를 실제 Tree에서 소비했다. 첫6그룹88 clean PASS이며 원 helper 성공 검사 재연0이다. 이 실행의 G/INV/PASSIVES/hpR/lesson/init witness는 명시 constructor fixture다. 실제 Main 시작 장비25·파생HP/MP/ST·전체초기화는 아직 미완이다. 최신 API·clock·null/lifecycle·검증 한계는 docs/engine/FDG_GODOT_SOURCE_PLAYER_REGEN_PHASE_20261014.md 및 FDG_GODOT_FRACTIONAL_HP_SINK_20261014.md가 현재 중앙 상태다. 아래 독립 source 테스트 이력과 수치는 보존한다.

# FDG Godot 새 실행 자원 권위 — 2026-10-14

## Authority API

신규 `godot/scripts/native_source_resource_authority.gd`는 같은 실제 NativePlayer를 참조하는 `Node`다. 원 `player_resource_parameters_source.source_boot_parameters()`의 SOURCE_BOOT packet을 **명시적인 새 실행 constructor input**으로 소비해 실제 자원을 생성한다. 기존 실행·현재 누락값·restore의 fallback이 아니며, boot packet 자체의 `current=false/derived=false/status=SOURCE_BOOT`는 바꾸지 않는다. 생성 후 current getter의 READY는 이 실제 생성된 자원6만을 읽는 별도 경계다.

| 공개 API | 정확한 계약 |
|---|---|
| `initialize_new_run(player:Node2D,world:Node,boot:Dictionary)->bool` | 단1회. actor가 Tree에 들어가기 전이고 is_node_ready=false일 때만 허용. actual Player.get_combat_world()==World를 먼저 연결해야 한다. World.player는 construction 중 null 또는 같은 actor. holder는 unparented 또는 이 World 자식. source boot의5keys/provenance/flags/values6를 모두 검사한 뒤에만 실제 ST/mst와 자체 MP/MMP/base rates 생성 |
| `get_native_regen_player()->Node2D` | 같은 유효 실제 Player 또는 null. 다른 Player 생성0 |
| `get_native_regen_world()->Node` | 같은 유효 실제 World 또는 null. 다른 World 생성0 |
| `is_native_source_resources_ready()->bool` | 초기화·현재 필드·weak actor claim·lifecycle·같은 Tree·holder World 자식·World.player 동일참조가 모두 유효해야 true. constructor current 값의 존재와 실제 live commit 가능 상태를 구분 |
| `read_native_regen_state()->Dictionary` | `{s,st,mst,mp,mmp,stR,mpR,x,y}`. s/ST/mst는 actual Player.state/stamina/max_stamina, x/y는 실제 유한 global_position을 그대로 읽고 MP/MMP/base rates는 holder 실제 필드에서 읽는다. x/y는 actualDome current P reader에 필요한 읽기이며 위치 대입0. 초기화 후 Tree 진입 전도 current 값의 읽기 가능; commit 허용은 별도 live gate. 누락/소유권/lifecycle 오류면 `{}`이며 필드 보충0 |
| `read_current_resource_parameters()->Dictionary` | `{status,reason,origin,current,derived,values,missing,lineage,phase,derived_ready,main_full_ready}`. 실제 current6가 존재하면 READY/current=true/derived=false, origin=`new_run/source_boot_initialization`. phase=`constructed_before_apply_stats`, derived_ready=false/main_full_ready=false. 초기화 전·소유권/lifecycle/필드 손실이면 NOT_READY/values{}이며 boot/default refill0 |
| `commit_native_regen_resources(packet:Dictionary)->bool` | actual live sameTree·pause 아님·source packet 쓰기2개·ST→MP 순서·유한 before/value·현재 두 before/caps를 모두 검사 후에만 실제 Player ST와 holder MP를 하나의 동기 transaction으로 쓴다. signal/callback/await/중간 관측/두 번째 dispatch0. false면 두 resource 변경0 |
| `get_snapshot()->Dictionary` | 초기화/live ready/error, current parameters·원 source boot input deep copy, lineage, commit_count/rejections·last_packet copy, automatic input/physics false, derived_parameters_ready false, restore_fallback false, missing_upstream_manufactured false |

| 원 입력 / 생성된 값 | 정확한 source·소유 |
|---|---|
| boot packet | `{status:'SOURCE_BOOT',source:'game.html:29655 mkP()',derived:false,current:false,values:{st:200,mst:200,stR:.28,mp:160,mmp:160,mpR:0}}` — 기존 static producer를 그대로 호출해 비교. 잘못된 shape/누락/다른 provenance/true flag/비유한 또는 다른 수치는 actor mutation 전 거절 |
| ST / mst | 원 boot200/200을 actual 새 Player.stamina/max_stamina에 constructor 시 명시 적용. getter/regen commit은 이후 실제 같은 Player field를 사용. native export값의 우연한 일치를 source 초기화로 세지 않음 |
| MP / MMP | 원 boot160/160을 holder에 실제 생성. 누락된 현재 MP를 160으로 채우는 getter/fallback 없음 |
| stR / mpR | 원 boot.28/0을 holder에 실제 생성. derived applyStats/recalcSt나 native legacy .28 재생 실행을 뜻하지 않음 |
| lineage | `new_run/source_boot_initialization`, `kind=new_run`, input_status SOURCE_BOOT/input_current=false/input_derived=false. 원 입력 packet과 실제 생성 후 current projection을 분리 |
| single actor ownership | actor metadata의 `native_source_resource_authority_owner` weak owner claim + `native_source_resource_authority_initialized=true` persistent initialized claim. weak owner가 해제되거나 사라져도 새 initializer는 persistent claim 때문에 같은 actor를 재초기화하지 못함. 동일 holder·다른 holder 모두 기존 Tree actor·ready actor overwrite/reinit0 |
| lifecycle | `is_instance_valid`를 **is Object/type 검사보다 먼저** shortcircuit. freed/queued Player·World·holder·weak claim 손실·foreign reparent/World player 교체는 current/live 준비를 거절 |

regen packet은 원 `{kind:'natural_regen',source:'game.html:33359-33364',writes:[{field:'st',before,value,cap_field:'mst'},{field:'mp',before,value,cap_field:'mmp'}]}`만 허용한다. 각 write는 정확4field, before는 actual fresh st/mp와 같고 value는 유한 수치이며 actual mst/mmp 이하다. source Math.min downclamp를 보존하므로 cap 초과 현재값 자체를 임의 거절하거나 after에 새 min0 clamp를 넣지 않는다. 다른 자원·파생 parameter·HP·상태·위치·시간 쓰기는 이 packet으로 받지 않는다.

P.lv/STATS/INV/PASSIVES/grit/_crystalStats/G를 holder가 제조하지 않는다. applyStats/recalcSt resource command sink·공식·cache invalidation·restore 적용은 이번 initializer/current authority 범위에서 **미연결**이며 primary/후속 승인 범위다. 이 Node는 자동 physics/render clock/input·API/save 파일 접근이 없다. Main/Player/World의 실제 constructor·current reader·regen phase 설치는 primary 소유이며, 이 API 자체나 constructor fixture를 실제 Main 전체 권위·새 본편 공개 플레이·derived 전체 준비로 승격하지 않는다.

## Actual Main consumer / FIRST evidence

| Actual public path | Behavior |
|---|---|
| Main._ready | New Player.set_world before Tree entry; original SourceParameters.source_boot_parameters -> new authority.initialize_new_run -> World child -> Player Tree -> World.set_player -> World.bind_native_player_source_resources |
| Player.bind_native_source_resources | Six public methods, same Player/World, exact bool-ready, single persistent bind |
| Player.get_native_source_resource_authority | Actual live holder Object or null, no second Player |
| Player.get_native_source_resources_snapshot | Deep copy of actual holder snapshot plus persistent bound flag |
| World.bind_native_player_source_resources | Existing ready World player and same World's child authority only |
| Missing source domains | Actual STATS/PASSIVES/INV/raw_grit/currentG/initial starter factory and applyStats/recalc sink are not created by this resource-only holder; whole source Main remains unready |

| FIRST new group | Checks | Observed result |
|---|---:|---|
| startup_lineage | 15 | Actual Main source constructor ST/MST200, MP/MMP160, stR.28/mpR0; unchanged input SOURCE_BOOT current=false versus live current READY. Derived/Main-full false, encounter supported6/unsupported10 unchanged |
| public_attack_atomic | 14 | Actual public attack ST200->190; synthetic source-shaped sink request commits actualST191 and ownedMP159 exactly once. This proves the actual atomic sink interface, not sourceNatural-produced MP regeneration |
| rejected_transactions | 18 | Six wrong-before/cap/HP/paused requests reject before both resource writes; commit_count0 and ST190/MP160 retained |
| new_run_constructor_gates | 11 | Same or other holder reinitialization, existing ready actor, and half-binding rejected without reset. Actual Main path only, no manually assembled replacement scene |
| authority_lifecycle | 13 | Actual authority Node.free -> public bound=true/ready=false; getter null, default MP refill0 |

FIRST five groups / 71 checks / FAIL0 / ERROR0 / exit0 / 5.919514916 seconds. Runtime repair0, successful group replay0, prior7/170 and original source producer suites replay0. Actual six-code closure plus new test and UID3 are preserved in dependency-main-source-authority-first/tests/worker-test-receipt.json and final-source-closure.json. Main capture uses the isolated custom user directory EXODUSER-MainSourceAuthority-Isolated-20261014; the original duplicate custom-dir pair was fixed BEFORE startup. Actual isolated latest-session.json creation0, previous QA access0, screenshot0, saved-user-game/API access0.

| New metadata resource | Actual engine-created UID |
|---|---|
| scripts/native_source_resource_authority.gd | uid://cynhuefv7b037 |
| port_modules/player_resource_parameters_source/producer.gd | uid://plrpngvjhmb1 |
| port_modules/combat_stat_formula/producer.gd | uid://bu0swrk1jq2jk |

UID metadata FIRST3 / exit0 / ERROR0 / 0.517961583 seconds / runtime groups0 / imports0. Original boot160/200 differs from derived base100: source recalcSt uses raw STATS.dex; applyStats uses effective s.int and preserves intermediate MP cap/clamp order. The two matching resource formula docs now reflect the canonical derived100 formulas. Older CHANGELOG200 descriptions are historical; this current entry supersedes them rather than changing original source values.

## 23. MAP PRODUCTION REPORT

| Item | Scope |
|---|---|
| MASTER / LARGE / MEDIUM / GROUND | Existing canonical geometry/environment/collision/nav preserved; new map production0 |
| PLAYABLE / COMBAT | Actual Main new actor resource constructor/current getter/atomic sink. Original starter15 equipment+bag10 factory, source globals and full phase not yet installed |
| LANDMARK / SMALL DETAIL | Existing resources unchanged |
| CAMERA QA | Actual Main camera tree in isolated headless startup; public pixel comparison0 |
| TECH QA | New5/71 FIRST clean, sourceMain6/unsupported10 retained, original successful source tests rerun0 |
| VISUAL VERDICT | RETOUCH - full phase, public pixel/model24frames24FPS and minimum240 not proven |

## 신규 실제 UID metadata

검증 담당의 실제 ResourceUID3개(0.603577792초) 뒤 중앙이9개(0.504611042초)를 생성하면서2개가 중복 등록되었다. 중앙이 Stage 기존 UID를 확인하지 못한 중복2건을 기록하고 최초 담당 UID2와 test UID1을 유지했다. 새 leaf7은 중앙 ID를 사용한다. 최종 고유 metadata10개, 두 실행 모두 exit0/ERROR0/runtime그룹0/import0. 실제 게임 코드·성공 검사·이미지·사용자 실행은 변경하거나 재연하지 않았다.

| 파일 | actual UID |
|---|---|
| `godot/scripts/native_source_player_initialization.gd.uid` | `uid://f6xakaun6htf` |
| `godot/scripts/native_source_player_initialization_services.gd.uid` | `uid://bc7u3epqq2lfa` |
| `godot/port_modules/player_health_parameters_source/producer.gd.uid` | `uid://dpdxuryydqggb` |
| `godot/port_modules/player_base_attack_source/producer.gd.uid` | `uid://bmvttr5cskxfb` |
| `godot/port_modules/player_effective_stats_source/producer.gd.uid` | `uid://chwqhwrmo4ul1` |
| `godot/port_modules/player_defense_speed_parameters_source/producer.gd.uid` | `uid://7684fktfmk0l` |
| `godot/port_modules/player_shield_poise_parameters_source/producer.gd.uid` | `uid://dcawakg8ilhek` |
| `godot/port_modules/npc_interaction/source_options_state.gd.uid` | `uid://r4hvn2vv3tv4` |
| `godot/port_modules/kill_reward/source_difficulty_signed.gd.uid` | `uid://bbx8mfibledv` |
| `godot/tests/test_native_main_source_player_initialization.gd.uid` | `uid://cr6lwj40v12it` |
