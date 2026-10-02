# MARKETING 데모 시작 안내 — 패드 보관함 경로

완료 ID: MARKETING-intro-pad-storage-description-20261002. epoch rolling-after-3b548b06-1300, 신규 소유 파일 2개. 이전 검사 재실행 0. production/shared docs/Git/native/user save/외부 게시 변경 0.

## 실제 최초 불일치와 후보

시작 4컷의 살아남아 컷은 D-pad 오른쪽을 단순히 인벤토리로 설명한다. 실제 _pollGamepad의 _DP[15] → openInventoryStorage() → inventory-tab-storage 클릭으로 보관함 탭이 열린다. 실제 _invBagRightClick은 보관함 탭에서 depositStorage를 호출하므로, 장착을 기대하고 안내를 따를 때 다른 조작에 도달한다.

현재 행/버튼/키/슬롯/장비/보관함 로직은 유지한다. _renderIntroGuide에서 패드 모드의 inventory 행 설명 리프만 _introGuideText(['인벤토리 보관함 탭','Inventory storage tab'])으로 표시한다. 키보드 Tab 행의 인벤토리 설명과 다른 조작 행은 유지한다. 쉬운판의 기존 다른 행 KO/EN 분기도 유지한다. assets 추가/번역지원 확대 주장 없음. 콘텐츠 패치는 candidates.patch에 있다.

## 검증 및 한계

| 경계 | 결과 |
|---|---|
| 양판 KO/EN 패드 렌더 | 후보 설명 인벤토리 보관함 탭 / Inventory storage tab |
| actual D-pad dispatch + whole openInventoryStorage + whole bag-right-click | openPanel→storageTab→deposit trace, 원문/후보 동일 |
| 양판 KO/EN 키보드 안내 | 원문/후보 동일, Tab 인벤토리 유지 |
| 실제 변경 범위 | 안내 description 리프1곳씩; 저장/아이템 mutation 없음 |

원 실행 2026-10-02 21:59:35.715 KST, exit0, 오류0. 전체 guide 함수와 catalog/D-pad dispatch를 실제 소스에서 추출했다. DOM·storage-tab click callback·deposit/equip·KO/EN _L은 명시한 대역이다. 전체 _pollGamepad, native pad, UI tab module, 실제 입출고/장착/저장과 다른 27언어 표시·화면 폭은 미검수다. source PASS를 CH1-1 playable/visual acceptance로 대체하지 않는다. root가 현재 source와 각 원함수 SHA를 확인해 순차 통합하고 UIUX/ITEM 소유 변경을 보존해야 한다.

## docs 동기화 인계

전체 docs rg 결과를 아래 원출력으로 보존했다. root 통합 때 INTRO_FOUR_CUTS_20260914.md의 컷4 패드 안내 및 표시 계약, exoduser-hud-redesign.md의 조작 목록 계약과 CHANGELOG_SYNC.md를 같은 내용으로 동기화한다. 매칭 문서의 기존 D-pad→보관함 계약은 바꾸지 않는다. 모든 매칭 문서를 검토하고 추가 검색으로 모순을 제거해야 하며 이 팀은 공유 docs를 쓰지 않았다.

| id/위치 | 모드/키 | 설명/조건 |
|---|---|---|
| _INTRO_KEY_STEPS[3].rows / inventory | pad / D-pad → | 인벤토리 보관함 탭 / Inventory storage tab; state.pad && row[0]==='inventory' |
| 같은 inventory 행 | KBM / BINDS.inventory 기본Tab | 기존 인벤토리 / Inventory |
| _renderIntroGuide | description 새 div 리프 | _introGuideText 통한 기존 _L 조회; 부모 DOM textContent 변경 없음 |
| 실제 조작 | _DP button15 storage | openInventoryStorage→inventory-tab-storage, 기존 입출고 정책 유지 |

## 실행 명령과 전체 원출력

아래 명령은 당시 실행본이다. 저장 과정에서 재실행하지 않았다.

