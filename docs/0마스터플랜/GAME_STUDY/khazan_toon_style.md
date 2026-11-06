# 카잔(The First Berserker: Khazan)식 3D 툰 그래픽 — 제작 방식 연구와 우리 조건 적합 판단 (2026-11-06, 레인 KZ)

- 브리프: `docs/0마스터플랜/worklog/cloud-lanes/BRIEF_KHAZAN_STYLE_20261106.md`. 사용자 원문(11-06 14:20 KST) "2D 카툰 같은 카잔 같은 그래픽은 어떠냐."
- 이 문서는 **공부 자료**다. 결정은 사용자가 K3 키샷의 PBR 변형과 툰 변형을 나란히 보고 한다(§6 비교판 조건).
- **조사 조건(사실):** 이 레인의 클라우드 세션은 외부 사이트 직접 열람이 0건이었다(허용 호스트 없음, dev.epicgames.com·news.xbox.com·dailygame.co.kr·neople.co.kr·ggxrd.com·passtechgames.com 등 전부 미해결). 따라서 아래 모든 인용은 **검색 엔진이 돌려준 원문 발췌**이며 전부 `[발췌]`다. 원문 전체를 읽지 못해 확인하지 못한 항목은 `[미검증]`으로 적었다. 기억 기반 서술은 쓰지 않았다. 레퍼런스 게임 파일·에셋·코드 반입 없음, 영상 분석 없음.
- 표기: `[발췌]` = 검색 발췌로 확인한 원문 문장(출처 §7 번호), `[미검증]` = 공개 자료를 찾지 못했거나 원문을 열지 못해 확정 못 함, `[추정]` = 출처 없는 KZ 판단(결정 근거로 쓰지 않는다), `[사실]` = 우리 저장소에서 직접 확인한 코드·문서.

## 1. 카잔 그래픽의 구성 요소 (공개 자료만)

| 항목 | 공개 자료가 말하는 것 | 출처 | 상태 |
|---|---|---|---|
| 전체 방식 | "실사풍 대신 3D 셀 애니메이션풍의 그래픽"(넥슨 보도). Xbox Wire: "photorealistic textures with 3D cel shading", "bold outlines, vibrant colors, and high contrast". | S1, S2 | [발췌] |
| 캐릭터 vs 배경 | 이규철 AD(TGS 2024): "Different technology was used for the background and the characters." "Because the landscape, spaces, and different details are really important in Khazan, we chose the semi-realistic approach" — 반실사 배경 위에 셀 애니메이션 캐릭터. 데일리e스포츠(2024-10-04): "디테일한 캐릭터 표현과 반(半)실사 배경 간 조화". | S3, S4 | [발췌] |
| 셀 램프 단계 수 | 공개 자료에서 단계 수(2단·3단 등)를 말한 문장을 찾지 못함. | — | [미검증] |
| 윤곽선 방식 | "bold outlines"(Xbox Wire), "flat appearance with defined edges, as if they were hand-drawn"(Foro3D 기사). 포스트 프로세스인지 백페이스(인버티드 헐)인지 깊이·법선 에지인지 말한 공개 자료 없음. | S2, S5 | 존재 [발췌] / 방식 [미검증] |
| 손그림 텍스처 비율 | 이규철 AD: "혈흔 표현도 카툰 렌더링이다보니 사진처럼 텍스처로 처리하기 보다 하나하나 작업했고"(뉴스퀘스트). Xbox Wire는 "photorealistic textures". 즉 배경 질감은 실사 텍스처, 혈흔 같은 캐릭터 요소는 손작업. 비율 수치는 없음. | S6, S2 | [발췌] / 비율 [미검증] |
| 조명 모델 | 데일리e스포츠: "최적화를 고려한 사실적 라이팅과 애니메이션 스타일의 라이팅 사이 균형". 실시간 광원과 램프의 수식 관계는 공개 자료 없음. | S4 | [발췌] / 수식 [미검증] |
| 림·스페큘러 | 공개 자료 없음. | — | [미검증] |
| 환경 질감 | 배경은 "semi-realistic"(S3)·"반(半)실사"(S4). PBR이라는 단어는 공개 자료에 없음. 리뷰 관찰: "the cel-shaded look smooths out more homogenous-looking parts of the environments, like rocks and cliff faces", 일부 레벨은 길 찾기가 어려웠다(Restart 리뷰). 다른 리뷰: "the environments are stale and lifeless"(Wikipedia 리뷰 요약). | S3, S4, S7, S8 | [발췌] (리뷰는 평가자 관찰) |
| 카메라와 윤곽 두께 | 3인칭 근접 액션 RPG(장르 사실, S8). 거리별 윤곽 두께 규칙을 말한 공개 자료 없음. | S8 | 장르 [발췌] / 두께 규칙 [미검증] |
| 엔진 | Wikipedia·DSOGaming: Unreal Engine 4. PC 사양 기사: "heavily modified", "chose to stick with UE4". 뉴스퀘스트 기사는 "언리얼 엔진 5"라고 적어 **상충**. | S8, S9, S10, S6 | [발췌] (UE4가 다수) |
| 성능 | 권장 사양 목표 "1080p-60fps with High presets"(Prima). DSOGaming: "GPU-bound", 1080p 최고 옵션에서 테스트 GPU 전부 100FPS 이상, 이동 중 스터터. 툰 셰이딩만의 비용은 분리된 자료 없음. | S11, S9 | [발췌] / 툰 비용 [미검증] |
| 목표 선언 | 이규철 AD: "성인 극장판 애니메이션의 퀄리티로 '카잔'의 아트를 완성", "과감한 혈흔 표현과 다크한 분위기를 살리는 카툰 렌더링 기술 완성"(S1). 윤명진 대표(GDC 2025): 카잔 본인과 배경에 서로 다른 두 시각 접근을 썼다(S12). 사실적 그래픽이 글로벌에 유리함을 알면서도 신선함을 위해 "극화체"를 택했다(S6). | S1, S12, S6 | [발췌] |

