# Core 이식 계획 — 실행 수준 (EP 레인 후속, 2026-11-06)

- 배정: CTO 세션(11-06 03:42) "사용자 11-06 02:50 '원하는 퀄리티는 언리얼이 더 좋아 보여, 2.5D로 하더라도' → Core 이식 계획을 실행 수준으로 갱신". docs만, 코드 수정 0, 같은 브랜치(`claude/unity-cloud-core-port-study-20261105`).
- 입력: [CORE_PORT_STUDY_20261105](CORE_PORT_STUDY_20261105.md)(§번호는 그 문서), `DIRECTION_RESET_20261105.md`(11-05 10:20 엔진 비교 시작 / 19:20 크로마 웹 필수 → UE 보류 / 11-06 02:00~02:20 엔진 비교 축 K1+K3), `CHROMA_AWARDS_PLAN_20261105.md`, origin/unity/main `3b2074105993c9ac658aad6daa0a9a54365d5c8b`.
- 표기: 수치는 명령 또는 출처를 붙였다. 출처 없는 기간·비용은 **[추정]**, 열지 못한 공식 문서는 **[미검증]**이다. 이 세션 네트워크에서 `dev.epicgames.com`·`docs.unrealengine.com`·`unrealsharp.github.io`·`forums.unrealengine.com`은 차단이라, UnrealSharp 문서는 GitHub 소스 저장소(`github.com/UnrealSharp/unrealsharp.github.io`)에서 읽었고 UE 공식 문서는 검색 발췌뿐이다.
- 기준 Core: 조사 시점 unity/main `3b207410`의 `Runtime/Core` **133파일 18,353줄**(11-05 조사 18,320줄 + D-MO-2 `bdeefed4`·`21b4e5d9` 34줄). 이식 중에도 Core는 계속 바뀐다(11-05~06 하루에 2커밋) → §2.0 "동결 SHA + 재생" 규칙.

## 1. 경로 2안 비교 — (a) C++ 재작성 / (b) C# 유지

### 1.1 (b) C# 유지의 후보 런타임 — 공식 저장소 인용

| 항목 | UnrealSharp | UnrealCSharp | UnrealCLR |
|---|---|---|---|
| 저장소 | `github.com/UnrealSharp/UnrealSharp` (열림 11-05) | `github.com/crazytuzi/UnrealCSharp` (열림 11-05) | `github.com/nxrighthere/UnrealCLR` (열림 11-05) |
| 라이선스 | README "MIT licensed" | README MIT 배지 | README MIT |
| UE 버전 | README Prerequisites "Unreal Engine 5.6 – 5.8" (**5.8 포함**). 문서 사이트 get-started는 "Unreal Engine 5.3+ (UnrealSharp 0.2 …)"로 **README보다 낡음** | "Unreal Engine 5.0 - Unreal Engine 5.8" | "Unreal Engine 4.25.4 or higher"(UE5 명시 없음) |
| .NET | README ".NET 10.0.5 or newer"; FAQ·get-started는 ".NET 8.0 SDK"(낡음) | ".NET 10 (CoreCLR/Mono/LeanCLR)" | ".NET 6 SDK 6.0.101" |
| 플랫폼 | README 표: Windows Supported · macOS Supported · Linux/iOS/Android Planned. 콘솔 없음 | README "Windows / macOS / Linux / Android / IOS" | 표기 없음 |
| 패키징 | docs `packaging.md`: "Currently only Windows/Mac is supported." 에디터 UnrealSharp 툴바 → Package Project, 또는 `UnrealSharpBuildTool.dll --Action PackageProject`; 결과 `Binaries\Managed` 채워짐. Shipping 구성·성능 수치 언급 없음 | [미검증] | [미검증] |
| 성숙도 | FAQ "The plugin is not production ready yet, but the plan is yes you will be able to!"; 바이너리 배포 불규칙 → 소스 빌드. GitHub Releases 없음. 2.0k★, 2,081 commits, 최근 커밋 **2026-10-26** | 814★, 1,384 commits, 최근 **2026-10-08** | 3.3k★, 최근 **2023-06-07** → 휴면 |
| 성능·GC | 공식 문서에 GC·성능 항목 **없음** [미검증]. FAQ: 리플렉션으로 노출된 것만 C#에서 접근, "you will still need to use C++" | [미검증] | — |
| 프로젝트 전제 | README "A C++ project (strongly recommended …)" | — | — |
| Epic 공식 | 아님(README는 Epic Cropout 샘플 포팅만 언급) | 아님 | 아님 |

(b)안의 실무 후보는 UnrealSharp 하나다(5.8·Mac·활발). UnrealCSharp은 대안, UnrealCLR은 제외.

### 1.2 두 안의 비교표

