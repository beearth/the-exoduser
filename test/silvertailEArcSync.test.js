import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

for(const file of ['game.html','game-easy-test.html']){
 const html=readFileSync(new URL('../'+file,import.meta.url),'utf8');
 function setup(frameCount=9){
  const calls=[],ctx={save(){},restore(){},translate(){},rotate(){},drawImage(...args){calls.push({args,alpha:this.globalAlpha,filter:this.filter})}};
  const c=vm.createContext({_charIdx:1,performance:{now:()=>1080},P:{hp:100,s:'sBash',st2:20,_silvAttackStartedAt:1000,_silvAttackKind:'shield',_stWingT:40,facing:0,x:0,y:0,_sa:{fm:{atk2_e:Array(frameCount).fill({})}}},
   CHAR_LIST:[{}, {atkN:4}],_DIR8:['e','se','s','sw','w','nw','n','ne'],_facingDir8:()=> 'e',
   _silvEArcReady:true,_silvEArcImg:{width:2132,height:738},_flameBladeReady:true,_flameBladeImg:{width:1774,height:887},sh:()=>({}),_eSkillRangeMul:()=>1});
  vm.runInContext(readFileSync(new URL('../player-attack-remaster.js',import.meta.url),'utf8'),c);
  vm.runInContext('const _SILVERTAIL_ATTACK_VISUAL_MS=360;const _SILVERTAIL_ATTACK_SPIN_FRAME_MS=60;',c);
  for(const name of ['_silvertailAttackPose','_drawSilvertailEArc','_drawFlameBladeSwing']){
   const start=html.indexOf('function '+name+'('),end=html.indexOf('\n}',start)+2;
   vm.runInContext(html.slice(start,end),c);
  }
  return {c,ctx,calls};
 }
 test(file+': E body and arc share a 160ms turn, with the original 240ms fallback',()=>{
  for(const n of [9,4]){
   const {c,ctx,calls}=setup(n),duration=n===9?160:240;
   for(const elapsed of [0,40,80,120,159,160,200,240]){
    c.performance.now=()=>1000+elapsed;
    const pose=c._silvertailAttackPose();
    assert.ok(Math.abs(pose.spinProgress-Math.min(1,elapsed/duration))<1e-12);
    c._silvAtk=pose;c.SpriteAnimator={_fr:(sa,dir)=>sa.fm['atk2_'+dir]};
    const bodyStart=html.indexOf("    if(_silvAtk&&_silvAtk.hasAtk&&(P.s==='sBash'||P.s==='sRecover')){");
    assert.ok(bodyStart>=0);
    vm.runInContext(html.slice(bodyStart,html.indexOf('\n    }',bodyStart)+6),c);
    assert.equal(c.P._sa.f,Math.min(n-1,Math.floor(pose.spinProgress*n)),'body never applies the speed multiplier twice');
    calls.length=0;c._drawSilvertailEArc(ctx,pose,1);
    if(elapsed>=duration)assert.equal(calls.length,0,'no effect after the turn');
    else assert.ok(Math.abs(calls.at(-1).args[1]-Math.min(5,Math.floor(pose.spinProgress*6))*2132/6)<1e-9);
   }
  }
 });
 test(file+': empowered E enhances the original arc and never draws the fire sheet',()=>{
  const {c,ctx,calls}=setup(),pose=c._silvertailAttackPose();
  assert.equal(c._drawFlameBladeSwing(ctx,pose),false);assert.equal(calls.length,0);
  c._drawSilvertailEArc(ctx,pose,1);assert.equal(calls.length,2);
  assert.ok(calls.every(x=>x.args[0]===c._silvEArcImg));
  assert.ok(calls[0].alpha<calls[1].alpha);
  const boostedFilter=calls.at(-1).filter,source=calls.at(-1).args.slice(1,5);
  calls.length=0;c.P._stWingT=0;c._drawSilvertailEArc(ctx,pose,1);
  assert.equal(calls.length,1);assert.deepEqual(calls[0].args.slice(1,5),source);
  assert.notEqual(calls[0].filter,boostedFilter);
  calls.length=0;c.P._stWingT=40;c._drawSilvertailEArc(ctx,pose,3);
  assert.equal(calls.at(-1).args[7],(200+30)*3,'charged size contract preserved');
 });
}
