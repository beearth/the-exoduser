> 2026-10-16 통합 범위: 웹 본편 수치·현행은 최신 main 기준, 별도 Native/FDG 항목은 source pin9a4534b4의 부분 이식·명시 opt-in 계약이다. 전체 최신 본편 이식 완료가 아니다. 상세: docs/engine/FDG_PC_MAC_GIT_SYNC_20261016.md.

## P2-008a PC 후보 — etype20 전용 소비자 / 2026-10-20

원본 38681–38705의 LOS<800·d>30 flow1배 뒤 40483의 idle1.6배, 분리 cd3을 별도 etype20 스크립트가 소비한다. body/쉴드/포이즈/hurtE owner만 재사용하며 type0 AI를 호출하지 않는다. 원본 39057–39060은 빈 전용 분기, 40499의 근접 목록에20이 없고 31154의 탄막 제외 목록에20이 있으므로 자연 피해·투사체를 추가하지 않는다. 정확한 세 프로필(order4/10/12)만 추가하여 이 브랜치 source16 지원9/미지원7. 기존 본문6/10·pending type7·배송 기록은 당시 범위이며 main 전체 갱신 증거가 아니다. 상세 원본 수치·남은7개체·검수 한계: [P2-008a 정본](../engine/FDG_P2_008A_CH1_ENEMIES_20261020.md).

<!-- fdg-godot-native-owner-element-integration-20261013:begin -->
## Godot 소환·6원소 실행 연결 / 현재 이식 경계 · 2026-10-13

| 항목 | 현재 코드·검증 / 미완 범위 |
|---|---|
| 정본 | `docs/engine/FDG_GODOT_TYPE7_INTEGRATION_20261013.md` 및 `FDG_GODOT_TYPE3_BINDING_20261013.md`. 이번 새 production은 실제 World 시계·registry, type3 binding, 원 6속성 packet→투사체→피격FX, type7 조립 API이다. 원337/supportfalse/runtimeNULL·기존 텔레포트/M30/6source/배송5 증거는 보존한다. |
| 시계·생성 순서 | World priority−1 `ticks=min(delta×60,3)`/actual frame·ens Array identity→관리 owner1→원 particle pool update→warning1→기존탄 priority1→새탄 birth2→hitFX post3. getter setter0/AI 이중 자동실행0/SceneTree pause 상속. 초기 report와 동적 child registry를 구분한다. |
| source packet | `_commit`도 dmg×2/sz×2/r4×1.3=5.2. P redBean .5를 후적용해 raw피해 유지/300pxs; magic500..600. P/L/H size3·margin13, F/I/D size3.2·margin13.6. type3 life60/type7common240/TPqueued300, decay.667·homing.00655/life>30. D caller-life60/240 pair만 지원/범용D120 alias0·추가poison0. |
| 실제 피해·FX | type3 F/H는 magic·headingKB2, D는 정규화피해×1.3 magic·기본hurtP KB보존. M29 body는 모든원소 phys이며 elMul 선배율→기본hurtP→독립KB100. 무장비 baseline 배율1은 보존. 현재 Main은 SourceState의 현재 armor.el을 Player 배율 getter로 소비한다(2026-10-17, 전체 장비/affix 이식 아님). 실제 hitFX 새원bitmap4 합779557B(512²/4×4/cell128²) 최초import4/3.545726167초/ERROR0·oldtexture reimport0. |
| source 상태·입장 | raw source와 별도 actor ctor payload에 facing/eShield/eShieldMax/eRes/native_flags/bodyrect/direction/ai_profile만 투영한다. absent nativeflag는 absent 유지(null/false 발명0). M29 Q/E·warning·impact·SOUND 4cap 및 실제6원소·summon_context가 준비되지 않으면 type7 configure/prepare/install 원자거부. sourceRecord와 pendingJSON은 수정하지 않는다. |
| 현재 기술 인수 | 새고유12PASS=type3 binding4+실World phase2+6원소/FX4+type7 assembly2. assembly는 첫missingM29 1PASS/actual1FAIL→실패actual1만추가FAIL→같은실패1만1.948709167초/exit0/assert0/ERROR0 PASS 이력. source map Dictionary8/absentflag 투영을수리했으며원337/TP본문불변, 모든성공재실행0. actualWorld16frames/owner32·particle/warning/birth/post 각16·pause4, actualFHD Player피해/KB·FX pool12·65생존/66만료·invalid8 부분출력0. |
| Main·배송·시각 | 이번조립 API는 Main/factory 자동등록0. current Main source지원6/미10, 동결Web·Windows배송5/미11. constructor readiness fixture를실제공개Q/E·자연소환/교전·publicpixels/GPU·최저1080p240·24고유프레임/24FPS로승격하지않는다. **VISUAL VERDICT: RETOUCH**. |
| 다음 실제 연결 | 새type7 actualassembly기술단위를 정상 code+관련docs checkpoint→같은SKILL actualNativePlayer 명령/패링 leaf 및 ANIM M29 owner-event소비→본편 자연소환/텔레포트/교전·시각검수. source수치·원MAP/geometry/nav/STARTEXIT·보호paused화면/서버/save/타WIP 유지. |

<!-- fdg-godot-native-owner-element-integration-20261013:end -->


<!-- fdg-godot-type7-teleport-20261013:begin -->
## Type7 텔레포트 의존성 실제 소비 · 2026-10-13

| 항목 | 현재 구현 / 경계 |
|---|---|
| 이번 실제 소비 | `native_type7_teleport.gd` / `type7_teleport.json`(`exoduser.godot.native-type7-teleport.v1`) / Player 공개 KB leaf8행 / 원TP4 / 신규 고유4기술PASS. standalone controller이며 실제 etype7 actor·factory 등록0. source 지원6/미10·동결 배송5/미11 유지. |
| 원 native 순서 | idle에서 teleportT111.58698863349855·summonT157.41148072760552 감소→기존 warning 진행/완료→else 거리<100 및 teleportT≤0에서 P+polar(U×2π,150+U×50) 제안→can_move(r22.73476334709674) 성공 warning120/생성update 감소0, 실패timer30→마지막 summon_due. cooldown175.49626126885414. eSummon/recover·source guard 중 warning 정지. |
| 초기 episode 경계 | 실제 메서드 진행으로112프레임 warning 진입·158에서 summon_due/warning74 관측. mandatory summon/channel/recover는 미이식이며 이 raw episode를 자연 TP 완료로 쓰지 않음. 별도 constructor completion context와 live field setter를 구분. |
| 착지 / KB | 완료 시can_move 재검사; 실패여부와 무관하게 caller cooldown reset/후속 eProjAt 예약. 성공 시 source 이동좌표에서 strict 거리<(r+10)×2+Pr, baseline r65.46952669419348+Pr15=80.46952669419348; !ib/iframe≤0/state≠literalcharge. 원 physical 요청trunc40×10.5×elementMultiplier, baseline420→기존receive_damage(420,"phys")→선택M30 onhit 효과없음→radial(target→P)×120을 기본KB에독립가산. 실측 HP350→236, 기본KB+(120,0). 피해수락bool gate·extra120으로기본KB교체0. |
| 현재 검사 / 시각 | 고유4PASS=첫3PASS+실패queue1후속PASS. 첫전체 exit1/2.338453417s/assert2→해당queue만 exit0/.664766792s/assert0. 코드수리0(검사중), 성공3/oldsuite/import 재실행0. public교전·actual pixels·최저1080p240 검수0, VISUAL VERDICT: RETOUCH. |
| idle / global queue | advance_idle(ticks:float,cached_distance:float,native_frame:float=-1,world_identity:Variant=null)->Dictionary 이후 advance_shot_warnings(ticks:float,native_frame:float,current_world_identity:Variant)->void. 실제 caller guard/tiering/globalframe/generation 연결은 미완. 실제global frame/identity 없는 fallback은 증명으로 쓰지 않음. |
| warning / 취소 | 60틱 warning은 같은globalupdate sp1 뒤59. birth aim/heading 고정, release origin=저장mouth+현재owner변위; angle0의 mouth는 source facingfallback. 동일 owner/frame/world/el/blackBean/parryClass grouping·lane당r+8. Array/Dictionary token은is_same 객체identity; 내용만같은새instance도취소. 죽음/stun/freeze/world교체 취소·hitstun/비idle만으로취소0. born뒤owner독립. |