```sh
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node --input-type=module <<'JS'
import {readFileSync} from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';const sha=x=>createHash('sha256').update(x).digest('hex'),out=[];
for(const file of ['game.html','game-easy-test.html']){const src=readFileSync(file,'utf8');function f(name){const a=src.indexOf('function '+name+'('),l=src.indexOf('\n',a),b=src.slice(a,l).trimEnd().endsWith('}')?l:src.indexOf('\n}',a)+2;assert(a>=0&&b>a);const body=src.slice(a,b);new vm.Script(body);return body;}
 const render=f('_renderIntroGuide'),storage=f('openInventoryStorage'),rightClick=f('_invBagRightClick'),keys=f('_introGuideKeys'),text=f('_introGuideText');const ca=src.indexOf('const _INTRO_KEY_STEPS=['),cb=src.indexOf('\nlet _introGuide',ca),catalog=src.slice(ca,cb),lines=src.match(/const _INTRO_LINES=.*;/)[0];const da=src.indexOf('{const _DP=[[12,'),db=src.indexOf('\n  }}',da)+5,dispatch=src.slice(da,db);new vm.Script(dispatch);
 const old=file==='game.html'?'desc.textContent=_L(row[2],row[3]);':"desc.textContent=row[OPT.lang==='en'?3:2];";const fix="desc.textContent=state.pad&&row[0]==='inventory'?_introGuideText(['인벤토리 보관함 탭','Inventory storage tab']):"+old.slice('desc.textContent='.length);assert.equal(render.split(old).length,2);const candidate=render.replace(old,fix);
 function run(body,{pad=true,lang='ko',press=15}={}){const calls=[],nodes=new Map();class Node{constructor(id=''){this.id=id;this.children=[];this.style={};this.dataset={};this.textContent='';this.classes=new Set();this.classList={contains:k=>this.classes.has(k),add:k=>this.classes.add(k),remove:k=>this.classes.delete(k)};}replaceChildren(){this.children=[];}appendChild(n){this.children.push(n);}}
 const $=id=>{if(!nodes.has(id))nodes.set(id,new Node(id));return nodes.get(id);};$('inventory-tab-storage').click=()=>{$('invPanel').dataset.inventoryPage='storage';calls.push('storageTab');};
 const s={$,_introGuide:{step:3,done:false,pad},OPT:{lang},BINDS:{interact:'KeyR',inventory:'Tab',settings:'Escape'},keyName:x=>x,_T:x=>x,_L:(ko,en)=>lang==='en'?en:ko,document:{createElement:()=>new Node(),querySelector:()=>null},_gpad:{buttons:Array.from({length:16},(_,i)=>({pressed:i===press}))},_gpBtnsPrev:{},G:{on:true,paused:false},openPanel:id=>{$(id).classList.add('on');calls.push(['openPanel',id]);},closeAllPanels:()=>calls.push('closePanels'),togglePanel:id=>calls.push(['toggle',id]),closePanel:id=>calls.push(['close',id]),INV:{bag:[{id:'fixture',slot:'weapon'}]},depositStorage:i=>calls.push(['deposit',i]),equipItem:i=>calls.push(['equip',i.id]),applyStats:()=>calls.push('stats'),renderInv:()=>calls.push('render')};
 const c=vm.createContext(s);vm.runInContext(catalog+'\n'+lines+'\n'+keys+'\n'+text+'\n'+body+'\n'+storage+'\n'+rightClick,c);vm.runInContext('_renderIntroGuide()',c);const rows=$('ikBody').children.map(n=>({key:n.children[0].textContent,desc:n.children[1].textContent}));vm.runInContext(dispatch,c);vm.runInContext('_invBagRightClick(0)',c);return {rows,calls,page:$('invPanel').dataset.inventoryPage||null};}
 const controls=[];for(const lang of ['ko','en']){const original=run(render,{lang}),fixed=run(candidate,{lang});assert.equal(original.rows[1].desc,lang==='ko'?'인벤토리':'Inventory');assert.equal(fixed.rows[1].desc,lang==='ko'?'인벤토리 보관함 탭':'Inventory storage tab');assert.equal(fixed.page,'storage');assert(fixed.calls.some(x=>Array.isArray(x)&&x[0]==='deposit'));assert.deepEqual(original.calls,fixed.calls);const kbOriginal=run(render,{lang,pad:false}),kbFixed=run(candidate,{lang,pad:false});assert.deepEqual(kbOriginal,kbFixed);controls.push({lang,original,fixed,kbm:kbFixed.rows});}
 assert.equal(sha(readFileSync(file,'utf8')),sha(src));out.push({file,inputSha:sha(src),hashes:{render:sha(render),catalog:sha(catalog),dispatch:sha(dispatch),storage:sha(storage),rightClick:sha(rightClick)},old,fix,controls});}
console.log(JSON.stringify({taskId:'MARKETING-intro-pad-storage-description-20261002',at:new Date().toISOString(),status:'SOURCE_PAD_GUIDE_STORAGE_COPY_CANDIDATE_PASS',out,filesWritten:0,productionApplied:false,runtimeAccepted:false,boundary:'actual guide catalog/render, D-pad dispatch block, openInventoryStorage and bag-right-click whole functions. DOM/tab click callback/equip/deposit and KO/EN L helper explicit stubs; no real item mutation/save/native pad; candidate changes only guide description.'},null,2));
JS
```

