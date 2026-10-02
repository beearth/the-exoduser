# MARKETING whole ending loop reachability correction

Completion: MARKETING-demo-ending-held-release-whole-loop-1434
Preservation instruction: SUPERVISOR-MARKETING-1453
New owned artifacts2, no verification rerun. Defensive candidate only; native/root intent Gate pending.

## Correction

The earlier phrase "launch after ending" is withdrawn. Whole actual loop/update/pollGamepad execute after actual nextStage ending. Two frames reach update's !G.on early return and skip G.on drawing: resources remain ST100/gauge200. Actual registered global keyup is outside this loop. A modeled window event then reaches that callback and changes ST98/gauge102/harpActive=true synchronously. No physical keyup, real movement, gameplay progression, rendering or audible effect was verified. Classification: SOURCE REACHABLE FIXTURE; actual gameplay/input HOLD.

Minimal defensive patch: after demoEnd style.display='flex', call existing _clearHeldInput(). No helper/combat formula/constant changes. This prevents stale held release in the fixture. It is a defensive cancellation proposal, not an accepted combat-policy change. Protected2_3 docs untouched. Normal CTA after the same two whole frames: one modeled save/navigation, both route literals retained.

## Root synchronization contracts

| id | Korean name | exact source/fixture contract | location/status |
|---|---|---|---|
| demoEnd owner | 완료 화면 진입 | actual nextStage demo branch → display flex/G.on=false | main stage0/easy stage3 current source |
| loop/update | 종료 후 게임 진행 차단 | update !G.on return; drawing inside if(G.on); two fixture frame calls no progression/draw | whole loop/update extraction |
| registered keyup | 프레임 밖 동기 입력 변경 | modeled event after two frames still reaches handler; ST100→98, gauge200→102, harpActive true; unchanged actual constants | fixture observation, native0 |
| defensive cleanup | 완료 진입 홀드 취소 후보 | existing _clearHeldInput called only at demoEnd display; K/KH/MB/MBjust and existing held/aim flags reset | candidate intent pending |
| normal CTA | 정상 복귀 대조 | same full frames then CTA save1/navigation1 | main /?lobby=1&demo=1, easy indexdemo.html |
| final save scope | 복귀·페이지 이탈 저장 | normal CTA save then navigation; existing beforeunload final save:2 call attempts, CTA1/nav1; no persistence/ACK guarantee | existing contract NOFIX |

Root should update matching marketing/keybind/performance/save docs only after accepted integration, with these corrected claims; do not replace source fixture with native PASS. docs whole search recorded below. No production/shared docs/Git/user save/UI/window/audio/new session changes.

## Exact completed 1434 run and original command

