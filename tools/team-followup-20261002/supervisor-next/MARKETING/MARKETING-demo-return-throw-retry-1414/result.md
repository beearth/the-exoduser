# MARKETING demo return exception lifetime handoff

Completion: MARKETING-demo-return-throw-retry-owner-1414
Received instruction: SUPERVISOR-MARKETING-1414
Capacity: rolling-after-ca261460-1404, MARKETING2 files. Source-only candidate; root integration required.

## Result

Actual complete goToLobby handler and inline demoEnd CTA tested on main/easy. Previous memory single-flight candidate sets pending before cleanup; cleanup or location exception permanently latches it. Candidate wraps full body in outer try/catch, resets pending on thrown cleanup/location and rethrows. Existing inner save catch remains: save rejection logs then navigates, pending remains until document unload. Successful normal call identical.

| case | previous candidate successful nav | corrected candidate successful nav | corrected saves |
|---|---:|---:|---:|
| cleanup throw, then second normal CTA | 0 | 1 | 1 |
| location assignment throw, then second normal CTA | 0 | 1 | 2 |
| normal single CTA | 1 | 1 | 1 |
| save rejection | 1 | 1 | 1 |

Main route /?lobby=1&demo=1, easy route indexdemo.html preserved. No timer, text, blackout or numeric parameter changes. No duplicate2→1 retest.

## Patch ownership

candidates.patch contains the corrected return guard plus previously completed focused demo CTA Space ownership candidate. It supersedes earlier return-only memory patch. Both independently tested; combined patch generated from pinned source without production application. Focus selector anchor overlaps previous saved death keyboard candidate: root compose, do not overwrite. Easy legacy route acceptance remains separate; no fresh-main-lobby claim for easy.

## Root docs synchronization table

| id | name | exact contract | location/status |
|---|---|---|---|
| _lobbyReturnPending | 로비 복귀 단일 진행 | false initially; false→true before body; duplicate invocation returns; successful location assignment and caught save rejection retain true until unload | goToLobby main/easy candidate |
| outer catch | 복구 가능한 복귀 예외 | cleanup/location throws: pending=false; rethrow same exception; later normal CTA allowed | goToLobby outer try/catch |
| inner save catch | 저장 실패 복귀 | existing console.error + route assignment preserved | existing save try/catch |
| demoEnd focus | 데모 종료 CTA 키 소유 | visible style.display flex; own button; Space/Enter/NumpadEnter/Tab left to default control handling | global keydown candidate; first Tab entry unverified |
| route main | 로비 복귀 목적지 | demo /?lobby=1&demo=1; non-demo /?lobby=1 | main original route |
| route easy | 기존 easy 복귀 목적지 | demo indexdemo.html; non-demo /?lobby=1 | easy original route |

Apply table to matching marketing, save, UI/keybind docs and CHANGELOG_SYNC at root integration; full docs rg output below. Shared docs0/protected2_3 edits0. Production0/Git0/user save0/native UI0/audio0/new session0. Source fixture PASS does not mean native milestone acceptance. Official blocked goal unchanged, new authorized source turn executed.

## Latest exact execution

