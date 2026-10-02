// Actual full dispatcher/backend source, synthetic WebAudio/clock/timer boundaries.
// No browser, audio device, network, storage, old checks, or production writes.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const FILES = ['game.html', 'game-easy-test.html'];
const LOOP = '  for(let i=0;i<_sfxQueue.length;i++){';
const TAIL = '  _sfxQueue.length=0;\n  for(const k in _sfxFrameCnt)_sfxFrameCnt[k]=0;\n  if(SFX._sbSndCd>0)SFX._sbSndCd--;';
const sha = x => crypto.createHash('sha256').update(x).digest('hex');
const copy = x => JSON.parse(JSON.stringify(x));
const report = {kind:'actual SFX frame-flush lifetime', startedAt:new Date().toISOString(),
  node:process.version, sources:[], groups:[], sourceWrites:0, memoryCandidateRuns:0,
  runtimeAccepted:false, nativeAudio:false, automaticNextFrameExecuted:false,
  sourceBoundary:'Full current flush/backend/enqueue/helpers; actual character0 voice early return.',
  doubles:['Prepared0.2s buffers, source/gain/bus recorders; no device/decoding.',
    'Synthetic100/116ms clock, deterministic counted RNG, held timers; no realtime callbacks.',
    'Nonzero frameCounts2/5 and SFX sbCd3 are synthetic seeds; no producer reachability claim.',
    'Next reset is directly invoked by harness, not actual loop/rAF/error recovery.'],
  transformations:['Named-function brace scanner with comments/quoted strings; selected source has no regex literal/template interpolation.',
    'Source declarations are complete actual lines; no handcopied dispatcher/backend.',
    'Only after approved finally exists, normal old control removes its exact two wrapping insertions.']};

function func(s,name) {
  const needle='function '+name+'(',a=s.indexOf(needle);assert.ok(a>=0,name);
  assert.equal(s.split(needle).length-1,1,'unique '+name);
  const opening=s.indexOf('{',a);let depth=0,quote='',comment='';
  for(let i=opening;i<s.length;i++) {
    const c=s[i],n=s[i+1];
    if(comment==='line'){if(c==='\n')comment='';continue;}
    if(comment==='block'){if(c==='*'&&n==='/'){comment='';i++;}continue;}
    if(quote){if(c==='\\'){i++;continue;}if(c===quote)quote='';continue;}
    if(c==='/'&&n==='/'){comment='line';i++;continue;}
    if(c==='/'&&n==='*'){comment='block';i++;continue;}
    if(c==='\''||c==='"'||c==='`'){quote=c;continue;}
    if(c==='{')depth++;else if(c==='}'&&--depth===0)
      return {name,code:s.slice(a,i+1),line:s.slice(0,a).split('\n').length,
        endLine:s.slice(0,i+1).split('\n').length,sha256:sha(s.slice(a,i+1))};
  }
  throw new Error('unclosed '+name);
}
function sourceLine(s,needle) {
  const a=s.indexOf(needle);assert.ok(a>=0,needle);assert.equal(s.split(needle).length-1,1,needle);
  const z=s.indexOf('\n',a);return {name:needle,code:s.slice(a,z),line:s.slice(0,a).split('\n').length,sha256:sha(s.slice(a,z))};
}
function extract(file) {
  const bytes=fs.readFileSync(path.join(ROOT,file)),s=bytes.toString('utf8');
  const functions=['_sfxFrameReset','_playSampleNow','playSample','_r','_evictLowest',
    '_sfxPri','_sfxCat','_isFootstepSfx','_isSkillSfx','_silvertailVoiceKey'].map(n=>func(s,n));
  const decls=['let _sfxFrameT=0;','let _activeNodeCnt=0;','const _sfxQueue=',
    'const _activeNodes=','const _sfxLastT=','const _MAX_ACTIVE_NODES=',
    'const _SFX_MAX=','const _SFX_PER_FRAME=','const _SFX_PRI=',
    'const _SKILL_SFX_KEYS=','const _MAX_PROJ_NODES=',
    'const _MAX_HIT_NODES=','const _MAX_STEP_NODES='].map(n=>sourceLine(s,n));
  const flush=functions.find(x=>x.name==='_sfxFrameReset');
  const finalized=flush.code.includes('  try{\n'+LOOP)&&flush.code.includes('  }finally{\n'+TAIL+'\n  }');
  assert.equal(flush.code.split(LOOP).length-1,1);assert.equal(flush.code.split(TAIL).length-1,1);
  const callerLines=s.split('\n').flatMap((l,i)=>l.includes('_sfxFrameReset();')?[{line:i+1,text:l}]:[]);
  assert.equal(callerLines.length,1,'single static actual loop call');
  report.sources.push({file,bytes:bytes.length,sha256:sha(bytes),finalized,
    fragments:functions.concat(decls).map(({code,...x})=>({...x,bytes:Buffer.byteLength(code)})),callerLines});
  return {file,functions,decls,finalized};
}