전체 source 수식/API/검사 ledger는 [현재 TP 정본](../engine/FDG_GODOT_TYPE7_TELEPORT_20261013.md)을 따른다. real parent `600e7269150a61b4b0f93e2f05ce64a8d9cec69c`, authority `9a4534b42f74093095ebc3364a25dd104e93b379`. 현재 표를 우선하고 이전 legacy/creation/배송 단위는 그 시점 역사로 보존한다.
<!-- fdg-godot-type7-teleport-20261013:end -->


<!-- fdg-godot-m30-epicenter-20261013:begin -->
## M30 owner clock 커널·미연결 AI 경계 · 2026-10-13

| 항목 | 현재 구현 / 경계 |
|---|---|
| 실제 산출물 | `native_m30_modifier.gd` + `m30_burst.json`(`exoduser.godot.native-M30-burst.v1`) + 기존 원Texture2D 2개 + 신규 기술검사/정본. `ExoduserM30Modifier`는 호출자 전달 시계를 소비하는 standalone 커널이며 실제 admitted actor 연결0. |
| M30 현재 값 | 진원 충격파 / ATK40 / owner 유효·mods 비어 있지 않은 native 호출에서 `eliteBusy=max(0,eliteBusy−ticks)`; 그 뒤 M30∈mods·거리<800일 때만 `eliteRing+=ticks`. ≥480·자신의 busy≤0에서 busy54/ring0. 고정 target 좌표 burst r125/t=dur54는 생성 update에서 sp1 소비 후53. |
| 만료 피해 | zone t≤0 때 거리≤125(`P.r` 미추가)·iframe≤0·literal state≠`charge`이면 `max(1,trunc(40×.65))=26`, `magic`. 원소 상성 배율 미적용·별도 KB 요청0; 실제 `receive_damage(26,"magic")` 2인자로 기존 기본 KB를 보존. 이후 hit 여부와 별개로 원 lava 생성/zone 삭제. |
| 지원 집계 | 현행 source16의 **지원6/미이식10** 유지. 동결 Web/Windows 배송본은 **5/11**. etype7 자연 생성·소환·순간이동 등록0. 커널 하나를 지원 actor 추가로 집계하지 않음. |
| 검사 / 상태 | 새 **고유4 technical PASS** = 첫3PASS + 실패한 피해fixture만 1FAIL→1FAIL→1PASS. 성공3 재실행0·기존 suite 반복0. 현재 public 교전/pixel/최저1080p240 검수0, **VISUAL VERDICT: RETOUCH**. |
| public API / caller | `configure(actor:Node2D,target:Node2D,world:Node2D,modifier_state:Dictionary,profile:Dictionary)->bool`; 공개 mods/attack/alive·실제 modT eliteBusy/eliteRing·원Texture2D 2개 선행 검증. 실패 시 state/child/zone 변경0. 실제 owner의 guard/tiering 뒤 호출할 접점은 남아 있음. |
| native / warning | `advance_native(ticks:float,distance_to_player:float)->void`; native 자체 `_process`/`_physics_process` dispatch0. `render_native(now:float)->void`는 경고 pulse/spin 및 queue_redraw만 갱신. zone 시계를 렌더 now로 대신 진행시키지 않음. |
| owner guard 순서 | 원updateE hit-stun/stun/ice guard 이후·nonalerted far-return 이전에서 own busy/M30/zone loop 순서를 유지할 필요가 있다. standalone 기술fixture는 이 실제 scheduler 연결을 검증하지 않으며 새 attack ticket/동시공격 제한0. |

정확 전체 수식·API·신규 실행 이력은 [M30 현재 정본](../engine/FDG_GODOT_M30_EPICENTER_20261013.md)에 기록한다. source 권위 revision `9a4534b42f74093095ebc3364a25dd104e93b379`, real parent `927fa91ec77bb8c54698e270ce57b50aea11fb45`. 이전 구현/배송/creation 시점의 기록은 역사로 보존하며 현재 상태는 이 표를 우선한다.
<!-- fdg-godot-m30-epicenter-20261013:end -->


<!-- fdg-godot-etype7-physical-flesh-crawler-pending-20261013 begin -->

## 2026-10-13 · etype7 리치 / flesh_crawler 필수 의존성 명세 — 미등록

고정 원목록의 가장 앞선 etype7 `ch1_initial_004 / order3 / physical0 / flesh_crawler / elite1 / mods[M30] / aura null`을 조사했다. 현재 산출물은 **pending JSON과 정확 source·의존성 문서**다. 실제 actor·탄·factory 등록/연결은0이며 Godot 소스 지원6/미이식10을 유지한다. 목표 지원7/미이식9는 달성하지 않았다. [etype7 의존성 정본](../engine/FDG_GODOT_ETYPE7_PHYSICAL_FLESH_CRAWLER_20261013.md)에 필수 소비자와 향후 검사를 기록한다. 앞선 소비자·배송본의 완료 이력과 자원·검사는 동결한다.

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
| timer 순서 | type7 idle에서 teleportT/summonT감소→기존 warning감소/완료 또는새target시도→소환조건. 새teleportwarning120은 같은분기update에서감소0·eSummon/recover는warning시계중지. M30 zone54는같은update zone루프에서53으로감소하여 서로 다른 순서를 유지한다. |
| 원 owner lock / banned ticket | M30 eliteBusy는자신의54틱상태이고 전역동시공격제한이아니다. 원조건부eCircle/windup branch를자동새진입으로 만들거나 소환child 공격수 제한을 추가하지 않는다. |

<!-- fdg-godot-etype7-physical-flesh-crawler-pending-20261013 end -->


<!-- fdg-godot-etype1-lightning-hive-bloater-20261013 begin -->

## 2026-10-13 · Godot etype1 번개 벌집 팽창체 소비

현행 Godot 소스는 고정 원기록 `ch1_initial_016 / order15 / etype1 / lightning4 / hive_bloater` 하나를 전용 consumer로 추가했다. 논리 type명은 가시 사도, 실제 스킨은 벌집 팽창체다. 원 `native etype 1` 이름과 source snapshot을 유지하며 `bone_archer`/`etype1_archer` alias로 교체하지 않는다. 상세 source·API·수치·검사 정본은 [번개 벌집 팽창체](../engine/FDG_GODOT_ETYPE1_LIGHTNING_HIVE_BLOATER_20261013.md)이다. 아래 앞선 Windows/Web의 지원5/미이식11은 동결된 배송본의 상태이며 현재 소스 지원6/미이식10과 구분한다.

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
| 실제 이동 순서 | 첫 ranged후퇴 point-isW, 뒤 idle후퇴/전진 canMv(radius). 둘 다 같은 update에 실행 가능; 두 번째 stage 뒤 projectile gate용 d 재계산0. type4 idle×1.6/가상근접alert/attack ticket 추가0. |
| separation / 조건부 상태 | neighbor query r×4.4/minDist r+neighbor.r+4/force×1.5/cooldown3. native source shared guarded conditional states만 보존하며 추가 meleeFSM 부여0; fullflow cache/8방향escape/crowd parity는 미완. |

<!-- fdg-godot-etype1-lightning-hive-bloater-20261013 end -->

> 2026-09-10 비보스 공통 탄막: projCd=240f, 초기 projT=180+Math.random()*120f, 차징60f 유지, 첫 교전 추가탄 제거. [필드 탄막 SSOT](../8.0몬스터디자인/FIELD_PROJECTILE_CADENCE_20260910.md). 전용 AI 패턴은 유지한다.

> **2026-10-11 NORMAL 드루이드 r4:** si0/3 ib=true !finale charge는마지막18native f 및실행중공용facing추적을잠근다. 기존echDx/Dy/speed35/duration50f/기본recover40f/FSM을유지한다. fan/elemBall `_druidStraight`만생성/hostileblack 강제선회에서제외하고반사친화blue유도는유지한다. 전적 `_seekSpecial`광역변경0·어택티켓0·타보스/피날레원권위유지. [정확공식·QA구분](../engine/FDG_DARK_DRUID_NATIVE_ENCOUNTER_20261011.md).

# 적 AI 패턴 디자인 — 구현 기준 문서

> 레퍼런스: compass_artifact 문서 (FromSoftware/HollowKnight/Diablo 참고)
> 실제 구현: game.html 기준 (2026-03-30 동기화)

---

