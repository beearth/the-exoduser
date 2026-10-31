import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const sourceRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sizes=[[1920,1080],[2560,1080],[3840,1080],[2560,1600]];
export async function textGeometry(page,selector){
 return page.evaluate(selector=>{
  const roots=[...document.querySelectorAll(selector)],items=[];
  for(const root of roots){
   const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
   while(n=walk.nextNode()){
    if(!n.textContent.trim()||n.parentElement.closest('script,style'))continue;
    const ancestors=[];for(let e=n.parentElement;e;e=e.parentElement)ancestors.push(e);
    if(ancestors.some(e=>{const c=getComputedStyle(e);return c.display==='none'||c.visibility==='hidden'||+c.opacity===0}))continue;
    const range=document.createRange();range.selectNodeContents(n);
    for(const a of range.getClientRects()){
     const b={left:Math.max(0,a.left),right:Math.min(innerWidth,a.right),top:Math.max(0,a.top),bottom:Math.min(innerHeight,a.bottom)};
     for(const e of ancestors){if(e===document.body||e===document.documentElement)break;const c=getComputedStyle(e);if(/auto|scroll|hidden|clip/.test(c.overflowX+' '+c.overflowY)){const k=e.getBoundingClientRect();b.left=Math.max(b.left,k.left);b.right=Math.min(b.right,k.right);b.top=Math.max(b.top,k.top);b.bottom=Math.min(b.bottom,k.bottom)}}
     if(b.right>b.left&&b.bottom>b.top)items.push({n,text:n.textContent.trim().slice(0,100),...b});
    }
   }
  }
  const overlaps=[];
  for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){
   const a=items[i],b=items[j];if(a.n===b.n)continue;
   const x=Math.min(a.right,b.right)-Math.max(a.left,b.left),y=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);
   if(x>2&&y>3)overlaps.push({a:a.text,b:b.text,x,y});
  }
  return {texts:items.length,overlaps};
 },selector);
}
export async function captureMatrix({lobby,game,output}){
 await fs.mkdir(output,{recursive:true});const rows=[];
 async function capture(page,name,selectors,edges=[]){
  await page.bringToFront();await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(650);
  const viewport=page.viewportSize(),file=name+'-'+viewport.width+'x'+viewport.height+'.png';
  let text=await textGeometry(page,selectors);
  for(let retry=0;!text.texts&&retry<12;retry++){await page.waitForTimeout(250);text=await textGeometry(page,selectors);}
  const geometry=await page.evaluate(selectors=>Object.fromEntries(selectors.map(selector=>{const e=document.querySelector(selector);if(!e)return[selector,null];const visual=e.querySelector('.globe-glass')||e;const r=visual.getBoundingClientRect(),s=getComputedStyle(e);return[selector,{...r.toJSON(),visible:r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'&&+s.opacity>0}]})),edges);
  await page.screenshot({path:path.join(output,file)});rows.push({screen:name,...viewport,file,...text,geometry});
 }
 const clean=()=>game.evaluate(()=>{
  _closeNextDiffPop();const tutorial=document.getElementById('tutorial');if(tutorial.style.opacity==='1')tutorial.click();document.getElementById('death').getAnimations().forEach(a=>a.cancel());document.getElementById('death').style.display='none';P.hp=P.mhp;window._parryLesson?.finish();if(window._systemLesson?.panel){window._systemLesson.closed=true;window._systemLesson.panel.hidden=true;}
  closeAllPanels(true);G.on=true;G.paused=true;
  for(const id of ['tutorial','introKeys','introDiff','stageClear','nextDiffPop','death','stageTransition','demoEnd','lvUpScreen','notif','ph','petSubtitle']){const e=document.getElementById(id);if(e){e.style.opacity='0';e.style.pointerEvents='none';}}
  const guide=document.getElementById('keyGuide');if(guide)guide.style.display='none';
  for(const id of ['hud','hudTop','hudCorner','mmWrap','mmLvl','globeHP','globeMP','skBar'])document.getElementById(id)?.classList.add('on');
 });
 for(const [width,height]of sizes){
  await lobby.setViewportSize({width,height});await game.setViewportSize({width,height});
  await lobby.evaluate(()=>{document.getElementById('charVisualPop').style.display='none';document.getElementById('createModal').classList.remove('show');});
  await capture(lobby,'lobby','#lobby .lobby-right',['#lobby .lobby-right']);
  await lobby.locator('.char-item-new').click();await capture(lobby,'charselect','#csLeft,#csRight,.cs-foot,.cs-head',['#csLeft','#csRight','.cs-foot','.cs-head']);
  await lobby.locator('#visualCreateBtn').click();await capture(lobby,'name','#createModal',['#createModal .create-modal-inner']);
  await lobby.locator('#createCancelBtn').click();await lobby.evaluate(()=>document.getElementById('charVisualPop').style.display='none');
  await clean();await capture(game,'hud','#mmLvl,#hudCorner,#skBar',['#mmWrap','#mmLvl','#hudCorner','#globeHP','#globeMP','#skBar']);
  await game.evaluate(()=>{window._parryLesson.start();G.paused=true;_petBubbleShow('cat','오른쪽 안내창과 겹치지 않는 가장자리 대화');});
  await capture(game,'practice','#parryLesson,#mmLvl,#petSubtitle',['#parryLesson','#mmLvl','#globeHP','#globeMP','#skBar','#petSubtitle']);
  await game.locator('#parryLesson .lesson-content').evaluate(e=>e.scrollTop=e.scrollHeight);
  await capture(game,'practice-scroll','#parryLesson,#mmLvl',['#parryLesson','.lesson-footer','#globeMP']);
  await clean();await game.evaluate(()=>{const s=window._systemLesson;if(!s.panel)s.build();s.active=true;s.collapsed=false;s.panel.hidden=false;s.render();_petBubbleShow('cat','시스템 안내와 겹치지 않는 가장자리 대화');});
  await capture(game,'system-guide','#systemLesson,#mmLvl,#petSubtitle',['#systemLesson','#mmLvl','#globeMP','#petSubtitle']);
  await clean();await game.evaluate(()=>{const e=document.getElementById('keyGuide');e.style.display='block';});
  await capture(game,'key-guide','#keyGuide,#mmLvl',['#keyGuide','#mmLvl','#globeMP']);
  await clean();await game.evaluate(()=>{_petBubbleShow('crow','전투와 함께 읽을 수 있는 가장자리 대화');const e=document.getElementById('notif');e.textContent='가장자리 알림 배치 확인';e.style.opacity='1';});
  await capture(game,'notification','#notif,#petSubtitle,#hudCorner',['#notif','#petSubtitle','#hudCorner']);
  for(const id of ['settings','invPanel','skillPanel','forge','statPanel']){
   await clean();await game.evaluate(id=>{togglePanel(id);if(id==='forge'){G.forgeTab='upgrade';renderForge();}},id);
   if(id==='settings')await game.locator('#settings-tab-game').click();if(id==='invPanel')await game.locator('#inventory-tab-equipment').click();
   await capture(game,id,'#'+id+' .pbox',['#'+id+' .pbox']);
   if(id==='settings')for(const tab of ['display','audio','controls']){await game.locator('#settings-tab-'+tab).click();await capture(game,'settings-'+tab,'#settings .pbox',['#settings .pbox']);}
   if(id==='invPanel'){await game.locator('#inventory-tab-storage').click();await capture(game,'storage','#invPanel .pbox',['#invPanel .pbox']);}
   if(id==='forge'){await game.evaluate(()=>{G.forgeTab='potion';renderForge();});await capture(game,'shop','#forge .pbox',['#forge .pbox']);}
  }
  await clean();await game.keyboard.press('Escape');await capture(game,'pause','#settings .pbox',['#settings .pbox']);
  await clean();await game.evaluate(()=>{_showClearResult();const e=document.getElementById('stageClear');e.style.opacity='1';e.style.pointerEvents='auto';});await capture(game,'clear','#stageClear',['#stageClear']);
  await clean();await game.evaluate(()=>_showNextDiffPop());await capture(game,'difficulty','#nextDiffPop',['#nextDiffPop .nd-inner']);
  await clean();await game.evaluate(()=>showTutorial());await capture(game,'tutorial','#tutorial',['#tutorial']);
 }
 const failures=[];
 const overlap=(a,b)=>a&&b&&a.visible&&b.visible&&Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1;
 for(const row of rows){
  if(!row.texts)failures.push({screen:row.screen,width:row.width,height:row.height,kind:'empty-capture'});
  if(row.overlaps.length)failures.push({screen:row.screen,width:row.width,height:row.height,kind:'text',overlaps:row.overlaps});
  const g=row.geometry;
  if(row.screen==='lobby'&&Math.abs(g['#lobby .lobby-right'].right-row.width)>1)failures.push({...row,kind:'lobby-edge'});
  if(row.screen==='charselect')for(const id of ['#csLeft','#csRight','.cs-foot'])if(Math.abs(g[id].right-(row.width-40))>1)failures.push({screen:row.screen,width:row.width,kind:'character-edge',id});
  if(row.screen==='hud'){
   if(g['#mmWrap'].left>32||row.width-g['#mmLvl'].right>40)failures.push({screen:row.screen,width:row.width,kind:'hud-edge'});
   if(Math.abs((g['#globeHP'].left+g['#globeMP'].right)/2-row.width/2)>1)failures.push({screen:row.screen,width:row.width,kind:'hud-center'});
  }
  if(['practice','system-guide','key-guide'].includes(row.screen)){
   const guide=g[row.screen==='practice'?'#parryLesson':row.screen==='system-guide'?'#systemLesson':'#keyGuide'];
   if(!g['#mmLvl'].visible)failures.push({screen:row.screen,width:row.width,kind:'status-hidden'});
   for(const id of ['#mmLvl','#globeHP','#globeMP','#skBar','#petSubtitle'])if(overlap(guide,g[id]))failures.push({screen:row.screen,width:row.width,kind:'component-overlap',id});
   if(guide.top<0||guide.bottom>row.height)failures.push({screen:row.screen,width:row.width,kind:'guide-offscreen'});
  }
  if(row.screen==='notification'&&overlap(g['#notif'],g['#petSubtitle']))failures.push({screen:row.screen,width:row.width,kind:'notification-pet-overlap'});
 }
 const result={sizes,mode:'실제 index.html·game.html 1-1, 독립 테스트 캐릭터·강제 UI 표시·게임 일시정지. 자연 플레이 증거와 구분.',rows,failures};
 await fs.writeFile(path.join(output,'geometry.json'),JSON.stringify(result,null,2));return result;
}
export async function run(output,url='http://127.0.0.1:3366'){
 const browser=await chromium.launch({headless:true,args:['--mute-audio']});
 try{
  const context=await browser.newContext({viewport:{width:1920,height:1080},reducedMotion:'reduce'});
  await context.route('**/api/save**',route=>route.fulfill({json:{ok:true,qa:true}}));await context.route('**/api/slots',route=>route.fulfill({json:{slots:[]}}));
  const errors=[];context.on('page',page=>page.on('pageerror',error=>errors.push(error.message)));
  const lobby=await context.newPage();await lobby.goto(url+'/index.html',{waitUntil:'networkidle'});await lobby.locator('#splashTitleMenu').waitFor({state:'visible'});await fs.mkdir(output,{recursive:true});
  for(const [width,height]of sizes){await lobby.setViewportSize({width,height});await lobby.waitForTimeout(250);await lobby.screenshot({path:path.join(output,'title-'+width+'x'+height+'.png')});}
  await lobby.locator('#splashTitleMenu .stm-btn').first().click();await lobby.locator('#demoEnterBtn').click();await lobby.locator('#lobby').waitFor({state:'visible'});
  const game=await context.newPage();await game.goto(url+'/game.html?forgelab=1&stage=0',{waitUntil:'domcontentloaded'});await game.waitForFunction(()=>typeof G!=='undefined'&&G.stage===0&&!_bootLoadActive&&P&&P.lv>=500,null,{timeout:180000});await game.waitForTimeout(500);
  const result=await captureMatrix({lobby,game,output});result.errors=errors;
  const files=['index.html','game.html','lobby-silver-hell.css','charselect-silver-hell.css','web-uiux.css','web-uiux.js','ui-foundation.css','ui-refinement.css','ui-quiet-tier.css','skill-forge.css','skill-forge.js','stat-panel-ui.css','stat-panel-ui.js','system-lesson.js','parry-lesson.css','parry-lesson.js','ui-panels.js'];result.source={};
  for(const file of files){const disk=await fs.readFile(path.join(sourceRoot,file)),http=Buffer.from(await(await fetch(url+'/'+file)).arrayBuffer());const sha=data=>createHash('sha256').update(data).digest('hex');result.source[file]={disk:sha(disk),http:sha(http),match:sha(disk)===sha(http)};}
  await fs.writeFile(path.join(output,'geometry.json'),JSON.stringify(result,null,2));return result;
 }finally{await browser.close();}
}
if(typeof process!=='undefined'&&process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const result=await run(path.resolve(process.argv[2]||'I:/EXODUSER-Storage/design/web-sidepanel-20261031/matrix'),process.argv[3]);
 console.log(JSON.stringify({captures:result.rows.length+sizes.length,failures:result.failures,errors:result.errors,source:result.source},null,2));
 if(result.failures.length||result.errors.length||Object.values(result.source).some(x=>!x.match))process.exitCode=1;
}
