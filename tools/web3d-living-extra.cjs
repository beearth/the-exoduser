const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const {chromium}=require('playwright'),sharp=require('sharp');
const out='I:/EXODUSER-Storage/web3d-layer1-20261031/final',root=path.resolve(__dirname,'..');
const url='http://127.0.0.1:3377/game.html?classic=1&r3d=1&tutorial=0&resourceTutorial=0&slot=web3d-layer1-extra-isolated';
(async()=>{
 // Prove the two expanded autosave harness failures already exist before this change.
 const baseline=cp.execFileSync('C:/Program Files/Git/cmd/git.exe',['show','e1e79ae680eb46915b42d06335af9f94163a30d4:game.html'],{encoding:'utf8',maxBuffer:12e6,windowsHide:true});
 await fs.writeFile(out+'/baseline-game.html',baseline);
 const original=await fs.readFile(root+'/test/cloudAutoSave.test.js','utf8');
 await fs.writeFile(out+'/baseline-cloud.test.mjs',original.replace("new URL('../game.html', import.meta.url)","new URL('./baseline-game.html', import.meta.url)"));
 const run=cp.spawnSync('C:/nvm4w/nodejs/node.exe',['--test',out+'/baseline-cloud.test.mjs'],{encoding:'utf8',windowsHide:true});await fs.writeFile(out+'/baseline-cloud.txt',run.stdout+run.stderr);
 const result={baselineCloudExit:run.status,errors:[],hud:{},source:{}};
 for(const f of ['game.html','web3d/living-layer.mjs','web3d/living-layout.mjs','assets/web3d/living/rotten-underbrush-atlas.png'])result.source[f]=crypto.createHash('sha256').update(await fs.readFile(root+'/'+f)).digest('hex');
 for(const width of [1920,3840]){const a=await sharp(out+`/moat-off-${width}.png`).raw().toBuffer(),b=await sharp(out+`/moat-on-${width}.png`).raw().toBuffer();const channels=a.length/(width*1080);for(const [name,x,y,w,h]of [['level',width-255,0,255,180],['skill',width/2-380,980,760,100]]){let changed=0;for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)for(let c=0;c<channels;c++){const i=(yy*width+xx)*channels+c;if(a[i]!==b[i])changed++;}result.hud[width+'-'+name]={changedChannels:changed,channels:w*h*channels};}}
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio'],env:{...process.env,TEMP:out+'/temp',TMP:out+'/temp'}});
 try{
  const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});await context.route('**/*',r=>r.continue());const p=await context.newPage();p.on('pageerror',e=>result.errors.push(e.message));
  await p.goto(url,{waitUntil:'domcontentloaded',timeout:60000});await p.waitForFunction(()=>typeof P!=='undefined'&&P?.x>0&&typeof _startSceneWarmState!=='undefined'&&_startSceneWarmState.status==='ready',null,{timeout:90000});
  for(let i=0;i<100;i++){const s=await p.evaluate(()=>({on:G.on,cutscene:_cutsceneState,guide:getComputedStyle(document.getElementById('introKeys')).opacity==='1'}));if(s.on)break;if(s.guide)await p.locator('#ikSkip').click();else if(s.cutscene==='INTRO_CUTSCENE')await p.keyboard.press('Escape');await p.waitForTimeout(200);}
  await p.waitForFunction(()=>G.on&&window._Web3DLivingLayer?.snapshot().frame>30,null,{timeout:90000});
  if(process.argv.includes('--water-probe')){
    await p.evaluate(()=>{window._btFramePause=true;P.x=5880;P.y=4310;G.cam.x=P.x;G.cam.y=P.y;});await p.waitForTimeout(1000);
    const pixels=await p.evaluate(()=>{const a=window._Web3DLivingLayer;draw();_glFlush();return {png:a.canvas.toDataURL(),snapshot:a.snapshot()};});await fs.writeFile(out+'/layer-only.png',Buffer.from(pixels.png.split(',')[1],'base64'));console.log(JSON.stringify(pixels.snapshot));return;
  }
  result.actorParity=await p.evaluate(()=>{
    window._btFramePause=true;const api=window._Web3DLivingLayer,originalDraw=SpriteAnimator.draw,originalX=X,originalRandom=Math.random,step=_dtSp;_dtSp=0;
    let matrix=new DOMMatrix(),stack=[],record=[],heroCanvas;const current=()=>[matrix.a,matrix.b,matrix.c,matrix.d,matrix.e,matrix.f];
    const proxy=new Proxy(originalX,{get(target,key){const v=target[key];if(typeof v!=='function')return v;return(...args)=>{if(key==='save')stack.push(new DOMMatrix(current()));if(key==='restore')matrix=stack.pop()||new DOMMatrix();if(key==='translate')matrix.translateSelf(...args);if(key==='scale')matrix.scaleSelf(...args);if(key==='rotate')matrix.rotateSelf(args[0]*180/Math.PI);if(key==='setTransform')matrix=args.length===6?new DOMMatrix(args):new DOMMatrix();return v.apply(target,args);};},set(target,key,v){target[key]=v;return true;}});
    SpriteAnimator.draw=function(sa,ctx,x,y,flip,dir){if(sa.img===_atlasP_img||sa.img===_atlasP_bright||sa.img===_atlasP_outline){const descriptor={source:sa.img===_atlasP_img?'original':sa.img===_atlasP_bright?'native-bright':'native-outline',anim:sa.anim,f:sa.f,dir,flip,matrix:current(),alpha:ctx.globalAlpha};record.push(descriptor);const dest=heroCanvas.getContext('2d');dest.save();dest.setTransform(...descriptor.matrix);dest.globalAlpha=descriptor.alpha;originalDraw.call(this,sa,dest,x,y,flip,dir);dest.restore();}return originalDraw.call(this,sa,ctx,x,y,flip,dir);};
    const take=on=>{record=[];matrix=new DOMMatrix();stack=[];heroCanvas=document.createElement('canvas');heroCanvas.width=C.width;heroCanvas.height=C.height;let seed=12345;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};api.setEnabled(on);X=proxy;draw();_glFlush();return {draws:record,rgba:Array.from(heroCanvas.getContext('2d').getImageData(0,0,C.width,C.height).data),png:heroCanvas.toDataURL()};};
    const hud=()=>['hud','mmLvl','mmWrap','hudCorner','globeHP','globeMP'].map(id=>{const e=document.getElementById(id);if(!e)return {id,missing:true};const c=getComputedStyle(e),r=e.getBoundingClientRect();return {id,html:e.innerHTML,rect:{x:r.x,y:r.y,w:r.width,h:r.height},style:[c.font,c.color,c.transform,c.background,c.opacity,c.position,c.zIndex]};});
    try{take(false);const off=take(false),offHud=hud(),on=take(true),onHud=hud();return {hudLayoutEqual:JSON.stringify(offHud)===JSON.stringify(onHud),hud:offHud.map(({html,...rest})=>rest),drawsEqual:JSON.stringify(off.draws)===JSON.stringify(on.draws),offDraws:off.draws,onDraws:on.draws,changedChannels:off.rgba.reduce((n,v,i)=>n+(v!==on.rgba[i]),0),offPng:off.png,onPng:on.png};}finally{X=originalX;SpriteAnimator.draw=originalDraw;Math.random=originalRandom;_dtSp=step;api.setEnabled(true);window._btFramePause=false;}
  });
  for(const side of ['off','on']){await fs.writeFile(out+`/hero-isolated-${side}.png`,Buffer.from(result.actorParity[side+'Png'].split(',')[1],'base64'));delete result.actorParity[side+'Png'];}
  if(process.argv.includes('--parity-only')){
    const previous=JSON.parse(await fs.readFile(out+'/extra-receipt.json','utf8'));
    if(JSON.stringify(previous.source)!==JSON.stringify(result.source))throw Error('기존 입력 촬영과 현재 소스 SHA 불일치');
    previous.actorParity=result.actorParity;previous.compositeCropNote='기존 hud 사각 crop의 변경채널은 투명 HUD 뒤 배경까지 포함한 값이다. actorParity.hudLayoutEqual은 DOM·computedStyle·실제 위치를 별도로 비교한다.';
    await fs.writeFile(out+'/extra-receipt.json',JSON.stringify(previous,null,2));console.log(JSON.stringify({spriteDrawsEqual:result.actorParity.drawsEqual,spriteChangedChannels:result.actorParity.changedChannels,hudLayoutEqual:result.actorParity.hudLayoutEqual}));return;
  }
  // Ten seconds of native movement, attack and Q with normal health/AI. No teleport.
  const before=await p.evaluate(()=>({x:P.x,y:P.y,hp:P.hp,mhp:P.mhp,stats:{...G._sStats}}));
  const cdp=await context.newCDPSession(p),frames=[],writes=[];await fs.mkdir(out+'/frames-input',{recursive:true});cdp.on('Page.screencastFrame',e=>{const i=frames.length;frames.push(e.metadata.timestamp);writes.push(fs.writeFile(out+`/frames-input/${String(i).padStart(5,'0')}.jpg`,Buffer.from(e.data,'base64')));cdp.send('Page.screencastFrameAck',{sessionId:e.sessionId}).catch(()=>{});});await cdp.send('Page.startScreencast',{format:'jpeg',quality:90,maxWidth:1920,maxHeight:1080,everyNthFrame:2});
  await p.keyboard.down('w');await p.waitForTimeout(1600);await p.keyboard.up('w');await p.mouse.move(1160,480);await p.mouse.down();await p.waitForTimeout(2500);await p.keyboard.down('q');await p.waitForTimeout(700);await p.keyboard.up('q');await p.keyboard.down('a');await p.waitForTimeout(1200);await p.keyboard.up('a');await p.waitForTimeout(4000);await p.mouse.up();await cdp.send('Page.stopScreencast');await Promise.all(writes);await fs.writeFile(out+'/frames-input.json',JSON.stringify(frames));
  result.input={before,after:await p.evaluate(()=>({x:P.x,y:P.y,hp:P.hp,mhp:P.mhp,stats:{...G._sStats},layer:window._Web3DLivingLayer.snapshot()}))};await p.screenshot({path:out+'/native-combat-input.png'});
  const cdpBrowser=await browser.newBrowserCDPSession();result.gpu=(await cdpBrowser.send('SystemInfo.getInfo')).gpu.devices;
  await fs.writeFile(out+'/extra-receipt.json',JSON.stringify(result,null,2));console.log(JSON.stringify({actorParity:{...result.actorParity,offDraws:result.actorParity.offDraws.length,onDraws:result.actorParity.onDraws.length},hud:result.hud,input:result.input,baselineCloudExit:result.baselineCloudExit,errors:result.errors}));
  if(result.errors.length||!result.actorParity.drawsEqual||result.actorParity.changedChannels||!result.actorParity.offDraws.length)throw Error('native actor parity failed');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
