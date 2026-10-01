import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const before=JSON.parse(readFileSync(new URL('../tools/team-followup-20261001/root-review/hellray-before-20261002.json',import.meta.url),'utf8'));
function extract(source){
  const start=source.search(/^ {2}if\(P\._hrAiming\)\{\r?$/m);
  const end=source.indexOf('// ═══ 해골번개 쿨다운',start);
  assert(start>=0&&end>start);
  return source.slice(start,end);
}
function fixture(block,{mp=100,stk=1,fused=false,cancel=false,escape=false}={}){
  const calls=[];const math=Object.create(Math);math.random=()=>{calls.push('random');return .25;};
  const c=vm.createContext({
    P:{x:0,y:0,mp,skills:{hellRay:3,maliceStorm:2},_hrStk:stk,_hrRech:0,_hrAiming:true},
    G:{cam:{x:0,y:0},_fireZones:[]},mouse:{x:2000,y:0},VW:0,VH:0,sp:1,dst:Math.hypot,Math:math,
    MBjust:[true,false,cancel],K:{Escape:escape},_isFused:()=>fused,
    magicRef:()=>2,statInt:()=>3,pMagicMul:()=>4,pBeamMul:()=>5,_skMul:()=>6,_fuseMul:()=>7,
    _addSkProf:()=>calls.push('prof'),SFX:{magic:()=>calls.push('sound')},playSample:()=>calls.push('sample'),
    _r:()=>{calls.push('rng');return 1;},addTxt:()=>calls.push('text'),shake:()=>calls.push('shake'),
    _T:x=>x,showPH:x=>calls.push('notice:'+x),EL:{L:4}
  });
  const script=new vm.Script(block);
  return {c,calls,run:()=>script.runInContext(c),snapshot:()=>JSON.parse(JSON.stringify({P:c.P,G:c.G,MBjust:c.MBjust,K:c.K,calls}))};
}
for(const file of ['game.html','game-easy-test.html']){
  const block=extract(readFileSync(new URL('../'+file,import.meta.url),'utf8'));
  test(file+': fixed before reproduces negative MP and stack',()=>{
    const mp=fixture(before.files[file].block,{mp:99}),stk=fixture(before.files[file].block,{stk:0});mp.run();stk.run();
    assert.equal(mp.c.P.mp,-1);assert.equal(stk.c.P._hrStk,-1);assert.equal(mp.c.G._fireZones.length,1);
  });
  for(const fused of [false,true])test(file+': valid success preserves every observed effect; fused='+fused,()=>{
    const old=fixture(before.files[file].block,{mp:150,stk:2,fused}),current=fixture(block,{mp:150,stk:2,fused});old.run();current.run();
    assert.deepEqual(current.snapshot(),old.snapshot());assert.equal(current.c.P.mp,50);assert.equal(current.c.P._hrStk,1);
    assert.equal(current.c.G._fireZones.length,fused?2:1);
  });
  for(const [mp,stk,aim] of [[99,1,true],[0,1,true],[100,0,false],[100,undefined,false]])test(file+': confirm resource boundary '+mp+'/'+stk,()=>{
    const f=fixture(block);f.c.P.mp=mp;f.c.P._hrStk=stk;f.run();
    assert.equal(f.c.P.mp,mp);assert.equal(f.c.P._hrStk,stk);assert.equal(f.c.P._hrAiming,aim);
    assert.equal(f.c.G._fireZones.length,0);assert.equal(f.c.MBjust[0],false);assert.equal(f.c.P._hrRech,0);
    assert.equal(f.calls.filter(x=>!x.startsWith('notice:')).length,0);
  });
  test(file+': resource changes while aiming; refill succeeds once',()=>{
    const f=fixture(block,{mp:150});f.c.P.mp=99;f.run();assert.equal(f.c.G._fireZones.length,0);
    f.c.P.mp=100;f.c.MBjust[0]=true;f.run();assert.equal(f.c.G._fireZones.length,1);assert.equal(f.c.P._hrRech,600);
    f.c.MBjust[0]=true;f.run();assert.equal(f.c.G._fireZones.length,1);assert.equal(f.c.P.mp,0);assert.equal(f.c.P._hrStk,0);
  });
  for(const kind of ['cancel','escape'])test(file+': simultaneous cancel owns confirm '+kind,()=>{
    const f=fixture(block,{[kind]:true});f.run();assert.equal(f.c.P._hrAiming,false);assert.equal(f.c.P.mp,100);
    assert.equal(f.c.P._hrStk,1);assert.equal(f.c.G._fireZones.length,0);assert.deepEqual(f.calls,[]);
  });
}
