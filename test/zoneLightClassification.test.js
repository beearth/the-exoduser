import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {parseExpressionAt} from 'acorn';

const html=fs.readFileSync(new URL('../game.html',import.meta.url),'utf8');
function source(name){
 const from=html.indexOf('function '+name+'(');assert.ok(from>=0,name);
 return html.slice(from,parseExpressionAt(html,from,{ecmaVersion:'latest'}).end);
}
function runtime(zones=[]){
 const lights=[];
 const s={EL:{P:0,F:1,I:2,D:3,L:4,H:5},P:{x:0,y:0,skills:{spikeTrap:1}},
  G:{on:true,stage:0,mats:10,_fireZones:zones},OPT:{},_gameFrame:0,
  _lightCnt:0,_slStage:0,_slDirty:false,_slArr:[],LIT_PLAYER_R:470,LIT_PLAYER_A:.86,
  _pushLight:(...args)=>lights.push(args),_isFused:()=>false,_malCost:n=>n,
  _addSkProf(){},_cdRed:()=>0,_spikeTrapDmg:()=>10,playSample(){},_r:()=>1,shake(){}};
 const ctx=vm.createContext(s);
 vm.runInContext(source('_collectLights')+'\n'+source('activateSpikeTrap'),ctx);
 return {s,lights,collect(){lights.length=0;s._collectLights();return lights;}};
}
test('casting physical spikeTrap does not create a 780px orange area light',()=>{
 const r=runtime();const before=r.collect().map(a=>a.slice());
 r.s.activateSpikeTrap();
 assert.equal(r.s.G._fireZones[0].type,'spikeTrap');
 assert.equal(r.s.G._fireZones[0].r,300);
 assert.deepEqual(r.collect(),before,'physical trap must retain only the pre-existing player light');
});
test('non-fire and untyped non-fire zones do not inherit flame illumination',()=>{
 const zones=[['spikeTrap',0],['darkPillar',3],['holyDome'],['holyPrison'],['weakPhys'],['weakMag'],['weakPj'],['weakRev'],['maliceDome'],['storm',4],['boneStorm',3],['hellRay',5],['vortex',3],['iceVortex',2],['shockField',4],[undefined,0],[undefined,undefined]];
 for(const [type,el] of zones){
  const r=runtime([{x:0,y:0,r:300,type,el}]);
  assert.equal(r.collect().length,1,`${type}/${el} must not create orange light`);
 }
});
test('nine pillarSpike traps plus nine dark pillars do not stack orange haze',()=>{
 const zones=[];for(let i=0;i<9;i++)for(const [type,el] of [['spikeTrap',0],['darkPillar',3]])zones.push({x:i*10,y:0,r:300,type,el});
 assert.equal(runtime(zones).collect().length,1);
});
test('actual fire zones retain preset 7, radius and intensity including untyped flame ground',()=>{
 for(const type of ['fireTrail','assaultFlame','fireAura',undefined]){
  const r=runtime([{x:10,y:20,r:100,el:1,type}]);
  assert.deepEqual(r.collect()[1],[10,20,260,.68,255,140,50,7]);
 }
});
test('iceStorm retains the existing blue light without needing an element field',()=>{
 const r=runtime([{x:10,y:20,r:100,type:'iceStorm'}]);
 assert.deepEqual(r.collect()[1],[10,20,240,.55,68,200,255]);
});
