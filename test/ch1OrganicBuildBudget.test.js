import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createCanvas,loadImage} from 'canvas';
const source=fs.readFileSync(new URL('../ch1-living-detail.js',import.meta.url),'utf8');
function runtime(async=true,timer=false){
 const queue=[];let clock=0,created=0;
 const scope={document:{createElement(){created++;return createCanvas(1,1);}},performance:{now:()=>clock++}};
 if(async){if(timer)scope.setTimeout=fn=>{queue.push(fn);};else scope.requestIdleCallback=fn=>{queue.push(fn);};}
 vm.runInNewContext(source,scope);
 return {scope,queue,get created(){return created;},drain(){let count=0;while(queue.length){assert.ok(count++<10000,'build must finish');queue.shift()({didTimeout:true,timeRemaining:()=>50});}return count;}};
}
const camp=await loadImage(new URL('../assets/map/ch1/collision/prop_camp.png',import.meta.url).pathname.replace(/^\/(\w:)/,'$1'));
const tree=await loadImage(new URL('../assets/map/ch1/collision/prop_corpsetree.png',import.meta.url).pathname.replace(/^\/(\w:)/,'$1'));
function frame(r,img,type,time=1600){const a=createCanvas(880,880),c=a.getContext('2d');c.globalAlpha=.8;
 const g={stage:0},o={type,x:440,y:440},meta={sz:600},before=JSON.stringify({g,o,meta});
 const used=r.scope.Ch1LivingDetail.organic(c,g,o,time,meta,img);
 assert.equal(JSON.stringify({g,o,meta}),before);assert.ok(Math.abs(c.globalAlpha-.8)<.01);
 return {used,raw:a.toBuffer('raw')};}
test('cold camp defers mesh generation and duplicate visible requests share one job',()=>{
 const r=runtime();assert.equal(frame(r,camp,'m_c1camp').used,false,'original sprite fallback while preparing');
 assert.equal(r.created,0,'draw must not create the expensive atlas');assert.equal(r.queue.length,1);
 for(let i=0;i<20;i++)assert.equal(frame(r,camp,'m_c1camp').used,false);
 assert.equal(r.queue.length,1);assert.ok(r.drain()>20,'work must span short callbacks');
 assert.equal(frame(r,camp,'m_c1camp').used,true);assert.equal(r.queue.length,0);
});
test('budgeted camp and tree finish with exactly the original animation pixels',()=>{
 for(const [img,type] of [[camp,'m_c1camp'],[tree,'m_c1tree']]){
  const r=runtime(),sync=runtime(false);frame(r,img,type);r.drain();
  for(const t of [0,1600,4800])assert.deepEqual(frame(r,img,type,t).raw,frame(sync,img,type,t).raw);
 }
});
test('timer fallback budgets work without idle callbacks and preserves image identity',()=>{
 const r=runtime(true,true);assert.equal(frame(r,camp,'m_c1camp').used,false);assert.ok(r.drain()>20);
 assert.equal(frame(r,camp,'m_c1camp').used,true);
 const second=createCanvas(880,663);second.getContext('2d').drawImage(camp,0,0);
 assert.equal(frame(r,second,'m_c1camp').used,false,'a different source needs its own cache');r.drain();assert.equal(frame(r,second,'m_c1camp').used,true);
});
test('inactive or unloaded props never enqueue work',()=>{
 const r=runtime(),c=createCanvas(10,10).getContext('2d'),o={type:'m_c1camp',x:0,y:0};
 for(const g of [{stage:1},{stage:0,_bossArena:true},{stage:0,_fieldRebuildQA:true}])assert.equal(r.scope.Ch1LivingDetail.organic(c,g,o,0,{sz:400},camp),false);
 assert.equal(r.scope.Ch1LivingDetail.organic(c,{stage:0},o,0,{sz:400},{complete:false,naturalWidth:0}),false);
 assert.equal(r.queue.length,0);assert.equal(r.created,0);
});
test('camp and tree use one scheduler, and a failed cache retains the source fallback',()=>{
 const r=runtime();frame(r,camp,'m_c1camp');frame(r,tree,'m_c1tree');assert.equal(r.queue.length,1);
 r.drain();assert.equal(frame(r,camp,'m_c1camp').used,true);assert.equal(frame(r,tree,'m_c1tree').used,true);
 const bad=runtime();bad.scope.document.createElement=()=>{throw Error('canvas unavailable');};
 assert.equal(frame(bad,camp,'m_c1camp').used,false);bad.drain();
 for(let i=0;i<3;i++)assert.equal(frame(bad,camp,'m_c1camp').used,false);
 assert.equal(bad.queue.length,0,'a failing source must not retry every frame');
});
