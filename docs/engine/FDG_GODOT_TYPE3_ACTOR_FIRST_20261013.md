<!-- fdg-godot-native-owner-element-integration-20261013:begin -->
## Godot 소환·6원소 실행 연결 / 현재 이식 경계 · 2026-10-13

| 항목 | 현재 코드·검증 / 미완 범위 |
|---|---|
| 정본 | `docs/engine/FDG_GODOT_TYPE7_INTEGRATION_20261013.md` 및 `FDG_GODOT_TYPE3_BINDING_20261013.md`. 이번 새 production은 실제 World 시계·registry, type3 binding, 원 6속성 packet→투사체→피격FX, type7 조립 API이다. 원337/supportfalse/runtimeNULL·기존 텔레포트/M30/6source/배송5 증거는 보존한다. |
| 시계·생성 순서 | World priority−1 `ticks=min(delta×60,3)`/actual frame·ens Array identity→관리 owner1→원 particle pool update→warning1→기존탄 priority1→새탄 birth2→hitFX post3. getter setter0/AI 이중 자동실행0/SceneTree pause 상속. 초기 report와 동적 child registry를 구분한다. |
| source packet | `_commit`도 dmg×2/sz×2/r4×1.3=5.2. P redBean .5를 후적용해 raw피해 유지/300pxs; magic500..600. P/L/H size3·margin13, F/I/D size3.2·margin13.6. type3 life60/type7common240/TPqueued300, decay.667·homing.00655/life>30. D caller-life60/240 pair만 지원/범용D120 alias0·추가poison0. |
| 실제 피해·FX | type3 F/H는 magic·headingKB2, D는 정규화피해×1.3 magic·기본hurtP KB보존. M29 body는 모든원소 phys이며 elMul 선배율→기본hurtP→독립KB100. current armor미착용 native 배율1. 실제 hitFX 새원bitmap4 합779557B(512²/4×4/cell128²) 최초import4/3.545726167초/ERROR0·oldtexture reimport0. |
| source 상태·입장 | raw source와 별도 actor ctor payload에 facing/eShield/eShieldMax/eRes/native_flags/bodyrect/direction/ai_profile만 투영한다. absent nativeflag는 absent 유지(null/false 발명0). M29 Q/E·warning·impact·SOUND 4cap 및 실제6원소·summon_context가 준비되지 않으면 type7 configure/prepare/install 원자거부. sourceRecord와 pendingJSON은 수정하지 않는다. |
| 현재 기술 인수 | 새고유12PASS=type3 binding4+실World phase2+6원소/FX4+type7 assembly2. assembly는 첫missingM29 1PASS/actual1FAIL→실패actual1만추가FAIL→같은실패1만1.948709167초/exit0/assert0/ERROR0 PASS 이력. source map Dictionary8/absentflag 투영을수리했으며원337/TP본문불변, 모든성공재실행0. actualWorld16frames/owner32·particle/warning/birth/post 각16·pause4, actualFHD Player피해/KB·FX pool12·65생존/66만료·invalid8 부분출력0. |
| Main·배송·시각 | 이번조립 API는 Main/factory 자동등록0. current Main source지원6/미10, 동결Web·Windows배송5/미11. constructor readiness fixture를실제공개Q/E·자연소환/교전·publicpixels/GPU·최저1080p240·24고유프레임/24FPS로승격하지않는다. **VISUAL VERDICT: RETOUCH**. |
| 다음 실제 연결 | 새type7 actualassembly기술단위를 정상 code+관련docs checkpoint→같은SKILL actualNativePlayer 명령/패링 leaf 및 ANIM M29 owner-event소비→본편 자연소환/텔레포트/교전·시각검수. source수치·원MAP/geometry/nav/STARTEXIT·보호paused화면/서버/save/타WIP 유지. |

<!-- fdg-godot-native-owner-element-integration-20261013:end -->

# Godot 소환 type3 actor 첫 소비 — 2026-10-13

이 문서는 `godot/scripts/type3_summoned_actor.gd`의 현재 구현 계약이다. 새 소환 생성기가 만든 CH1/stage0 type3 원레코드를 실제 actor로 소비하며, 기존 actor의 이름·색을 바꾸는 alias를 사용하지 않는다. 소환 child의 HP 반감·shield0·원 poise를 그대로 유지한다. 이 단위는 생성기와 M29 제작을 병렬로 연결하기 위한 actor이며, type7 전체 admission이나 현재 배송 Web/Windows 변경은 아니다.

