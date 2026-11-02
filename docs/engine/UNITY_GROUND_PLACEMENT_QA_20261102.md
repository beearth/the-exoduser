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
