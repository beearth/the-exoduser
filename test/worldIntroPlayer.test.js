import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';

function load(){
  const file=new URL('../world-intro-player.js',import.meta.url);
  assert.ok(existsSync(file),'world intro playback controller must exist');
  const context={setInterval,clearInterval};vm.createContext(context);vm.runInContext(readFileSync(file,'utf8'),context);
  return context.WorldIntroPlayer;
}
class Media extends EventTarget {
  currentTime=0;duration=113.292;volume=1;paused=true;muted=true;loop=false;
  play(){const wasPaused=this.paused;this.paused=false;if(wasPaused)this.dispatchEvent(new Event('playing'));return Promise.resolve();}
  pause(){this.paused=true;this.dispatchEvent(new Event('pause'));}
}
test('door BGM continues without pause or rewind and ducks smoothly for narration',async(t)=>{
  const api=load(),video=new Media(),music=new Media();music.duration=180;music.currentTime=8;music.volume=.6;
  await music.play();let pauses=0;music.addEventListener('pause',()=>pauses++);
  const p=api.create({video,getMusic:()=>music});t.after(()=>p.stop());await p.start();
  assert.equal(video.muted,false);assert.equal(video.volume,1);
  assert.equal(music.currentTime,8);assert.equal(music.paused,false);assert.equal(pauses,0);
  assert.equal(music.volume,.6);
  await new Promise(resolve=>setTimeout(resolve,300));
  assert.ok(music.volume>.22&&music.volume<.6);
  await new Promise(resolve=>setTimeout(resolve,850));
  assert.equal(music.volume,.22);assert.equal(pauses,0);
});
test('buffering and seeking keep score continuous; explicit pause stops it',async(t)=>{
  const video=new Media(),music=new Media(),p=load().create({video,getMusic:()=>music});
  t.after(()=>p.stop());
  await p.start();video.currentTime=78;video.dispatchEvent(new Event('seeking'));
  assert.equal(music.currentTime,0);assert.equal(music.paused,false);
  video.dispatchEvent(new Event('playing'));assert.equal(music.paused,false);
  video.dispatchEvent(new Event('waiting'));assert.equal(music.paused,false);
  video.dispatchEvent(new Event('timeupdate'));assert.equal(music.currentTime,0);
  video.pause();assert.equal(music.paused,true);p.stop();
});
test('next skips shots without seeking the continuous score',async(t)=>{
  const video=new Media(),music=new Media(),p=load().create({video,getMusic:()=>music});
  t.after(()=>p.stop());music.currentTime=8;
  await p.start();video.currentTime=77;p.next();assert.ok(Math.abs(video.currentTime-78.041667)<.001);
  assert.equal(music.currentTime,8);assert.equal(music.paused,false);p.stop();
});
test('stop detaches listeners and prevents late playback after leaving cinematic',async()=>{
  const video=new Media(),music=new Media();let ended=0;
  const p=load().create({video,getMusic:()=>music,onEnded:()=>ended++});await p.start();p.stop();
  video.dispatchEvent(new Event('playing'));video.dispatchEvent(new Event('ended'));
  assert.equal(music.paused,true);assert.equal(video.paused,true);assert.equal(ended,0);
});
test('natural end calls completion once and pauses BGM',async()=>{
  const video=new Media(),music=new Media();let ended=0;
  const p=load().create({video,getMusic:()=>music,onEnded:()=>ended++});await p.start();
  video.dispatchEvent(new Event('ended'));video.dispatchEvent(new Event('ended'));
  assert.equal(ended,1);assert.equal(music.paused,true);
});
test('lobby wires the metal title movie and bypasses old still-image narration',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.match(html,/id="worldIntroVideo"/);
  assert.ok(html.includes('video/world_intro_v13_exodus_en.mp4'),'lobby must preserve the full ending with a continuous new voice take');
  assert.match(html,/_cinReady=true;startWorldIntro\(\);/);
  assert.match(html,/if\(_worldIntroPlayer\)\{_worldIntroPlayer\.next\(\);return;\}/);
});
test('the full last scene ends at the original logo boundary without seeking the score',async(t)=>{
  const api=load(),video=new Media(),music=new Media();video.duration=113.291667;
  assert.equal(api.CUTS.at(-1),109.291667);
  const p=api.create({video,getMusic:()=>music});t.after(()=>p.stop());await p.start();
  video.currentTime=105.5;music.currentTime=50;p.next();
  assert.equal(video.currentTime,109.291667);assert.equal(music.currentTime,50);assert.equal(music.paused,false);
});
test('the cruelly line has its own short gate cut boundary',()=>{
  assert.ok(load().CUTS.includes(12.75),'gate cut starts at frame 306');
});
test('next separates psychic and mage demon duels without touching the score',async(t)=>{
  const api=load(),video=new Media(),music=new Media();
  assert.ok(api.CUTS.includes(87.791667),'mage cut follows exactly three seconds of psychic footage');
  const p=api.create({video,getMusic:()=>music});t.after(()=>p.stop());
  music.currentTime=40;await p.start();video.currentTime=86;p.next();
  assert.equal(video.currentTime,87.791667);assert.equal(music.currentTime,40);assert.equal(music.paused,false);
  p.next();assert.equal(video.currentTime,90.791667);
});
test('retry start unlocks blocked BGM without resetting either media clock',async(t)=>{
  const video=new Media(),music=new Media();let blocked=true,errors=0;
  music.play=()=>{if(blocked)return Promise.reject(new Error('blocked'));music.paused=false;return Promise.resolve();};
  const p=load().create({video,getMusic:()=>music,onError:()=>errors++});
  t.after(()=>p.stop());music.currentTime=8;
  await p.start();await Promise.resolve();assert.equal(errors,1);
  video.currentTime=35;blocked=false;await p.start();
  assert.equal(video.currentTime,35);assert.equal(music.currentTime,8);assert.equal(music.paused,false);p.stop();
});
test('score loops independently and manual mix cancels the transition fade',async(t)=>{
  const video=new Media(),music=new Media();music.duration=30;
  const p=load().create({video,getMusic:()=>music});t.after(()=>p.stop());await p.start();
  video.currentTime=78;video.dispatchEvent(new Event('seeking'));
  assert.equal(music.currentTime,0);assert.equal(music.loop,true);p.setVolumes(2,-1);
  assert.equal(video.volume,1);assert.equal(music.volume,0);
  p.setVolumes(NaN,NaN);assert.equal(music.volume,0);
  await new Promise(resolve=>setTimeout(resolve,150));assert.equal(music.volume,0);p.stop();
});
test('initial movie loading does not pause the music already playing at the door',async(t)=>{
  const video=new Media(),music=new Media();music.currentTime=8;await music.play();
  video.play=()=>Promise.resolve();
  const p=load().create({video,getMusic:()=>music});t.after(()=>p.stop());await p.start();
  video.dispatchEvent(new Event('waiting'));video.dispatchEvent(new Event('seeking'));
  assert.equal(music.paused,false);assert.equal(music.currentTime,8);
});
