## Godot 실제 원근 뷰 첫 연결 — 2026-10-14

| 범위 | 구현 / 미완 |
|---|---|
| 실제 선택 | Main `mount_native_perspective_view(settings={})` 또는 명시 실행 flag `--fdg-native-perspective-first`. 기본 2D와 기존 Web artifact는 그대로다. native Camera3D/SubViewport가 현행 World/Player의 실제 Sprite2D·AnimatedSprite2D texture와 soil/litter 두 ShaderMaterial을 소비한다. |
| 물리와 입력 | world XY→Godot XZ/height→Y. 새 `native_world_to_screen`·`native_screen_to_world`가 실제 Camera3D 투영/지면 또는 지정높이 plane ray를 사용. Player 실제 mouse-aim 공급 Callable 연결. 물리·nav·맵·HP·G/P·Q/E 수치 변경0. |
| 실제 품질 경계 | 구형 Warrior/기검참/캐릭터 선택 미완이 그대로다. 24고유장수·24FPS, custom draw VFX/Canvas shader parity/labels/terrain 높이·접지shadow/가림 polish/전체route·전투/smooth motion/성능 미검수. `latest_full_game=false`. 전체 최신 버전 또는 출시완료 아님. |
| 새 검수 | headless 새projection9 PASS(6.247초), 새flag/owner5 PASS(6.073초), 새view-script-loss3 PASS(6.129초). GPU START 최초→anchor수정1→최종수정 검수3실행, 최종발접점 신규1 PASS(quad_min_height0/당시frame-bottomY7480; 실제body-anchorY7477.5는2026-10-15별도수정). 총 새의미case18, actualMain6회(기술3+새visual3). 이전 성공suite/PNG해시/asset복사/import/배송교체/인간play창 입력0. 최초layout warning1은top-left anchors로수리, 최종GPU/기술은제품ERROR0·기존Camera2D warning1씩. |
| VISUAL VERDICT | **RETOUCH** — START 원근 GPU 실제프레임 확인. 기존 캐릭터 품질·전체 맵/교전·VFX·그림자·가림은 미완. 접점 오류 첫프레임을 보존하고 최종수정은 별도 PNG로 기록. |

현재 버전 manifest의 `map.camera`는 companion Camera2D 진단이고, 새 `map.perspective_view`가 opt-in 실제 Camera3D 선택/준비/미완을 별도로 명시한다. API 상세는 `FDG_INTEGRATION_INTERFACE.md`의 같은 날짜 표, §23 MAP PRODUCTION REPORT는 `FDG_ENGINE.md`의 같은 날짜 표를 따른다. source pin만으로 최신화했다고 표시하지 않는다.

## 이식판의 실제 콘텐츠 버전 진단 — 2026-10-14

| 항목 | 현재 구현과 한계 |
|---|---|
| 실제 consumer | Main `get_native_content_version_manifest()->Dictionary`(0인자), 기존 `native_factory_created.data.version_manifest`에 시작 1회. 캐릭터 실제 Warrior/SpriteFrames, SLASH_SHEET, World.map_data와 실제 Camera2D를 읽는다. |
| 버전 기준 | schema `fdg.native-content-version.v1`, revision1. baseline `e4981763fe562799f345c094102f2e284bcbe0f1`은 current compile HEAD가 아님. 전투 source pin `9a4534b42f74093095ebc3364a25dd104e93b379`만으로 최신 콘텐츠 여부를 증명하지 않는다. |
| Web/Steam | Web artifact `fdg-godot-web-native-first-20261013`/source-aligned, 문서 날짜2026-10-13. 실제 export_timestamp/native_code_checkpoint는 null/NOT_RECORDED. Steam version null/NOT_VERIFIED·parity NOT_VERIFIED·accessiblefalse. 기존 배송물에 이 새 getter가 포함됐다는 주장은 하지 않는다. |
| 실제 미완 | latest_full_gamefalse/content_parityINCOMPLETE. 현행 Warrior·기검참 radiant 시트·native_2d Camera2D/perspectivefalse, sourceG.mapnull. 최신 캐릭터 선택·원본24고유장수/24FPS·CSS5·world cache·전체startup 미완. |
| 첫 새 검증 | 격리 actualMain 1회, 신규10/10 PASS, exit0/제품오류0/기존 Camera2D warning1. 첫 실행6.282초. 이전 성공suite/PNG검사·Web재배송·사용자 play창 조작0. 이는 버전 진단 검사이며 visual PASS가 아니다. |

상세 field/owner 계약은 `docs/engine/FDG_INTEGRATION_INTERFACE.md`의 같은 날짜 버전 진단 표를 따른다. 최신 콘텐츠 연결/Camera3D·원근 입체 구현과 실제 화면 검수는 남은 작업이다.

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

# FDG 자체 엔진 벤치마크와 적용 설계

<!-- fdg-godot-type7-teleport-20261013:begin -->
## Type7 텔레포트 의존성 실제 소비 · 2026-10-13

| 항목 | 현재 구현 / 경계 |
|---|---|
| 이번 실제 소비 | `native_type7_teleport.gd` / `type7_teleport.json`(`exoduser.godot.native-type7-teleport.v1`) / Player 공개 KB leaf8행 / 원TP4 / 신규 고유4기술PASS. standalone controller이며 실제 etype7 actor·factory 등록0. source 지원6/미10·동결 배송5/미11 유지. |
| 원 native 순서 | idle에서 teleportT111.58698863349855·summonT157.41148072760552 감소→기존 warning 진행/완료→else 거리<100 및 teleportT≤0에서 P+polar(U×2π,150+U×50) 제안→can_move(r22.73476334709674) 성공 warning120/생성update 감소0, 실패timer30→마지막 summon_due. cooldown175.49626126885414. eSummon/recover·source guard 중 warning 정지. |
| 초기 episode 경계 | 실제 메서드 진행으로112프레임 warning 진입·158에서 summon_due/warning74 관측. mandatory summon/channel/recover는 미이식이며 이 raw episode를 자연 TP 완료로 쓰지 않음. 별도 constructor completion context와 live field setter를 구분. |
| 착지 / KB | 완료 시can_move 재검사; 실패여부와 무관하게 caller cooldown reset/후속 eProjAt 예약. 성공 시 source 이동좌표에서 strict 거리<(r+10)×2+Pr, baseline r65.46952669419348+Pr15=80.46952669419348; !ib/iframe≤0/state≠literalcharge. 원 physical 요청trunc40×10.5×elementMultiplier, baseline420→기존receive_damage(420,"phys")→선택M30 onhit 효과없음→radial(target→P)×120을 기본KB에독립가산. 실측 HP350→236, 기본KB+(120,0). 피해수락bool gate·extra120으로기본KB교체0. |
| 현재 검사 / 시각 | 고유4PASS=첫3PASS+실패queue1후속PASS. 첫전체 exit1/2.338453417s/assert2→해당queue만 exit0/.664766792s/assert0. 코드수리0(검사중), 성공3/oldsuite/import 재실행0. public교전·actual pixels·최저1080p240 검수0, VISUAL VERDICT: RETOUCH. |
| 실제 / 모델 구분 | 실Player 공개damage/KB/Input 및실탄자동physics·pause를독립관측. ownerstun/freeze/literalcharge는readonly constructor contexts; actualtype7 자연status획득·자동ownerdispatch/sourceglobal scheduler/full소환play는미검수. 입력/HP/position/private clock 성공주입0. |
| 오류 이력 | 첫queue2assert는 출생sp1의 기존homing −.00109083rad를빠뜨린 oracle: bakedRIGHT 대 postphase(0.9999994,−.0010908297). 실패1만 canonicalturn 및 consumedheading×5 좌표기대로수리. 두runtime stderr/SCRIPTERROR/ERROR0. stageparent누락1회는code/resourcecopy전환경수리; firstresourcePASS 반복0. actorstate검증11행과pool/frame/origin alignment는pretest 이력. |
| 기록 / 보존 | 부모currentdocs16+player1의WORK+HEAD34copies·foreign37 baseline. 신규tests/SSOT/자원4+prod3 및관련docs만정상checkpoint. main/save/API/LOCKnav/STARTEXIT/60Hz/기검참/poise/QEblackBean/보호play·서버3333/3334·동결배송/Main/export/GUI 변경0. |
| 출생 시계 adapter | 기존configure에는localOrigin=world.to_local(globalOrigin), birth_frame=actual_release_frame−birth_source_ticks. 실제global birth metadata 보존→자동physics off/world등록→원release phase1회 explicit _physics_process→deferredauto enable. prephase frame59/life300→sp1 bornframe60/life299.333/거리5.00000286→실auto16뒤frame76/life288.661. privateclock/observer 보정·같은phase중복0. |

전체 source 수식/API/검사 ledger는 [현재 TP 정본](FDG_GODOT_TYPE7_TELEPORT_20261013.md)을 따른다. real parent `600e7269150a61b4b0f93e2f05ce64a8d9cec69c`, authority `9a4534b42f74093095ebc3364a25dd104e93b379`. 현재 표를 우선하고 이전 legacy/creation/배송 단위는 그 시점 역사로 보존한다.
<!-- fdg-godot-type7-teleport-20261013:end -->


<!-- fdg-godot-m30-epicenter-20261013:begin -->
## M30 고유 신규4 기술검사 최초 증거 · 2026-10-13

| 항목 | 현재 구현 / 경계 |
|---|---|
| 지원 집계 | 현행 source16의 **지원6/미이식10** 유지. 동결 Web/Windows 배송본은 **5/11**. etype7 자연 생성·소환·순간이동 등록0. 커널 하나를 지원 actor 추가로 집계하지 않음. |
| 검사 / 상태 | 새 **고유4 technical PASS** = 첫3PASS + 실패한 피해fixture만 1FAIL→1FAIL→1PASS. 성공3 재실행0·기존 suite 반복0. 현재 public 교전/pixel/최저1080p240 검수0, **VISUAL VERDICT: RETOUCH**. |
| 신규4그룹 | `m30_owner_clock_isolation`, `m30_damage_boundary_and_public_player_guards`, `m30_original_warning_and_cells`, `m30_independent_render_lifetime`. 최초 완료4=PASS3/FAIL1/assert3/incomplete0, .838102667s; 실패1 후속 FAIL/assert2 .658352625s → 그1 PASS/assert0 .657369417s. SCRIPTERROR0. |
| 실제 Player 경계 | readonly move action4 deadzone .200000002980232 평균, analog 요청 .969230769345394/actual vector .96153849363327. translated constructor world(1024,2048)에서 실제 endpoint(1149,2048)·거리125.0·HP324; outside거리127.398803710938<125+Pr15에서도 HP350. runtime HP/좌표/state/timer/InputMap setter0. |
| dispatch 증거 구분 | 누적 explicit native13718/Player physics1707/warning1/lava19/Input12. 첫 실행 actual FX process 정상3+pause4 관측, physics_frame signal 합19는 owner/Player 자동 callback 증거가 아님. actual 자동 owner native dispatch0; constructor literalcharge provider를 실제 Player charge 획득으로 쓰지 않음. |
| 오류 이력 | 첫 stderr ERROR1은 EXPECTED_RESOURCE_REJECTION_BEGIN/END 사이 missing texture 의도적 거부; SCRIPTERROR/그 외ERROR0. 두 후속 ERROR0. 첫2 실패의 raw와 입력 oracle/float 경계 수리 이력 보존; 원source inclusive 비교 epsilon 완화0·제품 M30 후속 수정0. |
| 보존 / 전달 | code/docs 수정 전 currentdocs16경로 WORK+HEAD32copies, tracked foreign37 기준 보존. 정상 owned checkpoint만, push/deploy/export/Main/GUI/server/protected play session 조작0. 현재 검사 ledger는 생산 시점 descriptor `production_validation=pending…`의 후속 결과이며 과거 metadata를 소급변경하지 않음. |
| 첫 자원 소비 | 원본2 첫 copy/hash와 목적지2 첫 hash: byte동일 합3163062B. 격리 최초 import exit0/6.978891833s/actual2(pentagram/lava), 기존 body/water/lightning reimport0; old converted cache10file/sidecar3 재사용은 input reuse. 재import0·원 PNG 수정/신규 이미지 생성0. |

정확 전체 수식·API·신규 실행 이력은 [M30 현재 정본](FDG_GODOT_M30_EPICENTER_20261013.md)에 기록한다. source 권위 revision `9a4534b42f74093095ebc3364a25dd104e93b379`, real parent `927fa91ec77bb8c54698e270ce57b50aea11fb45`. 이전 구현/배송/creation 시점의 기록은 역사로 보존하며 현재 상태는 이 표를 우선한다.
<!-- fdg-godot-m30-epicenter-20261013:end -->


<!-- fdg-godot-etype7-physical-flesh-crawler-pending-20261013 begin -->

## 2026-10-13 · etype7 리치 / flesh_crawler 필수 의존성 명세 — 미등록

고정 원목록의 가장 앞선 etype7 `ch1_initial_004 / order3 / physical0 / flesh_crawler / elite1 / mods[M30] / aura null`을 조사했다. 현재 산출물은 **pending JSON과 정확 source·의존성 문서**다. 실제 actor·탄·factory 등록/연결은0이며 Godot 소스 지원6/미이식10을 유지한다. 목표 지원7/미이식9는 달성하지 않았다. [etype7 의존성 정본](FDG_GODOT_ETYPE7_PHYSICAL_FLESH_CRAWLER_20261013.md)에 필수 소비자와 향후 검사를 기록한다. 앞선 소비자·배송본의 완료 이력과 자원·검사는 동결한다.

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
| 새 기술/시각/성능 근거 | 새 renderer/physics fixture/import/test0·PASS0. 코드 실행기술 인수의 새 근거가 없다. 원 packet의 stat/IHDR read와 pending JSON metadata를 FPS·픽셀·교전 또는 지원7 실생성으로 세지 않는다. |

<!-- fdg-godot-etype7-physical-flesh-crawler-pending-20261013 end -->


<!-- fdg-godot-etype1-lightning-hive-bloater-20261013 begin -->

## 2026-10-13 · Godot etype1 번개 벌집 팽창체 소비

현행 Godot 소스는 고정 원기록 `ch1_initial_016 / order15 / etype1 / lightning4 / hive_bloater` 하나를 전용 consumer로 추가했다. 논리 type명은 가시 사도, 실제 스킨은 벌집 팽창체다. 원 `native etype 1` 이름과 source snapshot을 유지하며 `bone_archer`/`etype1_archer` alias로 교체하지 않는다. 상세 source·API·수치·검사 정본은 [번개 벌집 팽창체](FDG_GODOT_ETYPE1_LIGHTNING_HIVE_BLOATER_20261013.md)이다. 아래 앞선 Windows/Web의 지원5/미이식11은 동결된 배송본의 상태이며 현재 소스 지원6/미이식10과 구분한다.

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
| 첫 시도 | 7.613106291초/exit1/명시physics1518/automatic16/idle dispatch10/render9/Input actionedges6. raw marker3PASS는 status body-space ERROR166 때문에 유효3PASS가 아니다. |
| 후속 2항목 | exact_hive_factory_admission + hive_electric_counter_owner_and_clock만 실행. .972840958초/exit0/명시physics168/automatic16/idle dispatch10/render0/Inputedges6/ERROR0/Camera interpolation warning1. 두 attempt를 한 번의 전체4 재실행으로 합산하지 않는다. |

<!-- fdg-godot-etype1-lightning-hive-bloater-20261013 end -->


## 2026-10-13 · Godot Web 첫 실제 플레이 배송

현재 Web 배송·공개 입력 인수 정본은 [Web playable first](FDG_GODOT_WEB_PLAYABLE_FIRST_20261013.md)이다. 같은 Godot 소스를 실제 브라우저로 수출하여 공개 시작·WASD 4방향·기검참 Space 충전/해제·원 적 자연 교전/상호 피해·Esc 일시정지를 확인했다. 아래 native/Windows 문단은 당시 플랫폼·checkpoint 이력이며 이번 Web 관측을 그 앱의 실행 결과로 소급하지 않는다.

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

