# 엔진 결정 자료 — Unity 유지 vs Unreal Engine 5 전환 (2026-11-05)

> 레인 ENG(조사·판단 자료). **결정은 사용자가 한다.** 이 문서는 사실·비교·권고·확인 실험 설계만 담는다.
> 표기: **[확인]** 공개 자료 2건 이상 또는 공식 문서 / **[1건]** 출처 1건 / **[코드]** 우리 저장소에서 직접 센 값 / **[추정]** 근거를 둔 추정 / **[미확인]** 못 찾음.
> 이 세션은 웹 검색만 됐고 페이지 열람(WebFetch)은 네트워크 정책으로 막혔다(store.steampowered.com·dev.epicgames.com·resetera 등). 그래서 URL은 검색 결과 기준이며, Mac 실험 첫날 사람이 직접 열어 재확인한다(§7 사용자 할 일 U8).

---

## 0. 한 쪽 요약 (아침 보고용)

**권고: "2주 비교 실험 후 결정". 실험 동안 기본값은 Unity 유지.** 단, 아래 결정 기준표를 미리 고정해 두고, 결과가 기준을 넘으면 망설이지 않고 UE5로 넘어간다.

| 선택 | 장점 | 단점 | 판단 |
|---|---|---|---|
| **A. Unity 유지** | Core 규칙 C# 18,320줄·oracle 도구 122개가 그대로 산다 [코드]. 씬·프리팹이 텍스트(YAML)라 AI가 읽고 diff·병합 가능. unity-mcp 이미 연결 [코드]. Mac에서 Windows 빌드 가능(Mono) [추정]. 전환 비용 0 | URP에 볼류메트릭 안개·실시간 GI가 내장돼 있지 않다 → 지금처럼 커스텀(HellFogFeature 등)을 계속 짜야 한다 [코드]. 사용자가 본 "쓰레기 광원·안개"가 이 커스텀 경로에서 나왔다 | 화면 문제의 원인이 엔진이 아니라 제작법이면 이게 맞다 |
| **B. 즉시 UE5 전환** | Lumen(실시간 GI)·Exponential Height Fog+Volumetric Fog·Niagara가 기본 탑재 → "광원·안개·대기"의 바닥 품질이 높다 [확인]. 황천(Yellowsky)·팬텀블레이드 제로·Titan Quest II가 UE5 [1건/확인/확인]. 화면 작업이 동결된 지금이 전환 비용 최저 시점 | Core 이식(C#→C++) + oracle 재검증, UI·세이브·번역 재작성: **6~12주** [추정]. 에셋이 바이너리(.uasset)라 AI가 diff·리뷰 못 함. C++ 빌드가 느리고 Mac→Windows 패키징 불가로 판정 루프가 길어진다 [추정]. **4주 안에 엔진 3번째 교체**(H5→FDG/Godot→Unity→UE) | 근거 없이 바꾸면 "엔진 바꾸면 나아진다"를 또 한 번 시험하는 셈 |
| **C. 실험 후 결정 (권고)** | 같은 1-1 키샷을 같은 시간·같은 에셋으로 두 엔진에서 만들어 **눈으로 비교**한 뒤 정한다. 지금은 어차피 연구 기간(DIRECTION_RESET)이라 개발 손실이 적다 | 2주(작업 10일)와 Mac·사용자 시간 소모. UE 설치·Epic 로그인 등 사용자 손이 필요 | 되돌리기 어려운 결정을 증거로 내린다 |

**왜 C인가.** ① 사용자가 지적한 결함(광원·안개·동작·HUD)은 대부분 *제작법·아트 판단* 문제이고 엔진 한계가 아니다 — Moon Studios는 No Rest for the Wicked(우리 보스 동작 기준작)를 Unity 개조판으로 만들었다 [확인]. ② 반대로 "안개·대기·간접광"의 *기본값* 품질은 UE5가 확실히 높고, 우리가 이 분야에서 커스텀 코드로 계속 지고 있다는 것도 사실이다 [코드: HellFogFeature.cs·HellSsaoFeature.cs]. ③ 둘 다 맞는 말이라 글로는 못 정한다 → 같은 장면 비교판으로 정한다.

### 결정 기준표 (실험 10일차에 이 표로 판정)

| # | 측정 | UE5로 **전환**하는 조건 | Unity **유지** 조건 |
|---|---|---|---|
| K1 | 키샷 비교판(같은 구도·1920×1080·3840×1080·1x/3x 크롭) 블라인드 판정 — 사용자 + CTO | UE 쪽이 **분명히** 낫다(사용자 판정, 둘 중 하나 고르라 했을 때 UE 선택) | 같거나 Unity가 낫다 |
| K2 | 먼 적 가시성(카메라 LOCK 피치 34°, 안개 속 원경 적 3마리) | UE가 안개 품질을 올리면서 먼 적을 지우지 않는다 | UE도 먼 적을 지워야만 분위기가 난다(=이점 없음) |
| K3 | 같은 시간 예산(엔진당 작업 4일) 안에 도달한 품질 | UE가 **같은 시간에** 더 높다 | UE가 시간 더 들여야 동급 |
| K4 | AI 에이전트 작업성: 무창·무음 빌드+캡처 자동화가 Mac/PC에서 돌아가는가 | UE에서 Day 5까지 스크립트 1개로 "빌드→캡처 PNG" 성공 | UE 자동 캡처가 안 되거나 사람 손 필요 |
| K5 | 반복 속도: 코드 1줄 수정→화면 확인까지 시간 | UE ≤ Unity의 3배 | UE > Unity의 3배 (판정 루프 붕괴) |
| K6 | 성능: Mac M5 Pro 1080p, PC 최소사양 후보(GTX 1060급) | 두 기기 모두 60fps(Mac)·30fps 이상(최소사양) | UE가 최소사양 30fps 미달 → 데모 시장 축소 |
| K7 | 픽셀 렌더 캐릭터(리깅 3D→저해상도) 합성 | UE에서 월드 고해상도+캐릭터 저해상도 합성이 Day 8까지 동작 | 합성이 안 돼 화면 전체를 저해상도로 써야 함 |

**규칙:** K1·K2·K3가 모두 "전환"이고 K4~K7 중 "유지"가 1개 이하면 **전환 권고**. K1이 "유지"면 다른 항목과 무관하게 **유지**. 나머지 경우는 유지하고 실험에서 배운 UE 쪽 기법(안개 층·조명 구성)을 Unity 매뉴얼에 옮긴다.

---

## 1. 황천(Downfall of Yellowsky)과 비슷한 분위기 게임들의 엔진

| 게임 | 엔진 | 근거 | 등급 |
|---|---|---|---|
| **Downfall of Yellowsky / 黄天逆途** (望虚社 Wangxu Studio, 11인, 미출시·Steam 2026-08 페이지 공개) | **Unreal Engine 5로 보임** | 트레일러 모음 기사 "Downfall Of Yellowsky (Unreal Engine 5) – TBA – PC": https://mastersingaming.com/2026/08/16/all-new-biggest-game-trailer-reveals-and-exclusive-previews-from-august-2026/ · 팀 11인·무투자: https://www.3dmgame.com/news/202607/3949217.html , https://www.gamersky.com/news/202607/2177567.shtml · Steam: https://store.steampowered.com/app/5024530/_/ | **[1건]** — 개발사 공식 발언·크레딧 미확인. Steam 시스템 요구사항·B站 개발 영상 확인 필요 |
| Phantom Blade Zero (S-GAME) — 임팩트 기준작 | Unreal Engine 5 | Steam 페이지 "Built in Unreal Engine 5": https://store.steampowered.com/app/4115450 · PCGH 벤치: https://www.pcgameshardware.de/Phantom-Blade-Zero-Spiel-74287/Specials/CPU-GPU-Benchmark-Performance-Fps-1557577/ · https://en.wikipedia.org/wiki/Phantom_Blade_Zero | [확인] |
| Titan Quest II (Grimlore) — 탑다운 ARPG | Unreal Engine 5 | https://en.wikipedia.org/wiki/Titan_Quest_II · https://www.neowin.net/amp/thq-nordic-unveils-titan-quest-ii-a-sequel-being-built-on-unreal-engine-5/ | [확인] |
| **No Rest for the Wicked** (Moon Studios) — 보스 동작 기준작 | **Unity 개조판**("Moonity") + 자체 렌더·조명 | 80.lv 인터뷰: https://80.lv/articles/interview-inside-the-tech-and-artistic-inspirations-of-no-rest-for-the-wicked-from-moon-studios · ResetEra 요약 | [확인] |
| Octopath Traveler 1·2 (HD-2D 원조) | Unreal Engine 4 | https://en.wikipedia.org/wiki/Octopath_Traveler | [확인] |
| Last Epoch — 탑다운 ARPG | Unity | https://www.dragonflydb.io/faq/last-epoch-game-engine | [1건] |
| V Rising (Stunlock) — 탑다운 액션 | Unity (HDRP로 알려짐) | 검색 결과 없음 | [미확인] |
| Diablo IV | Blizzard 자체 엔진(공식 명칭 미공개) | https://primagames.com/?p=137593 | [1건] |
| Path of Exile 2 | GGG 자체 엔진 | Steam 토론 1건뿐 | [미확인] |

**읽는 법:** 우리가 닮고 싶은 분위기(동양 수묵·안개·대기광)의 중국 인디 2편이 모두 UE5다 — 이건 사실이다. 하지만 같은 탑다운 ARPG의 품질 상위작은 자체 엔진(D4·PoE2)과 Unity 개조(NRftW)도 있다. **엔진이 분위기를 정하지 않는다. 엔진은 "기본으로 주는 것"과 "직접 만들어야 하는 것"의 경계를 정한다.**

---

## 2. 목표 분위기(광원·안개·대기) 기준 비교

| 기능 | UE5 | Unity 6 URP (우리 현재) | Unity 6 HDRP | 탑다운 고정 카메라에서 실제 차이 |
|---|---|---|---|---|
| 실시간 GI | **Lumen** 기본(소프트웨어 RT는 Mac Apple Silicon에서 동작) [확인: Epic 기술 블로그 https://www.unrealengine.com/en-US/tech-blog/bringing-unreal-engine-on-macos-up-to-feature-parity-with-windowsprogress-report] | 없음. 라이트맵 굽기 + APV(Adaptive Probe Volumes) [추정: Unity 6 문서 미열람] | APV + SSGI, 레이트레이싱(Windows DXR) | **크다.** 횃불·마법·용암 같은 *움직이는 광원*이 바닥·벽을 물들이는 것은 Lumen이 거의 공짜. Unity URP는 가짜(라이트 쿠키·데칼·발광 카드)로 만들어야 한다 |
| 볼류메트릭 안개 | **Exponential Height Fog + Volumetric Fog** 기본, 라이트별 산란 | **내장 없음** → 서드파티(Buto·CristianQiu URP Volumetric Light 등)나 커스텀 [확인: https://github.com/CristianQiu/Unity-URP-Volumetric-Light] — 우리는 `HellFogFeature.cs` 커스텀 [코드] | 내장 Volumetric Fog | **크다.** 사용자 지적 "안개가 쓰레기"의 직접 영역. UE는 높이 안개+광선 산란이 설정값만으로 나온다. 단, **먼 적을 지우지 않는** 조정은 어느 엔진이든 직접 해야 한다(카메라 LOCK) |
| 그림자 | Virtual Shadow Maps | 캐스케이드 섀도맵 | 캐스케이드 + 접촉 그림자 | 중간. 탑다운 34°·좁은 깊이에서는 Unity 캐스케이드도 충분 [추정] |
| 고밀도 지오메트리 | **Nanite** (Mac은 M2 이상 beta) [확인: 같은 Epic 블로그] | LOD 수동 | LOD 수동 | **작다.** 탑다운은 화면 안 폴리곤 수가 적다. 늪·고목 수준이면 LOD로 충분 [추정] |
| VFX | **Niagara** (GPU 파티클·이벤트·라이트 렌더러) | VFX Graph (설치됨 [코드: manifest visualeffectgraph 17.6.0]) | VFX Graph | 작다~중간. 둘 다 AAA급. Niagara는 파티클이 Lumen 광원이 되는 점이 편하다 |
| 후처리 | 기본 고품질(톤맵·블룸·렌즈) | URP 볼륨 | HDRP 볼륨(물리 카메라) | 중간. 색 품질은 엔진보다 LUT·색 판단 문제 |
| Mac 개발 | 에디터 Apple Silicon 네이티브. UE 5.6~5.7은 macOS 14+·Xcode 15.4+ [1건: 검색 결과의 Epic 요구사항 표]. Lumen HW RT는 Mac에서 실험적 [확인]. M4에서 Lumen 성능 불만 사례 [1건: Epic 포럼] | Apple Silicon 네이티브, Metal | Metal 지원 [추정] | **M5 Pro에서 UE 에디터는 돌지만 Lumen 실측은 실험에서 재야 한다(K6).** |
| 최소 사양(출시 PC) | Lumen·VSM은 대략 DX12·GTX 1070~ 이상이 현실선, 끄면 GTX 1060급 가능 [추정] | 낮음(URP) | 중상 | 데모의 최소사양 시장 폭에 영향 |

**결론(분위기 기준):** "움직이는 광원이 주변을 물들이고, 안개가 빛을 산란하는" 장면은 **UE5가 기본값만으로 Unity URP 커스텀보다 앞설 가능성이 높다** [추정]. 반면 탑다운 고정 카메라에서 Nanite·VSM 같은 UE5 대표 기능은 이점이 작다. 즉 이득은 **Lumen + Volumetric Fog 두 가지**에 몰려 있다 → 실험은 이 두 가지를 정확히 겨냥한다. Unity 쪽 대조군은 **HDRP가 아니라 URP+최선의 안개 해법**(현 프로젝트)과, 가능하면 HDRP 1장면을 덤으로 둔다(HDRP 전환은 Unity 안에서의 중간 선택지).

---

## 3. 우리 특수 요구

| 요구 | UE5 구현법 | Unity 구현법 | 차이 |
|---|---|---|---|
| 리깅 3D → 실시간 저해상도 픽셀 렌더 (캐릭터·적·보스만) | ① 캐릭터 전용 **SceneCapture2D**를 저해상도 Render Target에 찍고 월드 위에 합성, 또는 ② C++ **SceneViewExtension**으로 커스텀 패스, ③ 머티리얼 단위 픽셀화(포스트 없이) [확인: Epic 포럼 튜토리얼 https://forums.unrealengine.com/t/community-tutorial-pixelate-any-material-in-unreal-engine-5-no-post-process/2702520 · 상용 https://forums.unrealengine.com/t/silverset-studios-3d-to-pixel-environment/2675584]. t3ssel8r 수준의 UE 사례는 찾기 어렵다는 포럼 증언 있음 | 캐릭터 레이어 전용 카메라 → 저해상도 RenderTexture(Point 필터) → 월드 위 합성. URP Renderer Feature로 깔끔히 됨. t3ssel8r 등 Unity 사례가 많다 [추정: 공개 영상 다수, 이번 세션 미열람] | **Unity가 쉽다.** UE는 SceneCapture 비용·깊이 합성(캐릭터가 고목 뒤로 가려지는 것) 처리가 까다롭다 → 실험 K7로 확인 |
| 2.5D 혼합 (3D 월드 + 픽셀 캐릭터) | 위와 같음. 깊이 합성은 커스텀 깊이/스텐실 사용 | 카메라 스택 또는 깊이 공유 RT | Unity 쉬움 [추정] |
| 탑다운 원근 피치 34° (카메라 LOCK) | CameraActor/SpringArm, FOV·거리 동일 재현 가능 | Cinemachine 6.6 [코드] | 차이 없음 |
| Core 판정과 화면 발밑 일치 | Core를 C++로 이식하면 같은 좌표계로 맞춤 | Core가 이미 C# 안에 있음 [코드] | Unity가 유리(이식 없음) |

---

## 4. 개발 방식 적합성 — AI 에이전트가 코드를 쓰고 Mac에서 판정

| 항목 | Unity | UE5 | 우리에게 의미 |
|---|---|---|---|
| 언어 | C#. 우리 Runtime 424파일·52,237줄, Core 133파일·18,320줄 [코드] | C++ (+ Blueprint). C# 공식 지원 없음(서드파티 UnrealSharp 등 존재 [미확인]) | AI는 C#·C++ 둘 다 잘 쓴다. 차이는 **빌드 시간과 오류 비용**: C++는 링크·헤더·UHT 매크로 오류가 잦고 한 번 빌드가 길다 [추정] |
| 씬·프리팹·에셋 | **텍스트 YAML**(.unity·.prefab·.mat·.asset) → AI가 읽고 diff·리뷰·병합 가능 | **바이너리 .uasset/.umap** → diff·리뷰 불가. Blueprint는 AI가 못 읽음 [1건: https://dev.to/colton_willey_ef3d8727ae9/how-i-taught-claude-to-see-inside-unreal-engine-23a9] | **가장 큰 차이.** 우리 규칙(커밋 단위 검수, 자기 경로만 커밋, 병합)이 바이너리에서는 "덮어쓰기"가 된다. 동시 작업 3레인이 같은 맵을 만지면 충돌을 사람이 풀어야 한다 |
| 완화책 | — | ① **Blueprint 금지, C++ + 데이터(DataTable을 CSV/JSON에서 임포트)** ② 레벨은 One File Per Actor(액터당 파일 분리, 여전히 바이너리) ③ 에디터 Python 스크립트로 배치를 "코드로" 생성 ④ AI용 MCP: 서드파티 mcp-unreal(UE 5.7, 49개 도구) [1건: https://mcpservers.org/servers/remiphilippe/mcp-unreal]. Epic 공식 MCP 플러그인(5.8) 주장은 [미확인] | 완화하면 쓸 만하다. 하지만 "레벨 배치 diff 리뷰"는 끝까지 안 된다 |
| AI 연결 현황 | **unity-mcp 이미 연결** (`com.coplaydev.unity-mcp`) [코드] | 새로 구축 | Unity 우위 |
| 무창·무음 자동 빌드 | `-batchmode` 빌드, 캡처는 그래픽 장치 필요(`-nographics` 금지). 공용 실행기 `exo-unity.ps1` 이미 있음 [CLAUDE.md] | `UnrealEditor-Cmd` + `-RenderOffscreen`(창 없이 렌더) + `-nosound`, 커맨드렛·Python 스크립트, 패키징은 `RunUAT BuildCookRun` [추정: 공식 문서 미열람] | 둘 다 가능. UE는 쿡(cook)이 길고 셰이더 컴파일 캐시(DDC) 관리가 필요. **새로 만들어야 할 파이프라인 1주** [추정] |
| 빌드·반복 시간 | 스크립트 수정 → 도메인 리로드 수 초~수십 초 | C++ 수정 → 증분 빌드 수십 초~수 분, Live Coding. 첫 셰이더 컴파일 수십 분~1시간+ [추정] | K5에서 실측 |
| Mac ↔ PC 역할 | Mac에서 Windows 빌드 가능(Mono, Windows Build Support 모듈) [추정] | **Windows 패키징은 Windows 호스트 필요** [추정: 공식 문서 확인 필요] → Mac에서 판정한 것과 Steam 올리는 Windows 빌드가 다른 기계에서 나온다 | CLAUDE.md 3.4(PC 컴파일·Mac 판정)와 맞물림. UE면 PC가 패키징까지 맡아야 한다 |
| 저장소 | 지금 구조(텍스트 위주, Git) | .uasset 대용량 → Git LFS 또는 Perforce 필요. 저장소 용량·클론 시간 증가 [추정] | 클라우드 세션 sparse checkout과 LFS 조합 검증 필요 |

---

## 5. 전환 비용 (주 단위, 낙관/비관) — 전부 [추정]

기준: Sonnet 서브에이전트 동시 3레인, Mac 판정 1인. 화면(맵·HUD·보스·VFX)은 **어느 엔진이든 새로 만든다**(DIRECTION_RESET: 현재판 폐기 방향) → 전환 비용에 넣지 않는다.

| 항목 | 규모 근거 | 낙관 | 비관 | 메모 |
|---|---|---|---|---|
| 학습·프로젝트 골격(설치, 모듈 구조, 입력, 카메라 LOCK 재현) | — | 1주 | 2주 | 다른 일과 병행 불가 |
| Core 규칙 이식 C#→C++ | 133파일·18,320줄 [코드] | 2주 | 4주 | AI 이식 자체는 빠르나 부동소수·난수·순서 차이로 oracle 불일치 수정이 길다 |
| oracle 재검증 | 도구 122폴더, Program/Tests 167개 [코드] (`unity/Tools/*-oracle`) | 1주 | 3주 | **현재 C# Core로 골든 트레이스(JSON)를 뽑아 두고 C++가 같은 값을 내는지 비교**하는 방식이면 낙관 쪽. 웹 oracle은 그 뒤 |
| 데이터·번역 | `Resources/Data` JSON 51개, 29개 언어 [코드] | 0.5주 | 1주 | JSON 재사용, UE String Table/DataTable로 임포트 |
| 세이브·설정 | — | 0.5주 | 1.5주 | 세이브 포맷을 그대로 유지하면 짧다 |
| UI(UMG/CommonUI) 기본 화면(타이틀·로비·HUD·설정) | 현 Unity UI는 어차피 재설계 대상 | 2주 | 4주 | UMG 위젯도 바이너리 → AI 작업성 낮음. Slate C++로 쓰면 텍스트지만 느림 |
| 자동 빌드·캡처 파이프라인, Steam(OnlineSubsystemSteam) | `exo-unity.ps1`·BuildLoop 대체 | 1주 | 2주 | |
| **합계(병행 고려)** | | **약 6주** | **약 12주** | 데모 v0 일정은 이만큼 뒤로 간다. 다만 데모 일정은 이미 매뉴얼 확정 뒤로 재조정 중(DIRECTION_RESET) |

**엔진 이력 경고 [코드: docs/engine/FDG_GODOT_*, REPO_SYNC_ENGINE_SPLIT_20261027.md]:** 웹(H5) → FDG/Godot(10-13~10-26, godot/main 동결) → Unity(10-26~) → 지금 UE 검토. 전환할 때마다 "규칙 이식 + 하니스 + 파이프라인"을 처음부터 다시 했다. 이번에 바꾸면 **UE가 마지막 엔진**이라는 사용자 확약이 필요하다.

---

## 6. 라이선스·비용

| 항목 | 내용 | 근거 |
|---|---|---|
| UE 로열티 | 제품별 **평생 총매출 100만 달러 초과분에 5%**. 매출 발생 시 Epic에 신고(Release Form). Epic Games Store 매출은 로열티 제외, EGS 동시/선출시 시 3.5% 프로그램(2025-01-01~) | https://www.unrealengine.com/en-US/faq · https://www.unrealengine.com/en-US/license · https://www.pcgamer.com/unreal-engine-games-no-longer-owe-royalties-on-their-first-dollar1m-in-revenue [확인] — 현재 EULA 원문은 계약 전 재확인 |
| UE 사용료 | 게임 개발은 좌석 요금 없음(위 로열티만) | 같은 FAQ [확인] |
| Unity | Personal 무료(매출+투자 연 20만 달러 이하). 초과 시 Pro **좌석당 연 2,310달러**(2026-01-12 인상). 런타임 요금 폐지 | https://unity.com/products/pricing-updates [확인] |
| 우리 계산 | 예: 매출 200만 달러 → UE 5만 달러. Unity Pro 3좌석 → 연 약 7천 달러. 100만 달러 미만이면 UE 0원 | [추정] |
| Fab/Megascans | **Fab Standard License는 모든 엔진 사용 가능**(Unity 포함). 옛 Quixel "UE 전용" 라이선스분은 UE에서만 | https://forums.unrealengine.com/t/megascans-update-march-2025/2419561 [확인] → 실험 에셋은 Fab Standard License만 쓰면 양쪽 공정 비교 가능 |

---

## 7. 확인 실험 설계 (결정 전 2주 = 작업 10일)

### 7.1 목표
같은 1-1 키샷 한 장면을 UE5와 Unity URP로 **같은 구도·같은 에셋·같은 시간 예산**으로 만들어 §0 결정 기준표(K1~K7)로 판정한다.

### 7.2 장면 사양 (양쪽 동일)
- 구도: 남→북 다리, 양쪽 늪, 앞 고목 전경, **카메라 피치 34° 원근(ForestA2 LOCK)**, 같은 FOV·거리. 북쪽 원경에 적 3마리(먼 적 가시성 K2).
- 조명: 밤/황혼 1종, 주광 1 + 움직이는 국소광 2(횃불·마법탄) — Lumen 차이가 드러나는 조건.
- 안개: 높이 안개 + 늪 위 저층 안개 + 광선 산란.
- 캐릭터: 우리 드루이드/전사 리깅 FBX 1개를 픽셀 렌더로 합성(K7). 저장소 FBX 88개 중 선택 [코드].
- 해상도: 1920×1080, 3840×1080. 산출: 정지 캡처 + 10초 무음 영상.

### 7.3 에셋 (라이선스)
| 에셋 | 출처 | 라이선스 | 양쪽 사용 |
|---|---|---|---|
| 늪 지면·물·이끼·나무껍질 | Fab 무료 Megascans | Fab Standard License(모든 엔진) | ○ |
| 고목·다리 | 우리 기존 FBX(Blender 다리 등) 우선, 부족분 Fab Standard 무료 | 자체 / Fab Standard | ○ |
| 캐릭터 | 우리 리깅 FBX | 자체 | ○ |
| UE 전용 샘플(Lumen 데모 등) | 쓰지 않는다 | UE 전용 | ✕ (공정성) |
| Unity 안개 | 현 HellFogFeature + 무료 URP Volumetric Light(GitHub, 라이선스 확인) | 오픈소스 | Unity만 |

### 7.4 일정·담당 (Mac M5 Pro 판정, 구현은 Sonnet 서브에이전트, 판정 CTO+사용자)

| 일차 | UE5 레인 | Unity 레인 | 공통 |
|---|---|---|---|
| D1 | 사용자: Epic 로그인·UE 설치(§7.6) / 프로젝트 골격 | 기준 장면 복제(같은 구도) | 장면 사양서·카메라 수치 고정, 에셋 다운로드 |
| D2 | 지형·다리·고목 배치(에디터 Python) | 같은 배치 | 화이트박스 비교 1장 |
| D3~D6 | **작업 4일**: 조명·안개·재질·물 | **작업 4일**: 동일 | D4 중간 비교판 |
| D5 | 자동 캡처(`-RenderOffscreen`) 스크립트 성공 여부 = K4 | (기존 실행기) | |
| D7~D8 | 픽셀 렌더 캐릭터 합성 = K7 | 동일 | |
| D9 | 성능 측정 Mac/PC = K6, 반복 속도 실측 = K5 | 동일 | |
| D10 | — | — | 블라인드 비교판(좌우 무작위, 엔진 이름 가림) → 사용자 판정 K1·K2·K3 → 결정 |

### 7.5 판정 방법
- 비교판: 같은 크기 좌우 배치, 엔진 이름 가림(A/B 무작위), 1x·3x 크롭, 10초 영상 2개 연속 재생. 실버 헬 톤·점 금지(4.2) 기준 함께.
- 사용자에게 "어느 쪽이 우리 게임인가?" 한 문장만 묻는다. 이유는 그다음에 듣는다.
- 측정값(K4~K6)은 숫자로 표에 적는다. 측정 못 한 항목은 "미확인"이며 전환 근거로 쓰지 않는다.
- 비용: 유료 에셋·유료 생성 0원. 사용자 시간 약 3~4시간(설치·로그인·D4/D10 판정).

### 7.6 사용자가 직접 해야 할 일 (Mac)
| # | 할 일 | 이유 | 예상 시간 |
|---|---|---|---|
| U1 | Epic Games 계정 로그인(없으면 생성) | 대리 로그인 금지(CLAUDE.md 11) | 5분 |
| U2 | Mac에 **Epic Games Launcher** 설치 → **Unreal Engine 5 최신 안정판(5.7 이상)** 설치. 디스크 여유 **100GB 이상** 확보(엔진 약 60GB + 셰이더 캐시) | 엔진 설치는 계정 필요 | 다운로드 1~2시간(방치 가능) |
| U3 | **Xcode** 최신판 설치(App Store) + 첫 실행해 라이선스 동의 | UE Mac C++ 빌드 필수(5.6~5.7은 Xcode 15.4+) [1건] | 30분~1시간 |
| U4 | Fab(fab.com)에 같은 Epic 계정으로 로그인 → CTO가 준 무료 Megascans 목록을 "내 라이브러리에 추가"(Standard License 선택) | 무료 에셋 청구는 계정 행위 | 15분 |
| U5 | UE 첫 실행 시 EULA 동의 | 법적 동의는 사용자 | 2분 |
| U6 | Mac 원격 작업 허용 유지(Remote Control/Claude 앱) — 에이전트가 Mac에서 UE를 무창으로 실행 | 판정 기계가 Mac | — |
| U7 | (선택) Windows PC에도 UE 설치 | 성능 K6 최소사양 측정, Windows 패키징 | 1~2시간 |
| U8 | (선택) 클라우드 세션 네트워크 허용 목록에 `dev.epicgames.com`, `store.steampowered.com`, `fab.com` 추가 | 이번 조사에서 공식 문서 원문을 못 열었다 | 5분 |
| U9 | D4·D10 비교판 판정 | 결정권자 | 각 30분 |

---

## 8. 전환으로 결정될 경우 첫 2주 실행 계획

**원칙:** Blueprint 0, 게임 로직은 C++, 수치는 데이터(CSV/JSON → DataTable), 배치는 에디터 Python 스크립트로 재현 가능하게. AI가 읽을 수 있는 것만 정본으로 둔다.

| 주 | 할 일 | 산출 | 담당 |
|---|---|---|---|
| 1주 D1 | 브랜치 `unreal/main` 신설(unity/main은 동결 아닌 **보존**, 사용자가 버리기 결정 전까지 삭제 없음). Git LFS 규칙(`*.uasset *.umap`) 결정, 저장소 용량 상한 | `.gitattributes`, 저장소 정책 docs | CTO |
| 1주 D1~2 | 프로젝트 구조: `Source/ExoCore`(규칙, 엔진 의존 0, 순수 C++ 모듈) · `Source/ExoGame`(표현) · `Content/Data`(CSV/JSON) · `Tools/`(골든 트레이스 비교기) | 빌드되는 빈 프로젝트 | 서브에이전트 1 |
| 1주 D1~3 | **골든 트레이스 추출**: 현재 Unity C# Core에서 oracle 시나리오별 입력→출력 JSON 대량 생성(무수정, 읽기 전용 도구 추가) | `golden/*.json` | 서브에이전트 2 (Unity 쪽) |
| 1주 D2~5 | Core 이식 1차: 데미지·스킬·에너지쉴드·기검참·패링(무지개탄 Q 전용 규칙 포함, 설계 금지 §7 유지) | `ExoCore` + 골든 비교 PASS율 표 | 서브에이전트 1·3 |
| 1주 D3~5 | 자동화: `UnrealEditor-Cmd -RenderOffscreen -nosound` 캡처 스크립트, `RunUAT BuildCookRun` Windows 패키징(PC), 공용 실행기 `exo-unreal.ps1`/Mac 셸 | 무창·무음 캡처 PNG 1장 | 서브에이전트 2 |
| 2주 D6~8 | Core 이식 2차(적 AI·드롭·인벤토리·스테이지 흐름) + 골든 100% | PASS율 100% 표, 불일치 목록 docs | 1·3 |
| 2주 D6~8 | 실험 키샷 장면을 1-1 정식 장면으로 승격, 카메라 LOCK 34° 코드화 | 장면 + 카메라 수치 docs | 2 |
| 2주 D9~10 | 플레이어 이동·공격 1개가 Core 판정대로 화면에 나오는 수직 슬라이스. 데이터·번역 JSON 임포트 | 10초 무음 영상, Mac 판정 | 전원 |
| 상시 | docs: CLAUDE.md 1·3절(엔진·실행기·브랜치), UNITY_* 보드 → UE 보드, 번역 가이드 위치 갱신 | 규칙 개정안(사용자 승인) | CTO |

AI 에이전트 작업 방식(전환 시): 브리프 파일 + 금지사항(Core 수치 변경, `git add -A`, 창·소리, 공용 실행기 밖 실행) 그대로. 추가 금지: **Blueprint 그래프에 로직 작성, .uasset을 여러 레인이 동시 수정**(맵·위젯은 한 레인 소유). 바이너리 변경은 커밋 메시지에 "무엇을 어떻게 바꿨는지"를 텍스트로 남기고 캡처로 검수.

---

## 9. 남은 확인 (실험 D1에 사람이 원문으로 확인)
1. Yellowsky 엔진 1차 출처(개발사 B站·Steam 시스템 요구사항·크레딧).
2. UE 최신판의 macOS·Xcode 요구사항, Lumen/Nanite Mac 지원 수준 원문.
3. UE Windows 패키징의 Mac 호스트 가능 여부(현재 "불가"로 추정).
4. Unity 6.x URP의 볼류메트릭 안개 내장 여부·로드맵(검색으로 못 찾음).
5. UE 로열티 EULA 현행 원문(EGS 조항).

## 출처 목록
- https://mastersingaming.com/2026/08/16/all-new-biggest-game-trailer-reveals-and-exclusive-previews-from-august-2026/
- https://store.steampowered.com/app/5024530/_/ · https://www.3dmgame.com/news/202607/3949217.html · https://www.gamersky.com/news/202607/2177567.shtml · https://finance.sina.cn/2026-08-13/detail-ininecsn4726724.d.html?vt=4
- https://store.steampowered.com/app/4115450 · https://en.wikipedia.org/wiki/Phantom_Blade_Zero · https://www.pcgameshardware.de/Phantom-Blade-Zero-Spiel-74287/Specials/CPU-GPU-Benchmark-Performance-Fps-1557577/
- https://en.wikipedia.org/wiki/Titan_Quest_II · https://80.lv/articles/interview-inside-the-tech-and-artistic-inspirations-of-no-rest-for-the-wicked-from-moon-studios · https://en.wikipedia.org/wiki/Octopath_Traveler · https://primagames.com/?p=137593 · https://www.dragonflydb.io/faq/last-epoch-game-engine
- https://www.unrealengine.com/en-US/tech-blog/bringing-unreal-engine-on-macos-up-to-feature-parity-with-windowsprogress-report · https://forums.unrealengine.com/t/lumen-nanite-on-macos/508411 · https://forums.unrealengine.com/t/unreal-engine-5-7-released/2673913
- https://www.unrealengine.com/en-US/faq · https://www.unrealengine.com/en-US/license · https://www.pcgamer.com/unreal-engine-games-no-longer-owe-royalties-on-their-first-dollar1m-in-revenue · https://unity.com/products/pricing-updates
- https://forums.unrealengine.com/t/megascans-update-march-2025/2419561 · https://github.com/CristianQiu/Unity-URP-Volumetric-Light
- https://forums.unrealengine.com/t/community-tutorial-pixelate-any-material-in-unreal-engine-5-no-post-process/2702520 · https://forums.unrealengine.com/t/silverset-studios-3d-to-pixel-environment/2675584
- https://dev.to/colton_willey_ef3d8727ae9/how-i-taught-claude-to-see-inside-unreal-engine-23a9 · https://mcpservers.org/servers/remiphilippe/mcp-unreal
- 우리 코드: `unity/Packages/manifest.json`, `unity/ProjectSettings/ProjectVersion.txt`(6000.6.7f1), `unity/Assets/Exoduser/Runtime/**`, `unity/Tools/*`, `unity/Assets/Exoduser/Resources/Data/*.json`, `docs/0마스터플랜/REPO_SYNC_ENGINE_SPLIT_20261027.md`, `docs/0마스터플랜/DIRECTION_RESET_20261105.md`
