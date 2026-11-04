# Development 빌드 필드 초기화 예외 조사 — 2026-11-05

- 작업본: `E:/exoduser-wt/codex-study-combat-team`, 브랜치 `codex/unity-devbuild-fieldinit-fix-20261105`.
- 기준/현재 HEAD: `0a5802e84eb90ea62fa96dd1518034bc49edeeaf` (`unity/main` 기준). 새 커밋·push 없음: 총괄 검토용 작업 변경이다.
- 범위: `unity/Assets/Exoduser/Runtime` C# **426개**, 부분 선언을 합친 검사상 타입 **915개**. Core도 읽기 조사에 포함했으며 **Runtime/Core 수정 0**.
- 판정: 소스 수정·Node 검사 통과. Unity 컴파일·Development 빌드 확인은 **미확인(Mac 담당)**. 화면 동일성·실게임 예외 소멸도 미확인이다.

## 원인과 수정 원칙

사용자 제공 증상은 `60d48b0f1` 이후 Development 첫 프레임의 `UnityException`, 후속 `ArgumentNullException`, 약 1.5GB 로그다. 이번 레인에서는 원본 Player 로그를 읽거나 재현 실행하지 않았다. 해당 커밋의 `A2SightFade` 추가 및 기준 소스의 필드 초기화는 확인했다. MonoBehaviour 구성 중 native 생성이 실패하면 관리 객체의 후속 초기화도 중단될 수 있으므로 매 프레임의 null 예외만 막는 것으로 끝내지 않았다.

