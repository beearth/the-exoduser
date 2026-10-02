# UIUX 비주얼 선택창 복귀 대상 수명 — 한 건 완료

productionApplied=false / runtimeAccepted=false. 생산·공유 docs는 읽기 전용으로 보존했고 이번 폴더에 checks.mjs, result.md만 작성했다. Git/HEAD/Changes 조회0, HEAD·Changes UNKNOWN. parent 제공 6b865637은 역사적 참조다.

열린 뒤 복귀 대상이 부적합해지는 한 사건을 실제 index.html의 완전한 openVisualSelect → _closeVisualSelect 및 stopMediaVideo 함수로 재현했다. 원본은 disabled/hidden/조상 display:none/visibility:hidden에도 focus를 요청한다. 대역에서는 이 네 요청이 무동작이라 잘못된 실제 초점 이동이나 브라우저 오류로 보고하지 않는다. 명시적으로 focus 예외를 주입한 조건에서만 fixture-focus-throw가 닫기 밖으로 전달됐다. 모든 원본 조건에서도 오류 이전 팝업·미디어 정리는 완료됐다.

메모리 후보는 마지막 복귀 문장만 적합성 검사와 try/catch로 감쌌다. 비활성·숨김 네 조건은 요청0, throwing 조건은 요청1·오류 전달0, 정상 visible/enabled 조건은 원본과 관측 상태·전체 trace·preventScroll:true가 동일하다. 원본 safety 기대5RED/정상1PASS, 후보6PASS; 6조건×원본/후보 12실행. 이전 완료 검사나 root 스킬 minus 검사는 재실행·합산0. detached는 기존 isConnected 차단이며 신규 결함이나 검사로 포함하지 않았다.

| 열린 후 대상 변화 | 원본 focus 요청 / 전달 오류 | 후보 focus 요청 / 전달 오류 | 후보 최종 초점 대역 |
|---|---|---|---|
| disabled | 1 / 없음 | 0 / 없음 | BODY |
| hidden | 1 / 없음 | 0 / 없음 | BODY |
| ancestor-display | 1 / 없음 | 0 / 없음 | BODY |
| visibility | 1 / 없음 | 0 / 없음 | BODY |
| throw | 1 / fixture-focus-throw | 1 / 없음 | BODY |
| valid | 1 / 없음 | 1 / 없음 | opener |

전 조건에서 popup display=none, 닫기 sequence=1, 복귀 참조=null. 두 영상 모두 paused=true/currentTime=0/muted=true/volume=0, _csT/onerror/oncanplay=null, on 클래스 및 src/poster 제거, clear→pause→load 순서 유지. sequence 초기0과1은 하니스 합성값이며 실제 selectVisual은 대역이라 여는 동안 번호를 증가시키지 않는다. 닫기 자체의 +1 원문 계약을 검사했다.

완전한 openVisualSelect는 실제 activeElement를 캡처하고 실제 버튼 노드를 새로 생성한 후 내부로 초점을 이동시켰다. CHAR_VISUALS는 한 개의 합성 항목, selectVisual은 sel 클래스만 지정하는 대역이며 _spawnEmbers/_resetVisualInfoScroll은 빈 대역이다. 기존 read-only node-dom의 connection/contains/classList/attrs/focus/blur와 명시적 layout/media/timer 대역을 사용했다. getClientRects는 합성 80×24 box 또는 빈 배열이며 실제 CSS/GPU/뷰포트 측정이 아니다. pause/load/clearTimeout은 대역으로 상태·호출 순서를 기록하며 실제 영상/오디오/타이머 취소의 성공을 뜻하지 않는다.

읽은 호출 관계: visualCancelBtn은 restoreFocus:true, _visualConfirm 및 _closeCreationOverlays는 기본false. _goLogin/_goCinematic/_goLobby/showLobby는 공용 overlay 정리를 호출한다. 이 callers는 SHA를 고정한 읽기 자료이며 전환 실행은 하지 않았다. Escape/IME/repeat의 이전 정적 계약 조사를 반복하지 않았다.

최소 patch(메모리만 적용):

```diff
-  if(restoreFocus&&target&&target.isConnected)target.focus({preventScroll:true});
+  if(restoreFocus&&target&&target.isConnected){
+    try{
+      if(!target.disabled&&!target.closest('[hidden]')&&target.getClientRects().length&&getComputedStyle(target).visibility==='visible')target.focus({preventScroll:true});
+    }catch(e){}
+  }
```

새 fallback/탭순서/초점 강탈 정책은 없다. 일반 enabled visible button 한 정상 control만 인수했으며 fieldset/inert/비버튼/aria-disabled/Shadow DOM/포커스 함수가 무동작인 다른 경우는 보장하지 않는다. 여기서 적합성 PASS는 실제 복귀 성공의 보증이 아니다. try/catch는 복귀 조회와 focus에만 적용되어 media load 등의 다른 오류를 숨기지 않는다.

## root docs 동기화 인계

코드 산출 완료 후 docs/ 전체 관련키워드 rg를 실제1회 수행: exit0, 23파일/174행, 원출력 SHA256 87f0284c76ef9ef10b93e806fc13fc77013e9f928f6e40e72992d0aa0f9212c9. 검색 영수증·전체 매칭 파일 목록은 아래 evidence에 포함했다. 결과를 쓴 현재 시점은 생산 미적용이므로 기존 SSOT를 구현 완료로 바꾸지 않는다. 후보 채택 시 아래 동일 계약6곳과 초기 초점6곳을 함께 갱신한다. CHANGELOG_SYNC의 과거 검수 행은 이력으로 보존하고 새 dated 후보/채택 기록을 추가한다.

