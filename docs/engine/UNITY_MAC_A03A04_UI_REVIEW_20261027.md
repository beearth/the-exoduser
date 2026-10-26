# Mac Unity A03/A04 통합 UI 실창 검수 — 2026-10-27

## es 긴 문구 배치 수리 후보

이전 1280×720 실창 `es-visual-long.png`의 우측 첫 특성 제목/본문과 하단 클래스 라벨 겹침을 대상으로 `NativeLobby.CharacterPresentation.cs`의 **표시 배치만** 고쳤다. 첫 수정본은 ARM64 빌드 자체는 성공했으나 1280×720 실창에서 겹침이 남았다. `GUIStyle.CalcHeight`가 실제 줄바꿈 높이를 충분히 반환하지 않은 관측에 맞춰 줄폭을 단어 단위로 계산하고 긴 단어는 글자 단위로 세는 보수적 높이 측정을 더했다. 각 특성 행은 다음 행과 겹치지 않게 누적하고, 특성 패널은 하단 직업 레일 시작 8px 전까지만 확장한다. 더 낮은 화면에서 내용이 남으면 패널 내부 스크롤을 사용하며 직업 라벨은 번역 줄 수만큼 높이를 확보한 뒤 `출시 준비 중`을 2px 아래에 둔다. 문구·특성/클래스 폰트 크기·선택/버튼 Rect·캐릭터 수치·저장 처리는 변경하지 않았다.

| 항목 | 기존 | 후보 | 적용 위치 |
|---|---:|---:|---|
| 특성 제목 | 21px 고정 | 번역별 `max(21, ceil(CalcHeight), 줄수×lineHeight+3)` | 우측 특성 3행 |
| 특성 본문 | 행 높이에서 제목 22px 제외 | 번역별 `max(34, ceil(CalcHeight), 줄수×lineHeight+3)` | 우측 특성 3행 |
| 특성 행 | 720p 74.75px / 1080p 79.031px 고정 간격 | `max(기존 간격, 제목+2px+본문+7px)` 누적 | 우측 특성 3행 |
| 패널 높이 | 720p 312.75px / 1080p 325.594px | 최소 기존 높이와 내용 높이를 비교하고 레일 위 8px까지 제한; 초과분 내부 스크롤 | 우측 특성 패널 |
| 클래스 라벨 | 18px 고정, 다음 줄 +18px | `max(18, ceil(CalcHeight), 줄수×lineHeight+3)`, 다음 줄 +2px·18px | 하단 5직업 레일 |
| 출시 안내 | 클래스와 같은 13px 굵은 줄바꿈 | 11px 일반 굵기·한 줄 18px | 하단 잠금 4직업 레일 |

두 번째 ARM64 후보 `ace149c9c`는 1280×720 실창에서 es 제목/본문의 직접 겹침을 없앴으나, 세 번째 본문까지 보려면 패널 스크롤이 필요했고 세로 스크롤바 때문에 가로 스크롤바도 생겼다. ko/en/ja 특성은 직접 겹치지 않았고, ja/es 레일은 클래스와 출시 문구의 줄 정렬을 더 다듬을 필요가 있었다. 세 번째 후보 `9774d2cf7`는 스크롤 내용 폭을 viewport보다 18px 좁히고 본문 폭도 2px 줄여 가로 스크롤을 제거했다. 스페인어 `Próximamente`는 13px 굵은 글꼴의 98px 레일에서 두 줄이 18px Rect 안에 잘리는 것을 확대 화면에서 확인했다. 출시 안내만 11px 일반 굵기의 단일 줄 스타일로 고치고 클래스 글꼴 13px와 링/버튼 Rect는 유지한다. `-screen-width 1024 -screen-height 576` 요청 실행도 창 캡처는 1280×784(내용 1280×720)로 남아 1024×576 화면 증거로 쓰지 않는다. 원인 확인·첫 화면 증거는 아래 첫 QA 결과를 따른다. 수정 후보의 ARM64 실창 재검수 전이므로 아직 VISUAL PASS로 바꾸지 않는다.

## 최종 재검수 판정 — source `c03f20489`

