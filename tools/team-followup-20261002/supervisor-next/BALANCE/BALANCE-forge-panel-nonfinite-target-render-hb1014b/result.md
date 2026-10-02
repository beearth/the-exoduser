# BALANCE-forge-panel-nonfinite-target-render-hb1014b

검수 완료. 본편/easy의 실제 **openPanel('forge')→full renderForge**에서 G._aiTarget=Infinity가 비용 표시 루프를 끝내지 못해 VM80ms timeout에 도달했다. 메모리 후보는 비유한 목표를 기존 `현재 강화+100` fallback으로 교정해 렌더를 완료했다. 정상 목표2의 예상 악의 **33,135**·전체 DOM snapshot·상태·대역 trace는 원본과 후보가 동일했다.

비유한 목표1사건+정상 표시1control × 양판2 × 원본/후보2 = **패널 경로8실행**, 실제 비용함수로 정상 표시 독립대조2회. 이전 aiEnhance/_doAiEnhance24/그 이전 검사 import·실행·합산0. productionApplied=false/runtimeAccepted=false, browserNumberInputVerified=false, visualAccepted=false. 소유 result.md/checks.mjs만 작성했다.

## 현행 정책과 최소 후보

강화 SSOT의 비용/확률/상한 없음 계약, BALANCE 대장 강화 지출, UI SSOT의 renderForge 탭/폴백·로드 정책을 먼저 읽었다. 비유한 목표 fallback 자체가 확정 설계로 문서화됐다는 뜻은 아니다. 후보의 값은 **현재 renderForge가 이미 쓰는 `_curEnh+100`**이며 새로운 상한/비용/확률/번역정책을 만들지 않는다.

```diff
- if(G._aiTarget===undefined||G._aiTarget<=_curEnh)G._aiTarget=_curEnh+100;
+ if(!Number.isFinite(G._aiTarget)||G._aiTarget<=_curEnh)G._aiTarget=_curEnh+100;
```

패널의 `_t` 지정과 `_autoExpCost` loop 이전 한 조건만 교체했다. helper/caller/root WIP guard는 읽기·수정·재검사하지 않았다. `_curEnh=0`인 장비에서 목표100으로 교정됨을 확인했다. 손상된 item.enh 자체의 비유한값, 수치 문자열·아주 큰 유한 목표는 이번 input이 아니며 이 한 줄로 전체 비정상 상태를 해결했다고 주장하지 않는다.

## 실제 반례·control 및 변이 경계

합성 상태는 weapon={id93,slot:'weapon',name:'기존 무기',enh0,rarity2}, mats50000, forgeTab='upgrade', 선택 weapon, 목표Infinity 또는2다. 두 판본 모두 동일 입력을 사용했다.

| 관측 | 현행 Infinity | 후보 Infinity | 정상 목표2 원본/후보 |
|---|---|---|---|
| 경로 |실제 openPanel 전체→renderForge 전체|동일|동일|
| 종료 |ERR_SCRIPT_EXECUTION_TIMEOUT,80ms|정상 undefined 반환|정상 undefined 반환|
| G._aiTarget |Infinity 유지|100 fallback|2 유지|
| item/mats |원item deepEqual·identity·mats50000 유지|동일 보존|동일 보존|
| 패널 열림 상태 |paused=true·forgeOpen=true|동일|동일|
| 비용 표시 패널 |aiTargetInp 포함 aiSec가 grid에 삽입되기 전 timeout|value100·유한 비용 표시·Infinity/NaN 없음|value2·예상33,135·DOM전체 정확 동일|
| 부분 DOM |탭/강화 헤더/수동 장비행은 이미 만들어짐|완료 DOM|동일 완료 DOM|
| 저장/클릭 |dbSaveNow0·강화 클릭0·RNG0|동일|동일|

원본 timeout에도 panel open/탭/행 렌더 변이는 이미 발생한다. 자원 보존을 “DOM 변이0”로 확대하지 않는다. timeout은 VM 보호의 관측이며 실제 게임 정지시간/픽셀 품질 실측이 아니다. 후보 정상 제어는 DOM 문자열·트리/스타일·class snapshot 및 대역 호출 순서까지 비교했다. 비용 loop를 counter/가짜 계산으로 치환하지 않았다. 33,135는 실제 `ceil(enhCost(0,2).cost/rate + enhCost(1,2).cost/rate)`와 실제 완성 markup 대조다.

## actual source와 대역

| 항목 | 경계 |
|---|---|
| 실제 함수 |openPanel/renderForge 전체; enhRate/enhCostRaw/enhCost/_malCost/_itemEconomyRarity 및 표시 색상·강화배율 함수 전체를 현재 source에서 추출/VM 실행 |
| DOM |직접 정의 Element의 children/parent/nextSibling/appendChild/insertBefore/replaceChildren/style/classList 및 HTML 문자열 snapshot. innerHTML의 HTML parser·native input 값·layout 없음 |
| 안전 |textContent setter는 leaf 자식수0을 확인. 실제 source DOM 호출 그대로 실행, 생산 DOM 수정0 |
| 패널 외 caller 의존 |closeAllPanels/_injectPanelNav 대역 trace. 다른 패널·inventoryFocus는 실행분기 밖 |
| asset/audio/timer |_ensureForgeAtlasLoad·BGM.play trace 대역. setTimeout 대역 제공, 예약0. 실제 이미지/오디오 로드·재시도 콜백 실행0 |
| 저장 |dbSaveNow 호출 시 하니스 오류가 나도록 둬 의도하지 않은 저장 감지, 실제 호출0 |
| 실제 input 도달성 |외부 G._aiTarget=Infinity 상태를 직접 공급. oninput/type=number/309자리값 재현은 전건 범위라 이번 반복0. native DOM의 Infinity 목표 도달가능성은 미검수 |

## 영수증·소유

| 항목 | 실제 기록 |
|---|---|
| TASK |새 TASK 먼저 Read, SHA `e43cc4c6382e69dcff3815cfe14cbdd6a8ff1fd7b76a53af0ed047f4b6042bca` 대조. assigned11:02:19.288804 UTC /20:02:19.288804 KST |
| 담당 |Codex BALANCE, 기존 단일 chat `01a0faaf-a06a-79a2-9def-58eb8ad10d65` |
| 읽기 |COMMON/AGENTS/TEAM_CONTINUATION_POLICY/강화 SSOT/BALANCE 대장/UI renderForge 정책·현재 실제 caller와 branch 읽기. parent d5c1b62d은 역사 입력, current HEAD 주장0 |
| 실행 |지정 Node v24.15.0, 실제 migration checkout.2026-10-02 11:04:23.812→11:04:24.294 UTC /20:04:23.812→20:04:24.294 KST |
| 명령/exit |고정 Node `--check`1회 exit0, 고정 Node checks 실행1회 exit0. 예상 timeout2건은 JSON.runs.error에 기록; 하니스 실패0 |
| main whole SHA |`8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b` |
| easy whole SHA |`50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057` |
| main renderForge SHA |`6407a724ea6d9f1d9ba3f36dfc12d5b7f8a712ff2ada17320b7fac8f6066c2eb` |
| easy renderForge SHA |`44c24b9c9130b66b3cce2e50ff923ae06a4d35834fd2c9b01c46797a5ff0dcf1` |
| openPanel 양판 SHA |`29bdd418f6a59a84cbaac3ad31ee739fe436a9a1070420382a59ba1b2d6cf963` |
| checks SHA |`d2aae4124c5225030d9ab93743cfe1650e8d3cd5c9a07b567d0a547c0735e129` |
| WIP/Changes |종료 시 함수 anchor·whole 변화0. Git 조회/쓰기0; count 미제공·감독관리80/100 계약 유지, capacity 중단 신호 수신0 |

소유2산출 외 writes0, TASK/기존산출/production/공유docs/사용자세이브/타인WIP 보존. 게임/서버/빌드/이미지/audio장치/권한/설치/게시/삭제/이동/cleanup/새팀·채팅·외부메시지0. 도구는 파일 Read·소유 apply_patch·지정 Node/Acorn/VM/rg·최종 Python artifact 검증이며 실제 외부 API/MCP/skill0이다.

## docs 정본 인계

fixture 산출 뒤 docs 전체 `renderForge|_aiTarget|自動|자동 강화|enhCost` rg1회 exit0,39매칭/16문서. 문서 목록/출력 SHA는 JSON.docsSearch에 보존. 공유docs writes0, root의 정확 old/new 인계:

| 정본/항목 | old source·상태 | new 후보 문안 |
|---|---|---|
| BALANCE 대장·강화 패널 |renderForge의 undefined/target<=curEnh만 current+100 교정,Infinity 표시loop 미검수 |`openPanel→full renderForge 양판 Infinity 목표에서80ms VM timeout/부분 DOM,아이템·mats 보존. !Number.isFinite 목표를 기존current+100으로 교정하는 메모리 후보는 렌더 완료. 정상목표2 비용33135·DOM 동등. panel8source+비용대조2,전건24 재실행0,productionApplied=false/runtimeAccepted=false.` |
| 강화 수치 SSOT |raw=max(20000,ceil((20000+3500n)*1.5));등급배율·_malCost·rate 기존식,상한 없음 |수치변경0. `패널 _aiTarget의 유한성 fallback 후보만 인계. 새로운 최대강화/목표 상한/예산·환수 정책0. 손상currentEnh·거대한 유한target·native number입력은 미검수.` |
| UI phase2 renderForge |기존6탭/markup/atlas 폴백·1.3초재시도 |`자동강화 예상비용 이전 target finite 검사 후보. Infinity 원본은 탭/수동행 이후 aiSec 삽입 전 timeout. 후보value100·정상value2의 HTML/DOM source 대조만 완료,실브라우저 layout·시각·asset/audio·timer콜백 미검수. 기존탭/재시도정책 유지.` |

필수 Gate는 root의 fallback 후보 인수와 실제 number input·DOM 렌더/시각·실게임 검수다. item.enh 손상이나 매우 큰 유한 목표 정책은 임의 확정하지 않는다. 이전 helper guard 후보와 결합된 생산 결과라고 주장하지 않는다. 이 한 건만 완료하고 자체 다음 업무/송신0.

## 실행 evidence JSON

