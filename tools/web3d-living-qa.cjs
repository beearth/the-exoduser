const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const {chromium}=require('playwright');
const out='I:/EXODUSER-Storage/web3d-layer1-20261031/final';
const root=path.resolve(__dirname,'..');
const url='http://127.0.0.1:3377/game.html?classic=1&r3d=1&tutorial=0&resourceTutorial=0&slot=web3d-layer1-isolated';
async function ready(p){
  await p.waitForFunction(()=>typeof P!=='undefined'&&P?.x>0&&typeof _startSceneWarmState!=='undefined'&&_startSceneWarmState.status==='ready',null,{timeout:90000});
  for(let i=0;i<100;i++){const s=await p.evaluate(()=>({on:G.on,cutscene:_cutsceneState,guide:getComputedStyle(document.getElementById('introKeys')).opacity==='1'}));if(s.on)break;if(s.guide)await p.locator('#ikSkip').click();else if(s.cutscene==='INTRO_CUTSCENE')await p.keyboard.press('Escape');await p.waitForTimeout(200);}
  await p.waitForFunction(()=>G.on&&window._Web3DLivingLayer?.snapshot().frame>10&&getComputedStyle(document.getElementById('stageTransition')).opacity==='0',null,{timeout:90000});
}
async function sample(p,label,seconds=10){return p.evaluate(async({label,seconds})=>{const times=[],cpu=[],counts=[],start=performance.now();let last=start;await new Promise(resolve=>{function tick(t){times.push(t-last);last=t;const a=window._Web3DLivingLayer.snapshot();cpu.push(a.cpuMs);counts.push(a.foliage);if(t-start<seconds*1000)requestAnimationFrame(tick);else resolve();}requestAnimationFrame(tick);});const sorted=times.slice().sort((a,b)=>a-b);return {label,fps:times.length*1000/(last-start),p95:sorted[Math.floor(sorted.length*.95)],cpuMs:cpu.reduce((a,b)=>a+b,0)/cpu.length,foliage:[Math.min(...counts),Math.max(...counts)],layer:window._Web3DLivingLayer.snapshot(),enemies:ens.filter(e=>e?.alive).length,bullets:projs.length+pProjs.length,hp:P.hp};},{label,seconds});}
(async()=>{
 await fs.mkdir(out,{recursive:true});await fs.mkdir(out+'/temp',{recursive:true});
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio'],env:{...process.env,TEMP:out+'/temp',TMP:out+'/temp'}});
 const result={url,errors:[],http:[],source:{},samples:[]};
 for(const f of ['game.html','web3d/living-layer.mjs','web3d/living-layout.mjs','web3d/bridge-map.js','assets/web3d/living/rotten-underbrush-atlas.png'])result.source[f]=crypto.createHash('sha256').update(await fs.readFile(root+'/'+f)).digest('hex');
 try{
  const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
  await context.route('**/*',r=>r.continue());
  const p=await context.newPage();p.on('pageerror',e=>result.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')result.errors.push(m.text());});p.on('response',r=>{if(r.status()>=400)result.http.push({url:r.url(),status:r.status()});});
  await p.goto(url,{waitUntil:'domcontentloaded',timeout:60000});await ready(p);await p.waitForTimeout(2500);
  result.initial=await p.evaluate(()=>({x:P.x,y:P.y,hp:P.hp,width:VW,height:VH,layer:window._Web3DLivingLayer.snapshot(),objects:MAP_OBJS.filter(o=>/pool|toxic/.test(o.type)).map(o=>({type:o.type,x:o.x,y:o.y,scale:o.scale})),hill:_CH1_HILL,renderer:_useGPU?'WebGPU':_useGL?'WebGL':'Canvas2D'}));
  await p.screenshot({path:out+'/start-on-1920.png'});
  console.log(JSON.stringify({initial:result.initial,errors:result.errors}));
  if(process.argv.includes('--probe')){await fs.writeFile(out+'/probe.json',JSON.stringify(result,null,2));return;}
  // Freeze the real existing map solely for repeatable camera and pixel evidence.
  await p.evaluate(()=>{window._btFramePause=true;P.x=5880;P.y=4310;G.cam.x=P.x;G.cam.y=P.y;});await p.waitForTimeout(1500);
  result.pixelParity=await p.evaluate(()=>{
    const api=window._Web3DLivingLayer,originalRandom=Math.random,step=_dtSp,originalImpact=window._btFramePause;_dtSp=0;
    const region=(x,y,w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(C,x,y,w,h,0,0,w,h);return Array.from(ctx.getImageData(0,0,w,h).data);};
    const take=on=>{let seed=12345;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};api.setEnabled(on);draw();_glFlush();return {hero:region(890,485,140,110),floor:region(550,570,180,90)};};
    try{take(false);const off=take(false),on=take(true);return Object.fromEntries(Object.keys(off).map(key=>[key,{changedChannels:off[key].reduce((n,v,i)=>n+(v!==on[key][i]),0),channels:off[key].length}]));}finally{Math.random=originalRandom;_dtSp=step;api.setEnabled(true);}
  });
  for(const width of [1920,3840]){
    await p.setViewportSize({width,height:1080});await p.waitForTimeout(1500);
    for(const on of [false,true]){await p.evaluate(on=>window._Web3DLivingLayer.setEnabled(on),on);await p.waitForTimeout(300);await p.screenshot({path:out+`/moat-${on?'on':'off'}-${width}.png`});}
    // Equal recording overhead in both sides; only presentation time advances in this controlled comparison.
    await p.evaluate(()=>{window._livingQaClock=setInterval(()=>{_gameTime+=1000/60;},1000/60);});
    for(const on of [false,true]){
      const name=`${width}-${on?'on':'off'}`,cdp=await context.newCDPSession(p),frames=[],writes=[];await fs.mkdir(out+`/frames-${name}`,{recursive:true});
      await p.evaluate(on=>window._Web3DLivingLayer.setEnabled(on),on);
      cdp.on('Page.screencastFrame',event=>{const i=frames.length;frames.push(event.metadata.timestamp);writes.push(fs.writeFile(out+`/frames-${name}/${String(i).padStart(5,'0')}.jpg`,Buffer.from(event.data,'base64')));cdp.send('Page.screencastFrameAck',{sessionId:event.sessionId}).catch(()=>{});});
      await cdp.send('Page.startScreencast',{format:'jpeg',quality:90,maxWidth:width,maxHeight:1080,everyNthFrame:2});
      await sample(p,`${name} 촬영`,10);await cdp.send('Page.stopScreencast');await Promise.all(writes);await cdp.detach();await fs.writeFile(out+`/frames-${name}.json`,JSON.stringify(frames));
      result.samples.push(await sample(p,`${name} 고정 카메라·물리 정지·표현 시간 활성, 녹화 없는 성능`));
    }
    await p.evaluate(()=>{clearInterval(window._livingQaClock);window._Web3DLivingLayer.setEnabled(true);});
  }
  await p.setViewportSize({width:1920,height:1080});
  // Actual native movement/attack input, no invulnerability, scripted AI or damage changes.
  await p.evaluate(()=>{window._btFramePause=false;});const before=await p.evaluate(()=>({x:P.x,y:P.y,hp:P.hp}));
  await p.keyboard.down('a');await p.waitForTimeout(1300);await p.keyboard.up('a');await p.mouse.move(1150,520);await p.mouse.down();await p.waitForTimeout(1800);await p.keyboard.down('q');await p.waitForTimeout(500);await p.keyboard.up('q');await p.mouse.up();
  result.input={before,after:await p.evaluate(()=>({x:P.x,y:P.y,hp:P.hp,stats:{...G._sStats},layer:window._Web3DLivingLayer.snapshot()}))};await p.screenshot({path:out+'/native-input.png'});
  // Separate dense active stress fixture, explicitly NOT natural play.
  result.dense=await p.evaluate(()=>{window._btFramePause=true;P.x=4020;P.y=6500;G.cam.x=P.x;G.cam.y=P.y;P.hp=P.mhp=1000000;ens=[];projs.length=0;pProjs.length=0;const tiles=G._floorTiles.filter(c=>{const x=(c.tx+.5)*T,y=(c.ty+.5)*T,d=Math.hypot(x-P.x,y-P.y);return d>150&&d<800&&canMv(x,y,24);});for(let i=0;i<64;i++){const c=tiles[i*137%tiles.length];const e=mkEn((c.tx+.5)*T,(c.ty+.5)*T,0,i%8,false,1,0);if(e)ens.push(e);}for(let i=0;i<96;i++){const a=i*6.283/96;spawnProj({x:P.x+Math.cos(a)*400,y:P.y+Math.sin(a)*300,vx:-Math.cos(a),vy:-Math.sin(a),life:900,ml:900,sz:2,el:0,dmg:20,friendly:false,redBean:true,parryClass:'physical',_commit:true});}window._btFramePause=false;return {enemies:ens.length,bullets:projs.length,hpOverride:true};});
  result.samples.push(await sample(p,'64적·96탄 활성 스트레스 ON (HP100만 fixture)'));
  await p.screenshot({path:out+'/dense-on.png'});
  result.final=await p.evaluate(()=>({layer:window._Web3DLivingLayer.snapshot(),legacyCreated:!!window._Web3DTrial,legacyMap:!!window._Web3DTrialMap}));
  await fs.writeFile(out+'/qa-receipt.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result.samples));
  if(result.errors.length||result.http.length||result.final.layer.error)throw Error('실행 검수 오류 '+JSON.stringify({errors:result.errors,http:result.http}));
 }finally{await browser.close();}
})().catch(async e=>{console.error(e.stack);await fs.writeFile(out+'/failure.txt',e.stack);process.exitCode=1;});
