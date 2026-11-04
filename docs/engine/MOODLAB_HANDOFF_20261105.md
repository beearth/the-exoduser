## 2026-11-05 CX5 2차 — 격리 수정·분위기 확대·실제 PNG 비교

기준/현재 HEAD `2f5d8fd1546f4b6eb071854316638fac0e0a946a`, 작업본 `E:/exoduser-wt/codex-moodlab`, 브랜치 `codex/unity-moodlab-20261105`. 사용자 실행본 반영·commit/push 없음.
현재 판정: **정적 검사 PASS, PNG 검사기 테스트 10/10 PASS. 새 코드의 Unity 컴파일·실행·화면은 미확인. 실제 프리셋 쌍별 차이는 PNG 부재로 미측정.**
다음 일: Mac에서 지연 차단 임시 패치 없이 재컴파일 → 격리 로그 확인 → a/b/c/d 같은 해상도 PNG → 아래 6쌍 평균 차 검사와 표식·점 판정.

### 1. 이전 격리 보고 정정과 원인 추적

**앞 보고의 “본선 Awake를 막는다”는 검증되지 않은 잘못된 주장이다.** 사용자 전달 Mac 결과에서 기존 NativeGame·로비 영상·타이틀이 남았으므로 기존 격리 구현은 FAIL이다. 이전 Mac의 컴파일 0·예외 0·표식 가독·점 0은 **2f5d8fd15 기준의 이전 결과**이며 이번 수정의 실행 증거로 재사용하지 않는다.

추적한 실제 생성 경로:

1. `Editor/PortVerification.cs:200–205`는 `Assets/Scenes/FirstPlayable.unity`를 생성/재사용하고 빌드 씬으로 설정한다. 씬에는 활성 `EXODUSER Native CSharp` 루트와 NativeGame이 **직렬화되어 있다**. NativeGame script GUID `f30729c3a3631a08560b468b4da71c88`는 `.cs.meta`와 일치한다. 이번에 씬 파일을 쓰지 않았다.
2. `Runtime` 전체의 RuntimeInitializeOnLoadMethod **37개 위치**를 조사했다. 목록/본문 앞부분은 최신 `RUNTIME_INIT_AUDIT.txt`에 보관했다. MoodLab 외에는 명시적 review/check/mute 플래그를 검사하는 진입점이며, **Runtime 훅이 NativeGame을 AddComponent로 새로 만드는 경로는 발견되지 않았다**. 별도 Editor 검증 fixture의 AddComponent 경로는 Player 진입점과 구별했다.
3. `NativeGame.cs:102/104`의 Awake 첫 문장은 `Instance=this`다. 이후 `:139` 오디오, `:141` 음악/환경음, `:147–148` NativeLobby 생성/Initialize, `:149` 설정 저장 초기화가 이어진다. `NativeLobby.Initialize`에서 영상/AudioSource/캐릭터 저장소를 준비한다. 설정 저장소는 `NativeGame.SettingsPersistence.cs`, 캐릭터 저장소는 `NativeLobby.CharacterStore.cs`에서 실제 Store/로드로 연결된다.
4. **확정한 소스 결함은 차단 대상 선정에 있다.** 기존 MoodLabBootstrap은 Awake 전 시점에 `sceneCount → scene.isLoaded → GetRootGameObjects`를 거쳐서만 대상을 껐다. 첫 씬의 객체가 메모리에 있어도 그 씬의 완료 상태/열거 조건을 만족하지 않으면 차단이 통째로 빠진다. 직렬화된 NativeGame 생성 경로를 직접 차단하지 않았고, 차단된 객체 수도 검증하지 않았다. Mac에서 당시 `sceneCount/isLoaded`의 정확한 값은 로그가 없어 역확인할 수 없다. 그 내부 값까지 관측한 것처럼 쓰지 않는다.

수정은 **MoodLab 파일 안에서만** 했다. 본선 기존 파일 예외 수정 0개이며 최소 한 줄 패치도 필요하지 않았다.

