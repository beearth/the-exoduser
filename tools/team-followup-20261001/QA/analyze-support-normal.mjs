import fs from 'node:fs';
const dir=new URL('../../../outputs/team-review-20261001/support/normal-combat/',import.meta.url);
const raw=JSON.parse(fs.readFileSync(new URL('raw.json',dir),'utf8'));
function analyze(raw){
const good=r=>r?.on===true&&r.paused===false&&Number.isFinite(r.hp)&&r.hp>0&&r.hidden===false&&r.focus===true;
const errors=[];
const require=(condition,reason)=>{if(!condition)errors.push(reason);};
const arrays=['rows','draws','inputs','events','cleanupErrors'];
for(const key of arrays)require(Array.isArray(raw?.[key]),'missing array '+key);
if(errors.length)return {eligible:false,exclusions:errors};
require(raw.schema==='light-normal-v1','unsupported schema');
require(raw.restored?.draw===true&&raw.restored?.listeners===true,'cleanup incomplete');
require(raw.initialOptions&&raw.finalOptions&&['quality','resScale','ssaa','fpsCap','parts','diff','atmos','bloom','lighting','postfx','fog','grain'].every(k=>Object.hasOwn(raw.initialOptions,k)&&Object.hasOwn(raw.finalOptions,k)),'missing options evidence');
require(raw.environment?.profiler===false&&raw.environment?.gpuTiming===false&&Array.isArray(raw.environment?.viewport)&&raw.environment.viewport.length===2&&raw.environment.viewport.every(x=>Number.isFinite(x)&&x>0),'invalid light-observer environment');
require(raw.rows.length>=2&&raw.draws.length>=2&&raw.inputs.length>0,'insufficient samples');
require(raw.stopped===true&&raw.dropped===0,'capture not complete or missing loss count');
require(good(raw.initial)&&good(raw.end),'invalid endpoint state');
require(Number.isFinite(raw.start)&&Number.isFinite(raw.firstInput?.at)&&Number.isFinite(raw.end?.at)&&raw.start<=raw.firstInput.at&&raw.firstInput.at<raw.end.at,'invalid recording chronology');
require(raw.initial?.kills===0&&Number.isSafeInteger(raw.end?.kills)&&raw.end.kills>=0,'invalid kill baseline/end');
for(const [index,row] of raw.rows.entries()){
  require(row&&['at','timestamp','hp','kills','enemies'].every(k=>Number.isFinite(row[k]))&&Number.isSafeInteger(row.kills)&&row.kills>=0&&Number.isSafeInteger(row.enemies)&&row.enemies>=0,'invalid row '+index);
  if(index){const prev=raw.rows[index-1];require(row?.at>prev?.at&&row?.timestamp>prev?.timestamp&&row?.kills>=prev?.kills,'nonmonotonic row '+index);}
  require(row?.at>=raw.start&&row?.at<=raw.end?.at,'row outside recording '+index);
}
for(const [index,draw] of raw.draws.entries()){
  require(Number.isFinite(draw?.at)&&Number.isFinite(draw?.end)&&draw.end>=draw.at&&draw.at>=raw.start&&draw.end<=raw.end?.at,'invalid draw '+index);
  if(index)require(draw?.at>=raw.draws[index-1]?.end,'overlapping/reversed draw '+index);
}
const same=(a,b)=>a&&b&&JSON.stringify(a)===JSON.stringify(b);
require(raw.inputs.every(i=>i?.trusted===true&&Number.isFinite(i.at)&&i.at>=raw.start&&i.at<=raw.end?.at),'invalid input evidence');
const firstInput=raw.inputs.find(i=>good(i)&&((i.kind==='keydown'&&i.code==='KeyW')||(i.kind==='mousedown'&&i.target==='CANVAS')));
require(same(firstInput,raw.firstInput),'first input does not match evidence');
const firstKill=raw.rows.find(r=>r?.kills>raw.initial?.kills);
require(same(firstKill,raw.firstKill)&&firstKill?.at>=raw.firstInput?.at&&firstKill?.at<=raw.end?.at,'first kill does not match observed batch');
require(raw.end?.kills===raw.rows.at(-1)?.kills,'end kill count mismatch');
if(errors.length)return {eligible:false,exclusions:errors};
const start=raw.firstInput.at,end=raw.end.at;
const rows=raw.rows.filter(r=>r.at>=start&&r.at<=end);
const quantiles=values=>{
  const sorted=values.slice().sort((a,b)=>a-b);
  const q=p=>sorted.length?sorted[Math.ceil(sorted.length*p)-1]:null;
  return {n:sorted.length,p50:q(.5),p95:q(.95),p99:q(.99),max:q(1),over50:sorted.filter(x=>x>50).length,over100:sorted.filter(x=>x>100).length};
};
function metrics(a,b,predicate=good){
  const raf=[],snapshots=[],drawGaps=[];
  for(let i=1;i<rows.length;i++){
    const prev=rows[i-1],cur=rows[i];
    if(prev.at>=a&&cur.at<=b&&predicate(prev)&&predicate(cur)){
      raf.push(cur.timestamp-prev.timestamp);snapshots.push(cur.at-prev.at);
    }
  }
  const draws=raw.draws.filter(d=>d.at>=a&&d.end<=b);
  for(let i=1;i<draws.length;i++)drawGaps.push(draws[i].at-draws[i-1].at);
  return {start:a,end:b,durationMs:b-a,rafTimestampIntervals:quantiles(raf),snapshotWallIntervals:quantiles(snapshots),drawStartIntervals:quantiles(drawGaps),synchronousDrawCPU:quantiles(draws.map(d=>d.end-d.at))};
}
const dense=r=>good(r)&&r.enemies>=30;
const segments=[];let segment=null;
for(const row of rows){
  if(dense(row)){if(!segment)segment={start:row.at,end:row.at,rows:0};segment.end=row.at;segment.rows++;}
  else if(segment){segments.push(segment);segment=null;}
}
if(segment)segments.push(segment);
segments.sort((a,b)=>(b.end-b.start)-(a.end-a.start));
const longest=segments[0];
const exclusions=[];
if(!raw.firstKill||raw.initial.kills!==0)exclusions.push('first kill missing or baseline nonzero');
if(raw.events.length)exclusions.push('lifecycle/options/error event');
if(!rows.every(good))exclusions.push('invalid play state');
if(raw.dropped||raw.cleanupErrors.length||!raw.restored.draw||!raw.restored.listeners)exclusions.push('capture/cleanup failure');
if(JSON.stringify(raw.initialOptions)!==JSON.stringify(raw.finalOptions))exclusions.push('options changed');
const result={kind:'single normal-play observation, not A/B improvement',eligible:exclusions.length===0,exclusions,
  at:raw.at,environment:raw.environment,options:raw.initialOptions,kills:raw.end.kills-raw.initial.kills,
  initialHP:raw.initial.hp,endHP:raw.end.hp,maxEnemies:Math.max(...rows.map(r=>r.enemies)),
  firstObservedKill:{delayAfterFirstInputMs:raw.firstKill.at-start,killsInFirstObservedBatch:raw.firstKill.kills,precision:'rAF observation, not exact death-event timestamp'},
  full:metrics(start,end),firstKillWindow:metrics(start,Math.min(end,raw.firstKill.at+2000)),
  denseSegments:segments,denseLongest:longest?metrics(longest.start,longest.end,dense):null,
  inputs:{count:raw.inputs.length,trusted:raw.inputs.every(i=>i.trusted),mechanism:'normal CUA key/click events; no held-key timing guarantee'},
  cleanup:raw.restored,limits:['synchronousDrawCPU is a historical field name for synchronous elapsed wall time, not CPU-only work','GL/GPU cost unmeasured','observer overhead not independently measured','existing Chrome profile; cache state unknown','first-kill prehistory is only from first input; first observed batch contains two kills','post-run screenshot is later than measured endpoint; HUD regional counter differs from total G.kills','no comparison or PC329ms resolution claim']};
return result;
}
const result=analyze(raw);
fs.writeFileSync(new URL('analysis.json',dir),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