Unity 6000.6.7f1 고유 QA identity의 ARM64 네 번째 후보 `build4`는 `passed=true`, `Succeeded`, errors 0, C# `error CS`/`warning CS` 0이다. 기존 UAC1001만 남았다. 실제 1280×720 내용(캡처 1280×784)의 `es-release-final.png`에서 세 특성 제목/본문은 서로 겹치지 않고 패널 경계 안에 있으며, 가로 스크롤바는 없다. 넘치는 내용은 세로 스크롤바로 표시한다. 확대 캡처 `es-release-final-rail-crop.png`에서 네 `Próximamente`가 한 줄로 보이고 클래스 이름과 겹치거나 잘리지 않는다. 최종 `ko-final.png`, `en-final.png`, `ja-final.png`도 같은 1280×720 내용에서 특성·클래스/출시 안내의 직접 겹침이 없다. **A04 목표 es 1280×720 VISUAL VERDICT: PASS.** 버튼 클릭·스크롤 조작의 기능 PASS는 이 화면 증거만으로 주장하지 않는다.

`-screen-width 1024 -screen-height 576`로 다시 실행해도 캡처는 1280×784였고, 그 시도는 이전 언어 선택 상태 때문에 노르웨이어를 표시했다. 해당 파일 `es-final-1024.png`는 좁은 화면 및 es 증거에서 제외한다. 1024×576 화면, 그 화면의 버튼 hitbox·스크롤 조작·패널 경계는 **HOLD**다. CUA 좌표 입력은 앞선 동일 QA 앱의 기본 버튼에도 작동하지 않았고 이번 scroll 시도도 시각 변화가 없어 A03 패치노트 modal/뒤입력 차단 GUI 관문도 **HOLD**다. 물리 마우스 실패로 추론하지 않는다.

실행 파일에 직접 `--unity-frontend-review -output <QA>`를 지정해 띄운 PID 16974, 17150, 17362, 17389, 17550과 별개로 CUA app binding 뒤 같은 고유 QA build 경로의 무플래그 PID 16978, 17169, 17363, 17551이 확인됐다. CUA가 LaunchServices를 통해 만든 것인지 원인은 미확정이며, 따라서 실창 캡처의 격리 인자 귀속과 저장 회귀는 주장하지 않는다. 이 네 PID를 명시적으로 종료했고 종료 후 QA 실행 프로세스는 0, 기존 사용자 앱 PID38141·48476·52157은 계속 실행 중이다. 원래 사용자 파일은 열지 않았다. Unity import가 변경한 tracked 413개는 `build4-generated.patch`에, 신규 2개는 `build4-generated-untracked.tar.gz`에 보존한 뒤 HEAD bytes로 복원했다. Git reset/checkout은 사용하지 않았다.

## QA 후보 빌드 계약

`PortVerification.Build`의 `-a03a04UiQa true`는 이번 통합 UI 검수 전용이다. `-settingsQa true`와 동시 지정은 거부한다. `StandaloneOSX`는 기존대로 ARM64, 출력명은 고유 `_out` 아래 `EXODUSER-Unity.app`이다. 이 QA 분기에서만 productName `EXODUSER A03 A04 QA`, applicationIdentifier `com.fordeargamers.exoduser.a03a04qa20261027`, identifier override `true`로 빌드하고 `finally`에서 원래 product/id/override를 복원한다. 빌드 영수증에 `uiQa`·product·identifier·architecture를 기록한다. 일반 빌드와 기존 Settings QA의 값은 그대로다.

검수 실행은 **이 고유 앱의 Contents/MacOS 실제 실행 파일**에 `--unity-frontend-review -output /Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A03A04-UI-20261027/player-data`를 지정한다. `NativeSettingsStorageScope.IsQa`는 `-review`일 때 설정 store 초기화를 건너뛰며, `NativeLobby.CharacterStore`는 새 절대 output 하위 `character-roster-v1`만 사용한다. 앱 identity가 별도라 Unity PlayerPrefs 네임스페이스도 분리된다. 기존 사용자 앱과 개인 저장 파일은 열거나 종료하지 않는다. 이 분기의 코드 변경은 Editor 빌드 정체성에만 있으며 A03/A04 일반 UI 경로에는 영향을 주지 않는다.

## 빌드·실창·입력 결과

