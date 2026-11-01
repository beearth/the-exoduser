# Mac 지면 데칼 receiver 후보 — 2026-11-01 KST

상태: **후보 브랜치 전용, 평면 fixture 및 실제 A2 세 지점 GPU 수신 PASS; QA projector 제한은 부분 개선, 실제 맵 VISUAL VERDICT RETOUCH**. 공통 `unity/main` 채택이나 맵 전체 완료를 뜻하지 않는다. 맵 제작 가이드 v0.9 전체와 `_MAP_SSOT_INDEX.md`를 선행 확인했다. 지면 수신은 구조물과 흙의 접지 기술 의존성일 뿐, geometry·collision·배치·카메라 설계·R8 아트 수정은 이번 범위가 아니다.

|항목|정확 계약|
|---|---|
|기준|공통 `f60d89b5cea8d35599c91c85c20bcdd6d2e593aa`, 후보 브랜치 `codex/mac-ground-decal-receiver-20261101`|
|출처|PC 순수 수신 커밋 `a034b3e2b7d0572e8b7b36f66e35fc81f7a265e8`의 두 shader 파일만 byte 단위 인수. R8 부모·다른 3파일은 인수하지 않음|
|HellGroundPBR.shader|원본 SHA-256 `10f50557798ed942557c64896b70eb20317c257278e98e58d98955781f78f459` → 후보 `93896381f9dc33efaa0bf1a02c7942f170402192e272a977c4e82c02f077a218`|
|A2RootSurface.shader|원본 SHA-256 `b2f9bb59dc9300235de5e337d991978306f4a45e97b820149dd743c68c9e8cf9` → 후보 `e49e7350cd96de8385feb53e6aa5aaac0d43f17c99aebecbd1104c85fca9c6ec`|
|두 파일의 전부|각 6줄 추가·삭제0. Opaque UniversalForward에 DBuffer MRT1/2/3 fragment 변종·URP DBuffer.hlsl include·`_DBUFFER` guard 안 `ApplyDecalToSurfaceData(i.positionCS,surface,input)` 및 `SampleSH(input.normalWS)` 갱신|
|보존|기존 Shadow/Depth/DepthNormals, shader 속성·GUID·재질, Core·지형·맵 배치·Impact·UI·세이브 변경0. Renderer feature 제품 설정 변경0|

## 검수 게이트

승인 Renderer의 실제 실행 technique/DBuffer keyword/MRT4·DepthNormals를 원문으로 기록한다. 동일 카메라·광원·projector·재질의 off/on에서 HellGround 흙, A2Root 뿌리, 표준 Lit 목교 양성대조의 native 픽셀 ROI 내부 변화와 투영 외 영향, 접지·경계를 분리 확인한다. 1920×1080 실화면과 3840×1080 직접 RenderTexture는 출처를 구분하고 1x로 판정한다. 기존 `VfxRm1DecalCapture.Run`의 표준 Lit 단독 결과를 두 custom receiver 증거로 사용하지 않는다. 새 ARM64 build → 같은 앱 M1 → receiver GPU 순서이며, 자동 수치 PASS가 전체 맵 VISUAL PASS는 아니다.

최종 실측은 아래에 기록한다. 맵 제작 범위와 visual 판정은 마지막 `MAP PRODUCTION REPORT`에 구분했다.

## 14:44 KST 중간 복구점 — 빈 fixture 보존

`NativeGame.GroundReceiverCapture.cs`와 `NativeGame.cs`의 단일 명시 인자 hook은 격리된 Player GPU fixture이다. `Resources/QA/GroundDecal.mat`은 이미 프로젝트에 있는 `SG_GroundDecal.shadergraph`를 사용한다. ShaderGraph 재질의 Unity shader fileID는 프로젝트 내 Warrior 재질과 같은 `-6465566751694194690`이다. 처음 일반 shader ID `4800000`과 URP 패키지 기본 그래프를 참조한 두 시도는 Player에서 `Hidden/InternalErrorShader`였고, 해당 영수증은 실패 자료로 남겼다. 제품 Renderer asset·공통 소스는 변경하지 않았다.

| 확인 항목 | 실제 결과 | 판정 |
|---|---|---|
| 공식 빌드 | Unity 6000.6.7f1, StandaloneOSX ARM64, Settings QA 식별자, `-remodel-scenes 1`, 오류0 | 빌드 PASS |
| 같은 Player M1 | 23단계 전부 `ok`, 종료코드0 | M1 PASS |
| 개인 저장 영역 | 매 빌드/Player 전후 11개 항목(파일4·부재5) SHA 및 존재 상태 동일, QA sandbox 분리 | 저장 gate PASS |
| 실제 Renderer | Apple M5 Pro/Metal, UniversalRenderer, DecalRendererFeature active, GetTechnique `DBuffer`, MRT8, RM1 데칼 그래프 정상 로드, 청취 일시정지·볼륨0·출력샘플 peak0·Direct Video 0 | 경로 확인 |
| 캡처 | 1920×1080 실화면, 1920×1080 및 3840×1080 직접 GPU RT의 off/on PNG. 세 receiver 모두 픽셀차0. 실제 캡처는 빈 검정 화면이고 Lit 양성대조도 변화0 | **fixture 무효**, receiver FAIL 단정 불가 |