```json
{
  "chunk_id": "05ad1a",
  "wall_time_seconds": 0.000006084,
  "exit_code": 0,
  "original_token_count": 2714,
  "output": "{\n  \"completionId\": \"MARKETING-demo-ending-held-release-whole-loop-1434\",\n  \"at\": \"2026-10-02T14:37:53.640Z\",\n  \"status\": \"SOURCE_LOOP_STOPS_GAMEPLAY_KEYUP_MUTATION_REACHABLE_FIXTURE\",\n  \"out\": [\n    {\n      \"file\": \"game.html\",\n      \"inputSha\": \"e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea\",\n      \"lengths\": {\n        \"loop\": 7507,\n        \"update\": 334285,\n        \"poll\": 11643\n      },\n      \"hashes\": {\n        \"loop\": \"0d2a0c02d3235ef73738573079165ff0c344f131c374640623d1bb430e964151\",\n        \"update\": \"c37aa75077f5670d8f4af076f2570f75471d7f0bf5c32b6c1b43185749045a1c\",\n        \"poll\": \"00f9448ed6b4eff3b8c887070dbc95d828365830635651331ebdce1fcc906b7d\",\n        \"nextStage\": \"9e53b012d584d296e004dbb15fe3f52bf9cab0b37ac825d6a426dc65562c9321\",\n        \"clearHeld\": \"e5349553045eeecb2cea724cf9a065eeb9dba0eb022ccc13fb89f74a1af44ca5\",\n        \"keyup\": \"abd27fb0685fbcd68ea917a611c7c252d01c00f284b6c0dec7d7c320bb13f32c\",\n        \"constants\": \"2e00a5b751905a659f915d300dc50c710294b10bf1061ba97d8329798d33cbba\"\n      },\n      \"anchor\": \"_de.style.display='flex';\",\n      \"replacement\": \"_de.style.display='flex';_clearHeldInput();\",\n      \"original\": {\n        \"beforeUp\": {\n          \"updateEntryTicks\": 2,\n          \"rafs\": 1,\n          \"gameOn\": false,\n          \"overlay\": \"flex\",\n          \"hold\": true,\n          \"K\": true,\n          \"KH\": true,\n          \"st\": 100,\n          \"gauge\": 200\n        },\n        \"after\": {\n          \"gameOn\": false,\n          \"hold\": false,\n          \"harpActive\": true,\n          \"st\": 98,\n          \"gauge\": 102,\n          \"K\": false,\n          \"KH\": false\n        },\n        \"calls\": [\n          \"beamStop\",\n          \"cacheExit\",\n          \"sfxReset\",\n          \"fpsUpdate\",\n          \"benchTick\",\n          \"systemTick\",\n          \"perfTick\",\n          \"texDrain\",\n          \"sfxReset\",\n          \"fpsUpdate\",\n          \"benchTick\",\n          \"systemTick\",\n          \"perfTick\",\n          \"texDrain\",\n          [\n            \"sample\",\n            \"chain_throw\",\n            0.7,\n            1\n          ],\n          [\n            \"sample\",\n            \"chain_fly\",\n            0.5,\n            1\n          ],\n          \"slash\",\n          [\n            \"sample\",\n            \"chain_dash3\",\n            0.6,\n            1\n          ],\n          [\n            \"sample\",\n            \"male_grunt\",\n            1,\n            1\n          ],\n          [\n            \"text\",\n            1,\n            -23,\n            \"⛓️ 사슬!\",\n            \"#ffaa00\",\n            35\n          ],\n          \"prof\"\n        ]\n      },\n      \"fixed\": {\n        \"beforeUp\": {\n          \"updateEntryTicks\": 2,\n          \"rafs\": 1,\n          \"gameOn\": false,\n          \"overlay\": \"flex\",\n          \"hold\": false,\n          \"K\": false,\n          \"KH\": false,\n          \"st\": 100,\n          \"gauge\": 200\n        },\n        \"after\": {\n          \"gameOn\": false,\n          \"hold\": false,\n          \"harpActive\": false,\n          \"st\": 100,\n          \"gauge\": 200,\n          \"K\": false,\n          \"KH\": false\n        },\n        \"calls\": [\n          \"beamStop\",\n          \"cacheExit\",\n          \"sfxReset\",\n          \"fpsUpdate\",\n          \"benchTick\",\n          \"systemTick\",\n          \"perfTick\",\n          \"texDrain\",\n          \"sfxReset\",\n          \"fpsUpdate\",\n          \"benchTick\",\n          \"systemTick\",\n          \"perfTick\",\n          \"texDrain\"\n        ]\n      },\n      \"normal\": {\n        \"beforeUp\": {\n          \"updateEntryTicks\": 2,\n          \"rafs\": 1,\n          \"gameOn\": false,\n          \"overlay\": \"flex\",\n          \"hold\": false,\n          \"K\": false,\n          \"KH\": false,\n          \"st\": 100,\n          \"gauge\": 200\n        },\n        \"after\": {\n          \"gameOn\": false,\n          \"hold\": false,\n          \"harpActive\": false,\n          \"st\": 100,\n          \"gauge\": 200,\n          \"K\": false,\n          \"KH\": false\n        },\n        \"calls\": [\n          \"beamStop\",\n          \"cacheExit\",\n          \"sfxReset\",\n          \"fpsUpdate\",\n          \"benchTick\",\n          \"systemTick\",\n          \"perfTick\",\n          \"texDrain\",\n          \"sfxReset\",\n          \"fpsUpdate\",\n          \"benchTick\",\n          \"systemTick\",\n          \"perfTick\",\n          \"texDrain\",\n          \"dialogStop\",\n          \"save\",\n          [\n            \"navigation\",\n            \"/?lobby=1&demo=1\"\n          ]\n        ]\n      },\n      \"noHeld\": {\n        \"beforeUp\": {\n          \"updateEntryTicks\": 2,\n          \"rafs\": 1,\n          \"gameOn\": false,\n          \"overlay\": \"flex\",\n          \"hold\": false,\n          \"K\": false,\n          \"KH\": false,\n          \"st\": 100,\n          \"gauge\": 200\n        },\n        \"after\": {\n          \"gameOn\": false,\n          \"hold\": false,\n          \"harpActive\": false,\n          \"st\": 100,\n          \"gauge\": 200,\n          \"K\": false,\n          \"KH\": false\n        },\n        \"calls\": [\n          \"beamStop\",\n          \"cacheExit\",\n          \"sfxReset\",\n          \"fpsUpdate\",\n          \"benchTick\",\n          \"systemTick\",\n          \"perfTick\",\n          \"texDrain\",\n          \"sfxReset\",\n          \"fpsUpdate\",\n          \"benchTick\",\n          \"systemTick\",\n          \"perfTick\",\n          \"texDrain\"\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"inputSha\": \"68fa8e17d379fdf7e9da20b153d874e2ac74544d790397b4d36edbcc1207f390\",\n      \"lengths\": {\n        \"loop\": 7446,\n        \"update\": 333350,\n        \"poll\": 11643\n      },\n      \"hashes\": {\n        \"loop\": \"b0a6e30418623b6bb79596f77564d0fdcae9e4802bca329454936a33332e8be5\",\n        \"update\": \"5dddbe0861d1cf11c7676afebc1960b57c6b22ee166c063b2e4d8c730396d45c\",\n        \"poll\": \"00f9448ed6b4eff3b8c887070dbc95d828365830635651331ebdce1fcc906b7d\",\n        \"nextStage\": \"9e53b012d584d296e004dbb15fe3f52bf9cab0b37ac825d6a426dc65562c9321\",\n        \"clearHeld\": \"e5349553045eeecb2cea724cf9a065eeb9dba0eb022ccc13fb89f74a1af44ca5\",\n        \"keyup\": \"abd27fb0685fbcd68ea917a611c7c252d01c00f284b6c0dec7d7c320bb13f32c\",\n        \"constants\": \"2e00a5b751905a659f915d300dc50c710294b10bf1061ba97d8329798d33cbba\"\n      },\n      \"anchor\": \"_de.style.display='flex';\",\n      \"replacement\": \"_de.style.display='flex';_clearHeldInput();\",\n      \"original\": {\n        \"beforeUp\": {\n          \"updateEntryTicks\": 2,\n          \"rafs\": 1,\n          \"gameOn\": false,\n          \"overlay\": \"flex\",\n          \"hold\": true,\n          \"K\": true,\n          \"KH\": true,\n          \"st\": 100,\n          \"gauge\": 200\n        },\n        \"after\": {\n          \"gameOn\": false,\n          \"hold\": false,\n          \"harpActive\": true,\n          \"st\": 98,\n          \"gauge\": 102,\n          \"K\": false,\n          \"KH\": false\n        },\n        \"calls\": [\n          \"beamStop\",\n          \"cacheExit\",\n          \"sfxReset\",\n          \"fpsUpdate\",\n          \"benchTick\",\n          \"systemTick\",\n          \"perfTick\",\n          \"sfxReset\",\n          \"fpsUpdate\",\n          \"benchTick\",\n          \"systemTick\",\n          \"perfTick\",\n          [\n            \"sample\",\n            \"chain_throw\",\n            0.7,\n            1\n          ],\n          [\n            \"sample\",\n            \"chain_fly\",\n            0.5,\n            1\n          ],\n          \"slash\",\n          [\n            \"sample\",\n            \"chain_dash3\",\n            0.6,\n            1\n          ],\n          [\n            \"sample\",\n            \"male_grunt\",\n            1,\n            1\n          ],\n          [\n            \"text\",\n            1,\n            -23,\n            \"⛓️ 사슬!\",\n            \"#ffaa00\",\n            35\n          ],\n          \"prof\"\n        ]\n      },\n      \"fixed\": {\n        \"beforeUp\": {\n          \"updateEntryTicks\": 2,\n          \"rafs\": 1,\n          \"gameOn\": false,\n          \"overlay\": \"flex\",\n          \"hold\": false,\n          \"K\": false,\n          \"KH\": false,\n          \"st\": 100,\n          \"gauge\": 200\n        },\n        \"after\": {\n          \"gameOn\": false,\n          \"hold\": false,\n          \"harpActive\": false,\n          \"st\": 100,\n          \"gauge\": 200,\n          \"K\": false,\n          \"KH\": false\n        },\n        \"calls\": [\n          \"beamStop\",\n          \"cacheExit\",\n          \"sfxReset\",\n          \"fpsUpdate\",\n          \"benchTick\",\n          \"systemTick\",\n          \"perfTick\",\n          \"sfxReset\",\n          \"fpsUpdate\",\n          \"benchTick\",\n          \"systemTick\",\n          \"perfTick\"\n        ]\n      },\n      \"normal\": {\n        \"beforeUp\": {\n          \"updateEntryTicks\": 2,\n          \"rafs\": 1,\n          \"gameOn\": false,\n          \"overlay\": \"flex\",\n          \"hold\": false,\n          \"K\": false,\n          \"KH\": false,\n          \"st\": 100,\n          \"gauge\": 200\n        },\n        \"after\": {\n          \"gameOn\": false,\n          \"hold\": false,\n          \"harpActive\": false,\n          \"st\": 100,\n          \"gauge\": 200,\n          \"K\": false,\n          \"KH\": false\n        },\n        \"calls\": [\n          \"beamStop\",\n          \"cacheExit\",\n          \"sfxReset\",\n          \"fpsUpdate\",\n          \"benchTick\",\n          \"systemTick\",\n          \"perfTick\",\n          \"sfxReset\",\n          \"fpsUpdate\",\n          \"benchTick\",\n          \"systemTick\",\n          \"perfTick\",\n          \"dialogStop\",\n          \"save\",\n          [\n            \"navigation\",\n            \"indexdemo.html\"\n          ]\n        ]\n      },\n      \"noHeld\": {\n        \"beforeUp\": {\n          \"updateEntryTicks\": 2,\n          \"rafs\": 1,\n          \"gameOn\": false,\n          \"overlay\": \"flex\",\n          \"hold\": false,\n          \"K\": false,\n          \"KH\": false,\n          \"st\": 100,\n          \"gauge\": 200\n        },\n        \"after\": {\n          \"gameOn\": false,\n          \"hold\": false,\n          \"harpActive\": false,\n          \"st\": 100,\n          \"gauge\": 200,\n          \"K\": false,\n          \"KH\": false\n        },\n        \"calls\": [\n          \"beamStop\",\n          \"cacheExit\",\n          \"sfxReset\",\n          \"fpsUpdate\",\n          \"benchTick\",\n          \"systemTick\",\n          \"perfTick\",\n          \"sfxReset\",\n          \"fpsUpdate\",\n          \"benchTick\",\n          \"systemTick\",\n          \"perfTick\"\n        ]\n      }\n    }\n  ],\n  \"filesWritten\": 0,\n  \"productionApplied\": false,\n  \"nativeAccepted\": false,\n  \"boundary\": \"Reachability follow-up1434. Whole actual nextStage/loop/update/pollGamepad/clearHeldInput/global keyup and unchanged constants evaluated. No pads, visible document, two full frames reach update early return: gameplay/draw blocked, resource values intact, original hold remains. Subsequent modeled window event dispatch reaches registered callback outside loop and mutates ST/gauge/harpActive; this is synchronous state mutation, not movement/gameplay animation or native input proof. Candidate uses existing held cleanup at ending entry, defensive cancellation only pending root/native Gate. Normal CTA after same full frames one save/navigation unchanged. No Escape/Space/Tab/throwretry/death/replay tests.\"\n}\n"
}
```

