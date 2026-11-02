/* Actual menu QA. Reuses the already running title server; no save writes,
 * server lifecycle, GPU, video encoding, or paid requests. */
const fs=require('node:fs/promises'),assert=require('node:assert/strict'),sharp=require('sharp'),crypto=require('node:crypto');
const out=process.env.TITLE_QA_OUT||'I:/EXODUSER-Storage/codex-takeover/title-moon-20261102';
const url=process.env.TITLE_QA_URL||'http://127.0.0.1:3384/index.html?test=1';
const {chromium}=require('playwright');
const receipt={url,errors:[],http:[],saves:[],sizes:[],policy:[],fallbacks:[],timeline:[]};
const regions={moon:[1101,230,158,158],boots:[1300,698,226,38],oldMoon:[1133,88,158,158],seams:[1025,10,335,445]};
function bounds(r,box){const [x,y,w,h]=box;return {left:r.x+x*r.scale,top:r.y+y*r.scale,right:r.x+(x+w)*r.scale,bottom:r.y+(y+h)*r.scale};}
async function show(page){await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>TitleSignboard.current?.stats.videoFrames>3);await page.waitForFunction(()=>getComputedStyle(document.getElementById('splashTitleUI')).opacity==='1');}
async function crop(file,prefix,r,w){for(const [key,region]of Object.entries(regions)){const b=bounds(r,region),left=Math.max(0,Math.floor(b.left)-8),top=Math.max(0,Math.floor(b.top)-8),right=Math.min(w,Math.ceil(b.right)+8),bottom=Math.min(1080,Math.ceil(b.bottom)+8);if(bottom>top&&right>left)await sharp(file).extract({left,top,width:right-left,height:bottom-top}).png().toFile(out+'/'+prefix+'-'+key+'-1x.png');}}
(async()=>{
 await fs.mkdir(out+'/temp',{recursive:true});
 const js=await fetch(new URL('/title-signboard.js',url)).then(r=>r.text());assert.ok(js.includes("moon-static.webp"),'server serves current working tree');
 receipt.servedSHA256=crypto.createHash('sha256').update(js).digest('hex');
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio','--disable-gpu','--autoplay-policy=no-user-gesture-required'],env:{...process.env,TEMP:out+'/temp',TMP:out+'/temp'}});
 try{
  const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1}),page=await context.newPage();
  page.on('pageerror',e=>receipt.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)receipt.http.push({url:r.url(),status:r.status()});});page.on('request',r=>{if(r.method()!=='GET'&&r.url().includes('/api/slots'))receipt.saves.push(r.url());});
  await show(page);
  for(const width of [1920,2560,3840]){
   await page.setViewportSize({width,height:1080});await page.waitForTimeout(600);
   const state=await page.evaluate(()=>({width:innerWidth,rect:TitleSignboard.rect(innerWidth,innerHeight),moon:TitleSignboard.moon,stats:{...TitleSignboard.current.stats},muted:TitleSignboard.current.video.muted,video:[TitleSignboard.current.video.videoWidth,TitleSignboard.current.video.videoHeight],logo:document.getElementById('splashTitleLogo').getBoundingClientRect().toJSON(),menu:document.getElementById('splashTitleMenu').getBoundingClientRect().toJSON(),scroll:document.documentElement.scrollWidth>innerWidth}));
   state.bounds=Object.fromEntries(['moon','boots'].map(k=>[k,bounds(state.rect,regions[k])]));
   for(const b of Object.values(state.bounds)){assert.ok(b.left>=0&&b.top>=0&&b.right<=width&&b.bottom<=1080,'full moon and boot soles');}
   assert.equal(state.muted,true);assert.equal(state.stats.error,null);assert.ok(state.stats.moonFrames>0);assert.equal(state.scroll,false);assert.ok(state.logo.x>=48&&state.menu.x>=48);receipt.sizes.push(state);
   const name='menu-'+width,file=out+'/'+name+'.png';await page.screenshot({path:file});await crop(file,name,state.rect,width);
   const start=Date.now(),timeline=[];let sample=0;
   while(Date.now()-start<11200){
    timeline.push(await page.evaluate(()=>({clock:performance.now(),video:TitleSignboard.current.video.currentTime,scene:TitleSignboard.current.stats.time,frames:TitleSignboard.current.stats.frames,moonFrames:TitleSignboard.current.stats.moonFrames,alpha:TitleSignboard.current.stats.pulseAlpha})));
    if(Date.now()-start>=sample*2500&&sample<5){await page.screenshot({path:out+'/motion-'+width+'-'+sample+'.png'});sample++;}
    await page.waitForTimeout(200);
   }
   assert.ok(timeline.at(-1).scene-timeline[0].scene>=10,'scene crosses a complete pulse');assert.ok(timeline.some((v,i)=>i&&v.video<timeline[i-1].video),'natural playback crosses loop boundary');
   assert.ok(Math.max(...timeline.map(v=>v.alpha))>.028&&Math.min(...timeline.map(v=>v.alpha))<.012,'weak pulse covers both extrema');
   receipt.timeline.push({width,samples:timeline});
  }
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(600);
  const frozen=await page.evaluate(()=>({...TitleSignboard.current.stats,paused:TitleSignboard.current.video.paused}));await page.waitForTimeout(600);const after=await page.evaluate(()=>({...TitleSignboard.current.stats}));assert.equal(after.time,frozen.time);assert.equal(after.moonFrames,frozen.moonFrames);assert.equal(after.pulseAlpha,0);assert.equal(frozen.paused,true);receipt.policy.push({mode:'reduced',frozen,after});await page.screenshot({path:out+'/reduced-3840.png'});
  await page.emulateMedia({reducedMotion:'no-preference'});
  for(const [opt,mode]of [[{quality:'low'},'low-tier'],[{atmos:0},'atmosphere-off'],[{reduceMotion:true},'reduced-motion']]){await page.evaluate(opt=>{localStorage.setItem('hellcave_settings',JSON.stringify({opt}));dispatchEvent(new Event('storage'));},opt);await page.waitForTimeout(600);const s=await page.evaluate(()=>({...TitleSignboard.current.stats,paused:TitleSignboard.current.video.paused}));assert.equal(s.mode,mode);assert.equal(s.paused,true);assert.equal(s.pulseAlpha,0);receipt.policy.push(s);}
  await page.evaluate(()=>{localStorage.removeItem('hellcave_settings');dispatchEvent(new Event('storage'));});await page.waitForTimeout(600);
  await page.keyboard.press('ArrowDown');assert.match(await page.locator('#splashTitleMenu .sel').innerText(),/인트로|INTRO/i);await page.keyboard.press('Home');await page.keyboard.press('Enter');await page.waitForTimeout(600);assert.equal(await page.locator('#titleSignboardCanvas').count(),0);receipt.navigation='passed';await context.close();
  for(const mode of ['video','plate']){
   const c=await browser.newContext({viewport:{width:3840,height:1080},deviceScaleFactor:1}),p=await c.newPage();
   await p.route(mode==='video'?'**/video/title_motion_C2_close_*':'**/moon-static.webp',r=>r.abort());await p.goto(url,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>TitleSignboard.current?.stats.ready&&TitleSignboard.current?.stats.error);await p.waitForTimeout(600);
   const result=await p.evaluate(()=>({stats:{...TitleSignboard.current.stats},still:TitleSignboard.current.still.src,menu:document.querySelectorAll('#splashTitleMenu li').length}));assert.equal(result.stats.mode,'still-fallback');assert.equal(result.stats.pulseAlpha,0);assert.equal(result.stats.videoFrames,0);assert.ok(result.menu>=2);receipt.fallbacks.push({mode,...result});await p.screenshot({path:out+'/fallback-'+mode+'-3840.png'});await c.close();
  }
  assert.equal(receipt.errors.length,0);assert.equal(receipt.http.length,0);assert.equal(receipt.saves.length,0);
  await fs.writeFile(out+'/qa-receipt.json',JSON.stringify(receipt,null,2));console.log(JSON.stringify({sizes:receipt.sizes,errors:receipt.errors,http:receipt.http,saves:receipt.saves,navigation:receipt.navigation,policy:receipt.policy.map(p=>p.mode),fallbacks:receipt.fallbacks.map(f=>f.mode)}));
 }finally{await browser.close();}
})().catch(async e=>{console.error(e);await fs.writeFile(out+'/failure.txt',e.stack);process.exitCode=1;});
