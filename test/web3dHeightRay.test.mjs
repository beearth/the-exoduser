import test from 'node:test';import assert from 'node:assert/strict';
test('pointer height-field intersection resolves flat and sloped ground without triangle traversal',async()=>{
 const {heightRay}=await import('../web3d/height-ray.mjs');
 const origin={x:0,y:10,z:0},direction={x:0,y:-Math.SQRT1_2,z:Math.SQRT1_2};
 const flat=heightRay(origin,direction,()=>.3,-1,2);assert.ok(Math.abs(flat.y-.3)<1e-6);assert.ok(Math.abs(flat.z-9.7)<1e-6);
 const slope=heightRay(origin,direction,(x,z)=>z*.1+.5,-1,2);assert.ok(Math.abs(slope.z-9.5/1.1)<1e-6);
 assert.deepEqual(origin,{x:0,y:10,z:0});assert.equal(heightRay(origin,{x:1,y:0,z:0},()=>0,-1,2),null);
});
