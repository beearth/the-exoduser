// PC-SYS 잔여 6건 웹 기준 관측(2026-10-23). 헤드리스 Chrome·음소거·1920x1080·격리 프로필.
// 웹 기준 = 846889174 커밋본(Godot source_snapshot/game.html과 같은 sha dee094fd…). 작업 사본에서 다른 웹 파일은 route로 그 커밋 blob을 돌려준다.
// 실행: NODE_PATH=G:/exoduser/node_modules node pc_sys_web.cjs <part> [--base=http://127.0.0.1:3390]
//   part: clock | death | death_demon | stats | potion | keycap | forge
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const REPO = process.env.PCSYS_WEB_REPO || 'G:/exoduser';
const REF = process.env.PCSYS_WEB_REF || '846889174';
const OUTROOT = process.env.PCSYS_OUT || 'G:/exoduser-wt/_out/pc-sys-leftovers';
const part = process.argv[2] || 'clock';
const BASE = (process.argv.find(a => a.startsWith('--base=')) || '--base=http://127.0.0.1:3390').slice(7);
const GAME_URL = BASE + '/game.html?test=1&slot=demo&demo=1&story=warrior-v21';
const OUT = path.join(OUTROOT, 'web', part);
const PROFILE = path.join(OUTROOT, 'pw_profile_' + part + '_' + Date.now());
fs.mkdirSync(OUT, { recursive: true });
const log = [];
const L = (...a) => { const s = a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '); console.log(s); log.push(s); };
const wait = ms => new Promise(r => setTimeout(r, ms));
const diff = cp.execSync(`git -C ${REPO} -c core.quotepath=off diff --name-only ${REF}`, { encoding: 'utf8' }).split('\n').filter(Boolean)
  .filter(p => !/^(docs|godot|tools|test|output)\//.test(p));
const diffSet = new Set(diff);
const blobCache = {};
function blob(p) {
  if (p in blobCache) return blobCache[p];
  try { blobCache[p] = cp.execSync(`git -C ${REPO} show ${REF}:"${p}"`, { maxBuffer: 1 << 28 }); } catch (e) { blobCache[p] = null; }
  return blobCache[p];
}
const MIME = { html: 'text/html; charset=utf-8', js: 'application/javascript; charset=utf-8', css: 'text/css; charset=utf-8', json: 'application/json', png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', mp3: 'audio/mpeg', mp4: 'video/mp4', svg: 'image/svg+xml' };
L('route_override_files', diff.length);

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    channel: 'chrome', headless: true, viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1,
    args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--window-size=1920,1080'],
  });
  await ctx.route('**/*', async (route) => {
    const u = new URL(route.request().url());
    if (!u.href.startsWith(BASE)) return route.continue();
    const p = decodeURIComponent(u.pathname.replace(/^\//, '')) || 'index.html';
    if (diffSet.has(p)) {
      const b = blob(p);
      if (b === null) return route.fulfill({ status: 404, body: 'not in ' + REF });
      const ext = p.split('.').pop().toLowerCase();
      return route.fulfill({ status: 200, body: b, headers: { 'content-type': MIME[ext] || 'application/octet-stream', 'cache-control': 'no-store' } });
    }
    return route.continue();
  });
  await ctx.addInitScript(() => { window.open = (u) => null; });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on('pageerror', e => L('[pageerror]', e.message.slice(0, 200)));
  const shot = async (name) => { await page.screenshot({ path: path.join(OUT, name + '.png') }); L('shot', name); };
  const ev = (s) => page.evaluate(s).catch(e => ({ err: String(e).slice(0, 200) }));
  // 본편 진입: 컷신 종료 → 가이드 4장 → 커튼. lessonStop이면 레슨 활성까지만.
  const enter = async (lessonStop) => {
    await page.goto(GAME_URL, { waitUntil: 'load' });
    await page.waitForFunction(`typeof _cutsceneState!=='undefined'&&_cutsceneState==='INTRO_CUTSCENE'`, null, { timeout: 60000 }).catch(() => L('cutscene not started'));
    await wait(800); await ev(`_cutsceneEnd()`);
    await wait(1500);
    // 가이드 Escape = _finishIntroGuide → _openIntroCurtain (Godot finish_native_guide와 같은 경로)
    await page.keyboard.press('Escape');
    for (let i = 0; i < 60; i++) { const a = await ev(`!!(window._parryLesson&&_parryLesson.active)`); if (a === true) break; await wait(100); }
    L('lesson_ready', await ev(`({stageTime:G.stageTime,on:G.on,intro:G._intro,lesson:_parryLesson.active})`));
    if (lessonStop) return;
    await wait(500);
    await ev(`(()=>{try{_parryLesson.skipAll()}catch(e){};try{_systemLesson.skipAll()}catch(e){};G.paused=false})()`);
    L('lesson_skipped', await ev(`({stageTime:G.stageTime,lesson:_parryLesson.active})`));
  };
  try {
    if (part === 'clock') {
      await enter(false);
      for (let i = 1; i <= 4; i++) { await wait(1000); L('clock_t' + i, await ev(`({stageTime:G.stageTime,hud:document.getElementById('stageTimerHud').textContent})`)); }
      await shot('clock_after_skip_t4s');
    }
    if (part === 'death' || part === 'death_demon') {
      await enter(false);
      await wait(1500);
      if (part === 'death_demon') {
        // Godot 관측과 같은 고정 조건: 악마 팔찌 implicit 10.86(_iRevPow)
        L('bracelet_fixture', await ev(`(()=>{const b=INV.equipped.bracelet;b.brType='demon';b._implicitStat='_iRevPow';b._implicitVal=10.86;return {brType:b.brType,stat:b._implicitStat,val:b._implicitVal}})()`));
      } else {
        L('bracelet', await ev(`(()=>{const b=INV.equipped.bracelet;return b?{brType:b.brType,stat:b._implicitStat,val:b._implicitVal,aff:(b.affixes||[]).map(a=>a.id+':'+a.value)}:null})()`));
      }
      // 페이지 안 rAF 감시: P.s 전이와 #death.on 시각(performance.now)
      await ev(`(()=>{window.__dt={t0:performance.now(),rows:[],last:null,dOn:false};const f=()=>{const s=P.s,sec=P.s==='fallen'?Math.ceil(Math.max(0,P.st2)/60):null,on=document.getElementById('death').classList.contains('on');const k=s+'|'+sec+'|'+on;if(k!==window.__dt.last){window.__dt.last=k;window.__dt.rows.push({ms:Math.round(performance.now()-window.__dt.t0),s,sec,on,chance:P._fallenRevChance,can:P._fallenCanRevive,txt:P._fallenCanRevive?('부활력 '+P._fallenRevChance+'%'):'부활 불가'})}if(!on||window.__dt.rows.length<40)requestAnimationFrame(f)};requestAnimationFrame(f);P.iframes=0;P.hp=0})()`);
      await wait(1000); await shot('fallen_t1s');
      await wait(3000); await shot('fallen_t4s');
      await wait(2000); await shot('dead_t6s');
      await wait(3000); await shot('dead_t9s');
      L('death_rows', await ev(`window.__dt.rows`));
      L('sStats_after_death', await ev(`G._sStats`));
    }
    if (part === 'stats') {
      await enter(false);
      L('sStats_start', await ev(`G._sStats`));
      const x0 = await ev(`({x:P.x,y:P.y})`);
      await page.keyboard.down('KeyD'); await wait(2000); await page.keyboard.up('KeyD'); await wait(300);
      L('sStats_walk2s', await ev(`({ss:G._sStats,moved:Math.hypot(P.x-${x0.x},P.y-${x0.y})})`));
      await ev(`(()=>{P.iframes=0;hurtP(40,{src:'probe'})})()`); await wait(100);
      L('sStats_hit40', await ev(`({ss:G._sStats,hp:P.hp})`));
    }
    if (part === 'potion') {
      await enter(false);
      await wait(1500);
      L('qslots', await ev(`({QSLOTS,SKILL_SLOTS,mats:G.mats})`));
      L('qs_dom', await ev(`[0,1,2,3,5].map(i=>{const e=document.getElementById('qs'+i);return {id:'qs'+i,cls:e.className,html:e.innerHTML.slice(0,160),txt:e.innerText}})`));
      await shot('potion_hud');
    }
    if (part === 'keycap') {
      await enter(false);
      await wait(1000);
      const caps = () => ev(`[...document.getElementById('skKeyBar').children].map(c=>({l:c.style.left,t:c.textContent,fs:c.style.fontSize}))`);
      L('caps_kbm', await caps());
      await shot('keycap_kbm');
      // 재바인딩: 원본 BINDS 직접 변경 후 갱신 경로(_updateActionKeys→_updateSkBarKeyLabels)
      await ev(`(()=>{BINDS.shield='KeyR';BINDS.beam='mouse0';updateQS()})()`);
      L('caps_rebind', await caps());
      await shot('keycap_rebind');
      await ev(`(()=>{BINDS.shield='KeyE';BINDS.beam='mouse2';_gpActive=true;updateQS()})()`);
      L('caps_pad', await caps());
      await shot('keycap_pad');
      await ev(`(()=>{_gpActive=false;updateQS()})()`);
      L('caps_back', await caps());
    }
    if (part === 'forge') {
      await enter(false);
      await wait(1000);
      await page.keyboard.down('KeyG'); await wait(120); await page.keyboard.up('KeyG'); await wait(1500);
      await ev(`(()=>{G._aiEnhSlot='weapon';G._aiTarget=undefined;renderForge()})()`); await wait(600);
      L('ai_before', await ev(`({mats:G.mats,enh:INV.equipped.weapon.enh||0,target:G._aiTarget,rarity:INV.equipped.weapon.rarity})`));
      await shot('forge_ai_before');
      // 관측용 래퍼(동작 불변): renderForge 직전 #aiEnhResult 내용과 addTxt 호출을 기록
      await ev(`(()=>{window.__ai={calls:0,beforeRender:[],txt:[]};const rf=window.renderForge;window.renderForge=function(){const r=document.getElementById('aiEnhResult');window.__ai.beforeRender.push(r?r.innerHTML:null);return rf.apply(this,arguments)};const at=window.addTxt;window.addTxt=function(x,y,t,c,l){window.__ai.txt.push({t,c,l});return at.apply(this,arguments)};const da=window._doAiEnhance;window._doAiEnhance=function(){window.__ai.calls++;return da.apply(this,arguments)}})()`);
      // 원본 버튼 onclick=_doAiEnhance()
      await ev(`[...document.querySelectorAll('#fgGrid .id-btn.equip')].find(b=>/강화 시작/.test(b.textContent)).click()`);
      L('ai_trace', await ev(`window.__ai`));
      // 악의를 충분히 준 경우(목표 +3)도 관측
      await ev(`(()=>{G.mats=200000;G._aiTarget=3;renderForge()})()`); await wait(300);
      await ev(`(()=>{window.__ai={calls:0,beforeRender:[],txt:[]}})()`);
      await ev(`[...document.querySelectorAll('#fgGrid .id-btn.equip')].find(b=>/강화 시작/.test(b.textContent)).click()`);
      L('ai_trace_rich', await ev(`({ai:window.__ai,mats:G.mats,enh:INV.equipped.weapon.enh,target:G._aiTarget})`));
      await wait(200); await shot('forge_ai_rich_after');
      await wait(300);
      L('ai_after', await ev(`({mats:G.mats,enh:INV.equipped.weapon.enh||0,target:G._aiTarget,result:(document.getElementById('aiEnhResult')||{}).innerHTML,txts:(G.txts||[]).slice(-3).map(t=>({t:t.t||t.text||t.txt,c:t.c||t.col}))})`));
      await shot('forge_ai_after');
      await wait(1500);
      await shot('forge_ai_after_1_5s');
    }
  } catch (e) { L('FATAL', String(e.stack || e).slice(0, 600)); await shot('zz_fatal').catch(() => { }); }
  fs.writeFileSync(path.join(OUT, `log_${part}.txt`), log.join('\n'));
  await ctx.close();
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) { }
})();
