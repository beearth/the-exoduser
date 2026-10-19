# FDG Godot 원본 Player 초기화 sink — 2026-10-14

<!-- ACTOR_INITIALIZATION_ENDPOINT_BEGIN -->
## Actor initialization endpoint

실제 동일 `NativePlayer`에 source dispatcher의 승인된 초기화 대입을 연결하는 메서드를 저장했다. 원 ordered applyStats 값을 이 endpoint에서 재계산하지 않는다. actual Main initializer 신규 검증은 아직 미실행이며 기존 helper 성공 자료·export 초기값의 우연한 일치·공개 플레이를 새 적용 증거로 세지 않는다.

| 소유 범위 | 현재 계약 |
|---|---|
| 제품 | `godot/scripts/player.gd`의 source initialization binding/write/readonly getter·snapshot과 source speed의 `_ready()` 보존 guard만 |
| 최초 백업 | parent `7432c0912ccafae79305e16d66449e4565a1fd71`, WORK=HEAD 30294B/SHA `477b249008470fc7d86fd1e55e414946fc12b9f0141aba25406d570c87712afb`; 외부 `dependency-source-player-initialization-first/player-sinks/backup-before-edit/receipt.json` |
| 변경 금지 | 기존 피해·방어식·KB·QE·DOT·물리 시계·Main·State/Authority·원 PNG·타인 WIP·보호 `2_3` 본문 |
| 검사 상태 | 본 worker runtime/import/기존 성공 재연0. actual Main initializer 최초 새 검증 및 GDScript parse는 primary 소유이며 아직 미검증 |

| 공개 API | 실제 호출 계약 |
|---|---|
| `bind_native_source_initialization(owner:Object)->bool` | persistent once WeakRef. actual `owner.get_native_source_initialization_player()==self` / `owner.get_native_source_initialization_world()==get_combat_world()` / write-tag 메서드 존재를 검사. owner는 실제 RefCounted dispatcher이며 강참조는 caller 소유. weak owner 유실 후 재bind0 |
| `commit_native_source_initialization_field(field:String,value:Variant)->bool` | State의 packet/index 승인 다음 단계에서 field/value만 받는다. boundowner가 실제 동기 쓰기 단계에 반환한 태그를 1회 읽고 정확 field/source/kind/pass_id를 대조한 후 actual actor field에 대입. signal/await/callback/중간 event 없이 대입. 아래 승인 목록 이외 쓰기0 |
| `read_native_source_initialization_fields()->Dictionary` | 실제 hp/mhp/baseDef/speed/maxPoise/poise와 존재하는 poiseR를 새 Dictionary에 읽는다. source speed가 쓰였으면 저장한 원 raw 값을 반환하고 물리 이동은 동일 raw×60을 사용한다. source write 전에는 기존 `_movement_speed/60`을 읽는다. State는 원 P에 존재하거나 승인 write로 생긴 key만 sync하여 mkP의 poise/maxPoise/poiseR absent를 보존 |
| `get_native_source_initialization_snapshot()->Dictionary` | `bound`, `constructor_write_ready`, `fields`, `source_speed_initialized`, `source_poise_r_initialized`, `committed_source_writes`, `live_actor_writes=false`, `owns_clock=false`. Tree 진입 뒤 constructor_write_ready=false여도 완료한 actual fields/raw speed는 유지 |

| source field | actual Player 저장 / 수치 | 허용 `source` → `kind` |
|---|---|---|
| `hp` | `hp` finite float, 소수점 보존. endpoint 자체의 clamp/반올림0 | `game.html:28601` → `apply_stats_health_crystal_mhp`; `game.html:28617` → `apply_stats_health_fortify` |
| `mhp` | `max_hp` finite float | `game.html:28582` → `apply_stats_health_initial`; `game.html:28601` → `apply_stats_health_crystal_mhp`; `game.html:28617` → `apply_stats_health_fortify` |
| `baseDef` | `base_def` finite float | `game.html:28583` → `apply_stats_def_speed_early`; `game.html:28603` → `apply_stats_def_speed_crystal`; `game.html:28620` → `apply_stats_def_speed_armor` |
| `speed` | finite raw px/native tick를 `_native_source_speed_per_tick`에 보유하고 `_movement_speed=raw×60` px/sec로 실제 적용. 원값→×60→÷60 roundtrip으로 ACK double 변경0. 성공 적용 sticky `_native_source_speed_initialized=true`; `_apply_combat_values()`의 기존 movement profile 대입만 건너뛰며 나머지 profile 그대로 | `game.html:28589` → `apply_stats_def_speed_early`; `game.html:28604` → `apply_stats_def_speed_crystal` |
| `maxPoise` | numeric4(int/float 지원)만 `max_poise` int4에 쓰기 | `game.html:28584` → `apply_stats_poise_init` |
| `poise` | 원 조건부 numeric4만 `poise` int4에 쓰기. producer가 보존하는 null/false/다른 값에 임의 reset0 | `game.html:28585` → `apply_stats_poise_init` |
| `poiseR` | `_native_source_poise_r:Variant=null` / initialized=false로 시작. 승인 numeric0 대입 후만 actual0 key를 공급. 자동 포이즈 회복 정책 추가0 | `game.html:28586` → `apply_stats_poise_init` |
| 제외 | `st/mst`는 ResourceAuthority; `baseAtk/shield/mshield/hpR` 등은 State/각 owner. unknown field·bool/string/null/nonfinite numeric·값 fallback0 | 해당 owner 구간 참조 |

