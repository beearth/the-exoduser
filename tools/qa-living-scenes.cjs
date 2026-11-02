/* Real DOM fixtures, isolated storage, hardware Chromium, silent evidence and responsiveness. */
const fs=require('fs'),fsp=fs.promises,path=require('path'),cp=require('child_process'),assert=require('assert/strict'),crypto=require('crypto');
const {chromium}=require('playwright'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),out=process.env.LIVING_OUT||'I:/EXODUSER-Storage/codex-takeover/living-1102/evidence',base=process.env.LIVING_URL||'http://127.0.0.1:3384';
const mode=process.argv[2]||'smoke',group=process.argv[3]||'index',record=mode==='record';
const ids=Array.from({length:19},(_,i)=>String(i+1)).filter(n=>!['13','14','17'].includes(n)).concat(['rd1','rd2','rd4','rd5','rd6','rd7','rd8','rd9','rd10','rd11','rd12','rd13','rd14','rd15','rd16','rd17']);
const rows=[],errors=[],http=[],writes=[];let browser;
const receipt={root,base,source:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),mode,group,fixture:'native DOM held for review; no natural combat-play claim',rows,errors,http,writes};
receipt.runtimeFiles=Object.fromEntries(['living-scenes.js','living-scenes.css','fullscreen-art-dom.js','lobby-ancestor-sprite.js','index.html','game.html'].map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')]));
const save=()=>fs.writeFileSync(out+'/'+mode+'-'+group+'.json',JSON.stringify(receipt,null,2));
function run(exe,args){return new Promise((resolve,reject)=>{const p=cp.spawn(exe,args,{windowsHide:true,stdio:['ignore','ignore','pipe']});let stderr='';p.stderr.on('data',s=>stderr+=s);p.on('error',reject);p.on('close',c=>c?reject(new Error(stderr)):resolve());});}
async function record10(page,context,prefix){
 const folder=out+'/temp/'+prefix;await fsp.mkdir(folder,{recursive:true});
 const cdp=await context.newCDPSession(page),frames=[],pending=[];
 cdp.on('Page.screencastFrame',e=>{const name=String(frames.length).padStart(5,'0')+'.jpg';frames.push({file:name,t:e.metadata.timestamp});pending.push(fsp.writeFile(folder+'/'+name,Buffer.from(e.data,'base64')));cdp.send('Page.screencastFrameAck',{sessionId:e.sessionId}).catch(()=>{});});
 await cdp.send('Page.startScreencast',{format:'jpeg',quality:96,maxWidth:page.viewportSize().width,maxHeight:page.viewportSize().height,everyNthFrame:2});
 const perf=await measure(page,10500);await cdp.send('Page.stopScreencast');await Promise.all(pending);await cdp.detach();
 const duration=frames.at(-1).t-frames[0].t;assert.ok(duration>=10,`recording too short: ${duration}`);
 const concat=['ffconcat version 1.0'];for(let i=0;i<frames.length-1;i++)concat.push(`file '${frames[i].file}'`,`duration ${frames[i+1].t-frames[i].t}`);concat.push(`file '${frames.at(-1).file}'`);await fsp.writeFile(folder+'/frames.ffconcat',concat.join('\n')+'\n');
 await run(process.env.FFMPEG||'C:/Users/심도진/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe',['-hide_banner','-loglevel','error','-y','-safe','0','-i',folder+'/frames.ffconcat','-vf','fps=25,tpad=stop_mode=clone:stop_duration=0.12','-r','25','-t','10','-an','-c:v','libx264','-preset','veryfast','-crf','16','-pix_fmt','yuv420p',out+'/'+prefix+'.mp4']);
 await fsp.rm(folder,{recursive:true,force:true});return{...perf,recordedFrames:frames.length,recordedSeconds:duration,video:prefix+'.mp4'};
}
async function measure(page,ms){return page.evaluate(duration=>new Promise(resolve=>{const start=performance.now(),s0={...LivingScenes.stats};let frames=0,last=start,max=0;function step(t){frames++;max=Math.max(max,t-last);last=t;if(t-start<duration)requestAnimationFrame(step);else{const s=LivingScenes.stats;resolve({duration:t-start,frames,fps:frames*1000/(t-start),maxFrameMs:max,renderFrames:s.frames-s0.frames,meanRenderMs:(s.renderMs-s0.renderMs)/Math.max(1,s.frames-s0.frames),maxRenderMs:s.maxRenderMs});}}requestAnimationFrame(step);}),ms);}
async function screenshotPair(page,prefix){
 await page.evaluate(()=>{LivingScenes.setReduced(true);const im=document.querySelector('.living-still');if(im){im.dataset.clean=im.src;im.src=LivingScenes.stats.source;}});await page.waitForTimeout(160);
 await page.screenshot({path:out+'/'+prefix+'-original.png'});
 await page.evaluate(()=>{const im=document.querySelector('.living-still');if(im?.dataset.clean)im.src=im.dataset.clean;LivingScenes.setReduced(false);});await page.waitForTimeout(200);
 await page.screenshot({path:out+'/'+prefix+'-motion.png'});
 const {width,height}=page.viewportSize();await sharp({create:{width:width*2,height,channels:3,background:'#050506'}}).composite([{input:out+'/'+prefix+'-original.png',left:0,top:0},{input:out+'/'+prefix+'-motion.png',left:width,top:0}]).png().toFile(out+'/'+prefix+'-compare.png');
 for(const [name,x,y]of [['person',.38,.3],['stone',.08,.66],['sky',.57,.06]]){
  const left=Math.min(width-180,Math.round(width*x)),top=Math.min(height-140,Math.round(height*y));
  await sharp(out+'/'+prefix+'-motion.png').extract({left,top,width:180,height:140}).resize(540,420,{kernel:'nearest'}).png().toFile(out+'/'+prefix+'-'+name+'-3x.png');
 }
}
async function snap(page,context,name){
 if(process.env.LIVING_CASES&&!process.env.LIVING_CASES.split(',').includes(name))return;
 await page.waitForFunction(()=>LivingScenes.stats.active&&LivingScenes.stats.frames>0);
 await page.waitForFunction(()=>!LivingScenes.stats.source||(LivingScenes.stats.stillReady&&LivingScenes.stats.stillSource===LivingScenes.stats.source),null,{timeout:90000});
 await page.waitForTimeout(450);
 const {width,height}=page.viewportSize(),prefix=name+'-'+width+'x'+height;
 await screenshotPair(page,prefix);
 const initial=await page.evaluate(()=>({stats:{...LivingScenes.stats},canvas:document.querySelector('.living-scene:not([hidden])')?.toDataURL()}));
 assert.equal(initial.stats.reason,null);assert.equal(initial.stats.error,null);
 const perf=record?await record10(page,context,prefix):await measure(page,900);
 const after=await page.evaluate(()=>({stats:{...LivingScenes.stats},canvas:document.querySelector('.living-scene:not([hidden])')?.toDataURL(),overflow:document.documentElement.scrollWidth>innerWidth,pointer:getComputedStyle(document.querySelector('.living-scene:not([hidden])')).pointerEvents,oldDots:[...document.querySelectorAll('#lobbyParticles,.cs-embers,.fullscreen-atmosphere')].filter(e=>e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})&&getComputedStyle(e).display!=='none').map(e=>e.id||e.className)}));
 assert.notEqual(after.canvas,initial.canvas,prefix+': frozen layer');assert.equal(after.overflow,false);assert.equal(after.pointer,'none');
 const row={name,width,height,...perf,stats:after.stats,oldDots:after.oldDots};rows.push(row);save();console.log(prefix,perf.fps.toFixed(1)+'fps',perf.meanRenderMs.toFixed(3)+'ms',after.stats.suppressedSpecks+' suppressed');
 await page.screenshot({path:out+'/'+prefix+'-end.png'});
}
async function indexFixture(page){
 await page.goto(base+'/index.html?test=1&lobby=1',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>typeof openVisualSelect==='function');
 await page.evaluate(()=>{for(const id of ['splashOverlay','fdgScreen','cinClickPrompt','cinScene','mainWrap']){const e=document.getElementById(id);if(e)e.style.display='none';}document.getElementById('lobby').style.display='flex';LivingScenes.refresh();});
}
async function gameFixture(page){
 await page.goto(base+'/game.html?forgelab=1&tutorial=0&resourceTutorial=0',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>typeof P!=='undefined'&&P?.lv===1000&&!_bootLoadActive&&G.on,null,{timeout:180000});
 await page.waitForTimeout(1000);
 await page.evaluate(()=>{window._btFramePause=true;G.on=false;G.paused=true;_benchDone=true;_hwTier='A';OPT.atmos=2;OPT.quality='high';OPT.reduceMotion=false;OPT.sfxVol=OPT.bgmVol=0;_cutsceneState=null;_cutC.style.display='none';closeAllPanels(true);for(const id of ['stageTransition','introKeys','introDiff','tutorial','death','demoEnd','stageClear','victory']){const e=document.getElementById(id);if(e){e.style.display='none';e.style.opacity='0';}}LivingScenes.refresh();});
}
(async()=>{
 await fsp.mkdir(out+'/temp',{recursive:true});
 receipt.started=new Date().toISOString();receipt.dotaRunning=cp.execFileSync('C:/Windows/System32/tasklist.exe',['/FI','IMAGENAME eq dota2.exe','/FO','CSV','/NH'],{encoding:'utf8',windowsHide:true}).includes('dota2.exe');
 browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio','--autoplay-policy=no-user-gesture-required'],env:{...process.env,TEMP:out+'/temp',TMP:out+'/temp'}});
 try{
 const sizes=mode==='edges'?[[2560,1080],[2560,1600]]:(mode==='probe'?[1920]:record?[1920,3840]:[1920,2560,3840]).map(width=>[width,1080]);
 for(const [width,height] of sizes){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
  await context.addInitScript(()=>{localStorage.setItem('hellLang','ko');localStorage.setItem('hellcave_settings',JSON.stringify({opt:{sfxVol:0,bgmVol:0,quality:'high',atmos:2,reduceMotion:false}}));});
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)http.push({url:r.url(),status:r.status()});});
  await page.route('**/api/slots**',r=>{if(!['GET','HEAD'].includes(r.request().method()))writes.push(r.request().method()+' '+r.request().url());return r.fulfill({json:{slots:[],activeId:null}});});
  if(group==='index'){
   await indexFixture(page);await page.waitForTimeout(1400);await snap(page,context,'lobby');
   await page.evaluate(()=>openVisualSelect());for(let i=0;i<(mode==='probe'?1:5);i++){await page.evaluate(i=>{selectVisual(i);LivingScenes.refresh();},i);await page.waitForTimeout(1000);await snap(page,context,'hero-'+i);}
   // Actual keyboard selection and cancellation, retaining the existing release locks.
   await page.locator('#visualGrid button').first().focus();const started=Date.now();await page.keyboard.press('ArrowRight');assert.equal(await page.locator('#visualGrid .sel').getAttribute('data-vi'),'1');receipt.inputMs=Date.now()-started;await page.keyboard.press('Escape');assert.equal(await page.locator('#charVisualPop').isVisible(),false);
   for(const [setting,reason]of [[{reduceMotion:true},'reduced-motion'],[{quality:'low'},'low-tier'],[{atmos:0},'atmosphere-off']]){
    await page.evaluate(setting=>{localStorage.setItem('hellcave_settings',JSON.stringify({opt:{quality:'high',atmos:2,...setting}}));LivingScenes.refresh();},setting);await page.waitForTimeout(420);const a=await page.evaluate(()=>({...LivingScenes.stats}));assert.equal(a.reason,reason);await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>LivingScenes.stats.frames),a.frames);
   }
   await page.evaluate(()=>{localStorage.setItem('hellcave_settings',JSON.stringify({opt:{quality:'high',atmos:2}}));LivingScenes.refresh();});
   await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>matchMedia('(prefers-reduced-motion: reduce)').matches&&LivingScenes.stats.reason==='reduced-motion');await page.emulateMedia({reducedMotion:'no-preference'});
  }else{
   await gameFixture(page);
   if(group.startsWith('loading'))for(const id of (group==='loading-repair'?ids.filter(x=>['1','2','rd2','rd4','rd7','rd8','rd12'].includes(x)):ids)){
    await page.evaluate(id=>{const e=document.getElementById('stageTransition');e.style.display='flex';e.style.opacity='1';e.style.pointerEvents='all';LoadingArt.set(document.getElementById('stRndImg'),'img/lording/'+id+(id==='rd11'?'.jpg':'.png'));document.getElementById('stNextName').textContent='에셋 로딩 중...';document.getElementById('stLoadBar').style.width='65%';LivingScenes.refresh();},id);
    await page.waitForFunction(id=>document.getElementById('stRndImg').src.includes('/wide/'+id+'-')&&document.getElementById('stRndImg').complete,id);await page.evaluate(()=>LivingScenes.refresh());await page.waitForTimeout(900);await snap(page,context,'loading-'+id);
   }else{
    for(const name of ['clear','death','end']){
     await page.evaluate(name=>{for(const id of ['stageClear','death','demoEnd']){const e=document.getElementById(id);e.style.display='none';e.style.opacity='0';}const id={clear:'stageClear',death:'death',end:'demoEnd'}[name],e=document.getElementById(id);if(name==='clear'){G.stageCleared=true;G._bossClearT=127;G._stageKills=80;_showClearResult();}e.style.display=name==='clear'?'block':'flex';e.style.opacity='1';e.style.pointerEvents='all';LivingScenes.refresh();},name);await snap(page,context,name);
    }
   }
  }
  await context.close();
 }
 assert.equal(errors.length,0);assert.equal(writes.length,0);assert.equal(http.length,0);receipt.finished=new Date().toISOString();save();
 }finally{await browser.close();}
})().catch(e=>{receipt.failure=e.stack;save();console.error(e);process.exitCode=1;});
