> 2026-10-17 ENGINE WIP 현행: 실제 callback **9/25·미16**. 신규 격리 행동41/41과 신규 map 경계 static9/9만 인수 범위다. 원 첫 parse 실패는 보존한다. 이 WIP를 main/R/served·전체 게임 최신화 완료로 해석하지 않는다.

> 2026-10-17 p_dot_pool 현행: 원본 PASSIVES 식의 typed reader와 current binding 검사/실제 callback을 추가했다. 현재 map 8/25·미연결17이며, 이전7/18·6/19 등은 당시 기록이다. [계약·원 raw·첫 검수](FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md). 실행판·전체 hurtE 완료 아님.

> 2026-10-17 stat_str 현행 추가: 원본 STAT_STR=1.0의 typed reader와 Services callback을 등록했다. 현재 map 7/25·미연결18이며, 아래 이전 6/19·5/20·4/21은 당시 기록이다. [실제 계약과 새 검수](FDG_NATIVE_NORMAL_ENEMY_STAT_STR_OWNER_20261017.md). 실행판 최신화·full hurtE 완료 아님.


> 현재 콜백 계약 (2026-10-17 player_view 연결): Services 공개 map은 기존 typed4 + lesson + `player_view` = **6개**, 필수 미연결 callback은 **19개**다. 아래 이전 단위의4/21·5/20 또는 player_view 미등록 표기는 당시 source/검수 이력이다. actual ENEMY V5/kernel caller·전체25 ready는 아직 등록/완료가 아니다. 정확 현재계약은 `FDG_NATIVE_NORMAL_ENEMY_PLAYER_VIEW_CALLBACK_20261017.md`를 따른다.

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

## 중앙 실제 Main 파생 수치 최초 연결 — 2026-10-14

실제 Main은 시작 장비25 및 actual current G/P/STATS/PASSIVES/INV 공급자 이후, 새 Player Tree 진입 전에 원본 ordered dispatcher와 전용 Player/State/ResourceAuthority sink를 결합한다. 원 Health initial plan1·Resource plan1을 캡처해 `_effStats` → HP → DEF/poise/baseAtk/speed → 자원 → 공통 결정 보정 → 방어구 → 견갑 → 캐시 무효화1·fresh recalcSt 순서로 28개 실제 write를 소비했다. 실제 source OPT35/current_pre_restore에서 diff5→signed0을 읽고, raw 이동속도는 실제 물리×60 변환 뒤 Tree 진입에도 유지된다.

새 고유5그룹117 clean은 최초성공4/69 + sharedcrystal INVALID44만 수리한 첫clean48이다. 처음 실행은 exit1/SCRIPT_ERROR1/FAIL1이며 전체5 PASS가 아니었다. production repair0, test fixture 수정2곳, 성공4/old145·88·71·원 helper 검사 재연0. 단일 original17slot loop/lvB1-query 전체 parity, G stage/fullbootstrap, 원본 자동 회복, 공개 pixel/24장24FPS/최소사양240FPS는 아직 미완이다. 실제 constructor ST200 / Tree ST200.14 / MST332는 재검수 실행에서의 관측값이며 상수·원본 자동회복 결과가 아니다. 최초 실패의 ST 두 숫자는 NOT_OBSERVED로 보존한다. Player 기존 회복 본문은 변경하지 않았다.

현재 API·세부 검증·이력은 FDG_GODOT_MAIN_SOURCE_PLAYER_INITIALIZATION_FIRST_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SINKS_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SERVICES_20261014.md를 따른다. 아래 독립 helper/이전 커밋의 부족·검사 이력은 당시 상태로 보존한다. source Main-full/derived readiness는 false다.

# FDG Godot 새 실행 source state holder — 2026-10-14

`godot/scripts/native_source_new_run_state.gd`는 새로 생성되는 실제 Player 한 명에 연결하는 `Node`다. 원 bootstrap producer의 constructor packet에서 실제 holder 소유 G/STATS/PASSIVES/INV/P를 명시 생성한다. 입력 `SOURCE_BOOT/current=false/derived=false`와 생성 후 current state를 구분하며, 이 API의 준비 상태는 전체 Main 부트 완료를 뜻하지 않는다.

