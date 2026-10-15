# FDG Godot etype4 physical spine_beast 첫 소비 — 2026-10-13

## 현재 제작 상태

고정 CH1 초기 목록의 `order13 / ch1_initial_014 / etype4 / physical / spine_beast` 한 record를 전용 `ExoduserSpineBeast` actor와 실제 factory에 연결했다. 새 최초 고유3은3 PASS/0 FAIL/exit0으로 동결한다. 추가 고유1 `flow_axis_boundaries`는 최초1 FAIL(2 assertions)→제품 flow 분기 수리→실패1만 PASS/exit0이다. 기존 통과3 재실행0·fixture 수리0이며, 최종 소스에서4개를 함께 재실행한 결과로 합산하지 않는다. 실제 world 생성은 원16 목록 중 지원4/미지원12다. 기존 source16·medium dark2·etype0 flesh_crawler1·burn kernel와 과거 고유3/3/4/5·공개 세션을 다시 생산하거나 실행하지 않았다.

논리 `etype4`의 갑각 사도, 스킨 `spine_beast`(척추 괴수), record.name `native etype 4`는 서로 다른 식별자다. 임의 재명명·새 모델/PNG·리깅·24장/24FPS 완성은 없다. 현재 인간 앱은 기존 source1 fullscreen paused 화면이며 새 source를 로드하거나 조작하지 않았다. 새 기술 검사로 공개 플레이·예술 품질·240FPS 완료를 주장하지 않는다. 원 source의 both→X-only→Y-only 흐름 이동을 추가했다. 추가 고유1의 X-only/Y-only 실패 이력과 수리 후 해당1 PASS를 모두 보존한다. 근접50..100 무조건 alert는 원 source에 없는 옛 문서 값으로, source 담당이 새 config/receipt의 잘못된 metadata만 정정했으며 그런 자동 alert를 구현하지 않는다. 기존 최초3 PASS/1159회/자동0은 동결하고 추가 경계는 최초5회/수리 후5회·자동0을 별도로 기록한다. 전체 flow/global pathing·공개 소비는 미검증이다.

| 항목 | 현재 결과 / 경계 |
|---|---|
| parent / byte backup | `166cc597a142ace9af47a74f6d2113457654419b`; 외부 `encounter-etype4-physical-spine-first/backup-before-docs/manifest.json`, 7paths/14 WORK+HEAD copies |
| worker 소유 | 새 `godot/tests/test_etype4_physical_spine_beast.gd`, 이 SSOT, 기존 factory SSOT의 후속 current 한 문단만 |
| 생산 소유 | camera의 새 source-derived config, motion의 전용 actor와 factory admission. 기존 player/physical/burn/world/main/source snapshot 변경0 |
| 실제 등록 순서 | order0 medium → order1 medium → order13 새 spine → order14 기존 flesh. 원 order2..12와15의12 record는 미지원/원 metadata 보존이며 다른 AI로 대신 생성0 |
| 기술 실행 | Godot `4.7.2.stable.official.ed1daf0bf`. 최초3 PASS/0 FAIL/exit0 동결; 추가 flow1 최초 FAIL(2 assertions)/exit1→제품 수리→실패1만 PASS/exit0. 별도 parser 반복0 |
| 명시 / 자동 계수 | 실제 `_physics_process(1/60)`: 최초3의1159회, 추가 flow 최초5회, 실패1 재실행5회. 세 실행의 자동 fixture simulation은 각각0. publicmethod damage 요청은 별도 |
| 현재 인간 앱 | 기존 source1 fullscreen paused·새 source 미로드. GUI 입력/launch/reload/observer/HP·좌표·timer·state 주입/공개 QA report 저장0 |
| 시각 / 성능 | **VISUAL VERDICT: RETOUCH**. 신규 공개 교전·픽셀·전체 AI/clock parity·최소 Windows1080p240 미검수 |

## 1차 문서와 원 source 경계

| 1차 reference | 적용 / 구분 |
|---|---|
| `docs/8.0몬스터디자인/몬스터_공격시스템.md` | source의 공통 charge/접촉/피격·poise 순서를 적용한다. 부모가 현재 type4 접촉24·cd40..59와 과거 contact 제거 문구의 역사 구분을 동기화했다. 일반8windup을 자연 상태 전환으로 추정하지 않음 |
| `docs/9적ai패턴디자인/9_적AI패턴디자인.md` | LOS/aggro·추적·idle 이동·차징을 먼저 읽었다. 조건부 eCircle의35windup을 새 자동 진입으로 만들지 않고 어택 티켓 구현0 |
| `docs/5.0애니메이션파이프라인/몬스터_스킨_시스템.md` | 현재 metadata40종/256셀/8열×5행, spine cell idx5/col5/row0. 원 body+walk overlay·`floor(_walkDist/128)%4`·8방향 소비 |
| `docs/8.0몬스터디자인/몬스터_스킨_렌더링_파이프라인.md` | Apr8의39종 카탈로그 순번38과 현재 atlas cell idx5는 다른 표 기준이다. 과거 카탈로그 순번을 현재 cell 매핑 오류로 단정하지 않으며 부모가 구분 표를 추가했다 |
| [기존 factory 정본](FDG_GODOT_ENCOUNTER_FACTORY_20261013.md) | 원16의 rollElite/native_final·추출 당시 support/runtime 선언·이전 시간0 PASS를 동결하고 새 capability4/12를 별도로 기록 |

