'use strict';

// Source-only acceptance: full actual deathFX -> actual sample backend/helpers.
// AudioNodes, loaded buffers, clock, held timers and visual sinks are doubles.
// No HTML script execution, browser, device, native timer, upstream kill or RAF.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const {parseExpressionAt, parse} = require('acorn');
const ROOT = path.resolve(__dirname, '..');
const sha = value => createHash('sha256').update(value).digest('hex');
const OLD_SHA = '88f298c061d8a71d3df7bf34a30a15de54a42f5e66faa22c452a7dd71aff32e7';
const CANDIDATE_SHA = 'edaa50841ca6c897a30c812035b018c0b09c4db2510ddae7337965c6ce0d336d';
const FUNCTIONS = ['deathFX','_deathBloodScale','_deathSfxKey','_pickDeathVar',
  '_bossSfx','_playSampleNow','_sfxPri','_isSkillSfx','_isFootstepSfx','_evictLowest','_r'];
const CONSTANTS = ['_HUMANOID_ET','_INSECT_ET','_GHOST_ET','_FLESH_ET','_BONE_ET',
  '_BEAST_ET','_MAGIC_ET','_ARMOR_ET','_DEATH_VARIANTS','_BOSS_SFX','_SFX_PRI',
  '_SKILL_SFX_KEYS','_MAX_ACTIVE_NODES','_MAX_PROJ_NODES','_MAX_HIT_NODES','_MAX_STEP_NODES'];
const DECLARATIONS = ['_activeNodeCnt','_activeNodes','_deathSfxCd','_deathSfxFrameMark','_sfxFrameT'];

function extract(text, name, kind) {
  const re = kind === 'function' ? new RegExp('^function '+name+'\\(', 'm') :
    new RegExp('^(?:const|let) '+name+'=', 'm');
  const match = re.exec(text); assert.ok(match, 'missing actual source '+name);
  const start = match.index; let end;
  if (kind === 'function') end = parseExpressionAt(text, start, {ecmaVersion:'latest'}).end;
  else if (kind === 'constant') {
    end = parseExpressionAt(text, start + match[0].length, {ecmaVersion:'latest'}).end + 1;
    assert.equal(text[end-1], ';', 'constant delimiter '+name);
  } else {
    end = text.indexOf(';', start) + 1; assert.ok(end > start);
    assert.equal(parse(text.slice(start,end), {ecmaVersion:'latest'}).body[0].type,'VariableDeclaration');
  }
  const code = text.slice(start,end);
  return {name,kind,code,line:text.slice(0,start).split('\n').length,bytes:Buffer.byteLength(code),sha256:sha(code)};
}
const sources = ['game.html','game-easy-test.html'].map(file => {
  const bytes = fs.readFileSync(path.join(ROOT,file)), text = bytes.toString('utf8');
  return {file,bytes:bytes.length,sha256:sha(bytes),blocks:[
    ...FUNCTIONS.map(n=>extract(text,n,'function')),
    ...CONSTANTS.map(n=>extract(text,n,'constant')),
    ...DECLARATIONS.map(n=>extract(text,n,'declaration'))]};
});
assert.equal(sources[0].blocks.map(x=>x.code).join('\n'),sources[1].blocks.map(x=>x.code).join('\n'));
const backend = source => source.blocks.find(x=>x.name==='_playSampleNow').code;
if (process.argv.includes('--baseline')) for (const s of sources) assert.equal(sha(backend(s)), OLD_SHA);

// Final normal controls use only inverse edits on the actual current backend.
// In baseline this is the unmodified actual old source; no candidate is made/run.
function oldBackend(actual) {
  if (sha(actual) === OLD_SHA) return actual;
  assert.equal(sha(actual), CANDIDATE_SHA, 'unreviewed backend; reconcile source first');
  let old = actual.replace('  try{\n  if(pan&&Math.abs(pan)>0.05){','  if(pan&&Math.abs(pan)>0.05){');
  old = old.replace('    const _dnP=function(){_dn();try{_panner.disconnect()}catch(e){}};\n    _nd._dn=_dnP;\n    src.connect(_panner);_panner.connect(gain);\n    src.onended=_dnP;',
    '    src.connect(_panner);_panner.connect(gain);\n    const _dnP=function(){_dn();try{_panner.disconnect()}catch(e){}};\n    _nd._dn=_dnP;src.onended=_dnP;');
  old = old.replace('  src.start(startTime||0);\n  }catch(e){_nd._dn();throw e;}',
    '  try{src.start(startTime||0);}catch(e){_nd._dn();throw e;}');
  assert.equal(sha(old), OLD_SHA, 'old control must reconstruct exact source');
  return old;
}