`_DBUFFER_MRT3`는 `Camera.Render()` 반환 뒤 조회할 때 false였다. 렌더 패스 중 GPU keyword 상태의 증거로 사용하지 않는다. 현재 카메라·로비 경로를 원인 분리 중이며, 유효한 Lit 양성대조와 바닥 가시성이 확인될 때까지 custom receiver의 GPU 판정을 보류한다. 3840×1080은 물리적 화면 크기가 아닌 직접 RenderTexture다.

후속 진단: 실패 PNG의 1920×1080 모든 픽셀은 카메라 배경색 `(9,9,10)`으로 확인됐다. 따라서 투영 안팎 픽셀차0은 수신 여부가 아니라 메시가 아예 그려지지 않은 결과다. 다음 fixture는 URP Base 카메라를 명시하고 다른 카메라·로비를 격리하며, 별도 Lit 큐브의 frustum/실제 픽셀 및 바닥의 활성·frustum·스크린 좌표를 영수증에 추가한다. 이 진단 전에는 같은 빈 화면을 receiver 결과로 사용하지 않는다.

진단 결과: Quad는 활성·renderer enabled·camera frustum 내부이며 중심은 화면 `(960,540)`, z≈8이었다. 별도 Lit 큐브도 frustum 내부이고 실제 픽셀 `(0.953,0.988,1.000)`으로 렌더됐다. Unity 내장 Quad의 로컬 법선은 `(0,0,-1)`이라 fixture의 `Euler(-90,0,0)`이 바닥 뒷면을 위로 향하게 했다. `Euler(90,0,0)`으로 수정한 뒤 아래 최종 fixture를 실행했다.

## 최종 격리 Player GPU 결과 — 2026-11-01 KST

후보 HEAD `21145ce94a491c6717c42a7f555e0bb0402c73a3`의 QA fixture를 APFS 복제 프로젝트에서 공식 `PortVerification.Build -settingsQa true -remodel-scenes 1`로 빌드했다. [빌드 영수증](/Users/fordeargamers/exoduser-wt/_out/mac-ground-receiver-20261101/build-facing-receipt.json)은 Unity 6000.6.7f1, StandaloneOSX ARM64, Settings QA 식별자, 오류0이다. 같은 앱의 [M1 영수증](/Users/fordeargamers/exoduser-wt/_out/mac-ground-receiver-20261101/facing-m1/m1-check.json)은 23/23 `ok`, 종료코드0. 이어서 1920×1080 실제 창에서 세 평면 receiver와 같은 RM1 데칼 projector, 같은 카메라·방향광·재질 설정의 off/on을 캡처했다. 3840×1080은 동일 Player의 직접 GPU RenderTexture이며 물리적 3840 창이 아니다.

| receiver (shader) | 1920 내부 최대 채널차 | 3840 내부 최대 채널차 | 경계 안쪽 차 (두 해상도 동일) | 투영 밖·경계 밖 차 | 판정 |
|---|---:|---:|---:|---:|---|
| HellGround 흙 (`EXODUSER/HellGroundPBR`) | 0.203922 | 0.203922 | 0.203922 | 0 | PASS |
| A2Root 지면 (`EXODUSER/A2RootSurface`) | 0.176471 | 0.176471 | 0.176471 | 0 | PASS |
| 목교 양성대조 (`Universal Render Pipeline/Lit`) | 0.337255 | 0.337255 | 0.337255 | 0 | PASS |

[GPU 영수증](/Users/fordeargamers/exoduser-wt/_out/mac-ground-receiver-20261101/facing-receiver/ground-receiver-receipt.json)은 Apple M5 Pro/Metal, UniversalRenderer, active DecalRendererFeature, 내부 `GetTechnique=DBuffer`, MRT8, RM1 ShaderGraph 정상 로드, 창 1920×1080을 기록했다. [실창 on](/Users/fordeargamers/exoduser-wt/_out/mac-ground-receiver-20261101/facing-receiver/window-1920x1080-on.png), [1920 RT on](/Users/fordeargamers/exoduser-wt/_out/mac-ground-receiver-20261101/facing-receiver/1920x1080-on.png), [3840 RT on](/Users/fordeargamers/exoduser-wt/_out/mac-ground-receiver-20261101/facing-receiver/3840x1080-on.png), [A2 경계 1920 1x](/Users/fordeargamers/exoduser-wt/_out/mac-ground-receiver-20261101/facing-receiver/a2-edge-1x.png), [A2 경계 3840 1x](/Users/fordeargamers/exoduser-wt/_out/mac-ground-receiver-20261101/facing-receiver/a2-edge-3840-1x.png)에서 세 바닥의 동일 투영 띠와 끊김 없는 경계를 육안 확인했다. ROI는 각 바닥의 중심, 투영 밖 z=1.2, 경계 안 z=.34·밖 z=.46이다. 실창과 RT는 같은 Player 출력이지만 별도 캡처다.

