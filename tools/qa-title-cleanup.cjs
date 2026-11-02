/* Actual menu QA on the existing server: headless muted Chromium, GLSL enabled.
 * No save writes, server lifecycle changes, paid requests, or encoding here. */
const fs=require('node:fs/promises'),assert=require('node:assert/strict'),sharp=require('sharp'),crypto=require('node:crypto');
const out=process.env.TITLE_QA_OUT||'I:/EXODUSER-Storage/codex-takeover/title-cleanup-20261102/final/verified';
const url=process.env.TITLE_QA_URL||'http://127.0.0.1:3384/index.html?test=1';
const {chromium}=require('playwright');
const receipt={url,errors:[],http:[],saves:[],sizes:[],policy:[],fallbacks:[],timeline:[],recordings:[],differences:[]};
const regions={sky:[1000,250,80,30],rock:[1640,740,100,35],person:[1290,269,465,467],moon:[1101,230,158,158],boots:[1300,698,226,38],oldMoon:[1133,88,158,158],seams:[1025,10,335,445]};
function bounds(r,box){const [x,y,w,h]=box;return {left:r.x+x*r.scale,top:r.y+y*r.scale,right:r.x+(x+w)*r.scale,bottom:r.y+(y+h)*r.scale};}
async function show(page){await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>TitleSignboard.current?.stats.videoFrames>3);await page.waitForFunction(()=>getComputedStyle(document.getElementById('splashTitleUI')).opacity==='1');}
async function crop(file,prefix,r,w){for(const [key,region]of Object.entries(regions)){const b=bounds(r,region),left=Math.max(0,Math.floor(b.left)-8),top=Math.max(0,Math.floor(b.top)-8),right=Math.min(w,Math.ceil(b.right)+8),bottom=Math.min(1080,Math.ceil(b.bottom)+8);if(bottom>top&&right>left)await sharp(file).extract({left,top,width:right-left,height:bottom-top}).png().toFile(out+'/'+prefix+'-'+key+'-1x.png');}}
async function record(page, context, width) {
  const folder = out + '/frames-' + width;
  await fs.mkdir(folder, {recursive:true});
  if(process.argv.includes('--reuse-recordings')) {
    const previous=await fs.readFile(folder+'/timeline.json','utf8').then(JSON.parse).catch(()=>null);
    if(previous?.length>50 && previous.at(-1).t-previous[0].t>=10) {receipt.recordings.push({width,frames:previous.length,duration:previous.at(-1).t-previous[0].t,folder,reused:true});return;}
  }
  const cdp = await context.newCDPSession(page), frames=[], writes=[];
  cdp.on('Page.screencastFrame', e => {
    const file = String(frames.length).padStart(5,'0') + '.jpg';
    frames.push({file, t:e.metadata.timestamp});
    writes.push(fs.writeFile(folder+'/'+file, Buffer.from(e.data,'base64')));
    cdp.send('Page.screencastFrameAck', {sessionId:e.sessionId}).catch(()=>{});
  });
  await cdp.send('Page.startScreencast', {format:'jpeg', quality:94, maxWidth:width, maxHeight:1080, everyNthFrame:3});
  await page.waitForTimeout(10500);
  await cdp.send('Page.stopScreencast');
  await Promise.all(writes);
  await cdp.detach();
  const duration = frames.at(-1).t - frames[0].t;
  assert.ok(duration >= 10, 'recording covers at least 10 real seconds');
  assert.ok(frames.length >= 30, 'recording contains actual advancing frames');
  const concat = ['ffconcat version 1.0'];
  frames.forEach((f,i) => {
    concat.push("file '"+f.file+"'");
    if(i<frames.length-1) concat.push('duration '+(frames[i+1].t-f.t));
  });
  await fs.writeFile(folder+'/frames.ffconcat', concat.join('\n')+'\n');
  await fs.writeFile(folder+'/timeline.json', JSON.stringify(frames));
  receipt.recordings.push({width, frames:frames.length, duration, folder});
}
async function deterministicPairs(page) {
  // A separate exact-time diagnostic. Natural motion is recorded above without overrides.
  await page.evaluate(() => {
    window.__qaNativeRAF = requestAnimationFrame;
    window.requestAnimationFrame = cb => {
      if(String(cb).includes('stats.flowFrames')) { window.__qaTitleDraw=cb; return -1; }
      return window.__qaNativeRAF(cb);
    };
    const v=TitleSignboard.current.video;v.pause();v.play=()=>Promise.resolve();
  });
  await page.waitForFunction(() => !!window.__qaTitleDraw);
  for(const time of [1,3,5,7]) {
    const pair=[];
    for(const t of [time,time+.1]) {
      pair.push(await page.evaluate(async ({t,regions}) => {
        const scene=TitleSignboard.current, v=scene.video;
        await new Promise(resolve => {v.addEventListener('seeked',resolve,{once:true});v.currentTime=t;});
        scene.stats.time=t;
        window.__qaTitleDraw(100000+t*1000);
        const canvas=document.getElementById('titleSignboardCanvas'), c=canvas.getContext('2d');
        const raw=document.createElement('canvas');raw.width=canvas.width;raw.height=canvas.height;
        const rc=raw.getContext('2d'), r=TitleSignboard.rect(innerWidth,innerHeight);
        rc.drawImage(v,r.x,r.y,r.width,r.height);
        const pixels={};
        for(const [key,[x,y,w,h]] of Object.entries({sky:regions.sky,rock:regions.rock,hub:[1417,350,12,12],blade:[1490,558,10,30],body:[1350,470,15,20],boots:[1380,738,25,12],hair:[1680,400,25,25],cape:[1720,580,25,25]})) {
          const box=[Math.round(r.x+x*r.scale),Math.round(r.y+y*r.scale),Math.round(w*r.scale),Math.round(h*r.scale)];
          pixels[key]={final:Array.from(c.getImageData(...box).data),base:Array.from(rc.getImageData(...box).data)};
        }
        return {t:v.currentTime,flowTime:scene.stats.time,pixels};
      },{t,regions}));
    }
    const difference={time,dt:pair[1].t-pair[0].t,flowDt:pair[1].flowTime-pair[0].flowTime};
    for(const name of ['sky','rock','hub','blade','body','boots','hair','cape']) {
      difference[name]={};
      for(const layer of ['final','base']) {
        const a=pair[0].pixels[name][layer],b=pair[1].pixels[name][layer];let sum=0,count=0;
        for(let i=0;i<a.length;i++)if(i%4!==3){sum+=Math.abs(a[i]-b[i]);count++;}
        difference[name][layer]=sum/count;
      }
    }
    receipt.differences.push(difference);
  }
  await page.evaluate(() => {window.requestAnimationFrame=window.__qaNativeRAF;});
}