const CASES = [
  {id:'stereo-source-connect',deaths:2,failure:'source.connect',target:'panner'},
  {id:'stereo-panner-connect',deaths:2,failure:'panner.connect',target:'gain'},
  {id:'mono-source-connect',deaths:1,failure:'source.connect',target:'gain'},
  {id:'ordinary-two-deaths-normal',deaths:2},
  {id:'stage0-boss-death-normal',deaths:1,boss:true}
];

function run(source, scenario, oldControl=false) {
  const events=[], rng=[], timers=[], nodes=[]; let sourceN=0, pannerN=0;
  const injected = new Error('injected '+scenario.id);
  const record=(type,values={})=>events.push({type,...values});
  const math=Object.create(Math);math.random=()=>{rng.push(.5);return .5;};
  const bus={kind:'bus',id:0};
  function node(kind,id) {
    const n={kind,id,edges:[],disconnectCalls:0,onended:null}; nodes.push(n);
    n.connect=to=>{
      record(kind+'.connect',{id,to:to.kind,toId:to.id});
      if (scenario.failure===kind+'.connect' && id===scenario.deaths && to.kind===scenario.target) throw injected;
      if (kind==='panner' && scenario.failure==='panner.connect') throw injected;
      n.edges.push(to.kind+':'+to.id);
    };
    n.disconnect=()=>{n.disconnectCalls++;n.edges=[];record(kind+'.disconnect',{id});};
    return n;
  }
  const audio={
    createBufferSource(){
      const n=node('source',++sourceN);record('source.create',{id:n.id});
      n.playbackRate={value:1};n.buffer=null;
      n.start=at=>record('source.start',{id:n.id,at,key:n.buffer.key,rate:n.playbackRate.value});
      n.stop=()=>record('source.stop',{id:n.id});return n;
    },
    createGain(){const n=node('gain',sourceN);n.gain={value:0};record('gain.create',{id:n.id});return n;},
    createStereoPanner(){const n=node('panner',sourceN);pannerN++;n.pan={value:0};record('panner.create',{id:n.id});return n;}
  };
  const context=vm.createContext({Math:math,IS_MOBILE:false,G:{stage:0},ELC:{},_partCnt:0,
    _audioBuffers:{},_sampleFiles:{},_audioLoadPending:{},performance:{now:()=>100},
    actx:()=>audio,mbus:()=>bus,sfxVol:()=>1,
    poolPart:(...args)=>record('poolPart',{args}),playVFXAng:(...args)=>record('playVFXAng',{args}),
    setTimeout:(fn,delay)=>{timers.push({fn,delay});record('timer',{delay});return timers.length;},
    fetch:()=>{throw Error('unexpected missing-buffer branch');}});
  const code=source.blocks.map(b=>oldControl&&b.name==='_playSampleNow'?oldBackend(b.code):b.code).join('\n');
  vm.runInContext(code,context,{timeout:1000});
  // Buffer data is synthetic, keys come from actual mappings rather than a fake emitter.
  vm.runInContext("for(const key of new Set([...Object.values(_DEATH_VARIANTS).flat(),...Object.values(_BOSS_SFX).map(x=>x.die),'death_boss','death_grunt','monster_die1']))_audioBuffers[key]={key,duration:.2};",context);
  const snap=()=>JSON.parse(vm.runInContext('JSON.stringify({count:_activeNodeCnt,list:_activeNodes.map(n=>({key:n.key,pri:n.pri,source:n.src.id,gain:n.gain.id,cleanup:typeof n._dn})),deathCD:_deathSfxCd,frameMark:_deathSfxFrameMark,frameN:_deathSfxFrameN,throttled:_deathSfxThrottled})',context));
  let caught=null;const returns=[];
  for(let i=0;i<scenario.deaths;i++){
    try{returns.push(context.deathFX(100+i*20,200,8,'#ff2233',!!scenario.boss,false,0));}
    catch(error){caught=error;break;}
  }
  assert.equal(caught===injected,!!scenario.failure,'same Error identity/normal completion');
  assert.equal(sourceN,scenario.deaths,'actual death caller reaches requested backend count');
  assert.equal(pannerN,scenario.deaths===2?1:0,'actual first mono, second spatial path');
  const immediate=snap(),prefix=scenario.failure?scenario.deaths-1:scenario.deaths;
  assert.equal(immediate.frameN,scenario.deaths);assert.equal(immediate.deathCD,5);
  assert.equal(events.filter(e=>e.type==='source.start').length,prefix);
  assert.equal(timers.length,prefix,'failed connect has no timer');
  assert.equal(events.filter(e=>e.type==='source.stop').length,0);
  for(const t of timers)assert.equal(t.delay,700);
  const initialTrace=JSON.parse(JSON.stringify(events));
  for(const t of timers)t.fn();
  for(const n of nodes)if(n.kind==='source'&&n.onended)n.onended();
  for(const t of timers)t.fn();
  const afterTimers=snap();
  const resources=nodes.map(n=>({kind:n.kind,id:n.id,edges:n.edges,disconnectCalls:n.disconnectCalls}));
  const obligations=[];
  if(scenario.failure){
    if(immediate.count!==prefix)obligations.push('failed registered count not reclaimed immediately');
    if(immediate.list.length!==prefix)obligations.push('failed active list entry retained');
    if(afterTimers.count!==0||afterTimers.list.length!==0)obligations.push('failed node remains after successful-prefix timers');
    for(const n of nodes.filter(n=>n.id===scenario.deaths)){
      if(n.disconnectCalls<1)obligations.push(n.kind+' cleanup not reached');
    }
  }else{
    assert.equal(immediate.count,scenario.deaths);assert.equal(immediate.list.length,scenario.deaths);
    assert.equal(afterTimers.count,0);assert.equal(afterTimers.list.length,0);
    assert.ok(returns.every(x=>x===undefined));
    for(const n of nodes.filter(n=>n.kind!=='panner'))assert.equal(n.disconnectCalls,1,'core cleanup idempotence');
  }
  // Reclamation counts only; existing panner wrapper may disconnect on every late callback.
  return {file:source.file,id:scenario.id,status:obligations.length?'FAIL_CLEANUP_REQUIRED':'PASS',
    obligations,sameError:!!scenario.failure&&caught===injected,immediate,afterTimers,
    timers:timers.map(t=>t.delay),initialTrace,completeTrace:events,rng,resources,returnedUndefined:returns.every(x=>x===undefined)};
}