두 custom shader의 실제 바이트 SHA는 위 원본 인수표와 일치하고, 공통 대비 각 6줄 추가·삭제0이다. 기존 `UsePass .../ShadowCaster`, `.../DepthOnly`, `.../DepthNormals`는 보존됐으며 Metal 빌드에 포함됐다. URP 패키지의 `DecalRendererFeature.GetTechnique` 결과와 화면상 효과가 DBuffer 사용을 지지한다. `Shader.IsKeywordEnabled("_DBUFFER_MRT3")`를 `Camera.Render` 반환 후 조회한 값은 false로, **패스 실행 중 global keyword를 직접 계측한 증거는 없다**. DepthNormals 개별 GPU draw call도 별도 캡처하지 않았다. 이 두 항목과 실제 맵 메시/텍스처/목교 접지·충돌/카메라 시퀀스는 후속 통합 QA 범위다. 이 평면 fixture PASS를 전체 맵 READY로 확장하지 않는다.

`--unity-mute`, `AudioListener.pause=true`, volume0, listener output sample peak0, Direct Video Player0을 기록했다. QA sandbox와 앱 정체성을 분리했고, 빌드·M1·GPU 각각 전후 개인 앱 저장 루트/설정 plist의 11개 항목(파일4·부재5) SHA·존재 상태가 동일했다. GPU Player는 `QA_MEDIA_DRAIN_COMPLETE GROUND_RECEIVER` 후 정상 `Application.Quit(0)`, 잔여 Editor/Player 프로세스0. 청각·OS 물리 출력 루프백을 주장하지 않는다.

## MAP PRODUCTION REPORT (§23)

```text
================= MAP PRODUCTION REPORT =================
STAGE: CH1/A2 GROUND receiver 기술 후보, 분리 QA 평면 fixture
MASTER
- silhouette: 기존 맵 미변경·이번 범위 밖
- regions: 기존 맵 미변경·이번 범위 밖
- main route: 기존 맵 미변경·이번 범위 밖
- side spaces: 기존 맵 미변경·이번 범위 밖
OUTER MASS
- LEFT/RIGHT/TOP/SOUTH/major holes: 제작·수정·검수 없음
LARGE
- source assets: 기존 RM1 데칼 ShaderGraph 및 기존 두 custom ground shader
- composites/overlap/repeated silhouette: 제작·수정·검수 없음
MEDIUM
- connections/remaining holes: 제작·수정·검수 없음
GROUND
- shadow: 기존 ShadowCaster/DepthOnly/DepthNormals UsePass 보존; 실제 맵 그림자 검수 별도
- contamination: 평면 fixture 투영 밖·경계 밖 off/on 최대 채널차 0
- structure integration: HellGround/A2Root/Lit 동시 투영 PASS; 실제 목교·지면 접지 별도
PLAYABLE
- main arenas/travel space/breathing space/threat space/combat readability: 맵 변경·검수 없음
LANDMARK
- primary/secondary/tertiary: 맵 변경·검수 없음
CAMERA QA
- START: 고정 QA 카메라 1920×1080 실창 및 3840×1080 직접 RT 확인
- EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT: 실제 맵 카메라 검수 없음
TECH QA
- route/collision/pageerror/404: 변경·검수 없음
- seam: 평면 투영 경계 1x 시각 및 ROI PASS, 실제 맵 seam 별도
- loading: 같은 ARM64 Player M1 23/23 ok
- performance: GPU 시간·FPS 계측 없음
FILES
- stage-owned: 두 custom shader(각 +6/-0), NativeGame QA hook/fixture, Resources/QA material, docs
- concurrent touched: 없음
- unrelated touched: 없음
GIT
- staged: 최종 보고 문서와 changelog만 후속 stage
- commit: 후보 브랜치 원본 및 QA checkpoint 완료; 최종 보고 commit 별도
- push: 후보 브랜치만 비강제 push, common unity/main 미변경
- deploy: 없음
VISUAL VERDICT: RETOUCH (평면 receiver fixture PASS; 실제 맵 통합 visual 미검수)
NEXT PASS: 패스 중 DBuffer keyword/DepthNormals draw 관찰, 실제 맵 지면·목교 접지/카메라 QA
```

## 실제 R5/A2 맵 접지 QA 확장 — 실행 전 복구점

