import fs from 'node:fs';
import readline from 'node:readline';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';
const arg=k=>process.argv.find(s=>s.startsWith(k+'='))?.slice(k.length+1);
const source=arg('--source-game'),casesPath=arg('--cases-file'),out=arg('--out-file');assert(source&&casesPath&&out);
const wanted=[];let n=0;
for await(const s of readline.createInterface({input:fs.createReadStream(source),crlfDelay:Infinity})){n++;if((n>=27690&&n<=27728)||(n>=51204&&n<=51277))wanted.push([n,s]);}
const lines=wanted.map(x=>x[1]);
function block(start,end){const i=lines.findIndex(s=>s.includes(start));assert(i>=0,start);const j=lines.findIndex((s,k)=>k>=i&&s===end);assert(j>=i,end);return lines.slice(i,j+1).join('\n');}
const defsText=block('const PASSIVE_DEF=[','];');
const queueText=lines.slice(lines.findIndex(s=>s.startsWith('function _passiveQueueItems()')),lines.findIndex(s=>s.startsWith('function renderStatPanel()'))).join('\n');
assert(queueText.includes('function _processPassiveQueue'));
const resetText=block("$('statResetBtn').onclick=async()=>{",'};');
function callback(name){const i=lines.findIndex(s=>s.trimStart().startsWith(name+':'));assert(i>=0,name);let j=i;for(;j<lines.length;j++){if(j>i&&['    },','    }'].includes(lines[j]))break;}return lines.slice(i,j+1).join('\n').trim().replace(new RegExp('^'+name+':'),'').replace(/,$/,'');}
const lib=fs.readFileSync(path.join(path.dirname(source),'stat-panel-ui.js'),'utf8');
const rows=[];let definitions;
for(const c of JSON.parse(fs.readFileSync(casesPath,'utf8'))){
 const before=structuredClone(c.before);let refresh=0;
 const button={};const ctx=vm.createContext({STATS:before.stats,PASSIVES:before.passives,_grit:before.grit,P:{sp:before.sp,ap:before.ap,...(before.queue_present?{_passiveQueue:before.raw_queue}:{})},applyStats(){refresh++},SFX:{pickup(){},levelup(){}},renderStatPanel(){},notify(){},dbSaveNow(){},gameConfirm:async()=>true,_L:x=>x,_T:x=>x,$:()=>button});
 vm.runInContext(lib+'\n'+defsText+'\n'+queueText+'\nconst STAT_MAX={str:500,dex:500,int:500,vit:500,lck:500};',ctx);
 definitions=vm.runInContext('PASSIVE_DEF.map(({key,max})=>({key,max}))',ctx);
 const command=c.command;
 if(command.action==='reset'){vm.runInContext(resetText,ctx);await button.onclick();}
 else if(command.action==='process_queue')vm.runInContext('_processPassiveQueue()',ctx);
 else{const names={stat:'changeStat',passive:'changePassive',queue_add:'queuePassive',queue_cancel:'cancelQueuedPassive',plan:'applyPlan'};vm.runInContext('_fn='+callback(names[command.action]),ctx);await ctx._fn(...(command.action==='plan'?[command.plan]:command.action==='queue_cancel'?[command.index]:[command.key,command.amount]));}
 const after=vm.runInContext('({stats:STATS,passives:PASSIVES,grit:_grit,sp:P.sp,ap:P.ap,queue:_passiveQueueItems(),queue_present:Object.hasOwn(P,"_passiveQueue"),raw_queue:Object.hasOwn(P,"_passiveQueue")?P._passiveQueue:null})',ctx);
 rows.push({name:c.name,after,refresh});
}
assert(definitions.length===26&&definitions.every(d=>d.max===10));
fs.writeFileSync(out,JSON.stringify({rows,definitions,source_anchors:[27697,27699,51205,51219,51222,51242,51262,51270]}));
