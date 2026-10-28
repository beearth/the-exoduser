# Unity RM-0 엔진 기반 — 패키지·렌더 (2026-10-27)

(UNITY_PORT_MASTER는 main에만 있어 이 줄기에 한 절로 둔다. main 반영 시 마스터에 합쳐도 된다.)

렌더 파이프라인 = URP(Gamma 색공간 유지). 기존 이식 게임은 코드 무변경(Core·Runtime diff 0)으로 `--unity-m1-check` 17단계 전부 ok, 1-1 필드·보스전 캡처 전/후 평균 차 0.2~0.7(색감 변화 없음 — 게임 카메라는 Post Processing 꺼짐, Volume은 샌드박스·RM 씬에서만 적용).

| 패키지 | 버전 | 용도 |
|---|---|---|
| com.unity.render-pipelines.universal | 17.6.0 | URP (`Assets/Exoduser/Rendering/URP_PC_High`=Quality High 이상, `URP_Mac_Balanced`=그 아래) |
| com.unity.shadergraph | 17.6.0 | 셰이더 그래프 |
| com.unity.visualeffectgraph | 17.6.0 | VFX Graph (컴퓨트 필요) |
| com.unity.cinemachine | 6.6.0 | 탑다운 카메라 (정사영 5.4, 댐핑 0 = 기존 카메라 구도) |
| com.unity.probuilder | 6.1.4 | 블록아웃 |
| com.unity.ai.navigation | 2.0.16 | NavMesh Surface |
| com.unity.inputsystem | 1.20.1 | 기존 입력과 Both 모드(`activeInputHandler: 2`) |
| com.unity.timeline | 6.6.0 | 연출 |
| com.unity.modules.terrain / terrainphysics / physics / ai | 1.0.0 | 지형·3D 물리·NavMesh |

- 샌드박스 씬: `Assets/Exoduser/Scenes/RM_Sandbox.unity` — XZ 지면 위 Terrain 1·ProBuilder 블록·NavMesh Surface·VFX Graph 샘플·Timeline·Cinemachine(정사영 5.4, 수직 하향)·Global Volume(`Rendering/GlobalVolume_Hell`: ACES·블룸·어두운 붉은 톤 보정·비네트). 재생성: `Unity -batchmode -executeMethod Exoduser.Rm0EngineSetup.Run`, 렌더 캡처: `-executeMethod Exoduser.Rm0EngineSetup.Capture -output <png>`.
- 스프라이트 3D 라이팅: `Resources/Shaders/SpriteLit3D.shader`(URP HLSL — 메인·추가 라이트, 그림자 수신·투사; Shader Graph 아님). 기존 커스텀 셰이더 5종(CG 언릿)·`Sprites/Default`는 URP에서 그대로 동작해 변환 불필요. 샌드박스 스프라이트는 라이트 과노출 — RM-1에서 `_Ambient`·조명 세기 조정 필요.
- Mac(ARM64): Mac 빌드는 이번에 미검증. VFX Graph(컴퓨트/Metal)·Burst·Input System은 Apple Silicon 지원 패키지. `URP_Mac_Balanced` = MSAA 2x·그림자 32m·추가광 6.
- 주의: 게임 씬(코드 생성)은 아직 URP Lit·Volume을 쓰지 않는다. 월드 3D화·카메라 교체는 RM-1 이후.

## RM0-LIGHT — 기본 조명 중립화 (2026-10-27, 아트 바이블 v2 §9 L-5)

원인: `Hell Sun`(1,.62,.5)×1.1 + Volume colorFilter(1,.93,.9)가 흑철 갑옷·강철 대검·바닥을 모두 구리색으로 덮었다. 진홍은 키 라이트가 아니라 빛 웅덩이(`Pool_Hell_Test`)에서 나온다. 값은 `Rm0EngineSetup`의 상수 한 곳(`ApplyHellLighting`)이 정의하고 샌드박스·캡처 도구가 같이 쓴다. `-executeMethod Exoduser.Rm0EngineSetup.ApplyLight`는 기존 씬·Volume 에셋을 같은 값으로 덮어쓰며 다시 돌려도 결과가 같다(에셋·씬·큐브맵 sha256 동일 확인).

