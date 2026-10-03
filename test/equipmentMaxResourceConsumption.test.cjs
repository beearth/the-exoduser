// Reuse the actual whole restore/equip -> whole applyStats/recalcSt two-VM
// fixture. New boundaries are HP/MP/shield equipment fields and slot exclusion.
// Synthetic equipment, no crystals/full boot/native/user save/UI/audio.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=process.cwd(),text=fs.readFileSync(path.join(root,'test/equipmentPrimaryStatsConsumption.test.cjs'),'utf8');
const cut=text.indexOf("for(const file of ['game.html','game-easy-test.html']){");assert(cut>0);
const c={require,__dirname:path.join(root,'test'),process,console,structuredClone};vm.createContext(c);
vm.runInContext(text.slice(0,cut)+'\nglobalThis.h={actual,original,restored,consume};',c);
const {actual,original,restored,consume}=c.h;
for(const file of ['game.html','game-easy-test.html']){
 for(const raw of [0,20,-10,.5,10000,NaN,Infinity,undefined])test(file+' numeric max-resource bonus compatibility '+raw,()=>{
  const state=restored(file,{bonusHp:raw,bonusMp:raw,bonusShield:raw});assert.deepEqual(consume(actual,file,state),consume(original,file,state));
 });
 for(const field of ['bonusHp','bonusMp','bonusShield'])for(const [raw,n] of [['20',20],['0',0],['-10',-10],['.5',.5],['ab',0],[{},0]])for(const bag of [false,true])test(file+' restored '+field+'='+JSON.stringify(raw)+' bag='+bag+' reaches maxima/current resource clamps',()=>{
  const state=restored(file,{[field]:raw},{bag}),out=consume(actual,file,state);
  assert.deepEqual(out,consume(actual,file,restored(file,{[field]:n},{bag})));
  for(const key of ['mhp','mmp','mst','mshield','hp','mp','st','shield'])assert(Number.isFinite(out.P[key]),key);
  assert.deepEqual(state.equipped.armor[field],raw,'raw gear value preserved');
 });
 test(file+' explicit combined string20 max-resource bonuses',()=>{
  const out=consume(actual,file,restored(file,{bonusHp:'20',bonusMp:'20',bonusShield:'20'}));
  assert.equal(out.P.mhp,845);assert.equal(out.P.mmp,341);assert.equal(out.P.mshield,252);
 });
 test(file+' excluded weapon/bow/helmet and Easy-only absence preserve slot contract',()=>{
  const state=restored(file,{}),normal=consume(actual,file,state);
  for(const slot of ['weapon','bow','helmet',...(file==='game-easy-test.html'?['headband2']:[])])state.equipped[slot]={bonusHp:'9999',bonusMp:'9999',bonusShield:'9999',affixes:[],crystals:[]};
  assert.deepEqual(consume(actual,file,state),normal);
 });
 test(file+' all included defense/accessory slots consume numeric resource bonuses',()=>{
  const slots=['shield','armor','boots','gloves','pants','belt','necklace','ring1','ring2','cape','bracelet','headband','ossuary',...(file==='game.html'?['headband2']:[])];
  for(const slot of slots){
   const a=restored(file,{}),b=restored(file,{});
   a.equipped[slot]={bonusHp:'20',bonusMp:'20',bonusShield:'20',affixes:[],crystals:[]};
   b.equipped[slot]={bonusHp:20,bonusMp:20,bonusShield:20,affixes:[],crystals:[]};
   assert.deepEqual(consume(actual,file,a),consume(actual,file,b),slot);
  }
 });
}
