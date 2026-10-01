# UIUX 데모 범위 회귀 통합

2026-10-01 root가 원 후보를 검토하여 test/demoScope.test.js에 반영했다. 페이지 전체에서 DEMO CHARACTER 다음에 신규 안내가 나와야 한다는 낡은 순서 검사를 실제 카드 함수 실행으로 대체했다. 신규/저장 2종 진행 상태 × 한국어/영어 총 6경로에서 이름·레벨·처치·브라우저 저장 표시 및 입력 불변을 검사한다. 기존 Lv100/1-1 게임·문서 범위 검사는 유지한다.

독립 후보 실행 23/23, 반영 후 공용 demoScope/demoSaveRoute/lobbyCardLanguage 23/23 PASS. 신규 Lv2·저장 진행 누락·영어 처치 번역 오류의 3개 변이는 각각 정확히 1개 실패를 검출했다. 실제 화면·브라우저 실행은 미실시다. index/game/easy는 이 작업으로 바꾸지 않았다.

이전 원본은 원격 b043cd7d52e028a51dbd65cbc0d1d9e1214d7c08에 보존돼 있다. demo-scope-build.mjs는 수정 전 test에 고정된 후보 생성기이므로 현재 통합 후 원본 assertion 부재로 fail-closed한다. 원본 재현이 필요하면 별도 사본의 해당 커밋에서 실행한다. 생성하는 HTML 변이·임시 test 복사본은 생산 의존성이 아니며 통합 대상에서 제외했다. 영구 회귀 실행은 node --test test/demoScope.test.js test/demoSaveRoute.test.js test/lobbyCardLanguage.test.js다.

ITEM/BALANCE 커밋 검사의 유일한 whitespace 경고는 기존 CRLF 문서 행의 CR이었다. 줄끝 형식을 보존했으며 별도 생산 코드 공백 오류는 없었다.
