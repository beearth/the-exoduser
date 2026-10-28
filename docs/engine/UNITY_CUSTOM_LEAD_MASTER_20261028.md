# 유니티 커스텀 총괄 마스터 (2026-10-28)

- 소유: **유니티 커스텀 총괄** `local_143f9249` (Opus, 조사·명세·검수). 구현은 소속 Sonnet 세션과 각 총괄의 단순 세션이 맡는다(§7).
- 목적(10-28 사용자): "유니티 엔진 툴을 우리가 다 사용하고 최적의 개발환경을 만드는 게 목적", "유니티 엔진을 우리가 커스텀도 하고 모든 유니티 기능들을 최대한 사용해야 해", "최종 목적은 최고의 게임을 만드는 것", "그러려면 개발도구가 가장 중요".
- 범위: Unity 기능을 얼마나 쓰는지(활용도), 엔진 커스텀(패키지 구조·렌더 파이프라인 확장·패키지 포크), 기능별 사용 표준, 패키지 도입·버전.
- 이웃 총괄
  - **Unity 개발툴·엔진 작업환경 총괄** `local_55f5cfd6`(`docs/engine/UNITY_DEVTOOLS_MASTER_20261028.md`): 작업 흐름 도구(작업 서버 DT-01, MapLint DT-02, LookDev DT-03, 빌드 루프 DT-15 등). 경계는 §6.
  - **유니티 총괄** `local_59ad835c`: `unity/main` 병합 창구·M1 배정. 이 총괄의 코드는 그쪽 병합 순번을 따른다.
  - 콘텐츠 총괄(맵 `9d17d95b`·보스전 `a98acebe`·임펙트 `da9cd0e7`·캐릭터 `7de36273`·사운드 `cf0cb8d7`·디자인 `eb8a8577`): 각 기능을 실제로 쓰는 쪽. 이 총괄은 기능 표준과 공용 부품을 만들어 준다.
- 고정 규칙(CLAUDE.md §엔진별 버전 분리·Unity 리모델링): 게임 규칙의 정답은 이식 Core(`unity/Assets/Exoduser/Runtime/Core`, oracle 검증) — 커스텀은 표현·도구·구조에만 한다. UI는 웹과 같은 모양을 유지한다. 코드는 `unity/main` 줄기로만 병합한다.

## 1. 현재 활용도 실측 (`origin/unity/main`, 10-28 10:40)

Unity 6000.6.7f1 · URP 17.6.0 · C# 파일 240개 · 씬 4개(`FirstPlayable`·`RM_Sandbox`·`RM1_Slice`·`RM3_Slice`).
측정: `git grep -l`로 `unity/Assets/**/*.cs`에서 해당 API를 쓰는 파일 수, `git ls-tree`로 에셋 수.

| 기능 | 패키지 상태 | 쓰는 파일/에셋 | 판정 |
|---|---|---|---|
| Input System | 설치(1.20.1) | **0** — 구형 `Input.GetKey` 등 16개 파일(`NativeGame`·`NativeLobby`·`NativeSkills`·`NativeKeyBindInput`·`NativePauseMenu.*` 등) | 설치만 됨. 패드·키 재설정이 구형 입력에 묶임 |
| Animator / Animator Controller | 모듈 | **0** / `.controller` 0개 | 캐릭터·보스 움직임 시스템 없음 |
| Animation Rigging | 없음 | 0 | 발 IK·시선·무기 잡기 없음 |
| Timeline | 설치(6.6.0) | 1개 파일 / `.playable` 1개 | 거의 안 씀 |
| Cinemachine | 설치(6.6.0) | 3 | 카메라 기본만. Impulse(타격 흔들림)·Confiner 없음 |
| URP Renderer Feature / RenderGraph | URP 설치 | **0 / 0** | 렌더 파이프라인 확장 없음 |
| URP Volume·후처리 | URP | 3 | 기본 Volume만 |
| Decal Projector | URP | 0 | 바닥 장식은 자체 `GroundDecal.shader` |
| Shader Graph | 설치(17.6.0) | **`.shadergraph` 0개** | 손으로 쓴 셰이더 10개(`SpriteLit3D`·`GroundDecal`·`LightShaft`·`ToxicFlow`·`FgCard`·`DropIconMask`·`HudOrb`·`KiSlashAdditive`·`KiSlashInk`·`SkillAdditive`) |
| VFX Graph | 설치(17.6.0) | 1개 파일 / `.vfx` 1개 | 거의 안 씀 |
| Terrain / ProBuilder / AI Navigation | 설치 | 3 / 2 / 3 | 맵 빌더에서 사용 중 |
| Splines | 잠금 파일에만(의존성) | 0 | 강·길·덩굴 경로를 손 메시로 만듦 |
| Audio Mixer | 모듈 | **`.mixer` 0개** | 볼륨 버스·덕킹·스냅샷 없음 |
| UI Toolkit | 모듈 | 1 | — |
| IMGUI `OnGUI` | — | **11** (`NativeGame`·`NativeLobby`·`NativeStatPanel`·각종 `*.Capture`) | 게임 화면 UI가 디버그용 IMGUI에 일부 걸려 있음 |
| Addressables | 없음 | 0 | 내용 로딩·패치 크기 관리 없음 |
| ScriptableObject 데이터 | — | **0** | 맵·보스·VFX 설정이 코드 상수 |
| EditorWindow·커스텀 인스펙터 | — | **0** | 도구가 정적 메서드·배치 실행뿐 |
| Assembly Definition(asmdef) | — | **0** | 스크립트 전체가 한 어셈블리 → 한 줄 고쳐도 전부 재컴파일(병합 직후 컴파일 26~69초, 개발툴 마스터 §1.1) |
| Unity Test Framework | 잠금 파일에만 | `[Test]` 0 | 검증이 Unity 밖 dotnet oracle·캡처 스크립트뿐 |
| Profiler 마커 | — | 0 | 프레임 예산을 코드 구간별로 못 봄 |
| Burst·Jobs·Collections | 잠금 파일에만 | 0 | — |
| 조명 베이크·Light Probe·APV | — | 0 | 실시간 광원만(URP 추가광 8개 한도 문제) |

