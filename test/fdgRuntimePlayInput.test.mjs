import test from 'node:test';
import assert from 'node:assert/strict';
import { FDGRuntime, FIXED_STEP } from '../engine/fdg/runtime.js';

class Events {
  listeners = new Map();
  addEventListener(type, fn) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(fn); }
  removeEventListener(type, fn) { this.listeners.get(type)?.delete(fn); }
  send(type, fields={}) { for (const fn of this.listeners.get(type)||[]) fn({preventDefault(){}, ...fields}); }
  count() { return [...this.listeners.values()].reduce((n,s)=>n+s.size,0); }
}
function project() {
  return {schemaVersion:1,id:'held-input-unit',name:'Owner input unit',map:{width:100,height:100,tileSize:40,tiles:Array(10000).fill(1),start:{x:50,y:50},exit:{x:50,y:2},objects:[]},characters:[{id:'unit',name:'unit',speed:156,radius:12,sprite:{src:'unit.png',frameWidth:16,frameHeight:16,columns:4,rows:1,frames:4,fps:8,scale:1,anchorX:.5,anchorY:1},animations:{idle:{row:0,start:0,frames:1,fps:8,loop:true},walk:{row:0,start:1,frames:3,fps:12,loop:true}}}],skills:[],vfx:[],preview:{characterId:'unit'}};
}
function owner() {
  const win=new Events(),doc=new Events(),canvas=new Events(),frames=new Map();let id=0;
  const ctx={globalAlpha:1};for(const k of ['setTransform','fillRect','beginPath','moveTo','lineTo','stroke','strokeRect','fillText','ellipse','fill','arc','drawImage','save','restore'])ctx[k]=()=>{};
  Object.assign(win,{devicePixelRatio:1,requestAnimationFrame(fn){frames.set(++id,fn);return id;},cancelAnimationFrame(n){frames.delete(n);},Image:class{naturalWidth=64;naturalHeight=16;set src(_){queueMicrotask(()=>this.onload?.());}}});doc.defaultView=win;
  Object.assign(canvas,{ownerDocument:doc,width:320,height:240,getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:320,height:240}),hasAttribute:()=>true,setAttribute(){},focus(){}});
  const runtime=new FDGRuntime(canvas,project());return {runtime,canvas,doc,win,frames,frame(ms){assert.equal(frames.size,1);const [n,fn]=frames.entries().next().value;frames.delete(n);fn(ms);}};
}
const near=(a,b)=>assert(Math.abs(a-b)<1e-7,`${a} != ${b}`);

test('held public direction is consumed by owner RAF; release stops displacement while clock continues',async()=>{
  const o=owner(),r=o.runtime;await r.load();assert.equal(r.setMoveInput('north'),false);assert.equal(r.setMoveInput({toString(){throw Error('no coercion');}}),false);r.start();const y=r.player.y;
  assert.equal(r.setMoveInput('north'),true);o.frame(0);o.frame(100);near(r.player.y,y-15.6);near(r.stats.time,.1);assert.equal(o.frames.size,1);
  r.setMoveInput(null);o.frame(200);near(r.player.y,y-15.6);near(r.stats.time,.2);assert.equal(r.moveInputDirection,null);r.dispose();
});

test('keyboard handoff, canvas/window blur, document hidden and input disabling release held movement',async()=>{
  const o=owner(),r=o.runtime;await r.load();r.start();r.setMoveInput('north');o.canvas.send('keydown',{code:'ArrowRight'});assert.equal(r.moveInputDirection,null);const x=r.player.x,y=r.player.y;o.frame(0);o.frame(100);near(r.player.x,x+15.6);near(r.player.y,y);
  o.canvas.send('keyup',{code:'ArrowRight'});for(const [target,event]of [[o.canvas,'blur'],[o.win,'blur'],[o.doc,'visibilitychange']]){r.setMoveInput('west');if(target===o.doc)o.doc.hidden=true;target.send(event);assert.equal(r.moveInputDirection,null);}o.doc.hidden=false;r.setMoveInput('south');r.setInputEnabled(false);assert.equal(r.moveInputDirection,null);assert.equal(r.setMoveInput('east'),false);r.dispose();
});

test('pause, one tick, resume, project replacement and disposal do not retain a held input or extra clock',async()=>{
  const o=owner(),r=o.runtime;await r.load();r.start();r.setMoveInput('east');o.frame(0);o.frame(100);r.pause();const pos=[r.player.x,r.player.y],time=r.stats.time;assert.equal(o.frames.size,0);assert.equal(r.setMoveInput('west'),false);r.step(FIXED_STEP);assert.deepEqual([r.player.x,r.player.y],pos);near(r.stats.time,time+FIXED_STEP);r.resume();assert.equal(r.moveInputDirection,null);r.setMoveInput('south');await r.setProject(project());assert.equal(r.state,'paused');assert.equal(r.moveInputDirection,null);assert.equal(o.frames.size,0);near(r.stats.time,0);r.start();assert.equal(o.frames.size,1);r.dispose();assert.equal(o.frames.size,0);assert.equal(o.canvas.count()+o.doc.count()+o.win.count(),0);assert.equal(r.setMoveInput('north'),false);
});

test('held movement keeps the existing fixed clock distance at 30 and 120 RAF cadence without changing clip FPS',async()=>{
  const positions=[];for(const fps of [30,120]){const o=owner(),r=o.runtime;await r.load();const clips=structuredClone(r.project.characters[0].animations),start=r.player.x;r.start();r.setMoveInput('east');o.frame(0);for(let i=1;i<=fps;i++)o.frame(i*1000/fps);positions.push(r.player.x-start);near(r.stats.time,1);assert.deepEqual(r.project.characters[0].animations,clips);r.dispose();}near(positions[0],156);near(positions[1],156);
});