현행 패키지의 자원·수출 정본은 [Windows native preview](FDG_GODOT_WINDOWS_NATIVE_PREVIEW_20261013.md)이다. 현재 지원5/미이식11과 source 초기16·seed·배치·원수치를 유지한다. 아래 앞선 ice/외부 PNG·Windows 미전달 문단은 `3a30d539` 등 당시 checkpoint 이력이며, 이번 패키지는 그 후 필요한 물 자원과 한글 지원 데이터를 자체 포함한 기술 산출물이다. 실제 Windows 실행·시각 인수와 구분한다.

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

## 2026-10-13 · order8 ice soul_flame 한 개체의 Godot 이식

이번 단위는 frozen 초기16 중 `ch1_initial_009`/order8/etype4/ice2/`soul_flame` 한 개체의 전용 몸체·물 탄두·최소 냉기 감속 소비다. 기존 지원4에 이 한 개체를 더하는 구현 범위는 **지원5 / 미지원11**이다. 아래 과거 지원4/12·3/13 및 검수 기록은 해당 checkpoint 당시 동결 이력이다. 현재 원값·API·새 검사 결과와 미이식 경계는 [이번 ice soul_flame 정본](FDG_GODOT_ETYPE4_ICE_SOUL_FLAME_20261013.md)을 따른다.

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


## 2026-10-13 · order13 physical spine_beast 한 개체 consumer · 신규 고유4 기술 PASS

> 이번 제작 단위는 원 초기 목록의 `ch1_initial_014`/order13, etype4/physical, skin `spine_beast` 한 개체다. 기존 consumer에 이를 더해 원16개체의 **지원4 / 미지원12**이며 이번 고유4개 기술 검사는 최초3PASS 및 추가1 경계검사의 실패 수리 뒤1PASS다. 기존 성공3은 반복하지 않았다. 아래 이전 단위 기록은 당시의 동결 범위다. [이번 source·consumer 정본](FDG_GODOT_ETYPE4_PHYSICAL_SPINE_BEAST_20261013.md).

| 이번 spine 단위 항목 | 원 source 계약 / 새 인수 범위 |
|---|---|
| 정확 입장 / 이름 | `ch1_initial_014`, order13, etype4, physical/EL.P0, `spine_beast`, elite0·mods[]·aura=null만 별도 profile `native_ch1_etype4_physical_spine_beast_v1`로 소비한다. 원 etype4 명칭 `갑각 사도`, 스킨 `척추 괴수(spine_beast)`, 원 record name `native etype 4`는 서로 구분하며 runtime name을 추정 변경하지 않음 |
| 원 목록 / typed 설정 | 원16개체 `godot/data/encounters.json`·seed/RNG/배치와 지정 record의 `support.runtime_supported=false`/`runtime=null`은 그대로 보존한다. 새 `godot/data/etype4_physical_spine_beast.json`만 exact admission에 사용. 이 config26588bytes/SHA-256 `d098280a24d0c3ee4729c145b71cb849d3ef5171153a8d1de6df7c129d79064e`, native_final 원값27개 subset이며 원 full337개는 snapshot/report에 보존. 목록 재추출·재해시0 |
| 원 수치 / 위치 | spawn3878.7467967160046/340, HP875·ATK31·radius34.3551987009123·speed0.40462583759799603px/native60tick, idle30.77384915202856·projT299.5166686736047·facing0.384930423474355, eShield/eShieldMax875·poise/maxPoise875. map RLE/nav/geometry/STARTEXIT/camera 불변 |
| 실제 일반 AI | 원800px+LOS 어그로·단거리(range400) 분류의 d>30 밀착추적과 일반 idle 이동을 소비한다. 일반 접촉은 atk×.8의 raw24, cooldown40~59tick. common60tick 차지 후 actor-center의 physical raw24 탄이며 새로운 탱크 전용 공격·방어감산·attack-ticket를 추정 추가하지 않음 |
| shield / 피격 | eShield875가 최종 배율 뒤 먼저 흡수하고 overflow만 HP로. 전부 흡수하면 HP·hitstun·KB·poise 감소0. 남은 HP 피해의 일반 idle hitstun8·KB=min(remaining×.25,15)×kbMult·poiseHit opt-in 및 stun/차지 중단은 기존 공통 소비 계약. tank renderer의 case4 외형을 특수 AI로 해석하지 않음 |
| 기존 물리탄 / 화상 공유 | existing physical projectile의 damage24·dtype=parry/energy_def·heading KB×2·life120·size3·300px/sec 소비와 existing player burn pool48/idle 활성600·interval30·분모20·cap10/no-refresh·expiry-first19회 요청을 공유한다. 이번 단위에서 player·탄 수치를 새로 보정하지 않음. [물리 consumer 정본](FDG_GODOT_ETYPE0_PHYSICAL_FLESH_CRAWLER_20261013.md), [화상 정본](FDG_GODOT_ETYPE0_PHYSICAL_BURN_20261013.md) |
| undead / modifier 경계 | etype4는 원 `_UNDEAD_ET`에 포함되며 STR 뒤 `trunc(dmg×(1+antiRevive))` 대상이다. native type trait/계약으로 이를 보존하되 현재 raw 무접사 `antiRevive=0`만 인수한다. nonzero antiRevive·full equipment/affix/상태 pipeline이나 다른 etype4/skin/ice 지원 승격 없음 |
| 기존 atlas 소비 | body8방향, base crop1280/0/256/256(col5,row0); walk crop5120/5376/5632/5888/0/256/256. 거리128마다4프레임, base+walk overlay와 center pivot128/128·표시높이240.48639090638608px를 보존. 기존 복사 atlas16장+mouth1장을 재사용하며 이번 새 PNG 복사·가공·해시0. 옛 카탈로그 순번을 현재 cell index로 일괄 치환하지 않음 |
| 새 고유 검증 | 신규 exact_admission / native_motion_charge / shield_poise_order 첫 실행3PASS/exit0·7.103183292초(명시 physics1159회). 추가 flow_axis_boundaries는 최초1FAIL/2assertions/exit1·2.340568333초(명시5회) → 추적 flow leaf 수리 후 그 실패1개만PASS/exit0·2.335691084초(명시5회). 현재 고유4 기술PASS, 첫3 성공 재실행0·fixture수정0. 원값/등록4/12/셀/거리 보행·차지300→59→birth360·caster 사망 후 독립탄 요청 sink(parry24/KB2/burn48)·shield/overflow/poise/KB·양축/X/Y/모두막힘/LOSfalse 근거리 자동alert0을 확인. 자동 fixture physics0·alive stun 실제관측false·이전검사/GUI/source재추출/재해시0. 현재 인간 앱에 새source 미로드, 공개·픽셀·성능 증거 아님 |
| 등록 / API | factory `SPINE_SCRIPT`, `SPINE_CONFIG_FILE`, `SPINE_PROFILE`, `SPINE_CONFIG_SCHEMA`, `_spine_config`, `_is_spine_target`, `_validate_spine_config` exact leaf. actor `ExoduserSpineBeast.configure(runtime,world)`, `set_player`, `receive_damage(amount:int,direction:Vector2,source:String,opts:Dictionary={})`, `receive_poise_damage(float)` pending, `get_snapshot`. Body/WalkOverlay는 별도 spine 셀 소비; native_type_traits deep copy와 undead_for_anti_revive=true/anti_revive_affix_ported=false 보고 |
| flow 이동 / source 교정 | `_move_flow_native(direction,ticks)`는 source 방향 성분을 speed 곱하기 전 캐시하고 양축→X→Y 순서로 이동. 성공은 stuck0/실제 방향 캐시, 모두 막히면 stuck+=ticks. snapshot `last_flow_direction`/`flow_stuck_ticks`는 읽기값만 제공. 일반 KB/idle/separation `_move_native`는 유지. 원source에 없는50~100 근접 alert를 제거한 config 메타데이터 교정이며 runtime/target/assets 값은 동일. 원8방향 escape·전체 globalFlow/cache/RNG/culling 동일성은 미검증 |
| 검증 선언 / 범위 | 새 config의 `scope.runtime_consumer_verification` pending은 source/config 작성 당시 선언을 보존한 것이다. 현행 actor/factory 기술 소비는 이번 SSOT·고유4 검사 결과로 구분한다. 전달 sink는 기존 Player의 full hurtP/화상커널 재검이 아니며 full equipment/affix/AI/pathfinding/culling/원 global phase·RNG parity·생존 stun은 미검증/미이식 범위를 유지 |

| 미이식 / 품질 | ticket-linked windup 자동 진입·부활·별도 camera recycle/만료FX·원 full modifier pipeline은 기존 미이식 경계를 유지한다. 새source 공개 교전·생존 stun 실제 관측·픽셀/시각·최저사양240FPS는 미검수. 신규24장/24FPS 모델 제작0. **VISUAL VERDICT: RETOUCH** — source/config 인수를 전체 모델/VFX/출시 품질 통과로 확대하지 않음 |

## 2026-10-13 · order14 물리 redBean 플레이어 화상 DOT consumer · 신규 고유4 기술 PASS

> 이번 제작 단위는 `ch1_initial_015`의 기존 etype0/physical redBean에 붙는 플레이어 화상 DOT다. 원 초기16개체의 **지원3 / 미지원13**은 그대로다. 아래 이전 단위의 burn 미이식·검사 결과는 당시의 동결 범위이며 이번 신규 검증 결과와 합산하지 않는다. [이번 화상 source·consumer 정본](FDG_GODOT_ETYPE0_PHYSICAL_BURN_20261013.md).

| 이번 화상 단위 항목 | 원 source 계약 / 새 인수 범위 |
|---|---|
| 생산 접점 / pool | 일반 physical redBean 충돌의 pre-`hurtP` contact24에서 `total=24×2=48`, `t=600`, `tick=0`을 추가한다. 내부 피해 거절·실드/방어 후 실제 HP 감소량을 pool로 대체하지 않는다. 기존 물리탄 direct 피해24/parry·heading KB×2는 유지 |
| 추가 gate / cap | 일반 충돌은 실제 outer collision 및 이동 돌진 `charge` 제외 분기에 도달했을 때만 생산한다. producer에 도달한 뒤 내부 `hurtP` 결과를 새 추가 gate로 사용하지 않는다. 최대10 stack, 초과는 무시하며 기존 stack의 시간·피해를 refresh/merge하지 않는다. Q/E·wrong-Q 별도 생산자는 이번 이식 범위로 확대하지 않음 |
| 활성 clock / 만료 | native60Hz(delta×60, 정상1)의 플레이어 `idle` eligible update에서만 `t-=ticks → tick+=ticks → t<=0 제거 → tick>=30이면 tick=0·피해 요청` 순서를 소비한다. birth update의 append 뒤 초기 tick0이며 다음 eligible update부터 진행한다. 600은 누적 idle 활성 tick이며 비idle·일시정지·종료에서는 진행하지 않음 |
| 19회 / 피해 분모 | 연속 idle에서 활성30·60·…·570에 **19회 hurtP 요청**, 활성599는 t1/tick29, 활성600은 피해보다 먼저 만료한다. `total/20`의 분모20을20회 요청으로 해석하지 않는다. 선택 pool48의 raw 요청은 `max(1,trunc(48/20))=2` |
| 물리 DOT / 상태 | 원 opts는 `{dot:true,burn:true,src:'화상'}`로 dtype 생략의 기본 phys/DEF를 소비한다. 장비·추가 modifier·플레이어 실드 없는 raw mkP HP350/DEF2에서 요청2는 최종1HP다. 기존 iframe·dead/fallen 등의 내부 거절이면 시간/interval은 소비해도 HP 피해는0. 받아들인 DOT는 iframe0이며 일반 KB·stagger·poise·charge cancel을 적용하지 않음 |
| 독립 목록 / reset | stack은 enemy/projectile 소유 참조가 없어 적 사망·탄 소멸 뒤에도 독립적으로 남는다. 원 die/fallenResolve는 목록을 clear하지 않고 해당 비idle 상태에서 freeze하며 initStage/retry가 실제 clear다. 기존 미이식 부활 동작을 새로 구현했다고 주장하지 않음 |
| 새 검증 결과 | 신규 고유4개 첫 실행 **4 PASS / 0 FAIL**, exit0·0.802048708초. 명시 실제 method1597회와 자동 fixture physics17틱을 분리한다. post_hit_pulse_expiry / stack_timer_independence / dot_isolation_cancel_persistence / automatic_pause_native_clock를 확인. 실제 자동 fixture에서 기존 화상 최종1HP 요청→contact24→신규 stack600/tick0, pause4 process frame 동결/resume을 관측. 이전3/3/5·JS·성공 검사 재실행0, sourcefactory0·강제 HP/state/timer0·GUI0. 공개 플레이/성능 증거 아님. 현재 인간의 전체화면 일시정지 앱에 이번 source 미로드 |
| 코드/API / 순서 | Player 상수 `NATIVE_BURN_MAX_STACKS=10`, `NATIVE_BURN_DURATION_TICKS=600.0`, `NATIVE_BURN_INTERVAL_TICKS=30.0`, `NATIVE_BURN_POOL_DIVISOR=20.0`; 상태 `_native_burns`. public `apply_native_burn(total_damage:float)->bool`, `get_native_burn_snapshot()->Array[Dictionary]`, `get_snapshot().burn_stacks`는 `{total,t,tick}` deep copy. `_tick_native_burns(ticks)`와 `_receive_native_burn_damage(amount:int)->int`만 새 DOT 소비. 새 물리탄 `process_physics_priority=1`은 기존 Player0 뒤에 진행하고 나머지 actor/탄 priority는 유지 |
| 상태 대응 / 범위 | 원 `charge`는 이동 돌진이고 기검참 hold는 `wWindup + _kiChargeActive` → Godot `windup`이다. hold에 projectile 면역을 추가하지 않고 HP/포이즈/KB·화상 추가는 유지하되 burn clock만 비idle에서 동결. full equipment/shield/affix/fallen-revival/retry·원 전체 movement/actor phase parity는 이번 기술 PASS에 포함하지 않음 |

| 미검수 / 품질 | 신규 PNG·모델·24장/24FPS 제작0. ticket-linked windup 자동 진입·부활·별도 카메라 recycle/만료 폭발FX의 기존 미이식 범위는 유지. 공개 새source 교전·화상 시각·생존 stun 관측·최저사양240FPS 미검수. **VISUAL VERDICT: RETOUCH** — 원source 조사와 기술검사를 전체 게임 품질 통과로 확대하지 않음 |

## 2026-10-13 · CH1 order14 물리 flesh_crawler 한 개체 consumer

> **2026-10-13 현행 지원 범위 · CH1 etype0 physical 첫 consumer:** 원 초기 목록16개 중 기존 medium/dark 육괴2개와 `ch1_initial_015` 한 개체를 지원하여 **지원3 / 미지원13**이다. 아래 이전 단위의 2/14·첫 앱 기록은 그 시점의 동결 결과이며 이 현행 수치와 합산하지 않는다. [이번 개체의 원 source·consumer·검증 정본](FDG_GODOT_ETYPE0_PHYSICAL_FLESH_CRAWLER_20261013.md).