**판단**: CLAUDE.md 리모델링 원칙이 나열한 도구(URP·Volume, Terrain·ProBuilder·NavMesh, Cinemachine, Timeline·Animator, VFX Graph·Shader Graph, Input System, Audio Mixer) 중 **제대로 쓰는 것은 Terrain·ProBuilder·NavMesh뿐**이다. 나머지는 설치만 됐거나 아예 없다. 엔진 커스텀(렌더 파이프라인 확장, 패키지 구조)은 0이다.

## 2. 커스텀 단계 — 어디까지 엔진을 고치나

| 단계 | 내용 | 우리 쓰임 | 결정 |
|---|---|---|---|
| L1 에디터 확장 | EditorWindow·인스펙터·임포터·메뉴·씬 도구 | 맵·보스·VFX 저작 도구 | 바로 한다 |
| L2 자체 패키지 | `unity/Packages/com.exoduser.*` 내장 패키지 + asmdef(Core·Runtime·Rendering·Editor·DevTools 분리) | 컴파일 시간 단축, 부품 재사용, 경계 강제(Core가 표현 코드를 못 부름) | 바로 한다(C-01) |
| L3 렌더 파이프라인 확장 | URP `ScriptableRendererFeature`+RenderGraph 패스, 자체 Volume 컴포넌트, Shader Graph Custom Function·서브그래프 | 가림 페이드·외곽선·지옥 안개·피격 섬광·열기 왜곡 | 바로 한다(C-03·C-04) |
| L4 URP 패키지 포크 | URP/Core RP 17.6.0을 `Packages/`에 내장해 직접 수정(버전 고정, 변경점 목록 유지) | L3로 안 되는 것만(예: 라이트 루프 한도·그림자 방식 변경) | 필요가 실제로 확인될 때만. 업그레이드 비용이 생기므로 항목마다 이 문서에 근거를 남긴다 |
| L5 엔진 C++ 소스 | Unity 소스 접근 라이선스(유료, Enterprise급) | — | 하지 않는다. 필요해지면 유료 지출이라 사용자 결정 |

## 3. 활용 로드맵 (C-xx)

우선순위 기준: ① 모든 팀의 반복 속도를 올리는 것 ② M1 "1-1 한 판 완주"와 맵·보스 리메이크 화질에 바로 필요한 것 ③ 나중에 바꾸면 비싼 구조.

### P0 — 기반 (지금)

| id | 과제 | 효과 | 실행 | 완료 판정 |
|---|---|---|---|---|
| C-01 | **asmdef 분리 + 자체 패키지 구조**: `Exoduser.Core`(Core만, UnityEngine 최소 참조) · `Exoduser.Runtime` · `Exoduser.Rendering` · `Exoduser.Editor` · `Exoduser.DevTools.Editor`. 맵 빌더는 Editor, Capture 파일은 별도 어셈블리 | 표현 코드만 고칠 때 Core 재컴파일 없음. Core가 표현 코드를 참조하면 컴파일 오류로 막힘 | 소속 Sonnet, 병합은 유니티 총괄 순번 | 같은 수정 1줄의 컴파일 시간 전후 비교 · oracle 불일치 0 · Win 빌드 1회 · 진행 중 브랜치(RM-1~4·RM-B·M1 HUD) 병합 충돌 목록 |
| C-02 | **Input System 전환**: Input Actions 에셋 1개(웹 `BINDS` 기본값 그대로), 키·패드 동시, 재설정 저장은 기존 세이브 키. 구형 `Input.*` 16개 파일 교체 | 패드 지원·키 재설정·로컬 입력 일원화 | 소속 Sonnet → 유니티 총괄 순번 | 웹과 같은 키 표 전부 동작, 패드로 1-1 이동·공격·구르기 |
| C-05 | **Profiler 마커 + Memory Profiler·Profile Analyzer 도입**: Core 틱·몹 갱신·렌더 준비·UI 구간에 `ProfilerMarker` | 프레임 예산을 구간별로 본다 → DT-10 회귀 측정의 기초 | 소속 Sonnet | 1-1 표준 컷에서 구간별 ms 표 |
| C-06 | **Unity Test Framework**: EditMode(에디터 도구·임포터), PlayMode 스모크(씬 열기→Core 틱 N프레임→예외 0), `com.unity.test-framework.performance`로 성능 기준선 | 캡처 스크립트 대신 표준 테스트 러너, 작업 서버(DT-01)가 그대로 돌림 | 개발툴 총괄과 공동(러너는 그쪽, 테스트 구조는 이쪽) | 스모크 3종이 작업 서버 job으로 통과 |

