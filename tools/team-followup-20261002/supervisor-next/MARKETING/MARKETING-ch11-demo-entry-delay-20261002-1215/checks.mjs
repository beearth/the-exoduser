import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';import vm from 'node:vm';import assert from 'node:assert/strict';
const src=readFileSync('index.html','utf8'),sha=s=>createHash('sha256').update(s).digest('hex');
function extract(name){const start=src.indexOf('function '+name+'('),end=src.indexOf('\n}',start)+2;assert(start>=0&&end>start);const body=src.slice(start,end);new vm.Script(body);return {body,line:src.slice(0,start).split('\n').length,sha256:sha(body)};}
const gate=extract('showCharGate'),login=extract('_goLogin');
const candidate=gate.body.replace("function showCharGate(charId,storySeen=false){","function showCharGate(charId,storySeen=false){\n  const request=_characterLoadSeq;").replace("setTimeout(()=>{window.location.href=","setTimeout(()=>{if(request!==_characterLoadSeq)return;window.location.href=");assert.notEqual(candidate,gate.body);
function run(body,{cancel=false,activate=true,story=false,replacement=false}={}){
 const timers=[],calls=[],nodes={};for(const id of ['cinScene','mainWrap','lobby','loginSection','googleBtn','offlineBtn','demoEnterBtn'])nodes[id]={style:{},classList:{add:()=>{},toggle:()=>{}}};
 const s={window:{location:{href:'/?lobby=1&demo=1'}},_characterLoadSeq:9,_testMode:true,_LOBBY_BUILD:'demo',_selectedSlot:'warrior',_selectedSlotName:'warrior',_cinDone:false,_emberIv:0,
 Image:class{},_TL:x=>x,showLoading:x=>calls.push(['loading',x]),hideLoading:()=>calls.push(['hideLoading']),setStatus:(...x)=>calls.push(['status',...x]),_demoActivateSlot:x=>{calls.push(['activate',x]);return activate;},
 setTimeout:(fn,ms)=>timers.push({fn,ms}),clearInterval:()=>{},$:id=>nodes[id]||null,document:{querySelector:()=>null},_stopHover:()=>{},_updateCharDisplay:()=>calls.push(['clearSelection']),stopWorldIntro:()=>{},stopCinBgm:()=>{},stopMediaVideo:()=>{},startBGM:()=>{},encodeURIComponent};
 const c=vm.createContext(s);vm.runInContext(body+'\n'+login.body,c);vm.runInContext('showCharGate("warrior",'+story+')',c);
 if(cancel)vm.runInContext('_goLogin()',c);
 if(replacement)s._characterLoadSeq++;
 const before=s.window.location.href;for(const t of timers){assert.equal(t.ms,1200);t.fn();}
 return {before,href:s.window.location.href,seq:s._characterLoadSeq,calls,timers:timers.length};
}
const original=run(gate.body,{cancel:true}),fixed=run(candidate,{cancel:true});assert(original.href.startsWith('game.html'));assert.equal(fixed.href,fixed.before);assert.deepEqual(original.calls,fixed.calls);
const controls=[];for(const opts of [{story:false},{story:true},{activate:false},{replacement:true}]){const a=run(gate.body,opts),b=run(candidate,opts);if(opts.replacement){assert(a.href.startsWith('game.html'));assert.equal(b.href,b.before);}else assert.deepEqual(a,b);controls.push({opts,original:a,candidate:b});}
const negative=run(candidate.replace('if(request!==_characterLoadSeq)return;',''),{cancel:true});assert(negative.href.startsWith('game.html'));
assert.equal(sha(readFileSync('index.html','utf8')),sha(src));
console.log(JSON.stringify({taskId:'MARKETING-milestone-demo-entry-delay-owner-20261002',at:new Date().toISOString(),indexSha:sha(src),anchors:{gate:{line:gate.line,sha256:gate.sha256},login:{line:login.line,sha256:login.sha256}},original,fixed,controls,negativeDetected:true,candidate,productionApplied:false,runtimeAccepted:false,filesWritten:0,boundary:'actual showCharGate and _goLogin whole functions; delayed timer queue, DOM, slot activation, media are explicit stubs; no real save/browser/native/auth; no previous query/env10 or locale5 rerun'},null,2));