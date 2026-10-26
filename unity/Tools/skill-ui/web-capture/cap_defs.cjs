// PC-U05(A12): 웹 스킬 창을 "Unity 상태 미러"로 만들어 정의·배치·3D 바탕을 추출한다.
// Unity 상태 = 기검참만 습득·LMB 장착(Lv 1), 나머지 슬롯은 모두 비어 있음. 웹 시작 스냅샷 값은 쓰지 않는다.
// 사용: node cap_defs.cjs <out-dir>   (서버 3404: cwd G:/exoduser, PORT=3404 EXODUSER_SAVE_DIR=... node server.cjs)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = process.argv[2];
const BASE = 'http://127.0.0.1:3404';
const wait = ms => new Promise(r => setTimeout(r, ms));

const HIDE_CSS = `
#skillPanel .panel-nav,#skillPanel .sf-slot-key,#skillPanel .sf-slot-name,#skillPanel .sf-slot-disc>*,
#skillPanel .sf-info>*,#skillPanel .sf-road>*,#skillPanel .sf-field,#skillPanel .sf-core>*,#skillPanel .sf-core-name,#skillPanel .sf-core-star,
#skillPanel .sf-nodes,#skillPanel .sf-altar-hint,#skillPanel .sf-altar-btns,#skillPanel .sf-field-head,#skillPanel .skill-close *,#skillPanel .skill-close{visibility:hidden!important}
#skillPanel .skill-close{background:none!important;border-color:transparent!important}`;