```sh
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node --input-type=module <<'JS'
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import crypto from 'node:crypto';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex'),out=[];
for(const file of ['game.html','game-easy-test.html']){
 const src=fs.readFileSync(file,'utf8');
 function f(n){const a=src.indexOf('function '+n+'(');assert(a>=0);const line=src.slice(a,src.indexOf('\n',a));return line.endsWith('}')?line:src.slice(a,src.indexOf('\n}',a)+2)}
 const loop=f('loop'),update=f('update'),poll=f('_pollGamepad');const next=f('nextStage'),clear=f('_clearHeldInput'),mark="addEventListener('keyup',e=>{\n  K[e.code]=false;",a=src.indexOf(mark),up=src.slice(a,src.indexOf('\n});',a)+4);assert(a>=0);
 const anchor="_de.style.display='flex';",replacement=anchor+'_clearHeldInput();';assert.equal(next.split(anchor).length,2);const candidate=next.replace(anchor,replacement);
 const constants=['_HARP_TIER_F','_HARP_SPD','_HARP_GAUGE_COST'].map(n=>src.match(new RegExp('^const '+n+'=[^;]+;','m'))[0]).join('\n');
 const last=Number(src.match(/const _DEMO_LAST_STAGE=([^;]+);/)[1]),mode=src.match(/const _DEMO_MODE=([^;]+);/)[1];
 async function run(n,{held=true,ctaClick=false}={}){
  const nodes={},calls=[],handlers={},rafs=[];let perfNow=100,resolveSave;
  const ca=src.indexOf('async function goToLobby(){'),cb=src.indexOf('\n}',ca)+2,cta=src.slice(ca,cb);const phys=src.match(/^const PHYS_STEP=[^;]+;/m)[0];
  const $=id=>nodes[id]||(nodes[id]={style:{display:'none'},textContent:'',classList:{add(){},remove(){},contains:()=>false}});
  const math=Object.create(Math);math.random=()=>.5;
  const s={$ ,Math:math,window:{},addEventListener:(t,f)=>handlers[t]=f,K:{ShiftLeft:held},KH:{ShiftLeft:held},MB:{0:held},MBjust:{0:held},
   _DEMO_MODE:vm.runInNewContext(mode,{_BIC:false,location:{search:'?demo=1'}}),_DEMO_LAST_STAGE:last,SI_TO_HELL:Array(40).fill(0),CHAPTER_STAGES:[{startSi:0,stages:4}],TOTAL_STAGES:35,
   G:{stage:last,on:true,paused:false,mats:0},P:{s:'idle',hp:100,mhp:100,st:100,mst:100,mp:100,mmp:100,shield:100,mshield:100,x:1,y:2,skills:{},_beamHold:held,_mmAiming:held,_mmCharging:held,_msAiming:held,_msCharging:held,_bwAiming:held},
   ens:[],_ensWarmDone:false,_hudT:0,_hudAlive:0,_T:x=>x,_cacheExitCenter:()=>calls.push('cacheExit'),
   _dashHold:held,_dashHoldF:6,_dashTier:0,_harpActive:false,_dashActive:false,_harpGauge:200,_cutSkipHolding:false,_cutSkipHold:0,_gpActive:false,
   BINDS:{},BINDS2:{},_aimDir:()=>0,isDimBreach:()=>false,_harpAvailableDist:()=>900,_r:()=>1,_addSkProf:()=>calls.push('prof'),
   SFX:{beamStop:()=>calls.push('beamStop'),slash:()=>calls.push('slash'),magic:()=>calls.push('magic')},
   playSample:(...x)=>calls.push(['sample',...x]),addTxt:(...x)=>calls.push(['text',...x]),initStage:()=>calls.push('initStage'),doWin:()=>calls.push('win'),BGM:{play:()=>calls.push('bgm'),stageKey:()=>''}};
  Object.assign(s,{document:{hidden:false,title:''},performance:{now:()=>perfNow},navigator:{getGamepads:()=>[]},requestAnimationFrame:f=>{rafs.push(f);return rafs.length},
   _DCP:{on:false},_bootLoadKilled:true,_bootLoadActive:false,_DEBUG_PERF:false,OPT:{fpsCap:0},_lastLoopTs:0,_partSpawnCnt:0,_aoeHitCnt:0,_prevTs:80,_loopRunning:false,_perfFrames:0,_perfLast:100,
   _acc:0,_prof:{u:0,d:0,f:0,t:0},IS_MOBILE:false,_fpsCur:60,_hiFPS:false,_atmReady:false,_useGPU:false,_useGL:false,_drawOdd:0,_dtSp:1,_impPerFrame:0,_txtPerFrame:0,_PERF_PROF:{enabled:false},_gameTime:0,_now:0,_cutsceneState:'',_matsPrev:0,_BOOTH_MODE:false,_ATM_TUNE:false,_gpConnected:false,
   _sfxFrameReset:()=>calls.push('sfxReset'),_fpsUpdate:()=>calls.push('fpsUpdate'),_benchTick:()=>calls.push('benchTick'),_perfFrameTick:()=>calls.push('perfTick'),_texPreDrain:()=>calls.push('texDrain'),draw:()=>{throw new Error('unexpected gameplay draw')},console:{error:(...e)=>calls.push(['loopError',...e])},
   _dbReady:true,_deathDlgStop:()=>calls.push('dialogStop'),dbSave:()=>{calls.push('save');return new Promise(r=>resolveSave=r)}});
  s.window._systemLesson={tick:()=>calls.push('systemTick')};
  s.window.location={};Object.defineProperty(s.window.location,'href',{set:url=>calls.push(['navigation',url])});
  const ctx=vm.createContext(s);vm.runInContext(phys+'\n'+constants+'\n'+clear+'\n'+n+'\n'+up+'\n'+poll+'\n'+update+'\n'+loop+'\n'+cta+'\n$("demoEndLobby").onclick=()=>goToLobby()',ctx);
  vm.runInContext('nextStage()',ctx);
  vm.runInContext('loop(100)',ctx);assert.equal(rafs.length,1);perfNow=120;rafs.shift()(120);assert.equal(calls.filter(x=>Array.isArray(x)&&x[0]==='loopError').length,0);
  const beforeUp={updateEntryTicks:calls.filter(x=>x==='systemTick').length,rafs:rafs.length,gameOn:s.G.on,overlay:$('demoEnd').style.display,hold:s._dashHold,K:s.K.ShiftLeft,KH:s.KH.ShiftLeft,st:s.P.st,gauge:s._harpGauge};
  if(!ctaClick){
   // Model window event dispatch to the actual registered listener after two complete frames.
   s.window.dispatchEvent=e=>{handlers.keyup(e);return true};s.window.dispatchEvent({type:'keyup',code:'ShiftLeft',preventDefault(){},stopImmediatePropagation(){}});
  }else{const result=$('demoEndLobby').onclick();assert(resolveSave);resolveSave();await result;}
  return {beforeUp,after:{gameOn:s.G.on,hold:s._dashHold,harpActive:s._harpActive,st:s.P.st,gauge:s._harpGauge,K:s.K.ShiftLeft,KH:s.KH.ShiftLeft},calls};
 }
 const original=await run(next),fixed=await run(candidate);assert.equal(original.beforeUp.gameOn,false);assert.equal(original.after.harpActive,true);
 assert.equal(fixed.after.harpActive,false);assert.equal(fixed.after.st,100);assert.equal(fixed.after.gauge,200);
 assert.equal(fixed.calls.filter(x=>Array.isArray(x)).length,0);assert.equal(fixed.beforeUp.hold,false);assert(original.beforeUp.updateEntryTicks>=2);assert.equal(original.beforeUp.st,100);assert.equal(original.beforeUp.gauge,200);
 const normal=await run(next,{held:false,ctaClick:true}),normalFixed=await run(candidate,{held:false,ctaClick:true});assert.deepEqual(normalFixed,normal);assert.equal(normal.calls.filter(x=>Array.isArray(x)&&x[0]==='navigation').length,1);
 const noHeld=await run(next,{held:false}),noHeldFixed=await run(candidate,{held:false});assert.deepEqual(noHeldFixed.after,noHeld.after);assert.deepEqual(noHeldFixed.calls,noHeld.calls);
 assert.equal(sha(fs.readFileSync(file,'utf8')),sha(src));
 out.push({file,inputSha:sha(src),lengths:{loop:loop.length,update:update.length,poll:poll.length},hashes:{loop:sha(loop),update:sha(update),poll:sha(poll),nextStage:sha(next),clearHeld:sha(clear),keyup:sha(up),constants:sha(constants)},anchor,replacement,original,fixed,normal,noHeld:noHeldFixed});
}
console.log(JSON.stringify({completionId:'MARKETING-demo-ending-held-release-whole-loop-1434',at:new Date().toISOString(),status:'SOURCE_LOOP_STOPS_GAMEPLAY_KEYUP_MUTATION_REACHABLE_FIXTURE',out,filesWritten:0,productionApplied:false,nativeAccepted:false,boundary:'Reachability follow-up1434. Whole actual nextStage/loop/update/pollGamepad/clearHeldInput/global keyup and unchanged constants evaluated. No pads, visible document, two full frames reach update early return: gameplay/draw blocked, resource values intact, original hold remains. Subsequent modeled window event dispatch reaches registered callback outside loop and mutates ST/gauge/harpActive; this is synchronous state mutation, not movement/gameplay animation or native input proof. Candidate uses existing held cleanup at ending entry, defensive cancellation only pending root/native Gate. Normal CTA after same full frames one save/navigation unchanged. No Escape/Space/Tab/throwretry/death/replay tests.'},null,2));
JS
```

