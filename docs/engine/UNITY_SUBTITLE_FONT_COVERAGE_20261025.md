# 29개 세계관 자막 본문의 번들 글꼴 지원 — 2026-10-25

지원 담당의 새 읽기 전용 정적 분석이다. 언어 이름23/6 검사와 별도로 본문29언어×32=928큐의 보이는 문자를 처음 대조했다. **Unity 실제 글꼴 대체·글자 결합·양방향 배치·렌더 결과는 검사하지 않았다.** cmap에 문자가 없다는 사실만으로 현재 앱에 네모가 표시됐다고 결론 내리지 않는다.

| 항목 | 현재 근거 |
|---|---|
| 현재 caption | `NativeLobby.Styles`가 `Art/fonts/NanumMyeongjo-Regular` 한 asset을 지정 |
| 원본 CSS | migration ROOT index.html477~482: Noto Serif/KR 기본, ja의JP, zh의SC, zht의TC, ar의Noto Naskh Arabic, th의Noto Serif Thai를 언어별로 지정 |
| 입력 | 현행 Unity `lobby_frontend.json`29×32큐 / Resources/Art/fonts의 기존6TTF |
| 검사 | fontTools4.60.2 `TTFont.getBestCmap()`. 공백·Cc/Cf control은 glyph 요구에서 제외, 결합문자는 포함. 폰트/자막/시각/코드/공유INDEX 변경0 |
| 현재 caption asset 단독 | ko/en/id/ms 4개에서 보이는 문자 cmap 모두 존재. 나머지25개는 asset cmap 누락 있음 |
| 기존6asset 합집합 | 22언어는 cmap 보완 가능, 7언어는 모든 asset을 합쳐도 부족. 합집합은 실제 fallback 체인이 아님 |
| 대안 해석 | NotoKR static Regular/Bold/SemiBold 및 원 NotoSansKR은 각각17개 완전coverage. CinzelDecorative-Bold는18개이지만 장식체·대문자형태·읽기성 때문에 본문 대체를 자동 권장하지 않음 |

## 언어별 새 결과

현재 asset의 누락은 고유 문자 수, 영향 큐는 해당 문자가 하나 이상 있는 문장 수다. 최저누락은 기존 asset 하나를 쓸 때의 최저 수이며 서체 추천이 아니다.

| 코드 | Nanum 누락 문자 | 영향 큐 | 기존 단일 asset 최저누락 | 전체 asset에도 없는 문자 |
|---|---:|---:|---:|---:|
| `ko` | 0 | 0/32 | 0 | 0 |
| `en` | 0 | 0/32 | 0 | 0 |
| `zh` | 167 | 31/32 | 48 | 48 |
| `zht` | 167 | 31/32 | 5 | 5 |
| `ja` | 149 | 32/32 | 11 | 11 |
| `es` | 6 | 15/32 | 0 | 0 |
| `fr` | 6 | 16/32 | 0 | 0 |
| `de` | 3 | 13/32 | 0 | 0 |
| `ptbr` | 10 | 22/32 | 0 | 0 |
| `it` | 3 | 4/32 | 0 | 0 |
| `ru` | 41 | 31/32 | 0 | 0 |
| `uk` | 42 | 31/32 | 3 | 3 |
| `pl` | 7 | 19/32 | 0 | 0 |
| `cs` | 13 | 30/32 | 0 | 0 |
| `hu` | 10 | 29/32 | 0 | 0 |
| `ro` | 6 | 29/32 | 0 | 0 |
| `bg` | 35 | 31/32 | 0 | 0 |
| `el` | 44 | 31/32 | 8 | 8 |
| `tr` | 9 | 27/32 | 0 | 0 |
| `vi` | 50 | 31/32 | 0 | 0 |
| `th` | 49 | 31/32 | 49 | 49 |
| `id` | 0 | 0/32 | 0 | 0 |
| `ar` | 37 | 31/32 | 37 | 37 |
| `sv` | 3 | 20/32 | 0 | 0 |
| `da` | 2 | 8/32 | 0 | 0 |
| `no` | 3 | 8/32 | 0 | 0 |
| `fi` | 2 | 19/32 | 0 | 0 |
| `nl` | 1 | 4/32 | 0 | 0 |
| `ms` | 0 | 0/32 | 0 | 0 |

