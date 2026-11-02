# 설치형 지면 배치 QA 초안 — 2026-11-02

상태: 소스 overlay 작성. Unity 컴파일·Player·시각 검수 미실행. 제품 수정은 PC 소유이며 이 파일은 QA-only다. 총괄은 정확 1403c5ee6d52c540815ab1cf70d5666b9023aa75에 helper/meta만 적용한다. b980 무데칼 helper 의존0.

## 실행

`--unity-ground-placement-capture --remodel3d --unity-quick-start --unity-qa-sandbox <절대폴더> -output <빈 절대폴더>`

명시 플래그 없으면 Boot 무동작. 네 필수 인자 누락은 exit2. 1920×1080 실제 창만 사용하며 3840은 없다. QA 로비 preview→EnterNativeTest로 실제 A2를 연다. 게임 Simulation을 별도 seed0x671403 Simulation으로 잠시 바꾸고 기존 UpdateViews/Remodel3DLate를 호출한다. 원 Simulation에는 표본 추가·Tick·RNG 호출0. 전후 private randomState 포함 필드 그래프 해시와 참조 동일성을 검증한다. NativeGame은 QA 중 disabled; 원 sim/view는 finally 복원하고 drain 직후 Quit 직전에 원 Running/enabled를 복원한다. 전용 QA 프로세스만 정상 Quit한다. launcher는 외부 저장11/currentPrefs2 raw백업·복원과 앱/소스 SHA를 연결해야 한다.

## 표본과 소비자

| 소비자 | 표본 | 기대 계약 |
|---|---|---|
| NativeSkillView | spikeTrap, holyDome 및 두 LineRenderer ring | 지면 접촉/지면 법선 |
| NativeBossView | SeekerMines, Mine-first→Projectile-control→Mine-reused | Mine 지면, 일반탄 기존 billboard; renderer entity ID/atlasRect/UV로 pool 재사용 확인 |
| NativeBossView FieldZones | trap, iceZone, blizzard | 실제 sprite/mesh/line 표시 정점의 지면 접촉 |
| NativeBossView | LavaPools, PoisonPools, GroundRing(ChaseAoe), Fissures, TideWaves | 같은 지면 assertion |
| NativeSkillView 대조 | malice orb, slam wave/flash | 기존 centered pivot, 카메라 tilt |
| NativeGame 대조 | character | 기존 actor billboard 법선, 지면형으로 판정하지 않음 |
| VfxWorld | ToWorld / ToWorldMetres, Active true/false | true=GroundY+lift, false=기존height; lift .013m, 오차 .0001m |
| NativeDruidTelegraphView | 별도 sample bossSlamWind, Active=false | local XY/z0 and original sorting depth; flat arena contract, 3D 지면 assertion 적용0 |

위 required20개를 generated/missing으로 출력한다. 뷰 소유 renderer를 reflection으로 찾아 sprite뿐 아니라 mesh와 line을 측정하므로 미래 ground mesh helper 이름에 의존하지 않는다. 각 표본의 활성 renderer 없으면 missing/FAIL이다. Ground pivot target is GroundY+0; displayed surface target is GroundY+.025m and ground LineRenderer target is GroundY+.03m. Raw height delta and bias-subtracted residual are both retained. Contact residual and pivot hard gate are .02m. Only a sampled ground span <=.001m uses a vertical normal dot >=.99 hard gate; curved/slope normals are diagnostics with every displayed vertex still contact-checked. 목교는 별도 임의 높이를 만들지 않고 현재 NativeRemodel3D.GroundY 계약에 비춰 잔차를 기록한다. 실제 mesh 표면 높이와 GroundY가 다르면 기술 PASS를 주장할 수 없다. baseline expected-fail를 성공으로 전환하지 않는다. 전체 누락0·실패0·복원/무음/device/해상도 gate 충족만 exit0, 나머지는 exit2.

