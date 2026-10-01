import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';

const originalPath=new URL('../ENEMY/et3-probe.fixed.js',import.meta.url);
const candidatePath=new URL('./enemy-support-probe.js',import.meta.url);
const original=fs.readFileSync(originalPath,'utf8'),candidate=fs.readFileSync(candidatePath,'utf8');
const digest=source=>crypto.createHash('sha256').update(source).digest('hex');
const rows=[];
function setup(source,initialTick=0){
  const sandbox={};vm.runInNewContext(source,sandbox);
  let currentTick=initialTick,nextSample=null,callbacks=0;
  const target={etype:3,alive:true,s:'idle',x:150,y:0,projCd:9999,projT:9999,_projChargeT:0},projectiles=[];
  const registry={_fireChargedProj:()=>projectiles.push({committed:true}),_spawnBossProjectile:()=>{}};
  const originals={...registry};
  const host={getTick:()=>currentTick,getG:()=>({on:true}),getP:()=>({x:0,y:0}),getEns:()=>[target],getRange:()=>({3:200}),getProjs:()=>projectiles,
    getFn:name=>registry[name],setFn:(name,fn)=>{registry[name]=fn;},raf:callback=>{nextSample=callback;return ++callbacks;},caf:()=>{nextSample=null;}};
  const probe=sandbox.__createET3Probe(host);probe.install();
  return {probe,host,target,registry,originals,
    sample(value=currentTick){currentTick=value;const callback=nextSample;nextSample=null;callback();},
    stop(){const result=probe.stop();assert.equal(registry._fireChargedProj,originals._fireChargedProj);return result;}};
}
test('root null tick/rAF451 original FAIL_NO_FIRE is reproduced; candidate INCONCLUSIVE and zero physics count',()=>{
  const before=setup(original,null),after=setup(candidate,null);
  for(let frame=0;frame<451;frame++){before.sample(null);after.sample(null);}
  const failed=before.stop(),fixed=after.stop();
  assert.equal(failed.verdict,'FAIL_NO_FIRE');assert.equal(failed.elapsedTicks,null);assert.equal(failed.residency.inRangeTicks,451);
  assert.equal(fixed.verdict,'INCONCLUSIVE');assert.equal(fixed.residency.inRangeTicks,0);assert.equal(fixed.tickHealth.rafSamples,451);assert.equal(fixed.elapsedTicks,null);
  rows.push({case:'root-null-451',original:failed,candidate:fixed});
});
for(const [name,value] of [['missing',undefined],['NaN',NaN],['positive-infinity',Infinity],['negative-infinity',-Infinity],['string','100'],['negative',-1],['fractional',.5],['constant',10]])test(`${name} tick cannot classify no fire`,()=>{
  const fixture=setup(candidate,value);
  for(let frame=0;frame<451;frame++)fixture.sample(value);
  const result=fixture.stop();assert.equal(result.verdict,'INCONCLUSIVE');assert.equal(result.residency.aliveTicks,0);assert.equal(result.tickHealth.physicalAdvances,0);
  rows.push({case:name,result});
});
test('normal finite monotonic physics keeps FAIL_NO_FIRE and exact counts with high RAF duplicates',()=>{
  const fixture=setup(candidate);
  for(let physics=1;physics<=470;physics++)for(let redraw=0;redraw<3;redraw++)fixture.sample(physics);
  const result=fixture.stop();assert.equal(result.verdict,'FAIL_NO_FIRE');assert.equal(result.residency.inRangeTicks,470);
  assert.equal(result.tickHealth.rafSamples,1410);assert.equal(result.tickHealth.physicalAdvances,470);assert.equal(result.elapsedTicks,470);
  rows.push({case:'470-physics-1410-raf',result});
});
test('backward/reset or missing/NaN after valid progress permanently invalidate this observation',()=>{
  for(const change of [0,null,NaN]){
    const fixture=setup(candidate);for(let physics=1;physics<=470;physics++)fixture.sample(physics);
    fixture.sample(change);for(let physics=471;physics<=480;physics++)fixture.sample(physics);
    const result=fixture.stop();assert.equal(result.verdict,'INCONCLUSIVE');assert.equal(result.elapsedTicks,null);
    rows.push({case:'after-valid-'+String(change),result});
  }
});
test('stall after sufficient physics invalidates report, never counts stalled RAF as additional physics',()=>{
  const fixture=setup(candidate);for(let physics=1;physics<=470;physics++)fixture.sample(physics);
  for(let redraw=0;redraw<120;redraw++)fixture.sample(470);
  const result=fixture.stop();assert.equal(result.verdict,'INCONCLUSIVE');assert.equal(result.residency.aliveTicks,470);
  assert.equal(result.tickHealth.stagnantRafSamples,120);rows.push({case:'stalled-after-valid',result});
});
test('a diagnosed stall cannot recover a conclusive verdict within the same probe',()=>{
  const fixture=setup(candidate);fixture.sample(1);
  for(let redraw=0;redraw<120;redraw++)fixture.sample(1);
  for(let physics=2;physics<=500;physics++)fixture.sample(physics);
  const result=fixture.stop();assert.equal(result.verdict,'INCONCLUSIVE');assert.ok(result.tickHealth.issues.includes('stalled_tick'));
});
test('physics gaps never extrapolate missing residency and report without advancement is inconclusive',()=>{
  const fixture=setup(candidate);fixture.sample(1);fixture.sample(500);
  const result=fixture.stop();assert.equal(result.verdict,'INCONCLUSIVE');assert.equal(result.residency.aliveTicks,2);
  assert.equal(setup(candidate).stop().verdict,'INCONCLUSIVE');
});
test('committed fire is retained as evidence but missing tick never produces timing PASS',()=>{
  const fixture=setup(candidate,null);fixture.sample(null);fixture.registry._fireChargedProj(fixture.target);
  const result=fixture.stop();assert.ok(result.firstFire.committed);assert.equal(result.verdict,'INCONCLUSIVE');
});
test('tick getter exception is a health issue instead of report crash',()=>{
  const fixture=setup(candidate);fixture.host.getTick=()=>{throw Error('getter unavailable');};fixture.sample(1);
  const result=fixture.stop();assert.equal(result.verdict,'INCONCLUSIVE');assert.ok(result.tickHealth.issues.includes('tick_read_error'));
});
test('preserve original source hashes and output evidence without production writes',()=>{
  fs.writeFileSync(new URL('./enemy-support-evidence.json',import.meta.url),JSON.stringify({taskId:'ENEMY-TICK-UNKNOWN-FIX',originalSourceSha256:digest(original),candidateSourceSha256:digest(candidate),rows,scope:'mock observation only, no actual game/AI test'},null,2)+'\n');
});