빌드 소스 SHA `8bcba21b4`, Unity `6000.6.7f1`, 명령은 `-batchmode -nographics -quit -projectPath <Mac worktree>/unity -buildTarget OSXUniversal -executeMethod PortVerification.Build -a03a04UiQa true -output <QA>/build -receipt <QA>/build-receipt.json -logFile <QA>/build.log`이다. `<QA>`는 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A03A04-UI-20261027`다. 이 소스로 ARM64 후보 **1회** 빌드했다. 영수증 `passed=true`, `Succeeded`, 오류 0, `2,176,431,063` bytes, Info.plist `CFBundleIdentifier=com.fordeargamers.exoduser.a03a04qa20261027`, `CFBundleExecutable=EXODUSER A03 A04 QA`를 확인했다. C# `error CS`·`warning CS` 0, 기존 UAC1001 2회만 로그에 있다. 빌드 import가 만든 tracked `.meta` 411개·씬·ProjectSettings를 HEAD bytes로 되돌리고 신규 `.meta`·SceneTemplateSettings 2개는 별도 archive 뒤 제거했다. 생성 당시 차이는 `<QA>/build-generated.patch`와 `build-generated-untracked.tar.gz`에 보존한다. Git reset/checkout은 사용하지 않았다.

| 관문 | 결과 | 실제 증거·한계 |
|---|---|---|
| 대상 창 안전 식별 | PASS | 고유 bundle ID가 CUA 실행 앱 목록에 `isRunning=true`로 표시된 뒤 그 ID만 `getApp`으로 선택했다. 창 제목 `EXODUSER A03 A04 QA`, 실행 PID15958과 재실행 PID16141 모두 `--unity-frontend-review -output <QA>/player-data` 및 1280×720 인자가 일치한다. `player-launch.json`·`player-reopen.json`·`qa-results.json` |
| 저장 분리 | 코드 가드 및 QA 출력 확인 | `--unity-frontend-review`에서는 native settings store 초기화를 건너뛰고 roster를 `<QA>/player-data/character-roster-v1`로 보낸다. 실제 QA roster revision1·`QA27` 한 명을 만들고 취소 뒤 보존했다. 일반 사용자 파일은 열지 않았으며 전체 시스템 파일 추적은 하지 않았다 |
| A03 패치노트 | **실창 미검증** | 로비 좌상단 v0.7.5 launcher는 보였으나 CUA 좌표 클릭은 해당 launcher와 기존 언어·생성·삭제 버튼 모두 활성화하지 못했다. 키보드 N/L/Delete는 동작했다. launcher를 열지 못해 modal/닫기·뒤입력 차단 PASS를 주장하지 않는다. 독립 JSON 검사: 본문 0.7.5/0.7.0, 29언어×3키=87 |
| A04 ja | PASS 범위 | 키보드 L→ja, 생성 시각선택의 일본어 제목·특성·단추와 일본어 이름 대화상자를 실제 창에서 확인. 이름 입력 없이 Esc로 취소. `ja-name.png` |
| A04 es 긴 문구 | **RETOUCH** | 스페인어 시각선택 우측 첫 특성 제목이 본문과 겹치고 하단 클래스 라벨도 두 줄이 겹치거나 잘린다. 고정 21px 특성 제목 및 18px 레일 라벨 높이보다 번역이 길다. 이름 대화상자 스페인어는 표시됐다. `es-visual-long.png` |
| 생성·삭제 취소 | PASS 범위 | 격리 roster에 `QA27`을 만든 뒤 Delete로 확인창을 열었다. 기본 선택은 우측 취소; Return 및 재개방 후 Esc 모두 목록 1/5·QA27 유지. 실제 삭제 0. `ko-delete-default-cancel.png`·`ko-roster-after-cancel.png` |

CUA의 네 좌표 클릭은 커서만 이동하고 Unity GUI 동작을 만들지 않았다. 이는 이 자동화 경로의 관측이며 사람의 물리 마우스까지 실패했다고 판정하지 않는다. 따라서 A03 실창 PASS와 A04 긴 문구 visual PASS는 보류한다. **VISUAL VERDICT: RETOUCH.** World 32큐·전투·일반 사용자 실행은 이 관문에 포함하지 않았다.

종료 시 PID15958에 Cmd+Q를 보낸 직후 같은 고유 QA identity의 **무플래그 PID16094**가 나타나 즉시 종료했다. 자동 재실행의 원인은 단정하지 않는다. 두 번째 격리 인자 PID16141만 다시 실행해 삭제 취소를 확인한 뒤 종료했고 세 QA PID는 모두 종료 상태다. 기존 앱 PID38141·48476·52157은 계속 실행 중이다. 이 무플래그 실행은 별도 QA identity였지만 `<QA>/player-data` 인자를 사용하지 않았으므로 그 세션은 검수 증거에서 제외한다. 고유 ID와 개인 파일 비열람 경계를 유지했다.
