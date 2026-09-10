import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
function setup(){
  let now=0,tick=null;
  class El extends EventTarget{
    constructor(){super();this.children=[];this.style={};this.currentTime=0;this.paused=true;}
    append(...x){this.children.push(...x);}setAttribute(){}removeAttribute(){}focus(){}remove(){}load(){}
    play(){this.paused=false;return Promise.resolve();}pause(){this.paused=true;}
  }
  const doc=new El();doc.createElement=()=>new El();doc.body=new El();doc.activeElement=new El();
  const win=new EventTarget();
  const ctx=vm.createContext({document:doc,window:win,console,Date:{now:()=>now},setTimeout,clearTimeout,setInterval:fn=>{tick=fn;return 1;},clearInterval:()=>{tick=null;}});
  vm.runInContext(fs.readFileSync(new URL('../character-story-player.js',import.meta.url),'utf8'),ctx);
  const api=ctx.ExoduserCharacterStory;const promise=api.play();
  return {api,promise,video:doc.body.children[0].children[0],doc,advanceMs(ms){now+=ms;if(tick)tick();}};
}
test('cinematic hides native player controls and follows the approved dialogue cues',()=>{
  const s=setup();assert.equal(s.video.controls,false);
  const caps=JSON.parse(fs.readFileSync(new URL('../output/cinematic/warintro_remaster_20260909/hell_drag_v21/captions.json',import.meta.url)));
  assert.deepEqual(Array.from(s.api.CUES),caps.map(c=>c.start_s));s.api.skip();
});
test('partial skip seeks the shared video/audio clock to the next spoken line',()=>{
  const s=setup();assert.equal(typeof s.api.next,'function');
  s.video.currentTime=59.55;s.api.next();assert.equal(s.video.currentTime,59.98);assert.equal(s.api.active,true);
  s.video.currentTime=88.5;s.api.next();assert.equal(s.video.currentTime,90.33333333333333);
  s.video.currentTime=92.95;s.api.next();assert.equal(s.api.active,false);
});
test('short hold cancels; full hold skips once and cleans up',async()=>{
  const s=setup();assert.equal(typeof s.api.setSkipHeld,'function');
  s.api.setSkipHeld(true,'keyboard');s.advanceMs(1000);assert.equal(s.api.active,true);
  s.api.setSkipHeld(false,'keyboard');s.advanceMs(2000);assert.equal(s.api.active,true);
  s.api.setSkipHeld(true,'keyboard');s.api.setSkipHeld(false,'gamepad');s.advanceMs(1200);
  assert.equal(await s.promise,true);assert.equal(s.api.active,false);assert.equal(s.video.paused,true);
});
