import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import sharp from 'sharp';
const root=new URL('../assets/map/ch1/rootworld_candidate/',import.meta.url);
const file=n=>new URL(n,root).pathname.replace(/^\/(\w:)/,'$1');
test('candidate packing preserves the 8x8 world mapping without claiming new detail',async()=>{
  const m=JSON.parse(readFileSync(new URL('composition.json',root),'utf8'));
  assert.deepEqual(m.sourceSize,[1254,1254]);assert.equal(m.chunkSize,256);assert.equal(m.worldSize,8000);assert.equal(m.geometryChanged,false);
  for(let y=0;y<8;y++)for(let x=0;x<8;x++){
    const b=readFileSync(new URL(`chunk_${x}_${y}.png`,root));assert.equal(b.readUInt32BE(16),258);assert.equal(b.readUInt32BE(20),258);
  }
  const strip=(x,y,rect)=>sharp(file(`chunk_${x}_${y}.png`)).extract(rect).raw().toBuffer();
  for(let y=0;y<8;y++)for(let x=0;x<8;x++){
    if(x<7)assert.deepEqual(await strip(x,y,{left:257,top:1,width:1,height:256}),await strip(x+1,y,{left:1,top:1,width:1,height:256}));
    if(y<7)assert.deepEqual(await strip(x,y,{left:1,top:257,width:256,height:1}),await strip(x,y+1,{left:1,top:1,width:256,height:1}));
  }
});
