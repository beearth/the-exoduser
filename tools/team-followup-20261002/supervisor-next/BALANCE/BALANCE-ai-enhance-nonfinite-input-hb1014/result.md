# BALANCE-ai-enhance-nonfinite-input-hb1014

검수 완료. 두 HTML에서 **목표 Infinity를 받은 `_doAiEnhance`의 예상비용 루프가 VM80ms 제한에 도달**했고, 같은 목표를 helper `aiEnhance`에 유한 예산50000으로 직접 전달하면32625 악의를 소비한 뒤 반환 target=Infinity가 남았다. 후보는 목표/예산/아이템 강화값의 유한성을 변이·예상비용 루프 전에 검사해 거부한다. 정상 목표2·예산50000 및 예산부족1000 대조는 원본/후보가 동일했다.

비정상 목표1사건 + 정상/예산부족2control을 본편/easy2 × helper/caller2 × 원본/후보2에서 **24 source 실행**했다. 별도로 실제 패널 입력식의 curEnh=0 확정 대입식을 각 판본에서1회 평가했다. 이전 완료 검사·save·root expanded _skUnclick 검사/import/재실행/합산0. productionApplied=false/runtimeAccepted=false다. 별도 evidence/log/backup/patch 파일0, 이번 result.md+checks.mjs만 작성했다.

## 입력 도달경로와 실제/합성 구분

| 경로/변수 | 읽은 source·관측·제한 |
|---|---|
| 패널 G._aiTarget |실제 oninput은 `Math.max(curEnh+1,parseInt(this.value)||curEnh+1)`. curEnh=0,309자리9 문자열의 결과 Infinity를 실제 식으로 평가. min/max9999 HTML 속성을 핸들러가 수치검증에 사용하지 않음. 브라우저 type=number가 이 문자열을 허용·보존하는지는 미검수이며 실제 클릭 재현이라고 주장하지 않음 |
| panel renderForge 예상비용 |`G._aiTarget===undefined || G._aiTarget<=_curEnh`일 때만 default. Infinity는 이 교정에 해당하지 않으며 비용표시 for도 유한성 검사 없음. renderForge 전체 실행0. 본 후보로 panel 렌더까지 고쳤다고 주장하지 않음 |
| _doAiEnhance target/budget |`target=G._aiTarget||((item.enh||0)+100)`, `_expBudget+=ec.cost/ec.rate` 후 budget=`min(ceil(_expBudget)||1000,G.mats||0)`. Infinity 목표는 budget 계산 전 루프에서 멈추지 않음. NaN `_aiTarget`는 falsy라 default로 빠짐. raw NaN 목표 별도 실행0 |
| helper aiEnhance |start=`item.enh||0`; budget의 `<=0`/`G.mats<budget` 및 while 비교만 있고 Number.isFinite 검사0. 이번은 targetInfinity·enh0·유한 mats/budget50000만 실행 |
| item.enh 로드 |INV.bag/equipped 객체를 d.inv에서 받는 대입과 인벤토리 마이그레이션을 읽음. 해당 구역에 enh 유한성 교정 없음. 일반 JSON.stringify의 NaN/Infinity는 null이며 그대로 수치 유지되는 정상 저장 사례가 아님. 조작된 overflow JSON/외부 상태 가능성과 실제 사용자 save 경로는 구분. dbRestore/세이브 실행0 |
| budget/item.enh NaN·Infinity |caller 계산·로드·falsy 대입의 source 경로만 조사. 이번1사건 밖의 독립 입력 실행0. 후보의 해당 guard 존재만으로 이 전체 행렬 검수 PASS를 주장하지 않음 |

패널 식은 실제 source와 일치하는 curEnh=0 대입식이며 DOM/input 객체만 합성이다. 따라서 source handler의 검증 누락·외부 Infinity 상태에서의 함수 결함은 확인했으나, 정상 UI를 통한 사용자 도달가능성과 빈도는 아직 확정하지 않는다.

## 반례와 control

| 사건 / 판본 공통 | 현행 helper | 현행 caller | 메모리 후보 |
|---|---|---|---|
| item={id91,enh0,rarity2,nested.keep:'original'}, targetInfinity, mats/budget50000 |RNG0 고정으로2시도,0→2,used32625,mats17375,okfalse,targetInfinity |예상비용 루프 timeout `ERR_SCRIPT_EXECUTION_TIMEOUT`(80ms),enh0·mats50000 보존,후속 호출0 |helper `{ok:false,msg:'강화 입력 오류',used:0,tries:0}`; caller addTxt1 후undefined. 둘 다 원item deepEqual·mats50000·RNG/save/stats/render0 |
| target2,budget50000 |2시도·used32625·enh2·mats17375·oktrue |동일 지출/강화,dbSaveNow1·applyStats1·renderForge1 |각 entry의 원본과 반환·상태·trace 정확 동일 |
| target2,budget1000 |0시도·used0·enh0·mats1000·okfalse |dbSave0,applyStats1·renderForge1,원item 보존 |각 entry의 원본과 반환·상태·trace 정확 동일 |

비정상 목표의 caller는 VM timeout으로 하니스를 중단한 관측이며 실게임 infinite wait/프레임 정지를 실측한 것은 아니다. helper는 유한 budget으로 격리했다. RNG는 결정적0 대역, 실제 enhRate/enhCostRaw/enhCost/_malCost/_itemEconomyRarity 전체를 실행했다. 비용 counter를 대역으로 치환하지 않았다. item과 중첩 필드/identity는 원객체로 유지하며 숫자 비유한값은 JSON evidence에서 문자열 `Infinity`로 명시해 null 손실을 피했다.

## 최소 메모리 patch

aiEnhance의 item 존재 검사 뒤, startEnh·변이 전에:

```js
if(!Number.isFinite(targetEnh)||!Number.isFinite(budget)||!Number.isFinite(item.enh??0))
  return{ok:false,msg:'강화 입력 오류',used:0,tries:0};
```

_doAiEnhance의 target 계산 뒤, 비용 예상 for 전에:

```js
if(!Number.isFinite(target)||!Number.isFinite(_aiItem.enh??0)){
  addTxt(P.x,P.y-20,_T('강화 입력 오류'),'#cc4444',50);return;
}
```

budget 계산 뒤 기존 budget<=0 검사 전에 같은 addTxt/return으로 `!Number.isFinite(budget)`를 거부한다. 실제 후보 함수 전문·SHA는 아래 JSON.sources.candidate에 보존했다. 유한성 검사만 추가하고 비용·확률·환수·정수/상한 정책을 변경하지 않는다. 매우 큰 유한 목표의 루프 비용/정밀도 문제, panel 표시 루프 guard, 다른 수동강화·로드 교정은 본 patch의 완료 범위가 아니다.

## 실제 실행 영수증과 소유

