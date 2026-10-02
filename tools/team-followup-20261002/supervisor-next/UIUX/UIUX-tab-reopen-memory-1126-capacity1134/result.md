# UIUX Tab·닫기·재열기 수명 — 완료 원자료 보존

메모리 검수 NOFIX. 정순6개·역순6개, 닫힌 창 Tab 무시, 재열기 때 분리된 옛 아이콘 대신 새 아이콘 탐색, 외부 초점의 정순/역순 복구를 확인했다. source _visualSelectKeydown/openVisualSelect/_closeVisualSelect/stopMediaVideo 전체를 실행했고 제품 변경 후보는 필요하지 않았다. 이전 reentrant owner guard·부적합 target12조건·Escape/IME/repeat/스킬 검사를 반복하지 않았다.

| 관측 | 실제 메모리 결과 |
|---|---|
| Tab 정순 | csLeft → csRight → icon0 → icon1 → visualCancelBtn → visualCreateBtn |
| Shift+Tab 역순 | visualCreateBtn → visualCancelBtn → icon1 → icon0 → csRight → csLeft |
| 닫기 후 Tab | preventDefault/stopPropagation 추가0, BODY 유지 |
| 재열기 | 옛 아이콘 isConnected=false, 새 icon0 초기 초점, Tab 새 icon1/역방향 새 icon0 |
| 외부 초점 복구 | 정순 csLeft, 역순 visualCreateBtn |
| 처리 호출 | preventDefault16·stopPropagation16 |

실행은 2026-10-02T11:27:17.375Z~11:27:17.405Z(20:27:17 KST), exit0. 당시 allowNewOwnedFiles=false라 heredoc stdin으로 실행하고 함수 도구 메모리·stdout에 보존했다. 최초 exit1은 DOM 대역 복합 선택자 미지원으로 초기 focus가 취소 fallback에 간 검증 실패다. matches 대역 보완 후 성공했으며 실제 제품 결함으로 분류하지 않는다. 첫 실행 UTC 미계측·오류 출력은 도구에서 7859토큰 중 일부만 표시되어 전체 로그를 보존했다고 주장하지 않는다.

용량 해제 epoch capacity-after-8c317a73-1134의 STATE를 실제 읽고 allowNewOwnedFiles=true를 확인했다. 새 고유 폴더에 result.md/checks.mjs 두 파일만 저장하며 이번 epoch 저장1반복/2파일 예산을 모두 사용했다. 감독이 제공한 Changes68과 checkpoint8c317a73는 보고된 값이며 개인 Git 관측0. production/shared docs·제출 산출·타인WIP·세이브 변경0.

checks.mjs는 성공 stdin 하니스의 보존본이다. read-only node-dom import 경로를 이 파일 위치에 맞게 바꾸고 주석2줄만 추가했다. 이 저장본을 다시 실행하지 않았고 “파일 실행 PASS”로 보고하지 않는다. 재현 명령은 checkout root에서 아래이며 실행자가 원할 때 사용하는 안내다.

```sh
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node tools/team-followup-20261002/supervisor-next/UIUX/UIUX-tab-reopen-memory-1126-capacity1134/checks.mjs
```

실제 key binding 함수 호출의 격리 검수다. CHAR_VISUALS2, selectVisual(선택 class만), _spawnEmbers/_resetVisualInfoScroll, media pause/load, clearTimeout, scrollIntoView는 대역이다. document.body.focus()와 key handler 직접 호출은 합성 입력이다. 기존 DOM 모델에 복합 class selector 지원을 이번 memory Node에만 추가했고 helper 원본은 보존했다. 실제 addEventListener dispatch, native Tab 기본동작, CSS/화면, 정보 scroll 실제 위치, 실제5캐릭터 잠금·미디어, 패드·OS 입력은 미검수다. 실제 index.html source SHA는 메모리 실행과 저장 영수증에서 동일하며 다음 동기화는 생산 변경에 해당하지 않는다.

## docs 인계

