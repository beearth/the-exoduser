# 제작 도구·Unity 커스텀안 — "뭘로 만들면 목표에 가장 가까워지나" (2026-11-05, 레인 TC)

- 배정: 클라우드 CTO, 레인 TC(조사·설계 문서만, 코드 무수정). 기준 커밋 unity/main `75add6ff4`.
- 목표(사용자): 분위기·광원·안개는 Downfall of Yellowsky(黄天逆途), 환경·HUD·전투 가독성은 D4·PoE2, 임팩트는 Phantom Blade Zero.
- 범위 갱신(11-05 CTO): 사용자가 Unreal 전환도 검토하라고 했다. 엔진 비교와 전환 권고는 레인 ENG(`claude/unity-cloud-engine-decision-20261105`)가 맡는다. 이 문서는 Unity 기준안을 그대로 쓰되, 요소마다 "UE5에서는 같은 걸 어떻게 하나" 칸을 둔다.
- 전제: Unity 6000.6.7f1 URP 17.6.0(현 제품 엔진), 1-1 원근 피치 34°·거리 16.5u LOCK, 2.5D(3D 지형·소품 + 리깅 3D → 실시간 저해상도 픽셀 캐릭터), Mac M5 Pro(빌드·판정) + Windows PC(컴파일), 소규모 팀 + AI 에이전트, 생성 도구 Meshy·Tripo·Kling(승인 범위), 유료 에셋은 사용자 승인.
- 함께 읽은 연구 레인(원격 브랜치, 11-05): D4 01 환경(`claude/unity-cloud-d4-study-20261105`), D4 02 HUD(`…-d4-study-ui-…`), D4 03 카메라·가림(`…-d4-study-combat-…`), D4 04 동작·VFX(`…-d4-study-boss-…`), PoE2(`…-poe2-study-…`), Phantom Blade Zero(`…-phantomblade-study-…`), Yellowsky(`…-yellowsky-study-…`). 이 문서는 그 결정안들과 **충돌하는 곳을 표시하고 하나로 고른다**.

## 표기

- **[사실]** 출처 URL 또는 우리 코드 `파일:줄`로 확인. **[단일]** 출처 1개. **[추정]** 근거 없는 판단·견적(작업량·ms 예산 포함). **[제안]** 이 문서의 결정안(CTO·사용자 승인 전).
- 코드 경로는 `unity/Assets/Exoduser/` 아래를 줄여 `Runtime/…`, `Editor/…`로 쓴다. 에셋 경로는 unity/main 기준.
- 비교 기준 5개: **품질 상한 · 속도 · 비용 · AI 에이전트 친화(텍스트·스크립트로 만들고 검사할 수 있나) · Mac(Metal)에서 되나**.

---

## 0. 결론 먼저

| 요소 | 추천 제작 경로(Unity) [제안] | 한 줄 이유 | UE5에서는 같은 걸 (기능명) |
|---|---|---|---|
| 지형 | **Unity Terrain(넓은 바닥) + Blender 메시 조각(늪가·둑·다리 접합)**, 재질은 **Terrain Lit Shader Graph(높이 블렌드)** | 지금 Terrain이 이미 판정 바닥이다. 손으로 다듬을 경계만 메시로 떼어 낸다 | Landscape + Landscape Layer Blend(Height Blend) 재질, 경계는 Static Mesh |
| 재질 | **Substance 3D Designer(승인 시)** / 미승인 시 **Blender 베이크 + Shader Graph 절차 재질** | D4가 쓴 방식. 반복 타일 4종이면 충분 | 같은 외부 도구 + Material Editor(Material Instance), Fab/Quixel 재질 |
| 소품·데코 | **Blender 키트(손 조형) + Meshy/Tripo 생성 → Remesh → Blender 정리**, 배치는 **우리 군집 브러시(§3c-1)** | 유료 팩은 톤 재작업이 크고 남과 같은 얼굴이 된다 | 같은 외부 제작 + PCG 프레임워크(규칙 배치), Foliage Mode |
| 광원 | **Forward+ 전환 + 그림자 광원 수 제한 + APV(간접광)** | 오브젝트당 8개 한계(현 Forward)를 없앤다 | Deferred 기본 + Lumen(실시간 GI·반사) + Virtual Shadow Maps |
| 안개·대기 | **우리 `HellFogFeature` 확장(높이 안개 + 광원 산란, Render Graph로 재작성)**, 서드파티는 비교 시험용만 | URP에는 볼류메트릭 안개가 없다. 이미 16단계 레이마치가 있다 | Exponential Height Fog + Volumetric Fog(기본 기능), 광원별 Volumetric Scattering Intensity |
| 후처리 | **URP Volume + LUT(DaVinci Resolve) + 분위기 프리셋 툴(§3c-2)** | 하드코딩된 색 수치를 데이터로 뺀다 | Post Process Volume + Color Grading LUT, 프리셋은 Data Asset·Level Instance |
| 캐릭터·몬스터·보스 | **Blender 조형·Rigify 손키 → Animator → 우리 "픽셀 액터 패스" Renderer Feature(§3a-1)** | 지금 액터마다 카메라 요청을 따로 보낸다. 패스 하나로 묶는다 | Animation Blueprint + Control Rig(IK), 픽셀화는 SceneCapture2D→저해상도 Render Target 또는 커스텀 패스(엔진 소스 수정 또는 SceneViewExtension) — 기본 기능 없음 |
| VFX | **Shuriken + Shader Graph**(타격·예고·장판), **VFX Graph는 대량 환경 입자(재·불씨)만** | 연구 3건 일치 | Niagara(CPU·GPU 시뮬 한 도구), Decal Actor |
| HUD/UI | **v0는 현행 IMGUI 유지**, v0 뒤 HUD만 **UGUI**로 이전 검토 | 연구 D4-02와 일치. UI Toolkit은 커스텀 머티리얼에 약하다 | UMG(+CommonUI), UI Material |
| 사운드 | **Unity Audio Mixer + 자체 SfxPlayer** | 미들웨어 비용·빌드 위험이 이득보다 크다 | MetaSounds + Sound Class/Submix, Sound Concurrency |
| 판정·자동화 | **키샷 비교판 자동 캡처 + 예산 검사기 + 임포트 규칙**(§3c·§3d) | "나아짐 또는 같음" 규칙(DIRECTION_RESET)을 기계가 먼저 거른다 | Movie Render Queue·High Res Screenshot, Editor Utility Widget·Python 에디터 스크립트, Data Validation, Commandlet |

UE5 칸은 11-05 CTO 범위 갱신(엔진 비교 레인 ENG의 재료)으로 넣었다. 기능 이름과 기본 지원 여부만 적었고, 품질·속도·비용 비교와 전환 판단은 ENG 레인이 한다. 출처는 §8 W34~W38이고, 출처를 달지 않은 UE5 기능명은 [일반 지식·문서 미첨부]다.

가장 먼저 만들 것(§5): ① 키샷 비교판 캡처 ② 분위기 프리셋 ③ Forward+·안개 정비 → 이 셋이 있어야 "Yellowsky 같은 분위기"를 숫자와 그림으로 반복 비교할 수 있다.

---

## 1. 지금 우리 렌더 상태 (사실 확인)