**정리(출처 있는 범위):** 카잔은 "캐릭터 = 셀 셰이딩 + 굵은 윤곽 + 손작업 요소", "배경 = 반실사 텍스처 + 사실적 라이팅과 애니메이션 라이팅의 중간"이라는 **두 공정**을 한 화면에 합친 게임이다(S2·S3·S4). 램프 단계·윤곽 구현·림·스페큘러·거리별 두께는 공개 자료가 없어 전부 [미검증]이다. 개발사 기술 강연(Unreal Fest·GDC·NDC)은 검색에서 찾지 못했다(NDC 25는 OST 연주만 확인, S13).

## 2. 쿼터뷰·다수 동시 조건의 툰 사례 (공개 자료)

| 게임 | 시점·조건 | 툰·윤곽 구현(공개 자료) | 우리 조건(33~34° 쿼터뷰·동시 100마리·탄막)과의 차이 | 출처 |
|---|---|---|---|---|
| Hades (Supergiant) | 아이소메트릭, 2D | "2D game, but it's not a pixel art game, in that the source artwork is hand-painted". 캐릭터는 Maya에서 모델·애니메이션 → 2D로 내보내 AfterFX 후처리. | 셰이더 툰이 아니라 **프레임마다 원화**다. 실시간 3D 램프·윤곽 문제가 없음. 동시 수는 2D 스프라이트 예산. | S14 |
| Genshin / Honkai Impact 3rd (miHoYo) | 3인칭 근접 | Unite Tokyo 2018 "崩壊3rd 개발자가 말하는 애니메이션풍 렌더링" 강연 존재(Jack He). 발췌에서 확인된 기법은 머리카락 이방성 하이라이트와 "material-based outline color"뿐. | 캐릭터가 화면을 크게 차지하는 3인칭. 쿼터뷰 1x 작은 캐릭터 조건이 아님. 램프·백페이스·림 세부는 원문 미열람. | S15 |
| Guilty Gear Xrd (Arc System Works) | 2.5D 격투, 고정 측면 카메라, 캐릭터 2체 | "we use a traditional 'Inverted Hull' method as outlines". 정점색으로 선 굵기 조절·소거("allowed outline widths to vary and even be erased"). 조명용 노멀과 헐용 노멀을 **따로** 둠. "In Cel-shading, the surface is either lit, or not, and no value in between"(2톤). | 캐릭터 수 2, 카메라 거리 고정 → 거리별 감쇠 문제가 없음. 정점 노멀·정점색 수작업이 캐릭터당 크다(100마리 공정과 충돌). | S16, S17 |
| Hi-Fi Rush (Tango) | 3인칭, 전 세계 툰 | UE4 deferred 툰 렌더러. 전용 "Post Process Outline Pass": 법선과 깊이 각각 2×2 Laplacian 에지, 메시 내부 선, 배경 오브젝트 대상, SKIP_NORMAL_OUTLINE·SKIP_DEPTH_OUTLINE 플래그. 네이티브 해상도 60fps. | 3인칭이고 적 수가 적다. 그러나 "포스트 윤곽 = 깊이·법선 Laplacian, 오브젝트별 스킵 플래그" 구조는 쿼터뷰에도 그대로 쓸 수 있는 공개 선례다. 거리별 두께 감쇠는 발췌에 없음[미검증]. | S18, S19 |
| Ravenswatch (Passtech) | 탑다운 코옵 액션 로그라이크 | AD Valentin André-Terramorsi: "illustrative art style". 프리뷰: "thick outlines on characters and environments that make the game look like a moving comic book". | **우리와 같은 탑다운**에서 굵은 윤곽을 쓴 상용 사례. 엔진·셰이더 구현은 공개 자료 없음(Passtech 글의 "home-made engine" 언급은 어느 게임인지 원문 미확인)[미검증]. | S20, S21 |
| Tunic | 아이소메트릭, 직교 카메라, Unity | "deferred rendering isn't supported with ortho cams" → 광원 수를 줄임(Unity 블로그). | 쿼터뷰 조명 제약의 공개 선례. 윤곽선 유무·램프는 공개 자료 없음[미검증]. 우리는 원근 34°라 직교 제약은 해당 없음. | S22 |
| Octopath Traveler (HD-2D) | 낮은 각도 쿼터뷰, UE4 | "2D characters on top of a 3D rendered background". | 우리 "로우폴리 상위 도트"(3D 세계 + 픽셀 캐릭터)와 가장 가까운 **혼합** 선례. 캐릭터가 툰 셰이더가 아니라 도트다. | S23 |

**1x에서 작은 캐릭터의 윤곽·램프 — 직접 출처 없음[미검증].** 간접 근거 두 가지만 있다. ① Motomura: 셀 셰이딩은 중간값이 없어 "tiny normal differences produce visible blotches"(S16) → 캐릭터가 작아질수록 램프 경계가 잡티로 읽힐 위험이 커진다[추정의 근거]. ② CLAUDE.md 4.2-7 "점 금지"(3x 크롭 점 0)와 충돌할 수 있는 지점이 바로 이 램프 경계와 1px 윤곽이다[사실].

**거리별 윤곽 감쇠 관례(공개 자료):** 포스트 깊이 에지를 "center depth로 나눠 거리에 무관하게 선 굵기를 일정하게"(오픈소스 URP 툰 렌더러 설명, S24), 헐 오프셋을 깊이로 스케일하면 가까울 때 선이 과대해진다는 Unity 포럼 불만(S25), Maya pfxToon의 width-vs-distance 컨트롤(S26), UE `OverlayMaterialMaxDrawDistance`로 먼 거리에서 오버레이(윤곽) 컬링(S27). 관례는 "일정 굵기 유지 + 먼 거리 컬링"이고, **수치(몇 m에서 몇 px)는 어느 공개 자료에도 없다[미검증].**

