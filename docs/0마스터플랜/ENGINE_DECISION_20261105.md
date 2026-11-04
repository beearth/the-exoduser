# 엔진 결정 자료 — Unity 유지 vs Unreal Engine 5 전환 (2026-11-05)

> 레인 ENG(조사·판단 자료). **결정은 사용자가 한다.** 이 문서는 사실·비교·권고·확인 실험 설계만 담는다.
> 표기: **[확인]** 공개 자료 2건 이상 또는 공식 문서 / **[1건]** 출처 1건 / **[코드]** 우리 저장소에서 직접 센 값 / **[추정]** 근거를 둔 추정 / **[미확인]** 못 찾음.
> 이 세션은 웹 검색만 됐고 페이지 열람(WebFetch)은 네트워크 정책으로 막혔다(store.steampowered.com·dev.epicgames.com·resetera 등). 그래서 URL은 검색 결과 기준이며, Mac 실험 첫날 사람이 직접 열어 재확인한다(§7 사용자 할 일 U8).

---

## 0. 한 쪽 요약 (아침 보고용, 3회차 출처 검증 뒤 재작성)

**권고: "2주 비교 실험 후 결정". 실험 동안은 Unity 유지(현 상태 그대로, 추가 투자 없음).** 결정 기준표(아래 K1~K7)를 미리 고정하고, 결과가 기준을 넘으면 UE5로 넘어간다.

**왜 다시 썼나.** 출처 검증(CX22-2·CX22-3)에서 이 문서의 UE 불리 쪽 서술이 4건 과장으로 나왔다: ① "UE 자산 diff·리뷰 불가" ② UE 5.6~5.7 Xcode 최소값 ③ "Blueprint는 AI가 못 읽음" 일반화 ④ "UE6 정식 2028 말" 확정 표기. 같은 방향의 오류가 반복됐으므로 **UE에 불리한 논거를 하나씩 "이걸 뒤집는 공식 근거가 있나"로 다시 따졌다**(아래 표). 이 문서가 처음부터 Unity 쪽으로 기울어 있었다는 점을 인정한다.

### 0.1 UE 불리 논거 자기 반박

| # | UE 불리 논거 | 뒤집는(또는 약화하는) 근거 | 남는 것 | 등급 |
|---|---|---|---|---|
| R1 | UE 자산은 바이너리라 리뷰 불가 | Epic 공식: 텍스트(T3D) 내보내기·Blueprint 내장 diff [CX22-2] | 리뷰 **가능**. 남는 것은 "정본이 바이너리라 AI가 파일을 직접 고치거나 Git이 자동 병합하지 못한다"(Epic이 Perforce 잠금 운영을 안내 — CX12 인용 Epic 문서) | 리뷰 불가 = **철회**. 직접 편집·병합 불리 = **[검증]**, 실제 생산성 차이 = **[미검증]** |
| R2 | Blueprint는 AI가 못 읽음 | 인용 글 저자는 초기 실패 뒤 플러그인을 확장해 읽었다 [CX22-3]. Epic 공식 MCP(5.8)·Python 에디터 스크립팅으로 에디터 경유 조회·수정 가능 [CX12 공식 문서] | 일반화 불가. "에디터를 거쳐야 한다"만 남음 | **철회**(개인 사례) |
| R3 | C# Core 이식에 6~12주 | 공식 근거도 반증도 없음. C#를 UE에서 돌리는 서드파티(UnrealSharp 등)는 [미검증]. 골든 트레이스 방식이면 낙관 쪽 | 이식 자체는 필요(UE 공식 스크립트 언어는 C++·Blueprint, Verse는 UEFN 중심) | 이식 필요 = **[검증]**, 기간 = **[추정]** |
| R4 | C++ 빌드가 느려 판정 루프가 길다 | Live Coding이 있다(공식 기능, 이번 세션 원문 미열람). 실측 없음 | 실험 K5에서 잰다 | **[미검증]** — 결론에 쓰지 않음 |
| R5 | Mac에서 Windows 패키징 불가 | 이번 세션에서 공식 원문 미확인 | 사실이어도 PC가 패키징하면 됨(지금도 PC 컴파일·Mac 판정 분업) | **[미검증]**, 영향 작음 |
| R6 | 픽셀 렌더 캐릭터 합성은 Unity가 쉽다 | UE도 SceneCapture·커스텀 패스·머티리얼 픽셀화 사례 있음(포럼). 난이도 비교 공식 근거 없음 | 실험 K7에서 확인 | **[미검증]** — 결론에 쓰지 않음 |
| R7 | Lumen 때문에 최소 사양이 높다 | Lumen·VSM은 끌 수 있다(확장성 설정). 수치 근거 없음 | 실험 K6에서 측정 | **[미검증]** |
| R8 | UE6 이주 리스크(재이주) | UE6 EA 2027 말 [검증: Epic·PC Gamer·GameStar], 정식은 그 12~18개월 뒤 "빨라도 2029 초" **전망**. Epic은 UE5→UE6 이행을 공언(세부 미확인). Unity도 장기적으로 런타임·버전 전환을 겪는다 [추정] | 데모·EA 기간(2026~27)에는 영향 없음. 정식 출시 무렵 판단 1회 | **약화** — 결정 요인 아님 |
| R9 | 4주 안에 엔진 3번째 교체 | 엔진의 성질이 아니라 우리 운영 리스크다. 화면 작업은 어차피 폐기·재작성 중 | 사용자에게 "UE가 마지막"이라는 확약이 필요하다는 운영 조건으로만 유지 | **[검증: 우리 docs]**, 엔진 비교 논거에서는 제외 |
| R10 | unity-mcp가 이미 연결돼 있다 | Epic 공식 MCP는 콘솔 명령 2개로 Claude Code 설정 생성 [1건 다수 보도]. 전환 비용은 작다 | 작은 이점 | **[검증]**, 비중 작음 |

