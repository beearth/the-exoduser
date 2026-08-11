import { chromium } from 'playwright';
const b = await chromium.launch({ headless:false, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', args:['--disable-background-timer-throttling','--disable-backgrounding-occluded-windows','--disable-renderer-backgrounding'] });
const page = await b.newPage({ viewport:{width:1280,height:720} });
await page.addInitScript((seed)=>{let s=seed>>>0;Math.random=function(){s|=0;s=(s+0x6D2B79F5)|0;let t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};},1337);
page.on('pageerror',e=>console.log('PAGEERR:',e.message.slice(0,140)));
async function ev(label, fn, arg, ms=8000){
  console.log('… '+label);
  let to; const timeout=new Promise((_,rej)=>{to=setTimeout(()=>rej(new Error('EVAL TIMEOUT '+label)),ms);});
  try{ const r=await Promise.race([page.evaluate(fn,arg), timeout]); clearTimeout(to); console.log('  ✓ '+label+' → '+JSON.stringify(r)); return r; }
  catch(e){ clearTimeout(to); console.log('  ✗ '+label+' :: '+e.message); throw e; }
}
await page.goto('http://127.0.0.1:3333/game.html?bosstest=3&perf=1',{waitUntil:'commit',timeout:15000});
await page.waitForFunction(()=>typeof G!=='undefined'&&G&&typeof P!=='undefined'&&P&&typeof mkEn==='function'&&typeof ens!=='undefined'&&typeof rz==='function',null,{timeout:25000,polling:200}).catch(()=>{});
await page.waitForTimeout(7000);
await ev('setup', ()=>{ try{ G._cutsceneDone=true; try{_cutsceneState=null}catch(e){} if(!(G.mw>0))initStage(G.stage||3); G.on=true; if(window._btBoss)window._btBoss._btFrozen=true;
  window.__spawn=(N)=>{ for(let i=ens.length-1;i>=0;i--){if(ens[i]&&!ens[i].ib)ens.splice(i,1);} const cx=P.x,cy=P.y;let placed=0,ring=1; while(placed<N&&ring<300){const r=70+ring*26,per=Math.max(6,Math.floor(2*Math.PI*r/34));for(let k=0;k<per&&placed<N;k++){const e=mkEn(cx+Math.cos((k/per)*6.283+ring*0.3)*r,cy+Math.sin((k/per)*6.283+ring*0.3)*r,G.stage,6,false,placed%5,-1);if(e){e.alive=true;ens.push(e);placed++;}}ring++;} return placed; };
  window.__res=(r)=>{OPT.resScale=r;rz();return{w:C.width,h:C.height};};
  window.__pause=(v)=>{window._btFramePause=!!v;return window._btFramePause;};
  window.__alive=()=>{let n=0;for(let i=0;i<ens.length;i++)if(ens[i]&&ens[i].alive)n++;return n;};
  return {ok:true,mw:G.mw,px:P.x|0,py:P.y|0}; }catch(e){return{err:e.message}} });
await ev('unpause', ()=>window.__pause(false));
await ev('res100', ()=>window.__res(100));
const sp = await ev('spawn500', ()=>window.__spawn(500), null, 15000);
await ev('aliveAfterSpawn', ()=>window.__alive());
console.log('… warm 1600ms'); await page.waitForTimeout(1600);
await ev('aliveAfterWarm', ()=>window.__alive());
await ev('pauseTrue', ()=>window.__pause(true));
await ev('res100b', ()=>window.__res(100));
console.log('… settle 700'); await page.waitForTimeout(700);
await ev('probeD', ()=>({u:+_prof.u.toFixed(2),d:+_prof.d.toFixed(2),t:+_prof.t.toFixed(2)}));
await ev('res50', ()=>window.__res(50));
console.log('… settle 700'); await page.waitForTimeout(700);
await ev('probeD50', ()=>({u:+_prof.u.toFixed(2),d:+_prof.d.toFixed(2),t:+_prof.t.toFixed(2)}));
console.log('DONE');
await b.close();