| 공개 API | 실제 계약 |
|---|---|
| `initialize_new_run(player:Node2D,world:Node,source_resources:Node)->bool` | 단1회. Player의 최초 Tree 진입·ready 전이며 `get_combat_world()==world`, World.player가 null 또는 같은 actor일 때만 설치한다. 실제 `native_source_resource_authority.gd`의 동일 actor/world와 현재 자원6이 먼저 생성되어 있어야 한다. 모든 검사 후 holder dictionary와 actor의 weak owner/persistent initialized metadata만 설치하며 HP·자원·상태·위치 쓰기는 없다 |
| static `source_boot_p()->Dictionary` | `game.html:29655-29669 mkP()`의 전체 return literal을 새 dictionary로 제공한다. `{status:SOURCE_BOOT,source,phase:pre_applyStats,current:false,derived:false,values}`. getter·설치 모두 이 provenance packet 자체를 current로 바꾸지 않는다 |
| `get_native_new_run_player()->Node2D` / `get_native_new_run_world()->Node` | 같은 유효 실제 actor/world 또는 null |
| `is_native_new_run_state_ready()->bool` | 초기화·claim·실제 필드·자원 authority·holder가 World 자식·같은 Tree·World.player 동일참조가 모두 유효해야 true. 전체 Main/파생 parameter 준비와 별개 |
| `read_current_g()->Variant` | 유효하면 holder가 실제 생성한 같은 G dictionary reference, invalid/lifecycle이면 null. 초기 constructor는 source 40키이며 `_fireZones`는 없다. 필드·stage·camera·zone을 World에서 임의 보충하지 않는다 |
| `read_current_stats()->Variant` | 유효하면 `source_fresh_reset_stats()`에서 생성한 같은 STATS dictionary reference, 원 5키. invalid/lifecycle이면 null |
| `read_current_passives()->Variant` | 유효하면 `source_boot_passives()`에서 생성한 같은 PASSIVES dictionary reference, 원 26키. invalid/lifecycle이면 null. 패시브 정의/공식 중복 구현 없음 |
| `read_current_inventory()->Variant` | 유효하면 `source_fresh_reset_inv()`에서 생성한 같은 INV dictionary reference. invalid/lifecycle이면 null. bag/ossCollect empty, selected null, equipped 17slot null인 **starter 설치 전** 상태 |
| `read_current_p()->Variant` | 유효하면 같은 owned P dictionary reference에 actual Player의 hp/max_hp/radius/state/global_position/iframes/facing와 실제 자원 authority의 6값을 읽어 동기화한다. Player·resource authority 쓰기는 없고, 다른 원 constructor fields는 그대로 보존한다. invalid/lifecycle 또는 current resource 손실이면 null로 거절하며 누락 current 보충 없음 |
| `run_native_initial_starter_items(random_unit:Callable,now_ms:Callable)->Dictionary` | 초기화된 새 actor가 Tree 진입 전일 때 실제 INV17-slot/empty bag/P.lv와 provider2를 검사하고 원 StarterFactory의 `run_new_game_starter_items()`를 정확1회 호출한다. 최초 호출 자체가 sticky attempted이며 실패/partial prefix도 재시도·리셋하지 않는다. 초기 결과의 item reference는 실제 INV와 같은 객체이며 보관용 snapshot은 deep copy. 재호출은 ALREADY_ATTEMPTED와 기존 결과 copy이며 새 factory/provider 호출 없음 |
| `get_snapshot()->Dictionary` | 원 입력 packet·현재 state의 deep copy, initialized/live ready/current_installed, provenance/phase, hpR·fireZones 존재 여부, initial_starter_attempted/running/completed/result/ledger와 actual equipped/bag sink counts, 완료되지 않은 Main 단계와 자동실행/restore-fallback 여부 |

