# Mac 지면 데칼 receiver 후보 — 2026-11-01 KST

상태: **후보 브랜치 전용, GPU receiver fixture 미성립**. 공통 `unity/main` 채택이나 맵 전체 완료를 뜻하지 않는다. 맵 제작 가이드 v0.9 전체와 `_MAP_SSOT_INDEX.md`를 선행 확인했다. 지면 수신은 구조물과 흙의 접지 기술 의존성일 뿐, geometry·collision·배치·카메라 설계·R8 아트 수정은 이번 범위가 아니다.

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

최종 실측과 `MAP PRODUCTION REPORT`는 이 문서에 후속 기록한다.

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
