import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { installDruidEncounterQa } from '../engine/fdg/druid-encounter-qa.js';

const game = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const resetStart = game.indexOf('function _resetProj(p){');
const resetEnd = game.indexOf('// 적 투사체: 발사자', resetStart);
assert.ok(resetStart >= 0 && resetEnd > resetStart);
const resetSource = game.slice(resetStart, resetEnd);
const nativeReset = vm.runInNewContext(`${resetSource}\n_resetProj`);
const metrics = { moduleSha256: createHash('sha256').update(readFileSync(new URL('../engine/fdg/druid-encounter-qa.js',import.meta.url))).digest('hex'), resetSourceSha256:createHash('sha256').update(resetSource).digest('hex'), pool:{}, retry:{}, nativeBoots:0, browserActions:0, oldSuiteRuns:0, pngReads:0 };

class Node {
  constructor(tag) { this.tag=tag;this.children=[];this.style={};this.textContent='';this.listeners=new Map(); }
  append(child) { this.children.push(child);child.parent=this; }
  setAttribute() {}
  addEventListener(type,fn) { this.listeners.set(type,fn); }
  remove() { if(this.parent)this.parent.children=this.parent.children.filter(c=>c!==this); }
  click() { this.listeners.get('click')?.({target:this}); }
}
function makeBoss(hp=100) { return {ib:true,alive:true,x:100,y:100,s:'idle',st2:0,hp,mhp:hp,facing:0,_bossPhase:0,r:44}; }
function harness(t,options={}) {
  const saved={document:globalThis.document,setInterval:globalThis.setInterval,clearInterval:globalThis.clearInterval};
  const nodes=[],timers=new Map(),docListeners=new Map();let timerId=0,resetCalls=0,updateCalls=0,restarts=0;
  const document={body:new Node('body'),createElement(tag){const n=new Node(tag);nodes.push(n);return n;},addEventListener(type,fn){docListeners.set(type,fn);},removeEventListener(type,fn){if(docListeners.get(type)===fn)docListeners.delete(type);}};
  globalThis.document=document;globalThis.setInterval=fn=>{timers.set(++timerId,fn);return timerId;};globalThis.clearInterval=id=>timers.delete(id);
  const state={P:{x:440,y:440,s:'idle',st2:0,hp:100,mhp:100,st:100,mp:100,kb:{x:0,y:0}},G:{on:true,stage:0,_bossArena:true,mw:128,mh:108,cam:{x:0,y:0},frame:0},C:{width:960,height:540},projs:[],ens:[makeBoss()],OPT:{}};
  const originals={_resetProj:function(...args){resetCalls++;return nativeReset.apply(this,args);},_bossStartPattern(){return 'start-result';},doParry(){return 'parry-result';},hurtP(){return 'hurt-result';},updateE(){updateCalls++;return 'update-result';},_drawDruidBoss(){return 'draw-result';}};
  const scope={...originals,_FDGDruidSlamBridge:{},_btFramePause:false,_btPaused:false};
  const storage={active:true,ownSettings:null,receipt(){return {successfulWrites:0};}};
  const qa=installDruidEncounterQa({scope,storage,getState:()=>state,patterns:[{id:'slam'}],forcePattern:options.forcePattern||(()=>{}),setPhase(){},saveNativeSettings(){},clearProjectiles(){state.projs.length=0;},refreshHUD(){},getMetrics:()=>({fps:60}),restartNative(){restarts++;state.P.hp=100;state.ens=[makeBoss(50)];state.projs.length=0;scope._btFramePause=true;}});
  const button=text=>{const b=nodes.find(n=>n.tag==='button'&&n.textContent===text);assert.ok(b,text);return b;};
  const tick=()=>{for(const fn of [...timers.values()])fn();};
  const eventCount=type=>qa.snapshot().events.filter(e=>e.type===type).length;
  t.after(()=>{qa.uninstall();if(saved.document===undefined)delete globalThis.document;else globalThis.document=saved.document;globalThis.setInterval=saved.setInterval;globalThis.clearInterval=saved.clearInterval;});
  return {qa,scope,state,originals,nodes,timers,docListeners,document,button,tick,eventCount,counts:()=>({resetCalls,updateCalls,restarts})};
}
function launch(h,p,kind='magic') {
  assert.equal(h.scope._resetProj(p),undefined);
  Object.assign(p,{x:100,y:100,vx:4.4,vy:0,dmg:133,life:400,sz:1.2,_druidStraight:true,parryClass:kind,friendly:false});
  if(!h.state.projs.includes(p))h.state.projs.push(p);
  assert.equal(h.scope.updateE(h.state.ens[0]),'update-result');
}

