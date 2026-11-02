# Unity 설치형 지면 배치 — Mac 실제 QA 계약과 기록

상태: 기준1403 실제 RED, 후보95d4 실제 정상 ARM64148행/동일앱 M1 23행 기술 PASS. 추가 GPU mip0 기여 진단12행에서 실제 내부 잔차 .157~.969m로 제품 인수 FAIL. Win64·제품 설치·공통 통합은 보류한다. 제품 배치 코드는 PC 소유, 이 문서와 Tools/GroundPlacementCapture.cs/meta는 Mac QA 소유다. 기존 무데칼 동등성 FAIL 개인 코드를 합치지 않는다.

## 실제 기준 결과

| 기준 입력 | 실제 결과 |
|---|---|
| 1403 + QA e5b4b7d3 | 첫 spikeTrap 실제 접촉 FAIL. QA의 서로 다른 FireZone ID 재사용으로 다음 case 예외, 검정 캡처. 전체 RED로 채택하지 않음. 로그·입력·identity 보존, 미완 앱 번들은 공간 확보를 위해 원문 manifest/5개 identity 파일 보존 후 정리 |
| 1403 + QA85b9fbe2 |61행=43FAIL/18대조PASS, 오류0/누락0, 원 Simulation/RNG hash·참조 복원. 같은 앱 Metal M1 23/23/exit0. 뒤 case 카메라 mask 재설정 누락이 있어 전체 시각 증거는 후속으로 대체 |
| 1403 + QA a5d174da8a94c687a7587c2590324cb93c0757aa |136행=112FAIL/24PASS, 오류0/누락0. 기존 대조18행 및 전개0크기6행 PASS. 원 Simulation hash·참조 복원. 같은 앱 Metal M1 23/23/exit0. actual1920 PNG135개 + direct3840 PNG135개, 잘못된 크기0/50KB 미만 검정 의심0 |
| 가시덫 흙 실제 수치 |원 sprite pivot lift0.8403094m, 최대 정점 ground 차이1.717096m, draw bias 제외 최대 잔차1.692096m, normalUp0.5591928. 수직 actor billboarding 오류의 실제 측정 |
| 원문 보호 |모든 제품 source는1403 원문. 별도 sample Simulation만 표본을 생성하며 원 게임 Simulation.Tick/RNG 호출0. QA prefs는 매 Player 직전 원문 백업 후 raw SHA·CFPrefs cache semantics 정확 복원 |
| 빌드 재현 |각 baseline build 전/후 Assets·Packages·ProjectSettings 전체 raw byte를 APFS snapshot으로 보존. 각773변형 경로의 전/후 SHA와 byte 보존. 과거 사라진 imported byte를 소급 증명하지 않음 |

## 실행과 격리

`--unity-ground-placement-capture --remodel3d --unity-quick-start --unity-qa-sandbox <절대폴더> -output <빈 절대폴더> -source-sha <실제 source SHA>`

명시 capture가 없으면 helper를 생성하지 않는다. 필수 격리/출력/모드 인자가 잘못되면 Quit2. NativeQaSandbox.Root로 모든 게임 저장 IO를 격리하며 실제 저장 namespace로 fallback하지 않는다. QA prefs는 sandbox와 별개인 OS 파일이므로 별도 raw+cache 백업/복원을 한다. 정상 앱의 product name/id/save path는 바꾸지 않는다.

QA는 기존 로비 preview→EnterNativeTest를 통해 실제 A2를 연다. 게임의 Simulation private setter에 별도 seed0x671403 표본을 잠시 연결하고 기존 UpdateViews/Remodel3DLate를 reflection으로 구동한다. 원 Simulation의 private randomState 포함 전체 Core 필드 그래프 hash/참조를 전후 비교한다. 게임 Update와 별도 R3Late writer를 QA 중 disabled로 두고 consumer마다 worldMask 복원→UpdateViews→line 원문 채집→단일 Remodel3DLate를 실행한다. finally에서 원 sim/views를 복원하고 drain 후 Quit 직전에 원 Running/enabled/Late enabled를 복원한다. 예외도 receipt 및 Quit2로 회수한다.

## 현재3c 전체 표본 —49 consumer×3site +2 lifecycle =149행 (이전95 전체148행)

| 소비자/단계 | seed 또는 실제 함수 | 기대 표시 계약 |
|---|---|---|
| spikeTrap/holyDome R100 |Id1/2,T30,MaxT180 |surface 지면, holy 두72점 링 지면 |
| SeekerMines / Mine-first→Projectile-control→Mine-reused |Seeker T61/ArmT60, Mine Life100/Ml180 |지뢰 지면·일반탄 billboard, 서로 다른 pool의 표시 전환을 동일 SR 재사용으로 오인하지 않음 |
| FieldZones trap/iceZone/blizzard |R20/Life180 |실제 표시 surface/층별 원 |
| LavaPools/PoisonPools/GroundRing/Fissures/TideWaves |기존 고정 생성 표본 |설치형 정점 접촉; 기존 수치/원화 불변 |
| 원문 대조 |malice orb, slam wave/flash, character, ordinary projectile |원래 centered/actor billboard. 악의구 GroundY+.25m, 강타 중심0m |
| VfxWorld 활성/비활성 |ToWorld·ToWorldMetres, lift.013m |활성=GroundY+lift, 비활성=원 height, 오차1e-4m |
| NativeDruidTelegraphView |sample bossSlamWind/Active=false |원 local XY/z0 및 under/over sorting(-8985/30000), world z0 강제나 3D 평탄화 없음 |
| Shock create/hold/tail |실제 bossShockWind→bossShock producer 전환 후 age0/21/49, lifetime56 |ShockClip 지면. 별도 Hit/Roots/Dust는 원 texture ID의 vertical burst 대조로 분리 |
| Seeker unarmed/armed·Mine imminent |T20/61,ArmT60 / Life20,Ml180 |arm 전후 원화·임박 flash ring 실제 분기 |
| Lava warn/active/tail |T15/60/162,WarnT30,MaxT180 |경고/유지/후기 |
| Poison start/middle/tail |T5/30/162,MaxT180 |실제 atlas loop frame2/12/16 |
| Chase warning/hit create/hold/tail |T30/Delay60 / hit age0/9/21,ExplT1/10/22,ExplMax24 |ground ring과 원 HitClip 세로 burst를 shape별로 구분 |
| Fissure warning/explode create/hold/tail |Exploded false 또는 age0/12/27,Len100,W30,ExplR80 |실제 producer 경고/폭발 표시 |
| Tide create/hold/tail |T1/60/110,Rad40/100/160,MaxT120,gap.8 |실제 파도 구슬 생성/유지/후기 |
| spikeTrap/holyDome T0 |Id20001/20002,T0,MaxT180,R100 |finite source/vertices·실표시 면적0, mesh 존재 강요0 |
| size-spikeTrap Lv1/20 |SkillRules.SpikeTrapRadius:300/585,Id30001/30002 |실제 함수 반환 사용, hardcoded R 대입0 |
| size-holyDome Lv1/20 |SkillRules.HolyDomeRadius:520/900,Id30003/30004 |실제 함수 반환 사용,T30,MaxT180 |
| actual ring lifecycle |holy 실제2D→3D 공유mesh 두72polygon 링|enabled/GO/owner disable·2D 원문/forceOff 복원·제거/Destroy,149번째 행|
| same-pool lifecycle |iceZone→일반 magic comet→iceZone |동일 normal-pool entity/mesh hide·re-show, source.enabled/GO inactive/Destroy, sample arena 전환의 2D 복원 |

위3site는 world X/Z=(40.2,-77),(36.2916,-73.17135),(43.2,-71.8)이며 Core=(100X,-100Z). 각각 기존 흙·뿌리 경사·실제 목교 표본이다. Player는 target에서 Core(-180,+80) offset으로 표본 가림을 피한다. 각 phase는 sample.TickCount를256씩 진행해 이전 once clip을 만료하며 실제 Simulation.Tick/자연 AI·타격 검수로 주장하지 않는다. 같은 객체가 필요한 Chase/Fissure는 spawn→capture 동안 유지한다. 종류/phase ID와 serial은 고유하다.

## 실행 전 고정한 assertion

| 항목 | 기준 |
|---|---|
| 실제 표시 |enabled/activeInHierarchy이며 forceRenderingOff가 아닌 sprite/mesh/line. 같은 GO/자식의 활성 mesh를 수집하고 원 hidden sprite를 실표시로 중복 검사하지 않음 |
| 지면 접촉 |source pivot 목표GroundY+0; 실제 surface 정점GroundY+.025m, ground ring점GroundY+.03m. raw ground 차이와 bias 제외 잔차를 모두 기록, 잔차/pivot 허용.02m |
| 방향 |샘플 ground span<=.001m인 평면은 normalUp>=.99. 굽은/경사는 각 정점 접촉이 hard gate이고 첫 triangle normal은 진단으로만 기록 |
| atlas/flip |95 direct 경로는 source atlas min/max와 독립 worldXZ/UV 역산 mapping;3c projected 경로는 실제 PB U/V/Rect와 source rect/pivot/scale/roll/flip의 독립 계수 비교, atlas1e-5. emit 순서에 의존하지 않음. 잘린2×1 ward 포함 |
| 원 표시 속성 |material/texture/sorting 원문 동일. 단3c Sprites/Default는 명시 premultiplied SkillAdditive 대체의 white/Flat0/NormalBlend1/DstBlend10 equivalence를 별도로 검증하고 identity 차이 기록. mesh color/opacity1e-6; 링은 원 LineRenderer material·uniform raw color/width.03/lift.005/72polygon 계약을 별도로 검증 |
| 대조 |일반 sprite normal은 기존 camera tilt 내적 절댓값>.99. 악의구 중심높이.25m, slam0m에.02m 허용. Malice trail은 billboard 전후 실제 점 보존 |
| lifecycle |실제 같은 normal pool producer의 source entity, source force off와 child 숨김/재표시, disable/inactive/Destroy. 2D 전환 직전 pose를 기준으로 비교. 단순 Active=false는 field sync가 다시 켜므로 sample.Stage.InArena/Arena를 실제 변경하고 finally 원복 |

큰 반경의 mesh 각 실제 triangle에서3 edge midpoint+centroid를 추가 진단한다(512tri이면2048표본). signed error=보간 worldY−(GroundY+.025m), 양수 들뜸/음수 파묻힘. 최대/평균/p95(nearest rank ceil.95N)·부호·2cm초과수·최악 actual/expected 좌표를 기록한다. 이 interior 지표는 diagnosticOnly이며 기존 vertex hard gate를 사후 변경하지 않는다. 큰 오차/화면 결함이 있으면 별도 RETOUCH로 인수 보류한다.

## 캡처·판정·미검증 경계

실행은 actual1920×1080 game framebuffer와 별도3840×1080 direct RenderTexture를 저장한다. 후자는 공식 URP SingleCameraRequest/SubmitRenderRequest이며 물리3840창 주장이 아니다. camera target/aspect/rect와 active RT는 finally 복원한다. 기하/속성 PASS와 실제 원본 visual 판정은 별도다. R100 baseline/current의 site·radius·age는 같고 unscaled renderTime/color도 기록하므로 완전 픽셀 동등 비교로 주장하지 않는다.

receipt에는 baselineProductSource/실제 caller source, QA storage root, Runtime/Core DLL SHA, required/generated/missing, 실제 정점/UV/atlas·색·sorting·copy assertions, 음성 대조·복원, native1920 및 direct3840 경로가 있다. source string만으로 바이너리를 증명하지 않고 외부 exact Git input/실행 packet DLL SHA와 결합한다. 음량0·listener pause·DirectVideo0을 기록하며 peak는 종료 시1024표본 관측이고 연속 peak 실측 주장은 아니다. 명시 mute 인자도 런처가 사용한다.

원 증거는 `/Users/fordeargamers/exoduser-wt/_out/mac-installable-ground-qa-20261102/`. 최초 준비 때 QA 포함 Preferences26개 원문과 cache semantics를 백업했다. 공유 checkout의 exo-unity.ps1 및 ground-skill/ WIP25파일과 index/HEAD를 보존한다. 새 팀·worktree·자동화·유료 구매0. baseline private QA a5d를 포함한 무관한 QA branch 전체를 제품으로 병합하지 않고 정확 helper/meta/docs만 후보95에 인수한다.

## MAP PRODUCTION REPORT (§23)

STAGE: 기존 A2 설치형 접촉·수명주기 검수, 맵 제작0.
MASTER/OUTER MASS/LARGE/MEDIUM/LANDMARK: 형상·경로·배치 기존 유지, 재검수0.
GROUND:1403 실제 RED112/136. 후보95 정점·상태148/148 PASS이나 GPU mip0 기여12/12 표본의 내부 접촉 FAIL.
PLAYABLE: 실제 자연 AI/피해/완주·성능 미검수. Core tree는 후보와1403 동일.
CAMERA QA: START 흙/EARLY 경사/목교1920 원본과3840 direct RT. ARENA/SIDE/LANDMARK/LATE/EXIT 전체 맵 camera board 미재검수.
TECH QA: baseline 오류/누락0·복원·같은 앱 Metal M1 23/23. 후보95 정상 ARM64148/148·같은앱 M1 23/23; alpha 보충12/12 정점 assertion PASS/contribution verified12, 오류0·누락0·원 Simulation 복원. 배송 보류. route/collision/pageerror/404/seam/loading/performance 미재검수.
FILES: QA helper/meta/docs만 Mac 소유. 제품8경로는 PC 후보95 소유. 타인 WIP 무수정.
GIT: baseline a5d·후보0fe·alpha d9c6d66 원격 확인. 첫0fe 원격 readback은 빌드 후였으며 소급 prebuild 주장 금지. alpha d9c6d66은 빌드 전 push/readback 완료. common/설치1403 보존.
VISUAL VERDICT: FAIL — baseline 설치형 접촉 및 후보95 큰 면 내부 접촉. 전체 A2 기존 RETOUCH·ImpactR4 FAIL을 승격하지 않음.
NEXT PASS: 실제 제품3c 첫3D projection 지연 수정(PC 소유)→같은 trace로 cold 완료시간부터 회수→대반경/링/coverage/roll-deploy/dense→full149/M1/별도 자연 필드플레이/직접 시각→인수 후 공통·정상 맥 설치·Win64배송/PC실행 회수.


# GPU-decoded texture contribution 진단 계약 (작성 당시 미실행; 아래 실제 결과 참조)

입력 root overlay SHA f013cef386cc04fb4073f5f67fe892f0997be99460fe9c6ff6c7e679c937c25a. visible-interior 복사본만 편집했다. 원본/공유checkout/Git/Unity/Player/정적컴파일 수정·실행0. 기존 raw InteriorDiagnostic과148개 vertex/contact/UV/color/물성 assertion은 유지한다. raw max .22~.88m와 기존148 PASS를 투명부 제외로 삭제하거나 덮지 않는다.

## GPU texture cache

실제 renderer MaterialPropertyBlock `_MainTex` → sharedMaterial `_MainTex` → source Sprite texture 순서로 실제 Texture2D를 찾는다. 원 compressed Texture2D.isReadable/import/filter/색/material/propertyblock은 수정하지 않는다. source 크기 그대로 Graphics.Blit → ARGBFloat Linear RT → RGBAFloat Linear Texture2D ReadPixels/GetPixels로 GPU-decoded mip0를 읽는다. GL.sRGBWrite=false로 target encoding을 막고 원 GL.sRGBWrite와 RenderTexture.active를 finally 복원한다. floatRT/RGBAFloat 지원·RT생성·readback 실패는 contribution.verified=false와 exception 원문을 보존하며 PNG/디스크 원화 추측으로 대체하지 않는다.

readback Texture2D와 RT는 각각 finally Destroy/Release한다. 캐시는 원 texture당 진단 Color 배열만 소유하며2개까지 보관하고 새 texture 진입 시 비운다. 모든 경로의 run 종료/예외 후 캐시도 비운다. 원 texture는 소유·해제하지 않는다. 실제 width/height/mipmapCount/filterMode/graphicsFormat/wrapU/wrapV/activeColorSpace를 기록한다. 큰 source는 metadata상 mip0/Bilinear/sRGB지만 runtime 수치를 최종 근거로 쓴다. Point는 floor(uv*size)의 nearest texel, Bilinear/Trilinear mip0는 uv*size-.5의4texel CPU bilinear를 사용하며 atlas 원UV와 Clamp01/edge clamp를 적용한다. 이는 minification mip/최종pixel footprint 진단이 아니다.

## Symbolic shader contract

현재 실제 큰 source shader `EXODUSER/SkillAdditive`의 원문 frag 기준:

`p = textureRGBA; a = p.a * vertexAlpha * (_Flat>.5 ? max(p.rgb) : 1); rgb = (_Flat>.5 ? 1 : p.rgb) * vertexRGB * a`

`_Flat` material/PB의 존재 여부와 raw 및 PB override를 적용한 resolved 값을 읽는다. `_Opacity` material/PB 존재/raw도 기록하지만 이 shader frag에는 `_Opacity` uniform이 없으므로 opacityApplied=1이다. 부재 raw0을 곱하지 않는다. 실제 mesh.colors를 probe의 barycentric 가중치로 보간하고 textureAlpha/vertexAlpha/Flat tint factor와 textureRGBA/vertexRGBA/potentialRGB를 함께 기록한다. 다른 shader는 수식을 추측하지 않고 unverified로 보존한다. receipt.contributionShapes/contributionUnverifiedShapes/contributionVerified가 기존 passed와 별도로 진단 검증 상태를 표시한다.

## 통계

기존과 같은 triangle3 edge midpoint+centroid에서 실제 UV/vertexColor/worldPoint를 같은 가중치로 보간한다. signedResidual = actualWorldY-(GroundY+.025). 원 raw InteriorDiagnostic은 그대로이며 새 contribution에 다음4bucket을 별도로 기록한다.

| bucket | 조건 |
|---|---|
| worstRaw | 모든 유효 probe, 투명도 유지 |
| positive | max(potentialRGB)>0 |
| oneByte | max(potentialRGB)>=1/255 |
| onePercent | max(potentialRGB)>=.01 |

각 bucket은 count/2cm초과수/maxAbs/meanAbs/p95Abs(nearest-rank ceil(.95*N))와 절대잔차가 가장 큰 probe를 기록한다. worst에는 signedResidual·actual/expected world XYZ·expectedGround/drawY·UV·textureRGBA·vertexRGBA/alpha·Flat/tint factor·opacity 존재/raw/applied·potentialRGB/max가 있다. 해당 worst actualPoint/expectedPoint를 현재1920 r3Cam.WorldToScreenPoint로도 기록한다. count0은 표본 없음이지 잔차0의 합격 판정이 아니다.

이 값은 GPU-decoded mip0 texture-contribution 진단이다. 실제 depth occlusion·최종tonemap·pixel차이·최종시각 기여의 검증으로 확대하지 않는다. GPU 미실행이며 root의 원본1920 crop/추가 depth 판정이 필요하다.

## 선택 실행

`-ground-consumer-prefix size-`를 주면 기존 case 중 접두사가 일치하는4consumer×3site=12row만 실행한다. required/generated/missing/expectedRows도 선택집합으로 맞추며 lifecycle은 생략한다. receipt.subset=true/passScope에 선택 검수임을 명시한다. 빈 prefix 인자 또는0개 선택은 fail-closed다. 옵션이 없으면 기존49consumer×3site+ lifecycle=148row를 유지한다. 기존passed에 row수==expectedRows gate를 추가해 부족한 선택집합을 통과시키지 않는다.

## adaptive topology

lifecycle의 고정289/512 assertion만 실제 vertex>=3/triangle>=1로 바꿨다. 기존 contact·UV·color 등 의미 검사는 그대로이며 actual vertex/triangle count도 계속 기록한다. 무조건 PASS로 바꾸지 않는다. stage면적 누락 검증은 PC 원문 보완 뒤 별도 회수한다. root의 원Simulation 복원·카메라·생산자·반경·색/opacity·피해수치는 수정하지 않았다.

컴파일 주의: Unity6.7 MaterialPropertyBlock.HasFloat(int), Texture2D.GetPixels(RGBAFloat), ARGBFloat/RenderTextureReadWrite.Linear API를 사용한다. 최종 정적컴파일 및 GPU format/readback 지원 확인은 root 소유이며 본 작성자는 수행하지 않았다.


2026-11-02 exact95d4 alpha-only checkpoint: source e84233ab15b40284cc381a6c9cbd80e6bbac82dc9814a0647c6d44504cb80f66, isolated Roslyn C#9 compilation exit0/no diagnostics. This checkpoint has prefix selection, GPU mip0 contribution diagnostics, adaptive lifecycle topology counts; no adaptive performance or67 sibling/UV support. No new GPU execution/visual acceptance yet. Prior candidate148 contact assertions and normalM1 23 pass do not accept visible large-footprint interiors.


