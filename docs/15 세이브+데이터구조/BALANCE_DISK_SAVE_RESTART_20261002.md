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
