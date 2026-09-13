import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const cases=[
  {kind:'kraken',fn:'_fbTickOne',end:'_fbDraw',damage:100,kb:18},
  {kind:'fire devil',fn:'_fdTickOne',end:'_fdDrawCharge',damage:100,kb:16},
  {kind:'ground eel',fn:'_wmTick',end:'_wmDraw',damage:90,kb:14},
  {kind:'teleporting monster',fn:'teleportE',end:'_beanRoll',damage:1050,kb:120}
];
function fixture(file,entry,{immune=false,charge=false,far=false,spawn=false}={}){
  const source=readFileSync(new URL('../'+file,import.meta.url),'utf8');
  const start=source.indexOf('function '+entry.fn+'('),end=source.indexOf('\nfunction '+entry.end+'(',start);
  assert.ok(start>=0&&end>start);
  const hits=[];const P={x:far?1000:90,y:0,r:12,hp:5000,iframes:immune?10:0,s:charge?'charge':'idle',kb:{x:0,y:0}};
  const enemy={x:0,y:0,r:entry.fn==='_wmTick'?56:120,hp:1000,mhp:1000,atk:100,t:0,shotCd:999,hitCd:0,hid:1,tpT:1,tpX:0,tpY:0,spawnIn:spawn?1:0,emT:1,_landed:spawn?0:1,phase:'emerge',frame:3,ft:6,face:0,el:1};
  const noop=()=>{};
  const ctx=vm.createContext({P,G:{on:true,map:[[]],stage:0,_wmStage:0,_worms:[enemy]},window:{},Math,
    _fieldEnemyCanShoot:()=>false,_fbFaceFrame:()=>0,_fdFaceFrame:()=>0,_fbElCol:()=> '#66e5ff',
    dst:(x,y,a,b)=>Math.hypot(x-a,y-b),hurtP:(d,opts)=>hits.push({damage:d,opts}),
    _pushOutsideBonfire:noop,poolPart:noop,_addBlastLight:noop,_addTpSmoke:noop,playVFXAng:noop,shake:noop,
    addTxt:noop,_addBoom:noop,_addTpImpact:noop,_addTpBolt:noop,_T:x=>x,canMv:()=>true,
    ar:()=>({el:0}),elMul:()=>1,eModHitP:noop});
  vm.runInContext(source.slice(start,end),ctx);
  const tick=()=>entry.fn==='teleportE'?ctx.teleportE(enemy,0,0,'#aa00ff',8):entry.fn==='_wmTick'?ctx._wmTick():ctx[entry.fn](enemy);
  return {ctx,P,enemy,hits,tick};
}
for(const file of ['game.html','game-easy-test.html'])for(const entry of cases){
  test(file+': '+entry.kind+' landing has half damage and double outward impulse',()=>{
    const f=fixture(file,entry);f.tick();
    assert.equal(f.hits.length,1);assert.equal(f.hits[0].damage,entry.damage);
    assert.equal(f.P.kb.x,entry.kb);assert.equal(f.P.kb.y,0);
    if(entry.fn==='_fdTickOne')assert.equal(f.hits[0].opts.dtype,'magic');
    if(entry.fn==='_wmTick'){f.tick();assert.equal(f.hits.length,1,'emerge impact only once');}
  });
  test(file+': '+entry.kind+' keeps invulnerability, charge and range gates',()=>{
    for(const options of [{immune:true},{charge:true},{far:true}]){
      const f=fixture(file,entry,options);f.tick();assert.equal(f.hits.length,0);assert.equal(f.P.kb.x,0);
    }
  });
  if(entry.fn==='_fbTickOne'||entry.fn==='_fdTickOne')test(file+': '+entry.kind+' first appearance is not an attack',()=>{
    const f=fixture(file,entry,{spawn:true});f.tick();assert.equal(f.hits.length,0);assert.equal(f.P.kb.x,0);
  });
}