## 실제95d4 GPU mip0 기여 결과 — 2026-11-02

Source d9c6d66b0cc6da503d5210956c8125b835b0f682, product95d4, helper e84233ab15b40284cc381a6c9cbd80e6bbac82dc9814a0647c6d44504cb80f66. 원격 readback01:44:38 UTC 후 별도 정상 제품 ARM64 빌드 Succeeded/errors0. Runtime063e47bf9eb0b44d3546bf0f7e6b6f51eb200e4848a019c10b1ad4a9e9d90c57, Core4a3e09bceb59d4a8a186e23a669014acf8c0be8096c3c2800bbf69d0a6ab213d. size 접두사12행, assertion12/12 PASS, contribution12/12 verified, 오류0/누락0, 원 Simulation hash·참조 복원. lifecycle/전체148/M1은 이 alpha 앱에서 재실행하지 않았으며 앞선0fe 앱의 결과를 소급 대입하지 않는다.

GPU-decoded mip0 symbolic potentialRGB>=.01 표본의 내부 잔차이며 depth occlusion/tonemap 최종 픽셀 동등성 주장이 아니다. signed 잔차는 양수 들뜸·음수 파묻힘이다. 매 실행 unscaled roll/time이 달라 이전95 캡처와 픽셀 동등 비교는 하지 않는다.

| site | consumer | 기여 표본 | 2cm초과 | maxAbs m | p95Abs m | 최악 signed m |
|---|---|---:|---:|---:|---:|---:|
|soil|size-spikeTrap-Lv1|374|11|0.157357|0.009817|+0.157357|
|soil|size-spikeTrap-Lv20|374|64|0.496313|0.083990|+0.496313|
|soil|size-holyDome-Lv1|279|47|0.432608|0.108953|+0.432608|
|soil|size-holyDome-Lv20|280|70|0.449380|0.113352|-0.449380|
|root-slope|size-spikeTrap-Lv1|374|87|0.169627|0.083586|-0.169627|
|root-slope|size-spikeTrap-Lv20|367|101|0.495339|0.102133|+0.495339|
|root-slope|size-holyDome-Lv1|228|57|0.409483|0.131012|-0.409483|
|root-slope|size-holyDome-Lv20|251|78|0.454275|0.259591|-0.454275|
|wood-bridge|size-spikeTrap-Lv1|376|143|0.832280|0.496679|-0.832280|
|wood-bridge|size-spikeTrap-Lv20|379|147|0.775827|0.410495|+0.775827|
|wood-bridge|size-holyDome-Lv1|265|95|0.491898|0.312972|-0.491898|
|wood-bridge|size-holyDome-Lv20|243|99|0.968842|0.372928|-0.968842|

1920 원본12개·3840x1080 directRT12개 보존. 목교 Lv20 spike/holy1920 원본을 직접 확인했다. spike의 목교/수면 경계 평면 굴곡·긴 연결선이 남아 인수 불가; holy는 낮은 alpha와 지면에 가려지는 부분이 있어 raw 수치 전체를 최종 가시 픽셀로 주장하지 않는다. LineRenderer의 contribution count0은 미측정이며0오차 PASS가 아니다. PC 후속3c가 원72polygon 링을 본체 접지면과 공유한다.

모든26개 Exoduser Preferences raw 및 cache export를 이번 Player 직전에 백업·비교했다. 종료 후 정상 product domain의 raw SHA e5a6b4bc2005eef68b1d40111c1342fc94ac82ca35c7644948e92abc61c16889와 cache semantics 복원. source raw 전/후 전체3543/3600파일 및772변형 경로 원문 보존. 이전baseline R2 앱만 전체211파일 manifest와5개 identity를 남기고 정리했으며 R3·95 정상 앱·캡처·로그·원문입력은 보존했다. common/설치1403 변경0.

원 증거: alpha95-contribution-summary.json, alpha95/ground-placement-receipt.json, alpha95-run-result.json, alpha95-source-remote-proof.json, alpha95-normal-import-drift.json.


# 1403 / Alpha95 / Adaptive67 호환 QA — 미컴파일·미실행

제품 기준67fbf337bff761e277a99169c4b68037e48da590의 NativeGroundSkillSurface/Geometry 및 SkillAdditive/KiSlashAdditive 원문을 git show로 읽고 visible-interior 복사본만 보충했다. root overlay f013cef386cc04fb4073f5f67fe892f0997be99460fe9c6ff6c7e679c937c25a는 수정하지 않았다. 기존 Alpha95 복사본 e84233ab15b40284cc381a6c9cbd80e6bbac82dc9814a0647c6d44504cb80f66은 alpha95-preserved/GroundPlacementCapture.cs에 보존했다. 성능·directUV 보충의 바탕은 adaptive-qa cb9524b8...이며 현재 복사본은 이를 포함한다. 공유checkout/Git/정적컴파일/Unity/Player/GPU실행0.

## 표시 renderer와 source 연결

Compile-time 새 제품 type 참조는 없다. source SpriteRenderer의 컴포넌트에서 reflection으로 public SurfaceRenderer 프로퍼티를 찾아 실제 sibling Renderer를 수집한다. Dictionary<Renderer,SpriteRenderer>로 draw→source를 연결한다. 이전95의 child surface는 fallback child MeshRenderer로 찾고1403의 mesh부재는 기존 FAIL을 유지한다. Collect의 기존 enabled/forceRenderingOff/active 표시 필터는 유지한다. source atlas/UV/색·재질·opacity 검사는 SourceFor로 sibling에서도 동일 source를 사용한다. lifecycle도 SurfaceFor를 쓰므로 child 구조에 의존하지 않는다. 종료 시 이 QA mapping을 비운다.

GeometryRevision도 source 컴포넌트의 public 프로퍼티를 reflection으로 읽는다. 없는1403/95/d08는 -1/미관측이며0으로 위조하지 않는다. 실제 counts와 revision은 계속 기록한다. 고정289/512는 vertex>=3/triangle>=1 및 기존 contact/UV/color semantic hard gate로 대체된 상태다.

## projected UV 계약

67의 실제 PB 필드는 `_GroundUvClip`, `_GroundUvU`, `_GroundUvV`, `_GroundUvRect`다. shader vertex는 local mesh `vertex.xz`에 U/V.xyz를 dot하여 normalized UV를 만들고, frag는0..1 밖을 clip한 뒤 Rect.xy+normalized*Rect.zw를 atlas UV로 쓴다. 따라서 mesh.uv는 projected 경로의 실제 texture UV가 아니다.

Shape는 기존 uv(raw mesh UV), sourceSpriteUv와 별개로 normalizedShaderUv/shaderUv 및 actual/expected U/V/Rect를 기록한다. source rect/pivot/ppu/lossyScale/roll/flip와 실제 draw local→world transform으로 expected U/V를 독립 계산한다. 직접 제품 TextureMap 함수를 호출하거나 actual PB를 expected로 재사용하지 않는다.

계수 hard gate는 각 component `abs(actual-expected)<=1e-5 + 8*floatEpsilon*max(1,abs(actual),abs(expected))`, floatEpsilon1.1920929e-7. atlas Rect min/max는 source.sprite.uv min/max와 별개1e-5 hard gate를 유지한다. emit 순서 first/last 조건은 없다. projected 범위는 source rect/clip footprint로 정의하며 static terrain mesh의 atlas밖 UV가 존재하는 것을 오류로 만들지 않는다.

_GroundUvClip이 없는95/1403 및 direct fallback은 원 mesh UV의 source atlas min/max1e-5를 유지한다. 원UV/flip/scale/roll로 실제 expected worldXZ를 계산하여 모든 정점의 mapping을 검사한다. world tolerance는 `.00002m + 8*floatEpsilon*max(1,abs(anchorX),abs(anchorZ),sourceExtent)`다. 충분히 큰 축은 회전역산 localX/Y와 U/V correlation의 sign(scale)*(flip?-1:1) 및.99를 검사한다. 작은 형상의 world quantization 때문에 축을 분해할 수 없으면 uvAxesResolvable=false로 진단하지만 world forward-mapping 및atlas범위 hard gate는 유지한다.

source/air sprite의 effective clip은0이어야 한다. 새 shader를 쓰는 ground MeshRenderer의 clip은1이어야 한다. shape.groundClipContract/sourceGroundUvClip/groundUvClip로 기록하며 음성 대조의 최종 passed에도 적용한다. 기준범위·반경·opacity를 완화하지 않는다.

## 재질 대체의 엄격한 예외

materialIdentityPreserved는 실제 sharedMaterial 동일성을 기록하므로 대체 시false다. materialPreserved는 기존 passed에 쓰는 semantic gate로 identity 또는 아래 명시적 동등성만 허용한다.

source shader가 Sprites/Default이고 material `_Color` 및 존재하는PB `_Color` 결합이white여야 한다. draw는 SkillAdditive, resolved Flat0 / NormalBlend1 / DstBlend10(OneMinusSrcAlpha)여야 한다. 기존 source texture/vertexRGBA/opacity/color/sorting 검사도 유지한다. 이때 두 frag/blend의 의미는 `a=p.a*vertexAlpha; premultipliedRGB=p.rgb*vertexRGB*a; alpha=a; Blend One OneMinusSrcAlpha`로 같다. 다른 source 재질에는 이 예외를 허용하지 않는다. source/draw shader/material·materialIdentityPreserved/defaultSpriteEquivalent·sourceMaterialTint·drawFlat/NormalBlend/DstBlend와 식을 Shape에 기록한다. identity를 임의true로 바꾸지 않는다.

## mesh footprint 면적 진단

actual triangle을 실제 normalizedShaderUv로 옮기고 unit square의4변에 Sutherland-Hodgman clipping한다. 교차 polygon shoelace 면적을 triangle마다 합산해 normalizedAreaSum/입력·교차triangle 수를 기록한다. missingAreaEstimate=max(0,1-areaSum), overlapExcess=max(0,areaSum-1), source rect/scale 기준world면적과 누락world면적도 기록한다. diagnosticOnly이며 contact gate를 완화하거나면적PASS로 치환하지 않는다. unionNotComputed=true: 겹친 triangle이 있으면합산만으로 실제union누락을 확정할 수 없다. non-overlap tessellation에서 누락회수용진단이다.

## GPU-decoded contribution

GPU source Texture2D는 바꾸지 않는다. actual draw PB `_MainTex`→material→mapped source texture를 ARGBFloat Linear RT에 Graphics.Blit하고 RGBAFloat Linear readback에서 mip0 RGBA를 캐시한다. Point는 nearest, Bilinear/Trilinear mip0는 원atlasUV/Clamp의4texel interpolation. width/height/mipmapCount/filter/graphicsFormat/wrap/activeColorSpace를 기록한다. GPU float지원/생성/readback 실패 또는 미지원shader는 verified=false+exception원문, PNG추측대체0.

GL.sRGBWrite/activeRT를 finally복원하고 readback clone/RT를 해제한다. source texture/material/PB/색/isReadable을 수정하지 않는다. 진단Color 배열 cache는최대2texture이며 종료·예외에도비운다.

모든 actual triangle midpoint3+centroid의 rawMeshUv, actual local barycentric point에 PB투영한 normalizedShaderUv, atlas shader UV를 구분한다. footprint밖은 insideFootprint=false/textureSampled=false, clip때문에 texture를 읽지않고 contribution0이다. raw all-probe signed contact residual은 밖도 그대로 포함한다.

SkillAdditive symbolic frag: `a=p.a*vertexAlpha*(Flat>.5?max(p.rgb):1); RGB=(Flat>.5?1:p.rgb)*vertexRGB*a`. 이 shader에는 _Opacity가 없으므로 존재/raw를 기록해도 opacityApplied=1이며 부재raw0을 곱하지 않는다. KiSlashAdditive는 실제67원문 `RGB=p.rgb*p.a*_Opacity`, vertexRGBA를 곱하지 않고 resolved opacity를적용한다. 두shader만 지원하며 다른shader 추측0.

ContributionDiagnostic은 worstRaw(all-probe), positive(potential maxRGB>0), oneByte(>=1/255), onePercent(>=.01) bucket을 제공한다. visible3bucket에는 insideFootprint와 실제alpha기여를 모두 적용한다. 각bucket count/2cm초과/maxAbs/meanAbs/p95Abs와 worst signed·world actual/expected·GroundY/drawY·rawMeshUV/shaderUV·RGBA·Flat/vertex alpha/opacity/potentialRGB·현재1920camera WorldToScreenPoint를 기록한다. 기존 raw InteriorDiagnostic은 보존한다. depth occlusion/최종tonemap/pixel차이 검증이 아니며 texture contribution 진단이다.

## 선택집합 및 성능

-ground-consumer-prefix size-는4consumer×3site=12row만 실행한다. required/generated/missing/expectedRows를선택집합에맞추며 lifecycle생략/subset/passScope명시. 옵션없으면기존148전체. 선택0/빈prefix는실패. 기존case삭제·분류완화0.

-ground-performance-frames N 기본0. N>0은명시size-only subset에서만허용. initial UpdateViews/Late 각각과합, 같은frame 고정pose N회 SyncViews, yield실제시간의roll+synthetic T(0..30)갱신 N회의CPU wall-clock 평균/p95/max를기록한다. 실제active vertex/triangle peak/last도기록한다. GeometryRevision이있으면 initial/fixed/live snapshot의sourceEntity/revision을기록하고 fixed/live 불변을정확비교한다. 미관측은false이며d08의매roll재분할을67의캐시성능으로주장하지않는다.

geometry timer에는QA LineState reflection/GPU readback/alpha통계/PNG비용을포함하지않는다. live synthetic T는finally복원한다. GPU 완료시간/최종FPS나Mac성능PASS가아니다. 다중설치형3개 optional case는미구현이다.

## 검증 상태

최종 source는 compile/run미실행. root가95 alpha와67 subset/profile을각각보존된remote source에서수행한다. 기존95 source148PASS·현재대면visualRETOUCH를이소스로자동승격하지않는다. PC는제품소유이며이파일은QA복사본만이다.

## Holy ring 후속 설계만 준비 — 새 제품 원문 도착 전 미구현

원본72개 LineRenderer 정점이 GroundY+.03에 있어도 그 사이 직선 선분의 들뜸을 검증한 것은 아니다. 현재 LineRenderer interior 미측정 또는0을 접촉PASS 근거로 쓰지 않는다. 기존 raw72점은 비교 참고로 유지하고, ring 선분/새표시 surface 검증의 미완료를 별도로 명시한다. alpha95 source의148PASS는 ring-interior PASS로 확대하지 않는다.

제품 후속이 도착하면 공개 RingSurface(LineRenderer)의 실제 signature/소유위치부터 git show로 읽는다. reflection으로 실제 draw를 찾고 draw→원본Line 매핑을 추가한다. 신규 제품 type compile참조0, 이전1403/95/67에서 API없음은 후속 ring 측정 미지원이며임의PASS0. 현재 source에는 추측한 RingSurface 호출을 넣지 않았다.

설계할 회수항목:

- 3D 원Line은forceRenderingOff이고 실제추가MeshRenderer2개가 표시되는지 확인. 활성display선택은 forceRenderingOff/active/enabled기준으로 하고 원Line72좌표와실제shader band중심선/radius/width.03/color/sort/addblend를각각기록한다.
- 링draw의MeshFilter.sharedMesh와본체의sharedMesh 참조/instance identity가같은지,GeometryRevision이같은원source revision으로공유되는지기록한다. ring마다복제된mesh가있는지별도진단한다.
- 현재모델의surface+.025와ring추가+.005가실제shader/geometry어디에서적용되는지원문확인후expecteddraw+.03을기록한다. 본체world정점만그대로검사해ring높이로오인하지않는다.
- normalizedUV shader band의72polygon 중심선/선분을 실제draw계약으로재구성하여edge·interior원형부위접촉을진단한다. 전체공유mesh의footprint나정점수만으로ring자체접촉을PASS시키지않는다.
- Active=false RestoreAll에서 원Line forceRenderingOff 원값/72point·색·sort·width·rotation/scale복원과추가draw비활성 확인. source.enabled=false/GO비활성/Destroy/zone종료 시ringdraw수명과공유mesh소유해제검사. 기존원sim/RNG/finally는보존한다.
- 선택size subset/profile에서본체+ring draw의실제triangle/vertex개수와공유geometry고유개수를분리해중복계산을표기한다. 이전profile draw별count가공유mesh를중복합산할수있다는점도명시한다.

최종ring제품commit이없으므로위항목은계획이며구현/컴파일/실제검수로기록하지않는다.

## 최종3c 링 actual draw 구현 — 이전 '설계만' 절을 대체

제품3c827c1195ff1fb8c4bc5501de99af33c615d8d1의 Surface/SkillView/SkillAdditive 원문을 읽었다. cb72 전 소스는 GroundPlacementCapture.before-ring-cb72.cs로 보존했고, root의 before-ring 정적검사에서 발견한 rendereSourceFor(r) 오타2곳은 SourceFor(renderer)로 수정했다. 컴파일/Unity/GPU실행은여전히미수행이다.

Reflection으로 public static RingSurface(LineRenderer)를찾아actualdraw→원Line 매핑을만든다. bodySource는동일Mesh를소유한SurfaceRenderer의Sprite로연결한다. source원72point는참고원문배열이며actual3D표시의대체증거가아니다. sourceLine이forceRenderingOff이고actualringRenderer가enabled/active/forceRenderingOff=false일때실표시를수집한다. holyDome와size-holyDome row는verified ring draw가정확2개여야통과한다. 이전API없음이나GPU기여미측정은그row의PASS로회피하지않는다.

RingDiagnostic/전용MeasureRing은body의atlas·vertex색alpha검사를적용하지않는다. 이shader의actualPB `_GroundUvClip=1`, `_GroundRingRadius>0`, `_GroundRingWidth=.03`, `_GroundRingLift=.005`, `_GroundRingColor` raw를읽는다. 링MeshFilter.sharedMesh가body와같은참조인지·mesh entity·body/ring owner GeometryRevision이같은지·원Line72좌표의XZ반경이PB반경과맞는지·원line start/endColor와PB색·sharedMaterial/sorting/add blend(DstBlend1)동일성을검사한다. Mesh world정점은shader vertex의localY+.005를실제로변환한값을기록하며expecteddraw는GroundY+.03이다. 원sourcepivot GroundY0과구분한다.

Shaderband 원문은step2π/72, face angle=(floor(atan2(z,x)/step)+.5)*step, distance=dot(localXZ,faceNormal)-radius*cos(step/2), stroke=saturate((width/2-abs(distance))/max(fwidth(distance),1e-6)+.5)이다. fragment는uniformColor.rgb*(uniformAlpha*stroke)를반환하며atlas/vertexcolor/Opacity는사용하지않는다. 해당부재를임의0곱하지않고RingDiagnostic의atlasUsed/vertexColorUsed/opacityUsed=false로명시한다.

AA를CPU에서추측하지않는다. actual renderer/sharedMaterial/실제PB를CommandBuffer.DrawRenderer로1920×1080 ARGBFloat Linear RT에별도렌더링하고RGBAFloat로readback한다. 원shader/재질/PB변경0, actualcamera view/GPUprojection 사용, empty depth를플랫폼far로clear한다. 이는actualband/fwidth AA의고립기여이며환경occlusion/최종tonemap검사가아니다. GL.sRGBWrite/activeRT finally복원, commandBuffer.Release/readbackDestroy/RTRelease+Destroy로정리한다. positive pixel 수와maxRGB를기록하고미지원·오류·positive0은ringVerified/PASS를허용하지않는다.

actualmesh의localXZ triangle barycentric support에서72polygon vertices+segment midpoints144점을측정한다. 실제support가없으면missingBandSamples로기록하며144점완료를요구한다. 지원점의실제shaderlift worldY와GroundY+.03 잔차hardgate .02m 유지. 원fullMesh/rawInterior 잔차도그대로기록한다. band worst 및기존3기여bucket은현재camera의probe pixel에서actualfloatRT RGB를읽는다. uniform band는textureSampled=false이고raw uniformColor를별도로기록한다. pixelcenter AA와world centerline의위치차/프레임clip·환경차이는원본crop으로root가검수한다. 링원본2D선분을지면72정점만맞았다고통과시키지않는다.

기본full은기존148row에ground-ring-lifecycle1row를추가해149row/required51scope다(49consumer×3site+기존lifecycle1+ringlifecycle1). 선택size subset은12row/lifecycle생략을유지한다. 링lifecycle은별도NativeSkillView clone에서2D priorforceOff/rotation/scale/원72localpoints를먼저보존하고,3Dbody공유draw2개검수,Line.enabled=false/GO비활성/bodySprite.disabled에서draw비활성,실제2D전환에서원forceOff/pose/72점복원·draw비활성,zone제거/Destroy의실제draw생멸을검사한다. source구조체2개만있거나RingSurface없으면실패다. 원sim/RNG/finally복원은유지한다.

