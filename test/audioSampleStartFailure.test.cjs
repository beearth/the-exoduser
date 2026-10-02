// Actual source extraction + held clock/WebAudio boundary doubles. No writer, audio device or real timer.
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createHash}=require('node:crypto');
const {parseExpressionAt}=require('acorn');
const root=path.resolve(__dirname,'..');
const plain=x=>JSON.parse(JSON.stringify(x));
const sha=x=>createHash('sha256').update(x).digest('hex');
const originalStart='src.start(startTime||0);';
const protectedStart='try{src.start(startTime||0);}catch(e){_nd._dn();throw e;}';
function extract(file){
  const bytes=fs.readFileSync(path.join(root,file)),text=bytes.toString('utf8');
  const functions=['_playSampleNow','_evictLowest','_sfxPri','_isFootstepSfx','_isSkillSfx','_sfxCat','playSample','_sfxFrameReset','_r'];
  const constants=['_MAX_ACTIVE_NODES','_SFX_MAX','_SFX_PER_FRAME','_SFX_PRI','_SKILL_SFX_KEYS','_MAX_PROJ_NODES','_MAX_HIT_NODES','_MAX_STEP_NODES'];
  const get=(name,constant=false)=>{
    const anchor=constant?'const '+name+'=':'function '+name+'(';
    assert.equal(text.split(anchor).length-1,1,file+' '+name+' exact count');
    const start=text.indexOf(anchor),ast=parseExpressionAt(text,constant?start+anchor.length:start,{ecmaVersion:'latest'});
    return {name,code:text.slice(start,ast.end)+(constant?';':''),line:text.slice(0,start).split('\n').length};
  };
  const blocks=[...functions.map(n=>get(n)),...constants.map(n=>get(n,true))];
  const backend=blocks.find(b=>b.name==='_playSampleNow');
  const guarded=backend.code.includes(protectedStart);
  assert.equal(backend.code.split(guarded?protectedStart:originalStart).length-1,1);
  const unguarded=guarded?backend.code.replace(protectedStart,originalStart):backend.code;
  console.log('SOURCE_METADATA '+JSON.stringify({file,sha256:sha(bytes),guarded,backendLine:backend.line,backendSHA256:sha(backend.code),unguardedSHA256:sha(unguarded),actual:functions.concat(['internal _dn/_dnP']),controlledBoundary:'WebAudio nodes/bus/buffer, clock/timer, identity voice map, deterministic random'}));
  return {file,blocks,guarded,unguarded};
}
function fixture(parts,{control=false,fail=false,pan=0,disconnectError=null,seedNodes=[]}={}){
  const trace=[],timers=[],rng=[],edges=new Set();
  let phase='invoke',clock=100,ended=null,context;
  const startError=new Error('synthetic start exception');startError.name='FixtureStartError';
  const cleanupError=new Error('synthetic disconnect exception');
  const event=(type,extra={})=>trace.push({phase,type,...extra});
  const count=type=>trace.filter(e=>e.type===type).length;
  const state=()=>plain(vm.runInContext('({count:_activeNodeCnt,nodes:_activeNodes.map(n=>({key:n.key,pri:n.pri,started:n._st})),queue:_sfxQueue,lastT:_sfxLastT})',context));
  const makeNode=id=>({id,connect(target){event(id+'.connect',{to:target.id});edges.add(id+'>'+target.id);},disconnect(){event(id+'.disconnect');if(disconnectError===id)throw cleanupError;for(const edge of [...edges])if(edge.startsWith(id+'>'))edges.delete(edge);}});
  const src=Object.assign(makeNode('src'),{buffer:null,playbackRate:{value:1},start(at){event('src.start',{at,rate:src.playbackRate.value,state:state()});if(fail)throw startError;},stop(){event('src.stop');}});
  Object.defineProperty(src,'onended',{get(){return ended;},set(value){ended=value;event('onended.register',{name:value.name});}});
  const gain=Object.assign(makeNode('gain'),{gain:{value:1}});
  const panner=Object.assign(makeNode('panner'),{pan:{value:0}});
  const forbidden=name=>()=>{throw new Error('unexpected '+name);};
  const audio={get currentTime(){return clock/1000;},createBufferSource(){event('src.create');return src;},createGain(){event('gain.create');return gain;},createStereoPanner(){event('panner.create');return panner;}};
  const math=Object.create(Math);math.random=()=>{const value=[.25,.75][rng.length%2];rng.push({phase,value});return value;};
  const sandbox={Math:math,seedNodes,IS_MOBILE:false,_gxVolMul:1,_audioBuffers:{ghost_laugh:{duration:.2}},_sampleFiles:{},_audioLoadPending:{},
    _silvertailVoiceKey:key=>key,actx:()=>audio,mbus:()=>({id:'bus'}),sfxVol:()=>1,performance:{now:()=>clock},
    _deathSfxCd:0,_hitSfxCd:0,_mSfxPlaying:0,SFX:{_sbSndCd:0},_actx:null,
    setTimeout(callback,delay){timers.push({callback,delay});event('timer.register',{delay,name:callback.name});return timers.length;},
    fetch:forbidden('fetch'),AudioContext:forbidden('AudioContext'),_resumeAudioCtx:forbidden('resume')};
  context=vm.createContext(sandbox);
  vm.runInContext('let _activeNodeCnt=seedNodes.length,_sfxFrameT=0;const _activeNodes=seedNodes.slice(),_sfxQueue=[],_sfxLastT={},_sfxFrameCnt={};\n'+parts.blocks.map(b=>control&&b.name==='_playSampleNow'?parts.unguarded:b.code).join('\n'),context,{timeout:1000});
  const direct=(startTime=0,vol=.8,rate=1.2)=>context._playSampleNow('ghost_laugh',vol,rate,startTime,pan);
  const dispatch=()=>{context.playSample('ghost_laugh',.8,context._r(1.2,.1));phase='flush';return context._sfxFrameReset();};
  const timer=()=>{assert.equal(timers.length,1);phase='timer';clock=800;timers[0].callback();};
  const end=()=>{phase='ended';assert.equal(typeof src.onended,'function');src.onended();};
  const cleanup=first=>{if(first==='ended'){end();timer();}else{timer();end();}timer();end();};
  const report=()=>({trace:plain(trace),rng:plain(rng),state:state(),edges:[...edges].sort(),gain:gain.gain.value,rate:src.playbackRate.value,pan:panner.pan.value,timerDelays:timers.map(t=>t.delay)});
  return {src,gain,panner,context,startError,cleanupError,trace,timers,rng,edges,event,count,state,direct,dispatch,timer,end,cleanup,report};
}
function caught(fn){let error;try{fn();}catch(e){error=e;}return error;}
function assertAccountingClean(w){assert.equal(w.state().count,0);assert.equal(w.state().nodes.length,0);}
function assertCoreOnce(w){assert.equal(w.count('src.disconnect'),1);assert.equal(w.count('gain.disconnect'),1);assert.equal(w.count('src.stop'),0);}
for(const file of ['game.html','game-easy-test.html']){
  const parts=extract(file);
  for(const pan of [0,.6])test(file+' start exception immediately cleans '+(pan?'panned':'plain')+' node and rethrows same error',()=>{
    const w=fixture(parts,{fail:true,pan});assert.equal(caught(()=>w.direct(24)),w.startError);
    assertAccountingClean(w);assertCoreOnce(w);assert.equal(w.edges.size,0);
    assert.equal(w.timers.length,1);assert.equal(w.timers[0].delay,700);assert.equal(w.count('src.start'),1);
    assert.equal(w.trace.find(e=>e.type==='src.start').at,24);assert.equal(w.count('panner.disconnect'),pan?1:0);
    w.cleanup('timer');assertAccountingClean(w);assertCoreOnce(w);assert.equal(w.edges.size,0);
    // Existing _dnP repeats panner.disconnect attempts; only core accounting/source/gain are guarded once.
    assert.equal(w.count('panner.disconnect'),pan?5:0);
  });
  test(file+' unguarded memory control shows bounded timeout cleanup, not permanent leakage',()=>{
    for(const pan of [0,.6]){
      const w=fixture(parts,{control:true,fail:true,pan});assert.equal(caught(()=>w.direct()),w.startError);
      assert.equal(w.state().count,1);assert.equal(w.state().nodes.length,1);assert.equal(w.count('src.disconnect'),0);
      assert.equal(w.timers[0].delay,700);w.cleanup('timer');assertAccountingClean(w);assertCoreOnce(w);assert.equal(w.edges.size,0);
      assert.equal(w.count('panner.disconnect'),pan?4:0);
    }
  });
  test(file+' normal actual start/return/graph/events/timer trace is identical to unguarded source',()=>{
    for(const pan of [0,.05,.6])for(const first of ['timer','ended']){
      const actual=fixture(parts,{pan}),control=fixture(parts,{control:true,pan});
      for(const w of [actual,control]){
        assert.equal(w.direct(12),w.src);assert.equal(w.state().count,1);assert.equal(w.state().nodes[0].pri,9);
        assert.equal(w.state().nodes[0].key,'ghost_laugh');assert.equal(w.timers[0].delay,700);assert.equal(w.count('src.disconnect'),0);
        assert.equal(w.count('panner.create'),pan>.05?1:0);w.cleanup(first);assertAccountingClean(w);assertCoreOnce(w);assert.equal(w.edges.size,0);
      }
      assert.deepEqual(actual.report(),control.report());
    }
  });
  test(file+' actual dispatcher propagates same failure and retains queue/dedup/RNG contract',()=>{
    const actual=fixture(parts,{fail:true}),control=fixture(parts,{control:true,fail:true});
    for(const w of [actual,control]){assert.equal(caught(w.dispatch),w.startError);assert.equal(w.state().queue.length,1);assert.equal(w.state().lastT.ghost_laugh,100);assert.equal(w.rng.length,2);assert.equal(w.src.playbackRate.value,1.1856);}
    assertAccountingClean(actual);assert.equal(control.state().count,1);
    assert.deepEqual(actual.state().queue,control.state().queue);assert.deepEqual(actual.state().lastT,control.state().lastT);assert.deepEqual(actual.rng,control.rng);
    actual.cleanup('timer');control.cleanup('timer');assert.deepEqual(actual.state(),control.state());assertCoreOnce(actual);assertCoreOnce(control);
  });
  test(file+' normal actual dispatcher has equivalent queue drain and first effects',()=>{
    const actual=fixture(parts),control=fixture(parts,{control:true});
    for(const w of [actual,control]){assert.equal(w.dispatch(),undefined);assert.equal(w.state().queue.length,0);assert.equal(w.state().count,1);assert.equal(w.gain.gain.value,.8);w.cleanup('ended');}
    assert.deepEqual(actual.report(),control.report());
  });
  test(file+' existing disconnect exception catches preserve start error without expanded cleanup policy',()=>{
    for(const disconnectError of ['src','gain','panner']){
      const w=fixture(parts,{fail:true,pan:.6,disconnectError});assert.equal(caught(()=>w.direct()),w.startError);
      assertAccountingClean(w);assert.equal(w.count('src.disconnect'),1);assert.equal(w.count('gain.disconnect'),disconnectError==='src'?0:1);
      assert.equal(w.count('panner.disconnect'),1);w.cleanup('timer');assertAccountingClean(w);
      assert.equal(w.count('src.disconnect'),1);assert.equal(w.count('gain.disconnect'),disconnectError==='src'?0:1);
      assert.equal(w.count('panner.disconnect'),5);assert.equal(w.count('src.stop'),0);
      // Source disconnect throw skips gain in existing shared catch; repeated panner attempts remain existing behavior.
    }
  });
  test(file+' start-failure removal leaves existing active node and accounting intact',()=>{
    const sentinel={key:'voice_existing',pri:9,_st:7,src:{stop(){throw new Error('existing node must not stop');}},_dn(){throw new Error('existing node must remain');}};
    const w=fixture(parts,{fail:true,seedNodes:[sentinel]});assert.equal(caught(()=>w.direct()),w.startError);
    assert.equal(w.state().count,1);assert.equal(w.state().nodes.length,1);assert.equal(w.state().nodes[0].key,'voice_existing');
    w.cleanup('timer');assert.equal(w.state().count,1);assert.equal(w.state().nodes.length,1);assertCoreOnce(w);
  });
  test(file+' absent unregistered buffer preserves early return without node/timer allocation',()=>{
    const actual=fixture(parts),control=fixture(parts,{control:true});
    for(const w of [actual,control]){delete w.context._audioBuffers.ghost_laugh;assert.equal(w.direct(),undefined);assertAccountingClean(w);assert.equal(w.timers.length,0);assert.equal(w.trace.length,0);}
    assert.deepEqual(actual.report(),control.report());
  });
}
