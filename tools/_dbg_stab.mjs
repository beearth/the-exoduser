import { chromium } from 'playwright';
const b = await chromium.launch({ headless:false, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', args:['--disable-background-timer-throttling','--disable-backgrounding-occluded-windows','--disable-renderer-backgrounding'] });
const p = await b.newPage({ viewport:{width:1280,height:720} });
await p.goto('http://127.0.0.1:3333/game.html?bosstest=3&perf=1',{waitUntil:'commit',timeout:15000});
await p.waitForFunction(()=>typeof G!=='undefined'&&G&&typeof mkEn==='function'&&typeof ens!=='undefined'&&typeof P!=='undefined'&&P,null,{timeout:30000,polling:200});
await p.waitForTimeout(8000);
await p.evaluate(()=>{ try{G._cutsceneDone=true;try{_cutsceneState=null;}catch(e){} if(!(G.mw>0))initStage(G.stage||3); G.on=true; if(window._btBoss)window._btBoss._btFrozen=true;}catch(e){} 
  window.__alive=()=>{let n=0;for(const e of ens)if(e&&e.alive)n++;return n;};
  window.__top=(t)=>{let g=0;while(window.__alive()<t&&g<t*3){g++;const a=Math.random()*6.28,d=90+Math.random()*340;const e=mkEn(P.x+Math.cos(a)*d,P.y+Math.sin(a)*d,G.stage,6,false,g%5,-1);if(e){e.alive=true;ens.push(e);}}return window.__alive();};
});
// poll mw + alive every 1s for 10s WITHOUT spawning (find stabilization)
console.log('t(s) | mw | alive(no-spawn)');
for(let i=0;i<8;i++){ const s=await p.evaluate(()=>({mw:G.mw,al:window.__alive()})); console.log(`  ${i} | ${s.mw} | ${s.al}`); await p.waitForTimeout(1000); await p.evaluate(()=>{G.on=true;}); }
// now spawn to 300 and top-up each 500ms for 5s, poll
console.log('--- spawn300 + topup 500ms ---');
await p.evaluate(()=>window.__top(300));
for(let i=0;i<10;i++){ const s=await p.evaluate(()=>({mw:G.mw,al:window.__top(300),u:+_prof.u.toFixed(1),d:+_prof.d.toFixed(1)})); console.log(`  ${(i*0.5).toFixed(1)}s mw=${s.mw} alive=${s.al} U=${s.u} D=${s.d}`); await p.waitForTimeout(500); }
await b.close();