## Dense 성능 optional 구현

`-ground-consumer-prefix size- -ground-performance-frames N -ground-dense-count K`.

K기본0, 명시0은비활성, 유효활성1..8이며performanceFrames>0필수다. 기본0은기존단일case변경0. 기존row1920/3840capture후별도dense진단을실행하므로dense용renderer교체가원본capture의entity증거를덮지않는다. dense는sample에동일consumer의실제반경/Lv/물성을복사한고유ID K개를넣고,120Core px간격의서로다른고정위치에둔다. actor원좌표/원Simulation/Tick/RNG수정0. K8은합성부하이며실제플레이/60FPS로일반화하지않는다.

새source ID의T30 cold projection1회, 같은Unityframe·time·pose의반복N회, T0상태설정후yield실제시간의T→30전개와roll N회UpdateViews+Late만Stopwatch로측정한다. 각각cold/mean/p95/max와실제geometryrevision snapshot을기록한다. shader 자체는이미warm일수있어'geometry source cold'로한정한다. renderer별entity/sourceEntity/meshEntity/GeometryRevision을기록하고fixed/live에서정확한불변여부를비교한다. GeometryRevision없는구제품을0으로위조하지않는다.

Topology는actualactive draw수와고유Mesh수를분리하고body/링sharedmesh는HashSet<Mesh>로중복제외한vertex/triangle합을기록한다. GPU alpha/readback·JSON·캡처·CPU interior/통계·topology/revision수집은Stopwatch밖이다. dense끝/예외finally에서원sample.FireZones객체배열을참조그대로복원하고SyncViews하며denseSampleRestored=false는예외다. 모든dense기능은선택QAflag아래며원case반경·접촉Gate·분류를완화하지않았다.

root가최종정적컴파일후short size12+profile→full필요검사를수행한다.95재시험은요구하지않으며,root실측95 alpha12/12verified와1%기여부분최대.157~.969m shippingFAIL 사실을새소스가덮지않는다. PC제품수정은별도소유다.

### 최종 링 mask 및 source/air 대조 보강

isolatedRT positive pixel>0은raw readback성공정보인 gpuVerified일뿐, 그것만으로ringmask를PASS시키지않는다. 실제sharedmesh가ring중심localXZ0을덮는support를찾아shaderlift world점으로camera.WorldToScreenPoint를구한다. near/far 및1920window안이고radius*cos(pi/72)>2*width로band에서충분히먼경우에만centerMeasured=true다. 해당actualRT RGB가절댓값1e-6이하의검정이어야한다. 중심support없음/유효화면·깊이밖은미측정으로실패보존한다.

144band표본중유효화면·깊이안의gpuBandScreenSamples와그actualRT RGB>0인gpuBandPositiveSamples를별도로센다. 둘다>0이어야한다. AA경계의모든pixel이같은RGB여야한다는조건은없다. 이두대조와rawGPUpositive를함께만족해야gpuRingMaskVerified=true이며,ring contribution.verified 및ring.passed도이mask검증을요구한다. PB가누락되어default body/전체면이그려지는경우중심검정대조로걸러낸다.

원sprite/air/defaultbody의effective `_GroundRingRadius`와mappedsource의radius를groundRingRadius/sourceGroundRingRadius에기록하고정확0을hard control로검사한다. Mesh body에ringuniform이전파되어도실패한다. ringactualdraw만radius>0이며,그body/sourceSprite/sourceLine은모두0이어야한다. `_GroundUvClip` 기존0/ground1대조도같이유지한다. effective값은PB.HasFloat 우선,실제materialproperty fallback으로읽는다. 본보충도미컴파일·GPU미실행이다.


ROOT source review corrections before build: replace nonexistent BossArena.Generate(0) at two lifecycle sites with existing BossArenaLayout.Generate(sample.Config.StageIndex); measure explicit line.enabled=false with projection-only SyncViews (do not call separate NativeSkillView.Update, which intentionally re-enables the producer line); refresh actual field contribution camera after arena→field transition before ring GPU measurement. Worker original4c06f076 source retained separately. Official helper static compilation recorded below; product source unchanged.


Final3c candidate QA checkpoint: exact product3c827c1195ff1fb8c4bc5501de99af33c615d8d1, helper source SHA256 8bbf79744041e8d6e04a628ca082c2dbc9005574f45dbd6b938884580c0ceb6f. Source-only static compilation passed. Actual Metal/large contact/coverage/roll-deploy cache/dense timings/M1/visual/install/Win64 delivery pending for this checkpoint. Prior95 alpha fail remains retained.


# 3c QA 진행 추적만 추가 — 미컴파일·미실행

입력 root final3c-reviewed/GroundPlacementCapture.cs SHA256 8bbf79744041e8d6e04a628ca082c2dbc9005574f45dbd6b938884580c0ceb6f. trace-qa 복사본에만 단계 로그를 추가했다. 원본/공유checkout/제품/Git/Unity/Player/정적컴파일 변경·실행0. 현재실행중Player96536의원본및실행파일은수정하지않았다.

명시 --unity-ground-placement-capture 실행에서만 output/ground-progress.jsonl에 즉시 append한다. 각 레코드는 UTC ISO8601, 실제 realtimeSeconds·monotonicSeconds, frame/site/consumer/phase/eventType/step/completedMs와 소규모 actualdraw/uniqueMesh/vertex/triangle/revision 요약을 포함한다. 큰 vertex/UV/triangle 배열이나 per-probe 로그는없다. topology는mesh.vertexCount/GetIndexCount만읽고공유mesh는중복제외한다.

각기록은새FileStream Append→UTF8 JSON 한줄→Flush(true)로즉시보존한다. before뒤after가없으면해당호출중단위치를알수있다. 로그쓰기·요약실패는Unitywarning을남기며기존source복원/검사/정상Quit을막지않는다. 기존receipt/표본/기준값을바꾸지않는다.

추적단계:

- capture 시작/field-entry/field-ready, site·consumer 시작.
- 실제private UpdateViews/Remodel3DLate 모든명시호출 before/after/error와완료시간.
- 각 Measure/MeasureRing/MeasureInterior/MeasureContribution before/after/error.
- UV-and-coverage, GPU-decode-mip0/cache hit, ring-GPU-readback, ring-144-support 그룹전후. 매probe로그0.
- fixed/live 각iteration과dense-cold/dense-fixed/dense-live 전후·완료CPU시간.
- lifecycle/ring-lifecycle·원Simulation복원·capture-body완료와capture종료.

측정IO분리: 기존 Invoke reflection 원문을 InvokeRaw에 두고 TracedProductCall은 로그 before를쓴뒤Stopwatch를시작해InvokeRaw만측정하고종료값을계산한뒤after로그를쓴다. TimedSyncViews는기존worldMask준비시간+두제품호출시간을합산한다. fixed/live/dense의원래통계입력도이IO제외값을사용한다. 초기Update/Late의사이LineState는계속제외한다.

QA Measure의중첩trace가외부Measure완료시간에들어가지않도록누적traceOverheadTicks(요약+JSON+파일IO)를차감한DiagnosticMs를보고한다. 제품호출timer내에JSONL쓰기/CPU메타수집을넣지않는다. UTC/realtime간격은로깅을포함한실제wallclock이고completedMs는이구간을제외하므로둘의목적이다르다. trace IO는CPU측정밖이어도yield프레임간실제시간을늘릴수있다. 따라서이추적실행의FPS/실시간roll주기를최종무추적성능PASS로확대하지않는다.

기존sample/RNG/source/material/피해/반경/시나리오/148+링lifecycle집계및hardcriterion은변경0. 거대한배열측정/루프를최적화하거나샘플수를줄이지않았다. ROOT가새원격QA체크포인트를보존한후필요시실행해제품cold와QA진단비용을구분한다. 현재CPU100%의원인을이소스작성만으로단정하지않는다.


Actual09190dda normal ARM64 built/errors0/rawbefore+after772drift paths preserved. First row incomplete after owned Player wall04:10/99pct CPU/noPNG; managed sample has unknown JIT names, so product vs QA cause unresolved. Only ownedPID96536 SIGTERM, wrapper restored original normal Preferences raw SHA e5a6b4bc2005eef68b1d40111c1342fc94ac82ca35c7644948e92abc61c16889 and cache semantics. No final receipt/original-simulation comparison, no product PASS/FAIL claim. Ground-progress trace added to separate completed product timings from QA overhead; exact3c product unchanged, no contact criteria relaxation.


## 실제3c 제품 첫 projection 지연 — 배포 FAIL, 접촉·시각 미측정

| 항목 | 실제 관측 |
|---|---|
| exact source |6ddd9f3072cc210044de08f3c3d1bb7a39966ebc; product3c827c1195ff1fb8c4bc5501de99af33c615d8d1, QA1f5c1f87d0c591991968ae7d7b44df22d5157bb89af83235c28bbd9dc88af260|
| source 원격 |빌드 전 push/readback6ddd 동일, UTC02:09:11|
| 빌드 |Unity6000.6.7f1/정상 product·id/ARM64 Succeeded/errors0, tracked3541개 blob mismatch0+canonical movie2, Core tree1403 동일|
| Runtime/Core |7dfd537e26fd9229a26b1db014e7a81c60729787e3f547f2ddfb107bcd60ff39 / 4a3e09bceb59d4a8a186e23a669014acf8c0be8096c3c2800bbf69d0a6ab213d|
| 선택 |size-spikeTrap-Lv1, 실제 SkillRules R300 Core px, 첫 soil(40.2,-77). 요청3site/4timedframes/dense8이나 첫 cold에서 중단|
| UpdateViews |3.1146ms 완료; trace UTC02:11:12.407486→02:11:12.410719|
| Remodel3DLate |UTC02:11:12.411313 before 이후 after 없음, 첫 revision0/mesh0; 관측 시점 최소96초 미반환. 완료시간 수치가 아닌 하한|
| QA 측정 |Measure/UV/interior/contribution/GPU readback/fixed/live/dense 전부 진입 전, 따라서 QA 계산 전체시간을 제품 지연으로 치환한 주장이 아님|
| 프로세스 |해당 관측시 ownedPID97791 RSS약2.44GB/CPU100%; 불필요한 재실행 없이 소유 Player만 SIGTERM|
| 종료·복구 |exit-15, 최종 ground receipt 없음. 원 Simulation hash 복원 최종비교 미완. 정상 Preferences raw e5a6b4bc2005eef68b1d40111c1342fc94ac82ca35c7644948e92abc61c16889/cache semantics 복원, unrelated raw/cache 원문 백업 보존|
| 인수 |동기식 제품 첫3D projection의 장시간 blocking으로 배포 FAIL. 전후 전체게임 FPS나 완료 cold ms를 계산하지 않음. 접촉/링/UV/기여/면적/회전cache/dense/M1/자연play/시각은 이 후보에서 미측정|

실제 프로세스의 managed sample은 JIT 함수명이 없어 깊은 leaf를 확정하지 못한다. 직접 증명된 병목 경계는 제품 Remodel3DLate 호출이며, 특정 Field.Height·Triangle leaf 원인 추정은 PC 담당의 다음 수정 근거와 구분한다. 제품 코드는 Mac에서 수정하지 않았다.

### MAP PRODUCTION REPORT (§23) — 이번3c trace 범위

STAGE: 기존 A2 설치형 첫 projection 검수, 맵 제작0.
MASTER/OUTER MASS/LARGE/MEDIUM/GROUND CONNECTION/LANDMARK/SMALL DETAIL: 원본 형상·경로·좌표·배치 무수정.
PLAYABLE/COMBAT: 독립 sample 한 Lv1 설치형 동기 projection에서 최소96초 blocking. 자연 전투·플레이 미검수.
CAMERA QA: actual1920 창 생성, 첫 표본 PNG0/direct3840 미도달. 전체 camera board 재검수0.
TECH QA: 정상 ARM64 빌드0error·exact input·원격 prebuild proof·raw import772변형 전후 보존·Preferences raw/cache 복원. 제품 cold 지연 FAIL.
FILES/GIT: QA/helper/docs만6ddd; product3c PC 소유. common/설치1403에 이 후보 미반영, Win64 배송 미진행.
VISUAL VERDICT: RETOUCH — 새3c contact/visual 증거 미도달로 인수 불가; 이전95 face-contact FAIL 및 전체 A2 RETOUCH/ImpactR4 FAIL 유지. TECH의 projection blocking은 FAIL로 별도 기록.
NEXT PASS: PC 제품지연 수정의 정확source를 인수해 실패한 cold부터 재검증하고 통과한 범위만 다음 단계로 이동.

원 증거: trace3c/ground-progress.jsonl, trace3c-product-blocking-proof.json, trace3c-owned-stop.json, trace3c-run-result.json, trace3c-source-remote-proof.json, build-trace3c-normal-receipt.json.


# Geometry 호출 경계 budget 진단 — 별도 명시 모드

입력 root trace3c-reviewed/GroundPlacementCapture.cs exact SHA1f5c1f87d0c591991968ae7d7b44df22d5157bb89af83235c28bbd9dc88af260. geometry-probe-qa 복사본에만 모드를 추가했다. root검수본/현재실행중Player/제품/공유checkout/Git/정적컴파일/Unity/Player 실행·수정0.

## CLI 및 분기

기존 `--unity-ground-placement-capture --remodel3d --unity-quick-start --unity-qa-sandbox <절대경로> -output <빈 절대경로>`에 **`-ground-geometry-probe`**를 추가한다. 기존Boot 명시조건은 유지한다. 모드가없으면 기존Start/149full·size12/정상기준·생산자·카메라·복원코드는 그대로다.

모드가있으면 Start 첫줄에서별도 GeometryProbeMode iterator로분기하고 yield break한다. 일반capture Execute/Run/finally SyncViews/reenabledLate/성능·GPUalpha·캡처경로를실행하지않는다. 필드진입은기존로비preview/EnterNativeTest와sandbox를사용한다. actualField ready후 NativeGame.enabled=false/Running=false/r3Late.enabled=false로writer를멈춘다. 그뒤진단·cleanup·복원어디에서도Remodel3DLate/SyncViews/NativeGame.UpdateViews를호출하지않는다. 종료까지writer를paused상태로두고소유QA프로세스만Quit한다.

## 3개 동일 Tessellate 입력

public NativeGroundSkillGeometry.Tessellate를reflection으로정확signature조회하여MethodInfo를한번캐시한다. Core4020/7700, left=bottom=-4.25m,width=height=8.5m,rotation(double)0으로각case당딱1회Invoke한다.

| case | 높이delegate |
|---|---|
| flat0 | (x,z)=>0 |
| slope | (x,z)=>.1f*x+.1f*z |
| actual-field | 한 번 캐시한 Func<float,float,float> NativeRemodel3D.GroundY |

각QA HeightProbe에서wrapperCalls·실제위임heightCalls·요청min/maxXZ·마지막요청XZ·마지막성공XYZ를기록한다. height호출경계에서Stopwatch2초또는wrapperCalls>=100000이면진단전용GeometryProbeBudgetException을던진다. 따라서100000번째wrapper진입에서위임전중단하며actual heightCalls 최대99999다. 해당수치를서로섞지않는다. StopWatch는reflection Invoke직전에시작하고case finally에서정지한뒤JSON을쓴다. product geometry/source/정밀도/원래계산은변경하지않는다.

중요한 budget 한계: 단일GroundY 호출안에서멈추거나높이callback이없는구간이오래걸리면즉시강제중단할수없다. 마지막height뒤구간이2초를넘겨성공하면completed-after-wall-budget-boundary로명시한다. 호출경계budget이며엄격한OS wallclock timeout이아니다. reflection TargetInvocationException은inner budget예외와기타예외를구분한다.

## metadata와 원Simulation 보호

실제 NativeRemodel3D.Field/게임a2Field 존재·참조동일성, ForestA2/Active/Terrain명/type를기록한다. 같은XYZ(40.2,-77)의높이3개를캐시된실제Func로직접기록한다. 이3회metadata호출과단독뷰prepare는Tessellate budget밖이며단일호출경계한계가동일하다. before/after stage를먼저쓰기때문에metadata단계지연도구분된다.

별도Simulation에 SkillRules.SpikeTrapRadius(1) 반환의원R300 spike, Lv1/T30/MaxT180/고유Id93001을넣는다. 단독NativeSkillView.Update만호출해실제product Mark를거친source sprite의PPU/rect/scale/worldWidth/worldHeight/position/requestedExtent를읽는다. requestedExtent는실제source컴포넌트의private field를reflection으로읽고미존재를0확정값으로바꾸지않고Found=false로구분한다. projection을호출하지않고GeometryRevision/mesh생성을강제하지않는다. 이뷰/root는소유자finally에서Dispose/Destroy한다.

NativeGame.Simulation에는진단sample을대입하지않는다. 원reference/private필드그래프해시(randomState포함)/TickCount를전후기록하며예상치못한reference교체가있으면원reference만setter로복원한다. Simulation.Tick 호출0, projection호출0이다. 원view복원때Late를돌리는우회는없다. game/late writer는소유프로세스Quit까지paused상태로기록하며다시reenable하지않는다.

## 즉시 영수증

별도 `ground-geometry-probe.json`에stage와현재진단상태를계속덮어쓴다. 각case finally에 `geometry-probe-case-flat0.json` / slope / actual-field 작은결과를즉시쓴뒤통합파일도갱신한다. vertices/triangles/omitted는반환배열Length만읽고거대배열은직렬화하지않는다. status=completed/diagnostic-budget-stop/exception/completed-after-wall-budget-boundary 및count/time/error를기록한다. case예산종료는원인자료이며QA/제품PASS가아니다. before파일은호출중지연시에도남는다.

completed는3case 결과수집여부다. exit0은세호출정상완료+원sim복원/오류없음인진단완료만뜻하며제품PASS가아니다. budget/예외/복원문제는exit2. listener pause/volume/peak/DirectVideo와device/API/DLL SHA를최종기록하고drain후정상Quit한다. ROOT가Preferencesraw/cache보호·원격source보존·정적컴파일·actual짧은실행을소유한다. 본소스는컴파일/실행미수행이며96초지연원인을미리단정하지않는다.

## 최종 동일앱 3c clone / 6e 제품 비교 — 앞의 '3case' 정의를 대체

ROOT가제품renderer source를6e3ca9a1cb5083ba30c97b4d0b91e6491249bd9d로빌드한다. standalone NativeSkillView.Update의metadata도그실제제품source를쓴다. 원제품Geometry/renderer 파일은이작성자가수정하지않는다.

`git show 3c827c1195ff1fb8c4bc5501de99af33c615d8d1:unity/Assets/Exoduser/Runtime/NativeGroundSkillGeometry.cs` 원문을 GroundGeometry3cProbeSource.cs로복사했다. **namespace 선언 한 곳만** `Exoduser.UnityPort` → `Exoduser.UnityPort.QaDiagnostics.Original3c`로바꿨다. class/계산/수치/공식/자료구조/키해시는3c원문그대로다. 순수진단clone이며제품renderer나GPU가참조하는클래스를바꾸지않는다.

- 변환 전 원문 SHA256: 52821cab5127a51ef28b0d94a541770ec430c7d03e7b97bff6ae8d5415f9e362
- namespace만 바꾼 clone SHA256: 3eddd167e3848a3ee45eea92067c28296307261767c93a51c018adda6f5e5e13
- 새 clone meta GUID: 5deaf6c12c0f4c21a636fd05207b329f

버전배열은 `[clone3c, product6e]`이며각각flat0/slope/actual-field를1회씩실행해총6결과를남긴다. clone3c는 `Exoduser.UnityPort.QaDiagnostics.Original3c.NativeGroundSkillGeometry`, product6e는실제 `Exoduser.UnityPort.NativeGroundSkillGeometry`의public Tessellate다. 버전별MethodInfo를한번씩캐시하고, 실제NativeRemodel3D.GroundY Func는두버전이같은한개캐시를공유한다. actualField·입력좌표/범위·위임높이공식·2초/100000wrapper cap을동일하게적용한다. 호출순서 clone3c(flat/slope/actual) 후 product6e(flat/slope/actual)이다.

각case에version/implementationType/sourceCommit을기록하며casefinally파일은 `geometry-probe-case-clone3c-flat0.json` 등버전+case 고유명으로쓴다. geometryMethodInvocations는정상진입시6이고completed는6case결과회수여부다. budget-stop은결과로회수해도제품/QA PASS가아니며exit2를유지한다. 모든6개가정상완료한exit0도오직이진단의정상종료이지제품성능/출하PASS가아니다. 기존3case 파일명/완료수 설명은이6case정의로대체한다.