## Earlier isolated held-release evidence (superseded classification; not rerun)

```json
{
  "chunk_id": "abd558",
  "wall_time_seconds": 0.000006084,
  "exit_code": 0,
  "original_token_count": 2141,
  "output": "{\n  \"completionId\": \"MARKETING-demo-ending-held-input-release-20261002\",\n  \"at\": \"2026-10-02T14:27:18.232Z\",\n  \"status\": \"SOURCE_ENDING_HELD_RELEASE_CANDIDATE_PASS\",\n  \"out\": [\n    {\n      \"file\": \"game.html\",\n      \"inputSha\": \"e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea\",\n      \"hashes\": {\n        \"nextStage\": \"9e53b012d584d296e004dbb15fe3f52bf9cab0b37ac825d6a426dc65562c9321\",\n        \"clearHeld\": \"e5349553045eeecb2cea724cf9a065eeb9dba0eb022ccc13fb89f74a1af44ca5\",\n        \"keyup\": \"abd27fb0685fbcd68ea917a611c7c252d01c00f284b6c0dec7d7c320bb13f32c\",\n        \"constants\": \"2e00a5b751905a659f915d300dc50c710294b10bf1061ba97d8329798d33cbba\"\n      },\n      \"anchor\": \"_de.style.display='flex';\",\n      \"replacement\": \"_de.style.display='flex';_clearHeldInput();\",\n      \"original\": {\n        \"beforeUp\": {\n          \"gameOn\": false,\n          \"overlay\": \"flex\",\n          \"hold\": true,\n          \"K\": true,\n          \"KH\": true,\n          \"st\": 100,\n          \"gauge\": 200\n        },\n        \"after\": {\n          \"gameOn\": false,\n          \"hold\": false,\n          \"harpActive\": true,\n          \"st\": 98,\n          \"gauge\": 102,\n          \"K\": false,\n          \"KH\": false\n        },\n        \"calls\": [\n          \"beamStop\",\n          \"cacheExit\",\n          [\n            \"sample\",\n            \"chain_throw\",\n            0.7,\n            1\n          ],\n          [\n            \"sample\",\n            \"chain_fly\",\n            0.5,\n            1\n          ],\n          \"slash\",\n          [\n            \"sample\",\n            \"chain_dash3\",\n            0.6,\n            1\n          ],\n          [\n            \"sample\",\n            \"male_grunt\",\n            1,\n            1\n          ],\n          [\n            \"text\",\n            1,\n            -23,\n            \"⛓️ 사슬!\",\n            \"#ffaa00\",\n            35\n          ],\n          \"prof\"\n        ]\n      },\n      \"fixed\": {\n        \"beforeUp\": {\n          \"gameOn\": false,\n          \"overlay\": \"flex\",\n          \"hold\": false,\n          \"K\": false,\n          \"KH\": false,\n          \"st\": 100,\n          \"gauge\": 200\n        },\n        \"after\": {\n          \"gameOn\": false,\n          \"hold\": false,\n          \"harpActive\": false,\n          \"st\": 100,\n          \"gauge\": 200,\n          \"K\": false,\n          \"KH\": false\n        },\n        \"calls\": [\n          \"beamStop\",\n          \"cacheExit\"\n        ]\n      },\n      \"normal\": {\n        \"beforeUp\": {\n          \"gameOn\": true,\n          \"overlay\": \"none\",\n          \"hold\": true,\n          \"K\": true,\n          \"KH\": true,\n          \"st\": 100,\n          \"gauge\": 200\n        },\n        \"after\": {\n          \"gameOn\": true,\n          \"hold\": false,\n          \"harpActive\": true,\n          \"st\": 98,\n          \"gauge\": 102,\n          \"K\": false,\n          \"KH\": false\n        },\n        \"calls\": [\n          \"beamStop\",\n          \"cacheExit\",\n          \"initStage\",\n          \"bgm\",\n          [\n            \"sample\",\n            \"chain_throw\",\n            0.7,\n            1\n          ],\n          [\n            \"sample\",\n            \"chain_fly\",\n            0.5,\n            1\n          ],\n          \"slash\",\n          [\n            \"sample\",\n            \"chain_dash3\",\n            0.6,\n            1\n          ],\n          [\n            \"sample\",\n            \"male_grunt\",\n            1,\n            1\n          ],\n          [\n            \"text\",\n            1,\n            -23,\n            \"⛓️ 사슬!\",\n            \"#ffaa00\",\n            35\n          ],\n          \"prof\"\n        ]\n      },\n      \"noHeld\": {\n        \"beforeUp\": {\n          \"gameOn\": false,\n          \"overlay\": \"flex\",\n          \"hold\": false,\n          \"K\": false,\n          \"KH\": false,\n          \"st\": 100,\n          \"gauge\": 200\n        },\n        \"after\": {\n          \"gameOn\": false,\n          \"hold\": false,\n          \"harpActive\": false,\n          \"st\": 100,\n          \"gauge\": 200,\n          \"K\": false,\n          \"KH\": false\n        },\n        \"calls\": [\n          \"beamStop\",\n          \"cacheExit\"\n        ]\n      }\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"inputSha\": \"68fa8e17d379fdf7e9da20b153d874e2ac74544d790397b4d36edbcc1207f390\",\n      \"hashes\": {\n        \"nextStage\": \"9e53b012d584d296e004dbb15fe3f52bf9cab0b37ac825d6a426dc65562c9321\",\n        \"clearHeld\": \"e5349553045eeecb2cea724cf9a065eeb9dba0eb022ccc13fb89f74a1af44ca5\",\n        \"keyup\": \"abd27fb0685fbcd68ea917a611c7c252d01c00f284b6c0dec7d7c320bb13f32c\",\n        \"constants\": \"2e00a5b751905a659f915d300dc50c710294b10bf1061ba97d8329798d33cbba\"\n      },\n      \"anchor\": \"_de.style.display='flex';\",\n      \"replacement\": \"_de.style.display='flex';_clearHeldInput();\",\n      \"original\": {\n        \"beforeUp\": {\n          \"gameOn\": false,\n          \"overlay\": \"flex\",\n          \"hold\": true,\n          \"K\": true,\n          \"KH\": true,\n          \"st\": 100,\n          \"gauge\": 200\n        },\n        \"after\": {\n          \"gameOn\": false,\n          \"hold\": false,\n          \"harpActive\": true,\n          \"st\": 98,\n          \"gauge\": 102,\n          \"K\": false,\n          \"KH\": false\n        },\n        \"calls\": [\n          \"beamStop\",\n          \"cacheExit\",\n          [\n            \"sample\",\n            \"chain_throw\",\n            0.7,\n            1\n          ],\n          [\n            \"sample\",\n            \"chain_fly\",\n            0.5,\n            1\n          ],\n          \"slash\",\n          [\n            \"sample\",\n            \"chain_dash3\",\n            0.6,\n            1\n          ],\n          [\n            \"sample\",\n            \"male_grunt\",\n            1,\n            1\n          ],\n          [\n            \"text\",\n            1,\n            -23,\n            \"⛓️ 사슬!\",\n            \"#ffaa00\",\n            35\n          ],\n          \"prof\"\n        ]\n      },\n      \"fixed\": {\n        \"beforeUp\": {\n          \"gameOn\": false,\n          \"overlay\": \"flex\",\n          \"hold\": false,\n          \"K\": false,\n          \"KH\": false,\n          \"st\": 100,\n          \"gauge\": 200\n        },\n        \"after\": {\n          \"gameOn\": false,\n          \"hold\": false,\n          \"harpActive\": false,\n          \"st\": 100,\n          \"gauge\": 200,\n          \"K\": false,\n          \"KH\": false\n        },\n        \"calls\": [\n          \"beamStop\",\n          \"cacheExit\"\n        ]\n      },\n      \"normal\": {\n        \"beforeUp\": {\n          \"gameOn\": true,\n          \"overlay\": \"none\",\n          \"hold\": true,\n          \"K\": true,\n          \"KH\": true,\n          \"st\": 100,\n          \"gauge\": 200\n        },\n        \"after\": {\n          \"gameOn\": true,\n          \"hold\": false,\n          \"harpActive\": true,\n          \"st\": 98,\n          \"gauge\": 102,\n          \"K\": false,\n          \"KH\": false\n        },\n        \"calls\": [\n          \"beamStop\",\n          \"cacheExit\",\n          \"initStage\",\n          \"bgm\",\n          [\n            \"sample\",\n            \"chain_throw\",\n            0.7,\n            1\n          ],\n          [\n            \"sample\",\n            \"chain_fly\",\n            0.5,\n            1\n          ],\n          \"slash\",\n          [\n            \"sample\",\n            \"chain_dash3\",\n            0.6,\n            1\n          ],\n          [\n            \"sample\",\n            \"male_grunt\",\n            1,\n            1\n          ],\n          [\n            \"text\",\n            1,\n            -23,\n            \"⛓️ 사슬!\",\n            \"#ffaa00\",\n            35\n          ],\n          \"prof\"\n        ]\n      },\n      \"noHeld\": {\n        \"beforeUp\": {\n          \"gameOn\": false,\n          \"overlay\": \"flex\",\n          \"hold\": false,\n          \"K\": false,\n          \"KH\": false,\n          \"st\": 100,\n          \"gauge\": 200\n        },\n        \"after\": {\n          \"gameOn\": false,\n          \"hold\": false,\n          \"harpActive\": false,\n          \"st\": 100,\n          \"gauge\": 200,\n          \"K\": false,\n          \"KH\": false\n        },\n        \"calls\": [\n          \"beamStop\",\n          \"cacheExit\"\n        ]\n      }\n    }\n  ],\n  \"filesWritten\": 0,\n  \"productionApplied\": false,\n  \"nativeAccepted\": false,\n  \"boundary\": \"New ending transition held-input contact. Actual whole nextStage/_clearHeldInput/global keyup and actual unchanged HARP constants. DOM/clock/render/audio/resource APIs stubbed; no actual sound or input. Candidate adds only existing clearHeldInput invocation at demoEnd display, no combat algorithm/formula/constant/helper modifications or protected2_3 document edits. Original stopped game still launches held Shift via ungated keyup; candidate cancels prior hold. Normal non-ending release exact trace retained. No prior replay/death/Space/Tab/throw tests.\"\n}\n"
}
```