| 이번 단위 항목 | 현재 소비 / 인수 경계 |
|---|---|
| 정확 개체 / admission | `ch1_initial_015`, order14, etype0, physical/EL.P0, skin `flesh_crawler`, elite0·mods[]·aura=null만 `native_ch1_etype0_physical_flesh_crawler_v1`로 추가 소비. 다른 record/type/skin/element 지원 승격 없음 |
| 원 목록 동결 | `godot/data/encounters.json`의 원16개체 snapshot SHA-256 `91fd1a88b394152cd8b0de653f1bde5139b7829f331787581616f7ef3c0724fa` 유지. 지정 record의 원 `support.runtime_supported=false`와 `runtime=null`도 보존하며 별도 `godot/data/etype0_physical_flesh_crawler.json`으로 admission한다. factory/RNG 재추출0 |
| 원 수치 / 배치 | spawn3888.7242834487565/244.62260903114446, HP875·ATK31·radius22.103927369229496·speed0.6128564003482461px/native60tick, idle38.106732717715204·projT269.4780135154724·facing2.6490353528754254. 원 map RLE/nav/STARTEXIT/camera/geometry 불변 |
| 일반 idle / 피해 | 자연 idle은 접촉24(`r+P.r+8`, cooldown40+trunc(random×20))와 공통60tick 차지탄을 소비. 자동 근접 windup0. 기존 ticket-linked eCircle→windup35→attack8의5tick crossing→recover35는 별도 조건부 source 계약이며 새 자동 진입을 만들지 않음 |
| 에너지실드 / 피격 순서 | eShield/eShieldMax875를 최종 배율 뒤 먼저 흡수하고 overflow만 HP로. 전부 흡수한 피해는 HP·flash/hitstun·KB·poise를 감소시키지 않음. HP overflow에 hitstun8·KB=min(remaining×.25,15)×kbMult(기검참 .5·일반 무기1), poise는 원 poiseHit opt-in이며 remaining 피해만 소비. 일반 피해를 poise로 자동 재사용하지 않음 |
| 물리탄 / clock | actor-center 발사, damage24·sz3·life120·life decay.667/native tick·speed300px/sec·homing.00109083rad/tick(life>30). `parryClass=physical`이지만 실제 피해 `dtype=parry`는 기존 energy_def 분기 소비. redBean 수명 종료는 카메라 안 life=1 연장 대상이 아니며 별도 카메라2500px recycle·만료 폭발FX는 미이식 |
| KB leaf / 보존 | player `receive_damage`에 optional `native_knockback_strength=-1.0`만 추가. 새 물리탄은 받아들인 non-DOT 피해에서 heading×2를 기본 KB 대신 더함. 기존 phys/magic/parry 방어 선택·HP·포이즈·충전·Q·60Hz 시계와 기존 medium/dark AI·탄 소비 유지 |
| 기존 원화 / 애니메이션 | 원 atlas16장+`proj_phys_mouth.png`1장 =17 PNG/26,726,245bytes를 가공 없이 복사, source 전후와 destination SHA 일치. 본체8방향/base crop1536/0/256/256·walk4 crop6144~6912/0/256/256, `floor(walkDist/128)%4`와 base+walk overlay·cell center pivot128/128 보존. 실제24장/24FPS 신규 제작 없음 |
| 새 검증 결과 | 이번 consumer의 고유3개 기술 **PASS**. 최초 shield_packet1PASS / admission·native_clock2 fixtureFAIL(3assertions, 명시 method524회)→fixture 오라클 수정 후 실패2개만 재실행2PASS(exit0, 명시 method474회). admission은 native_final27개 subset을 report full337개 전체와 같다고 잘못 기대하여 subset 원값·report full337 보존 검증으로 정정; clock은 원 `_gameFrame++`가 update 시작이므로 birth330을 기대329에서 정정. 제품 수정0·통과 shield_packet 재실행0·이전3/5/JS0·GUI0·자동 simulation0. 이번 source를 현재 인간의 전체화면 일시정지 앱에 로드하지 않았음 |
| 미이식 / 미검수 | ticket 조건부 windup 자동 진입·burn DOT·부활 미이식. 생존 stun 실제 관측·새 source 실앱 플레이·픽셀/시각·최저사양240FPS 미검수. **VISUAL VERDICT: RETOUCH** — 새 기술 검증 결과를 전체 모델/VFX/출시 품질 통과로 확대하지 않음 |

> **2026-10-13 후속 제작 · CH1 초기 적 factory:** 현재 Godot 소스는 canonical 초기 생성 경로의 원 record 목록을 factory로 소비한다. 원 목록16개를 보존하고 현재 정확히 이식한 medium/dark 육괴2개만 생성하며, 나머지14개는 미이식 사유·원문으로 보고한다. 현재 인간의 전체화면 pause 앱은 앞선 한 적 버전이며 후속 source를 로드하지 않았다. [현재 source·순서·수치·지원/미지원·시간0 검사 정본](FDG_GODOT_ENCOUNTER_FACTORY_20261013.md).

| 후속 factory 항목 | 현재 구현 / 인수 경계 |
|---|---|
| 원 초기 경로 | CH1 tileRLE 경로의 시작육괴2→문지기1→호위5→외곽8 = 원 실제16개체. 외곽 후보10 중2개는 원 canMv 충돌 검사에서 제외; mincount나 난이도 보정 없음 |
| source / RNG | 기존 canonical map geometry 읽기 재사용. encounter seed477069883→2380610169, 난수214회, native time0. source4192034bytes 추출 전후 SHA동일. 전체 boot RNG 재현 주장은 없음 |
| 지원 / 미지원 | 원 medium32cell sheet·etype4/dark3·native_medium_dark_v1·원 final flags 계약만 지원2. HP875/ATK31, spawn3500/6700 및4540/6580·각 원 radius/speed/timer/facing 그대로 소비. 일반 atlas40/다른 속성·AI·문지기 등14개 대체 node0 |
| 생성 경계 | 전체 schema/record/count/order/id/finite/native clone 검증→unparented configure→world 등록. invalid는 children/registry/report/events를 보존, 중복 설치는 already_installed. get_encounter_report는 deep copy |
| 후속 새 검사 | 새 source_factory/world_registration/invalid_atomicity 고유3 시간0 PASS, exit0. 최초3 FAIL→source_factory 진단 FAIL(validator errors25)→JSON 수치 비교 수리 후 실패3 PASS; 통과 검사 반복0. 기존 첫 고유5 PASS·53.302003초 공개 세션·240 목표 관측은 별도 동결/재실행0 |
| 계측 / 안전 leaf | main은 initial_encounter_factory 및 pause state.encounter_factory에 원/지원/미지원 수와 order/id/etype/status/reason을 읽어서 기록. invalid world.ready_for_player는 플레이어 생성 전에 중단 |
| 보존 / 실제 배송 | map RLE/nav/STARTEXIT/camera·player/crescent/피해·기존 독립탄60Hz·원PNG·공유save·browser31·foreign WIP 유지. 새 factory는 공개 플레이/픽셀/전체AI/240FPS 미검수이며 인간의 다음 직접 플레이 steer 대기 |

> **2026-10-13 현재 제작 우선순위 · Godot native 첫 이식본:** 실제 `godot/project.godot`과 GDScript/Node2D로 canonical CH1-1·raw Lv1 전투를 소비한다. 아래 브라우저 Studio·v2/v3 환경 기록은 각각의 기존 범위이며 이번 Godot 결과와 합산하지 않는다. 전체 게임 이식·출시 품질은 미완료다. [실제 수치·API·검사·공개 플레이·§23 정본](FDG_GODOT_NATIVE_FIRST_20261013.md).

| Godot 현재 단위 | 구현 / 실제 인수 경계 |
|---|---|
| 프로젝트 / source | `godot/`, Godot4.7.2 Compatibility. migration checkout `9a4534b42f74093095ebc3364a25dd104e93b379`의 CH1-1·현재 기검참 source를 별도 소비; 기존 `game.html` 실행본 교체 없음 |
| map / player / enemy | 200×200/T40, START4020/7420·EXIT4020/300, 40,000tile·292wallrect·64bakedchunk·36prop, raw Lv1 HP350/SP200·이동2.6px/tick, NORMAL 다안 육괴 etype4 한 개체 HP875/ATK31 |
| 공격 / 피해 | 기검참3연타·3타40/80/120틱 충전→2/4/8배, 현행 crescent9장/hit4장. raw DEF2/EDEF0·poise4·일반iframe0·stagger6·pStun240/끝iframe60. 전체 Q 패링/방패·장비·회피 미이식; Q는 취소만 |
| 새 기술 검사 | 고유5 PASS: map·charge·projectile·pause_capture·damage. 실패 수리 이력은 정본에 기록; 통과 그룹·기존 suite 재실행0 |
| 공개 실제 교전 | 동일 현재 source 세션에서 자연 aggro·적탄2회·magic80 피해 HP350→270·기검참1/2/3·적 처치 관측. 공개 Space 홀드40/80/120F→3763 방출, Esc pause/resume 및 전체화면 정지 전달 |
| 공개 검수 잔여 | 실제 wall_contact·적 근접접촉 피해는 미관측. LMB 장시간 홀드는 자동검수하지 않았으며 Space 홀드 proof와 구분. 전체 카메라 경로·미술 품질 VISUAL RETOUCH |
| 성능 | M5 Pro/24GiB·내부1920×1080·120Hz·vsync0/cap240·physics60. 정상53.302003초/12,435표본, 벽시계 median4.166/p954.645/p998.064/max230.493ms, >4.1666667ms49.9638%, >16.7ms0.361882%. GPU완료 미측정·최소사양 Windows240FPS 미검증 |
| 저장 / 다음 consumer | 전용 `EXODUSER-Godot-Native-First/user://qa`만 사용. 기존 browser31·공유save·원PNG·LOCK·환경WIP 보존. 다음은 실제 벽/근접 접촉 인수와 CH1 native enemy factory 확대; 전체 Q 시스템은 별도 미이식 |

> **2026-10-12 v0.20 공통 원근:** 일반 map/sprite/rig 장면의 optional `project.viewCamera`와 CPU terrain의 명시 camera projection을 구현했다. 바닥·발 위치·표시 배율·리그 XYZ·지면 역투영·near clipping은 같은 수학을 소비한다. 아래 기존 평면/직교·발Y 공식은 viewCamera 미설정의 기존 경로이며, v0.20 API·수치·제작 UI·검증·한계는 [공통 원근 정본](FDG_WORLD_CAMERA_20261012.md)을 따른다. sourceScene/sourcePreview 및 native game.html의 기존 렌더 계약과 과거 PASS는 이번 원근 인수에 합산하지 않는다.