| 원 source / artifact | 정확 값 / 경계 |
|---|---|
| 현행 source receipt | `source-spine-contract-receipt.json`, 39172B/SHA `c47201df6796f29a112ecf83d56dd7d467f272e89009943f27eac0bea1f6842a`. 옛 문서의 near50/100 metadata를 실제 원 source로 정정한 최종값 |
| source root / revision | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, parent 제공 reference `9a4534b42f74093095ebc3364a25dd104e93b379`; 원 source 재해시/수정/원 factory 재실행0 |
| 현행 source config | `godot/data/etype4_physical_spine_beast.json`, 26588B/SHA `d098280a24d0c3ee4729c145b71cb849d3ef5171153a8d1de6df7c129d79064e`; schema `exoduser.godot.etype4-physical-spine-beast.v1`. runtime/target/assets 원값은 불변 |
| 최초3 당시 source artifact | config25627B/SHA `4e20942f9606ace4bda5c94fa94085099a8bfbcf39ebad234abe59aa39c7592a`, receipt36296B/SHA `7f1ac40b8406abd3dde795b6c81b9dcc0e2f00a79bda1a7141a3b6ad4ee738b2`는 생산 당시 역사로 보존. metadata 정정과 제품 이동 수리는 별개 |
| 수리 후 actor | `godot/scripts/enemy_tank_physical_spine_beast.gd`, 16326B/SHA `0775e05de1075a0cbb9b7681c59a63eb91c9b825f475b5fef6863a660fbc9dbe` — producer 제공 최종값 |
| 정확 native 호출 | `[3878.7467967160046,340,0,4,false,0,-1]`; record factory seed1515240380/rng_begin175/rng_end184. 원 목록 재생산·seed 수정0 |
| 원 snapshot / consumed subset | 원 record의 full native_final337과 `support=false/runtime=null/animation.resources_copied=false`를 report에 보존. 전용 runtime native_final27 및 initial_timers197을 원 값으로 복사 |
| 기존 PNG / art | 기존 copy17개(idle8/walk8/physical mouth1) 재사용. 새 PNG copy/가공/해시/import0; 기존 whole PNG 검사·alpha oracle 반복0 |
| 생성 당시 metadata | config `scope.runtime_consumer_verification='pending owner implementation and new unit validation'`와 source task의 visual 미검수 값은 생성 당시 선언으로 동결한다. 현재 code/최초3 PASS 및 추가1 실패→수리→PASS는 이 문서와 새 실행 ledger에 별도 기록한다. 생성당시 pending 선언과 원 snapshot은 소급하지 않으며 near50/100의 source metadata 오류 교정은 별도 이력 |

## 실제 API / consumer seam

| API / 위치 | 실제 소비 / 제한 |
|---|---|
| factory `SPINE_SCRIPT/CONFIG_FILE/PROFILE/CONFIG_SCHEMA`:8–11 | `enemy_tank_physical_spine_beast.gd`, `etype4_physical_spine_beast.json`, `native_ch1_etype4_physical_spine_beast_v1`, schema v1 |
| factory `_is_spine_target`:143–145 | id/order/etype/physical0/skin/atlas-kind/elite0/mods[]/aura null/spawn 전체 exact predicate. 다른 element/skin/record/elite/좌표에 지원을 확대하지 않음 |
| factory `_validate_spine_config`:222–296 | JSON 숫자·container 비교로 원 record/config/native_final/flags/timers/animation/physical profile/art17과 undead trait 확인. 원 support=false/runtime=null 선언을 유지 |
| factory `consume_atomic`:343–370 → 기존 world API | 실제 새 전용 actor 생성/configure/register. report에 `consumer_profile`, `source_support`, `consumer_config`를 추가하고 full record 보존. world startup 실제 지원4/미지원12 확인 |
| actor `configure(runtime,world)`:61–96 | source 값·원 위치·HP/ATK·flags·type traits·timers·facing·shield·poise를 복사. `_rng.seed`는 record seed1515240380이며 차후 cooldown은 범위40..59만 검사; 원 전체 global RNG 후속열 parity 주장0 |
| actor `_ready`:98–119 / `set_player`:131 | 전용 `Body`/`WalkOverlay`, 원 texture/rect/scale와 collision layer4/mask1\|2, PAUSABLE·physics interpolation ON. 원 초기 sprite/field 실제 생성 확인 |
| actor `_physics_process`:134–204 | 살아 있는 actor local ticks=`delta×60` 시작에 native_frame 증가. fade/flash/hitstun/stun 감소→KB→hitstun guard→stunned charge cancel→poise regen→LOS/facing/추적→committed charge→far guard→idle move/contact/start charge |
| actor `_fire_projectile`:279–288 | actor center·현재 aim·local native_frame을 기존 `enemy_projectile_physical.gd`의 configure로 전달. child는 world에 추가하여 caster와 독립; 새 projectile/player/burn class0 |
| actor `receive_poise_damage(amount)`:293–297 | 양수 요청을 pending에 누적하고 다음 같은 HP packet의 shield 이후 remaining damage로 적용. raw amount를 즉시 poise 피해로 재사용하지 않음 |
| actor `receive_damage(amount,dir,source,opts={})`:299–342 | raw baseline/STR1/crit0/antiRevive0에서 shield→remaining HP/KB/명시 poise→death. 원 full equipment/modifier/guard pipeline 포트가 아님 |
| actor `_move_flow_native(flow_direction,ticks)`:206–234 | 추적 전용 방향 cache→speed×ticks→both/X-only/Y-only 순서. 성공 stuck0/실패 stuck+=ticks; X/Y 성공 때 마지막 방향도 해당 축으로 저장. 기존 `_move_native` KB/idle/separation 경로를 교체하지 않음 |
| actor `get_snapshot`:372–373 | identity/state/HP/shield/poise/charge/projectile/contact/hitstun/stun/regen/walk/native_frame/facing/position/KB/pending, `last_flow_direction`, `flow_stuck_ticks`, native_type_traits deep copy. flow 두 필드 초기[0,0]/0; undead true·nonzero antiRevive 미포트false |

