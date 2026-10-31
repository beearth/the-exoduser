import test from 'node:test';import assert from 'node:assert/strict';
test('painted forest stays behind an open corridor and fades before the player crosses it',async()=>{
 const {forestOpacity}=await import('../web3d/painted-forest.mjs');
 const layer={x:20,z:51,width:30,opacity:.55};
 assert.equal(forestOpacity(layer,20,51),0);
 assert.equal(forestOpacity(layer,34,52),0);
 assert.equal(forestOpacity(layer,40,64),.55);
 assert.ok(forestOpacity(layer,40,53)>0);
 assert.ok(forestOpacity(layer,37,53)<forestOpacity(layer,40,53));
});