getter5의 반환은 유효할 때 source producer/sink가 사용할 실제 소유 dictionary reference다. 실패 시 null을 반환하므로 손실된 holder를 legit empty G/P/PASSIVES로 바꾸지 않는다. mutation 권한은 별도 승인된 caller가 담당한다. 보관용 snapshot은 deep copy이며 null 반환도 안전하게 보존한다. source input packet은 live reference로 공개하지 않는다. 생성 후 Tree 진입 전 current 읽기는 허용하지만 live-ready는 false다. Tree 진입 뒤 sameTree/World.player/authority 조건이 깨지거나 actor·World·authority가 freed/queued 상태면 current 읽기도 거절한다. weak owner가 없어져도 `native_source_new_run_state_initialized` persistent claim 때문에 같은 actor 재초기화는 허용하지 않는다.

| 원 값 / 소유 경계 | 정확한 source 및 현재 의미 |
|---|---|
| G | bootstrap `source_boot_g()` → source `game.html:17122-17126` file-init 40키. fake `G={}` 없음. `G._fireZones=[]`는 source `initStage` 32217의 stage publisher 소유이며 이 holder가 생성하지 않음 |
| STATS | `source_boot_stats()` provenance와 `source_fresh_reset_stats()` provenance를 그대로 보존. 설치값은 fresh reset 5키 str/dex/int/vit/lck=0 |
| PASSIVES | bootstrap `source_boot_passives()` 재사용, 26키 원값0. 기존 passive producer가 정의의 권위 |
| INV | `source_fresh_reset_inv()` 재사용. 초기 equipped 17null은 starter 설치 전 상태. 추가 API를 명시 호출하면 actual source factory가 defaultItems15 + bag10을 생성하여 같은 INV에 설치. Main 호출은 primary의 후속 통합 범위 |
| P 기본 progression | lv1, exp0, maxExp15, 소문자 sp0/ap0, baseAtk8/baseDef2, speed2.6 등 전체 mkP literal 보존. 능력/진행/장비 공식의 실제 실행 완료를 뜻하지 않음 |
| P skills / `_fused` | `{kiSlash:1,fireball:1,bladeDash:1,maliceSwipe:1,shieldThrow:1}`, `_fused={shieldFuse:true}`. 빈 fused·neutral stat로 대체하지 않음 |
| P 실제 동기화 | `hp←Player.hp`, `mhp←max_hp`, `r←radius`, `s←state`, `x/y←global_position`, `iframes←iframes`, `facing←Vector2 facing.angle()`; st/mst/stR/mp/mmp/mpR는 actual resource authority 현재값. native 상태의 alias/기술 state를 새로 만들지 않음 |
| P 아직 미소비 fields | source constructor 값으로 holder에 실제 소유하되 원 gameplay 전체가 구현됐다고 표시하지 않음. combo/st2/kb/charge/skill slot/energy shield 등 native 다른 field에 의미가 불명확한 alias를 연결하지 않음 |
| hpR | mkP에 원래 없음. `pre_applyStats` 부재를 유지하며 0으로 제조하지 않음. 실제 HP parameter producer/applyStats의 후속 설치 필요 |
| raw `_grit` | 별도 Root save-adapter holder가 실제 권위. 이 모듈은 grit getter·생성·0 reset·restore를 하지 않음 |
| readiness | `main_initialization_ready=false`, `main_full_ready=false`, `derived_parameters_ready=false`. initial starter 성공이면 missing_main_steps에서 actual starter 항목만 제거한다. ResourceParameters applyStats/recalcSt, HP parameters/hpR, full bootstrap external steps와 stage publication이 미완료인 상태는 유지 |

