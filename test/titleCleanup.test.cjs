const test=require('node:test'),assert=require('node:assert/strict');
const cleanup=require('../tools/title-cleanup.cjs');
test('isolated bright dots disappear while continuous material edges survive',()=>{
 const w=40,h=30,b=Buffer.alloc(w*h*3,30);
 for(let y=2;y<28;y++)for(let c=0;c<3;c++)b[(y*w+25)*3+c]=180;
 for(const [x,y]of [[8,8],[12,18]])for(let c=0;c<3;c++)b[(y*w+x)*3+c]=180;
 const r=cleanup.removeSpeckles(b,w,h);
 assert.equal(r.data[(8*w+8)*3],30);assert.equal(r.data[(18*w+12)*3],30);
 assert.equal(r.data[(15*w+25)*3],180);assert.equal(r.components,2);
});
test('a whole character and 40px margin never samples video at any loop time',()=>{
 for(let y=430;y<1490;y+=20)for(let x=2390;x<3530;x+=20)assert.equal(cleanup.videoWeight(x,y),0);
 for(const t of [0,1,4,8.583333]){
  assert.deepEqual(cleanup.displacement(2570,600,t),[0,0]);
  assert.deepEqual(cleanup.displacement(2650,1410,t),[0,0]);
  const p=cleanup.displacement(3080,730,t),q=cleanup.displacement(3080,730,t+206/24);
  assert.ok(Math.abs(p[0]-q[0])<1e-9);assert.ok(Math.abs(p[0])<=2.5);
 }
});

test('expanding a white repair mask leaves distant protected pixels black',async()=>{
 assert.equal(typeof cleanup.expandWhiteMask,'function');const b=Buffer.alloc(25*25);b[12*25+12]=255;
 const r=await cleanup.expandWhiteMask(b,25,25,3,0);
 assert.equal(r[0],0);assert.equal(r[12*25+12],255);assert.equal(r[12*25+10],255);
});

test('rotary hub, descending blade and body stay fixed while hair and cape tips move',()=>{
 for(const t of [0,.5,2,4,7,10]) {
  for(const [x,y] of [[2690,640],[2740,750],[2800,920],[2875,1100],[2955,1310],[2650,1410]])
   assert.deepEqual(cleanup.displacement(x,y,t),[0,0],`fixed equipment ${x},${y}`);
 }
 assert.ok(Math.hypot(...cleanup.displacement(3180,750,1))>.5);
 assert.ok(Math.max(...[0,1,2,3].map(t=>Math.hypot(...cleanup.displacement(3230,1100,t))))>.5);
});
