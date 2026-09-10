import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
function fn(name){const s=html.indexOf('function '+name+'(');assert.ok(s>=0,`Missing ${name}`);let depth=0;for(let i=html.indexOf('{',s);i<html.length;i++){if(html[i]==='{')depth++;if(html[i]==='}'&&!--depth)return html.slice(s,i+1);}}
function hp(lv,{boss=false,elite=1,dm=1,stage=0,finale=false}={}){
  const c=vm.createContext({monLv:lv,ib:boss,et:{hpMul:elite},dm,si:stage,_isDruidFinale:()=>finale});
  vm.runInContext(fn('_enemyHpPacing')+'\n'+fn('_druidFinaleHp'),c);
  const s=html.indexOf('  const _baseHpCurve=');
  vm.runInContext(html.slice(s,html.indexOf('// ═══ ATK 공식:',s))+'\nglobalThis.result=_hp;',c);
  return c.result;
}
test('starter gear meets the level ten direct-hit budget including full shields',()=>{
  const effective=hp(10)*2;
  assert.equal(Math.ceil(effective/2175),5,'kiSlash alone should need five hits');
  assert.equal(Math.ceil(effective/(2175+197+15)),5,'close melee plus ki and ST bonus should need five inputs');
  assert.equal(Math.ceil(effective/1404),7,'fireball direct+splash should need seven casts');
  assert.ok(10360>=effective,'full-rage burst should kill a normal enemy in one hit');
  assert.equal(hp(1),875,'preserve the starting encounter');
});
test('rage burst applies its attack multiplier once, at the shared impact boundary',()=>{
  const line=html.split('\n').find(l=>l.includes('const _gs1Dmg='));
  for(const mult of [.7,1.2]){
    const target={x:0,y:0,r:10,alive:true,kb:{x:0,y:0}};
    const c=vm.createContext({P:{x:0,y:0},meleeRef:()=>37,statStr:()=>1,pAtkMul:()=>mult,_skMul:()=>20,_rageMul:20,
      shQuery:()=>[target],_shBufI:0,dst:()=>0,elMul:()=>1,hurtE:(e,d)=>{c.damage=d;e.alive=false;},_hurtFieldMobs:()=>{},shake:()=>{}});
    vm.runInContext(fn('_gSlamHit')+'\n'+line+'\n_gSlamHit(0,500,Math.PI,_gs1Dmg,0,0,1);',c);
    assert.equal(c.damage,Math.trunc(37*20*20*mult));
  }
});
test('HP remains monotonic through early levels without a cliff at the pacing boundary',()=>{
  for(let lv=2;lv<=100;lv++){
    assert.ok(hp(lv)>=hp(lv-1),`HP falls at ${lv}`);
    if(lv>2)assert.ok(hp(lv)/hp(lv-1)<1.5,`HP spike at ${lv}`);
  }
  assert.equal(hp(50),117097);
});
test('difficulty, elite and boss multipliers retain their roles; calibrated demo finale stays independent',()=>{
  assert.ok(Math.abs(hp(10,{elite:2})/hp(10)-2)<.002);
  assert.ok(Math.abs(hp(10,{boss:true})/hp(10)-24)<.02);
  assert.ok(Math.abs(hp(10,{dm:1.4})/hp(10)-1.4)<.002);
  assert.equal(hp(30,{stage:3,boss:true,finale:true}),85915);
});
test('early field elites and the four required angler bosses have proportionate HP',()=>{
  const c=vm.createContext({});
  for(const name of ['_FB_HP_MUL','_FD_HP_MUL'])vm.runInContext(html.match(new RegExp(`const ${name}=[^;]+;`))[0],c);
  vm.runInContext(fn('_fbHp')+'\n'+fn('_fdHp'),c);
  assert.equal(c._fbHp(10),39750);
  assert.equal(c._fdHp(10),13250);
});
test('kiSlash fired from a bow recovery hits as hard as the ordinary combo',()=>{
  const lines=html.split('\n').filter(l=>l.includes('spawnCrescent(P.x')&&l.includes("_skMul('kiSlash')"));
  assert.equal(lines.length,2);
  for(const step of [1,2,3]){
    const hits=[];
    const c=vm.createContext({P:{x:0,y:0,facing:0},meleeRef:()=>100,statStr:()=>1,pAtkMul:()=>.7,_skMul:()=>12,_cresStep:step,_ksDistMul:0,spawnCrescent:(x,y,a,d)=>hits.push(d)});
    for(const line of lines)vm.runInContext(line,c);
    assert.equal(hits[0],hits[1],`combo ${step} weakens after bow fire`);
  }
});
