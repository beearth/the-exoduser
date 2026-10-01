# PM-009/D10 저장 호출부 통합 후보 — ITEM

완료 2026-10-01 15:12:35.541 UTC (KST10월2일00:12:35). 소유 경로의 **실행 가능한 신규 검토 생성 adapter + 실제 호출부 미적용 patch**를 구현했다. 생산 통합 완료가 아닌 root 검토 제출이다. 이번 한 건 후 인계한다.

## 실제 누락과 구현 범위

현행 game/easy의 mkItem은 슬롯 UNIQUE_SPECIAL만 처리하며 uniqueId/UI-10/uniqueRoll 생성 호출이 없다. current binding-ports는 독립 API일 뿐 mkItem·로드·게임 소비 호출자가 없다. 반면 dbSave의 bag/equipped는 전체 객체를 그대로 JSON에 포함하고 공유창고는 JSON.stringify(arr)를 사용한다. 따라서 uniqueRoll을 화이트리스트에 추가하는 저장 수정은 **필요하지 않다**. dbRestore는 기존 객체를 복원하며 D10 재생성 호출이 없다. 불필요한 저장/복원 수정은 하지 않았다.

`persistence-integration-port.mjs`의 createD10PersistenceIntegration({mkItem,rng})는 기존 binding 모듈을 그대로 재사용한다. `createReview({proposalOnly:true,uniqueId:'UI-10',tier,element,baseRarity})`만 실제 mkItem('armor',...)을 새로 호출한 뒤 createNewIdentifiedD10Instance를 호출한다. 로드 객체를 bind하는 공개 API는 만들지 않았다. tier0~4/element0~5/baseRarity0~4는 **검토 fixture 기본 인자 범위**이며 신규고유 출현등급/드롭정책이 아니다. rarity5 슬롯유니크 변환·기존 binding 재생성은 거부한다. 기존 이름·affixes·소켓·legendary 필드는 변경하지 않는다; baseRarity4의 기존 legendary 표현도 그대로이므로 이것을 새 고유 채택/이중효과 정책으로 해석하지 않는다.

`persistence-integration-minimal.patch`는 양쪽 실제 defaultItems 앞에 명시 검토 생성/read 호출부만 추가하는 후보이다. 함수 본문을 실제 소스의 메모리 사본에 삽입·추출하여 adapter와 동일함을 검증했다. normal drop/defaultItems/dbSave/dbRestore/전투 호출은 변경하지 않는다. 새 일반게임 아이템 생성이나 신규 활성화를 허용하는 패치가 아니다.

## root/UIUX/BALANCE 소비 API

| API | 계약 |
|---|---|
| createD10PersistenceIntegration({mkItem,rng}) | 실제 fresh mkItem 주입 필수, disabled/proposal/runtimeReady=false 포트 |
| _createD10ProposalForPersistenceReview(request) | root가 설치할 window._d10PersistenceReviewPort를 통해 명시 신규검토 요청만 생성 |
| serializeItem(item) | 깊은 plain JSON snapshot; getter/toJSON 실행없이 부정메타데이터 거부; 일반세이브 전역교체용 아님 |
| restoreItem(item) | 기존 restoreD10Instance: 같은 객체 그대로 반환, 수리/재롤0 |
| readItem(item), _readD10ProposalForPersistenceReview(item) | 실제 readD10Binding 조회; valid만 proposal, missing/legacy/invalid 그대로 |
| readStoredRoll(item,definition,roll) | 실제 binding-d10 readStoredRoll → d10-consumer 호환 저장값 조회; 유효.15 또는 null |
| consumer | 실제 createBoundD10Consumer 기본 disabled; begin은null, 효과활성0 |

저장 schema는 uniqueRoll:{version:1,effectId:'U-D10',stat:'_uSlamEmberRage',unit:'fraction',storedValue:.10~.20}이며 정수10~20%의 정규소수만 유효하다. 이름을 제안 카탈로그명으로 강제하지 않고 기존 mkItem 이름을 보존한다. runtimeReady=false·정의22종 비활성·미채택 아트·미구현 효과 상태 유지. 정의/roll-values/binding 원파일 수정0.

## 실제 검수

