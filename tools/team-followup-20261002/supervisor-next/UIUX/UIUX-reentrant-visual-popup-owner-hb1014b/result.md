# UIUX-reentrant-visual-popup-owner-hb1014b — 완료

productionApplied=false / runtimeAccepted=false. 이번 소유 result.md·checks.mjs 두 파일만 작성. 생산·공유docs·기존 산출·다른 팀 WIP 보존. Git/HEAD/Changes 조회0; HEAD/Changes UNKNOWN. parent 제공 d5c1b62d은 역사적 기준이며 현재 HEAD로 주장하지 않는다.

실제 full openVisualSelect/selectVisual/_closeVisualSelect로 중복 열기의 반환 대상 소유 유실을 재현했다. 외부 button에서 처음 연 뒤 실제 생성 아이콘1의 onclick으로 selectVisual(1)을 실행하고 내부 아이콘에 초점을 준다. 열린 창을 다시 열면 원본은 _visualReturnFocus를 이 내부 아이콘으로 덮어쓴 뒤 grid.replaceChildren()으로 그 아이콘을 분리한다. 실제 취소 바인딩은 닫기를 실행하지만 외부 반환 owner가 유실되어 BODY에 남는다. 이는 owner 캡처 덮어쓰기 결함이며 기존 isConnected에 의한 detached 차단 자체를 새 결함으로 보고하지 않는다.

최소 후보는 팝업이 flex가 아닐 때만 기존 activeElement를 캡처한다. 중복 open 자체는 계속 실행해 원래 선택/아이콘 재생성/내부 초기 초점 흐름을 보존한다. 새 fallback/탭순서 정책·전건 disabled/hidden/rect/visibility/throw guard를 추가하거나 재실행하지 않았다.

| 사건 / 대조 | 원본 | 메모리 후보 |
|---|---|---|
| 열린 상태 두 번째 open 반환 owner | detached-old-icon | external-owner |
| 재진입 뒤 취소 초점 대역 | BODY / owner 기대 RED | external-owner / GREEN |
| 한 번 open→선택1→취소 control | 외부 owner 복귀 PASS | 관측·전체 trace 동일 PASS |
| 재진입 선택·잠금 | index1, 현재5아이콘 중1만 selected/aria-pressed=true, 생성 잠금=true | 동일 |
| 재진입 media/timer 정리 | 정상 완료 | 전체 trace 동등 |

새 사건 원본1RED→후보1GREEN, 1회 open/close 정상 전후2PASS: 총4실행. source full CHAR_VISUALS는 현재5개이며 index1 출시 잠금을 유지했다. 정상 sequence0→첫 선택1→아이콘 선택2→닫기3, 재진입은 재선택3→닫기4다. 후보가 재진입 selectVisual 실행을 생략하지 않음을 확인했다.

양쪽 재진입의 media/timer 전체 trace·cleanup trace 동일. 닫기 후 두 영상 paused=true/currentTime=0/muted=true/volume=0, _csT/onerror/oncanplay=null, on/src/poster 제거; popup none·반환 참조null·가상 active timer0. 정확 trace와 상태는 아래 JSON에 보존했다.

최소 메모리 patch:

```diff
 function openVisualSelect(){
-  _visualReturnFocus=document.activeElement;
-  const pop=$('charVisualPop');pop.style.display='flex';
+  const pop=$('charVisualPop');
+  if(pop.style.display!=='flex')_visualReturnFocus=document.activeElement;
+  pop.style.display='flex';
```

## 원문과 대역의 경계

현재 index.html의 full openVisualSelect/selectVisual/_closeVisualSelect/stopMediaVideo/_spawnEmbers/_resetVisualInfoScroll, CHAR_VISUALS 선언·실제 아이콘 onclick·취소 binding을 acorn으로 추출해 VM 실행했다. AUTH/저장 caller는 실행하지 않고 함수 SHA만 고정했다. caller 목록·현재 줄·SHA·실행 여부는 evidence에 있다. CHAR_VISUALS를 합성2종으로 대체하지 않았다.

DOM은 기존 read-only node-dom.mjs 대역이다. connection/contains/replaceChildren/attrs/classList/focus/blur와 부모 연결을 사용했다. media src/poster는 attribute accessor, getAttribute/pause/play/load는 명시 대역이며 실제 디코딩·재생·청취 검사가 아니다. timer는 Map 기반 가상 예약/해제로 원본 callback을 보존하되 발화시키지 않는다. 기존 requestSeq/isCurrent가 막는 stale callback을 신규 결함으로 주장하거나 재검사하지 않았다. _TL/escHtml은 identity 대역, 없는 csEmbers는 원문 _spawnEmbers가 반환한다. 기존 csTraits 원문 innerHTML 할당은 격리 DOM의 제한된 setter로 처리했고 실제 DOM/생산 코드는 변경0. 새 후보는 부모 콘텐츠 교체를 추가하지 않는다.

BODY 관측은 source/fixture 결과이며 실제 키보드 자연 중복 입력·브라우저/native에서 발생했다는 증거가 아니다. 내부 아이콘 재진입 한 경계만 검수했다. 외부 owner 소멸·disabled/hidden/inert/fieldset/Shadow DOM은 이번 검사0. 전건 후보와의 합본 인수는 root가 별도 수행한다.

## 실패와 영수증

최초 실행 exit1: 실제 CHAR_VISUALS는5개지만 기대 selected 배열을2개로 고정한 assert.deepEqual 오류. 데이터 길이와 index1 선택에 맞게 validator만 수정 후 exit0. 최초 시작·종료UTC는 미계측, 실패 관측 UTC만 2026-10-02 11:04:17 UTC로 별도 기록한다. 성공 실행은 2026-10-02T11:04:17.510Z~2026-10-02T11:04:17.562Z, KST=UTC+09:00. 보고서 생성 중 CRLF 검색 행 끝 CR로 정본 파싱 TypeError가 발생했으며 그 호출에서 파일 작성0; trimEnd로 해결했다. 원문 오류·최종 checks/입력 SHA는 아래 evidence에 있다.

