## 2026-11-05 CTO CX1 프리셋 보정 — 현재 보고

사용자 실행본 반영 없음. 현재 HEAD `efaa481c7da5100b1d998e08a3dcef3b919cc4dd`, 작업본/브랜치 `E:/exoduser-wt/codex-moodlab` / `codex/unity-moodlab-20261105`. 변경은 미커밋 상태로 총괄 검토 대기.
관문: **verify.mjs 갱신 후 1회 실행 PASS / C#·셰이더 컴파일·화면·Mac 판정 미확인**.
다음 일: Mac에서 같은 소스 컴파일 → a/b/c/d 캡처 → 실제 가림·명암·경계·LUT·합성 순서 판정.

근거는 [CX1_codex_urp_mood.md](CX1_codex_urp_mood.md)다. CX1 §2/§3/§8/§9는 이 장면에 적합한 안개 거리·밀도·림·WB·LUT 기여도를 **미확인**으로 남긴다. 아래 새 수치는 **“저작 시험값, CX1 §n 원칙 기준”**이며 공식 추천 범위가 있는 것처럼 쓰지 않았다. 각 데이터 행/필드와 셰이더 근사 상수 옆에도 해당 절을 주석으로 달았다. CX1에서 확인되는 LUT 기본 Size 32는 장면 권장값과 구별한다.

### 보정 값 표

공통으로 기존 A2 참조 광원 intensity 3.2 / RGB (.85,.90,1), 그림자 .55, Flat ambient (.26,.28,.30)×1, 안개 RGB (.105,.145,.17), filter (1,1,1), ACES를 쓴다. a는 커밋된 참조판의 수치와 렌더 경로를 유지한다. b/c도 광원·색 보정은 참조판과 맞추고 기법 차이를 분리했다. 카메라 **34° / 16.5u / 46.9453°**, 기존 목교·늪·고목·표식 배치 불변.

| 프리셋 | Linear 시작→완전 도달 | exposure / contrast / saturation | 추가 기법·값 | CX1 근거 |
|---|---|---|---|---|
| a A2 cool reference | 19→62u | .55 / 16 / -8 | 기존 기준판 그대로. 추가 안개·림·WB/LUT Volume 꺼짐 | §2/§10 검사 원칙만 적용, 재보정 없음 |
| b Height fog and rim | 22→68u | .55 / 16 / -8 | 높이 소멸계수 σ0=.020u⁻¹, y0=.20u, k=1.2u⁻¹, 통로 배율 .25. 림 power 4 / 강도 .12 / RGB (.55,.70,1) | 높이 §3, 림 §8, 가독성 §10 — 저작 시험값 |
| c Smooth medium and aerial perspective | 24→72u | .55 / 16 / -8 | 매질 σ0=.0025u⁻¹, 바닥 밀도 배율 .20, 산란색 위상 혼합 .65. 높이층·림 꺼짐 | §4.1/§10 — 저작 시험값 |
| d White balance and LUT | 19→62u | .40 / 10 / -12 | WB temperature -8 / tint +5, 사용자 LUT contribution .35. 추가 매질·림 꺼짐 | §9.1/§9.3 — 저작 시험값 |

b/c 공통 추가 optical depth 상한 .060, 경로당 고정 중점 표본 24개도 **저작 시험값, CX1 §3/§4.1/§10 원칙 기준**이다. 중앙 통로에서 측면으로 밀도를 잇는 2.2→6.2u, 림 상부 마스크 높이 .75→1.15u, c의 매끄러운 국소 매질 위치·폭·기울기는 미술용 근사 상수다. 실제 광원 그림자에 의한 volumetric shadow 값이 아니다.