**같은 기준으로 UE 유리 논거도 점검:** UE에 Lumen·Volumetric Fog가 내장 = **[검증]**(Epic 공식). "Unity 6 URP에는 볼류메트릭 안개가 내장 안 됨"은 이번 세션에서 공식 원문으로 확인하지 못했다 = **[미검증]**(서드파티 에셋이 많다는 사실만 확인). "UE면 우리 화면이 좋아진다"는 **[미검증]** — 그래서 실험이 필요하다.

### 0.2 결론 — 두 층으로 나눔

| 층 | 결론 | 근거 |
|---|---|---|
| **검증된 출처만으로** | **유지도 전환도 정당화되지 않는다 → 같은 장면 비교 실험이 유일하게 근거 있는 다음 단계.** 확인된 차이는 ① UE는 실시간 GI·볼류메트릭 안개를 기본 제공 ② 양쪽 공식 AI 연결(UE 5.8 MCP, Unity CLI)은 둘 다 실험 단계로 대등 ③ UE 자산은 바이너리라 AI 직접 편집·자동 병합이 Unity YAML보다 불리(리뷰는 가능) ④ 전환하면 C# Core 18,320줄 이식이 필요 [코드]. ①은 UE, ③④는 Unity 쪽이고 크기를 잴 수 없어 서로 상쇄 여부를 판단할 수 없다 | Epic·Unity 공식 문서(CX12·CX22 대조), 우리 코드 |
| **미검증 포함** | Unity 유지 쪽으로 기운다(전환 6~12주, 빌드 시간, 픽셀 합성 난이도, 최소 사양). **단 이 항목들은 전부 [추정]이며, 이 문서가 UE 불리 쪽으로 4번 틀렸다는 점을 감안해 결정 근거로 쓰지 않는다.** | §3·§4·§5 추정 |

**황천·엔진 선택 vs 제작 방식.** 황천(Steam 5024530 《黄天逆途》, 望虚社)은 **11인·약 2년·외부 투자 0**으로 그 분위기를 냈다 [3DM·游民星空 보도; 기간 약 2년은 CX3 `codex_yellowsky.md`]. 엔진은 **UE5(개발사 모집글 1건, 2024-09, Mac 확인)·세부 미확인** — 원문 `引擎：虚幻5` https://indienova.com/groups/post/103287 . 현재도 UE5인지·버전·Lumen/Nanite·렌더 방식은 미확인이고 "UE5라서 그 화면"은 증명되지 않았다. **유지·전환 논거는 황천의 엔진에 기대지 않는다. 분위기 목표는 엔진과 분리해 K1 비교판으로만 평가한다.** 확실한 것은 작은 팀의 분위기가 아트 방향·조명 판단·반복 제작에서 나왔다는 점이고, 이것은 엔진과 무관하게 우리가 갖춰야 한다.

