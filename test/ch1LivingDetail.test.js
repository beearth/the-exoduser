import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createCanvas,loadImage} from 'canvas';
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
test('cocoon surface secretion animates locally and stays isolated from other stages',()=>{
  function surface(stage,time){
    const a=createCanvas(600,600),c=a.getContext('2d');c.globalAlpha=.7;
    scope.Ch1LivingDetail.draw(c,{stage,cam:{x:300,y:300}},[{type:'m_c1cocoon',x:300,y:250}],time,600,600,true);
    assert.ok(Math.abs(c.globalAlpha-.7)<.01);return a.toBuffer('raw');
  }
  assert.ok(surface(1,1200).every(v=>v===0));
  assert.ok(surface(0,1200).some(v=>v!==0));
  assert.deepEqual(surface(0,1200),surface(0,1200));
  assert.notDeepEqual(surface(0,1200),surface(0,3200));
});
test('authored poison pool contracts around its fixed center without changing gameplay data',()=>{
  const c=createCanvas(10,10).getContext('2d'),o={type:'m_c1pool',x:400,y:300,scale:1.55};
  const before=JSON.stringify(o);
  assert.equal(scope.Ch1LivingDetail.deform(c,{stage:1},o,1500),false);
  for(let time=0;time<7000;time+=200){
    assert.equal(scope.Ch1LivingDetail.deform(c,{stage:0},o,time),true);
    const m=c.getTransform();assert.ok(m.a>=.988&&m.a<=1.012);assert.ok(m.d>=.982&&m.d<=1.018);
    assert.ok(Math.abs(m.a*o.x+m.e-o.x)<.001);assert.ok(Math.abs(m.d*o.y+m.f-o.y)<.001);c.restore();
  }
  assert.equal(JSON.stringify(o),before);
});
test('duplicate toxic ground hides only at the authored pool and retains loading fallback',()=>{
  const g={stage:0},o={type:'m_c1gtoxic',x:6740,y:1620},loaded={m_c1pool:{complete:true,naturalWidth:800}};
  assert.equal(scope.Ch1LivingDetail.hideDuplicate(g,o,loaded),true);
  assert.equal(scope.Ch1LivingDetail.hideDuplicate({stage:1},o,loaded),false);
  assert.equal(scope.Ch1LivingDetail.hideDuplicate(g,o,{}),false);
  assert.equal(scope.Ch1LivingDetail.hideDuplicate(g,{...o,type:'m_c1gtoxicf'},loaded),false);
  assert.equal(scope.Ch1LivingDetail.hideDuplicate(g,{...o,x:100},loaded),false);
});
test('pool vapor rises locally above the surface and loops without a frame seam',()=>{
  function vapor(time){
    const a=createCanvas(600,600),c=a.getContext('2d');
    scope.Ch1LivingDetail.draw(c,{stage:0,cam:{x:300,y:300}},[{type:'m_c1pool',x:300,y:300}],time,600,600,true);
    return c.getImageData(200,140,200,110).data;
  }
  assert.ok(vapor(1200).some(v=>v!==0),'rising vapor must extend above the existing surface bubbles');
  assert.notDeepEqual(vapor(1200),vapor(3200));
  assert.deepEqual(vapor(1200),vapor(1200+Math.PI*2/.00095));
});
test('recessed pit replacement stays local, animated and gameplay-neutral',()=>{
  const o={type:'pit_poison',x:6500,y:5580,scale:1},before=JSON.stringify(o);
  function frame(time,g={stage:0},obj=o){
    const a=createCanvas(240,240),c=a.getContext('2d');c.translate(120-o.x,120-o.y);c.globalAlpha=.8;
    const used=scope.Ch1LivingDetail.pit(c,g,obj,time,{sz:200});
    assert.ok(Math.abs(c.globalAlpha-.8)<.01);return {used,raw:a.toBuffer('raw')};
  }
  assert.equal(typeof scope.Ch1LivingDetail.pit,'function');
  assert.equal(frame(0).used,true);assert.notDeepEqual(frame(0).raw,frame(2700).raw);
  for(const g of [{stage:1},{stage:0,_bossArena:true},{stage:0,_fieldRebuildQA:true}])assert.equal(frame(0,g).used,false);
  assert.equal(frame(0,{stage:0},{...o,x:100}).used,false);
  assert.equal(JSON.stringify(o),before);
});
test('raised cocoon and pod cast alpha-shaped shadows while flat props remain clear',()=>{
  const source=createCanvas(80,100),s=source.getContext('2d');s.fillStyle='#fff';s.fillRect(25,15,30,75);
  for(const type of ['m_c1cocoon','m_c1spod']){
    const a=createCanvas(700,500),c=a.getContext('2d'),o={type,x:240,y:190,scale:1},before=JSON.stringify(o);
    const sprites={[type]:source},meta={[type]:{sz:280}};
    scope.Ch1LivingDetail.shadows(c,{stage:1,cam:{x:350,y:250}},[o],sprites,meta,0,700,500);
    assert.ok(a.toBuffer('raw').every(v=>v===0));
    scope.Ch1LivingDetail.shadows(c,{stage:0,cam:{x:350,y:250}},[o],sprites,meta,0,700,500);
    assert.ok(a.toBuffer('raw').some(v=>v!==0));
    assert.equal(JSON.stringify(o),before);
  }
  const a=createCanvas(700,500),c=a.getContext('2d');
  scope.Ch1LivingDetail.shadows(c,{stage:0,cam:{x:350,y:250}},[{type:'m_c1pool',x:240,y:190}],{m_c1pool:source},{m_c1pool:{sz:300}},0,700,500);
  assert.ok(a.toBuffer('raw').every(v=>v===0));
});
test('giant tree roots have a local ground-contact shadow above the foot, without a rectangular stain',()=>{
  const source=createCanvas(100,100),s=source.getContext('2d');s.fillStyle='#fff';s.fillRect(35,72,30,28);
  const a=createCanvas(600,500),c=a.getContext('2d'),o={type:'m_c1tree',x:300,y:180,_hand:true};
  const state={stage:0,cam:{x:300,y:250}},before=JSON.stringify(o);
  scope.Ch1LivingDetail.shadows(c,state,[o],{m_c1tree:source},{m_c1tree:{sz:400}},0,600,500);
  assert.ok(c.getImageData(292,237,16,12).data.some((v,i)=>i%4===3&&v>8),'root contact must extend just above the fixed foot');
  assert.ok(c.getImageData(120,228,20,10).data.every(v=>v===0),'transparent source margins must not create a box');
  assert.equal(JSON.stringify(o),before);
});
test('organic sprite motion keeps camp crates and the tree trunk attached and still',()=>{
  const source=createCanvas(256,256),s=source.getContext('2d');
  for(let x=0;x<256;x+=4){s.fillStyle=x%8?'#935547':'#42382b';s.fillRect(x,0,4,256);}
  for(const type of ['m_c1tree','m_c1camp']){
    function frame(time,stage=0){
      const a=createCanvas(256,256),c=a.getContext('2d');
      const used=scope.Ch1LivingDetail.organic(c,{stage},{type,x:128,y:128},time,{sz:256},source);
      return {a,c,used};
    }
    assert.equal(frame(0,1).used,false);
    const first=frame(0),second=frame(2800);assert.equal(first.used,true);
    assert.notDeepEqual(first.a.toBuffer('raw'),second.a.toBuffer('raw'));
    for(const [x,y] of type==='m_c1tree'?[[128,90],[128,160]]:[[220,145],[158,205]]){
      const p=first.c.getImageData(x,y,1,1).data,q=second.c.getImageData(x,y,1,1).data;
      for(let k=0;k<3;k++)assert.ok(Math.abs(p[k]-q[k])<3,'rigid material must retain its source pixel');
      assert.equal(p[3],q[3],'static surfaces must not fade during the blend');
    }
  }
});
test('hanging tree cocoons and corpse swing independently of the solid trunk',async()=>{
  const source=await loadImage(new URL('../assets/map/ch1/collision/prop_corpsetree.png',import.meta.url).pathname.replace(/^\/(\w:)/,'$1'));
  function frame(time){const a=createCanvas(1143,1400),c=a.getContext('2d');scope.Ch1LivingDetail.organic(c,{stage:0},{type:'m_c1tree',x:571.5,y:700},time,{sz:1400},source);return c;}
  const a=frame(0),b=frame(1800);
  for(const rect of [[90,630,110,235],[277,640,70,140],[967,458,111,171]])assert.notDeepEqual(a.getImageData(...rect).data,b.getImageData(...rect).data,'hanging silhouette must visibly change');
  assert.deepEqual(a.getImageData(450,410,140,180).data,b.getImageData(450,410,140,180).data,'solid trunk stays still');
});
test('right hanging corpse moves below a fixed branch without changing its source',async()=>{
  const source=await loadImage(new URL('../assets/map/ch1/collision/prop_corpsetree.png',import.meta.url).pathname.replace(/^\/(\w:)/,'$1'));
  const frames=[0,1700,3400].map(time=>{
    const a=createCanvas(1143,1400),c=a.getContext('2d');
    scope.Ch1LivingDetail.organic(c,{stage:0},{type:'m_c1tree',x:571.5,y:700},time,{sz:1400},source);
    return c;
  });
  assert.notDeepEqual(frames[0].getImageData(904,490,30,115).data,frames[1].getImageData(904,490,30,115).data,'right corpse silhouette must sway');
  for(const c of frames.slice(1))assert.deepEqual(c.getImageData(895,350,40,50).data,frames[0].getImageData(895,350,40,50).data,'supporting branch must remain rigid');
});
test('giant tree root tips lift while their trunk attachment remains fixed',()=>{
  const source=createCanvas(400,500),s=source.getContext('2d');
  s.fillStyle='#fff';s.fillRect(34,394,10,10);s.fillStyle='#f00';s.fillRect(196,245,8,10);
  const tipYs=[];
  for(const time of [0,1400,2800,4200,5600]){
    const a=createCanvas(500,500),c=a.getContext('2d');
    scope.Ch1LivingDetail.organic(c,{stage:0},{type:'m_c1tree',x:250,y:250},time,{sz:500},source);
    const pixels=c.getImageData(0,0,500,500).data;let sum=0,count=0;
    for(let y=340;y<450;y++)for(let x=40;x<150;x++){const i=(y*500+x)*4;if(pixels[i+1]>150&&pixels[i+3]>100){sum+=y;count++;}}
    assert.ok(count>10,'root material must remain visible');tipYs.push(sum/count);
    assert.deepEqual([...c.getImageData(250,250,1,1).data],[255,0,0,255],'trunk attachment is fixed');
  }
  assert.ok(Math.max(...tipYs)-Math.min(...tipYs)>4,'root tip must lift, not just smear sideways');
});
test('camp corpse hands grip at the fingers while the firepit and forearms stay still',async()=>{
  const source=await loadImage(new URL('../assets/map/ch1/collision/prop_camp.png',import.meta.url).pathname.replace(/^\/(\w:)/,'$1'));
  function frame(time){
    const a=createCanvas(880,663),c=a.getContext('2d');
    scope.Ch1LivingDetail.organic(c,{stage:0},{type:'m_c1camp',x:440,y:331.5},time,{sz:880},source);
    return c;
  }
  const a=frame(0),b=frame(1800);
  for(const [x,y,w,h] of [[413,510,38,30],[580,550,43,34],[580,383,37,30]]){
    assert.notDeepEqual(a.getImageData(x,y,w,h).data,b.getImageData(x,y,w,h).data,'the actual fingers must change pose');
  }
  for(const [x,y,w,h] of [[464,483,49,20],[558,489,23,30],[475,413,56,64],[600,275,90,70]]){
    assert.deepEqual(a.getImageData(x,y,w,h).data,b.getImageData(x,y,w,h).data,'forearms, spikes and crates must not undulate');
  }
});
