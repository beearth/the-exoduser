# 11-03 장판 공중 부유 P0 — Mac 실게임 판정 대기

## 20:20 Mac FAIL 1건 — 경사 접합부 재작업(최신)

Mac `qa/mac-captures-20261103@39c3ae380`, `qa/unity-ground-aoe/ec043b2/02-slope-skills-x3.png`를 직접 열어 T15 흙 경사·뿌리 접합부의 검은 톱니/띠 누락을 확인했다. 이 후보는 **AOE-GATE FAIL**이다. Mac의 네 지형 실제3스킬·목교 T0~45 직선 경계0·중앙 섬광·GPU 오류0 PASS는 해당 ec043b26d 범위로 유지한다. 새 후보의 화면 해결은 미검증이다.

착수 전 통합 `CLAUDE.md`를 원격에서 다시 읽고 docs 정본 `unity/main`의 v4.1/운영 규칙을 적용했다. `origin/unity/main 9446618af9cc3444dce3883aadaa122317a33557`을 정상 병합했다. 아래 G0의 노레위 접점/Diablo IV 명암·위험 읽힘 관례와 같은 기준으로, 지면 접점의 연속성을 회복하고 비수신 소품의 차폐를 유지한다. 새 이미지·맵·카메라는 만들지 않는다.

| 조사/수정 항목 | 계약·근거·한계 |
|---|---|
| 원본/수신 깊이 불일치 | `A2RootSurface`의 Forward pass에는 `Offset -1,-1`, 수신 깊이 pass에는 Offset이 없었다. 경사에 따라 깊이 차가 커지면 같은 표면이 기존2cm 차폐 조건에 걸릴 수 있다. 원본의 DepthOnly UsePass는 별도이며, 모든 원본 깊이 pass가 bias를 쓴다고 주장하지 않는다 |
| 수신 재질 | `_ReceiverDepthBias` 기본0. 원본 shader 이름이 `EXODUSER/A2RootSurface`인 receiver에만 캐시된 재질의 값-1을 사용해 `Offset [-1],[-1]`로 맞춘다. 등록과 매 프레임 재질 교체 추적에 모두 적용. 다른 지면·수면은0. 원본 재질/mesh 변경0, receiver 재질은 최대2개 재사용 |
| 보존하는 배제 | sceneEye+.02-receiverEye clip, 위쪽 법선 성분.2, terrain..terrain+.9m 범위, 목교 상판 범위, bit30/31 모두 그대로. 허용치를 넓히거나 배우·높은 소품에 효과를 덮지 않는다. Core·45틱·셀·alpha·투영 크기·카메라 변경0 |
| 원인 검증 범위 | 경사 깊이 차의 수치 회귀 및 소스/렌더상태 계약4건을 추가해 수정 전 실패를 확인하고 수정 후 검사한다. 이는 Metal 픽셀 판정이 아니다. Mac에서 같은 slope(35,-71), T15/3배 크롭의 누락과 소품 차폐를 다시 확인해야 한다 |
| 무창 Mac 촬영 | 최신 통합 규칙에 맞춰 실제 스킬 fixture에 GPU `-batchmode` 경로를 추가. Null GPU 거부, batch에서는 배우/UI 숨김 필수. 창 해상도 변경과 WaitForEndOfFrame/ScreenCapture 대신 기존 GroundMapRender로 정확한 폭×1080 RenderTexture를 출력한다. 같은 UpdateViews/Remodel3DLate를 거친 실제 DispatchSlot/투영 경로이며 IMGUI/자연 플레이 검수가 아니다. receipt에 batchMode/captureMode 및 biasMatchedReceivers 기록 |