사용자 후속 범위는 기존 A2 전체 필드의 픽셀 빌보드 HD2D 방향을 유지한 실제 지면·뿌리·목교 접지 세 지점이다. `--unity-ground-map-capture --remodel3d`는 기존 `NativeGame`과 RM1 additive scene을 그대로 실행하고, 격리 QA 전용 RM1 projector 한 개만 지면/경계/교량으로 옮긴다. 새 아트·맵 mesh/material·배치·Core·충돌·제품 Renderer 변경은 없다. 1920×1080 실제 창을 유지하며 3840×1080은 직접 GPU RT로만 만든다. 각 위치의 off-A/off-B/on 직접 RT 세 장은 **yield 없는 같은 프레임**에 같은 실제 카메라·광원·world 상태로 렌더하고, off 반복 차이를 별도 기록한다. 창 스크린샷은 HUD 포함 별도 프레임 출처이므로 RT 수치와 동일시하지 않는다.

| 지점 | world x,z 및 선택 기준 | receiver 기록 |
|---|---|---|
| 시작부 | `(40.2,-77.0)` | 실제 A2 지면 청크의 `a2FieldSoil`/HellGroundPBR |
| 통로/경계 | 실제 활성 `A2RootSurface` renderer 중 목교 중심 `(43.2,-71.8)`에 가장 가까운 것의 bounds 중심 | 실제 뿌리 renderer 이름·material/shader/transform |
| 목교 접지 | 실제 `A2 시작 목교` 중심 `(43.2,-71.8)` | 자식 renderer 전부와 실제 윗면 vertex, actor ground/terrain 높이 |

각 지점은 Core 보행 여부, 지형·배우·목교 윗면 높이, 실제 카메라 pose, receiver transform, 화면 anchor/ROI 안팎 변동 픽셀·최대 채널차를 영수증에 남긴다. projector가 만든 변화는 자연 회복/강타 VFX 증거가 아니다. 이 checkpoint 시점에 열려 있던 1x 경계·발밑·부양·침범 판정은 아래 새 Player 결과로 보충한다. 기존 평면 fixture PASS나 과거 A2 아트 RETOUCH/Impact R4 FAIL을 실제 맵 PASS로 소급하지 않는다.

## 실제 A2 맵 Player GPU·1x 결과 — 2026-11-01 KST

후보 코드 checkpoint `b0d5eb2d3270106e9cdff5f5e865fd41437fc8e7`의 QA hook 두 파일을 APFS 복제 프로젝트에 byte 일치로 넣고 공식 `PortVerification.Build -settingsQa true -remodel-scenes 1`로 새 ARM64 앱을 만들었다. [빌드 영수증](/Users/fordeargamers/exoduser-wt/_out/mac-ground-receiver-map-20261101/build-receipt.json)은 Unity 6000.6.7f1과 오류0을 기록한다. 별도 측정한 앱 실행파일 SHA-256은 `46bb5f84cd61361ef0ffde663926ab1ef3c803fad27891eed82e5d25ac889b17`이다. 같은 앱의 [M1 영수증](/Users/fordeargamers/exoduser-wt/_out/mac-ground-receiver-map-20261101/m1/m1-check.json)은 23/23 `ok`, 종료코드0. 그 다음 같은 앱에서 `--remodel3d --unity-ground-map-capture --unity-mute`로 실제 A2 필드를 띄웠다. [실제 맵 GPU 영수증](/Users/fordeargamers/exoduser-wt/_out/mac-ground-receiver-map-20261101/map/ground-map-receipt.json)은 Apple M5 Pro/Metal, UniversalRenderer, active DecalRendererFeature, `GetTechnique=DBuffer`, MRT8, HD2D pixel billboard, 지면 청크144·뿌리 renderer79·실제 Lit 목교 renderer와 1920×1080 창을 기록한다. 3840×1080은 같은 Player의 직접 GPU RT이며 물리적 화면 크기가 아니다.

각 해상도·지점마다 projector off-A/off-B/on을 같은 프레임의 동일 카메라와 world 상태에서 직접 RT로 읽었다. `off-A↔off-B`는 반복 드리프트, `off-A↔on`은 수신 효과다. 표의 `밖0`은 정의한 화면 ROI 바깥의 픽셀 수이며, ROI 안에 있는 난간·뿌리 부위가 모두 적절한 수신 대상이라는 뜻은 아니다.

| 지점·실제 receiver | world `(x,y,z)` / Core | 1920 RT 내부 변화 픽셀·최대 채널차 / 반복 변화 | 3840 RT 내부 변화 픽셀·최대 채널차 / 반복 변화 | ROI 밖 | 1x 시각 판정 |
|---|---|---:|---:|---:|---|
| 시작부 `HellGroundPBR` 지면 | `(40.2,.291918,-77)`, 보행 가능, 배우 접지Y=.291918 | 16,130·160 / 0 | 15,890·160 / 0 | 양쪽 0 | 흙 표면 수신 확인. 시험용 사각 투영 형태가 선명하므로 자연 VFX 외관 판정 아님 |
| 통로/경계 `A2_Root_Cluster_Patch`, `A2RootSurface` | `(36.291599,.404789,-73.171349)`, 보행 가능, 지형Y=.240323·배우 접지Y=.404789 | 9,720·176 / 3 | 9,723·176 / 0 | 양쪽 0 | 실제 솟은 뿌리와 경사 끝까지 수신. 경계에 날카로운 청록 쐐기가 보이므로 자연 접지 외관은 RETOUCH |
| 실제 `A2 시작 목교`, `RF3_Rotten_Wood_Bridge`/URP Lit | `(43.2,.294636,-71.8)`, 보행 가능, 물바닥Y=-.55·배우 접지Y=.291008·목교 윗면Y=.294636 | 16,246·189 / 2 | 15,954·189 / 0 | 양쪽 0 | 판재 발밑 수신과 높이차 .003628u 확인. 1x에서 난간 기둥·옆면에도 청록색이 침범해 **RETOUCH** |

