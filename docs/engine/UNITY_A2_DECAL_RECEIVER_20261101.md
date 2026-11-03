# A2 지면 DBuffer 데칼 수신 — 공통 6ad 기준

상태: 2026-11-02 현재 두 셰이더에만 수신 변경을 이식했다. 정확 소스 `afdd4ab535c2e5f2a419fb009b50598a06ddc88b` Settings QA ARM64 앱의 Metal 기술 수신은 아래 범위에서 PASS다. 일반 ARM64 앱은 같은 검증 입력으로 빌드하고 `/Users/fordeargamers/Applications/EXODUSER.app`에 파일 전달·검증했다. 일반 앱 실행은 수행하지 않았다. 맵 전체 VISUAL VERDICT는 RETOUCH, Impact R4 전체 VISUAL FAIL을 유지한다.

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

## 일반 Mac 앱 파일 전달 (2026-11-02)

| id | 검증값 |
|---|---|
| PRODUCT_BUILD | QA와 같은 격리 입력 3,537/3,537, SHA 불일치 0. Unity 6000.6.7f1 StandaloneOSX ARM64 일반 빌드 `Succeeded`, errors 0, 정규화 전 4,543,965,532B |
| NORMALIZE | 제품명 `EXODUSER · Unity 이식 검증판`, bundle ID `com.ForDearGamers.EXODUSER----Unity-----------------`, 내부 실행파일 `EXODUSER`, ad-hoc 서명 strict/deep PASS |
| PRODUCT_HASH | 실행파일 SHA256 `a70b83f318bdb3892db80baf08064faa0193d8a0db9c2b2b7c0e70ada414e622`, Runtime DLL `1b6ce864f82bcd3cef1531423410461360946083c196e789a1e34cd1d8400e3e`, Core DLL `76e3c4a391b7e34d571aa2fd4b34d7be8921b5248ed459beb688f1804213b06d` |
| PACKAGE | 정규화 원본·stage·설치본 모두 211파일/0 symlink/4,543,983,917B/전체 manifest SHA256 `54d8ae1bf0f4fe0dd52d2f43e1014e8dc39d2e1f7240366863739a594047e7c2`; 설치 경로 strict/deep PASS |
| CAS_BACKUP | 이전 설치본 실행파일·Runtime·Core 3 SHA 기대값 일치 후 `/Users/fordeargamers/exoduser-wt/_out/mac-current-decal-receiver-20261102/installed-before-receiver-preserved.app`에 복사 보존. 교체 직전 앱 프로세스 없음 |
| USER_DATA | 일반 저장·설정 11항목 전후 동일. QA 전용 plist 1개는 QA 실행으로 달라져 시작 전 raw 복사본을 CAS 확인 후 복원, QA plist 2개 최종 전후 동일 |

일반 제품은 파일 전달만 수행했다. 자연 플레이·일반 앱 실행·물리 3840 화면·Windows/PC/공개 배포는 이 판정에 포함하지 않는다. 원본 `Assets/Packages/ProjectSettings`는 제품 빌드 후 복원해 3,537/3,537 일치·불일치 0이다. `unity/Tools/devtools/exo-unity.ps1`과 `unity/Tools/ground-skill/`의 외부 WIP는 수정하지 않았다.

## PC Impact R5 원본 이력 보존

# A2 지면 표준 데칼 수신 — 2026-11-01

상태: 소스 후보·실제 Unity/Shader/Player 미검증, 통합 READY0. 맵 전체 VISUAL VERDICT: RETOUCH를 유지한다. R8 재질·배치 변경과 별개의 두 셰이더 기술 계약이다.

## 원인과 적용

Impact 담당의 실제 MCP e73821a4 진단은 동일 회복 영역·같은 프레임의 off/mesh .016/.08/decal .016/.04/.06/.08을 비교했다. 목교는 투사되지만 흙은 수신하지 않았다. 승인 공통 b673cb3f7a534c367e03c285404342e3769a8bfc 및 R8 b3aca668f005c28d59160b6b31497a8b34425e9b의 두 커스텀 셰이더에는 DBuffer 변종·include·수신 호출이 모두 없다. 설치 URP ffe395a3a1d1의 Lit.shader, LitForwardPass.hlsl, DBuffer.hlsl 원문과 대조했다. 이 기존 실제 RED를 보존하며 새 GPU 실행은 하지 않았다.