| 항목 | 값 | 근거 |
|---|---|---|
| 엔진·패키지 | Unity 6000.6.7f1, URP 17.6.0, Shader Graph 17.6.0, VFX Graph 17.6.0, Cinemachine 6.6.0, ProBuilder 6.1.4, Timeline 6.6.0, MCP for Unity(CoplayDev) | `unity/ProjectSettings/ProjectVersion.txt:1`, `unity/Packages/manifest.json:3-30` |
| 렌더 파이프라인 에셋 2개 | `URP_Mac_Balanced`(품질 Very Low~Medium), `URP_PC_High`(High~Ultra). 에디터 기본 품질 5(Ultra) | `ProjectSettings/QualitySettings.asset:7,51,104,157,210,263,316`, 각 `.asset.meta` guid |
| 렌더링 경로 | 둘 다 **Forward**(`m_RenderingMode: 0`), 추가 광원 오브젝트당 6(Mac)/8(PC) | `Rendering/URP_*_Renderer.asset:49`, `Rendering/URP_*.asset:48` |
| 그림자 | Mac 1024·32u·2캐스케이드·추가광 그림자 없음 / PC 2048·45u·3캐스케이드·추가광 그림자 있음 | `Rendering/URP_*.asset:46-58` |
| MSAA·HDR | Mac 2x, PC 4x, HDR 켬, 업스케일 없음(`m_UpscalingFilter: 0`) | `Rendering/URP_*.asset:26-30` |
| 렌더러 피처 | Mac: **Decal만**. PC: **SSAO(`HellSsaoFeature` "지옥 필드 접촉음영") + Decal + 높이 안개(`HellFogFeature` "지옥 필드 높이 광산란")** | `Rendering/URP_Mac_Balanced_Renderer.asset:27-28,57-67`, `URP_PC_High_Renderer.asset:13,39,116` |
| 안개 구현 | `FullScreenPassRendererFeature` 상속, 3D 카메라에서만, 옵션으로 끔. 셰이더는 깊이에서 월드 좌표 복원 → **16단계 레이마치**, 화로 위치 광원이 셰이더에 하드코딩 | `Runtime/HellFogFeature.cs:4-9`, `Resources/Shaders/HellHeightFog.shader:16-31`, 설치 `Editor/KeyshotRenderSetup.cs:24-26`(BeforeRenderingPostProcessing) |
| 고정 안개·환경광 | Trilight 환경광, Exp² 안개 청록 `(.035,.065,.085)` 밀도 .023, A2에서는 Linear 19→62 `(.105,.145,.17)` | `Runtime/NativeGame.HellLighting.cs:84-92` |
| 후처리 | ACES, 노출 +.25, 대비 16, 채도 −8, Split Toning, Bloom 임계 1.1·강도 .16, 비네트 .13, 그레인 끔 — **코드에 하드코딩** | `Runtime/NativeGame.HellLighting.cs:27-33` |
| 카메라 | 기본 프로필 피치 48.70°·거리 14·FOV 46.95(json), **ForestA2일 때 34°·16.5u** | `Resources/Data/remodel_camera.json`, `Runtime/NativeRemodel3D.cs:17-18` |
| 픽셀 캐릭터(영웅) | 리깅 모델을 별도 레이어(30)로, **직교 캡처 카메라 + `SubmitRenderRequest`** → Point 필터 RT(최대 1024, 32 단위) → 쿼드 합성. 앵커를 화면 픽셀에 스냅. 기본은 꺼져 있고 `--hero-render=rigpixel`로만 켬 | `Runtime/NativeRigPixelHero.cs:10,50-56,220-246`, `Runtime/NativeRigPixelPolicy.cs:39-56`, 스냅 `Runtime/NativeHd2D.cs:148-165` |
| 픽셀 캐릭터(적) | 공유 캡처 카메라 1대, 레이어 28, **보이는 액터마다 RT 1장** | `Runtime/NativeEnemyRigRenderer.cs:5-11` |
| 스프라이트 액터 | HD2DSpriteLit 머티리얼 + 접촉 그림자 쿼드(폭 .24~2.8) | `Runtime/NativeHd2D.cs:58-131` |
| HUD | **IMGUI**(`OnGUI` 17개 파일, `GUI.matrix` 배율) | `grep "void OnGUI" Runtime/*.cs` = 17, 예 `Runtime/NativeHud.cs:112-114` |
| 장면 조립 | 소품·광원 좌표가 코드에 있다(예: 화로 5개 타일 좌표) | `Runtime/NativeGame.HellLighting.cs:69-75` |
| 촬영 | 3D 카메라에 `SingleCameraRequest`로 RT 촬영 후 밝기 로그 | `Runtime/NativeGame.A2Forest.cs:476-489` |

**확인된 위험 3개**

1. **Mac 판정 화면에 안개·SSAO가 없을 수 있다.** 안개·SSAO 피처는 PC 렌더러에만 있다(위 표). Mac 판정 빌드가 Very Low~Medium 품질로 뜨면 `URP_Mac_Balanced`가 쓰여 분위기 판정이 PC와 다르다. Mac 플레이어의 기본 품질 단계는 **미확인**(플랫폼별 기본값은 저장소에서 확인 못 함). → §5 S1에서 판정 캡처 인자에 품질 단계를 고정하고, Mac 렌더러에도 안개 단계(저비용판)를 넣는다 [제안].
2. **분위기 수치가 코드 안에 흩어져 있다**(`HellLighting.cs:27-41,84-92`, `HellHeightFog.shader`의 화로 좌표). 바꿀 때마다 코드 수정·컴파일이 필요하고 A/B 비교가 어렵다. → §3c-2 분위기 프리셋.
3. **픽셀 액터마다 카메라 렌더 요청이 따로 나간다**(`NativeRigPixelHero.cs:245-246`, 적은 액터당 RT). 적 수십 마리에서 비용이 선형으로 는다. 측정값 속성은 이미 있다(`NativeRigPixelHero.cs:26-27` `RenderCount`·`RenderMilliseconds`). → §3a-1.

---

## 2. 요소별 "가장 가까워지는 제작 경로"

각 요소: 후보 2~3개 → 비교(품질 상한/속도/비용/AI 친화/Mac) → 추천 1개. 비교 칸의 ◎○△×는 상대 평가 [추정].

### 2-1. 환경 — 지형(바닥 형태)

| 후보 | 품질 상한 | 속도 | 비용 | AI 친화 | Mac |
|---|---|---|---|---|---|
| A. Unity Terrain + Terrain Lit Shader Graph | ○ 넓은 면 좋음, 급경사·둑 가장자리 늘어짐 | ◎ 이미 있음 | 0 | ○ 하이트맵·알파맵이 PNG/데이터라 스크립트로 쓰기 쉬움 | ◎ |
| B. Blender 메시 지형(조각 프리팹, 정점색 블렌드 마스크) | ◎ 경계·접합을 손으로 다듬음 | △ 조각마다 모델링 | 0 | ○ Blender Python으로 생성 가능 | ◎ |
| C. A+B 혼합: Terrain은 걷는 바닥, 늪가·둑·다리 접합·고목 뿌리만 메시, 경계는 데칼로 이음 | ◎ | ○ | 0 | ○ | ◎ |

- 근거: Unity 6.3부터 Terrain 셰이더를 Shader Graph로 만들 수 있다(URP Terrain Lit Shader Graph) [사실] — https://docs.unity3d.com/Manual/terrain-shader-graph.html , https://discussions.unity.com/t/terrain-shaders-in-shader-graph-new-in-unity-6-3/1683627 . 레이어 4개 한계·다중 패스는 포럼 사용자 보고뿐 [단일].
- 연구 충돌: D4-01은 Terrain 칠하기(G-4), PoE2 E1은 메시 지형을 추천했다. 우리 장면은 이미 Terrain이 판정 바닥이고(`NativeRemodel3D.cs:14` `Ground` Terrain, `GroundY`로 Core 점을 올린다), A2는 뿌리·늪가를 별도 메시·셰이더로 만든다(`Resources/Shaders/A2RootSurface.shader`, `A2ToxicRiver.shader`).
- **추천 C [제안].** Core 판정 바닥(`GroundY`)을 바꾸지 않고, 눈에 거슬리는 경계만 메시로 교체한다. 메시 조각은 Blender 8×8m 단위(PoE2 E1 수치 차용), Terrain 높이와 0.02u 이내로 맞추는 검사를 예산 검사기(§3c-5)에 넣는다.

