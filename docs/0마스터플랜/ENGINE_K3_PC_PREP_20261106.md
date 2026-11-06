# K3 UE 키샷 — PC 준비 계획 (2026-11-06)

준비만 정리한 문서다. 설치, 실행, 로그인, 프로젝트 생성은 하지 않았다. 출처가 없는 항목은 [미검증]으로 표시했다. 웹 출처 조사 원본은 세션 scratchpad의 `k3/research.md`에 있다.

## 0. PC 현재 상태 (11-06 실측, 파일과 레지스트리만 읽음)

| 항목 | 값 |
|---|---|
| 엔진 | UE 5.8.2 (CL 56702186, 런처 빌드), `G:\UE_5.8`, 36.8GB, `Engine\Binaries\Win64\UnrealEditor.exe` 있음 |
| 런처 플러그인 | QuixelBridge_5.8, FabPlugin_5.8 (`C:\ProgramData\Epic\UnrealEngineLauncher\LauncherInstalled.dat`) |
| 디스크 여유 | G 69GB / 820GB, E 1,043GB, C 185GB, I 8,717GB |
| Visual Studio | Community 2026 (18.9). 설치된 것: Game C++, Desktop C++, ASAN, C++ profiling. 버전: MSVC 14.51, Windows SDK 10.0.19041 / 22621 / 26100, .NET SDK 8.0.301 / 10.0.400 |
| 없는 VS 항목 | .NET desktop 워크로드, .NET MAUI 워크로드, "Unreal Engine installer" 구성요소 (vswhere 기준) |

## 1. 프로젝트 골격 계획

### 1.1 위치와 템플릿

- **위치:** `G:/exoduser-ue` (아직 만들지 않음). G 드라이브 여유가 69GB다. 프로젝트 크기, DDC 위치, Megascans 다운로드 용량은 아직 재지 않았다 [미검증].
- **템플릿 후보:** Games → Blank, 시작 콘텐츠 없음, 프로젝트 유형 둘 중 하나. 아래 비교는 문서 사실만 적었다.

| 항목 | Blueprint만 | C++ |
|---|---|---|
| Windows 패키징에 필요한 추가 소프트웨어 | 「Packaging Your Project」 Additional Software 절에 Windows·macOS는 "does not require any additional software"라고 되어 있음. Blueprint와 C++를 나눠 적은 문장은 없음 [미검증] | 「Setting Up Visual Studio … for C++ Projects」에 필수 워크로드 4개와 구성요소 4개가 나옴 |
| 빠진 VS 항목 3개(.NET desktop, .NET MAUI, Unreal Engine installer)가 필요한가 | 공식 문서에 언급 없음 [미검증] | 같은 페이지 "Adding Required Workloads / Components" 목록에 들어 있음. 따라서 C++ 경로에서는 문서상 필수 |
| DebugGame 구성 | "Not available for Blueprint-only projects" (Packaging 페이지, Build Configurations) | 사용 가능 |
| 주의 | 코드 플러그인(C++ 소스 포함)을 Plugins에 넣으면 컴파일러가 필요해진다는 서드파티 글이 있음(bugnet.io) [미검증] | — |

출처:
- https://dev.epicgames.com/documentation/en-us/unreal-engine/packaging-your-project?application_version=5.8
- https://dev.epicgames.com/documentation/en-us/unreal-engine/setting-up-visual-studio-development-environment-for-cplusplus-projects-in-unreal-engine?application_version=5.8

### 1.2 카메라 환산 (Unity A2 경로 → UE)

Unity 원본 값:
- 피치 34°: `NativeRemodel3D.cs:17`
- 거리 16.5u: `NativeRemodel3D.cs:18`
- 세로 FOV 46.9453°: `Resources/Data/remodel_camera.json`의 `verticalFieldOfView`. Cinemachine `Lens.FieldOfView`에 넣는다(`NativeGame.Remodel3D.cs:196`, `:201`).
- 축척 1u = 1.152m: Mac `662fb36ff`, 영웅 메시로 실측.

| 값 | Unity | UE (cm) |
|---|---|---|
| 카메라–주시점 거리 | 16.5u | 16.5 × 115.2 = **1900.8cm** |
| 높이 (거리 × sin 34°) | 9.226u | **1062.9cm** |
| 수평 뒤 거리 (거리 × cos 34°) | 13.679u | **1575.8cm** |
| 피치 | 34° 내려다봄 | Rotation Pitch **−34°** (UE는 음수가 아래) [UE 회전 규약, 문서 미인용] |
| 세로 FOV | 46.9453° | 46.9453° |
| 가로 FOV (16:9) | — | 2·atan(tan(23.47°)·16/9) = **75.335°** |

- UE `UCameraComponent::FieldOfView`는 "The horizontal field of view (in degrees)"다(API 5.8, UCameraComponent). 1920×1080에서는 75.335°를 넣는다.
- 세로 FOV를 고정하는 방법:
  - 전역: `ULocalPlayer::AspectRatioAxisConstraint = AspectRatio_MaintainYFOV` (Config)
  - 카메라별: `bOverrideAspectRatioAxisConstraint` + `AspectRatioAxisConstraint`
- 프로젝트 기본값이 MaintainXFOV라는 것은 포럼에만 있다 [미검증].
- 주시점 높이(Unity Cinemachine Follow 대상의 발/몸 기준)는 이 문서에서 옮기지 않았다 [미검증: `NativeGame.Remodel3D.cs:200` 이후 LookAt 대상 확인 필요].

### 1.3 캡처 규격