### 공통 AI / 시간 / 피해 수치

| 원 위치 → 새 소비 | 정확 값 / 순서 | 실제 검증 / 미완 |
|---|---|---|
| R39284 / LOS | 원초기 `_alerted` field absent/falsey, consumer `alerted=false`; d<800+LOS로alert; 거리로 alert 해제0 | target350의 LOS true 이동/8방향, false+blocked 비알림 정지 확인. 옛 AI 문서의50<d<100 무조건 alert는 현재 원 source에 없다. LOSfalse 가까운75는 새 boundary 검사에서 자동alert0을 확인하며 존재하지 않는 branch를 미이식 목록으로 표시하지 않음 |
| R39289–39307 / range 분류 | ETYPE_RANGE[4]=400은 단거리 AI 분류. alerted idle/recover의 d>30 flow 추적은400 밖도 가능 | target799의 실제 이동으로 확인. 400px 이동 cutoff를 적용하지 않음. 원 flow fallback은 추가 고유1 최초 X-only/Y-only 실패→제품 수리→동일 fixture1 PASS로 기록. 전체 culling/nav parity는 미완 |
| R32579–81 / flow 축 경계 | both→X-only→Y-only; 성공 stuck0, X/Y는 실제 축 방향 cache. 모두 막히면 stuck+=ticks | constructor 네 context에서 both 이동/X만/Y만/모두 정지 및 LOSfalse 가까운75의 alert0 확인. 최초 경계2 실패→동일 fixture 수리 후PASS. source의8방향 escape·전체 pathing은 미이식/미검증 |
| 원 flow cache / 실제 caller | 원 source는 undefined 여부와 합법 방향(0,0)을 구분하며 새 helper는 ZERO를 미설정으로 취급 | 현재 `world.get_path_direction`:291–312는 유효 player의 선택 인접셀 center 또는 P 방향 normalized를 반환하고 actor caller는 d>30에서 소비한다. 부모의 좁은 source 검토상 이 exact caller에는 ZERO 입력이 없어 추가 case/수리0. 전체 flow/cache 동등성 증거로 확대하지 않음 |
| R32568+41085 / 이동 | speed0.40462583759799603/tick, flow×1 + idle×1.6 별도 경로. 기본 aura×1 | 이 fixture의 직선/open path에서는 두 경로가 실제 수행됨. 원 전체 collision/pathfinding·분리 순서 replay를 증명하지 않음 |
| R41101–04 / idle 접촉 | distance<r34.3551987009123+P.r15+8, iframes≤0, st2≤0. `int(31×.8)=24`, phys. cooldown40+floor(random×20)=40..59 | 원 initial st2=30.77384915202856: tick30에는 없음/tick31 한 request24·범위cooldown 확인. RecordingTarget은 요청 sink이며 실제 player HP 결과 아님 |
| R41115+20599 / projectile 시작 | initial299.5166686736047; eligible idle d<400일 때 시작. cooldown240, normal/physical charge60 | blocked target300 context에서 native299 미시작→300 charge60→359 charge1/no shot→360 actual birth1. 해당 update의 원 global time 시작 증가R32793과 actor local60을 구분 |
| committed charge | 시작한 charge는 actor update에서 이동/범위가 달라져도 진행, hitstun guard보다 뒤/stunned cancel | 기술 fixture는 정상 초기 timer로 charge40에 도달. living stun180 취소는 강제 상태/배율 없이 미검증; 전체 game globalphase/paused dispatch 증거0 |
| physical caller packet | actor center/aim, raw24/parry24, physical class, life120/decay.667/speed300, homing.00109083直到life30 | actual class/config/birth와 caster의 정상 피해 사망 뒤 independent life119.333·distance5(1/60)→접촉 request 확인. 원 camera2500 recycle/만료 physicalFX·full Q 처리 미이식 경계는 기존 physical 정본 그대로 |
| shared physical/burn 요청 | accepted contact packet `(24,'parry',heading,2)` 뒤 posthit48. 원 burn600/30/divisor20/cap10/19pulse | 새 spine caller→기존 실제 physical→RecordingTarget sink까지parry24/KB강도2/burn48 확인. full player HP/DOT loop를 새로 검증한 것이 아니며 기존 burn 고유4 재실행0 |
| full shield / overflow | eShield=eShieldMax875, eRes zero7. full absorb이면 HP/hitstun/KB/poise/alert 불변. remaining만HP | queue100+kiSlash100→shield775/HP875/poise875; 이후 weapon800→remaining25/HP850/poise875/KB6.25. pending은 앞 packet에서소진 |
| type4 armor / undead | type4 전용 armor 감소0; undead setR25106에 포함. R42800 STR뒤 `trunc(dmg×(1+antiRevive))`, raw affix0 | weapon1000→shield875+HP125(HP750)/poise875/KB15. 임의 armor 보정0. nonzero antiRevive·전체 affix/장비 미이식임을 traits와 snapshot에 보존 |
| remaining KB | `min(remaining×.25,15)×kbMult×magicScale`. weapon1/kiSlash.5, magic .2, noKB 옵션/zero direction 제외 | weapon125→15, kiSlash125→7.5 실제 확인. noKB/magic 전체 조합 검사는 이번 미실행 |
| 명시 poise / stun | 일반 weapon 자동 poise0. pending/poiseHit이면 remaining×poiseMult 절삭; 기본1. poise0이면180stun, ordinary regen200 후floor(875×.15)=131 | queue1000+kiSlash1000의remaining125만poise에 적용→750. 살아 있는stun/전체regen 완료 실행 증거0; 임의poiseMult/상태jump0 |
| hitstun / AI 순서 | overflow idle 일반 hitstun8, flash6. source loopR35071..35080에서 먼저감소 후 updateE R39219의>0 guard | actual charge40에서 hitstun8→7번 positive구간동안charge40 유지, 8번째0이되면charge39. 마지막정상HP750요청으로death 및 unborn charge0 확인 |
| 조건부 phase | source eCircle/ticket에서만35windup→8attack/hit crossing5→35recover | idle 자동 진입0·새 ticket0·강제 phase fixture0. 상속/탱커 명칭으로 새 자동 공격/부활을 만들지 않음 |