// 슬롯별 DOM 덤프: 구슬(정의+배치), 정보판·로드맵·안내 문구
const SLOT_DUMP = `(()=>{
  const q=(s,r)=>(r||document).querySelector(s), qa=(s,r)=>[...(r||document).querySelectorAll(s)];
  const R=e=>{if(!e)return null;const r=e.getBoundingClientRect();return {x:+r.x.toFixed(2),y:+r.y.toFixed(2),w:+r.width.toFixed(2),h:+r.height.toFixed(2)}};
  const T=e=>e?e.textContent.trim():'';
  const altar=q('#skillPanel .sf-altar'),ar=altar.getBoundingClientRect();
  const orbs=qa('#skillPanel .sf-orb').map(o=>{
    const img=q('img',o);const st=o.style;
    return {id:o.dataset.skId,cls:[...o.classList].filter(c=>c!=='sf-orb'),x:parseFloat(st.left),y:parseFloat(st.top),
      o:parseFloat(st.getPropertyValue('--o')),lw:parseFloat(st.getPropertyValue('--lw')),lg:parseFloat(st.getPropertyValue('--lg')),
      name:T(q('.sf-orb-name',o)),host:!!q('.sf-orb-host',o),subt:T(q('.sf-orb-subt',o)),icon:img?img.getAttribute('src'):'',
      nameRect:R(q('.sf-orb-name',o)),subRect:R(q('.sf-orb-sub',o)),hostRect:R(q('.sf-orb-host',o))};});
  const info=q('#skillPanel .sf-info');
  return {altar:R(altar),orbs,
    fieldHead:{title:T(q('#skillPanel .sf-field-title')),sub:T(q('#skillPanel .sf-field-sub')),rect:R(q('#skillPanel .sf-field-head')),titleRect:R(q('#skillPanel .sf-field-title')),subRect:R(q('#skillPanel .sf-field-sub'))},
    core:{rect:R(q('#skillPanel .sf-core')),cls:q('#skillPanel .sf-core').className,name:T(q('#skillPanel .sf-core-name')),nameRect:R(q('#skillPanel .sf-core-name'))},
    hint:{text:T(q('#skillPanel .sf-altar-hint')),rect:R(q('#skillPanel .sf-altar-hint'))},
    infoText:T(info).slice(0,400),infoEmpty:T(q('.sf-info-empty',info)),
    road:qa('#skillPanel .sf-road > *').map(e=>({cls:e.className,txt:T(e),rect:R(e)})),
    slotButtons:qa('#skillPanel .sf-slot').map(b=>({cls:b.className,key:T(q('.sf-slot-key',b)),name:T(q('.sf-slot-name',b)),rect:R(b),disc:R(q('.sf-slot-disc',b)),keyRect:R(q('.sf-slot-key',b)),nameRect:R(q('.sf-slot-name',b))}))};
})()`;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const ctx = await chromium.launchPersistentContext(path.join(OUT, 'profile-defs'), {
    channel: 'chrome', headless: true, viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1,
    ignoreDefaultArgs: ['--hide-scrollbars'],
    args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--window-size=1920,1080'],
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message.slice(0, 200)));
  const ev = s => page.evaluate(s).catch(e => ({ err: String(e).slice(0, 300) }));
  await page.goto(BASE + '/game.html?test=1&slot=demo&demo=1', { waitUntil: 'load' });
  for (let i = 0; i < 120; i++) {
    const st = await ev(`({on:typeof G!=='undefined'&&G.on===true,cut:typeof _cutsceneState!=='undefined'?_cutsceneState:null,intro:typeof G!=='undefined'?G._intro:null})`);
    if (st && st.on && !st.intro) break;
    if (st && st.cut === 'INTRO_CUTSCENE') await ev(`_cutsceneEnd()`);
    else if (st && st.intro) await page.keyboard.press('Escape');
    await wait(500);
  }
  await wait(1500);
  await ev(`(()=>{try{if(window._parryLesson&&_parryLesson.skipAll)_parryLesson.skipAll()}catch(e){};try{if(window._systemLesson&&_systemLesson.skipAll)_systemLesson.skipAll()}catch(e){};G.paused=false})()`);
  await wait(800);
  await ev(`closeAllPanels()`); await wait(500);

  // 정의(웹 런타임)는 그대로 두고, "상태"만 Unity 미러로 바꾼다: 기검참 Lv1만 습득, LMB에 장착, 나머지 슬롯 비움
  const stateLmb = `(()=>{for(let i=0;i<SKILL_SLOTS.length;i++)SKILL_SLOTS[i]=null;ULT_SLOT=null;for(const v of ['activeLMBSk','activeRMBSk','activeChargeSk','activeMagicSk','activeQSk','activeCtSk'])P[v]=null;P.skills={kiSlash:1};P.activeLMBSk='kiSlash';return 1})()`;
  const stateNone = `(()=>{for(let i=0;i<SKILL_SLOTS.length;i++)SKILL_SLOTS[i]=null;ULT_SLOT=null;for(const v of ['activeLMBSk','activeRMBSk','activeChargeSk','activeMagicSk','activeQSk','activeCtSk'])P[v]=null;P.skills={};return 1})()`;
  const select = async i => { await ev(`(()=>{const st=SkillForge._state;st.slot=${i};st.staged=[];st.sel=null;SkillForge.render()})()`); await wait(1800); };

  await ev(`openPanel('skillPanel')`); await wait(2500);
  await ev(stateLmb); await select(6);
  const full = {};
  full.lmbShot = path.join(OUT, 'web_skill_state_lmb.png');
  await page.screenshot({ path: full.lmbShot });

  // 슬롯 13개 덤프 (상태 = LMB 기검참만)
  const slots = [];
  for (let i = 0; i < 13; i++) {
    await select(i);
    const d = await ev(SLOT_DUMP);
    slots.push({ index: i, ...d });
    await page.screenshot({ path: path.join(OUT, `web_state_slot${String(i).padStart(2, '0')}.png`) });
  }
  // 정보판(선택 = LMB 기검참) 계산 스타일은 기존 덤프 사용. 스킬 정의(이름·설명·아이콘)
  const ids = [...new Set(slots.flatMap(s => s.orbs.map(o => o.id)).concat(['kiSlash']))];
  const defs = await ev(`(()=>{const out={};for(const id of ${JSON.stringify(ids)}){const x=_skById(id);let name=id,desc='';
    if(x){name=x.name;desc=x.desc||''}else{for(const d of Object.values(SKILL_SLOT_DEFS)){if(d.info&&d.info[id]){name=_skN?_skN(d.info[id]):d.info[id].name;desc=_skD?_skD(d.info[id]):'';break}}}
    const m=/src="([^"]+)"/.exec(_skIcon(id)||'');out[id]={name,desc,icon:m?m[1]:'',host:!!(typeof _FUSE_PAIRS!=='undefined'&&Object.keys(_FUSE_PAIRS).some(k=>(_FUSE_PAIRS[k]||[])[0]===id))};}
    return out})()`);
  // 슬롯 정의(키·종류·들어갈 수 있는 스킬 목록)는 위 덤프의 orbs 가 곧 정의
  fs.writeFileSync(path.join(OUT, 'web_skill_defs_raw.json'), JSON.stringify({ slots, defs, ids }, null, 1));

  // ── 3D 바탕 캡처: 동적 DOM 숨김 ──
  await page.addStyleTag({ content: HIDE_CSS });
  // (a) 상태 없음, 선택 = 슬롯 1(빈 슬롯) → 빈 원판 + 선택 테
  await ev(stateNone); await select(1);
  await page.screenshot({ path: path.join(OUT, 'web_static_none_sel1.png') });
  await select(2);
  await page.screenshot({ path: path.join(OUT, 'web_static_none_sel2.png') });
  // (b) LMB 장착, 선택 = LMB → 핵 아이콘 + LMB 원판(선택)
  await ev(stateLmb); await select(6);
  await page.screenshot({ path: path.join(OUT, 'web_static_lmb_sel6.png') });
  // (c) LMB 장착, 선택 = 슬롯 1 → LMB 원판(비선택)
  await select(1);
  await page.screenshot({ path: path.join(OUT, 'web_static_lmb_sel1.png') });
  console.log(JSON.stringify({ slots: slots.length, ids: ids.length, pageerrors: errs }));
  await ctx.close();
})();