| gate / 태그 | 실제 거부 경계 |
|---|---|
| 태그 | 정확4키 `{field,source,kind,pass_id}`. field/source/kind String 및 위 pair, finite integral pass_id≥1. 원packet.pass_id가 있으면 그값, 없는 Resource/Shield/Effective packet은 caller의 oneattempt binding id1(globalclock 아님). tag 부재/추가키/잘못된 타입/다른 anchor·kind는 쓰기0 |
| 한번만 쓰기 | `{field,source,kind,pass_id}`의 동일 exacttag 재사용은 거부. 다른 원 source 위치의 후속 대입은 각각 승인 가능 |
| 생성자 | Player는 Tree밖·node_ready=false·unparented·queued deletion=false. actual World 유효/queued=false, World.player null 또는 같은 actual Player. World Tree가 paused면 거부. Tree 진입/ready 뒤 live HP setter0 |
| 동일소유·lifecycle | 실제 `_world`와 captured WeakRef World identity, owner getters의 same Player/World, captured World.parent의 동일참조/존재를 쓰기 때 확인. owner freed/queued, World lost/reparent, Player reparent, 다른 World.player는 거부 |
| reentry | getter/tag callback 중에도 `_native_source_initialization_busy`를 먼저 세워 bind/commit 재진입을 거부. bind 실패는 persistent claim을 만들지 않으며 bind 성공 후 owner loss가 있어도 두번째 bind0 |
| 물리·원 공식 | speed unit×60만; 기존 HP 피해/방어/KB/QE/DOT/60Hz/입력/회복식 그대로. 기존source speed 미적용 경로는 profile2.6→156을 계속 사용. 새 sourceClock/Player자동 driver0 |

### 23. MAP PRODUCTION REPORT — Actor scope

| 항목 | 범위 |
|---|---|
| MASTER / LARGE / MEDIUM / GROUND / LANDMARK / SMALL DETAIL | 원 맵/geometry/nav/collision/리소스/배치 변경0; retained 맵 가이드1047줄 적용 |
| PLAYABLE / COMBAT | 실제 source 초기화 sink 저장. full initializer actual Main 최초 새 검증·일반 플레이는 아직 미검증 |
| CAMERA / TECH QA | worker runtime/import0, 공개 픽셀0. primary fresh stage 첫 검사 대기; 기존 성공 증거 재연0 |
| VISUAL VERDICT | RETOUCH — 초기화 sink 연결은 모델/글리프/시각 품질 또는 240FPS 달성 증거가 아님 |
<!-- ACTOR_INITIALIZATION_ENDPOINT_END -->

<!-- STATE_RESOURCE_AUTHORITY_INITIALIZATION_ENDPOINT_BEGIN -->
## State / ResourceAuthority initialization endpoints

State와 ResourceAuthority는 원 producer의 승인 packet에서 선택한 write 하나를 실제 새 Player의 source 상태에 연결한다. dispatcher가 순서·공통 plan·cohort·원 source gap을 소유하며, 두 endpoint는 숫자·공식·원 Math.min·공유 RNG·초기값을 재계산하지 않는다. 실제 Main 최초 새 통합 검사와 parse는 primary 소유이며 아직 이 worker가 실행한 증거는 없다.