```json
{
  "chunk_id": "2c48a7",
  "wall_time_seconds": 0.000006417,
  "exit_code": 0,
  "original_token_count": 3205,
  "output": "{\n  \"completionId\": \"MARKETING-demo-return-throw-retry-owner-1414\",\n  \"messageId\": \"SUPERVISOR-MARKETING-1414\",\n  \"at\": \"2026-10-02T14:15:27.917Z\",\n  \"status\": \"SOURCE_CTA_THROW_RETRY_CANDIDATE_PASS\",\n  \"out\": [\n    {\n      \"file\": \"game.html\",\n      \"inputSha\": \"ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613\",\n      \"sourceCTA\": \"async function goToLobby(){\\n  if(typeof _deathDlgStop==='function')_deathDlgStop();\\n  try{\\n    // 사망 상태면 HP 복구 후 저장 (죽은 채로 저장 방지)\\n    if(P&&P.hp<=0){P.hp=P.mhp;P.st=P.mst;P.mp=P.mmp;P.shield=P.mshield;P.s='idle'}\\n    if(_dbReady)await dbSave();\\n  }catch(e){console.error('[goToLobby] save error:',e)}\\n  window.location.href=_DEMO_MODE?'/?lobby=1&demo=1':'/?lobby=1';\\n}\",\n      \"sourceSha\": \"0ad806fa64f401c091cbb22b8188c46b8a31a55c05649d659f0303709c1d9dc8\",\n      \"previousCandidate\": \"let _lobbyReturnPending=false;\\nasync function goToLobby(){\\n  if(_lobbyReturnPending)return;\\n  _lobbyReturnPending=true;\\n  if(typeof _deathDlgStop==='function')_deathDlgStop();\\n  try{\\n    // 사망 상태면 HP 복구 후 저장 (죽은 채로 저장 방지)\\n    if(P&&P.hp<=0){P.hp=P.mhp;P.st=P.mst;P.mp=P.mmp;P.shield=P.mshield;P.s='idle'}\\n    if(_dbReady)await dbSave();\\n  }catch(e){console.error('[goToLobby] save error:',e)}\\n  window.location.href=_DEMO_MODE?'/?lobby=1&demo=1':'/?lobby=1';\\n}\",\n      \"candidateCTA\": \"let _lobbyReturnPending=false;\\nasync function goToLobby(){\\n  if(_lobbyReturnPending)return;\\n  _lobbyReturnPending=true;\\n  try{\\n    if(typeof _deathDlgStop==='function')_deathDlgStop();\\n    try{\\n      // 사망 상태면 HP 복구 후 저장 (죽은 채로 저장 방지)\\n      if(P&&P.hp<=0){P.hp=P.mhp;P.st=P.mst;P.mp=P.mmp;P.shield=P.mshield;P.s='idle'}\\n      if(_dbReady)await dbSave();\\n    }catch(e){console.error('[goToLobby] save error:',e)}\\n    window.location.href=_DEMO_MODE?'/?lobby=1&demo=1':'/?lobby=1';\\n  }catch(e){_lobbyReturnPending=false;throw e;}\\n}\",\n      \"expected\": \"/?lobby=1&demo=1\",\n      \"cleanupOld\": {\n        \"afterFirst\": {\n          \"calls\": [\n            \"cleanup\"\n          ],\n          \"errors\": [\n            \"fixture cleanup failed\"\n          ],\n          \"pending\": true\n        },\n        \"calls\": [\n          \"cleanup\"\n        ],\n        \"errors\": [\n          \"fixture cleanup failed\"\n        ],\n        \"pending\": true,\n        \"saves\": 0,\n        \"navigations\": 0,\n        \"expected\": \"/?lobby=1&demo=1\"\n      },\n      \"cleanupFixed\": {\n        \"afterFirst\": {\n          \"calls\": [\n            \"cleanup\"\n          ],\n          \"errors\": [\n            \"fixture cleanup failed\"\n          ],\n          \"pending\": false\n        },\n        \"calls\": [\n          \"cleanup\",\n          \"cleanup\",\n          \"save\",\n          [\n            \"navigationAttempt\",\n            \"/?lobby=1&demo=1\"\n          ],\n          [\n            \"navigation\",\n            \"/?lobby=1&demo=1\"\n          ]\n        ],\n        \"errors\": [\n          \"fixture cleanup failed\"\n        ],\n        \"pending\": true,\n        \"saves\": 1,\n        \"navigations\": 1,\n        \"expected\": \"/?lobby=1&demo=1\"\n      },\n      \"locationOld\": {\n        \"afterFirst\": {\n          \"calls\": [\n            \"cleanup\",\n            \"save\",\n            [\n              \"navigationAttempt\",\n              \"/?lobby=1&demo=1\"\n            ]\n          ],\n          \"errors\": [\n            \"fixture location failed\"\n          ],\n          \"pending\": true\n        },\n        \"calls\": [\n          \"cleanup\",\n          \"save\",\n          [\n            \"navigationAttempt\",\n            \"/?lobby=1&demo=1\"\n          ]\n        ],\n        \"errors\": [\n          \"fixture location failed\"\n        ],\n        \"pending\": true,\n        \"saves\": 1,\n        \"navigations\": 0,\n        \"expected\": \"/?lobby=1&demo=1\"\n      },\n      \"locationFixed\": {\n        \"afterFirst\": {\n          \"calls\": [\n            \"cleanup\",\n            \"save\",\n            [\n              \"navigationAttempt\",\n              \"/?lobby=1&demo=1\"\n            ]\n          ],\n          \"errors\": [\n            \"fixture location failed\"\n          ],\n          \"pending\": false\n        },\n        \"calls\": [\n          \"cleanup\",\n          \"save\",\n          [\n            \"navigationAttempt\",\n            \"/?lobby=1&demo=1\"\n          ],\n          \"cleanup\",\n          \"save\",\n          [\n            \"navigationAttempt\",\n            \"/?lobby=1&demo=1\"\n          ],\n          [\n            \"navigation\",\n            \"/?lobby=1&demo=1\"\n          ]\n        ],\n        \"errors\": [\n          \"fixture location failed\"\n        ],\n        \"pending\": true,\n        \"saves\": 2,\n        \"navigations\": 1,\n        \"expected\": \"/?lobby=1&demo=1\"\n      },\n      \"normal\": {\n        \"afterFirst\": {\n          \"calls\": [\n            \"cleanup\",\n            \"save\",\n            [\n              \"navigationAttempt\",\n              \"/?lobby=1&demo=1\"\n            ],\n            [\n              \"navigation\",\n              \"/?lobby=1&demo=1\"\n            ]\n          ],\n          \"errors\": [],\n          \"pending\": true\n        },\n        \"calls\": [\n          \"cleanup\",\n          \"save\",\n          [\n            \"navigationAttempt\",\n            \"/?lobby=1&demo=1\"\n          ],\n          [\n            \"navigation\",\n            \"/?lobby=1&demo=1\"\n          ]\n        ],\n        \"errors\": [],\n        \"pending\": true,\n        \"saves\": 1,\n        \"navigations\": 1,\n        \"expected\": \"/?lobby=1&demo=1\"\n      },\n      \"saveRejection\": {\n        \"afterFirst\": {\n          \"calls\": [\n            \"cleanup\",\n            \"save\",\n            \"saveError\",\n            [\n              \"navigationAttempt\",\n              \"/?lobby=1&demo=1\"\n            ],\n            [\n              \"navigation\",\n              \"/?lobby=1&demo=1\"\n            ]\n          ],\n          \"errors\": [],\n          \"pending\": true\n        },\n        \"calls\": [\n          \"cleanup\",\n          \"save\",\n          \"saveError\",\n          [\n            \"navigationAttempt\",\n            \"/?lobby=1&demo=1\"\n          ],\n          [\n            \"navigation\",\n            \"/?lobby=1&demo=1\"\n          ]\n        ],\n        \"errors\": [],\n        \"pending\": true,\n        \"saves\": 1,\n        \"navigations\": 1,\n        \"expected\": \"/?lobby=1&demo=1\"\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"inputSha\": \"8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129\",\n      \"sourceCTA\": \"async function goToLobby(){\\n  if(typeof _deathDlgStop==='function')_deathDlgStop();\\n  try{\\n    // 사망 상태면 HP 복구 후 저장 (죽은 채로 저장 방지)\\n    if(P&&P.hp<=0){P.hp=P.mhp;P.st=P.mst;P.mp=P.mmp;P.shield=P.mshield;P.s='idle'}\\n    if(_dbReady)await dbSave();\\n  }catch(e){console.error('[goToLobby] save error:',e)}\\n  window.location.href=_DEMO_MODE?'indexdemo.html':'/?lobby=1';\\n}\",\n      \"sourceSha\": \"f74baf5d0881ea238015abea884856055a495a1df61741bb19e390e490d70667\",\n      \"previousCandidate\": \"let _lobbyReturnPending=false;\\nasync function goToLobby(){\\n  if(_lobbyReturnPending)return;\\n  _lobbyReturnPending=true;\\n  if(typeof _deathDlgStop==='function')_deathDlgStop();\\n  try{\\n    // 사망 상태면 HP 복구 후 저장 (죽은 채로 저장 방지)\\n    if(P&&P.hp<=0){P.hp=P.mhp;P.st=P.mst;P.mp=P.mmp;P.shield=P.mshield;P.s='idle'}\\n    if(_dbReady)await dbSave();\\n  }catch(e){console.error('[goToLobby] save error:',e)}\\n  window.location.href=_DEMO_MODE?'indexdemo.html':'/?lobby=1';\\n}\",\n      \"candidateCTA\": \"let _lobbyReturnPending=false;\\nasync function goToLobby(){\\n  if(_lobbyReturnPending)return;\\n  _lobbyReturnPending=true;\\n  try{\\n    if(typeof _deathDlgStop==='function')_deathDlgStop();\\n    try{\\n      // 사망 상태면 HP 복구 후 저장 (죽은 채로 저장 방지)\\n      if(P&&P.hp<=0){P.hp=P.mhp;P.st=P.mst;P.mp=P.mmp;P.shield=P.mshield;P.s='idle'}\\n      if(_dbReady)await dbSave();\\n    }catch(e){console.error('[goToLobby] save error:',e)}\\n    window.location.href=_DEMO_MODE?'indexdemo.html':'/?lobby=1';\\n  }catch(e){_lobbyReturnPending=false;throw e;}\\n}\",\n      \"expected\": \"indexdemo.html\",\n      \"cleanupOld\": {\n        \"afterFirst\": {\n          \"calls\": [\n            \"cleanup\"\n          ],\n          \"errors\": [\n            \"fixture cleanup failed\"\n          ],\n          \"pending\": true\n        },\n        \"calls\": [\n          \"cleanup\"\n        ],\n        \"errors\": [\n          \"fixture cleanup failed\"\n        ],\n        \"pending\": true,\n        \"saves\": 0,\n        \"navigations\": 0,\n        \"expected\": \"indexdemo.html\"\n      },\n      \"cleanupFixed\": {\n        \"afterFirst\": {\n          \"calls\": [\n            \"cleanup\"\n          ],\n          \"errors\": [\n            \"fixture cleanup failed\"\n          ],\n          \"pending\": false\n        },\n        \"calls\": [\n          \"cleanup\",\n          \"cleanup\",\n          \"save\",\n          [\n            \"navigationAttempt\",\n            \"indexdemo.html\"\n          ],\n          [\n            \"navigation\",\n            \"indexdemo.html\"\n          ]\n        ],\n        \"errors\": [\n          \"fixture cleanup failed\"\n        ],\n        \"pending\": true,\n        \"saves\": 1,\n        \"navigations\": 1,\n        \"expected\": \"indexdemo.html\"\n      },\n      \"locationOld\": {\n        \"afterFirst\": {\n          \"calls\": [\n            \"cleanup\",\n            \"save\",\n            [\n              \"navigationAttempt\",\n              \"indexdemo.html\"\n            ]\n          ],\n          \"errors\": [\n            \"fixture location failed\"\n          ],\n          \"pending\": true\n        },\n        \"calls\": [\n          \"cleanup\",\n          \"save\",\n          [\n            \"navigationAttempt\",\n            \"indexdemo.html\"\n          ]\n        ],\n        \"errors\": [\n          \"fixture location failed\"\n        ],\n        \"pending\": true,\n        \"saves\": 1,\n        \"navigations\": 0,\n        \"expected\": \"indexdemo.html\"\n      },\n      \"locationFixed\": {\n        \"afterFirst\": {\n          \"calls\": [\n            \"cleanup\",\n            \"save\",\n            [\n              \"navigationAttempt\",\n              \"indexdemo.html\"\n            ]\n          ],\n          \"errors\": [\n            \"fixture location failed\"\n          ],\n          \"pending\": false\n        },\n        \"calls\": [\n          \"cleanup\",\n          \"save\",\n          [\n            \"navigationAttempt\",\n            \"indexdemo.html\"\n          ],\n          \"cleanup\",\n          \"save\",\n          [\n            \"navigationAttempt\",\n            \"indexdemo.html\"\n          ],\n          [\n            \"navigation\",\n            \"indexdemo.html\"\n          ]\n        ],\n        \"errors\": [\n          \"fixture location failed\"\n        ],\n        \"pending\": true,\n        \"saves\": 2,\n        \"navigations\": 1,\n        \"expected\": \"indexdemo.html\"\n      },\n      \"normal\": {\n        \"afterFirst\": {\n          \"calls\": [\n            \"cleanup\",\n            \"save\",\n            [\n              \"navigationAttempt\",\n              \"indexdemo.html\"\n            ],\n            [\n              \"navigation\",\n              \"indexdemo.html\"\n            ]\n          ],\n          \"errors\": [],\n          \"pending\": true\n        },\n        \"calls\": [\n          \"cleanup\",\n          \"save\",\n          [\n            \"navigationAttempt\",\n            \"indexdemo.html\"\n          ],\n          [\n            \"navigation\",\n            \"indexdemo.html\"\n          ]\n        ],\n        \"errors\": [],\n        \"pending\": true,\n        \"saves\": 1,\n        \"navigations\": 1,\n        \"expected\": \"indexdemo.html\"\n      },\n      \"saveRejection\": {\n        \"afterFirst\": {\n          \"calls\": [\n            \"cleanup\",\n            \"save\",\n            \"saveError\",\n            [\n              \"navigationAttempt\",\n              \"indexdemo.html\"\n            ],\n            [\n              \"navigation\",\n              \"indexdemo.html\"\n            ]\n          ],\n          \"errors\": [],\n          \"pending\": true\n        },\n        \"calls\": [\n          \"cleanup\",\n          \"save\",\n          \"saveError\",\n          [\n            \"navigationAttempt\",\n            \"indexdemo.html\"\n          ],\n          [\n            \"navigation\",\n            \"indexdemo.html\"\n          ]\n        ],\n        \"errors\": [],\n        \"pending\": true,\n        \"saves\": 1,\n        \"navigations\": 1,\n        \"expected\": \"indexdemo.html\"\n      }\n    }\n  ],\n  \"filesWritten\": 0,\n  \"productionApplied\": false,\n  \"nativeAccepted\": false,\n  \"boundary\": \"Actual whole goToLobby and extracted inline demoEnd CTA. New cleanup/location throw→second successful CTA cases, plus expressly requested normal1/save rejection comparisons. Duplicate2→1 test not rerun. cleanup/location/save APIs modeled and no user save/navigation/UI executed. Both actual main/easy route literals preserved; old candidate permanently latches after throw, corrected outer catch releases guard and rethrows. All timer/text/blackout values unchanged.\"\n}\n"
}
```