원앱을별도3c빌드하거나재실행하는방식이아니다. 한6e앱의동일actualField/delegate에서3c순수clone과6e실제품함수를반사호출한다. 2초/호출경계한계·NoLate/NoSyncViews·원sim reference/hash보호·pause유지·작은JSON즉시보존은동일하다. 자동writer의필드준비이전동작까지0회였다는주장은하지않으며,metadata/진단/복원분기에서직접호출한projection은0이다.

제출파일4개: GroundPlacementCapture.cs, GroundGeometry3cProbeSource.cs, GroundGeometry3cProbeSource.cs.meta, doc-addon.md. ROOT가정확QA/clone/meta/docs를원격보존하고정적컴파일및실제짧은실행을소유한다. 작성자는컴파일/실행하지않았다.


Bounded pure geometry diagnostic checkpoint: product renderer remains exact6e, original3c is an isolated namespace-only pure diagnostic clone, no product Late call in diagnostic branch. Explicit geometry probe is source-only static compiled at this checkpoint; actual GPU-field receipt pending. A budget stop is causal evidence, never a contact/performance/product PASS.


## Actual same-app bounded geometry diagnostic on6e — 2026-11-02

Source6a13cffaead9682e9218ef1478fabab11219bd71 was pushed and remotely read back before the normal-product ARM64 build (Succeeded/errors0). Actual Apple Metal app contained the namespace-only3c diagnostic clone and exact6e production geometry. Both used the same prepared A2FieldLayout instance and the same cached actual-height delegate. This was a pure Tessellate diagnosis; the production projection Late was never directly called by its diagnostic/cleanup branch. No unlimited6e Late was attempted.

| implementation | height case | wrapper calls | delegated height calls | partial-call elapsed ms | status |
|---|---|---:|---:|---:|---|
|clone3c|flat0|100000|99999|10.6860|diagnostic-budget-stop|
|clone3c|slope|100000|99999|8.6390|diagnostic-budget-stop|
|clone3c|actual-field|100000|99999|420.0777|diagnostic-budget-stop|
|product6e|flat0|100000|99999|9.0572|diagnostic-budget-stop|
|product6e|slope|100000|99999|7.0214|diagnostic-budget-stop|
|product6e|actual-field|100000|99999|418.6682|diagnostic-budget-stop|

All six stopped at the100000th wrapper entry before its underlying height delegate, hence99999 executed height calls. None returned a completed mesh: default vertices/triangles/omitted0 fields do not mean an actual zero-size mesh. The2second wall budget was not reached; exit2 is the declared diagnostic budget-stop outcome, while all6 records were collected, aggregate error/cleanupError empty, external Runtime DLL hash matched, and original Simulation reference/private-graph hash were restored. These are partial-run elapsed times including Tessellate/wrapper/height work, not isolated GroundY timings, not a full cold placement, not FPS and not a product PASS.

| metadata | actual value |
|---|---|
| field |A2FieldLayout; Field and NativeGame a2Field references identical; ForestA2/Active=true; Terrain name Terrain|
| repeated height at40.2,-77 |0.291918218, 0.291918218, 0.291918218m|
| actual source |SkillRules.SpikeTrapRadius(1)=300 Core px; skill_spike_thorn; rect1254x1254; PPU100; lossyScale XY0.478468895; width/height6m; requestedExtent4.242640495m|
| pure input |Core4020/7700, left/bottom-4.25m, width/height8.5m, roll0; source-size calculation shows no100x unit inflation in this sample|
| original simulation |TickCount1 before/1 after; reference and private graph hash identical. Tick1 was reached during existing field startup before writers paused; do not claim entire process never ticked|
| audio |listener paused/volume0, terminal1024-sample peak0, DirectVideo0; not continuous audio proof|
| binary |Runtimeee3ac449236d7d14de9f84a4755d181f48f6b058708f59abea260f1d976ca37a; Core4a3e09bceb59d4a8a186e23a669014acf8c0be8096c3c2800bbf69d0a6ab213d|

At the same early100000-wrapper frontier, real-field partial calls cost about419-420ms versus7-11ms flat/slope, and6e versus3c real-field difference was small. This points to the actual-height/adaptive traversal workload as the next diagnostic focus. It does not establish the complete96second root cause or disprove late hash-collision costs after this early frontier; no total-height-call count or complete mesh was obtained. Preserve the original3c projection FAIL. PC owns product performance/method changes and may use a further bounded probe before any unlimited projection.

After immediate wrapper completion, Unity telemetry session keys were flushed late into the normal profile. Their exact changed raw/cache originals were privately preserved. The known before-profile was restored using per-domain import, raw compare-and-swap checks, and raw/cache stability checks after2 and7seconds, with no daemon/security/global changes. A final separate verification exported all26 domains and confirmed all26 raw SHA/cache semantics exactly match before this Player. Do not infer unchanged cache from immediate raw equality in future launches. Raw/preferences/cache data and session UUID values were not committed.

The duplicate unsigned95 backup was removed only after all208 non-normalization files, including shaderData, were proven byte-identical to the retained complete signed95 app. Its full manifest and original6 identity byte files were retained. The full actual3c trace bundle, inputs/raw before+after, logs, diagnostic shaderData and installed1403 remain retained. The removed backup is not claimed complete or runnable.

### MAP PRODUCTION REPORT (§23) — bounded geometry scope

STAGE: A2 existing soil installable generation diagnosis; map production0. MASTER/LARGE/MEDIUM/GROUND CONNECTION/PLAYABLE/LANDMARK/SMALL DETAIL: original geometry/routes/collision/art/numbers unchanged. CAMERA QA: actual1920 window only, no visual/contact/direct3840 captures in this mode; full camera board not reviewed. TECH QA: exact6a13 prebuild remote proof/input3543 tracked blobs0 mismatch/ARM64 errors0; six bounded pure-call records, original sim restored; final26 raw/cache match. VISUAL VERDICT: RETOUCH — no new visible acceptance evidence; prior95 contact FAIL and3c projection TECH FAIL remain. NEXT PASS: PC product generation fix plus bounded completion proof, then actual contact/ring/coverage/cache/dense,149full/M1/natural field play and original visual review before common/install/Win64/PC delivery.

Evidence: docs/engine/evidence/UNITY_GROUND_GEOMETRY_MAC_PROBE_20261102.json (actual aggregate receipt); private root probe6e-run-result.json, probe6e-preferences-final-proof.json, probe6e-late-preference-flush/recovery-proof.json.


## Delayed Mac profile guard for the next same-app regression

# 다음 실행용 단일 probe wrapper의 preference 보호 수정 — source only

입력은 root run_probe6e.py 소스만 읽었다. 기존 app/Info/Settings/Preferences/private backup payload는 이 작업에서 열거나 수정하지 않았다. 새 run_probe6e_guarded.py는 실행·import하지 않았다. OS defaults/앱/Git 실행0, 기존 historical run 결과 수정0.

## 근거

기존 코드는 Player 종료 직후 raw SHA가 before와 같으면 continue하여cache export와지연flush를건너뛰었다. ROOT는그뒤4개telemetry키(unity.player_session_count, unity.player_sessionid, unity_connect.mega_session_id, unity_connect.session_id)가normal domain raw/cache에늦게flush된실제결함을확인했다. ROOT가known-before e5 원문을CAS+per-domain import로복구하고2/7초·26raw/cache 정확복원을확인한사실을전제로한다. 이작성자가원prefs를다시읽거나재복구하지않았다.

## 실행 경로와 역사 보존

이파일은profile-guard 폴더에서다음실행용으로제출한다. source root는해당폴더의부모이며 app/proof/source-commit 입력은기존run_probe6e.py와같은6e경로다. 실제실행전ROOT가해당app/proof가다음실행제품과맞는지검토해야한다. 모든새결과/세이브sandbox/Player log/receipt/backup은 `profile-guard-runs/<UTC-microseconds>-<pid>/` 고유폴더에쓴다. 예전 probe6e 결과나 old private backup은덮지않는다. 최상위코드가소유QA앱1개를실행하므로검토하려고import하지말것.

## 시작 보존

모든Exoduser raw 파일을두차례읽어고유snapshot의raw-a/raw-b에600으로복사한다. defaults domains에서Exoduser domain과raw plist stem의합집합을export하여cache파일700/폴더700으로보존한다. export파일은domain SHA를파일명으로써대소문자·Unicode filesystem alias충돌을피한다. manifest는raw/cache SHA·typed semantics digest·원raw파일명·domain목록·시작/완료monotonic을남긴다. raw/cache 읽기중raw/domain집합이달라지면stable=false이며시작시에는앱실행을금지한다. before raw와cache typed semantics가이미다르면정규화하지않고중단한다.

owned는appInfo의CFBundleIdentifier와unity.ForDearGamers.CFBundleName에서나온정확2domain뿐이다. 각canonical raw경로와samefile인before 원문1개씩만선택하고실제보존된파일stem을cache domain으로고정한다. Unicode/casefold로임의다른domain을소유범위에넣지않는다. samefile은mac filesystem의기존정확file alias만해결하며canonical→실제파일/domain매핑을owned-domains.json에보존한다. 알려진원문raw/cache가없거나둘이같은파일로해결되면launch금지다. 새domain을자동삭제·원문미상값으로정규화하지않는다.

## 종료와 지연 flush

Player wait 종료후Unity/EXODUSER 프로세스가없는지읽기전용ps로확인한다. 종료직후, 종료+2초, 종료+7초의전체raw/cache snapshot을각기고유폴더로보존한다. before와비교할때raw같음으로cache를건너뛰지않는다. raw 또는cache만달라도변경이다. snapshot IO가deadline을넘기면실제시작/완료monotonic과requestedMonotonic을남기며정확한wallclock2/7초를거짓주장하지않는다.

모든checkpoint에서unowned raw/cache변경이나새domain을발견하면자료를보존하고owned 복구도시작하지않는다. last7s snapshot이불안정해도복구하지않는다. 각owned 복구직전과cache import/최종raw쓰기직전에도전체snapshot을읽어unrelated변경을확인한다. 변화가검출되면나머지쓰기중단,타domain은원문을덮지않는다.

## owned 복구와 CAS

해당owned raw/cache가현재checkpoint와달랐을때만known-before복구를한다. raw같고cache만다른경우도이분기에들어간다.

1. 변경현재raw와현재cache export를restore 고유폴더에별도보존한다.
2. 현재raw bytes/cache typed semantics가관측checkpoint와같은지확인한다. 독립cache재export와raw재읽기로pre-import CAS를확인하고프로세스없는지도확인한다.
3. 보존된known-before cache 파일과raw 파일SHA가시작manifest그대로인지확인한뒤,오직해당owned domain에 defaults import한다. 여러domain을묶거나cache daemon을재시작하지않는다.
4. import후cache와raw의typed semantics가known-before와같은지확인한다. post-import raw도별도보존한다. 최종cache를또확인한다.
5. 마지막raw직전에는O_NOFOLLOW로연동한descriptor의raw bytes와inode/dev를검사한후known-before raw를쓰고truncate/flush/fsync한다. 정규화된plist를다시만들어쓰지않는다. 기존pref permission을변경하지않는다.

cache CAS의비교기준은plist의typed canonical binary digest다. bool/int·bytes/string 타입을유지한다. export byte SHA도모두남기지만serializer key순서차이를semantic변경으로오인하지않는다. raw는항상byte SHA/bytes exact다. defaults import와file CAS사이를OS수준원자적transaction으로묶었다는주장은하지않는다. 최종stability검사가그사이의late change를찾으면재복구retry하지않고차단한다.

## 최종 전체 비교와 다음 실행 차단

복구후즉시·+2초·+7초에다시모든raw/cache를비교한다. 고정26개이름을코드에박지않고실제before집합전체를검사하며receipt에rawCount/cacheCount를기록한다. 현재ROOT 기준이26개이면그26개전부와신규항목없음이검사된다. 하나라도raw/cache/domain/stability가다르면error receipt·exit3,자동재시도0이다.

오류는고유run/profile-guard-error.json 및최종probe6e-run-result.json에남긴다. profile-guard-BLOCKED.json을원문보존방식으로생성해다음wrapper의앱실행을막는다. 이미있는차단파일은덮거나자동해제하지않는다. 다음진입은명시적인ROOT 검토·복구가필요하다. 코드자체는앱을재실행하지않고하나만launch하며복구실패후추가앱실행0이다. 새domain삭제/defaults delete/daemon재시작/보안설정변경/사용자앱종료명령은없다.

즉시상태와지연/최종복원증거는별도snapshot으로남는다. 이전historical결과를성공으로고쳐쓰지않는다. 이수정은계정소비반복조회나일반화framework를추가하지않고단일wrapper의보호분기를고친source-only제출이다. 실제실행검수는ROOT 소유다.


ROOT review: require an explicit absolute non-symlink artifact root CLI argument so the repository tool never derives a shared checkout as its output directory. App/proof and original-owned profile checks remain unchanged. AST syntax verified; actual same-app delayed-profile regression is pending. Known2domains raw originals confirmed present before launch.


The Unity app build remains exact6a13; this checkpoint changes only the external Python launcher and documentation. No Unity rebuild is needed or claimed. Actual delayed raw/cache regression on the existing app is pending.


ROOT slot review: first guard attempt exited3/launchCount0 before any preference snapshot because its broad command-string process guard reported a busy slot. The transient process was not captured, so its cause is not asserted. Two later observations had no Unity/Player and all26 original raw hashes were unchanged; the block/error receipt was archived with a reviewed resolution. Refine the guard to ps pid/comm executable identity (Unity/EXODUSER basename or exact Unity Mach-O path), with private PID/executable evidence on future rejection, instead of matching paths in a parent command argument. This does not terminate or modify any process. Same-app real profile regression remains pending.


Actual second no-launch guard evidence identified Unity Hub Resources/unity(PID3141), a background helper, not Editor/Player. It was not stopped. Restrict the guard to the exact Unity.app/Contents/MacOS/Unity executable and EXODUSER executables under Contents/MacOS; preserve both no-launch errors and reviewed block resolutions. This excludes the unrelated Hub helper while retaining actual app guards. All26 original raw hashes remained unchanged before the reviewed retry.


## Actual delayed-profile guard regression completed

External wrapper187520fbc4568c48fe42a1ac8690547a83f668ffb855ed734d159014476f8cef / source5178de33 used the SAME unchanged normal ARM64 appsource6a13. App launched once; all6 bounded diagnostic records collected, Runtime DLL matched. Child exit2 remains the expected geometry callback-budget outcome and is not a launcher/profile failure or a product PASS.

| guard evidence | actual result |
|---|---|
| exit checkpoints |immediate,2s,7s, each raw+typed-cache snapshot|
| recovery |one known owned normal profile restored; current raw/cache and independent CAS/global-scope checks preserved before import/write|
| final checkpoints |recovery immediate,2s,7s all raw/typed-cache exact|
| final scope |26 raw files and27 cache domains (includes an already-present cache-only domain), exact to this run before-launch state|
| unrelated/new domains |no changes; no normalization/deletion/daemon/security/process changes|
| guard result |error null, no persistent blocked marker, productAccepted false|
| workspace/install |shared HEAD/index unchanged, five installed1403 critical file hashes unchanged|

The two preceding no-launch rejections and their reviewed resolutions remain private evidence. The second was the unrelated Unity Hub Resources/unity helper; it was not terminated. Raw/cache values and session UUIDs are not published. Repository diagnostic summary below contains counts/hashes only, not the private profile snapshots.

## Next product method: planned receiver-depth projection; API pending

Latest PC owner has rejected CPU adaptive faces for product integration and is implementing a receiver-depth method. This is a PLAN and pending API, not a delivered Mac feature. Keep all95/3c/6e failure and bounded-probe evidence; do not rerun unlimited6e Late or enlarge QA through guessed APIs. Existing app/common1403 and all original saves/preferences remain preserved.

| pending product contract | Mac acceptance preparation |
|---|---|
|8vertex/12triangle proxy cube |proxy vertex height is not the displayed surface; retain old vertex tests as historical baseline, measure actual displayed pixel/world contact instead|
|registered ground/bridge/low-root receiver mask and actual scene depth |verify receiver selection, physical2cm contact criterion, actor/high-tree exclusion, bridge/root edges; no foot-height fallback|
|same shader/pass GPU probes |await actual API for WorldXYZ+effectiveWeight, packedUV+weight, scene/receiver eyeDepth+difference, actual preblendRGBA; do not fabricate captures|
|source art/UV/atlas/RGBA/72polygon ring |compare actual frame metadata and imported GPU texture contributions with original producer formulas; body/ring contracts separately|
|original2D/Core and1403 Skill/Ki shaders |source byte preservation plus air/actor/2D/lifecycle controls; preserve DBuffer receiver positive fix|
|performance/real play |actual normal Metal and direct3840RT, dense placement and cleanup, same-app M1 and separate live field play, then normal install/Win64 delivery/PC actual receipt only after acceptance|

MAP PRODUCTION REPORT continuation: stage remains existing A2 contact/generation QA, map production0. TECH profile-protection guard PASS in tested scope; product3c generation FAIL and current receiver-depth API pending. VISUAL VERDICT: RETOUCH, no new receiver-depth actual visual evidence. No candidate installation/common/Win64 delivery accepted.


## Receiver-depth first normal-app smoke checkpoint

# Receiver-depth one-case smoke QA overlay — 2026-11-02

Source-only handoff; not compiled or executed. Merge this addon into the product ground-effect placement document when ROOT integrates the QA source. The shipping checkout, index, preferences, backups and Player have not been changed by this task.

| Item | Contract |
|---|---|
| Product source | `8f391fea6f157433fcaea2df611d0a9b146c6604` (parent `47dbb9b82aad9d6d1d30af0bebe0326863257495`) |
| Shader followup | Both depth loads use the same `SV_POSITION.xy` raster pixel; inverse projection uses raster XY × `_ScreenSize.zw`. C# API and blend/weight formulas unchanged. Screen vertical orientation remains an independent diagnostic. |
| QA base | ROOT-reviewed `probe6e-reviewed/GroundPlacementCapture.cs`, SHA256 `70a908b7d8dde6ca84c89a13230fa35e7eb6694797d77b1c66866cd1e3f75a6f` |
| Entry | Existing `--unity-ground-placement-capture --remodel3d --unity-quick-start --unity-qa-sandbox <absolute>` plus `-ground-receiver-smoke -output <empty absolute directory> -source-sha <actual QA commit>` |
| Mode isolation | Separate Start branch; visible Player required; simultaneous `-ground-geometry-probe` rejected. Existing legacy/geometry branches retained. |
| Case | Soil only; Core `(4020,7700)` → world `(40.2,-77)`; spike trap Lv1; actual `SkillRules.SpikeTrapRadius(1)` must equal `300`; FireZone `Id=94001,T=30,MaxT=180`; player `(3840,7780)` |
| Proxy contract | `UsesReceiverDepth=true`; 8 vertices / 12 triangles are a volume proxy. No contact-vertex or legacy adaptive-mesh verdict is applied. |
| Receiver draw bias | `0`; old `+0.025` CPU-ground test does not apply. CPU GroundY deltas in samples are diagnostic only. |
| Timing | Actual NativeGame `UpdateViews` once, then `Remodel3DLate` once, separately timed. Probe waits, float readback, PNG and cleanup excluded. No replay or dense/full suite. |
| Frame size | Public projection `FrameSize`, never assumed from Screen. Nonpositive size, unsupported float target, API error, resize or unavailable projection fails. |
| API cache | Reflection caches public static `ProbeSerial`, `FrameSize`, `ReceiverCount`, `ActiveVolumeCount`, `Error`, `Available`, `RequestProbe(RenderTexture,int)`, `CancelProbe()`; no static dependency on the new projection type. Surface property reflection cached too. |
| Request ownership | Create actual Linear ARGBFloat RT; require `R32G32B32A32_SFloat`. Request mode; wait for serial increase at normal EOF; ReadPixels into Linear RGBAFloat; CancelProbe releases only its wrapper; assert caller RT still created; caller destroys Texture2D and releases/destroys RT. Cleanup also runs on exceptions. |
| Wait bound | Normal warm frame and each probe serial wait: 5 seconds checked at EOF boundaries. Cannot interrupt a stalled main/render thread. ROOT owns external process timeout. |
| Output | `ground-receiver-smoke.json`, four small `receiver-modeN-summary.json`, four full `.rgba32f` files with SHA256, 1920 window PNG; one optional direct 3840 PNG, with independent failure recorded. |
| Float layout | ReadPixels order, bottom-left row-major; little-endian RGBA float32; byte length `width × height × 16`. This records the readback layout, not a shader screen-orientation conclusion. |
| Frame snapshots | Requested/completed frame, serial, descriptor size, receiver/volume counts, API errors, view/projection matrices and actual source/draw PB/material metadata. Input hash must remain equal across each request. Modes 1–4 are sequential independent frames. |

