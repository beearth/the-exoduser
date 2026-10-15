## native 원근 지면 coverage 수리 — 2026-10-15

현재 NativePerspectiveView는 원R36376~36379의 map-bound 의도를 실제8000×8000 source 두 floor pass와 원근4corner footprint에 적용하여 E전진 남쪽 끝의 하단 void를 막는다. camera angle/distance/zoom·기존INHERIT보간/Player·맵좌표/geometry/navLOCK/지면extent·UV·원PNG 변경0. 기존 ray API cached transform으로 첫coverage2FAIL→OFF진단2PASS→최종실Projection+global_transform/INHERIT3PASS로 구분, 총새GPU/Main3/각error0·Camera2DWarning1, 옛E18/Q/공간/PNG·asset/import/hash재연0. 이식 전체/전camera품질은 여전히RETOUCH/latestfullfalse. [정확알고리즘·실제값·실패/진단·최종영향검수·MAP REPORT](../docs/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#perspective-ground-coverage-20261015)를 따른다. 기존후보/GUI/ship은 보존하며 이 checkpoint를 과거 launcher와 혼동하지 않는다.

## E 제어·실제 타격 부분 연결 — 2026-10-15

현재 native Main은 공개 E→sDraw(10tick 게이트/.5이동)→tap 또는 kiGather(2배속/.18이동)→sBash20→sRecover ToInt32(28/(1+현재pParry×.1))→정상종료를 실제 P/ST/World/명시profile과 연결했다. 비용은5+((maliceSwipe||1)−1)×2를 tap release 또는 charge 진입1회, charged release 재차감0. Silver 차징만 원150+175×(mult−1) 전진과 진입8iframe, 원Normal E 공간hit/HP·KB8/stun60을 소비한다. 첫actualMain/GPU1/20.469초/새18PASS/제품ERROR0·Camera보간경고2, 옛Q/공간/독립군 재연0. 기본shieldFuse의 별도파동·40보호·쿨다운, E투사체패링·고유모션/연출 등은 미채택이므로 E_CONTROL_PARTIAL/fullEfalse/latestfullfalse/RETOUCH. [정확API·필드·수치·자연타격·새후보·MAP REPORT](../docs/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#e-control-partial-20261015)를 따른다. 아래 과거 E 전체 미연결 표기는 이 부분 범위에서만 현행 계약으로 대체한다.

## Q 다크볼 실제 성공 반사 — 2026-10-15

현재 START의 실제 gbBean만 공개Q→같은 탄 반사→기존 blue 원 clock·자연 AoE/정상 적 피해에 연결했다. live 원 pParryProjDmg base×2 ToInt32/life200, actual HP·ST·MP 성공보상/iframe25/poise+1, 실제 World128px source-order query를 소비한다. 실제 blackBean과 구분하며 black 자연 caller/E/full doParry 보상·audio/FX/core absorb 등은 미완이다. Q_CONTROL_PARTIAL/latestfullfalse/RETOUCH를 유지한다. [정확한 API·원 수치·실패1과 영향검수1·새 후보·MAP REPORT](../docs/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#q-dark-reflection-20261015)를 따른다. 아래 과거 “반사 전부 미연결” 표기는 다크볼 범위에서만 현행 계약으로 대체한다.

## 2026-10-15 현재 Q 제어와 버전 범위

현재 실제 Main은 Q_CONTROL_PARTIAL: 진입MP10, 홀드 MP=max(0,MP−최대MP×0.000833×sp), 이동0.35배, 반경100+400×clamp(hold/240,0,1), 해제창12tick을 실제 source MP/P와 연결했다. 원 초기창20/cooldown30×(1+shieldCdRed), 단일60Hz clock을 유지한다. fullQE·반사carrier·E·Space·기폭팔/평화방패·저장복원·24고유장24FPS·전체 최신 이식은 미완이다. 초기 미채택 반사창에 무료 무적을 만들지 않으며 창 이후 원 실패흡수식(min(0.25,block_base×0.5),×1.3)을 기존 실제 피해 경로에서 소비한다.

새 검토본은 native-review-q-control-20261015이며 기존 native-review-input-20261015는 보존한다. 자산·모듈 읽기 링크를 포함한 별도 snapshot이므로 최신 원본 전체/독립 배포본이 아니다. GUI 자동실행0. [정확한 API·수치·실패/영향 검수·새 후보·MAP REPORT](../docs/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#실제-q-홀드해제-제어와-검토본-범위--2026-10-15)를 따른다. 아래는 이전 checkpoint 이력이며 Q owner 미바인딩·공간 명중 미검증의 당시 표기는 현행 계약으로 대체한다.

> **2026-10-15 native 입력 교정:** 현재Main은원BINDS기본값을참고한명시native기본키이며원본저장BINDS/BINDS2복원은미구현이다. WASD와LMBpress/hold/release는실제consumer에연결했고Q무료취소·Space접근성토글을actualMain에서제거했다. Q실제owner미바인딩/E완료·Space분노slot미연결을HUD에명시한다. [현행계약·별도검토경로](../docs/engine/FDG_GODOT_NATIVE_FIRST_20261013.md#native-명시-기본-입력과-새-검토-실행본--2026-10-15).

| 현재 native 범위 | 계약 / 검수 |
|---|---|
| Main / Player / HUD | read_native_input_bindings0,handle_native_input_event1,get_native_input_snapshot0,clear_native_input_states0. 실제event→held→기존이동·공격/해제,HUDleaf안내. 원수치·QE반사·60Hz·collision/nav/LOCK불변. |
| 실행본 | 외부native-review-input-20261015/수정본_검토_실행.command,처음정지·캐릭터명시선택필수. 기존launcher·보호창·ship변경0,GUI자동실행0. |
| 새 검수 / 한계 | 입력14PASS/후보기동5PASS,초기fixture QEowner가정오류1이력유지. currentQ/E/Space·원설정복원미완,publicplay/공간명중NOT_PROVEN/latestfullfalse/전체RETOUCH. |

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

# EXODUSER · Godot 첫 이식본

<!-- fdg-godot-type7-teleport-20261013:begin -->
## Type7 텔레포트 의존성 실제 소비 · 2026-10-13

| 항목 | 현재 구현 / 경계 |
|---|---|
| 이번 실제 소비 | `native_type7_teleport.gd` / `type7_teleport.json`(`exoduser.godot.native-type7-teleport.v1`) / Player 공개 KB leaf8행 / 원TP4 / 신규 고유4기술PASS. standalone controller이며 실제 etype7 actor·factory 등록0. source 지원6/미10·동결 배송5/미11 유지. |
| 원 native 순서 | idle에서 teleportT111.58698863349855·summonT157.41148072760552 감소→기존 warning 진행/완료→else 거리<100 및 teleportT≤0에서 P+polar(U×2π,150+U×50) 제안→can_move(r22.73476334709674) 성공 warning120/생성update 감소0, 실패timer30→마지막 summon_due. cooldown175.49626126885414. eSummon/recover·source guard 중 warning 정지. |
| 초기 episode 경계 | 실제 메서드 진행으로112프레임 warning 진입·158에서 summon_due/warning74 관측. mandatory summon/channel/recover는 미이식이며 이 raw episode를 자연 TP 완료로 쓰지 않음. 별도 constructor completion context와 live field setter를 구분. |
| 착지 / KB | 완료 시can_move 재검사; 실패여부와 무관하게 caller cooldown reset/후속 eProjAt 예약. 성공 시 source 이동좌표에서 strict 거리<(r+10)×2+Pr, baseline r65.46952669419348+Pr15=80.46952669419348; !ib/iframe≤0/state≠literalcharge. 원 physical 요청trunc40×10.5×elementMultiplier, baseline420→기존receive_damage(420,"phys")→선택M30 onhit 효과없음→radial(target→P)×120을 기본KB에독립가산. 실측 HP350→236, 기본KB+(120,0). 피해수락bool gate·extra120으로기본KB교체0. |
| 현재 검사 / 시각 | 고유4PASS=첫3PASS+실패queue1후속PASS. 첫전체 exit1/2.338453417s/assert2→해당queue만 exit0/.664766792s/assert0. 코드수리0(검사중), 성공3/oldsuite/import 재실행0. public교전·actual pixels·최저1080p240 검수0, VISUAL VERDICT: RETOUCH. |
| 설정 / 필드 | configure(actor,target,world,state_ref,profile)->bool. 실제 shared state finite keys teleportT/teleportCd/summonT/_tpWarnT/_tpWarnMax/_tpWarnX/_tpWarnY 및 _tpWarnCol. actor radius/attack/facing/alive/state/native_flags/mods+stun/freeze snapshot, target radius/iframes/hp/state+damage/KB/burn, world.can_move/is_world_blocked. 필수원Texture5(TP4+기존physicalmouth) 선행검증. actor alive bool 및 actor/target state String/StringName guard11행은 첫runtime전수리; 실패 bind/state/children/HP 변형0. |
| idle / global queue | advance_idle(ticks:float,cached_distance:float,native_frame:float=-1,world_identity:Variant=null)->Dictionary 이후 advance_shot_warnings(ticks:float,native_frame:float,current_world_identity:Variant)->void. 실제 caller guard/tiering/globalframe/generation 연결은 미완. 실제global frame/identity 없는 fallback은 증명으로 쓰지 않음. |
| Player 공개 leaf | apply_native_posthurt_knockback(impulse:Vector2)->void는 _knockback+=impulse, get_native_knockback()->Vector2는 readonly. 기존receive_damage/physics/get_snapshot 본문변경0. HP0 내부거부와독립KB120 경계를소비하며 literalcharge 실제Player자연획득은미검수. |
| render / readonly | advance_render(render_ticks,now,source_slow_factor=1), get_snapshot/get_queue_warning_recipe/get_delivery_snapshots/get_effect_snapshots. Controller는 world sibling·physics0·render-only _process. explicitrender와automaticwrapper를같은phase에중복호출0. source fallback globalframe/generation 및 font actualpixel 품질은미증명. |
| 원 이미지4 | res://assets/vfx/teleport_out.png4018B/64², teleport_in.png3362B/64², tp_impact.png70004B/401²/2×2 cell200²/4frame(right·bottom1unused), teleport_burst.png31488B/576×64/9×1/cell64²/9frame. 첫 source4/dest4 hash·byte동일copy 합108872B; 원변형/새이미지0. |

전체 source 수식/API/검사 ledger는 [현재 TP 정본](../docs/engine/FDG_GODOT_TYPE7_TELEPORT_20261013.md)을 따른다. real parent `600e7269150a61b4b0f93e2f05ce64a8d9cec69c`, authority `9a4534b42f74093095ebc3364a25dd104e93b379`. 현재 표를 우선하고 이전 legacy/creation/배송 단위는 그 시점 역사로 보존한다.
<!-- fdg-godot-type7-teleport-20261013:end -->


<!-- fdg-godot-m30-epicenter-20261013:begin -->
## M30 standalone consumer 현재 인수 · 2026-10-13

| 항목 | 현재 구현 / 경계 |
|---|---|
| 실제 산출물 | `native_m30_modifier.gd` + `m30_burst.json`(`exoduser.godot.native-M30-burst.v1`) + 기존 원Texture2D 2개 + 신규 기술검사/정본. `ExoduserM30Modifier`는 호출자 전달 시계를 소비하는 standalone 커널이며 실제 admitted actor 연결0. |
| M30 현재 값 | 진원 충격파 / ATK40 / owner 유효·mods 비어 있지 않은 native 호출에서 `eliteBusy=max(0,eliteBusy−ticks)`; 그 뒤 M30∈mods·거리<800일 때만 `eliteRing+=ticks`. ≥480·자신의 busy≤0에서 busy54/ring0. 고정 target 좌표 burst r125/t=dur54는 생성 update에서 sp1 소비 후53. |
| 만료 피해 | zone t≤0 때 거리≤125(`P.r` 미추가)·iframe≤0·literal state≠`charge`이면 `max(1,trunc(40×.65))=26`, `magic`. 원소 상성 배율 미적용·별도 KB 요청0; 실제 `receive_damage(26,"magic")` 2인자로 기존 기본 KB를 보존. 이후 hit 여부와 별개로 원 lava 생성/zone 삭제. |
| 지원 집계 | 현행 source16의 **지원6/미이식10** 유지. 동결 Web/Windows 배송본은 **5/11**. etype7 자연 생성·소환·순간이동 등록0. 커널 하나를 지원 actor 추가로 집계하지 않음. |
| 검사 / 상태 | 새 **고유4 technical PASS** = 첫3PASS + 실패한 피해fixture만 1FAIL→1FAIL→1PASS. 성공3 재실행0·기존 suite 반복0. 현재 public 교전/pixel/최저1080p240 검수0, **VISUAL VERDICT: RETOUCH**. |
| public API / caller | `configure(actor:Node2D,target:Node2D,world:Node2D,modifier_state:Dictionary,profile:Dictionary)->bool`; 공개 mods/attack/alive·실제 modT eliteBusy/eliteRing·원Texture2D 2개 선행 검증. 실패 시 state/child/zone 변경0. 실제 owner의 guard/tiering 뒤 호출할 접점은 남아 있음. |
| native / warning | `advance_native(ticks:float,distance_to_player:float)->void`; native 자체 `_process`/`_physics_process` dispatch0. `render_native(now:float)->void`는 경고 pulse/spin 및 queue_redraw만 갱신. zone 시계를 렌더 now로 대신 진행시키지 않음. |
| readonly | `get_snapshot()->Dictionary`는 실제 modT/zones deep copy. `get_warning_recipe(index:int,now:float)->Dictionary`는 실제 zone의 q/head/pulse/spin/bitmap 및 tick metadata. 이 metadata는 픽셀 proof가 아님. |
| 원 lava | `res://assets/vfx/vfx_lava_erupt.png`: 2304²/3×3/cell768²/9frames/1707135B. `frameTime=5`, basealpha .85, size312.5, position `(zone.x,zone.y−78.125)`, scale312.5/768=.4069010416666667; alpha .85×(1−frame/9×.3)/additive. |
| 첫 자원 소비 | 원본2 첫 copy/hash와 목적지2 첫 hash: byte동일 합3163062B. 격리 최초 import exit0/6.978891833s/actual2(pentagram/lava), 기존 body/water/lightning reimport0; old converted cache10file/sidecar3 재사용은 input reuse. 재import0·원 PNG 수정/신규 이미지 생성0. |

정확 전체 수식·API·신규 실행 이력은 [M30 현재 정본](../docs/engine/FDG_GODOT_M30_EPICENTER_20261013.md)에 기록한다. source 권위 revision `9a4534b42f74093095ebc3364a25dd104e93b379`, real parent `927fa91ec77bb8c54698e270ce57b50aea11fb45`. 이전 구현/배송/creation 시점의 기록은 역사로 보존하며 현재 상태는 이 표를 우선한다.
<!-- fdg-godot-m30-epicenter-20261013:end -->


<!-- fdg-godot-etype7-physical-flesh-crawler-pending-20261013 begin -->

## 2026-10-13 · etype7 리치 / flesh_crawler 필수 의존성 명세 — 미등록

고정 원목록의 가장 앞선 etype7 `ch1_initial_004 / order3 / physical0 / flesh_crawler / elite1 / mods[M30] / aura null`을 조사했다. 현재 산출물은 **pending JSON과 정확 source·의존성 문서**다. 실제 actor·탄·factory 등록/연결은0이며 Godot 소스 지원6/미이식10을 유지한다. 목표 지원7/미이식9는 달성하지 않았다. [etype7 의존성 정본](../docs/engine/FDG_GODOT_ETYPE7_PHYSICAL_FLESH_CRAWLER_20261013.md)에 필수 소비자와 향후 검사를 기록한다. 앞선 소비자·배송본의 완료 이력과 자원·검사는 동결한다.

| id / 적용 위치 | 정확 source / 현행 제작 상태 |
|---|---|
| pending data / schema | `godot/data/etype7_physical_flesh_crawler.json` / `exoduser.godot.etype7-physical-flesh-crawler.pending.v1` / `runtime:null` / `admitted:false`. 45503B/SHA `c0c2e22b393e27557bc2aeb943827e0f4a6a79a2837f597a95027ddc885a0c60`. 명세만 저장; factory가 이 JSON을 읽는 런타임 연결0·새 admission gate 구현0 |
| 원 개체 / 방어값 | [4075,340]/ATK40/r22.73476334709674/speed.39137590795755384px/native tick. 원 factory HP1751→gate escort HP/mhp만 trunc×2.5=4377. shield/max1751·poise/max1751 유지; regen200/.15→262. 원16·native_final337·source supportfalse/runtimeNULL·seed/배치/수치 불변 |
| source 조사 / 소비 준비 | 새 packet39838B/SHA `8916293092d23d418c58e79cbbb6742370d3cb5ccae805b2313548da490ac8b4`. `pending_source_values=[]`; 미확정 원수치0. readiness7행의 소비자는 모두false. 동적 자식의 실제 RNG/flags/skin/좌표는 실행 미생성이고 source 숫자 부족과 별개 |
| 실제 이동 / contact | range800·LOS800. ranged stage d>680 flow×1 / d<520&&d>30 retreat×.5(point isW)→d 재계산→idle d<80 retreat×.6 / d>200 advance×1.2(canMv radius). type4 idle×1.6 alias0. `natural_contact_damage=null`; 자동 melee/windup·attack ticket 추가0 |
| 자연 순간이동 | idle-only teleportT111.58698863349855/cd175.49626126885414. d<100/timer≤0에서 P 주변150..200px의 유효목표를 고정하고 warning120. entry 실패timer30. 완료 canMv 재검·착지와 뒤 경고탄 caller를 소비해야 함. 폐기된 경고 원 오버레이 재도입0 |
| 착지 / 독립 KB | canonical R의 실제 배율10.5·baseline phys420·반경(r+10)×2=65.46952669419348(+P.r15→80.46952669419348). outer iframes/charge·반경 gate 뒤 hurtP/eModHitP 후 별도 radial KB120는 hurtP 내부 거절과 독립. 필요한 public posthurt KB sink 미지원. 아래 legacy 문서의×21/즉시탄 문구와 이번 canonical 계약을 구분 |
| 두 물리탄 경로 | 일반 charge: initial292.3163157328963/cd192/charge60/raw·contact32/life240/redBean physical/dtype parry. 착지 eProjAt: EL.P beanRoll1.2→contact48/life300/size4. `_emitEnemyShot` 경고60(생성 동일update 끝59) 뒤 고정aim·owner변위 반영 release. 즉시탄/일반32 alias0; born 뒤 독립탄 유지 요구 |
| M30 진원 충격파 | d<800에서480tick 조건·owner-local eliteBusy54→당시 P위치 고정 burst r125/t54·magic max1,trunc40×.65=26. 생성 sameupdate zone 감소로 sp1시 끝53. outer iframes/charge guard와 hurtP 내부 거절 순서·전조 procedural+원 pentagram·실 lava 소비가 필수; mod삭제/전역 공격ticket 대체0 |
| M30 실제 lava | `lava_erupt`는9frames/frameTime5/render-step nominal45·baseAlpha.85, 크기312.5/위치[z.x,z.y−78.125]/scale.4069010416666667. warning54와 별도 수명. boss_lava_erupt24 alias0. 실제 consumer 미구현 |
| 자연 소환 / 필수 gap | summonT157.41148072760552/cd250.14942525886·idle-only. 주변200px entries<4→eSummon40, ≥4→timer60. 종료 child1~2·r30..50·`mkEn(...,stage,3,false,random P/F/I/D/L/H,room)`→childHP/mhp만 trunc×.5·shield/max0·poise 원값 유지→parent recover50. type3 동적 factory/AI·6속성·원좌표 기반skin·elite0/1(마법3%)/M29또는M30 재추첨·status 지원이 필수 미이식 |
| 필요한 원자원 | teleport_out/in, tp_impact, teleport_burst, vfx_pentagram_red, vfx_lava_erupt PNG6 모두 canonical R 실존·현재Godot부재. stat/IHDR metadata 합3271934B만 기록; bytescopy/hash/import0. 기존 body17·물/번개·입탄 자원 재검수0 |
| 지원 / 품질 경계 | JSON admission_policy의 REJECT는 향후 원자등록 요구 명세다. source type7은 기존 factory 미지원 그대로이며 소비자 구현 완료로 표시하지 않는다. Web/Windows frozen5/11·보호 paused 앱·브라우저·서버·원게임/save/API 조작0. 원 native60/Compatibility/cap240 불변 |
| 이번 검증 / 잔여 | 새 meaningful test0/PASS0·headless/main/GUI실행0·원자원 수출0. 새 JSON 구조 읽기는 실제 actor/전투 인수 아님. 향후 생성/텔레포트/M30/소환·caller 검사는 소비자 준비 뒤 TODO. 24원화/24FPS·새 공개pixel/최저1080p240 검증0. JSON 자체scope NOT_REVIEWED, 단위 **VISUAL VERDICT: RETOUCH** |

| 이 문서의 적용 위치 | 정확 pending / 지원 경계 |
|---|---|
| 실행 범위 | 이번 pending JSON은 실제 플레이 적을 추가하지 않는다. 기존6/10 소스·배송본5/11 유지. 새 actor/test leaf는 생성하지 않았고 이전 실행 화면을 재로드하지 않았다. |

<!-- fdg-godot-etype7-physical-flesh-crawler-pending-20261013 end -->


<!-- fdg-godot-etype1-lightning-hive-bloater-20261013 begin -->

## 2026-10-13 · Godot etype1 번개 벌집 팽창체 소비

현행 Godot 소스는 고정 원기록 `ch1_initial_016 / order15 / etype1 / lightning4 / hive_bloater` 하나를 전용 consumer로 추가했다. 논리 type명은 가시 사도, 실제 스킨은 벌집 팽창체다. 원 `native etype 1` 이름과 source snapshot을 유지하며 `bone_archer`/`etype1_archer` alias로 교체하지 않는다. 상세 source·API·수치·검사 정본은 [번개 벌집 팽창체](../docs/engine/FDG_GODOT_ETYPE1_LIGHTNING_HIVE_BLOATER_20261013.md)이다. 아래 앞선 Windows/Web의 지원5/미이식11은 동결된 배송본의 상태이며 현재 소스 지원6/미이식10과 구분한다.

| id / 적용 위치 | 현행 값 / 인수 범위 |
|---|---|
| factory 등록 | `native_ch1_etype1_lightning_hive_bloater_v1` / `exoduser.godot.etype1-lightning-hive-bloater.v1`. 정확 order15·type1·lightning4·hive_bloater·elite0/mods[]/aura null만 허용. 실제 factory/world6지원·10미이식 기술 PASS; 원16의 support=false/runtime=null 불변 |
| 원 개체 / 피해 | spawn [4125.581107525944,263.29083522849453], HP875/ATK31/r20.63275862764567/speed.37612932557612655px/native tick. eShield=max875/eRes7개0/poise=max875. `natural_contact_damage=null`, type1 undead=false. 일반 contact metadata가 있어도 자연 근접 피해 경로를 추가하지 않음 |
| AI / 시계 | native60Hz·LOS800·range600. 전역 거리390..510 stage(전진×1/후퇴×.5)→거리 재계산→type1 idle stage(<80후퇴×.6/>200전진×1.2). projT233.01430687308311→eligible local tick234 차징 시작→60active ticks 후 발사. 발사에 자동 attack8/recover35 부여0 |
| 번개탄 / VFX | normal/lightning4/magic, floor31×.8=24→spawn×2→contact48, r5.2/size3/life180−.667ticks/homing.00655rad·life>30. 원 comet8cells visible render마다+.12·alpha1/source-atop #ffee00×.65. 실제 contact 위치에서 독립 impact2layers·요청48→actual66ticks. owner 사망 후 독립 탄 유지 |
| player 상태 연결 | `native_idle_status_tick(ticks:float)` signal을 held autoattack 처리 뒤 실제 entered-idle 지점에서 emit. 자식 `NativeElectricCounter` 하나가 구독하며 자체 physics/sampler0. `apply_native_electric(duration_ticks:float)->bool`, `get_snapshot()`, shot `get_electric_snapshot()`. outer contact 뒤 내부 hurtP 거절과 독립 max30; idle만 감소·zero clamp0/negativecross 허용·nonidle/pause freeze |
| 상태 범위 | P._elecT30은 HP/slow/stun/poise 효과0, 기존 적 shock300/stack10/+5%와 별개. 원 modern sprite electric zigzag overlay 없음·새 draw0. raw/no-affix48·KB2 확인; fullmodifier의 final HP damage0에도 KB2를 주는 원 경계는 현재 Player bool API에서 미지원/미검증 |
| 검사 이력 | 새 고유4 유효 PASS. 최초 raw3PASS/1FAIL 중 유효2PASS·factory1FAIL·status runtime-invalid1(ERROR166)을 보존. 부모 validator의 null/13field 검증과 PAUSABLE fixture만 수리해 실패·무효2만 후속 PASS(exit0/.972840958초/assert0/ERROR0). 최초 성공2·기존 suite 재실행0; 공개 입력/픽셀/240 증거 아님 |
| 자원 / import | 필수 원 VFX3 첫 byte동일 copy 합577708B, source/destination 첫 hash3+3. isolated 최초 actual texture import5=새번개3+기존water2의 예상외 캐시 재생성; 원본 PNG 변경0/body17 reimport0/추가 import0. 원 source16 재추출·hash0, 기존 body17·water PNG 수동copy/hash0 |
| 배송 / 품질 / 잔여 | 이 단위 Web/Windows 재수출·서버·GUI 조작0, 보호된 paused 플레이 화면 그대로. native60/Compatibility/cap240 설정 유지, 실측240 미검증. 24원화/24FPS·fullQ/E/blackBean 반사·fullAI/nav/장비·전체FX 미완. **VISUAL VERDICT: RETOUCH** |

| 이 문서의 적용 위치 | 추가 소비 / 정확 경계 |
|---|---|
| 로컬 Godot 실행 | 현재 소스 실행에는 새6/10 consumer가 포함된다. 전달된 Web/Windows package는 재수출0으로 여전히5/11이다. 보호된 실행 앱은 새 소스로 자동 재로드하지 않았다. |

<!-- fdg-godot-etype1-lightning-hive-bloater-20261013 end -->


## 2026-10-13 · Godot Web 첫 실제 플레이 배송

현재 Web 배송·공개 입력 인수 정본은 [Web playable first](../docs/engine/FDG_GODOT_WEB_PLAYABLE_FIRST_20261013.md)이다. 같은 Godot 소스를 실제 브라우저로 수출하여 공개 시작·WASD 4방향·기검참 Space 충전/해제·원 적 자연 교전/상호 피해·Esc 일시정지를 확인했다. 아래 native/Windows 문단은 당시 플랫폼·checkpoint 이력이며 이번 Web 관측을 그 앱의 실행 결과로 소급하지 않는다.

| 현행 Web 항목 | 실제 범위 / 결과 |
|---|---|
| 실행 경로 | `http://127.0.0.1:3333/output/fdg-godot-web-native-first-20261013/index.html`; 기존3333 서버의 별도 output symlink. 서버/헤더/원본 game 변경0 |
| export / builder | `Web Native Preview Single Thread`, 공식4.7.2 stable·threads=false/extensions=false/PWA=false·COOP/COEP 필요false. `build_web_preview.py`는 외부 stage에서만 WebDelivery autoload=`res://scripts/web_delivery.gd`, custom shell을 적용. `build_windows_preview.py`의 새 `override_preset_option(preset,index,key,value)`는 Windows0/Web1 섹션만 변경하며 Windows preset 원1054B 유지 |
| public / readonly API | shell `#start`→Engine.startGame·`#focus/#fullscreen/#canvas`; `get_observation()->Dictionary`/0.1초 publish→`window.fdgNativeObserve(JSONstring)`·specific leaf DOM. JS caller copy는 Object.freeze 아님. actor/time/HP/input setters0·원 clock60Hz 유지 |
| 실제 Web / 저장 | tab34 별도 QA·Codex In-app Browser2·WebGL2/OpenGLES3 Compatibility·Emscripten4.0.20 single-thread. viewport1920×1080/관측화면1280×720. Webtrue, userdir `/userfs/EXODUSER-Godot-Native-First`; public pause report는 Web 가상user://, native/기존슬롯API 소비추가0. IDB persistence roundtrip·전체 network request audit 미검증 |
| 실제 입력 / 전투 | 원 초기16·지원5/미이식11 유지. 공개restart1회로2세션 검수. W/A/D/S 좌표변화·40/80/120틱 계층1/2/3·Space120틱 해제(피해3763/수명25/반경264) 확인. 접근성Space 토글이며 물리 LMB 지속hold는 미검증. eye01 자연aggro799.0037·magic80/phys23 피해와 검기470×2 명중/HP875→-65 dead. 최종playerHP270/ST180.9/좌표4013.79,7293.24·Escpaused |
| 새 검증 / 기술 한계 | getter 고유2: 첫1PASS/1FAIL(assert2)→float fixture만수리→실패1PASS; 성공반복0. preset helper 새3PASS·Windows CLI/export/기존suite 반복0. 첫export→선언31B 정렬 후 새export2완료·재import0. 브라우저 실제 입력은 별도 증거이며 export/headless를 실제play로 대체0 |
| 품질 / 성능 | **Web 첫 플레이 gate 완료 / VISUAL VERDICT: RETOUCH**. 최종8.20ms는 live metric 한 표본으로 FPS·percentile·240 달성 근거 아님. fullQ/E/parry·blackBean Q반사/24원화·24FPS/전체UI·AI·장비/최저240 미완·미검증. 맵/원좌표/seed/PNG/source16 변경·재hash0 |
| 안개 / 기존 화면 | 안개100%/20% 별도비교는 아직 미완. 기존 인간 Mac fullscreen paused앱·browser31·본편탭 무입력/무재개/무reload. Web 별도탭만 공개 실행·검수 |


## 2026-10-13 · Godot Windows x64 미리보기 패키지

현행 패키지의 자원·수출 정본은 [Windows native preview](../docs/engine/FDG_GODOT_WINDOWS_NATIVE_PREVIEW_20261013.md)이다. 현재 지원5/미이식11과 source 초기16·seed·배치·원수치를 유지한다. 아래 앞선 ice/외부 PNG·Windows 미전달 문단은 `3a30d539` 등 당시 checkpoint 이력이며, 이번 패키지는 그 후 필요한 물 자원과 한글 지원 데이터를 자체 포함한 기술 산출물이다. 실제 Windows 실행·시각 인수와 구분한다.

| 현행 범위 | 정확 소비 / 결과 |
|---|---|
| 원 물 PNG2 | `assets/vfx/water_blue_projectile_sheet.png` 501466B/SHA `81c7c640d429cb0ffda887cb4de0adf7e01f02435bcb369e517d2d94f81267af`, `Water_ImpactWater_Sheet.png` 186899B/SHA `6ce330a1a1a25f7ceb9bcf66987a547c92789ac085f860034dec17deea7710d9` → `godot/assets/vfx/`에 원본byte동일 2copy/합688365B, 새원본hash2. 기존body16/17·source16 hash/copy/reextract0, 이미지변형0 |
| 내부 texture 소비 | runtime animation/impact.texture 및 assets.resource=`res://assets/vfx/…`, external_original_file=false/packaged_original_copy=true, water dependency packaged=true/외부water의존0. 기존 `_original_texture(path:String)->Texture2D`는 static cache + ResourceLoader.exists/load(Texture2D)로 remap/압축 수출 대응. missing은 Sprite2D 할당 전 명시end, factory도 ResourceLoader.exists로 원자거절 |
| typed config / 역사 | ice config38013B/SHA `eeb448bc13e74784713497c5198c374911e56fbd6578e27ec03904214ec98435`. target/native_source_contract/native 수치·clock·crop·alpha1·impact/HP/slow/독립탄 불변. `source_config_creation_scope`·`original_source_dependency`는 최초 외부주소/원범위 보존. config scope/packaging의 export_completed=false는 자원 consumer 저장 당시 범위이며, 실제 최종수출 결과는 아래 artifact와 별도 receipt로 기록 |
| 수출 preset / build | `Windows Native Preview x64`, Windows Desktop/x86_64/all_resources/include_filter=*.json/exclude tests·tools·md·run.command, embed_pck=false/암호화false. `build_windows_preview.py --project --godot --template --output`는 외부 새출력만 허용하고 code/metadata stagecopy·assets/data symlink·원 PNG/source16 copyhash0. 기존cache240files/115796787B 보존, 실제 import는 새water2만; isolated editor/_sc_·전역설정0·main실행0 |
| 한글 support data | `project.godot`의 `internationalization/locale/include_text_server_data=true`와 builder 필수gate. 첫 PCK는 기본false/ICU누락이어서 완전 인수하지 않았고, 이1leaf만수리하여 import반복0으로 새PCK 수출. final `res://icudt_godot.dat` 4797472B/header144/DA27/CmnD. Windows release ICU stub의 별도데이터이며 한글 실제 glyph 관측과 구분 |
| 최종 EXE / PCK | EXE109268480B/SHA `d34d36f3be1a6c49c56525ae86469b92e4f417ddf0b43cf00dd80c385c4b0562`, 공식4.7.2.stable.official.ed1daf0bf release template와byte동일·PE AMD64/0x8664·PE32+/0x20b. final PCK121929956B/SHA `bd786be82167fd92ffdfc36e72fa2b79192c165eeaea354b1e56517eaf1ebf5d`, format4/engine4.7.2/288entries. first287대비 ICU1추가/project.binary1변경/제거0/기존286 저장size·MD5·flags metadata동일, payload PNG재hash0 |
| ZIP / 공개 실행 경로 | `EXODUSER-Godot-Preview-Windows-x64-20261013.zip`157457375B/SHA `321af5874f84805fef92b636920ef1989b35c2be7b5e3c757f281b1aa21ff6a7`, 6파일/풀면231301651B/ZIP CRC모두PASS. EXE+PCK+launch_windows.cmd+README-KO.txt+LICENSE-Godot.txt+COPYRIGHT-Godot.txt. 원 G:\\exoduser에덮어쓰기없이 새폴더에전부풀고 launcher 실행, fullscreen/Compatibility/max_fps240. 원게임save/API/node/server변경0 |
| 새 의미검사 | 실제firstPCK만 mount: water consumer/cache/missing처리/runtime pack dependency3 첫PASS/exit0/2.049584041초/assert0·미완0; loads130/active107/JSON9, expectedmissingstderr1/unexpected0. 추가ICU leaf firstFAIL2assert/exit1/.25572500000000004초→project export설정1leaf수리→그실패leaf만PASS/exit0/.25378241700000004초·assert0·stderr0. 새고유4 기술PASS, 최초성공3 반복0/기완료suite0/main/factory설치/물리/사용자report쓰기0 |
| 실제 실행 / 품질 경계 | Windows PE 실행·한글pixels·Windows입력/자연교전·최저1080p240FPS 미관측. 캡240은 실측240이 아니며 native60/physics interpolation/Compatibility/1920×1080 및 현재5/11 유지. 기존 인간 Mac fullscreen paused 앱/browser31/3333·3334질문승인대기 유지, 새소스 resident로드 소급0. fullQE/parry/blackBean Q반사·24원화/24FPS·전체FX/AI/장비 미완, 확정2_3 불변. **VISUAL VERDICT: RETOUCH** |

실제 Godot 노드·GDScript로 CH1-1 이동·충돌·기검참과 지원된 초기 육괴를 구동한다. 기존 브라우저 본편과 별도 실행하며 기존 세이브·API를 읽거나 쓰지 않는다.

## 2026-10-13 · order8 ice soul_flame 한 개체의 Godot 이식

이번 단위는 frozen 초기16 중 `ch1_initial_009`/order8/etype4/ice2/`soul_flame` 한 개체의 전용 몸체·물 탄두·최소 냉기 감속 소비다. 기존 지원4에 이 한 개체를 더하는 구현 범위는 **지원5 / 미지원11**이다. 아래 과거 지원4/12·3/13 및 검수 기록은 해당 checkpoint 당시 동결 이력이다. 현재 원값·API·새 검사 결과와 미이식 경계는 [이번 ice soul_flame 정본](../docs/engine/FDG_GODOT_ETYPE4_ICE_SOUL_FLAME_20261013.md)을 따른다.

| 이번 정확 소비 | 원 source / 현행 구현·한계 |
|---|---|
| identity / 원 snapshot | id `ch1_initial_009`, order8, etype4/EL.I2, skin `soul_flame`, elite0/mods[]/aura=null. 논리명 갑각 사도·스킨명 영혼 화염·record name `native etype 4`를 구분. 기존 `encounters.json`의 source support=false/runtime=null·full337 fields·seed/RNG/순서/원좌표는 보존하며 새 runtime53/native_final subset27/initial_timers197만 별도 config로 소비 |
| current typed config | `godot/data/etype4_ice_soul_flame.json`, schema `exoduser.godot.etype4-ice-soul-flame.v1`, profile `native_ch1_etype4_ice_soul_flame_v1`, current33672B/SHA `90f3ab523a7f9539437c2335c64db1eca6f93e3f87c060ba51df2ad48fc8706a`. 최초33508B 설정은 alpha source 명료화 전 이력이며 원 숫자/target/assets 변경0. config의 verification pending은 작성 당시 metadata로 보존하고 실제 결과와 구분 |
| 원 기본값 / 위치 | spawn4191.995760537684,340 / HP875 / ATK31 / r34.87446582969278 / speed.32862369619309906px/native60tick / idle44.74301584530622 / projT294.2270742729306 / facing3.801742677476639 / eShield·max875 / poise·max875. map/camera/RLE/nav/STARTEXIT 변경0 |
| 공통 AI / contact | idle/recover d<800+LOS alert, range400은 추적 cutoff가 아닌 AI 분류. alerted d>30 flow 양축→X→Y 및 idle 추가 speed×1.6. 접촉은 raw24/phys·r+Player.r+8/cooldown40~59. 원 `_iceOnHit=false`이므로 접촉 냉기를 추가하지 않음. source에 없는50~100 자동alert·tank 방어감산·attack ticket0 |
| ice charge / 피해 | 원 local295에60tick 차지→354 charge1→355 actor-center 발사. source water base`trunc(31×1.2)=37`→적 이동탄×2=74, EL.I/magic dtype·parry class, waterBean=true/redBean=false/blue=false/black=false/fromRainbow=false. 현재 raw Player/armor 상성1. full equipment·다른 탄/패링 변형은 미이식 |
| ice 탄의 clock / 접촉 | speed500~600px/sec는 birth1회 추첨, sz3.2/r5.2/contact margin13.6+Player.r, life120/decay.667, 감소/연장 뒤 life>30에서 homing.00655rad/tick. camera거리>2500 update-front 회수→life감소→near expiry life1연장→homing→move→wall/현재·이전 Player 점의 투사체 선분 거리 최소값으로 contact. 실제 받아들인 피해에는 heading KB2, burn 추가0 |
| 냉기 상태 leaf | `Player.apply_native_freeze_slow(duration_ticks:float)->bool`는 max(existing,duration), 실제 연장 여부 반환. water direct receive_damage 다음 impact·max60을 내부 HP 수락과 독립 소비. `get_native_freeze_slow_ticks()`/snapshot `freeze_slow_ticks`는 readonly. held·공격 시작 처리 뒤 movement 전 idle에서만 감소하고 양수면×.5:60부터59회 반속/60번째 원속도. attack/stagger/stun/recover·pause·dead에서는 timer freeze, 직접 피해·화상·기검참 본문 유지 |
| 몸체 / 원 atlas | `ExoduserIceSoulFlame` 별도 class, 원 body8방향 base768/0/256/256(col3,row0), walk3072/3328/3584/3840·4프레임/거리128마다frame, base+walk overlay·pivot128/128·nearest·높이244.12126080784947. 현재 idx3과 옛 카탈로그 순번37은 구분. 기존 다른몸 색/이름 alias·신규 모델/리깅/24장/24FPS0 |
| 물 탄두 / impact | `ExoduserIceProjectile.configure(origin,aim,profile,target,world,birth_frame=0)` / get_snapshot, priority1·world sibling으로 caster 사망과 독립. 기존 `water_blue_projectile_sheet.png`4×2/8frames·draw84×44.8/left−45.36/alpha1와 `Water_ImpactWater_Sheet.png`4×4/16frames/r72/66tick/max216를 그대로 사용. auxiliary shard10/shake6/flash.15는 source metadata이며 fullFX 미이식 |
| 자원 / camera dependency | body16 기존복사본+외부 기존물 PNG2. `res://../assets/vfx/…` globalize→Image.load_from_file→ImageTexture, 새 PNG copy/hash/process/import0. factory는 필요한 외부2 PNG 누락을 admission error로 거절. 실제 active viewport Camera2D center를 readonly로 사용, missing_native_camera는 명시 종료·Player 위치 대체0. 외부PNG standalone export/Windows 전달은 미완료 |
| factory / API | `ICE_SOUL_SCRIPT/CONFIG_FILE/PROFILE/CONFIG_SCHEMA`, `_ice_soul_config`, `_is_ice_soul_target`, `_validate_ice_soul_config`의 exact leaf. actor configure/set_player/receive_damage/queued receive_poise_damage/get_snapshot 및 native_type_traits/last_flow_direction/flow_stuck_ticks. source shield 먼저 흡수·overflow만 HP/hitstun8/KB=min(remaining×.25,15)×kbMult·명시 poise, undead antiRevive baseline0·full modifier/부활 미이식 |
| 새 검증 상태 | 신규4고유 case의 현재 기술PASS는 최초 유효 완료1 + 후속3이다. 최초4 실행의 raw marker는2PASS/2FAIL/assertions2·exit1·4.746394709초지만 RefCounted factory.free 오류로 admission1은 미완료, 실제 유효 완료는 ice_actor_packet1PASS이며 실패2는 fixture InputMap 미초기화였다. 명시 physics1450회/실제 자동 fixture13tick/headless action5edge를 별도 기록. harness 두 원인만 수리→미완료 admission1+실패2만3PASS/0assertFAIL/exit0·1.265548292초·명시421회/자동14tick/action5edge, 최초 유효 actor1 재실행0·제품수리0·강제actor필드0·실앱입력0·후속stderr error0. 실제world 지원5/미11, sourceprofile/셀·차지355·독립탄·shield/poise·물탄의현재/이전P선분·camera수명·posthit/59반속60원속·자동Player0→shot1 순서를 확인. 최종4개 동시 재실행0·생존actor stun/공개pixels/perf는 미검증. 상세 ledger/완료·미완료 marker구분은 이번 정본 참조 |
| 미이식 / 공개 품질 | 기존 성공4/4/3/3/5 재실행0·source16/PNG 재추출·재해시0. 전체 globalFlow/8방향escape/RNG parity·전체 원소/statusClean/affix·Q/E 패링·blackBean Q 성공blue반사·새 공개 입력/pixels/perf는 미인수. blackBean 기존 magic/Q전용/E불가·확정2_3 불변. 현재 인간 fullscreen paused Godot/기존 browser31/3333 유지, 새 코드 로드 소급0. **VISUAL VERDICT: RETOUCH**, Windows 최소사양1920×1080/240FPS 미검증 |


## 앞선 physical 척추 괴수 checkpoint 기록

현재 소스는 정본 초기 생성 경로의 원16개체 snapshot을 `data/encounters.json`에 그대로 보존한다. 기존 medium/dark 육괴2개체·order14 `ch1_initial_015` physical `flesh_crawler`에 order13 `ch1_initial_014` etype4/physical `spine_beast` 한 개체만 더해 지원4개체/미지원12개체를 생성한다. 새 exact profile은 `native_ch1_etype4_physical_spine_beast_v1`이며 `data/etype4_physical_spine_beast.json`의 typed 설정을 별도 소비한다. 원 record의 support=false/runtime=null·seed/RNG/배치와 full337 native fields는 동결하고 새 runtime은 원27개 subset을 보존한다. 원 etype4 명칭 갑각 사도·스킨 척추 괴수(spine_beast)·record name native etype 4는 구분하며 이름을 추정 변경하지 않는다. 이 개체의 원 위치3878.7467967160046/340·HP875/ATK31·r34.3551987009123·speed0.40462583759799603px/native60tick·eShield875·poise875를 보존한다. 실제 일반 소비는 contact raw24/cooldown40~59와 common60tick charge→physical raw24 탄이며 탱크 특수 공격/방어감산·attack-ticket를 새로 만들지 않는다. 기존 물리탄 및 player burn pool48·idle 활성600/30·분모20·cap10/no-refresh·expiry-first19회 요청은 공유한다. type4 undead trait와 antiRevive source 공식을 별도 보존하되 현재 무접사 antiRevive0만 인수하며 full modifier pipeline은 미이식이다. 기존 body8방향 base1280/0/256/256, walk5120~5888/0/256/256·거리128당4프레임/base+walk overlay·높이240.48639090638608을 사용한다. 이번 새 PNG 복사·가공·해시0이며 신규24장/24FPS 모델 제작도 포함하지 않는다. [이번 spine 정본](../docs/engine/FDG_GODOT_ETYPE4_PHYSICAL_SPINE_BEAST_20261013.md), [앞 물리 consumer 정본](../docs/engine/FDG_GODOT_ETYPE0_PHYSICAL_FLESH_CRAWLER_20261013.md), [공유 화상 정본](../docs/engine/FDG_GODOT_ETYPE0_PHYSICAL_BURN_20261013.md)을 참조한다. 이번 고유 exact_admission/native_motion_charge/shield_poise_order 기술 검사는 첫 실행3PASS/0FAIL/exit0(7.103183292초), 명시 `_physics_process(1/60)`1159회/자동 fixture physics0이다. 실제 world 지원4/12·source값/셀·이동·charge300→59→birth360·caster 사망 후 독립물리탄 전달 sink(parry24/KB2/burn48)·shield/overflow/poise/KB 순서를 확인했다. 생존stun은 미관측, 이전검사/성공반복/GUI0이다. 추가 flow_axis_boundaries는 최초1FAIL/2assertions/exit1(2.340568333초·명시5회)→추적 leaf 수리 뒤 그 실패1개만PASS/exit0(2.335691084초·명시5회)이며 현재 고유4 기술PASS다. 최초성공3 재실행0/fixture수정0/자동physics0을 유지했다. 원source에 없는50~100 alert 메타데이터를 교정했고 runtime/target/assets는 동일하다. `_move_flow_native`는 양축→X→Y와 source방향 캐시/stuck 시간을 소비하며 KB/idle/separation은 유지한다. 읽기 snapshot에 last_flow_direction/flow_stuck_ticks를 추가했다. 원8방향 escape·전체globalFlow/cache/RNG/culling parity는 미검증이다. config pending은 작성당시source metadata이며 현행고유4검사와구분한다. 전달 sink는 기존 Player fullhurtP/화상커널 재검이나 공개플레이·성능 증거가 아니다. ticket-linked windup 자동 진입·부활·원 full equipment/affix/fallen/retry 등 기존 미이식 경계를 유지한다. 새source 공개 교전·생존 stun 실제 관측·픽셀/시각·최저사양240FPS는 미검수다(VISUAL VERDICT: RETOUCH). 현재 인간의 전체화면 일시정지 앱은 첫 한 적 버전으로 이번 후속 source를 로드하지 않았다.

macOS 실행:

```sh
/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot --path /Users/fordeargamers/the-exoduser/godot
```

또는 이 폴더의 `run.command`를 실행한다. 다른 컴퓨터에서는 공식 Godot 4.7.2에서 `project.godot`를 열고 F6/F5로 실행한다. Windows 메인 PC로 전달·실행한 상태는 아직 아니다.

| 조작 | 기능 |
|---|---|
| WASD | 이동, 벽에서 미끄러지는 실제 물리 충돌 |
| 마우스 | 공격 방향 |
| 좌클릭 | 기검참 1·2타 즉시 발사, 3타 누른 동안 충전·놓을 때 발사 |
| Q | 원본 보호막 키. 현재 Main 실제 실행 owner 미연결로 NOT_READY; 무료 취소 대체 없음 |
| E | 원본 처내기 키. 동작·완료 연결 대기 |
| Space | 원본 분노 스킬 slot4 연결 대기. 기검참 토글 없음 |
| Esc / 화면 버튼 | 일시정지·재개 |
| 화면 재시작 버튼 | 이 Godot 씬의 새 게임. 브라우저 저장과 독립 |

이식 기준은 `/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html`, HEAD `9a4534b42f74093095ebc3364a25dd104e93b379`이다. 구형 FDG QA 숲길 대신 이 본편의 CH1-1 지형과 기존 제작된 PNG를 사용한다. 플레이어는 장비·패시브 적용 전 `mkP()`의 HP350/ST200, 레벨1을 기준으로 한다.

기검참 3타는 40/80/120틱(최대 2초)에 검기 피해 2/4/8배, 판정 반경168/216/264px다. 새 9프레임 비행 검기·4프레임 명중광을 재사용한다. 캐릭터 원본의 장수는 그대로이며 신규 24장 모델 제작은 포함하지 않는다.

렌더 목표는 우리 Steam 최소사양급에서 1920×1080·240FPS(4.1667ms)다. 물리·게임 시간은 60Hz로 분리한다. Compatibility 렌더러를 사용하며 Windows 저사양에서 240FPS 달성 여부는 미검증이다. 이번 맥 한 적 씬의 측정 결과는 전체 게임 성능을 보장하지 않는다.

검수 기록은 전용 `user://qa/latest-session.json`에 저장된다. 실제 폴더는 Godot의 `EXODUSER-Godot-Native-First` 전용 사용자 데이터 경로다. 원본 게임 저장 자동 변환·덮어쓰기는 없다.

전투·맵·앞선 공개 검수는 `../docs/engine/FDG_GODOT_NATIVE_FIRST_20261013.md`, 현재 factory·원본 목록·지원/미지원 및 새 기술 검사 상태는 `../docs/engine/FDG_GODOT_ENCOUNTER_FACTORY_20261013.md`를 참조한다.
