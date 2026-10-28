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

10-28 인수 시 `apply`의 `git worktree prune` 호출을 제거했다(`codex/pc-devtools-tools-20261028` 최초 `465bb875e`, 최종 `33ef33763`). 미등록 폴더와 링크 루트는 내부를 따라가지 않고 `keep`으로 남긴다. 접근 거부된 전역 ignore 파일은 Git 조회 한 번에만 제외하며, 새로 보이는 미추적 파일은 `keep`으로 처리한다. 영구 삭제 경로인 `apply`는 실행하지 않았다.

원본 워크트리의 `scan-20261028-223208` 보고서를 `I:\EXODUSER-Storage\worktree-clean\devtools-source-scan-20261028-223208.json/.md`로 보존했다. **후보 0개, 예상 회수 0.00GB, keep 87개, 링크 46개**다. Git 전역 ignore 접근 거부와 Win32_Process 조회 실패가 있어 후보 0개는 실제 정리 가능량 0GB의 확증이 아니다. 수정본의 전체 재검수는 이 기록에 포함되지 않았으며, 삭제 결정을 위한 유효한 후보 보고서는 아직 없다.

원본의 후속 전체 scan `scan-20261028-224453`도 `I:\EXODUSER-Storage\worktree-clean\devtools-source-scan-20261028-224453.json/.md`로 보존했다. **후보 0개, 예상 회수 0.00GB, keep 139개, 링크 46개**다. 전역 ignore 오류는 제거됐지만 Win32_Process 조회 실패가 남아 모든 후보를 보수적으로 `keep`으로 처리했다. `apply -WhatIf` 2회 로그는 모두 후보 없음·제거 없음이며 실제 삭제는 없었다. 후보를 판단할 수 있는 프로세스 조회가 복구되기 전에는 정리를 결정하지 않는다.
