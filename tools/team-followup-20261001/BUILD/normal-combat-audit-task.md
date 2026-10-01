# NORMAL-COMBAT-INDEPENDENT-AUDIT

직전 support33 독립감사 완료 뒤 다음 한 건. root는 S1/S2를 보강하고 독립33 재실행을 통과했으며 원격 d128e3c89e1e9e155ea8606cf1283b02df82c3fa에 정상 전투 관측을 백업했다. AGENTS/총괄18.40/QA 문서와 최신수신을 확인해 중복이 아니면 시작한다.

소유는 `tools/team-followup-20261001/BUILD/normal-combat-audit-*`뿐. 원자료 `outputs/team-review-20261001/support/normal-combat/{raw,analysis,preflight}.json`, 분석기 `QA/analyze-support-normal.mjs`, `SUPPORT-normal-combat.md`를 읽기 전용으로 독립검수한다. 새로운 게임/브라우저/서버/빌드·원자료수정·Git·권한변경·outbound queue·EPERM재시도·새세션/에이전트 금지. 작은 JSON 분석만 가능하며 root의 profiler 진단을 방해하는 부하를 만들지 않는다.

p95/p99(최근접 순위), 긴 프레임 개수, 첫 입력/첫처치2 batch의 rAF 관측 시각, focus/options/기록누락/cleanup 일관성을 대조하라. 밀집은 alive>=30이며 화면 내 적 수 아님. synchronousDrawCPU는 동기 경과시간이고 CPU 계산 전용/GPU완료시간 아님. 기존Chrome프로필/캐시UNKNOWN/오버헤드미측정/비교불가를 유지한다. 수치뿐 아니라 분석기가 데이터 이상을 누락하고 eligible로 잘못 확정하는 경계도 확인하라. 프로파일링 원인귀속은 root가 별도로 시행하므로 추측하지 않는다.

수신·실제Read·입력해시·검사·결과·한계를 전용receipt/result에 한국어로 기록해 한 번 제출한다. root에게 자동메시지 전송은 하지 않는다.