### actor 자체 렌더 / 보조 수치

| 위치 / id | 실제 저장 값 | 경계 |
|---|---|---|
| `_make_sprite` / body+walk | centered=true, nearest, drawscale=`240.48639090638608/256`, idx5 base `[1280,0,256,256]`; walk x5120/5376/5632/5888·y0·256² | Godot Vector2 float32에 대해 draw height 비교 허용오차.0001px. 알파/원모델 품질/인체 pivot PASS 아님 |
| 방향 / walk | normalize0..2π→round(angle/(π/4)) mod8: east/SE/S/SW/W/NW/N/NE. walk `floor(actual_distance/128)%4`; distance origin0 | 실제8 constructor context와 이동으로4셀 관측. 4개 원화이며 time/FPS24/24장으로 확대하지 않음 |
| 움직임 표시 | travelled²>.25이면moving/hold3; 다음 작은 이동은hold를ticks만큼감소. fade20에서alpha=max(0,1-spawnTicks/20) | 표시 clock과 native damage/input 시간을 합치지 않음. 캐릭터 쿼리에서 source anatomical foot pivot null 유지 |
| KB / separation | KB²>.02 이동·`.85^ticks` 감쇠. separation radius범위r×4.4, minimum=r+other.r+4, distance²>.01, push1.5, 간격3 | source 전제 metadata 보존·실제 코드 저장. multiple actor separation/collision full parity 검수0 |
| depth / collision | z=int(y/4) clamp−2000..4000·absolute; layer4/mask1\|2, physics interpolation ON; death layer/mask0·velocity0/bodyalpha.5/walkhidden | 기존 map geometry/배치 변경0. 사체/부활/whole engine transport 미완 |
| `_draw` prototype charge | radius=r+13, progress=1-charge/60, start−π/2, arc48segments, RGBA(.9,.25,.2,.85), width3 | 임시 native Control/Canvas 표시이며 source 전체 chargeVFX/화상 예술품질 미검수 |
| `_draw` prototype HP | rect x−48,y−drawH×.5−14,w96,h5; backgroundRGBA(.12,.1,.1,.9), fillRGB(.53,.13,.18), fractionmax(0,hp/maxHp) | 새 HUD redesign/전체원HUD 이식 주장0; 부모가 기존 UI scope 보존 |

## config leaf 수치 / 선언 SSOT

다음 표는 현재 source-derived config를 참조한 정확 값이다. `native_final`27·`initial_timers`197을 복사했다고 해당 보스/상태 시스템 전체가 실행된 뜻은 아니다. 초기 timer의 실제 전문 consumer는 st2/projT/chargeT/poiseR이며 다른 timer는 원 metadata로 보존한다. 원 full337 snapshot/tile/PNG 좌표를 중복 덤프하지 않는다.

### runtime scalar / source flags / type traits