| 정본 위치 | 정확 old | 채택 시 정확 new |
|---|---|---|
| docs/15 세이브+데이터구조/15 세이브+데이터구조.md:668 | &#124; _visualReturnFocus &#124; 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 &#124; | &#124; _visualReturnFocus &#124; 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결되고 disabled가 아니며 [hidden] 조상이 없고 getClientRects().length>0 및 getComputedStyle(target).visibility===visible인 실행 컨트롤에만 focus({preventScroll:true})를 요청한다. 적합성 조회·focus 예외는 닫기 밖으로 전달하지 않으며 대체 초점 대상을 선택하지 않는다. 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 &#124; |
| docs/15 세이브+데이터구조/15 세이브+데이터구조.md:709 | &#124; 초기 초점 &#124; 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 &#124; | &#124; 초기 초점 &#124; 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기 후 _visualReturnFocus 적합성 guard를 통과한 실행 컨트롤에만 초점 복귀를 요청. 부적합 대상은 생략하고 focus 예외는 격리하며 새 fallback 대상은 선택하지 않음 &#124; |
| docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md:2302 | &#124; _visualReturnFocus &#124; 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 &#124; | &#124; _visualReturnFocus &#124; 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결되고 disabled가 아니며 [hidden] 조상이 없고 getClientRects().length>0 및 getComputedStyle(target).visibility===visible인 실행 컨트롤에만 focus({preventScroll:true})를 요청한다. 적합성 조회·focus 예외는 닫기 밖으로 전달하지 않으며 대체 초점 대상을 선택하지 않는다. 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 &#124; |
| docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md:2335 | &#124; 초기 초점 &#124; 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 &#124; | &#124; 초기 초점 &#124; 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기 후 _visualReturnFocus 적합성 guard를 통과한 실행 컨트롤에만 초점 복귀를 요청. 부적합 대상은 생략하고 focus 예외는 격리하며 새 fallback 대상은 선택하지 않음 &#124; |
| docs/CHANGELOG_SYNC.md:51067 | &#124; _visualReturnFocus &#124; 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 &#124; | &#124; _visualReturnFocus &#124; 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결되고 disabled가 아니며 [hidden] 조상이 없고 getClientRects().length>0 및 getComputedStyle(target).visibility===visible인 실행 컨트롤에만 focus({preventScroll:true})를 요청한다. 적합성 조회·focus 예외는 닫기 밖으로 전달하지 않으며 대체 초점 대상을 선택하지 않는다. 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 &#124; |
| docs/CHANGELOG_SYNC.md:51109 | &#124; 초기 초점 &#124; 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 &#124; | &#124; 초기 초점 &#124; 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기 후 _visualReturnFocus 적합성 guard를 통과한 실행 컨트롤에만 초점 복귀를 요청. 부적합 대상은 생략하고 focus 예외는 격리하며 새 fallback 대상은 선택하지 않음 &#124; |
| docs/3.1 ui hud 디자인/lobby_full_patch.md:1008 | &#124; _visualReturnFocus &#124; 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 &#124; | &#124; _visualReturnFocus &#124; 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결되고 disabled가 아니며 [hidden] 조상이 없고 getClientRects().length>0 및 getComputedStyle(target).visibility===visible인 실행 컨트롤에만 focus({preventScroll:true})를 요청한다. 적합성 조회·focus 예외는 닫기 밖으로 전달하지 않으며 대체 초점 대상을 선택하지 않는다. 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 &#124; |
| docs/3.1 ui hud 디자인/lobby_full_patch.md:1041 | &#124; 초기 초점 &#124; 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 &#124; | &#124; 초기 초점 &#124; 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기 후 _visualReturnFocus 적합성 guard를 통과한 실행 컨트롤에만 초점 복귀를 요청. 부적합 대상은 생략하고 focus 예외는 격리하며 새 fallback 대상은 선택하지 않음 &#124; |
| docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md:619 | &#124; _visualReturnFocus &#124; 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 &#124; | &#124; _visualReturnFocus &#124; 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결되고 disabled가 아니며 [hidden] 조상이 없고 getClientRects().length>0 및 getComputedStyle(target).visibility===visible인 실행 컨트롤에만 focus({preventScroll:true})를 요청한다. 적합성 조회·focus 예외는 닫기 밖으로 전달하지 않으며 대체 초점 대상을 선택하지 않는다. 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 &#124; |
| docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md:653 | &#124; 초기 초점 &#124; 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 &#124; | &#124; 초기 초점 &#124; 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기 후 _visualReturnFocus 적합성 guard를 통과한 실행 컨트롤에만 초점 복귀를 요청. 부적합 대상은 생략하고 focus 예외는 격리하며 새 fallback 대상은 선택하지 않음 &#124; |
| docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md:464 | &#124; _visualReturnFocus &#124; 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 &#124; | &#124; _visualReturnFocus &#124; 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결되고 disabled가 아니며 [hidden] 조상이 없고 getClientRects().length>0 및 getComputedStyle(target).visibility===visible인 실행 컨트롤에만 focus({preventScroll:true})를 요청한다. 적합성 조회·focus 예외는 닫기 밖으로 전달하지 않으며 대체 초점 대상을 선택하지 않는다. 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 &#124; |
| docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md:497 | &#124; 초기 초점 &#124; 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 &#124; | &#124; 초기 초점 &#124; 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기 후 _visualReturnFocus 적합성 guard를 통과한 실행 컨트롤에만 초점 복귀를 요청. 부적합 대상은 생략하고 focus 예외는 격리하며 새 fallback 대상은 선택하지 않음 &#124; |