- **UE5에서는:** Landscape(하이트맵·레이어 칠하기) + Landscape Layer Blend 노드의 Height Blend [단일·W38], 경계 조각은 Static Mesh + Modeling Mode [일반 지식]. Core 판정 바닥과 맞추는 일은 엔진과 무관하게 남는다.

### 2-2. 환경 — 재질

| 후보 | 품질 | 속도 | 비용 | AI 친화 | Mac |
|---|---|---|---|---|---|
| A. Substance 3D Designer/Painter | ◎ D4가 쓴 방식 | ○ | 구독(가격 미확인 → 사용자 승인) | △ 노드 그래프는 GUI 중심 | ◎ Mac판 있음 [추정] |
| B. Blender 절차 재질 → 베이크(PNG) | ○ | ○ | 0 | ◎ Python으로 베이크 자동화 | ◎ |
| C. 사진 텍스처·유료 재질 팩 | ○ | ◎ | 팩 비용 | ○ | ◎ |

- 근거: D4 환경 재질은 Substance Designer(지형 세트·반복 타일) 중심 — D4-01 §0 ④(원 출처는 그 문서 목록).
- **추천 B로 시작, 지형 타일 4종이 1x에서 부족하면 A를 사용자 승인 요청 [제안].** 이유: 키샷 1장에 필요한 타일은 흙·이끼·진흙·돌 4종이고, 높이맵이 있어야 높이 블렌드가 된다 — B로 높이·노멀·알베도를 함께 굽는다. "점 금지"(CLAUDE.md 4.2-7) 때문에 고주파 노이즈는 넣지 않는다.

- **UE5에서는:** 같은 외부 도구(Substance·Blender) + Material Editor·Material Instance, Fab 재질 라이브러리 [일반 지식].

### 2-3. 환경 — 소품·데코

| 후보 | 품질 | 속도 | 비용 | AI 친화 | Mac |
|---|---|---|---|---|---|
| A. 유료 환경 팩 개조 | ○ (톤 재작업 큼, 남과 같은 얼굴) | ◎ | 팩 비용(승인) | ○ | ◎ |
| B. Meshy·Tripo 생성 → Remesh → Blender 정리 | ○ (형태 결함 위험) | ◎ | 크레딧(승인 범위) | ◎ API | ◎ |
| C. Blender 손 조형 키트 | ◎ | △ | 0 | ○ | ◎ |

- 근거: Meshy Remesh API는 목표 폴리곤 100~300,000, 쿼드/삼각 선택 [단일·공식 문서] — https://docs.meshy.ai/en/webapp/guides/3d-model/remesh . Tripo Smart Mesh(리토폴) 30크레딧 [단일·Tripo 블로그] — https://www.tripo3d.ai/blog/high-poly-to-low-poly-textured . 보스는 Meshy 본체가 같은 큰 형태 결함으로 두 번 FAIL해 부위별 조형으로 바꿨다(D4-04 §e, CLAUDE.md 4.1 "제작법 변경").
- **추천: 큰 소품(고목·바위·화로 등 키샷 주인공)은 C, 무리를 채우는 중·소 소품은 B [제안].** 배치는 손이 아니라 군집 브러시(§3c-1)로 결정적(시드)으로 한다. A는 쓰지 않는다(톤·고유성).

- **UE5에서는:** 생성·리토폴은 같은 외부 도구, 배치는 PCG 프레임워크(그래프로 규칙 배치, 기본 제공) [단일·W38] 또는 Foliage Mode [일반 지식]. 우리 c-1 군집 브러시가 하는 일을 엔진 기본 기능으로 대신할 수 있다.

### 2-4. 광원

| 후보 | 품질 | 속도 | 비용 | AI 친화 | Mac |
|---|---|---|---|---|---|
| A. Forward 유지(오브젝트당 8) | △ 횃불·스킬광 겹치면 끊김 | ◎ | 0 | ◎ | ◎ |
| B. **Forward+** | ○ 오브젝트당 제한 없음, 카메라당 데스크톱 256 | ◎ 렌더러 키 1개 | 0 | ◎ | ◎ [추정] |
| C. Deferred | ○ | ○ | 0 | ◎ | ○ MSAA 제약 [추정] |

- 근거: Forward+는 오브젝트당 광원 제한이 없고 카메라당 데스크톱 256개; Forward는 주광 1 + 추가 8 [사실] — https://docs.unity3d.com/Manual/urp/rendering-paths-introduction.html , https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@17.0/manual/rendering/forward-plus-rendering-path.html
- 간접광: APV(Adaptive Probe Volumes)는 URP에서 쓸 수 있고 픽셀 단위 프로브 샘플링, 4×4×4 브릭 [사실] — https://docs.unity3d.com/Manual/urp/probevolumes-concept.html , https://unity.com/blog/engine-platform/new-ways-of-applying-global-illumination-in-unity-6 . APV와 Forward+ 함께 쓰기는 문서에서 직접 확인 못 함 → Mac 시험으로 확인.
- **추천 B + APV + "그림자 광원 ≤ 4, 무그림자 점광원 ≤ 16/화면"(PoE2 R2 수치) [제안].** 픽셀 액터는 별도 레이어 직교 캡처라 씬 광원을 직접 받지 않고 코드로 옮겨 받는다(`NativeRigPixelHero.cs:13-15` 점광원 4개 배열). Forward+ 전환 뒤에도 이 4개 한도는 그대로이므로, 픽셀 액터용 "가까운 광원 4개 고르기" 규칙을 문서화한다.

- **UE5에서는:** Deferred 기본, 광원 수 제한 대신 비용 관리, 간접광은 Lumen 실시간 GI, 그림자는 Virtual Shadow Maps [일반 지식].

### 2-5. 안개·대기·후처리 (Yellowsky 분위기의 핵심)

| 후보 | 품질 상한 | 속도 | 비용 | AI 친화 | Mac |
|---|---|---|---|---|---|
| A. **우리 `HellFogFeature` 확장**(높이 안개 + 주광 그림자 샘플 + 근처 점광원 산란, 저해상도 + 업샘플) | ○~◎ | ○ (2~3주 [추정]) | 0 | ◎ 코드·수치 전부 텍스트 | ◎ 직접 관리 |
| B. 오픈소스 URP 볼류메트릭 라이트(CristianQiu) | ◎ 점·스폿 광원 볼류메트릭 | ◎ | 0(라이선스 확인 필요) | ○ | 6000.5까지 명시, **6000.6 미확인** |
| C. 유료 Buto(OccaSoftware) 등 | ◎ | ◎ | 유료(승인) | △ 블랙박스 | 6 LTS 명시, 6000.6 미확인 |

