
import fs from 'node:fs';import assert from 'node:assert/strict';import vm from 'node:vm';import {createHash} from 'node:crypto';import {parseExpressionAt} from 'acorn';
const ROOT='/Users/fordeargamers/Projects/exoduser-migration-20261001',sha=b=>createHash('sha256').update(b).digest('hex'),startedAt=new Date().toISOString();
const names=['_startLoop','loop','actx','_sfxFrameReset','_playSampleNow','playSample','_r','_sfxCat','_sfxPri','_isSkillSfx','_isFootstepSfx','_evictLowest'];
const constants=['_MAX_ACTIVE_NODES','_SFX_MAX','_SFX_PER_FRAME','_SFX_PRI','_SKILL_SFX_KEYS','_MAX_PROJ_NODES','_MAX_HIT_NODES','_MAX_STEP_NODES'];
function block(s,n,c=false){const a=c?'const '+n+'=':(n==='_startLoop'?'function _startLoop(){':'function '+n+'('),i=s.indexOf(a);assert.ok(i>=0,n);const p=parseExpressionAt(s,c?i+a.length:i,{ecmaVersion:'latest'}),code=s.slice(i,p.end)+(c?';':'');return {name:n,code,line:s.slice(0,i).split('\n').length,endLine:s.slice(0,p.end).split('\n').length,sha256:sha(code)};}
const sources=['game.html','game-easy-test.html'].map(file=>{const s=fs.readFileSync(ROOT+'/'+file,'utf8'),blocks=[...names.map(n=>block(s,n)),...constants.map(n=>block(s,n,true))];return {file,readAt:new Date().toISOString(),sha256:sha(s),blocks,fingerprint:sha(blocks.map(b=>b.code).join('\n'))};});
const groups=new Map();for(const s of sources){if(groups.has(s.fingerprint))groups.get(s.fingerprint).files.push(s.file);else groups.set(s.fingerprint,{...s,files:[s.file]});}
const records=[],edits=[];
for(const g of groups.values()){
 const reset=g.blocks.find(b=>b.name==='_sfxFrameReset').code;
 const anchor='  const c=actx();const _t=c.currentTime;\n  try{';assert.equal(reset.split(anchor).length-1,1);
 const extended=reset.replace(anchor,'  try{\n  const c=actx();const _t=c.currentTime;');
 edits.push({files:g.files,target:'_sfxFrameReset',originalSHA:sha(reset),memorySHA:sha(extended),old:anchor,new:'  try{\n  const c=actx();const _t=c.currentTime;',productionApplied:false});
 for(const failure of [true,false])for(const memory of [false,true]){
  const trace=[],raf=[],timers=[],intervals=[],rng=[];let phase='enqueue',clock=100,origin='pitch';const injected=new Error('synthetic constructor in full loop');injected.name='FixtureRAFContextError';
  const ev=(type,data={})=>trace.push({phase,type,...JSON.parse(JSON.stringify(data))});
  const math=Object.create(Math);math.random=()=>{const value=[.25,.75][rng.length%2];rng.push({origin,value,phase});return value;};
  const forbidden=n=>()=>{throw new Error('unexpected '+n);};
  const Ctor=function(options){ev('constructor',{options});if(failure)throw injected;this.state='running';this.currentTime=.1;this.createBufferSource=()=>{const src={buffer:null,playbackRate:{value:1},onended:null,connect(){ev('source.connect');},start(at){ev('source.start',{at,rate:src.playbackRate.value});},stop(){ev('source.stop');},disconnect(){ev('source.disconnect');}};return src;};this.createGain=()=>({gain:{value:1},connect(){ev('gain.connect');},disconnect(){ev('gain.disconnect');}});};
  const sandbox={window:{AudioContext:Ctor},document:{hidden:true,title:'fixture'},Math:math,performance:{now:()=>clock},IS_MOBILE:false,IS_ELECTRON:true,_DCP:{on:false},_DEBUG_PERF:false,_bootLoadActive:true,_bootLoadKilled:true,OPT:{fpsCap:0},G:{debugPerf:false},
   _audioBuffers:{ghost_laugh:{duration:.2}},_sampleFiles:{},_audioLoadPending:{},_gxVolMul:1,_charIdx:0,_silvertailVoiceKey:k=>k,sfxVol:()=>1,mbus:()=>({}),SFX:{_sbSndCd:3},
   _deathSfxCd:2,_hitSfxCd:3,_mSfxPlaying:7,_lastLoopTs:0,_fpsCapInterval:0,_prevTs:0,_loopRunning:false,_perfFrames:0,_perfLast:100,_partSpawnCnt:9,_aoeHitCnt:9,
   _mbus:null,_busHit:null,_busSk:null,_busBoss:null,_busHitIn:null,_busSkIn:null,_busBossIn:null,
   _pollGamepad:()=>ev('pollGamepad'),hideBootLoading:forbidden('boot'),_installDebugLongTaskObserver:forbidden('debug'),_resumeAudioCtx:forbidden('resume'),fetch:forbidden('fetch'),
   console:{error:()=>ev('console.error'),log:()=>ev('console.log'),warn:()=>ev('console.warn')},
   requestAnimationFrame:callback=>{raf.push(callback);ev('raf.schedule',{sameLoop:callback===context.loop});return raf.length;},
   setInterval:(callback,delay)=>{intervals.push({callback,delay});ev('interval.schedule',{delay});return 501;},clearInterval:id=>ev('interval.clear',{id}),
   setTimeout:(callback,delay)=>{timers.push({callback,delay});ev('timer.schedule',{delay});return timers.length;}};
  const context=vm.createContext(sandbox);
  vm.runInContext('let _looping=false,_actx=null,_actxResumed=false,_actxResumePending=false,_actxWatchdog=null,_activeNodeCnt=0,_sfxFrameT=0;const _activeNodes=[],_sfxQueue=[],_sfxLastT={},_sfxFrameCnt={ghost_laugh:2};\n'+g.blocks.map(b=>memory&&b.name==='_sfxFrameReset'?extended:b.code).join('\n'),context,{timeout:1000});
  const realR=context._r;context._r=(...a)=>{const old=origin;origin='caller';try{return realR(...a);}finally{origin=old;}};
  const snap=()=>JSON.parse(vm.runInContext('JSON.stringify({looping:_looping,loopRunning:_loopRunning,lastLoopTs:_lastLoopTs,prevTs:_prevTs,perfFrames:_perfFrames,partSpawnCnt:_partSpawnCnt,aoeHitCnt:_aoeHitCnt,queue:_sfxQueue,frameCounts:_sfxFrameCnt,sbCd:SFX._sbSndCd,context:_actx===null?null:{state:_actx.state},watchdog:_actxWatchdog,activeCount:_activeNodeCnt,nodes:_activeNodes.map(n=>({key:n.key,pri:n.pri}))})',context));
  const rec={id:(failure?'loop-constructor-error':'loop-normal-hidden')+(memory?'-scope-expanded':'-current'),files:g.files,status:'PASS',trace,rngTrace:rng};
  try{
   context.playSample('ghost_laugh',.8,context._r(1.2,.1));phase='boot-raf';context._startLoop();assert.equal(raf.length,1);
   phase='raf-delivery';const pending=raf.shift();assert.equal(pending,context.loop);let caught=null;try{pending(100);}catch(e){caught=e;ev('fixture.catches',{sameError:e===injected,name:e.name});}
   rec.sameError=caught===injected;rec.after=snap();rec.pendingRAF=raf.length;rec.totalRAFRegistrations=trace.filter(e=>e.type==='raf.schedule').length;rec.loopCrashCaught=trace.some(e=>e.type==='console.error');
   assert.equal(rec.sameError,failure);assert.equal(rec.pendingRAF,failure?0:1);assert.equal(rec.totalRAFRegistrations,failure?1:2);assert.equal(rec.loopCrashCaught,false);
   assert.equal(rec.after.queue.length,failure&&!memory?1:0);assert.equal(rec.after.frameCounts.ghost_laugh,failure&&!memory?2:0);assert.equal(rec.after.sbCd,failure&&!memory?3:2);
   assert.equal(rec.after.lastLoopTs,100);assert.equal(rec.after.looping,true);assert.equal(rec.after.loopRunning,!failure);assert.equal(rec.after.perfFrames,failure?0:1);
   assert.equal(rec.after.activeCount,failure?0:1);assert.equal(intervals.length,failure?0:1);assert.equal(timers.length,failure?0:1);
   assert.equal(rng.length,2);phase='existing-start-guard';context._startLoop();rec.pendingAfterExistingStart=raf.length;assert.equal(raf.length,rec.pendingRAF);
   rec.startGuardPreventsRestart=failure&&raf.length===0;
   rec.schedulingRecovered=!failure;rec.productionApplied=false;rec.runtimeAccepted=false;
  }catch(e){rec.status='FAIL';rec.error=e.stack;}records.push(rec);
 }
}
const normalEquivalence=[];for(const g of groups.values()){const pair=records.filter(r=>r.files[0]===g.files[0]&&r.id.startsWith('loop-normal-hidden'));assert.equal(pair.length,2);if(pair.every(r=>r.status==='PASS')){assert.deepEqual(pair[0].trace,pair[1].trace);assert.deepEqual(pair[0].rngTrace,pair[1].rngTrace);assert.deepEqual(pair[0].after,pair[1].after);normalEquivalence.push({files:g.files,exactTrace:true,exactRNG:true,exactState:true});}}
const failed=records.filter(r=>r.status==='FAIL').length;
const afterSource=sources.map(s=>({file:s.file,before:s.sha256,after:sha(fs.readFileSync(ROOT+'/'+s.file))}));
const result={taskId:'SOUND-autonomy-loop-raf-continuation-1126',status:failed?'FAIL':'SOURCE_GATE_CONFIRMED_NO_RAF_RECOVERY',execution:{startedAt,completedAt:new Date().toISOString(),exitCode:failed?1:0,sourceGroups:groups.size,sourceExecutions:records.length,failed,previousTestsRerun:0,newFiles:0},sources:sources.map(s=>({...s,blocks:s.blocks.map(({code,...b})=>b)})),edits,records,afterSource,capacity:{observedChanges:94,allowNewOwnedFiles:false,source:'supervisor STATE read'},productionApplied:false,runtimeAccepted:false,decision:'NO_LOOP_FIX_ADOPTED; error propagates before post-reset RAF even with flush scope cleanup. Preserving original error and scheduling another frame on failure needs explicit root recovery/retry policy; no swallowing/priority change adopted.',limits:['full loop executed only hidden-document normal path; visible combat/draw/native scheduler not simulated','RAF callback held and manually delivered once, not real browser RAF','watchdog/timers held only','no file writes/Git/game/audio/previous tests']};
result.normalEquivalence=normalEquivalence;result.harnessFailureHistory=[{exitCode:1,failed:8,reason:'First same-name _startLoop declaration was audio helper; corrected extraction to exact no-argument game-driver signature',preservedInMemory:true}];console.log(JSON.stringify(result,null,2));process.exitCode=result.execution.exitCode;
