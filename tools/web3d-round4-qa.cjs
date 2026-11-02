const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),base='I:/EXODUSER-Storage/web3d-round4-20261102';
const mode=process.argv[2]||'stage1',out=process.env.WEB3D_QA_OUT||base+'/'+mode;
const limited=process.argv.includes('--limited')||mode==='stage1';
const cameras=[['start',4020,7420],['early',3680,6380],['arena',4000,5200],['side_l',2120,5480],['camp',1900,4180],['corpse_tree',4100,3900],['altar',5900,4120],['side_r',6600,3800],['late',4000,2000],['exit',4000,700]];
async function ready(p){
 await p.waitForFunction(()=>typeof P!=='undefined'&&P?.x>0&&typeof _startSceneWarmState!=='undefined'&&_startSceneWarmState.status==='ready',null,{timeout:90000});
 for(let i=0;i<150;i++){const s=await p.evaluate(()=>({on:G.on,cutscene:_cutsceneState,guide:getComputedStyle(document.getElementById('introKeys')).opacity==='1'}));if(s.on)break;if(s.guide)await p.locator('#ikSkip').click();else if(s.cutscene==='INTRO_CUTSCENE')await p.keyboard.press('Escape');await p.waitForTimeout(150);}
 await p.waitForFunction(()=>G.on&&window._Web3DLivingLayer?.snapshot().frame>8&&getComputedStyle(document.getElementById('stageTransition')).opacity==='0',null,{timeout:90000});
 await p.evaluate(()=>{OPT.sfxVol=OPT.bgmVol=0;BGM.setVol(0);});
}
async function at(p,x,y){await p.evaluate(({x,y})=>{window._btFramePause=true;P.x=x;P.y=y;G.cam.x=x;G.cam.y=y;},{x,y});await p.waitForTimeout(500);await p.waitForFunction(()=>Object.values(_ch1StartOuterCache).every(e=>e.status!=='loading'),null,{timeout:45000});}
async function coverage(p){return p.evaluate(async()=>{
 const plan=await(await fetch('./web3d/ground-dressing-ch1.json')).json(),anchors=await(await fetch('./assets/web3d/map-look-anchors.json')).json(),{dressingLayout}=await import('./web3d/ground-dressing.mjs');
 const zoom=G._camZoom||1,view={x:G.cam.x-VW/(2*zoom),y:G.cam.y-VH/(2*zoom),w:VW/zoom,h:VH/zoom},cv=document.createElement('canvas');cv.width=240;cv.height=135;const c=cv.getContext('2d',{willReadFrequently:true});c.setTransform(240/view.w,0,0,135/view.h,-view.x*240/view.w,-view.y*135/view.h);c.fillStyle='white';c.fillRect(view.x,view.y,view.w,view.h);c.globalCompositeOperation='destination-out';c.beginPath();anchors.boundary.forEach(([x,y],i)=>c[i?'lineTo':'moveTo'](x*anchors.tile_size,y*anchors.tile_size));c.closePath();c.fill();c.globalCompositeOperation='source-over';
 const saved=X,on=window._Web3DLivingLayer.snapshot().enabled;window._Web3DLivingLayer.setEnabled(false);X=c;
 try{for(const o of MAP_OBJS){if(_RETIRED_MAP_OBJECT_TYPES.has(o.type)||_ch1ShouldSuppressSouthVisualProp(o))continue;const size=(_OBJ_META[o.type]?.sz||40)*(o.scale||1);if(o.x+size<view.x||o.x-size>view.x+view.w||o.y+size<view.y||o.y-size>view.y+view.h)continue;_drawMapObjOne(o,false);}}finally{X=saved;window._Web3DLivingLayer.setEnabled(on);}
 const occupied=()=>{const a=c.getImageData(0,0,240,135).data;let n=0;for(let i=3;i<a.length;i+=4)if(a[i]>32)n++;return n;};const native=occupied(),images={};
 await Promise.all(Object.entries(plan.assets).map(async([key,url])=>{const im=new Image();await new Promise((resolve,reject)=>{im.onload=resolve;im.onerror=reject;im.src=url;});images[key]=im;}));
 for(const r of dressingLayout(plan)){c.save();c.translate(r.x,r.y);c.scale(r.flip?-1:1,1);c.globalAlpha=r.alpha;c.drawImage(images[r.asset],-r.width/2,-r.height/2,r.width,r.height);c.restore();}
 const n=occupied();return {emptyFraction:1-n/(240*135),occupied:n,total:240*135,nativeEmptyFraction:1-native/(240*135),view,method:'8px grid alpha>32; outside canonical boundary + exact native prop painter + authored dressing; HUD/actors excluded',png:cv.toDataURL()};
});}
async function record(p,context,name,width,seconds=10){
 const cdp=await context.newCDPSession(p),times=[],writes=[];let last=-1;await fs.mkdir(out+'/frames-'+name,{recursive:true});
 cdp.on('Page.screencastFrame',e=>{if(e.metadata.timestamp-last>=.12){last=e.metadata.timestamp;const i=times.length;times.push(last);writes.push(fs.writeFile(out+'/frames-'+name+'/'+String(i).padStart(5,'0')+'.jpg',Buffer.from(e.data,'base64')));}cdp.send('Page.screencastFrameAck',{sessionId:e.sessionId}).catch(()=>{});});
 await cdp.send('Page.startScreencast',{format:'jpeg',quality:88,maxWidth:width,maxHeight:1080,everyNthFrame:2});await p.waitForTimeout(seconds*1000+150);await cdp.send('Page.stopScreencast');await Promise.all(writes);await cdp.detach();await fs.writeFile(out+'/frames-'+name+'.json',JSON.stringify(times));return {name,frames:times.length,duration:times.at(-1)-times[0]};
}
async function source(){const files=['game.html','build-nwjs.mjs',...(await fs.readdir(root+'/web3d')).filter(f=>/\.m?js$|\.json$/.test(f)).map(f=>'web3d/'+f),...(await fs.readdir(root+'/assets/web3d')).filter(f=>/^(map-look|forest-ch1|ghosts-ch1|foliage-ch1).*json$/.test(f)).map(f=>'assets/web3d/'+f)];return Object.fromEntries(await Promise.all(files.map(async f=>[f,crypto.createHash('sha256').update(await fs.readFile(root+'/'+f)).digest('hex')])));}
(async()=>{
 await fs.mkdir(out+'/temp',{recursive:true});const result={started:new Date().toISOString(),mode,source:await source(),errors:[],http:[],cameras:[],occlusion:[],clips:[]};
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio'],env:{...process.env,TEMP:out+'/temp',TMP:out+'/temp'}});
 try{
  const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
  await context.addInitScript(cap=>{const timer=setInterval(()=>{try{if(typeof OPT!=='undefined'){OPT.sfxVol=OPT.bgmVol=0;OPT.fpsCap=cap;}}catch{}},50);window._round4MuteTimer=timer;},limited?30:0);
  await context.route('**/api/save',r=>r.fulfill({status:200,contentType:'application/json',body:'{"ok":true,"isolated":true}'}));
  const p=await context.newPage();p.on('pageerror',e=>result.errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')result.errors.push(m.text());});p.on('response',r=>{if(r.status()>=400)result.http.push({url:r.url(),status:r.status()});});
  await p.goto('http://127.0.0.1:3377/game.html?classic=1&r3d=1&tutorial=0&resourceTutorial=0&slot=web3d-round4-'+mode,{waitUntil:'domcontentloaded'});await ready(p);console.log('진입 완료');
  await p.evaluate(()=>window._btFramePause=true);result.mapBefore=await p.evaluate(()=>JSON.stringify(G.map));
  const selected=process.argv.includes('--motion-only')?[]:mode==='stage1'?cameras.filter(c=>['start','camp','corpse_tree','altar'].includes(c[0])):cameras;
  for(const width of [1920,3840]){
   await p.setViewportSize({width,height:1080});
   for(const [name,x,y]of selected){await at(p,x,y);for(const on of [false,true]){await p.evaluate(on=>window._Web3DLivingLayer.setEnabled(on),on);await p.waitForTimeout(170);await p.screenshot({path:out+'/camera-'+name+'-'+width+'-'+(on?'on':'off')+'.png'});}const layer=await p.evaluate(()=>window._Web3DLivingLayer.snapshot());result.cameras.push({name,width,layer});assert.equal(layer.error,null);if(name==='start'&&width===1920&&mode!=='stage1'){result.startCoverage=await coverage(p);await fs.writeFile(out+'/start-coverage.png',Buffer.from(result.startCoverage.png.split(',')[1],'base64'));delete result.startCoverage.png;}console.log(width+' '+name+' 높이 '+layer.depthObjects);}
  }
  await p.setViewportSize({width:1920,height:1080});
  const props=process.argv.includes('--motion-only')?[]:await p.evaluate(()=>MAP_OBJS.filter(o=>['m_ctree13','m_c1tree','m_c1altar'].includes(o.type)).map(o=>({type:o.type,x:o.x,y:o.y,scale:o.scale,meta:_OBJ_META[o.type]})));
  for(const o of props){const size=(o.meta.sz||32)*(o.scale||1),foot=o.y+size*(o.meta.footYF??.28);for(const side of ['behind','front']){
   await at(p,o.x,side==='behind'?foot-80:foot+100);await p.evaluate(()=>window._Web3DLivingLayer.setEnabled(true));await p.waitForTimeout(200);const snap=await p.evaluate(()=>window._Web3DLivingLayer.snapshot());result.occlusion.push({type:o.type,side,depth:snap.depthOrder});await p.screenshot({path:out+'/occlusion-'+o.type+'-'+side+'.png'});
  }}
  result.mapUnchanged=result.mapBefore===await p.evaluate(()=>JSON.stringify(G.map));delete result.mapBefore;
  if(!limited||process.argv.includes('--record'))for(const width of [1920,3840]){
   await p.setViewportSize({width,height:1080});await at(p,3680,6380);const phase=await p.evaluate(()=>_gameTime);
   for(const on of [false,true]){await p.evaluate(({on,phase})=>{window._Web3DLivingLayer.setEnabled(on);_gameTime=phase;window._round4Clock=setInterval(()=>_gameTime+=1000/60,1000/60);},{on,phase});result.clips.push(await record(p,context,width+'-'+(on?'on':'off'),width));await p.evaluate(()=>clearInterval(window._round4Clock));}
  }
  const info=await browser.newBrowserCDPSession();result.gpu=(await info.send('SystemInfo.getInfo')).gpu.devices;await info.detach();
  assert.equal(result.errors.length,0,JSON.stringify(result.errors));assert.equal(result.http.length,0,JSON.stringify(result.http));assert.equal(result.mapUnchanged,true);result.completed=new Date().toISOString();
  await fs.writeFile(out+'/qa.json',JSON.stringify(result,null,2));console.log(JSON.stringify({mode,errors:result.errors,http:result.http,cameras:result.cameras.length,occlusion:result.occlusion.length,mapUnchanged:result.mapUnchanged}));
 }catch(error){result.failure=error.stack;await fs.writeFile(out+'/qa.json',JSON.stringify(result,null,2));throw error;}finally{await browser.close();await fs.rm(out+'/temp',{recursive:true,force:true});}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
