# Mac Unity 아랍어 세계관 자막 ATG 후보 — 2026-10-26

## 범위와 현재 판정

Mac `codex/unity-mac-20261024`의 `ar` 세계관 자막만 별도 렌더 후보로 연결했다. **`--unity-arabic-caption-preview`를 지정한 QA 실행에서만** UI Toolkit Advanced Text Generator(ATG) 패널을 만든다. 일반 실행의 `ar` 및 다른 28언어는 기존 IMGUI 경로 그대로다. 본 후보는 실제 ARM64 Player의 대표 프레임에서 결합·RTL을 확인했으나, 32큐 전체와 마지막 영문 cue32(0-based index31)의 실제 화면은 미확인이다. 기본 실행으로 승격하지 않는다.

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
| 마지막 영문 cue32(0-based index31) | 웹 `web-ar-cue31-720p.png`, Unity ATG 화면 PNG 없음 | `EXODUSER.`의 실제 Unity 폴백 결과 미확인 |

초기 글꼴만 IMGUI에 바꾼 `candidate-ar-visible-720p.png`는 글자 결합/순서 결함이 남았다. 해당 경로는 제품 코드에서 철회했다. ATG 첫 자산 빌드는 FontAsset material/atlas 서브자산 누락으로 Player `TextUtilities.GetTextCoreSettingsForElement` NullReferenceException이 났다. FontAsset material/atlas를 자산에 포함해 재빌드한 뒤 예외가 사라졌다. 패널을 화면에 직접 출력하면 기존 IMGUI 영상에 가려졌고, 별도 투명 RenderTexture 합성으로 실제 화면 표시를 확인했다. 이 실패·수리 단계 로그와 최종 `atg-composite-build-receipt.json`은 같은 검수 폴더에 있다.

## 남은 gate

1. cue32(0-based index31) `EXODUSER.`의 LTR 수정본을 새 QA Player에서 확인하고 Latin fallback의 글자·순서·폭을 웹과 비교한다.
2. 32큐 전체에서 8개 Naskh 단독 누락 영향 큐와 다중 행·문장부호 배치를 확인한다.
3. 검정 배경의 가로 폭을 웹 cue 길이에 맞출지 검수하고 720p/1080p에서 판정한다.
4. 위 결과가 통과할 때만 기본 실행 `ar` 활성화를 별도 변경으로 검토한다.

현 시점 판정: **ATG 후보 720p/1080p cue20 PASS, 전체 ar 인수 보류**. 웹/Unity 문구와 시간 데이터는 동일한 `lobby_frontend.json` SHA256 `32202897b58d1a1c29e149afaff8b32e9490633a1ae8b2c7350092ac28235562`를 유지한다.

## 2026-10-26 HEAD 일치 후속과 cue32 RETOUCH

`763667931` HEAD를 별도 경로에 새 ARM64 빌드했다. `atg-head-763667931-build-receipt.json`: Unity 6000.6.7f1, StandaloneOSX ARM64, `Succeeded`, 오류 0, 2,049,413,900 bytes. 빌드 직전 `NativeLobby.cs` SHA256 `7821f8ff9e5a28ba9d5a4511941a1d19250435aa37f2c90cdc7e20506d133f98`, `NativeArabicCaptionOverlay.cs` SHA256 `e5bb9ef7b75a49fd7a0e4a3086f07a08e86ca2b3d50a957414ac7c5d68f0ff1b`, 자막 JSON SHA256 `32202897b58d1a1c29e149afaff8b32e9490633a1ae8b2c7350092ac28235562`. `--unity-arabic-caption-preview`가 붙은 PID만 실제 ATG 판정에 썼다. 초기 CUA 바인딩이 플래그 없는 두 번째 인스턴스를 열어 그 화면은 ATG 근거에서 제외했다.

실제 ATG 화면의 마지막 cue32(0-based index31, 109.600–111.100초)는 `.EXODUSER`로 표시됐다. 이는 아랍어용 `LanguageDirection.RTL`을 라틴 전용 자막에도 강제한 결과다. 이 한 실패에 대해 `NativeArabicCaptionOverlay`는 U+0600–U+06FF 아랍 문자가 있으면 RTL, 없으면 LTR로 지정한다. 현재 JSON의 `ar` 32큐 중 앞31큐에는 해당 아랍 문자가 있고 마지막 `EXODUSER.`만 없다. 이 수정은 소스·JSON·시간을 바꾸지 않으며, 수정 후 실제 빌드/화면 판정은 다음 영수증에서만 확정한다. 상태: **cue32 RETOUCH 발견, 수정 후보 검증 대기**.

## 전 32큐 시작점 재생을 위한 QA 경로

수정본 `a249c4eb4`도 ARM64 빌드 성공·오류0(`atg-ltr-a249c4eb4-build-receipt.json`)이다. 다만 일반 시작 언어가 `ko`라 초기 1–4큐를 `ar`로 볼 수 없고, 로비의 시네마틱 재생 버튼은 이번 CUA QA 입력에 반응하지 않았다. 버튼의 제품 원인은 미확정이며 변경하지 않았다. 같은 기존 `--unity-arabic-caption-preview`가 있을 때만 `NativeLobby.Initialize`에서 `SetLanguage("ar")`를 호출해 영상 시작부터 아랍어를 선택한다. 정상 실행과 다른 28언어의 자막 코드·데이터는 바뀌지 않는다. 이 QA 편의 변경을 포함한 새 HEAD 빌드에서 32큐 연속 검수한다.