| 공개 API | State / Authority 계약 |
|---|---|
| `bind_native_source_initialization(owner:Object)->bool` | 실제 initialized actor/world를 가진 dispatcher 한 개에 persistent once WeakRef로 바인딩. owner getters `get_native_source_initialization_player/world()`의 동일 물리참조, tag getter, `is_native_source_initialization_active()` 존재를 확인. bind 실패는 claim을 만들지 않고 성공 뒤 owner 유실·해제에도 재bind0 |
| `commit_native_source_initialization_write(packet:Dictionary,write_index:int)->bool` | 원 packet.kind/source·선택 index·원 write.field/source/value·활성 owner tag·원 pass metadata·실제 actor/world lifecycle을 검사하고 그 write1개만 대입. packet 전체 일괄 적용·source source선택 fallback·새 clamp·새 formula0 |
| State routing | hp/mhp/baseDef/speed/maxPoise/poise/poiseR → actual Player scalar endpoint; st/mst/stR/mp/mmp/mpR → actual ResourceAuthority; `_effStats/_crystalStats/hpR/baseAtk/_oocSpeed/shield/mshield` → 같은 State owned P. actor/resource endpoint의 실제 readback을 확인한 뒤 같은 P reference에 반영 |
| State `read_current_p()` | 기존 actual HP·좌표·state·iframes·facing·자원6 sync에 actor readonly field getter를 연결. raw mkP에 없는 maxPoise/poise/poiseR는 State가 원 승인 write를 완료하여 key가 생긴 후만 실제 actor 값으로 sync. 기존 source keys를 부재를 숨기는 native export 기본값으로 제조하지 않음 |
| Authority 저장 | st → actual Player.stamina, mst → max_stamina. mp/mmp/stR/mpR → 실제 `_owned` 필드. State dictionary만 수정하여 다음 current P reader가 값을 덮어쓰는 경로를 피함 |
| provenance / snapshot | 입력 SourceBoot packet은 그대로 current=false/derived=false. 실제 승인 write는 kind/pass_id/field/source/index/value 및 rejection 수로 기록. source write가 있으면 phase=`source_initialization_partial`; 단순 호출·부분 대입만으로 derived/full 준비를 표시하지 않음 |

| packet.kind | 원 packet.source | 선택 write의 정확 field → source |
|---|---|---|
| `apply_stats_effective_stats` | `game.html:28566-28570` | `_effStats` → 28570; fresh object key order str,dex,int,vit,lck |
| `apply_stats_base_attack_early` | `game.html:28587-28588` | baseAtk → 28588. 실제 Root scalar plan.value를 central metadata adapter가 packet/write로 감싼 승인계약이며 sink에서 값·공식 재계산0 |
| `apply_stats_base_attack_crystal` | `game.html:28602` | baseAtk → 28602. 실제 Root crystal phase plan.value를 그대로 저장. 별도숫자·형변환·공식 재계산0 |
| `apply_stats_health_initial` | `game.html:28567-28592` | mhp → 28582; hpR → 28592. 두 write 사이 `after_write_0` gap은 dispatcher 소유 |
| `apply_stats_health_crystal_mhp` | `game.html:28601` | mhp → hp, 각각 28601 |
| `apply_stats_health_crystal_hpR` | `game.html:28605` | hpR → 28605 |
| `apply_stats_health_fortify` | `game.html:28616-28617` | mhp → hp, 각각 28617. 조건부 no-write는 dispatcher/producer가 결정 |
| `apply_stats_def_speed_early` | `game.html:28583-28590` | baseDef → 28583; speed → 28589; `_oocSpeed` → 28590. baseDef 뒤 poise/baseAtk 원 gap은 dispatcher 소유 |
| `apply_stats_def_speed_crystal` | `game.html:28603-28604` | baseDef → 28603; speed → 28604 |
| `apply_stats_def_speed_armor` | `game.html:28619-28620` | baseDef → 28620 |
| `apply_stats_poise_init` | `game.html:28584-28586` | maxPoise → 28584; 조건부 poise → 28585; 조건부 poiseR → 28586 |
| `apply_stats_shield` | `game.html:28622-28623` | mshield → 28622; shield → 28623 |
| `apply_stats_resource_parameters` | `game.html:28564-28614` | stR28591 → mmp28593 → mpR28594 → `_crystalStats`28600 → mpR28606 → stR28607 → mmp/mp28608 → 조건부 mmp/mp/mpR28611 → 조건부 stR28614 |
| `recalc_st_resource_parameters` | `game.html:16933-16940` | mst → st, 각각16939 |