| 항목 | RM-0 이전 | 명세 값 | 최종 값(적용) | 비고 |
|---|---|---|---|---|
| Hell Sun 색 | (1,.62,.5) | (1,.80,.70) | **(1,.95,.92)** | 명세 값에서는 갑옷 R/G 1.44·바닥 2.0으로 게이트 초과 → 조정 1회 |
| Hell Sun 세기 / 그림자 강도 | 1.1 / 1 | 0.6 / 0.85 | **0.6 / 0.85** | 각도 (52,-35,0)·Soft 그대로 |
| 앰비언트 | 기본 스카이박스 | Trilight sky(.16,.16,.18) eq(.12,.09,.085) gnd(.05,.035,.03) | **sky(.16,.16,.18) eq(.11,.10,.095) gnd(.05,.04,.036)** | 옆·아래 난색을 중립 쪽으로 |
| 환경 반사 | 기본 | Custom 큐브맵 위(.30,.31,.34)/수평(.18,.15,.14)/아래(.06,.045,.04), 강도 0.6 | **위(.48,.49,.53)/수평(.24,.22,.21)/아래(.06,.045,.04), 강도 1.0** | `Remodel/Common/Lighting/Env_NeutralSteel.cubemap`(64px). B안(맵 총괄 채택): 날 상위 5% 휘도 0.179→0.234, 수치 3종 A안과 같거나 이상(날 채도 7.3%·갑옷 R/G 1.23·바닥 R/G 1.67~1.74) |
| Volume colorFilter | (1,.93,.9) | (1,.97,.95) | **(1,.98,.97)** | 나머지(ACES·노출 -0.15·대비 10·채도 -8·블룸·비네트) 그대로 |
| `Pool_Hell_Test` | 없음 | Point #b0281c 반경 3.5 세기 2.0 | **Point #b0281c 반경 3.5 세기 3.0**, 위치 (-3,0.3,-2.5) | 샌드박스 시험용. 진홍 숨쉬기·빛줄기는 RM-1 |

- 버그 수정: RM-0에서 저장된 `GlobalVolume_Hell.asset`은 컴포넌트가 비어 있었다(Volume 컴포넌트를 에셋에 서브 에셋으로 추가하지 않음). 이제 `AddObjectToAsset`으로 저장하고 기존 null 항목을 정리한다.
- 검증(같은 카메라·1600×900, 전사+대검, 웅덩이 밖): 날 채도(상위 5% 휘도) 중립 7.9% / 이전 17.6% / 새 값 **7.3%**, 갑옷 몸통 R/G 중립 1.13 / 이전 1.39 / 새 값 **1.22**, 샌드박스 바닥 R/G **1.71~1.78**(B≤G). 웅덩이 안 캐릭터 테두리 L\*(왼쪽 반 상위 5%)는 새 값 21으로 기준 55에 못 미친다(웅덩이 밖 11). 진홍 #b0281c 자체의 L\*가 약 38이라 순수 진홍 테두리로는 55에 닿기 어렵다 → 맵 총괄·디자인총괄 판정 사항.
- 알려진 한계: 약한 키(0.6) 때문에 전사·대검이 전체적으로 어둡다(갑옷 몸통 선형 휘도 ≈0.05). 톤 판정은 디자인총괄.

## 색공간 Linear 전환 (2026-10-28)

| 항목 | 내용 |
|---|---|
| 변경 | `ProjectSettings.asset` `m_ActiveColorSpace: 0(Gamma) → 1(Linear)` 한 줄. 위 머리말의 "Gamma 색공간 유지"는 이 날짜부터 무효 |
| 이유 | URP의 HDR 블룸·ACES 톤매핑·라이팅은 Linear 기준이다. 후처리(렌더러 postProcessData·카메라 renderPostProcessing)가 처음 켜지는 이번 공유 렌더 변경과 같은 시점에 맞춘다. Gamma에서 후처리를 켜면 RM_Sandbox가 거의 검게 눌린다(평균 RGB 35.9/19.7/18.6 → 5.7/0.7/0.6) |
| 결정 | 유니티 총괄 (2026-10-28) |
| 실행 | RM-1 VFX 세션 (브랜치 `claude/unity-pc-vfx-shared-render-20261028`, 공유 렌더 커밋 다음의 별도 커밋) |
| 소유 | RM-0 (엔진 기반) |
| 빌드 경로 정정 | `PortVerification.MakeScene`에서 남아 있던 `PlayerSettings.colorSpace=ColorSpace.Gamma` 강제 할당을 제거한다. 기존 빌드 진입 시 소스의 Linear 1이 Gamma 0으로 변경돼 Player 캡처가 현재 색공간 결정을 반영하지 못했다. 이후 빌드는 `ProjectSettings.asset`의 Linear 1을 유지해야 한다. 2026-10-28 Unity 2차 통합에서 발견·정정. |
| 되돌리기 | 이 커밋만 revert |
