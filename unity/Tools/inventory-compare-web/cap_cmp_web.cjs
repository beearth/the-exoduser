// PC-A10: web inventory "보관함" sub tab (#invStorageCol) capture + DOM dump. Server: cwd G:/exoduser, PORT=3410 EXODUSER_SAVE_DIR=<out>/save.
// usage: NODE_PATH=G:/exoduser/node_modules node cap_compare_web.cjs <out-dir> [phase]   phase: states (default) | static | sprites
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = process.argv[2];
const BASE = 'http://127.0.0.1:3410';
const wait = ms => new Promise(r => setTimeout(r, ms));
const DUMP = `(()=>{const out=[];const root=document.getElementById('invRight');
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
  await page.goto(BASE + '/game.html?test=1&slot=a25&demo=1', { waitUntil: 'domcontentloaded', timeout: 90000 });
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
  const info = await ev(`({bag:INV.bag.map((it,i)=>({i,slot:it.slot,name:it.name,r:it.rarity,wt:it.wtype||null,bt:it.btype||null,aff:(it.affixes||[]).length})),eq:Object.fromEntries(Object.entries(INV.equipped).filter(([k,v])=>v).map(([k,v])=>[k,v.name]))})`);
  fs.writeFileSync(path.join(OUT, 'web_cmp_state.json'), JSON.stringify(info, null, 1));
  const shot = async name => { await page.screenshot({ path: path.join(OUT, name + '.png') }); };
  const dump = async name => { fs.writeFileSync(path.join(OUT, name + '.json'), JSON.stringify(await ev(DUMP))); };
  const centerOf = async sel => ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const b=e.getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2}})()`);
  const hoverBag = async (i, name) => {
    const r = await ev(`(()=>{const e=document.querySelectorAll('#invGrid .inv-item')[${i}];if(!e)return null;const b=e.getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2}})()`);
    if (!r || !r.x) { console.log('no bag item', i); return null; }
    await page.mouse.move(r.x + 40, r.y + 40); await wait(150); await page.mouse.move(r.x, r.y); await wait(700);
    await shot(name); await dump(name + '_layout'); return r;
  };
  const wIdx = info.bag.find(b => b.slot === 'weapon'), aIdx = info.bag.find(b => b.slot === 'armor' || b.slot === 'helmet' || b.slot === 'boots' || b.slot === 'gloves' || b.slot === 'pants');
  console.log('weapon', JSON.stringify(wIdx), 'armor', JSON.stringify(aIdx));
  if (wIdx) await hoverBag(wIdx.i, 'web_cmp_1_bag_weapon');
  // 2: equipment slot hover (weapon slot)
  const es = await centerOf('.inv-eq-slot[data-slot="weapon"],.inv-eq-slot');
  if (es) { await page.mouse.move(es.x - 40, es.y); await wait(150); await page.mouse.move(es.x, es.y); await wait(700); await shot('web_cmp_2_equip'); await dump('web_cmp_2_equip_layout'); }
  if (aIdx) await hoverBag(aIdx.i, 'web_cmp_3_bag_armor');
  // 4: select by click, then leave
  if (wIdx) {
    const r = await hoverBag(wIdx.i, 'web_cmp_tmp');
    if (r) { await page.mouse.click(r.x, r.y); await wait(500); await page.mouse.move(1000, 1030); await wait(700); await shot('web_cmp_4_selected'); await dump('web_cmp_4_selected_layout'); }
  }
  // 5: hover + wheel to end
  if (wIdx) {
    const r = await hoverBag(wIdx.i, 'web_cmp_tmp5');
    if (r) { await page.mouse.wheel(0, 3000); await wait(500); await shot('web_cmp_5_wheel_end'); await dump('web_cmp_5_wheel_end_layout');
      const st = await ev(`(()=>{const rp=document.getElementById('invRight');return {panel:rp.scrollTop,cards:[...rp.querySelectorAll('.inv-compare-card')].map(n=>[n.scrollTop,n.scrollHeight,n.clientHeight]),cls:rp.className}})()`);
      console.log('scroll', JSON.stringify(st)); }
  }
  console.log(JSON.stringify({ errs }));
  await ctx.close();
})();