### C-01 상세 명세 (10-28 사전 조사 반영, `origin/unity/main` 기준)

사전 조사(읽기 전용, Sonnet) 사실 — 총괄이 핵심 3건 직접 재확인함:
- C# 240 = Core 112(`Runtime/Core` 109 + `Core/Skills` 3) · Runtime 나머지 119 · Editor 9. `Rendering`·`Remodel`에는 C# 0개(진행 브랜치에서 `Remodel/CH1_4/Rm4PoolLightCuller.cs`가 생김).
- **Core → 비Core 참조 0건, Core의 UnityEngine 사용 0건**(주석 2줄뿐). Core는 이미 `unity/Tools/*.csproj` 54개(그중 52개가 `Runtime/Core` 경로 직접 포함)에서 net8.0 순수 C#으로 컴파일된다 → `noEngineReferences: true` 가능. `System.Numerics.BigInteger`(`ItemFactory.cs:4`)는 Unity API 프로필에서 확인 필요.
- **깨지는 곳 1건 확정**: `Editor/PortVerification.cs:8` `Type.GetType("Exoduser.UnityPort.Core.Simulation, Assembly-CSharp")` — 어셈블리 이름이 바뀌면 null.
- Runtime에 `UnityEditor`·`#if UNITY_EDITOR` 0건. Editor → Runtime·Core 단방향.
- `NativeGame` partial 46개 파일 중 스모크·캡처 약 29개가 partial이고 `NativeGame.cs:80-116`이 인자로 직접 호출 → **이번에 분리 불가**. 독립 캡처 클래스 9개(`Native{AreaTitle,BossBar,BuildFlavor,DeathOverlay,KeyBind,LevelExp,LevelUpOverlay,StageClearOverlay}Capture`·`NativeAutoPotionSmoke`)는 참조 0이라 나중에 분리 가능.
- Editor가 `Assets/Exoduser/Rendering`·`Remodel/CH1_1`·`CH1_3` 경로를 문자열로 가짐(`Rm0EngineSetup.cs:21`·`Rm1SliceBuilder.cs:22`·`Rm3SliceBuilder.cs:26`) → 폴더 이동 금지.
- 진행 브랜치(10-26~28)는 `.cs` 이동·삭제 0건. `NativeGame.cs`를 고치는 브랜치 7개(sound-rm1·rm-int·vfx-rm1·Codex start-parity·pet·moat·map-light). **asmdef 파일만 추가하고 파일을 옮기지 않으면 병합이 안 깨진다**(새 파일은 가장 가까운 상위 asmdef로 들어감).

분할(1차):

| 어셈블리 | 위치 | 설정 |
|---|---|---|
| `Exoduser.Core` | `Runtime/Core/Exoduser.Core.asmdef` | `noEngineReferences: true`, 참조 없음, Auto Referenced 켬 |
| `Exoduser.Runtime` | `Runtime/Exoduser.Runtime.asmdef` | Core + URP·Cinemachine·Timeline·VFX 등 필요한 패키지(컴파일 오류로 확정), Auto Referenced 켬 |
| `Exoduser.Editor` | `Editor/Exoduser.Editor.asmdef` | `includePlatforms: ["Editor"]`, Core·Runtime·ProBuilder·AI Navigation·URP 등 |
| `Exoduser.DevTools.Editor` | `Editor/DevTools/` | DT 브랜치 병합 뒤. Core 참조. 빌더 타입 참조 여부 먼저 확인 |
| 보류 | `Rendering` | C#이 들어오면 그때 |
| 미리보기 통합 보완(10-29) | `Remodel/Exoduser.Runtime.asmref` | Remodel의 C# 3개를 기존 Runtime으로 귀속. 파일 이동 없이 Editor 참조 경계 해소; 결과는 `UNITY_PC_PREVIEW_ALL_20261029.md` |
| 2차 | 독립 캡처 9개 → `Runtime/Capture/` | 진행 브랜치 병합 뒤 |
| 3차 | `NativeGame` 스모크 | 호출부를 등록(레지스트리) 방식으로 바꾼 뒤 |

