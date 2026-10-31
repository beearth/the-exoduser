import test from 'node:test';import assert from 'node:assert/strict';
test('partial walk overlay expands the remastered body bounds without replacing its body',async()=>{
 const {compositeBounds}=await import('../web3d/walk-composite.mjs');
 const body={x:1024,y:512,w:512,h:512},walk={x:2048,y:256,w:256,h:256};
 const a={x:1124,y:612,w:200,h:300},b={x:2088,y:296,w:160,h:180};
 assert.deepEqual(compositeBounds(body,a,walk,b),{x:1104,y:592,w:320,h:360});
 assert.deepEqual(a,{x:1124,y:612,w:200,h:300});
});
