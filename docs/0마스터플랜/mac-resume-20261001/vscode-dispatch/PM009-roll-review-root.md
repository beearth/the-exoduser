# PM-009 롤·원화 검토 소비 통합 인수

2026-10-01 기존 BALANCE/UIUX 담당의 독립 구현을 root가 인수했다. 새 효과·드롭·저장 형식 활성화가 아닌 제안 데이터 검증과 개발 검토 화면 연결이다.

| 범위 | 최종 구현과 근거 |
|---|---|
| 롤 값 | `roll-values.mjs`의 22종/698개 정수. 주입 RNG 1회, 유한 [0,1)만 허용. 명시 하/중/상 구간 사용; D10 10–13/14–16/17–20 유지 |
| 저장·표시 | % raw/100, frame/count/rage 정수 보존. frame 표시는 raw/60을 소수2자리 반올림 후 끝0 생략, exactDisplay에 원분수 보존. D16 발/D17 개/D21 분노 |
| 실제 감사 소비 | `audit-definitions.mjs`가 D절 원문 범위·단위·명시 구간·% 저장범위를 비교하고 698개 JSON 왕복, RNG 양끝과 표시를 실행. 원화 감사도 이 결과를 소비 |
| 실제 화면 소비 | `review.html`은 `definitions.js`만 import. 정의의 22이름/슬롯/타입/효과ID/상태와44경로를 사용하며 독립 이름·파일명 배열 제거 |
| 경로 호환 | 기존 definitions.mjs를 **동일 6908바이트의 definitions.js로 이동**. 복사·동적 우회 로더 없음. package type=module이며 기존 server.cjs/node-main.js의 .js MIME 경로를 사용 |
| 활성 상태 | 제안/미채택/비활성, runtimeReady=false, 활성0, 원화채택0. 효과·번역·런타임 PNG 준비의110개 차단 유지 |

## 검사

- 최종7개 테스트 파일 **101PASS/0FAIL/0SKIP**. 롤69, 정의21, 감사2, 화면6, 실제 서버 핸들러1, 기존 캐시2. 문서변이7종(기존 매핑/이름/stat3+범위/구간/저장값/단위4) 검출.
- 낡은 review 인라인 이름 assert를 제거하고 실제 HTML의 dynamic import/DOM 검사로 대체했다. 초기 담당 결과의 인접 실패는 보존한 이력이며 최종 실패0이다.
- 정의·원화 감사 exit0; 실제44PNG 존재. 다운로드22개 미확보를 SHA 일치로 계산하지 않았다. `--require-ready`는 예상대로 exit1.
- VM 서버 검사는 **실제 server.cjs 요청 핸들러**를 실행하고 listen만 stub한다. 200/206 JavaScript MIME·파일바이트·304·HTML캐시·격리 API를 검증했다. 실제 네트워크 검사와 구분한다.
- 실행 중3340에서 13:49:05Z `.mjs`가200/octet-stream, 브라우저는 카드0·이미지0 및 모듈실패 안내였다. server.cjs 최소수정 후보는 실행 서버 재시작이 필요하므로 적용하지 않고 root가 추가했던1줄만 제거했다. 최종 server.cjs diff0.
- 13:51:29Z 실제 `/unique-item-project/definitions.js`: **200 application/javascript**, 디스크/HTTP SHA256 모두 `3f04bcc5ac90b039454f32dc9323e60bbe44dda27be7fd439a97633d1f25118a`. 원정의 내용도 동일하다.
- 기존3340을 사용하는 IAB 실화면: **22카드·44/44 이미지 로드**, 원본1024²/후보1920², 1280×720에서 가로넘침 없음. CSS 내용64/160px, 테두리 포함66/162px. Enter로160, Space로64, Tab으로 다음 버튼 초점, aria-pressed 상호전환 확인.
- 스크린샷은 viewport 캡처이며 도구가 보이는 영역을 반환했다. 전체22종 원화의 새 채택 심사는 하지 않았다. **소비 화면 기능 인수 PASS / 원화 최종 채택 미완료 / 실게임·패키지 미검수**.

증거: `outputs/team-review-20261001/pm009/`의 tests.txt, audit.json, art-audit.txt, http.json, browser.json, review-64.png, review-160.png, docs-search.txt. 담당 원자료·초기 인접 실패는 각각 BALANCE/UIUX 소유 폴더와 결과에 보존했다. 과거 ITEM 후보/담당 원문이 definitions.mjs를 가리키는 것은 당시 제출 경로이며 현재 영구 소비·테스트는 definitions.js를 사용한다.

## 운영과 다음 게이트

기존 BALANCE queue `01a0f7b5-1aae-74f1-955a-08c46740d157`, 실제 Read13:44:06Z·담당완료13:45:41Z. UIUX queue `01a0f7b5-1ac9-7cb3-8148-0f04ae940163`, 소스 Read13:44:03Z·최종검사13:47:01Z. 정확한 첫 Edit 초를 추정하지 않았다. 상세는 원 영수증을 따른다.

13:44Z native 목록 접근 후 입력은 noWindowsAvailable, 현재 잠금 여부 UNKNOWN이다. 과거13:09Z locked를 현재 상태로 재사용하지 않는다. ENEMY/ART/SKILL 후속 지시는 미수신 유지. IAB 검토 화면 접근 성공은 VS Code native 입력 복구를 뜻하지 않는다.

게임/easy/index·사용자 저장·PC/3333/3340 프로세스·API/포트/저장 경로 변경0, 새 리스너·권한 우회·새 팀·중복 배정0. 다음은 미채택 원화/번역·효과별 훅과 실전 검수 게이트다. 전체22종 드롭을 활성화하지 않는다.