| 추가 항목 | old | new 제안 / 보존 계약 |
|---|---|---|
| UI_UX_IMPROVEMENT_PROJECT_20260930.md UI-05 | 대기 / 현행 로비와 실제 빌드의 차이를 먼저 확인. | 전체 상태 대기 유지. 새 dated 기록: 복귀 대상 수명 후보 완료, 원본5RED/정상1PASS·후보6PASS, 생산/native 미인수. |
| _closeVisualSelect (6정본의 동일 행) | restoreFocus 기본false 및 팝업·미디어 정리 계약 | 기존 문안 유지. 마지막 복귀는 _visualReturnFocus guard 및 예외 격리 계약을 따름을 추가. |
| _visualPreviewSeq | 초기0 / 유효 select 및 닫기 증가 | 원문·수치 그대로 보존. |
| _visualReturnFocus / restoreFocus | 초기null / 기본false / 취소true | 초기값·clear null·기본값·caller 값 그대로 보존. |
| 미디어 canonical 3곳 | SILVERTAIL_KEYART_CANON:70, CHARSELECT_VIDEO_QUALITY:55, 남전사_로비_아이들_모션:92의 닫기·5000ms 해제 | 기존 수치·정리 문안 그대로 보존. 초점 검증 PASS를 영상/청취 PASS로 추가하지 않음. |
| 기타 검색 매칭 | 인벤토리/결정슬롯/설정/패드/번역 등의 별도 초점 계약과 역사적 검증 | 적용 대상 아님. 숫자·정책·과거 기록 유지. |

보호2_3 수정0, Q전용 blackBean 패링·어택티켓 금지·LOCK/TBD·확정수치·저장 구조·에셋 변경0. docs 쓰기 및 commit/push는 root 소유로 인계한다.

## 실행 영수증과 제품 Gate

최종 산출 검증 2026-10-02T10:41:05.203Z / 19:41:05 KST, exit0: source SHA가 최초 읽기·fixture·검색 후와 동일, checks SHA가 evidence와 동일, 폴더는 원래 TASK.md와 새 checks.mjs/result.md 정확3개. TASK SHA256=d7bda1443f62a5d5a42eef266ea118920925cf3064204992efabb5357dc12d41. 보고서 자체 해시는 이 영수증 추가 전 eac716848ec0412fb03fc7d78ab221c7937e2de8ea9463257bd4b2cf4e9fa2b1이며 최종본 해시로 주장하지 않는다.

실행1회 exit0; 하니스 실패0. 실행UTC는 아래 startedUTC/endedUTC, KST는 UTC+09:00. 사용 도구는 functions.exec/exec_command와 apply_patch, Node fs/vm/acorn 및 rg다. 스킬·브라우저·MCP/UI·서버·설치·실게임·빌드·다른 채팅 송신·하위에이전트 호출0.

독립 후보 산출은 완료됐다. root가 owned anchor와 canonical을 인수하고 생산 반영 여부를 결정해야 한다. 실제 브라우저/native에서 enabled visible 취소 복귀와 disabled/hidden/예외 대상 정리·오류 없음, keyboard/gamepad 및 레이아웃 초점 가시성을 별도 확인해야 한다. 실저장/청취/GPU픽셀/맵visual/전체게임/배포는 미검수이며 PASS로 계산하지 않는다. 별도 사용자 결정이나 새 UX 정책이 필요한 항목은 이번 후보에 추가하지 않았다.