| 항목 | 기록 |
|---|---|
| TASK |Assigned10:35:54.431195 UTC /19:35:54.431195 KST. 정확 새 TASK를 먼저 Read하고 COMMON/AGENTS/TEAM_CONTINUATION_POLICY/BALANCE 대장/강화 SSOT 읽기 |
| 제공자/채팅 |Codex BALANCE / 기존 확인 ID `01a0faaf-a06a-79a2-9def-58eb8ad10d65`, 새 세션0 |
| cwd/Node |`/Users/fordeargamers/Projects/exoduser-migration-20261001`, 지정 Node v24.15.0 |
| 실행 |2026-10-02 10:38:57.100→.523 UTC /19:38:57.100→.523 KST. `node --check checks.mjs` exit0 1회, `node checks.mjs` exit0 1회 |
| 본편 전체 SHA |`8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b` |
| easy 전체 SHA |`50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057` |
| aiEnhance 양판 SHA |`abd6138c157297beac1ba79aac9b122135ec5ec46b514fb4ea4518e8f64200f1` |
| _doAiEnhance 양판 SHA |`83f319427eb15d403361cedff31fc58e3e039d074fc4dfd7cff046cefa243157` |
| checks SHA |`e0cc6411c2b0fce23be88d3b71a6a56fc5b23141b911f9be4887a388f814682d` |
| WIP |실행 종료 시 owned 함수 anchor 변화0, whole 변화0. parent6b865637은 역사 입력이며 현재 HEAD 주장0. Git 조회/쓰기0·Changes 미제공/감독 추적 |
| 도구·오류 |파일 Read/소유 apply_patch/지정 Node·Acorn·VM/rg/Python 최종검증. 예상 source timeout2건을 error로 raw 기록, 하니스 실패0. 외부 API/MCP/skill0 |
| 대역 |G/INV/item/P 합성 상태, RNG0, DOM result조회 null, addTxt/dbSaveNow/applyStats/renderForge trace 대역. UI/VFX/audio 실제 실행0. save trace1은 실제 DB 저장1이 아님 |

production/공유docs/기존test/기존산출/사용자세이브/서버/실게임/빌드/이미지/설치/게시/새팀/새채팅/타채팅메시지/삭제/이동/cleanup0. 실제 skill 적용이 필요한 생성/외부제품 작업이 아니어서 별도 스킬을 적용하지 않았다. Changes80/100 관리는 감독 계약을 유지하며 capacity 중단 신호는 수신되지 않았다.

## docs 동기화 인계

코드 산출 뒤 docs 전체 관련키워드 rg1회 exit0: `aiEnhance|_doAiEnhance|_aiTarget|enhCost|자동 강화`,35매칭/16문서. 출력 SHA와 전체 정본 목록은 아래 JSON.docsSearch. 공유docs writes0, root 인계 문안:

| 정본/항목 | old 현재 상태 | new 후보/인수 문안 |
|---|---|---|
| BALANCE_ECONOMY_TEAM_MASTER 강화 검수 |유한 정상 경제검수 기록,비유한 목표 guard 미기록 |`양판 targetInfinity1사건에서 caller 예상비용 루프80ms VM timeout,helper 유한 budget50000에서used32625/targetInfinity 반환. 변이 전 finite guard 후보는 원item/mats50000 보존·used/tries0. 정상목표2·예산부족1000 대조 동일. productionApplied=false/runtimeAccepted=false,기존검사 재실행0.` |
|14밸런스+수치테이블 강화 공식 |raw=max(20000,ceil((20000+3500n)×1.5)); 실제 `_malCost(ceil(raw×등급배율))`; rate=max(.5,99×.99^n)% |수치 변경0. `aiEnhance 입력 targetEnh/budget/(item.enh??0),caller target/(item.enh??0)/budget의 Number.isFinite 거부 후보. 목표/예산 NaN·item.enh 비유한 전체조합은 미검수이며 새상한·환수정책을 추가하지 않음.` |
|3.2 메타·진행 강화 행 |기존 확률/지출/경제등급 |공식/정상지출 유지. `외부 비유한목표 방어 후보 source 검수만 완료, 실제 패널 입력·DOM 렌더·dbSave/영속화·실게임/패키지는 별도 Gate.` |
|15 저장 구조/2_7 인벤토리 |로드된 item.enh와 장비 강화 계약 |`이번 dbRestore 실행/저장수리0. 정상 stringify 비유한값 null과 조작overflow JSON을 구분,loaded enh 유한성/수동강화/복원 전체검수로 확대하지 않음. 기존 원item·비용·환수·schema 변경0.` |

남은 필수 Gate는 root의 guard/문구 인수, 실제 number input 도달가능성·패널 표시루프의 정책 검토, 비유한 budget/item.enh 별도 인수 여부, 실게임/저장/패키지 검수다. 본 결과는 새 cap을 승인하거나 모든 비정상 입력을 안전하다고 확정하지 않는다. 이 한 건만 종료하며 자체 다음업무·메시지 생성0.

## 실행 evidence JSON

