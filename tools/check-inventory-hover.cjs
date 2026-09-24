// Run against node server.cjs on port 3333. Isolated browser; all writes blocked.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try{
  const page=await browser.newPage();
  await page.route('**/*',route=>{
   const request=route.request();
   if(request.method()!=='GET'||['image','media','font'].includes(request.resourceType()))return route.abort();
   return route.continue();
  });
  await page.goto('http://localhost:3333/game.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof INV==='object'&&typeof openPanel==='function');
  // Isolate inventory from the delayed new-game cinematic (no gameplay/save setup).
  await page.evaluate(()=>{_startIntroCutscene=()=>{};_startIntro=()=>{};hideBootLoading()});
  const failures=[];
  let checked=0;
  for(const viewport of [{width:1280,height:720},{width:1920,height:1080},{width:900,height:900}]){
   await page.setViewportSize(viewport);
   await page.mouse.move(0,0);
   await page.evaluate(()=>{INV.selected=null;_invClearHover();openPanel('invPanel')});
   const targets=await page.locator('#invEqGrid .inv-eq-item').evaluateAll(nodes=>nodes.map(n=>n.dataset.slot));
   for(const slot of targets){
    await page.mouse.move(0,0);
    const el=page.locator('#invEqGrid [data-slot="'+slot+'"]');
    const box=await el.boundingBox();
    if(!box||box.y<0||box.y+box.height>viewport.height)continue;
    for(const bottom of [false,true]){
     await page.mouse.move(0,0);
     await el.evaluate(n=>{window.__hoverLeaves=0;n.onmouseleaveOriginal=n.onmouseleave;n.onmouseleave=function(e){window.__hoverLeaves++;return this.onmouseleaveOriginal?.(e)}});
     const x=box.x+box.width/2,y=bottom?box.y+box.height-.2:box.y+box.height/2;
     await page.mouse.move(x,y);
     await page.waitForTimeout(240);
     const result=await page.evaluate(({x,y,slot})=>({
      slot,leaves:window.__hoverLeaves,
      hit:document.elementFromPoint(x,y)?.closest('[data-slot]')?.dataset.slot,
      blocker:document.elementFromPoint(x,y)?.outerHTML.slice(0,220),
      detail:!!document.querySelector('#invRight .item-detail')
     }),{x,y,slot});
     checked++;
     if(result.leaves||result.hit!==slot||!result.detail){failures.push({viewport,bottom,...result});if(failures.length===1)await page.screenshot({path:'tmp/inventory-hover-failure.png'});}
     await el.evaluate(n=>{n.onmouseleave=n.onmouseleaveOriginal});
    }
   }
   await page.mouse.move(0,0);
   const bags=page.locator('#invGrid .inv-item');
   for(let i=0;i<await bags.count();i++){
    const el=bags.nth(i);await el.scrollIntoViewIfNeeded();
    const box=await el.boundingBox();
    const x=box.x+box.width/2,y=box.y+box.height/2;
    await page.mouse.move(x,y);await page.waitForTimeout(120);
    const stable=await el.evaluate((n,{x,y})=>n.contains(document.elementFromPoint(x,y))&&!!document.querySelector('#invRight .item-detail'),{x,y});
    checked++;if(!stable)failures.push({viewport,bag:i});
    await page.mouse.move(0,0);
   }
   await page.evaluate(()=>{document.querySelector('.inv-wrap').scrollTop=0;INV.selected=null;_invClearHover()});
   await page.evaluate(fs.readFileSync(path.join(__dirname,'check-inventory-hover-layout.js'),'utf8'));
   await page.mouse.move(0,0);
   await page.evaluate(()=>{INV.selected='eq:weapon';renderInv()});
   assert.notEqual(await page.locator('#invRight').evaluate(n=>getComputedStyle(n).pointerEvents),'none','Selected detail must remain interactive');
  }
  console.log(JSON.stringify({checked,failed:failures.length,failures:failures.slice(0,12)},null,2));
  assert.equal(failures.length,0,'Hover must retain the item hit target and detail without repeated mouseleave');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