| config leaf path | 정확 값 | 실제 적용 |
|---|---|---|
| `runtime.id` | `"ch1_initial_014"` | configure/native source metadata; API·범위 표 참조 |
| `runtime.order` | `13` | configure/native source metadata; API·범위 표 참조 |
| `runtime.name` | `"native etype 4"` | configure/native source metadata; API·범위 표 참조 |
| `runtime.etype` | `4` | configure/native source metadata; API·범위 표 참조 |
| `runtime.element` | `"physical"` | configure/native source metadata; API·범위 표 참조 |
| `runtime.element_id` | `0` | configure/native source metadata; API·범위 표 참조 |
| `runtime.stage` | `0` | configure/native source metadata; API·범위 표 참조 |
| `runtime.level` | `1` | configure/native source metadata; API·범위 표 참조 |
| `runtime.difficulty` | `"NORMAL"` | configure/native source metadata; API·범위 표 참조 |
| `runtime.spawn_position` | `[3878.7467967160046,340]` | configure/native source metadata; API·범위 표 참조 |
| `runtime.requested_spawn_position` | `[3878.7467967160046,340]` | configure/native source metadata; API·범위 표 참조 |
| `runtime.hp` | `875` | configure/native source metadata; API·범위 표 참조 |
| `runtime.attack` | `31` | configure/native source metadata; API·범위 표 참조 |
| `runtime.radius` | `34.3551987009123` | configure/native source metadata; API·범위 표 참조 |
| `runtime.speed_pixels_per_tick` | `0.40462583759799603` | configure/native source metadata; API·범위 표 참조 |
| `runtime.native_tick_rate` | `60` | configure/native source metadata; API·범위 표 참조 |
| `runtime.poise` | `875` | configure/native source metadata; API·범위 표 참조 |
| `runtime.max_poise` | `875` | configure/native source metadata; API·범위 표 참조 |
| `runtime.poise_regen_ticks` | `200` | configure/native source metadata; API·범위 표 참조 |
| `runtime.poise_regen_fraction` | `0.15` | configure/native source metadata; API·범위 표 참조 |
| `runtime.initial_idle_ticks` | `30.77384915202856` | configure/native source metadata; API·범위 표 참조 |
| `runtime.initial_projectile_ticks` | `299.5166686736047` | configure/native source metadata; API·범위 표 참조 |
| `runtime.projectile_cooldown_ticks` | `240` | configure/native source metadata; API·범위 표 참조 |
| `runtime.initial_facing` | `0.384930423474355` | configure/native source metadata; API·범위 표 참조 |
| `runtime.elite` | `0` | configure/native source metadata; API·범위 표 참조 |
| `runtime.mods` | `[]` | configure/native source metadata; API·범위 표 참조 |
| `runtime.aura` | `null` | configure/native source metadata; API·범위 표 참조 |
| `runtime.initial_spawn_fade_ticks` | `20` | configure/native source metadata; API·범위 표 참조 |
| `runtime.aggro_range` | `800` | configure/native source metadata; API·범위 표 참조 |
| `runtime.pursuit_stop_distance` | `30` | configure/native source metadata; API·범위 표 참조 |
| `runtime.idle_movement_multiplier` | `1.6` | configure/native source metadata; API·범위 표 참조 |
| `runtime.contact_extra_radius` | `8` | configure/native source metadata; API·범위 표 참조 |
| `runtime.contact_damage_multiplier` | `0.8` | configure/native source metadata; API·범위 표 참조 |
| `runtime.contact_cooldown_min_ticks` | `40` | configure/native source metadata; API·범위 표 참조 |
| `runtime.contact_cooldown_random_ticks` | `20` | configure/native source metadata; API·범위 표 참조 |
| `runtime.hit_stun_ticks` | `8` | configure/native source metadata; API·범위 표 참조 |
| `runtime.projectile_charge_ticks` | `60` | configure/native source metadata; API·범위 표 참조 |
| `runtime.projectile_range` | `400` | configure/native source metadata; API·범위 표 참조 |
| `runtime.windup_ticks` | `null` | configure/native source metadata; API·범위 표 참조 |
| `runtime.attack_ticks` | `8` | configure/native source metadata; API·범위 표 참조 |
| `runtime.recovery_ticks` | `35` | configure/native source metadata; API·범위 표 참조 |
| `runtime.factory_random_seed` | `1515240380` | configure/native source metadata; API·범위 표 참조 |
| `runtime.facing` | `0.384930423474355` | configure/native source metadata; API·범위 표 참조 |
| `runtime.ai_profile` | `"native_ch1_etype4_physical_spine_beast_v1"` | configure/native source metadata; API·범위 표 참조 |
| `runtime.eShield` | `875` | configure/native source metadata; API·범위 표 참조 |
| `runtime.eShieldMax` | `875` | configure/native source metadata; API·범위 표 참조 |
| `runtime.eRes` | `[0,0,0,0,0,0,0]` | configure/native source metadata; API·범위 표 참조 |
| `runtime.native_flags` | `{"ib":false,"elite":0,"mods":[],"aura":null}` | configure/native source metadata; API·범위 표 참조 |
| `runtime.native_type_traits` | `{"undead":true,"source_undead_set":"game.html:25106","source_antiRevive_bonus":"game.html:42800","baseline_antiRevive":0,"nonzero_antiRevive_modifier_ported_by_this_unit":false}` | configure/native source metadata; API·범위 표 참조 |

### animation / shared physical profile

| config leaf path | 정확 값 | 실제 적용 |
|---|---|---|
| `runtime.animation.kind` | `"native-ch1-eight-direction-atlas"` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.skin` | `"spine_beast"` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.resources_copied` | `true` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.cell_size` | `[256,256]` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.atlas_columns` | `8` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.atlas_rows` | `5` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.column` | `5` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.row` | `0` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.draw_height` | `240.48639090638608` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.native_pivot` | `[0.5,0.5]` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.base_textures` | `{"south":"res://assets/enemy/atlas_ch1_8dir_south.png","south-east":"res://assets/enemy/atlas_ch1_8dir_south_east.png","east":"res://assets/enemy/atlas_ch1_8dir_east.png","north-east":"res://assets/enemy/atlas_ch1_8dir_north_east.png","north":"res://assets/enemy/atlas_ch1_8dir_north.png","north-west":"res://assets/enemy/atlas_ch1_8dir_north_west.png","west":"res://assets/enemy/atlas_ch1_8dir_west.png","south-west":"res://assets/enemy/atlas_ch1_8dir_south_west.png"}` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.source_relative_base_textures` | `{"south":"img/atlas_ch1_8dir_south.png","south-east":"img/atlas_ch1_8dir_south_east.png","east":"img/atlas_ch1_8dir_east.png","north-east":"img/atlas_ch1_8dir_north_east.png","north":"img/atlas_ch1_8dir_north.png","north-west":"img/atlas_ch1_8dir_north_west.png","west":"img/atlas_ch1_8dir_west.png","south-west":"img/atlas_ch1_8dir_south_west.png"}` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.walk_supported` | `true` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.walk_frames` | `4` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.walk_pixels_per_frame` | `128` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.walk_textures` | `{"south":"res://assets/enemy/atlas_ch1_8dir_walk_south.png","south-east":"res://assets/enemy/atlas_ch1_8dir_walk_south_east.png","east":"res://assets/enemy/atlas_ch1_8dir_walk_east.png","north-east":"res://assets/enemy/atlas_ch1_8dir_walk_north_east.png","north":"res://assets/enemy/atlas_ch1_8dir_walk_north.png","north-west":"res://assets/enemy/atlas_ch1_8dir_walk_north_west.png","west":"res://assets/enemy/atlas_ch1_8dir_walk_west.png","south-west":"res://assets/enemy/atlas_ch1_8dir_walk_south_west.png"}` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.base_rect` | `[1280,0,256,256]` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.walk_frame_rects` | `[[5120,0,256,256],[5376,0,256,256],[5632,0,256,256],[5888,0,256,256]]` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.direction_angle_sectors` | `["east","south-east","south","south-west","west","north-west","north","north-east"]` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.direction_rounding` | `"round(normalize_0_to_2pi(facing)/(PI/4)) mod 8"` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.base_and_walk_overlay` | `true` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.walk_frame_rule` | `"floor(_walkDist / 128) mod 4"` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.walk_distance_origin` | `0` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.native_pivot_pixels` | `[128,128]` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.anatomical_foot_pivot` | `null` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.texture_filter` | `"nearest"` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.animation_time_driven` | `false` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.unique_attack_animation` | `false` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.unique_death_animation` | `false` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.native_sprite_source` | `["game.html:23832","game.html:23847","game.html:54119","game.html:54129","game.html:54131"]` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.animation.resources_reused_from_previous_copy` | `true` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.projectile.element` | `"physical"` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.projectile.element_id` | `0` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.projectile.parry_class` | `"physical"` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.projectile.native_dtype` | `"parry"` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.projectile.native_birth_position` | `"actor-center"` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.projectile.base_damage` | `24` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.projectile.contact_damage` | `24` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.projectile.size` | `3.0` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.projectile.radius` | `5.2` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.projectile.contact_margin` | `13.0` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.projectile.life_ticks` | `120.0` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.projectile.life_decay_per_tick` | `0.667` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.projectile.speed_pixels_per_second` | `[300,300]` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.projectile.homing_radians_per_tick` | `0.00109083` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.projectile.homing_until_life` | `30.0` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.projectile.redBean` | `true` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.projectile.homing` | `true` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.projectile.commit` | `true` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.projectile.drop_exempt` | `true` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.projectile.turn_rate_comment_is_stale` | `true` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.projectile.player_knockback_pixels_per_tick` | `2.0` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.projectile.animation` | `{"texture":"res://assets/enemy/proj_phys_mouth.png","cell_size":[768,384],"columns":8,"rows":3,"row_frame_counts":[8,6,6],"flight_row":0,"flight_frames":8,"facing":"east","native_pivot":[0.5,0.5],"frame_rule":"positive_mod((native_game_frame >> 2) + trunc(world_x * 0.03), 8)","height":67.914,"width":135.828,"draw_height_rule":"22.05 * (clamp(size * 1.5, 1.2, 4) * .7) * 2 * .55","rotation_rule":"atan2(vy,vx)"}` | 실제 actor/기존 physical consumer 또는 명시 source metadata |
| `runtime.projectile.source` | `["game.html:20574","game.html:20578","game.html:20599","game.html:17361","game.html:17368","game.html:17370","game.html:17371","game.html:17374","game.html:17664","game.html:41115","game.html:41118","game.html:35710","game.html:35712"]` | 실제 actor/기존 physical consumer 또는 명시 source metadata |

