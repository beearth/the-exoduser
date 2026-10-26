// PC-A11: web inventory "유물" sub tab (#invCrystalsPanel) capture + DOM dump. Server: cwd G:/exoduser, PORT=3407 EXODUSER_SAVE_DIR=<out>/save.
// usage: NODE_PATH=G:/exoduser/node_modules node cap_crystals_web.cjs <out-dir> [phase]   phase: states (default) | sprites
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = process.argv[2];
const BASE = 'http://127.0.0.1:3407';
const wait = ms => new Promise(r => setTimeout(r, ms));

const DUMP = `(()=>{const out=[];const root=document.getElementById('invPanel');
  const pseudo=(el,p)=>{const cs=getComputedStyle(el,p);if(cs.content==='none'||cs.content==='normal')return null;return {content:cs.content.slice(0,80),bg:cs.backgroundImage.slice(0,300),bgc:cs.backgroundColor,w:cs.width,h:cs.height,l:cs.left,t:cs.top,r:cs.right,b:cs.bottom,op:cs.opacity,bd:cs.borderTop,br:cs.borderRadius,sh:cs.boxShadow.slice(0,300),tf:cs.transform,col:cs.color,fs:cs.fontSize,pos:cs.position}};
  const walk=(n,d)=>{for(const c of n.children){const cs=getComputedStyle(c);const r=c.getBoundingClientRect();
    const vis=cs.display!=='none'&&cs.visibility!=='hidden'&&r.width>0&&r.height>0&&+cs.opacity>0;
    if(vis){const own=[...c.childNodes].filter(t=>t.nodeType===3).map(t=>t.textContent.trim()).join(' ').trim();
      out.push({d,sel:c.tagName.toLowerCase()+(c.id?'#'+c.id:'')+(typeof c.className==='string'&&c.className.trim()?'.'+c.className.trim().split(/\\s+/).join('.'):''),
        x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1),txt:own.slice(0,200),
        fs:cs.fontSize,fw:cs.fontWeight,ff:cs.fontFamily.split(',')[0],col:cs.color,ls:cs.letterSpacing,lh:cs.lineHeight,ta:cs.textAlign,ts:cs.textShadow!=='none'?cs.textShadow.slice(0,120):'',
        bg:cs.backgroundImage!=='none'?cs.backgroundImage.slice(0,400):'',bgc:cs.backgroundColor!=='rgba(0, 0, 0, 0)'?cs.backgroundColor:'',bgs:cs.backgroundSize,bgp:cs.backgroundPosition,
        bd:cs.borderTopWidth!=='0px'?cs.borderTopWidth+' '+cs.borderTopStyle+' '+cs.borderTopColor:'',bdb:cs.borderBottomWidth!=='0px'?cs.borderBottomWidth+' '+cs.borderBottomStyle+' '+cs.borderBottomColor:'',
        br:cs.borderRadius!=='0px'?cs.borderRadius:'',sh:cs.boxShadow!=='none'?cs.boxShadow.slice(0,300):'',op:cs.opacity!=='1'?cs.opacity:'',tf:cs.transform!=='none'?cs.transform:'',filter:cs.filter!=='none'?cs.filter:'',
        ov:cs.overflowY!=='visible'?cs.overflowY+' sh='+c.scrollHeight+' ch='+c.clientHeight:'',pad:cs.padding,
        src:c.tagName==='IMG'?c.getAttribute('src'):'',before:pseudo(c,'::before'),after:pseudo(c,'::after')});}
    if(cs.display!=='none')walk(c,d+1);}};
  walk(root,0);return out})()`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const dsf = Number(process.env.DSF || 1);
  const ctx = await chromium.launchPersistentContext(path.join(OUT, 'profile' + dsf), {
    channel: 'chrome', headless: true, viewport: { width: 1920, height: 1080 }, deviceScaleFactor: dsf,
    ignoreDefaultArgs: ['--hide-scrollbars'], args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--window-size=1920,1080'],
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message.slice(0, 200)));
  const ev = s => page.evaluate(s).catch(e => ({ err: String(e).slice(0, 300) }));
  await page.goto(BASE + '/game.html?test=1&slot=a11&demo=1', { waitUntil: 'domcontentloaded', timeout: 90000 });
  for (let i = 0; i < 120; i++) {
    const st = await ev(`({on:typeof G!=='undefined'&&G.on===true,cut:typeof _cutsceneState!=='undefined'?_cutsceneState:null,intro:typeof G!=='undefined'?G._intro:null})`);
    if (st && st.on && !st.intro) break;
    if (st && st.cut === 'INTRO_CUTSCENE') await ev(`_cutsceneEnd()`); else if (st && st.intro) await page.keyboard.press('Escape');
    await wait(500);
  }
  await wait(1500);
  await ev(`(()=>{try{if(window._parryLesson&&_parryLesson.skipAll)_parryLesson.skipAll()}catch(e){};try{if(window._systemLesson&&_systemLesson.skipAll)_systemLesson.skipAll()}catch(e){};G.paused=false})()`);
  await wait(800); await ev(`closeAllPanels()`); await wait(500);
  await ev(`togglePanel('invPanel')`); await wait(1500);
  await ev(`document.getElementById('inventory-tab-crystals').click()`); await wait(1500);
  const phase = process.argv[3] || 'states';
  const shot = async name => { await page.screenshot({ path: path.join(OUT, name + '.png') }); };
  const dump = async name => { fs.writeFileSync(path.join(OUT, name + '.json'), JSON.stringify(await ev(DUMP))); };
  if (phase === 'states') {
    await shot('web_cr_empty'); await dump('web_cr_empty_layout');
    // equipment list scroll end
    const sc = await ev(`(()=>{const l=document.querySelector('.inv-cr-equipment-list,.inv-cr-equipment');const all=[...document.querySelectorAll('#invCrystalsPanel *')].filter(e=>{const c=getComputedStyle(e);return (c.overflowY==='auto'||c.overflowY==='scroll')&&e.scrollHeight>e.clientHeight});return all.map(e=>({cls:e.className,sh:e.scrollHeight,ch:e.clientHeight}))})()`);
    console.log('scrollables', JSON.stringify(sc));
    await ev(`(()=>{const all=[...document.querySelectorAll('#invCrystalsPanel *')].filter(e=>{const c=getComputedStyle(e);return (c.overflowY==='auto'||c.overflowY==='scroll')&&e.scrollHeight>e.clientHeight});all.forEach(e=>e.scrollTop=e.scrollHeight)})()`); await wait(500);
    await shot('web_cr_scrolled'); await dump('web_cr_scrolled_layout');
    await ev(`(()=>{const all=[...document.querySelectorAll('#invCrystalsPanel *')].filter(e=>{const c=getComputedStyle(e);return (c.overflowY==='auto'||c.overflowY==='scroll')&&e.scrollHeight>e.clientHeight});all.forEach(e=>e.scrollTop=0)})()`);
    // filter state
    await ev(`document.querySelector('.inv-cr-filter[data-filter="atk"]').click()`); await wait(400); await shot('web_cr_filter_atk'); await dump('web_cr_filter_atk_layout');
    await ev(`document.querySelector('.inv-cr-filter[data-filter="all"]').click()`); await wait(300);
    // populated (layout reference only): same injection as the web-refs set
    await ev(`(()=>{const ids=CRYSTAL_IDS.slice(0,14);ids.forEach((id,i)=>CRYSTAL_BAG.push({id,star:i%5,enh:0,q:20+i*6}));for(let t=1;t<=6;t++)STONE_BAG.push({q:(10-t)*10+5});renderInvCrystals()})()`); await wait(800);
    await shot('web_cr_pop'); await dump('web_cr_pop_layout');
    await ev(`document.querySelector('.inv-cr-slot').click()`); await wait(600); await shot('web_cr_pop_sel'); await dump('web_cr_pop_sel_layout');
    await ev(`(()=>{CRYSTAL_BAG.length=0;STONE_BAG.length=0;_invCrSelected=null;_invStoneSelQ=null;renderInvCrystals()})()`); await wait(500);
  }
  if (phase === 'static') {
    // Window still of #invCrystalsPanel with every state-dependent text/control hidden (drawn by Unity from state).
    await page.addStyleTag({ content: `
#invPanel .inv-cr-capacity,#invPanel .inv-cr-stones-count,#invPanel .inv-cr-socket-summary,#invPanel .inv-cr-dust{color:transparent!important;text-shadow:none!important}
#invPanel .inv-cr-filters,#invPanel .inv-cr-empty,#invPanel .inv-cr-stones .inv-cr-note,#invPanel .inv-cr-equipment-list{visibility:hidden!important}` });
    await wait(500);
    await page.screenshot({ path: path.join(OUT, 'web_cr_static.png'), clip: { x: 42, y: 182, width: 1836, height: 858 } });
  }
  if (phase === 'cards') {
    // Equipment card frames (with item / empty) and the knight portrait on transparent pages (DSF 3).
    const cardCss = `
html,body{background:transparent!important}
body>*:not(#invPanel){visibility:hidden!important}
#invPanel,#invPanel *{visibility:hidden!important}`;
    await page.addStyleTag({ content: cardCss });
    for (const [name, sel] of [['item', 'article.inv-cr-equipment-card[data-slot="weapon"]'], ['empty', 'article.inv-cr-equipment-card[data-empty="true"]']]) {
      await ev(`document.querySelector('${sel}').scrollIntoView({block:'center'})`); await wait(300);
      const css = `#invPanel ${sel},#invPanel ${sel} *{visibility:visible!important}
#invPanel ${sel} .inv-cr-equipment-name,#invPanel ${sel} .inv-cr-equipment-item,#invPanel ${sel} .inv-cr-equipment-icon>*,#invPanel ${sel} .inv-cr-equipment-icon>* *{visibility:hidden!important}`;
      await page.addStyleTag({ content: css }); await wait(300);
      const r = await ev(`(()=>{const b=document.querySelector('${sel}').getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height}})()`);
      const m = 14;
      await page.screenshot({ path: path.join(OUT, `web_cr_card_${name}.png`), clip: { x: r.x - m, y: r.y - m, width: r.w + 2 * m, height: r.h + 2 * m + 4 }, omitBackground: true });
      console.log(name, JSON.stringify(r));
      await ev(`(()=>{const s=document.querySelectorAll('style');s[s.length-1].remove()})()`);
    }
    // portrait: un-clip the list so the whole 504x834 box is on screen, enlarge the viewport
    await page.setViewportSize({ width: 1920, height: 1500 }); await wait(500);
    await page.addStyleTag({ content: `#invPanel .inv-wrap,#invPanel #invCrystalsPanel,#invPanel .inv-cr-body,#invPanel .inv-cr-equipment,#invPanel .inv-cr-equipment-list{overflow:visible!important;height:auto!important;max-height:none!important}
#invPanel .inv-cr-portrait,#invPanel .inv-cr-portrait *{visibility:visible!important}` });
    await wait(600);
    const p = await ev(`(()=>{const b=document.querySelector('.inv-cr-portrait').getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height}})()`);
    console.log('portrait', JSON.stringify(p));
    await page.screenshot({ path: path.join(OUT, 'web_cr_portrait.png'), clip: { x: p.x, y: p.y, width: p.w, height: p.h }, omitBackground: true });
  }
  console.log(JSON.stringify({ phase, errs }));
  await ctx.close();
})();
