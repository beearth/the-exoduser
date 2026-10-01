import fs from 'node:fs';import vm from 'node:vm';
const source=fs.readFileSync('tools/team-followup-20261001/QA/analyze-support-normal.mjs','utf8');
const code=source.slice(source.indexOf('function analyze(raw){'),source.indexOf('const result=analyze(raw);'));
const dir='outputs/team-review-20261001/draw-attribution/live-prewarm/';const raw=JSON.parse(fs.readFileSync(dir+'raw.json'));
const result=vm.runInNewContext(code+';analyze',{}) (raw);
result.limits=result.limits?.map(x=>x.replace('first observed batch contains two kills','batch size is recorded in firstObservedKill'));
result.physicalImpact=raw.physicalImpact;result.physicalGate=raw.physicalImpact.cacheReady&&raw.physicalImpact.calls>0&&raw.physicalImpact.tintCalls===0&&raw.physicalImpact.samePreparedSheet&&raw.physicalImpact.restored.sheet&&raw.physicalImpact.restored.tint;
fs.writeFileSync(dir+'analysis.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
