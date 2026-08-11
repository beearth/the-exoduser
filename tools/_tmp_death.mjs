import { chromium } from 'playwright';
const b = await chromium.launch({ headless:false, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', args:['--disable-background-timer-throttling','--disable-backgrounding-occluded-windows','--disable-renderer-backgrounding'] });
const page = await b.newPage({ viewport:{width:1280,height:720} });
page.on('pageerror',e=>console.log('PAGEERR:',e.message.slice(0,140)));
await page.goto('http://127.0.0.1:3333/game.html?bosstest=3&perf=1',{waitUntil:'commit',timeout:15000});
await page.waitForFunction(()=>typeof G!=='undefined'&&G&&typeof P!=='undefined'&&P&&typeof mkEn==='function'&&typeof ens!=='undefined',null,{timeout:25000,polling:200}).catch(()=>{});
await page.waitForTimeout(7000);
// 1) G.on 먼저 켜서 테스트베드 2초 setup 타이머 시작
await page.evaluate(()=>{ G._cutsceneDone=true; try{_cutsceneState=null}catch(e){} G.on=true; });
console.log('… G.on 켬, 테스트베드 setup 대기 3800ms');
await page.waitForTimeout(3800); // _btWait setup(initStage+보스스폰) 1회 실행 완료 대기
// 2) 이제 안정. 계측/스폰 설치 + 보스 프리즈
await page.evaluate(()=>{ G.on=true; if(window._btBoss)window._btBoss._btFrozen=true;
  window.__spawn=(N)=>{ for(let i=ens.length-1;i>=0;i--){if(ens[i]&&!ens[i].ib)ens.splice(i,1);} const cx=P.x,cy=P.y;let placed=0,ring=1; while(placed<N&&ring<300){const r=70+ring*26,per=Math.max(6,Math.floor(2*Math.PI*r/34));for(let k=0;k<per&&placed<N;k++){const e=mkEn(cx+Math.cos((k/per)*6.283+ring*0.3)*r,cy+Math.sin((k/per)*6.283+ring*0.3)*r,G.stage,6,false,placed%5,-1);if(e){e.alive=true;ens.push(e);placed++;}}ring++;} return placed; };
});
const spawned = await page.evaluate(()=>window.__spawn(500));
console.log('spawned',spawned);
for(let i=0;i<10;i++){
  await page.waitForTimeout(200);
  const s = await page.evaluate(()=>{
    let alive=0,dead=0,hpLow=0,offmap=0; let sample=null,deadSample=null;
    for(let j=0;j<ens.length;j++){const e=ens[j];if(!e)continue;if(e.ib)continue;
      if(e.alive){alive++; if(!sample)sample={hp:e.hp|0,mhp:e.mhp|0,s:e.s,x:e.x|0,y:e.y|0,bleed:e.bleed,burn:e.burn,poison:e.poison,plagued:!!e._plagued,st:e.stunned|0}; }
      else {dead++; if(!deadSample)deadSample={hp:e.hp|0,mhp:e.mhp|0,s:e.s,absorbed:!!e._absorbed};}
    }
    return {alive,dead,total:ens.length,sample,deadSample,pHp:P.hp|0,fireZones:(G._fireZones||[]).length,rifts:(G.rifts||[]).length};
  });
  console.log('t+'+((i+1)*200)+'ms',JSON.stringify(s));
}
await b.close();
