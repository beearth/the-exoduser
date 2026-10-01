# ITEM-BROWSER-CSP-CAUSE-FIX 인계

확인된 **진단 누락만 수정**, 초기 inline STYLE의 원주입자 **UNKNOWN 유지**. 기존 sourceFile/line/column 없는 root summary를 새 합성 fixture와 섞지 않았다. 실제 UI 슬롯은 QA 전용이며 ITEM의 브라우저/UI/HTTP 실행0. 새 서버/게임/빌드/세이브/Git/queue/권한/새세션 접촉0.

## 변경 및 원문 보존

기존 browser-host/index.html에 정책 meta 직후 외부 self classic `csp-startup.js`를1개 추가했다. CSS·host module보다 앞에서 listener를 설치한다. CSP 문자열 **byte 동일**, unsafe-inline/eval/nonce/전역 API 패치0. listener 실행 전 발생한 주입·사건은 관찰을 보장하지 않으며 HTML 전체 시작 이전 수집이라고 주장하지 않는다.

startup은 자기 읽기전용 `_itemReviewCspJournal` namespace에 원필드 snapshot을 누적한다. documentURI/referrer/blockedURI/violatedDirective/effectiveDirective/originalPolicy/sourceFile/sample/disposition/statusCode/lineNumber/columnNumber/timeStamp/isTrusted와 sequence/observedUtc/phase를 보존한다. 빈 문자열/0은 그대로, 미제공 필드는 null. schema/리스너 시작 UTC/미관찰 한계도 출력한다. 다른 builtin/prototype/정책/콘솔은 변경하지 않는다.

host.js initializeReviewHost는 journal을 소비해 `pre#errors`에 전체 JSON을 표시한다. CSP 이력과 script/import/설치 오류 이력을 분리 누적한다. 설치 시작의 errors='' 및 후속 failure 덮어쓰기를 제거하여 정상 설치·실패·해제 상태 갱신 후에도 원자료를 남긴다. 초기 classic을 실행 못했으면 module fallback이 전체필드를 수집하며 이전 사건 UNKNOWN을 명시한다. 기능 factory/HTTP verifier 원문은 동일, 명시 reviewOnly 설치/생성/JSON복원/해제와 RNG 계약 유지. browser-bootstrap-ui.js 수정0.

before.json에 변경 전 host/index 전체 원문과 SHA를 보존했다. 기존 root 인수의 host SHA와 동일. 새 자료는 별도 prefix이며 기존 browser-csp/result/evidence/독립 diagnostic/전이 module/d17 후보/사용자 초안 덮어쓰기0. 수정 scope는 host3파일 및 새 prefix 산출물만이다. 공유 docs/ITEM 팀 MD는 이번 배정에서 쓰기 범위가 아니므로 수정0, 아래 변경 제안으로 인계한다.

## 실패와 회귀

기존 host 원 initializeReviewHost를 VM 추출 실행한 반례: sourceFile/line41/column7가 있는 **합성** CSP event도 화면에 두 필드만 남고 이후 script error가 CSP 이력을 덮는다. 기존 FAIL 재현은 원인 주체 확인이 아니라 logger 손실 증명이다.

새 진단11그룹 PASS + 기존 browser-host12그룹 PASS =23그룹. actual factory/.js 체인 Node import, 명시 설치→생성→JSON→해제, D10 RNG1/base별도/복원RNG0, original property 복원 유지. runtimeErrors 누적, 초기+후속 이벤트/0값/빈값/원필드/phase/snapshot 보존, 정책·순서·inline0, fallback 한계, root 과거 summary와 합성 event 분리 검수. 실제 CSP enforcement/실브라우저 import/실UI는 UNKNOWN.

최종 검수 UTC: 2026-10-01T17:54:37.582Z/17:54:37.733Z. evidence.finalVerification의 최종 host SHA `2edc45b60c91c6e75358e070f5b4784628a8df55090f13bb8d15508a10f62dc3` 기준으로 QA가 대조한다. fallback 원필드와 runtimeErrors도 동결하여 snapshot 외부 변경으로 원자료가 바뀌지 않게 했다.

첫 새검사는 inline handler 검출 정규식이 content 속성의 부분문자열을 오탐하여 실패했다. 속성 앞 whitespace 경계로 **검사만** 수정 후11통과했으며 정책/host 기능을 바꿔 PASS를 만들지 않았다. 새 evidence에는 두 함수 initialize before/after SHA, 변경3소스 SHA, root 원자료 SHA, 실제 호출 fixture 구분이 기록됐다.

재실행:
```
node tools/team-followup-20261001/ITEM/browser-csp-cause-check.mjs
node tools/team-followup-20261001/ITEM/browser-host-check.mjs
```

## QA 인계와 한계

URL/표시 원자료/제안 고유 출력은 browser-csp-cause-qa-plan.md 참조. `pre#errors`와 `p#counts`가 QA의 실제 초기·명시 행동별 기록 대상이다. 기존 root item-browser.json은 보존, 새 실제 출력은 QA 승인 고유 경로 사용. 새로운 startup event 원필드가 확보될 때만 귀속 가능성을 검토한다. sourceFile 값 하나만으로 프로젝트/확장/도구 원인을 확정하지 않는다.

리스너 전 주입·관찰되지 않은 사건·report-sample 미설정으로 빈 sample 등은 UNKNOWN. journal은 문서 수명 동안 이력 유지하며 별도 영속 저장/서버 POST/다운로드 없음. 동일 host의 반복 initialize는 문서 listener 수명 관리까지 구현한 SPA lifecycle API가 아니므로 QA는 통상 단1회 초기화만 검수한다. 외부 모듈/스크립트 로딩 자체가 실패하면 정적 안내/모듈 fallback 외에 과거 사건 복원이 불가하다.

변경파일: browser-host/index.html, host.js, 새 csp-startup.js; browser-csp-cause-before/receipt/check/evidence/qa-plan/result. 의존: startup 전이 import0, host 기존 dynamic import3개·factory 체인 그대로. 새 Node check는 binding-save-harness extract/acorn 및 fs/vm/assert/crypto. 실제 HTTP MIME는 미실행 UNKNOWN, 현 server.cjs의 .js application/javascript 소스만 확인.

docs 전체 CSP/browser-host/browser-csp 검색 및 팀/인수문서 Read 완료. 공유 변경 제안: “CSP 진단 누락 수정23그룹 Node PASS, 원주입자 UNKNOWN, 초기 외부 self listener·원자료 누적, QA 실제 게이트 대기”를 ITEM팀/인수문서에 root가 반영. 원격73a999c...는 배정 기준만이며 Git 원격 확인/백업 완료를 주장하지 않는다. root 독립 검수·백업 및 QA 실제 슬롯 인수 대기.
