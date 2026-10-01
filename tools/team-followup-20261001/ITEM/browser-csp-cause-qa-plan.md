# QA 전용 실제 검수 게이트

담당 ITEM의 실제 UI/HTTP 실행0. QA가 승인된 UI 슬롯에서만 실행한다. 사용자 게임 tab1573846373/기존 앱/세이브에는 접근하지 않는다. 서버 시작/포트우회/다운로드/설치는 필요하지 않으며 연결 안 되면 원인 UNKNOWN으로 보고한다.

검수 URL: `http://127.0.0.1:3340/tools/team-followup-20261001/ITEM/browser-host/index.html`

원자료 표시: 호스트의 `pre#errors`에 schema item-review-csp-journal-v1, startedUtc, listenerPhase, limitation, violations[], runtimeErrors[] 전체 JSON. `p#counts`에 base/D10/restore RNG 및 restore 조회 횟수. 전용 namespace `window._itemReviewCspJournal.snapshot()`도 동일 원자료를 반환하지만 QA가 UI 읽기만으로 확보할 수 있다.

1. 초기 버튼 미호출 상태의 `errors` 원문/상태/카운터를 기록한다. sourceFile/lineNumber/columnNumber/blockedURI/effectiveDirective와 timeStamp·phase를 보존한다. journal 미실행/fallback이면 startup UNKNOWN 표시도 기록한다.
2. reviewOnly opt-in→설치→신규 생성→JSON 복원→해제 기존 순서를 명시 호출한다. 복원 RNG0, 원 port property/해제 자식0 및 이벤트 배열이 초기 원자료를 유지하는지 확인한다.
3. 이후 사건이 있으면 초기·설치·이후 phase/sequence를 구분한다. 본 호스트는 합성 inline style 반례를 자동 주입하지 않는다. 별도 diagnostic 페이지의 positive control을 원 startup 사건에 합치지 않는다.
4. CSP0관찰을 globally clean으로 판정하지 않는다. 외부 classic 실행 전 주입은 미관찰이고 sourceFile 빈값/line0/sample빈값은 그대로 남긴다. 원주입자 근거 없으면 UNKNOWN 유지한다.

제안 실제 출력 위치(담당 ITEM은 생성/덮어쓰기하지 않음): `outputs/team-review-20261002/acceptance/item-browser-csp-cause.json` 및 해당 QA proof. 기존 item-browser.json/proof는 보존한다. QA 승인 출력 범위가 다르면 QA 소유 고유 경로를 사용한다.

실제 결과에 browser/surface/UTC/URL/host source SHA, 초기 pre 원문, 명시 행동별 상태 및 counters, after uninstall 원문, listener 미관찰 한계와 최종 귀속 UNKNOWN/PASS를 구분해서 기록한다. 코드 파일 수정·Node fixture 성공은 실제 UI·CSP enforcement 검수로 대체하지 않는다.
