// PC-A13: 웹 능력치 창 정의(노드·길·효과 공식 문구·트리 구조)와 정적 바탕·글리프 PNG 추출.
// 상태 값(투자 레벨, SP/AP, 습득 여부)은 추출하지 않는다 — Unity 상태 미러(투자 없음)에서만 캡처한다.
// 서버 3405 (cwd G:/exoduser, PORT=3405 EXODUSER_SAVE_DIR=...). 사용: node cap_stat_assets.cjs <out-dir>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = process.argv[2];
const BASE = 'http://127.0.0.1:3405';
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

  if (process.argv[3] === 'engrave') {
    // 몸 판화(윤곽·장식 원/눈금·해부 선)만 투명 배경으로 렌더. 장면 좌표 1000x800 → scale 0.765 → DSF 로 배율 확보
    await page.addStyleTag({ content: `
html,body{background:transparent!important}
body>*:not(#statPanel){visibility:hidden!important}
#statPanel,#statPanel *{background:none!important;box-shadow:none!important;border-color:transparent!important;visibility:hidden!important}
#statPanel::before,#statPanel::after,#statPanel *::before,#statPanel *::after{display:none!important}
#statPanel #growthTreeViewport,#statPanel #growthTreeScene,#statPanel .growth-body-engraving,#statPanel .growth-body-engraving *{visibility:visible!important}
#statPanel .growth-tree-links,#statPanel .growth-tree-anchors{display:none!important}` });
    await wait(500);
    const r = await ev(`(()=>{const b=document.querySelector('#growthTreeScene .growth-body-engraving').getBoundingClientRect();return {x:b.x,y:b.y,w:b.width,h:b.height}})()`);
    await page.screenshot({ path: path.join(OUT, 'web_stat_engraving.png'), clip: { x: r.x, y: r.y, width: r.w, height: r.h }, omitBackground: true });
    console.log(JSON.stringify(r)); await ctx.close(); return;
  }

  if (process.argv[3] === 'sprites') {
    // 노드 틀(원/큰 원/능력치 사각)·선택 상태를 투명 배경 PNG로 굽는다(DSF 3). 글리프 아이콘·라벨·배지는 숨기고 Unity가 따로 그린다.
    await page.addStyleTag({ content: `
html,body{background:transparent!important}
body>*:not(#statPanel){visibility:hidden!important}
#statPanel,#statPanel *{visibility:hidden!important}
#statPanel .growth-body-node .growth-glyph svg,#statPanel .growth-card-rank,#statPanel .growth-stat-value,#statPanel .growth-card-name{display:none!important}
#statPanel .growth-stat-select::after{content:none!important}` });
    const cases = [['passive', 'pDot'], ['major', 'pMelee'], ['stat', 'str']];
    for (const state of ['base', 'selected']) {
      for (const [kind, key] of cases) {
        const other = state === 'base' ? 'pCharge' : key;
        await ev(`document.querySelector('[data-body-node="${other}"]').click()`); await wait(400);
        const sel = kind === 'stat' ? `[data-stat="${key}"]` : `[data-passive="${key}"]`;
        await page.addStyleTag({ content: `#statPanel ${sel},#statPanel ${sel} *{visibility:visible!important}#statPanel ${sel} svg{display:none!important}#statPanel ${sel}{background:none!important;box-shadow:none!important}#statPanel ${sel}::before,#statPanel ${sel}::after{display:none!important}` });
        await wait(300);
        const r = await ev(`(()=>{const b=document.querySelector('${sel}').getBoundingClientRect();return {cx:b.x+b.width/2,cy:b.y+b.height/2,w:b.width}})()`);
        await page.screenshot({ path: path.join(OUT, `node_${kind}_${state}.png`), clip: { x: r.cx - 70, y: r.cy - 70, width: 140, height: 140 }, omitBackground: true });
        console.log(kind, state, JSON.stringify(r));
        // 다음 케이스에서 이 노드가 보이지 않도록 되돌리는 대신 마지막 style 태그를 제거
        await ev(`(()=>{const s=document.querySelectorAll('style');s[s.length-1].remove()})()`);
      }
    }
    // 글리프: 흰색 선 아이콘(그림자 제거)을 투명 PNG로
    const gl = JSON.parse(fs.readFileSync(path.join(OUT, 'web_stat_glyphs.json'), 'utf8'));
    await page.setContent('<html><body style="margin:0;background:transparent"></body></html>');
    for (const [k, svgText] of Object.entries(gl)) {
      const clean = svgText.replace(/filter:drop-shadow\([^)]*\)/, 'filter:none').replace(/width="\d+" height="\d+"/, 'width="128" height="128"');
      await page.evaluate(h => { document.body.innerHTML = '<div id="g" style="width:128px;height:128px;line-height:0">' + h + '</div>'; }, clean);
      await (await page.$('#g')).screenshot({ path: path.join(OUT, `glyph_${k}.png`), omitBackground: true });
    }
    console.log('glyphs', Object.keys(gl).length); await ctx.close(); return;
  }

  // ---- 정의 ----
  const defs = await ev(`(()=>{
    const U=ExoduserStatsPanel;
    const passive=PASSIVE_DEF.map(d=>({key:d.key,max:d.max,name:d.name,nameEn:d.nameEn,desc:d.desc,descEn:d.descEn,effects:U.passiveEffects(d.key,0).map(r=>({ko:r.ko,en:r.en,per:r.per,unit:r.unit,base:r.base,cap:r.cap===Infinity?null:r.cap}))}));
    const stats=[...STAT_DEF.map(d=>({key:d.key,name:d.name,nameEn:d.nameEn,desc:d.desc,descEn:d.descEn,cap:STAT_MAX[d.key]})),{key:'grit',name:'근성 (GRIT)',nameEn:'GRIT',desc:'HP / MP / ST 각각 +1 · 물리/속성 방어 +0.5',descEn:'HP / MP / ST +1 each · DEF / eDEF +0.5',cap:null}]
      .map(d=>({...d,effects:U.statEffects(d.key,0).map(r=>({ko:r.ko,en:r.en,per:r.per,unit:r.unit}))}));
    const paths=U.paths.map(p=>({id:p.id,ko:p.ko,en:p.en,icon:p.icon,color:p.color,keys:p.keys,hint:p.hint}));
    const body=U.bodyNodes.map(n=>({key:n.key,x:n.x,y:n.y,parent:n.parent,major:n.major,stat:n.stat}));
    const lay=U.constellationLayout(PASSIVE_DEF);
    return {passive,stats,paths,body,constellation:{nodes:lay.nodes.map(n=>({id:n.id,key:n.key,rank:n.rank,x:+n.x.toFixed(2),y:+n.y.toFixed(2)})),links:lay.links}};
  })()`);
  if (defs.err) { console.log('defs error', defs.err); process.exit(1); }
  // 부모 관절 좌표 (origin, spine, neck, leftShoulder, rightShoulder)
  defs.joints = {origin:{x:500,y:400},spine:{x:500,y:320,parent:'origin'},neck:{x:500,y:160,parent:'spine'},leftShoulder:{x:385,y:245,parent:'spine'},rightShoulder:{x:615,y:245,parent:'spine'}};
  // 노드별 분석판 문구(정의): 이름·분류·설명 노트
  const detail = {};
  const keys = [...defs.passive.map(d => d.key), ...defs.stats.map(d => d.key)];
  for (const k of keys) {
    await ev(`(()=>{const e=document.querySelector('[data-body-node="${k}"]');if(e)e.click()})()`); await wait(250);
    detail[k] = await ev(`(()=>{const q=s=>{const e=document.querySelector('#growthDetail '+s);return e?e.textContent.trim():''};return {label:document.getElementById('growthDetailLabel').textContent.trim(),name:q('.growth-detail-name'),category:q('.growth-detail-category'),note:q('.growth-effect'),tradeoff:q('.growth-tradeoff'),rowsHead:[...document.querySelectorAll('#growthDetail .growth-effect-columns>span')].map(s=>s.textContent.trim()),rows:[...document.querySelectorAll('#growthDetail .growth-effect-row:not(.growth-effect-columns)')].map(r=>r.firstElementChild.textContent.trim()),upgrade:document.getElementById('growthUpgrade').textContent.trim(),refund:document.getElementById('growthRefund').textContent.trim()}})()`);
  }
  fs.writeFileSync(path.join(OUT, 'web_stat_defs_raw.json'), JSON.stringify({ defs, detail }, null, 1));

  // ---- 글리프 SVG ----
  const glyphs = await ev(`(()=>{const out={};const ks=[...PASSIVE_DEF.map(d=>d.key),...STAT_DEF.map(d=>d.key),'grit'];
    for(const k of ks){out[k]=_glyph(k==='grit'?'anvil':STAT_SVG[k]||PASSIVE_SVG[k]||'star','#ffffff',96)}return out})()`);
  fs.writeFileSync(path.join(OUT, 'web_stat_glyphs.json'), JSON.stringify(glyphs, null, 1));

  // ---- 정적 바탕 (기본 선택 해제 후) ----
  await ev(`(()=>{const e=document.querySelector('.growth-path[data-path="all"]');if(e)e.click()})()`); await wait(300);
  await page.addStyleTag({ content: HIDE_CSS }); await wait(500);
  await page.screenshot({ path: path.join(OUT, 'web_stat_static.png') });
  // 뷰포트·위치 기록(zoom 100%)
  const geo = await ev(`(()=>{const r=e=>{const b=e.getBoundingClientRect();return [+b.x.toFixed(1),+b.y.toFixed(1),+b.width.toFixed(1),+b.height.toFixed(1)]};const v=document.getElementById('growthTreeViewport');return {viewport:r(v),scene:r(document.getElementById('growthTreeScene'))}})()`);
  fs.writeFileSync(path.join(OUT, 'web_stat_geo.json'), JSON.stringify(geo));
  console.log(JSON.stringify({ passive: defs.passive.length, stats: defs.stats.length, stars: defs.constellation.nodes.length, glyphs: Object.keys(glyphs).length, geo }));
  await ctx.close();
})();
