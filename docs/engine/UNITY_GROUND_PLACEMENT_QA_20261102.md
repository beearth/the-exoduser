# Unity 설치형 지면 배치 — Mac 실제 QA 계약과 기록

상태: 기준1403의 실제 ARM64 RED 확보. 후보95d4의 정상 제품 ARM64/Win64·시각·배송 검증은 진행 전이다. 제품 배치 코드는 PC 소유, 이 문서와 Tools/GroundPlacementCapture.cs/meta는 Mac QA 소유다. 기존 무데칼 동등성 FAIL 개인 코드를 합치지 않는다.

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

## 현재 전체 표본 —49 consumer×3site +1 lifecycle =148행

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
| same-pool lifecycle |iceZone→일반 magic comet→iceZone |동일 normal-pool entity/mesh hide·re-show, source.enabled/GO inactive/Destroy, sample arena 전환의 2D 복원 |

위3site는 world X/Z=(40.2,-77),(36.2916,-73.17135),(43.2,-71.8)이며 Core=(100X,-100Z). 각각 기존 흙·뿌리 경사·실제 목교 표본이다. Player는 target에서 Core(-180,+80) offset으로 표본 가림을 피한다. 각 phase는 sample.TickCount를256씩 진행해 이전 once clip을 만료하며 실제 Simulation.Tick/자연 AI·타격 검수로 주장하지 않는다. 같은 객체가 필요한 Chase/Fissure는 spawn→capture 동안 유지한다. 종류/phase ID와 serial은 고유하다.

## 실행 전 고정한 assertion

| 항목 | 기준 |
|---|---|
| 실제 표시 |enabled/activeInHierarchy이며 forceRenderingOff가 아닌 sprite/mesh/line. 같은 GO/자식의 활성 mesh를 수집하고 원 hidden sprite를 실표시로 중복 검사하지 않음 |
| 지면 접촉 |source pivot 목표GroundY+0; 실제 surface 정점GroundY+.025m, ground ring점GroundY+.03m. raw ground 차이와 bias 제외 잔차를 모두 기록, 잔차/pivot 허용.02m |
| 방향 |샘플 ground span<=.001m인 평면은 normalUp>=.99. 굽은/경사는 각 정점 접촉이 hard gate이고 첫 triangle normal은 진단으로만 기록 |
| atlas/flip |child mesh UV min/max 및 첫/마지막 corner flip 방향이 source.sprite.uv에1e-5 이내. 잘린2×1 ward 및 애니메이션 atlas 포함 |
| 원 표시 속성 |shared material·_MainTex·sorting layer/order 동일; 모든 mesh color 및 _Opacity 차이<=1e-6. 값 기록만으로 PASS하지 않음 |
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
GROUND:1403 실제 RED112/136. 후보95의 지면 접촉·속성·큰 반경 interior 검수 대기.
PLAYABLE: 실제 자연 AI/피해/완주·성능 미검수. Core tree는 후보와1403 동일.
CAMERA QA: START 흙/EARLY 경사/목교1920 원본과3840 direct RT. ARENA/SIDE/LANDMARK/LATE/EXIT 전체 맵 camera board 미재검수.
TECH QA: baseline 오류/누락0·복원·같은 앱 Metal M1 23/23; 후보 실제 실행·배송 대기. route/collision/pageerror/404/seam/loading/performance 미재검수.
FILES: QA helper/meta/docs만 Mac 소유. 제품8경로는 PC 후보95 소유. 타인 WIP 무수정.
GIT: baseline QA private a5d 원격 확인, common1403 보존. 후보+정확QA 후속 commit/build는 검수 전.
VISUAL VERDICT: FAIL — baseline 설치형 접촉. 전체 A2 기존 RETOUCH·ImpactR4 FAIL을 승격하지 않음.
NEXT PASS: 후보95 actual ARM64 정상제품/동일앱 M1/148행·큰 반경 visual→통과 시 common·설치·Win64배송/PC실행 회수.
