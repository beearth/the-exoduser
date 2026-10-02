# CH1-1 UIUX — 패널 탐색 전환·닫기 초점 연결 후보

이번 소유는 checks.mjs/result.md 두 파일. 생산·shared docs·타 WIP·이전 산출·사용자 세이브·Git 변경/조회0. productionApplied=false / runtimeAccepted=false. 연결 후보를 제출하며 CH1-1 playable 완료로 보고하지 않는다.

실제 _injectPanelNav는 DIV.panel-nav-tab을 만들고 onclick으로 openPanel(t.id)을 호출한다. DIV는 tabIndex/네이티브 활성화가 없어 일반 키보드 순차 탐색 대상이 아니다. openPanel은 _injectPanelNav로 모든 패널 nav를 재생성한다. 인벤토리에서 스킬 탭으로 전환하는 새 경계에서 기존 탭 노드는 분리되며 초점을 새 활성 탭에 연결해야 한다. 버튼 접근을 연결한 뒤 _panelBack의 실제 닫기 branch6까지 실행했더니 새 활성 탭 초점을 해제할 접점이 필요했다. 후보는 닫기 후 해당 닫힌 패널 안에 그대로 남은 activeElement만 blur한다. 새 외부 fallback/HUD 강제 초점 정책은 없다.

| 최종 연결 검수 | 본편 | easy |
|---|---|---|
| 원본 keyboard sequential 자격·전환 기대 | RED: DIV 대상 아님 | RED |
| 후보 BUTTON type=button 및 실제 onclick→openPanel | GREEN: 새 활성 skill 탭 | GREEN |
| 포인터 정상 direct onclick 대조 | 원본/후보 렌더 trace 동일 PASS | 동일 PASS |
| 후보 _panelBack 닫기 | skill/inv on=false, paused=false, BODY 초점, 숨은 skill 초점0 | 동일 |
| close guard 제거 음성대조 | hiddenSkillFocus=true 검출, 기대 실패 exit1 | 첫 본편 실패로 실행 중단; easy 음성검사 미실행 |

최종8case(양판×source/candidate×keyboard/pointer), sourcekeyboard2RED→candidate2GREEN, 포인터4PASS. 닫기 보완 후 새 의미회귀가 필요해 연결8case를 실행했다. 초기 전환-only8case는 중간 근거이며 최종8에 합산하지 않는다. close guard 음성검사는 보완이 없으면 숨은 초점이 남는지 보는 별도 필요한1실행이다. 이미 인수된 plus/minus guards, 이전 로비Tab/재진입owner/disabled·hidden12조건 검사 반복0.

최소 source patch(양판 동일 anchor, 인계용이며 생산 미반영):

```diff
-      const btn=document.createElement('div');btn.className='panel-nav-tab'+(t.id===activeId?' active':'');
+      const btn=document.createElement('button');btn.type='button';btn.className='panel-nav-tab'+(t.id===activeId?' active':'');
-      btn.onclick=function(e){e.stopPropagation();if(t.id!==activeId)openPanel(t.id)};
+      btn.onclick=function(e){e.stopPropagation();if(t.id!==activeId){const focused=document.activeElement===btn;openPanel(t.id);const current=$(t.id)?.querySelector('.panel-nav-tab.active');if(focused&&current)current.focus({preventScroll:true});}};
-  if(op){closeAllPanels();return true}
+  if(op){const active=document.activeElement;closeAllPanels();if($(op).contains(active)&&document.activeElement===active)active.blur();return true}
```

핵심 수치/효과/소비/저장/스킬 학습·환불 변경0. 네이티브 버튼 type=button으로 form submit을 새로 추가하지 않는다. 기존 label/key/_PANEL_TABS5개·class·openPanel 경로 유지. 초점 보완은 전환 전에 해당 old tab이 active였을 때만 실행. _panelBack은 기존1~5 서브상태 우선처리와6 닫기 판정 유지; 본 후보 fixture는6만 도달했다.

## 인수 범위와 남은 실제 입력 접점

실행한 실제 함수: full _inventoryFocus factory(이번에는 begin/close만), full _injectPanelNav/openPanel/closeAllPanels/_panelBack와 생성된 onclick. _PANEL_TABS는 실제 선언이다. DOM node-dom+복합 class selector, 순차 focus 자격 판정/키보드 활성화, renderInv/renderSkillPanel 및 다른 renderer sink, G/BGM, outline query 빈 결과는 명시 대역이다. pointer는 네이티브 버튼 autofocus를 모델링하지 않고 동일 HUD active 상태에서 source onclick을 직접 호출했다. native DOM 키보드 dispatch/실제 입력/전체 render·아이템·SP·저장·오디오·GPU/시각/패드는 검수하지 않았다.

저장 전 추가 source caller 읽기에서 전역 keydown(game.html:12725)의 네이티브 조작 예외가 invPanel/settings/crBagPop에 한정됨을 발견했다. skillPanel 새 nav button의 Tab/Space는 뒤의 preventDefault 목록에 들어간다. 이 전역 handler는 이번8case에서 실행하지 않았다. 따라서 위 patch만으로 실제 HUD→인벤토리→스킬→키보드복귀 전체가 완료됐다고 주장하지 않는다. **후보 채택 전 전역 입력 예외의 panel-nav 한정 연결을 별도 source 검수해야 한다.** 이 다음 독립 경계는 메모리에서 이어가며 이번 파일 예산을 늘리지 않는다. 실제 native/CSS 기본 버튼 appearance·focus 표시·스크롤은 QA 실입력 Gate다.

## 실패·시각·보존

최초 하니스 exit1은 classic script도 module로 파싱해 합법 중복 함수 _addHeadGib를 거절한 오류다. 실제 script type에 맞춰 script/module을 나누고 importmap은 파싱 대상에서 제외한 뒤 전환 검수 exit0. 실패 원문/관측 UTC를 evidence에 보존했고 제품 구문 오류로 선언하지 않는다. 최종 연결8case의 실제 시작/종료 UTC는 아래 JSON. negative는 의도된 guard 제거 반례 exit1이며 예상한 검출이다. 첫 실패/negative 실행 시작·종료UTC는 미계측, 관측 시각을 실행 시각으로 치환하지 않는다.

실행 당시 파일 용량 hold로 memory/stdin으로 수행했다. 새epoch capacity-after-6a39b828-1212/allowNewOwnedFiles=true를 실제 읽고 이번2파일만 저장했다. 감독 STATE의 Changes60/checkpoint6a39b828은 제공된 상태이며 개인 Git 확인0. 저장 checks는 성공 stdin 하니스에 주석2줄·DOM helper import 경로만 맞춘 보존본이고 다시 실행하지 않았다. 저장 receipt의 SHA와 현재 owned anchor 감사는 아래에 있다.

실제 도구는 functions.exec/exec_command/apply_patch, Node fs/vm/acorn/crypto, rg, 정책 read용 python3. 스킬/새세션·하위에이전트/UI·서버·실게임·빌드·설치·생성/업로드/게시 호출0. 목표 최초 SHA 검증 성공, root 공유 목표 문서는 저장 시 SHA가 달라 최초/현재를 분리 기록했다.

