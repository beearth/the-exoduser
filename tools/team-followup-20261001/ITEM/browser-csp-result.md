# ITEM-20261002-BROWSER-CSP — 좁은 원인 분리

판정: **host 직접 스타일 주입 근거 없음 / 원주입자 UNKNOWN / 원 host 수정0**. root의 실제 import·명시 설치·생성·JSON복원·해제 인수는 유지한다. 초기 CSP 전체 clean이라고 선언하지 않는다.

## 대조한 사실

| 범위 | 확인 |
|---|---|
| root 원자료 | acceptance/item-browser.json의 style-src-elem inline 첫 AX 진단 요약. sourceFile/line/sample/원 DOM은 저장되지 않아 주체귀속 불가 |
| 원 host 초기HTML | STYLE 요소0, style attribute0. 외부 host.css 링크1, style-src self 정책1 |
| host.css | 외부 파일, @import 없음. 자기 외부 CSS를 허용하는 정책과 소스상 충돌 근거 없음 |
| 초기 host.js | 직접 STYLE 생성/속성/markup/CSSOM 주입 없음. 초기화는 상태리프/카운터·버튼 리스너만, factory 동적 import는 명시 설치 뒤 |
| 전이·bootstrap | 검사한10개JS에서 직접 style/markup 주입 경로 없음. 실제 버튼 생성은 button/p 리프이며 스타일속성을 지정하지 않음 |
| 원문보존 | root 인수 JSON에 hash가 있는8개 검사소스 모두 동일. 나머지 의존도 현재 source/function SHA를 별도 기록 |
| 현재 HTTP | `curl -sS --max-time 5 -D - http://127.0.0.1:3340/tools/team-followup-20261001/ITEM/browser-host/index.html` exit7 연결실패. 응답header/body미확보, 원인UNKNOWN. 서버 시작/재설정/우회0 |

style-src-elem inline 요약은 style attribute가 원인이었다고 확정할 근거가 아니다. 외부 주입자가 만든 inline STYLE 요소도 후보이지만 **IAB/확장/도구 주입으로 확정하지 않는다**. 기존 정책은 inline 스타일을 허용하지 않으며, 이를 차단한 사실만으로 host 정책을 잘못됐다고 판단하지 않는다. 호스트에 필요한 inline 스타일이 발견되지 않아 정책 완화/nonce/hash 추가 등 수정 후보는 제출하지 않았다. unsafe-inline·전역CSP완화0.

정적 검사는 실제 소스의 direct DOM/style 표현과 HTML 구조를 좁게 비교한 것이다. computed/dynamic/Reflection/외부코드 모든 가능성을 완전 배제하는 보안검증이 아니다. CSSOM 접근 탐지는 직접 style 조작 후보를 찾는 것이며 모든 CSSOM 쓰기가 동일한 CSP 위반을 유발한다는 주장이 아니다. 원주입자를 판정하려면 실제 event 필드와 주입 노드 출처가 필요하다.

## 소유 경로의 최소 분리 후보

`browser-csp/diagnostic.html`과 diagnostic.js를 작성했다. **host 수정후보가 아니라 root용 독립 분리 진단**이다. 게임/포트/D10 설치는 없다. 원host와 CSP meta 내용은 그대로 같고 외부 host.css를 재사용한다. CSP 완화나 inline script는 없다.

1. root가 기존3340의 독립 진단 경로를 열어 **어떤 버튼도 누르지 않은 baseline** 이벤트를 기록한다.
2. 필요할 때만 **inline STYLE 요소** 반례 버튼을 호출한다. 이 노드는 item-csp-explicit-style로 명시 표시된다.
3. 별도로 **style 속성** 반례 버튼을 호출하고 effectiveDirective/blockedURI 차이를 확인한다. positive control의 위반을 원 startup 사건과 섞지 않는다.
4. 진단은 effectiveDirective/violatedDirective/blockedURI/sourceFile/lineNumber/columnNumber/sample/disposition/originalPolicy와 명시 action을 그대로 JSON 로그에 남긴다. 현재 정책에 report-sample이 없으므로 sample이 비어 있을 수 있으며 미확보를 주입없음으로 해석하지 않는다.

listener를 policy meta 앞의 외부 classic script로 등록해 이 진단 페이지의 초기 event 누락을 줄였다. **원host의 module 로딩 순서와는 다르므로 정확한 동일조건 A/B가 아니다**. 원 host를 바꾸지 않았고, 이 분리페이지 결과만으로 과거 IAB 주입자를 확정하면 안 된다. 스크립트 자체가 못 로드되면 정적 상태가 미실행을 안내한다. 실제 정책 enforcement/브라우저 최종은root담당이며 담당 ITEM은 실행하지 않았다.

## 검수·인계

`node tools/team-followup-20261001/ITEM/browser-csp-check.mjs`: **9그룹 PASS/0FAIL**. 원hash/함수SHA, 초기 HTML/직접 JS주입, STYLE/attribute/CSSOM 최소 반례 검출, elem/attr/외부URI 구분하되 주체UNKNOWN, 동일정책, 명시버튼 전 주입0·원event필드 기록, 원문byte보존을 검수했다. CSP event는 VM 주입 fixture이며 **실브라우저 enforcement PASS가 아니다**.

source 전체SHA와 함수별 beforeSHA는 browser-csp-evidence.json에 고정했다. 현재game/서버생산순차수정에 관계없이 이 고정 원host/함수만 읽었다. production게임/서버 소스를 수정하거나 사용자 tab1573846373을 건드리지 않았다. 기존 host·bootstrap·root원자료 모두 보존한다.

관련 docs 전체검색은 browser-csp-docs-related.txt에 저장했다. 공유 docs 제안: ITEM팀/인수문서에 “기능 인수 유지·초기CSP 원주입자UNKNOWN·host직접style근거없음·수정0·독립분리반례9그룹”만 추가한다. CSP clean/외부주체확정/productionD10활성화로 바꾸지 않는다. 공유docs 쓰기0.

남은 게이트: root가 현재HTTP 연결 가능한 독립 host에서 원 CSP event 원문/sourceFile/line/DOM 주입출처를 확보하고, baseline 및 두 명시반례를 구분해 최종 귀속한다. 필요한 자료가 없으면 미확정 유지. 브라우저/서버/게임/Git/queue/권한/새세션·에이전트0. 이번 한 건 완료 후 root 인계한다. 수신/Read/실제Edit/명령/완료 UTC는 전용 receipt 참조.