- `Runtime/MoodLab/MoodLabBootstrap.cs:61–66`: Awake 전 `FindObjectsByType<NativeGame>(FindObjectsInactive.Include, None)`로 직접 찾고 그 루트를 비활성화한다. `scene.isLoaded`는 진단 로그로만 읽고 필터로 쓰지 않는다. 2초 후 끄기·코루틴 대기·영상 시작 후 숨기기 없음.
- `:89–96`: AfterSceneLoad에서 **NativeGame.Instance / NativeLobby / AudioSource / VideoPlayer가 모두 0인지 검사**한다. Instance는 Awake 첫 줄의 표식이므로 이미 Awake가 진입한 실행을 가려서 성공 처리하지 않는다. 하나라도 남으면 오류/종료 코드 2로 실패시키고 MoodLab을 만들지 않는다.
- 초기화가 차단되면 위 NativeGame 경로의 오디오·영상·세이브 초기화도 진입하지 않는다. MoodLab은 NativeQaSandbox resolver/사용자 세이브 경로/Store를 호출하지 않는다. **이것은 소스 제어 흐름 확인이며 이번 Player에서 초기화 0을 관측했다는 주장은 아니다.** Mac에서 아래 로그와 sandbox IO를 함께 확인해야 한다.
- 전용 카메라는 `Untagged`, culling/Volume mask는 레이어 30만 사용한다. 생성 모델·면·캡슐·overlay·Volume을 같은 레이어에 둔다. MainCamera를 공유하지 않는다. 피치/거리/FOV/주시점·목교/늪/고목 배치·표식의 기존 x/z는 유지한다.

Mac에서 기대하는 격리 로그:

```text
[MoodLab isolation] before-Awake target=EXODUSER Native CSharp sceneLoaded=<실측값>
[MoodLab isolation] blocked NativeGame objects=<FirstPlayable에서는 1 예상>
[MoodLab isolation] Awake/NativeLobby/AudioSource/VideoPlayer=0; no NativeGame startup IO path entered
```

이 0 로그 없이 스크린샷만 정상인 경우 격리 PASS로 처리하지 않는다. 현재 빌드 경로는 FirstPlayable 단일 진입 기준이다. 다른 생성 경로/추가 씬의 미래 생성까지 검증했다고 주장하지 않는다. BeforeSceneLoad의 객체 탐색 방식은 [Unity 공식 예제](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/RuntimeInitializeLoadType.BeforeSceneLoad.html)에 근거한다.

### 2. 분위기 확대 — 모두 저작 시험값

이전 a 대비 차이 b=1.8/c=2.1/d=6.5와 b 림 미식별은 사용자 전달 Mac FAIL 근거다. 수치 확대만으로 차이 15 이상이 됐다고 판단하지 않는다. a 프리셋 수치는 유지하고 b/c/d를 아래처럼 벌렸다. CX1은 기법 원칙의 출처이며 **이 값들을 추천한 문서는 아니다**.

| 프리셋 | 의도 / 주광 RGB / ambient RGB | 거리 안개 시작→끝 / 안개 RGB | exposure / contrast / saturation |
|---|---|---|---|
| a | A2 기준 / (.85,.90,1) / (.26,.28,.30) | 19→62u / (.105,.145,.17) | .55 / 16 / -8 |
| b | 청록 저지대·강한 상부 림 / (.55,.82,1) / (.22,.30,.34) | 22→68u / (.16,.34,.42) | .55 / 18 / -12 |
| c | 황갈색 유황 산란 / (1,.73,.42) / (.30,.23,.15) | 24→43.2u / (.42,.24,.10) | .45 / 20 / +8 |
| d | 청보라 암부·낮은 채도 곡선 / A2 광원·ambient 유지 | A2 19→62u / A2 RGB 유지 | .30 / 26 / -24 |

