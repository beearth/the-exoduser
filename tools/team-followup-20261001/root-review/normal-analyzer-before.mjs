import fs from 'node:fs';
const dir=new URL('../../../outputs/team-review-20261001/support/normal-combat/',import.meta.url);
const raw=JSON.parse(fs.readFileSync(new URL('raw.json',dir),'utf8'));
const good=r=>r.on&&!r.paused&&r.hp>0&&!r.hidden&&r.focus;
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
  cleanup:raw.restored,limits:['GL/GPU cost unmeasured','observer overhead not independently measured','existing Chrome profile; cache state unknown','first-kill prehistory is only from first input; first observed batch contains two kills','post-run screenshot is later than measured endpoint; HUD regional counter differs from total G.kills','no comparison or PC329ms resolution claim']};
fs.writeFileSync(new URL('analysis.json',dir),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
