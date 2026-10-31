import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';
test('precomputed alpha bounds are coupled to the exact current atlas bytes',()=>{
 const metadata=JSON.parse(fs.readFileSync(new URL('../assets/web3d/frame-bounds.json',import.meta.url)));
 assert.ok(Object.keys(metadata.images).length>=29);
 for(const [path,image]of Object.entries(metadata.images)){
  const bytes=fs.readFileSync(new URL('../'+path,import.meta.url));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),image.sha256,path);
  for(const [key,b]of Object.entries(image.frames)){const [x,y,w,h]=key.split(':').map(Number);assert.ok(b.x>=x&&b.y>=y&&b.x+b.w<=x+w&&b.y+b.h<=y+h,path+':'+key);}
 }
});
