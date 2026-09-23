import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

for(const file of ['game.html','game-easy-test.html']){
  const src=readFileSync(new URL('../'+file,import.meta.url),'utf8');
  function fn(name){
    const start=src.indexOf('function '+name+'(');
    if(start<0)return '';
    let depth=0;
    for(let i=src.indexOf('{',start);i<src.length;i++){
      if(src[i]==='{')depth++;
      if(src[i]==='}'&&--depth===0)return src.slice(start,i+1);
    }
  }
  function fixture(){
    const booms=[],sounds=[],shots=[],enemies=[];
    const c=vm.createContext({Math,G:{_gcT:0},EL:{I:2},pProjs:shots,
      _getPProj:()=>({_hitSet:new Set()}),
      dst:(x,y,a,b)=>Math.hypot(x-a,y-b),shQuery:()=>enemies,
      _addBoom:(...a)=>booms.push(a),_projHitFx:(...a)=>booms.push(a),
      playSampleAt:(...a)=>sounds.push(a),
      _fmApply:(m,d)=>{if(m.hitCd>0)return false;m.hp-=d;m.hitCd=8;return true;}
    });
    for(const name of ['_fmCanHit','_fmXY','_splitParriedBigEnergy','_parryMagicFieldTarget','_parryMagicHitFx','_hurtFieldMobs'])vm.runInContext(fn(name),c);
    const begin=src.indexOf('    if(!(p._bounceCool>0)&&!p.explosive');
    const end=src.indexOf('    p.x+=p.vx*sp;',begin);
    vm.runInContext('function steer(p,i){const spd=Math.hypot(p.vx,p.vy),sp=1,_dtSp=1;'+src.slice(begin,end)+'}',c);
    return {c,shots,enemies,booms,sounds};
  }
  test(file+': all five radial fragments reach a kraken outside the old 250px search',()=>{
    const f=fixture();const boss={x:600,y:0,hp:1000,r:100,hid:0};f.c.G._fieldBosses=[boss];
    f.c._splitParriedBigEnergy({x:0,y:0,vx:-18,vy:0,el:2},1000);
    for(const p of f.shots){let reached=false;
      for(let t=0;t<120;t++){f.c.G._gcT=t;f.c.steer(p,0);p.x+=p.vx;p.y+=p.vy;p.dist+=7.5;
        if(Math.hypot(p.x-boss.x,p.y-boss.y)<boss.r+p.r){reached=true;break;}}
      assert.ok(reached,'every fragment must reacquire and reach the separate field boss');
    }
  });
  test(file+': fragments acquire ordinary enemies at 600px without changing normal magic range',()=>{
    const f=fixture();f.enemies.push({alive:true,x:600,y:0});
    const p={x:0,y:0,vx:0,vy:7.5,magic:true,_parryMagicShot:true};f.c.steer(p,0);
    assert.ok(p.vx>0);const ordinary={...p,vx:0,vy:7.5,_parryMagicShot:false};f.c.steer(ordinary,0);assert.equal(ordinary.vx,0);
  });
  test(file+': field impacts play water splash and sound even during field hit cooldown',()=>{
    const f=fixture();const boss={x:0,y:0,hp:1000,r:100,hid:0,hitCd:8};f.c.G._fieldBosses=[boss];
    const p={x:10,y:0,vx:7.5,vy:0,el:2,_parryMagicShot:true};
    assert.equal(f.c._hurtFieldMobs(10,0,16,200,new Set(),p),1,'contact must consume the fragment even if damage cooldown rejects it');
    assert.equal(boss.hp,1000,'existing field damage cooldown is preserved');
    assert.equal(f.booms.length,1);assert.equal(f.booms[0][4],'waterImpact');assert.equal(f.sounds.length,1);
  });
  test(file+': regular enemy and field enemy collision paths request fragment impacts',()=>{
    assert.match(src,/_hurtFieldMobs\(p\.x,p\.y,\(p\.r\|\|6\)\+8,p\.dmg\|\|p\.atk\|\|10,p\._hitSet,p\._parryMagicShot\?p:null\)/);
    assert.match(src,/hurtE\(e,dmg,ang,_isTurretProj\|\|p\.blueBean,p,p\.el\);\s*if\(p\._parryMagicShot\)_parryMagicHitFx\(p\)/);
  });
  test(file+': field targeting follows hit coordinates and excludes unavailable targets',()=>{
    const f=fixture();const p={x:0,y:0,_hitSet:new Set()};
    f.c.G._fieldBosses=[{x:10,y:0,hp:0},{x:20,y:0,hp:100,asleep:1},{x:30,y:0,hp:100,hid:1},
      {x:800,y:0,hp:100,hid:1,tpT:20,tpX:350,tpY:100}];
    const target=f.c._parryMagicFieldTarget(p,null,900);assert.equal(target.x,350);assert.equal(target.y,100);
    const ordinary={x:50,y:0,alive:true};assert.equal(f.c._parryMagicFieldTarget(p,ordinary,50),ordinary);
    f.c.G._fieldBosses=[];f.c.G._fireDevils=[{x:500,y:0,hp:100,hid:0}];
    f.c.G._worms=[{x:100,y:0,hp:100,phase:'hide',hideT:80}];
    assert.equal(f.c._parryMagicFieldTarget(p,null,900),f.c.G._fireDevils[0]);
  });
}
