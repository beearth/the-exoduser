import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
function fn(name){const s=html.indexOf('function '+name+'(');let n=0;for(let i=html.indexOf('{',s);i<html.length;i++){if(html[i]==='{')n++;if(html[i]==='}'&&!--n)return html.slice(s,i+1);}}
const noop=()=>{};
function rollCtx(gauge,moving=0){
  const c=vm.createContext({P:{skills:{},x:0,y:0,s:'idle',mp:50,iframes:0,_bdMoveT:moving,facing:0},_harpGauge:gauge,_HARP_GAUGE_COST:[0,45,98,150],_HARP_GAUGE_MAX:225,isAct:()=>false,addTxt:noop,playSample:noop,_r:()=>1,addParts:noop,shake:noop,_uqMoveRefund:noop,_applyBlinkWeakPath:noop,_isKiCharging:()=>false});
  vm.runInContext('const _ROLL_DIST=250*0.7,_ROLL_FRAMES=6,_ROLL_IFRAMES=5,_ROLL_GAUGE_COST=_HARP_GAUGE_COST[1];'+fn('_canRoll')+fn('activateRoll'),c);
  return c;
}
test('roll spends one shared mobility gauge cell, no MP, runs 6 frames and is invulnerable for 5',()=>{
  const c=rollCtx(225);
  assert.equal(c._canRoll(),true);
  c.activateRoll(3);
  assert.equal(c._harpGauge,180);
  assert.equal(c.P.mp,50);
  assert.equal(c.P._bdMoveT,6);
  assert.equal(c.P._bdRoll,true);
  assert.equal(c.P.s,'bladeDash');
  assert.equal(c.P.iframes,5);
  assert.equal(c.P._bdAng,0);
});
test('roll needs a full gauge cell and cannot start while rolling',()=>{
  assert.equal(rollCtx(44.9)._canRoll(),false);
  assert.equal(rollCtx(45)._canRoll(),true);
  assert.equal(rollCtx(225,3)._canRoll(),false);
  const c=rollCtx(44.9);c.activateRoll(3);assert.equal(c._harpGauge,44.9);assert.equal(c.P.s,'idle');
});
test('roll distance is 70 percent of the Flash Step blink and shares its 6 frame duration',()=>{
  assert.match(html,/const _ROLL_DIST=250\*0\.7,_ROLL_FRAMES=6,_ROLL_IFRAMES=5,_ROLL_GAUGE_COST=_HARP_GAUGE_COST\[1\];/);
  assert.match(html,/const _bdSpd=\(P\._bdRoll\?_ROLL_DIST:250\)\/6\*_bdStep;/);
  assert.match(html,/P\._bdMoveT=_ROLL_FRAMES;/);
});
test('roll key is a configurable binding that defaults to Space and has a named row',()=>{
  assert.match(html,/bow:'Space', charge:'ShiftLeft', roll:'Space',/);
  assert.match(html,/bow:null, charge:null, roll:null,/);
  assert.match(html,/roll:'구르기 \(방향키 \+\)'/);
  assert.match(html,/roll:'Roll \(Arrow Keys \+\)'/);
});
test('warrior starts without Flash Step and double-tap is mage-only',()=>{
  assert.doesNotMatch(html,/skills:\{kiSlash:1,fireball:1,bladeDash:1/);
  assert.match(html,/else if\(_mobilityKind\(\)==='bladeDash'\)\{const _now=performance\.now\(\);/);
  assert.match(html,/\{id:'bladeDash',name:'전격이동',cat:'move',mageOnly:true,/);
});
function migCtx(charId,skills,fused,sp=0){
  const c=vm.createContext({CHAR_LIST:[{id:charId}],_charIdx:0,_skillUpSpCost:()=>1,_fuseUpSpCost:()=>1,notify:noop,_T:s=>s,setTimeout:noop,SKILL_SLOTS:[null,'bladeDash']});
  vm.runInContext("const _MAGE_CHAR_IDS=['exoduser_transmuter','exoduser_spearmage'];"+fn('_isMageChar')+fn('_mobilityKind')+fn('_ensureMobilitySkill'),c);
  const p={skills:{...skills},_fused:{...fused},sp,_skProf:{bladeDash:9}};
  return {c,p};
}
test('old warrior save: Flash Step is removed and invested SP is refunded',()=>{
  const {c,p}=migCtx('exoduser_warrior',{kiSlash:1,bladeDash:5},{},3);
  c._ensureMobilitySkill(p);
  assert.equal(p.skills.bladeDash,undefined);
  assert.equal(p.sp,3+4);
  assert.equal(p._skProf.bladeDash,undefined);
  assert.equal(c.SKILL_SLOTS[1],null);
  c._ensureMobilitySkill(p);assert.equal(p.sp,7,'migration is idempotent');
});
test('old warrior save: fusions that consume Flash Step are dissolved with their SP refunded',()=>{
  const {c,p}=migCtx('exoduser_warrior',{bladeDash:3,thunderStake:1,maliceHunt:1},{thunderGhost:true,bladeEcho:true},0);
  c._ensureMobilitySkill(p);
  assert.equal(p._fused.thunderGhost,undefined);assert.equal(p._fused.bladeEcho,undefined);
  assert.equal(p.skills.bladeDash,undefined);
  assert.equal(p.sp,2+6+6);
});
test('mage-class hero keeps Flash Step as the base mobility skill',()=>{
  const {c,p}=migCtx('exoduser_spearmage',{},{},0);
  assert.equal(c._mobilityKind(),'bladeDash');
  c._ensureMobilitySkill(p);
  assert.equal(p.skills.bladeDash,1);
  assert.equal(migCtx('exoduser_warrior',{},{}).c._mobilityKind(),'roll');
});
