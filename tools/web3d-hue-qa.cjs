// Low-load static hue audit: no screencast, encoding or dense-combat fixture.
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('playwright'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),out=process.env.WEB3D_QA_OUT||process.argv.find(a=>a.startsWith('--out='))?.slice(6)||'I:/EXODUSER-Storage/web3d-round4-20261102/hue-final';
const cameras=[['start',4020,7420],['early',3680,6380],['arena',4000,5200],['side_l',2120,5480],['camp',1900,4180],['corpse_tree',4100,3900],['altar',5900,4120],['side_r',6600,3800],['late',4000,2000],['exit',4000,700]];
const selected=process.argv.includes('--pools-only')?[['toxic_north',6700,1740],['toxic_south',6500,5460]]:process.argv.includes('--affected-only')?cameras.filter(c=>['altar','side_r','corpse_tree'].includes(c[0])):cameras.filter(c=>!process.argv.includes('--altar-only')||c[0]==='altar');
if(process.argv.includes('--materials-only'))selected.splice(0,selected.length,...cameras.filter(c=>['altar','side_r','corpse_tree'].includes(c[0])),['toxic_north',6700,1740],['toxic_south',6500,5460]);
if(process.argv.includes('--include-pools'))selected.push(['toxic_north',6700,1740],['toxic_south',6500,5460]);
const hsv=rgb=>{const hi=Math.max(...rgb),lo=Math.min(...rgb),d=hi-lo,i=rgb.indexOf(hi);return {h:(((d?i===0?(rgb[1]-rgb[2])/d:i===1?2+(rgb[2]-rgb[0])/d:4+(rgb[0]-rgb[1])/d:0)*60)+360)%360,s:d/Math.max(hi,1),v:hi};};
function materialRegions(a,b,width,height,state,overlay){
 const regions=[],h=state.hill,t=state.tile;
 const add=(id,family,test)=>regions.push({id,family,test,sums:[[0,0,0],[0,0,0]],pixels:0});
 for(let sector=0;sector<10;sector++)add('moat-'+sector,'toxic',(x,y)=>{const dx=(x-h.cx*t)/(h.rx*t),dy=(y-h.cy*t)/(h.ry*t),r=Math.hypot(dx,dy),a=(Math.atan2(dy,dx)+Math.PI*2)%(Math.PI*2);return r>.88&&r<1.00&&Math.floor(a/(Math.PI*2)*10)===sector&&!(x>h.rampX0*t&&x<h.rampX1*t&&Math.abs(y-h.rampY*t)<h.rampHalf1*t+10);});
 for(const o of state.pools)add(o.id,'toxic',(x,y)=>Math.hypot((x-o.x)/(o.width*.32),(y-o.y)/(o.height*.28))<1);
 for(const [i,o]of state.holes.entries())add('hole-'+i,'hole',(x,y)=>Math.hypot(x-o.x,y-o.y)<100);
 for(let y=160;y<height-210;y++)for(let x=220;x<width-300;x++){
  const i=(y*width+x)*4,c=hsv([a[i],a[i+1],a[i+2]]);if(c.v<25||c.s<.28||overlay&&overlay[i+3]>30)continue;
  const family=c.h>=65&&c.h<165?'toxic':c.h>=255&&c.h<=325?'hole':null;if(!family)continue;
  const wx=state.view.x+x/width*state.view.w,wy=state.view.y+y/height*state.view.h;
  for(const r of regions)if(r.family===family&&r.test(wx,wy)){r.pixels++;for(let j=0;j<3;j++){r.sums[0][j]+=a[i+j];r.sums[1][j]+=b[i+j];}}
 }
 return regions.filter(r=>r.pixels>=64).map(r=>{const hue=r.sums.map(s=>hsv(s).h),d=Math.abs(hue[0]-hue[1]);return {id:r.id,family:r.family,pixels:r.pixels,offRGB:r.sums[0].map(v=>v/r.pixels),onRGB:r.sums[1].map(v=>v/r.pixels),offHue:hue[0],onHue:hue[1],delta:Math.min(d,360-d)};});
}
function measure(a,b,width,height){
 const bins={toxic:[],water:[],hole:[]},sums=Object.fromEntries(Object.keys(bins).map(k=>[k,[[0,0,0],[0,0,0]]]));
 for(let y=180;y<height-210;y++)for(let x=220;x<width-300;x++){
  const i=(y*width+x)*4,source=hsv([a[i],a[i+1],a[i+2]]);if(source.v<25||source.s<.28)continue;
  const family=source.h>=65&&source.h<165?'toxic':source.h>=165&&source.h<=215?'water':source.h>=255&&source.h<=325?'hole':null;if(!family)continue;
  const target=hsv([b[i],b[i+1],b[i+2]]),d=Math.abs(source.h-target.h);bins[family].push(Math.min(d,360-d));for(let c=0;c<3;c++){sums[family][0][c]+=a[i+c];sums[family][1][c]+=b[i+c];}
 }
 return Object.fromEntries(Object.entries(bins).map(([k,v])=>{v.sort((a,b)=>a-b);const h=sums[k].map(rgb=>hsv(rgb).h),d=Math.abs(h[0]-h[1]);return [k,{pixels:v.length,areaHueDelta:v.length?Math.min(d,360-d):null,areaHue:h,median:v[Math.floor(v.length*.5)]??null,p95:v[Math.floor(v.length*.95)]??null,max:v.at(-1)??null,over15:v.filter(d=>d>15).length}];}));
}
async function ready(p){
 await p.waitForFunction(()=>typeof P!=='undefined'&&P?.x>0&&typeof _startSceneWarmState!=='undefined'&&_startSceneWarmState.status==='ready',null,{timeout:90000});
 for(let i=0;i<150;i++){const s=await p.evaluate(()=>({on:G.on,cutscene:_cutsceneState,guide:getComputedStyle(document.getElementById('introKeys')).opacity==='1'}));if(s.on)break;if(s.guide)await p.locator('#ikSkip').click();else if(s.cutscene==='INTRO_CUTSCENE')await p.keyboard.press('Escape');await p.waitForTimeout(150);}
 await p.waitForFunction(()=>G.on&&window._Web3DLivingLayer?.snapshot().frame>8&&getComputedStyle(document.getElementById('stageTransition')).opacity==='0',null,{timeout:90000});
 await p.evaluate(()=>{OPT.sfxVol=OPT.bgmVol=0;BGM.setVol(0);P.iframes=900008;});await p.waitForTimeout(8000);
 await p.evaluate(()=>{window._btFramePause=true;G.shake=0;});
}
(async()=>{
 await fs.mkdir(out,{recursive:true});process.env.TEMP=process.env.TMP=out;const result={started:new Date().toISOString(),fixture:'정지 카메라 / 10 FPS 상한 / 무음 / API 쓰기 차단 / 인위적 밀집 없음',errors:[],http:[],cameras:[],source:{}};
 for(const file of ['game.html',...(await fs.readdir(root+'/web3d')).filter(f=>/\.m?js$|\.json$/.test(f)).map(f=>'web3d/'+f),...['map-look-ch1','map-look-anchors','foliage-ch1','forest-ch1','ghosts-ch1'].map(f=>'assets/web3d/'+f+'.json')])result.source[file]=crypto.createHash('sha256').update(await fs.readFile(root+'/'+file)).digest('hex');
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio'],env:{...process.env,TEMP:out,TMP:out}});
 try{
  const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
  await context.addInitScript(()=>setInterval(()=>{try{OPT.sfxVol=OPT.bgmVol=0;OPT.fpsCap=10;}catch{}},100));
  await context.route('**/api/**',r=>r.request().method()==='GET'?r.continue():r.fulfill({status:200,contentType:'application/json',body:'{"ok":true,"isolated":true}'}));
  const p=await context.newPage();p.on('pageerror',e=>result.errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')result.errors.push(m.text());});p.on('response',r=>{if(r.status()>=400)result.http.push({url:r.url(),status:r.status()});});
  await p.goto('http://127.0.0.1:3377/game.html?classic=1&r3d=1&tutorial=0&resourceTutorial=0&slot=web3d-hue-audit',{waitUntil:'domcontentloaded'});await ready(p);
  const map=await p.evaluate(()=>JSON.stringify(G.map));
  for(const width of (process.argv.includes('--altar-only')?[1920]:[1920,3840])){
   await p.setViewportSize({width,height:1080});
   for(const [name,x,y]of selected){
    await p.evaluate(({x,y})=>{P.x=x;P.y=y;G.cam.x=x;G.cam.y=y;},{x,y});await p.waitForTimeout(2500);await p.waitForFunction(()=>Object.values(_ch1StartOuterCache).every(e=>e.status!=='loading'),null,{timeout:45000});
    const shots=[];let probe;
    for(const on of [false,true]){
     await p.evaluate(on=>{window._Web3DLivingLayer.setEnabled(on);if(on)window._Web3DFrameProbe={};},on);await p.waitForTimeout(300);
     const file=`${out}/camera-${name}-${width}-${on?'on':'off'}.png`;await p.screenshot({path:file});shots.push(file);
     if(on)probe=await p.evaluate(()=>{const p=window._Web3DFrameProbe;delete window._Web3DFrameProbe;return p;});
    }
    const decoded=await Promise.all(shots.map(f=>sharp(f).ensureAlpha().raw().toBuffer()));
    const state=await p.evaluate(()=>{const zoom=G._camZoom||1;return {hill:_CH1_HILL,tile:T,view:{x:G.cam.x-VW/(2*zoom),y:G.cam.y-VH/(2*zoom),w:VW/zoom,h:VH/zoom},holes:G.spawnHoles.map(h=>({x:h.x,y:h.y})),pools:MAP_OBJS.filter(o=>['m_c1pool','m_c1gtoxic','m_c1gtoxicf','pit_poison'].includes(o.type)).map((o,i)=>{const m=_OBJ_META[o.type],im=_OBJ_SPR[o.type],size=(m.sz||300)*(o.scale||1),ar=im?.naturalWidth/im?.naturalHeight||1;return {id:o.type+'-'+i,x:o.x,y:o.y,width:size*Math.min(1,ar),height:size/Math.max(1,ar)};})};});
    const overlay=probe?.overlay?await sharp(Buffer.from(probe.overlay.split(',')[1],'base64')).resize(width,1080).ensureAlpha().raw().toBuffer():null;
    const row={name,width,state,materialMask:'실제 원본 액체/소환굴 geometry AND 원본 V>=25/S>=.28; 추가 수풀·수면 overlay alpha>30/255 제외; 영역 평균 RGB hue, 최소64px',materials:materialRegions(...decoded,width,1080,state,overlay),unmaskedMaterials:materialRegions(...decoded,width,1080,state),screenHue:measure(...decoded,width,1080),layer:await p.evaluate(()=>window._Web3DLivingLayer.snapshot())};
    if(overlay)await sharp(overlay,{raw:{width,height:1080,channels:4}}).png().toFile(`${out}/overlay-${name}-${width}.png`);
    if(probe?.input&&probe?.output){
     const frames=await Promise.all([probe.input,probe.output].map(async(data,i)=>{const buffer=Buffer.from(data.split(',')[1],'base64');await fs.writeFile(`${out}/environment-${name}-${width}-${i?'on':'off'}.png`,buffer);return sharp(buffer).resize(width,1080).ensureAlpha().raw().toBuffer();}));
     row.lightingHue=measure(...frames,width,1080);
    }
    result.cameras.push(row);console.log(JSON.stringify({name,width,materials:row.materials.map(({id,pixels,delta})=>({id,pixels,delta})),lighting:row.lightingHue}));
    await sharp({create:{width:width*2,height:1080,channels:3,background:'#111'}}).composite(shots.map((input,i)=>({input,left:width*i,top:0}))).png().toFile(`${out}/comparison-${name}-${width}.png`);
    if(name==='altar'){for(const [i,file]of shots.entries())await sharp(file).extract({left:400,top:560,width:820,height:180}).png().toFile(`${out}/altar-moat-${width}-${i?'on':'off'}-1x.png`);}
    assert.equal(row.layer.error,null);assert.equal(row.layer.enabled,true);
   }
  }
  result.mapUnchanged=map===await p.evaluate(()=>JSON.stringify(G.map));assert.ok(result.mapUnchanged);assert.equal(result.errors.length,0,JSON.stringify(result.errors));assert.equal(result.http.length,0,JSON.stringify(result.http));
  result.materialHuePass=result.cameras.every(c=>c.materials.every(m=>m.delta<=15));assert.ok(result.materialHuePass,'고유색 영역 평균 RGB의 hue 변화 <=15도');result.completed=new Date().toISOString();
 }catch(e){result.failure=e.stack;throw e;}finally{await fs.writeFile(out+'/qa.json',JSON.stringify(result,null,2));await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
