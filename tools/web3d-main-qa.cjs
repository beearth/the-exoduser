const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require(require.resolve('playwright',{paths:[process.cwd(),'G:/exoduser']}));
const store='I:/EXODUSER-Storage/web3d-main-20261031';
const out='G:/exoduser/tmp/design-review/20261031_web3d_main';
const root=path.resolve(__dirname,'..');
const status=async(state,extra={})=>{
  const data={state,time:new Date().toISOString(),pid:process.pid,...extra};
  await fs.writeFile(store+'/qa-state.json',JSON.stringify(data,null,2));console.log(JSON.stringify(data));
};
const url='http://127.0.0.1:3377/game.html?classic=1&tutorial=0&resourceTutorial=0&slot=web3d-main-isolated-qa';
async function ready(page,three=false){
  await page.waitForFunction(()=>typeof P!=='undefined'&&P&&P.x>0&&
    typeof _startSceneWarmState!=='undefined'&&_startSceneWarmState.status==='ready',null,{timeout:60000});
  for(let i=0;i<60;i++){
    const state=await page.evaluate(()=>({on:G.on,cutscene:_cutsceneState,
      guide:getComputedStyle(document.getElementById('introKeys')).opacity==='1'}));if(state.on)break;
    // PRO and INTRO are two successive native stories. Escape is their native skip key.
    if(state.guide)await page.locator('#ikSkip').click();
    else if(state.cutscene==='INTRO_CUTSCENE')await page.keyboard.press('Escape');
    await page.waitForTimeout(250);
  }
  try{await page.waitForFunction(three=>typeof G!=='undefined'&&G.on&&P&&P.x>0&&
    (!three||window._Web3DTrial?.snapshot().frame>30)&&
    getComputedStyle(document.getElementById('stageTransition')).opacity==='0',three,{timeout:60000});
  }catch(error){
    await status('로딩 진단',{page:await page.evaluate(()=>({hidden:document.hidden,ready:document.readyState,
      on:typeof G!=='undefined'&&G.on,p:typeof P!=='undefined'&&P&&{x:P.x,y:P.y},
      error:window._Web3DTrialError,body:document.body.innerText.slice(-350)}))});
    await page.screenshot({path:store+'/loading-failure.png'});throw error;
  }
}
async function sample(page,label){
  return page.evaluate(async label=>{
    const start=performance.now(),startFrame=window._Web3DTrial?.snapshot().frame||0;
    const times=[],cpu=[],fps=[],actors=[],bullets=[];let last=start;
    await new Promise(resolve=>{function tick(now){times.push(now-last);last=now;fps.push(_fpsCur);
      if(window._Web3DTrial)cpu.push(window._Web3DTrial.snapshot().renderer.cpuDispatchMs);
      actors.push(ens.filter(e=>e?.alive&&e.hp>0).length);bullets.push(projs.length+pProjs.length);
      if(now-start<10000)requestAnimationFrame(tick);else resolve();}requestAnimationFrame(tick);});
    const elapsed=last-start,sorted=times.slice().sort((a,b)=>a-b);
    return {label,elapsedMs:elapsed,rafFps:times.length*1000/elapsed,appFpsMean:fps.reduce((a,b)=>a+b,0)/fps.length,
      renderFps:window._Web3DTrial?(window._Web3DTrial.snapshot().frame-startFrame)*1000/elapsed:null,
      p95FrameMs:sorted[Math.floor(sorted.length*.95)],over33ms:times.filter(x=>x>33.34).length,
      cpuDispatchMeanMs:cpu.length?cpu.reduce((a,b)=>a+b,0)/cpu.length:null,
      actors:ens.filter(e=>e?.alive&&e.hp>0).length,projectiles:projs.length+pProjs.length,
      actorRange:[Math.min(...actors),Math.max(...actors)],projectileRange:[Math.min(...bullets),Math.max(...bullets)],hp:P.hp,trial:window._Web3DTrial?.snapshot()};
  },label);
}
async function nativeFingerprint(page){
  return page.evaluate(()=>{
    // Freeze only for this source parity check, outside the natural input recording.
    window._btFramePause=true;
    let seed=0x12345678;const originalRandom=Math.random;
    Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    try{initStage(0);return {map:G.map,objects:MAP_OBJS.map(o=>({type:o.type,x:o.x,y:o.y,scale:o.scale})),
      player:{x:P.x,y:P.y},dimensions:[G.mw,G.mh]};}
    finally{Math.random=originalRandom;}
  });
}
(async()=>{
  await fs.mkdir(store+'/video-final',{recursive:true});await fs.mkdir(store+'/temp',{recursive:true});
  await status('Chrome 시작');
  const persistent=await chromium.launchPersistentContext(store+'/qa-final-profile',{executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless:true,args:['--mute-audio','--remote-debugging-port=9481'],viewport:{width:1920,height:1080},deviceScaleFactor:1,
    env:{...process.env,TEMP:store+'/temp',TMP:store+'/temp'}});
  const browser=persistent.browser();
  const receipt={browser:browser.version(),errors:[],consoleErrors:[],httpFailures:[],samples:[],source:{}};
  for(const file of ['game.html','web3d/renderer.mjs','web3d/bridge-map.js','web3d/presentation.mjs','web3d/native-ground-effects.js','web3d/effects.mjs','web3d/river.mjs','web3d/remaster.mjs','assets/web3d/sprites/intake.json','assets/map/ch1/ground_dark_soil.png','assets/web3d/forest-assembly.glb']){
    receipt.source[file]=crypto.createHash('sha256').update(await fs.readFile(path.join(root,file))).digest('hex');
  }
  const attach=p=>{p.on('pageerror',e=>receipt.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')receipt.consoleErrors.push(m.text());});p.on('response',r=>{if(r.status()>=400)receipt.httpFailures.push({url:r.url(),status:r.status()});});};
  try{
    // One active game page at a time; no simultaneous GPU benchmarks.
    const vc=persistent;
    const p=vc.pages()[0];attach(p);await status('목교 영상 로딩');
    if(process.argv.includes('--fallback-only')){
      await p.route('**/web3d/renderer.mjs*',route=>route.abort('failed'));
      await p.goto(url+'&r3d=1',{waitUntil:'domcontentloaded',timeout:60000});await ready(p,false);
      await p.waitForFunction(()=>!!window._Web3DTrialError,null,{timeout:10000});
      const result=await p.evaluate(()=>({on:G.on,trialActive:!!window._Web3DTrial?.active,error:window._Web3DTrialError,
        hp:P.hp,canvases:['c','ct','fogGL','burstCvs'].map(id=>{const e=document.getElementById(id);return {id,opacity:e?getComputedStyle(e).opacity:null};})}));
      if(!result.on||result.trialActive||!(result.hp>0)||result.canvases.some(e=>e.opacity!=='1'))throw Error('native 폴백 실패 '+JSON.stringify(result));
      await p.screenshot({path:out+'/native-fallback-1920x1080.png'});
      await fs.writeFile(out+'/fallback-receipt.json',JSON.stringify({time:new Date().toISOString(),source:receipt.source,method:'자기 렌더 모듈 로딩만 중단, native 이동 시작/UI 유지 확인',result},null,2));
      await status('native 로딩 실패 폴백 PASS');return;
    }
    await p.goto(url+'&r3d=1&r3dScene=bridge',{waitUntil:'domcontentloaded',timeout:60000});await ready(p,true);
    receipt.singleRenderer=await p.evaluate(async()=>{
      const original=draw;let nativeDraws=0;draw=function(){nativeDraws++;return original();};
      const start=window._Web3DTrial.snapshot().frame;
      try{await new Promise(resolve=>setTimeout(resolve,1000));return {nativeDraws,threeFrames:window._Web3DTrial.snapshot().frame-start};}finally{draw=original;}
    });
    if(receipt.singleRenderer.nativeDraws!==0||receipt.singleRenderer.threeFrames<1)throw Error('단일 렌더 경로 실패 '+JSON.stringify(receipt.singleRenderer));
    // Let native intro invulnerability expire; never manufacture a god-mode combat clip.
    await p.waitForFunction(()=>P.iframes<=0&&P.hp>0,null,{timeout:25000});
    receipt.before=await p.evaluate(()=>({x:P.x,y:P.y,hp:P.hp,iframes:P.iframes,stats:{...G._sStats},god:!!window._btGod,mapQA:_MAP_QA_MODE}));
    const capture=await vc.newCDPSession(p),frames=[],writes=[];
    await fs.mkdir(store+'/frames',{recursive:true});
    capture.on('Page.screencastFrame',frame=>{
      const index=frames.length,file='frame-'+String(index).padStart(5,'0')+'.jpg';
      frames.push({index,file,timestamp:frame.metadata.timestamp});
      writes.push(fs.writeFile(store+'/frames/'+file,Buffer.from(frame.data,'base64')));
      capture.send('Page.screencastFrameAck',{sessionId:frame.sessionId}).catch(()=>{});
    });
    await capture.send('Page.startScreencast',{format:'jpeg',quality:90,maxWidth:1920,maxHeight:1080,everyNthFrame:4});
    await status('실제 W 이동·마우스 공격 촬영');
    const actionStart=Date.now();await p.keyboard.down('w');await p.waitForTimeout(5500);await p.keyboard.up('w');
    receipt.afterWalk=await p.evaluate(()=>({x:P.x,y:P.y,hp:P.hp,iframes:P.iframes,stats:{...G._sStats}}));
    await p.screenshot({path:out+'/bridge-travel-1920x1080.png'});
    // Follow a native tile route with real keys, rather than swinging across the river.
    const held=new Set();
    for(let step=0;step<100;step++){
      const route=await p.evaluate(()=>{
        const e=ens.filter(e=>e.alive&&e.hp>0).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y))[0];
        if(!e||P.hp<=0)return {done:true};
        const distance=Math.hypot(e.x-P.x,e.y-P.y);
        if(distance<55)return {done:true,aim:window._Web3DTrial.project(e.x,e.y),distance};
        const w=G.mw,h=G.mh,start=Math.floor(P.y/T)*w+Math.floor(P.x/T),goal=Math.floor(e.y/T)*w+Math.floor(e.x/T);
        const previous=new Int32Array(w*h);previous.fill(-1);previous[start]=start;
        const queue=new Int32Array(w*h);queue[0]=start;let head=0,tail=1;
        while(head<tail&&previous[goal]<0){const n=queue[head++],x=n%w,y=Math.floor(n/w);
          for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy,k=yy*w+xx;
            if(xx<1||yy<1||xx>=w-1||yy>=h-1||previous[k]>=0||G.map[yy][xx]!==0||!canMv((xx+.5)*T,(yy+.5)*T,P.r))continue;
            previous[k]=n;queue[tail++]=k;
          }
        }
        if(previous[goal]<0)return {done:false,unreachable:true,distance};
        let n=goal;const path=[];while(n!==start){path.push(n);n=previous[n];}
        n=path[Math.max(0,path.length-3)];const tx=(n%w+.5)*T,ty=(Math.floor(n/w)+.5)*T;
        const keys=[];if(tx-P.x>9)keys.push('d');if(tx-P.x<-9)keys.push('a');if(ty-P.y>9)keys.push('s');if(ty-P.y<-9)keys.push('w');
        return {keys,distance,aim:window._Web3DTrial.project(e.x,e.y)};
      });
      for(const key of [...held])if(!route.keys?.includes(key)){await p.keyboard.up(key);held.delete(key);}
      if(route.done){if(route.aim)await p.mouse.move(route.aim.x,route.aim.y);break;}
      if(route.unreachable)throw Error('가장 가까운 적에게 native 보행 경로가 없음');
      for(const key of route.keys)if(!held.has(key)){await p.keyboard.down(key);held.add(key);}
      await p.waitForTimeout(150);
    }
    for(const key of held)await p.keyboard.up(key);
    const firstAim=await p.evaluate(()=>{const e=ens.filter(e=>e.alive).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y))[0];return e?window._Web3DTrial.project(e.x,e.y):null;});
    if(firstAim)await p.mouse.move(firstAim.x,firstAim.y);
    await p.mouse.down({button:'left'});
    for(let i=0;i<32;i++){
      const aim=await p.evaluate(()=>{const e=ens.filter(e=>e.alive).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y))[0];return e?window._Web3DTrial.project(e.x,e.y):null;});
      if(aim)await p.mouse.move(aim.x,aim.y);
      if(i===6)await p.keyboard.down('q');if(i===8)await p.keyboard.up('q');
      if(i===18)await p.screenshot({path:out+'/combat-1920x1080.png'});
      await p.waitForTimeout(250);
    }
    await p.mouse.up({button:'left'});await p.keyboard.up('q');
    receipt.after=await p.evaluate(()=>({x:P.x,y:P.y,hp:P.hp,iframes:P.iframes,stats:{...G._sStats},
      enemies:ens.map(e=>({x:e.x,y:e.y,hp:e.hp,mhp:e.mhp,alive:e.alive,state:e.s})),trial:window._Web3DTrial.snapshot()}));
    receipt.actionSeconds=(Date.now()-actionStart)/1000;
    await capture.send('Page.stopScreencast');await Promise.all(writes);
    await fs.writeFile(out+'/video-frame-events.json',JSON.stringify(frames,null,2));
    await fs.writeFile(out+'/combat-input-receipt.json',JSON.stringify({before:receipt.before,afterWalk:receipt.afterWalk,after:receipt.after,actionSeconds:receipt.actionSeconds},null,2));
    if(!(receipt.after.stats.dmgDealt>0||receipt.after.stats.dmgTaken>0))throw Error('실제 피해0: 전투 촬영 미검증');
    await p.close();
    await status('촬영 종료·순차 성능 검사', {actionSeconds:receipt.actionSeconds,combat:receipt.after.stats});
    if(process.argv.includes('--video-only')){
    const previous=JSON.parse(await fs.readFile(out+'/qa-receipt.json','utf8'));
      if(JSON.stringify(previous.source)!==JSON.stringify(receipt.source))throw Error('기존 성능 영수증과 촬영 source SHA 불일치');
      for(const key of ['before','afterWalk','after','actionSeconds'])previous[key]=receipt[key];
      previous.errors.push(...receipt.errors);previous.httpFailures.push(...receipt.httpFailures);
      previous.combatRetake={time:new Date().toISOString(),method:'native 타일 경로를 실제 키로 이동 후 마우스 공격',sourceSame:true};
      await fs.writeFile(out+'/qa-receipt.json',JSON.stringify(previous,null,2));
      await status('전투 재촬영 완료',{combat:receipt.after.stats,sourceSame:true});return;
    }

    const ctx=persistent;
    const page=await ctx.newPage();attach(page);
    await page.goto(url+'&r3d=1&r3dScene=bridge',{waitUntil:'domcontentloaded',timeout:60000});await ready(page,true);
    await page.screenshot({path:out+'/exploration-1920x1080.png'});
    receipt.samples.push(await sample(page,'목교 3D 정지 탐험 10초'));
    receipt.footAlignment=await page.evaluate(()=>{const a=window._Web3DTrial;return [[P.x,P.y],[4000,5520],[4000,5800],[4000,6200],[4000,6580],[3800,6800],[4200,5320]].map(([x,y])=>{const s=a.project(x,y),p=a.inversePointer(s.x,s.y);return {core:{x,y},screen:s,inverse:p,errorCorePx:p?Math.hypot(p.x-x,p.y-y):null};});});
    const cdp=await browser.newBrowserCDPSession();const gpu=await cdp.send('SystemInfo.getInfo');receipt.gpu=gpu.gpu.devices;

    await status('기존 웹 OFF 원본 대조');
    const before=await fs.readFile(store+'/source/game.before.html','utf8');
    await page.route('**/game.html?**',route=>route.fulfill({status:200,contentType:'text/html',body:before}));
    await page.goto(url+'&baseline=1',{waitUntil:'domcontentloaded',timeout:60000});await ready(page);
    const baseline=await nativeFingerprint(page);
    await page.unroute('**/game.html?**');
    await page.goto(url+'&baseline=0',{waitUntil:'domcontentloaded',timeout:60000});await ready(page);
    const modified=await nativeFingerprint(page);
    receipt.offParity={equal:JSON.stringify(baseline)===JSON.stringify(modified),baselineSHA:crypto.createHash('sha256').update(JSON.stringify(baseline)).digest('hex'),modifiedSHA:crypto.createHash('sha256').update(JSON.stringify(modified)).digest('hex'),
      dimensions:modified.dimensions,trialCreated:await page.evaluate(()=>!!window._Web3DTrial)};
    await page.evaluate(()=>{window._btFramePause=false;});
    await page.waitForTimeout(500);await page.screenshot({path:out+'/web-original-1920x1080.png'});
    receipt.samples.push(await sample(page,'기존 웹 OFF 실제 1-1 10초'));

    await status('기존 맵 r3d=1 실제 판정 검사');
    await page.goto(url+'&r3d=1',{waitUntil:'domcontentloaded',timeout:60000});await ready(page,true);
    await page.screenshot({path:out+'/native-map-3d-1920x1080.png'});
    receipt.samples.push(await sample(page,'기존 맵 r3d=1 10초'));
    receipt.nativeMap=await page.evaluate(()=>({dimensions:[G.mw,G.mh],x:P.x,y:P.y,trial:window._Web3DTrial.snapshot(),error:window._Web3DTrialError||null}));
    await status('64적·96탄 고정 렌더 fixture');
    await page.goto(url+'&r3d=1&r3dScene=bridge',{waitUntil:'domcontentloaded',timeout:60000});await ready(page,true);
    receipt.denseFixture=await page.evaluate(()=>{
      window._btFramePause=true;P.x=4020;P.y=4820;P.s='idle';G.cam.x=P.x;G.cam.y=P.y;ens=[];projs.length=0;pProjs.length=0;
      const tiles=G._floorTiles.filter(c=>{const x=(c.tx+.5)*T,y=(c.ty+.5)*T,d=Math.hypot(x-P.x,y-P.y);return d>120&&d<900&&canMv(x,y,24);});
      for(let i=0;i<64;i++){const c=tiles[(i*137)%tiles.length],e=mkEn((c.tx+.5)*T,(c.ty+.5)*T,0,i%8,false,1,0);if(e)ens.push(e);}
      for(let i=0;i<96;i++){const a=i*Math.PI*2/96,r=170+(i%5)*100;spawnProj({x:P.x+Math.cos(a)*r,y:P.y+Math.sin(a)*r,vx:-Math.cos(a)*1.8,vy:-Math.sin(a)*1.8,life:600,ml:600,sz:2,el:i%5+1,dmg:20,friendly:false,redBean:i<64,blackBean:i>=64&&i<80,gbBean:i>=80,parryClass:i<64?'physical':'magic'});}
      return {method:'일시정지·강제 배치의 순수 밀집 렌더 fixture. 자연 플레이/AI 성능 아님',actors:ens.length,projectiles:projs.length,aiFrozen:true};
    });
    await page.waitForTimeout(2000);await page.screenshot({path:out+'/dense-fixture-1920x1080.png'});
    receipt.samples.push(await sample(page,'64적·96탄 고정 렌더 fixture 10초'));
    await page.evaluate(()=>window._btFramePause=false);await page.mouse.down({button:'left'});
    receipt.samples.push(await sample(page,'밀집 fixture 활성 Core·AI·공격 10초'));
    await page.mouse.up({button:'left'});
    receipt.denseAfter=await page.evaluate(()=>({stats:{...G._sStats},hp:P.hp,actors:ens.filter(e=>e?.alive&&e.hp>0).length,bullets:projs.length+pProjs.length,error:window._Web3DTrialError||null}));
    for(const [file,hash]of Object.entries(receipt.source)){const after=crypto.createHash('sha256').update(await fs.readFile(path.join(root,file))).digest('hex');if(after!==hash)throw Error('검수 중 소스 변경 '+file);}
    if(receipt.errors.length||receipt.consoleErrors.length||receipt.httpFailures.length||!receipt.offParity.equal||receipt.denseAfter.error)throw Error('실행 검수 실패 '+JSON.stringify({errors:receipt.errors,console:receipt.consoleErrors,http:receipt.httpFailures,parity:receipt.offParity.equal,denseError:receipt.denseAfter.error}));
    await fs.writeFile(out+'/qa-receipt.json',JSON.stringify(receipt,null,2));
    await status('검수 완료',{offParity:receipt.offParity,errors:receipt.errors,httpFailures:receipt.httpFailures,samples:receipt.samples.map(s=>({label:s.label,fps:s.rafFps}))});
  }finally{await browser.close();}
})().catch(async error=>{console.error(error.stack);await status('검수 실패',{error:error.stack});process.exitCode=1;});
