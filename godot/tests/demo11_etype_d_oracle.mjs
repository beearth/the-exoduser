import fs from 'node:fs';import readline from 'node:readline';import vm from 'node:vm';import assert from 'node:assert/strict';
const path=process.argv.find(x=>x.startsWith('--source-game='))?.slice(14);assert(path);
const selected=new Map();let line=0,drainRefs=[];
const ranges=[[30823,30882],[31113,31113],[31218,31229],[39050,39055],[39074,39084],[40550,40558],[42804,42809]];
for await(const s of readline.createInterface({input:fs.createReadStream(path),crlfDelay:Infinity})){line++;if(ranges.some(([a,b])=>line>=a&&line<=b))selected.set(line,s);if(s.includes('drainHeal'))drainRefs.push(line)}
const slice=(a,b)=>Array.from({length:b-a+1},(_,i)=>selected.get(a+i)).join('\n');
assert.deepEqual(drainRefs,[31218]);let assertions=1;
const rows=[];
for(const etype of [18,19,23,24,25])rows.push({etype,status:'NOT_READY',actor_registered:false});
// Execute original special idle branches, never a ported/rewritten formula.
const branches=slice(39050,39055)+'\n'+slice(39074,39084);
for(const etype of [18,19,23,24,25])for(const state of ['idle','recover'])for(const distance of [0,79.999,80,200])for(const timer of [0,1]){
 const e={etype,s:state,r:20,x:0,y:0,st2:0,slamT:timer,slamCd:240,_iceSlimeT:timer,_iceSlimeCd:140};const p={r:15,_freezeSlow:7};const shots=[];
 const c={e,P:p,d:distance,sp:1,EL:{D:3},addTxt(){},addParts(){},_T:x=>x,_spawnBossProjectile:(owner,raw)=>{assert.equal(owner,e);shots.push(raw)}};
 vm.runInNewContext(branches,c);
 const slam=etype===19&&state==='idle'&&distance<80;assert.equal(e.s,slam?'eSlamWind':state);assert.equal(e.st2,slam?40:0);
 assert.equal(p._freezeSlow,etype===24&&state==='idle'&&distance<43?90:7);
 assert.equal(shots.length,etype===25&&state==='idle'?1:0);
 if(shots.length)assert.deepEqual(JSON.parse(JSON.stringify(shots[0])),{x:0,y:0,vx:0,vy:0,dmg:0,el:3,friendly:false,life:480,ml:480,col:'#5e10a8',sz:2,iceZone:true});
 assertions+=4+(shots.length?1:0);
}
// Original hurtE type25 death block: three icy zones, not its purple idle zone.
const death=slice(42804,42809);
for(const etype of [18,19,23,24,25]){
 const shots=[];const e={etype,x:100,y:200};vm.runInNewContext(death,{e,EL:{I:2},Math,addTxt(){},addParts(){},_T:x=>x,_spawnBossProjectile:(_,raw)=>shots.push(raw)});
 assert.equal(shots.length,etype===25?3:0);assertions++;
 for(let i=0;i<shots.length;i++){assert.equal(shots[i].el,2);assert.equal(shots[i].life,360);assert.equal(shots[i].dmg,0);assert.equal(shots[i].iceZone,true);assert.equal(shots[i].x,100+Math.cos(Math.PI*2*i/3)*15);assertions+=5}
}
console.log(JSON.stringify({assertions,failures:0,drainRefs,rows,source_contract_only:true,product_AI_verified:false,branches:[39050,39074,39078,42804]}));