작업 순서:
1. `PortVerification.cs:8`을 `typeof(Exoduser.UnityPort.Core.Simulation)` 기반으로 바꾼다(asmdef 없이도 동작 → 단독 커밋).
2. `Exoduser.Core.asmdef`(+`.meta`)만 추가. 파일 이동 없음. csproj 54개는 손대지 않음. 컴파일 오류 = 숨은 의존성 목록 → 기록.
3. `Exoduser.Runtime`·`Exoduser.Editor` asmdef 추가. `FirstPlayable.unity`·`RM1_Slice`·`RM3_Slice` 스크립트 연결(GUID) 유지 확인.
4. 검증: oracle(dotnet) 불일치 0 · `exo-unity.ps1`로 `PortVerification.CheckCorePresence`·`Verify` 배치 실행 · Win 빌드 1회 · 1-1 실제 렌더 스모크 · **같은 Runtime 파일 1줄 수정 후 컴파일 시간 전후 비교**(목표: Core 재컴파일 없음).
5. 브랜치 `claude/unity-pc-c01-asmdef-20261028`, worktree `E:\exoduser-wt\pc-unity-c01-asmdef`. Unity 실행은 PC 전체 1개 규칙·`exo-unity.ps1` 경유.

배정(10-28 유니티 총괄 결정): 구현 = `unity-core-oracle-opus` `local_eedbb777`(Core·oracle 담당 Opus). 그 세션의 LT-5·oracle 결함 2건 다음 세 번째 일. 병합 순번 = RM-INT → RM-0(조명·사운드) → **C-01**. 유니티 총괄 병합 체크에 "새 패키지 참조(UnityEngine.VFX 등)를 Runtime asmdef에 넣었는가"가 추가됨(C-01 뒤 병합 브랜치에 적용).

C-01 결과(10-28, 브랜치 `claude/unity-pc-c01-asmdef-20261028` @ 6f1637b02, 빌드 커밋 d2321dbba = 6d8d6e2cd + 2271793ee + unity/main 4a22a22af 병합, 충돌 0). 보고서 `docs/engine/UNITY_C01_ASMDEF_20261028.md`(main 사본).
- 커스텀 총괄이 diff를 직접 검수했다. 변경은 asmdef 3개 + `.meta` + `PortVerification.cs` 5줄 + 보고서이고 파일 이동은 0이다. `Exoduser.Core`는 `noEngineReferences: true`·참조 없음, Runtime은 Core·URP·RP Core 참조, Editor는 Editor 전용 패키지 12종을 참조하며 모든 참조를 이름으로 적었다.
- 컴파일 오류 0, 숨은 의존성 0, `BigInteger` 정상. `CheckCorePresence`는 `Exoduser.Core`로 통과했다. Win 빌드 성공(80초, 씬 스크립트 연결 끊김 0).
- 1줄 수정(`Runtime/NativeHud.cs`): 기준 938394077 **3.709초**(Assembly-CSharp 재컴파일) → C-01 **3.079초**(Exoduser.Runtime만 재컴파일, Core·Editor는 재컴파일 없음). 1회 수정당 줄어든 시간은 약 0.6초(17%)로 작다. 효과가 큰 쪽은 Core·Editor만 고칠 때와 병합 직후 재컴파일인데, 이번에는 재지 않았다(추후 DT-10 회귀 측정에 포함).
- `PortVerification.Verify`는 기준·C-01 둘 다 같은 지점에서 exit 2로 끝났다("A15 SFX right must step by one and write once"). 앞 5단계는 통과. unity/main에 원래 있던 결함이며 C-01 회귀가 아니다. Verify는 GPU로 돌려야 한다(`-nographics`면 HUD 픽셀 검사에서 먼저 멈춤).
- 남은 것: 1-1 GPU 렌더 스모크(m1). CTO의 플레이어 실행 보류가 풀린 뒤 돌린다. **스모크 통과 전에는 병합하지 않는다.**
- 판정: 코드·컴파일·빌드 검수는 통과. 병합은 스모크 뒤 유니티 총괄 순번(RM-INT → RM-0 → C-01)으로 한다.

### C-02 상세 명세 — Input System 전환 (10-28)

실측(`origin/unity/main` b0f9a0c52):
- `activeInputHandler: 2`(구형·신형 둘 다 켜짐). Input System 1.20.1은 설치돼 있지만 `UnityEngine.InputSystem`을 쓰는 파일은 0개다.
- 구형 호출 135건이 20개 파일에 있다: `GetKeyDown` 65 · `GetKey` 39 · `GetMouseButton` 12 · `mousePosition` 8 · `GetJoystickNames` 3 · `anyKey`/`anyKeyDown` 4 · `GetMouseButtonDown` 1 · `GetAxisRaw("Vertical")` 1 · `compositionString` 1. 많은 파일: `NativePauseMenu.Keyboard` 12 · `NativeLobby.StartupPresentation` 11 · `NativeGame` 11 · `NativeInventory.Keyboard` 8.
- 바인딩 구조는 그대로 쓴다. Core `KeyBindings`는 웹 BINDS를 웹 키 코드("KeyW"·"mouse0"·"ShiftLeft")로 저장하고, `NativeKeyBindInput`이 웹 코드↔`KeyCode` 다리 역할을 한다. 웹 코드 이름은 Input System `Key` 열거와 거의 1:1로 맞는다.
- `NativeGame.FixedUpdate`(212행)는 `Held`와 `mousePosition` 같은 상태만 읽는다. 눌린 순간(Down) 판정은 `Update`/`OnGUI`에서 한다. 신형의 `wasPressedThisFrame`·`isPressed`와 의미가 같다.
- 지금 스모크는 실제 키를 넣을 수 없다. 신형의 가상 장치(`InputSystem.AddDevice`·`QueueStateEvent`)를 쓰면 키 입력 스모크를 진짜로 돌릴 수 있다. C-06 테스트의 기초가 된다.

