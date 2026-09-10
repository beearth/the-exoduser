import test, {before, after, beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';

const html=fs.readFileSync(new URL('../game.html',import.meta.url),'utf8');
const slots=html.match(/const _SK_SLOTS=\[[\s\S]*?\n\];/)[0];
const update=html.match(/function _updateSkBarKeyLabels\(\)\{[\s\S]*?\n\}/)[0];
const art=fs.readFileSync(new URL('../img/ui_bar_only.png',import.meta.url)).toString('base64');
let browser,page;
before(async()=>{browser=await chromium.launch({channel:'chrome',headless:true});page=await browser.newPage({viewport:{width:1280,height:720}});});
after(async()=>{await browser?.close();});
beforeEach(async()=>{
  await page.goto('about:blank');
  await page.route('**/*',route=>route.abort());
  await page.evaluate(({html,art})=>{
    const parsed=new DOMParser().parseFromString(html,'text/html');
    for(const style of parsed.querySelectorAll('style'))document.head.append(document.importNode(style,true));
    const bar=document.importNode(parsed.getElementById('skBar'),true);
    document.body.append(bar);
    bar.style.cssText=`opacity:1;bottom:0;background-image:url(data:image/png;base64,${art})`;
  },{html,art});
  await page.addScriptTag({content:`let _gpActive=false,_skBarKeyMode='';const BINDS={shield:'KeyE',beam:'mouse2'};const $=id=>document.getElementById(id);const keyName=code=>code.replace('Key','');${slots}\n${update}`});
});

test('pad labels cover the baked keyboard row under all 13 skill slots',async()=>{
  await page.evaluate('_gpActive=true;_updateSkBarKeyLabels()');
  const result=await page.locator('#skKeyBar').evaluate(row=>({
    top:row.offsetTop,labels:[...row.children].map(e=>e.textContent),
    caps:[...row.children].every(e=>e.offsetHeight>=18&&getComputedStyle(e).backgroundImage!=='none')
  }));
  assert.equal(result.top,121,'pad prompts must replace the bottom keyboard row, not cover skill icons');
  assert.deepEqual(result.labels,['LT+A','LT+B','LT+Y','LT+X','LT','RT','A','RS','LB','X','Y','RB','B']);
  assert.equal(result.caps,true,'opaque keycaps must hide keyboard text baked into the art');
});

test('pad to keyboard transition restores keyboard caps and keeps stable DOM on repeated updates',async()=>{
  await page.evaluate('_gpActive=true;_updateSkBarKeyLabels();window.firstCap=$("skKeyBar").firstElementChild;_updateSkBarKeyLabels()');
  assert.equal(await page.evaluate('firstCap===$("skKeyBar").firstElementChild'),true);
  await page.evaluate('_gpActive=false;_updateSkBarKeyLabels()');
  assert.deepEqual(await page.locator('#skKeyBar>div').allTextContents(),['RMB','E']);
  await page.evaluate('BINDS.shield="KeyV";_updateSkBarKeyLabels()');
  assert.deepEqual(await page.locator('#skKeyBar>div').allTextContents(),['RMB','V']);
});

test('a temporarily missing label row does not consume the next mode update',async()=>{
  await page.evaluate('window.savedRow=$("skKeyBar");savedRow.remove();_gpActive=true;_updateSkBarKeyLabels();$("skBar").append(savedRow);_updateSkBarKeyLabels()');
  assert.equal(await page.locator('#skKeyBar>div').count(),13);
});
