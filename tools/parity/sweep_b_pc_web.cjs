// SWEEP-B PC 웹 캡처 (2026-10-22). 헤드리스 Chrome·음소거·1920x1080·격리 프로필.
// 웹 기준 = origin/main 커밋본. 작업 사본에서 origin/main과 다른 웹 파일은 route로 origin/main blob을 돌려준다.
// 실행: NODE_PATH=G:/exoduser/node_modules node sweep_b_pc_web.cjs <part> [--base=http://127.0.0.1:3394]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const REPO = process.env.SWEEPB_WEB_REPO || 'G:/exoduser';
const REF = process.env.SWEEPB_WEB_REF || 'origin/main';
const OUTROOT = process.env.SWEEPB_OUT || 'G:/exoduser-wt/_out/pc-sweep-b';
const part = process.argv[2] || 'lobby';
const BASE = (process.argv.find(a => a.startsWith('--base=')) || '--base=http://127.0.0.1:3394').slice(7);
const OUT = path.join(OUTROOT, 'web', part);
const PROFILE = path.join(OUTROOT, 'pw_profile_' + part + '_' + Date.now());
fs.mkdirSync(OUT, { recursive: true });
const log = [];
const L = (...a) => { const s = a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '); console.log(s); log.push(s); };
const wait = ms => new Promise(r => setTimeout(r, ms));

// origin/main과 다른 웹 파일 목록
const diff = cp.execSync(`git -C ${REPO} -c core.quotepath=off diff --name-only ${REF}`, { encoding: 'utf8' }).split('\n').filter(Boolean)
  .filter(p => !/^(docs|godot|tools|test|output)\//.test(p));
const untracked = new Set();
const blobCache = {};
function blob(p) {
  if (p in blobCache) return blobCache[p];
  try { blobCache[p] = cp.execSync(`git -C ${REPO} show ${REF}:"${p}"`, { maxBuffer: 1 << 28 }); }
  catch (e) { blobCache[p] = null; }
  return blobCache[p];
}
const diffSet = new Set(diff);
L('route_override_files', diff.length, diff.slice(0, 40));
const MIME = { html: 'text/html; charset=utf-8', js: 'application/javascript; charset=utf-8', css: 'text/css; charset=utf-8', json: 'application/json', png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', mp3: 'audio/mpeg', mp4: 'video/mp4', svg: 'image/svg+xml' };


const PROBE = `(sels)=>sels.map(sel=>{const els=[...document.querySelectorAll(sel)];return {sel,n:els.length,items:els.slice(0,sel.endsWith('*')?260:12).map(e=>{const b=e.getBoundingClientRect();const c=getComputedStyle(e);return {r:[+b.x.toFixed(1),+b.y.toFixed(1),+b.width.toFixed(1),+b.height.toFixed(1)],ff:c.fontFamily.slice(0,60),fs:c.fontSize,fw:c.fontWeight,ls:c.letterSpacing,lh:c.lineHeight,col:c.color,bg:c.backgroundColor,bgi:c.backgroundImage.slice(0,120),bd:c.border,bdc:c.borderColor,bds:c.borderStyle,br:c.borderRadius,op:c.opacity,fi:c.filter,ts:c.textShadow.slice(0,80),bs:c.boxShadow.slice(0,100),tr:c.transform,disp:c.display,vis:c.visibility,ta:c.textAlign,pad:c.padding,txt:(e.innerText||e.value||'').slice(0,80)}})}})`;
const probe = async (page, name, sels) => { const r = await page.evaluate(`(${PROBE})(${JSON.stringify(sels)})`).catch(e => ({ err: String(e) })); fs.writeFileSync(path.join(OUT, name + '.probe.json'), JSON.stringify(r, null, 1)); return r; };

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    channel: 'chrome', headless: true,
    viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1,
    args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--window-size=1920,1080'],
  });
  await ctx.route('**/*', async (route) => {
    const u = new URL(route.request().url());
    if (!u.href.startsWith(BASE)) return route.continue();
    let p = decodeURIComponent(u.pathname.replace(/^\//, '')) || 'index.html';
    if (diffSet.has(p)) {
      const b = blob(p);
      if (b === null) return route.fulfill({ status: 404, body: 'not in ' + REF });
      const ext = p.split('.').pop().toLowerCase();
      return route.fulfill({ status: 200, body: b, headers: { 'content-type': MIME[ext] || 'application/octet-stream', 'cache-control': 'no-store' } });
    }
    return route.continue();
  });
  // window.open(위시리스트)·외부 이동 차단
  await ctx.addInitScript(() => { window.open = (u) => { window.__opened = (window.__opened || []).concat([String(u)]); return null; }; });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on('pageerror', e => L('[pageerror]', e.message.slice(0, 200)));
  const shot = async (name) => { const f = path.join(OUT, name + '.png'); await page.screenshot({ path: f }); L('shot', name); return f; };
  const ev = (s) => page.evaluate(s).catch(e => ({ err: String(e).slice(0, 200) }));
  const toLobby = async () => {
    await page.goto(BASE + '/index.html?test=1', { waitUntil: 'load' });
    await wait(1200);
    for (let i = 0; i < 40; i++) {
      const s = await ev(`({lobby:getComputedStyle(document.getElementById('lobby')).display,demo:!!(document.getElementById('demoEnterBtn')&&document.getElementById('demoEnterBtn').offsetParent),cin:getComputedStyle(document.getElementById('cinScene')).display})`);
      const sp = await ev(`(()=>{const o=document.getElementById('splashOverlay');return !o||getComputedStyle(o).display==='none'||+getComputedStyle(o).opacity<0.05||!o.isConnected})()`);
      if (s && s.lobby && s.lobby !== 'none' && sp === true) break;
      if (s && s.demo) { await ev(`document.getElementById('demoEnterBtn').click()`); await wait(1500); continue; }
      await page.keyboard.press('Enter'); await wait(700);
      if (i % 4 === 3) { await page.keyboard.down('Escape'); await wait(5600); await page.keyboard.up('Escape'); await wait(1500); }
    }
    await wait(3500);
  };
  try {
    if (part === 'lobby') {
      await toLobby();
      await shot('001_lobby'); await probe(page,'001_lobby',['#lobbyVerOverlay','#lobbyLangSelect','#lobbyMode','.lobby-brand-logo','#charList','.char-scroll-vp','#charList .char-item','#charList .char-item .char-thumb','#charList .char-item .char-name-label','#charList .char-item .char-cls','#charList .char-item .char-info','#charList .char-item .char-del','.char-item-new','.char-item-new .char-thumb','.char-item-new .char-name','.char-empty','.char-scroll-vp > *','.lma-main-txt','.lma-sub-txt','#lobbyWishlistBtn','.lobby-footer','#enterGameBtn','#enterGameBtn img','#lobbyStatus','#replayCinBtn','#lobbyVersionTxt','#lobbyQuitBtn','.char-disp-title','.char-disp-sub','.char-disp-detail','.lobby-right','.lobby-content','.char-disp-empty','#charList .char-item .char-name','#charList .char-item .char-thumb-empty','.char-item-new .char-thumb-empty','.lobby-left','#lobbyBgImg','#lobbyAncestorSprite','#lobbyCharKeyart','.lobby-corner-actions','.lobby-bottom-actions']);
      L('lobby_dom', await ev(`(()=>{const r=e=>{if(!e)return null;const b=e.getBoundingClientRect();return [Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)]};return {list:r(document.getElementById('charList')),items:[...document.querySelectorAll('#charList > *')].map(e=>({c:e.className,r:r(e),t:e.innerText.slice(0,60)})),enter:r(document.getElementById('enterGameBtn')),wish:r(document.getElementById('lobbyWishlistBtn')),quit:r(document.getElementById('lobbyQuitBtn')),lang:r(document.getElementById('lobbyLangSelect')),replay:r(document.getElementById('replayCinBtn')),ver:document.getElementById('lobbyVersionTxt').innerText,mode:document.getElementById('lobbyMode').innerText,verOv:document.getElementById('lobbyVerOverlay').innerText}})()`));
      await page.selectOption('#lobbyLangSelect', 'en'); await wait(1500);
      await shot('002_lobby_en'); await probe(page,'002_lobby_en',['#lobbyVerOverlay','#lobbyLangSelect','#lobbyMode','.lobby-brand-logo','#charList','.char-scroll-vp','#charList .char-item','#charList .char-item .char-thumb','#charList .char-item .char-name-label','#charList .char-item .char-cls','#charList .char-item .char-info','#charList .char-item .char-del','.char-item-new','.char-item-new .char-thumb','.char-item-new .char-name','.char-empty','.char-scroll-vp > *','.lma-main-txt','.lma-sub-txt','#lobbyWishlistBtn','.lobby-footer','#enterGameBtn','#enterGameBtn img','#lobbyStatus','#replayCinBtn','#lobbyVersionTxt','#lobbyQuitBtn','.char-disp-title','.char-disp-sub','.char-disp-detail','.lobby-right','.lobby-content','.char-disp-empty','#charList .char-item .char-name','#charList .char-item .char-thumb-empty','.char-item-new .char-thumb-empty','.lobby-left','#lobbyBgImg','#lobbyAncestorSprite','#lobbyCharKeyart','.lobby-corner-actions','.lobby-bottom-actions']);
      await page.selectOption('#lobbyLangSelect', 'ko'); await wait(1500);
      await ev(`document.getElementById('lobbyQuitBtn').click()`); await wait(700);
      await shot('003_quit'); await probe(page,'003_quit',['#lobbyQuitModal','[id*=Quit]','[id*=quit]','[role=dialog]','[role=dialog] *']);
      L('quit_dom', await ev(`(()=>{const m=[...document.querySelectorAll('div')].find(d=>d.id&&/quit/i.test(d.id)&&getComputedStyle(d).display!=='none');return m?{id:m.id,html:m.outerHTML.slice(0,600)}:null})()`));
      await page.keyboard.press('Escape'); await wait(600);
      await shot('003b_quit_closed');
      // 캐릭터 선택
      await ev(`document.querySelector('.char-item-new').click()`); await wait(1200);
      await shot('010_character_t1s');
      await wait(2500); await shot('011_character_t3_5s'); await probe(page,'011_character',['#charVisualPop','#charVisualPop *']);
      for (let k = 1; k < 5; k++) {
        await ev(`(()=>{const b=[...document.querySelectorAll('#charVisualPop .char-sel-btn, #charVisualPop [data-idx], #charVisualPop .cv-thumb, #charVisualPop button')].filter(x=>x.offsetParent);return b.map(x=>x.id||x.className).slice(0,20)})()`).then(r => k === 1 && L('char_buttons', r));
      }
      L('charpop_dom', await ev(`(()=>{const p=document.getElementById('charVisualPop');return [...p.querySelectorAll('*')].filter(e=>e.offsetParent&&(e.onclick||e.tagName==='BUTTON')).map(e=>({t:e.tagName,id:e.id,c:e.className,txt:(e.innerText||'').slice(0,20)})).slice(0,30)})()`));
      await ev(`document.getElementById('visualCreateBtn').click()`); await wait(900);
      await shot('020_name'); await probe(page,'020_name',['#createModal','.create-modal-inner','#createModalTitle','.create-modal-inner p','#charNameLabel','#charName','#status','#createCancelBtn','#createBtn']);
      await ev(`document.getElementById('createBtn').click()`); await wait(700);
      await shot('021_name_empty');
      await page.fill('#charName', '<>'); await ev(`document.getElementById('createBtn').click()`); await wait(700);
      await shot('022_name_special'); await probe(page,'022_name_special',['.create-modal-inner','#status','#createCancelBtn','#createBtn']);
      await page.fill('#charName', '패리티'); await wait(300);
      await shot('023_name_filled');
      L('name_dom', await ev(`(()=>{const r=e=>{const b=e.getBoundingClientRect();return [b.x,b.y,b.width,b.height]};const m=document.querySelector('#createModal .create-modal-inner');return {inner:r(m),title:r(document.getElementById('createModalTitle')),input:r(document.getElementById('charName')),btn:r(document.getElementById('createBtn')),status:document.getElementById('status').innerText}})()`));
      await ev(`document.getElementById('createBtn').click()`); await wait(2500);
      await shot('024_warrior_story_t2_5s');
      await page.keyboard.down('Escape'); await wait(1600); await page.keyboard.up('Escape');
      await page.waitForURL(/game\.html/, { timeout: 30000 }).catch(() => L('no game nav'));
      L('url', page.url());
      fs.writeFileSync(path.join(OUTROOT, 'web', 'game_url.txt'), page.url());
      // 저장 슬롯이 있는 로비
      await toLobby();
      await shot('004_lobby_saved'); await probe(page,'004_lobby_saved',['#lobbyVerOverlay','#lobbyLangSelect','#lobbyMode','.lobby-brand-logo','#charList','.char-scroll-vp','#charList .char-item','#charList .char-item .char-thumb','#charList .char-item .char-name-label','#charList .char-item .char-cls','#charList .char-item .char-info','#charList .char-item .char-del','.char-item-new','.char-item-new .char-thumb','.char-item-new .char-name','.char-empty','.char-scroll-vp > *','.lma-main-txt','.lma-sub-txt','#lobbyWishlistBtn','.lobby-footer','#enterGameBtn','#enterGameBtn img','#lobbyStatus','#replayCinBtn','#lobbyVersionTxt','#lobbyQuitBtn','.char-disp-title','.char-disp-sub','.char-disp-detail','.lobby-right','.lobby-content','.char-disp-empty','#charList .char-item .char-name','#charList .char-item .char-thumb-empty','.char-item-new .char-thumb-empty','.lobby-left','#lobbyBgImg','#lobbyAncestorSprite','#lobbyCharKeyart','.lobby-corner-actions','.lobby-bottom-actions']);
      await ev(`(()=>{const c=document.querySelector('#charList .char-item');if(c)c.click()})()`); await wait(1200);
      await shot('005_lobby_saved_selected'); await probe(page,'005_lobby_saved_selected',['#lobbyVerOverlay','#lobbyLangSelect','#lobbyMode','.lobby-brand-logo','#charList','.char-scroll-vp','#charList .char-item','#charList .char-item .char-thumb','#charList .char-item .char-name-label','#charList .char-item .char-cls','#charList .char-item .char-info','#charList .char-item .char-del','.char-item-new','.char-item-new .char-thumb','.char-item-new .char-name','.char-empty','.char-scroll-vp > *','.lma-main-txt','.lma-sub-txt','#lobbyWishlistBtn','.lobby-footer','#enterGameBtn','#enterGameBtn img','#lobbyStatus','#replayCinBtn','#lobbyVersionTxt','#lobbyQuitBtn','.char-disp-title','.char-disp-sub','.char-disp-detail','.lobby-right','.lobby-content','.char-disp-empty','#charList .char-item .char-name','#charList .char-item .char-thumb-empty','.char-item-new .char-thumb-empty','.lobby-left','#lobbyBgImg','#lobbyAncestorSprite','#lobbyCharKeyart','.lobby-corner-actions','.lobby-bottom-actions']);
      await ev(`(()=>{const d=document.querySelector('#charList .char-item .char-del');if(d)d.click()})()`); await wait(700);
      await shot('006_delete_confirm'); await probe(page,'006_delete_confirm',['#delConfirmModal','#delConfirmModal > div','#delConfirmMsg','#delConfirmYes','#delConfirmNo']);
      await ev(`document.getElementById('delConfirmNo').click()`); await wait(500);
    }

    if (part === 'game') {
      const url = fs.readFileSync(path.join(OUTROOT, 'web', 'game_url.txt'), 'utf8').trim();
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForFunction(`typeof _cutsceneState!=='undefined'&&_cutsceneState==='INTRO_CUTSCENE'`, null, { timeout: 60000 }).catch(() => L('cutscene not started'));
      await wait(1500); await shot('030_intro_first');
      await ev(`_cutsceneEnd()`);
      // 안내(가이드) 4단계
      for (let k = 0; k < 6; k++) {
        await wait(1500);
        const g = await ev(`({intro:G._intro,on:G.on,op:getComputedStyle(document.getElementById('introKeys')).opacity,disp:getComputedStyle(document.getElementById('introKeys')).display})`);
        L('guide', g);
        if (g && g.on) break;
        await shot(`040${k}_guide`);
        if (k === 0) await probe(page, '0400_guide', ['#introKeys', '#introKeys *']);
        await page.keyboard.press('Enter');
      }
      await wait(1200); await shot('045_curtain_after');
      for (let i = 0; i < 30; i++) { const a = await ev(`!!(window._parryLesson&&_parryLesson.active)`); if (a === true) break; await wait(300); }
      await wait(1500); await shot('0600_lesson');
      await probe(page, '0600_lesson', ['.lesson-panel', '.lesson-panel *', '#parryLesson', '#parryLesson *']);
      L('lesson', await ev(`({step:_parryLesson.step,chapter:_parryLesson.chapter,phase:_parryLesson.phase})`));
      await ev(`(()=>{try{_parryLesson.skipAll()}catch(e){};try{if(window._systemLesson&&_systemLesson.skipAll)_systemLesson.skipAll()}catch(e){};G.paused=false})()`);
      await wait(3000); await shot('050_hud');
      await probe(page, '050_hud', ['#hud', '#hud > *', '.orb', '[id$=Orb]', '#qsBar', '#qsBar > *', '#ultSlot', '#minimap', '#mmWrap', '#regionTxt', '#cpTxt', '#expBar', '#lvTxt', '#potSlots > *', '#qsRow > .qs', '#qsRow > .qs > *', '#skKeyBar > *', '#mmLvl', '#mmLvl *', '#hudCorner', '#hudCorner *', '#stageClock', '#stageClock *']);
      const hold = async (k) => { await page.keyboard.down(k); await wait(120); await page.keyboard.up(k); };
      const openP = async (k, id, name, extra) => {
        await hold(k); await wait(1500);
        let on = await ev(`document.getElementById('${id}').classList.contains('on')`);
        if (!on) { L('key_failed', k, id); await ev(`togglePanel('${id}')`); await wait(1500); }
        await shot(name); await probe(page, name, ['#' + id, '#' + id + ' *']);
        if (extra) await extra();
        await ev(`closeAllPanels()`); await wait(700);
      };
      await openP('Tab', 'invPanel', '070_inventory', async () => { await probe(page, '070_inventory_detail', ['#invPanel [class*=detail]', '#invPanel [class*=detail] *']); });
      await openP('KeyK', 'skillPanel', '080_skill', async () => { await probe(page, '080_skill_info', ['.sf-info', '.sf-info *', '.sf-slots', '.sf-slots *']); });
      await openP('KeyJ', 'statPanel', '081_growth');
      await openP('KeyG', 'forge', '082_forge');
      await openP('Escape', 'settings', '090_settings');
    }
    if (part === 'death' || part === 'clear') {
      const url = fs.readFileSync(path.join(OUTROOT, 'web', 'game_url.txt'), 'utf8').trim();
      await page.goto(url, { waitUntil: 'load' });
      for (let i = 0; i < 80; i++) {
        const s = await ev(`({on:typeof G!=='undefined'&&G.on===true,cut:typeof _cutsceneState!=='undefined'?_cutsceneState:null,intro:typeof G!=='undefined'?G._intro:null})`);
        if (s && s.on && !s.intro) break;
        if (s && s.cut === 'INTRO_CUTSCENE') await ev(`_cutsceneEnd()`); else if (s && s.intro) await page.keyboard.press('Escape');
        await wait(500);
      }
      await wait(1500);
      await ev(`(()=>{try{_parryLesson.skipAll()}catch(e){};try{_systemLesson.skipAll()}catch(e){};G.paused=false})()`);
      await wait(1500);
      if (part === 'death') {
        await ev(`(()=>{P.iframes=0;P._fallenCanRevive=false;P.hp=0})()`);
        await wait(1000); await shot('110_fallen_t1s');
        await probe(page, '110_fallen', ['#fallen', '#fallen *', '#death', '#death *', '[id*=allen]', '[id*=allen] *']);
        await wait(3000); await shot('110_fallen_t4s');
        for (let k = 0; k < 10; k++) { await wait(1200); const on = await ev(`document.getElementById('death').classList.contains('on')`); if (on) { await wait(2600); break; } }
        await shot('111_dead');
        await probe(page, '111_dead', ['#death', '#death *']);
      } else {
        await ev(`(()=>{window.__parityGod=setInterval(()=>{try{P.hp=P.mhp;P.iframes=60}catch(e){}},50)})()`);
        await ev(`(()=>{G._fbDone=true;G._bossUnlocked=true;G._bossLoadPhase=1;G._bossLoadT=0})()`);
        await wait(7000);
        for (let k = 0; k < 240; k++) {
          const r = await ev(`(()=>{const b=findBoss();if(!b)return {dead:1,alive:G.bossAlive};try{b.iframes=0;b._inv=0;hurtE(b,Math.max(1,b.hp+1),0,true)}catch(e){return {err:String(e)}};return {hp:b.hp}})()`);
          if (r && r.dead && !r.alive) break;
          await wait(250);
        }
        await wait(2000);
        L('exits', await ev(`({alive:G.bossAlive,exits:(G.exits||[]).slice(0,3)})`));
        await ev(`(()=>{if(G.exits&&G.exits[0]){P.x=(G.exits[0].x+.5)*40;P.y=(G.exits[0].y+.5)*40}})()`);
        for (let k = 0; k < 20; k++) { await wait(700); const o = await ev(`+getComputedStyle(document.getElementById('stageClear')).opacity`); if (o > 0.95) break; }
        await wait(800); await shot('100_clear');
        await probe(page, '100_clear', ['#stageClear', '#stageClear *']);
        await ev(`document.getElementById('nextBtn').click()`); await wait(1500);
        await shot('101_demo_end');
        await probe(page, '101_demo_end', ['#demoEnd', '#demoEnd *']);
        await ev(`document.getElementById('demoEndLobby').click()`);
        await page.waitForURL(/index\.html|lobby=1/, { timeout: 20000 }).catch(() => L('no lobby nav'));
        await wait(6000); await shot('102_lobby_return');
      }
    }
    if (part === 'forge') {
      const url = fs.readFileSync(path.join(OUTROOT, 'web', 'game_url.txt'), 'utf8').trim();
      await page.goto(url, { waitUntil: 'load' });
      for (let i = 0; i < 80; i++) {
        const s = await ev(`({on:typeof G!=='undefined'&&G.on===true,cut:typeof _cutsceneState!=='undefined'?_cutsceneState:null,intro:typeof G!=='undefined'?G._intro:null})`);
        if (s && s.on && !s.intro) break;
        if (s && s.cut === 'INTRO_CUTSCENE') await ev(`_cutsceneEnd()`); else if (s && s.intro) await page.keyboard.press('Escape');
        await wait(500);
      }
      await wait(1500);
      await ev(`(()=>{try{_parryLesson.skipAll()}catch(e){};try{_systemLesson.skipAll()}catch(e){};G.paused=false})()`);
      await wait(1500);
      await page.keyboard.down('KeyG'); await wait(120); await page.keyboard.up('KeyG'); await wait(1500);
      L('forge_on', await ev(`({on:document.getElementById('forge').classList.contains('on'),tab:G.forgeTab,mats:G.mats,bag:INV.bag.length})`));
      for (const k of ['upgrade', 'potion', 'salvage', 'reroll', 'crystal', 'craft']) {
        await ev(`(()=>{G.forgeTab='${k}';_forgeSel=null;try{_salSel.clear()}catch(e){};renderForge()})()`); await wait(900);
        await shot('083_forge_' + k);
        if (k === 'upgrade') await probe(page, '083_forge_shell', ['#forge', '#hud', '#minimap', '#mmWrap', '#hudCorner', 'canvas', 'body']);
        await probe(page, '083_forge_' + k, ['#forge .pbox', '#forge .ptitle', '#forgeMats', '#forgeLore', '#fgTabs', '#fgTabs > *', '#fgGrid', '#fgGrid *', '#forgeConfirm', '#forgeConfirm *', '#fgClose', '#forge .panel-nav', '#forge .panel-nav *', '#forge .frame-inner-panel']);
        await ev(`(()=>{const g=document.getElementById('fgGrid');if(g)g.scrollTop=99999})()`); await wait(400);
        await shot('083_forge_' + k + '_bottom');
        await ev(`(()=>{const g=document.getElementById('fgGrid');if(g)g.scrollTop=0})()`);
      }
      fs.writeFileSync(path.join(OUT, 'forge_html.txt'), await ev(`document.getElementById('forge').outerHTML`));
    }
    if (part === 'growth') {
      const url = fs.readFileSync(path.join(OUTROOT, 'web', 'game_url.txt'), 'utf8').trim();
      await page.goto(url, { waitUntil: 'load' });
      for (let i = 0; i < 80; i++) {
        const s = await ev(`({on:typeof G!=='undefined'&&G.on===true,cut:typeof _cutsceneState!=='undefined'?_cutsceneState:null,intro:typeof G!=='undefined'?G._intro:null})`);
        if (s && s.on && !s.intro) break;
        if (s && s.cut === 'INTRO_CUTSCENE') await ev(`_cutsceneEnd()`); else if (s && s.intro) await page.keyboard.press('Escape');
        await wait(500);
      }
      await wait(1500);
      await ev(`(()=>{try{_parryLesson.skipAll()}catch(e){};try{_systemLesson.skipAll()}catch(e){};G.paused=false})()`);
      await wait(1500);
      await page.keyboard.down('KeyJ'); await wait(120); await page.keyboard.up('KeyJ'); await wait(1800);
      await shot('081_growth');
      L('growth_bg_layers', await ev(`(()=>{const P=document.getElementById('statPanel');const v=P.querySelector('.growth-tree-viewport'),sc=P.querySelector('.growth-tree-scene');const r=e=>{if(!e)return null;const b=e.getBoundingClientRect();return [b.x,b.y,b.width,b.height]};const ps=(e,w)=>{if(!e)return null;const c=getComputedStyle(e,w);return {content:c.content,bg:c.backgroundImage.slice(0,160),size:c.backgroundSize,w:c.width,h:c.height,mask:(c.maskImage||c.webkitMaskImage||'').slice(0,120),tr:getComputedStyle(e).transform}};return {cls:P.className,viewport:r(v),scene:r(sc),vb:ps(v,'::before'),sb:ps(sc,'::before'),sceneTr:sc?getComputedStyle(sc).transform:null}})()`));
      await probe(page, '081_growth', ['#statPanel .growth-inspector', '#statPanel .growth-inspector *', '#statPanel .growth-paths *', '#statPanel .growth-filter', '#statPanel .growth-path-hint', '#statPanel .growth-search, #statPanel input', '#statPanel .growth-section-heading, #statPanel .growth-section-heading *', '#statPanel .growth-live-label', '#statPanel .growth-tree-origin', '#statPanel .growth-stat', '#statPanel .growth-passive', '#statPanel .growth-star', '#statPanel .growth-tree-links path', '#statPanel .growth-header *', '#statPanel .growth-footer', '#statPanel .growth-footer *', '#statPanel .growth-tree-toolbar *', '#statPanel .panel-nav *']);
      fs.writeFileSync(path.join(OUT, 'growth_inspector.html'), await ev(`(document.querySelector('#statPanel .growth-inspector')||{}).outerHTML||''`));
      // 마법 패시브 선택 상태
      await ev(`(()=>{const b=document.querySelector('#statPanel [data-passive="pMagic"] button, #statPanel [data-passive="pMagic"]');if(b)b.click()})()`); await wait(900);
      await shot('081_growth_magic');
    }
  } catch (e) { L('FATAL', String(e.stack || e).slice(0, 600)); await shot('zz_fatal').catch(() => { }); }
  fs.writeFileSync(path.join(OUT, `log_${part}.txt`), log.join('\n'));
  await ctx.close();
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) { }
})();