단계:

| 단계 | 내용 | 동작 변화 |
|---|---|---|
| C-02a | `Runtime/Input/ExoInput.cs`(신형 위의 정적 파사드)를 추가하고, 구형 호출 135건을 1:1로 바꾼다. `NativeKeyBindInput`의 `KeyCode` 대신 `Key`를 쓴다. `Exoduser.Runtime` asmdef에 `Unity.InputSystem` 참조를 추가한다. 가상 장치 검증 `Editor/ExoInputVerification.Run`을 넣는다. `activeInputHandler`는 2로 둔다 | 없음(같은 키·같은 프레임) |
| C-02b | 패드: 웹 `navigator.getGamepads()` 처리(game.html 13592·13969·20071 부근)와 Core `FrontendPadPolicy`를 그대로 신형 `Gamepad`에 연결한다. `GetJoystickNames` 대체 | 웹과 같은 패드 지원 |
| C-02c | Input Actions 에셋(Gameplay·UI 맵)을 만들고 키 재설정은 `KeyBindings` 저장값을 바인딩 덮어쓰기로 넣는다. 구형 호출 0을 확인한 뒤 `activeInputHandler: 1`(신형만) | 구형 입력 끔 |

C-02b의 웹 인덱스→신형 명명 control 표, 연결/해제·UI 차단·LT 조합·가상 장치/실물 패드 검수 경계는 [`UNITY_C02B_GAMEPAD_20261028.md`](UNITY_C02B_GAMEPAD_20261028.md)를 따른다. 10-28 인수 시점에는 **명세만 완료**되었고 C-02a 공용 Unity 검증은 대기 중이다.

Codex 인수 재실행(10-28 23:09): C-02a의 `IMECompositionString` 네임스페이스 누락은 한 줄 수정으로 컴파일 오류 0까지 확인했다. 웹 코드 매핑 107개 뒤 가상 키보드 `W press frame` 결합 단언이 exit 2로 실패했다. Core presence·FrontendPad·Win 빌드·Player는 수정본에서 미실행이다. 첫 실패 뒤 1회 재실행 한도에 도달해 추가 실행을 중단하고 C-02a 병합을 보류한다. 자세한 영수증은 [`UNITY_C02A_INPUT_SYSTEM_20261028.md`](UNITY_C02A_INPUT_SYSTEM_20261028.md)를 따른다. C-02b 제품 코드는 이 게이트 전에는 착수하지 않는다.

10-29 신규 진단: `W press frame`의 원시/파사드 부분값을 분리했다. 가상 W `isPressed=true`지만 `wasPressedThisFrame=false`이며, 버튼 사전 등록과 `AnyKeyDown` 개별 키 조회 후보 뒤에도 동일했다(두 Unity 실행 모두 exit 2, 컴파일 오류 0). 원인은 아직 확정되지 않았고 단위당 2회 실패 한도에 도달했다. 자세한 영수증은 C-02a 문서에 기록했다. C-02a/C-02b 병합과 다음 Unity 검증은 보류한다.

C-02a 검증: 컴파일 0 · `ExoInputVerification`(웹 코드 전부 `Key`로 변환됨, 가상 키보드·마우스로 Down은 누른 프레임에만·Held는 누르는 동안·AnyKeyDown·`NativeKeyBindInput.Down("weapon")`=mouse0) · `PortVerification.CheckCorePresence` · `FrontendPadVerification.Run` · Win 빌드 · (플레이어 보류가 풀린 뒤) 1-1 직접 조작 판정.
실행: 구현 = PC `codex exec`(worktree `E:\exoduser-wt\pc-unity-c02-input`, 브랜치 `claude/unity-pc-c02-input-20261028`, **C-01 브랜치 6f1637b02 기준** — asmdef 참조를 추가해야 하므로). Unity 검증·커밋·push는 커스텀 총괄이 `exo-unity.ps1`로 한다. 병합 순번은 C-01 다음이다.

### P1 — 리메이크 화질 (맵·보스 리메이크와 같이)