**"요즘 언리얼이 AI 친화적"(§4.1).** 2026년에 **사실이 됐다**: UE 5.7 에디터 AI Assistant, UE 5.8 Epic 공식 MCP(실험적·로컬 전용), Python 에디터 스크립팅, T3D 내보내기·내장 diff. Unity도 Unity AI(6.2)·Unity CLI `unity mcp`(실험 단계)가 있다. "Unity보다 더 친화적"은 근거가 없고, "덜 친화적"도 직접 편집·병합 한 가지 외에는 실측 전이다 → K4·K5에서 사람 개입 시간·도구 실패·의도 밖 변경으로 잰다.

| 선택 | 장점 | 단점 | 판단 |
|---|---|---|---|
| **A. Unity 유지** | Core C# 18,320줄·oracle 122폴더 그대로 [코드]. 텍스트 자산이라 AI 직접 편집·Git 병합 [검증]. 전환 비용 0 | 우리 URP 커스텀 안개·조명(HellFogFeature 등 [코드])이 사용자 판정에서 실패 중. URP 내장 볼류메트릭 여부 [미검증] | 화면 문제가 제작법 문제라면 맞다 |
| **B. 즉시 UE5 전환** | Lumen·Volumetric Fog·Niagara 기본 제공 [검증]. 팬텀블레이드 제로·Titan Quest II가 UE5 [검증]. 공식 MCP(실험) [검증]. 화면 동결 중이라 전환 시점으로는 최적 | Core 이식 필요 [검증]·기간 [추정]. 자산 직접 편집·병합 불리 [검증]. 엔진 3번째 교체(운영 리스크) | 화면 이득이 실측되지 않은 상태에서 되돌리기 어려운 비용을 먼저 낸다 |
| **C. 실험 후 결정 (권고)** | 검증된 사실만으로 내릴 수 있는 유일한 결론. 연구 기간이라 개발 손실 적음 | 2주·Mac·사용자 시간(설치·로그인·판정 2회) | 되돌리기 어려운 결정을 증거로 내린다 |

**교차 검증 — PC Codex CX12 독립 조사와 대조** (`codex/unity-study-engine-ai-20261105` @ 960bdac69, `docs/0마스터플랜/GAME_STUDY/codex_engine_ai_friendliness.md`; Codex는 Epic·Unity 공식 문서 원문을 열람했고, 이 문서는 검색 결과 기준)

| 논점 | CX12 결론 | 이 문서 | 일치 여부·이유 |
|---|---|---|---|
| 파일 중심 AI 작업 | Unity 6을 우선 평가할 근거 있음(YAML diff) [추정] | 우리 방식에는 Unity가 더 맞음 | **일치(강도 차이).** 이 문서가 더 단정적인 이유: CX12는 프로젝트 코드·전환 비용을 일부러 보지 않았고, 이 문서는 우리 텍스트 기반 규칙(자기 경로 커밋·diff 확인·3레인)과 이미 연결된 unity-mcp를 근거로 더했다 |
| UE5 배제 여부 | AI 비친화로 일괄 배제할 근거 부족(5.8 공식 MCP·UAT·MRQ) | AI 연동은 대등, UE 이유는 화면이어야 함 | **일치.** 둘 다 UE를 AI 이유로 배제하지 않는다 |
| 전환 권고 | AI 친화성만으로 전환 권고 안 함, 전환 비용 미확인 | 전환 비용 6~12주 추정, 실험 후 결정 | **일치.** 이 문서가 비용을 추가로 추정했다 |
| 다음 단계 | 같은 소규모 과제로 실측(사람 개입 시간·도구 실패·의도 밖 변경 기록) | 같은 키샷 2주 실험, K4·K5 | **일치.** CX12의 측정 항목(사람 개입 시간·도구 실패·의도 밖 변경)을 K4·K5 기록 항목에 추가한다 |
| Unity CLI 상태 | **CLI 자체가 실험 단계**로 명시됨 [공식 문서] | 처음에 "CLI 정식"으로 적음 | **불일치 → 이 문서를 정정**(§4.1). 양쪽 공식 AI 연결 경로가 모두 실험 단계다 |
| UE 5.8 Mac 요구 | macOS 14.5·**Xcode 26.0 이상**(26.4 비호환), Nanite·VSM M2+ Beta, HW RT·MegaLights M2+ Experimental [공식 문서] | 5.6~5.7 기준 Xcode 15.4+로 적음 | **불일치 → 정정**(U3). CX12가 원문 기준이라 우선 |

**왜 C인가(요약).** 사용자가 지적한 결함(광원·안개·동작·HUD)이 제작법 문제인지 엔진 기본값 문제인지는 글로 못 가른다. No Rest for the Wicked는 Unity 개조판 [검증], 팬텀블레이드 제로는 UE5 [검증] — 양쪽 모두 최상급 결과가 있다. 같은 장면 비교판으로 정한다.