| 초기 item consumer | source 순서와 guard |
|---|---|
| provider | 중앙 caller가 실제 World 공유 `sample_native_random_unit()` [0,1)와 실제 Unix milliseconds provider를 넘긴다. holder가 RNG/시계 fixture·counter·Date.now 대체·새 UID를 만들지 않는다. source factory가 원 item/RNG/UID/formula를 그대로 소비 |
| 첫 진입 | 실제 initialized holder/weak persistent claim/current authority/P.lv가 유효하고 Player는 최초 Tree 진입 전이어야 한다. 실제 INV.equipped는 원17키가 모두 있고 각 값null, bagempty이어야 한다. invalid binding·lifecycle도 최초 attempted를 소진하며 provider 호출 전 거절 |
| 생성·설치 | 원 `defaultItems()` mkItem×15 **전부 생성** → 원15slot 순서 `equip_slot(slot,item)`×15 → `(mkItem,append_bag)`×10. 임의원소 선택·rarity/element/type 수정·source scope 확대 없음 |
| level reader | 유효하면 실제 owned P.lv를 반환한다. lifecycle/현재 level 손실은 null(undefined) fallback으로 바꾸지 않고 provider-invalid shape로 거절해 원 fake level 생성 없음 |
| equip sink | 실제 같은 INV.equipped의 기존slot에 factory item을 그대로 대입, `is_same(stored,item)` 확인 뒤 true/count+1. 별도 item duplicate 없음 |
| bag sink | 실제 같은 INV.bag에 factory item을 그대로 append, `is_same(back,item)` 확인 뒤 true/count+1 |
| 실패·재진입 | source producer가 수락한 prefix/기소비 RNG/시계/item ledger를 보존한다. rollback/장비초기화/중간 실패 재시도 없음. provider callback에 의한 reentrant 호출도 ALREADY_ATTEMPTED. 실제 actor가 mid-call Tree 진입하거나 supplier가 손실되면 이후 reader/sink가 거절 |
| 성공 범위 | factory READY + 실제 equip15/bag10 수락 + 마지막 preTree lifecycle 유효여야 completed=true. native ST/MP·HP 적용·recalcSt·스킬·전체 stage publication이 완료된 것으로 승격하지 않음 |

원 bootstrap의 full `run()`/26단계 sink를 이 모듈에서 실행하지 않으며 external barrier를 자동 수락하지 않는다. 원 공유 mats 읽기, QSLOTS/potion/upgrades, 스킬 시작 배정, atlas/HUD, stage publisher, 실제 Main 설치는 primary 소유다. 이번 범위는 소유 holder·공개 reader·수동 initial starter API이며 Main/Player/World/save 모듈 변경·자동 input/physics·자원 formula·실행/restore fallback이 없다. source 지원6/미지원10과 frozen Web/Windows 지원5/미지원11은 그대로다.

| 이번 인수 / 검증 상태 | 범위 |
|---|---|
| 수정 전 백업 | parent `ba2ada241ecb5623fdf6374253d6deedc5cf84d3`의 신규2path HEAD absence authority와 WORK 부재를 외부 `source-new-run-state-first/backup-before-production/manifest.json`에 기록 |
| initial starter 확장 전 백업 | 같은 owned2 파일의 이전 draft WORK bytes를 외부 `source-new-run-state-first/backup-before-starter-items/manifest.json`에 보존 |
| 문서 동기화 | source/current/new-run/holder/bootstrap 관련 `rg` 및 literal `grep -r` 결과는 외부 `source-new-run-state-first/docs-sync/`에 기록. owned API 문서는 본 파일만 갱신, 기존 Main/공유 현행 문구는 primary 후속 동기화 소유 |
| 실행 증거 | 이 worker의 runtime/import/test/GUI0. 신규 API는 정적 구현이며 primary 최초 통합 인수 전. 기존 성공 증거/검사는 재실행하지 않음 |
| 시각 / 성능 | 신규 공개 pixel·24장/24FPS·최저사양240 검수0. VISUAL VERDICT: RETOUCH |