최종 보존 audit 2026-10-02T11:41:39.248Z / exit0: 폴더는 checks.mjs/result.md 정확2파일. 주석2줄·DOM import 경로 복원을 제외하면 저장 코드가 성공 stdin 하니스와 정확 일치. 메모리 하니스 SHA256=d9826b34268c67c0976b47da92f4ac82897cadd1bfbaadf022e61abb991b7187, 저장 checks SHA256=81b55d769ac4125bdad67983730ed9e023a1f54998c6b80fccacc3328fc01268. 생산 source SHA는 메모리 실행과 동일. 저장본 재실행0; 이 audit는 파일/해시 검증이다.

산출 뒤 실제 docs/ 전체 rg1회: exit0, 8파일/27행, stdout SHA 7d6ef2a0cdc6ed3b6fed789829fae30e3146215950664a78e7e00c2efd9ff700. shared docs 쓰기0. 현재 Tab 순서/next 공식/숨김 early return은 원문 유지. 정본별 정확 old와 보충 제안은 아래다. 과거 실제 브라우저/2종 숫자 기록을 이번 대역 검수 결과로 덮어쓰지 않는다.

| 정본 | exact old | new 기록 제안 |
|---|---|---|
| docs/15 세이브+데이터구조/15 세이브+데이터구조.md:710 | &#124; Tab &#124; _visualSelectKeydown: 설명(csLeft)→플레이 방식(csRight)→캐릭터 버튼→취소→생성의 enabled 컨트롤을 순환. Shift+Tab 역순. 현재2종은 일반6개/출시 잠금5개. 외부 초점은 정순 설명/역순 마지막 활성 액션으로 복구. focus(preventScroll:true) 후 정보 영역은 scrollIntoView(block:start)로 제목부터 노출. preventDefault/stopPropagation으로 배경 이동 차단 &#124; | 기존 순서·공식 유지. 새 검수 기록: 합성2아이콘 enabled6개에서 정·역순 및 닫기/재열기 통과, 실제5캐릭터/native 검수는 별도. 과거2종/6·5개 기록은 역사로 보존. |
| docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md:2336 | &#124; Tab &#124; _visualSelectKeydown: 설명(csLeft)→플레이 방식(csRight)→캐릭터 버튼→취소→생성의 enabled 컨트롤을 순환. Shift+Tab 역순. 현재2종은 일반6개/출시 잠금5개. 외부 초점은 정순 설명/역순 마지막 활성 액션으로 복구. focus(preventScroll:true) 후 정보 영역은 scrollIntoView(block:start)로 제목부터 노출. preventDefault/stopPropagation으로 배경 이동 차단 &#124; | 기존 순서·공식 유지. 새 검수 기록: 합성2아이콘 enabled6개에서 정·역순 및 닫기/재열기 통과, 실제5캐릭터/native 검수는 별도. 과거2종/6·5개 기록은 역사로 보존. |
| docs/3.1 ui hud 디자인/lobby_full_patch.md:1042 | &#124; Tab &#124; _visualSelectKeydown: 설명(csLeft)→플레이 방식(csRight)→캐릭터 버튼→취소→생성의 enabled 컨트롤을 순환. Shift+Tab 역순. 현재2종은 일반6개/출시 잠금5개. 외부 초점은 정순 설명/역순 마지막 활성 액션으로 복구. focus(preventScroll:true) 후 정보 영역은 scrollIntoView(block:start)로 제목부터 노출. preventDefault/stopPropagation으로 배경 이동 차단 &#124; | 기존 순서·공식 유지. 새 검수 기록: 합성2아이콘 enabled6개에서 정·역순 및 닫기/재열기 통과, 실제5캐릭터/native 검수는 별도. 과거2종/6·5개 기록은 역사로 보존. |
| docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md:654 | &#124; Tab &#124; _visualSelectKeydown: 설명(csLeft)→플레이 방식(csRight)→캐릭터 버튼→취소→생성의 enabled 컨트롤을 순환. Shift+Tab 역순. 현재2종은 일반6개/출시 잠금5개. 외부 초점은 정순 설명/역순 마지막 활성 액션으로 복구. focus(preventScroll:true) 후 정보 영역은 scrollIntoView(block:start)로 제목부터 노출. preventDefault/stopPropagation으로 배경 이동 차단 &#124; | 기존 순서·공식 유지. 새 검수 기록: 합성2아이콘 enabled6개에서 정·역순 및 닫기/재열기 통과, 실제5캐릭터/native 검수는 별도. 과거2종/6·5개 기록은 역사로 보존. |
| docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md:498 | &#124; Tab &#124; _visualSelectKeydown: 설명(csLeft)→플레이 방식(csRight)→캐릭터 버튼→취소→생성의 enabled 컨트롤을 순환. Shift+Tab 역순. 현재2종은 일반6개/출시 잠금5개. 외부 초점은 정순 설명/역순 마지막 활성 액션으로 복구. focus(preventScroll:true) 후 정보 영역은 scrollIntoView(block:start)로 제목부터 노출. preventDefault/stopPropagation으로 배경 이동 차단 &#124; | 기존 순서·공식 유지. 새 검수 기록: 합성2아이콘 enabled6개에서 정·역순 및 닫기/재열기 통과, 실제5캐릭터/native 검수는 별도. 과거2종/6·5개 기록은 역사로 보존. |
| docs/CHANGELOG_SYNC.md:51110 | &#124; Tab &#124; _visualSelectKeydown: 설명(csLeft)→플레이 방식(csRight)→캐릭터 버튼→취소→생성의 enabled 컨트롤을 순환. Shift+Tab 역순. 현재2종은 일반6개/출시 잠금5개. 외부 초점은 정순 설명/역순 마지막 활성 액션으로 복구. focus(preventScroll:true) 후 정보 영역은 scrollIntoView(block:start)로 제목부터 노출. preventDefault/stopPropagation으로 배경 이동 차단 &#124; | 기존 순서·공식 유지. 새 검수 기록: 합성2아이콘 enabled6개에서 정·역순 및 닫기/재열기 통과, 실제5캐릭터/native 검수는 별도. 과거2종/6·5개 기록은 역사로 보존. |