재현 안내(저장본 실제 실행 미수행):

```sh
cd /Users/fordeargamers/Projects/exoduser-migration-20261001
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node tools/team-followup-20261002/supervisor-next/UIUX/UIUX-milestone-panel-nav-return-capacity1212/checks.mjs
```

## docs root 인계

새 후보 코드 작성 후 docs 전체 관련 rg 정확1회, exit0, 9파일/16행, stdout SHA 6497b70a30b8880a062f09e4b5de6b250e67946d5a85880ce8ad950d346c9821. 공유 docs 쓰기0. 아래 canonical의 기존 계약은 보존하고 후보 채택/후속 입력 예외 인수 시 새 좁은 계약을 추가한다.

| 정본 / id | exact old 또는 현행 | new 인계 |
|---|---|---|
| INVENTORY_KEYBOARD_FOCUS_20261002.md:15 열기/닫기 | openPanel/togglePanel에서 invPanel 열기 전 외부 opener 포착. 중간 closeAllPanels는 opener 보존, 실제 closePanel/closeAllPanels는 연결·가시 opener로 복귀. 삭제/숨김 opener는 focus하지 않고 필요 시 내부 잔류 blur | 기존 행 유지. 새 절: panel nav button 전환 후 생성된 새 활성 tab 초점 연결. _panelBack 실제 닫기 후 닫힌 패널 내부 active가 같으면 blur. 이 blur는 opener 새 선택 정책이 아님. |
| UI_COMPOSITION_20260925.md:2691 | invPanel 열기 전에 외부 opener 보존, 열기 동안 중간 close에서 복귀 상태 보존, 실제 닫기 후 연결·가시 opener 복귀. 다른 패널의 기존 동작 유지 | 인벤토리 현행 계약 유지. _injectPanelNav/branch6의 새 후보 계약 별도 추가; 전역 keydown 미인수/native 미검수 명시. |
| _injectPanelNav 별도 키보드 계약 | docs 전체 검색에 해당 심볼 계약 없음 | 네이티브 button type=button, 현재 _PANEL_TABS5, focused old tab→openPanel→새 .panel-nav-tab.active 복귀. 실제 tab 순서/네이티브 활성화 인수 후 구현완료 상태 갱신. |
| _panelBack branch6 | if(op){closeAllPanels();return true} | 위 source patch 그대로, active 캡처·닫힌 panel contains 및 동일active에만 blur. 내부/외부 다른초점은 강탈0. |
| 3.3 키바인딩:209/245 | 닫기→closeAllPanels→_skExpandedId=null | 원문·서브상태 우선순위 유지. 닫힌 panel 초점 해제만 별도 보충. |
| 전역 keydown 예외 | invPanel/settings/crBagPop만 native 활성화/Tab 예외 | 후속 실제 handler 대조를 통과한 뒤 panel-nav 연결 여부를 새 source/doc 계약으로 인수. 아직 임의 완료 표기0. |
| UI-04/CH1-1 인수 | 부분 완료 / 실제플레이 미인수 | 후보 source 대역 인수와 실제 HUD·키보드/패드 시연 인수를 분리. playable 완료/AAA·시각·청취PASS0. |

보호2_3·blackBean Q-only magic·attack ticket 금지·LOCK/TBD·맵/밸런스/저장 수치 보존. 맵 작업을 하지 않았다. 원총괄은 source/doc/Git 소유이며 QA 실제 입력과 ITEM/SKILL 현재 데이터가 전체 목표 의존성이다.

