
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {parseExpressionAt} from 'acorn';
const ROOT='/Users/fordeargamers/Projects/exoduser-migration-20261001',sha=s=>createHash('sha256').update(s).digest('hex'),startedAt=new Date().toISOString();
const funcs=['deathFX','_deathBloodScale','_deathSfxKey','_pickDeathVar','_bossSfx','_playSampleNow','_sfxPri','_isSkillSfx','_isFootstepSfx','_evictLowest','_r'];
const consts=['_HUMANOID_ET','_INSECT_ET','_GHOST_ET','_FLESH_ET','_BONE_ET','_BEAST_ET','_MAGIC_ET','_ARMOR_ET','_DEATH_VARIANTS','_BOSS_SFX','_SFX_PRI','_SKILL_SFX_KEYS','_MAX_ACTIVE_NODES','_MAX_PROJ_NODES','_MAX_HIT_NODES','_MAX_STEP_NODES'];
function extract(s,n,c){const a=c?'const '+n+'=':'function '+n+'(',i=s.indexOf(a);assert.ok(i>=0,n);const p=parseExpressionAt(s,c?i+a.length:i,{ecmaVersion:'latest'});const code=s.slice(i,p.end)+(c?';':'');return{name:n,code,line:s.slice(0,i).split('\n').length,sha256:sha(code)};}
const sources=['game.html','game-easy-test.html'].map(file=>{const s=fs.readFileSync(ROOT+'/'+file,'utf8');return{file,sha256:sha(s),blocks:[...funcs.map(n=>extract(s,n,false)),...consts.map(n=>extract(s,n,true))]};});
assert.equal(sources[0].blocks.map(b=>b.code).join('\n'),sources[1].blocks.map(b=>b.code).join('\n'));
const original=sources[0].blocks.find(b=>b.name==='_playSampleNow').code;
const old='    src.connect(_panner);_panner.connect(gain);\n    const _dnP=function(){_dn();try{_panner.disconnect()}catch(e){}};\n    _nd._dn=_dnP;src.onended=_dnP;';
const neu='    const _dnP=function(){_dn();try{_panner.disconnect()}catch(e){}};\n    _nd._dn=_dnP;\n    src.connect(_panner);_panner.connect(gain);\n    src.onended=_dnP;';
assert.equal(original.split(old).length,2);
let candidate=original.replace(old,neu).replace('  if(pan&&Math.abs(pan)>0.05){','  try{\n  if(pan&&Math.abs(pan)>0.05){').replace('  try{src.start(startTime||0);}catch(e){_nd._dn();throw e;}','  src.start(startTime||0);\n  }catch(e){_nd._dn();throw e;}');
assert.notEqual(original,candidate);
if(process.argv.includes('--emit-patch')){console.log(JSON.stringify({targetFiles:sources.map(s=>({file:s.file,sourceSHA:s.sha256})),function:'_playSampleNow',originalSHA:sha(original),candidateSHA:sha(candidate),original,candidate},null,2));process.exit(0);}
const scenarios=[{id:'ch1-second-death-panner-connect',failure:'panner.connect',deaths:2},{id:'ch1-second-death-source-connect',failure:'source.connect',deaths:2},{id:'ch1-first-death-source-connect',failure:'source.connect',deaths:1},{id:'ch1-two-deaths-normal',failure:null,deaths:2},{id:'ch1-boss-death-normal',failure:null,deaths:1,boss:true}];
const records=[];for(const sc of scenarios)for(const patched of [false,true]){
 const trace=[],rng=[],timers=[],nodes=[];let sourceN=0,panN=0;const injected=new Error(sc.id);const ev=(type,data={})=>trace.push({type,...data});
 const math=Object.create(Math);math.random=()=>{rng.push(.5);return .5;};
 const contextAudio={createBufferSource(){const id=++sourceN,node={kind:'source',id,disconnected:false,buffer:null,playbackRate:{value:1},connect(to){ev('source.connect',{id,to:to.kind});if(sc.failure==='source.connect'&&id===sc.deaths)throw injected;},start(at){ev('source.start',{id,at,rate:node.playbackRate.value});},stop(){ev('source.stop',{id});},disconnect(){node.disconnected=true;ev('source.disconnect',{id});}};nodes.push(node);return node;},
 createGain(){const id=sourceN,node={kind:'gain',id,disconnected:false,gain:{value:0},connect(){ev('gain.connect',{id,value:node.gain.value});},disconnect(){node.disconnected=true;ev('gain.disconnect',{id});}};nodes.push(node);return node;},
 createStereoPanner(){const id=++panN,node={kind:'panner',id,disconnected:false,pan:{value:0},connect(){ev('panner.connect',{id,value:node.pan.value});if(sc.failure==='panner.connect')throw injected;},disconnect(){node.disconnected=true;ev('panner.disconnect',{id});}};nodes.push(node);return node;}};
 const buffers=new Proxy({}, {get:(t,k)=>({duration:.2,key:k})});
 const s={Math:math,IS_MOBILE:false,performance:{now:()=>100},_audioBuffers:buffers,_sampleFiles:{},_audioLoadPending:{},actx:()=>contextAudio,sfxVol:()=>1,mbus:()=>({kind:'bus'}),G:{stage:0},ELC:{},_partCnt:0,
 poolPart:(...args)=>ev('poolPart',{args}),playVFXAng:(...args)=>ev('playVFXAng',{args}),setTimeout:(fn,delay)=>{timers.push(fn);ev('timer',{delay});return timers.length;}};
 const c=vm.createContext(s);
 vm.runInContext('let _activeNodeCnt=0,_deathSfxCd=0,_deathSfxFrameMark=-1,_deathSfxFrameN=0,_deathSfxThrottled=false,_sfxFrameT=1;const _activeNodes=[];\n'+sources[0].blocks.map(b=>patched&&b.name==='_playSampleNow'?candidate:b.code).join('\n'),c);
 const snap=()=>JSON.parse(vm.runInContext('JSON.stringify({activeCount:_activeNodeCnt,nodes:_activeNodes.map(n=>({key:n.key,pri:n.pri})),deathCD:_deathSfxCd,frameMark:_deathSfxFrameMark,frameN:_deathSfxFrameN,throttled:_deathSfxThrottled})',c));
 let caught=null;for(let n=0;n<sc.deaths;n++){try{c.deathFX(10+n,20,8,'red',!!sc.boss,false,0);}catch(e){caught=e;break;}}
 assert.equal(caught===injected,!!sc.failure);
 const beforeCleanup=snap(),timersBefore=timers.length;
 if(sc.failure){assert.equal(beforeCleanup.activeCount,patched?sc.deaths-1:sc.deaths);assert.equal(timersBefore,sc.deaths-1);assert.equal(beforeCleanup.frameN,sc.deaths);if(patched){assert.ok(nodes.filter(n=>n.id===sc.deaths&&n.kind!=='panner').every(n=>n.disconnected));if(panN)assert.ok(nodes.find(n=>n.kind==='panner').disconnected);}}
 else{assert.equal(beforeCleanup.activeCount,sc.deaths);assert.equal(timersBefore,sc.deaths);}
 for(const cb of timers)cb();const afterCleanup=snap();
 assert.equal(afterCleanup.activeCount,sc.failure&&!patched?1:0);
 records.push({id:sc.id,patched,status:'PASS',sameError:caught===injected,beforeCleanup,afterCleanup,timersBefore,trace,rng,resources:nodes.map(({kind,id,disconnected})=>({kind,id,disconnected}))});
}
const normalEquivalence=[];for(const sc of scenarios.filter(s=>!s.failure)){const [a,b]=records.filter(r=>r.id===sc.id);assert.deepEqual(a.trace,b.trace);assert.deepEqual(a.rng,b.rng);assert.deepEqual(a.beforeCleanup,b.beforeCleanup);assert.deepEqual(a.afterCleanup,b.afterCleanup);normalEquivalence.push({id:sc.id,exactTrace:true,exactRNG:true,exactState:true});}
const result={taskId:'SOUND-ch1-death-spatial-connect-cleanup-1210',status:'SOURCE_PATCH_CANDIDATE',execution:{startedAt,completedAt:new Date().toISOString(),executions:records.length,failed:0,exitCode:0},sources:sources.map(s=>({...s,blocks:s.blocks.map(({code,...b})=>b)})),patch:{function:'_playSampleNow',originalSHA:sha(original),candidateSHA:sha(candidate),original,candidate},records,normalEquivalence,sourcePreserved:sources.every(s=>sha(fs.readFileSync(ROOT+'/'+s.file))===s.sha256),policies:{error:'same Error rethrow; no swallowing',RAF:'unchanged; no recovery claim',tail:'existing queue-finally discard unchanged; actual deathFX direct bypasses queue',deathCounter:'existing consumed frameN/CD preserved, no rollback/replay',priority:'unchanged',rootGate:'connection-failure synchronous cleanup expands current start-only cleanup; adoption owned by root'},productionApplied:false,nativeListening:false,limits:['actual full deathFX/backend/mapping source, synthetic AudioNodes and held timers/VFX recorders','entry is actual deathFX; upstream hurtE/kill or boss death-state/real input not executed','no start/flush/constructor/RAF previous tests rerun','no native device/decode/listening'],capacity:{allowNewOwnedFiles:false,observedChanges:82,newFiles:0}};
console.log(JSON.stringify(result,null,2));
