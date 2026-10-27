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