```json
{
  "sourceExecution": {
    "startedUTC": "2026-10-02T12:08:04.932Z",
    "endedUTC": "2026-10-02T12:08:05.261Z",
    "task": "UIUX-milestone-inventory-skill-nav-memory",
    "results": [
      {
        "file": "game.html",
        "sourceSHA256": "391155f3700e584cebf260942a95cfd4f4bbcc2cd6d700c6db65084ab7ad35d2",
        "fragments": [
          {
            "name": "_injectPanelNav",
            "sha256": "7e49b2b2a4dfb789fc11795f458a7f0a267265b7a1eb4cb40722db4cf7cedce6"
          },
          {
            "name": "openPanel",
            "sha256": "29bdd418f6a59a84cbaac3ad31ee739fe436a9a1070420382a59ba1b2d6cf963"
          },
          {
            "name": "closeAllPanels",
            "sha256": "02a29397a0c9d87c37b4a8ac8c7f3339fe0f665529a7e0a99e427b1a04384b9d"
          }
        ],
        "factorySHA256": "748370faf47f058d11b6f5ba7ff2df2e530a9eb06614430d6f406342351eb106",
        "tabsSHA256": "abe5cf9c35a12d3b688501e2eba66bb1e143b76c3c818d491ba99e60e08a74de",
        "original": "function _injectPanelNav(activeId){\n  _PANEL_TABS.forEach(function(tab){\n    const panel=$(tab.id);if(!panel)return;\n    const pbox=panel.querySelector('.pbox');if(!pbox)return;\n    // 기존 nav 제거\n    const old=pbox.querySelector('.panel-nav');if(old)old.remove();\n    // nav 생성\n    const nav=document.createElement('div');nav.className='panel-nav';\n    _PANEL_TABS.forEach(function(t){\n      const btn=document.createElement('div');btn.className='panel-nav-tab'+(t.id===activeId?' active':'');\n      btn.dataset.label=t.label;btn.dataset.key=t.key||'';\n      const lbl=typeof _T==='function'?_T(t.label):t.label;\n      btn.textContent=lbl+(t.key?' ['+t.key+']':'');\n      btn.onclick=function(e){e.stopPropagation();if(t.id!==activeId)openPanel(t.id)};\n      nav.appendChild(btn);\n    });\n    // pbox 최상단에 삽입\n    pbox.insertBefore(nav,pbox.firstChild);\n  });\n}",
        "candidate": "function _injectPanelNav(activeId){\n  _PANEL_TABS.forEach(function(tab){\n    const panel=$(tab.id);if(!panel)return;\n    const pbox=panel.querySelector('.pbox');if(!pbox)return;\n    // 기존 nav 제거\n    const old=pbox.querySelector('.panel-nav');if(old)old.remove();\n    // nav 생성\n    const nav=document.createElement('div');nav.className='panel-nav';\n    _PANEL_TABS.forEach(function(t){\n      const btn=document.createElement('button');btn.type='button';btn.className='panel-nav-tab'+(t.id===activeId?' active':'');\n      btn.dataset.label=t.label;btn.dataset.key=t.key||'';\n      const lbl=typeof _T==='function'?_T(t.label):t.label;\n      btn.textContent=lbl+(t.key?' ['+t.key+']':'');\n      btn.onclick=function(e){e.stopPropagation();if(t.id!==activeId){const focused=document.activeElement===btn;openPanel(t.id);const current=$(t.id)?.querySelector('.panel-nav-tab.active');if(focused&&current)current.focus({preventScroll:true});}};\n      nav.appendChild(btn);\n    });\n    // pbox 최상단에 삽입\n    pbox.insertBefore(nav,pbox.firstChild);\n  });\n}",
        "backOld": "function _panelBack(){\n  // 1. gcModal (확인 팝업)\n  const gc=$('gcModal');if(gc&&gc.classList.contains('on')){const cb=$('gcCancel');if(cb)cb.click();return true}\n  // 2. crBagPop (결정 주머니)\n  const cr=$('crBagPop');if(cr&&cr.style.display==='flex'){closeCrystalPicker();return true}\n  // 3. skSlotPop (스킬 슬롯 팝업)\n  const sp=$('skSlotPop');if(sp&&sp.style.display==='flex'){_closeSkPop();return true}\n  // 4. 스킬 카드 펼침 → 접기\n  if(_skExpandedId){_skExpandedId=null;renderSkillPanel();return true}\n  // 5. 합체 선택 중 → 취소\n  if(_fuseSelId){_fuseSelId=null;renderSkillPanel();return true}\n  // Character growth summary is a nested view: Back closes it first.\n  const gs=$('growthSummaryDrawer');if($('statPanel').classList.contains('on')&&gs&&!gs.hidden){toggleStatSummary();return true}\n  // 6. 열린 패널 닫기\n  const op=['invPanel','forge','statPanel','skillPanel'].find(id=>$(id)&&$(id).classList.contains('on'));\n  if(op){closeAllPanels();return true}\n  // 7. 설정 패널\n  if($('settings')&&$('settings').classList.contains('on')){closePanel('settings');return true}\n  return false\n}",
        "backCandidate": "function _panelBack(){\n  // 1. gcModal (확인 팝업)\n  const gc=$('gcModal');if(gc&&gc.classList.contains('on')){const cb=$('gcCancel');if(cb)cb.click();return true}\n  // 2. crBagPop (결정 주머니)\n  const cr=$('crBagPop');if(cr&&cr.style.display==='flex'){closeCrystalPicker();return true}\n  // 3. skSlotPop (스킬 슬롯 팝업)\n  const sp=$('skSlotPop');if(sp&&sp.style.display==='flex'){_closeSkPop();return true}\n  // 4. 스킬 카드 펼침 → 접기\n  if(_skExpandedId){_skExpandedId=null;renderSkillPanel();return true}\n  // 5. 합체 선택 중 → 취소\n  if(_fuseSelId){_fuseSelId=null;renderSkillPanel();return true}\n  // Character growth summary is a nested view: Back closes it first.\n  const gs=$('growthSummaryDrawer');if($('statPanel').classList.contains('on')&&gs&&!gs.hidden){toggleStatSummary();return true}\n  // 6. 열린 패널 닫기\n  const op=['invPanel','forge','statPanel','skillPanel'].find(id=>$(id)&&$(id).classList.contains('on'));\n  if(op){const active=document.activeElement;closeAllPanels();if($(op).contains(active)&&document.activeElement===active)active.blur();return true}\n  // 7. 설정 패널\n  if($('settings')&&$('settings').classList.contains('on')){closePanel('settings');return true}\n  return false\n}",
        "before": {
          "mode": "source",
          "keyboard": true,
          "tabTag": "DIV",
          "sequentialEligible": false,
          "hadKeyboardFocus": false,
          "oldTabConnected": true,
          "invOpen": true,
          "skillOpen": false,
          "paused": true,
          "active": "HUD",
          "trace": [
            "renderInv"
          ],
          "passed": false,
          "return": {
            "handled": true,
            "paused": false,
            "skillOpen": false,
            "invOpen": false,
            "active": "HUD",
            "hiddenSkillFocus": false
          }
        },
        "after": {
          "mode": "candidate",
          "keyboard": true,
          "tabTag": "BUTTON",
          "sequentialEligible": true,
          "hadKeyboardFocus": true,
          "oldTabConnected": false,
          "invOpen": false,
          "skillOpen": true,
          "paused": true,
          "active": "new-active-skill-tab",
          "trace": [
            "renderInv",
            "stop",
            "renderSkillPanel"
          ],
          "passed": true,
          "return": {
            "handled": true,
            "paused": false,
            "skillOpen": false,
            "invOpen": false,
            "active": "BODY",
            "hiddenSkillFocus": false
          }
        },
        "pointerBefore": {
          "mode": "source",
          "keyboard": false,
          "tabTag": "DIV",
          "sequentialEligible": false,
          "hadKeyboardFocus": false,
          "oldTabConnected": false,
          "invOpen": false,
          "skillOpen": true,
          "paused": true,
          "active": "HUD",
          "trace": [
            "renderInv",
            "stop",
            "renderSkillPanel"
          ],
          "passed": true,
          "return": {
            "handled": true,
            "paused": false,
            "skillOpen": false,
            "invOpen": false,
            "active": "HUD",
            "hiddenSkillFocus": false
          }
        },
        "pointerAfter": {
          "mode": "candidate",
          "keyboard": false,
          "tabTag": "BUTTON",
          "sequentialEligible": true,
          "hadKeyboardFocus": false,
          "oldTabConnected": false,
          "invOpen": false,
          "skillOpen": true,
          "paused": true,
          "active": "HUD",
          "trace": [
            "renderInv",
            "stop",
            "renderSkillPanel"
          ],
          "passed": true,
          "return": {
            "handled": true,
            "paused": false,
            "skillOpen": false,
            "invOpen": false,
            "active": "HUD",
            "hiddenSkillFocus": false
          }
        }
      },
      {
        "file": "game-easy-test.html",
        "sourceSHA256": "21a4d3b73b6ddcf765ec1e4a9505329c9f28248828f95b5cbc8993f005f52c0a",
        "fragments": [
          {
            "name": "_injectPanelNav",
            "sha256": "7e49b2b2a4dfb789fc11795f458a7f0a267265b7a1eb4cb40722db4cf7cedce6"
          },
          {
            "name": "openPanel",
            "sha256": "29bdd418f6a59a84cbaac3ad31ee739fe436a9a1070420382a59ba1b2d6cf963"
          },
          {
            "name": "closeAllPanels",
            "sha256": "02a29397a0c9d87c37b4a8ac8c7f3339fe0f665529a7e0a99e427b1a04384b9d"
          }
        ],
        "factorySHA256": "748370faf47f058d11b6f5ba7ff2df2e530a9eb06614430d6f406342351eb106",
        "tabsSHA256": "abe5cf9c35a12d3b688501e2eba66bb1e143b76c3c818d491ba99e60e08a74de",
        "original": "function _injectPanelNav(activeId){\n  _PANEL_TABS.forEach(function(tab){\n    const panel=$(tab.id);if(!panel)return;\n    const pbox=panel.querySelector('.pbox');if(!pbox)return;\n    // 기존 nav 제거\n    const old=pbox.querySelector('.panel-nav');if(old)old.remove();\n    // nav 생성\n    const nav=document.createElement('div');nav.className='panel-nav';\n    _PANEL_TABS.forEach(function(t){\n      const btn=document.createElement('div');btn.className='panel-nav-tab'+(t.id===activeId?' active':'');\n      btn.dataset.label=t.label;btn.dataset.key=t.key||'';\n      const lbl=typeof _T==='function'?_T(t.label):t.label;\n      btn.textContent=lbl+(t.key?' ['+t.key+']':'');\n      btn.onclick=function(e){e.stopPropagation();if(t.id!==activeId)openPanel(t.id)};\n      nav.appendChild(btn);\n    });\n    // pbox 최상단에 삽입\n    pbox.insertBefore(nav,pbox.firstChild);\n  });\n}",
        "candidate": "function _injectPanelNav(activeId){\n  _PANEL_TABS.forEach(function(tab){\n    const panel=$(tab.id);if(!panel)return;\n    const pbox=panel.querySelector('.pbox');if(!pbox)return;\n    // 기존 nav 제거\n    const old=pbox.querySelector('.panel-nav');if(old)old.remove();\n    // nav 생성\n    const nav=document.createElement('div');nav.className='panel-nav';\n    _PANEL_TABS.forEach(function(t){\n      const btn=document.createElement('button');btn.type='button';btn.className='panel-nav-tab'+(t.id===activeId?' active':'');\n      btn.dataset.label=t.label;btn.dataset.key=t.key||'';\n      const lbl=typeof _T==='function'?_T(t.label):t.label;\n      btn.textContent=lbl+(t.key?' ['+t.key+']':'');\n      btn.onclick=function(e){e.stopPropagation();if(t.id!==activeId){const focused=document.activeElement===btn;openPanel(t.id);const current=$(t.id)?.querySelector('.panel-nav-tab.active');if(focused&&current)current.focus({preventScroll:true});}};\n      nav.appendChild(btn);\n    });\n    // pbox 최상단에 삽입\n    pbox.insertBefore(nav,pbox.firstChild);\n  });\n}",
        "backOld": "function _panelBack(){\n  // 1. gcModal (확인 팝업)\n  const gc=$('gcModal');if(gc&&gc.classList.contains('on')){const cb=$('gcCancel');if(cb)cb.click();return true}\n  // 2. crBagPop (결정 주머니)\n  const cr=$('crBagPop');if(cr&&cr.style.display==='flex'){closeCrystalPicker();return true}\n  // 3. skSlotPop (스킬 슬롯 팝업)\n  const sp=$('skSlotPop');if(sp&&sp.style.display==='flex'){_closeSkPop();return true}\n  // 4. 스킬 카드 펼침 → 접기\n  if(_skExpandedId){_skExpandedId=null;renderSkillPanel();return true}\n  // 5. 합체 선택 중 → 취소\n  if(_fuseSelId){_fuseSelId=null;renderSkillPanel();return true}\n  // Character growth summary is a nested view: Back closes it first.\n  const gs=$('growthSummaryDrawer');if($('statPanel').classList.contains('on')&&gs&&!gs.hidden){toggleStatSummary();return true}\n  // 6. 열린 패널 닫기\n  const op=['invPanel','forge','statPanel','skillPanel'].find(id=>$(id)&&$(id).classList.contains('on'));\n  if(op){closeAllPanels();return true}\n  // 7. 설정 패널\n  if($('settings')&&$('settings').classList.contains('on')){closePanel('settings');return true}\n  return false\n}",
        "backCandidate": "function _panelBack(){\n  // 1. gcModal (확인 팝업)\n  const gc=$('gcModal');if(gc&&gc.classList.contains('on')){const cb=$('gcCancel');if(cb)cb.click();return true}\n  // 2. crBagPop (결정 주머니)\n  const cr=$('crBagPop');if(cr&&cr.style.display==='flex'){closeCrystalPicker();return true}\n  // 3. skSlotPop (스킬 슬롯 팝업)\n  const sp=$('skSlotPop');if(sp&&sp.style.display==='flex'){_closeSkPop();return true}\n  // 4. 스킬 카드 펼침 → 접기\n  if(_skExpandedId){_skExpandedId=null;renderSkillPanel();return true}\n  // 5. 합체 선택 중 → 취소\n  if(_fuseSelId){_fuseSelId=null;renderSkillPanel();return true}\n  // Character growth summary is a nested view: Back closes it first.\n  const gs=$('growthSummaryDrawer');if($('statPanel').classList.contains('on')&&gs&&!gs.hidden){toggleStatSummary();return true}\n  // 6. 열린 패널 닫기\n  const op=['invPanel','forge','statPanel','skillPanel'].find(id=>$(id)&&$(id).classList.contains('on'));\n  if(op){const active=document.activeElement;closeAllPanels();if($(op).contains(active)&&document.activeElement===active)active.blur();return true}\n  // 7. 설정 패널\n  if($('settings')&&$('settings').classList.contains('on')){closePanel('settings');return true}\n  return false\n}",
        "before": {
          "mode": "source",
          "keyboard": true,
          "tabTag": "DIV",
          "sequentialEligible": false,
          "hadKeyboardFocus": false,
          "oldTabConnected": true,
          "invOpen": true,
          "skillOpen": false,
          "paused": true,
          "active": "HUD",
          "trace": [
            "renderInv"
          ],
          "passed": false,
          "return": {
            "handled": true,
            "paused": false,
            "skillOpen": false,
            "invOpen": false,
            "active": "HUD",
            "hiddenSkillFocus": false
          }
        },
        "after": {
          "mode": "candidate",
          "keyboard": true,
          "tabTag": "BUTTON",
          "sequentialEligible": true,
          "hadKeyboardFocus": true,
          "oldTabConnected": false,
          "invOpen": false,
          "skillOpen": true,
          "paused": true,
          "active": "new-active-skill-tab",
          "trace": [
            "renderInv",
            "stop",
            "renderSkillPanel"
          ],
          "passed": true,
          "return": {
            "handled": true,
            "paused": false,
            "skillOpen": false,
            "invOpen": false,
            "active": "BODY",
            "hiddenSkillFocus": false
          }
        },
        "pointerBefore": {
          "mode": "source",
          "keyboard": false,
          "tabTag": "DIV",
          "sequentialEligible": false,
          "hadKeyboardFocus": false,
          "oldTabConnected": false,
          "invOpen": false,
          "skillOpen": true,
          "paused": true,
          "active": "HUD",
          "trace": [
            "renderInv",
            "stop",
            "renderSkillPanel"
          ],
          "passed": true,
          "return": {
            "handled": true,
            "paused": false,
            "skillOpen": false,
            "invOpen": false,
            "active": "HUD",
            "hiddenSkillFocus": false
          }
        },
        "pointerAfter": {
          "mode": "candidate",
          "keyboard": false,
          "tabTag": "BUTTON",
          "sequentialEligible": true,
          "hadKeyboardFocus": false,
          "oldTabConnected": false,
          "invOpen": false,
          "skillOpen": true,
          "paused": true,
          "active": "HUD",
          "trace": [
            "renderInv",
            "stop",
            "renderSkillPanel"
          ],
          "passed": true,
          "return": {
            "handled": true,
            "paused": false,
            "skillOpen": false,
            "invOpen": false,
            "active": "HUD",
            "hiddenSkillFocus": false
          }
        }
      }
    ],
    "productionApplied": false,
    "runtimeAccepted": false,
    "newFiles": 0,
    "doubles": [
      "node-dom plus compound class selectors",
      "sequential keyboard eligibility/activation",
      "renderInv/renderSkillPanel and other renderer sinks",
      "G/BGM",
      "document outline query empty"
    ],
    "actualFunctions": [
      "inventory focus full factory begin/close",
      "_injectPanelNav",
      "openPanel",
      "closeAllPanels",
      "_panelBack"
    ],
    "excluded": [
      "plus/minus guards",
      "previous Tab/lobby focus conditions",
      "native game",
      "save",
      "skill costs"
    ]
  },
  "rawSuccessfulStdout": "{\"startedUTC\":\"2026-10-02T12:08:04.932Z\",\"endedUTC\":\"2026-10-02T12:08:05.261Z\",\"task\":\"UIUX-milestone-inventory-skill-nav-memory\",\"results\":[{\"file\":\"game.html\",\"sourceSHA256\":\"391155f3700e584cebf260942a95cfd4f4bbcc2cd6d700c6db65084ab7ad35d2\",\"fragments\":[{\"name\":\"_injectPanelNav\",\"sha256\":\"7e49b2b2a4dfb789fc11795f458a7f0a267265b7a1eb4cb40722db4cf7cedce6\"},{\"name\":\"openPanel\",\"sha256\":\"29bdd418f6a59a84cbaac3ad31ee739fe436a9a1070420382a59ba1b2d6cf963\"},{\"name\":\"closeAllPanels\",\"sha256\":\"02a29397a0c9d87c37b4a8ac8c7f3339fe0f665529a7e0a99e427b1a04384b9d\"}],\"factorySHA256\":\"748370faf47f058d11b6f5ba7ff2df2e530a9eb06614430d6f406342351eb106\",\"tabsSHA256\":\"abe5cf9c35a12d3b688501e2eba66bb1e143b76c3c818d491ba99e60e08a74de\",\"original\":\"function _injectPanelNav(activeId){\\n  _PANEL_TABS.forEach(function(tab){\\n    const panel=$(tab.id);if(!panel)return;\\n    const pbox=panel.querySelector('.pbox');if(!pbox)return;\\n    // 기존 nav 제거\\n    const old=pbox.querySelector('.panel-nav');if(old)old.remove();\\n    // nav 생성\\n    const nav=document.createElement('div');nav.className='panel-nav';\\n    _PANEL_TABS.forEach(function(t){\\n      const btn=document.createElement('div');btn.className='panel-nav-tab'+(t.id===activeId?' active':'');\\n      btn.dataset.label=t.label;btn.dataset.key=t.key||'';\\n      const lbl=typeof _T==='function'?_T(t.label):t.label;\\n      btn.textContent=lbl+(t.key?' ['+t.key+']':'');\\n      btn.onclick=function(e){e.stopPropagation();if(t.id!==activeId)openPanel(t.id)};\\n      nav.appendChild(btn);\\n    });\\n    // pbox 최상단에 삽입\\n    pbox.insertBefore(nav,pbox.firstChild);\\n  });\\n}\",\"candidate\":\"function _injectPanelNav(activeId){\\n  _PANEL_TABS.forEach(function(tab){\\n    const panel=$(tab.id);if(!panel)return;\\n    const pbox=panel.querySelector('.pbox');if(!pbox)return;\\n    // 기존 nav 제거\\n    const old=pbox.querySelector('.panel-nav');if(old)old.remove();\\n    // nav 생성\\n    const nav=document.createElement('div');nav.className='panel-nav';\\n    _PANEL_TABS.forEach(function(t){\\n      const btn=document.createElement('button');btn.type='button';btn.className='panel-nav-tab'+(t.id===activeId?' active':'');\\n      btn.dataset.label=t.label;btn.dataset.key=t.key||'';\\n      const lbl=typeof _T==='function'?_T(t.label):t.label;\\n      btn.textContent=lbl+(t.key?' ['+t.key+']':'');\\n      btn.onclick=function(e){e.stopPropagation();if(t.id!==activeId){const focused=document.activeElement===btn;openPanel(t.id);const current=$(t.id)?.querySelector('.panel-nav-tab.active');if(focused&&current)current.focus({preventScroll:true});}};\\n      nav.appendChild(btn);\\n    });\\n    // pbox 최상단에 삽입\\n    pbox.insertBefore(nav,pbox.firstChild);\\n  });\\n}\",\"backOld\":\"function _panelBack(){\\n  // 1. gcModal (확인 팝업)\\n  const gc=$('gcModal');if(gc&&gc.classList.contains('on')){const cb=$('gcCancel');if(cb)cb.click();return true}\\n  // 2. crBagPop (결정 주머니)\\n  const cr=$('crBagPop');if(cr&&cr.style.display==='flex'){closeCrystalPicker();return true}\\n  // 3. skSlotPop (스킬 슬롯 팝업)\\n  const sp=$('skSlotPop');if(sp&&sp.style.display==='flex'){_closeSkPop();return true}\\n  // 4. 스킬 카드 펼침 → 접기\\n  if(_skExpandedId){_skExpandedId=null;renderSkillPanel();return true}\\n  // 5. 합체 선택 중 → 취소\\n  if(_fuseSelId){_fuseSelId=null;renderSkillPanel();return true}\\n  // Character growth summary is a nested view: Back closes it first.\\n  const gs=$('growthSummaryDrawer');if($('statPanel').classList.contains('on')&&gs&&!gs.hidden){toggleStatSummary();return true}\\n  // 6. 열린 패널 닫기\\n  const op=['invPanel','forge','statPanel','skillPanel'].find(id=>$(id)&&$(id).classList.contains('on'));\\n  if(op){closeAllPanels();return true}\\n  // 7. 설정 패널\\n  if($('settings')&&$('settings').classList.contains('on')){closePanel('settings');return true}\\n  return false\\n}\",\"backCandidate\":\"function _panelBack(){\\n  // 1. gcModal (확인 팝업)\\n  const gc=$('gcModal');if(gc&&gc.classList.contains('on')){const cb=$('gcCancel');if(cb)cb.click();return true}\\n  // 2. crBagPop (결정 주머니)\\n  const cr=$('crBagPop');if(cr&&cr.style.display==='flex'){closeCrystalPicker();return true}\\n  // 3. skSlotPop (스킬 슬롯 팝업)\\n  const sp=$('skSlotPop');if(sp&&sp.style.display==='flex'){_closeSkPop();return true}\\n  // 4. 스킬 카드 펼침 → 접기\\n  if(_skExpandedId){_skExpandedId=null;renderSkillPanel();return true}\\n  // 5. 합체 선택 중 → 취소\\n  if(_fuseSelId){_fuseSelId=null;renderSkillPanel();return true}\\n  // Character growth summary is a nested view: Back closes it first.\\n  const gs=$('growthSummaryDrawer');if($('statPanel').classList.contains('on')&&gs&&!gs.hidden){toggleStatSummary();return true}\\n  // 6. 열린 패널 닫기\\n  const op=['invPanel','forge','statPanel','skillPanel'].find(id=>$(id)&&$(id).classList.contains('on'));\\n  if(op){const active=document.activeElement;closeAllPanels();if($(op).contains(active)&&document.activeElement===active)active.blur();return true}\\n  // 7. 설정 패널\\n  if($('settings')&&$('settings').classList.contains('on')){closePanel('settings');return true}\\n  return false\\n}\",\"before\":{\"mode\":\"source\",\"keyboard\":true,\"tabTag\":\"DIV\",\"sequentialEligible\":false,\"hadKeyboardFocus\":false,\"oldTabConnected\":true,\"invOpen\":true,\"skillOpen\":false,\"paused\":true,\"active\":\"HUD\",\"trace\":[\"renderInv\"],\"passed\":false,\"return\":{\"handled\":true,\"paused\":false,\"skillOpen\":false,\"invOpen\":false,\"active\":\"HUD\",\"hiddenSkillFocus\":false}},\"after\":{\"mode\":\"candidate\",\"keyboard\":true,\"tabTag\":\"BUTTON\",\"sequentialEligible\":true,\"hadKeyboardFocus\":true,\"oldTabConnected\":false,\"invOpen\":false,\"skillOpen\":true,\"paused\":true,\"active\":\"new-active-skill-tab\",\"trace\":[\"renderInv\",\"stop\",\"renderSkillPanel\"],\"passed\":true,\"return\":{\"handled\":true,\"paused\":false,\"skillOpen\":false,\"invOpen\":false,\"active\":\"BODY\",\"hiddenSkillFocus\":false}},\"pointerBefore\":{\"mode\":\"source\",\"keyboard\":false,\"tabTag\":\"DIV\",\"sequentialEligible\":false,\"hadKeyboardFocus\":false,\"oldTabConnected\":false,\"invOpen\":false,\"skillOpen\":true,\"paused\":true,\"active\":\"HUD\",\"trace\":[\"renderInv\",\"stop\",\"renderSkillPanel\"],\"passed\":true,\"return\":{\"handled\":true,\"paused\":false,\"skillOpen\":false,\"invOpen\":false,\"active\":\"HUD\",\"hiddenSkillFocus\":false}},\"pointerAfter\":{\"mode\":\"candidate\",\"keyboard\":false,\"tabTag\":\"BUTTON\",\"sequentialEligible\":true,\"hadKeyboardFocus\":false,\"oldTabConnected\":false,\"invOpen\":false,\"skillOpen\":true,\"paused\":true,\"active\":\"HUD\",\"trace\":[\"renderInv\",\"stop\",\"renderSkillPanel\"],\"passed\":true,\"return\":{\"handled\":true,\"paused\":false,\"skillOpen\":false,\"invOpen\":false,\"active\":\"HUD\",\"hiddenSkillFocus\":false}}},{\"file\":\"game-easy-test.html\",\"sourceSHA256\":\"21a4d3b73b6ddcf765ec1e4a9505329c9f28248828f95b5cbc8993f005f52c0a\",\"fragments\":[{\"name\":\"_injectPanelNav\",\"sha256\":\"7e49b2b2a4dfb789fc11795f458a7f0a267265b7a1eb4cb40722db4cf7cedce6\"},{\"name\":\"openPanel\",\"sha256\":\"29bdd418f6a59a84cbaac3ad31ee739fe436a9a1070420382a59ba1b2d6cf963\"},{\"name\":\"closeAllPanels\",\"sha256\":\"02a29397a0c9d87c37b4a8ac8c7f3339fe0f665529a7e0a99e427b1a04384b9d\"}],\"factorySHA256\":\"748370faf47f058d11b6f5ba7ff2df2e530a9eb06614430d6f406342351eb106\",\"tabsSHA256\":\"abe5cf9c35a12d3b688501e2eba66bb1e143b76c3c818d491ba99e60e08a74de\",\"original\":\"function _injectPanelNav(activeId){\\n  _PANEL_TABS.forEach(function(tab){\\n    const panel=$(tab.id);if(!panel)return;\\n    const pbox=panel.querySelector('.pbox');if(!pbox)return;\\n    // 기존 nav 제거\\n    const old=pbox.querySelector('.panel-nav');if(old)old.remove();\\n    // nav 생성\\n    const nav=document.createElement('div');nav.className='panel-nav';\\n    _PANEL_TABS.forEach(function(t){\\n      const btn=document.createElement('div');btn.className='panel-nav-tab'+(t.id===activeId?' active':'');\\n      btn.dataset.label=t.label;btn.dataset.key=t.key||'';\\n      const lbl=typeof _T==='function'?_T(t.label):t.label;\\n      btn.textContent=lbl+(t.key?' ['+t.key+']':'');\\n      btn.onclick=function(e){e.stopPropagation();if(t.id!==activeId)openPanel(t.id)};\\n      nav.appendChild(btn);\\n    });\\n    // pbox 최상단에 삽입\\n    pbox.insertBefore(nav,pbox.firstChild);\\n  });\\n}\",\"candidate\":\"function _injectPanelNav(activeId){\\n  _PANEL_TABS.forEach(function(tab){\\n    const panel=$(tab.id);if(!panel)return;\\n    const pbox=panel.querySelector('.pbox');if(!pbox)return;\\n    // 기존 nav 제거\\n    const old=pbox.querySelector('.panel-nav');if(old)old.remove();\\n    // nav 생성\\n    const nav=document.createElement('div');nav.className='panel-nav';\\n    _PANEL_TABS.forEach(function(t){\\n      const btn=document.createElement('button');btn.type='button';btn.className='panel-nav-tab'+(t.id===activeId?' active':'');\\n      btn.dataset.label=t.label;btn.dataset.key=t.key||'';\\n      const lbl=typeof _T==='function'?_T(t.label):t.label;\\n      btn.textContent=lbl+(t.key?' ['+t.key+']':'');\\n      btn.onclick=function(e){e.stopPropagation();if(t.id!==activeId){const focused=document.activeElement===btn;openPanel(t.id);const current=$(t.id)?.querySelector('.panel-nav-tab.active');if(focused&&current)current.focus({preventScroll:true});}};\\n      nav.appendChild(btn);\\n    });\\n    // pbox 최상단에 삽입\\n    pbox.insertBefore(nav,pbox.firstChild);\\n  });\\n}\",\"backOld\":\"function _panelBack(){\\n  // 1. gcModal (확인 팝업)\\n  const gc=$('gcModal');if(gc&&gc.classList.contains('on')){const cb=$('gcCancel');if(cb)cb.click();return true}\\n  // 2. crBagPop (결정 주머니)\\n  const cr=$('crBagPop');if(cr&&cr.style.display==='flex'){closeCrystalPicker();return true}\\n  // 3. skSlotPop (스킬 슬롯 팝업)\\n  const sp=$('skSlotPop');if(sp&&sp.style.display==='flex'){_closeSkPop();return true}\\n  // 4. 스킬 카드 펼침 → 접기\\n  if(_skExpandedId){_skExpandedId=null;renderSkillPanel();return true}\\n  // 5. 합체 선택 중 → 취소\\n  if(_fuseSelId){_fuseSelId=null;renderSkillPanel();return true}\\n  // Character growth summary is a nested view: Back closes it first.\\n  const gs=$('growthSummaryDrawer');if($('statPanel').classList.contains('on')&&gs&&!gs.hidden){toggleStatSummary();return true}\\n  // 6. 열린 패널 닫기\\n  const op=['invPanel','forge','statPanel','skillPanel'].find(id=>$(id)&&$(id).classList.contains('on'));\\n  if(op){closeAllPanels();return true}\\n  // 7. 설정 패널\\n  if($('settings')&&$('settings').classList.contains('on')){closePanel('settings');return true}\\n  return false\\n}\",\"backCandidate\":\"function _panelBack(){\\n  // 1. gcModal (확인 팝업)\\n  const gc=$('gcModal');if(gc&&gc.classList.contains('on')){const cb=$('gcCancel');if(cb)cb.click();return true}\\n  // 2. crBagPop (결정 주머니)\\n  const cr=$('crBagPop');if(cr&&cr.style.display==='flex'){closeCrystalPicker();return true}\\n  // 3. skSlotPop (스킬 슬롯 팝업)\\n  const sp=$('skSlotPop');if(sp&&sp.style.display==='flex'){_closeSkPop();return true}\\n  // 4. 스킬 카드 펼침 → 접기\\n  if(_skExpandedId){_skExpandedId=null;renderSkillPanel();return true}\\n  // 5. 합체 선택 중 → 취소\\n  if(_fuseSelId){_fuseSelId=null;renderSkillPanel();return true}\\n  // Character growth summary is a nested view: Back closes it first.\\n  const gs=$('growthSummaryDrawer');if($('statPanel').classList.contains('on')&&gs&&!gs.hidden){toggleStatSummary();return true}\\n  // 6. 열린 패널 닫기\\n  const op=['invPanel','forge','statPanel','skillPanel'].find(id=>$(id)&&$(id).classList.contains('on'));\\n  if(op){const active=document.activeElement;closeAllPanels();if($(op).contains(active)&&document.activeElement===active)active.blur();return true}\\n  // 7. 설정 패널\\n  if($('settings')&&$('settings').classList.contains('on')){closePanel('settings');return true}\\n  return false\\n}\",\"before\":{\"mode\":\"source\",\"keyboard\":true,\"tabTag\":\"DIV\",\"sequentialEligible\":false,\"hadKeyboardFocus\":false,\"oldTabConnected\":true,\"invOpen\":true,\"skillOpen\":false,\"paused\":true,\"active\":\"HUD\",\"trace\":[\"renderInv\"],\"passed\":false,\"return\":{\"handled\":true,\"paused\":false,\"skillOpen\":false,\"invOpen\":false,\"active\":\"HUD\",\"hiddenSkillFocus\":false}},\"after\":{\"mode\":\"candidate\",\"keyboard\":true,\"tabTag\":\"BUTTON\",\"sequentialEligible\":true,\"hadKeyboardFocus\":true,\"oldTabConnected\":false,\"invOpen\":false,\"skillOpen\":true,\"paused\":true,\"active\":\"new-active-skill-tab\",\"trace\":[\"renderInv\",\"stop\",\"renderSkillPanel\"],\"passed\":true,\"return\":{\"handled\":true,\"paused\":false,\"skillOpen\":false,\"invOpen\":false,\"active\":\"BODY\",\"hiddenSkillFocus\":false}},\"pointerBefore\":{\"mode\":\"source\",\"keyboard\":false,\"tabTag\":\"DIV\",\"sequentialEligible\":false,\"hadKeyboardFocus\":false,\"oldTabConnected\":false,\"invOpen\":false,\"skillOpen\":true,\"paused\":true,\"active\":\"HUD\",\"trace\":[\"renderInv\",\"stop\",\"renderSkillPanel\"],\"passed\":true,\"return\":{\"handled\":true,\"paused\":false,\"skillOpen\":false,\"invOpen\":false,\"active\":\"HUD\",\"hiddenSkillFocus\":false}},\"pointerAfter\":{\"mode\":\"candidate\",\"keyboard\":false,\"tabTag\":\"BUTTON\",\"sequentialEligible\":true,\"hadKeyboardFocus\":false,\"oldTabConnected\":false,\"invOpen\":false,\"skillOpen\":true,\"paused\":true,\"active\":\"HUD\",\"trace\":[\"renderInv\",\"stop\",\"renderSkillPanel\"],\"passed\":true,\"return\":{\"handled\":true,\"paused\":false,\"skillOpen\":false,\"invOpen\":false,\"active\":\"HUD\",\"hiddenSkillFocus\":false}}}],\"productionApplied\":false,\"runtimeAccepted\":false,\"newFiles\":0,\"doubles\":[\"node-dom plus compound class selectors\",\"sequential keyboard eligibility/activation\",\"renderInv/renderSkillPanel and other renderer sinks\",\"G/BGM\",\"document outline query empty\"],\"actualFunctions\":[\"inventory focus full factory begin/close\",\"_injectPanelNav\",\"openPanel\",\"closeAllPanels\",\"_panelBack\"],\"excluded\":[\"plus/minus guards\",\"previous Tab/lobby focus conditions\",\"native game\",\"save\",\"skill costs\"]}\n",
  "finalExit": 0,
  "initialHarnessFailure": {
    "exit": 1,
    "error": "/Users/fordeargamers/Projects/exoduser-migration-20261001/node_modules/acorn/dist/acorn.js:3766\n    var err = new SyntaxError(message);\n              ^\n\nSyntaxError: Identifier '_addHeadGib' has already been declared (20851:9)\n    at pp$4.raise (/Users/fordeargamers/Projects/exoduser-migration-20261001/node_modules/acorn/dist/acorn.js:3766:15)\n    at pp$3.declareName (/Users/fordeargamers/Projects/exoduser-migration-20261001/node_modules/acorn/dist/acorn.js:3840:28)\n    at pp$7.checkLValSimple (/Users/fordeargamers/Projects/exoduser-migration-20261001/node_modules/acorn/dist/acorn.js:2360:50)\n    at pp$8.parseFunction (/Users/fordeargamers/Projects/exoduser-migration-20261001/node_modules/acorn/dist/acorn.js:1482:16)\n    at pp$8.parseFunctionStatement (/Users/fordeargamers/Projects/exoduser-migration-20261001/node_modules/acorn/dist/acorn.js:1184:17)\n    at pp$8.parseStatement (/Users/fordeargamers/Projects/exoduser-migration-20261001/node_modules/acorn/dist/acorn.js:986:19)\n    at pp$8.parseTopLevel (/Users/fordeargamers/Projects/exoduser-migration-20261001/node_modules/acorn/dist/acorn.js:856:23)\n    at Parser.parse (/Users/fordeargamers/Projects/exoduser-migration-20261001/node_modules/acorn/dist/acorn.js:611:17)\n    at Parser.parse (/Users/fordeargamers/Projects/exoduser-migration-20261001/node_modules/acorn/dist/acorn.js:678:37)\n    at parse (/Users/fordeargamers/Projects/exoduser-migration-20261001/node_modules/acorn/dist/acorn.js:6254:19) {\n  pos: 1161959,\n  loc: Position { line: 20851, column: 9 },\n  raisedAt: 1161971\n}\n\nNode.js v24.15.0\n",
    "observationUTC": "2026-10-02 12:07:05 UTC",
    "reason": "하니스가 classic script까지 module로 파싱하여 합법적인 중복 함수 선언 _addHeadGib를 거절. 생산 오류로 판정하지 않음."
  },
  "negativeCloseGuard": {
    "run": {
      "chunk_id": "816f3f",
      "wall_time_seconds": 0.077410583,
      "exit_code": 1,
      "original_token_count": 216,
      "output": "node:internal/modules/run_main:107\n    triggerUncaughtException(\n    ^\n\nAssertionError [ERR_ASSERTION]: Expected values to be strictly equal:\n\ntrue !== false\n\n    at run (file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:36:506)\n    at file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:38:40\n    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)\n    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)\n    at async node:internal/modules/esm/loader:246:26\n    at async ModuleLoader.executeModuleJob (node:internal/modules/esm/loader:243:20)\n    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5) {\n  generatedMessage: true,\n  code: 'ERR_ASSERTION',\n  actual: true,\n  expected: false,\n  operator: 'strictEqual',\n  diff: 'simple'\n}\n\nNode.js v24.15.0\n"
    },
    "expectedFailure": true,
    "mutation": "_injectPanelNav 후보는 유지하고 _panelBack을 원문으로 되돌린 메모리 음성대조",
    "observationUTC": "2026-10-02 12:08:28 UTC"
  },
  "docs": {
    "command": [
      "rg",
      "-n",
      "-e",
      "_injectPanelNav|panel-nav-tab|패널 상단 탭|closeAllPanels",
      "docs/"
    ],
    "startedUTC": "2026-10-02T12:07:37.233Z",
    "exit": 0,
    "matchingLines": 16,
    "files": [
      "docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md",
      "docs/2_7 인벤토리+장비시스템/INVENTORY_KEYBOARD_FOCUS_20261002.md",
      "docs/4.1맵디자인+설정/CH1_LIVING_DETAIL_RUNTIME_20260925.md",
      "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md",
      "docs/3.1 ui hud 디자인/exoduser-hud-redesign.md",
      "docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/confirm-inventory-review-result.md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/confirm-inventory-review-receipt.json",
      "docs/16번역·로컬라이제이션/LOCALIZATION_RUNTIME_20260909.md"
    ],
    "stdoutSHA256": "6497b70a30b8880a062f09e4b5de6b250e67946d5a85880ce8ad950d346c9821",
    "wiringLines": [
      "docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md:209:- 패널 닫기 → `closeAllPanels` → `_skExpandedId=null`\r",
      "docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md:245:- 패널 닫기 시 `_skExpandedId=null` 리셋 (`closeAllPanels`)\r",
      "docs/2_7 인벤토리+장비시스템/INVENTORY_KEYBOARD_FOCUS_20261002.md:15:| 열기/닫기 | openPanel/togglePanel에서 invPanel 열기 전 외부 opener 포착. 중간 closeAllPanels는 opener 보존, 실제 closePanel/closeAllPanels는 연결·가시 opener로 복귀. 삭제/숨김 opener는 focus하지 않고 필요 시 내부 잔류 blur |",
      "docs/4.1맵디자인+설정/CH1_LIVING_DETAIL_RUNTIME_20260925.md:190:2차 직접 확인: <http://localhost:3333/captures/ch1_living_detail_pass2_20260925/index.html>. 게임 전체 화면 녹화 `after/camera-tour.webm`에는 자동 카메라 이동과 나무 앞6초 정지가 포함된다. QA 인트로 Escape 반복이 설정 패널을 열던 문제를 발견하여 컷씬일 때만 Escape를 누르고 촬영 전에 `closeAllPanels()`를 호출한다. 패널/흰 레이어로 가려진 초기 촬영은 완료 근거에서 제외한다.",
      "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md:2691:| openPanel/togglePanel/closeAllPanels/closePanel | invPanel 열기 전에 외부 opener 보존, 열기 동안 중간 close에서 복귀 상태 보존, 실제 닫기 후 연결·가시 opener 복귀. 다른 패널의 기존 동작 유지 |",
      "docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md:832:- 모든 닫기 경로를 `_closeSkPop()`로 통일: L 재토글, 옵션/합체 클릭 세팅, ESC, 외부 클릭, `_panelBack`, 게임패드 Back. `closeAllPanels()`는 `_skPopOwnsPause=false` 클리어 추가.\r",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/confirm-inventory-review-result.md:44:| B3 | 실제 소스에 `_invClearHover`(L47967)·`renderInv`(L48384)·`_invRenderDetail`·`closeAllPanels` 존재 | PASS |",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/confirm-inventory-review-receipt.json:33:      \"_invClearHover L47967 / renderInv L48384 / _invRenderDetail / closeAllPanels\""
    ]
  },
  "saveReceipt": {
    "at": "2026-10-02T12:14:40.097Z",
    "checksSHA256": "d9dd4afc1d428f46e03800a5b103029628aac2fd20460ccd754347d06fd29a17",
    "milestoneRequestedAndFirstReadSHA256": "889fb16f97416a582818d6a93e49421e8eb704c11806ab50279fec9dc41b5a09",
    "milestoneAtSaveSHA256": "713aa80c994688820d2eb18ca43377018312ea975f9134968faaefbe77eee7ee",
    "note": "목표 문서는 root 공유 WIP로 저장 시 해시가 바뀜. 첫 읽기와 현재 읽기를 분리하며 수정0.",
    "capacityEpoch": "capacity-after-6a39b828-1212",
    "reportedChanges": 60,
    "roleSavedIterations": 1,
    "roleFileBudgetConsumed": 2,
    "GitQueried": false,
    "savedHarnessExecuted": false
  },
  "anchorAudit": {
    "utc": "2026-10-02T12:15:06.552Z",
    "exit": 0,
    "source": [
      {
        "file": "game.html",
        "finalSourceSHA256": "391155f3700e584cebf260942a95cfd4f4bbcc2cd6d700c6db65084ab7ad35d2",
        "navSHA256": "7e49b2b2a4dfb789fc11795f458a7f0a267265b7a1eb4cb40722db4cf7cedce6",
        "panelBackSHA256": "b6abc6c524255ac3934c6e87c93a4f3214c207ac5d2e6f0b9095d4b6880860e3",
        "ownedAnchorsUnchanged": true
      },
      {
        "file": "game-easy-test.html",
        "finalSourceSHA256": "21a4d3b73b6ddcf765ec1e4a9505329c9f28248828f95b5cbc8993f005f52c0a",
        "navSHA256": "7e49b2b2a4dfb789fc11795f458a7f0a267265b7a1eb4cb40722db4cf7cedce6",
        "panelBackSHA256": "b6abc6c524255ac3934c6e87c93a4f3214c207ac5d2e6f0b9095d4b6880860e3",
        "ownedAnchorsUnchanged": true
      }
    ]
  },
  "productionApplied": false,
  "runtimeAccepted": false
}
```

