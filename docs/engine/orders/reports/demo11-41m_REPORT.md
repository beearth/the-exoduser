# DEMO11-41M — 최신 main 코드 충돌 해소

기존 같은 브랜치 `codex/demo11-41-20261021`의 `8939bbd17acdd420fd102cbee0b4e5409357b3ce`에, fetch 후 최신 origin/main `45be76e49d0090316b91a6b7b383d81835e29192`를 정상 merge했다. `969c194e6`이 이 main의 조상임을 확인했다. rebase/reset/force/main push는 하지 않았다.

| 충돌·보호 범위 | 해소 근거 |
|---|---|
| Main 부팅 | 기존 intro 설치 뒤 BGM bind와 main의 DEMO11-34 보스 actor·DEMO11-35 투사체 설치를 모두 보존 |
| Main 마지막 API | DEMO11-41 sound-only API와 PC-RUNTIME-STATS의 refresh/snapshot/cache-invalidation API를 모두 보존. 최신 main 모든 줄이 순서대로 남는지 자동 대조, 삭제0 |
| 변경 범위 | latest-main 대비 Main +22/−0. 새 전투/State/맵/저장 기능0, PC owner 파일 수정0. 기존 sound owner tick 경로 목록 생성 API0. actor BGM 신호 계약은 기존 DEMO11-41 상태 유지 |
| 문서 | CHANGELOG 충돌은 양쪽 기존 절을 보존하고 이 병합 절을 맨 위 추가. 기존 DEMO11-41 보고서에 후속 링크만 추가 |

| 관련 검증(기존 무수정) | 검사/실패 | 원로그 |
|---|---:|---|
| DEMO11-41 실제 창 BGM/voice 수명 | 55/0 | music41.* |
| PC runtime-stat 실제 Main 진입·원본 oracle | 295/0 | runtime.* |
| 합계 | 350/0 | 각1회, import exit0/ERROR0 |

각 관련 기존 테스트는 파일 상수의 격리 user dir로 딱1회 실행했다. 신규 테스트는 만들지 않았고 import는 `EXODUSER-demo11-41m-Isolated-20261021`를 사용했다. 실제 사용자 저장소 사용0. 각 Godot 실행 전 정확한 pgrep 명령을 .sh 파일에서 실행(검사 셸 자기 매칭 방지), 2개 이상이면30초 대기했다. 다른 창 프로세스 종료0. 종료마다 override.cfg 0byte를 확인했다. 원로그에는 대기·명령·출력·종료코드를 남겼고 전체 JSON/원본을 출력하지 않았다.

두 suite 모두 exit0·ERROR0. 기존 Camera2D interpolation 경고는 각1건이며 원문을 남겼다. UI 변경0이므로 추가 화면 제작/캡처는 하지 않았다. 기존 DEMO11-41 테스트와 PC 테스트는 각각 승인 SHA/최신 main 파일과 바이트 동일함을 확인했다. 초기 sparse index 구성 순서를 바로잡아 자기 작업 폴더를 재생성했고, 이후 필요한 경로만 받은 상태에서 검증했다. R 상태는 시작 전후 동일함을 확인한다.

원로그는 `~/exoduser-wt/_out/demo11-41m/`. 최종 병합 SHA·원격 일치·DONE 작성·자기 worktree 제거는 DONE.txt에 기록한다. DEMO11-08은 이미 `592a983e`로 제출·정리했으며 이 반송 단위에서 해당 브랜치를 변경하지 않았다.
