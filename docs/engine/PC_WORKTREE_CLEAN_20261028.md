# PC 워크트리 정리 도구 (2026-10-28)

실행 계약과 예시는 [개발툴 README](../../unity/Tools/devtools/README.md)의 `워크트리 정리(exo-worktree-clean.ps1)` 절을 따른다. 자동 세션은 `scan`만 실행한다. 사람은 보고서를 확인한 뒤 `apply -Confirm <6자리 코드>`를 직접 실행한다.

| 판정 | 조건 | 실패 처리 |
|---|---|---|
| clean | tracked 변경·미추적 파일 0, 캐시 이외 ignored 파일 0 | keep, ignored 상위 10개 기록 |
| remote | HEAD가 원격에 포함되거나 원격 main 조상, 로컬 브랜치의 미푸시 커밋 0 | keep |
| idle | `.git`·Unity Library/Temp/Logs 등을 제외한 최신 파일 수정이 `IdleHours` 이전 | keep |
| unused | 관련 프로세스와 Unity/Codex 잠금·예약·최근 5분 서버 하트비트 0 | keep, 프로세스 조회 실패도 keep |
| unprotected | keep 목록·활성 세션·사용자 메인/Steam 체크아웃 밖 | keep |

`scan`은 링크를 따라가지 않고 모든 reparse point 경로·대상을 보고한다. 크기도 링크 대상을 제외해 계산한다. `apply`는 후보를 다시 판정하고 링크 자체만 제거한 뒤 링크 0개를 재확인한다. `git worktree remove`는 force 없이 실행하고, 무시된 캐시 때문에 실패한 경우에만 캐시를 정리해 1회 재시도한다. 공통 운영 규칙에 따라 `git worktree prune`은 호출하지 않는다. `-WhatIf`는 삭제 없이 절차만 출력한다.

보고서 기본 경로는 `I:\EXODUSER-Storage\worktree-clean\scan-<시각>.json/.md`이며, `apply` 로그도 같은 저장소에 둔다. 원격 판정은 로컬 remote ref 기준이다. 최신 원격을 요구하면 담당자가 별도 fetch 결과를 확인해야 한다.

10-28 인수 시 `apply`의 `git worktree prune` 호출을 제거했다(`codex/pc-devtools-tools-20261028` `465bb875e`). 영구 삭제 경로인 `apply`는 실행하지 않았다. 실제 후보 판정과 회수 가능 용량은 별도 `scan` 결과로 기록한다.
