// Actual whole restore, shared refund calculations, mounted-plan adapter and
// legacy immediate reset handler. DOM/mount/render/applyStats/save/audio doubles;
// no native gameplay, real storage or complete visual growth window runs.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=process.cwd(),dir=process.env.EXODUSER_TEST_SOURCE_DIR||root,original=process.env.EXODUSER_TEST_BASELINE_DIR;
assert(original,'explicit original baseline required');
const helper=fs.readFileSync(path.join(root,'test/passiveRefundConsumption.test.cjs'),'utf8');
const cut=helper.indexOf("for(const file of (process.env.EXODUSER_REFUND_WORKER_FILE?");assert(cut>0);
const h={require,process,console,__filename:path.join(root,'test/passiveRefundConsumption.test.cjs')};
vm.createContext(h);vm.runInContext(helper.slice(0,cut)+'\nglobalThis.helper={source,fixture,state,direct,planned};',h);
const {source,fixture,state,direct,planned}=h.helper;
const plain=x=>JSON.parse(JSON.stringify(x));
function setup(s,config={}){
 const c=fixture(s,0);c.data.stats=config.stats||{str:5,dex:3,vit:2};
 c.data.grit=Object.hasOwn(config,'grit')?config.grit:10;c.data.gritCostModeV2=true;
 assert.equal(c.dbRestore(c.data),true);c.calls.length=0;return c;
}
for(const file of ['game.html','game-easy-test.html']){
 const s=source(file,dir),old=source(file,original);
 for(const cfg of [{},{stats:{str:0,dex:0,vit:0},grit:0},{stats:{str:500,dex:500,vit:4},grit:10000},{stats:{str:7,dex:8,vit:99},grit:23}])test(file+' normal whole direct/planned original compatibility '+JSON.stringify(cfg),()=>{
  assert.deepEqual(direct(setup(s,cfg)),direct(setup(old,cfg)));
  assert.deepEqual(planned(setup(s,cfg)),planned(setup(old,cfg)));
 });
 for(const cfg of [{stats:{str:'5',dex:3,vit:2}}, {grit:'10'}, {stats:{str:'5',dex:'3',vit:'2'},grit:'10'}, {stats:{str:'0',dex:'0',vit:'0'},grit:'0'}])test(file+' restored numeric strings exact SP refund '+JSON.stringify(cfg),()=>{
  const c=setup(s,cfg),raw=plain(c.data),ref=c.ExoduserStatsPanel.refundTotals(c.STATS,c.PASSIVES,vm.runInContext('_grit',c));
  const expected=Object.values(c.data.stats).reduce((a,b)=>a+Number(b),Number(c.data.grit));assert.equal(ref.sp,expected);assert.equal(typeof ref.sp,'number');
  assert.deepEqual(plain(c.data),raw);const r=direct(c);assert.equal(r.P.sp,2+expected);assert.equal(typeof r.P.sp,'number');
  if(expected){assert.equal(r.grit,0);assert(Object.values(r.stats).every(v=>v===0));assert.equal(r.calls.filter(x=>x[0]==='saveNow').length,1)}
  const p=setup(s,cfg),z=planned(p);assert.equal(z.applied,true);assert.equal(z.P.sp,2+expected);
 });
 for(const cfg of [{stats:{str:'ab',dex:3,vit:2}},{stats:{str:'Infinity',dex:3,vit:2}},{grit:'Infinity'},{stats:{str:1e20,dex:3,vit:2}},{grit:-100},{grit:.5}])test(file+' invalid SP preserves allocations and currency '+JSON.stringify(cfg),()=>{
  const c=setup(s,cfg),prior=state(c),r=direct(c);assert.deepEqual(r.P,prior.P);assert.deepEqual(r.stats,prior.stats);assert.deepEqual(r.passives,prior.passives);assert.equal(r.grit,prior.grit);assert.deepEqual(Array.from(r.calls,x=>x[0]),['notify']);
  const p=setup(s,cfg),init=state(p),z=planned(p);assert.equal(z.applied,false);assert.deepEqual(z.P,init.P);assert.deepEqual(z.stats,init.stats);assert.equal(z.grit,init.grit);assert.equal(z.calls.filter(x=>x[0]==='saveNow').length,0);
 });
 test(file+' cancel keeps malformed strings without refund or reset',()=>{
  const c=setup(s,{stats:{str:'5',dex:3,vit:2},grit:'10'});c.confirm=false;const prior=state(c),r=direct(c);
  assert.deepEqual(r.P,prior.P);assert.deepEqual(r.stats,prior.stats);assert.equal(r.grit,prior.grit);assert.deepEqual(Array.from(r.calls,x=>x[0]),['confirm']);
 });
 test(file+' confirmation live re-read uses latest numeric string and rejects unsafe SP',()=>{
  const c=setup(s);vm.runInContext('gameConfirm=async()=>{calls.push(["confirm"]);STATS.str="9";return true}',c);const r=direct(c);assert.equal(r.P.sp,26);assert.equal(r.grit,0);
  const bad=setup(s),prior=state(bad);vm.runInContext('gameConfirm=async()=>{calls.push(["confirm"]);STATS.str="Infinity";return true}',bad);const z=direct(bad);
  assert.deepEqual(z.P,prior.P);assert.equal(z.stats.str,'Infinity');assert.equal(z.grit,prior.grit);assert.deepEqual(Array.from(z.calls,x=>x[0]),['confirm','notify']);
 });
}