명령: `node tools/team-followup-20261001/ITEM/persistence-integration-check.mjs`.

- actual mkItem/rollAffixes/전체 dbSave/dbRestore/공유창고 함수를 acorn으로 추출한 VM fixture다. 임의 축약 serializer가 아니다. 사용자 세이브·실서버·계정 접근0; DB/localStorage는 메모리 대체다.
- game/easy × bag/equipped/storage × 7종 fixture =42시나리오, 각2회 **84왕복 PASS**. 신규 valid, 일반 base, 구형슬롯 uniqueSpecial, 유골함, UI10 missing롤, invalid version2, unknown ID를 비교했다.
- 실제 fresh armor의 비어있지 않은 affixes와 소켓을 포함한 전체내용이 uniqueId/uniqueRoll 추가 외 동일하다. JSON 저장/로드 이후 전체내용·이름·롤·affixes·crystals 동일, raw VM 객체도 조회 유효. 복원/조회 D10 RNG0, 원복원 RNG0(canonical 소켓 fixture에 한정).
- 명시 신규 D10 생성에서 주입 D10 RNG는 정확1회, 양끝10/20%도 각1회다. **기존 mkItem 자체의 base/affix/socket RNG는 별도**이고 제거하지 않았다. evidence의 creationD10Rng=1은 파일별 신규 제안 하나의 누적 호출수이며 legacy마다 생성했다는 의미가 아니다. 기존 소켓누락 마이그레이션 RNG와 affixes 보충은 유지한다.
- proposalOnly=false/다른ID/기본rarity5/부정tier/포트미설치 거부; 잘못된요청은 mkItem/D10 RNG 호출 전 실패한다. nested toJSON 직렬화 거부·훅 실행0. 소비 begin은 신규/로드 모두null이다.
- patch를 메모리 적용한 양쪽 소스에서 원 dbSave/dbRestore 본문 동일 확인. production 전체SHA·원함수SHA·binding 의존SHA·patchSHA는 evidence에 기록했다. production 검사 전후 불변이다.

## 인수 블로커와 다음 게이트

**브라우저 bootstrap/포트 설치가 현재 없다.** root가 선택한 검토 전용 bootstrap에서 createD10PersistenceIntegration({mkItem:실제함수,rng:명시주입}) 결과를 window._d10PersistenceReviewPort에 설치해야 새 wrapper가 사용 가능하다. 지금 `.mjs` 후보를 기존3340 서버에 직접 import할 수 있다고 주장하지 않는다; JS MIME/번들·초기화 순서·실제 review-only 호출자는 아직 미구현/미검수다. 그러므로 patch 단독 적용으로 생산 저장 통합 완료라고 판정할 수 없다. 포트 미설치 시 생성은명시오류, 조회는null이며 기존게임은 영향없다.

신규 활성화·정의채택·출현 가중치가 없는 현재 상태에서 일반 드롭 mkItem에 자동 binding하면 계약을 위반한다. 그 연결은 보류하고, 승인 백로그 중 독립적으로 가능한 **fresh 검토생성→기존 실제 저장→복원→stored-roll 소비 포트** 한 건만 구현했다. 전투 효과/자동 bag삽입/legacy 누락값 보충은 하지 않았다. 추가 사용자 선택질문 없이 정확한 누락과 후보를 root에 제출한다.

공유 docs 변경 제안: ITEM_TEAM_MASTER 및 UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT §4/BINDING-root-review에 위42시나리오/84왕복·새 검토 생성API·브라우저 bootstrap 미설치·생산 미적용을 추가하되 과거61PASS/활성0/저장마이그레이션 제한은 유지한다. 관련 docs 전체검색은 persistence-integration-docs-related.txt에 보존했다. 공유 docs 쓰기0.

남은 게이트: root 후보/실제함수 독립검수 → 검토 전용 bootstrap/MIME 선택 → 합성 review fixture 저장/로드 UI 인수. 향후 실게임·패키지·활성/드롭 채택은 별도 승인이며 이번 완료에 포함하지 않는다. 게임/브라우저/서버/대형빌드/Git/권한변경/queue/새세션/새에이전트0. game/easy/index/server/타팀/원자료 쓰기0.