Unity는 생성자/필드 초기화 중 Unity API 호출을 제한하며 직렬화 중 생성되는 일반 클래스도 해당한다. [공식 직렬화 오류 문서](https://docs.unity3d.com/cn/2022.2/Manual/script-Serialization.html)를 근거로, 직접 MonoBehaviour 필드와 정적 필드에서 native 객체 생성을 제거했다. 기존 접근 이름은 null을 검사하는 읽기 전용 지연 속성으로 유지했다. 최초 GetPropertyBlock/SetPropertyBlock/렌더 사용 전에 같은 종류의 객체를 한 번 만들며 이후 같은 인스턴스를 재사용한다. backing 필드는 속성 내부에서만 접근한다. Awake/OnEnable에 의존하지 않아 비활성 오브젝트의 외부 호출에도 대응한다. 백그라운드 스레드에서 이 속성을 사용해도 안전하다는 뜻은 아니다.

코드의 수치·색·크기·셰이더 이름·등록/해제·렌더 순서·호출부는 변경하지 않았다. 아래 줄 번호는 수정 후 기준이고, 괄호의 ‘기존’은 기준 SHA의 줄이다.

## 수정표

| 파일:줄 (Runtime 기준) | 전 | 후 | 판정 근거 |
|---|---|---|---|
| A2SightFade.cs:19–21 (기존 19) | `readonly block = new MaterialPropertyBlock()` | `blockValue` + null 검사 지연 `block` | 직접 `MonoBehaviour`. `Apply`의 GetPropertyBlock 전에 생성. Initialize나 Awake의 선행 여부에 의존하지 않음. |
| NativeGroundSkillSurface.cs:20–22 (기존 19) | `readonly block = new MaterialPropertyBlock()` | `blockValue` + null 검사 지연 `block` | 직접 `MonoBehaviour`. `Mark`가 AddComponent 후 Initialize, 외부 `Project`가 Sync를 직접 호출함. 비활성 sprite에서도 Awake/OnEnable을 전제할 수 없음. |
| NativeGroundSkillSurface.cs:16–17 (기존 16) | `Ring.Block = new MaterialPropertyBlock()` | Ring별 null 검사 지연 `Block` | 중첩 일반 클래스이며 `rings = new List<Ring>()`는 요소를 만들지 않음. 실제 생성은 `SetRing`의 `new Ring`이므로 현재 MonoBehaviour 생성자 직결 경로는 아님. 생성 시점 의존을 없애기 위해 함께 예방 수정. `SyncRings` 첫 GetPropertyBlock 전에 생성. |
| NativeGroundSkillProjection.cs:31–32 (기존 31) | 정적 `receiverBlock = new MaterialPropertyBlock()` | 정적 backing + null 검사 지연 속성 | 정적 초기화는 최초 타입 접근 스레드/시점에 의존. 이제 `UpdateCamera`의 receiver GetPropertyBlock 전에만 생성. |
| NativeHd2D.cs:28–29 (기존 28) | 정적 `shadowBlock = new MaterialPropertyBlock()` | 정적 backing + null 검사 지연 속성 | Enabled/IsActor 등 다른 정적 멤버 접근이 native 생성을 동반하던 경로 제거. `ProjectActor`의 Clear 직전에 생성. |
| NativeGroundSkillProjection.cs:189–193 (기존 188–189) | 정적 `new ShaderTagId(...)` 3개 | nullable backing + HasValue 검사 속성 3개 | 예방 수정. `ShaderTagId`는 단순 수학 struct와 달리 [공식 6000.6 구현](https://github.com/Unity-Technologies/UnityCsReference/blob/6000.6/Runtime/Export/RenderPipeline/ShaderTagId.cs)의 생성자가 `Shader.TagToID`를 호출함. 해당 binding에는 PropertyToID와 같은 thread-safe 표기가 없음. 기존에는 pass 생성 시 타입 초기화, 이제 RecordRenderGraph 첫 사용. 실제 이 항목의 Development 예외는 미재현. |

합계: **4개 Runtime 파일**, MPB 생성 **5곳**(현재 위험 경로 4 + Ring 예방 1), ShaderTagId 생성 **3곳**. 모든 기존 사용은 지연 속성을 거치며 backing 필드를 직접 전달하는 null 경로는 없다. 일반적인 native 할당 실패 자체를 숨기는 catch는 추가하지 않았다.

## 일반 클래스 필드 초기화: 유지 판정

단순히 파일에 MonoBehaviour라는 문자열이 없는지를 기준으로 판단하지 않았다. `NativeGame`은 모든 partial을 합치면 MonoBehaviour지만, `NativeBossView`와 `NativeSkillView`는 partial을 모두 합쳐도 일반 클래스다. 내포되어 있다는 사실도 상속이나 즉시 생성과 다르다. 아래 각 생성 경로는 Runtime 전체의 호출부를 대조했다.

| 파일:줄 | 전 | 후 | 판정 근거 |
|---|---|---|---|
| KiSlashView.cs:18 | MPB 필드 생성 | 유지 | IDisposable 일반 클래스. `NativeGame.cs:120`의 Awake에서 new. |
| KiImpactView.cs:60 | MPB 필드 생성 | 유지 | IDisposable 일반 클래스. `NativeGame.cs:135`의 Awake에서 new. |
| NativeBossView.cs:23 | MPB 필드 생성 | 유지 | `NativeBossView.cs` + `.FieldBullets.cs` 모두 일반 클래스. `NativeGame.BossView.cs:21` BossViewAttach 및 `Tools/HeroAnchorCapture.cs:80` Bind에서 new. |
| NativeDruidBody.cs:17 | MPB 필드 생성 | 유지 | 일반 클래스. `NativeGame.BossView.cs:22` BossViewAttach에서 new. BossViewAttach는 StageFlowAttach의 실행 중 호출. |
| NativeSkillView.cs:18 | MPB 필드 생성 | 유지 | partial 합산 결과 IDisposable. `NativeGame.cs:136` Awake에서 new. |
| NativeGroundWarningProjection.cs:13 | saved/block MPB 2개 | 유지 | 일반 클래스. `NativeDruidTelegraphView.cs:66` 생성자에서 new → 상위 view는 BossViewAttach에서 생성. 생성자에서 곧바로 saved를 GetPropertyBlock에 전달하므로 이미 main-thread runtime 경로. |
| NativeDruidTelegraphView.cs:26,55 | `Mb.Mesh = new Mesh { name=... }`, under/over `new Mb()` | 유지 | 중첩 Mb 2개는 상위 일반 view의 필드 생성 중 만들어짐. 상위 view의 유일한 new는 `NativeGame.BossView.cs:21` BossViewAttach. MonoBehaviour 필드에 선언된 참조는 null이며 초기화자로 view를 생성하지 않음. |
| Vfx/ImpactGroundPatch.cs:15 | MPB 필드 생성 | 유지 | IDisposable 일반 클래스. `NativeImpactView.Spawn` :61 / `NativeSkillRemaster.Floor` :169에서 new. |
| Vfx/NativeImpactView.cs:11 | Burst.Block MPB | 유지 | `bursts = new Burst[8]`는 참조 배열만 할당. `Spawn` :53에서 처음 요소를 new. 상위 view는 ImpactInitialize → Awake에서 생성. |
| Vfx/NativeSkillRemaster.cs:41 | Handle.Block MPB | 유지 | Dictionary/Stack은 Handle을 생성하지 않음. `Get` :131에서 new Handle. 상위 remaster는 ImpactInitialize → Awake에서 생성. |

총 기준 MPB 필드 생성 15개 중 5개를 이동하고, main-thread 실행 중 생성이 확인된 10개는 유지했다. Mesh 필드 생성 1개는 위 Mb 경로로 유지했다. 일반 클래스의 모든 native 생성자 호출 목록과 최초 호출부는 부록에 적었다. 향후 이 타입을 MonoBehaviour/ScriptableObject의 필드 초기화자에서 new하면 검사가 해당 경로를 추적해 거부한다.

## 정적 생성자·예외 API·추가 조사

| 파일:줄/항목 | 전 | 후 | 판정 근거 |
|---|---|---|---|
| Input/ExoInput.cs:19 | 정적 생성자 키 매핑 | 유지 | Enum.Parse/문자열/Dictionary 및 KeyCode enum 값만 사용. Unity 객체 생성·입력 디바이스 조회 없음. |
| NativeKeyBindInput.cs:14 | 정적 생성자 키 매핑 | 유지 | 같은 관리 데이터 변환. |
| NativeLobbyVideo.cs:35 | 정적 생성자 인자 파싱 | 유지 | Environment/Array/문자열만 사용. 동영상 오브젝트 생성은 인스턴스 생성자에서 실행. |
| Core/EnemyPools.cs:27 | 정적 생성자 확률표 계산 | 유지·수정 0 | double 배열과 계산만 수행. |
| Runtime 전역 `Shader.PropertyToID` 필드 | 정적 ID 캐시 | 유지 | [공식 API 문서](https://docs.unity3d.com/6000.0/Documentation/ScriptReference/Shader.PropertyToID.html)는 이름→정수 ID API라고 설명한다. 문서 설명만으로 thread-safe라고 단정하지 않았으며, [프로젝트와 같은 6000.6 공식 binding](https://github.com/Unity-Technologies/UnityCsReference/blob/6000.6/Runtime/Export/Shaders/Shader.bindings.cs#L66)의 `IsThreadSafe = true`로 예외 허용을 확인했다. 객체 생성 API가 아니다. |
| NativeHeroMotion.cs:299–300 | Animator.StringToHash 초기화 | 유지 | [공식 6000.6 binding](https://github.com/Unity-Technologies/UnityCsReference/blob/6000.6/Modules/Animation/ScriptBindings/Animator.bindings.cs#L973)에 thread-safe 표기. |
| NativeRemodel3D.cs:11–12 | Requested 인자 파싱 + Application.isEditor | 유지 | 객체 생성 아님. [공식 Application 구현](https://github.com/Unity-Technologies/UnityCsReference/blob/6000.6/Runtime/Export/Application/Application.cs)은 isEditor를 상수 반환 관리 getter로 구현. |
| NativeGroundSkillProjection.cs:176 부근 ProjectionFeature, HellFogFeature/HellSsaoFeature | URP feature 파생 | 유지 | ScriptableRendererFeature → ScriptableObject, FullScreenPassRendererFeature/ScreenSpaceAmbientOcclusion도 동일 계열로 검사. 위험 필드 생성 없음. ProjectionPass는 Create에서 생성됨. |
| NativeGame의 필드 생성 일반 클래스들 | UI/정책/버퍼/레이아웃 인스턴스 | 유지 | partial 전체를 대상으로 재귀 생성 경로 검사. 특히 StageFlow의 NativeNextDifficultyPanel은 Texture2D 참조 배열만 생성하며 실제 리소스는 Init/Draw에서 로드. NativeReviveHud/NativeFloatingTextLayout도 초기화 시 관리 데이터만 생성. |
| Texture2D/Material/Mesh/GameObject 배열 필드 | `new Texture2D[n]` 등 | 유지 | native 인스턴스 생성이 아닌 null 참조 배열. 배열 내부에 실제 `new Material(...)` 등이 있으면 별도로 검출함. |

지정한 `new Material`, `Texture2D`, `RenderTexture`, `GameObject`, `GUIStyle`, `Shader.Find`, `Resources.Load`의 나머지 호출은 실행 메서드/지연 getter 또는 아래 일반 생성자에 있었다. 상속·부분 선언·간접 생성 경로를 확인한 현재 소스에서 추가 위험 초기화는 발견하지 않았다. 수학 struct/Color/Rect/Quaternion, 컬렉션, System.Random, 반사 메타데이터 조회는 native Unity 객체 생성으로 오인하지 않았다.

같은 첫 프레임/매 프레임 폭주를 만들 수 있는 다른 경로도 남긴다. 아래는 별도 재현된 결함이 아니라 Mac 로그를 구분해 읽기 위한 후보이다.

- 정적 초기화 중 native 예외는 TypeInitializationException으로 래핑되어 이후 같은 타입 접근마다 재발할 수 있다. 이번 정적 MPB/Tag 지연화는 이 경로를 줄인다.
- `new Material(Resources.Load<Shader>(...))` / `new Material(Shader.Find(...))`는 리소스 누락/셰이더 stripping 시 null 입력으로 실패할 수 있다. 예: KiImpactView.cs:67,77–78, NativeHd2D.cs:121, NativeGame.A2Field.cs:121. 정상 리소스가 있는 실행 중 생성 경로이므로 이번에 동작·fallback을 바꾸지 않았다. A2SightFade.Initialize에는 shader null 검사가 이미 있다.
- 일반 클래스가 나중에 직렬화되거나 Unity 생성 경로의 필드에서 만들어지면 현재 안전한 초기화도 다시 위험해진다. `[Serializable]` 타입은 보수적으로 위험 생성 경로로 검사한다.
- 비활성 오브젝트/Awake 전 외부 호출은 Awake에서만 필드를 채울 때 null을 남길 수 있다. 수정 대상은 모두 첫 사용 지연화로 대응했다.
- Runtime에서 OnAfterDeserialize/OnBeforeSerialize 및 logMessageReceivedThreaded 사용은 검색상 없었다. `Tools/NativeQaCaptureWriter.cs:13` Task.Run은 Drain에서 문자열 큐와 File.AppendAllText만 처리하며 Unity API를 호출하지 않는다.

## 재발 검사와 검증 범위

```text
node unity/Tools/fieldinit-check/check.cjs
node --test unity/Tools/fieldinit-check/check.test.cjs
node unity/Tools/fieldinit-check/check.cjs --audit
```

주석·일반/축자/보간/raw 문자열·문자 리터럴을 토큰화 단계에서 건너뛰고, 타입별 멤버/필드/생성자/지연 속성을 구분한다. 부분 선언·로컬 상속·필드 new의 중첩 일반 클래스·생성자/메서드/속성을 통한 알려진 native 생성 호출을 추적한다. 정적 필드/정적 생성자는 일반 클래스라도 검사한다. 경로별 file/line/type/api/reason을 출력하고 발견 시 exit 1이다. Core도 같은 스캔에 포함한다.

정규식/어휘 분석의 한계는 README 대신 **check.cjs 첫머리 주석**에 명시했다. Roslyn 의미 분석이 아니며 alias, 외부 어셈블리의 미등록 상속, overload/동명 심볼, reflection, 제네릭 factory, helper가 반환하는 일반 객체의 전체 생성 그래프, 보간 문자열 내부 표현식은 수동 검토가 필요하다. 전처리 양쪽을 보수적으로 읽으며 delegate/lambda 본문은 과검출할 수 있다. 검사 0건은 Unity 컴파일/스레드 안전/렌더 결과의 증명이 아니다.

- 테스트 RED 1회: 빈 검사 구현이 실제 위험 fixture를 놓치는 assertion 실패를 확인함. 구현 후 GREEN, 최종 확장 테스트 **5/5 PASS**. 같은 검사의 2회 실패 없음.
- 수정 전 Runtime 검사: MPB의 현재 위험 초기화 4곳 검출, exit 1. 수정 후 확장 검사: **426 files / 915 types / unsafe 0**, exit 0.
- 테스트는 지정 native API, 여러 줄/qualified new, target-typed new, object/auto-property 초기화, partial+상속, 중첩 helper와 base 생성자, 정적 생성자/필드, getter/factory 간접 호출, 주석·문자열 제외, main-thread 일반 클래스 구분, Runtime 실제 소스를 검사한다.
- 실제 로그: `I:/EXODUSER-Storage/codex-takeover/devbuild-fieldinit/tests.log`, 전체 후보 감사 `audit.json`, 생성 호출 위치 `callsites.json`, 초기화 식 조사 목록 `initializers.json`.
- Unity·Player·exo-unity 실행 0, 빌드/캡처/프로세스 종료 0, Core 수정 0, 커밋·push 0.
- 원래 Runtime 4파일은 작업본에서 **LF**였다. 각 파일의 원래 줄 끝을 유지했고, 기존 CRLF를 LF로 변환하지 않았다. 새 도구·문서·보고서는 CRLF로 작성했다.
- Mac 담당: Unity 컴파일·Development 첫 프레임/반복 프레임 로그 확인, 비활성 Mark→Project, 가림 fade, 바닥 sprite/ring/receiver, HD2D 접지 그림자, 렌더 pass의 물/깊이/투영, 같은 장면 화면 비교. 로그 누적량이 안정적인지 확인해야 한다. 모두 **미확인(Mac 담당)**.

## 일반 생성자 감사 부록

아래는 위험 필드와 구분하기 위해 유지한 일반 생성자의 native 호출 및 호출 지점이다. `파일:줄`은 생성자 본문 첫 줄 또는 native 필드 초기화 위치다. 전체 개별 연산은 audit.json에 있다. 호출 위치를 정적으로 대조한 판정이며 실행 검증은 아니다.

| ??:? | ? | ? | ?? ?? |
|---|---|---|---|
| KiImpactView.cs:66 | `new Material`, `Resources.Load`, `Sprite.Create`, `Texture2D.whiteTexture` | ?? | `NativeGame.cs:135` Awake |
| KiSlashView.cs:23 | `Resources.Load`, `new Material`, `Sprite.Create`, `Texture2D.whiteTexture`, `new GameObject` | ?? | `NativeGame.cs:120` Awake |
| NativeAmbientSources.cs:24 | `new GameObject`, `Resources.Load` | ?? | `NativeGame.cs:141` Awake |
| NativeAreaTitle.cs:24 | `Resources.Load` | ?? | `NativeAreaTitle.Capture.cs:44` Start; `NativeGame.cs:114` Awake |
| NativeArenaView.cs:21 | `new GameObject`, `Resources.Load`, `Sprite.Create` | ?? | `NativeGame.StageFlow.cs:114` StageFlowSyncViews |
| NativeAudioMixer.cs:20 | `Resources.Load` | ?? | `NativeFeedbackAudio.cs:55` NativeFeedbackAudio |
| NativeBoltView.cs:19 | `Sprite.Create`, `Texture2D.whiteTexture` | ?? | `NativeGame.cs:119` Awake |
| NativeBossBar.cs:46 | `Resources.Load` | ?? | `NativeBossBar.Capture.cs:38` Start; `NativeBossBar.Capture.cs:42` Start; `NativeBossBar.Capture.cs:48` Start; `NativeBossBar.Capture.cs:48` Start; `NativeBossBar.Capture.cs:48` Start; `NativeBossBar.Capture.cs:48` Start; `NativeBossBar.Capture.cs:49` Start; `NativeBossBar.Capture.cs:50` Start; `NativeBossBar.Capture.cs:53` Start; `NativeBossBar.Capture.cs:55` Start; `NativeBossBar.Capture.cs:62` Start; `NativeGame.cs:114` Awake; `NativeGame.StageFlow.cs:94` StageFlowBossBar |
| NativeBossView.cs:45 | `new GameObject`, `new Texture2D`, `Sprite.Create` | ?? | `NativeGame.BossView.cs:21` BossViewAttach; `Tools/HeroAnchorCapture.cs:80` Bind |
| NativeDeathOverlay.cs:44 | `Resources.Load` | ?? | `NativeDeathOverlay.Capture.cs:41` Start; `NativeDeathOverlay.Capture.cs:42` Start; `NativeGame.cs:114` Awake; `NativeGame.cs:278` Update; `NativeGame.UiOverlapCapture.cs:360` UiOverlapCaptureBody |
| NativeDruidBody.cs:28 | `new GameObject`, `new Material`, `Resources.Load` | ?? | `NativeGame.BossView.cs:22` BossViewAttach |
| NativeDruidTelegraphView.cs:64 | `new GameObject`, `new Mesh` | ?? | `NativeGame.BossView.cs:21` BossViewAttach |
| NativeEnemyRigAnimator.cs:13 | `Resources.LoadAll` | ?? | `NativeEnemyRigRenderer.cs:50` Create |
| NativeFeedbackAudio.cs:55 | `Resources.Load`, `new GameObject`, `Resources.LoadAll` | ?? | `NativeGame.cs:139` Awake |
| NativeForgePanel.cs:37 | `Resources.Load` | ?? | `NativeForgePanel.Capture.cs:41` Start; `NativeGame.cs:114` Awake |
| NativeGameMusic.cs:29 | `new GameObject`, `Resources.Load` | ?? | `NativeGame.cs:141` Awake |
| NativeGroundWarningProjection.cs:20 | `new Mesh` | ?? | `NativeDruidTelegraphView.cs:66` NativeDruidTelegraphView |
| NativeHeroView.cs:18 | `Resources.Load`, `new GameObject`, `Object.Instantiate` | ?? | `NativeGame.cs:238` ResetRun |
| NativeHud.cs:40 | `Resources.Load`, `new Material`, `new RenderTexture`, `Texture2D.whiteTexture` | ?? | `NativeGame.cs:113` Awake |
| NativeInventory.cs:22 | `Resources.Load`, `new Texture2D` | ?? | `NativeGame.cs:115` Awake |
| NativeKeyBindList.cs:50 | `Resources.Load` | ?? | `NativeKeyBindList.Capture.cs:42` Start; `NativePauseMenu.A15Web.cs:265` ContentHeight; `NativePauseMenu.A15Web.cs:577` DrawKeys; `NativePauseMenu.cs:25` OpenKeyPageForTest; `NativePauseMenu.cs:26` BeginEmbeddedKeyCaptureForQa; `NativePauseMenu.cs:162` DrawEmbeddedBindings; `NativePauseMenu.cs:238` DrawControls |
| NativeLevelUpOverlay.cs:26 | `Resources.Load` | ?? | `NativeGame.cs:114` Awake; `NativeLevelUpOverlay.Capture.cs:42` Start |
| NativeLobbyVideo.cs:39 | `new GameObject` | ?? | `NativeLobby.CharacterPresentation.cs:81` InitializeCharacterPresentation; `NativeLobby.cs:38` Initialize; `NativeTitleSignboard.cs:48` EnsureMovie; `Tools/ScreenTransitionCheck.cs:11` QuitCodeProbe |
| NativePauseMenu.cs:41 | `Resources.Load` | ?? | `NativeGame.cs:150` Awake |
| NativeSkills.cs:49 | `Resources.Load` | ?? | `NativeGame.cs:113` Awake |
| NativeSkillView.cs:33 | `new Material`, `Resources.Load`, `Shader.Find`, `Sprite.Create`, `new Texture2D` | ?? | `NativeGame.cs:136` Awake |
| NativeStageClearOverlay.cs:48 | `Resources.Load` | ?? | `NativeBuildFlavor.Capture.cs:60` Start; `NativeBuildFlavor.Capture.cs:61` Start; `NativeGame.cs:114` Awake; `NativeGame.ParityThirdCapture.cs:59` ParityThirdCapture; `NativeGame.ParityThirdCapture.cs:67` ParityThirdCapture; `NativeGame.StageFlow.cs:74` StageFlowPump; `NativeGame.UiOverlapCapture.cs:356` UiOverlapCaptureBody; `NativeStageClearOverlay.Capture.cs:38` Start; `NativeStageClearOverlay.Capture.cs:40` Start; `NativeStageClearOverlay.Capture.cs:58` Start |
| NativeStatPanel.cs:53 | `Resources.Load` | ?? | `NativeGame.cs:113` Awake; `NativeStatPanel.cs:538` Awake |
| Vfx/CombatImpactView.cs:61 | `Resources.Load`, `new Material`, `Sprite.Create`, `Texture2D.whiteTexture`, `new Texture2D`, `new GameObject` | ?? | `NativeGame.cs:138` Awake |
| Vfx/ImpactGroundPatch.cs:20 | `new GameObject`, `new Mesh` | ?? | `Vfx/NativeImpactView.cs:61` Spawn; `Vfx/NativeSkillRemaster.cs:169` Floor |
| Vfx/KiSlashVfxView.cs:50 | `Resources.Load`, `new GameObject`, `new Gradient` | ?? | Runtime ? Assets C# ???? ?? ?? ??. ?? ??? ?? ?? ??(?? ?? ??? ?? ??). |
| Vfx/NativeImpactView.cs:29 | `Resources.Load`, `new Material`, `Sprite.Create` | ?? | `NativeGame.Impact.cs:17` ImpactInitialize |
| Vfx/NativeSkillRemaster.cs:78 | `Resources.Load`, `new Mesh` | ?? | `NativeGame.Impact.cs:20` ImpactInitialize |
