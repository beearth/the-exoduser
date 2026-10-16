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

# FDG Godot etype7 물리 살덩이 기어가는 자 — 제작 대기 정본 · 2026-10-13

<!-- fdg-godot-type7-teleport-20261013:begin -->
## Type7 텔레포트 의존성 실제 소비 · 2026-10-13

| 항목 | 현재 구현 / 경계 |
|---|---|
| 이번 실제 소비 | `native_type7_teleport.gd` / `type7_teleport.json`(`exoduser.godot.native-type7-teleport.v1`) / Player 공개 KB leaf8행 / 원TP4 / 신규 고유4기술PASS. standalone controller이며 실제 etype7 actor·factory 등록0. source 지원6/미10·동결 배송5/미11 유지. |
| 원 native 순서 | idle에서 teleportT111.58698863349855·summonT157.41148072760552 감소→기존 warning 진행/완료→else 거리<100 및 teleportT≤0에서 P+polar(U×2π,150+U×50) 제안→can_move(r22.73476334709674) 성공 warning120/생성update 감소0, 실패timer30→마지막 summon_due. cooldown175.49626126885414. eSummon/recover·source guard 중 warning 정지. |
| 초기 episode 경계 | 실제 메서드 진행으로112프레임 warning 진입·158에서 summon_due/warning74 관측. mandatory summon/channel/recover는 미이식이며 이 raw episode를 자연 TP 완료로 쓰지 않음. 별도 constructor completion context와 live field setter를 구분. |
| 착지 / KB | 완료 시can_move 재검사; 실패여부와 무관하게 caller cooldown reset/후속 eProjAt 예약. 성공 시 source 이동좌표에서 strict 거리<(r+10)×2+Pr, baseline r65.46952669419348+Pr15=80.46952669419348; !ib/iframe≤0/state≠literalcharge. 원 physical 요청trunc40×10.5×elementMultiplier, baseline420→기존receive_damage(420,"phys")→선택M30 onhit 효과없음→radial(target→P)×120을 기본KB에독립가산. 실측 HP350→236, 기본KB+(120,0). 피해수락bool gate·extra120으로기본KB교체0. |
| 현재 검사 / 시각 | 고유4PASS=첫3PASS+실패queue1후속PASS. 첫전체 exit1/2.338453417s/assert2→해당queue만 exit0/.664766792s/assert0. 코드수리0(검사중), 성공3/oldsuite/import 재실행0. public교전·actual pixels·최저1080p240 검수0, VISUAL VERDICT: RETOUCH. |
| 두 packet | 기존common physical32/life240/size3/contactmargin13 대 TP후queued physical48/life300/size4/radius5.2/contactmargin16. eProjAt life200→trunc×1.5=300, idle beanRoll EL.P의 dmgM1.2가 요청.8을우선. 실제기존physical/redBean/burn 소비클래스로발사, burn 요청96. 공통 자연 chargeFSM/옛 sharedkernel 전체parity 재검0. |
| warning / 취소 | 60틱 warning은 같은globalupdate sp1 뒤59. birth aim/heading 고정, release origin=저장mouth+현재owner변위; angle0의 mouth는 source facingfallback. 동일 owner/frame/world/el/blackBean/parryClass grouping·lane당r+8. Array/Dictionary token은is_same 객체identity; 내용만같은새instance도취소. 죽음/stun/freeze/world교체 취소·hitstun/비idle만으로취소0. born뒤owner독립. |
| 출생 시계 adapter | 기존configure에는localOrigin=world.to_local(globalOrigin), birth_frame=actual_release_frame−birth_source_ticks. 실제global birth metadata 보존→자동physics off/world등록→원release phase1회 explicit _physics_process→deferredauto enable. prephase frame59/life300→sp1 bornframe60/life299.333/거리5.00000286→실auto16뒤frame76/life288.661. privateclock/observer 보정·같은phase중복0. |
| 원 physical charge cue | 현재owner중심/w.r+10·p=clamp(1−t/60): 검정#080808 fullring width5/alpha.28→백색#fff progress arc width6/alpha1/start−π/2/roundcap. now/aim/pulse/cull 변조0. label 물리탄 차징 · E로 패링 / Noto bold13 / 높이20 / 측정폭+14 / offset−r−25 / outline#f4f4f4. 원큐cue이며 폐기TP prewarningcircle 새추가0; 원label을 실제Godot fullE/Qparry 구현증거로 쓰지 않음. |
| 원 이미지4 | res://assets/vfx/teleport_out.png4018B/64², teleport_in.png3362B/64², tp_impact.png70004B/401²/2×2 cell200²/4frame(right·bottom1unused), teleport_burst.png31488B/576×64/9×1/cell64²/9frame. 첫 source4/dest4 hash·byte동일copy 합108872B; 원변형/새이미지0. |
| creation snapshot 유지 | 이전 pending JSON/source-audit의runtimeNULL/admittedfalse/consumerfalse/6asset 부재표는그생성시점기록이다. 현재 TP·landing·KB·queued탄/원4 rendering standalone소비·신규4기술PASS가존재하지만 실제parentcaller/소환/등록은여전히0. 이전frozen metadata·M30완료정본/receipt 재작성·재검·재통지0. |

