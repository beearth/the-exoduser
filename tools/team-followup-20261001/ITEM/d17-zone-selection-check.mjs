import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {parseExpressionAt} from 'acorn';
import {extract} from './binding-save-harness.mjs';
import {selectD17Zones, D17_CONTRACT} from './d17-zone-selection-candidate.mjs';

const root = new URL('../../../',import.meta.url);
const source = fs.readFileSync(new URL('game.html',root),'utf8');
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const fixtures = [], evidence = [];
const context = vm.createContext({P:{x:100,y:100},EL:{P:0,F:1,L:2,D:3},r:300,dmg:50,lv:2,slv:2,
  _faR:300,_faDmg:40,_faLv:2,_ifR:300,_ifDmg:45,_ifLv:2,
  _hrwx:200,_hrwy:100,_mswx:200,_mswy:100,_msR:300,_hrDur:600,_msDmg:50,_msLv:2,_msDur:600,
  _hdR:300,_hdDur:720,_sfR:300,_sfLv:2,_sfDmg:20,_sfDR:10,
  _thPts:[],_thBr:[],_thBW:10,_bsRingR:300,_syncDur:600,p:{x:100,y:100},_stR:300,_stDmg:50,_stLv:2});
for (const match of source.matchAll(/G\._fireZones\.push\(\s*\{/g)) {
  const start = source.indexOf('{',match.index), expression = parseExpressionAt(source,start,{ecmaVersion:'latest'});
  const type = expression.properties.find(property => property.key?.name === 'type')?.value?.value;
  if (!['spikeTrap','fireAura','storm','holyDome','shockField','boneStorm'].includes(type)) continue;
  const literal = source.slice(start,expression.end);
  try {
    const zone = vm.runInContext(`(${literal})`,context);
    fixtures.push(zone);
    evidence.push({type,follow:zone.follow ?? null,line:source.slice(0,start).split('\n').length,sha256:sha(literal),literal});
  } catch (error) {
    evidence.push({type,line:source.slice(0,start).split('\n').length,sha256:sha(literal),fixtureError:error.message});
  }
}
const find = (type,follow) => {
  const zone = fixtures.find(entry => entry.type === type && (follow === undefined || entry.follow === follow));
  assert.ok(zone,`실제 literal fixture ${type}/${follow}`);
  return {...zone};
};
let checks = 0;
const check = (name,run) => {run(); checks++;};
const event = {kind:'black-end',sourceId:'blackStar',castId:'synthetic-cast-1',x:0,y:0};
const zones = [find('spikeTrap'),find('fireAura',false),find('storm'),find('fireAura',true),find('holyDome'),find('shockField'),find('boneStorm')];
zones.forEach((zone,index) => {zone.x=100+index;zone.y=0;zone.t=12;zone.tickFixture={enemy:17};});
const input = {enabled:true,event,storedRoll:3,zones,playerZones:zones};
check('비활성 기본',()=>{assert.equal(selectD17Zones({...input,enabled:undefined}).status,'disabled');assert.equal(D17_CONTRACT.runtimeReady,false);});
for (const roll of [1,2,3]) check(`저장 상한 ${roll}`,()=>assert.equal(selectD17Zones({...input,storedRoll:roll}).moved.length,roll));
for (const roll of [undefined,null,0,4,1.5,'3',NaN,Infinity]) check('무효 저장값 복구0',()=>assert.equal(selectD17Zones({...input,storedRoll:roll}).status,'invalid-stored-roll'));
check('실제 타입·추적 제외',()=>assert.deepEqual(selectD17Zones(input).moved.map(entry=>entry.index),[0,1,2]));
check('출처 미확정 제외',()=>assert.equal(selectD17Zones({...input,playerZones:[]}).moved.length,0));
check('보스 우선 제외',()=>assert.equal(selectD17Zones({...input,bossZones:zones}).moved.length,0));
check('fireAura follow 명시 false',()=>{const zone={...zones[1]};delete zone.follow;assert.equal(selectD17Zones({...input,zones:[zone],playerZones:[zone]}).moved.length,0);});
check('600 포함/초과 제외',()=>{const near={...zones[0],x:600},far={...zones[2],x:600.001};assert.equal(selectD17Zones({...input,zones:[far,near],playerZones:[far,near]}).moved.length,1);});
check('거리/배열 동률',()=>{const entries=[300,100,-100].map(x=>({...zones[0],x}));assert.deepEqual(selectD17Zones({...input,zones:entries,playerZones:entries}).moved.map(entry=>entry.index),[1,2,0]);});
check('수명/비유한 제외',()=>{const entries=[{t:600,maxT:600},{t:-1},{x:NaN},{maxT:Infinity}].map(fields=>({...zones[0],...fields}));assert.equal(selectD17Zones({...input,zones:entries,playerZones:entries}).moved.length,0);});
check('동일 객체 중복 한 개',()=>assert.equal(selectD17Zones({...input,zones:[zones[0],zones[0]]}).moved.length,1));
check('시전 중복/빈 스캔 소비',()=>{const result=selectD17Zones({...input,playerZones:[]});assert.equal(selectD17Zones({...input,processedCastIds:result.processedCastIds}).status,'already-processed');});
check('블랙 종료 외 거부',()=>{for(const fields of [{kind:'tick'},{sourceId:'lavaSummon'},{castId:''},{x:NaN}])assert.equal(selectD17Zones({...input,event:{...event,...fields}}).status,'invalid-event');});
check('좌표 외 모든 상태/원본 불변',()=>{
  const before=JSON.stringify(zones),result=selectD17Zones(input);
  assert.equal(JSON.stringify(zones),before);
  result.zones.forEach((zone,index)=>{
    if(index<3){assert.notEqual(zone,zones[index]);assert.equal(zone.x,0);assert.equal(zone.y,0);}
    else assert.equal(zone,zones[index]);
    for(const key of Object.keys(zones[index]))if(!['x','y'].includes(key))assert.equal(zone[key],zones[index][key]);
  });
});
check('RNG 사용0',()=>{const original=Math.random;Math.random=()=>{throw Error('RNG 금지');};try{selectD17Zones(input);}finally{Math.random=original;}});
const functions = ['fireBlackStar','activateSpikeTrap','activateGiantSlam','update'].map(name=>{const text=extract(source,name);return {name,sha256:sha(text),line:source.slice(0,source.indexOf(text)).split('\n').length};});
console.log(JSON.stringify({utc:new Date().toISOString(),checks,status:'PASS',gameSha256:sha(source),functions,fixtures:evidence},null,2));