Metadata gates require one active volume, at least one receiver, source enabled and forceRenderingOff, active/enabled draw proxy, original texture preserved, **materialIdentity=false**, `EXODUSER/SkillAdditive` source and `EXODUSER/GroundSkillProjection` draw, sourceMode0, NormalBlend0, ringRadius0, destination blend One (1), correct anchor, original source tint, original Flat, and source Opacity if present or fallback1 if absent. The absent original raw Opacity0 is recorded and is never multiplied into mode0 expectations.

| Probe mode | Actual GPU payload | Smoke gate |
|---|---|---|
| 1 | world XYZ + positive weight | Finite values; positive coverage; actual volume XZ footprint and normalized UV within `[0,1]` (UV epsilon `1e-5`, XZ epsilon `0.0001m`) |
| 2 | packed UV, max preblend RGB, weight | Finite values; positive coverage; packed atlas footprint (epsilon `1e-5`); up to 32 actual foreground samples compare weight/maxRGB against actual completed-frame PB + GPU-decoded source mip0; maximum absolute error `2/255` |
| 3 | scene eye depth, receiver eye depth, absolute difference, weight | Finite values; positive coverage; depths positive and difference within `[0,0.02]m` |
| 4 | actual preblend RGBA (additive alpha0) | Finite values; nonzero RGB; absolute alpha at most `1e-6` |

Mode2 expectation for this sourceMode0 case: sample actual packed UV with actual texture filter/wrap, `a = tex.a × tint.a`; Flat multiplies `a` by max texture RGB; expected RGB is `(Flat ? 1 : tex.rgb) × tint.rgb × a`; expected output alpha is `NormalBlend ? a : 0`. GPU decoding preserves the actual texture/color-space conversion without changing readability/import settings. This bounded smoke samples mip0 and uses explicit `2/255` tolerance; it does not certify arbitrary mip/anisotropic cases.

The current probe API does not emit UV alongside mode4 RGBA. Mode2 therefore verifies same-frame weight/maxRGB and computes expected RGBA, while mode4 independently records actual full RGBA and checks alpha0. **No cross-mode pixel alignment or full same-frame per-channel RGBA verification is claimed.** Receipts retain `fullRgbaSameFrameVerified=false`, `fullRgbaSameFrameCompared=false`; this is a smoke result only. No screenshot-based coordinate flip is assumed.

The outer harness records exceptions and per-mode failure summaries, cancels outstanding probes, releases decoded textures and QA-owned RTs, restores the original Simulation reference, rebinds boss/skill views to the original without invoking measured NativeGame UpdateViews/Late again, and compares original state hashes. Game and late writers remain paused until owned Quit. Runtime/core DLL hashes, actual source SHA, Metal API, 1920×1080 window, listener pause/volume/peak and Direct-video count are in the receipt. Exit0 requires all scoped gates and restoration; otherwise exit2. Direct3840 failure is supplementary and does not change the scoped smoke result.

The inherited geometry clone is named only through a reflection type string in the separate geometry mode. It is not required by the receiver smoke compile path. No cloned product source is added here.

Status at handoff: compilation NOT RUN; Player NOT RUN; visual verdict UNREVIEWED; full149 / large / dense / M1 NOT RUN; shipping acceptance NOT GRANTED. This mode cannot retroactively turn previous interior-contact failures into PASS. ROOT owns integration, prebuild checkpoint, profile guard, normal ARM build/run and actual visual review.


ROOT acceptance correction: preserve the first actual1920 normal-frame PNG immediately at EOF, before timeout/metadata/float-probe gates, and never overwrite it with a later post-probe frame. This ensures unavailable feature/invisible shader/first-mode failure still has the original visible-frame evidence. Direct3840 remains success-path separate capture. Product source untouched.


Exact product8f391fea6f157433fcaea2df611d0a9b146c6604: shaders target3.5 and same-raster depth/world alignment; C#324/API same2ac. Main old shaders byte-identical1403. The only current acceptance scope is soil Lv1 spikeR300, actual feature/shader/visibility/RGBA/cold timing with four same-pass float probe modes. Cube8 vertices/12 triangles are volume bounds, not a physical contact surface. Actual47 smoke/visual/API/shader/runtime evidence pending at this checkpoint. Preserve legacy failures and source-only vs actual distinctions; no full/large/dense/M1/install/Win64 claim.


Receiver smoke launcher reuses the verified delayed-profile guard unchanged except product/app/proof/output labels, exclusive receiver-smoke flag and receipt fields. Wrapper SHA2d818ee4de9ac1b0426cb48d8ff585de19e8dbdf20f8306190d8fdd813e5b67e, explicit absolute artifact-root CLI. App buildsource remains b224. AST syntax verified; actual single-case run pending. Initial actual1920 frame is saved before metadata or probe failure.


## Actual8f first receiver-depth soil smoke: visible/fast, sampler consistency unresolved

Normal ARM64 buildsource b224e6a1bc5124bc6e78a8d8a1c455b9105079c9/product8f391fea6f157433fcaea2df611d0a9b146c6604, prebuild source remote proof, errors0. One explicit soil Lv1 actualR300 source, not natural gameplay or large/dense/full acceptance.

| observed scope | actual result |
|---|---|
| CPU product calls |UpdateViews3.2235ms; Remodel3DLate1.6049ms. Single measured cold-call wallclock, excluding PNG/readback; not overall GPU frame/FPS|
| feature |Available true/Error empty; receiver287/volume1; actualFrameSize1920x1080; no shader/RenderGraph errors in Player log|
| mode1 |PASS96632 positive pixels, nonfinite0, outside actual footprintUV/XZ0; world pixel evidence, not proxy contact|
| mode2 |96632 positive pixels; stable source inputHash; allUV in range;32 source-texture comparison samples. maxWeightError.0464395359 FAIL vs2/255=.0078431373. maxRGBerror.00776919164 remains WITHIN that existing tolerance. No tolerance relaxation|
| target ownership |CancelProbe leaves caller target created; source input unchanged|
| mode3/mode4 |not attempted after mode2 comparison failed in first smoke; depth/completepreblendRGBA acceptance still unmeasured|
| raw frame |Root directly viewed1920 original: red spike mark visible on soil, no obvious vertical floating quad in this scope. File4173019B/SHA7b87f8a2e421907d70080a91b5627c1adc0a23658e6d33e39d57014641c367e3|
| restoration |normal app child exit2 for smoke comparison; original sim reference/private graph same, guard error null;26raw/27typed-cache domains exact at immediate/2s/7s recovery checks|

Worst mode2 sample(x1061,y564) actualpackedUV(.4321146607,.7196003199), actualmaxRGB.008499521762/weight.09887937456; existing GPU-decode cache bilinearRGBA(.01392701361,.000148004663,.000137000083,.1212766245), expectedweight.05243983865 with originalalpha.4323985577. CPU uses texel-center coordinates u*width-.5/v*height-.5; source1254square,R8G8B8A8_SRGB,mip1,Bilinear,Clamp. The mismatch is not yet attributed to a product shader fault. SameUV direct GPU source sampler and decode/Y/precision/filter diagnosis is owned by the existing Mac QA worker.

Local Unity6000.6.7f1 CGIncludes/UnityCG.cginc lines774-784 define half2 image UVs. This is a possible default-Blit decoder precision source forNPOT1254, not proof that the default path is responsible. Preserve the original cache result/failure; compare an independent exact source sampling path without changing original texture/import/filter/readability/globalQuality.

Only the original1920 PNG was made available via private192.168.0.233:3334 exact one-file GET/HEAD whitelist toPC192.168.0.146; no listing/write or prefs/float publication. Server is ephemeral and will be stopped after verified receipt. Full shader/GPURGBA/12large/8dense/M1/integration/install/Win64 remain held until this one case is resolved.

MAP PRODUCTION REPORT: existing A2 soil effect-rendering QA only, map/route/collision/art/Core unchanged. First normal1920 frame directly viewed; direct3840 not reached. TECH rendering/feature and one-call CPU latency evidence obtained; mode2 weight consistency FAIL/unresolved, actual2cm depthmode3 not yet read. VISUAL VERDICT: RETOUCH for acceptance; the one image looks grounded but no full-contact/color/actor-exclusion sign-off. Next pass is exact-sampler diagnosis on the same single case.


# Receiver mode2 sampler diagnosis — source-only QA handoff

2026-11-02. Product baseline remains `8f391fea6f157433fcaea2df611d0a9b146c6604`. Copy base: ROOT `receiver-reviewed/GroundPlacementCapture.cs`, SHA256 `fe09668aa45a3ca41c442215411c033b105f84f39237ff58d4cd740085c8c4a0`. The first normal 1920 screenshot stays before metadata/probe gates exactly as in that base. This task changes only this overlay, adds one QA Resources shader/meta and this addon. No compilation, Unity/Player, Git mutation, preferences, product/importer/texture/global Quality changes, new teams or expanded test coverage.

## Read-only first-run evidence

Only run `profile-guard-runs/20261102T032130171914Z-3872/receiver47/` and the candidate2ac-input `skill_spike_thorn.png` / `.meta` were consulted. The 1254×1254 source PNG is 8-bit noninterlaced RGBA. Its original alpha was decoded losslessly with PNG row filters, then bilinearly sampled at each of the **same 32** mode2 packed UVs using `uv * 1254 - 0.5`. PNG storage is top-row-first, so Unity source UV v corresponds to PNG row `(1-v)*height-0.5` for this comparison. This is texture row convention evidence, not a screen-projection vertical flip diagnosis.

| Comparison of all 32 existing samples | Result |
|---|---:|
| PNG alpha versus legacy GPU-decoded cache alpha, maximum absolute difference | `0.0000070360654214063345` |
| PNG predicted weight versus actual mode2 weight, maximum absolute difference | `0.04644002094651261` |
| PNG predicted weight versus actual mode2 weight, mean absolute difference | `0.0018973928619060018` |
| Opposite PNG row convention: weight maximum / mean absolute difference | `0.40566415886675583` / `0.06668289190864422` |

| Worst existing sample | Value |
|---|---|
| Pixel / packed UV | `(1061,564)` / `(0.4321146607,0.7196003199)` (read full JSON floats in analysis) |
| Original PNG bilinear alpha | `0.12127550540549124` |
| Legacy cache alpha | `0.1212766245007515` |
| Tint alpha | `0.43239855766296387` |
| PNG predicted weight | `0.05243935361718139` |
| Actual mode2 weight | `0.098879374563694` |

The large weight mismatch is not explained by a large legacy mip0 alpha-decode error or by reversing source texture Y. This does not yet establish the cause of the product's filtered sample. Importer alphaIsTransparency can affect RGB, so this read-only evidence makes no PNG-to-runtime RGB equivalence claim. No acceptance threshold was relaxed.

## Independent GPU reference

Install `Resources/Shaders/GroundReceiverSamplerReference.shader` and its matching `.meta` under the QA Assets Resources hierarchy alongside the helper. `Resources.Load<Shader>("Shaders/GroundReceiverSamplerReference")` creates a QA-owned Material; it is never installed on a product renderer.

| Reference mode | Width × height | Operation |
|---|---|---|
| 0 | sampleCount × 1, at most 32×1 | Original runtime Texture2D, original sampler: `SampleLevel(uv,0)` |
| 1 | sampleCount × 1 | Same texture/sampler: `SampleGrad(uv,dx,dy)` |
| 2 | (sampleCount×4) × 1, at most 128×1 | Exact four surrounding mip0 texels by `Texture2D.Load`; offsets `(0,0),(1,0),(0,1),(1,1)` from `floor(uv*size-0.5)`; clamped because this actual soil source is Clamp |

ROOT reports Unity6000.6.7f1 UnityCG image-Blit structs use half2 UV; this is a plausible decoder precision mechanism, not an established cause of these errors. The QA shader does **not** reuse `vert_img`, `appdata_img` or `v2f_img`. Its custom vertex output contains only float4 SV_POSITION. Source UVs come from explicit float4 sample arrays, and the exact texel path uses integer Texture2D.Load, so no image-Blit half2 UV varying participates.

Shader target3.5; RGBAFloat Linear targets with required `R32G32B32A32_SFloat`; float32 readback. Pixel indexing comes only from reference output `SV_POSITION.x`; reference source UV is passed explicitly from the saved mode2 sample list, with no input/output screen Y assumption. Source filtering, wrap, mipmaps, readability, importer, aniso and QualitySettings are never written. Material, targets, readback Texture2D and active RT are cleaned/restored in finally.

The same original mode2 sample list and completed source/PB snapshot drive every path. Existing legacy cache RGBA, expected weight, actual weight, absolute errors, original thresholds, `passed=false` and raw float evidence remain intact. New per-sample fields record:

| Field family | Meaning |
|---|---|
| referenceLevelRgba / referenceGradRgba | Actual GPU source sample RGBA at original packed UV |
| referenceLevelExpectedRgba / referenceGradExpectedRgba | Expected preblend RGBA using original completed-frame PB tint/Flat/NormalBlend |
| referenceLevelWeight / referenceGradWeight / corresponding Error | Expected weight and absolute difference from original actual mode2 weight |
| referenceLoadedTexels / referenceCachedTexels | Same four exact mip0 texels from GPU Load and legacy default-Blit decoded cache |
| referenceLoadCacheAlphaError / referenceLoadCacheRgbError | Maximum per-sample absolute texel differences; NPOT default-Blit decode diagnostic |
| referenceLoadBilinear / referenceLoadExpectedRgba / referenceLoadWeight | CPU bilinear reconstruction from exact GPU-loaded texels, independently of legacy cache |
| referenceLevelCacheAlphaError | Direct GPU level0 alpha versus existing CPU-bilinear cache alpha |
| referenceDx / referenceDy / referenceDerivativesValid | Actual mode2 packed-UV neighbor finite differences, not assumed screen-space orientation |

For Grad, a positive-weight finite next neighbor gives `nextUV-centerUV`; otherwise a valid previous neighbor gives `centerUV-previousUV`; absent neighbors return zero and validity=false. This approximates footprint using actual reconstructed UVs; it is **not the exact original fragment quad derivative**, especially at clip/silhouette boundaries. A closer Grad result is evidence to inspect sampling footprint, not proof or permission to change the product shader.

`texture.anisoLevel` and `QualitySettings.anisotropicFiltering` are now recorded in every source snapshot and the independent diagnostic. Texture meta was aniso1; the runtime/global values must be observed, never inferred from that importer field.

`receiver-mode2-sampler-reference.json` contains status/error, the original completed-frame snapshot, original samples plus all new reference outputs, runtime aniso and maximum differences. The same diagnostic object appears in the mode2 summary. Missing/unsupported reference shader or reference errors are recorded independently and cannot turn the original mode2 gate into PASS. Reference completion is not itself a smoke acceptance criterion.

## Continue only a comparison failure

After the existing per-mode cleanup/CancelProbe, `mode2ComparisonOnlyFailure=true` allows this one case to continue to modes3 and4 **only** if mode2 readback completed, target ownership survived cancellation, error is empty, serial advanced, inputHash is unchanged, all pixels are finite, positive coverage exists, UV footprint is valid, samples were compared, and weight/maxRGB exceeds its unchanged `2/255` threshold. The failed mode2 `passed` remains false, so final `smokePassed=false` / exit2 remain. API exceptions, resize, serial timeout, invalid/nonfinite/empty/UV evidence and cleanup errors still stop immediately. Modes1/3/4 retain their previous gates.

No full12/dense8/full149/M1 run is added. No same-frame full per-channel mode4/UV equivalence or visual PASS is claimed. ROOT owns static compilation, remote prebuild and actual GPU execution.


ROOT intake: same product8f, helper static0errors/3known legacy unassigned-field warnings. Independent QA sampler shader GPU/Metal compilation is pending, no product shader/formula/criteria change. Original PNG PC received4173019B/SHA7b87f8a2e421907d70080a91b5627c1adc0a23658e6d33e39d57014641c367e3 exact and visually checked one frame; owned4498 one-file server stopped/exit0. Next one-case sampler diagnostic only; no full expansion.


## 2026-11-02 맥 실제 GPU sampler 진단 결과

제품 `8f391fea6f157433fcaea2df611d0a9b146c6604` 그대로, QA `0d9ca921cb68836d8d0c61999bf6262fa0fb6e87`를 GitHub 원격에서 빌드 전에 일치 확인했다. 일반 ARM64 앱 빌드 errors0, 실제 Apple M5 Pro/Metal/1920×1080에서 한 장면만 실행했다. 원본 import 전후 바이트와 772 경로 drift를 둘 다 보존했다. 설치된 공통1403와 공유 소스 HEAD/index/WIP는 바이트 검사로 유지 확인했다.

| 검사 | 실제 값 | 판정/한계 |
|---|---:|---|
| Mode1 | positive96632, finite/UV/XZ 위반0 | PASS, 한 장면만 |
| Mode2 기존 CPU bilinear weight | max0.04643953591585159 | FAIL 유지, 허용2/255 변경없음 |
| Mode2 기존 maxRGB | 0.007769191637635231 | 기존2/255 이내 |
| Mode3 수신면 깊이 차이 | max0.019809722900390625m | 0.02m 이내 PASS |
| Mode4 | 존재/유한/alpha0 | 기존 게이트 PASS; 원 RGBA 동등성 미검증 |
| GPU SampleLevel weight 오차 | max0.046419255435466766 | 단일 mip 표본 불일치 재현 |
| GPU SampleGrad weight 오차 | max0.00031794013921171427 | footprint 반영 시 감소, exact quad 아님 |
| GPU Load 대 decodecache texel RGBA | alpha0/RGB0 | 같은 원본 texel 확인 |
| GPU Level 대 CPUcache alpha | max0.0003750324249267578 | 큰 원본 디코딩 오류 근거 없음 |
| 원본 runtime aniso / global | 1 / ForceEnable | 읽기만 수행 |
| 환경설정 | raw26/cache27 | 종료 및 복구 후 즉시/2s/7s exact |

전체 smoke는 false/exit2로 유지한다. 단순 mip0 bilinear 참조와 실제 하드웨어 footprint의 차이를 강하게 지지하지만, finite-neighbor SampleGrad는 원래 fragment quad derivative의 정확한 회수가 아니다. 다음 QA 교정은 같은2/255로 Grad weight/RGB와 안정된 입력hash/카메라 조건의 mode4 RGBA를 비교하고 모든 sample derivative 유효성을 검사해야 한다. invalid/입력불일치는 조용히 통과시키지 않는다. 원본 texture/importer/Quality/product shader는 바꾸지 않는다. 이전 bilinear FAIL과 원 데이터는 삭제하거나 재분류하지 않는다. 제품 인수·전체148/12large/8dense/M1/설치/Win64는 아직 미수행이다.

MAP PRODUCTION REPORT
- STAGE: A2 soil Lv1 spike receiver QA 한 장면, geometry 제작없음.
- MASTER: silhouette/regions/main route/side spaces 미변경·이번 검수범위 밖.
- OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes 미변경·미검수.
- LARGE: source assets/composites/overlap/repeated silhouette 미변경·미검수.
- MEDIUM: connections/remaining holes 미변경·미검수.
- GROUND: effect가 soil을 따라 보이는 원본1920 프레임 직접 확인. contamination/structure integration 전체 검수 아님.
- PLAYABLE: arenas/travel/breathing/threat space 미검수. actor 앞 지면 효과 한 프레임만 확인, 전 actor 제외 증명 아님.
- LANDMARK: primary/secondary/tertiary 미변경·미검수.
- CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 투어 미수행. 고정 QA 카메라 한 장면만.
- TECH QA: route/collision/pageerror/404/seam 전체 미검수; shader/RenderGraph error 없음, UpdateViews/Late 시간은 아래 evidence에 기록하며 전체 FPS 판정 아님.
- FILES: stage-owned QA helper/shader/meta/guard/docs/evidence. concurrent/unrelated 공유 작업 변경없음.
- GIT: source0d9ca921 원격 선확인; 결과는 본 커밋. deploy/install 미수행.
- VISUAL VERDICT: RETOUCH. 한 프레임 지면 부착 외관은 양호하나 RGBA/전체 접촉/전체 씬 검수가 남았다. 기존 A2/ImpactR4 판정 승격없음.

증거: `docs/engine/evidence/UNITY_MAC_RECEIVER_SAMPLER_20261102.json`. Python guard는 검증된 receiver47 wrapper의 경로/receipt 이름만 receiverSampler로 바꿔 동일 보호 절차를 적용했고 실제26raw/27cache 복구를 확인했다.


# Receiver sampler QA 모델 검토 — 2026-11-02

