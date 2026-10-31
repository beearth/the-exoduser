const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const out='I:/EXODUSER-Storage/web3d-maplook-20261031',root=path.resolve(__dirname,'..');
const url='http://127.0.0.1:3377/game.html?classic=1&r3d=1&tutorial=0&resourceTutorial=0&slot=web3d-maplook-isolated';
async function ready(p){
 await p.waitForFunction(()=>typeof P!=='undefined'&&P?.x>0&&typeof _startSceneWarmState!=='undefined'&&_startSceneWarmState.status==='ready',null,{timeout:90000});
 for(let i=0;i<150;i++){const s=await p.evaluate(()=>({on:G.on,cutscene:_cutsceneState,guide:getComputedStyle(document.getElementById('introKeys')).opacity==='1'}));if(s.on)break;if(s.guide)await p.locator('#ikSkip').click();else if(s.cutscene==='INTRO_CUTSCENE')await p.keyboard.press('Escape');await p.waitForTimeout(150);}
 await p.waitForFunction(()=>G.on&&window._Web3DLivingLayer?.snapshot().frame>5&&getComputedStyle(document.getElementById('stageTransition')).opacity==='0',null,{timeout:90000});
 // Native save/status polling may keep the network active after terrain is ready.
 await p.waitForLoadState('networkidle',{timeout:5000}).catch(()=>console.log('지속 API polling: 게임 warm/frame/청크 ready 조건으로 검수')); 
}
(async()=>{
 await fs.mkdir(out+'/temp',{recursive:true});const result={url,errors:[],http:[],source:{},cameras:[]};
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--mute-audio'],env:{...process.env,TEMP:out+'/temp',TMP:out+'/temp'}});
 try{
 const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});await context.route('**/*',r=>r.continue());const p=await context.newPage();
 p.on('pageerror',e=>result.errors.push(e.message));p.on('console',m=>{if(m.type()==='error')result.errors.push(m.text());});p.on('response',r=>{if(r.status()>=400)result.http.push({url:r.url(),status:r.status()});});
 console.log('MAP-LOOK 검수 시작');await p.goto(url,{waitUntil:'domcontentloaded',timeout:60000});await ready(p);
 await p.waitForTimeout(8000);await p.evaluate(()=>{window._btFramePause=true;});
 for(const [name,x,y]of [['camp',1900,4180],['altar',5900,4120],['corpse_tree',4100,3900],['cocoon',1800,2200],['start',4020,7420]]){
  await p.evaluate(({x,y})=>{P.x=x;P.y=y;G.cam.x=x;G.cam.y=y;},{x,y});await p.waitForTimeout(2000);
  await p.waitForFunction(()=>Object.values(_ch1StartOuterCache).every(e=>e.status!=='loading'),null,{timeout:30000});
  for(const on of [false,true]){await p.evaluate(on=>window._Web3DLivingLayer.setEnabled(on),on);await p.waitForTimeout(200);await p.screenshot({path:out+`/${name}-${on?'on':'off'}-1920.png`});}
  result.cameras.push({name,x,y,state:await p.evaluate(()=>({layer:window._Web3DLivingLayer.snapshot(),hero:{x:P.x,y:P.y},renderer:_useGPU?'WebGPU':_useGL?'WebGL':'Canvas2D'}))});
  if(process.argv.includes('--probe'))break;
 }
 result.final=await p.evaluate(()=>({layer:window._Web3DLivingLayer.snapshot(),objects:MAP_OBJS.filter(o=>o._hand).map(o=>({type:o.type,x:o.x,y:o.y})),holes:G.spawnHoles?.length}));
 for(const f of ['game.html','web3d/living-layer.mjs','web3d/living-relief.mjs','assets/web3d/map-look-ch1.json','assets/web3d/map-look-anchors.json'])result.source[f]=crypto.createHash('sha256').update(await fs.readFile(root+'/'+f)).digest('hex');
 await fs.writeFile(out+(process.argv.includes('--probe')?'/probe.json':'/qa-stage1.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify({errors:result.errors,http:result.http,final:result.final}));
 assert.equal(result.errors.length,0);assert.equal(result.http.length,0);assert.equal(result.final.layer.error,null);assert.equal(result.final.layer.mapLook,true);
 assert.equal(result.final.layer.authoredShadows,29);assert.equal(result.final.layer.foregroundTotal,27);assert.equal(result.final.layer.shaftTotal,8);
 }finally{await browser.close();}
})().catch(async e=>{console.error(e.stack);process.exitCode=1;});
