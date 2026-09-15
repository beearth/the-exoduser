import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

function harness(entry='game.html'){
 const src=readFileSync(new URL('../'+entry,import.meta.url),'utf8');
 const context=vm.createContext({P:{},_charIdx:1,performance:{now:()=>1100},CHAR_LIST:[{atkN:8},{atkN:4}],_DIR8:['e','se','s','sw','w','nw','n','ne'],
  _facingDir8:a=>['e','se','s','sw','w','nw','n','ne'][(Math.round(a/(Math.PI/4))+8)%8]});
 for(const name of ['_playerSpriteDirection','_playerMeleeProgress','_silvertailAttackPose']){
  const start=src.indexOf('function '+name+'(');assert.ok(start>=0,name+' exists');
  const end=src.indexOf('\n}',start)+2;vm.runInContext(src.slice(start,end),context);
 }
 vm.runInContext('const _SILVERTAIL_ATTACK_VISUAL_MS=360;const _SILVERTAIL_ATTACK_SPIN_FRAME_MS=60;',context);
 return context;
}
for(const entry of ['game.html','game-easy-test.html']){
 test(entry+': all eight walking directions follow displacement without changing aim',()=>{
  const c=harness(entry);
  for(let i=0;i<8;i++){
   c.P={s:'idle',facing:Math.PI,_walkMoving:true,_walkFacing:i*Math.PI/4};
   assert.equal(c._playerSpriteDirection(c.P),c._DIR8[i]);assert.equal(c.P.facing,Math.PI);
  }
  c.P._walkMoving=false;assert.equal(c._playerSpriteDirection(c.P),'w');
  c.P.s='wSwing';c.P._walkMoving=true;assert.equal(c._playerSpriteDirection(c.P),'w');
 });
 test(entry+': swing advances during its five ticks and recovery never restarts the strip',()=>{
  const c=harness(entry),progress=[];
  for(let left=5;left>=0;left--)progress.push(c._playerMeleeProgress('wSwing',left,10,16));
  for(let left=16;left>=0;left--)progress.push(c._playerMeleeProgress('wRecover',left,10,16));
  assert.ok(progress.every((p,i)=>i===0||p>=progress[i-1]));
  assert.ok(new Set(progress.slice(0,5).map(p=>Math.floor(p*8))).size>=4);
  assert.equal(progress.at(-1),1);
 });
 test(entry+': interrupted Silvertail attack cannot cover walking, stun, dash or death',()=>{
  const c=harness(entry);
  for(const s of ['idle','stagger','bladeDash','fallen']){
   c.P={s,hp:100,_silvAttackStartedAt:1000,facing:0};assert.equal(c._silvertailAttackPose(),null);
  }
  c.P={s:'wSwing',hp:0,_silvAttackStartedAt:1000,facing:0};assert.equal(c._silvertailAttackPose(),null);
  c.P.hp=100;assert.ok(c._silvertailAttackPose());
 });
 test(entry+': whirlwind rotates through upright directional views',()=>{
  const c=harness(entry);for(let i=0;i<8;i++)assert.equal(c._playerSpriteDirection({s:'whirlwind',facing:0,wwAng:i*Math.PI/4}),c._DIR8[i]);
 });
}