test('actual QA module resets pooled shot/reflection identity at native _resetProj and restores wrappers', t=>{
  const h=harness(t),p={};h.tick();
  assert.equal(h.qa.snapshot().ready,true);
  h.button('AI 시작').click();
  launch(h,p);assert.equal(h.qa.snapshot().mode,'native-ai');
  h.scope.updateE(h.state.ens[0]);assert.equal(h.eventCount('native-shot'),1);
  Object.assign(p,{friendly:true,blueBean:true,homing:true,_fromRainbow:true});
  h.scope.updateE(h.state.ens[0]);h.scope.updateE(h.state.ens[0]);
  assert.equal(h.eventCount('native-reflection'),1);
  launch(h,p,'physical');assert.equal(h.eventCount('native-shot'),2);
  assert.equal(p.friendly,false);assert.equal(p.blueBean,false);assert.equal(p.homing,false);
  launch(h,p);assert.equal(h.eventCount('native-shot'),3);
  Object.assign(p,{friendly:true,blueBean:true,homing:true,_fromRainbow:false});
  h.scope.updateE(h.state.ens[0]);h.scope.updateE(h.state.ens[0]);
  assert.equal(h.eventCount('native-reflection'),2);
  const snapshot=h.qa.snapshot();assert.equal(snapshot.events.filter(e=>e.type==='native-shot')[1].class,'physical');
  assert.equal(h.counts().resetCalls,3);
  const foreignUpdate=()=>{};h.scope.updateE=foreignUpdate;h.qa.uninstall();
  assert.equal(h.scope._resetProj,h.originals._resetProj);
  assert.equal(h.scope.updateE,foreignUpdate);
  assert.equal(h.timers.size,0);assert.equal(h.docListeners.size,0);assert.equal(h.document.body.children.length,0);
  metrics.pool={sameProjectileObject:true,launches:3,shotEvents:3,reflectionEvents:2,duplicateShotEvents:0,duplicateReflectionEvents:0,nativeResetCalls:3,nativeReturnPreserved:true,uninstallResetRestored:true,foreignWrapperPreserved:true};
});

test('paused native retry and public restart resync new boss without updateE or false damage',t=>{
  const h=harness(t),p={};h.tick();launch(h,p);
  Object.assign(p,{friendly:true,blueBean:true,homing:true});h.scope.updateE(h.state.ens[0]);
  h.state.P.hp=0;h.scope.updateE(h.state.ens[0]);assert.equal(h.qa.snapshot().mode,'player-dead');
  const updates=h.counts().updateCalls,oldBoss=h.state.ens[0];
  // Native retry changes actors while physics is paused; no observer updateE call.
  h.state.P.hp=573;h.state.ens=[makeBoss(30)];h.state.ens[0].x=2580;h.scope._btFramePause=true;h.state.projs.length=0;
  const retry=h.qa.snapshot();assert.equal(h.counts().updateCalls,updates);assert.equal(retry.mode,'ready');assert.equal(retry.paused,true);assert.equal(retry.boss.x,2580);assert.equal(retry.player.hp,573);assert.notEqual(h.scope._btBoss,oldBoss);
  h.tick();assert.equal(h.qa.snapshot().mode,'ready');assert.equal(h.counts().updateCalls,updates);
  launch(h,p);assert.equal(h.eventCount('native-shot'),2);assert.equal(h.eventCount('native-boss-damage'),0);
  assert.equal(h.qa.snapshot().states.at(-1).hp,30);
  Object.assign(p,{friendly:true,blueBean:true,homing:true});h.scope.updateE(h.state.ens[0]);assert.equal(h.eventCount('native-reflection'),2);
  // An updateE-delivered replacement follows the same identity path.
  h.state.P.hp=0;h.scope.updateE(h.state.ens[0]);assert.equal(h.qa.snapshot().mode,'player-dead');
  h.state.P.hp=100;h.state.ens=[makeBoss(20)];h.scope.updateE(h.state.ens[0]);
  assert.equal(h.qa.snapshot().mode,'ready');assert.equal(h.eventCount('native-boss-damage'),0);
  h.button('QA 보스전 재시작').click();assert.equal(h.counts().restarts,1);assert.equal(h.qa.snapshot().mode,'ready');assert.equal(h.qa.snapshot().boss.hp,50);
  launch(h,p);assert.equal(h.eventCount('native-shot'),3);assert.equal(h.eventCount('native-boss-damage'),0);
  metrics.retry={pausedSnapshotReady:true,pausedHudReady:true,updateCallsDuringPausedReplacement:0,newBossObserved:true,falseBossDamageEvents:0,publicRestartCalls:1,shotsAfterReuseAndRestarts:3,reflections:2,updateEDeliveredReplacementReady:true};
});