## Final-save scope NOFIX

```json
{
  "chunk_id": "757483",
  "wall_time_seconds": 0.000007125,
  "exit_code": 0,
  "original_token_count": 608,
  "output": "{\n  \"completionId\": \"MARKETING-return-unload-save-attempt-scope-20261002\",\n  \"at\": \"2026-10-02T14:39:27.272Z\",\n  \"status\": \"SOURCE_EXISTING_FINAL_SAVE_CONTRACT_NO_PATCH\",\n  \"out\": [\n    {\n      \"file\": \"game.html\",\n      \"inputSha\": \"e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea\",\n      \"hashes\": {\n        \"cta\": \"0ad806fa64f401c091cbb22b8188c46b8a31a55c05649d659f0303709c1d9dc8\",\n        \"unload\": \"460b6d53ef4012dd0260b53cca298881818c889fcea4c0c1d1135add278867e7\"\n      },\n      \"calls\": [\n        \"cleanup\",\n        \"saveAttempt\",\n        [\n          \"navigation\",\n          \"/?lobby=1&demo=1\"\n        ],\n        \"saveAttempt\"\n      ],\n      \"ctaCalls\": 1,\n      \"navigationAttempts\": 1,\n      \"saveAttempts\": 2,\n      \"unloadSource\": \"window.addEventListener('beforeunload',()=>{\\n  if(_dbReady&&P){\\n    // navigator.sendBeacon은 JSON 전송이 복잡하므로 동기적 Supabase 호출 대신\\n    // 최종 저장 시도 (브라우저가 허용하는 범위에서)\\n    dbSave();\\n  }\\n});\"\n    },\n    {\n      \"file\": \"game-easy-test.html\",\n      \"inputSha\": \"68fa8e17d379fdf7e9da20b153d874e2ac74544d790397b4d36edbcc1207f390\",\n      \"hashes\": {\n        \"cta\": \"f74baf5d0881ea238015abea884856055a495a1df61741bb19e390e490d70667\",\n        \"unload\": \"460b6d53ef4012dd0260b53cca298881818c889fcea4c0c1d1135add278867e7\"\n      },\n      \"calls\": [\n        \"cleanup\",\n        \"saveAttempt\",\n        [\n          \"navigation\",\n          \"indexdemo.html\"\n        ],\n        \"saveAttempt\"\n      ],\n      \"ctaCalls\": 1,\n      \"navigationAttempts\": 1,\n      \"saveAttempts\": 2,\n      \"unloadSource\": \"window.addEventListener('beforeunload',()=>{\\n  if(_dbReady&&P){\\n    // navigator.sendBeacon은 JSON 전송이 복잡하므로 동기적 Supabase 호출 대신\\n    // 최종 저장 시도 (브라우저가 허용하는 범위에서)\\n    dbSave();\\n  }\\n});\"\n    }\n  ],\n  \"filesWritten\": 0,\n  \"productionApplied\": false,\n  \"nativeAccepted\": false,\n  \"boundary\": \"New independent final-save scope audit. Whole actual CTA and actual beforeunload registration. Navigation setter dispatches modeled beforeunload, dbSave memory sink only: counts call attempts, no persistence/ACK/native unload promise. Two save calls are existing explicit final-save intent documented in save SSOT, not duplicate CTA/start flaw. Prior single-flight guard does not remove unload final attempt. No candidate or actual storage changes.\"\n}\n"
}
```

