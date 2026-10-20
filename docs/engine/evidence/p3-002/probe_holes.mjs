import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({ headless:true, args:['--disable-background-timer-throttling','--disable-backgrounding-occluded-windows','--disable-renderer-backgrounding','--use-gl=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport:{width:1600,height:900} });
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
const logs=[]; p.on('console',m=>{const t=m.text(); if(t.includes('[HOLE]')||t.includes('[MAP]'))logs.push(t)});
await p.goto('http://127.0.0.1:3333/game.html',{waitUntil:'commit',timeout:30000});
await p.waitForFunction(()=>typeof G!=='undefined'&&G&&typeof initStage==='function'&&typeof FIXED_MAPS!=='undefined'&&FIXED_MAPS[0],null,{timeout:60000,polling:200});
await p.waitForTimeout(3000);
const r = await p.evaluate(()=>{
  const out={};
  try{ if(!P)P=mkP(); G.stage=0; initStage(0); }catch(e){ out.err=String(e&&e.stack||e); }
  out.T=T; out.mw=G.mw; out.mh=G.mh; out.isTileRLE=G._isTileRLE; out.pathImg=G._pathImgTerrain;
  out.P={x:P.x,y:P.y};
  out.total=G._totalSpawned;
  out.holes=G.spawnHoles.map(h=>({x:h.x,y:h.y,size:h.size,room:h.room,timer:h.timer,cnt:_spawnHoleCount(h.size,0),d:Math.hypot(h.x-P.x,h.y-P.y)}));
  out.rooms=G.rooms.map(r=>({cx:r.cx,cy:r.cy,w:r.w,h:r.h,type:r.type}));
  out.mapHash=(()=>{let s=0;for(let y=0;y<G.mh;y++)for(let x=0;x<G.mw;x++)s=(s*31+G.map[y][x])>>>0;return s})();
  out.counts=[0,0,0,0,0,0].map((_,v)=>{let c=0;for(let y=0;y<G.mh;y++)for(let x=0;x<G.mw;x++)if(G.map[y][x]===v)c++;return c});
  return out;
});
console.log(JSON.stringify(r,null,1));
console.log(logs.join('\n'));
console.log('errors:', errs.slice(0,5));
await b.close();
