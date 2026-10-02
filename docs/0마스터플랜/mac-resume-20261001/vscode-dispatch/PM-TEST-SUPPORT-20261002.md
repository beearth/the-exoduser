# Terminal 12 총괄 검수 보조 — 전체 node-main handler 회귀

이번 한 건 수신·읽기·실행·검수 기록은 receipt.json에 구분했다. 기존 Terminal 12 배정에 따라 새 팀/채팅/터미널 세션 생성 없이 실행했다.

| 항목 | 결과 |
|---|---|
| 검사 | 18 PASS / 0 FAIL |
| 실행 | 지정 Node v24.15.0, 전체 후보 source VM 실행; HTTP createServer/listen 가로챔 |
| 후보 동일성 | 현재 node-main.js에 지정 unified patch를 메모리 적용한 결과와 후보 byte 일치 |
| 정상 | 절삭·음수·상한 9007199254740991·문자·null·0·재조회·슬롯 분리; 신규/교체·temp 고유명·fd 수명·rename 후 ACK |
| 실패 주입 | open/write/close/rename 각 단발 EIO, 기존 mats/slot bytes 보존, 성공 ACK0, 소유 temp0/live fd0, 후속 재조회·재저장 |
| exclusive | wx 충돌 시 타 소유 temp 보존·unlink0 |
| 입력 보존 | receipt에 등록한 8개 입력 SHA 전후 일치 |
| 생산 상태 | 후보 미적용·생산 채택0. 생산소스·기존 test·타 팀·Git 쓰기·공용 인덱스·서버·게임 변경0 |
| 한계 | fakeFs 메모리 검사. close 실패는 fd가 열린 채 남아 finally 재시도 성공인 모형. 지속 close/unlink 실패·crash/fsync/concurrency/Windows·실디스크·실HTTP 미검수 |
| 기존 handler 한계 | 파일 및 잘못된 JSON 실패에서 async Promise 거부. HTTP 500/end 없음. 성공 ACK0은 정상 오류 응답 완료를 뜻하지 않음 |
| 실행 경고 | 생산 source의 url.parse에서 DEP0169 출력; 이번 범위에서 수정하지 않음 |
| 생산 인수 조건 | 총괄의 범위 확정·복구점/원격 체크포인트, 미적용 patch 재대조, 오류 응답 정책 판단과 필요한 native/HTTP 저장 검수 후 별도 인수 |
| docs 동기화 | docs 전체 키워드 검색 결과 docs-keywords.txt 보존. SSOT 수치/계약 변경0, 본 소유 보고서에 후보와 한계 기록 |

소스 SHA·실패별 이벤트·전체 18검사 이름은 result.json, 실행 하니스는 handler-regression.mjs다. 다른 지원 담당의 14그룹 실파일 검사를 재작성하거나 그 결과를 본 검사 수에 합산하지 않았다. Git add/commit/push는 수행하지 않았으며 총괄 인계 대상이다.

[검사 결과](../../../../tools/team-followup-20261002/pm-test-support/result.json) · [수신 기록](../../../../tools/team-followup-20261002/pm-test-support/receipt.json) · [검사 하니스](../../../../tools/team-followup-20261002/pm-test-support/handler-regression.mjs)
