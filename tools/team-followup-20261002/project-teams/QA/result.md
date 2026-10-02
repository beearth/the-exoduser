# QA host-native-acceptance — 실제 독립 UI 인수

2026-10-02 KST. 총괄의 3340 응답확인 release를 받은 뒤 지정 독립 host에서 CUA로 설치·신규 생성·JSON 복원·해제를 1회 수행했다. 다섯 단계의 실제 원자료와 카운터를 `evidence.json`에 보존했다. 이 실행 순서는 완료했으며 CSP 주입 주체와 원 port descriptor의 직접 런타임 대조는 UNKNOWN이다. 정상 전투·성능 측정은 실행하지 않았다.

## 소유 범위와 수신 근거

| 항목 | 실제 근거 |
|---|---|
| 소유 산출 | 이 폴더의 `result.md`, `evidence.json`, `proof.jpg` 3개. `task.md`는 총괄 소유로 읽기만 했다 |
| 전달·Read | 이 QA 관리 채팅의 task 배정·release를 수신. task와 이전 QA 과제·ITEM UI 계획·host source·ITEM SSOT를 읽었다. Read 완료 뒤 clock 기록은 03:43:47 UTC / 12:43:47 KST이며 메시지의 정확한 배송 시각은 제공되지 않아 null로 구분했다 |
| release | 총괄이 source `96610b6546a31e882962470ea1f2164ce94edca6`, HOST127.0.0.1/PORT3340/격리 saves와 `/api/slots` HTTP200·ok=true·기존1슬롯을 확인했다고 전달. QA는 API를 직접 호출하거나 서버를 시작하지 않았다 |
| 기존 QA 원세션 | `88c3f903-ece5-4640-8b0c-86feaaca0e53` JSONL의 마지막 user/assistant 기록은 10-01 17:38:58.140 UTC의 D17 완료. 새 host 과제 문자열 사건0을 읽기 확인했으며 새 liveness를 추정하지 않았다 |
| 실제 UI | Codex In-app Browser, QA가 새로 만든 tab1, `http://127.0.0.1:3340/tools/team-followup-20261001/ITEM/browser-host/index.html`. CUA의 AX 클릭·읽기 전용 DOM 수집만 사용 |
| 실행 시각 | host journal 시작 03:44:15.609 UTC / 12:44:15.609 KST. 해제 관측 03:45:16.012 UTC / 12:45:16.012 KST. 초기 원자료 수집은 03:44:45.047 UTC로 별도 기록 |
| 소스 근거 | host·의존14파일과 생산 핵심5파일의 완료 시 디스크 SHA를 배정 체크포인트96610b65의 Git blob SHA와 대조해 동일 확인. 전후 HTTP 소스 해시 비교는 실행하지 않았다 |

## 실제 5단계

카운터 순서는 base RNG / D10 RNG / restore RNG / 복원조회다. 신규 생성 UI는 생성 직후 읽기도 수행하므로 복원조회가1이며, 명시 JSON 읽기 후2가 된다. 복원조회2를 JSON 버튼2회로 세지 않는다.

| 단계 | UTC | 카운터 | review 직접 자식 | 관측 결과 |
|---|---|---|---:|---|
| 초기 | 03:44:45.047 | 0 / 0 / 0 / 0 | 0 | 자동 설치·생성 없음, 초기 오류 원문 보존 |
| reviewOnly opt-in 후 설치 | 03:44:50.031 | 0 / 0 / 0 / 0 | 3 | 실제 HTTP/import를 소비하는 설치 완료 문구·신규/JSON 버튼 표시 |
| 신규 생성 | 03:44:55.376 | 49 / 1 / 0 / 1 | 3 | `신규 proposal` |
| JSON 복원 | 03:45:00.557 | 49 / 1 / 0 / 2 | 3 | `JSON 복원 proposal · 재롤 없음`, base/D10 증가0 |
| 해제 | 03:45:16.012 | 49 / 1 / 0 / 2 | 0 | 자식 제거와 `기존 property 보존 · 자동 재설치 없음` UI 문구 확인. property descriptor 자체는 직접 관측하지 않아 UNKNOWN |

## ID·수치·적용 위치 계약표

