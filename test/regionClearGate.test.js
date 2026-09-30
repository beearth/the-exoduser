// [REGION] 4분면 지역 클리어 + 보스게이트 개방 테스트 (2026-09-30)
// 지역 귀속(스폰 위치), 80% 클리어 임계, 앵글러 요구조건, 4지역 개방, 빈 지역, 문지기 보너스
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
const START='// [REGION] 4분면 지역 클리어 시스템 (2026-09-30)';
const END='// ═══ 필드보스: 심연의 앵글러';
const s=html.indexOf(START),e=html.indexOf(END,s);
assert.ok(s>=0&&e>s,'[REGION] block exists in game.html');
const block=html.slice(s,e);

const T=64;
function harness(g,p){
  const calls={ph:[],txt:[],pet:[],sfx:0};
  // [REGION-BANNER] Hell Gothic 배너 DOM 스텁 (#regionBanner 계열 리프)
  const mkEl=()=>({textContent:'',style:{},_cls:new Set(),
    classList:{add(c){this._add(c)},remove(c){this._rm(c)},toggle(c,f){f?this._add(c):this._rm(c)},
      contains(c){return this._has(c)},_add(c){},_rm(c){},_has(c){return false}}});
  const els={};
  const $=id=>{if(!els[id]){const e=mkEl();
    e.classList._add=c=>e._cls.add(c);e.classList._rm=c=>e._cls.delete(c);e.classList._has=c=>e._cls.has(c);
    els[id]=e}
    return els[id]};
  const sandbox={
    G:g,P:p,T,ens:[],_gameFrame:0,_mmDirty:0,_EN:{},
    OPT:{lang:'ko'},
    _spawnHoleCount:(size,si)=>10,
    _L:(ko,en)=>ko,_T:t=>t,
    $:id=>Object.assign($(id),{offsetWidth:0}),
    showPH:(t,c,d)=>calls.ph.push(t),
    addTxt:(x,y,t)=>calls.txt.push(t),
    _petSayCD:(id)=>calls.pet.push(id),
    SFX:{magic:()=>calls.sfx++},
    ELC:{1:'#ff5522',2:'#33bbff',3:'#9933cc',4:'#ffdd33'},
    Float64Array,Object,Math,
  };
  sandbox.globalThis=sandbox;
  vm.runInNewContext(block,sandbox,{filename:'region-block.js'});
  return {s:sandbox,calls,els};
}
const mkG=(over={})=>Object.assign({
  mw:200,mh:200,map:[[0]],_isTileRLE:false,stage:1,
  spawnHoles:[],_gateGuard:null,_gateGuardKilled:false,
  _bossCx:100,_gateY:20,_fbDone:false,_fbSpawned:false,_fieldBosses:null,
},over);
const hole=(tx,ty)=>({x:(tx+.5)*T,y:(ty+.5)*T,size:.5});

test('regions split at tile midpoint and totals come from spawn holes per quadrant',()=>{
  const G=mkG({spawnHoles:[hole(10,10),hole(150,150),hole(20,30)]}); // NW×2, SE×1
  const {s}=harness(G,{x:32,y:32});
  s._regionInit(1);
  assert.ok(G._regions,'regions created');
  assert.equal(G._regions.length,4);
  assert.equal(G._regions[0].total,20,'NW total = 2 holes × 10');
  assert.equal(G._regions[3].total,10,'SE total = 1 hole × 10');
  assert.equal(G._regions[1].total,0);
  assert.equal(G._regions[0].nameKo,'북서','generic stage uses direction names');
  // 소형 맵(한 변 180타일 미만 — 던전/소환굴/보스아레나)은 지역 없음
  const G2=mkG({mw:128,mh:108});
  const h2=harness(G2,{x:32,y:32});
  h2.s._regionInit(1);
  assert.equal(G2._regions,null,'small maps have no regions (old rule fallback)');
});

test('kills are attributed to the spawn(home) region, not the death position',()=>{
  const G=mkG({spawnHoles:[hole(10,10),hole(150,150)]});
  const {s}=harness(G,{x:32,y:32});
  s._regionInit(1);
  // 스폰=SE(150,150), 사망 위치=NW → SE에 귀속
  s._regKill({_homeX:150*T,_homeY:150*T,x:5*T,y:5*T,ib:false});
  assert.equal(G._regions[3].kills,1);
  assert.equal(G._regions[0].kills,0);
  s._regKill({ib:true,_homeX:10*T,_homeY:10*T}); // 보스 제외
  assert.equal(G._regions[0].kills,0);
});

