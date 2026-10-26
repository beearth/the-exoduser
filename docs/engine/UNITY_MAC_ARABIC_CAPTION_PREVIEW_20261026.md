# Mac Unity 아랍어 세계관 자막 ATG 후보 — 2026-10-26

## 범위와 현재 판정

Mac `codex/unity-mac-20261024`의 `ar` 세계관 자막만 별도 렌더 후보로 연결했다. **`--unity-arabic-caption-preview`를 지정한 QA 실행에서만** UI Toolkit Advanced Text Generator(ATG) 패널을 만든다. 일반 실행의 `ar` 및 다른 28언어는 기존 IMGUI 경로 그대로다. 최종 `cdc50a1e6` ARM64 Player에서 32큐 전체의 순서·원문·가시 결합·문장부호·한 줄 배치·잘림 없음과 cue32 `EXODUSER.` LTR을 확인했다. 기본 실행으로는 승격하지 않는다.

원본 웹은 `index.html`의 `#worldIntroVideo[data-subtitle-language="ar"]::cue`에 `Noto Naskh Arabic`을 지정하고, `world-intro-subtitles.js`가 `VTTCue` 가운데 정렬·폭84%·아래쪽 선을 사용한다. Unity 6000.6.7f1의 [Advanced Text Generator](https://docs.unity3d.com/kr/6000.0/Manual/UIE-advanced-text-generator.html)는 HarfBuzz/ICU/FreeType 기반 복합 문자·RTL 경로다. 문자열을 역순으로 만들거나 자막 JSON을 고치지 않았다.

## 코드·자산 계약

| 항목 | 현재 값·적용 위치 |
|---|---|
| 활성 조건 | `NativeLobby.arabicCaptionPreview`: 명령행 정확 `--unity-arabic-caption-preview` 포함 |
| 진입 | `NativeLobby.Initialize`가 조건 충족 시 시작 언어를 `ar`로 지정하고 `NativeArabicCaptionOverlay`를 추가·초기화. 이는 QA 플래그 안에서만 적용 |
| 표시 | `WorldIntro`, 언어 `ar`, `SubtitleText.Length>0`, 패널 `Ready`일 때만 IMGUI 자막을 건너뛰고 ATG RenderTexture를 영화 위에 합성. 나머지는 기존 IMGUI 본문/그림자 |
| 입력 | 기존 `LobbySubtitleData`의 `SubtitleText` 원문 그대로 Label에 전달. 문구·cue start/end·32큐·영상/음향 계약 변경 없음 |
| 조형 | `unityTextGenerator=Advanced`, 동적 `ArabicCaptionNaskhDynamic` FontAsset. 본문에 U+0600–U+06FF 아랍 문자가 있으면 `languageDirection=RTL`, 없으면 LTR |
| 배치 | 패널 전체 화면 크기 RenderTexture, 본문 좌우 각8%·하단18%, 가운데 정렬, 폰트 크기 `Clamp(Screen.height×0.054,32,50)`px, 본문 색 `(0.933,0.898,0.835)`, 검정 배경 alpha0.46 |
| 폰트 | `Resources/Art/fonts/NotoNaskhArabic-Regular.ttf`, Noto Naskh Arabic Regular 2.021, 247,336 bytes, SHA256 `6f0a92031367b2f5a2078fe9d24f3433122b61a0bad57c423aad8f3c39aa2e6e` |
| 라이선스 | 같은 폴더 `NotoNaskhArabic-OFL.txt`, SIL OFL 1.1, SHA256 `a7a5a25eb188bf1cd96982030d53e23c33485c69b1044a562254226857ee13af` |
| 출처 | [Noto Arabic 공식 프로젝트](https://github.com/notofonts/arabic), 공식 dashboard 고정 commit `cb61ee...`의 static Regular/OFL |
| FontAsset | `ArabicCaptionNaskhDynamic.asset`: Dynamic, 원본 TTF 참조, 내장 atlas/material, Latin용 `ArabicCaptionLatinFallback.asset` fallback. `ArabicCaptionPanel.asset`의 `ArabicCaptionTextSettings.asset`가 Naskh를 기본 지정 |
| 자원 수명 | 해상도 변화 시 RenderTexture 교체, 컴포넌트 파괴 시 해제. QA 전용 분기이며 저장 데이터에는 쓰지 않음 |

Naskh 단독 cmap은 현행 `ar` 32큐의 공백 외 고유 46문자 중 38문자를 포함한다. `D E O R S U X`와 U+2026은 이 TTF에 없고 해당 문자를 쓰는 8/32큐는 보조 글꼴 경로가 필요하다. 따라서 이 표의 자체 cmap만으로 전체 문장 PASS라 판정할 수 없다. 라틴 fallback은 `NativeCaptionNotoSerif`를 소스로 한 별도 Dynamic FontAsset이다.

## 실제 ARM64 관측

2026-10-26 Unity 6000.6.7f1 `StandaloneOSX` ARM64 후보 `atg-composite-build`는 빌드 성공·컴파일 오류0이다. 영수증과 화면은 외부 임시 검수 폴더 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-AR-20261026/`에 보존했다. 앱은 QA 별도 `-output`과 `--unity-frontend-review`로 실행했다.

| 비교 지점 | 웹/Unity 실제 화면 | 판정 |
|---|---|---|
| ar 첫 자막 720p | `web-ar-cue20-720p.png`과 별개로 `atg-ar-visible-720p.png` | 아랍어 결합·RTL·영화 위 합성 확인 |
| ar cue20 720p | `web-ar-cue20-720p.png` / `atg-ar-cue20-720p.png` | 원문 `كل وحش في الجحيم… كان يومًا شخصًا ما، في مكان ما.` 한 줄·결합·말줄임/마침표 표시·잘림 없음. 웹보다 검정 배경 폭이 넓음 |
| ar cue20 1080p | `atg-ar-cue20-1080p.png` | 같은 원문 한 줄·잘림 없음 |
| 언어 메뉴 720p | `atg-ar-menu-720p.png` | 우상단 메뉴와 하단 자막 동시 표시·겹침 없음 |
| `ar→ko` 720p | `atg-ko-return-720p.png` | 한국어 기본 IMGUI 자막 복귀·아랍어 잔상 없음 |
| 마지막 영문 cue32(0-based index31) | 웹 `web-ar-cue31-720p.png`, 최종 Unity `atg-final-cue32.jpg` | `EXODUSER.`의 순서·마침표·라틴 폴백 가시 PASS. 이전 `.EXODUSER` 결함 수정 |

초기 글꼴만 IMGUI에 바꾼 `candidate-ar-visible-720p.png`는 글자 결합/순서 결함이 남았다. 해당 경로는 제품 코드에서 철회했다. ATG 첫 자산 빌드는 FontAsset material/atlas 서브자산 누락으로 Player `TextUtilities.GetTextCoreSettingsForElement` NullReferenceException이 났다. FontAsset material/atlas를 자산에 포함해 재빌드한 뒤 예외가 사라졌다. 패널을 화면에 직접 출력하면 기존 IMGUI 영상에 가려졌고, 별도 투명 RenderTexture 합성으로 실제 화면 표시를 확인했다. 이 실패·수리 단계 로그와 최종 `atg-composite-build-receipt.json`은 같은 검수 폴더에 있다.

## gate 판정

최종 `cdc50a1e6`의 720p 실화면 32큐는 아래 순서표대로 확인했다. 1080p는 선행 후보의 cue20 대표 화면까지만 검수했으므로 전 32큐의 1080p 가시 판정으로 확대하지 않는다. 웹은 cue 텍스트 배경이 글자 길이를 따르지만 Unity 후보는 cue 폭 84% 전체에 검정 alpha 0.46을 칠해 짧은 문장에서도 배경이 넓다. 읽기성·영상 가림을 720p에서 확인한 결과 이번 **격리 QA 후보**에서는 허용하되 웹과 완전 동일한 배경 폭이라고 주장하지 않는다. 일반 실행 채택은 별도 제품 결정이다.

웹/Unity 문구와 시간 데이터는 동일한 `lobby_frontend.json` SHA256 `32202897b58d1a1c29e149afaff8b32e9490633a1ae8b2c7350092ac28235562`를 유지한다.

## 2026-10-26 HEAD 일치 후속과 cue32 RETOUCH

`763667931` HEAD를 별도 경로에 새 ARM64 빌드했다. `atg-head-763667931-build-receipt.json`: Unity 6000.6.7f1, StandaloneOSX ARM64, `Succeeded`, 오류 0, 2,049,413,900 bytes. 빌드 직전 `NativeLobby.cs` SHA256 `7821f8ff9e5a28ba9d5a4511941a1d19250435aa37f2c90cdc7e20506d133f98`, `NativeArabicCaptionOverlay.cs` SHA256 `e5bb9ef7b75a49fd7a0e4a3086f07a08e86ca2b3d50a957414ac7c5d68f0ff1b`, 자막 JSON SHA256 `32202897b58d1a1c29e149afaff8b32e9490633a1ae8b2c7350092ac28235562`. `--unity-arabic-caption-preview`가 붙은 PID만 실제 ATG 판정에 썼다. 초기 CUA 바인딩이 플래그 없는 두 번째 인스턴스를 열어 그 화면은 ATG 근거에서 제외했다.

실제 ATG 화면의 마지막 cue32(0-based index31, 109.600–111.100초)는 `.EXODUSER`로 표시됐다. 이는 아랍어용 `LanguageDirection.RTL`을 라틴 전용 자막에도 강제한 결과다. 이 한 실패에 대해 `NativeArabicCaptionOverlay`는 U+0600–U+06FF 아랍 문자가 있으면 RTL, 없으면 LTR로 지정한다. 현재 JSON의 `ar` 32큐 중 앞31큐에는 해당 아랍 문자가 있고 마지막 `EXODUSER.`만 없다. 이 수정은 소스·JSON·시간을 바꾸지 않는다. 최종 실화면에서 `EXODUSER.`로 확인해 **cue32 RETOUCH 완료**.

## 전 32큐 시작점 재생을 위한 QA 경로

수정본 `a249c4eb4`도 ARM64 빌드 성공·오류0(`atg-ltr-a249c4eb4-build-receipt.json`)이다. 다만 일반 시작 언어가 `ko`라 초기 1–4큐를 `ar`로 볼 수 없고, 로비의 시네마틱 재생 버튼은 이번 CUA QA 입력에 반응하지 않았다. 버튼의 제품 원인은 미확정이며 변경하지 않았다. 같은 기존 `--unity-arabic-caption-preview`가 있을 때만 `NativeLobby.Initialize`에서 `SetLanguage("ar")`를 호출해 영상 시작부터 아랍어를 선택한다. 정상 실행과 다른 28언어의 자막 코드·데이터는 바뀌지 않는다.

## 최종 HEAD ARM64 32큐 순차 QA

`cdc50a1e6`를 Unity 6000.6.7f1 `StandaloneOSX` ARM64로 빌드했다. `atg-full-cdc50a1e6-build-receipt.json`은 `Succeeded`, 오류 0, 2,049,413,900 bytes다. `--unity-frontend-review --unity-arabic-caption-preview`를 붙인 Player만 판정했으며 다른 앱/저장 경로는 검수 대상이 아니다. `atg-ar32-cue-contact-sheet.png`의 각 칸은 왼쪽→오른쪽, 위→아래로 cue1→32다. `atg-ar32-cue-manifest.json`에 각 화면 캡처의 실행 run/frame과 원본 cue start/end를 연결했다. 두 파일은 `_out/UNITY-MAC-AR-20261026/`에 있다.

| cue (1-based) | JSON start–end 초 | 원문 | 720p 실제 화면 |
|---:|---:|---|---|
| 1 | 0.080–2.940 | في الكون عوالم لا تُحصى. | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 2 | 4.122–7.042 | في مكان ما، يولد كون. | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 3 | 7.042–9.922 | وفي مكان آخر، يخبو كون آخر. | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 4 | 9.922–12.762 | لا نهاية للميلاد والموت… | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 5 | 12.762–16.402 | لكن، بقسوة، ليس ثمة إلا جحيم واحد. | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 6 | 17.402–20.622 | لا أحد يعرف من سنّ هذا القانون. | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 7 | 21.262–24.182 | كل الكائنات التي أثمت، بما تحمله من خبث… | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 8 | 24.182–26.962 | تنساب إلى جحيم واحد. | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 9 | 27.932–30.832 | في أعماقنا جميعًا، نعلم أنه موجود. | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 10 | 30.832–33.632 | كما تجري الأنهار نحو المنخفضات، | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 11 | 33.632–36.072 | تهبط قوة بلا نهاية. | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 12 | 36.452–38.132 | لا تتوق إلا إلى الدمار، | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 13 | 38.132–42.352 | فتجري وتتراكم، ثم تركد أخيرًا… | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 14 | 42.352–45.452 | في المكان المسمّى بالجحيم. | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 15 | 46.472–50.632 | الأرواح التي تغوص في تلك الأعماق تفقد طريق العودة… | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 16 | 50.632–54.252 | وتُسلب حتى فرصة أن تولد من جديد. | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 17 | 56.632–58.632 | يفقد الزمن كل معنى، | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 18 | 58.832–61.512 | ولا تتسرّب إلى اللحم إلا المعاناة. | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 19 | 62.112–64.512 | طاقة الدمار الكامنة فيهم ذاتها… | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 20 | 64.512–68.452 | تلدهم تجسيدًا للألم. | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 21 | 69.502–74.142 | كل وحش في الجحيم… كان يومًا شخصًا ما، في مكان ما. | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 22 | 76.532–79.432 | الجحيم لا يسأل من أي عصر جئت. | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 23 | 80.472–82.472 | من حملوا النصال. | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 24 | 82.652–83.972 | من كانت أجسادهم من فولاذ. | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 25 | 84.972–87.252 | من امتلكوا قوى نفسية خارقة. | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 26 | 87.889–89.729 | من بلغوا ذروة السحر. | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 27 | 90.902–93.622 | الجميع متشابكون في حفرة واحدة. | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 28 | 95.902–100.322 | من يصوّبون أسلحتهم بعضهم نحو بعض لا يريدون إلا شيئًا واحدًا. | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 29 | 100.322–101.682 | الهروب. | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 30 | 102.972–105.232 | أولئك الذين يتحدّون السقوط. | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 31 | 106.020–109.292 | نحن نسمّيهم… | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |
| 32 | 109.600–111.100 | EXODUSER. | PASS · 결합/순서/문장부호/한 줄/잘림 없음 |

한 번의 런에서 0.5초 간격으로 찍은 화면과 같은 HEAD의 두 보완 런을 사용했다. 첫 캡처의 중간 구간 13·14큐는 런 사이 간격에 걸렸으므로 세 번째 런에서 실제 표시를 다시 확인했다. 가장 짧은 cue24(1.320초)와 cue29(1.360초)도 별도 조밀 시트에서 확인했다. 촬영 wall clock은 영상 media clock과 같지 않아 JSON의 시작/종료 밀리초를 화면만으로 계측했다고 주장하지 않는다. 코드 `UpdateCaption()`이 `movie.Time-WorldCueOffset`과 각 cue의 `[start,end)`를 사용하며 JSON SHA는 원본과 동일하다. 실제 순서와 공백·지속의 상대 흐름에서 누락/역전은 없었다. 별도 `atg-final-ar-to-ko.jpg`는 같은 HEAD에서 L→Home→Return으로 한국어 자막과 기본 IMGUI 스타일로 복귀한 화면이다. QA Player 로그 네 개에 예외/오류가 없다. 다른 28언어 자막 데이터와 경로는 변경하지 않았다.

판정: **플래그 격리 ar 32/32 가시 PASS, cue32 RETOUCH 완료, 일반 실행 채택 0**. 1080p 전체 큐와 웹 배경 폭의 픽셀 일치는 아직 검수 범위 밖이다.
