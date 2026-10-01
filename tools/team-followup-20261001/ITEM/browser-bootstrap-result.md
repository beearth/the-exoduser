# ITEM-20261002-BROWSER-BOOTSTRAP 결과

완료 2026-10-01 15:29:28 UTC / 10월2일00:29:28 KST. 기존 ITEM 세션의 승인 한 건. 기존 binding·persistence 포트 재작성0, 생산 반영0, 사용자 게임 조작0.

## 구현·호출부

| 제출물 | 구현 |
|---|---|
| browser-bootstrap-api.js | installD10Review({host,reviewOnly:true,createPort,mkItem,rng}) 명시 설치, handle.uninstall() 해제; import만으로 설치하지 않음 |
| createD10ReviewController | createNew → 실제 port.createReview, readLoaded → 실제 restoreItem/readItem, serialize → 기존 serializeItem, close → 해제 |
| browser-bootstrap-ui.js | 명시 mountD10PersistenceReview에서만 버튼2개 생성. 신규 합성 fixture 생성/해당 fixture JSON 읽기만; 사용자세이브·bag·DB 연결 없음 |
| browser-bootstrap-ui.patch | 실제 unique-item-project/review.html의 script에 openD10PersistenceReview(options) opt-in 함수 추가하는 미적용 최소 patch. 호출하지 않으면 설치/생성0 |

실제 createD10PersistenceIntegration factory를 주입해 기존 포트를 그대로 설치한다. proposalOnly:true/UI-10 요청 및 proposal/inactive/runtimeReady=false를 유지한다. consumer는 disabled이며 drop/dbSave 라우터/전투효과 활성 연결0. 신규 생성 D10 RNG1, serialize/restore/read RNG0; 원 mkItem의 base/affix/socket RNG는 별도이며 그대로다. legacy/missing/invalid는 채우지 않고 조회 상태를 보존한다.

원 host._d10PersistenceReviewPort의 own descriptor를 getter 실행 없이 보존한다. 비구성 property는 사전거부; inherited property는 own 설치 후 제거하여 다시 드러낸다. 동일 host 중복 및 factory 재진입을 거부한다. 설치 callback 예외 시 자기 descriptor일 때만 rollback하고, 타주체 교체는 덮지 않는다. uninstall도 값과 descriptor가 자기 소유일 때만 원문 복구하며 타교체는 foreign-preserved로 남긴다. 해제/교체 후 controller 호출은 실패한다. 삭제/원복 권한이 없어 rollback 자체가 실패하면 AggregateError로 보고하며 임의 우회하지 않는다. 악의적인 Proxy/동일 descriptor의 ABA 교체를 완전 식별하는 보안경계는 아니다.

UI mount의 부분 DOM 실패는 설치 해제와 자기 노드/리스너 정리를 수행한다. 정상 close는 타주체 DOM/property를 보존한다. textContent 대상은 새로 생성한 리프 버튼/p뿐이다. 모든 버튼의 데이터는 메모리 합성 fixture이며 실제 가방/세이브 쓰기가 아니다.

## MIME 소스 검증과 .js 인수 계획

server.cjs의 실제 MIME 객체와 fallback을 acorn/격리VM으로 읽었다: `.js`는 application/javascript, `.mjs`는 등록되지 않아 application/octet-stream이다. 서버 실행·HTTP 조회는 하지 않았다. **현행 .mjs 직접 브라우저 import는 소스상 부적격**이며 entry 확장자만 바꾸면 전이 import4개가 그대로 막힌다.

이번 실제 신규 산출 api.js/ui.js와 둘 사이 import는 .js다. 기존 factory는 의존 주입 방식으로 재사용하므로 bootstrap 소스 자체에 .mjs import가 없다. 하지만 review.html 현재에는 factory 제공자와 실제 mkItem 의존 제공자가 없으며 자동으로 사용자 게임에서 가져오지 않는다.

