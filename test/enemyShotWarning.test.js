import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
function setup(){
 const a=html.indexOf('function _emitEnemyShot('),b=html.indexOf('function radialProjs(',a);
 assert.ok(a>=0&&b>a,'shared shot warning gate exists');
 const fired=[];const ctx=vm.createContext({G:{},ens:[],_gameFrame:1,EL:{P:0},spawnProj:p=>fired.push(p),_drawShootCharge(){}});
 const prep=html.slice(html.indexOf('function _prepareDarkSphere('),html.indexOf('function _spawnBossProjectile('));
 vm.runInContext(prep+html.slice(a,b),ctx);return {ctx,fired};
}
test('unannounced volley waits 60 frames and preserves every bullet',()=>{
 const {ctx,fired}=setup(),e={alive:true,x:10,y:20,r:12};
 ctx._emitEnemyShot(e,{vx:3,vy:0,el:0,col:'red'});ctx._emitEnemyShot(e,{vx:-3,vy:0,el:0});
 assert.equal(fired.length,0);assert.equal(ctx.G._shotWarnings.length,1);
 ctx._tickEnemyShotWarnings(59);assert.equal(fired.length,0);
 ctx._tickEnemyShotWarnings(1);assert.equal(fired.length,2);
});
test('completed shoot windup is not delayed twice',()=>{
 const {ctx,fired}=setup();ctx._emitEnemyShot({alive:true,s:'eShootWind',st2:0},{vx:3,vy:0});assert.equal(fired.length,1);
});
test('stun, death during charge and stage change cancel queued shots',()=>{
 for(const reason of ['stun','death','stage']){
  const {ctx,fired}=setup(),e={alive:true,x:0,y:0,r:10};ctx._emitEnemyShot(e,{vx:3,vy:0});
  if(reason==='stun')e.stunned=10;if(reason==='death')e.alive=false;if(reason==='stage')ctx.ens=[];
  ctx._tickEnemyShotWarnings(60);assert.equal(fired.length,0);
 }
});
test('death volleys warn at the death position instead of disappearing',()=>{
 const {ctx,fired}=setup();ctx._emitEnemyShot({alive:false,x:40,y:50,r:12},{x:40,y:50,vx:3,vy:0});
 ctx._tickEnemyShotWarnings(60);assert.equal(fired.length,1);
});
test('special attack rings are never gated as decorative effects',()=>{
 assert.equal(html.includes("if(_eDecor&&e.s==='eShootWind')"),false);
 assert.ok(html.includes('_tickEnemyShotWarnings(sp)'));
 assert.ok(html.includes('_drawEnemyShotWarnings()'));
});
test('mixed volleys never hide physical shots behind a fire warning',()=>{
 const {ctx}=setup(),e={alive:true,x:0,y:0};
 ctx._emitEnemyShot(e,{el:1,col:'red',vx:3});ctx._emitEnemyShot(e,{el:0,col:'red',vx:3});
 assert.equal(ctx.G._shotWarnings.length,2);
 assert.equal(ctx.G._shotWarnings[1].col,'#f4f4f4');
});
test('a mismatched windup cannot authorize an immediate physical shot',()=>{
 const {ctx,fired}=setup();
 ctx._emitEnemyShot({alive:true,s:'eShootWind',st2:0,_swChargeEl:1,x:0,y:0},{el:0,col:'red',vx:3});
 assert.equal(fired.length,0);assert.equal(ctx.G._shotWarnings[0].col,'#f4f4f4');
 ctx._tickEnemyShotWarnings(60);assert.equal(fired.length,1);
});
test('completed immediate and queued shots survive the real density gate',()=>{
 for(const queued of [false,true]){
  const {ctx}=setup(),created=[];
  Object.assign(ctx,{_projFree:[],_eProjDropCnt:0,_mkProj:()=>({}),_projectileParryClass:()=> 'magic',_isEnemyMagicBullet:()=>false,_recycleProj(){},created});
  const start=html.indexOf('function spawnProj(props){'),end=html.indexOf('p.sz*=2;p.r*=1.3;',start);
  vm.runInContext(html.slice(start,end)+'}}created.push(p);return p;}',ctx);
  for(let i=0;i<3;i++){
   const e={alive:true,x:0,y:0,s:queued?'idle':'eShootWind',st2:0,_swChargeEl:3};
   ctx._emitEnemyShot(e,{el:3,vx:4,vy:0});
   if(queued)ctx._tickEnemyShotWarnings(60);
  }
  assert.equal(created.length,3,queued?'queued':'immediate');
  assert.equal(ctx._eProjDropCnt,0);
 }
});
test('jelly discharge and angel burst still shoot after the target leaves range',()=>{
 for(const marker of ['// 전기 방전: 주변 범위 데미지','if(e._iaBurstCd<=0&&d<100)']){
  const a=html.indexOf('e._swFire=function(){',html.indexOf(marker));
  const line=html.slice(a,html.indexOf('\n',a));
  const shots=[];const ctx=vm.createContext({EL:{D:3},e:{x:0,y:0,el:3,r:20},P:{x:500,y:0,r:10},dst:()=>500,eProjAt:(...p)=>shots.push(p),addTxt(){},_T:s=>s,poolPart(){},shake(){},SFX:{explode(){}}});
  vm.runInContext(line,ctx);ctx.e._swFire();assert.equal(shots.length,1,marker);
 }
});
