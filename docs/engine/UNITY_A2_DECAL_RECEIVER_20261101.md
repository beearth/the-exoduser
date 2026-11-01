# A2 지면 DBuffer 데칼 수신 — 공통 6ad 기준

상태: 2026-11-02 현재 두 셰이더에만 수신 변경을 이식했다. 실제 새 Mac Player/Metal GPU 검수 및 일반 앱 전달은 후속 영수증 전까지 미완료다. 맵 전체 VISUAL VERDICT는 RETOUCH, Impact R4 전체 VISUAL FAIL을 유지한다.

| id | 현재 코드 계약 | 적용 위치 |
|---|---|---|
| RECEIVER_HELL | `_DBUFFER_MRT1/2/3` 변종, `DBuffer.hlsl`; 모든 표면 계산 후 `#if defined(_DBUFFER)` 안에서 `ApplyDecalToSurfaceData(i.positionCS,surface,input)` 후 `input.bakedGI=SampleSH(input.normalWS)` | `unity/Assets/Exoduser/Resources/Shaders/HellGroundPBR.shader`, Opaque UniversalForward |
| RECEIVER_A2_ROOT | 위와 같은 변종·include·호출 순서. 기존 scan/leaf/soil 계산 뒤, PBR·fog 앞 | `unity/Assets/Exoduser/Resources/Shaders/A2RootSurface.shader`, Opaque UniversalForward |
| RENDERER | 현행 `URP_PC_High_Renderer.asset` 및 `URP_Mac_Balanced_Renderer.asset`의 활성 `DecalRendererFeature`, technique0/DBuffer, surfaceData2. 파일 변경 0 | 기존 렌더러 자산 |
| QA_PROJECTOR | `Resources/QA/GroundDecal.mat`은 기존 `VFX/RM1/ShaderGraph/SG_GroundDecal.shadergraph` GUID `3711406b121bdf54d86230cad50873a6`를 참조한다. QA 플래그에서만 로드하며 제품 표시 기본 경로에서 사용 0 | `NativeGame.GroundReceiverCapture.cs`, `--unity-ground-receiver-capture`/`--unity-ground-map-capture` |
| INVALID_CONTROL | `Remodel/CH1_1/Materials/M_Decal_blood.mat`은 GUID `5d578e206d9a02b4a96236bae6dc2b2b`의 `GroundDecal.shader`를 사용한다. 이는 Transparent/UniversalForward 평면 quad용이고 `DBufferProjector` pass가 없다. DecalProjector 양성 대조에 사용 금지 | 이전 검토 보고서의 재질 추천 정정 |

소스 근거: 승인 공통 `6ad8b809c47f508f5d79362cff91f82934082afe`는 두 셰이더의 DBuffer 변종·수신 호출이 없었다. Impact R5 후보 `a034b3e2b7d0572e8b7b36f66e35fc81f7a265e8`의 마지막 `3a78311e9a→a034`에서 두 셰이더는 각각 6줄만 추가되었다. 이 순수 수신 변화만 공통 원문에 적용하고 기존 shader GUID/속성·geometry/DeckHeight/GroundY·Core/AI/피해·카메라·방향/atlas·UI·로스터·색/alpha/반경은 유지한다.

검증: 먼저 옛 공통의 흙 수신 없음/목교 양성 기록과 위 두 원문 누락을 RED로 보존한다. 새 정확 source의 Shader import 및 DBuffer 변종 오류 0, 실제 동일 projector/material·카메라·고정 프레임의 흙/뿌리/목교 off/on, 무데칼 회귀, 경계 밖 차분을 확인한다. `effect > self + 4`로 필터한 outside 0은 raw outside 0과 구별한다. 1920 실창과 3840 직접 RT의 출처를 분리한다. 실제 GPU 검사 전에는 시각 PASS나 R5 전체 완료를 선언하지 않는다.

맵 제작 가이드 §23의 MAP PRODUCTION REPORT와 VISUAL VERDICT를 기술 수신 범위로 작성하며, 기존 난간 측면 RETOUCH와 전체 맵 RETOUCH를 유지한다. 후보의 `ImpactGroundPatch`/`NativeSkillRemaster`/재질·VFX 묶음, Map R8, holy는 이 변경에 포함하지 않는다.
