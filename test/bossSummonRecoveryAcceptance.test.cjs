'use strict';
// Portable source acceptance: reads current main/easy; no game/DOM/save execution.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const {test}=require('node:test');
const root=path.resolve(process.env.EXODUSER_SOURCE_ROOT||process.cwd());
const candidateMode=process.argv.includes('--candidate');
const pins={
  'game.html':'794d29274331d6c2fca1d213e27ccc6e7fe0f7e5ebd2f5edfdb63540b9572842',
  'game-easy-test.html':'2ee66501acee9c4822152987c4904a17d84f742833458381aa234db92212c03d'
};
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const recovery="      e.s='recover';e.st2=70;\n";
function extract(source){
  const found=source.match(/  case'bossSummonWind':\{[\s\S]*?\n    \}break\}/g);
  assert.equal(found?.length,1,'exactly one actual summon case');
  return found[0]+'\n';
}
function forward(old){
  assert.ok(!old.includes('finally'),'source8 case has no finally');
  const start=old.indexOf('      const cnt=3+~~(G.stage*.5);');
  const end=old.indexOf(recovery,start);
  assert.ok(start>=0&&end>start,'original spawn/recovery anchors');
  const inner=old.slice(start,end).replace(/^/gm,'  ').slice(0,-2);
  return old.slice(0,start)+'      try{\n'+inner+'      }finally{\n'+recovery+'      }\n'+old.slice(end+recovery.length);
}
function inverse(next){
  const open='      try{\n',close='      }finally{\n'+recovery+'      }\n';
  const a=next.indexOf(open),b=next.indexOf(close,a);
  assert.ok(a>=0&&b>a,'minimum finally anchors');
  const inner=next.slice(a+open.length,b).replace(/^  /gm,'');
  return next.slice(0,a)+inner+recovery+next.slice(b+close.length);
}
function executor(actualClause){
  // Only this real source clause is compiled for semantic execution.
  // Full HTML/classic scripts/import maps are deliberately not parsed here.
  return new Function('Math','e','G','EL','ens','mkEn','addParts','SFX','addTxt','poolPart','_L',
    'switch(e.s){\n'+actualClause+'\n}');
}
function run(actualClause,{stage=0,pending=false,failInsertion=false,marker=null}={}){
  let randomState=0x19a71;
  const randomTrace=[],events=[],created=[],insertionKeys=[];
  const taskMath=Object.create(Math);
  taskMath.random=()=>{randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;
    const n=randomState/4294967296;randomTrace.push(n);return n;};
  const e={s:'bossSummonWind',st2:pending?12:-2,x:137.25,y:-88.125,room:7};
  const G={stage},EL={P:0,F:1,I:2,D:3,L:4,H:5};
  const prefix=[{existing:'field-a',hp:93},{existing:'field-b',hp:117}];
  const prefixSnapshot=JSON.stringify(prefix),target=prefix.slice();
  let failed=false;
  const ens=failInsertion?new Proxy(target,{
    set(array,key,value,receiver){
      insertionKeys.push(String(key));
      // Native Array.prototype.push performs these writes; no push stub.
      if(key===String(prefix.length+1)&&!failed){failed=true;throw marker;}
      return Reflect.set(array,key,value,receiver);
    }
  }):target;
  assert.equal(ens.push,Array.prototype.push,'real native Array.push');
  const mkEn=(...args)=>{
    events.push(['mkEn',...args,e.s,e.st2]);
    const ne={created:created.length,args,hp:83+created.length*2,mhp:83+created.length*2,
      eShield:19,eShieldMax:19,environmentTag:'synthetic-mkEn'};
    created.push(ne);return ne;
  };
  const addParts=(...args)=>events.push(['addParts',...args,e.s,e.st2]);
  const SFX={charge:()=>events.push(['charge',e.s,e.st2])};
  const addTxt=(...args)=>events.push(['addTxt',...args,e.s,e.st2]);
  const poolPart=(...args)=>events.push(['poolPart',...args,e.s,e.st2]);
  let error=null;
  try{executor(actualClause)(taskMath,e,G,EL,ens,mkEn,addParts,SFX,addTxt,poolPart,(ko)=>ko);}
  catch(thrown){error=thrown;}
  assert.equal(target[0],prefix[0]);assert.equal(target[1],prefix[1]);
  assert.equal(JSON.stringify(prefix),prefixSnapshot,'pre-existing field actors preserved');
  return {e,target,created,events,randomTrace,insertionKeys,error,
    trace:JSON.stringify({target,created,events,randomTrace,insertionKeys})};
}
for(const filename of Object.keys(pins)){
  const input=fs.readFileSync(path.join(root,filename),'utf8');
  const current=extract(input);
  if(candidateMode)assert.equal(sha(input),pins[filename],'source8 full input pin');
  else assert.ok(current.includes('}finally{'),'production must include accepted recovery finally');
  const old=candidateMode?current:inverse(current),next=candidateMode?forward(current):current;
  assert.equal(inverse(next),old,'case inverse exact');
  assert.equal(forward(old),next,'minimum forward recipe exact');
  assert.equal(Buffer.byteLength(next)-Buffer.byteLength(old),59);
  for(const stage of [0,3,34]){
    test(filename+' native array normal trace, stage '+stage,t=>{
      const before=run(old,{stage}),after=run(next,{stage});
      assert.equal(before.error,null);assert.equal(after.error,null);
      assert.equal(after.trace,before.trace,'complete RNG/arguments/side-effect trace unchanged');
      const expected=3+~~(stage*.5);
      assert.equal(after.created.length,expected);assert.equal(after.target.length,expected+2);
      for(let i=0;i<expected;i++){
        const ne=after.target[i+2];assert.equal(ne,after.created[i]);
        assert.equal(ne.hp,~~((83+i*2)*.5));assert.equal(ne.mhp,ne.hp);
        assert.equal(ne.eShield,0);assert.equal(ne.eShieldMax,0);
        assert.equal(ne.args[2],stage);assert.equal(ne.args[4],false);assert.equal(ne.args[6],7);
        assert.ok([0,2,3].includes(ne.args[3]));assert.ok([0,1,2,3,4,5].includes(ne.args[5]));
      }
      assert.deepEqual(after.e,{...before.e,s:'recover',st2:70});
      t.diagnostic(JSON.stringify({stage,count:expected,traceSha:sha(after.trace),s:after.e.s,st2:after.e.st2}));
    });
  }
  test(filename+' native push failure after one successful insertion',t=>{
    const marker=new TypeError('synthetic native array insertion failure');
    const before=run(old,{stage:3,failInsertion:true,marker});
    const after=run(next,{stage:3,failInsertion:true,marker});
    assert.equal(before.error,marker);assert.equal(after.error,marker,'same exception identity propagated');
    assert.equal(after.trace,before.trace,'partial insertion, RNG and side effects unchanged');
    assert.equal(after.created.length,2);assert.equal(after.target.length,3);
    assert.equal(after.target[2],after.created[0],'already inserted minion retained');
    assert.ok(!after.target.includes(after.created[1]),'failed insertion not added');
    assert.equal(after.events.filter(v=>v[0]==='addParts').length,1);
    assert.equal(after.events.filter(v=>v[0]==='charge'||v[0]==='addTxt').length,0);
    assert.equal(before.e.s,'bossSummonWind');assert.equal(before.e.st2,-2);
    assert.equal(after.e.s,'recover');assert.equal(after.e.st2,70);
    t.diagnostic(JSON.stringify({boundary:'native Array.push index write',prefix:2,retainedSpawn:1,
      created:2,errorIdentity:true,s:after.e.s,st2:after.e.st2,reentryExecuted:false}));
  });
  test(filename+' pending windup retains state and does not spawn',()=>{
    const before=run(old,{stage:0,pending:true}),after=run(next,{stage:0,pending:true});
    assert.equal(after.trace,before.trace);assert.deepEqual(after.e,before.e);
    assert.equal(after.e.s,'bossSummonWind');assert.equal(after.e.st2,12);
    assert.equal(after.created.length,0);assert.equal(after.error,null);
  });
}
