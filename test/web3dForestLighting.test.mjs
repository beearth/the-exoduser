import test from 'node:test';import assert from 'node:assert/strict';
test('forest depth retains a cold fog floor after ambient dimming without washing away bark',async()=>{
 const {forestRadiance}=await import('../web3d/forest-lighting.mjs');
 const near=forestRadiance([.12,.11,.10],0,0),far=forestRadiance([.12,.11,.10],1,0),branch=forestRadiance([.3,.27,.24],1,.5);
 assert.ok(far[2]>far[0]);assert.ok(far[2]*.36>.025);
 assert.ok(branch[0]>far[0]);assert.notDeepEqual(near,far);assert.ok(Math.max(...branch)<.5);
});
test('the distant forest painting joins continuously at positive and negative tile boundaries',async()=>{
 const model=await import('../web3d/forest-lighting.mjs');
 assert.equal(typeof model.forestBackdropUV,'function','continuous forest backdrop coordinates required');
 for(const x of [-2900,-1450,0,1450,2900])for(const y of [-2100,0,2100,4200]){
  const a=model.forestBackdropUV(x-.001,y-.001),b=model.forestBackdropUV(x+.001,y+.001);
  assert.ok(Math.abs(a[0]-b[0])<.00001&&Math.abs(a[1]-b[1])<.00001,'visible world seam at '+x+','+y);
  assert.ok(a.every(v=>v>=0&&v<=1));
 }
});
