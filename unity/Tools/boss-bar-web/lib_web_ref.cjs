// 웹 기준 캡처 공용 헬퍼 (headless + 음소거 + 격리 프로필 + 격리 save 서버)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = path.resolve(__dirname,'web');const PROF = path.resolve(__dirname,'profiles');
const BASE = process.env.WEBREF_BASE || 'http://127.0.0.1:3411';
const wait = ms => new Promise(r => setTimeout(r, ms));

async function launch(tag) {
  const ctx = await chromium.launchPersistentContext(path.join(PROF, tag), {
    channel: 'chrome', headless: true, ignoreDefaultArgs: ['--hide-scrollbars'], viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1,
    args: ['--mute-audio', '--autoplay-policy=no-user-gesture-required', '--window-size=1920,1080'],
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 240)));
  const ev = s => page.evaluate(s).catch(e => ({ err: String(e).slice(0, 240) }));
  return { ctx, page, errs, ev };
}

// 새 캐릭터로 시작: slot 이름을 매번 새로 쓴다.
async function boot(h, slot, extraQuery) {
  const { page, ev } = h;
  await page.goto(BASE + '/game.html?test=1&slot=' + slot + (extraQuery === 'NODEMO' ? '' : '&demo=1') + (extraQuery && extraQuery !== 'NODEMO' ? extraQuery : ''), { waitUntil: 'domcontentloaded', timeout: 90000 });
  let st = null;
  for (let i = 0; i < 120; i++) {
    st = await ev(`({on:typeof G!=='undefined'&&G.on===true,cut:typeof _cutsceneState!=='undefined'?_cutsceneState:null,intro:typeof G!=='undefined'?G._intro:null})`);
    if (st && st.on && !st.intro) break;
    if (st && st.cut === 'INTRO_CUTSCENE') await ev(`_cutsceneEnd()`);
    else if (st && st.intro) await page.keyboard.press('Escape');
    await wait(500);
  }
  await wait(1500);
  await ev(`(()=>{try{if(window._parryLesson&&_parryLesson.skipAll)_parryLesson.skipAll()}catch(e){};try{if(window._systemLesson&&_systemLesson.skipAll)_systemLesson.skipAll()}catch(e){};G.paused=false})()`);
  await wait(800);
  return st;
}

// 계산 스타일 덤프: keys = 선택자 배열(각 최대 maxPer개), tree = 루트 선택자(가시 자손 최대 maxNodes개)
const DUMP_FN = `(args)=>{
  const {keys,tree,maxPer,maxNodes}=args;
  const num=v=>Math.round(v*100)/100;
  const pick=(el)=>{
    const r=el.getBoundingClientRect(),cs=getComputedStyle(el);
    return {
      tag:el.tagName.toLowerCase(),id:el.id||undefined,cls:(typeof el.className==='string'&&el.className)?el.className.slice(0,80):undefined,
      text:(el.children.length===0?(el.textContent||'').trim().slice(0,60):undefined)||undefined,
      x:num(r.left),y:num(r.top),w:num(r.width),h:num(r.height),
      font:cs.fontFamily.slice(0,90),fs:cs.fontSize,fw:cs.fontWeight,ls:cs.letterSpacing,lh:cs.lineHeight,ta:cs.textAlign,tt:cs.textTransform==='none'?undefined:cs.textTransform,
      color:cs.color,bg:cs.backgroundColor,bgImg:cs.backgroundImage==='none'?undefined:cs.backgroundImage.slice(0,140),
      border:cs.borderTopWidth+' '+cs.borderTopStyle+' '+cs.borderTopColor,radius:cs.borderTopLeftRadius==='0px'?undefined:cs.borderTopLeftRadius,
      pad:cs.padding,op:cs.opacity==='1'?undefined:cs.opacity,shadow:cs.boxShadow==='none'?undefined:cs.boxShadow.slice(0,140),
      tshadow:cs.textShadow==='none'?undefined:cs.textShadow.slice(0,100),z:cs.zIndex==='auto'?undefined:cs.zIndex,pos:cs.position,disp:cs.display
    };
  };
  const vis=el=>{const r=el.getBoundingClientRect();const cs=getComputedStyle(el);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none'};
  const out={keys:{},tree:{}};
  for(const sel of (keys||[])){
    let list=[];try{list=[...document.querySelectorAll(sel)]}catch(e){out.keys[sel]={err:String(e)};continue}
    out.keys[sel]=list.filter(vis).slice(0,maxPer||30).map(pick);
    if(!out.keys[sel].length)out.keys[sel]={missing:true,matched:list.length};
  }
  for(const sel of (tree||[])){
    const root=document.querySelector(sel);if(!root){out.tree[sel]={missing:true};continue}
    const res=[pick(root)];
    const walker=[...root.querySelectorAll('*')];
    for(const el of walker){if(res.length>=(maxNodes||300))break;if(!vis(el))continue;if(['script','style','svg','path'].includes(el.tagName.toLowerCase()))continue;res.push(pick(el))}
    out.tree[sel]=res;
  }
  return out;
}`;
async function dump(h, keys, tree, maxPer, maxNodes) {
  return await h.page.evaluate(`(${DUMP_FN})(${JSON.stringify({ keys, tree, maxPer, maxNodes })})`)
    .catch(e => ({ err: String(e).slice(0, 240) }));
}

async function shot(h, name) {
  await h.page.screenshot({ path: path.join(OUT, name + '.png') });
}
function writeJson(name, obj) {
  fs.writeFileSync(path.join(OUT, name + '.json'), JSON.stringify(obj, null, 1));
}
module.exports = { launch, boot, dump, shot, writeJson, wait, OUT, BASE };
