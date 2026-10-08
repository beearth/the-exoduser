import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
for(const file of ['game.html','game-easy-test.html']){
 const html=readFileSync(new URL('../'+file,import.meta.url),'utf8');
 function fn(name,async=false){const start=html.indexOf((async?'async ':'')+'function '+name+'(');assert.ok(start>=0,name+' exists');const open=html.indexOf('{',start);let depth=0;for(let i=open;i<html.length;i++){if(html[i]==='{')depth++;else if(html[i]==='}'&&!--depth)return html.slice(start,i+1)}assert.fail(name+' complete');}
 test(file+': starting the animation loop keeps an active loading screen visible',()=>{
  const start=html.indexOf('function _startLoop(){');const end=html.indexOf('\n',start);let hides=0,rafs=0;
  const ctx=vm.createContext({_looping:false,_bootLoadActive:true,IS_ELECTRON:true,hideBootLoading(){hides++},requestAnimationFrame(){rafs++},loop(){}});
  vm.runInContext(html.slice(start,end),ctx);ctx._startLoop();assert.equal(hides,0);assert.equal(rafs,1);
 });
 test(file+': frame callbacks keep a pending boot covered',()=>{
  const start=html.indexOf('function loop(timestamp){');const end=html.indexOf('  if(_DEBUG_PERF)',start);let hides=0;
  const ctx=vm.createContext({_DCP:{on:false},_bootLoadKilled:false,_bootLoadActive:true,hideBootLoading(){hides++}});
  vm.runInContext(html.slice(start,end)+'}',ctx);ctx.loop();assert.equal(hides,0);
 });
 function harness(enabled=true){
  let now=0;const timers=[],cache={},requests=[],warnings=[],visibility=new Set();const document={hidden:false,addEventListener(type,fn){visibility.add(fn)},removeEventListener(type,fn){visibility.delete(fn)}};
  const chunks={};for(let y=0;y<8;y++)for(let x=0;x<8;x++)chunks[x+','+y]='chunk';
  const ctx=vm.createContext({G:{mw:200,cam:{x:4020,y:7420},_camZoom:1},T:40,VW:5074,VH:1318,_EDITOR_MODE:false,
   _CH1_START_ROOT:'assets/map/ch1/production_finish',_CH1_START_OUTER:{chunkSize:1024,chunks},_ch1StartOuterCache:cache,_ch1StartOuterBootFallback:false,
   _ch1StartOuterEnabled:()=>enabled&&!ctx._ch1StartOuterBootFallback,_requestCh1StartOuter(id){if(!cache[id]){cache[id]={status:'loading'};requests.push(id)}},
   _prepareStartScene:async()=>{},document,performance:{now:()=>now},setTimeout(cb,ms){timers.push({cb,ms})},_L:(ko,en)=>en,setBootLoading(){},console:{warn(...args){warnings.push(args)}}});
  vm.runInContext(fn('_ch1StartOuterViewIds')+'\n'+fn('_preloadCh1StartOuter')+'\n'+fn('_prepareStartMapView',true),ctx);
  return{ctx,cache,requests,warnings,document,visibility,async tick(){const t=timers.shift();assert.ok(t);now+=t.ms;t.cb();await new Promise(setImmediate);}};
 }
 test(file+': first-view preparation waits for every visible and neighbor GPU upload',async()=>{
  const h=harness();let done=false;const p=h.ctx._prepareStartMapView().then(()=>done=true);await Promise.resolve();assert.equal(h.requests.length,24);assert.equal(done,false);
  for(const e of Object.values(h.cache))e.status='decoded';await h.tick();assert.equal(done,false,'decoded images are not GPU-ready');
  for(const e of Object.values(h.cache))e.status='ready';await h.tick();await p;assert.equal(done,true);
 });
 test(file+': resize during preparation also waits for the newly visible chunks',async()=>{
  const h=harness();h.ctx.VW=1000;const p=h.ctx._prepareStartMapView();for(const e of Object.values(h.cache))e.status='ready';h.ctx.VW=5074;await h.tick();assert.equal(h.requests.length,24);assert.ok(Object.values(h.cache).some(e=>e.status==='loading'));for(const e of Object.values(h.cache))e.status='ready';await h.tick();await p;
 });
 test(file+': other stages and explicit map opt-out add no boot wait',async()=>{
  const h=harness(false);await h.ctx._prepareStartMapView();assert.equal(h.requests.length,0);
 });
 test(file+': a failed initial chunk chooses one stable fallback instead of a partial map',async()=>{
  const h=harness();const p=h.ctx._prepareStartMapView();Object.values(h.cache)[0].status='error';await h.tick();await p;assert.equal(h.ctx._ch1StartOuterBootFallback,true);assert.equal(h.warnings.length,1);
 });
 test(file+': a stuck initial load cannot trap startup indefinitely',async()=>{
  const h=harness();let done=false;const p=h.ctx._prepareStartMapView().then(()=>done=true);for(let i=0;i<401&&!done;i++)await h.tick();await p;assert.equal(h.ctx._ch1StartOuterBootFallback,true);assert.equal(h.warnings.length,1);
 });
 test(file+': a second startup owns the loading screen until its explicit completion',()=>{
  const el={style:{}},bar={style:{}},name={textContent:''};
  const ctx=vm.createContext({_DEBUG_PERF:false,_bootLoadShownAt:0,_bootLoadActive:false,_bootLoadKilled:true,_bootRdPicked:true,_STAGE_TRANSITION_RD:[],
   Date,performance:{now:()=>0},_T:s=>s,_bootPerfReport(){},_bootPerfMark(){},$:id=>({stageTransition:el,stLoadBar:bar,stNextName:name}[id])});
  vm.runInContext(fn('showBootLoading')+'\n'+fn('hideBootLoading'),ctx);ctx.showBootLoading('loading');
  assert.equal(ctx._bootLoadActive,true);assert.equal(ctx._bootLoadKilled,false);assert.equal(el.style.opacity,'1');
  ctx.hideBootLoading();assert.equal(ctx._bootLoadActive,false);assert.equal(el.style.opacity,'0');
  ctx.showBootLoading('again');assert.equal(ctx._bootLoadActive,true);assert.equal(ctx._bootLoadKilled,false);assert.equal(el.style.pointerEvents,'all');
 });

 test(file+': hidden startup does not select degraded art just because browser timers are throttled',async()=>{
  const h=harness();h.document.hidden=true;let done=false;const p=h.ctx._prepareStartMapView().then(()=>done=true);
  for(let i=0;i<405&&!done;i++)await h.tick();assert.equal(h.ctx._ch1StartOuterBootFallback,false);assert.equal(done,false);
  h.document.hidden=false;for(const cb of h.visibility)cb();for(const e of Object.values(h.cache))e.status='ready';await h.tick();await p;assert.equal(h.visibility.size,0);
 });

}
