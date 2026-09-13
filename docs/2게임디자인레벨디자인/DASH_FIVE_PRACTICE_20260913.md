# 전격이동 5회 반복 실습 — 2026-09-13

| 항목 | 현재 계약 |
|---|---|
| 범위 | 기초 1장 step5·자원 2장 step6의 단독 전격이동 과제 각각 5회. 총 과제 수 유지. 그로기 탈출 과제의 전격이동은 기존 한 번 |
| 입력 | 방향키/WASD 유지 + bow의 BINDS/BINDS2 입력(기본 Space). 이동 중 입력·키 반복은 다음 횟수로 예약하지 않음 |
| 실제 발동 | 입력을 기록한 뒤 P._bdMoveT>0이어야 1회 성공. 단순 입력 또는 입력 없는 이동은 미집계 |
| 2장 소모 | 매 입력 직전 MP·기동력 기준값을 저장하고 둘 모두 감소해야 성공. 기존 비용·거리·피해 공식 유지 |
| 중복 방지 | dashPractice.flight 중에는 추가 집계 금지. P._bdMoveT<=0 및 해당 키 해제 모두 확인 후 다음 입력 허용 |
| 준비 | 최초 시작·이동 종료와 키 해제를 모두 확인한 다음 시도 준비에서 MP/기동력을 최대치로 보충. 2장 이동 중에는 강제 보충하지 않음 |
| 표시 | 1장은 현재 미션 hint, 2장은 resourceReadout 리프에 전격이동 성공 0/5~5/5. 5회째에만 completeStep, 기존 90틱 뒤 다음 과제 |
| 상태 | dashPractice: count/armed/flight/pressed/code/mp/gauge. resetPose에서 초기화, 영구 저장하지 않으며 기존 종료·건너뛰기 자원 복구 유지 |
| 구현 | parry-lesson.js의 initDashPractice/armDashPractice/tickDashPractice/updateDashPractice를 두 장에서 공유. resource-practice.js는 tickDashPractice(true)로 소모 확인 |
| 캐시 | 일반·쉬운 게임 HTML의 parry-lesson.js는 20260913-dash-five1, resource-practice.js는 20260913-resource-cost50 |
| 자동 검증 | 기존 1회 통과에서 실패하는 테스트를 먼저 확인. 양쪽 1~4회 미완료·5회 완료, 한 이동 중 중복/키 반복 차단, 이동 종료·키 해제 조건, MP/기동력 각각 소모 및 이동 중 보충 금지 PASS |
| 실제 브라우저 | 서버3333 일반 게임에서 양쪽 장을 시작해 A/D+Space 실입력 5회씩. 각 1~4회 미완료·5회 완료, 오류0. 화면의 5/5를 직접 확인 |
| 기록 | output/tutorial_dash_five_20260913/qa.json 및 장별 시작/완료 화면4개. tmp/dash_five_originals에 수정 전 파일 보존 |
