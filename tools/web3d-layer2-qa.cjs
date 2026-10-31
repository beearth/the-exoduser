const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const out='I:/EXODUSER-Storage/web3d-layer2-20261031/final',root=path.resolve(__dirname,'..');
const url='http://127.0.0.1:3377/game.html?classic=1&r3d=1&tutorial=0&resourceTutorial=0&slot=web3d-layer2-isolated';
async function ready(p){
 await p.waitForFunction(()=>typeof P!=='undefined'&&P?.x>0&&typeof _startSceneWarmState!=='undefined'&&_startSceneWarmState.status==='ready',null,{timeout:90000});
 for(let i=0;i<120;i++){const s=await p.evaluate(()=>({on:G.on,cutscene:_cutsceneState,guide:getComputedStyle(document.getElementById('introKeys')).opacity==='1'}));if(s.on)break;if(s.guide)await p.locator('#ikSkip').click();else if(s.cutscene==='INTRO_CUTSCENE')await p.keyboard.press('Escape');await p.waitForTimeout(200);}
 await p.waitForFunction(()=>G.on&&window._Web3DLivingLayer?.snapshot().frame>10&&getComputedStyle(document.getElementById('stageTransition')).opacity==='0',null,{timeout:90000});
}
async function sample(p,label,seconds=10){return p.evaluate(async({label,seconds})=>{let start=performance.now(),last=start;const times=[],counts=[];await new Promise(resolve=>{function tick(t){times.push(t-last);last=t;counts.push([ens.filter(e=>e?.alive).length,projs.length+pProjs.length]);if(t-start<seconds*1000)requestAnimationFrame(tick);else resolve();}requestAnimationFrame(tick);});const sorted=times.slice().sort((a,b)=>a-b);return {label,fps:times.length*1000/(last-start),p95:sorted[Math.floor(sorted.length*.95)],enemies:[Math.min(...counts.map(v=>v[0])),Math.max(...counts.map(v=>v[0]))],bullets:[Math.min(...counts.map(v=>v[1])),Math.max(...counts.map(v=>v[1]))],layer:window._Web3DLivingLayer.snapshot(),hp:P.hp};},{label,seconds});}
async function record(p,context,name,width){
 const cdp=await context.newCDPSession(p),frames=[],writes=[];await fs.mkdir(out+'/frames-'+name,{recursive:true});
 cdp.on('Page.screencastFrame',e=>{const i=frames.length;frames.push(e.metadata.timestamp);writes.push(fs.writeFile(out+`/frames-${name}/${String(i).padStart(5,'0')}.jpg`,Buffer.from(e.data,'base64')));cdp.send('Page.screencastFrameAck',{sessionId:e.sessionId}).catch(()=>{});});
 await cdp.send('Page.startScreencast',{format:'jpeg',quality:90,maxWidth:width,maxHeight:1080,everyNthFrame:2});await sample(p,name,10);await cdp.send('Page.stopScreencast');await Promise.all(writes);await cdp.detach();await fs.writeFile(out+'/frames-'+name+'.json',JSON.stringify(frames));
}
(async()=>{
 await fs.mkdir(out+'/temp',{recursive:true});
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio'],env:{...process.env,TEMP:out+'/temp',TMP:out+'/temp'}});
 const result={url,errors:[],http:[],source:{},samples:[]};
 for(const f of ['game.html','web3d/living-layer.mjs','web3d/living-relief.mjs','web3d/living-layout.mjs','assets/web3d/living/rotten-underbrush-atlas.png'])result.source[f]=crypto.createHash('sha256').update(await fs.readFile(root+'/'+f)).digest('hex');
 try{
 const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});await context.route('**/*',r=>r.continue());const p=await context.newPage();
 p.on('pageerror',e=>{result.errors.push(e.message);console.error('PAGE',e.message);});p.on('console',m=>{if(m.type()==='error'){result.errors.push(m.text());console.error('CONSOLE',m.text().slice(0,1800));}});p.on('response',r=>{if(r.status()>=400)result.http.push({url:r.url(),status:r.status()});});
 console.log('시작');await p.goto(url,{waitUntil:'domcontentloaded',timeout:60000});await ready(p);console.log('게임 준비 완료');await p.waitForTimeout(1000);
 await p.evaluate(()=>window._btFramePause=true);await p.screenshot({path:out+'/start-on-1920.png'});
 if(process.argv.includes('--probe')){await p.evaluate(()=>{P.x=5880;P.y=4310;G.cam.x=P.x;G.cam.y=P.y;});await p.waitForTimeout(500);await p.screenshot({path:out+'/moat-on-1920.png'});result.probe=await p.evaluate(()=>({layer:window._Web3DLivingLayer.snapshot(),ground:Object.keys(_ch1StartOuterCache),on:G.on}));console.log(JSON.stringify(result.probe));await fs.writeFile(out+'/probe.json',JSON.stringify(result,null,2));return;}
 // Fixed map and native simulation paused: identical world state, presentation clock advances.
 await p.evaluate(()=>{P.x=5880;P.y=4310;G.cam.x=P.x;G.cam.y=P.y;window._livingQaClock=setInterval(()=>_gameTime+=1000/60,1000/60);});
 for(const width of [1920,3840]){await p.setViewportSize({width,height:1080});await p.waitForTimeout(1500);
  for(const on of [false,true]){await p.evaluate(on=>window._Web3DLivingLayer.setEnabled(on),on);await p.waitForTimeout(300);await p.screenshot({path:out+`/moat-${on?'on':'off'}-${width}.png`});await record(p,context,`${width}-${on?'on':'off'}`,width);result.samples.push(await sample(p,`${width} ${on?'ON':'OFF'} 물리정지·표현활성/녹화없음`));}
 }
 await p.evaluate(()=>{clearInterval(window._livingQaClock);window._Web3DLivingLayer.setEnabled(true);});await p.setViewportSize({width:1920,height:1080});
 // Eight native camera views; simulation remains paused only for reproducibility.
 for(const [name,x,y]of [['start',4020,7420],['early',3680,6380],['arena',4000,5200],['left',2120,5480],['right',6600,3800],['landmark',5880,4310],['late',4000,2000],['exit',4000,520]]){await p.evaluate(({x,y})=>{P.x=x;P.y=y;G.cam.x=x;G.cam.y=y;},{x,y});await p.waitForTimeout(450);await p.screenshot({path:out+'/camera-'+name+'.png'});}
 // Same 64 enemy / 96 projectile starting state for both active stress samples.
 const dense=async on=>p.evaluate(on=>{window._btFramePause=true;P.x=4020;P.y=6500;G.cam.x=P.x;G.cam.y=P.y;P.hp=P.mhp=1000000;ens=[];projs.length=0;pProjs.length=0;const tiles=G._floorTiles.filter(c=>{const x=(c.tx+.5)*T,y=(c.ty+.5)*T,d=Math.hypot(x-P.x,y-P.y);return d>150&&d<800&&canMv(x,y,24);});for(let i=0;i<64;i++){const c=tiles[i*137%tiles.length],e=mkEn((c.tx+.5)*T,(c.ty+.5)*T,0,i%8,false,1,0);if(e)ens.push(e);}for(let i=0;i<96;i++){const a=i*6.283/96;spawnProj({x:P.x+Math.cos(a)*400,y:P.y+Math.sin(a)*300,vx:-Math.cos(a),vy:-Math.sin(a),life:900,ml:900,sz:2,el:0,dmg:20,friendly:false,redBean:true,parryClass:'physical',_commit:true});}window._Web3DLivingLayer.setEnabled(on);window._btFramePause=false;return {enemies:ens.length,bullets:projs.length};},on);
 for(const on of [false,true]){const start=await dense(on);const measurement=await sample(p,'활성 밀집 '+(on?'ON':'OFF')+' / HP100만 fixture');measurement.start=start;result.samples.push(measurement);await p.screenshot({path:out+'/dense-'+(on?'on':'off')+'.png'});}
 const cdp=await browser.newBrowserCDPSession();result.gpu=(await cdp.send('SystemInfo.getInfo')).gpu.devices;
 result.final=await p.evaluate(()=>({layer:window._Web3DLivingLayer.snapshot(),legacyCreated:!!window._Web3DTrial,legacyMap:!!window._Web3DTrialMap}));await fs.writeFile(out+'/qa-receipt.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result.samples));
 if(result.errors.length||result.http.length||result.final.layer.error)throw Error('실행 검수 오류 '+JSON.stringify({errors:result.errors,http:result.http}));
 }finally{await browser.close();}
})().catch(async e=>{console.error(e.stack);await fs.writeFile(out+'/failure.txt',e.stack);process.exitCode=1;});