- 근거: URP는 볼류메트릭 안개를 기본 지원하지 않는다(6000.6 문서) [사실] — https://docs.unity3d.com/6000.6/Documentation/Manual/urp/convert-hdrp-vfx-graph-to-urp.html . CristianQiu Unity-URP-Volumetric-Light: 2022.3~6000.5, Forward/Deferred/Forward+, Render Graph 지원 [단일·README] — https://github.com/CristianQiu/Unity-URP-Volumetric-Light . Buto: URP·Unity 6 LTS [단일·스토어] — https://assetstore.unity.com/packages/slug/258881 . 무료 Volumetric Fog Lite(Unity 6.2, Renderer Feature) [단일] — https://mirzabeig.notion.site/Volumetric-Fog-Lite-3c0d023ca81842509ad89c749307ac53
- 목표 게임 쪽: Yellowsky는 UE5(모집글 1건 [단일], Yellowsky 연구 §1.1), 아트는 완전 3D 실시간·픽셀 아님. 광원·안개 수치는 공개 근거 없음(같은 연구 §2.5). Phantom Blade Zero도 UE5 [사실] — https://store.steampowered.com/app/4115450 , https://wccftech.com/unreal-engine-5-phantom-blade-zero-low-end-hardware/ . → 두 목표 게임의 안개·광산란은 UE5 기본 볼류메트릭 안개 계열일 가능성이 높다 [추정]. 우리는 같은 기능이 엔진에 없으므로 직접 만들어야 한다(§4).
- **추천 A [제안].** 이유: ① 이미 레이마치 골격이 있다(`HellHeightFog.shader:28-31`). ② 카메라 LOCK 규칙상 "안개가 먼 적을 지우면 FAIL"이라 안개 밀도·높이·거리 곡선을 판정 수치로 직접 통제해야 한다(블랙박스 C는 불리). ③ B는 **같은 장면 A/B 비교 기준선**으로만 들인다(코드 반입 전 라이선스 확인, 사용자 승인). B가 비교판에서 확실히 앞서면 그때 채택을 다시 묻는다.
- 후처리 색: D4-01 §5.4 순서(톤매핑 → 색 보정 → LUT, DaVinci Resolve로 LUT 제작)를 따르고, 값은 분위기 프리셋(§3c-2)에 넣는다.

- **UE5에서는:** Exponential Height Fog + Volumetric Fog가 기본이고 광원마다 Volumetric Scattering Intensity로 산란을 조절한다 [사실·W34]. 후처리는 Post Process Volume + Color Grading LUT [일반 지식]. 목표 두 게임이 UE5라 이 칸이 "가장 가까운 결과"에 가장 직접적이다 [추정].

### 2-6. 캐릭터·몬스터·보스

| 단계 | 후보 | 추천 [제안] | 근거 |
|---|---|---|---|
| 모델 | A. Meshy/Tripo 이미지→3D + Blender 수정 B. Blender 부위별 조형 | 보스·영웅 = B, 일반 몬스터 기본형 = A+수정 | D4-04 §(b)·(e), 보스 Meshy 2회 FAIL |
| 리깅 | A. Blender 수동(Rigify, Humanoid 24본 이름) B. 자동 리그(Mixamo·Meshy) | A | D4-04 |
| 동작 | A. Blender 손키 B. Mixamo 클립 재타이밍 C. Cascadeur | A(B는 원형 참고만) | 무게 있는 예비동작·끝까지 가는 공격은 과장 손키가 필요(D4-04 §e). Cascadeur는 Pro 리타깃·반입 끊김 보고로 보류(같은 문서 S16·S17) |
| 런타임 | A. Animator + Animation Rigging B. 현행 HumanPose·수동 IK 유지 | 영웅 B 유지, 신규 몬스터·보스 A | D4-04 |
| 픽셀 렌더 | A. 액터별 직교 캡처(현행) B. 화면 전체 저해상도 RT 1장 C. **액터별 직교 캡처를 Renderer Feature 1개로 묶기(아틀라스)** | **C** | 아래 |

- 픽셀 렌더 근거: 저해상도 RT에 그려 최근접 확대하는 방식에서 "픽셀 기어감(pixel creep)"은 **직교 투영에서만** 해결된다고 두 제품 문서가 쓴다 [사실·출처 2] — https://sites.google.com/view/propixelizer/user-guide , https://github.com/Radivarig/UPixelator_Documentation . 우리 월드 카메라는 원근(34° LOCK)이므로 B(화면 전체 저해상도)는 카메라 이동 때 액터·배경이 기어 다닌다 [추정, 위 문서 근거]. 현행 A는 액터마다 직교 캡처라 이 문제를 피했다(`NativeRigPixelHero.cs:51` `orthographic=true`). 문제는 비용 구조(위 위험 3)다 → C.
- 예비 수치(현행에서 이어받음): 텍셀 배율 = 화면 높이/1080(`NativeRigPixelPolicy.cs:51`), RT 한 변 64~1024, 32 단위(`:52-56`).

- **UE5에서는:** 모델·리깅·손키는 같은 Blender 경로, 런타임은 Animation Blueprint + Control Rig(IK) [일반 지식·W36]. 픽셀 렌더는 기본 기능이 없다 — SceneCapture2D로 저해상도 Render Target에 그려 합성하는 우회가 포럼 관례이고, 후처리가 HDR→LDR RT에서 깨지거나 TSR 잔상이 생긴다는 보고가 있다 [단일·W37a·W37b]. 직교 캡처는 SceneCapture2D 직교 투영으로 같은 구조가 가능하다 [일반 지식].

### 2-7. VFX

| 후보 | 품질 | 속도 | 비용 | AI 친화 | Mac |
|---|---|---|---|---|---|
| A. **Shuriken + Shader Graph(메시·플립북)** | ○~◎ 타격·예고·장판에 충분 | ◎ | 0 | ◎ 시드·정지·되감기, 수치 직렬화 쉬움 | ◎ |
| B. VFX Graph | ◎ 대량 GPU 입자 | ○ | 0 | △ 그래프 에셋 diff 어려움 [추정] | 컴퓨트 셰이더 필요 [사실] |

- 근거: VFX Graph는 컴퓨트 셰이더·SSBO 필요, URP가 지원하는 플랫폼 중 일부만 지원 [사실] — https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@17.0/manual/System-Requirements.html . 연구 3건(Yellowsky §4.1, D4-03, D4-04)이 모두 A 추천.
- **추천 A(전투 VFX 전부), B는 환경 대량 입자(재·불씨·반딧불)만 [제안].** 이미 `Rendering/Sandbox/SandboxEmbers.vfx`, `VFX/RM1/*.vfx`가 있다. 정렬 순서 "적 예고 > 적 탄 > 플레이어 피격 > 플레이어 타격 > 장식"(PBZ 연구 §10)을 렌더 큐 표로 고정한다. 바닥 예고·장판은 URP Decal Projector + Shader Graph(D4-03, Yellowsky §4.3)이고, 발밑 원은 ZTest Always 쿼드(D4-03).

- **UE5에서는:** Niagara 하나로 CPU·GPU 입자를 모두 만든다(UE5의 기본 VFX 도구) [사실·W35]. 바닥 예고는 Decal Actor [일반 지식].

### 2-8. HUD/UI

| 후보 | 품질 | 속도 | 비용 | AI 친화 | Mac |
|---|---|---|---|---|---|
| A. 현행 IMGUI 유지 | ○ (애니메이션·머티리얼 손으로) | ◎ 기존 프로브·스모크 재사용 | 0 | ◎ 전부 코드 | ◎ |
| B. UGUI(Canvas) | ◎ 커스텀 셰이더·머티리얼, 키프레임 애니메이션 | △ 이전 비용 | 0 | ○ 프리팹 YAML | ◎ |
| C. UI Toolkit | ○ 다해상도·레이아웃 강함, 커스텀 셰이더 약함 | △ | 0 | ◎ UXML/USS 텍스트 | ◎ |

- 근거: Unity 비교표 — uGUI는 커스텀 셰이더·머티리얼·키프레임 애니메이션 쪽, UI Toolkit은 다해상도 메뉴·HUD 쪽 권장, 버전마다 표가 바뀜 [사실] — https://docs.unity.com/en-us/engine/6000.6/manual/uitoolkits/ui-system-compare.md , https://docs.unity3d.com/Manual/UI-system-compare.html
- **추천: v0는 A(D4-02 S4와 일치), v0 뒤 HUD 구체·칸 틀처럼 셰이더가 필요한 부분부터 B [제안].** 실버 헬 금속 질감·액체 구체는 머티리얼 효과가 핵심이라 장기적으로 C보다 B가 맞다. 화면 기준(1920×1080·3840×1080)은 CLAUDE.md 4.2-4.

