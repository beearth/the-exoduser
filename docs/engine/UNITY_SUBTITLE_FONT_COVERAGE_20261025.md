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

위 표와 판정은 **변경 전 기존 6개 폰트**의 감사 결과다. 이 절은 우크라이나어를 먼저 인수한 당시의 계약이다. 당시 `NativeLobby.Styles`는 기본 `caption`을 그대로 만들고, `Art/fonts/NativeCaptionNotoSerif`를 한 번 로드해 성공한 경우에만 우크라이나어 전용 스타일과 그림자 스타일을 별도로 만들었다. 당시에는 `Language == "uk"`일 때만 전용 스타일을 선택했다. 현행 20개 언어 및 지역 4개 언어 확장은 아래 후속 절을 따른다. `CalcHeight`와 본문 `GUI.Label`은 같은 선택 스타일을 쓴다. 그림자 색 변경을 위해 본문 스타일을 수정하지 않는다.

| 항목 | 인수 값·적용 위치 |
|---|---|
| 언어·자막 | 당시 `uk` 세계관 본문 32큐만 전용 serif. 문구·cue start/end·영상·음향·선택 순서 변경 없음 |
| 기본/복귀 | 당시 `ko` 포함 나머지 언어는 기존 `NanumMyeongjo-Regular`의 동일 `caption` 객체, 50px/LowerCenter/wordWrap 유지 |
| 신규 자산 | `Resources/Art/fonts/NativeCaptionNotoSerif.ttf` (Google Fonts Noto Serif variable upright), 1,887,192 bytes, SHA256 `4d8e6761424656867019081a1a01336f3cb086982682698714054fc33f782713` |
| 라이선스 | 같은 폴더 `NativeCaptionNotoSerif-OFL.txt`, SIL OFL 1.1, SHA256 `cee9892f9f0cc8fe882c9e9537ee6a89621d86ee7ceaf70b02e2b2b1c25c061a` |
| 공식 출처 | [google/fonts Noto Serif 원본](https://github.com/google/fonts/blob/49af86b54514f1390e126f3139ced33824f5d72e/ofl/notoserif/NotoSerif%5Bwdth%2Cwght%5D.ttf), [OFL](https://github.com/google/fonts/blob/6a23d718de1dbb1be9532aebf9c6ce335070e2ea/ofl/notoserif/OFL.txt) |
| cmap 정적 검증 | `є` U+0454, `і` U+0456, `ї` U+0457 모두 존재; 현재 `lobby_frontend.json`의 `uk` 32큐에서 공백 외 고유 53문자 누락 0 |
| 코드 정적 검증 | Unity 6000.6.7f1 C#9/Roslyn4.10 기존 Runtime+Editor 76소스 컴파일 오류 0; 스타일 선택 분기·높이/그리기 동일 스타일·`uk→ko` 원본 객체 반환 정적 확인 |

새 Unity Player 실행·실제 glyph 픽셀·폰트 import·런타임 객체 동일성은 아직 검증하지 않았다. 기존 29언어 전체의 shaping/RTL 판정도 유지한다. `uk→ko` 동일 객체는 소스 선택식으로 확인한 계약이며 Player 관측 결과로 승격하지 않는다.

2026-10-26 후속: HEAD `207ffc8bf`로 새로 빌드한 Mac Player의 실제 세계관 자막에서 우크라이나어 `є`/`і`를 PNG로, `ї`를 CUA 화면으로 확인했다. 해당 한 cue의 `ї` 로컬 PNG는 저장되지 않았으며 전체32큐/다른 언어/`uk→ko` 런타임 객체 동일성은 검증하지 않았다. [새 Player 영수증](UNITY_MAC_HEAD_PLAYER_20261026.md).

## 2026-10-26 Mac 20언어·지역 4언어 연결

현재 `NativeLobby.UseNotoCaptionForLanguage`는 `es/fr/de/ptbr/it/ru/uk/pl/cs/hu/ro/bg/el/tr/vi/sv/da/no/fi/nl` 정확 20코드에 기존 `NativeCaptionNotoSerif`를 선택한다. `zh/zht/ja/th`는 각각 정적 Regular 400 지역 글꼴을 선택하고, 리소스가 없으면 기존 `NanumMyeongjo-Regular` 기본 스타일로 돌아간다. `ko/en/id/ms/ar`도 기본 스타일을 유지한다. `ar`의 RTL·결합·양방향 배치는 별도 미해결이다. 본문/그림자는 같은 언어 쌍에서 선택되며 높이 계산도 그 본문 스타일을 쓴다. 29언어 순서와 32큐 문구·시각·음향은 변경하지 않았다. 상세 자산·출처·검수는 [Mac 지역 자막 인수](UNITY_MAC_LOCALE_INTEGRATION_20261026.md)에 있다.

2026-10-26 720p 후속: 새 빌드 없이 같은 ARM64 Player에서 `zh/zht/ja/th` 최장 cue20의 원문 전체·그림자·잘림 없음과 같은 큐 `ko` 복귀를 실제 PNG로 확인했다. 이전 `zht` 빈 프레임은 자막이 보이는 PNG로 보완했다. [지역 자막 화면 증거](UNITY_MAC_LOCALE_INTEGRATION_20261026.md).

## 2026-10-26 아랍어 ATG 격리 후보

위 Mac 20언어·지역 4언어 표의 **일반 실행 계약은 그대로**다. `--unity-arabic-caption-preview`로만 `ar` 자막을 UI Toolkit Advanced Text Generator와 동적 Noto Naskh Arabic FontAsset에 보낸다. `cdc50a1e6` ARM64 720p에서 아랍어 cue1–31의 결합·RTL·문장부호·잘림 없음, 라틴 cue32 `EXODUSER.`의 LTR fallback, 메뉴 겹침 없음, `ar→ko` 복귀를 확인했다. 단독 Naskh cmap 누락 8문자/8큐는 FontAsset fallback 포함 실제 화면에서 표시됐다. 최신 `9cc2759c1` ARM64의 내용 폭 배경은 720p 긴·짧은 대표 큐, 1080p 긴 cue21/28·짧은 cue26·메뉴·`ar→ko`로 확인했다. 최신 빌드 32큐 전수나 1080p 전수는 주장하지 않으며 일반 실행 ar 후보 채택은 하지 않았다. 검수에는 frontend-review와 새 절대 `-output` 경로를 함께 쓴다. 플래그 없는 자동 실행 1회의 일반 프로필 읽기 가능성은 [후보 계약·증거](UNITY_MAC_ARABIC_CAPTION_PREVIEW_20261026.md)에 남겼다.
