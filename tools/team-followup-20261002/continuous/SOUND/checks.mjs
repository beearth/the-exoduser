import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { parseExpressionAt } from 'acorn';

const ROOT='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const OWN=ROOT+'/tools/team-followup-20261002/continuous/SOUND';
const sha=b=>createHash('sha256').update(b).digest('hex');
const startedAt=new Date().toISOString();
assert.equal(process.cwd(),ROOT);
assert.equal(fs.realpathSync(ROOT),ROOT);
assert.equal(fs.realpathSync(OWN),OWN);
assert.equal(fileURLToPath(new URL('.',import.meta.url)).replace(/\/$/,''),OWN);
const allowed=['TASK.md','checks.mjs','result.md','evidence.json'];
assert.ok(fs.readdirSync(OWN).every(f=>allowed.includes(f)));
for(const f of allowed)if(fs.existsSync(OWN+'/'+f))assert.equal(fs.lstatSync(OWN+'/'+f).isSymbolicLink(),false);
const reads=[];
function read(p){const b=fs.readFileSync(ROOT+'/'+p);reads.push({path:ROOT+'/'+p,readAt:new Date().toISOString(),sha256:sha(b),bytes:b.length});return b.toString('utf8');}
for(const p of ['AGENTS.md','tools/team-followup-20261002/continuous/COMMON.md','tools/team-followup-20261002/continuous/SOUND/TASK.md',
 'docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md','docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/PROVIDER-HALVES-20261002.md',
 'docs/6사운드디자인/6사운드디자인.md','docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md',
 'tools/team-followup-20261002/codex-half/SOUND/result.md','tools/team-followup-20261002/project-teams/SOUND/result.md'])read(p);
