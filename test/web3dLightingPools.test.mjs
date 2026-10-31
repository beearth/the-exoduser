import test from 'node:test';
import assert from 'node:assert/strict';
test('cold ambient darkens unlit albedo while a local pool restores it above the original',async()=>{
 const {shadeEnvironment}=await import('../web3d/lighting-model.mjs');
 const art=[.22,.24,.20],ambient=[.26,.28,.36];
 const dark=shadeEnvironment(art,ambient,[0,0,0]);
 assert.ok(dark.every((v,i)=>v<art[i]*.5));
 const lit=shadeEnvironment(art,ambient,[1.6,1.1,.75]);
 assert.ok(lit.every((v,i)=>v>art[i]));
 assert.ok(lit[0]/dark[0]>5);
});
test('pool edge is smooth, finite, and strictly dark outside its radius',async()=>{
 const {poolFalloff}=await import('../web3d/lighting-model.mjs');
 assert.equal(poolFalloff(0),1);assert.equal(poolFalloff(1),0);assert.equal(poolFalloff(2),0);
 assert.ok(poolFalloff(.5)>poolFalloff(.8));assert.ok(poolFalloff(.999)<.00001);
});
