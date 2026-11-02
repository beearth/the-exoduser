// Regression for CTO 2026-11-02: CSS flags alone are not proof that a stamp was painted.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('G:/exoduser/node_modules/playwright');
const root=path.resolve(__dirname,'..'),out=process.env.TRANSITION_OUTPUT||'I:/EXODUSER-Storage/codex-takeover/transitions/r2';
fs.mkdirSync(out,{recursive:true});process.env.TEMP=out;process.env.TMP=out;
(async()=>{const b=await chromium.launch({headless:true,args:['--mute-audio']});const c=await b.newContext({viewport:{width:1920,height:1080}}),p=await c.newPage();try{
 await p.goto('http://127.0.0.1:3462/index.html?test=1',{waitUntil:'networkidle'});
 const observed=await p.evaluate(async()=>{
  const samples=[];let running=true;const start=performance.now();
  function tick(){if(!running)return;const el=document.querySelector('#screenLoadingSigil');samples.push({ms:performance.now()-start,cover:+getComputedStyle(document.querySelector('#screenTransition')).opacity,sigil:+getComputedStyle(el).opacity});requestAnimationFrame(tick);}tick();
  await ScreenTransition.withLoading(()=>new Promise(r=>setTimeout(r,100)));running=false;return samples;
 });
 fs.writeFileSync(out+'/visibility-regression.json',JSON.stringify(observed));
 assert.ok(observed.some(f=>f.cover>.99&&f.sigil>.3),'a short preparation inside a long black transition must paint the sigil');
 for(const width of [1920,3840]){await p.setViewportSize({width,height:1080});await p.evaluate(()=>ScreenTransition.fadeOut());await p.waitForTimeout(650);await p.screenshot({path:out+'/stamp-visible-'+width+'.png'});await p.evaluate(()=>ScreenTransition.fadeIn());}
 const early=await b.newContext();await early.addInitScript(()=>sessionStorage.setItem('exoduser:screen-transfer:v1',String(Date.now()-600)));
 await early.route('**/screen-transition.js*',r=>r.abort());await early.route('**/screen-transition.css*',r=>r.abort());
 const q=await early.newPage();await q.goto('http://127.0.0.1:3462/game.html?test=1',{waitUntil:'commit'});await q.waitForSelector('#screenLoadingSigil',{state:'attached'});
 const boot=await q.locator('#screenLoadingSigil').evaluate(e=>({opacity:+getComputedStyle(e).opacity,background:getComputedStyle(e).backgroundImage}));
 assert.ok(boot.opacity>.3&&boot.background.includes('data:image/'),'first HTML paints the inherited sigil without external JS/CSS/image');
 await early.close();console.log('visible sigil + inline navigation regression PASS');
}finally{await c.close();await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