| 축 | (a) C++ 재작성 | (b) C# 유지 (UnrealSharp) |
|---|---|---|
| Core 이식 줄 수 | 18,353 전부 | 0 (Core는 `noEngineReferences` 순수 C#, §2 — 오라클 하니스가 이미 net8.0에서 그대로 컴파일) |
| 접착·훅 | 델리게이트 108·인터페이스 6·event 26·Feedback 큐를 C++ `TFunction`/인터페이스로 재설계(§4.2) | 그대로. UE 액터가 델리게이트에 람다를 꽂음 |
| 하니스(80 csproj, 86 Program.cs) | 재작성(C++ 러너) 또는 C# 파사드(§3) | 그대로. `ExoduserProject` 경로만 바꿈 |
| 결정론 | Round(19줄)·Pow/Exp(12줄)·원시 삼각(96줄) 비트 검사, `/fp:precise`·FMA 금지 | 검증 환경(CoreCLR)과 같은 계열. .NET 10 재검증은 oracle 1회 |
| 외부 의존 | 없음 | 비공식 플러그인(릴리스 없음, "not production ready"), UE 메이저 업그레이드마다 재검증, 중단 시 포크 |
| 패키징 | UE 표준 | Win/Mac만(docs). Shipping·Steam 배포 사례 [미검증] |
| 성능 | 네이티브 | C#↔UE 경계 호출 비용·GC [미검증]. Core 틱은 UE 객체를 만지지 않으므로 경계 호출은 틱당 입력 1회·상태 읽기·Feedback drain뿐 |
| 기간(Core만) | **10주 [추정]**(§2.2) | **3주 [추정]**(§2.3) |
| 표현층 34,145줄 | 재작성 | 재작성(UE API는 C#으로 쓰되 FAQ대로 일부 C++ 노출 필요) |
| 되돌리기 | 세 번째 구현이 생김(웹·Unity C#·UE C++), docs 동기화 대상 증가 | Unity판과 Core 소스 공유 유지(한 소스 두 호스트) |

결정은 사용자·CTO 몫이다. 이 문서는 두 안 모두 1주차가 같다는 점(§2.1)만 전제한다.

## 2. 주 단위 작업 목록

### 2.0 공통 규칙

- **동결 SHA**: 이식 시작 시 Core SHA를 적고(`ENGINE_TRIAL/CORE_FREEZE.md`), 그 뒤 Core 커밋은 "재생 목록"에 쌓아 이식 쪽에 주 1회 반영한다. 11-05~06에만 Core 2커밋(D-MO-2)이 있었다.
- 묶음 하나의 완료 = 그 묶음의 oracle 하니스가 동결 SHA 기준선과 **같은 PASS 집합**(D-014: C# 76개 중 FAIL 10·NEEDS-INPUT 9는 기준선에 포함). 손 기대값 하니스는 그대로 옮긴다.
- Core 수치·판정은 이식 중 바꾸지 않는다. 바꿀 것은 "Core 제안"으로 번호만 단다(STUDY §6.5의 3건 유지).

### 2.1 파일 묶음표 (명령: `python3 group.py Runtime/Core`, 이름 규칙 분류; 교차 참조는 "A 묶음 파일 중 B 묶음의 타입을 쓰는 파일 수")

| 묶음 | 파일 | 줄 | 의존(쓰는 묶음 → 파일 수) | 대응 oracle 하니스 |
|---|---:|---:|---|---|
| JS 의미론·fixture (`Js.cs`·`JsMath.cs`·`SourceStarterFixture.cs`) | 3 | 238 | Simulation 1 | JsMath V8 비트 대조(enemy-tick 등 안에 포함) |
| Simulation core (`Simulation*.cs` 본체·`SimulationState`·`Feedback`·`StageFlow`·`ReviveRules`·`HudValues`…) | 20 | 2,896 | Skills 51 · Enemy 36 · Items 13 · Boss 7 · Save 5 · JS 5 | player-hurt 13블록·region 20·stage-flow 10·roll 9·feedback 10·hud 15·shield-revive·CoreTests |
| Skills·전투 규칙 (`Skills/*`·`KiSlash`·`ChainDash`·`Parry*`·`RollRules`·`PlayerPoise`·`EnergyShield`·`RageMalice`·`WeaponCatalog`…) | 17 | 2,147 | Simulation 16 · JS 11 · Enemy 8 · Boss 4 · Items 2 | skill 48블록·ki-slash 40·dash-parry 167·dash-hit 160·parry-reflect 55·weapon-xbow 42·rage-malice·skill-sim-test |
| Items·인벤토리·드랍 (`ItemFactory`·`DropTablesData`·`WorldDrop`·`Inventory*`·`AutoPotion*`·`EquipmentApplication`) | 11 | 1,720 | Simulation 6 · JS 2 | drop 3,000·inventory 27·inv-salvage 224·auto-potion 1,866·damage-parity 211·resource 530·defense 240+11,520·affix-defs-parity |
| Enemy AI·생성·피격 (`Enemy*.cs`·`SpawnHoles`·`EliteTables`·`Simulation.EnemyAi/EnemyBridge/EnemyCap/Holes/StartMobs`) | 29 | 5,315 | Simulation 19 · Skills 16 · JS 12 · Boss 2 · Items 2 | enemy-hurt 4,968·enemy-tick 1,240·enemy-ai 692·enemy-spawn 538·enemy-pool 105·enemy-tables 26·c01-field 14·hunter·start-mobs |
| Boss (`DruidBoss*`·`Boss*`·`DruidTelegraph`·`Simulation.DruidBoss/DruidRemodel/BossRemodel*/FieldBoss/Pillars`) | 20 | 3,686 | Simulation 42 · Skills 18 · Enemy 9 · JS 4 | druid-boss(48케이스 54,400틱 5.42M)·druid-remodel-test·fieldboss 400·parry-reflect-test·boss |
| Save·설정·로스터 (`CombatSave*`·`CharacterRoster*`·`NativeSettings*`·`SaveJson`·`GrowthState`·`LevelExp`·`NativeOptionSet`·`WarriorStoryState`) | 13 | 1,494 | Simulation 9 · Items 8 · Flow 4 · Enemy 1 | save 2,595·level-exp 174,421·settings-persistence·character-storage·options-wave1/2 |
| Flow·UI 상태·기타 (`FirstPractice*`·`FrontendEntryFlow`·`LobbyFlow`·`PauseNavigation`·`KeyBindings`·`QaRunPolicy`…) | 20 | 824 | Simulation 5 · Skills 5 · Items 1 · Save 1 · JS 1 | first-practice·startup-flow·pause-navigation·keybind-parity·qa-run-policy·lobby-oracle 29 |
| 합계 | 133 | 18,320 (조사 SHA) | | |

의존이 가리키는 **이식 순서**: JS 의미론 → Simulation core(상태·틱·난수·훅) → Skills·전투 규칙 → Items → Enemy → Boss → Save·설정 → Flow. Simulation core는 모든 묶음이 쓰므로 먼저 뼈대(상태 클래스·Tick·NextRandom·Feedback 큐)만 올리고, 각 묶음을 붙일 때 해당 `Simulation.*.cs` partial을 같이 옮긴다.

### 2.2 (a) C++ 재작성 — 10주 [추정]

가정: 1인(에이전트 레인 1)이 주당 C# 1,800~2,000줄을 C++로 옮기고 같은 주에 그 묶음 하니스를 통과시킨다. 근거는 없고 DIRECTION_RESET의 "6~12주"를 묶음 크기로 나눈 것이다. 하니스 러너(§3.3)는 1주차에 뼈대를 만들고 매주 그 묶음 Program.cs를 C++로 옮긴다.

| 주 | 묶음(줄) | 산출·관문 |
|---|---|---|
| 1 | STUDY §8 1주차 9항 + JS 의미론 238 + `SimulationState` + `Simulation.cs` 뼈대(상태·`Tick` 서명·LCG·`Random01`·`NowMs`·Feedback 큐) | Core 독립 csproj 기준선 PASS 집합 영수증; C++ 하니스 러너 뼈대(oracle.json 읽기, LCG, 비교 보고); `JsMath` C++(fdlibm 원문 반입 결정 뒤) 1,000인자 비트 일치 |
| 2 | Skills·전투 규칙 2,147 | skill·ki-slash·dash-parry·dash-hit·parry-reflect·roll·weapon-xbow·rage-malice 기준선과 동일 |
| 3 | Items·인벤토리·드랍 1,720 | drop·inventory·inv-salvage·auto-potion·damage-parity·resource·defense 동일. `BigInteger` 십진 출력(`ItemFactory.cs:25`)은 C++ 임의정밀 또는 Ryu/Grisu로 대체 후 3,000건 문자열 일치 |
| 4~5 | Enemy 5,315 (가장 큼: 골든 enemy-ai 43.9MB·enemy-hurt 25.1MB) | enemy-spawn·tick·ai·hurt·pool·tables·c01-field·hunter 동일(A안 모드 1,424,276/0·6,067,801/0·264,064/0 재현) |
| 6~7 | Boss 3,686 | druid-boss 48케이스 5.42M 대조 0·druid-remodel·fieldboss·parry-reflect-test 동일 |
| 8 | Simulation core 나머지 2,896(플레이어 피격·지역·스테이지·부활·석궁·HUD 값) | player-hurt·region·stage-flow·feedback·hud·shield-revive·CoreTests 동일 |
| 9 | Save·설정 1,494 + Flow 824 | save·level-exp·settings-persistence·character-storage·lobby·first-practice·keybind 동일. 파일 IO 3파일(550줄)은 UE `FPaths`/`IFileManager`로 |
| 10 | 전체 sweep 재현 + 부동소수 비트 검사(Round 19·Pow/Exp 12·원시 삼각 96줄 전수) + 동결 뒤 Core 커밋 재생 + 버퍼 | 76개 하니스 PASS 집합 동일, FP 전수표, 재생 완료 |

위험 가중: Enemy·Boss는 웹 원문의 문자열 상태기(65줄)·`Dictionary<string>`(42)·`JsObj`·`object`(63줄)가 몰려 있어 C++ 자료형 설계가 주당 줄 수를 깎는다. 4~7주차가 밀리면 10주가 12주가 된다.

### 2.3 (b) C# 유지 — 3주 [추정] (Core만; 표현층은 §4)

| 주 | 할 일 | 관문 |
|---|---|---|
| 1 | STUDY §8 1주차 1~3·8항(Core 독립 csproj 기준선·ABI v0 표·결정론 봉인 점검·판정표). Mac: UE 5.8 + .NET 10.0.5 + UnrealSharp(main, 2026-10-26 이후) C++ 프로젝트 생성, 빈 C# 스크립트 빌드·핫리로드 확인 | 기준선 영수증; UnrealSharp 빌드 로그 |
| 2 | Core 133파일을 UnrealSharp Script 프로젝트에 **링크**(복사 아님: `<Compile Include="…/Runtime/Core/**/*.cs">`, 하니스와 같은 방식) → 컴파일 0오류. `UClass`가 아닌 순수 C# 클래스라 리플렉션 노출 불필요(FAQ: 노출 안 된 것은 Blueprint에서 못 봄 — Core는 Blueprint에 보일 필요 없음). 호스트 어댑터 1개(`ExoCoreHost` 액터): 60Hz 고정 누적기 → `Simulation.Tick`, `CanMove`·`HasLineOfSight` 임시 람다, `Random01=null`(LCG), `NowMs`·`TodayKey` 주입, Feedback drain → 로그 | 600틱 상태 해시 = 1주차 하니스 해시; 틱당 ms·GC 할당 KB/틱 측정값 |
| 3 | 패키징: `UnrealSharpBuildTool --Action PackageProject`로 Win·Mac Shipping 패키지 → 실행·600틱 해시 동일. 저장소 3파일 경로를 `FPaths::ProjectSavedDir()` 상당으로 주입. Core 제안 1·2 필요 여부 판단 | **go/no-go**: ① 해시 동일 ② 틱 ≤1ms ③ Win·Mac 패키지 실행 ④ 외부 의존 최근 커밋 ≤90일 |

3주차 no-go면 (a)로 전환한다. 그때까지 한 일(기준선·ABI 표·결정론 봉인)은 (a)에서도 그대로 쓴다.

## 3. 등가 검증 — 웹 oracle 하니스를 UE 빌드에 어떻게 돌리나

### 3.1 코드 사실 (origin/unity/main `3b207410`, `git show`로 확인)

| 사실 | 값 | 명령 |
|---|---:|---|
| 하니스 csproj | 80 (`Program.cs` 86) | `git ls-tree -r --name-only origin/unity/main unity/Tools \| grep -c '\.csproj$'` |
| Core를 끌어오는 방식 | **40개는 `$(ExoduserProject)/Assets/Exoduser/Runtime/Core/**/*.cs` 글롭**, 40개는 파일 목록 명시(`EnemyTables.cs`·`JsMath.cs`·`Skills/*.cs`…) | csproj `Compile Include` 집계 |
| `ProjectReference`·DLL `Reference` 쓰는 하니스 | **1** (`pause-settings/PauseSettingsTests.csproj`) | csproj grep |
| Core 밖 Runtime 파일을 함께 컴파일하는 하니스 | 24 (그중 11은 `Runtime/SourceMap.cs`) | csproj grep `Runtime/[^C]…\.cs` |
| 기대값 생성 | `export*.cjs` 45개가 `git show origin/main:game.html`(66,211줄)을 Node VM에서 실행 → `oracle.json`; 커밋된 골든 46파일 131MB | STUDY §5 |
| 실행 | `run.cjs` → export → `dotnet build <csproj> -p:ExoduserProject=<unity 폴더>` → 비교. 일괄 `oracle-sweep/run.cjs` | STUDY §5.3 |

즉 **하니스는 "UE 빌드"가 아니라 "Core 소스"를 검증한다.** Unity Player를 띄우지 않듯 UE Editor/Player도 띄우지 않는다. 질문 "UE 빌드에 어떻게 돌리나"의 답은 "빌드에 돌리지 않고, UE가 쓰는 것과 **같은 소스/바이너리**를 하니스가 쓰게 만든다"이다.

### 3.2 (b) C# 유지 — 공유 라이브러리로 양쪽에서 같은 테스트 (가능, 코드 사실로)

- Core를 `Exoduser.Core.csproj`(클래스 라이브러리, net10.0; 소스는 그대로 `Runtime/Core` 글롭)로 만든다. 하니스 40개의 글롭은 `ExoduserProject` 경로만 바꾸면 그대로 돌고(폴더 구조 `Assets/Exoduser/Runtime/Core`를 UE 저장소 안에 보존하거나 `-p:ExoduserProject=`로 지정), 명시 목록 40개도 파일명이 같으므로 동일. `pause-settings` 1개만 ProjectReference 손질.
- UnrealSharp Script 프로젝트도 같은 글롭을 링크하거나 `Exoduser.Core.csproj`를 ProjectReference한다. **같은 소스 → 같은 IL**. 다른 것은 런타임(.NET 10 CoreCLR)뿐이고, 하니스도 net8.0→net10.0으로 올려 같은 런타임에서 돈다.
- Core 밖 Runtime 파일에 기대는 24개(특히 `SourceMap.cs` 11개)는 그 파일이 `UnityEngine`을 쓰는지 확인해 Core 또는 "공유 비엔진" 폴더로 옮기는 결정이 필요하다(코드 수정이라 CTO 승인; 이 문서는 사실만 적는다).
- Unity판이 남아 있는 동안은 세 소비자(Unity asmdef·UE Script 프로젝트·하니스)가 한 폴더를 본다. `Exoduser.Core.asmdef`의 `noEngineReferences`가 "UE에서도 돌 수 있음"을 컴파일 시점에 계속 보장한다.

### 3.3 (a) C++ 재작성 — 하니스 쪽 선택지 (가능하나 비용)

| 선택지 | 내용 | 비용 |
|---|---|---|
| A-1 C++ 러너 | 86개 `Program.cs`를 C++로 옮기고 같은 `oracle.json`을 읽어(예: nlohmann/json) 같은 비교를 한다. 골든 데이터·추출기(`export.cjs`)는 **전부 재사용** | Program.cs 재작성(86개, 묶음별로 §2.2 주차에 포함) |
| A-2 C# 파사드 | C++ Core를 DLL로 빌드하고 C#에서 P/Invoke 래퍼로 **기존 Program.cs가 부르는 API 모양(클래스·필드·델리게이트)을 그대로** 재현 | 파사드가 Core 공개 표면(class 218·struct 37·enum 32·델리게이트 108) 크기라 사실상 두 번째 이식. 권하지 않음 |
| A-3 UE Automation Test | UE의 자동화 테스트 프레임워크 안에서 oracle.json 재생 | UE Editor를 띄워야 해서 무창·무음 규칙과 Mac 판정 부담; CI성 반복에 부적합. 보조로만 |

(a)안이면 A-1이 현실적이고, 그 비용이 §2.2 각 주차에 들어 있다.

### 3.4 어느 안이든 지켜야 할 결정론 접점(STUDY §6.0)

틱 = 60Hz 고정 호출 횟수, LCG + `Random01` 주입, 벽시계 4곳 주입, 규칙은 double. UE 쪽에서는 `FRandomStream`·`FApp::GetDeltaTime` 가변 dt·float 변환을 Core에 넣지 않는다.

## 4. 표현층 재구현 범위 (Unity Runtime 비Core 293파일 34,145줄 → UE)

분류는 파일명 규칙(`rgroup.py`)이라 ±10% 오차가 있다. UE 대응의 "공식 문서 절" 이름은 이 세션에서 **열지 못해 [미검증]**이고, 검색 발췌만 있는 것은 그렇게 적었다.

| Unity 하위계 | 파일 | 줄 | 지금 쓰는 기술(코드 사실) | UE 대응 | 비고 |
|---|---:|---:|---|---|---|
| 로비·메뉴·설정·흐름 | 78 | 7,808 | IMGUI `OnGUI` 26파일 5,259줄(절대 Rect 1920 기준), UGUI 2, UIElements 2, `VideoPlayer` 8파일(인트로 mp4) | UMG/Slate 위젯(Canvas Panel + DPI 스케일 1920 기준), Media Framework(mp4) [미검증: 5.8 코덱 범위] | 배치 수치는 웹 정본 JSON(`Resources/Data` 51파일)에서 그대로 |
| QA·캡처·스모크 하니스 | 39 | 4,916 | 커맨드라인 인자 → 캡처·영수증 | UE `-ExecCmds`/Automation·`HighResShot` [미검증] | 판정 도구이므로 1차 범위 밖, Mac 판정 절차에 맞춰 재작성 |
| 월드·맵·조명·카메라 | 40 | 4,202 | URP 17.6, `FullScreenPassRendererFeature`(HellFog)·SSAO 피처, Cinemachine 6.6, ProBuilder, Terrain | UE 기본 렌더러(Lumen/Nanite는 K1 결과), Exponential Height Fog·Post Process Volume, Camera 피치 34° LOCK | K1 실험 장면이 곧 시작점(DIRECTION_RESET 14:40) |
| HUD·오버레이 | 28 | 3,713 | IMGUI | UMG | 실버 헬 토큰·폰트(Cinzel·Hahmlet) 그대로 |
| **캐릭터·픽셀 패스·3D 리그** | 26 | 3,347 | 아래 4.1 | 아래 4.1 | K7(픽셀 캐릭터 합성) 탈락 조건과 직결 |
| 인벤토리·스킬 UI | 23 | 3,297 | IMGUI + 웹 배치 JSON | UMG | |
| VFX·임팩트·예고 | 26 | 3,215 | 직접 만든 Mesh 20파일·`Shader.Find` 11·LineRenderer 4·VFX Graph 3; 자산 `.shader` 31·`.shadergraph` 11·`.vfx` 7·`.mat` 80 | Niagara + Material(HLSL은 Custom 노드/USF) | 셰이더 42개는 전부 다시 씀 |
| 게임 호스트·기타 | 14 | 1,949 | `NativeGame.cs` 등 Core↔표현 접착, `SourceMap.cs`(맵 충돌 질의) | `ExoCoreHost` 액터 + `SourceMap` 이식(비엔진 코드라 (b)에선 그대로) | |
| 오디오 | 14 | 1,189 | `AudioSource` 22파일·`AudioMixer` 8(Explore/Boss 스냅샷·덕킹) | Sound Class/Submix·MetaSounds [미검증] | RM-1 사운드 키 표 `RM1_AUDIO_KEYS.json` 재사용 |
| 세이브·저장소 어댑터 | 4 | 321 | Core 저장소 3파일이 `System.IO`로 JSON 원자 쓰기(임시→Move/Replace, 백업, 락파일); 어댑터는 경로·QA 샌드박스만 | (b) 경로만 `FPaths::ProjectSavedDir()` 상당 주입 / (a) `IFileManager`로 550줄 재작성 | 웹 세이브 모양(`characters.data`) 유지 → 저장 포맷 변경 0 |
| 입력 | 1 | 188 | Unity Input System 1.20 (`ExoInput.cs`) | Enhanced Input | 키바인딩 값은 Core `KeyBindings.cs`(웹 키코드 문자열) 그대로 |
| 데이터 로딩 | — | — | `Resources.Load` 104파일·`JsonUtility` 116파일로 `Resources/Data/*.json` 51개 | (b) `System.Text.Json`/Core `SaveJson` 재사용, 파일은 `Content/` 밖 raw 폴더 또는 DataAsset | 29개 언어 표도 여기 |
| Steam | — | — | **Steamworks 연동 없음**(코드 사실: `steam` 문자열 14줄은 전부 위시리스트 URL `store.steampowered.com/app/4749590`·`steam://store/4749590`·파일명). 업로드는 `G:/exoduser-steam/run_build_unity_beta.bat` | Online Subsystem Steam 플러그인(엔진 동봉, `SteamDevAppId=4749590`, SDK를 `Engine/Source/ThirdParty/Steamworks/`에 복사 — 검색 발췌, Epic 문서 [미검증]) + 업로드 스크립트 재작성(CLAUDE.md §10: 업로드·Set Live는 사용자 확인) | 데모 v0 범위에선 연동 자체가 없으므로 "빌드 산출물 경로"만 |

### 4.1 픽셀 캐릭터 패스 — Unity 현행(코드 사실) → UE

Unity(`NativeRigPixelHero.cs` 266줄·`NativeEnemyRigRenderer.cs` 115·`NativeEnemyRigAnimator.cs` 49·`NativeHd2D.cs` 167·`NativeRemodel3D.cs` 119·`NativeRigPixelPolicy.cs` 23·`NativeGame.RigPixel.cs` 46·`NativeCpuPixels.cs` 12 = **797줄** + 셰이더 `RigPixelComposite.shader`·`RigPixelToon.shader`·`RigPixelSlashSampling.hlsl`):

1. 액터마다 **격리 레이어의 직교 캡처 카메라** 1대(적은 공유 카메라 1대·액터마다 RT 1장, `NativeEnemyRigRenderer.cs:5`).
2. RT 크기 = `ceil(worldExtent / (worldUnitsPerPixel × texelScale) / 32) × 32`, 64~1024, `texelScale = max(1, screenHeight/1080)` (`NativeRigPixelPolicy.cs`), `FilterMode.Point`, ARGB32 Linear (`NativeRigPixelHero.cs:226`).
3. `worldUnitsPerPixel`은 **실제 월드 카메라**의 발밑 점에서 `ScreenToWorldPoint(screen+up)` 차로 매 프레임 계산 → 화면 1px = RT 1텍셀을 맞춘다(:221).
4. 결과를 월드 안 쿼드(`RigPixel Point composite`)에 붙이고, 발밑 앵커를 **화면 픽셀 격자에 스냅**(`AnchorScreenError`, :238; `NativeHd2D.cs:151~161` 같은 방식).
5. 조명은 주광(달) 방향·색과 점광 배열을 셰이더 전역(`_RigPixelMoon*`·`_RigPixelPoint*`)으로 넘겨 툰 셰이더가 저해상도에서 셀 음영을 만든다(:203~212, `NativeEnemyRigRenderer.cs:82~83`).
6. 접점(임팩트) 앵커는 RT 경계 상자를 화면으로 투영해 높이·가슴 비율로 계산(`EnemyRigImpactAnchor`).

UE 대응(기능별, 공식 문서 절 이름은 [미검증], 검색 발췌는 "커뮤니티 사례만 있고 공식 레시피 없음"):

| Unity 요소 | UE 요소 | 비고 |
|---|---|---|
| 격리 레이어 직교 캡처 카메라 + Point RT | `USceneCaptureComponent2D`(Orthographic) + `UTextureRenderTarget2D`(Nearest 필터) + `ShowOnlyComponents`/`ShowOnlyActors`로 격리 | 검색 발췌: 저해상도 SceneCapture2D + 포스트에서 RT를 그리는 사례, "capture per buffer가 무거움" 보고, HDR 캡처 vs LDR RT 불일치 보고(5.4) → **RT 포맷·톤매핑 전 캡처 설정이 1차 위험** |
| 1px=1텍셀 크기 산식 | 같은 산식을 C++/C#에서 매 프레임 계산(`DeprojectScreenToWorld` 상당) | 산식은 엔진 무관 |
| 월드 쿼드 합성 + 화면 격자 스냅 | 쿼드 메시 + Unlit Material(Translucent, Nearest 샘플) 또는 위젯 컴포넌트; 스냅은 `ProjectWorldToScreen` 왕복 | 검색 발췌: 투명 재질로 고스팅 제거 사례 |
| 툰 셰이더 전역 조명 | Material Parameter Collection(달 방향·색·점광 4개) + 캡처 전용 Unlit/커스텀 셰이딩 | Lumen/VSM이 캡처 카메라에도 걸리므로 캡처 쪽 Show Flags로 끔 [미검증] |
| 접점 앵커 | 경계 상자 투영 동일 | |
| 대안(전체 화면 저해상도) | 커스텀 렌더 패스(RDG 전역 셰이더)로 캐릭터 레이어만 저해상도 | 검색 발췌: 포럼 답변이 "RDG가 깨끗한 길"이라 함. K7 실험에서 두 길을 한 장으로 비교 |

이 797줄 + 셰이더 3개가 K7의 실험 범위다. 산식·앵커·스냅 로직은 엔진 무관이라 (b)에서는 C#으로 그대로 옮기고 캡처·RT·머티리얼 호출만 UE API로 바꾼다.

### 4.2 표현층 총량과 순서 [추정]

- 데모 v0 범위에 필요한 묶음만 세면: 호스트 접착 1,949 + 캐릭터 패스 3,347 + 월드 4,202 + HUD 3,713 + VFX 3,215 + 오디오 1,189 + 세이브 321 + 입력 188 = **18,124줄**(로비 7,808·인벤토리 3,297·QA 4,916은 2차). 재작성이라 줄 수가 그대로 옮겨지지 않지만 규모 비교에는 충분하다.
- 순서는 DIRECTION_RESET 로드맵(캐릭터 → 모션 → 임팩트)과 K1·K7 장면을 따른다: ① 호스트 접착(Core 틱·입력·카메라 LOCK) ② 픽셀 패스(K7) ③ 월드(K1 장면 확장) ④ HUD ⑤ VFX ⑥ 오디오·세이브 ⑦ 로비·인벤토리 ⑧ QA 도구.
- 기간은 사람·레인 수에 따라 달라 이 문서에서 주 단위로 적지 않는다. 비교용 사실 하나: Unity 표현층 34,145줄은 10-24 첫 커밋(`c22c0031`)부터 11-06까지 **약 6주**에 쌓였다(`git log` 범위, 레인 여러 개 병렬).

## 5. 웹 제출 불가 사실과 대안

사실(출처: `CHROMA_AWARDS_PLAN_20261105.md` §0·§2, `DIRECTION_RESET_20261105.md` 19:20·11-06 00:40~03:00):

- 크로마 어워즈 시즌 2 게임 5개 카테고리 전부 **"Playable on web without requiring a download"** 필수(Mac 공식 페이지 확인, 11-05). 마감 2027-01-07 23:45 PT, `submit.chromaawards.com`, 공개 링크·갤러리 임베드·썸네일·영상 필수.
- 따라서 **"UE5는 제출 경로가 없다"**(같은 문서 §2, DIRECTION_RESET 19:20 "UE 비교 실험은 2027-01-07 제출 뒤로 미룬다"). UE5의 공식 웹(HTML5) 타깃 부재는 Epic 문서를 열지 못해 이 세션에서 [미검증]이고, 프로젝트 기록(Mac 확인)을 따른다.
- 제출판 현황(11-06 00:40~03:00): Unity WebGL **3회차 = RM1_Slice 씬 + `--remodel3d`(제품과 같은 2.5D 경로)**, 용량 목표 총량 ≤500MB·첫 묶음 소형, 2회차 비압축 1,512MB → 텍스처 조치 뒤 약 520~550MB [추정, 같은 문서]. 2D 경로는 B 보험.

대안(결정은 사용자):

| 안 | 내용 | 엔진 전환과의 관계 |
|---|---|---|
| 5-A **Unity 현재 빌드로 제출(기본)** | 크로마 계획 §3 9주 일정 그대로: 제출판 = Unity WebGL 2.5D 사본, 제품은 별도. 01-06 제출 | UE 이식은 **제출과 병렬로 Core만**(§2.3 3주 또는 §2.2 10주) 진행 가능 — Core는 엔진 무관이라 제출판을 건드리지 않는다. 표현층 UE 작업은 K1·K7 실험 장면(빈 바닥·고목·캐릭터 한 장)까지만, 제출 뒤 본격 |
| 5-B **제출 접음** | 크로마를 포기하고 UE 전환에 전 자원 | 9주를 UE 표현층에 쓸 수 있으나 "웹 필수"가 아닌 다른 목표(Steam 데모 v0)로 바뀜. 사용자 결정 사항(목표 밖 새 방향) |
| 5-C 웹 H5판(기존 Steam 라이브판) 제출 | 크로마 계획의 B 보험 | 엔진과 무관. 품질선(실버 헬·2.5D)과 멀어 계획 문서가 A 실패 시에만 둠 |

이 문서는 5-A를 전제로 §2를 짰다(Core 이식이 제출 작업과 충돌하지 않는 유일한 안).

## 6. 리스크·미검증 목록

### 6.1 리스크

| # | 리스크 | 영향 | 완화 |
|---|---|---|---|
| R1 | (b) UnrealSharp "not production ready"(FAQ), 릴리스 없음, UE 버전 결합 5.6~5.8 | 플러그인 결함·UE 업그레이드 때 멈춤 | 3주차 go/no-go, 포크 보관, (a) 전환 경로를 1주차 산출물(기준선·ABI 표)이 공유 |
| R2 | (b) 패키징 Win/Mac만, Shipping·Steam 배포 사례 없음 | 출시 직전 발견 | 3주차에 Shipping 패키지 실제 실행을 관문으로 |
| R3 | (b) GC·경계 호출 성능 [미검증] | 1-1 탄막(적 다수) 프레임 | 2주차 틱당 ms·KB/틱 측정, Feedback 큐 객체 풀링은 Core 제안으로 |
| R4 | (a) 부동소수 마지막 비트(Round 19·Pow/Exp 12·원시 삼각 96줄) | oracle FAIL이 "이식 결함"인지 "비트 차이"인지 분류 비용 | 1주차 JsMath 비트 검사, 10주차 전수표, `/fp:precise`·FMA 금지 |
| R5 | (a) JS 형태 구조(문자열 상태기 65·`object` 63·`JsObj`·`Dictionary<string>` 42) | Enemy·Boss 주차 지연 | enum 변환표를 하니스에 두고 문자열 비교 유지 |
| R6 | 이식 중 Core 변경(11-05~06 2커밋) | 두 Core가 갈라짐 | §2.0 동결 SHA + 주 1회 재생, Core 커밋에 "재생 필요" 라벨 |
| R7 | 하니스 24개가 Core 밖 Runtime 파일(`SourceMap.cs` 11)에 의존 | (b)에서 공유 폴더 경계 결정 필요 | 해당 파일의 UnityEngine 의존 여부를 1주차에 확인(코드 수정은 CTO 승인) |
| R8 | 표현층 34,145줄 재작성은 어느 안이든 동일하고, 크로마 9주와 겹침 | 레인 자원 충돌 | §5 5-A: 제출 전엔 Core + K1·K7 장면만 |
| R9 | 픽셀 패스 UE 재현(RT 포맷·HDR·캡처 비용 — 검색 발췌의 커뮤니티 보고) | K7 탈락 | K7 실험을 두 길(SceneCapture / RDG 패스)로 한 장 비교 |
| R10 | Steam 업로드 경로 재작성·Online Subsystem Steam 설정 | 출시 체크리스트 | 데모 v0는 연동 0이라 산출물 경로만; Set Live는 사용자 확인(CLAUDE.md §10) |

### 6.2 미검증 (이 문서가 열지 못한 것)

1. UnrealSharp 공식 문서의 성능·GC·런타임 종류(CoreCLR/NativeAOT) — 문서 사이트 차단, GitHub 소스(`packaging.md`·`faq.md`·`get-started.md`)에는 항목 없음.
2. UnrealSharp Shipping 구성 패키징·Steam 배포 사례 — 문서에 "Windows/Mac만" 외 없음.
3. UE 공식 문서 전부(`dev.epicgames.com`): Scene Capture 2D·Render Target 설정, Large World Coordinates(double), Online Subsystem Steam, Media Framework 코덱, Automation 테스트 — 검색 발췌만.
4. UE5 웹(HTML5) 타깃 부재의 공식 근거 — 프로젝트 기록(Mac 확인)만.
5. 기간 수치 전부 [추정]: (a) 10주, (b) 3주, 표현층 순서. 근거는 묶음 줄 수와 DIRECTION_RESET의 6~12주뿐.
6. 묶음 분류(이름 규칙)·표현 성격 델리게이트 32개(수기) — ±10%.
7. UnrealSharp docs get-started의 "UE 5.3+/.NET 8"과 README "5.6–5.8/.NET 10.0.5"의 차이 — README가 최신으로 보이나 어느 쪽이 5.8에 실제로 맞는지는 Mac 설치로만 확인된다.

## 7. 출처

- 열림(2026-11-05~06): `github.com/UnrealSharp/UnrealSharp`(README·commits·releases), `github.com/UnrealSharp/unrealsharp.github.io`(`packaging.md`·`faq.md`·`get-started.md` 소스), `github.com/crazytuzi/UnrealCSharp`(README·commits), `github.com/nxrighthere/UnrealCLR`(README·commits).
- 검색 발췌(열지 못함): UnrealSharp packaging 페이지 요약, UE 포럼 SceneCapture2D 저해상도·고스팅·HDR 스레드, Epic Online Subsystem Steam 인터페이스 문서 요약.
- 저장소 사실: origin/unity/main `3b207410`(Core·Tools·Runtime·docs), origin/main `b94c8fbf`(game.html). 명령은 각 표와 [CORE_PORT_STUDY_20261105](CORE_PORT_STUDY_20261105.md)에 있다.