실제 도구: functions.exec/exec_command, apply_patch, Node fs/vm/acorn, rg. 스킬·하위에이전트·새팀/채팅·외부 송신·Git·서버·실게임·빌드·설치·이미지생성·저장·audio/UI 도구0. 이전 완료 검사 반복0.

## docs 인계

코드/validator 완료 후 docs/ 전체 rg 실제1회, exit0, 18파일/189행; 원출력 SHA256 8b2451706e08e8b9cd301affbac9884b072182c4a1456fa0a3861b9a3e60e764. 명령·UTC·전체 매칭 파일은 evidence에 있다. 생산 미적용이므로 SSOT 쓰기0. root 채택 시 정본6곳 owner 행·초기 초점 행에 아래 계약을 반영한다. CHANGELOG_SYNC 과거 검수 기록은 보존하고 새 날짜의 채택 기록을 추가한다.

| 정본 / 행 | 정확 old | 채택 시 정확 new |
|---|---|---|
| docs/15 세이브+데이터구조/15 세이브+데이터구조.md:668 | &#124; _visualReturnFocus &#124; 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 &#124; | &#124; _visualReturnFocus &#124; 초기null. openVisualSelect 진입 시 #charVisualPop.style.display가 flex가 아닌 경우에만 기존 document.activeElement를 캡처. 이미 열린 flex 상태의 재호출은 최초 외부 반환 대상을 덮어쓰지 않으며 기존 아이콘 재생성·현재 선택 미리보기·내부 초기 초점 처리는 유지. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 &#124; |
| docs/15 세이브+데이터구조/15 세이브+데이터구조.md:709 | &#124; 초기 초점 &#124; 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 &#124; | &#124; 초기 초점 &#124; 숨김→열림에서만 원래 activeElement를 _visualReturnFocus로 보존하고 열린 상태 재호출은 기존 반환 owner를 유지한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 &#124; |
| docs/CHANGELOG_SYNC.md:51067 | &#124; _visualReturnFocus &#124; 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 &#124; | &#124; _visualReturnFocus &#124; 초기null. openVisualSelect 진입 시 #charVisualPop.style.display가 flex가 아닌 경우에만 기존 document.activeElement를 캡처. 이미 열린 flex 상태의 재호출은 최초 외부 반환 대상을 덮어쓰지 않으며 기존 아이콘 재생성·현재 선택 미리보기·내부 초기 초점 처리는 유지. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 &#124; |
| docs/CHANGELOG_SYNC.md:51109 | &#124; 초기 초점 &#124; 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 &#124; | &#124; 초기 초점 &#124; 숨김→열림에서만 원래 activeElement를 _visualReturnFocus로 보존하고 열린 상태 재호출은 기존 반환 owner를 유지한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 &#124; |
| docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md:464 | &#124; _visualReturnFocus &#124; 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 &#124; | &#124; _visualReturnFocus &#124; 초기null. openVisualSelect 진입 시 #charVisualPop.style.display가 flex가 아닌 경우에만 기존 document.activeElement를 캡처. 이미 열린 flex 상태의 재호출은 최초 외부 반환 대상을 덮어쓰지 않으며 기존 아이콘 재생성·현재 선택 미리보기·내부 초기 초점 처리는 유지. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 &#124; |
| docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md:497 | &#124; 초기 초점 &#124; 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 &#124; | &#124; 초기 초점 &#124; 숨김→열림에서만 원래 activeElement를 _visualReturnFocus로 보존하고 열린 상태 재호출은 기존 반환 owner를 유지한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 &#124; |
| docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md:2302 | &#124; _visualReturnFocus &#124; 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 &#124; | &#124; _visualReturnFocus &#124; 초기null. openVisualSelect 진입 시 #charVisualPop.style.display가 flex가 아닌 경우에만 기존 document.activeElement를 캡처. 이미 열린 flex 상태의 재호출은 최초 외부 반환 대상을 덮어쓰지 않으며 기존 아이콘 재생성·현재 선택 미리보기·내부 초기 초점 처리는 유지. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 &#124; |
| docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md:2335 | &#124; 초기 초점 &#124; 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 &#124; | &#124; 초기 초점 &#124; 숨김→열림에서만 원래 activeElement를 _visualReturnFocus로 보존하고 열린 상태 재호출은 기존 반환 owner를 유지한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 &#124; |
| docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md:619 | &#124; _visualReturnFocus &#124; 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 &#124; | &#124; _visualReturnFocus &#124; 초기null. openVisualSelect 진입 시 #charVisualPop.style.display가 flex가 아닌 경우에만 기존 document.activeElement를 캡처. 이미 열린 flex 상태의 재호출은 최초 외부 반환 대상을 덮어쓰지 않으며 기존 아이콘 재생성·현재 선택 미리보기·내부 초기 초점 처리는 유지. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 &#124; |
| docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md:653 | &#124; 초기 초점 &#124; 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 &#124; | &#124; 초기 초점 &#124; 숨김→열림에서만 원래 activeElement를 _visualReturnFocus로 보존하고 열린 상태 재호출은 기존 반환 owner를 유지한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 &#124; |
| docs/3.1 ui hud 디자인/lobby_full_patch.md:1008 | &#124; _visualReturnFocus &#124; 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 &#124; | &#124; _visualReturnFocus &#124; 초기null. openVisualSelect 진입 시 #charVisualPop.style.display가 flex가 아닌 경우에만 기존 document.activeElement를 캡처. 이미 열린 flex 상태의 재호출은 최초 외부 반환 대상을 덮어쓰지 않으며 기존 아이콘 재생성·현재 선택 미리보기·내부 초기 초점 처리는 유지. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 &#124; |
| docs/3.1 ui hud 디자인/lobby_full_patch.md:1041 | &#124; 초기 초점 &#124; 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 &#124; | &#124; 초기 초점 &#124; 숨김→열림에서만 원래 activeElement를 _visualReturnFocus로 보존하고 열린 상태 재호출은 기존 반환 owner를 유지한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 &#124; |

