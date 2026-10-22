// 웹↔Godot 동일성 검수용 웹 캡처 (임시 스크립트, 2026-10-22)
// 헤드리스 Chrome + 음소거, 1920x1080, 격리 프로필(_out/parity/pw_profile_web), 서버 3399(격리 save dir)
// 실행: NODE_PATH=G:/exoduser/node_modules node web_capture.cjs <part>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const ROOT = process.env.PARITY_OUT || require('path').resolve(__dirname, '../../../exoduser-wt/_out/parity');
const OUT = ROOT + '/web';
const PROFILE = ROOT + '/pw_profile_web';
const BASE = process.env.PARITY_WEB_BASE || 'http://127.0.0.1:3399';
const part = process.argv[2] || 'all';
fs.mkdirSync(OUT, { recursive: true });
const log = [];
const L = (...a) => { const s = a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '); console.log(s); log.push(s); };
const wait = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    channel: 'chrome', headless: true,
    viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1,
    args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--window-size=1920,1080'],
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on('pageerror', e => L('[pageerror]', e.message.slice(0, 200)));
  const shot = async (name) => { const f = path.join(OUT, name + '.png'); await page.screenshot({ path: f }); L('shot', name); return f; };
  const ev = (s) => page.evaluate(s).catch(e => ({ err: String(e).slice(0, 200) }));
  try {
    if (part === 'all' || part === 'lobby') {
      // 1. 로비 첫 화면 (index.html?test=1 = 데모 빌드 오프라인 경로, Steam/NW와 같은 _testMode)
      await page.goto(BASE + '/index.html?test=1', { waitUntil: 'load' });
      await wait(1200); await shot('01a_splash_fdg_t1s');
      await wait(3500); await shot('01b_splash_title_t4_7s');
      await wait(2500); await shot('01c_splash_title_t7s');
      await page.keyboard.press('Enter'); await wait(1500);
      await shot('01d_after_title_key');
      // 시네마틱 ENTER 프롬프트
      const cinVis = await ev(`getComputedStyle(document.getElementById('cinScene')).display`);
      L('cinScene display', cinVis);
      await shot('01e_cin_prompt');
      await page.keyboard.press('Enter'); // ENTER → intro.mp4
      await wait(2500); await shot('01f_cin_intro_mp4_t2_5s');
      await wait(3000); await shot('01g_cin_intro_mp4_t5_5s');
      // world intro 진입 대기
      for (let i = 0; i < 20; i++) { const w = await ev(`(()=>{const v=document.getElementById('worldIntroVideo');return v?{d:getComputedStyle(v).display,t:v.currentTime,p:v.paused}:null})()`); if (w && w.t > 0.5) break; await wait(500); }
      const wiInfo = await ev(`(()=>{const v=document.getElementById('worldIntroVideo');return v?{t:v.currentTime,dur:v.duration,src:v.currentSrc}:null})()`);
      L('worldIntro', wiInfo);
      await wait(1500); await shot('01h_cin_world_t3s');
      // 컷 점프 (Space=다음 컷) 6회, 각 2s 후 캡처
      for (let k = 0; k < 6; k++) {
        await page.keyboard.press('Space'); await wait(2200);
        const t = await ev(`(()=>{const v=document.getElementById('worldIntroVideo');return v?Math.round(v.currentTime*10)/10:null})()`);
        await shot(`01i_cin_world_cut${k + 1}_t${String(t).replace('.', '_')}`);
      }
      // 전체 건너뛰기: Esc 5초 홀드
      await page.keyboard.down('Escape'); await wait(5600); await page.keyboard.up('Escape');
      await wait(2500);
      await shot('01j_login_demo_enter');
      await ev(`(()=>{const b=document.getElementById('demoEnterBtn');if(b&&b.offsetParent)b.click();})()`);
      await wait(4000);
      await shot('01k_lobby_empty');
      // 2. 캐릭터 선택
      await ev(`(()=>{const n=document.querySelector('.char-item-new');if(n)n.click();})()`);
      await wait(3500);
      await shot('02a_charselect');
      await wait(3000);
      await shot('02b_charselect_t6s');
      await ev(`document.getElementById('visualCreateBtn').click()`);
      await wait(800);
      await shot('02c_name_modal');
      await page.fill('#charName', '패리티');
      await ev(`document.getElementById('createBtn').click()`);
      await wait(3000);
      await shot('02d_story_t3s');
      await wait(5000); await shot('02e_story_t8s');
      await page.keyboard.press('Enter'); await wait(2500); await shot('02f_story_next');
      // 스토리 건너뛰기 (Esc)
      await page.keyboard.down('Escape'); await wait(1500); await page.keyboard.up('Escape');
      await page.waitForURL(/game\.html/, { timeout: 30000 }).catch(() => L('no game.html nav'));
      L('url', page.url());
      fs.writeFileSync(path.join(OUT, 'game_url.txt'), page.url());
      // 3. game.html 인트로 컷신 (INTRO = 네메시스)
      await page.waitForFunction(`typeof _cutsceneState!=='undefined'&&_cutsceneState==='INTRO_CUTSCENE'`, null, { timeout: 60000 }).catch(() => L('cutscene not started'));
      let last = -2, n = 0;
      for (let guard = 0; guard < 400; guard++) {
        const st = await ev(`({s:_cutsceneState,i:_cutLineIdx,seq:_cutSeq,img:(_cutsceneGetLines()[_cutLineIdx]||{}).img,w:_cutWaitInput})`);
        if (!st || st.s !== 'INTRO_CUTSCENE') { L('cutscene end', st); break; }
        if (st.i !== last) {
          last = st.i; await wait(1000);
          const st2 = await ev(`({i:_cutLineIdx,img:(_cutsceneGetLines()[_cutLineIdx]||{}).img,sp:(_cutsceneGetLines()[_cutLineIdx]||{}).speaker,f:((_cutsceneGetLines()[_cutLineIdx]||{}).fade||{}).type})`);
          await shot(`03c_${String(st2.i).padStart(2, '0')}_${(st2.img || 'noimg').replace(/[\/.]/g, '_')}`);
          n++;
          await ev(`(()=>{_cutWaitInput=true;_cutsceneAdvance()})()`);
          await wait(260);
          const st3 = await ev(`({i:_cutLineIdx,f:((_cutsceneGetLines()[_cutLineIdx]||{}).fade||{}).type})`);
          if (st3 && st3.f && st3.f !== 'cut') await shot(`03c_${String(st3.i).padStart(2, '0')}_trans_mid_${st3.f}`);
        } else await wait(150);
      }
      // '눈을 떠' 안내 4컷
      for (let k = 0; k < 6; k++) {
        await wait(1500);
        const g = await ev(`({intro:G._intro,on:G.on,op:getComputedStyle(document.getElementById('introKeys')).opacity})`);
        L('guide', g);
        await shot(`03d_guide_${k}`);
        if (g && g.on) break;
        await page.keyboard.press('Enter');
      }
      await wait(1500); await shot('03e_curtain_after');
      await wait(2500); await shot('04a_field_first_t4s');
      const pinfo = await ev(`({lv:P.lv,x:Math.round(P.x),y:Math.round(P.y),stage:G.stage,zoom:G._camZoom,ens:ens.length,on:G.on,paused:G.paused,VW:typeof VW!=='undefined'?VW:null,VH:typeof VH!=='undefined'?VH:null,res:OPT.resScale})`);
      L('field', pinfo);
      fs.writeFileSync(path.join(OUT, 'field_state.json'), JSON.stringify(pinfo));
    }
    if (part === 'all' || part === 'game') {
      const url = fs.readFileSync(path.join(OUT, 'game_url.txt'), 'utf8').trim();
      const enterGame = async (tag) => {
        await page.goto(url, { waitUntil: 'load' });
        for (let i = 0; i < 80; i++) {
          const s = await ev(`({on:typeof G!=='undefined'&&G.on===true,cut:typeof _cutsceneState!=='undefined'?_cutsceneState:null,intro:typeof G!=='undefined'?G._intro:null})`);
          if (s && s.on && !s.intro) break;
          if (s && s.cut === 'INTRO_CUTSCENE') await ev(`_cutsceneEnd()`);
          else if (s && s.intro) await page.keyboard.press('Escape');
          await wait(500);
        }
        await wait(1500);
        L(tag, await ev(`({on:G.on,paused:G.paused,lesson:!!(window._parryLesson&&window._parryLesson.active),x:Math.round(P.x),y:Math.round(P.y)})`));
      };
      const skipLessons = async () => {
        await ev(`(()=>{try{if(window._parryLesson&&_parryLesson.skipAll)_parryLesson.skipAll()}catch(e){};try{if(window._systemLesson&&_systemLesson.skipAll)_systemLesson.skipAll()}catch(e){};G.paused=false})()`);
        await wait(800);
      };
      const spawnRing = async (n, r) => ev(`(()=>{for(let i=0;i<${n};i++){const a=Math.PI*2*i/${n}-Math.PI/2;ens.push(mkEn(P.x+Math.cos(a)*${r},P.y+Math.sin(a)*${r},0,0,false,EL.P,-1))}return ens.length})()`);
      await enterGame('enter1');
      await shot('04b_field_reentry_with_lesson');
      await skipLessons();
      await shot('04c_field_clean');
      L('state', await ev(`({x:Math.round(P.x),y:Math.round(P.y),zoom:G._camZoom,ens:ens.length,paused:G.paused,camx:Math.round(G.cam.x),camy:Math.round(G.cam.y)})`));
      await page.keyboard.down('KeyW'); await wait(1800); await page.keyboard.up('KeyW');
      await wait(600); await shot('04d_field_walk_north');
      // 6. UI
      await page.keyboard.press('Tab'); await wait(1200); await shot('06a_inventory');
      await ev(`closeAllPanels()`); await wait(500);
      await page.keyboard.press('KeyK'); await wait(2000); await shot('06b_skill');
      await ev(`closeAllPanels()`); await wait(500);
      await page.keyboard.press('Escape'); await wait(1200); await shot('06c_settings');
      await ev(`closeAllPanels()`); await wait(600);
      await page.keyboard.press('KeyJ'); await wait(1200); await shot('06d_growth');
      await ev(`closeAllPanels()`); await wait(600);
      // 7. 전투
      await ev(`P.iframes=999999`);
      L('ring', await spawnRing(5, 260));
      await wait(1500); await shot('07a_enemies_ring');
      await page.mouse.move(960, 300);
      for (let k = 0; k < 3; k++) { await page.mouse.down(); await wait(120); await page.mouse.up(); await wait(140); }
      await shot('07b_lmb_combo');
      await wait(200); await shot('07c_lmb_after_dmgnum');
      await page.mouse.move(1260, 540);
      await page.mouse.down({ button: 'right' }); await wait(120); await page.mouse.up({ button: 'right' });
      await wait(300); await shot('07d_rmb_fireball');
      await page.keyboard.press('Digit1'); await wait(500); await shot('07e_skill1_spiketrap');
      await ev(`P.mp=P.mmp;P.sp=P.msp||P.sp`);
      await page.keyboard.press('Space'); await wait(350); await shot('07f_space_giantslam');
      await wait(500); await shot('07g_space_after');
      await page.keyboard.press('KeyF'); await wait(500); await shot('07h_F_holydome');
      await page.mouse.move(960, 800);
      await page.keyboard.press('ControlLeft'); await wait(450); await shot('07i_ctrl_iceorb');
      await wait(1500); await shot('07j_after_combat');
      L('combat', await ev(`({ens:ens.length,dead:ens.filter(e=>e.hp<=0).length,kills:G.kills})`));
      // 8. 이동 스킬
      await ev(`(()=>{ens.length=0;P.mp=P.mmp;_harpGauge=5})()`);
      await wait(400);
      const p0 = await ev(`({x:P.x,y:P.y,g:_harpGauge,st:P.st2})`);
      await page.mouse.move(1500, 540);
      await page.keyboard.down('ShiftLeft'); await wait(450); await shot('08a_shift_hold_aim');
      await page.keyboard.up('ShiftLeft'); await wait(160); await shot('08b_shift_chain_mid');
      await wait(700); await shot('08c_shift_after');
      const p1 = await ev(`({x:P.x,y:P.y,g:_harpGauge})`);
      L('shift', { p0, p1, dx: p1.x - p0.x, dy: p1.y - p0.y });
      await ev(`(()=>{P.mp=P.mmp;_harpGauge=5})()`); await wait(300);
      const p2 = await ev(`({x:P.x,y:P.y})`);
      await page.keyboard.down('KeyA'); await wait(60); await page.keyboard.press('Space'); await wait(120); await shot('08d_dirspace_bladedash_mid');
      await page.keyboard.up('KeyA'); await wait(500); await shot('08e_bladedash_after');
      const p3 = await ev(`({x:P.x,y:P.y})`);
      L('bladeDash', { p2, p3, dx: p3.x - p2.x, dy: p3.y - p2.y });
      fs.writeFileSync(path.join(OUT, 'movement.json'), JSON.stringify({ shift: { p0, p1 }, bladeDash: { p2, p3 } }));
      // 9. 필드보스 (심연의 앵글러) — _FB_SITES[0]
      await ev(`(()=>{const s=[58,158];P.x=(s[0]+.5)*40+520;P.y=(s[1]+.5)*40-80;G.cam.x=P.x;G.cam.y=P.y})()`);
      await wait(3500); await shot('09a_fieldboss_angler');
      L('fb', await ev(`ens.filter(e=>e.fieldBoss||e._fb||e.isFB).length+'/'+ens.length`));
      await wait(2500); await shot('09b_fieldboss_angler_t6s');
      // 일반 적 자연 스폰 구역 (맵 중앙 쪽)
      await ev(`(()=>{P.x=100*40;P.y=120*40;G.cam.x=P.x;G.cam.y=P.y})()`);
      await wait(4000); await shot('09c_field_center_enemies');
      L('center', await ev(`({ens:ens.length,types:[...new Set(ens.map(e=>e.etype))].slice(0,20)})`));
      // 10. 보스방 (필드 경로 연출)
      await ev(`(()=>{G._fbDone=true;G._bossUnlocked=true;G._bossLoadPhase=1;G._bossLoadT=0})()`);
      for (let k = 0; k < 6; k++) { await wait(700); await shot(`10a_boss_entry_${k}`); }
      await wait(3000); await shot('10b_boss_arena_t6s');
      L('boss', await ev(`(()=>{const b=ens.find(e=>e.boss||e.ib||e.isBoss);return b?{x:Math.round(b.x),y:Math.round(b.y),hp:b.hp,name:b.name||b.bn,r:b.r,sz:b.sz}:{none:true,ens:ens.length,alive:G.bossAlive}})()`));
      await ev(`P.iframes=999999`);
      for (let k = 0; k < 6; k++) { await wait(900); await shot(`10c_boss_pattern_${k}`); }
      // 11-b. 클리어: 보스 처치 → 출구 이동
      await ev(`(()=>{ens.forEach(e=>{if(e.boss||e.ib||e.isBoss){e.hp=0}})})()`);
      await wait(3000); await shot('11c_boss_killed');
      L('exits', await ev(`({alive:G.bossAlive,exits:(G.exits||[]).slice(0,3)})`));
      await ev(`(()=>{if(G.exits&&G.exits[0]){P.x=(G.exits[0].x+.5)*40;P.y=(G.exits[0].y+.5)*40}})()`);
      for (let k = 0; k < 6; k++) { await wait(1000); await shot(`11d_stage_clear_${k}`); }
      // 11-c. 로비 복귀
      await ev(`goToLobby()`);
      await page.waitForURL(/index\.html|lobby=1/, { timeout: 20000 }).catch(() => L('no lobby nav'));
      await wait(5000); await shot('11e_lobby_return');
      // 11-a. 사망
      await enterGame('enter2');
      await skipLessons();
      await ev(`(()=>{P.iframes=0;P._fallenCanRevive=false;P.hp=0})()`);
      await wait(900); await shot('11a_death_fallen_t1s');
      await ev(`P._fallenCanRevive=false`);
      await wait(3000); await shot('11a_death_fallen_t4s');
      for (let k = 0; k < 8; k++) { await wait(1200); const on = await ev(`document.getElementById('death').classList.contains('on')`); if (on) { await wait(2600); break; } }
      await shot('11b_death_screen');
    }
    if (part === 'game2') {
      const url = fs.readFileSync(path.join(OUT, 'game_url.txt'), 'utf8').trim();
      await page.goto(url, { waitUntil: 'load' });
      for (let i = 0; i < 80; i++) {
        const s = await ev(`({on:typeof G!=='undefined'&&G.on===true,cut:typeof _cutsceneState!=='undefined'?_cutsceneState:null,intro:typeof G!=='undefined'?G._intro:null})`);
        if (s && s.on && !s.intro) break;
        if (s && s.cut === 'INTRO_CUTSCENE') await ev(`_cutsceneEnd()`); else if (s && s.intro) await page.keyboard.press('Escape');
        await wait(500);
      }
      await wait(1500);
      await ev(`(()=>{try{_parryLesson.skipAll()}catch(e){};try{_systemLesson.skipAll()}catch(e){};G.paused=false})()`);
      await wait(1000);
      // UI: 키 홀드로 입력
      const holdKey = async (k) => { await page.keyboard.down(k); await wait(120); await page.keyboard.up(k); };
      await holdKey('Tab'); await wait(1200);
      let inv = await ev(`document.getElementById('invPanel').classList.contains('on')`);
      L('inv by key', inv);
      if (!inv) { await ev(`togglePanel('invPanel')`); await wait(1200); }
      await shot('06a_inventory');
      await ev(`closeAllPanels()`); await wait(600);
      await holdKey('KeyK'); await wait(2200);
      let sk = await ev(`document.getElementById('skillPanel').classList.contains('on')`);
      L('skill by key', sk);
      if (!sk) { await ev(`togglePanel('skillPanel')`); await wait(2200); }
      await shot('06b_skill');
      await ev(`closeAllPanels()`); await wait(600);
      // 이동 스킬 재측정
      await ev(`(()=>{ens.length=0;P.mp=P.mmp;P.st=P.mst;_harpGauge=5})()`); await wait(400);
      const p0 = await ev(`({x:P.x,y:P.y,st:P.st,mst:P.mst,g:_harpGauge})`);
      await page.mouse.move(1560, 540);
      await page.keyboard.down('ShiftLeft'); await wait(700); await shot('08a_shift_hold_aim');
      await page.keyboard.up('ShiftLeft');
      const traj = [];
      for (let k = 0; k < 8; k++) { await wait(90); traj.push(await ev(`({x:Math.round(P.x),y:Math.round(P.y),h:_harpActive,d:_dashActive})`)); if (k === 1) await shot('08b_shift_chain_mid'); }
      await wait(600); await shot('08c_shift_after');
      const p1 = await ev(`({x:P.x,y:P.y,g:_harpGauge,st:P.st})`);
      L('shift', { p0, p1, dx: p1.x - p0.x, traj });
      await ev(`(()=>{P.mp=P.mmp;P.st=P.mst;_harpGauge=5})()`); await wait(300);
      const p2 = await ev(`({x:P.x,y:P.y})`);
      await page.keyboard.down('KeyA'); await wait(60); await page.keyboard.press('Space'); await wait(110); await shot('08d_dirspace_bladedash_mid');
      await page.keyboard.up('KeyA'); await wait(500); await shot('08e_bladedash_after');
      const p3 = await ev(`({x:P.x,y:P.y})`);
      L('bladeDash', { dx: p3.x - p2.x, dy: p3.y - p2.y });
      fs.writeFileSync(path.join(OUT, 'movement.json'), JSON.stringify({ shift: { p0, p1, traj }, bladeDash: { p2, p3 } }));
      // 보스: 무적 유지
      await ev(`(()=>{window.__parityGod=setInterval(()=>{try{P.hp=P.mhp;P.iframes=60}catch(e){}},50)})()`);
      await ev(`(()=>{G._fbDone=true;G._bossUnlocked=true;G._bossLoadPhase=1;G._bossLoadT=0})()`);
      for (let k = 0; k < 6; k++) { await wait(700); await shot(`10a_boss_entry_${k}`); }
      await wait(3000); await shot('10b_boss_arena_t6s');
      for (let k = 0; k < 8; k++) { await wait(800); await shot(`10c_boss_pattern_${k}`); }
      L('boss', await ev(`(()=>{const b=ens.find(e=>e.boss||e.ib||e.isBoss);return b?{x:Math.round(b.x),y:Math.round(b.y),px:Math.round(P.x),py:Math.round(P.y),hp:b.hp,r:b.r,s:b.s,st:b.state,pat:b._pat||b.pat||null}:{none:1}})()`));
      // 보스 처치: hurtE로 반복 피해
      for (let k = 0; k < 40; k++) {
        const r = await ev(`(()=>{const b=ens.find(e=>(e.boss||e.ib||e.isBoss)&&e.hp>0);if(!b)return 'dead';hurtE(b,b.mhp||b.hp,0,true);return b.hp})()`);
        if (r === 'dead' || (typeof r === 'number' && r <= 0)) break; await wait(150);
      }
      await wait(1500); await shot('11c_boss_killed');
      for (let k = 0; k < 10; k++) { await wait(600); if (await ev(`(G.exits||[]).length>0`)) break; }
      await wait(2500); await shot('11c_boss_killed_t4s');
      L('exits', await ev(`({alive:G.bossAlive,exits:(G.exits||[]).slice(0,3)})`));
      await ev(`(()=>{if(G.exits&&G.exits[0]){P.x=(G.exits[0].x+.5)*40;P.y=(G.exits[0].y+.5)*40}})()`);
      for (let k = 0; k < 6; k++) { await wait(1000); await shot(`11d_stage_clear_${k}`); }
      L('clear', await ev(`getComputedStyle(document.getElementById('stageClear')).opacity`));
    }
    if (part === 'boss2') {
      const url = fs.readFileSync(path.join(OUT, 'game_url.txt'), 'utf8').trim();
      await page.goto(url, { waitUntil: 'load' });
      for (let i = 0; i < 80; i++) {
        const s = await ev(`({on:typeof G!=='undefined'&&G.on===true,cut:typeof _cutsceneState!=='undefined'?_cutsceneState:null,intro:typeof G!=='undefined'?G._intro:null})`);
        if (s && s.on && !s.intro) break;
        if (s && s.cut === 'INTRO_CUTSCENE') await ev(`_cutsceneEnd()`); else if (s && s.intro) await page.keyboard.press('Escape');
        await wait(500);
      }
      await wait(1500);
      await ev(`(()=>{try{_parryLesson.skipAll()}catch(e){};try{_systemLesson.skipAll()}catch(e){};G.paused=false})()`);
      await wait(800);
      // Shift: 적을 조준
      await ev(`(()=>{ens.length=0;const e=mkEn(P.x+420,P.y,0,0,false,EL.P,-1);e.spd=0;ens.push(e);P.st=P.mst;_harpGauge=5})()`);
      await wait(500);
      const s0 = await ev(`({x:P.x,y:P.y})`);
      await page.mouse.move(960 + 420, 540);
      await page.keyboard.down('ShiftLeft'); await wait(700); await page.keyboard.up('ShiftLeft');
      const traj = [];
      for (let k = 0; k < 10; k++) { await wait(70); traj.push(await ev(`({x:Math.round(P.x),h:_harpActive,d:_dashActive,ph:_dashPhase})`)); if (k === 1) await shot('08f_shift_at_enemy_mid'); }
      await wait(500); await shot('08g_shift_at_enemy_after');
      const s1 = await ev(`({x:P.x,y:P.y})`);
      L('shiftEnemy', { dx: s1.x - s0.x, traj });
      fs.writeFileSync(path.join(OUT, 'movement_enemy.json'), JSON.stringify({ s0, s1, traj }));
      await ev(`ens.length=0`);
      await ev(`(()=>{window.__parityGod=setInterval(()=>{try{P.hp=P.mhp;P.iframes=60}catch(e){}},50)})()`);
      await ev(`(()=>{G._fbDone=true;G._bossUnlocked=true;G._bossLoadPhase=1;G._bossLoadT=0})()`);
      await wait(6000);
      await ev(`(()=>{const b=findBoss();if(b){P.x=b.x;P.y=b.y+380;G.cam.x=P.x;G.cam.y=P.y}})()`);
      await wait(1500); await shot('10d_boss_close');
      for (let k = 0; k < 6; k++) { await wait(700); await shot(`10e_boss_close_pattern_${k}`); }
      L('boss', await ev(`(()=>{const b=findBoss();return b?{hp:b.hp,mhp:b.mhp,s:b.s,etype:b.etype,r:b.r}:null})()`));
      for (let k = 0; k < 200; k++) {
        const r = await ev(`(()=>{const b=findBoss();const rv=ens.some(e=>e.ib&&e._reviveTimer>0);if(!b)return {dead:1,rv,alive:G.bossAlive};try{b.iframes=0;b._inv=0;hurtE(b,Math.max(1,b.hp+1),0,true)}catch(e){return {err:String(e)}};return {hp:b.hp}})()`);
        if (k % 20 === 0) L('kill', r);
        if (r && r.dead && !r.alive) break;
        if (k === 30) await shot('11c_boss_kill_progress');
        await wait(250);
      }
      await wait(1500); await shot('11c_boss_killed');
      L('exits', await ev(`({alive:G.bossAlive,exits:(G.exits||[]).slice(0,3)})`));
      await ev(`(()=>{if(G.exits&&G.exits[0]){P.x=(G.exits[0].x+.5)*40;P.y=(G.exits[0].y+.5)*40}})()`);
      for (let k = 0; k < 6; k++) { await wait(1000); await shot(`11d_stage_clear_${k}`); }
      L('clear', await ev(`getComputedStyle(document.getElementById('stageClear')).opacity`));
    }
  } catch (e) { L('FATAL', String(e.stack || e).slice(0, 500)); await shot('zz_fatal').catch(() => {}); }
  fs.writeFileSync(path.join(OUT, `log_${part}.txt`), log.join('\n'));
  await ctx.close();
})();