```json
{
  "execution": {
    "chunk_id": "d8c8a4",
    "wall_time_seconds": 0.000006375,
    "exit_code": 0,
    "original_token_count": 2208,
    "output": "{\n  \"taskId\": \"MARKETING-intro-pad-storage-description-20261002\",\n  \"at\": \"2026-10-02T12:59:35.715Z\",\n  \"status\": \"SOURCE_PAD_GUIDE_STORAGE_COPY_CANDIDATE_PASS\",\n  \"out\": [\n    {\n      \"file\": \"game.html\",\n      \"inputSha\": \"eccfbb2d1492551d0c6f3847ceac5d0358b8e53e66625cc922faa8fc467bdd81\",\n      \"hashes\": {\n        \"render\": \"29a6c86b811fe0bc0ff80f099b4f9aa04496d6297a7ff17432aebf38a64de5a3\",\n        \"catalog\": \"5a97424081e0a123602ecd06b73dd4561616c3e635781710fa8fe2869fb46a53\",\n        \"dispatch\": \"02ef985837081da5bb988108ae5f24811612347c58863926871e389ae56dfcc4\",\n        \"storage\": \"daf2f91e4d40cc5a528e2603d5a178f7e7689ea6d295bcc3e5bf7f85e5b16738\",\n        \"rightClick\": \"50bbce895bb8bef6047be9265e0873673351e7bd40b23dffd0e47a26bdc62f47\"\n      },\n      \"old\": \"desc.textContent=_L(row[2],row[3]);\",\n      \"fix\": \"desc.textContent=state.pad&&row[0]==='inventory'?_introGuideText(['인벤토리 보관함 탭','Inventory storage tab']):_L(row[2],row[3]);\",\n      \"controls\": [\n        {\n          \"lang\": \"ko\",\n          \"original\": {\n            \"rows\": [\n              {\n                \"key\": \"L3\",\n                \"desc\": \"아이템 줍기\"\n              },\n              {\n                \"key\": \"D-pad →\",\n                \"desc\": \"인벤토리\"\n              },\n              {\n                \"key\": \"Start\",\n                \"desc\": \"설정\"\n              }\n            ],\n            \"calls\": [\n              [\n                \"openPanel\",\n                \"invPanel\"\n              ],\n              \"storageTab\",\n              [\n                \"deposit\",\n                0\n              ]\n            ],\n            \"page\": \"storage\"\n          },\n          \"fixed\": {\n            \"rows\": [\n              {\n                \"key\": \"L3\",\n                \"desc\": \"아이템 줍기\"\n              },\n              {\n                \"key\": \"D-pad →\",\n                \"desc\": \"인벤토리 보관함 탭\"\n              },\n              {\n                \"key\": \"Start\",\n                \"desc\": \"설정\"\n              }\n            ],\n            \"calls\": [\n              [\n                \"openPanel\",\n                \"invPanel\"\n              ],\n              \"storageTab\",\n              [\n                \"deposit\",\n                0\n              ]\n            ],\n            \"page\": \"storage\"\n          },\n          \"kbm\": [\n            {\n              \"key\": \"KeyR\",\n              \"desc\": \"아이템 줍기\"\n            },\n            {\n              \"key\": \"Tab\",\n              \"desc\": \"인벤토리\"\n            },\n            {\n              \"key\": \"Escape\",\n              \"desc\": \"설정\"\n            }\n          ]\n        },\n        {\n          \"lang\": \"en\",\n          \"original\": {\n            \"rows\": [\n              {\n                \"key\": \"L3\",\n                \"desc\": \"Pick up items\"\n              },\n              {\n                \"key\": \"D-pad →\",\n                \"desc\": \"Inventory\"\n              },\n              {\n                \"key\": \"Start\",\n                \"desc\": \"Settings\"\n              }\n            ],\n            \"calls\": [\n              [\n                \"openPanel\",\n                \"invPanel\"\n              ],\n              \"storageTab\",\n              [\n                \"deposit\",\n                0\n              ]\n            ],\n            \"page\": \"storage\"\n          },\n          \"fixed\": {\n            \"rows\": [\n              {\n                \"key\": \"L3\",\n                \"desc\": \"Pick up items\"\n              },\n              {\n                \"key\": \"D-pad →\",\n                \"desc\": \"Inventory storage tab\"\n              },\n              {\n                \"key\": \"Start\",\n                \"desc\": \"Settings\"\n              }\n            ],\n            \"calls\": [\n              [\n                \"openPanel\",\n                \"invPanel\"\n              ],\n              \"storageTab\",\n              [\n                \"deposit\",\n                0\n              ]\n            ],\n            \"page\": \"storage\"\n          },\n          \"kbm\": [\n            {\n              \"key\": \"KeyR\",\n              \"desc\": \"Pick up items\"\n            },\n            {\n              \"key\": \"Tab\",\n              \"desc\": \"Inventory\"\n            },\n            {\n              \"key\": \"Escape\",\n              \"desc\": \"Settings\"\n            }\n          ]\n        }\n      ]\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"inputSha\": \"b6b8f27539dcc8bfb342793cbce692dfae169dff9f1db12b2012c8166cd49515\",\n      \"hashes\": {\n        \"render\": \"646b1f056e606be814c4f5adfc018b72c6dbaf7ac4a7c0c3d4fea1f13b2cc235\",\n        \"catalog\": \"5a97424081e0a123602ecd06b73dd4561616c3e635781710fa8fe2869fb46a53\",\n        \"dispatch\": \"02ef985837081da5bb988108ae5f24811612347c58863926871e389ae56dfcc4\",\n        \"storage\": \"daf2f91e4d40cc5a528e2603d5a178f7e7689ea6d295bcc3e5bf7f85e5b16738\",\n        \"rightClick\": \"50bbce895bb8bef6047be9265e0873673351e7bd40b23dffd0e47a26bdc62f47\"\n      },\n      \"old\": \"desc.textContent=row[OPT.lang==='en'?3:2];\",\n      \"fix\": \"desc.textContent=state.pad&&row[0]==='inventory'?_introGuideText(['인벤토리 보관함 탭','Inventory storage tab']):row[OPT.lang==='en'?3:2];\",\n      \"controls\": [\n        {\n          \"lang\": \"ko\",\n          \"original\": {\n            \"rows\": [\n              {\n                \"key\": \"L3\",\n                \"desc\": \"아이템 줍기\"\n              },\n              {\n                \"key\": \"D-pad →\",\n                \"desc\": \"인벤토리\"\n              },\n              {\n                \"key\": \"Start\",\n                \"desc\": \"설정\"\n              }\n            ],\n            \"calls\": [\n              [\n                \"openPanel\",\n                \"invPanel\"\n              ],\n              \"storageTab\",\n              [\n                \"deposit\",\n                0\n              ]\n            ],\n            \"page\": \"storage\"\n          },\n          \"fixed\": {\n            \"rows\": [\n              {\n                \"key\": \"L3\",\n                \"desc\": \"아이템 줍기\"\n              },\n              {\n                \"key\": \"D-pad →\",\n                \"desc\": \"인벤토리 보관함 탭\"\n              },\n              {\n                \"key\": \"Start\",\n                \"desc\": \"설정\"\n              }\n            ],\n            \"calls\": [\n              [\n                \"openPanel\",\n                \"invPanel\"\n              ],\n              \"storageTab\",\n              [\n                \"deposit\",\n                0\n              ]\n            ],\n            \"page\": \"storage\"\n          },\n          \"kbm\": [\n            {\n              \"key\": \"KeyR\",\n              \"desc\": \"아이템 줍기\"\n            },\n            {\n              \"key\": \"Tab\",\n              \"desc\": \"인벤토리\"\n            },\n            {\n              \"key\": \"Escape\",\n              \"desc\": \"설정\"\n            }\n          ]\n        },\n        {\n          \"lang\": \"en\",\n          \"original\": {\n            \"rows\": [\n              {\n                \"key\": \"L3\",\n                \"desc\": \"Pick up items\"\n              },\n              {\n                \"key\": \"D-pad →\",\n                \"desc\": \"Inventory\"\n              },\n              {\n                \"key\": \"Start\",\n                \"desc\": \"Settings\"\n              }\n            ],\n            \"calls\": [\n              [\n                \"openPanel\",\n                \"invPanel\"\n              ],\n              \"storageTab\",\n              [\n                \"deposit\",\n                0\n              ]\n            ],\n            \"page\": \"storage\"\n          },\n          \"fixed\": {\n            \"rows\": [\n              {\n                \"key\": \"L3\",\n                \"desc\": \"Pick up items\"\n              },\n              {\n                \"key\": \"D-pad →\",\n                \"desc\": \"Inventory storage tab\"\n              },\n              {\n                \"key\": \"Start\",\n                \"desc\": \"Settings\"\n              }\n            ],\n            \"calls\": [\n              [\n                \"openPanel\",\n                \"invPanel\"\n              ],\n              \"storageTab\",\n              [\n                \"deposit\",\n                0\n              ]\n            ],\n            \"page\": \"storage\"\n          },\n          \"kbm\": [\n            {\n              \"key\": \"KeyR\",\n              \"desc\": \"Pick up items\"\n            },\n            {\n              \"key\": \"Tab\",\n              \"desc\": \"Inventory\"\n            },\n            {\n              \"key\": \"Escape\",\n              \"desc\": \"Settings\"\n            }\n          ]\n        }\n      ]\n    }\n  ],\n  \"filesWritten\": 0,\n  \"productionApplied\": false,\n  \"runtimeAccepted\": false,\n  \"boundary\": \"actual guide catalog/render, D-pad dispatch block, openInventoryStorage and bag-right-click whole functions. DOM/tab click callback/equip/deposit and KO/EN L helper explicit stubs; no real item mutation/save/native pad; candidate changes only guide description.\"\n}\n"
  },
  "docsSearch": {
    "chunk_id": "b56206",
    "wall_time_seconds": 0.000011542,
    "exit_code": 0,
    "original_token_count": 103,
    "output": "docs/2_4 펫시스템/2_4 펫시스템.md\ndocs/CHANGELOG_SYNC.md\ndocs/13출시·마케팅/STEAM_DECK_PREPARATION_20260914.md\ndocs/3.1 ui hud 디자인/INTRO_FOUR_CUTS_20260914.md\ndocs/3.1 ui hud 디자인/exoduser-hud-redesign.md\ndocs/3.3 키바인딩+설정/3.3 키바인딩+설정.md\ndocs/3.3 키바인딩+설정/게임패드_매핑표.md\ndocs/2_7 인벤토리+장비시스템/보관함_단일_UI_20260928.md\n"
  }
}
```

## 저장 시 현재 source 확인 (검사 재실행 아님)

[
  {
    "file": "game.html",
    "currentSha": "eccfbb2d1492551d0c6f3847ceac5d0358b8e53e66625cc922faa8fc467bdd81",
    "renderSha": "29a6c86b811fe0bc0ff80f099b4f9aa04496d6297a7ff17432aebf38a64de5a3",
    "productionApplied": false
  },
  {
    "file": "game-easy-test.html",
    "currentSha": "b6b8f27539dcc8bfb342793cbce692dfae169dff9f1db12b2012c8166cd49515",
    "renderSha": "646b1f056e606be814c4f5adfc018b72c6dbaf7ac4a7c0c3d4fea1f13b2cc235",
    "productionApplied": false
  }
]
