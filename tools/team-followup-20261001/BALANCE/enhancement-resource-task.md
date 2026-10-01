# BALANCE-20261002-ENHANCEMENT-RESOURCE

물리 이미지 정상 로드 경계는 root 통합·22회귀·실전55캐시 호출·BUILD23 독립 인수까지 완료했다. 다음은 기존 경제/자원 백로그의 장비 강화 가능 게이트 → 실제 차감 → 저장 스냅샷 계약 검수·수정 후보 한 건이다. AGENTS, BALANCE_ECONOMY_TEAM_MASTER, 인벤토리/강화/자원/저장 SSOT와 기존 비용·환수 검사를 먼저 읽는다. 소유는 `tools/team-followup-20261001/BALANCE/enhancement-resource-*`뿐이다.

- 본편/easy의 실제 enhCost 및 강화 핸들러를 추출해 0악의·요구액-1·정확 요구액·요구액+1, 성공/실패 RNG, max/불가대상 경계에서 게이트·차감·아이템/보유자원·저장 결과를 대조한다. 실제 정의된 제한만 사용하며 강화상한을 새로 만들지 않는다.
- 비용등급/올림/할인 또는 게이트와 차감의 재현 가능한 불일치가 있으면 현행 확정값을 바꾸지 않는 최소 미적용 patch와 before/after 회귀를 제출한다. 결함이 없으면 실제 호출부 기반 계약 validator를 제출하고 미결 환수정책은 그대로 둔다. signed32 환수 수정·PM013C 무료스킬강화는 재작업하지 않는다.
- 저장 경로는 메모리 fixture에만 연결. 사용자 세이브·공유악의 서버·실행게임 접근0. ITEM browser-bootstrap/D10 생성/저장 adapter는 읽기 전용이며 중복 구현하지 않는다. formula·드롭·고유효과·보호설계·환수율 변경0.

현재 사용자 Chrome 게임은 그대로 유지한다. 입력/리로드/닫기/계측/새 게임·브라우저·서버/설치·대형빌드0. production·공유 docs·타팀 수정0, Git/queue/새세션/새에이전트0. docs 변경 제안은 결과에 적는다. receipt에 수신·중복/실제 Read/첫 코드 Edit/검수/완료 시각을 기록하고 이번 한 건 후 root 인계.