(async()=>{
 await fs.mkdir(out+'/temp',{recursive:true});
 const js=await fetch(new URL('/title-signboard.js',url)).then(r=>r.text());assert.ok(js.includes("moon-static.webp"),'server serves current working tree');
 receipt.servedSHA256=crypto.createHash('sha256').update(js).digest('hex');
 assert.equal(receipt.servedSHA256,crypto.createHash('sha256').update(await fs.readFile(require('node:path').resolve('title-signboard.js'))).digest('hex'),'server bytes match this checkout');
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio','--autoplay-policy=no-user-gesture-required'],env:{...process.env,TEMP:out+'/temp',TMP:out+'/temp'}});
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
   assert.equal(state.stats.characterRenderer,'webgl-still-displacement');assert.ok(state.stats.characterFrames>0);
   const name='menu-'+width,file=out+'/'+name+'.png';await page.screenshot({path:file});await crop(file,name,state.rect,width);await record(page,context,width);
   assert.equal(state.stats.cloudRenderer,'webgl-flow');
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
  await deterministicPairs(page);await show(page);
  for(const d of receipt.differences)assert.ok(d.sky.final>=3*d.rock.final&&d.sky.final>.15,'sky 0.1-second motion >= three times rock');
  for(const d of receipt.differences)for(const key of ['hub','blade','body','boots'])assert.equal(d[key].final,0,key+' stays rigid in actual renderer');
  for(const key of ['hair','cape'])assert.ok(receipt.differences.some(d=>d[key].final>.001),key+' tips actually move');
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
