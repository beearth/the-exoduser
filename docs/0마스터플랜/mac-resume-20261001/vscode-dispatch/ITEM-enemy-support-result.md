# ITEM ENEMY 물리 tick 지원 후보 결과

- 완료: 2026-10-01 14:32:17 UTC. 기존 ITEM 세션에서 binding 인계 뒤 승인된 지원 한 건만 수행했다. 생산 반영은 하지 않았다.
- 실제 수신·첫 Read: 14:25:10 UTC. 지원배정, ENEMY NEXT_TASK, 원 probe/mock 및 ROOT_REVIEW 반례를 읽었다. 전용 영수증과 별도 후보를 실제 편집했다. 명령·검사 증거는 `tools/team-followup-20261001/ITEM/enemy-support-receipt.json` 및 `enemy-support-validation.txt`에 기록했다.
- 중복확인: 배정상 원 ENEMY는 idle/미수신이다. ENEMY-next 수신/결과 파일은 발견되지 않았지만 native 큐는 UNKNOWN이다. 신규 세션은 만들지 않았으며 원 담당 재착수 시 root 조율 없이 중복 적용하면 안 된다.

## 원인과 검증

| 관측 | 원본 | 독립 후보 |
|---|---|---|
| null tick, 451 rAF | elapsedTicks=null, inRangeTicks=451, FAIL_NO_FIRE | inRangeTicks=0, INCONCLUSIVE |
| missing/nonfinite/잘못된 카운터 | 물리 진행 증거 불충분 | INCONCLUSIVE, tickHealth 사유 보존 |
| 역행 또는 관측 정지 | rAF 기반 오판 위험 | INCONCLUSIVE; 오류는 재개 후에도 유지 |
| 정상 470 물리 tick, 1410 rAF | 정상 no-fire 진단 | 정확히 470만 계수, FAIL_NO_FIRE 유지 |
| commit 관측, 시계 불명 | 발사 원자료 존재 | 원자료 보존하되 판정 INCONCLUSIVE |

물리 tick은 유한한 비음수 안전정수이며 실제 증가가 관측되어야 한다. 건너뛴 tick은 추정해 채우지 않는다. rAF는 스케줄러 표본일 뿐 체류 tick이 아니다. `tickHealth`는 누락·역행·읽기 예외 및 진행 증거를 별도로 공개한다. 기존 래퍼/발사 경로와 게임 수치는 변경하지 않았다.

정지 진단의 120은 **연속 동일/무진행 rAF 표본 임계값**이며 물리 tick·초·AI 수치가 아니다. 진행이 전혀 없으면 임계값 이전에도 INCONCLUSIVE다. 정상 진행 후 120 미만 중복 표본은 고주사율과 일시정지를 구분할 수 없는 한계가 있다. 오류 발생 후 새 probe로 다시 측정해야 한다. 이는 독립 진단 후보이며 실시간 시계·전투 품질 인수는 미검증이다.

## 제출 및 인수

- 후보: `tools/team-followup-20261001/ITEM/enemy-support-probe.js`; 비교 diff: `enemy-support-probe.patch` (원본→후보 비교용, 자동 적용 없음).
- 기존 mock 재사용 9 PASS/0 FAIL, 추가 Node tick 검사 17 PASS/0 FAIL. 실제 명령은 영수증에 기록했다. `enemy-support-evidence.json`에 원반례·후보 관측·SHA256을 저장했다.
- 원 ENEMY probe SHA256: `1bf68b094b792998abe5a9e0ca1f6c57534ef4ec6d9dbbd28c792450cbfdf489`; 원 mock: `91a709f333a7c31ab9e8e96b84f30e258403d3784aadb44c022a927b02c18d05`. 최종 조회에서도 보존됐다.
- docs 전체 관련 키워드 검색은 `enemy-support-docs-related.txt`에 저장했다. 공유 SSOT는 수정하지 않았다. 인수 시 원 담당 문서에 물리 tick 불명은 INCONCLUSIVE임을 동기화해야 한다.
- 남은 게이트: root 독립검수 → 원 ENEMY 수신/소유권 조율 → 물리 tick을 실제 노출한 live 관측. mock PASS는 정상전투·AI 수정 완료를 의미하지 않는다.
- binding·원 ENEMY 파일 읽기전용 유지. Git/게임/브라우저/서버/빌드/새세션/하위에이전트 실행 0. 지원 후보만 제출하며 자동 적용하지 않는다.
