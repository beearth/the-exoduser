# D17 clear 생명주기·저장롤 공급 검토 후보

기존 ITEM 다음 승인 한 건. 인수된 d17-source-adapter를 바탕으로 실제 clear/reset/로드/캐릭터 전환 callsite와 D17 저장롤 공급 계약을 독립 source fixture에 연결한다. 기본 비활성·review-only·생산 미연결을 유지하고 이전 adapter/검사/증거 byte 보존. 생산 HTML은 읽기만, ITEM 후보 prefix와 관련 팀 문서만 소유. root 기준 원격6be3a06b4e8d03768a35f4c57d419f45c8efeb39.

AGENTS·ITEM master·TOP8/D17 SSOT 및 실제 소스에서 확인한 함수/필드를 읽어 실제 callsite 원문/SHA를 기록. 실제 저장 데이터에 D17 공급 필드가 없다면 있다고 만들지 말고, 검증 가능한 후보 정의/저장 계약과 실제 미연결 경계를 분리한다. unknown/invalid/missing roll이면 효과0으로 실패 처리. 새 드롭/경제/최근접·tie 정책 채택/실전 DPS 변경 금지.

source fixture에서 clear/reset/캐릭터 전환을 실행하여 stale provenance 폐기, 동일 객체의 새 cast, 새 캐릭터/플레이어 객체, 잘못된 롤·누락 롤 효과0을 검사한다. 실제 함수에 장착/저장/전투 부작용이 있으면 필요한 경계만 추출하고 fixture 대역 범위를 표시하라. 기존 실제 객체 identity 및 좌표 외 필드 보존. 구현 연결 코드와 실행 검사가 필요하며 보고서만 제출하지 않는다.

소유: tools/team-followup-20261001/ITEM/d17-lifecycle-roll-*와 ITEM 관련 docs. 공용 총괄/CHANGELOG 수정 금지. UI/게임/서버/빌드/인코딩/설치/새 세션/하위에이전트/Git 쓰기 금지. BUILD 패키징 및 BALANCE의 작은 HTTP 테스트와 독립적으로 진행. docs 전체 관련검색, 실제 UTC receipt·원문/함수 SHA·변경파일/의존성·남은 게이트를 적고 한국어로 인계.
