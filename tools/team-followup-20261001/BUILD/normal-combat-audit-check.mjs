import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const root=new URL('../../../',import.meta.url),base='outputs/team-review-20261001/support/normal-combat/';
const files=[base+'raw.json',base+'analysis.json',base+'preflight.json','tools/team-followup-20261001/QA/analyze-support-normal.mjs','docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/SUPPORT-normal-combat.md'];
const text=file=>fs.readFileSync(new URL(file,root),'utf8'),hash=value=>crypto.createHash('sha256').update(value).digest('hex');
const sources=files.map(file=>({file,sha256:hash(text(file))})),startedAt=new Date().toISOString();
const raw=JSON.parse(text(files[0])),analysis=JSON.parse(text(files[1])),preflight=JSON.parse(text(files[2])),rows=[],counterexamples=[];
const copy=value=>JSON.parse(JSON.stringify(value));
function check(name,action){try{action();rows.push({name,status:'PASS'});}catch(error){rows.push({name,status:'FAIL',error:error.stack});}}
function quantiles(values){
  const sorted=values.toSorted((left,right)=>left-right);
  const at=percent=>sorted.length?sorted[Math.ceil(percent*sorted.length)-1]:null;
  return {n:sorted.length,p50:at(.5),p95:at(.95),p99:at(.99),max:at(1),over50:values.filter(value=>value>50).length,over100:values.filter(value=>value>100).length};
}
const good=row=>row.on===true&&row.paused===false&&row.hp>0&&row.hidden===false&&row.focus===true;
const start=raw.firstInput.at,end=raw.end.at;
const selected=raw.rows.filter(row=>row.at>=start&&row.at<=end);
function calculate(begin,finish,dense=false){
  const intervals=[],wall=[];
  selected.slice(1).forEach((current,index)=>{const previous=selected[index];if(previous.at>=begin&&current.at<=finish&&good(previous)&&good(current)&&(!dense||(previous.enemies>=30&&current.enemies>=30))){intervals.push(current.timestamp-previous.timestamp);wall.push(current.at-previous.at);}});
  const draws=raw.draws.filter(draw=>draw.at>=begin&&draw.end<=finish);
  return {start:begin,end:finish,durationMs:finish-begin,rafTimestampIntervals:quantiles(intervals),snapshotWallIntervals:quantiles(wall),drawStartIntervals:quantiles(draws.slice(1).map((draw,index)=>draw.at-draws[index].at)),synchronousDrawCPU:quantiles(draws.map(draw=>draw.end-draw.at))};
}
const segments=[];let current=[];
for(const row of selected){if(good(row)&&row.enemies>=30)current.push(row);else if(current.length){segments.push(current);current=[];}}
if(current.length)segments.push(current);
segments.sort((left,right)=>(right.at(-1).at-right[0].at)-(left.at(-1).at-left[0].at));
const dense=segments[0];
const independent={rawCounts:{rows:raw.rows.length,draws:raw.draws.length,inputs:raw.inputs.length,selectedRows:selected.length},full:calculate(start,end),firstKillWindow:calculate(start,Math.min(end,raw.firstKill.at+2000)),denseLongest:calculate(dense[0].at,dense.at(-1).at,true),firstObservedKill:{delay:raw.firstKill.at-start,kills:raw.firstKill.kills,timestamp:raw.firstKill.timestamp,previousRow:selected[selected.findIndex(row=>row.at===raw.firstKill.at)-1]},denseRows:dense.length};
for(const key of ['full','firstKillWindow','denseLongest'])check('independent nearest-rank '+key,()=>assert.deepEqual(independent[key],analysis[key]));
check('first input/kill batch cross reference raw rows',()=>{
  assert.equal(raw.firstInput.at,raw.inputs[0].at);assert.equal(raw.firstInput.kills,0);assert.equal(raw.firstKill.kills,2);assert.deepEqual(raw.rows.find(row=>row.at===raw.firstKill.at),raw.firstKill);
  assert.equal(independent.firstObservedKill.previousRow.kills,0);assert.equal(independent.firstObservedKill.delay,analysis.firstObservedKill.delayAfterFirstInputMs);assert.equal(raw.end.kills-raw.initial.kills,analysis.kills);
});
check('actual preflight/environment/options and cleanup consistent',()=>{
  assert.equal(preflight.url,raw.environment.url);assert.equal(preflight.cache,'UNKNOWN');assert.equal(preflight.gameInstances,1);assert.equal(raw.environment.profiler,false);assert.equal(raw.environment.gpuTiming,false);
  assert.equal(raw.stopped,true);assert.equal(raw.dropped,0);assert.deepEqual(raw.cleanupErrors,[]);assert.deepEqual(raw.events,[]);assert.deepEqual(raw.initialOptions,raw.finalOptions);
  assert.ok(raw.inputs.every(input=>input.trusted===true&&good(input)));assert.ok(selected.every(good));assert.ok(good(raw.initial)&&good(raw.end));assert.deepEqual(raw.restored,{draw:true,listeners:true});
});
check('actual numeric records finite ordered consistent',()=>{
  for(const [index,row] of raw.rows.entries()){assert.ok([row.at,row.timestamp,row.hp,row.kills,row.enemies].every(Number.isFinite));if(index){assert.ok(row.at>raw.rows[index-1].at);assert.ok(row.timestamp>raw.rows[index-1].timestamp);assert.ok(row.kills>=raw.rows[index-1].kills);}}
  for(const draw of raw.draws){assert.ok(Number.isFinite(draw.at)&&Number.isFinite(draw.end)&&draw.end>=draw.at);}
  assert.equal(raw.rows.length,raw.draws.length);assert.equal(raw.end.kills,raw.rows.at(-1).kills);assert.equal(raw.end.hp,raw.rows.at(-1).hp);
});
let script=text(files[3]).replace("import fs from 'node:fs';",'').replace("new URL('../../../outputs/team-review-20261001/support/normal-combat/',import.meta.url)","new URL('file:///fixture/')");
function analyze(value){
  let output;
  vm.runInNewContext(script,{URL,fs:{readFileSync(){return JSON.stringify(value);},writeFileSync(file,body){output=JSON.parse(body);}},console:{log(){}}},{timeout:1000});return output;
}
check('sandboxed actual analyzer exactly matches archived analysis',()=>assert.deepEqual(analyze(raw),analysis));
const mutations=[
  ['empty rows',value=>{value.rows=[];}],
  ['empty draws',value=>{value.draws=[];}],
  ['empty inputs',value=>{value.inputs=[];}],
  ['not stopped',value=>{value.stopped=false;}],
  ['firstKill before input',value=>{value.firstKill.at=value.firstInput.at-1;}],
  ['firstKill inconsistent batch',value=>{value.firstKill.kills=999;}],
  ['nonfinite timestamp JSON null',value=>{value.rows[5].timestamp=null;}],
  ['backward timestamp',value=>{value.rows[5].timestamp=value.rows[4].timestamp-10;}],
  ['negative draw duration',value=>{value.draws[5].end=value.draws[5].at-1;}],
  ['untrusted input',value=>{value.inputs[0].trusted=false;}],
  ['end unfocused',value=>{value.end.focus=false;}],
  ['dropped field missing',value=>{delete value.dropped;}]
];
for(const [name,mutate] of mutations)check('analyzer eligibility counterexample '+name,()=>{
  const value=copy(raw);mutate(value);const output=analyze(value);
  counterexamples.push({input:name,expected:'exclude or explicit UNKNOWN for capture consistency',actual:{eligible:output.eligible,exclusions:output.exclusions,firstObservedKill:output.firstObservedKill,raf:output.full.rafTimestampIntervals,draw:output.full.synchronousDrawCPU,inputs:output.inputs},classification:'mutated isolated JSON only; actual capture does not contain this anomaly'});
  assert.equal(output.eligible,true,'expected current permissive boundary reproduction');
});
check('valid exclusion controls for focus/options/cleanup',()=>{
  for(const mutation of [value=>{value.rows[5].focus=false;},value=>{value.finalOptions.diff=99;},value=>{value.restored.draw=false;},value=>{value.dropped=1;}]){const value=copy(raw);mutation(value);assert.equal(analyze(value).eligible,false);}
});
check('all source input hashes unchanged',()=>{for(const source of sources)assert.equal(hash(text(source.file)),source.sha256);});
const result={startedAt,completedAt:new Date().toISOString(),sources,kind:'small-readonly-JSON-audit-and-in-memory-analyzer',independent,rows,counterexamples,pass:rows.filter(row=>row.status==='PASS').length,fail:rows.filter(row=>row.status==='FAIL').length,interpretation:'counterexample PASS confirms analyzer validation gap, not eligibility approval',limits:['No CPU/GPU cause attribution','synchronousDrawCPU is elapsed wrapper wall time, not CPU-only work or GPU completion','alive>=30 is not onscreen enemy count','existing Chrome/cache UNKNOWN/observer overhead unmeasured/no A-B or improvement conclusion']};
fs.writeFileSync(new URL('./normal-combat-audit-evidence.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({pass:result.pass,fail:result.fail,eligibilityGaps:counterexamples.length}));process.exitCode=result.fail?1:0;
