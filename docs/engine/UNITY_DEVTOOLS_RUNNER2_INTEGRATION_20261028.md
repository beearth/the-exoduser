# Unity 실행기 runner2 통합 기록 — 2026-10-28

## 변경 계약

| 항목 | 통합 값 | 적용 위치 |
|---|---|---|
| Player 기본 데스크톱 | `hidden` | `unity/Tools/devtools/exo-unity.ps1` |
| Player 명시적 배치 모드 | `-Desktop batch` 또는 전달 인자의 `-batchmode` | 같은 실행기 |
| 숨은 데스크톱 | `HiddenDesktop.psm1`의 별도 Windows 데스크톱, 종료 시 핸들 닫기 | `exo-unity.ps1`, `buildloop/desktop-probe.ps1` |
| 기본 해상도 | 숨은 Player에서 별도 지정이 없으면 1600×900, 전체 화면 0 | `exo-unity.ps1` |
| 빌드 인자 | 쉼표 문자열·배열·JSON을 먼저 분해한 뒤 `-buildTarget Win64` 추가 | `exo-unity.ps1` |
| .NET CLI 홈 기본 경로 (2026-10-29 저장 정책) | `I:/EXODUSER-Storage/dotnet-cli-home` — `start`·`run`에서 자식 환경의 `DOTNET_CLI_HOME`으로 지정. 과거 E: 경로는 당시 검증 기록에만 남긴다 | `exo-unity.ps1`의 `Set-DotnetEnv` |

인자 해석 자체 시험 `selftest/args-test.ps1`은 run·build·player의 14개 입력 형식에서 14개 통과했다. 첫 숨은 Player M1에서 게임 단계 자체는 22개 통과했으나 실행기 판정은 실패했다. 원인은 별도 데스크톱의 정상 창을 `MainWindowHandle` 검사로 사용자 창으로 오인한 것과 `Get-Process` 객체에서 종료 코드를 읽어 `null`이 된 것이다. 숨은 모드에서는 별도 데스크톱의 창을 위반 목록에서 제외하고, 해당 프로세스 핸들에서 종료 코드를 읽도록 수정했다.

동일 설치 Player로 한 번 재실행한 결과 M1 22/22, 종료 코드 0, 사용자 데스크톱 창 감지 0, 남은 프로세스 0, 사용자 세이브 변경 0, 숨은 데스크톱 창 최대 9개와 종료 처리 참을 확인했다. `13-stage-clear.png`의 실제 UI·HUD를 직접 확인했다. 정확한 통합 SHA의 Unity 6000.6.7f1 빌드와 관련 oracle은 별도 영수증으로 판정한다. 숨은 데스크톱의 UI 캡처도 사람의 조작 검수나 디자인 최종 판정을 대체하지 않는다.

## 배치 로그 읽기 실패 처리 — 2026-10-29

| 조건 | 실행기 판정 | 후처리 |
|---|---|---|
| 배치 로그 정상 읽기 | 기존 refresh/compile/오류/크래시 파싱과 종료 코드 판정 유지 | 사용자 세이브 전후 대조 후 `done/<id>.json` 작성 |
| 로그 없음 | `ok=false`, `note=로그 파일이 없음` | 같은 후처리 실행 |
| 로그 잠김 또는 읽기 오류 | `ok=false`, `note`와 `exception`에 읽기 실패 종류·메시지 기록 | 같은 후처리 실행 |

`Parse-BatchLog`의 로그 읽기 예외가 `Cmd-Run`을 탈출하여 세이브 대조와 완료 JSON 작성을 건너뛰던 문제를 수정했다. `selftest/batchlog-read-test.ps1`은 실제 `FileShare.None` 잠금으로 수정 전 IOException을 재현하고, 수정 후 실패 결과·비정상 종료 코드·정상 로그 파싱·가짜 `I:` 프로필의 `USER_SAVE` 변경 감지·완료 JSON을 확인한다. 이 시험은 Unity를 실행하지 않으며 2026-10-29 UPM 시작 실패의 원인을 밝힌 것은 아니다. 해당 과거 실행의 실행 전 세이브 스냅샷이 없어 변경 0으로 소급 판정하지 않는다.