| 항목 | old / 현행 | new 인계 / 보존 |
|---|---|---|
| UI-05 작업대장 | 전체 대기 | 대기 유지. dated 기록 추가: 재진입 owner 원본1RED→후보1GREEN·정상전후2PASS, 생산/native 미인수. |
| openVisualSelect | 매 호출 activeElement 캡처 | 숨김→열림에서만 캡처, 열린 flex 재호출 반환 owner 유지; 나머지 원문 유지. |
| _visualReturnFocus | 초기null / 닫기 null | 동일. 캡처 수명만 보충. |
| _visualPreviewSeq / selectVisual | 초기0·유효 선택/닫기 +1·isCurrent 보호 | 원문·공식·수치 보존. 중복 open 재선택 +1도 유지. |
| _closeVisualSelect | restoreFocus 기본false·취소true·연결 대상 focus·미디어 정리 | 변경0. 전건 부적합 target 후보는 별도 인수 자료. |
| 다른 검색 매칭 | 영상 canonical/다른 UI 초점/역사·감독 기록 | 별도 시스템·에셋·수치·운영 기록 변경0. |

보호2_3·Q전용 blackBean·어택티켓금지·LOCK/TBD·확정수치·세이브 구조 보존. docs 쓰기·Git/checkpoint·생산 합본 인수는 root 소유다.

## 제품 Gate

최종 산출 audit: 2026-10-02T11:06:25.097Z / exit0. 생산 index.html SHA 최초 fixture·docs 검색 후·최종 audit 동일. checks SHA와 evidence 일치, TASK SHA가 감독 제공 e582206732372d0d0c57f2e47e77cdc7aa6703d326493500057c7da21bae0f7c와 일치. 폴더는 원래 TASK.md 및 새 checks.mjs/result.md 정확3개. 최종 audit는 자료/소유 검증이며 하니스 반복 실행이 아니다.

독립 후보·validator·정상 대조·docs 인계 완료. root가 정확 anchor를 채택한 뒤 브라우저/native에서 실제 재진입 경로와 취소 복귀·선택/잠금·미디어 정리·가시 초점을 확인해야 한다. 전건 guard와 함께 적용하면 두 anchor 합본 인수도 별도다. 실게임/저장/패드/청취/GPU픽셀/맵visual/배포 UNKNOWN; source PASS로 치환하지 않는다. 이번 산출을 막는 blocker나 새 사용자 결정은 없다.

