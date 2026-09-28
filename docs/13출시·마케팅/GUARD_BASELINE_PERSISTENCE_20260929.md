# 커밋 가드의 동일 기준 파일 재저장 생략 — 2026-09-29

맵85차 분리 커밋의 pre-commit은 CHECK1..5를 통과한 뒤 tools/guard.baseline.json 재저장에서 Node UNKNOWN(-4094) open 오류로 중단됐다. 기준 파일의 r+/append open은 가능했고 파일 속성에 read-only는 없었다. 진단 실행에서 저장 예정 내용은 기존 파일과 바이트 단위로 동일했다. OS 파일 접근 실패의 구체적인 외부 원인은 확정하지 않았다.

tools/guard.js는 검사가 모두 통과한 뒤 **내용이 달라질 때만** 파일을 저장한다. 게임 검사·실패 차단·기준값 변경 검사는 동일하게 실행한다. 기준 파일의 권한·속성·검사 규칙은 변경하지 않았다.

| id / 적용 위치 | 현행 계약 |
|---|---|
| GUARD_VALIDATION / main | CHECK1 보호영역 해시, CHECK2 루프 금지패턴, CHECK3 inline/module 문법, CHECK4 라인수5% 감소, CHECK5 보스idx 검사는 기존대로. 하나라도 fails에 있으면 baseline 저장0/exit1. CHECK6은 기존 WIP 경고 |
| GUARD_SERIALIZED | serialized=JSON.stringify(nextBaseline,null,2)+'\n'. 공백2칸·마지막 LF 포함 |
| GUARD_EXISTING | existing=existsSync(BASELINE)?readFileSync(BASELINE,'utf8'):null |
| GUARD_NOOP | fails.length=0이고 existing===serialized면 baseline 쓰기0, 검사 PASS/exit0. 기존 기준 파일 내용·mtime을 다시 쓰지 않음 |
| GUARD_CHANGED | fails.length=0이고 existing!==serialized면 writeFileSync(BASELINE,serialized). 미존재 파일도 같은 경로로 생성. 실제 쓰기 실패는 계속 실패하며 숨기지 않음 |
| GUARD_SCOPE | tools/guard.js 저장부만 변경. tools/guard.baseline.json의 기존 내용·스테이징 보존. 검사 비활성화0·권한/ACL 변경0·프로세스 종료0 |
| GUARD_TEST | test/guardBaselineWrite.test.js: 동일 내용+쓰기불가 / 변경 내용 저장 / 변경 내용 쓰기실패 / 보호영역 불일치 차단 / 미존재 생성,5개 |

회귀: 수정 전4PASS/1FAIL(동일 내용 재저장 실패 재현) → 수정 후5PASS/0FAIL. 가짜 filesystem은 게임·기준파일 입력과 잠긴 파일 쓰기만 주입하며 실제 guard 전체 검사와 임시 스크립트 문법 검사를 실행한다. 프로젝트의 실제 기준 파일을 변경하지 않는다. 실제 hook 성공·커밋 결과는 [85차 체크포인트](../../captures/ch1_outer85/git-checkpoint.json)에서 확인한다.

근거: [I/O 진단](../../captures/ch1_outer85/guard-io-diagnostic.json), [RED](../../captures/ch1_outer85/guard-tests-red.log), [GREEN](../../captures/ch1_outer85/guard-tests-green.log), [85차 맵 보고서](../4.1맵디자인+설정/CH1_OUTER_CONNECTION_PASS85_20260929.md).

docs 전체에서 guard.baseline을 검색한10개 문서를 대조했다. 보호 해시·보스idx·라인수 임계값 등 기존 검사 계약은 변경하지 않았으며 이전 커밋·실패 이력은 보존한다. 새 저장 분기·변수·검증은 이 문서와85차 맵 보고서·CHANGELOG에 동기화한다.