위치 원문: 기존 mac-current-decal-receiver-20261102/map/ground-map-receipt.json. Core=(world.x*100,-world.z*100). 흙 world(40.2,-77), 뿌리경사(36.2916,-73.17135), 실제 목교(43.2,-71.8). 첫 위치가 수학적 완전 평면이라는 가정은 하지 않는다. 모든 정점에서 현재 GroundY를 기록한다. 반드시 root에서 baseline 흙 표본 접촉/법선이 실제 FAIL인지 확인한다.

## 출력과 미검수

`ground-placement-receipt.json`: source1403, device/API/실창크기, Runtime/Core DLL SHA(Assembly.Location 미제공 시 launcher 연결), required/generated/missing, 모든 row의 core 좌표·활성 renderer ID·pivot lift·normal/expectedNormal·세계정점·atlasRect/UV·실패와 screenshot 경로, 원 sim 해시/복원, Listener pause/volume/peak/DirectVideo. 3곳×20소비자 원본1920 PNG를 출력한다. 자동 geometry PASS와 실제 원본1x visual PASS는 별도다.

조사: docs 전체에서 지뢰/장판/FootLift/spikeTrap/holyDome 관련 88문서·351매칭줄을 확인했다. 정확1403 NativeSkillView/NativeBossView, Core hazard/skill 모델, Remodel3DBillboards, VfxWorld가 1차 코드 근거다. MAP guideline v0.9 전체를 읽었다. 기존 맵 전체 RETOUCH/ImpactR4 FAIL 보존.

컴파일 및 QA 주의: NativeGame의 Simulation/Running private setter는 reflection, UpdateViews/Remodel3DLate private 메서드도 reflection 사용. Core 모델은1403 공개 필드 사용. telegraph 표본은 신규 sample DruidData에만 생성한다. 이 초안의 reflection 경로·mesh 생성 여부·실창 비가림·character pixel actor 법선 기준·미디어 drain은 실제 baseline에서 검증 필요. 원 game snapshot 해시가 달라지면 복원 PASS 금지. 실제 원본을 저장하지 않은 채 시각 PASS 금지.

## MAP PRODUCTION REPORT (§23)

STAGE: A2 기존 필드 설치형 접촉 QA 설계, 제작0.
MASTER/OUTER MASS/LARGE/MEDIUM/PLAYABLE/LANDMARK: 기존 유지·재검수0.
GROUND: 표시 정점/법선/접촉 assertion 설계, 실제 검수 미실행.
CAMERA QA: START 흙·EARLY 뿌리·목교1920 표본 계획. ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 미검수.
TECH QA: 구현 초안; route/collision/pageerror/404/seam/loading/performance 미검수.
FILES: GroundPlacementCapture.cs/meta와 본 문서 overlay만 소유. 공유 checkout 수정0.
GIT: commit/push/build/deploy는 총괄 소유, 이 작성자는 미실행.
VISUAL VERDICT: RETOUCH (초안·실제 Player 미검수, 맵 전체 기존판정 유지).
NEXT PASS: 총괄 exact1403 baseline 컴파일→원본1920 FAIL 수치→PC 수정후 같은 assertion 재검수.


## Current pre-execution review contract

위 초기 초안의 assertion 설명보다 이 절과 현재 helper 코드가 우선한다.

