import test from 'node:test';import assert from 'node:assert/strict';
test('resizing an already uploaded canvas reallocates immutable GPU texture storage',async()=>{
 const {createFrameSampler}=await import('../web3d/frame-sampler.mjs');let id=0;
 const sampler=createFrameSampler(image=>({id:id++,image,dispose(){this.disposed=true;}})),frame={width:1920,height:1080};
 const a=sampler.update(frame);assert.equal(sampler.update(frame),a);frame.width=3840;const b=sampler.update(frame);assert.notEqual(b,a);assert.equal(a.disposed,true);assert.equal(b.image,frame);assert.equal(sampler.update(frame),b);frame.width=1920;assert.notEqual(sampler.update(frame),b);assert.equal(b.disposed,true);
});