const startedAt=new Date().toISOString(),records=[],normalControls=[];let fixtureErrors=0;
for(const source of sources)for(const scenario of CASES){
  try{
    const result=run(source,scenario);records.push(result);
    if(!scenario.failure){
      const old=run(source,scenario,true);
      assert.deepEqual(result.initialTrace,old.initialTrace);assert.deepEqual(result.completeTrace,old.completeTrace);
      assert.deepEqual(result.rng,old.rng);assert.deepEqual(result.immediate,old.immediate);
      assert.deepEqual(result.afterTimers,old.afterTimers);assert.deepEqual(result.resources,old.resources);
      normalControls.push({file:source.file,id:scenario.id,actualOldSourceSHA:sha(oldBackend(backend(source))),eventsRNGStateResourcesEqual:true});
    }
  }catch(error){fixtureErrors++;records.push({file:source.file,id:scenario.id,status:'FIXTURE_ERROR',error:String(error.stack||error)});}
}
for(const scenario of CASES.filter(x=>!x.failure)){
  const [a,b]=records.filter(x=>x.id===scenario.id);
  if(a.status==='PASS'&&b.status==='PASS'){
    assert.deepEqual(a.completeTrace,b.completeTrace);assert.deepEqual(a.rng,b.rng);assert.deepEqual(a.immediate,b.immediate);
  }
}
const pass=records.filter(x=>x.status==='PASS').length,fail=records.filter(x=>x.status==='FAIL_CLEANUP_REQUIRED').length;
console.log(JSON.stringify({startedAt,completedAt:new Date().toISOString(),groups:records.length,pass,fail,fixtureErrors,
  normalOldSourceControls:normalControls,sourceExecutions:records.length+normalControls.length,
  baseline:process.argv.includes('--baseline'),memoryCandidateExecutions:0,
  sources:sources.map(s=>({...s,blocks:s.blocks.map(({code,...x})=>x)})),records,
  sourcePreserved:sources.every(s=>sha(fs.readFileSync(path.join(ROOT,s.file)))===s.sha256),
  boundaries:{actual:'Full deathFX and actual backend/helpers/32 declarations, no function text substitutions in current cases.',
    synthetic:'Loaded .2s buffers from actual mapping keys; AudioNode/bus methods, .5 RNG,100ms clock,held timer/onended,VFX/particle sinks.',
    spatial:'Two same-frame ordinary deaths naturally select mono then -.35 pan; stage0 boss death naturally mono.',
    normal:'Old controls are actual original in baseline; final controls inverse only approved source edits, never copied backend.',
    unverified:['panner pan.value throwing before cleanup wrapper registration','src.buffer/playbackRate/gain assignment and gain.connect(mbus) before registration','constructor failures','eviction and damaged cleanup intrinsics','upstream kill/boss state','queue and RAF recovery','native AudioContext/device/timer/decode/listening','full game/player save storage'],
    residual:'Connect throw precedes timeout/onended registration; manual prefix timer residue is a source fixture result, not proof of permanent native resource leak.'}},null,2));
process.exitCode=fixtureErrors?2:fail?1:0;
