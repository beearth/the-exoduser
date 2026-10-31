import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const file=new URL('../web3d/remaster.mjs',import.meta.url);
test('2x artwork maps base, bat swing and dash cells without touching native animation frames',async()=>{
 assert.ok(fs.existsSync(file),'2x frame adapter is missing');const {remasterFrame}=await import(file);
 const frames=[{x:480,y:192,w:48,h:48},{x:640,y:864,w:80,h:80},{x:192,y:1216,w:64,h:64}];
 const original=structuredClone(frames);
 assert.deepEqual(frames.map(f=>remasterFrame(f,0)),[
  {id:'warrior-base',frame:{x:960,y:384,w:96,h:96}},
  {id:'warrior-attack',frame:{x:1280,y:960,w:160,h:160}},
  {id:'warrior-dash',frame:{x:384,y:384,w:128,h:128}}]);
 assert.deepEqual(frames,original);assert.equal(remasterFrame(frames[0],1),null);
 assert.equal(remasterFrame({x:0,y:2000,w:80,h:80},0),null);
});