const previous=JSON.parse(read('tools/team-followup-20261002/codex-half/SOUND/evidence.json'));
const staticPrevious=JSON.parse(read('tools/team-followup-20261002/project-teams/SOUND/evidence.json'));
// Prior writer scripts are neither executed nor imported.
const functions=['_boneRegister','_r','playSample','_sfxFrameReset','_playSampleNow','_evictLowest','_sfxPri','_sfxCat','_isFootstepSfx','_isSkillSfx'];
const constants=['_MAX_ACTIVE_NODES','_SFX_MAX','_SFX_PER_FRAME','_SFX_PRI','_SKILL_SFX_KEYS','_MAX_PROJ_NODES','_MAX_HIT_NODES','_MAX_STEP_NODES'];
function extract(s,name,c=false){const anchor=c?'const '+name+'=':'function '+name+'(';const start=s.indexOf(anchor);assert.ok(start>=0,name);const ast=parseExpressionAt(s,c?start+anchor.length:start,{ecmaVersion:'latest'});const code=s.slice(start,ast.end)+(c?';':'');return {name,code,start,end:ast.end,line:s.slice(0,start).split('\n').length,endLine:s.slice(0,ast.end).split('\n').length,sha256:sha(code),bytes:Buffer.byteLength(code)};}
const sources=['game.html','game-easy-test.html'].map(file=>{const s=read(file);const blocks=[...functions.map(n=>extract(s,n)),...constants.map(n=>extract(s,n,true))];return {file,sha256:sha(s),blocks,fingerprint:sha(blocks.map(b=>b.code).join('\n'))};});
const groups=new Map();for(const s of sources){if(groups.has(s.fingerprint))groups.get(s.fingerprint).files.push(s.file);else groups.set(s.fingerprint,{...s,files:[s.file]});}
const original="playSample('ghost_laugh',.8,_r(1.2,.1))",candidate="playSample('ghost_laugh',.8,_r(1.2,.1),1)";
const memoryEdits=[],records=[];
const scenarios=[
 {id:'backend-vacancy',ko:'여유 노드·현행 등록·실제 backend',seeds:0,lower:false,pri:false,expect:{starts:1,evictCalls:0,evicted:false,stops:0,active:1}},
 {id:'backend-voice9-equal48',ko:'VOICE9 동급48·메모리 우선큐·실제 거부',seeds:48,lower:false,pri:true,expect:{starts:0,evictCalls:1,evicted:false,stops:0,active:48}},
 {id:'backend-voice9-with-hit2',ko:'VOICE9 47+HIT2 1·메모리 우선큐·낮은 노드 교체',seeds:48,lower:true,pri:true,expect:{starts:1,evictCalls:1,evicted:true,stops:1,active:48}}
];
for(const g of groups.values()){
 const reg=g.blocks.find(b=>b.name==='_boneRegister');assert.equal(reg.code.split(original).length-1,1);
 const changed=reg.code.replace(original,candidate);
 memoryEdits.push({files:g.files,target:'_boneRegister',changes:1,original,candidate,originalSha256:sha(original),candidateSha256:sha(candidate),originalFunctionSha256:reg.sha256,memoryFunctionSha256:sha(changed),productionApplied:false,priorityPolicyAdopted:false});
 for(const scenario of scenarios){
  let clock=1,phase='prepare',origin='playSample_pitch';
  const events=[],rng=[],timers=[],created=[],notifications=[];let ctx;
  const event=(type,data={})=>events.push({index:events.length,type,phase,clockMs:clock,...data});
  const math=Object.create(Math);math.random=()=>{const value=[.25,.75][rng.length%2];rng.push({index:rng.length,phase,origin,clockMs:clock,value});return value;};
  const forbidden=name=>()=>{throw new Error('forbidden actual operation: '+name);};
  const bus={id:'synthetic-master-bus'};
  const audio={get currentTime(){return clock/1000;},createBufferSource(){
   const n={id:created.length,buffer:null,playbackRate:{value:1},onended:null,
    connect(target){event('src.connect',{id:n.id,target:target.id});},
    start(at){event('src.start',{id:n.id,key:n.buffer?.fixtureKey,startTime:at,rate:n.playbackRate.value});},
    stop(){event('src.stop',{id:n.id,key:n.buffer?.fixtureKey});},
    disconnect(){event('src.disconnect',{id:n.id,key:n.buffer?.fixtureKey});}};
   created.push(n);event('createBufferSource',{id:n.id});return n;
  },createGain(){const n={id:'gain-'+created.at(-1).id,gain:{value:1},connect(target){event('gain.connect',{id:n.id,target:target.id});},disconnect(){event('gain.disconnect',{id:n.id});}};event('createGain',{id:n.id});return n;},createStereoPanner:forbidden('pan branch outside scope'),decodeAudioData:forbidden('decode')};
  const buffers={ghost_laugh:{duration:.2,fixtureKey:'ghost_laugh'}};
  const sandbox={Math:math,IS_MOBILE:false,_gxVolMul:1,_charIdx:0,performance:{now:()=>clock},
   INV:{ossCollect:{}},P:{x:0,y:0},ANC_ROSTER:[{id:'iron_warlord',ko:'철갑 전대',en:'Iron Warlord'}],
   _ossSetComplete:()=>false,_T:s=>s,_L:k=>k,_rarName:()=> '일반',notify:s=>{notifications.push(s);event('notify');},addTxt:forbidden('unlock UI'),shake:forbidden('unlock shake'),
   dbSaveForce:forbidden('unexpected save'),_silvertailVoiceKey:k=>k,
   _deathSfxCd:0,_hitSfxCd:0,_mSfxPlaying:0,SFX:{_sbSndCd:0},_actx:null,
   _audioBuffers:buffers,_sampleFiles:{},_audioLoadPending:{},actx:()=>audio,mbus:()=>bus,sfxVol:()=>1,
   setTimeout:(callback,delay)=>{assert.equal(delay,700);timers.push({callback,delay,sourceId:created.at(-1).id,phase});event('timer.schedule',{sourceId:created.at(-1).id,delayMs:delay});return timers.length;},
   fetch:forbidden('fetch'),AudioContext:forbidden('AudioContext'),_resumeAudioCtx:forbidden('resume')};
  ctx=vm.createContext(sandbox);
  vm.runInContext('let _activeNodeCnt=0,_sfxFrameT=0;const _activeNodes=[],_sfxFrameCnt={},_sfxQueue=[],_sfxLastT={};\n'+g.blocks.map(b=>scenario.pri&&b.name==='_boneRegister'?changed:b.code).join('\n'),ctx,{timeout:1000});
  // Wrappers count real function entry/return; every call invokes the original source.
  const actualR=ctx._r;ctx._r=(...a)=>{const prior=origin;origin='caller_r';try{return actualR(...a);}finally{origin=prior;}};
  const actualBackend=ctx._playSampleNow;ctx._playSampleNow=(...a)=>{event('backend.enter',{key:a[0],priOverride:a[5]??null});const r=actualBackend(...a);event('backend.return',{key:a[0],created:!!r});return r;};
  const actualEvict=ctx._evictLowest;ctx._evictLowest=(pri)=>{event('evict.enter',{newPri:pri});const r=actualEvict(pri);event('evict.return',{newPri:pri,result:r});return r;};
  const snapshot=()=>JSON.parse(vm.runInContext('JSON.stringify({count:_activeNodeCnt,nodes:_activeNodes.map(n=>({id:n.src.id,key:n.key,pri:n.pri,startedMs:n._st,hasCleanup:typeof n._dn===\"function\"})),queue:_sfxQueue,lastT:_sfxLastT})',ctx));
  const rec={id:scenario.id,ko:scenario.ko,files:g.files,fingerprint:g.fingerprint,priorityPolicyAdopted:false,productionApplied:false,input:{IS_MOBILE:false,bufferDurationSeconds:.2,clockMs:100,seedCount:scenario.seeds,lowerPriorityNode:scenario.lower,queuePriMemoryOnly:scenario.pri,bonePart:{slot:'bonePart',anc:'iron_warlord',part:'skull',rarity:0,tier:0,name:'철갑 전대의 두개골'}},events,rngTrace:rng,status:'PASS'};
  try{
   for(let i=0;i<scenario.seeds;i++){
    clock=i+1;const key=scenario.lower&&i===47?'monster_hit_fixture':'voice_fixture_'+i;
    buffers[key]={duration:.2,fixtureKey:key};const src=ctx._playSampleNow(key,.2,1,clock/1000,0);assert.ok(src);
    const state=snapshot();assert.equal(state.count,i+1);assert.equal(state.nodes.length,i+1);
   }
   rec.prepared=snapshot();assert.equal(rec.prepared.count,scenario.seeds);assert.equal(rec.prepared.nodes.length,scenario.seeds);
   assert.equal(rng.length,0);clock=100;phase='ghost';
   rec.registered=ctx._boneRegister(rec.input.bonePart);rec.beforeFlush=snapshot();
   ctx._sfxFrameReset();rec.afterFlush=snapshot();
   const ghostEvents=events.filter(e=>e.phase==='ghost');
   rec.callerRng=rng.filter(r=>r.origin==='caller_r').length;rec.playSamplePitchRng=rng.filter(r=>r.origin==='playSample_pitch').length;
   rec.backendEntries=ghostEvents.filter(e=>e.type==='backend.enter'&&e.key==='ghost_laugh').length;
   rec.starts=ghostEvents.filter(e=>e.type==='src.start').length;rec.stops=ghostEvents.filter(e=>e.type==='src.stop').length;
   rec.evictCalls=ghostEvents.filter(e=>e.type==='evict.enter').length;rec.evicted=ghostEvents.some(e=>e.type==='evict.return'&&e.result);
   rec.notifications=notifications.length;rec.saveCalls=0;
   assert.equal(rec.registered,true);assert.equal(rec.notifications,1);assert.equal(Object.keys(sandbox.INV.ossCollect).length,1);
   assert.equal(rec.callerRng,1);assert.equal(rec.playSamplePitchRng,1);assert.equal(rec.backendEntries,1);
   assert.equal(rec.beforeFlush.queue.length,1);assert.equal(rec.beforeFlush.queue[0].key,'ghost_laugh');
   assert.equal(rec.beforeFlush.queue[0].pri??0,scenario.pri?1:0);
   assert.equal(rec.beforeFlush.lastT.ghost_laugh??null,scenario.pri?null:100);
   assert.equal(rec.afterFlush.queue.length,0);assert.equal(rec.starts,scenario.expect.starts);assert.equal(rec.stops,scenario.expect.stops);
   assert.equal(rec.evictCalls,scenario.expect.evictCalls);assert.equal(rec.evicted,scenario.expect.evicted);
   assert.equal(rec.afterFlush.count,scenario.expect.active);assert.equal(rec.afterFlush.nodes.length,scenario.expect.active);
   const newGhost=created.find(n=>n.buffer?.fixtureKey==='ghost_laugh');
   if(scenario.expect.starts){assert.ok(newGhost);assert.equal(newGhost.playbackRate.value,1.1856);
    const activeGhost=rec.afterFlush.nodes.find(n=>n.key==='ghost_laugh');assert.equal(activeGhost.pri,9);
    phase='new-node-end';clock=800;newGhost.onended();rec.afterEnded=snapshot();
    assert.equal(rec.afterEnded.count,scenario.expect.active-1);
    const timer=timers.find(t=>t.sourceId===newGhost.id);timer.callback();newGhost.onended();rec.afterDuplicateCleanup=snapshot();
    assert.deepEqual(rec.afterDuplicateCleanup,rec.afterEnded);
    assert.equal(events.filter(e=>e.type==='src.disconnect'&&e.id===newGhost.id).length,1);
    assert.equal(events.filter(e=>e.type==='gain.disconnect'&&e.id==='gain-'+newGhost.id).length,1);
   }else{assert.equal(newGhost,undefined);assert.deepEqual(rec.afterFlush.nodes,rec.prepared.nodes);}
   if(scenario.lower){const lower=created[47];assert.equal(events.filter(e=>e.type==='src.stop'&&e.id===lower.id).length,1);assert.equal(events.filter(e=>e.type==='src.disconnect'&&e.id===lower.id).length,1);
    const before=snapshot();phase='evicted-node-late-end';lower.onended();timers.find(t=>t.sourceId===lower.id).callback();assert.deepEqual(snapshot(),before);
   }
   phase='final-synthetic-reclaim';clock=1000;
   // Invokes actual source _dn callbacks, never a real timer or file cleanup.
   for(const n of created)n.onended();for(const timer of timers)timer.callback();
   rec.final=snapshot();assert.equal(rec.final.count,0);assert.equal(rec.final.nodes.length,0);
   rec.createdSources=created.length;rec.scheduledSyntheticTimers=timers.length;
   rec.syntheticDisconnections=events.filter(e=>e.type==='src.disconnect').length;
   assert.equal(rec.syntheticDisconnections,created.length);
   rec.collection=sandbox.INV.ossCollect;rec.audibleVerified=false;
  }catch(e){rec.status='FAIL';rec.error=e.stack;}
  records.push(rec);
 }
}
const keyword='ghost_laugh|_boneRegister|_playSampleNow|_evictLowest|_SFX_PRI|30ms|_sfxFrameReset';
const docsAt=new Date().toISOString();const docsOut=execFileSync('rg',['-n',keyword,'docs/'],{cwd:ROOT,encoding:'utf8'});
const lines=docsOut.split('\n').filter(Boolean);const docsFiles=[...new Set(lines.map(l=>l.split(':')[0]))];
const preservedInputs=reads.map(r=>({path:r.path,before:r.sha256,after:sha(fs.readFileSync(r.path))}));
const preserved=preservedInputs.every(p=>p.before===p.after);
const failed=records.filter(r=>r.status==='FAIL').length;const passed=records.length-failed;const completedAt=new Date().toISOString();
const kst=t=>new Date(new Date(t).getTime()+9*3600000).toISOString().replace('T',' ').replace('Z',' KST');
const sourceMetadata=sources.map(s=>({file:ROOT+'/'+s.file,sha256:s.sha256,fingerprint:s.fingerprint,previousWholeFileSha:previous.sources.find(p=>p.file===ROOT+'/'+s.file)?.sha256??null,blocks:s.blocks.map(({code,...b})=>({...b,previousFragmentSha:previous.sources.find(p=>p.file===ROOT+'/'+s.file)?.blocks.find(p=>p.name===b.name)?.sha256??staticPrevious.sources.find(p=>p.file===s.file)?.blocks.find(p=>p.name===b.name)?.sha256??null}))}));
const sourceRows=sources[0].blocks.map(b=>`| ${b.name} | ${b.line}/${sources[1].blocks.find(x=>x.name===b.name).line} | ${b.sha256} | ${b.sha256===sources[1].blocks.find(x=>x.name===b.name).sha256?'동일':'상이'} |`).join('\n');
const resultRows=records.map(r=>`| ${r.id} / ${r.ko} | ${r.prepared?.count}/${r.prepared?.nodes.length} | ${r.input.queuePriMemoryOnly?1:0}/0 | ${r.callerRng}/${r.playSamplePitchRng} | ${r.backendEntries}/${r.evictCalls}/${r.evicted} | ${r.stops}/${r.starts} | ${r.afterFlush?.count}/${r.afterFlush?.nodes.length}/${r.afterFlush?.queue.length} | ${r.final?.count}/${r.final?.nodes.length} | ${r.status} |`).join('\n');
const report=`# SOUND 연속 후속 — 실제 backend 동급 VOICE9 포화

새 한 경계 fixture **${passed}대조 PASS/${failed} FAIL**, 고유 source backend ${groups.size}개 실행. 기존18그룹/84입력·정적31·7 contrast는 읽기 인수만 했고 실행/import/합산0. 이번 _playSampleNow/_evictLowest는 원문을 실행했다. productionApplied=false, priorityPolicyAdopted=false. source fixture PASS ≠ runtime/visual/listening PASS.

| 인수 항목 | 실제 근거와 한계 |
|---|---|
| 수신/읽기 | 총괄 채팅01a0faa9-b453-7673-be39-98adedb4c2b3의 새 지시 수신. 첫 TASK/COMMON cat exit0(chunk8d0c41/116f78). 정확 메시지/첫 Read 시각은 null; 경로 관찰05:25:15.415 UTC/14:25:15.415 KST. 실제 후속 Read SHA/시각은 evidence. |
| 담당 | 현재 담당표의 Codex SOUND 채팅01a0faaf-956a-74a3-9bf1-77032f124e2d. native Claude나 원aa3ac0ed 세션을 이번 실행자로 표기하지 않음. |
| 실행 위치/소유 | 실제 cwd/realpath ${ROOT}; 소유 ${OWN}. 최초 TASK만 존재. checks.mjs/result.md/evidence.json 3파일만 작성. TASK/COMMON/기존 산출/생산/공유docs 쓰기0. |
| 제공 commit | 총괄이 지시로 제공한 생산7e69495046323b3120578f67635c20feb48b2a4f 및 TASK checkpoint cd675f24. 정확 제공시각 null; Git 조회0, 독립 관측 현재 HEAD/Changes null. 과거 SHA와 현재 읽은 source SHA를 분리함. Changes80/100 기준은 미조회라 도달 여부 미판정. |
| 실행 영수증 | ${process.execPath}, ${process.version}, ${startedAt}→${completedAt} UTC (${kst(startedAt)}→${kst(completedAt)}). exit ${failed||!preserved?1:0}. 입력 보존 SHA 비교 ${preserved}. |

| 실제 source | 본편/easy 시작행 | SHA256 | 양판 |
|---|---:|---|---|
${sourceRows}

현재 전체 source SHA: 본편 ${sources[0].sha256}; easy ${sources[1].sha256}. 이전 전체 SHA와 달라졌는지 evidence에 기록하며 이 값은 commit 조회를 대신하지 않는다. 추출 함수·상수 fingerprint가 같은 양판은 한 번만 실행한다.

| id / 한글명 | 준비 count/nodes | queue pri/위치 | caller/playSample pitch RNG | backend/evict 진입/성공 | stop/start | flush count/nodes/queue | 최종 회수 count/nodes | 결과 |
|---|---:|---:|---:|---|---:|---:|---:|---|
${resultRows}

모든 대조는 100ms에 최소 plain bonePart 1건 성공등록·notify1·save0이다. RNG1+1은 ghost 구간이며 준비 노드 backend 직접 호출은 RNG0이다. 현행 여유 대조만 lastT.ghost_laugh=100, 메모리 pri1 대조는 dedup 기록 없음. <30ms 두 등록을 다시 시험하지 않았으며 이전7의 dedup/RNG 결과를 인수한다.

동급 VOICE9 48개는 모두 실제 backend가 만든 합성 WebAudio 노드·실제 _dn·_st 1..48ms를 보유한다. 메모리 pri1 큐는 backend에 진입하지만 _evictLowest(9)=false로 create/start/stop0, 기존48개 유지, 큐0으로 폐기됐다. 낮은 HIT2 1개가 섞이면 실제 evict가 그 노드를 stop+_dn 회수하고 ghost VOICE9를 생성/start하여 count48을 유지했다. 낮은 노드 대조는 거부가 buffer/가짜 API 결함이 아닌 우선순위 조건 때문임을 구분하는 최소 추가다. 여유/교체 성공의 실제 source onended와 합성700ms timer callback 중복 실행은 count 중복 감소·중복disconnect를 만들지 않았다. 동급 거부는 해결된 제품 오류가 아니라 현행 정책 반례를 검증한 PASS다.

| 항목 | 실제 source / 명시 대역 및 미검수 |
|---|---|
| 실제 실행 | _boneRegister/_r/playSample/dispatcher/category/priority/_playSampleNow/_evictLowest/내부 _dn. backend·evict 계측 래퍼는 반드시 원함수를 호출하고 대역으로 반환하지 않음. |
| 합성 WebAudio | buffer duration0.2초/객체, currentTime=clock/1000, createBufferSource/createGain/connect/start/stop/disconnect 및 mbus/sfxVol=1 plain 대역. 실제 AudioContext·음원·오디오장치·fetch/decode0. pan0이며 panner 분기는 검수0. |
| 회수/수명 | 실제 _activeNodeCnt와 _activeNodes 일치. 준비 노드를 실제 backend로 만들고 _dn까지 보유; timer는700ms callback만 목록 기록 후 수동 실행. 실시간 timer/자연 onended/브라우저 수명·청취0. 마지막 회수는 메모리 노드만, 파일 cleanup/삭제0. |
| 등록 UI/저장 | ANC_ROSTER1행/완성false/표시·notify 대역/identity 보이스 매핑. mkItem/전체 pickup/해금/DOM/실저장0. _boneRegister 자체 save0은 전체 pickup 저장 실패라는 뜻이 아님. |
| 메모리 변경1곳 | \`${original}\`→\`${candidate}\`만 포화 접근에 사용. 원/대조 fragment·함수 SHA evidence 기록. queue pri1은 backend priOverride로 전달되지 않으며 최종 node priority9 유지. 정책 미채택/생산미적용. |
| 도구 | functions.exec/exec_command/apply_patch로 파일 읽기·작성·Node·rg만 사용. 외부 스킬/API/MCP/생성·설치·Git·서버/UI·새세션·메시지·하위팀0. 이 source 경계에 외부 서비스는 필요하지 않음. |

docs 전체 검색 ${lines.length}행/${docsFiles.length}파일, 정확 키워드·목록·출력SHA는 evidence. 공유docs/보호2_3 수정0. 사운드 SSOT §사운드 우선순위 시스템에 인계할 canonical 문안:

> | id / 수치 | 현행 계약 / 검수 범위 |
> |---|---|
> | ghost_laugh / VOICE9 | 일반 등록 호출은 queue pri 없음. 미채택 메모리 pri1은 backend 접근을 허용하지만 최종 node priority9를 높이지 않음. 등록 성공은 가청 보장이 아님. |
> | _evictLowest / desktop48 | newPri>minP일 때 최저 노드 교체. 동급 교체는 newPri>=SKILL10이며 newPri>=minP인 경우만 허용. VOICE9 동급48은 backend 진입1/evict false/start0, 낮은 HIT2 1개 혼합은 stop1/start1/count48. |
> | _playSampleNow / 수명 | duration0.2초 합성 buffer에서 onended 및700ms 정리 callback이 실제 _dn의 중복회수 guard를 보존. 실제 AudioContext/타이머/음원/청취 미검수. |
> | 정책/근거 | productionApplied=false, priorityPolicyAdopted=false; 새 backend 경계3대조, 이전7/31/84 재실행0. src.start1은 가청1로 환산하지 않음. |

기존 SSOT의 player_dead VOICE9+pri1 “100% 재생 보장” 문장은 일반적으로 읽으면 _evictLowest의 동급 거부 및 미준비 buffer 계약과 충돌한다. 해당 caller 전수 실행은 이번0이므로 자동 수정/사망음 실측 주장 없이, “pri1로 큐의 프레임/카테고리 제한 및30ms dedup을 우회한다. 실제 재생은 buffer 준비와 backend 노드 교체 조건을 충족해야 한다”로 한정하는 문안을 총괄에 인계한다. SKILL10 동급 교체 분기는 source 인수만 했고 별도 대조0.

다음 Gate는 총괄의 등록 피드백 정책 검토와 별도 단독 청취/실게임 허가다. 이번 범위에서는 슬롯을 열거나 후보를 채택하지 않는다. 새 작업 자동 진행0.
`;
fs.writeFileSync(OWN+'/result.md',report);
const evidence={taskId:'SOUND-continuous-ghost-backend-equal-voice9',provider:'Codex',chatId:'01a0faaf-956a-74a3-9bf1-77032f124e2d',sourceThreadId:'01a0faa9-b453-7673-be39-98adedb4c2b3',sessionId:null,
 status:failed||!preserved?'FAIL':'SOURCE_BACKEND_FIXTURE_PASS_RUNTIME_PENDING',productionApplied:false,priorityPolicyAdopted:false,runtimeExecuted:false,audibleVerified:false,
 receipt:{exactInboundTimestamp:null,firstReadAt:null,firstReadChunks:['8d0c41','116f78'],firstReadExitCodes:[0,0],pathObservationAt:'2026-10-02T05:25:15.415Z',initialOwnedFiles:['TASK.md'],providedProductionCommit:'7e69495046323b3120578f67635c20feb48b2a4f',providedTaskCheckpoint:'cd675f24',commitProvenance:'incoming coordinator instruction; not independently queried',currentHead:null,currentChanges:null},
 paths:{cwd:process.cwd(),rootReal:fs.realpathSync(ROOT),ownerReal:fs.realpathSync(OWN)},reads,sources:sourceMetadata,memoryEdits,records,
 execution:{startedAt,completedAt,startedAtKST:kst(startedAt),completedAtKST:kst(completedAt),node:process.execPath,version:process.version,uniqueSourceBackends:groups.size,sourceVariants:sources.length,newContrasts:records.length,passed,failed,exitCode:failed||!preserved?1:0,command:[process.execPath,'tools/team-followup-20261002/continuous/SOUND/checks.mjs'],sourceFixturePassIsNotRuntimeVisualListeningPass:true},
 priorAcceptedOnly:{sevenContrastExecution:previous.execution,static31Execution:{startedAt:staticPrevious.execution.startedAt,passed:staticPrevious.execution.passed,kind:staticPrevious.execution.kind},previous18Group84Rerun:0,static31Rerun:0,sevenContrastsRerun:0,priorScriptsExecutedOrImported:0,previousBackendWasStub:true},
 preservedInputs,allReadInputsBytePreserved:preserved,
 docsSearch:{at:docsAt,command:['rg','-n',keyword,'docs/'],exitCode:0,lines:lines.length,fileCount:docsFiles.length,files:docsFiles.map(p=>ROOT+'/'+p),outputSHA256:sha(docsOut),sharedDocsWrites:0,canonicalProposal:OWN+'/result.md'},
 stubs:['prepared small buffer objects duration0.2','plain WebAudio source/gain/bus; start/stop/disconnect are recorders','currentTime/performance synthetic clocks','held timer callbacks executed manually, no actual timer','identity _silvertailVoiceKey','ANC_ROSTER one-row, completion false, translation/notify'],
 actualBoundary:['extracted original dispatcher/dedup/flush/backend/eviction/_r','seed nodes created by real backend with actual _dn closures','original evict chooses and reclaims actual source-created synthetic nodes','onended + held fallback callback exercise actual cleanup guard'],
 toolUsage:{actual:['functions.exec','exec_command','apply_patch','Node built-in fs/vm/crypto','bundled acorn AST extraction','rg'],skills:[],externalAPI:[],MCP:[]},
 prohibitedActions:{productionWrites:0,sharedDocsWrites:0,ownerOutsideWrites:0,GitCommands:0,serverRuns:0,HTTP:0,UI:0,game:0,build:0,installation:0,realAudioContext:0,realTimers:0,fetch:0,decode:0,audioFileCreation:0,playbackOrListening:0,deletion:0,moving:0,cleanup:0,newSession:0,subteam:0,messages:0},
 artifacts:['checks.mjs','result.md'].map(f=>({path:OWN+'/'+f,sha256:sha(fs.readFileSync(OWN+'/'+f))})),
 limits:['src.start is synthetic method invocation, not audible playback','desktop-only one registration per condition; no repeated dedup, mobile, pan or SKILL10 dynamic test','no pickup/mkItem/save/package/browser lifecycle verification','current Git HEAD and Changes are unqueried; provided commits are coordinator facts','no source/backend policy fix adopted; equal VOICE rejection remains current contract']};
fs.writeFileSync(OWN+'/evidence.json',JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({status:evidence.status,execution:evidence.execution,allReadInputsBytePreserved:preserved,docs:{lines:lines.length,files:docsFiles.length},records:records.map(({id,status,backendEntries,starts,stops,evicted,callerRng,playSamplePitchRng,error})=>({id,status,backendEntries,starts,stops,evicted,callerRng,playSamplePitchRng,error})),outputs:['checks.mjs','result.md','evidence.json'].map(f=>OWN+'/'+f)},null,2));
process.exitCode=evidence.execution.exitCode;
