import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const load=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
test('authored region polygons, exclusion lanes and shallow reed habitat determine every plant',async()=>{
 const mod=await import('../web3d/foliage-layout.mjs');assert.equal(typeof mod.authoredFoliageLayout,'function','authored placement adapter required');
 const data=load('../assets/web3d/foliage-ch1.json'),before=JSON.stringify(data),hill={cx:147,cy:98,rx:18,ry:9,inner:.84,outer:1.04,rampX0:125,rampX1:135,rampY:98,rampHalf0:1.8,rampHalf1:3};
 const result=mod.authoredFoliageLayout(data,hill,40);assert.ok(data.regions.length>=8);assert.ok(result.length>300);
 assert.deepEqual(result,mod.authoredFoliageLayout(data,hill,40));assert.equal(JSON.stringify(data),before);
 for(const p of result){assert.ok(p.zone&&p.region);assert.ok(!data.exclusions.some(z=>mod.pointInPolygon(p.x,p.y,z.polygon)));if(p.wet)assert.equal(p.variant,0);}
 assert.ok(result.some(p=>p.variant===2));assert.ok(result.some(p=>p.variant===1));
});

test('puddle alpha/color masks exclude the deep center and keep only shallow reed margins',async()=>{
 const {puddleHabitat}=await import('../web3d/foliage-layout.mjs');assert.equal(typeof puddleHabitat,'function');
 const mask=new Uint8ClampedArray(64*64*4);for(let y=16;y<48;y++)for(let x=16;x<48;x++)mask.set([25,55,20,255],(y*64+x)*4);
 const w={x:100,y:100,w:256,h:256,flip:1,mask};assert.equal(puddleHabitat(100,100,w).deep,true);assert.equal(puddleHabitat(40,100,w).deep,false);assert.equal(puddleHabitat(40,100,w).wet,true);assert.equal(puddleHabitat(-50,100,w).shore,false);
});