## 3. UE 5.8에서의 구현 경로 (공식 문서 발췌)

### 3.1 포스트 프로세스 재질 기반 셀 램프·윤곽
- 재질 설정: Material Domain = Post Process, Shading Model = Unlit, 출력은 Emissive Color만(S28·S29). SceneTexture 노드로 SceneDepth·WorldNormal·CustomDepth·CustomStencil을 읽는다(S28·S30).
- Blendable Location(5.x 명칭): Scene Color Before DOF(투명 왜곡과 DOF 사이, 렌더 해상도·선형), Scene Color Before Bloom(디스플레이 해상도·선형), Replacing the Tonemapper(Input0 HDR, Input1 SeparateTranslucency, Input2 저해상도 블룸), SSR Input, Scene Color After Tonemapping(TSR 뒤·풀해상도)(S31·S32). 비용: "After Tonemapping ... is the preferred location for performance since the color is LDR". Before Tonemapping은 "more of a performance hit, but prevents ghosting"(S29·S31). Is Blendable=false는 "potentially costly"(S31).
- Custom Depth·Stencil: Project Settings > Engine > Rendering > Custom Depth-Stencil Pass = **Enabled with Stencil**(Enabled는 깊이만, Enabled on Demand는 첫 사용 때 stall 가능)(S33). 메시: Render CustomDepth Pass = True, Custom Depth Stencil Value 0~255(S34). 콘솔 등가 `r.CustomDepth 3`(S34).
- Epic 공식 선례: Stylized Rendering 샘플 — "Line Render" 절에서 SceneDepth를 UV ± 오프셋으로 샘플해 깊이 에지를 만들고 AO로 내부 선을 마스크. **4.24가 마지막 호환, 4.25부터 폐기**(S35). Hi-Fi Rush의 깊이·법선 2×2 Laplacian 포스트 윤곽(S18)이 UE4 상용 선례.

### 3.2 커스텀 셰이딩 모델 vs 포스트만 vs 5.8 Substrate Toon
- 내장 Shading Model 목록(Unlit·Default Lit·Subsurface·…·From Material Expression)에 Toon은 없다(S36). 엔진 enum에 `SSM_Toon`이 있으나 "not exposed in the UI"(S36).
- **UE 5.8 Substrate Toon Shading (Experimental):** "built on the Substrate Blendable GBuffer (legacy) mode", "supports all light types including local lights, sky lights, and Lumen global illumination", 제어는 "Substrate Toon BSDF" 노드와 "Toon Profile" 에셋(S37). 5.8 소개 기사: "doesn't yet support forward rendering"(S38). Epic Sébastien Hillaire(피드백 스레드): "experimental since they are iterating on it", 다른 슬랩과 블렌드 안 됨(S39). **윤곽선은 포함하지 않는다** — 커뮤니티는 Overlay Material로 윤곽을 따로 얹는다(S39). ramp·hatching 세부는 공식 노트 발췌에서 확인 못 함[미검증].
- 결론: 5.8에서는 "엔진 소스 수정 커스텀 셰이딩 모델" 없이 **Substrate Toon(램프) + 포스트 재질(윤곽)** 조합이 공식 경로다. 단 Experimental이므로 K3 결정에 쓰려면 실측이 먼저다.

### 3.3 Lumen과 툰
- Substrate Toon은 Lumen GI를 입력으로 받는다(S37) → 램프 입력으로 쓰는 경로가 공식이다.
- 끄는 경로: Project Settings > Rendering > Dynamic Global Illumination Method, 또는 Post Process Volume의 Global Illumination Method = None → "disables any global illumination or reflection calculations. Light sources will not create bounce light or reflections, and shadows will appear solid black"(S40·S41). 이미시브 바운스도 Lumen 전용이라 함께 사라진다(S41).
- 5.8 Lumen Medium Quality(Beta)가 추가됨(S38). 우리 황천식 안개·국소광 분위기는 GI 바운스에 기대므로 툰 변형에서도 Lumen을 **켠 채** 비교해야 PBR 변형과 조명 조건이 같다(§5 절차 결정).

### 3.4 Nanite와 윤곽선
- 5.2부터 "Nanite support for Custom Depth and Stencils", "Added support for Nanite meshes in the Custom Depth Stencil pass"(S42). 5.4: custom depth를 쓰는 Nanite 프록시는 "forced down the 'tested' path"(비용 경로)(S43).
- Nanite Skeletal Mesh: VSM 그림자, 메시당 1 draw call, 애니메이션 LOD(지오메트리 LOD 없음), 애니메이션 뱅크 인스턴싱, **모프 타깃 미지원**(S44). 5.8 노트에 Nanite 스켈레탈 관련 수정 항목 존재(S45).
- 깊이·법선 포스트 윤곽이 Nanite 메시에 동작하는지는 공식 문서 발췌에 직접 문장이 없다[미검증]. (SceneDepth·WorldNormal은 GBuffer에서 오므로 동작할 것이라는 판단은 [추정].)

### 3.5 윤곽의 다른 경로: Overlay Material
- "The mesh is rendered twice, once with a base material and once with the overlay material"(S27). `OverlayMaterialMaxDrawDistance`로 거리 컬링, 스켈레탈 메시는 슬롯별 오버레이 가능(S27). Epic 커뮤니티 튜토리얼 "Overlay Materials For Outlines and Other FX" 존재(본문 미열람)(S27). 인버티드 헐을 Overlay로 구현하는 정확한 절차는 공식 문서 발췌에 없음[미검증].