d의 LUT는 메모리에만 생성하는 N²×N RGB 스트립이다. N은 활성 URP Asset의 `colorGradingLutSize`를 읽으며 공유 Asset은 수정하지 않는다. 기본 N=32이면 1024×32. RGBA32 / linear 데이터 / mip 없음 / Bilinear / Clamp. 입력 encoded RGB를 `RGB×(.96,.98,.94) + GBR×(.02,0,.03) + (.01,.005,.01)`로 매핑한다. 이 행렬·lift 역시 **저작 시험값, CX1 §9.3 원칙 기준**이다. LUT에 ACES를 다시 굽지 않으며 기존 톤 매퍼를 유지한다. 검은색→(.01,.005,.01), 흰색→(.99,.985,.98), 채널 변화가 단조이고 클리핑하지 않는 범위를 정적 검사했다. 원본의 소실된 정보를 복원한다는 의미는 아니다. 텍스처/이미지 파일 생성·수신·임포트 없음.

### 12u 먼 표식의 합성 투과율

기존과 동일한 **표식 중심 y=.805u** 검사 기준을 유지한다. 중심 eye-depth 약 25.998u. `T전체 = T거리 × exp(-min(.060, ∑σ·ds))`이며 a/d의 추가 σ는 0이다. 림·산란 밝기를 투과율에 더해서 통과시키지 않는다.

| 프리셋 | 중심 T전체 | 발끝 y=0 참고값 | 판정 범위 |
|---|---|---|---|
| a | 83.725% | 82.678% | 기존 중심 83% 기준 유지. 참조판 값 변경 없음 |
| b | 90.724% | 88.943% | 중심·발끝 모두 83% 이상 |
| c | 94.435% | 93.477% | 중심·발끝 모두 83% 이상 |
| d | 83.725% | 82.678% | A2 거리 안개를 유지해 a와 같은 기하학적 투과율 |

**범위 주의:** a/d의 발끝은 83% 미만이다. 따라서 위 PASS를 “표식 전신의 모든 픽셀이 83% 이상”으로 해석하면 안 된다. a를 그대로 두라는 CTO 지시에 따라 기존 중심 기준을 바꾸지 않았다. b/c는 전체 추가 매질이 상한까지 차도 중심 투과율 83% 이상인 보수적 예산도 검사했다. 실제 Lit fog/렌더 합성과의 일치는 Mac에서 확인해야 한다. 색 보정 후 명암·표식 식별성은 이 광학 수치로 판정하지 않는다.

### 근사 구현·한계·위험 API

- CX1 §4.1의 URP 내장 volumetric 부재를 전제로, 서드파티나 Renderer Feature를 넣지 않았다. **기존 불투명 메시와 같은 행렬/기하를 쓰는 광학 overlay**를 Transparent 단계에서 `ZTest Equal`, `ZWrite Off`, premultiplied blend로 합성한다. 바탕 Lit 재질의 조명·그림자와 기존 거리 안개는 유지한다. a/d에서는 overlay를 끈다.
- b: 카메라→표면의 24개 표본에서 `σ(y)=σ0·exp(-k·max(y-y0,0))`를 적분하고 통로 밀도를 낮춘다. Fresnel 림은 표식 머리/어깨 높이에만 적용한다. 상자 표식의 평평한 면 때문에 화면 1px 윤곽선이나 자연스러운 곡면 림을 보장하지 않는다.
- c: 같은 경로에 연속적인 기울어진 밀도 덩어리와 미술용 방향성 산란색을 적분한다. **그림자·광원 샘플링·물리 phase function·다중 산란이 없는 volumetric 유사 효과**다. 빈 하늘/투명체/캐릭터 RT 합성 전체를 처리하는 실제 볼륨 렌더러가 아니며, 최초 불투명 표면이 있어야 보인다.
- 점·디더·그레인·랜덤/시간 지터·노이즈 텍스처 없음. 고정 표본과 광학 상한 때문에 층/밴딩이 보일 수 있다. 이를 디더로 감추지 않는다. 화면에서 점이 0이라는 판정은 Mac 미확인이다.
- **위험 API/컴파일 관문:** `WhiteBalance.temperature/tint`, `ColorLookup.texture/contribution/ValidateLUT()`, `UniversalRenderPipelineAsset.colorGradingLutSize`, `Texture2D` linear 생성자·SetPixels·Apply, Resources Shader 로드, URP Core.hlsl의 world/clip/normal 변환 함수, overlay 깊이 일치/블렌딩. 존재하는 API를 사용했으나 **6000.6.7f1/URP 17.6 C#·Metal 셰이더 컴파일은 미실행**이다. [WhiteBalance 17.6 API](https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@17.6/api/UnityEngine.Rendering.Universal.WhiteBalance.html), [ColorLookup 17.6 API](https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@17.6/api/UnityEngine.Rendering.Universal.ColorLookup.html).
- `ValidateLUT()`가 설치 패키지에서 LUT를 거부하면 오류를 낸다. LUT 샘플 좌표/encoded RGB 해석, active grading 모드·tone mapper와의 순서, Gamma/Linear 및 실제 디스플레이 결과는 Mac 관문이다. 공개 master의 세부 구현을 설치 패키지와 같다고 단정하지 않았다(CX1 §9.2).
- overlay는 원래 메시마다 추가 드로를 만들고 fragment당 24표본을 평가한다. SRP batching/Metal 비용, ZTest Equal의 실제 정합, 투명체 순서, 원경 밴딩·가림은 **미확인**이다. RenderGraph/Compatibility Mode API는 사용하지 않았다. APV/라이트맵 베이크도 수행하지 않았다.

