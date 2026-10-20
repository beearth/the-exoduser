import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({ headless:true, args:['--use-gl=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport:{width:1600,height:900} });
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://127.0.0.1:3333/game.html',{waitUntil:'commit',timeout:30000});
await p.waitForFunction(()=>typeof G!=='undefined'&&G&&typeof initStage==='function'&&typeof FIXED_MAPS!=='undefined'&&FIXED_MAPS[0],null,{timeout:60000,polling:200});
await p.waitForTimeout(3000);
const r = await p.evaluate(()=>{
  if(!P)P=mkP(); G.stage=0; initStage(0); OPT.diff=5;
  const out={};
  try{window._parryLesson=null}catch(e){}
  try{window._systemLesson=null}catch(e){}
  G.on=true;G.paused=false;G._intro=null;P.iframes=1e9;ens.length=0;
  const hole=G.spawnHoles.find(h=>h.x===3780&&h.y===6220);
  G.spawnHoles=[hole];
  out.gameFrame0=_gameFrame;
  const log=[];let prevLen=0;
  for(let f=0;f<1400;f++){
    P.x=4020;P.y=7420;P.hp=P.mhp;P.iframes=1e9;
    try{update()}catch(e){log.push({f,err:String(e).slice(0,200)});break}
    const alive=ens.length;
    const h=G.spawnHoles[0];
    if(alive!==prevLen||f<3||(h&&h._spawnDelay!=null&&f%50===0)){log.push({f,gf:_gameFrame,ens:alive,trig:h?!!h._triggered:null,delay:h?h._spawnDelay:null,cd:h?h._spawnCD:null,spawned:h?h._spawned:null,total:h?h._spawnTotal:null,interval:h?h._spawnInterval:null,holes:G.spawnHoles.length,last:ens.length?{x:ens[ens.length-1].x,y:ens[ens.length-1].y,et:ens[ens.length-1].etype,rif:ens[ens.length-1].reviveIframes}:null})}
    prevLen=alive;
    if(!G.spawnHoles.length){log.push({f,done:true,gf:_gameFrame});break}
  }
  out.log=log;out.sp=typeof sp!=='undefined'?sp:null;
  return out;
});
console.log(JSON.stringify(r));
console.error('errors:', errs.slice(0,5));
await b.close();