```sh
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node --input-type=module <<'JS'
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import crypto from 'node:crypto';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex'),out=[];
for(const file of ['game.html','game-easy-test.html']){
 const src=fs.readFileSync(file,'utf8'),a=src.indexOf('async function goToLobby(){'),b=src.indexOf('\n}',a)+2,original=src.slice(a,b);
 const guard='  if(_lobbyReturnPending)return;\n  _lobbyReturnPending=true;';
 const oldCandidate='let _lobbyReturnPending=false;\n'+original.replace('async function goToLobby(){','async function goToLobby(){\n'+guard);
 const candidate='let _lobbyReturnPending=false;\nasync function goToLobby(){\n'+guard+'\n  try{\n'+original.slice('async function goToLobby(){\n'.length,-2).split('\n').map(x=>'  '+x).join('\n')+'\n  }catch(e){_lobbyReturnPending=false;throw e;}\n}';
 const inline=src.match(/<button id="demoEndLobby"[^>]*onclick="([^"]+)"/)[1];
 const expr=original.match(/window\.location\.href=([^;]+);/)[1];
 const expected=vm.runInNewContext(expr,{_DEMO_MODE:true});
 async function run(code,failure='none'){
  const calls=[],errors=[];let cleanupCount=0,navCount=0;
  const location={};Object.defineProperty(location,'href',{set:url=>{navCount++;calls.push(['navigationAttempt',url]);if(failure==='location'&&navCount===1)throw new Error('fixture location failed');calls.push(['navigation',url])}});
  const nodes={demoEndLobby:{}},s={$:id=>nodes[id],window:{location},P:{hp:100,mhp:100,st:50,mst:50,mp:60,mmp:60,shield:40,mshield:40,s:'idle'},_DEMO_MODE:true,_dbReady:true,
   _deathDlgStop:()=>{calls.push('cleanup');if(failure==='cleanup'&&++cleanupCount===1)throw new Error('fixture cleanup failed')},
   dbSave:async()=>{calls.push('save');if(failure==='save')throw new Error('fixture save rejected')},console:{error:()=>calls.push('saveError')}};
  const ctx=vm.createContext(s);vm.runInContext(code+'\n$("demoEndLobby").onclick=()=>'+inline,ctx);
  async function click(){try{await nodes.demoEndLobby.onclick()}catch(e){errors.push(e.message)}}
  await click();const afterFirst={calls:JSON.parse(JSON.stringify(calls)),errors:[...errors],pending:vm.runInContext('_lobbyReturnPending',ctx)};
  if(failure==='cleanup'||failure==='location')await click();
  return {afterFirst,calls,errors,pending:vm.runInContext('_lobbyReturnPending',ctx),saves:calls.filter(x=>x==='save').length,navigations:calls.filter(x=>Array.isArray(x)&&x[0]==='navigation').length,expected};
 }
 const cleanupOld=await run(oldCandidate,'cleanup'),cleanupFixed=await run(candidate,'cleanup');
 assert.equal(cleanupOld.afterFirst.pending,true);assert.equal(cleanupOld.saves,0);assert.equal(cleanupOld.navigations,0);
 assert.equal(cleanupFixed.afterFirst.pending,false);assert.equal(cleanupFixed.saves,1);assert.equal(cleanupFixed.navigations,1);
 const locationOld=await run(oldCandidate,'location'),locationFixed=await run(candidate,'location');
 assert.equal(locationOld.navigations,0);assert.equal(locationOld.saves,1);
 assert.equal(locationFixed.afterFirst.pending,false);assert.equal(locationFixed.saves,2);assert.equal(locationFixed.navigations,1);
 const normalOld=await run(oldCandidate),normalFixed=await run(candidate);assert.deepEqual(normalFixed,normalOld);assert.equal(normalFixed.navigations,1);
 const saveOld=await run(oldCandidate,'save'),saveFixed=await run(candidate,'save');assert.deepEqual(saveFixed,saveOld);assert.equal(saveFixed.navigations,1);assert.equal(saveFixed.pending,true);
 assert.equal(sha(fs.readFileSync(file,'utf8')),sha(src));
 out.push({file,inputSha:sha(src),sourceCTA:original,sourceSha:sha(original),previousCandidate:oldCandidate,candidateCTA:candidate,expected,cleanupOld,cleanupFixed,locationOld,locationFixed,normal:normalFixed,saveRejection:saveFixed});
}
console.log(JSON.stringify({completionId:'MARKETING-demo-return-throw-retry-owner-1414',messageId:'SUPERVISOR-MARKETING-1414',at:new Date().toISOString(),status:'SOURCE_CTA_THROW_RETRY_CANDIDATE_PASS',out,filesWritten:0,productionApplied:false,nativeAccepted:false,boundary:'Actual whole goToLobby and extracted inline demoEnd CTA. New cleanup/location throw→second successful CTA cases, plus expressly requested normal1/save rejection comparisons. Duplicate2→1 test not rerun. cleanup/location/save APIs modeled and no user save/navigation/UI executed. Both actual main/easy route literals preserved; old candidate permanently latches after throw, corrected outer catch releases guard and rethrows. All timer/text/blackout values unchanged.'},null,2));
JS
```