### 변경 파일·검사·실행 인자

수정한 기존 MoodLab 파일: `Runtime/MoodLab/MoodLabPresets.cs`, `Runtime/MoodLab/MoodLabScene.cs`, `Editor/MoodLab/verify.mjs` — 모두 `unity/Assets/Exoduser/` 아래. 본선 파일·기존 셰이더·Core·Always Included·Renderer Asset 수정 0.

새 파일: `Runtime/MoodLab/MoodLabAtmosphere.cs`와 `.cs.meta`, `Resources/MoodLab.meta`, `Resources/MoodLab/MoodLabAtmosphere.shader`와 `.shader.meta`. 새 shader는 Resources 로드로 포함하며 본선 Always Included를 수정하지 않는다. 기존 GUID 유지, 새 GUID 충돌 검사 통과. sed 사용 없음. 최종 공백 검사에서 CRLF 재기록과 Git 기준 LF의 차이를 확인해 PowerShell .NET으로 코드 파일을 기준 LF에 맞췄다. 검사 후 변경은 줄바꿈뿐이며 verify.mjs는 재실행하지 않았다. 최종 `git diff --check` PASS.

갱신한 `verify.mjs`를 **정확히 1회 실행, exit 0 / PASS**. 결과는 최신 `STATIC_CHECK.txt`. a 수치, efaa481c7 대비 카메라·배치, CX1 효과 분리, 합성 투과율/상한, LUT 경계, 7개 기존 Resources 경로, meta/GUID, 허용 파일 경계를 확인했다. 이는 Node 소스·수학 검사이며 C#/HLSL 실행 증명이 아니다. Git ignore 경로 권한 경고는 있었으나 검사 exit 0. Unity·Player·exo-unity·Python·유료 도구·git commit/push/stage 실행 0.

**Mac 실행 인자 변경 없음:** 기존 `--moodlab --mood=a|b|c|d --unity-qa-sandbox /tmp/exoduser-moodlab-qa --unity-mute`에 기존 해상도·로그 인자를 그대로 사용한다. 새 소스/Resources shader가 포함된 Mac 빌드가 필요하다. a→b→c→d→a 전환에서 추가 효과가 a에 남지 않는지도 확인한다. **컴파일·화면 미확인(Mac 담당), 본선 채택 대기.**

---

## 이전 보고 — 최초 코드 시안 이력

사용자 실행본 반영 없음. 작업본 `E:/exoduser-wt/codex-moodlab`, 브랜치 `codex/unity-moodlab-20261105`, 당시 기준/HEAD `75add6ff4a6209e2590a7a626ffb4c37b5f0268e`.
현재 관문: MoodLab 코드 시안 및 Node 정적 검사 PASS. **Unity 컴파일·Player·실제 화면·시각 판정 미확인(Mac 담당)**.
다음 일: 총괄이 새 파일 검토 → Mac에서 같은 소스 컴파일·4개 프리셋 캡처 → 먼 표식·접지·노이즈 판정. 사용자 지시대로 commit·push 없음.

# MoodLab 인계 — 2026-11-05 KST