- **UE5에서는:** UMG(+CommonUI), 금속·액체 효과는 UI Material [일반 지식].

### 2-9. 사운드

| 후보 | 품질 | 속도 | 비용 | AI 친화 | Mac |
|---|---|---|---|---|---|
| A. **Unity Audio Mixer + 자체 SfxPlayer**(현행 확장) | ○ | ◎ | 0 | ◎ | ◎ |
| B. Wwise | ◎ 층·랜덤·덕킹 도구 | △ 빌드 파이프라인 추가 | 예산 $250K 이하 Indie 무료 [사실] | △ 프로젝트 파일 GUI | ◎ |
| C. FMOD | ◎ | △ | Indie 조건 출처 충돌(공식 미확인) | △ | ◎ |

- 근거: Wwise Indie 무료(제작 예산 $250K 이하) — https://www.audiokinetic.com/pricing , https://blog.audiokinetic.com/free-wwise-for-indie-developers/ . FMOD 조건은 개인 개발 블로그뿐 [단일·충돌].
- **추천 A [제안].** 연구 3건(D4-03, PBZ T10, Yellowsky) 일치. PBZ식 "접촉·무게·꼬리 3층 + Clash 그룹"은 Mixer 그룹으로 충분하다. 사건 동시 재생이 32개를 넘거나 층 조합이 표로 관리 안 될 때 B를 사용자에게 묻는다.

- **UE5에서는:** MetaSounds(DSP 그래프·샘플 정확도 제어) [사실·W36] + Sound Class·Submix·Concurrency [일반 지식]. Wwise·FMOD 연동도 가능 [일반 지식].

---

## 3. Unity 우리식 커스텀안

원칙 [제안]
- **모든 툴은 "데이터 에셋(ScriptableObject/JSON) + 메뉴 + 배치 진입점(`-executeMethod`)" 세 가지를 갖는다.** 사람은 메뉴로, AI 에이전트·공용 실행기는 배치 모드(창 0·소리 0, CLAUDE.md 3.3)로 같은 일을 한다. MCP for Unity(`manifest.json:29`)는 에디터가 떠 있어야 하므로 보조 수단으로만 쓴다(무창 규칙과 충돌 가능).
- 새 Renderer Feature는 **Render Graph API(`RecordRenderGraph`)**로 쓴다. Unity는 비-Render Graph(호환 모드) 경로를 더 개발하지 않는다 [사실] — https://docs.unity.com/en-us/engine/6000.6/manual/render-pipelines/universal-render-pipeline/customizing-urp/render-graph/write-render-pass , https://docs.unity3d.com/Manual/urp/render-graph-write-render-pass.html
- Core 수치·판정은 건드리지 않는다. 화면 모양(발밑·탄·장판)은 Core 값에서 1:1로 만든다.

### 3a. URP Renderer Feature

성능 예산은 **Mac M5 Pro, 1920×1080, 60fps(16.6ms) 목표** 기준 GPU ms [추정·Mac 측정 전]. 측정 도구는 기존 `Runtime/NativePerfProbe.cs`·`NativeGame.PerfProbe.cs`.

UE5 대응(기능명, [일반 지식] 표시 외는 §8 출처): a-1 = SceneCapture2D → 저해상도 Render Target(Unfiltered) 또는 SceneViewExtension 커스텀 패스(기본 픽셀화 기능 없음) [W37a], a-2 = 머티리얼 Dither Temporal AA 페이드가 흔한 관례 — 우리 점 금지와 충돌하므로 Translucent 교체 또는 Custom Depth로 직접 구현 [일반 지식], a-3 = Custom Depth/Stencil + Post Process Material [일반 지식], a-4 = Exponential Height Fog + Volumetric Fog 기본 [W34], a-5 = Decal Actor·DBuffer Decal [일반 지식], a-6 = SSAO·Lumen 간접 AO 기본 [일반 지식].

| # | 피처 | 입력 | 출력 | 주입 지점 | 예산 | 비고 |
|---|---|---|---|---|---|---|
| a-1 | **PixelActorPass**(3D→픽셀 캐릭터) | 액터 목록(리그 루트·바운드·텍셀 배율), 광원 4개, 월드 카메라 | 아틀라스 RT 1장(Point, 액터별 직교 뷰포트) → 월드 깊이와 비교해 합성 | BeforeRenderingTransparents(합성), 캡처는 AfterRenderingOpaques 전 [제안] | 적 30 + 영웅 + 보스: ≤ 2.0ms | 현행 액터별 `SubmitRenderRequest`(`NativeRigPixelHero.cs:245-246`)와 적 액터당 RT(`NativeEnemyRigRenderer.cs:5`)를 대체. 앵커 스냅(`NativeHd2D.cs:148-165`)·발선 규칙 유지. 1px 림(PoE2 L3)도 이 합성 패스에서 |
| a-2 | **OccluderFadePass**(가림 투명화) | `Occluder` 레이어(고목 줄기·수관·큰 바위만), 영웅·보스 화면 위치 | 깊이 선패스 + 알파 블렌드로 다시 그림, 원형 범위 키워드 | AfterRenderingOpaques | ≤ 0.5ms | **디더 금지**(점 금지·D4-03 R4). 땅·다리·늪은 레이어 제외 |
| a-3 | **SilhouettePass**(가려진 영웅·엘리트 실루엣) | `Hero`·`EliteBoss` 레이어 | Depth Greater로 가려진 픽셀만 단색 | AfterRenderingOpaques | ≤ 0.2ms | URP 기본 Render Objects 2개로 가능(D4-03) — 코드 0 |
| a-4 | **HeightFogScatterPass**(높이 안개·대기) | 깊이, 주광 그림자맵, 근처 점광원 ≤ 8, 프리셋 수치(밀도·높이 감쇠·색·시작 거리·먼 적 보호 거리) | 1/2 해상도 산란 버퍼 → 양방향 업샘플 → 색 합성 | BeforeRenderingPostProcessing(현행과 같음) | PC ≤ 1.2ms, Mac 저비용판 ≤ 0.6ms | 현행 `HellFogFeature`(FullScreenPass, 16단계)를 Render Graph로 재작성. 하드코딩 화로 좌표 제거(`HellHeightFog.shader:16-18`). **Mac 렌더러에도 등록** |
| a-5 | **GroundContactPass**(접지) | 소품 밑동 목록 | URP Decal(DBuffer/Screen Space 중 Mac 측정으로 1개) | URP 기본 Decal 피처 | ≤ 0.5ms | 새 코드 대신 기존 `DecalRendererFeature` 사용. Normal Blend Low=깊이 1샘플 [사실] — https://docs.unity3d.com/Manual//urp/renderer-feature-decal-reference.html |
| a-6 | **SSAO**(기존 `HellSsaoFeature`) | 깊이 | AO | 기존 | ≤ 0.8ms | 샘플 4→8이면 GPU 부하 2배, 절반 해상도면 픽셀 1/4 [사실] — https://docs.unity3d.com/6000.7/Documentation/Manual/urp/ssao-renderer-feature-reference.html . Mac에도 저비용판 |

예산 합계(제안) — 불투명 월드 5.0, 그림자 2.0, a-1 2.0, a-4 1.2, a-6 0.8, 데칼·a-2·a-3 1.2, 후처리 1.0, VFX 1.0, UI 0.5 = 14.7ms, 여유 1.9ms [추정].

### 3b. 커스텀 셰이더

UE5 대응: 지형 = Landscape Material + Landscape Layer Blend(Height Blend) [W38], 늪 물 = Water 플러그인 또는 Single Layer Water 셰이딩 모델 [일반 지식], 접지 데칼 = Deferred Decal 머티리얼 [일반 지식], 픽셀 툰 = Post Process Material 또는 Substrate/Unlit 커스텀 [일반 지식].

