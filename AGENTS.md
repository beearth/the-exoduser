# AGENTS.md — 지옥의 길 (EXODUSER)

이 저장소의 규칙은 [CLAUDE.md](CLAUDE.md)다. 작업 전에 먼저 읽고 따른다. Codex·Claude·서브에이전트 모두 같다.
main과 unity/main의 AGENTS.md·CLAUDE.md는 같은 본문이다. docs 정본은 origin/unity/main이다.

## Codex 실행 설정 (11-04까지)

11-05부터 Codex에는 새 일을 배정하지 않는다(11-03 사용자 결정). Codex 레인이 끝나면 이 절을 지운다.
- Windows `exec_command`는 `shell: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'`, `tty: true`, `login: false`로 실행한다. 콘솔 창이 뜨지 않는 조합이다.
- 백그라운드 `Start-Process`에는 `-WindowStyle Hidden`을 붙인다.
- PowerShell이 시작되지 않으면 `cmd.exe`(`tty: false`)나 Node(`C:\nvm4w\nodejs\node.exe`)로 계속한다. 상세: [터미널 장애 대체 절차](docs/0마스터플랜/TERMINAL_FAILURE_FALLBACK.md).
- 브리프에 적힌 worktree와 소유 파일만 고친다.
