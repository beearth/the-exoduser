import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { parseExpressionAt } from 'acorn';
const ROOT='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const REL='tools/team-followup-20261002/supervisor-next/SOUND/SOUND-frame-queue-exception-finalization-hb1014';
const OWN=ROOT+'/'+REL,sha=b=>createHash('sha256').update(b).digest('hex');
const startedAt=new Date().toISOString(),kst=t=>new Date(new Date(t).getTime()+32400000).toISOString().replace('T',' ').replace('Z',' KST');
assert.equal(process.cwd(),ROOT);assert.equal(fs.realpathSync(ROOT),ROOT);assert.equal(fs.realpathSync(OWN),OWN);
assert.equal(fileURLToPath(new URL('.',import.meta.url)).replace(/\/$/,''),OWN);
const initialOwnedFiles=fs.readdirSync(OWN);assert.ok(initialOwnedFiles.every(f=>['TASK.md','checks.mjs','result.md'].includes(f)));
for(const f of initialOwnedFiles)assert.equal(fs.lstatSync(OWN+'/'+f).isSymbolicLink(),false);
const reads=[];function read(p){const bytes=fs.readFileSync(ROOT+'/'+p);reads.push({path:ROOT+'/'+p,at:new Date().toISOString(),sha256:sha(bytes),bytes:bytes.length});return bytes.toString('utf8');}
for(const p of [REL+'/TASK.md','tools/team-followup-20261002/continuous/COMMON.md','AGENTS.md','docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md','docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/PROVIDER-HALVES-20261002.md','docs/6사운드디자인/6사운드디자인.md','docs/6사운드디자인/SOUND_SAMPLE_START_FAILURE_20261002.md','tools/team-followup-20261002/supervisor-next/SOUND/SOUND-start-failure-0543/TASK.md','tools/team-followup-20261002/supervisor-next/SOUND/SOUND-start-failure-0543/result.md'])read(p);
const functions=['_sfxFrameReset','_playSampleNow','_r','playSample','_evictLowest','_sfxPri','_sfxCat','_isFootstepSfx','_isSkillSfx'];
const constants=['_MAX_ACTIVE_NODES','_SFX_MAX','_SFX_PER_FRAME','_SFX_PRI','_SKILL_SFX_KEYS','_MAX_PROJ_NODES','_MAX_HIT_NODES','_MAX_STEP_NODES'];
function extract(s,n,constant=false){const anchor=constant?'const '+n+'=':'function '+n+'(',start=s.indexOf(anchor);assert.ok(start>=0,n);const ast=parseExpressionAt(s,constant?start+anchor.length:start,{ecmaVersion:'latest'}),code=s.slice(start,ast.end)+(constant?';':'');return {name:n,code,sha256:sha(code),line:s.slice(0,start).split('\n').length,endLine:s.slice(0,ast.end).split('\n').length};}
const sources=['game.html','game-easy-test.html'].map(file=>{const source=read(file),blocks=[...functions.map(n=>extract(source,n)),...constants.map(n=>extract(source,n,true))];
 const calls=source.split('\n').flatMap((line,i)=>line.includes('_sfxFrameReset()')?[{line:i+1,text:line.trim()}]:[]);
 return {file,sha256:sha(source),blocks,callerSites:calls,callerSitesSha256:sha(JSON.stringify(calls)),fingerprint:sha(blocks.map(b=>b.code).join('\n'))};});
