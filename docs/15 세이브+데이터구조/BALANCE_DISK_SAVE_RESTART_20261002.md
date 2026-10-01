# BALANCE 격리 저장·재기동 검수 기록

| 항목 | 실제 결과 |
|---|---|
| 실행 UTC | 2026-10-01T17:14:56.607Z–17:14:56.634Z |
| 판정 | BLOCKED: OS ephemeral 포트 선확인 listen EPERM |
| 서버 child / 포트 / API 요청 | 없음 / 미할당 / 0 |
| 디스크 저장·재기동 통합 검사 | 0, 미검수 |
| 최종 후보 문법 | node --check exit0, 17:16:12Z |
| 생산 코드·사용자 저장·기존 서버 | 접근/변경 없음（생산 소스 읽기만 수행） |

하니스는 명시적 HOST/PORT/EXODUSER_SAVE_DIR와 새 mkdtemp 경로를 사용하고 자기 child만 정상 SIGTERM으로 종료하도록 작성했다. 권한 거부 이후 다른 포트/환경/기존 서버로 우회하지 않았다. 서버 ACK, 실제 JSON, 종료 이벤트, 재기동 후 load의 대조는 실행되지 않았으므로 영속성 보장을 주장하지 않는다. fixture 응답 소비 지연/503은 실서버 장애 검수가 아니다. 앱·브라우저·unload·전원 손실 및 성능은 미검수다.

정확한 입력/최종 후보 SHA, 원본 보존, 모든 import, 격리 출력 경로와 남은 게이트는 [전용 결과](../../tools/team-followup-20261001/BALANCE/disk-save-restart-result.md)에 기록했다. 기존 저장 SSOT의 확정 계약/수치와 공용 관리 문서는 변경하지 않았다. root 인계 상태이며 실제 통합 인수는 보류한다.


### 2026-10-02 서버 합본 생산 반영 인수

BUILD suffix 처리와 BALANCE 임시파일 교체 후보를 root가 server.cjs에 순차 적용했다. 원소스339fad6a→합본6a7c1083, 실제 생산 Range23+저장13+전체handler4=40그룹 PASS. 기존 실패 RED/원본과 담당20파일 SHA 보존. 저장 스키마/반환 JSON/GET 캐시·gzip 계약 유지. 실제 디스크·크래시·fsync·HTTP·영상 원인·앱 재실행은 미검수, 기존 EPERM 우회0. 상세: [서버 통합 인수](../0마스터플랜/mac-resume-20261001/vscode-dispatch/SERVER-INTEGRATION-20261002.md). 앞선 미적용 후보 기록은 제출 당시 이력이다.


### 2026-10-02 조건부 Range 및 실제 합성 파일 I/O 인수
root가 정확단일INM304 우선·If-Range 전체응답 후보를 server.cjs에 반영했다. 현재 조건부31+이전소스40+전용 합성 실제파일7=78그룹 PASS, 완료 owner24파일 보존. INM weak/list/wildcard·IMS·ETag 강도·HEAD wire·실HTTP·미디어·앱 재실행은 미검수다. 파일 검수의 write/rename EIO는 주입, ENOENT/EEXIST는 실제OS이며 크래시/fsync/Windows 검수와 다르다. 기존 EPERM을 우회하지 않았다. [인수](../0마스터플랜/mac-resume-20261001/vscode-dispatch/CONDITIONAL-ATOMIC-INTEGRATION-20261002.md).
