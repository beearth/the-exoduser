<!-- fdg-godot-floating-text-binding-20261013:begin -->
## Godot 실제 World 텍스트 연결 · 2026-10-13

| 항목 | 현재 구현·검증 / 남은 범위 |
|---|---|
| 정본·공개 API | `FDG_GODOT_FLOATING_TEXT_BINDING_20261013.md`. 실제 World `emit_native_text(x,y,text,color,life=null,size=null,num_str=null)`, `get_native_text_snapshot`, ko identity `localize_native_text`, 기존 NotoSansKR `get_native_text_font`을 공급한다. |
| 단일 풀·시계 | 실제 World 아래 adapter/producer 한 개·ring40·z4002. dark 요청 `(x,y−20,"💜다크볼!","#cc44ff",30,22,null)`은 admission1/legacy Label0. HitFX 기존 priority3 끝에서 실제 context.dt_sp/frame/ens를 한 번 공급해 y−=.6ticks→life−=ticks. pause/중복/복사token/오류dt 거부. |
| 첫 신규 검사 | binding3 FIRST PASS /5.653511290999999초/exit0/assert0/ERROR0. 실제 dark16ticks/post16, generic44admission/40ring/실Camera zoom2→view960×540, guard9frames/37거부/pause4. 읽기검수에서 발견된 ready 타입/실제 backend상태/detach·reparent·queued삭제 guard를 수리해 신규 lifecycle1 FIRST PASS /5.107139167초/exit0/assert0/ERROR0, 전체고유4. 첫3성공 반복0; 이전 성공suite/import/Main/GUI 재실행0. |
| 현재 경계 | 실제World sink와 dark caller만 연결; detonate/shield-bash/combo 등 개별caller·full locale/reset/testbed120·원480×168 숫자atlas·공개pixel/canvas비교·최저1080p240은 미완. current Main source6/16·동결배송5/16 유지. **VISUAL VERDICT: RETOUCH**. |

<!-- fdg-godot-floating-text-binding-20261013:end -->

# FDG Godot 소환·6원소 실행 기반 / type7 조립 진행 · 2026-10-13

