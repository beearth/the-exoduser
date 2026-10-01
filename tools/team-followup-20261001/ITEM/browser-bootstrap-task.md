# ITEM-20261002-BROWSER-BOOTSTRAP

직전 persistence-integration 후보 42시나리오/84왕복 완료를 확인했다. 기존 binding·port를 재작성하지 말고 누락된 검토 전용 browser bootstrap/callsite를 구현한다. AGENTS, ITEM 팀 MD, 저장 계약, persistence-integration 결과/port/patch부터 읽는다. 소유는 `tools/team-followup-20261001/ITEM/browser-bootstrap-*`뿐이다.

- 기존 port를 명시적으로 설치/해제하는 API와 reviewOnly opt-in 호출부 후보를 만든다. 기본 자동설치·drop·dbSave 라우터 연결·effect 활성화는 금지한다. proposal/inactive/runtimeReady=false 계약 유지.
- 중복 설치, 원래 window property 보존, 설치 중 예외의 rollback, uninstall 후 타 주체가 교체한 property 보호를 구현·격리 회귀 검수한다. 검토 UI의 신규 생성/읽기 호출을 실제 port로 연결하는 최소 미적용 patch를 낸다. restore 재롤0, legacy/missing/invalid 값을 채우지 않는다.
- .mjs 및 전이 import의 브라우저 MIME 조건을 현행 server.cjs 소스로 확인한다. production 서버 변경 없이 가능한 .js 산출/미적용 연결 방안을 제시하고 실제 import를 수행하지 않았으면 UNKNOWN으로 구분한다. 소스 전체 복제/메모리 전용 성공을 제품 적용으로 쓰지 않는다.
- 실제 함수/포트 사용 작은 Node/VM fixture로 성공·실패·정리·기존 RNG/데이터 보존을 검수한다. 사용자 세이브 접근0.

사용자 게임이 현재 Chrome `mac-play-20261002.localhost:3340/game.html?webgpu=0`에서 열려 있다. 입력·리로드·닫기·계측·새 게임/브라우저/서버·다운로드·설치·빌드0. game/easy/index/server/공유 docs/타팀 소스 수정0, Git/queue/새세션/새에이전트0. 공유 docs는 변경 제안만 결과에 적는다. 수신·중복 확인 후 receipt를 먼저 쓰고 실제 Read/첫 코드 Edit/검수/완료 시각을 기록한다. 기존 결과 덮어쓰기0. 이번 한 건 구현·검수 후 root 인계.