전체 source 수식/API/검사 ledger는 [현재 TP 정본](FDG_GODOT_TYPE7_TELEPORT_20261013.md)을 따른다. real parent `600e7269150a61b4b0f93e2f05ce64a8d9cec69c`, authority `9a4534b42f74093095ebc3364a25dd104e93b379`. 현재 표를 우선하고 이전 legacy/creation/배송 단위는 그 시점 역사로 보존한다.
<!-- fdg-godot-type7-teleport-20261013:end -->


<!-- fdg-godot-m30-epicenter-20261013:begin -->
## M30 의존성 현재 진척 추가 — etype7 등록은 계속 대기 · 2026-10-13

| 항목 | 현재 구현 / 경계 |
|---|---|
| 실제 산출물 | `native_m30_modifier.gd` + `m30_burst.json`(`exoduser.godot.native-M30-burst.v1`) + 기존 원Texture2D 2개 + 신규 기술검사/정본. `ExoduserM30Modifier`는 호출자 전달 시계를 소비하는 standalone 커널이며 실제 admitted actor 연결0. |
| M30 현재 값 | 진원 충격파 / ATK40 / owner 유효·mods 비어 있지 않은 native 호출에서 `eliteBusy=max(0,eliteBusy−ticks)`; 그 뒤 M30∈mods·거리<800일 때만 `eliteRing+=ticks`. ≥480·자신의 busy≤0에서 busy54/ring0. 고정 target 좌표 burst r125/t=dur54는 생성 update에서 sp1 소비 후53. |
| 만료 피해 | zone t≤0 때 거리≤125(`P.r` 미추가)·iframe≤0·literal state≠`charge`이면 `max(1,trunc(40×.65))=26`, `magic`. 원소 상성 배율 미적용·별도 KB 요청0; 실제 `receive_damage(26,"magic")` 2인자로 기존 기본 KB를 보존. 이후 hit 여부와 별개로 원 lava 생성/zone 삭제. |
| 지원 집계 | 현행 source16의 **지원6/미이식10** 유지. 동결 Web/Windows 배송본은 **5/11**. etype7 자연 생성·소환·순간이동 등록0. 커널 하나를 지원 actor 추가로 집계하지 않음. |
| 검사 / 상태 | 새 **고유4 technical PASS** = 첫3PASS + 실패한 피해fixture만 1FAIL→1FAIL→1PASS. 성공3 재실행0·기존 suite 반복0. 현재 public 교전/pixel/최저1080p240 검수0, **VISUAL VERDICT: RETOUCH**. |
| 구현 진척 | 이 문서 생성 당시 M30/PNG absent/consumerfalse는 927fa91 제작 대기 시점 기록이다. 현재 별도 M30 커널·원Texture2D2·고유 기술4PASS가 존재하며 **M30 자체 소비는 구현**됐다. etype7 owner의 실제 guard/tiering/modT 연결·자연 교전 소비는 여전히0. |
| 원 creation metadata | `etype7_physical_flesh_crawler.json`(45503B/SHA c0c2e22b393e27557bc2aeb943827e0f4a6a79a2837f597a95027ddc885a0c60) 및 frozen source-contract-audit/7 dependency rows를 재작성·재검하지 않는다. `runtime=NULL/admitted=false` 유지. 파일 생성 당시 asset metadata는 당시 snapshot이고 현재 M30 추가를 설명하는 정본은 이 현재 블록/새 M30 SSOT다. |
| 남은 parent 의존성 | mandatory summon40→type3 child1~2/랜덤속성/elite0or1/원coords skin/HP×.5/shield0/poise보존, TP120/landing420 및 독립 post-hurt KB120/queuedphysical48 대 normal32. 단순 M30 추가로 parent 소환을 생략하거나 등록하지 않음. |
| 첫 자원 소비 | 원본2 첫 copy/hash와 목적지2 첫 hash: byte동일 합3163062B. 격리 최초 import exit0/6.978891833s/actual2(pentagram/lava), 기존 body/water/lightning reimport0; old converted cache10file/sidecar3 재사용은 input reuse. 재import0·원 PNG 수정/신규 이미지 생성0. |

