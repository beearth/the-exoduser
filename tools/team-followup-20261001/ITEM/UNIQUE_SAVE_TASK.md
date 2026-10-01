# ITEM-UNIQUE-SAVE-NAME-CANDIDATE

기존 ITEM 완료 세션의 승인된 PM-009 다음 한 건. ITEM_TEAM_MASTER와 UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md 및 현재 본편/easy dbRestore를 먼저 읽고 동일 과제/대기열/산출이 이미 있으면 중복 실행하지 마세요.

root가 현재 두 HTML에서 _fixWpnName 원문을 추출하여 uniqueId:'UI-08',slot:'weapon',wtype:'dagger',name:'고유 단검 이름',rarity:5,_nameMig 없음 fixture로 실행했습니다. 양쪽 모두 _weaponName 결과 '일반 단검'으로 덮고 _nameMig=1을 기록했습니다. 신규 고유 드롭이 현재 존재한다는 뜻이 아니라 승인된 사전 저장 계약의 구체적인 간극입니다.

이 한 건을 실제 미적용 최소 후보로 구현하세요: 이미 저장된 비어 있지 않은 문자열 uniqueId가 있는 아이템의 고유 이름·ID·기존 롤을 구형 무기 이름 마이그레이션이 덮지 않도록 보존. 없는/빈/잘못된 타입 uniqueId와 기존 슬롯 유니크/유골함은 원 동작 유지. 미등록 문자열 ID도 삭제/재롤/자동신형변환 금지. 새 등록목록·드롭가중치·효과·번역·아트 채택·환수 정책을 만들지 마세요. 이미 원문이 수정됐다면 중복패치 대신 증거만 보고하세요.

실제 dbSave/dbRestore 이름 및 저장 전달 경로를 추출한 격리 JSON왕복 fixture로 원실패→후보통과를 보이세요. 가방·장착·창고의 정확한 현행 경로, 구형 유니크·유골함·미등록ID·소수롤·반복restore·빈/invalidID를 포함하고 게임 RNG를 호출하지 않는지 검사. 창고가 다른 복원 경로라면 정확히 구분하며 무관한 수리나 기존정책을 확대하지 마세요. 실제 전투/세이브 서버/사용자 저장을 쓰지 않습니다.

소유 tools/team-followup-20261001/ITEM/unique-save* 및 이 과제와 docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/ITEM-unique-save-result.md, ITEM-unique-save-receipt.json만 수정. 본편/easy는 읽기만; 최소 표준context diff와 실제 source hash/실패 및 통과 회귀를 제출. docs 전체 관련키워드 검색 및 동기화 제안. 생산/다른팀/공유대장/Git/새세션/브라우저/서버/대형빌드 금지. 한국어 수신/첫Read/Edit/완료와 후속 인수 한계를 기록하세요.
