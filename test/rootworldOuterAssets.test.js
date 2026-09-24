import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import sharp from 'sharp';
const root=new URL('../assets/map/ch1/rootworld_outer/',import.meta.url);
const file=name=>new URL(name,root).pathname.replace(/^\/(\w:)/,'$1');
const manifest=JSON.parse(readFileSync(new URL('composition.json',root),'utf8'));
test('QA bake has 64 consistent RGBA chunks with a pixel of bleed',()=>{
  assert.equal(manifest.chunkCount,64);
  assert.equal(manifest.masterSize/manifest.chunkSize,8);
  assert.equal(manifest.worldSize,8000);
  for(let y=0;y<8;y++)for(let x=0;x<8;x++){
    const b=readFileSync(new URL(`chunk_${x}_${y}.png`,root));
    assert.equal(b.readUInt32BE(16),1026);
    assert.equal(b.readUInt32BE(20),1026);
    assert.equal(b[25],6);
  }
});
test('neighboring chunks share exact horizontal and vertical bleed pixels',async()=>{
  const strip=(x,y,rect)=>sharp(file(`chunk_${x}_${y}.png`)).extract(rect).raw().toBuffer();
  for(const[x,y]of[[2,5],[3,6],[5,2]]){
    assert.deepEqual(await strip(x,y,{left:1025,top:1,width:1,height:1024}),await strip(x+1,y,{left:1,top:1,width:1,height:1024}));
    assert.deepEqual(await strip(x,y,{left:1,top:1025,width:1024,height:1}),await strip(x,y+1,{left:1,top:1,width:1024,height:1}));
  }
});
test('primary playable centers and north gate remain transparent in the visual layer',async()=>{
  for(const[x,y]of[[100,181],[76,145],[112,108],[86,70],[151,82],[100,24],[100,5]]){
    const b=await sharp(file('master.png')).extract({left:Math.floor((x+.5)*8192/200),top:Math.floor((y+.5)*8192/200),width:1,height:1}).raw().toBuffer();
    assert.equal(b[3],0,`outer mass covers floor at ${x},${y}`);
  }
});
