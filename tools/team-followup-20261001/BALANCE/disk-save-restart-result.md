# BALANCE 실제 디스크 저장·재기동 검수 인계

## 판정: BLOCKED — 권한 거부, 통합 PASS 없음

- 수신/첫 Read UTC: 2026-10-01T17:12:56Z. AGENTS, 담당 task, 저장 SSOT, 실제 server 환경/API 및 생산 저장 호출부를 읽었다. 동일 prefix에는 task만 있었으며 사용자 초안·기존 산출은 보존했다.
- 첫 코드 Edit UTC: 2026-10-01T17:14:56Z. 전용 `disk-save-restart.mjs`를 작성했다. 생산 HTML/server/schema 수정0.
- 실제 실행 UTC: 17:14:56.607–17:14:56.634. `node tools/team-followup-20261001/BALANCE/disk-save-restart.mjs`는 OS 빈 포트 선확인에서 `listen EPERM: operation not permitted 127.0.0.1`로 실패했다. 실행 자체 exit1이며 통합 검사0, API 요청0, child PID 없음, 포트 미할당이다.
- 격리 출력: `/var/folders/jw/nw37c6px7p9cdgtst065y5gm0000gn/T/exoduser-disk-save-restart-8K1xMM/evidence.json`. 합성 저장 파일은 생성되지 않았다. 기존 서버·사용자 세이브·게임 탭 접근0. 권한 변경·다른 바인딩·재시도·우회0.
- 마지막 검수 UTC: 17:16:12. `node --check` exit0만 확인했다. 완료/인계 시각도 동일하며 실제 디스크 저장·종료·재기동 검수는 미완료다.

## 작성한 하니스와 미검수 범위

현재 본편/easy의 `dbSaveNow`, `_drainPendingSaveNow`, 로컬 API override 및 공유 악의 호출부를 추출하도록 작성했다. 메모리 DOM/시계/저장 fallback을 쓰되 서버 ACK, 실제 JSON 디스크, 자기 child SIGTERM 종료 이벤트, 동일 경로 재기동 후 `/api/load` 응답을 각각 대조하도록 구성했다. HOST=127.0.0.1, 명시적 PORT/EXODUSER_SAVE_DIR, mkdtemp, 금지 포트 제외, 자기 child만 관리한다.

busy 후 새 snapshot, fixture 실패 뒤 fallback/명시적 복구, 캐릭터 문맥 변경 폐기, 재기동 전후 파일 SHA 검사는 **작성만 완료했으며 실행되지 않았다**. hold는 실제 응답 도착 후 생산 코드의 응답 소비를 늦추는 fixture다. 503은 실제 서버 장애가 아닌 fixture 주입이다. `_serverOk=true` 재설정은 검사 fixture의 명시적 복구이며 자동 복구 보장이 아니다. 브라우저/앱 종료, unload, 전원 손실 내구성, 실게임/성능은 미검수다.

실행 후 종료 대기의 중복 timeout을 단일 timer/finally 정리로 최소 정리했다. 이 최종 바이트는 문법만 검사했고 네트워크를 다시 실행하지 않았다.

## 원본 및 후보 SHA-256

| 파일 | SHA-256 | 상태 |
|---|---|---|
| server.cjs | 339fad6ab51cba92f6ca7a386c8aeb251f68cdb58cdfa55c109f57b1758a42ad | 실행 전후 동일 |
| game.html | c868284af349c996d42087e93eba47a10614d73cb8f55f4db5ae01dde89da31a | 실행 전후 동일 |
| game-easy-test.html | 11b4e97b15903b9699b296362bdd068ffed6d3a1a505d9f6eeec5482b7c085ca | 실행 전후 동일 |
| 실행 당시 하니스 | afc15bef8ae510b9bea041caf3fe38f7110949422380821f38a93fe15a55bf46 | EPERM 선확인 실행본 |
| 최종 하니스 | ee0cadb3df8d16938bcc30a5857aeb1f936a98041a083209ff336baed7cb5593 | 문법 검사만 통과 |

imports: node:fs, node:path, node:os, node:net, node:vm, node:assert/strict, node:child_process, node:events, node:url, node:crypto. 외부 설치·로컬 팀 모듈 import 없음. 실제 소스 입력은 위 세 파일이다.

docs 전체 관련 키워드 검색은 `disk-save-restart-doc-search.txt`에 기록했다. 기존 공용 SSOT/총괄/CHANGELOG/BALANCE master는 수정하지 않고 전용 검수 문서만 추가했다. Git/queue/새 세션/하위 에이전트/빌드 실행0. 원격 체크포인트는 task의 root 전달값이며 Git으로 독립 검증하지 않았다.

남은 게이트: 승인된 실행 환경에서 동일 격리 계약으로 실제 ACK→디스크→정상 종료→재기동→load를 검수해야 한다. 현 환경에서 이를 PASS로 인수할 근거는 없다. 이번 한 건을 root에 인계하며 새 범위는 시작하지 않는다.
