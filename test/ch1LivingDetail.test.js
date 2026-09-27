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
test('regional skin integrates side clearings with stable feathered ground and no surface-pass overdraw',()=>{
  for(const [tx,ty] of [[49,151],[151,136],[100,120]]){
    function frame(time,extra={},surface=false){
      const canvas=createCanvas(1280,880),c=canvas.getContext('2d');
      const g={stage:0,cam:{x:(tx+.5)*40,y:(ty+.5)*40},...extra};
      c.translate(640-g.cam.x,440-g.cam.y);c.globalAlpha=.8;
      const before=JSON.stringify(g);
      scope.Ch1LivingDetail.draw(c,g,[],time,1280,880,surface);
      assert.equal(JSON.stringify(g),before);assert.ok(Math.abs(c.globalAlpha-.8)<.01);
      return c.getImageData(520,350,160,100).data;
    }
    const pixels=frame(1200);
    assert.ok(pixels.some((v,i)=>i%4===3&&v>30),'regional clearing needs a readable skin transition');
    assert.deepEqual(pixels,frame(3200),'regional material must not flicker or pulse across the whole clearing');
    for(const extra of [{stage:1},{_bossArena:true},{_fieldRebuildQA:true}])assert.ok(frame(1200,extra).every(v=>v===0));
    assert.ok(frame(1200,{},true).every(v=>v===0),'ground must stay below props and combat');
  }
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
test('eastern toxic ground softens only its contaminated rim and preserves source, interior and fallback',()=>{
  assert.equal(typeof scope.Ch1LivingDetail.groundSprite,'function');
  const src=createCanvas(160,120),c=src.getContext('2d');
  c.fillStyle='#854876';c.fillRect(10,10,140,100);
  c.fillStyle='#47562c';c.fillRect(36,36,88,48);
  const original=src.toBuffer('raw'),o={type:'m_c1gtoxicf',x:6500,y:5460},meta={sz:450,keepAR:1,flip:1};
  const before=JSON.stringify({o,meta}),fn=scope.Ch1LivingDetail.groundSprite;
  const out=fn({stage:0},o,meta,src);assert.notEqual(out,src);
  assert.equal(fn({stage:0},o,meta,src),out,'reuse the static texture');
  const r=out.getContext('2d').getImageData(0,0,160,120).data;
  const rim=(15*160+15)*4,center=(60*160+80)*4;
  assert.ok(r[rim+3]>0&&r[rim+3]<200,'outer boundary fades without erasing the footprint');
  assert.ok(Math.min(r[rim],r[rim+2])-r[rim+1]<15,'purple fringe is neutralized');
  assert.deepEqual(Array.from(r.slice(center,center+4)),[71,86,44,255]);
  assert.equal(r[3],0);assert.equal(out.width,160);assert.equal(out.height,120);
  assert.deepEqual(src.toBuffer('raw'),original);assert.equal(JSON.stringify({o,meta}),before);
  for(const g of [{stage:1},{stage:0,_bossArena:true},{stage:0,_fieldRebuildQA:true}])assert.equal(fn(g,o,meta,src),src);
  assert.equal(fn({stage:0},{...o,x:10},meta,src),src);
  assert.equal(fn({stage:0},o,{...meta,srcRect:[0,0,80,80]},src),src);
  const loading={complete:false,naturalWidth:0};assert.equal(fn({stage:0},o,meta,loading),loading);
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
test('pit upgrades its procedural fallback to loaded local material without editing the source',()=>{
  const source=createCanvas(256,256),s=source.getContext('2d');
  s.fillStyle='#34412b';s.fillRect(0,0,256,256);
  for(let y=0;y<256;y+=7){s.fillStyle=y%2?'#6c6242':'#232b1b';s.fillRect(0,y,256,2);}
  const original=source.toBuffer('raw'),o={type:'pit_poison',x:6500,y:5580};
  function frame(img){const a=createCanvas(256,256),c=a.getContext('2d');c.translate(128-o.x,128-o.y);scope.Ch1LivingDetail.pit(c,{stage:0},o,1200,{sz:256},img);return a.toBuffer('raw');}
  const fallback=frame({complete:false,naturalWidth:0});
  const textured=frame(source);
  assert.notDeepEqual(textured,fallback,'loaded source must contribute real surface texture');
  assert.deepEqual(textured,frame(source),'same material and time remain deterministic');
  assert.deepEqual(frame(null),fallback,'missing source retains procedural fallback');
  assert.deepEqual(source.toBuffer('raw'),original,'source image is never modified');
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

test('crawling tendons keep the root fixed, reach with the tip and follow with the body',()=>{
  const local={document:{createElement:()=>createCanvas(320,320)}};
  vm.runInNewContext(readFileSync(file,'utf8').replace('  const atlases=[];','  root.inspectCrawl=tendonCrawl; const atlases=[];'),local);
  const crawl=local.inspectCrawl;
  for(let p=0;p<Math.PI*2;p+=.1){const root=crawl(0,p,0);assert.equal(root.along,0);assert.ok(Math.abs(root.side)<1e-12);}
  assert.ok(crawl(1,Math.PI*.64,0).along>17,'tip must reach visibly');
  assert.equal(crawl(.5,.3,0).along,0,'body waits while the tip starts reaching');
  assert.ok(crawl(1,.3,0).along>0,'tip leads the body');
  for(const u of [.2,.5,1]){const a=crawl(u,.8,1),b=crawl(u,.8+Math.PI*2,1);assert.ok(Math.abs(a.along-b.along)<1e-9);assert.ok(Math.abs(a.side-b.side)<1e-9);}
});

test('dry skin membrane fades before its irregular outline without erasing the attached center',()=>{
  const local={document:{createElement:()=>createCanvas(320,320)}};
  vm.runInNewContext(readFileSync(file,'utf8').replace('  const atlases=[];','  root.inspectMembrane=membrane; const atlases=[];'),local);
  for(let variant=0;variant<3;variant++){
    const canvas=local.inspectMembrane(false,variant),pixels=canvas.getContext('2d').getImageData(0,0,320,320).data;
    let peak=0;
    for(let y=0;y<320;y++)for(let x=0;x<320;x++){
      const dx=(x+.5-160)/1.12,dy=(y+.5-172)/.62,angle=Math.atan2(dy,dx);
      const depth=102+18*Math.sin(angle*3+variant)+11*Math.cos(angle*5-variant)-Math.hypot(dx,dy);
      if(depth>=0&&depth<3)peak=Math.max(peak,pixels[(y*320+x)*4+3]);
    }
    assert.ok(peak<=5,'the contour must not retain a hard alpha step: '+peak);
    assert.ok(pixels[(172*320+160)*4+3]>30,'root attachment skin must remain visible');
  }
});

test('toxic ground blends dark soil farther inward while retaining bright rock edges and its interior',()=>{
  const source=createCanvas(320,320),s=source.getContext('2d');
  s.fillStyle='rgb(30,30,30)';s.fillRect(0,0,320,160);
  s.fillStyle='rgb(160,160,160)';s.fillRect(0,160,320,160);
  const original=source.toBuffer('raw');
  const result=scope.Ch1LivingDetail.groundSprite({stage:0},{type:'m_c1gtoxicf',x:6500,y:5460},{sz:400},source);
  const c=result.getContext('2d'),dark=c.getImageData(23,80,1,1).data,rock=c.getImageData(23,240,1,1).data;
  assert.ok(dark[3]<180,'dark soil edge must expose the underlying floor beyond the old 18px feather');
  assert.ok(rock[3]>240,'bright rock ridge must retain its silhouette');
  assert.deepEqual(Array.from(c.getImageData(100,80,1,1).data),[30,30,30,255]);
  assert.deepEqual(source.toBuffer('raw'),original);
});

test('large authored swamp water flows inside pockets while rocks, source and gameplay stay fixed',()=>{
  assert.equal(typeof scope.Ch1LivingDetail.swamp,'function');
  const img=createCanvas(881,900),s=img.getContext('2d');
  s.fillStyle='#393629';s.fillRect(0,0,881,900);
  for(let y=0;y<900;y+=9){s.fillStyle=y%2?'#34452a':'#82936a';s.fillRect(0,y,881,3);}
  const original=img.toBuffer('raw'),o={type:'m_c1gtoxicf',x:6500,y:5460},g={stage:0},meta={sz:900,keepAR:1};
  const before=JSON.stringify({o,g,meta});
  function frame(time,state=g,obj=o,source=img,metadata=meta){const a=createCanvas(900,900),c=a.getContext('2d');c.translate(450-o.x,450-o.y);const used=scope.Ch1LivingDetail.swamp(c,state,obj,time,metadata,source);return {used,c,raw:a.toBuffer('raw')};}
  const a=frame(1200),b=frame(3000);assert.equal(a.used,true);assert.notDeepEqual(a.raw,b.raw);assert.deepEqual(a.raw,frame(1200).raw);
  assert.deepEqual(a.c.getImageData(580,100,40,40).data,b.c.getImageData(580,100,40,40).data,'rock region must not move');
  assert.deepEqual(a.raw,frame(1200+6400).raw,'animation must loop seamlessly');
  for(const state of [{stage:1},{stage:0,_bossArena:true},{stage:0,_fieldRebuildQA:true}])assert.equal(frame(0,state).used,false);
  assert.equal(frame(0,g,{...o,x:6000}).used,false);assert.equal(frame(0,g,o,{complete:false,naturalWidth:0}).used,false);
  assert.equal(frame(0,g,o,img,{...meta,srcRect:[0,0,100,100]}).used,false);
  assert.deepEqual(img.toBuffer('raw'),original);assert.equal(JSON.stringify({o,g,meta}),before);
});

test('swamp gas releases after a bubble bursts, rises above the water and fades before the loop',()=>{
  const local={document:{createElement:()=>createCanvas(320,320)}};
  vm.runInNewContext(readFileSync(file,'utf8').replace('  const atlases=[];','  root.inspectSwampGas=paintSwampGas; const atlases=[];'),local);
  function gas(q){const a=createCanvas(180,180),c=a.getContext('2d');local.inspectSwampGas(c,90,135,q,0);return c;}
  assert.ok(gas(.5).getImageData(0,0,180,180).data.every(v=>v===0),'gas must wait for bubble rupture');
  const rising=gas(.8);assert.ok(rising.getImageData(55,65,70,55).data.some((v,i)=>i%4===3&&v>10),'visible vapor must rise above the release point');
  assert.ok(rising.getImageData(0,155,180,25).data.every(v=>v===0),'vapor must not sink below the water');
  assert.ok(gas(1).getImageData(0,0,180,180).data.every(v=>v===0),'vapor must disappear at the loop boundary');
});

test('swamp bubble dome has a readable body at the actual 450px prop size',()=>{
  const img=createCanvas(881,900),s=img.getContext('2d');s.fillStyle='#151a12';s.fillRect(0,0,881,900);
  const a=createCanvas(450,450),c=a.getContext('2d');c.translate(225-6500,225-5460);
  scope.Ch1LivingDetail.swamp(c,{stage:0},{type:'m_c1gtoxicf',x:6500,y:5460},3200,{sz:450,keepAR:1},img);
  const pixels=a.getContext('2d').getImageData(147,97,36,30).data;
  let readable=0;for(let i=1;i<pixels.length;i+=4)if(pixels[i]>65)readable++;
  assert.ok(readable>=130,'bubble must have a visible dome body, not a tiny arc: '+readable);
});

test('bubble pop tears outward beyond the dome and clears before the next growth',()=>{
  const local={document:{createElement:()=>createCanvas(320,320)}};
  vm.runInNewContext(readFileSync(file,'utf8').replace('  const atlases=[];','  root.inspectBubble=paintSwampBubble; const atlases=[];'),local);
  function frame(q){const a=createCanvas(96,96),c=a.getContext('2d');local.inspectBubble(c,48,64,q);return c;}
  const intact=frame(.5),pop=frame(.62);
  assert.ok(intact.getImageData(14,30,16,45).data.every(v=>v===0));
  assert.ok(pop.getImageData(14,30,16,45).data.some((v,i)=>i%4===3&&v>50),'rupture must visibly expand beyond the bubble body');
  assert.notDeepEqual(frame(.58).getImageData(0,0,96,96).data,intact.getImageData(0,0,96,96).data,'pre-pop membrane must squash/crack');
  assert.ok(frame(.9).getImageData(0,0,96,96).data.every(v=>v===0),'pop must finish, not linger as a second bubble');
});

test('swamp damp soil follows the silhouette with a soft exterior and transparent canvas border',()=>{
  const local={document:{createElement:()=>createCanvas(1,1)}};
  vm.runInNewContext(readFileSync(file,'utf8').replace('  const atlases=[];','  root.inspectApron=swampApron; const atlases=[];'),local);
  const img=createCanvas(440,450),x=img.getContext('2d');x.fillStyle='#fff';x.fillRect(120,120,200,200);
  const original=img.toBuffer('raw'),a=local.inspectApron(img),c=a.getContext('2d');
  assert.ok(c.getImageData(150,220,1,1).data[3]>30,'damp soil must extend outside the source silhouette');
  assert.ok(c.getImageData(134,220,1,1).data[3]<c.getImageData(150,220,1,1).data[3],'exterior must fade rather than end as a hard ring');
  assert.ok(c.getImageData(0,0,512,1).data.every(v=>v===0));
  assert.ok(c.getImageData(0,0,1,512).data.every(v=>v===0));
  assert.deepEqual(img.toBuffer('raw'),original);
});

test('eastern tissue extends toward the swamp with a feathered contaminated bank',()=>{
  const local={document:{createElement:()=>createCanvas(1,1)}};
  vm.runInNewContext(readFileSync(file,'utf8').replace('  const atlases=[];','  root.inspectRegion=regionalSkin; const atlases=[];'),local);
  const a=local.inspectRegion(1),c=a.getContext('2d');
  assert.ok(c.getImageData(680,270,1,1).data[3]>150,'eastern bank needs continuous material near the swamp');
  assert.ok(c.getImageData(767,270,1,1).data[3]<4,'outer edge must fade before the canvas boundary');
  assert.strictEqual(local.inspectRegion(1),a,'material stays cached and static');
});

test('camp ash contact stays below the structure and fades outside its source silhouette',()=>{
  const local={document:{createElement:()=>createCanvas(1,1)}};
  vm.runInNewContext(readFileSync(file,'utf8').replace('  const atlases=[];','  root.inspectCampGround=campGround; const atlases=[];'),local);
  const img=createCanvas(880,663),x=img.getContext('2d');x.fillStyle='#fff';x.fillRect(240,0,400,620);
  const before=img.toBuffer('raw'),a=local.inspectCampGround(img),c=a.getContext('2d');
  assert.ok(c.getImageData(0,0,512,140).data.every(v=>v===0),'upper tent must not cast a flat ash silhouette');
  assert.ok(c.getImageData(150,300,1,1).data[3]>20,'ash should connect the lower source to the ground');
  assert.ok(c.getImageData(138,300,1,1).data[3]<c.getImageData(150,300,1,1).data[3]);
  assert.ok(c.getImageData(0,399,512,1).data.every(v=>v===0));
  assert.deepEqual(img.toBuffer('raw'),before);
});

test('camp foreground receives static ground material only below the object pass',()=>{
  function render(surface=false,stage=0,time=0){const a=createCanvas(320,240),c=a.getContext('2d');c.translate(160-1860,120-4300);scope.Ch1LivingDetail.draw(c,{stage,cam:{x:1860,y:4300}},[],time,320,240,surface);return a;}
  const a=render();assert.ok(a.getContext('2d').getImageData(150,110,20,20).data.some((v,i)=>i%4===3&&v>20),'camp foreground must connect to the ground');
  assert.deepEqual(a.toBuffer('raw'),render(false,0,1700).toBuffer('raw'),'foreground material must not pulse or flicker');
  assert.ok(render(true).getContext('2d').getImageData(0,0,320,240).data.every(v=>v===0));
  assert.ok(render(false,1).getContext('2d').getImageData(0,0,320,240).data.every(v=>v===0));
});

test('camp debris contact stays local, below the prop, and out of other stages',()=>{
  const img=createCanvas(200,200),x=img.getContext('2d');x.fillStyle='#fff';x.fillRect(60,0,80,200);const original=img.toBuffer('raw');
  const o={type:'m_c1sbone',x:1940,y:4340},meta={sz:150,keepAR:1};
  function render(obj=o,stage=0){const a=createCanvas(300,300),c=a.getContext('2d');c.translate(150-1940,150-4340);scope.Ch1LivingDetail.shadows(c,{stage,cam:{x:1940,y:4340}},[obj],{m_c1sbone:img},{m_c1sbone:meta},0,300,300);return c;}
  const c=render();assert.ok(c.getImageData(120,170,60,60).data.some((v,i)=>i%4===3&&v>20));
  assert.ok(c.getImageData(0,0,300,140).data.every(v=>v===0),'raised skull poles must not become a flat dark silhouette');
  for(const candidate of [render({...o,x:1941}),render(o,1)])assert.ok(candidate.getImageData(0,0,300,300).data.every(v=>v===0));
  assert.deepEqual(img.toBuffer('raw'),original);
});

test('retired tomb and exposed root receive no contact enhancement',()=>{
 const img=createCanvas(192,192);img.getContext('2d').fillRect(0,0,192,192);
 for(const [type,x,y] of [['m_tomb',1460,3900],['m_root',1980,3940]]){
 const a=createCanvas(300,300),c=a.getContext('2d');c.translate(150-x,150-y);
 scope.Ch1LivingDetail.shadows(c,{stage:0,cam:{x,y}},[{type,x,y}],{[type]:img},{[type]:{sz:110}},0,300,300);
 assert.ok(c.getImageData(0,0,300,300).data.every(v=>v===0));
 }
});

test('authored northern pool contact is cached, culled and isolated from gameplay',()=>{
 const allocations=[],local={document:{createElement:()=>{const a=createCanvas(1,1);allocations.push(a);return a;}}};vm.runInNewContext(readFileSync(file,'utf8'),local);
 const img=createCanvas(128,128),ic=img.getContext('2d');ic.fillStyle='#fff';ic.fillRect(30,24,68,80);
 const o={type:'m_c1pool',x:6700,y:1740,scale:1.55},meta={sz:300,keepAR:1},g={stage:0,cam:{x:o.x,y:o.y}};
 const canvas=createCanvas(700,700),c=canvas.getContext('2d');c.translate(350-o.x,350-o.y);c.globalAlpha=.7;
 const before=JSON.stringify({o,meta,g}),raw=img.toBuffer('raw');
 local.Ch1LivingDetail.shadows(c,g,[o],{m_c1pool:img},{m_c1pool:meta},1200,700,700);
 assert.ok(canvas.toBuffer('raw').some(v=>v!==0),'pool needs a grounding silhouette');assert.equal(allocations.length,1);assert.equal(allocations[0].width,512);assert.equal(allocations[0].height,512);
 assert.ok(Math.abs(c.globalAlpha-.7)<.01);assert.equal(JSON.stringify({o,meta,g}),before);assert.deepEqual(img.toBuffer('raw'),raw);
 local.Ch1LivingDetail.shadows(c,g,[o],{m_c1pool:img},{m_c1pool:meta},2400,700,700);assert.equal(allocations.length,1);
 for(const [state,sprites,obj] of [[{...g,stage:1},{m_c1pool:img},o],[{...g,cam:{x:0,y:0}},{m_c1pool:img},o],[g,{},o],[g,{m_c1pool:img},{...o,x:6000}]]){
 const z=createCanvas(700,700),ctx=z.getContext('2d');ctx.translate(350-o.x,350-o.y);local.Ch1LivingDetail.shadows(ctx,state,[obj],sprites,{m_c1pool:meta},1200,700,700);assert.ok(z.toBuffer('raw').every(v=>v===0));
 }
 const a=allocations[0].getContext('2d').getImageData(0,0,512,512).data;assert.equal(a[3],0);assert.ok(a[(256*512+256)*4+3]>0);
});
