const test=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');

test('death screen opens immediately; replay waits for View and returns to death screen',async()=>{
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  try{
    const page=await browser.newPage();
    await page.route('**/*',route=>{
      const req=route.request();
      if(req.method()!=='GET'||['image','media','font'].includes(req.resourceType()))return route.abort();
      return route.continue();
    });
    await page.goto('http://localhost:3333/game.html',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>typeof _fallenResolve==='function'&&typeof INV==='object');
    await page.evaluate(()=>{
      _startIntroCutscene=()=>{};_startIntro=()=>{};hideBootLoading();
      const frame=document.createElement('canvas');frame.width=480;frame.height=270;
      frame._hp=0;frame._mhp=100;frame._st=0;frame._mst=100;frame._mp=0;frame._mmp=100;
      _drBuf=[frame];_drIdx=1;_drLen=1;
      P._fallenCanRevive=false;G.paused=true;_fallenResolve();
    });
    assert.equal(await page.locator('#death').evaluate(el=>el.classList.contains('on')),true);
    assert.equal(await page.locator('#deathReplay').evaluate(el=>el.classList.contains('on')),false);
    const button=page.locator('#deathReplayBtn');
    assert.equal(await button.isEnabled(),true);
    await button.click();
    assert.equal(await page.locator('#deathReplay').evaluate(el=>el.classList.contains('on')),true);
    await page.waitForTimeout(1600);
    await page.locator('#deathReplay').click({position:{x:100,y:100}});
    assert.equal(await page.locator('#deathReplay').evaluate(el=>el.classList.contains('on')),false);
    assert.equal(await page.locator('#death').evaluate(el=>el.classList.contains('on')),true);
    await page.evaluate(()=>{
      _drReset();P.s='fallen';P._fallenCanRevive=false;_fallenResolve();
    });
    assert.equal(await button.isEnabled(),false);
    assert.equal(await page.locator('#death').evaluate(el=>el.classList.contains('on')),true);
    assert.equal(await page.locator('#deathReplay').evaluate(el=>el.classList.contains('on')),false);
  }finally{await browser.close()}
});
