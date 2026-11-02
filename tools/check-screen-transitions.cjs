// Real-page muted transition receipts. Uses only an isolated server and browser storage.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {chromium}=require(process.env.EXODUSER_TOOLS_PACKAGE||'G:/exoduser/node_modules/playwright');
const root=path.resolve(__dirname,'..'),out=process.env.TRANSITION_OUTPUT||'I:/EXODUSER-Storage/codex-takeover/transitions';
const phase=process.argv[2]||'after',width=Number(process.argv[3]||1920),height=1080;
const gameOnly=String(process.argv[4]||'').startsWith('game');
const dir=path.join(out,phase+'-'+width+(gameOnly?'-'+process.argv[4]:'')),base='http://127.0.0.1:3462';fs.mkdirSync(dir,{recursive:true});
process.env.TEMP=out;process.env.TMP=out;
const receipt={phase,width,height,source:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),errors:[],rows:[],fixture:'격리 DEMO 생성·실제 UI. 끝부분 seek, 스테이지/사망 상태 fixture는 행에 표시. 자연 전체 완주 아님.'};
receipt.inputs=Object.fromEntries(['index.html','game.html','screen-transition.js','screen-transition.css'].map(f=>[f,require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')]));
const save=()=>fs.writeFileSync(path.join(dir,'receipt.json'),JSON.stringify(receipt,null,2));
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--mute-audio'],env:{...process.env,TEMP:out,TMP:out}});
 const ctx=await browser.newContext({viewport:{width,height},recordVideo:{dir:path.join(dir,'raw'),size:{width,height}}});
 await ctx.addInitScript(()=>{localStorage.setItem('hellLang','ko');localStorage.setItem('hellcave_settings',JSON.stringify({opt:{bgmVol:0,sfxVol:0}}));});
 if(phase==='before')await ctx.route('**/*',async route=>{const u=new URL(route.request().url()),f=u.pathname.slice(1)||'index.html';if(['index.html','game.html','world-intro-player.js','character-story-player.js','decision-sound.js'].includes(f))return route.fulfill({body:fs.readFileSync(path.join(out,'backup',f)),contentType:f.endsWith('.html')?'text/html':'application/javascript'});return route.continue();});
 const created=Date.now(),page=await ctx.newPage(),movie=page.video();page.on('pageerror',e=>receipt.errors.push(e.message));
 async function idle(){if(phase!=='before')await page.waitForFunction(()=>!ScreenTransition.busy,{timeout:20000});}
 async function segment(name,action,note=''){
   await idle();await page.screenshot({path:path.join(dir,name+'-before.png')});
   const start=Date.now()-created;await page.evaluate(()=>{window.__transitionFrames=[];window.__transitionMonitor=true;let began=performance.now();function tick(t){if(!window.__transitionMonitor)return;const el=document.getElementById('screenTransition'),r=el?.getBoundingClientRect();window.__transitionFrames.push({ms:t-began,opacity:el?+getComputedStyle(el).opacity:0,loading:document.documentElement.hasAttribute('data-screen-loading'),full:!!r&&r.x===0&&r.y===0&&r.width===innerWidth&&r.height===innerHeight});requestAnimationFrame(tick);}requestAnimationFrame(tick);});
   const at=Date.now();await action();const elapsed=Date.now()-at;if(elapsed<10200)await page.waitForTimeout(10200-elapsed);
   await page.screenshot({path:path.join(dir,name+'-after.png')});
   const frames=await page.evaluate(()=>{window.__transitionMonitor=false;return window.__transitionFrames||[];}).catch(()=>[]);
   const black=frames.filter(f=>f.opacity>=.995);const row={name,startMs:start,seconds:10,note,frames:frames.length,blackMs:black.length>1?black.at(-1).ms-black[0].ms:0,intermediate:frames.some(f=>f.opacity>.02&&f.opacity<.98),uncoveredEdges:frames.filter(f=>f.opacity>.01&&!f.full).length,sigil:frames.some(f=>f.loading),url:page.url()};
   fs.writeFileSync(path.join(dir,name+'-frames.json'),JSON.stringify(frames));receipt.rows.push(row);save();console.log(name+' '+JSON.stringify(row));
 }
 try{
  if(!gameOnly){
  await page.goto(base+'/index.html?test=1',{waitUntil:'networkidle'});await page.waitForSelector('#splashTitleMenu .stm-btn',{state:'visible'});
  await segment('01-title-gate',()=>page.getByRole('menuitem',{name:'게임 시작',exact:true}).click());
  await segment('02-gate-world',()=>page.locator('.cin-enter-btn').click());
  await segment('03-world-skip',async()=>{await page.keyboard.down('Escape');await page.waitForTimeout(5400);await page.keyboard.up('Escape');},'실제 5초 홀드 스킵');
  await segment('04-menu-lobby',()=>page.locator('#demoEnterBtn').click());
  await segment('05-character-select',()=>page.evaluate(()=>openVisualSelect()));
  await page.locator('#visualCreateBtn').click();await idle();await page.locator('#charName').fill('전환'+width);
  await segment('06-create-story',()=>page.locator('#createBtn').click());
  await segment('07-story-game',()=>page.evaluate(()=>ExoduserCharacterStory.skip()),'공개 story.skip API; 실제 생성 슬롯·페이지 이동');
  }else await page.goto(base+'/game.html?test=1&slot=demo&demo=1&stage=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof _bootLoadActive!=='undefined'&&!_bootLoadActive,null,{timeout:90000});await idle();
  await page.evaluate(()=>{_cutsceneState=null;if(typeof _cutC!=='undefined')_cutC.style.display='none';G.on=true;G._cutsceneDone=true;P.iframes=999999;document.querySelector('#introKeys').style.display='none';closeAllPanels(true);});
  await page.evaluate(()=>{G.stage=1;document.querySelector('#demoEnd').style.display='none';});
  await segment('08-stage-next',()=>page.evaluate(()=>{showStageTransition(()=>{nextStage();P.iframes=999999;});}),'기존 nextStage 콜백, 클리어 상태 fixture');
  await idle();await page.evaluate(()=>{document.querySelector('#demoEnd').style.display='none';G._cutsceneDone=true;G.on=true;P.hp=0;die();});await page.waitForTimeout(500);
  await segment('09-death-retry',async()=>{await page.locator('#retryBtn').click();await page.waitForFunction(()=>G.on&&!globalThis.ScreenTransition?.busy,null,{timeout:20000});receipt.retryState=await page.evaluate(()=>{P.iframes=999999;return{on:G.on,hp:P.hp,mhp:P.mhp,death:document.querySelector('#death').classList.contains('on')};});if(receipt.retryState.hp<=0||receipt.retryState.death)throw Error('Retry failed');},'die() 사망 fixture·실제 재시작 버튼·재사망을 막는 iframe fixture');
  await idle();await segment('10-game-lobby',()=>page.evaluate(()=>{goToLobby();}));
  receipt.final=await page.evaluate(()=>({url:location.href,overflow:document.documentElement.scrollWidth>innerWidth,cover:document.documentElement.dataset.screenCover,busy:globalThis.ScreenTransition?.busy}));
 }catch(e){receipt.errors.push(e.stack||String(e));console.error(e);}
 finally{await ctx.close();receipt.raw=await movie.path();save();await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