## 1. 상태머신 (FSM)

모든 적은 `e.s` (state) + `e.st2` (타이머) 기반 FSM으로 동작한다.

### 기본 상태 흐름
```
idle → (거리 조건) → windup → attack → recover → idle
                  ↘ eCircle (어택티켓 대기, 공전)
```

### 상태 목록

| 상태 | 설명 | 전환 조건 |
|------|------|-----------|
| `idle` | 대기, 이동 | st2 소진 시 windup 또는 eCircle |
| `windup` | 공격 텔레그래프 | st2 소진 → attack |
| `attack` | 공격 판정 | st2 소진 → recover |
| `recover` | 공격 후 경직 | st2 소진 → idle |
| `eCircle` | 어택티켓 대기 공전 | 티켓 획득 시 → idle/windup |
| `eChargeWind` | **돌진 예고** (START 균열 + 반투명 BODY + END 창촉, 90f≈1.5초, 앞 24.5% 추적 후 방향 고정) | st2 소진 → 텔레그래프 즉시 제거 + eCharge (2026-06-27 신규, 2026-09-02 3파트 VFX 교체) |
| `eCharge` | 돌진 공격 | 벽/거리 초과 → recover |
| ~~`eSelfDestruct`~~ | ~~자폭~~ | 삭제됨 — etype 5는 탄막몹(windup→발사)으로 전환 |
| `eShieldBash` | 방패 돌진 | 벽/거리 → recover |
| `eShootWind` | 탄막 발사 준비 (최소 1초) | st2 소진 → `_swFire()` 실행 → `_swChargeEl=null` → idle. 물리 특수탄(66/68/69)은 `_swChargeEl=EL.P`로 흰색 `#f4f4f4` 속성 예고 라운드 |

---

## 2. 핵심 수치 (일반 vs 보스)

| 항목 | 일반몹 | 보스 |
|------|--------|------|
| **idle 대기** | 15~30f (0.25~0.5초) | 3~8f |
| **windup** | 8f (etype3: 5f) | 패턴별 가변 |
| **attack st2** | 8f | 8f |
| **attack 판정** | st2≤5 && st2+sp>5 시점 | 동일 |
| **recover** | 35f (0.58초) | 35f (max 20으로 클램프) |
| **근접 사거리** | d < 30+P.r+18 ≈ 48~50px | d < 50+P.r+18 ≈ 68~70px |
| **텔레그래프** | _telegraphT=20f | 20f |
| **시야 어그로** | `!_alerted && (idle/recover) && d<800 && hasLOS` 시 자동 알림 | 해당 idle/recover 일반 분기 기준 |
| **추적 해제** | 없음 — 어그로 잡히면 d≤30까지 밀착 추적 (해제 없음) | 동일 |
| **방향 추적 (facing)** | **이동 중**: facing=이동방향(_moveAng, atan2(dy,dx)) / **정지 중**: d<800에서 facing=플레이어 방향. (2026-04-16: 이동 시 이동방향 우선 — walk 애니/스프라이트가 진행방향 표시) | 보스 포함 |
| **근접 어그로** | 현행 source에는 별도50~100 자동 alert 분기가 없음. idle/recover의 `d<800 && hasLOS` 일반 분기 또는 실제 피격 등의 별도 alert만 소비 | 별도 근접 자동 alert 없음 |
| **밀어내기** | 제거됨 (pushStr 블록 삭제, 플레이어-몬스터 겹침 허용) | — |
| **피격 즉시 반격** | hurtE 시 _alerted=true + recover→idle(st2=0) + idle대기→5프레임 단축 — DOT 제외 | 보스 제외 |
| **근접 접촉공격** | etype 0,2,4,5,6,10,12,18,19 밀착 시 atk×0.8 타격, 쿨 `40+trunc(random×20)`f (정수40~59f, 2026-04-07 복원) | 동일 |
| **순찰 배회** | 제거됨 (2026-04-14) — 비어그로+d>400이면 대기만 | — |

---

## 2.5 추적 시스템 — 플로우필드 + LOS

### 시야(LOS) 어그로
- **hasLOS** 함수로 레이캐스트 (16px 간격, isW 체크 — 타일벽 + MAP_OBJS + 본월 모두 포함)
- d<800 && hasLOS 통과 시에만 `_alerted=true` — **벽 뒤 몬스터는 어그로 안 잡힘**
- 피격 시에는 LOS 무관 즉시 어그로 (`hurtE` 내부에서 `_alerted=true`)
- 방향 추적(facing)도 `_alerted` 상태일 때만 작동

### 플로우필드 (BFS 경로탐색)
- 0.25초마다 플레이어 위치 기준 BFS 재계산 (Web Worker 오프로드, 폴백: 메인스레드)
- 셀 크기: T=40px (타일 크기 동일)
- **벽 판정**: 타일벽(map[][]=1)만 사용 (MAP_OBJS는 canMv에서 실시간 체크)
- 8방향 탐색 (대각선 포함, 대각 코너컷 방지)

### Stuck 복구 (3단계)
| 단계 | 조건 | 행동 |
|------|------|------|
| 1 | 즉시 | 8방향(45° 간격) 우회 시도, 0.8배속 |
| 2 | 0.5초+ stuck | 충돌반경 축소 + 16방향(22.5° 간격) |
| 3 | 1.5초+ stuck | 플레이어 방향으로 2~6배 거리 강제 텔레포트 |

### 벽 끼임 최종 처리 (메인 적 루프, `game.html:32700~`) — 2026-10-01 보스 예외 추가
중심+4코너가 벽(`_eWallStuck`)이면 5링×8방향 구조 시도 → 실패 시:
- **비보스:** 정리 킬(`e.hp=0; rollDrop; addExp; G.kills++; G._stageKills++; _regKill`). 도달 불가 몹이 진행을 막는 소프트락 방지 목적. (기존 계약 유지)
- **보스(`e.ib`) — 즉사 금지:** 넓은 링(6~12타일) 재배치 → 실패 시 `canMv(P.x,P.y)` 플레이어 위치 → 그래도 실패면 제자리 유지(다음 프레임 재시도). **보스는 어떤 경우에도 이 경로로 죽지 않는다.** (이전: `e.ib` 예외 없이 보스도 즉사 → 전리품·킬 크레딧과 함께 무료 소멸·킬카운터 desync 사고. 회귀 `test/enemyWallStuckBossKill.test.js`)

---

## 3. 어택 티켓 시스템

> 핵슬 장르 특성상 **현재 무제한(항상 true)**으로 설정됨.

```
G.maxAtkTickets = 3   // 정의만 존재
atkTicketRequest(e) → return true  // 항상 허용
atkTicketRelease(e) → 티켓 반환
```

- 티켓 풀 상태에서 일반몹은 `eCircle`(공전)로 전환하지만, 현재 항상 true이므로 eCircle 진입 빈도 낮음
- 보스는 eCircle 즉시 idle 복귀

---

## 4. eCircle (공전) 로직

플레이어 주변을 원형으로 공전하며 공격 기회를 노림.

| 항목 | 값 |
|------|-----|
| 궤도 반경 | 90 + e.r (≈100~110px) |
| 각속도 | 0.018 rad/frame (≈1°/f) |
| 이동속도 | 기본 × 75% |
| 공격 재시도 | 30~60f마다 티켓 요청 |
| 근접 전환 | d < e.r+30 → 즉시 windup(st2=35) |

---

## 5. etype별 특수 패턴

### 근접형

| etype | 이름 | 특수 행동 | 핵심 수치 |
|-------|------|-----------|-----------|
| 2 | 돌진사도 | **돌진 제거 (2026-06-28)** — 일반 근접만 (`_meleeET`, 밀착 시 atk×0.8) | 휴머노이드 돌진 폐지, 동물형(22/30/43)만 돌진 |
| 3 | 요마 | windup 짧음 | windup st2=5 (다른몹 8) |
| 5 | 태아형악마 | 탄막 (자폭 제거) | d<35+P.r → windup st2=20, 이후 탄막 발사 |
| 6 | 철갑사도 | 방패돌진 | d<150, d>30, 속도 4.5px/f, 쉴드 파괴 후만 |
| 8 | 부풀은사도 | 근접 기습 | d<40 |
| 51 | 융합체 | 근접 | d<35+e.r, windup st2=20 |
| 52 | 입 괴물 | 이빨 닫기 | d<25+e.r, windup st2=15 |
| 90 | 방랑기사 | 3연 콤보 자동연계 | 1타 st2=18, 2타=12, 3타=10. recover 후 d<60이면 자동 다음타 (콤보 3회까지) |