## Earlier completed evidence (preserved; not rerun)

```json
{
  "returnTransition": {
    "chunk_id": "893415",
    "wall_time_seconds": 0.000006375,
    "exit_code": 0,
    "original_token_count": 2474,
    "output": "{\n  \"completionId\": \"MARKETING-demo-return-transition-owner-20261002\",\n  \"at\": \"2026-10-02T13:55:48.178Z\",\n  \"status\": \"SOURCE_CTA_SINGLEFLIGHT_CANDIDATE_PASS_NO_CROSS_DOCUMENT_LISTENER_DUPLICATION\",\n  \"out\": [\n    {\n      \"file\": \"game.html\",\n      \"inputSha\": \"ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613\",\n      \"hashes\": {\n        \"cta\": \"0ad806fa64f401c091cbb22b8188c46b8a31a55c05649d659f0303709c1d9dc8\",\n        \"keydown\": \"7911d0276fdd9e409c8427b76e6b09fa8ac04501ab9e6b16542413be11f934a5\",\n        \"keyup\": \"abd27fb0685fbcd68ea917a611c7c252d01c00f284b6c0dec7d7c320bb13f32c\",\n        \"lobbyEnter\": \"100bf5f2e5f144ff177a3335ef14fefe6384faa4ecbed496140a06d8a8558023\",\n        \"startCaller\": \"95f6006067cbf2903a3ddbff87f2771ebec67b4b89b7d2a8d741955d11823e2d\",\n        \"lobby\": \"1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7\"\n      },\n      \"html\": \"<button id=\\\"demoEndLobby\\\" onclick=\\\"goToLobby()\\\" style=\\\"padding:10px 32px;background:rgba(255,150,0,.15);border:2px solid #ff8800;color:#ffcc44;font-family:'Noto Sans KR';font-weight:700;font-size:1rem;cursor:pointer;letter-spacing:.15em;transition:opacity .3s\\\">\",\n      \"original\": {\n        \"beforeSave\": {\n          \"saveCalls\": 2,\n          \"navigations\": 0,\n          \"oldDown\": 1,\n          \"oldUp\": 1\n        },\n        \"navigationCalls\": 2,\n        \"reentry\": {\n          \"clickHandlers\": 1,\n          \"startClicks\": 1,\n          \"startNavigations\": 1,\n          \"oldHandlersInFreshLobby\": 0\n        },\n        \"calls\": [\n          \"dialogStop\",\n          \"save\",\n          \"dialogStop\",\n          \"save\",\n          [\n            \"navigate\",\n            \"/?lobby=1&demo=1\"\n          ],\n          [\n            \"navigate\",\n            \"/?lobby=1&demo=1\"\n          ]\n        ],\n        \"keyReleased\": true\n      },\n      \"fixed\": {\n        \"beforeSave\": {\n          \"saveCalls\": 1,\n          \"navigations\": 0,\n          \"oldDown\": 1,\n          \"oldUp\": 1\n        },\n        \"navigationCalls\": 1,\n        \"reentry\": {\n          \"clickHandlers\": 1,\n          \"startClicks\": 1,\n          \"startNavigations\": 1,\n          \"oldHandlersInFreshLobby\": 0\n        },\n        \"calls\": [\n          \"dialogStop\",\n          \"save\",\n          [\n            \"navigate\",\n            \"/?lobby=1&demo=1\"\n          ]\n        ],\n        \"keyReleased\": true\n      },\n      \"normal\": {\n        \"beforeSave\": {\n          \"saveCalls\": 1,\n          \"navigations\": 0,\n          \"oldDown\": 1,\n          \"oldUp\": 1\n        },\n        \"navigationCalls\": 1,\n        \"reentry\": {\n          \"clickHandlers\": 1,\n          \"startClicks\": 1,\n          \"startNavigations\": 1,\n          \"oldHandlersInFreshLobby\": 0\n        },\n        \"calls\": [\n          \"dialogStop\",\n          \"save\",\n          [\n            \"navigate\",\n            \"/?lobby=1&demo=1\"\n          ]\n        ],\n        \"keyReleased\": true\n      },\n      \"failed\": {\n        \"beforeSave\": {\n          \"saveCalls\": 1,\n          \"navigations\": 0,\n          \"oldDown\": 1,\n          \"oldUp\": 1\n        },\n        \"navigationCalls\": 1,\n        \"reentry\": {\n          \"clickHandlers\": 1,\n          \"startClicks\": 1,\n          \"startNavigations\": 1,\n          \"oldHandlersInFreshLobby\": 0\n        },\n        \"calls\": [\n          \"dialogStop\",\n          \"save\",\n          \"saveError\",\n          [\n            \"navigate\",\n            \"/?lobby=1&demo=1\"\n          ]\n        ],\n        \"keyReleased\": true\n      },\n      \"noDB\": {\n        \"beforeSave\": {\n          \"saveCalls\": 0,\n          \"navigations\": 1,\n          \"oldDown\": 1,\n          \"oldUp\": 1\n        },\n        \"navigationCalls\": 1,\n        \"reentry\": {\n          \"clickHandlers\": 1,\n          \"startClicks\": 1,\n          \"startNavigations\": 1,\n          \"oldHandlersInFreshLobby\": 0\n        },\n        \"calls\": [\n          \"dialogStop\",\n          [\n            \"navigate\",\n            \"/?lobby=1&demo=1\"\n          ]\n        ],\n        \"keyReleased\": true\n      },\n      \"candidateCTA\": \"let _lobbyReturnPending=false;\\nasync function goToLobby(){\\n  if(_lobbyReturnPending)return;\\n  _lobbyReturnPending=true;\\n  if(typeof _deathDlgStop==='function')_deathDlgStop();\\n  try{\\n    // 사망 상태면 HP 복구 후 저장 (죽은 채로 저장 방지)\\n    if(P&&P.hp<=0){P.hp=P.mhp;P.st=P.mst;P.mp=P.mmp;P.shield=P.mshield;P.s='idle'}\\n    if(_dbReady)await dbSave();\\n  }catch(e){console.error('[goToLobby] save error:',e)}\\n  window.location.href=_DEMO_MODE?'/?lobby=1&demo=1':'/?lobby=1';\\n}\"\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"inputSha\": \"8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129\",\n      \"hashes\": {\n        \"cta\": \"f74baf5d0881ea238015abea884856055a495a1df61741bb19e390e490d70667\",\n        \"keydown\": \"7911d0276fdd9e409c8427b76e6b09fa8ac04501ab9e6b16542413be11f934a5\",\n        \"keyup\": \"abd27fb0685fbcd68ea917a611c7c252d01c00f284b6c0dec7d7c320bb13f32c\",\n        \"lobbyEnter\": \"100bf5f2e5f144ff177a3335ef14fefe6384faa4ecbed496140a06d8a8558023\",\n        \"startCaller\": \"95f6006067cbf2903a3ddbff87f2771ebec67b4b89b7d2a8d741955d11823e2d\",\n        \"lobby\": \"1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7\"\n      },\n      \"html\": \"<button id=\\\"demoEndLobby\\\" onclick=\\\"goToLobby()\\\" style=\\\"padding:10px 32px;background:rgba(255,150,0,.15);border:2px solid #ff8800;color:#ffcc44;font-family:'Noto Sans KR';font-weight:700;font-size:1rem;cursor:pointer;letter-spacing:.15em;transition:opacity .3s\\\">\",\n      \"original\": {\n        \"beforeSave\": {\n          \"saveCalls\": 2,\n          \"navigations\": 0,\n          \"oldDown\": 1,\n          \"oldUp\": 1\n        },\n        \"navigationCalls\": 2,\n        \"reentry\": {\n          \"executed\": false,\n          \"route\": \"indexdemo.html\",\n          \"reason\": \"legacy easy-test return differs from current index lobby; no cross-route start claim\"\n        },\n        \"calls\": [\n          \"dialogStop\",\n          \"save\",\n          \"dialogStop\",\n          \"save\",\n          [\n            \"navigate\",\n            \"indexdemo.html\"\n          ],\n          [\n            \"navigate\",\n            \"indexdemo.html\"\n          ]\n        ],\n        \"keyReleased\": true\n      },\n      \"fixed\": {\n        \"beforeSave\": {\n          \"saveCalls\": 1,\n          \"navigations\": 0,\n          \"oldDown\": 1,\n          \"oldUp\": 1\n        },\n        \"navigationCalls\": 1,\n        \"reentry\": {\n          \"executed\": false,\n          \"route\": \"indexdemo.html\",\n          \"reason\": \"legacy easy-test return differs from current index lobby; no cross-route start claim\"\n        },\n        \"calls\": [\n          \"dialogStop\",\n          \"save\",\n          [\n            \"navigate\",\n            \"indexdemo.html\"\n          ]\n        ],\n        \"keyReleased\": true\n      },\n      \"normal\": {\n        \"beforeSave\": {\n          \"saveCalls\": 1,\n          \"navigations\": 0,\n          \"oldDown\": 1,\n          \"oldUp\": 1\n        },\n        \"navigationCalls\": 1,\n        \"reentry\": {\n          \"executed\": false,\n          \"route\": \"indexdemo.html\",\n          \"reason\": \"legacy easy-test return differs from current index lobby; no cross-route start claim\"\n        },\n        \"calls\": [\n          \"dialogStop\",\n          \"save\",\n          [\n            \"navigate\",\n            \"indexdemo.html\"\n          ]\n        ],\n        \"keyReleased\": true\n      },\n      \"failed\": {\n        \"beforeSave\": {\n          \"saveCalls\": 1,\n          \"navigations\": 0,\n          \"oldDown\": 1,\n          \"oldUp\": 1\n        },\n        \"navigationCalls\": 1,\n        \"reentry\": {\n          \"executed\": false,\n          \"route\": \"indexdemo.html\",\n          \"reason\": \"legacy easy-test return differs from current index lobby; no cross-route start claim\"\n        },\n        \"calls\": [\n          \"dialogStop\",\n          \"save\",\n          \"saveError\",\n          [\n            \"navigate\",\n            \"indexdemo.html\"\n          ]\n        ],\n        \"keyReleased\": true\n      },\n      \"noDB\": {\n        \"beforeSave\": {\n          \"saveCalls\": 0,\n          \"navigations\": 1,\n          \"oldDown\": 1,\n          \"oldUp\": 1\n        },\n        \"navigationCalls\": 1,\n        \"reentry\": {\n          \"executed\": false,\n          \"route\": \"indexdemo.html\",\n          \"reason\": \"legacy easy-test return differs from current index lobby; no cross-route start claim\"\n        },\n        \"calls\": [\n          \"dialogStop\",\n          [\n            \"navigate\",\n            \"indexdemo.html\"\n          ]\n        ],\n        \"keyReleased\": true\n      },\n      \"candidateCTA\": \"let _lobbyReturnPending=false;\\nasync function goToLobby(){\\n  if(_lobbyReturnPending)return;\\n  _lobbyReturnPending=true;\\n  if(typeof _deathDlgStop==='function')_deathDlgStop();\\n  try{\\n    // 사망 상태면 HP 복구 후 저장 (죽은 채로 저장 방지)\\n    if(P&&P.hp<=0){P.hp=P.mhp;P.st=P.mst;P.mp=P.mmp;P.shield=P.mshield;P.s='idle'}\\n    if(_dbReady)await dbSave();\\n  }catch(e){console.error('[goToLobby] save error:',e)}\\n  window.location.href=_DEMO_MODE?'indexdemo.html':'/?lobby=1';\\n}\"\n    }\n  ],\n  \"filesWritten\": 0,\n  \"productionApplied\": false,\n  \"nativeAccepted\": false,\n  \"boundary\": \"Whole actual main/easy global keydown/keyup registrations plus full goToLobby CTA invoked from extracted inline HTML; main route full actual index lobby enter registration and showCharGate start caller evaluated in a fresh modeled document realm. Easy-test currently returns indexdemo.html, so its reentry caller was deliberately not executed or treated as current index. Browser Enter default click/navigation replacement modeled; actual native new document and held Enter not proved. Save Promise, slot activation/loading/timer/Image stubbed, actual save/game/UI0. No prior charGate delay/slot initialization tests rerun; start caller used only for fresh realm count. Original duplicates pending CTA save/navigation, not surviving old handlers calling new start twice. Candidate guards one pending return until unload.\"\n}\n"
  },
  "space": {
    "chunk_id": "2c9491",
    "wall_time_seconds": 0.000007167,
    "exit_code": 0,
    "original_token_count": 950,
    "output": "{\n  \"completionId\": \"MARKETING-demo-cta-space-activation-20261002\",\n  \"at\": \"2026-10-02T13:56:48.197Z\",\n  \"status\": \"SOURCE_FOCUSED_DEMO_CTA_SPACE_CANDIDATE_PASS\",\n  \"out\": [\n    {\n      \"file\": \"game.html\",\n      \"inputSha\": \"ce171131cb740e85a46e04ba7cb5bc6c29a300cb2c85aa8165eca194920f4613\",\n      \"keydownSha\": \"7911d0276fdd9e409c8427b76e6b09fa8ac04501ab9e6b16542413be11f934a5\",\n      \"keyupSha\": \"abd27fb0685fbcd68ea917a611c7c252d01c00f284b6c0dec7d7c320bb13f32c\",\n      \"ctaSha\": \"0ad806fa64f401c091cbb22b8188c46b8a31a55c05649d659f0303709c1d9dc8\",\n      \"original\": {\n        \"keydownPrevented\": true,\n        \"prevented\": true,\n        \"calls\": [],\n        \"navigations\": 0,\n        \"K\": {\n          \"Space\": false\n        },\n        \"KH\": {\n          \"Space\": false\n        }\n      },\n      \"fixed\": {\n        \"keydownPrevented\": false,\n        \"prevented\": false,\n        \"calls\": [\n          \"dialogStop\",\n          [\n            \"navigate\",\n            \"/?lobby=1&demo=1\"\n          ]\n        ],\n        \"navigations\": 1,\n        \"K\": {\n          \"Space\": false\n        },\n        \"KH\": {\n          \"Space\": false\n        }\n      },\n      \"enterControls\": {\n        \"calls\": [\n          \"dialogStop\",\n          [\n            \"navigate\",\n            \"/?lobby=1&demo=1\"\n          ]\n        ],\n        \"navigations\": 1\n      },\n      \"controls\": [\n        \"hidden demo unchanged\",\n        \"non-demo button unchanged\",\n        \"actual keyup Space K/KH false\"\n      ],\n      \"anchor\": \"  // Focused panel controls own activation and focus traversal keys.\",\n      \"patch\": \"  if(['Space','Enter','NumpadEnter','Tab'].includes(e.code)&&e.target instanceof Element&&$('demoEnd')?.style.display==='flex'&&e.target.closest('#demoEnd button'))return;\\n\"\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"inputSha\": \"8c7d82087aefb2efe8a20b9ca293ff8c55fed899222f8c0a20392b06508e0129\",\n      \"keydownSha\": \"7911d0276fdd9e409c8427b76e6b09fa8ac04501ab9e6b16542413be11f934a5\",\n      \"keyupSha\": \"abd27fb0685fbcd68ea917a611c7c252d01c00f284b6c0dec7d7c320bb13f32c\",\n      \"ctaSha\": \"f74baf5d0881ea238015abea884856055a495a1df61741bb19e390e490d70667\",\n      \"original\": {\n        \"keydownPrevented\": true,\n        \"prevented\": true,\n        \"calls\": [],\n        \"navigations\": 0,\n        \"K\": {\n          \"Space\": false\n        },\n        \"KH\": {\n          \"Space\": false\n        }\n      },\n      \"fixed\": {\n        \"keydownPrevented\": false,\n        \"prevented\": false,\n        \"calls\": [\n          \"dialogStop\",\n          [\n            \"navigate\",\n            \"indexdemo.html\"\n          ]\n        ],\n        \"navigations\": 1,\n        \"K\": {\n          \"Space\": false\n        },\n        \"KH\": {\n          \"Space\": false\n        }\n      },\n      \"enterControls\": {\n        \"calls\": [\n          \"dialogStop\",\n          [\n            \"navigate\",\n            \"indexdemo.html\"\n          ]\n        ],\n        \"navigations\": 1\n      },\n      \"controls\": [\n        \"hidden demo unchanged\",\n        \"non-demo button unchanged\",\n        \"actual keyup Space K/KH false\"\n      ],\n      \"anchor\": \"  // Focused panel controls own activation and focus traversal keys.\",\n      \"patch\": \"  if(['Space','Enter','NumpadEnter','Tab'].includes(e.code)&&e.target instanceof Element&&$('demoEnd')?.style.display==='flex'&&e.target.closest('#demoEnd button'))return;\\n\"\n    }\n  ],\n  \"filesWritten\": 0,\n  \"productionApplied\": false,\n  \"nativeAccepted\": false,\n  \"boundary\": \"Whole actual global keydown/keyup plus full goToLobby and extracted inline CTA. Visible focused demo CTA fixture; browser Space default modeled. Does not claim initial Tab focus entry or native keyboard acceptance; covers only focused button activation. No storage/save/UI/audio. This is new demoEnd focus ownership contact, not death-retry/key rerun.\"\n}\n"
  },
  "initialRouteAssertionError": {
    "chunk_id": "07241c",
    "wall_time_seconds": 0.000006333,
    "exit_code": 1,
    "original_token_count": 162,
    "output": "node:internal/modules/run_main:107\n    triggerUncaughtException(\n    ^\n\nAssertionError [ERR_ASSERTION]: Expected values to be strictly equal:\n+ actual - expected\n\n+ 'indexdemo.html'\n- '/?lobby=1&demo=1'\n\n    at run (file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:30:10)\n    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)\n    at async file:///Users/fordeargamers/Projects/exoduser-migration-20261001/[eval1]:46:17 {\n  generatedMessage: true,\n  code: 'ERR_ASSERTION',\n  actual: 'indexdemo.html',\n  expected: '/?lobby=1&demo=1',\n  operator: 'strictEqual',\n  diff: 'simple'\n}\n\nNode.js v24.15.0\n"
  }
}
```