| 항목 | 현재 상태 |
|---|---|
| 실제 코드 | 원 recipe 소비, AI 이동/LOS/차징/회복, 원 HP/poise 피해 소비, 원 atlas cell renderer, 원 6속성 charged packet producer, modifier adapter API |
| 신규 검사 | 고유 6그룹 유효 PASS 이력. 첫 유효 3, invalid 1/fixture 실패 1만 수리 후 각각 PASS, 새 source warning/guard 1 최초 PASS |
| 실행 구간 | headless 새 생성기 fixture·명시 actor `advance_native`만. 자동 physics0·render0·resource import0·실제 projectile0·공개 play0 |
| 원본 보존 | frozen initial16/원 PNG/copy/hash/완료 검사 재회수0. new script/doc/test만, 공유 Player/enemy/factory/config 수정0·Git stage/commit0 |
| 등록/배송 경계 | source지원6/미10 유지, type7미등록. 기존 Web/Windows5/미11·paused 인간 앱 그대로 |
| 시각/성능 | `VISUAL VERDICT: RETOUCH` — 원 resource 실제 표시·전체 전조·공개 교전·GPU·최저사양1080p240 미검수 |

## 원 recipe와 공개 API

`ExoduserType3SpawnRecipe.build_child(...)`가 생성한 `exoduser.godot.type3-spawn-recipe.v1`을 받는다. actor configure는 RNG draw를 만들지 않으며, incoming recipe를 deep copy한다. JS `~~`를 보존한 HP 검증은 32bit 정수 절삭을 사용한다. Godot `Vector2` world/renderer 경계는 float32이며 원 dictionary 수치와 구별한다.

| API/id | 한글명·인자 | 적용 위치/현재 동작 |
|---|---|---|
| `configure(recipe,target,world,interfaces)->bool` | 소환 actor 원 recipe 소비 | nonboss/etype3·6속성 enum·elite0/1·M29/M30·HP/shield/poise 관계·원 dynamic256cell·world API·emitter/sharedRNG·필수 elite hook을 먼저 확인한다. 실패는 actual state·registry·resource·RNG 변경 전 반환 |
| `advance_native(ticks)` | 원 native tick dispatch | native60 기준; 기본 autonomous physics=false. actual owner 또는 `automatic_physics=true`가 dispatch. tree paused이면 명시 호출도 정지 |
| `_physics_process(delta)` | 선택 자동 dispatch | 선택 시 `delta×60`; 현재 검수는 명시 호출만이며 자동 dispatch·tiering PASS로 올리지 않는다 |
| `get_charged_packet(target_position)` | 원 charged projectile 생성 입력 | 원 `_fireChargedProj`의 `spawnProj` 입력을 읽기 전용 생성. `spawnProj` 전역 배율·speed normalization 전 값 |
| `get_native_modifier_state()` | 제작 modifier 상태 | M29/M30 production adapter가 원 JS key dictionary를 공동 소비한다. QA용 state setter가 아니다 |
| `get_native_player_context()` | 실제 target context | x/y/r/hp/iframe/state; M29는 실제 parry window provider가 필수. fixture의 false parry provider는 전체 public parry 소비 증거가 아니다 |
| `get_snapshot()` | 읽기 전용 관측 | deep copy. 수정해도 actual HP·좌표·clock에 쓰이지 않는다 |
| `get_animation_recipe()` | 원 skin/crop/frame 읽기 전용 | 원 동적 col/row, 8방향·거리frame·본체/오버레이·spawn alpha. 테스트는 recipe 수치만 확인하며 PNG 시각 PASS가 아니다 |
| `receive_damage/receive_poise_damage` | 현재 raw/no-equipment 피해 consumer | actor HP와 원 prehalf poise 별개. shield-overflow·DOT/stun/frozen 배율·방향KB baseline·source elite hitstun 지원. 전체 장비/affix/incoming 상태이상·drop/XP/부활 caller는 미완 |