### source native_final27 / 초기 timer197

| config field | 정확 값 | 소비 / 경계 |
|---|---|---|
| `runtime.native_final.x` | `3878.7467967160046` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.native_final.y` | `340` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.native_final.hp` | `875` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.native_final.mhp` | `875` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.native_final.atk` | `31` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.native_final.r` | `34.3551987009123` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.native_final.speed` | `0.40462583759799603` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.native_final.s` | `"idle"` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.native_final.st2` | `30.77384915202856` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.native_final.alive` | `true` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.native_final.facing` | `0.384930423474355` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.native_final.stunned` | `0` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.native_final.poise` | `875` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.native_final.maxPoise` | `875` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.native_final.poiseR` | `0` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.native_final.eShield` | `875` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.native_final.eShieldMax` | `875` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.native_final.eShieldRegenT` | `0` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.native_final.eRes` | `[0,0,0,0,0,0,0]` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.native_final.kb` | `{"x":0,"y":0}` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.native_final.projT` | `299.5166686736047` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.native_final.projCd` | `240` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.native_final._spawnT` | `20` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.native_final._mobCh` | `1` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.native_final._mob8Col` | `5` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.native_final._mob8Row` | `0` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.native_final._mob8dir` | `true` | 원 record full337의 이27개 subset와 값 일치; source 지원 선언 불변 |
| `runtime.initial_timers`: `poiseR`, `chargeT`, `eShieldRegenT`, `bleedT`, `poisonT`, `burnT`, `_tpWarnT`, `_patrolT` | `0` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `_bossStrafeCd`, `_obsGuardT`, `_fsBurrowT`, `_fsGrabT`, `_dragonBreathT`, `_dragonFlyT`, `_seaGrabT`, `_crabGuardT` | `0` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `_eelBurrowT`, `_eelGrabT`, `_ppSelfDestT`, `_teGrindT`, `_kaFlyT`, `_rkComboCd`, `_rkParryCd`, `_rkDodgeCd` | `0` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `_tmCounterCd`, `_tsSlowT`, `_grAbsorbCd`, `_twRotT`, `_twReviveT`, `_deathT` | `0` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `st2` | `30.77384915202856` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `projCd` | `240` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `projT` | `299.5166686736047` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `chargeCd`, `bossPatCd`, `shieldBashCd`, `shieldBashT`, `summonCd`, `summonT`, `teleportCd`, `teleportT` | `9999` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `bombCd`, `bombT`, `reviveCd`, `reviveT`, `stealthCd`, `stealthT`, `wombCd`, `wombT` | `9999` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `webCd`, `webT`, `swoopCd`, `swoopT`, `trapCd`, `trapT`, `motherCd`, `motherT` | `9999` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `slamCd`, `slamT`, `_iceChargeCd`, `_iceChargeT`, `_iceSwoopCd`, `_iceSwoopT`, `_iceSlimeCd`, `_iceSlimeT` | `9999` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `_iceSlamCd`, `_iceSlamT`, `_iceBlizzCd`, `_iceBlizzT`, `_wildChargeCd`, `_wildChargeT`, `_boulderSlamCd`, `_boulderSlamT` | `9999` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `_poisonZoneCd`, `_poisonZoneT`, `_beastComboCd`, `_beastComboT`, `_beastRoarCd`, `_beastRoarT`, `_serpentZigCd`, `_serpentZigT` | `9999` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `_predStealthCd`, `_predStealthT`, `_broodSpawnCd`, `_broodSpawnT`, `_broodGasCd`, `_broodGasT`, `_elderRoarCd`, `_elderRoarT` | `9999` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `_elderChargeCd`, `_elderChargeT`, `_elderSlamCd`, `_elderSlamT`, `_wraithPhaseT`, `_wraithPhaseCd`, `_dkGuardCd`, `_dkGuardT` | `9999` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `_dkSlashCd`, `_dkSlashT`, `_fmAbsorbCd`, `_fmSpitCd`, `_fmSpitT`, `_ddLungeCd`, `_ddLungeT`, `_torChainCd` | `9999` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `_torChainT`, `_wdSwoopCd`, `_wdSwoopT`, `_pillarRingCd`, `_pillarRingT`, `_pillarAoeCd`, `_pillarAoeT`, `_stCloneCd` | `9999` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `_stCloneT`, `_stTpCd`, `_hpHealCd`, `_hpHealT`, `_hpBuffCd`, `_hpProjCd`, `_adFireCd`, `_adFireT` | `9999` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `_adSummonCd`, `_adChargeCd`, `_adSlamCd`, `_adSlamT`, `_erraticT`, `_tongueCd`, `_tongueT`, `_gazeCd` | `9999` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `_gazeT`, `_hangCd`, `_hangT`, `_boneChargeCd`, `_boneChargeT`, `_bloodCd`, `_bloodT`, `_overlordCd` | `9999` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `_volcBombCd`, `_volcBombT`, `_fireBatSwoopCd`, `_fireBatSwoopT`, `_obsGuardCd`, `_fsBurrowCd`, `_lavaGiantSlamCd`, `_lavaGiantSlamT` | `9999` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `_flPriestRevCd`, `_flPriestRevT`, `_flPriestBuffCd`, `_dragonBreathCd`, `_dragonFlyCd`, `_dragonMeteorCd`, `_seaGrabCd`, `_seaSpitCd` | `9999` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `_anglerLureCd`, `_jellyParaCd`, `_jellyZapCd`, `_crabGuardCd`, `_crabSlamCd`, `_eelBurrowCd`, `_coralSpikeCd`, `_coralProjCd` | `9999` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `_sirenSongCd`, `_sirenDashCd`, `_levChargeCd`, `_levTailCd`, `_levParaCd`, `_abyssTentCd`, `_abyssTridCd`, `_abyssWhirlCd` | `9999` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `_abyssSumCd`, `_abyssTideCd`, `_ppRushCd`, `_tePullCd`, `_bpDrainCd`, `_psCreamCd`, `_psGrabCd`, `_psSpawnCd` | `9999` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `_dkComboCd`, `_dkDodgeCd`, `_dkParryCd`, `_iaSpearCd`, `_iaBurstCd`, `_jdScaleCd`, `_jdPillarCd`, `_jdExecCd` | `9999` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `_kaSwordCd`, `_kaTentCd`, `_kaFlyCd`, `_kaBeamCd`, `_kaSumCd`, `_tsTpCd`, `_drTpCd`, `_drRiftCd` | `9999` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `_drSumCd`, `_deathScCd` | `9999` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `bossPatT` | `48.5420147748664` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |
| `runtime.initial_timers`: `_spawnT` | `20` | 원 clock197개 복사; 해당 특수 시스템을 새로 활성화하지 않음 |