관련 source 권위: [bootstrap producer API](FDG_GODOT_PORT_NATIVE_NEW_RUN_BOOTSTRAP_SOURCE_FIRST_20261013.md), [실제 resource authority API](FDG_GODOT_MAIN_SOURCE_AUTHORITY_20261014.md), [원 starter item factory API](FDG_GODOT_PORT_STARTER_ITEM_FACTORY_SOURCE_FIRST_20261013.md). 기존 FIRST 결과와 원 source 수치는 변경하지 않는다.

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

## 2026-10-17 악의구 actual-owner 통합 작업본

| 항목 | 현 상태 |
|---|---|
| 범위 | I 작업본, 아직 R/공식 main 미반영. 실제 게임 스킬 완료 아님 |
| 실제 소유 | Main→SourceState의 현재 P 동일참조→ResourceAuthority. 실제 MP/Player.state/st2/atkArc/_mpBon을 원 start 순서대로 적용 |
| finish | 보너스 산출 뒤 _mpBon0→World projectile→magic 숙련5→source sample→magicRecover/12. split P-field callback 실패·환불/일반rollback 없음 |
| caller | 실제 native RMB held/기존 Player 물리 phase 끝→World dt_sp/frame→v3 source. 같은 frame st2 중복 감소 거부 |
| 거부 | 실제 projectile/current lesson/sample dispatcher 권위 미연결이면 start부터 NOT_READY. 유효 dispatcher의 sample 미로드 drop은 finish를 막지 않음 |
| 미완 | 실제 projectile/원 시각·샘플, recovery Q/타 magic handler/GP. 실Actor 전체/GPU/저장/API/PC 및 최신 전체 완료 아님 |
| 상세 | docs/engine/FDG_NATIVE_FIREBALL_ACTUAL_OWNER_20261017.md |

새 actual-owner 검수:39 PASS 후 entered-case/중복 phase 경계의 수정 영향6 PASS(39 재연 없음). 첫39 종료 WARNING 한 줄에 ObjectDB3 instances leak, ERROR0/원인 미확정; phase6 종료 WARNING/ERROR0. 준비 regex 실패를 포함 firstWholeClean=false. 현재 main/R/실게임 반영·실시각 완료는 아니며 세부 계약과 실패 이력은 FDG_NATIVE_FIREBALL_ACTUAL_OWNER_20261017.md에 기록한다.

## 2026-10-17 악의구 finish void 소비자 후속

| 항목 | 현재 I 범위 |
|---|---|
| 숙련 | 실제 Main.source_lesson 공개 detail/reference의 active만 source JS truthy로 판별. 명시 active면 skip, inactive/known-absent면 실제 P magic+5 및 fireball 호환 동기화; unknown은 pre-emit NOT_READY |
| guard 구분 | detail.ready/value의 regen chapter guard를 숙련 active로 추정하지 않음. 보호 lesson/regen 수리 없음 |
| sample | 실제 기존 queue void front로 연결. caller _r(1,.08) 후 queue .92+U×.16, 원 gx volume skip이면 후자 없음. 신규 fireball stream 미로드 drop은 voice/cap eviction 전, finish/recover 계속 |
| 현재 미완 | actual projectile unbound, sample loader_bound=false. current _gxVolMul은 실제 Services 소유 source-global current getter로 연결. missing-provider fallback1/dummyAudio/noop-ready 없음, 실제 발사/가청/최신 전체 게임 완료 아님 |
| 원8키 | 기존8 stream 필수는 유지하되 추가 fireball key 허용. 정상8 queue/flush/voice 본체·RNG 순서 불변 |
| 상세 / 검수 | docs/engine/FDG_NATIVE_FIREBALL_FINISH_DISPATCH_20261017.md. 새 영향32/32 및 별도 lesson 경계6/6 PASS, 첫 fixture 들여쓰기 parse 실패 보존/wholeClean=false, 과거 통과 suite 재연0 |

