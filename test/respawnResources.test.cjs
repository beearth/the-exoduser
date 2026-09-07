const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const src=fs.readFileSync('game.html','utf8');
const retry=src.slice(src.indexOf("$('retryBtn').onclick=async()=>{"));
const tail=retry.slice(retry.indexOf('  P.hp=P.mhp;'),retry.indexOf('  // DB'));
const helper=src.match(/function _refillRespawnResources\(\)\{[\s\S]*?\n\}/)?.[0]||'';
for(const [name,skills,fused,dim,extra,cells,stocks] of [
 ['base',{},'',false,0,5,1],
 ['charge',{chargeBoost:20},'',false,17,6,5],
 ['dimension',{},'',true,11,7,5],
 ['thunder',{},'dimThunder',false,0,9,1],
 ['rush',{},'dimRush',false,23,10,1]
])test('respawn fills final maxima: '+name,()=>{
 const c={P:{hp:0,mhp:50,mp:1,mmp:40,st:2,mst:30,shield:0,mshield:20,chargeStocks:0,maxChargeStocks:1,chargeCd:99,skills},G:{},
  _harpGauge:4,_HARP_GAUGE_MAX:225,_HARP_GAUGE_BASE_CELLS:5,_HARP_GAUGE_COST:[0,45,98,150],
  ar:()=>({}),bt:()=>({}),isDimBreach:()=>dim,_isFused:k=>k===fused,_eqAffix:()=>extra,
  applyStats(){Object.assign(c.P,{mhp:900,mmp:800,mst:700,mshield:600});},
  $:()=>({classList:{add(){}}}),updateQS(){}};
 vm.createContext(c);vm.runInContext(helper+'\n'+tail,c);
 for(const [v,m]of [['hp','mhp'],['mp','mmp'],['st','mst'],['shield','mshield']])assert.equal(c.P[v],c.P[m],v);
 assert.equal(c._harpGauge,cells*45+extra,'mobility full with current bonuses');
 assert.equal(c.P.chargeStocks,stocks);assert.equal(c.P.chargeCd,0);
});