| id | 과제 | 쓰는 팀 | 첫 적용 |
|---|---|---|---|
| C-03 | **URP Renderer Feature 세트**(RenderGraph): 탑다운 가림 페이드, 외곽선(피격·선택), 높이 안개, 피격 섬광, 열기 왜곡 — 개발툴 마스터 DT-11을 이쪽으로 옮김 | 맵·디자인·VFX | 1-3 키 큰 버섯 가림 페이드 |
| C-04 | **Shader Graph 서브그래프 라이브러리**(그을림·용해·발광 핏줄·젖음·이끼, 공통 HLSL include) + 손 셰이더 10개 중 옮길 것 정리 — DT-12를 이쪽으로 옮김 | 디자인·VFX·맵 | 1-1 바닥·나무 재질 |
| C-07 | **Animator + Animation Rigging + Timeline**: 영웅·보스 상태 기계, 루트 모션 끔(위치는 Core가 정답), 발 IK·시선, 보스 등장 Timeline(Signal로 Core 이벤트 연결) | 보스전·캐릭터 | 1-1 드루이드 리메이크 무브(No Rest for the Wicked 기준) |
| C-08 | **Cinemachine 확장**: Impulse(타격·보스 강타 흔들림), Confiner, 보스전 그룹 프레이밍 | 보스전·VFX | 드루이드 강타 |
| C-09 | **VFX Graph 표준**: 임팩트를 VFX Graph로, GPU 이벤트, 공용 블록(서브그래프), 프리뷰 벤치는 DT-08 | VFX | 독 폭발 1종 |
| C-10 | **Audio Mixer**: Master·Music·SFX·UI·Voice·Ambient 버스, 보스·일시정지 스냅샷, 대사 덕킹, 웹 설정 볼륨과 연결 | 사운드 | RM-1 사운드 슬라이스 |
| C-11 | **ScriptableObject 데이터 + 저작 창**: 맵 구역(`MapSliceDef`, DT-05와 공동)·보스 무브 세트·VFX 프리셋을 SO로, EditorWindow로 편집 | 맵·보스·VFX | 1-1 구역 정의 |
| C-12 | **조명**: Light Layers(영웅 광원), Adaptive Probe Volumes·정적 베이크로 추가광 8개 한도 회피 | 맵·디자인 | 1-1 |
| C-13 | **Splines**: 독 강·길·덩굴·사슬을 Spline으로(손 메시 대체) | 맵 | RM-1 독 강 |

### P2 — 출시·규모

| id | 과제 | 비고 |
|---|---|---|
| C-14 | Addressables: 장·구역 단위 로딩, Steam 일일 패치 크기 축소 | M1 뒤 |
| C-15 | Burst·Jobs: 프로파일러(C-05)가 CPU 병목을 보인 곳만(투사체·대량 몹) | Core 수치는 바꾸지 않음 |
| C-16 | 게임 UI의 IMGUI(`OnGUI` 11개 파일) 정리: 실제 화면 UI는 UI Toolkit(USS로 웹 CSS 모양 재현), IMGUI는 캡처·디버그 전용으로 한정 | UI 모양은 웹 그대로. 유니티 총괄·디자인총괄과 합의 후 |
| C-17 | URP 포크(L4) 필요 여부 판정 | C-03·C-12 결과로 결정 |

## 4. 기능 사용 표준 (새 코드에 적용)

1. 새 입력은 Input System만 쓴다(C-02 전에는 기존 파일 수정만 허용).
2. 새 화면 효과는 Renderer Feature·Volume·Shader Graph로 만든다. 카메라 앞 판 메시·OnGUI 그리기로 효과를 만들지 않는다.
3. 새 조정 값(맵·보스·VFX)은 ScriptableObject에 둔다. 코드 상수는 Core 규칙값만.
4. 새 셰이더는 Shader Graph 우선. 손 HLSL은 Custom Function 또는 성능 근거가 있을 때만.
5. 새 스크립트는 맞는 asmdef 폴더에 둔다(C-01 이후). Core 어셈블리는 표현·에디터 코드를 참조하지 않는다.
6. 무거운 구간에는 `ProfilerMarker`를 단다.
7. 패키지 추가·버전 변경은 이 문서 §5에 기록하고 이 총괄이 승인한다(`manifest.json` 충돌 방지).
8. **`Exoduser.Core` 안의 규칙 아닌 순수 C#**(세이브·설정 저장, QA 실행 판정처럼 Core 쪽 코드가 불러야 하는 플랫폼 코드)은 새 파일을 `Runtime/Core/Platform/`에 둔다. 네임스페이스는 `Exoduser.UnityPort.Core` 그대로 쓴다. 이 폴더는 같은 Core 어셈블리이지만 게임 규칙 정답(oracle 대상)이 아니다. 기존 `CharacterRosterStore`·`CombatSaveStore`·`NativeSettingsStore`는 진행 중인 병합 때문에 지금 옮기지 않는다. 나중에 C-01 2차에서 `Exoduser.Platform` asmdef로 떼어낼지 판단한다. 첫 사례는 `QaRunPolicy`(10-28)다. Core 쪽 `NativeSettingsStore.IsQa`가 이 파일을 부르기 때문에 Runtime에 둘 수 없다.

## 5. 패키지 계획