### 돌진형

> **돌진 예고 텔레그래프 (eChargeWind) — 2026-06-27 신규, 2026-06-28 개편, 2026-09-02 START/BODY/END VFX 교체**
> `idle → eCharge` 직행 대신 `idle → eChargeWind → eCharge`. 현재 전조는 몬스터 중심의 검붉은 균열 START, 실제 위험구간의 어두운 안개 BODY, 도착점의 별도 악마성 창촉 END로 구성한다. END가 진행 방향을 표시하고 `eCharge` 전환 틱에 전체를 즉시 제거한다.
> - **진입 시**: 플레이어 방향으로 `echDx/echDy` 조준 + `e.facing` 설정
> - **예고 시간**: `e.st2 = _chgAimMax = 90f (1.5초)` 동안 정지하며 3파트 레인 표시 (2026-06-28: 1초→1.5초)
> - **유도(팔로잉)**: 예고 **앞 ~24.5%** 동안만 플레이어 재조준(추적), 이후 **75.5%는 방향 고정**. 락 임계값 `_chgLock = _chgAimMax × 0.755`, `e.st2 > _chgLock`인 동안 추적. (2026-06-28: 팔로잉 30% 추가 감소 — 기존 0.65→0.755). 추적 중 `_chgVisLen` 매프레임 재계산, 락 후 캐시
> - **장애물 감지**: 발동 전 `_chgPathClear(e,len)` 검사 — 돌진 경로(`e.r`~거리, 12px 간격)에 벽/오브젝트(`isW`) 있으면 **돌진 시작 안 함** (2026-06-28 신규). `_chgVisLen`은 벽에 막히면 레인을 그만큼 짧게 표시
> - **논타겟 커밋**: 예고/돌진(`eChargeWind`/`eCharge`) 진입 후에는 사거리 이탈·디어그로·작살 스턴에도 멈추지 않고 끝까지 진행. 컬링/AI 거리 티어링 무시하고 매프레임 갱신(T1 강제), 작살 스턴 면제 (2026-06-28 신규)
> - **렌더**: `A=(e.x,e.y)`, `B=A+(_chgVisLen×echDx,_chgVisLen×echDy)`, `angle=atan2(echDy,echDx)`. START는 `A`, END는 `B`에 원본 비율로 고정하고 BODY만 X축으로 `_chgVisLen`까지 stretch한다. BODY 폭은 기존 판정 가이드와 동일한 `e.r×1.7`. 면 opacity `0.27`, 균열선 `0.62±3.5%`, 중앙 에너지 `0.11`, START `0.56`, END `0.70`; 모두 30f(0.5초) fade-in. **GL 경로(`_prepEnemyInstanced`, 일반 아틀라스·8방향 WebGL 스프라이트 모두)와 2D 폴백 경로(`!_ensGLQueued`)에서 동일하게 렌더**
> - **소진 시**: `e.s='eCharge'; e.st2=_chgDur` — 돌진 속도 `e._chgSpd||5` px/f
> - **적중 데미지**: `atk×30` (2026-06-28: ×1.5→×15→×30) + `fire_medium` 임팩트(`_addBoom 80,48`) + 넉백(100) + `bigImpact(불)` + `shake(10)` + `SFX.detonate`
> - **회피법**: 예고선 보고 옆으로 사이드스텝. 앞 24.5%는 따라오므로 락 이후 타이밍에 회피
> - **필드**: `_chgAimMax`(예고길이=90), `_chgDur`(돌진 지속), `_chgSpd`(속도=42), `_chgLen`(레인 픽셀길이=spd×dur), `_chgVisLen`(벽 클리핑된 표시 길이)
>
> | VFX ID | 한글명 | 에셋/수치 | 적용 위치 | 공식·동작 |
> |---|---|---|---|---|
> | `chargeStartRift` | 시작 균열 | `charge_start_rift.png`, 550×512 RGBA, `clamp(e.r×2.1,35,50)px`, alpha `0.56` | `_getChargeTeleLayout` → `_drawChargeTele` | 몬스터 중심 A, 원본 비율 유지 |
> | `chargeBodyMist` | 위험구간 안개 | `charge_body_mist.png`, 1024×128 RGBA, 폭 `e.r×1.7`, alpha `0.27`, 중앙 `0.11` | `_getChargeTeleLayout` → `_drawChargeTele` | A→B, BODY만 `_chgVisLen`으로 X축 stretch |
> | `chargeBodyEdge` | 양쪽 균열선 | `#a52b22`, 1.25px, alpha `0.62±3.5%` | `_drawChargeTele` | BODY 외곽만 미세 pulse |
> | `chargeEndSpear` | 도착 창촉 | `charge_end_spear.png`, 776×512 RGBA, `clamp(e.r×2.5,45,65)px`, alpha `0.70` | `_getChargeTeleLayout` → `_drawChargeTele` | 도착점 B, START와 별개 형상, 원본 비율 유지 |
> | `chargeFade` | 예고 fade-in/제거 | `fade=clamp((90-st2)/30,0,1)` | `eChargeWind → eCharge` | 0.5초 fade-in, 발동 틱에 전체 즉시 제거. 피해·속도·거리·히트박스 불변 |
>
> **적용 대상 (동물형 3종)**: etype 22(서리늑대), 30(사냥개사도), 43(악마견)
> **etype 2(돌진사도) 제거 (2026-06-28)** — 휴머노이드 돌진 폐지, 동물형만 돌진. 미적용(추후 확장): 23·45 급강하/원거리, 55 파편 돌진, 41 장로전사

| etype | 이름 | 예고 st2 | 돌진 속도/지속 | 돌진거리=레인 len | 비고 |
|-------|------|------|------|------|------|
| 22 | 서리늑대 | 90(1.5s) | 42px/f × 19f | 798+r | 🐺 감속오라 |
| 30 | 사냥개사도 | 90(1.5s) | 42px/f × 17f | 714+r | wildCharge |
| 43 | 악마견 | 90(1.5s) | 42px/f × 15f | 630+r | ddLunge |
| 2 | 돌진사도 | — | — | — | **돌진 제거 (근접만)** |

> 2026-06-28 정리: 예고 1초→1.5초, 팔로잉 30% 감소(락 0.755), 장애물 감지+논타겟 커밋 추가, 돌진뎀 ×30, fire_medium 임팩트. 속도 42px/f 공용, 거리는 dur로 조절(`_chgLen=_chgSpd×_chgDur` 불변식 유지).

> **순간이동 예고 텔레그래프 (`_tpWarn`) — 2026-06-28 개편, 2026-06-29 2차 강화, 2026-09-01 원 렌더 폐기**
> 기존 "0.5초 본체 깜박임 + 도착지 흐린 원" → 2초 타이머 전조. **원 오버레이는 2026-09-01 전부 폐기**(본체 충전원·도착지 점선원·착지 확장원). 타이머·착지강타는 유지.
> **2026-06-29 2차**: 전조 전 텔포 몹 **2초(120f)로 통일**, 도착 충격범위 2배, 착지 강타 데미지 추가.
> - **공용 필드**: `_tpWarnT`(남은 프레임, 감소), `_tpWarnMax`(시작값=진행률 분모), `_tpWarnX/_tpWarnY`(도착지), `_tpWarnCol`(색, 렌더 미사용). 엔티티 init 기본 `_tpWarnMax:30`(런타임에 120으로 덮어씀)
> - **렌더**: 없음. 스프라이트 VFX(`teleportE` 연기·번개)만
> - **발동 후**: `teleportE()` 실행, 도착 직후 탄막 1발
> - **착지 강타**: 도착 시 조준 범위 `(r+10)*2` 내 플레이어 `e.atk*10.5`(돌진 `e.atk*30`의 35%) 타격. 비보스 한정, iframes/돌진 무적 회피
> - **회피법**: 2초 전조 동안 거리 벌리기. 조준 원은 안 그림

