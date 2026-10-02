'use strict';
// Actual-source fragments with synthetic effects. No native/DOM/save execution.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const {test}=require('node:test');
const root=path.resolve(process.env.EXODUSER_SOURCE_ROOT||process.cwd());
const candidateMode=process.argv.includes('--candidate');
const pins={
  'game.html':'908102e7fdbf2b1d42ebb0f4e90476124bb8dbec8d22daa6babf3246def48525',
  'game-easy-test.html':'fba52654d8f316a1f54b48cdcb21dc251f4e9968f59eb031572c0ab71e845af7'
};
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const once=(source,re,label)=>{const m=[...source.matchAll(re)];assert.equal(m.length,1,label);return m[0];};
function fragments(source){
  const handler=once(source,/  fireAura\(\)\{([\s\S]*?)\n  \},\n  elemMissile/g,'actual fireAura handler')[1];
  const dispatcher=once(source,/function _execMagicE\(\)\{[\s\S]*?\n\}/g,'actual dedicated dispatch')[0];
  const completion=once(source,/\} else if\(_mcSk==='fireAura'&&P.skills.fireAura>=1\)\{([\s\S]*?)\} else if\(_mcSk==='fireBeam'/g,'actual manual aura completion')[1];
  const automatic=once(source,/if\(srcId==='giantSlam2'&&_isFused\('infernoSlam'\)&&P.skills.fireAura>=1\)\{[\s\S]*?\n  \}/g,'actual automatic inferno aura')[0];
  const boss=once(source,/  case'bossTeleDrop':\{[\s\S]*?\n    \}break\}/g,'actual teleDrop case')[0];
  return {handler,dispatcher,completion,automatic,boss};
}
function resourceRun(parts,{mp=200,level=1,cd=0,direct=false,complete=false,automatic=false}={}){
  const P={mp,skills:{fireAura:level},activeMagicSk:'fireAura',_faCd:cd,s:'idle',st2:0,facing:.75,x:7,y:11};
  const G={},events=[],useMpCalls=[];
  const showPH=(...a)=>events.push(['hint',...a]);
  const handler=new Function('P','showPH','_T','_L','pMagicSpd',parts.handler);
  const invoke=()=>handler(P,showPH,x=>x,(ko)=>ko,()=>2);
  if(direct)invoke();
  else{
    const factory=new Function('P','_MAGIC_E_HANDLERS','_gpActive','_gpAutoAim','pMagicSpd','useMp',parts.dispatcher+';return _execMagicE;');
    factory(P,{fireAura:invoke},false,()=>assert.fail('fallback aim'),()=>2,key=>{useMpCalls.push(key);return 37;})();
  }
  if(complete){
    new Function('P','G','magicRef','statInt','pMagicMul','_skMul','_fuseMul','EL','playSample','_r','_addSkProf',parts.completion)
      (P,G,()=>5,()=>2,()=>3,()=>7,()=>1,{F:1},(...a)=>events.push(['sample',...a]),x=>x,x=>events.push(['proficiency',x]));
  }
  if(automatic){
    new Function('srcId','_isFused','P','G','magicRef','statInt','pMagicMul','EL','playSample','_r',parts.automatic)
      ('giantSlam2',()=>true,P,G,()=>5,()=>2,()=>3,{F:1},(...a)=>events.push(['sample',...a]),x=>x);
  }
  return {P,G,events,useMpCalls};
}
function bossRun(parts,{state='idle',terminal=null,iframes=0,focus=false,parry=false}={}){
  const P={s:state,st2:41,x:5,y:9,iframes,baseAtk:13,facing:0};
  const e={s:'bossTeleDrop',st2:0,x:5,y:9,r:30,atk:10,el:1,facing:0,_teleDropY:-12};
  const G={hitStop:0,slowMo:0},events=[],taskMath=Object.create(Math);taskMath.random=()=>.4;
  const record=name=>(...a)=>events.push([name,...a]);
  const hurtP=damage=>{events.push(['hurtP',damage,P.s]);if(terminal)P.s=terminal;};
  const run=new Function('Math','e','P','G','OPT','sp','SFX','poolPart','shake','_addTpVland','_addBlastLight','addTxt','_T','dst','isPWin','wp','enhMulAtk','pParryDmg','hurtE','doParry','_poiseHit','hurtP','elMul','ar','_isFocusState','switch(e.s){'+parts.boss+'}');
  run(taskMath,e,P,G,{hitStop:100},1,{detonate:record('detonate'),groggy:record('groggy')},record('part'),record('shake'),record('landing'),record('light'),record('text'),x=>x,()=>0,()=>parry,()=>({atk:2,enh:0}),()=>0,()=>1,record('hurtE'),record('parry'),record('poise'),hurtP,()=>1,()=>({el:1}),()=>focus);
  return {P,e,G,events};
}
for(const [filename,pin] of Object.entries(pins)){
  let source=fs.readFileSync(path.join(root,filename),'utf8');
  if(candidateMode){
    assert.equal(sha(source),pin,'source9 base pin');
    const auraOld="    P.s='magicCast';P.st2=~~(10/pMagicSpd());P.atkArc=P.facing;return true;\n  },\n  elemMissile(){";
    assert.equal(source.split(auraOld).length-1,1);source=source.replace(auraOld,'    P.mp-=100;'+auraOld.slice(4));
    const duration=filename==='game.html'?300:150;
    const stunOld="          else{P.s='pStun';P.st2="+duration+';';
    assert.equal(source.split(stunOld).length-1,1);source=source.replace(stunOld,"          else if(P.s!=='fallen'&&P.s!=='dead'){P.s='pStun';P.st2="+duration+';');
  }
  const parts=fragments(source),duration=filename==='game.html'?300:150;
  test(filename+' learned handler: unlearned rejection retains MP/state',()=>{
    const r=resourceRun(parts,{mp:200,level:0,direct:true});assert.equal(r.P.mp,200);assert.equal(r.P.s,'idle');assert.equal(r.events.length,0);
  });
  test(filename+' cooldown handled without MP/fallback charge',()=>{
    const r=resourceRun(parts,{mp:200,cd:1});assert.equal(r.P.mp,200);assert.equal(r.P.s,'idle');assert.equal(r.events.length,1);assert.equal(r.useMpCalls.length,0);
  });
  test(filename+' MP just below threshold handled without fallback',()=>{
    const r=resourceRun(parts,{mp:99.999});assert.equal(r.P.mp,99.999);assert.equal(r.P.s,'idle');assert.equal(r.events.length,1);assert.equal(r.useMpCalls.length,0);
  });
  test(filename+' exact MP100 reaches dedicated cast with zero remaining',()=>{
    const r=resourceRun(parts,{mp:100});assert.equal(r.P.mp,0);assert.equal(r.P.s,'magicCast');assert.equal(r.P.st2,5);assert.equal(r.P.atkArc,.75);assert.equal(r.useMpCalls.length,0);
  });
  test(filename+' level10 success charges fixed100 once',()=>{
    const r=resourceRun(parts,{mp:1000,level:10});assert.equal(r.P.mp,900);assert.equal(r.P.s,'magicCast');assert.equal(r.useMpCalls.length,0);
  });
  test(filename+' actual completion creates manual600f without second charge',()=>{
    const r=resourceRun(parts,{mp:200,complete:true});assert.equal(r.P.mp,100);assert.equal(r.P._faCd,720);assert.equal(r.G._fireZones.length,1);assert.equal(r.G._fireZones[0].maxT,600);assert.equal(r.G._fireZones[0].follow,true);assert.equal(r.P.s,'magicRecover');assert.equal(r.P.st2,15);
  });
  test(filename+' automatic inferno300f remains an independent free path',()=>{
    const r=resourceRun(parts,{mp:200,level:1,direct:true,cd:1,automatic:true});assert.equal(r.P.mp,200);assert.equal(r.G._fireZones.length,1);assert.equal(r.G._fireZones[0].maxT,300);assert.equal(r.G._fireZones[0].follow,false);
  });
  for(const terminal of ['fallen','dead']){
    test(filename+' existing '+terminal+' survives while outer damage trace stays',()=>{
      const r=bossRun(parts,{state:terminal});assert.equal(r.P.s,terminal);assert.equal(r.P.st2,41);assert.deepEqual(r.events.filter(x=>x[0]==='hurtP'),[['hurtP',18,terminal]]);assert.equal(r.events.filter(x=>x[0]==='groggy').length,0);assert.equal(r.e.s,'bossRec');assert.equal(r.e.st2,35);assert.equal(r.G.hitStop,0);
    });
    test(filename+' hurtP transition to '+terminal+' cannot be overwritten',()=>{
      const r=bossRun(parts,{terminal});assert.equal(r.P.s,terminal);assert.equal(r.P.st2,41);assert.equal(r.events.filter(x=>x[0]==='hurtP').length,1);assert.equal(r.events.filter(x=>x[0]==='groggy').length,0);
    });
  }
  test(filename+' surviving ordinary landing keeps original stun and impact',()=>{
    const r=bossRun(parts);assert.equal(r.P.s,'pStun');assert.equal(r.P.st2,duration);assert.equal(r.events.filter(x=>x[0]==='hurtP').length,1);assert.equal(r.events.filter(x=>x[0]==='groggy').length,1);assert.equal(r.G.hitStop,8);assert.equal(r.G.slowMo,15);
  });
  test(filename+' focus keeps its original hurtP/message branch',()=>{
    const r=bossRun(parts,{focus:true});assert.equal(r.P.s,'idle');assert.equal(r.P.st2,41);assert.equal(r.events.filter(x=>x[0]==='hurtP').length,1);assert.ok(r.events.some(x=>x[0]==='text'&&x.includes('집중!')));assert.equal(r.events.filter(x=>x[0]==='groggy').length,0);
  });
  test(filename+' invulnerability/parry outer behavior remains unchanged',()=>{
    const inv=bossRun(parts,{iframes:1});assert.equal(inv.P.s,'idle');assert.equal(inv.events.filter(x=>x[0]==='hurtP').length,0);
    const par=bossRun(parts,{parry:true});assert.equal(par.P.s,'idle');assert.equal(par.events.filter(x=>x[0]==='hurtP').length,0);assert.equal(par.events.filter(x=>x[0]==='parry').length,1);assert.equal(par.e.stunned,60);
  });
}
