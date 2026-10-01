import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {gateV2, classifyDecaySparse} from './five-owner-before/ANIMVFX/sparse-update-c5-gate.mjs';

const results=[];
const mapSource=fs.readFileSync(new URL('./five-owner-before/MAP/manual-input-observer.js',import.meta.url),'utf8');
function mapEnv({failAdd=false}={}){
  const listeners=new Map(), timers=new Map();let next=0,adds=0;
  function target(){return {hidden:false,addEventListener(type,fn){if(failAdd&&++adds===2)throw Error('fixture add');listeners.set(fn,type);},removeEventListener(type,fn){listeners.delete(fn);}};}
  const doc=target(),root=target();
  Object.assign(root,{document:doc,G:{stage:0,map:Array.from({length:200},()=>Array(200).fill(0))},P:{x:6660,y:6140},K:{KeyS:true},T:40,isW:()=>false,performance:{now:()=>10},AbortController,console:{error(){},log(){}},setInterval(fn){const id=++next;timers.set(id,fn);return id;},clearInterval(id){timers.delete(id);}});
  root.window=root;vm.runInNewContext(mapSource,root);
  return {root,doc,listeners,timers,step(){for(const fn of [...timers.values()])fn();}};
}
{
  const e=mapEnv({failAdd:true});let error;try{e.root._m5manualStart();}catch(x){error=x.message;}
  results.push({id:'MAP-install-rollback',error,remainingListeners:e.listeners.size,expected:0});
  assert.equal(e.listeners.size,1,'baseline must reproduce partial installation leak');
}
{
  const e=mapEnv();const ctl=e.root._m5manualStart();e.doc.hidden=true;
  for(const [fn,type]of [...e.listeners])if(type==='visibilitychange')fn({type});
  e.step();e.root.P.y+=30;e.step();const r=ctl.stop();
  results.push({id:'MAP-hidden-sampling',hiddenLegs:r.legs.length,hiddenSamples:r.legs.reduce((s,x)=>s+x.samples.length,0),expected:0});
  assert(r.legs.length>0,'baseline must reproduce new leg while hidden');
}
{
  const e=mapEnv();const first=e.root._m5manualStart(),second=e.root._m5manualStart();second.stop();
  results.push({id:'MAP-duplicate-start',remainingTimers:e.timers.size,remainingListeners:e.listeners.size,expected:0});first.stop();
}
{
  const r=classifyDecaySparse({intervals:[{dHf:1,dU:1,dD:null,atDeath:false}]});
  results.push({id:'ANIM-missing-draw-counter',actual:r.verdict,expected:'UNKNOWN or REJECT'});assert.equal(r.verdict,'PASS');
  const raw={records:[{id:1,hf:3,updates:10,draws:0,now:0,events:['flash-start-observed']},{id:1,hf:2,updates:11,now:5},{id:1,hf:1,updates:12,draws:2,now:10},{id:1,hf:0,updates:13,draws:3,now:15,events:['flash-zero-observed']}]};
  const out=gateV2(raw);results.push({id:'ANIM-missing-middle-draw-record',actual:out.overall,decayModel:out.decayModelSummary,episodes:out.episodes.map(x=>({verdict:x.verdict,c5:x.c5})),raw});
}
console.log(JSON.stringify({kind:'reproduced-unaccepted-boundaries',results},null,2));
