const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('playwright'),sharp=require('sharp');
const out=process.env.WEB3D_QA_OUT||'I:/EXODUSER-Storage/web3d-lighting-20261031/pass1',root=path.resolve(__dirname,'..');
const url='http://127.0.0.1:3377/game.html?classic=1&r3d=1&tutorial=0&resourceTutorial=0&slot=web3d-light-isolated';
(async()=>{await fs.mkdir(out+'/temp',{recursive:true});const result={url,errors:[],http:[],cameras:[],source:{}};
 for(const f of ['game.html','web3d/map-look-pass.mjs','web3d/map-look-layout.mjs','web3d/lighting-model.mjs','web3d/forest-layer.mjs'])result.source[f]=crypto.createHash('sha256').update(await fs.readFile(root+'/'+f)).digest('hex');
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio'],env:{...process.env,TEMP:out+'/temp',TMP:out+'/temp'}});
 try{const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});await context.route('**/*',r=>r.continue());const p=await context.newPage();
 p.on('pageerror',e=>result.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')result.errors.push(m.text());});p.on('response',r=>{if(r.status()>=400)result.http.push({url:r.url(),status:r.status()});});
 await p.goto(url,{waitUntil:'domcontentloaded',timeout:60000});await p.waitForFunction(()=>typeof P!=='undefined'&&P?.x>0&&typeof _startSceneWarmState!=='undefined'&&_startSceneWarmState.status==='ready',null,{timeout:90000});
 for(let i=0;i<150;i++){const s=await p.evaluate(()=>({on:G.on,cutscene:_cutsceneState,guide:getComputedStyle(document.getElementById('introKeys')).opacity==='1'}));if(s.on)break;if(s.guide)await p.locator('#ikSkip').click();else if(s.cutscene==='INTRO_CUTSCENE')await p.keyboard.press('Escape');await p.waitForTimeout(150);}
 await p.waitForFunction(()=>G.on&&window._Web3DLivingLayer?.snapshot().frame>10&&getComputedStyle(document.getElementById('stageTransition')).opacity==='0',null,{timeout:90000});await p.waitForTimeout(1200);await p.evaluate(()=>window._btFramePause=true);
 for(const [name,x,y,width]of (process.argv.includes('--side')?[['side_l',2120,5480,3840]]:[['camp',1900,4180,1920],['altar',5900,4120,1920],['corpse_tree',4100,3900,1920],['cocoon',1800,2200,1920],['side_l',2120,5480,3840]])){
 await p.setViewportSize({width,height:1080});await p.evaluate(({x,y})=>{P.x=x;P.y=y;G.cam.x=x;G.cam.y=y;},{x,y});await p.waitForTimeout(1600);await p.waitForFunction(()=>Object.values(_ch1StartOuterCache).every(e=>e.status!=='loading'),null,{timeout:45000});
 for(const on of [false,true]){await p.evaluate(on=>window._Web3DLivingLayer.setEnabled(on),on);await p.waitForTimeout(150);await p.screenshot({path:out+'/'+name+'-'+(on?'on':'off')+'.png'});}
 const off=await fs.readFile(out+'/'+name+'-off.png'),on=await fs.readFile(out+'/'+name+'-on.png');await sharp({create:{width:width*2,height:1080,channels:3,background:'#111'}}).composite([{input:off,left:0,top:0},{input:on,left:width,top:0}]).png().toFile(out+'/'+name+'-comparison.png');
 const state=await p.evaluate(()=>({player:[P.x,P.y],cam:[G.cam.x,G.cam.y],stage:G.stage,on:G.on,paused:window._btFramePause,layer:window._Web3DLivingLayer.snapshot()}));result.cameras.push({name,x,y,width,state});console.log('카메라 '+name+' '+JSON.stringify(state));assert.equal(state.player[0],x);assert.equal(state.cam[1],y);
 }
 await fs.writeFile(out+'/qa.json',JSON.stringify(result,null,2));console.log(JSON.stringify({errors:result.errors,http:result.http}));assert.equal(result.errors.length,0);assert.equal(result.http.length,0);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