| 셰이더 | 방식 | 입력 | 핵심 | 기존 자산 |
|---|---|---|---|---|
| 지형 블렌드 | **Terrain Lit Shader Graph**(6.3+) | 레이어 4장(알베도·노멀·높이), 스플랫맵 | 높이 블렌드(돌 틈에 흙이 먼저 참), 경사 방향 블렌드, 저주파 마스크 | `Resources/Shaders/HellGroundPBR.shader`, `A2ArenaSoilLit.shader`(대체·통합 대상) |
| 늪 물 | Shader Graph(Unlit+조명 근사) | 깊이 텍스처, 흐름 맵, 반사(평면 반사 또는 프로브) | 기슭 깊이 페이드·거품 띠·흐름, **고정 카메라라 거슬리는 하이라이트 억제**(D4-01 ⑦) | `A2ToxicRiver.shader`, `Remodel/CH1_1/Shaders/ToxicFlow.shader`, `Runtime/A2RiverReflection.cs` |
| 소품 접지 데칼 | Shader Graph Decal 타깃 | 밑동 지름 | 중심 알파 .55 → 가장자리 0, 지름 = 밑동×1.6(D4-01 A-1) | `Remodel/CH1_1/Shaders/GroundDecal.shader`, `VFX/RM1/ShaderGraph/SG_GroundDecal.shadergraph` |
| 픽셀 툰 | HLSL(현행 유지) | 팔레트·표면 태그 | 3~4단 명암, 금속면 | `RigPixelToon.shader`, `RigPixelComposite.shader` |

### 3c. 에디터 툴

규모는 Sonnet 서브에이전트 구현 + CTO 판정 기준 작업일 [추정].

UE5 대응: c-1 = PCG 프레임워크 그래프(규칙 배치, 기본 제공) [W38], c-2 = Post Process Volume 프리셋 Data Asset + Editor Utility [일반 지식], c-3 = Movie Render Queue·High Res Screenshot + Python 에디터 스크립트 [일반 지식], c-4 = Editor Utility Widget [일반 지식], c-5 = stat 명령·Unreal Insights + Data Validation 플러그인 [일반 지식].

| # | 툴 | 기능 | 입력 → 출력 | 누가 쓰나 | 규모 |
|---|---|---|---|---|---|
| c-1 | **PropClusterBrush**(소품 스캐터·군집) | "큰 것 1 + 중간 2~3 + 작은 것 5~8 + 카드 6~12"(D4-01 P-2) 무리를 시드 고정 Poisson 간격으로 배치, 경사·물·통로 금지 영역 회피, 무리 사이 데칼 띠(Splines) | 키트 목록·규칙 SO + 중심점(웹 좌표) → 프리팹 인스턴스 + **배치 JSON**(웹 좌표, 재현 가능) | 맵 담당·에이전트(배치 모드), 사람(브러시) | 3~4일 |
| c-2 | **MoodPreset**(분위기 프리셋) | 주광·환경광·안개(a-4 수치)·Volume(톤·색·LUT·블룸·비네트)·광원 배율을 한 에셋에 담고 적용/비교/JSON 내보내기, 두 프리셋 보간 | 프리셋 SO ↔ JSON | 조명 담당, 키샷 판정 | 2~3일 | 
| c-3 | **KeyshotBoard**(키샷 비교판 자동 캡처) | 키샷 카메라 북마크 목록으로 1920×1080·3840×1080, 1x·3x 크롭 촬영, 레퍼런스(블러로 구도만)·이전 커밋 결과와 나란히 비교판 PNG, 지표(밝기 히스토그램, 먼 적 몸통-바닥 ΔL, 점 검사) | 키샷 JSON + 커밋 SHA → PNG + `metrics.json` | Mac 판정, CTO | 3일 |
| c-4 | **RefOverlay**(레퍼런스 대조 오버레이) | Game 뷰 위에 레퍼런스 반투명·차이·흑백(명도만)·3분할선 | 이미지 → 오버레이(에디터 전용, 빌드 제외) | 아트·조명 | 1.5일 |
| c-5 | **BudgetCheck**(예산 검사기) | 키샷별: 화면 삼각형·SetPass·그림자 광원 수·텍스처 메모리·파티클 수·픽셀 액터 RT 수와 ms, 지형-메시 높이 차(≤0.02u) | 예산 표 SO → 통과/실패 표 + 종료 코드 | 모든 레인(커밋 전 수동), Mac 판정 | 2~3일 |

- 기존 바탕: c-3은 `Runtime/NativeGame.SteamKeyshotCapture.cs`, `NativeGame.A2Forest.cs:476-489`(RT 촬영), `Tools/NativeQaCaptureWriter.cs`를 묶는다. c-2는 `NativeGame.HellLighting.cs:27-41,84-92`의 하드코딩을 프리셋 기본값으로 옮긴다(**화면 무변경 이전**이 첫 커밋, 그다음부터 값 변경).
- 녹화: 10초 무음 영상은 Unity Recorder(고정 프레임레이트 Constant) [사실] — https://docs.unity3d.com/Packages/com.unity.recorder@5.0/manual/RecorderWindowRecordingProperties.html . 공용 실행기 무창 조건에서 쓸 수 있는지는 Mac에서 확인.

### 3d. 파이프라인 자동화

UE5 대응: d-1 = Interchange 임포트 파이프라인·Asset Import 설정 + Data Validation [일반 지식], d-2 = Data Validation·Commandlet(배치) [일반 지식], d-3 = Cook/패키징 로그·Size Map [일반 지식], d-4 = 같은 규칙(엔진 무관).

| # | 장치 | 방식 | 막는 것 | 근거 |
|---|---|---|---|---|
| d-1 | **임포트 규칙** | `AssetPostprocessor`(폴더별): 텍스처 = sRGB·최대 크기·압축·픽셀 소스 Point 필터·밉맵, 모델 = 단위·카메라/광원 제거·Read/Write 끔·Humanoid 본 이름 검사·삼각형 상한 초과 경고, 오디오 = 로드 방식 | 손으로 고친 임포트 설정이 섞이는 것 | `OnPreprocessModel`은 모델 임포트 시작에 전체 설정을 덮는다, Unity는 후처리기를 미리 빌드한 DLL로 두길 권한다(다른 스크립트 컴파일 오류로 임포트 결과가 바뀌지 않게) [사실] — https://docs.unity3d.com/ScriptReference/AssetPostprocessor.html . 기존 `Editor/SourceTextureImporter.cs`·`SourceAudioImporter.cs`·`A2GroundCoverImporter.cs`를 한 규칙 표로 합친다 |
| d-2 | **예산 초과 차단** | c-5를 배치 모드로 실행 → 실패면 비0 종료 코드. Mac 판정 절차의 첫 단계로 둔다 | 예산 넘는 화면 병합 | 새 훅·예약 작업은 만들지 않는다(CLAUDE.md 3.5). 자동 실행 연결은 사용자 승인 뒤 |
| d-3 | **빌드 크기 감시** | `IPostprocessBuildWithReport` → `report.summary.totalSize` + 큰 파일 20개를 JSON에 덧붙이고 직전 대비 +5% 넘으면 경고 | 몰래 커진 빌드 | `BuildSummary.totalSize`(바이트) [사실] — https://docs.unity.com/en-us/engine/6000.0/script-reference/unityeditor/build/reporting/buildsummary/totalsize.md . 패키징 뒤 크기와 다를 수 있다는 문서 경고 포함 |
| d-4 | **분위기·키샷 회귀** | 화면이 바뀌는 커밋은 c-3 비교판 첨부 필수 | "나아짐 또는 같음" 규칙 위반 | DIRECTION_RESET 새 규칙 |

---

