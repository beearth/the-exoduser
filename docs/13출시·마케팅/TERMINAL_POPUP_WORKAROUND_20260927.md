# Windows 콘솔 팝업 임시 조치 — 2026-09-27

사용자 요청: Codex를 종료하거나 진행 중인 작업을 끊지 않고 반복 콘솔 팝업으로 인한 채팅·작업 방해를 줄인다. 기본 터미널을 Windows 콘솔 호스트로 변경해도 창 형태만 달라졌고 증상이 지속됐다.

| 항목 | 적용·확인 내용 |
|---|---|
| 예약 자동 정리 | `ExoduserAutoCleanup50` 삭제. 재등록 금지 |
| 터미널 설정 | `HKCU\Console\%%Startup`의 `DelegationConsole`, `DelegationTerminal` 모두 `{B23D10C0-E52E-411E-9D5B-C09FDF709C7D}`. 기존 값 백업: `tmp/terminal-settings/before-20260927-171345.json` |
| 에이전트 명령 | Windows PowerShell 전체 경로 + `tty:true`, `login:false`. 표시 창 없는 명령 실행은 확인했으나 다른 세션·내부 준비 프로세스까지 해결하지 못함 |
| 임시 보조 도구 | 로컬 운영 파일 `tmp/terminal-settings/codex-console-guard.py`. `C:\Python314\pythonw.exe`로 숨김 실행. 게임 런타임에 연결하지 않음 |
| 대상 | 창 클래스가 `ConsoleWindowClass`이고, 소유 프로세스의 최대 24단계 부모 경로에 `codex.exe` 또는 `codex-command-runner*`가 있는 창 |
| 동작 | 창 표시 이벤트 감시 + 0.05초 주기 보조 확인. 대상 창에 `ShowWindowAsync(hwnd, 0)` 적용. 프로세스 종료·입력 전송·작업 취소 없음 |
| 제외 | Windows Terminal 창, VS Code UI, Codex 부모 경로가 없는 일반 사용자 콘솔 |
| 확인된 사례 | `codex-windows-sandbox-setup.exe` → `codex.exe` 부모 관계의 콘솔을 감지하고 숨김 호출. 시작 후 상태 기록에 `hiddenCount:1`, `errors:[]` 확인 |
| 기록 | `tmp/terminal-settings/guard-status.json`, `guard-error.log`. 상태는 약 1초마다 갱신 |
| 종료 | 시작 후 8시간 또는 `tmp/terminal-settings/guard.stop` 파일 생성. 자동 시작·예약 작업 등록 없음 |
| 복원 | 정상 종료 시 아직 살아 있고 소유 PID와 Codex 부모 관계가 일치하는 숨긴 창을 활성화 없이 다시 표시 |
| 한계 | 창 생성 자체를 차단하는 근본 수정이 아니다. 표시 이벤트를 처리하기 전 순간 노출·포커스 이동 가능성이 남는다. 숨김 호출 기록만으로 사용자 체감 해결을 확정하지 않는다 |

중지하려면 PowerShell에서 `New-Item -ItemType File -Path G:\exoduser\tmp\terminal-settings\guard.stop -Force`를 실행한다. 다시 실행하려면 보조 도구가 정지했는지 확인 후 중지 파일을 제거하고 명시적으로 시작한다.

## 2026-09-29 재발 진단

Edge에서도터미널깜빡임과간헐프레임급락이보고됐다. 150.518초관측에서setup8개/conhost18개신규생성,setup7개의부모Codex31780과VS Code경로확인. `.sandbox/sandbox.2026-09-28.log`에서도같은시각setup refresh·정상완료를확인했다. 창생성개수는실제표시된창개수가아니며,Edge설정화면일시정지표본에서는포커스변화0이었다. 심한전투급락과인과관계·팝업수정완료미확정.

ExoduserAutoCleanup50단독조회는지정경로없음(exit1),재등록0. 기존8시간guard의현재실행/효과를확정하지않고재실행하지않았다. 상세근거·관측부하·현행32GiB페이지파일은 [Edge·터미널환경진단](../12퍼포먼스·최적화/EDGE_TERMINAL_FRAME_DIAG_20260929.md)을따른다. PowerShell provider는지정시스템shell에도WindowsApps pwsh를시작하려다OS317로실패했고,CMD/직접패치/파일읽기는작동했다. 별도.ps1실행정책거부를우회하거나보안설정을완화하지않았다.