function scenario(ex,{failure=0,priority=false,capped=false},oldNormalControl=false) {
  let clock=100,phase='enqueue',attempts=0,thrown=false;
  const events=[],rng=[],nodes=[],timers=[],error=new Error('synthetic queued start #'+failure);
  error.name='FrameFlushBoundaryError';
  const event=(kind,data={})=>events.push({phase,clock,kind,...data});
  const keys=['ghost_laugh','male_grunt','voice_ult'];if(capped)keys.push('voice_move');
  const buffers=Object.fromEntries(keys.map(k=>[k,{duration:.2,fixtureKey:k}]));
  const audio={get currentTime(){return clock/1000;},createBufferSource(){
    const id=nodes.length,node={id,buffer:null,playbackRate:{value:1},onended:null,
      connect(target){event('source.connect',{id,target:target.id});},
      start(at){attempts++;const key=node.buffer.fixtureKey;
        event('start.attempt',{id,key,at,rate:node.playbackRate.value});
        if(failure&&attempts===failure&&!thrown){thrown=true;event('start.throw',{id,key});throw error;}
        event('start.success',{id,key});},
      stop(){event('source.stop',{id});},disconnect(){event('source.disconnect',{id});}};
    nodes.push(node);event('source.create',{id});return node;},
    createGain(){const id='gain'+nodes.at(-1).id;const gain={value:1};
      return {id,gain,connect(target){event('gain.connect',{id,target:target.id,value:gain.value});},
        disconnect(){event('gain.disconnect',{id});}};},
    createStereoPanner(){throw new Error('panner outside selected boundary');}};
  const math=Object.create(Math);math.random=()=>{const value=[.25,.75,.5,.125,.625,.875,.3,.7][rng.length%8];
    rng.push({phase,value});return value;};
  const ctx=vm.createContext({Math:math,IS_MOBILE:false,_gxVolMul:1,_charIdx:0,
    performance:{now:()=>clock},_audioBuffers:buffers,_sampleFiles:{},_audioLoadPending:{},
    actx:()=>{event('actx');return audio;},mbus:()=>({id:'bus'}),sfxVol:()=>1,
    _deathSfxCd:2,_hitSfxCd:3,_mSfxPlaying:7,SFX:{_sbSndCd:3},_actx:{state:'running'},
    _resumeAudioCtx(){throw new Error('resume outside selected boundary');},
    fetch(){throw new Error('network forbidden');},
    setTimeout(callback,delay){assert.equal(delay,700);timers.push(callback);
      event('timer.schedule',{id:nodes.at(-1).id,delay});return timers.length;}});
  const code=ex.decls.map(x=>x.code).join('\n')+'\n'+ex.functions.map(x=>{
    if(x.name!=='_sfxFrameReset'||!oldNormalControl)return x.code;
    assert.ok(ex.finalized,'old normal control only after production decision/patch');
    return x.code.replace('  try{\n'+LOOP,LOOP).replace('  }finally{\n'+TAIL+'\n  }',TAIL);
  }).join('\n');
  new vm.Script(code,{filename:ex.file+':actual-flush-chain'}).runInContext(ctx);
  vm.runInContext('_sfxFrameCnt.ghost_laugh=2;_sfxFrameCnt.g_voice=5;',ctx);
  const snapshot=()=>JSON.parse(vm.runInContext('JSON.stringify({frameT:_sfxFrameT,active:_activeNodeCnt,nodes:_activeNodes.map(n=>({key:n.key,pri:n.pri})),queue:_sfxQueue,counts:_sfxFrameCnt,lastT:_sfxLastT,death:_deathSfxCd,hit:_hitSfxCd,mPlaying:_mSfxPlaying,sb:SFX._sbSndCd})',ctx));
  const enqueue=(key,v,p)=>ctx.playSample(key,v,ctx._r(1.2,.1),p);
  if(priority){enqueue('voice_ult',.3,1);enqueue('male_grunt',.4,1);enqueue('ghost_laugh',.8,1);}
  else {enqueue('male_grunt',.4,0);enqueue('voice_ult',.3,0);if(capped)enqueue('voice_move',.2,0);enqueue('ghost_laugh',.8,1);}
  const before=snapshot();assert.deepEqual(before.queue.map(q=>q.key),keys);
  const reset=label=>{phase=label;try{ctx._sfxFrameReset();return {threw:false,sameError:false};}
    catch(e){event('caught',{sameError:e===error,name:e.name});return {threw:true,sameError:e===error,name:e.name};}};
  const frame1Error=reset('frame1'),after1=snapshot();assert.equal(frame1Error.threw,!!failure);
  assert.equal(frame1Error.sameError,!!failure);
  const success=f=>events.filter(x=>x.phase===f&&x.kind==='start.success').map(x=>x.key);
  const firstSuccess=success('frame1');assert.deepEqual(firstSuccess,failure?keys.slice(0,failure-1):keys.slice(0,3));
  assert.equal(after1.active,firstSuccess.length);assert.equal(after1.nodes.length,after1.active);
  assert.equal(after1.death,1);assert.equal(after1.hit,2);assert.equal(after1.mPlaying,0);
  // Error propagation bypasses actual loop's later rAF. This is an explicit synthetic re-entry.
  clock=116;const frame2Error=reset('manual-frame2'),after2=snapshot();assert.equal(frame2Error.threw,false);
  const secondSuccess=success('manual-frame2');
  assert.deepEqual(secondSuccess,failure&&!ex.finalized?keys.slice(0,3):[]);
  assert.equal(after2.queue.length,0);assert.deepEqual(after2.lastT,before.lastT);
  assert.equal(rng.length,keys.length*2);assert.ok(rng.every(x=>x.phase==='enqueue'));
  phase='manual-held-callbacks';clock=800;for(const cb of timers)cb();for(const n of nodes)n.onended();for(const cb of timers)cb();
  const afterCallbacks=snapshot();assert.equal(afterCallbacks.active,0);assert.equal(afterCallbacks.nodes.length,0);
  assert.equal(events.filter(x=>x.kind==='source.disconnect').length,nodes.length);
  assert.equal(events.filter(x=>x.kind==='gain.disconnect').length,nodes.length);
  assert.equal(events.filter(x=>x.kind==='source.stop').length,0);
  return {before,after1,after2,afterCallbacks,frame1Error,frame2Error,firstSuccess,secondSuccess,
    replayedSuccessfulPrefix:secondSuccess.filter(k=>firstSuccess.includes(k)),events,rng,
    sourceFingerprint:sha(code),nodesCreated:nodes.length,timers:timers.length,
    priorityTail:priority,manualNextReset:true};
}
function group(ex,name,options) {
  const item={file:ex.file,name,status:'PASS',stage:'fixture-contract'};report.groups.push(item);
  try {
    const x=scenario(ex,options);item.observation=x;
    if(!options.failure){
      assert.deepEqual(x.after1.counts,{ghost_laugh:0,g_voice:0});assert.equal(x.after1.sb,2);
      assert.equal(x.after1.queue.length,0);assert.deepEqual(x.secondSuccess,[]);
      if(ex.finalized){const old=scenario(ex,options,true);
        for(const k of ['before','after1','after2','afterCallbacks','events','rng'])assert.deepEqual(x[k],old[k],k);
        item.normalOldControlEqual=true;}
      else item.normalOldControlEqual='not run before source policy decision';
    }else {
      item.stage='batch-finalization-criterion';
      assert.equal(x.after1.queue.length,0,'failed frame must finalize entire queue batch (root policy pending)');
      assert.deepEqual(x.after1.counts,{ghost_laugh:0,g_voice:0});assert.equal(x.after1.sb,2);
      assert.deepEqual(x.secondSuccess,[],'no synthetic next reset replay after finalized batch');
    }
  }catch(e){item.status='FAIL';item.error={name:e.name,message:e.message};
    item.failureKind=item.stage==='batch-finalization-criterion'&&e.name==='AssertionError'?'batchFinalization':'fixtureOrContract';}
}
try {
  for(const file of FILES){const ex=extract(file);
    group(ex,'normal-three',{failure:0});group(ex,'normal-category-cap-drops-tail',{failure:0,capped:true});
    for(const [name,n] of [['first',1],['middle',2],['last',3]])group(ex,'start-failure-'+name,{failure:n});
    group(ex,'middle-failure-with-priority-tail',{failure:2,priority:true});
  }
}catch(e){report.extractionError={name:e.name,message:e.message,stack:e.stack};}
report.finishedAt=new Date().toISOString();
report.summary={groups:report.groups.length,pass:report.groups.filter(x=>x.status==='PASS').length,
  fail:report.groups.filter(x=>x.status==='FAIL').length,
  batchFinalizationFailures:report.groups.filter(x=>x.failureKind==='batchFinalization').length,
  fixtureOrContractFailures:report.groups.filter(x=>x.failureKind==='fixtureOrContract').length,
  normalOldControls:report.groups.filter(x=>x.normalOldControlEqual===true).length};
report.sourcePreserved=Object.fromEntries(report.sources.map(x=>[x.file,sha(fs.readFileSync(path.join(ROOT,x.file)))===x.sha256]));
if(report.extractionError||report.summary.fail||!Object.values(report.sourcePreserved).every(Boolean))process.exitCode=1;
console.log(JSON.stringify(report,null,2));