## 4. 엔진 메모 — 목표 분위기에 Unity URP가 부족한 지점 (전환 권고는 레인 ENG)

| 부족한 것 | URP 현황 | HDRP에는 | UE5에는 | 우리 대응(Unity 유지 시) |
|---|---|---|---|---|
| 볼류메트릭 안개·광산란 | **기본 없음** [사실, 6000.6 문서] | 볼류메트릭 안개·Local Volumetric Fog [사실] — https://docs.unity3d.com/Manual/render-pipelines-feature-comparison.html | Exponential Height Fog + Volumetric Fog 기본, 카메라 절두체 전체에서 밀도·조명 계산(다수 광원 지원). Start Distance·Max Opacity·Cutoff Distance는 Volumetric Fog에 적용 안 됨 [사실·W34] | §3a-4 직접 구현, 서드파티는 비교 기준 |
| 화면 공간 반사(SSR) | 없음 [사실, 같은 비교표] | 있음 | Lumen 반사·SSR [일반 지식] | 늪 물은 평면 반사·프로브·하이라이트 억제(고정 카메라) |
| 실시간 GI(SSGI·Lumen류) | 없음, APV(굽기)만 [사실 — APV 문서; SSGI 부재는 PoE2 연구 §3] | SSGI·레이트레이싱 계열 [추정·문서 미확인] | Lumen [일반 지식]. 목표 두 게임은 UE5 [Yellowsky 단일 / PBZ 사실] | APV + 손으로 놓는 채움광 |
| 접촉 그림자 | 없음 [추정] | Contact Shadows [추정·문서 미확인] | 광원별 Contact Shadow Length [일반 지식] | 접지 데칼 + SSAO(§3a-5·6) |
| 업스케일 | STP(컴퓨트, SM5.0 필요, OpenGL ES 불가) [사실] — https://docs.unity3d.com/Manual/urp/stp/stp-upscaler.html | DLSS·FSR·STP | TSR 기본 [일반 지식]. SceneCapture에서 TSR 잔상 보고 [단일·W37b] | Metal에서 STP 동작은 **미확인** → Mac 시험. 픽셀 액터는 업스케일과 무관하게 화면 텍셀 기준 유지 |
| 3D→픽셀 캐릭터 | 기본 없음(현행 자체 구현) | 기본 없음 | 기본 없음. SceneCapture2D → 저해상도 RT → UI 머티리얼 우회가 포럼 관례, 후처리가 HDR→LDR RT로 깨진다는 보고 [단일·W37a·W37b] | §3a-1 |
| 한 프로젝트 두 파이프라인 | 품질 단계별 URP 에셋 교체는 되지만(우리가 이미 함) URP·HDRP 셰이더는 호환되지 않는다 [추정·일반 지식] | — | 해당 없음(단일 렌더러) | HDRP "일부 기능만" 가져오는 길은 없다고 보고 설계한다 |

- 방향성: Unity 2026 렌더 파이프라인 전략에서 URP에 개발이 집중되고, HDRP는 "유지 모드"라는 보도와 "폐기 아님"이라는 Unity 직원 글이 함께 있다 [출처 충돌] — https://80.lv/articles/unity-unveils-2026-render-pipelines-strategy/ , https://discussions.unity.com/t/render-pipelines-strategy-for-2026/1710004/219 . 새 렌더 기능은 URP 쪽에 들어올 가능성이 높다 [추정].
- 결론(사실만): 목표 분위기의 핵심인 **볼류메트릭 광산란은 URP에 없고 직접 만들거나 서드파티를 써야 한다.** 그 밖의 차이(SSR·실시간 GI)는 탑다운 고정 카메라에서 손 조명·굽기로 메울 수 있는 범위다 [추정]. UE5는 볼류메트릭 안개·Lumen을 기본으로 갖지만, 우리 핵심 표현인 3D→픽셀 캐릭터는 어느 엔진에도 기본 기능이 없어 직접 만들어야 한다(위 표). 엔진 전환 판단과 권고는 레인 ENG가 한다. 이 문서는 재료만 낸다.

---

## 5. 실행 순서 — 키샷 한 장면에 가장 빨리 닿는 길 (2주 단위)

전제: 화면 패치 동결 중이므로 아래는 매뉴얼 확정·사용자 승인 뒤, **키샷 전용 장면·브랜치**에서 한다(DIRECTION_RESET 4단계). 규모는 [추정].

| 기간 | 목표 산출물 | 만들 것 | 판정 |
|---|---|---|---|
| **S1 (1~2주) 측정 기반** | 같은 구도·같은 품질 단계로 매번 같은 비교판이 나온다 | c-3 KeyshotBoard, c-2 MoodPreset(화면 무변경 이전), c-5 BudgetCheck v0, Forward+ 전환, Mac 렌더러에 SSAO·안개 저비용판, 판정 캡처 품질 단계 고정 | 이전·이후 비교판 "같음"(이전 커밋이 화면을 안 바꿨는지), Mac ms 첫 측정 |
| **S2 (3~4주) 분위기** | 사람 없는 환경 키샷 1장(먼 적 자리 표시 포함) | a-4 HeightFogScatterPass(Render Graph), APV 굽기, LUT(DaVinci) 1장, 지형 Terrain Lit Shader Graph 높이 블렌드, 접지 데칼 세트, 늪 물 1차 | Yellowsky·D4 레퍼런스와 같은 크기 비교판, 먼 적 ΔL 규칙(D4-01 §5.3), 3x 점 0 |
| **S3 (5~6주) 소품·구도** | 키샷 장면 소품 완성 | 큰 소품 Blender 키트 5~8종, 생성 소품(승인 크레딧) + Remesh, c-1 PropClusterBrush, d-1 임포트 규칙, a-2 가림 페이드, a-3 실루엣 | 1080p 한 장에 무리 4~7개·빈 바닥 ≤35%(D4-01 P-3), 고목 가림 정상 |
| **S4 (7~8주) 캐릭터·임팩트** | 영웅 + 적 무리 + 타격 1회가 들어간 **최종 키샷** | a-1 PixelActorPass(아틀라스), 1px 림, Shuriken 타격 VFX 1세트(PBZ 규칙), 사운드 3층 1세트, d-3 빌드 크기 감시 | 키샷 최종 비교판 + 10초 무음 영상, 예산 통과, 크래시 0 |

- **가장 빠른 경로의 이유:** 분위기(안개·광원·색)가 사용자 불만의 첫 줄이고("모든 맵·광원·안개가 쓰레기"), 비교 장치(S1)가 없으면 S2의 개선이 "나아짐"인지 판정할 수 없다. 캐릭터 픽셀 패스(S4)는 지금도 동작하는 경로(`--hero-render=rigpixel`)가 있어 장면이 먼저 서야 판정 의미가 있다.
- 중단 조건(각 기간): 같은 방법으로 만든 후보가 같은 핵심 결함으로 2회 FAIL이면 방법을 바꾼다(CLAUDE.md 4.1). S2 안개가 2회 FAIL이면 §2-5 후보 B(오픈소스, 승인 후)로 비교 시험한다.

---

## 6. CTO·사용자 결정 대상

| # | 결정 | 이 문서 제안 | 묻는 이유 |
|---|---|---|---|
| D1 | 지형: D4-01(Terrain) vs PoE2 E1(메시) | 혼합 C | 연구 충돌 |
| D2 | 재질 도구 Substance 구독 | B(무료)로 시작, 부족하면 승인 요청 | 유료 |
| D3 | 안개 서드파티 비교 시험(오픈소스 반입 또는 Buto 구매) | 자체 확장 A, B는 비교용 | 외부 코드·유료 |
| D4 | HUD v0 뒤 UGUI 이전 | v0는 IMGUI | 장기 방향 |
| D5 | 예산 검사 자동 실행 연결 | 수동 → 승인 뒤 자동 | 새 자동화 장치(CLAUDE.md 3.5) |
| D6 | Mac 판정 품질 단계 | High 이상 고정 + Mac 렌더러에 저비용 안개 | 판정 일관성 |
| D7 | 엔진 유지/전환 | 이 문서는 재료만(UE5 칸) | 레인 ENG가 권고, 사용자 결정 |

