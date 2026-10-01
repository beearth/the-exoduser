import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../tools/team-followup-20261001/QA/gap-attribution-observer.js',import.meta.url),'utf8');
function setup(){
  let time=100;const listeners=new Map(),queue=[];
  const e={G:{on:true,paused:false,kills:0},P:{hp:100,x:0,y:0},OPT:{atmos:1,fpsCap:0},ens:[],worldItems:[],projs:[],
    document:{hidden:false,hasFocus:()=>true,addEventListener(){},removeEventListener(){}},
    location:{href:'http://test.localhost/game.html'},navigator:{userAgent:'test'},innerWidth:1352,innerHeight:663,devicePixelRatio:1,
    C:{width:1352,height:662},_useGL:true,_useGPU:false,PHYS_STEP:1000/60,_headCaptureWarmDone:true,_headCaptureWarmMs:8,
    _lastLoopTs:0,_prevTs:0,_acc:0,performance:{now:()=>{time+=.1;return time},timeOrigin:0},
    requestAnimationFrame:fn=>{queue.push(fn);return queue.length},cancelAnimationFrame(){},setTimeout:()=>1,clearTimeout(){},
    addEventListener:(n,fn)=>listeners.set(n,fn),removeEventListener:n=>listeners.delete(n)};
  e.window=e;for(const n of ['update','draw','hurtE','_fmDeathFx','_addCorpse','_addHeadGib','_worldItemSkin','_worldDropFxTile','_maskWorldDropBlack','_drCapture','_drawBurst','_texPreDrain','_tickStreamChunkBuild','_tickBuildMapCache','_tickBgInit'])e[n]=()=>42;
  e.loop=function(ts){if(e.OPT.fpsCap&&ts-e._lastLoopTs<1000/e.OPT.fpsCap-1){e.requestAnimationFrame(e.loop);return 7;}e._lastLoopTs=ts;e.update();e.draw();e.requestAnimationFrame(e.loop);return 9;};
  const originals={loop:e.loop,update:e.update,draw:e.draw};vm.createContext(e);vm.runInContext(source,e);
  return {e,originals,listeners,queue,setTime:v=>{time=v}};
}
test('records loop/update/draw on one clock while preserving returns, scheduling and game state',()=>{
  const {e,queue,originals}=setup(),before=JSON.stringify([e.G,e.P,e.OPT]);
  assert.equal(e.loop(120),9);const q=e.__combatTimelineQA,row=q.loops[0];
  assert.equal(row.updateCount,1);assert.equal(row.drawCount,1);assert.equal(row.skip,null);
  assert.equal(q.spans.length,2);assert.ok(q.spans.every(s=>s.loopId===row.id&&s.start>=row.start&&s.end<=row.end));
  assert.equal(queue.at(-1),e.loop);assert.equal(JSON.stringify([e.G,e.P,e.OPT]),before);
  q.stop();assert.equal(e.loop,originals.loop);assert.equal(e.update,originals.update);assert.equal(e.draw,originals.draw);
  assert.equal(queue.at(-1)(140),9);assert.equal(q.loops.length,1);
});
test('records cap skips and stops on natural death after real input without changing HP',()=>{
  const {e,listeners}=setup();e.OPT.fpsCap=60;e._lastLoopTs=100;
  assert.equal(e.loop(105),7);assert.equal(e.__combatTimelineQA.loops[0].skip,'fps-cap');
  listeners.get('keydown')({code:'KeyW',isTrusted:true,target:{tagName:'BODY'}});
  e.P.hp=0;e.loop(150);assert.equal(e.__combatTimelineQA.reason,'natural-death-or-game-ended');assert.equal(e.P.hp,0);
  assert.equal(listeners.size,0);
});
test('preserves exceptions and reinstall restores rather than nesting wrappers',()=>{
  const {e}=setup();e.__combatTimelineQA.stop();e.update=()=>{throw Error('original failure')};
  vm.runInContext(source,e);assert.throws(()=>e.loop(150),/original failure/);assert.equal(e.__combatTimelineQA.spans[0].kind,'update');
  const first=e.__combatTimelineQA;vm.runInContext(source,e);assert.equal(first.stopped,true);
  assert.throws(()=>e.loop(180),/original failure/);assert.equal(e.__combatTimelineQA.loops.length,1);e.__combatTimelineQA.stop();
});
test('observer teardown failures cannot prevent restoring game functions and listeners',()=>{
  const {e,listeners}=setup();e.__combatTimelineQA.stop();
  let disconnects=0;e.PerformanceObserver=class {
    static supportedEntryTypes=['longtask','long-animation-frame'];
    observe(){} takeRecords(){throw Error('take failure')} disconnect(){disconnects++;throw Error('disconnect failure')}
  };
  vm.runInContext(source,e);const q=e.__combatTimelineQA;q.stop();
  assert.equal(disconnects,2);assert.equal(q.cleanupErrors.length,4);assert.equal(listeners.size,0);
  assert.ok(Object.values(q.restored).every(Boolean));assert.ok(Object.values(q.restoredBindings).every(Boolean));
});

test('ignores untrusted input and stops when foreground is lost',()=>{
 const {e,listeners}=setup();listeners.get('keydown')({code:'KeyW',isTrusted:false,target:{tagName:'BODY'}});assert.equal(e.__combatTimelineQA.inputAt,null);
 listeners.get('keydown')({code:'KeyW',isTrusted:true,target:{tagName:'BODY'}});e.document.hidden=true;e.loop(150);assert.equal(e.__combatTimelineQA.reason,'background-or-focus-loss');assert.ok(Object.values(e.__combatTimelineQA.restored).every(Boolean));
});
