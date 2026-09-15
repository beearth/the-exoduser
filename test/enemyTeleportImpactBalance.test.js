import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const cases=[
  {kind:'kraken',fn:'_fbTickOne',end:'_fbDraw',damage:100,kb:18},
  {kind:'fire devil',fn:'_fdTickOne',end:'_fdDrawCharge',damage:100,kb:16},
  {kind:'ground eel',fn:'_wmTick',end:'_wmDraw',damage:45,kb:28},
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
    _harpActive:false,_dashActive:false,_fieldEnemyCanShoot:()=>false,_fbFaceFrame:()=>0,_fdFaceFrame:()=>0,_fbElCol:()=> '#66e5ff',
    dst:(x,y,a,b)=>Math.hypot(x-a,y-b),hurtP:(d,opts)=>hits.push({damage:d,opts}),
    _pushOutsideBonfire:noop,poolPart:noop,_addBlastLight:noop,_addTpSmoke:noop,playVFXAng:noop,shake:noop,
    addTxt:noop,_addBoom:noop,_addTpImpact:noop,_addTpBolt:noop,_T:x=>x,canMv:()=>true,
    ar:()=>({el:0}),elMul:()=>1,eModHitP:noop});
  const helper=source.indexOf('function _wmContactHit(');
  if(entry.fn==='_wmTick'&&helper>=0)vm.runInContext(source.slice(helper,start),ctx);
  vm.runInContext(source.slice(start,end),ctx);
  const tick=()=>entry.fn==='teleportE'?ctx.teleportE(enemy,0,0,'#aa00ff',8):entry.fn==='_wmTick'?ctx._wmTick():ctx[entry.fn](enemy);
  return {ctx,P,enemy,hits,tick};
}
for(const file of ['game.html','game-easy-test.html'])for(const entry of cases){
  test(file+': '+entry.kind+' landing uses current damage and outward impulse',()=>{
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

for(const file of ['game.html','game-easy-test.html']){
 const eel=cases.find(e=>e.fn==='_wmTick');
 test(file+': eel emergence separates overlaps and cannot stack contact damage',()=>{
  for(const pos of [[0,0],[40,0],[-40,0],[0,40],[0,-40]]){
   const f=fixture(file,eel);[f.P.x,f.P.y]=pos;
   f.tick();assert.equal(f.hits.length,1);assert.equal(f.hits[0].damage,45);
   assert.ok(Math.hypot(f.P.x,f.P.y)>=f.enemy.r+f.P.r+32-1e-6,'moves beyond the body and emergence radius');
   assert.ok(f.P.kb.x*f.P.x+f.P.kb.y*f.P.y>0,'impulse points outwards');
   assert.equal(f.hits[0].opts.knockback.x,0,'suppress random hurtP impulse');
   f.tick();assert.equal(f.hits.length,1);
  }
 });
 test(file+': eel contact at a wall deals half damage at most once per second',()=>{
  const f=fixture(file,eel);f.P.x=0;f.enemy.phase='shoot';f.enemy.frame=6;f.enemy.ft=-1000;
  f.ctx.canMv=()=>false;
  f.tick();assert.equal(f.hits.length,1);assert.equal(f.hits[0].damage,50);assert.equal(f.P.x,0);
  for(let i=0;i<59;i++)f.tick();assert.equal(f.hits.length,1,'wall overlap cannot hit each frame');
  f.tick();assert.equal(f.hits.length,2,'contact can hit after 60 ticks');
 });
 test(file+': eel push checks the full path and cannot jump through a thin wall',()=>{
  const f=fixture(file,eel);f.P.x=40;
  f.ctx.canMv=x=>x<50||x>60;
  f.tick();assert.ok(f.P.x<50,'path stops before the blocked strip');assert.equal(f.hits.length,1);
 });
 test(file+': eel hit cooldown persists across emergence cycles',()=>{
  const f=fixture(file,eel);f.tick();f.P.x=0;f.enemy.popHit=0;f.enemy.phase='emerge';f.enemy.frame=4;
  f.tick();assert.equal(f.hits.length,1);
 });
 test(file+': eel separation respects movement-skill protection and dead players',()=>{
  for(const flag of ['_harpActive','_dashActive','_gwActive','_ioActive','dead']){
   const f=fixture(file,eel);f.P.x=0;
   if(flag==='dead'){f.P.hp=0;f.P.s='dead';}
   else if(flag==='_harpActive'||flag==='_dashActive')f.ctx[flag]=true;
   else f.P[flag]=true;
   f.tick();assert.equal(f.hits.length,0);assert.equal(f.P.x,0);assert.equal(f.P.kb.x,0);
  }
 });
}
