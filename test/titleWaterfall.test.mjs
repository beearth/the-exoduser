import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const scope={};vm.runInNewContext(fs.readFileSync(new URL('../title-signboard.js',import.meta.url),'utf8'),scope);
const api=scope.TitleSignboard;
test('low tier, atmosphere disabled and reduced motion disable title motion',()=>{
 assert.equal(typeof api.motionReason,'function');
 assert.equal(api.motionReason({tier:'C'}),'low-tier');
 assert.equal(api.motionReason({quality:'low'}),'low-tier');
 assert.equal(api.motionReason({reduce:true}),'reduced-motion');
 assert.equal(api.motionReason({atmos:0}),'atmosphere-off');
 assert.equal(api.motionReason({}),'motion');
});
test('flow travels down at a steady speed and the near fall is faster',()=>{
 assert.equal(typeof api.flowOffset,'function');
 const near=api.flowOffset(1,0),far=api.flowOffset(1,1);
 assert.ok(near>far&&far>0);
 assert.ok(Math.abs(api.flowOffset(1.1,0)-near-api.flowOffset(.1,0))<1e-9);
});
test('close C2 cover keeps both skulls and full close Silvertail in every ratio',()=>{
 for(const w of [1920,2560,3840]){
  const r=api.rect(w,1080);assert.equal(r.width/2036,r.height/1018);
  assert.ok(r.x<=0&&r.y<=0&&r.x+r.width>=w&&r.y+r.height>=1080);
  for(const [x,y] of [[875,300],[1054,365],[1368,269],[1335,745],[1520,745],[1597,775]]){
   assert.ok(r.x+x*r.scale>=0&&r.x+x*r.scale<=w);
   assert.ok(r.y+y*r.scale>=0&&r.y+y*r.scale<=1080);
  }
 }
});
