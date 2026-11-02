const fs = require('node:fs/promises');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const out = process.env.TITLE_QA_OUT || 'I:/EXODUSER-Storage/codex-takeover/title-close-20261102';
const url = process.env.TITLE_QA_URL || 'http://127.0.0.1:3384/index.html?test=1';
process.env.TEMP = out + '/temp';
process.env.TMP = process.env.TEMP;
const { chromium } = require('playwright');
const receipt = {url, errors:[], http:[], saves:[], sizes:[], recordings:[], differences:[]};
const regions = {near:[874,344,18,192], far:[1050,399,15,70], sky:[1100,269,200,40], feet:[1310,716,220,45], moon:[1120,82,178,180]};
function TitleWidth(width){return width<=2560?2560:3840;}
async function show(page) {
  await page.goto(url, {waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => globalThis.TitleSignboard?.current?.stats.videoFrames > 8);
  await page.waitForFunction(() => getComputedStyle(document.getElementById('splashTitleUI')).opacity === '1');
}
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
  assert.ok(frames.length >= 50, 'recording is moving, not a still');
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
        for(const [key,[x,y,w,h]] of Object.entries(regions)) {
          const box=[Math.round(r.x+x*r.scale),Math.round(r.y+y*r.scale),Math.round(w*r.scale),Math.round(h*r.scale)];
          pixels[key]={final:Array.from(c.getImageData(...box).data),base:Array.from(rc.getImageData(...box).data)};
        }
        return {t:v.currentTime,flowTime:scene.stats.time,pixels};
      },{t,regions}));
    }
    const difference={time,dt:pair[1].t-pair[0].t,flowDt:pair[1].flowTime-pair[0].flowTime};
    for(const name of Object.keys(regions)) {
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
  const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio','--disable-gpu','--autoplay-policy=no-user-gesture-required'],env:{...process.env,TEMP:out+'/temp',TMP:out+'/temp'}});
  try {
    const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
    const page=await context.newPage();
    page.on('pageerror',e=>receipt.errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400)receipt.http.push({url:r.url(),status:r.status()});});
    page.on('request',r=>{if(r.method()!=='GET'&&r.url().includes('/api/slots'))receipt.saves.push(r.url());});
    await show(page);
    for(const width of [1920,2560,3840]) {
      await page.setViewportSize({width,height:1080});await page.waitForTimeout(1100);
      await page.waitForFunction(width=>TitleSignboard.current.video.videoWidth===width,width<=2560?2560:3840);
      const size=await page.evaluate(()=>({width:innerWidth,stats:{...TitleSignboard.current.stats},rect:TitleSignboard.rect(innerWidth,innerHeight),logo:document.getElementById('splashTitleLogo').getBoundingClientRect().toJSON(),menu:document.getElementById('splashTitleMenu').getBoundingClientRect().toJSON(),scroll:document.documentElement.scrollWidth>innerWidth,muted:TitleSignboard.current.video.muted,src:TitleSignboard.current.video.currentSrc,video:[TitleSignboard.current.video.videoWidth,TitleSignboard.current.video.videoHeight,TitleSignboard.current.video.duration]}));
      assert.equal(size.stats.error,null);assert.equal(size.scroll,false);assert.ok(size.logo.x>=48&&size.menu.x>=48);assert.equal(size.muted,true);assert.deepEqual(size.video.slice(0,2),[TitleWidth(width),TitleWidth(width)/2]);assert.ok(size.stats.cloudFrames>0);receipt.sizes.push(size);
      const name=out+'/menu-'+width+'.png';await page.screenshot({path:name});
      for(const key of ['near','far','feet','face','fortress','rock']) {
        const [x,y,w,h]=({...regions,face:[1333,279,116,110],fortress:[420,300,240,170],rock:[1630,730,200,50]})[key], r=size.rect;
        await sharp(name).extract({left:Math.round(r.x+x*r.scale)-12,top:Math.round(r.y+y*r.scale)-12,width:Math.round(w*r.scale)+24,height:Math.round(h*r.scale)+24}).png().toFile(out+'/crop-'+width+'-'+key+'-1x.png');
      }
      if(process.argv.includes('--record'))await record(page,context,width);
    }
    await deterministicPairs(page);
    await show(page); // remove diagnostic overrides before policy/input tests
    await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(650);
    const frozen=await page.evaluate(()=>({...TitleSignboard.current.stats,paused:TitleSignboard.current.video.paused}));await page.waitForTimeout(650);
    const after=await page.evaluate(()=>({...TitleSignboard.current.stats}));
    assert.equal(after.time,frozen.time);assert.equal(after.flowFrames,frozen.flowFrames);assert.equal(after.cloudFrames,frozen.cloudFrames);assert.equal(frozen.paused,true);receipt.reduced={frozen,after};await page.screenshot({path:out+'/reduced.png'});
    await page.emulateMedia({reducedMotion:'no-preference'});
    for(const [opt,expected] of [[{quality:'low'},'low-tier'],[{atmos:0},'atmosphere-off'],[{reduceMotion:true},'reduced-motion']]) {
      await page.evaluate(opt=>{localStorage.setItem('hellcave_settings',JSON.stringify({opt}));dispatchEvent(new Event('storage'));},opt);await page.waitForTimeout(650);
      const state=await page.evaluate(()=>({...TitleSignboard.current.stats,paused:TitleSignboard.current.video.paused}));assert.equal(state.mode,expected);assert.equal(state.paused,true);receipt[expected]=state;
    }
    await page.evaluate(()=>{localStorage.removeItem('hellcave_settings');dispatchEvent(new Event('storage'));});await page.waitForTimeout(650);
    await page.keyboard.press('ArrowDown');receipt.arrow=await page.locator('#splashTitleMenu .sel').innerText();assert.match(receipt.arrow,/인트로|INTRO/i);
    await page.keyboard.press('Home');await page.keyboard.press('Enter');await page.waitForTimeout(700);assert.equal(await page.locator('#titleSignboardCanvas').count(),0);
    await context.close();
    const fc=await browser.newContext({viewport:{width:1920,height:1080}}), fallback=await fc.newPage();
    await fallback.route('**/video/title_motion_C2_close_*_20261102.mp4',r=>r.abort());
    await fallback.goto(url,{waitUntil:'domcontentloaded'});await fallback.waitForFunction(()=>TitleSignboard.current.stats.error&&TitleSignboard.current.stats.ready);
    receipt.fallback=await fallback.evaluate(()=>({stats:{...TitleSignboard.current.stats},still:TitleSignboard.current.still.src,menu:document.querySelectorAll('#splashTitleMenu li').length}));assert.match(receipt.fallback.still,/C2\/still.webp/);assert.ok(receipt.fallback.menu>=2);await fallback.screenshot({path:out+'/video-error-fallback.png'});await fc.close();
    assert.equal(receipt.errors.length,0);assert.equal(receipt.http.length,0);assert.equal(receipt.saves.length,0);
    await fs.writeFile(out+'/qa-receipt.json',JSON.stringify(receipt,null,2));console.log(JSON.stringify(receipt));
  } finally {await browser.close();}
})().catch(async e=>{console.error(e);await fs.writeFile(out+'/failure.txt',e.stack);process.exitCode=1;});
