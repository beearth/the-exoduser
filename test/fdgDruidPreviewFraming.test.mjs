import test from 'node:test';
import assert from 'node:assert/strict';
import {installDruidEncounterQa} from '../engine/fdg/druid-encounter-qa.js';

class Element {
  constructor(tag) {
    this.tag=tag;this.children=[];this.style={};this.textContent='';this.listeners=new Map();
    const classes=new Set();
    this.classList={add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c),
      toggle:c=>classes.has(c)?(classes.delete(c),false):(classes.add(c),true)};
  }
  append(child){this.children.push(child);child.parent=this;}
  setAttribute(){}
  addEventListener(type,fn){this.listeners.set(type,fn);}
  remove(){if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this);}
  click(){this.listeners.get('click')?.({target:this});}
}

function harness(t,{combatFraming=true,active=true,thornVolley=false,previewParryContact}={}) {
  const saved={document:globalThis.document,setInterval:globalThis.setInterval,clearInterval:globalThis.clearInterval};
  const nodes=[],timers=new Set();let updates=0,forces=0,boundsReads=0,refreshes=0;
  globalThis.document={body:new Element('body'),createElement(tag){const n=new Element(tag);nodes.push(n);return n;},addEventListener(){},removeEventListener(){}};
  globalThis.setInterval=fn=>(timers.add(fn),fn);globalThis.clearInterval=fn=>timers.delete(fn);
  const e={ib:true,alive:true,x:3000,y:2300,r:100,hp:800,mhp:800,s:'idle',st2:0,facing:0,_bossPhase:0};
  const state={P:{x:3000,y:2640,hp:300,mhp:300,s:'idle',st2:0,lv:1,kb:{x:0,y:0}},
    G:{on:true,_bossArena:true,stage:0,mw:200,mh:200,frame:0,cam:{x:3000,y:2800},_camZoom:1},
    C:{width:1280,height:720},ens:[e],projs:[],OPT:{}};
  const scope={_FDGDruidSlamBridge:{},_btFramePause:false,updateE(){updates++;return 'native-update';}};
  const storage={active,ownSettings:null,receipt:()=>({successfulWrites:0})};
  const qa=installDruidEncounterQa({scope,storage,getState:()=>state,combatFraming,thornVolley,previewParryContact,patterns:[{id:'slam'}],
    forcePattern(){forces++;e.s='bossSlamWind';e.st2=26;},setPhase(){},saveNativeSettings(){},
    clearProjectiles(){state.projs.length=0;},refreshHUD(){refreshes++;},canPlace:()=>true,
    getBossBounds(actor){boundsReads++;const wind=actor.s==='bossSlamWind';return {
      left:actor.x-(wind?360:240),right:actor.x+(wind?360:240),top:actor.y-(wind?1200:780),bottom:actor.y+100,
      source:wind?'current-wind-render':'current-idle-render'};}});
  const button=label=>{const b=nodes.find(n=>n.tag==='button'&&n.textContent===label);assert.ok(b,label);return b;};
  const tick=()=>{for(const fn of timers)fn();};
  const fit=(dt=0)=>qa.frameCombatCamera({width:1280,height:720,dt,mapBounds:{left:0,top:0,right:8000,bottom:8000}});
  const apply=frame=>{state.G.cam.x=frame.x;state.G.cam.y=frame.y;state.G._camZoom=frame.zoom;};
  t.after(()=>{qa?.uninstall();if(saved.document===undefined)delete globalThis.document;else globalThis.document=saved.document;
    globalThis.setInterval=saved.setInterval;globalThis.clearInterval=saved.clearInterval;});
  return {qa,state,e,scope,tick,button,fit,apply,nodes,timers,hudRefreshes:()=>refreshes,counts:()=>({updates,forces,boundsReads})};
}

function assertContained(frame) {
  assert.equal(frame.ok,true);assert.equal(frame.contained,true);assert.equal(frame.reason,null);
  const {bounds:b,safeRect:s}=frame;
  const screen=r=>({x:(r.x-frame.x)*frame.zoom+640,y:(r.y-frame.y)*frame.zoom+360});
  const a=screen({x:b.left,y:b.top}),z=screen({x:b.right,y:b.bottom});
  assert.ok(a.x>=s.left-1e-7&&a.y>=s.top-1e-7&&z.x<=s.right+1e-7&&z.y<=s.bottom+1e-7);
}