| 사용 몬스터 | 전조 길이 | 색 | 도착지 | 발동 후 |
|---|---|---|---|---|
| etype 7 리치 | `_tpWarnT`=120f(2s) | `#8833cc` | 플레이어 주변 150~200px 랜덤 | 탄막 1발+착지강타 |
| etype 47 그림자쌍둥이 | 120f(2s) | `#cc44ff` | 플레이어 주변 60~100px 랜덤 | 착지강타(+분신 별도) |
| M13 텔레포트 모드 | 120f(2s) | `#aa00ff` | 플레이어 뒤 50px | 탄막 1발+착지강타 |
| 시간정지형(시간 되감기) | 120f(2s) | `#aabb99` | 플레이어 뒤 35px | 감속오라+탄막 |
| etype 98 차원균열체 | 120f(2s) | `#bb44ff` | 자기 주변 80~200px 랜덤 | 균열 설치 연계 |

### 원거리/캐스터형

| etype | 이름 | 행동 | 수치 |
|-------|------|------|------|
| 7 | 리치 | d<100 후진, 텔레포트 뒤습 (2초 전조 타이머 + 착지강타 e.atk*10.5. 원 오버레이 없음) | 후진 조건 d<100, 전조 `_tpWarnT`=120f |
| 26 | 눈보라마법사 | 눈보라 시전 | d<1200 |
| 14 | 날개사도 | 원거리 이동 | d<1200 |

### 특수

| etype | 이름 | 행동 | 비고 |
|-------|------|------|------|
| 13 | 거미사도 | 공격 모방 | d<40 |
| 20 | 빙결전사 | 근접+빙결 | d<30+e.r |
| 24 | 동상좀비 | 접촉 빙결 | d<e.r+P.r+8 |
| 25 | 빙판슬라임 | 추적 | d<1200 |
| 28 | 빙하골렘 | 빙결파 | d<100 |

---

## 6. 보스 전용 패턴

보스는 `e.ib=true`이며 별도 상태를 사용.

### 보스 상태 목록

| 상태 | 설명 |
|------|------|
| `bossDelaySlashHold/Swing` | 지연참 (홀드→스윙) |
| `bossPerilWind/Thrust` | 위험 찌르기 (thrust st2=8) |
| `bossBurstCounter` | 폭발 반격 |
| `bossCrescendo` | 점층 연격 |
| `bossPoisonDash` | 독안개 대시 (recover 25f) |
| `bossSBashWind/SBash` | 방패 돌진 (bash st2=18, recover 25~30f) |
| `bossMirrorGuard` | 거울 방어 (recover 20f) |
| `bossItemStealWind/Steal` | 아이템 탈취 |
| `bossMeteorWind` | 유성우 (tele/50f) |
| `bossGrabWind` | 잡기 (tele/40f) |
| `bossChargeWind` | 돌진 (tele/55f) |
| `bossShock` | 충격파 |
| `bossSummonWind` | 소환 (55f) |
| `bossBurstWind` | 폭발 (55f) |

### 보스 수치 특성
- recover → idle: st2 max 20으로 클램프
- idle 대기: 3~8f (거의 즉시 재행동)
- 근접 사거리: 50+P.r+18 ≈ 68~70px

---

## 7. 엘리트 시스템

### 등급

| 등급 | 색상 | HP배율 | ATK배율 | 모디파이어 | 드롭보너스 | 크기배율 |
|------|------|--------|---------|-----------|-----------|
| 일반 | 흰색 | ×1 | ×1 | 0 | 0 | ×1.00 |
| 매직 | 파랑 | ×2 | ×1.3 | 1 | +50% | ×1.08 |
| 레어 | 주황 | ×3 | ×1.6 | 2 | +150% | ×1.20 |
| 챔피언 | 빨강 | ×5 | ×2 | 3 | +300% | ×1.35 |

### 출현 확률 (장별)

| 장 | 매직 | 레어 | 챔피언 |
|----|------|------|--------|
| 1장 | 3% | 0% | 0% |
| 2장 | 8% | 2% | 0% |
| 3장 | 12% | 5% | 1% |
| 4장 | 15% | 8% | 2% |
| 5장 | 18% | 10% | 3% |
| 6장 | 20% | 12% | 4% |
| 7장 | 22% | 15% | 6% |

> **현재 적용**: 일반 필드몹만 등급 판정. 보스와 etype 90~99 레어몹은 이 롤에서 제외. 확률은 장별 표를 따르며, 레어/챔피언은 확률 합산 구간으로 판정한다.
> 런타임 보존: 적 상태 갱신 루프는 elite/mods/aura를 초기화하지 않는다. 등급·접사·오라는 스폰 시 부여되어 전투 중 지속된다.
> 가독성 VFX: 매직/레어/챔피언은 플레이어 Q 홀드 보호막과 같은 에너지 불꽃 스프라이트를 사용한다. 등급별 색은 파랑/금/빨강이며, 몸을 두르는 선형 링은 그리지 않는다. 레어 몬스터(etype 90~99)는 개별 네임드 이름을 금색 상시 이름표로 표시한다. 장판은 피해반경 고정 외곽선+20개 경계 눈금+중앙에서 커지는 발광 전선12개로 표시한다. 포격은 반경의 38~55% 십자 조준 표식, 번개는 850px 점선 3레인과 지그재그 중심 아크를 사용한다. 자세한 렌더 수치는 VFX 구현 가이드의 2026-09-23 항목을 따른다.

| 렌더 요소 | 반경 | 물리탄 차징 링과의 간격 | 목적 |
|---|---:|---:|---|
| 정예 에너지 오오라 | Q 보호막 시트 5×4 중 0~1프레임을 약 140ms마다 교차; 매직 e.r×5, 레어 e.r×5.8, 챔피언 e.r×6.4에 pulse=.92+.08×sin(now/105+etype) | 물리탄 차징 표시 및 공격 예고와 분리 | 파랑/금/빨강 틴트의 에너지 불꽃이며 외곽 원형 링은 없음; Q와 같은 가산 합성/알파 1.4×pulse+0.6×pulse 2패스, 플레이어 Q 보호막 에셋 재사용 (2026-09-24) |


### 엘리트 전투 접사 (M29~M32)

| ID | 접사 | 해금 장 | 패턴 | 전조/대응 |
|---|---|---:|---|---|
| M29 | 돌진 | 1장 | 9초마다 140~520px 거리에서 돌진, 속도 32, 지속 18f | 붉은 직선 레인 60f 예고 후 옆으로 회피 |
| M30 | 진원 충격파 | 1장 | 8초마다 플레이어 위치에 반경 125px 폭발 | 원형 위험 표시가 중심에서 54f 동안 가장자리로 확장, 표시 밖으로 이탈 |
| M31 | 번개 연사 | 2장 | 6초마다 조준 부채꼴 번개탄 3발, 속도 3, 피해 ATK×0.72 | 조준선 45f 예고, 시작 후 사거리 이탈과 무관하게 발사 완료, 마법탄은 Q 패링 또는 회피 |
| M32 | 지옥 포격 | 3장 | 10초마다 플레이어 주변 3지점 순차 포격, 반경 68px, 피해 ATK×0.8 | 각 원 78/102/126f 예고 후 폭발, 표식 밖으로 이탈 |

기존 M19 낙뢰는 6초마다 플레이어 위치를 표적화하며 반경 105px로 확장되는 원형 전조 54f 후 폭발한다(피해 ATK×0.65).

등급은 매직/레어/챔피언 순으로 모디파이어 1/2/3개를 보유한다. 매직·레어는 해금된 M29~M32 공격 접사를 최대 1개, 챔피언은 최대 2개 우선 부여한다(해당 장에서 해금된 공격 종류가 부족하면 가능한 수만 부여). 남은 슬롯은 중복 없는 해금 일반 모디파이어에서 뽑는다. 레어부터 팩 오라를 추가한다. 강한 공격 개시는 적별 공유 eliteBusy 잠금으로 직렬화한다: M19/M30=54f, M29=78f(60f 예고+18f 돌진), M31=45f, M32=126f. 잠금 중 다른 강공격 시작은 보류하고 각 재사용 계수는 계속 누적한다. 동시에 준비된 경우 M19→M29→M30→M31→M32 순으로 선점한다.

---

## 8. 레어 몬스터 (etype 90~99)

