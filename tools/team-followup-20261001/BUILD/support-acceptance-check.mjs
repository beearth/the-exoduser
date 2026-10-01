import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
const root=new URL('../../../',import.meta.url),rows=[],comparisons=[],findings=[],sources=[];
const startedAt=new Date().toISOString();
const files=['game.html','game-easy-test.html','tools/team-followup-20261001/ITEM/enemy-support-probe.js','tools/team-followup-20261001/ENEMY/et3-probe.fixed.js','tools/team-followup-20261001/BALANCE/skill-support-probe.js','tools/team-followup-20261001/SKILL/ice-cancel-probe.safe.js','tools/team-followup-20261001/UIUX/art-support-finalcrop.mjs','tools/team-followup-20261001/UIUX/art-support-source-fixture.mjs','tools/team-followup-20261001/ART/wa24-delta-probe.cjs'];
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const read=file=>fs.readFileSync(new URL(file,root),'utf8');
for(const file of files)sources.push({file,sha256:hash(read(file))});
const {predictFinalCrop}=await import('../UIUX/art-support-finalcrop.mjs');
const {actualDraw,line,sourceEvidence}=await import('../UIUX/art-support-source-fixture.mjs');
const {default:art}=await import('../ART/wa24-delta-probe.cjs');
const enemyBefore=read(files[3]),enemyAfter=read(files[2]),skillBefore=read(files[5]),skillAfter=read(files[4]);
function check(name,action){try{action();rows.push({name,status:'PASS'});}catch(error){rows.push({name,status:'FAIL',error:error.stack});}}
function enemy(source,initial=0,commit=true){
  const sandbox={};vm.runInNewContext(source,sandbox);
  let tick=initial,callback=null,cancelled=0;
  const target={etype:3,alive:true,s:'idle',x:100,y:0,projT:9999,projCd:9999,_projChargeT:0},projs=[];
  const functions={_fireChargedProj:()=>{if(commit)projs.push({commit:true});},_spawnBossProjectile:()=>{}},originals={...functions};
  const host={getTick:()=>tick,getG:()=>({on:true}),getP:()=>({x:0,y:0}),getEns:()=>[target],getRange:()=>({3:200}),getProjs:()=>projs,getFn:name=>functions[name],setFn:(name,value)=>{functions[name]=value;},raf:fn=>{callback=fn;return 1;},caf:()=>{cancelled++;callback=null;}};
  const probe=sandbox.__createET3Probe(host);probe.install();
  return {probe,target,functions,originals,host,step(value){tick=value;const fn=callback;callback=null;fn();},stop(){const result=probe.stop();return result;},cancelled:()=>cancelled,pending:()=>!!callback};
}
for(const [name,value] of [['null',null],['missing',undefined],['NaN',NaN],['Infinity',Infinity],['stalled',12]])check('ENEMY451rAF '+name,()=>{
  const before=enemy(enemyBefore,value),after=enemy(enemyAfter,value);
  for(let index=0;index<451;index++){before.step(value);after.step(value);}
  const original=before.stop(),candidate=after.stop();comparisons.push({team:'ENEMY',input:{name,raf:451,tick:String(value)},original,candidate});
  assert.equal(candidate.verdict,'INCONCLUSIVE');assert.equal(candidate.residency.inRangeTicks,0);assert.equal(candidate.tickHealth.rafSamples,451);
});
check('ENEMY backward after budget never recovers',()=>{
  const env=enemy(enemyAfter);for(let tick=1;tick<=460;tick++)env.step(tick);env.step(2);for(let tick=461;tick<=480;tick++)env.step(tick);
  const result=env.stop();assert.equal(result.verdict,'INCONCLUSIVE');assert.equal(result.elapsedTicks,null);comparisons.push({team:'ENEMY',input:'1..460,2,461..480',candidate:result});
});
check('ENEMY normal physics vs refresh counts / cleanup',()=>{
  const env=enemy(enemyAfter);for(let tick=1;tick<=460;tick++)for(let refresh=0;refresh<4;refresh++)env.step(tick);
  const result=env.stop();assert.equal(result.verdict,'FAIL_NO_FIRE');assert.equal(result.residency.inRangeTicks,460);assert.equal(result.tickHealth.rafSamples,1840);assert.equal(result.tickHealth.physicalAdvances,460);assert.equal(env.functions._fireChargedProj,env.originals._fireChargedProj);assert.equal(env.pending(),false);
  comparisons.push({team:'ENEMY',input:'460physics x4refresh',candidate:result});
});
check('ENEMY actual wrapper commit and no commit differentiated',()=>{
  for(const commit of [false,true]){
    const env=enemy(enemyAfter,0,commit);env.step(1);env.target._projChargeT=60;env.step(2);env.step(62);env.functions._fireChargedProj(env.target);
    const result=env.stop();assert.equal(result.verdict,commit?'PASS':'FAIL_PATH');assert.equal(!!result.firstFire,commit);comparisons.push({team:'ENEMY',input:{commit,ticks:[1,2,62]},candidate:result});
  }
});
check('ENEMY cleanup preserves later foreign wrapper',()=>{
  const env=enemy(enemyAfter),foreign=()=>{};env.functions._fireChargedProj=foreign;env.stop();assert.equal(env.functions._fireChargedProj,foreign);assert.equal(env.functions._spawnBossProjectile,env.originals._spawnBossProjectile);
});
function skill(source,reader,options={}){
  const sandbox={};vm.runInNewContext(source,sandbox);const listeners=new Map(),pending=new Map(),attempts=[];let next=0;
  const win={addEventListener(type,fn){listeners.set(type,fn);},removeEventListener(type){attempts.push(type);if(options.remove===type)throw Error('remove '+type);listeners.delete(type);},requestAnimationFrame(fn){const id=++next;pending.set(id,fn);return id;},cancelAnimationFrame(id){attempts.push('cancel:'+id);if(options.cancel)throw Error('cancel before release');pending.delete(id);}};
  const probe=sandbox.IceCancelProbe.install({win,readRaw:reader,now:()=>0});
  return {probe,win,listeners,pending,attempts,options,step(){const [id,fn]=pending.entries().next().value;pending.delete(id);fn();}};
}
const raw=patch=>({aim:false,mp:100,stk:0,rech:100,zones:[],...patch});
check('SKILL endpoints original false recharge -> candidate UNKNOWN',()=>{
  for(const [name,source] of [['original',skillBefore],['candidate',skillAfter]]){
    let state=raw({aim:true});const env=skill(source,()=>state);state=raw({stk:1,rech:99});env.step();const result=env.probe.dump();comparisons.push({team:'SKILL',input:'aimtrue/rech100/stk0 -> aimfalse/rech99/stk1',name,result,verdict:env.probe.verdict()});
    if(name==='candidate'){assert.equal(result.counts.rechargeTicks,0);assert.equal(result.counts.stkRefund,0);assert.equal(env.probe.verdict().verdict,'UNKNOWN');}else assert.equal(result.counts.rechargeTicks,1);env.probe.dispose();
  }
});
check('SKILL complete two-update trace vs partial trace',()=>{
  for(const partial of [false,true]){
    let state=raw({updateSeq:0});const env=skill(skillAfter,()=>state);
    const trace=[{updateSeq:1,beforeStk:0,beforeRech:100,afterStk:1,afterRech:1500,max:3,sp:100},{updateSeq:2,beforeStk:1,beforeRech:1500,afterStk:2,afterRech:1500,max:3,sp:1500}];
    state=raw({stk:2,rech:1500,updateSeq:2,rechargeTrace:partial?trace.slice(1):trace});env.step();const result=env.probe.dump();assert.equal(result.counts.rechargeTicks,partial?0:2);assert.equal(result.counts.unknownCharge,partial?1:0);comparisons.push({team:'SKILL',input:{partial,trace:state.rechargeTrace},candidate:result});env.probe.dispose();
  }
});
check('SKILL trace wrong before/reset/sp becomes UNKNOWN',()=>{
  for(const patch of [{beforeRech:99},{sp:1},{afterRech:99},{updateSeq:2}]){
    let state=raw({updateSeq:0});const env=skill(skillAfter,()=>state);state=raw({stk:1,rech:1500,updateSeq:1,rechargeTrace:[{updateSeq:1,beforeStk:0,beforeRech:100,afterStk:1,afterRech:1500,max:3,sp:100,...patch}]});env.step();assert.equal(env.probe.verdict().verdict,'UNKNOWN');env.probe.dispose();
  }
});
check('SKILL installation reader throw original leak and candidate cleanup',()=>{
  const sandbox={};vm.runInNewContext(skillBefore,sandbox);const oldListeners=new Map();let oldError;
  try{sandbox.IceCancelProbe.install({win:{addEventListener(type,fn){oldListeners.set(type,fn);},removeEventListener(type){oldListeners.delete(type);},requestAnimationFrame(){return 1;},cancelAnimationFrame(){}},readRaw(){throw Error('install-reader');}});}catch(error){oldError=error.message;}
  assert.equal(oldListeners.size,3);assert.equal(oldError,'install-reader');
  const env=skill(skillAfter,()=>{throw Error('install-reader');});assert.equal(env.listeners.size,0);assert.equal(env.pending.size,0);assert.equal(env.probe.verdict().verdict,'UNKNOWN');comparisons.push({team:'SKILL',input:'install-read throw',original:{listeners:oldListeners.size,error:oldError},candidate:env.probe.dump()});
});
check('SKILL rAF reader throw records and clears',()=>{
  let fail=false;const env=skill(skillAfter,()=>{if(fail)throw Error('raf-reader');return raw();});fail=true;env.step();assert.equal(env.listeners.size,0);assert.equal(env.pending.size,0);assert.equal(env.probe.verdict().verdict,'UNKNOWN');comparisons.push({team:'SKILL',input:'raf-read throw',candidate:env.probe.dump()});
});
for(const remove of ['mousedown','mouseup','contextmenu'])check('SKILL remove exception attempts others '+remove,()=>{
  const env=skill(skillAfter,()=>raw(),{remove});env.probe.dispose();assert.equal(env.attempts.filter(value=>!value.startsWith('cancel')).length,3);assert.equal(env.listeners.size,1);assert.equal(env.probe.verdict().verdict,'UNKNOWN');env.options.remove=null;env.probe.dispose();assert.equal(env.listeners.size,0);
});
check('SKILL cancel throws before release: tracked RAF id must remain retryable',()=>{
  const env=skill(skillAfter,()=>raw(),{cancel:true});env.probe.dispose();const before=env.pending.size;env.options.cancel=false;env.probe.dispose();const remaining=env.pending.size;
  findings.push({id:'S1',input:'cancelAnimationFrame(id) throws before deleting pending id; retry succeeds if called with old id',expected:'old scheduled id retained and retry can cancel',actual:{before,remaining,attempts:env.attempts,diag:env.probe._diag()},scope:'disposed callback is inert if it later runs; immediate resource release not guaranteed'});
  env.pending.clear();assert.equal(remaining,0);
});
check('SKILL rAF field getter throws: cleanup/UNKNOWN contract',()=>{
  let state=raw();const env=skill(skillAfter,()=>state);state=raw();Object.defineProperty(state,'zones',{get(){throw Error('zones-getter');}});let thrown;try{env.step();}catch(error){thrown=error.message;}
  const actual={thrown,listeners:env.listeners.size,disposed:env.probe._diag().disposed,verdict:env.probe.verdict()};findings.push({id:'S2',input:'readRaw returns object whose zones getter throws during rAF processing',expected:'error recorded, disposed, listeners0, UNKNOWN',actual,scope:'injected/custom reader object; default reader result is plain; whole processing exception guarantee absent'});env.probe.dispose();assert.equal(actual.listeners,0);assert.equal(actual.disposed,true);assert.equal(actual.verdict.verdict,'UNKNOWN');
});
for(const [width,height] of [[1920,1080],[2560,1080],[1920,1200],[1024,768]])for(const elapsed of [400,1200,2399])check('ART full source transform '+width+'x'+height+'/'+elapsed,()=>{
  const original=art.predictWa24Crop(width,height,2560,1440),candidate=predictFinalCrop({fullW:width,fullH:height,lines:[line],lineIdx:0,lineStartMs:0,now:elapsed});
  const actual=actualDraw(width,height,elapsed);const close=(got,want)=>assert.ok(Math.abs(got-want)<1e-8,got+' vs '+want);
  for(const key of ['x','y','w','h']){close(candidate.clip[key],actual.clip[key]);close(candidate.drawRect[key],actual.drawRect[key]);}
  for(let index=0;index<6;index++)close(candidate.matrix[index],actual.matrix[index]);
  const inverseY=(actual.clip.y-actual.drawRect.y)/actual.drawRect.h*1440;const inverseEnd=(actual.clip.y+actual.clip.h-actual.drawRect.y)/actual.drawRect.h*1440;
  close(candidate.visibleSourceRect.y,Math.max(0,inverseY));close(candidate.visibleSourceRect.h,Math.max(0,Math.min(1440,inverseEnd)-Math.max(0,inverseY)));
  assert.equal(candidate.eyeVerdict,'UNKNOWN');assert.equal(candidate.footVerdict,'UNKNOWN');assert.equal(candidate.subtitleVerdict,'UNKNOWN');comparisons.push({team:'ART',input:{width,height,elapsed},original,candidate,actual});
});
check('ART fade zero never visibility proof',()=>{
  const result=predictFinalCrop({fullW:1920,fullH:1080,lines:[line],lineIdx:0,lineStartMs:0,now:0});assert.equal(result.fadeAlpha,0);assert.equal(result.visibilityEvidence,'HIDDEN_FADE_NO_VISIBILITY_EVIDENCE');assert.equal(result.eyeVerdict,'UNKNOWN');
});
check('all original/candidate/source hashes unchanged',()=>{for(const entry of sources)assert.equal(hash(read(entry.file)),entry.sha256);});
const result={startedAt,completedAt:new Date().toISOString(),kind:'independent-three-support-VM-and-source-geometry',sources,sourceDrawEvidence:sourceEvidence,rows,comparisons,findings,pass:rows.filter(row=>row.status==='PASS').length,fail:rows.filter(row=>row.status==='FAIL').length,limits:['No pixels or browser; ART geometry is not visual acceptance','SKILL traces injected, no actual game trace supply','Counterexamples S1/S2 must be scoped to cancellation/processing contracts']};
fs.writeFileSync(new URL('./support-acceptance-evidence.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({pass:result.pass,fail:result.fail,findings:findings.length}));process.exitCode=result.fail?1:0;
