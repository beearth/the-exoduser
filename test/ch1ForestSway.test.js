import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../ch1-forest-sway.js',import.meta.url),'utf8');
function harness(){
  const idle=[];
  const contexts=[];
  const makeContext=()=>({
    draws:[],save(){},restore(){},drawImage(...args){this.draws.push(args)},
    createImageData(w,h){return{width:w,height:h,data:new Uint8ClampedArray(w*h*4)}},
    putImageData(pixels){this.pixels=pixels},
  });
  const sandbox={
    document:{createElement(){const context=makeContext(),canvas={width:0,height:0,getContext(){return context}};contexts.push(context);return canvas}},
    performance:{now:()=>0},requestIdleCallback(callback){idle.push(callback)},
    console:{warn(message){throw Error(message)}},
  };
  sandbox.globalThis=sandbox;
  vm.runInNewContext(source,sandbox,{filename:'ch1-forest-sway.js'});
  const drain=()=>{for(let n=0;idle.length&&n<100;n++)idle.shift()({timeRemaining:()=>10});assert.equal(idle.length,0,'idle work must finish')};
  return{forest:sandbox.Ch1ForestSway,makeContext,contexts,drain};
}
const cache={'0,0':{status:'ready',img:{complete:true,naturalWidth:1026}}};
const forestMap=()=>{
  const map=Array.from({length:200},()=>new Uint8Array(200).fill(1));
  for(let y=0;y<200;y++)map[y][12]=0;
  return map;
};

test('CH1-1 baked forest sways slowly while keeping other stages and fallback backgrounds static',()=>{
  const h=harness(),c=h.makeContext(),g={stage:0,map:forestMap(),cam:{x:500,y:500},_camZoom:1};
  const draw=(time,sourceRoot='assets/map/ch1/production_finish')=>h.forest.draw(c,g,time,cache,['0,0'],1000,sourceRoot,1000,1000);
  assert.equal(draw(0),0,'first view queues an overlay without blocking the frame');
  h.drain();
  assert.equal(draw(0),1);
  assert.equal(c.draws.length,8,'one visible forest chunk uses eight narrow strips');
  const first=c.draws.map(args=>args[5]);
  assert.equal(draw(4000),1);
  const second=c.draws.slice(8).map(args=>args[5]);
  assert.ok(first.some((x,i)=>Math.abs(x-second[i])>1),'background pixels must actually move over time');
  assert.ok([...first,...second].every(x=>Math.abs(x)<5.01),'sway remains below five world pixels');
  const baseline=c.draws.length;
  g.stage=1;assert.equal(draw(5000),0);
  g.stage=0;g._bossArena=true;assert.equal(draw(5000),0);
  g._bossArena=false;assert.equal(draw(5000,'assets/map/ch1/baked_start_outer'),0);
  assert.equal(c.draws.length,baseline,'other stages, boss rooms and comparison art stay untouched');
});

test('forest overlay mask leaves the combat floor transparent',()=>{
  const h=harness(),c=h.makeContext(),g={stage:0,map:forestMap(),cam:{x:500,y:500},_camZoom:1};
  h.forest.draw(c,g,0,cache,['0,0'],1000,'assets/map/ch1/production_finish',1000,1000);
  h.drain();
  const pixels=h.contexts.find(context=>context.pixels)?.pixels;
  assert.ok(pixels,'mask should be prepared off the render frame');
  const alpha=(x,y)=>pixels.data[(y*64+x)*4+3];
  assert.equal(alpha(31,32),0,'walkable tile band stays fixed');
  assert.ok(alpha(10,32)>0,'forest behind the path receives motion');
  assert.equal(alpha(0,32),0,'left chunk edge stays static when the overlay shifts');
  assert.equal(alpha(10,0),0,'top chunk edge stays static when the overlay shifts');
  assert.ok(alpha(10,2)<alpha(10,6),'forest motion fades in away from the chunk edge');
  assert.equal(alpha(63,32),0,'deep background outside the near-forest band stays fixed');
  assert.equal(h.forest.qa().pending,0);
});