| 항목 | 현재 실제 상태 |
|---|---|
| 기준 checkpoint | `b921fc4017703d8b37cc2a9de8fdb5781992165e` 이후 실제 owner/factory 연결 제작. 완료된 TP/M30 standalone 단위와 그 검사·원자원은 동결하며 재실행하지 않는다. |
| 소유 | 중앙: `world.gd`/`enemy_factory.gd`/필수 Player 공개 leaf/새 packet emitter·runtime config·현재 docs. type7 owner: 별도 worker 신규 `enemy_type7_physical_flesh_crawler.gd`. M29/type3 recipe/type3 summoned actor는 ROOT worker 전용 신규 파일. |
| 공용 시계 | World `_physics_process` priority−1. player·ready_for_player 유효할 때 `ticks=min(delta×60,3)`, frame+=ticks. pause는 실제 SceneTree 상속. 공개 frame/identity getter에 setter가 없다. 원 source 전체 tier/global RNG scheduler 동일성은 미확인이다. |
| 실제 owner phase | `native_world_phase.gd` priority1을 world의 첫 runtime child로 설치한다. 기존 Player/actor priority0 이후, 뒤에 생성된 priority1 projectile children 이전에 managed owner AI 전체→particle pool update→queued warnings 전체를 진행한다. 기존 priority1 projectile은 그 뒤 진행하고, 새 birth priority2→hitFX post priority3이 이어진다. 새 late birth node는 World clock만 소비한다. |
| 새 birth driver | `native_projectile_birth_phase.gd` priority2가 `advance_native_birth_phase()`를 호출한다. `(ticks,actual_world_frame)`을 emitter `advance_birth_phase`로 1회 전달 후 pending ticks를0으로 지운다. pause와 중복 explicit 소비를 거부한다. `bind_native_projectile_emitter(emitter:Node)`는 실제 world child/공개 birth 메서드를 확인하고 1회만 binding한다. actual emitter를 consuming fixture에 연결한 새 runtime 검수를 완료했다. Main/factory 자동등록은 아직0. |
| report 관측 | `initial_encounter_report_unchanged`는 `_encounter_report == _native_initial_report` 실제 비교이며 고정true가 아니다. install 때 독립 deep snapshot을 저장한다. |
| 단일 AI driver | `register_native_phase_consumer(actor,owner_step,queue_step)`는 actor 자동 physics를 끈다. 실제 Callable을 WeakRef owner와 저장하며 같은 actor 재등록은 false. owner step 인자 `(ticks,frame,actual_enemies_array)`; queue도 동일. render/VFX 시계와 AI 시계를 합치지 않는다. |
| 동적 registry | `register_summoned_enemy`는 `is_native_registry_ready()`/`advance_native_phase`와 actual Player binding을 선검증하고 owner phase등록→telemetry 연결→`_enemies.append`→`add_child`를 수행한다. 준비되지 않은 actor는 registry와 world child를 만들기 전에 거부한다. player melee/crescent 질의가 같은 registry를 소비한다. 기존 initial16 encounter report는 dynamic child로 다시 작성하지 않는다. actual prepared type3 binding의준비조건과동적registry/phase소비계약을 신규자동runtime으로검증했다. 자연 type7 소환→랜덤 child의전체조립 검수는아직pending이다. |
| Source safe placement | `native_safe_point(x,y,r)`는 원 R32378 safePt: 먼저 현재점, 그 뒤 T40..200/step20와8방향 PI/4×index의 원 순서로 can_move를 확인하고 실패null. 자체 RNG0/원 geometry·collision 변경0. |
| Channel literal adapter | `emit_native_channel_particle(raw)`는 finite x/y/vx/vy/sz/life 및 CSS색을 검증하고 actual typed literal particle으로 전달한다. 원 owner가 샘플링한 값 그대로/추가 RNG0/좌표나 수명 재생성0. |
| Player 원소배율 | get_native_element_multiplier(attacker_element_id)는 2026-10-17 Main이 바인딩한 실제 SourceState INV의 현재 armor.el을 기존 producer로 조회한다. 무장비/누락/null/비숫자 el은1, 원2/0.5/1 matrix는보존. 전체 장착 UI/저장·affix 이식 완료 아님. |
| 공유 U source | `sample_native_random_unit()`은 actual global Godot `randi()/4294967296.0`로 `[0,1)` 값을 공급하고 공개 draw count를 축적한다. child별 reseed0. 전체 원 JavaScript boot/global RNG stream 동일성은 미확인이다. |
| world identity | `get_native_world_identity()`는 실제 `_enemies` Array 참조이다. 같은 Array에 child를 append해도 identity가 유지되고 새로운 world/Array는 다른 reference이다. getter가 복제를 반환하지 않는다. |
| 새 실제 hitFX context | world의 `native_projectile_hit_fx.gd` provider로 F/H/charged dark 실제 onhit를 연결한다. required context schema `exoduser.godot.native-projectile-fx-context.v1`; actual FPS 80↑/55↓ hysteresis, native delta×60 clock/epoch, scoped particle hard limit1000, registered external live count, shake100%, vibrationfalse, text ring40, float_text_enabled=true/battle_test_active=false. World typed Color 변환과 direct literal particle(position/velocity Vector2, color Color, size/life_ticks)를 소비한다. 이는 신규 native hitFX 범위의 명시정책이며 원 OPT/Tier/slowMo/oldglobalGL budget 동일성을 주장하지 않는다. 실제 native bitmap4 firstcopy779557B·각512²/4×4 cell128², isolated 첫 actual texture import4/3.545726167초/exit0/ERROR0, old texture reimport0. 첫 import는 새6GD와 기존code class scan을 포함하며 Main/export/GUI0. 새6원소/실Player FHD contact/FX수명/원자성4group은처음PASS(exit0/8.449706917초/assert0/ERROR0/자동fixturephysics72). 공개pixels/GPU/성능증거는아니다. type3 binding고유4는첫2PASS+M29fixture실패1만수리PASS(.264461167초/604ownerphase)+신규cleanup1첫PASS(.371643625초/0step). 최초.359575833초의assert1/SCRIPT1이력을보존했고성공그룹재실행0. |
| 실패 cleanup | type3 공개 `dispose_unregistered_native_dependencies()->bool`는parent있으면false, unparented는자기M30 sibling만free/refs정리/readyfalse 후true이며missinghelper멱등. 실제새cleanup그룹은childcount2→1/다른target보존/installedactor보존을처음검증했다. |
| 정확 initial API | `register_native_initial_consumer(enemy,original_record)` 신규API는원초기row의record와exact ID/order/etype7/P/M30·actualscript/readiness를검증하고original ens source order에 삽입한다. 원record337/supportfalse/runtimeNULL은보존하고별도report consumer지원 overlay만갱신한다. Main자동호출0/실type7조립고유2검수PASS, privateconstructorfixture에서overlay6→7·원source16/337보존확인. 실제Main자동호출0/현재source지원6 유지. |
| M29 실제 피해 분류 | 원 `R/game.html:41137`은 `hurtP(~~(atk×30×elMul))`의 opts 미전달이며 `R:44025` default dtype=phys이다. M29 body는 모든 공격 원소에 phys, 원소 상성은 선배율만 적용한다. 신규 binder의 el별 magic draft를 수정 중이다. |
| M29 lock | M29 caller는 `tick_attack_lock` 1회, M30 caller는 M30 내부 감소 1회. 현재 source가 생성하는 단일 M29/M30에 대해 중복 감소하지 않는다. M29 raw state hook의 실제 type3 소비는 별도 worker 제작 중이다. |
| 6속성 실제 발사 | 신규 `native_element_projectile_emitter.gd` 서비스(Node)가 configure(world,target)/emit(actor,raw)/emit_normalized_type21(actor,global_origin,heading,profile)/queue_existing_birth/advance_birth_phase/create_type7_teleport/get_snapshot를 제공한다. type3 EL0..5, type7 P0, type21 D3의 정확 caller만 지원하며 main/factory 미등록. 신규 source parse exit0/ERROR0, 실제새결합4group 최초PASS, constructor packet source만공급하며자연소환/차징전체완료로세지않는다. P/I/L 기존 kernel을 caller별 source profile로 소비하고 F/H/D 신규 kernel을 소비한다. D caller-life 허용은 type3=60/type21=240 두pair, generic D life120 alias0/추가poison0. |
| raw normalization | `_commit`도 dmg×2/sz×2/r4×1.3=5.2를 적용한다. redBean P는 그뒤 dmg×.5→raw피해 그대로; life/ml 유지(type3=60/type7common=240/TPqueued=300). P/L/H size3 margin13, F/I/D size3.2 margin13.6. magic scalar500..600, P300. 추가caller alias/RNG reseed0. |
| 원소별 RNG/parts | P는 원 min=max300 sampling의 U1을 sharedWorld에서 소비하고 속도300. I/L은 완료kernel 자체샘플1을 재사용하며 World 추가샘플0; F/H/D는 sharedWorld U1; normalized21은 caller의 supplied speed로재샘플0. type3 F/I/D rawparts3 각 #ff2e22/#317cec/#a44cff, P/L/H rawparts2 actual actor.col(#66ee66); type7 ownerparts2와중복0; type21 Dparts3. 전체 JS boot RNG parity는 미입증. |
| 새 TP birth seam | `create_type7_teleport()`가 NEW subclass를 unparented로 반환하고 원 configure5args를 소비한다. `_deliver_shot` override는 기존 life300/원profile를 유지해 같은 emitter pending append order에 넣으며 late birth 후 delivery event를낸다. 동결 원TP본문 변경0/TP성공suite재실행0. |
| type3 actual binding | 신규 `type3_native_binding.gd`가 완료root actor를 상속하고 actual public facing/flags/flattenedguards/is_native_registry_ready를 제공한다. root localframe은 born-relative로 유지하고 actualWorldglobalframe/identity를 별도로 검증·캐시한다. 같은 phase 재소비/새복제identity/inventedframe은 거부한다. M29 actual Q/E·warning/impact/SOUND callbacks/readiness를 필수검증하며 실제본편provider 연결전 true로강제하지않는다. |
| 시각·입력 | 기존 인간 paused 화면·3333 원서버·배송본을 조작하지 않는다. 공개 play/실 pixels/카메라 route/최저1080p240 검수 미실행. 안개100/20 별도 QA는3334 opt-in gate 불일치로 후순위·미완료이다. |
| 지원 집계 | source 지원6/미이식10, 동결 배송5/미11. type7/child 실제 admission은 필수 producer/caller/resource 및 신규 통합검수 완료 전0. full_native_enemy_system/Player fullQ·E parry 승격0. |
| 신규 검수 | 새고유12 기술PASS=type3 binding4+World phase2+element/FX4+runtimeassembly2. actual World16nativeframes의32ownerdispatch/particlepre16/warning16/birth16/postFX16, pause4신호동결, ens actual reference/initial6 report보존·unready/targetreject원자성 확인. World scope elapsed1.60747825초. old완료suite재실행0. 새type7조립2case도고유PASS로닫았다. 첫M29 unavailable PASS/actualassembly FAIL→Dictionarymap leaf수리후actual1FAIL(SCRIPT bool(null))→absentflag projection+실패fixture exactshape수리후실패actual1만1.948709167초/exit0/ERROR0 PASS. 모든성공재실행0·본편admission0. 새원hitFX4첫import exit0/ERROR0. ROOT의 M29 고유14·type3 recipe 고유4 독립검사는 각 새 정본·handoff의 완료 이력이며 여기서 재실행하지 않는다. |