위 source suffix는 모두 `game.html:<line>` 전체 문자열로 검사한다. Authority는 마지막 resource2kind의 자원6 field만 허용하며 `_crystalStats`는 State 소유다. `_effStats`는 원5key order, `_crystalStats`는 SourceParameters.CR_INIT_KEYS의 원18key order와 각 유한 숫자를 검사한다. scalar는 유한 int/float만 받으며 원값이 0/음수/소수일 때 endpoint가 임의 clamp/반올림/기본값을 만들지 않는다.

| 순서·gate·미완 경계 | 실제 의미 |
|---|---|
| 활성 태그 | exact4key `{field,source,kind,pass_id}`가 선택된 원 write와 동일해야 한다. `owner.is_native_source_initialization_active()`도 exact bool true. 원 Health/DSP pass_id는 positive int를 그대로 사용한다. 원 pass_id가 없는 effective/Shield/Resource packet은 변경하지 않고 tag에 oneattempt binding id1만 사용(globalclock0) |
| 원 before | Health 및 effective write의 before_present/before를 같은 current P와 비교한다. initial hpR의 absent를 null/0/present로 바꾸지 않음. Resource/DSP/ShieldPoise packet에 없는 before metadata를 만들어 넣지 않음 |
| 수명 | 새 actual actor는 Tree밖/node_ready=false/unparented이며 World.player는 null 또는 같은 actor. actual World·holder·resource authority/owner freed·queued·reparent·World Tree pause·active phase 아님이면 거절. binding 시 World/holder parent identity도 캡처하여 source write 중 변경을 거절 |
| 재진입·중복 | binding/commit 시작부터 busy flag를 세워 getter/tag 중에도 같은 endpoint 재진입을 거절. 성공한 exacttag를 기록하고 동일한 원 write 재적용0. source phase 전체의 rollback·실패 후 자동 retry는 dispatcher가 제공하지 않으며, 이미 적용된 prefix는 보존 |
| 실제 저장 / 미소유 | hpR, `_effStats`, `_crystalStats`, baseAtk, `_oocSpeed`, shield/mshield는 State owned source P. baseAtk는 승인 early/crystal adapter를 소비. raw grit·OPT·diffSigned·sharedMats는 외부 권위이며 이 endpoint에서 중립값을 제조하지 않음 |
| cache invalidation | `invalidate_eq_caches`는 이 endpoint의 허용 kind가 아님. 실제 affix 및 CRef public invalidate 각각1회와 이후 recalcST plan 읽기는 primary dispatcher 소유. shield28622 이전에 묶인 Resource.run_apply_stats를 자동 호출하지 않음 |
| 완료 판정 | `derived_parameters_ready=false`, `main_initialization_ready=false`, `main_full_ready=false` 유지. 실제 write trace/현재 적용 필드와 original prefix single loop/lvB1/full G/stage/FRESH bootstrap 완료는 별개다. 이번 sink에 새 finalize API를 제조하지 않음. RootHealth captured initial ACK public seam·전체 dispatcher/서비스 인수는 해당 owner 범위 |
| G / 부트 | 실제 source file-init G/STATS/PASSIVES/INV/P 생성과 starter 수동 API는 존재한다. OPT/diffSigned/sharedMats와 전체 FRESH 외부26단계/initStage/fireZones publication 완료를 뜻하지 않음 |

WORK+HEAD backup authority는 parent `7432c0912ccafae79305e16d66449e4565a1fd71`이다. State/Authority WORK+authorized readonly HEAD bytecopy와 신규 SSOT HEAD absence를 외부 `source-player-initialization-sinks-first/backup-before-production/manifest.json`에 기록했다. Actor marker는 read-append 전 별도 bytebackup하고 그대로 보존한다. State/Authority 코드 외 Main/Player/dispatcher/Root helper/원본16/PNG/geometry/save는 이 worker가 변경하지 않는다.

worker runtime/import/tests/GUI/server/Git mutation0. 승인된 Git 읽기는 owned2 HEAD backup만 수행했다. 기존145/88 등 성공 검사를 재연하지 않는다. docs 전체 `rg` + literal `grep` 결과 및 owned scope는 외부 `source-player-initialization-sinks-first/docs-sync/`에 기록한다. actual Main 첫 인수 이전 기술PASS·공개 pixel·24장/24FPS·최저사양240을 주장하지 않는다. **VISUAL VERDICT: RETOUCH**.
<!-- STATE_RESOURCE_AUTHORITY_INITIALIZATION_ENDPOINT_END -->