| 패키지 | 지금 | 계획 | 과제 |
|---|---|---|---|
| `com.unity.inputsystem` | 1.20.1 설치 | 사용 시작 | C-02 |
| `com.unity.animation.rigging` | 없음 | 추가 | C-07 |
| `com.unity.splines` | 의존성만 | manifest에 직접 추가 | C-13 |
| `com.unity.test-framework`·`.performance` | 의존성만 | 직접 추가 | C-06 |
| `com.unity.memoryprofiler`·`com.unity.performance.profile-analyzer` | 없음 | 추가 | C-05 |
| `com.unity.addressables` | 없음 | M1 뒤 | C-14 |
| `com.unity.burst`·`collections`·`mathematics` | 의존성만 | 필요 시 직접 추가 | C-15 |

버전은 Unity 6000.6.7f1 패키지 관리자에서 확인한 값을 쓴다(추가하는 세션이 확인·기록).

## 6. 경계 — Unity 개발툴 총괄과 나눔

| 항목 | 유니티 커스텀 총괄 | Unity 개발툴 총괄 |
|---|---|---|
| 기능 활용도·사용 표준·패키지 | 소유 | 따름 |
| asmdef·자체 패키지 구조(C-01) | 소유 | DT-14 빠른 컴파일 검사가 이 구조를 씀 |
| URP Renderer Feature(옛 DT-11)·셰이더 라이브러리(옛 DT-12) | **소유(이관)** | — |
| 작업 서버·순번 큐(DT-01)·MapLint(DT-02)·LookDev(DT-03)·빌드 루프(DT-15)·Web 빌드 조사(DT-16) | 사용 | 소유 |
| 테스트 | 테스트 구조·스모크 내용(C-06) | 러너·job 실행 |
| 데이터 기반 맵(DT-05) | SO 표준(C-11) | MapKit 빌더 |
| 성능 회귀(DT-10) | 마커(C-05) | 자동 측정·회귀 job |

