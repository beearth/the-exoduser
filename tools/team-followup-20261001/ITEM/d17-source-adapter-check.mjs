import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {parseExpressionAt} from 'acorn';
import {extract} from './binding-save-harness.mjs';
import {createD17SourceAdapter} from './d17-source-adapter-candidate.mjs';
const source=fs.readFileSync(new URL('../../../game.html',import.meta.url),'utf8');
const hash=text=>crypto.createHash('sha256').update(text).digest('hex');
const names=['fireBlackStar','activateSpikeTrap'];
const originals=names.map(name=>({name,text:extract(source,name)}));
const literals=[];
for(const match of source.matchAll(/G\._fireZones\.push\(\s*\{/g)){
  const start=source.indexOf('{',match.index),parsed=parseExpressionAt(source,start,{ecmaVersion:'latest'});
  const type=parsed.properties.find(property=>property.key?.name==='type')?.value?.value;
  if(type==='storm'||type==='fireAura')literals.push({type,text:source.slice(start,parsed.end),line:source.slice(0,start).split('\n').length});
}
let checks=0;
const check=(name,run)=>{run();checks++;};
function fixture(options={enabled:true,reviewOnly:true}) {
  let rollReads=0;
  const noop=()=>{};
  const context=vm.createContext({P:{x:100,y:0,skills:{spikeTrap:2,blackStar:1},_bsX:0,_bsY:0,iframes:0},G:{mats:100,slowMo:0,_fireZones:[]},ens:[],EL:{P:1},OPT:{hitStop:100},_HS:{blackStar:1},
    ultUnmute:noop,_cdRed:()=>0,poolPart:noop,dst:Math.hypot,SFX:{detonate:noop},shake:noop,addTxt:noop,_T:value=>value,
    _isFused:()=>false,_malCost:value=>value,_addSkProf:noop,_spikeTrapDmg:()=>77,playSample:noop,_r:()=>1});
  vm.runInContext(originals.map(entry=>entry.text).join('\n'),context);
  const adapter=createD17SourceAdapter(options);
  const getZones=()=>context.G._fireZones;
  const trap=adapter.wrapOriginalTrap(context.activateSpikeTrap,getZones);
  const end=adapter.wrapBlackEnd(context.fireBlackStar,{player:context.P,getZones,readStoredRoll:()=>{rollReads++;return 3;}});
  return {context,adapter,trap,end,getZones,reads:()=>rollReads};
}
check('실제 생성→종료·identity/필드',()=>{
  const test=fixture();test.trap();const zone=test.getZones()[0];const before={...zone};
  test.context.P._bsCasting=true;test.end();assert.equal(test.getZones()[0],zone);assert.equal(zone.x,0);
  for(const key of Object.keys(before))if(!['x','y'].includes(key))assert.equal(zone[key],before[key]);
  assert.equal(test.context.P._bsCd,7200);assert.equal(test.reads(),1);
  zone.x=90;test.end();assert.equal(zone.x,90);assert.equal(test.reads(),1);
});
check('새 cast/재사용',()=>{const test=fixture();test.trap();for(let repeat=0;repeat<2;repeat++){test.getZones()[0].x=90;test.context.P._bsCasting=true;test.end();assert.equal(test.getZones()[0].x,0);}assert.equal(test.reads(),2);});
check('clear/reset 오래된 token 및 provenance 제거',()=>{const test=fixture();test.trap();test.context.P._bsCasting=true;const token=test.adapter.beginBlackCast(test.context.P);test.adapter.clear();test.context.P._bsCasting=false;assert.equal(test.adapter.endBlackCast({player:test.context.P,token}).status,'unconfirmed-end');test.context.P._bsCasting=true;test.end();assert.equal(test.getZones()[0].x,100);test.context.P._gcCd=0;test.trap();test.context.P._bsCasting=true;test.end();assert.equal(test.getZones()[1].x,0);});
for(const options of [{},{enabled:true},{reviewOnly:true}])check('비활성 원함수만 실행',()=>{const test=fixture(options);test.trap();test.context.P._bsCasting=true;test.end();assert.equal(test.getZones()[0].x,100);assert.equal(test.reads(),0);});
check('미확정/보스/자식 출처 등록0',()=>{const test=fixture();const zone={type:'spikeTrap',x:20,y:0,t:1,maxT:600};test.getZones().push(zone);for(const site of ['boss','U-D13-child','unknown'])assert.equal(test.adapter.recordCreated(zone,site),false);test.context.P._bsCasting=true;test.end();assert.equal(zone.x,20);});
check('추적/불명 fireAura 거부',()=>{const test=fixture();for(const follow of [true,undefined])assert.equal(test.adapter.recordCreated({type:'fireAura',follow},'activateGiantSlam/infernoSlam-fixed'),false);});
check('실제 고정 오라/폭풍 literal 연결',()=>{
  const test=fixture();const context={P:{x:150,y:0},EL:{F:1,L:2},_ifR:300,_ifDmg:30,_ifLv:2,_hrwx:200,_hrwy:0,_msR:300,_hrDur:600,_msDmg:30,_msLv:2,_mswx:250,_mswy:0};
  const entries=literals.filter(entry=>entry.type==='storm'||entry.text.includes('follow:false')).map(entry=>vm.runInNewContext(`(${entry.text})`,context));
  for(const zone of entries)assert.equal(test.adapter.recordCreated(zone,zone.type==='storm'?'update/maliceStorm-original':'activateGiantSlam/infernoSlam-fixed'),true);
  const before=entries.map(zone=>({...zone}));test.context.P._bsCasting=true;const token=test.adapter.beginBlackCast(test.context.P);test.context.P._bsCasting=false;
  const result=test.adapter.endBlackCast({player:test.context.P,token,center:{x:0,y:0},zones:entries,storedRoll:3});assert.equal(result.moved.length,3);
  entries.forEach((zone,index)=>{assert.equal(result.zones[index],zone);for(const key of Object.keys(before[index]))if(!['x','y'].includes(key))assert.equal(zone[key],before[index][key]);});
});
check('등록 이후 타입 변경 거부',()=>{const test=fixture();test.trap();test.getZones()[0].type='storm';test.context.P._bsCasting=true;test.end();assert.equal(test.getZones()[0].x,100);});
check('잘못된 롤 소비/중복 종료',()=>{const test=fixture();test.trap();test.context.P._bsCasting=true;const token=test.adapter.beginBlackCast(test.context.P);test.context.P._bsCasting=false;const args={player:test.context.P,token,center:{x:0,y:0},zones:test.getZones(),storedRoll:4};assert.equal(test.adapter.endBlackCast(args).status,'invalid-stored-roll');assert.equal(test.adapter.endBlackCast({...args,storedRoll:3}).status,'unconfirmed-end');});
check('600경계/저장 상한',()=>{for(const roll of [1,2,3]){const test=fixture();const entries=[100,300,600,601].map(x=>({type:'storm',x,y:0,t:1,maxT:600,dmg:10,el:2}));for(const zone of entries)test.adapter.recordCreated(zone,'update/maliceStorm-original');test.context.P._bsCasting=true;const token=test.adapter.beginBlackCast(test.context.P);test.context.P._bsCasting=false;assert.equal(test.adapter.endBlackCast({player:test.context.P,token,center:{x:0,y:0},zones:entries,storedRoll:roll}).moved.length,roll);assert.equal(entries[3].x,601);}});
check('쓰기 불가 선검사 부분변경0',()=>{const test=fixture();const entries=[20,40].map(x=>({type:'storm',x,y:0,t:1,maxT:600}));entries.forEach(zone=>test.adapter.recordCreated(zone,'update/maliceStorm-original'));Object.freeze(entries[1]);test.context.P._bsCasting=true;const token=test.adapter.beginBlackCast(test.context.P);test.context.P._bsCasting=false;assert.equal(test.adapter.endBlackCast({player:test.context.P,token,center:{x:0,y:0},zones:entries,storedRoll:3}).status,'unwritable-position');assert.equal(entries[0].x,20);});
console.log(JSON.stringify({utc:new Date().toISOString(),checks,status:'PASS',gameSha256:hash(source),functions:originals.map(({name,text})=>({name,sha256:hash(text),line:source.slice(0,source.indexOf(text)).split('\n').length})),literals:literals.map(({type,text,line})=>({type,line,sha256:hash(text),text}))},null,2));