```json
{
  "taskId": "UIUX-reentrant-visual-popup-owner-hb1014b",
  "provider": "Codex",
  "chatId": "01a0faaf-8fd2-7083-b174-69c604bd58b0",
  "startedUTC": "2026-10-02T11:04:17.510Z",
  "endedUTC": "2026-10-02T11:04:17.562Z",
  "root": "/Users/fordeargamers/Projects/exoduser-migration-20261001/",
  "sourceSHA256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8",
  "checksSHA256": "30a0105178aa83bb0240fa6fde7b073db618a7bd4f9731557545a0dba0b2db57",
  "taskSHA256": "e582206732372d0d0c57f2e47e77cdc7aa6703d326493500057c7da21bae0f7c",
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
      "name": "CHAR_VISUALS",
      "line": 3076,
      "sha256": "b37783b99abdbc25f87cc00c0524d60fe2f063eedffdb939a19481334b61d9a1",
      "executed": true
    },
    {
      "name": "openVisualSelect",
      "line": 3227,
      "sha256": "42150f7f2c86ee2f792079a9b1540230856c2bedfe3c203f212d42e957813e53",
      "executed": true
    },
    {
      "name": "selectVisual",
      "line": 3155,
      "sha256": "3db46074afc04296d7d42e136a1153485e4f1748cf7930029b948ac0814d2b8b",
      "executed": true
    },
    {
      "name": "_closeVisualSelect",
      "line": 3119,
      "sha256": "0dff217111acbd4442ce30841915a5cf8c10683d93e193edd9ed6d14de235c38",
      "executed": true
    },
    {
      "name": "stopMediaVideo",
      "line": 2166,
      "sha256": "c07cda56f5d8814cb5f4a21844ab78a433ecaa00a0e78820b9d4b4e44f567727",
      "executed": true
    },
    {
      "name": "_spawnEmbers",
      "line": 3219,
      "sha256": "1d967d8d2d749e1b6d5527ad69e8851ce9c6e3c0bab1f9a186f5c2debb7d89ed",
      "executed": true
    },
    {
      "name": "_resetVisualInfoScroll",
      "line": 3144,
      "sha256": "6d103cd9dc1a570fb86ddb4f24619c44c57b5100b37bdf125f79b6514389fc47",
      "executed": true
    },
    {
      "name": "loadCharacters",
      "line": 2903,
      "sha256": "6f2032053813677ad9d8d12df6e3921881179f79f3218f26a57a768757a04c17",
      "executed": false
    },
    {
      "name": "_renderOnlineSlots",
      "line": 3003,
      "sha256": "0c24afb89db2b5766d3fb3a8a1934132607a29a16f6aefae1f08e14fe4d3b684",
      "executed": false
    },
    {
      "name": "_renderSlotList",
      "line": 3432,
      "sha256": "f4d0b4e9f4bb56b90c218ac5eda3f3cd68c7778dee2e23d4ee409977f15739e5",
      "executed": false
    },
    {
      "name": "loadLocalCharacters",
      "line": 3399,
      "sha256": "ed4ebad62ee4f6486a27cda10a06e3955d287d49e12c15e803c29ec090bad2d1",
      "executed": false
    },
    {
      "name": "_enterOffline",
      "line": 2780,
      "sha256": "42eacf579d67fdfd357debf9f716cbbce00617e833c6346c553dfcdc14c17b7f",
      "executed": false
    },
    {
      "name": "_visualConfirm",
      "line": 3270,
      "sha256": "a3ac40e591d152dd25bb2528e4c4f5c75491836c1035a85da370fc305258c996",
      "executed": false
    },
    {
      "name": "_closeCreationOverlays",
      "line": 3132,
      "sha256": "cee18604ef56d6c1c8c6c7fe7bc320f8ffede78dc2296793174699423a4ae1bc",
      "executed": false
    }
  ],
  "callers": [
    "loadCharacters",
    "_renderOnlineSlots",
    "_renderSlotList"
  ],
  "original": "function openVisualSelect(){\n  _visualReturnFocus=document.activeElement;\n  const pop=$('charVisualPop');pop.style.display='flex';\n  _spawnEmbers();\n  const grid=$('visualGrid');grid.replaceChildren();\n  CHAR_VISUALS.forEach((ch,ci)=>{\n    const ico=document.createElement('button');ico.type='button';ico.className='cs-ico';ico.setAttribute('data-vi',ci);\n    ico.title=_TL(ch.name);\n    const ring=document.createElement('div');ring.className='cs-ico-ring';\n    if(ch.emblemImg){const img=document.createElement('img');img.src=ch.emblemImg;img.alt='';ring.appendChild(img)}\n    const label=document.createElement('div');label.className='lbl';label.textContent=_TL(ch.tab||ch.name);\n    ico.replaceChildren(ring,label);\n    if(ch.comingSoon){ico.classList.add('locked');const badge=document.createElement('span');badge.className='cs-soon';badge.textContent=_TL('출시 준비 중');ico.appendChild(badge);ico.title+=' — '+_TL('출시 준비 중')}\n    ico.onclick=()=>selectVisual(ci);\n    grid.appendChild(ico);\n  });\n  selectVisual(_pendingVisualIdx||0);\n  _resetVisualInfoScroll();\n  const target=grid.querySelector('.cs-ico.sel')||$('visualCancelBtn');if(target)target.focus({preventScroll:true});\n}",
  "candidate": "function openVisualSelect(){\n  const pop=$('charVisualPop');\n  if(pop.style.display!=='flex')_visualReturnFocus=document.activeElement;\n  pop.style.display='flex';\n  _spawnEmbers();\n  const grid=$('visualGrid');grid.replaceChildren();\n  CHAR_VISUALS.forEach((ch,ci)=>{\n    const ico=document.createElement('button');ico.type='button';ico.className='cs-ico';ico.setAttribute('data-vi',ci);\n    ico.title=_TL(ch.name);\n    const ring=document.createElement('div');ring.className='cs-ico-ring';\n    if(ch.emblemImg){const img=document.createElement('img');img.src=ch.emblemImg;img.alt='';ring.appendChild(img)}\n    const label=document.createElement('div');label.className='lbl';label.textContent=_TL(ch.tab||ch.name);\n    ico.replaceChildren(ring,label);\n    if(ch.comingSoon){ico.classList.add('locked');const badge=document.createElement('span');badge.className='cs-soon';badge.textContent=_TL('출시 준비 중');ico.appendChild(badge);ico.title+=' — '+_TL('출시 준비 중')}\n    ico.onclick=()=>selectVisual(ci);\n    grid.appendChild(ico);\n  });\n  selectVisual(_pendingVisualIdx||0);\n  _resetVisualInfoScroll();\n  const target=grid.querySelector('.cs-ico.sel')||$('visualCancelBtn');if(target)target.focus({preventScroll:true});\n}",
  "before": {
    "mode": "source",
    "reentrant": true,
    "beforeSecond": {
      "owner": "external-owner",
      "active": "popup-internal",
      "pending": 1,
      "seq": 2,
      "icons": [
        {
          "selected": false,
          "pressed": "false"
        },
        {
          "selected": true,
          "pressed": "true"
        },
        {
          "selected": false,
          "pressed": "false"
        },
        {
          "selected": false,
          "pressed": "false"
        },
        {
          "selected": false,
          "pressed": "false"
        }
      ],
      "locked": true,
      "name": "실버테일",
      "media": [
        {
          "id": "csIdleVid",
          "src": "assets/charselect/idle_silvertail_4k.mp4?v=20260929-remaster",
          "poster": "assets/charselect/poster_idle_silvertail_4k.jpg?v=20260929-remaster",
          "paused": false,
          "rate": 1,
          "on": true
        },
        {
          "id": "csSceneVid",
          "src": "",
          "poster": "",
          "paused": true,
          "on": false
        }
      ]
    },
    "afterOpen": {
      "owner": "detached-old-icon",
      "active": "popup-internal",
      "pending": 1,
      "seq": 3,
      "icons": [
        {
          "selected": false,
          "pressed": "false"
        },
        {
          "selected": true,
          "pressed": "true"
        },
        {
          "selected": false,
          "pressed": "false"
        },
        {
          "selected": false,
          "pressed": "false"
        },
        {
          "selected": false,
          "pressed": "false"
        }
      ],
      "locked": true,
      "name": "실버테일",
      "media": [
        {
          "id": "csIdleVid",
          "src": "assets/charselect/idle_silvertail_4k.mp4?v=20260929-remaster",
          "poster": "assets/charselect/poster_idle_silvertail_4k.jpg?v=20260929-remaster",
          "paused": false,
          "rate": 1,
          "on": true
        },
        {
          "id": "csSceneVid",
          "src": "",
          "poster": "",
          "paused": true,
          "on": false
        }
      ]
    },
    "closed": {
      "active": "BODY",
      "returnCleared": true,
      "popupDisplay": "none",
      "seq": 4,
      "pending": 1,
      "timers": [],
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
          "src": "",
          "poster": ""
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
          "src": "",
          "poster": ""
        }
      ]
    },
    "selectionEqual": true,
    "cleanupTrace": [
      "clear:3",
      "pause:csIdleVid",
      "load:csIdleVid",
      "clear:undefined",
      "pause:csSceneVid",
      "load:csSceneVid"
    ],
    "trace": [
      "load:csIdleVid",
      "clear:undefined",
      "timer:1:5000",
      "play:csIdleVid",
      "pause:csSceneVid",
      "load:csIdleVid",
      "clear:1",
      "timer:2:5000",
      "play:csIdleVid",
      "pause:csSceneVid",
      "clear:2",
      "timer:3:5000",
      "play:csIdleVid",
      "pause:csSceneVid",
      "clear:3",
      "pause:csIdleVid",
      "load:csIdleVid",
      "clear:undefined",
      "pause:csSceneVid",
      "load:csSceneVid"
    ],
    "ownerPassed": false
  },
  "after": {
    "mode": "candidate",
    "reentrant": true,
    "beforeSecond": {
      "owner": "external-owner",
      "active": "popup-internal",
      "pending": 1,
      "seq": 2,
      "icons": [
        {
          "selected": false,
          "pressed": "false"
        },
        {
          "selected": true,
          "pressed": "true"
        },
        {
          "selected": false,
          "pressed": "false"
        },
        {
          "selected": false,
          "pressed": "false"
        },
        {
          "selected": false,
          "pressed": "false"
        }
      ],
      "locked": true,
      "name": "실버테일",
      "media": [
        {
          "id": "csIdleVid",
          "src": "assets/charselect/idle_silvertail_4k.mp4?v=20260929-remaster",
          "poster": "assets/charselect/poster_idle_silvertail_4k.jpg?v=20260929-remaster",
          "paused": false,
          "rate": 1,
          "on": true
        },
        {
          "id": "csSceneVid",
          "src": "",
          "poster": "",
          "paused": true,
          "on": false
        }
      ]
    },
    "afterOpen": {
      "owner": "external-owner",
      "active": "popup-internal",
      "pending": 1,
      "seq": 3,
      "icons": [
        {
          "selected": false,
          "pressed": "false"
        },
        {
          "selected": true,
          "pressed": "true"
        },
        {
          "selected": false,
          "pressed": "false"
        },
        {
          "selected": false,
          "pressed": "false"
        },
        {
          "selected": false,
          "pressed": "false"
        }
      ],
      "locked": true,
      "name": "실버테일",
      "media": [
        {
          "id": "csIdleVid",
          "src": "assets/charselect/idle_silvertail_4k.mp4?v=20260929-remaster",
          "poster": "assets/charselect/poster_idle_silvertail_4k.jpg?v=20260929-remaster",
          "paused": false,
          "rate": 1,
          "on": true
        },
        {
          "id": "csSceneVid",
          "src": "",
          "poster": "",
          "paused": true,
          "on": false
        }
      ]
    },
    "closed": {
      "active": "external-owner",
      "returnCleared": true,
      "popupDisplay": "none",
      "seq": 4,
      "pending": 1,
      "timers": [],
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
          "src": "",
          "poster": ""
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
          "src": "",
          "poster": ""
        }
      ]
    },
    "selectionEqual": true,
    "cleanupTrace": [
      "clear:3",
      "pause:csIdleVid",
      "load:csIdleVid",
      "clear:undefined",
      "pause:csSceneVid",
      "load:csSceneVid"
    ],
    "trace": [
      "load:csIdleVid",
      "clear:undefined",
      "timer:1:5000",
      "play:csIdleVid",
      "pause:csSceneVid",
      "load:csIdleVid",
      "clear:1",
      "timer:2:5000",
      "play:csIdleVid",
      "pause:csSceneVid",
      "clear:2",
      "timer:3:5000",
      "play:csIdleVid",
      "pause:csSceneVid",
      "clear:3",
      "pause:csIdleVid",
      "load:csIdleVid",
      "clear:undefined",
      "pause:csSceneVid",
      "load:csSceneVid"
    ],
    "ownerPassed": true
  },
  "normalBefore": {
    "mode": "source",
    "reentrant": false,
    "beforeSecond": {
      "owner": "external-owner",
      "active": "popup-internal",
      "pending": 1,
      "seq": 2,
      "icons": [
        {
          "selected": false,
          "pressed": "false"
        },
        {
          "selected": true,
          "pressed": "true"
        },
        {
          "selected": false,
          "pressed": "false"
        },
        {
          "selected": false,
          "pressed": "false"
        },
        {
          "selected": false,
          "pressed": "false"
        }
      ],
      "locked": true,
      "name": "실버테일",
      "media": [
        {
          "id": "csIdleVid",
          "src": "assets/charselect/idle_silvertail_4k.mp4?v=20260929-remaster",
          "poster": "assets/charselect/poster_idle_silvertail_4k.jpg?v=20260929-remaster",
          "paused": false,
          "rate": 1,
          "on": true
        },
        {
          "id": "csSceneVid",
          "src": "",
          "poster": "",
          "paused": true,
          "on": false
        }
      ]
    },
    "afterOpen": {
      "owner": "external-owner",
      "active": "popup-internal",
      "pending": 1,
      "seq": 2,
      "icons": [
        {
          "selected": false,
          "pressed": "false"
        },
        {
          "selected": true,
          "pressed": "true"
        },
        {
          "selected": false,
          "pressed": "false"
        },
        {
          "selected": false,
          "pressed": "false"
        },
        {
          "selected": false,
          "pressed": "false"
        }
      ],
      "locked": true,
      "name": "실버테일",
      "media": [
        {
          "id": "csIdleVid",
          "src": "assets/charselect/idle_silvertail_4k.mp4?v=20260929-remaster",
          "poster": "assets/charselect/poster_idle_silvertail_4k.jpg?v=20260929-remaster",
          "paused": false,
          "rate": 1,
          "on": true
        },
        {
          "id": "csSceneVid",
          "src": "",
          "poster": "",
          "paused": true,
          "on": false
        }
      ]
    },
    "closed": {
      "active": "external-owner",
      "returnCleared": true,
      "popupDisplay": "none",
      "seq": 3,
      "pending": 1,
      "timers": [],
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
          "src": "",
          "poster": ""
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
          "src": "",
          "poster": ""
        }
      ]
    },
    "selectionEqual": true,
    "cleanupTrace": [
      "clear:2",
      "pause:csIdleVid",
      "load:csIdleVid",
      "clear:undefined",
      "pause:csSceneVid",
      "load:csSceneVid"
    ],
    "trace": [
      "load:csIdleVid",
      "clear:undefined",
      "timer:1:5000",
      "play:csIdleVid",
      "pause:csSceneVid",
      "load:csIdleVid",
      "clear:1",
      "timer:2:5000",
      "play:csIdleVid",
      "pause:csSceneVid",
      "clear:2",
      "pause:csIdleVid",
      "load:csIdleVid",
      "clear:undefined",
      "pause:csSceneVid",
      "load:csSceneVid"
    ],
    "ownerPassed": true
  },
  "normalAfter": {
    "mode": "candidate",
    "reentrant": false,
    "beforeSecond": {
      "owner": "external-owner",
      "active": "popup-internal",
      "pending": 1,
      "seq": 2,
      "icons": [
        {
          "selected": false,
          "pressed": "false"
        },
        {
          "selected": true,
          "pressed": "true"
        },
        {
          "selected": false,
          "pressed": "false"
        },
        {
          "selected": false,
          "pressed": "false"
        },
        {
          "selected": false,
          "pressed": "false"
        }
      ],
      "locked": true,
      "name": "실버테일",
      "media": [
        {
          "id": "csIdleVid",
          "src": "assets/charselect/idle_silvertail_4k.mp4?v=20260929-remaster",
          "poster": "assets/charselect/poster_idle_silvertail_4k.jpg?v=20260929-remaster",
          "paused": false,
          "rate": 1,
          "on": true
        },
        {
          "id": "csSceneVid",
          "src": "",
          "poster": "",
          "paused": true,
          "on": false
        }
      ]
    },
    "afterOpen": {
      "owner": "external-owner",
      "active": "popup-internal",
      "pending": 1,
      "seq": 2,
      "icons": [
        {
          "selected": false,
          "pressed": "false"
        },
        {
          "selected": true,
          "pressed": "true"
        },
        {
          "selected": false,
          "pressed": "false"
        },
        {
          "selected": false,
          "pressed": "false"
        },
        {
          "selected": false,
          "pressed": "false"
        }
      ],
      "locked": true,
      "name": "실버테일",
      "media": [
        {
          "id": "csIdleVid",
          "src": "assets/charselect/idle_silvertail_4k.mp4?v=20260929-remaster",
          "poster": "assets/charselect/poster_idle_silvertail_4k.jpg?v=20260929-remaster",
          "paused": false,
          "rate": 1,
          "on": true
        },
        {
          "id": "csSceneVid",
          "src": "",
          "poster": "",
          "paused": true,
          "on": false
        }
      ]
    },
    "closed": {
      "active": "external-owner",
      "returnCleared": true,
      "popupDisplay": "none",
      "seq": 3,
      "pending": 1,
      "timers": [],
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
          "src": "",
          "poster": ""
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
          "src": "",
          "poster": ""
        }
      ]
    },
    "selectionEqual": true,
    "cleanupTrace": [
      "clear:2",
      "pause:csIdleVid",
      "load:csIdleVid",
      "clear:undefined",
      "pause:csSceneVid",
      "load:csSceneVid"
    ],
    "trace": [
      "load:csIdleVid",
      "clear:undefined",
      "timer:1:5000",
      "play:csIdleVid",
      "pause:csSceneVid",
      "load:csIdleVid",
      "clear:1",
      "timer:2:5000",
      "play:csIdleVid",
      "pause:csSceneVid",
      "clear:2",
      "pause:csIdleVid",
      "load:csIdleVid",
      "clear:undefined",
      "pause:csSceneVid",
      "load:csSceneVid"
    ],
    "ownerPassed": true
  },
  "productionApplied": false,
  "runtimeAccepted": false,
  "HEAD": "UNKNOWN",
  "Changes": "UNKNOWN",
  "receipt": {
    "node": "/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node",
    "command": "tools/team-followup-20261002/supervisor-next/UIUX/UIUX-reentrant-visual-popup-owner-hb1014b/checks.mjs",
    "attempts": 2,
    "finalExit": 0,
    "failures": [
      {
        "observationUTC": "2026-10-02 11:04:17 UTC",
        "exit": 1,
        "output": "node:internal/modules/run_main:107\n    triggerUncaughtException(\n    ^\n\nAssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:\n+ actual - expected\n... Skipped lines\n\n  [\n    {\n      pressed: 'false',\n      selected: false\n    },\n...\n    },\n+   {\n+     pressed: 'false',\n+     selected: false\n+   },\n+   {\n+     pressed: 'false',\n+     selected: false\n+   },\n+   {\n+     pressed: 'false',\n+     selected: false\n+   }\n  ]\n\n    at run (file:///Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/UIUX/UIUX-reentrant-visual-popup-owner-hb1014b/checks.mjs:50:71)\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/UIUX/UIUX-reentrant-visual-popup-owner-hb1014b/checks.mjs:60:14\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\n    at async node:internal/modules/esm/loader:639:26\n    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5) {\n  generatedMessage: true,\n  code: 'ERR_ASSERTION',\n  actual: [\n    { selected: false, pressed: 'false' },\n    { selected: true, pressed: 'true' },\n    { selected: false, pressed: 'false' },\n    { selected: false, pressed: 'false' },\n    { selected: false, pressed: 'false' }\n  ],\n  expected: [\n    { selected: false, pressed: 'false' },\n    { selected: true, pressed: 'true' }\n  ],\n  operator: 'deepStrictEqual',\n  diff: 'simple'\n}\n\nNode.js v24.15.0\n",
        "reason": "현행 CHAR_VISUALS 5개를 읽었으나 하니스 선택 기대 배열을 2개로 고정한 검증 오류. 최초 실행 시작/종료 UTC는 미계측; 관측 UTC 별도."
      }
    ],
    "reportGenerationFailure": {
      "error": "TypeError: Cannot read properties of null (reading '3')",
      "reason": "CRLF 문서의 검색 행 끝 CR 때문에 정본 행 파싱 실패. trimEnd 후 재작성; 이 실패 시 파일 작성0.",
      "observationUTC": "2026-10-02 11:06:12 UTC"
    },
    "historicalParentProvided": "d5c1b62d",
    "historicalParentIsCurrentHEAD": false,
    "docsSearchCount": 1
  },
  "docs": {
    "startedUTC": "2026-10-02T11:04:28.084Z",
    "endedUTC": "2026-10-02T11:04:28.108Z",
    "command": [
      "rg",
      "-n",
      "-e",
      "openVisualSelect|_visualReturnFocus|_closeVisualSelect|_visualPreviewSeq|반환초점|초점 복귀",
      "docs/"
    ],
    "exit": 0,
    "error": null,
    "stderr": "",
    "matchingLines": 189,
    "files": [
      "docs/15 세이브+데이터구조/15 세이브+데이터구조.md",
      "docs/CHANGELOG_DAILY_20260520.md",
      "docs/CHANGELOG_SYNC.md",
      "docs/3.3 키바인딩+설정/게임패드_트러블슈팅.md",
      "docs/1전체그래픽세팅/CHARSELECT_VIDEO_QUALITY_20260913.md",
      "docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md",
      "docs/3.1 ui hud 디자인/UI_UX_IMPROVEMENT_PROJECT_20260930.md",
      "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md",
      "docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md",
      "docs/3.1 ui hud 디자인/GEM_ATELIER_20260927.md",
      "docs/3.1 ui hud 디자인/lobby_full_patch.md",
      "docs/3.1 ui hud 디자인/남전사_로비_아이들_모션_20260908.md",
      "docs/archetypes/silvertail/SILVERTAIL_KEYART_CANON_20260927.md",
      "docs/6사운드디자인/6사운드디자인.md",
      "docs/2_7 인벤토리+장비시스템/INVENTORY_KEYBOARD_FOCUS_20261002.md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_STATE.json",
      "docs/16번역·로컬라이제이션/LOCALIZATION_RUNTIME_20260909.md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/FOUR-SUBMISSIONS-HELLRAY-20261002.md"
    ],
    "stdoutSHA256": "8b2451706e08e8b9cd301affbac9884b072182c4a1456fa0a3861b9a3e60e764",
    "canonicalLines": [
      "docs/15 세이브+데이터구조/15 세이브+데이터구조.md:668:| _visualReturnFocus | 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |",
      "docs/15 세이브+데이터구조/15 세이브+데이터구조.md:709:| 초기 초점 | 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 |",
      "docs/CHANGELOG_SYNC.md:51067:| _visualReturnFocus | 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |",
      "docs/CHANGELOG_SYNC.md:51109:| 초기 초점 | 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 |",
      "docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md:464:| _visualReturnFocus | 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |",
      "docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md:497:| 초기 초점 | 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 |",
      "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md:2302:| _visualReturnFocus | 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |",
      "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md:2335:| 초기 초점 | 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 |",
      "docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md:619:| _visualReturnFocus | 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |\r",
      "docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md:653:| 초기 초점 | 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 |\r",
      "docs/3.1 ui hud 디자인/lobby_full_patch.md:1008:| _visualReturnFocus | 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |",
      "docs/3.1 ui hud 디자인/lobby_full_patch.md:1041:| 초기 초점 | 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 |"
    ],
    "sourceFinalSHA256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8",
    "ownedDirectory": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/UIUX/UIUX-reentrant-visual-popup-owner-hb1014b",
    "ownedFiles": [
      "TASK.md",
      "checks.mjs"
    ]
  },
  "canonicalProposals": [
    {
      "path": "docs/15 세이브+데이터구조/15 세이브+데이터구조.md",
      "line": 668,
      "old": "| _visualReturnFocus | 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |",
      "new": "| _visualReturnFocus | 초기null. openVisualSelect 진입 시 #charVisualPop.style.display가 flex가 아닌 경우에만 기존 document.activeElement를 캡처. 이미 열린 flex 상태의 재호출은 최초 외부 반환 대상을 덮어쓰지 않으며 기존 아이콘 재생성·현재 선택 미리보기·내부 초기 초점 처리는 유지. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |"
    },
    {
      "path": "docs/15 세이브+데이터구조/15 세이브+데이터구조.md",
      "line": 709,
      "old": "| 초기 초점 | 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 |",
      "new": "| 초기 초점 | 숨김→열림에서만 원래 activeElement를 _visualReturnFocus로 보존하고 열린 상태 재호출은 기존 반환 owner를 유지한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 |"
    },
    {
      "path": "docs/CHANGELOG_SYNC.md",
      "line": 51067,
      "old": "| _visualReturnFocus | 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |",
      "new": "| _visualReturnFocus | 초기null. openVisualSelect 진입 시 #charVisualPop.style.display가 flex가 아닌 경우에만 기존 document.activeElement를 캡처. 이미 열린 flex 상태의 재호출은 최초 외부 반환 대상을 덮어쓰지 않으며 기존 아이콘 재생성·현재 선택 미리보기·내부 초기 초점 처리는 유지. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |"
    },
    {
      "path": "docs/CHANGELOG_SYNC.md",
      "line": 51109,
      "old": "| 초기 초점 | 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 |",
      "new": "| 초기 초점 | 숨김→열림에서만 원래 activeElement를 _visualReturnFocus로 보존하고 열린 상태 재호출은 기존 반환 owner를 유지한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 |"
    },
    {
      "path": "docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md",
      "line": 464,
      "old": "| _visualReturnFocus | 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |",
      "new": "| _visualReturnFocus | 초기null. openVisualSelect 진입 시 #charVisualPop.style.display가 flex가 아닌 경우에만 기존 document.activeElement를 캡처. 이미 열린 flex 상태의 재호출은 최초 외부 반환 대상을 덮어쓰지 않으며 기존 아이콘 재생성·현재 선택 미리보기·내부 초기 초점 처리는 유지. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |"
    },
    {
      "path": "docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md",
      "line": 497,
      "old": "| 초기 초점 | 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 |",
      "new": "| 초기 초점 | 숨김→열림에서만 원래 activeElement를 _visualReturnFocus로 보존하고 열린 상태 재호출은 기존 반환 owner를 유지한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 |"
    },
    {
      "path": "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md",
      "line": 2302,
      "old": "| _visualReturnFocus | 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |",
      "new": "| _visualReturnFocus | 초기null. openVisualSelect 진입 시 #charVisualPop.style.display가 flex가 아닌 경우에만 기존 document.activeElement를 캡처. 이미 열린 flex 상태의 재호출은 최초 외부 반환 대상을 덮어쓰지 않으며 기존 아이콘 재생성·현재 선택 미리보기·내부 초기 초점 처리는 유지. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |"
    },
    {
      "path": "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md",
      "line": 2335,
      "old": "| 초기 초점 | 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 |",
      "new": "| 초기 초점 | 숨김→열림에서만 원래 activeElement를 _visualReturnFocus로 보존하고 열린 상태 재호출은 기존 반환 owner를 유지한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 |"
    },
    {
      "path": "docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md",
      "line": 619,
      "old": "| _visualReturnFocus | 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |",
      "new": "| _visualReturnFocus | 초기null. openVisualSelect 진입 시 #charVisualPop.style.display가 flex가 아닌 경우에만 기존 document.activeElement를 캡처. 이미 열린 flex 상태의 재호출은 최초 외부 반환 대상을 덮어쓰지 않으며 기존 아이콘 재생성·현재 선택 미리보기·내부 초기 초점 처리는 유지. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |"
    },
    {
      "path": "docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md",
      "line": 653,
      "old": "| 초기 초점 | 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 |",
      "new": "| 초기 초점 | 숨김→열림에서만 원래 activeElement를 _visualReturnFocus로 보존하고 열린 상태 재호출은 기존 반환 owner를 유지한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 |"
    },
    {
      "path": "docs/3.1 ui hud 디자인/lobby_full_patch.md",
      "line": 1008,
      "old": "| _visualReturnFocus | 초기null. openVisualSelect에서 기존 document.activeElement 캡처. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |",
      "new": "| _visualReturnFocus | 초기null. openVisualSelect 진입 시 #charVisualPop.style.display가 flex가 아닌 경우에만 기존 document.activeElement를 캡처. 이미 열린 flex 상태의 재호출은 최초 외부 반환 대상을 덮어쓰지 않으며 기존 아이콘 재생성·현재 선택 미리보기·내부 초기 초점 처리는 유지. 닫을 때 참조를 null로 해제. visualCancelBtn은 restoreFocus:true로 연결된 실행 컨트롤에 focus({preventScroll:true}); 이름 확정·화면 전환은 이전 로비 초점 복원하지 않음 |"
    },
    {
      "path": "docs/3.1 ui hud 디자인/lobby_full_patch.md",
      "line": 1041,
      "old": "| 초기 초점 | 원래 activeElement를 _visualReturnFocus로 보존한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 |",
      "new": "| 초기 초점 | 숨김→열림에서만 원래 activeElement를 _visualReturnFocus로 보존하고 열린 상태 재호출은 기존 반환 owner를 유지한 뒤 선택된 .cs-ico.sel에 focus(preventScroll:true). 해당 버튼이 없으면 취소 버튼. 일반 취소는 기존 공용 닫기와 연결된 실행 컨트롤 초점 복귀 |"
    }
  ]
}
```
