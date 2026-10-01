# BUILD-CLAUDE-CONTROL-DISCOVERY

## 수신·착수·완료

기존 BUILD 세션 유지(총괄 배정 ID `01a0f6e6-2e4c-7322-92d7-3aa309857856`, 런타임 대조 없음). 수신/착수2026-10-01T12:03:08Z, 도움말 조사 완료2026-10-01T12:03:18Z.

NEXT_TASK、BUILD-next-result/receipt와 담당 폴더 목록을 먼저 읽었다. 이전 NW 인수묶음은 완료·root 실환경 게이트 대기이며 해당 작업을 재실행하지 않았다. control-discovery 산출은 목록에 없어 이번 명시 배정 한 건만 조사했다. `command -v claude`는 `/Users/fordeargamers/.local/bin/claude`를 반환했다.

## 실제 도움말 명령·결과

| 명령 (확인한 절대 실행 경로 사용) | exit | 명시된 지원 |
|---|---:|---|
| `claude --help` | 0 | 기본 interactive 실행; agents는 background 관리; attach는 background session 열기; resume/continue는 대화 재개; input-format은 print 모드 전용 |
| `claude agents --help` | 0 | `--json`은 active interactive/background 세션의 JSON 조회·종료; `--all`은 JSON에 완료 background 추가. 나머지 관련 옵션은 dispatched 세션 설정이며 기존interactive 대상 전송 명령이 아님 |
| `claude attach --help` | 0 | `Usage: claude attach <id>` / `Open the background session in this terminal.`. background 전용 설명이며 prompt/message/send 인수는 명시되지 않음 |

도움말 핵심 원문:

```text
--json  Print active sessions (interactive and background) as a JSON array and exit
attach <id>  Open a background session in this terminal.
--input-format <format>  Input format (only works with --print)
--remote-control [name]  Start an interactive session with Remote Control enabled
```

도움말에 `send`/`message`/기존interactive 세션에 전송하는 별도 command가 없었다. agents의interactive 조회 지원은 attach의interactive 지원을 의미하지 않는다. installed 버전 문자열은 별도 --version을 실행하지 않아 미확인이다. 이 판정은 위 설치 경로의 실제 세 도움말 출력에 한정한다.

## 판정표

| 경로 | 판정 | root 인계 |
|---|---|---|
| 기존 background attach | 도움말상 지원 | background ID를 현재터미널에 여는 경로. 이번 조사에서 attach 또는 입력하지 않음. 공식 일회성 메시지 전송 API로 표현하지 않음 |
| 기존 interactive attach | 명시 지원 없음 | attach 설명이 background로 한정. interactive용 사용법은 이 도움말에서 확인되지 않음 |
| agents --json | interactive 포함 읽기 조회 지원 | 목록 조회일 뿐 입력 경로 아님. 이번 배정은 help만 조사하므로 inventory도 실제 실행하지 않음 |
| print/input-format/replay-user-messages | 요청 조건 충족 경로 미확인 | print 세션 입력/출력 옵션이며 기존 실행중interactive에 새writer 없이 전송한다고 명시하지 않음. 실행하지 않음 |
| resume/continue/bg/remote-control | 허용 대안 아님 | 대화 재개/새 실행 또는 기능 활성화를 기존writer에 메시지를 전달하는 것으로 추정하지 않음. 사용자 금지에 따라 미실행 |

**결론: 기존 interactive ENEMY에 새세션·새writer 없이 메시지를 전달하는 공식 명령은 조사한 도움말에 명시돼 있지 않다. CLI 전체에 절대로 없다고 단정하지 않으며 미확인으로 인계한다.** 현재 조건을 만족하는 실행 방법을 발견하지 못했으므로 root에 직접 실행할 메시지 전송 명령을 제시하지 않는다.

## 사용자 인계 관측과 제약

사용자 인계: SOUND background `aa3ac0ed` attach 성공, interactive ENEMY `ddbd64be` attach `No job` 실패, Mac 잠금으로 UI 입력 불가. 이 관측은 background attach 설명과 부합하나 이번 세션에서 재현/대조하지 않았다. ENEMY 종료·부재를 `No job`만으로 추론하지 않는다.

root가 잠금/공식 지원 게이트를 해소할 때까지 interactive 메시지 전달은 미완료다. 이번 작업은 발견 조사 완료이며 팀 지시 전달 완료가 아니다. 지원되는 background attach 경로도 이번 배정에서 직접 열거나 메시지를 보내지 않았다.

실제 실행은 경로 조회와 도움말3개뿐이다. CLI 종료/stop/kill/resume/continue/새세션/bg 생성0, 숨은IPC/TTY주입/보안변경/UI조작0, 게임/서버/빌드/Git0. 생산·타팀·기존 BUILD 산출 변경0. 지정 control-discovery.md/control-receipt.json만 기록했다. 다음 승인 지시 대기.