| source ID / 한글명 | 수치·공식 | 적용 위치 | 검수와 한계 |
|---|---|---|---|
| UI-10 / 꺼지지 않는 심갑 | slot=armor, effectId=U-D10, stat=`_uSlamEmberRage` | definitions·검토 port | proposal / enabled=false / runtimeReady=false 유지. 실제 효과·드롭 연결 아님 |
| D10 신규 롤 | 주입 RNG1회, 기존 base 생성 RNG49회. 저장 허용범위 .10~.20(정수10~20%) | frozen armor mkItem fixture·D10 binding | 실제 UI 카운터 확인. 롤 수치·실제 장비효과를 화면에서 직접 판독한 검수는 아님 |
| JSON 복원 | 생성 후 JSON serialize/parse→restore→read, 추가 RNG0 | `browser-bootstrap-ui.js`→`createD10ReviewController` | 실제 JSON 버튼·카운터·proposal 문구 확인. 서버 저장·사용자 세이브 왕복 아님 |
| 해제 | review 자식3→0, base/D10/restore 카운터 불변 | mount.close→controller.close | 실제 DOM 자식0. 원 descriptor/타 주체 교체 반례는 이번 UI의 직접 증거 없음 |
| 초기 CSP journal | `item-review-csp-journal-v1`, listenerPhase=`external-classic-after-policy-meta` | csp-startup→`pre#errors` | 초기~해제 5회 원문 byte 동일. 리스너 실행 전 사건은 미관찰 |
| style CSP 사건 | sequence1, blockedURI=inline, effectiveDirective=style-src-elem, disposition=enforce, HTTP200, 행135/열93904, timeStamp135.5, isTrusted=true | phase=`host-ready` | sourceFile="", sample="" 그대로 보존. host 소스 행135 또는 주입 주체로 소급 특정하지 않음 |

## 검수·결함·남은 Gate

실제 UI5단계와 별도로 저장된 원자료의 순서·카운터·누적 CSP·소스 SHA·정리/UNKNOWN 구분을 16항목 대조해 **16 PASS / 0 FAIL**을 확인했다(03:48:42.137 UTC / 12:48:42.137 KST). 재현 게임이나 별도 Node DOM fixture로 실제 UI를 대신하지 않았다. 완료 검수의 검사명·PASS/FAIL·UTC는 evidence.validation을 따른다.

- 초기 CSP 위반1건은 설치/생성/복원/해제 동안 추가되지 않았고 처음 사건을 지우지 않았다. 모든 단계 runtimeErrors 배열0, 해당 탭 dev 로그 반환0이지만 CSP 무오류 판정은 하지 않는다.
- 원주입자·리스너 이전 사건은 UNKNOWN. sourceFile 빈값과 행/열만으로 Codex overlay나 host 코드에 귀속하지 않는다. 합성 inline style positive control 주입0, 정책 완화0.
- 원 port descriptor의 직접 런타임 전후 대조는 UNKNOWN. UI 보존 문구와 기존 source guard를 그 직접 증거로 대체하지 않는다.
- manifest의 frozen sourceGame SHA는 `21235538c9766a28b04dcf529aed9883a8aa11bdbfef8e9e2ce35d5cc927c5cf`인 이전 추출 기준이다. 현행 전체 게임을 실행한 것이 아니며 fixture는 합성 P.lv20/demo=false·armor 전용이다.
- QA 임시 독립 탭은 증거 수집 후 닫았다. 사용자 tab1573846373·기존 앱·원래3333·사용자 저장 조작0. 외부 Playwright/CDP/직접HTTP/AppleScript 우회0.
- 게임·성능측정·빌드·설치·새 서버/listen·생산/기존 prefix/task 수정·Git쓰기·새 세션·하위 에이전트·자동화·권한 변경 모두0.
- 최초 소스 Git blob 해시 보강 명령은 Node execFileSync 기본 출력 버퍼 부족(ENOBUFS)으로 실패했다. 명시32MiB 버퍼로 재실행해 대조했으며 UI는 재실행하지 않았다.

## 총괄 docs 인수안

docs 전체 관련 키워드 검색은 evidence.docsSearch의 정확한 query·8매칭/5문서에 기록했다. 공용 문서는 읽기 전용으로 보존했고, 총괄이 아래 최신 추가분만 source+docs 체크포인트에 동기화한다. 기존 원세션의 미전달 이력과 과거 실패는 삭제하지 않는다.

| 반영 대상 | 추가할 정확한 내용 |
|---|---|
| ITEM_TEAM_MASTER.md §CSP 초기 원자료 진단 / QA_PERFORMANCE_TEAM_MASTER.md 최신 말미 | 2026-10-02 새 QA 관리 채팅에서 release 후 독립 IAB host 1회·5단계 완료. base49/D101·restoreRNG0·복원조회2·해제 자식0. 초기 style-src-elem1건/빈 sourceFile/행135열93904/host-ready가 모든 단계 보존. 주입 주체와 원 descriptor 직접 대조 UNKNOWN. 생산/게임/성능측정0 |
| PROJECT_MANAGEMENT_MASTER.md 최신 말미 / 팀 운영 행 | host-native-acceptance의 이번 수신·실제 UI·산출 완료를 과거 원세션의 미수신 이력과 구분. UI 슬롯 종료·QA 임시 탭 닫힘. 정상전투·밀집 실측은 별도 슬롯이며 이번 실행으로 확대하지 않음 |

Changes 시작23→중간39→검수 완료53이며 공유 체크아웃의 타 팀 산출 증가를 포함한다. 최종 인계 직전 count는 evidence.gitCounts를 따른다. 타 담당 파일·한글 정규화·초안은 보존하며 QA가 commit/push하지 않는다. 총괄이 지정한 이 한 건의 결과만 인계하고 다음 과제를 새로 만들지 않는다.
