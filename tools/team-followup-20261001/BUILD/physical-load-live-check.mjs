import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const startedAt=new Date().toISOString();
const base='outputs/team-review-20261001/draw-attribution/';
const files=['game.html','test/physicalImpactPrewarm.test.mjs','tools/team-followup-20261001/BALANCE/physical-prewarm-candidate.js',base+'physical-fixture-final.json',...['preflight','raw','analysis'].map(name=>base+'live-prewarm/'+name+'.json')];
const hash=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const sources=files.map(file=>({file,sha256:hash(file)}));
const game=fs.readFileSync(files[0],'utf8'),testSource=fs.readFileSync(files[1],'utf8');
const harnessSource=testSource.slice(testSource.indexOf('const candidateStart='),testSource.indexOf("test('실제원helper"));
const {harness,candidate}=new Function('game','vm','assert',harnessSource+';return {harness,candidate};')(game,vm,assert);
const checks=[];
async function check(name,run){try{checks.push({name,pass:true,actual:await run()});}catch(error){checks.push({name,pass:false,error:String(error.stack)});}}
const raw=JSON.parse(fs.readFileSync(files[5])),analysis=JSON.parse(fs.readFileSync(files[6])),preflight=JSON.parse(fs.readFileSync(files[4])),fixture=JSON.parse(fs.readFileSync(files[3]));
await check('생산SHA/preflight·후보/fixture함수 동일',()=>{assert.equal(sources[0].sha256,preflight.gameSha);assert.equal(candidate.trim(),fs.readFileSync(files[2],'utf8').trim());assert.equal(candidate.trim(),fixture.pixel.source.trim());return preflight.checkpoint;});
for(const variant of ['normal','relative','missing-srcset','initial-srcset','initial-sizes','changed-srcset','changed-sizes','other','changed-src','identity','incomplete','wrong-size','epoch','on','killed','inactive','timeout'])await check('최초확정 '+variant,async()=>{
  const state=harness({complete:false});state.image.src='https://fixture.invalid/sheet.png';state.image.currentSrc='';state.image.srcset='';state.image.sizes='';
  if(variant==='relative')state.image.src='sheet.png';
  if(variant==='missing-srcset')delete state.image.srcset;
  if(variant==='initial-srcset')state.image.srcset='other.png 2x';
  if(variant==='initial-sizes')state.image.sizes='100vw';
  const initial={src:state.image.src,currentSrc:state.image.currentSrc,srcset:state.image.srcset,sizes:state.image.sizes};
  const pending=state.run();await state.flush();
  if(variant==='timeout')await state.advance(250);
  state.image.currentSrc=state.image.src;state.image.complete=variant!=='incomplete';state.image.naturalWidth=variant==='wrong-size'?256:512;state.image.naturalHeight=512;
  if(variant==='changed-srcset')state.image.srcset='other.png 2x';
  if(variant==='changed-sizes')state.image.sizes='100vw';
  if(variant==='other')state.image.currentSrc+='?other=1';
  if(variant==='changed-src')state.image.src='https://fixture.invalid/new.png';
  if(variant==='identity')state.context._tvfx2Imgs['Fire_ImpactFire_Sheet.png']={...state.image};
  if(variant==='epoch')state.context._bootLoadEpoch++;
  if(variant==='on')state.context.G.on=true;
  if(variant==='killed')state.context._bootLoadKilled=true;
  if(variant==='inactive')state.context._bootLoadActive=false;
  state.image.emit('load');const stats=await pending;
  const expected=variant==='normal'?'prepared':variant==='wrong-size'?'load-failed':variant==='timeout'?'timeout':['epoch','on','killed','inactive'].includes(variant)?'cancelled':'stale';
  assert.equal(stats.status,expected);assert.equal(state.reads(),variant==='normal'?1:0);assert.equal(state.listeners.size,0);assert.equal(state.timers.size,0);
  if(variant==='normal'){const sheet=state.context._physicalImpactSheet(state.image);assert.equal((await state.run()).status,'reused');assert.equal(state.context._physicalImpactSheet(state.image),sheet);assert.equal(state.reads(),1);}
  return {initial,expected,stats};
});
function distribution(values){const sorted=values.slice().sort((first,second)=>first-second);return {n:sorted.length,p50:sorted[Math.ceil(sorted.length*.5)-1]??null,p95:sorted[Math.ceil(sorted.length*.95)-1]??null,p99:sorted[Math.ceil(sorted.length*.99)-1]??null,max:sorted.at(-1)??null,over50:sorted.filter(value=>value>50).length,over100:sorted.filter(value=>value>100).length};}
await check('live시간/처치·분포 독립 재산출',()=>{
  const rows=raw.rows.filter(row=>row.at>=raw.firstInput.at&&row.at<=raw.end.at);
  const draws=raw.draws.filter(draw=>draw.at>=raw.firstInput.at&&draw.end<=raw.end.at);
  const differences=(list,key)=>list.slice(1).map((entry,index)=>entry[key]-list[index][key]);
  const metrics={rafTimestampIntervals:distribution(differences(rows,'timestamp')),snapshotWallIntervals:distribution(differences(rows,'at')),drawStartIntervals:distribution(differences(draws,'at')),synchronousDrawCPU:distribution(draws.map(draw=>draw.end-draw.at))};
  for(const [name,value] of Object.entries(metrics))assert.deepEqual(value,analysis.full[name]);
  assert.equal(raw.end.at-raw.firstInput.at,25007);assert.equal(raw.end.kills-raw.initial.kills,19);assert.equal(metrics.synchronousDrawCPU.max,156.5);
  return {durationMs:raw.end.at-raw.firstInput.at,kills:19,rows:rows.length,draws:draws.length,metrics};
});
await check('live부트/캐시55회/tint0 증거대조',()=>{
  const physical=raw.physicalImpact;assert.deepEqual(physical,analysis.physicalImpact);
  assert.equal(physical.bootStats.status,'prepared');assert.equal(physical.bootStats.totalMs,3.899999976158142);assert.equal(physical.bootStats.syncMs,3.799999952316284);
  assert.equal(physical.calls,55);assert.equal(physical.tintCalls,0);assert.equal(physical.samePreparedSheet,true);assert.equal(physical.cacheReady,true);assert.deepEqual(physical.cacheSize,[512,512]);assert.deepEqual(physical.restored,{sheet:true,tint:true});
  assert(physical.firstCall.at>=raw.firstInput.at&&physical.firstCall.at<=raw.end.at);assert.equal(physical.firstCall.src,physical.image.src);assert.equal(physical.image.src,physical.image.currentSrc);
  return {physical,limits:'raw의누적카운터·동일객체판정기록;55개호출별trace는없어각호출재구성불가'};
});
await check('전경/옵션/누락/정리·첫처치관측',()=>{
  assert(raw.rows.every(row=>row.on&&!row.paused&&row.hp>0&&!row.hidden&&row.focus));assert.equal(raw.stopped,true);assert.equal(raw.dropped,0);assert.deepEqual(raw.events,[]);assert.deepEqual(raw.cleanupErrors,[]);assert.deepEqual(raw.restored,{draw:true,listeners:true});assert.deepEqual(raw.initialOptions,raw.finalOptions);assert(raw.inputs.every(input=>input.trusted));
  assert(raw.rows.some(row=>row.at===raw.firstKill.at&&row.kills===2));assert.equal(raw.firstKill.at-raw.firstInput.at,analysis.firstObservedKill.delayAfterFirstInputMs);
  return {delayMs:raw.firstKill.at-raw.firstInput.at,firstBatch:2,options:raw.initialOptions};
});
await check('최종브라우저fixture 저장픽셀증거',()=>{const pixel=fixture.pixel.result;assert.equal(pixel.bytes,1048576);assert.equal(pixel.different,0);assert.equal(pixel.originalHash,pixel.candidateHash);assert.equal(pixel.sameIdentity,true);assert.equal(pixel.again.status,'reused');return {pixel,delayed:fixture.delayed,limits:'저장증거대조;신규브라우저실행0'};});
await check('입력SHA검사중불변',()=>{assert.deepEqual(files.map(file=>({file,sha256:hash(file)})),sources);return true;});
const evidence={startedAt,completedAt:new Date().toISOString(),sources,checks,pass:checks.filter(entry=>entry.pass).length,fail:checks.filter(entry=>!entry.pass).length,limits:['actual source extraction; reused synthetic Canvas/fake-clock harness with independent inputs','remote SHA is preflight assertion, no Git verification','single observation; cache UNKNOWN; overhead unmeasured; no FPS improvement or CPU/GPU attribution']};
fs.writeFileSync('tools/team-followup-20261001/BUILD/physical-load-live-evidence.json',JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify({pass:evidence.pass,fail:evidence.fail,startedAt,evidenceCompletedAt:evidence.completedAt,sources}));if(evidence.fail)process.exitCode=1;
