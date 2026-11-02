import test from 'node:test';
import assert from 'node:assert/strict';
test('unlit albedo remains readable while a local pool adds bounded exposure',async()=>{
 const {shadeEnvironment}=await import('../web3d/lighting-model.mjs');
 const art=[.22,.24,.20],ambient=[.26,.28,.36];
 const dark=shadeEnvironment(art,ambient,[0,0,0]);
 assert.deepEqual(dark,art,'native ambient remains the single darkness/color authority');
 const lit=shadeEnvironment(art,ambient,[1.6,1.1,.75]);
 assert.ok(lit.every((v,i)=>v>art[i]));
 assert.ok(lit[0]>dark[0]&&lit[0]<art[0]*1.25);
});
test('pool edge is smooth, finite, and strictly dark outside its radius',async()=>{
 const {poolFalloff}=await import('../web3d/lighting-model.mjs');
 assert.equal(poolFalloff(0),1);assert.equal(poolFalloff(1),0);assert.equal(poolFalloff(2),0);
 assert.ok(poolFalloff(.5)>poolFalloff(.8));assert.ok(poolFalloff(.999)<.00001);
});

test('camp tent receives local warm light without lifting the dark interspace',async()=>{
 const {presentationRadius,renderEnergy}=await import('../web3d/map-look-layout.mjs');const {poolFalloff}=await import('../web3d/lighting-model.mjs');
 assert.equal(typeof presentationRadius,'function');
 for(const row of [{id:'camp_fire',radius:640,energy:1.55,position:[0,0]}]){
 const r=presentationRadius(row);assert.ok(r>row.radius*1.1);assert.ok(renderEnergy(row,0)*poolFalloff(.65*row.radius/r)>row.energy*1.45*poolFalloff(.65)*1.6);assert.equal(poolFalloff(1.001),0);
 }
 assert.equal(presentationRadius({id:'player',radius:560}),560);
});

test('strong lights retain painted midtone folds and neutral material hue',async()=>{
 const {shadeEnvironment}=await import('../web3d/lighting-model.mjs');
 const a=shadeEnvironment([.35,.25,.15],[.26,.28,.36],[2.4,1.6,.5]),b=shadeEnvironment([.45,.35,.20],[.26,.28,.36],[2.4,1.6,.5]);
 assert.ok(b[0]-a[0]>.09&&b[0]<.9,'painted material retains contrast instead of an orange plate');
 const neutral=shadeEnvironment([.3,.3,.3],[0,0,0],[2.4,1.6,.5]);assert.equal(neutral[0],neutral[1]);assert.equal(neutral[1],neutral[2]);
});