```json
{
  "taskId": "BALANCE-ai-enhance-nonfinite-input-hb1014",
  "chatId": "01a0faaf-a06a-79a2-9def-58eb8ad10d65",
  "provider": "Codex BALANCE",
  "assignedUTC": "2026-10-02T10:35:54.431195+00:00",
  "providedParentPin": "6b865637 (historical only; no current HEAD claim)",
  "execution": {
    "startedAt": {
      "UTC": "2026-10-02T10:38:57.100Z",
      "KST": "2026-10-02T19:38:57.100+09:00"
    },
    "cwd": "/Users/fordeargamers/Projects/exoduser-migration-20261001",
    "node": "v24.15.0",
    "endedAt": {
      "UTC": "2026-10-02T10:38:57.523Z",
      "KST": "2026-10-02T19:38:57.523+09:00"
    }
  },
  "inputs": {
    "AGENTS.md": "fd59bef70960bcaf1ab9910051faa860362884e574ac2869fad05c6872ae04e4",
    "tools/team-followup-20261002/supervisor-next/BALANCE/BALANCE-ai-enhance-nonfinite-input-hb1014/TASK.md": "55cea89f398ae31c268cd7db491defb6db7d2b6ca001af60605ecdc72d502941",
    "tools/team-followup-20261002/continuous/COMMON.md": "de5a881270625a7b2d0e854331205e01372a037340a18474c6442b60e668465e",
    "docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md": "86ada15a477fc128a77cf10c2337de9fdb36b3f9c463f008f5d3c97e82f60520",
    "docs/14밸런스+수치테이블/BALANCE_ECONOMY_TEAM_MASTER.md": "9ea03646283c43a7412c4704100acb35732fddd3933ddfd1966d5ee7b8aef8bc",
    "docs/14밸런스+수치테이블/14밸런스+수치테이블.md": "f809b60874aef760217edfb7708e2444e35bd9925f4c9a0f3a2316389d41779b",
    "game.html": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b",
    "game-easy-test.html": "50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057"
  },
  "sources": [
    {
      "file": "game.html",
      "readAt": {
        "UTC": "2026-10-02T10:38:57.150Z",
        "KST": "2026-10-02T19:38:57.150+09:00"
      },
      "wholeSha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b",
      "functions": {
        "enhRate": {
          "text": "function enhRate(n){\n  return Math.max(0.5,99*Math.pow(0.99,n)); // % 반환, 최소 0.5% 보장\n}",
          "sha256": "be2ef762d3119ae837dfcd3fa36c12792ec3061caa153d9ef2eb454c1e3ed703",
          "line": 26864
        },
        "_malCost": {
          "text": "function _malCost(v){\n  const _n=Number(v)||0;\n  if(_n<=0)return 0;\n  return Math.max(1,Math.ceil(_n*_MALICE_COST_MUL));\n}",
          "sha256": "b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f",
          "line": 26868
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
        "_itemEconomyRarity": {
          "text": "function _itemEconomyRarity(r){return Number.isInteger(r)&&r>=0?Math.min(r,4):0;}",
          "sha256": "13ebcae9484f58bcc31664bb25cf22a2f489b186c2e85f3080d7fe6918f57509",
          "line": 26973
        },
        "aiEnhance": {
          "text": "function aiEnhance(item,targetEnh,budget){\n  if(!item)return{ok:false,msg:'아이템 없음'};\n  const startEnh=item.enh||0;\n  if(startEnh>=targetEnh)return{ok:false,msg:'이미 목표 달성'};\n  if(budget<=0||G.mats<budget)return{ok:false,msg:'악의 부족'};\n  let used=0,tries=0,n=startEnh;\n  while(n<targetEnh&&used<budget){\n    const{rate,cost}=enhCost(n,item.rarity||0);\n    if(used+cost>budget)break;\n    used+=cost;tries++;\n    if(Math.random()<rate)n++;\n  }\n  G.mats-=used;\n  item.enh=n;\n  return{ok:n>=targetEnh,from:startEnh,to:n,target:targetEnh,used,tries};\n}",
          "sha256": "abd6138c157297beac1ba79aac9b122135ec5ec46b514fb4ea4518e8f64200f1",
          "line": 26910
        },
        "_doAiEnhance": {
          "text": "function _doAiEnhance(){\n  const _aiSlot=G._aiEnhSlot;\n  const _aiItem=_aiSlot?INV.equipped[_aiSlot]:null;\n  if(!_aiItem){addTxt(P.x,P.y-20,_T('아이템 선택 필요'),'#cc4444',50);return}\n  const target=G._aiTarget||((_aiItem.enh||0)+100);\n  let _expBudget=0;for(let i=(_aiItem.enh||0);i<target;i++){const ec=enhCost(i,_aiItem.rarity||0);_expBudget+=ec.cost/ec.rate}\n  const budget=Math.min(Math.ceil(_expBudget)||1000,G.mats||0);\n  if(budget<=0){addTxt(P.x,P.y-20,_T('악의 부족'),'#cc4444',50);return}\n  const res=aiEnhance(_aiItem,target,budget);\n  if(res.used>0)dbSaveNow();\n  applyStats();\n  const rDiv=$('aiEnhResult');\n  if(rDiv){\n    if(res.ok){\n      const col=enhColor(res.to);\n      rDiv.innerHTML='<div style=\"border:1px solid #44aa44;background:rgba(0,80,0,.2);padding:10px;border-radius:4px\">'+\n        '<div style=\"color:#44ff88;font-weight:700;font-size:1rem\">'+_T('목표 달성!')+'</div>'+\n        '<div style=\"font-size:.85rem;color:#aaffaa;margin-top:4px\">'+\n        '<span style=\"color:'+enhColor(res.from)+'\">+'+res.from+'</span> → '+\n        '<span style=\"color:'+col+';font-weight:700\">+'+res.to+'</span>'+\n        ' | '+_T('시도')+' '+res.tries.toLocaleString()+_T('회')+\n        ' | '+_T('소비')+' <span style=\"color:#ffaa44\">'+res.used.toLocaleString()+_T('악의')+'</span>'+\n        '</div></div>';\n      SFX.forge();\n      shake(8);\n      for(let i=0;i<20;i++)poolPart(P.x+(Math.random()-.5)*50,P.y-20+(Math.random()-.5)*30,(Math.random()-.5)*6,-3-Math.random()*4,enhColor(res.to),2+Math.random()*4,20+~~(Math.random()*15));\n      addTxt(P.x,P.y-30,'+'+res.to+_L(' 달성!',' Achieved!'),enhColor(res.to),100);\n    }else{\n      const col=enhColor(res.to);\n      rDiv.innerHTML='<div style=\"border:1px solid #aa4444;background:rgba(80,0,0,.2);padding:10px;border-radius:4px\">'+\n        '<div style=\"color:#ff6644;font-weight:700;font-size:1rem\">'+_T('악의 고갈')+'</div>'+\n        '<div style=\"font-size:.85rem;color:#ffaaaa;margin-top:4px\">'+\n        '<span style=\"color:'+enhColor(res.from)+'\">+'+res.from+'</span> → '+\n        '<span style=\"color:'+col+'\">+'+res.to+'</span>'+\n        ' ('+_T('목표')+' <span style=\"color:#cc4444\">+'+res.target+'</span> '+_T('미달')+')'+\n        ' | '+_T('시도')+' '+res.tries.toLocaleString()+_T('회')+\n        ' | '+_T('소비')+' <span style=\"color:#ffaa44\">'+res.used.toLocaleString()+_T('악의')+'</span>'+\n        '</div>'+\n        '<div style=\"font-size:.78rem;color:#664444;margin-top:6px\">'+_T('악의를 더 모아 재시도하세요')+'</div>'+\n        '</div>';\n      SFX.hurt();\n      addTxt(P.x,P.y-25,_T('악의 소진...'),'#cc4444',70);\n    }\n  }\n  renderForge();\n}",
          "sha256": "83f319427eb15d403361cedff31fc58e3e039d074fc4dfd7cff046cefa243157",
          "line": 26926
        }
      },
      "panel": {
        "line": 49071,
        "source": "            '<input id=\"aiTargetInp\" type=\"number\" min=\"'+(_curEnh+1)+'\" max=\"9999\" value=\"'+_t+'\" style=\"width:100%;background:#0a0806;border:1px solid #443322;color:#ffcc88;padding:5px 8px;border-radius:3px;font-size:.9rem;box-sizing:border-box\" oninput=\"G._aiTarget=Math.max('+(_curEnh+1)+',parseInt(this.value)||'+(_curEnh+1)+')\" onchange=\"renderForge()\">'+",
        "sha256": "9b70a6564920fea954e8035d029a864ead1f0ed1b986a88d201210d9a6bc3667",
        "executedExpression": "G._aiTarget=Math.max(1,parseInt(this.value)||1)",
        "curEnh": 0,
        "inputLength": 309,
        "inputSha256": "c24a44a572fc0002cc884060cd6e9d1f20528d4893629930f4fffca1dcd13766",
        "valueResult": "Infinity",
        "browserValidated": false
      },
      "load": {
        "source": "    INV.bag=d.inv.bag||[];\n    INV.equipped=d.inv.equipped||{weapon:null,shield:null,boots:null,armor:null,helmet:null,bow:null,gloves:null,pants:null,belt:null,necklace:null,ring1:null,ring2:null,cape:null,bracelet:null,headband:null,ossuary:null,headband2:null};",
        "sha256": "093e88e19731e86dac12cd34632adf29a9558c4bb0da93f463460c32a75165fa",
        "executed": false
      },
      "candidate": {
        "aiEnhance": "function aiEnhance(item,targetEnh,budget){\n  if(!item)return{ok:false,msg:'아이템 없음'};\n  if(!Number.isFinite(targetEnh)||!Number.isFinite(budget)||!Number.isFinite(item.enh??0))return{ok:false,msg:'강화 입력 오류',used:0,tries:0};\n  const startEnh=item.enh||0;\n  if(startEnh>=targetEnh)return{ok:false,msg:'이미 목표 달성'};\n  if(budget<=0||G.mats<budget)return{ok:false,msg:'악의 부족'};\n  let used=0,tries=0,n=startEnh;\n  while(n<targetEnh&&used<budget){\n    const{rate,cost}=enhCost(n,item.rarity||0);\n    if(used+cost>budget)break;\n    used+=cost;tries++;\n    if(Math.random()<rate)n++;\n  }\n  G.mats-=used;\n  item.enh=n;\n  return{ok:n>=targetEnh,from:startEnh,to:n,target:targetEnh,used,tries};\n}",
        "_doAiEnhance": "function _doAiEnhance(){\n  const _aiSlot=G._aiEnhSlot;\n  const _aiItem=_aiSlot?INV.equipped[_aiSlot]:null;\n  if(!_aiItem){addTxt(P.x,P.y-20,_T('아이템 선택 필요'),'#cc4444',50);return}\n  const target=G._aiTarget||((_aiItem.enh||0)+100);\n\n  if(!Number.isFinite(target)||!Number.isFinite(_aiItem.enh??0)){addTxt(P.x,P.y-20,_T('강화 입력 오류'),'#cc4444',50);return}\n  let _expBudget=0;for(let i=(_aiItem.enh||0);i<target;i++){const ec=enhCost(i,_aiItem.rarity||0);_expBudget+=ec.cost/ec.rate}\n  const budget=Math.min(Math.ceil(_expBudget)||1000,G.mats||0);\n  if(!Number.isFinite(budget)){addTxt(P.x,P.y-20,_T('강화 입력 오류'),'#cc4444',50);return}\n  if(budget<=0){addTxt(P.x,P.y-20,_T('악의 부족'),'#cc4444',50);return}\n  const res=aiEnhance(_aiItem,target,budget);\n  if(res.used>0)dbSaveNow();\n  applyStats();\n  const rDiv=$('aiEnhResult');\n  if(rDiv){\n    if(res.ok){\n      const col=enhColor(res.to);\n      rDiv.innerHTML='<div style=\"border:1px solid #44aa44;background:rgba(0,80,0,.2);padding:10px;border-radius:4px\">'+\n        '<div style=\"color:#44ff88;font-weight:700;font-size:1rem\">'+_T('목표 달성!')+'</div>'+\n        '<div style=\"font-size:.85rem;color:#aaffaa;margin-top:4px\">'+\n        '<span style=\"color:'+enhColor(res.from)+'\">+'+res.from+'</span> → '+\n        '<span style=\"color:'+col+';font-weight:700\">+'+res.to+'</span>'+\n        ' | '+_T('시도')+' '+res.tries.toLocaleString()+_T('회')+\n        ' | '+_T('소비')+' <span style=\"color:#ffaa44\">'+res.used.toLocaleString()+_T('악의')+'</span>'+\n        '</div></div>';\n      SFX.forge();\n      shake(8);\n      for(let i=0;i<20;i++)poolPart(P.x+(Math.random()-.5)*50,P.y-20+(Math.random()-.5)*30,(Math.random()-.5)*6,-3-Math.random()*4,enhColor(res.to),2+Math.random()*4,20+~~(Math.random()*15));\n      addTxt(P.x,P.y-30,'+'+res.to+_L(' 달성!',' Achieved!'),enhColor(res.to),100);\n    }else{\n      const col=enhColor(res.to);\n      rDiv.innerHTML='<div style=\"border:1px solid #aa4444;background:rgba(80,0,0,.2);padding:10px;border-radius:4px\">'+\n        '<div style=\"color:#ff6644;font-weight:700;font-size:1rem\">'+_T('악의 고갈')+'</div>'+\n        '<div style=\"font-size:.85rem;color:#ffaaaa;margin-top:4px\">'+\n        '<span style=\"color:'+enhColor(res.from)+'\">+'+res.from+'</span> → '+\n        '<span style=\"color:'+col+'\">+'+res.to+'</span>'+\n        ' ('+_T('목표')+' <span style=\"color:#cc4444\">+'+res.target+'</span> '+_T('미달')+')'+\n        ' | '+_T('시도')+' '+res.tries.toLocaleString()+_T('회')+\n        ' | '+_T('소비')+' <span style=\"color:#ffaa44\">'+res.used.toLocaleString()+_T('악의')+'</span>'+\n        '</div>'+\n        '<div style=\"font-size:.78rem;color:#664444;margin-top:6px\">'+_T('악의를 더 모아 재시도하세요')+'</div>'+\n        '</div>';\n      SFX.hurt();\n      addTxt(P.x,P.y-25,_T('악의 소진...'),'#cc4444',70);\n    }\n  }\n  renderForge();\n}",
        "aiSha256": "707c8e54934301b495b9dae866047dfec2246dfc2607c2f643d853f510cbe466",
        "callerSha256": "226dfb82b5b1a360c047e2862e91bc0e1d93df41d8ad10d149dac0b276dcbb34"
      }
    },
    {
      "file": "game-easy-test.html",
      "readAt": {
        "UTC": "2026-10-02T10:38:57.274Z",
        "KST": "2026-10-02T19:38:57.274+09:00"
      },
      "wholeSha256": "50f9a24bb11d95bd3b88fdd4d826594d4e0aac43d1d1760c6f44ac382e32a057",
      "functions": {
        "enhRate": {
          "text": "function enhRate(n){\n  return Math.max(0.5,99*Math.pow(0.99,n)); // % 반환, 최소 0.5% 보장\n}",
          "sha256": "be2ef762d3119ae837dfcd3fa36c12792ec3061caa153d9ef2eb454c1e3ed703",
          "line": 25739
        },
        "_malCost": {
          "text": "function _malCost(v){\n  const _n=Number(v)||0;\n  if(_n<=0)return 0;\n  return Math.max(1,Math.ceil(_n*_MALICE_COST_MUL));\n}",
          "sha256": "b8a3fc0bf01787aa8a9b68cfb9f6822225e18a2da635cda796df13ce0c93683f",
          "line": 25743
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
        "_itemEconomyRarity": {
          "text": "function _itemEconomyRarity(r){return Number.isInteger(r)&&r>=0?Math.min(r,4):0;}",
          "sha256": "13ebcae9484f58bcc31664bb25cf22a2f489b186c2e85f3080d7fe6918f57509",
          "line": 25848
        },
        "aiEnhance": {
          "text": "function aiEnhance(item,targetEnh,budget){\n  if(!item)return{ok:false,msg:'아이템 없음'};\n  const startEnh=item.enh||0;\n  if(startEnh>=targetEnh)return{ok:false,msg:'이미 목표 달성'};\n  if(budget<=0||G.mats<budget)return{ok:false,msg:'악의 부족'};\n  let used=0,tries=0,n=startEnh;\n  while(n<targetEnh&&used<budget){\n    const{rate,cost}=enhCost(n,item.rarity||0);\n    if(used+cost>budget)break;\n    used+=cost;tries++;\n    if(Math.random()<rate)n++;\n  }\n  G.mats-=used;\n  item.enh=n;\n  return{ok:n>=targetEnh,from:startEnh,to:n,target:targetEnh,used,tries};\n}",
          "sha256": "abd6138c157297beac1ba79aac9b122135ec5ec46b514fb4ea4518e8f64200f1",
          "line": 25785
        },
        "_doAiEnhance": {
          "text": "function _doAiEnhance(){\n  const _aiSlot=G._aiEnhSlot;\n  const _aiItem=_aiSlot?INV.equipped[_aiSlot]:null;\n  if(!_aiItem){addTxt(P.x,P.y-20,_T('아이템 선택 필요'),'#cc4444',50);return}\n  const target=G._aiTarget||((_aiItem.enh||0)+100);\n  let _expBudget=0;for(let i=(_aiItem.enh||0);i<target;i++){const ec=enhCost(i,_aiItem.rarity||0);_expBudget+=ec.cost/ec.rate}\n  const budget=Math.min(Math.ceil(_expBudget)||1000,G.mats||0);\n  if(budget<=0){addTxt(P.x,P.y-20,_T('악의 부족'),'#cc4444',50);return}\n  const res=aiEnhance(_aiItem,target,budget);\n  if(res.used>0)dbSaveNow();\n  applyStats();\n  const rDiv=$('aiEnhResult');\n  if(rDiv){\n    if(res.ok){\n      const col=enhColor(res.to);\n      rDiv.innerHTML='<div style=\"border:1px solid #44aa44;background:rgba(0,80,0,.2);padding:10px;border-radius:4px\">'+\n        '<div style=\"color:#44ff88;font-weight:700;font-size:1rem\">'+_T('목표 달성!')+'</div>'+\n        '<div style=\"font-size:.85rem;color:#aaffaa;margin-top:4px\">'+\n        '<span style=\"color:'+enhColor(res.from)+'\">+'+res.from+'</span> → '+\n        '<span style=\"color:'+col+';font-weight:700\">+'+res.to+'</span>'+\n        ' | '+_T('시도')+' '+res.tries.toLocaleString()+_T('회')+\n        ' | '+_T('소비')+' <span style=\"color:#ffaa44\">'+res.used.toLocaleString()+_T('악의')+'</span>'+\n        '</div></div>';\n      SFX.forge();\n      shake(8);\n      for(let i=0;i<20;i++)poolPart(P.x+(Math.random()-.5)*50,P.y-20+(Math.random()-.5)*30,(Math.random()-.5)*6,-3-Math.random()*4,enhColor(res.to),2+Math.random()*4,20+~~(Math.random()*15));\n      addTxt(P.x,P.y-30,'+'+res.to+_L(' 달성!',' Achieved!'),enhColor(res.to),100);\n    }else{\n      const col=enhColor(res.to);\n      rDiv.innerHTML='<div style=\"border:1px solid #aa4444;background:rgba(80,0,0,.2);padding:10px;border-radius:4px\">'+\n        '<div style=\"color:#ff6644;font-weight:700;font-size:1rem\">'+_T('악의 고갈')+'</div>'+\n        '<div style=\"font-size:.85rem;color:#ffaaaa;margin-top:4px\">'+\n        '<span style=\"color:'+enhColor(res.from)+'\">+'+res.from+'</span> → '+\n        '<span style=\"color:'+col+'\">+'+res.to+'</span>'+\n        ' ('+_T('목표')+' <span style=\"color:#cc4444\">+'+res.target+'</span> '+_T('미달')+')'+\n        ' | '+_T('시도')+' '+res.tries.toLocaleString()+_T('회')+\n        ' | '+_T('소비')+' <span style=\"color:#ffaa44\">'+res.used.toLocaleString()+_T('악의')+'</span>'+\n        '</div>'+\n        '<div style=\"font-size:.78rem;color:#664444;margin-top:6px\">'+_T('악의를 더 모아 재시도하세요')+'</div>'+\n        '</div>';\n      SFX.hurt();\n      addTxt(P.x,P.y-25,_T('악의 소진...'),'#cc4444',70);\n    }\n  }\n  renderForge();\n}",
          "sha256": "83f319427eb15d403361cedff31fc58e3e039d074fc4dfd7cff046cefa243157",
          "line": 25801
        }
      },
      "panel": {
        "line": 47646,
        "source": "            '<input id=\"aiTargetInp\" type=\"number\" min=\"'+(_curEnh+1)+'\" max=\"9999\" value=\"'+_t+'\" style=\"width:100%;background:#0a0806;border:1px solid #443322;color:#ffcc88;padding:5px 8px;border-radius:3px;font-size:.9rem;box-sizing:border-box\" oninput=\"G._aiTarget=Math.max('+(_curEnh+1)+',parseInt(this.value)||'+(_curEnh+1)+')\" onchange=\"renderForge()\">'+",
        "sha256": "9b70a6564920fea954e8035d029a864ead1f0ed1b986a88d201210d9a6bc3667",
        "executedExpression": "G._aiTarget=Math.max(1,parseInt(this.value)||1)",
        "curEnh": 0,
        "inputLength": 309,
        "inputSha256": "c24a44a572fc0002cc884060cd6e9d1f20528d4893629930f4fffca1dcd13766",
        "valueResult": "Infinity",
        "browserValidated": false
      },
      "load": {
        "source": "    INV.bag=d.inv.bag||[];\n    INV.equipped=d.inv.equipped||{weapon:null,shield:null,boots:null,armor:null,helmet:null,bow:null,gloves:null,pants:null,belt:null,necklace:null,ring1:null,ring2:null,cape:null,bracelet:null,headband:null,ossuary:null};",
        "sha256": "3281828126db56934b3ddccdc2598c69b720146d0453bcd917d40ebfa45e9768",
        "executed": false
      },
      "candidate": {
        "aiEnhance": "function aiEnhance(item,targetEnh,budget){\n  if(!item)return{ok:false,msg:'아이템 없음'};\n  if(!Number.isFinite(targetEnh)||!Number.isFinite(budget)||!Number.isFinite(item.enh??0))return{ok:false,msg:'강화 입력 오류',used:0,tries:0};\n  const startEnh=item.enh||0;\n  if(startEnh>=targetEnh)return{ok:false,msg:'이미 목표 달성'};\n  if(budget<=0||G.mats<budget)return{ok:false,msg:'악의 부족'};\n  let used=0,tries=0,n=startEnh;\n  while(n<targetEnh&&used<budget){\n    const{rate,cost}=enhCost(n,item.rarity||0);\n    if(used+cost>budget)break;\n    used+=cost;tries++;\n    if(Math.random()<rate)n++;\n  }\n  G.mats-=used;\n  item.enh=n;\n  return{ok:n>=targetEnh,from:startEnh,to:n,target:targetEnh,used,tries};\n}",
        "_doAiEnhance": "function _doAiEnhance(){\n  const _aiSlot=G._aiEnhSlot;\n  const _aiItem=_aiSlot?INV.equipped[_aiSlot]:null;\n  if(!_aiItem){addTxt(P.x,P.y-20,_T('아이템 선택 필요'),'#cc4444',50);return}\n  const target=G._aiTarget||((_aiItem.enh||0)+100);\n\n  if(!Number.isFinite(target)||!Number.isFinite(_aiItem.enh??0)){addTxt(P.x,P.y-20,_T('강화 입력 오류'),'#cc4444',50);return}\n  let _expBudget=0;for(let i=(_aiItem.enh||0);i<target;i++){const ec=enhCost(i,_aiItem.rarity||0);_expBudget+=ec.cost/ec.rate}\n  const budget=Math.min(Math.ceil(_expBudget)||1000,G.mats||0);\n  if(!Number.isFinite(budget)){addTxt(P.x,P.y-20,_T('강화 입력 오류'),'#cc4444',50);return}\n  if(budget<=0){addTxt(P.x,P.y-20,_T('악의 부족'),'#cc4444',50);return}\n  const res=aiEnhance(_aiItem,target,budget);\n  if(res.used>0)dbSaveNow();\n  applyStats();\n  const rDiv=$('aiEnhResult');\n  if(rDiv){\n    if(res.ok){\n      const col=enhColor(res.to);\n      rDiv.innerHTML='<div style=\"border:1px solid #44aa44;background:rgba(0,80,0,.2);padding:10px;border-radius:4px\">'+\n        '<div style=\"color:#44ff88;font-weight:700;font-size:1rem\">'+_T('목표 달성!')+'</div>'+\n        '<div style=\"font-size:.85rem;color:#aaffaa;margin-top:4px\">'+\n        '<span style=\"color:'+enhColor(res.from)+'\">+'+res.from+'</span> → '+\n        '<span style=\"color:'+col+';font-weight:700\">+'+res.to+'</span>'+\n        ' | '+_T('시도')+' '+res.tries.toLocaleString()+_T('회')+\n        ' | '+_T('소비')+' <span style=\"color:#ffaa44\">'+res.used.toLocaleString()+_T('악의')+'</span>'+\n        '</div></div>';\n      SFX.forge();\n      shake(8);\n      for(let i=0;i<20;i++)poolPart(P.x+(Math.random()-.5)*50,P.y-20+(Math.random()-.5)*30,(Math.random()-.5)*6,-3-Math.random()*4,enhColor(res.to),2+Math.random()*4,20+~~(Math.random()*15));\n      addTxt(P.x,P.y-30,'+'+res.to+_L(' 달성!',' Achieved!'),enhColor(res.to),100);\n    }else{\n      const col=enhColor(res.to);\n      rDiv.innerHTML='<div style=\"border:1px solid #aa4444;background:rgba(80,0,0,.2);padding:10px;border-radius:4px\">'+\n        '<div style=\"color:#ff6644;font-weight:700;font-size:1rem\">'+_T('악의 고갈')+'</div>'+\n        '<div style=\"font-size:.85rem;color:#ffaaaa;margin-top:4px\">'+\n        '<span style=\"color:'+enhColor(res.from)+'\">+'+res.from+'</span> → '+\n        '<span style=\"color:'+col+'\">+'+res.to+'</span>'+\n        ' ('+_T('목표')+' <span style=\"color:#cc4444\">+'+res.target+'</span> '+_T('미달')+')'+\n        ' | '+_T('시도')+' '+res.tries.toLocaleString()+_T('회')+\n        ' | '+_T('소비')+' <span style=\"color:#ffaa44\">'+res.used.toLocaleString()+_T('악의')+'</span>'+\n        '</div>'+\n        '<div style=\"font-size:.78rem;color:#664444;margin-top:6px\">'+_T('악의를 더 모아 재시도하세요')+'</div>'+\n        '</div>';\n      SFX.hurt();\n      addTxt(P.x,P.y-25,_T('악의 소진...'),'#cc4444',70);\n    }\n  }\n  renderForge();\n}",
        "aiSha256": "707c8e54934301b495b9dae866047dfec2246dfc2607c2f643d853f510cbe466",
        "callerSha256": "226dfb82b5b1a360c047e2862e91bc0e1d93df41d8ad10d149dac0b276dcbb34"
      }
    }
  ],
  "runs": [
    {
      "file": "game.html",
      "scenario": "nonfinite target",
      "entry": "helper",
      "policy": "current",
      "input": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "target": "Infinity",
        "budget": 50000
      },
      "after": {
        "item": {
          "id": 91,
          "enh": 2,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "mats": 17375
      },
      "returned": {
        "ok": false,
        "from": 0,
        "to": 2,
        "target": "Infinity",
        "used": 32625,
        "tries": 2
      },
      "trace": [
        {
          "op": "RNG",
          "value": 0
        },
        {
          "op": "RNG",
          "value": 0
        }
      ]
    },
    {
      "file": "game.html",
      "scenario": "nonfinite target",
      "entry": "helper",
      "policy": "candidate",
      "input": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "target": "Infinity",
        "budget": 50000
      },
      "after": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "mats": 50000
      },
      "returned": {
        "ok": false,
        "msg": "강화 입력 오류",
        "used": 0,
        "tries": 0
      },
      "trace": []
    },
    {
      "file": "game.html",
      "scenario": "nonfinite target",
      "entry": "caller",
      "policy": "current",
      "input": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "target": "Infinity",
        "budget": 50000
      },
      "after": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "mats": 50000
      },
      "returned": "undefined",
      "error": {
        "name": "Error",
        "code": "ERR_SCRIPT_EXECUTION_TIMEOUT",
        "message": "Script execution timed out after 80ms"
      },
      "trace": []
    },
    {
      "file": "game.html",
      "scenario": "nonfinite target",
      "entry": "caller",
      "policy": "candidate",
      "input": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "target": "Infinity",
        "budget": 50000
      },
      "after": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "mats": 50000
      },
      "returned": "undefined",
      "trace": [
        {
          "op": "addTxt",
          "args": [
            0,
            -20,
            "강화 입력 오류",
            "#cc4444",
            50
          ]
        }
      ]
    },
    {
      "file": "game.html",
      "scenario": "finite target budget",
      "entry": "helper",
      "policy": "current",
      "input": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "target": 2,
        "budget": 50000
      },
      "after": {
        "item": {
          "id": 91,
          "enh": 2,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "mats": 17375
      },
      "returned": {
        "ok": true,
        "from": 0,
        "to": 2,
        "target": 2,
        "used": 32625,
        "tries": 2
      },
      "trace": [
        {
          "op": "RNG",
          "value": 0
        },
        {
          "op": "RNG",
          "value": 0
        }
      ]
    },
    {
      "file": "game.html",
      "scenario": "finite target budget",
      "entry": "helper",
      "policy": "candidate",
      "input": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "target": 2,
        "budget": 50000
      },
      "after": {
        "item": {
          "id": 91,
          "enh": 2,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "mats": 17375
      },
      "returned": {
        "ok": true,
        "from": 0,
        "to": 2,
        "target": 2,
        "used": 32625,
        "tries": 2
      },
      "trace": [
        {
          "op": "RNG",
          "value": 0
        },
        {
          "op": "RNG",
          "value": 0
        }
      ]
    },
    {
      "file": "game.html",
      "scenario": "finite target budget",
      "entry": "caller",
      "policy": "current",
      "input": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "target": 2,
        "budget": 50000
      },
      "after": {
        "item": {
          "id": 91,
          "enh": 2,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "mats": 17375
      },
      "returned": "undefined",
      "trace": [
        {
          "op": "RNG",
          "value": 0
        },
        {
          "op": "RNG",
          "value": 0
        },
        {
          "op": "dbSaveNow"
        },
        {
          "op": "applyStats"
        },
        {
          "op": "renderForge"
        }
      ]
    },
    {
      "file": "game.html",
      "scenario": "finite target budget",
      "entry": "caller",
      "policy": "candidate",
      "input": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "target": 2,
        "budget": 50000
      },
      "after": {
        "item": {
          "id": 91,
          "enh": 2,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "mats": 17375
      },
      "returned": "undefined",
      "trace": [
        {
          "op": "RNG",
          "value": 0
        },
        {
          "op": "RNG",
          "value": 0
        },
        {
          "op": "dbSaveNow"
        },
        {
          "op": "applyStats"
        },
        {
          "op": "renderForge"
        }
      ]
    },
    {
      "file": "game.html",
      "scenario": "insufficient budget",
      "entry": "helper",
      "policy": "current",
      "input": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "target": 2,
        "budget": 1000
      },
      "after": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "mats": 1000
      },
      "returned": {
        "ok": false,
        "from": 0,
        "to": 0,
        "target": 2,
        "used": 0,
        "tries": 0
      },
      "trace": []
    },
    {
      "file": "game.html",
      "scenario": "insufficient budget",
      "entry": "helper",
      "policy": "candidate",
      "input": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "target": 2,
        "budget": 1000
      },
      "after": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "mats": 1000
      },
      "returned": {
        "ok": false,
        "from": 0,
        "to": 0,
        "target": 2,
        "used": 0,
        "tries": 0
      },
      "trace": []
    },
    {
      "file": "game.html",
      "scenario": "insufficient budget",
      "entry": "caller",
      "policy": "current",
      "input": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "target": 2,
        "budget": 1000
      },
      "after": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "mats": 1000
      },
      "returned": "undefined",
      "trace": [
        {
          "op": "applyStats"
        },
        {
          "op": "renderForge"
        }
      ]
    },
    {
      "file": "game.html",
      "scenario": "insufficient budget",
      "entry": "caller",
      "policy": "candidate",
      "input": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "target": 2,
        "budget": 1000
      },
      "after": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "mats": 1000
      },
      "returned": "undefined",
      "trace": [
        {
          "op": "applyStats"
        },
        {
          "op": "renderForge"
        }
      ]
    },
    {
      "file": "game-easy-test.html",
      "scenario": "nonfinite target",
      "entry": "helper",
      "policy": "current",
      "input": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "target": "Infinity",
        "budget": 50000
      },
      "after": {
        "item": {
          "id": 91,
          "enh": 2,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "mats": 17375
      },
      "returned": {
        "ok": false,
        "from": 0,
        "to": 2,
        "target": "Infinity",
        "used": 32625,
        "tries": 2
      },
      "trace": [
        {
          "op": "RNG",
          "value": 0
        },
        {
          "op": "RNG",
          "value": 0
        }
      ]
    },
    {
      "file": "game-easy-test.html",
      "scenario": "nonfinite target",
      "entry": "helper",
      "policy": "candidate",
      "input": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "target": "Infinity",
        "budget": 50000
      },
      "after": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "mats": 50000
      },
      "returned": {
        "ok": false,
        "msg": "강화 입력 오류",
        "used": 0,
        "tries": 0
      },
      "trace": []
    },
    {
      "file": "game-easy-test.html",
      "scenario": "nonfinite target",
      "entry": "caller",
      "policy": "current",
      "input": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "target": "Infinity",
        "budget": 50000
      },
      "after": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "mats": 50000
      },
      "returned": "undefined",
      "error": {
        "name": "Error",
        "code": "ERR_SCRIPT_EXECUTION_TIMEOUT",
        "message": "Script execution timed out after 80ms"
      },
      "trace": []
    },
    {
      "file": "game-easy-test.html",
      "scenario": "nonfinite target",
      "entry": "caller",
      "policy": "candidate",
      "input": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "target": "Infinity",
        "budget": 50000
      },
      "after": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "mats": 50000
      },
      "returned": "undefined",
      "trace": [
        {
          "op": "addTxt",
          "args": [
            0,
            -20,
            "강화 입력 오류",
            "#cc4444",
            50
          ]
        }
      ]
    },
    {
      "file": "game-easy-test.html",
      "scenario": "finite target budget",
      "entry": "helper",
      "policy": "current",
      "input": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "target": 2,
        "budget": 50000
      },
      "after": {
        "item": {
          "id": 91,
          "enh": 2,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "mats": 17375
      },
      "returned": {
        "ok": true,
        "from": 0,
        "to": 2,
        "target": 2,
        "used": 32625,
        "tries": 2
      },
      "trace": [
        {
          "op": "RNG",
          "value": 0
        },
        {
          "op": "RNG",
          "value": 0
        }
      ]
    },
    {
      "file": "game-easy-test.html",
      "scenario": "finite target budget",
      "entry": "helper",
      "policy": "candidate",
      "input": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "target": 2,
        "budget": 50000
      },
      "after": {
        "item": {
          "id": 91,
          "enh": 2,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "mats": 17375
      },
      "returned": {
        "ok": true,
        "from": 0,
        "to": 2,
        "target": 2,
        "used": 32625,
        "tries": 2
      },
      "trace": [
        {
          "op": "RNG",
          "value": 0
        },
        {
          "op": "RNG",
          "value": 0
        }
      ]
    },
    {
      "file": "game-easy-test.html",
      "scenario": "finite target budget",
      "entry": "caller",
      "policy": "current",
      "input": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "target": 2,
        "budget": 50000
      },
      "after": {
        "item": {
          "id": 91,
          "enh": 2,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "mats": 17375
      },
      "returned": "undefined",
      "trace": [
        {
          "op": "RNG",
          "value": 0
        },
        {
          "op": "RNG",
          "value": 0
        },
        {
          "op": "dbSaveNow"
        },
        {
          "op": "applyStats"
        },
        {
          "op": "renderForge"
        }
      ]
    },
    {
      "file": "game-easy-test.html",
      "scenario": "finite target budget",
      "entry": "caller",
      "policy": "candidate",
      "input": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "target": 2,
        "budget": 50000
      },
      "after": {
        "item": {
          "id": 91,
          "enh": 2,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "mats": 17375
      },
      "returned": "undefined",
      "trace": [
        {
          "op": "RNG",
          "value": 0
        },
        {
          "op": "RNG",
          "value": 0
        },
        {
          "op": "dbSaveNow"
        },
        {
          "op": "applyStats"
        },
        {
          "op": "renderForge"
        }
      ]
    },
    {
      "file": "game-easy-test.html",
      "scenario": "insufficient budget",
      "entry": "helper",
      "policy": "current",
      "input": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "target": 2,
        "budget": 1000
      },
      "after": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "mats": 1000
      },
      "returned": {
        "ok": false,
        "from": 0,
        "to": 0,
        "target": 2,
        "used": 0,
        "tries": 0
      },
      "trace": []
    },
    {
      "file": "game-easy-test.html",
      "scenario": "insufficient budget",
      "entry": "helper",
      "policy": "candidate",
      "input": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "target": 2,
        "budget": 1000
      },
      "after": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "mats": 1000
      },
      "returned": {
        "ok": false,
        "from": 0,
        "to": 0,
        "target": 2,
        "used": 0,
        "tries": 0
      },
      "trace": []
    },
    {
      "file": "game-easy-test.html",
      "scenario": "insufficient budget",
      "entry": "caller",
      "policy": "current",
      "input": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "target": 2,
        "budget": 1000
      },
      "after": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "mats": 1000
      },
      "returned": "undefined",
      "trace": [
        {
          "op": "applyStats"
        },
        {
          "op": "renderForge"
        }
      ]
    },
    {
      "file": "game-easy-test.html",
      "scenario": "insufficient budget",
      "entry": "caller",
      "policy": "candidate",
      "input": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "target": 2,
        "budget": 1000
      },
      "after": {
        "item": {
          "id": 91,
          "enh": 0,
          "rarity": 2,
          "nested": {
            "keep": "original"
          }
        },
        "mats": 1000
      },
      "returned": "undefined",
      "trace": [
        {
          "op": "applyStats"
        },
        {
          "op": "renderForge"
        }
      ]
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
    "command": "rg -n \"aiEnhance|_doAiEnhance|_aiTarget|enhCost|자동 강화\" docs/",
    "exitCode": 0,
    "matchCount": 35,
    "outputSha256": "71be5e5476b5280fbebb181e91d0ff966315ef94d4193bdd275dce0f37c01693",
    "documents": [
      "docs/14밸런스+수치테이블/14밸런스+수치테이블.md",
      "docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md",
      "docs/CHANGELOG_SYNC.md",
      "docs/14밸런스+수치테이블/BALANCE_ECONOMY_TEAM_MASTER.md",
      "docs/3.2메타·진행시스템/3.2메타·진행시스템.md",
      "docs/15 세이브+데이터구조/15 세이브+데이터구조.md",
      "docs/16번역·로컬라이제이션/번역대상_전체목록.md",
      "docs/0마스터플랜/mac-resume-20261001/map020-evidence/팀실행-영수증.json",
      "docs/0마스터플랜/mac-resume-20261001/3팀-독립검토.md",
      "docs/0마스터플랜/mac-resume-20261001/map020-evidence/BALANCE-읽기근거.json",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_LOG.md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/PERSISTENCE-MAC-PACKAGE-20261002.md",
      "docs/0마스터플랜/mac-resume-20261001/ui03-evidence/BALANCE-팀검토.md",
      "docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/persistence-review-receipt.json",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/persistence-review-result.md"
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
    "status": "PASS_DEFECT_REPRODUCED_MEMORY_GUARDS_CONTROLS_EQUAL",
    "nonfiniteEvent": 1,
    "controls": 2,
    "variants": 2,
    "entries": 2,
    "policies": 2,
    "sourceExecutions": 24,
    "browserValidated": false,
    "loadExecuted": false,
    "NaNBudgetItemEnhCasesExecuted": false
  },
  "checksSha256": "e0cc6411c2b0fce23be88d3b71a6a56fc5b23141b911f9be4887a388f814682d",
  "status": "COMPLETED_CANDIDATE_UNAPPLIED"
}
```

최종 artifact 검증: PASS. 소유2산출+read-only TASK만 존재, checks SHA/JSON24실행/예상timeout2/정본35매칭16문서/양판 source SHA 일치. 재실행0. 검증 시각 2026-10-02T10:40:30.616923+00:00 UTC / 2026-10-02T19:40:30.616923+09:00 KST.