## MAP PRODUCTION REPORT (§23)

| 항목 | 현재 범위 / 판정 |
|---|---|
| MASTER/LARGE/MEDIUM/GROUND | retained 지도 가이드 제작 순서 유지. geometry/collision/outer mass/nav/START/EXIT/원배치 변경0. |
| PLAYABLE/LANDMARK | type7 실제actor/TP/M30/commoncue 조립·관리phase/정리 기술검수완료. constructor fixture에서initialoverlay6→7·actual far_unalerted1회/queue1회/pause를확인했으나Main자동등록0/자연소환·교전미검수. |
| CAMERA QA | actual pixel/route/foot/crop/경고 가독성 미검수. |
| TECH QA | 신규고유10 기술PASS와FX4 firstimport 완료. type7 실제조립2case고유PASS(실callback은constructor readiness/requests범위); 동결완료/successsuite재실행0. |
| FILES/GIT | 중앙 공유 코드와 신규 owner/module의 완료 owned hunk만 다음 정상 checkpoint로 묶는다. foreign/다른 worker 파일 무단 수정·stage0. |
| VISUAL VERDICT | **RETOUCH** — 실제 등록·자연 교전·공개 시각 및 성능 검수가 남아 있다. |
| NEXT PASS | actor source phase supplement→6속성 actual packet/onhit→원 child constructor/registry→원 M29/M30/TP 실제 owner→factory exact gate→신규 통합검수·docs sync·정상 checkpoint. |