서버 수정 없는 인수 방안은 `browser-bootstrap-mime-plan.json`에 전이 그래프/원SHA/정확한 경로 치환을 제시했다. root가 인수한 뒤 기존 persistence-integration-port/binding-ports/binding-d10/d10-consumer 원문을 browser-bootstrap-derived-*.js의 검토전용 파생4개로 내고 import문 경로만 치환한다. 기존 definitions.js/roll-values.js는 원경로 재사용한다. 원 알고리즘을 재작성하거나 전체 game을 복제하지 않는다. **이번에는 파생4개 생성/빌드0이며 계획만 제출했다.** root가 중복 관리보다 canonical .js 이동을 선택할 수도 있으나 이번 범위에서는 원파일을 이동하지 않는다.

후속 명시 opt-in 호출자는 .js factory를 import하고 실제 fresh mkItem·명시 RNG를 주입하여 openD10PersistenceReview를 호출해야 한다. 자동설치/기존 사용자게임 창 접근/드롭 연결은 금지 유지다. 실제 HTTP MIME·브라우저 module import·CSP·검토 UI 시각·패키지는 **UNKNOWN**, Node ESM/VM 성공과 구분한다. patch만 적용하거나 메모리 fixture가 통과했다고 제품 적용 완료로 쓰지 않는다.

## 검수·보존

`node tools/team-followup-20261001/ITEM/browser-bootstrap-check.mjs`: **23 PASS/0 FAIL**. 중복/재진입, 원 data/accessor/inherited descriptor, 비구성 거부, factory/define/callback 실패, rollback, 타교체 보호, stale 호출거부, RNG1/복원0, legacy 보충0, UI 성공·실패·정리, 실제 UI patch 함수 opt-in 호출을 확인했다.

양쪽 game/easy의 실제 mkItem/rollAffixes/전체 dbSave/dbRestore/공유창고 원함수를 추출한 작은 VM fixture에서도 생성→메모리 DB JSON→복원→실제 포트 조회를 확인했다. canonical affixes/socket 필드와 이름/롤 전체내용 보존. 사용자세이브0; 소켓누락 legacy 마이그레이션의 원 RNG를 없앴다고 주장하지 않는다. 23은 검사그룹 수이며 이전42시나리오/84왕복을 이번에 재실행/덮어쓰지 않았다.

`node tools/team-followup-20261001/ITEM/browser-bootstrap-mime-check.mjs`: 소스 MIME 및 전이 import 검사 PASS; 실제 import UNKNOWN. SHA/검사시간은 browser-bootstrap-evidence.json 및 mime-plan.json에 있다. server/game/easy/review와 기존 포트·binding 원문은 검사 전후 byte 동일하다. 이전 증거/결과는 덮어쓰지 않았다.

관련 docs 전체검색은 browser-bootstrap-docs-all.txt, 선행 Read 검색은 docs-related.txt로 기록했다. 공유 docs 변경 제안: ITEM_TEAM_MASTER/저장계약/BINDING-root-review에 명시 설치수명주기·23그룹 PASS·.mjs MIME 부적격·파생 .js 계획·브라우저 UNKNOWN·제품 미적용을 추가하고 기존 활성0/61PASS/42시나리오 근거를 유지한다. 공유docs 쓰기0.

수신/첫Read15:26:21Z, 영수증 최초작성15:26:21.393Z, 첫 코드Edit15:27:11.490Z(filesystem birthtime), 최종검사15:29:27.993Z. 금지된 입력/리로드/닫기/계측/새게임/브라우저/서버/다운로드/설치/빌드/Git/queue/새세션/새에이전트 실행0. 브라우저 설치API는 Node fixture에서만 테스트했으며 사용자 Chrome에는 설치하지 않았다.

남은 gate: root 독립검수 → 기존 포트의 검토전용 JS/MIME 의존 제공 → fresh mkItem 검토호스트 제공 → 승인된 별도 검토 UI import/시각/정리 인수. 이번 구현·격리검수 한 건 완료 후 root에 인계한다.
