import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createCanvas} from 'canvas';
const file=new URL('../ch1-living-detail.js',import.meta.url);
const scope={document:{createElement:()=>createCanvas(320,320)}};
if(existsSync(file))vm.runInNewContext(readFileSync(file,'utf8'),scope);
const objects=[{type:'m_c1tree',x:320,y:260},{type:'m_c1pool',x:690,y:350}];
function render(stage,time,extra={}){
  assert.ok(scope.Ch1LivingDetail,'living environment renderer must exist');
  const canvas=createCanvas(1000,720),ctx=canvas.getContext('2d');
  const state={stage,cam:{x:500,y:360},...extra};
  const before=JSON.stringify({state,objects});
  scope.Ch1LivingDetail.draw(ctx,state,objects,time,1000,720);
  assert.equal(JSON.stringify({state,objects}),before,'rendering must not mutate collision/gameplay');
  return canvas.toBuffer('raw');
}
test('only production CH1 receives the living detail layer',()=>{
  for(const extra of [{stage:1},{_bossArena:true},{_fieldRebuildQA:true}])assert.ok(render(0,0,extra).every(v=>v===0));
  assert.ok(render(0,0).some(v=>v!==0));
});
test('local tissue moves over time without random frame flicker',()=>{
  assert.deepEqual(render(0,1400),render(0,1400));
  assert.notDeepEqual(render(0,1400),render(0,2800));
});
test('offscreen anchors do not draw or change canvas state',()=>{
  assert.ok(render(0,1400,{cam:{x:10000,y:10000}}).every(v=>v===0));
  const ctx=createCanvas(1000,720).getContext('2d');ctx.globalAlpha=.4;ctx.lineWidth=7;
  scope.Ch1LivingDetail.draw(ctx,{stage:0,cam:{x:500,y:360}},objects,1400,1000,720);
  assert.ok(Math.abs(ctx.globalAlpha-.4)<.01);assert.equal(ctx.lineWidth,7);
});
test('GPU proxy without bezierCurveTo can render the layer',()=>{
  const native=createCanvas(1000,720).getContext('2d');
  const proxy=new Proxy(native,{get(target,key){if(key==='bezierCurveTo')return undefined;const v=target[key];return typeof v==='function'?v.bind(target):v;},set(target,key,v){target[key]=v;return true;}});
  assert.doesNotThrow(()=>scope.Ch1LivingDetail.draw(proxy,{stage:0,cam:{x:500,y:360}},objects,1400,1000,720));
});
test('cocoon breath has bounded scaling and leaves other props still',()=>{
  const c=createCanvas(10,10).getContext('2d'),g={stage:0};
  assert.equal(scope.Ch1LivingDetail.deform(c,g,{type:'m_c1altar'},0),false);
  assert.equal(scope.Ch1LivingDetail.deform(c,{stage:1},{type:'m_c1cocoon'},0),false);
  for(let time=0;time<7000;time+=100){
    assert.equal(scope.Ch1LivingDetail.deform(c,g,{type:'m_c1cocoon',x:100,y:100},time),true);
    const m=c.getTransform();assert.ok(m.a>=.982&&m.a<=1.018);assert.ok(m.d>=.988&&m.d<=1.012);c.restore();
  }
});
test('trees visibly sway while their ground contact stays fixed',()=>{
  const c=createCanvas(10,10).getContext('2d'),o={type:'m_ctree1',x:100,y:100,scale:1},g={stage:0};
  assert.equal(scope.Ch1LivingDetail.deform(c,g,o,1600,{sz:400}),true);
  const m=c.getTransform(),foot={x:100,y:280};
  assert.ok(Math.abs(m.a*foot.x+m.c*foot.y+m.e-foot.x)<.001);
  assert.ok(Math.abs(m.b*foot.x+m.d*foot.y+m.f-foot.y)<.001);
  assert.ok(Math.abs(m.a*100+m.c*(-100)+m.e-100)>1,'canopy moves visibly');c.restore();
});
test('start clearing has authored living ground even without an object anchor',()=>{
  const canvas=createCanvas(1280,720),c=canvas.getContext('2d');c.translate(640-4020,360-7220);
  scope.Ch1LivingDetail.draw(c,{stage:0,cam:{x:4020,y:7220}},[],1600,1280,720);
  assert.ok(canvas.toBuffer('raw').some(v=>v!==0));
});
test('tree shadows preserve source alpha and do not leak into another stage',()=>{
  assert.equal(typeof scope.Ch1LivingDetail.shadows,'function');
  const source=createCanvas(80,100),s=source.getContext('2d');s.fillStyle='#fff';s.fillRect(30,10,20,90);
  const canvas=createCanvas(1000,720),c=canvas.getContext('2d'),o={type:'m_ctree1',x:400,y:200};
  const sprites={m_ctree1:source},meta={m_ctree1:{sz:400}};
  scope.Ch1LivingDetail.shadows(c,{stage:1,cam:{x:500,y:360}},[o],sprites,meta,0,1000,720);
  assert.ok(canvas.toBuffer('raw').every(v=>v===0));
  scope.Ch1LivingDetail.shadows(c,{stage:0,cam:{x:500,y:360}},[o],sprites,meta,0,1000,720);
  const raw=canvas.toBuffer('raw');assert.ok(raw.some(v=>v!==0));
  assert.ok(raw.filter(v=>v!==0).length<raw.length*.2,'no opaque rectangular shadow');
});