### 3.6 픽셀 패스(로우폴리 상위 도트)와의 결합
- SceneCaptureComponent2D: 렌더 타깃으로 캡처, `bMainViewResolution`·`MainViewResolutionDivisor`·`bIgnoreScreenPercentage`, Capture Every Frame 기본 off(S46). 11-06 사용자 결정 "UE면 픽셀 패스(K7) = SceneCapture2D + 저해상도 RT + 포스트"(DIRECTION_RESET 11-06 13:10)[사실]과 맞는다.
- **현 Unity 픽셀 패스는 이미 툰이다[사실]:** `unity/Assets/Exoduser/Resources/Shaders/RigPixelToon.shader` — `Band(d)=floor(saturate(d)*3+.5)/3`(3단 램프), 달빛 1 + 점광 4, 금속 하이라이트 2단(step .90/.97), 알베도를 `_PaletteColor` 단색 면으로 치환; `RigPixelComposite.shader` — 실루엣 림은 "continuous moon-facing silhouette only"(한 방향 이웃 알파 검사), 내부 면에는 안 그림. 즉 **"카잔식"의 캐릭터 절반(램프+실루엣 선)은 우리 픽셀 패스가 이미 하고 있고, 새로 결정할 것은 "세계(지형·소품)도 툰으로 가느냐"다.**

### 3.7 비용 추정
- 툰 변형의 ms 수치는 어느 공개 자료에도 없다[미검증]. 문서에서 확인되는 상대 비용만 적는다: After Tonemapping < Before Tonemapping(S29·S31), Custom Depth 사용 시 Nanite "tested" 경로(S43), Overlay = 메시 2회 렌더(S27), Substrate Toon = Blendable GBuffer(legacy) 모드 강제(S37). K4 과부하 테스트(동시 100마리·10분·p95 16.7ms)에서 PBR/툰 두 변형을 같은 조건으로 재는 것이 유일한 확정 방법이다.

### 3.8 Unity URP 대조(한 줄 + 근거)
- 우리 프로젝트는 Unity 6000.6.7f1, URP 17.6.0, Shader Graph 17.6.0[사실, `ProjectVersion.txt`·`manifest.json`]. 경로: Shader Graph 샘플의 Custom Lighting 컴포넌트(MainLight 노드: Direction·Color·Shadow Attenuation)(S47)로 램프, Full Screen Pass Renderer Feature(Injection Point, Requirements = Color/Depth/Normal)(S48)로 깊이·법선 윤곽, Render Objects Renderer Feature(Layer Mask, Override Material)(S49)로 헐 윤곽. UE 쪽 Substrate Toon에 해당하는 내장 툰 램프는 URP에 없고 Shader Graph로 직접 만든다(S47).

## 4. 우리 조건과의 적합 표

| 조건 | 장점 | 단점 | 필요 작업 | 출처·상태 |
|---|---|---|---|---|
| 33~34° 쿼터뷰 가독성(먼 적 3마리 보임이 합격) | 윤곽선은 실루엣을 배경에서 분리한다 — 탑다운 상용 선례(Ravenswatch "thick outlines … moving comic book", S21). | 1x 작은 캐릭터에서 램프 경계가 잡티로 읽힐 위험(Motomura의 "blotches" 원리, S16). 먼 거리 윤곽 1px은 CLAUDE.md "점 금지"와 충돌 가능. 거리별 두께 수치 없음. | 비교판에 "먼 적 3마리" 컷을 1x·3x 크롭으로 넣고 램프 경계·윤곽 점 수를 센다. 거리별 윤곽 컬링 거리는 실측으로 정한다(S27 `OverlayMaterialMaxDrawDistance` 또는 포스트 깊이 임계). | S16·S21·S27 [발췌], 수치 [미검증] |
| 동시 100마리·탄막 색 문법 | 셀 램프는 캐릭터 면 색이 단순해져 탄 색(PoE2식 "내 기술이 적 공격을 덮지 않는다")과 분리하기 쉽다[추정]. | 100마리 전부 Overlay(메시 2회 렌더, S27)면 draw 2배. Substrate Toon은 Blendable GBuffer 모드 강제(S37). | K4에서 툰 변형을 같은 100마리 장면으로 측정. 윤곽은 Overlay가 아니라 포스트 1패스로 두면 마리 수와 무관(S18 구조). | S27·S37·S18 [발췌], 비용 [미검증] |
| 픽셀 렌더 패스(로우폴리 상위 도트)와의 결합 | 캐릭터 램프·실루엣 림은 **이미 픽셀 패스 안에 있다**(RigPixelToon·RigPixelComposite)[사실]. 세계만 툰으로 바꾸면 캐릭터 공정은 불변. | 세계 툰 + 캐릭터 도트가 한 화면에서 "같은 게임"으로 읽히는지 선례 없음(Octopath는 세계가 실사풍 3D, S23). | K3 툰 변형에 캐릭터 대역 1체를 픽셀 패스로 올려 세계(툰)와 캐릭터(도트)의 톤 일치를 판정. | [사실]·S23 [발췌] |
| 스캔 기반 자산 공정과의 충돌(손그림 텍스처 필요량) | 카잔 배경은 "photorealistic textures"(S2)·"반실사"(S4)를 그대로 썼다 → 스캔 텍스처를 버리지 않아도 된다. | 셀 램프가 거친 바위·절벽을 "smooths out"해 길 찾기를 해친 리뷰(S7). 혈흔 같은 요소는 손작업(S6). 손그림 비율 수치 없음. | 알베도는 스캔 그대로, 램프는 조명만 양자화하는 안(§5 ③)으로 시작. 바위·절벽 가독성을 비교판 항목에 넣는다. | S2·S4·S6·S7 [발췌] |
| 황천식 안개·국소광 분위기 유지 | Substrate Toon이 로컬 라이트·스카이 라이트·Lumen GI를 받는다(S37) → 국소광 색이 램프에 들어간다. 5.8 Fog Screen Space Scattering(Experimental, Volumetric Fog·Local Fog Volumes 지원)(S38). | 램프 양자화가 높이 안개의 연속 그라데이션과 충돌할 수 있다[추정]. GI를 끄면 바운스 0·그림자 검정(S41). | Lumen은 켠 채 비교(§5). 안개는 램프 밖(포스트 뒤)에서 합성되게 Blendable Location을 Scene Color Before DOF/Bloom 쪽에 둔다(S31·S32). | S37·S38·S41 [발췌] |
| 실버 헬 UI 톤 | 윤곽·단색 면 세계 위에 은빛 강철 UI는 대비가 선명[추정]. | 카잔은 "vibrant colors, high contrast"(S2)인데 실버 헬은 채도를 낮춘 톤 → 카잔 색 문법을 그대로 가져오면 UI와 충돌. | 비교판에 HUD를 얹은 컷 1장 포함(CLAUDE.md 4.2-4 기준). | S2 [발췌] |
| K4 성능(100마리·10분·p95 16.7ms) | 포스트 윤곽은 마리 수와 무관한 1패스(S18 구조). After Tonemapping LDR이 저비용(S31). | Substrate Toon Experimental·forward 미지원(S38), Nanite custom depth "tested" 경로(S43), Overlay 2회 렌더(S27). 카잔도 "GPU-bound"(S9). | K4를 PBR/툰 두 변형으로 돌린다. 수치는 그때 기록. | S18·S31·S38·S43·S27·S9 [발췌], ms [미검증] |