| etype | 이름 | HP | ATK | SPD | 포이즈 | 특수 |
|-------|------|----|-----|-----|--------|------|
| 90 | 방랑 기사 | 96 | 24 | 0.36 | 36 | 3연 콤보 |
| 91 | 보물 악마 | 32 | 18 | 0.75 | 10 | 빠른 이동 |
| 92 | 거울의 사도 | 64 | 12 | 0.30 | 24 | 반사 |
| 93 | 상인 악마 | 16 | 0 | 0.60 | 5 | 비전투 |
| 94 | 사슬의 죄수 | 128 | 10 | 0.15 | 50 | 고HP/고포이즈 |
| 95 | 시간의 사도 | 64 | 18 | 0.15 | 18 | — |
| 96 | 탐욕의 사도 | 80 | 12 | 0.24 | 60 | 골드 탈취·성장 |
| 97 | 저주받은 쌍둥이 | 64 | 18 | 0.39 | 22 | 물리/마법 전환·부활 |
| 98 | 차원 균열체 | 48 | 18 | 0.30 | 18 | — |
| 99 | 죽음 그 자체 | 1600 | 60 | 0.24 | 999 | 최고 HP/포이즈 |

> **수치 SSOT = `game.html` `RARE_ETYPE`(`29441`).** 위 표는 2026-10-01 코드값과 동기화(base 템플릿, r 컬럼 제외). 이전 95~99 값(40/8/.45·56/14/.30·80/16/.36·48/16/.42·160/18/.30/60)은 stale였음. 90~94는 코드와 일치.

---

## 설계 원칙 (레퍼런스 요약)

1. **Anticipation → Attack → Recovery** 사이클 필수
2. 텔레그래프는 최소 15f(반응), 쾌적 20f+
3. 난이도 = 동시 위협 수 × 개별 위협 명확도. 혼란이 아닌 중첩으로 어렵게
4. 거리별 행동: 원거리→접근, 중거리→공전, 근거리→공격
5. 엘리트는 같은 FSM + 파라미터 변경으로 차별화

### 2026-09-07 공격링 누락 보정

| 경로/필드 | 현재 계약 |
|---|---|
| eShootWind 공격링 | 장식용 _eDecor(600px·히트스톱) 제한 없이 표시, alpha=1. 기존60f 대기 유지 |
| eProjAt / radialProjs | _emitEnemyShot(e,props) 경유. eShootWind 완료(st2≤0), _swChargeEl===props.el, 비무지개가 모두 맞을 때만 즉시 발사. 불일치는 실제 탄색으로60f 추가 예고 |
| _spawnBossProjectile | 일반/특수몹(!ib)의 적 이동탄(vx 또는 vy)은 같은 전조 경유. 보스 전용 패턴·정지 장판·friendly는 기존 경로 유지 |
| G._shotWarnings / e._shotWarning | 소유자·world(ens)·_gameFrame·el·blackBean이 모두 같은 탄만 링1개에 묶음. props 복사 후 대기. 다른 속성은 별도 링: r=(e.r 또는12)+동일 소유자/월드 기존 대기 링 수×8 |
| _tickEnemyShotWarnings(sp) | 투사체 업데이트 직전 감소. 60f 완료 시 shot._commit=true 후 원래 탄속·피해·탄종·방향으로 방출. 살아 있는 소유자 이동만큼 발사점 보정 |
| 예고 완료 생성 보장 | _emitEnemyShot의 일치한 eShootWind 즉시 방출도 props._commit=true. 즉시/대기 완료 모두 밀도1/3 드랍 면제, 기존 spawnProj 속도/피해 배율 유지 |
| 거리 이탈 | etype62 방전·86 폭발은 시작 d<100, 준비60f 유지. 완료 시 80+P.r 재검사 제거: 현재 플레이어 방향으로 각1발. 발사 전 스턴/빙결/사망 취소 규칙은 그대로 |
| 취소 | 살아 있던 소유자 사망·stunned>0·_frozen>0 또는 ens 참조 변경(스테이지 변경) 시 예약 제거 |
| 사망탄 | 요청 시 이미 죽은 소유자는 사망 위치에 링60f 후 방출. 원래 사망탄 효과 유지 |
| _drawEnemyShotWarnings | 적 본체 렌더 뒤, 탄막 렌더 앞에 프레임당 1회. 살아 있는 적의 _projChargeT 및 eShootWind와 대기 발사 큐를 함께 표시. 구울/슬라임 전용 렌더의 continue 및 장식 거리 제한과 독립, 본체 은신 투명도와 무관하게 alpha=1 |
| 일반 차징 색/진행 | normal+EL.P=#f4f4f4, black=_BEAN_RAINBOW[(_gameFrame>>2)%7], fire=#ff2e22, 그 외 _projChargeCol; 진행=1-_projChargeT/60 |
| 특수/큐 색/진행 | eShootWind: _swChargeEl===EL.P이면 #f4f4f4, 그 외 ELC[_swChargeEl??e.el] 또는 #f4f4f4; 진행=1-st2/60. 큐: 물리 비무지개=#f4f4f4, 무지개=_BEAN_RAINBOW[(_gameFrame>>2)%7], 나머지 요청 탄색 또는 #ff6644; 진행=1-w.t/60 |
| 특수 발사 속성 고정 | eShootWind의 eProjAt은 _beanRoll 재추첨 없이 요청 el/spd/sz/dmgMult를 사용하고 col=ELC[el] 또는 요청색. dmg=정수(e.atk×dmgMult), life=정수(요청 life×1.5), _commit=true. 글로벌 spawnProj 배율은 기존대로. 일반 발사 _beanRoll은 유지 |
| 2차 누락 원인/회귀 | 본체 전용 렌더 조기 continue가 기존 인라인 차징 링을 건너뜀. 인라인 중복 코드를 제거하고 공통 패스로 이동. enemyWarningOverlay.test.js에서 전용 본체·은신·사망·단일 호출 4건 검증; 기존 전조 포함 총17건 |
| 미변경 | 보스 전용 예고/연사 타이밍, 기존 idle60f, 패링, 탄막 외형, 피해, 속도, spawnProj 밀도 계약 |

검증: enemyShotWarning.test.js(일제사격60f, 완료 전조 중복 지연 없음, 취소, 사망탄, 장식 제한 분리), tmp/verify_enemy_shot_warning.py(실제 eProjAt 경로). 이 보정은 모든 보스 패턴의 별도 시각 QA 완료를 의미하지 않는다.


## 2026-09-16 거미줄탄 가시성 보완