test('ready frozen preview fits current full body and player without native updates or manual r4 lock',t=>{
  const h=harness(t);h.tick();assert.equal(h.scope._btFramePause,true);assert.equal(h.qa.snapshot().mode,'ready');
  h.button('프레임 카메라 ×0.5').click();
  assert.deepEqual(h.qa.snapshot().cameraLock,{x:3300,y:2180,zoom:.5});
  assert.equal(h.qa.cameraLock,null);assert.equal(h.qa.combatFraming,true);
  const before=structuredClone(h.state),pause=h.scope._btFramePause;
  const frame=h.fit();assertContained(frame);assert.equal(frame.bodySource,'current-idle-render');
  assert.ok(frame.zoom<1);assert.deepEqual(h.state,before);assert.equal(h.scope._btFramePause,pause);
  h.apply(frame);const frozen=structuredClone(h.state);assertContained(h.fit());assert.deepEqual(h.state,frozen);
  assert.deepEqual(h.counts(),{updates:0,forces:0,boundsReads:2});
});

test('public paused pattern and placement controls refresh framing with native wind pose and timer frozen',t=>{
  const h=harness(t);h.tick();const readyFrame=h.fit();h.apply(readyFrame);
  h.button('선택 패턴 준비(정지)').click();h.button('근접 100px').click();
  assert.equal(h.qa.snapshot().mode,'forced-pattern');assert.equal(h.qa.combatFraming,true);
  assert.equal(h.scope._btFramePause,true);assert.equal(h.e.st2,26);assert.equal(h.state.P.y,2400);
  const before=structuredClone(h.state),frame=h.fit();assertContained(frame);
  assert.equal(frame.bodySource,'current-wind-render');assert.equal(frame.bounds.top,1100);assert.equal(frame.bounds.bottom,2500);
  assert.ok(frame.zoom<readyFrame.zoom);assert.deepEqual(h.state,before);assert.equal(h.e.st2,26);
  assert.deepEqual(h.counts(),{updates:0,forces:1,boundsReads:2});
});

test('player death keeps living boss framing current rather than returning cached AI bounds',t=>{
  const h=harness(t);h.tick();h.button('AI 시작').click();const aliveFrame=h.fit();h.apply(aliveFrame);
  h.state.P.hp=0;assert.equal(h.scope.updateE(h.e),'native-update');assert.equal(h.qa.snapshot().mode,'player-dead');
  h.scope._btFramePause=true;h.e.x+=1800;h.state.P.x+=1800;
  const before=structuredClone(h.state),deadFrame=h.fit();assertContained(deadFrame);
  assert.equal(h.qa.combatFraming,true);assert.equal(deadFrame.bounds.left,aliveFrame.bounds.left+1800);
  assert.equal(deadFrame.bounds.right,aliveFrame.bounds.right+1800);assert.notEqual(deadFrame.x,aliveFrame.x);
  assert.deepEqual(h.state,before);assert.deepEqual(h.qa.combatSnapshot(),deadFrame);
  assert.equal(h.counts().updates,1);h.e.hp=0;assert.equal(h.qa.combatFraming,false);assert.equal(h.fit(),null);
});

test('old r4 mode retains independent manual camera lock and never consumes combat bounds',t=>{
  const h=harness(t,{combatFraming:false});h.tick();h.button('프레임 카메라 ×0.5').click();
  const expected={x:3300,y:2180,zoom:.5};assert.deepEqual(h.qa.cameraLock,expected);
  const clone=h.qa.cameraLock;clone.x=-1;assert.deepEqual(h.qa.cameraLock,expected);
  assert.equal(h.qa.combatFraming,false);assert.equal(h.fit(),null);assert.equal(h.counts().boundsReads,0);
  h.button('선택 패턴 준비(정지)').click();assert.deepEqual(h.qa.cameraLock,expected);
  h.button('AI 시작').click();assert.deepEqual(h.qa.cameraLock,expected);assert.equal(h.fit(),null);
});

test('inactive storage leaves QA, native functions and DOM untouched',t=>{
  const h=harness(t,{active:false});assert.equal(h.qa,null);assert.equal(h.nodes.length,0);assert.equal(h.timers.size,0);
  assert.equal(h.scope.updateE(h.e),'native-update');assert.deepEqual(h.counts(),{updates:1,forces:0,boundsReads:0});
});