| 원 field | 현재 규칙·수치 |
|---|---|
| `hp,mhp` | `JS ~~(factory_hp×.5)`; 두 값만 소환 후 반감 |
| `poise,maxPoise` | `factory_hp` 그대로, HP와 동일하게 반감하지 않음 |
| `eShield,eShieldMax` | 원 소환후0; 타인 shield나 포이즈에 쓰지 않음 |
| `el` | 0 physical,1 fire,2 ice,3 dark,4 lightning,5 holy; 모든값 원값 소비 |
| `elite,mods,aura` | elite0이면 mods[]; elite1은 원 [M29] 또는 [M30], aura null. missing modifier consumer는 configure 거부, flag 삭제0 |
| `projCd` | 생성기에서 normal240 / elite192 그대로 소비 |
| `projT,st2,facing,speed,r` | 원 생성 recipe 수치 그대로, actor reseed/reroll0 |
| `col` | 원 type3 본체 `ETYPE_COL[3]='#66ee66'`; 탄색은 아래 ELC/bean값으로 별개 |
| `modT` | 생성기 원 fresh dictionary 소비. 개체간 공유·전역 attack ticket·동시공격 제한0 |

## 원 AI clock/이동/상태

첫 참고는 `docs/9적ai패턴디자인/9_적AI패턴디자인.md`와 해당 몬스터/탄막 문서, 현재 canonical `R/game.html`의 좁은 `updateE/_ffMoveE/_fireChargedProj/hurtE/_poiseHit` 본문이다. 이 actor는 원 type3 접촉형으로 승격하지 않는다.

| id/분기 | 원 수치·순서 | 현재 적용 |
|---|---|---|
| main-loop timer | `_spawnT/_hitFlash/_hitStun/stunned` 감소→KB→hitstun return→stunned cancel→frozen cancel | 명시 native tick. tick은 float 허용, pause 정지 |
| native KB | x/y 절대값 .1보다 클 때 canMv 이동; `.85^ticks` 감쇠 | canMv 기반 raw actor 이동. tile벽·rift 피해는 별도 정확 callback 필요; props를 tile로 분류하지 않음 |
| hitstun | idle 일반8/elite4; hitstun은 stunned cancel보다 선행 | 비DOT baseline HP 피격의 원 state 소비, AI/charge/mod clock 정지 |
| frozen | 행동불가/charge cancel; 종료 immunity120 | 현재 frozen guard와 종료120 보존. incoming ice 게이지·shock/affix 전체는 미완 |
| poise regen | 부족하면 누적200, `trunc(maxPoise×.15)` 가산·max cap·timer0 | ordinary child prehalf maxPoise 기반; 성공 체크는 원875 poise에서131 가산 |
| aggro | 비alert + idle/recover + d<800 + LOS | 가까운 무LOS 강제alert 분기 추가0 |
| facing | d<800 + alerted이면 현재 P 방향 | 실제 이동 시 animation에는 이동각 우선 |
| flow pursuit | `ETYPE_RANGE[3]=200≤400`, d>30이면 원 flow 이동×1 | bothXY→X→Y, 원 stuckT reset/last direction, ±45°×4·속도.8 우회; stuck>30 반경max(2,r−2) ±22.5°×8, stuck>90 원 2..6거리 시도 |
| pre-AI elite | owner guard 뒤, `_tickProjCharge`/far gate 앞 | `modifier_pre_ai(actor,ticks,distance,ctx)`; M29 busy 감소·trigger / M30 actual `advance_native` 연결 지점 |
| charge tick | 이미 존재하는 charge60 감소, 종료 즉시 원 packet producer | 새 charge 생성 frame에는 감소0. 완료 후 같은 update idle `projT` 감소1을 보존 |
| far gate | 미alert + d>400 return; eChargeWind/eCharge committed이면 계속 | source updateE에는 별도 P.hp gate가 없어 추가하지 않음. game-over/main-loop phase는 caller 소유 |
| idle | 현재 facing 방향 `speed×1.6×ticks` | 원 동적 actor 이동. type3은 원 `_meleeET` 집합 밖이므로 자연 contactdamage null |
| separation | query radius `r×4.4`, 최소 `r+other.r+4`, force×1.5, `_sepCd=3` | 현재 world.get_enemies 실제목록 consumer 필요. owner/타인 목록 수정0 |
| projectile start | `_projChargeT≤0`일 때 `projT−ticks`; `projT≤0 && d<200`→projT=projCd,charge60 | native source 채택. 원 `_projChargeCol`/bean/parry class와 cancel fields 보존 |
| recover | st2≤0이면 idle, st2=`15+sharedRNG×15` | configure 때 shared RNG callable 필수; creation draw0 |
| M29 state step | source st2 감소 뒤 eChargeWind/eCharge | `modifier_state_step(actor,ticks,ctx)`; kernel `step_charge(...,decrement_st2=false)`와 같은 계약 |
| windup/attack | 일반 자동근접 windup entry 없음 | eCircle/어택ticket을 추가하지 않는다. event/provider 표현을 actual 근접 entry 완료로 세지 않음 |

