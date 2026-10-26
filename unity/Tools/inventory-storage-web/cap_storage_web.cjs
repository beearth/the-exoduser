// PC-A10: web inventory "보관함" sub tab (#invStorageCol) capture + DOM dump. Server: cwd G:/exoduser, PORT=3408 EXODUSER_SAVE_DIR=<out>/save.
// usage: NODE_PATH=G:/exoduser/node_modules node cap_storage_web.cjs <out-dir> [phase]   phase: states (default) | static | sprites
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = process.argv[2];
const BASE = 'http://127.0.0.1:3408';
const wait = ms => new Promise(r => setTimeout(r, ms));
const DUMP = `(()=>{const out=[];const root=document.getElementById('invPanel');
  const pseudo=(el,p)=>{const cs=getComputedStyle(el,p);if(cs.content==='none'||cs.content==='normal')return null;return {content:cs.content.slice(0,80),bg:cs.backgroundImage.slice(0,300),bgc:cs.backgroundColor,w:cs.width,h:cs.height,l:cs.left,t:cs.top,r:cs.right,b:cs.bottom,op:cs.opacity,bd:cs.borderTop,br:cs.borderRadius,sh:cs.boxShadow.slice(0,300),tf:cs.transform,col:cs.color,fs:cs.fontSize,pos:cs.position}};
  const walk=(n,d)=>{for(const c of n.children){const cs=getComputedStyle(c);const r=c.getBoundingClientRect();
    const vis=cs.display!=='none'&&cs.visibility!=='hidden'&&r.width>0&&r.height>0&&+cs.opacity>0;
    if(vis){const own=[...c.childNodes].filter(t=>t.nodeType===3).map(t=>t.textContent.trim()).join(' ').trim();
      out.push({d,sel:c.tagName.toLowerCase()+(c.id?'#'+c.id:'')+(typeof c.className==='string'&&c.className.trim()?'.'+c.className.trim().split(/\s+/).join('.'):''),
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
  await page.goto(BASE + '/game.html?test=1&slot=a10&demo=1', { waitUntil: 'domcontentloaded', timeout: 90000 });
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
  await ev(`document.getElementById('inventory-tab-storage').click()`); await wait(1500);
  const phase = process.argv[3] || 'states';
  const shot = async name => { await page.screenshot({ path: path.join(OUT, name + '.png') }); };
  const dump = async name => { fs.writeFileSync(path.join(OUT, name + '.json'), JSON.stringify(await ev(DUMP))); };
  if (phase === 'states') {
    await shot('web_st_empty'); await dump('web_st_empty_layout');
    const sc = await ev(`[...document.querySelectorAll('#invPanel *')].filter(e=>{const c=getComputedStyle(e);return (c.overflowY==='auto'||c.overflowY==='scroll')&&e.scrollHeight>e.clientHeight}).map(e=>({id:e.id,cls:e.className,sh:e.scrollHeight,ch:e.clientHeight}))`);
    console.log('scrollables', JSON.stringify(sc));
    await ev(`[...document.querySelectorAll('#invPanel *')].filter(e=>{const c=getComputedStyle(e);return (c.overflowY==='auto'||c.overflowY==='scroll')&&e.scrollHeight>e.clientHeight}).forEach(e=>e.scrollTop=e.scrollHeight)`); await wait(500);
    await shot('web_st_scrolled'); await dump('web_st_scrolled_layout');
    await ev(`[...document.querySelectorAll('#invPanel *')].forEach(e=>{if(e.scrollTop)e.scrollTop=0})`);
  }
  if (phase === 'glyphs') {
    // deposit-list slot icons (_slotGlyph, white, no shadow) as transparent PNGs, one per equipment slot
    const gl = await ev(`(()=>{const o={};SLOT_NAMES.forEach((n,i)=>{o[n]=_slotGlyph(i,'#ffffff',112)});return o})()`);
    await page.setContent('<html><body style="margin:0;background:transparent"></body></html>');
    for (const [k, svgText] of Object.entries(gl)) {
      const clean = String(svgText).replace(/filter:drop-shadow\([^)]*\)/, 'filter:none').replace(/width="\d+" height="\d+"/, 'width="112" height="112"');
      await page.evaluate(h => { document.body.innerHTML = '<div id="g" style="width:112px;height:112px;line-height:0">' + h + '</div>'; }, clean);
      await (await page.$('#g')).screenshot({ path: path.join(OUT, `slot_${k}.png`), omitBackground: true });
    }
    console.log('glyphs', Object.keys(gl).join(','));
  }
  console.log(JSON.stringify({ phase, errs }));
  await ctx.close();
})();