### 결정 기준표 (실험 10일차에 이 표로 판정)

| # | 측정 | UE5로 **전환**하는 조건 | Unity **유지** 조건 |
|---|---|---|---|
| K1 | 키샷 비교판(같은 구도·1920×1080·3840×1080·1x/3x 크롭) 블라인드 판정 — 사용자 + CTO | UE 쪽이 **분명히** 낫다(사용자 판정, 둘 중 하나 고르라 했을 때 UE 선택) | 같거나 Unity가 낫다 |
| K2 | 먼 적 가시성(카메라 LOCK 피치 34°, 안개 속 원경 적 3마리) | UE가 안개 품질을 올리면서 먼 적을 지우지 않는다 | UE도 먼 적을 지워야만 분위기가 난다(=이점 없음) |
| K3 | 같은 시간 예산(엔진당 작업 4일) 안에 도달한 품질 | UE가 **같은 시간에** 더 높다 | UE가 시간 더 들여야 동급 |
| K4 | AI 에이전트 작업성: 무창·무음 빌드+캡처 자동화가 Mac/PC에서 돌아가는가 | UE에서 Day 5까지 스크립트 1개로 "빌드→캡처 PNG" 성공 | UE 자동 캡처가 안 되거나 사람 손 필요 |
| K5 | 반복 속도: 코드 1줄 수정→화면 확인까지 시간 + 사람 개입 시간·도구 실패 횟수·의도 밖 변경 수(CX12 제안) | UE ≤ Unity의 3배 | UE > Unity의 3배 (판정 루프 붕괴) |
| K6 | 성능: Mac M5 Pro 1080p, PC 최소사양 후보(GTX 1060급) | 두 기기 모두 60fps(Mac)·30fps 이상(최소사양) | UE가 최소사양 30fps 미달 → 데모 시장 축소 |
| K7 | 픽셀 렌더 캐릭터(리깅 3D→저해상도) 합성 | UE에서 월드 고해상도+캐릭터 저해상도 합성이 Day 8까지 동작 | 합성이 안 돼 화면 전체를 저해상도로 써야 함 |

**규칙:** K1·K2·K3가 모두 "전환"이고 K4~K7 중 "유지"가 1개 이하면 **전환 권고**. K1이 "유지"면 다른 항목과 무관하게 **유지**. 나머지 경우는 유지하고 실험에서 배운 UE 쪽 기법(안개 층·조명 구성)을 Unity 매뉴얼에 옮긴다.

---

## 1. 황천(Downfall of Yellowsky)과 비슷한 분위기 게임들의 엔진

| 게임 | 엔진 | 근거 | 등급 |
|---|---|---|---|
| **Downfall of Yellow Sky / 黄天逆途** (Steam 5024530, 望虚社 HypoFront Studio, 11인·약 2년·외부 투자 0, 미출시·2026-08 Steam 페이지 공개, 정식까지 1년 이상) | **UE5(개발사 모집글 1건, 2024-09)·세부 미확인** | "Unreal Engine 5"라고 적은 곳은 해외 트레일러 모음 1건뿐: https://mastersingaming.com/2026/08/16/all-new-biggest-game-trailer-reveals-and-exclusive-previews-from-august-2026/ (사실로 쓰지 않음). 중국어 보도에는 엔진 언급 없음: https://www.3dmgame.com/news/202607/3949217.html · https://www.gamersky.com/news/202607/2177567.shtml · https://news.17173.com/content/07262026/220026468.shtml · B站 실기 영상 https://www.bilibili.com/video/BV19C356bEhm/ · Steam https://store.steampowered.com/app/5024530/_/ | **[1건]** — 개발사 모집글 원문 `引擎：虚幻5`(2024-09-29) https://indienova.com/groups/post/103287 (Mac 직접 열람). 현재 유지·버전·Lumen/Nanite·렌더 방식 미확인 |
| Phantom Blade Zero (S-GAME) — 임팩트 기준작 | Unreal Engine 5 | Steam 페이지 "Built in Unreal Engine 5": https://store.steampowered.com/app/4115450 · PCGH 벤치: https://www.pcgameshardware.de/Phantom-Blade-Zero-Spiel-74287/Specials/CPU-GPU-Benchmark-Performance-Fps-1557577/ · https://en.wikipedia.org/wiki/Phantom_Blade_Zero | [확인] |
| Titan Quest II (Grimlore) — 탑다운 ARPG | Unreal Engine 5 | https://en.wikipedia.org/wiki/Titan_Quest_II · https://www.neowin.net/amp/thq-nordic-unveils-titan-quest-ii-a-sequel-being-built-on-unreal-engine-5/ | [확인] |
| **No Rest for the Wicked** (Moon Studios) — 보스 동작 기준작 | **Unity 개조판**("Moonity") + 자체 렌더·조명 | 80.lv 인터뷰: https://80.lv/articles/interview-inside-the-tech-and-artistic-inspirations-of-no-rest-for-the-wicked-from-moon-studios · ResetEra 요약 | [확인] |
| Octopath Traveler 1·2 (HD-2D 원조) | Unreal Engine 4 | https://en.wikipedia.org/wiki/Octopath_Traveler | [확인] |
| Last Epoch — 탑다운 ARPG | Unity | https://www.dragonflydb.io/faq/last-epoch-game-engine | [1건] |
| V Rising (Stunlock) — 탑다운 액션 | Unity (HDRP로 알려짐) | 검색 결과 없음 | [미확인] |
| Diablo IV | Blizzard 자체 엔진(공식 명칭 미공개) | https://primagames.com/?p=137593 | [1건] |
| Path of Exile 2 | GGG 자체 엔진 | Steam 토론 1건뿐 | [미확인] |

