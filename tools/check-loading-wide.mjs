import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(process.env.EXODUSER_TOOLS_PACKAGE||new URL('../package.json',import.meta.url));
const {chromium}=require('playwright');
const base=process.env.LOADING_QA_URL||'http://127.0.0.1:3447';
const output=process.env.LOADING_QA_OUTPUT;
if(!output)throw new Error('LOADING_QA_OUTPUT is required');
await mkdir(output,{recursive:true});
const sizes=[[1920,1080],[2560,1080],[3840,1080],[2560,1600]];
const images=Array.from({length:19},(_,i)=>(i+1)+'.png').concat(['rd1.png','rd2.png','rd4.png','rd5.png','rd6.png','rd7.png','rd8.png','rd9.png','rd10.png','rd11.jpg','rd12.png','rd13.png','rd14.png','rd15.png','rd16.png','rd17.png']);
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({deviceScaleFactor:1});
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',route=>{const r=route.request(),url=new URL(r.url());return r.method()==='GET'&&(url.origin===new URL(base).origin||['fonts.googleapis.com','fonts.gstatic.com'].includes(url.hostname))?route.continue():route.abort();});
const records=[];
try{
 await page.goto(base+'/game.html',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>typeof showBootLoading==='function');
 await page.evaluate(()=>document.fonts.ready);
 // Finish the asset loader before explicitly holding each real loading screen for visual inspection.
 await page.waitForFunction(()=>document.getElementById('stLoadBar').style.width==='100%' || typeof _cutsceneState!=='undefined' && _cutsceneState==='INTRO_CUTSCENE',{},{timeout:90000}).catch(()=>{});
 for(const [width,height] of (process.env.LOADING_QA_CHECKS_ONLY ? [] : sizes)){
  await page.setViewportSize({width,height});
  for(const name of images){
   const target=await page.evaluate(name=>{
    showBootLoading('에셋 로딩 중...');
    const el=document.getElementById('stageTransition');el.style.opacity='1';el.style.transition='none';el.style.zIndex='1000000';
    document.getElementById('stFloorInfo').textContent='제1장 · 구역 1';
    document.getElementById('stLoadBar').style.width='65%';
    const src='img/lording/'+name;LoadingArt.set(document.getElementById('stRndImg'),src);return LoadingArt.variant(src);
   },name);
   await page.waitForFunction(target=>{const i=document.getElementById('stRndImg');return i.src.endsWith(target)&&i.complete&&i.naturalWidth>0;},target);
   await page.locator('#stRndImg').evaluate(i=>i.decode());
   const geometry=await page.evaluate(()=>{
    const i=document.getElementById('stRndImg'),a=i.parentElement.getBoundingClientRect(),s=document.getElementById('stLoadStatus').getBoundingClientRect();
    const scale=Math.max(a.width/i.naturalWidth,a.height/i.naturalHeight);
    const rect={x:a.x+(a.width-i.naturalWidth*scale)/2,y:a.y+(a.height-i.naturalHeight*scale)/2,w:i.naturalWidth*scale,h:i.naturalHeight*scale};
    const text=document.getElementById('stNextName');
    const front=document.elementFromPoint(innerWidth/2,Math.min(a.bottom-1,innerHeight/2));
    const visible=document.getElementById('stageTransition').contains(front);
    const status=getComputedStyle(document.getElementById('stLoadStatus'));
    const backdrop=getComputedStyle(i.parentElement.querySelector('.loading-backdrop'));
    const safeWidth=i.src.includes('-16.webp')?1920:2440;
    const sourceBounds={x:innerWidth/2-safeWidth*scale/2,y:innerHeight/2-1080*scale/2,w:safeWidth*scale,h:1080*scale};
    return {visible,fit:getComputedStyle(i).objectFit,rect,sourceBounds,artTop:a.top,artBottom:a.bottom,statusTop:s.top,statusBackground:status.backgroundImage,statusBorder:status.borderTopWidth,backdrop:backdrop.visibility,barHeight:getComputedStyle(document.getElementById('stLoadTrack')).height,titleFont:getComputedStyle(text).fontFamily,textOverflow:text.scrollWidth>text.clientWidth,src:i.getAttribute('src')};
   });
   assert.equal(geometry.visible,true);assert.equal(geometry.fit,'cover');assert.equal(geometry.artTop,0);assert.equal(geometry.artBottom,height);assert.ok(geometry.statusTop>height*.65);assert.equal(geometry.textOverflow,false);
   assert.equal(geometry.backdrop,'hidden');assert.equal(geometry.statusBorder,'0px');assert.equal(geometry.barHeight,'1px');assert.match(geometry.statusBackground,/rgba\(5, 5, 6, 0\)/);
   assert.ok(geometry.rect.x<=.01&&geometry.rect.y<=.01&&geometry.rect.x+geometry.rect.w>=width-.01&&geometry.rect.y+geometry.rect.h>=height-.01);
   assert.ok(geometry.sourceBounds.x>=-.01&&geometry.sourceBounds.y>=-.01&&geometry.sourceBounds.x+geometry.sourceBounds.w<=width+.01&&geometry.sourceBounds.y+geometry.sourceBounds.h<=height+.01);
   const file=name.replace('.','-')+'-'+width+'x'+height+'.png';await page.screenshot({path:output+'/'+file});
   records.push({name,width,height,file,...geometry});
  }
 }
 // Extension network failure must retain original, then a new request must supersede it.
 await page.setViewportSize({width:3840,height:1080});
 await page.evaluate(()=>{showBootLoading('에셋 로딩 중...');const el=document.getElementById('stageTransition');el.style.zIndex='1000000';el.style.opacity='1';el.style.transition='none';});
 await page.route('**/wide/**',r=>r.abort());
 const failed=page.waitForEvent('requestfailed',r=>r.url().includes('/wide/2-32.webp'));
 await page.evaluate(()=>LoadingArt.set(document.getElementById('stRndImg'),'img/lording/2.png?fallback=1'));
 await page.waitForFunction(()=>{const i=document.getElementById('stRndImg');return i.getAttribute('src')==='img/lording/2.png?fallback=1'&&i.complete;});
 await failed;
 assert.equal(await page.locator('#stRndImg').evaluate(i=>i.parentElement.classList.contains('loading-expanded')),false);
 assert.equal(await page.locator('#stRndImg').evaluate(i=>getComputedStyle(i).objectFit),'contain');
 assert.equal(await page.evaluate(()=>document.getElementById('stageTransition').contains(document.elementFromPoint(innerWidth/2,innerHeight/2))),true);
 await page.screenshot({path:output+'/fallback-3840x1080.png'});
 await page.unroute('**/wide/**');
 await page.evaluate(()=>{LoadingArt.set(document.getElementById('stRndImg'),'img/lording/1.png');LoadingArt.set(document.getElementById('stRndImg'),'img/lording/3.png');});
 await page.waitForFunction(()=>document.getElementById('stRndImg').src.includes('/3-32.webp'));
 // Resize must reselect without a second set() call.
 for(const [width,height,part]of [[1920,1080,'3-16.webp'],[2560,1080,'3-21.webp'],[3840,1080,'3-32.webp'],[2560,1600,'3-16.webp']]){
  await page.setViewportSize({width,height});
  await page.waitForFunction(part=>{const i=document.getElementById('stRndImg');return i.src.includes(part)&&i.complete;},part);
 }
 // Lobby's chapter gate stays a logo, with the actual localized status in its own footer.
 await page.goto(base+'/index.html?test=1&lobby=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>typeof showLoading==='function');
 for(const [width,height]of sizes){await page.setViewportSize({width,height});await page.evaluate(()=>showLoading('지옥으로 입장하는 중...'));await page.locator('#chGateImg').evaluate(i=>i.decode());await page.screenshot({path:output+'/lobby-'+width+'x'+height+'.png'});await page.evaluate(()=>hideLoading());assert.equal(await page.locator('#chapterGate').isVisible(),false);}
 assert.deepEqual(errors,[]);
 await writeFile(output+'/receipt.json',JSON.stringify({screens:records.length,lobbyScreens:4,errors,extensionFailure:'PASS',latestRequest:'PASS',records},null,2));
 console.log(JSON.stringify({screens:records.length,lobbyScreens:4,pageErrors:errors.length,extensionFailure:'PASS',latestRequest:'PASS'}));
}finally{await browser.close();}
