// PC-PLAYER-SHIELD 웹 기준 관측(2026-10-23) — 플레이어 에너지쉴드 흡수·격파·리젠. 헤드리스 Chrome·음소거·1920x1080·격리 프로필.
// 웹 기준 = 846889174 커밋본(Godot source_snapshot/game.html과 같은 sha dee094fd…). 작업 사본에서 다른 웹 파일은 route로 그 커밋 blob을 돌려준다.
// 실행: NODE_PATH=G:/exoduser/node_modules node pc_player_shield_web.cjs shield [--base=http://127.0.0.1:3387]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const REPO = process.env.PCSYS_WEB_REPO || 'G:/exoduser';
const REF = process.env.PCSYS_WEB_REF || '846889174';
const OUTROOT = process.env.PCSYS_OUT || 'G:/exoduser-wt/_out/pc-player-shield';
const part = process.argv[2] || 'shield';
const BASE = (process.argv.find(a => a.startsWith('--base=')) || '--base=http://127.0.0.1:3387').slice(7);
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
  // 관측값: 원본 P 필드 그대로(동작 불변). 적 AI가 끼어들지 않게 관측 구간 동안 모든 적을 원래 위치에서 멀리 둔다(양쪽 동일 조건).
  const S = () => ev(`({hp:P.hp,mhp:P.mhp,shield:P.shield,mshield:P.mshield,shieldRegenT:P.shieldRegenT,s:P.s,int:STATS.int,lv:P.lv,pMRegen:PASSIVES.pMRegen,baseDef:P.baseDef,stageTime:G.stageTime})`);
  const hit = (d) => ev(`(()=>{P.iframes=0;if(P.s==='stagger'||P.s==='pStun')P.s='idle';hurtP(${d},{src:'probe'});return {hp:P.hp,shield:P.shield,shieldRegenT:P.shieldRegenT,txt:(G.txts||[]).filter(t=>t&&t.life>0&&(t.c==='#4488ff')).map(t=>({t:t.t,c:t.c,ml:t.ml}))}})()`);
  try {
    if (part === 'shield') {
      // 벽시계가 아닌 원본 tick(G.stageTime) 기준으로 맞춘다: N tick 진행 뒤 G.paused=true로 멈추고 찍은 다음 재개.
      const freezeAfter = async (n, name) => {
        const t0 = await ev(`G.stageTime`);
        await page.waitForFunction(`G.stageTime>=${t0}+${n}`, null, { timeout: 20000, polling: 'raf' }).catch(() => L('tick_wait_timeout', name));
        L(name + '_frozen', await ev(`(()=>{G.paused=true;return {stageTime:G.stageTime,hp:P.hp,shield:P.shield,shieldRegenT:P.shieldRegenT}})()`));
        await wait(150); await shot(name); await ev(`G.paused=false`);
      };
      const freezeWhen = async (cond, name) => {
        await page.waitForFunction(cond, null, { timeout: 30000, polling: 'raf' }).catch(() => L('cond_wait_timeout', name));
        L(name + '_frozen', await ev(`(()=>{G.paused=true;return {stageTime:G.stageTime,hp:P.hp,shield:P.shield,mshield:P.mshield,shieldRegenT:P.shieldRegenT}})()`));
        await wait(150); await shot(name); await ev(`G.paused=false`);
      };
      await enter(false);
      await wait(1500);
      L('park_enemies', await ev(`(()=>{let n=0;for(const e of ens){if(e&&e.alive){e.x+=4000;e.y+=4000;n++}}return n})()`));
      await wait(500);
      await freezeAfter(1, 's0_full');
      L('hit1_60', await hit(60));
      L('hit2_60', await hit(60));
      await freezeAfter(30, 's2_partial_t30');
      L('set_shield_20', await ev(`(()=>{P.shield=20;return P.shield})()`));
      L('hit3_break_60', await hit(60));
      await freezeAfter(3, 's3_break_t3');
      await freezeAfter(5, 's3_break_t8');
      await freezeAfter(60, 's4_break_t68');
      await freezeWhen(`P.shield/P.mshield>=0.25`, 's5_regen_25pct');
      L('s5', await S());
    }
  } catch (e) { L('FATAL', String(e.stack || e).slice(0, 600)); await shot('zz_fatal').catch(() => { }); }
  fs.writeFileSync(path.join(OUT, `log_${part}.txt`), log.join('\n'));
  await ctx.close();
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) { }
})();
