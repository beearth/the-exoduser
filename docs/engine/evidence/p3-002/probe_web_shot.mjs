import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const OUT=process.argv[2];
const b = await chromium.launch({ headless:true, args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling','--disable-renderer-backgrounding'] });
const p = await b.newPage({ viewport:{width:1920,height:1080} });
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:3333/game.html',{waitUntil:'commit',timeout:30000});
await p.waitForFunction(()=>typeof G!=='undefined'&&G&&typeof initStage==='function'&&typeof FIXED_MAPS!=='undefined'&&FIXED_MAPS[0],null,{timeout:60000,polling:200});
await p.waitForTimeout(20000);
const r=await p.evaluate(()=>{
  try{ if(!P)P=mkP(); G.stage=0; initStage(0); OPT.diff=5; }catch(e){return 'init '+e}
  try{window._parryLesson=null}catch(e){}
  G._intro=null;G.paused=false;P.iframes=1e9;ens.length=0;
  try{hideBootLoading()}catch(e){}
  try{const sg=document.querySelector('#systemGuide,#sysGuide');if(sg)sg.style.display='none'}catch(e){}
  for(const id of ['introCurtain','introGuide','bootLoading','cutscene','lobby']){const el=document.getElementById(id);if(el)el.style.display='none'}
  P.x=3780;P.y=6560;G.cam.x=P.x;G.cam.y=P.y;
  G.spawnHoles=G.spawnHoles.filter(h=>h.x===3780&&h.y===6220);
  G.on=true;_gameFrame=200;
  return {holes:G.spawnHoles.length,gf:_gameFrame,on:G.on};
});
console.log(JSON.stringify(r));
for(let i=0;i<8;i++){await p.waitForTimeout(250);await p.evaluate(()=>{P.x=3780;P.y=6560;})}
const s=await p.evaluate(()=>({gf:_gameFrame,h:G.spawnHoles.map(h=>({t:h._triggered,d:h._spawnDelay,sp:h._spawned})),ens:ens.length,P:[P.x,P.y]}));
console.log(JSON.stringify(s));
await p.screenshot({path:OUT+'/web_hole.png'});
console.error('errors:', errs.slice(0,5));
await b.close();