ShaderLab Offset은 factor가 깊이 기울기에, units가 장치 깊이 해상도에 비례하며 음수는 카메라 쪽으로 보정한다([Unity 6000.6 공식 문서](https://docs.unity.com/en-us/engine/6000.6/manual/materials-and-shaders/shaders/reference/sl-reference/sl-commands/sl-offset)). 이 수정은 설치된 원본 셰이더와 수신 패스의 차이에 근거한 제한적 수정이며, GPU 결과를 선판정하지 않는다.

### 최신 Mac 실행 인자 — 무창 GPU, 공용 실행 경로만

Mac 공용 실행기에서 새 정식 ARM64 패키지의 Player에 아래 인자를 전달한다. `-nographics`, `-popupwindow`, 일반 창 자동 실행은 사용하지 않는다. 절대 sandbox/output은 Mac 담당의 고정 경로로 치환하고, 실행마다 captures-current를 비워 최신1세트만 남긴다.

```text
-batchmode --remodel3d --unity-ground-map-capture --unity-ground-skills
--unity-ground-hide-actors --unity-mute -nosound
-ground-width 1920 -ground-sites slope -ground-skill giantSlam -ground-sequence-site none
--unity-qa-sandbox <Mac 절대경로>/sandbox-current
-output <Mac 절대경로>/captures-current
```

먼저 경사 T15 1컷과3배 크롭을 기존 ec043b26d FAIL과 같은 크기로 비교한다. `graphicsApi=Metal`, batchMode=true, captureMode=GPU camera RenderTexture(no GUI), biasMatchedReceivers>0, 실제 runtimeAge15/셀/좌표, shader/RenderGraph/Exception0을 확인한다. 누락이 남거나 높은 소품 위에 새 투영이 생기면 FAIL이다. 통과 후 `-ground-sites all -ground-skill all -ground-sequence-site none`으로 네 지형×3스킬12컷을1920/3840에서 검수하며, 필요 시 sequence-site bridge로 기존45틱 종료를 확인한다. 자동 receipt.passed는 촬영완료이며 visualVerified=false다. 새 batch GPU 경로도 PC에서는 실행하지 않았으므로 Mac에서 검증해야 한다.

PC는 자기 worktree 직접 수정·컴파일1회·정상 commit/push까지. Mac PASS 전 공통 unity/main 반영/배포0. 과거 아래 창 촬영 절차는 최신 무창 지시로 대체한다.

### 20:20 재작업 PC 결과

소스 checkpoint `82110bab432ae08a5f273ac410250be918009346`에서 공용 bin Editor 배치1회 `a5b30250`: exit0/C#오류0/대상shaderImports3/USER_SAVE변경0. `compile.json` passed/compileOnly=true, playerRun/visualVerified=false. 실행279953ms, 대기 포함wall373445ms, refresh254901ms/compile72797ms. errorLogs=1: 라이선스 토큰 갱신 메시지 뒤 entitlement 정상 확인, 종료 시 `Curl error42: Callback aborted`. 동일 컴파일 재실행0. 정적 회귀4/4. Unity 종료·예약 해제 확인 후 임포트 파생meta850/material29만 자기 checkpoint로 복원, 기존 외부guard WORK/미추적63항목 보존. PC 정식빌드/Player/M1/영상0. 최종 인계 커밋은 이 소스와 Unity 파일 차이0이며, Mac 시각 재검수 대기다.

## 19:00 Mac FAIL 3건 재작업 — G0 / 설계

Mac 원본 `qa/mac-captures-20261103@642a2affe`, `qa/unity-ground-aoe/e96b137/06-slam-cells-x3.png`와1920 T15 컷을 직접 열었다. 이전 e96b137은 지면/목교 투영·45틱 종료·Shader/RenderGraph0은 통과했지만 직선 경계와 네 지형별 실제 스킬·중앙 섬광 증거 부족으로 **AOE-GATE FAIL**이다. 이 판정이 아래 과거 PC 기록보다 최신이다. 착수 전 최신 `origin/unity/main cbdcbc2822` 정상 병합.

G0 레퍼런스: 직접 본 노레위 `G:/exoduser/tmp/design-review/20261028_aaa_reference/스크린샷 2026-10-30 091256.png`의 목교 접점·제한된 밝기, [Diablo IV VFX 개발자 설명](https://news.blizzard.com/en-gb/article/23746639/diablo-iv-quarterly-updatedecember-2021)의 전장/조명별 식별성과 주요·보조 읽힘을 대조했다. 텍스트 설명을 다른 게임의 내부 투영 구현 증거로 취급하지 않는다. 기존 웹 플립북+지면투영 제작법을 유지하고 새 아트는 만들지 않는다.

| 두 레퍼런스에서 확인한 공통 관례 / 이번 체크 | 상태 |
|---|---|
| 지형과 공격 접점이 같은 장소에서 읽힘, 배경과 효과의 명암이 분리됨 | 있음: 실제 수신면·원래 Core 중심. 네 지형의 실제 스킬 촬영을 이번에 넣음 |
| 접점이 강하게 읽히고 잔여가 사라지는 리듬 | 있음: 기존45틱·4셀·원래감쇠 유지. 사각 원화 경계만 이번에 완화 |
| 주효과가 전장과 위험의 읽힘을 압도하지 않음 | 있음: 제품 배우/숫자 유지. 정상 배우+탄막 컷과 촬영 전용 무배우 컷을 별도로 요청 |
| 카메라 가림을 처리하며 캐릭터/효과를 판독할 수 있음 | 맵 레인의 가림 투명화는 뺌(별도 소유). 이번에는 검수 인자에서만 배우/숫자를 숨김 |

첫 실물 판정은 Mac의 같은 목교 T0~45 및 평지/경사/목교/늪 가장자리의 실제3스킬이다. 직선 경계가 남거나 네 지형 분류·실제 runtimeAge를 얻지 못하면 FAIL이며 CPU/컴파일로 통과시키지 않는다.

| FAIL | 원인·수정·한계 |
|---|---|
| 1 셀 직선 잘림 | 원 PNG 셀2 오른쪽512픽셀 중128개의alpha>8·최대252, 셀3 왼쪽113개·최대252. 원화가 셀 끝에서 불투명하게 끊긴다. 중심 정사각 UV 영역은 투영상자 XZ보다 작다(반폭D/2, 상자반폭D/√2); 16m 깊이는 그대로다. 원화 UV 외곽4%(20.48텍셀)에서 smoothstep으로만premultiplied RGBA/weight를0으로 감쇠. 내부92%·Core반경/프레임/위치는 불변. Mac에 baseline(감쇠0)과수정(.04) 같은좌표 재촬영을 요청해 남은 수신면/차폐 경계도 분리한다 |
| 2 촬영 부족 | 기존시험 사각형 경로는 유지. `--unity-ground-map-capture --unity-ground-skills`가 실제 DispatchSlot→NativeSkillView로 가시덫/성역/대지치기를 평지·경사·목교·늪 가장자리에서 시전. 실제 지형과Map.CanMove로 고르고, 경사>.06·지형과GroundY차≤.08m, 수면 인접1m 여부를 분류. 지형/판정/물 높이는 바꾸지 않음 |
| 3 섬광 가림 | `--unity-ground-hide-actors`는 이 sandbox 촬영 경로에서만 배우·접촉그림자와 OnGUI를 숨김. 원래forceRenderingOff를finally로 복구. 일반 실행은 바꾸지 않음. 중앙소품은 실제차폐 검수에 남김 |

### Mac 실행 인자 — 새 정식 패키지, 고정 출력 폴더

이 절은 19:00 재작업 당시 촬영 이력이다. 최신 실행은 위20:20 무창 GPU 인자를 따른다.

```text
--remodel3d --unity-ground-map-capture --unity-ground-skills --unity-mute -nosound
-ground-width 1920 -ground-sites all -ground-skill all -ground-sequence-site bridge
--unity-qa-sandbox <Mac 절대경로>/sandbox-current
-output <Mac 절대경로>/captures-current
```

| 검수 실행 | 공통 인자에 추가/교체 |
|---|---|
| 네 지형 실제3스킬·목교 슬램46연속 컷, 중앙 섬광 | `--unity-ground-hide-actors` |
| 같은 목교 경계 A/B(원래 셀 알파, 딱1회) | 위 숨김 + `--unity-ground-edge-baseline -ground-sites bridge -ground-skill giantSlam` |
| 제품 구도·적탄3종 겹침(숫자·배우 유지) | 당시 요청 이력. 새 batch 경로는 GUI를 검증하지 않으며 자동 창 실행을 허용하지 않음 |
| 32:9 | 최신 무창 경로는 `-ground-width 3840`, 높이1080 유지 |

매 실행 전 captures-current를 비우고 필요한 최종 비교컷/영수증만 선별한다. baseline/수정 두 조건의 필요 컷만 비교용으로 유지하며 빌드는 build-current에 덮어쓴 뒤 검수 종료 시 삭제한다. `-ground-sites flat,slope,bridge,swamp` 또는단일id, `-ground-skill spikeTrap/holyDome/giantSlam/all`, 폭1920/2560/3840 지원. all 기본: 4곳×3스킬 age15의12컷 + 목교슬램 T0~45 중T15 중복제외45컷=57컷/해상도. 45틱에는슬램없음. `ground-skills-receipt.json`에 실제wave.T/zone.T·셀·alpha·flashEnabled·수신면높이·경사·투영상자/여유·숨김수·sandboxRoot 기록, `GROUND_SKILLS_SANDBOX_BOUND` 로그 출력. 자동passed는 촬영완료일뿐 visualVerified=false.

PC에서 새 Player 촬영은 하지 않는다. 수정 전 정적5건중2건 FAIL(경계처리/실제스킬 촬영경로 부재) → 구현 후5/5. 실제 화면은 Mac 재검수 대기.

### 19:00 재작업 PC 결과

수정 후 최신 공통 `9dc27dea561269bfc6639a6419de0bc0224479d3`을 다시 정상 병합한 `a2a606b11f064e3e711249dc8daabfd247988a70`에서 공용bin 배치1회 `b043d6f3` 실행: exit0/C#오류0/shaderImports3/USER_SAVE변경0, 실제 실행94742ms(예약 대기 포함wall516428ms). `compile.json` passed/compileOnly=true, playerRun/visualVerified=false. errorLogs=1이며 라이선스 갱신 메시지 뒤 entitlement 확인 및 종료 `Curl error42: Callback aborted`를 기록했다. 같은 컴파일 재실행0. 예약 해제·Unity 종료 확인. 자동으로 덧쓴meta824/material29개만 자기 checkpoint에서 복원하고 외부guard WORK는 보존했다.

MAP PRODUCTION REPORT(범위: 기존 A2 효과 촬영 경로)
- STAGE: CH1-1 A2. MASTER(silhouette/regions/main route/side spaces) 변경0.
- OUTER MASS(LEFT/RIGHT/TOP/SOUTH/holes), LARGE(assets/composites/overlap/repetition), MEDIUM(connections/holes), LANDMARK(primary/secondary/tertiary): 변경0, 이번 품질 판정 범위 밖.
- GROUND: 원화 셀 경계 감쇠만 수정. 지형/오염/그림자/물 높이 변경0. PLAYABLE(arenas/travel/breathing/threat/route/collision) 변경0.
- CAMERA QA: 평지·경사·목교·늪 가장자리의 실제3스킬57컷/해상도 경로 구현. START/EARLY/ARENA/SIDE L/R/LANDMARK/LATE/EXIT의 전체맵 검수로 확대하지 않음.
- TECH QA: 정적5/5, 위 PC 컴파일. pageerror/404/게임성능/새 GPU seam 판정은 미실행.
- FILES: NativeSkillView/GroundSkillProjection/NativeGame.GroundReceiverCapture·GroundSkillCapture/정적테스트/관련SSOT·CHANGELOG·자기작업판행. 외부guard 보존. GIT: 자기브랜치 정상커밋/push, 공통·Desktop 배포0.
- VISUAL VERDICT: 이전 e96b137 FAIL 유지 / 새 후보 미검증. NEXT PASS: 아래 인자로 Mac 실제 A/B·4지형·섬광·정상탄막·M1 재검수.

사용자 최신 impact-brief 13:40 절·AGENT_OPERATIONS_MANUAL §2 적용. 자기 `G:/exoduser-wt/codex-impact`를 직접 수정한다. 기준 `origin/unity/main 5062b5701`. PC는 배치 컴파일1회만 하며 정식 빌드/Player/M1/시각 판정은 Mac으로 넘긴다. 사용자 실행본 미반영이며 시각 PASS를 선언하지 않는다.

## G0/G1: 원인과 제작법

사용자의 P0 지적을 결함 기준으로 삼는다. 현상 비교용 참조는 `I:/EXODUSER-Storage/demo-art/impact/ground-aoe-current/reference-floating-aoe.png`(기존894481 패키지의 실제 다리 위 가시덫)다. 최신 P0 브랜치의 재현·개선 판정은 Mac에서 한다. 최신 소스의 receiver-depth 투영에서 아래 우회/누락을 확인했으며, 고정높이 평면을 추가하지 않고 기존 GPU 지면 투영을 보완한다.

| 원인 | 수정 계약 |
|---|---|
| 투영 장애 시 원래 직립 스프라이트 복원 | 3D에서는 등록된 원본 sprite/ring을 숨긴 상태로 유지하고 투영 실패를 기록. 2D 전환/풀 재사용에서는 이전 forceRenderingOff를 정확히 복원. 누락/오류는 Mac gate FAIL이며 무시하고 반영하지 않음 |
| scene/receiver 깊이의 절대차2cm 및 scene깊이로 좌표 복원 | 수신면 깊이로 실제 XYZ 복원. opaque 물체가 수신면보다2cm 초과 앞이면 차폐. 수신면 앞에 opaque가 없는 투명 수면은 허용. 카메라의 reversed-Z/정사영 계산 유지 |
| 늪 수면 미등록 및 장판 뒤에 수면이 덮이는 순서 | 실제 A2 수면 MeshFilter를 등록. opaque 깊이 이후 수면→장판→transparent 배우/탄 순서. 수면 shader는 전용 LightMode로 이 패스에서1회만 그림. 기존 깊이 기반 거품·반사·색 수식 유지; 물 높이/지형/보행 변경0 |
| 캐릭터·소품 수신 구분 | proxy/volume 렌더링 bit30만 전용패스가 소비. 수면 color bit31은 기존 bit를 보존해 추가. 원본 배우·소품은 변경하지 않음. 수신면 법선의 위쪽 성분0.2 이상만 허용해 난간 측면/기둥 면 제외 |
| 원형·부채·선형의 vertex-colour 예고 | 기존 NativeDruidTelegraphView under 삼각형을 수직16m 볼륨으로만 압출. 원삼각형 XZ 내부와 실제수신면 깊이에서 색을 출력. 양면 원본의 중복삼각형을 제거. 공중 over 섬광/눈빛은 기존 경로. 2D에서는 원메시·재질·마스크 복원 |

투영 깊이는 기존 sprite/ring의16m를 유지한다. vertex 예고는 실제 경고중심의 지면 높이를 한 번 읽고 ±8m만 투영한다. 정점별 지형 보간/레이캐스트/적응면은 만들지 않는다. Core 판정 위치·반경·각도·시간·색/alpha의 원식·피해·RNG·세이브 변경0.

Unity 기본 decal은 투명 수신면을 지원하지 않으므로 기존의 전용 수신깊이 방식으로 늪까지 처리한다. 근거: [Unity decal 제한](https://docs.unity.com/en-us/engine/6000.0/manual/visual-effects/decals/renderer-feature-decal/decal), [렌더링 레이어 필터](https://docs.unity3d.com/ja/current/ScriptReference/Rendering.FilteringSettings-renderingLayerMask.html). 깊이/수면 순서의 수정 판단은 설치된 소스 조사에 근거한 것이며 Mac GPU 결과는 아직 없다.

## 실제 연결 범위·소유 파일

| 표시 | 경로 |
|---|---|
| 가시덫·성역 원화와 원형 링 | 기존 NativeSkillView의 Mark/SetRing → NativeGroundSkillSurface → 수신깊이 투영 |
| 대지치기 본체4프레임·중앙 섬광 | NativeSkillView SlamWaves의 wave/flash 생성 시 모두 Mark → 같은 수신깊이 투영. 지면 중심의 직립 billboard를 통과하지 않음 |
| 독/용암 장판·필드 상태영역·지뢰·균열 선·조수 원형/예고 원 | 기존 NativeBossView ground=true 경로 → 같은 투영. 날아가는 독/물리/어둠 탄은 ground로 재분류하지 않음 |
| 리모델 드루이드 원형·부채·선형·안전영역 제외 메시 | NativeDruidTelegraphView under → NativeGroundWarningProjection. 기존 native XY 아레나는2D 복원 경로 유지. 진짜3D 지형 아레나 완성으로 보고하지 않음 |
| 접점 그을림 | 기존 ImpactGroundPatch는3D에서 URP DecalProjector를 사용하며 공중 FloorQuad는2D 전용. 이번 P0에서 Core/접점 크기 변경0 |

소유: NativeGroundSkillProjection/Surface, NativeGroundWarningProjection(+meta), NativeDruidTelegraphView, NativeSkillView의 SlamWaves 표시, NativeGame.A2Field의 수면 등록1곳, GroundSkillProjection/ReceiverDepth/A2ToxicRiver shader, Editor/GroundAoeCompileCheck(+meta), tools/tests/unitySlamGroundProjection.test.cjs, 이 문서·관련SSOT/CHANGELOG_SYNC/작업판 자기 행. 외부 tools/guard.baseline.json WORK는 스테이징하지 않는다.

## 14:20 추가 — 대지치기 반쪽 잘림

15:39 비정상 종료 후 재개해 이전 장판 소스4423a3dbde를 보존하고 최신 origin/unity/main 044c82d760을 정상 병합했다. 대지치기 본체와 중앙 섬광은 Mark 누락으로 일반 billboard 경로에 남아 있었다. centered 예외로 발끝 lift=0인 카드가 지면 중앙을 가로지르고 기본 LEqual 깊이 검사로 아래쪽이 가려진다. 두 레이어를 기존 수신면 투영에 연결한다. 깊이 검사를 Always로 바꾸거나 카드 높이를 올려 소품 위에 덮지 않는다.

| 항목 | 확인·수정 계약 |
|---|---|
| 프레임·원화 | 최신 origin/main game.html의 `_infernoSlamVfx`, 원본1024²·2×2·512px·4셀 FullRect. 시트 교체/프레임 추가/이미지 편집0 |
| 순서·수명 | `min(3,floor(pow(t/45,.6)*4))`, t=0~44의 셀별5/10/13/17틱, 총45틱=60Hz에서0.75초. 기존 Core 제거시점 유지 |
| 크기·감쇠 | 기존 `MaxR×.9×(.72+.28×min(1,p×3.5))`; p<.62는alpha1, 이후max(0,(1-p)/.38). 기존 중앙 섬광 계산도 유지 |
| 잘림 수정 | wave/flash 모두 NativeGroundSkillSurface.Mark. 프레임 교체마다 원셀 UV·현재크기를 수신면에 투영. 기존16m 깊이·실제 상판/수면/경사 수신 적용 |
| PC 정적 회귀 | `node --test tools/tests/unitySlamGroundProjection.test.cjs`: 수정 전 투영 누락 검출, 수정 후3/3 PASS. 실제 GPU 또는 이미지 비교 결과가 아님 |

이 작업본의 과거 game.html은 프레임식이 선형이므로 정본으로 삼지 않았다. fetch한 origin/main은이미 pow(p,.6)이며 현재 Unity와 같아 타이밍은 바꾸지 않는다. 피해·범위·자원·Q/E·히트스톱·RNG·세이브 수정0.

## G2~G5: Mac 검수 요청

PC compile-only 결과는 REPORT_1103.md와 고정 `ground-aoe-current/compile.json`에 기록한다. 커밋·push 후 REPORT 맨 위의 최종 SHA를 Mac이 받는다. 빌드·캡처는 `build-current`/`captures-current`에 덮어쓰고 다음 시도 전에 이전 것을 삭제한다. 검수된 빌드는 보관하지 않고 SHA와 최종 스크린샷·핵심 로그만 남긴다.

| Mac 실제 Player 장면 | 판정 |
|---|---|
| 평지·경사·다리 위·늪 가장자리 각각1920×1080 | 가시덫/성역·독 장판/원형·부채·선형·예고가 수신면에 붙음. 경사/상판/수면의 연결 틈·공중 카드0. 각 장면3배 크롭 |
| 다리의 적탄+장판 중첩, 2560×1080 및3840×1080 | 같은 Core 위치/반경, 배우·소품에 투영0, 적탄/캐릭터 가림0, UI 안전영역 유지. 화면 패딩/늘이기/블러 추가0 |
| 지면효과0 상태와2D 복귀 | 수면 정상 표시·중복수면0·거품/반사 회귀없음. 원화/예고 복원과풀재사용/종료 오류0 |
| 같은 패키지 M1·10초 무음 비교 | 정식 빌드·Shader/RenderGraph 오류0, 실제 GPU/1x 판정 후에만 공통 병합·사용자 실행본 갱신 |
| 대지치기1920 연속 처음~끝 + 웹 동장면 비교 | 각 셀과중앙섬광 모두 반쪽 가림0. 0/5/15/28/44틱과종료45틱을 확인. 다리·늪·경사와3840도확인. 직립폭발로되돌아가거나수명이조기종료되면FAIL |

현재 G2/G4/G5는 Mac 검수 대기. `VISUAL VERDICT: 미검증`. 이전 탄막/드루이드 작업은 개인 원격 d58f7663a7에 보존하고 이 P0 뒤로 둔다.

## 재개 결과 — PC 컴파일까지만 완료

소스 checkpoint `e13b6b58c0`에서 공용slots3 `exo-unity.ps1 run`의 `Exoduser.UnityPort.Editor.GroundAoeCompileCheck.Run`을 배치1회 실행했다. 작업 `a1bc6e3c`: exit0, C# compileErrors0,105557ms, refresh86518ms/compile17430ms, shaderImports3, USER_SAVE 변경0. `ground-aoe-current/compile.json`의 passed/compileOnly=true, visualVerified/playerRun=false다. Editor 예약 해제·해당Unity 종료를 확인했다. PC 정식빌드·Player·M1·비교영상 실행0.

runner의 errorLogs=1을 숨기지 않는다. 로그에는 라이선스 Access token 갱신 메시지 뒤 entitlement 정상 확인과, batch 종료 시 `Curl error23: Failure writing output to destination`이 있다. C# 및 대상셰이더 오류는0이며 이 네트워크/종료 메시지를 이유로 같은 컴파일을 반복하지 않았다. Mac의 Player/RenderGraph 검수는 별도다. 핵심 로그: `I:/EXODUSER-Storage/unity-jobs/codex-impact/logs/a1bc6e3c.log`.

임포트가 자동으로 덧쓴 `.meta`824개·`.mat`29개는 사전 WORK 목록과 대조해 자기 작업본의 checkpoint에서 정확한 경로만 복원했다. 컴파일 전부터 있던 외부 `tools/guard.baseline.json`은 변경·스테이징하지 않는다. 신규 빌드/프로젝트 복사본 없음. 완료 산출물 정리 총량은 REPORT의 최신 영수증을 따른다. 정적3/3·컴파일통과는 시각PASS가 아니며 위 Mac 행을 모두 확인한 뒤에만 통합 판단한다.