반복 변화 최대 채널차는 1920/3840 순서로 시작 4/4, 뿌리 6/4, 목교 5/4다. 수신 효과의 최대 채널차 160/176/189보다 작으며, 각 지점의 자동 `passed=true`는 해당 ROI 차이에 한정된다. [시작 실창](/Users/fordeargamers/exoduser-wt/_out/mac-ground-receiver-map-20261101/map/start-window-1920-on.png), [뿌리 실창](/Users/fordeargamers/exoduser-wt/_out/mac-ground-receiver-map-20261101/map/passage-root-boundary-window-1920-on.png), [목교 실창](/Users/fordeargamers/exoduser-wt/_out/mac-ground-receiver-map-20261101/map/actual-wood-bridge-window-1920-on.png)은 실제 1920 창·HUD의 별도 프레임 스크린샷이다. [뿌리 1920 1x](/Users/fordeargamers/exoduser-wt/_out/mac-ground-receiver-map-20261101/map/passage-root-boundary-1920-1x.png), [목교 1920 1x](/Users/fordeargamers/exoduser-wt/_out/mac-ground-receiver-map-20261101/map/actual-wood-bridge-1920-1x.png), [목교 3840 1x](/Users/fordeargamers/exoduser-wt/_out/mac-ground-receiver-map-20261101/map/actual-wood-bridge-3840-1x.png)을 원본 픽셀 크기로 비교했다. 배우 발 위치는 수치·화면상 윗면에 가깝지만, 자연 이동·전투 중 관통/부양 검사는 아니다.

빌드·M1·맵 Player 각각 전후 개인 앱 저장 루트/설정 plist 11개 항목(파일4·부재5)의 존재·크기·SHA가 동일했다. 독립 QA sandbox를 사용했으며 맵 Player는 `QA_MEDIA_DRAIN_COMPLETE GROUND_MAP` 뒤 정상 종료코드0, 잔여 게임 Player/Editor0이다. `AudioListener.pause=true`, volume0, listener output sample peak0, Direct Video Player0을 기록했다. OS 물리 출력의 청각 검사는 아니다. 제품 Renderer/맵 mesh·material·transform·Core·충돌·기존 에셋은 수정하지 않았다. 패스 중 `_DBUFFER_MRT3` keyword와 개별 DepthNormals draw call은 현 Player 계측으로 직접 추적하지 않았으므로 `GetTechnique=DBuffer`와 시각 변화에서 추론해 확정하지 않는다.

## MAP PRODUCTION REPORT (§23) — 실제 A2 세 지점

```text
================= MAP PRODUCTION REPORT =================
STAGE: CH1/A2 실제 시작 흙·뿌리 경계·시작 목교의 지면 데칼 수신 후보 QA
MASTER
- silhouette/regions/main route/side spaces: 기존 A2 유지; 전체 구성 시각 검수 없음
OUTER MASS
- LEFT/RIGHT/TOP/SOUTH/major holes: 제작·수정·검수 없음
LARGE
- source assets: 기존 HellGroundPBR/A2RootSurface, 기존 RF3 목교, 기존 RM1 QA projector
- composites/overlap/repeated silhouette: 제작·수정 없음; 세 접지 지점만 1x 확인
MEDIUM
- connections/remaining holes: 시작부와 목교 주변 뿌리 경계만 확인; 연결 전체 검수 없음
GROUND
- shadow: 실제 세 지점 표면 관찰, 그림자 단독 비교·DepthNormals draw 계측 없음
- contamination: 정의한 ROI 바깥 off/on 변화0; ROI 안 난간/옆면 투영 침범 관찰
- structure integration: 시작 흙·솟은 뿌리·실제 목교 판재 수신 확인, 목교 측면과 뿌리 경사 경계 RETOUCH
PLAYABLE
- main arenas/travel space/breathing space/threat space/combat readability: Core 보행 가능 세 anchor; 자연 이동·전투 검수 없음
LANDMARK
- primary/secondary/tertiary: 기존 랜드마크 미변경·검수 없음
CAMERA QA
- START: 실제 카메라 Euler(34,0,0), 세 anchor 중심의 1920 실창·1920/3840 RT 1x 확인
- EARLY: 시작 통로 뿌리 경계 정지 화면 확인
- ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT: 순회·검수 없음
TECH QA
- route/collision/pageerror/404: 세 anchor Core 보행 가능; 전체 route·collision·API 검수 없음
- seam: 흙/뿌리 및 목교 주변 1x 확인, 난간/옆면 침범·뿌리 쐐기 RETOUCH
- loading: 동일 ARM64 앱 M1 23/23 ok, 실제 맵 Player 정상 종료
- performance: GPU 시간·FPS 계측 없음
FILES
- stage-owned: 기존 두 custom shader 후보, QA hook/helper, docs
- concurrent touched: 없음
- unrelated touched: 없음
GIT
- staged/commit/push: 후보 브랜치 checkpoint b0d5eb2d와 이 보고 commit; common unity/main 미변경
- deploy: 없음
VISUAL VERDICT: RETOUCH (실제 세 지점 GPU 수신 PASS; 난간/옆면 침범과 뿌리 경계 보정 필요)
NEXT PASS: 실제 효과의 projector 범위/receiver 분리 설계, 자연 이동·전투 접지와 카메라 순회, 가능하면 패스 중 DBuffer keyword/DepthNormals 직접 trace. 기존 Impact R4 FAIL 별도 유지.
```

