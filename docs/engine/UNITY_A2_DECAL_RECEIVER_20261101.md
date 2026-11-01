# A2 지면 DBuffer 데칼 수신 — 공통 6ad 기준

상태: 2026-11-02 현재 두 셰이더에만 수신 변경을 이식했다. 정확 소스 `afdd4ab535c2e5f2a419fb009b50598a06ddc88b` Settings QA ARM64 앱의 Metal 기술 수신은 아래 범위에서 PASS다. 일반 앱 전달은 별도 영수증 전까지 미완료다. 맵 전체 VISUAL VERDICT는 RETOUCH, Impact R4 전체 VISUAL FAIL을 유지한다.

| id | 현재 코드 계약 | 적용 위치 |
|---|---|---|
| RECEIVER_HELL | `_DBUFFER_MRT1/2/3` 변종, `DBuffer.hlsl`; 모든 표면 계산 후 `#if defined(_DBUFFER)` 안에서 `ApplyDecalToSurfaceData(i.positionCS,surface,input)` 후 `input.bakedGI=SampleSH(input.normalWS)` | `unity/Assets/Exoduser/Resources/Shaders/HellGroundPBR.shader`, Opaque UniversalForward |
| RECEIVER_A2_ROOT | 위와 같은 변종·include·호출 순서. 기존 scan/leaf/soil 계산 뒤, PBR·fog 앞 | `unity/Assets/Exoduser/Resources/Shaders/A2RootSurface.shader`, Opaque UniversalForward |
| RENDERER | 현행 `URP_PC_High_Renderer.asset` 및 `URP_Mac_Balanced_Renderer.asset`의 활성 `DecalRendererFeature`, technique0/DBuffer, surfaceData2. 파일 변경 0 | 기존 렌더러 자산 |
| QA_PROJECTOR | `Resources/QA/GroundDecal.mat`은 기존 `VFX/RM1/ShaderGraph/SG_GroundDecal.shadergraph` GUID `3711406b121bdf54d86230cad50873a6`를 참조한다. QA 플래그에서만 로드하며 제품 표시 기본 경로에서 사용 0 | `NativeGame.GroundReceiverCapture.cs`, `--unity-ground-receiver-capture`/`--unity-ground-map-capture` |
| INVALID_CONTROL | `Remodel/CH1_1/Materials/M_Decal_blood.mat`은 GUID `5d578e206d9a02b4a96236bae6dc2b2b`의 `GroundDecal.shader`를 사용한다. 이는 Transparent/UniversalForward 평면 quad용이고 `DBufferProjector` pass가 없다. DecalProjector 양성 대조에 사용 금지 | 이전 검토 보고서의 재질 추천 정정 |

소스 근거: 승인 공통 `6ad8b809c47f508f5d79362cff91f82934082afe`는 두 셰이더의 DBuffer 변종·수신 호출이 없었다. Impact R5 후보 `a034b3e2b7d0572e8b7b36f66e35fc81f7a265e8`의 마지막 `3a78311e9a→a034`에서 두 셰이더는 각각 6줄만 추가되었다. 이 순수 수신 변화만 공통 원문에 적용하고 기존 shader GUID/속성·geometry/DeckHeight/GroundY·Core/AI/피해·카메라·방향/atlas·UI·로스터·색/alpha/반경은 유지한다.

검증: 먼저 옛 공통의 흙 수신 없음/목교 양성 기록과 위 두 원문 누락을 RED로 보존했다. 새 정확 source `afdd4ab`와 원격 SHA를 일치시킨 뒤 `Assets/Packages/ProjectSettings` 3,537파일·SHA manifest `076024c20857b04be05ddd1039b3562f8bd6787c6d03561a86af41c03212446c`, 불일치 0으로 격리 빌드했다. 비Git 필수 영상 2개의 경로·SHA도 별도 manifest로 고정했다. Unity 6000.6.7f1/ARM64 Settings QA 빌드는 `Succeeded`/오류 0/4,543,965,444바이트. 같은 앱 Metal M1 23/23 ok, firstBlocked 없음, 정상 종료. QA `SG_GroundDecal` 실제 `DBufferProjector` pass 검사 성공, renderer `DBuffer`/MRT8/feature active, Listener pause·volume0·출력peak0·DirectVideo0. 평면 흙/뿌리/Lit 3수신체의 1920/3840 off/on 경계 샘플 모두 통과했다.

실제 A2 맵은 지면 chunk144·뿌리 renderer79와 기존 목교를 고정 카메라/동일 QA 재질·projector로 검수했다. 지면/뿌리/목교 각각 1920 실창 및 3840 직접 RT의 offA/offB/on 6사례가 모두 fixture 조건을 통과했다. offA/offB 안정성(`selfChanged` 0/0/3/0/2/0), 내부 효과 픽셀 16,130/15,890/8,830/8,834/15,156/14,864, `effect > self+4` 기준 경계 밖 픽셀 전부 0이다. **raw outside 변화는 32,034/48,339/52,984/92,541/27,800/90,562로 0이 아니다.** 애니메이션·화면 자체 변화가 포함되므로 필터 outside0을 rawzero로 보고하지 않는다. 원본 1920 실창 screenshot은 별도이며 3840은 같은 앱 카메라의 직접 RenderTexture다. QA 주입 장면이고 자연 플레이나 물리 3840 모니터 실행은 아니다. 실제 원본 1x에서 흙·뿌리·목교의 cyan 수신을 확인했으나 난간 측면 침범 RETOUCH 및 맵 전체 RETOUCH는 보존한다. 이 기술 수신 PASS로 R5 전체 VFX/holy/Map R8을 PASS 처리하지 않는다.

영수증: `/Users/fordeargamers/exoduser-wt/_out/mac-current-decal-receiver-20261102/`의 `RED-SOURCE.json`, `qa-input-verification.json`, `nongit-inputs.json`, `build-qa-receipt.json`, `m1/m1-check.json`, `flat/ground-receiver-receipt.json`, `map/ground-map-receipt.json`과 1920 원본/3840 RT 이미지. 빌드 후 Unity가 격리 QA clone에서 재직렬화/파생한 773경로(기존716 복원·신규57 삭제)는 source 원문으로 되돌렸고 전체 입력 3,537/3,537 재대조 불일치 0이다.

맵 제작 가이드 §23의 MAP PRODUCTION REPORT와 VISUAL VERDICT를 기술 수신 범위로 작성하며, 기존 난간 측면 RETOUCH와 전체 맵 RETOUCH를 유지한다. 후보의 `ImpactGroundPatch`/`NativeSkillRemaster`/재질·VFX 묶음, Map R8, holy는 이 변경에 포함하지 않는다.
