import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {parseExpressionAt} from 'acorn';
import {extract} from './binding-save-harness.mjs';
import {createD17LifecycleReview,createD17LifecycleCalls,inspectD17ReviewRoll} from './d17-async-boundary-candidate.mjs';
const source=fs.readFileSync(new URL('../../../game.html',import.meta.url),'utf8');
const hash=text=>crypto.createHash('sha256').update(text).digest('hex');
const evidence=[];
function boundary(name,choose) {
  const text=extract(source,name),ast=parseExpressionAt(text,0,{ecmaVersion:'latest'}),statements=[];
  function walk(node){if(!node||typeof node!=='object')return;if(choose(node,text))statements.push(text.slice(node.start,node.end));else for(const value of Object.values(node))if(Array.isArray(value))value.forEach(walk);else if(value&&typeof value==='object')walk(value);}
  walk(ast.body);
  assert.ok(statements.length,name);
  evidence.push({name,sha256:hash(text),line:source.slice(0,source.indexOf(text)).split('\n').length,boundaries:statements});
  return statements.join(';');
}
const resets=['initStage','_enterBossArena','_fallenResolve'].map(name=>({name,text:boundary(name,(node,text)=>node.type==='AssignmentExpression'&&text.slice(node.left.start,node.left.end)==='G._fireZones')}));
const character=boundary('_loadCharAtlas',(node,text)=>node.type==='AssignmentExpression'&&text.slice(node.left.start,node.left.end)==='_charIdx');
const restore=boundary('dbRestore',(node,text)=>node.type==='AssignmentExpression'&&text.slice(node.left.start,node.left.end)==='INV.equipped');
const replacement=boundary('startGameFromDB',(node,text)=>node.type==='AssignmentExpression'&&text.slice(node.start,node.end)==='P=mkP()');
const black=extract(source,'fireBlackStar'),trap=extract(source,'activateSpikeTrap');
for(const [name,text]of [['fireBlackStar',black],['activateSpikeTrap',trap]])evidence.push({name,sha256:hash(text)});
let checks=0;
const check=async(name,run)=>{await run();checks++;};
const item=value=>({uniqueId:'UI-17',slot:'helmet',uniqueRoll:{version:1,effectId:'U-D17',stat:'_uBlackZoneGather',unit:'count',storedValue:value}});
function fixture(options={enabled:true,reviewOnly:true}) {
  const noop=()=>{};
  const context=vm.createContext({P:{x:100,y:0,skills:{spikeTrap:2,blackStar:1},_bsX:0,_bsY:0,iframes:0},G:{mats:100,slowMo:0,_fireZones:[]},INV:{equipped:{helmet:item(3)}},_charIdx:0,ens:[],EL:{P:1},OPT:{hitStop:100},_HS:{blackStar:1},ultUnmute:noop,_cdRed:()=>0,poolPart:noop,dst:Math.hypot,SFX:{detonate:noop},shake:noop,addTxt:noop,_T:value=>value,_isFused:()=>false,_malCost:value=>value,_addSkProf:noop,_spikeTrapDmg:()=>77,playSample:noop,_r:()=>1});
  vm.runInContext(black+'\n'+trap,context);
  const runtime=createD17LifecycleReview({...options,getPlayer:()=>context.P,getCharacterKey:()=>context._charIdx,getZones:()=>context.G._fireZones,getEquippedHelmet:()=>context.INV.equipped.helmet,fireBlackStar:context.fireBlackStar,activateSpikeTrap:context.activateSpikeTrap});
  const cast=()=>{context.P._bsCasting=true;runtime.fireBlackStar();};
  return {context,runtime,cast,zone:()=>context.G._fireZones[0]};
}
for(const value of [1,2,3])await check('정규 저장롤',()=>assert.equal(inspectD17ReviewRoll(item(value)).value,value));
for(const value of [null,undefined,0,4,1.2,'2',NaN])await check('무효 저장롤 효과0',()=>{const test=fixture();test.context.INV.equipped.helmet=item(value);test.runtime.activateSpikeTrap();test.cast();assert.equal(test.zone().x,100);});
for(const helmet of [null,{}, {uniqueId:'UI-17',slot:'helmet'}, {...item(2),slot:'armor'}, {...item(2),uniqueId:'UI-10'}])await check('누락/미등록 효과0',()=>{const test=fixture();test.context.INV.equipped.helmet=helmet;test.runtime.activateSpikeTrap();test.cast();assert.equal(test.zone().x,100);});
await check('getter 미실행',()=>{const helmet={uniqueId:'UI-17',slot:'helmet'};Object.defineProperty(helmet,'uniqueRoll',{enumerable:true,get(){throw Error('getter');}});assert.equal(inspectD17ReviewRoll(helmet).value,null);});
await check('JSON 저장복원/RNG0',()=>{const original=Math.random;Math.random=()=>{throw Error('RNG');};try{for(const value of [1,2,3])assert.equal(inspectD17ReviewRoll(JSON.parse(JSON.stringify(item(value)))).value,value);}finally{Math.random=original;}});
await check('identity/상태 및 동일 객체 새cast',()=>{const test=fixture();test.runtime.activateSpikeTrap();const zone=test.zone(),before={...zone};test.cast();assert.equal(test.zone(),zone);assert.equal(zone.x,0);for(const key of Object.keys(before))if(!['x','y'].includes(key))assert.equal(zone[key],before[key]);zone.x=100;test.cast();assert.equal(zone.x,0);});
for(const reset of resets)await check(`실제 ${reset.name} clear경계`,()=>{const test=fixture();test.runtime.activateSpikeTrap();const stale=test.zone();const original=vm.runInContext(`(function(){${reset.text};return 17})`,test.context);assert.equal(test.runtime.wrapBoundary(original)(),17);test.context.G._fireZones.push(stale);test.cast();assert.equal(stale.x,100);});
await check('실제 캐릭터 assignment/새 player',()=>{const test=fixture();test.runtime.activateSpikeTrap();const stale=test.zone();const switchCharacter=vm.runInContext(`(function(idx){${character};})`,test.context);test.runtime.wrapBoundary(switchCharacter)(1);test.cast();assert.equal(stale.x,100);test.context.P={...test.context.P,x:200,_gcCd:0};test.runtime.activateSpikeTrap();const fresh=test.context.G._fireZones[1];test.cast();assert.equal(fresh.x,0);assert.equal(stale.x,100);});
await check('실제 dbRestore equipped경계',()=>{const test=fixture();test.runtime.activateSpikeTrap();const stale=test.zone();const restoreFixture=vm.runInContext(`(function(d){${restore};return true;})`,test.context);assert.equal(test.runtime.wrapBoundary(restoreFixture)({inv:{equipped:{helmet:item(2)}}}),true);test.cast();assert.equal(stale.x,100);test.context.P._gcCd=0;test.runtime.activateSpikeTrap();test.cast();assert.equal(test.context.G._fireZones[1].x,0);});
await check('배열/player/character 자동경계',()=>{for(const change of ['array','player','character']){const test=fixture();test.runtime.activateSpikeTrap();const stale=test.zone();if(change==='array')test.context.G._fireZones=[stale];if(change==='player')test.context.P={...test.context.P};if(change==='character')test.context._charIdx=1;test.cast();assert.equal(stale.x,100);}});
await check('실제 startGameFromDB player교체 경계',()=>{const test=fixture();test.runtime.activateSpikeTrap();const stale=test.zone();test.context.mkP=()=>({...test.context.P,x:200,_gcCd:0});const load=vm.runInContext(`(function(){${replacement};return P;})`,test.context);const fresh=test.runtime.wrapBoundary(load)();assert.equal(fresh,test.context.P);test.cast();assert.equal(stale.x,100);test.runtime.activateSpikeTrap();test.cast();assert.equal(test.context.G._fireZones[1].x,0);});
await check('명시 lifecycle callsite 포트',()=>{let count=0;const originals=Object.fromEntries(['initStage','_enterBossArena','_fallenResolve','_loadCharAtlas','dbRestore','startGameFromDB'].map(name=>[name,()=>++count]));const calls=createD17LifecycleCalls({},originals);for(const name of Object.keys(originals))assert.equal(calls.boundaries[name](),count);assert.equal(count,6);assert.equal(calls.runtime.runtimeReady,false);});
await check('비활성 원동작',()=>{const test=fixture({});test.runtime.activateSpikeTrap();test.cast();assert.equal(test.zone().x,100);});
await check('동기실패/비동기성공/실패 clear',async()=>{const test=fixture();test.runtime.activateSpikeTrap();assert.throws(test.runtime.wrapBoundary(()=>{throw Error('fixture');}));assert.equal(await test.runtime.wrapBoundary(async()=>23)(),23);await assert.rejects(test.runtime.wrapBoundary(async()=>{throw Error('fixture');})());test.cast();assert.equal(test.zone().x,100);});
console.log(JSON.stringify({utc:new Date().toISOString(),checks,status:'PASS',gameSha256:hash(source),productionD17FieldsPresent:/uniqueRoll|UI-17|_uBlackZoneGather/.test(source),evidence},null,2));