정확 전체 수식·API·신규 실행 이력은 [M30 현재 정본](FDG_GODOT_M30_EPICENTER_20261013.md)에 기록한다. source 권위 revision `9a4534b42f74093095ebc3364a25dd104e93b379`, real parent `927fa91ec77bb8c54698e270ce57b50aea11fb45`. 이전 구현/배송/creation 시점의 기록은 역사로 보존하며 현재 상태는 이 표를 우선한다.
<!-- fdg-godot-m30-epicenter-20261013:end -->


## 현재 판정 / 실제 산출물

정확 frozen record `ch1_initial_004 / order3 / etype7 / physical0 / flesh_crawler / elite1 / mods[M30]`의 원본 계약을 확정했다. 논리 type은 현자형 사도(리치), 스킨은 살덩이 기어가는 자이며 record.name=`native etype 7`은 재명명하지 않는다. 현재 제품 actor GO는 **0**이다. 자연 소환의 type3 동적 factory/AI·6속성/정예 modifier, M30 owner-local zone/VFX, 착지 hurtP 이후 독립 KB120이 필수이며 부분 구현이나 원특성 삭제로 인수하지 않는다.

| 항목 | 현재 정확 상태 |
|---|---|
| real parent / 백업 | `a4926ed527f14a7f66d0cdcb1db3772a5617c870`. C/backup-before-production/manifest.json: docs15경로/WORK+HEAD30copies. C/new-owned-path-absence.json: 새 actor/data/test/SSOT4path WORK·HEAD 부재. foreign tracked WORK37 보존 |
| 현재 지원 | 앞선 동결 단위의 source6지원/미이식10 유지. 이번fresh실행0이며 기존증거재공지/재검0. type7 추가 후 목표7/9는 미달·승격0. frozen Web/Windows 배송본5지원/미11 유지 |
| 원 snapshot | source16·native_factory/native_final337·source support.runtime_supported=false/runtime=null 보존. 새 동적 자식 snapshot은 생성하지 않았으며 원 목록 재실행/추출/해시0 |
| 코드외 산출물 | source-contract-audit.json과 **godot/data/etype7_physical_flesh_crawler.json45503B/SHA `c0c2e22b393e27557bc2aeb943827e0f4a6a79a2837f597a95027ddc885a0c60`**, schema exoduser.godot.etype7-physical-flesh-crawler.pending.v1. runtime=NULL/admitted=false는 명세의 선언이며 factory 읽기연결0·등록코드변경0·registration gate구현0. configure 가능한 runtime·실 actor/AI가 아님 |
| 구현 / 검사 | 새 actor제품/factory승격0, 신규 test파일 저장0·의미검사0·PASS0. 이전 성공검사 재실행0. 아래3~4그룹은 미래 TODO만 |
| 자원 | source TP/M306PNG가 canonical에 존재하고 Godot에는 부재. stat/IHDR metadata3271934B만 확인; 새PNGcopy/hash/decoder/import0. 기존body17/sharedmouth/water자원 재검수0 |
| 공개 / 시간 | 기존 Mac 앱/browser31/Web34/Windows·서버3333/3334 조작0. 실제 새 소비·공개pixel/교전/240FPS 검수0. native60/Compatibility/render240 기존설정 불변 |
| 인수 상태 | **DEPENDENCY READINESS: FAIL / PRODUCT GO: 0**. 기술 검사 FAIL 결과가 아니라 필수 consumer 부재의 정적 인수 판정. **VISUAL VERDICT: RETOUCH** |

pending JSON은 부모가 metadata/schema/runtime/admitted와 actor/test 부재만 확인한 코드외 산출물이다. C/owned-production-pending-ready-receipt.json 및 owned-production-pending-one-leaf.diff를 따른다. consumer 실행·게임 검사 결과가 아니다. 최초 scope.json의 visual_verdict=NOT_REVIEWED는 그대로 보존하며, 이 전체 제작대기 단위의 §23 verdict=RETOUCH(시각미검수)와 별개다.