## 원 6속성 charged packet과 actual consumer 경계

모든 packet은 원 actor 중심 x/y, 현재 target 조준, friendly=false, life/ml60, `_commit=true`이다. 원소값·색으로 다른 actor/탄 class를 alias하지 않는다. 아래 `dmg`은 `spawnProj` 정규화 전 원 값이다.

| el | charge bean | 입력 speed/tick | 입력 dmg | 입력 sz | 입력 col | bean flag / charge parry |
|---|---|---:|---|---:|---|---|
| 0 physical | normal | 3 | `trunc(atk×.8)` | 1.5 | #bbbbbb | 생성입력 flag 없음 / physical |
| 1 fire | fire | 3.2 | `trunc(atk×1.2)` | 1.6 | #ff2e22 | fireMagic=true / magic |
| 2 ice | water | 3.2 | `trunc(atk×1.2)` | 1.6 | #317cec | waterBean=true / magic |
| 3 dark | dark | 3.3 | `trunc(atk×1)` | 1.6 | #a44cff | gbBean=true / magic |
| 4 lightning | normal | 3 | `trunc(atk×.8)` | 1.5 | #ffee00 | 생성입력 flag 없음 / magic |
| 5 holy | normal | 3 | `trunc(atk×.8)` | 1.5 | #ff88cc | 생성입력 flag 없음 / magic |

`emit_charged_projectile(actor,raw_spawnProps)`를 반드시 실제 `spawnProj` consumer에 연결해야 한다. 기존 P/I/L kernel을 소비할 때도 해당 type3 원생성입력에 맞는 profile이 필요하며 이전 exact type0/4/1 profile의 피해·life를 복사해 쓰지 않는다. 물리 redBean 승격·마법homing·sz×2/r×1.3/dmg×2 및 redBean×.5·속도300/500..600·접촉배율·status producer·camera cull/expiry·owner독립을 downstream에서 정확히 소비해야 한다. actor 테스트의 packet sink는 이 후속 실제 소비 증거가 아니다. fire/holy 및 current dark full consumer·6속성 onhit·원 charge renderer는 central owner가 준비해야 한다.

blackBean은 이 producer에서 새로 생성되지 않는다. 기존 blackBean 계약은 magic/Q 전용·E불가·Q 성공 blue 유도반사이며, actor에서 변경하지 않는다. owner 사망은 발사된 world sibling 탄/FX를 제거하지 않는다.

## 원 body resource 소비

| 항목 | 현재값 |
|---|---|
| base resource | 기존 `res://assets/enemy/atlas_ch1_8dir_{direction}.png` 8장, 신규copy/hash/import0 |
| overlay resource | 기존 `res://assets/enemy/atlas_ch1_8dir_walk_{direction}.png` 8장, 신규copy/hash/import0 |
| direction | east/south_east/south/south_west/west/north_west/north/north_east, `round(angle/(π/4)) mod8` |
| base crop | 원 skin col/row×256, cell256×256 |
| walk crop | `(col×4+frame)×256,row×256`, frame=`trunc(walkDist/128) mod4` |
| walk availability | canonical `img/atlas_ch1_8dir_walk.json` 39 indices, 25 skinless_hound는 walk 없음. 없는 authored overlay를 다른 skin으로 대체0 |
| size/alpha | height=`max(r×3.5,30)`, spawnT20이면 `1−spawnT/20`; 본체 항상+이동 overlay만 |
| 실제 시각 | renderer 코드 작성, resource import/PNG 화면/공개 natural combat·전체 전조 실제 미검수 |

