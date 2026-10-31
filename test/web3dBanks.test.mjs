import test from 'node:test';import assert from 'node:assert/strict';
test('visual banks close old tree sockets and preserve the open bridge channel',async()=>{
 const {shoreline,bankGeometry}=await import('../web3d/banks.mjs');
 for(let x=0;x<=80;x+=.5){assert.ok(shoreline(x,false)<55);assert.ok(shoreline(x,true)>65);}
 const g=bankGeometry(false,()=>0),p=g.attributes.position;
 assert.equal(g.index.count,120*64*6);assert.ok(Array.from(p.array).every(Number.isFinite));
 for(let i=0;i<p.count;i++)assert.ok(p.getY(i)>=.45-1e-6,'old tree sockets must remain grounded');
});
