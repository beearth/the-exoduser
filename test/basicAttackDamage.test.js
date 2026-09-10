import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
const noop=()=>{};
function bowContext(){return vm.createContext({P:{x:0,y:0,facing:0},G:{mats:2},pProjs:[],
  bw:()=>({btype:'crossbow'}),BOWTYPES:{crossbow:{range:1000,atkMul:1.5}},
  bowRef:()=>100,pBowMul:()=>2,pXbowMul:()=>1.2,pBowRange:()=>1,pBowSpd:()=>1,
  _autoBowSpec:()=>({range:1000,spd:13}),_eqAffix:()=>0,_getPProj:()=>({}),
  XBOW_DMG:28,XBOW_PIERCE:false,_gxFiring:0,_gxTurret:{x:0,y:0},
  playSample:noop,playSampleAt:noop,poolPart:noop,_r:()=>1,SFX:{bow:noop}});}
test('basic automatic crossbow triples damage including its flat bonus and keeps turret scaling',()=>{
  const c=bowContext();vm.runInContext(html.slice(html.indexOf('function _fireXbow('),html.indexOf('// ═══ 석궁 자동 발사 —')),c);
  c._fireXbow(100,0);assert.equal(c.pProjs[0].dmg,388*3);assert.equal(c.pProjs[0].maxDist,1000);
  c._gxFiring=1.5;c._fireXbow(100,0);assert.equal(c.pProjs[1].dmg,582*3);
});
test('manual normal bow triples damage and still consumes one malice',()=>{
  const c=bowContext();c.P._bowBon=10;
  vm.runInContext(html.slice(html.indexOf('function fireBow(){'),html.indexOf('// ═══ 석궁 자동 발사 ═══')),c);
  assert.equal(c.fireBow(),true);assert.equal(c.pProjs[0].dmg,2010*3);assert.equal(c.G.mats,1);assert.equal(c.P._bowBon,0);
});
test('basic melee swing triples its base without changing range or swing timing',()=>{
  const c=vm.createContext({P:{s:'wSwing',st2:3,baseAtk:20,atkArc:0},sp:1,
    wp:()=>({atk:30,wRange:50,wArcW:.95,el:0}),enhMulAtk:()=>5,
    hitArc:(...a)=>{c.hit=a;}});
  const start=html.indexOf("else if(P.s==='wSwing'){");
  vm.runInContext(html.slice(start+5,html.indexOf("else if(P.s==='wRecover')",start)),c);
  assert.equal(c.hit[3],140*3);assert.equal(c.hit[1],50);assert.equal(c.P.st2,3);
});
test('kiSlash scales to three times its previous damage at every level',()=>{
  const c=vm.createContext({P:{skills:{}}});
  vm.runInContext(html.slice(html.indexOf('const _SK_MUL='),html.indexOf('function _fuseMul(')),c);
  for(const lv of [1,10,20]){c.P.skills.kiSlash=lv;assert.ok(Math.abs(c._skMul('kiSlash')-(4+(lv-1)*3.36*.5)*3)<1e-10);}
});