## 5. K3 키샷 툰 변형 절차서 (Mac 실행용, 출처 있는 단계만)

전제: K3 PBR 키샷(1-1 다리·양쪽 늪·전경 고목·높이 안개·피치 34°, Fab/Megascans 무료 범위)이 먼저 있다(DIRECTION_RESET 11-06 02:50). 카메라 환산값은 PC K3 준비 문서 기준(거리 1900.8cm, 피치 −34°, 세로 FOV 46.945°, DIRECTION_RESET 11-06 13:50)[사실, 미커밋 문서 인용]. 툰 변형은 **같은 씬 복사본**에서 아래만 바꾼다. 기본값 의존 금지 — 바꾼 값은 전부 기록한다. 설정값 중 출처 없는 것은 `[조정값]`으로 표시했고, 첫 실물 판정 뒤 기록한다.

| 단계 | 할 일 | 설정·값 | 출처 |
|---|---|---|---|
| 0 준비 | Project Settings > Engine > Rendering > Custom Depth-Stencil Pass | **Enabled with Stencil** (에디터 재시작 요구될 수 있음) | S33, S30 |
| 0 준비 | Dynamic Global Illumination Method·Reflection Method는 PBR 변형과 **동일**하게 둔다(Lumen 유지) | PBR 변형 값 그대로 기록 | S40, S37 |
| ① 셀 램프 | 경로 A(권장 실험): 세계 재질을 Substrate Toon BSDF로 교체, Toon Profile 에셋 1개로 디퓨즈·스페큘러 램프 제어. Substrate 활성(Blendable GBuffer legacy 모드) | Toon Profile 램프 단계 [조정값: 2단부터 시작해 3단과 비교], 스페큘러 램프 [조정값] | S37 |
| ① 셀 램프 | 경로 B(폴백, 5.8 Experimental이 막힐 때): 포스트 재질 1개로 씬 컬러 밝기 양자화. Material Domain Post Process, Shading Model Unlit, Emissive만 출력 | Blendable Location = **Scene Color Before DOF**(렌더 해상도·선형, 안개·DOF 전에 램프가 끝남), 양자화 단계 [조정값] | S28, S29, S31 |
| ② 윤곽 | 포스트 재질 1개: SceneTexture:SceneDepth와 SceneTexture:WorldNormal을 UV ±1px 오프셋으로 샘플해 깊이 차·법선 차 에지(Stylized Rendering 샘플의 Line Render 구조, Hi-Fi Rush의 깊이·법선 Laplacian 구조). AO 마스크로 내부 선 억제 | Blendable Location = **Scene Color After Tonemapping**(LDR 저비용, TSR 뒤 풀해상도라 오프셋은 디스플레이 px 기준). 깊이 임계 [조정값: center depth로 나눠 거리 무관], 법선 임계 [조정값], 선 색 [조정값: 실버 헬 토큰에서 고른 어두운 강철색] | S35, S18, S31, S32, S24 |
| ② 윤곽 | 캐릭터 대역·먼 적만 선을 다르게 하려면 메시에 Render CustomDepth Pass = True, Custom Depth Stencil Value 지정, 포스트에서 SceneTexture:CustomStencil로 분기 | 값 1 = 영웅, 2 = 적 [조정값] | S34, S30 |
| ③ 알베도 단순화 | 스캔 알베도는 **그대로** 두고(카잔 배경 = photorealistic textures) 램프만 양자화한다. 포스터라이즈(색 수 줄이기)는 쓰지 않는다 — 리뷰가 지적한 "smooths out rocks and cliff faces" 가독성 손실을 재현하지 않기 위해. 색면 정리는 재질 기준선(러프니스·노멀 맵 필수, 슬라이더 1 공통 금지, DIRECTION_RESET 11-06 13:40)으로 한다 | 변경 없음(기록만) | S2, S7, [사실] |
| ④ 림 | 경로 A면 Toon Profile의 스페큘러 램프로, 경로 B면 포스트에서 WorldNormal·카메라 벡터 Fresnel로 실루엣 림. 황천식 역광 림 색은 조명(주광 역광)에서 오게 두고 림 상수를 더하지 않는다 | 림 폭 [조정값], 색 = 주광 색 | S37, S50(Fresnel 문서), 매뉴얼 02 |
| ⑤ 캐릭터 대역 1체 | SceneCaptureComponent2D로 캐릭터를 저해상도 RT에 캡처(`bMainViewResolution` off, RT 크기 고정, Capture Every Frame on), 포스트에서 합성. 캐릭터 램프·실루엣 림은 현 Unity RigPixelToon·RigPixelComposite 규칙(3단 램프, 달 방향 실루엣만)을 재현 | RT 크기 [조정값: Unity `TexelScale=max(1,h/1080)`·32 배수·≤1024 규칙 재현] | S46, [사실] |
| 판정 캡처 | 1920×1080·3840×1080, 1x·3x 크롭, 먼 적 3마리 컷, HUD 얹은 컷, PBR 변형과 같은 카메라·같은 프레임 | CLAUDE.md 4.2-4 | [사실] |