```sh
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node --input-type=module <<'JS'
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import crypto from 'node:crypto';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex'),out=[],lobbySrc=fs.readFileSync('index.html','utf8');
const lStart=lobbySrc.indexOf("if($('enterGameBtn')){\n"),lEnd=lobbySrc.indexOf('\n}',lStart)+2,lobbyEnter=lobbySrc.slice(lStart,lEnd);assert(lStart>=0);
const ga=lobbySrc.indexOf('function showCharGate('),gb=lobbySrc.indexOf('\n}',ga)+2,gate=lobbySrc.slice(ga,gb);assert(ga>=0);
for(const file of ['game.html','game-easy-test.html']){
 const src=fs.readFileSync(file,'utf8');
 const a=src.indexOf('async function goToLobby(){'),b=src.indexOf('\n}',a)+2,cta=src.slice(a,b);
 const html=src.match(/<button id="demoEndLobby"[^>]*>/)[0],inline=html.match(/onclick="([^"]+)"/)[1];assert.equal(inline,'goToLobby()');
 function event(type){const marker=type==='keydown'?"addEventListener('keydown',e=>{\n  // 컷씬 진행":"addEventListener('keyup',e=>{\n  K[e.code]=false;";const a=src.indexOf(marker),b=src.indexOf('\n});',a)+4;assert(a>=0);return src.slice(a,b);}
 const down=event('keydown'),up=event('keyup');
 const candidate="let _lobbyReturnPending=false;\n"+cta.replace('async function goToLobby(){','async function goToLobby(){\n  if(_lobbyReturnPending)return;\n  _lobbyReturnPending=true;');
 async function run(code,{repeat=false,reject=false,db=true}={}){
  const registries=new Map(),calls=[],pending=[],promises=[],nodes={};let href='';
  class El{constructor(id){this.id=id;this.style={};this.disabled=false;this.classList={contains:()=>false,add(){},remove(){}};}closest(){return null}}
  const $=id=>nodes[id]||(nodes[id]=new El(id));
  const location={};Object.defineProperty(location,'href',{set:url=>{href=url;calls.push(['navigate',url])},get:()=>href});
  const window={location},s={$,Element:El,window,document:{activeElement:$('demoEndLobby'),querySelector:()=>null},
   addEventListener:(t,f)=>{if(!registries.has(t))registries.set(t,new Set());registries.get(t).add(f)},listeningBind:null,K:{},KH:{},BINDS:{},BINDS2:{},SKILL_SLOTS:[],_harpActive:false,_dashActive:false,_cutSkipHolding:false,
   P:{s:'idle',hp:100,mhp:100,st:50,mst:50,mp:60,mmp:60,shield:40,mshield:40,skills:{}},G:{on:false,paused:false},_DEMO_MODE:true,_dbReady:db,
   _deathDlgStop:()=>calls.push('dialogStop'),dbSave:()=>{calls.push('save');return new Promise((res,rej)=>pending.push({res,rej}))},console:{error:(...x)=>calls.push('saveError')}};
  vm.runInContext(down+'\n'+up+'\n'+code+'\n$("demoEndLobby").onclick=()=>'+inline,vm.createContext(s));
  function fire(t,code,repeat){let prevented=false;for(const fn of registries.get(t)||[])fn({code,repeat,target:$('demoEndLobby'),ctrlKey:false,metaKey:false,preventDefault(){prevented=true},stopPropagation(){}});return prevented}
  // Model browser Enter key default click, explicitly separated from actual global key handlers.
  function enter(repeat){const prevented=fire('keydown','Enter',repeat);if(!prevented)promises.push($('demoEndLobby').onclick());fire('keyup','Enter',repeat)}
  enter(false);if(repeat)enter(true);
  const beforeSave={saveCalls:calls.filter(x=>x==='save').length,navigations:calls.filter(x=>Array.isArray(x)&&x[0]==='navigate').length,oldDown:registries.get('keydown').size,oldUp:registries.get('keyup').size};
  for(const p of pending)reject?p.rej(new Error('fixture save failure')):p.res();
  await Promise.all(promises);
  const navigationCalls=calls.filter(x=>Array.isArray(x)&&x[0]==='navigate').length;
  const routeExpr=cta.match(/window\.location\.href=([^;]+);/)[1];const expectedRoute=vm.runInNewContext(routeExpr,{_DEMO_MODE:true});assert.equal(href,expectedRoute);
  // A document navigation creates a new global/document EventTarget; this is modeled, not native browser evidence.
  if(expectedRoute==='indexdemo.html')return {beforeSave,navigationCalls,reentry:{executed:false,route:expectedRoute,reason:'legacy easy-test return differs from current index lobby; no cross-route start claim'},calls,keyReleased:s.K.Enter===false&&s.KH.Enter===false};
  const lobbyNodes={},lobbyCalls=[],lobbyTimers=[],lobbyRegistry=new Map();
  const $$=id=>lobbyNodes[id]||(lobbyNodes[id]={addEventListener(t,f){if(!lobbyRegistry.has(t))lobbyRegistry.set(t,new Set());lobbyRegistry.get(t).add(f)},disabled:false,click(){for(const f of lobbyRegistry.get('click')||[])f()}});
  const lLocation={};Object.defineProperty(lLocation,'href',{set:url=>lobbyCalls.push(['startNavigation',url])});
  const ls={$:$$,window:{location:lLocation},_selectedSlot:'fixture-slot',_characterLoadSeq:1,_testMode:true,_selectedSlotName:null,_LOBBY_BUILD:'demo',
   playEnterSFX:()=>lobbyCalls.push('startClick'),_startHover(){},_stopHover(){},showLoading:()=>lobbyCalls.push('loading'),_TL:x=>x,Image:class{},_demoActivateSlot:()=>true,hideLoading(){},setStatus(){},
   setTimeout:(fn,ms)=>{lobbyTimers.push({fn,ms});return lobbyTimers.length}};
  vm.runInContext(gate+'\n'+lobbyEnter,vm.createContext(ls));
  // One default click in fresh lobby, not two documents artificially merged into one registry.
  $$('enterGameBtn').click();for(const t of lobbyTimers)t.fn();
  const reentry={clickHandlers:lobbyRegistry.get('click').size,startClicks:lobbyCalls.filter(x=>x==='startClick').length,startNavigations:lobbyCalls.filter(x=>Array.isArray(x)&&x[0]==='startNavigation').length,oldHandlersInFreshLobby:0};
  assert.equal(reentry.startClicks,1);assert.equal(reentry.startNavigations,1);
  assert.equal(s.K.Enter,false);assert.equal(s.KH.Enter,false);
  return {beforeSave,navigationCalls,reentry,calls,keyReleased:true};
 }
 const original=await run(cta,{repeat:true}),fixed=await run(candidate,{repeat:true});
 assert.equal(original.beforeSave.saveCalls,2);assert.equal(original.navigationCalls,2);
 assert.equal(fixed.beforeSave.saveCalls,1);assert.equal(fixed.navigationCalls,1);
 const normal=await run(cta),normalFixed=await run(candidate);assert.deepEqual(normalFixed,normal);
 const failed=await run(candidate,{repeat:true,reject:true});assert.equal(failed.navigationCalls,1);
 const noDB=await run(candidate,{repeat:true,db:false});assert.equal(noDB.navigationCalls,1);assert.equal(noDB.beforeSave.saveCalls,0);
 assert.equal(sha(fs.readFileSync(file,'utf8')),sha(src));assert.equal(sha(fs.readFileSync('index.html','utf8')),sha(lobbySrc));
 out.push({file,inputSha:sha(src),hashes:{cta:sha(cta),keydown:sha(down),keyup:sha(up),lobbyEnter:sha(lobbyEnter),startCaller:sha(gate),lobby:sha(lobbySrc)},html,original,fixed,normal,failed,noDB,candidateCTA:candidate});
}
console.log(JSON.stringify({completionId:'MARKETING-demo-return-transition-owner-20261002',at:new Date().toISOString(),status:'SOURCE_CTA_SINGLEFLIGHT_CANDIDATE_PASS_NO_CROSS_DOCUMENT_LISTENER_DUPLICATION',out,filesWritten:0,productionApplied:false,nativeAccepted:false,boundary:'Whole actual main/easy global keydown/keyup registrations plus full goToLobby CTA invoked from extracted inline HTML; main route full actual index lobby enter registration and showCharGate start caller evaluated in a fresh modeled document realm. Easy-test currently returns indexdemo.html, so its reentry caller was deliberately not executed or treated as current index. Browser Enter default click/navigation replacement modeled; actual native new document and held Enter not proved. Save Promise, slot activation/loading/timer/Image stubbed, actual save/game/UI0. No prior charGate delay/slot initialization tests rerun; start caller used only for fresh realm count. Original duplicates pending CTA save/navigation, not surviving old handlers calling new start twice. Candidate guards one pending return until unload.'},null,2));
JS
```

