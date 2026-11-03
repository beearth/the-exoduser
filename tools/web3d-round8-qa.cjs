// Round 7: all-material hue audit + matched camera/crop receipts. No save writes.
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require('playwright'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),out=process.argv.find(v=>v.startsWith('--out='))?.slice(6)||'I:/EXODUSER-Storage/codex-takeover/web3d-r8/final';
const focus=process.argv.includes('--focus'),names=process.argv.find(v=>v.startsWith('--names='))?.slice(8).split(',');
const cameras=[['start',4020,7420],['early',3680,6380],['arena',4000,5200],['side_l',2120,5480],['camp',1900,4180],['corpse_tree',4100,3900],['altar',5900,4120],['side_r',6600,3800],['late',4000,2000],['exit',4000,700],['cocoon',1800,2200],['toxic_north',6700,1740],['toxic_south',6500,5460]].filter(c=>(!focus||['camp','corpse_tree','altar','late'].includes(c[0]))&&(!names||names.includes(c[0])));
const hsv=c=>{const hi=Math.max(...c),lo=Math.min(...c),d=hi-lo,i=c.indexOf(hi);return {h:((d?(i===0?(c[1]-c[2])/d:i===1?2+(c[2]-c[0])/d:4+(c[0]-c[1])/d)*60:0)+360)%360,s:d/Math.max(hi,.001),v:hi};};
const hueDelta=(a,b)=>{const d=Math.abs(hsv(a).h-hsv(b).h);return Math.min(d,360-d);};
function measure(a,b,mask){
 const sums=[[0,0,0],[0,0,0]],deltas=[],brightness=[0,0];let pixels=0;
 for(let i=0;i<mask.length;i++){if(!mask[i])continue;const j=i*4;
  if(Math.max(a[j],a[j+1],a[j+2])<12)continue;pixels++;for(let c=0;c<3;c++){sums[0][c]+=a[j+c];sums[1][c]+=b[j+c];}brightness[0]+=a[j]*.299+a[j+1]*.587+a[j+2]*.114;brightness[1]+=b[j]*.299+b[j+1]*.587+b[j+2]*.114;
  if((i&15)===0){const aa=[a[j],a[j+1],a[j+2]],bb=[b[j],b[j+1],b[j+2]];if(hsv(aa).s>.03)deltas.push(hueDelta(aa,bb));}
 }deltas.sort((a,b)=>a-b);const rgb=sums.map(s=>s.map(v=>v/Math.max(1,pixels)));
 return {pixels,offRGB:rgb[0],onRGB:rgb[1],offHue:hsv(rgb[0]).h,onHue:hsv(rgb[1]).h,delta:hueDelta(...rgb),lumaRatio:brightness[1]/Math.max(1,brightness[0]),pixelStatsSampling:'1/16 diagnostic only; area RGB and pass gate use every masked pixel',pixelMedian:deltas[Math.floor(deltas.length*.5)],pixelP95:deltas[Math.floor(deltas.length*.95)]};
}
function objectMeasures(a,b,ids,objects){
 const groups=objects.map(o=>({...o,pixels:0,sums:[[0,0,0],[0,0,0]],lum:[0,0]}));
 for(let i=0;i<ids.length;i++){const id=ids[i];if(!id)continue;const j=i*4;if(Math.max(a[j],a[j+1],a[j+2])<12)continue;const g=groups[id-1];g.pixels++;for(let c=0;c<3;c++){g.sums[0][c]+=a[j+c];g.sums[1][c]+=b[j+c];}g.lum[0]+=a[j]*.299+a[j+1]*.587+a[j+2]*.114;g.lum[1]+=b[j]*.299+b[j+1]*.587+b[j+2]*.114;}
 return groups.filter(g=>g.pixels>=64).map(({sums,lum,...g})=>{const rgb=sums.map(s=>s.map(v=>v/g.pixels));return {...g,offRGB:rgb[0],onRGB:rgb[1],offHue:hsv(rgb[0]).h,onHue:hsv(rgb[1]).h,delta:hueDelta(...rgb),lumaRatio:lum[1]/Math.max(1,lum[0])};});
}
async function ready(p){
 await p.waitForFunction(()=>typeof P!=='undefined'&&P?.x>0&&typeof _startSceneWarmState!=='undefined'&&_startSceneWarmState.status==='ready',null,{timeout:90000});
 for(let i=0;i<150;i++){const s=await p.evaluate(()=>({on:G.on,guide:getComputedStyle(document.getElementById('introKeys')).opacity==='1',cut:_cutsceneState}));if(s.on)break;if(s.guide)await p.locator('#ikSkip').click();else if(s.cut==='INTRO_CUTSCENE')await p.keyboard.press('Escape');await p.waitForTimeout(150);}
 await p.waitForFunction(()=>G.on&&window._Web3DLivingLayer?.snapshot().frame>10&&getComputedStyle(document.getElementById('stageTransition')).opacity==='0',null,{timeout:90000});
 await p.evaluate(()=>{_petBubble.t=0;P.iframes=900008;OPT.sfxVol=OPT.bgmVol=0;BGM.setVol(0);});await p.waitForTimeout(8000);
 await p.evaluate(()=>{window._btFramePause=true;G.shake=0;_petBubble.t=0;_petBubble.pair=null;document.getElementById('petSubtitle').style.opacity='0';window._r6StillClock=setInterval(()=>{_gameTime=10000;_gameFrame=600;_now=10000;_acc=0;},1);});
}
(async()=>{
 await fs.mkdir(out+'/temp',{recursive:true});process.env.TEMP=process.env.TMP=out+'/temp';
 const result={started:new Date().toISOString(),fixture:'R8 fixed clocks; isolated save; muted browser; new physical groves excluded from matched original-material hue',errors:[],http:[],cameras:[],source:{}};
 for(const f of ['game.html',...(await fs.readdir(root+'/web3d')).filter(f=>/\.(m?js|json)$/.test(f)).map(f=>'web3d/'+f)])result.source[f]=crypto.createHash('sha256').update(await fs.readFile(root+'/'+f)).digest('hex');
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio']});
 try{
 const c=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
 await c.addInitScript(()=>setInterval(()=>{try{OPT.sfxVol=OPT.bgmVol=0;OPT.fpsCap=15;}catch{}},100));
 await c.route('**/api/**',r=>r.request().method()==='GET'?r.continue():r.fulfill({status:200,contentType:'application/json',body:'{"ok":true,"isolated":true}'}));
 const p=await c.newPage();p.on('pageerror',e=>result.errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')result.errors.push(m.text());});p.on('response',r=>{if(r.status()>=400)result.http.push({url:r.url(),status:r.status()});});
 await p.goto('http://127.0.0.1:3377/game.html?classic=1&r3d=1&tutorial=0&resourceTutorial=0&slot=web3d-r8-audit',{waitUntil:'domcontentloaded'});await ready(p);
 const map=await p.evaluate(()=>JSON.stringify(G.map));
 for(const width of (process.argv.some(v=>v.startsWith('--width='))?[+process.argv.find(v=>v.startsWith('--width=')).slice(8)]:focus?[1920]:[1920,2560,3840])){
  await p.setViewportSize({width,height:1080});
  for(const [name,x,y]of cameras){
   await p.evaluate(({x,y})=>{P.x=x;P.y=y;G.cam.x=x;G.cam.y=y;},{x,y});await p.waitForTimeout(2200);await p.waitForFunction(()=>Object.values(_ch1StartOuterCache).every(e=>e.status!=='loading'),null,{timeout:45000});
   const files=[],frames=[];
   for(const on of [false,true]){
    await p.evaluate(on=>{window._Web3DLivingLayer.setEnabled(on);if(on)window._Web3DFrameProbe={};},on);await p.waitForTimeout(300);
    const file=out+`/camera-${name}-${width}-${on?'on':'off'}.png`;await p.screenshot({path:file});files.push(file);frames.push(await sharp(file).ensureAlpha().raw().toBuffer());
   }
   if(process.argv.includes('--preview')){console.log('preview '+name);continue;}await p.evaluate(()=>window._Web3DLivingLayer.setGrovesEnabled(false));await p.waitForTimeout(200);const noGroveFile=out+'/camera-'+name+'-'+width+'-on-groves-off.png';await p.screenshot({path:noGroveFile});const noGrove=await sharp(noGroveFile).ensureAlpha().raw().toBuffer();await p.evaluate(()=>window._Web3DLivingLayer.setGrovesEnabled(true));await p.waitForTimeout(200);await p.evaluate(()=>window._Web3DLivingLayer.setGroundEnabled(false));await p.waitForTimeout(200);const patchBaseFile=out+`/camera-${name}-${width}-on-ground-off.png`;await p.screenshot({path:patchBaseFile});const patchBase=await sharp(patchBaseFile).ensureAlpha().raw().toBuffer();await p.evaluate(()=>window._Web3DLivingLayer.setGroundEnabled(true));await p.waitForTimeout(200);
   const state=await p.evaluate(async()=>{
    const {nativePropContext}=await import('./web3d/native-prop-context.mjs'),z=G._camZoom||1,w=C.width,h=C.height,view={x:G.cam.x-VW/(2*z),y:G.cam.y-VH/(2*z),w:VW/z,h:VH/z};
    const anchors=await(await fetch('./assets/web3d/map-look-anchors.json')).json();
    const make=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;},props=make(),idCanvas=make(),part=make(),additions=make(),maskCanvas=make(),objects=[];
    const pc=props.getContext('2d',{willReadFrequently:true}),ids=idCanvas.getContext('2d',{willReadFrequently:true}),one=part.getContext('2d'),ac=additions.getContext('2d',{willReadFrequently:true});
    const transform=c=>c.setTransform(w/view.w,0,0,h/view.h,-view.x*w/view.w,-view.y*h/view.h),saved=X,api=window._Web3DLivingLayer,on=api.snapshot().enabled;
    const region=make(),rc=region.getContext('2d',{willReadFrequently:true});transform(rc);rc.beginPath();anchors.boundary.forEach(([x,y],i)=>rc[i?'lineTo':'moveTo'](x*T,y*T));rc.closePath();rc.fillStyle='white';rc.fill();const inside=rc.getImageData(0,0,w,h).data;
    api.setEnabled(false);try{
     for(const o of [...MAP_OBJS].sort((a,b)=>a.y-b.y)){
      const size=(_OBJ_META[o.type]?.sz||40)*(o.scale||1);if(o.x+size<view.x||o.x-size>view.x+view.w||o.y+size<view.y||o.y-size>view.y+view.h||_RETIRED_MAP_OBJECT_TYPES.has(o.type)||_ch1ShouldSuppressSouthVisualProp(o))continue;
      one.setTransform(1,0,0,1,0,0);one.clearRect(0,0,w,h);transform(one);X=nativePropContext(one,_useGL||_useGPU);_drawMapObjOne(o,false);
      pc.drawImage(part,0,0);const id=objects.length+1;if(id>254)throw Error('prop mask ID overflow');objects.push({id,type:o.type,x:o.x,y:o.y});
      // Opaque integer IDs avoid premultiplied-alpha rounding inventing an ID
      // between overlapping translucent sprites (e.g. green 5 becoming 6).
      const identity=one.getImageData(0,0,w,h);for(let j=0;j<identity.data.length;j+=4){const solid=identity.data[j+3]>254;identity.data[j]=0;identity.data[j+1]=solid?id:0;identity.data[j+2]=0;identity.data[j+3]=solid?255:0;}one.putImageData(identity,0,0);ids.drawImage(part,0,0);
     }
    }finally{X=saved;api.setEnabled(on);}
    window._r6Dressing??=await(await import('./web3d/ground-dressing.mjs')).createGroundDressing();transform(ac);for(let i=0;i<100;i++)window._r6Dressing.draw(ac,{G,ground:_ch1StartOuterCache,tile:T},{...view});
    const native=pc.getImageData(0,0,w,h).data,identity=ids.getImageData(0,0,w,h).data,added=ac.getImageData(0,0,w,h).data;
    const mc=maskCanvas.getContext('2d'),pixels=mc.createImageData(w,h),mask=pixels.data;
    // Actual native opaque prop alpha and collision-floor pixels. Added dressing
    // has no OFF counterpart, so its pixels are reported as unmatched additions.
    for(let py=160;py<860;py++)for(let px=0;px<w;px++){
     const wx=view.x+px/w*view.w,wy=view.y+py/h*view.h,i=(py*w+px)*4;mask[i+3]=255;
     if(G.map[Math.floor(wy/T)]?.[Math.floor(wx/T)]!==0)continue;
     if(inside[i+3]<250)continue;
     if(added[i+3]>8){mask[i+2]=255;continue;}
     if(native[i+3]>254)mask[i+1]=identity[i+1];else if(native[i+3]<8)mask[i]=255;
    }
    mc.putImageData(pixels,0,0);
    const probe=window._Web3DFrameProbe;delete window._Web3DFrameProbe;
    return {view,mask:maskCanvas.toDataURL(),objects,probe,layer:window._Web3DLivingLayer.snapshot()};
   });
   const mb=Buffer.from(state.mask.split(',')[1],'base64'),mask=await sharp(mb).ensureAlpha().raw().toBuffer();await fs.writeFile(out+`/mask-${name}-${width}.png`,mb);
   const floor=new Uint8Array(width*1080),props=new Uint8Array(width*1080);let additions=0;
   for(let i=0;i<floor.length;i++){floor[i]=mask[i*4];props[i]=mask[i*4+1];if(mask[i*4+2])additions++;}
   const addedMask=new Uint8Array(width*1080);for(let i=0;i<addedMask.length;i++)addedMask[i]=mask[i*4+2];
   const physicalLayers=[];for(const key of ['overlay','ghosts'])if(state.probe?.[key])physicalLayers.push(await sharp(Buffer.from(state.probe[key].split(',')[1],'base64')).resize(width,1080).ensureAlpha().raw().toBuffer());const nativeFloor=floor.slice(),nativeProps=props.slice();for(let i=0;i<nativeFloor.length;i++)if(physicalLayers.some(a=>a[i*4+3]>0)){nativeFloor[i]=0;nativeProps[i]=0;}let grovePixels=0,emptyPixels=0,totalPixels=width*700;for(let i=0;i<floor.length;i++){const j=i*4,py=Math.floor(i/width);if(py<160||py>=860)continue;const changed=Math.max(Math.abs(noGrove[j]-frames[1][j]),Math.abs(noGrove[j+1]-frames[1][j+1]),Math.abs(noGrove[j+2]-frames[1][j+2]))>3;if(changed||physicalLayers.some(a=>a[j+3]>=32))grovePixels++;else if(floor[i]||addedMask[i])emptyPixels++;if(Math.max(Math.abs(noGrove[j]-frames[1][j]),Math.abs(noGrove[j+1]-frames[1][j+1]),Math.abs(noGrove[j+2]-frames[1][j+2]))>0||physicalLayers.some(a=>a[j+3]>0)){floor[i]=0;props[i]=0;addedMask[i]=0;}}const coverage={scope:"gameplay rectangle y160..860; visible original collision floor without opaque native props or added grove contribution >3/255",denominator:totalPixels,grovePixels,emptyPixels,emptyPercent:emptyPixels/totalPixels*100};const additionMeasure=measure(...frames,addedMask),patchContribution=measure(patchBase,frames[1],addedMask);const perObject=objectMeasures(frames[0],noGrove,nativeProps,state.objects);
   const row={name,width,coverage,view:state.view,floor:measure(frames[0],noGrove,nativeFloor),props:measure(frames[0],noGrove,nativeProps),visibleFloorActual:measure(...frames,floor),hueFixture:"original-material OFF versus ON with new raw-art groves disabled; actual ON visible-floor subset separately reported",objects:perObject,unmatchedAdditionPixels:additions,additions:additionMeasure,patchContribution,layer:state.layer};
   for(const [key,data]of Object.entries(state.probe||{}))if(typeof data==='string'&&data.startsWith('data:image/'))await fs.writeFile(out+`/environment-${name}-${width}-${key}.png`,Buffer.from(data.split(',')[1],'base64'));
   await sharp({create:{width:width*2,height:1080,channels:3,background:'#111'}}).composite(files.map((input,i)=>({input,left:i*width,top:0}))).png().toFile(out+`/comparison-${name}-${width}.png`);
   const rect={altar:[500,300,400,260],camp:[650,200,440,280],late:[700,250,460,360],corpse_tree:[850,60,280,310]}[name];
   if(rect&&width===1920)for(let i=0;i<2;i++)for(const scale of [1,3])await sharp(files[i]).extract({left:rect[0],top:rect[1],width:rect[2],height:rect[3]}).resize(rect[2]*scale,rect[3]*scale,{kernel:'nearest'}).png().toFile(out+`/crop-${name}-${i?'on':'off'}-${scale}x.png`);
   result.cameras.push(row);console.log(JSON.stringify({name,width,empty:coverage.emptyPercent,floor:row.floor.delta,props:row.props.delta,luma:row.floor.lumaRatio}));await fs.writeFile(out+'/qa.json',JSON.stringify(result,null,2));
  }
 }
 result.mapUnchanged=map===await p.evaluate(()=>JSON.stringify(G.map));result.completed=new Date().toISOString();
 result.huePass=result.cameras.every(c=>c.floor.pixels>=64&&c.floor.delta<=15&&(!c.additions.pixels||c.additions.delta<=15&&c.patchContribution.delta<=15&&c.patchContribution.lumaRatio>=.94&&c.patchContribution.lumaRatio<=1.06)&&(!c.props.pixels||c.props.delta<=15)&&c.objects.every(o=>o.delta<=15));result.coveragePass=result.cameras.every(c=>c.coverage.emptyPercent<=40);result.pass=result.coveragePass&&result.huePass&&result.mapUnchanged&&!result.errors.length&&!result.http.length&&result.cameras.every(c=>!c.layer.error);
 }catch(e){result.failure=e.stack;throw e;}finally{await fs.writeFile(out+'/qa.json',JSON.stringify(result,null,2));await browser.close();await fs.rm(out+'/temp',{recursive:true,force:true});}
 if(!result.pass)throw Error('Round8 audit failed; inspect qa.json');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
