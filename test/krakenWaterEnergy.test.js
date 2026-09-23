import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
for(const file of ['game.html','game-easy-test.html']){
 const source=readFileSync(new URL('../'+file,import.meta.url),'utf8');
 const fn=name=>{const start=source.indexOf('function '+name+'(');assert.ok(start>=0);let depth=0;for(let i=source.indexOf('{',start);i<source.length;i++){if(source[i]==='{')depth++;else if(source[i]==='}'&&--depth===0)return source.slice(start,i+1);}assert.fail(name);};
 function fixture(){
  const calls=[],pProjs=[],shots=[];
  const c=vm.createContext({Math,P:{x:100,y:0,parryBank:0},G:{},EL:{P:0,F:1,I:2,D:3,L:4},ELC:['#bbbbbb','#ff5522','#3388ff','#9933cc','#ffee00'],
   _fieldEnemyCanShoot:()=>true,_fbEsca:()=>({x:0,y:0}),_fdEye:()=>({x:0,y:0}),
   spawnProj:p=>shots.push(p),_getPProj:()=>({_hitSet:new Set()}),pProjs,
   shake:()=>{},SFX:{magic:()=>{},detonate:()=>{}},_addBlastLight:()=>{},
   _addBoom:(...a)=>calls.push(['boom',...a]),bigImpact:(...a)=>calls.push(['impact',...a]),
   addParts:(...a)=>calls.push(['parts',...a]),doHitFlash:(...a)=>calls.push(['flash',...a]),
   doParry:(...a)=>calls.push(['parry',...a])});
  vm.runInContext(['_fbElCol','_fbFireEnergy','_fdFireEnergy','_splitParriedBigEnergy','_resolveBigEnergyParry','_fbEnergyBoom'].map(fn).join('\n'),c);
  return {c,calls,pProjs,shots};
 }
 for(const el of [1,2,3,4])test(`${file}: kraken element ${el} fires water through split and explosion`,()=>{
  const f=fixture();f.c._fbFireEnergy({x:0,y:0,atk:100,el});const p=f.shots[0];
  assert.equal(p.el,2,'water sprite must carry water damage');assert.equal(p.col,'#3388ff');
  f.c._resolveBigEnergyParry(p,1000);assert.equal(f.pProjs.length,5);assert.ok(f.pProjs.every(x=>x.el===2&&x.dmg===200));
  const parry=f.calls.find(x=>x[0]==='parry');assert.equal(parry[5],2);assert.equal(parry[6],10);assert.equal(parry[7],'waterEnergy');
  f.c._fbEnergyBoom(p);assert.equal(f.calls.find(x=>x[0]==='boom')[5],'waterImpact');
  assert.equal(f.calls.find(x=>x[0]==='impact')[3],2);assert.equal(f.calls.find(x=>x[0]==='flash')[1],'#3388ff');
 });
 test(file+': fire devil retains fire fragments and explosion',()=>{
  const f=fixture();f.c._fdFireEnergy({x:0,y:0,atk:100});const p=f.shots[0];assert.equal(p.el,1);
  f.c._resolveBigEnergyParry(p,1000);assert.ok(f.pProjs.every(x=>x.el===1));assert.notEqual(f.calls.find(x=>x[0]==='parry')[7],'waterEnergy');
  f.c._fbEnergyBoom(p);assert.equal(f.calls.find(x=>x[0]==='boom')[5],'fire');
 });
 test(file+': water-energy Q impact uses water splash instead of generic Q effect',()=>{
  const doParry=fn('doParry');const start=doParry.indexOf("if(_impactKind==='waterBean')"),end=doParry.indexOf('// ═══ 공통 패링 성공 임팩트',start);assert.ok(start>0&&end>start);
  const booms=[];const c=vm.createContext({_impactKind:'waterEnergy',_isQParry:true,_parryEl:2,_px:10,_py:20,_addBoom:(...a)=>booms.push(a),_dark02Impact:()=>assert.fail('water must not use generic dark Q impact')});
  vm.runInContext(doParry.slice(start,end),c);assert.equal(booms[0][4],'waterImpact');
 });
}