```sh
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node --input-type=module <<'JS'
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import crypto from 'node:crypto';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex'),out=[];
const patch="  if(['Space','Enter','NumpadEnter','Tab'].includes(e.code)&&e.target instanceof Element&&$('demoEnd')?.style.display==='flex'&&e.target.closest('#demoEnd button'))return;\n";
for(const file of ['game.html','game-easy-test.html']){
 const src=fs.readFileSync(file,'utf8');
 function event(type){const mark=type==='keydown'?"addEventListener('keydown',e=>{\n  // 컷씬 진행":"addEventListener('keyup',e=>{\n  K[e.code]=false;";const a=src.indexOf(mark),b=src.indexOf('\n});',a)+4;assert(a>=0);return src.slice(a,b);}
 const down=event('keydown'),up=event('keyup'),anchor='  // Focused panel controls own activation and focus traversal keys.';assert(down.includes(anchor));const candidate=down.replace(anchor,patch+anchor);
 const a=src.indexOf('async function goToLobby(){'),b=src.indexOf('\n}',a)+2,cta=src.slice(a,b),inline=src.match(/<button id="demoEndLobby"[^>]*onclick="([^"]+)"/)[1];
 async function run(kd,{code='Space',visible=true,owned=true}={}){
  const handlers={},nodes={},calls=[];class El{constructor(id){this.id=id;this.style={};this.classList={contains:()=>false};}closest(sel){return sel==='#demoEnd button'&&owned?this:null}}
  const $=id=>nodes[id]||(nodes[id]=new El(id));$('demoEnd').style.display=visible?'flex':'none';
  const s={$ ,Element:El,addEventListener:(t,f)=>handlers[t]=f,window:{location:{}},document:{querySelector:()=>null},listeningBind:null,K:{},KH:{},BINDS:{},BINDS2:{},SKILL_SLOTS:[],_harpActive:false,_dashActive:false,_cutSkipHolding:false,
   P:{s:'idle',hp:100,mhp:100,st:50,mst:50,mp:60,mmp:60,shield:40,mshield:40,skills:{}},G:{on:false,paused:false},_DEMO_MODE:true,_dbReady:false,_deathDlgStop:()=>calls.push('dialogStop')};
  Object.defineProperty(s.window.location,'href',{set:url=>calls.push(['navigate',url])});
  vm.runInContext(kd+'\n'+up+'\n'+cta+'\n$("demoEndLobby").onclick=()=>'+inline,vm.createContext(s));
  let prevented=false;const e={code,target:$('demoEndLobby'),repeat:false,ctrlKey:false,metaKey:false,preventDefault:()=>prevented=true,stopPropagation(){}};
  handlers.keydown(e);const keydownPrevented=prevented;handlers.keyup(e);
  if(!prevented&&visible&&owned)await $('demoEndLobby').onclick(); // explicit native default activation fixture
  return {keydownPrevented,prevented,calls,navigations:calls.filter(x=>Array.isArray(x)).length,K:s.K,KH:s.KH};
 }
 const original=await run(down),fixed=await run(candidate);assert.equal(original.navigations,0);assert.equal(fixed.navigations,1);
 const enter=await run(down,{code:'Enter'}),enterFixed=await run(candidate,{code:'Enter'});assert.deepEqual(enterFixed.calls,enter.calls);assert.equal(enterFixed.navigations,1);
 for(const opts of [{visible:false},{owned:false}])assert.deepEqual(await run(candidate,opts),await run(down,opts));
 assert.equal(fixed.K.Space,false);assert.equal(fixed.KH.Space,false);assert.equal(sha(fs.readFileSync(file,'utf8')),sha(src));
 out.push({file,inputSha:sha(src),keydownSha:sha(down),keyupSha:sha(up),ctaSha:sha(cta),original,fixed,enterControls:{calls:enterFixed.calls,navigations:enterFixed.navigations},controls:['hidden demo unchanged','non-demo button unchanged','actual keyup Space K/KH false'],anchor,patch});
}
console.log(JSON.stringify({completionId:'MARKETING-demo-cta-space-activation-20261002',at:new Date().toISOString(),status:'SOURCE_FOCUSED_DEMO_CTA_SPACE_CANDIDATE_PASS',out,filesWritten:0,productionApplied:false,nativeAccepted:false,boundary:'Whole actual global keydown/keyup plus full goToLobby and extracted inline CTA. Visible focused demo CTA fixture; browser Space default modeled. Does not claim initial Tab focus entry or native keyboard acceptance; covers only focused button activation. No storage/save/UI/audio. This is new demoEnd focus ownership contact, not death-retry/key rerun.'},null,2));
JS
```

