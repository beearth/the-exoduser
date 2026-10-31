import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(process.env.EXODUSER_TOOLS_PACKAGE||'G:/exoduser/package.json');
const {chromium}=require('playwright');
const mode=process.argv[2]||'smoke',suite=process.argv[3]||'index';
const recording=mode.startsWith('record'),fadeOnly=mode==='record-fade';
const output=process.env.WIDE_QA_OUTPUT||'I:/EXODUSER-Storage/wide-animation/20261031';
const base=process.env.WIDE_QA_URL||'http://127.0.0.1:3458';
const dir=path.join(output,mode,suite);fs.mkdirSync(dir,{recursive:true});
const baseline='63b31bb3f1cff6597e91115989aa45f940234e85';
const sizes=fadeOnly?[[1920,1080]]:recording?[[1920,1080],[2560,1080],[3840,1080]]:[[3840,1080]];
const receipt={mode,suite,root,baseline,screens:[],errors:[],missing:[],failures:[],forced:'화면 유지/컷신 시간 fixture, headless·무음·격리 서버/브라우저 저장. 자연 플레이 증거 아님.'};
process.env.TEMP=output;process.env.TMP=output;
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio'],env:{...process.env,TEMP:output,TMP:output}});
const save=()=>fs.writeFileSync(path.join(dir,'receipt.json'),JSON.stringify(receipt,null,2));
try{
 for(const [width,height]of sizes){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,...(recording?{recordVideo:{dir:path.join(dir,'raw'),size:{width,height}}}:{})});
  await context.addInitScript(()=>{localStorage.setItem('hellLang','ko');});
  const started=Date.now(),page=await context.newPage();
  const movie=page.video();
  page.on('pageerror',e=>receipt.errors.push({width,message:e.message}));
  page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base))receipt.missing.push({width,status:r.status(),url:r.url()});});
  await page.route('**/*',route=>{
   const request=route.request(),u=new URL(request.url());
   if(!['GET','HEAD'].includes(request.method()))return route.abort();
   if(u.origin===base){
    const file=decodeURIComponent(u.pathname).slice(1);
    if(mode.startsWith('before')&&['index.html','game.html','fullscreen-art.js','fullscreen-art-dom.js','fullscreen-art.css'].includes(file)){
     const body=execFileSync('C:/Program Files/Git/cmd/git.exe',['show',baseline+':'+file],{cwd:root,windowsHide:true,maxBuffer:16*1024*1024});
     return route.fulfill({body,contentType:file.endsWith('html')?'text/html':file.endsWith('css')?'text/css':'text/javascript'});
    }
    return route.continue();
   }
   return /fonts\.(googleapis|gstatic)\.com/.test(u.hostname)?route.continue():route.abort();
  });
  async function snap(name,videoId){
   const prefix=name+'-'+width+'x'+height;
   await page.waitForTimeout(700);
   if(videoId)await page.waitForFunction(id=>{const v=document.getElementById(id);return v.readyState>=2&&!v.paused;},videoId,{timeout:20000});
   await page.screenshot({path:path.join(dir,prefix+'-0.png')});
   const initial=await page.evaluate(id=>({time:id?document.getElementById(id).currentTime:null,atmospheres:[...document.querySelectorAll('.fullscreen-atmosphere')].filter(e=>!e.hidden&&e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})).map(e=>({width:e.width,height:e.height,parent:e.parentElement.id||e.parentElement.className,pixels:e.toDataURL()}))}),videoId);
   const startMs=Date.now()-started;
   const frames=await page.evaluate(duration=>new Promise(resolve=>{const start=performance.now();let frames=0,last=start,max=0;function step(t){frames++;max=Math.max(max,t-last);last=t;if(t-start<duration)requestAnimationFrame(step);else resolve({duration:t-start,frames,fps:frames*1000/(t-start),maxFrameMs:max});}requestAnimationFrame(step);}),recording?10300:500);
   await page.screenshot({path:path.join(dir,prefix+'-10.png')});
   const info=await page.evaluate(id=>({time:id?document.getElementById(id).currentTime:null,video:id?(()=>{const v=document.getElementById(id),r=v.getBoundingClientRect(),c=getComputedStyle(v);return {src:v.getAttribute('src'),rect:r.toJSON(),z:c.zIndex,mask:c.maskImage,wide:v.dataset.wideVideo,paused:v.paused,ready:v.readyState};})():null,
    atmospheres:[...document.querySelectorAll('.fullscreen-atmosphere')].filter(e=>!e.hidden&&e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})).map(e=>({parent:e.parentElement.id||e.parentElement.className,pixels:e.toDataURL()})),
    plates:[...document.querySelectorAll('.fullscreen-wide-plate')].filter(e=>e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})).map(e=>({id:e.id,src:e.getAttribute('src'),ready:e.dataset.wideReady,z:getComputedStyle(e).zIndex})),overflow:document.documentElement.scrollWidth>innerWidth}),videoId);
   const row={name,width,height,startMs,seconds:recording?10:.5,frames,video:info.video,videoAdvance:videoId?info.time-initial.time:null,atmosphereChanges:info.atmospheres.filter((e,i)=>e.pixels!==initial.atmospheres[i]?.pixels).length,plates:info.plates,overflow:info.overflow};
   if(info.overflow)receipt.failures.push(prefix+': overflow');
   if(videoId&&row.videoAdvance===0)receipt.failures.push(prefix+': frozen video');
   receipt.screens.push(row);save();console.log(prefix+' '+frames.fps.toFixed(1)+'fps video='+row.videoAdvance+' atmosphere='+row.atmosphereChanges);
  }
  if(suite==='index'){
   await page.goto(base+'/index.html?test=1&lobby=1',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>typeof openVisualSelect==='function');
   if(fadeOnly){
    await page.evaluate(()=>{document.getElementById('splashOverlay').style.display='none';document.getElementById('mainWrap').style.display='none';document.getElementById('lobby').style.display='none';document.getElementById('cinScene').style.display='block';document.getElementById('cinClickPrompt').style.display='none';document.getElementById('cinVideo').style.display='none';const el=document.getElementById('cinImg1');el.classList.add('show');const im=el.querySelector('img');FullscreenArt.picture(im,im.dataset.src);im.style.animation='cinZoomSlow 14s ease-out forwards';});
    await snap('world-legacy');
   }else{
   await page.evaluate(()=>_enterOffline());await page.waitForTimeout(1800);
   await snap('lobby-ancestor','lobbyAmbientVideo');
   await page.evaluate(()=>openVisualSelect());
   for(let i=0;i<5;i++){await page.evaluate(i=>selectVisual(i),i);await snap('character-'+i,'csIdleVid');}
   await page.evaluate(()=>_closeVisualSelect());
   for(let i=0;i<5;i++){await page.evaluate(i=>_updateCharDisplay({name:'검수 화신',charIdx:i}),i);await snap('lobby-character-'+i,'lobbyCharPreview');}
   if(recording){
    await page.evaluate(()=>{_updateCharDisplay(null);document.getElementById('lobby').style.display='none';document.getElementById('cinScene').style.display='block';document.getElementById('cinClickPrompt').style.display='flex';document.getElementById('cinVideo').style.display='none';});
    await snap('gate');
    await page.evaluate(()=>{document.getElementById('cinClickPrompt').style.display='none';const el=document.getElementById('cinImg1');el.classList.add('show');const im=el.querySelector('img');FullscreenArt.picture(im,im.dataset.src);im.style.animation='cinZoomSlow 14s ease-out forwards';});
    await snap('world-legacy');
    await page.evaluate(async()=>{document.querySelectorAll('.cin-img').forEach(e=>e.classList.remove('show'));document.getElementById('cinScene').classList.add('world-intro-active');const v=document.getElementById('worldIntroVideo');v.muted=true;await v.play();});
    await snap('world-movie','worldIntroVideo');
    await page.evaluate(()=>{document.getElementById('worldIntroVideo').pause();document.getElementById('cinScene').classList.remove('world-intro-active');});
    await page.evaluate(()=>{document.getElementById('cinScene').style.display='none';showLoading('지옥으로 입장하는 중...');});
    await snap('chapter-card');
   }
   }
  }else{
   await page.goto(base+'/game.html?forgelab=1&tutorial=0&resourceTutorial=0',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>typeof P!=='undefined'&&P?.lv===1000&&!_bootLoadActive&&G.on,null,{timeout:180000});
   await page.evaluate(()=>{window._btFramePause=true;G.on=false;G.paused=true;_benchDone=true;_hwTier='A';FullscreenArt.setMotionPolicy?.(()=>_hwTier!=='C');_cutsceneState=null;_cutC.style.display='none';for(const id of ['stageTransition','introKeys','introDiff','tutorial','death','demoEnd','stageClear']){const e=document.getElementById(id);if(e){e.style.display='none';e.style.opacity='0';}}});
   for(const seq of ['INTRO','PRO']){
    await page.evaluate(seq=>{_cutSeq=seq;const lns=_cutsceneGetLines();_cutLineIdx=lns.findIndex(x=>x.img);_cutsceneIdx=_cutLineIdx;_cutsceneState='INTRO_CUTSCENE';_cutLineStartMs=performance.now();const line=lns[_cutLineIdx];window.__qaOldDur=line.dur;line.dur=30000;_getCutsceneImg(line.img);},seq);
    await page.waitForTimeout(1300);await snap('cutscene-'+seq.toLowerCase());
    await page.evaluate(()=>{_cutsceneGetLines()[_cutLineIdx].dur=window.__qaOldDur;_cutsceneState=null;_cutC.style.display='none';});
   }
   await page.evaluate(()=>{const e=document.getElementById('death');e.style.display='flex';e.classList.add('on');e.style.opacity='1';});await snap('death');
   await page.evaluate(()=>{document.getElementById('death').style.display='none';const e=document.getElementById('stageClear');e.style.display='block';e.style.opacity='1';});await snap('clear');
   await page.evaluate(()=>{document.getElementById('stageClear').style.display='none';const e=document.getElementById('demoEnd');e.style.display='flex';e.style.opacity='1';});await snap('demo-end');
   await page.evaluate(()=>{document.getElementById('demoEnd').style.display='none';showBootLoading('에셋 로딩 중...');const e=document.getElementById('stageTransition');e.style.display='flex';e.style.opacity='1';e.style.zIndex='1000000';LoadingArt.set(document.getElementById('stRndImg'),'img/lording/1.png');document.getElementById('stLoadBar').style.width='65%';});await snap('loading');
  }
  const segments=receipt.screens.filter(s=>s.width===width);
  await context.close();
  if(movie){const raw=await movie.path();for(const s of segments)s.rawVideo=raw;save();}
 }
}catch(e){receipt.failures.push(e.stack);throw e;}finally{await browser.close();save();}
if(receipt.failures.length||receipt.errors.length)process.exitCode=1;