## 새 Source UID metadata

| 신규 script | actual engine UID | 생성 범위 |
|---|---|---|
| `enemy_mod_m29.gd` | `uid://d4mb70avh3tbq` | fresh Godot ResourceUID.create_id / 텍스처import·검사재실행0 |
| `type3_spawn_recipe.gd` | `uid://bjesmu8auojk4` | fresh Godot ResourceUID.create_id / 텍스처import·검사재실행0 |
| `type3_summoned_actor.gd` | `uid://bp1sqoyl4uvli` | fresh Godot ResourceUID.create_id / 텍스처import·검사재실행0 |
| `type3_native_binding.gd` | `uid://rxns458x2sdi` | fresh Godot ResourceUID.create_id / 텍스처import·검사재실행0 |
| `enemy_type7_physical_flesh_crawler.gd` | `uid://bdp5x0apasg3x` | fresh Godot ResourceUID.create_id / 텍스처import·검사재실행0 |
| `native_world_phase.gd` | `uid://cgd5vhbeb1mxw` | first new script class-scan metadata / 텍스처import·검사재실행0 |
| `native_projectile_birth_phase.gd` | `uid://b6x2penxygg8` | first new script class-scan metadata / 텍스처import·검사재실행0 |

## type7 조립 실제 API / source projection

