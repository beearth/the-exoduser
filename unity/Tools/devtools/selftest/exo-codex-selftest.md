# exo-codex 자체 점검 (2026-10-28)

실행: `powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -File unity\Tools\devtools\selftest\exo-codex-tests.ps1`. Unity, 게임, 브라우저, `codex exec`는 실행하지 않았다. 구문 검사는 원본 스크립트에, DryRun·잠금·백그라운드 검사는 **기록 루트만 워크트리 내부 임시 경로로 바꾼 사본**에 적용했다. 시험 임시 잠금·사본·실행 폴더는 점검 종료 후 삭제했다.

| 명령·검사 | 기대 | 실제 |
|---|---:|---:|
| `[System.Management.Automation.Language.Parser]::ParseFile(exo-codex.ps1)` | 구문 오류 0 | 0 |
| 원본 `run -Worktree G:\exoduser -Brief <시험 브리프> -Name selftest-main` | 종료 2 | 2 |
| 원본 `run -Worktree <현재 워크트리> -Brief <시험 브리프> -Name BAD_NAME` | 종료 2 | 2 |
| 숨김 `Start-Process codex.cmd --version`, 빈 stdin 파일·표준 출력/오류 분리 | 종료 0 | 0 |
| 경로 치환 사본 `run -Worktree <현재 워크트리> -Brief <시험 브리프> -Name selftest-dryrun -DryRun` | 종료 0, `brief.md`·`prompt.md`·`meta.json` 생성 | 0, 3개 생성 확인 |
| 경로 치환 사본, 현재 PowerShell PID의 임시 잠금 존재 시 같은 `run -DryRun` | 종료 4 | 4 |
| 경로 치환 사본, 살아 있는 임시 잠금 3건 존재 시 `run -Name selftest-cap -DryRun` | 종료 4 | 4 |
| 경로 치환 사본 `run -Name selftest-background -DryRun -Background` | 시작 0, 자식 `meta.json`에 DryRun 종료 0 | 0, 기록 확인 |
| 원본 `run -Name selftest-dryrun -DryRun`, `I:\EXODUSER-Storage\codex-runs\` 생성 확인 | 종료 0 | **미실행** — 이번 작업의 워크트리 밖 쓰기·삭제 금지 지시와 충돌 |

`codex.cmd exec --help`에서 긴 프롬프트를 파일로 직접 지정하는 옵션은 없었다. `[PROMPT]` 인수 또는 stdin을 지원하며, 인수와 파이프 stdin을 함께 주면 stdin이 추가된다. 실행기는 `prompt.md`를 I: 실행 폴더에 만들고 그 파일을 읽으라는 짧은 `[PROMPT]` 인수를 전달한다. stdin은 빈 파일로 닫는다. 도움말과 버전 조회만 했고, 실제 Codex 작업 실행·타임아웃 종료·실제 I: 잠금은 검증하지 않았다.