## Full docs search

Command: rg -l 'goToLobby|demoEndLobby|로비 복귀|저장.*실패|_lobbyReturnPending' docs/

```
docs/3.2메타·진행시스템/3.2메타·진행시스템.md
docs/15 세이브+데이터구조/15 세이브+데이터구조.md
docs/15 세이브+데이터구조/SAVE_BODY_ERROR_RESPONSE_20261002.md
docs/3.3 키바인딩+설정/게임패드_트러블슈팅.md
docs/15 세이브+데이터구조/BALANCE_DISK_SAVE_RESTART_20261002.md
docs/7아이템디자인/exoduser-item-system-full.md
docs/3.3 키바인딩+설정/게임패드_호버_상호작용.md
docs/0마스터플랜/EA/HELL_EA_BUILD_CHECKLIST.md
docs/7아이템디자인/ON_CRIT_RECURSION_OBSERVATION_20260910.md
docs/7아이템디자인/유니크_어픽스_리스트.md
docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md
docs/7아이템디자인/ITEM_TEAM_MASTER.md
docs/13출시·마케팅/MAC_ENVIRONMENT_HANDOFF_20261001.md
docs/13출시·마케팅/PUBLISHER_BUILD_1005_20260929.md
docs/4.1맵디자인+설정/tilemap-editor.html
docs/13출시·마케팅/PUBLISHER_DELIVERY_RESUME_20260929.md
docs/CHANGELOG_SYNC.md
docs/4.1맵디자인+설정/CH1_OUTER_CONNECTION_PASS85_20260929.md
docs/13출시·마케팅/GUARD_BASELINE_PERSISTENCE_20260929.md
docs/CHANGELOG_DAILY_20260520.md
docs/13출시·마케팅/INTEGRATION_BUILD_TEAM_MASTER.md
docs/13출시·마케팅/WEB_RENDERER_REDEPLOY_20260910.md
docs/13출시·마케팅/13출시·마케팅.md
docs/13출시·마케팅/PUBLISHER_LATEST_BUILD_DELIVERY_20260929.md
docs/13출시·마케팅/AUTO_CLEANUP_50_20260916.md
docs/API연결_가이드.md
docs/13출시·마케팅/PC_PACKAGING_20260910.md
docs/13출시·마케팅/LATEST_WEB_RELEASE_20260910.md
docs/cinematic/EXODUSER_TITLE_MOTION_20260908.md
docs/13출시·마케팅/PUBLISHER_REDELIVERY_20260930.md
docs/14밸런스+수치테이블/BALANCE_ECONOMY_TEAM_MASTER.md
docs/2_4 펫시스템/대사_스크립트.md
docs/12퍼포먼스·최적화/PANEL_HIDDEN_DOM_LAG_20260929.md
docs/12퍼포먼스·최적화/FIRST_KILL_CPU_INVESTIGATION_20261001.md
docs/0마스터플랜/mac-resume-20261001/ITEM-폴백마스킹-검수.md
docs/cinematic/WARINTRO_CREATION_RUNTIME_20260910.md
docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md
docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md
docs/0마스터플랜/mac-resume-20261001/Mac-긴간격-루프밖-귀속.md
docs/0마스터플랜/MAC_AGENT_DASHBOARD.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_LOG.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_STATE.json
docs/0마스터플랜/mac-resume-20261001/ui03-evidence/team-receipts.json
docs/2게임디자인레벨디자인/TUTORIAL_BADGES_20260912.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/CONTINUOUS-INTEGRATION-20261002.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/ITEM-d10-result.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/BINDING-root-review.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/UIUX-demo-scope-result.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/D10-root-review.md
docs/3.1 ui hud 디자인/UI_UX_IMPROVEMENT_PROJECT_20260930.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/FILTER-INTEGRATION-20261002.md
docs/0마스터플랜/mac-resume-20261001/QA-ENEMY-ANIMVFX-인수검토.md
docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/FOLLOWUP_RECEIPT.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/CONTINUOUS-DISPATCH-20261002.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/persistence-review-result.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/UIUX-demo-scope-root-review.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/SERVER-INTEGRATION-20261002.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/UIUX-d10-result.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/BUILD-next-result.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/PROVIDER-HALVES-20261002.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/BUILD-result.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/ITEM-unique-save-result.md
docs/4.1맵디자인+설정/tilemap-editor.html.bak2
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/BALANCE-d10-result.md
docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md
docs/4.1맵디자인+설정/CH1_HILL_EDGE_BLEND_PASS44.md
docs/4.1맵디자인+설정/맵디테일.md
docs/4.1맵디자인+설정/tilemap-editor.html.broken
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/MILESTONE-CH1-1-PLAYABLE-20261002.md
docs/3.1 ui hud 디자인/lobby_full_patch.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/INDEPENDENT-NEXT-20261002.md
docs/4.1맵디자인+설정/CH1_1_DEPTH_RETOUCH_20260917.md
docs/4.1맵디자인+설정/tilemap-editor.html.bak

```