| 항목 | 실제 소비 |
|---|---|
| module / API | `native_type7_runtime.gd` / configure(world,target,{projectile_emitter,summon_context,type3_interfaces})→prepare_actor(record)/install_actor(record)/dispose_prepared_actor(actor)/get_snapshot/get_last_error; static project_actor_payload(record). 자체clock/자동Main등록0. |
| source ctor | exact ch1_initial_004/order3/etype7/P0/elite1/M30. 원HP4377·shield/max1751·poise/max1751·좌표4075,340 보존. clone actor payload에 facing/eShield/eShieldMax/eRes/native_flags·원bodyrect/direction·ai_profile=`native_type7_owner_dispatch_v1`만추가, 원supportfalse/runtimeNULL/337필드그대로. 없는nativeflag는키생략한다. |
| body projection | original animation.column6/row0·cell256²·atlas8×5·height159.1433434296772·pivot.5,.5·walk4/128px를유지. base[1536,0,256,256], walkx[6144,6400,6656,6912]/y0/256². base/walk8은방향String→resourceDictionary이며int index/가짜fallback0. 방향east→south-east→south→south-west→west→north-west→north→north-east. |
| single renderer | M30 원Node에는추가_process0, type7actor가1회render_native. type3M30는별도worldsiblingdriver인기존binding계약을유지. Root common_warning 실제provider는charge leaf→World.to_local x/y/EL0·game_frame=int(actualWorldframe)/langko로1회projection; shot_warnings=[]로TP자기queue와중복0. |
| prepare/install/cleanup | prepare는actualActor/TP/M30/commoncue unparented로구성·sourceM29cap4/context/실6emitter필수. install은helpersworldchild→World exactinitialregistration, 실패시자기ownedhelper+미설치actor만정리. dynamicchild는sourceRecipe→실type3binding→actualregistry→proposedxy spawnFX 원순서. 자연source randomwave는아직미검수. |
| first errors | sourceparse 첫exit0이나ERROR2(nonstatic script reflection)라PASS로세지않고한leaf수리후sourceparsePASS .256083042초. runtime first2case1PASS/1FAIL .2.7674645초→failed1only .1.772014583초1FAIL/SCRIPT1→failed1only .1.948709167초PASS. 최초실패/SCRIPT/Camera2D metadatawarning을원자료로보존한다. |
| visual | actualsource body textures/rect/자동owner1회·정지/registry는기술관측. publicQ/E·자연소환/교전·pixels/crop/발접지·24unique frames/24FPS/240는미검수이며 **RETOUCH**. |

- 신규 actual engine UID `godot/scripts/native_type7_runtime.gd.uid`: `uid://bifd0ko2lj76d` (메타생성만, source textureimport/검사재실행0).

- 신규 actual engine UID `godot/port_modules/common_charge_warning/producer.gd.uid`: `uid://kbeyb4avxxkb` (메타생성만, source textureimport/검사재실행0).


## 2026-10-17 현재 방어구 속성 배율의 실제 entry 소비 연결

