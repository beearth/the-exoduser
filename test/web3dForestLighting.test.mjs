import test from 'node:test';import assert from 'node:assert/strict';
test('forest depth retains a cold fog floor after ambient dimming without washing away bark',async()=>{
 const {forestRadiance}=await import('../web3d/forest-lighting.mjs');
 const near=forestRadiance([.12,.11,.10],0,0),far=forestRadiance([.12,.11,.10],1,0),branch=forestRadiance([.3,.27,.24],1,.5);
 assert.ok(far[2]>far[0]);assert.ok(far[2]*.36>.025);
 assert.ok(branch[0]>far[0]);assert.notDeepEqual(near,far);assert.ok(Math.max(...branch)<.5);
});
