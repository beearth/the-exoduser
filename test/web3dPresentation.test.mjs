import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const file=new URL('../web3d/presentation.mjs',import.meta.url);
const load=async()=>{assert.ok(fs.existsSync(file),'presentation module must separate clocks from drawing');return import(file);};

test('one presentation advances and expires offscreen VFX without a native draw',async()=>{
  const {advancePresentation}=await load();
  const state={dt:1,gameTime:200,step:1000/60,vfx:[{frame:0,t:1,frameTime:2,maxFrames:2},{frame:1,t:1,frameTime:2,maxFrames:2}],fire:[{frame:0,t:0,frameTime:1,maxFrames:4}],fx:[{f:0,t:7}],fxFrames:12,flash:{a:.2},G:{_flashT:2,_chromaT:3,_chainArcs:[{t:2,maxT:3},{t:0,maxT:8}]},speedLines:{active:2}};
  advancePresentation(state);
  assert.deepEqual(state.vfx,[{frame:1,t:0,frameTime:2,maxFrames:2}]);
  assert.equal(state.fire[0].frame,1);assert.equal(state.fx[0].f,1);
  assert.equal(state.G._flashT,1);assert.equal(state.G._chromaT,2);
  assert.deepEqual(state.G._chainArcs,[{t:1,maxT:8}]);
  assert.ok(Math.abs(state.flash.a-.12)<1e-8);assert.equal(state.speedLines.active,1);
});

test('timestamp VFX follows physics time and cannot speed up at high refresh rates',async()=>{
  const {advancePresentation}=await load();
  const v={bornGameTime:100,frameTime:3,maxFrames:20,frame:0,t:0};
  const s={dt:.5,gameTime:200,step:1000/60,vfx:[v]};
  advancePresentation(s);advancePresentation(s);assert.equal(v.frame,2);
});

test('single renderer falls back once on failure and preserves native stage transitions',async()=>{
  const {renderFrame}=await load();let native=0,three=0,prepare=0;
  const draw=()=>native++,tick=()=>prepare++;
  renderFrame(null,draw,tick);assert.equal(native,1);assert.equal(prepare,0);
  renderFrame({render:()=>{three++;return true;}},draw,tick);
  assert.equal(native,1);assert.equal(three,1);assert.equal(prepare,1);
  renderFrame({render:()=>false},draw,tick);assert.equal(native,2);
});

test('loading snapshots tolerate empty enemy slots without mutating the Core array',async()=>{
  const {presentationActors}=await load();assert.equal(typeof presentationActors,'function');
  const enemy={alive:true,x:100,y:200},slots=[null,enemy,undefined];
  assert.deepEqual(presentationActors(slots),[enemy]);assert.equal(slots.length,3);assert.equal(slots[0],null);
});
