# Unity 실행기 runner2 통합 기록 — 2026-10-28

## 변경 계약

| 항목 | 통합 값 | 적용 위치 |
|---|---|---|
| Player 기본 데스크톱 | `hidden` | `unity/Tools/devtools/exo-unity.ps1` |
| Player 명시적 배치 모드 | `-Desktop batch` 또는 전달 인자의 `-batchmode` | 같은 실행기 |
| 숨은 데스크톱 | `HiddenDesktop.psm1`의 별도 Windows 데스크톱, 종료 시 핸들 닫기 | `exo-unity.ps1`, `buildloop/desktop-probe.ps1` |
| 기본 해상도 | 숨은 Player에서 별도 지정이 없으면 1600×900, 전체 화면 0 | `exo-unity.ps1` |
| 빌드 인자 | 쉼표 문자열·배열·JSON을 먼저 분해한 뒤 `-buildTarget Win64` 추가 | `exo-unity.ps1` |

인자 해석 자체 시험 `selftest/args-test.ps1`은 run·build·player의 14개 입력 형식에서 14개 통과했다. 첫 숨은 Player M1에서 게임 단계 자체는 22개 통과했으나 실행기 판정은 실패했다. 원인은 별도 데스크톱의 정상 창을 `MainWindowHandle` 검사로 사용자 창으로 오인한 것과 `Get-Process` 객체에서 종료 코드를 읽어 `null`이 된 것이다. 숨은 모드에서는 별도 데스크톱의 창을 위반 목록에서 제외하고, 해당 프로세스 핸들에서 종료 코드를 읽도록 수정했다.

동일 설치 Player로 한 번 재실행한 결과 M1 22/22, 종료 코드 0, 사용자 데스크톱 창 감지 0, 남은 프로세스 0, 사용자 세이브 변경 0, 숨은 데스크톱 창 최대 9개와 종료 처리 참을 확인했다. `13-stage-clear.png`의 실제 UI·HUD를 직접 확인했다. 정확한 통합 SHA의 Unity 6000.6.7f1 빌드와 관련 oracle은 별도 영수증으로 판정한다. 숨은 데스크톱의 UI 캡처도 사람의 조작 검수나 디자인 최종 판정을 대체하지 않는다.