```sh
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node --input-type=module <<'JS'
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import crypto from 'node:crypto';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex'),out=[];
for(const file of ['game.html','game-easy-test.html']){
 const src=fs.readFileSync(file,'utf8'),a=src.indexOf('async function goToLobby(){'),b=src.indexOf('\n}',a)+2,cta=src.slice(a,b),u=src.indexOf("window.addEventListener('beforeunload',()=>{"),v=src.indexOf('\n});',u)+4,unload=src.slice(u,v);assert(a>=0&&u>=0);
 const calls=[],handlers={},window={addEventListener:(t,f)=>handlers[t]=f},location={};window.location=location;
 Object.defineProperty(location,'href',{set:url=>{calls.push(['navigation',url]);handlers.beforeunload({type:'beforeunload'})}});
 const s={window,_dbReady:true,_DEMO_MODE:true,P:{hp:100},_deathDlgStop:()=>calls.push('cleanup'),dbSave:async()=>calls.push('saveAttempt'),console};
 vm.runInContext(cta+'\n'+unload,vm.createContext(s));await s.goToLobby();
 assert.deepEqual(calls.map(x=>Array.isArray(x)?x[0]:x),['cleanup','saveAttempt','navigation','saveAttempt']);
 assert.equal(sha(fs.readFileSync(file,'utf8')),sha(src));
 out.push({file,inputSha:sha(src),hashes:{cta:sha(cta),unload:sha(unload)},calls,ctaCalls:1,navigationAttempts:1,saveAttempts:2,unloadSource:unload});
}
console.log(JSON.stringify({completionId:'MARKETING-return-unload-save-attempt-scope-20261002',at:new Date().toISOString(),status:'SOURCE_EXISTING_FINAL_SAVE_CONTRACT_NO_PATCH',out,filesWritten:0,productionApplied:false,nativeAccepted:false,boundary:'New independent final-save scope audit. Whole actual CTA and actual beforeunload registration. Navigation setter dispatches modeled beforeunload, dbSave memory sink only: counts call attempts, no persistence/ACK/native unload promise. Two save calls are existing explicit final-save intent documented in save SSOT, not duplicate CTA/start flaw. Prior single-flight guard does not remove unload final attempt. No candidate or actual storage changes.'},null,2));
JS
```