주의: Substrate Toon(①A)은 Experimental이고 forward 미지원(S38). 막히면 ①B로 가되, 보고서에 "경로 B"라고 적는다. 어느 단계도 Core 수치·판정을 바꾸지 않는다.

## 6. 결론

1. **툰이 없애는 것:** "고무 느낌"의 원인으로 추정된 넓은 반사 로브·소프트 주광·블룸(DIRECTION_RESET 11-06 13:40)은 램프 양자화로 **가려진다**(없어지는 게 아니다) — 카잔도 배경은 반실사 텍스처를 그대로 쓰고 라이팅만 애니메이션 쪽으로 당겼다(S2·S4). 텍셀 문제는 그대로 남고, 캐릭터 램프·실루엣 림은 우리 픽셀 패스가 이미 갖고 있다[사실].
2. **툰이 새로 만드는 것:** ① 1x 먼 적에서 램프 경계·1px 윤곽이 "점"으로 읽힐 위험(S16 원리, CLAUDE.md 점 금지), ② 거친 바위·절벽의 가독성 손실(S7 리뷰), ③ 5.8 Substrate Toon Experimental 의존 또는 포스트 2패스 비용(S37·S31), ④ 세계 툰 + 캐릭터 도트 조합의 선례 부재(S23).
3. **결정에 필요한 비교판 조건:** 같은 1-1 키샷·같은 카메라(34°)·같은 Lumen 설정으로 PBR/툰 두 변형, 각각 1920×1080과 3840×1080, 1x·3x 크롭, "먼 적 3마리" 컷, HUD 얹은 컷, 황천 기준 캡처 옆에 나란히. 성능은 K4를 두 변형으로 돌린 p95로만 말한다.

**미검증 목록(이 문서에서 [미검증]으로 둔 항목, 11개):** ① 카잔 셀 램프 단계 수 ② 카잔 윤곽선 구현 방식 ③ 카잔 손그림 텍스처 비율 ④ 카잔 조명 모델 수식(램프와 실시간 광원 관계) ⑤ 카잔 림·스페큘러 ⑥ 카잔 카메라 거리-윤곽 두께 규칙 ⑦ 카잔 툰 셰이딩만의 GPU 비용 ⑧ 1x 작은 캐릭터의 윤곽·램프 가독성(직접 출처 없음)과 거리별 윤곽 감쇠 수치 ⑨ Ravenswatch 엔진·셰이더 구현 ⑩ 포스트 깊이·법선 윤곽이 Nanite 메시에 동작한다는 공식 문장, Overlay Material 인버티드 헐 공식 절차, Substrate Toon의 ramp·hatching 세부 ⑪ UE 5.8 툰 변형의 ms 비용. 추가로 카잔 엔진 버전(UE4 다수 vs 뉴스퀘스트 "UE5")과 이규철 직함(Art Director vs Technical Director)은 출처 간 상충으로 남긴다.

**후속 레인이 원문을 열려면:** 세션 환경(Default, 허용 호스트 0)에 dev.epicgames.com·docs.unity3d.com·news.xbox.com·dailygame.co.kr·neople.co.kr·ggxrd.com·docswell.com·80.lv·passtechgames.com 허용이 필요하다(사용자 승인 사항, KZ는 제안하지 않았다).

## 7. 출처 (전부 검색 발췌, 원문 미열람)