```json
{
  "taskId": "BALANCE-forge-panel-nonfinite-target-render-hb1014b",
  "assignedUTC": "2026-10-02T11:02:19.288804+00:00",
  "provider": "Codex BALANCE",
  "chatId": "01a0faaf-a06a-79a2-9def-58eb8ad10d65",
  "historicalParentPin": "d5c1b62d; no current HEAD observation",
  "execution": {
    "startedAt": {
      "UTC": "2026-10-02T11:04:23.812Z",
      "KST": "2026-10-02T20:04:23.812+09:00"
    },
    "cwd": "/Users/fordeargamers/Projects/exoduser-migration-20261001",
    "node": "v24.15.0",
    "endedAt": {
      "UTC": "2026-10-02T11:04:24.294Z",
      "KST": "2026-10-02T20:04:24.294+09:00"
    }
  },
  "inputs": {
    "AGENTS.md": "fd59bef70960bcaf1ab9910051faa860362884e574ac2869fad05c6872ae04e4",
    "tools/team-followup-20261002/supervisor-next/BALANCE/BALANCE-forge-panel-nonfinite-target-render-hb1014b/TASK.md": "e43cc4c6382e69dcff3815cfe14cbdd6a8ff1fd7b76a53af0ed047f4b6042bca",
    "tools/team-followup-20261002/continuous/COMMON.md": "de5a881270625a7b2d0e854331205e01372a037340a18474c6442b60e668465e",
    "docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md": "86ada15a477fc128a77cf10c2337de9fdb36b3f9c463f008f5d3c97e82f60520",
    "docs/14밸런스+수치테이블/BALANCE_ECONOMY_TEAM_MASTER.md": "9ea03646283c43a7412c4704100acb35732fddd3933ddfd1966d5ee7b8aef8bc",
    "docs/14밸런스+수치테이블/14밸런스+수치테이블.md": "f809b60874aef760217edfb7708e2444e35bd9925f4c9a0f3a2316389d41779b",
    "docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md": "2f847f8d6ed8d92cda48711b1eea90c63d1611e1e72a86f02dfc9baf4da1e694",
    "game.html": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b",
    "game-easy-test.html": "50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057"
  },
  "sources": [
    {
      "file": "game.html",
      "readAt": {
        "UTC": "2026-10-02T11:04:23.870Z",
        "KST": "2026-10-02T20:04:23.870+09:00"
      },
      "wholeSha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b",
      "functions": {
        "openPanel": {
          "text": "function openPanel(id){if(id==='invPanel')_inventoryFocus.begin();closeAllPanels(id==='invPanel');$(id).classList.add('on');G.paused=true;_injectPanelNav(id);if(id==='invPanel')renderInv();if(id==='settings')renderSettings();if(id==='forge')renderForge();if(id==='statPanel')renderStatPanel();if(id==='skillPanel')renderSkillPanel()}",
          "sha256": "29bdd418f6a59a84cbaac3ad31ee739fe436a9a1070420382a59ba1b2d6cf963",
          "line": 42601
        },
        "renderForge": {
          "text": "function renderForge(){\n  G.forgeOpen=true;\n  _ensureForgeAtlasLoad();\n  BGM.play('forge');\n$('forgeMats').textContent=`${_T('악의')}: ${G.mats}`;\n$('forgeLore').textContent=_T('🔴화염→빙결 2배 | 🔵빙결→화염 2배 | ⚪물리=중립 | 악마 처치 시 악의 영혼 드롭');\n  const tabs=$('fgTabs');tabs.replaceChildren();\n  tabs.classList.add('atlas-v1-ready','atlas-v2-ready');\n  const _fgTabMeta={\n    // v1 icon atlas (4x3): 0 anvil, 1 hammer, 2 tongs, 3 molten ingot\n    //                       4 furnace flame, 5 sharpening wheel, 6 shield, 7 blade\n    //                       8 rune crystal, 9 salvage scrap, 10 reroll spiral, 11 upgrade star\n    upgrade:{icon:'⭐',ko:'강화',en:'Enhance',si:11,atlas:'v1'},\n    potion:{icon:'🧪',ko:'물약',en:'Potion',si:3,atlas:'v1'},\n    salvage:{icon:'🔥',ko:'분해',en:'Salvage',si:9,atlas:'v1'},\n    reroll:{icon:'🔄',ko:'리롤',en:'Reroll',si:10,atlas:'v1'},\n    crystal:{icon:'💎',ko:'결정',en:'Crystal',si:8,atlas:'v1'},\n    weapon:{icon:'⚔️',ko:'무기',en:'Weapon',si:7,atlas:'v2'},\n    bow:{icon:'🏹',ko:'활',en:'Bow',si:7,atlas:'v2'},\n    armor:{icon:'🦺',ko:'갑옷',en:'Armor',si:0,atlas:'v2'},\n    shield:{icon:'🛡️',ko:'견갑',en:'Shield',si:6,atlas:'v2'},\n    helmet:{icon:'👑',ko:'왕관',en:'Crown',si:1,atlas:'v2'},\n    pants:{icon:'👖',ko:'바지',en:'Pants',si:0,atlas:'v2'},\n    gloves:{icon:'🧤',ko:'장갑',en:'Gloves',si:2,atlas:'v2'},\n    boots:{icon:'👢',ko:'부츠',en:'Boots',si:2,atlas:'v2'},\n    belt:{icon:'🥋',ko:'벨트',en:'Belt',si:3,atlas:'v2'},\n    necklace:{icon:'📿',ko:'목걸이',en:'Necklace',si:8,atlas:'v2'},\n    ring:{icon:'💍',ko:'반지',en:'Ring',si:10,atlas:'v2'},\n    cape:{icon:'🧣',ko:'망토',en:'Cape',si:4,atlas:'v2'},\n    bracelet:{icon:'⭕',ko:'팔찌',en:'Bracelet',si:5,atlas:'v2'},\n    headband:{icon:'🎀',ko:'귀걸이',en:'Earring',si:8,atlas:'v2'},\n    ossuary:{icon:'⚱️',ko:'유골함',en:'Ossuary',si:8,atlas:'v2'},\n    craft:{icon:'🔨',ko:'제작',en:'Craft',si:11,atlas:'v1'}\n  };\n  const _EQUIPMENT_TABS=new Set(['weapon','bow','armor','shield','helmet','pants','gloves','boots','belt','necklace','ring','cape','bracelet','headband','ossuary']);\n  ['upgrade','potion','salvage','reroll','crystal','craft','weapon','bow','armor','shield','helmet','pants','gloves','boots','belt','necklace','ring','cape','bracelet','headband'].forEach((k)=>{\n    if(_EQUIPMENT_TABS.has(k))return;\n    const _m=_fgTabMeta[k];\n    const _txt=_T(_m.ko);\n    const d=document.createElement('div');\n    d.className='fg-tab'+(G.forgeTab===k?' act':'');\n    const _hasV4=['upgrade','potion','salvage','reroll','crystal','craft'].indexOf(k)>=0;\n    if(_hasV4){\n      d.style.setProperty('--fg-tab-bg','url(output/imagegen/forge-tabs-v4/'+k+'.png?v=20260417-v4)');\n      d.classList.add('fg-tab-v4');\n      d.innerHTML='<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">'+_txt+'</span>';\n    }else{\n      const _v3='output/imagegen/forge-tabs-v3/'+k+'.png?v=20260416-v3set1';\n      const _fb=_forgeTabFallbackData(_m.icon);\n      d.innerHTML='<span class=\"fg-tab-ico\"><img class=\"fg-tab-ico-img\" src=\"'+_v3+'\" alt=\"\" onerror=\"this.onerror=null;this.src=&apos;'+_fb+'&apos;\"></span><span class=\"fg-tab-txt\">'+_txt+'</span>';\n    }\n    d.onclick=()=>{G.forgeTab=k;_forgeSel=null;_salSel.clear();_rerollSel=null;_crForgeSel=-1;renderForge()};\n    tabs.appendChild(d);\n  });\n  const grid=$('fgGrid');grid.replaceChildren();\n  grid.style.gridTemplateColumns=(G.forgeTab==='upgrade'||G.forgeTab==='potion'||G.forgeTab==='salvage'||G.forgeTab==='reroll'||G.forgeTab==='crystal'||G.forgeTab==='craft')?'1fr':'1fr 1fr';\n  // 제작 확인 바\n  const cfm=$('forgeConfirm');\n  if(_forgeSel){\n    const ok=G.mats>=_forgeSel.cost;\n    cfm.style.display='';\n    $('fgSelName').textContent=_T(_forgeSel.name);\n$('fgSelDesc').textContent=_forgeSel.desc+' — '+_T('악의')+' '+_forgeSel.cost;\n    $('fgCraftBtn').style.opacity=ok?'1':'.4';\n    $('fgCraftBtn').style.borderColor=ok?'#aa8833':'#443322';\n    $('fgCraftBtn').onclick=_fgCraft;\n  }else{cfm.style.display='none'}\n\n  if(G.forgeTab==='upgrade'){\n    // ═══ 장비 강화 (무한 강화, 성공률 시스템) ═══\n    grid.style.gridTemplateColumns='1fr';\n    const uhdr=document.createElement('div');uhdr.style.cssText='color:#ffaa44;font-size:.95rem;font-weight:700;margin-bottom:8px;letter-spacing:.1em;text-align:center';\nuhdr.textContent=_T('장비 강화 (실패 시 재료만 소멸)');grid.appendChild(uhdr);\n    const _slotEN={weapon:'⚔️ Weapon',shield:'🛡️ Shield',armor:'🦺 Armor',helmet:'👑 Crown',boots:'👢 Boots',bow:'🏹 Bow',gloves:'🧤 Gloves',pants:'👖 Pants',belt:'🥋 Belt',necklace:'📿 Necklace',ring1:'💍 Ring1',ring2:'💍 Ring2',cape:'🧣 Cape',bracelet:'⭕ Bracelet',headband:'🎀 Earring1',headband2:'🎀 Earring2',ossuary:'⚱️ Ossuary'};\n    const slots=[['weapon','⚔️ 무기'],['shield','🛡️ 견갑'],['armor','🦺 갑옷'],['helmet','👑 왕관'],['boots','👢 부츠'],['bow','🏹 활'],['gloves','🧤 장갑'],['pants','👖 바지'],['belt','🥋 벨트'],['necklace','📿 목걸이'],['ring1','💍 반지1'],['ring2','💍 반지2'],['cape','🧣 망토'],['bracelet','⭕ 팔찌'],['headband','🎀 귀걸이1'],['headband2','🎀 귀걸이2'],['ossuary','⚱️ 유골함']].map(([k,v])=>{const split=v.indexOf(' '),label=v.slice(split+1);return [k,v.slice(0,split+1)+(_earringSlot(k)?_slotName(SLOT_NAMES.indexOf(k)):_L(label,_slotEN[k].slice(_slotEN[k].indexOf(' ')+1)))]});\n    let hasItem=false;\n    slots.forEach(([slot,icon])=>{\n      const it=INV.equipped[slot];if(!it)return;hasItem=true;\n      const enh=it.enh||0;\n      const isMax=false; // 무한 강화\n      const rc=RARITY_C[it.rarity||0];\n      const ec=enhColor(enh);\n      const label=icon+' '+_T(it.name||slot);\n      const sel=_forgeSel&&_forgeSel.name===label;\n      const d=document.createElement('div');d.className='fg-i'+(sel?' fg-sel':'');\n      if(isMax){\n        // +20 MAX — 클릭 불가\n        d.innerHTML=`<div class=\"fg-in\" style=\"color:${rc}\">${label} <span style=\"color:#ffdd00;text-shadow:0 0 6px #ffdd00\">+${enh} MAX ✨</span></div><div class=\"fg-id\" style=\"color:#888\">${_T('최대 강화 달성!')}</div>`;\n        d.style.opacity='.6';d.style.cursor='default';\n      }else{\n        const {rate,cost}=enhCost(enh,it.rarity);\n        const _rpRaw=rate*100;\n        const ratePct=_rpRaw>=10?~~_rpRaw:_rpRaw>=1?_rpRaw.toFixed(1):_rpRaw>=0.01?_rpRaw.toFixed(2):_rpRaw.toFixed(3);\n        const rateCol=enhRateColor(rate);\n        const atkMulNow=it.atk?~~(enhMulAtk(enh)*100):0;\n        const atkMulNext=it.atk?~~(enhMulAtk(enh+1)*100):0;\n        const _enhDefSlots=new Set(['shield','armor','cape']);\n        const _enhHpSlots=new Set(['gloves','pants','boots']);\n        const _enhStSlots=new Set(['ring1','ring2','belt']);\n        const _enhMpSlots=new Set(['bracelet','necklace','headband','headband2','ossuary']);\n        let bonusTxt='';\n        if(it.atk)bonusTxt+=`ATK +${atkMulNow}% → +${atkMulNext}%`;\n        if(_enhDefSlots.has(it.slot))bonusTxt+=(bonusTxt?' | ':'')+ `DEF +${~~(enhMul(enh))} → +${~~(enhMul(enh+1))}`;\n        if(_enhHpSlots.has(it.slot))bonusTxt+=(bonusTxt?' | ':'')+`HP +${~~(enh*1.0)} → +${~~((enh+1)*1.0)}`;\n        if(_enhStSlots.has(it.slot))bonusTxt+=(bonusTxt?' | ':'')+`ST +${~~(enh*0.2)} → +${~~((enh+1)*0.2)}`;\n        if(_enhMpSlots.has(it.slot))bonusTxt+=(bonusTxt?' | ':'')+`MP +${~~(enh*0.2)} → +${~~((enh+1)*0.2)}`;\n        if(!bonusTxt)bonusTxt=_T('강화 보너스 적용');\nd.innerHTML=`<div class=\"fg-in\" style=\"color:${rc}\">${label} <span style=\"color:${ec}\">+${enh}</span></div><div class=\"fg-id\">${bonusTxt}</div><div class=\"fg-ic\" style=\"display:flex;justify-content:space-between\"><span style=\"color:${rateCol};font-weight:700\">${_T('성공률')} ${ratePct}%</span><span>${_T('악의')} ${cost}</span></div>`;\n        d.onclick=()=>{\n          const {rate:r2,cost:c2}=enhCost(it.enh||0,it.rarity);\n          if(G.mats<c2){notify(_T('악의가 부족합니다!'));return}\n          G.mats-=c2;\n          if(Math.random()<r2){\n            it.enh=(it.enh||0)+1;\n            SFX.forge();\n            const _ec2=enhColor(it.enh);\n            addTxt(P.x,P.y-20,'+'+it.enh+_L(' 강화!',' Enhanced!'),_ec2,60);\n            for(let i=0;i<12;i++)poolPart(P.x+(Math.random()-.5)*30,P.y-10+(Math.random()-.5)*20,(Math.random()-.5)*4,-2-Math.random()*3,_ec2,2+Math.random()*3,15+~~(Math.random()*10));\n            if(typeof _petOnEnhSuccess==='function')_petOnEnhSuccess();\n            if(it.enh===100&&typeof _petOnEnh100==='function')_petOnEnh100();\n          }else{\n            SFX.hurt();\n            addTxt(P.x,P.y-20,_T('강화 실패!'),'#ff4444',60);\n            for(let i=0;i<6;i++)poolPart(P.x+(Math.random()-.5)*20,P.y-10+(Math.random()-.5)*15,(Math.random()-.5)*3,-1-Math.random()*2,'#ff4444',1.5+Math.random()*2,12+~~(Math.random()*8));\n            if(typeof _petOnEnhFail==='function')_petOnEnhFail();\n          }\n          renderForge();dbSaveNow();\n        };\n      }\n      grid.appendChild(d);\n    });\n    if(!hasItem){const e=document.createElement('div');e.style.cssText='text-align:center;padding:20px;color:#554433;font-size:.95rem';e.textContent=_T('장착된 장비가 없습니다.');grid.appendChild(e)}\n    // ── AI 자동 강화 섹션 ──\n    if(hasItem){\n      const aiSec=document.createElement('div');\n      aiSec.style.cssText='margin-top:16px;border-top:1px solid #443322;padding-top:14px';\n      const _aiSlot=G._aiEnhSlot||null;\n      const _aiItem=_aiSlot?INV.equipped[_aiSlot]:null;\n      const _curEnh=_aiItem?(_aiItem.enh||0):0;\n      if(G._aiTarget===undefined||G._aiTarget<=_curEnh)G._aiTarget=_curEnh+100;\n      const _t=G._aiTarget;\n      let _autoExpCost=0;\n      if(_aiItem){for(let i=_curEnh;i<_t;i++){const ec=enhCost(i,_aiItem.rarity||0);_autoExpCost+=ec.cost/ec.rate}}\n      const _b=Math.min(Math.ceil(_autoExpCost)||1000,G.mats||0);\n      let _slotBtns='';\n      slots.forEach(function(_s){\n        const _it=INV.equipped[_s[0]];if(!_it)return;\n        const _sel=_aiSlot===_s[0];\n        const _ec2=enhColor(_it.enh||0);\n        _slotBtns+='<span onclick=\"G._aiEnhSlot=\\''+_s[0]+'\\';G._aiTarget=undefined;renderForge()\" style=\"cursor:pointer;padding:3px 8px;border:1px solid '+(_sel?'#44ccff':'#332211')+';background:'+(_sel?'rgba(68,204,255,.15)':'rgba(0,0,0,.2)')+';border-radius:3px;font-size:.8rem;color:'+(_sel?'#88ddff':'#776655')+'\">'+_s[1]+' <span style=\"color:'+_ec2+'\">+'+(_it.enh||0)+'</span></span>';\n      });\n      let _expHtml='';\n      if(_aiItem){\n        const _enoughMats=(G.mats||0)>=Math.ceil(_autoExpCost);\n        _expHtml='<div style=\"font-size:.8rem;color:#886644;margin-top:6px\">+'+_curEnh+' \\u2192 +'+_t+' | '+_T('보유 악의')+' '+(_enoughMats?'<span style=\"color:#44ff88\">\\u2714 '+_T('충분')+'</span>':'<span style=\"color:#ff4444\">\\u2716 '+_T('부족')+' ('+Math.ceil(_autoExpCost-(G.mats||0)).toLocaleString()+' '+_T('더 필요')+')</span>')+'</div>';\n      }\n      aiSec.innerHTML='<div style=\"color:#cc8844;font-weight:700;font-size:.95rem;margin-bottom:6px\">\\u26A1 '+_T('AI 자동 강화')+'</div>'+\n        '<div style=\"font-size:.8rem;color:#886644;margin-bottom:8px\">'+_T('장비 선택')+' \\u2192 '+_T('목표치 설정')+' \\u2192 '+_T('악의 투입')+' \\u2192 '+_T('자동 시도')+'</div>'+\n        '<div style=\"display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px\">'+_slotBtns+'</div>'+\n        (_aiItem?\n        '<div style=\"display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-bottom:4px\">'+\n          '<div style=\"flex:1;min-width:80px\">'+\n            '<div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">'+_T('목표 강화치')+'</div>'+\n            '<input id=\"aiTargetInp\" type=\"number\" min=\"'+(_curEnh+1)+'\" max=\"9999\" value=\"'+_t+'\" style=\"width:100%;background:#0a0806;border:1px solid #443322;color:#ffcc88;padding:5px 8px;border-radius:3px;font-size:.9rem;box-sizing:border-box\" oninput=\"G._aiTarget=Math.max('+(_curEnh+1)+',parseInt(this.value)||'+(_curEnh+1)+')\" onchange=\"renderForge()\">'+\n          '</div>'+\n          '<div style=\"flex:1;min-width:100px\">'+\n            '<div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">'+_T('예상 필요 악의')+'</div>'+\n            '<div style=\"background:#0a0806;border:1px solid #443322;color:#ffaa44;padding:5px 8px;border-radius:3px;font-size:.9rem\">'+Math.ceil(_autoExpCost).toLocaleString()+' <span style=\"color:#666;font-size:.75rem\">/ '+_T('보유')+' '+(G.mats||0).toLocaleString()+'</span></div>'+\n          '</div>'+\n          '<div><div class=\"id-btn equip\" style=\"white-space:nowrap\" onclick=\"_doAiEnhance()\">'+_T('강화 시작')+'</div></div>'+\n        '</div>'+_expHtml\n        :'<div style=\"color:#554433;font-size:.85rem\">'+_T('위에서 장비를 선택하세요')+'</div>')+\n        '<div id=\"aiEnhResult\"></div>';\n      grid.insertBefore(aiSec, uhdr.nextSibling);\n    }\n\n  }else if(G.forgeTab==='potion'){\n    // ═══ POTION TAB — 물약 강화만 ═══\n    const upgHdr=document.createElement('div');upgHdr.style.cssText='color:#aa8855;font-size:.9rem;font-weight:700;margin-bottom:6px;letter-spacing:.1em';upgHdr.textContent=_T('⬆ 물약 강화 (최대 10단)');\n    grid.appendChild(upgHdr);\n    [{type:'hp',n:'❤️‍🔥 '+_L('HP 물약','HP Potion'),col:'#cc2200'}].forEach(item=>{\n      const lv=POT_LV[item.type],maxed=lv>=10;\n      const cost=_malCost((lv+1)*5);\n      const reqLv=(lv+1)*100;\n      const lvOk=P.lv>=reqLv;\n      const _savLv=POT_LV[item.type];POT_LV[item.type]=lv+1;const nxt=maxed?potHeal(item.type):potHeal(item.type);POT_LV[item.type]=_savLv;const cur=potHeal(item.type);\n      const label=item.n+' Lv.'+lv+(maxed?' (MAX)':'');\n      const sel=_forgeSel&&_forgeSel.name===label;\n      const d=document.createElement('div');d.className='fg-i'+(sel?' fg-sel':'');\n      const _lvTxt=maxed?'':(!lvOk?' <span style=\"color:#ff4444\">⚠ Lv.'+reqLv+' '+_T('필요')+'</span>':'');\nd.innerHTML=`<div class=\"fg-in\" style=\"color:${item.col}\">${label}</div><div class=\"fg-id\">${maxed?_T('최대 강화'):_T('회복량')+' '+cur+' → '+nxt}${_lvTxt}</div>${maxed?'':'<div class=\"fg-ic\">'+_T('악의')+' '+cost+'</div>'}`;\n      if(!maxed&&lvOk)d.onclick=()=>_fgSelect(label,item.n+_L(' 강화 Lv.',' Enhance Lv.')+(lv+1),cost,()=>{POT_LV[item.type]++;G.mats-=cost;addTxt(P.x,P.y-20,item.n+' Lv.'+POT_LV[item.type]+'!','#ffcc00',50);renderForge()});\n      grid.appendChild(d);\n    });\n\n  }else if(G.forgeTab==='salvage'){\n    // ═══ 아이템 분해 ═══\n    grid.style.gridTemplateColumns='1fr';\n    if(G._salRarF===undefined)G._salRarF=-1;\n    if(!G._salSlotF)G._salSlotF='all';\n    // 유효하지 않은 선택 제거\n    for(const idx of[..._salSel]){if(idx>=INV.bag.length)_salSel.delete(idx)}\n    const _salVal=salvageVal;\n    const _salMatch=it=>{\n      if(G._salRarF>=0&&(it.rarity||0)!==G._salRarF)return false;\n      if(G._salSlotF!=='all'){const s=it.slot;if(s!==G._salSlotF&&!(G._salSlotF==='ring'&&(s==='ring1'||s==='ring2'))&&!(G._salSlotF==='headband'&&_earringSlot(s)))return false}\n      return true;\n    };\n    // 헤더\n    const shdr=document.createElement('div');shdr.style.cssText='color:#ff6644;font-size:1rem;font-weight:700;margin-bottom:8px;letter-spacing:.1em;text-align:center';\nshdr.textContent=_T('악의의 분해로 — 장비를 악의로 갈아버려라');grid.appendChild(shdr);\n    // 필터 - 레어리티\n    const fBar=document.createElement('div');fBar.style.cssText='display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px;align-items:center';\n    fBar.innerHTML='<span style=\"color:#776655;font-size:.8rem;margin-right:2px\">'+_T('레어')+':</span>';\n    [[-1,_T('전체')],[0,_rarName(0)],[1,_rarName(1)],[2,_rarName(2)],[3,_rarName(3)],[4,_rarName(4)]].forEach(([r,n])=>{\n      const b=document.createElement('div');const act=G._salRarF===r;\n      b.style.cssText=`padding:2px 8px;font-size:.75rem;cursor:pointer;border:1px solid ${act?'#ff6644':'#332211'};color:${act?(r>=0?RARITY_C[r]:'#ff6644'):'#665544'};background:${act?'rgba(255,102,68,.1)':'transparent'};border-radius:3px`;\n      b.textContent=n;b.onclick=()=>{G._salRarF=r;_salSel.clear();renderForge()};fBar.appendChild(b);\n    });grid.appendChild(fBar);\n    // 필터 - 슬롯\n    const sBar=document.createElement('div');sBar.style.cssText='display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;align-items:center';\n    sBar.innerHTML='<span style=\"color:#776655;font-size:.8rem;margin-right:2px\">'+_T('슬롯')+':</span>';\n    [['all','전체'],['weapon','⚔️'],['shield','🛡️'],['armor','🦺'],['helmet','⛑️'],['boots','👢'],['bow','🏹'],['gloves','🧤'],['pants','👖'],['necklace','📿'],['ring','💍'],['bracelet','⭕'],['headband','🎀']].forEach(([s,n])=>{\n      const b=document.createElement('div');const act=G._salSlotF===s;\n      b.style.cssText=`padding:2px 8px;font-size:.75rem;cursor:pointer;border:1px solid ${act?'#ff6644':'#332211'};color:${act?'#ff6644':'#665544'};background:${act?'rgba(255,102,68,.1)':'transparent'};border-radius:3px`;\n      b.textContent=n;b.onclick=()=>{G._salSlotF=s;_salSel.clear();renderForge()};sBar.appendChild(b);\n    });grid.appendChild(sBar);\n    // 일괄 선택\n    const bulkRow=document.createElement('div');bulkRow.style.cssText='display:flex;gap:4px;margin-bottom:8px';\n    [[_T('전체 선택'),()=>{INV.bag.forEach((it,i)=>{if(_salMatch(it))_salSel.add(i)});renderForge()}],\n     [_T('전체 해제'),()=>{_salSel.clear();renderForge()}],\n     [_T('희귀 이하'),()=>{_salSel.clear();INV.bag.forEach((it,i)=>{if(_salMatch(it)&&(it.rarity||0)<=2)_salSel.add(i)});renderForge()}]\n    ].forEach(([txt,fn])=>{\n      const b=document.createElement('div');b.style.cssText='padding:4px 10px;font-size:.8rem;cursor:pointer;border:1px solid #443322;color:#aa8855;background:rgba(0,0,0,.2);border-radius:3px';\n      b.textContent=txt;b.onclick=fn;bulkRow.appendChild(b);\n    });grid.appendChild(bulkRow);\n    // 아이템 그리드\n    const itemGrid=document.createElement('div');itemGrid.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:4px;max-height:320px;overflow-y:auto;margin-bottom:6px';\n    let salCnt=0;\n    INV.bag.forEach((it,i)=>{\n      if(!_salMatch(it))return;salCnt++;\n      const sel=_salSel.has(i);const rc=RARITY_C[it.rarity||0];const val=_salVal(it);\n      const d=document.createElement('div');d.className='fg-i';\n      d.style.cssText=`border:1px solid ${sel?'#cc3322':'#332211'};background:${sel?'rgba(204,51,34,.12)':'rgba(0,0,0,.25)'};cursor:pointer;position:relative;padding:6px`;\n      d.innerHTML=`${sel?'<div style=\"position:absolute;top:2px;right:6px;color:#ff4444;font-weight:700;font-size:.9rem\">✗</div>':''}\n        <div class=\"fg-in\" style=\"color:${rc}\">${_itemIco(it,rc,15)} ${itemDispName(it)}${it.enh?' <span style=\"color:'+enhColor(it.enh)+'\">+'+it.enh+'</span>':''}</div>\n<div class=\"fg-id\">${_rarName(it.rarity||0)} T${it.tier||0} → ${_T('악의')} ${val}</div>`;\n      d.onclick=()=>{if(_salSel.has(i))_salSel.delete(i);else _salSel.add(i);renderForge()};\n      itemGrid.appendChild(d);\n    });\n    if(salCnt===0){const e=document.createElement('div');e.style.cssText='grid-column:1/-1;text-align:center;padding:20px;color:#554433;font-size:.95rem';e.textContent=_T('분해할 아이템이 없습니다.');itemGrid.appendChild(e)}\n    grid.appendChild(itemGrid);\n    // 하단 요약 + 분해 버튼\n    const selArr=[..._salSel].filter(i=>i<INV.bag.length);\n    const totalMats=selArr.reduce((s,i)=>s+_salVal(INV.bag[i]),0);\n    const sumDiv=document.createElement('div');sumDiv.style.cssText='text-align:center;padding:10px;border-top:1px solid #332211';\nsumDiv.innerHTML=`<div style=\"color:#aa8855;font-size:.9rem;margin-bottom:6px\">`+_L('선택','Selected')+` <span style=\"color:#ff6644;font-weight:700\">${selArr.length}</span>`+_L('개 ->','  ->')+` <span style=\"color:#cc66ff;font-weight:700\">${totalMats}</span> `+_L('악의 획득 예상','Malice expected')+`</div>`;\n    if(selArr.length>0){\n      const btn=document.createElement('button');\n      btn.style.cssText='display:block;margin:0 auto;padding:10px 28px;font-size:1rem;font-family:\"Noto Sans KR\";font-weight:700;cursor:pointer;border:2px solid #cc3322;background:linear-gradient(180deg,rgba(204,51,34,.2),rgba(100,20,10,.4));color:#ff6644;border-radius:6px;letter-spacing:.1em';\nbtn.textContent=_L(\"분해 ({p0}개 -> 악의 {p1})\",\"Salvage ({p0} -> {p1} Malice)\",{p0:selArr.length,p1:totalMats});\n      btn.onmouseenter=()=>{btn.style.borderColor='#ff6644';btn.style.boxShadow='0 0 16px #cc332244'};\n      btn.onmouseleave=()=>{btn.style.borderColor='#cc3322';btn.style.boxShadow='none'};\n      btn.onclick=async()=>{\n        if(!await gameConfirm(_L(\"{p0}개 아이템을 분해합니다.<br>{p1} {p2} 악의 획득.<br><br>{p3} 복구 불가!\",\"Salvage {p0} items.<br>{p1} {p2} Malice gained.<br><br>{p3} Cannot undo!\",{p0:selArr.length,p1:_glyph('demon','#cc66ff',15),p2:totalMats,p3:_glyph('warn','#ff6644',15)}),null,null,true))return;\n        const idxs=[...selArr].sort((a,b)=>b-a);\n        idxs.forEach(i=>INV.bag.splice(i,1));\n        G.mats+=totalMats;\n        _salSel.clear();\n        SFX.forge();addTxt(P.x,P.y-20,'👿 +'+totalMats+_L(' 악의',' Malice'),'#cc66ff',80);addParts(P.x,P.y,'#ff4422',20);\n        G.shake=3;renderForge();dbSaveNow();\n      };\n      sumDiv.appendChild(btn);\n    }\n    grid.appendChild(sumDiv);\n\n  }else if(G.forgeTab==='reroll'){\n    // ═══ 리롤 — 접두/접미 재설정 ═══\n    grid.style.gridTemplateColumns='1fr';\n    const rHdr=document.createElement('div');rHdr.style.cssText='color:#44ccff;font-size:1rem;font-weight:700;margin-bottom:8px;letter-spacing:.1em;text-align:center';\nrHdr.textContent=_L('리롤 — 접두/접미 재설정 | 악의 '+REROLL_COST,'Reroll — Reset prefix/suffix | Malice '+REROLL_COST);grid.appendChild(rHdr);\n    const eqList=document.createElement('div');eqList.style.cssText='display:flex;flex-direction:column;gap:4px;margin-bottom:8px;max-height:280px;overflow-y:auto';\n    SLOT_NAMES.forEach((slot,i)=>{\n      const it=INV.equipped[slot];\n      const d=document.createElement('div');\n      const canReroll=it&&(it.rarity||0)>=1;\n      const isSel=_rerollSel===slot;\n      d.style.cssText=`padding:6px 10px;border:1px solid ${isSel?'#44ccff':canReroll?'#332211':'#1a1100'};background:${isSel?'rgba(68,204,255,.1)':'rgba(0,0,0,.25)'};cursor:${canReroll?'pointer':'default'};opacity:${canReroll?1:.4};border-radius:3px;display:flex;align-items:center;gap:6px`;\n      if(it){\n        const rc=RARITY_C[it.rarity||0];\n        let info=`<span style=\"color:${rc};font-weight:700\">${_slotGlyph(i,rc,15)} ${itemDispName(it)}${it.enh?' <span style=\"color:'+enhColor(it.enh)+'\">+'+it.enh+'</span>':''}</span>`;\n        const afxHtml=it.affixes&&it.affixes.length?it.affixes.map(af=>'<span style=\"color:'+(AFFIX_POOL.find(a=>a.id===af.id&&a.type===0)?'#66ddff':'#ffcc44')+';font-size:.75rem\">['+_T(AFFIX_NAMES_KO[af.id]||af.id)+' '+_affixValStr(af)+']</span>').join(' '):'';\n        if(afxHtml)info+=' '+afxHtml;\n        else if(canReroll)info+=` <span style=\"color:#554433;font-size:.75rem\">${_T('어픽스 없음')}</span>`;\n        d.innerHTML=info;\n      }else{\n        d.innerHTML=`<span style=\"color:#443322\">${_slotGlyph(i,'#5a4a38',15)} ${_slotName(i)} — ${_T('비어있음')}</span>`;\n      }\n      if(canReroll)d.onclick=()=>{_rerollSel=slot;renderForge()};\n      eqList.appendChild(d);\n    });\n    grid.appendChild(eqList);\n    if(_rerollSel&&INV.equipped[_rerollSel]){\n      const rIt=INV.equipped[_rerollSel];\n      const detDiv=document.createElement('div');detDiv.style.cssText='padding:12px;background:rgba(0,0,0,.35);border:1px solid #44ccff;border-radius:6px';\n      const rc=RARITY_C[rIt.rarity||0];\n      const _afxHtml=rIt.affixes&&rIt.affixes.length?rIt.affixes.map(af=>{const p=AFFIX_POOL.find(a=>a.id===af.id);const c=p&&p.type===0?'#66ddff':'#ffcc44';return'<div style=\"color:'+c+';font-size:.85rem\">'+_T(AFFIX_NAMES_KO[af.id]||af.id)+' '+_affixValStr(af)+'</div>'}).join(''):'<div style=\"color:#554433;font-size:.85rem\">'+_T('어픽스 없음')+'</div>';\n      let _implHtml='';\n      if(rIt._implicitKo&&rIt._implicitVal!==undefined){_implHtml='<div style=\"color:#aaddff;font-size:.8rem\">\\u25C6 '+_T(rIt._implicitKo).replace('X',rIt._implicitVal)+'</div>'}\n      let _legHtml='';\n      if(rIt.legendarySpecial){_legHtml='<div style=\"color:#ffaa00;font-size:.8rem;margin-top:4px\">\\u25C8 '+_T(rIt.legendarySpecial.ko)+'</div>'}\n      detDiv.innerHTML=`<div style=\"text-align:center;color:${rc};font-size:1rem;font-weight:700;margin-bottom:8px\">${_itemIco(rIt,rc,15)} ${itemDispName(rIt)}${rIt.enh?' <span style=\"color:'+enhColor(rIt.enh)+'\">+'+rIt.enh+'</span>':''}</div>\n        ${_implHtml}<div style=\"margin-bottom:10px;text-align:center\">${_afxHtml}</div>${_legHtml}`;\n      const btnRow=document.createElement('div');btnRow.style.cssText='display:flex;gap:6px;justify-content:center;flex-wrap:wrap';\n      const mkBtn=(label,cost,fn)=>{\n        const ok=G.mats>=cost;\n        const b=document.createElement('button');\n        b.style.cssText=`padding:8px 16px;font-size:.9rem;font-family:\"Noto Sans KR\";font-weight:700;cursor:${ok?'pointer':'not-allowed'};border:2px solid ${ok?'#44ccff':'#332211'};background:${ok?'linear-gradient(180deg,rgba(68,204,255,.12),rgba(30,80,120,.3))':'rgba(0,0,0,.3)'};color:${ok?'#88ddff':'#554433'};border-radius:6px;transition:all .15s`;\n        b.textContent=label+' 👿'+cost;\n        if(ok){b.onmouseenter=()=>{b.style.borderColor='#88eeff';b.style.boxShadow='0 0 12px #44ccff44'};b.onmouseleave=()=>{b.style.borderColor='#44ccff';b.style.boxShadow='none'};b.onclick=fn}\n        return b;\n      };\n      btnRow.appendChild(mkBtn(_L('어픽스 리롤','Affix Reroll'),REROLL_COST,()=>{if(G.mats<REROLL_COST){notify(_T('악의 부족!'));return}G.mats-=REROLL_COST;rerollAffixes(rIt);SFX.forge();addTxt(P.x,P.y-20,_T('어픽스 리롤!'),'#44ccff',60);recalcSt();applyStats();renderForge();dbSaveNow()}));\n      detDiv.appendChild(btnRow);\n      grid.appendChild(detDiv);\n    }\n\n  }else if(G.forgeTab==='crystal'){\n    // ═══ 결정 강화 / 합성 / 분해·제작 ═══\n    grid.style.gridTemplateColumns='1fr';\n    // 서브탭\n    const cSubBar=document.createElement('div');cSubBar.style.cssText='display:flex;gap:4px;margin-bottom:8px;justify-content:center';\n[['enhance','강화','Enhance'],['synth','합성','Synthesize'],['decomp','분해/제작','Decompose / Craft']].forEach(([k,ko,en])=>{\n      const b=document.createElement('div');b.style.cssText='padding:3px 10px;font-size:.85rem;cursor:pointer;border:1px solid '+(_crForgeTab===k?'#bb88ff':'#443322')+';color:'+(_crForgeTab===k?'#ddaaff':'#887766')+';background:'+(_crForgeTab===k?'rgba(187,136,255,.12)':'rgba(0,0,0,.2)')+';border-radius:3px';\n      b.textContent=_L(ko,en);b.onclick=()=>{_crForgeTab=k;_crForgeSel=-1;renderForge()};cSubBar.appendChild(b);\n    });\n    grid.appendChild(cSubBar);\n    // 보유 표시\n    const cInfo=document.createElement('div');cInfo.style.cssText='text-align:center;font-size:.85rem;color:#887766;margin-bottom:6px';\ncInfo.innerHTML=_L('보유: ','Owned: ')+CRYSTAL_BAG.length+'/'+CRYSTAL_BAG_MAX+' | '+_L('가루: ','Dust: ')+'<span style=\"color:#cc88ff\">'+CRYSTAL_DUST+'</span> | '+_L('악의: ','Malice: ')+'<span style=\"color:#cc66ff\">'+G.mats+'</span>';\n    grid.appendChild(cInfo);\n    const cFilters=document.createElement('div');cFilters.id='crForgeFilters';\n    cFilters.style.cssText='display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:6px';\n    [['all','전체','All'],['atk','공격','Attack'],['def','방어','Defense'],['acc','자원','Resource']].forEach(([key,ko,en])=>{\n      const active=_crForgeFilter===key,b=document.createElement('button');\n      b.type='button';b.setAttribute('aria-pressed',String(active));\n      b.style.cssText='padding:5px 16px;font:inherit;cursor:pointer;border:1px solid '+(active?'#bb88ff':'#443322')+';color:'+(active?'#ddaaff':'#aa9988')+';background:'+(active?'rgba(187,136,255,.12)':'rgba(0,0,0,.2)')+';border-radius:4px';\n      b.textContent=_L(ko,en);b.onclick=()=>{_crForgeFilter=key;_crForgeSel=-1;_crCraftType=null;renderForge()};cFilters.appendChild(b);\n    });\n    grid.appendChild(cFilters);\n    const cHint=document.createElement('div');cHint.style.cssText='text-align:center;color:#aa9988;font-size:.8rem;margin-bottom:8px';\n    cHint.textContent=_L('일괄 작업은 선택한 분류에만 적용됩니다. 장착·해제는 인벤의 장비 소켓에서 가능합니다.','Bulk actions affect the selected category. Equip or detach crystals through inventory sockets.');\n    grid.appendChild(cHint);\n    const crystalGroups=_crBagGroups(_crForgeFilter);\n\n    if(_crForgeTab==='enhance'){\n      // ── 일괄강화 버튼 ──\n      const _canBulkEnh=(()=>{for(let i=0;i<CRYSTAL_BAG.length;i++){const cr=CRYSTAL_BAG[i];if(!_crForgeMatches(cr)||(cr.enh||0)>=20)continue;const cost=crystalEnhCost(cr);if(G.mats<cost)continue;if(CRYSTAL_BAG.findIndex((c,ci)=>ci!==i&&c.id===cr.id&&c.star===cr.star)>=0)return true}return _crBagGroups(_crForgeFilter,true).some(g=>g.star<4&&g.idxs.length>=3)})();\n      const bulkEnhBtn=document.createElement('button');\n      bulkEnhBtn.style.cssText='width:100%;margin-bottom:8px;padding:6px 12px;font-size:.85rem;font-family:\"Noto Sans KR\";font-weight:700;cursor:'+(_canBulkEnh?'pointer':'not-allowed')+';border:2px solid '+(_canBulkEnh?'#bb88ff':'#443322')+';background:'+(_canBulkEnh?'rgba(187,136,255,.12)':'rgba(0,0,0,.2)')+';color:'+(_canBulkEnh?'#ffcc44':'#554433')+';border-radius:4px';\n      bulkEnhBtn.textContent=_T('일괄강화+합성');bulkEnhBtn.disabled=!_canBulkEnh;\n      bulkEnhBtn.onclick=()=>{\n        if(!_canBulkEnh)return;\n        let _enhCnt=0,_synthCnt=0;\n        // 반복: 강화 → 합성 → 더 이상 못할 때까지\n        while(true){\n          let _didAny=false;\n          // 1) 강화: 같은 id+star 재료를 먹여서 +1\n          while(true){\n            let _did=false;\n            for(let i=0;i<CRYSTAL_BAG.length;i++){\n              const cr=CRYSTAL_BAG[i];if(!_crForgeMatches(cr)||(cr.enh||0)>=20)continue;\n              const cost=crystalEnhCost(cr);if(G.mats<cost)continue;\n              const _fi=CRYSTAL_BAG.findIndex((c,ci)=>ci!==i&&c.id===cr.id&&c.star===cr.star);\n              if(_fi<0)continue;\n              G.mats-=cost;CRYSTAL_BAG.splice(_fi,1);if(i>_fi)i--;\n              cr.enh=(cr.enh||0)+1;_enhCnt++;_did=true;_didAny=true;break;\n            }\n            if(!_did)break;\n          }\n          // 2) 합성: 같은 id+star 3개 → 1성급 상승 (강화 리셋)\n          while(true){\n            const _g={};\n            CRYSTAL_BAG.forEach((cr,i)=>{if(!_crForgeMatches(cr)||cr.star>=4)return;const k=cr.id+'_'+cr.star;if(!_g[k])_g[k]={id:cr.id,star:cr.star,idxs:[]};_g[k].idxs.push(i)});\n            let _did2=false;\n            for(const k in _g){const _gr=_g[k];if(_gr.idxs.length<3)continue;\n              const _times=~~(_gr.idxs.length/3);\n              _gr.idxs.slice(0,_times*3).sort((a,b)=>b-a).forEach(ri=>CRYSTAL_BAG.splice(ri,1));\n              for(let t=0;t<_times;t++){CRYSTAL_BAG.push({id:_gr.id,star:_gr.star+1,enh:0});_synthCnt++}\n              _did2=true;_didAny=true;break}\n            if(!_did2)break;\n          }\n          if(!_didAny)break;\n        }\n        if(_enhCnt+_synthCnt>0){SFX.forge();\n          if(_enhCnt>0)addTxt(P.x,P.y-20,_T('강화')+' ×'+_enhCnt,'#bb88ff',60);\n          if(_synthCnt>0)addTxt(P.x,P.y-40,_T('합성')+' ×'+_synthCnt,'#ffdd66',60);\n          _crForgeSel=-1;applyStats();renderForge();dbSaveNow()}\n      };\n      grid.appendChild(bulkEnhBtn);\n      // ── 결정 강화 ──\n      const cList=document.createElement('div');cList.id='crForgeList';cList.style.cssText='display:flex;flex-direction:column;gap:2px;max-height:32vh;overflow-y:auto;margin-bottom:8px';\n      crystalGroups.forEach(group=>{\n        const i=group.idxs.includes(_crForgeSel)?_crForgeSel:group.idxs[0],cr=CRYSTAL_BAG[i];\n        const d=CRYSTAL_DEFS[cr.id],s=CRYSTAL_STAR[cr.star],sel=_crForgeSel===i;\n        const row=document.createElement('div');row.style.cssText='cursor:pointer;display:flex;align-items:center;gap:6px;padding:4px 8px;border:1px solid '+(sel?'#bb88ff':'#332211')+';background:'+(sel?'rgba(187,136,255,.12)':'rgba(0,0,0,.2)')+';border-radius:3px';\n        row.innerHTML='<span>'+_crIco(d,16)+'</span><span style=\"color:'+s.color+';font-size:.85rem;font-weight:700\">'+_crStarN(s)+'</span><span style=\"color:#ccaa88;font-size:.85rem\">'+_crDefN(d)+'</span>'+(cr.enh>0?'<span style=\"color:#44ccff;font-size:.8rem\">+'+cr.enh+'</span>':'')+'<span style=\"color:#ddbb88;font-size:.85rem\">×'+group.idxs.length+'</span><span style=\"color:#88cc88;font-size:.8rem;margin-left:auto\">'+_crValStr(cr)+'</span>';\n        row.onclick=()=>{_crForgeSel=i;renderForge()};cList.appendChild(row);\n      });\n      if(crystalGroups.length===0){const em=document.createElement('div');em.style.cssText='color:#554433;text-align:center;padding:20px';em.textContent=_L('이 분류에 결정이 없습니다','No crystals in this category');cList.appendChild(em)}\n      grid.appendChild(cList);\n      // 선택된 결정 상세+강화 버튼\n      if(_crForgeSel>=0&&_crForgeSel<CRYSTAL_BAG.length){\n        const cr=CRYSTAL_BAG[_crForgeSel],d=CRYSTAL_DEFS[cr.id],s=CRYSTAL_STAR[cr.star];\n        const cost=crystalEnhCost(cr),maxed=(cr.enh||0)>=20;\n        // 동급 결정 재료 체크 (같은 id + 같은 star, 자기 자신 제외)\n        const _feedIdx=CRYSTAL_BAG.findIndex((c,ci)=>ci!==_crForgeSel&&c.id===cr.id&&c.star===cr.star);\n        const hasFeed=_feedIdx>=0;\n        const ok=!maxed&&G.mats>=cost&&hasFeed;\n        const det=document.createElement('div');det.style.cssText='padding:8px;border:1px solid #553388;border-radius:4px;background:rgba(100,0,200,.06)';\n        det.innerHTML='<div style=\"color:'+s.color+';font-size:1rem;font-weight:700;margin-bottom:4px\">'+_crIco(d,16)+' '+_crStarN(s)+' '+_crDefN(d)+(cr.enh>0?' <span style=\"color:#44ccff\">+'+cr.enh+'</span>':'')+'</div>'\n          +'<div style=\"color:#88cc88;font-size:.9rem\">'+_T('현재')+': '+_crValStr(cr)+'</div>'\n          +(maxed?'<div style=\"color:#ffaa00;font-size:.85rem;margin-top:4px\">'+_T('최대 강화 달성 (+20)')+'</div>'\n          :'<div style=\"color:#aaaaaa;font-size:.85rem;margin-top:4px\">'+_T('강화 시')+': '+_crValStr({...cr,enh:(cr.enh||0)+1})+'</div>'\n          +'<div style=\"color:#cc66ff;font-size:.85rem\">'+_L('비용','Cost')+': 👿'+cost+' + 💎'+_crStarN(s)+' '+_crDefN(d)+' ×1'\n          +(ok?'':(!hasFeed?' <span style=\"color:#ff4444\">'+_L('(재료 결정 없음)','(no feed crystal)')+'</span>':' <span style=\"color:#ff4444\">'+_L('(악의 부족)','(insufficient)')+'</span>'))+'</div>');\n        if(!maxed){\n          const btn=document.createElement('button');btn.style.cssText='margin-top:6px;padding:6px 24px;font-size:.9rem;font-family:\"Noto Sans KR\";font-weight:700;cursor:'+(ok?'pointer':'not-allowed')+';border:2px solid '+(ok?'#bb88ff':'#443322')+';background:'+(ok?'rgba(187,136,255,.15)':'rgba(0,0,0,.2)')+';color:'+(ok?'#ffcc44':'#554433')+';border-radius:6px';\n          btn.textContent=_T('강화')+' ('+_L('악의 ','Malice ')+cost+' + '+_L('결정 ×1','Crystal ×1')+')';\n          btn.onclick=()=>{if(G.mats<cost||!hasFeed)return;G.mats-=cost;\n            // 재료 결정 소모 (다시 찾기 — 인덱스 변동 대비)\n            const _fi=CRYSTAL_BAG.findIndex((c,ci)=>ci!==_crForgeSel&&c.id===cr.id&&c.star===cr.star);\n            if(_fi>=0){CRYSTAL_BAG.splice(_fi,1);if(_crForgeSel>_fi)_crForgeSel--}\n            cr.enh=(cr.enh||0)+1;SFX.forge();addTxt(P.x,P.y-20,_crDefN(d)+' +'+cr.enh+'!','#bb88ff',50);applyStats();renderForge();dbSaveNow()};\n          det.appendChild(btn);\n        }\n        grid.appendChild(det);\n      }\n    }else if(_crForgeTab==='synth'){\n      // ── 결정 합성: 같은 종류+같은 성급 3개 → 1성급 상승 ──\n      const hdr=document.createElement('div');hdr.style.cssText='color:#44ccff;font-size:.9rem;text-align:center;margin-bottom:6px';\n      hdr.textContent=_T('같은 종류·같은 성급 결정 3개 → 1성급 상승 (강화 리셋)');grid.appendChild(hdr);\n      // ── 최상위 일괄합성 버튼 ──\n      // 합성 가능 여부 미리 체크 (1회 이상 합성 가능하면 활성)\n      const _canBulk=(()=>{\n        const _g={};CRYSTAL_BAG.forEach(cr=>{if(!_crForgeMatches(cr)||cr.star>=4)return;const k=cr.id+'_'+cr.star;_g[k]=(_g[k]||0)+1});\n        for(const k in _g)if(_g[k]>=3)return true;\n        return false;\n      })();\n      const bulkBtn=document.createElement('button');\n      bulkBtn.style.cssText='width:100%;margin-bottom:8px;padding:6px 12px;font-size:.85rem;font-family:\"Noto Sans KR\";font-weight:700;cursor:'+(_canBulk?'pointer':'not-allowed')+';border:2px solid '+(_canBulk?'#ffcc44':'#443322')+';background:'+(_canBulk?'rgba(255,204,68,.12)':'rgba(0,0,0,.2)')+';color:'+(_canBulk?'#ffdd66':'#554433')+';border-radius:4px';\n      bulkBtn.textContent=_T('최상위 일괄합성');bulkBtn.disabled=!_canBulk;\n      bulkBtn.onclick=()=>{\n        if(!_canBulk)return;\n        let _total=0;\n        // 반복 합성: 더 이상 합성 가능한 그룹이 없을 때까지\n        while(true){\n          // 같은 id+star 그룹 집계 (낮은 star부터)\n          const _g={};\n          CRYSTAL_BAG.forEach((cr,i)=>{if(!_crForgeMatches(cr)||cr.star>=4)return;const k=cr.id+'_'+cr.star;if(!_g[k])_g[k]={id:cr.id,star:cr.star,idxs:[]};_g[k].idxs.push(i)});\n          // 합성 가능 그룹 찾기 (3개 이상)\n          let _synthedOne=false;\n          for(const k in _g){\n            const _gr=_g[k];\n            if(_gr.idxs.length<3)continue;\n            // 3개씩 합성 (여러 번 가능)\n            const _times=~~(_gr.idxs.length/3);\n            // 인덱스 내림차순 정렬 후 삭제\n            const _toRemove=_gr.idxs.slice(0,_times*3).sort((a,b)=>b-a);\n            _toRemove.forEach(ri=>CRYSTAL_BAG.splice(ri,1));\n            for(let t=0;t<_times;t++){\n              CRYSTAL_BAG.push({id:_gr.id,star:_gr.star+1,enh:0});\n              _total++;\n            }\n            _synthedOne=true;\n            break; // 인덱스 갱신 위해 다시 루프\n          }\n          if(!_synthedOne)break;\n        }\n        if(_total>0){\n          SFX.forge();\n          addTxt(P.x,P.y-20,_T('일괄합성 완료')+' ×'+_total,'#ffdd66',60);\n          _crForgeSel=-1;applyStats();renderForge();dbSaveNow();\n        }\n      };\n      grid.appendChild(bulkBtn);\n      // 합성 가능 그룹 찾기\n      const groups=_crBagGroups(_crForgeFilter,true);\n      let hasGroup=false;\n      for(const k in groups){const g=groups[k];if(g.idxs.length<3||g.star>=4)continue;hasGroup=true;\n        const d=CRYSTAL_DEFS[g.id],s=CRYSTAL_STAR[g.star],ns=CRYSTAL_STAR[g.star+1];\n        const row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:6px;padding:6px 8px;border:1px solid #553388;background:rgba(100,0,200,.06);border-radius:4px;margin-bottom:4px';\n        row.innerHTML='<span style=\"color:'+s.color+'\">'+_crIco(d,14)+' '+_crStarN(s)+' '+_crDefN(d)+' ×3 ('+_L('보유 ','Owned ')+g.idxs.length+')</span><span style=\"color:#887766\">→</span><span style=\"color:'+ns.color+';font-weight:700\">'+_crStarN(ns)+' '+_crDefN(d)+'</span>';\n        const btn=document.createElement('button');btn.style.cssText='margin-left:auto;padding:3px 12px;font-size:.8rem;font-family:\"Noto Sans KR\";cursor:pointer;border:1px solid #44ccff;background:rgba(68,204,255,.1);color:#88eeff;border-radius:4px';\n        btn.textContent=_T('합성');\n        btn.onclick=()=>{\n          const rem=g.idxs.slice(0,3).sort((a,b)=>b-a);\n          rem.forEach(ri=>CRYSTAL_BAG.splice(ri,1));\n          CRYSTAL_BAG.push({id:g.id,star:g.star+1,enh:0});\n          SFX.forge();addTxt(P.x,P.y-20,_crStarN(ns)+' '+_crDefN(d)+' '+_T('합성!'),ns.color,60);\n          _crForgeSel=-1;applyStats();renderForge();dbSaveNow();\n        };\n        row.appendChild(btn);grid.appendChild(row);\n      }\n      if(!hasGroup){const em=document.createElement('div');em.style.cssText='color:#554433;text-align:center;padding:20px';em.textContent=_T('합성 가능한 결정이 없습니다 (같은 종류·성급 3개 필요)');grid.appendChild(em)}\n    }else if(_crForgeTab==='decomp'){\n      // ── 분해 / 제작 ──\nconst secHdr1=document.createElement('div');secHdr1.style.cssText='color:#ff8844;font-size:.9rem;font-weight:700;margin-bottom:4px';secHdr1.textContent=_T('결정 분해 → 결정 가루');grid.appendChild(secHdr1);\n      const dList=document.createElement('div');dList.id='crDecompList';dList.style.cssText='display:flex;flex-direction:column;gap:2px;max-height:24vh;overflow-y:auto;margin-bottom:8px';\n      crystalGroups.forEach(group=>{\n        const i=group.idxs[0],cr=CRYSTAL_BAG[i];\n        const d=CRYSTAL_DEFS[cr.id],s=CRYSTAL_STAR[cr.star];\n        const dustGet=~~(CRYSTAL_DUST_COST[cr.star]*0.5);\n        const row=document.createElement('div');row.style.cssText='cursor:pointer;display:flex;align-items:center;gap:6px;padding:3px 8px;border:1px solid #332211;background:rgba(0,0,0,.2);border-radius:3px';\n        row.innerHTML='<span style=\"color:'+s.color+';font-size:.85rem\">'+_crIco(d,14)+' '+_crStarN(s)+' '+_crDefN(d)+(cr.enh>0?' +'+cr.enh:'')+' ×'+group.idxs.length+'</span><span style=\"color:#aa6644;font-size:.75rem;margin-left:auto\">'+_L('1개 분해','Decompose 1')+' → '+_T('가루')+' +'+dustGet+'</span>';\n        row.onclick=()=>{CRYSTAL_BAG.splice(i,1);CRYSTAL_DUST+=dustGet;_crForgeSel=-1;SFX.forge();addTxt(P.x,P.y-20,_T('분해! 가루 +')+dustGet,'#ff8844',50);renderForge();dbSaveNow()};\n        dList.appendChild(row);\n      });\n      if(crystalGroups.length===0){const em=document.createElement('div');em.style.cssText='color:#554433;text-align:center;padding:10px';em.textContent=_L('이 분류에 분해할 결정이 없습니다','No crystals to decompose in this category');dList.appendChild(em)}\n      grid.appendChild(dList);\n      // ── 제작 ──\n      const secHdr2=document.createElement('div');secHdr2.style.cssText='color:#44ff88;font-size:.9rem;font-weight:700;margin-bottom:4px;margin-top:8px;border-top:1px solid #332211;padding-top:6px';secHdr2.textContent=_T('결정 제작 (가루 → 결정)');grid.appendChild(secHdr2);\n      // 종류 선택\n      const typeBar=document.createElement('div');typeBar.style.cssText='display:flex;flex-wrap:wrap;gap:2px;margin-bottom:4px';\n      CRYSTAL_IDS.forEach(id=>{\n        const d=CRYSTAL_DEFS[id],sel=_crCraftType===id;\n        if(_crForgeFilter!=='all'&&d.cat!==_crForgeFilter)return;\n        const b=document.createElement('span');b.style.cssText='cursor:pointer;padding:1px 5px;font-size:.75rem;border:1px solid '+(sel?'#44ff88':'#332211')+';color:'+(sel?'#88ffaa':'#776655')+';background:'+(sel?'rgba(68,255,136,.1)':'rgba(0,0,0,.2)')+';border-radius:3px';\n        b.innerHTML=_crIco(d,14)+' '+_crDefN(d);b.onclick=()=>{_crCraftType=id;renderForge()};typeBar.appendChild(b);\n      });\n      grid.appendChild(typeBar);\n      // 성급 선택 + 제작 버튼\n      if(_crCraftType){\n        const cd=CRYSTAL_DEFS[_crCraftType];\n        const starBar=document.createElement('div');starBar.style.cssText='display:flex;gap:4px;margin-bottom:6px;align-items:center';\n        for(let si=0;si<5;si++){\n          const s=CRYSTAL_STAR[si],cost=CRYSTAL_DUST_COST[si],sel=_crCraftStar===si;\n          const b=document.createElement('span');b.style.cssText='cursor:pointer;padding:2px 8px;font-size:.8rem;border:1px solid '+(sel?s.color:'#332211')+';color:'+(sel?s.color:'#665544')+';background:'+(sel?'rgba(187,136,255,.1)':'rgba(0,0,0,.2)')+';border-radius:3px';\n          b.textContent=(si+1)+_L('성 ('+cost+'가루)','★ ('+cost+' Dust)');b.onclick=()=>{_crCraftStar=si;renderForge()};starBar.appendChild(b);\n        }\n        grid.appendChild(starBar);\n        const dustCost=CRYSTAL_DUST_COST[_crCraftStar],ok=CRYSTAL_DUST>=dustCost&&CRYSTAL_BAG.length<CRYSTAL_BAG_MAX;\n        const s=CRYSTAL_STAR[_crCraftStar];\n        const craftDiv=document.createElement('div');craftDiv.style.cssText='text-align:center;padding:6px';\n        craftDiv.innerHTML='<div style=\"color:'+s.color+';font-size:.9rem;font-weight:700\">'+_crIco(cd,15)+' '+_crStarN(s)+' '+_crDefN(cd)+'</div><div style=\"color:#887766;font-size:.8rem\">'+_L('제작 비용: 가루 ','Cost: Dust ')+dustCost+(CRYSTAL_DUST<dustCost?(' <span style=\"color:#ff4444\">'+_L('(부족)','(insufficient)')+'</span>'):'')+'</div>';\n        const btn=document.createElement('button');btn.style.cssText='margin-top:4px;padding:5px 20px;font-size:.85rem;font-family:\"Noto Sans KR\";font-weight:700;cursor:'+(ok?'pointer':'not-allowed')+';border:2px solid '+(ok?'#44ff88':'#332211')+';background:'+(ok?'rgba(68,255,136,.1)':'rgba(0,0,0,.2)')+';color:'+(ok?'#88ffcc':'#554433')+';border-radius:6px';\n        btn.textContent=_T('🔨 제작');\n        btn.onclick=()=>{if(!ok)return;CRYSTAL_DUST-=dustCost;CRYSTAL_BAG.push({id:_crCraftType,star:_crCraftStar,enh:0});SFX.forge();addTxt(P.x,P.y-20,_crStarN(s)+' '+_crDefN(cd)+' '+_T('제작!'),s.color,60);renderForge();dbSaveNow()};\n        craftDiv.appendChild(btn);grid.appendChild(craftDiv);\n      }\n      // ── 악의로 1성 결정 직접 제작 ──\n      const _crMatsCost=_malCost(50);\nconst secHdr3=document.createElement('div');secHdr3.style.cssText='color:#cc66ff;font-size:.9rem;font-weight:700;margin-bottom:4px;margin-top:8px;border-top:1px solid #332211;padding-top:6px';secHdr3.textContent=_L('악의로 1성 결정 제작 ('+_crMatsCost+' 악의)','Craft 1★ Crystal ('+_crMatsCost+' Malice)');grid.appendChild(secHdr3);\n      const mBar=document.createElement('div');mBar.style.cssText='display:flex;flex-wrap:wrap;gap:3px;margin-bottom:4px';\n      CRYSTAL_IDS.forEach(id=>{\n        const d=CRYSTAL_DEFS[id];\n        if(!d.craft||(_crForgeFilter!=='all'&&d.cat!==_crForgeFilter))return; // HP/MP/ST만 제작 가능, 나머지는 드랍\n        const ok2=G.mats>=_crMatsCost&&CRYSTAL_BAG.length<CRYSTAL_BAG_MAX;\n        const b=document.createElement('span');b.style.cssText='cursor:'+(ok2?'pointer':'not-allowed')+';padding:2px 6px;font-size:.8rem;border:1px solid '+(ok2?'#cc66ff':'#332211')+';color:'+(ok2?'#ddaaff':'#554433')+';background:'+(ok2?'rgba(200,100,255,.1)':'rgba(0,0,0,.2)')+';border-radius:3px';\n        b.innerHTML=_crIco(d,14)+' '+_crDefN(d);\n        b.onclick=()=>{if(G.mats<_crMatsCost){notify(_T('악의가 부족합니다!'));return}if(CRYSTAL_BAG.length>=CRYSTAL_BAG_MAX){notify(_T('결정 주머니 가득!'));return}G.mats-=_crMatsCost;CRYSTAL_BAG.push({id,star:0,enh:0});SFX.forge();addTxt(P.x,P.y-20,d.emoji+' '+_crStarN(CRYSTAL_STAR[0])+' '+_crDefN(d)+' '+_T('제작!'),'#cc66ff',50);renderForge();dbSaveNow()};\n        mBar.appendChild(b);\n      });\n      grid.appendChild(mBar);\n    }\n  }else if(G.forgeTab==='craft'){\n    // ═══ 제작 종합 — 모든 장비 한눈에 ═══\n    grid.style.gridTemplateColumns='1fr';\n    const _craftSlots=['weapon','bow','armor','shield','helmet','pants','gloves','boots','belt','necklace','ring','cape','bracelet','headband']; // ossuary 제외 (2026-09-01): 유니크 단일 지급 — 제작 불가\n    const _csNames={weapon:_L('무기','Weapon'),bow:_L('활','Bow'),armor:_L('갑옷','Armor'),shield:_L('견갑','Shield'),helmet:_L('왕관','Crown'),pants:_L('바지','Pants'),gloves:_L('장갑','Gloves'),boots:_L('부츠','Boots'),belt:_L('벨트','Belt'),necklace:_L('목걸이','Necklace'),ring:_L('반지','Ring'),cape:_L('망토','Cape'),bracelet:_L('팔찌','Bracelet'),headband:_L('귀걸이','Earring'),ossuary:_L('유골함','Ossuary')};\n    const _csEmoji={weapon:'⚔️',bow:'🏹',armor:'🦺',shield:'🛡️',helmet:'👑',pants:'👖',gloves:'🧤',boots:'👢',belt:'🥋',necklace:'📿',ring:'💍',cape:'🧣',bracelet:'⭕',headband:'🎀',ossuary:'⚱️'};\n    // 헤더\n    const chdr=document.createElement('div');chdr.style.cssText='text-align:center;padding:8px;color:#ffcc44;font-size:1.05rem;font-weight:700;letter-spacing:.15em';\n    chdr.textContent=_L('🔨 장비 제작','🔨 Equipment Crafting');\n    grid.appendChild(chdr);\n    // 비용·확률 정보\n    const cInfo=document.createElement('div');cInfo.style.cssText='text-align:center;padding:4px 8px;font-size:.85rem;color:#887766;margin-bottom:8px';\n    cInfo.innerHTML=_L('비용: ','Cost: ')+'<span style=\"color:#ffaa44;font-weight:700\">'+CRAFT_COST+'</span> '+_L('악의 &nbsp;|&nbsp; 보유: ','Malice per craft &nbsp;|&nbsp; Malice: ')+'<span style=\"color:#cc66ff;font-weight:700\">'+G.mats+'</span><br><span style=\"color:'+RARITY_C[3]+'\">'+_T('영웅')+'90%</span> &nbsp; <span style=\"color:'+RARITY_C[4]+'\">'+_T('전설')+'10%</span>';\n    grid.appendChild(cInfo);\n    // 장비 카드 그리드\n    const cGrid=document.createElement('div');cGrid.style.cssText='display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:4px';\n    _craftSlots.forEach(sl=>{\n      const curEq=sl==='ring'?INV.equipped.ring1||INV.equipped.ring2:sl==='headband'?INV.equipped.headband||INV.equipped.headband2:INV.equipped[sl];\n      const card=document.createElement('div');\n      card.style.cssText='cursor:pointer;padding:8px 4px;text-align:center;background:rgba(0,0,0,.3);border:1px solid #443322;border-radius:6px;transition:all .15s';\n      card.onmouseenter=()=>{card.style.borderColor='#bb44ff';card.style.boxShadow='0 0 8px #bb44ff33'};\n      card.onmouseleave=()=>{card.style.borderColor='#443322';card.style.boxShadow='none'};\n      let curTxt='';\n      if(curEq)curTxt='<div style=\"color:'+RARITY_C[curEq.rarity||0]+';font-size:.7rem;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis\">'+_T(curEq.name)+'</div>';\n      else curTxt='<div style=\"color:#443322;font-size:.7rem;margin-top:3px\">—</div>';\n      card.innerHTML='<div style=\"font-size:1.3rem\">'+(_csEmoji[sl]||'')+'</div><div style=\"color:#ccaa77;font-size:.8rem;font-weight:700\">'+_csNames[sl]+'</div>'+curTxt;\n      card.onclick=()=>{G.forgeTab=sl;_forgeSel=null;renderForge()};\n      cGrid.appendChild(card);\n    });\n    grid.appendChild(cGrid);\n    // 하단 안내\n    const cTip=document.createElement('div');cTip.style.cssText='text-align:center;padding:6px;font-size:.78rem;color:#665544;margin-top:6px';\n    cTip.textContent=_L('슬롯을 클릭하면 제작, 좌측에서 개별 선택도 가능','Click a slot to craft, or expand ▶ to pick from sidebar');\n    grid.appendChild(cTip);\n  }else{\n    // ═══ 장비 제작 — 개별 슬롯 ═══\n    grid.style.gridTemplateColumns='1fr';\n    const slot=G.forgeTab;\n    const tier=Math.min(SI_TO_HELL[G.stage],4);\n    const slotNames={weapon:_L('무기','Weapon'),shield:_L('견갑','Shield'),armor:_L('갑옷','Armor'),helmet:_L('왕관','Crown'),boots:_L('부츠','Boots'),bow:_L('활','Bow'),gloves:_L('장갑','Gloves'),pants:_L('바지','Pants'),belt:_L('벨트','Belt'),necklace:_L('목걸이','Necklace'),ring:_L('반지','Ring'),cape:_L('망토','Cape'),bracelet:_L('팔찌','Bracelet'),headband:_L('귀걸이','Earring'),ossuary:_L('유골함','Ossuary')};\n    const slotEmoji={weapon:'⚔️',shield:'🛡️',armor:'🦺',helmet:'👑',boots:'👢',bow:'🏹',gloves:'🧤',pants:'👖',belt:'🥋',necklace:'📿',ring:'💍',cape:'🧣',bracelet:'⭕',headband:'🎀',ossuary:'⚱️'};\n\n    // 현재 장착 표시\n    const curEq=slot==='ring'?INV.equipped.ring1||INV.equipped.ring2:slot==='headband'?INV.equipped.headband||INV.equipped.headband2:INV.equipped[slot];\n    const curDiv=document.createElement('div');\n    curDiv.style.cssText='text-align:center;padding:8px;margin-bottom:8px;background:rgba(0,0,0,.3);border:1px solid #332211;border-radius:4px';\n    if(curEq){\n      curDiv.innerHTML=`<div style=\"color:#887766;font-size:.8rem;margin-bottom:4px\">${_T('현재 장착')}</div><div style=\"color:${RARITY_C[curEq.rarity||0]};font-size:.95rem;font-weight:700\">${_itemIco(curEq,RARITY_C[curEq.rarity||0],15)} ${_T(curEq.name)}</div><div style=\"color:#776655;font-size:.95rem;margin-top:2px\">ATK:${curEq.atk||'-'} DEF:${curEq.def||'-'} ${_T(ELN[curEq.el]||'물리')}</div>`;\n    }else{\n      curDiv.innerHTML=`<div style=\"color:#554433;font-size:.8rem\">${_T('현재 장착')}</div><div style=\"color:#665544;font-size:.95rem\">${_T('없음 — 제작하세요!')}</div>`;\n    }\n    grid.appendChild(curDiv);\n\n    // 헤더\n    const hdr=document.createElement('div');\n    hdr.style.cssText='text-align:center;padding:6px;color:#ffcc44;font-size:1rem;font-weight:700;letter-spacing:.15em';\n    hdr.textContent=`🔨 ${slotEmoji[slot]} ${slotNames[slot]}`+_L(' 제작',' Craft').trimEnd();\n    grid.appendChild(hdr);\n\n    // 보유 악의 표시\n    const matsDiv=document.createElement('div');\n    matsDiv.style.cssText='text-align:center;padding:4px;font-size:.95rem;color:#776655';\nmatsDiv.innerHTML=_L('보유 악의: ','Malice: ')+`<span style=\"color:#cc66ff;font-weight:700\">${G.mats}</span> &nbsp;|&nbsp; `+_L('제작 비용: ','Cost: ')+`<span style=\"color:#ffaa44;font-weight:700\">${CRAFT_COST}</span>`;\n    grid.appendChild(matsDiv);\n\n    // 레어리티 확률 (영웅 90%, 전설 10%)\n    const distDiv=document.createElement('div');\n    distDiv.style.cssText='margin:10px auto;width:90%;max-width:300px;padding:8px;background:rgba(0,0,0,.3);border:1px solid #221100;border-radius:4px';\n    distDiv.innerHTML=`<div style=\"color:#776655;font-size:.95rem;margin-bottom:6px;text-align:center\">${_T('제작 확률')}</div>\n      <div style=\"display:flex;align-items:center;gap:4px;margin:2px 0\"><span style=\"color:${RARITY_C[3]};font-size:.95rem;width:28px;text-align:right\">${_T('영웅')}</span><div style=\"flex:1;height:8px;background:rgba(0,0,0,.4);border-radius:3px;overflow:hidden\"><div style=\"height:100%;width:90%;background:${RARITY_C[3]};border-radius:3px;opacity:.7\"></div></div><span style=\"color:#776655;font-size:1rem;width:28px\">90%</span></div>\n      <div style=\"display:flex;align-items:center;gap:4px;margin:2px 0\"><span style=\"color:${RARITY_C[4]};font-size:.95rem;width:28px;text-align:right\">${_T('전설')}</span><div style=\"flex:1;height:8px;background:rgba(0,0,0,.4);border-radius:3px;overflow:hidden\"><div style=\"height:100%;width:10%;background:${RARITY_C[4]};border-radius:3px;opacity:.7\"></div></div><span style=\"color:#776655;font-size:1rem;width:28px\">10%</span></div>`;\n    grid.appendChild(distDiv);\n\n    // 제작 버튼\n    const ok=G.mats>=CRAFT_COST;\n    const btn=document.createElement('button');\n    btn.style.cssText=`display:block;margin:12px auto;padding:12px 32px;font-size:1.1rem;font-family:'Noto Sans KR';font-weight:700;cursor:${ok?'pointer':'not-allowed'};border:2px solid ${ok?'#bb44ff':'#332211'};background:${ok?'linear-gradient(180deg,rgba(187,68,255,.15),rgba(68,17,100,.3))':'rgba(0,0,0,.3)'};color:${ok?'#ffcc44':'#554433'};border-radius:8px;transition:all .15s;letter-spacing:.1em`;\n    btn.textContent=_L(\"🔨 제작 (👿{p0})\",\"🔨 Craft (👿{p0})\",{p0:CRAFT_COST});\n    btn.onmouseenter=()=>{if(ok)btn.style.borderColor='#ffaa44';btn.style.boxShadow='0 0 12px #bb44ff44'};\n    btn.onmouseleave=()=>{btn.style.borderColor=ok?'#bb44ff':'#332211';btn.style.boxShadow='none'};\n    btn.onclick=function(_ev){\n      var _cnt=(_ev&&(_ev.shiftKey||_ev.ctrlKey))?10:1;\n      var _done=0;\n      for(var _ci=0;_ci<_cnt;_ci++){\n        if(G.mats<CRAFT_COST)break;\n        G.mats-=CRAFT_COST;\n        const rEl=[EL.P,EL.F,EL.I,EL.D,EL.L,EL.H][~~(Math.random()*6)];\n        const rar=Math.random()<0.90?3:4;\n        const craftSlot=slot==='ring'?(!INV.equipped.ring1?'ring1':!INV.equipped.ring2?'ring2':'ring1'):slot==='headband'?_equipSlot({slot:'headband'}):slot;\n        const wt=craftSlot==='weapon'?WTYPE_KEYS[~~(Math.random()*WTYPE_KEYS.length)]:craftSlot==='bow'?BTYPE_KEYS[~~(Math.random()*BTYPE_KEYS.length)]:undefined;\n        const item=mkItem(craftSlot,tier,rEl,rar,wt);\n        if(!INV.equipped[craftSlot]){\n          INV.equipped[craftSlot]=item;\n          SFX.pickup();playEquipSfx(item);notify(`${_rarName(rar)} ${_T(item.name)} ${_T('자동 장착!')}`);\n          recalcSt();applyStats();\n        }else{\n          pickupItem(item);\n        }\n        _done++;\n      }\n      if(_done===0){notify(_T('악의가 부족합니다!'));return}\n      if(_done>1)notify(_done+_L('개 제작 완료!',' items crafted!'));\n      G.shake=4;SFX.pickup();\n      renderForge();\n    };\n    grid.appendChild(btn);\n\n    // 무기/활 타입 표시\n    if(slot==='weapon'){\n      const wtDiv=document.createElement('div');\n      wtDiv.style.cssText='margin:6px auto;width:90%;text-align:center;color:#776655;font-size:.95rem';\n      wtDiv.innerHTML=_T('무기 타입')+': '+WTYPE_KEYS.map(k=>`<span style=\"color:#aa8855\">${WTYPES[k].emoji}${_T(WTYPES[k].name)}</span>`).join(' ');\n      grid.appendChild(wtDiv);\n    }else if(slot==='bow'){\n      const bwDiv=document.createElement('div');\n      bwDiv.style.cssText='margin:6px auto;width:90%;text-align:center;color:#776655;font-size:.95rem';\n      bwDiv.innerHTML=_T('활 타입')+': '+BTYPE_KEYS.map(k=>`<span style=\"color:#aa8855\">${BOWTYPES[k].emoji}${_T(BOWTYPES[k].name)}</span>`).join(' ');\n      grid.appendChild(bwDiv);\n    }\n  }\n}",
          "sha256": "6407a724ea6d9f1d9ba3f36dfc12d5b7f8a712ff2ada17320b7fac8f6066c2eb",
          "line": 48908
        },
        "enhRate": {
          "text": "function enhRate(n){\n  return Math.max(0.5,99*Math.pow(0.99,n)); // % 반환, 최소 0.5% 보장\n}",
          "sha256": "be2ef762d3119ae837dfcd3fa36c12792ec3061caa153d9ef2eb454c1e3ed703",
          "line": 26864
        },
        "enhCostRaw": {
          "text": "function enhCostRaw(n){\n  return Math.max(20000,Math.ceil((20000+n*3500)*1.5)); // 최소 2만(=1만악의), 0강=3만, 100강=55.5만, 1000강=528만\n}",
          "sha256": "861e2d4c7c9062ea551f00115e31ebc4d92113b756ecd0eae229717ae7170584",
          "line": 26873
        },
        "enhCost": {
          "text": "function enhCost(enh,rarity){\n  const rMul=[0.5,0.7,1.0,1.3,1.8][_itemEconomyRarity(rarity)];\n  return{rate:enhRate(enh)/100,cost:_malCost(Math.ceil(enhCostRaw(enh)*rMul))};\n}",
          "sha256": "fd942db7d954f6f72b5be4dcf79544975d73c57f49120439be0ed2e03e6467f9",
          "line": 26876
        },
        "_malCost": {
          "text": "function _malCost(v){\n  const _n=Number(v)||0;\n  if(_n<=0)return 0;\n  return Math.max(1,Math.ceil(_n*_MALICE_COST_MUL));\n}",
          "sha256": "b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f",
          "line": 26868
        },
        "_itemEconomyRarity": {
          "text": "function _itemEconomyRarity(r){return Number.isInteger(r)&&r>=0?Math.min(r,4):0;}",
          "sha256": "13ebcae9484f58bcc31664bb25cf22a2f489b186c2e85f3080d7fe6918f57509",
          "line": 26973
        },
        "enhColor": {
          "text": "function enhColor(enh){\n  if(enh>=1000)return'#ff00ff'; // 무지개\n  if(enh>=500) return'#ffdd00'; // 황금 오라\n  if(enh>=200) return'#ff0088'; // 분홍 불꽃\n  if(enh>=100) return'#ff4444'; // 진홍 파동\n  if(enh>=75)  return'#cc44ff'; // 보라 글로우\n  if(enh>=50)  return'#ff8844'; // 주황\n  if(enh>=25)  return'#ffcc00'; // 황금\n  if(enh>=10)  return'#44aaff'; // 하늘\n  return'#44ff88';              // 초록 기본\n}",
          "sha256": "8c9fd0ddcd814e6e37e454f73bd84a61d542b3b440b98e4d75a2a3c6cd7994dc",
          "line": 26892
        },
        "enhRateColor": {
          "text": "function enhRateColor(rate){\n  if(rate>=0.7) return'#44ff44';\n  if(rate>=0.4) return'#ffdd44';\n  if(rate>=0.1) return'#ff8844';\n  return'#ff4444';\n}",
          "sha256": "53595050c0028d4b5e4ab2c6063b056cb0555bba7645f67d4dbe7fe4ecb72507",
          "line": 26903
        },
        "enhMul": {
          "text": "function enhMul(n){\n  // DEF용: 1강당 +0.25\n  return n*0.25;\n}",
          "sha256": "abb1c531268f6c8abdfab448dc9fd3d55abac41e4bb1a64c779fa8139f30b763",
          "line": 26880
        },
        "enhMulAtk": {
          "text": "function enhMulAtk(n){\n  // ATK용: 1강당 +0.25 (2차반감 2026-05-03)\n  return n*0.25;\n}",
          "sha256": "af411c5d3f3593d0c77840e684474a560717d1505ce4cca404cb9c57a93b3ab9",
          "line": 26884
        }
      },
      "candidate": {
        "sha256": "c710f2d196f473fcb159af4e0d97a3099dcc86442466176afc04bbad3f35c5f0",
        "old": "if(G._aiTarget===undefined||G._aiTarget<=_curEnh)G._aiTarget=_curEnh+100;",
        "new": "if(!Number.isFinite(G._aiTarget)||G._aiTarget<=_curEnh)G._aiTarget=_curEnh+100;"
      },
      "panelPolicyBasis": "existing undefined/at-or-below currentEnh fallback=currentEnh+100; extend invalid target fallback, no new cap",
      "normalExpectedDisplay": 33135
    },
    {
      "file": "game-easy-test.html",
      "readAt": {
        "UTC": "2026-10-02T11:04:23.994Z",
        "KST": "2026-10-02T20:04:23.994+09:00"
      },
      "wholeSha256": "50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057",
      "functions": {
        "openPanel": {
          "text": "function openPanel(id){if(id==='invPanel')_inventoryFocus.begin();closeAllPanels(id==='invPanel');$(id).classList.add('on');G.paused=true;_injectPanelNav(id);if(id==='invPanel')renderInv();if(id==='settings')renderSettings();if(id==='forge')renderForge();if(id==='statPanel')renderStatPanel();if(id==='skillPanel')renderSkillPanel()}",
          "sha256": "29bdd418f6a59a84cbaac3ad31ee739fe436a9a1070420382a59ba1b2d6cf963",
          "line": 41400
        },
        "renderForge": {
          "text": "function renderForge(){\n  G.forgeOpen=true;\n  _ensureForgeAtlasLoad();\n  BGM.play('forge');\n$('forgeMats').textContent=`${_T('악의')}: ${G.mats}`;\n$('forgeLore').textContent=_T('🔴화염→빙결 2배 | 🔵빙결→화염 2배 | ⚪물리=중립 | 악마 처치 시 악의 영혼 드롭');\n  const tabs=$('fgTabs');tabs.innerHTML='';\n  tabs.classList.add('atlas-v1-ready','atlas-v2-ready');\n  const _fgTabMeta={\n    // v1 icon atlas (4x3): 0 anvil, 1 hammer, 2 tongs, 3 molten ingot\n    //                       4 furnace flame, 5 sharpening wheel, 6 shield, 7 blade\n    //                       8 rune crystal, 9 salvage scrap, 10 reroll spiral, 11 upgrade star\n    upgrade:{icon:'⭐',ko:'강화',en:'Enhance',si:11,atlas:'v1'},\n    potion:{icon:'🧪',ko:'물약',en:'Potion',si:3,atlas:'v1'},\n    salvage:{icon:'🔥',ko:'분해',en:'Salvage',si:9,atlas:'v1'},\n    reroll:{icon:'🔄',ko:'리롤',en:'Reroll',si:10,atlas:'v1'},\n    crystal:{icon:'💎',ko:'결정',en:'Crystal',si:8,atlas:'v1'},\n    weapon:{icon:'⚔️',ko:'무기',en:'Weapon',si:7,atlas:'v2'},\n    bow:{icon:'🏹',ko:'활',en:'Bow',si:7,atlas:'v2'},\n    armor:{icon:'🦺',ko:'갑옷',en:'Armor',si:0,atlas:'v2'},\n    shield:{icon:'🛡️',ko:'견갑',en:'Shield',si:6,atlas:'v2'},\n    helmet:{icon:'👑',ko:'왕관',en:'Crown',si:1,atlas:'v2'},\n    pants:{icon:'👖',ko:'바지',en:'Pants',si:0,atlas:'v2'},\n    gloves:{icon:'🧤',ko:'장갑',en:'Gloves',si:2,atlas:'v2'},\n    boots:{icon:'👢',ko:'부츠',en:'Boots',si:2,atlas:'v2'},\n    belt:{icon:'🥋',ko:'벨트',en:'Belt',si:3,atlas:'v2'},\n    necklace:{icon:'📿',ko:'목걸이',en:'Necklace',si:8,atlas:'v2'},\n    ring:{icon:'💍',ko:'반지',en:'Ring',si:10,atlas:'v2'},\n    cape:{icon:'🧣',ko:'망토',en:'Cape',si:4,atlas:'v2'},\n    bracelet:{icon:'⭕',ko:'팔찌',en:'Bracelet',si:5,atlas:'v2'},\n    headband:{icon:'🎀',ko:'귀걸이',en:'Earring',si:8,atlas:'v2'},\n    ossuary:{icon:'⚱️',ko:'유골함',en:'Ossuary',si:8,atlas:'v2'},\n    craft:{icon:'🔨',ko:'제작',en:'Craft',si:11,atlas:'v1'}\n  };\n  const _EQUIPMENT_TABS=new Set(['weapon','bow','armor','shield','helmet','pants','gloves','boots','belt','necklace','ring','cape','bracelet','headband','ossuary']);\n  ['upgrade','potion','salvage','reroll','crystal','craft','weapon','bow','armor','shield','helmet','pants','gloves','boots','belt','necklace','ring','cape','bracelet','headband'].forEach((k)=>{\n    if(_EQUIPMENT_TABS.has(k))return;\n    const _m=_fgTabMeta[k];\n    const _txt=_T(_m.ko);\n    const d=document.createElement('div');\n    d.className='fg-tab'+(G.forgeTab===k?' act':'');\n    const _hasV4=['upgrade','potion','salvage','reroll','crystal','craft'].indexOf(k)>=0;\n    if(_hasV4){\n      d.style.setProperty('--fg-tab-bg','url(output/imagegen/forge-tabs-v4/'+k+'.png?v=20260417-v4)');\n      d.classList.add('fg-tab-v4');\n      d.innerHTML='<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">'+_txt+'</span>';\n    }else{\n      const _v3='output/imagegen/forge-tabs-v3/'+k+'.png?v=20260416-v3set1';\n      const _fb=_forgeTabFallbackData(_m.icon);\n      d.innerHTML='<span class=\"fg-tab-ico\"><img class=\"fg-tab-ico-img\" src=\"'+_v3+'\" alt=\"\" onerror=\"this.onerror=null;this.src=&apos;'+_fb+'&apos;\"></span><span class=\"fg-tab-txt\">'+_txt+'</span>';\n    }\n    d.onclick=()=>{G.forgeTab=k;_forgeSel=null;_salSel.clear();_rerollSel=null;_crForgeSel=-1;renderForge()};\n    tabs.appendChild(d);\n  });\n  const grid=$('fgGrid');grid.innerHTML='';\n  grid.style.gridTemplateColumns=(G.forgeTab==='upgrade'||G.forgeTab==='potion'||G.forgeTab==='salvage'||G.forgeTab==='reroll'||G.forgeTab==='crystal'||G.forgeTab==='craft')?'1fr':'1fr 1fr';\n  // 제작 확인 바\n  const cfm=$('forgeConfirm');\n  if(_forgeSel){\n    const ok=G.mats>=_forgeSel.cost;\n    cfm.style.display='';\n    $('fgSelName').textContent=_T(_forgeSel.name);\n$('fgSelDesc').textContent=_forgeSel.desc+' — '+_T('악의')+' '+_forgeSel.cost;\n    $('fgCraftBtn').style.opacity=ok?'1':'.4';\n    $('fgCraftBtn').style.borderColor=ok?'#aa8833':'#443322';\n    $('fgCraftBtn').onclick=_fgCraft;\n  }else{cfm.style.display='none'}\n\n  if(G.forgeTab==='upgrade'){\n    // ═══ 장비 강화 (무한 강화, 성공률 시스템) ═══\n    grid.style.gridTemplateColumns='1fr';\n    const uhdr=document.createElement('div');uhdr.style.cssText='color:#ffaa44;font-size:.95rem;font-weight:700;margin-bottom:8px;letter-spacing:.1em;text-align:center';\nuhdr.textContent=_T('장비 강화 (실패 시 재료만 소멸)');grid.appendChild(uhdr);\n    const _slotEN={weapon:'⚔️ Weapon',shield:'🛡️ Shield',armor:'🦺 Armor',helmet:'👑 Crown',boots:'👢 Boots',bow:'🏹 Bow',gloves:'🧤 Gloves',pants:'👖 Pants',belt:'🥋 Belt',necklace:'📿 Necklace',ring1:'💍 Ring1',ring2:'💍 Ring2',cape:'🧣 Cape',bracelet:'⭕ Bracelet',headband:'🎀 Earring',ossuary:'⚱️ Ossuary'};\n    const slots=[['weapon','⚔️ 무기'],['shield','🛡️ 견갑'],['armor','🦺 갑옷'],['helmet','👑 왕관'],['boots','👢 부츠'],['bow','🏹 활'],['gloves','🧤 장갑'],['pants','👖 바지'],['belt','🥋 벨트'],['necklace','📿 목걸이'],['ring1','💍 반지1'],['ring2','💍 반지2'],['cape','🧣 망토'],['bracelet','⭕ 팔찌'],['headband','🎀 귀걸이'],['ossuary','⚱️ 유골함']].map(([k,v])=>{const split=v.indexOf(' '),label=v.slice(split+1);return [k,v.slice(0,split+1)+_L(label,_slotEN[k].slice(_slotEN[k].indexOf(' ')+1))]});\n    let hasItem=false;\n    slots.forEach(([slot,icon])=>{\n      const it=INV.equipped[slot];if(!it)return;hasItem=true;\n      const enh=it.enh||0;\n      const isMax=false; // 무한 강화\n      const rc=RARITY_C[it.rarity||0];\n      const ec=enhColor(enh);\n      const label=icon+' '+_T(it.name||slot);\n      const sel=_forgeSel&&_forgeSel.name===label;\n      const d=document.createElement('div');d.className='fg-i'+(sel?' fg-sel':'');\n      if(isMax){\n        // +20 MAX — 클릭 불가\n        d.innerHTML=`<div class=\"fg-in\" style=\"color:${rc}\">${label} <span style=\"color:#ffdd00;text-shadow:0 0 6px #ffdd00\">+${enh} MAX ✨</span></div><div class=\"fg-id\" style=\"color:#888\">${_T('최대 강화 달성!')}</div>`;\n        d.style.opacity='.6';d.style.cursor='default';\n      }else{\n        const {rate,cost}=enhCost(enh,it.rarity);\n        const _rpRaw=rate*100;\n        const ratePct=_rpRaw>=10?~~_rpRaw:_rpRaw>=1?_rpRaw.toFixed(1):_rpRaw>=0.01?_rpRaw.toFixed(2):_rpRaw.toFixed(3);\n        const rateCol=enhRateColor(rate);\n        const atkMulNow=it.atk?~~(enhMulAtk(enh)*100):0;\n        const atkMulNext=it.atk?~~(enhMulAtk(enh+1)*100):0;\n        const _enhDefSlots=new Set(['shield','armor','cape']);\n        const _enhHpSlots=new Set(['gloves','pants','boots']);\n        const _enhStSlots=new Set(['ring1','ring2','belt']);\n        const _enhMpSlots=new Set(['bracelet','necklace','headband','ossuary']);\n        let bonusTxt='';\n        if(it.atk)bonusTxt+=`ATK +${atkMulNow}% → +${atkMulNext}%`;\n        if(_enhDefSlots.has(it.slot))bonusTxt+=(bonusTxt?' | ':'')+ `DEF +${~~(enhMul(enh))} → +${~~(enhMul(enh+1))}`;\n        if(_enhHpSlots.has(it.slot))bonusTxt+=(bonusTxt?' | ':'')+`HP +${~~(enh*1.0)} → +${~~((enh+1)*1.0)}`;\n        if(_enhStSlots.has(it.slot))bonusTxt+=(bonusTxt?' | ':'')+`ST +${~~(enh*0.2)} → +${~~((enh+1)*0.2)}`;\n        if(_enhMpSlots.has(it.slot))bonusTxt+=(bonusTxt?' | ':'')+`MP +${~~(enh*0.2)} → +${~~((enh+1)*0.2)}`;\n        if(!bonusTxt)bonusTxt=_T('강화 보너스 적용');\nd.innerHTML=`<div class=\"fg-in\" style=\"color:${rc}\">${label} <span style=\"color:${ec}\">+${enh}</span></div><div class=\"fg-id\">${bonusTxt}</div><div class=\"fg-ic\" style=\"display:flex;justify-content:space-between\"><span style=\"color:${rateCol};font-weight:700\">${_T('성공률')} ${ratePct}%</span><span>${_T('악의')} ${cost}</span></div>`;\n        d.onclick=()=>{\n          const {rate:r2,cost:c2}=enhCost(it.enh||0,it.rarity);\n          if(G.mats<c2){notify(_T('악의가 부족합니다!'));return}\n          G.mats-=c2;\n          if(Math.random()<r2){\n            it.enh=(it.enh||0)+1;\n            SFX.forge();\n            const _ec2=enhColor(it.enh);\n            addTxt(P.x,P.y-20,'+'+it.enh+_L(' 강화!',' Enhanced!'),_ec2,60);\n            for(let i=0;i<12;i++)poolPart(P.x+(Math.random()-.5)*30,P.y-10+(Math.random()-.5)*20,(Math.random()-.5)*4,-2-Math.random()*3,_ec2,2+Math.random()*3,15+~~(Math.random()*10));\n            if(typeof _petOnEnhSuccess==='function')_petOnEnhSuccess();\n            if(it.enh===100&&typeof _petOnEnh100==='function')_petOnEnh100();\n          }else{\n            SFX.hurt();\n            addTxt(P.x,P.y-20,_T('강화 실패!'),'#ff4444',60);\n            for(let i=0;i<6;i++)poolPart(P.x+(Math.random()-.5)*20,P.y-10+(Math.random()-.5)*15,(Math.random()-.5)*3,-1-Math.random()*2,'#ff4444',1.5+Math.random()*2,12+~~(Math.random()*8));\n            if(typeof _petOnEnhFail==='function')_petOnEnhFail();\n          }\n          renderForge();dbSaveNow();\n        };\n      }\n      grid.appendChild(d);\n    });\n    if(!hasItem){const e=document.createElement('div');e.style.cssText='text-align:center;padding:20px;color:#554433;font-size:.95rem';e.textContent=_T('장착된 장비가 없습니다.');grid.appendChild(e)}\n    // ── AI 자동 강화 섹션 ──\n    if(hasItem){\n      const aiSec=document.createElement('div');\n      aiSec.style.cssText='margin-top:16px;border-top:1px solid #443322;padding-top:14px';\n      const _aiSlot=G._aiEnhSlot||null;\n      const _aiItem=_aiSlot?INV.equipped[_aiSlot]:null;\n      const _curEnh=_aiItem?(_aiItem.enh||0):0;\n      if(G._aiTarget===undefined||G._aiTarget<=_curEnh)G._aiTarget=_curEnh+100;\n      const _t=G._aiTarget;\n      let _autoExpCost=0;\n      if(_aiItem){for(let i=_curEnh;i<_t;i++){const ec=enhCost(i,_aiItem.rarity||0);_autoExpCost+=ec.cost/ec.rate}}\n      const _b=Math.min(Math.ceil(_autoExpCost)||1000,G.mats||0);\n      let _slotBtns='';\n      slots.forEach(function(_s){\n        const _it=INV.equipped[_s[0]];if(!_it)return;\n        const _sel=_aiSlot===_s[0];\n        const _ec2=enhColor(_it.enh||0);\n        _slotBtns+='<span onclick=\"G._aiEnhSlot=\\''+_s[0]+'\\';G._aiTarget=undefined;renderForge()\" style=\"cursor:pointer;padding:3px 8px;border:1px solid '+(_sel?'#44ccff':'#332211')+';background:'+(_sel?'rgba(68,204,255,.15)':'rgba(0,0,0,.2)')+';border-radius:3px;font-size:.8rem;color:'+(_sel?'#88ddff':'#776655')+'\">'+_s[1]+' <span style=\"color:'+_ec2+'\">+'+(_it.enh||0)+'</span></span>';\n      });\n      let _expHtml='';\n      if(_aiItem){\n        const _enoughMats=(G.mats||0)>=Math.ceil(_autoExpCost);\n        _expHtml='<div style=\"font-size:.8rem;color:#886644;margin-top:6px\">+'+_curEnh+' \\u2192 +'+_t+' | '+_T('보유 악의')+' '+(_enoughMats?'<span style=\"color:#44ff88\">\\u2714 '+_T('충분')+'</span>':'<span style=\"color:#ff4444\">\\u2716 '+_T('부족')+' ('+Math.ceil(_autoExpCost-(G.mats||0)).toLocaleString()+' '+_T('더 필요')+')</span>')+'</div>';\n      }\n      aiSec.innerHTML='<div style=\"color:#cc8844;font-weight:700;font-size:.95rem;margin-bottom:6px\">\\u26A1 '+_T('AI 자동 강화')+'</div>'+\n        '<div style=\"font-size:.8rem;color:#886644;margin-bottom:8px\">'+_T('장비 선택')+' \\u2192 '+_T('목표치 설정')+' \\u2192 '+_T('악의 투입')+' \\u2192 '+_T('자동 시도')+'</div>'+\n        '<div style=\"display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px\">'+_slotBtns+'</div>'+\n        (_aiItem?\n        '<div style=\"display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-bottom:4px\">'+\n          '<div style=\"flex:1;min-width:80px\">'+\n            '<div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">'+_T('목표 강화치')+'</div>'+\n            '<input id=\"aiTargetInp\" type=\"number\" min=\"'+(_curEnh+1)+'\" max=\"9999\" value=\"'+_t+'\" style=\"width:100%;background:#0a0806;border:1px solid #443322;color:#ffcc88;padding:5px 8px;border-radius:3px;font-size:.9rem;box-sizing:border-box\" oninput=\"G._aiTarget=Math.max('+(_curEnh+1)+',parseInt(this.value)||'+(_curEnh+1)+')\" onchange=\"renderForge()\">'+\n          '</div>'+\n          '<div style=\"flex:1;min-width:100px\">'+\n            '<div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">'+_T('예상 필요 악의')+'</div>'+\n            '<div style=\"background:#0a0806;border:1px solid #443322;color:#ffaa44;padding:5px 8px;border-radius:3px;font-size:.9rem\">'+Math.ceil(_autoExpCost).toLocaleString()+' <span style=\"color:#666;font-size:.75rem\">/ '+_T('보유')+' '+(G.mats||0).toLocaleString()+'</span></div>'+\n          '</div>'+\n          '<div><div class=\"id-btn equip\" style=\"white-space:nowrap\" onclick=\"_doAiEnhance()\">'+_T('강화 시작')+'</div></div>'+\n        '</div>'+_expHtml\n        :'<div style=\"color:#554433;font-size:.85rem\">'+_T('위에서 장비를 선택하세요')+'</div>')+\n        '<div id=\"aiEnhResult\"></div>';\n      grid.insertBefore(aiSec, uhdr.nextSibling);\n    }\n\n  }else if(G.forgeTab==='potion'){\n    // ═══ POTION TAB — 물약 강화만 ═══\n    const upgHdr=document.createElement('div');upgHdr.style.cssText='color:#aa8855;font-size:.9rem;font-weight:700;margin-bottom:6px;letter-spacing:.1em';upgHdr.textContent=_T('⬆ 물약 강화 (최대 10단)');\n    grid.appendChild(upgHdr);\n    [{type:'hp',n:'❤️‍🔥 '+_L('HP 물약','HP Potion'),col:'#cc2200'}].forEach(item=>{\n      const lv=POT_LV[item.type],maxed=lv>=10;\n      const cost=_malCost((lv+1)*5);\n      const reqLv=(lv+1)*100;\n      const lvOk=P.lv>=reqLv;\n      const _savLv=POT_LV[item.type];POT_LV[item.type]=lv+1;const nxt=maxed?potHeal(item.type):potHeal(item.type);POT_LV[item.type]=_savLv;const cur=potHeal(item.type);\n      const label=item.n+' Lv.'+lv+(maxed?' (MAX)':'');\n      const sel=_forgeSel&&_forgeSel.name===label;\n      const d=document.createElement('div');d.className='fg-i'+(sel?' fg-sel':'');\n      const _lvTxt=maxed?'':(!lvOk?' <span style=\"color:#ff4444\">⚠ Lv.'+reqLv+' '+_T('필요')+'</span>':'');\nd.innerHTML=`<div class=\"fg-in\" style=\"color:${item.col}\">${label}</div><div class=\"fg-id\">${maxed?_T('최대 강화'):_T('회복량')+' '+cur+' → '+nxt}${_lvTxt}</div>${maxed?'':'<div class=\"fg-ic\">'+_T('악의')+' '+cost+'</div>'}`;\n      if(!maxed&&lvOk)d.onclick=()=>_fgSelect(label,item.n+_L(' 강화 Lv.',' Enhance Lv.')+(lv+1),cost,()=>{POT_LV[item.type]++;G.mats-=cost;addTxt(P.x,P.y-20,item.n+' Lv.'+POT_LV[item.type]+'!','#ffcc00',50);renderForge()});\n      grid.appendChild(d);\n    });\n\n  }else if(G.forgeTab==='salvage'){\n    // ═══ 아이템 분해 ═══\n    grid.style.gridTemplateColumns='1fr';\n    if(G._salRarF===undefined)G._salRarF=-1;\n    if(!G._salSlotF)G._salSlotF='all';\n    // 유효하지 않은 선택 제거\n    for(const idx of[..._salSel]){if(idx>=INV.bag.length)_salSel.delete(idx)}\n    const _salVal=salvageVal;\n    const _salMatch=it=>{\n      if(G._salRarF>=0&&(it.rarity||0)!==G._salRarF)return false;\n      if(G._salSlotF!=='all'){const s=it.slot;if(s!==G._salSlotF&&!(G._salSlotF==='ring'&&(s==='ring1'||s==='ring2')))return false}\n      return true;\n    };\n    // 헤더\n    const shdr=document.createElement('div');shdr.style.cssText='color:#ff6644;font-size:1rem;font-weight:700;margin-bottom:8px;letter-spacing:.1em;text-align:center';\nshdr.textContent=_T('악의의 분해로 — 장비를 악의로 갈아버려라');grid.appendChild(shdr);\n    // 필터 - 레어리티\n    const fBar=document.createElement('div');fBar.style.cssText='display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px;align-items:center';\n    fBar.innerHTML='<span style=\"color:#776655;font-size:.8rem;margin-right:2px\">'+_T('레어')+':</span>';\n    [[-1,_T('전체')],[0,_rarName(0)],[1,_rarName(1)],[2,_rarName(2)],[3,_rarName(3)],[4,_rarName(4)]].forEach(([r,n])=>{\n      const b=document.createElement('div');const act=G._salRarF===r;\n      b.style.cssText=`padding:2px 8px;font-size:.75rem;cursor:pointer;border:1px solid ${act?'#ff6644':'#332211'};color:${act?(r>=0?RARITY_C[r]:'#ff6644'):'#665544'};background:${act?'rgba(255,102,68,.1)':'transparent'};border-radius:3px`;\n      b.textContent=n;b.onclick=()=>{G._salRarF=r;_salSel.clear();renderForge()};fBar.appendChild(b);\n    });grid.appendChild(fBar);\n    // 필터 - 슬롯\n    const sBar=document.createElement('div');sBar.style.cssText='display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;align-items:center';\n    sBar.innerHTML='<span style=\"color:#776655;font-size:.8rem;margin-right:2px\">'+_T('슬롯')+':</span>';\n    [['all','전체'],['weapon','⚔️'],['shield','🛡️'],['armor','🦺'],['helmet','⛑️'],['boots','👢'],['bow','🏹'],['gloves','🧤'],['pants','👖'],['necklace','📿'],['ring','💍'],['bracelet','⭕'],['headband','🎀']].forEach(([s,n])=>{\n      const b=document.createElement('div');const act=G._salSlotF===s;\n      b.style.cssText=`padding:2px 8px;font-size:.75rem;cursor:pointer;border:1px solid ${act?'#ff6644':'#332211'};color:${act?'#ff6644':'#665544'};background:${act?'rgba(255,102,68,.1)':'transparent'};border-radius:3px`;\n      b.textContent=n;b.onclick=()=>{G._salSlotF=s;_salSel.clear();renderForge()};sBar.appendChild(b);\n    });grid.appendChild(sBar);\n    // 일괄 선택\n    const bulkRow=document.createElement('div');bulkRow.style.cssText='display:flex;gap:4px;margin-bottom:8px';\n    [[_T('전체 선택'),()=>{INV.bag.forEach((it,i)=>{if(_salMatch(it))_salSel.add(i)});renderForge()}],\n     [_T('전체 해제'),()=>{_salSel.clear();renderForge()}],\n     [_T('희귀 이하'),()=>{_salSel.clear();INV.bag.forEach((it,i)=>{if(_salMatch(it)&&(it.rarity||0)<=2)_salSel.add(i)});renderForge()}]\n    ].forEach(([txt,fn])=>{\n      const b=document.createElement('div');b.style.cssText='padding:4px 10px;font-size:.8rem;cursor:pointer;border:1px solid #443322;color:#aa8855;background:rgba(0,0,0,.2);border-radius:3px';\n      b.textContent=txt;b.onclick=fn;bulkRow.appendChild(b);\n    });grid.appendChild(bulkRow);\n    // 아이템 그리드\n    const itemGrid=document.createElement('div');itemGrid.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:4px;max-height:320px;overflow-y:auto;margin-bottom:6px';\n    let salCnt=0;\n    INV.bag.forEach((it,i)=>{\n      if(!_salMatch(it))return;salCnt++;\n      const sel=_salSel.has(i);const rc=RARITY_C[it.rarity||0];const val=_salVal(it);\n      const d=document.createElement('div');d.className='fg-i';\n      d.style.cssText=`border:1px solid ${sel?'#cc3322':'#332211'};background:${sel?'rgba(204,51,34,.12)':'rgba(0,0,0,.25)'};cursor:pointer;position:relative;padding:6px`;\n      d.innerHTML=`${sel?'<div style=\"position:absolute;top:2px;right:6px;color:#ff4444;font-weight:700;font-size:.9rem\">✗</div>':''}\n        <div class=\"fg-in\" style=\"color:${rc}\">${_itemIco(it,rc,15)} ${itemDispName(it)}${it.enh?' <span style=\"color:'+enhColor(it.enh)+'\">+'+it.enh+'</span>':''}</div>\n<div class=\"fg-id\">${_rarName(it.rarity||0)} T${it.tier||0} → ${_T('악의')} ${val}</div>`;\n      d.onclick=()=>{if(_salSel.has(i))_salSel.delete(i);else _salSel.add(i);renderForge()};\n      itemGrid.appendChild(d);\n    });\n    if(salCnt===0){const e=document.createElement('div');e.style.cssText='grid-column:1/-1;text-align:center;padding:20px;color:#554433;font-size:.95rem';e.textContent=_T('분해할 아이템이 없습니다.');itemGrid.appendChild(e)}\n    grid.appendChild(itemGrid);\n    // 하단 요약 + 분해 버튼\n    const selArr=[..._salSel].filter(i=>i<INV.bag.length);\n    const totalMats=selArr.reduce((s,i)=>s+_salVal(INV.bag[i]),0);\n    const sumDiv=document.createElement('div');sumDiv.style.cssText='text-align:center;padding:10px;border-top:1px solid #332211';\nsumDiv.innerHTML=`<div style=\"color:#aa8855;font-size:.9rem;margin-bottom:6px\">`+_L('선택','Selected')+` <span style=\"color:#ff6644;font-weight:700\">${selArr.length}</span>`+_L('개 ->','  ->')+` <span style=\"color:#cc66ff;font-weight:700\">${totalMats}</span> `+_L('악의 획득 예상','Malice expected')+`</div>`;\n    if(selArr.length>0){\n      const btn=document.createElement('button');\n      btn.style.cssText='display:block;margin:0 auto;padding:10px 28px;font-size:1rem;font-family:\"Noto Sans KR\";font-weight:700;cursor:pointer;border:2px solid #cc3322;background:linear-gradient(180deg,rgba(204,51,34,.2),rgba(100,20,10,.4));color:#ff6644;border-radius:6px;letter-spacing:.1em';\nbtn.textContent=_L(\"분해 ({p0}개 -> 악의 {p1})\",\"Salvage ({p0} -> {p1} Malice)\",{p0:selArr.length,p1:totalMats});\n      btn.onmouseenter=()=>{btn.style.borderColor='#ff6644';btn.style.boxShadow='0 0 16px #cc332244'};\n      btn.onmouseleave=()=>{btn.style.borderColor='#cc3322';btn.style.boxShadow='none'};\n      btn.onclick=async()=>{\n        if(!await gameConfirm(_L(\"{p0}개 아이템을 분해합니다.<br>{p1} {p2} 악의 획득.<br><br>{p3} 복구 불가!\",\"Salvage {p0} items.<br>{p1} {p2} Malice gained.<br><br>{p3} Cannot undo!\",{p0:selArr.length,p1:_glyph('demon','#cc66ff',15),p2:totalMats,p3:_glyph('warn','#ff6644',15)}),null,null,true))return;\n        const idxs=[...selArr].sort((a,b)=>b-a);\n        idxs.forEach(i=>INV.bag.splice(i,1));\n        G.mats+=totalMats;\n        _salSel.clear();\n        SFX.forge();addTxt(P.x,P.y-20,'👿 +'+totalMats+_L(' 악의',' Malice'),'#cc66ff',80);addParts(P.x,P.y,'#ff4422',20);\n        G.shake=3;renderForge();dbSaveNow();\n      };\n      sumDiv.appendChild(btn);\n    }\n    grid.appendChild(sumDiv);\n\n  }else if(G.forgeTab==='reroll'){\n    // ═══ 리롤 — 접두/접미 재설정 ═══\n    grid.style.gridTemplateColumns='1fr';\n    const rHdr=document.createElement('div');rHdr.style.cssText='color:#44ccff;font-size:1rem;font-weight:700;margin-bottom:8px;letter-spacing:.1em;text-align:center';\nrHdr.textContent=_L('리롤 — 접두/접미 재설정 | 악의 '+REROLL_COST,'Reroll — Reset prefix/suffix | Malice '+REROLL_COST);grid.appendChild(rHdr);\n    const eqList=document.createElement('div');eqList.style.cssText='display:flex;flex-direction:column;gap:4px;margin-bottom:8px;max-height:280px;overflow-y:auto';\n    SLOT_NAMES.forEach((slot,i)=>{\n      const it=INV.equipped[slot];\n      const d=document.createElement('div');\n      const canReroll=it&&(it.rarity||0)>=1;\n      const isSel=_rerollSel===slot;\n      d.style.cssText=`padding:6px 10px;border:1px solid ${isSel?'#44ccff':canReroll?'#332211':'#1a1100'};background:${isSel?'rgba(68,204,255,.1)':'rgba(0,0,0,.25)'};cursor:${canReroll?'pointer':'default'};opacity:${canReroll?1:.4};border-radius:3px;display:flex;align-items:center;gap:6px`;\n      if(it){\n        const rc=RARITY_C[it.rarity||0];\n        let info=`<span style=\"color:${rc};font-weight:700\">${_slotGlyph(i,rc,15)} ${itemDispName(it)}${it.enh?' <span style=\"color:'+enhColor(it.enh)+'\">+'+it.enh+'</span>':''}</span>`;\n        const afxHtml=it.affixes&&it.affixes.length?it.affixes.map(af=>'<span style=\"color:'+(AFFIX_POOL.find(a=>a.id===af.id&&a.type===0)?'#66ddff':'#ffcc44')+';font-size:.75rem\">['+_T(AFFIX_NAMES_KO[af.id]||af.id)+' '+_affixValStr(af)+']</span>').join(' '):'';\n        if(afxHtml)info+=' '+afxHtml;\n        else if(canReroll)info+=` <span style=\"color:#554433;font-size:.75rem\">${_T('어픽스 없음')}</span>`;\n        d.innerHTML=info;\n      }else{\n        d.innerHTML=`<span style=\"color:#443322\">${_slotGlyph(i,'#5a4a38',15)} ${_slotName(i)} — ${_T('비어있음')}</span>`;\n      }\n      if(canReroll)d.onclick=()=>{_rerollSel=slot;renderForge()};\n      eqList.appendChild(d);\n    });\n    grid.appendChild(eqList);\n    if(_rerollSel&&INV.equipped[_rerollSel]){\n      const rIt=INV.equipped[_rerollSel];\n      const detDiv=document.createElement('div');detDiv.style.cssText='padding:12px;background:rgba(0,0,0,.35);border:1px solid #44ccff;border-radius:6px';\n      const rc=RARITY_C[rIt.rarity||0];\n      const _afxHtml=rIt.affixes&&rIt.affixes.length?rIt.affixes.map(af=>{const p=AFFIX_POOL.find(a=>a.id===af.id);const c=p&&p.type===0?'#66ddff':'#ffcc44';return'<div style=\"color:'+c+';font-size:.85rem\">'+_T(AFFIX_NAMES_KO[af.id]||af.id)+' '+_affixValStr(af)+'</div>'}).join(''):'<div style=\"color:#554433;font-size:.85rem\">'+_T('어픽스 없음')+'</div>';\n      let _implHtml='';\n      if(rIt._implicitKo&&rIt._implicitVal!==undefined){_implHtml='<div style=\"color:#aaddff;font-size:.8rem\">\\u25C6 '+_T(rIt._implicitKo).replace('X',rIt._implicitVal)+'</div>'}\n      let _legHtml='';\n      if(rIt.legendarySpecial){_legHtml='<div style=\"color:#ffaa00;font-size:.8rem;margin-top:4px\">\\u25C8 '+_T(rIt.legendarySpecial.ko)+'</div>'}\n      detDiv.innerHTML=`<div style=\"text-align:center;color:${rc};font-size:1rem;font-weight:700;margin-bottom:8px\">${_itemIco(rIt,rc,15)} ${itemDispName(rIt)}${rIt.enh?' <span style=\"color:'+enhColor(rIt.enh)+'\">+'+rIt.enh+'</span>':''}</div>\n        ${_implHtml}<div style=\"margin-bottom:10px;text-align:center\">${_afxHtml}</div>${_legHtml}`;\n      const btnRow=document.createElement('div');btnRow.style.cssText='display:flex;gap:6px;justify-content:center;flex-wrap:wrap';\n      const mkBtn=(label,cost,fn)=>{\n        const ok=G.mats>=cost;\n        const b=document.createElement('button');\n        b.style.cssText=`padding:8px 16px;font-size:.9rem;font-family:\"Noto Sans KR\";font-weight:700;cursor:${ok?'pointer':'not-allowed'};border:2px solid ${ok?'#44ccff':'#332211'};background:${ok?'linear-gradient(180deg,rgba(68,204,255,.12),rgba(30,80,120,.3))':'rgba(0,0,0,.3)'};color:${ok?'#88ddff':'#554433'};border-radius:6px;transition:all .15s`;\n        b.textContent=label+' 👿'+cost;\n        if(ok){b.onmouseenter=()=>{b.style.borderColor='#88eeff';b.style.boxShadow='0 0 12px #44ccff44'};b.onmouseleave=()=>{b.style.borderColor='#44ccff';b.style.boxShadow='none'};b.onclick=fn}\n        return b;\n      };\n      btnRow.appendChild(mkBtn(_L('어픽스 리롤','Affix Reroll'),REROLL_COST,()=>{if(G.mats<REROLL_COST){notify(_T('악의 부족!'));return}G.mats-=REROLL_COST;rerollAffixes(rIt);SFX.forge();addTxt(P.x,P.y-20,_T('어픽스 리롤!'),'#44ccff',60);recalcSt();applyStats();renderForge();dbSaveNow()}));\n      detDiv.appendChild(btnRow);\n      grid.appendChild(detDiv);\n    }\n\n  }else if(G.forgeTab==='crystal'){\n    // ═══ 결정 강화 / 합성 / 분해·제작 ═══\n    grid.style.gridTemplateColumns='1fr';\n    // 서브탭\n    const cSubBar=document.createElement('div');cSubBar.style.cssText='display:flex;gap:4px;margin-bottom:8px;justify-content:center';\n[['enhance','강화'],['synth','합성'],['decomp','분해/제작']].forEach(([k,v])=>{\n      const b=document.createElement('div');b.style.cssText='padding:3px 10px;font-size:.85rem;cursor:pointer;border:1px solid '+(_crForgeTab===k?'#bb88ff':'#443322')+';color:'+(_crForgeTab===k?'#ddaaff':'#887766')+';background:'+(_crForgeTab===k?'rgba(187,136,255,.12)':'rgba(0,0,0,.2)')+';border-radius:3px';\n      b.textContent=v;b.onclick=()=>{_crForgeTab=k;_crForgeSel=-1;renderForge()};cSubBar.appendChild(b);\n    });\n    grid.appendChild(cSubBar);\n    // 보유 표시\n    const cInfo=document.createElement('div');cInfo.style.cssText='text-align:center;font-size:.85rem;color:#887766;margin-bottom:6px';\ncInfo.innerHTML=_L('보유: ','Owned: ')+CRYSTAL_BAG.length+'/'+CRYSTAL_BAG_MAX+' | '+_L('가루: ','Dust: ')+'<span style=\"color:#cc88ff\">'+CRYSTAL_DUST+'</span> | '+_L('악의: ','Malice: ')+'<span style=\"color:#cc66ff\">'+G.mats+'</span>';\n    grid.appendChild(cInfo);\n\n    if(_crForgeTab==='enhance'){\n      // ── 일괄강화 버튼 ──\n      const _canBulkEnh=(()=>{for(let i=0;i<CRYSTAL_BAG.length;i++){const cr=CRYSTAL_BAG[i];if((cr.enh||0)>=20)continue;const cost=crystalEnhCost(cr);if(G.mats<cost)continue;if(CRYSTAL_BAG.findIndex((c,ci)=>ci!==i&&c.id===cr.id&&c.star===cr.star)>=0)return true}return false})();\n      const bulkEnhBtn=document.createElement('button');\n      bulkEnhBtn.style.cssText='width:100%;margin-bottom:8px;padding:6px 12px;font-size:.85rem;font-family:\"Noto Sans KR\";font-weight:700;cursor:'+(_canBulkEnh?'pointer':'not-allowed')+';border:2px solid '+(_canBulkEnh?'#bb88ff':'#443322')+';background:'+(_canBulkEnh?'rgba(187,136,255,.12)':'rgba(0,0,0,.2)')+';color:'+(_canBulkEnh?'#ffcc44':'#554433')+';border-radius:4px';\n      bulkEnhBtn.textContent=_T('일괄강화+합성');\n      bulkEnhBtn.onclick=()=>{\n        if(!_canBulkEnh)return;\n        let _enhCnt=0,_synthCnt=0;\n        // 반복: 강화 → 합성 → 더 이상 못할 때까지\n        while(true){\n          let _didAny=false;\n          // 1) 강화: 같은 id+star 재료를 먹여서 +1\n          while(true){\n            let _did=false;\n            for(let i=0;i<CRYSTAL_BAG.length;i++){\n              const cr=CRYSTAL_BAG[i];if((cr.enh||0)>=20)continue;\n              const cost=crystalEnhCost(cr);if(G.mats<cost)continue;\n              const _fi=CRYSTAL_BAG.findIndex((c,ci)=>ci!==i&&c.id===cr.id&&c.star===cr.star);\n              if(_fi<0)continue;\n              G.mats-=cost;CRYSTAL_BAG.splice(_fi,1);if(i>_fi)i--;\n              cr.enh=(cr.enh||0)+1;_enhCnt++;_did=true;_didAny=true;break;\n            }\n            if(!_did)break;\n          }\n          // 2) 합성: 같은 id+star 3개 → 1성급 상승 (강화 리셋)\n          while(true){\n            const _g={};\n            CRYSTAL_BAG.forEach((cr,i)=>{if(cr.star>=4)return;const k=cr.id+'_'+cr.star;if(!_g[k])_g[k]={id:cr.id,star:cr.star,idxs:[]};_g[k].idxs.push(i)});\n            let _did2=false;\n            for(const k in _g){const _gr=_g[k];if(_gr.idxs.length<3)continue;\n              const _times=~~(_gr.idxs.length/3);\n              _gr.idxs.slice(0,_times*3).sort((a,b)=>b-a).forEach(ri=>CRYSTAL_BAG.splice(ri,1));\n              for(let t=0;t<_times;t++){CRYSTAL_BAG.push({id:_gr.id,star:_gr.star+1,enh:0});_synthCnt++}\n              _did2=true;_didAny=true;break}\n            if(!_did2)break;\n          }\n          if(!_didAny)break;\n        }\n        if(_enhCnt+_synthCnt>0){SFX.forge();\n          if(_enhCnt>0)addTxt(P.x,P.y-20,_T('강화')+' ×'+_enhCnt,'#bb88ff',60);\n          if(_synthCnt>0)addTxt(P.x,P.y-40,_T('합성')+' ×'+_synthCnt,'#ffdd66',60);\n          applyStats();renderForge();dbSaveNow()}\n      };\n      grid.appendChild(bulkEnhBtn);\n      // ── 결정 강화 ──\n      const cList=document.createElement('div');cList.style.cssText='display:flex;flex-direction:column;gap:2px;max-height:180px;overflow-y:auto;margin-bottom:8px';\n      CRYSTAL_BAG.forEach((cr,i)=>{\n        const d=CRYSTAL_DEFS[cr.id],s=CRYSTAL_STAR[cr.star],sel=_crForgeSel===i;\n        const row=document.createElement('div');row.style.cssText='cursor:pointer;display:flex;align-items:center;gap:6px;padding:4px 8px;border:1px solid '+(sel?'#bb88ff':'#332211')+';background:'+(sel?'rgba(187,136,255,.12)':'rgba(0,0,0,.2)')+';border-radius:3px';\n        row.innerHTML='<span>'+_crIco(d,16)+'</span><span style=\"color:'+s.color+';font-size:.85rem;font-weight:700\">'+_crStarN(s)+'</span><span style=\"color:#ccaa88;font-size:.85rem\">'+_crDefN(d)+'</span>'+(cr.enh>0?'<span style=\"color:#44ccff;font-size:.8rem\">+'+cr.enh+'</span>':'')+'<span style=\"color:#88cc88;font-size:.8rem;margin-left:auto\">'+_crValStr(cr)+'</span>';\n        row.onclick=()=>{_crForgeSel=i;renderForge()};cList.appendChild(row);\n      });\n      if(CRYSTAL_BAG.length===0){const em=document.createElement('div');em.style.cssText='color:#554433;text-align:center;padding:20px';em.textContent=_T('결정이 없습니다');cList.appendChild(em)}\n      grid.appendChild(cList);\n      // 선택된 결정 상세+강화 버튼\n      if(_crForgeSel>=0&&_crForgeSel<CRYSTAL_BAG.length){\n        const cr=CRYSTAL_BAG[_crForgeSel],d=CRYSTAL_DEFS[cr.id],s=CRYSTAL_STAR[cr.star];\n        const cost=crystalEnhCost(cr),maxed=(cr.enh||0)>=20;\n        // 동급 결정 재료 체크 (같은 id + 같은 star, 자기 자신 제외)\n        const _feedIdx=CRYSTAL_BAG.findIndex((c,ci)=>ci!==_crForgeSel&&c.id===cr.id&&c.star===cr.star);\n        const hasFeed=_feedIdx>=0;\n        const ok=!maxed&&G.mats>=cost&&hasFeed;\n        const det=document.createElement('div');det.style.cssText='padding:8px;border:1px solid #553388;border-radius:4px;background:rgba(100,0,200,.06)';\n        det.innerHTML='<div style=\"color:'+s.color+';font-size:1rem;font-weight:700;margin-bottom:4px\">'+_crIco(d,16)+' '+_crStarN(s)+' '+_crDefN(d)+(cr.enh>0?' <span style=\"color:#44ccff\">+'+cr.enh+'</span>':'')+'</div>'\n          +'<div style=\"color:#88cc88;font-size:.9rem\">'+_T('현재')+': '+_crValStr(cr)+'</div>'\n          +(maxed?'<div style=\"color:#ffaa00;font-size:.85rem;margin-top:4px\">'+_T('최대 강화 달성 (+20)')+'</div>'\n          :'<div style=\"color:#aaaaaa;font-size:.85rem;margin-top:4px\">'+_T('강화 시')+': '+(d.pct?'+'+_crValFmt(d.base*s.mul*(1+((cr.enh||0)+1)*0.1))+'%':'+'+_crValFmt(d.base*s.mul*(1+((cr.enh||0)+1)*0.1)))+'</div>'\n          +'<div style=\"color:#cc66ff;font-size:.85rem\">'+_L('비용','Cost')+': 👿'+cost+' + 💎'+_crStarN(s)+' '+_crDefN(d)+' ×1'\n          +(ok?'':(!hasFeed?' <span style=\"color:#ff4444\">'+_L('(재료 결정 없음)','(no feed crystal)')+'</span>':' <span style=\"color:#ff4444\">'+_L('(악의 부족)','(insufficient)')+'</span>'))+'</div>');\n        if(!maxed){\n          const btn=document.createElement('button');btn.style.cssText='margin-top:6px;padding:6px 24px;font-size:.9rem;font-family:\"Noto Sans KR\";font-weight:700;cursor:'+(ok?'pointer':'not-allowed')+';border:2px solid '+(ok?'#bb88ff':'#443322')+';background:'+(ok?'rgba(187,136,255,.15)':'rgba(0,0,0,.2)')+';color:'+(ok?'#ffcc44':'#554433')+';border-radius:6px';\n          btn.textContent=_T('강화')+' ('+_L('악의 ','Malice ')+cost+' + '+_L('결정 ×1','Crystal ×1')+')';\n          btn.onclick=()=>{if(G.mats<cost||!hasFeed)return;G.mats-=cost;\n            // 재료 결정 소모 (다시 찾기 — 인덱스 변동 대비)\n            const _fi=CRYSTAL_BAG.findIndex((c,ci)=>ci!==_crForgeSel&&c.id===cr.id&&c.star===cr.star);\n            if(_fi>=0){CRYSTAL_BAG.splice(_fi,1);if(_crForgeSel>_fi)_crForgeSel--}\n            cr.enh=(cr.enh||0)+1;SFX.forge();addTxt(P.x,P.y-20,_crDefN(d)+' +'+cr.enh+'!','#bb88ff',50);applyStats();renderForge();dbSaveNow()};\n          det.appendChild(btn);\n        }\n        grid.appendChild(det);\n      }\n    }else if(_crForgeTab==='synth'){\n      // ── 결정 합성: 같은 종류+같은 성급 3개 → 1성급 상승 ──\n      const hdr=document.createElement('div');hdr.style.cssText='color:#44ccff;font-size:.9rem;text-align:center;margin-bottom:6px';\n      hdr.textContent=_T('같은 종류·같은 성급 결정 3개 → 1성급 상승 (강화 리셋)');grid.appendChild(hdr);\n      // ── 최상위 일괄합성 버튼 ──\n      // 합성 가능 여부 미리 체크 (1회 이상 합성 가능하면 활성)\n      const _canBulk=(()=>{\n        const _g={};CRYSTAL_BAG.forEach(cr=>{if(cr.star>=4)return;const k=cr.id+'_'+cr.star;_g[k]=(_g[k]||0)+1});\n        for(const k in _g)if(_g[k]>=3)return true;\n        return false;\n      })();\n      const bulkBtn=document.createElement('button');\n      bulkBtn.style.cssText='width:100%;margin-bottom:8px;padding:6px 12px;font-size:.85rem;font-family:\"Noto Sans KR\";font-weight:700;cursor:'+(_canBulk?'pointer':'not-allowed')+';border:2px solid '+(_canBulk?'#ffcc44':'#443322')+';background:'+(_canBulk?'rgba(255,204,68,.12)':'rgba(0,0,0,.2)')+';color:'+(_canBulk?'#ffdd66':'#554433')+';border-radius:4px';\n      bulkBtn.textContent=_T('최상위 일괄합성');\n      bulkBtn.onclick=()=>{\n        if(!_canBulk)return;\n        let _total=0;\n        // 반복 합성: 더 이상 합성 가능한 그룹이 없을 때까지\n        while(true){\n          // 같은 id+star 그룹 집계 (낮은 star부터)\n          const _g={};\n          CRYSTAL_BAG.forEach((cr,i)=>{if(cr.star>=4)return;const k=cr.id+'_'+cr.star;if(!_g[k])_g[k]={id:cr.id,star:cr.star,idxs:[]};_g[k].idxs.push(i)});\n          // 합성 가능 그룹 찾기 (3개 이상)\n          let _synthedOne=false;\n          for(const k in _g){\n            const _gr=_g[k];\n            if(_gr.idxs.length<3)continue;\n            // 3개씩 합성 (여러 번 가능)\n            const _times=~~(_gr.idxs.length/3);\n            // 인덱스 내림차순 정렬 후 삭제\n            const _toRemove=_gr.idxs.slice(0,_times*3).sort((a,b)=>b-a);\n            _toRemove.forEach(ri=>CRYSTAL_BAG.splice(ri,1));\n            for(let t=0;t<_times;t++){\n              CRYSTAL_BAG.push({id:_gr.id,star:_gr.star+1,enh:0});\n              _total++;\n            }\n            _synthedOne=true;\n            break; // 인덱스 갱신 위해 다시 루프\n          }\n          if(!_synthedOne)break;\n        }\n        if(_total>0){\n          SFX.forge();\n          addTxt(P.x,P.y-20,_T('일괄합성 완료')+' ×'+_total,'#ffdd66',60);\n          applyStats();renderForge();dbSaveNow();\n        }\n      };\n      grid.appendChild(bulkBtn);\n      // 합성 가능 그룹 찾기\n      const groups={};\n      CRYSTAL_BAG.forEach((cr,i)=>{const k=cr.id+'_'+cr.star;if(!groups[k])groups[k]={id:cr.id,star:cr.star,idxs:[]};groups[k].idxs.push(i)});\n      let hasGroup=false;\n      for(const k in groups){const g=groups[k];if(g.idxs.length<3||g.star>=4)continue;hasGroup=true;\n        const d=CRYSTAL_DEFS[g.id],s=CRYSTAL_STAR[g.star],ns=CRYSTAL_STAR[g.star+1];\n        const row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:6px;padding:6px 8px;border:1px solid #553388;background:rgba(100,0,200,.06);border-radius:4px;margin-bottom:4px';\n        row.innerHTML='<span style=\"color:'+s.color+'\">'+_crIco(d,14)+' '+_crStarN(s)+' '+_crDefN(d)+' ×3</span><span style=\"color:#887766\">→</span><span style=\"color:'+ns.color+';font-weight:700\">'+_crStarN(ns)+' '+_crDefN(d)+'</span>';\n        const btn=document.createElement('button');btn.style.cssText='margin-left:auto;padding:3px 12px;font-size:.8rem;font-family:\"Noto Sans KR\";cursor:pointer;border:1px solid #44ccff;background:rgba(68,204,255,.1);color:#88eeff;border-radius:4px';\n        btn.textContent=_T('합성');\n        btn.onclick=()=>{\n          const rem=g.idxs.slice(0,3).sort((a,b)=>b-a);\n          rem.forEach(ri=>CRYSTAL_BAG.splice(ri,1));\n          CRYSTAL_BAG.push({id:g.id,star:g.star+1,enh:0});\n          SFX.forge();addTxt(P.x,P.y-20,_crStarN(ns)+' '+_crDefN(d)+' '+_T('합성!'),ns.color,60);\n          applyStats();renderForge();dbSaveNow();\n        };\n        row.appendChild(btn);grid.appendChild(row);\n      }\n      if(!hasGroup){const em=document.createElement('div');em.style.cssText='color:#554433;text-align:center;padding:20px';em.textContent=_T('합성 가능한 결정이 없습니다 (같은 종류·성급 3개 필요)');grid.appendChild(em)}\n    }else if(_crForgeTab==='decomp'){\n      // ── 분해 / 제작 ──\nconst secHdr1=document.createElement('div');secHdr1.style.cssText='color:#ff8844;font-size:.9rem;font-weight:700;margin-bottom:4px';secHdr1.textContent=_T('결정 분해 → 결정 가루');grid.appendChild(secHdr1);\n      const dList=document.createElement('div');dList.style.cssText='display:flex;flex-direction:column;gap:2px;max-height:140px;overflow-y:auto;margin-bottom:8px';\n      CRYSTAL_BAG.forEach((cr,i)=>{\n        const d=CRYSTAL_DEFS[cr.id],s=CRYSTAL_STAR[cr.star];\n        const dustGet=~~(CRYSTAL_DUST_COST[cr.star]*0.5);\n        const row=document.createElement('div');row.style.cssText='cursor:pointer;display:flex;align-items:center;gap:6px;padding:3px 8px;border:1px solid #332211;background:rgba(0,0,0,.2);border-radius:3px';\n        row.innerHTML='<span style=\"color:'+s.color+';font-size:.85rem\">'+_crIco(d,14)+' '+_crStarN(s)+' '+_crDefN(d)+(cr.enh>0?' +'+cr.enh:'')+'</span><span style=\"color:#aa6644;font-size:.75rem;margin-left:auto\">→ '+_T('가루')+' +'+dustGet+'</span>';\n        row.onclick=()=>{CRYSTAL_BAG.splice(i,1);CRYSTAL_DUST+=dustGet;SFX.forge();addTxt(P.x,P.y-20,_T('분해! 가루 +')+dustGet,'#ff8844',50);renderForge();dbSaveNow()};\n        dList.appendChild(row);\n      });\n      if(CRYSTAL_BAG.length===0){const em=document.createElement('div');em.style.cssText='color:#554433;text-align:center;padding:10px';em.textContent=_T('분해할 결정이 없습니다');dList.appendChild(em)}\n      grid.appendChild(dList);\n      // ── 제작 ──\n      const secHdr2=document.createElement('div');secHdr2.style.cssText='color:#44ff88;font-size:.9rem;font-weight:700;margin-bottom:4px;margin-top:8px;border-top:1px solid #332211;padding-top:6px';secHdr2.textContent=_T('결정 제작 (가루 → 결정)');grid.appendChild(secHdr2);\n      // 종류 선택\n      const typeBar=document.createElement('div');typeBar.style.cssText='display:flex;flex-wrap:wrap;gap:2px;margin-bottom:4px';\n      CRYSTAL_IDS.forEach(id=>{\n        const d=CRYSTAL_DEFS[id],sel=_crCraftType===id;\n        const b=document.createElement('span');b.style.cssText='cursor:pointer;padding:1px 5px;font-size:.75rem;border:1px solid '+(sel?'#44ff88':'#332211')+';color:'+(sel?'#88ffaa':'#776655')+';background:'+(sel?'rgba(68,255,136,.1)':'rgba(0,0,0,.2)')+';border-radius:3px';\n        b.innerHTML=_crIco(d,14)+' '+_crDefN(d);b.onclick=()=>{_crCraftType=id;renderForge()};typeBar.appendChild(b);\n      });\n      grid.appendChild(typeBar);\n      // 성급 선택 + 제작 버튼\n      if(_crCraftType){\n        const cd=CRYSTAL_DEFS[_crCraftType];\n        const starBar=document.createElement('div');starBar.style.cssText='display:flex;gap:4px;margin-bottom:6px;align-items:center';\n        for(let si=0;si<5;si++){\n          const s=CRYSTAL_STAR[si],cost=CRYSTAL_DUST_COST[si],sel=_crCraftStar===si;\n          const b=document.createElement('span');b.style.cssText='cursor:pointer;padding:2px 8px;font-size:.8rem;border:1px solid '+(sel?s.color:'#332211')+';color:'+(sel?s.color:'#665544')+';background:'+(sel?'rgba(187,136,255,.1)':'rgba(0,0,0,.2)')+';border-radius:3px';\n          b.textContent=(si+1)+_L('성 ('+cost+'가루)','★ ('+cost+' Dust)');b.onclick=()=>{_crCraftStar=si;renderForge()};starBar.appendChild(b);\n        }\n        grid.appendChild(starBar);\n        const dustCost=CRYSTAL_DUST_COST[_crCraftStar],ok=CRYSTAL_DUST>=dustCost&&CRYSTAL_BAG.length<CRYSTAL_BAG_MAX;\n        const s=CRYSTAL_STAR[_crCraftStar];\n        const craftDiv=document.createElement('div');craftDiv.style.cssText='text-align:center;padding:6px';\n        craftDiv.innerHTML='<div style=\"color:'+s.color+';font-size:.9rem;font-weight:700\">'+_crIco(cd,15)+' '+_crStarN(s)+' '+_crDefN(cd)+'</div><div style=\"color:#887766;font-size:.8rem\">'+_L('제작 비용: 가루 ','Cost: Dust ')+dustCost+(CRYSTAL_DUST<dustCost?(' <span style=\"color:#ff4444\">'+_L('(부족)','(insufficient)')+'</span>'):'')+'</div>';\n        const btn=document.createElement('button');btn.style.cssText='margin-top:4px;padding:5px 20px;font-size:.85rem;font-family:\"Noto Sans KR\";font-weight:700;cursor:'+(ok?'pointer':'not-allowed')+';border:2px solid '+(ok?'#44ff88':'#332211')+';background:'+(ok?'rgba(68,255,136,.1)':'rgba(0,0,0,.2)')+';color:'+(ok?'#88ffcc':'#554433')+';border-radius:6px';\n        btn.textContent=_T('🔨 제작');\n        btn.onclick=()=>{if(!ok)return;CRYSTAL_DUST-=dustCost;CRYSTAL_BAG.push({id:_crCraftType,star:_crCraftStar,enh:0});SFX.forge();addTxt(P.x,P.y-20,_crStarN(s)+' '+_crDefN(cd)+' '+_T('제작!'),s.color,60);renderForge();dbSaveNow()};\n        craftDiv.appendChild(btn);grid.appendChild(craftDiv);\n      }\n      // ── 악의로 1성 결정 직접 제작 ──\n      const _crMatsCost=_malCost(50);\nconst secHdr3=document.createElement('div');secHdr3.style.cssText='color:#cc66ff;font-size:.9rem;font-weight:700;margin-bottom:4px;margin-top:8px;border-top:1px solid #332211;padding-top:6px';secHdr3.textContent=_L('악의로 1성 결정 제작 ('+_crMatsCost+' 악의)','Craft 1★ Crystal ('+_crMatsCost+' Malice)');grid.appendChild(secHdr3);\n      const mBar=document.createElement('div');mBar.style.cssText='display:flex;flex-wrap:wrap;gap:3px;margin-bottom:4px';\n      CRYSTAL_IDS.forEach(id=>{\n        const d=CRYSTAL_DEFS[id];\n        if(!d.craft)return; // HP/MP/ST만 제작 가능, 나머지는 드랍\n        const ok2=G.mats>=_crMatsCost&&CRYSTAL_BAG.length<CRYSTAL_BAG_MAX;\n        const b=document.createElement('span');b.style.cssText='cursor:'+(ok2?'pointer':'not-allowed')+';padding:2px 6px;font-size:.8rem;border:1px solid '+(ok2?'#cc66ff':'#332211')+';color:'+(ok2?'#ddaaff':'#554433')+';background:'+(ok2?'rgba(200,100,255,.1)':'rgba(0,0,0,.2)')+';border-radius:3px';\n        b.innerHTML=_crIco(d,14)+' '+_crDefN(d);\n        b.onclick=()=>{if(G.mats<_crMatsCost){notify(_T('악의가 부족합니다!'));return}if(CRYSTAL_BAG.length>=CRYSTAL_BAG_MAX){notify(_T('결정 주머니 가득!'));return}G.mats-=_crMatsCost;CRYSTAL_BAG.push({id,star:0,enh:0});SFX.forge();addTxt(P.x,P.y-20,d.emoji+' '+_crStarN(CRYSTAL_STAR[0])+' '+_crDefN(d)+' '+_T('제작!'),'#cc66ff',50);renderForge();dbSaveNow()};\n        mBar.appendChild(b);\n      });\n      grid.appendChild(mBar);\n    }\n  }else if(G.forgeTab==='craft'){\n    // ═══ 제작 종합 — 모든 장비 한눈에 ═══\n    grid.style.gridTemplateColumns='1fr';\n    const _craftSlots=['weapon','bow','armor','shield','helmet','pants','gloves','boots','belt','necklace','ring','cape','bracelet','headband']; // ossuary 제외 (2026-09-01): 유니크 단일 지급 — 제작 불가\n    const _csNames={weapon:_L('무기','Weapon'),bow:_L('활','Bow'),armor:_L('갑옷','Armor'),shield:_L('견갑','Shield'),helmet:_L('왕관','Crown'),pants:_L('바지','Pants'),gloves:_L('장갑','Gloves'),boots:_L('부츠','Boots'),belt:_L('벨트','Belt'),necklace:_L('목걸이','Necklace'),ring:_L('반지','Ring'),cape:_L('망토','Cape'),bracelet:_L('팔찌','Bracelet'),headband:_L('귀걸이','Earring'),ossuary:_L('유골함','Ossuary')};\n    const _csEmoji={weapon:'⚔️',bow:'🏹',armor:'🦺',shield:'🛡️',helmet:'👑',pants:'👖',gloves:'🧤',boots:'👢',belt:'🥋',necklace:'📿',ring:'💍',cape:'🧣',bracelet:'⭕',headband:'🎀',ossuary:'⚱️'};\n    // 헤더\n    const chdr=document.createElement('div');chdr.style.cssText='text-align:center;padding:8px;color:#ffcc44;font-size:1.05rem;font-weight:700;letter-spacing:.15em';\n    chdr.textContent=_L('🔨 장비 제작','🔨 Equipment Crafting');\n    grid.appendChild(chdr);\n    // 비용·확률 정보\n    const cInfo=document.createElement('div');cInfo.style.cssText='text-align:center;padding:4px 8px;font-size:.85rem;color:#887766;margin-bottom:8px';\n    cInfo.innerHTML=_L('비용: ','Cost: ')+'<span style=\"color:#ffaa44;font-weight:700\">'+CRAFT_COST+'</span> '+_L('악의 &nbsp;|&nbsp; 보유: ','Malice per craft &nbsp;|&nbsp; Malice: ')+'<span style=\"color:#cc66ff;font-weight:700\">'+G.mats+'</span><br><span style=\"color:'+RARITY_C[3]+'\">'+_T('영웅')+'90%</span> &nbsp; <span style=\"color:'+RARITY_C[4]+'\">'+_T('전설')+'10%</span>';\n    grid.appendChild(cInfo);\n    // 장비 카드 그리드\n    const cGrid=document.createElement('div');cGrid.style.cssText='display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:4px';\n    _craftSlots.forEach(sl=>{\n      const curEq=sl==='ring'?INV.equipped.ring1||INV.equipped.ring2:INV.equipped[sl];\n      const card=document.createElement('div');\n      card.style.cssText='cursor:pointer;padding:8px 4px;text-align:center;background:rgba(0,0,0,.3);border:1px solid #443322;border-radius:6px;transition:all .15s';\n      card.onmouseenter=()=>{card.style.borderColor='#bb44ff';card.style.boxShadow='0 0 8px #bb44ff33'};\n      card.onmouseleave=()=>{card.style.borderColor='#443322';card.style.boxShadow='none'};\n      let curTxt='';\n      if(curEq)curTxt='<div style=\"color:'+RARITY_C[curEq.rarity||0]+';font-size:.7rem;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis\">'+_T(curEq.name)+'</div>';\n      else curTxt='<div style=\"color:#443322;font-size:.7rem;margin-top:3px\">—</div>';\n      card.innerHTML='<div style=\"font-size:1.3rem\">'+(_csEmoji[sl]||'')+'</div><div style=\"color:#ccaa77;font-size:.8rem;font-weight:700\">'+_csNames[sl]+'</div>'+curTxt;\n      card.onclick=()=>{G.forgeTab=sl;_forgeSel=null;renderForge()};\n      cGrid.appendChild(card);\n    });\n    grid.appendChild(cGrid);\n    // 하단 안내\n    const cTip=document.createElement('div');cTip.style.cssText='text-align:center;padding:6px;font-size:.78rem;color:#665544;margin-top:6px';\n    cTip.textContent=_L('슬롯을 클릭하면 제작, 좌측에서 개별 선택도 가능','Click a slot to craft, or expand ▶ to pick from sidebar');\n    grid.appendChild(cTip);\n  }else{\n    // ═══ 장비 제작 — 개별 슬롯 ═══\n    grid.style.gridTemplateColumns='1fr';\n    const slot=G.forgeTab;\n    const tier=Math.min(SI_TO_HELL[G.stage],4);\n    const slotNames={weapon:_L('무기','Weapon'),shield:_L('견갑','Shield'),armor:_L('갑옷','Armor'),helmet:_L('왕관','Crown'),boots:_L('부츠','Boots'),bow:_L('활','Bow'),gloves:_L('장갑','Gloves'),pants:_L('바지','Pants'),belt:_L('벨트','Belt'),necklace:_L('목걸이','Necklace'),ring:_L('반지','Ring'),cape:_L('망토','Cape'),bracelet:_L('팔찌','Bracelet'),headband:_L('귀걸이','Earring'),ossuary:_L('유골함','Ossuary')};\n    const slotEmoji={weapon:'⚔️',shield:'🛡️',armor:'🦺',helmet:'👑',boots:'👢',bow:'🏹',gloves:'🧤',pants:'👖',belt:'🥋',necklace:'📿',ring:'💍',cape:'🧣',bracelet:'⭕',headband:'🎀',ossuary:'⚱️'};\n\n    // 현재 장착 표시\n    const curEq=slot==='ring'?INV.equipped.ring1||INV.equipped.ring2:INV.equipped[slot];\n    const curDiv=document.createElement('div');\n    curDiv.style.cssText='text-align:center;padding:8px;margin-bottom:8px;background:rgba(0,0,0,.3);border:1px solid #332211;border-radius:4px';\n    if(curEq){\n      curDiv.innerHTML=`<div style=\"color:#887766;font-size:.8rem;margin-bottom:4px\">${_T('현재 장착')}</div><div style=\"color:${RARITY_C[curEq.rarity||0]};font-size:.95rem;font-weight:700\">${_itemIco(curEq,RARITY_C[curEq.rarity||0],15)} ${_T(curEq.name)}</div><div style=\"color:#776655;font-size:.95rem;margin-top:2px\">ATK:${curEq.atk||'-'} DEF:${curEq.def||'-'} ${_T(ELN[curEq.el]||'물리')}</div>`;\n    }else{\n      curDiv.innerHTML=`<div style=\"color:#554433;font-size:.8rem\">${_T('현재 장착')}</div><div style=\"color:#665544;font-size:.95rem\">${_T('없음 — 제작하세요!')}</div>`;\n    }\n    grid.appendChild(curDiv);\n\n    // 헤더\n    const hdr=document.createElement('div');\n    hdr.style.cssText='text-align:center;padding:6px;color:#ffcc44;font-size:1rem;font-weight:700;letter-spacing:.15em';\n    hdr.textContent=`🔨 ${slotEmoji[slot]} ${slotNames[slot]}`+_L(' 제작',' Craft').trimEnd();\n    grid.appendChild(hdr);\n\n    // 보유 악의 표시\n    const matsDiv=document.createElement('div');\n    matsDiv.style.cssText='text-align:center;padding:4px;font-size:.95rem;color:#776655';\nmatsDiv.innerHTML=_L('보유 악의: ','Malice: ')+`<span style=\"color:#cc66ff;font-weight:700\">${G.mats}</span> &nbsp;|&nbsp; `+_L('제작 비용: ','Cost: ')+`<span style=\"color:#ffaa44;font-weight:700\">${CRAFT_COST}</span>`;\n    grid.appendChild(matsDiv);\n\n    // 레어리티 확률 (영웅 90%, 전설 10%)\n    const distDiv=document.createElement('div');\n    distDiv.style.cssText='margin:10px auto;width:90%;max-width:300px;padding:8px;background:rgba(0,0,0,.3);border:1px solid #221100;border-radius:4px';\n    distDiv.innerHTML=`<div style=\"color:#776655;font-size:.95rem;margin-bottom:6px;text-align:center\">${_T('제작 확률')}</div>\n      <div style=\"display:flex;align-items:center;gap:4px;margin:2px 0\"><span style=\"color:${RARITY_C[3]};font-size:.95rem;width:28px;text-align:right\">${_T('영웅')}</span><div style=\"flex:1;height:8px;background:rgba(0,0,0,.4);border-radius:3px;overflow:hidden\"><div style=\"height:100%;width:90%;background:${RARITY_C[3]};border-radius:3px;opacity:.7\"></div></div><span style=\"color:#776655;font-size:1rem;width:28px\">90%</span></div>\n      <div style=\"display:flex;align-items:center;gap:4px;margin:2px 0\"><span style=\"color:${RARITY_C[4]};font-size:.95rem;width:28px;text-align:right\">${_T('전설')}</span><div style=\"flex:1;height:8px;background:rgba(0,0,0,.4);border-radius:3px;overflow:hidden\"><div style=\"height:100%;width:10%;background:${RARITY_C[4]};border-radius:3px;opacity:.7\"></div></div><span style=\"color:#776655;font-size:1rem;width:28px\">10%</span></div>`;\n    grid.appendChild(distDiv);\n\n    // 제작 버튼\n    const ok=G.mats>=CRAFT_COST;\n    const btn=document.createElement('button');\n    btn.style.cssText=`display:block;margin:12px auto;padding:12px 32px;font-size:1.1rem;font-family:'Noto Sans KR';font-weight:700;cursor:${ok?'pointer':'not-allowed'};border:2px solid ${ok?'#bb44ff':'#332211'};background:${ok?'linear-gradient(180deg,rgba(187,68,255,.15),rgba(68,17,100,.3))':'rgba(0,0,0,.3)'};color:${ok?'#ffcc44':'#554433'};border-radius:8px;transition:all .15s;letter-spacing:.1em`;\n    btn.textContent=_L(\"🔨 제작 (👿{p0})\",\"🔨 Craft (👿{p0})\",{p0:CRAFT_COST});\n    btn.onmouseenter=()=>{if(ok)btn.style.borderColor='#ffaa44';btn.style.boxShadow='0 0 12px #bb44ff44'};\n    btn.onmouseleave=()=>{btn.style.borderColor=ok?'#bb44ff':'#332211';btn.style.boxShadow='none'};\n    btn.onclick=function(_ev){\n      var _cnt=(_ev&&(_ev.shiftKey||_ev.ctrlKey))?10:1;\n      var _done=0;\n      for(var _ci=0;_ci<_cnt;_ci++){\n        if(G.mats<CRAFT_COST)break;\n        G.mats-=CRAFT_COST;\n        const rEl=[EL.P,EL.F,EL.I,EL.D,EL.L,EL.H][~~(Math.random()*6)];\n        const rar=Math.random()<0.90?3:4;\n        const craftSlot=slot==='ring'?(!INV.equipped.ring1?'ring1':!INV.equipped.ring2?'ring2':'ring1'):slot;\n        const wt=craftSlot==='weapon'?WTYPE_KEYS[~~(Math.random()*WTYPE_KEYS.length)]:craftSlot==='bow'?BTYPE_KEYS[~~(Math.random()*BTYPE_KEYS.length)]:undefined;\n        const item=mkItem(craftSlot,tier,rEl,rar,wt);\n        if(!INV.equipped[craftSlot]){\n          INV.equipped[craftSlot]=item;\n          SFX.pickup();playEquipSfx(item);notify(`${_rarName(rar)} ${_T(item.name)} ${_T('자동 장착!')}`);\n          recalcSt();applyStats();\n        }else{\n          pickupItem(item);\n        }\n        _done++;\n      }\n      if(_done===0){notify(_T('악의가 부족합니다!'));return}\n      if(_done>1)notify(_done+_L('개 제작 완료!',' items crafted!'));\n      G.shake=4;SFX.pickup();\n      renderForge();\n    };\n    grid.appendChild(btn);\n\n    // 무기/활 타입 표시\n    if(slot==='weapon'){\n      const wtDiv=document.createElement('div');\n      wtDiv.style.cssText='margin:6px auto;width:90%;text-align:center;color:#776655;font-size:.95rem';\n      wtDiv.innerHTML=_T('무기 타입')+': '+WTYPE_KEYS.map(k=>`<span style=\"color:#aa8855\">${WTYPES[k].emoji}${_T(WTYPES[k].name)}</span>`).join(' ');\n      grid.appendChild(wtDiv);\n    }else if(slot==='bow'){\n      const bwDiv=document.createElement('div');\n      bwDiv.style.cssText='margin:6px auto;width:90%;text-align:center;color:#776655;font-size:.95rem';\n      bwDiv.innerHTML=_T('활 타입')+': '+BTYPE_KEYS.map(k=>`<span style=\"color:#aa8855\">${BOWTYPES[k].emoji}${_T(BOWTYPES[k].name)}</span>`).join(' ');\n      grid.appendChild(bwDiv);\n    }\n  }\n}",
          "sha256": "44c24b9c9130b66b3cce2e50ff923ae06a4d35834fd2c9b01c46797a5ff0dcf1",
          "line": 47483
        },
        "enhRate": {
          "text": "function enhRate(n){\n  return Math.max(0.5,99*Math.pow(0.99,n)); // % 반환, 최소 0.5% 보장\n}",
          "sha256": "be2ef762d3119ae837dfcd3fa36c12792ec3061caa153d9ef2eb454c1e3ed703",
          "line": 25739
        },
        "enhCostRaw": {
          "text": "function enhCostRaw(n){\n  return Math.max(20000,Math.ceil((20000+n*3500)*1.5)); // 최소 2만(=1만악의), 0강=3만, 100강=55.5만, 1000강=528만\n}",
          "sha256": "861e2d4c7c9062ea551f00115e31ebc4d92113b756ecd0eae229717ae7170584",
          "line": 25748
        },
        "enhCost": {
          "text": "function enhCost(enh,rarity){\n  const rMul=[0.5,0.7,1.0,1.3,1.8][_itemEconomyRarity(rarity)];\n  return{rate:enhRate(enh)/100,cost:_malCost(Math.ceil(enhCostRaw(enh)*rMul))};\n}",
          "sha256": "fd942db7d954f6f72b5be4dcf79544975d73c57f49120439be0ed2e03e6467f9",
          "line": 25751
        },
        "_malCost": {
          "text": "function _malCost(v){\n  const _n=Number(v)||0;\n  if(_n<=0)return 0;\n  return Math.max(1,Math.ceil(_n*_MALICE_COST_MUL));\n}",
          "sha256": "b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f",
          "line": 25743
        },
        "_itemEconomyRarity": {
          "text": "function _itemEconomyRarity(r){return Number.isInteger(r)&&r>=0?Math.min(r,4):0;}",
          "sha256": "13ebcae9484f58bcc31664bb25cf22a2f489b186c2e85f3080d7fe6918f57509",
          "line": 25848
        },
        "enhColor": {
          "text": "function enhColor(enh){\n  if(enh>=1000)return'#ff00ff'; // 무지개\n  if(enh>=500) return'#ffdd00'; // 황금 오라\n  if(enh>=200) return'#ff0088'; // 분홍 불꽃\n  if(enh>=100) return'#ff4444'; // 진홍 파동\n  if(enh>=75)  return'#cc44ff'; // 보라 글로우\n  if(enh>=50)  return'#ff8844'; // 주황\n  if(enh>=25)  return'#ffcc00'; // 황금\n  if(enh>=10)  return'#44aaff'; // 하늘\n  return'#44ff88';              // 초록 기본\n}",
          "sha256": "8c9fd0ddcd814e6e37e454f73bd84a61d542b3b440b98e4d75a2a3c6cd7994dc",
          "line": 25767
        },
        "enhRateColor": {
          "text": "function enhRateColor(rate){\n  if(rate>=0.7) return'#44ff44';\n  if(rate>=0.4) return'#ffdd44';\n  if(rate>=0.1) return'#ff8844';\n  return'#ff4444';\n}",
          "sha256": "53595050c0028d4b5e4ab2c6063b056cb0555bba7645f67d4dbe7fe4ecb72507",
          "line": 25778
        },
        "enhMul": {
          "text": "function enhMul(n){\n  // DEF용: 1강당 +0.25\n  return n*0.25;\n}",
          "sha256": "abb1c531268f6c8abdfab448dc9fd3d55abac41e4bb1a64c779fa8139f30b763",
          "line": 25755
        },
        "enhMulAtk": {
          "text": "function enhMulAtk(n){\n  // ATK용: 1강당 +0.25 (2차반감 2026-05-03)\n  return n*0.25;\n}",
          "sha256": "af411c5d3f3593d0c77840e684474a560717d1505ce4cca404cb9c57a93b3ab9",
          "line": 25759
        }
      },
      "candidate": {
        "sha256": "c32d79c78918f883d85cc436592c702d72ba07afcf213247697c13a47a4875d6",
        "old": "if(G._aiTarget===undefined||G._aiTarget<=_curEnh)G._aiTarget=_curEnh+100;",
        "new": "if(!Number.isFinite(G._aiTarget)||G._aiTarget<=_curEnh)G._aiTarget=_curEnh+100;"
      },
      "panelPolicyBasis": "existing undefined/at-or-below currentEnh fallback=currentEnh+100; extend invalid target fallback, no new cap",
      "normalExpectedDisplay": 33135
    }
  ],
  "runs": [
    {
      "file": "game.html",
      "policy": "current",
      "scenario": "nonfinite target panel open",
      "input": {
        "target": "Infinity",
        "item": {
          "id": 93,
          "slot": "weapon",
          "name": "기존 무기",
          "enh": 0,
          "rarity": 2
        },
        "mats": 50000
      },
      "after": {
        "target": "Infinity",
        "item": {
          "id": 93,
          "slot": "weapon",
          "name": "기존 무기",
          "enh": 0,
          "rarity": 2
        },
        "mats": 50000,
        "paused": true,
        "forgeOpen": true
      },
      "error": {
        "name": "Error",
        "code": "ERR_SCRIPT_EXECUTION_TIMEOUT",
        "message": "Script execution timed out after 80ms"
      },
      "trace": [
        {
          "op": "closeAllPanelsStub",
          "value": false
        },
        {
          "op": "classAdd",
          "id": "forge",
          "values": [
            "on"
          ]
        },
        {
          "op": "injectNavStub",
          "id": "forge"
        },
        {
          "op": "atlasLoadStub"
        },
        {
          "op": "BGMStub",
          "key": "forge"
        },
        {
          "op": "classAdd",
          "id": "fgTabs",
          "values": [
            "atlas-v1-ready",
            "atlas-v2-ready"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        }
      ],
      "panelHTML": null,
      "DOM": [
        {
          "tag": "div",
          "id": "forge",
          "classes": [
            "on"
          ],
          "className": "",
          "text": "",
          "html": "",
          "style": {},
          "children": []
        },
        {
          "tag": "div",
          "id": "forgeMats",
          "classes": [],
          "className": "",
          "text": "악의: 50000",
          "html": "",
          "style": {},
          "children": []
        },
        {
          "tag": "div",
          "id": "forgeLore",
          "classes": [],
          "className": "",
          "text": "🔴화염→빙결 2배 | 🔵빙결→화염 2배 | ⚪물리=중립 | 악마 처치 시 악의 영혼 드롭",
          "html": "",
          "style": {},
          "children": []
        },
        {
          "tag": "div",
          "id": "fgTabs",
          "classes": [
            "atlas-v1-ready",
            "atlas-v2-ready"
          ],
          "className": "",
          "text": "",
          "html": "",
          "style": {},
          "children": [
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab act",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">강화</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/upgrade.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">물약</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/potion.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">분해</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/salvage.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">리롤</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/reroll.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">결정</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/crystal.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">제작</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/craft.png?v=20260417-v4)"
              },
              "children": []
            }
          ]
        },
        {
          "tag": "div",
          "id": "fgGrid",
          "classes": [],
          "className": "",
          "text": "",
          "html": "",
          "style": {
            "gridTemplateColumns": "1fr"
          },
          "children": [
            {
              "tag": "div",
              "id": null,
              "classes": [],
              "className": "",
              "text": "장비 강화 (실패 시 재료만 소멸)",
              "html": "",
              "style": {
                "cssText": "color:#ffaa44;font-size:.95rem;font-weight:700;margin-bottom:8px;letter-spacing:.1em;text-align:center"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [],
              "className": "fg-i",
              "text": "",
              "html": "<div class=\"fg-in\" style=\"color:c2\">⚔️ 무기 기존 무기 <span style=\"color:#44ff88\">+0</span></div><div class=\"fg-id\">강화 보너스 적용</div><div class=\"fg-ic\" style=\"display:flex;justify-content:space-between\"><span style=\"color:#44ff44;font-weight:700\">성공률 99%</span><span>악의 15000</span></div>",
              "style": {},
              "children": []
            }
          ]
        },
        {
          "tag": "div",
          "id": "forgeConfirm",
          "classes": [],
          "className": "",
          "text": "",
          "html": "",
          "style": {
            "display": "none"
          },
          "children": []
        }
      ],
      "itemIdentityPreserved": true
    },
    {
      "file": "game.html",
      "policy": "candidate",
      "scenario": "nonfinite target panel open",
      "input": {
        "target": "Infinity",
        "item": {
          "id": 93,
          "slot": "weapon",
          "name": "기존 무기",
          "enh": 0,
          "rarity": 2
        },
        "mats": 50000
      },
      "after": {
        "target": 100,
        "item": {
          "id": 93,
          "slot": "weapon",
          "name": "기존 무기",
          "enh": 0,
          "rarity": 2
        },
        "mats": 50000,
        "paused": true,
        "forgeOpen": true
      },
      "trace": [
        {
          "op": "closeAllPanelsStub",
          "value": false
        },
        {
          "op": "classAdd",
          "id": "forge",
          "values": [
            "on"
          ]
        },
        {
          "op": "injectNavStub",
          "id": "forge"
        },
        {
          "op": "atlasLoadStub"
        },
        {
          "op": "BGMStub",
          "key": "forge"
        },
        {
          "op": "classAdd",
          "id": "fgTabs",
          "values": [
            "atlas-v1-ready",
            "atlas-v2-ready"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        }
      ],
      "panelHTML": "<div style=\"color:#cc8844;font-weight:700;font-size:.95rem;margin-bottom:6px\">⚡ AI 자동 강화</div><div style=\"font-size:.8rem;color:#886644;margin-bottom:8px\">장비 선택 → 목표치 설정 → 악의 투입 → 자동 시도</div><div style=\"display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px\"><span onclick=\"G._aiEnhSlot='weapon';G._aiTarget=undefined;renderForge()\" style=\"cursor:pointer;padding:3px 8px;border:1px solid #44ccff;background:rgba(68,204,255,.15);border-radius:3px;font-size:.8rem;color:#88ddff\">⚔️ 무기 <span style=\"color:#44ff88\">+0</span></span></div><div style=\"display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-bottom:4px\"><div style=\"flex:1;min-width:80px\"><div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">목표 강화치</div><input id=\"aiTargetInp\" type=\"number\" min=\"1\" max=\"9999\" value=\"100\" style=\"width:100%;background:#0a0806;border:1px solid #443322;color:#ffcc88;padding:5px 8px;border-radius:3px;font-size:.9rem;box-sizing:border-box\" oninput=\"G._aiTarget=Math.max(1,parseInt(this.value)||1)\" onchange=\"renderForge()\"></div><div style=\"flex:1;min-width:100px\"><div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">예상 필요 악의</div><div style=\"background:#0a0806;border:1px solid #443322;color:#ffaa44;padding:5px 8px;border-radius:3px;font-size:.9rem\">28,847,999 <span style=\"color:#666;font-size:.75rem\">/ 보유 50,000</span></div></div><div><div class=\"id-btn equip\" style=\"white-space:nowrap\" onclick=\"_doAiEnhance()\">강화 시작</div></div></div><div style=\"font-size:.8rem;color:#886644;margin-top:6px\">+0 → +100 | 보유 악의 <span style=\"color:#ff4444\">✖ 부족 (28,797,999 더 필요)</span></div><div id=\"aiEnhResult\"></div>",
      "DOM": [
        {
          "tag": "div",
          "id": "forge",
          "classes": [
            "on"
          ],
          "className": "",
          "text": "",
          "html": "",
          "style": {},
          "children": []
        },
        {
          "tag": "div",
          "id": "forgeMats",
          "classes": [],
          "className": "",
          "text": "악의: 50000",
          "html": "",
          "style": {},
          "children": []
        },
        {
          "tag": "div",
          "id": "forgeLore",
          "classes": [],
          "className": "",
          "text": "🔴화염→빙결 2배 | 🔵빙결→화염 2배 | ⚪물리=중립 | 악마 처치 시 악의 영혼 드롭",
          "html": "",
          "style": {},
          "children": []
        },
        {
          "tag": "div",
          "id": "fgTabs",
          "classes": [
            "atlas-v1-ready",
            "atlas-v2-ready"
          ],
          "className": "",
          "text": "",
          "html": "",
          "style": {},
          "children": [
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab act",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">강화</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/upgrade.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">물약</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/potion.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">분해</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/salvage.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">리롤</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/reroll.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">결정</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/crystal.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">제작</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/craft.png?v=20260417-v4)"
              },
              "children": []
            }
          ]
        },
        {
          "tag": "div",
          "id": "fgGrid",
          "classes": [],
          "className": "",
          "text": "",
          "html": "",
          "style": {
            "gridTemplateColumns": "1fr"
          },
          "children": [
            {
              "tag": "div",
              "id": null,
              "classes": [],
              "className": "",
              "text": "장비 강화 (실패 시 재료만 소멸)",
              "html": "",
              "style": {
                "cssText": "color:#ffaa44;font-size:.95rem;font-weight:700;margin-bottom:8px;letter-spacing:.1em;text-align:center"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [],
              "className": "",
              "text": "",
              "html": "<div style=\"color:#cc8844;font-weight:700;font-size:.95rem;margin-bottom:6px\">⚡ AI 자동 강화</div><div style=\"font-size:.8rem;color:#886644;margin-bottom:8px\">장비 선택 → 목표치 설정 → 악의 투입 → 자동 시도</div><div style=\"display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px\"><span onclick=\"G._aiEnhSlot='weapon';G._aiTarget=undefined;renderForge()\" style=\"cursor:pointer;padding:3px 8px;border:1px solid #44ccff;background:rgba(68,204,255,.15);border-radius:3px;font-size:.8rem;color:#88ddff\">⚔️ 무기 <span style=\"color:#44ff88\">+0</span></span></div><div style=\"display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-bottom:4px\"><div style=\"flex:1;min-width:80px\"><div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">목표 강화치</div><input id=\"aiTargetInp\" type=\"number\" min=\"1\" max=\"9999\" value=\"100\" style=\"width:100%;background:#0a0806;border:1px solid #443322;color:#ffcc88;padding:5px 8px;border-radius:3px;font-size:.9rem;box-sizing:border-box\" oninput=\"G._aiTarget=Math.max(1,parseInt(this.value)||1)\" onchange=\"renderForge()\"></div><div style=\"flex:1;min-width:100px\"><div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">예상 필요 악의</div><div style=\"background:#0a0806;border:1px solid #443322;color:#ffaa44;padding:5px 8px;border-radius:3px;font-size:.9rem\">28,847,999 <span style=\"color:#666;font-size:.75rem\">/ 보유 50,000</span></div></div><div><div class=\"id-btn equip\" style=\"white-space:nowrap\" onclick=\"_doAiEnhance()\">강화 시작</div></div></div><div style=\"font-size:.8rem;color:#886644;margin-top:6px\">+0 → +100 | 보유 악의 <span style=\"color:#ff4444\">✖ 부족 (28,797,999 더 필요)</span></div><div id=\"aiEnhResult\"></div>",
              "style": {
                "cssText": "margin-top:16px;border-top:1px solid #443322;padding-top:14px"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [],
              "className": "fg-i",
              "text": "",
              "html": "<div class=\"fg-in\" style=\"color:c2\">⚔️ 무기 기존 무기 <span style=\"color:#44ff88\">+0</span></div><div class=\"fg-id\">강화 보너스 적용</div><div class=\"fg-ic\" style=\"display:flex;justify-content:space-between\"><span style=\"color:#44ff44;font-weight:700\">성공률 99%</span><span>악의 15000</span></div>",
              "style": {},
              "children": []
            }
          ]
        },
        {
          "tag": "div",
          "id": "forgeConfirm",
          "classes": [],
          "className": "",
          "text": "",
          "html": "",
          "style": {
            "display": "none"
          },
          "children": []
        }
      ],
      "itemIdentityPreserved": true
    },
    {
      "file": "game.html",
      "policy": "current",
      "scenario": "normal target2 panel open",
      "input": {
        "target": 2,
        "item": {
          "id": 93,
          "slot": "weapon",
          "name": "기존 무기",
          "enh": 0,
          "rarity": 2
        },
        "mats": 50000
      },
      "after": {
        "target": 2,
        "item": {
          "id": 93,
          "slot": "weapon",
          "name": "기존 무기",
          "enh": 0,
          "rarity": 2
        },
        "mats": 50000,
        "paused": true,
        "forgeOpen": true
      },
      "trace": [
        {
          "op": "closeAllPanelsStub",
          "value": false
        },
        {
          "op": "classAdd",
          "id": "forge",
          "values": [
            "on"
          ]
        },
        {
          "op": "injectNavStub",
          "id": "forge"
        },
        {
          "op": "atlasLoadStub"
        },
        {
          "op": "BGMStub",
          "key": "forge"
        },
        {
          "op": "classAdd",
          "id": "fgTabs",
          "values": [
            "atlas-v1-ready",
            "atlas-v2-ready"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        }
      ],
      "panelHTML": "<div style=\"color:#cc8844;font-weight:700;font-size:.95rem;margin-bottom:6px\">⚡ AI 자동 강화</div><div style=\"font-size:.8rem;color:#886644;margin-bottom:8px\">장비 선택 → 목표치 설정 → 악의 투입 → 자동 시도</div><div style=\"display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px\"><span onclick=\"G._aiEnhSlot='weapon';G._aiTarget=undefined;renderForge()\" style=\"cursor:pointer;padding:3px 8px;border:1px solid #44ccff;background:rgba(68,204,255,.15);border-radius:3px;font-size:.8rem;color:#88ddff\">⚔️ 무기 <span style=\"color:#44ff88\">+0</span></span></div><div style=\"display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-bottom:4px\"><div style=\"flex:1;min-width:80px\"><div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">목표 강화치</div><input id=\"aiTargetInp\" type=\"number\" min=\"1\" max=\"9999\" value=\"2\" style=\"width:100%;background:#0a0806;border:1px solid #443322;color:#ffcc88;padding:5px 8px;border-radius:3px;font-size:.9rem;box-sizing:border-box\" oninput=\"G._aiTarget=Math.max(1,parseInt(this.value)||1)\" onchange=\"renderForge()\"></div><div style=\"flex:1;min-width:100px\"><div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">예상 필요 악의</div><div style=\"background:#0a0806;border:1px solid #443322;color:#ffaa44;padding:5px 8px;border-radius:3px;font-size:.9rem\">33,135 <span style=\"color:#666;font-size:.75rem\">/ 보유 50,000</span></div></div><div><div class=\"id-btn equip\" style=\"white-space:nowrap\" onclick=\"_doAiEnhance()\">강화 시작</div></div></div><div style=\"font-size:.8rem;color:#886644;margin-top:6px\">+0 → +2 | 보유 악의 <span style=\"color:#44ff88\">✔ 충분</span></div><div id=\"aiEnhResult\"></div>",
      "DOM": [
        {
          "tag": "div",
          "id": "forge",
          "classes": [
            "on"
          ],
          "className": "",
          "text": "",
          "html": "",
          "style": {},
          "children": []
        },
        {
          "tag": "div",
          "id": "forgeMats",
          "classes": [],
          "className": "",
          "text": "악의: 50000",
          "html": "",
          "style": {},
          "children": []
        },
        {
          "tag": "div",
          "id": "forgeLore",
          "classes": [],
          "className": "",
          "text": "🔴화염→빙결 2배 | 🔵빙결→화염 2배 | ⚪물리=중립 | 악마 처치 시 악의 영혼 드롭",
          "html": "",
          "style": {},
          "children": []
        },
        {
          "tag": "div",
          "id": "fgTabs",
          "classes": [
            "atlas-v1-ready",
            "atlas-v2-ready"
          ],
          "className": "",
          "text": "",
          "html": "",
          "style": {},
          "children": [
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab act",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">강화</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/upgrade.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">물약</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/potion.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">분해</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/salvage.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">리롤</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/reroll.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">결정</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/crystal.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">제작</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/craft.png?v=20260417-v4)"
              },
              "children": []
            }
          ]
        },
        {
          "tag": "div",
          "id": "fgGrid",
          "classes": [],
          "className": "",
          "text": "",
          "html": "",
          "style": {
            "gridTemplateColumns": "1fr"
          },
          "children": [
            {
              "tag": "div",
              "id": null,
              "classes": [],
              "className": "",
              "text": "장비 강화 (실패 시 재료만 소멸)",
              "html": "",
              "style": {
                "cssText": "color:#ffaa44;font-size:.95rem;font-weight:700;margin-bottom:8px;letter-spacing:.1em;text-align:center"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [],
              "className": "",
              "text": "",
              "html": "<div style=\"color:#cc8844;font-weight:700;font-size:.95rem;margin-bottom:6px\">⚡ AI 자동 강화</div><div style=\"font-size:.8rem;color:#886644;margin-bottom:8px\">장비 선택 → 목표치 설정 → 악의 투입 → 자동 시도</div><div style=\"display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px\"><span onclick=\"G._aiEnhSlot='weapon';G._aiTarget=undefined;renderForge()\" style=\"cursor:pointer;padding:3px 8px;border:1px solid #44ccff;background:rgba(68,204,255,.15);border-radius:3px;font-size:.8rem;color:#88ddff\">⚔️ 무기 <span style=\"color:#44ff88\">+0</span></span></div><div style=\"display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-bottom:4px\"><div style=\"flex:1;min-width:80px\"><div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">목표 강화치</div><input id=\"aiTargetInp\" type=\"number\" min=\"1\" max=\"9999\" value=\"2\" style=\"width:100%;background:#0a0806;border:1px solid #443322;color:#ffcc88;padding:5px 8px;border-radius:3px;font-size:.9rem;box-sizing:border-box\" oninput=\"G._aiTarget=Math.max(1,parseInt(this.value)||1)\" onchange=\"renderForge()\"></div><div style=\"flex:1;min-width:100px\"><div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">예상 필요 악의</div><div style=\"background:#0a0806;border:1px solid #443322;color:#ffaa44;padding:5px 8px;border-radius:3px;font-size:.9rem\">33,135 <span style=\"color:#666;font-size:.75rem\">/ 보유 50,000</span></div></div><div><div class=\"id-btn equip\" style=\"white-space:nowrap\" onclick=\"_doAiEnhance()\">강화 시작</div></div></div><div style=\"font-size:.8rem;color:#886644;margin-top:6px\">+0 → +2 | 보유 악의 <span style=\"color:#44ff88\">✔ 충분</span></div><div id=\"aiEnhResult\"></div>",
              "style": {
                "cssText": "margin-top:16px;border-top:1px solid #443322;padding-top:14px"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [],
              "className": "fg-i",
              "text": "",
              "html": "<div class=\"fg-in\" style=\"color:c2\">⚔️ 무기 기존 무기 <span style=\"color:#44ff88\">+0</span></div><div class=\"fg-id\">강화 보너스 적용</div><div class=\"fg-ic\" style=\"display:flex;justify-content:space-between\"><span style=\"color:#44ff44;font-weight:700\">성공률 99%</span><span>악의 15000</span></div>",
              "style": {},
              "children": []
            }
          ]
        },
        {
          "tag": "div",
          "id": "forgeConfirm",
          "classes": [],
          "className": "",
          "text": "",
          "html": "",
          "style": {
            "display": "none"
          },
          "children": []
        }
      ],
      "itemIdentityPreserved": true
    },
    {
      "file": "game.html",
      "policy": "candidate",
      "scenario": "normal target2 panel open",
      "input": {
        "target": 2,
        "item": {
          "id": 93,
          "slot": "weapon",
          "name": "기존 무기",
          "enh": 0,
          "rarity": 2
        },
        "mats": 50000
      },
      "after": {
        "target": 2,
        "item": {
          "id": 93,
          "slot": "weapon",
          "name": "기존 무기",
          "enh": 0,
          "rarity": 2
        },
        "mats": 50000,
        "paused": true,
        "forgeOpen": true
      },
      "trace": [
        {
          "op": "closeAllPanelsStub",
          "value": false
        },
        {
          "op": "classAdd",
          "id": "forge",
          "values": [
            "on"
          ]
        },
        {
          "op": "injectNavStub",
          "id": "forge"
        },
        {
          "op": "atlasLoadStub"
        },
        {
          "op": "BGMStub",
          "key": "forge"
        },
        {
          "op": "classAdd",
          "id": "fgTabs",
          "values": [
            "atlas-v1-ready",
            "atlas-v2-ready"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        }
      ],
      "panelHTML": "<div style=\"color:#cc8844;font-weight:700;font-size:.95rem;margin-bottom:6px\">⚡ AI 자동 강화</div><div style=\"font-size:.8rem;color:#886644;margin-bottom:8px\">장비 선택 → 목표치 설정 → 악의 투입 → 자동 시도</div><div style=\"display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px\"><span onclick=\"G._aiEnhSlot='weapon';G._aiTarget=undefined;renderForge()\" style=\"cursor:pointer;padding:3px 8px;border:1px solid #44ccff;background:rgba(68,204,255,.15);border-radius:3px;font-size:.8rem;color:#88ddff\">⚔️ 무기 <span style=\"color:#44ff88\">+0</span></span></div><div style=\"display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-bottom:4px\"><div style=\"flex:1;min-width:80px\"><div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">목표 강화치</div><input id=\"aiTargetInp\" type=\"number\" min=\"1\" max=\"9999\" value=\"2\" style=\"width:100%;background:#0a0806;border:1px solid #443322;color:#ffcc88;padding:5px 8px;border-radius:3px;font-size:.9rem;box-sizing:border-box\" oninput=\"G._aiTarget=Math.max(1,parseInt(this.value)||1)\" onchange=\"renderForge()\"></div><div style=\"flex:1;min-width:100px\"><div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">예상 필요 악의</div><div style=\"background:#0a0806;border:1px solid #443322;color:#ffaa44;padding:5px 8px;border-radius:3px;font-size:.9rem\">33,135 <span style=\"color:#666;font-size:.75rem\">/ 보유 50,000</span></div></div><div><div class=\"id-btn equip\" style=\"white-space:nowrap\" onclick=\"_doAiEnhance()\">강화 시작</div></div></div><div style=\"font-size:.8rem;color:#886644;margin-top:6px\">+0 → +2 | 보유 악의 <span style=\"color:#44ff88\">✔ 충분</span></div><div id=\"aiEnhResult\"></div>",
      "DOM": [
        {
          "tag": "div",
          "id": "forge",
          "classes": [
            "on"
          ],
          "className": "",
          "text": "",
          "html": "",
          "style": {},
          "children": []
        },
        {
          "tag": "div",
          "id": "forgeMats",
          "classes": [],
          "className": "",
          "text": "악의: 50000",
          "html": "",
          "style": {},
          "children": []
        },
        {
          "tag": "div",
          "id": "forgeLore",
          "classes": [],
          "className": "",
          "text": "🔴화염→빙결 2배 | 🔵빙결→화염 2배 | ⚪물리=중립 | 악마 처치 시 악의 영혼 드롭",
          "html": "",
          "style": {},
          "children": []
        },
        {
          "tag": "div",
          "id": "fgTabs",
          "classes": [
            "atlas-v1-ready",
            "atlas-v2-ready"
          ],
          "className": "",
          "text": "",
          "html": "",
          "style": {},
          "children": [
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab act",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">강화</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/upgrade.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">물약</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/potion.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">분해</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/salvage.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">리롤</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/reroll.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">결정</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/crystal.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">제작</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/craft.png?v=20260417-v4)"
              },
              "children": []
            }
          ]
        },
        {
          "tag": "div",
          "id": "fgGrid",
          "classes": [],
          "className": "",
          "text": "",
          "html": "",
          "style": {
            "gridTemplateColumns": "1fr"
          },
          "children": [
            {
              "tag": "div",
              "id": null,
              "classes": [],
              "className": "",
              "text": "장비 강화 (실패 시 재료만 소멸)",
              "html": "",
              "style": {
                "cssText": "color:#ffaa44;font-size:.95rem;font-weight:700;margin-bottom:8px;letter-spacing:.1em;text-align:center"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [],
              "className": "",
              "text": "",
              "html": "<div style=\"color:#cc8844;font-weight:700;font-size:.95rem;margin-bottom:6px\">⚡ AI 자동 강화</div><div style=\"font-size:.8rem;color:#886644;margin-bottom:8px\">장비 선택 → 목표치 설정 → 악의 투입 → 자동 시도</div><div style=\"display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px\"><span onclick=\"G._aiEnhSlot='weapon';G._aiTarget=undefined;renderForge()\" style=\"cursor:pointer;padding:3px 8px;border:1px solid #44ccff;background:rgba(68,204,255,.15);border-radius:3px;font-size:.8rem;color:#88ddff\">⚔️ 무기 <span style=\"color:#44ff88\">+0</span></span></div><div style=\"display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-bottom:4px\"><div style=\"flex:1;min-width:80px\"><div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">목표 강화치</div><input id=\"aiTargetInp\" type=\"number\" min=\"1\" max=\"9999\" value=\"2\" style=\"width:100%;background:#0a0806;border:1px solid #443322;color:#ffcc88;padding:5px 8px;border-radius:3px;font-size:.9rem;box-sizing:border-box\" oninput=\"G._aiTarget=Math.max(1,parseInt(this.value)||1)\" onchange=\"renderForge()\"></div><div style=\"flex:1;min-width:100px\"><div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">예상 필요 악의</div><div style=\"background:#0a0806;border:1px solid #443322;color:#ffaa44;padding:5px 8px;border-radius:3px;font-size:.9rem\">33,135 <span style=\"color:#666;font-size:.75rem\">/ 보유 50,000</span></div></div><div><div class=\"id-btn equip\" style=\"white-space:nowrap\" onclick=\"_doAiEnhance()\">강화 시작</div></div></div><div style=\"font-size:.8rem;color:#886644;margin-top:6px\">+0 → +2 | 보유 악의 <span style=\"color:#44ff88\">✔ 충분</span></div><div id=\"aiEnhResult\"></div>",
              "style": {
                "cssText": "margin-top:16px;border-top:1px solid #443322;padding-top:14px"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [],
              "className": "fg-i",
              "text": "",
              "html": "<div class=\"fg-in\" style=\"color:c2\">⚔️ 무기 기존 무기 <span style=\"color:#44ff88\">+0</span></div><div class=\"fg-id\">강화 보너스 적용</div><div class=\"fg-ic\" style=\"display:flex;justify-content:space-between\"><span style=\"color:#44ff44;font-weight:700\">성공률 99%</span><span>악의 15000</span></div>",
              "style": {},
              "children": []
            }
          ]
        },
        {
          "tag": "div",
          "id": "forgeConfirm",
          "classes": [],
          "className": "",
          "text": "",
          "html": "",
          "style": {
            "display": "none"
          },
          "children": []
        }
      ],
      "itemIdentityPreserved": true
    },
    {
      "file": "game-easy-test.html",
      "policy": "current",
      "scenario": "nonfinite target panel open",
      "input": {
        "target": "Infinity",
        "item": {
          "id": 93,
          "slot": "weapon",
          "name": "기존 무기",
          "enh": 0,
          "rarity": 2
        },
        "mats": 50000
      },
      "after": {
        "target": "Infinity",
        "item": {
          "id": 93,
          "slot": "weapon",
          "name": "기존 무기",
          "enh": 0,
          "rarity": 2
        },
        "mats": 50000,
        "paused": true,
        "forgeOpen": true
      },
      "error": {
        "name": "Error",
        "code": "ERR_SCRIPT_EXECUTION_TIMEOUT",
        "message": "Script execution timed out after 80ms"
      },
      "trace": [
        {
          "op": "closeAllPanelsStub",
          "value": false
        },
        {
          "op": "classAdd",
          "id": "forge",
          "values": [
            "on"
          ]
        },
        {
          "op": "injectNavStub",
          "id": "forge"
        },
        {
          "op": "atlasLoadStub"
        },
        {
          "op": "BGMStub",
          "key": "forge"
        },
        {
          "op": "classAdd",
          "id": "fgTabs",
          "values": [
            "atlas-v1-ready",
            "atlas-v2-ready"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        }
      ],
      "panelHTML": null,
      "DOM": [
        {
          "tag": "div",
          "id": "forge",
          "classes": [
            "on"
          ],
          "className": "",
          "text": "",
          "html": "",
          "style": {},
          "children": []
        },
        {
          "tag": "div",
          "id": "forgeMats",
          "classes": [],
          "className": "",
          "text": "악의: 50000",
          "html": "",
          "style": {},
          "children": []
        },
        {
          "tag": "div",
          "id": "forgeLore",
          "classes": [],
          "className": "",
          "text": "🔴화염→빙결 2배 | 🔵빙결→화염 2배 | ⚪물리=중립 | 악마 처치 시 악의 영혼 드롭",
          "html": "",
          "style": {},
          "children": []
        },
        {
          "tag": "div",
          "id": "fgTabs",
          "classes": [
            "atlas-v1-ready",
            "atlas-v2-ready"
          ],
          "className": "",
          "text": "",
          "html": "",
          "style": {},
          "children": [
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab act",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">강화</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/upgrade.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">물약</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/potion.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">분해</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/salvage.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">리롤</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/reroll.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">결정</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/crystal.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">제작</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/craft.png?v=20260417-v4)"
              },
              "children": []
            }
          ]
        },
        {
          "tag": "div",
          "id": "fgGrid",
          "classes": [],
          "className": "",
          "text": "",
          "html": "",
          "style": {
            "gridTemplateColumns": "1fr"
          },
          "children": [
            {
              "tag": "div",
              "id": null,
              "classes": [],
              "className": "",
              "text": "장비 강화 (실패 시 재료만 소멸)",
              "html": "",
              "style": {
                "cssText": "color:#ffaa44;font-size:.95rem;font-weight:700;margin-bottom:8px;letter-spacing:.1em;text-align:center"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [],
              "className": "fg-i",
              "text": "",
              "html": "<div class=\"fg-in\" style=\"color:c2\">⚔️ 무기 기존 무기 <span style=\"color:#44ff88\">+0</span></div><div class=\"fg-id\">강화 보너스 적용</div><div class=\"fg-ic\" style=\"display:flex;justify-content:space-between\"><span style=\"color:#44ff44;font-weight:700\">성공률 99%</span><span>악의 15000</span></div>",
              "style": {},
              "children": []
            }
          ]
        },
        {
          "tag": "div",
          "id": "forgeConfirm",
          "classes": [],
          "className": "",
          "text": "",
          "html": "",
          "style": {
            "display": "none"
          },
          "children": []
        }
      ],
      "itemIdentityPreserved": true
    },
    {
      "file": "game-easy-test.html",
      "policy": "candidate",
      "scenario": "nonfinite target panel open",
      "input": {
        "target": "Infinity",
        "item": {
          "id": 93,
          "slot": "weapon",
          "name": "기존 무기",
          "enh": 0,
          "rarity": 2
        },
        "mats": 50000
      },
      "after": {
        "target": 100,
        "item": {
          "id": 93,
          "slot": "weapon",
          "name": "기존 무기",
          "enh": 0,
          "rarity": 2
        },
        "mats": 50000,
        "paused": true,
        "forgeOpen": true
      },
      "trace": [
        {
          "op": "closeAllPanelsStub",
          "value": false
        },
        {
          "op": "classAdd",
          "id": "forge",
          "values": [
            "on"
          ]
        },
        {
          "op": "injectNavStub",
          "id": "forge"
        },
        {
          "op": "atlasLoadStub"
        },
        {
          "op": "BGMStub",
          "key": "forge"
        },
        {
          "op": "classAdd",
          "id": "fgTabs",
          "values": [
            "atlas-v1-ready",
            "atlas-v2-ready"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        }
      ],
      "panelHTML": "<div style=\"color:#cc8844;font-weight:700;font-size:.95rem;margin-bottom:6px\">⚡ AI 자동 강화</div><div style=\"font-size:.8rem;color:#886644;margin-bottom:8px\">장비 선택 → 목표치 설정 → 악의 투입 → 자동 시도</div><div style=\"display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px\"><span onclick=\"G._aiEnhSlot='weapon';G._aiTarget=undefined;renderForge()\" style=\"cursor:pointer;padding:3px 8px;border:1px solid #44ccff;background:rgba(68,204,255,.15);border-radius:3px;font-size:.8rem;color:#88ddff\">⚔️ 무기 <span style=\"color:#44ff88\">+0</span></span></div><div style=\"display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-bottom:4px\"><div style=\"flex:1;min-width:80px\"><div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">목표 강화치</div><input id=\"aiTargetInp\" type=\"number\" min=\"1\" max=\"9999\" value=\"100\" style=\"width:100%;background:#0a0806;border:1px solid #443322;color:#ffcc88;padding:5px 8px;border-radius:3px;font-size:.9rem;box-sizing:border-box\" oninput=\"G._aiTarget=Math.max(1,parseInt(this.value)||1)\" onchange=\"renderForge()\"></div><div style=\"flex:1;min-width:100px\"><div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">예상 필요 악의</div><div style=\"background:#0a0806;border:1px solid #443322;color:#ffaa44;padding:5px 8px;border-radius:3px;font-size:.9rem\">28,847,999 <span style=\"color:#666;font-size:.75rem\">/ 보유 50,000</span></div></div><div><div class=\"id-btn equip\" style=\"white-space:nowrap\" onclick=\"_doAiEnhance()\">강화 시작</div></div></div><div style=\"font-size:.8rem;color:#886644;margin-top:6px\">+0 → +100 | 보유 악의 <span style=\"color:#ff4444\">✖ 부족 (28,797,999 더 필요)</span></div><div id=\"aiEnhResult\"></div>",
      "DOM": [
        {
          "tag": "div",
          "id": "forge",
          "classes": [
            "on"
          ],
          "className": "",
          "text": "",
          "html": "",
          "style": {},
          "children": []
        },
        {
          "tag": "div",
          "id": "forgeMats",
          "classes": [],
          "className": "",
          "text": "악의: 50000",
          "html": "",
          "style": {},
          "children": []
        },
        {
          "tag": "div",
          "id": "forgeLore",
          "classes": [],
          "className": "",
          "text": "🔴화염→빙결 2배 | 🔵빙결→화염 2배 | ⚪물리=중립 | 악마 처치 시 악의 영혼 드롭",
          "html": "",
          "style": {},
          "children": []
        },
        {
          "tag": "div",
          "id": "fgTabs",
          "classes": [
            "atlas-v1-ready",
            "atlas-v2-ready"
          ],
          "className": "",
          "text": "",
          "html": "",
          "style": {},
          "children": [
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab act",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">강화</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/upgrade.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">물약</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/potion.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">분해</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/salvage.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">리롤</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/reroll.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">결정</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/crystal.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">제작</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/craft.png?v=20260417-v4)"
              },
              "children": []
            }
          ]
        },
        {
          "tag": "div",
          "id": "fgGrid",
          "classes": [],
          "className": "",
          "text": "",
          "html": "",
          "style": {
            "gridTemplateColumns": "1fr"
          },
          "children": [
            {
              "tag": "div",
              "id": null,
              "classes": [],
              "className": "",
              "text": "장비 강화 (실패 시 재료만 소멸)",
              "html": "",
              "style": {
                "cssText": "color:#ffaa44;font-size:.95rem;font-weight:700;margin-bottom:8px;letter-spacing:.1em;text-align:center"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [],
              "className": "",
              "text": "",
              "html": "<div style=\"color:#cc8844;font-weight:700;font-size:.95rem;margin-bottom:6px\">⚡ AI 자동 강화</div><div style=\"font-size:.8rem;color:#886644;margin-bottom:8px\">장비 선택 → 목표치 설정 → 악의 투입 → 자동 시도</div><div style=\"display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px\"><span onclick=\"G._aiEnhSlot='weapon';G._aiTarget=undefined;renderForge()\" style=\"cursor:pointer;padding:3px 8px;border:1px solid #44ccff;background:rgba(68,204,255,.15);border-radius:3px;font-size:.8rem;color:#88ddff\">⚔️ 무기 <span style=\"color:#44ff88\">+0</span></span></div><div style=\"display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-bottom:4px\"><div style=\"flex:1;min-width:80px\"><div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">목표 강화치</div><input id=\"aiTargetInp\" type=\"number\" min=\"1\" max=\"9999\" value=\"100\" style=\"width:100%;background:#0a0806;border:1px solid #443322;color:#ffcc88;padding:5px 8px;border-radius:3px;font-size:.9rem;box-sizing:border-box\" oninput=\"G._aiTarget=Math.max(1,parseInt(this.value)||1)\" onchange=\"renderForge()\"></div><div style=\"flex:1;min-width:100px\"><div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">예상 필요 악의</div><div style=\"background:#0a0806;border:1px solid #443322;color:#ffaa44;padding:5px 8px;border-radius:3px;font-size:.9rem\">28,847,999 <span style=\"color:#666;font-size:.75rem\">/ 보유 50,000</span></div></div><div><div class=\"id-btn equip\" style=\"white-space:nowrap\" onclick=\"_doAiEnhance()\">강화 시작</div></div></div><div style=\"font-size:.8rem;color:#886644;margin-top:6px\">+0 → +100 | 보유 악의 <span style=\"color:#ff4444\">✖ 부족 (28,797,999 더 필요)</span></div><div id=\"aiEnhResult\"></div>",
              "style": {
                "cssText": "margin-top:16px;border-top:1px solid #443322;padding-top:14px"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [],
              "className": "fg-i",
              "text": "",
              "html": "<div class=\"fg-in\" style=\"color:c2\">⚔️ 무기 기존 무기 <span style=\"color:#44ff88\">+0</span></div><div class=\"fg-id\">강화 보너스 적용</div><div class=\"fg-ic\" style=\"display:flex;justify-content:space-between\"><span style=\"color:#44ff44;font-weight:700\">성공률 99%</span><span>악의 15000</span></div>",
              "style": {},
              "children": []
            }
          ]
        },
        {
          "tag": "div",
          "id": "forgeConfirm",
          "classes": [],
          "className": "",
          "text": "",
          "html": "",
          "style": {
            "display": "none"
          },
          "children": []
        }
      ],
      "itemIdentityPreserved": true
    },
    {
      "file": "game-easy-test.html",
      "policy": "current",
      "scenario": "normal target2 panel open",
      "input": {
        "target": 2,
        "item": {
          "id": 93,
          "slot": "weapon",
          "name": "기존 무기",
          "enh": 0,
          "rarity": 2
        },
        "mats": 50000
      },
      "after": {
        "target": 2,
        "item": {
          "id": 93,
          "slot": "weapon",
          "name": "기존 무기",
          "enh": 0,
          "rarity": 2
        },
        "mats": 50000,
        "paused": true,
        "forgeOpen": true
      },
      "trace": [
        {
          "op": "closeAllPanelsStub",
          "value": false
        },
        {
          "op": "classAdd",
          "id": "forge",
          "values": [
            "on"
          ]
        },
        {
          "op": "injectNavStub",
          "id": "forge"
        },
        {
          "op": "atlasLoadStub"
        },
        {
          "op": "BGMStub",
          "key": "forge"
        },
        {
          "op": "classAdd",
          "id": "fgTabs",
          "values": [
            "atlas-v1-ready",
            "atlas-v2-ready"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        }
      ],
      "panelHTML": "<div style=\"color:#cc8844;font-weight:700;font-size:.95rem;margin-bottom:6px\">⚡ AI 자동 강화</div><div style=\"font-size:.8rem;color:#886644;margin-bottom:8px\">장비 선택 → 목표치 설정 → 악의 투입 → 자동 시도</div><div style=\"display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px\"><span onclick=\"G._aiEnhSlot='weapon';G._aiTarget=undefined;renderForge()\" style=\"cursor:pointer;padding:3px 8px;border:1px solid #44ccff;background:rgba(68,204,255,.15);border-radius:3px;font-size:.8rem;color:#88ddff\">⚔️ 무기 <span style=\"color:#44ff88\">+0</span></span></div><div style=\"display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-bottom:4px\"><div style=\"flex:1;min-width:80px\"><div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">목표 강화치</div><input id=\"aiTargetInp\" type=\"number\" min=\"1\" max=\"9999\" value=\"2\" style=\"width:100%;background:#0a0806;border:1px solid #443322;color:#ffcc88;padding:5px 8px;border-radius:3px;font-size:.9rem;box-sizing:border-box\" oninput=\"G._aiTarget=Math.max(1,parseInt(this.value)||1)\" onchange=\"renderForge()\"></div><div style=\"flex:1;min-width:100px\"><div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">예상 필요 악의</div><div style=\"background:#0a0806;border:1px solid #443322;color:#ffaa44;padding:5px 8px;border-radius:3px;font-size:.9rem\">33,135 <span style=\"color:#666;font-size:.75rem\">/ 보유 50,000</span></div></div><div><div class=\"id-btn equip\" style=\"white-space:nowrap\" onclick=\"_doAiEnhance()\">강화 시작</div></div></div><div style=\"font-size:.8rem;color:#886644;margin-top:6px\">+0 → +2 | 보유 악의 <span style=\"color:#44ff88\">✔ 충분</span></div><div id=\"aiEnhResult\"></div>",
      "DOM": [
        {
          "tag": "div",
          "id": "forge",
          "classes": [
            "on"
          ],
          "className": "",
          "text": "",
          "html": "",
          "style": {},
          "children": []
        },
        {
          "tag": "div",
          "id": "forgeMats",
          "classes": [],
          "className": "",
          "text": "악의: 50000",
          "html": "",
          "style": {},
          "children": []
        },
        {
          "tag": "div",
          "id": "forgeLore",
          "classes": [],
          "className": "",
          "text": "🔴화염→빙결 2배 | 🔵빙결→화염 2배 | ⚪물리=중립 | 악마 처치 시 악의 영혼 드롭",
          "html": "",
          "style": {},
          "children": []
        },
        {
          "tag": "div",
          "id": "fgTabs",
          "classes": [
            "atlas-v1-ready",
            "atlas-v2-ready"
          ],
          "className": "",
          "text": "",
          "html": "",
          "style": {},
          "children": [
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab act",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">강화</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/upgrade.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">물약</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/potion.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">분해</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/salvage.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">리롤</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/reroll.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">결정</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/crystal.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">제작</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/craft.png?v=20260417-v4)"
              },
              "children": []
            }
          ]
        },
        {
          "tag": "div",
          "id": "fgGrid",
          "classes": [],
          "className": "",
          "text": "",
          "html": "",
          "style": {
            "gridTemplateColumns": "1fr"
          },
          "children": [
            {
              "tag": "div",
              "id": null,
              "classes": [],
              "className": "",
              "text": "장비 강화 (실패 시 재료만 소멸)",
              "html": "",
              "style": {
                "cssText": "color:#ffaa44;font-size:.95rem;font-weight:700;margin-bottom:8px;letter-spacing:.1em;text-align:center"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [],
              "className": "",
              "text": "",
              "html": "<div style=\"color:#cc8844;font-weight:700;font-size:.95rem;margin-bottom:6px\">⚡ AI 자동 강화</div><div style=\"font-size:.8rem;color:#886644;margin-bottom:8px\">장비 선택 → 목표치 설정 → 악의 투입 → 자동 시도</div><div style=\"display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px\"><span onclick=\"G._aiEnhSlot='weapon';G._aiTarget=undefined;renderForge()\" style=\"cursor:pointer;padding:3px 8px;border:1px solid #44ccff;background:rgba(68,204,255,.15);border-radius:3px;font-size:.8rem;color:#88ddff\">⚔️ 무기 <span style=\"color:#44ff88\">+0</span></span></div><div style=\"display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-bottom:4px\"><div style=\"flex:1;min-width:80px\"><div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">목표 강화치</div><input id=\"aiTargetInp\" type=\"number\" min=\"1\" max=\"9999\" value=\"2\" style=\"width:100%;background:#0a0806;border:1px solid #443322;color:#ffcc88;padding:5px 8px;border-radius:3px;font-size:.9rem;box-sizing:border-box\" oninput=\"G._aiTarget=Math.max(1,parseInt(this.value)||1)\" onchange=\"renderForge()\"></div><div style=\"flex:1;min-width:100px\"><div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">예상 필요 악의</div><div style=\"background:#0a0806;border:1px solid #443322;color:#ffaa44;padding:5px 8px;border-radius:3px;font-size:.9rem\">33,135 <span style=\"color:#666;font-size:.75rem\">/ 보유 50,000</span></div></div><div><div class=\"id-btn equip\" style=\"white-space:nowrap\" onclick=\"_doAiEnhance()\">강화 시작</div></div></div><div style=\"font-size:.8rem;color:#886644;margin-top:6px\">+0 → +2 | 보유 악의 <span style=\"color:#44ff88\">✔ 충분</span></div><div id=\"aiEnhResult\"></div>",
              "style": {
                "cssText": "margin-top:16px;border-top:1px solid #443322;padding-top:14px"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [],
              "className": "fg-i",
              "text": "",
              "html": "<div class=\"fg-in\" style=\"color:c2\">⚔️ 무기 기존 무기 <span style=\"color:#44ff88\">+0</span></div><div class=\"fg-id\">강화 보너스 적용</div><div class=\"fg-ic\" style=\"display:flex;justify-content:space-between\"><span style=\"color:#44ff44;font-weight:700\">성공률 99%</span><span>악의 15000</span></div>",
              "style": {},
              "children": []
            }
          ]
        },
        {
          "tag": "div",
          "id": "forgeConfirm",
          "classes": [],
          "className": "",
          "text": "",
          "html": "",
          "style": {
            "display": "none"
          },
          "children": []
        }
      ],
      "itemIdentityPreserved": true
    },
    {
      "file": "game-easy-test.html",
      "policy": "candidate",
      "scenario": "normal target2 panel open",
      "input": {
        "target": 2,
        "item": {
          "id": 93,
          "slot": "weapon",
          "name": "기존 무기",
          "enh": 0,
          "rarity": 2
        },
        "mats": 50000
      },
      "after": {
        "target": 2,
        "item": {
          "id": 93,
          "slot": "weapon",
          "name": "기존 무기",
          "enh": 0,
          "rarity": 2
        },
        "mats": 50000,
        "paused": true,
        "forgeOpen": true
      },
      "trace": [
        {
          "op": "closeAllPanelsStub",
          "value": false
        },
        {
          "op": "classAdd",
          "id": "forge",
          "values": [
            "on"
          ]
        },
        {
          "op": "injectNavStub",
          "id": "forge"
        },
        {
          "op": "atlasLoadStub"
        },
        {
          "op": "BGMStub",
          "key": "forge"
        },
        {
          "op": "classAdd",
          "id": "fgTabs",
          "values": [
            "atlas-v1-ready",
            "atlas-v2-ready"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        },
        {
          "op": "classAdd",
          "id": null,
          "values": [
            "fg-tab-v4"
          ]
        }
      ],
      "panelHTML": "<div style=\"color:#cc8844;font-weight:700;font-size:.95rem;margin-bottom:6px\">⚡ AI 자동 강화</div><div style=\"font-size:.8rem;color:#886644;margin-bottom:8px\">장비 선택 → 목표치 설정 → 악의 투입 → 자동 시도</div><div style=\"display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px\"><span onclick=\"G._aiEnhSlot='weapon';G._aiTarget=undefined;renderForge()\" style=\"cursor:pointer;padding:3px 8px;border:1px solid #44ccff;background:rgba(68,204,255,.15);border-radius:3px;font-size:.8rem;color:#88ddff\">⚔️ 무기 <span style=\"color:#44ff88\">+0</span></span></div><div style=\"display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-bottom:4px\"><div style=\"flex:1;min-width:80px\"><div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">목표 강화치</div><input id=\"aiTargetInp\" type=\"number\" min=\"1\" max=\"9999\" value=\"2\" style=\"width:100%;background:#0a0806;border:1px solid #443322;color:#ffcc88;padding:5px 8px;border-radius:3px;font-size:.9rem;box-sizing:border-box\" oninput=\"G._aiTarget=Math.max(1,parseInt(this.value)||1)\" onchange=\"renderForge()\"></div><div style=\"flex:1;min-width:100px\"><div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">예상 필요 악의</div><div style=\"background:#0a0806;border:1px solid #443322;color:#ffaa44;padding:5px 8px;border-radius:3px;font-size:.9rem\">33,135 <span style=\"color:#666;font-size:.75rem\">/ 보유 50,000</span></div></div><div><div class=\"id-btn equip\" style=\"white-space:nowrap\" onclick=\"_doAiEnhance()\">강화 시작</div></div></div><div style=\"font-size:.8rem;color:#886644;margin-top:6px\">+0 → +2 | 보유 악의 <span style=\"color:#44ff88\">✔ 충분</span></div><div id=\"aiEnhResult\"></div>",
      "DOM": [
        {
          "tag": "div",
          "id": "forge",
          "classes": [
            "on"
          ],
          "className": "",
          "text": "",
          "html": "",
          "style": {},
          "children": []
        },
        {
          "tag": "div",
          "id": "forgeMats",
          "classes": [],
          "className": "",
          "text": "악의: 50000",
          "html": "",
          "style": {},
          "children": []
        },
        {
          "tag": "div",
          "id": "forgeLore",
          "classes": [],
          "className": "",
          "text": "🔴화염→빙결 2배 | 🔵빙결→화염 2배 | ⚪물리=중립 | 악마 처치 시 악의 영혼 드롭",
          "html": "",
          "style": {},
          "children": []
        },
        {
          "tag": "div",
          "id": "fgTabs",
          "classes": [
            "atlas-v1-ready",
            "atlas-v2-ready"
          ],
          "className": "",
          "text": "",
          "html": "",
          "style": {},
          "children": [
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab act",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">강화</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/upgrade.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">물약</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/potion.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">분해</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/salvage.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">리롤</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/reroll.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">결정</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/crystal.png?v=20260417-v4)"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [
                "fg-tab-v4"
              ],
              "className": "fg-tab",
              "text": "",
              "html": "<span class=\"fg-tab-txt\" style=\"position:relative;z-index:1;text-shadow:0 2px 4px rgba(0,0,0,.95),0 0 12px rgba(0,0,0,.7);margin:0;text-align:center\">제작</span>",
              "style": {
                "--fg-tab-bg": "url(output/imagegen/forge-tabs-v4/craft.png?v=20260417-v4)"
              },
              "children": []
            }
          ]
        },
        {
          "tag": "div",
          "id": "fgGrid",
          "classes": [],
          "className": "",
          "text": "",
          "html": "",
          "style": {
            "gridTemplateColumns": "1fr"
          },
          "children": [
            {
              "tag": "div",
              "id": null,
              "classes": [],
              "className": "",
              "text": "장비 강화 (실패 시 재료만 소멸)",
              "html": "",
              "style": {
                "cssText": "color:#ffaa44;font-size:.95rem;font-weight:700;margin-bottom:8px;letter-spacing:.1em;text-align:center"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [],
              "className": "",
              "text": "",
              "html": "<div style=\"color:#cc8844;font-weight:700;font-size:.95rem;margin-bottom:6px\">⚡ AI 자동 강화</div><div style=\"font-size:.8rem;color:#886644;margin-bottom:8px\">장비 선택 → 목표치 설정 → 악의 투입 → 자동 시도</div><div style=\"display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px\"><span onclick=\"G._aiEnhSlot='weapon';G._aiTarget=undefined;renderForge()\" style=\"cursor:pointer;padding:3px 8px;border:1px solid #44ccff;background:rgba(68,204,255,.15);border-radius:3px;font-size:.8rem;color:#88ddff\">⚔️ 무기 <span style=\"color:#44ff88\">+0</span></span></div><div style=\"display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap;margin-bottom:4px\"><div style=\"flex:1;min-width:80px\"><div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">목표 강화치</div><input id=\"aiTargetInp\" type=\"number\" min=\"1\" max=\"9999\" value=\"2\" style=\"width:100%;background:#0a0806;border:1px solid #443322;color:#ffcc88;padding:5px 8px;border-radius:3px;font-size:.9rem;box-sizing:border-box\" oninput=\"G._aiTarget=Math.max(1,parseInt(this.value)||1)\" onchange=\"renderForge()\"></div><div style=\"flex:1;min-width:100px\"><div style=\"font-size:.78rem;color:#666;margin-bottom:3px\">예상 필요 악의</div><div style=\"background:#0a0806;border:1px solid #443322;color:#ffaa44;padding:5px 8px;border-radius:3px;font-size:.9rem\">33,135 <span style=\"color:#666;font-size:.75rem\">/ 보유 50,000</span></div></div><div><div class=\"id-btn equip\" style=\"white-space:nowrap\" onclick=\"_doAiEnhance()\">강화 시작</div></div></div><div style=\"font-size:.8rem;color:#886644;margin-top:6px\">+0 → +2 | 보유 악의 <span style=\"color:#44ff88\">✔ 충분</span></div><div id=\"aiEnhResult\"></div>",
              "style": {
                "cssText": "margin-top:16px;border-top:1px solid #443322;padding-top:14px"
              },
              "children": []
            },
            {
              "tag": "div",
              "id": null,
              "classes": [],
              "className": "fg-i",
              "text": "",
              "html": "<div class=\"fg-in\" style=\"color:c2\">⚔️ 무기 기존 무기 <span style=\"color:#44ff88\">+0</span></div><div class=\"fg-id\">강화 보너스 적용</div><div class=\"fg-ic\" style=\"display:flex;justify-content:space-between\"><span style=\"color:#44ff44;font-weight:700\">성공률 99%</span><span>악의 15000</span></div>",
              "style": {},
              "children": []
            }
          ]
        },
        {
          "tag": "div",
          "id": "forgeConfirm",
          "classes": [],
          "className": "",
          "text": "",
          "html": "",
          "style": {
            "display": "none"
          },
          "children": []
        }
      ],
      "itemIdentityPreserved": true
    }
  ],
  "errors": [],
  "productionApplied": false,
  "runtimeAccepted": false,
  "previousTestsRerun": 0,
  "GitCommands": 0,
  "skillUsage": [],
  "externalAPIUsage": [],
  "docsSearch": {
    "command": "rg -n \"renderForge|_aiTarget|自動|자동 강화|enhCost\" docs/",
    "exitCode": 0,
    "matchCount": 39,
    "outputSha256": "420fbb03a82c2518b96d7b33c3256ed061f3da9c4ff9fa09604cf4eeb7c8884e",
    "documents": [
      "docs/14밸런스+수치테이블/14밸런스+수치테이블.md",
      "docs/CHANGELOG_SYNC.md",
      "docs/14밸런스+수치테이블/BALANCE_ECONOMY_TEAM_MASTER.md",
      "docs/0마스터플랜/mac-resume-20261001/3팀-독립검토.md",
      "docs/0마스터플랜/mac-resume-20261001/map020-evidence/팀실행-영수증.json",
      "docs/0마스터플랜/mac-resume-20261001/ui03-evidence/BALANCE-팀검토.md",
      "docs/0마스터플랜/mac-resume-20261001/map020-evidence/BALANCE-읽기근거.json",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_LOG.md",
      "docs/3.2메타·진행시스템/3.2메타·진행시스템.md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_STATE.json",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/persistence-review-result.md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/persistence-review-receipt.json",
      "docs/16번역·로컬라이제이션/번역대상_전체목록.md",
      "docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md",
      "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md",
      "docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md"
    ]
  },
  "anchorDrift": [
    {
      "file": "game.html",
      "changedFunctions": [],
      "wholeChanged": false
    },
    {
      "file": "game-easy-test.html",
      "changedFunctions": [],
      "wholeChanged": false
    }
  ],
  "verification": {
    "status": "PASS_PANEL_DEFECT_FALLBACK_CONTROL_EQUIVALENT",
    "failureEvent": 1,
    "normalControl": 1,
    "variants": 2,
    "policies": 2,
    "panelSourceRuns": 8,
    "costDisplayChecks": 2,
    "browserNumberInputVerified": false,
    "visualAccepted": false
  },
  "checksSha256": "d2aae4124c5225030d9ab93743cfe1650e8d3cd5c9a07b567d0a547c0735e129"
}
```

최종 artifact validation PASS: 소유2산출+read-only TASK, checks SHA·양판 source SHA·실행8·예상timeout2·정본39매칭/16문서 일치. 검사 재실행0. 2026-10-02T11:05:39.181640+00:00 UTC / 2026-10-02T20:05:39.181640+09:00 KST.