| 추가 대상 | old | new 인계 |
|---|---|---|
| UI-05 작업대장 | 전체 대기 | 대기 유지. dated source/fixture NOFIX 기록만 추가; native/시각 미인수. |
| next 공식 | index<0 ? (shift?length-1:0) : (index+(shift?-1:1)+length)%length | 그대로 유지. |
| 재열기 조회 | 매 keydown 현재 visualGrid.querySelectorAll('.cs-ico') | 그대로 유지. 새 아이콘 수명 메모리 관측을 별도 기록. |
| 과거 현재2종·일반6/잠금5 문안 | 해당 날짜2종 기준 | 과거 증거 보존. 현행 CHAR_VISUALS가5개인 현재 정본 표기는 N+4 / 생성 disabled 시 N+3로 보충하는 source 조사 후속 후보. 이번 검사2종은 합성 fixture이며 현행5종 실행 PASS가 아님. |

보호2_3·blackBean Q-only magic·attacktickets금지·LOCK/TBD·확정수치·세이브 구조 유지. docs canonical 변경/commit은 root 소유. 전건 후보와 합본 인수·실브라우저/native·키보드/패드/레이아웃·전체게임·미디어 청취/저장/GPU/배포 Gate 유지. NOFIX는 이 합성 컨트롤 경계에 한정한다.

