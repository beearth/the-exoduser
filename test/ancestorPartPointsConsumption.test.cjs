// Reuses the existing full save/equip/ancestor-consumer fixture without running its tests.
// Synthetic stat leaves, spatial query, network, UI/audio and random sources remain doubles.
// No user saves, full game loop, map/camera QA, native pixels or listening are performed.
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),dir=process.env.EXODUSER_TEST_SOURCE_DIR||root;
const baseline=process.env.EXODUSER_TEST_BASELINE_DIR||dir;
const helperFile=path.join(__dirname,'ancestorPowerConsumption.test.cjs');
const helper=fs.readFileSync(helperFile,'utf8'),marker="for(const file of ['game.html'";
assert.equal(helper.split(marker).length,2);
const ctx={require,process,__dirname,console};
vm.runInNewContext(helper.slice(0,helper.indexOf(marker))+'\nthis.h={extract,ancestorFixture,swordHit,detonate,plain};',ctx);
const equal=(a,b)=>assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)));
const h=ctx.h,parts=['skull','torso','arms','legs'];
function records(value={r:2,t:1}){return Object.fromEntries(parts.map(p=>['iron_warlord_'+p,{...value}]))}
function restored(src,collection,{bag=false,level=1,crit=false}={}){
 const c=h.ancestorFixture(src,.25,{level,crit}),gear=h.plain(c.INV.equipped.ossuary);
 const data=h.plain({player:{lv:1,exp:0,maxExp:100000,sp:0,ap:0,hp:200,mp:60,st:60,shield:10},
  skills:{ancestorSummon:level},inv:{bag:bag?[gear]:[],equipped:bag?{}:{ossuary:gear},ossCollect:collection}});
 assert.equal(c.dbRestore(data),true);if(bag)c.equipItem(c.INV.bag[0]);return c;
}
function result(c){const s=c._calcAncestorStats(0);assert(s,'complete valid records yield stats');
 for(const k of ['dmg','crit','hp','bigSz','spd','partPts'])assert(Number.isFinite(s[k]),k+' is finite');
 assert(s.hp>0,'restored summon HP is positive');const r=h.swordHit(c);return {stats:s,attack:r}}
for(const file of ['game.html','game-easy-test.html']){
 const src=h.extract(file,dir),old=h.extract(file,baseline);
 for(const value of [{r:3,t:2},{r:0,t:0},{r:5,t:4},{r:.5,t:.25},{r:null,t:0},{t:0},{r:-1,t:2}]){
  test(file+' numeric/absent part terms retain entire attack state '+JSON.stringify(value),()=>{
   equal(result(restored(src,records(value))),result(restored(old,records(value))));
  });
 }
 for(const part of parts)for(const [value,numeric]of [
  [{r:'3',t:'2'},{r:3,t:2}],[{r:'3',t:2},{r:3,t:2}],[{r:3,t:'2'},{r:3,t:2}],
  [{r:'ab',t:2},{r:0,t:2}],[{r:3,t:'cd'},{r:3,t:0}],
  [{r:' ',t:0},{r:0,t:0}],[{r:'3',t:'-2'},{r:3,t:-2}]
 ])for(const bag of [false,true]){
  test(file+' '+part+' restored '+JSON.stringify(value)+' bag='+bag+' preserves numeric stats and damage',()=>{
   const a=records(),b=records();a['iron_warlord_'+part]=value;b['iron_warlord_'+part]=numeric;
   const c=restored(src,a,{bag}),n=restored(src,b,{bag}),r=result(c),nr=result(n);
   equal(r.stats,nr.stats);equal(r.attack.G,nr.attack.G);
   equal(r.attack.enemy,nr.attack.enemy);assert.equal(r.attack.damage,nr.attack.damage);
   assert.equal(c.INV.ossCollect['iron_warlord_'+part].r,value.r);
   assert.equal(c.INV.ossCollect['iron_warlord_'+part].t,value.t);
  });
 }
 for(const level of [1,6,20])for(const crit of [false,true])test(file+' all four string parts level='+level+' crit='+crit+' reach summon and enemy HP',()=>{
  const c=restored(src,records({r:'3',t:'2'}),{level,crit}),n=restored(src,records({r:3,t:2}),{level,crit});
  const r=result(c),nr=result(n);equal(r.stats,nr.stats);assert.equal(r.stats.partPts,20);
  assert.equal(r.attack.damage,nr.attack.damage);assert.equal(r.attack.G._ancestors[0].crit,.2);
 });
 test(file+' all invalid part terms produce finite summon and avoid immediate recall',()=>{
  const c=restored(src,records({r:'ab',t:'cd'})),n=restored(src,records({r:0,t:0}));
  const s=c._calcAncestorStats(0);equal(s,n._calcAncestorStats(0));
  for(const k of ['dmg','crit','hp','bigSz','spd','partPts'])assert(Number.isFinite(s[k]),k);
  c.activateAncestorSummon();const a=c.G._ancestors[0];assert(a.hp>0);
  c._updateAncestors(1);assert.equal(a._recalling,undefined);
  c._updateAncestors(132);assert.equal(c.G._ancestors.length,1);assert(a.hp>0);
 });
 test(file+' invalid record summon remains present after the old 132f recall removal path',()=>{
  const c=restored(src,records({r:'ab',t:'cd'}));c.activateAncestorSummon();assert.equal(c.G._ancestors.length,1);
  c._updateAncestors(1);c._updateAncestors(132);assert.equal(c.G._ancestors.length,1);
  assert.equal(c.G._ancestors[0]._recalling,undefined);assert(c.G._ancestors[0].hp>0);
 });
 for(const value of [{r:-5,t:-3},{r:'-5',t:'-3'},null])test(file+' missing/negative part still blocks summon '+JSON.stringify(value),()=>{
  const a=records();a.iron_warlord_arms=value;const c=restored(src,a),b=restored(old,a);
  assert.equal(c._calcAncestorStats(0),null);c.activateAncestorSummon();assert.equal(c.G._ancestors,undefined);
  if(!value||typeof value.r==='number'){assert.equal(b._calcAncestorStats(0),null);b.activateAncestorSummon();assert.equal(b.G._ancestors,undefined);}
 });
 for(const value of [{r:'3',t:'2'},{r:'ab',t:'cd'}])test(file+' whole save/restore preserves raw records and recomputes numbers '+JSON.stringify(value),async()=>{
  const c=restored(src,records(value),{bag:true});const initial=c._calcAncestorStats(0);assert(Number.isFinite(initial.bigSz));assert(initial.hp>0);await c.dbSave();assert(c.saved);
  assert.equal(c.saved.inv.ossCollect.iron_warlord_skull.r,value.r);assert.equal(c.saved.inv.ossCollect.iron_warlord_skull.t,value.t);
  const n=restored(src,records());assert.equal(n.dbRestore(h.plain(c.saved)),true);
  equal(n._calcAncestorStats(0),initial);assert.equal(n.INV.ossCollect.iron_warlord_skull.r,value.r);
  assert.equal(h.swordHit(n).damage,h.swordHit(c).damage);
 });
}