## telemetry / 신규 실행 ledger

| event / snapshot | 현재 실제 field / 적용 |
|---|---|
| `enemy_spawn` | id/order/etype/element/position/hp/radius/native_speed/facing/consumer_profile |
| `enemy_aggro` / `enemy_charge` | id/distance; id/ticks/position/bean='normal'/parry_class='physical' |
| `enemy_contact` | id/damage_request24/cooldown_ticks40..59 |
| `enemy_projectile_birth` | id/position/aim/life_ticks120/damage24/native_dtype='parry'. 기존 shot telemetry는 `_forward_event`로 전달 |
| `enemy_damage` | id/raw_amount/remaining amount/absorbed/eShield/hp/source/poise — 쉴드 피해와 HP 피해 분리 |
| `enemy_stagger` / `enemy_charge_cancel` / `enemy_death` | id/ticks180; id/reason='stunned'; id/position. living stagger/cancel의 공개 증거는없으며 정상 HP 요청 death만 기술 관측 |
| type trait snapshot | native_type_traits deep copy, undead_for_anti_revive=true, anti_revive_affix_ported=false. detached trait mutation은 실제 actor를 바꾸지 않음 |
| flow snapshot | last_flow_direction:[x,y], flow_stuck_ticks; 초기[0,0]/0. 실제 축 fallback 성공/막힘은 movement oracle로 확인했으며 snapshot 값의 별도 동적 검사를 추가한 것으로 주장하지 않음 |

| 새 고유 그룹 | 실제 oracle / 최초 결과 |
|---|---|
| `exact_admission` | 정확 profile와잘못된id/order/element/elite/spawn/skin을구분. actual world16→4/12/등록순서/원 full record·subset27·flags/timers·spine texture rect/scale/readonlytraits. 최초PASS |
| `native_motion_charge` | LOS/blocked context 및8방향 actual body+walk, target799의거리128×4셀, 초기접촉 tick31/phys24/cd40..59, charge300→birth360. caster의 정상HP damage 사망 이후 실제기존 physical 진행/parry24·KB2·burn48 request sink. 최초PASS |
| `shield_poise_order` | full absorb·pending 소진/remainingHP25·weapon poise0/KB6.25;1000→HP125와KB15;normalcharge40→kiSlash remaining125/poise125/KB7.5→hitstun7positive+8thresume→정상death/unborncharge 취소. 최초PASS |
| `flow_axis_boundaries` | 기존 통과3 동결 후 새1만 추가. 초기 constructor context의 both/X-only/Y-only/fully-blocked 실제 이동과 LOSfalse 가까운75의 alert0. 최초 X/Y 두 assertions FAIL→제품 flow 분기 수리→fixture 변경0·실패1만 PASS |

