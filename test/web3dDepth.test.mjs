import test from 'node:test';
import assert from 'node:assert/strict';
import * as depth from '../web3d/depth-layout.mjs';

const tree={type:'m_ctree13',x:400,y:400,scale:1},meta={sz:400,occ:1,footYF:.45};
test('the volume uses the native root and never changes a map object',()=>{
 const saved=JSON.stringify(tree),v=depth.objectVolume(tree,meta);
 assert.equal(v.foot,580);assert.ok(v.top<400);assert.equal(JSON.stringify(tree),saved);
 assert.equal(depth.objectVolume({type:'pit_poison',x:0,y:0},{sz:700,keepAR:true}),null);
 for(const type of ['rock','wall','cliff','m_c1altar','m_c1tree'])assert.ok(depth.objectVolume({...tree,type},{sz:500,keepAR:true}),type);
});
test('both player and enemies behind the trunk fade only that object to 35 percent',()=>{
 const v=depth.objectVolume(tree,meta),behind={x:400,y:480,alive:true};
 assert.equal(depth.occlusion(v,[behind]).alpha,.35);
 assert.equal(depth.occlusion(v,[{...behind,y:640}]).alpha,1);
 assert.equal(depth.occlusion(v,[{...behind,x:1000}]).alpha,1);
 assert.equal(depth.occlusion(v,[{...behind,alive:false}]).alpha,1);
 assert.equal(depth.occlusion(v,[behind,{x:430,y:640}]).front.length,1);
});
test('ordered volumes use the foot rather than source centre, including ties',()=>{
 const a=depth.objectVolume(tree,meta),b=depth.objectVolume({...tree,y:490},{...meta,footYF:0});
 assert.deepEqual([a,b].sort(depth.compareDepth),[b,a]);
});
test('local shadow points away from the light and defaults southeast',()=>{
 assert.ok(depth.shadowVector([100,100],[0,0])[0]>0);
 assert.ok(depth.shadowVector([100,100],[200,200])[1]<0);
 assert.ok(depth.shadowVector([100,100],null).every(v=>v>0));
});
test('the top of an upright shadow projects away from a light on either side',()=>{
 for(const light of [[0,0],[200,200],[0,200],[200,0],[100,0],[100,200],[0,100],[200,100]]){
  const v=depth.shadowVector([100,100],light),a=depth.shadowAffine?.(v)||[1,0,0,0];
  const top=[a[2]*-100,a[3]*-100];assert.ok(top[0]*v[0]+top[1]*v[1]>0);assert.ok(Math.abs(a[0]*a[3]-a[1]*a[2])>.1,'shadow must retain a ground footprint');
 }
});
