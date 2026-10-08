import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

function harness(entry,overrides={}){
 const src=readFileSync(new URL('../'+entry,import.meta.url),'utf8');
 const c=vm.createContext({P:{s:'wSwing',activeLMBSk:'kiSlash',hp:100,mp:30,st2:4,_sbCd:0,x:20,y:30,r:12,skills:{},...overrides},G:{},pressed:true,attackContinued:false,loops:0,
  isAct:()=>c.pressed,_qIsIceOrb:()=>false,_qIsPeaceShield:()=>c.P.activeQSk==='peaceShield',
  _qDispatchIceOrb:()=>false,_enterPeaceShield:()=>{c.P.s='peaceShield';c.P._sbParryT=20;},
  _eqAffix:()=>0,_lSbParryT:()=>20,playSample:()=>{},_r:()=>1,_startShieldLoop:()=>{c.loops++;}});
 const start=src.indexOf('function _tryKiSlashQCancel(');
 if(start>=0)vm.runInContext(src.slice(start,src.indexOf('\n}',start)+2),c);
 const branch=src.indexOf("  case 'wWindup':case 'wSwing':case 'wRecover':");
 assert.ok(branch>=0);
 const end=src.indexOf('    // 공격 중 감속 이동',branch);
 c.run=()=>vm.runInContext('switch(P.s){'+src.slice(branch,end)+'attackContinued=true;break;}}',c);
 return c;
}
for(const entry of ['game.html','game-easy-test.html']){
 test(entry+': Q cancels every kiSlash attack phase immediately and pays only once',()=>{
  for(const s of ['wWindup','wSwing','wRecover']){
   const c=harness(entry,{s});c.run();assert.equal(c.P.s,'sBlock');assert.equal(c.attackContinued,false);
   assert.equal(c.P.mp,20);assert.equal(c.P._sbParryT,20);assert.equal(c.P._sbCd,30);assert.equal(c.loops,1);
   c.run();assert.equal(c.P.mp,20);assert.equal(c.loops,1);
  }
 });
 test(entry+': insufficient mana, cooldown or released Q keeps the attack running',()=>{
  for(const p of [{mp:9},{_sbCd:1}]){const c=harness(entry,p);c.run();assert.equal(c.P.s,'wSwing');assert.equal(c.attackContinued,true);assert.equal(c.P.mp,p.mp??30);}
  const c=harness(entry);c.pressed=false;c.run();assert.equal(c.P.s,'wSwing');
 });
 test(entry+': peace shield uses its own entry and resource conditions',()=>{
  const c=harness(entry,{activeQSk:'peaceShield',mp:1});c.run();assert.equal(c.P.s,'peaceShield');assert.equal(c.P.mp,1);
  const dry=harness(entry,{activeQSk:'peaceShield',mp:0});dry.run();assert.equal(dry.P.s,'wSwing');
 });
 test(entry+': E and other LMB skills do not gain the kiSlash cancel',()=>{
  for(const p of [{s:'sBash'},{s:'sRecover'},{s:'magicCast'},{activeLMBSk:'whirlwind'},{hp:0}]){
   const c=harness(entry,p);const before=c.P.s;c.run();assert.equal(c.P.s,before);assert.equal(c.P.mp,30);
  }
 });
}