| 위치 | 현행 계약 |
|---|---|
| 대상 | Resources/Shaders/HellGroundPBR.shader, A2RootSurface.shader의 Opaque UniversalForward pass |
| 변종 | multi_compile_fragment _ _DBUFFER_MRT1 _DBUFFER_MRT2 _DBUFFER_MRT3. MRT1은 색, MRT2는 색·world normal, MRT3는 금속·AO·smoothness까지 설치 URP 표준 합성 사용 |
| include | Lighting.hlsl 다음 설치 URP ShaderLibrary/DBuffer.hlsl. 자체 수식·중복 DBuffer 구현을 만들지 않음 |
| 적용 순서 | 모든 지면/낙엽/젖음/스캔 표면 계산 완료 → defined(_DBUFFER)에서 ApplyDecalToSurfaceData(i.positionCS,surface,input) → SampleSH(input.normalWS) 재계산 → 기존 UniversalFragmentPBR → 기존 fog. 스캔 색·법선이 투사 결과를 나중에 덮지 않음 |
| 변종 없음 | 새 런타임 호출은 _DBUFFER guard 안에만 존재. receiver 추가 부분을 제외하면 기존 소스 byte와 동일. 실제 무데칼 픽셀 동일성은 GPU 검사 전 |
| 보존 | 지형·충돌·보행·Core·VFX/XY mesh·재질 GUID/속성·R8 RGB 가중식·기존 shadow/depth pass 변경0. Renderer feature와 Impact 후보를 자동 복사하거나 설정 변경하지 않음 |
| 분리 인수 | R8 부모 위의 기술 커밋 전체 브랜치를 병합하지 않는다. 승인 공통 b673 원문에 같은 수신 추가만 적용한 별도 patch/원본·후보 SHA manifest를 I:에 보존. 공통 준비 트리에는 두 셰이더와 이 문서만 포함하며, 미인수 R6/R7/R8 재질·배치·도구 경로를 섞지 않음 |

## 실제 검증과 인수 조건

사용자 도타 보호가 우선이다. 어느 PID든 dota2가 살아 있으면 Unity/Player/빌드/인코딩/무거운 CPU·GPU 검사/브라우저 GPU를 새로 시작하지 않는다. 기존 담당·작업본·공식 FIFO를 유지하며 새 대기자·재예약을 만들지 않는다. 재개는 실제 도타 부재·기존 공식 순번/잠금·메모리·무음·격리 세이브 조건 확인 후에만 한다.

| 확인 | 필요한 근거 / 현재 경계 |
|---|---|
| 소스 | 두 커스텀 셰이더의 수신 누락 및 설치 URP 호출 계약 확인. diff 형식/기술 patch 순수성 검사는 GPU 증거가 아님 |
| Editor | 실제 자기 A2의 두 shader import/변종 오류0. 승인 Renderer의 DBuffer feature 활성·대상 renderer/material·camera/렌더비율 기록. feature 없는 실행은 수신 실패 원인과 분리 |
| 동일 프레임 | 현재 지면·뿌리 흙·목교에서 동일 projector/material·위치·조명·고정 simulation을 사용해 off/on 촬영. 흙·뿌리의 예상 내부 ROI 변화와 투영 경계 바깥 영향 확인, 목교를 양성 대조군으로 사용. 정상/경계/높이 단절을 확인하며 수면 애니메이션 차이를 수신 증거로 세지 않음 |
| 1x 판정 | 1920×1080/3840×1080에서 접지·깊이 단절·두께/테두리·전투 가독성 직접 확인. Impact r5 재질 선택은 Impact 소유이며 이 기술 패치만으로 최종 VFX/맵 아트 PASS를 선언하지 않음 |
| Player | 정확 채택 source → remodel-scenes1 빌드 → 같은 EXE M1 및 실제 투사/전후 화면 → 창·잔여·세이브·종료 안전 영수증. R8 CPU50/Runtime196 및 과거 R6 M1은 이 셰이더 변경의 증거가 아님 |
| 공통/Desktop | 검증 완료 후 기존 통합 담당이 순수 수신 변경만 정상 인수. unity/main/바탕화면 실제 반영 전에는 READY·완료로 승격하지 않음 |

내부 근거: I:/EXODUSER-Storage/demo-art/impact/MCP-r5-회복-同프레임-결과.json 및 mcp-r3-captures/MCP-r5-bridge-heal-*.png. 원문·기술 patch·검수 결과: I:/EXODUSER-Storage/steam-keyshot/a2/field-screen-20261031/decal-receiver/. API 연결 안내는 원격 main의 docs/API연결_가이드.md 관련 구역을 적용했다. 유료 생성/결제0.

## 2026-11-03 실제 스킬 촬영 분기

`--unity-ground-map-capture --unity-ground-skills`는 위 QA 사각 DBuffer projector를 만들지 않고 실제 DispatchSlot→NativeSkillView 수신깊이 장판을 촬영한다. 기존 단독 --unity-ground-map-capture의3개 시험 사각형 경로는 유지한다. 네 지형/폭/슬램 연속컷/QA 배우숨김/기본값과 Mac 실행 인자는 [P0 최신20:20 절](UNITY_GROUND_AOE_P0_20261103.md)에 명시했다. 두 경로의 GPU기술과 결과를 혼용하지 않는다.