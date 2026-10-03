// Actual fireBow and ordinary LMB branch, with controlled input/stat/audio leaves.
// A branch continuation witness is not a complete update frame or native play.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),acorn=require('acorn');
const root=path.resolve(__dirname,'..'),dir=process.env.EXODUSER_TEST_SOURCE_DIR||root;
const baselineDir=process.env.EXODUSER_TEST_BASELINE_DIR;
const plain=x=>JSON.parse(JSON.stringify(x));
function extract(text){
  const fn=name=>{const start=text.indexOf('function '+name+'(');assert(start>=0,name);
    const n=acorn.parseExpressionAt(text,start,{ecmaVersion:'latest'});return text.slice(start,n.end);};
  const start=text.indexOf("else if(isAct('weapon')&&useStPct('weapon'))");assert(start>=0);
  assert.equal(text.indexOf("else if(isAct('weapon')&&useStPct('weapon'))",start+1),-1);
  const b=text.indexOf('{',start),tokens=acorn.tokenizer(text.slice(b),{ecmaVersion:'latest'});
  let depth=0,end;while(true){const t=tokens.getToken();assert.notEqual(t.type.label,'eof');
    if(t.type.label==='{')depth++;if(t.type.label==='}'&&--depth===0){end=b+t.end;break;}}
  const os=text.indexOf('const SFX=')+'const SFX='.length;
  const object=acorn.parseExpressionAt(text,os,{ecmaVersion:'latest'});
  const methods=['slash','bow'].map(name=>{const p=object.properties.find(p=>p.key?.name===name);assert(p);
    return name+':function'+text.slice(p.value.start,p.value.end);});
  return {bow:fn('fireBow'),melee:'function melee(){'+text.slice(start+5,end)+';return true}',
    shared:[fn('_r'),fn('stCost'),fn('useStPct'),'const SFX={'+methods.join(',')+'};'].join('\n')};
}
function fixture(parts,{type='crossbow',rngValue=.5,fault=null,mats=100,st=80,skill='',third=false,act=true,gp=false}={}){
  let rng=0,bwCalls=0;const events=[],logs=[],error=new Error('controlled '+fault);
  const effect=(name,...args)=>{events.push([name,...args]);if(fault===name)throw error;};
  const math=Object.create(Math);math.random=()=>{rng++;return rngValue};
  const weapon={btype:type,el:2,bowRange:100,bonusRange:2,bowProjSpd:8};
  const c={Math:math,console:{error:(...a)=>logs.push(a)},
    P:{x:10,y:20,facing:.2,s:'idle',st,skills:{kiSlash:1},activeLMBSk:skill,_bowBon:7},
    G:{mats,_pStats:{_atkC:0}},pProjs:[],BOWTYPES:{crossbow:{range:200},shortbow:{range:150}},
    bw:()=>{bwCalls++;if(fault==='bwSecond'&&bwCalls===2)throw error;return weapon},
    pBowRange:()=>1.2,bowRef:()=>100,pBowMul:()=>1,pBowSpd:()=>1.5,_eqAffix:()=>.2,
    _getPProj:()=>{effect('pool');return{}},playSample:(key,...a)=>effect('sample:'+key,...a),
    isAct:key=>key==='weapon'&&act,_gpActive:gp,_gpAutoAim:n=>effect('aim',n),
    _startSilvertailAttackMotion:s=>effect('motion',s),_cresStep:third?2:0,_cresComboT:third?10:0,
    _beginKiSlashThirdCharge:()=>effect('third'),_fireKiSlashCrescent:n=>effect('crescent',n),_lastCost:0,
    showPH:()=>{throw Error('unexpected shield message')}};
  vm.createContext(c);vm.runInContext(parts.shared+'\n'+parts.bow+'\n'+parts.melee,c);
  const state=()=>plain({P:c.P,G:c.G,projs:c.pProjs,events,rng,bwCalls,lastCost:c._lastCost});
  return {c,error,logs,state};
}
for(const file of ['game.html','game-easy-test.html']){
  const parts=extract(fs.readFileSync(path.join(dir,file),'utf8'));
  const before=baselineDir?extract(fs.readFileSync(path.join(baselineDir,file),'utf8')):parts;
  for(const type of ['crossbow','shortbow']){
    test(file+' '+type+' complete fireBow normal state/audio/RNG unchanged',()=>{
      const a=fixture(parts,{type}),b=fixture(before,{type});assert.equal(a.c.fireBow(),true);
      assert.equal(b.c.fireBow(),true);assert.deepEqual(a.state(),b.state());
      assert.equal(a.c.G.mats,99);assert.equal(a.c.P._bowBon,0);assert.equal(a.c.P.s,'bowRecover');
      assert.equal(a.c.P.st2,25);assert.equal(a.c.pProjs.length,1);assert.equal(a.c.pProjs[0].dmg,3021);
      assert.equal(a.c.pProjs[0].pierce,0);assert.equal(a.c.pProjs[0].normalBow,true);
    });
    test(file+' '+type+' synchronous shot audio fault still reaches actual recovery and return',()=>{
      const key=type==='crossbow'?'crossbow_shot':'bow_shot';
      const a=fixture(parts,{type,fault:'sample:'+key}),normal=fixture(parts,{type});
      assert.doesNotThrow(()=>assert.equal(a.c.fireBow(),true));normal.c.fireBow();
      assert.deepEqual(a.state(),normal.state());assert.equal(a.logs.length,1);
      assert.strictEqual(a.logs[0][1],a.error);
    });
  }
  test(file+' bow material rejection performs no audio or projectile work',()=>{
    const a=fixture(parts,{mats:0});assert.equal(a.c.fireBow(),false);
    assert.equal(a.c.P.s,'idle');assert.equal(a.c.pProjs.length,0);assert.equal(a.state().rng,0);
    assert.equal(a.state().bwCalls,0);assert.equal(a.logs.length,0);
  });
  for(const fault of ['pool','bwSecond'])test(file+' bow non-audio '+fault+' error still propagates',()=>{
    const a=fixture(parts,{fault}),b=fixture(before,{fault});
    assert.throws(()=>a.c.fireBow(),e=>e===a.error);assert.throws(()=>b.c.fireBow(),e=>e===b.error);
    assert.deepEqual(a.state(),b.state());assert.equal(a.logs.length,0);
  });
  for(const rngValue of [.2,.5]){
    test(file+' LMB voice '+rngValue+' normal state/RNG unchanged',()=>{
      const a=fixture(parts,{rngValue,gp:true}),b=fixture(before,{rngValue,gp:true});
      a.c.melee();b.c.melee();assert.deepEqual(a.state(),b.state());
      assert.equal(a.c.P.st,75);assert.equal(a.c.P._atkBon,7);assert.equal(a.c.P.s,'wSwing');
      assert.equal(a.c.P.st2,5);assert.equal(a.c.G._pStats._atkC,1);
    });
    test(file+' LMB voice '+rngValue+' swing audio fault preserves branch continuation',()=>{
      const key='sword_swing'+(Math.trunc(rngValue*3)+1);
      const a=fixture(parts,{rngValue,fault:'sample:'+key}),b=fixture(parts,{rngValue});
      assert.doesNotThrow(()=>assert.equal(a.c.melee(),true));b.c.melee();assert.deepEqual(a.state(),b.state());
      assert.equal(a.logs.length,1);assert.strictEqual(a.logs[0][1],a.error);
    });
  }
  for(const third of [false,true])test(file+' kiSlash '+(third?'third charge':'crescent')+' branch unchanged',()=>{
    const a=fixture(parts,{skill:'kiSlash',third}),b=fixture(before,{skill:'kiSlash',third});
    a.c.melee();b.c.melee();assert.deepEqual(a.state(),b.state());
    assert.equal(a.c.P.st,70);assert.equal(a.c.G._pStats._atkC,1);assert.equal(a.logs.length,0);
    assert(a.state().events.some(e=>e[0]===(third?'third':'crescent')));
  });
  test(file+' LMB insufficient ST remains rejected',()=>{
    const a=fixture(parts,{st:4});a.c.melee();assert.equal(a.c.P.st,4);assert.equal(a.c.P.s,'idle');
    assert.equal(a.c.G._pStats._atkC,0);assert.equal(a.state().events.length,0);
  });
  for(const fault of ['motion','aim','sample:voice_grunt'])test(file+' LMB other '+fault+' errors are not swallowed',()=>{
    const a=fixture(parts,{rngValue:.2,gp:true,fault}),b=fixture(before,{rngValue:.2,gp:true,fault});
    assert.throws(()=>a.c.melee(),e=>e===a.error);assert.throws(()=>b.c.melee(),e=>e===b.error);
    assert.deepEqual(a.state(),b.state());assert.equal(a.logs.length,0);
  });
}
