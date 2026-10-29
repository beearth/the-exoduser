# Unity 실행기 runner2 통합 기록 — 2026-10-28

## 변경 계약

| 항목 | 통합 값 | 적용 위치 |
|---|---|---|
| Player 기본 데스크톱 | `hidden` | `unity/Tools/devtools/exo-unity.ps1` |
| Player 명시적 배치 모드 | `-Desktop batch` 또는 전달 인자의 `-batchmode` | 같은 실행기 |
| 숨은 데스크톱 | `HiddenDesktop.psm1`의 별도 Windows 데스크톱, 종료 시 핸들 닫기 | `exo-unity.ps1`, `buildloop/desktop-probe.ps1` |
| 기본 해상도 | 숨은 Player에서 별도 지정이 없으면 1600×900, 전체 화면 0 | `exo-unity.ps1` |
| 빌드 인자 | 쉼표 문자열·배열·JSON을 먼저 분해한 뒤 `-buildTarget Win64` 추가 | `exo-unity.ps1` |
| .NET CLI 홈 기본 경로 (2026-10-29 NTFS 예외) | `E:/exoduser-wt/_dotnet-home` — `start`·`run`에서 자식 환경의 `DOTNET_CLI_HOME`으로 지정. Unity 프로젝트·Library·UPM 캐시도 NTFS를 사용하며 I:는 빌드·캡처·로그·보관용이다. 시작 성공 여부는 별도 검수한다 | `exo-unity.ps1`의 `Set-DotnetEnv` |

인자 해석 자체 시험 `selftest/args-test.ps1`은 run·build·player의 14개 입력 형식에서 14개 통과했다. 첫 숨은 Player M1에서 게임 단계 자체는 22개 통과했으나 실행기 판정은 실패했다. 원인은 별도 데스크톱의 정상 창을 `MainWindowHandle` 검사로 사용자 창으로 오인한 것과 `Get-Process` 객체에서 종료 코드를 읽어 `null`이 된 것이다. 숨은 모드에서는 별도 데스크톱의 창을 위반 목록에서 제외하고, 해당 프로세스 핸들에서 종료 코드를 읽도록 수정했다.

동일 설치 Player로 한 번 재실행한 결과 M1 22/22, 종료 코드 0, 사용자 데스크톱 창 감지 0, 남은 프로세스 0, 사용자 세이브 변경 0, 숨은 데스크톱 창 최대 9개와 종료 처리 참을 확인했다. `13-stage-clear.png`의 실제 UI·HUD를 직접 확인했다. 정확한 통합 SHA의 Unity 6000.6.7f1 빌드와 관련 oracle은 별도 영수증으로 판정한다. 숨은 데스크톱의 UI 캡처도 사람의 조작 검수나 디자인 최종 판정을 대체하지 않는다.

## 2026-10-29 NTFS 재개 검수

- `2897a54bc`의 I: .NET 홈 지정 한 줄을 기존 NTFS `E:/exoduser-wt/_dotnet-home`으로 되돌렸다. I:가 exFAT인 실제 조회와 최신 인계서의 Unity NTFS 예외를 적용한다. 잠금·세이브 보호·무창 정책은 그대로다.
- G: 작업본의 노빌드 startup `f8eca84f`: Unity 6000.6.7f1 종료 0, `ExoProbe.Run` 도달, 전체 스크립트 컴파일 오류 0, USER_SAVE 변경 0. UPM IPC 시작·패키지 resolve 200 확인. Library는 G:, 소유 호출의 UPM 캐시는 E:로 지정했다.
- 실제 호출은 CMD→Node→숨김 PowerShell이며 APPDATA·LOCALAPPDATA·COMSPEC을 포함한 기존 환경을 상속했다. 과거 제한 환경과도 차이가 있어 exFAT 단독 원인 확정은 아니다. `TagManager.asset` 파서 오류가 별도로 남아 빌드 검수 전 수정할 대상이다.
- 근거: `I:/EXODUSER-Storage/unity-visual/ntfs-20261029/`의 `preflight.stdout.log`, `actual-child-boundary.json`, `upm.log`, `startup-result.json`; 실행기 원본 로그 `unity-jobs/codex-unity-visual/logs/f8eca84f.log`. Win 빌드·Player·시각 검수는 이 startup의 증거에 포함하지 않는다.

- startup에서 발견한 `TagManager.asset`의 빈 레이어 항목(`-` 단독)을 명시적 빈 문자열(`- ''`)로 정규화한다. 32개 레이어 이름·인덱스·Default sorting layer의 값은 보존하며 Unity YAML 파서 오류의 제거는 다음 빌드 로그로 확인한다.
