// PC-U05REF: 최신 웹 스킬 창 캡처 (headless + 음소거, 1920x1080, 격리 프로필·격리 save dir)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = process.argv[2];
const BASE = 'http://127.0.0.1:3401';
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const ctx = await chromium.launchPersistentContext(path.join(OUT, 'profile'), {
    channel: 'chrome', headless: true, viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1,
    args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--window-size=1920,1080'],
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message.slice(0, 200)));
  const ev = s => page.evaluate(s).catch(e => ({ err: String(e).slice(0, 200) }));
  await page.goto(BASE + '/game.html?test=1&slot=demo&demo=1', { waitUntil: 'load' });
  let st = null;
  for (let i = 0; i < 120; i++) {
    st = await ev(`({on:typeof G!=='undefined'&&G.on===true,cut:typeof _cutsceneState!=='undefined'?_cutsceneState:null,intro:typeof G!=='undefined'?G._intro:null})`);
    if (st && st.on && !st.intro) break;
    if (st && st.cut === 'INTRO_CUTSCENE') await ev(`_cutsceneEnd()`);
    else if (st && st.intro) await page.keyboard.press('Escape');
    await wait(500);
  }
  await wait(1500);
  await ev(`(()=>{try{if(window._parryLesson&&_parryLesson.skipAll)_parryLesson.skipAll()}catch(e){};try{if(window._systemLesson&&_systemLesson.skipAll)_systemLesson.skipAll()}catch(e){};G.paused=false})()`);
  await wait(800);
  await ev(`closeAllPanels()`); await wait(500);
  await page.screenshot({ path: path.join(OUT, 'field.png') });
  await page.keyboard.press('KeyK'); await wait(1200);
  const kOpen = await ev(`$('skillPanel').classList.contains('on')`);
  if (kOpen !== true) await ev(`togglePanel('skillPanel')`);
  await wait(2000);
  await page.screenshot({ path: path.join(OUT, 'skill_web_latest.png') });
  const info = await ev(`({lv:P.lv,mhp:P.mhp,mmp:P.mmp,mst:P.mst,skillOn:$('skillPanel').classList.contains('on')})`);
  fs.writeFileSync(path.join(OUT, 'capture.json'), JSON.stringify({ state: st, info, kOpen, pageerrors: errs }, null, 1));
  console.log(JSON.stringify({ state: st, info, kOpen, pageerrors: errs.length }));
  await ctx.close();
})();
