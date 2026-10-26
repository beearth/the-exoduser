// PC-U05(A12): 웹 정보판 설명문의 실제 줄바꿈(Chrome)을 스킬별로 읽어 web_desc_lines.json 으로 저장한다.
// 사용: node cap_desc_lines.cjs <out-dir> <defs-raw.json>   (서버 3404, cap_defs.cjs 와 같은 방식)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const OUT = process.argv[2]; const raw = JSON.parse(fs.readFileSync(process.argv[3], 'utf8')); const BASE = 'http://127.0.0.1:3404';
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const ctx = await chromium.launchPersistentContext(path.join(OUT, 'profile-lines'), { channel: 'chrome', headless: true, viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, ignoreDefaultArgs: ['--hide-scrollbars'], args: ['--mute-audio', '--window-size=1920,1080'] });
  const page = ctx.pages()[0] || await ctx.newPage(); const ev = s => page.evaluate(s).catch(e => ({ err: String(e).slice(0, 300) }));
  await page.goto(BASE + '/game.html?test=1&slot=demo&demo=1', { waitUntil: 'load' });
  for (let i = 0; i < 120; i++) { const st = await ev(`({on:typeof G!=='undefined'&&G.on===true,cut:typeof _cutsceneState!=='undefined'?_cutsceneState:null,intro:typeof G!=='undefined'?G._intro:null})`);
    if (st && st.on && !st.intro) break; if (st && st.cut === 'INTRO_CUTSCENE') await ev(`_cutsceneEnd()`); else if (st && st.intro) await page.keyboard.press('Escape'); await wait(500); }
  await wait(1500); await ev(`G.paused=false`); await ev(`closeAllPanels()`); await wait(500); await ev(`openPanel('skillPanel')`); await wait(2500);
  const out = {};
  for (const id of raw.ids) {
    await ev(`(()=>{SkillForge._state.sel=${JSON.stringify(id)};SkillForge.render()})()`); await wait(250);
    out[id] = await ev(`(()=>{const p=document.querySelector('#skillPanel .sf-info-desc');if(!p||!p.firstChild)return null;const tn=p.firstChild;const lines=[];let cur='',last=null;
      for(let i=0;i<tn.length;i++){const r=document.createRange();r.setStart(tn,i);r.setEnd(tn,i+1);const rc=r.getClientRects()[0];if(!rc){cur+=tn.data[i];continue}const top=Math.round(rc.top);if(last!==null&&top!==last){lines.push(cur.trim());cur=''}last=top;cur+=tn.data[i]}
      lines.push(cur.trim());return {text:tn.data,lines}})()`);
  }
  fs.writeFileSync(path.join(OUT, 'web_desc_lines.json'), JSON.stringify(out, null, 1)); console.log('lines', Object.keys(out).length);
  await ctx.close();
})();