| 실행 / 계수 | 실제 보존 값 / 경계 |
|---|---|
| runtime / 최초3 | Godot4.7.2.stable.official.ed1daf0bf, 신규3 PASS/0 FAIL/failed_assertions0/exit0. 당시 source의 결과로 동결·통과3 반복0 |
| 명시 actual physics | 최초3:1159회, 추가 flow 최초:5회, 수리 후 실패1:5회 `_physics_process(1/60)`. source-derived 초기값/constructor context를 사용하며 실행중 actor HP·위치·timer·state 강제쓰기0 |
| 자동 fixture simulation |0틱. `await physics_frame`는 CharacterBody의 실제 delta 준비이며 새로운 자동 gameplay/dispatcher 관측 증거로 세지 않음 |
| 최초 process elapsed |7.103183292s; 검사 프로세스의길이로벽시계frame latency/GPU/240FPS 성능 측정이아님 |
| 최초3 실패 / 수리 / 반복 |0/0/0. 이전 고유3/3/4/5·JS와 통과3 반복0 |
| 추가 flow 최초 / 실패1 재실행 | 최초0 PASS/1 FAIL(2 assertions)/exit1/2.340568333s→제품 flow leaf 수리1→동일 fixture1 PASS/0 FAIL/exit0/2.335691084s. fixture 수리0·실패1 재실행1·통과 반복0 |
| 현행 결과의 범위 | 고유4의 이력은 최초3 PASS와 추가1 실패→수리→PASS로 분리. 최종 source에서4개 전부를 함께 재실행하지 않았으며 그런 결과로 주장하지 않음 |
| test SHA 연혁 | 최초3의17879B/SHA `2eae0aa16d2a304d51972fe623c2748443ffb90f4692411a845be34c26230d1a`를 외부 `test-before-flow-boundary.gd`로 보존. 추가 flow 최초/실패1 재실행의 현재 파일 SHA `dbe60b5e9ef4f39af13d6dc7c2d7031af5deb7d6df67959459f6933817bf527d`; 실패 후 fixture 변경0 |
| source / public |원 snapshot/source/PNG 재해시0·원 factory 재실행0·GUI0·live fields/clock/observer 주입0·공개 QA report 저장0 |
| 실제 검증 한계 |alive_stun_execution_verified=false/public_play_evidence=false/performance_evidence=false. recording sink는 요청 자체를보며full playerHP/DOT/minimum/guard를대신검증하지않음 |

raw/receipt root는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/encounter-etype4-physical-spine-first/`다. `tests/first-three.stdout.log`, 비어있는 `first-three.stderr.log`, `first-three-receipt.json`에 최초3을 보존한다. 추가1의 최초 실패는 `flow-first.stdout.log`, `.stderr.log`, `flow-first-receipt.json`, 실패1 재실행PASS는 `flow-repaired.stdout.log`, 비어있는 `.stderr.log`, `flow-repaired-receipt.json`이다. `contracts-ledger.json`은 세 실행과 source metadata 교정/제품 수리/fixture 불변을 분리한다. 실제human `user://qa/latest-session.json`은 덮어쓰지않았다. 새test는 루트ignore `test_*` 대상이므로 부모가 이정확검사만force-stage하고 ignore규칙은수정하지않는다. worker Git/stage0이다.

## MAP PRODUCTION REPORT (§23)

| 항목 | 현재 결과 / 미완 |
|---|---|
| MASTER / STAGE | 고정 원order13 척추 괴수 한 consumer. 신규stage/encounter/source목록 생산0 |
| LARGE / MEDIUM / GROUND / LANDMARK | map/geometry/collision/nav/배치/PNG/material/loader/server변경0 |
| PLAYABLE / COMBAT | 최초 native기술3 PASS와 추가 flow 경계1 최초FAIL→제품수리→실패1 PASS. source naturalidle/contact/charge·rawshield/remainingHP/축fallback 소비. 전체enemy modifier/fullnav/globalclock/조건부phase/부활미완 |
| CAMERA QA | 기존 인간 source1 fullscreenpaused화면 유지·새 source미로드. 새consumer공개픽셀·벽/전체route검수0 |
| TECH QA | 최초3 PASS/exit0/1159명시, flow1 최초FAIL(2 assertions)/exit1/5명시→수리 후실패1 PASS/exit0/5명시. 자동각0·fixture수리0·통과반복0. 과거source/공개증거동결 |
| FILES / GIT | 소유newtest/newSSOT/기존factory후속1문단의 분리된 검사·수리·한계 기록을 저장하고 freeze. 타인WIP보존·workerGit0. 부모가 소유 code+docs 정상checkpoint를 담당하며 commit 성공 전 완료표시0 |
| VISUAL VERDICT |**RETOUCH** — 신규공개소비/예술품질/전체AI·시간parity/생존stun/최소Windows1080p240未검증 |
| NEXT PASS |별도승인된actualapp에서native 접촉·발사·스킨·독립탄의공개검수. 원8방향escape·wholeflow/cache/장비modifier/조건부phase/부활/wholeclock·최저240은별도미완; 미지원12를같은AI로위장하지않음 |
