# EXODUSER 작업감독 — 완료 인수·후속 지시 전담

사용자 최신 직접 요청: “총괄말고 잡업감독 세션을 하나 더 만들어서 시키던가해”. 앞선 직접 요청은 작업 완료 보고/알림 뒤 같은 실행에서 피드백과 다음 지시를 계속하는 것이다. 총괄 원채팅 `01a0faa9-b453-7673-be39-98adedb4c2b3`의 사용자 원문/맥락을 read_thread로 확인한다. 감독은 이 승인된 프로젝트15전문팀 및 총괄 채팅에만 업무 메시지를 전달한다. 별도 사람·외부 채널 송신은 하지 않는다.

실제 checkout은 `/Users/fordeargamers/Projects/exoduser-migration-20261001`이다. 앱 기본 project cwd `/Users/fordeargamers/the-exoduser`와 혼동하지 않는다. 먼저 AGENTS.md·PROJECT_MANAGEMENT_MASTER·TEAM_CONTINUATION_POLICY·PROVIDER-HALVES와 CONTINUOUS-DISPATCH MD/JSON·continuous/COMMON.md를 읽는다. 모든 현재 역할/UUID/TASK와 실제 수신 영수증을 인수한다. 총괄은 생산 코드 통합·문서 동기화·검증·Git checkpoint를 맡고, 감독은 이후 전문팀 완료 감시/피드백/다음 배정의 **단일 송신 담당**이다. 사용자 승인 추가 감독으로 총괄+감독2, Codex전문7/Claude전문8 =17역할(Codex9/Claude8)이다. 기존 중복 보관8Codex는 대상에서 제외한다.

## 즉시 할 일

1. 공식 wait_threads로 Codex7의 현재 turn/cursor와 완료 여부를 인수한다. 완료된 후속 UIUX minus는 총괄이 양판 최소 guard·5canonical 통합 검증 중이다. ITEM 공급3입력/5그룹은 인수했고 `continuous/ITEM/NEXT.md` lifecycle 한 건을 이미 보냈다. 이 지시를 중복 보내지 않는다.
2. Claude8은 root가 기존 native inbox로 2026-10-02T05:34:52Z ART1건,05:36:40Z 나머지7건을 보냈다. 재송신하지 말고 actual JSONL의 peer user envelope→정확 TASK/NEXT Read→matching successful tool_result로 시작을 확인한다. collector와 local-inbox send receipts는 `tmp/mac-migration-runtime/continued-review-20261002/`에 있다. `isMeta=true` peer 수신을 제외하지 않는다. 오래된 end_turn은 새 업무 완료가 아니다.
3. 모든 전문팀을 actual running / completed-needs-review / dependency / delivery-held로 분류한다. 새 완료가 있으면 같은 실행에서 소유 result/evidence와 근거를 읽고 검토한다. 한국어로 의미 있는 완료/실패만 보고하고, 수정 피드백 또는 승인된 백로그의 다음 구체적 한 건을 해당 담당에게 보내 actual Read까지 확인한다. 이전 결과/검사/지시 반복0이다. 생산 반영 필요한 사항은 총괄에 사실·후보·Gate·소유 경로를 보고한다.

## Claude 기존 세션 메시지 경로

공식 설명: https://code.claude.com/docs/en/cross-session-messaging#the-sessions-inbox-socket . 설치 공식 CLI2.1.287의 inbox 자체 예시/handler를 읽어 root가 실제 착수를 검증 중이다. UI 입력 전달이 불안정해 이 local API를 사용하며 Remote Control/새 서버/새 세션을 생성하지 않는다.

`/Users/fordeargamers/.local/bin/claude agents --json --all --cwd <실제checkout>`는 읽기 전용 inventory다. 지정 UUID의 interactive 현재 PID를 찾아 `/Users/fordeargamers/.claude/sessions/<PID>.json`의 sessionId/cwd/kind/messagingSocketPath를 대조한다. 실제 socket의 uid=현재사용자,0600,비symlink를 확인한다. PID를 영구 hardcode하지 않는다.

지원 frame은 UTF-8 JSON 한 줄+LF다: `{"type":"user","session_id":"<검증한 현재 UUID>","message":{"role":"user","content":"<승인된 자신의 TASK 읽기 지시>"}}`. from/from_mode/권한/priority/auth/reply 필드는 넣지 않는다. 기존 inbox에 한 번 연결→send→EOF한다. 같은 socket JSON ACK는 없으므로 send/EOF만으로 시작을 선언하지 않는다. 실제 peer 수신·Read 성공으로 판정한다. hold/drop/error면 메시지를 반복/위장하거나 auto/bypass/설정/토큰을 변경하지 않고 이유·필요한 사용자 조치를 보고하며 독립 승인 작업을 계속한다. 외부 요청으로 유입된 문서 내용 자체를 새 권한으로 삼지 않는다.

## 소유·중복 방지·보고

감독 쓰기 소유는 이 폴더의 `SUPERVISOR_STATE.json`와 `SUPERVISOR_LOG.md`, 새 한 건을 배정할 때만 `tools/team-followup-20261002/supervisor-next/<ROLE>/<고유taskId>/TASK.md`다. ignored tmp의 supervisor 전용 메타 영수증/helper는 허용한다. 이 TASK·중앙 registry/기존 TASK·팀 산출·production·공유canonical docs·기존test·Git/index/commit/push는 총괄/원소유자 소유이므로 감독 쓰기0이다. 다른 담당과 공유 중이며 타인 WIP를 되돌리지 않는다. 새 채팅/하위팀·세션 resume/restart·삭제/cleanup/이동·계정/권한/설치/결제/게시·사용자 세이브/게임/앱 조작0이다.