test('frozen ready and forced previews show their current boss without ticking spawn fade and refresh HUD once',t=>{
  const h=harness(t);h.e._spawnT=20;h.state.G.stageTime=0;h.tick();
  const before=structuredClone(h.state);assert.equal(h.qa.frozenBossAlpha(h.e,0),1);
  assert.equal(h.qa.frozenBossAlpha({...h.e},0),0);assert.deepEqual(h.state,before);
  h.tick();assert.equal(h.hudRefreshes(),1);assert.equal(h.state.G.frame,0);assert.equal(h.state.G.stageTime,0);
  h.button('선택 패턴 준비(정지)').click();const prepared=structuredClone(h.state);
  assert.equal(h.qa.frozenBossAlpha(h.e,.25),1);assert.deepEqual(h.state,prepared);
  assert.equal(h.e._spawnT,20);assert.equal(h.e.st2,26);assert.equal(h.counts().updates,0);
});

test('unpaused and paused native AI preserve native alpha exactly without actor or clock writes',t=>{
  const h=harness(t);h.tick();h.scope._btFramePause=false;
  for(const alpha of [0,.25,1,NaN,undefined])assert.ok(Object.is(h.qa.frozenBossAlpha(h.e,alpha),alpha));
  h.button('AI 시작').click();h.scope._btFramePause=true;const before=structuredClone(h.state);
  for(const alpha of [0,.25,1,NaN,undefined])assert.ok(Object.is(h.qa.frozenBossAlpha(h.e,alpha),alpha));
  assert.deepEqual(h.state,before);assert.equal(h.counts().updates,0);
});

test('preview quality paused placement snaps to target zoom while unpaused native AI retains smoothing',t=>{
  const h=harness(t);h.tick();h.state.G._camZoom=.3;
  const readyBefore=structuredClone(h.state),ready=h.fit();assertContained(ready);
  assert.equal(ready.zoom,ready.targetZoom);assert.deepEqual(h.state,readyBefore);h.apply(ready);
  h.button('근접 100px').click();const nearBefore=structuredClone(h.state),near=h.fit();assertContained(near);
  assert.ok(near.targetZoom>ready.zoom);assert.equal(near.zoom,near.targetZoom);assert.deepEqual(h.state,nearBefore);
  h.button('AI 시작').click();h.state.G._camZoom=.3;const aiBefore=structuredClone(h.state),ai=h.fit(1);
  assertContained(ai);assert.equal(ai.zoom,.3+(ai.targetZoom-.3)*(1-.94));assert.ok(ai.zoom<ai.targetZoom);
  assert.deepEqual(h.state,aiBefore);assert.equal(h.counts().updates,0);assert.equal(h.e.st2,0);
});

test('preview quality public effect button calls once without native parry or actor writes and stays first-only',t=>{
  let previews=0;const h=harness(t,{thornVolley:true,previewParryContact(){previews++;}});
  const label='Q 패링 효과 미리보기';h.button(label).click();assert.equal(previews,0);h.tick();
  const before=structuredClone(h.state),paused=h.scope._btFramePause;h.button(label).click();
  assert.equal(previews,1);assert.deepEqual(h.state,before);assert.equal(h.scope._btFramePause,paused);
  const events=h.qa.snapshot().events;assert.equal(events.filter(e=>e.type==='qa-contact-preview').length,1);
  assert.equal(events.find(e=>e.type==='qa-contact-preview').kind,'dark02');assert.equal(events.filter(e=>e.type==='native-parry').length,0);
  const beforeNodes=h.nodes.length;
  const nonfirst=installDruidEncounterQa({scope:{},storage:{active:true,ownSettings:null},getState:()=>h.state,
    patterns:[],previewParryContact(){previews++;}});
  assert.equal(h.nodes.slice(beforeNodes).filter(n=>n.tag==='button'&&n.textContent===label).length,0);
  const nonfirstNodes=h.nodes.length;
  assert.equal(installDruidEncounterQa({storage:{active:false},thornVolley:true,previewParryContact(){previews++;}}),null);
  assert.equal(h.nodes.length,nonfirstNodes);assert.equal(previews,1);assert.equal(h.counts().updates,0);
  nonfirst.uninstall();
});