| 번호 | 출처 | 비고 |
|---|---|---|
| S1 | 넥슨/네오플 뉴스 "넥슨, '카잔' 그래픽 활용 특유 분위기 구현…차별화 전략" — https://www.neople.co.kr/news/view?no=295 | 이규철 AD 목표 문장 |
| S2 | Xbox Wire, "Exploring the Stunning Cel-Shaded Art Style of The First Berserker: Khazan" (2025-03-27) — https://news.xbox.com/en-us/2025/03/27/exploring-the-stunning-cel-shaded-art-style-of-the-first-berserker-khazan/ | "photorealistic textures with 3D cel shading", "bold outlines, vibrant colors, and high contrast" |
| S3 | TheGamer, TGS 2024 인터뷰(이규철 AD) — https://www.thegamer.com/the-first-berserker-khazan-tokyo-game-show-2024-interview/ | "Different technology was used for the background and the characters." / "semi-realistic approach" |
| S4 | 데일리e스포츠(2024-10-04) "퍼스트 버서커: 카잔, 카툰 그래픽과 실사 배경이 조화를 이룬 방법은?" — https://www.dailygame.co.kr/view.php?ud=202410041432545839a7a3ff81e6_26 (전재: https://v.daum.net/v/20241004150542433) | 반실사 배경·라이팅 균형 |
| S5 | Foro3D(2026-01) "The First Berserker: Khazan Combines Unreal Engine and Cel Shading" — https://foro3d.com/en/2026/january/the-first-berserker-khazan-combines-unreal-engine-and-cel-shading.html | 2차 기사 |
| S6 | 뉴스퀘스트 인터뷰(2025-03) — https://www.newsquest.co.kr/news/articleView.html?idxno=241985 | 혈흔 손작업, 극화체 선택, "언리얼 엔진 5" 표기 |
| S7 | Restart 리뷰 — https://www.restart.run/articles/the-first-berserker-khazan-review | 리뷰어 관찰 |
| S8 | Wikipedia "The First Berserker: Khazan" — https://en.wikipedia.org/wiki/The_First_Berserker:_Khazan | UE4, 리뷰 요약 |
| S9 | DSOGaming PC performance analysis — https://www.dsogaming.com/pc-performance-analyses/the-first-berserker-khazan-pc-performance-analysis/ | UE4, GPU-bound, 1080p 100FPS+ |
| S10 | Deltia's Gaming 시스템 요구사항 기사 — https://deltiasgaming.com/?p=98920 | "heavily modified", UE4 유지 |
| S11 | Prima Games 그래픽 설정 가이드 — https://primagames.com/tips/the-first-berserker-khazan-best-graphics-settings-on-pc | 권장 1080p60 High |
| S12 | Gamers Heroes GDC 2025 인터뷰(윤명진·Ben Starr) — https://www.gamersheroes.com/features/the-first-berserker-khazan-gdc-2025-interview-myeongjin-yun-and-ben-starr-discuss-khazan-combat-and-emotional-rawness/ | 두 시각 접근 |
| S13 | 청년일보 NDC 25 기사 — https://www.youthdaily.co.kr/news/article.html?no=188387 | 카잔 OST 연주만 |
| S14 | Kurgan Compass, Hades 제작 파이프라인 — https://kurgancompass.com/?p=1338 ; Kotaku "The Art of Hades" — https://kotaku.com/the-art-of-hades-1845443438 | Maya→2D→AfterFX |
| S15 | Unite Tokyo 2018 miHoYo 강연 슬라이드 — https://docswell.com/s/UnityJapan/KWLQP5-unite-tokyo-20183rd | 머리카락·윤곽 색 |
| S16 | Junya C. Motomura, GDC 2015 "GUILTY GEAR Xrd" PDF — https://www.ggxrd.com/Motomura_Junya_GuiltyGearXrd.pdf | Inverted Hull, 정점색, 2톤 |
| S17 | ASW Academy "Guilty Gear Toon Line Control Techniques" — https://www.docswell.com/s/ASW_Academy/5LVY67-GG-Toonline-Eng | 헐용 노멀 분리 |
| S18 | Epic Games Japan, Unreal Fest 2023 Tokyo 『Hi-Fi RUSH』開発事例 — https://www.docswell.com/s/EpicGamesJapan/54QENW-UE_UF23T_TangoGameworks_1 | Post Process Outline Pass, 2×2 Laplacian, SKIP 플래그 |
| S19 | GDC 2024 "3D Toon Rendering in 'Hi-Fi RUSH'" — https://gdcvault.com/play/1034251/3D-Toon-Rendering-in-Hi ; 80.lv 요약 — https://80.lv/articles/the-making-of-hi-fi-rush-s-3d-toon-rendering-style | deferred toon, 전 세계 툰, 60fps |
| S20 | Passtech Games 블로그(AD 발언) — https://www.passtechgames.com/?p=4496 | illustrative style |
| S21 | Niche Gamer Ravenswatch 프리뷰 — https://nichegamer.com/ravenswatch-preview | thick outlines |
| S22 | Unity 블로그 "Smoke, mirrors and scrolling textures: behind the scenes of Tunic" — https://blog.unity.com/games/smoke-mirrors-and-scrolling-textures-behind-the-scenes-of-tunic | ortho + deferred 제약 |
| S23 | Unreal Engine Spotlight, Octopath Traveler HD-2D (2019-10-25) — https://www.unrealengine.com/spotlights/octopath-traveler-s-hd-2d-art-style-and-story-make-for-a-jrpg-dream-come-true | 2D 캐릭터 + 3D 배경, UE4 |
| S24 | openupm `com.zzamjak.toonshading` 설명 — https://openupm.com/packages/com.zzamjak.toonshading/ | 깊이 정규화 윤곽(오픈소스, 관례 근거) |
| S25 | Unity Discussions "Lit Outline Shader too thick" — https://discussions.unity.com/t/lit-outline-shader-too-thick-and-using-vr/723046 | 헐 거리 스케일 부작용 |
| S26 | Autodesk Maya pfxToon 노드 문서 — https://help.autodesk.com/cloudhelp/2027/ENU/Maya-Tech-Docs/Nodes/pfxToon.html | width-vs-distance |
| S27 | UE API `UMeshComponent`(OverlayMaterial, OverlayMaterialMaxDrawDistance) — https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/UMeshComponent ; 커뮤니티 튜토리얼 "Overlay Materials For Outlines and Other FX" — https://dev.epicgames.com/community/learning/tutorials/zj3x/ | 메시 2회 렌더 |
| S28 | UE 문서 "Post Process Materials in Unreal Engine" — https://dev.epicgames.com/documentation/en-us/unreal-engine/post-process-materials-in-unreal-engine | SceneTexture, Emissive만, Render Custom Depth |
| S29 | UE 문서 "Post Process Material Example"(4.27) — https://dev.epicgames.com/documentation/en-us/unreal-engine/post-process-material-example?application_version=4.27 | Domain/Unlit, Before Tonemapping 비용 |
| S30 | Epic 포럼 답변·Tom Looman "Multi-color Outline Post Process" — https://tomlooman.com/ue4-outline-post-process | Enabled with Stencil, CustomStencil 분기 |
| S31 | UE 문서 "Unreal Engine Material Properties"(Blendable Location 설명) — https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-material-properties | 위치별 설명·비용 문장 |
| S32 | UE 문서 "Temporal Super Resolution in Unreal Engine" — https://dev.epicgames.com/documentation/en-us/unreal-engine/temporal-super-resolution-in-unreal-engine | After Tonemapping = TSR 뒤 풀해상도 |
| S33 | UE 문서 "Rendering Settings in the Unreal Engine Project Settings" — https://dev.epicgames.com/documentation/unreal-engine/rendering-settings-in-the-unreal-engine-project-settings | Custom Depth-Stencil Pass 4옵션 |
| S34 | UE 문서 "Using Radial Motion Blur"·Python API StaticMeshComponent — https://dev.epicgames.com/documentation/en-us/unreal-engine/using-radial-motion-blur-in-unreal-engine | Render Custom Depth Pass, Stencil 0~255, r.CustomDepth==3 |
| S35 | UE 문서 "Stylized Rendering Post Processing"(4.27) — https://dev.epicgames.com/documentation/en-us/unreal-engine/stylized-rendering-post-processing?application_version=4.27 | Line Render, 4.24 마지막·폐기 |
| S36 | UE 문서 "Shading Models in Unreal Engine" — https://dev.epicgames.com/documentation/unreal-engine/shading-models-in-unreal-engine ; API `ESubstrateShadingModel` | 내장 목록, SSM_Toon UI 미노출 |
| S37 | UE 문서 "Unreal Engine 5.8 Release Notes" — https://dev.epicgames.com/documentation/unreal-engine/unreal-engine-5-8-release-notes | Substrate NPR Shading (Experimental) 절 |
| S38 | 80.lv "Unreal Engine 5.8 is Out Today…" — https://80.lv/articles/unreal-engine-5-8-is-out-today-with-big-optimization-improvements-and-mesh-terrain ; Epic 포럼 "Unreal Engine 5.8 Released" — https://forums.unrealengine.com/t/unreal-engine-5-8-released/2729274 | forward 미지원, Lumen Medium, Fog SSS |
| S39 | Epic 포럼 "Substrate Toon Material BSDF node" — https://forums.unrealengine.com/t/substrate-toon-material-bsdf-node/2696790 ; 커뮤니티 튜토리얼 스레드 — https://forums.unrealengine.com/t/community-tutorial-create-a-material-with-substrate-npr-shading-in-unreal-engine-5-8/2729374 | Hillaire 발언, Overlay 윤곽 |
| S40 | UE 문서 "Lumen Global Illumination and Reflections" — https://dev.epicgames.com/documentation/unreal-engine/lumen-global-illumination-and-reflections-in-unreal-engine | 활성 경로 |
| S41 | UE 문서 샘플 페이지(GI Method None 설명) — https://dev.epicgames.com/documentation/en-us/unreal-engine/10-16-lighting ; "Post Process Effects in Unreal Engine" — https://dev.epicgames.com/documentation/en-us/unreal-engine/post-process-effects-in-unreal-engine | None = 바운스 0·그림자 검정, 이미시브 Lumen 전용 |
| S42 | UE 5.2 Release Notes — https://dev.epicgames.com/documentation/unreal-engine/unreal-engine-5.2-release-notes | Nanite Custom Depth/Stencil |
| S43 | UE 5.4 Release Notes — https://dev.epicgames.com/documentation/unreal-engine/unreal-engine-5.4-release-notes | "tested" path |
| S44 | UE 문서 "Nanite Virtualized Geometry"·"Skeletal Mesh Rendering Paths" — https://dev.epicgames.com/documentation/en-us/unreal-engine/nanite-virtualized-geometry-in-unreal-engine ; https://dev.epicgames.com/documentation/unreal-engine/skeletal-mesh-rendering-paths-in-unreal-engine | Nanite 스켈레탈 기능·모프 미지원 |
| S45 | UE 5.8 Release Notes(S37과 동일 페이지) | Nanite 스켈레탈 수정 항목 |
| S46 | UE API `USceneCaptureComponent2D` — https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Engine/USceneCaptureComponent2D ; Blueprint "Capture Scene" | 해상도 옵션, Capture Every Frame |
| S47 | Unity 문서 "Shader Graph Sample Custom Lighting Components"(17.3) — https://docs.unity3d.com/Packages/com.unity.shadergraph@17.3/manual/Shader-Graph-Sample-Custom-Lighting-Components.html | MainLight 노드 |
| S48 | Unity 매뉴얼 "Full Screen Pass Renderer Feature reference for URP" — https://docs.unity3d.com/6000.1/Documentation/Manual/urp/renderer-features/renderer-feature-full-screen-pass.html | Injection Point, Requirements |
| S49 | Unity 매뉴얼 "Render Objects Renderer Feature reference for URP" — https://docs.unity3d.com/6000.0/Documentation/Manual/urp/renderer-features/renderer-feature-render-objects.html | Layer Mask, Override |
| S50 | UE 문서 "Using Fresnel in Your Unreal Engine Materials" — https://dev.epicgames.com/documentation/unreal-engine/using-fresnel-in-your-unreal-engine-materials | 림 노드 |

저장소 내부 사실 출처: `unity/Assets/Exoduser/Resources/Shaders/RigPixelToon.shader`, `RigPixelComposite.shader`, `unity/Assets/Exoduser/Runtime/NativeRigPixelPolicy.cs`, `unity/ProjectSettings/ProjectVersion.txt`, `unity/Packages/manifest.json`, `docs/0마스터플랜/DIRECTION_RESET_20261105.md`(11-06 02:00~13:50 절), `docs/0마스터플랜/DESIGN_PROPOSAL_CTO_20261105.md`.