- Renderer 필드 발견 시 같은 GO와 자식 Renderer를 모두 수집한다. 꺼진 SpriteRenderer를 대체한 활성 MeshRenderer도 측정하며 assertionScope에 실제 표시 sibling/child임을 기록한다.
- Malice trail은 4개 history를 넣고 실제 활성화한다. UpdateViews 직후와 billboard 후의 월드 점 보존을 검사하며 sprite billboard normal은 적용하지 않는다. 중심 orb는 원문 GroundY+.25m/tilt, slam은 중심0m 계약이다.
- Telegraph2D는 원문 Mb.Add의 local XY/z0와 under/over sortingOrder(-8985/30000)를 검사한다. world z0 강제는 없으며 실제 world depth/정점은 기록한다.
- 지면 접촉은 모든 정점과 pivot의 .02m hard gate다. 샘플의 GroundY 높이 범위가 .001m 이하일 때만 수직 normal 내적 절댓값 .99를 hard gate로 쓴다. 경사·굽은 면의 첫 삼각형 normal은 diagnosticOnly로 기록하며 중앙 normal로 전체 mesh를 탈락시키지 않는다. 이는 실행 전에 고정한 계약이다.
- 초기 directory/field-entry reflection도 Execute iterator를 outer MoveNext/Dispose exception harness가 처리한다. 예외를 receipt에 기록하고 소유앱 Quit2로 끝낸다. 기존 receipt는 고유 실패파일명으로 보존한다.
- Unity6.7 API에 맞춰 renderer identity는 GetEntityId().ToString() 문자열이며 FindAnyObjectByType을 사용한다. 정적 컴파일 및 실제 Unity 최종 검수는 총괄 소유다.

## 실행 전 95d4f076 draw 계약 고정 — 이전 접촉 설명보다 우선

제품 후보는 95d4f07626f9c3939b3f8b1202e8de36320b2425다. 총괄의1403 RED/95 GREEN 모두 같은 QA 소스와 아래 기대값을 사용한다.

- 원 source pivot 기대 높이는 GroundY+0m이다. 실제 표시 surface(sprite/mesh)의 expectedDrawOffset은 .025m, holyDome ground LineRenderer ring은 .03m다. JSON은 raw GroundY차(maxGroundError), expectedDrawOffset, bias 제외 maxBiasResidual을 모두 기록한다. hard gate .02m는 bias 제외 residual 및 source pivot에 적용한다. 원 pivot과 mesh 정점을 혼동하지 않는다.
- source.enabled가 true여도 forceRenderingOff=true면 실제 표시에서 제외한다. 같은 GO/자식의 활성 mesh가 표시실체다. 원 source atlasRect/sourceSpriteUv와 표시 mesh UV/정점수/삼각형수/색/shader/sharedMaterial/_Opacity/sortingOrder/entity 문자열을 기록한다. 공식 surface topology289정점/512삼각형은 실측 필드로 남긴다.
- 추가 ground-lifecycle scope는 별도 NativeBossView+별도 GO에서 실제 제품 pool을 구동한다. Mine→일반탄→Mine entity 보존, source.enabled=false/GO비활성 때 ground draw 꺼짐, Active=false 전환의 기존 sprite forceRenderingOff/회전/scale 복원 및 mesh 비활성, Destroy 후 source/child 소멸을 검사한다. 미래 helper type 컴파일 의존0. baseline에 표시 mesh가 없으면 이 scope 자체 FAIL이며 성공으로 회피하지 않는다. required21 scope(기존20×3위치+격리 lifecycle1)다.
- VfxWorld Active/비활성 계약과 일반탄·강타·악의구·캐릭터 계약은 유지한다. 최종 컴파일/실제 RED·GREEN/시각 검수는 아직 수행하지 않았다.

2D lifecycle drives sample.Stage.InArena=true with generated sample-only BossArenaLayout, then restores both fields in finally. Active=false alone would be re-enabled by the product Remodel3DSync and is not used as a transition oracle.

## QA revision before full baseline run

First actual ARM641403+QA run exited2 after one measured spikeTrap FAIL. The next holyDome re-used FireZone Id1 and hit a fixture NullReference (zone Items are keyed by ID); the one screenshot was black because the disabled NativeGame no longer reset the world camera mask while its separate Late driver still ran. This is incomplete baseline coverage, not the full RED acceptance. Original Simulation hash/reference restored and QA prefs raw/cache restored.

QA r2 gives spikeTrap Id1 and holyDome Id2, disables the product Late driver only while explicitly calling the original UpdateViews/Remodel3DLate, and resets the world mask before each manual update. Original Late enabled state is restored immediately before owning process Quit. No product placement change. All contact, UV and control assertion criteria remain unchanged.