방향광 intensity는 a/b/d 3.2, c 3.0. shadow는 a/b/d .55, c .50. ambient multiplier 1, colorFilter (1,1,1), ACES 공통. 장면 전체 조명을 꺼서 차이를 만드는 방식은 쓰지 않았다.

| 프리셋 | 강화한 효과와 숫자 | 근거 범위 |
|---|---|---|
| b | 높이 σ0 .020→.100 **5배**, 기준 높이 .20→.60u, falloff 1.2→.9, 통로 밀도 배율 .25, optical-depth cap .060→.240 | 저작 시험값, CX1 §3/§10 원칙 기준 |
| b 림 | 강도 .12→.90 **7.5배**, power 4→2, RGB (.65,.85,1). 상부 마스크 .75→1.15u | 저작 시험값, CX1 §8 원칙 기준 |
| c | σ0 .0025→.00625 **2.5배**, 산란 제어 .65→1.625 **2.5배**, 거리 감쇠 구간 48→19.2u로 기울기 **2.5배**, optical-depth cap .150 | 저작 시험값, CX1 §4.1/§10 원칙 기준 |
| d | WB temperature -30 / tint +24, 사용자 LUT 기여도 .85, RGB scale (.80,.92,.98), cross (.06,0,0), lift (.035,.015,.005) | 저작 시험값, CX1 §9.3 원칙 기준 |
| d 곡선 | LUT의 `v + .65·v·(1−v)·(2v−1)` 대비 S곡선, 이후 luminance 기준 saturation .70 | 저작 시험값, CX1 §9.3 원칙 기준; 별도 ACES 중복 없음 |

c 셰이더의 Scatter는 단순 lerp 외삽 가중치에서 **산란색의 강도 제어**로 바꿨다. 고정 표본 24개·연속 매질·노이즈 없는 근사 원칙은 유지한다. 배율은 제어 수치의 배율이며 화면 평균 차나 물리 산란량이 정확히 2.5배라는 보증이 아니다.

표식은 **같은 0/7/12u 위치**에 지름 .64u·높이 1.61u의 Unity 내장 캡슐을 하나씩 세운다. 사용자 허용의 “캡슐+림 셰이더” 경로를 택해 곡면 노멀에서 림을 보게 했다. 새 캐릭터/메시/프리팹 에셋 생성 없음. 기존 `Resources/Characters/Warrior.prefab`의 존재도 git ls-tree로 확인했지만 이번에는 해당 프리팹의 Animator/컴포넌트 경로를 섞지 않았다. 캡슐 Collider는 즉시 비활성화 후 제거한다.

좌상단에는 프리셋 설명/의도 **한 줄**을 GUI.Label로 표시한다. 기존 프로젝트 폰트 `Art/fonts/NativeLobbyNotoSansKR-Regular`를 사용하며 시험 도구 전용 문구다. 게임 로컬라이제이션/본선 표시 문자열을 바꾸지 않았다.

### 3. 실제 물 재질과 숨은 의존

`git ls-tree`로 기존 `unity/Assets/Exoduser/Resources/Shaders/A2ToxicRiver.shader`의 존재를 확인했다. 본선 A2와 같은 방식으로 **기존 A2ToxicRiver 셰이더를 사용하는 런타임 Material**을 만들어 기존 늪 평면에 적용한다. 기존 .mat 파일이 Resources에 있는 것처럼 주장하지 않는다. 새 .mat/텍스처/셰이더 파일 생성 없음.

숨은 의존은 pass의 `LightMode=ExoduserGroundWater`다. 일반 UniversalForward pass가 아니므로 재질만 바꾸면 그려지지 않는다. 본선 NativeGroundSkillProjection은 NativeRemodel3D.Active/receiver 상태에 묶여 있어 호출하지 않았다. 새 `Runtime/MoodLab/MoodLabWaterPass.cs`가 **MoodLab 카메라·레이어 30만** 처리하는 RenderGraph pass로 동일한 기존 shader tag를 그린다. Renderer Asset·feature 목록·Always Included·본선 셰이더는 수정하지 않는다.

