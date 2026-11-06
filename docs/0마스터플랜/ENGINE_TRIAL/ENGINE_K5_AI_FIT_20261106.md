# K5 — 엔진의 AI 호환성·시간 대비 가성비 비교 (Unity 6 · Unreal 5.8 · Godot 4) (2026-11-06)

- 배정: 클라우드 레인 K5, 브리프 [BRIEF_ENGINE_K5_AI_FIT_20261106](../worklog/cloud-lanes/BRIEF_ENGINE_K5_AI_FIT_20261106.md)(사용자 14:50 "카툰 스타일이면 고도도 나쁘지 않던데. 중요한 건 엔진들의 AI 호환성, 시간 대비 가성비"). docs만, 코드·Core 수정 0. 브랜치 `claude/unity-cloud-engine-k5-20261106`(기준 origin/unity/main `ee2af51`).
- K5의 뜻: **에이전트(Claude 레인)가 그 엔진을 얼마나 창 없이·텍스트로·자동으로 굴릴 수 있는가.** 엔진 확정 조건은 K3(화질·작업 효율 키샷, `ENGINE_DECISION_20261105.md` §7.7) + K4(100마리·10분·60fps, `DIRECTION_RESET_20261105.md`:111) + 이 문서의 K5다. **결정은 사용자가 한다.**
- 표기: **[원문]** 공식 문서·공식 소스 원문을 이 세션이 직접 열어 인용 / **[발췌]** 공식 페이지를 못 열어 검색 결과 발췌로 확인 / **[코드]**·**[저장소]** 우리 저장소에서 직접 센 값(경로·SHA) / **[추정]** 근거를 둔 추정 / **[미검증]** 공식 절도 실측도 없음 / **[미측정]** 측정 설계만 있고 값 없음. 기억에 기댄 서술은 넣지 않았다.
- 이 세션의 네트워크 실측(항목 ④의 실측값): `docs.unity3d.com`·`dev.epicgames.com`·`www.unrealengine.com`·`docs.godotengine.org` 네 곳 모두 `getaddrinfo ENOTFOUND`(세션 허용 도메인 밖). `raw.githubusercontent.com`은 열렸다. 그래서 **Godot 공식 문서는 docs.godotengine.org의 소스 저장소(`github.com/godotengine/godot-docs`, master)와 엔진 소스(`github.com/godotengine/godot`, master)에서 원문으로 읽었고**, Unity·UE 공식 문서는 검색 발췌뿐이다. 앞선 레인 ENG(`ENGINE_DECISION_20261105.md` 머리말)·EP(`CORE_PORT_PLAN_20261106.md` 머리말)·WG(`CHANGELOG_SYNC.md` 11-05 WG 절)도 같은 두 호스트가 막혔다고 적었다.

## 0. 결론 3줄 (아침 보고용, 본문 §5와 같음)

1. **K5(무창·텍스트·자동)는 지금 Unity만 실측이 있다**: 공용 실행기 무창·무음 빌드/캡처, batchmode 61회 멈춤 0(창 모드 593회 중 29건과 대비), WebGL 자동 빌드 2회차 완주, unity-mcp 연결. UE는 CLI 경로(커맨드렛·Python·MRQ CLI)가 공식 페이지로 **[발췌]** 확인되지만 **무창 캡처(`-RenderOffScreen`)는 공식 절 [미검증]·우리 실측 0**. Godot은 CLI·텍스트 자산·문서 접근(GitHub 원문)이 셋 중 가장 에이전트 친화적이나 **`--headless`는 dummy 렌더라 캡처에 창이 필요하고, C#은 웹 내보내기 불가**다.
2. **시간 대비 가성비(이식 비용 축)**: Unity 0 / UE Core 3주(UnrealSharp)~10주(C++) [추정, EP] + 표현층 34,145줄 재작성 / Godot은 툰+웹(크로마)이면 C# 금지라 Core 18,353줄 GDScript 재작성 [추정, UE (a)급] + 표현층. 과거 godot/main 시도(10-13~10-21, 280커밋, GDScript 451파일)는 "native 지원 5/미이식 11"에서 멈췄고 10-24 비교 시험은 "어느 쪽이 쉽다는 결론 보류"였다.
3. **K5는 측정 전이라 "AI 호환성" 우열을 결정 근거로 쓰지 않는다.** §2의 같은 과업(빈 바닥+고목+캐릭터 대역+34° 캡처 1장)을 세 엔진에서 에이전트가 창 없이 끝내는 분·개입·막힘·실패를 재고, 툰이면 Godot을 후보에 넣되 **Godot 신규 최소 프로젝트에서 무창 캡처 1장이 되는지가 선행 조건**이다.

---

## 1. 비교 항목표 (세 엔진)

### ① 창 없는 구동 — 빌드·테스트·캡처·렌더를 CLI/배치로