**결론: 현재 증거는 전체 PASS가 아니다.** decoder texel 오염보다 implicit filtering footprint 차이와 일관된 결과지만 원인 확정은 하지 않는다. 기존 32개 중 forward 이웃 유효는 28개, 완전한 후보 2×2 묶음은 27개다. 잘린/helper lane UV가 raw 출력에 없으므로 기존 데이터만으로 실제 implicit GPU derivative를 복원할 수 없다. 원본 실패와 `2/255`를 유지하고 독립 QA 사본에서 불완전 샘플을 FAIL로 처리한다.

## 저장된 증거와 새 분석

제품 `8f391fea`, 실행 QA `0d9ca921`, 증거 발행 `e8ffd4f7a51574e9d768d9d6ce0d8a8649a7de36`. 입력은 `profile-guard-runs/20261102T034052091757Z-6432/receiverSampler/`만 사용했다. `analyze_saved_quad.py`는 해당 JSON·mode2/mode4 float 파일을 읽고 `saved-quad-analysis.json`만 쓴다. 새 Unity/Player 실행, 컴파일, Git·설정 변경은 하지 않았다.

| 관측 | 값 / 해석 |
|---|---|
| mode1 / mode3 / mode4 기존 결과 | PASS / PASS(최대 depth 차이 `0.0198097229m`) / PASS(유한 RGB·additive alpha0만) |
| legacy bilinear 최대 weight / maxRGB 오차 | `0.0464395359` / `0.00776919`; weight FAIL 보존 |
| GPU Level0 최대 weight 오차 | `0.0464192554` |
| 기존 forward Grad 최대 weight / maxRGB 오차 | `0.000317940139` / `0.00005905888975`; 숫자가 작아도 invalid를 PASS로 세지 않음 |
| exact Load 대 legacy cache RGBA 차이 | 샘플 주변 texel 최대 `0`; 해당 위치에서 default-Blit 디코더 오류 근거 없음 |
| 실제 sampling 설정 | texture aniso1 / global ForceEnable; 설정 변경 없음 |
| forward-valid | `28/32`; invalid 0-based index `0,1,6,31` |
| 완전한 2×2 후보 | `27/32`; invalid `0,1,6,9,31` |
| forward 대 후보 fine 차분 최대 차이 | 원본 1254 texture 기준 `0.0223111510 texel`; 이 차이를 새 GPU sampling 결과로 환산한 증거는 아직 없음 |
| mode2 ↔ mode4 조건 | inputHash, view/projection 행렬, dimensions 모두 정확 일치 |
| 같은 좌표 mode4 실제 RGBA 대 저장된 float Grad 예상 RGBA | 최대 `0.000059058889746665955`; 조건부 cross-frame 증거이며 원 half 수식의 새 참조 실행 결과는 아님 |
| forward-valid 28개만의 Grad 최대 weight 오차 | `0.00021196006855461746`; 나머지 4개가 없어지거나 전체가 통과한 것으로 해석 금지 |

## 2×2 차분의 의미와 한계

ReadPixels 정수 좌표에서 `qx=x&~1`, `qy=y&~1`을 후보 묶음으로 잡았다. 각 샘플의 같은 행 `right-left`와 같은 열 `row1-row0`로 fine 형태 차분을 계산하고, 두 행/두 열의 coarse 후보도 JSON에 남겼다. forward 방식은 홀수 픽셀에서 다음 묶음을 참조할 수 있어 같은 연산이 아니다. 양의 weight이고 RGBA가 모두 finite인 네 픽셀이 모두 있어야 후보가 유효하다. zero weight는 저장되지 않은 UV이므로 `(0,0)` UV로 간주하지 않는다.

이 후보는 hardware quad, GPU coarse/fine 선택, viewport/readback 변환을 직접 포착한 것이 아니다. 특히 index9는 기존 forward 이웃이 있지만 후보 quad의 한 픽셀이 사라져 있다. 살아 있는 오른쪽/위쪽 이웃만으로 원래 helper lane 값을 추정하지 않는다. 부호·원점·분기·clip 이후 lane 동작도 실제 derivative와 동등하다고 선언하지 않는다.