## 실제 맵 QA projector 제한 후보 — 빌드 전 계약

기존 실제맵 영수증의 `insideChanged/outsideChanged`는 raw 픽셀 불일치 수가 아니다. `GroundMapMeasure`는 off-A/off-B의 채널 최대차 `self > 4`를 반복 변화로 세고, off-B/on의 채널 최대차 `effect > self + 4`인 픽셀만 내부/외부 효과로 센다. 따라서 이전 `outsideChanged=0`은 정의한 ROI 밖에서 이 **필터 기준**을 넘은 픽셀0이라는 뜻이다. 새 후보는 같은 필터 수치와 별도로 `rawSelfChanged/rawEffectChanged/rawOutsideChanged`(채널 최대차 >0), `rawSelfMax/rawEffectMax`를 기록한다. 기존 캡처의 raw 값은 같은 이미지 파일에서 별도 산출해 나란히 비교한다.

원인 가설: 기존 QA projector는 `(x,surfaceY+2,z)`, 크기 `(3,1.4,6)`, pivot0, 90° 하향, URP 기본 `startAngleFade=endAngleFade=180°`(각도 제한 비활성)였다. URP 17.6 설치 소스의 `DecalProjector`는 깊이를 `size.z`, 표면 법선 각도 감쇠를 `startAngleFade/endAngleFade`로 제공하고 `DecalEntityManager`는 180°에서 감쇠를 끈다. 이 넓은 투영 상자가 목교 난간과 수직 옆면을 포함한 것이 1x 침범의 근거다. 두 custom receiver의 6줄 DBuffer 수신은 평면 양성대조와 실제 흙/뿌리에서 작동하므로, 현 증거만으로 shader 자체의 침범 결함으로 단정하지 않는다. 제품 `VfxBridge` 일반 projector는 깊이2u, poison stain도 깊이2u, Ki scar도 깊이2u이고 각도 감쇠는 별도로 지정하지 않는다. 이 비교는 제품 효과의 실제 침범 측정이 아니다.

이번 제한 후보는 **QA helper만** `(x,surfaceY+.04,z)`, 크기 `(3,1.4,.45)`, 시작각45°·끝각70°로 둔다. 같은 projector 재질/색·footprint x/y·세 anchor·실제 카메라·ROI·`GroundMapMeasure` 필터와 판정 기준은 유지한다. 투영 두께 .45u는 root anchor의 지형 차이 .164466u를 포함한다. 상향 흙/뿌리/판재 수신이 유지되고 난간/수직면 침범이 줄어드는지 **새 GPU/1x**로 판정하며, 경계 잘림이 생기면 실패로 기록한다. 제품 projector·Renderer·맵 mesh/material/transform·두 shader blob은 바꾸지 않는다. 이 후보를 자연 VFX 완성으로 부르지 않는다.

## 제한 후보 실제 Player 결과 — 2026-11-01 KST

후보 코드 checkpoint `bdbac683f3307d43b83eabf50e6023b0234cd833`를 원격에서 확인한 뒤 기존 격리 QA 프로젝트에 helper SHA-256 `6278d7bfeacd5540ea9db77f9850c8287e6afc16055821b516cb64d5b23955c5`를 byte 일치로 반영했다. 새 [ARM64 빌드 영수증](/Users/fordeargamers/exoduser-wt/_out/mac-ground-receiver-limit-20261101/build-receipt.json)은 Unity 6000.6.7f1·오류0이다. 같은 새 앱의 [M1 영수증](/Users/fordeargamers/exoduser-wt/_out/mac-ground-receiver-limit-20261101/m1/m1-check.json)은 23/23 `ok`·exit0이고, 이어서 같은 앱의 [실제맵 GPU 영수증](/Users/fordeargamers/exoduser-wt/_out/mac-ground-receiver-limit-20261101/map/ground-map-receipt.json)은 세 지점×두 직접 RT의 `passed=true`, Metal/DBuffer/MRT8/HD2D와 QA 설정 깊이 .45u·중심 +.04u·각도 45/70°를 기록했다. 1920×1080은 실제 창이며 3840×1080은 직접 GPU RT이다. off-A/off-B/on은 각 지점·해상도 안에서 yield 없는 같은 world/light/camera/time으로 캡처했다. 실창 PNG는 별도 프레임·HUD 출처다.