| 새 검수(2026-10-17) | 관측과 한계 |
|---|---|
| first parse | fixture header space/source tab 혼합으로 preload 실패; --check-only로 확인 후 fixture 들여쓰기만 수리. 제품 변경0/첫 ERROR 로그 보존/wholeClean=false |
| 새 finish/queue | 변경된 실제 Main/Resource method fragments + 원 lesson 공개 module에서32/32 PASS. actor/state/backend/gx/current World RNG는 fixture. 기존8키 backend body는 새 fireball guard 아래 byte 동일, 기존 queue method도 byte 동일 |
| 새 lesson 경계 | Object inactive/active, freed current/freed publisher owner, 명시 null witness, Godot-only Vector2 active 거절6/6 PASS. 32 재연0 |
| 독립 source | 원 JS _addSkProf/playSample/_r/_playSampleNow 및 정확 finish 호출문6흐름 PASS. descriptor/P/lesson/U/이미 로드 대기중인 sample은 fixture이며 원 게임 실행/async fetch 검수 아님 |
| 순서/숫자 | 정상 given U=.25/.75의 rate=.9984, normal magic7→12/legacy fireball12, recover12. gx0은 caller draw1 후 queue jitter 없음; gx.5는gain.4. 별도 source 기대값 수정 없음 |
| 미로드 | 실제 queue 요청을 기존 flush가 소비하고 새 fireball guard가 cap/eviction 전에 drop. audible/원 decoder/async loader/음질 성공 증명 아님 |
| 종료/namespace | 마지막32와6 각각 ERROR0/WARNING0, Dummy. OS.get_user_data_dir가 FDG_ENGINE_FIREBALL_FINISH_FIXTURE_20261017_3A92로 선언과 일치. 기존 사용자 데이터 내용조회/cleanup0, 완전 save 격리 독립증명 아님 |
| 전체 미완 | 실제 fireball projectile/gx publisher/flight/원시각/sample loader·actual scene 미검증. 이전39/6/pool31·3·8/외부26/identity/pose/entry suite 재연0. 이 검사들을 게임 기능 수·이식률로 합산하지 않음 |


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
| actual registry | 기존9/25·미16 유지, rand등록10은아직0. V9 scalar _rand에Dict직결0/전체hurtE·최신게임완료아님. |
| 새 API | Main.is_native_source_rand_context_current(Services,World), Services.is_native_main_random_bridge_current 및read_normal_enemy_random_unit()->Dictionary, World.read_native_source_random_unit(Main,Services,receipt)->Dictionary. |
| 기존 API 보존 | World.sample_native_random_unit()->float 선언0arg 유지. private공유구현1개가counter+=1→동일float(randi())/2^32를단1회수행, legacy는null/typed는freshreceipt로같은구현을호출한다. optionalarg 변경안미채택·publicbody자체는위임으로변경. |
| 실제 완료 | Services의percall localreceipt에계산완료뒤에만rawsample을기록. 정상0는READY0, marker부재/default0은NR/UNKNOWN, preloss만명시NONE·query0, postloss/typedmalformedreturn도원rawreceipt/read_result·소비prefix보존. 새persistent RNGstate/cache/epoch·retry/rollback/추가draw0. |
| 부분 지원 | 실제float finite[0,1)완료·전후sameowner/Script/liveTree가새경계READY조건. unexpectedraw는UNSUPPORTED/raw보존/값cast·clamp·전역finite0. primitive내부무관측failure와원JS/stream동등은미증명. |
| 첫 검수 | 신규정적9/9·신규격리행동30/30/exit0/result존재·양로그diagnostics0. primitiveleaf대역·명시holder/Statepredicate·default0/typedmalformedreturn모사범위, 실RNG/엔진abort/자연fullMainWorld동등아님. old41/95/진단/통과parse재연0. |
| 보존 | sourceWIP는I만·최종ROOT인수전main/R/served0. 원첫실패/selector·thread과대범위이력과그한계를새성공으로소급수정하지않는다. |

정확signature·schema·freshreceipt구조한계·검수범위는[typed rand 소유경계](FDG_NATIVE_NORMAL_ENEMY_RAND_OWNER_20261017.md)에기록한다.