test('public frame controls prepare native pattern paused and clone camera lock through actual game gate',t=>{
  let forceCalls=0,forceInput=null,forcePaused=null;
  const h=harness(t,{forcePattern(id){
    forceCalls++;forceInput=id;forcePaused=h.scope._btFramePause;
    // The native callback owns FSM changes; public controls preserve its result.
    h.state.ens[0].s='wind';h.state.ens[0].st2=26;
  }});h.tick();
  const e=h.state.ens[0];Object.assign(e,{x:2580,y:2080,hp:573,facing:.4});
  Object.assign(h.state.P,{x:2580,y:2420,hp:573});
  const actorFields={x:e.x,y:e.y,hp:e.hp,facing:e.facing,player:{x:h.state.P.x,y:h.state.P.y,hp:h.state.P.hp}};
  h.state.projs.push({dummy:true});h.scope._btFramePause=false;
  h.button('선택 패턴 준비(정지)').click();
  assert.equal(forceCalls,1);assert.equal(forceInput,'slam');assert.equal(forcePaused,false);
  assert.equal(h.scope._btFramePause,true);assert.equal(h.scope._btPaused,true);
  assert.equal(e.s,'wind');assert.equal(e.st2,26);assert.equal(h.state.projs.length,0);
  assert.deepEqual({x:e.x,y:e.y,hp:e.hp,facing:e.facing,player:{x:h.state.P.x,y:h.state.P.y,hp:h.state.P.hp}},actorFields);
  const prepared=h.qa.snapshot();assert.equal(prepared.mode,'forced-pattern');
  assert.equal(prepared.events.filter(ev=>ev.type==='qa-force-pattern').length,1);
  assert.equal(prepared.events.findLast(ev=>ev.type==='qa-force-pattern').paused,true);
  h.button('1틱 진행').click();assert.equal(h.scope._btFramePause,true);assert.equal(h.scope._btFrameStep,true);
  assert.equal(forceCalls,1);assert.equal(h.counts().updateCalls,0);assert.equal(e.st2,26);

  h.state.G.cam={x:1250,y:1440};h.state.G._camZoom=.72;
  assert.equal(h.qa.cameraLock,null);h.button('카메라 고정 / 해제').click();
  const expectedCamera={x:1250,y:1440,zoom:.72};assert.deepEqual(h.qa.cameraLock,expectedCamera);
  const getterClone=h.qa.cameraLock;getterClone.x=-999;getterClone.zoom=99;
  const snapshotClone=h.qa.snapshot().cameraLock;snapshotClone.y=-999;
  assert.deepEqual(h.qa.cameraLock,expectedCamera);assert.deepEqual(h.qa.snapshot().cameraLock,expectedCamera);
  assert.throws(()=>{h.qa.cameraLock={x:0,y:0,zoom:1};},TypeError);

  const marker='// Explicit r4 frame inspection freezes the observed camera, never actor coordinates.';
  const gateIndex=game.indexOf(marker),clampIndex=game.indexOf('// [CAM-CLAMP]');
  assert.ok(gateIndex>clampIndex,'camera lock must follow actual native camera update/clamp');
  assert.equal(game.indexOf(marker,gateIndex+1),-1,'single gate');
  const syncIndex=game.indexOf('_syncDruidFinaleMouse();',gateIndex);
  const victoryIndex=game.indexOf('if(G._druidVictory)',gateIndex);
  assert.ok(syncIndex>gateIndex&&syncIndex<victoryIndex,'gate belongs to camera update immediately before finale mouse sync');
  const gateMatch=game.slice(gateIndex).match(/const _druidQaCamera=[^\n]+\n  if\(_druidQaCamera\)\{[^\n]+\}/);
  assert.ok(gateMatch,'actual game camera consumer');const gateSource=gateMatch[0];
  const storage={active:false},context={window:{_FDGDruidQaStorage:storage,_FDGDruidEncounterQa:h.qa},G:h.state.G};
  h.state.G.cam={x:900,y:901};h.state.G._camZoom=.8;
  vm.runInNewContext(`{${gateSource}}`,context);assert.deepEqual(h.state.G.cam,{x:900,y:901});assert.equal(h.state.G._camZoom,.8);
  storage.active=true;vm.runInNewContext(`{${gateSource}}`,context);
  assert.deepEqual(h.state.G.cam,{x:1250,y:1440});assert.equal(h.state.G._camZoom,.72);
  assert.deepEqual({x:e.x,y:e.y,hp:e.hp,facing:e.facing,player:{x:h.state.P.x,y:h.state.P.y,hp:h.state.P.hp}},actorFields);
  h.button('카메라 고정 / 해제').click();assert.equal(h.qa.cameraLock,null);assert.equal(h.qa.snapshot().cameraLock,null);
  h.state.G.cam={x:700,y:701};h.state.G._camZoom=.9;
  vm.runInNewContext(`{${gateSource}}`,context);assert.deepEqual(h.state.G.cam,{x:700,y:701});assert.equal(h.state.G._camZoom,.9);
  metrics.frames={nativeForceCalls:forceCalls,forceInput,pausedAfterNativeCall:true,nativeFsmResultPreserved:true,actorCoordinatesAndHpUntouched:true,stepFlag:true,updateECalls:0,cameraGetterAndSnapshotIndependentClones:true,cameraGetterReadonly:true,cameraGateAfterNativeUpdateClamp:true,cameraGateCount:1,inactiveCameraUnchanged:true,activeCameraFrozen:true,releasedCameraUnchanged:true,gateSourceSha256:createHash('sha256').update(gateSource).digest('hex'),publicFramesClaimed:0};
});