| id / 항목 | 현행 계약 |
|---|---|
| 1 / 기능 / 제품 | NATIVE-ARMOR-ELEMENT-CONSUMER-20261017. 제품 변경은 main.gd와 player.gd 두 파일만. 상성 producer·탄·HP/패링/poise 구현은 변경하지 않는다. |
| 2 / 정상 연결 | Main._ready의 world.set_player 뒤에 Player.bind_native_armor_inventory(Callable(source_state, read_current_inventory))를 연결한다. 실패하면 기존 _stop_source_player_startup 경로로 중단한다. source State/INV를 새로 만들거나 복원하지 않는다. |
| 3 / Player 소유 | NativeArmorElementScript는 기존 item_armor_element/producer.gd. _native_armor_element는 Player가 소유하는 RefCounted이며 bind_native_armor_inventory(reader: Callable)->bool은 유효한 무인수 reader를 한 번 바인딩한다. 무효·중복 바인딩은 false이며 기존 바인딩을 변경하지 않는다. |
| 4 / 기존 피격 소비 | get_native_element_multiplier(attacker_element_id:int)->float가 현재 provider를 위임한다. 기존 enemy_projectile_fire.gd의 실제 contact는 이 getter→int(damage×multiplier)→기존 receive_damage 요청을 그대로 사용한다. 새 피해·resource sink나 패링/탄 수명 정책은 추가하지 않는다. |
| 5 / 현재 장비 / identity | 매 조회마다 실제 SourceState.read_current_inventory의 현재 equipped.armor와 el을 읽는다. armor/INV/equipped를 복제·캐시하거나 id로 재검색하지 않는다. 같은 id의 객체 교체·동일 객체 el 변경·inventory/equipped 교체가 다음 조회에 반영된다. |
| 6 / 없음 / null / falsy | unbound·무효/소멸 reader·비Dictionary INV/equipped·누락/null/빈 armor·누락/null/문자열/bool el은 기존 producer의 neutral1 의미를 유지한다. 누락 el을 물리0으로 만들지 않는다. |
| 7 / 원 상수 | EL P=0/F=1/I=2/D=3/L=4/H=5/E=6. F→I, I→F, D→L, L→D, D→H, H→D, E→L, L→E는2. 동일 속성은 P0 제외0.5, 나머지는1. 기존 원 elMul/producer 분기·수치 변경0. |
| 8 / 새 검수 | Godot4.7.2 headless의 자기격리5군/13접촉 첫 실행 통과. 실제 새 Main 바인딩3줄과 Player 변경 메서드, 변경 없는 기존 fire projectile의 contact를 소비했다. owned base37의 요청은 현재 fire armor18/ice armor74/neutral37로 관측했다. 이는 실 Player HP 손실값·실물 장착·자연 탄 생성 증거가 아니다. |
| 9 / 검수 분리 | Main 전체 startup/GPU와 Player 원화 preload를 실행하지 않았다. 격리 장면은 새 Main fragment/Player 메서드를 그대로 추출하고 기존 projectile 전체 script를 복사하되 visual lifecycle만 fixture에서 비활성화·owned contact 상태를 시드한다. 실제 Main/Player 전체 실행·configure/import/spawn·PNG/샘플·실 save/API/사용자창/PC 검증0. 옛75검사 재실행0. |
| 10 / 현재 완료 범위 | 실제 제품 entry의 SourceState→Player→기존 projectile 배율 consumer 연결까지. full inventory/equip UI·affix·저장/장비복원·보상·전체 bootstrap·모든 탄/보스·시각/청감·240FPS·최신 전체게임 완료는 아니다. 기존 HOLD/2_3·MAP/ART/STORY/rig/native3387/NativeHUD 등 보호 불변. |

## 2026-10-21 type7-fix 회귀 집계 정정

현재 factory 기본 지원은9/미7(기존6 + etype20 order4·10·12), 별도 type7 order3 명시 설치 fixture는10/미6이다. 과거6/10·7/9 기술 이력과 동결 source support/runtime는 유지한다. 테스트 기대값2곳을 현재 exact-source admission에 맞추고 지원 order집합을 추가 검증한다. 제품 변경0. [판정·검증](orders/reports/type7-fix_REPORT.md).
