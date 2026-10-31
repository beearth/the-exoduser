import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const html=fs.readFileSync('game.html','utf8');
const show=html.split('\n').find(s=>s.startsWith('function showPH('));
const helper=html.split('\n').find(s=>s.startsWith('function _isResourceShortageMessage('))||'';
for(const lang of ['ko','en','de'])for(const char of [0,1])test('localized currency shortage feedback '+lang+' character '+char,()=>{
 const translated={ko:'악의오브 부족!',en:'Not enough Orb of Malice!',de:'Nicht genug Bosheitssphäre!'}[lang];
 const calls=[];const el={style:{},classList:{add(){},remove(){}}};
 const ctx={_charIdx:char,_T:k=>k==='악의오브 부족!'?translated:k,playSample:id=>calls.push(id),_uiFail:()=>calls.push('ui'),$:()=>el,setTimeout:()=>1,clearTimeout(){}};
 vm.runInNewContext(helper+'\n'+show,ctx);
 ctx.showPH(translated+' (12)','#fff');
 assert.deepEqual(calls,[char===1?'voice_resource_fail':'ui']);
 calls.length=0;ctx.showPH('PARRY!','#fff');assert.deepEqual(calls,[]);
});
test('orb stage changes at balance boundaries and decreases after spending',()=>{
 const file='currency-orb.js';assert.ok(fs.existsSync(file),'currency orb renderer exists');
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync(file,'utf8'),ctx);const orb=ctx.window.ExoduserCurrencyOrb;
 for(const [amount,stage]of [[0,0],[999,0],[1000,1],[14999,1],[15000,2],[99999,2],[100000,3],[999,0]])assert.equal(orb.stage(amount),stage);
 assert.match(orb.icon(100000,32),/stage-4.png/);assert.match(orb.icon(0,48),/stage-1.png/);
});