```json
{
  "taskId": "UIUX-visual-return-focus-lifetime-hb1014",
  "provider": "Codex",
  "chatId": "01a0faaf-8fd2-7083-b174-69c604bd58b0",
  "startedUTC": "2026-10-02T10:39:43.554Z",
  "endedUTC": "2026-10-02T10:39:43.597Z",
  "root": "/Users/fordeargamers/Projects/exoduser-migration-20261001/",
  "sourceSHA": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8",
  "checksSHA": "621836ae92d6dec576b8f8f4321940fff86bb828a2cc09de315b13a0ae55ff0d",
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
      "sha256": "86ada15a477fc128a77cf10c2337de9fdb36b3f9c463f008f5d3c97e82f60520"
    },
    {
      "path": "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/PROVIDER-HALVES-20261002.md",
      "sha256": "16cbe4b9d0c9d0e0e8cabc1ac8d4f7718f78b4e013b6e5cb169e5bb6d397be6d"
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
    },
    {
      "path": "tools/team-followup-20261001/UIUX/inventory-dom/node-dom.mjs",
      "sha256": "b3c6bb3abf74d5b9e464d1db2e5d2441645af3be8eb096f3c30788b7019cfb95"
    }
  ],
  "fragments": [
    {
      "name": "_closeVisualSelect",
      "line": 3119,
      "sha256": "0dff217111acbd4442ce30841915a5cf8c10683d93e193edd9ed6d14de235c38",
      "executed": true
    },
    {
      "name": "openVisualSelect",
      "line": 3227,
      "sha256": "42150f7f2c86ee2f792079a9b1540230856c2bedfe3c203f212d42e957813e53",
      "executed": true
    },
    {
      "name": "stopMediaVideo",
      "line": 2166,
      "sha256": "c07cda56f5d8814cb5f4a21844ab78a433ecaa00a0e78820b9d4b4e44f567727",
      "executed": true
    },
    {
      "name": "_closeCreationOverlays",
      "line": 3132,
      "sha256": "cee18604ef56d6c1c8c6c7fe7bc320f8ffede78dc2296793174699423a4ae1bc",
      "executed": false
    },
    {
      "name": "_visualConfirm",
      "line": 3270,
      "sha256": "a3ac40e591d152dd25bb2528e4c4f5c75491836c1035a85da370fc305258c996",
      "executed": false
    },
    {
      "name": "_goLogin",
      "line": 2675,
      "sha256": "57102f537f398564a8367756b3b8e49520cce30699ff4a97d6d3ac41009a6625",
      "executed": false
    },
    {
      "name": "_goCinematic",
      "line": 2703,
      "sha256": "7e132259d4c117e41a9c54e5e16afd4bd8633cb7eb80a4b55a0c6710a3f60d17",
      "executed": false
    },
    {
      "name": "_goLobby",
      "line": 2737,
      "sha256": "ebd1e8dad4a9055a9f25919da3db2de4c0a0778d121c70af8e2145d57d942e94",
      "executed": false
    },
    {
      "name": "showLobby",
      "line": 2883,
      "sha256": "ce5ba8957a9cf4a0d9f3eada0ad518e3ad364affae33139de0d30d8f9073f097",
      "executed": false
    }
  ],
  "cancelBinding": "$('visualCancelBtn').onclick=()=>_closeVisualSelect({restoreFocus:true});",
  "original": "function _closeVisualSelect({restoreFocus=false}={}){\n  const pop=$('charVisualPop');if(!pop||pop.style.display!=='flex')return;\n  ++_visualPreviewSeq;\n  const target=_visualReturnFocus;_visualReturnFocus=null;\n  if(pop.contains(document.activeElement))document.activeElement.blur();\n  pop.style.display='none';\n  ['csIdleVid','csSceneVid'].forEach(id=>{\n    const v=$(id);if(!v)return;\n    clearTimeout(v._csT);v._csT=null;v.onerror=null;v.oncanplay=null;\n    stopMediaVideo(v);v.classList.remove('on');v.removeAttribute('src');v.removeAttribute('poster');v.load();\n  });\n  if(restoreFocus&&target&&target.isConnected)target.focus({preventScroll:true});\n}",
  "candidate": "function _closeVisualSelect({restoreFocus=false}={}){\n  const pop=$('charVisualPop');if(!pop||pop.style.display!=='flex')return;\n  ++_visualPreviewSeq;\n  const target=_visualReturnFocus;_visualReturnFocus=null;\n  if(pop.contains(document.activeElement))document.activeElement.blur();\n  pop.style.display='none';\n  ['csIdleVid','csSceneVid'].forEach(id=>{\n    const v=$(id);if(!v)return;\n    clearTimeout(v._csT);v._csT=null;v.onerror=null;v.oncanplay=null;\n    stopMediaVideo(v);v.classList.remove('on');v.removeAttribute('src');v.removeAttribute('poster');v.load();\n  });\n  if(restoreFocus&&target&&target.isConnected){\n    try{\n      if(!target.disabled&&!target.closest('[hidden]')&&target.getClientRects().length&&getComputedStyle(target).visibility==='visible')target.focus({preventScroll:true});\n    }catch(e){}\n  }\n}",
  "cases": [
    {
      "kind": "disabled",
      "before": {
        "mode": "source",
        "kind": "disabled",
        "focusCalls": 1,
        "options": {
          "preventScroll": true
        },
        "escaped": null,
        "active": "BODY",
        "popupDisplay": "none",
        "sequence": 1,
        "returnCleared": true,
        "media": [
          {
            "id": "csIdleVid",
            "paused": true,
            "currentTime": 0,
            "muted": true,
            "volume": 0,
            "timer": null,
            "onerror": null,
            "oncanplay": null,
            "on": false,
            "srcPresent": false,
            "posterPresent": false
          },
          {
            "id": "csSceneVid",
            "paused": true,
            "currentTime": 0,
            "muted": true,
            "volume": 0,
            "timer": null,
            "onerror": null,
            "oncanplay": null,
            "on": false,
            "srcPresent": false,
            "posterPresent": false
          }
        ],
        "trace": [
          "clear:csIdleVid-timer",
          "pause:csIdleVid",
          "load:csIdleVid",
          "clear:csSceneVid-timer",
          "pause:csSceneVid",
          "load:csSceneVid",
          "focus:opener"
        ],
        "safetyPassed": false
      },
      "after": {
        "mode": "candidate",
        "kind": "disabled",
        "focusCalls": 0,
        "options": null,
        "escaped": null,
        "active": "BODY",
        "popupDisplay": "none",
        "sequence": 1,
        "returnCleared": true,
        "media": [
          {
            "id": "csIdleVid",
            "paused": true,
            "currentTime": 0,
            "muted": true,
            "volume": 0,
            "timer": null,
            "onerror": null,
            "oncanplay": null,
            "on": false,
            "srcPresent": false,
            "posterPresent": false
          },
          {
            "id": "csSceneVid",
            "paused": true,
            "currentTime": 0,
            "muted": true,
            "volume": 0,
            "timer": null,
            "onerror": null,
            "oncanplay": null,
            "on": false,
            "srcPresent": false,
            "posterPresent": false
          }
        ],
        "trace": [
          "clear:csIdleVid-timer",
          "pause:csIdleVid",
          "load:csIdleVid",
          "clear:csSceneVid-timer",
          "pause:csSceneVid",
          "load:csSceneVid"
        ],
        "safetyPassed": true
      }
    },
    {
      "kind": "hidden",
      "before": {
        "mode": "source",
        "kind": "hidden",
        "focusCalls": 1,
        "options": {
          "preventScroll": true
        },
        "escaped": null,
        "active": "BODY",
        "popupDisplay": "none",
        "sequence": 1,
        "returnCleared": true,
        "media": [
          {
            "id": "csIdleVid",
            "paused": true,
            "currentTime": 0,
            "muted": true,
            "volume": 0,
            "timer": null,
            "onerror": null,
            "oncanplay": null,
            "on": false,
            "srcPresent": false,
            "posterPresent": false
          },
          {
            "id": "csSceneVid",
            "paused": true,
            "currentTime": 0,
            "muted": true,
            "volume": 0,
            "timer": null,
            "onerror": null,
            "oncanplay": null,
            "on": false,
            "srcPresent": false,
            "posterPresent": false
          }
        ],
        "trace": [
          "clear:csIdleVid-timer",
          "pause:csIdleVid",
          "load:csIdleVid",
          "clear:csSceneVid-timer",
          "pause:csSceneVid",
          "load:csSceneVid",
          "focus:opener"
        ],
        "safetyPassed": false
      },
      "after": {
        "mode": "candidate",
        "kind": "hidden",
        "focusCalls": 0,
        "options": null,
        "escaped": null,
        "active": "BODY",
        "popupDisplay": "none",
        "sequence": 1,
        "returnCleared": true,
        "media": [
          {
            "id": "csIdleVid",
            "paused": true,
            "currentTime": 0,
            "muted": true,
            "volume": 0,
            "timer": null,
            "onerror": null,
            "oncanplay": null,
            "on": false,
            "srcPresent": false,
            "posterPresent": false
          },
          {
            "id": "csSceneVid",
            "paused": true,
            "currentTime": 0,
            "muted": true,
            "volume": 0,
            "timer": null,
            "onerror": null,
            "oncanplay": null,
            "on": false,
            "srcPresent": false,
            "posterPresent": false
          }
        ],
        "trace": [
          "clear:csIdleVid-timer",
          "pause:csIdleVid",
          "load:csIdleVid",
          "clear:csSceneVid-timer",
          "pause:csSceneVid",
          "load:csSceneVid"
        ],
        "safetyPassed": true
      }
    },
    {
      "kind": "ancestor-display",
      "before": {
        "mode": "source",
        "kind": "ancestor-display",
        "focusCalls": 1,
        "options": {
          "preventScroll": true
        },
        "escaped": null,
        "active": "BODY",
        "popupDisplay": "none",
        "sequence": 1,
        "returnCleared": true,
        "media": [
          {
            "id": "csIdleVid",
            "paused": true,
            "currentTime": 0,
            "muted": true,
            "volume": 0,
            "timer": null,
            "onerror": null,
            "oncanplay": null,
            "on": false,
            "srcPresent": false,
            "posterPresent": false
          },
          {
            "id": "csSceneVid",
            "paused": true,
            "currentTime": 0,
            "muted": true,
            "volume": 0,
            "timer": null,
            "onerror": null,
            "oncanplay": null,
            "on": false,
            "srcPresent": false,
            "posterPresent": false
          }
        ],
        "trace": [
          "clear:csIdleVid-timer",
          "pause:csIdleVid",
          "load:csIdleVid",
          "clear:csSceneVid-timer",
          "pause:csSceneVid",
          "load:csSceneVid",
          "focus:opener"
        ],
        "safetyPassed": false
      },
      "after": {
        "mode": "candidate",
        "kind": "ancestor-display",
        "focusCalls": 0,
        "options": null,
        "escaped": null,
        "active": "BODY",
        "popupDisplay": "none",
        "sequence": 1,
        "returnCleared": true,
        "media": [
          {
            "id": "csIdleVid",
            "paused": true,
            "currentTime": 0,
            "muted": true,
            "volume": 0,
            "timer": null,
            "onerror": null,
            "oncanplay": null,
            "on": false,
            "srcPresent": false,
            "posterPresent": false
          },
          {
            "id": "csSceneVid",
            "paused": true,
            "currentTime": 0,
            "muted": true,
            "volume": 0,
            "timer": null,
            "onerror": null,
            "oncanplay": null,
            "on": false,
            "srcPresent": false,
            "posterPresent": false
          }
        ],
        "trace": [
          "clear:csIdleVid-timer",
          "pause:csIdleVid",
          "load:csIdleVid",
          "clear:csSceneVid-timer",
          "pause:csSceneVid",
          "load:csSceneVid"
        ],
        "safetyPassed": true
      }
    },
    {
      "kind": "visibility",
      "before": {
        "mode": "source",
        "kind": "visibility",
        "focusCalls": 1,
        "options": {
          "preventScroll": true
        },
        "escaped": null,
        "active": "BODY",
        "popupDisplay": "none",
        "sequence": 1,
        "returnCleared": true,
        "media": [
          {
            "id": "csIdleVid",
            "paused": true,
            "currentTime": 0,
            "muted": true,
            "volume": 0,
            "timer": null,
            "onerror": null,
            "oncanplay": null,
            "on": false,
            "srcPresent": false,
            "posterPresent": false
          },
          {
            "id": "csSceneVid",
            "paused": true,
            "currentTime": 0,
            "muted": true,
            "volume": 0,
            "timer": null,
            "onerror": null,
            "oncanplay": null,
            "on": false,
            "srcPresent": false,
            "posterPresent": false
          }
        ],
        "trace": [
          "clear:csIdleVid-timer",
          "pause:csIdleVid",
          "load:csIdleVid",
          "clear:csSceneVid-timer",
          "pause:csSceneVid",
          "load:csSceneVid",
          "focus:opener"
        ],
        "safetyPassed": false
      },
      "after": {
        "mode": "candidate",
        "kind": "visibility",
        "focusCalls": 0,
        "options": null,
        "escaped": null,
        "active": "BODY",
        "popupDisplay": "none",
        "sequence": 1,
        "returnCleared": true,
        "media": [
          {
            "id": "csIdleVid",
            "paused": true,
            "currentTime": 0,
            "muted": true,
            "volume": 0,
            "timer": null,
            "onerror": null,
            "oncanplay": null,
            "on": false,
            "srcPresent": false,
            "posterPresent": false
          },
          {
            "id": "csSceneVid",
            "paused": true,
            "currentTime": 0,
            "muted": true,
            "volume": 0,
            "timer": null,
            "onerror": null,
            "oncanplay": null,
            "on": false,
            "srcPresent": false,
            "posterPresent": false
          }
        ],
        "trace": [
          "clear:csIdleVid-timer",
          "pause:csIdleVid",
          "load:csIdleVid",
          "clear:csSceneVid-timer",
          "pause:csSceneVid",
          "load:csSceneVid"
        ],
        "safetyPassed": true
      }
    },
    {
      "kind": "throw",
      "before": {
        "mode": "source",
        "kind": "throw",
        "focusCalls": 1,
        "options": {
          "preventScroll": true
        },
        "escaped": "fixture-focus-throw",
        "active": "BODY",
        "popupDisplay": "none",
        "sequence": 1,
        "returnCleared": true,
        "media": [
          {
            "id": "csIdleVid",
            "paused": true,
            "currentTime": 0,
            "muted": true,
            "volume": 0,
            "timer": null,
            "onerror": null,
            "oncanplay": null,
            "on": false,
            "srcPresent": false,
            "posterPresent": false
          },
          {
            "id": "csSceneVid",
            "paused": true,
            "currentTime": 0,
            "muted": true,
            "volume": 0,
            "timer": null,
            "onerror": null,
            "oncanplay": null,
            "on": false,
            "srcPresent": false,
            "posterPresent": false
          }
        ],
        "trace": [
          "clear:csIdleVid-timer",
          "pause:csIdleVid",
          "load:csIdleVid",
          "clear:csSceneVid-timer",
          "pause:csSceneVid",
          "load:csSceneVid",
          "focus:opener"
        ],
        "safetyPassed": false
      },
      "after": {
        "mode": "candidate",
        "kind": "throw",
        "focusCalls": 1,
        "options": {
          "preventScroll": true
        },
        "escaped": null,
        "active": "BODY",
        "popupDisplay": "none",
        "sequence": 1,
        "returnCleared": true,
        "media": [
          {
            "id": "csIdleVid",
            "paused": true,
            "currentTime": 0,
            "muted": true,
            "volume": 0,
            "timer": null,
            "onerror": null,
            "oncanplay": null,
            "on": false,
            "srcPresent": false,
            "posterPresent": false
          },
          {
            "id": "csSceneVid",
            "paused": true,
            "currentTime": 0,
            "muted": true,
            "volume": 0,
            "timer": null,
            "onerror": null,
            "oncanplay": null,
            "on": false,
            "srcPresent": false,
            "posterPresent": false
          }
        ],
        "trace": [
          "clear:csIdleVid-timer",
          "pause:csIdleVid",
          "load:csIdleVid",
          "clear:csSceneVid-timer",
          "pause:csSceneVid",
          "load:csSceneVid",
          "focus:opener"
        ],
        "safetyPassed": true
      }
    },
    {
      "kind": "valid",
      "before": {
        "mode": "source",
        "kind": "valid",
        "focusCalls": 1,
        "options": {
          "preventScroll": true
        },
        "escaped": null,
        "active": "opener",
        "popupDisplay": "none",
        "sequence": 1,
        "returnCleared": true,
        "media": [
          {
            "id": "csIdleVid",
            "paused": true,
            "currentTime": 0,
            "muted": true,
            "volume": 0,
            "timer": null,
            "onerror": null,
            "oncanplay": null,
            "on": false,
            "srcPresent": false,
            "posterPresent": false
          },
          {
            "id": "csSceneVid",
            "paused": true,
            "currentTime": 0,
            "muted": true,
            "volume": 0,
            "timer": null,
            "onerror": null,
            "oncanplay": null,
            "on": false,
            "srcPresent": false,
            "posterPresent": false
          }
        ],
        "trace": [
          "clear:csIdleVid-timer",
          "pause:csIdleVid",
          "load:csIdleVid",
          "clear:csSceneVid-timer",
          "pause:csSceneVid",
          "load:csSceneVid",
          "focus:opener"
        ],
        "safetyPassed": true
      },
      "after": {
        "mode": "candidate",
        "kind": "valid",
        "focusCalls": 1,
        "options": {
          "preventScroll": true
        },
        "escaped": null,
        "active": "opener",
        "popupDisplay": "none",
        "sequence": 1,
        "returnCleared": true,
        "media": [
          {
            "id": "csIdleVid",
            "paused": true,
            "currentTime": 0,
            "muted": true,
            "volume": 0,
            "timer": null,
            "onerror": null,
            "oncanplay": null,
            "on": false,
            "srcPresent": false,
            "posterPresent": false
          },
          {
            "id": "csSceneVid",
            "paused": true,
            "currentTime": 0,
            "muted": true,
            "volume": 0,
            "timer": null,
            "onerror": null,
            "oncanplay": null,
            "on": false,
            "srcPresent": false,
            "posterPresent": false
          }
        ],
        "trace": [
          "clear:csIdleVid-timer",
          "pause:csIdleVid",
          "load:csIdleVid",
          "clear:csSceneVid-timer",
          "pause:csSceneVid",
          "load:csSceneVid",
          "focus:opener"
        ],
        "safetyPassed": true
      }
    }
  ],
  "productionApplied": false,
  "runtimeAccepted": false,
  "HEAD": "UNKNOWN",
  "Changes": "UNKNOWN",
  "receipt": {
    "command": "/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node tools/team-followup-20261002/supervisor-next/UIUX/UIUX-visual-return-focus-lifetime-hb1014/checks.mjs",
    "exit": 0,
    "harnessFailures": [],
    "runCount": 1,
    "preflightUTC": "2026-10-02T10:38:54.965Z",
    "preflightOwnedFiles": [
      "TASK.md"
    ],
    "historicalParentProvided": "6b865637",
    "historicalParentIsCurrentHEAD": false
  },
  "docsScan": {
    "startedUTC": "2026-10-02T10:39:54.763Z",
    "endedUTC": "2026-10-02T10:39:54.789Z",
    "command": [
      "rg",
      "-n",
      "-e",
      "_closeVisualSelect|_visualReturnFocus|_visualPreviewSeq|visualCancelBtn|초점 복귀|초점 복원",
      "docs/"
    ],
    "exit": 0,
    "error": null,
    "stderr": "",
    "matchingLines": 174,
    "files": [
      "docs/2_9 결정슬롯시스템/2_9 결정슬롯시스템.md",
      "docs/15 세이브+데이터구조/15 세이브+데이터구조.md",
      "docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md",
      "docs/2_7 인벤토리+장비시스템/INVENTORY_KEYBOARD_FOCUS_20261002.md",
      "docs/3.1 ui hud 디자인/UI_UX_IMPROVEMENT_PROJECT_20260930.md",
      "docs/archetypes/silvertail/SILVERTAIL_KEYART_CANON_20260927.md",
      "docs/6사운드디자인/6사운드디자인.md",
      "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md",
      "docs/3.1 ui hud 디자인/GEM_ATELIER_20260927.md",
      "docs/CHANGELOG_SYNC.md",
      "docs/3.1 ui hud 디자인/SETTINGS_UI_WORKSPACE_20260929.md",
      "docs/CHANGELOG_DAILY_20260520.md",
      "docs/1전체그래픽세팅/CHARSELECT_VIDEO_QUALITY_20260913.md",
      "docs/16번역·로컬라이제이션/LOCALIZATION_RUNTIME_20260909.md",
      "docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md",
      "docs/3.1 ui hud 디자인/남전사_로비_아이들_모션_20260908.md",
      "docs/3.1 ui hud 디자인/lobby_full_patch.md",
      "docs/3.3 키바인딩+설정/게임패드_매핑표.md",
      "docs/3.3 키바인딩+설정/게임패드_트러블슈팅.md",
      "docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md",
      "docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md",
      "docs/3.1 ui hud 디자인/SETTINGS_HUD_DETAIL_20260930.md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/FOUR-SUBMISSIONS-HELLRAY-20261002.md"
    ],
    "stdoutSHA256": "87f0284c76ef9ef10b93e806fc13fc77013e9f928f6e40e72992d0aa0f9212c9",
    "sourceFinalSHA256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
  },
  "canonicalProposals": [
    {
      "path": "docs/15 세이브+데이터구조/15 세이브+데이터구조.md",
      "line": 668,
      "old": "| _visualReturnFocus | 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |",
      "new": "| _visualReturnFocus | 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결되고 disabled가 아니며 [hidden] 조상이 없고 getClientRects().length>0 및 getComputedStyle(target).visibility===visible인 실행 컨트롤에만 focus({preventScroll:true})를 요청한다. 적합성 조회·focus 예외는 닫기 밖으로 전달하지 않으며 대체 초점 대상을 선택하지 않는다. 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |"
    },
    {
      "path": "docs/15 세이브+데이터구조/15 세이브+데이터구조.md",
      "line": 709,
      "old": "| 초기 초점 | 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 |",
      "new": "| 초기 초점 | 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기 후 _visualReturnFocus 적합성 guard를 통과한 실행 컨트롤에만 초점 복귀를 요청. 부적합 대상은 생략하고 focus 예외는 격리하며 새 fallback 대상은 선택하지 않음 |"
    },
    {
      "path": "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md",
      "line": 2302,
      "old": "| _visualReturnFocus | 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |",
      "new": "| _visualReturnFocus | 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결되고 disabled가 아니며 [hidden] 조상이 없고 getClientRects().length>0 및 getComputedStyle(target).visibility===visible인 실행 컨트롤에만 focus({preventScroll:true})를 요청한다. 적합성 조회·focus 예외는 닫기 밖으로 전달하지 않으며 대체 초점 대상을 선택하지 않는다. 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |"
    },
    {
      "path": "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md",
      "line": 2335,
      "old": "| 초기 초점 | 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 |",
      "new": "| 초기 초점 | 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기 후 _visualReturnFocus 적합성 guard를 통과한 실행 컨트롤에만 초점 복귀를 요청. 부적합 대상은 생략하고 focus 예외는 격리하며 새 fallback 대상은 선택하지 않음 |"
    },
    {
      "path": "docs/CHANGELOG_SYNC.md",
      "line": 51067,
      "old": "| _visualReturnFocus | 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |",
      "new": "| _visualReturnFocus | 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결되고 disabled가 아니며 [hidden] 조상이 없고 getClientRects().length>0 및 getComputedStyle(target).visibility===visible인 실행 컨트롤에만 focus({preventScroll:true})를 요청한다. 적합성 조회·focus 예외는 닫기 밖으로 전달하지 않으며 대체 초점 대상을 선택하지 않는다. 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |"
    },
    {
      "path": "docs/CHANGELOG_SYNC.md",
      "line": 51109,
      "old": "| 초기 초점 | 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 |",
      "new": "| 초기 초점 | 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기 후 _visualReturnFocus 적합성 guard를 통과한 실행 컨트롤에만 초점 복귀를 요청. 부적합 대상은 생략하고 focus 예외는 격리하며 새 fallback 대상은 선택하지 않음 |"
    },
    {
      "path": "docs/3.1 ui hud 디자인/lobby_full_patch.md",
      "line": 1008,
      "old": "| _visualReturnFocus | 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |",
      "new": "| _visualReturnFocus | 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결되고 disabled가 아니며 [hidden] 조상이 없고 getClientRects().length>0 및 getComputedStyle(target).visibility===visible인 실행 컨트롤에만 focus({preventScroll:true})를 요청한다. 적합성 조회·focus 예외는 닫기 밖으로 전달하지 않으며 대체 초점 대상을 선택하지 않는다. 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |"
    },
    {
      "path": "docs/3.1 ui hud 디자인/lobby_full_patch.md",
      "line": 1041,
      "old": "| 초기 초점 | 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 |",
      "new": "| 초기 초점 | 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기 후 _visualReturnFocus 적합성 guard를 통과한 실행 컨트롤에만 초점 복귀를 요청. 부적합 대상은 생략하고 focus 예외는 격리하며 새 fallback 대상은 선택하지 않음 |"
    },
    {
      "path": "docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md",
      "line": 619,
      "old": "| _visualReturnFocus | 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |",
      "new": "| _visualReturnFocus | 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결되고 disabled가 아니며 [hidden] 조상이 없고 getClientRects().length>0 및 getComputedStyle(target).visibility===visible인 실행 컨트롤에만 focus({preventScroll:true})를 요청한다. 적합성 조회·focus 예외는 닫기 밖으로 전달하지 않으며 대체 초점 대상을 선택하지 않는다. 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |"
    },
    {
      "path": "docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md",
      "line": 653,
      "old": "| 초기 초점 | 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 |",
      "new": "| 초기 초점 | 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기 후 _visualReturnFocus 적합성 guard를 통과한 실행 컨트롤에만 초점 복귀를 요청. 부적합 대상은 생략하고 focus 예외는 격리하며 새 fallback 대상은 선택하지 않음 |"
    },
    {
      "path": "docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md",
      "line": 464,
      "old": "| _visualReturnFocus | 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |",
      "new": "| _visualReturnFocus | 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결되고 disabled가 아니며 [hidden] 조상이 없고 getClientRects().length>0 및 getComputedStyle(target).visibility===visible인 실행 컨트롤에만 focus({preventScroll:true})를 요청한다. 적합성 조회·focus 예외는 닫기 밖으로 전달하지 않으며 대체 초점 대상을 선택하지 않는다. 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |"
    },
    {
      "path": "docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md",
      "line": 497,
      "old": "| 초기 초점 | 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 |",
      "new": "| 초기 초점 | 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기 후 _visualReturnFocus 적합성 guard를 통과한 실행 컨트롤에만 초점 복귀를 요청. 부적합 대상은 생략하고 focus 예외는 격리하며 새 fallback 대상은 선택하지 않음 |"
    }
  ]
}
```
