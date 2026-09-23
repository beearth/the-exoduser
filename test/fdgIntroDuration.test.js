import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('matches the FDG intro transition to the trimmed three-point-two-second video', () => {
  assert.match(indexHtml, /const FDG_DUR=3200;/);
});

function fdgHarness(){
  const source=indexHtml.slice(indexHtml.indexOf('  const FDG_DUR=3200;'),indexHtml.indexOf('  // ── 시퀀스 제어'));
  const events={},timers=new Map();let clock=0,id=0,advanced=0;
  const video={currentTime:0,paused:true,play(){this.paused=false;return Promise.resolve();},pause(){this.paused=true;},addEventListener(n,fn){events[n]=fn;},style:{}};
  const classes=new Set(),element={style:{},classList:{add(...a){a.forEach(x=>classes.add(x));},remove(...a){a.forEach(x=>classes.delete(x));}},innerHTML:''};
  const sandbox={done:false,phase:1,document:{hidden:false,getElementById:id=>id==='fdgIntroVideo'?video:element,addEventListener(){}},requestAnimationFrame:fn=>fn(),console:{log(){}},setTimeout(fn,ms){timers.set(++id,{fn,at:clock+ms});return id;},clearTimeout:i=>timers.delete(i),nextPhase(){advanced++;sandbox.phase=2;}};
  vm.runInNewContext(source+'\nshowFDGScreen();',sandbox);
  return {video,classes,hide:()=>vm.runInNewContext('hideFDGScreen()',sandbox),emit:n=>events[n]?.(),get advanced(){return advanced;},tick(ms){clock+=ms;for(const [i,t] of [...timers])if(t.at<=clock){timers.delete(i);t.fn();}}};
}

test('slow FDG loading does not consume its visible playback duration',()=>{
  const h=fdgHarness();h.tick(5000);
  assert.equal(h.advanced,0,'Loading must not skip the studio logo');
  h.video.currentTime=1.5;h.emit('timeupdate');assert.equal(h.advanced,0);
  h.video.currentTime=3.2;h.emit('timeupdate');assert.equal(h.advanced,1);
});

test('a failed FDG video shows the studio artwork for a full duration',()=>{
  const h=fdgHarness();h.emit('error');
  assert.ok(h.classes.has('fdg-fallback'));
  h.tick(3100);assert.equal(h.advanced,0);
  h.tick(100);assert.equal(h.advanced,1);
});

test('stalled loading falls back once and late video events cannot shorten the logo',()=>{
  const h=fdgHarness();h.tick(12000);
  assert.ok(h.classes.has('fdg-fallback'));
  h.video.currentTime=3.2;h.emit('timeupdate');h.emit('ended');
  assert.equal(h.advanced,0);
  h.tick(3200);h.emit('error');h.tick(3200);assert.equal(h.advanced,1);
});

test('manual skip cancels pending logo work',()=>{
  const h=fdgHarness();h.hide();h.emit('error');h.emit('ended');h.tick(20000);
  assert.equal(h.advanced,0);
  assert.ok(!h.classes.has('fdg-fallback'));
});
