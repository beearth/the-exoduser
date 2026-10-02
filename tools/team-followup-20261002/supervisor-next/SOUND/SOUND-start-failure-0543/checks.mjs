import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseExpressionAt } from 'acorn';
const ROOT='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const OWN=ROOT+'/tools/team-followup-20261002/supervisor-next/SOUND/SOUND-start-failure-0543';
const startedAt=new Date().toISOString(),sha=b=>createHash('sha256').update(b).digest('hex');
assert.equal(process.cwd(),ROOT);assert.equal(fs.realpathSync(ROOT),ROOT);assert.equal(fs.realpathSync(OWN),OWN);
assert.equal(fileURLToPath(new URL('.',import.meta.url)).replace(/\/$/,''),OWN);
const allowed=['TASK.md','checks.mjs','result.md','evidence.json'];
const initialFiles=fs.readdirSync(OWN);assert.ok(initialFiles.every(f=>allowed.includes(f)));
for(const f of initialFiles)assert.equal(fs.lstatSync(OWN+'/'+f).isSymbolicLink(),false);
const reads=[];function read(p){const b=fs.readFileSync(ROOT+'/'+p);reads.push({path:ROOT+'/'+p,at:new Date().toISOString(),sha256:sha(b),bytes:b.length});return b.toString('utf8');}
for(const p of ['tools/team-followup-20261002/supervisor-next/SOUND/SOUND-start-failure-0543/TASK.md','tools/team-followup-20261002/continuous/COMMON.md','AGENTS.md','docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md','docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/PROVIDER-HALVES-20261002.md','docs/6사운드디자인/6사운드디자인.md','tools/team-followup-20261002/continuous/SOUND/result.md'])read(p);
const prior=JSON.parse(read('tools/team-followup-20261002/continuous/SOUND/evidence.json'));
const nodeMain=read('node-main.js');
const fn=['_r','playSample','_sfxFrameReset','_playSampleNow','_evictLowest','_sfxPri','_sfxCat','_isFootstepSfx','_isSkillSfx'];
const cn=['_MAX_ACTIVE_NODES','_SFX_MAX','_SFX_PER_FRAME','_SFX_PRI','_SKILL_SFX_KEYS','_MAX_PROJ_NODES','_MAX_HIT_NODES','_MAX_STEP_NODES'];
function extract(s,n,c=false){const anchor=c?'const '+n+'=':'function '+n+'(',start=s.indexOf(anchor);assert.ok(start>=0);const ast=parseExpressionAt(s,c?start+anchor.length:start,{ecmaVersion:'latest'});const code=s.slice(start,ast.end)+(c?';':'');return {name:n,code,sha256:sha(code),line:s.slice(0,start).split('\n').length,endLine:s.slice(0,ast.end).split('\n').length};}
const sources=['game.html','game-easy-test.html'].map(file=>{const s=read(file),blocks=[...fn.map(n=>extract(s,n)),...cn.map(n=>extract(s,n,true))];return {file,sha256:sha(s),blocks,fingerprint:sha(blocks.map(b=>b.code).join('\n'))};});
const groups=new Map();for(const s of sources){if(groups.has(s.fingerprint))groups.get(s.fingerprint).files.push(s.file);else groups.set(s.fingerprint,{...s,files:[s.file]});}
const old='src.start(startTime||0);',patch='try{src.start(startTime||0);}catch(e){_nd._dn();throw e;}';
const records=[],memoryEdits=[],comparisons=[];
for(const group of groups.values()){
 const backend=group.blocks.find(b=>b.name==='_playSampleNow');assert.equal(backend.code.split(old).length-1,1);const changed=backend.code.replace(old,patch);
 memoryEdits.push({files:group.files,changes:1,target:'_playSampleNow',old,patch,oldFragmentSha256:sha(old),patchFragmentSha256:sha(patch),originalFunctionSha256:backend.sha256,memoryFunctionSha256:sha(changed),productionApplied:false});
 for(const throwing of [true,false])for(const candidate of [false,true]){
  let phase='enqueue',clock=100,origin='playSample_pitch',ctx,returned=null,backendEntered=0;
  const trace=[],rng=[],timers=[];const injected=new Error('synthetic src.start failure');injected.name='FixtureStartError';
  const event=(type,data={})=>trace.push({index:trace.length,phase,clockMs:clock,type,...data});
  const state=()=>JSON.parse(vm.runInContext('JSON.stringify({count:_activeNodeCnt,nodes:_activeNodes.map(n=>({key:n.key,pri:n.pri,startedMs:n._st})),queue:_sfxQueue,lastT:_sfxLastT})',ctx));
  const math=Object.create(Math);math.random=()=>{const value=[.25,.75][rng.length%2];rng.push({origin,value,phase,clockMs:clock});return value;};
  const src={id:'source0',buffer:null,playbackRate:{value:1},onended:null,connect(t){event('src.connect',{target:t.id});},start(at){event('src.start.attempt',{at,active:state(),rate:src.playbackRate.value});if(throwing){event('src.start.throw');throw injected;}event('src.start.success');},stop(){event('src.stop');},disconnect(){event('src.disconnect');}};
  const gain={id:'gain0',gain:{value:1},connect(t){event('gain.connect',{target:t.id});},disconnect(){event('gain.disconnect');}};
  const forbidden=n=>()=>{throw new Error('unexpected '+n);};
  const audio={get currentTime(){return clock/1000;},createBufferSource(){event('createBufferSource');return src;},createGain(){event('createGain');return gain;},createStereoPanner:forbidden('panner'),decodeAudioData:forbidden('decode')};
  const sandbox={Math:math,IS_MOBILE:false,_gxVolMul:1,_charIdx:0,performance:{now:()=>clock},_silvertailVoiceKey:k=>k,
   _audioBuffers:{ghost_laugh:{duration:.2}},_sampleFiles:{},_audioLoadPending:{},actx:()=>audio,mbus:()=>({id:'bus0'}),sfxVol:()=>1,
   _deathSfxCd:0,_hitSfxCd:0,_mSfxPlaying:0,SFX:{_sbSndCd:0},_actx:null,
   setTimeout:(callback,delay)=>{assert.equal(delay,700);timers.push({callback,delay});event('timer.schedule',{delayMs:delay});return timers.length;},
   fetch:forbidden('fetch'),AudioContext:forbidden('AudioContext'),_resumeAudioCtx:forbidden('resume')};
  ctx=vm.createContext(sandbox);
  vm.runInContext('let _activeNodeCnt=0,_sfxFrameT=0;const _activeNodes=[],_sfxQueue=[],_sfxLastT={},_sfxFrameCnt={};\n'+group.blocks.map(b=>candidate&&b.name==='_playSampleNow'?changed:b.code).join('\n'),ctx,{timeout:1000});
  const actualR=ctx._r;ctx._r=(...a)=>{const prev=origin;origin='caller_r';try{return actualR(...a);}finally{origin=prev;}};
  const actualBackend=ctx._playSampleNow;ctx._playSampleNow=(...a)=>{backendEntered++;event('backend.enter',{key:a[0],override:a[5]??null});const r=actualBackend(...a);returned=r;event('backend.return',{sameSource:r===src});return r;};
  const rec={id:(throwing?'start-throws':'start-normal')+(candidate?'-memory':'-current'),inputKind:throwing?'start exception':'normal vacancy',candidate,sourceFiles:group.files,status:'PASS',trace,rngTrace:rng,productionApplied:false,priorityPolicyAdopted:false};
  try{
   ctx.playSample('ghost_laugh',.8,ctx._r(1.2,.1));rec.beforeFlush=state();phase='flush';
   let caught=null;try{ctx._sfxFrameReset();}catch(e){caught=e;event('fixture.catches-original-error',{sameIdentity:e===injected,name:e.name});}
   rec.immediate=state();rec.backendEntries=backendEntered;rec.errorPropagated=caught===injected;rec.error=caught?{name:caught.name,message:caught.message,sameInjectedIdentity:caught===injected}:null;
   rec.normalReturnSameSource=returned===src;rec.callerRng=rng.filter(r=>r.origin==='caller_r').length;rec.playSamplePitchRng=rng.filter(r=>r.origin==='playSample_pitch').length;
   rec.startAttempts=trace.filter(e=>e.type==='src.start.attempt').length;rec.startSuccesses=trace.filter(e=>e.type==='src.start.success').length;
   rec.immediateDisconnects=trace.filter(e=>e.type==='src.disconnect').length;rec.gainValue=gain.gain.value;rec.rate=src.playbackRate.value;
   assert.equal(backendEntered,1);assert.equal(rec.startAttempts,1);assert.equal(rec.callerRng,1);assert.equal(rec.playSamplePitchRng,1);assert.equal(rec.errorPropagated,throwing);
   assert.equal(rec.normalReturnSameSource,!throwing);assert.equal(rec.startSuccesses,throwing?0:1);assert.equal(timers.length,1);
   assert.equal(rec.immediate.count,throwing&&candidate?0:1);assert.equal(rec.immediate.nodes.length,rec.immediate.count);
   assert.equal(rec.immediateDisconnects,throwing&&candidate?1:0);
   assert.equal(rec.immediate.queue.length,throwing?1:0);assert.equal(rec.immediate.lastT.ghost_laugh,100);
   assert.equal(rec.beforeFlush.queue[0].pri??0,0);assert.equal(rec.rate,1.1856);assert.equal(rec.gainValue,.8);
   const atStart=trace.find(e=>e.type==='src.start.attempt').active;assert.equal(atStart.nodes[0].pri,9);assert.equal(atStart.count,1);
   phase='held-timeout';clock=800;timers[0].callback();rec.afterTimer=state();assert.equal(rec.afterTimer.count,0);assert.equal(rec.afterTimer.nodes.length,0);
   phase='late-ended-and-duplicate-timer';src.onended();timers[0].callback();src.onended();rec.afterLateEnded=state();assert.deepEqual(rec.afterLateEnded,rec.afterTimer);
   rec.stopCalls=trace.filter(e=>e.type==='src.stop').length;rec.sourceDisconnects=trace.filter(e=>e.type==='src.disconnect').length;rec.gainDisconnects=trace.filter(e=>e.type==='gain.disconnect').length;
   assert.equal(rec.stopCalls,0);assert.equal(rec.sourceDisconnects,1);assert.equal(rec.gainDisconnects,1);
   rec.timerCount=timers.length;rec.timerDelayMs=timers[0].delay;
   rec.immediateRecoveryCriterion=rec.immediate.count===0;rec.audibleVerified=false;
  }catch(e){rec.status='FAIL';rec.assertionError=e.stack;}
  records.push(rec);
 }
 const forGroup=records.filter(r=>r.sourceFiles===group.files),normal=forGroup.filter(r=>r.inputKind==='normal vacancy'),failure=forGroup.filter(r=>r.inputKind==='start exception');
 const comparison={files:group.files,status:'PASS',normalEqual:false,errorAndQueuePreserved:false,currentRedMemoryGreen:false};
 try{
  assert.deepEqual(normal[0].trace,normal[1].trace);assert.deepEqual(normal[0].rngTrace,normal[1].rngTrace);assert.deepEqual(normal[0].immediate,normal[1].immediate);assert.deepEqual(normal[0].afterLateEnded,normal[1].afterLateEnded);comparison.normalEqual=true;
  assert.deepEqual(failure[0].error,failure[1].error);assert.deepEqual(failure[0].rngTrace,failure[1].rngTrace);assert.deepEqual(failure[0].immediate.queue,failure[1].immediate.queue);assert.deepEqual(failure[0].immediate.lastT,failure[1].immediate.lastT);assert.deepEqual(failure[0].afterTimer,failure[1].afterTimer);comparison.errorAndQueuePreserved=true;
  assert.equal(failure[0].immediateRecoveryCriterion,false);assert.equal(failure[1].immediateRecoveryCriterion,true);comparison.currentRedMemoryGreen=true;
 }catch(e){comparison.status='FAIL';comparison.error=e.message;}comparisons.push(comparison);
}
const keywords='ghost_laugh|_playSampleNow|_activeNodeCnt|_activeNodes|src.start|_nd._dn|onended|30ms';
const docsAt=new Date().toISOString(),docs=execFileSync('rg',['-n',keywords,'docs/'],{cwd:ROOT,encoding:'utf8'}),lines=docs.split('\n').filter(Boolean),files=[...new Set(lines.map(l=>l.split(':')[0]))];
const preservation=reads.map(r=>({path:r.path,before:r.sha256,after:sha(fs.readFileSync(r.path))})),preserved=preservation.every(r=>r.before===r.after);
const failed=records.filter(r=>r.status==='FAIL').length+comparisons.filter(r=>r.status==='FAIL').length,completedAt=new Date().toISOString();
const kst=t=>new Date(new Date(t).getTime()+32400000).toISOString().replace('T',' ').replace('Z',' KST');
const sourceMeta=sources.map(s=>({file:ROOT+'/'+s.file,sha256:s.sha256,fingerprint:s.fingerprint,priorHistoricalSHA:prior.sources.find(p=>p.file===ROOT+'/'+s.file)?.sha256,blocks:s.blocks.map(({code,...b})=>b)}));
const rows=records.map(r=>`| ${r.id} | ${r.errorPropagated}/${r.normalReturnSameSource} | ${r.immediate?.count}/${r.immediate?.nodes.length}/${r.immediate?.queue.length} | ${r.immediateDisconnects} | ${r.afterTimer?.count}/${r.afterTimer?.nodes.length}/${r.afterTimer?.queue.length} | ${r.stopCalls}/${r.sourceDisconnects}/${r.gainDisconnects} | ${r.callerRng}/${r.playSamplePitchRng} | ${r.status} |`).join('\n');
const sourceRows=sources[0].blocks.map(b=>`| ${b.name} | ${b.line}/${sources[1].blocks.find(x=>x.name===b.name).line} | ${b.sha256} | ${b.sha256===sources[1].blocks.find(x=>x.name===b.name).sha256?'동일':'상이'} |`).join('\n');
const report=`# SOUND-start-failure-0543 — src.start 예외와 즉시 회수

**현행 즉시 회수 기준 RED → 최소 메모리 후보 GREEN**, 정상 대조 원문/후보 동등. 새 입력은 start예외1·정상여유1뿐이며 원문/후보 총${records.length}실행, 비교${comparisons.length}건, assertion FAIL${failed}. 양판 동일 source는${groups.size}그룹만 실행했다. 이전3/7/31/84 실행/import/합산0. productionApplied=false, priorityPolicyAdopted=false. source PASS ≠ runtime/visual/listening/제품 PASS.

| 근거 | 실제 기록과 한계 |
|---|---|
| 수신·Read | 감독 채팅01a0fb1e-4ec3-7dd3-bba2-f87518e881fa 지시; 첫 TASK cat chunk f8b985 exit0. 정확 수신/첫Read 시각 null. TASK/COMMON/AGENTS/현재담당표/사운드SSOT 실제Read SHA와 후속시각 evidence 기록. |
| 담당·경로 | Codex SOUND/01a0faaf-956a-74a3-9bf1-77032f124e2d. cwd/realpath ${ROOT}. 쓰기는 이 새 폴더 checks.mjs/result.md/evidence.json3개뿐; TASK/이전산출/생산/공유docs 보존. |
| 제공 근거 | TASK가 제공한 2026-10-02T05:42 전후 원격검증commit f2e70ef7c9c663fdd69e925bc379b6d6f8bcaa9c와 생산SHA는 제공관측시점 근거. Git조회0/독립현재HEAD null/Changes null; count는 감독추적. 이전6c77/c40e/7e694950은 역사입력. |
| 새 실행 | ${startedAt}→${completedAt} UTC / ${kst(startedAt)}→${kst(completedAt)}. ${process.execPath}, ${process.version}, exit${failed||!preserved?1:0}. 읽은 입력 SHA보존=${preserved}. |

| 실제 source | 본편/easy 시작행 | SHA256 | 양판 |
|---|---:|---|---|
${sourceRows}

현재 전체 SHA 본편=${sources[0].sha256}, easy=${sources[1].sha256}, node-main=${sha(nodeMain)}. 제공SHA/이전SHA와 현재값은 evidence에서 별도로 기록하며 동일성을 추측하지 않는다.

| id | 원예외 전달/원 src return | 즉시 count/nodes/queue | 즉시disconnect | timer후 count/nodes/queue | stop/src/gain disconnect총 | caller/pitch RNG | 검수 |
|---|---|---|---:|---|---|---|---|
${rows}

현행은 start예외 후 count1/activeNodes1이 남고 예약700ms 콜백 수동실행 뒤0/0으로 회수된다. 영구 누수로 판정하지 않는다. 메모리 후보는 같은 원예외 객체를 그대로 재throw하면서 actual _nd._dn을 즉시 실행해0/0이 된다. 이미예약한 timer는 취소/변경하지 않고 뒤늦은 onended·중복timer가 _d guard에서 중복회수를 막았다. stop호출0이며 시작하지 못한 소스를 억지stop하지 않는다.

| 메모리1곳 | exact fragment / 보존 |
|---|---|
| _playSampleNow | \`${old}\` → \`${patch}\`. 원/후보 fragment·함수SHA evidence. 실제원문 backend/내부_dn 실행, 생산patch0. |
| 정상 | 원문/후보 src return동일·trace완전동등·priority9/gain0.8/rate1.1856/timer700ms 유지. |
| dispatcher 실패 | _sfxFrameReset로 전달된 원예외 때문에 큐정리행에 도달하지 않아 원문/후보 모두 queue1 유지. lastT.ghost_laugh100/queue pri0/callerRNG1+pitchRNG1 동일. 큐를 추가flush/수정하지 않음. |
| 입력/대역 | active0·loaded duration0.2초 buffer·clock100ms·pan0. 실제 _r/playSample/flush/backend/priority/_dn 사용. WebAudio create/start/stop/disconnect·mbus/sfxVol·identity보이스·timer/plainclock만 대역. start만 FixtureStartError를 던지며 create/panner 등 다른실패0. 실제장치실패 관측 아님. |
| 한계 | 합성 start성공도 청취성공 아님. timer수동실행은 실시간 검수 아님. 등록/전체pickup/저장/포화/모바일/패키지/다른실패/실노드0. RNG는 이 sample호출 구간만. |

docs 전체 rg ${lines.length}행/${files.length}파일; 명령/목록/출력SHA evidence. 공유docs/보호2_3쓰기0. 사운드SSOT에 총괄이 인수할 정확한 canonical 문안:

> | id / 위치 | 현행 관찰과 미적용 후보 |
> |---|---|
> | _playSampleNow / src.start | 노드count증가·activeNodes등록·timeout예약 후 start. start가 예외를 던지면 즉시등록노드가 남고 예약정리_dn에서 회수됨. duration0.2초 합성입력은700ms 예약이며 실제시간측정이 아님. |
> | 미적용 실패정리 후보 | start예외 catch에서 actual _nd._dn 호출 뒤 같은 예외를 throw. 즉시count/nodes0, 기존timer·lateonended 중복회수guard 유지. 정상return/priority9/큐·dedup·RNG 불변. productionApplied=false/priorityPolicyAdopted=false. |
> | 전달·한계 | flush로 예외전달 시 큐정리행 미실행으로 해당fixture queue1 유지. 후보는 이별도계약을 바꾸지 않음. 합성WebAudio·수동timer source검수이며 실제장치/청취/게임 미검수. |

다음 Gate는 원총괄의 이 최소 실패정리 후보 검토·생산/docs 순차인수와 별도 허가된 실제장치/게임 검수다. 새업무/세션/메시지·Git·서버·UI·빌드·설치·파일삭제/이동/cleanup0. 외부skill/API/MCP는 이source경계에 필요 없어 사용0; 실제도구는 functions.exec/exec_command/apply_patch, Node fs/vm/crypto/Acorn, rg다.
`;
fs.writeFileSync(OWN+'/result.md',report);
const evidence={taskId:'SOUND-start-failure-0543',provider:'Codex',chatId:'01a0faaf-956a-74a3-9bf1-77032f124e2d',supervisorChatId:'01a0fb1e-4ec3-7dd3-bba2-f87518e881fa',sessionId:null,status:failed||!preserved?'FAIL':'CURRENT_RED_MEMORY_GREEN_NORMAL_EQUIVALENT',productionApplied:false,priorityPolicyAdopted:false,
 receipt:{firstTaskReadChunk:'f8b985',exitCode:0,exactInboundTimestamp:null,firstReadAt:null},execution:{startedAt,completedAt,startedAtKST:kst(startedAt),completedAtKST:kst(completedAt),node:process.execPath,version:process.version,uniqueSourceGroups:groups.size,uniqueInputs:2,sourceExecutions:records.length,comparisons:comparisons.length,assertionFailures:failed,exitCode:failed||!preserved?1:0,command:[process.execPath,'tools/team-followup-20261002/supervisor-next/SOUND/SOUND-start-failure-0543/checks.mjs'],old3_7_31_84Reruns:0},
 paths:{cwd:process.cwd(),rootReal:fs.realpathSync(ROOT),ownerReal:fs.realpathSync(OWN),initialFiles},reads,sources:sourceMeta,memoryEdits,records,comparisons,preservation,allReadInputsBytePreserved:preserved,
 providedHistorical:{source:'TASK coordinator-provided at approximately 2026-10-02T05:42 UTC, not independent Git query',commit:'f2e70ef7c9c663fdd69e925bc379b6d6f8bcaa9c',game:'2e45ee0e9ad909b378bf1a7b864818ce442a4c3e17b12360b42e363dc7d0bd94',easy:'3e5969ca139497c2efb312dc720ab53eb42a8d1912c8288caa2ce858cfd5120a',node:'541ff8e6f57db862ddbb1b148ee37a3a8e0da1e16293bc8343a0bc4144d80daf'},currentHead:null,currentChanges:null,nodeMainActualSha256:sha(nodeMain),
 priorAcceptedOnly:{source:'continuous/SOUND/evidence.json',execution:prior.execution,rerun:0,import:0},
 docsSearch:{at:docsAt,command:['rg','-n',keywords,'docs/'],exitCode:0,lines:lines.length,fileCount:files.length,files:files.map(p=>ROOT+'/'+p),outputSha256:sha(docs),canonicalProposal:OWN+'/result.md',writes:0},
 boundary:{actual:fn.concat(['internal _dn']),stubs:['WebAudio source/gain/bus methods','synthetic loaded buffer duration0.2','src.start throws same synthetic error in failure input only','held700ms callback/manual late onended','identity voice mapper','clock and deterministic counted Math.random'],runtimeExecuted:false,audibleVerified:false,realDeviceFailureObserved:false,sourcePassIsNotRuntimeVisualListeningPass:true},
 tools:{actual:['functions.exec','exec_command','apply_patch','Node fs/vm/crypto','acorn','rg'],skills:[],externalAPI:[],MCP:[]},prohibited:{productionWrites:0,sharedDocsWrites:0,ownerOutsideWrites:0,Git:0,server:0,HTTP:0,game:0,UI:0,build:0,installation:0,realAudioContext:0,fetch:0,decode:0,realTimer:0,listening:0,audioFiles:0,deletion:0,moving:0,cleanup:0,messages:0,newSession:0,subteam:0},
 artifacts:['checks.mjs','result.md'].map(f=>({path:OWN+'/'+f,sha256:sha(fs.readFileSync(OWN+'/'+f))}))};
fs.writeFileSync(OWN+'/evidence.json',JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({status:evidence.status,execution:evidence.execution,preserved,records:records.map(({id,status,immediate,afterTimer,errorPropagated,normalReturnSameSource,assertionError})=>({id,status,immediate,afterTimer,errorPropagated,normalReturnSameSource,assertionError})),comparisons,docs:{lines:lines.length,files:files.length}},null,2));process.exitCode=evidence.execution.exitCode;
