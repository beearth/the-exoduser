const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(require.resolve('playwright',{paths:[process.cwd(),'G:/exoduser']}));
const sharp=require(require.resolve('sharp',{paths:[process.cwd(),'G:/exoduser']}));
const out='I:/EXODUSER-Storage/codex-takeover/title-signboard/runtime-A';
const url='http://127.0.0.1:3384/index.html?test=1';
(async()=>{
 await fs.mkdir(out+'/temp',{recursive:true});
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio','--autoplay-policy=no-user-gesture-required'],env:{...process.env,TEMP:out+'/temp',TMP:out+'/temp'}});
 const receipt={url,errors:[],http:[],sizes:[],videos:[]};
 try{
  const c=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
  const p=await c.newPage();p.on('pageerror',e=>receipt.errors.push(e.message));p.on('response',r=>{if(r.status()>=400&&r.url().startsWith('http://127.'))receipt.http.push({url:r.url(),status:r.status()});});
  await p.goto(url,{waitUntil:'domcontentloaded'});
  await p.waitForLoadState('networkidle');
  console.log('loaded',JSON.stringify(await p.evaluate(()=>({ui:!!document.getElementById('splashTitleUI'),display:getComputedStyle(document.getElementById('splashTitleUI')).display,scene:globalThis.TitleSignboard?.current?.stats,fdg:getComputedStyle(document.getElementById('fdgScreen')).display}))));
  if(await p.locator('#splashTitleUI').isHidden())await p.keyboard.press('Enter');
  if(process.argv.includes('--probe')){await p.waitForTimeout(1200);console.log('probe',JSON.stringify(await p.evaluate(()=>({scene:globalThis.TitleSignboard?.current?.stats,ui:getComputedStyle(document.getElementById('splashTitleUI')).display,errors:[]}))));await p.screenshot({path:out+'/probe.png'});return;}
  await p.waitForFunction(()=>getComputedStyle(document.getElementById('splashTitleUI')).display==='block'&&TitleSignboard.current.stats.frames>10,{},{timeout:30000});await p.waitForTimeout(1800);
  for(const width of [1920,2560,3840]){
   await p.setViewportSize({width,height:1080});await p.waitForTimeout(1200);
   const data=await p.evaluate(()=>({size:[innerWidth,innerHeight],stats:{...TitleSignboard.current.stats},rect:TitleSignboard.rect(innerWidth,innerHeight),logo:document.getElementById('splashTitleLogo').getBoundingClientRect().toJSON(),menu:document.getElementById('splashTitleMenu').getBoundingClientRect().toJSON(),items:[...document.querySelectorAll('#splashTitleMenu li')].map(e=>({text:e.textContent,rect:e.getBoundingClientRect().toJSON()})),video:!!document.getElementById('splashTitleVideo'),scroll:document.documentElement.scrollWidth>innerWidth}));
   assert.equal(data.video,false);assert.equal(data.scroll,false);assert.equal(data.stats.error,null);assert.ok(data.logo.x>=48&&data.menu.x>=48);receipt.sizes.push(data);
   await p.screenshot({path:out+`/menu-${width}.png`});
   if(!process.argv.includes('--record'))continue;
   if(width===2560)continue;
   const folder=out+`/frames-${width}`;await fs.mkdir(folder,{recursive:true});
   const cdp=await c.newCDPSession(p),frames=[],writes=[];
   cdp.on('Page.screencastFrame',e=>{const i=frames.length;frames.push({file:`${String(i).padStart(5,'0')}.jpg`,t:e.metadata.timestamp});writes.push(fs.writeFile(folder+'/'+frames[i].file,Buffer.from(e.data,'base64')));cdp.send('Page.screencastFrameAck',{sessionId:e.sessionId}).catch(()=>{});});
   await cdp.send('Page.startScreencast',{format:'jpeg',quality:94,maxWidth:width,maxHeight:1080,everyNthFrame:1});await p.waitForTimeout(10200);await cdp.send('Page.stopScreencast');await Promise.all(writes);await cdp.detach();
   const lines=['ffconcat version 1.0'];for(let i=0;i<frames.length-1;i++)lines.push(`file '${frames[i].file}'`,`duration ${frames[i+1].t-frames[i].t}`);lines.push(`file '${frames.at(-1).file}'`);await fs.writeFile(folder+'/frames.ffconcat',lines.join('\n')+'\n');
   receipt.videos.push({width,count:frames.length,duration:frames.at(-1).t-frames[0].t,folder});
   await p.screenshot({path:out+`/menu-${width}-end.png`});
  }
  await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(600);const frozen=await p.evaluate(()=>({...TitleSignboard.current.stats}));await p.waitForTimeout(600);const after=await p.evaluate(()=>({...TitleSignboard.current.stats}));assert.equal(after.time,frozen.time);assert.equal(after.frames,frozen.frames);receipt.reduced={before:frozen,after};await p.screenshot({path:out+'/reduced-motion.png'});
  await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForTimeout(400);
  await p.keyboard.press('ArrowDown');receipt.arrow=await p.locator('#splashTitleMenu .sel').innerText();assert.match(receipt.arrow,/인트로|INTRO/i);await p.keyboard.press('Home');
  // Context loss is a real failure path, not an image substituted in the test.
  await p.evaluate(()=>document.getElementById('titleSignboardCanvas').getContext('webgl').getExtension('WEBGL_lose_context').loseContext());await p.waitForTimeout(500);receipt.contextLoss=await p.evaluate(()=>({mode:TitleSignboard.current.stats.mode,canvas:getComputedStyle(document.getElementById('titleSignboardCanvas')).display,still:TitleSignboard.current.still.complete}));assert.equal(receipt.contextLoss.canvas,'none');assert.equal(receipt.contextLoss.still,true);await p.screenshot({path:out+'/context-loss-A-fallback.png'});
  await p.keyboard.press('Enter');await p.waitForTimeout(1000);receipt.exit=await p.evaluate(()=>({splash:getComputedStyle(document.getElementById('splashOverlay')).display,canvas:!!document.getElementById('titleSignboardCanvas')}));assert.equal(receipt.exit.canvas,false);
  // A failed motion layer must retain the same approved still and working menu.
  const fallbackPage=await c.newPage();await fallbackPage.route('**/assets/title-signboard/A/hands.png',route=>route.abort());
  await fallbackPage.goto(url,{waitUntil:'networkidle'});await fallbackPage.waitForFunction(()=>globalThis.TitleSignboard?.current?.stats.error);
  if(await fallbackPage.locator('#splashTitleUI').isHidden())await fallbackPage.keyboard.press('Enter');
  await fallbackPage.waitForFunction(()=>getComputedStyle(document.getElementById('splashTitleUI')).display==='block');
  receipt.missingLayer=await fallbackPage.evaluate(()=>({stats:{...TitleSignboard.current.stats},still:TitleSignboard.current.still.src,ready:TitleSignboard.current.still.complete,menu:document.querySelectorAll('#splashTitleMenu li').length}));assert.match(receipt.missingLayer.still,/title-signboard\/A\/still.webp/);assert.ok(receipt.missingLayer.menu>=2);await fallbackPage.screenshot({path:out+'/missing-layer-A-fallback.png'});await fallbackPage.close();
  assert.equal(receipt.errors.length,0);assert.equal(receipt.http.length,0);
  await fs.writeFile(out+'/qa-receipt.json',JSON.stringify(receipt,null,2));console.log(JSON.stringify(receipt,null,2));
 }finally{await browser.close();}
})().catch(async e=>{console.error(e);await fs.writeFile(out+'/failure.txt',e.stack);process.exitCode=1;});
