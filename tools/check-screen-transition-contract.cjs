const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('G:/exoduser/node_modules/playwright');
const root=path.resolve(__dirname,'..'),out='I:/EXODUSER-Storage/codex-takeover/transitions';process.env.TEMP=out;process.env.TMP=out;
(async()=>{const b=await chromium.launch({headless:true,args:['--mute-audio']}),c=await b.newContext(),p=await c.newPage();const rows=[];try{
 await p.setContent('<html><head><style>#screenTransition{position:fixed;inset:0;opacity:0;background:#000;z-index:2147483647}html[data-screen-cover] #screenTransition{opacity:1}#screenLoadingSigil{position:fixed}</style></head><body><div id="screenTransition"></div><span id="screenLoadingSigil"></span><button id="action">Action</button></body></html>');
 await p.addStyleTag({path:path.join(root,'screen-transition.css')});await p.addScriptTag({path:path.join(root,'screen-transition.js')});
 const result=await p.evaluate(async()=>{
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));ScreenTransition.reduceMotion=true;let observed=false;const obs=new MutationObserver(()=>{if(document.documentElement.hasAttribute('data-screen-loading'))observed=true;});obs.observe(document.documentElement,{attributes:true});await ScreenTransition.withLoading(()=>sleep(80));obs.disconnect();const fastHidden=!observed&&getComputedStyle(document.querySelector('#screenLoadingSigil')).opacity==='0';
  let calls=0;const a=ScreenTransition.withLoading(async()=>{calls++;await sleep(500);return 17;});const b=ScreenTransition.withLoading(()=>calls++);await sleep(450);const slowVisible=document.documentElement.hasAttribute('data-screen-loading');const value=await a;await b;
  let blackAtWork=0;const pendingFade=ScreenTransition.fadeOut();await ScreenTransition.withLoading(()=>{blackAtWork=+getComputedStyle(document.querySelector('#screenTransition')).opacity;});await pendingFade;
  let caught=false;try{await ScreenTransition.withLoading(()=>Promise.reject(Error('controlled failure')));}catch{caught=true;}
  const released=caught&&!ScreenTransition.busy&&!document.documentElement.hasAttribute('data-screen-cover');
  const previous=location.href;await ScreenTransition.navigate('/must-not-navigate',()=>false);const cancellation=location.href===previous&&!ScreenTransition.busy&&!document.documentElement.hasAttribute('data-screen-cover');
  let clicked=0;document.querySelector('#action').onclick=()=>clicked++;document.querySelector('#action').click();
  return{blackBeforeMutation:blackAtWork>=.995,fastHidden,slowVisible,once:calls===1,value,released,cancellation,inputRestored:clicked===1};
 });for(const [name,ok]of Object.entries(result)){assert.ok(name==='value'?ok===17:ok,name);rows.push({name,pass:true});}
 await p.emulateMedia({reducedMotion:'reduce'});await p.evaluate(()=>{ScreenTransition.loading(true);});await p.waitForTimeout(400);const reduced=await p.locator('#screenLoadingSigil').evaluate(e=>({animation:getComputedStyle(e).animationName,opacity:getComputedStyle(e).opacity}));assert.equal(reduced.animation,'none');assert.equal(reduced.opacity,'0.65');rows.push({name:'reduced motion static sigil',pass:true});
 for(const width of [1920,2560,3840]){await p.setViewportSize({width,height:1080});await p.evaluate(()=>ScreenTransition.fadeOut());const r=await p.locator('#screenTransition').boundingBox();assert.deepEqual(r,{x:0,y:0,width,height:1080});rows.push({name:'full cover '+width,pass:true});}
 // Execute the existing decision bus in a real browser, instrumenting only gain schedules.
 await p.addInitScript(()=>{});await p.route('**/sfx/**',r=>r.abort());await p.addScriptTag({path:path.join(root,'decision-sound.js')});
 const gain=await p.evaluate(()=>{const targets=[];const original=AudioParam.prototype.linearRampToValueAtTime;AudioParam.prototype.linearRampToValueAtTime=function(v,t){targets.push(v);return original.call(this,v,t);};const a=new Audio();DecisionSound.attachMusic(a);DecisionSound.setTransitionGain(0,500);DecisionSound.setTransitionGain(1,600);AudioParam.prototype.linearRampToValueAtTime=original;return targets;});assert.deepEqual(gain,[0,1]);rows.push({name:'existing audio gain fades 0 then 1',pass:true});
 console.log(JSON.stringify({pass:rows.length,rows}));fs.writeFileSync(path.join(out,'contract-browser.json'),JSON.stringify({rows,result,reduced,gain},null,2));
 }finally{await c.close();await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