> **2026-10-12 드루이드 source 현행:** 기본 대기는 `boss_dark_druid_8dir_v3.png`(1656×1240, 4×2 / 셀414×620)의 실제 방향 셀을 비율 보존·source-over1회로 표시한다. 구형 f0 r3/r5 리그는 `fdgDruidSource=legacy-f0` 명시 선택에서만 로드하며 r5는 기존 exact r4 QA active도 필요하다. 아래 f0 제작·PASS·URL 기록은 구형 기술 이력이고 신형 모델 인수가 아니다. 걷기·공격 기존4프레임은 아직 남아 있다. 10/9 검정 SW 후보는 영웅형 외형으로 사용자 거절되어 선택 대기 종료·연결·리깅 재개0. 승인 악마형 NORMAL 본체 자원 없음. [source 정본·API·실제 화면](FDG_CHARACTER_ASSETS.md#dark-druid-source-correction-20261012).

기준일: **2026-10-10, Asia/Seoul**. 사용자가 선택한 범위는 기존 EXODUSER 게임의 맵·캐릭터·스킬·VFX를 제작하는 **FDG 자체 엔진과 스튜디오**다. 이번 체크아웃의 결과물은 `engine/fdg/`의 **저작용 프로젝트 모델·참조 미리보기 런타임**과 `tools/fdg-studio/`의 제작 UI다. v0.5는 일반 FDG 장면에 optional `rigScene`을 추가하여 기존 RigProject를 같은 런타임의 CPU 리그 노드로 소비한다. Godot·Unity·Phaser의 공식 문서에서 제작 흐름과 데이터 구조를 참고하고, 현재 JavaScript·Canvas 및 NW.js 환경에 맞게 적용한다.

협업팀이 보유한 `/Users/fordeargamers/Projects/exoduser-migration-20261001`(R)의 `fdg-engine/` v0.1은 기존 production 통합 기반이다. 협업 전달에서 확인한 `SceneTree`·`Renderer25D`·`ResourceStore`의 lease·`DruidRootsNode`를 이번 `engine/fdg/`로 자동 복제하거나 교체하지 않는다. 이 문서의 구현 완료·테스트 결과는 **현재 체크아웃의 저작 스튜디오와 참조 런타임**만 대상으로 한다. production 기반과의 연결은 별도 인터페이스 합의 및 적용 검증을 거친다.

이 문서는 외부 엔진의 기능, FDG에 적용할 설계, 실제 구현 상태를 구분한다. 공식 문서의 기능 설명을 FDG의 구현 완료 주장으로 사용하지 않는다. Godot의 `stable` 및 Phaser 개념 문서는 갱신되는 주소이며, Unity 자료는 **Unity 6.0 / 6000.0** 주소로 확인했다. 외부 최신 버전의 우열이나 성능 수치를 비교한 자료는 아니다.

## 1. 채택할 장점

| 참조 | 공식 문서에서 확인한 기능 | FDG 적용 판단 | 적용 위치 |
|---|---|---|---|
| Godot Scenes / Nodes | 노드가 편집 가능한 속성을 가지며 부모·자식 트리를 이룬다. 저장한 장면을 여러 번 인스턴스화할 수 있다. | 맵·캐릭터·스킬·VFX의 Scene Outline과 v0.5 리그 시각 노드 선택·편집·소비를 제공한다. 범용 부모·자식 변환·중첩 노드·상속은 별도 단계다. | 스튜디오 Scene Outline, optional rigScene consumer, 향후 범용 장면 인스턴스 |
| Godot Resources | 실행 동작을 담당하는 노드와 공유 데이터를 담는 Resource가 분리된다. 리소스는 저장·로드·Inspector 편집이 가능하다. | 캐릭터 시트·스킬 초안·VFX 프리셋을 ID가 있는 리소스로 저장하고 미리보기의 시간·위치·생존 파티클은 실행 상태에 둔다. | 프로젝트 데이터와 미리보기 런타임 |
| Godot Signals | 이벤트를 발행한 노드에 다른 노드가 연결하여 반응한다. 직접 참조를 줄일 수 있다. | 에디터 선택·프로젝트 변경·캐스트·VFX 완료를 이벤트로 전달한다. 구독의 수명을 미리보기 장면에 묶는다. | 향후 이벤트 경계 |
| Godot Inspector | 객체 속성을 편집하며 그룹·하위 그룹으로 표시할 수 있다. | 선택한 리소스의 타입에 맞춰 숫자·열거형·텍스트·참조 필드를 표시한다. 셀 규격·프레임·방향·사거리 등 관련 필드를 묶는다. | 스튜디오 Inspector |
| Godot Undo / Redo | 편집 작업을 만들고 do/undo 동작을 등록한 뒤 커밋한다. 장면별·전역 이력을 구분한다. | 검증에 성공한 편집을 하나의 트랜잭션으로 저장한다. 맵 브러시 한 번, Inspector 확정 한 번, 가져오기 한 번을 각각 복구 가능한 작업으로 만든다. | 프로젝트 이력 |
| Unity ScriptableObject | 오브젝트와 독립된 데이터 에셋이며 여러 인스턴스가 공통 데이터를 참조할 수 있다. | 반복 생성되는 캐릭터·스킬·VFX 인스턴스가 원본 데이터를 중복 복사하지 않도록 리소스 정의와 인스턴스 상태를 분리한다. | 리소스 정의, 향후 게임 어댑터 |
| Unity Profiler / ProfilerMarker | 대상 플랫폼의 성능을 수집하며 코드 구간별 마커를 기록할 수 있다. | FPS와 함께 update/render CPU 시간·살아 있는 파티클·드랍된 틱을 표시한다. 에디터 미리보기 수치와 실제 게임 수치를 별도로 검증한다. | 미리보기 성능 표시, 기존 게임 프로파일러 |
| Phaser Scene | 로딩·생성·실행·일시정지·종료의 수명 주기가 있고 여러 Scene을 관리한다. | 미리보기 교체 시 이전 상태·입력·이벤트를 정리한다. 준비 완료 후 플레이하며 pause와 dispose의 의미를 구분한다. | 미리보기 수명 주기 |
| Phaser Loader | 키로 에셋을 등록하고 큐에 넣어 로드한다. 완료·진행·오류 이벤트 및 공유 캐시를 제공한다. | 로컬 서버 경로를 키로 캐시하고 중복 요청을 합친다. 로딩 실패는 Inspector/미리보기 상태로 노출한다. | 시트 이미지·카탈로그 로더 |
| Phaser Particle Emitter | 설정 객체로 파티클 풀을 제어한다. 지속 방출과 폭발 방출을 구성하고 생존·비활성 파티클 수를 확인할 수 있다. | VFX 리소스에 방출·수명·색·속도 설정을 저장한다. 실행 상태는 재사용 풀에서 관리하며 현재는 버스트 미리보기를 제공한다. 지속 방출은 후속 단계로 둔다. | FDG 파티클 미리보기 |

근거: [Godot Nodes and Scenes](https://docs.godotengine.org/en/stable/getting_started/step_by_step/nodes_and_scenes.html), [Godot Resources](https://docs.godotengine.org/en/stable/tutorials/scripting/resources.html), [Godot Using signals](https://docs.godotengine.org/en/stable/getting_started/step_by_step/signals.html), [Godot EditorInspector](https://docs.godotengine.org/en/stable/classes/class_editorinspector.html), [Godot EditorUndoRedoManager](https://docs.godotengine.org/en/stable/classes/class_editorundoredomanager.html), [Unity ScriptableObject](https://docs.unity3d.com/6000.0/Documentation/Manual/class-ScriptableObject.html), [Unity Profiler](https://docs.unity3d.com/6000.0/Documentation/Manual/Profiler.html), [Unity ProfilerMarker](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Unity.Profiling.ProfilerMarker.html), [Phaser Scenes](https://docs.phaser.io/phaser/concepts/scenes), [Phaser Loader](https://docs.phaser.io/phaser/concepts/loader), [Phaser Particles](https://docs.phaser.io/phaser/concepts/gameobjects/particles). FDG 적용 열은 이 자료를 바탕으로 한 **프로젝트 설계 판단**이다.

## 2. FDG 데이터 경계

| 계층 | 책임 | 저장 대상 | 실행 중 변경 |
|---|---|---|---|
| 기존 게임 카탈로그 | 실제 파일에서 캐릭터·스킬·VFX ID와 메타데이터 추출 | 추출본과 출처 | 원본 `game.html` 값을 자동 덮어쓰지 않음 |
| 프로젝트 | 버전이 있는 문서, 리소스 참조, 스튜디오 초안 | 검증된 JSON, 스튜디오 전용 로컬 저장 | 편집 명령으로만 변경 |
| 리소스 정의 | 시트 셀·애니메이션 설정·스킬 초안·VFX 방출 설정 | ID와 순수 데이터 | 원본 정의는 인스턴스 상태와 분리 |
| 미리보기 인스턴스 | 시간, 캐릭터 위치, 현재 동작, 시전 상태, 파티클 풀 | 기본적으로 저장하지 않음 | 고정 스텝 update에서 변경 |
| 일반 장면 리그 consumer | 같은 리그 리소스의 시각 노드, 노드 시간·재질·클립·전환·월드 위치와 장면 카메라 | 명시 저장/export 시 현재 상태를 rigScene JSON에 capture | 기존 FDGRuntime1/60초 update로 진행; resource.project.preview.pose 공유 |
| 에디터 선택 | 선택한 리소스 ID, Inspector 표시, 작업 탭 | 사용자 설정에 한해 저장 가능 | 선택이 실제 게임 수치를 바꾸지 않음 |
| 변경 이력 | 편집 전후 문서, 작업 이름, 커서 | 세션 내 복구 이력 | 성공한 트랜잭션만 반영 |
| 게임 적용 어댑터 | 승인된 특정 계약을 실제 런타임에 연결 | 적용 패키지와 마이그레이션 규칙 | **향후 단계** |

리소스 참조에는 화면상의 배열 순서보다 안정적인 ID를 사용한다. 실제 v1 스키마의 `skills[].vfx`와 `preview.characterId/skillId/vfxId`가 해당 그룹의 ID를 가리킨다. 리소스 복제는 새 ID를 생성하고 undo/redo에서 그 ID를 유지한다. 같은 PNG를 쓰면 이미지 캐시는 공유하되, 프레임·시간·위치는 실행 상태에 둔다. 범용 참조 추적·의존성 삭제 정책은 후속 단계다.

v0.5의 `rigScene.resources[].project`는 검증된 기존 RigProject를 포함하며 `nodes[].resourceId/materialId/clipId`는 해당 리소스 내부의 강한 참조이다. 리소스 최대8개·노드32개, 리그 각각2MiB·일반 프로젝트 전체 compact UTF-8 JSON4MiB를 검사한다. unknown collision/combat 메타데이터는 보존하고 자동 판정으로 소비하지 않는다. 범용 부모·자식 트리나 제품 R 포맷 호환을 이 제한된 노드 소비의 완료 범위로 넓히지 않는다. [장면 데이터 계약](FDG_RIG_SCENE_PROJECT.md)

Inspector는 프로젝트 값을 바로 곳곳에서 쓰지 않고 **입력 파싱 → 스키마 검증 → 변경 후보 → 이력 커밋 → 미리보기 갱신** 순서로 처리한다. 범위 밖의 값이나 없는 ID를 가져오면 현재 문서와 이력이 유지되어야 한다. 편집 뒤 undo, redo에서도 프로젝트와 Inspector·Scene Outline·미리보기가 같은 문서를 보여야 한다.

DOM 갱신은 특정 리프 노드에만 `textContent`를 사용한다. Inspector 구조를 재구성할 때에는 명시적으로 자식 요소를 만들고 교체한다. 부모 컨테이너의 `innerHTML`/`textContent`로 기존 DOM을 파괴하지 않는다.

## 3. 미리보기 수명 주기와 시간 계약

| 상태 / 작업 | FDG 의미 | 필요한 정리 |
|---|---|---|
| load | 필요한 이미지·카탈로그 준비 | 완료·실패·재시도 상태 보관 |
| ready | 검증된 프로젝트와 디코딩된 에셋으로 시작 가능 | 미완료 로드가 ready로 표시되지 않음 |
| play | 고정 스텝으로 실행 상태 갱신 | 입력은 현재 미리보기에만 전달 |
| pause | 상태 갱신 중지, 현재 화면 확인 | 재개 시 과거 벽시계 시간 누적 방지 |
| step | 일시정지 상태에서 정확히 한 시뮬레이션 틱 | 렌더 루프 횟수와 분리 |
| restart (후속 명령) | 같은 리소스 정의에서 실행 상태 초기화 | 시전·파티클·쿨다운 초기화. 현재는 프로젝트 교체가 실행 상태를 초기화하며 독립 restart·seed 제어 API는 미구현 |
| dispose | 미리보기 수명 종료 | RAF, 포인터/키 이벤트, 이벤트 구독, 실행 풀 정리 |

위 표는 Phaser 수명 주기에서 참고한 FDG 설계이며 API 이름을 그대로 복제하라는 요구가 아니다. 기존 게임의 `PHYS_STEP=1000/60`과 맞추되 **미리보기의 자체 시계**를 둔다. 자산의 FPS는 셀 선택 속도이고 시뮬레이션 틱과 구분한다. 탭 비활성화나 긴 프레임 뒤에 무제한 catch-up을 하지 않는다.

| 현재 리그 경로 | clock / step | 저장·수명 경계 |
|---|---|---|
| 독립 rig lab v0.4 | fixed1/60초·clamp.25초·최대6substeps, 수동 step=1/clipFPS | `rigVersion:1` / `fdg.studio.rig.v1`, 리그 편집/검수 |
| 일반 FDG 장면 v0.5 | 기존 FDGRuntime1/60초·clamp.25초·최대6substeps, 수동 step=1/60초 | optional rigScene / `fdg.studio.project.v1`, consumer 자체 RAF/listener0 |
| 일반 장면 전환 | 기본.25초=15owner틱; 저장 duration은0초과~10초 | source clip/time·target clip/time·elapsed를 capture하고 정지 재열기 |

일반 장면은 모델 X/right·Y/up·Z/front를 기존 worldToScreen 발 anchor에 yaw/pitch로 투영하고, 전체 리그 노드는 world-Y 발 위치로 player/objects와 정렬한다. 리소스의 수동 pose를 공유하며 node별 새 pose/clock 포맷을 만들지 않는다. [소비자 런타임 계약](FDG_RIG_SCENE_RUNTIME.md)

향후 이벤트는 최소한 `projectChanged`, `selectionChanged`, `castStarted`, `vfxFinished`, `assetError`의 의미를 구분한다. 미리보기를 여러 번 교체해도 구독이 누적되지 않는 검증이 먼저 필요하다. 이 이벤트 이름들은 현재 전역 게임 계약을 변경하는 상수가 아니라 설계 후보다.

## 4. 성능 정보의 의미

| 항목 | 표시 목적 | 측정 한계 |
|---|---|---|
| FPS / frame gap | 화면 갱신과 지연 확인 | FPS만으로 GPU 병목 또는 발열을 확정하지 않음 |
| update CPU ms | 시뮬레이션·파티클 비용 확인 | `performance.now()`로 측정한 CPU 구간 |
| render CPU ms | Canvas 명령 제출 비용 확인 | 실제 GPU 완료 시간과 다름 |
| alive / capacity | 파티클 풀 사용량 확인 | 원본 게임의 풀과 스튜디오의 풀은 별도 |
| catch-up / dropped ticks | 긴 프레임에서 시간 보정 확인 | 부하가 줄었다는 증거로만 사용하지 않음 |
| asset loaded / failed | 로딩 오류와 반복 요청 확인 | 로드 성공은 게임 렌더 결과의 시각 PASS가 아님 |

실제 게임에는 `_DCP`, `_PERF_PROF`, `_prof`, `_dbgVfxGLDrawn` 같은 계측이 이미 존재한다. 미리보기 프로파일러를 실제 게임 프로파일러에 연결하는 어댑터는 별도 작업이다. 기존 렌더러를 대체하거나 NW.js 빌드의 프레임 성능을 개선했다고 주장하려면 해당 빌드에서 같은 전투·에셋·설정으로 측정해야 한다.

## 5. 구현 상태

이 표의 **기존 구현**은 현행 게임 파일 조사로 확인한 내용이다. **구현·검증 완료**는 현재 체크아웃의 코드와 아래 Node/Chrome 검증을 함께 확인한 범위다. R의 production 통합 기반 및 본편 배포 성능을 인증한 결과로 확대하지 않는다.

| 기능 | 상태 | 증거 / 경계 |
|---|---|---|
| 자체 WebGPU / WebGL2 / Canvas2D 렌더러 | 기존 구현 | `game.html`: `_initWebGPU`, `_initWebGL`, `_buildProxyX`; FDG 신규 렌더러 성능 인증과 별개 |
| 고정 60Hz 게임 update | 기존 구현 | `game.html`: `PHYS_STEP=1000/60`, `loop`, `update` |
| 캐릭터 8방향 아틀라스 | 기존 구현 | `CHAR_LIST`, `_load8Dir`, `_build8`, `SpriteAnimator`; 기존 에셋 사용 |
| 스킬 카탈로그·선택 슬롯 | 기존 구현 | `SKILL_LIST`, `_SK_MAP`, `_canAssignSkillSlot`; 스킬 메타데이터와 실제 발동 수치를 구분 |
| VFX 시트 등록·재생·풀 | 기존 구현 | `registerVFX`, `playVFXAng`, `_VFX_SHEETS`, `_vfxAnims`, `poolPart` |
| FDG 프로젝트 스키마·리소스 편집 | 구현·검증 완료 | `engine/fdg/project.js`: 버전1, malformed 입력·중복 ID·없는 참조·unsafe path 거부. 프로젝트 테스트85개 통과; 본편 수치 적용과 별개 |
| 신규3종24장·24FPS 참고 검수 | 구현·Node 검증 완료 | 기존 원화/영상 actual0..23프레임. 원화비교·확대·6항목검수·기술지표; 모델/rig/8방향/전투 미완료. [v0.2 상태](FDG_CHARACTER_STUDIO_20261010.md) |
| 실제3D generic rig 저작 | 구현·새단위 검증 완료 | XYZ 메시·본/bind 계층·명시 정점 가중치 LBS·호환 색 재질2종·클립2종 보간/전환·가변FPS·저장재열기. [v0.4 정본](FDG_RIG_STUDIO_20261010.md) |
| 일반 FDG 장면의 리그 소비 v0.5 | 구현·새Node/Chrome 검증 완료 | optional rigScene·8리소스/32노드·owner1/60clock·world-Y foot 정렬·공유 수동 pose·기본.25초 전환 저장·4MiB 전체 JSON. 새 Node42/Chrome8 PASS, editor/reopened 기술 화면 확인. [Studio 정본](FDG_RIG_SCENE_STUDIO_20261010.md) |
| CPU UV texture / 2.5D 승인 본체 리그 | 구현 | 선택 UV·원본 texture·삼각형 layer를 실제 LBS 뒤에 CPU Canvas로 소비. [texture 계약](FDG_RIG_TEXTURE_RUNTIME_20261011.md). 지옥기형 보이는 표면·뼈/가중치·준비→휩쓸기→회복은 ENGINE_AUTHORING이며 본편 전투 적용이 아니다 |
| 게임용3D 모델/고급 skin pipeline | 계획 | 신규 전체3D게임모델·GPU skinning·외부모델import·자동가중치·PBR·의상교체 미구현. CPU UV texture 구현과 별개 |
| Scene Outline / Inspector | 구현·검증 완료 | `tools/fdg-studio/studio.js`: 리소스 선택·타입별 필드·참조 편집·복제·미리보기 연결. Chrome에서 쿨다운 편집 및 저장 복원 확인 |
| 트랜잭션 Undo / Redo | 구현·검증 완료 | `ProjectStore.change/replace/undo/redo`, 이력 최대80개. 무효 편집·가져오기 실패 시 이전 문서/이력 유지; 브라우저 한 드래그를 한 번에 undo/redo |
| JSON 가져오기·내보내기·로컬 저장 | 구현·검증 완료 | Chrome 실제 파일 가져오기·다운로드 왕복·깨진 참조 롤백. fresh context에서 저장 키 `fdg.studio.project.v1`만 생성 |
| FDG 고정 스텝·파티클 풀·성능 표시 | 구현·검증 완료 | `engine/fdg/runtime.js`: 1/60초, 풀1024, CPU update/render 표시. 런타임 테스트15개 및 Chrome pause/step·입력 검증 통과 |
| 현재 저작 프로젝트의 범용 부모·자식 변환과 장면 인스턴싱 | 계획 | R의 기존 `SceneTree`와 구분. v0.5 리그 시각 노드 소비와 outline 선택을 범용 중첩 노드 그래프 완료로 처리하지 않음 |
| 현재 저작 프로젝트의 prefab / 장면 상속 / 중첩 오버라이드 | 계획 | production 기반 인터페이스 검토 후 의존성·오버라이드 직렬화와 재로드 검증 필요 |
| 기본 Signals / 프로젝트 변경 이벤트 | 구현·검증 완료 | `Signals.on/emit/clear`, `ProjectStore.signals`의 `changed`, `dispose`. Node에서 unsubscribe·clear·dispose 및 복제 이벤트의 mutation 격리 확인 |
| 범용 노드 signals / 이벤트 배선 UI | 계획 | 기본 Signals 클래스 존재와 별개. 장면별 구독·해제 수명과 중복 이벤트 검증 필요 |
| 실제 `game.html`의 전투·밸런스 적용 어댑터 | 계획 | 패링·합체·자원·슬롯·저장 문서와 적용 범위별 동기화 필요 |
| 실제 게임 GPU 프로파일 결과 연결 | 계획 | 대상 플랫폼 빌드 측정 필요 |
| 타 엔진 프로젝트 파일 import / export | 계획 없음 | Godot·Unity·Phaser 프로젝트 호환을 구현했다고 주장하지 않음 |

### 현재 체크아웃 검증

| 검증 | 실행 / 증거 | 결과 |
|---|---|---|
| 프로젝트·이력·Signals | `node --test test/fdgProject.test.mjs` | 85개 통과, 실패0. 경로 단절·벽 시작/출구·반경 경로·이력80·redo 분기·snapshot mutation 격리 포함 |
| 참조 런타임 | `node --test test/fdgRuntime.test.mjs` | 15개 통과, 실패0. 30/60/120 렌더 FPS의 이동거리, 긴 프레임 clamp, 파티클 풀 재사용, 로드 오류, 입력/RAF 해제, 교체 시 캐시 정리·시트 전체 프레임 검증·중복 시트 렌더 방지 포함 |
| 엔진 전체 v0.2 | `npm run engine:check` | 프로젝트85 + 런타임15 + legacy7 + 품질10 + 신규 시트34 = 총151개 통과, 실패0/skip0 |
| 캐릭터 품질/원본 추적 | `fdgCharacterQuality.test.mjs`·`fdgCharacterDrafts.test.mjs` | 10+34개 통과; 정확한RGBA중복/충돌·실제72셀SHA·24FPS출처·미완료 분류·구 저장·검수undo·여러 행·256셀/16M한계 |
| 실제 Chrome UI v0.1 기록 | `tools/fdg-studio-smoke.mjs`, 서버3333, 새 isolated browser context | 8개 통과, JavaScript pageerror0, PNG404 0. 기존 캐릭터16개 방향 PNG decode·프레임 scrub·정지 입자·정확한1틱·WASD/Space/Esc/blur 검증 |
| 실제 Chrome UI v0.2 | `npm run engine:qa`, 같은 server3333/isolated context | **12/12 PASS**, pageerror0/PNG404 0. 이전8+신규검수3+decode복구1, 실제RGBA SHA의 확대복귀 일치·non-loop 끝 유지 |
| 보관 증거 v0.2 | `tmp/fdg-character-24-20261010/qa/report.json`, `character-quality.png`, `image-recovery.json`, `node-tests.txt` | 신규3종 actual24셀/24FPS·수동검수·oldsave·오류복구. 캐릭터 시각RETOUCH, 모델/본편 미완료 |
| 보관 증거 v0.1 | `tmp/fdg-engine-20261010/qa/report.json`, `map.png`, `characters.png`, `skills.png`, `vfx.png`, 다운로드 프로젝트 JSON | 현재 기술 미리보기의 화면 증거. 본편 완성 맵 VISUAL PASS는 별도 |
| 새리그 Node v0.4 | `npm run engine:rig:check` | schema36+math11=47/47 PASS. 이전 완료 suite와 분리 |
| 새리그 Chrome v0.4 | `npm run engine:rig:qa`, `tmp/fdg-rig-20261010/qa/report.json`·PNG2개 |12/12 PASS, pageerror0. 실제변형·재질·클립·저장·경계값·자원정리. CPU 시험체 기술 시각 확인, 게임캐릭터/본편 성능 승인과 별개 |
| 새 일반 장면 consumer Node v0.5 | `npm run engine:rig-scene:check` | 스키마29+consumer13=**42/42 PASS**. 기존85/36/11 및 다른 완료 suite 재실행 없음 |
| 새 일반 장면 consumer Chrome v0.5 | `npm run engine:rig-scene:qa`, `tmp/fdg-rig-scene-20261010/qa/report.json`·`scene-editor.png`·`scene-reopened.png` | **8/8 PASS**, pageerror0. 실제 XYZ·편집·재질·클립·전환 저장 재열기·교체/정리, editor/reopened 기술 화면 확인. 완성 환경/본편/GPU 인수와 별개 |

스모크 러너는 기본적으로 `playwright`를 동적 import한다. 제공된 번들을 쓸 때 `FDG_PLAYWRIGHT_MODULE`을 지정하고, `FDG_CHROME_EXECUTABLE`로 Chrome 경로를 지정할 수 있다. 기본 Chrome channel을 사용할 수 없으면 기본 Chromium으로 실행한다. 서버·브라우저·저장 데이터는 현재 체크아웃만 대상으로 하며 사용자 게임 세이브와 R 체크아웃을 수정하지 않는다.

## 6. 기존 런타임과 연결할 때 보존할 계약

| ID / API | 현행 값 | 적용 주의 |
|---|---|---|
| `exoduser_warrior` | 셀48×48, idle2 / walk8 / atk8 / whirl1 / throw1 / chain0 / dash1, 총21셀 | 방향명 PNG 8개; 기존 에셋을 사용 |
| `exoduser_silvertail` | 셀48×48, idle2 / walk4 / atk4, 총10셀 | 파일 매핑 S6 / SE5 / E3 / NE1 / N12 / NW11 / W9 / SW7 |
| `drawP` 보행 | `floor(P._walkDist * frameCount / 256) % frameCount` | 미리보기 시간 기반 보행을 실제 게임 규칙으로 오인하지 않음 |
| 실버테일 본체 | 추가배율0.65, 공통배율2 포함1.3 | 공격·피격 판정 크기와 시각 크기를 분리 |
| 스킬 선택 슬롯 | 일반1~4 / 분노Space / 영역F / 필살기Z | 임의 슬롯 배정으로 원본 계약을 우회하지 않음 |
| `registerVFX` | `id, src, fw, fh, frames, cols, blend` | 실제 시트 치수와 프레임 존재 검사 후 재생 |
| `playVFXAng` | `id, x, y, scale, speed, ang, isSkill, alpha` | 게임의 speed는 프레임 간격; 스튜디오 초·FPS와 명시적으로 환산 |
| 원본 VFX 제한 | `_vfxAnims` 재생 요청20개 관리, 일반 렌더예산5개; `isSkill` 예외 | 스튜디오 자체 제한을 원본 게임 제한으로 덮어쓰지 않음 |
| 원본 파티클 | `POOL_SZ=1000`, `_VFX_SOFT_CAP` 모바일60 / 데스크톱150 | 기존 풀·성능 정책 유지 |

스킬 피해·비용·쿨다운은 `SKILL_LIST` 한 곳에서 완전히 정의되지 않는다. `_SK_MUL`, `_COST_BASE`, `_COST_SK`, `_COST_DPS`, `stCost`, `mpCost`, `_dispatchSkillSlot`, 각 activate 함수와 update가 함께 계약을 이룬다. 스튜디오가 추출한 설명·`cd` 필드는 출처를 표시하는 카탈로그이며, 실제 효과의 단일 진실원으로 취급하지 않는다.

맵 데이터의 실제 게임 적용은 `docs/4.1맵디자인+설정/_MAP_SSOT_INDEX.md`와 `EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md`의 별도 계약을 따른다. 이 벤치마크가 geometry·collision·스테이지 LOCK을 바꾸는 근거가 되지 않는다.

## 7. 발견한 문서 정합성 항목

다음은 최초 런타임 조사에서 발견한 불일치와 **2026-10-10 문서 동기화 완료 상태**다. 루트가 갱신한 관련 문서를 다시 읽어 확인했으며, 아래 과거 서술은 현재 문서의 설명이 아니다.

| 문서 / 구간 | 발견 당시 서술 | 현행 계약 | 문서 동기화 결과 / 상태 |
|---|---|---|---|
| `docs/5.0애니메이션파이프라인/5.0애니메이션파이프라인.md`의 `스프라이트시트 레이아웃 (방향별 가로 배열 · 현행)` | idle4 + walk8 + atk16 + whirl16 + throw16 + chain16 + dash16 =92프레임 | 전사2+8+8+1+1+0+1=21셀, 방향별1008×48; 실버테일2+4+4=10셀, 방향별480×48 | **완료**. 현재 문서는 수·시작 열을 표로 정리하고 과거92프레임이 현행 계약이 아님을 명시 |
| 같은 문서 `실버테일 공격 파이프라인·구시트 폴백` 및 `docs/4.0케릭터스프라이트 디자인/4.0케릭터스프라이트 디자인.md` | 공격 PNG 없음, 절차적4방향 회전 설명 | `CHAR_LIST.atkN=4`; 기존 방향 시트에 idle2+walk4+atk4 포함 | **완료**. 현행 공격4프레임을 명시하고 공격시트 없음·가짜 방향 스핀·절차 칼끝 설명을 구시트 폴백으로 구분 |
| `SKILL_LIST.maliceHunt`와 `docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md`의 `2026-10-10 FDG 스킬 제작 초안` | metadata `cd:300`과 실제 발동식의 권위 차이 미명시 | 실제 쿨=`max(600, floor(900*(1+_cdRed())))`, 기본15초·최소10초 | **문서 명시 완료**. metadata300f와 실제 발동식 차이를 기록하고 실전 발동식 우선을 명시. 원본 메타데이터는 그대로이며, 본편 쿨다운을300f로 변경한 것이 아님 |

현재 문서 제목과 식별자를 기준으로 확인한다. `2_3 돌진+패링+방패시스템` 문서는 수정 금지이며, 무지개탄 Q 전용 패링·어택 티켓 금지·PixelLab 신규 캐릭터 생성 금지는 엔진 개발에서도 유지한다.

## 8. 단계별 완료 기준

| 단계 | 결과물 | 완료 확인 |
|---|---|---|
| A. 제작 기반 | 프로젝트·리소스·Inspector·이력·JSON | 잘못된 값/참조 가져오기 시 문서 유지; undo/redo 복원; 저장 후 재로드 동일 |
| B. 독립 미리보기 | 캐릭터·스킬·VFX·고정 스텝·파티클 풀 | 프레임·pause/step·풀 재사용 검증; 브라우저 오류 없음; 실제 에셋 표시 |
| C. 장면 조합 | v0.5 리그 시각 consumer 완료; 범용 중첩 노드·부모 변환·Prefab·이벤트는 후속 | 리그는 실제 변형·world-Y·공유 pose·전환 저장·삭제/재로드/정리 새검수. 범용 graph/이벤트 Gate는 별도 |
| D. 게임 어댑터 | 적용 범위가 명시된 계약과 마이그레이션 | 원본 게임 회귀검증; 관련 docs 수치/상수 동기화; 시각 QA 별도 |
| E. 배포 성능 | NW.js 및 대상 브라우저 측정 | 동일 전투의 update/render/입력 지연/메모리 비교; 수치와 측정 환경 기록 |

현재 체크아웃에서 A·B의 기본 저작/참조 미리보기와 C의 리그 시각 consumer 범위는 위 검증을 통과했다. C의 범용 graph/Prefab/이벤트 및 D·E는 후속 통합 계획이며, R의 기존 production foundation과 합의한 인터페이스를 먼저 따른다. 외부 엔진의 일반 기능을 참고했다는 이유로 노드 그래프·Prefab·본편 적용·배포 성능을 완료 처리하지 않는다.

## 2026-10-10 캐릭터 품질 확장

재생속도와 실제 장수 모두24라는 사용자 확정을 기준으로 Studio의 기본2종24FPS, 신규3종 reference-motion24셀, 원화/모션/겹침비교·확대·6항목 수동 검수·RGBA 기술검수·oldsave 연결 트랜잭션을 구현했다. 게임용 모델·리그·8방향·전투클립의 완성 판정은 별도다. 최신 전체 검증과 실패 수정 근거·화면 판정은 [캐릭터 Studio v0.2](FDG_CHARACTER_STUDIO_20261010.md)를 따른다. 외부 엔진의 새 기능/성능 우열을 추가 조사한 작업은 아니다.

## 2026-10-10 일반 장면 소비 확장 v0.5

독립 리그 lab의 저장·가변FPS 편집을 유지하면서 같은 authored RigProject를 일반 FDG 장면에서 소비한다. [v0.5 Studio 정본](FDG_RIG_SCENE_STUDIO_20261010.md)은 UI·추가/선택·공유 pose·재질/클립·저장/재열기와 새 Chrome 증거를 소유한다. 새 Node42/Chrome8 결과는 현재 checkout의 이 소비 경로만 검증하며 이전 suite를 합산하거나 제품 R·완료 Druid 자료를 다시 채택한 결과가 아니다. 신규게임 캐릭터의 modelAvailable:false/gameplayApplied:false, 완성 환경·전투/SFX·GPU/native 성능 인수 미완료는 유지한다.


## 2026-10-11 r2 완료 · 리그 texture와 실제 보스 본체 동작 (동결 이력)

[본체 모션 인수 정본](FDG_HELL_ABERRANT_MOTION_20261011.md)과 [texture 계약](FDG_RIG_TEXTURE_RUNTIME_20261011.md)을 따른다. 아래 수치·공개 검수·고유14개 검사·저장/교체 증거는 r2 당시의 동결 이력이다. r3 결과와 합산하거나 r3 shipping 데이터의 현행 수치로 사용하지 않는다.

| 항목 | r2 당시 결과 / 정확 범위 |
|---|---|
| 실제 산출 | 승인 지옥기형 PNG832×1248의 visible-source2.5D texture mesh3904vertices/4850triangles/32bones, 명시weights·UV/drawOrder·준비→휩쓸기→회복. ENGINE_AUTHORING/gameplayApplied:false/sourceImageModified:false |
| clip / clock | 실제 관절변형3seconds/24FPS의loop·once2clips, 첫24sample모두다름. raster24장atlas완성아님. labstep1/24s/sceneowner1/60s·.25s전환 유지, native전투110/200/.15..85/30/50gameframes값과변환0 |
| 기존 흐름 | rig.html 공개보스preset→같은RigPreview; 일반FDGscene에서는기존ownerassetscache/getImage로texture소비. 새scene부모트리/본편강제이관0 |
| 공개 검수 | 반복재생117capturedframes/약7.21seconds, 정지·한프레임·실행중clip전환·nonloop3s끝pose, rig와일반scene0.9s저장/reload/export전체JSONdeepEqual, 공개교체node1→0→1 |
| 새 기술 검사 | texture8개+motion6개=고유14개PASS. 선택점보강1개와작은회전의tailshape검사수정1개는영향검사만재실행; 반복합산0·이전완료suite재실행0 |
| cache / UI | rig-studio entrytexture-motion-r2-public; mainstudio와이번rig/runtime/project/scene-paneldependencytexture-motion-r2-final. runningstats100ms/paused즉시, source2.5D저장reopenoverlayfalse기본표시. 3600초JS/JSON캐시의oldcode소비방지 |
| 시각·잔여 | VISUAL VERDICT: RETOUCH. 원본뒤쪽몸통·다리/오른손뒤꼬리texturegap을정확히표시하면서보이는bodymotion제작완료. pixel-perfect경계/full3D/본편전투·실전24FPS/GPU성능미인수 |
| 보호 범위 | sourcePNG·main/game·R/fdg-engine·Q/E/save/nav/LOCK/서버변경0, projectileclip끝삭제0, source대기를작업전체중단조건으로확대0 |

## 2026-10-11 r3 꼬리 연결부 보정 (동결 이력)

[꼬리 연결부 r3 정본](FDG_TAIL_CONTINUITY_20261011.md)이 r3 mesh·가중치와 당시 연결부 검수의 정본이다. 위 r2 모션 보고와 기존14개 검사·저장 전체 증거는 동결 이력이며 r3에서 재실행하지 않았다. 아래 r3 수치·4개 검사·공개 재생·저장 증거도 완료 이력으로 동결하며 r4 결과와 합산하지 않는다.

| 항목 | r3 당시 결과 / 정확 범위 |
|---|---|
| shipping 데이터 | `hell-aberrant-tail-swipe-continuity-r3`, 3864정점 / 4850삼각형 / 32본 / compact UTF-8 701016bytes, 꼬리888정점. ENGINE_AUTHORING / gameplayApplied:false / sourceImageModified:false |
| 국소 저작 보정 | 실제 source pixel의 부위 분류를 교정하고 static leg cut-cap left[330,940,470,1064] / right[560,984,680,1064] 안의 앵커27개로 꼬리134정점에32px smoothstep을 적용했다. 정확 경계의 pinned27개, generic axe/torso/arm 앵커0; 자유 curl의 원래 꼬리 가중치 유지. 기존 tail9 pivot[342,980]의9개 key에 parent inverse local T/R을 bake했다. 수식·키 값·동작 지표는 정본을 따르며 일반 보간 runtime은 변경하지 않았다 |
| 보호 계약 / cache | 승인 PNG832×1248·32본·3초/24FPS clip2종·발 고정·native 전투 수치 유지. 바뀐 query는 `rig.html→rig-studio.js?v=tail-continuity-r3-final`과 `fixtures/hell-aberrant-motion.rig.json?v=tail-continuity-r3-final` 두 개다. runtime dependency 및 main entry의 `texture-motion-r2-final` 유지 |
| 이번 검수 | 새 연결부 targeted4개를 최초 실행하여4/4 PASS. 공개0.650/0.900/1.400초 pose와 실제 재생108JPEG / 7.053698초, GIF7140ms / 960×540 확인. 수정 rig를0.900초에 자기 저장·재열기 정확1회: export 전체 deepEqual true, mesh/skeleton/materials/clips/provenance도 shipping과 깊은 일치. 기존14개 검사·저장 전체 재수행0 |
| 시각 / 증거 | 이번 보이는 꼬리 island 연결성 VISUAL PASS / 제품 전체 VISUAL VERDICT: RETOUCH. 단1개 잔여는 hidden rear body와 leg/right-hand 뒤 꼬리의 독립 source surface 미확보다. full3D·본편 전투·Windows 성능 인수로 승격하지 않는다. 초기 spike 실패와 candidate2/3 RETOUCH를 포함한 증거는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-continuity-r3/`, 정확 동작 지표는 `r3-posed-metrics.json` |

## 2026-10-11 같은 장면의 꼬리·임팩트 시퀀스 r4 (동결 이력)

[시퀀스 r4 정본](FDG_TAIL_SEQUENCE_20261011.md)을 따른다. r3 mesh·weights는 재사용하고 r3의4개 검사·자료 및 r2의14개 검사·전체 저장 증거는 동결 이력으로 보존했다. 이번 단위는 같은 FDG scene owner clock의 명시 저작 연출이며 native 전투 적용이 아니다.

| 항목 | r4 당시 계약 / 증거 |
|---|---|
| authored 입력 | `fdg-hell-aberrant-tail-sequence-r4`, compact807933bytes. r3 body inline701016bytes·3864정점/4850삼각형/32본은 그대로이며 sequence ID=`hell-aberrant-tail-swipe-impact-r4`, nodeId=`hell-body-node` |
| 본체 / atlas | ENGINE_AUTHORING의 `tail-swipe-once` 3초/24FPS + 기존 ENGINE_FIXTURE `assets/vfx/fieldboss/boss_fire_impact_24_20261010.png`, 640px셀/6×4/24frames/16FPS/1.5초 non-loop. 자연치수3840×2560, scale0.25/anchor[0.5,0.5]/offset[-72,-84] world px. body·map·camera·source PNG는 그대로이며 초기 offsetY0의 하단 잘림 증거를 보존 |
| 단일 owner clock | 1/60초·max delta0.25초·max substeps6·pool1024 유지. startTime0.900초의 crossing에서 activation당1회 sheet 발동, trigger 틱 age0/frame0. pause는 전체 clock 고정, Stop은 bound node만 hold. replay/clip/seek가 이미 발동한 FX를 자르지 않으며 `age+1e-9>=frames/fps` 자기 만료. native single-hit/attack ticket·시간 환산·전투 적용0 |
| 실제 공개 관측 | 53틱0.883초/event0/FX0 →54틱0.900초/event1/FX1/age0/셀 표시1/24. 실제 재생73JPEG/7.781461초 CDP elapsed, GIF960×540/7930ms; 캡처 중 runtime/pose/clock/frame 강제 변경·합성0. 본체3.000초 끝 pose 유지·FX0·자동 loop0. 이전 FX를 보존하는 replay/clip 변경·Stop 뒤87틱 셀24/90틱 FX0은 정본의 별도 공개 기록 |
| 새 자기 저장 / 검사 | 1.3000000000000003초 본체·FX age0.400/event1에서 새 자기 저장·재열기 정확1회. before/after export 전체 JSON deepEqual true, resources/sequence/map/camera는 최종 fixture와 동일. 재열기 pose1.300/ready·activation0/event0/FX0/clock0, transient JSON field0. backend 첫8/8 PASS·첫 JS구문8/8 PASS, 선택값 보정 후 필요한 panel/studio만2/2 구문 확인; 기존4/14/전체 저장 재수행·합산0. 공개 두 수집 범위 warn/error0 |
| 최종 cache / UI | 공개 `index.html?v=tail-sequence-r4-complete`, `studio.js`·`rig-scene-panel.js` query=`tail-sequence-r4-complete`; runtime/schema chain=`tail-sequence-r4-final`; fixture fetch=`tail-sequence-r4-fixture-final`. bind→Replay 선택값은 실제 tail-swipe-once와 seek max3초를 표시, authored rewrite0. 새 저장 왕복 반복0 |
| 시각 / 정본 | 이번 승인 body+실제 atlas의 제한된 같은 장면 sequence VISUAL PASS / 전체 모델 VISUAL VERDICT: RETOUCH. 단1개 잔여는 hidden rear/leg·right-hand 뒤 꼬리의 독립 source surface SOURCE_GAP. full3D·본편 전투·Windows/GPU 성능으로 승격하지 않는다. 정확 API·crossing·clear·저장·시각 증거는 r4 정본과 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-sequence-r4/` |

## 2026-10-11 꼬리치기 가독성 r5 (동결 이력)

r5의 배송·수식·검사·실제 공개 GIF·저장·시각 결과는 아래 당시 이력으로 보존한다. r6 결과와 합산하거나 이전 자료를 재실행·덮어쓰지 않는다.

[r5 가독성 정본](FDG_TAIL_READABILITY_20261011.md)을 따른다. 승인 r4 scene을 읽는 새 `tools/fdg-studio/build-hell-aberrant-readability.mjs`가 기존 키 보간으로 준비·휩쓸기·회복의 강약을 저작한다. r2/r3/r4 보고·proof·검사·저장 수치는 동결 이력으로 보존하며 재실행·새 인수 합산·이전 fixture 덮어쓰기0이다.

| 항목 | r5 당시 데이터 / 경계 |
|---|---|
| 새 shipping | `fixtures/hell-aberrant-tail-readability.fdg.json`=`hell-aberrant-tail-readability-scene-r5`, compact UTF-8 820009bytes. 별도 `.rig.json`=`hell-aberrant-tail-swipe-readability-r5`, compact713092bytes. 기존 r3 `hell-aberrant-motion.rig.json`·r4 `hell-aberrant-tail-sequence.fdg.json` 보존 |
| 메시·권위 | 3864정점/4850삼각형/32본 및 mesh/weights/skeleton/material/source PNG 보존. ENGINE_AUTHORING·nativeCombatApplied:false, 새 runtime/schema·본편 전투·맵 변경0 |
| clip key 저작 | `tail-swipe-loop`/`tail-swipe-once` 2종은 각각3초/24FPS/20tracks. spine/head/leftArm/leftForearm·tail9..15의11tracks는17keys `[0,0.2,0.45,0.6,0.65,0.72,0.78,0.84,0.9,0.98,1.08,1.25,1.4,1.6,1.8,2.4,3]`를 공유. tail0..8의9tracks는 기존9keys 유지, pelvis/다리/발 bind 유지 |
| 동작 구조 | spine→head→leftArm→leftForearm→tail9→tail10..15의 순차 저작. tail9의 key별 world pivot XY 위치 bake는 유지하고 world Z 준비·방출 회전을 보정. distal10..15 지연은 `(i-10)*0.014`초이며 기존 translation lerp/quaternion slerp 소비, 연속 runtime constraint 추가0 |
| FX 저작 / 기존 시간 계약 | sequence ID=`hell-aberrant-tail-readability-impact-r5`, node=`hell-body-node`, clip=`tail-swipe-once`, startTime0.900초. 기존 ENGINE_FIXTURE `assets/vfx/fieldboss/boss_fire_impact_24_20261010.png` 640px셀/6×4/24frames/16FPS/life1.5초·최종 scale0.16·anchor[0.5,0.5]·offset[-145,-84], bound node[4150,7360] 기준 FX world center[4005,7276]·640×0.16=102.4px 사각 표시. 첫 r5 후보의 scale0.25·offset[-72,-84]는1.300초에 왼팔/도끼를 가려 기존 public inspector로 보정했다. native cooldown110/projectile life200/recoverLive30/recovery metadata50의 원래 game-frame 단위·attackWindow[0.15,0.85] phase 단위와 비환산 유지 |
| 현행 URL / cache | `index.html?v=tail-readability-r5-complete`·`studio.js` entry query=`tail-readability-r5-complete`, 새 scene fetch query=`tail-readability-r5-fixture-final`. runtime/schema=`tail-sequence-r4-final`, panel=`tail-sequence-r4-complete` 유지. 독립 `rig.html`의 기본 r3 preset은 유지하며 r5 `.rig.json`은 별도 새 저작 자료 |
| FX-disabled 실제 body | 후보1의 공개0.650/0.900/1.400초 pose와 실제 Play82JPEG/FX0를 확인한 뒤 별도 r5 fixture로 promote. GIF960×540/4210ms/12186853bytes, capture wall5141ms·합성frame0·효과합성0. sequence를 생략한 own 검수 scene이며 shipping sequence 삭제 아님 |
| 최종 FX 실제 재생 | public Play65JPEG/capture wall4752ms→GIF960×540/3860ms/10890311bytes(`actual-tail-readability-with-impact.gif`). 최종 scale0.16/offset[-145,-84]로 본체3.000초 hold/event1/FX0 자기 만료 확인. 속도·clock/frame 강제 변경·효과 합성0 |
| 신규 데이터 검사 | 새 `test/fdgTailReadability.test.mjs` 최초4/4 PASS, fail0/skip0/cancel0. 범위는 standalone↔inline 및 승인 변경만·실제 tip release/굽힘/순차 타이밍·발/27cap/key pivot/중간 drift·회복/1.8초와3초 복귀. 26개 새 r5 sample, 기존4/8/14 suite·PNG·native·기존 저장 재실행/합산0. `first-tests-tail-readability.log`·`targeted-tail-readability-receipt.json`·`targeted-tail-readability-metrics.json` 별도 증거 |
| 신규 구문 검사 | `tools/fdg-studio/studio.js`·`tools/fdg-studio/build-hell-aberrant-readability.mjs` 두 파일 최초2/2 PASS, `syntax-checks.json` 별도 증거. semantic4개와 합산하지 않고 다른 runtime/schema·기존 구문/검사 재실행0 |
| 새 자기 저장 / 재열기 | 새로운 save→export→reopen→export 전체 왕복 정확1회. before/after public pretty UTF-8 2973269bytes·전체 JSON deepEqual true. 새 rig/clips/FX scale0.16·offset[-145,-84]/map/camera 보존, transient fields0. 재열기 저장 node3.000초 pose 표시·owner clock0·ready/activation0/event0/FX0. 이전 저장 suite 재수행0 |
| 시각·증거 경계 | 이번 보이는 동작 가독성+FX 가림 보정 범위의 VISUAL VERDICT: PASS, 전체 모델은 hidden rear body 및 leg/right-hand 뒤 꼬리의 독립 source surface SOURCE_GAP 정확히1건으로 RETOUCH 유지. 새 final tab13 warn/error0. 숨은 면 생성·full3D·native 전투·Windows/GPU 성능 승인0. 새 증거는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-readability-r5/`, r4와 분리한 새 구현·자체 검수의 완료 기록이며 제품/native production 인수는 별도 |


| r5 한정 동작 계측 | 정의 / 정확한 새 측정값 |
|---|---|
| 좌표 | model hierarchy-world. source-equivalent XY px=`model-unit*300`, node-scale px=`model-unit*80`, 카메라 투영 제외. 26개 sample 시각·probe 선택은 `targeted-tail-readability-metrics.json` |
| `.650→.900` 실제 tip chord | 정점3740/3742의 tip-pivot 상대 변위161.03404842154472 / 162.38619060890414 source-equivalent px; node-scale42.942412912411925 / 43.302984162374436px |
| 같은 구간 sampled arc / 방향각 | 167.87521749729177 / 170.0100352599623 source-equivalent px; −1.0969132658550695 / −1.1269889191611941rad. key의 worldZ 목표값과 실제 LBS tip 방향은 다른 계측 |
| tail 본 체인 굽힘 | `signedTurn(tail9→tail12→tail15)-bind`의 .650/.900/1.400초 값 +0.26592715221987545 / −0.2220497005493962 / +0.06634067640171139rad |
| 실제 메시 굽힘 | source[160,1056]→[224,1088]→[304,1120] 실제 LBS `signedTurn-bind`: .650/.900/1.400초 +0.1161855520464186 / −0.0570976440966901 / +0.03954464345003813rad |
| 고정 / pivot | 발·leg·27cap drift0. key에서 tail9 pivot drift≤4.71e−14 source-equivalent px, 26개 중간 표본 최대2.7123732254775046px(새 검사 표본 한도4px). key 사이 연속 고정 constraint 승인 아님 |
| 회복 tip 잔차 | 1.400초 bind 대비 tip-pivot 잔차17.568664889592327 / 18.29486504344283 source-equivalent px, impact0.900초108.77596382283261 / 110.69493191148933px. 각 impact 잔차의1/4 이하를 새 검사에서 확인 |
| 복귀 | 1.8초 vertex drift≤3.4694e−18model-unit/bone0,3초 vertex/bone0. epsilonModel1e−7. 본편 충돌·AI·native phase/실전 FPS 계측으로 환산하지 않음 |


새 증거 정본은 위 r5 문서와 이 증거 폴더의 `save-reopen-receipt.json`·`reopened-runtime.json`·`reopened-actual.png`·`public-browser-warn-error-log.json`·`body-gif-receipt.json`·`fx-playback-frames/capture.json`이다. `actual-tail-readability-body-only.gif`와 `actual-tail-readability-with-impact.gif`는 public Play의 실제 JPEG 재생 기록이며 합성·가상 frame0이다.

## 2026-10-11 현행 · 실제 idle와 꼬리치기 전환 r6

[r6 idle·전환 정본](FDG_TAIL_IDLE_TRANSITION_20261011.md)을 따른다. 승인 r5 scene을 복사하는 `tools/fdg-studio/build-hell-aberrant-idle.mjs`의 `buildTailIdleScene(baseline)`이 실제 작은 호흡·상체 무게 이동을 별도 clip으로 저작하고 같은 owner clock의 기존 clip 전환 경로로 idle→한 번 공격→idle을 연결한다. 기존 r2/r3/r4/r5 보고·배송·검사·proof 수치는 동결 이력이며 재실행·새 인수 합산0이다.

| 항목 | 현재 r6 계약 / 새 증거 |
|---|---|
| 배송 | `fixtures/hell-aberrant-tail-idle.fdg.json`=`hell-aberrant-tail-idle-scene-r6`, compact824373bytes. 별도 `.rig.json`=`hell-aberrant-tail-idle-transition-r6`, compact717356bytes. r5 원본과 기존 배송 fixture 덮어쓰기0 |
| 실제 idle / 모델 | 새 `hell-idle-breath`=`대기 · 호흡과 상체 무게 이동`, 2초/24FPS/loop true/상체6tracks/각9keys. 총3clips이며 r5 공격2종(각3초/24FPS/20tracks)은 전체 deepEqual. 3864정점/4850삼각형/32본/1재질·mesh/weights/UV/drawOrder/source PNG·발/다리/27cap 보존. ENGINE_AUTHORING·보이는 표면2.5D·nativeCombatApplied:false |
| 복귀 / 진입 설정 | node.returnTo=`{clipId:'hell-idle-breath',transitionSeconds:0.35}`, sequence.autoStart=false, entryTransitionSeconds=0.25. non-loop 끝 `time+1e-9>=duration`에서 기존 crossfade로 idle time0에1회 복귀. 진입15owner틱/0.25초·복귀21틱/0.35초, loop에서는 재복귀0 |
| 실행 / 거부 guard | 최초 ready·재열기 일반 Play/step은 현재 idle·저장 clip을 진행하며 activation0. completed/stopped 후 일반 Play도 새 회차를 만들지 않고 기존 완료 회차를 보존하며, ‘공격 1회’ Replay만 현재 clip/time에서 공격0초 진입 blend를 생성하고 같은 호출에서 즉시 arm. returnTo 노드에 transition이 있으면 setClip/replay false·pose/state 불변·UI clip/공격 비활성. 자동 복귀는 sequence disarm0·completed/회차/event/emitted/pending 보존, elapsed는 마지막 공격2.9999999999999942≈3초로 고정하여 idle node time과 구분 |
| FX / native | sequence ID=`hell-aberrant-tail-idle-impact-r6`, node=`hell-body-node`, clip=`tail-swipe-once`, startTime0.900초. 기존 ENGINE_FIXTURE `assets/vfx/fieldboss/boss_fire_impact_24_20261010.png` 640²셀/6×4/24frames/16FPS/life1.5초·scale0.16·anchor[0.5,0.5]·offset[-145,-84]·102.4×102.4px 표시 유지. attack54틱 crossing1회·trigger age0/frame0. native cooldown110/projectile life200/recover30/rec50 game-frame·attackWindow[0.15,0.85] progress 및 비환산 유지 |
| 새 데이터 / 구문 검사 | `test/fdgTailIdleTransition.test.mjs` 최초4/4 PASS, fail/skip/cancel0,2865ms. 기존 suite/PNG/native 검사 재실행0. 변경 scene runtime/schema·owner runtime/project·panel/studio·새 builder JS 최초7/7 구문 PASS를 별도 기록하고 test4에 합산하지 않음 |
| 실제 body-only 공개 | sequence만 생략한 자체 scene의 공개 Import→Play→once 선택2회→idle 자동 복귀2회. `actual-idle-tail-idle-body-only.gif`:133실제 CDP JPEG/960×540/8940ms/20335209bytes. runtime 속도 변경·합성 pose·가상 frame0 |
| 실제 shipping 공개 | 일반 Play idle 회차0→‘공격 1회’→0.900초 event1/실제 FX→idle 복귀 completed/event1/FX0. `actual-idle-tail-idle-with-impact.gif`:61실제 JPEG/960×540/4890ms/9709098bytes. 공개 Pause는 복귀 blend 뒤 idle0.8166666666666675/transitionnull에서 적용됐다. paused clip 선택의 새 entry 뒤 공개1틱으로 node/clock/transition.elapsed가1/60초 증가한 결과를 기록 |
| 새 저장·재열기 | 전체 public save→export→reopen→export 정확1회, 양 export2996047bytes·full JSON deepEqual·실제3864vertices/32bones pose deepEqual. saved once time1/60과 transition{fromClipId:'hell-idle-breath',fromTime:0.8333333333333343,duration:0.25,elapsed:1/60}·returnTo0.35·resources/sequence/map/camera/preview 보존. reload owner0·ready/activation0/event0/emitted0/FX0. 이후 일반 Play owner4.39999999999999/idle1.4166666666666665/transitionnull·ready0/event0/FX0, 오발0 |
| 시각 / cache / 증거 | 이번 보이는 idle·진입·공격·idle복귀·FX 가독성 VISUAL VERDICT: PASS / 전체 모델 RETOUCH, 정확1건 SOURCE_GAP=단일 정면 PNG에 없는 숨은 표면. 공개 수집 warn/error0. native게임/전체3D/Windows/GPU 인수0. URL `index.html?v=tail-idle-r6-final`, Studio/owner/project/scene schema/consumer/panel graph `tail-idle-r6`, fixture `tail-idle-r6-fixture`; pure math/texture r4 cache 및 독립 lab r3 기본 preset 유지 |

새 증거는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-idle-transition-r6/`의 `first-tests-tail-idle-transition.log`, `targeted-tail-idle-transition-receipt.json`·`targeted-tail-idle-transition-metrics.json`·`syntax-checks.json`, 실제 GIF 두 개, `save-reopen-receipt.json`·`reopened-runtime.json`·`before-reopen-pose.json`·`reopened-pose.json`·`post-reopen-idle-runtime.json`·`public-browser-warn-error-log.json`이다. 구현·자체 검수 완료 범위이며 기존 native 전투·맵·source/PNG·타인 WIP의 인수를 바꾸지 않는다.

| r6 한정 계측 | 정확한 새 결과 / 단위 |
|---|---|
| idle sample / 실제 변형 | 13개 새sample·최대 actual LBS drift0.0646545163006511model-unit =19.39635489019533source-equivalent px(300px/model). placement80px/model. clip fps24와 owner60Hz 별도 |
| 고정 | 발/leg/27cap drift·closure0. 원 PNG·메시·가중치 재검수 수치로 합산하지 않음 |
| loop seam | t=2−1e−6와0의 actual vertex drift1.1096062660021704e−7model-unit; 정확t0/t2 bind offset 일치 |
| entry / return | 15/21owner틱·0.25/0.35초, t0 vertices/bones 동일·중간blend feet/cap0. 자동 복귀는 동일 sequence 완료 상태를 유지 |
| body 수집 vs 이후 Pause | 마지막 수집 owner8.233333333333322/idle0.5833333333333335초, 이후 정상 공개 Pause owner14.650000000000308/idle0.9999999999999947초. GIF 종료와 후속 pause 시각은 별개 |
| 비교 경계 | 실제JPEG두GIF/새4개 검사의 한정 결과이며 frame 합성·속도강제0. GPU/Windows/native 성능·전체 제품 FPS 인증0 |

## 2026-10-11 현행 r7 opt-in · 흉곽·골반 깊이 계약

아래는 r7 제작에 확정된 선택 계약이다. 승인 r6 배송·클립 전환·FX 및 기존 보고·검사·proof 수치는 그대로 보존한다. r7 geometry·최종 배송·새 공개 시각/저장 결과는 아래에 기록한다. 새 전용 데이터/consumer 검사도 최초 결과만 아래에 기록하며 기존 인수 수치에 합산하지 않는다. 현재 제작·검수 정본은 [흉곽·골반 깊이 r7](FDG_TORSO_DEPTH_20261011.md)이다.

| 항목 | r7 선택 계약 / 적용 범위 |
|---|---|
| `mesh.faceColors` | optional 배열. 있으면 정확히 `mesh.triangles.length`개이며 각 값은 `null` 또는 RGB6자리 hex `#rrggbb`. 생략/null인 면은 기존 선택 material/UV 소비 경로를 유지 |
| 명시 색 면의 권위 | 색이 지정된 면만 원화 없는 짧은 sidewall의 ENGINE_AUTHORING plain flat face로 표시. 기존 앞면 UV·source PNG에 tint를 덧붙이지 않으며 숨은 표면을 원본에서 복원한 것으로 표시하지 않음 |
| 평가·소비 | `evaluateRig`는 선택 faceColors를 독립 복사. Scene와 RigPreview는 원본 texture와 명시 authoring flat face를 구분해 같은 CPU Canvas 경로로 소비 |
| 카운터 | `textureDraws`는 실제 성공 `drawImage` 수, 신규 `authoringDraws`는 성공 flat `fill` 수. Scene `drawNode()`의 textured 혼합 경로 반환은 두 수의 합이며 RigPreview는 snapshot에 두 카운터를 제공. plain material에서는 명시 색 fill1과 기존 면 fill+stroke2를 합산. GPU draw call이나 성능 인증 수치가 아님 |
| 검수 상태 | 실제 공개 재생·자기 저장·재열기·한정 시각 판정과 새 targeted6/6을 아래 r7 새 증거로 구분. 기존 suite/PNG/Windows/native/전체3D 인수를 새 선택 필드로 승격하지 않음 |
| 새 제작 경로 | builder `tools/fdg-studio/build-hell-aberrant-torso.mjs`, 별도 `fixtures/hell-aberrant-torso-depth.rig.json`·`fixtures/hell-aberrant-torso-depth.fdg.json`. geometry·최종 파일 수치·cache·공개 검수 값은 아래 확정 표에 기록 |
| 범위 | 같은 r6 계열의 실제 흉곽·골반 앞면 곡률/단면/짧은 sidewall 깊이 저작. 기존 r6 원본·32본·발/다리/tail·idle→attack→idle·FX 보존 계약. 새 source art/texture·PBR·GPU backend·native 전투·맵 변경0, canonical3D 복원 인수0 |

r7 문서 백업과 신규 동기화 증거는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-hell-torso-depth-r7/`에서 관리한다. 기존 r2/r3/r4/r5/r6 자료는 동결하며 새 검수 결과로 덮어쓰거나 재실행·합산하지 않는다.

### r7 geometry 확정값

| 항목 | 현재 빌더·fixture에서 확인한 값 |
|---|---|
| 저작 데이터 | `buildTorsoDepthScene(baseline)`이 승인 r6 scene을 독립 복사. rig ID=`hell-aberrant-torso-depth-r7`, scene ID=`hell-aberrant-torso-depth-scene-r7`, 이름=`지옥기형 · 흉곽과 골반 저작 두께`. 별도 `tools/fdg-studio/fixtures/hell-aberrant-torso-depth.{rig.json,fdg.json}` |
| 메시 증분 | **3895정점/4894삼각형** = 기존3864정점/4850삼각형 + rear31정점/명시 색44면. atomic side segment22개=chest13/pelvis9; 원 front 삼각형4850·원 XY/UV/weights/layer 보존, 새 side face layer0 |
| 앞면 깊이 | torso 앞면57정점만 양의Z 저작(chest40: sourceY<632px, pelvis17). 실제 최대Z=`0.2787834444444444` model units. 원화에서 복원한 해부학 수치가 아님 |
| side·분리 | rearZ chest=`−0.18`, pelvis=`−0.12` model units. 색 chest=`#756871`, pelvis=`#665b65`; `mesh.faceColors[0..4849]`는 null, 뒤44개는 명시 색. 새 rear 정점은 대응 front XY/UV 및 weights 복사 |
| 접합·원화 | shared non-torso front Z=0. T-junction 중간점 Z를 끝점의 선형 보간으로 맞추는40개 constraint·12passes; metadata max error=`1.3877787807814457e−17` model units, source collinearity tolerance=`0.0001`px. source832×1248·300 source px/model unit·origin[500,1140] 유지 |
| 유지·권위 | 같은32본/3clips/기존1 texture material·발/다리/tail·idle→attack→idle·r6 sequence/FX/native/map 보존. `depthAuthoring.authority:'ENGINE_AUTHORING'`, `revision:'r7'`, `sourceRecovered:false`, `fullBackAuthored:false`, `sourceTextureChanged:false`, `limbsChanged:false`, `nativeCombatApplied:false`. 짧은 sidewall이며 전체 뒷면·canonical3D 완료 선언0 |
| 새 인수 상태 | geometry·최종 배송·공개 재생/카메라·자기 저장·시각 결과는 아래 새 증거로 기록. 새 syntax12/12와 최초 targeted6/6을 구분. r6·old 검사와 proof 재실행/합산0 |

ROI·단면 ring·22개 명시 side segment와 Z 수식의 정확한 표는 [리그 데이터의 r7 geometry 정의](FDG_RIG_PROJECT.md)를 따른다.

### r7 현재 배송·공개 검수 · 새 전용 검사 완료

위 r6의 ‘현행/현재’ 표기는 당시 승인 기록이며 그 데이터·수치·proof 행을 보존한다. 현재 배송은 r7의 독립 torso-depth fixture다. r7의 선택 faceColors·깊이 geometry가 있는 리그에 아래 확장을 적용하며, 필드가 없는 기존 리그는 원래 material/UV·plain shade 계약을 유지한다.

| 항목 | r7 현재 값 / 새 실제 증거 |
|---|---|
| scene 배송 | `tools/fdg-studio/fixtures/hell-aberrant-torso-depth.fdg.json`, compact **859941bytes**, SHA256=`98ea7bf3399e90f4e34f3b244ec7dfa76d9bcc81ba6e5bd1598d0ba759a8a3c9` |
| rig 배송 | `tools/fdg-studio/fixtures/hell-aberrant-torso-depth.rig.json`, compact **752920bytes**, SHA256=`744a087e7e71b142846c7eee614d7c07d2dd1514bbf09cb3a55c0027ec7a6385` |
| 정면 실제 재생 | yaw0/pitch0, 공개 Play→공격1회→자동 idle. `front-playback.json`·`front-idle-attack-idle.gif`: 실제 CDP JPEG **61장**, GIF **5790ms / 960×540 / 9757923bytes**. textureDraws4850 / authoringDraws0; side의 projected area가0이므로 flat fill0. 완료 activation1/event1/emitted1/FX0 |
| 작은 오른쪽 실제 재생 | yaw+22°=`0.3839724354387525`rad, pitch6°=`0.10471975511965977`rad. `right-playback.json`·`right-depth-idle-attack-idle.gif`: 실제 JPEG **59장**, GIF **5620ms / 960×540 / 9349266bytes**. textureDraws4850 / authoringDraws44; 공개 Play→공격1회→자동 idle, 완료 activation1/event1/emitted1/FX0 |
| 좌우 화면·카메라 | `left-yaw-minus22-pitch6.png`·`right-yaw22-pitch6.png`는 실제 native UI로 yaw±22°/pitch6°를 저장 모델에 반영한 화면. DOM fill/Tab만으로 값 표시를 바꾸면 store는 변경0이므로 실제 native Up으로 commit한 값이 기준. 이전 candidate side 실험 파일은 최종 proof로 사용하지 않음 |
| 자기 저장·재열기 | public save1/reload1/export2. 두 export **3130350bytes**씩, fullJSON·mesh/weights/materials/clips·3895 posed vertices/32 bone positions 전후 equal. saved idle time=`1.649999999999999`초와 실제 camera+22°/6° 보존. reload owner clock0·ready/activation0/event0/FX0. `save-reopen-receipt.json`·`saved-reopened.png` |
| 새 구문 검사 | `new-syntax.json`: 변경된12modules의 신규 구문 검사 **12/12 PASS**. 전용6개 데이터/consumer 검사와 별도 기록, old suite/proof 재실행0 |
| 새 전용 검사 | `test/fdgTorsoDepth.test.mjs` 최초 **6/6 PASS**, **1300.32ms**, fail/cancel/skip0, 재실행0. 보존된 front prefix·실제 curvature/side/T-junction·strict faceColors17무효 구성·평가 독립 복사·Scene/Preview 혼합 Canvas·9motion/owner FX/return/capture를 검증. `first-tests-torso-depth.log`·`new-tests.json`·`targeted-torso-depth-receipt.json`·`targeted-torso-depth-metrics.json` |
| 새 CPU 수치 | chest40의 Z=`0.026402068371157716..0.2787834444444444`, pelvis17=`0.046791111111111276..0.1995` model units; same-Y 최대 sagitta 각각0.2787834444444444/0.1995model. bind side 면적=`0.0003999999999999959..0.005531726674375732`model². welded/shared seam error0,9samples의 limb/worldbone/foot/27capXY/front-rearXY drift0. 검사 epsilon=`1e−7`model은 렌더 projected area epsilon1e−9와 별도 |
| synthetic와 actual 구분 | mock Scene/Preview 혼합1texture+1flat fill/Preview Image1·extraRAF0. 배송 데이터의 CPU renderer yaw0.5/pitch0.25rad는 texture4850+authoring44(chest26/pelvis18)=4894Canvasops. 위 실제 공개±22°/pitch6° 증거와 별도 좌표·검수 |
| owner 데이터 검사 | 같은 owner .9초 crossing에서 새FX age0/frame0,90틱1.5초만료,3초completed 후21틱/.35초idle복귀. faceColors4894 capture 보존; setProject 후 mock owner 기존 Image21개 수 불변·clock0/readyactivation0/FX0, dispose RAF/listener/observer 정리. 새 Image21개를 추가했다는 뜻이 아님 |
| 시각 판정 | root가 실제 새 정면·작은 좌우·공격 frame으로 이번 흉곽/골반 깊이·동작/FX 가독성 범위를 확인한 **VISUAL VERDICT: PASS**. 전체 모델 **RETOUCH**, 정확1건 **SOURCE_GAP**=원화 없는 전체 뒷면·숨은 side 표면. authoring 추정 side는 새 canonical 원화/전체3D 복원 인수가 아님 |
| cache·기본 preset | index→studio 및 rig.html→rig-studio와 현재 rig 데이터/수학/texture/Scene/Preview graph query=`torso-depth-r7`. Studio 배송 fetch=`hell-aberrant-torso-depth.fdg.json?v=torso-depth-r7-fixture`. 독립 rig lab 기본 fetch는 r3 `hell-aberrant-motion.rig.json?v=tail-continuity-r3-final` 유지. scene schema의 isLocalAsset import는 기존 `project.js?v=tail-sequence-r4-final` 유지 |
| 보호 범위 | 이번 source PNG 읽기/수정0·r6 원본 fixture 덮어쓰기0·main/native전투/main-save/LOCK/맵/타인WIP 변경0. 기존 suite·PNG·기존 proof 재검수0, Windows/GPU/본편 성능 인수0. local checkpoint는 root가 별도 기록 |
## 2026-10-11 현행 r8 · 몸통 단면 연결과 피부 톤

기존 r7·r6 데이터·검사·proof 행은 당시 동결 기록으로 보존한다. root의 r7 최종 해석은 기술 한정 인수/시각 RETOUCH다. 겨드랑이·흉곽 아래의 밝은 grey flat 패널과 약한 둥근 볼륨을 후속 저작으로 보정하며, 이전 한정 시각 PASS 기록을 새 모델 전체 인수로 읽지 않는다. 현재 제작·새 검수 정본은 root 소유 [몸통 단면 연결·톤 마감 r8](FDG_TORSO_SIDE_FINISH_20261011.md)이다.

| 현재 변경 / 정의 | r8 계약과 근거 |
|---|---|
| 저작 범위 | `tools/fdg-studio/build-hell-aberrant-torso-side-finish.mjs`의 `buildTorsoSideFinishScene(baseline)`이 동결 r7을 독립 복사. 기존 rear31정점에 sourceY별 연속 piecewise-linear factor를 적용하여 Z24개만 변경·7개 plateau 동일. 기존44side face 전부 유지하고 같은 faceColors 소비로 더 어두운 warm charcoal 10종 facewise 톤을 지정 |
| 보존 | 원3864정점 XYZ·앞면 UV/원 texture/weights/topology/layer 보존. 총3895정점/4894면·32본/3clips·발/다리/27cap/tail·idle→attack→idle·기존 sequence/FX/native/map 동일. 기존 plain renderer/consumer/backend 사용, 새 source/texture/PBR/GPU/schema 추가0 |
| 깊이·톤 | rear 실제Z chest=`−0.18..−0.12240000000000001`, pelvis=`−0.12..−0.0816` model units. source Y ring 보간 factor로 `Zr8=Zr7×factor(part,sourceY)`; 각 side face 색은 해당 front endpoint 평균 sourceY의 `toneFactor=.9+.1×factor`로 지정 base RGB를 곱하고 성분별 round. 원 source 앞면 tint가 아님 |
| 현재값의 권위 | 복사된 `provenance.depthAuthoring.rearDepthModel/sideColors`는 동결된 r7 저작 이력이며 현재 r8 값이 아니다. 실제 runtime 값은 `mesh.vertices`·`mesh.faceColors`, r8 저작 정의/배송 record는 `provenance.sideFinish`가 정본 |
| 현재 배송 | 별도 `tools/fdg-studio/fixtures/hell-aberrant-torso-side-finish.fdg.json`=`hell-aberrant-torso-side-finish-scene-r8`, compact867875bytes; `.rig.json`=`hell-aberrant-torso-side-finish-r8`, compact760840bytes. r7/r6 원본 덮어쓰기0 |
| 현재 cache | 변경은 index의 `studio.js?v=torso-side-finish-r8`와 Studio의 `hell-aberrant-torso-side-finish.fdg.json?v=torso-side-finish-r8-fixture` fetch 두 key. 기존 r7 rig/Scene/Preview 소비 graph·rig.html과 독립 lab r3 기본 preset 유지 |
| 새 실제 재생·시각 | `playback.json`·`side-finish-idle-attack-idle.gif`: 실제60JPEGframes / 5540ms / 960×540 / 9416644bytes. 공개 Play→공격1회→자동 idle, activation1/event1/emitted1/종료FX0, texture4850+authoring44·side 숨김0. root가 새 `front.png`·`left-minus22-pitch6.png`·`right22-pitch6.png`의 정면/작은 좌우±22°/pitch6°와 오른쪽 실제 재생 body+FX로 밝은 패널 감소·겨드랑이/흉곽/골반 연결을 확인한 한정 VISUAL PASS. 전체 모델 RETOUCH/숨은 표면 SOURCE_GAP1 유지 |
| 새 저장·재열기 | `save-reopen-receipt.json`: public save1 / actual reload1 / export2. fullProject/fullExportJSON·mesh/weights/materials/clips·3895 posed vertices/32 bone positions equal. 저장 idle=`1.5499999999999994`초/yaw22°/pitch6° 보존; after owner clock0·ready/activation0/event0/FX0, 두 export3151574bytes. 실제 r8 module 재열기는 `reopened-module.json`으로 확인; 앞 dirty candidate의 페이지 교체 실패 reload/goto는 채택 증거가 아님 |
| 새 구문·관측 | `new-syntax.json`: 실제 변경 `tools/fdg-studio/studio.js`·`build-hell-aberrant-torso-side-finish.mjs`의 **2/2 PASS**. index HTML entry 변경1개를 JS 구문 검사로 합산하지 않음. 새 공개 관측 pageErrors0, 구 proof 재조회0 |
| 새 전용 검사 | `test/fdgTorsoSideFinish.test.mjs` 최초 **4/4 PASS / 2175.09ms**, fail/cancel/skip0·재실행0. front-prefix/geometry보존·11개 독립 knot/7plateau·44톤·9motion/실제CPU소비·in-memory capture/JSON reload를 확인. `new-tests.json`·`targeted-torso-side-finish-metrics.json`·`first-tests-torso-side-finish.log`; 기존 r7의6개 및 old suite와 합산0 |
| 새 CPU 관측 | 9phase의 원3864prefix LBS/worldbones/foot/27capXY/front-rear **hierarchy-world model XY** drift0. 전체 side 면적 min=`0.00037996251032275445`/max=`0.004940618460543637`model², 최소Zspan=`0.0816`model=`24.48`source-equivalent px(투영 화면 폭 아님). ±22°yaw/+6°pitch CPU에서 texture4850+plain44=4894Canvasops, 현44색 정확 소비 |
| 색 비교의 의미 | encoded8bit RGB 가중합 `0.2126R+0.7152G+0.0722B`의 각face r8/r7 최대비=`0.33042556994644995`(<0.4), 각segment front role 톤>rear role 톤. 동결된 r7의44side 색과의 저작 수치 비교이며 원PNG/source색·physical photometry 비교가 아님 |
| 새 인수 상태 | geometry/색/배송·새 실제 재생·자기 저장/재열기·semantic4/syntax2·한정 시각 검수 완료. old suite/source PNG/proof 재검수·새 합산0. 현재 공개 데모 ID·r8배송fetch 확인은 `public-preset-ready.json`·`public-preset-ready.png`. 전체 모델 RETOUCH/단1개 SOURCE_GAP 유지, 이번 추정 단면은 원화 없는 숨은 표면을 복원한 canonical3D가 아님 |

ring·palette·색 생성·메타데이터의 정확한 정의는 [리그 프로젝트 r8 계약](FDG_RIG_PROJECT.md)에 기록한다. 새 증거와 수정 전17문서 백업은 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-hell-torso-side-finish-r8`에서 관리하며 이전 자료를 덮어쓰지 않는다.

## 2026-10-11 다크드루이드 NORMAL · 보이는 본체 저작 r1

기존 Hell r2..r8의 ‘현재/현행 배송’·수치·proof는 해당 보스의 동결 이력이다. 아래는 별도 다크드루이드 NORMAL authoring query의 새 첫 사본이다. 기본 Hell preset·standalone riglab 기본값·본편 NORMAL/데모 피날레·마케팅/트레일러 계약은 바꾸지 않는다. 기존 보편 API와 schema 한계는 유지하며 이 사본의 명시 clip/returnTo 설정만 적용한다.

| 항목 | 현재 다크드루이드 저작 계약 |
|---|---|
| 승인 source / 실제 사본 | 기존 `boss_dark_druid_f0.png`, 355×541 RGBA / 479258B. `ENGINE_AUTHORING` visible-surface-2.5D, 3289정점/4644삼각형/19본/1재질/2clips. 원화1장을 UV texture로 소비하며 새24장 방향별 sprite로 계산하지 않음 |
| 실제 동작 / 시간 | `dark-druid-idle` 2초/24FPS/loop/10tracks×9keys → `dark-druid-staff-strike` 2.4초/24FPS/nonloop/12tracks×9keys → idle. 공개 clip 선택 entry0.25초=15owner틱; `returnTo.transitionSeconds=0.35`=21owner틱. 같은60Hz owner 사용 |
| 새 계측 범위 | 신규5범위 최종 PASS: 최초3 PASS/2 harness FAIL(−0/0 JSON canonical 비교·Canvas stub ellipse 누락), 실패2만 수리 후2 PASS. 최초성공3 재실행0·기존 suite0·production fault0. 새 구문3대상(builder/studio/panel) PASS |
| CPU 데이터 | 15phase: boot115정점 drift0, hand/staff skin matrix·weld drift0. idle0.5초 최대LBS이동0.04178318974275876 model; idle2초/attack2.4초 closure0; return t0 error6.280369834735101e-16 model |
| draw 계수 | 실제 공개 정면yaw0/pitch0 textureDraws4622/authoringDraws0; yaw±22°/pitch6° textureDraws4622/authoringDraws22. 단면은 기존 flat fill, 원화앞면 tint/stroke0·새texture/renderer/GPU/PBR0 |
| 성능 해석 | drawImage/flatfill 호출 수와 새CPU 데이터 검사는 Windows/NW.js·본편 다수 적 전투 FPS·VRAM/GPU·canonical3D 성능 인증이 아님 |
| 제품 판정 | 좁은 visiblebody authoring **VISUAL PASS**(원화 실루엣·손/지팡이·장화, 정면/작은 각도·실제 noFX 타격/복귀). 완전한 전방위3D·본편 native 소비 **RETOUCH**; 정확히1개의 SOURCE_GAP=원화에 없는 정식 뒤쪽·겨드랑이·옷 내부 표면/텍스처 |

현재 구현·실제 검수의 정본은 [다크드루이드 NORMAL 본체 제작](FDG_DARK_DRUID_BODY_20261011.md)이다. 숫자·키/ROI/weights 정의는 [리그 데이터 계약](FDG_RIG_PROJECT.md)를 따른다. 이전 suite/PNG/완료 proof의 재실행·합산0이다.

mock consumer capture는 attack0.09999999999999999초/entry elapsed0.09999999999999999초를 저장하고 reload clock0·pose/bones drift0, sharedImage20→20·추가수명0을 확인했다. root 실제 publicsave는 idle1.183333333333334초로 두근거를 구분한다.

## 2026-10-11 다크드루이드 지팡이 타격 · 현행 r2

위 다크드루이드 r1의 ‘현재/현행’·9키 공격배열·배송SHA/bytes·검사/사진/GIF/저장 결과는 날짜가 있는 r1 동결 이력이다. 아래가 같은 Druid authoring query의 현재 r2 배송이다. 기존 Hell r2..r8/중단r9 WIP·protected/native/marketing 계약은 보존하며 이전 성공을 새 검사와 합산하지 않는다.

| 항목 | 현재 r2 계약 |
|---|---|
| 현재 attack/시간 | `dark-druid-staff-strike` 2.4초/24FPS/nonloop/12tracks×10keys; time=[0,0.25,0.65,0.9,1.04,1.1,1.25,1.65,2,2.4]초. 준비0..0.9/타격0.9..1.25/회복1.25..2.4초; 기본entry0.25초(15owner틱)/idlereturn0.35초(21틱) 보존 |
| 새검사 범위 | 신규 test/fdgDarkDruidStaffReadability.test.mjs 최초2/2PASS(948.8295ms), fail/cancel/skip0·재실행0. r1/Hell/old suite0·기존geometry/Canvas audit0; 새syntax studio/builder 각1회PASS(2대상). technicaltest를visualPASS로승격0 |
| 실제 movement | source-equivalent probe[75,82]: 준비0.9초[66.54301388253896,77.21874976139787]→peak1.1초[103.94808931697101,108.38274919430683]; Δ[37.40507543443205,31.163999432908952]sourcepx, scale80에서는[19.949373565030424,16.62079969755144]scenepx. +X전방/+Y하강이며 native공격거리/피해로 환산0 |
| 관측 metrics | 17phase boot115정점 drift0·hand/staff skin/weld0. head/staff10key maxerror2.220446049250313e-16; triangle177/351의6개 edgefactor0.9999999999999997..1.0000000000000306. key일치이며 전체연속시간skin동일constraint로 확대0 |
| 회복 | settle1.25초 peak대비Δ[−2.181966940056256,4.994432810657997]sourcepx, recovery1.65초 bind잔차6.565224212440842sourcepx, 2.4초끝0. 2초idle변경0 |
| 해석 | 새trajectory/clipcapture기술검사 범위이며원PNGfullaudit·기존Canvas/geometry·Windows/FPS/GPU/성능 인증재실행0. 최종commonbodydrive/headtranslation 타격 가독성의 보이는2.5D **VISUAL PASS**. 전방위3D/native 전체 **RETOUCH**, 잔여 정확히1: `SOURCE_GAP: 원화 없는 뒤쪽·겨드랑이·옷 속 정본 표면/텍스처 미확보` |

현재 정본은 [다크드루이드 지팡이 타격 가독성](FDG_DARK_DRUID_STAFF_READABILITY_20261011.md)이며, 정확한 T/R키·배송값은 [리그 데이터의 현재 r2 표](FDG_RIG_PROJECT.md)를 따른다. 새 증거 E=`/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-staff-readability-r2`; 이전r1E는덮어쓰지않는다.
