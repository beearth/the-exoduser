// Build-time only. Invoke original source builders; never evaluated in native runtime.
const fs=require('fs'),path=require('path'),{chromium}=require('playwright');
const dir='godot/assets/map/web_parity/detail02';fs.mkdirSync(dir,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio']});try{const p=await browser.newPage();await p.route('**/game.html?test=1',route=>route.fulfill({path:path.resolve('godot/source_snapshot/game.html'),contentType:'text/html'}));await p.goto('http://127.0.0.1:3399/game.html?test=1');await p.waitForTimeout(3000);await p.evaluate(async()=>{await _startDemoNew();window._btFramePause=true});await p.waitForTimeout(2000);
const sources={living:fs.readFileSync('ch1-living-detail.js','utf8'),face:fs.readFileSync('ch1-face-life.js','utf8')};
const data=await p.evaluate(async sources=>{
 eval(sources.living.replace('root.Ch1LivingDetail=Object.freeze', 'root._exportLiving={finishBuild,buildTree,buildCamp,organicCache,swampCache,bubbleAtlas,poolSurface,swampVents,getPit:()=>pitAtlas,getGas:()=>poolGasAtlas};root.Ch1LivingDetail=Object.freeze'));
 eval(sources.face.replace('root.Ch1FaceLife=Object.freeze','root._exportFace={anchors,build,swaySample};root.Ch1FaceLife=Object.freeze'));
 const files=[],meta={source:'godot/source_snapshot/game.html; ch1-living-detail.js:529-1108; ch1-face-life.js:8-193',objects:JSON.parse(JSON.stringify(MAP_OBJS)),face:[]};
 const save=(name,canvas)=>{files.push({name,uri:canvas.toDataURL()});return name};
 const l=_exportLiving;
 const tree=l.finishBuild(l.buildTree(_OBJ_SPR.m_c1tree));l.organicCache.m_c1tree.set(_OBJ_SPR.m_c1tree,tree);
 meta.tree={body:save('treeBody.png',tree.staticBody),roots:save('treeRoots.png',tree.a),w:tree.w,h:tree.h,fullW:tree.fullW,fullH:tree.fullH,x0:tree.x0,y0:tree.y0,hanging:tree.hanging.map((r,i)=>({...r,tex:save('treeHanger'+i+'.png',r.tex)}))};delete meta.tree.a;
 const camp=l.finishBuild(l.buildCamp(_OBJ_SPR.m_c1camp));l.organicCache.m_c1camp.set(_OBJ_SPR.m_c1camp,camp);
 meta.camp={body:save('campBody.png',camp.body),ground:save('campGround.png',camp.ground),w:camp.w,h:camp.h,hands:camp.hands.map((r,i)=>({texture:save('campHand'+i+'.png',r.atlas),pw:r.pw,ph:r.ph,minX:r.minX,minY:r.minY,index:i}))};
 const c=document.createElement('canvas');c.width=c.height=1;const ctx=c.getContext('2d');
 const swampObj=MAP_OBJS.find(o=>o.type==='m_c1gtoxicf'&&o.x===6500);const swampImg=Ch1LivingDetail.groundSprite(G,swampObj,_OBJ_META.m_c1gtoxicf,_OBJ_SPR.m_c1gtoxicf);
 save('swampBase.png',swampImg);Ch1LivingDetail.swamp(ctx,G,swampObj,1000,_OBJ_META.m_c1gtoxicf,swampImg);
 const swamp=l.swampCache.get(swampImg);meta.swamp={atlas:save('swampWater.png',swamp.atlas),apron:save('swampApron.png',swamp.apron),w:swamp.w,h:swamp.h,vents:l.swampVents};
 Ch1LivingDetail.pit(ctx,G,MAP_OBJS.find(o=>o.type==='pit_poison'&&o.x===6500),1000,_OBJ_META.pit_poison,_OBJ_SPR.m_c1gtoxicf);save('pit.png',l.getPit());save('bubble.png',l.bubbleAtlas());
 l.poolSurface(ctx,MAP_OBJS.find(o=>o.type==='m_c1pool'&&o.x===6700),1000);if(l.getGas())save('poolGas.png',l.getGas());
 const cache={};await Promise.all(Array.from({length:64},async(_,i)=>{let x=i%8,y=Math.floor(i/8),img=new Image();img.src=`assets/map/ch1/production_finish/chunk_${x}_${y}.png`;await img.decode();cache[x+','+y]={img,status:'ready'}}));
 for(const a of _exportFace.anchors){_exportFace.build(a,cache,1000);if(a.status!=='ready')throw new Error('face build '+a.i+' '+a.status);meta.face.push({i:a.i,k:a.k,texture:save('face'+a.i+'.png',a.closed||a.patch),x:a.px0*1000/1024,y:a.py0*1000/1024,w:a.pw*1000/1024,h:a.ph*1000/1024,phase:a.phase,speed:a.speed,seed:a.seed,swayK:_exportFace.swaySample(G.map,a.wx,a.wy),chunkMidX:a.chunkMidX,stripY:a.stripY});}
 meta.transformOracle=[];
 for(const type of ['m_c1tree','m_c1camp','m_c1gtoxicf','pit_poison']){
  const o=MAP_OBJS.find(o=>o.type===type),m=_OBJ_META[type],img=type==='pit_poison'?_OBJ_SPR.m_c1gtoxicf:type==='m_c1gtoxicf'?swampImg:_OBJ_SPR[type];
  for(const now of [1000,2375]){
   const c=document.createElement('canvas').getContext('2d'),ops=[];
   c.drawImage=function(img,...args){const t=this.getTransform();ops.push({matrix:[t.a,t.b,t.c,t.d,t.e,t.f],args,alpha:this.globalAlpha,width:img.naturalWidth||img.width,height:img.naturalHeight||img.height})};
   const deformed=type!=='pit_poison'&&Ch1LivingDetail.deform(c,G,o,now,m);
   if(type==='pit_poison')Ch1LivingDetail.pit(c,G,o,now,m,img);
   else if(type==='m_c1gtoxicf')Ch1LivingDetail.swamp(c,G,o,now,m,img);
   else Ch1LivingDetail.organic(c,G,o,now,m,img);
   meta.transformOracle.push({type,now,ops});if(deformed)c.restore();
  }
 }
 return {files,meta};
},sources);
for(const f of data.files)fs.writeFileSync(path.join(dir,f.name),Buffer.from(f.uri.split(',')[1],'base64'));fs.writeFileSync(path.join(dir,'source.json'),JSON.stringify(data.meta,null,2));console.log('exported',data.files.length,'original canvases');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
