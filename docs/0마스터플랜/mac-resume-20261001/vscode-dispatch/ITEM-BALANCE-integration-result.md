# ITEM/BALANCE 최소 수정 통합 — 2026-10-01

원격 사전 복구점 `codex/backup-item-economy-20261001-220100`의 `d9dd5151825d1a04fe429f78b578c8b3d0c3f897` 대조 후 본편/easy 각각 3줄을 반영했다.

| 범위 | 실제 변경 | 검증 |
|---|---|---|
| 저장 이름 | 비어 있지 않은 문자열 uniqueId 장비는 일반 무기명 마이그레이션에서 제외 | 담당 84 시나리오, root 실제 함수의 9종 ID 및 반복 호출 |
| 분해·강화 이전 | 기존 합계와 50% 비율은 유지하고 signed32 절삭을 Math.floor로 교체 | 담당 96 강화 표본·48 저장 기록; root 실제 equipItem→저장 모사→dropItem 및 잔액 부족 |
| 현재 소스 | 양쪽 3줄, 신규 아이템/효과·드롭 정책 추가 없음 | 관련 18/18, guard PASS, 실행 inline JS 각 6개 parse PASS |

root 회귀는 수정 전 4FAIL/2PASS에서 수정 후 6PASS다. 초기 기대 상수 오기 2147497234는 실제 경계 합계 2147506212로 정정한 뒤 RED를 다시 기록했다. 추가 SOUND 검사 2개는 이전 HEAD 696bda0c에서도 동일하게 실패하며 전체 검사가 통과했다고 판단하지 않는다. SOUND 기존 담당은 13:02:24.376Z 지시 수신, 13:02:29.179Z 실제 지시 Read 후 별도 조사 중이다.

실사용자 저장·실게임·브라우저·오디오·패키지 검증은 실행하지 않았다. 모사 DB와 저장 스냅샷 검사는 실제 저장 매체 검수가 아니다. 기존 음수 _enhRefund 데이터는 복원하지 않으며, 일반 속도/소켓 보정 난수 정책과 PM-013D 환불 설계 변경은 범위 밖이다. 담당자의 원 후보 하니스는 수정 전 source에 고정되어 있으므로 현재 수정 소스에서 fail-closed하는 것이 정상이다. 현재 생산 회귀는 test/itemSaveEconomyBoundary.test.js가 담당한다.

수치·해시·검사 로그는 ITEM-BALANCE-integration-evidence.json 및 tools/team-followup-20261001/root-review/item-economy-*를 따른다. 원 후보 보고의 ‘미적용’은 제출 당시 이력이며 본 통합 기록이 최신 상태다.