| 지점/RT | 기존 필터 내부 변화 → 제한 후보 | 기존 raw 효과 비영점 → 후보 | 기존 raw ROI 밖 → 후보 | raw 효과 최대 채널차 기존 → 후보 |
|---|---:|---:|---:|---:|
| 시작 흙 1920 | 16,130 → 16,130 | 49,793 → 49,791 | 32,036 → 32,034 | 160 → 160 |
| 시작 흙 3840 | 15,890 → 15,890 | 65,751 → 65,749 | 48,341 → 48,339 | 160 → 160 |
| 뿌리 경계 1920 | 9,720 → 8,830 | 64,296 → 63,431 | 52,989 → 52,984 | 176 → 176 |
| 뿌리 경계 3840 | 9,723 → 8,834 | 103,821 → 102,957 | 92,546 → 92,541 | 176 → 176 |
| 목교 1920 | 16,246 → 15,156 | 47,872 → 46,816 | 27,800 → 27,800 | 189 → 181 |
| 목교 3840 | 15,954 → 14,864 | 110,034 → 108,932 | 90,562 → 90,562 | 189 → 187 |

모든 행의 **기존 필터 ROI 밖과 후보 필터 ROI 밖은 각각 0**이다. raw ROI 밖 비영점은 off 반복의 최대 4~6 채널차와 미세한 화면 변화도 세므로 0이 아니다. 기존 이미지도 같은 Swift/AppKit RGB 바이트 분석기로 다시 계산했으며, 필터 내부 수는 기존 Unity 영수증의 여섯 값과 정확히 일치한다. 새 영수증의 `rawSelfChanged/rawSelfMax`도 각 행에 남겼다. [고정 mask 원본 집계](/Users/fordeargamers/exoduser-wt/_out/mac-ground-receiver-limit-20261101/baseline-raw-masks.txt)와 [후보 집계](/Users/fordeargamers/exoduser-wt/_out/mac-ground-receiver-limit-20261101/candidate-raw-masks.txt)은 같은 분석기/좌표를 썼다. 좌표는 PNG 상단 원점, 3840은 x에 +960px만 이동한다.

| 1920 고정 1x 영역 `[x0,y0,x1,y1)` | 기존 필터 변화 → 후보 | raw 비영점 기존 → 후보 | 판정 |
|---|---:|---:|---|
| 흙 중심 `[880,575,1040,635)` | 9,311 → 9,311 | 9,482 → 9,482 | 바닥 수신 유지 |
| 뿌리 중심 `[850,560,980,650)` | 7,150 → 7,150 | 7,495 → 7,495 | 중심 수신 유지 |
| 뿌리 끝 `[1015,620,1100,700)` | 845 → 180 | 936 → 280 | 쐐기 범위 축소, 끝에 남음 |
| 목교 판재 `[880,585,1040,660)` | 8,577 → 8,563 | 8,855 → 8,843 | 발밑 수신 거의 유지 |
| 목교 왼쪽 난간 `[825,520,870,575)` | 727 → 207 | 832 → 314 | 난간 침범 감소, 잔존 |
| 목교 오른쪽 옆면 `[1050,605,1090,705)` | 788 → 452 | 940 → 646 | 옆면 침범 감소, 잔존 |

3840에서도 뿌리 끝 844→180, 목교 판재 8,667→8,653, 왼쪽 난간 727→207, 오른쪽 옆면 788→452로 같은 방향이었다. [후보 목교 1920 1x](/Users/fordeargamers/exoduser-wt/_out/mac-ground-receiver-limit-20261101/map/actual-wood-bridge-1920-1x.png), [3840 1x](/Users/fordeargamers/exoduser-wt/_out/mac-ground-receiver-limit-20261101/map/actual-wood-bridge-3840-1x.png), [뿌리 1920 1x](/Users/fordeargamers/exoduser-wt/_out/mac-ground-receiver-limit-20261101/map/passage-root-boundary-1920-1x.png)에서 부분 축소와 잔존을 육안 확인했다. 흙은 기존과 같은 크기로 보인다. 기존 raw/off 이미지도 보존했다. 이 결과는 깊이·법선 각도 범위가 침범에 기여한다는 직접 비교이며, 남은 수직/경사 부위는 투영 상자 안의 기하와 뿌리 자체 receiver 표면이므로 이 QA 설정만으로 분리되지 않는다. sharp cyan 시험색·사각 footprint를 실제 회복/강타 VFX 결함으로 해석하지 않는다.