## 범위와 진입

- 기존 추적 파일 변경 0, Core 변경/호출 0. 자기 작업본의 새 파일만 편집했다. 본선 설정·씬·빌드 목록·공용 잠금/예약 변경 없음.
- `--moodlab`이 없으면 진입 훅은 장면·광원·오디오를 바꾸지 않는다. `--mood=a|b|c|d`로 시작 프리셋 지정, 생략 시 a. 화면의 Mood a–d 버튼으로도 같은 장면에서 전환한다.
- `BeforeSceneLoad`에서 최초 장면의 루트를 비활성화해 본선 Awake/세이브 초기화를 막는다. sandbox 문법이 잘못된 경우에도 본선으로 돌아가지 않고 오류와 종료 코드 2를 요청한다. `AfterSceneLoad`에서 `SceneManager.CreateScene("MoodLab")`과 `SetActiveScene`으로 독립 장면을 만든다. 기존 장면은 비활성 상태로 메모리에 남긴다.
- `--unity-qa-sandbox <절대 경로>` 정확히 1개를 요구한다. 경로 문법만 검사하며 폴더 생성·열람·쓰기·세이브 resolver·PlayerPrefs 접근이 없다. MoodLab 자체는 저장하지 않는다. 사용자 세이브를 조회하지 않았다.
- 중복 `--mood=`, a–d 이외 값, `--remodel3d`, 다른 `--unity-*` review/gameplay 인자는 거부한다. 공용 실행기 무음 인자 `--unity-mute`는 허용한다. 자체 AudioListener pause/volume 0, 오디오 소스 추가 없음.
- Unity·Player·exo-unity 실행 0, 유료/생성 도구 0, python 실행 0, commit/push/stage 0. 다른 프로세스 종료·조작 0.

## 읽은 자료와 선택 이유

`NativeGame.A2Forest.cs`, `NativeGame.A2Field.cs`, `NativeGame.A2Bramble.cs`, `docs/4.1맵디자인+설정/UNITY_MAP_BOARD_20261026.md`를 확인했다. 운영/작업 매뉴얼은 `origin/main`의 정본 위치 안내를 따라 `origin/unity/main` Git 객체에서 읽었다.

A2Field 전체 조립을 부르면 NativeGame·맵·Core·투영 receiver 등과 연결되므로 호출하지 않았다. A2Forest의 기존 r3 Resources 모델과 배치·스케일 계수만 독립적으로 사용한다. A2Bramble의 가는 절차적 잔가지는 이번 조명 비교에 필요 없고 먼 화면의 점을 늘릴 수 있어 넣지 않았다. 맵 보드의 현행 1.61u 배우 높이와 34° 카메라·먼 적 가독성 기준을 표식 기준으로 쓴다.

**에셋 파일 생성 0.** 모델·목질 재질·흙 텍스처는 기존 Resources만 참조한다. 바닥/늪의 단순 면, QA 표식의 상자 기하와 복제 재질은 런타임 메모리에만 만들고 종료 시 정리한다. .unity/.prefab/.mat/.asset/텍스처·모델 파일은 만들거나 고치지 않았다. 씬 YAML 작성 없음.

현재 sparse-checkout은 Runtime/Editor/Resources/Shaders 중심이다. 사용한 7개 Resources 직접 경로는 **HEAD Git 트리에 존재**하지만 Art 파일은 이 작업본 디스크에 체크아웃돼 있지 않다. 복사·sparse 범위 변경은 하지 않았다. Mac의 해당 Resources가 갖춰진 프로젝트에서 임포트/실행해야 한다. `Resources.Load`가 실패하면 SETUP FAILED/종료 코드 2이며 대체 에셋으로 성공 처리하지 않는다.

## 새 파일

프로젝트 상대 경로:

- `unity/Assets/Exoduser/Runtime/MoodLab.meta`
- `unity/Assets/Exoduser/Runtime/MoodLab/MoodLabBootstrap.cs` 및 `.cs.meta`: opt-in, sandbox/충돌 인자 검사, 장면 격리 훅.
- `unity/Assets/Exoduser/Runtime/MoodLab/MoodLabPresets.cs` 및 `.cs.meta`: 카메라 상수·프리셋 데이터 표·근거 주석. **CX1 작성 후 이 표 한 곳을 맞춘다.**
- `unity/Assets/Exoduser/Runtime/MoodLab/MoodLabScene.cs` 및 `.cs.meta`: 장면·기존 모델·광원/Volume·늪·표식 조립과 프리셋 전환.
- `unity/Assets/Exoduser/Editor/MoodLab.meta`
- `unity/Assets/Exoduser/Editor/MoodLab/verify.mjs` 및 `.mjs.meta`: Unity 없이 실행하는 정적 검사. Editor 빌더는 불필요해 만들지 않았다.

산출물: 이 `REPORT.md`, 최신 `STATIC_CHECK.txt`. 기존 `run.log`는 실행 호스트의 로그라 건드리지 않았다.

## 프리셋 데이터와 근거

아래 값은 공개 자료의 **API/파라미터 의미**와 기존 코드의 수치를 바탕으로 만든 **시험 값**이다. Unity가 권장한 조합이나 시각 합격 수치가 아니다. 표의 RGB는 `new Color` 인자이고 광원 intensity는 기존 코드와 같은 상대값이다.

| 프리셋 | 방향광 intensity / RGB | 그림자 강도 | Flat ambient RGB × 배율 | Linear 안개 시작 → 완전 도달 | 안개 RGB |
|---|---|---|---|---|---|
| a A2 cool reference | 3.2 / (.85,.90,1) | .55 | (.26,.28,.30) × 1 | 19 → 62u | (.105,.145,.17) |
| b Moonlit blue | 2.7 / (.70,.82,1) | .55 | (.24,.27,.32) × 1.05 | 22 → 68u | (.10,.14,.20) |
| c Sulfur dusk | 2.8 / (1,.90,.67) | .50 | (.29,.28,.23) × 1 | 24 → 72u | (.18,.19,.115) |
| d Pale overcast | 2.4 / (1,.96,.90) | .40 | (.28,.29,.30) × 1.10 | 26 → 80u | (.20,.23,.24) |

| 프리셋 | postExposure | contrast | saturation | colorFilter RGB | 12u 표식 중심의 안개 투과율 계산 |
|---|---|---|---|---|---|
| a | .55 | 16 | -8 | (1,1,1) | 83.72% |
| b | .40 | 12 | -12 | (.94,.97,1) | 91.31% |
| c | .35 | 14 | -10 | (1,.98,.90) | 95.84% |
| d | .25 | 8 | -16 | (.98,1,.98) | 100.00% |

공통: ACES, hueShift 0, 방향광 회전 (49,-32,0), bias .035 / normal bias .12. **FilmGrain/Vignette/Bloom intensity 0을 명시적으로 override**하며 카메라 dithering false, AA None. 입자·점 효과·절차적 노이즈·데칼 없음. 기존 텍스처 자체의 고주파/스페큘러 점까지 화면에서 없어졌다는 판정은 하지 않았다.

기존 수치 근거(기준 SHA):

- `NativeGame.A2Field.cs` 조명: intensity 3.2, RGB (.85,.90,1), shadow .55, 회전 49/-32; postExposure .55, contrast 16.
- `NativeGame.A2Forest.cs` legacy 조명: intensity 2.4, RGB (1,.96,.90), shadow .65. A2Ambient sky (.26,.28,.30). 본선 Trilight 대신 Flat ambient로 표식의 비조명 영역이 완전히 검어지지 않게 시험한다.
- `NativeGame.HellLighting.cs` A2 분기: Linear fog 19–62u. 기존 색 보정 .25/16/-8 및 ACES. b–d는 이 범위의 광량을 유지하며 안개 시작/도달을 뒤로 미룬 시험안이다.
- `NativeRemodel3D.cs`: ForestA2 피치 34°, 거리 16.5u. `Resources/Data/remodel_camera.json`: FOV 46.9453. JSON의 비A2 피치 48.7014126°/거리 14는 사용하지 않았다.

웹 검색 후 확인한 Unity 공개 자료(2026-11-05):