const groups=new Map();for(const s of sources){if(groups.has(s.fingerprint))groups.get(s.fingerprint).files.push(s.file);else groups.set(s.fingerprint,{...s,files:[s.file]});}
const records=[],memoryEdits=[],comparisons=[];
for(const group of groups.values()){
 const original=group.blocks.find(b=>b.name==='_sfxFrameReset').code;
 const loop='  for(let i=0;i<_sfxQueue.length;i++){';
 const tail="  _sfxQueue.length=0;\n  for(const k in _sfxFrameCnt)_sfxFrameCnt[k]=0;\n  if(SFX._sbSndCd>0)SFX._sbSndCd--;";
 assert.equal(original.split(loop).length-1,1);assert.equal(original.split(tail).length-1,1);
 const candidate=original.replace(loop,'  try{\n'+loop).replace(tail,'  }finally{\n'+tail+'\n  }');
 assert.ok(group.blocks.find(b=>b.name==='_playSampleNow').code.includes('catch(e){_nd._dn();throw e;}'),'adopted start cleanup must be present');
 memoryEdits.push({files:group.files,target:'_sfxFrameReset',originalFunction:original,candidateFunction:candidate,originalSha256:sha(original),candidateSha256:sha(candidate),edits:[{old:loop,new:'  try{\n'+loop},{old:tail,new:'  }finally{\n'+tail+'\n  }'}],productionApplied:false});
 for(const failure of [true,false])for(const memory of [false,true]){
  let clock=100,phase='enqueue',origin='playSample_pitch',injectedOnce=false,ctx;
  const events=[],rng=[],nodes=[],timers=[];const originalError=new Error('synthetic second queued sample start failure');originalError.name='FixtureQueueStartError';
  const event=(type,data={})=>events.push({index:events.length,phase,clockMs:clock,type,...data});
  const snapshot=()=>JSON.parse(vm.runInContext('JSON.stringify({frameT:_sfxFrameT,activeCount:_activeNodeCnt,nodes:_activeNodes.map(n=>({key:n.key,pri:n.pri})),queue:_sfxQueue,frameCounts:_sfxFrameCnt,lastT:_sfxLastT,deathCd:_deathSfxCd,hitCd:_hitSfxCd,mPlaying:_mSfxPlaying,sbCd:SFX._sbSndCd})',ctx));
  const math=Object.create(Math);math.random=()=>{const value=[.25,.75,.5,.125,.625,.875][rng.length%6];rng.push({index:rng.length,phase,origin,value});return value;};
  const buffers=Object.fromEntries(['ghost_laugh','voice_fixture_second','voice_fixture_tail'].map(key=>[key,{duration:.2,fixtureKey:key}]));
  const forbidden=n=>()=>{throw new Error('forbidden '+n);};
  const audio={get currentTime(){return clock/1000;},createBufferSource(){const id=nodes.length;const node={id,buffer:null,playbackRate:{value:1},onended:null,connect(t){event('source.connect',{id,target:t.id});},start(at){const key=node.buffer.fixtureKey;event('start.attempt',{id,key,at,rate:node.playbackRate.value});if(failure&&key==='voice_fixture_second'&&!injectedOnce){injectedOnce=true;event('start.throw',{id,key});throw originalError;}event('start.success',{id,key});},stop(){event('source.stop',{id});},disconnect(){event('source.disconnect',{id});}};nodes.push(node);event('source.create',{id});return node;},createGain(){const id='gain'+nodes.at(-1).id;return {id,gain:{value:1},connect(t){event('gain.connect',{id,target:t.id});},disconnect(){event('gain.disconnect',{id});}};},createStereoPanner:forbidden('panner'),decodeAudioData:forbidden('decode')};
  const sandbox={Math:math,IS_MOBILE:false,_gxVolMul:1,_charIdx:0,performance:{now:()=>clock},_silvertailVoiceKey:k=>k,_audioBuffers:buffers,_sampleFiles:{},_audioLoadPending:{},actx:()=>audio,mbus:()=>({id:'plain-bus'}),sfxVol:()=>1,
   _deathSfxCd:2,_hitSfxCd:3,_mSfxPlaying:7,SFX:{_sbSndCd:3},_actx:{state:'running'},_resumeAudioCtx:forbidden('resume'),fetch:forbidden('fetch'),AudioContext:forbidden('AudioContext'),setTimeout:(callback,delay)=>{assert.equal(delay,700);timers.push({callback,delay,nodeId:nodes.at(-1).id});event('timer.schedule',{delay,nodeId:nodes.at(-1).id});return timers.length;}};
  ctx=vm.createContext(sandbox);
  vm.runInContext('let _activeNodeCnt=0,_sfxFrameT=0;const _activeNodes=[],_sfxQueue=[],_sfxLastT={},_sfxFrameCnt={ghost_laugh:2,g_voice:5};\n'+group.blocks.map(b=>memory&&b.name==='_sfxFrameReset'?candidate:b.code).join('\n'),ctx,{timeout:1000});
  const realR=ctx._r;ctx._r=(...a)=>{const prev=origin;origin='caller_r';try{return realR(...a);}finally{origin=prev;}};
  const realCat=ctx._sfxCat;ctx._sfxCat=k=>{const cat=realCat(k);event('category',{key:k,cat});return cat;};
  const realBackend=ctx._playSampleNow;ctx._playSampleNow=(...a)=>{event('backend.enter',{key:a[0],vol:a[1],rate:a[2],startTime:a[3],pan:a[4],priOverride:a[5]??null,priority:ctx._sfxPri(a[0])});const returned=realBackend(...a);event('backend.return',{key:a[0],sameSource:returned===nodes.at(-1)});return returned;};
  const rec={id:(failure?'second-start-exception':'normal-three-queue')+(memory?'-memory':'-current'),failure,memory,sourceFiles:group.files,status:'PASS',events,rngTrace:rng};
  try{
   // Queue [ghost(pri1),second(pri0),tail(pri0)] produced by original enqueue logic.
   ctx.playSample('voice_fixture_second',.4,ctx._r(1.2,.1));ctx.playSample('voice_fixture_tail',.3,ctx._r(1.2,.1));ctx.playSample('ghost_laugh',.8,ctx._r(1.2,.1),1);
   rec.before=snapshot();assert.deepEqual(rec.before.queue.map(q=>q.key),['ghost_laugh','voice_fixture_second','voice_fixture_tail']);assert.deepEqual(rec.before.queue.map(q=>q.pri??0),[1,0,0]);
   const reset=(name)=>{phase=name;try{ctx._sfxFrameReset();return {threw:false,sameError:false};}catch(e){event('fixture.error',{sameError:e===originalError,name:e.name});return {threw:true,sameError:e===originalError,name:e.name,message:e.message};}};
   rec.frame1Error=reset('frame1');rec.afterFrame1=snapshot();assert.equal(rec.frame1Error.threw,failure);assert.equal(rec.frame1Error.sameError,failure);
   assert.equal(rec.afterFrame1.queue.length,failure&&!memory?3:0);assert.deepEqual(rec.afterFrame1.frameCounts,failure&&!memory?{ghost_laugh:2,g_voice:5}:{ghost_laugh:0,g_voice:0});assert.equal(rec.afterFrame1.sbCd,failure&&!memory?3:2);
   assert.equal(rec.afterFrame1.activeCount,failure?1:3);assert.equal(rec.afterFrame1.nodes.length,rec.afterFrame1.activeCount);
   assert.equal(rec.afterFrame1.deathCd,1);assert.equal(rec.afterFrame1.hitCd,2);assert.equal(rec.afterFrame1.mPlaying,0);
   clock=116;rec.frame2Error=reset('frame2');rec.afterFrame2=snapshot();assert.equal(rec.frame2Error.threw,false);assert.equal(rec.afterFrame2.queue.length,0);assert.equal(rec.afterFrame2.sbCd,failure&&!memory?2:1);
   const keys=frame=>events.filter(e=>e.phase===frame&&e.type==='start.success').map(e=>e.key);
   rec.frame1Successes=keys('frame1');rec.frame2Successes=keys('frame2');assert.deepEqual(rec.frame1Successes,failure?['ghost_laugh']:['ghost_laugh','voice_fixture_second','voice_fixture_tail']);
   assert.deepEqual(rec.frame2Successes,failure&&!memory?['ghost_laugh','voice_fixture_second','voice_fixture_tail']:[]);
   rec.firstSuccessReplay=rec.frame2Successes.includes('ghost_laugh');rec.desiredNoReplay=!rec.firstSuccessReplay;
   rec.callerRng=rng.filter(r=>r.origin==='caller_r').length;rec.pitchRng=rng.filter(r=>r.origin==='playSample_pitch').length;assert.equal(rec.callerRng,3);assert.equal(rec.pitchRng,3);assert.ok(rng.every(r=>r.phase==='enqueue'));
   assert.deepEqual(rec.before.lastT,rec.afterFrame2.lastT);rec.categoryAndPriority=rec.before.queue.map(q=>({key:q.key,category:realCat(q.key),priority:ctx._sfxPri(q.key),queuePri:q.pri??0}));
   assert.deepEqual(rec.categoryAndPriority.map(q=>q.category),['ghost_laugh','g_voice','g_voice']);assert.ok(rec.categoryAndPriority.every(q=>q.priority===9));
   phase='held-callback-reclaim';clock=800;for(const timer of timers)timer.callback();for(const node of nodes)node.onended();for(const timer of timers)timer.callback();rec.afterCallbacks=snapshot();assert.equal(rec.afterCallbacks.activeCount,0);assert.equal(rec.afterCallbacks.nodes.length,0);
   rec.stopCalls=events.filter(e=>e.type==='source.stop').length;assert.equal(rec.stopCalls,0);rec.createdNodes=nodes.length;rec.timerCount=timers.length;
   assert.equal(events.filter(e=>e.type==='source.disconnect').length,nodes.length);assert.equal(events.filter(e=>e.type==='gain.disconnect').length,nodes.length);
  }catch(e){rec.status='FAIL';rec.assertionError=e.stack;}records.push(rec);
 }
 const scoped=records.filter(r=>r.sourceFiles===group.files),normal=scoped.filter(r=>!r.failure),failure=scoped.filter(r=>r.failure);const comparison={files:group.files,status:'PASS'};
 try{assert.deepEqual(normal[0].events,normal[1].events);assert.deepEqual(normal[0].rngTrace,normal[1].rngTrace);assert.deepEqual(normal[0].afterFrame1,normal[1].afterFrame1);assert.deepEqual(normal[0].afterFrame2,normal[1].afterFrame2);comparison.normalFullTraceEqual=true;
  assert.deepEqual(failure[0].frame1Error,failure[1].frame1Error);assert.deepEqual(failure[0].rngTrace,failure[1].rngTrace);assert.deepEqual(failure[0].before,failure[1].before);
  assert.equal(failure[0].desiredNoReplay,false);assert.equal(failure[1].desiredNoReplay,true);comparison.sameErrorAndRngPreserved=true;comparison.currentRedMemoryGreen=true;
 }catch(e){comparison.status='FAIL';comparison.error=e.stack;}comparisons.push(comparison);
}
// Exactly one docs-wide keyword search after fixture code; no shared-doc writes.
const docsAt=new Date().toISOString(),keyword='ghost_laugh|_sfxFrameReset|_playSampleNow|_sfxQueue|_sfxFrameCnt|_sbSndCd|failed flush|큐 부모 실패|큐 실패';
const docsOut=execFileSync('rg',['-n',keyword,'docs/'],{cwd:ROOT,encoding:'utf8'}),docsLines=docsOut.split('\n').filter(Boolean),docsFiles=[...new Set(docsLines.map(l=>l.split(':')[0]))];
const preservation=reads.map(r=>({path:r.path,before:r.sha256,after:sha(fs.readFileSync(r.path))}));
const anchors=sources.map(s=>{const now=fs.readFileSync(ROOT+'/'+s.file,'utf8'),blocks=[...functions.map(n=>extract(now,n)),...constants.map(n=>extract(now,n,true))];return {file:s.file,wholeBefore:s.sha256,wholeAfter:sha(now),ownedAnchorsPreserved:blocks.every((b,i)=>b.sha256===s.blocks[i].sha256)};});
const immutablePreserved=preservation.filter(r=>r.path.includes('/supervisor-next/SOUND/')||r.path.endsWith('/continuous/COMMON.md')).every(r=>r.before===r.after);
const failed=records.filter(r=>r.status==='FAIL').length+comparisons.filter(r=>r.status==='FAIL').length,exitCode=failed||!immutablePreserved||anchors.some(a=>!a.ownedAnchorsPreserved)?1:0,completedAt=new Date().toISOString();
const checksSha=sha(fs.readFileSync(OWN+'/checks.mjs'));
const evidence={taskId:'SOUND-frame-queue-exception-finalization-hb1014',provider:'Codex',chatId:'01a0faaf-956a-74a3-9bf1-77032f124e2d',supervisorChatId:'01a0fb1e-4ec3-7dd3-bba2-f87518e881fa',sessionId:null,assignedUTC:'2026-10-02T10:35:54.431195+00:00',firstTaskRead:{chunk:'a07096',exitCode:0,exactTimestamp:null},status:exitCode?'FAIL':'CURRENT_RED_MEMORY_GREEN_NORMAL_EQUAL',productionApplied:false,runtimeAccepted:false,priorityPolicyAdopted:false,
 execution:{startedAt,completedAt,startedAtKST:kst(startedAt),completedAtKST:kst(completedAt),node:process.execPath,version:process.version,command:[process.execPath,REL+'/checks.mjs'],exitCode,uniqueInputs:2,sourceExecutions:records.length,comparisons:comparisons.length,assertionFailures:failed,sourceGroups:groups.size,previousTestsRerun:0,previousScriptsImported:0,rootSkUnclickWork:0},
 ownership:{rootReal:fs.realpathSync(ROOT),ownerReal:fs.realpathSync(OWN),initialOwnedFiles,outputs:['result.md','checks.mjs'],checksSha256:checksSha},reads,sources:sources.map(s=>({...s,file:ROOT+'/'+s.file,blocks:s.blocks.map(({code,...b})=>b)})),memoryEdits,records,comparisons,preservation,anchors,immutablePreserved,currentHead:null,currentChanges:null,parentProvidedHistoricalCommit:'6b865637',
 docsSearch:{at:docsAt,command:['rg','-n',keyword,'docs/'],exitCode:0,lines:docsLines.length,fileCount:docsFiles.length,files:docsFiles.map(f=>ROOT+'/'+f),outputSha256:sha(docsOut),matchedLines:docsLines,writes:0},
 actualSource:functions.concat(['backend internal _dn']),stubs:['prepared buffer objects duration0.2','WebAudio source/gain/bus plain recorders','src.start second queued key throws original Error once only','held700ms timers/manual onended','identity voice mapping','currentTime/performance100/116ms','deterministic counted Math.random'],
 limits:['normal/control covers three distinct keys with g_voice category pair and queue pri1/0/0, no mobile/saturation/repeated-key-volume scaling expansion','actx setup before dispatch try unchanged; failures before loop are not covered','resume remains after finally and is skipped on propagating backend exception; no suspended-context test','candidate discards unprocessed third queue entry along with batch; it does not retry failed or remaining audio','real device failure/audio listening/native/game/package not accepted'],
 tools:{actual:['functions.exec','exec_command','apply_patch','Node fs/vm/crypto','acorn','rg'],skills:[],externalAPI:[],MCP:[]},prohibited:{productionWrites:0,sharedDocsWrites:0,outsideOwnedWrites:0,Git:0,server:0,HTTP:0,game:0,UI:0,build:0,audioDevice:0,realAudioContext:0,realTimer:0,fetch:0,decode:0,image:0,saves:0,installation:0,publishing:0,newChat:0,newTeam:0,subagent:0,messages:0,deletion:0,moving:0,cleanup:0}};