Each consumer now captures the1920x1080 original window and a separate3840x1080 direct RenderTexture through official URP SingleCameraRequest/SubmitRenderRequest. The latter is not a3840 physical window claim. Camera target/aspect/rect and active RT are restored in finally.

# phase coverage QA 보충 — 실행 전 초안

입력: root overlay r2 SHA256 fd5d30d8c7b883c6c8f455cdfbf2cdd4e4e6690828d6a38e3cd789e834657566. 원 overlay 편집0. phase-coverage 복사본에서 Consumers/Populate 분기와 새 PopulatePhase만 보충했다. 기존 Measure·normal·draw offset·controls·SyncViews·capture·lifecycle·원 Simulation finally는 수정0. Unity/Player/GPU/정적컴파일/Git 변경0.

PC 95d4f076 원문에서 ChaseZone.Hit은 HitClip(druid_hit)을 생성한다. ShockClip(druid_shockring)은 bossShockWind→bossShock 전환으로 따로 생성되므로 이를 혼동하지 않는다. HitClip은 원문 ground:false, ShockClip은 ground:true다.

기존20 consumer에23 phase case를 추가해43 consumer×3site=129 row, 기존 lifecycle1을 합해 required44scope/130row다. required/generated/missing은 기존 자동회수 경로를 그대로 사용한다. 새 표본은 sample Simulation의 공개 필드만 합성한다. sample.TickCount를 case마다+256해서 앞 once-clip을 만료시키고 SyncViews로 producer 전환상태를 초기화한다. 자연 Simulation.Tick/AI/타격/RNG 진행0. 원 Simulation 필드에는 쓰지 않는다.

| source producer | 새 case | 합성 상태/표시 시점 |
|---|---|---|
| ShockClip | phase-Shock-create/hold/tail | 실제 product view에 S=bossShockWind를 먼저 보여주고 bossShock으로 전환해 spawn; born 대비 TickCount0/21/49, lifetime56 안에서 frame 변화 |
| SeekerMines | phase-Seeker-unarmed/armed | T20/61, ArmT60, R56 |
| Mine projectile | phase-Mine-imminent | Life20/Ml180으로 mp<.35; ward+MineFlashRing 동시 표시 |
| LavaPools | phase-Lava-warn/active/tail | T15/60/162, WarnT30/MaxT180; 각각 경고/유지/감쇠 |
| PoisonPools | phase-Poison-start/atlas-middle/tail | T5/30/162, MaxT180; loop frame=floor(T*.4)%24로 frame2/12/16, 초반/유지/감쇠 |
| ChaseZone | phase-Chase-warning/hit-create/hit-hold/hit-tail | Hit=false 경고 T30/Delay60; 같은 Hit zone 객체를 product view에 보여줘 HitClip spawn 후 age0/9/21, ExplT1/10/22, ExplMax24 |
| Fissure | phase-Fissure-warning/explode-create/explode-hold/explode-tail | Exploded=false 또는 실제 product view에 같은 Exploded 객체를 먼저 보여준 뒤 age0/12/27; Len100/W30/ExplR80, ring 경고·확장·감쇠 |
| TideWave | phase-Tide-create/hold/tail | Rad40/100/160, T1/60/110, MaxT120, gap.8; 72분할 구슬의 생성·유지·후기 |

종류/phase마다 serial=1000+Consumers index로 고유하며 기존 FireZone spike1/holy2를 보존한다. Chase/Fissure는 생성 warmup과 capture 사이에 같은 객체를 유지해 zoneHit/fissureExploded map-key를 재사용한다. 마지막 phase는 Tide-tail로 배치하여 Shock의 가짜 Boss/Data와 once-clip이 다음 site의 기존 consumer로 누출되지 않는다.