- [URP 17.6 ColorAdjustments API](https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@17.6/api/UnityEngine.Rendering.Universal.ColorAdjustments.html): postExposure, contrast, saturation, 곱셈 tint인 colorFilter. 17.6 API는 postExposure를 EV100으로 기술하므로 수치를 임의의 lux로 환산하지 않는다.
- [Unity RenderSettings.fogEndDistance](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/RenderSettings-fogEndDistance.html): 선형 안개의 끝 거리.
- [URP 17.6 UniversalAdditionalCameraData](https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@17.6/api/UnityEngine.Rendering.Universal.UniversalAdditionalCameraData.html): renderPostProcessing, dithering, antialiasing, volumeLayerMask.
- [BeforeSceneLoad](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/RuntimeInitializeLoadType.BeforeSceneLoad.html): 최초 장면 객체 로드 후 Awake 이전 훅.
- [SceneManager.CreateScene](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/SceneManagement.SceneManager.CreateScene.html): 런타임 장면 생성 API.

## 장면 및 캡처 목록

저장된 새 씬 파일 0개. 런타임 씬 **MoodLab 1개**, 같은 배치에서 a/b/c/d 4컷을 비교한다.

- 카메라: 원근 34° / 16.5u / 수직 FOV 46.9453°. 주시점 (43.2,0,-67.8), yaw 0. 프리셋 전환 시 카메라/배치 불변.
- 목교 1개: 기존 `Art/map/a2/r3/Models/RF3_Rotten_Wood_Bridge`, 본선 좌표 (43.2,-71.8)의 x/z, yaw 24°, 스케일 (.96,.55,.85)×.75. y=-.06은 시험 평면 접지값이며 실제 접합은 미확인.
- 고목 6개: 기존 `RF3_Ancient_Tree_A/B`, 전경/중경/원경을 좌우에 배치. 넘어간 나무 1개: 기존 `RF3_Fallen_Log`.
- 바닥/늪: 기존 `Art/map/a2/hollow/Materials/A2_Loft_Bark`의 URP Lit 재질을 메모리에서 복제하고, 흙에는 기존 `Art/map/a2/ground/A2_ForestSoil_BaseColor`, `A2_ForestSoil_Normal`을 연결. 늪은 녹갈색의 매끈한 정적 Lit 수면이다. 본선 `A2ToxicRiver`는 custom ground-water pass/receiver가 필요해 호출하지 않는다. 물 흐름/평면 반사/본선 지형 복원 시험은 범위 밖이다.
- 적 대용 표식: 주시점으로부터 북쪽 0/7/12u에 1.61u 높이의 불투명 Lit 몸통·머리. x=-.8/.8/0. 암색 몸통 (.22,.23,.24), 밝은 머리 (.62,.60,.55), emission 0, 그림자 수광/투사. 실제 적 AI/애니메이션/전투 검증은 아니다.

**안개 거리 주의:** 62/68/72/80u는 플레이어로부터의 반경이 아니라 카메라 eye-depth 기준이다. 12u 표식 중심의 eye-depth는 약 25.998u. `clamp((end-depth)/(end-start),0,1)`로 위 투과율을 계산했다. 3개 표식의 발끝/머리끝이 수직 시야 안에 들어오는 수학 검사도 통과했지만, 가림·명암·실제 셰이더 결과를 보증하지 않는다. 실행 로그는 `[MoodLab]`에 프리셋, 거리, 투과율, inFrustum을 남기고 visual verdict는 PENDING으로 기록한다.

Mac 캡처용 Player 인자(이 레인에서 실행하지 않음):

```text
--moodlab --mood=a --unity-qa-sandbox /tmp/exoduser-moodlab-qa --unity-mute -screen-width 1920 -screen-height 1080 -screen-fullscreen 0 -logFile /tmp/exoduser-moodlab.log
--moodlab --mood=b --unity-qa-sandbox /tmp/exoduser-moodlab-qa --unity-mute -screen-width 1920 -screen-height 1080 -screen-fullscreen 0 -logFile /tmp/exoduser-moodlab.log
--moodlab --mood=c --unity-qa-sandbox /tmp/exoduser-moodlab-qa --unity-mute -screen-width 1920 -screen-height 1080 -screen-fullscreen 0 -logFile /tmp/exoduser-moodlab.log
--moodlab --mood=d --unity-qa-sandbox /tmp/exoduser-moodlab-qa --unity-mute -screen-width 1920 -screen-height 1080 -screen-fullscreen 0 -logFile /tmp/exoduser-moodlab.log
```