test('public half zoom framing captures boss offsets and keeps actor and snapshot camera stable',t=>{
  let forceCalls=0;const h=harness(t,{forcePattern(){forceCalls++;}});h.tick();
  const e=h.state.ens[0];Object.assign(e,{x:2580,y:2080,s:'wind',st2:26,hp:573,facing:.7});
  Object.assign(h.state.P,{x:2580,y:2420,hp:573});
  h.state.G.cam={x:1200,y:1600};h.state.G._camZoom=.8;h.scope._btScaleMul=.5;
  h.state.projs.push({x:10,y:20,friendly:false});
  const before={boss:structuredClone(e),player:structuredClone(h.state.P),projs:structuredClone(h.state.projs),camera:structuredClone(h.state.G.cam),zoom:h.state.G._camZoom,scale:h.scope._btScaleMul,paused:h.scope._btFramePause};
  h.button('프레임 카메라 ×0.5').click();
  const expected={x:2880,y:1960,zoom:.5};
  assert.deepEqual(h.qa.cameraLock,expected);assert.deepEqual(h.qa.snapshot().cameraLock,expected);
  assert.deepEqual(e,before.boss);assert.deepEqual(h.state.P,before.player);assert.deepEqual(h.state.projs,before.projs);
  assert.deepEqual(h.state.G.cam,before.camera);assert.equal(h.state.G._camZoom,before.zoom);
  assert.equal(h.scope._btScaleMul,before.scale);assert.equal(h.scope._btFramePause,before.paused);
  assert.equal(forceCalls,0);assert.equal(h.counts().updateCalls,0);
  const event=h.qa.snapshot().events.findLast(ev=>ev.type==='qa-camera-lock');
  assert.equal(event.framing,'slam-five-poses');assert.equal(event.locked,true);assert.deepEqual(event.camera,expected);
  const clone=h.qa.cameraLock;clone.x=0;clone.y=0;clone.zoom=1;
  assert.deepEqual(h.qa.cameraLock,expected);
  // Camera is captured once; actual actor motion does not turn this into actor relocation or tracking.
  e.x+=12;e.y+=15;h.state.G.cam={x:2000,y:2001};h.state.G._camZoom=.6;
  const later=h.qa.snapshot();assert.deepEqual(later.cameraLock,expected);assert.equal(later.boss.x,2592);assert.equal(later.boss.y,2095);
  metrics.frameCamera={button:'프레임 카메라 ×0.5',offset:[300,-120],zoom:.5,capturedCamera:expected,framing:'slam-five-poses',actorAndProjectilesPreservedAtClick:true,currentNativeCameraAndDisplayScalePreservedAtClick:true,physicsPausePreserved:true,nativeForceCalls:0,updateECalls:0,getterIndependentClone:true,snapshotCameraRemainsFixed:true,publicFramesClaimed:0};
});

test.after(()=>{if(process.env.FDG_DRUID_QA_OBSERVER_METRICS)writeFileSync(process.env.FDG_DRUID_QA_OBSERVER_METRICS,JSON.stringify(metrics,null,2)+'\n');});