**읽는 법:** 우리가 닮고 싶은 분위기(동양 수묵·안개·대기광)의 중국 게임 중 팬텀블레이드 제로는 UE5가 확실하고, 황천은 UE5 자기 신고 1건(2024-09)뿐이며 세부는 미확인이다. 하지만 같은 탑다운 ARPG의 품질 상위작은 자체 엔진(D4·PoE2)과 Unity 개조(NRftW)도 있다. **엔진이 분위기를 정하지 않는다. 엔진은 "기본으로 주는 것"과 "직접 만들어야 하는 것"의 경계를 정한다.**

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
| Mac 개발 | 에디터 Apple Silicon 네이티브. UE 5.6~5.7은 macOS 14+·**Xcode 15.2 이상(15.4는 권장)** [CX22-2 `SOURCE_VERIFY_20261105.md` Epic 공식 문서 대조]; UE 5.8은 macOS 14.5·Xcode 26.0 이상. Lumen HW RT는 Mac에서 실험적 [확인]. M4에서 Lumen 성능 불만 사례 [1건: Epic 포럼] | Apple Silicon 네이티브, Metal | Metal 지원 [추정] | **M5 Pro에서 UE 에디터는 돌지만 Lumen 실측은 실험에서 재야 한다(K6).** |
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
| 씬·프리팹·에셋 | **텍스트 YAML**(.unity·.prefab·.mat·.asset) → AI가 읽고 diff·리뷰·병합 가능 | **바이너리 .uasset/.umap.** 리뷰는 텍스트(T3D) 내보내기·에디터 내장 Blueprint diff로 가능 [CX22-2 `SOURCE_VERIFY_20261105.md` Epic 공식 문서 대조]. 그러나 정본이 바이너리라 AI가 파일을 직접 고치지 못하고 Git 자동 병합이 안 된다(편집은 에디터·MCP·Python 경유) | **가장 큰 차이(편집·병합 쪽).** 리뷰는 내보내기를 거치면 되지만, 병합은 바이너리라 "덮어쓰기"가 된다(Perforce식 잠금 필요). 동시 작업 3레인이 같은 맵을 만지면 충돌을 사람이 풀어야 한다 |
| 완화책 | — | ① **Blueprint 금지, C++ + 데이터(DataTable을 CSV/JSON에서 임포트)** ② 레벨은 One File Per Actor(액터당 파일 분리, 여전히 바이너리) ③ 에디터 Python 스크립트로 배치를 "코드로" 생성 ④ AI용 MCP: 서드파티 mcp-unreal(UE 5.7, 49개 도구) [1건: https://mcpservers.org/servers/remiphilippe/mcp-unreal]. Epic 공식 MCP 플러그인은 UE 5.8에 실험적으로 포함 [확인, §4.1] | 완화하면 쓸 만하다. 하지만 "레벨 배치 diff 리뷰"는 끝까지 안 된다 |
| AI 연결 현황 | **unity-mcp 이미 연결** (`com.coplaydev.unity-mcp`) [코드] | 5.8 공식 플러그인 켜고 새로 연결(실험적) | Unity 우위(이미 돌아감) |
| 무창·무음 자동 빌드 | `-batchmode` 빌드, 캡처는 그래픽 장치 필요(`-nographics` 금지). 공용 실행기 `exo-unity.ps1` 이미 있음 [CLAUDE.md] | `UnrealEditor-Cmd` + `-RenderOffscreen`(창 없이 렌더) + `-nosound`, 커맨드렛·Python 스크립트, 패키징은 `RunUAT BuildCookRun` [추정: 공식 문서 미열람] | 둘 다 가능. UE는 쿡(cook)이 길고 셰이더 컴파일 캐시(DDC) 관리가 필요. **새로 만들어야 할 파이프라인 1주** [추정] |
| 빌드·반복 시간 | 스크립트 수정 → 도메인 리로드 수 초~수십 초 | C++ 수정 → 증분 빌드 수십 초~수 분, Live Coding. 첫 셰이더 컴파일 수십 분~1시간+ [추정] | K5에서 실측 |
| Mac ↔ PC 역할 | Mac에서 Windows 빌드 가능(Mono, Windows Build Support 모듈) [추정] | **Windows 패키징은 Windows 호스트 필요** [추정: 공식 문서 확인 필요] → Mac에서 판정한 것과 Steam 올리는 Windows 빌드가 다른 기계에서 나온다 | CLAUDE.md 3.4(PC 컴파일·Mac 판정)와 맞물림. UE면 PC가 패키징까지 맡아야 한다 |
| 저장소 | 지금 구조(텍스트 위주, Git) | .uasset 대용량 → Git LFS 또는 Perforce 필요. 저장소 용량·클론 시간 증가 [추정] | 클라우드 세션 sparse checkout과 LFS 조합 검증 필요 |

### 4.1 "AI 친화적" 주장 판정 — 같은 기준으로 나란히 (2026-11 기준)

| 기준 | Unreal Engine | Unity | 판정 |
|---|---|---|---|
| 공식 MCP(에이전트가 에디터를 조작) | **UE 5.8(2026-06-17)에 Epic 공식 "Unreal MCP" 플러그인 — 실험적**. 에디터가 MCP 서버가 됨. `ModelContextProtocol.StartServer`, `GenerateClientConfig ClaudeCode`로 `.mcp.json` 생성, 127.0.0.1 로컬 전용·인증 없음·출시용 아님 [확인: https://cryptobriefing.com/unreal-engine-5-8-mcp-server-support/ · https://note.com/hacklog_stealth/n/n4ad0da7ef8c1 · https://www.strayspark.studio/blog/epic-official-mcp-plugin-ue5-8-vs-third-party · Epic 포럼 튜토리얼 https://forums.unrealengine.com/t/community-tutorial-build-a-playable-unreal-engine-5-level-with-ai-mcp-claude-code/2747422]. Epic 릴리스 노트 원문은 미열람 | **Unity CLI의 `unity mcp`가 공식**(에디터 내 AI Assistant 패키지의 MCP 서버는 deprecated → CLI로 대체) [확인: https://docs.unity.com/en-us/unity-cli/replace-mcp-server-unity-cli · https://docs.unity3d.com/Packages/com.unity.ai.assistant@2.3/manual/unity-mcp-get-started.html]. 우리는 커뮤니티 `com.coplaydev.unity-mcp` 사용 중 [코드] | **동급.** 둘 다 2026년에 공식화, **둘 다 실험 단계**(Unity CLI도 실험 단계 명시 — CX12 공식 문서 확인 https://docs.unity.com/en-us/unity-cli) |
| 커뮤니티 MCP | mcp-unreal(UE 5.7, 48~49개 도구, 헤드리스 빌드·테스트·Blueprint 편집) https://github.com/remiphilippe/mcp-unreal · StraySpark 상용(207개 도구) https://forums.unrealengine.com/t/strayspark-unreal-mcp-server-200-ai-tools-for-ue5-editor-automation-via-mcp/2707474 | CoplayDev unity-mcp, CoderGamester mcp-unity https://github.com/codergamester/mcp-unity, IvanMurzak Unity-MCP | 동급 |
| 에디터 내장 AI 도우미 | UE 5.7 **AI Assistant**(구 Epic Developer Assistant): 질문 응답·C++ 코드 생성·F1 문맥 도움 [확인: https://gamefromscratch.com/unreal-engine-5-7-released/ · https://80.lv/articles/unreal-engine-5-7-is-now-availabe]. UE6에 Claude·Gemini 통합 발표 [1건: https://wccftech.com/epic-games-unreal-engine-6-claude-gemini-developer-control/] | **Unity AI**(6.2, Muse·Sentis 대체, 외부 모델 사용) [확인: https://www.cgchannel.com/2025/08/unity-rolls-out-unity-ai-in-unity-6-2/] | 동급. 우리는 Claude Code가 주 작업자라 내장 도우미는 거의 안 쓴다 |
| 에디터 스크립팅 | **Python 에디터 스크립팅** 정식(액터 배치·에셋 임포트·머티리얼 설정을 코드로) [추정: 공식 문서 미열람, 널리 알려진 기능] | C# Editor 스크립트(우리 Editor 64파일 [코드]) | 동급. UE는 Python이 "바이너리 자산을 텍스트 코드로 다루는" 핵심 통로 |
| 헤드리스 빌드·자동화 | `UnrealEditor-Cmd` 커맨드렛, `RunUAT BuildCookRun`, BuildGraph(XML 빌드 그래프), `-RenderOffscreen`·`-nullrhi`·`-nosound` [추정: 공식 문서 미열람] | `-batchmode -executeMethod`, Unity CLI, 우리 `exo-unity.ps1` [코드] | 둘 다 됨. UE는 쿡·셰이더 컴파일이 길다 |
| **자산의 텍스트성** | **.uasset/.umap 바이너리.** 자산을 텍스트(T3D)로 내보내 diff할 수 있고 Blueprint 내장 diff가 있다 [CX22-2 `SOURCE_VERIFY_20261105.md` Epic 공식 문서 대조]. 하지만 정본이 바이너리라 AI가 파일을 직접 편집하지 못한다(에디터 경유 필요). 참고: Blueprint 읽기 어려움을 쓴 개인 사례 https://dev.to/colton_willey_ef3d8727ae9/how-i-taught-claude-to-see-inside-unreal-engine-23a9 — 저자는 초기 실패 뒤 플러그인을 확장해 읽어 냈다 [개인 사례, 일반화 금지, CX22-3]. 우회: T3D 텍스트(읽기·리뷰용, 정본 아님), Blueprint 대신 C++, 데이터는 CSV/JSON DataTable, Verse는 현재 UEFN 전용(UE6에서 통합 예정) | **씬·프리팹·머티리얼·ScriptableObject가 YAML 텍스트**(Force Text 직렬화) → Claude·Codex가 파일을 직접 읽고 고치고 `git diff`로 리뷰 | **Unity 우위(재평가: "리뷰 불가"가 아니라 "직접 편집·병합에서 불리").** 우리 규칙(자기 경로만 커밋, diff 확인, 동시 3레인)이 텍스트 자산을 전제로 한다 |
| 공개 사례 | Claude Code로 UE5 엔드리스 러너 제작 기사(작은 데모). 같은 기사·Reddit에서 "연결이 한 달 넘게 불안정했다" [1건: https://www.generationamiga.com/2026/06/14/claude-code-builds-playable-endless-runner-in-unreal-engine-5/ · https://www.techeblog.com/claude-code-endless-runner-game-unreal-engine-5/]. 출시 상용작 사후 분석은 못 찾음 | Claude Code + Unity 가이드 다수(https://ai-game.dev/blog/make-games-with-claude-code-unity). 출시작 사후 분석은 못 찾음. **우리 자신이 사례**(Runtime 52,237줄 대부분 AI 작성) [코드] | 출시 수준 AI 주도 사례는 양쪽 모두 미확인 |

**판정:** "언리얼이 AI 친화적"은 **2026년에 사실이 됐지만 "Unity보다 더"는 사실이 아니다.** MCP·내장 도우미·헤드리스 자동화는 대등하고, 자산이 텍스트냐는 근본 차이에서 Unity가 앞선다. UE에서 AI는 "에디터를 원격 조작"하는 방식이 되어 ① 판정 Mac에 에디터가 항상 떠 있어야 하고(무창 원칙과 충돌 가능 — [미검증], 실험 K4에서 확인) ② 변경 리뷰에 에디터 내보내기(T3D)·내장 diff 단계가 끼고, 직접 편집·병합은 Unity YAML보다 불리하다. **검증된 차이는 직접 편집·자동 병합 한 가지(Unity 유리)이고, 실제 생산성 차이는 [미검증]이다 → K4·K5로 잰다. AI 친화성은 어느 쪽으로도 결정 요인이 아니며, UE를 고른다면 이유는 화면(Lumen·안개)이어야 한다.**

### 4.2 UE 로드맵 리스크
- UE 5.8(2026-06)이 UE5 마지막 메이저(5.9 여지는 둠), **UE6 = UE5 + UEFN 통합, Verse 확대, 얼리액세스 2027년 말** [확인], 정식은 EA 12~18개월 뒤 "빨라도 2029 초" **[전망]** [근거: https://www.unrealengine.com/news/state-of-unreal-2026-top-news-from-the-show · https://pcgamer.com/software/it-is-going-to-change-a-lot-about-how-games-are-made-epic-merges-unreal-engine-5-with-unreal-engine-for-fortnite-to-give-game-devs-around-the-world-unreal-engine-6/ · https://www.gamestar.de/artikel/unreal-engine-6-early-access-2027-roadmap,3454807.html].
- 의미: 지금 UE5로 가면 데모·EA는 UE5.8에서 내고, 정식 출시 무렵 UE6 이주 여부를 다시 정해야 한다(데모·EA 기간에는 영향 없음 — 결정 요인 아님, §0.1 R8). C++·Actor 기반은 UE6에서도 지원된다는 말이 있으나 [미확인] 확인 필요. Unity 6은 같은 기간 LTS 줄기를 유지한다 [추정].

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
| U2 | Mac에 **Epic Games Launcher** 설치 → **Unreal Engine 5.8**(UE5 마지막 메이저, 공식 MCP 플러그인 포함) 설치. 디스크 여유 **100GB 이상** 확보(엔진 약 60GB + 셰이더 캐시) | 엔진 설치는 계정 필요 | 다운로드 1~2시간(방치 가능) |
| U3 | **Xcode** 최신판 설치(App Store) + 첫 실행해 라이선스 동의 | UE Mac C++ 빌드 필수. **UE 5.8은 macOS 14.5+·Xcode 26.0 이상(권장 26.1.1, 26.4 비호환)** [CX12 공식 문서 확인] | 30분~1시간 |
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
| 1주 D1~2 | AI 연결: Epic 공식 Unreal MCP(5.8, 실험적)를 Mac에서 켜고 `GenerateClientConfig ClaudeCode`로 연결. 막히면 mcp-unreal로 대체. 에디터 Python 스크립트 폴더(`Tools/ue-py/`)를 배치 정본으로 정함 | Claude Code가 액터 1개 배치·캡처 성공 | 서브에이전트 2 |
| 1주 D3~5 | 자동화: `UnrealEditor-Cmd -RenderOffscreen -nosound` 캡처 스크립트, `RunUAT BuildCookRun` Windows 패키징(PC), 공용 실행기 `exo-unreal.ps1`/Mac 셸 | 무창·무음 캡처 PNG 1장 | 서브에이전트 2 |
| 2주 D6~8 | Core 이식 2차(적 AI·드롭·인벤토리·스테이지 흐름) + 골든 100% | PASS율 100% 표, 불일치 목록 docs | 1·3 |
| 2주 D6~8 | 실험 키샷 장면을 1-1 정식 장면으로 승격, 카메라 LOCK 34° 코드화 | 장면 + 카메라 수치 docs | 2 |
| 2주 D9~10 | 플레이어 이동·공격 1개가 Core 판정대로 화면에 나오는 수직 슬라이스. 데이터·번역 JSON 임포트 | 10초 무음 영상, Mac 판정 | 전원 |
| 상시 | docs: CLAUDE.md 1·3절(엔진·실행기·브랜치), UNITY_* 보드 → UE 보드, 번역 가이드 위치 갱신 | 규칙 개정안(사용자 승인) | CTO |

AI 에이전트 작업 방식(전환 시): 브리프 파일 + 금지사항(Core 수치 변경, `git add -A`, 창·소리, 공용 실행기 밖 실행) 그대로. 추가 금지: **Blueprint 그래프에 로직 작성, .uasset을 여러 레인이 동시 수정**(맵·위젯은 한 레인 소유). 바이너리 변경은 커밋 메시지에 "무엇을 어떻게 바꿨는지"를 텍스트로 남기고 캡처로 검수.

---

## 9. 남은 확인 (실험 D1에 사람이 원문으로 확인)
1. 황천(黄天逆途): UE5는 개발사 모집글(2024-09) 1건으로 확인. 현재도 UE5인지·5.x 버전·Lumen/Nanite·렌더 방식은 미확인(Steam 시스템 요구사항·B站 개발 일지·크레딧으로 확인).
6. UE 5.8 Unreal MCP 플러그인 공식 릴리스 노트 원문(실험적 범위, 헤드리스·무창 모드에서 동작 여부).
7. UE6에서 C++ Actor 기반 프로젝트의 이주 경로(Epic 공식 문구).
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