C는 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/encounter-etype7-first`이다. 이 worker 소유는 새 SSOT와 C/tests/receipts뿐이며 새test는 이번에 작성하지 않는다. 부모는 data JSON·공통 docs·정상 checkpoint, source auditor는 원계약, 제품 담당은 승인 전 actor 구현0을 유지한다. 타인의 source·수치·WIP를 되돌리지 않는다.

## 읽기 기준 / 권위 / version 구분

| 기준 | 적용 / 경계 |
|---|---|
| 공격·몬스터 문서 | `8.0몬스터디자인/몬스터_공격시스템.md`와 `몬스터_총관리.md`의 리치/정예·탄막·순간이동 기준을 먼저 읽었다. 스킨 flesh_crawler가 etype0 AI라는 뜻이 아님 |
| AI / skin 문서 | `9적ai패턴디자인/9_적AI패턴디자인.md`의 원120전조와 원오버레이 폐기, `5.0애니메이션파이프라인/몬스터_스킨_시스템.md`의 현cell6/row0·8dir/4walk를 적용 |
| 맵 제작 기준 | `EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md`1047행 전체를 읽었다. 기존 MASTER→LARGE→MEDIUM→GROUND→PLAYABLE→LANDMARK→DETAIL→CAMERA→TECH 순서/§23/기술·시각 분리를 유지. 새geometry/배치/맵 GATE 승격0 |
| final source packet | C/source-contract-audit.json39838B/SHA `8916293092d23d418c58e79cbbb6742370d3cb5ccae805b2313548da490ac8b4`, schema exoduser.native.etype7.physical-flesh-crawler-m30.source-audit.v1, pending_source_values=[] |
| canonical source | migration R/game.html·부모권위 revision `9a4534b42f74093095ebc3364a25dd104e93b379`. 이 worker revision 재조회/원source 재해시0. 아래 R줄번호는 source packet의 code 위치 |
| 착지 문서 version | 기존 문서의 atk×21·순간이동 직후1발 표현은 그 문서 version의 기록. 이번 canonical R20472는 ×10.5, R39529→eProjAt는 추가60warning 후 탄생. 값/순서를 섞어 고치거나 기존 역사본문 재작성0 |
| 미래 dynamic flags | 자식의 실제 elite/mod/수치/skin은 유효spawn과 미래 RNG에 의존. 미생성이라는 사실은 source 수치가 불명인 상태와 다르며 synthetic snapshot/elite0고정/physical고정0 |

## 정확 frozen 개체 / 정예와 escort 후처리

| leaf / 단계 | 원값 / 의미 |
|---|---|
| identity / spawn | order3/ch1_initial_004/gate-escort/stage0/Lv1/NORMAL/type7/physical0/flesh_crawler. requested=actualspawn `[4075,340]`, room−1/ibfalse |
| HP와 방어 값 | native factory hp=mhp1751→escort post `trunc(mhp×2.5)`로 hp=mhp4377. eShield=eShieldMax1751·poise=maxPoise1751은 재계산하지 않음 |
| 정예1 원 적용 | HP×2/ATK×1.3/radius×1.08/projCd×.8/drop bonus.5/mod count1. raw 실제 M30/elite1/auraNULL 보존; 정예속성 제거0 |
| ATK / radius / speed | atk=baseAtk40 / r22.73476334709674 / speed=baseSpd.39137590795755384px/native tick / native60 |
| 기본 시계 | idle38.56643340084702/facing.547886661861489/spawnFade20/projT292.3163157328963/projCd192 |
| teleport / summon 시계 | teleportT111.58698863349855/cd175.49626126885414, summonT157.41148072760552/cd250.14942525886 |
| 초기 warning / flags | tpWarnT0/tpWarnMax30/X0/Y0/col#aa00ff; 실제진입시Max120. alive true/stunned0/kb(0,0)/s idle/modT의시간0·false. firstShotfalse/iceOnHitfalse/iceFreeze0/eRes7개0 |
| shield / poise source | eShield먼저흡수→remaining HP피해만 hitStun/KB/opt-inpoise. fullblock은해당경로0. hitStun8/poisebreak180/regen200마다floor1751×.15=262·poiseRreset0. shieldregenT0만있고새재생consumer발명0 |
| undead / revive | type7은undead registry미포함/type4 bonus차용0. 일반revive는 !ib/!revived/!ghoul·elite1 Lv1 revPow.5−antiRevive−holyPrison, positive때roll/120timer·halfghoul/halfnativeform. 이번 fullrevive parity 감사/구현0 |
| RNG 원 metadata | factory_random_seed1627645019 / rng_begin32→rng_end46. 원16 snapshot만참조하며 전체boot/global RNG stream replay0 |

## type7 이동 / 순간이동 / 착지 필수 계약

| source 지점 / 단계 | 정확 값 / 순서 / 구현 상태 |
|---|---|
| common alert / 첫이동 | idle/recover·d<800·LOS로persistentalert. currentP facing을먼저갱신. range800: d>680 flow×1, d<520&&d>30 후퇴×.5(point isW), 이후d재계산 |
| 두 번째 idle이동 | type7 idle d<80 후퇴×.6/d>200 전진×1.2(canMv radius). idle×1.6 적용0·이후d재계산0. both→X→Y flowfallback/이웃r×4.4·최소r+neighbor.r+4/force1.5/cd3 원참조. fulltiered/culling scheduler parity0 |
| guards / 접촉 | hit-stun/stun/ice guard가먼저, M30은nonalerted far-return전. type7 natural contactdamage=NULL. 조건부melee attack8/crossing5/recover35를독립탄발사자동FSM으로추가0·신규attackticket0 |
| R39522..39542 idle 순서 | teleportT−=ticks와summonT−=ticks→기존tpWarn감소/완료→else d<100&&teleportT≤0면목표제안→마지막summon상태진입. eSummon/recover동안tpWarn/두idle시계정지 |
| warning 생성 | P주변각U[0,2π)/거리150+U[0,50). canMv(r22.73476334709674)성공시T=Max120/col#8833cc/고정target. 생성update에는120감소0·후속idle부터. 실패시teleportT30 |
| warning 렌더 | 원 본체원/도착점원/착지원 오버레이폐기. VFX미준비를새원으로대체0. 경고target을P이동에재조준하지않음 |
| completion | teleportE가canMv(radius)재검사. true/false와무관하게caller가timerreset 후eProjAt를호출(반환값검사0). 유효좌표/실world정본을보존하고검사fixture로위치성공주입0 |
| R20468..20475 landing | 거리 `< (r+10)×2+P.r`: 기본landR65.46952669419348/Pr15포함80.46952669419348. !ib/iframes≤0/P.s!=literalcharge. request=trunc40×10.5×physicalElementMultiplier, baseline420/defaultphys/hurtP opts없음 |
| landing side effect 순서 | hurtP→eModHitP→radial(target→P)KB120을기존P.kb에추가. exactM30은on-hitmodifier가아님. outer gate 진입뒤 내부hurtP거절과KB120은독립이며ordinaryhurtP의KB도보존해야함 |
| 필수 API gap | 현행NativePlayer의receive_damage optionalpacketstrength는acceptedhurtP gate내부이며독립KB120을표현하지못함. strength120로ordinaryKB를교체하거나HP/iframe예외를삭제하는대체0. 새public posthurt additiveKB sink가없으므로consumer미준비 |
| TP procedural bolt | renderstep12·6+trunc(U×4)segments/내부perp20+U×15·randomsign. drawP sp=(slowMo?.35:1)×dtSp, alpha1−(t/12)²/glowwidth8+sin(now×.5)×2/glowalpha×.35/whitewidth2+alpha×2/whitealpha×.8. 별도physics60 clock으로치환0 |

## 공통탄과 순간이동 후 queued탄 — 별개 caller

| 경로 | source 입력 / 소비 / 의존성 |
|---|---|
| common independentcharge | projT292.3163157328963은sp1 eligibleidle293번째에cross, d<800/비차징때192reset→60charge. aim은발사시currentP, origin은actor center. 상태/recover35 할당0 |
| common physical packet | floor40×.8=32 / 입력sz1.5/speed3/life240/commit. global×2와redBean×.5후damage32/sz3/r5.2/redBean/homing/parryClassphysical/dtypeparry/life240. baselineburntotal64 |
| landing eProjAt 입력 | mouth=e center+facing×r×.7(ang||facingfallback). call speed3/.8/EL.P/life200/col#8833cc/sz2지만beanRoll의physical dmgM1.2/speed×1.3이요청.8을덮음 |
| landing queued packet | damage48/life200×1.5=300/sz4/r5.2/redBean/homing/parryClassphysical/dtypeparry. common32/life240 alias아님. baselineburntotal96 |
| landing 추가 warning | duration60·landing시고정aim. 실제releaseorigin=저장mouth+owner의그후변위. 같은globalupdate후warningloop가실행돼sp1 생성끝59. aliveowner death/stun/freeze 또는world identity변경취소·hit-stun취소0. 탄생뒤owner독립 |
| sharedphysical kernel참조 | speed300px/s=5/native tick·homing.00109083rad/tick/life>30·decay.667·camera>2500recycle·redBean만료종료(nonredlife1연장미적용). 기존protectedQ/E/blackBean설계변경0·Nativefullparry이식완료주장0 |
| sharedhit/status참조 | packetKB heading×2는hurtP acceptednonDOT경로. redBean outerhit뒤burnappend는내부hurtP거절과독립: cap10/no-refresh·total=request×2/t600/interval30/divisor20/expiry-before-pulse·idle19. 완료된kernel전체검사반복0 |
| sharedmouth art | 기존res://assets/enemy/proj_phys_mouth.png cell768×384/flightrow0·8frames. sz3/4둘다상한size5.6→draw135.828×67.914/headingrotation/alpha1·frame((gameFrame>>2)+trunc(x×.03))mod8. bite row1/6frames/48gameFrames/max3은원참조·새asset검수0 |

## M30 진원 충격파 — 필수 owner-local consumer

| leaf / source | 정확 원값 / 의존성 |
|---|---|
| 원 modifier | M30 유지. M13 teleportmodifier/염색탄/on-hitstatus/빈mods로대체0. source R39400..39411·stun/hitstun/iceguard뒤/farreturn전 |
| accumulate / busy | modsM30&&d<800일때eliteRing+=ticks, ≥480&&ownerbusy≤0면claim54/eliteRing0. _tickEliteAttackLock은max0,busy−ticks를먼저소비. **해당owner만의busy54**, globalattackticket pool/동시공격제한0 |
| zone birth / clock | 당시P좌표고정/kindburst/r125/t=dur54/col#ff2438. 생성sameupdate zone loop가감소하므로sp1 bornend53. ownerupdateE의AIguards/tiering에시간이묶이며독립global hazardclock으로바꾸지않음 |
| expiry / damage | t≤0때한번hit/VFX후zone삭제. distance(P,z)≤125(Pr미추가), iframes≤0/P.s!=literalcharge. max1,trunc40×.65=26/magic. 원소 배율을 적용하지 않으며 추가manualKB없음 |
| warning | full redpentagram texture +source procedural circular q/head/pulse/spin/fill·outer/progressrings/ticks/diamond 모두필수. texture-only/새단색원으로대체0 |
| actual lava | lava_erupt9frames(다른boss_lava_erupt24아님). size=min125×2.5,360=312.5/좌표z.x,z.y−78.125/scale.4069010416666667/angle0/isSkillfalse/baseAlpha.85 |
| lava renderclock | frameTime5/9frames·renderdtSp의singleincrement/reset→sp1 nominal45. alpha.85×(1−.3×frame/9). ownerwarning54와별개이며9×5를정확physics45 종료보장으로승격0. 생성VFX는global독립list |
| 현재 gap | M30 localbusy/zone/damage/원warning/실lava consumer와필수PNG미준비. modifier삭제/ownerzone생략/범용tanColor로통과시킬수없으므로type7admission미승인 |

## 자연 소환 / dynamic type3 의존성 — 생략 금지

| source 단계 | 정확 계약 / 미구현 범위 |
|---|---|
| idle trigger | summonT157.41148072760552/cd250.14942525886·idleonly. ≤0때shQuery200내owner제외/실거리<200인모든entry를count(insidealive명시filter없음). nearby<4면eSummon40, ≥4면summonT60 |
| channel / warning | eSummon동안movement branch없음·idle/recoverrange단계미적용. type7tpWarn은eSummon중정지. timer성공을forcedstate/clockskip으로검사하지않음 |
| child count / position | count=1+trunc(U×2)→1또는2. angle2π×i/count+U[0,1), distance30+U[0,20). 각child별원RNG호출순서보존 |
| 랜덤6속성 정확집합 | **P/F/I/D/L/H** =physical/fire/ice/dark/lightning/holy. earth를포함하거나physical만강제하지않음. 각자독립균등선택 |
| actualfactory | mkEn(sx,sy,currentStage,3,false,childElement,parent.room). canMv10→safePt10보정또는null; 원caller는ne의nullguard없이후처리하므로inventedNaN/새spawnshaping대체0 |
| stage0 정예 / mods | magicprobability.03/rare0/champion0→elite0또는1. elite1의한attackmod는M29또는M30, auraNULL. 정예0/빈mods로고정하지않음 |
| child postprocess | hp=trunc(nativeHP×.5)/mhp=hp/eShield=eShieldMax0. poise/maxPoise는반감전nativeHP를유지. generatedelite/mods/element/skin/ATK/speed/시계보존 |
| parent finish | summonT=summonCd/state recover/st2=50→일반recover후idle15+U[0,15). 조건부attack5/crossing5/recover35를새자연windup진입으로발명하지않음 |
| 필수type3범위 | range200/commonaggroflow·idledefault1.6·조건부strafe/eCircle(신규attackticket0)·각6속성common240+60탄/분류/status·generatedM29/M30·shield0/반감전poise/피격/재생·normalrevive/antiRevive suppression·좌표기반fullatlas skin |
| 현재 gap / registration | type3 동적factory·AI/6elements/fire/holy/elite/M29/M30/fullskin·필요status 미지원. 원child를삭제하거나etype0/fleshCrawler/physical/elite0로대체하면원계약변경. **향후필수완료전새type7원자admission REJECT가설계gate**이며 아직구현0. 현재factory는기존unsupported이유그대로·등록변경0, 이번world초기화/node검사0 |

## 필수 원자원6개 — metadata만 확인, package 없음

| canonical relative path | stat bytes / image·grid·cell | 정확 source 소비 / 현재상태 |
|---|---|---|
| img/vfx/teleport_out.png | 4018 /64²/1frame | departuresize90.93905338838696/mt18·p=t/18·size(1+1.8p)·alpha(1−p²)×.85/rotation+=1.5p/lighter |
| img/vfx/teleport_in.png | 3362 /64²/1frame | arrivalsize113.6738167354837/mt22/isBig(r≥18)·size=max.6,2.2−1.6p·alpha(p<.4?p/.4:max0,1−(p−.4)/.6)×.9/rotation−=1.2p/lighter |
| img/tp_impact.png | 70004 /401²/2×2/cell200²/4frames·right/bottom1unused | arrivalsize90.93905338838696/mt24/frame=min3,truncp×4/size(.6+.6p)/alpha1−p²/colglow는p<.5에서만/lighter |
| assets/vfx/teleport_burst.png | 31488 /576×64/9×1/cell64²/9frames | finalarrival·scale2.8418454183870926/frameTime4/angle0/isSkillfalse/baseAlpha1/renderdtSp-singleincrement/reset/alpha1−.3×frame/9/lighter |
| img/vfx_pentagram_red.png | 1455927 /1024²/1frame | fullbitmap M30warn220×220/centerzone/rotate now×.00028/alpha.15+.13×q, q=clamp1−t/54. source proceduralwarn도필수 |
| assets/vfx/boss/vfx_lava_erupt.png | 1707135 /2304²/3×3/cell768²/9frames | M30actual312.5/offset−78.125/scale.4069010416666667/frameTime5/baseAlpha.85/renderclock·boss24alias0 |
| 합 / 검사방법 | **3271934B** | canonical6존재/Godot6부재. source auditor의firstpath/stat+24B PNGIHDR만이며hash/copy/decoder/import0·resource/pixelPASS0 |

TP/M30의 procedural warnings/travel bolt/particles/blast lights도원소비의일부다. PNG6존재를명분으로준비되지않은source형태를임의간단그림으로대체하지않는다. 기존body는flesh_crawler col6/row0/baseRect1536,0,256,256·walk6144/6400/6656/6912,0,256,256·4frames/128px·8dir·drawH159.1433434296772/centerpivot.5,.5의frozen metadata다. bodyPNG재조회/hash/copy0이며24장원화/24FPS·모델완성승인0이다.

## dependency readiness 7행 — source 값과 consumer 준비 분리

| dependency | source_ready | consumer_ready | 판정 / 다음에필요한범위 |
|---|---|---|---|
| exactorder3/elite1/M30·HP후처리 | true | false | 원337/supportfalse/runtimeNULL·HP4377/shield·poise1751 보존한전용consumer필요 |
| type7range/teleport120/landing420+KB120 | true | false | 원guard/order·고정유효target·독립posthurt additiveKB API필요 |
| common32/life240과landingqueued48/life300 | true | false | 두caller·warning60/끝59·취소/변위보정/독립탄필요, 기존kernel전체반복검사0 |
| M30 ownerlock54/zone125/magic26/실warning+lava | true | false | source modifier생략0·globalticket대체0·실zone/자원consumer필요 |
| TP/M30 원PNG6 | true | false | canonical실존/Godot부재, 필요package/API준비후별도firstcopy/import인수 |
| nativegeneratedtype3/6elements/elite0or1/M29orM30 | true | false | mandatory전체childfactory/AI/status/skin준비전새type7admission원자거부가 향후 설계 gate. 현재 등록검사 구현0 |
| fullvisual/public/performance/scheduler/reviveparity | false | false | 이번좁은source숫자회수범위밖·최소240/공개/시각PASS0 |

`pending_source_values=[]`는위확정된source수치의마감이다. 마지막행의fullparity미감사와futurechild flags미생성/소비미준비를숨기지않는다. staticreadiness FAIL을통과시킬새fixture/판정값/actorHP·좌표·타이머·상태·observer callback·승리주입은없다.

## 향후검사 TODO / 이번검사 ledger

| future boundedgroup | 필수consumer완료뒤독립의미검사 | 이번상태 |
|---|---|---|
| exact_type7_admission | exactelite1/M30·실actor/raw/postfields·actual7/9·otheretype7alias거부·원16metadata불변 | TODO/test저장0/실행0/PASS0 |
| natural_teleport_and_skin | 실제idle조건·두stage이동/120warning/target고정/validity재검사·후속queued탄·actualcol6/8dir/거리walk. 상태/도착점강제0 | TODO/실행0 |
| M30_and_child_consumer | 실제ownerlocal480→busy54/zoneborn53/125/26/원VFX, eSummon40→nativechild1~2·6elements/elite/M29/M30/후처리·원registry. RNG/elite0강제0 | TODO/실행0 |
| exact_secondary_packets_and_posthurt_KB | common32·queued48/life240·300·warning60/취소/위치·이번caller의sharedstatus요청·landing420뒤독립KB120(내부거절독립). completedkernel전체미러0 | TODO/실행0 |

현재 신규의미검사수는 **0**, 결과PASS **0**, 자동simulation/explicitphysics/render/API검사 **0**, 제품actor/factory등록 **0**, 새자원copy/hash/import **0**이다. 이전type1/이전모든suite는재실행0이며그PASS를이번dependency준비/새type7승격근거로합산하지않는다. 원본 수치는 packet에서 확정했지만 필수 소비 구현은 없다. 미래 registration gate 검사는 TODO이며 기존 factory에 이 JSON의 읽기 연결이나 새 rejection 구현이 없다. sourcepacket·pendingdataJSON의구문/직렬화확인은runtime행동·시각·공개플레이검사와다르다.

## MAP PRODUCTION REPORT (§23)

| 항목 | 이번현재결과 / 미완 |
|---|---|
| STAGE / MASTER | 원CH1 order3/physical/M30 type7의dependency대기정본. stage0 START/EXIT/region/route 원값변경0·신규맵기획0 |
| OUTER MASS / LARGE / MEDIUM | LEFT/RIGHT/TOP/SOUTH/composite·접합·holes 작업0. body/환경PNG재제작0 |
| GROUND / LANDMARK | shadow/contamination/integration/primary·secondary·tertiary·collision/nav배치변경0 |
| PLAYABLE | 실제새type7/child/M30/착지consumer없음·source6/10유지. 원문특성삭제/기존body만움직이는partial배송0·frozenWeb/Windows5/11인수소급0 |
| CAMERA QA | START/EARLY/ARENA/SIDE L·R/LANDMARK/LATE/EXIT 새screenboards없음. 경로/벽/가림/발사·소환가독성/foot/crop·공개픽셀판정0 |
| TECH QA | 새route/collision/pageerror/404/seam/loading/performance검사0. source숫자회수완료와mandatoryreadinessFAIL을분리; 신규검사0/PASS0/이전성공재실행0 |
| FILES | worker:newSSOT/C/testsreceipts만. parent:pending-schema JSON/currentdocs·Git. concurrent수정보존·소유외편집0·test파일없음 |
| GIT | workerstage/commit/push/deploy0. 부모정상data+docs checkpoint대기, 실제성공전완료SHA표시0 |
| VISUAL VERDICT | **RETOUCH** — 실제sourceconsumer/child의존성/TP·M30원자원·공개픽셀/전체AI/UI/status/Q·E/blackBean/최소1080p240미검증 |
| NEXT PASS | 필수type3/6elements/elite-mod/parentM30·TP·독립KB120 API를실제준비한뒤actorGO검토. 별도승인·READY전자동제작/검사/공개입력0 |


## 2026-10-17 현재 방어구 속성 배율의 실제 entry 소비 연결

| id / 항목 | 현행 계약 |
|---|---|
| 1 / 기능 / 제품 | NATIVE-ARMOR-ELEMENT-CONSUMER-20261017. 제품 변경은 main.gd와 player.gd 두 파일만. 상성 producer·탄·HP/패링/poise 구현은 변경하지 않는다. |
| 2 / 정상 연결 | Main._ready의 world.set_player 뒤에 Player.bind_native_armor_inventory(Callable(source_state, read_current_inventory))를 연결한다. 실패하면 기존 _stop_source_player_startup 경로로 중단한다. source State/INV를 새로 만들거나 복원하지 않는다. |
| 3 / 원 상수 | EL P=0/F=1/I=2/D=3/L=4/H=5/E=6. F→I, I→F, D→L, L→D, D→H, H→D, E→L, L→E는2. 동일 속성은 P0 제외0.5, 나머지는1. 기존 원 elMul/producer 분기·수치 변경0. |
| 4 / 현재 완료 범위 | 실제 제품 entry의 SourceState→Player→기존 projectile 배율 consumer 연결까지. full inventory/equip UI·affix·저장/장비복원·보상·전체 bootstrap·모든 탄/보스·시각/청감·240FPS·최신 전체게임 완료는 아니다. 기존 HOLD/2_3·MAP/ART/STORY/rig/native3387/NativeHUD 등 보호 불변. |
