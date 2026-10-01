# ITEM U-D17 실제 소스 어댑터 — 비활성 검토용

기존 d17-zone-selection 후보를 읽고 실제 blackStar 종료 및 플레이어 zone 생성 지점에 연결할 수 있는 어댑터 코드와 회귀검사를 만든다. 생산 HTML 편집권은 UIUX에 있으므로 game.html/game-easy-test.html은 읽기만 허용. root 현재 복구점 35ddea9d41ecf776e4ddf781566d3ff5dad53017.

tools/team-followup-20261001/ITEM/d17-source-adapter-* 범위에서 구현한다. 기본 비활성, review-only 유지. 실제 소스에서 추출한 종료/생성 fixture와 해시를 쓰고, zone의 실제 객체 identity를 유지하며 승인된 좌표만 바꿀 수 있게 하라. 실제 없는 범용 owner/boss 태그를 기존 필드인 것처럼 가정하지 않는다. 불확실한 소유권/보스/고정/추적 장판은 제외. 600px 및 stored roll 1..3 기존 검토 계약을 유지하되 최근접/tie 선택은 채택 확정 설계가 아닌 검토 정책임을 표시. U-D13 자식 trap 미확정 정책은 제외.

실제 blackStar 종료 한 번, 중복 종료, clear/reset, 재사용/새 cast, 기존 object identity와 좌표 외 필드 보존, 비활성0변경, 확인 불가능한 zone 제외를 검사한다. 구현 연결 코드가 필요하며 보고서만 만들지 말 것. 생산 hook/아이템/드롭/경제 변경0.

AGENTS, ITEM_TEAM_MASTER 및 UNIQUE_TOP8_HOOK_REVIEW, 관련 D17 SSOT를 읽고 docs 전체 관련 검색과 팀 문서 동기화. 공용 총괄/CHANGELOG는 root가 작성한다. 기존 후보/증거 byte 보존. 정확한 UTC receipt, 결과, 변경 파일/로컬 import 의존성 목록 기록. Git add/commit/push는 root 담당. UI/게임/빌드/인코딩 실행 금지. 새 세션/하위 에이전트 생성 금지. 완료 후 한국어로 결과 보고.
