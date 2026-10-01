# ITEM-BROWSER-CSP-CAUSE-FIX

기존 ITEM 01a0f6e6-1fbe-7df0-8d02-a9c2d9df3750 한 건. 기준 원격73a999c568eb6e94640e5f16af10e911a9652206. 같은 지시가 이미 수신/진행/대기면 중복 수행하지 않는다. 기존 초안·후보·사용자 입력은 보존한다. AGENTS와 ITEM팀 MD, browser-csp-result 및 FOUR-SUBMISSIONS-HELLRAY를 먼저 읽는다.

현재 host.js initializeReviewHost는 securitypolicyviolation을 violatedDirective+blockedURI 두 필드만으로 failure에 넘기므로 실제 sourceFile/lineNumber/columnNumber와 이후 사건 이력이 사라진다. 기존 별도 diagnostic 페이지는 원래 bootstrap host 초기 사건의 근거를 대신할 수 없다. 이 확인된 진단 누락을 실제 browser-host에서 좁게 수정한다. 원문을 보존하고 self-only CSP 그대로, 경고숨김/unsafe-inline/eval/전역 패치 금지. startup listener는 가능한 이른 외부 self 스크립트로 연결하고 순서 한계(리스너 전 주입 미관찰)를 명시한다. 오류 발생 후 설치/해제 상태 갱신이 원자료를 지우지 않게 한다. 정상 원본과 실제 violation 원자료를 구분하는 회귀를 작성한다.

소유: ITEM/browser-host, 관련 browser-bootstrap-ui.js의 필요 최소 구역, 새 ITEM/browser-csp-cause-*; production game/easy/index/server·실제 세이브·공유docs·다른 후보는 수정하지 않는다. 현재 정적 소스에 명시 inline style은 없다. sourceFile/line/blockedURI 근거 없이 프로젝트 또는 외부 주입 원인이라고 단정하거나 불필요한 수정 금지.

QA가 유일한 native/실브라우저 검수 슬롯을 소유한다. 당신은 파일 수정·작은 Node 회귀 및 검수 URL/출력 위치를 마련하고 QA 실행은 별도 gate로 남긴다. 실제 opt-in 설치→생성→JSON복원→해제와 복원RNG0를 QA가 기록할 수 있게 기존 host를 유지한다. 실제 UI 없이 실행했다고 보고하지 않는다. 사용자 게임탭1573846373·기존앱·세이브 접촉0. 권한 변경·새서버·포트우회·새세션/에이전트·Git쓰기·queue0. 수신/Read/Edit/실행과 한계를 한국어 receipt/result에 남긴다.
