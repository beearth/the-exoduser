# UIUX 생산 반영 — 단독 HTML 소유권

기존 승인된 UI-04 card-removal-focus 후보를 game.html과 game-easy-test.html에 반영한다. 현재 원격/HEAD 35ddea9d41ecf776e4ddf781566d3ff5dad53017, 두 HTML clean, 공유 index empty를 root가 재확인했다. 기존 card-removal-focus-main/easy-combined.patch와 root outputs/team-review-20261002/mac-app/uiux-native-matrix.json 8 PASS를 먼저 읽어라.

이번 작업 동안 두 HTML의 인벤토리 함수/이벤트 구역은 UIUX 단독 소유다. 저장 함수는 수정하지 않는다. 승인 후보의 초점 소유권, Enter/Space/Tab, 카드 제거/재렌더/닫기 복귀만 적용한다. 레이아웃/CSS/데이터/RNG/전투 변경 금지. 원본 및 기존 후보/검사/증거 파일은 byte 보존한다.

실제 반영된 HTML에서 함수를 다시 추출하는 production-integration 회귀검사를 별도로 만들고 두 버전 검수. 기존 before RED 회귀는 삭제/약화하지 않는다. 기존 후보 검사들은 생산 변경 전 원본 fixture가 필요하면 production-integration 전용 fixture/별도 경로로 보존해 재현 가능하게 하라. 모든 inline script 구문 검사도 수행한다. 실제 브라우저/패드/시각 전체 검수 완료라고 주장하지 않는다. Mac 잠금 때문에 UI 도구/게임/빌드/인코딩 실행 금지.

AGENTS, UIUX SSOT, 인벤토리 SSOT를 먼저 읽고 docs 전체 관련 검색 후 현재 적용 상태와 미검수 범위를 관련 SSOT에 동기화한다. 공용 총괄 문서와 CHANGELOG는 root가 작성하니 수정하지 않는다. tools/team-followup-20261001/UIUX/production-integration-*에 task receipt, 결과, 변경 파일 목록, 검사 명령, 실제 UTC와 hash를 기록한다. 새 도구의 로컬 import 의존 파일 목록을 적어 root가 정확히 백업할 수 있게 하라.

Git add/commit/push는 root 단독 담당. 타 팀 WIP/사용자 초안/index/기존 증거 보존. 끝나면 HTML 소유권을 root에 반환하고 추가 HTML 편집 없이 결과를 한국어로 보고한다. 새 세션/하위 에이전트 생성 금지.