| 대상 | 현행 표시 / 판정 |
|---|---|
| `etype13` / `web:true` | `EL.P` 흰 링 `#f4f4f4` 60틱 후 기존 원본 적갈색 뱀형 `_drawPhysMouth` 표시. 반투명 점/실 렌더 제거. 입력sz1.2→최종sz2.4, 표시 셀122.2452×61.1226px |
| 전투 규칙 | 패링 `forbidden`, 둔화90틱(1.5초), 속도·피해·충돌·수명 불변. 물리탄 부착 연출 대상 아님 |
| 상세 | [누락 원인·크기 공식·검증 범위](../8.0몬스터디자인/PHYSICAL_PROJECTILE_AUDIT_20260916.md#2026-09-16-흰-링-거미줄-점탄-누락-수정) |


<!-- DARK_DRUID_THORN_FIRST_APPENDIX_BEGIN -->
## 2026-10-11 · 다크드루이드 가시 일제발사 first opt-in

기존 본문·r9/live-fix와 이전 결과표는 해당 범위의 동결 이력으로 보존한다. 아래는 기존 자기 격리 QA에 fdgDruidThorn=first를 명시한 별도 ENGINE_AUTHORING fan 예외만 기술한다. 기본 본편·옵션 없는 QA·피날레·상위 phase 계약을 덮어쓰지 않는다.

| 항목 | first opt-in 계약 |
|---|---|
| gate / owner | window._FDGDruidQaStorage.active && fdgDruidThorn=first. 실제 발사 대상은 ib=true·si0/3·!finale·phase0/1 NORMAL 보스만 |
| native 발사 | bossFanWind의 기존 st2<=0 한 tick에서12발을 동시에 생성. 별도 wave clock/연속탄 생성0. lane0..11 중 physical0/1/3/4/6/7/9/10=8발, magic2/5/8/11=4발(i%3===2), 이 범위 blackBean0 |
| 조준 / 폭 | first start와 준비 wind의 e.facing=atan2(P.y−e.y,P.x−e.x)로 현재 Player 추적, 발사 tick에서 aim을 확정한다. fanW=π×(.7+.06×phase)rad, a=aim−fanW/2+fanW×i/11. 발사 이후 hostile _druidStraight로 forced homing/steer 제외·고정 방향 유지 |
| local flags / 예외 | _druidThornVolley pooled 기본/reset false, _druidThornLane 기본/reset−1. 해당 flag탄만 기존 modulo3 drop 및 생성 직후 decoy/ancestor aim 재지정에서 제외. 공용 후처리 배율은 적용하며 전역 drop/decoy/seek 변경0 |
| 입력 / 최종 속도 | 입력4.4px/native tick. 기존 후처리 최종 physical5px/tick=300px/s(60Hz), magic500/60..600/60px/tick=500..600px/s. 이 값은 clip24FPS와 별개이며 신규 속도 배율0 |
| 피해 | n=floor(atk×1.3), 최종 physical=floor(floor(2n)×.5), magic=floor(2n). atk103이면 n133/physical133/magic266. native poison wrapper는 원 class 보존 후 EL.P/col#66dd22, 실제 HP 피해시 기존 poison+3 |
| 수명 / 판정 | life/ml400은 nominal native-frame metadata. 기존 감소 life−=sp×.667 및 magic의 카메라2500px 이내 또는 실제 가시 영역+100px 이내에서 life<=0→life1 연장. 원거리 정리는 두 범위 밖에서만 수행(2026-10-31 웹 기준), 정확400tick 종료/초 단위로 승격0. 후처리 sz2.4·pool.r5.2; 일반탄 player collision base=P.r+7.2/기본 gate=P.r+11.2(base+4), 기존 Q/E 확장·현재/이전 P/shot 선분 sweep 유지, 저작 silhouette로 판정변경0 |
| 준비 / 회복 / cd | wind=floor(25×BOSS_PHASES[phase].teleM)+extraDelay, phase0/1의 base18/16native f(추가 delay 별도). 발사 직후 recover45, 다음 기존 보스 recover update에서20으로 clamp. 기존 fan cd100 유지. authored1.6초를 native 준비·수명·회복 시간으로 덮어쓰지 않는다 |
| 보존 | 기존 E physical/Q magic/black Q-only·반사 friendly blue 유도·피해/poise·자원 유지. phase2+의 기존 count/black/modulo3 drop·피날레·다른 보스·기본 main·사용자 save 유지 |
| tell / 실제 wind | first start에서 _druidFanWindMax=e.st2·e.facing=atan2Player, bossFanWind에서도 e.facing=atan2Player로 준비 중 추적. tell progress=clamp(1−st2/실제 _druidFanWindMax), 폭π×(.7+.06×phase)와 같은 atan2Player 소비. 기존 default p/facing 원값 유지 |
| loader / 공개 QA | native bridge query thorn-volley-first, QA query thorn-volley-first2 / 옵션 thornVolley:true. aria 드루이드 나무가시 공격 QA, leaf title DARK DRUID · 나무가시. 기본 main/old revision 분기를 새기본으로 전환하지 않는다 |
| camera bounds / player 접촉 | 적대 thorn camera envelope radius physical33/magic31worldpx. pool.r5.2와 player 접촉 base=P.r+7.2·기본 gate=P.r+11.2는 별도 값이다. 기존 Q/E 확장·현재/이전 P/shot 선분 sweep·actor/projectile 좌표 유지, camera 여백으로 collision 확대0 |
| 새 기술 검사 | pose 신규3/3 최초 PASS. ROOT7고유그룹 최종 PASS: 최초5/6에서 scope harness1실패 수리, GPU face 관련2그룹 재확인, 신규 wind-aim1 추가. 전체7/7 최초 PASS라고 기록하지 않는다. old suite 재실행0 |
| 실제 단계 관측 | final-poses step8/17/18/26/38에서 각각 wind10/wind1/recover45/recover13/recover1. step18에서12발 physical8/magic4, 실제 atk46→physical59/magic118. 선행 본체 native fade는8step 뒤 visible. source key/FPS와 native step 관측을 구분한다 |
| 공개 E / Q 범위 | E physicalProjectile/druidStraight native-parry1과 friendly guided blue를 실제 확인. 다른 E magic callback은 기존 조건부 소비이며 Q 성공으로 세지 않는다. Q pressKey 약1ms tap 성공0; hold는 지원 CDP Input 불가로 미시험, actor/input 상태주입0 |
| 정상속도·강제 fan | normal-speed-forced:114 fullframes/record5095ms, 공개 force pattern. playerHP521→125.59375/pStun, bossHP21017 alive/shield17744, E/Q 성공0. 정상속도여도 강제 pattern을 자연 AI fan 성공으로 확대하지 않는다 |
| 자연 native AI | native-ai:172 fullframes/record7037ms, AI 시작/강제 pattern0. HP595→0/fallen, bossHP21017 alive/shield18881. 자연 beanStorm/groundFissure/charge/slam/slashCombo 관측, fan0/new thorn0/EQ0. 이 run의 무관측이며 전체 AI의 fan 미지원으로 확대0 |
| 실제 저장 / 오류 | 두 run runtimeexception0. 공개 자기 설정 save write1, reopen own read1/write0·config {distance340,pattern:fan,phase0,scale:.5} 복원. 전투 actor snapshot 저장0·HP3000 fixture0·actor console writes0. 전체 network/404 무오류 주장0 |
| 최종 관측 / 정본 | VISUAL RETOUCH / 정확 잔여1 THORN_VOLLEY_COMBAT_ACCEPTANCE: 실전 가독성·Q hold 성공·자연 AI fan 관측 미인수. 실제 E 부분 성공/신규 기술 PASS를 전체 전투·엔진 완료 PASS로 확대0. 정확 GIF 파생 duration/경로·전체 실제 verdict/§23는 새 정본 참조 |

정본: [다크드루이드 가시 일제발사 첫 사본](../engine/FDG_DARK_DRUID_THORN_VOLLEY_FIRST.md).
<!-- DARK_DRUID_THORN_FIRST_APPENDIX_END -->


### 2026-10-13 · 정확 CH1 etype4/ice/soul_flame 이식 범위

| 원 AI / 시계 | 정확 ice consumer 계약 / 제한 |
|---|---|
| 지정 개체 | order8/`ch1_initial_009`/etype4/ice2/`soul_flame` 한 개체. source337/raw flags·seed·좌표·순서 불변, 모든 type4/ice/skin 등록 선언 아님 |
| alert / common 추적 | idle/recover·d<800·LOS로 alert. 원에 없는50~100 무조건 alert를 추가하지 않음. range400은 AI 분류이며 alerted d>30 flow추적의 이동 cutoff가 아님 |
| 원 위치 / 속도 / idle | spawn4191.995760537684,340 / speed.32862369619309906px/native60tick / idle44.74301584530622. 일반 idle 추가 movement×1.6; source 양축→X→Y fallback·방향 캐시/stuck시간을 새 정확 actor에서 소비 |
| 얼음 발사 시계 | 원projT294.2270742729306/cd240·d<400·idle의60tick charge; local295 시작→354 charge1→355 waterBean 발사. committed charge는 미alert far400 반환보다 먼저 진행. raw37→magic74/ice2이며 다른 RNG bean 선택을 추정 추가하지 않음 |
| 접촉 / 빙결 분리 | 일반 접촉 raw24/phys·cooldown40~59·r+Player.r+8. 원 `_iceOnHit=false` 보존. 물 탄두만 max60 냉기감속을 직접 피해 다음 별도 요청하며 전용 얼음 근접 AI를 만들지 않음 |
| path / clock / 검수 | 원8방향 escape·전체 globalFlow/cache·phase/culling/RNG parity는 미검증. headless 명시 메서드·자동 physics fixture·공개 입력·pixels/perf를 합산하지 않으며 결과는 [이번 ice 정본](../engine/FDG_GODOT_ETYPE4_ICE_SOUL_FLAME_20261013.md) 참조. 현재 인간 앱 새source 미로드·VISUAL RETOUCH |

### 2026-10-13 · 정확 CH1 etype4/physical/spine_beast 이식 범위

| 원 기본 AI / 이동 | 현행 source / 새 소비 구분 |
|---|---|
| 자동 alert | 일반 idle/recover·거리800미만·LOS가 조건이다. 과거 표의50~100 근접 자동 alert는 현재 브라우저/canonical source에 없으며 Godot에 추가하지 않는다 |
| 추적 / 발사 거리 | 단거리 분류 `ETYPE_RANGE[4]=400`은 이동 cutoff가 아니다. alerted idle/recover에 d>30이면400밖에서도 flow추적. 발사 준비만 d<400이며 idle 추가 speed×1.6 이동과 구분 |
| 원 flow 축 선택 | `_ffMoveE`는 양축 canMv → 막히면 X만 → 또 막히면 Y만; 성공한 방향 `_lastFdx/_lastFdy`를 저장하고 `_stuckT=0`. 현재 Godot의 실제 소비/신규 경계 검사는 [척추 괴수 정본](../engine/FDG_GODOT_ETYPE4_PHYSICAL_SPINE_BEAST_20261013.md)의 최종 결과를 따른다 |
| 원 추가 path 처리 | 양축/X/Y 모두 막힌 뒤 원본의8방향 escape·오래 막힘에 따른 우회 확장·전체flow 생성/culling/RNG는 별도 원source 시스템이다. 축 fallback 기술 검사를 전체 pathfinding/AI 동일성으로 확대하지 않는다 |
| snapshot / 공개 | 원16record와원숫자/배치/모델은 그대로 소비하고 새 exacttype4한개체만 등록한다. 현재 인간 앱에 새source를 소급하지 않으며 공개 움직임·시각·Windows240은 미검수 |

## 2026-10-16 R h158+h379 일반 근접 전조 읽기 연결

현행 AI의 windup/st2 계약은 유지한다. 기존 일반❗ 표시가 별도 _atkWindup 필드를 보던 한 소비처를 원 R reader에 연결하며 실제 공격 스케줄·잔여시간은 변경하지 않는다.

| 항목 | 현재 main 계약 |
|---|---|
| 소유 | 원 R h158 _enemyWindupRemaining(e) 순수 reader와 h379 draw의 일반 근접❗ 조건 한 곳만 연결 |
| reader | e가 존재하고 alive·!ib·s==='windup'이며 stunned/_frozen/_hitStun이 양수가 아닐 때 finite st2의 max(0,st2), 그 외0. actor/AI/timer를 쓰지 않음 |
| 표시 조건 | 기존 e._atkWindup>0 대신 _enemyWindupRemaining(e)>0. 실제 AI의 windup/st2를 읽으며 기존 ❗/X 설정·e.x,e.y-e.r-8 좌표·nativebillboard push→try/finally→pop 본문 유지 |
| 제외 | 별도 _fdgGhoulBillboard 조건·snapshot·다른 전조·actorbody/GL·AI 상태·피해/RNG/QE 변경 없음. 새 변환/default·시간/행동 권위·ticket 구현/연결 없음 |
| 검증 범위 | 실제 reader+해당 if를 frozen own enemy·Canvas/native 대역으로 새5그룹/main inline1 확인. 실제 AI/timer/HP/자원·Canvas/GPU·글리프·실전조/visual·창/saveAPI·Native·PC 실행/검수 아님 |


## 2026-10-17 현재 방어구 속성 배율의 실제 entry 소비 연결

| id / 항목 | 현행 계약 |
|---|---|
| 1 / 기능 / 제품 | NATIVE-ARMOR-ELEMENT-CONSUMER-20261017. 제품 변경은 main.gd와 player.gd 두 파일만. 상성 producer·탄·HP/패링/poise 구현은 변경하지 않는다. |
| 2 / 정상 연결 | Main._ready의 world.set_player 뒤에 Player.bind_native_armor_inventory(Callable(source_state, read_current_inventory))를 연결한다. 실패하면 기존 _stop_source_player_startup 경로로 중단한다. source State/INV를 새로 만들거나 복원하지 않는다. |
| 3 / 원 상수 | EL P=0/F=1/I=2/D=3/L=4/H=5/E=6. F→I, I→F, D→L, L→D, D→H, H→D, E→L, L→E는2. 동일 속성은 P0 제외0.5, 나머지는1. 기존 원 elMul/producer 분기·수치 변경0. |
| 4 / 현재 완료 범위 | 실제 제품 entry의 SourceState→Player→기존 projectile 배율 consumer 연결까지. full inventory/equip UI·affix·저장/장비복원·보상·전체 bootstrap·모든 탄/보스·시각/청감·240FPS·최신 전체게임 완료는 아니다. 기존 HOLD/2_3·MAP/ART/STORY/rig/native3387/NativeHUD 등 보호 불변. |


## 2026-10-17 exact type0 현재 필드 소유자 후속

| 항목 | 현재 코드 / 검수 범위 |
|---|---|
| `ch1_initial_015 / order14 / etype0 / physical` | 실제 `enemy_melee_flesh_crawler.gd`의 `st2` canonical / `_contact_ticks` alias, `mhp` canonical / `max_hp` alias, source numeric `el` / `element` 이름 alias를 같은 actor 수명으로 통합. 별도 타이머·spawn record current 대체0 |
| 공개 source field prefix | World의 current same-Node invocation→source `events` 순서의 known shield/alert/recover-st2/HP/hit field write. 기존 `receive_damage` 재호출·doublemath0. 미소유 status/poise/KB/owner request/presentation/kill에서 exact partial. `full_hurtE_ready=false/source_clock_ready=false` |
| 첫 새 검사 | 21/21 PASS·exit0·양 로그 ERROR/WARN/leak0. actual actor methods의 렌더 setup/_draw 억제·projectile 및 기타 World 대역 fixture; full Main·source acc/RNG·실전/전체 최신/시각 PASS 아님. 이전 frozen 검수 재연0 |
| 정본 | [일반 몬스터 필드 소유자](../engine/FDG_NATIVE_NORMAL_ENEMY_FIELD_OWNER_20261017.md). 원 snapshot/support/runtime 및 옛 배송·미이식 이력은 보존하며 이 표는 새 field API만 갱신 |


## 2026-10-17 일반 type0 동기 poise 실제 owner 후속

| 항목 | 현재 구현 / 검수 범위 |
|---|---|
| exact actor / callback | `ch1_initial_015/order14/type0/physical`의 World current invocation→v3 `poise_hit(call)`42490→parent prefix→같은 실제 poise/regen/stun/max-stun→fresh view |
| nonbreak / break | source false 반환은 owner `ok=true/staggered=false`로 보존. break는 실제 core(poise0·stunned/maxStunned180) 적용 후 현재 `_uqScCtx`19985 미소유에서 partial/함수return未. parent4cursor와별도core적용을구분 |
| 수명 / 경계 | 기존 deferred pending 보존·재사용0. native 같은 stun/regen counter를 소비하나 source acc/regen 전체동등未; fullhurtE/source_clock_ready=false. unique/SFX/slowMo/14RNG/kill·다른 actor·Q/E/BOSS 연결완료 아님 |
| 새 영향 검수 | 첫새poise21 PASS/양로그clean→분기guard교정뒤새영향2 PASS/양로그clean. 앞field21·37/24/29·parse·수송 재연0; final전체suite단일재실행 증거아님 |
| 상세 정본 | [동기 포이즈 소유자](../engine/FDG_NATIVE_NORMAL_ENEMY_SYNC_POISE_20261017.md). 이전 미소유/배송/검수 이력은 보존 |


## 2026-10-17 exact type0 source momentum owner 후속

| 항목 | 현재 구현 / 제한 |
|---|---|
| `enemy.kb_add / 42482` | 같은 World/current same-Node invocation/events순서로 producer의 계산된 `{x,y}` 증분을 actual `_knockback`에더하고 `owner_requests/events`각1증가. 피해/KB공식·배율·15cap·감쇠/clock 재계산0 |
| 수명 / 미완 | Node/World수명은검증하고새alivegate없음. `42483 offscreen_move_if_can_move`는정확NR, geometry/좌표실행0. fullhurtE/source_clock_ready=false, poise19985 tail·실전·현재실행본반영未 |
| 새 검수 | 첫type추론compile실패/기능검사0/exit0을PASS로세지않음→Vector2선언1줄수리→새KB15/15 PASS·양로그clean. 앞field21/poise21+2/37/24/29/parse/성공수송재연0 |
| 정본 | [일반 몬스터 KB 소유자](../engine/FDG_NATIVE_NORMAL_ENEMY_KB_OWNER_20261017.md). 앞 field/poise 및 배송/검수 이력을 보존하며 exact momentum 요청 범위만 갱신 |
