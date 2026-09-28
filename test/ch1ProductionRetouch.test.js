import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';

const helper = await import('../tools/ch1-production-retouch.mjs').catch(()=>({}));

test('rebaking keeps the approved skin patch and leaves protected pixels unchanged', async()=>{
 assert.equal(typeof helper.applyRetouchLayers,'function','rebake has no retouch preservation step');
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'ch1-retouch-'));
 try{
  const patch=Buffer.from([99,88,77,255,0,0,0,0,11,22,33,255,0,0,0,0]);
  await sharp(patch,{raw:{width:2,height:2,channels:4}}).png().toFile(path.join(dir,'skin.png'));
  const base=Buffer.alloc(4*4*4);for(let i=0;i<16;i++){base[i*4]=3;base[i*4+1]=4;base[i*4+2]=5;base[i*4+3]=255;}
  const result=await helper.applyRetouchLayers(base,4,4,dir,[{id:'skin65',file:'skin.png',x:1,y:1,width:2,height:2}]);
  assert.deepEqual([...result.subarray(20,24)],[99,88,77,255]);
  assert.deepEqual([...result.subarray(24,28)],[3,4,5,255],'protected hole must preserve current underlying art');
  assert.deepEqual([...result.subarray(36,40)],[11,22,33,255]);
  assert.deepEqual([...result.subarray(0,4)],[3,4,5,255],'outside patch must stay exact');
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});

test('the production builder applies preserved layers before deriving chunks',async()=>{
 const src=await fs.readFile(new URL('../tools/build_ch1_production_finish.mjs',import.meta.url),'utf8');
 assert.ok(src.includes('applyRetouchLayers'),'rebake currently erases approved retouch layers');
 assert.ok(src.indexOf('await applyRetouchLayers')<src.indexOf('for(let y=0;y<8;y++)for(let x=0;x<8;x++)'));
});
