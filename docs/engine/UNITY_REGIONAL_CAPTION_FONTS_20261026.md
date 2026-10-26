# Unity 지역별 세계관 자막 폰트 연결 — 2026-10-26

# World intro 지역 폰트 연결 기록 초안 — 2026-10-26

상태: **fixture와 선택형 oracle 준비, 제품 연결 전 RED 대기**. 이 문서는 I: 검수 초안이다. E: 제품 파일, Unity Editor/Player, 빌드, 커밋의 변경 또는 실행을 주장하지 않는다.

## 출처와 1회 선택 계약

웹 `G:/exoduser/index.html:40-41,477-482`는 `zh/zht/ja/th`에 각각 Noto Serif SC/TC/JP/Thai를 지정한다. 현재 Unity `NativeLobby.Styles()`는 Nanum 기본 caption/shadow와 Noto Serif 20언어용 스타일을 한 번 만든다. 지역 4개는 `Styles()` 초기화에서 각 정적 Regular `Font`를 한 번 로드해 caption/shadow 쌍을 만들고, 언어별 선택 함수에서 해당 쌍을 선택하는 범위로 한정한다. 누락된 asset은 기존 선택 폴백을 유지한다. `CalcHeight`와 본문 `GUI.Label`이 같은 선택 caption 스타일을 사용해야 한다. 자막 텍스트·타이밍, `ko/en/id/ms`, 기존 20개 Noto 언어, 진단 프리뷰 게이트는 변경 대상이 아니다.

| 코드 | 제품 Resources 경로 예정 | I: 보관 정적 원본 | 글꼴 weight | 현행 32큐 cmap 누락 |
|---|---|---|---:|---:|
| `zh` | `Art/fonts/NotoSerifCJKsc-Regular` | `font-candidates/noto-cjk-static/sc/NotoSerifCJKsc-Regular.otf` | 400 | 0 |
| `zht` | `Art/fonts/NotoSerifCJKtc-Regular` | `font-candidates/noto-cjk-static/tc/NotoSerifCJKtc-Regular.otf` | 400 | 0 |
| `ja` | `Art/fonts/NotoSerifCJKjp-Regular` | `font-candidates/noto-cjk-static/jp/NotoSerifCJKjp-Regular.otf` | 400 | 0 |
| `th` | `Art/fonts/NotoSerifThai-Regular` | `font-candidates/notoserifthai/NotoSerifThai-Regular-full.ttf` | 400 | 0 |

SC/TC/JP는 공식 `notofonts/noto-cjk`의 완전한 정적 Regular OTF와 `Serif/LICENSE` (SIL OFL 1.1)를 사용한다. Thai는 `text=`를 주지 않은 공식 Google Fonts CSS가 제공한 정적 Regular TTF와 `google/fonts`의 `OFL.txt` (SIL OFL 1.1)를 사용한다. 후보의 정확한 URL·SHA-256·cmap·테이블 검사 증거는 `font-candidates/README.md`와 각 JSON 보고서에 있다. 변수 폰트와 32큐 전용 subset은 제품 후보에서 제외한다.

## 선택형 Player fixture RED→GREEN 계약

기존 `caption-font-plan.json`은 그대로 유지하고, `caption-font-plan-regional.json`의 `zh/zht/ja/th` 네 행에만 `fontResource`를 추가했다. fixture는 이 필드가 있을 때 `Resources.Load<Font>`가 반환한 **정확한 객체**를 기대한다. 해당 언어로 전환한 실제 WorldIntro caption과 shadow 스타일의 Font가 그 객체인지 확인하고, 해당 언어 32큐의 보이는 고유 문자를 Unity Font API로 glyph atlas에 요청·조회한다. 대표 큐의 720p PNG도 캡처한다. 기존 oracle로는 원래의 24지원/5미해결 검사를 유지한다. 새 oracle은 행별 데이터에서 28지원/`ar` 1미해결을 계산한다. `ar`는 RTL·결합·양방향 배치의 별도 검수까지 UNRESOLVED다.

제품 연결 전 총괄이 수정 fixture와 지역 oracle을 격리 검수 Player에 넣어 RED를 확인한다. 이후 승인된 GREEN 단계에서만 E: 제품 에셋/`NativeLobby.cs`를 백업하고 변경한다. 실제 import·컴파일·Player 자막 배치·Thai 성조 표시·CJK 글자 형태·720p/1080p 줄바꿈은 아직 미검증이다.

## 관련 문서 검색

`G:/exoduser/docs` 전체에서 `NanumMyeongjo|NativeCaptionNotoSerif|Noto Serif (SC|TC|JP|Thai)|caption.font|caption font|자막 폰트|Unity.*자막|cmap`을 검색했다. 직접 연결되는 웹 원형 설명은 `docs/cinematic/WORLD_INTRO_V6_SUBTITLES_20260907.md:59`의 지역별 서체 표다. 다른 매치는 Godot 폰트 이관과 독립 UI/보스 자료라 이번 격리 Unity 제품 자산 변경의 값을 수정하지 않는다. G: 공용 docs와 다른 작업자의 문서·staging은 건드리지 않았다. GREEN·Player 검수 뒤 실제 결과를 이 초안에 기록하고 관련 문서 소유자에게 반영 근거로 전달한다.


현재 단계: 선택형 oracle/실패 재현 fixture만 추가했고 제품 폰트 연결 전이다. 기존 oracle도 계속 허용하며 새 oracle의 fontResource는 실제 Resources.Load된 객체를 선택해야 한다. 제품 연결 전 RED Player 결과는 아직 대기다.


## 실제 RED와 최소 연결

지역별 글꼴 연결 전 Player에서 zh regional Font resource loaded 검사가 실패했고 누락 리소스 예외를 영수증에 기록했다. 이후 정확한4개언어에 정적Regular400 폰트와1회 생성한 caption/shadow 스타일만 연결했다. 기존4개기본/20개Noto 언어, 진단게이트, 자막문구/시간값은 유지한다. 새 자산의 원본과 OFL을 I:에 보존하고 실행에 필요한폰트 및 라이선스만 SSD runtime에 연결했다. 실제 GREEN 빌드/렌더 결과는 대기다.


## 실제 Windows Player 결과 — regional-transition-fixed

Unity 6000.6.7f1 Windows 빌드 뒤 실제 Player 영수증에서 190개 UI 검사 PASS, 33개 PNG, 종료 코드 0을 확인했다. 앞선 regional-green과 regional-transition의 zht 실패는 실제 Font 객체 불일치가 아니라 전환 첫 프레임 자막 cue 갱신 지연이었다. QA fixture의 지역 경로에 최대 3초 대기를 적용한 뒤 같은 정확한 Font 객체 검사를 유지했다. 29언어 가운데 28언어의 32큐 고유문자 atlas 질의에서 누락 0이며 새 지역 4언어의 대표 큐 720p PNG를 기록했다. 이는 전체 32큐 연속 자연 재생, 실제 OS 입력, 29언어 일반 UI 일치 증거가 아니다. ar RTL/shaping은 UNRESOLVED다. 상세 영수증은 docs/engine/qa의 regional-font-player-*.json, 원본 PNG는 I:/EXODUSER-Storage/qa/unity-ui-resume-20261026/regional-transition-fixed 에 있다.

6개 신규 .meta의 GUID와 SHA-256은 보존되었고 Unity가 importer 설정을 자동 보충한 파일은 없었다. 따라서 includeFontData=1 및 dynamic importer 설정은 .meta에서 확인되지 않는다. 세부값은 docs/engine/qa/regional-font-assets-20261026.json의 unityImportMetaAudit에 기록했다.