물은 카메라 Depth Texture가 필요하다. 평면 반사·shore distance-field는 이번 장면에서 비활성화(`_PlanarStrength=0`, `_ShoreReady=0`)하고 기본 검정 텍스처를 쓴다. 셰이더가 강도 0에서도 VP의 w로 나누므로 `_PlanarVP`는 유효한 카메라 행렬로 설정한다. emission 0, foam RGB (.21,.22,.09)로 밝은 점을 추가하지 않도록 낮췄다. 기존 셰이더의 사인 흐름/스페큘러는 남는다. **새 물 표면의 점 0은 아직 Mac 미확인**이며 이전 정적 늪의 점 0 판정으로 대신하지 않는다.

### 4. 12u 투과율 — 기준 미달을 숨기지 않음

거리 안개와 추가 매질의 투과율을 곱한 값이다. 표식 중심 y=.805u, 발끝 y=0. 림/산란 밝기를 투과율에 더하지 않는다.

| 프리셋 | 중심 T전체 | 발끝 T전체 | 83% 기준 판단 |
|---|---|---|---|
| a | 83.725% | 82.678% | 중심 충족, 기존 발끝 미달 유지 |
| b | 84.814% | **79.554%** | 중심 충족, 높이층을 보이도록 올려 발끝 감쇠 증가. **총괄 판단 필요** |
| c | 86.351% | 84.015% | 계산상 둘 다 충족 |
| d | 83.725% | 82.678% | 거리 안개가 a와 같아 동일. 색 보정 후 가독성은 별도 |

b 발끝 미달은 높이 밀도 5배·층 높이 확대에 따른 결과다. 이를 숨기기 위해 표식만 안개에서 제외하거나 림 밝기를 보존율로 세지 않았다. 실제 먼 표식의 몸통·발이 지워지면 FAIL이며 숫자만으로 인수하지 않는다. a/d 발끝 미달도 계속 총괄 판단 대상으로 남긴다.

### 5. PNG 쌍별 평균 차 검사 — 실제 픽셀만 측정

`Editor/MoodLab/verify.mjs`에 `--png a.png b.png c.png d.png` 모드를 추가했다. **a-b/a-c/a-d/b-c/b-d/c-d 6쌍 전부** 전체 프레임 RGB 채널 절댓값 차의 평균을 계산한다. 값 범위는 0–255, 각 쌍의 기준은 **15 이상**이다. 미달 쌍 이름과 수치를 모두 출력한다. 이것은 지각 Delta E가 아니며, ROI 선택·크기 조절·크롭으로 통과시키지 않는다.

- PNG 4장이 모두 있어야 측정한다. 경로가 없거나 모자라면 `미측정`, 명시적 이미지 모드 exit 2. 일반 소스 검사에서 PNG가 없으면 소스 검사만 수행하고 **화면 평균 차 미측정**을 출력한다.
- 새 외부 디코더/패키지 의존 **0**. `png-check.mjs`는 Node 기본 fs/zlib와 자체 PNG CRC/필터 0–4 복원만 사용한다. 지원은 **비인터레이스 8-bit RGB/RGBA PNG**이며 그 밖의 비트 깊이·팔레트·APNG 등은 명시적으로 오류로 거부한다. 4장 크기가 다르면 오류다. RGBA는 검정에 합성하고 투명 픽셀 존재를 알린다. ICC/gamma 변환은 하지 않고 저장된 RGB 값을 비교한다.
- 메모리 내 PNG fixture로 필터 0–4, RGBA, CRC 손상/지원 밖 형식, 기준값 15 포함, a 대비만 보면 놓치는 b-c 미달, 크기 불일치 등 **10개 테스트 PASS**. 실제 게임 캡처를 합성/생성해서 검증한 것이 아니다. PNG 에셋 파일 생성 없음.
- 이 작업본에 Mac PNG가 없어 **실제 6쌍 평균 차는 미측정**이다. 정적 검사의 값 차이나 LUT 차이를 화면 차 15로 대체하지 않았다. 쌍별 차 PASS도 장면 격리·점·가독성 PASS를 뜻하지 않는다.

