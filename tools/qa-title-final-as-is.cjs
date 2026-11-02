/* Read-only, muted actual-menu QA for the unprocessed final loop. */
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),sharp=require('sharp');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=process.env.TITLE_QA_OUT||'I:/EXODUSER-Storage/codex-takeover/title-final-as-is-20261102';
const url=process.env.TITLE_QA_URL||'http://127.0.0.1:3384/index.html?test=1';
const receipt={url,errors:[],http:[],saves:[],assets:[],sizes:[],policy:[],fallbacks:[],differences:[]};
const regions={moon:[1098,228,160,160],boots:[1280,685,250,57],person:[1280,260,500,520],rock:[1585,720,180,55],face:[1340,278,65,70],falls:[858,317,231,278]};
async function show(page){await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>TitleSignboard.current?.stats.ready);await page.waitForFunction(()=>getComputedStyle(document.getElementById('splashTitleUI')).opacity==='1');}
async function captureCrops(file,width,r){for(const [name,[x,y,w,h]]of Object.entries(regions)){
 const left=Math.max(0,Math.floor(r.x+x*r.scale)),top=Math.max(0,Math.floor(r.y+y*r.scale)),right=Math.min(width,Math.ceil(r.x+(x+w)*r.scale)),bottom=Math.min(1080,Math.ceil(r.y+(y+h)*r.scale));
 if(right<=left||bottom<=top)continue;
 const b=await sharp(file).extract({left,top,width:right-left,height:bottom-top}).png().toBuffer();await fs.writeFile(out+'/menu-'+width+'-'+name+'-1x.png',b);
 if(['rock','face','person'].includes(name))await sharp(b).resize((right-left)*3,(bottom-top)*3,{kernel:'nearest'}).png().toFile(out+'/menu-'+width+'-'+name+'-3x.png');
}}
async function natural(page,width){
 const folder=out+'/motion-'+width;await fs.mkdir(folder,{recursive:true});const timeline=[],start=Date.now();
 do{
  const s=await page.evaluate(()=>({clock:performance.now(),video:TitleSignboard.current.video.currentTime,flow:TitleSignboard.current.stats.time,frames:TitleSignboard.current.stats.frames,paused:TitleSignboard.current.video.paused}));
  s.file=String(timeline.length).padStart(3,'0')+'.jpg';timeline.push(s);await page.screenshot({path:folder+'/'+s.file,type:'jpeg',quality:93});await page.waitForTimeout(350);
 }while(Date.now()-start<10800);
 const elapsed=(timeline.at(-1).clock-timeline[0].clock)/1000;
 assert.ok(elapsed>=10,'natural menu observation >= 10 seconds');assert.ok(timeline.some((s,i)=>i&&s.video<timeline[i-1].video),'natural loop wrap');
 assert.ok(timeline.every(s=>!s.paused));for(let i=1;i<timeline.length;i++){assert.ok(timeline[i].frames>timeline[i-1].frames);assert.ok(timeline[i].clock-timeline[i-1].clock<2000,'no 2 second freeze');}
 await fs.writeFile(folder+'/timeline.json',JSON.stringify(timeline,null,2));return {elapsed,frames:timeline.length,timeline};
}
async function exactPairs(page){
 await page.evaluate(()=>{window.__nativeRAF=requestAnimationFrame;window.requestAnimationFrame=cb=>{if(String(cb).includes('stats.flowFrames')){window.__drawTitle=cb;return -1;}return __nativeRAF(cb);};const v=TitleSignboard.current.video;v.pause();v.play=()=>Promise.resolve();const c=document.getElementById('titleSignboardCanvas').getContext('2d'),nativeDraw=c.drawImage.bind(c);c.drawImage=function(...args){nativeDraw(...args);if(args[0]===v)window.__baseTitle=c.getImageData(0,0,c.canvas.width,c.canvas.height);};});
 await page.waitForFunction(()=>!!window.__drawTitle);
 const regions={near:[871,350,30,175],far:[1051,410,28,78],sky:[1000,245,80,30],rock:[1640,730,80,35],hair:[1620,390,50,45],cape:[1650,565,60,40],body:[1350,460,20,30]};
 for(const time of [1,3,5,7]){
  const pair=[];
  for(const t of [time,time+.1])pair.push(await page.evaluate(async({t,regions})=>{
   const s=TitleSignboard.current,v=s.video;await new Promise(resolve=>{v.addEventListener('seeked',resolve,{once:true});v.currentTime=t;});s.stats.time=t;window.__drawTitle(100000+t*1000);
   const cv=document.getElementById('titleSignboardCanvas'),c=cv.getContext('2d'),r=TitleSignboard.rect(innerWidth,innerHeight),base=window.__baseTitle;
   const pixels={};for(const[name,[x,y,w,h]]of Object.entries(regions)){const b=[Math.round(r.x+x*r.scale),Math.round(r.y+y*r.scale),Math.round(w*r.scale),Math.round(h*r.scale)],data=[];for(let yy=b[1];yy<b[1]+b[3];yy++)for(let xx=b[0];xx<b[0]+b[2];xx++){const i=(yy*cv.width+xx)*4;data.push(...base.data.subarray(i,i+4));}pixels[name]={final:Array.from(c.getImageData(...b).data),base:data};}
   let outsideChanges=0,insideChanges=0;const a=c.getImageData(0,0,cv.width,cv.height).data,b=base.data;
   for(let y=0;y<cv.height;y++)for(let x=0;x<cv.width;x++){const i=(y*cv.width+x)*4;if(a[i]===b[i]&&a[i+1]===b[i+1]&&a[i+2]===b[i+2])continue;const vx=(x-r.x)/r.scale,vy=(y-r.y)/r.scale;
    if((vx>=839&&vx<=951&&vy>=301&&vy<=604)||(vx>=1010&&vx<=1122&&vy>=365&&vy<=623))insideChanges++;else outsideChanges++;
   }
   return {t:v.currentTime,pixels,outsideChanges,insideChanges};
  },{t,regions}));
  const result={time,outsideChanges:pair.map(p=>p.outsideChanges),insideChanges:pair.map(p=>p.insideChanges)};
  console.log('pixel diagnostic '+JSON.stringify(result));assert.deepEqual(result.outsideChanges,[0,0],'every pixel outside the waterfall layer equals the unprocessed video');
  for(const name of Object.keys(regions)){result[name]={};for(const layer of ['final','base']){const a=pair[0].pixels[name][layer],b=pair[1].pixels[name][layer];let sum=0,count=0;for(let i=0;i<a.length;i++)if(i%4!==3){sum+=Math.abs(a[i]-b[i]);count++;}result[name][layer]=sum/count;}}
  receipt.differences.push(result);
 }
 for(const name of ['near','far'])assert.ok(receipt.differences.every(d=>d[name].final>d.sky.final),'both waterfalls visibly flow more than sky');
 for(const name of ['hair','cape','body','sky','rock'])for(const d of receipt.differences)assert.equal(d[name].final,d[name].base,'single unprocessed source '+name);
 await page.evaluate(()=>{window.requestAnimationFrame=window.__nativeRAF;});
}
(async()=>{
 await fs.mkdir(out+'/temp',{recursive:true});const source=await fs.readFile(root+'/title-signboard.js');const served=await fetch(new URL('/title-signboard.js',url)).then(r=>r.text());
 assert.equal(crypto.createHash('sha256').update(source).digest('hex'),crypto.createHash('sha256').update(served).digest('hex'),'server serves this checkout');
 receipt.servedSHA256=crypto.createHash('sha256').update(source).digest('hex');
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio','--autoplay-policy=no-user-gesture-required'],env:{...process.env,TEMP:out+'/temp',TMP:out+'/temp'}});
 try{
  const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1}),page=await context.newPage();
  page.on('pageerror',e=>receipt.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)receipt.http.push({url:r.url(),status:r.status()});});page.on('request',r=>{if(r.method()!=='GET'&&r.url().includes('/api/slots'))receipt.saves.push(r.url());if(/title-signboard\/C2|title_motion_C2/.test(r.url()))receipt.assets.push(r.url());});
  await show(page);
  for(const width of [1920,2560,3840]){
   await page.setViewportSize({width,height:1080});await page.waitForTimeout(600);
   const state=await page.evaluate(()=>({width:innerWidth,rect:TitleSignboard.rect(innerWidth,innerHeight),moon:TitleSignboard.moon,stats:{...TitleSignboard.current.stats},muted:TitleSignboard.current.video.muted,source:TitleSignboard.current.video.currentSrc,video:[TitleSignboard.current.video.videoWidth,TitleSignboard.current.video.videoHeight],logo:document.getElementById('splashTitleLogo').getBoundingClientRect().toJSON(),menu:document.getElementById('splashTitleMenu').getBoundingClientRect().toJSON(),scroll:document.documentElement.scrollWidth>innerWidth}));
   state.bounds={};for(const name of ['moon','boots']){const [x,y,w,h]=regions[name],r=state.rect,b={left:r.x+x*r.scale,top:r.y+y*r.scale,right:r.x+(x+w)*r.scale,bottom:r.y+(y+h)*r.scale};state.bounds[name]=b;assert.ok(b.left>=0&&b.top>=0&&b.right<=width&&b.bottom<=1080,'full moon and boot soles');}
   assert.deepEqual(state.video,[2036,1016]);assert.equal(state.muted,true);assert.equal(state.stats.error,null);assert.equal(state.stats.flowError,null);assert.equal(state.scroll,false);assert.ok(state.logo.x>=48&&state.menu.x>=48);
   const file=out+'/menu-'+width+'.png';await page.screenshot({path:file});await captureCrops(file,width,state.rect);state.observation=process.argv.includes('--reuse-natural')?JSON.parse(await fs.readFile(out+'/failure-receipt.json','utf8')).sizes.find(s=>s.width===width).observation:await natural(page,width);receipt.sizes.push(state);console.log('natural '+width+': '+state.observation.elapsed+'s');
  }
  await exactPairs(page);await show(page);
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(600);const a=await page.evaluate(()=>({...TitleSignboard.current.stats,paused:TitleSignboard.current.video.paused,currentTime:TitleSignboard.current.video.currentTime}));await page.waitForTimeout(600);const b=await page.evaluate(()=>({...TitleSignboard.current.stats,currentTime:TitleSignboard.current.video.currentTime}));assert.equal(a.paused,true);assert.equal(a.time,b.time);assert.equal(a.currentTime,b.currentTime);assert.equal(a.flowFrames,b.flowFrames);receipt.policy.push({mode:'os-reduced',a,b});await page.screenshot({path:out+'/reduced-3840.png'});
  await page.emulateMedia({reducedMotion:'no-preference'});
  for(const[opt,mode]of [[{quality:'low'},'low-tier'],[{atmos:0},'atmosphere-off'],[{reduceMotion:true},'reduced-motion']]){await page.evaluate(opt=>{localStorage.setItem('hellcave_settings',JSON.stringify({opt}));dispatchEvent(new Event('storage'));},opt);await page.waitForTimeout(600);const s=await page.evaluate(()=>({...TitleSignboard.current.stats,paused:TitleSignboard.current.video.paused}));assert.equal(s.mode,mode);assert.equal(s.paused,true);receipt.policy.push(s);}
  await page.evaluate(()=>{localStorage.removeItem('hellcave_settings');dispatchEvent(new Event('storage'));});await page.waitForTimeout(600);
  await page.keyboard.press('ArrowDown');assert.match(await page.locator('#splashTitleMenu .sel').innerText(),/인트로|INTRO/i);await page.keyboard.press('Home');await page.keyboard.press('Enter');await page.waitForTimeout(600);assert.equal(await page.locator('#titleSignboardCanvas').count(),0);receipt.navigation='passed';await context.close();
  for(const mode of ['cold-reduced','video-error','waterfall-error']){
   const c=await browser.newContext({viewport:{width:3840,height:1080},deviceScaleFactor:1,reducedMotion:mode==='cold-reduced'?'reduce':'no-preference'}),p=await c.newPage();
   if(mode==='video-error')await p.route('**/video/title_motion_C2_final_*',r=>r.abort());if(mode==='waterfall-error')await p.route('**/fall-*.png*',r=>r.abort());await show(p);await p.waitForTimeout(600);
   const s=await p.evaluate(()=>({...TitleSignboard.current.stats,paused:TitleSignboard.current.video.paused,menu:document.querySelectorAll('#splashTitleMenu li').length}));assert.ok(s.menu>=2);
   if(mode==='cold-reduced'){assert.equal(s.mode,'reduced-motion');assert.equal(s.paused,true);assert.equal(s.flowFrames,0);assert.ok(s.videoFrames>0);}
   if(mode==='video-error'){assert.equal(s.mode,'media-error');assert.equal(s.paused,true);}
   if(mode==='waterfall-error'){assert.equal(s.mode,'motion');assert.ok(s.flowError);assert.equal(s.paused,false);}
   receipt.fallbacks.push({mode,...s});await p.screenshot({path:out+'/'+mode+'.png'});await c.close();
  }
  assert.equal(receipt.errors.length,0);assert.equal(receipt.http.length,0);assert.equal(receipt.saves.length,0);
  assert.ok(receipt.assets.every(u=>/title_motion_C2_final_20261102\.mp4|fall-(near|far)\.png/.test(u)),'only final video and waterfall masks requested');
  await fs.writeFile(out+'/qa-receipt.json',JSON.stringify(receipt,null,2));console.log(JSON.stringify({sizes:receipt.sizes.map(s=>({width:s.width,seconds:s.observation.elapsed,bounds:s.bounds})),differences:receipt.differences,policy:receipt.policy.map(s=>s.mode),fallbacks:receipt.fallbacks.map(s=>s.mode),errors:receipt.errors,http:receipt.http,saves:receipt.saves}));
 }finally{await browser.close();}
})().catch(async e=>{console.error(e);await fs.writeFile(out+'/failure-receipt.json',JSON.stringify({...receipt,error:e.stack},null,2));process.exitCode=1;});