const rows=records.map(r=>`| ${r.id} | ${r.frame1Error?.sameError} | ${r.afterFrame1?.queue.length}/${JSON.stringify(r.afterFrame1?.frameCounts)}/${r.afterFrame1?.sbCd} | ${r.frame1Successes?.join(',')} | ${r.frame2Successes?.join(',')||'없음'} | ${r.callerRng}/${r.pitchRng} | ${r.status} |`).join('\n');
const sourceRows=sources[0].blocks.map(b=>`| ${b.name} | ${b.line}/${sources[1].blocks.find(x=>x.name===b.name).line} | ${b.sha256} | ${b.sha256===sources[1].blocks.find(x=>x.name===b.name).sha256?'동일':'상이'} |`).join('\n');
const report=`# SOUND-frame-queue-exception-finalization-hb1014

현재 중간 예외로 첫 성공음이 다음 reset에서 재실행되는 **RED 재현 → finally 메모리 후보 GREEN**. 무예외3항목 control의 순서/volume/rate/category/priority/queue/RNG/수명/쿨다운 trace가 원문과 완전히 같다. 새 실패1·정상1 입력을 원문/후보 총${records.length}회 실행, 비교${comparisons.length}건, assertion FAIL${failed}, Node exit${exitCode}. 양판 동일 source ${groups.size}그룹만 실행. 이전완료/전체검사/import/root _skUnclick 중복0.

productionApplied=false, runtimeAccepted=false, priorityPolicyAdopted=false. source fixture PASS ≠ 실게임/native/청취/GPU/제품/배포 PASS.

| 영수증 | 실제 근거 |
|---|---|
| 수신·Read | TASK Assigned ${evidence.assignedUTC}; 첫실제Read chunk a07096 exit0. 정확수신/첫Read시각 추정0. COMMON/AGENTS/TEAM_CONTINUATION_POLICY/담당표/사운드SSOT/시작실패정본과 이전보고를 실제읽음, SHA/시각 아래JSON. |
| 작업경로/소유 | ${ROOT} cwd/realpath. 새폴더 result.md/checks.mjs2개만 작성. TASK/공유docs/생산/타WIP/이전산출 쓰기0. |
| 실행 | ${startedAt}→${completedAt} UTC (${kst(startedAt)}→${kst(completedAt)}), ${process.execPath}, ${process.version}, exit${exitCode}. checks SHA=${checksSha}. |
| HEAD/용량 | parent 제공6b865637은역사근거, Git조회0/currentHEAD·Changes=null. Changes80/100은감독관리, 별도capacity중단신호수신0. |

| source | 본편/easy 시작행 | SHA256 | 양판 |
|---|---:|---|---|
${sourceRows}

전체 현재 SHA 본편=${sources[0].sha256}, easy=${sources[1].sha256}. caller site·행·SHA와 실행후고정anchor보존은 아래evidence. 현재 _playSampleNow start catch는 이미생산반영된정본이며 재수정/독립재검사0; 이번 중간실패가 실제로 이함수를 통과하도록 사용했다.

| id | frame1 원Error전달 | frame1 queue/카운터/sbCd | frame1 성공 | frame2 성공 | caller/pitch RNG | 검수 |
|---|---|---|---|---|---|---|
${rows}

원큐는 ghost_laugh(pri1), voice_fixture_second(pri0), voice_fixture_tail(pri0), nodepriority는모두VOICE9. actual playSample의 unshift/push로 구성, ghost카테고리 자체+g_voice2개; clock100/116ms, active0부터 시작, duration0.2초 buffer대역. enqueue callerRNG3/pitchRNG3은ghost포함3항목준비구간이고 flush에는추가RNG0. 임의전역RNG값으로확대하지않음.

현행 frame1에서 첫ghost start성공 뒤 두번째 start가 같은합성Error를throw한다. 이미채택된backend catch는실패노드를즉시회수하지만 부모queue3·frameCounts2/5·sbCd3을남긴다. frame2에서ghost를다시start하고두번째·세번째도실행한다. 메모리finally는원Error를그대로전달하면서queue0·frameCounts0/0·sbCd2로정리해frame2 replay0. 세번째미처리항목도해당배치와함께폐기되며 retry/전역큐정책/pri재설계는추가하지않았다. death/hit 감소와mPlaying리셋은기존선행위치유지, _resumeAudioCtx는기존후행위치유지로backend예외시호출하지않는다.

최소메모리후보(원함수전체/정확SHA/치환fragment는JSON):

\`\`\`js
try {
  // 기존 for 큐 dispatcher 전체를 그대로 실행
} finally {
  _sfxQueue.length=0;
  for(const k in _sfxFrameCnt)_sfxFrameCnt[k]=0;
  if(SFX._sbSndCd>0)SFX._sbSndCd--;
}
// 기존 suspended-context resume 위치 유지
\`\`\`

docs 전체키워드검색 실제1회=${docsLines.length}행/${docsFiles.length}파일. 정확결과/정본별목록/출력SHA 아래JSON. 보호2_3·Q전용blackBean·LOCK/TBD·확정수치·어택티켓금지 유지. 원총괄이생산채택할때반영할 old/new 인계:

| 정본 / 항목 | old 현재 | new 인계(이번은미적용) |
|---|---|---|
| docs/6사운드디자인/6사운드디자인.md / 샘플시작동기실패 표 정상/부모실패 | failed flush가큐clear전throw하여fixture queue1유지; 큐부모실패는별도 | _sfxFrameReset dispatcher를try/finally로보호. backend예외는같은Error전달, queue배치전부폐기·_sfxFrameCnt모든키0·_sbSndCd>0이면1감소. 성공했던앞항목의다음frame재실행0. |
| docs/6사운드디자인/SOUND_SAMPLE_START_FAILURE_20261002.md / 정상/dispatcher | 실패가flush로전달되면queueclear미도달, 큐실패처리인수별도 | backend즉시_dn계약유지. 부모finally후예외전달로중간실패의성공prefix재실행방지. 미처리tail도폐기하며재시도추가0. |
| docs/12퍼포먼스·최적화/12퍼포먼스·최적화.md / 샘플시작실패 부록 정상·정책 | failed flush queue1는별도미수정경계 | 부모dispatcher finally에서queue전부폐기·frameCounts0·sbCd양수일때1감소후같은Error전달. 중간실패의성공prefix는다음reset에서중복start하지않음. 실제장치/시간/성능개선율미검수. |
| docs/CHANGELOG_SYNC.md 및 마스터 인수문서 / 과거 시작실패 인수 | 당시queue/dedup/RNG정책변경0 기록 | 과거기록은수정하지않고 이번부모finally의별도후속인수행을추가. SOURCE후보/미채택과생산채택시점을구분. |
| 위 시스템정본 / 수치·검수상태 | desktop48/mobile16,frame6/3,category2/1,30msdedup,startcatch정본 | 수치·우선순위·볼륨·피치·기존startcatch불변. 새failure/control source검수만, productionApplied=false/runtimeAccepted=false; 통합후표시를별도갱신. |

오디오장치/청취/실시간timer/native/실게임/저장/빌드미검수. create/actx/panner 등다른실패·예외중재진입·suspended-context·모바일/포화/반복동일키전수는확대0. realbackend/_dn/fullflush와명시WebAudio/clock/RNG/heldtimer대역을구분했다. timer수동실행·lateonended는메모리노드회수만이며파일cleanup0. 새blocker없음; 남은Gate는감독검토→원총괄생산/docs순차인수→별도허가실제품검수다. 외부skill/API/MCP필요없어사용0. 독자적다음업무배정0.

## 실행 evidence JSON

\`\`\`json
${JSON.stringify(evidence,null,2)}
\`\`\`
`;
fs.writeFileSync(OWN+'/result.md',report);
console.log(JSON.stringify({status:evidence.status,execution:evidence.execution,records:records.map(({id,status,frame1Successes,frame2Successes,afterFrame1,assertionError})=>({id,status,frame1Successes,frame2Successes,afterFrame1,assertionError})),comparisons,anchors,docs:{lines:docsLines.length,files:docsFiles.length},outputs:[OWN+'/result.md',OWN+'/checks.mjs']},null,2));process.exitCode=exitCode;