| 항목 | Unity 6 (6000.6.7f1 [코드 `unity/ProjectSettings/ProjectVersion.txt`]) | Unreal 5.8 | Godot 4 (문서 master = 4.8 dev, 우리 과거 시도 4.7.2) |
|---|---|---|---|
| 공식 CLI 경로 | `-batchmode`: "runs command line arguments without the need for human interaction ... suppresses pop-up windows ... however, the Unity Editor itself opens as usual" **[발췌 S-U1]**. `-nographics`: "when running in batch mode, do not initialize graphics device at all" **[발췌 S-U1, 4.3 시대 페이지. 현행 6000.x 원문 미열람]**. `-executeMethod`: Editor 폴더의 static 메서드 호출, 추가 인자는 `System.Environment.GetCommandLineArgs` **[발췌 S-U1]**. 종료 코드: 예외면 1, `EditorApplication.Exit(code)` **[발췌 S-U1]** | 커맨드렛: `UnrealEditor-Cmd.exe <proj> -run=<name>`(쿡 예 `-run=cook`) **[발췌 S-E3]**. 패키징: `RunUAT.bat/.sh BuildCookRun`(Engine/Build/BatchFiles) **[발췌 S-E3]**. Python: `UnrealEditor-Cmd.exe <proj> -ExecutePythonScript=<.py>`(끝나면 에디터 자동 종료, Editor Scripting Utilities·Python 플러그인 필요) 또는 `-run=pythonscript -script=` **[발췌 S-E2]**. 헤드리스 테스트: `-unattended -nullrhi -nosound` 조합 포럼 보고 **[발췌 S-E3 포럼]** | `--headless` = "Enable headless mode (`--display-driver headless --audio-driver Dummy`). Useful for servers and with `--script`" **[원문 G1]**. `--export-release <preset> <path>`·`--export-debug`·`--export-pack` **[원문 G1]**, 템플릿 설치 필수·preset 이름은 `export_presets.cfg`에 있어야 함 **[원문 G1·G5]**. `--script`/`-s`, `--check-only`(파싱만), `--import`(임포트 뒤 종료), `--build-solutions`(C# 솔루션 빌드), `--quit`, `--quit-after N` **[원문 G1·G4]** |
| 무창 **렌더·캡처** | `-nographics`는 그래픽 장치를 만들지 않으므로 캡처 불가 **[발췌 S-U1에서 도출]**. 우리 캡처는 **숨은 데스크톱(hidden desktop)에서 창 모드 Player**로 한다: `exo-unity.ps1` `-PcException`, `--unity-mute/NativeMuteGuard`, QA sandbox, hidden desktop **[저장소 R6:37]**; 21개 공용 Player 실행 exit 0·사용자 데스크톱 노출창 0 **[저장소 R6:8]** | **공식 절 [미검증].** Epic 직원 포럼 답변: 오프스크린 렌더는 "플랫폼과 RHI에 의존, Vulkan on Linux·D3D12 on Windows면 `-RenderOffscreen` 사용 가능" **[발췌 S-E1 포럼 475619]**. `-nullrhi`는 렌더타깃을 못 얻음(렌더 없음) **[발췌 S-E1]**. MRQ CLI 공식 페이지("Using Command Line Rendering with Movie Render Queue") 존재: `-MoviePipelineConfig`(Level Sequence·Queue·Python executor 3모드), 공식 예시 인자 `-windowed -resx=1280 -resy=720 -log -notexturestreaming` **[발췌 S-E4]** → **공식 예시 자체가 창 모드**. 우리 실측 0 | `--headless`의 DisplayServer는 렌더 드라이버 목록이 `"dummy"` 하나이고 `window_can_draw`·`can_any_window_draw`가 `false` **[원문 G6 `servers/display/display_server_headless.h`]** → **headless에서는 화면이 그려지지 않아 캡처 불가**. 캡처 경로는 `--write-movie <file>`(".avi 또는 .png", `--fixed-fps`, `--quit-after N`) **[원문 G1·G4]**이며 문서에 headless·오프스크린 언급 0 **[원문 G4]** → 실제 display driver(창) 필요. "On platforms with GPU access, `--headless` prevents a window from spawning while the project is exporting" **[원문 G1]** → **export는 무창 가능** |
| 우리 레인 실측 | **공용 실행기 `I:\EXODUSER-Storage\unity-jobs\bin\exo-unity.ps1`**(무창·무음·세이브 격리, CLAUDE.md §1·§3.3). batchmode 61회 멈춤 0 vs Windows.Gaming.Input 창 모드 593회 중 29건 멈춤 **[저장소 R5:92]**. Windows 빌드 1회 Succeeded/errors 0, 6,754,925,604 bytes **[저장소 R6:37]**. 예약 작업 BuildLoop 30분 주기(CLAUDE.md §3.4) | **0회.** PC에 UE 5.8.2 설치만 확인(`G:\UE_5.8`, Fab·Bridge 플러그인), "K3 PC 준비 문서(프로젝트 골격·무창 렌더 경로 공식 문서 확인·Fab 로그인)만, 실행·로그인은 사용자" **[저장소 R4:110]**. Mac은 03:41Z부터 computer_unreachable로 K3 UE 키샷 미처리 **[저장소 R4:110]** | 과거 시도(10-13~10-21): Godot 4.7.2 headless로 테스트 스크립트 실행(격리 실행 3.35~9.1초) **[저장소 R8:601,1271]**, Mac 에디터 headless로 Windows x64 export·PCK 마운트 검사 PASS **[저장소 R9:10,105-106]**, Web single-thread export 공개 플레이 관측 **[저장소 R10:57]**, 원칙 "GUI 자동실행 0" **[저장소 R8:439]**. 시각 검수는 창을 띄운 "GPU" 실행으로 했고 무창 캡처 경로 기록 0 **[저장소 R8:601]** |
| AI 연결(MCP) | `com.coplaydev.unity-mcp` 연결됨 **[코드 `unity/Packages/manifest.json`:30]**. Unity 공식 MCP = AI Assistant 패키지(2.4~2.6)의 MCP 서버(릴레이 바이너리 `--mcp`, Project Settings > AI > Unity MCP, 첫 연결 승인) **[발췌 S-U3]**, 구독 필요 **[발췌 S-U3 blog]** | 5.8 Epic 공식 MCP 플러그인(실험적, "LLM을 엔진에 연결해 에셋 생성·테스트·최적화") **[발췌 S-E5 Epic 포럼 공지]**, 기본 `http://127.0.0.1:8000/mcp` **[발췌 S-E5, 서드파티 Fab 목록]**. 릴리스 노트 원문·무창 모드 동작 여부 **[미검증]** | 공식 MCP 없음(검색하지 않음, **[미검증]**). 대신 CLI·텍스트 자산으로 에디터 없이 작업 가능(아래 ②③) |

### ② 자산·씬의 텍스트성 — diff·머지·에이전트 직접 편집

| 항목 | Unity | Unreal | Godot |
|---|---|---|---|
| 정본 포맷 | 씬·프리팹·머티리얼·에셋이 YAML 텍스트(Force Text) **[ENG §4 표 R2:129, 공식 절 미열람]**. 우리 저장소 사실: `Assets/Scenes/FirstPlayable.unity` 4.8KB 텍스트 **[저장소 R7:73]**, `.meta` 1,055개를 grep으로 통계 낸 기록(비압축 848·8192 841·WebGL 오버라이드 0) **[저장소 R7:29]** → 에이전트가 파일을 직접 읽고 고치고 Git이 병합한다 | `.uasset`/`.umap` 바이너리. Epic 2014 블로그 "regular diff tools don't work very well on binary files like Unreal .uasset packages", 텍스트 내보내기 diff·Blueprint 전용 diff 제공 **[발췌 S-E6, 2014]**. "T3D" 명칭·Perforce 배타 체크아웃 절은 발췌에 없음 **[미검증]**. 완화책(Blueprint 0·C++·DataTable CSV/JSON·One File Per Actor·Python 배치) **[ENG R2:130]** | `.tscn`: "Unlike binary SCN files, TSCN files have the advantage of being mostly human-readable", "easy for version control systems to manage", 섹션 `ext_resource`·`sub_resource`·`node`·`connection` **[원문 G3]**. `export_presets.cfg` "can be safely committed to version control" **[원문 G5]**. 과거 godot/main: `.gd` 451·`.tscn` 4·`.gdshader` 7·`.tres` 0·`.cs` 0·`data/*.json` 20·`.import` 사이드카 텍스트 **[저장소 `git ls-tree 607110d52 -- godot`]** |
| 에이전트 편집 | 직접 편집 가능(YAML) | 에디터·MCP·Python 경유만(정본이 바이너리) **[ENG R2:146]** | 직접 편집 가능(텍스트) |
| 동시 3레인 병합 | Git 자동 병합(충돌은 텍스트) | 바이너리라 덮어쓰기, 잠금 운영 필요 **[ENG R2:129, Perforce 절 미검증]** | Git 자동 병합(텍스트) |

### ③ 스크립팅 표면 — 에이전트가 쓸 언어·API

| 항목 | Unity | Unreal | Godot |
|---|---|---|---|
| 런타임 언어 | C#. 우리 Runtime 424파일·52,237줄, Core 133파일·18,320줄(11-05) → 18,353줄(11-06) **[저장소 R2:127, R3:6]** | C++ + Blueprint. C#은 서드파티 UnrealSharp("not production ready", 5.6~5.8, .NET 10.0.5, Win/Mac 패키징만) **[저장소 R3 §1.1, GitHub README 원문 인용]** | GDScript / C#(.NET). .NET은 데스크톱(Linux·Windows·macOS) 내보내기 지원, Android·iOS 실험적, **웹 불가**; "Godot 4.8 requires .NET 10 or later"; .NET 에디터는 별도 빌드·SDK 별도 설치 **[원문 G2]** |
| 에디터 자동화 | C# Editor 스크립트(우리 Editor 64파일 **[저장소 R2:144]**), `-executeMethod` **[발췌 S-U1]**, 우리 `Editor/DevTools/JobServer`(ExoJobServer·ExoArgs·ExoProbe) **[코드 경로]** | Python 에디터 스크립팅(에디터 전용, 스크립트 끝나면 종료) **[발췌 S-E2]**, 커맨드렛 **[발췌 S-E3]** | `--script`(헤드리스), `--check-only`(파싱 검사), `--import`, `--build-solutions` **[원문 G1]**. 씬은 텍스트라 에디터 없이 생성 가능 **[원문 G3]** |
| 에이전트 관점 차이 | 컴파일 오류·도메인 리로드가 피드백 루프(수치 [미측정]) | C++ 빌드·UHT·링크가 루프(수치 [미측정], ENG R2:133은 [추정]) | GDScript는 동적 타입이라 결정론(double 연산·Round/Pow) oracle 검증 비용이 C# 유지 경로보다 큼 **[추정]**; `--check-only`가 컴파일 대역 |

### ④ 문서 접근성 — 공식 문서가 세션 네트워크에서 열리는가 (실측, 이 세션 11-06)

| 호스트 | 결과 | 비고 |
|---|---|---|
| `docs.unity3d.com` | **ENOTFOUND(차단)** | ENG·EP·WG 세션도 차단 **[저장소 R2 머리말, R3 머리말]**. 검색 결과에 `docs.unity.cn` 미러가 보이나 미시도 **[미검증]** |
| `dev.epicgames.com` | **ENOTFOUND(차단)** | ENG·EP 세션도 차단 **[저장소 R2 머리말, R3 머리말]** |
| `www.unrealengine.com` | **ENOTFOUND(차단)** | FAQ·라이선스 페이지 |
| `docs.godotengine.org` | **ENOTFOUND(차단)** | **대체 경로 성공:** `raw.githubusercontent.com/godotengine/godot-docs/master/...`(문서 소스)·`.../godotengine/godot/master/...`(엔진 소스) 원문 열림 → Godot만 원문 인용 가능 |
| `raw.githubusercontent.com` | 열림 | EP 세션도 `github.com`에서 UnrealSharp 문서를 읽었다 **[저장소 R3 머리말]** |

→ 에이전트 관점에서 Godot은 **문서 자체가 Git 저장소**라 세션 네트워크 정책과 무관하게 원문 대조가 되고, Unity·UE는 호스트 허용이 없으면 발췌에 의존한다. (이 차이는 환경 설정으로 없앨 수 있다: 세 호스트를 세션 허용 목록에 넣으면 된다. 사용자 결정 사항.)

### ⑤ 빌드·반복 시간 (실측 있는 것만)

| 항목 | Unity | Unreal | Godot |
|---|---|---|---|
| 빈 프로젝트 빌드 | **[미측정]** | **[미측정]** | **[미측정]** |
| 우리 1-1 상당 빌드 | Windows Player 빌드 1회 성공(바이트 6,754,925,604) **[저장소 R6:37]**, 소요 분 기록 없음 **[미측정]**. WebGL 전체 빌드 **36~80분** **[저장소 R4:92]**. 빌드·스모크 뒤 전 화면 UI 겹침 검사 14분 **[저장소 CHANGELOG:193]** | **[미측정]**(ENG R2:133 "증분 수십 초~수 분, 첫 셰이더 컴파일 수십 분~1시간+"는 [추정]) | 과거 시도: 테스트 단위 실행 3.35~9.1초, compile 검사 0.562초 **[저장소 R8:601,628]**. export 소요 분 **[미측정]** |
| 반복 루프(코드 1줄 → 화면) | **[미측정]**(ENG K5 기준 "UE ≤ Unity의 3배" **[저장소 R2:70]**) | **[미측정]** | **[미측정]** |

### ⑥ 웹 내보내기 (크로마 어워즈 제출판, 01-06 마감)

| 항목 | Unity | Unreal | Godot |
|---|---|---|---|
| 공식 지원 | Web 플랫폼(WebGL2 기본·WebGPU 실험적). 제약(발췌): WebGPU 미지원 브라우저 존재, 비동기 컴퓨트 없음, 동기 GPU 리드백 없음, 실시간 GI 미지원(베이크만), OS 폰트 접근 불가(번들 필수), VideoClip 임포트 불가(URL/StreamingAssets) **[발췌 S-U4, 6.2~6.7 페이지 혼재]** | **공식 HTML5/WebGL 없음**(4.24에서 커뮤니티 이관, 공식 대안 Pixel Streaming) **[발췌 ENG R2:257, 포럼 154782]** | Web 공식. "Godot 4 can only target WebGL 2.0 (using the Compatibility rendering [method])", "Forward+/Mobile are not supported on the web platform"; **"Projects written in C# using Godot 4 currently cannot be exported to the web"**; 4.3부터 single-thread export가 기본(페이로드 축소), 스레드 쓰면 COOP/COEP 헤더 필요 **[원문 G7]** |
| 우리 실측 | **1회차**(11-05 PC, 72e104989 `-slim -astc`): 빌드 성공·오류 0, data.br 811.8MB, 텍스처 오버라이드 대부분 미적용 **[저장소 R7:9]**; 브라우저에서 1-1 필드 진입 확인 **[저장소 R4:86]**. **2회차**: 비압축 1,512MB, WebGPU·WebGL2 1-1 진입, 전투 1분 오류 0, 첫 로딩 15~19초(로컬) **[저장소 R4:92]**, 단 2D 경로였음(`--remodel3d` 웹 템플릿에 없음) **[저장소 R4:101]**. **3회차** = RM1_Slice 씬 + `--remodel3d` + 텍스처 조치(e0ff19191 기준) **[저장소 R4:101, R3:187]** — 결과는 이 세션에서 **[미확인]**. **4회차 후보** = data 분할(첫 묶음 30~50MB·총량 ≤500MB 목표) **[저장소 R4:102]**. 11-06 02:50 "Unity 전용 투자 중지(WebGL 추가 회차 없음)" **[저장소 R4:108]** | 0회(경로 없음) | 과거 시도: `export_presets.cfg` preset.1 "Web Native Preview Single Thread" **[저장소 `607110d52:godot/export_presets.cfg`]**, Web single-thread export로 공개 시작·한글 HUD·WASD·기검참·Q·Esc를 브라우저에서 관측 **[저장소 R10:57]**. GL Compatibility 렌더러 **[저장소 `607110d52:godot/project.godot`]** |
| 제출판 함의 | 제출판 Unity 고정 **[저장소 R2:74, R4:85]** | 제출 불가 → Core만 병렬(EP 5-A) **[저장소 R3:193]** | **툰+웹이면 GDScript만**(C# 불가) → Core 18,353줄 재작성 전제 |

### ⑦ Core 이식 비용

| 경로 | 비용 | 근거 |
|---|---|---|
| Unity 유지 | **0** | Core가 Unity 프로젝트 안에 있음 **[저장소 R3 §2.0]** |
| UE (a) C++ 재작성 | Core **10주 [추정]**(주당 1,800~2,000줄), 밀리면 12주 | **[저장소 R3:38,68-83]** |
| UE (b) C# 유지(UnrealSharp) | Core **3주 [추정]**, 3주차 go/no-go(해시 동일·틱 ≤1ms·Win/Mac 패키지), no-go면 (a) | **[저장소 R3:38,85-93]** |
| UE 공통 표현층 | 34,145줄 재작성(데모 v0 범위 18,124줄), 기간 미기재 | **[저장소 R3:177-179]** |
| Godot C#(.NET) 경로 | Core 133파일을 .NET 프로젝트에 링크 → 데스크톱(Steam)은 성립, **웹 불가** **[원문 G2·G7]** → 크로마 제출판은 Unity 유지 또는 GDScript 재작성 | 기간 **[미측정·추정 없음]**. UnrealSharp(b)와 같은 "같은 소스 → 같은 IL" 구조가 성립하는지 oracle 1회 필요 **[미검증]** |
| Godot GDScript 재작성 | Core 18,353줄 + 표현층. 규모는 UE (a)와 같은 급 **[추정]**, 결정론(JS 의미론 238줄·Round/Pow·원시 삼각) 재검증 필요 **[저장소 R3:74,208]** | 기간 **[추정 없음]** |
| godot/main 과거 시도(사실) | 2026-10-13~10-21, `godot/` 터치 커밋 280개(fetch 범위), 첫 커밋 `d9e1cbce` 10-16(통합)·마지막 `46b8f718` 10-21 **[저장소 `git log origin/godot/main -- godot`]**. 당시 Core(C#)는 없었고 웹 JS→GDScript 직접 이식이었다(`port_modules/*/producer.gd` 구조) **[저장소 ls-tree]**. 범위: "native 지원 5/미이식 11"(10-13) **[저장소 R9:10]**, Q/E 부분 연결·RETOUCH 유지(10-15) **[저장소 `607110d52:godot/README.md`]**. 10-20 "고도를 우리식으로 개조" 전략 **[저장소 R11:5]** → 10-24 "고도 보존·Unity 비교 시험, **어느 엔진이 더 쉽다는 결론 보류**" **[저장소 R12:11,17]** → 10-26 Godot 중단, 10-27 `unity/main` 신설(사용자 결정) **[저장소 R13:43,53]** | 재개하면 10-21 상태에서 시작하되 Core는 새로 들어가야 함 |

### ⑧ 화질 상한 · 툰 적합 (PBR과 툰 분리)

| 축 | Unity 6 URP | Unreal 5.8 | Godot 4 |
|---|---|---|---|
| PBR(황천식) | 라이트맵 굽기 + APV + Reflection Probe **[발췌 ENG R2:253]**; Web은 실시간 GI 미지원 **[발췌 S-U4]** | Lumen(실시간 GI·반사)·Nanite·VSM·Volumetric Fog **[발췌 ENG R2:252-253]**; 5.8 "Lumen Lite"·MegaLights 정식 **[발췌 S-E5 서드파티 요약]** | SDFGI·VoxelGI 등 Forward+ 전용 GI는 공식 절 **[미검증]**(이 세션에서 검색·원문 모두 안 함). Web은 Compatibility만 **[원문 G7]**. 과거 시도는 GL Compatibility였음 **[저장소 project.godot]** |
| 툰(카잔식, KZ 레인) | 포스트/셰이더(Shader Graph 설치 **[저장소 R2:104]**)로 충분 **[추정]** | 포스트/머티리얼로 충분 **[추정]** | 포스트/셰이더(`.gdshader` 텍스트, 과거 시도 7개) **[저장소 ls-tree]**로 충분 **[추정]**; 사용자 14:50 "카툰 스타일이면 고도도 나쁘지 않던데" |
| 판단 | PBR 상한은 UE > Unity(발췌 근거), Godot은 근거 없음 | | 툰이면 셋 다 상한보다 **에이전트 제작 효율(K3·K5)**이 변별 |

### ⑨ 라이선스·비용

| 엔진 | 내용 | 근거 |
|---|---|---|
| Unity | Runtime Fee **폐지**(2024-09, "Unity is canceling the Runtime Fee"), 좌석 구독으로 복귀. Personal 무료 상한 매출+투자 연 20만 달러. Pro 좌석당 연 2,200달러(2025-01-01) **[발췌 S-U2]**. ENG는 "2,310달러(2026-01-12 인상)" **[저장소 R2:182, unity.com/products/pricing-updates 발췌]** → **두 수치 불일치, 현행 원문 [미검증]** | 공식 블로그 `unity.com/blog/news/open-letter-on-runtime-fee` **[발췌]** |
| Unreal | 제품 평생 총매출 **100만 달러 초과분 5%**, Release Form 제출, EGS 매출 제외, EGS 동시/선출시 시 3.5%(2025-01-01~), 게임 개발 좌석료 없음 **[발췌 S-E7]** | `unrealengine.com/en-US/faq`·`/license` **[발췌]**; EULA 원문 계약 전 재확인 |
| Godot | "Godot is created and distributed under the MIT License", 요구는 "include the license text somewhere in your game or derivative project"뿐, 서드파티 구성요소는 각자 라이선스 **[원문 G8]** | `about/complying_with_licenses.rst` **[원문]** |

### ⑩ 우리 레인 실측 실패 사례 (11-04~06, 엔진 자동화가 막힌 지점)

| 엔진 | 날짜 | 막힌 지점 | 출처 |
|---|---|---|---|
| Unity | 11-04 13:08 | HALT 오탐: 서브에이전트의 I: 전체 재귀 grep + 7GB 빌드로 I: 포화 → Player 시작 지연을 좀비로 오인, PC Unity 레인 전부 정지. 수정 `bf481ad0e`(120초·CPU·종료 단계 요구, 디스크 유휴 대기) | **[저장소 R5:93-96]** |
| Unity | 11-04 16:40 | BuildLoop 8ad7fa322 회차: UI 겹침 검사 Player가 다른 레인 Player 예약 7건(FIFO) 뒤 40분 대기 초과 → 판정 FAIL, 바탕화면 미갱신. 실행기 `loopfirst` | **[저장소 CHANGELOG:130]** |
| Unity | 11-04 17:50 | 바탕화면 교체가 하루 종일 Editor 예약 순번에 밀림. 실행기 `loopfirst2` | **[저장소 CHANGELOG:124]** |
| Unity | 11-04 19:45 | 좀비 HALT(14612·40496): 실행기 `zombiehalt`. HALT 동안 **Editor batch build는 진행(batchmode 정지 0/61)**, 타 owner Player는 대기 | **[저장소 CHANGELOG:116]** |
| Unity | 11-04 11:05 | UI 겹침 검사 Player 제한 1800→3600초: 다른 레인 Editor 빌드·디스크 작업과 겹쳐 약 14fps | **[저장소 CHANGELOG:167]** |
| Unity | 11-04 05:20 / 06:00 | 실행기 Windows 기본 환경 변수 빈 값 보정(`winenv`) / 강제 종료 Player의 0xFFFFFFFF 종료 코드로 영수증 유실 | **[저장소 CHANGELOG:226,211]** |
| Unity | 11-04~ | **Player 실행 금지(세션)**: 실게임·판정은 Mac, K4 과부하는 "실행은 사용자가 PC에서 직접(세션은 Player 실행 금지)" | **[CLAUDE.md §3.4, 저장소 R4:111, R14:127]** |
| Unity | 11-05~06 | **WebGL 오버라이드 거부**: 텍스처 오버라이드 미적용(RGBA32 799MB·비크런치 DXT5 402MB) **[저장소 R7:9,116]**; 오디오 오버라이드 `BuildTargetGroup.WebGL`·"WebGL"·"Web" 세 경로 모두 set=False **[저장소 R4:93]**; 비4배수 규칙으로 1,081행 비압축 **[저장소 R4:103]**; 빌드 36~80분이라 3회차 보류 **[저장소 R4:92]** |
| Unreal | 11-06 | **무창 렌더 근거 0**: `-RenderOffScreen` 공식 절 미검증(이 문서 ①), PC는 설치·준비 문서만, Mac unreachable | **[저장소 R4:110]** |
| Godot | 10-13~10-24 | 헤드리스 테스트는 통과했으나 시각 판정은 RETOUCH 반복(README 10-15 "전체 RETOUCH/latestfullfalse"), 10-24 "결론 보류", 10-26 중단 | **[저장소 README, R12:17, R13:43]** |

---

## 2. K5 측정 설계 — 같은 과업을 세 엔진에서 에이전트가 창 없이

### 2.1 과업 정의

"빈 바닥 + 스캔 고목 1그루(Fab Standard License 무료 Megascans, K3와 같은 자산) + 캐릭터 대역(캡슐 또는 Warrior FBX) + **카메라 LOCK 피치 34°**(fov 46.945·dist 16.5, `DIRECTION_RESET_20261105.md`:95 Mac 실측값) 캡처 1장(1920×1080 PNG)". 시작 상태 = 빈 프로젝트(Unity는 현 프로젝트의 빈 씬도 허용, 둘 다 기록). 종료 = PNG 파일이 디스크에 있고 사람이 열어 고목·대역·바닥이 보임.

### 2.2 기록 규칙

- **소요(분)**: 에이전트 첫 명령 ~ PNG 생성까지 벽시계. 사람이 끼어든 시간은 따로 적고 합계에서 뺀 값도 적는다.
- **사람 개입 횟수**: 로그인·설치·창 닫기·승인 클릭 등 사람이 한 독립 조작 묶음 수(같은 창 안 연속 조작은 1).
- **막힌 지점**: 5분 넘게 멈춘 곳과 원인(명령·오류 원문).
- **실패 횟수**: 실패로 끝난 명령 수(같은 명령을 수정 없이 재실행 금지, CLAUDE.md §9).
- **의도 밖 변경 수**: diff에서 과업과 무관한 파일 변경 수(ENG K5 CX12 항목, `ENGINE_DECISION_20261105.md`:70).
- **창·소리**: 사용자 데스크톱에 창이 떴는지(0/1), 소리(0/1). 1이면 "무창 조건 미달"로 별도 표기(FAIL은 아니고 측정값).

### 2.3 절차 초안 (공식 문서 절 기준, 실행은 Mac K3·Unity 현행·Godot 신규)

| 단계 | Unity (현행 프로젝트, PC 공용 실행기 또는 Mac 셸) | Unreal (Mac K3 또는 PC `G:\UE_5.8`) | Godot (신규 최소 프로젝트, 4.x 최신 안정판) |
|---|---|---|---|
| 0 설치·로그인 | 있음(0) | Epic 계정·Fab 로그인은 사람 **[저장소 R4:110]** | 바이너리 1개 + export template(캡처만이면 불필요) **[원문 G1·G5]** |
| 1 자산 반입 | Fab에서 받은 FBX/텍스처를 `Assets/` 아래 복사(에이전트 파일 조작) → Editor batch 임포트: `exo-unity.ps1` editor `-batchmode -quit -executeMethod <Editor 스크립트>` **[발췌 S-U1]** | Python: `UnrealEditor-Cmd <proj> -ExecutePythonScript=import_tree.py`(`unreal.AssetImportTask`) **[발췌 S-E2, API 절 미검증]** | 파일 복사 → `godot --headless --path <proj> --import` **[원문 G1]** |
| 2 씬 구성 | (a) `.unity` YAML을 에이전트가 직접 작성 또는 (b) Editor 스크립트로 바닥 Plane·고목 Prefab·캡슐·Camera(pitch 34) 생성·저장 | Python으로 StaticMeshActor 스폰·CameraActor 회전(pitch −34)·레벨 저장(`.umap` 바이너리) **[발췌 S-E2]** | `.tscn` 텍스트를 에이전트가 직접 작성(MeshInstance3D 바닥, 고목 glTF 인스턴스, CapsuleMesh, Camera3D `rotation = Vector3(-0.593, 0, 0)`(=−34°), DirectionalLight3D) **[원문 G3]**; `godot --headless --check-only -s <스크립트>`로 파싱 검사 **[원문 G1]** |
| 3 컴파일/임포트 확인 | batch Editor 로그에 컴파일 오류 0 | `-run=cook` 또는 Python 종료 코드 **[발췌 S-E3]** | `--import` 종료 코드 0, `.import` 사이드카 생성 확인 |
| 4 캡처 1장 | 숨은 데스크톱 Player(`-PcException`, mute, QA sandbox) + QA 캡처 라이터 **[저장소 R6:37]**; Mac은 공용 실행기 없음 → Mac 셸 절차 **[미확인]** | **측정의 핵심.** 후보 A: MRQ CLI `UnrealEditor-Cmd <proj> <map> -game -MoviePipelineConfig=<PNG 1프레임 preset> -windowed -resx=1920 -resy=1080 -log` **[발췌 S-E4]**(공식 예시 = 창 모드 → 창 0/1 기록). 후보 B: A에 `-RenderOffScreen` 추가 **[발췌 S-E1 포럼, 공식 절 미검증]**(Mac Metal에서 동작 여부가 측정값). `-nullrhi`는 캡처 불가라 쓰지 않음 **[발췌 S-E1]** | 후보 A: `godot --path <proj> --write-movie out.png --fixed-fps 60 --quit-after 2` **[원문 G1·G4]** → 창이 뜸(headless는 dummy 렌더 **[원문 G6]**) → 창 0/1 기록. 후보 B(Linux 클라우드 레인): Xvfb 아래 A **[미검증]**. 후보 C: `--headless`로 캡처 시도해 실패를 기록(예상: 빈 프레임 또는 오류) |
| 5 판정 | PNG 열어 고목·대역·바닥·34° 확인(Mac 사람 1회) | 동일 | 동일 |

### 2.4 결과표 틀

| 엔진 | 호스트 | 소요(분) | 사람 개입(회) | 막힌 지점 | 실패(회) | 의도 밖 변경 | 창/소리 | 캡처 성공 | 비고(커밋 SHA·로그 경로) |
|---|---|---|---|---|---|---|---|---|---|
| Unity 6000.6.7f1 | PC 공용 실행기 | | | | | | | | |
| Unity 6000.6.7f1 | Mac 셸 | | | | | | | | |
| Unreal 5.8.2 | PC `G:\UE_5.8` | | | | | | | | |
| Unreal 5.8.x | Mac | | | | | | | | |
| Godot 4.x | Mac | | | | | | | | |
| Godot 4.x | 클라우드 Linux(Xvfb) | | | | | | | | |

합격·중단 조건(제안, CTO 확정): 어느 엔진이든 **캡처 성공 + 창 0 + 사람 개입 ≤ 2(로그인·승인)**가 K5 PASS. 같은 엔진이 같은 막힌 지점으로 2회 FAIL이면 방법을 바꾸고(CLAUDE.md §4.1) 세 번째는 하지 않는다.

---

## 3. 스타일별 후보 결론 (K3·K4·K5 예상 강약, 수치는 출처 또는 [추정])

### 3.1 PBR(황천식)이면 — Unity vs UE

| 축 | Unity 6 | Unreal 5.8 | 근거 등급 |
|---|---|---|---|
| K3 화질·제작 효율 | 라이트맵·APV, 스캔 반입은 외부 임포트 | Lumen·Nanite·Fab 에디터 내 반입, 사용자 02:50 "원하는 퀄리티는 언리얼이 더 좋아 보여" | 발췌(ENG §7.7)·사용자 원문 **[저장소 R4:108]** |
| K4 100마리·10분·60fps | 현 프로젝트 적 100마리 상한으로 바로 측정 가능 | Core 없이 합성(스켈레탈 100 + Niagara 대역) | 설계만 **[저장소 R4:111]**, 값 [미측정] |
| K5 무창·텍스트·자동 | **강**: 실측 있음(①⑩), YAML, unity-mcp 연결 | **약~미지**: CLI 경로는 발췌 확인, 무창 캡처 미검증, 바이너리 자산·에디터 경유 편집 | ①②③ |
| 이식 비용 | 0 | Core 3~10주 [추정] + 표현층 34,145줄 | ⑦ |
| 웹 제출 | 가능(실측 2회차) | 불가 | ⑥ |
| **예상** | K5·비용·웹 우위 | K3 우위 가능성(블라인드 전엔 [추정]) | 결정은 K1 블라인드 + K3 + K4 실측 뒤 |

### 3.2 툰(카잔식)이면 — Unity vs UE vs Godot

| 축 | Unity 6 | Unreal 5.8 | Godot 4 | 근거 등급 |
|---|---|---|---|---|
| K3 툰 제작 효율 | Shader Graph·포스트 **[추정]** | 머티리얼·포스트 **[추정]**, Lumen 이점은 툰에서 작아짐 **[추정]** | `.gdshader` 텍스트·포스트 **[추정]**; 상한 근거 없음(⑧) | 전부 [추정] |
| K4 100마리 | 바로 측정 가능 | 합성 필요 | 신규 프로젝트에서 합성 필요; 과거 시도 성능 기록은 4.7.2 GL Compatibility 기준으로 1-1 상당 아님 **[저장소 R8:862 부근, 성능 monitor 주의만]** | 값 [미측정] |
| K5 무창·텍스트·자동 | **강**(실측) | 약~미지 | **텍스트성·CLI·문서 접근은 셋 중 최강(원문 인용 가능), 단 무창 캡처는 창 필요(dummy 렌더)·공식 MCP 없음·C# 웹 불가** | ①②③④⑥ |
| 이식 비용 | 0 | Core 3~10주 + 표현층 | **웹 제출이면 GDScript 재작성(Core 18,353줄 + 표현층)**; 데스크톱만이면 C# 링크 가능성(oracle 1회 [미검증]) | ⑦ |
| 웹 제출 | 가능 | 불가 | 가능(GDScript·Compatibility·single-thread, 과거 실측 1회) | ⑥ |
| 라이선스 | 좌석 구독(Pro 2,200~2,310달러/좌석/년 [발췌 불일치]) | 5%>100만 달러 | MIT(0원) | ⑨ |
| **예상** | 기본값(지금 자산·하니스 전부 보존) | 툰이면 화질 이점이 줄어 전환 명분이 K3 실측에만 남음 | **후보 등록 타당**(사용자 14:50). 단 ① K5 §2 Godot 행 1회(무창 캡처 성공 여부) ② Core 경로 결정(C# 데스크톱 vs GDScript 전체)이 선행 | |

### 3.3 공통

- 셋 다 "출시 수준 AI 주도 사례"는 미확인(ENG §4.1). 우리 자신(Runtime 52,237줄 대부분 AI 작성)이 Unity 쪽 유일한 사례다 **[저장소 R2:147]**.
- 전환 이력 경고: 웹(H5) → Godot(10-13~10-26) → Unity(10-27~) → UE 검토(11-05~). 전환마다 "규칙 이식 + 하니스 + 파이프라인"을 다시 만들었다 **[저장소 R2:172]**. Godot 재진입은 세 번째 전환이다.

---

## 4. 미검증 목록 (이 문서에서 [미검증]·[미확인]·[미측정]으로 남긴 것, 총 16)

| # | 항목 | 어디서 확인하나 |
|---|---|---|
| 1 | Unity 현행(6000.x) `-nographics`·`-batchmode` 원문(발췌는 4.3 시대 페이지) | `docs.unity3d.com/Manual/EditorCommandLineArguments.html` 허용 뒤 |
| 2 | UE `-RenderOffScreen` 공식 문서 절·지원 플랫폼/RHI(Mac Metal 포함) | `dev.epicgames.com` command-line-arguments 페이지 |
| 3 | UE MRQ CLI 무창 조합(`-RenderOffScreen` + `-MoviePipelineConfig`) 동작 | K5 §2 UE 행 실측 |
| 4 | UE 5.8 Unreal MCP 릴리스 노트 원문·무창(커맨드렛) 모드 동작 여부 | 5.8 릴리스 노트 |
| 5 | UE "T3D" 명칭·Perforce 배타 체크아웃 공식 절 | Epic 문서(2014 블로그는 텍스트 내보내기·Blueprint diff까지만) |
| 6 | Unity Pro 좌석 가격 현행(2,200 vs 2,310달러) | `unity.com/products/pricing-updates` 원문 |
| 7 | Unity MCP(AI Assistant 패키지) 구독 조건·버전(2.4~2.6 중 6000.6 대응) | docs.unity3d.com Packages |
| 8 | Godot 4 Forward+ GI(SDFGI·VoxelGI) 공식 절·툰 포스트 절 | `godot-docs` 원문(열림) — 이번 범위 밖이라 안 함 |
| 9 | Godot C# 데스크톱 경로에서 Core 133파일 링크 → 같은 IL·결정론 성립 | oracle 1회(EP §3.3 하니스 방식) |
| 10 | Godot Xvfb(클라우드 Linux) 아래 `--write-movie` 캡처 | K5 §2 Godot 행 |
| 11 | Godot 공식 MCP 유무 | 검색 안 함 |
| 12 | Unity WebGL 3회차(RM1_Slice + `--remodel3d`) 결과 | PC/CTO 기록(이 세션 미확인) |
| 13 | Unity Windows Player 빌드 소요 분, 빈 프로젝트 빌드 분(세 엔진) | K5 §2 소요 기록 |
| 14 | Mac에서 Unity 무창 캡처 셸 절차(공용 실행기는 PC만) | Mac 세션 |
| 15 | `docs.unity.cn` 미러 접근 가능 여부 | 1회 시도 |
| 16 | UE Python `unreal.AssetImportTask`·카메라 스폰 API 절 | `dev.epicgames.com` Python API |

---

## 5. 결론 3줄

1. **K5(무창·텍스트·자동)는 지금 Unity만 실측이 있다**: 공용 실행기 무창·무음 빌드/캡처, batchmode 61회 멈춤 0, WebGL 자동 빌드 2회차 완주, unity-mcp 연결. UE는 CLI 경로(커맨드렛·Python·MRQ CLI)가 공식 페이지로 [발췌] 확인되지만 무창 캡처(`-RenderOffScreen`)는 공식 절 [미검증]·우리 실측 0. Godot은 CLI·텍스트 자산·문서 접근(GitHub 원문)이 셋 중 가장 에이전트 친화적이나 `--headless`는 dummy 렌더라 캡처에 창이 필요하고, C#은 웹 내보내기 불가다.
2. **시간 대비 가성비(이식 비용 축)**: Unity 0 / UE Core 3주(UnrealSharp)~10주(C++) [추정, EP] + 표현층 34,145줄 / Godot은 툰+웹이면 C# 금지라 Core 18,353줄 GDScript 재작성 [추정, UE (a)급] + 표현층. 과거 godot/main 시도(10-13~10-21, 280커밋, GDScript 451파일)는 "native 지원 5/미이식 11"에서 멈췄고 10-24 비교 시험은 "결론 보류"였다.
3. **K5는 측정 전이라 "AI 호환성" 우열을 결정 근거로 쓰지 않는다.** §2의 같은 과업을 세 엔진에서 에이전트가 창 없이 끝내는 분·개입·막힘·실패를 재고, 툰이면 Godot을 후보에 넣되 Godot 신규 최소 프로젝트에서 무창 캡처 1장이 되는지가 선행 조건이다.

---

## 부록 A. 출처표

### A.1 저장소 문서 (경로·브랜치·SHA)

| 키 | 경로 | 브랜치 @ SHA |
|---|---|---|
| R2 | `docs/0마스터플랜/ENGINE_DECISION_20261105.md` | origin/claude/unity-cloud-engine-decision-20261105 @ `b867bd9a` |
| R3 | `docs/0마스터플랜/ENGINE_TRIAL/CORE_PORT_PLAN_20261106.md` | origin/claude/unity-cloud-core-port-study-20261105 @ `accbd279` |
| R4 | `docs/0마스터플랜/DIRECTION_RESET_20261105.md` | origin/unity/main @ `ee2af51`(파일 마지막 커밋 `ebc92f2b` 11-06 13:08 KST) |
| R5 | `docs/0마스터플랜/worklog/CTO_WORKLOG_20261104.md` | origin/unity/main @ `ee2af51` |
| R6 | `docs/engine/UNITY_DESKTOP_CTO_SWAP_20261104.md` | origin/unity/main @ `ee2af51` |
| R7 | `docs/0마스터플랜/WEB_BUILD/WEBGL_FEASIBILITY_20261105.md` | origin/claude/unity-cloud-webgl-feasibility-20261105 @ `b981a49c` |
| R8 | `docs/engine/FDG_GODOT_NATIVE_FIRST_20261013.md` | origin/unity/main @ `ee2af51` |
| R9 | `docs/engine/FDG_GODOT_WINDOWS_NATIVE_PREVIEW_20261013.md` | 같음 |
| R10 | `docs/engine/FDG_GODOT_WEB_PLAYABLE_FIRST_20261013.md` | 같음 |
| R11 | `docs/engine/FDG_GODOT_CUSTOM_STRATEGY_20261020.md` | 같음 |
| R12 | `docs/engine/UNITY_PORT_20261024.md` | 같음 |
| R13 | `docs/0마스터플랜/REPO_SYNC_ENGINE_SPLIT_20261027.md` | 같음 |
| R14 | `docs/engine/UNITY_HERO_MODULAR_G0_20261104.md` | 같음 |
| CHANGELOG | `docs/CHANGELOG_SYNC.md`(줄 번호는 `ee2af51` 기준) | origin/unity/main @ `ee2af51` |
| godot/main | `godot/project.godot`·`godot/export_presets.cfg`·`godot/README.md`·`git ls-tree`·`git log -- godot` | origin/godot/main @ `607110d52`(`--deepen=400`으로 280커밋 범위) |
| 코드 | `unity/Packages/manifest.json`:30, `unity/ProjectSettings/ProjectVersion.txt`, `unity/Assets/Exoduser/Editor/DevTools/JobServer/` | origin/unity/main @ `ee2af51` |

### A.2 공식 문서·소스 원문 (이 세션이 직접 열어 인용, Godot만)

| 키 | URL |
|---|---|
| G1 | `raw.githubusercontent.com/godotengine/godot-docs/master/tutorials/editor/command_line_tutorial.rst` |
| G2 | `.../godot-docs/master/tutorials/scripting/c_sharp/c_sharp_basics.rst` |
| G3 | `.../godot-docs/master/engine_details/file_formats/tscn.rst` |
| G4 | `.../godot-docs/master/tutorials/animation/creating_movies.rst` |
| G5 | `.../godot-docs/master/tutorials/export/exporting_projects.rst` |
| G6 | `raw.githubusercontent.com/godotengine/godot/master/servers/display/display_server_headless.h` |
| G7 | `.../godot-docs/master/tutorials/export/exporting_for_web.rst` |
| G8 | `.../godot-docs/master/about/complying_with_licenses.rst` |
| (참고) | `.../godot-docs/master/tutorials/export/exporting_for_dedicated_servers.rst`("the user will have to specify `--headless` to make sure no window spawns") |

### A.3 검색 발췌 (공식 페이지를 못 열어 검색 결과로 확인)

| 키 | 대상 | URL(검색 결과 기준) |
|---|---|---|
| S-U1 | Unity Editor command line arguments | `docs.unity3d.com/Manual/EditorCommandLineArguments.html`(현행), 발췌 본문은 4.3·5.x 시대 페이지 |
| S-U2 | Unity Runtime Fee 폐지·가격 | `unity.com/blog/news/open-letter-on-runtime-fee`, 보도(theregister·engadget 등 2024-09) |
| S-U3 | Unity MCP(AI Assistant) | `docs.unity3d.com/Packages/com.unity.ai.assistant@2.6/manual/integration/unity-mcp-get-started.html`, `unity.com/blog/unity-ai-mcp-how-to-get-started` |
| S-U4 | Unity Web/WebGPU 제약 | `docs.unity3d.com/6000.3/Documentation/Manual/WebGPU-limitations.html` 외 6.2~6.7 |
| S-E1 | UE `-RenderOffScreen`·`-nullrhi` | `forums.unrealengine.com/t/rendering-in-headless-mode-possible/475619`(Epic 직원 답변), `/t/ue4-on-linux-from-ssh-with-no-display-but-with-gpu-and-rendering/156716` |
| S-E2 | UE Python 에디터 스크립팅 | `dev.epicgames.com/documentation/en-us/unreal-engine/scripting-the-unreal-editor-using-python` |
| S-E3 | UE 커맨드렛·RunUAT BuildCookRun | `dev.epicgames.com/documentation/unreal-engine/build-operations-cooking-packaging-deploying-and-running-projects-in-unreal-engine`(ko/de 발췌), `forums.unrealengine.com/t/what-is-the-proper-way-to-run-runuat-bat-buildcookrun-runautomationtest/1275152` |
| S-E4 | UE MRQ 커맨드라인 렌더 | `dev.epicgames.com/documentation/en-us/unreal-engine/using-command-line-rendering-with-move-render-queue-in-unreal-engine`, 포럼 681764·538400 |
| S-E5 | UE 5.8 공식 MCP | `forums.unrealengine.com/t/unreal-engine-5-8-released/2729274`(Epic 공지), Fab 서드파티 목록 `fab.com/listings/651ed47d-...` |
| S-E6 | UE 자산 diff | `unrealengine.com/en-US/blog/diffing-unreal-assets`(2014) |
| S-E7 | UE 로열티 | `unrealengine.com/en-US/faq`, `/license`(gateway 미러 포함) |