개발툴 총괄 합의(10-28, 그쪽 main e9b2ccd8d에 반영):
- C-01에서 `unity/Assets/Exoduser/Editor/DevTools/<도구>/` 전체를 **에디터 전용 asmdef 하나**(`Exoduser.DevTools.Editor`)로 묶는다. 실행 스크립트 `unity/Tools/devtools/`는 asmdef 대상이 아니다.
- 모든 자동 실행은 공용 무창 실행기 DT-01 `exo-unity.ps1`을 거친다(사용자 지시: 창·소리 없이). C-06 스모크도 이 실행기로 돌린다.
- C-01 순서: ① `Exoduser.Core`(Runtime/Core/**, Auto Referenced 켬 — DT-07 보스 판정 오버레이·아레나 오버레이가 `BossArenaLayout.Generate`를 직접 참조) → ② `Exoduser.DevTools.Editor`(Auto Referenced 켬 — asmdef 없는 `Rm0EngineSetup`·`Rm1/Rm3SliceBuilder`가 DT-01 `ExoArgs`를 부름. 반대 방향 참조는 불가하므로 착수 전 DevTools의 빌더·런타임 타입 참조 전수 확인, 있으면 인터페이스·콜백 등록으로 바꿈) → ③ 나머지 Runtime·Rendering·Editor.
- **DevTools 참조 검사(10-28, 원격 runner eb57e2f7e·maplint 91387e60a)**: DevTools 8개 파일(`JobServer/ExoArgs·ExoJobServer·ExoProbe`, `MapLint/MapLintBatch·Core·Shot·Types·Window`)이 비DevTools Editor 타입(Rm*SliceBuilder·Rm0EngineSetup·PortVerification 등)과 Runtime 프로젝트 타입을 쓰는 곳은 **0건**이다. 작업 서버는 `AppDomain.CurrentDomain.GetAssemblies()`를 돌며 이름으로 타입을 찾으므로(`ExoJobServer.cs:386`) 어셈블리 이름이 바뀌어도 동작한다. 외부 의존은 UnityEditor·URP·RP Core·`UnityEngine.AI`뿐이다. 반대 방향 호출은 `Rm0EngineSetup.cs:42`, `Rm1SliceBuilder.cs:699·905`, `Rm3SliceBuilder.cs:888`의 `ExoArgs.Get()`이다. lookdev(DT-03)는 아직 원격에 없어 검사하지 못했다.
- 따라서: (a) C-01 `Exoduser.Editor`보다 DT 브랜치가 먼저 병합되면 `Editor/DevTools/**`는 자동으로 `Exoduser.Editor`에 들어가므로 추가 작업이 없다. (b) 그다음 `Exoduser.DevTools.Editor` asmdef를 따로 만들면 **`Exoduser.Editor`가 그것을 명시적으로 참조해야 한다.** Auto Referenced는 asmdef가 없는 기본 어셈블리(`Assembly-CSharp*`)에만 적용되기 때문이다. (c) DevTools는 `Exoduser.Editor` 타입을 참조하면 안 된다(순환 참조). 지금 0건이며, DT 코드 리뷰 때 계속 확인한다.
- DT-15 브랜치에서 `NativeGame.M1Check.cs` 캡처를 RenderTexture로 바꾸고 `--unity-mute` 플래그를 추가하는 중이다. C-06 테스트 구조와 C-01 partial 분리는 이 변경이 병합된 뒤의 형태를 기준으로 한다.

## 7. 운영

- 소속 Sonnet 세션: (생성 후 기입). 첫 배정 = C-01 사전 조사(어셈블리 경계 후보·순환 참조 목록·진행 중 브랜치 충돌 예상) → 그다음 C-01 구현.
- worktree 정리(10-28 CTO): 이 총괄이 만든 worktree는 병합이 끝나면 직접 지운다. 지우기 전에 junction 0과 원격 반영을 확인하고, force 없이 `git worktree remove`로 지운다. 현재 대상: `E:\exoduser-wt\pc-unity-c02-input`(C-02 병합 뒤). 전체 정리 도구는 개발툴 총괄이 맡는다(dry-run → CTO 확인 → 삭제).
- 활용도 재측정: §1 표를 주 1회 같은 방식(`git grep -l`)으로 다시 잰다. 측정 스크립트는 `unity/Tools/custom/feature_usage.sh`로 정식화(C-01과 함께).
- 완료 기준: CLAUDE.md·`UNITY_DONE_BUILD_PLAYTEST_RULE` 그대로 — 병합 전 빌드 → 실제 렌더 스모크 → 플레이 판정. 기능을 "넣었다"가 아니라 그 기능으로 만든 화면이 게임에서 돌아야 완료.

## 8. 결정 기록

| 날짜 | 결정 | 근거 |
|---|---|---|
| 10-28 | 이 세션 = 유니티 커스텀 총괄(사용자 지정). Unity 개발툴 총괄 `local_55f5cfd6`은 작업 흐름 도구를 계속 맡는다 | 같은 파일을 두 총괄이 건드리지 않게 §6으로 나눔 |
| 10-28 | 옛 DT-11(Renderer Feature)·DT-12(셰이더 라이브러리)를 이쪽 C-03·C-04로 옮김 | 엔진 커스텀(L3)에 해당 |
| 10-28 | P0 = asmdef 분리 → Input System → Profiler·Test Framework | 모든 팀 반복 속도·나중에 바꾸면 비싼 구조부터 |
| 10-28 | L4 URP 포크는 필요가 확인될 때만, L5 엔진 소스는 하지 않음(유료) | 업그레이드 비용·유료 지출은 사용자 결정 |

## 부록 A. PC·저장소 점검 (10-28 10:20~10:40) — CTO에 넘김

이 세션 처음에 잰 개발 PC 상태. 소유는 CTO(`local_7072229c`). 원자료 `I:\EXODUSER-Storage\devtools\survey\worktree_inventory_20261028.tsv`.

- **메모리 커밋 83.4/95.8GB(87%)**, 재부팅(08:56) 1시간 반 만. 커밋 한도가 재부팅 전 127.8GB → 95.8GB로 줄었다(페이지 파일 시스템 관리 추정 → 고정 크기 권고, 시스템 설정이라 사용자가 직접).
- **세션마다 따라 뜨는 MCP 서버 18.6GB(커밋의 약 22%)**: desktop-commander 56개 6.6GB · pdf-viewer 56개 6.0GB(둘 다 claude.ai 동기화 플러그인, 내장 Bash·Read와 기능 중복) · ElevenLabs 162개 6.0GB(`tools/mcp_elevenlabs_launcher.cjs` → `uvx`, 사운드 외 세션은 안 씀). 권고: 앞 둘은 사용자가 앱 플러그인 설정에서 끔(약 12.6GB), ElevenLabs는 런처를 "첫 도구 호출 때만 실서버 시작"으로 바꿈(약 6GB).
- claude 41개 24.4GB(세션 1개 0.8~1.1GB), node 163개 14.5GB.
- 디스크: C 여유 246GB · E 801GB · G 641GB · I 12.7TB. C Temp 32GB(Claude 작업 출력 8GB, 끝난 세션의 100MB 넘는 출력 11개 약 5.6GB — 10-27 REPL 루프 3.4GB 포함). Playwright 임시 프로필 96개(0.2GB) 남음.
- worktree **94개**: 깨끗하고 원격에 들어간 것 26개(Steam `rel-0.7.1~0.7.7`·Godot 시절 `codex-*`·`docs-merge` 등), 더러움 표시 66개(Unity worktree 다수는 `.meta` 400여 개 — 에디터가 연 흔적일 가능성, 실제 작업 여부는 소유자 확인 필요), 디스크에 없는 등록 1개(`G:/exoduser-wt/snd10-ui`), C 드라이브 worktree 1개(`C:\Users\심도진\.codex\worktrees\5615`). 삭제는 사용자 승인 사항.
- git: gc 꺼짐(10-27 팩 손상 대응, 유지), 팩 24개 21.8GB, 느슨한 객체 3.97GB. 공유 폴더 main은 로컬 19 / 원격 246 갈라짐(각 세션이 다른 SHA로 원격 반영 중).
- PATH 25항목·938자 정상, `DOTNET_ADD_GLOBAL_TOOLS_TO_PATH=false` 유지. REPL 감시기 23:30까지 실행 중. API 실행기 키 파일 없음. `python -` 루프 0개.
