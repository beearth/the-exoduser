# Godot type3 actual native binding — 2026-10-13

기존 `ExoduserType3SummonedActor`의 실제 AI·피해·charged-packet 생성기를 상속하여 월드 owner phase, M29/M30, 실제 provider와 연결하는 제작 단위다. 기존 actor나 완료 모듈의 타이머를 observer로 교정하지 않는다. 원 type7 전체 admission과 배송 Web/Windows 변경은 별도이며 현재 source6/미10·동결 배송5/미11을 유지한다.

| 항목 | 현재 상태 / 소유 |
|---|---|
| parent / 새파일 권위 | b921fc4017703d8b37cc2a9de8fdb5781992165e. E/type3-binding/parent-before-write-absence.json이 새 gd/uid/test/SSOT의 HEAD+WORK 부재 권위. worker before-write-owned-absence.json 별도 |
| 실제 production | `godot/scripts/type3_native_binding.gd` 저장. root actor를 실제 상속·호출하며 root 공유파일/Clock/HP/AI/formula 수정0. M29/M30 기존 actual module 재사용 |
| 실제 script UID | parent isolatedengine ResourceUID.create_id 메타 생성본 `uid://rxns458x2sdi`, WORK type3_native_binding.gd.uid 저장완료. E/metadata-first/receipt.json이새7script메타권위. textureimport/test/Main/GUI0, worker재생성/재저장0 |
| worker 소유 | 신규 binding.gd(+parent import 생성 uid), test_type3_native_binding.gd, 이 SSOT, E/type3-binding/*만. Root 완료9파일/공유world/factory/player/emitter/FX/type7actor 변경·성공검사 재실행0 |
| 검사 / import | 부모freshstage 고유4PASS=첫strict/M30유효2+실패M29수리후1+신규cleanup첫1. 최초.359575833초/1assertFAIL+emptyindexSCRIPTERROR1→M29 only후속.264461167초/exit0/assert0/ERROR0→cleanup only첫.371643625초/exit0/assert0/ERROR0. 성공2/이전3재실행0. worker실행/import0·기존 body16/원PNG/원source16·완료자료재검·hash/copy0 |
| 실제 provider | emitter/world/sharedRNG는 parent 실제 공급. M29 QE/warning/impact/sound를 required actual callbacks로 받는다. 미준비를 false parry/emptyFX/동일AI alias로 위장하지 않음 |
| 지원 / 시각 | dynamic type3 소비 adapter이지 initial-source16/etype7 support 승격 아님. 공개play/pixels/glyph/audio/최저1080p240 미검수. §23 VISUAL VERDICT RETOUCH |

E는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/dependency-type7-integration-first`이다. retained map guide1047행과 §23 기술/시각 분리를 적용한다. source geometry·START/EXIT·배치·원 모델·24FPS/24장 원화 제작 변경0.

## 먼저 읽은 권위와 새 source 범위

첫 기준은 [type3 actor 정본](FDG_GODOT_TYPE3_ACTOR_FIRST_20261013.md), [M29 정본](FDG_GODOT_M29_FIRST_20261013.md)의 원 source/source-order API다. source-owner-phase-supplement.json12313B와 source-projectile-normalization-supplement.json23441B는 parent 새 first-missing-locals 자료이며 pending0이다. root의 완료9파일/옛 PNG/source16/기존 성공 proof를 재생하지 않는다. root actor는 `configure(recipe,target,world,interfaces)`·`advance_native(ticks)`·실 rawref `get_native_modifier_state()`와 기존 hook을 제공한다.

## 실제 wrapper API / 연결

| API / 필드 | 실제 소비 / 제약 |
|---|---|
| `configure(recipe:Dictionary,target:Node2D,world:Node2D,interfaces:Dictionary)->bool` | binding provider preflight→root 실제 recipe preflight→root 실제 configure→선택 M29/M30 연결. recipe 재생성/reroll0. root actor의 automatic_physics는 false로 고정하고 world가clock을소유 |
| `set_player(target:Node2D)->bool` / `_target()` | 실제 weakref target 공급. 동일target 재등록허용, configured 뒤다른target은명시 live_retarget_requires_new_binding 거부. root 파일의 `_interfaces`/AI clock에observer쓰기0 |
| `advance_native_phase(ticks:float,native_frame:float,world_identity:Variant)->void` | parent `register_native_phase_consumer(actor,actor.advance_native_phase)` owner_step3인자 연결. actual world.get_native_frame와get_native_world_identity를검증한뒤1회 `super.advance_native(ticks)` 호출. 동일frame/token 재호출과내용동일새identity/mismatchedframe 거부 |
| root `advance_native(ticks)` | 원1인자 시그니처/본문/local `_native_frame` 유지. 별도3arg 함수는override시그니처를억지변경하지않으며rootlocalclock을world값으로설정하지않음 |
| `get_native_global_frame()` | 수락된실worldphaseframe readonlycache. 첫ownerphase전−1이며이를0/currentframe으로승리보정하지않음. local_actor_native_frame과분리 |
| `is_native_registry_ready()->bool` | actual `_binding_configured && _runtime_binding_error.is_empty()` 반환. 미완binding/runtime dependency error는parent World가append/add_child전에거부하며`set_player(false)`도거부. rootactor본문변경0 |
| `dispose_unregistered_native_dependencies()->bool` | actor.parent!=null이면false/제품보존. parentnull일때자신의provisional M30만free/refclear·bindingreadyfalse 후true,missinghelper멱등. 다른worldchildren/설치actor/기존rawclock변경0. registry거절뒤caller가actor.free전에실cleanup호출 |
| `facing` / `native_flags` | 실제raw facing getter. flags는raw에실존하는ib/_ch1StartMedium/_iceOnHit/_lavaBurn만반환; absent를저장false로위조하지않음 |
| `get_snapshot()` | root snapshot/native deepclone 보존·stun_ticks=raw.stunned/frozen_ticks=raw._frozen/hit_stun_ticks=raw._hitStun의현재값flatten. native_frame=원local, global_native_frame=cache/local_actor_native_frame=원값; binding/error/acceptedphase/drivercounts와capabilityreceipt 추가 |
| 월드 소유 경계 | root world 실제clock priority−1/lateowner+queue priority1·dynamic registry/emitter는parent소유. binding은registry목록/worldclock/source초기report를수정하지않음. 별도worldphase검사는부모요청새fixture소유로분리 |

| interfaces key / header | 요구 / 실제 delegation |
|---|---|
| native_random()->float | 실제 shared world RNG provider 필수. root recover/random과M29 cosmetic draws에같은callable 공급; binder 재seed/reroll0 |
| emit_charged_projectile(actor,raw_packet)->bool | root actual charged-packet producer에그대로공급. 원6속성 spawnProj 입력을parent actual world.emit_native_element_projectile로보냄; packet/data수정·P/I/L alias0 |
| player_context(target)->Dictionary | M29는actualparry_window bool과x/y/r/hp/iframes/state가필수. actor source context adapter hook에연결. missingQE를parry_window=false로대체하는productionfallback0 |
| element_multiplier(el:int)->float | actual Player armor-element 배율 provider. M29 kernel amount계산전에적용 |
| is_tile_wall(point:Vector2)->bool | 실제 tile wall probe provider. `can_move`(bodycollision/props까지)와구분하며모든장애물을isW로alias하지않음 |
| handle_m29_parry(actor,target,event)->bool | actual Q/E producer에bank/doParry/projectile=false/el/poise20을전체위임. root `receive_poise_damage` pendingqueue를즉시source `_poiseHit`의완성으로위조하지않음 |
| emit_m29_event(actor,event)->bool | 원 windup/charge/recover/spark/trail/player_damage/parry event를actual warning/impact/sound provider에위임. rejected provider는runtime_binding_error로기록,빈FX를PASS로처리하지않음 |
| m29_readiness()->Dictionary | combat_qe/warning_fx/impact_fx/detonate_sound 각각bool true필수. configure와ownerphase전확인;하나라도미준비면binding/phase거부. 준비값은actualparentprovider권위이며constructor recorder의test문맥과구분 |
| SOUND actual parent API | `res://port_modules/sound_m29/caller.gd` Node를add_child후 `on_detonate()->handle`, `cancel_event(handle)` 사용. 기존sound15조건PASS는부모동결자료이며이번재실행0; 실제provider결선·공개청취는별도 |
| PC 제공자(2026-10-21 PC-M29-PARRY) | `player_context`/`handle_m29_parry`/`emit_m29_event`/`m29_readiness` 실제 제공자 = `main.get_native_m29_services()`(native_m29_contact_services.gd). handle은 parryBank→doParry 기존 writer(보상·iframes25·poise+1)→actor `apply_native_source_poise_core(20)` 순서, projectile=false만 수용. FX 3능력은 실제 소비자 등록 전 false. 상세 [PC_M29_PARRY_CONTRACT_20261021.md](PC_M29_PARRY_CONTRACT_20261021.md) |

## modifier source order / exact damage dtype

| 단계 / 상수 | 실제 소비 / 수치 |
|---|---|
| root guards | root `_hitStun`·stunned·frozen guard와기존KB/poise/AI/tiering책임을유지. blocker뒤hook을observer로호출하거나guard를없애지않음 |
| M29 pre-AI | root `modifier_pre_ai(self,ticks,distance,ctx)`에서실raw.modT를받아 `M29.tick_attack_lock(raw.modT,ticks)` 딱1회→actual`trigger(raw,ticks,distance,ctx)`. M30동시decrement0 |
| M29 state step | root st2감소뒤 `modifier_state_step`→actual`step_charge(raw,ticks,ctx,false)`. trigger같은phase windup60→root59; kernel이두번줄여58로만들지않음 |
| M29 source numbers | accumulate540, strict140<d<520, busy78, windup60/aimlock.755, charge18/speed32/len640+r/probe12, hitpad18, recover30. 이번새검사는기존상수suite 재연아닌actualowner hook순서/단일lock/emitdelegation |
| M29 모든원소 body dtype | **항상phys**. parent 좁은canonical근거 R41137 `hurtP(trunc(e.atk*30*elMul(e.el,ar().el)))`는opts없음; R44025 dtype=(opts&&opts.dtype) 또는phys. element배율선적용과phys/magic 방어선택은별개. el0phys/다른원소magic 초안은최초runtime전수리 |
| M29 damage actual order | kernel amount=trunc(atk×30×element_multiplier)→실target.receive_damage(amount,'phys')2인자/defaultKB유지→원단일M29/M30 eModHitP효과없음→event.knockback(Vector2,크기100) posthurt additive. HP내부거절과별개 sourceKB·FX/sound순서보존. 4thstrength100교체0 |
| M29 parry / sound / FX | event의bank=`atk`의truthy기본10/doParry el/poise20·impactboom r80/requestframes48/fire_medium·bigimpactfire/shake10/detonate를actual provider로전달. provider구현/glyph/감각품질을일반event계수로완료판정0 |
| M30 선택 branch | actual `ExoduserM30Modifier.configure(self,target,world,raw.modT,fixedm30profile)` 및rootpreAI에서`advance_native(ticks,distance)`. M29lock함수추가호출0. sourceaccumulate480/eligible d<800/busy54/warn54생성끝53/r125/damageflooratk×.65 magic·단독원API보존 |
| M30 render / 생존 | BoundM30은기존module를상속하여render_native(Time.get_ticks_msec())만normal_process로공급. ownnativephysics0. world sibling이므로bornlava가owner삭제와동시소거되지않음. 원lava9/time5/ordinaryrender단일증가·원texture/UV는완료module재사용하며새test에서전체kernel재검0 |
| 기존 Root damage/skin/packet | root recipe원HP반감/shield0/prehalfpoise·기존원필드·실body16Resource·walk/direction/60charge/6속성raw입력 보존. frozen초기16/full337은별도원소스이며재추출/교정0. 이wrapper는ROOT코드/원PNG/원source16를수정하지않음 |

## 제작 / 고유4 검증 / 미완 경계

| bounded 새 고유 검사 | 실제 필요 계약 / 아직검증아님 |
|---|---|
| type3_binding_strict_providers_and_world_phase | actualrootactor 앞준비거부(4requiredcapabilities)→세계children/raw/패킷0·set_player·ownAIphysicsfalse·actualconstructorworldglobal101과rootlocal1 분리·중복frame/가짜frame/동일내용새identity거부·guard/facing snapshotdetach |
| type3_binding_m29_actual_owner_hook_order | source builder실M29recipe→좁은corridor constructorworld의원actualroot540phase+kerneltrigger·windup59/busy78→다음phase58/busy77·driver한번·actualrootchargedpacket callback. Constructor floor는idle작은변위차단/charge endpoint x32이상허용,수리후target150인실FSM604phase의icebody hit→1200dtypephys/ordinarydamage뒤독립KB100 callback순서관측. liveactorstate/HP/position강제0·요청fixture는actualQ/E/FX/audio/최종6탄증거아님 |
| type3_binding_m30_actual_single_driver_and_raw_flags | actualM30module fixedprofile/originalResource소비·원actualowner480phase→busy54/noM29decrement·원rawflags/getter·worldsibling/local480 vsworld580. SourceRenderer/pixel/wholeM30suite는재연0 |
| type3_binding_unregistered_dependency_cleanup | actualM30 provisionalworldsibling→unregisteredcleanup에서target/다른worldchildren유지·readyfalse·두번째멱등,installedactorfalse보호·ordinarynohelper정리. 이전3성공재실행없이신규4번째만첫PASS/.371643625초/explicitphase0 |
| 실행 권위 | 부모 attempt-01-receipt.json/attempt-02-M29-only-receipt.json/attempt-03-cleanup-first-receipt.json이chronology권위. 최초strict/M30유효2동결;M29첫1assert/SCRIPT1 유효PASS불채택→실패1만source유효ctor150/emptyguard수리후604ownerphasePASS,icebody1200 phys→postKB100순서관측→새cleanupfirstPASS. actualpublicQ/E/FX/audio는constructorrequest라false. worker실행/import0/기존Source성공재실행0 |
| constructor fixture | 생성기생산API로legalrngsequence를공급한새constructor recipe; liveactorHP/position/state/timer/clocksetter0. 요청provider는원API위임받음을기록할뿐publicpipeline완성을주장하지않음 |
| 새 product pretest 이력 | source dtype초안 el별phys/magic→canonical모든phys1줄정렬, WORKbackup/diff/receipt 외부보존. 실제source/modifier값조정0·old M2914/Root actor6등성공suite재실행0 |
| 新cleanup 생산 이력 | 부모실조립에서provisionalM30worldsibling이registry거절뒤남는경계를확인→disposeleaf와신규4번째검사만추가. 앞3성공은동결/재연0,root/sharedcode수정0. 실패fixture수리의백업writer1회Path결합오류는게임runtime오류가아니며정확inverse/forward검증본·원raw권위보존 |
| 실제 계수 | 최초3 rawexplicitphase1025(중단M29포함)+M29후속604+cleanup0=누적1629. automaticphysics/render0/publicplay0. 누적은실패시도도포함하며고유4나실제공개플레이시간으로환산하지않음 |
| 별도 actual World 고유2 | parent실World/map/encounters+실combat Player/publicregistry/phase fixtures의신규2첫PASS. 1.60747825초/exit0/assert0/ERROR0, actualnative16frames/ownerdispatch32/particlepre16/queue16/birth16/postFX16·4pausedphysics신호에서실frame/consumer불변. dynamic등록원자거부/ens참조identity/초기report보존. E/world-phase-tests/attempt-01-receipt.json의원trace가권위,Source6/배송5불변·actual6탄/공개play증거아님 |
| 남은 actual결선 | QE readiness 및bank/doParry/poise sink, M29 warning/impact/sound实际provider、parentemitter6속성、actualworldphase/dynamicregistry、type7 completeadmission 전체firstreview는parent단위. wrapper작성만으로7지원승격0 |

완료root9파일과기존 source/배송 증거는동결한다. 코드변경뒤whole docs rg/literalgrep 및ownedSSOT변경만worker가담당하고공통현재문서·정상code+docscheckpoint는parent소유다. 기타WIP/보호2_3/marketing/기존저장API·실제paused앱/Web34/서버3333/3334는수정·조작0.

## MAP PRODUCTION REPORT (§23)

| 항목 | 현재 결과 |
|---|---|
| MASTER/LARGE/MEDIUM/GROUND | retained guide1047/원맵geometry·collision·outer mass·배치·START6시/EXIT12시 변경0 |
| PLAYABLE/LANDMARK | actualtype3binding 코드저장;parent실provider+type7등록·공개교전은미완,source6/10/frozen5/11 유지 |
| CAMERA QA | bodycrop/frame/가림/전조·원TP/맵route/publicpixels 미검수 |
| TECH QA | 고유4PASS=최초2+failedM29후속1+cleanup新first1,최초FAIL/SCRIPT이력보존. actualwrapper 생산·callback/CLOCK source계약과기술testfixture·공개증거분리 |
| FILES/GIT | worker소유newbinding+uid/test/SSOT/E/type3-binding only. root완료/공유파일과다른worker 변경되돌림0. workerGit0, parent code+docscheckpoint완료SHA추정0 |
| VISUAL VERDICT | **RETOUCH** — actualprovider/전체AI/소환·원render/audio/공개input·GPU/최저1080p240미검증 |
| NEXT PASS | actualQE/FX/sound/emitterprovider인수→parentfreshstage첫meaningfulsubset→실패만수리. type7전체등록은모든필수caller準備후별도 |
