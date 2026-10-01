# ITEM-PM009-DEFINITION-VALIDATION

기존 ITEM 담당이 이어서 수행하는 승인된 PM-009 정의/유효성 구현 한 건이다. 완료된 이름 수리/ring 픽셀 검사는 반복하지 않는다.

먼저 UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md §3/4, 유니크_어픽스_리스트.md D절, 카탈로그, unique-item-project 및 기존 후보를 직접 읽어 중복 확인. §3의 22종 제안 대응을 실데이터로 담는 조회·검증 계층을 소유 경로 tools/team-followup-20261001/ITEM/definition-* 에 구현한다. 비어 있는 프레임워크만 만들지 않는다. 연결 제안임을 보존하고 전종 기본 비활성: 아트·효과 구현·번역 채택 미완료를 구체적으로 보고한다. effectId는 문서 존재와 런타임 효과 활성화를 구분한다. 이름 번역 키가 없으면 invent/번역하지 말고 미등록 상태를 명시한다.

중복 uniqueId/effectId, 없는 효과 참조, 22종 슬롯/무기타입 불일치, missing/unaccepted art, 활성화 불가를 검출. 문서의 UI-06/17/22 helmet, ring1/2, weapon sword/dagger/hammer, bow crossbow를 검증한다. 미등록 ID·uniqueId 없는 기존 UNIQUE_SPECIAL·유골함은 null lookup/원래 폴백으로 유지; 인스턴스 수정·삭제·재롤·효과 이중 지급 금지. 신규 드롭 가중치·효과 수치·색·아트 채택은 만들지 않는다.

브라우저에서도 읽을 수 있는 순수 데이터/조회 모듈과 Node 테스트를 작성하며, 주입 데이터의 부정 사례와 실제22종 대응을 검사한다. root가 독립 검수 후 unique-item-project의 기존 검수/조회 경로 등 적절한 소비 경로에 통합한다. 공용 game/easy/index/build/test/docs 원문은 직접 편집하지 않는다. 생산 조회 연결 후보가 필요하면 정확한 함수/폴백 조건의 미적용 패치만 제출한다. 실제 완성된 신형 아이템/효과 연결로 보고하지 않는다.

docs 전체 관련 검색과 전용 docs/.../vscode-dispatch/ITEM-definition-result.md, ITEM-definition-receipt.json에 수신/첫 Read/Edit/검증/한계를 구분. 새 세션·하위에이전트·게임·서버·Git 쓰기 금지. 코드와 실제 자료에 근거해 구현/검증까지 마친다.