이전 평면 앱의 실행파일/`Exoduser.Runtime.dll` SHA-256은 `b05687675c76903bd47cac8c5e674aea8f581c3add915c2f21a48e2e10b626d7` / `2dcde8baf109c048c061e18c39c79421e97ad8da8a028080f2d1f6c2d3edb7bb`, 이전 실제맵 앱은 `46bb5f84cd61361ef0ffde663926ab1ef3c803fad27891eed82e5d25ac889b17` / `f1237c3991daa00516e87353c2cf6854bc2a2b2acafad79ef0e5cac8efb5ad3a`, 이번 제한 앱은 `b00ece92144af709c87a20ad4466e2dc22a3a889a4035daacd5dc4dae13759ec` / `0cbb1a4748d6c002f8019239a2ea33399c481ddb8319d611b67811a4ed2823f5`다. 세 앱 모두 해당 경로 `Contents/Resources/Data/Managed/Exoduser.Runtime.dll`이 존재한다. 이번 Core DLL SHA는 기존과 같은 `7b3414c9381862d681258347c9e5e54f11eaf6e6d753cde14d476cb6c9395ab3`; 두 custom shader blob SHA도 상단 표의 `93896381…`/`e49e7350…` 그대로다. 빌드 후 소유 Unity tree는 checkpoint와 diff0이며 최종 보고 commit에서는 docs만 바뀐다. QA 복제 프로젝트에는 이전 Unity import가 만든 `.meta` 및 URP/scene/project 직렬화 차이가 남아 있어 저장소 전체 Unity tree와 byte 동일하다고 주장하지 않는다. 이번 수동 이식한 QA helper는 source와 `cmp` 동일이고, 제품 소스·두 shader blob은 최종 tree에 그대로 남았다.

빌드→M1→맵 Player 각각 전후 일반 사용자 저장 11항목(파일4·부재5)의 존재·크기·SHA가 같고 고유 QA sandbox를 사용했다. 두 Player 모두 `QA_MEDIA_DRAIN_COMPLETE` 뒤 exit0, 잔여 게임 Player/Editor0이다. 맵 영수증은 Listener pause·volume0·출력 sample peak0·Direct Video0을 기록한다. OS 물리 청각 측정은 아니다. 제품 전역 receiver/layer/두 shader를 바꾸지 않았으므로 실제 효과를 특정 receiver로만 제한하려면 별도 제품 rendering-layer/receiver 설정과 기존 맵 표면의 영향 검수가 필요하다. 이 단위에서는 제안만 남긴다.

## MAP PRODUCTION REPORT (§23) — 제한 후보

```text
================= MAP PRODUCTION REPORT =================
STAGE: CH1/A2 실제 세 지점 QA projector 깊이·각도 원인 분리
MASTER
- silhouette/regions/main route/side spaces: 기존 맵 불변, 전체 구성 시각 검수 없음
OUTER MASS
- LEFT/RIGHT/TOP/SOUTH/major holes: 제작·수정·검수 없음
LARGE
- source assets: 기존 두 custom receiver shader·RM1 QA 재질·기존 목교
- composites/overlap/repeated silhouette: 변경 없음; 고정 1x 세 접지 지점만 비교
MEDIUM
- connections/remaining holes: 뿌리 끝과 목교 발밑만 국소 비교, 전체 연결 검수 없음
GROUND
- shadow: 별도 그림자/DepthNormals draw 계측 없음
- contamination: 필터 ROI 밖 양쪽0, raw 비영점은 별도 기록; 난간727→207·옆면788→452·뿌리 끝845→180 잔존
- structure integration: 흙9311→9311·뿌리 중심7150→7150·목교 판재8577→8563, 제한 후보 부분 개선
PLAYABLE
- main arenas/travel space/breathing space/threat space/combat readability: 제작 없음; 자연 이동·전투 검수 없음
LANDMARK
- primary/secondary/tertiary: 불변·검수 없음
CAMERA QA
- START/EARLY: 기존 실제 카메라의 세 정지 anchor, 1920 실창·1920/3840 직접 RT 1x
- ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT: 순회·검수 없음
TECH QA
- route/collision/pageerror/404: 이번 변경 없음·전체 검수 없음
- seam: root 경사 쐐기와 목교 난간/옆면 감소하나 잔존
- loading: 새 ARM64 앱 M1 23/23, 실제맵 Player 정상 종료
- performance: GPU 시간·FPS 계측 없음
FILES
- stage-owned: NativeGame.GroundReceiverCapture.cs QA helper, receiver 보고·CHANGELOG
- concurrent touched/unrelated touched: 없음
GIT
- staged/commit/push: 후보 branch bdbac683 checkpoint 후 최종 docs commit, nonforce remote 확인
- deploy/common merge: 없음
VISUAL VERDICT: RETOUCH (제한 후보 부분 개선; 실제맵/Impact R4 기존 판정 유지)
NEXT PASS: 실제 제품 효과의 projector별 footprint/수신 layer 설계와 회귀, 자연 이동·전투/카메라 검수. 패스 중 keyword·DepthNormals 직접 trace는 미계측.
```