## Full docs searches

```
rg -l '_clearHeldInput|nextStage|demoEnd|if\\(!G.on\\)|G\\.paused|keyup.*Shift' docs/
docs/2_1 스킬관리+합체시스템+자원/SKILL03_설치확정_자원검수_20261001.md
docs/12퍼포먼스·최적화/EDGE_TERMINAL_FRAME_DIAG_20260929.md
docs/2_1 스킬관리+합체시스템+자원/MALICE_STORM_FOCUS_CANCELLATION_20261002.md
docs/3.1 ui hud 디자인/exoduser-hud-redesign.md
docs/2_1 스킬관리+합체시스템+자원/SKILL_자원게이트_감사_20261001.md
docs/2_1 스킬관리+합체시스템+자원/BONEWALL_FOCUS_CANCELLATION_20261002.md
docs/3.1 ui hud 디자인/exoduser-ui-phase2 (1).md
docs/3.1 ui hud 디자인/SETTINGS_UI_WORKSPACE_20260929.md
docs/CHANGELOG_SYNC.md
docs/PERF_MAC_CHROME_AUDIT.md
docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md
docs/2_1 스킬관리+합체시스템+자원/자원리젠+소모공식.md
docs/12퍼포먼스·최적화/12퍼포먼스·최적화.md
docs/12퍼포먼스·최적화/FRAME_DROP_HUD_TEXT_20260928.md
docs/16번역·로컬라이제이션/번역대상_전체목록.md
docs/12퍼포먼스·최적화/프레임최적화_전수조사_2026-05-21.md
docs/8.1보스디자인바이블/DARK_DRUID_FINALE_QA_20260909.md
docs/8.1보스디자인바이블/DARK_DRUID_FINALE_PACING_v04.md
docs/8.1보스디자인바이블/DARK_DRUID_DEMO_FINALE_DESIGN.md
docs/16번역·로컬라이제이션/번역_가이드.md
docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md
docs/4.1맵디자인+설정/REGION_CLEAR_GATE_20260930.md
docs/0마스터플랜/EA/HELL_EA_BUILD_CHECKLIST.md
docs/0마스터플랜/EXODUSER_MASTER_BIBLE_v2_2 (2).md
docs/4.1맵디자인+설정/MAP_QA_GATES.md
docs/4.1맵디자인+설정/WORLD_STRUCTURE_SSOT.md
docs/2게임디자인레벨디자인/클리어결과_점수랭크_20260930.md
docs/2게임디자인레벨디자인/CHAIN_ESCAPE_FIX_20260913.md
docs/0마스터플랜/mac-resume-20261001/ring-png-evidence/world-fixture-setup.js
docs/13출시·마케팅/MAP_INTRO_20260909.md
docs/13출시·마케팅/GAMEPLAY_TRAILER_V2_20260909.md
docs/4.1맵디자인+설정/MAP_RUNTIME_ARCHITECTURE.md
docs/13출시·마케팅/13출시·마케팅.md
docs/0마스터플랜/mac-resume-20261001/MAP020-Mac-실화면-검수.md
docs/0마스터플랜/mac-resume-20261001/Mac-일반이미지-비동기준비.md
docs/0마스터플랜/mac-resume-20261001/MAP020-줌수정-검수.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/ANIMVFX-receipt.json
docs/0마스터플랜/DEMO/HELL_DEMO_BUILD_NOTES.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_STATE.json
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/CONTINUOUS-INTEGRATION-20261002.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/UIUX-demo-scope-result.md
docs/4.1맵디자인+설정/MAP_IMPLEMENTATION_ROADMAP.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/BUILD-result.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/ANIMVFX-result.md

rg -l 'beforeunload|goToLobby|페이지 이탈|최종 저장' docs/
docs/15 세이브+데이터구조/15 세이브+데이터구조.md
docs/4.1맵디자인+설정/tilemap-editor.html
docs/13출시·마케팅/STEAM_STORE_LOCALIZATION_20260909.md
docs/13출시·마케팅/13출시·마케팅.md
docs/4.1맵디자인+설정/tilemap-editor.html.broken
docs/2_4 펫시스템/대사_스크립트.md
docs/12퍼포먼스·최적화/MAP_STARTUP_READY_20260929.md
docs/12퍼포먼스·최적화/FIRST_KILL_CPU_INVESTIGATION_20261001.md
docs/4.1맵디자인+설정/tilemap-editor.html.bak2
docs/4.1맵디자인+설정/tilemap-editor.html.bak
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_LOG.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_STATE.json
docs/0마스터플랜/mac-resume-20261001/QA-ENEMY-ANIMVFX-인수검토.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/busy-save-independent-result.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/persistence-review-result.md
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/busy-save-independent-receipt.json
docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/persistence-review-receipt.json

```

## Source pin verification at preservation

```
e462f2345682856d24bb416a17aec763281a8dceb02f21af565db189992353ea  game.html
68fa8e17d379fdf7e9da20b153d874e2ac74544d790397b4d36edbcc1207f390  game-easy-test.html

```
