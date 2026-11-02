const fs = require('fs');
const path = require('path');
const { chromium } = require(path.join(process.env.EXO_NODE_MODULES || 'G:/exoduser/node_modules', 'playwright'));
const out = process.argv[2];
const boss = process.argv[3] === 'boss';
const fullrun = process.argv[3] === 'fullrun';
if (!out) throw new Error('output directory required');
fs.mkdirSync(out, { recursive: true });
const temp = path.resolve(out, 'temp');
fs.mkdirSync(temp, { recursive: true });
process.env.TEMP = temp;
process.env.TMP = temp;
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required'] });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  // Disallow writes to the shared server. This run has a fresh browser context and a unique test slot.
  await context.route('**/api/**', async route => {
    if (!['GET', 'HEAD'].includes(route.request().method())) return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"qaWriteBlocked":true}' });
    return route.continue();
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const url = 'http://127.0.0.1:3333/game.html?classic=1&test=1' + (boss ? '&bosstest=0' : '') + '&slot=FULLRUN_QA_' + Date.now();
  const rows = [];
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    for (let i = 0; i < 45; i++) {
      const state = await page.evaluate(() => {
        try { if (typeof Howler !== 'undefined') Howler.mute(true); if (typeof BGM !== 'undefined' && BGM.setVolume) BGM.setVolume(0); } catch (_) {}
        if (typeof _cutsceneState !== 'undefined' && _cutsceneState === 'INTRO_CUTSCENE' && typeof _cutsceneEnd === 'function') _cutsceneEnd();
        return { on: typeof G !== 'undefined' && G.on, intro: typeof G !== 'undefined' && !!G._intro };
      });
      if (state.on && !state.intro) break;
      if (state.intro) await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    }
    await page.evaluate(() => {
      try { if (window._parryLesson && _parryLesson.skipAll) _parryLesson.skipAll(); if (window._systemLesson && _systemLesson.skipAll) _systemLesson.skipAll(); } catch (_) {}
      if (typeof G !== 'undefined') G.paused = false;
    });
    if (await page.locator('#settings').isVisible()) await page.keyboard.press('Escape');
    if (fullrun) {
      const started = Date.now(); let nextShot = 0, leftHeld = false, rightHeld = false; const held = new Set();
      await page.keyboard.down('r');
      let result = 'time-limit';
      while (Date.now() - started < 15 * 60 * 1000) {
        const frame = await page.evaluate(() => {
          if (typeof G === 'undefined' || typeof P === 'undefined') return { stop: 'not-started' };
          if (P.s === 'dead') return { stop: 'death', x: P.x, y: P.y, hp: P.hp, state: P.s };
          if (G.stageCleared) return { stop: 'stage-cleared', x: P.x, y: P.y, hp: P.hp };
          const nav = window.__inputFullrunNav ||= { path: [], goal: {x:0,y:0}, planAt: 0 };
          let target = null, near = 850 * 850;
          const actors = [...ens.filter(e => !e.dead && e.hp > 0), ...(G._fieldBosses || []).filter(e => e && e.hp > 0)];
          for (const e of actors) { const d=(e.x-P.x)**2+(e.y-P.y)**2; if(d<near){near=d;target=e;} }
          let aim={x:P.x,y:P.y-200}, to={x:P.x,y:P.y}, objective='field', fighting=!!target;
          if (G._bossArena && !G.bossAlive && G.exits.length) {to={x:(G.exits[0].x+.5)*T,y:(G.exits[0].y+.5)*T};objective='arena-exit';fighting=false;}
          else if(target){
            aim={x:target.x,y:target.y};let dx=P.x-target.x,dy=P.y-target.y,len=Math.hypot(dx,dy)||1;
            to={x:target.x+dx/len*210,y:target.y+dy/len*210};objective='combat';
            let line=true;for(let i=1;i<len/16;i++)if(isW(P.x+(target.x-P.x)*i/(len/16),P.y+(target.y-P.y)*i/(len/16))){line=false;break;}
            if(len>=170&&len<=260&&line)to={x:P.x,y:P.y};
          } else if(G._bossUnlocked && !G._bossArena && G.exits.length>1){to={x:(G.exits[1].x+.5)*T,y:(G.exits[1].y+.5)*T};objective='hell-gate';}
          else {
            let best=Infinity;
            const candidates=(G.spawnHoles||[]).length?G.spawnHoles:(G._fieldBosses||[]).filter(e=>e&&e.hp>0);
            for(const q of candidates.length?candidates:actors){const d=(q.x-P.x)**2+(q.y-P.y)**2;if(d<best){best=d;to={x:q.x,y:q.y};objective='explore';}}
          }
          let mx=0,my=0;
          if(Math.hypot(to.x-P.x,to.y-P.y)>12){
            if(performance.now()>nav.planAt||Math.hypot(nav.goal.x-to.x,nav.goal.y-to.y)>100){
              nav.goal=to;nav.planAt=performance.now()+1500;nav.path=[];
              const w=G.mw,h=G.mh,sx=Math.floor(P.x/T),sy=Math.floor(P.y/T),start=sy*w+sx;
              const prev=new Int32Array(w*h);prev.fill(-1);const queue=new Int32Array(w*h);let head=0,tail=1;queue[0]=start;prev[start]=start;
              let closest=start,best=Infinity;
              while(head<tail){
                const at=queue[head++],ax=at%w,ay=Math.floor(at/w),px=(ax+.5)*T,py=(ay+.5)*T,d=(px-to.x)**2+(py-to.y)**2;
                if(d<best){best=d;closest=at;}if(d<900)break;
                for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
                  const nx=ax+dx,ny=ay+dy,n=ny*w+nx;if(nx<0||ny<0||nx>=w||ny>=h||prev[n]>=0)continue;
                  const tx=(nx+.5)*T,ty=(ny+.5)*T;if(!canMv(tx,ty,P.r)||!canMv((px+tx)/2,(py+ty)/2,P.r))continue;
                  prev[n]=at;queue[tail++]=n;
                }
              }
              for(let n=closest;n!==start&&n>=0;n=prev[n])nav.path.push({x:(n%w+.5)*T,y:(Math.floor(n/w)+.5)*T});nav.path.reverse();
            }
            while(nav.path.length&&Math.hypot(nav.path[0].x-P.x,nav.path[0].y-P.y)<20)nav.path.shift();
            const q=nav.path[0]||to;mx=Math.abs(q.x-P.x)>10?Math.sign(q.x-P.x):0;my=Math.abs(q.y-P.y)>10?Math.sign(q.y-P.y):0;
            if(!canMv(P.x+mx*10,P.y+my*10,P.r)){mx=my=0;nav.planAt=0;}
          }
          const phase=performance.now()%3500;
          return {mx,my,fighting,attack:fighting&&phase<3150,magic:fighting&&performance.now()%2500<300,
            aimX:Math.max(180,Math.min(VW-180,aim.x-G.cam.x+VW/2)),aimY:Math.max(150,Math.min(VH-220,aim.y-G.cam.y+VH/2)),
            objective,x:P.x,y:P.y,hp:P.hp,state:P.s,stamina:P.st,mana:P.mp,level:P.lv,kills:G.kills,materials:G.mats,
            arena:G._bossArena,gate:G._bossUnlocked,holes:(G.spawnHoles||[]).length,anglers:(G._fieldBosses||[]).filter(e=>e&&e.hp>0).length,
            regions:(G._regions||[]).map(r=>({kills:r.kills,total:r.total,cleared:r.cleared})),boss:ens.filter(e=>e.ib&&e.hp>0).map(e=>({hp:e.hp,state:e.s}))};
        });
        if(frame.stop){result=frame.stop;rows.push(frame);await page.screenshot({path:path.join(out,`${result}.png`)});break;}
        const desired=new Set([...(frame.mx>0?['d']:frame.mx<0?['a']:[]),...(frame.my>0?['s']:frame.my<0?['w']:[])]);
        for(const key of held)if(!desired.has(key)){await page.keyboard.up(key);held.delete(key);}
        for(const key of desired)if(!held.has(key)){await page.keyboard.down(key);held.add(key);}
        await page.mouse.move(frame.aimX,frame.aimY);
        if(frame.attack!==leftHeld){if(frame.attack)await page.mouse.down({button:'left'});else await page.mouse.up({button:'left'});leftHeld=frame.attack;}
        if(frame.magic!==rightHeld){if(frame.magic)await page.mouse.down({button:'right'});else await page.mouse.up({button:'right'});rightHeld=frame.magic;}
        if(Date.now()>=nextShot){
          const seconds=Math.floor((Date.now()-started)/1000);rows.push({...frame,seconds});
          fs.appendFileSync(path.join(out,'telemetry.jsonl'),JSON.stringify({...frame,seconds})+'\n');
          await page.screenshot({path:path.join(out,`t${String(seconds).padStart(4,'0')}.png`)});nextShot=Date.now()+10000;
        }
        await page.waitForTimeout(100);
      }
      fs.writeFileSync(path.join(out,'fullrun-result.json'),JSON.stringify({result,seconds:(Date.now()-started)/1000,scope:'Natural browser inputs; no teleport, forced damage, spawn, health, resource or gate edits'},null,2));
      return;
    }
    for (let i = 0; i < 7; i++) {
      const row = await page.evaluate(() => ({ on: typeof G !== 'undefined' && G.on, p: typeof P !== 'undefined' ? { x: P.x, y: P.y, hp: P.hp, level: P.lv } : null, g: typeof G !== 'undefined' ? { kills: G.kills, paused: G.paused, stage: G.stage } : null, boss: typeof ens !== 'undefined' ? ens.filter(e=>e.ib&&!e.dead).map(e=>({hp:e.hp,state:e.s})) : [], settingsVisible: !!document.querySelector('#settings.open,#settings.active') }));
      rows.push(row);
      await page.screenshot({ path: path.join(out, `field-${i * 10}.png`) });
      await page.mouse.move(1150, 500); await page.mouse.down();
      if (i % 2 === 0) await page.keyboard.down('a'); else await page.keyboard.down('d');
      await page.waitForTimeout(10000);
      await page.keyboard.up('a'); await page.keyboard.up('d'); await page.mouse.up();
    }
    await page.keyboard.press('Tab'); await page.waitForTimeout(400); await page.screenshot({ path: path.join(out, 'inventory.png') });
    await page.keyboard.press('Tab'); await page.keyboard.press('k'); await page.waitForTimeout(400); await page.screenshot({ path: path.join(out, 'skills.png') });
  } finally {
    fs.writeFileSync(path.join(out, 'receipt.json'), JSON.stringify({ scope: 'Live origin/main 3333 classic; input reference, supported story/practice skip; server writes blocked; completion is recorded separately in fullrun-result.json', fixture: boss ? 'web bosstest=0 direct arena entry' : fullrun ? 'natural input fullrun attempt' : 'new field', url, rows, errors }, null, 2));
    await browser.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
