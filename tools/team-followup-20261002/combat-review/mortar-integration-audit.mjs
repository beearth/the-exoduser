import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'../../..');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const guard="\n  if(P.mp<mpCost('mortar')){showPH(_T('MP 부족!'),'#4488ff');return}";
const startedAt=new Date().toISOString(),checks=[],evidence=[];
const startStatus=execFileSync('git',['status','--short','--untracked-files=all'],{cwd:root,encoding:'utf8'});
function check(name,fn){try{fn();checks.push({name,status:'PASS'});}catch(e){checks.push({name,status:'FAIL',message:String(e)});}}
function fn(src,name){
  const b=src.indexOf('function '+name+'(');assert.ok(b>=0,'missing '+name);
  const lineEnd=src.indexOf('\n',b),line=src.slice(b,lineEnd);
  if(line.includes('}'))return line;
  const end=src.indexOf('\n}',b);assert.ok(end>0,'missing close '+name);return src.slice(b,end+2);
}
function obj(src,name){const b=src.indexOf('const '+name+'={');const e=src.indexOf('\n};',b);assert.ok(b>=0&&e>b);return src.slice(b,e+3);}
function extract(src){
  const aimStart=src.indexOf("case 'maliceMortar':"),aimEnd=src.indexOf("case 'boneWall':",aimStart);
  const confirmStart=src.indexOf('if(P._mmAiming){',src.indexOf('// ═══ 폭풍소환 — 조준'));
  const confirmEnd=src.indexOf('// ═══ 벽소환',confirmStart);
  assert.ok(aimStart>=0&&aimEnd>aimStart&&confirmStart>=0&&confirmEnd>confirmStart);
  return {aim:src.slice(aimStart+"case 'maliceMortar':".length,aimEnd).trimEnd(),
    confirm:src.slice(confirmStart,confirmEnd).trimEnd(),fire:fn(src,'fireMaliceMortar'),
    costs:['_COST_BASE','_COST_SK','_COST_DPS'].map(n=>obj(src,n)).join('\n')+'\n'+
      ['_skLv','_dpsCostMul','pMagicCost','mpCost','useMp','_r'].map(n=>fn(src,n)).join('\n')};
}
function rig(s,{patched=false,lv=1,passive=0,affix=0,unique=0,fused=false,seed=.2}={}){
  const counts={rng:0,sfx:0,sample:0,shake:0,messages:[]};
  const P={x:10,y:20,facing:.4,mp:9999,skills:{maliceMortar:lv,iceOrb:fused?1:0},_mmCd:0,_ioCd:0,_mmDist:150,_mmAiming:false,_mmCharging:false};
  const c={P,G:{cam:{x:0,y:0}},PASSIVES:{pMagic:passive},KH:{},K:{},MBjust:[false,false,false],sp:1,
    _eqAffix:()=>affix,_uEq:()=>unique,_isFused:()=>fused,
    SFX:{magic:()=>counts.sfx++},EL:{I:1,D:2},playSample:()=>counts.sample++,shake:()=>counts.shake++,
    showPH:m=>counts.messages.push(m),_T:x=>x,_gpActive:false,mouse:{x:0,y:0},VW:0,VH:0,
    Math:Object.assign(Object.create(Math),{random:()=>{counts.rng++;return seed;}})};
  vm.createContext(c);
  const fire=patched?s.fire.replace('function fireMaliceMortar(_tx,_ty){','function fireMaliceMortar(_tx,_ty){'+guard):s.fire;
  vm.runInContext('let _lastCost=0;\n'+s.costs+'\n'+fire+'\nfunction aim(keyCode){let _skOk=false;switch(1){case 1:'+s.aim+'}return _skOk;}\nfunction confirm(){'+s.confirm+'}\nfunction lastCost(){return _lastCost;}',c);
  return {c,counts,cost:()=>c.mpCost('mortar'),aim:()=>c.aim('Digit1'),confirm:()=>c.confirm(),state:()=>JSON.parse(JSON.stringify({P:c.P,bomb:c.G._mmBomb,lastCost:c.lastCost(),counts}))};
}
const files=['game.html','game-easy-test.html'];
const frozen=fn(fs.readFileSync(path.join(root,'tools/team-followup-20261001/SKILL/mortar-confirm-source-before.txt'),'utf8'),'fireMaliceMortar');
const sources={};
for(const file of files){
  const src=fs.readFileSync(path.join(root,file),'utf8'),s=extract(src);sources[file]={fileSha:hash(src),slices:Object.fromEntries(Object.entries(s).map(([k,v])=>[k,{sha256:hash(v),chars:v.length}]))};
  check(file+' current fire is preserved owner frozen byte sequence',()=>assert.equal(s.fire.trimEnd(),frozen));
  check(file+' existing owner patch scratchpad destination is not git-apply ready',()=>{
    let error;
    try{execFileSync('git',['apply','--check',path.join(root,'tools/team-followup-20261001/SKILL/mortar-confirm-source-'+(file==='game.html'?'game':'easy')+'.patch')],{cwd:root,encoding:'utf8',stdio:'pipe'});}catch(e){error=e;}
    assert.ok(error);assert.match(String(error.stderr),/scratchpad\/mm\/.*No such file or directory/);
  });
  check(file+' normalized target patch hunk equals preserved owner candidate',()=>{
    const owner=fs.readFileSync(path.join(root,'tools/team-followup-20261001/SKILL/mortar-confirm-source-'+(file==='game.html'?'game':'easy')+'.patch'),'utf8');
    const normalized=fs.readFileSync(path.join(here,'mortar-integration-targets.patch'),'utf8');
    const begin=normalized.indexOf('--- a/'+file+'\n');const next=normalized.indexOf('--- a/',begin+1);
    const one=normalized.slice(begin,next<0?undefined:next);
    assert.equal(one.split('\n').slice(2).join('\n'),owner.split('\n').slice(2).join('\n'));
  });
  for(const config of [{lv:1},{lv:5,passive:3},{lv:20,affix:.1},{lv:10,passive:20,affix:.2}]){
    const label=JSON.stringify(config);
    check(file+' actual cost path, fractional affordability '+label,()=>{
      const original=rig(s,config),candidate=rig(s,{...config,patched:true});
      const cost=original.cost();assert.ok(cost>0);assert.equal(candidate.cost(),cost);
      for(const r of [original,candidate]){r.c.P.mp=cost;assert.equal(r.aim(),true);r.c.P.mp=cost-.25;r.c.MBjust[0]=true;r.confirm();}
      assert.ok(original.c.G._mmBomb,'original defect must remain reproducible');
      assert.equal(candidate.c.G._mmBomb,undefined);assert.equal(candidate.c.P.mp,cost-.25);assert.equal(candidate.c.P._mmCd,0);assert.equal(candidate.c.P._mmAiming,true);
      assert.deepEqual(candidate.counts,{rng:0,sfx:0,sample:0,shake:0,messages:['MP 부족!']});
      evidence.push({file,config,actualCost:cost,mpAtConfirm:cost-.25,original:original.state(),candidate:candidate.state()});
    });
    for(const seed of [.2,.8])check(file+' exact-cost valid source state/RNG parity '+label+' seed'+seed,()=>{
      const original=rig(s,{...config,seed}),candidate=rig(s,{...config,patched:true,seed});
      for(const r of [original,candidate]){r.c.P.mp=r.cost();assert.equal(r.aim(),true);r.c.KH.Digit1=true;r.confirm();r.c.KH.Digit1=false;r.confirm();}
      assert.deepEqual(candidate.state(),original.state());assert.equal(candidate.c.P.mp,0);assert.equal(candidate.c.P._mmCd,660);
    });
  }
  check(file+' current pMagicCost changing during aim is rechecked at confirm',()=>{
    const r=rig(s,{patched:true,lv:5,passive:5});const before=r.cost();r.c.P.mp=before;assert.equal(r.aim(),true);
    r.c.PASSIVES.pMagic=0;const after=r.cost();assert.ok(after>before);r.c.MBjust[0]=true;r.confirm();
    assert.equal(r.c.G._mmBomb,undefined);assert.equal(r.c.P.mp,before);assert.equal(r.counts.rng,0);
    evidence.push({file,dynamicCost:{before,after,mp:r.c.P.mp}});
  });
  check(file+' failed release does not retry/spam without a new confirm input',()=>{
    const r=rig(s,{patched:true});r.c.P.mp=r.cost();r.aim();r.c.P.mp=0;r.c.KH.Digit1=true;r.confirm();r.c.KH.Digit1=false;r.confirm();
    assert.equal(r.c.P._mmCharging,false);for(let i=0;i<4;i++)r.confirm();assert.deepEqual(r.counts.messages,['MP 부족!']);assert.equal(r.counts.rng,0);
  });
  check(file+' failed fused confirm preserves existing bomb/cooldown until fresh input',()=>{
    const r=rig(s,{patched:true,fused:true});r.c.P.mp=r.cost();r.aim();const existing={phase:'vortex',sentinel:'fixture'};r.c.G._mmBomb=existing;r.c.P.mp=r.cost()-.25;r.c.P._ioCd=77;r.c.MBjust[0]=true;r.confirm();
    assert.equal(r.c.G._mmBomb,existing);assert.equal(r.c.P._ioCd,77);assert.equal(r.counts.rng,0);
  });
}
check('both current relevant source slices are equal',()=>assert.deepEqual(sources['game.html'].slices,sources['game-easy-test.html'].slices));
check('combined identical-hunk normalized patch is git-apply check ready',()=>execFileSync('git',['apply','--check',path.join(here,'mortar-integration-targets.patch')],{cwd:root,encoding:'utf8',stdio:'pipe'}));
const result={task:'combat-review-mortar-integration-readiness',startedAt,completedAt:new Date().toISOString(),head:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),startGitItems:startStatus.trim()?startStatus.trimEnd().split('\n').length:0,sources,checks,evidence,pass:checks.filter(x=>x.status==='PASS').length,fail:checks.filter(x=>x.status==='FAIL').length,
  productionApplied:false,normalizedPatch:'mortar-integration-targets.patch; headers only changed, owner hunk bytes identical',limits:['Actual source aim/confirm/fire/cost/RNG helper slices; game/DOM/physics not executed','Actual pMagicCost with fixture PASSIVES/affix/unique lookups; audio effects are counters, not playback','Whole-program RNG behavior and actual game MP-change play are not verified','Existing owner patch is preserved; derivative changes only target header paths and is not applied','Source readiness is not runtime or visual acceptance']};
fs.writeFileSync(path.join(here,'mortar-integration-evidence.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({pass:result.pass,fail:result.fail,head:result.head,startGitItems:result.startGitItems,sources:result.sources},null,2));
process.exitCode=result.fail?1:0;
