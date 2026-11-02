// Actual old menu renderer, same server and source snapshot, never a static mock.
const fs=require('node:fs/promises');
const out=process.env.TITLE_QA_OUT||'I:/EXODUSER-Storage/codex-takeover/title-clarity-20261102';
process.env.TEMP=out+'/temp';process.env.TMP=process.env.TEMP;
const {chromium}=require('playwright');
(async()=>{
 await fs.mkdir(out+'/temp',{recursive:true});
 const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio','--disable-gpu','--autoplay-policy=no-user-gesture-required']});
 try{
  const c=await b.newContext({viewport:{width:3840,height:1080},deviceScaleFactor:1});
  const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.route('**/title-signboard.js*',r=>r.fulfill({contentType:'application/javascript',path:out+'/before/title-signboard.js'}));
  await p.route('**/assets/title-signboard/C2/still.webp',r=>r.fulfill({contentType:'image/webp',path:out+'/before/assets__title-signboard__C2__still.webp'}));
  await p.goto(process.env.TITLE_QA_URL||'http://127.0.0.1:3384/index.html?test=1',{waitUntil:'domcontentloaded'});
  await p.waitForFunction(()=>TitleSignboard.current?.stats.videoFrames>5);
  await p.waitForFunction(()=>getComputedStyle(document.getElementById('splashTitleUI')).opacity==='1');
  for(const width of [1920,2560,3840]){
   await p.setViewportSize({width,height:1080});await p.waitForTimeout(650);
   await p.screenshot({path:out+'/before-menu-'+width+'.png'});
  }
  if(errors.length)throw Error(errors.join('\n'));
  console.log(JSON.stringify(await p.evaluate(()=>({src:TitleSignboard.current.video.currentSrc,size:[TitleSignboard.current.video.videoWidth,TitleSignboard.current.video.videoHeight],muted:TitleSignboard.current.video.muted,stats:TitleSignboard.current.stats}))));
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
