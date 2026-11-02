import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{createCanvas}=require('canvas');
test('native environment fallback is consumed before lighting instead of covering the forest later',async()=>{
 const url=new URL('../web3d/environment-overlay.mjs',import.meta.url);
 assert.ok(fs.existsSync(url),'environment overlay handoff is required');
 const {consumeEnvironmentOverlay}=await import(url);
 const frame=createCanvas(8,8),ctx=frame.getContext('2d'),overlay=createCanvas(8,8),paint=overlay.getContext('2d');
 ctx.fillStyle='#18242c';ctx.fillRect(0,0,8,8);paint.fillStyle='#806050';paint.fillRect(4,0,4,8);paint.translate(2,3);
 let atFlush;
 assert.equal(consumeEnvironmentOverlay(ctx,overlay,{x:0,y:0,w:8,h:8},()=>{atFlush=Array.from(paint.getImageData(6,4,1,1).data);}),true);
 assert.deepEqual(Array.from(ctx.getImageData(6,4,1,1).data),[128,96,80,255]);
 assert.deepEqual(Array.from(ctx.getImageData(1,4,1,1).data),[24,36,44,255]);
 assert.deepEqual(atFlush,[128,96,80,255],'GPU submission precedes overlay clearing');
 assert.equal(paint.getImageData(6,4,1,1).data[3],0,'late text overlay cannot repaint the old map');
 assert.equal(paint.getTransform().e,2);assert.equal(paint.getTransform().f,3);
 assert.equal(overlay._glVer,1);
 // New text/actor fallback drawn afterwards remains on the native top layer.
 paint.setTransform(1,0,0,1,0,0);paint.fillStyle='#e0d8c0';paint.fillRect(0,0,1,1);
 assert.equal(paint.getImageData(0,0,1,1).data[3],255);
 assert.equal(consumeEnvironmentOverlay(ctx,null,{x:0,y:0,w:8,h:8}),false);
});
