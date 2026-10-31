import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {textGeometry,assessRows} from './check-web-sidepanel.mjs';
const require=createRequire(import.meta.url),{chromium}=require('playwright'),sharp=require('sharp');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.resolve(process.argv[2]||'I:/EXODUSER-Storage/design/world-wide-20261031/qa');
const base=process.argv[3]||'http://127.0.0.1:3368';
const baseline=process.argv[4];
const perfOnly=process.argv.includes('--perf-only');
const sizes=[[1920,1080],[2560,1080],[3840,1080],[2560,1600]];
const positions=[['start',4020,7420],['combat',4020,4820],['boss-approach',4020,620]];
const result={sizes,mode:'실제 game.html·200×200 본편 맵, 저장 격리, 결정적 카메라/전투 fixture. 자연 완주 검수와 구분.',captures:[],pixels:[],performance:[],errors:[],missing:[],failures:[]};
await fs.mkdir(output,{recursive:true});
const source=await fs.readFile(path.join(root,'game.html'),'utf8');
function fn(text,name){const start=text.indexOf('function '+name+'('),end=text.indexOf('\n}',start);if(start<0||end<0)throw Error(name);return text.slice(start,end+2);}
const hardware=process.argv.includes('--hardware');
const browser=await chromium.launch({headless:true,...(hardware?{channel:'chromium'}:{}),args:['--mute-audio',...(hardware?['--use-angle=d3d11']:[])]});
try{
 const context=await browser.newContext({viewport:{width:1920,height:1080},reducedMotion:'reduce'});
 await context.route('**/api/save**',route=>route.fulfill({json:{ok:true,qa:true}}));
 await context.route('**/api/slots',route=>route.fulfill({json:{slots:[]}}));
 await context.addInitScript(()=>{let seed=613;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};});
 const page=await context.newPage();
 page.on('pageerror',e=>result.errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400&&new URL(r.url()).origin===base)result.missing.push({status:r.status(),url:r.url()});});
 // No stage parameter also exercises the unchanged production entry path.
 await page.goto(base+'/game.html?forgelab=1&tutorial=0&resourceTutorial=0',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>typeof P!=='undefined'&&P?.lv===1000&&!_bootLoadActive&&G.on,null,{timeout:180000});
 await page.waitForTimeout(1000);
 const clean=async()=>page.evaluate(()=>{
  window._btFramePause=true;closeAllPanels(true);G.on=true;G.paused=false;G.shake=0;OPT.shake=0;G._camZoom=1;
  G._intro=null;_cutsceneState=null;_cutC.style.display='none';window._parryLesson?.finish();
  ens.length=0;projs.length=0;pProjs.length=0;G.parts.length=0;G.txts.length=0;G._bonfire=null;
  for(const id of ['tutorial','introKeys','introDiff','stageTransition','notif','petSubtitle','ph']){const e=document.getElementById(id);if(e)e.style.opacity='0';}
  for(const id of ['hud','hudTop','hudCorner','mmWrap','mmLvl','globeHP','globeMP','skBar'])document.getElementById(id)?.classList.add('on');
  P.hp=P.mhp;P.mp=P.mmp;P.s='idle';P.iframes=0;P.kb={x:0,y:0};updateHUD(true);
 });
 const move=async(x,y)=>{
  await page.evaluate(([x,y])=>{P.x=x;P.y=y;G.cam.x=x;G.cam.y=y;_clampCamToMap();_preloadCh1StartOuter();draw();_glFlush();},[x,y]);
  await page.waitForFunction(()=>_ch1StartOuterViewIds().every(id=>_ch1StartOuterCache[id]?.status==='ready'),null,{timeout:30000});
  await page.waitForTimeout(2500);
  await page.evaluate(()=>{draw();_glFlush();});
 };
 const fixture=async()=>page.evaluate(()=>{
  ens.length=0;projs.length=0;G._bonfire=null;
  for(let i=0;i<32;i++){
   const a=i*Math.PI*2/32,r=280+(i%4)*105,x=P.x+Math.cos(a)*r,y=P.y+Math.sin(a)*r;
   if(canMv(x,y,14)){const e=mkEn(x,y,0,i%3===0?1:0,false,EL.P,-1);e._alerted=true;ens.push(e);}
  }
  _shDirty=true;
 });
 const capture=async(name,width,height)=>{
  await page.evaluate(()=>{draw();_glFlush();});
  const file=name+'-'+width+'x'+height+'.png';await page.screenshot({path:path.join(output,file)});
  const state=await page.evaluate(()=>({viewport:[VW,VH],backing:[C.width,C.height],map:[G.mw,G.mh],plate:_isPlateMap(),camera:{...G.cam},zoom:G._camZoom||1,
   player:[P.x,P.y],enemies:ens.filter(e=>e.alive).length,projectiles:projs.length,chunkErrors:__ch1StartOuterQA().stats.errors,
   drawn:__ch1StartOuterQA().stats.drawnIds,visible:__ch1StartOuterQA().stats.visibleIds,
   renderer:_useGPU?'WebGPU':_useGL?'WebGL2':'Canvas2D'}));
  const text=await textGeometry(page,'#mmLvl,#hudCorner,#skBar');
  const geometry=await page.evaluate(()=>Object.fromEntries(['#mmWrap','#mmLvl','#hudCorner','#globeHP','#globeMP','#skBar'].map(id=>{const e=document.querySelector(id),r=e.getBoundingClientRect();return[id,{...r.toJSON(),visible:true}]})));
  const row={screen:'hud',width,height,...text,geometry};
  result.failures.push(...assessRows([row]));
  const {data,info}=await sharp(path.join(output,file)).removeAlpha().raw().toBuffer({resolveWithObject:true});
  const sides=[];for(const side of [0,1]){let min=255,max=0;const colors=new Set();for(let y=120;y<height-180;y+=4)for(let x=side?width-120:20;x<(side?width-20:120);x+=4){const k=(y*info.width+x)*3,v=Math.max(data[k],data[k+1],data[k+2]);min=Math.min(min,v);max=Math.max(max,v);colors.add(data[k]+','+data[k+1]+','+data[k+2]);}sides.push({side:side?'right':'left',min,max,colors:colors.size});}
  if(state.plate||state.map[0]!==200||state.map[1]!==200||state.chunkErrors||sides.some(s=>s.max-s.min<5||s.colors<20))result.failures.push({kind:'world-coverage',file,state,sides});
  result.captures.push({file,...state,sides,textOverlaps:text.overlaps});console.log('capture '+file);
 };
 if(!perfOnly)for(const [width,height]of sizes){
  await page.setViewportSize({width,height});await clean();
  for(const [name,x,y]of positions){
   await clean();await move(x,y);
   if(name==='combat'){await fixture();await page.evaluate(()=>{window._btFramePause=false;G.paused=false;});await page.waitForTimeout(1000);await page.mouse.move(width/2+280,height/2);await page.mouse.down();await page.waitForTimeout(160);await page.mouse.up();await page.evaluate(()=>{window._btFramePause=true;});}
   await capture(name,width,height);
  }
 }
 // Compare old/new draw functions in the same frozen world, assets, camera and renderer.
 // A self-comparison checks that incidental render-time animation is stable first.
 if(baseline&&!perfOnly){
  const old=await fs.readFile(baseline,'utf8'),oldDraw=fn(old,'draw'),oldEnabled=fn(old,'_ch1StartOuterEnabled');
  const newDraw=fn(source,'draw'),newEnabled=fn(source,'_ch1StartOuterEnabled');
  await page.setViewportSize({width:1920,height:1080});
  for(const [name,x,y]of positions){
   await clean();await move(x,y);
   await page.evaluate(()=>{window.__savedRandom=Math.random;Math.random=()=>.5;window.__savedNow=_now;_now=10000;});
   const render=async(code,label)=>{await page.evaluate(code=>{(0,eval)(code);_now=10000;draw();_glFlush();},code);return page.screenshot({path:path.join(output,'pixel-'+name+'-'+label+'.png')});};
   await render(oldEnabled+'\n'+oldDraw,'warm');
   const a=await render(oldEnabled+'\n'+oldDraw,'before'),self=await render(oldEnabled+'\n'+oldDraw,'self'),b=await render(newEnabled+'\n'+newDraw,'after');
   const aa=await sharp(a).ensureAlpha().raw().toBuffer(),ss=await sharp(self).ensureAlpha().raw().toBuffer(),bb=await sharp(b).ensureAlpha().raw().toBuffer();
   let noise=0,diff=0;for(let i=0;i<aa.length;i+=4){if(!aa.subarray(i,i+4).equals(ss.subarray(i,i+4)))noise++;if(!ss.subarray(i,i+4).equals(bb.subarray(i,i+4)))diff++;}
   result.pixels.push({position:name,width:1920,height:1080,selfDiffPixels:noise,changedPixels:diff,method:'같은 정지 월드에서 원본/최종 draw·coverage 함수 교체, RNG=.5·_now=10000, 전체 화면 RGBA 비교'});
   if(noise||diff)result.failures.push({kind:'pixel-regression',position:name,noise,diff});
   await page.evaluate(()=>{Math.random=window.__savedRandom;_now=window.__savedNow;});
  }
 }
 await page.evaluate(()=>{window.__qaDrawCalls=0;window.__qaOriginalDraw=draw;draw=function(){window.__qaDrawCalls++;return window.__qaOriginalDraw();};});
 for(const [width,height]of [[1920,1080],[3840,1080]]){
  await page.setViewportSize({width,height});await clean();await move(4020,4820);await fixture();
  await page.evaluate(()=>{window._btFramePause=false;G.paused=false;});await page.waitForTimeout(2000);
  const sample=await page.evaluate(()=>new Promise(resolve=>{const start=performance.now(),frame=window.__qaDrawCalls,physics=_gameFrame;let count=0,last=start,sum=0,max=0;function tick(now){const dt=now-last;last=now;sum+=dt;max=Math.max(max,dt);count++;if(now-start<4000){requestAnimationFrame(tick);return;}window._btFramePause=true;const debug=GL?.getExtension('WEBGL_debug_renderer_info');resolve({elapsedMs:now-start,renderFrames:window.__qaDrawCalls-frame,physicsSteps:_gameFrame-physics,gameFps:(window.__qaDrawCalls-frame)*1000/(now-start),rafFps:count*1000/(now-start),meanRafMs:sum/count,maxRafMs:max,profile:{..._prof},enemies:ens.filter(e=>e.alive).length,projectiles:projs.length,renderer:_useGPU?'WebGPU':_useGL?'WebGL2':'Canvas2D',gpu:debug?GL.getParameter(debug.UNMASKED_RENDERER_WEBGL):GL?GL.getParameter(GL.RENDERER):null});}requestAnimationFrame(tick);}));
  result.performance.push({width,height,...sample});console.log('perf '+width+' '+sample.gameFps.toFixed(2));
 }
 // Reload the formerly broken exact stage=0 route after the frozen-frame comparison.
 if(!perfOnly){
 await page.goto(base+'/game.html?forgelab=1&stage=0&tutorial=0&resourceTutorial=0',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>typeof P!=='undefined'&&P?.lv===1000&&!_bootLoadActive&&G.on,null,{timeout:180000});await page.waitForTimeout(1000);await clean();
 result.entry=await page.evaluate(()=>({map:[G.mw,G.mh],plate:_wantPlateTest(),stage:G.stage}));
 if(result.entry.map[0]!==200||result.entry.map[1]!==200||result.entry.plate)result.failures.push({kind:'entry',entry:result.entry});
 }
 const disk=Buffer.from(source),http=Buffer.from(await(await fetch(base+'/game.html')).arrayBuffer()),sha=b=>createHash('sha256').update(b).digest('hex');
 result.source={root,sha256:sha(disk),httpSha256:sha(http),match:sha(disk)===sha(http)};
 if(!result.source.match||result.errors.length||result.missing.length)result.failures.push({kind:'runtime',errors:result.errors,missing:result.missing,source:result.source});
}finally{await browser.close();await fs.writeFile(path.join(output,'results.json'),JSON.stringify(result,null,2));}
console.log(JSON.stringify({captures:result.captures.length,pixels:result.pixels,performance:result.performance,entry:result.entry,errors:result.errors,missing:result.missing,failures:result.failures},null,2));
if(result.failures.length)process.exitCode=1;
