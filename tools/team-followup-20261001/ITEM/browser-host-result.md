# ITEM-20261002-BROWSER-HOST — 독립 호스트 인계

독립 구현·Node 검수 완료. 생산 반영 및 실제 브라우저 인수는 하지 않았다. 소유 browser-host-* / browser-host/ 외 쓰기0. 기존 bootstrap/port/binding/definitions 원문은 변경하지 않았다.

## root 인수 위치와 순서

호스트: `tools/team-followup-20261001/ITEM/browser-host/index.html`.
root가 승인된 독립 reviewOnly origin의 기존3340에서 이 경로를 열어 확인한다. 담당 ITEM은 브라우저를 열지 않았고 사용자 tab1573846373도 조작하지 않았다.

1. 최초 화면은 진단 준비뿐이다. 포트 설치/아이템 생성/RNG 호출은0.
2. reviewOnly 체크박스 → **의존 확인 후 검토 설치**. 전이 HTTP/MIME를 확인하고 실제 .js factory·fixture·기존 bootstrap UI를 import한다. 설치만으로 신규 생성하지 않는다.
3. 기존 bootstrap의 **새 제안 fixture 생성** → **fixture JSON 읽기**. 합성 armor 한 개만 메모리에서 생성/JSON 복원한다. base RNG와 D10 RNG 및 restore RNG 카운터가 분리되어 표시된다.
4. **검토 해제**는 기존 UI.close를 호출해 자기 DOM/리스너를 제거하고 bootstrap 원 property 보존 계약으로 해제한다. 자동 재설치0.

게임/DB/사용자세이브/가방/공유악의/드롭/효과 연결이 없다. 설치 API 소비 대상은 이 독립 호스트 window이지 기존 게임 window가 아니다. 설치에는 항상 reviewOnly:true, 생성에는 proposalOnly:true/UI-10을 전달하며 enabled=false/runtimeReady=false 유지. 해제 중 타주체 property가 교체되었으면 원 bootstrap이 그대로 보존한다.

## 재현 가능한 변환·출처

`node tools/team-followup-20261001/ITEM/browser-host-transform.mjs --emit`은 파일명→원문 JSON을 stdout에 내며 원본/파일을 쓰지 않는다. 이 명시 소형변환 산출을 소유 경로에 저장했다. 패키지/게임빌드/다운로드/설치 실행은0이다.

| 원 .mjs | 생성 .js |
|---|---|
| persistence-integration-port | browser-host/persistence-integration-port.js |
| binding-ports | browser-host/binding-ports.js |
| binding-d10 | browser-host/binding-d10.js |
| d10-consumer | browser-host/d10-consumer.js |

acorn ImportDeclaration의 source literal 범위만 치환했다. import literal 역치환 결과가 원파일 **전체 byte와 정확히 동일**함을 assert한다. 알고리즘·export·함수·기존 주석을 재구현하지 않았다. definitions.js/roll-values.js와 bootstrap-api.js/ui.js는 원경로를 재사용한다. source/target SHA와 치환 위치는 browser-host/manifest.json에 기록한다. 기존 MIME 계획의 의미는 그대로이며 nested 소유 폴더에 맞춰 상대경로만 조정했다.

fixture는 game.html 전체나 전체 inline script가 아니라 **상수9개 + rollAffixes/mkItem 원함수2개**만 추출했다. EL/RARITY_MUL/SLOT_NAMES/SLOT_EMOJI/AFFIX_POOL/_AFSLOT/IMPLICIT_TABLE/LEGENDARY_SPECIAL/UNIQUE_SPECIAL의 원문을 재사용한다. 각 조각 SHA와 byte수도 manifest에 기록했다. 브라우저에서 eval/new Function이 필요하지 않는 정상 .js 모듈이다.

fixture config는 로컬 P.lv=20/demo=false, armor만 허용, 로컬 Math.random/Date.now 의존주입이다. 다른 슬롯/전체 게임 초기화를 지원하지 않는다. 기본 .5 결정적 RNG와 clock100000을 사용하는 **합성 fixture**이며 실전 랜덤 분포/아이템ID 유일성/드롭정책을 재현한다는 주장은 아니다. 기존 mkItem의 모든 armor/base/affix/socket RNG 호출을 유지하고 D10 RNG를 분리한다. 이름/affixes/socket/crystals/유효 저장값은 JSON 왕복 동일, legacy/missing/invalid 조회는 무수리·무재롤이다.

