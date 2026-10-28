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

- 샌드박스 씬: `Assets/Exoduser/Scenes/RM_Sandbox.unity` — XZ 지면 위 Terrain 1·ProBuilder 블록·NavMesh Surface·VFX Graph 샘플·Timeline·Cinemachine(정사영 5.4, 수직 하향)·Global Volume(`Rendering/GlobalVolume_Hell`: Neutral(톤매핑)·블룸·어두운 붉은 톤 보정·비네트). 재생성: `Unity -batchmode -executeMethod Exoduser.Rm0EngineSetup.Run`, 렌더 캡처: `-executeMethod Exoduser.Rm0EngineSetup.Capture -output <png>`.
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
| 되돌리기 | 이 커밋만 revert |

## RM0-LIGHT-L — Linear·후처리 기준 재조정 (2026-10-28)

기준: origin/unity/main `c7b497131`(Linear `m_ActiveColorSpace: 1`, 렌더러 `postProcessData` 연결). 명세 `E:/exoduser-wt/_out/rm0-light/SPEC.md` §7.

**후처리가 실제로 적용되는지(켬/끔 1쌍, 같은 구도·postExposure −0.15):** 화면 중앙값 4.1(켬) vs 36.8(끔)로 크게 다르다 → ACES·색보정·블룸이 화면에 그려진다. 이전 Gamma 값(Gamma B안)은 후처리가 꺼진 화면의 값이었다.

**Gamma B안 기준값(내 측정법, 같은 캡처):** 화면 중앙값 22.0(임펙트 총괄 측정 23.7과 방법 차이, 목표는 23.7 이상) · 샌드박스 바닥 luma 21.9 · 캐릭터 샷 바닥 luma 27.8 · 웅덩이 바닥 색상각 8.6° · 날 상위 5% 채도 7.3 % · 갑옷 R/G 1.23 · 바닥 R/G 1.74/1.74/1.67(B≤G 충족).

**postExposure 스윕(한 번의 batch, −0.15~3.00, 0.25 간격):** luma는 sRGB 값의 휘도(0~255), 바닥 R/G는 샌드박스 3개 패치.

| 단계 | 화면 중앙값 | 샌드박스 바닥 | 캐릭터 샷 바닥 | 웅덩이 색상각 | 날 채도 | 갑옷 R/G | 바닥 R/G | B≤G |
|---|---|---|---|---|---|---|---|---|
| postExposure -0.15 | 4.1 | 3.9 | 3.8 | 8.9° | 10.6% | 1.500 | 2.25/2.00/2.33 | O |
| postExposure -0.15_ppoff | 36.8 | 36.5 | 38.8 | 9.9° | 5.2% | 1.156 | 1.35/1.31/1.33 | O |
| postExposure 0.10 | 5.3 | 5.1 | 5.0 | 9.6° | 9.6% | 1.500 | 2.20/2.67/2.25 | O |
| postExposure 0.35 | 7.2 | 6.3 | 6.9 | 10.9° | 9.3% | 1.429 | 2.17/2.00/2.20 | O |
| postExposure 0.60 | 8.7 | 7.8 | 8.4 | 11.5° | 8.7% | 1.400 | 2.12/2.00/2.17 | X |
| postExposure 0.85 | 11.2 | 10.5 | 10.6 | 11.8° | 8.2% | 1.385 | 1.82/1.88/1.78 | O |
| postExposure 1.10 | 14.3 | 12.9 | 13.7 | 11.7° | 7.6% | 1.357 | 1.71/1.90/1.82 | O |
| postExposure 1.35 | 17.6 | 16.1 | 16.9 | 11.5° | 7.1% | 1.333 | 1.65/1.77/1.71 | O |
| postExposure 1.60 | 21.5 | 19.6 | 20.4 | 11.5° | 6.7% | 1.308 | 1.62/1.69/1.65 | X |
| postExposure 1.85 | 25.8 | 23.8 | 24.5 | 10.6° | 6.2% | 1.294 | 1.60/1.60/1.57 | X |
| postExposure 2.10 | 30.6 | 28.5 | 29.7 | 9.9° | 5.8% | 1.281 | 1.57/1.54/1.50 | O |
| postExposure 2.35 | 36.3 | 33.8 | 35.3 | 11.3° | 5.3% | 1.269 | 1.57/1.57/1.53 | X |
| postExposure 2.60 | 42.5 | 39.6 | 41.0 | 14.4° | 4.9% | 1.259 | 1.54/1.53/1.50 | O |
| postExposure 2.85 | 50.0 | 46.1 | 47.6 | 13.8° | 4.6% | 1.250 | 1.46/1.54/1.50 | O |
| postExposure 3.00 | 56.0 | 51.4 | 53.9 | 13.7° | 4.4% | 1.237 | 1.43/1.51/1.45 | O |

**선택: postExposure 1.85.** 목표에 가장 가까운 값이다 — 화면 중앙값 25.8(≥ 23.7) · 샌드박스 바닥 23.8(Gamma B 21.9의 +9 %, ±15 % 안, FLOOR-HI 50 미만) · 캐릭터 샷 바닥 24.5(−12 %) · 웅덩이 색상각 10.6°(350~12° 안) · 날 채도 6.2 %(≤ 15 %) · 바닥 R/G 1.57~1.60(1.5~1.8). 가장자리는 부드럽게 어두워질 뿐 검게 먹히지 않아 vignette은 조정하지 않았다. 웅덩이 색상각이 12° 안이라 Tonemapping Neutral 비교 컷은 만들지 않았다.