test('region clears at 80% kills and shows the Hell Gothic purge banner (no showPH toast)',()=>{
  // 4분면 전부 소환굴 보유 → 빈 지역 자동클리어 없음 (4/4 시 배너는 게이트 연출에 인계되므로 1/4 상황을 만든다)
  const G=mkG({spawnHoles:[hole(10,10),hole(150,10),hole(10,150),hole(150,150)]});
  const {s,calls,els}=harness(G,{x:32,y:32});
  s._regionInit(1);
  assert.equal(G._regions[0].cleared,false);
  for(let i=0;i<7;i++)s._regKill({_homeX:10*T,_homeY:10*T});
  s._regionCheckClears();
  assert.equal(G._regions[0].cleared,false,'7/10 < 80%');
  s._regKill({_homeX:10*T,_homeY:10*T});
  s._regionCheckClears();
  assert.equal(G._regions[0].cleared,true,'8/10 >= 80%');
  assert.ok(els.regionBannerKr.textContent.includes('북서')&&els.regionBannerKr.textContent.includes('정화'),'purge banner shows region name + 정화');
  assert.match(els.regionBannerEn.textContent,/REGION PURGED · 1 \/ 4/,'EN subtitle line');
  assert.equal(calls.ph.length,0,'generic showPH toast is not used any more');
});

test('stage 0 region additionally requires its Abyssal Angler dead',()=>{
  const G=mkG({stage:0,spawnHoles:[hole(60,150)],_fbSpawned:true,
    _fieldBosses:[{hp:100},{hp:0},{hp:0},{hp:0}]}); // fb0=SW 담당(지역2) 생존
  const {s}=harness(G,{x:32,y:32});
  s._regionInit(0);
  assert.equal(G._regions[2].fbIdx,0,'SW region owns _FB_SITES[0]');
  assert.equal(G._regions[2].nameKo,'남서 · 물','CH1 element-themed name');
  for(let i=0;i<10;i++)s._regKill({_homeX:60*T,_homeY:150*T});
  s._regionCheckClears();
  assert.equal(G._regions[2].cleared,false,'100% kills but angler alive');
  G._fieldBosses[0].hp=0;
  s._regionCheckClears();
  assert.equal(G._regions[2].cleared,true,'angler dead → cleared');
});

test('empty region (no holes, no angler) is silently cleared at init',()=>{
  const G=mkG({spawnHoles:[hole(10,10)]});
  const {s,calls}=harness(G,{x:32,y:32});
  s._regionInit(1);
  assert.equal(G._regions[1].cleared,true);
  assert.equal(G._regions[2].cleared,true);
  assert.equal(G._regions[3].cleared,true);
  assert.equal(calls.ph.length,0,'no banner spam at init');
  assert.equal(s._regionClearedCount(),3);
  // 스테이지0 빈 지역이라도 앵글러 담당이면 클리어 아님
  const G2=mkG({stage:0,spawnHoles:[],_fbSpawned:false});
  const h2=harness(G2,{x:32,y:32});
  h2.s._regionInit(0);
  assert.equal(h2.s._regionClearedCount(),0,'unspawned anglers keep regions uncleared');
});

test('gate guard kill grants +10% only to the gate region',()=>{
  const G=mkG({spawnHoles:[hole(10,10),hole(150,150)],
    _gateGuard:{x:10*T,y:10*T}}); // 문지기=NW
  const {s}=harness(G,{x:32,y:32});
  s._regionInit(1);
  assert.equal(G._regGateIdx,0);
  for(let i=0;i<7;i++)s._regKill({_homeX:10*T,_homeY:10*T}); // 0.7
  for(let i=0;i<7;i++)s._regKill({_homeX:150*T,_homeY:150*T}); // 0.7
  s._regionCheckClears();
  assert.equal(G._regions[0].cleared,false);
  G._gateGuardKilled=true;
  s._regionCheckClears();
  assert.equal(G._regions[0].cleared,true,'0.7+0.10 >= 0.8 in gate region');
  assert.equal(G._regions[3].cleared,false,'bonus does not apply to other regions');
});

test('boss gate unlock rule is all-4-regions-cleared (old global 80% only as regionless fallback)',()=>{
  const gate=html.slice(html.indexOf('지옥문 개방: 4지역 전부 클리어'),html.indexOf('if(!G.stageCleared&&G.exits.length>0'));
  assert.ok(gate.includes('_regionClearedCount()>=4'),'unlock checks 4 regions');
  assert.ok(gate.includes('if(G._regions){'),'region path guards the new rule');
  assert.match(gate,/지역 없는 맵 폴백/,'old ratio rule kept only for regionless maps');
  assert.ok(html.includes("_L('지옥문이 봉인됨 — 지역 클리어 ','Gate sealed — regions cleared ')"),'locked message uses region terms');
  assert.ok(html.includes("_L('지옥문 봉인 (지역 ','Gate Sealed (Regions ')"),'portal label uses region terms');
});