## 기존 asset 전체에 없는 문자

| 코드 | 고유 누락 수 | 문자 |
|---|---:|---|
| `zh` | 48 | 个临为义们你内则别剑剥哪坠处夺孽它巅带异归怀恶执数时晓残汇灭灵狱积称纠终缠论诞谁躯还这连钢铁问间 |
| `zht` | 5 | 你哪孽它巔 |
| `ja` | 11 | 内剣壊変奥帰数残渇脱込 |
| `uk` | 3 | єії |
| `el` | 8 | Όάέήίόύώ |
| `th` | 49 | กขคงจชซญฎณดตถทธนบปผพภมยรลวษสหอะัาำิีึืุูเแโใไ็่้์ |
| `ar` | 37 | ،آأإئابةتثجحخدذرزسشصضطعغفقكلمنهوىيًُّ |

## 다음 실제 검수

NativeLobby의 현재 font를 유지한 상태에서 FR 악센트 및 UK/JA/TH/AR의 해당 누락 문자가 들어간 실제 자막 큐를 먼저 표시해 fallback 결과를 관측한다. 임의로 원문을 ASCII/다른 언어로 바꾸거나 RTL을 문자열 역순으로 대신하지 않는다. font 자산 수리·선택은 실제 결함 관측과 기존 assets/원본 계약을 기준으로 별도 소유 범위를 정한다. 새 다운로드나 전역 폰트 설치는 이번 지원에서 수행하지 않았다.

반복 검수 없이 기존정적결과를 참조하는 재현 스크립트 `audit-subtitle-fonts.py`, 언어/폰트별 정확 문자와 영향큐 matrix `subtitle-font-coverage.json`을 함께 제출한다. 코드 작성 후 `docs/` 전체를 `NanumMyeongjo|Noto Serif|자막.*폰트|자막.*글꼴|cmap`으로 grep 검색한 목록은 `docs-matches.txt`에 보존했다. 현재 Unity 현황은 인수 담당이 해당 로비/시네마틱 문서·작업 보드와 정상 checkpoint에 연결한다.

**판정: STATIC COVERAGE ONLY / 렌더·폰트 대체·복합문자·RTL 인수 미완료.**

## 2026-10-26 우크라이나어 자막 전용 글꼴 인수

위 표와 판정은 **변경 전 기존 6개 폰트**의 감사 결과다. 현재 `NativeLobby.Styles`는 기본 `caption`을 그대로 만들고, `Art/fonts/NativeCaptionNotoSerif`를 한 번 로드해 성공한 경우에만 우크라이나어 전용 스타일과 그림자 스타일을 별도로 만든다. `Language == "uk"`일 때만 전용 스타일을 선택하고, 한국어 등 다른 언어와 리소스 누락 시 원래 `caption` 객체로 돌아간다. `CalcHeight`와 본문 `GUI.Label`은 같은 선택 스타일을 쓴다. 그림자 색 변경을 위해 본문 스타일을 수정하지 않는다.