## 새 검사 이력·격리

증거 위치: `E/godot-native-first/dependency-type3-actor-first/`. `before-edit/manifest.json`은 owned4개 파일의 이전 absence/HEAD absence와 실제 parent를 저장한다. `isolated/`는 새 actor/새 생성기/새 test만 포함한 별도 project이고 원 userdir를 사용하지 않는다. 공유 original asset·scene·test를 import하거나 기존 성공suite를 실행하지 않는다.

| 고유 검사 | 최초 실행 | 수정·추가 실행 | 유효 결과 |
|---|---|---|---|
| recipe_and_elements | 62assert PASS, 명시step0 | 반복0 | PASS |
| native_movement_and_contact | 7assert PASS, 명시step53 | 반복0 | PASS |
| charge_birth_and_independence | 6assert PASS, 명시step300 | 반복0 | PASS |
| damage_poise_and_guards | raw7assert PASS표시 뒤 undefined `_projChargeT` 직접조회 SCRIPT ERROR | fixture read `.get(...,0)`만 수리, 해당1그룹만11assert/216step PASS | 최초 invalid는 PASS불채택, 이후 유효 PASS |
| modifier_order_and_atlas | fixture skin/float 2assert FAIL, 8assert/2step | 원 dynamichash x1→skin12/crop 및 alpha float비교만 수리, 해당1그룹만8assert/2step PASS | PASS |
| charge_warning_source_guard | 최초24assert/1488step PASS | source 누락 warningcol/cancel 및 불필요 PlayerHP gate 제거 후 새 추가1만실행, 기존5 재실행0 | PASS |

실제 명시 actor 호출 이력은 first563 + damage216 + atlas2 + newguard1488 =2269회다. 최초 damage208회 중단은 유효 PASS와 구별한다. 모든 실행 자동physics0·render0·assetimport0·actualprojectile0이며, 노드 constructor fixture와 원 modifier hook 순서를 사용한다. 새검사의 constructor recipe 생성은 new spawn helper 소비이지 타worker의 완료 constructor suite 재실행이 아니다. 자연 play/시각/성능/최저Windows240는 이 수치로 주장하지 않는다.

## 현재 필수 남은 caller

| 범위 | 정확한 gap / 다음 소비 |
|---|---|
| actual 6element shots | raw packet→native spawn normalization→6 element physics/onhit/render consumer, 원 life60 profile·F/H/current dark 포함 |
| common charge | 원 `_drawShootCharge`/physical label 전체 actual renderer; actor 원 warningfields/packet만 구현 |
| M29 | Claude가 제작한 kernel의 provider/sink를 actual canMv/벽/element/P 피해·패링·KB100/eModHitP/FX에 연결; constructor fixture parry=false는 actualQ/E 완료가 아님 |
| M30 | actual owner node와 modT를 existing `ExoduserM30Modifier.configure`에 연결·advance/render adapter; module standalone 완료와 live actor 소비 구분 |
| world registry | source source-order child insertion·group·world.get_enemies·projectileworld·mod FX sibling 연결; 현재 기존 shared world/factory 수정0 |
| guard/tier/collision | 원 full frame tiering/벽밀어내기/KB tile벽·rift 피해 및 status cooldown 전체 callback. 현재 좁은 actor AI와 해당world API consumer를 분리 |
| incoming damage | 현재 raw/noequipment baseline. 전체 플레이어 장비/affix·shock/ice gauge/DoT·드롭/XP/부활/네트워크/저장 pipeline은 미완 |
| type7 | summon40/count1..2/6elements/elite0or1/M29orM30·TP/M30/전조/childfactory 전체 actual 연결 전 미등록. 지원7로 승격0 |

관련 키워드 전체 docs 검색 결과는 `docs-keyword-matches.json`에 기록했다. 기존 공유문서 동기화와 정상 code+docs checkpoint는 central owner `Find 앤진개발팀 FDG`의 소유다. worker는 이 새 문서만 수정하며 immutable `2_3`/제외 marketing 문서·공유 WIP·원 save/API·paused 화면·배송 artifact·서버3333을 보존한다.
