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

## 2026-11-02 무데칼 회귀와 옛 import drift 보완 계약

기존 flat off/on과 실제 A2 offA/offB는 6ad 옛 셰이더와 1403 현행 셰이더의 **무데칼 동일 프레임** 비교가 아니다. 기술 수신 양성 PASS와 별개로 이 회귀는 미검수 상태였다. QA 전용 private 브랜치에서 6ad의 두 shader Git blob을 이름 선언만 `EXODUSER/QA/NoDecalBaseline/*`로 바꾼 alias로 포함한다. 현행 제품 shader 두 파일은 1403 byte 그대로 둔다. 같은 Settings QA 앱·카메라·geometry·material property·textures, 모든 DecalProjector disabled 조건에서 flat 흙/뿌리/Lit 및 실제 A2 흙/뿌리의 1920×1080 실창과 3840×1080 직접 RT raw RGBA를 비교한다. raw 변화 0만 완전 동등으로 판정하며 self+4 필터를 사용하지 않는다. 실제 결과는 후속 receipt로 기록한다.

옛 QA 빌드 후 `mismatch=773`, 일반 빌드 후 `mismatch=772` 영수증의 `files` 배열은 **stage가 아닌 source 원문 SHA**다. 따라서 이 배열만으로 변형 파일이 원문과 같다고 판정할 수 없다. QA는 `.meta` 738경로(기존682·신규56), 비-meta 35경로(기존34·신규1); 일반은 `.meta` 738경로, 비-meta 34경로(기존33·신규1)이다. 비-meta에는 URP profile 2, A2 material 29, scene 1, URP global 1, ProjectSettings 1/QA는2가 포함된다. 원본 변형 byte는 복원 전 별도 보관되지 않았으므로 과거 두 빌드의 exact imported byte 재현성은 확정하지 않는다. 경로별 원문 SHA/변형 SHA 부재 목록은 `_out/mac-decal-noeffect-regression-20261102/old-drift-inventory.json`에 보존한다. 새 QA 빌드에서는 복원 전에 stage 원문과 변형 byte/SHA를 모두 보관해 각 영향군을 분류한다.

### QA private `2f58ea2d8b1eba8e4f8b06969bd81fa529a04699` 실제 결과

단일 Settings QA ARM64 빌드는 격리 입력 3,544/3,544 SHA manifest `b6631b4af2610b490671d866e8097300900a3d76bacdd5ceb56a2aeefd76f7ed` 및 비Git 필수 영상2 SHA 고정 후 `Succeeded`/errors0이다. 정확 QA 소스와 개인 원격 SHA를 먼저 일치시켰다. 같은 앱 Metal M1 23/23·firstBlocked 없음·exit0. flat·A2 Player는 전용 sandbox, Listener pause/volume0/peak0/DirectVideo0, drain 뒤 종료했다. 일반 설치 앱은 실행·교체하지 않았고 실행파일·Runtime·Core 3 SHA는 기존 배송값 그대로다. 일반 저장/설정11 및 QA plist2는 최종 전후 byte SHA 동일하다.

| 수신체 | 1920 raw RGBA baseline↔현행 변화 / 현행 반복 변화 | 3840 직접 RT raw RGBA baseline↔현행 변화 / 현행 반복 변화 | 판정 |
|---|---:|---:|---|
| flat HellGroundPBR | 1픽셀·최대1 / 0 | 1픽셀·최대1 / 0 | **완전동등 FAIL**. 같은 세계 픽셀에서 청색 채널 252→253; 1920 `(598,432)`, 3840 `(1558,432)` |
| flat A2RootSurface | 0 / 0 | 0 / 0 | 완전동등 PASS |
| flat URP Lit 양성 대조 | 0 / 0 | 0 / 0 | 대조 안정 PASS |
| A2 전체 프레임 흙 위치 | 40,541·최대12 / 32,909·최대4 | 60,666·최대12 / 49,237·최대4 | **완전동등 FAIL**, 장면 자체 시간 변화 포함 |
| A2 전체 프레임 뿌리 포함 목교 인근 위치 | 37,221·최대15 / 31,334·최대4 | 101,725·최대17 / 93,832·최대5 | **완전동등 FAIL**, 실제 뿌리 단독 ROI가 아님 |

모든 projector를 disable한 결과 발견/활성 0/0, 실제 A2 지면 chunk144·뿌리 renderer79. raw 수치에는 self+4 등 임계값·마스크를 적용하지 않았다. flat 흙의 1픽셀은 반복 노이즈0이므로 완전 동등이라고 바꾸지 않는다. 실제 맵의 baseline↔현행 차분은 현행 반복 차분과 겹치지만 그 자체가 전부 같은 것은 아니다. 화면의 시간 변화가 관찰되어 shader 단독 영향으로 귀속하지 않는다. 기존 양성 DBuffer 수신 PASS는 유지하되 **무데칼 pixel 완전동등 PASS는 주장하지 않는다.** 다음 최소 조치는 시간 의존 장면 요소를 고정하고 실제 뿌리 patch `(36.2916,-73.1713)`를 중심으로 같은 프레임 receiver ROI를 별도로 측정하는 것이다. 현재 검수는 일반 앱 재빌드·재설치나 `unity/main` 반영의 근거가 아니다.

새 QA 빌드의 stage drift는 복원 전에 **기존716경로의 원본·변형 양쪽 바이트/SHA와 신규57경로의 변형 바이트/SHA**를 `_out/mac-decal-noeffect-regression-20261102/stage-drift-bytes/`, `stage-mutation-inventory.json`에 저장했다. 기존716변형·신규57이며 `.meta`는 기존682/신규56, 비-meta는 URP profile2·material29·scene1·URP global1·ProjectSettings 기존1/신규1이다. Mac URP의 `m_PrefilterDBufferMRT3`는 1→0, PC High의 SSAO/DBuffer prefilter도 바뀌었다. 29 material은 URP AssetVersion/직렬화·키워드 순서 정리, 일부 `_BumpScale`의 float 표기 정리이며 눈에 보이는 저장 texture GUID의 교체는 대표 diff에서 없었다. 하지만 직렬화·import·prefilter의 runtime 출력 영향은 자동으로 0이라고 단정하지 않는다. `FirstPlayable.unity`의 local ID/lighting 직렬화와 URP global 등록, ProjectSettings 마이그레이션도 영향을 줄 수 있다. 경로별 35개 비-meta와 738개 meta SHA 및 영향 분류는 `DRIFT_CLASSIFICATION.md`/JSON에 있다. 복원 뒤 격리 입력 3,544/3,544 불일치0이다. 이 새 기록으로 옛 QA/일반 빌드의 사라진 변형 바이트를 소급 복구했다고 주장하지 않는다.
