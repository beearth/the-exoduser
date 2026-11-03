// Sustained native Core/AI workload. Recording is deliberately separate.
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=process.env.WEB3D_QA_OUT;
if(!out)throw Error('WEB3D_QA_OUT required');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function programs(){return cp.execFileSync('C:/Windows/System32/WindowsPowerShell/v1.0/powershell.exe',['-NoProfile','-NonInteractive','-WindowStyle','Hidden','-Command',"@(Get-Process | Where-Object { $_.ProcessName -in @('dota2','Unity','EXODUSER-Unity') } | Select-Object Id,ProcessName) | ConvertTo-Json -Compress"],{windowsHide:true,encoding:'utf8'}).trim()||'[]';}
async function ready(p){
 await p.waitForFunction(()=>typeof P!=='undefined'&&P?.x>0&&typeof _startSceneWarmState!=='undefined'&&_startSceneWarmState.status==='ready',null,{timeout:90000});
 for(let i=0;i<150;i++){const s=await p.evaluate(()=>({on:G.on,cutscene:_cutsceneState,guide:getComputedStyle(document.getElementById('introKeys')).opacity==='1'}));if(s.on)break;if(s.guide)await p.locator('#ikSkip').click();else if(s.cutscene==='INTRO_CUTSCENE')await p.keyboard.press('Escape');await p.waitForTimeout(150);}
 await p.waitForFunction(()=>G.on&&window._Web3DLivingLayer?.snapshot().frame>10&&getComputedStyle(document.getElementById('stageTransition')).opacity==='0',null,{timeout:90000});
 await p.evaluate(()=>{OPT.sfxVol=OPT.bgmVol=0;BGM.setVol(0);P.iframes=900008;});await p.waitForTimeout(8000);
}
async function workload(p,on,tier){return p.evaluate(({on,tier})=>{
 window._btFramePause=true;OPT.quality=tier;OPT.fpsCap=0;P.x=4020;P.y=6500;G.cam.x=P.x;G.cam.y=P.y;P.hp=P.mhp=1000000;P.iframes=900008;ens=[];projs.length=0;pProjs.length=0;
 const tiles=G._floorTiles.filter(c=>{const x=(c.tx+.5)*T,y=(c.ty+.5)*T,d=Math.hypot(x-P.x,y-P.y);return d>150&&d<420&&canMv(x,y,24);});
 if(!tiles.length)throw Error('No native walkable dense fixture');
 for(let i=0;i<64;i++){const c=tiles[i*137%tiles.length],e=mkEn((c.tx+.5)*T,(c.ty+.5)*T,0,i%8,false,1,0);if(e){e.hp=e.mhp=1000000;ens.push(e);}}
 window._r5Maintain=()=>{P.hp=P.mhp;P.iframes=900008;for(let i=projs.length;i<96;i++){const a=((window._r5Counter=(window._r5Counter||0)+1)%96)*Math.PI*2/96;spawnProj({x:P.x+Math.cos(a)*360,y:P.y+Math.sin(a)*280,vx:-Math.cos(a),vy:-Math.sin(a),life:900,ml:900,sz:2,el:0,dmg:20,friendly:false,redBean:true,parryClass:'physical',_commit:true});}};
 if(!window._r5Surface){const api=window._Web3DLivingLayer,original=api.surface;window._r5Surface=original;api.surface=(ctx,view)=>{window._r5Maintain();original(ctx,view);};}
 window._r5Maintain();window._Web3DLivingLayer.setEnabled(on);window._btFramePause=false;
 return {enemies:ens.length,bullets:projs.length,hero:[P.x,P.y],fixture:'native Core/AI active; invincible recovering player; enemy HP 1000000; at least 96 native hostile projectiles replenished each frame'};
},{on,tier});}
async function sample(p){return p.evaluate(async()=>{
 const api=window._Web3DLivingLayer,t0=performance.now(),frame0=api.snapshot().frame,times=[],windows=[];let prev=t0,bin=t0,binFrames=0,last=t0,minE=Infinity,minB=Infinity;
 await new Promise(resolve=>{function tick(t){times.push(t-prev);prev=last=t;binFrames++;minE=Math.min(minE,ens.filter(e=>e?.alive).length);minB=Math.min(minB,projs.length+pProjs.length);if(t-bin>=1000){windows.push(binFrames*1000/(t-bin));bin=t;binFrames=0;}if(t-t0>=12000)resolve();else requestAnimationFrame(tick);}requestAnimationFrame(tick);});
 const layer=api.snapshot(),sorted=times.slice().sort((a,b)=>a-b);
 return {durationMs:last-t0,fps:times.length*1000/(last-t0),layerFps:(layer.frame-frame0)*1000/(last-t0),minOneSecondFps:Math.min(...windows),oneSecondFps:windows,p95FrameMs:sorted[Math.floor(sorted.length*.95)],maxFrameMs:Math.max(...times),enemiesMin:minE,bulletsMin:minB,layer,hp:P.hp,active:{on:G.on,paused:G.paused,framePause:!!window._btFramePause}};
});}
(async()=>{
 await fs.mkdir(out+'/temp',{recursive:true});process.env.TEMP=process.env.TMP=out+'/temp';
 const result={started:new Date().toISOString(),controllerSha:hash(await fs.readFile(__filename)),programsBefore:programs(),source:{},errors:[],http:[],samples:[]};
 for(const file of ['game.html','build-nwjs.mjs',...(await fs.readdir(root+'/web3d')).filter(f=>/\.(?:m?js|json)$/.test(f)).map(f=>'web3d/'+f),...['map-look-ch1','map-look-anchors','foliage-ch1','forest-ch1','ghosts-ch1'].map(f=>'assets/web3d/'+f+'.json')])result.source[file]=hash(await fs.readFile(root+'/'+file));
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio'],env:{...process.env,TEMP:out+'/temp',TMP:out+'/temp'}});
 try{
  const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
  await context.addInitScript(()=>setInterval(()=>{try{OPT.sfxVol=OPT.bgmVol=0;OPT.fpsCap=0;}catch{}},100));
  await context.route('**/api/**',r=>r.request().method()==='GET'?r.continue():r.fulfill({status:200,contentType:'application/json',body:'{"ok":true,"isolated":true}'}));
  const p=await context.newPage();p.on('pageerror',e=>result.errors.push(e.stack));p.on('console',m=>{if(m.type()==='error')result.errors.push(m.text());});p.on('response',r=>{if(r.status()>=400)result.http.push({url:r.url(),status:r.status()});});
  await p.goto('http://127.0.0.1:3377/game.html?classic=1&r3d=1&tutorial=0&resourceTutorial=0&slot=web3d-r5-fps-isolated',{waitUntil:'domcontentloaded'});await ready(p);
  const map=await p.evaluate(()=>JSON.stringify(G.map));
  for(const width of [1920,3840]){await p.setViewportSize({width,height:1080});await p.waitForTimeout(1500);
   for(const tier of ['off','high','mid','low']){
    const on=tier!=='off',fixture=await workload(p,on,on?tier:'high');await p.waitForTimeout(2500);
    await p.waitForFunction(()=>Object.values(_ch1StartOuterCache).every(e=>e.status!=='loading'),null,{timeout:45000});
    const measured=await sample(p),row={width,tier,fixture,...measured};
    row.workloadValid=row.enemiesMin>=64&&row.bulletsMin>=96&&row.hp>0&&row.active.on&&!row.active.paused&&!row.active.framePause&&!row.layer.error;
    row.fpsPass=row.fps>=120&&(!on||row.layerFps>=120);row.sustainedPass=row.fpsPass&&row.minOneSecondFps>=120;
    row.programs=programs();result.samples.push(row);console.log(JSON.stringify({width,tier,fps:row.fps,layerFps:row.layerFps,minOneSecondFps:row.minOneSecondFps,enemies:row.enemiesMin,bullets:row.bulletsMin,qualityLevel:row.layer.qualityLevel,valid:row.workloadValid}));
    await p.evaluate(()=>window._btFramePause=true);await p.screenshot({path:out+`/dense-${width}-${tier}.png`});await fs.writeFile(out+'/qa.json',JSON.stringify(result,null,2));
   }
  }
  result.mapUnchanged=map===await p.evaluate(()=>JSON.stringify(G.map));const cdp=await browser.newBrowserCDPSession();result.gpu=(await cdp.send('SystemInfo.getInfo')).gpu;await cdp.detach();
  result.programsAfter=programs();result.completed=new Date().toISOString();result.pass=result.mapUnchanged&&!result.errors.length&&!result.http.length&&result.samples.every(s=>s.workloadValid&&s.sustainedPass);
  await fs.writeFile(out+'/qa.json',JSON.stringify(result,null,2));if(!result.pass)throw Error('Tier workload/FPS gate failed; see qa.json');
 }catch(e){result.failure=e.stack;await fs.writeFile(out+'/qa.json',JSON.stringify(result,null,2));throw e;}finally{await browser.close();await fs.rm(out+'/temp',{recursive:true,force:true});}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
