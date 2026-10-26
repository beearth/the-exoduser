// PC-A13: 웹 능력치 창 정의(노드·길·효과 공식 문구·트리 구조)와 정적 바탕·글리프 PNG 추출.
// 상태 값(투자 레벨, SP/AP, 습득 여부)은 추출하지 않는다 — Unity 상태 미러(투자 없음)에서만 캡처한다.
// 서버 3409 (cwd G:/exoduser, PORT=3405 EXODUSER_SAVE_DIR=...). 사용: node cap_stat_assets.cjs <out-dir>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = process.argv[2];
const BASE = 'http://127.0.0.1:3409';
const wait = ms => new Promise(r => setTimeout(r, ms));

// 정적 바탕에서 숨길 동적 요소 (상자·테두리는 남기고 글자만 숨기는 항목은 color:transparent)
const HIDE_CSS = `
#statPanel .panel-nav,#statPanel #apRemain,#statPanel #growthCount,#statPanel .growth-paths>*,#statPanel .growth-path-hint,#statPanel .growth-filters>*,
#statPanel .growth-tree-scene,#statPanel #growthDetail,#statPanel #growthUpgradeNote,#statPanel .growth-plan-notice,#statPanel #growthRefund,#statPanel .growth-footer-note,
#statPanel .growth-draft-list,#statPanel .growth-node-preview{visibility:hidden!important}
#statPanel .growth-zoom-button,#statPanel #growthUpgrade,#statPanel #growthCancel,#statPanel #growthApply,#statPanel #statResetBtn,#statPanel #statClose,#statPanel #smToggleBtn,#statPanel #growthSearch::placeholder{color:transparent!important;text-shadow:none!important}
#statPanel #growthSearch{color:transparent!important}
#statPanel .growth-section-heading h2{color:transparent!important;text-shadow:none!important}`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const ctx = await chromium.launchPersistentContext(path.join(OUT, 'profile-assets'), {
    channel: 'chrome', headless: true, viewport: { width: 1920, height: 1080 }, deviceScaleFactor: Number(process.env.DSF || 1),
    ignoreDefaultArgs: ['--hide-scrollbars'], args: ['--mute-audio', '--window-size=1920,1080'],
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  const ev = s => page.evaluate(s).catch(e => ({ err: String(e).slice(0, 300) }));
  await page.goto(BASE + '/game.html?test=1&slot=demo&demo=1', { waitUntil: 'domcontentloaded', timeout: 90000 });
  for (let i = 0; i < 120; i++) {
    const st = await ev(`({on:typeof G!=='undefined'&&G.on===true,cut:typeof _cutsceneState!=='undefined'?_cutsceneState:null,intro:typeof G!=='undefined'?G._intro:null})`);
    if (st && st.on && !st.intro) break;
    if (st && st.cut === 'INTRO_CUTSCENE') await ev(`_cutsceneEnd()`); else if (st && st.intro) await page.keyboard.press('Escape');
    await wait(500);
  }
  await wait(1500);
  await ev(`(()=>{try{if(window._parryLesson&&_parryLesson.skipAll)_parryLesson.skipAll()}catch(e){};try{if(window._systemLesson&&_systemLesson.skipAll)_systemLesson.skipAll()}catch(e){};G.paused=false})()`);
  await wait(800); await ev(`closeAllPanels()`); await wait(500);
  // Unity 상태 미러: 투자 없음, SP/AP 0, 레벨 1
  await ev(`(()=>{for(const k of Object.keys(STATS))STATS[k]=0;for(const k of Object.keys(PASSIVES))PASSIVES[k]=0;_grit=0;P.sp=0;P.ap=0;P.lv=1;P._passiveQueue=[];return 1})()`);
  await ev(`openPanel('statPanel')`); await wait(2500);

  // hover previews (growth-node-preview): node, rank star, attribute node
  const dumpPrev = `(()=>{const p=document.getElementById('growthNodePreview');if(!p||p.hidden)return null;const rec=(e,d)=>{const cs=getComputedStyle(e),r=e.getBoundingClientRect();return {d,sel:e.tagName.toLowerCase()+(e.className&&e.className.trim?'.'+e.className.trim().split(/\s+/).join('.'):''),x:+r.x.toFixed(1),y:+r.y.toFixed(1),w:+r.width.toFixed(1),h:+r.height.toFixed(1),txt:[...e.childNodes].filter(t=>t.nodeType===3).map(t=>t.textContent.trim()).join(' '),fs:cs.fontSize,fw:cs.fontWeight,ff:cs.fontFamily.split(',')[0],col:cs.color,ls:cs.letterSpacing,lh:cs.lineHeight,ta:cs.textAlign,bgc:cs.backgroundColor,bg:cs.backgroundImage!=='none'?cs.backgroundImage.slice(0,300):'',bd:cs.borderTopWidth+' '+cs.borderTopStyle+' '+cs.borderTopColor,bdb:cs.borderBottomWidth+' '+cs.borderBottomColor,br:cs.borderRadius,sh:cs.boxShadow.slice(0,200),pad:cs.padding,gap:cs.gap}};const out=[rec(p,0)];const walk=(n,d)=>{for(const c of n.children){out.push(rec(c,d));walk(c,d+1)}};walk(p,1);return out})()`;
  const hover = async (name, sel) => {
    const r = await ev(`(()=>{const e=document.querySelector(${JSON.stringify(sel)});if(!e)return null;const b=e.getBoundingClientRect();return {x:b.x+b.width/2,y:b.y+b.height/2}})()`);
    if (!r || !r.x) { console.log('no target', sel); return; }
    await page.mouse.move(r.x - 30, r.y - 30); await wait(200); await page.mouse.move(r.x, r.y); await wait(700);
    await page.screenshot({ path: path.join(OUT, name + '.png') });
    fs.writeFileSync(path.join(OUT, name + '.json'), JSON.stringify(await ev(dumpPrev)));
    await page.mouse.move(5, 5); await wait(300);
  };
  await hover('web_stat_hover_node', '[data-body-node="pDot"]');
  await hover('web_stat_hover_star', '[data-body-node="pDot@3"]');
  await hover('web_stat_hover_stat', '[data-body-node="str"]');
  await hover('web_stat_hover_node_edge', '[data-body-node="pMalice"]');
  console.log(JSON.stringify({ errs }));
  await ctx.close();
})();