**기준을 못 맞춘 두 항목(8비트 어두운 값의 양자화 근처):**
- 갑옷 R/G 1.294(기준 ≤ 1.25): 가슴 중앙값 RGB (27, 21, 19).
- 바닥 `B ≤ G`: 오른쪽 위 패치 한 곳이 (33, 21, 22)로 B가 G보다 1단계 높다.
- colorFilter를 한 번 조정해 봤다((0.98, 1.0, 0.95), 단일 시도): 갑옷 R/G 1.18·B≤G는 맞았지만 웅덩이 색상각 17.5°(>12°)·바닥 R/G 1.41~1.48(<1.5)로 더 나빠져 **채택하지 않고 기존 colorFilter (1, .98, .97)를 유지**했다. 항목당 한 번 규칙에 따라 colorFilter는 더 조정하지 않았다. 남은 선택지: ① 두 항목을 8비트 양자화 오차로 보고 수용 ② colorFilter를 더 약하게(예 (.99, 1, .97)) ③ 광원값(Sun·Trilight) 조정 — 맵 총괄 결정.

**반영:** `Rm0EngineSetup.PostExposure = 1.85f` 상수로 올리고 `ApplyLight`로 `GlobalVolume_Hell.asset`의 postExposure만 −0.15 → 1.85로 바꿨다(다른 값·씬·렌더러 변화 없음, 씬 해시 동일).

### 톤매핑 Neutral (디자인총괄 2차 PASS 조건, 2026-10-28)

- 디자인총괄이 postExposure 1.85를 2차 PASS로 확정하면서 **톤매핑을 Neutral로 바꾸는 조건**을 붙였다. `Rm0EngineSetup.CreateVolumeProfile`의 `TonemappingMode.ACES` → `TonemappingMode.Neutral`, `GlobalVolume_Hell.asset`의 Tonemapping `mode` m_Value 2(ACES) → 1(Neutral). 다른 값(노출 1.85·대비 10·채도 −8·colorFilter·블룸·비네트)은 그대로다.
- 위의 "웅덩이 색상각이 12° 안이라 Neutral 비교 컷은 만들지 않았다"는 ACES 기준의 판정이었다. Neutral은 색상 곡선이 달라 **웅덩이 색상각(350~12°)·화면 중앙값(≥ 23.7)·바닥 R/G(1.5~1.8)·날 채도(≤ 15 %)를 다시 재야 한다.** 재측정은 맵 총괄이 하며, 캡처는 같은 구도(`Rm0LightCapture` 스윕 하니스)로 낸다.
- 확인 상태: 값 변경만 했고 **재측정·플레이어 빌드 미확인**.

### Neutral 톤매핑 노출 재선택 (맵 총괄 규칙, 2026-10-28)

톤매핑을 Neutral로 바꾸면 같은 노출이 ACES보다 밝아진다(1.85에서 샌드박스 바닥 휘도 32.0, Gamma B 21.9의 +46 %). 맵 총괄이 노출 1.3 / 1.4 / 1.5 / 1.6을 같은 하니스(`Rm0LightCapture.Sweep`, 에디터 batch + GPU RenderTexture, `measure_L.py`)로 재측정하도록 했고, 선택 규칙은 ① 샌드박스 바닥 18.6~25.2(Gamma B 21.9042 ±15 % = 18.619~25.190) ② 화면 중앙값 ≥ 23.7 ③ 색 기준 전부 유지(웅덩이 350~12°, 날 채도 ≤ 15 %, 갑옷 R/G ≤ 1.25, 바닥 R/G 1.5~1.8, B ≤ G)를 모두 만족하는 값 중 가장 밝은 것이다.

| postExposure (Neutral) | 화면 중앙값 | 바닥 휘도 | 캐릭터 샷 바닥 | 웅덩이 색상각 | 날 채도 | 갑옷 R/G | 바닥 R/G | B ≤ G |
|---|---|---|---|---|---|---|---|---|
| 1.30 | 27.3 | **25.189** | 31.5 | 8.7° | 9.9 % | 1.235 | 1.72/1.76/1.73 | O |
| 1.40 | 28.5 | 26.3 (밖) | 32.7 | 9.0° | 9.2 % | 1.240 | 1.73/1.77/1.70 | O |
| 1.50 | 29.8 | 27.5 (밖) | 33.9 | 8.8° | 9.1 % | 1.240 | 1.68/1.78/1.71 | O |
| 1.60 | 31.2 | 28.7 (밖) | 35.8 | 9.1° | 9.0 % | 1.238 | 1.69/1.75/1.72 | O |
| 1.85 (참고) | 34.7 | 32.0 (밖) | 39.3 | 10.1° | 9.3 % | 1.234 | 1.72/1.74/1.71 | O |

**선택: postExposure 1.30.** 규칙 ①②③을 모두 만족하는 격자 값은 1.30 하나다. 바닥 휘도 25.189는 상한 25.190에 0.001 차이로 붙은 값이라 여유가 없다(여유가 필요하면 1.25 등 더 낮은 값을 한 번 더 재면 된다). `Rm0EngineSetup.PostExposure = 1.3f`, `GlobalVolume_Hell.asset`의 postExposure 1.85 → 1.3 (톤매핑 Neutral은 앞 절). 캡처 하니스의 `CinemachineBrain.ManualUpdate` 오류(`UpdateMethod`가 ManualUpdate가 아닐 때 호출)는 캡처 직전에 `UpdateMethod = ManualUpdate`로 두어 없앴다(씬은 저장하지 않음, 새 스윕 로그 0건).