## HTTP·CSP 상태와 검수

HTML은 self-only 외부 script/style 및 connect-src self, default-src none CSP를 설정한다. 초기 정적 문구는 host.js 자체가 막혀도 CSP/MIME 미실행 상태를 안내한다. 명시 설치 후에는 manifest/모든 전이 .js HTTP 상태·Content-Type을 확인하고 실패 URL/status/MIME를 상태에 표시한다. CSP violation/error/unhandledrejection 및 dynamic import 예외도 리프 상태노드에 표시한다. 숨은 inline/eval/CSP 완화는 없다. 정확한 HTML/module 응답은 root 실제 서버 인수 게이트다.

`node tools/team-followup-20261001/ITEM/browser-host-check.mjs`: **12그룹 PASS/0FAIL**. 원문 역치환·실산출 byte대조, 의존/원함수, server.cjs MIME, 전체 JSON 데이터 보존, 신규 D10 RNG1/base별도/restore RNG0, legacy 무보충, HTTP/MIME/CSP 오류 fixture, 자동설치0, 기존 UI의 실제 .js 체인 Node import·버튼·해제·타교체 보호를 확인했다. Node dynamic import는 실제 생성된 파일의 정상 ESM import이며 임의메모리 factory 대체가 아니다. DOM/HTTP만 작은 fixture로 대체했다.

직접 포트 fixture의 base49/D101/restore RNG0을 evidence에 보존했다. restoreCalls는 신규/legacy 조회 횟수이지 게임 dbRestore 횟수가 아니다. host는 port.restoreItem(JSON 객체)을 사용하며 dbRestore/서버세이브 라우터를 호출하지 않는다. 실제 초기 UI 설치 후 RNG0, 명시 신규 후 D101, JSON읽기 후 base/D10 불변을 검사했다. 기존 bootstrap의 전체23그룹을 복제하지 않았다.

**actualBrowserImport=UNKNOWN / actualHTTP=UNKNOWN**. 전이 소스 MIME는 .js=application/javascript임을 server.cjs로 확인했고 실제 브라우저 CSP/모듈로드/화면은 root 담당이다. 소스 변환/Node 성공을 제품 적용·실브라우저 PASS로 쓰지 않는다.

## 원본 변화와 보존

첫 검사에서 생성 당시 game 전체SHA `21235538...`와 검사 당시 `f7212ac2...`가 달라 manifest 전체 동일성 검사가1회 실패했다. 이 기간의 외부 생산 변경 주체는 이 검사로 확정하지 않는다. ITEM 생산 쓰기0이며 **추출11조각/전이4원문은 모두 그대로 동일**했다. 검수기를 전체 game provenance drift를 따로 기록하고 관련 원조각/JS byte는 엄격비교하도록 분리했다. 오류를 숨기거나 old capture SHA를 현재소스로 덮지 않았다.

manifest는 생성 당시 gameSHA를 보존하고 evidence는 initial/current SHA 둘 및 extractedFragmentsExact=true를 기록한다. 이 차이만 제외한 manifest는 정확히 같아야 하고, 추출 함수/데이터나 전이 import 외 원문이 바뀌면 검사는 실패한다. 각 최종 검사 시작/끝10개 원파일 byte는 동일했다. 이전 bootstrap/persistence evidence/결과도 덮어쓰지 않았다.

관련 docs 전체 키워드 검색은 browser-host-docs-related.txt에 저장했다. 공유 docs 변경 제안: ITEM팀/저장계약에 JS전이4개·원문역대조·원함수 fixture 호스트·12그룹 Node PASS·actual browser/HTTP UNKNOWN·생산 미적용을 추가한다. 과거61PASS/42시나리오/23그룹과 분리하며 활성0·아트미채택을 유지한다. 공유docs 수정0.

수신·Read·첫 코드 Edit·검수·완료 UTC와 실제 시계 명령은 browser-host-receipt.json에 기록한다. 남은 게이트는 root의 같은3340 독립 reviewOnly 호스트 HTTP/CSP/import/명시버튼/카운터/해제/원 property 실브라우저 인수다. 사용자 Chrome/게임/서버/Git/queue/새세션·에이전트/생산 조작0. 이번 한 건 후 인계한다.