| 항목 | 인수 값·적용 위치 |
|---|---|
| 언어·자막 | `uk` 세계관 본문 32큐만 전용 serif. 문구·cue start/end·영상·음향·선택 순서 변경 없음 |
| 기본/복귀 | `ko` 포함 나머지 언어는 기존 `NanumMyeongjo-Regular`의 동일 `caption` 객체, 50px/LowerCenter/wordWrap 유지 |
| 신규 자산 | `Resources/Art/fonts/NativeCaptionNotoSerif.ttf` (Google Fonts Noto Serif variable upright), 1,887,192 bytes, SHA256 `4d8e6761424656867019081a1a01336f3cb086982682698714054fc33f782713` |
| 라이선스 | 같은 폴더 `NativeCaptionNotoSerif-OFL.txt`, SIL OFL 1.1, SHA256 `cee9892f9f0cc8fe882c9e9537ee6a89621d86ee7ceaf70b02e2b2b1c25c061a` |
| 공식 출처 | [google/fonts Noto Serif 원본](https://github.com/google/fonts/blob/49af86b54514f1390e126f3139ced33824f5d72e/ofl/notoserif/NotoSerif%5Bwdth%2Cwght%5D.ttf), [OFL](https://github.com/google/fonts/blob/6a23d718de1dbb1be9532aebf9c6ce335070e2ea/ofl/notoserif/OFL.txt) |
| cmap 정적 검증 | `є` U+0454, `і` U+0456, `ї` U+0457 모두 존재; 현재 `lobby_frontend.json`의 `uk` 32큐에서 공백 외 고유 53문자 누락 0 |
| 코드 정적 검증 | Unity 6000.6.7f1 C#9/Roslyn4.10 기존 Runtime+Editor 76소스 컴파일 오류 0; 스타일 선택 분기·높이/그리기 동일 스타일·`uk→ko` 원본 객체 반환 정적 확인 |

새 Unity Player 실행·실제 glyph 픽셀·폰트 import·런타임 객체 동일성은 아직 검증하지 않았다. 기존 29언어 전체의 shaping/RTL 판정도 유지한다. `uk→ko` 동일 객체는 소스 선택식으로 확인한 계약이며 Player 관측 결과로 승격하지 않는다.


## 2026-10-26 Noto Serif 20-language connection candidate

# Unity 세계관 자막 글꼴 보완 후보 — 2026-10-26

상태: PC 격리 프로젝트 `E:/exoduser-runtime/codex-ui-resume-20261026/unity`의 `NativeLobby.cs` 자막 스타일 선택 블록에 연결한 후보. Unity 컴파일·Player 실제 렌더·Mac 인수 전이다. 제품 저장소 문서 반영 시 이 내용을 `docs/engine/UNITY_SUBTITLE_FONT_COVERAGE_20261025.md`의 후속 절로 통합한다.

## 입력과 판정

- 데이터: `Resources/Data/lobby_frontend.json` SHA-256 `32202897B58D1A1C29E149AFAFF8B32E9490633A1AE8B2C7350092AC28235562` — 29언어 × 32큐.
- 현행 글꼴: `NanumMyeongjo-Regular.ttf` SHA-256 `7ED9E8653A8ED04285D51DC343FFEA6EB3D9C73AFC27383EA8929EE4FFD03205`.
- 기존 우크라이나어용 글꼴 재사용: `NativeCaptionNotoSerif.ttf` SHA-256 `4D8E6761424656867019081A1A01336F3CB086982682698714054FC33F782713`; `.meta` SHA-256 `040EFCD46972534B4ECB10A2A1CEFD8748D4E540103F9ABC30C249141C0E68E2`.
- `caption-font-cmap-audit.py`가 두 TTF의 Unicode cmap 형식 4·12를 읽어 각 언어 32큐의 공백·제어문자 외 모든 보이는 코드포인트를 대조했다. 전체 문자와 누락 목록은 `caption-font-plan.json`에 있다. cmap coverage는 실제 글자 조형·결합·줄바꿈·시각 품질의 증명이 아니다.
- `fontTools`는 현지 Python에 없어서 설치 없이 표준 TTF cmap 파서를 사용했다. 이전 `UNITY_SUBTITLE_FONT_COVERAGE_20261025.md`의 Nanum 누락 수와 29언어 모두 일치했다.

| 코드 | Nanum 누락 고유 문자 | Noto 누락 고유 문자 | 연결 |
|---|---:|---:|---|
| ko | 0 | 155 | 현행 유지 |
| en | 0 | 0 | 현행 유지 |
| zh | 167 | 170 | 미해결 |
| zht | 167 | 170 | 미해결 |
| ja | 149 | 151 | 미해결 |
| es | 6 | 0 | Noto Serif |
| fr | 6 | 0 | Noto Serif |
| de | 3 | 0 | Noto Serif |
| ptbr | 10 | 0 | Noto Serif |
| it | 3 | 0 | Noto Serif |
| ru | 41 | 0 | Noto Serif |
| uk | 42 | 0 | Noto Serif, 기존 유지 |
| pl | 7 | 0 | Noto Serif |
| cs | 13 | 0 | Noto Serif |
| hu | 10 | 0 | Noto Serif |
| ro | 6 | 0 | Noto Serif |
| bg | 35 | 0 | Noto Serif |
| el | 44 | 0 | Noto Serif |
| tr | 9 | 0 | Noto Serif |
| vi | 50 | 0 | Noto Serif |
| th | 49 | 49 | 미해결 |
| id | 0 | 0 | 현행 유지 |
| ar | 37 | 37 | 미해결, RTL 별도 |
| sv | 3 | 0 | Noto Serif |
| da | 2 | 0 | Noto Serif |
| no | 3 | 0 | Noto Serif |
| fi | 2 | 0 | Noto Serif |
| nl | 1 | 0 | Noto Serif |
| ms | 0 | 0 | 현행 유지 |

## 코드 계약과 남은 검수

`NativeLobby.UseNotoCaptionForLanguage`는 위 20개 정확한 소문자 코드에만 true다. `SetLanguage`의 기존 `LobbyLanguage.Normalize` 경로, 29개 언어 목록 순서, 자막 문구·시각·음향은 변경하지 않았다. `CaptionStyleForLanguage`와 `CaptionShadowForLanguage`가 같은 기존 Noto Serif 글꼴의 한 번 생성된 스타일을 고르고, 높이는 선택된 caption 스타일의 `CalcHeight`를 그대로 쓴다. 글꼴 로드·GUIStyle 생성은 기존 `Styles()`의 1회 초기화만 사용한다. 기본 복귀는 기존 Nanum caption/shadow 스타일이다.

`zh/zht/ja/th/ar`는 이 Noto Serif 한 벌로 32큐를 완전히 표시할 수 없어 연결하지 않았다. 특히 아랍어 RTL, 결합·양방향 배치와 중국어·일본어·태국어 전용 글꼴은 별도 구현/검수 대상이다. 20개 Noto Serif 언어도 실제 720p/1080p caption 렌더, 줄바꿈, 악센트·결합문자, 언어 전환 후 기본 복귀를 Player에서 검수해야 한다. 기존 우크라이나어 720p/1080p 화면 증거는 있으나 이 확장 변경의 빌드 검수 증거는 아니다.

## 문서 검색과 소유권

`G:/exoduser/docs` 전체를 `NanumMyeongjo|NativeCaptionNotoSerif|caption font|cmap`으로 검색한 결과는 Godot/UI 자료 3건이며 이 Unity 변경의 현행 문서는 없었다. PC Unity 문서에서는 `UNITY_SUBTITLE_FONT_COVERAGE_20261025.md`가 직접 관련되며, 기존 6 asset의 정적 coverage를 설명하므로 새 Noto Serif 자산과 이번 20언어 연결을 후속 절로 기록해야 한다. 대상 격리 프로젝트에는 `docs/engine`이 없다. 타 작업자의 PC worktree 문서는 수정하지 않았다.

변경 전 `NativeLobby.cs` byte 백업은 `NativeLobby.before-caption-fallback.cs`다. 적용 범위는 `NativeLobby.cs`의 `CaptionStyleForLanguage`/`CaptionShadowForLanguage` 주변에 정확한 언어 선택 함수 1개를 더한 것뿐이다. 원본 데이터, 두 글꼴, `.meta`, 제품 저장소, Unity 빌드 설정은 그대로다.


검수 fixture: `--unity-ui-resume-smoke --qa-caption-coverage -caption-oracle <absolute caption-font-plan.json>`. TTF cmap 오라클로 29언어를 분류하고 24언어의 32큐 고유 글리프 전체를 실제 Unity Font API로 질의한다. 5언어는 UNRESOLVED로 기록한다. Noto Serif 20언어의 대표 큐 720p PNG를 출력한다. 아직 이 변경의 컴파일/실행 결과는 없다. 기존57개 검수의 성공은 변경 전 빌드 결과다.
