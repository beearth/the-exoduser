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


## 2026-10-29 22시 중앙 CTO 정책·인수 안내 수신 후 결과 회수

새 작업/새 Unity 시작 지시로 해석하지 않고 기존 승인 단위의 결과를 회수했다. 이 확인에서 Unity·브라우저·빌드·Player 새 실행0, 새 worktree0, 비용·삭제·OS 설정·배포0, CTO_STATE 쓰기0이다.

| 구분 | 회수·보존 판정 |
|---|---|
| 현재 소유 | G:/exoduser-wt/codex-unity-visual, codex/pc-unity-visual-ntfs-20261029, 확인 시 HEAD e87453039, INDEX 비어 있음. 사용자 G:/exoduser는 읽기만 |
| 실행/배경 | policy-audit.stdout.log의 13:58:47Z 조회에서 Unity/UnityPackageManager/EXODUSER-Unity 프로세스0, queue/_tickets 비어 있음. 다른 Node/PowerShell 프로세스는 종료하거나 소유를 단정하지 않음 |
| 자원 조회 | G/E NTFS, I exFAT. 조회 시 커밋여유29.24GiB, G676152524800/E1173196222464바이트 여유. 새 실행을 위한 예약/보장 수치로 사용하지 않음 |
| NTFS 실제 입력 | 기존 actual-child-boundary.json: 프로젝트·Library G, DOTNET_CLI_HOME E:/exoduser-wt/_dotnet-home, UPM_CACHE_ROOT E:/exoduser-wt/_upm-cache. I는 산출물·로그·보관 |
| UPM | 기존 upm.log 13:01:25.044Z IPC 시작, 13:01:37.462Z list-packages200, 13:01:51.716Z resolve-packages200. 환경 상속도 바뀌었으므로 exFAT 단독 원인 확정0 |
| 이후 독립 게이트 | 기존 Win 빌드8e05c001 컴파일0/빌드오류0, Player1dbb47b3 정상종료/M1 23/23, RM-INT16b5187b 해시동일을 회수. startup만으로 이 단계를 대체하지 않음 |
| 시각 | 기존 최종 후보의6개 compare 이미지와1x 판정 유지. 6건 큰차이 해소 범위 PASS / 전체맵 RETOUCH / 독립총괄검수 미실행 |
| 두 MP4.meta | world_intro_v22b_steam.mp4.meta와 warrior_story_v23_clean.mp4.meta는 현재HEAD·착수입력 바이트동일. 자동임포트 재작성본은 import-generated에 별도 보관, 두-MP4메타-인수확인.json에 원본/사본 SHA. 동영상 본체 변경0 |
| runner/docs | NTFS 기본홈 복원은 이미2eba4c2e8에 소유 코드+관련docs로 커밋됨. 이번 확인 시 두 경로의 미커밋diff0. 당시 TagManager 별도 파서 문제는8b6dafd6f에서 명시적 빈 레이어로 수정한 뒤 최종빌드 재발0 |
| guard/old I | 현재 G와 old I 모두 tools/guard.baseline.json WORK 변경을 보존. old I HEAD2897a54bc/기존 webparity 브랜치, 정확 대상만 --no-optional-locks로 읽음. old I 변경·인덱스갱신·이동·삭제0 |
| 이전 실패 | alpha-20261029의 실패 로그/카운터/영수증 유지. NTFS단계는 별도 경로·실행id로 기록하며 과거실패를 없애거나 같은원인 재시도 명칭만 바꾸지 않음 |
| 통합·실행본 | 지정 unity-integrator 게이트 유지. 이번 안내를 통합역할 지정으로 간주하지 않으며 직접 unity/main push·바로가기변경0. 새 비용/삭제/OS설정/배포0 |

근거: I:/EXODUSER-Storage/unity-visual/ntfs-20261029의 policy-audit.stdout.log, 두-MP4메타-인수확인.json, old-I-인수시점-읽기전용상태.json, actual-child-boundary.json, upm.log, 최종-검수영수증.json 및 기존 _exec/done/1dbb47b3.json·16b5187b.json. 이 절은 기존 결과 회수 기록이며 새 실행 영수증이 아니다.