일반 HLSL 설명에서도 derivative는 quad lane을 사용하며, 출력되지 않는 helper lane이 derivative 계산에 참여할 수 있다. 이 설명 자체는 이 Metal 실행의 quad 선택을 증명하지 않는다. [Microsoft derivative 명세](https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_6_Derivatives.html), [helper lane 명세](https://microsoft.github.io/DirectX-Specs/d3d/HLSL_SM_6_7_Wave_Ops_Include_Helper_Lanes.html).

## 독립 사본의 QA 교정

소유 범위는 이 폴더뿐이다. helper 원본은 f8e9c564306273b1bb15989846bfa05ec28145ec75718b656e33eb7eb9b545b5에서 복사했다. 셰이더와 meta는 기존 sampler QA의 동일 리소스를 대체하는 독립 사본이다. 두 버전을 한 Resources 경로에 중복 설치하지 않는다.

| 변경 | 계약 |
|---|---|
| 원본 보존 | legacy32, 원 bilinear gate·오차·raw 파일 및 기존 forward/Level/Load 진단 보존. 첫 PNG 선저장·probe 소유권·finally cleanup 그대로 |
| 새 모델 선택 | 동일한 원래32 샘플을 모두 사용. 삭제·재선정 없음. 후보 단계 `modelDerivativeValid`는 네 quad 픽셀이 모두 유효할 때만 true. 최종 단계는 별도 capturedDerivativeValid로 재평가하며 이전 quad 유효성은 modelQuadValid에 보존; 원래 `referenceDerivativesValid`도 유지 |
| 참조 sampler | 후보 단계는 원 packedUV와 quad 차분, 최종 단계는 원 packedUV와 QA clone의 captured ddx/ddy로 실제 원 Texture2D를 SampleGrad. 기본 Blit의 half2 UV varying은 사용하지 않음. 새 source RGBA·half metrics·half preblend RGBA 기록 |
| 원 수식 | 제품 shader의 `half4 p`, `half4 _SourceTint`, half alpha/color 연산을 QA 참조에 그대로 사용. SourceMode0/1/2, Flat, NormalBlend, Opacity 분기 유지. mode0에 absent original Opacity0을 추가로 곱하지 않음 |
| atlas·material | UV는 mode2가 기록한 packed atlas UV 자체. source snapshot의 atlas 포함 inputHash로 mode4와 동일성 확인. ring은 지원하지 않고 명시 실패. texturePreserved=true, sharedMaterial identity=false 의미 계약 유지 |
| mode2 새 gate | 모든 원32의 derivative valid, 유한 readback, serial 증가, request/completed inputHash 일치, positive coverage, UV 유효 + GPU half expected weight/maxRGB 각각 절대오차 `<=2/255` |
| mode4 비교 허용 조건 | mode2 completed ↔ mode4 completed inputHash, dimensions, finite view/projection의 float bit 값이 모두 정확 일치할 때만 같은 좌표 RGBA pairing. 다르면 비교하지 않고 FAIL |
| mode4 새 gate | 기존 mode4 유한값/존재/alpha0 gate 유지. 별도로 원 half 수식 GPU preblend RGBA와 모든 채널 절대오차 `<=2/255`; invalid derivative는 숫자가 작아도 FAIL |
| 판정 분리 | mode2 `buffer.passed`는 legacy 판정을 유지. `legacySmokePassed`도 그대로 계산. `correctedModelPassed`는 새 모델의 두 비교를 모두 요구. 새 `smokePassed`는 mode2만 corrected model gate를 사용하며 다른 환경·복원·소유권·mode gate는 유지 |
| 기록 | `receiver-sampler-model.json`에 model2/model4 frame, selected/valid/invalid, 오류/최대오차/판정. 원 mode2 summary sample마다 quad 데이터, 유효성, 모델 source/weight/maxRGB/RGBA, 실제 mode4 RGBA와 오차 기록 |

`fullRgbaSameFrameVerified`와 `fullRgbaSameFrameCompared`는 계속 false다. 위 비교는 고정 조건을 만족한 **서로 다른 프레임**의 비교다. 새 모델도 후보 finite difference이며 실제 ddx/ddy를 포착한 모델이 아니다.

후보 quad 모델은 현재32에서 **5 invalid로 차단**된다. 그 중간 결과는 별도 파일로 보존하며, 아래 마지막 QA-only derivative 캡처가 성공해야 최종 corrected model이 이를 대체할 수 있다. 이 사본은 invalid를 삭제하는 방식으로 PASS를 만들지 않는다. 새 GPU 모델 출력 수치는 실행 전이므로 기재하지 않았다.

## 마지막 한 번의 QA-only GPU derivative 캡처 구현

ROOT가 제안한 private `probeMaterial` 임시 교체를 source-only로 구현했다. 조사한 제품 C#에서 정상 화면 projection pass는 `List(...projectionTag)`로 원 renderer material을 사용한다. private probeMaterial은 probe 요청이 있을 때의 별도 float target pass에만 `overrideMaterial`로 사용된다. 따라서 정상 화면 material을 교체할 필요가 없다. 이 근거가 버전 변경으로 깨지면 실행을 거절해야 하는 private ABI 의존 경로다.

| 항목 | 구현 계약 |
|---|---|
| 실행 순서 | 원 PNG → 원 mode1/2/depth3/4 완료 → 후보 quad 모델/summary 복사 보존 → extra derivative probe → 원 probeMaterial 복구 → GPU sampler 모델 재계산 → 원 mode4 raw와 조건부 비교 → 기존 optional3840/원상복원 |
| QA clone | 제품 shader SHA256 `4e65d469a6bfc65dc7d8f939e531655982a8b93afc17811018557eb140b17a89`에서 생성. Shader 이름만 QA 전용으로 변경하고 sampling 직전 `ddx(packed)/ddy(packed)` 변수 계산을 추가, 최종 probe 출력만 네 derivative 성분으로 변경. 원 depth·world·volume·UV 계산, 모든 clip, 원 Sample/half 수식, weight discard 순서는 보존 |
| private 안전장치 | NonPublic Static `probeMaterial` 필드 타입이 정확히 Material이어야 하며, 원 4 probe로 만들어진 기존 nonnull 객체를 저장. 임시 QA Material은 QA Resources에서만 생성. field 대입 후 객체 identity 확인 |
| 추가 API 의미 | `RequestProbe(target,3)`을 라우팅 수단으로 한 번 사용하되 이번 출력만 `RGBA=(ddxU,ddxV,ddyU,ddyV)`. 기존 `receiver-mode3` depth 파일은 덮어쓰지 않음 |
| readback gate | 실제 FrameSize RGBAFloat 생성 → serial 증가/EOF 5s/API/resize 검사 → readback. 원 mode2·mode4 및 요청/완료 frame의 inputHash·FrameSize·receiver/volume counts·finite camera matrix bit 값이 모두 동일해야 함 |
| 소유권·복구 | finally에서 CancelProbe → caller target IsCreated 확인 → private field를 저장한 원 객체로 복구·ReferenceEquals 확인 → QA target/readback/material 폐기. source/draw sharedMaterial 객체도 전후 동일해야 함. 복구나 capture 실패 시 전체 FAIL |
| 파일 | `receiver-exact-derivatives.json`, `receiver-exact-derivatives.rgba32f`(기존 float layout, SHA 기록). 중간 후보 결과 `receiver-sampler-quad-model.json`·`receiver-mode2-quad-model-summary.json` 보존 |
| 새 유효성 | 원32 모두 유지. 각 원 mode2 positive sample 좌표에서 실제 derivative readback RGBA가 finite이고 gradient가 전부0이 아닐 때만 capturedDerivativeValid=true. invalid는 FAIL. 이전 forward/quad 유효성·quad 픽셀/차분은 별도 필드로 계속 보존 |
| 최종 GPU 참조 | capturedDx/Dy를 원 texture의 SampleGrad에 공급하고 원 half 수식으로 expected weight/maxRGB/preblendRGBA 계산. 원 mode2와 weight/maxRGB 비교, 원 mode4와 hash+camera gate 후 모든 RGBA 채널 비교. 모든 오차 기준은 그대로 `2/255` |
| 최종 gate | exact 캡처·원 객체 복구·display material 불변·원32 유효·mode2/model4 비교가 모두 통과해야 correctedModelPassed 가능. 중간 근사 quad 모델만으로는 최종 PASS 불가 |

여기서 GPU ddx/ddy는 **QA clone의 원 raster 위치에서 직접 출력한 값**이다. 결과를 implicit texture instruction의 내부 미분/필터 구현 자체와 비트 단위로 동일하다고 주장하지 않는다. shader 복제와 추가 출력 때문에 컴파일 최적화가 달라질 수 있으며, 실제 same-UV SampleGrad 수치와 원 mode2/4가 unchanged tolerance 안에서 일치하는지 ROOT가 확인해야 한다. 원32의 경계를 지우거나 남은27만으로 전체 통과시키지 않는다. 두 프레임의 source/camera 동일성이 성립해도 same-frame fullRGBA 증명으로 승격하지 않는다.

## 다음 한 번에 필요한 입력

더 이상의 raw CPU 분석만으로 누락된 helper UV를 만들 수 없다. 다음 한 번은 이 독립 소스와 두 QA Resources shader/meta를 ROOT가 검토·컴파일하고 같은 one-case로 실행해 위 추가 derivative raw/receipt와 최종 sample별 half 참조 비교를 회수하는 것이다. 필요한 산출물은 기존4 mode 증거, 중간 실패 보존본, exact derivative raw/receipt, 최종 model/원32 sample summary다. 원 probeMaterial 객체 복구와 display material 불변이 확인되지 않으면 수치가 작아도 중단한다. 제품8f·원texture/import/Quality·기준은 불변이다. full12/dense8 확대·제품 인수는 아직 승인하지 않는다.


ROOT 검토 보충: QA derivative 전용 material도 원래 probe처럼 `_DstBlend=0`을 명시해 clear 대상에 덧누적하지 않는다. 정상 display material에는 접근/대입하지 않는다. .meta의 빈 필드 뒤 공백만 제거했다. 제품8f 및 이전 실패 증거는 그대로다.


ROOT intake: same product8f; static receipt verified. QA-only exact derivative/sampler model correction actual GPU pending; original legacy failures and 2/255 retained. PC documentation e952ec89751d11a8aadece77f1fa8abc146b5e89 included with unchanged product Unity tree.


### QA derivative GUID 修正 / 실제 실행 전 중단

QA source3ec249b6의 일반 ARM64 빌드는 Succeeded였으나 errors1을 확인해 Player를 시작하지 않았다. 새 QA-only shader meta GUID `ea9df09ffae54e699054039ce82ee66ec`가33hex여서 Unity가 asset을 무시했다. 고친 GUID는 `1389b11cce034ca882f43d26366bb448`(32hex)이며 기존 assets와 중복 없음은 stage meta 검사로 확인한다. helper/C#/제품8f는 그대로, 이미 통과한 정적 검사는 반복하지 않는다. 실패 build와 import 전후772 drift/원본은 보존한다. 다음 source 원격 선확인 후 새 receiverModelMeta 이름으로 다시 빌드하고 errors0과 QA shader 실제 포함을 확인한 뒤 실행한다. guard의 경로/receipt 이름만 새 label로 바꾸고 원래 raw/cache 보호 알고리즘은 유지한다. 실제 GPU 인수는 미완료다.


## 2026-11-02 맥 동일제품 QA 참조 교정 실제 통과(한 장면)

제품8f391fea는 그대로다. QA2f368f105d30a6066c92ae85a33e358373205a6c와 PC 문서 후속e952ec89를 GitHub에서 빌드 전에 확인했다. 새 QA shader의33hex GUID 오류를 errors1에서 발견해 그 빌드는 Player를 실행하지 않았고,32hex로 고친 다음1813 meta GUID 형식/중복0을 확인했다. 수정 일반 ARM64 빌드 errors0, 실제 Apple M5 Pro/Metal 한 번 실행 exit0이다.

| 항목 | 이전/보존 진단 | 새 실제 값과 범위 |
|---|---|---|
| 원래 bilinear weight 게이트 | max0.04643953591585159 FAIL | 그대로 false; 허용2/255 불변 |
| 원래 bilinear maxRGB | 0.007769191637635231 | 기존2/255 이내 |
| forward / raw2x2 derivative | 28/32 /27/32 유효 | 원 invalid/실패 증거 별도 보존 |
| QA 전용 동일 shader 계산위치 ddx/ddy | 기존 source texel/load 진단 보존 | 32/32 유효, invalid0 |
| captured derivative SampleGrad weight | 이전 mip0 참조와 구분 | max0.00042392313480377197 ≤2/255 |
| captured derivative maxRGB/RGBA | 원 half 수식 복제 | 각각 max0.00010918918997049332 ≤2/255 |
| mode2↔mode4 pairing | 독립 프레임 | inputHash/FrameSize/카메라 행렬 정확 일치, 동시 frame API라고 주장하지 않음 |
| 원 probeMaterial 복구 | 임시 QA float pass만 교체 | 원 객체 동일 복구, 정상 display/source material 불변 |
| RT Cancel 소유권 | 호출자 target | 취소 후 생성 유지, 이후 QA 소유 cleanup |
| 전체 legacy / corrected smoke | legacy false 보존 | corrected true, smoke true; soil Lv1 spike 한 장면만 |
| 환경설정 | raw26/cache27 | 즉시/2s/7s 복구 후 exact |
| PNG | 1920×1080, 직접3840×1080 | ROOT 직접검수/동일 바이트; 확대 리사이즈 아님,3840×2160 아님 |

원본 텍스처/수식/tint/atlas/importer/전역 Quality/2/255를 바꾸지 않았다. 단순 mip0 bilinear가 실제 GPU footprint를 반영하지 못한 것이 큰 잔차의 근거다. texture aniso1/global ForceEnable 그대로이고, 같은 원 texel Load 대 decoder RGBA는0이었다. 제품 오류를 완화하거나 기존 FAIL을 PASS로 덮어쓰지 않고, 다른 GPU 참조 모델을 독립 게이트로 추가했다. exactddx/ddy QA shader는 제품 shader의 동일 packed UV와 clip 순서에서 값을 회수하며 shader/compiler 동일성 주장은 이번 실제 검수 범위에 한정한다.

전체148 상태/수명/진짜pool/음성대조,12large,8dense,72ring,actor/rail/rock/talltrunk 제외,2D복원은 기존 담당에게 다음 작업으로 배정했다. 아직 해당 전체 검수·same-appM1·자연플레이·서명 설치·Windows빌드/PC수신 완료를 주장하지 않는다. 원래 설치1403와 공유 HEAD/index/WIP는 바이트 유지 확인했다. 결과 evidence는 `docs/engine/evidence/UNITY_MAC_RECEIVER_MODEL_20261102.json`이다.

MAP PRODUCTION REPORT
- STAGE: A2 soil Lv1 spike 한 장면 GPU receiver QA. MASTER/OUTER MASS/LARGE/MEDIUM geometry 미변경·이번 미검수.
- GROUND: 원1920 및 직접3840×1080에서 effect가 soil을 따르는 외관 확인. shadow/contamination/전체 structure integration 통과 주장없음.
- PLAYABLE: 주전장/travel/breathing/threat 전체 미검수. actor 앞 효과 한 프레임만, 전체 actor 제외 미검수.
- LANDMARK: primary/secondary/tertiary 미변경·미검수.
- CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 투어 미수행; 고정 QA 카메라만.
- TECH QA: loading/shader/RenderGraph 실제 오류0. 접촉 mode3≤0.02m,32원 표본 RGBA2/255 이내. route/collision/pageerror/404/seam/전체 FPS 미검수. Update/Late 시간은 evidence 기록이며 GPUreadback와 전체FPS 판정이 아님.
- FILES: stage-owned QA helper/shaders/meta/guard/docs/evidence; shared concurrent/unrelated 변경없음.
- GIT: source2f368f10 원격 선확인; 본 커밋 결과발행. deploy/install 미수행.
- VISUAL VERDICT: RETOUCH. 한 장면 외관은 양호, 전체맵/전투/전체효과 인수 보류. 기존 A2/ImpactR4 판정 유지.


# Receiver full QA source-only 인계 — 2026-11-02

제품8f(`8f391fea6f157433fcaea2df611d0a9b146c6604`)와 one-case baseline `2f368f105d30a6066c92ae85a33e358373205a6c` 유지. 실제 one-case PASS 증거는 ROOT의 `168b609e7c585a38a28bda3bfe6beddadf2ade19`에 있다. 이번 산출물은 **컴파일·Unity·Player 실행 전**이다. 새 팀/워크트리/자동화/Git 실행·제품/texture/import/Quality/Prefs 편집은 하지 않았다.

## 진입과 coverage

기존 capture 필수 인자에 `-ground-receiver-full`을 추가한다. `-ground-receiver-smoke` / `-ground-geometry-probe`와 동시 사용 금지. visible Metal, absolute active sandbox, empty absolute output을 요구한다. 시작 시 기존 통과 one-case body와 동일 최종 gate를 먼저 실행하고 PASS해야 확장한다. 기존 단독 one-case 경로와 기존 sampler-reference shader는 그대로 유지했다. full용 ring/half 참조는 별도 GroundReceiverFullReference shader로 분리했다. 기존 helper 수정은 partial 선언 및 새 Start 분기 두 곳이다.

| 집계 | 실제 계산 / 의미 |
|---|---|
| consumerCount | 현재 Consumers 배열 길이 49. 하드코딩148 없음 |
| expectedStateRows | `Consumers.Length × 3 + 2 = 149` |
| 상태 행 | soil/root-slope/wood-bridge에서 각49 =147 |
| 수명 행 | actual pool lifecycle + holy ring lifecycle =2 |
| largeRows | 상태147 안의 `size-`4×3=12; Lv1/Lv20 spike/holy를 SkillRules 실제 반경으로 생성 |
| expectedDenseRows | 별도 size4×3=12조건, 각8개 동시 FireZone. 8개를8개 case로 부풀리지 않음 |
| expectedRows |149+12=161. one-case 선행 증거는 별도 하위 폴더이며161행에 중복 산입하지 않음 |
| 72 ring |72개 case가 아니라 원 LineRenderer72점과72polygon/fwidth analytic 분기 |
| actual | receipt에 required/generated/missing/consumerCount/expectedStateRows/expectedDenseRows/expectedRows/generatedStateRows/generatedDenseRows/generatedRows 기록. layer 진단은 부모 행 하위이며 기본행 수에 더하지 않음. generated는 행 record 존재를 뜻하고 성공 개수가 아님. gpuRequiredRows/gpuVerifiedRows/stateOnlyRows/layerCount/verifiedLayerCount/selectedPixelSamples를 별도 기록하며 실패·중단 행을 GPU PASS에 산입하지 않음 |

Zero-deploy/빌보드/2D/수직 burst는 ground GPU PASS로 이름 바꾸지 않는다. ground volume이 필요한데 없으면 FAIL. 실제 모든 visible boss source가 vertical burst인 행은 명시적인 billboard phase control로만 분류한다. 보이는 vertex8/triangle12는 volume metadata이며 접촉 증명에 사용하지 않는다.

## 전층 화면·성능을 보존한 layer 격리

ice/blizzard3겹, holy 본체+링2, clip/rim처럼 한 consumer의 다중 volume을 모두 수집한다. 전층 1920 원본과 직접3840×1080을 먼저 저장한다. 직접3840 이후 정상 EOF를 다시 기다려 public FrameSize가 정상 렌더로 갱신된 다음 probe한다.

large/dense의 CPU 성능은 격리 전에 기록한다. 최초 cold UpdateViews/Late 각각, fixed3회, yielded deployment3회, T복원1회를 각각 분리 측정한다. QA readback·gzip·EOF·참조 shader 시간은 `qaCaptureElapsedMs`이며 CPU 성능으로 합산하지 않는다. fixed3회는 같은 프레임 반복일 수 있고 deployment는 합성3프레임이다. 자연플레이/60FPS/장시간 성능 증거가 아니다. 완료된 Native 호출이2초를 넘으면 중단하지만 이미 막힌 호출을 CPU 내부에서 강제 중단할 수 없으므로 ROOT 외부 watchdog이 필요하다. Simulation.Tick을 호출하지 않는다.

ROOT/PC가 승인한 방법으로 진단 시에만 현재 fixture의 ground draw enabled 원값을 저장하고 선택 layer 하나만 켠다. source forceOff/Core/PB/source·display material은 편집하지 않는다. finally에서 모든 draw enabled와 source/line forceOff 및 display material 객체를 대조한다. 전층 source/PB metadata hash도 마지막에 일치해야 한다. 격리 original enabled/source forceOff/line forceOff 배열, 선택 draw ID, 복구 여부를 layer receipt에 남긴다. 정상 dense8 성능과 화면은 격리 없는 전층 상태다. 격리 화면을 정상 합성 화면으로 제출하지 않는다.

## 각 layer의 실제 GPU 검사

제품 shader의 원8f 계산을 QA 이름으로 복제한 `GroundReceiverFullEvidence`를 private static probeMaterial에만 잠시 넣는다. 정상 화면 projection pass는 override 없는 renderer material을 사용한다. 기존 private field 타입·원 nonnull Material 객체·대입 identity를 확인하고, `RequestProbe(target,3)`으로 각 진단을 별도 float target에 요청한다. 원 depth3 파일을 다른 의미로 덮지 않는다. QA material은 명시적으로 `_DstBlend=0`이다.

| map | RGBA 의미 |
|---|---|
| world | 실제 scene-depth worldXYZ + 원 weight |
| uv-weight | 실제 packedUV + 원 half preblend maxRGB + 원 weight |
| depth | sceneEye / receiverEye / abs 차이 / 원 weight |
| preblend-rgba | 실제 원 half preblendRGBA |
| derivative-or-ring-analytic | texture: sampling 직전 GPU ddx(packed).xy/ddy(packed).xy; ring: polygon signed distance/fwidth(distance)/stroke/0 |
| owner-signature | anchor.x/anchor.z/ringRadius/ringWidth. 선택 source와 유일하게 매칭되어야 함 |

실제 public FrameSize의 Linear RGBAFloat, nonpositive size/format/API/resize/serial EOF5초 오류는 중단한다. API receiver>0/activeVolumeCount=1, source hash와 finite camera view/projection float-bit 동일성, map 간 dimensions/camera 동일성이 필수다. 다른 프레임 자료이며 same-frame 전체RGBA 증명으로 부르지 않는다.

모든 positive GPU pixel에서 depth 두 값이 양수, abs 차이0..0.02m, 차이 채널과 실제 subtraction 일치, worldXZ가 선택 volume footprint 내부인지 검사한다. texture는 source sprite rect/pivot/PPU/scale/roll/flip에서 독립 계산한 PB UV/atlas 계약과 world→UV를 검사한다. shader/source material identity raw=false 의미 계약, 원 texture/tint/Flat/Opacity/NormalBlend/sorting·UsesReceiverDepth/sourceforceOff도 유지해야 한다. absent Opacity0을 mode0에 곱하지 않는다. body UV epsilon1e-5, world footprint epsilon0.0001m이다.

각 layer의 실제 positive pixel에서 최대32점을 고르게 선택한다. 모든 선택 sample에 GPU derivative finite/nonzero 조건을 요구하며 invalid를 삭제하거나 통과시키지 않는다. 원 texture를 실제 sampling 설정의 SampleGrad로 다시 샘플하고 원 shader half 분기로 weight/maxRGB/preblendRGBA를 계산한다. 원 mode0/1/2 및 Flat/Opacity/NormalBlend/tint/packed atlas UV를 사용한다. weight/maxRGB/모든 RGBA 채널의 절대오차 기준은 기존 `2/255` 그대로다. source/world/depth weight의 프레임 간 안정성도 같은 기준으로 검사한다. 선택점 밖의 모든 RGBA를 참조 계산한 것이라고 주장하지 않는다.

ring은 texture Grad=0을 허용하는 방식이 아니다. 원 Line72점이 유한한 규칙72polygon인지 검사하고, native ring producer의 Radius/Color 및 line width와 PB를 대조한다. 실제 worldXZ에서72polygon signed distance를 별도 계산한다. GPU의 실제 fwidth>0, distance 오차<=0.0001m, 동일 폭/fwidth로 계산한 stroke 오차<=2/255를 요구한다. 이 analytic stroke로 별도 GroundReceiverFullReference GPU half ring 수식을 실행하여 weight/maxRGB/RGBA를 검사한다. CPU GroundY나 proxy triangle 보간값을 접촉 증명으로 쓰지 않는다. ddx/ddy 출력 clone의 컴파일 결과가 implicit sampler 내부와 비트 동일하다는 주장은 하지 않는다.

각 probe finally에서 CancelProbe→caller target IsCreated 확인→원 probeMaterial 객체 ReferenceEquals 복구→RT/readback/QA material 정리를 수행한다. 상태·pool·수명·2D actual source 참조/변환/파괴 동작은 기존 lifecycle 행동을 유지하고, 오래된 vertex/contact 및 ring-render-to-empty-depth gate만 새 receiver GPU 검사와 metadata gate로 바꿨다. real pool의 ice→air projectile→ice 같은 source 객체 참조·forceOff·draw enable, 실제 arena2D 전환·원 scale/rotation·GO disable/Destroy를 검사한다. 원 Simulation ref/hash 복구, 원 view 재바인딩, writer 정지와 오디오/media drain은 유지한다.

## 제외 대상의 남은 API 한계 — 자동 전체 PASS 차단

actor/rail/rock/tall trunk **각각의 scene raster identity/negative mask를 반환하는 API는 없다.** receiver private inventory의 hierarchy 경로는 diagnostic으로 보존하지만, 이름만으로 실제 화면 카테고리 exclusion PASS를 만들지 않는다. 실제 source shader는 receiver depth와 scene depth가2cm 내인 pixel만 통과시키지만 이것만으로 네 카테고리를 각각 검수했다고 주장하지 않는다.

따라서 `technicalPassed`와 최종 `passed`를 분리했다. `technicalPassed`는 실행·149+12·GPU/상태·복구·Metal·오디오 gate이고, `passed`는 추가로 `exclusionsVerified`와 `visualReviewed`를 요구한다. 두 필드는 이번 소스에서 false/UNREVIEWED로 남겨 자동 전체 PASS를 막는다. ROOT가 정상 전층 PNG를 검토하고 실제 네 제외 카테고리의 authoritative raster 증거를 추가하기 전에는 부족분이 해소되지 않는다. 이 소스만 실행하면 기술 검사가 모두 통과해도 최종 exit2일 수 있음을 명시한다. category 이름 추측이나 registry 목록을 pixel 증명으로 바꾸지 않는다.

## 저장·인수

모든 map은 메모리에서 분석하며 정확한 원 float bytes의 SHA256/rawBytes와 최대32 선택 표본·카메라/hash·요약·오류를 항상 기록한다. `bytesHashComputed=true`는 파일 보존을 의미하지 않는다. 기본은 `rawRetained=false`, path=null, compressedBytes=0이다.

영구 float는 baseline을 포함해 실제 저장 총 **3GiB** 상한이다. 명시적 대표 목록은 soil/root-slope/wood-bridge의 `size-spikeTrap-Lv1` 정상 parent의 layer0(각6map)뿐이다. 추가로 새 FAIL layer의 이미 회수된 map을 cap 내에서 보존한다. 그 밖의 원 bytes는 처음부터 메모리 분석만 하며 임시 raw 파일을 만들거나 기존 파일을 지우지 않는다. 실패 raw도 cap에 도달하면 hash/표본/오류/retentionReason을 남기고 rawRetained=false이다. retentionTruncated를 전역 기록한다. 대표 정상 layer의 PNG와 sample/hash evidence도 별도로 유지된다.

보존 map은 lossless gzip, bottom-left row-major little-endian RGBA float32, rawBytes=W×H×16이다. raw와 압축 파일 SHA256/실제 compressedBytes를 구분한다. 쓰기 전에 gzip worst-case 원bytes+64KiB가 잔여 cap에 들어오는지 보수적으로 확인하고, 실제 보존량으로 누적한다. 재직렬화 raw SHA가 분석 raw SHA와 다르면 실패한다. baseline의 기존 비압축 raw도 floatStoredBytes에 산입한다. cap 때문에 저장하지 않은 raw를 파일 존재로 보고하지 않는다.

PNG worst-case 예상 상한은 `(expectedRows+onecase)×(1920×1080×4 +3840×1080×4 +131072)` bytes로 명시하고 실제 누적 pngStoredBytes도 기록한다. 전 run `freeReserveBytes=3GiB`, freeStart/freeLast/freeMinimumObserved를 기록한다. 시작 시 PNG 예상상한+float3GiB+reserve3GiB가 가능한지 확인한다. 각 PNG/float 쓰기 전에도 reserve3GiB를 남길 여유가 없으면 안전 중단/FAIL이며 자기 산출물·과거 실패·기존/타인 증거를 삭제하지 않는다. metadata는 작은 JSON이며 probe progress는 큰 전체 receipt 대신 작은 progress JSON을 갱신한다.

신규 partial C#과 shader에는 meta를 제공했다. Root가 고친 exact derivative meta의 GUID `1389b11cce034ca882f43d26366bb448`을 사용하며 33hex 원본은 사용하지 않는다. 함께 제공한 기존 리소스는 같은 경로를 대체한다. 별도 경로로 중복 설치하지 않는다. `SHA256SUMS`와 `guid-inventory.json` 참조. 신규3 GUID는 candidate2ac-input/Assets의 기존 meta와도 대조했다. coverage-plan.json은 source 계획 목록이며 실제 generated 증거가 아니다.

실행 전 상태: source-only, 실제 generated/GPU coverage0, 시각 UNREVIEWED, 제외4종 미검증. 기존148 vertex PASS를 GPU149 PASS로 바꾸지 않았다. 신규 source 두 개를 ROOT 정적 검사에 모두 포함해야 한다. ROOT가 source 고정·원격 선증명·빌드·실제 실행·가드 최종복구 및 이후 same-app M1/자연플레이/서명설치/Win64를 담당한다.


ROOT 인수 검토: UnityEngine.CompressionLevel과 충돌한 gzip enum 참조만 System.IO.Compression.CompressionLevel.Optimal로 한정했다. 첫 정적 오류 기록을 보존하고 실패 범위 두 C#만 재검사한다. 제품/허용기준/검수 범위 변경없음.

ROOT metadata: 신규 shader meta의 빈 세 필드 뒤 공백만 제거해 git diff --check를 통과시킨다. GUID와 helper/실행 기준은 그대로다.


ROOT source intake: full QA static passed. All coverage and raw-retention maxima are declared by the helper. Product8f unchanged. Prebuild source checkpoint only; actual full GPU/149-row, dense, exclusion and final integration acceptance pending.


## 2026-11-02 full161 실제 Metal 최종 — 인수 보류

제품8f 동일, QA822756730d260b43a2ef952a0c5a9972a812f5ea를 원격에서 빌드 전에 확인했다. 정상 ARM64 errors0, 원본 import 전후772 drift 바이트 모두 보존. 실제 run은 약2209초 동안 진행됐으며 한 장면 hard timeout 없이 각 probe진행/정상 프레임/메모리/디스크를 구분해 감독했다. 환경설정26raw/27cache exact 복구가 끝났고 설치1403 및 공유 HEAD/index/WIP 바이트도 유지 확인했다.

| 최종 집계 | 실제 값 | 의미 |
|---|---:|---|
| 기본 상태 / 별도 dense / 총 행 |149 /12 /161 |49×3+2 및12조건×8효과, 중복ID0·누락0 |
| 행 PASS / FAIL |100 /61 | 원 final false/exit2 유지 |
| clone 대 독립 sampler 비교 FAIL |60행 | 실제 제품 출력 오류 확정 아님 |
| 수명 정리 예외 |1행 | ring root Destroy 후 finally Dispose/Reset이 파괴 GO SetActive 호출 |
| state metadata flag |161 true | 실제 두 lifecycle 행동 결과의 최종 merge가 예외로 실행되지 않았으므로 전체pool/2D행동 PASS라고 부르지 않음 |
| GPU required / verified 행 |134 /74 |27개는 state-only; 링행은 GPUtrue이나 정리예외로 rowfalse |
| 전체 layer / verified |1185 /901 |284 layer에서 모델 비교 미통과, proxy 정점 증명 아님 |
| 선택 pixel 표본 |35570 | 모든 RGBA texel 참조 비교라고 주장하지 않음 |
| depth / UV / derivative invalid 행 |0 /0 /0 | finite·nonzero derivative만으로 implicit sampling 동등성을 증명하지 않음 |
| 최대 양의 pixel 깊이 차이 |0.019995689392089844m | 기존0.02m 이내, 제외 픽셀 원인 증명 아님 |
| 최대 weight / RGBA 잔차 |0.3122860789299011 /0.4807712733745575 | 기존2/255 유지, 모델 FAIL 보존 |
| 원72 ring signed distance / stroke 최대오차 |0.000006970018148422241m /0.00014434009790420532 | texture consumer 이름 GroundRing과 source Line72 ring 구분 |
| 영구 float / PNG 저장 |348503495B /1948343722B | float3GiB cap/여유3GiB 지킴, retentionTruncatedfalse |

저장자료 분석(6case/실패7layer/224표본)은21 FAIL을 보존했다. 그 중 완전한quad18개에서 capturedddx/ddy는 fine 차분과 일치하지만 implicit Sample과 같은 footprint라는 증거는 아니다. 제품8f는 URP SampleBias 경로, QA 독립 참조는 raw SampleGrad이므로 coarse/fine 및 실제_GlobalMipBias도 분리해야 한다. Git 설정의 renderScale1/카메라mMipBias0 또는SMAA만으로 런타임 값을 확정하지 않는다. 다음 실행은 실패한root-slope spikeTrap/SeekerMines 두 fixture에서 원제품 공개mode2/4, QAclone, 독립 모델을 같은 좌표·카메라·입력으로 비교한다. 원실패/2/255/texture/importer/Quality/제품 source를 바꾸지 않는다. 전체161을 새로 반복하지 않고 이 최소 진단을 먼저 인수한다.

PC는 전송된 원본1920 세 장의 bytes/SHA를 모두 맞추고 직접 검수했다. RootSpike/Seeker는 뿌리 상면 접지와 공중 사각면 없음, soilDense8Lv20는 실제 효과와 겹친 player 몸/발이 앞에 정상 표시됨을 해당 프레임 범위에서 관측했다. deck까지 효과 이어짐은 확인했으나 난간전체/높은줄기/바위 개별 제외는 이 세 장으로 PASS하지 않았다. Root도 같은 원본을 열었다. 소유 whitelist3334 서버15248은 수신확인 후 SIGTERM/exit0로 종료했다. 별도 시각 관측은 runtime false/UNREVIEWED를 덮지 않는다. 범용 객체 마스크 framework는 전달 필수에서 제외했고, 실제 겹침/모호한 대상만 추가 근거를 수집한다.

MAP PRODUCTION REPORT
- STAGE: A2 soil/root-slope/wood-bridge의 ground-effect QA. MASTER/OUTER MASS/LARGE/MEDIUM geometry·원 assets 미변경. silhouette/regions/mainroute/sidespace/outerholes/composites/overlap은 새 제작·전체인수 대상 아님.
- GROUND: 실제 원본1920/직접3840×1080, 전층 표시 후 layer격리·원enabled 복구. 양의 픽셀 접촉만 검사, 전체 환경 shadow/contamination/structure integration PASS 아님.
- PLAYABLE: 실제 조작대상 앞 표시 일부 중첩 확인. 전체arena/travel/breathing/threat/전투 readability 미인수.
- LANDMARK: primary/secondary/tertiary 미변경·전체 검수 아님.
- CAMERA QA: 세 고정 실제 위치만, START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 투어 아님.
- TECH QA:161 generated/0missing, clone-model60FAIL와ring정리예외1. route/collision/pageerror/404/seam 전체 미검수. CPU 호출시간은evidence이며 GPUFPS/자연플레이 증거 아님.
- FILES: QA helpers/shaders/meta/guard 및 docs/evidence만. shared concurrent/unrelated WIP·index 유지.
- GIT:82275673 source 원격선확인; 본 커밋 final결과. commonUnity/설치/Win64/배포는미수행.
- VISUAL VERDICT: RETOUCH. 관측된 접지·player 앞표시는 양호; 전체 인수 보류. 기존 A2/ImpactR4 판정 유지.

증거: `evidence/UNITY_MAC_RECEIVER_FULL_20261102.json`, `evidence/UNITY_MAC_RECEIVER_QUAD_ANALYSIS_20261102.json`. 원본 전체receipt·raw/PNG·before/after snapshot은 로컬 보존되며 그 SHA/정책/경로를 evidence에 기록했다.


# Receiver triad 최소 QA — source-only 인계

지면/셰이더 기준8f 유지. 제품 통합 tip은 별도 CLI metadata이며 orb guard31644248을 포함한다. ROOT `receiver-full-reviewed`의 CompressionLevel 명시 수정·정적 통과본에서 복사했다. 고정 원본 파일은 편집하지 않았다. 기존 full/smoke/geometry 실행 동작과 기존 shader는 보존했고 main Start 앞에 명시 triad 분기를 추가했다. FullRingLifecycle은 narrow 전용 optional time 입력 교정만 예외다. 신규 partial `GroundReceiverTriadCapture.cs`와 별도 camera-bias shader를 함께 인수한다. 최신 승인에 따라 실제 orb 부모파괴→Dispose 회귀1개와 기존 두 lifecycle 행동흐름의 좁은 실행을 추가했다. FullRingLifecycle의 실제 행동 단계는 유지하며 최신 승인된 narrow 전용 optional time 입력만 추가했다. 무인수 full 동작은 기존과 같다. **컴파일·Unity·Player·Git 실행 전**이다.

## 실행 범위

기존 Boot 필수 `--unity-ground-placement-capture --remodel3d --unity-quick-start --unity-qa-sandbox <absolute> -output <empty absolute> -source-sha <actualQAsha>`에 `-ground-receiver-triad -product-source-sha <integrated product tip40hex>`를 추가한다. smoke/full/geometry 플래그 동시 사용 금지. 같은 triad run 마지막 전용 하위 단계로 기존 두 lifecycle 흐름만 실행한다. 기존 healthy one-case/full149/dense를 재실행하지 않는다. lifecycle은 아래 기존 두 흐름만 좁게 실행한다.

| fixture | producer 그대로 |
|---|---|
| root-slope/spikeTrap | world `(36.2916,-73.17135)`; 정확 기존 Populate("spikeTrap"); R100, T30/Max180, Id1 |
| root-slope/SeekerMines | 같은 site; 정확 기존 Populate("SeekerMines"); R56, T61/Arm60/Max180, armed |
| player | 기존 fixture offset Core X−180/Y+80 |
| state | 동일 sample seed0x671403 + AttachDruidBoss, Simulation.Tick 호출 없음 |

검증된 field-entry/lobby close/API cache/원 Simulation hash·ref 복구/writer pause/media drain 루틴만 재사용한다. 정상 전층1920와 직접3840×1080을 먼저 보존하고, 정상 EOF를 기다려 descriptor를1920으로 되돌린 뒤 layer별 probe한다. 각 fixture의 실제 source 목록을 수집하며1..4 texture layer 범위만 허용한다. 각 layer의 다른 draw enabled 원값을 저장→선택 layer만 diagnostic→finally 원 enabled/sourceforceOff/display material 객체 복구를 요구한다. 정상 표시·Core·원 texture/import/Quality를 바꾸지 않는다.

**Core phase는 같지만 옛 run의 wall-clock pose를 조작해 재현하지 않는다.** NativeSkillView spike의 회전·alpha는 전달된 time, NativeBossView seeker의 회전·alpha는 Time.unscaledTime에 의존한다. 원 producer를 정확 호출하며 그 시각과 실제 원 tint/PB/UV mapping을 기록하고 이후 writers를 정지한다. 옛32점은 그대로 검사하되 새 art pose에서 관측되지 않으면 미검증으로 남긴다. 옛 frame과 같은 source hash라고 주장하지 않는다. 같은 triad 안에서 모든 비교의 hash/camera를 엄격히 맞춘다.

## 세 계층과 gate 분리

| 계층 | 실제 경로 / 출력 |
|---|---|
| P | **원제품** private probeMaterial의 shader `EXODUSER/GroundSkillProjection` 확인 후 공개 RequestProbe mode2(packedUV/maxRGB/weight), mode4(preblendRGBA) |
| C | 고정 QA FullEvidence의 기존6 map: world/UV/depth/RGBA/derivative/owner signature |
| R(Cuv) | 기존 FullReference raw SampleGrad + 원 half 식, clone UV와 clone captured ddx/ddy 사용 |
| R(Puv) | 별도 참조 결과: product mode2 UV와 같은 captured ddx/ddy 사용. 원제품 내부 derivative를 직접 측정했다고 부르지 않음 |

P2→P4를 먼저 회수한 다음 C6개를 회수한다. shader가 canonical이 아닌 private material을 원제품으로 기록하지 않는다. 첫 공개 probe 전 native lazy slot이 null일 수 있다. 이 경우 API가 원제품 material을 생성한 뒤 identity를 확인하고 그 **native-created 원 객체**를 이후 모든 QA swap의 복구 기준으로 삼는다. worker가 canonical material을 새로 만들거나 파괴하지 않는다. canonicalNativeLazyCreation을 기록한다. 원제품 mode2/4 자체는 QA material override 없이 호출한다.

모든 RT는 실제 FrameSize의 Linear RGBAFloat, 요청serial 증가/EOF5초/API/resize 검사, ReadPixels, CancelProbe 후 caller target 생존 확인을 요구한다. source/PB hash·finite camera view/projection float bit·FrameSize·receiver count·active layer1을 비교한다. C 경로는 원 private 객체로 exact 복구하고, P 경로도 그 객체가 그대로인지 확인한다. 원 display sharedMaterial/sourceforceOff/Core를 바꾸지 않는다. finally에서 원 Simulation ref/hash를 되돌리고 view event 바인딩을 복구한 뒤 writers paused 상태로 종료한다.

1. **imageEquivalenceGate**: 전체 positive mask 합집합에서 P/C mask 불일치·UV·weight·maxRGB·RGBA 차이, P2maxRGB↔P4maxRGB 및 C의 내부 일관성을 검사한다. UV tolerance1e-5, 색/weight는 기존2/255. P-only/C-only/both positive 개수를 기록한다. world는 C에서 회수한 것이라고 명시하고 원 sprite UV 계약으로 P2 UV와 교차 검증한다. canonical world map을 직접 얻었다고 주장하지 않는다.
2. **selectedCoverageGate / productCloneGate**: 고정 옛32점과 이번 clone의32점 합집합을 모두 보존한다. 옛 실패점(Spike2/Seeker7)은 별도 flag. product/clone 양쪽 coverage·world가 없으면 미검증/FAIL이다. imageEquivalenceGate와 selected gate를 나눠 “새 pose에서 옛 좌표 미관측”을 실제 P/C 출력 차이와 구분한다.
3. **cloneIndependentGate**: 기존 C의32점/FullEvaluate 결과를 그대로 보존하고 합집합에 대한 R(Cuv)도 검사한다. 기존 clone FAIL을 지우지 않는다.
4. **productUvIndependentGate**: R(Puv)의 sourceRGBA/expected weight/RGBA를 별도로 기록해 P와 비교한다. derivative finite/nonzero, P/C 양쪽 coverage·UV 일치·world를 요구한다. UV가 다르면 clone derivative를 원제품 참조로 통과시키지 않는다. 실제 product implicit gradient와 동등하다는 자동 주장은 하지 않는다.

R 두 경로는 최대32점씩 GPU batch 처리한다. invalid 표본도 자료를 기록하며 조용히 삭제하지 않는다. 각 선택점에 P/C UV/RGBA/weight, C world/gradient, 두 R sourceRGBA/expectedRGBA/오차, 양쪽2×2 UV/weight와 captured gradient4개를 저장한다. clear0/helper UV를 추정하지 않는다. 새 coarse 후보 GPU 실험은 추가하지 않았다. 기존 저장 분석 후보를 재사용할 수 있다. 모든 원 FAIL 및2/255는 그대로다.

## camera-scope mip bias 읽기

PC가 확인한 URP17.6 Core 매크로는 implicit SampleBias에 `_GlobalMipBias.x`, Grad에 `.y` 보정을 사용한다. 현재 R은 UnityCG raw.SampleGrad라 그 보정을 적용하지 않는다. bias가 원인이라고 단정하거나 원 R FAIL을 보정값으로 덮지 않는다.

원 FullEvidence 파일은 그대로 두고, 별도 `GroundReceiverTriadBias` copy에 kind6 `_GlobalMipBias.xyzw` 출력만 추가했다. 기존 clip/art 범위 안에서 같은 실제 camera/pass로 한 번 더 회수하며 `camera-mip-bias`라는 별도 raw다. 기존 canonical 객체를 잠시 QA bias material로 바꿨다가 exact 복구한다. C positive 픽셀에서 finite하고 uniform한 값, 양수 gradient scale y를 관측해야 한다. 별도로 EOF `Shader.GetGlobalVector`도 기록하지만 **다른 camera가 덮었을 수 있으므로 camera-scope 값으로 대체하지 않는다.** 보정 sampling variant는 만들지 않았다.

## raw/종료/해석

두 fixture/layer의 P2/P4+C6+bias1, 총9 map만 lossless gzip으로 보존한다. 원bytes/압축 SHA·layout·rawRetained·camera/hash/serial·소유권을 기록한다. float 실제 저장 max3GiB, free reserve3GiB, PNG 예상상한을 지킨다. 상한에 도달하면 hash/sample을 보존하고 layer completed=false로 기록한다. 기존 파일/실패 증거 삭제 없음. helper 공용 progress 파일 이름이 receiver-full-progress.json이어도 triad가 full을 실행한 것이 아니다. 최종 문서는 receiver-triad-receipt.json이다.

`completed`는 두 fixture 자료 회수·아래 orb 회귀1개·두 lifecycle 흐름의 종료/기록·원 source 상태 복구·환경 gate다. 실제 action/GPU/merge PASS는 별도 lifecycle gate이며 최종 passed에 lifecycleMergedGate를 요구한다. `productCloneGate`, `cloneIndependentGate`, `productUvIndependentGate`는 따로 기록한다. `passed`는 세 gate까지 모두 true일 때만 가능하며, 비교 FAIL이어도 나머지 fixture 회수는 계속한다. API/serial/camera/hash/소유권 오류는 중단한다. exit2는 진단 불일치/미검증을 포함하며 **제품 FAIL로 번역하지 않는다.** P≈C/R만 다르면 참조 모델 비동등성, P≠C면 clone 계측/컴파일 동등성을 먼저 조사한다.

인수 범위는 세 C# 파일과 제공한 shader/meta, selection-origin, GUID/공백/보존 inventory, SHA256SUMS다. ROOT가 정적 검사·고정소스 원격 선증명·빌드·단1회 실행을 담당한다. 추가 확대는 하지 않는다.


## 추가 승인: 실제 orb 부모파괴 후 Dispose 회귀1개

제품 guard commit은 `316442480c051cee99a5d9a783b0875640892ea8`이며 ROOT가8f 대비 NativeSkillView.cs의 `orb.go!=null` 조건1줄뿐임을 확인했다. worker는 제품파일을 수정하거나 새 blob을 대신 stage하지 않는다. 실행 인자 **`-product-source-sha`**를 `productTip`으로 기록한다. ROOT launcher는 문서 정정까지 포함한 e33ed53574a187db36e00dfbd1f92b4d6f263635를 전달한다. 이 tip의 Unity tree는 guard31644248과 동일하다. `groundBaseSource`와 같은 값의 alias `groundSource`는8f를 유지하며 지면/UV/색/셰이더 기준을 나타낸다. source-sha는 QA source commit이다. CLI metadata만으로 실제 build 내용을 증명한다고 주장하지 않으며 ROOT frozen manifest/DLL SHA와 연결한다.

두 삼자 fixture를 모두 회수한 뒤 별도 `native-skill-orb-dispose-regression.json` 하나를 기록한다. 정상/비정상 비교 gate가 false여도 API/소유권 오류가 없으면 두 fixture와 이 회귀를 회수한다. 전체149/161은 재실행하지 않고, 아래 승인된 기존 두 수명 흐름만 좁게 호출한다.

| 단계 | 실제 증명 |
|---|---|
| 소유권 | 새 자기 parent GameObject + 별도 Simulation + 실제 NativeSkillView 생성. game.Simulation에 별도 Core를 대입하지 않음. 외부 GO를 Destroy하지 않음 |
| 생성 | own Simulation IceOrbActive=true/T30, 자체 좌표를 설정한 뒤 **원 Update(ownSim,0f)**를 호출. private orb Item/GO 실제참조 확인, OrbShown=true/activeSelf=true, parent 소유권, base0/base1/glow0/glow1 SpriteRenderer 정확4개·정상 sprite·최소1enabled 확인 |
| 기대 children | 자기 parent1+ice orb1+renderer GO4 =6개 객체, parent 직계1/ice orb 직계4. 실제 이름/객체ID/own material4개ID를 생성 전에 기록 |
| 폐회로 재현 | 자기 parent를 Destroy → 정확2frame → parent/orb/6GO가 Unity null인지 확인. **managed orb Item 및 같은 go wrapper가 여전히 남았는지도 확인**하여 원 `orb!=null` 조건을 실제 통과할 상태를 증명 |
| 핵심 호출 | 파괴됐다고 Dispose를 건너뛰지 않고 **isolatedView.Dispose() 직접 호출**. 여기에는 try/catch로 통과시키는 처리가 없음. 예외는 outer triad error/exit2와 회귀 error에 보존 |
| 정리 | 정상 반환 후2frame 대기, own material4개 Unity null, view의 zones/waves/blades/orbs/orbTrails empty, maliceSim null 및 own Core 이벤트 해제 후 원 own-Core hash 복구 확인 |
| registry/외부 보호 | centered slam/malice sets, NativeGroundSkillSurface registry, projection volume/receiver registry, HD2D actors의 원소identity fingerprint 전후 일치. 필드누락을 empty로 간주하지 않고 FAIL. game.Simulation 동일ref/hash, 원 original Core hash, game transform finite-bit 동일성 확인 |
| 오류 | 회귀 범위 Error/Assert/Exception log를 기록하고 하나라도 있으면 PASS 불가. Dispose 미호출·미생성·GO 미파괴·빈 orb 대체는 PASS 불가 |

핵심 Dispose 전에 생성 검사가 실패하면 product Dispose를 cleanup에서 직접 시도할 수 있지만 `disposeAttemptedAfterDestroyed`가 없으므로 절대 회귀 PASS가 되지 않는다. 핵심 Dispose가 던지면 다시 시도해 숨기지 않는다. 자기 parent 잔재만 finally에서 정리한다. OrbShown/managed orb Item은 기존 Dispose가 false/null로 reset한다고 새로 요구하지 않는다. constructor가 만든 모든 Sprite asset 해제를 검수하는 별도 확장이 아니라, 실제 관측된 destroyed orb.go 접근과 해당 GO/material/event/registry 정리만 폐회로 검사한다.

원 full의100/161 pass,61fail(model60+ring cleanup1), state 행동 merge 미실행 등의 과거 결과는 변경하지 않는다. 이번 회귀 PASS가 나와도 기존 pool/2D 전체 PASS로 소급하지 않는다. 아직 실행 전이다.


## 최신 마감 승인: 기존 두 lifecycle 행동흐름의 좁은 실행

같은 `-ground-receiver-triad` run에서 삼자2fixture → 실제 orb 표적회귀1개 → **FullPoolLifecycle()와 FullRingLifecycle()** 순서로 호출한다. 별도 149/161 전체 loop는 없다. FullPoolLifecycle 본문은 ROOT 원본과 동일하며 FullRingLifecycle은 아래 optional time 입력 교정만 적용하고, disable/GO/real pool air→ground 재사용/arena2D/zone removal/Destroy/마지막 Dispose를 간이 검사로 대체하거나 생략하지 않는다. CompressionLevel.Optimal 한정 수정도 원 검수본 그대로다.

| 기록 | 의미 |
|---|---|
| lifecycle-ground-lifecycle-action.json / lifecycle-ground-ring-lifecycle-action.json | 각 흐름 종료 **finally에서 즉시** 저장. 실제 receipt.rows의 원 Row 전체, 원 actionRow.passed, returned/enumeratorDisposed, 예외를 보존 |
| lifecycle-narrow-receipt.json | 각 흐름 종료와 전체 wrapper의 finally에서 재계산/저장. 두 흐름 expectedFlows=2 |
| actionRowPassed | 실제 기존 행동 코드가 계산한 Row.passed. 예외 전에 초기값 true였다면 그대로 남지만 completion/PASS로 해석하지 않음 |
| completed | iterator 정상 종료·정리 반환·실제 action row 존재·명시 error 없음. early-yield 원 error/예외면 false |
| gpuPassed / metadataPassed | 기존 FullCapture의 실제 GPU/metadata 값. action 결과로 덮지 않음 |
| mergedPassed | 위 종료 조건 + 실제 actionRow.passed + 실제 GPU/metadata + isolation 복구를 모두 요구. 부모 gpuEvidence.passed에만 최종 결합값을 반영하며 원 statePassed와 gpuVerified는 보존 |
| triad.lifecycleActionGate / lifecycleGpuGate / lifecycleMergedGate | 두 흐름 각각의 실제 결과를 따로 집계. synthetic metadata로 action PASS를 만들지 않음 |

예외 시에도 inner/finally와 outer/finally가 action row를 병합·보존한다. MoveNext/iterator Dispose 예외는 기록하고 다시 던져 triad error/exit2로 남긴다. try/catch로 cleanup 성공을 가장하지 않는다. 정상 false assert가 있어도 그 실제 row 결과는 그대로 저장한다. orb guard가 ring 마지막 Destroy→2frame→Dispose를 통과시키는지도 이 원흐름에서 검증한다. 기존 full100/61 원결과를 소급 변경하지 않는다.

원 source 상태 복구를 명확히 하려고 lobby media 파괴2frame 후, fixture 교체 전의 실제 scene Renderer 참조/원 enabled·forceRenderingOff·sharedMaterials·activeSelf와 원 r3Roots/a2Root 활성값을 읽어 저장한다. 마지막 원 Simulation/view 바인딩 복구 후 살아 있는 **같은 참조**에 원값을 복구하고, 복구 전 mismatch와 최종값 일치를 별도 기록한다. 사라진 원 참조를 새 객체로 합성하지 않으며 누락이면 originalSourceStatesRestored=false다. 원 NativeRemodel3D.Active도 같아야 한다. 이 복구가 actionRow의 실패/예외를 PASS로 덮지 않는다. original-source-restoration.json에 남기며 Core hash/ref 조건도 유지한다.

lifecycle 두 parent의 전층1x/direct3840도 원 FullCapture 동작대로 저장한다. PNG 예상상한은 triad2+lifecycle2=4 parent 기준으로 늘렸고, 추가 float는 기존 full의 bounded 대표/FAIL 보존 정책을 재사용하여 triad와 합산 max3GiB/free3GiB를 유지한다. layer 하위 결과는 기존161 또는 삼자 expectedFixtures=2에 섞어 세지 않는다. 현재 세 C#·shader는 아직 실행 전이다.

Pool 등 남은 기존 assert는 그대로다. ring은 아래 최신 승인으로 고립 test view의 time 인수만 동일화했다. 정상 종료했더라도 실제 actionRow=false가 나올 수 있으며 그 원인은 별도 판정한다. guard 예외 소멸만으로 행동 전체 PASS나 제품 오류 여부를 자동 결정하지 않는다.


### Ring time 입력 교정 — 최신 PC 승인

제품 ring 반경은 `sin(time*(2.1+ri*.35)+ri*2.4)` pulse를 따른다. 초기에 저장한72점을 많은 GPU frame 뒤 다른 Time.time 입력의72점과 완전 일치시키면 정상 pulse만으로도 실패할 수 있다. 이를 제품 버그로 판정하지 않는다.

독립 FullCapture copy의 signature만 `FullRingLifecycle(float? ringReferenceTime=null)`로 바꾸고, 이 method 내부 **고립된 view.Update(sample, ...)** 호출의 time 인수만 `ringReferenceTime??Time.time`으로 치환했다. narrow wrapper는 시작 시 Time.time 한 값을 저장해 모든2D/3D/복원/재생성 Update에 전달하며 flow receipt의 ringReferenceTime/ringTimeInputCorrected/inputCorrection에 기록한다. 원 full 호출은 무인수이므로 null→기존 Time.time을 계속 사용한다. FullPoolLifecycle, NativeGame.UpdateViews가 구동하는 실제 main view, 제품 pulse 수식·주기·전역 시간/설정·GPU 렌더·disable/GO/remove/Destroy/Dispose 단계·원 raw FAIL은 바꾸지 않았다. assert 기준 완화가 아니라 동일 input 비교 교정이다. preservation-inventory는 이 작은 치환을 역변환했을 때 원 FullCapture와 바이트 동일한지 구분해 기록한다.


ROOT 인수: C# partial3개 정적 오류0(기존/비권장API 경고8), canonical guard 소스316 및 문서e33 인수. 새shader meta 빈 필드 뒤 공백만 정리. 실제 triad/좁은수명/원 예외 회귀는 아직 미실행. 기존 full161의100/61과 원 예외/미merge를 그대로 보존한다.


ROOT source checkpoint: partial3 static errors0, warnings8. Exact PC guard316 plus corrected docs e33 integrated; all other product Unity files equal8f. Metadata GUID1818 valid/no duplicates. Guard still protects26raw/27cache with unchanged algorithm; paths/triad parser/product-tip argument only adapted. Full161 original100/61 stays unchanged. New triad+orb+two narrow lifecycle actual execution pending, M1/naturalplay/integration/install/Win64 pending.
