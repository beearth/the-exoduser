# 인계 — unity-core-oracle (2026-10-28, 재생성 전)

## 진행 범위
- 감사: `docs/engine/UNITY_ORACLE_COVERAGE_AUDIT_20261028.md` (main 18a5fbf02) — 빈 곳 G1~G8, 단위 O-1~O-8.
- O-1 처치 꼬리: 브랜치 `claude/unity-pc-o1-killtail-20261028` @ **1332dcc96** (push됨). worktree `E:/exoduser-wt/o1-killtail`.
  - CX-04c1 merge(732ec59ca) + CX-04c2 DeathTail Core/oracle + Simulation 연결(RunWebDeath, KillEnemy 교체) + R-B 병합본 c7b497131 merge(89524e910) 후 정리.
  - 보고서: 브랜치 안 `docs/engine/UNITY_O1_KILLTAIL_20261028.md` (§7까지).

## 결과
- enemy-hurt-oracle 4,968케이스 5,755,060/0 (H4 900 · CH4 202), 변이 13 중 12 검출(남은 1 = 동치).
- merge 뒤 .NET 회귀 31종 전부 0 (fieldboss 302,271 · region 204,391 · region-test 117 · kill-wire 28 외). roll-oracle은 기존 결함(csproj 없음).
- Unity batchmode 빌드 오류 0. **m1-check 19/20: 09b 가시덫 판정 실패**(악의가 정확히 -5가 아님). 기준판 c7b497131은 20/20.
  - 가설: 09b 시작 때 자동 물약 쿨다운이 0이라 물약(-1)을 마심(웹 36078~36088도 같은 규칙). 또는 DOT 처치 악의. **미확정.**
  - 2회째 m1은 경로 실수로 수정 전 빌드를 돌려 무효, 그때 Unity 2개가 떠 있었음(보고함).

## 남은 일 (유니티 총괄 승인된 진단, 병합 보류)
1. 판정 불변·기록만 추가한 진단 패치가 두 판에 이미 적용됨(미커밋): `I:\EXODUSER-Storage\qa\o1-killtail\diag-09b.cjs`.
   - O-1: `E:/exoduser-wt/o1-killtail` / 기준판: `E:/exoduser-wt/o1-base-c7b4` (detach c7b497131, 영상 2개 복원 완료).
2. 가드 스크립트 `run-diag.ps1 -Tag o1|base -Project <worktree>` = Unity 0개 확인 → 빌드 → receipt 출력==exe 확인 → m1 1회. 산출물 `I:\EXODUSER-Storage\qa\o1-killtail\diag-<tag>\`.
3. 두 판의 09b 메모(DIAG 시작 cd·potions·hp·mats / 종료 potions·kills·mats·악의오브 이벤트·처치 목록) 표 비교 → ①갈린 원인 ③테스트 기대값 vs Core 수정 판정(웹 줄 근거) → 유니티 총괄 보고.
4. 판정 뒤 커밋. Unity가 자동으로 바꾼 tracked 파일(.meta·URP asset·ProjectSettings·FirstPlayable.unity)은 커밋 제외. 기준판 worktree는 junction 0 확인 후 삭제.
5. 범위 밖 후보(총괄 접수): 균열 소환·poisonZone 틱·잔해 줍기·_hitSfxCd. 필드 적 탄은 실제 게임에서 정상(StageFlowAttach가 투사체 호스트 부착).

6. 기준판 빌드 조건(총괄 10-28): o1-killtail의 Library를 PowerShell 스크립트로 `robocopy /E /XJ` 복사(Unity 0개일 때)한 뒤 빌드하거나, 복사 없이 갈 때는 커밋 여유 30GB 이상일 때만 시작. 빌드 1개 약 2.6GB.

## 재개 첫 행동
- `Get-Process EXODUSER-Unity,Unity`가 0개인지 확인 → `powershell -File I:\EXODUSER-Storage\qa\o1-killtail\run-diag.ps1 -Tag o1 -Project E:\exoduser-wt\o1-killtail` → 끝나면 `-Tag base -Project E:\exoduser-wt\o1-base-c7b4`.

## Codex 인수 시점 확인 — 2026-10-28 22:30 KST

- 원격 `unity/main` `b0f9a0c5277e`에서 O-1 브랜치 팁 `938394077`의 조상 관계를 확인했다. 위의 진단·병합 보류 지시는 당시 상태 기록이며, O-1을 새로 병합하지 않는다. 독립 Player 검증의 상세 영수증은 이 인수 작업에서 다시 판정하지 않았다.
- 공용 Unity 실행기는 임시 티켓과 예약 큐의 우선순위가 충돌해 대기 중이다. 기존 `o1-killtail` 및 기준판 작업 트리와 사용자 세이브는 건드리지 않았다.