- 1920×1080. 비교용으로 Unity 키샷과 같은 화면 비율을 쓴다.
- 고해상도 1장은 `HighResShot 1920x1080`으로 찍는다. 저장 위치는 `Saved\Screenshots\Windows`이고, 크기는 화면·창 해상도를 기준으로 정해진다(「Taking Screenshots」 High Resolution Screenshot 절).
- 순차 렌더는 MRQ로 한다(§2).

## 2. 창 없는 렌더 경로 (문서 확인만)

PC 규칙은 창을 띄우지 않고 소리도 내지 않는 것이다. 이 규칙을 지키면서 렌더할 수 있다고 문서가 보장하는지 따로 봤다.

| 경로 | 문서 근거 | 창 없이 되는가 (문서 기준) |
|---|---|---|
| MRQ 커맨드라인 (`UnrealEditor-Cmd.exe <uproject> <Map> -game -LevelSequence=… -MoviePipelineConfig=…`) | 「Using Command Line Rendering with Movie Render Queue」. 공식 예시 3개가 모두 `-game -windowed -resx -resy -log -notexturestreaming` | 근거 없음. 예시는 창 모드를 씀 |
| `-RenderOffScreen` | 명령줄 레퍼런스(5.8)의 Table of Flags에 "Render off screen." 한 줄뿐 | GPU·창 동작 설명 없음 [미검증] |
| `-run=pythonscript -script=…` | 「Scripting the Unreal Editor Using Python」의 The Command Line 절: "headless mode without opening the Editor UI" | 에디터 UI 없이 실행됨. 렌더 출력이 나오는지는 [미검증] |
| `-ExecutePythonScript=…` | 같은 절: 전체 에디터를 띄움 | 창 있음 |
| `-nullrhi` | Table of Flags: "run UE headless" | 창 없음. 대신 렌더링 하드웨어 인터페이스가 null이라 캡처 용도로는 쓸 수 없음 |
| 무음 `-nosound` | 5.8 레퍼런스에 없음. 4.26 문서에만 있음 | [미검증] |

**결론: 창 없이 렌더된다는 공식 문서 근거는 없다.** 따라서 K3 UE 캡처에는 Mac 또는 사용자 창이 필요하다.
- PC에서 `-RenderOffScreen` + MRQ를 시험하려면 사용자 허가가 필요하다. 이것은 실행에 해당한다.
- 시험해 본다면 결과는 기록 대상이지, 문서로 보장된 동작이 아니다.

## 3. Fab / Megascans 반입 — 로그인과 사용자 클릭

로그인은 사용자가 한다. 세션은 로그인하지 않는다.

| 단계 | 로그인 필요 | 사용자 클릭 | 출처 |
|---|---|---|---|
| 1. 런처에서 UE 5.8 실행 | Epic 런처 로그인 상태 [미검증: 필수 여부] | 런처 → Unreal Engine → 5.8 실행 | — |
| 2. Fab 창 열기 | 명시 없음. Account 메뉴에 Sign out이 있음 | **Window → Fab**, 또는 Content Drawer의 **Fab** 버튼 | 「Fab Window in Unreal Engine」 Accessing Fab |
| 3. Fab 플러그인 확인 | 해당 없음 | 꺼져 있으면 Edit → Plugins → Fab 활성화(기본은 켜짐) | 같은 페이지 Fab Plugin |
| 4. 무료 Megascans 찾기 | [미검증] | Discover → Quixel featured (무료·유료 섞여 있음). 리스팅마다 라이선스 표기를 확인 | 같은 페이지 Featured Products |
| 5. 라이브러리에 추가 | My Library가 Epic 계정에 연결됨. 사실상 로그인이 필요해 보임 [필수 문장 없음] | **Add to My Library** | 같은 페이지 Add to My Library |
| 6. 프로젝트에 추가 | 위와 같음 | My Library → 타일 오른쪽 아래 **+** | 같은 페이지 My Library View |
| 7. 품질 설정 | 해당 없음 | Fab Settings → Megascans → Preferred Quality Tier (Low / Medium(기본) / High / Raw) | 같은 페이지 Fab Settings |
| (대안) fab.com 웹 | Fab EULA 동의 필요 | [미검증: 웹 클릭 순서 문서를 열지 못함] | 포럼 2025-03 Megascans update |

Quixel Bridge 5.8 플러그인이 지금 어떤 상태인지는 [미검증]이다. 모더레이터가 포럼(비공식)에서 Bridge 앱이 deprecated라고 답한 글만 있다.

## 4. 라이선스 — 무료 Megascans가 Unreal 전용인가

- Fab Standard License는 "usage is not limited to Unreal Engine"이다(https://www.fab.com/eula, Fab Standard License). Personal 티어와 Professional 티어는 "the same scope of rights"를 부여한다.
- 2025-03 Epic 포럼 공지 "Megascans update March 2025": Fab Standard 자산은 "any engine or tool"에서 쓸 수 있다(파일 형식이 호환될 때).
- 레거시 Quixel·Bridge 무료 claim 자산은 Epic Content License를 따른다. 그 라이선스가 Megascans를 UE-Only Content로 다루는지는 원문을 열지 못해 [미검증]이다.
- 공식 페이지 어디에서도 "UE 전용 가격 / 모든 엔진 가격" 이중 구조는 확인되지 않았다.
- 2026-10 포럼에 일부 Megascans가 "only with UEFN"으로 표시된다는 사용자 보고가 있다(비공식) [미검증].
- **결론(문서 기준):** Fab Standard로 받은 자산은 엔진 제한이 없다. 그래도 개별 리스팅의 라이선스 표기는 반입할 때마다 확인해야 한다.
- 크로마 제출 권리 점검(LC 레인)에 넘길 항목: 리스팅 URL, 라이선스 이름, 받은 날짜.
