# Mac 지면 데칼 receiver 후보 — 2026-11-01 KST

상태: **후보 브랜치 전용, GPU·Player 검수 전**. 공통 `unity/main` 채택이나 맵 전체 완료를 뜻하지 않는다. 맵 제작 가이드 v0.9 §4 GROUND TRANSITION·§18 GATE 4와 `_MAP_SSOT_INDEX.md`를 선행 확인했다. 지면 수신은 구조물과 흙의 접지 기술 의존성일 뿐, geometry·collision·배치·카메라 설계·R8 아트 수정은 이번 범위가 아니다.

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