기존 Player에는 이 새 코드가 없으므로 총괄 검토 후 같은 소스로 만든 Mac Player가 필요하다. `--remodel3d`나 별도 review 플래그를 붙이지 않는다. 숨김·무음 캡처는 Mac 담당의 기존 실행 절차를 따른다. 위 인자는 자동 캡처를 수행하지 않는다. 1920×1080 a–d와 3840×1080 a–d, 1x/3x 비교에서 12u 표식이 안개·어둠·나무로 사라지면 FAIL. 목교 접합·표식 접지·반짝이는 점/그레인도 직접 확인한다. 실패 프리셋은 인수하지 않는다.

## 검사 결과와 남은 위험

- Node v24.15.0: `node --check unity/Assets/Exoduser/Editor/MoodLab/verify.mjs` PASS.
- `node unity/Assets/Exoduser/Editor/MoodLab/verify.mjs` PASS: opt-in/격리 소스 계약, 괄호·문자열·주석 종료, 4개 수치 범위/안개 예산, 표식 시야 계산, Resources 직접 경로 7개 Git 존재, 파일/폴더 meta, 파일 GUID 충돌, 기존 추적 파일 무변경.
- `git diff --check` PASS, HEAD/브랜치 불변. GUID/경로 검사와 단순 구문 검사는 C# 컴파일러가 아니다. 인자 분기 역시 소스 계약 검사이며 실제 C# 실행 테스트는 하지 않았다.
- 초기 구현 전에는 진입 파일 부재로 검사 실패를 확인했다. 이후 검사기가 `NativeGame.A2Field.cs` 출처 주석을 본선 호출로 오인한 문제를 찾아 주석을 제외하도록 수정했다. 최종 검사는 통과했다.
- Git의 사용자 ignore 경로 읽기 권한 경고가 있었으나 Git diff/정적 검사 exit code는 0. CIM 프로세스 상세 조회는 권한 거부, `Get-Process` 대체 조회에서 기존 EXODUSER-A2R 등의 존재만 확인했다. 소유 프로세스/잠금을 조작하지 않았다.
- `ProjectVersion.txt`와 `Packages/manifest.json`의 HEAD 객체에서 **Unity 6000.6.7f1 / URP 17.6.0** 확인. 새 API 패키지·asmdef 참조 추가 없음. 기존 Runtime asmdef의 URP/Core Rendering 참조를 사용한다.
- **컴파일 위험 표시:** `CameraExtensions.GetUniversalAdditionalCameraData`, `UniversalAdditionalCameraData.dithering/volumeLayerMask`, `VolumeProfile.Add<T>(bool)`, `ColorAdjustments`/`Tonemapping`/`FilmGrain`/`Vignette`/`Bloom` 파라미터는 기존 코드 또는 공개 API로 존재를 확인한 범위다. 실제 17.6 어셈블리 링크·AOT/stripping·Unity 컴파일은 미실행이므로 Mac 컴파일 관문을 남긴다. 추측 API나 RenderGraph/custom renderer API는 사용하지 않았다.
- **실행 위험 표시:** 같은 단계의 다른 RuntimeInitialize 훅 순서는 보장되지 않는다. 지정 인자만 쓰고, 최초 실행에서 본선 NativeGame Awake/세이브 초기화가 없고 MoodLab만 나타나는지 Mac에서 확인해야 한다. Resources 누락·셰이더 stripping·Volume 기본 프로필 영향·광원 그림자·메시 접지·시각 가독성은 정적 검사로 판정하지 않았다.

**최종 상태: 코드 시안 인계 / 컴파일·화면 미확인(Mac 담당). 본선 채택·시각 PASS·완료 빌드 주장은 없음.**