```json
{
  "execution": {
    "task": "UIUX-autonomous-tab-reopen-memory-1126",
    "startedUTC": "2026-10-02T11:27:17.375Z",
    "endedUTC": "2026-10-02T11:27:17.405Z",
    "sourceSHA256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8",
    "fragments": [
      {
        "name": "openVisualSelect",
        "sha256": "42150f7f2c86ee2f792079a9b1540230856c2bedfe3c203f212d42e957813e53"
      },
      {
        "name": "_closeVisualSelect",
        "sha256": "0dff217111acbd4442ce30841915a5cf8c10683d93e193edd9ed6d14de235c38"
      },
      {
        "name": "stopMediaVideo",
        "sha256": "c07cda56f5d8814cb5f4a21844ab78a433ecaa00a0e78820b9d4b4e44f567727"
      },
      {
        "name": "_visualSelectKeydown",
        "sha256": "a94f16bcbd7e13b17cef7549ed71f72bc87545bfd6c8a1206fb02f45c513a06e"
      }
    ],
    "results": {
      "forward": [
        "csLeft",
        "csRight",
        "icon0",
        "icon1",
        "visualCancelBtn",
        "visualCreateBtn"
      ],
      "reverse": [
        "visualCreateBtn",
        "visualCancelBtn",
        "icon1",
        "icon0",
        "csRight",
        "csLeft"
      ],
      "hiddenHandlerIgnored": true,
      "reopenedCurrentIcons": true,
      "externalFocusRecovery": true,
      "prevented": 16,
      "stopped": 16
    },
    "status": "NOFIX-inspected-boundary",
    "syntheticCharacters": 2,
    "doubles": [
      "node-dom plus compound class selector",
      "CHAR_VISUALS2",
      "selectVisual",
      "spawnEmbers",
      "resetVisualInfoScroll",
      "media",
      "clearTimeout",
      "scrollIntoView"
    ],
    "nativeAccepted": false,
    "newFiles": 0,
    "productionApplied": false
  },
  "exit": 0,
  "firstFailure": {
    "exit": 1,
    "error": "AssertionError: 재열기 activeElement 기대 icon0이나 actual visualCancelBtn",
    "reason": "기존 DOM 대역 matches가 .cs-ico.sel 복합 선택자를 지원하지 않아 실제 open 함수가 취소 fallback을 선택함.",
    "firstUTC": "미계측",
    "outputTruncated": true,
    "fix": "새 메모리 document.createElement 반환 Node의 matches만 다중 class 토큰 검사로 보완. 생산·기존 helper 파일 변경0."
  },
  "save": {
    "utc": "2026-10-02T11:40:25.733Z",
    "docsScan": {
      "startedUTC": "2026-10-02T11:40:25.695Z",
      "command": [
        "rg",
        "-n",
        "-e",
        "_visualSelectKeydown|외형 선택창 키보드|설명\\(csLeft\\)|출시 잠금5개",
        "docs/"
      ],
      "exit": 0,
      "stderr": "",
      "matchingLines": 27,
      "files": [
        "docs/15 세이브+데이터구조/15 세이브+데이터구조.md",
        "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md",
        "docs/3.1 ui hud 디자인/lobby_full_patch.md",
        "docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md",
        "docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md",
        "docs/CHANGELOG_SYNC.md",
        "docs/CHANGELOG_DAILY_20260520.md",
        "docs/16번역·로컬라이제이션/LOCALIZATION_RUNTIME_20260909.md"
      ],
      "stdoutSHA256": "7d6ef2a0cdc6ed3b6fed789829fae30e3146215950664a78e7e00c2efd9ff700",
      "matches": [
        "docs/15 세이브+데이터구조/15 세이브+데이터구조.md:703:## 2026-09-28 외형 선택창 키보드 조작·초점 격리",
        "docs/15 세이브+데이터구조/15 세이브+데이터구조.md:710:| Tab | _visualSelectKeydown: 설명(csLeft)→플레이 방식(csRight)→캐릭터 버튼→취소→생성의 enabled 컨트롤을 순환. Shift+Tab 역순. 현재2종은 일반6개/출시 잠금5개. 외부 초점은 정순 설명/역순 마지막 활성 액션으로 복구. focus(preventScroll:true) 후 정보 영역은 scrollIntoView(block:start)로 제목부터 노출. preventDefault/stopPropagation으로 배경 이동 차단 |",
        "docs/15 세이브+데이터구조/15 세이브+데이터구조.md:785:| 키보드·수명 | csLeft/csRight도 tabindex0 지역으로 Tab 순환에 포함, 일반6개/출시 잠금5개. 정보 초점은 제목부터 노출하고 읽기 키는 네이티브 스크롤 허용. _resetVisualInfoScroll로 열기/다른 외형 선택의 본문·패널 위치0, 동일 외형은 보존. 저장 형식 변경 없음 |",
        "docs/15 세이브+데이터구조/15 세이브+데이터구조.md:842:| 키보드 | _visualSelectKeydown의 step=(ArrowRight?1:-1)×(현재 dir===rtl?-1:1). next=clamp(index+step,0,icons.length-1). 아이콘 초점에서 좌우는 화면상 좌우 이웃으로 이동하고 기존 click/focus(preventScroll:true)를 실행한다. |",
        "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md:2329:## 2026-09-28 외형 선택창 키보드 조작·초점 격리",
        "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md:2336:| Tab | _visualSelectKeydown: 설명(csLeft)→플레이 방식(csRight)→캐릭터 버튼→취소→생성의 enabled 컨트롤을 순환. Shift+Tab 역순. 현재2종은 일반6개/출시 잠금5개. 외부 초점은 정순 설명/역순 마지막 활성 액션으로 복구. focus(preventScroll:true) 후 정보 영역은 scrollIntoView(block:start)로 제목부터 노출. preventDefault/stopPropagation으로 배경 이동 차단 |",
        "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md:2435:| Tab 순서 | _visualSelectKeydown의 details는 csLeft/csRight, controls는 details→외형 아이콘→취소→생성 중 enabled 항목. 일반6개/출시 잠금5개. 최초 초점은 기존 선택 아이콘 유지. Shift+Tab 역순·순환/외부 초점 복구 유지. 초점은 preventScroll:true 후 정보 영역에만 scrollIntoView(block:start)하여 긴 정보의 제목을 먼저 노출 |",
        "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md:2527:| 키보드 | _visualSelectKeydown의 step=(ArrowRight?1:-1)×(현재 dir===rtl?-1:1). next=clamp(index+step,0,icons.length-1). 아이콘 초점에서 좌우는 화면상 좌우 이웃으로 이동하고 기존 click/focus(preventScroll:true)를 실행한다. |",
        "docs/3.1 ui hud 디자인/lobby_full_patch.md:1035:## 2026-09-28 외형 선택창 키보드 조작·초점 격리",
        "docs/3.1 ui hud 디자인/lobby_full_patch.md:1042:| Tab | _visualSelectKeydown: 설명(csLeft)→플레이 방식(csRight)→캐릭터 버튼→취소→생성의 enabled 컨트롤을 순환. Shift+Tab 역순. 현재2종은 일반6개/출시 잠금5개. 외부 초점은 정순 설명/역순 마지막 활성 액션으로 복구. focus(preventScroll:true) 후 정보 영역은 scrollIntoView(block:start)로 제목부터 노출. preventDefault/stopPropagation으로 배경 이동 차단 |",
        "docs/3.1 ui hud 디자인/lobby_full_patch.md:1149:| Tab 순서 | _visualSelectKeydown의 details는 csLeft/csRight, controls는 details→외형 아이콘→취소→생성 중 enabled 항목. 일반6개/출시 잠금5개. 최초 초점은 기존 선택 아이콘 유지. Shift+Tab 역순·순환/외부 초점 복구 유지. 초점은 preventScroll:true 후 정보 영역에만 scrollIntoView(block:start)하여 긴 정보의 제목을 먼저 노출 |",
        "docs/3.1 ui hud 디자인/lobby_full_patch.md:1241:| 키보드 | _visualSelectKeydown의 step=(ArrowRight?1:-1)×(현재 dir===rtl?-1:1). next=clamp(index+step,0,icons.length-1). 아이콘 초점에서 좌우는 화면상 좌우 이웃으로 이동하고 기존 click/focus(preventScroll:true)를 실행한다. |",
        "docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md:646:## 2026-09-28 외형 선택창 키보드 조작·초점 격리\r",
        "docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md:654:| Tab | _visualSelectKeydown: 설명(csLeft)→플레이 방식(csRight)→캐릭터 버튼→취소→생성의 enabled 컨트롤을 순환. Shift+Tab 역순. 현재2종은 일반6개/출시 잠금5개. 외부 초점은 정순 설명/역순 마지막 활성 액션으로 복구. focus(preventScroll:true) 후 정보 영역은 scrollIntoView(block:start)로 제목부터 노출. preventDefault/stopPropagation으로 배경 이동 차단 |\r",
        "docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md:755:| Tab 순서 | _visualSelectKeydown의 details는 csLeft/csRight, controls는 details→외형 아이콘→취소→생성 중 enabled 항목. 일반6개/출시 잠금5개. 최초 초점은 기존 선택 아이콘 유지. Shift+Tab 역순·순환/외부 초점 복구 유지. 초점은 preventScroll:true 후 정보 영역에만 scrollIntoView(block:start)하여 긴 정보의 제목을 먼저 노출 |\r",
        "docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md:847:| 키보드 | _visualSelectKeydown의 step=(ArrowRight?1:-1)×(현재 dir===rtl?-1:1). next=clamp(index+step,0,icons.length-1). 아이콘 초점에서 좌우는 화면상 좌우 이웃으로 이동하고 기존 click/focus(preventScroll:true)를 실행한다. |\r",
        "docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md:491:## 2026-09-28 외형 선택창 키보드 조작·초점 격리",
        "docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md:498:| Tab | _visualSelectKeydown: 설명(csLeft)→플레이 방식(csRight)→캐릭터 버튼→취소→생성의 enabled 컨트롤을 순환. Shift+Tab 역순. 현재2종은 일반6개/출시 잠금5개. 외부 초점은 정순 설명/역순 마지막 활성 액션으로 복구. focus(preventScroll:true) 후 정보 영역은 scrollIntoView(block:start)로 제목부터 노출. preventDefault/stopPropagation으로 배경 이동 차단 |",
        "docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md:575:| 키보드·수명 | csLeft/csRight도 tabindex0 지역으로 Tab 순환에 포함, 일반6개/출시 잠금5개. 정보 초점은 제목부터 노출하고 읽기 키는 네이티브 스크롤 허용. _resetVisualInfoScroll로 열기/다른 외형 선택의 본문·패널 위치0, 동일 외형은 보존. 저장 형식 변경 없음 |",
        "docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md:648:| 키보드 | _visualSelectKeydown의 step=(ArrowRight?1:-1)×(현재 dir===rtl?-1:1). next=clamp(index+step,0,icons.length-1). 아이콘 초점에서 좌우는 화면상 좌우 이웃으로 이동하고 기존 click/focus(preventScroll:true)를 실행한다. |",
        "docs/CHANGELOG_SYNC.md:51102:## 2026-09-28 외형 선택창 키보드 조작·초점 격리",
        "docs/CHANGELOG_SYNC.md:51110:| Tab | _visualSelectKeydown: 설명(csLeft)→플레이 방식(csRight)→캐릭터 버튼→취소→생성의 enabled 컨트롤을 순환. Shift+Tab 역순. 현재2종은 일반6개/출시 잠금5개. 외부 초점은 정순 설명/역순 마지막 활성 액션으로 복구. focus(preventScroll:true) 후 정보 영역은 scrollIntoView(block:start)로 제목부터 노출. preventDefault/stopPropagation으로 배경 이동 차단 |",
        "docs/CHANGELOG_SYNC.md:51281:| Tab 순서 | _visualSelectKeydown의 details는 csLeft/csRight, controls는 details→외형 아이콘→취소→생성 중 enabled 항목. 일반6개/출시 잠금5개. 최초 초점은 기존 선택 아이콘 유지. Shift+Tab 역순·순환/외부 초점 복구 유지. 초점은 preventScroll:true 후 정보 영역에만 scrollIntoView(block:start)하여 긴 정보의 제목을 먼저 노출 |",
        "docs/CHANGELOG_SYNC.md:51373:| 키보드 | _visualSelectKeydown의 step=(ArrowRight?1:-1)×(현재 dir===rtl?-1:1). next=clamp(index+step,0,icons.length-1). 아이콘 초점에서 좌우는 화면상 좌우 이웃으로 이동하고 기존 click/focus(preventScroll:true)를 실행한다. |\r",
        "docs/CHANGELOG_DAILY_20260520.md:200:| 키보드·수명 | csLeft/csRight도 tabindex0 지역으로 Tab 순환에 포함, 일반6개/출시 잠금5개. 정보 초점은 제목부터 노출하고 읽기 키는 네이티브 스크롤 허용. _resetVisualInfoScroll로 열기/다른 외형 선택의 본문·패널 위치0, 동일 외형은 보존. 저장 형식 변경 없음 |",
        "docs/CHANGELOG_DAILY_20260520.md:288:| 키보드 | _visualSelectKeydown의 step=(ArrowRight?1:-1)×(현재 dir===rtl?-1:1). next=clamp(index+step,0,icons.length-1). 아이콘 초점에서 좌우는 화면상 좌우 이웃으로 이동하고 기존 click/focus(preventScroll:true)를 실행한다. |",
        "docs/16번역·로컬라이제이션/LOCALIZATION_RUNTIME_20260909.md:282:| 키보드 | _visualSelectKeydown의 step=(ArrowRight?1:-1)×(현재 dir===rtl?-1:1). next=clamp(index+step,0,icons.length-1). 아이콘 초점에서 좌우는 화면상 좌우 이웃으로 이동하고 기존 click/focus(preventScroll:true)를 실행한다. |"
      ]
    },
    "inputs": [
      {
        "path": "AGENTS.md",
        "sha256": "fd59bef70960bcaf1ab9910051faa860362884e574ac2869fad05c6872ae04e4"
      },
      {
        "path": "tools/team-followup-20261002/continuous/COMMON.md",
        "sha256": "de5a881270625a7b2d0e854331205e01372a037340a18474c6442b60e668465e"
      },
      {
        "path": "docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md",
        "sha256": "498d52a211ef9184937f355805d338c45133e81f68b15fba8e6762162013bea1"
      },
      {
        "path": "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_STATE.json",
        "sha256": "3315cacdc190817a8cf712f517e05c912c3d5b05beda29a3bdea37e8f54e1242"
      },
      {
        "path": "docs/3.1 ui hud 디자인/UI_UX_IMPROVEMENT_PROJECT_20260930.md",
        "sha256": "3b7c7591108d8f573d01c431c7eb6584e3695a5aad9141c8b341f089fc0ead8a"
      },
      {
        "path": "docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md",
        "sha256": "06c2c5c4d02238f31dc9b27cd0c64c78be4670276a28f71f26e3f84fee6e8e1f"
      },
      {
        "path": "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md",
        "sha256": "8e84ae631d586d7ae3da5d5c121de2ee1813eff633f7d2053502ea34426ad4de"
      }
    ],
    "sourceFinalSHA256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8",
    "checksSHA256": "81b55d769ac4125bdad67983730ed9e023a1f54998c6b80fccacc3328fc01268"
  },
  "savedFileNotExecuted": true,
  "relocationOnly": "기존 read-only DOM import를 새 파일 상대경로로 변경하고 설명 주석2줄 추가. source 검사 로직 동일.",
  "autonomyPolicy": {
    "version": "autonomy-user-20261002-1126-v1",
    "sha256": "80f7e3cf084c440658b1fae27ad60999ea6e41aa048bb5d22d62a099ab4b9608"
  },
  "capacity": {
    "actualReadUTC": "2026-10-02T11:35:03.518638+00:00 (STATE receipt timestamp)",
    "epoch": "capacity-after-8c317a73-1134",
    "allowNewOwnedFiles": true,
    "reportedChanges": 68,
    "personallyQueriedGit": false,
    "roleBudget": 2,
    "budgetConsumed": 2
  },
  "productionApplied": false,
  "runtimeAccepted": false
}
```
