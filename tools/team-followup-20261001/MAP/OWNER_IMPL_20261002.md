# MAP-20261002-MANUAL-LIFECYCLE-FIX

root가 manual-input 기존27 검사를 재실행했다. 추가 반례 3건이 실제 실패하므로 전체 인수는 보류하고 바로 원담당 파일에서 고친다. 필수 맵 가이드 v0.9 전문/_MAP_SSOT_INDEX/맵디테일 선독을 유지한다. 원자료 `outputs/team-review-20261001/five-owner-acceptance/counterexamples-before.json` 및 root 재현기 `root-review/five-owner-counterexamples.mjs`를 읽는다.

확인 오류: (1) 두 번째 addEventListener 예외 시 첫 리스너1개 누수, (2) hidden 이벤트로 leg를 닫아도 다음 tick에 held 키가 있으면 숨김 상태 새 leg/표본2개가 생김, (3) start 두 번 후 마지막 ctl만 stop하면 첫 interval1+listener3이 남음. 시작 부분 실패/중복/포커스손실의 하나의 lifecycle 계약으로 해결한다.

소유 쓰기: 실제 `MAP/manual-input-observer.js`, `MAP/manual-input-fixture.cjs`, 신규 `MAP/manual-lifecycle-*`, 이 폴더 `OWNER_IMPL_20261002-{receipt.json,result.md}`. 기존 unsafe/safe 주입 하니스 및 evidence gate 원본 보존. game K/P/G/map 쓰기0·passive 관측 유지. 숨김/blur 뒤 표본을 중단하고 명시적 focus/visible 복귀를 확인한 새 leg로만 재개, 이전 held 입력을 실사용자 새 입력으로 가정하지 않는다. 중복 인스턴스와 부분 설치는 소유 핸들을 잃지 않게 정리한다. remove/cancel 실패를 성공으로 숨기지 말고 재시도 가능 여부/불명 상태를 기록한다.

최소3반례 RED→GREEN + 정상27/stop/abort/focus복귀/cleanup예외 회귀. 실제맵/8뷰/좌표경계 시각PASS는 이번 없음, 기존 RETOUCH 유지. MAP PRODUCTION REPORT에 미측정 시각 범위를 명시한다. 게임/브라우저/서버/빌드/새세션/새에이전트/queue/Git/권한/생성0. 사용자 게임 그대로 유지. 공유docs·타팀 파일 수정0; 수신/Read/Edit/검수/완료시각과 docs 반영안은 소유폴더만 기록.
