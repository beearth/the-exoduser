import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
const src=readFileSync(new URL('./light-normal-observer.js',import.meta.url),'utf8');
function world(){
  let now=0,cb,id=0;const listeners=new Map();
  const c={G:{on:true,paused:false,kills:0},P:{hp:100,lv:1,x:0,y:0},ens:[{alive:true}],OPT:{quality:'high',atmos:1,fpsCap:0},C:{width:800,height:600},_useGL:true,_useGPU:false,
    performance:{now:()=>now,timeOrigin:1},location:{href:'http://qa.localhost:3340/game.html?webgpu=0'},navigator:{userAgent:'synthetic'},innerWidth:800,innerHeight:600,devicePixelRatio:1,
    document:{hidden:false,hasFocus:()=>true},requestAnimationFrame:f=>(cb=f,++id),cancelAnimationFrame:()=>{cb=null},setTimeout:()=>1,clearTimeout:()=>{},draw:function(x){if(x==='throw')throw Error('original');return this.value;},console};
  c.window=c;c.addEventListener=(k,f)=>listeners.set(k,f);c.removeEventListener=(k,f)=>{if(listeners.get(k)===f)listeners.delete(k)};c.document.addEventListener=c.addEventListener;c.document.removeEventListener=c.removeEventListener;
  vm.createContext(c);const original=c.draw;
  return {c,original,listeners,install:()=>vm.runInContext(src,c),step:(n=17)=>{now+=n;cb?.(now)},input:()=>listeners.get('keydown')({isTrusted:true,code:'KeyW',target:{tagName:'BODY'}})};
}
test('draw return/this/exception preserved and cleanup idempotent',()=>{const w=world();w.install();assert.equal(w.c.draw.call({value:42}),42);assert.throws(()=>w.c.draw('throw'),/original/);assert.equal(w.c.__lightNormalQA.draws.length,2);w.c.__lightNormalQA.stop();assert.equal(w.c.draw,w.original);assert.equal(w.listeners.size,0);w.c.__lightNormalQA.stop();});
test('quality transitions and first observed kill recorded without state writes',()=>{const w=world();w.install();w.input();w.step();w.c.OPT.atmos=2;w.c.G.kills=1;w.step();assert.equal(w.c.__lightNormalQA.events[0].options.atmos,2);assert.equal(w.c.__lightNormalQA.firstKill.kills,1);assert.equal(w.c.P.hp,100);w.c.P.hp=0;w.step();assert.equal(w.c.__lightNormalQA.reason,'natural-death-or-ended');assert.equal(w.c.draw,w.original);});
test('focus loss terminates and external wrapper is not overwritten',()=>{const w=world();w.install();w.input();const other=()=>7;w.c.draw=other;w.c.document.hasFocus=()=>false;w.step();assert.equal(w.c.__lightNormalQA.reason,'background-or-focus-loss');assert.equal(w.c.draw,other);assert.equal(w.c.__lightNormalQA.restored.draw,false);});
test('reinstall cleans old listeners; bounded storage records losses',()=>{const w=world();w.install();const old=w.c.__lightNormalQA;w.install();assert.equal(old.reason,'reinstall');for(let i=0;i<6005;i++)w.c.draw();assert.equal(w.c.__lightNormalQA.draws.length,6000);assert.equal(w.c.__lightNormalQA.dropped,5);w.c.__lightNormalQA.stop();assert.equal(w.c.draw,w.original);assert.equal(w.listeners.size,0);});
test('25 second input limit and pre-input kill remain distinguishable',()=>{const w=world();w.install();w.c.G.kills=1;w.step();const killAt=w.c.__lightNormalQA.firstKill.at;w.step();w.input();w.step(25001);assert.equal(w.c.__lightNormalQA.reason,'25s-after-input');assert.ok(killAt<w.c.__lightNormalQA.firstInput.at);});