### 6. Mac 재캡처 인자·새 코드 위험·변경 경계

임시 “2초 뒤 끄기” 패치를 제거하고, 이번 소스와 Resources가 포함된 Player를 사용한다. 기존 sandbox 전제는 유지한다. `--moodlab` 단독으로 sandbox가 없으면 **거부/종료 2**이며 본선으로 넘어가지 않는다.

```text
--moodlab --mood=a --unity-qa-sandbox /tmp/exoduser-moodlab-qa --unity-mute -screen-width 1920 -screen-height 1080 -screen-fullscreen 0 -logFile /tmp/exoduser-moodlab-a.log
--moodlab --mood=b --unity-qa-sandbox /tmp/exoduser-moodlab-qa --unity-mute -screen-width 1920 -screen-height 1080 -screen-fullscreen 0 -logFile /tmp/exoduser-moodlab-b.log
--moodlab --mood=c --unity-qa-sandbox /tmp/exoduser-moodlab-qa --unity-mute -screen-width 1920 -screen-height 1080 -screen-fullscreen 0 -logFile /tmp/exoduser-moodlab-c.log
--moodlab --mood=d --unity-qa-sandbox /tmp/exoduser-moodlab-qa --unity-mute -screen-width 1920 -screen-height 1080 -screen-fullscreen 0 -logFile /tmp/exoduser-moodlab-d.log

node unity/Assets/Exoduser/Editor/MoodLab/verify.mjs --png /absolute/a.png /absolute/b.png /absolute/c.png /absolute/d.png
```

두 해상도를 섞지 말고, 3840×1080도 별도의 a/b/c/d 4장으로 같은 검사를 실행한다. 새 카메라는 MainCamera 태그가 없으므로 캡처 도구가 Camera.main에 의존하면 `MoodLab camera 34deg 16.5u`를 명시적으로 찾거나 전체 화면 캡처를 사용한다. a→b→c→d→a 전환 잔류 효과도 확인한다.

위험 API/미확인: BeforeSceneLoad에서 inactive 객체 직접 탐색/비활성화의 실제 6000.6 동작, 새 RenderPipelineManager.beginCameraRendering→EnqueuePass 주입 시점, RecordRenderGraph/RendererList/depth attachment 및 Metal depth-texture 합성, 물 스페큘러·림·LUT 곡선 최종 결과. RenderGraph 본문은 기존 NativeGroundSkillProjection의 물 pass에서 쓰는 API를 좁혀 사용했으며, 공개 URP 소스도 참고했지만 설치 패키지와 같다고 단정하지 않았다. **이번 C#·HLSL 컴파일/Player 실행은 하지 않았다.**

수정: MoodLabBootstrap.cs / MoodLabScene.cs / MoodLabPresets.cs / MoodLabAtmosphere.cs / Resources/MoodLab/MoodLabAtmosphere.shader / Editor/MoodLab/verify.mjs.
추가: Runtime/MoodLab/MoodLabWaterPass.cs, Editor/MoodLab/png-check.mjs, Editor/MoodLab/png-check.test.mjs 및 각 `.meta`.
본선 파일·Core·기존 A2 shader·씬 파일·Renderer Asset 변경 0. 기존 tracked .meta GUID 유지. git diff --check PASS, 기존 LF 유지·sed 사용 0. Unity·Player·exo-unity·Python·유료 도구·commit/push/stage 실행 0.

증거: 최신 `STATIC_CHECK.txt`, `RUNTIME_INIT_AUDIT.txt`. **수정 코드 인계이며 Mac의 격리 재판정/4컷 차이 15/가독성·점 관문은 아직 미통과 상태다.**

---

## 2026-11-05 CTO CX1 프리셋 보정 — 이전 보고

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