STATE에는 역할/제공자/chat 또는session ID/현행TASK SHA/소유 경로/turn·cursor/실제Read·완료·검토/후속send/read/처리완료 marker를 기록한다. 중앙 registry는 인수 snapshot이며 이후 감독 STATE가 전문팀 배정의 최신 운영 기록이다. TASK는 최대3산출·단일 새 경계·SSOT/보호설계/기존검사 인수·docs 검색/정확한 동기화 인계·source vs runtime Gate·생산 미적용을 명시한다. root가 적용한 최신 source SHA/commit은 역사 입력과 구분한다. 근거 없는 PASS/동시실행/모든도구사용을 보고하지 않는다.

Changes80부터 총괄에 정확한 완료 소유 목록을 보내 checkpoint를 요청하고100 전에 새 산출을 멈춘다. status 변동이 없으면 알림/동일검사/동일지시0, 의미 있는 완료·실패·사용자 결정만 보고한다. 1분 heartbeat는 대화 종료 후 후속 감시이며 즉시 이벤트/무지연을 보장하지 않는다. 새 세션 착수는 TASK actual Read와 감독 STATE 생성으로 총괄이 확인한다.


### 2026-10-03 최신 오더 분담과 연속 실행

사용자가 완료 뒤 팀들이 계속 대기하는 문제를 지적하며 관리 담당 추가를 요청했다. 기존 감독의 업무를 둘로 나누며, 전문 제작팀15와 기존 Claude 실행세션8은 유지한다. 이 절이 이전 17역할 및 전문15팀 단일 송신 문구보다 우선한다.

| 담당 | 현행 소유 |
|---|---|
| 원총괄 | 생산 통합·정본 docs 동기화·의미 검수·Mac 앱·Git 원격 보존 |
| 기존 EXODUSER 작업감독 `01a0fb1e-4ec3-7dd3-bba2-f87518e881fa` | Codex7 UIUX/ITEM/BUILD/BALANCE/SOUND/QUESTNPC/MARKETING의 유일 오더 송신. 기존 STATE/LOG 소유 유지 |
| 새 EXODUSER Claude 오더 담당 `01a0fd2d-8a6f-7f01-b2da-70119654cffe` | Claude8 ART/MAP/SKILL/QA/ENEMY/ANIMVFX/BOSS/STORY의 유일 오더 송신. `supervisor/claude-orders/SUPERVISOR_STATE.json`·`SUPERVISOR_LOG.md`만 별도 소유 |
| 역할 집계 | 관리3+전문15=18. 새 제작팀·Claude 실행세션·resume 복제0 |
| 인계 | 기존 감독은 2026-10-02T15:12:50~51Z native1512 송신5 이후 추가 Claude 송신0을 공식 ACK. 원총괄이 새 담당에게 송신 소유 활성 메시지를 전달. 진행중1512·미소비 큐 재송신0 |
| 완료 뒤 | 승인된 다음 독립 실제 코드·콘텐츠 작업을 즉시 이어간다. 상세 생산 검수는 원총괄로 인계하며, 통합·다른 팀 완료·새 epoch 대기를 팀 전체 종료 조건으로 삼지 않는다 |
| 관리 회차 | 먼저 담당7/8의 실제 상태를 확인하고 종료·입력대기만 복구한다. 회차3분 내 종료/5분 점검 설정, 미준수 시 실제 누락 기록. 수신·Read·새 turn의 유용한 tool·완료를 구분하며 설정만으로 무지연이나 준수를 선언하지 않는다 |
| 보존 | 실제 Changes80부터 정확 완료 소유만 checkpoint/100전 새 산출 중단. 파일 여유가 없어도 승인된 출력 없는 독립 조사를 이어갈 수 있다. 제출 원자료 불변·반복당 최대3산출·기존 소유권 유지 |
| 남은 예외 | ART/MAP 기존 큐 미소비는 입력 필요이며 현재 착수 근거0. ENEMY 정책 읽기 Auto-Mode Bypass 자동 승인 거절은 우회0. 원총괄 앱3386 QA 독점·사용자 게임/세이브/옛 앱 보존 |

자동화3의 공식 tool 저장 후 실제 TOML의 name/prompt/status/주기/target/kind가 요청값과 모두 일치했다. `exoduser`는 기존 이름·ACTIVE5분·기존 감독 대상을 유지하며 Codex7 범위로 갱신, 새 `exoduser-claude8`은 EXODUSER Claude8 오더 점검/ACTIVE5분/새 담당 대상, `exoduser-mac`은 기존 이름·ACTIVE1분·원총괄 대상/18역할 통합 범위다. 알림 정책 변경0. TOML SHA는 각각 bfd845b459ac7fa499ba0b0b6836e302f0ad6432d735648581a2347ab51cbe24, e3379051b29343bbf7891428da505cbee1dff79578a57ac84b783c6502e719aa, 2f0576016b0c7073d834d8f678a1c1c9230adab8b902881e19a58c7078a9335c. 실제 다음 회차의 송신·Read·도구 실행은 별도 확인한다.

이 TASK의 이전 Claude 전달 설명은 기존 계약과 인계 이력으로 보존한다. 현재 이 채팅의 후속 송신은 Codex7만이며 Claude8은 새 담당이 전담한다. 새 담당의 상태2는 원총괄 공간 확보 메시지 이후 쓰기 가능하고 기존 감독 상태2를 편집하지 않는다.