중요한 해석 한계: Chase hit case는 원문상 ground ring과 ground:false HitClip이 함께 출력되는 혼합 producer다. 기존 ground criterion을 바꾸지 말라는 범위를 지켜 이 row도 기존 ground=true 측정으로 수집한다. 따라서 HitClip의 billboard 정점을 ground 기준으로 FAIL 처리할 수 있다. 그 FAIL을 PC의 지면형 회귀로 단정하면 안 되며, 원본/shape별 kind·shader·scope와 함께 보아야 한다. 이 혼합 소비자의 합격 집계를 별도로 나누려면 root가 실행 전에 scope 계약을 정해야 한다. 기준 완화·expected-fail 성공 치환은 하지 않았다.

실제 원본을 보지 않은 visual PASS나 자연 생성/유지/폭발 PASS는 주장하지 않는다. 본 보충은 합성 상태에서 실제 제품 view의 표시 분기를 열기 위한 입력만 제공한다. root가 컴파일 및 RED/동일소스 GREEN을 수행한다.

## 최종 보충

phase-spikeTrap-zero / phase-holyDome-zero 추가: FireZone Id20001/20002, Type별고유, T0/MaxT180/R100. 새 zero case만 별도 MeasureZeroScale을 사용한다. source transform·정점의 유한성을 검사하고 실제 표시 정점의 면적이0인지 검사한다. source가 forceRenderingOff이거나 자식 mesh가 없거나 disabled인 정상 무표시를 실패로 만들지 않는다. source 표본 자체 부재는 coverage 누락이다. 기존 consumer 측정과 criteria/SyncViews/카메라 코드는 변경하지 않았다.

최종 기존20+새25=45 consumer×3site135row, lifecycle1 포함136row/required46 scope. 앞 본문의23/43/129/130/44는 이 최종25/45/135/136/46으로 대체한다. 마지막 phase는 holyDome-zero이며, 그 직전 각 PopulatePhase의+256 tick/빈 producer SyncViews가 이전 Shock/Hit clip을 이미 만료시킨다.

Mine 임박은 phase-Mine-imminent의 Life20/Ml180이며, 원문의 mp<.35 flash ring 분기를 연다. Shock 3case는 bossShockWind를 실제 view에 먼저 공급하고 bossShock으로 바꿔 실제 Spawn을 실행한 뒤 age0/21/49로 표시한다. source active field나 opacity/radius 값을 완화하지 않는다. 자연 AI/타격 검수는 아니다.

root의 consumer loop worldMask 보완은 이 복사본에 적용하지 않았다. root가 다음 통합에서 해당 부분만 병합해야 한다. 정적 컴파일/Unity/Player 검수는 미실행이다.

## R3 current assertion and capture validity

Consumer loop explicitly restores worldMask before its UpdateViews, preserves lineBefore, then invokes exactly one manual Remodel3DLate; the separate product Late driver remains disabled for QA. The first R2 1920 and3840 frames were visible, but later frames could be hidden, so R2 technical RED remains valid and full visual coverage is re-captured.

Lifecycle rotation/scale baseline is captured immediately before arena transition, not the first time-dependent mine pose. Actual child mesh UV min/max and first/last flip orientation must match source sprite UV within1e-5. Shared material, _MainTex, sorting layer/order are exact; all mesh colors and _Opacity agree within1e-6. Values remain recorded alongside assertions.

Source Hit/Roots/Dust texture IDs are explicit vertical burst controls by the original Clip contract; they keep billboard normals even when a Chase-hit row also contains ground rings. ShockClip remains ground. No classifier based on missing future component is used.

Player is offset -180,+80 Core pixels from each fixed target point to keep installation art visible; target/Core and all radii/colors/timing are unchanged. Both actual1920 and direct3840 frames are recaptured.

### Same-pool lifecycle contract correction before R3 execution

Mine uses addPool while the ordinary field comet uses pool, so Mine -> comet is not claimed as same-instance role reuse. Those existing rows remain separate visibility cases. The lifecycle sample uses iceZone -> ordinary magic field comet -> iceZone, which all use the normal pool. It asserts the exact same source entity and ground child hide/re-show, source enabled/GO inactive/Destroy, then actual sample arena transition. Rotation and scale are captured immediately before that transition. No direct factory/Mark role injection substitutes for actual producers.