## 7. 한계

- Unity 문서 일부는 6000.6이 아닌 6.0~6.5 페이지다. 6000.6.7f1에서 같은지 Mac 확인이 필요하다(특히 Terrain Shader Graph 레이어 수, APV+Forward+, STP Metal).
- ms 예산·작업일은 전부 추정이다. S1 첫 측정으로 갈아 끼운다.
- Yellowsky의 엔진(UE5)은 출처 1건이다. 광원·안개 공개 수치는 없다(Yellowsky 연구 §2.5).
- 이 레인은 코드를 고치지 않았다. 코드 줄 번호는 unity/main `75add6ff4` 기준.
- UE5 칸 가운데 [일반 지식]으로 표시한 기능명은 Epic 문서 URL을 붙이지 않았다. ENG 레인이 판단 근거로 쓰기 전에 5.x 공식 문서로 확인해야 한다. 특히 SceneCapture2D 픽셀화의 품질·비용은 포럼 보고뿐이다.

## 8. 출처

| # | 출처 | URL |
|---|---|---|
| W1 | Unity 6000.6 URP — HDRP VFX Graph → URP 변환(볼류메트릭 안개 미지원) | https://docs.unity3d.com/6000.6/Documentation/Manual/urp/convert-hdrp-vfx-graph-to-urp.html |
| W2 | Unity 렌더 파이프라인 기능 비교 | https://docs.unity3d.com/Manual/render-pipelines-feature-comparison.html |
| W3 | URP Render Graph 렌더 패스 작성(6000.6) | https://docs.unity.com/en-us/engine/6000.6/manual/render-pipelines/universal-render-pipeline/customizing-urp/render-graph/write-render-pass |
| W4 | 같은 주제(6.3 LTS) | https://docs.unity3d.com/Manual/urp/render-graph-write-render-pass.html |
| W5 | URP 렌더링 경로 소개 | https://docs.unity3d.com/Manual/urp/rendering-paths-introduction.html |
| W6 | URP 17 Forward+ | https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@17.0/manual/rendering/forward-plus-rendering-path.html |
| W7 | APV 개념(6.3) | https://docs.unity3d.com/Manual/urp/probevolumes-concept.html |
| W8 | Unity 6 GI 블로그 | https://unity.com/blog/engine-platform/new-ways-of-applying-global-illumination-in-unity-6 |
| W9 | Terrain Shader Graph(6.3) | https://docs.unity3d.com/Manual/terrain-shader-graph.html |
| W10 | Terrain Shader Graph 공지 | https://discussions.unity.com/t/terrain-shaders-in-shader-graph-new-in-unity-6-3/1683627 |
| W11 | UI 시스템 비교(6000.6) | https://docs.unity.com/en-us/engine/6000.6/manual/uitoolkits/ui-system-compare.md |
| W12 | UI 시스템 비교(현행) | https://docs.unity3d.com/Manual/UI-system-compare.html |
| W13 | VFX Graph 시스템 요구 | https://docs.unity3d.com/Packages/com.unity.visualeffectgraph@17.0/manual/System-Requirements.html |
| W14 | Decal Renderer Feature 레퍼런스 | https://docs.unity3d.com/Manual//urp/renderer-feature-decal-reference.html |
| W15 | SSAO Renderer Feature 레퍼런스(6.7) | https://docs.unity3d.com/6000.7/Documentation/Manual/urp/ssao-renderer-feature-reference.html |
| W16 | STP 업스케일러 | https://docs.unity3d.com/Manual/urp/stp/stp-upscaler.html |
| W17 | AssetPostprocessor | https://docs.unity3d.com/ScriptReference/AssetPostprocessor.html |
| W18 | BuildSummary.totalSize | https://docs.unity.com/en-us/engine/6000.0/script-reference/unityeditor/build/reporting/buildsummary/totalsize.md |
| W19 | Unity Recorder 녹화 속성 | https://docs.unity3d.com/Packages/com.unity.recorder@5.0/manual/RecorderWindowRecordingProperties.html |
| W20 | ProPixelizer 사용자 안내(직교에서만 pixel creep 해결) | https://sites.google.com/view/propixelizer/user-guide |
| W21 | UPixelator 문서 | https://github.com/Radivarig/UPixelator_Documentation |
| W22 | CristianQiu URP Volumetric Light | https://github.com/CristianQiu/Unity-URP-Volumetric-Light |
| W23 | Buto(Asset Store) | https://assetstore.unity.com/packages/slug/258881 |
| W24 | Volumetric Fog Lite | https://mirzabeig.notion.site/Volumetric-Fog-Lite-3c0d023ca81842509ad89c749307ac53 |
| W25 | Meshy Remesh | https://docs.meshy.ai/en/webapp/guides/3d-model/remesh |
| W26 | Tripo 하이→로우 폴리 | https://www.tripo3d.ai/blog/high-poly-to-low-poly-textured |
| W27 | Phantom Blade Zero Steam(UE5) | https://store.steampowered.com/app/4115450 |
| W28 | Wccftech PBZ UE5 | https://wccftech.com/unreal-engine-5-phantom-blade-zero-low-end-hardware/ |
| W29 | Wwise 가격 | https://www.audiokinetic.com/pricing |
| W30 | Wwise Indie 무료 | https://blog.audiokinetic.com/free-wwise-for-indie-developers/ |
| W31 | 80.lv Unity 2026 렌더 파이프라인 전략 | https://80.lv/articles/unity-unveils-2026-render-pipelines-strategy/ |
| W32 | Unity 포럼 Render Pipelines strategy for 2026 | https://discussions.unity.com/t/render-pipelines-strategy-for-2026/1710004/219 |
| W33 | MCP for Unity 도구 목록 | https://glama.ai/mcp/servers/@CoplayDev/unity-mcp/blob/2a1fe67e2159ee73cae8acf63312417c88fe9cd9/unity-mcp-skill/references/tools-reference.md |
| W34 | Epic, Exponential Height Fog(Volumetric Fog 포함) | https://dev.epicgames.com/documentation/en-us/unreal-engine/exponential-height-fog-in-unreal-engine |
| W35 | Epic, Niagara로 VFX 만들기 | https://dev.epicgames.com/documentation/unreal-engine/creating-visual-effects-in-niagara-for-unreal-engine?lang=en-US |
| W36 | Epic 포럼, Unreal Engine 5.0 Preview(MetaSounds·Control Rig) | https://forums.unrealengine.com/t/unreal-engine-5-0-preview/500950 |
| W37a | Epic 포럼, 픽셀아트 해상도(SceneCapture2D → 저해상도 RT) | https://forums.unrealengine.com/t/exact-resolution-for-a-pixel-art-game/589310/2 |
| W37b | Epic 포럼, SceneCapture2D 후처리 문제 / TSR 잔상 | https://forums.unrealengine.com/t/ue5-4-scene-capture-2d-with-post-processing/2082873 , https://forums.unrealengine.com/t/increase-quality-of-scenecapture2d/2358402 |
| W37c | Epic Python API, SceneCaptureComponent2D | https://docs.unrealengine.com/PythonAPI/class/SceneCaptureComponent2D.html |
| W38 | PCG 프레임워크 입문(제3자) / Landscape Layer Blend Height Blend(제3자) | https://www.strayspark.studio/blog/ue5-pcg-framework-getting-started , https://www.udemy.com/course/introduction-to-landscapes-in-unreal-engine-5/ |
