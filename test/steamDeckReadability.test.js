import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright';
import * as deck from '../tools/steamdeck-package.mjs';
const html=fs.readFileSync(new URL('../game.html',import.meta.url),'utf8');
const slots=html.match(/const _SK_SLOTS=\[[\s\S]*?\n\];/)[0];
const update=html.match(/function _updateSkBarKeyLabels\(\)\{[\s\S]*?\n\}/)[0];
let browser;
before(async()=>{browser=await chromium.launch({channel:'chrome',headless:true});});
after(async()=>{await browser?.close();});
test('Deck keycaps remain at least 9px after HUD scaling and fit each slot',async()=>{
  assert.equal(typeof deck.handheldStyles,'function','Deck package needs responsive keycap styles');
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  await page.route('**/*',r=>r.abort());
  await page.evaluate(html=>{
    const parsed=new DOMParser().parseFromString(html,'text/html');
    for(const style of parsed.querySelectorAll('style'))document.head.append(document.importNode(style,true));
    document.body.append(document.importNode(parsed.getElementById('skBar'),true));
    document.documentElement.style.setProperty('--ui-auto-scale','0.6667');
    document.getElementById('skBar').style.opacity='1';
  },html);
  await page.addStyleTag({content:deck.handheldStyles()});
  await page.addScriptTag({content:`let _gpActive=true,_skBarKeyMode='';const BINDS={shield:'KeyE',beam:'mouse2'};const $=id=>document.getElementById(id);const keyName=x=>x;${slots}\n${update}\n_updateSkBarKeyLabels();`});
  const caps=await page.locator('#skKeyBar>div').evaluateAll(es=>es.map(e=>{
    const r=e.getBoundingClientRect(),scale=r.height/e.offsetHeight;
    const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');ctx.font=getComputedStyle(e).font;
    return {label:e.textContent,pixels:parseFloat(getComputedStyle(e).fontSize)*scale,textWidth:ctx.measureText(e.textContent).width,slotWidth:e.clientWidth};
  }));
  assert.equal(caps.length,13);
  for(const cap of caps){assert.ok(cap.pixels>=9,JSON.stringify(cap));assert.ok(cap.textWidth<=cap.slotWidth,JSON.stringify(cap));}
  await page.setViewportSize({width:1920,height:1080});
  assert.equal(await page.locator('#skKeyBar>div').first().evaluate(e=>getComputedStyle(e).fontSize),'8px','desktop size preserved');
  await page.close();
});
