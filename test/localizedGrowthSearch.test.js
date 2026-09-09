import test, {before, after, beforeEach, afterEach} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const html=fs.readFileSync(new URL('../game.html',import.meta.url),'utf8');
const declaration=html.match(/const PASSIVE_DEF=\[[\s\S]*?\n\];/)[0];
const passiveDefs=vm.runInNewContext(declaration+';PASSIVE_DEF');
const translations=Object.assign({},...['ui','ui-extra','ui-growth'].map(dir=>
  JSON.parse(fs.readFileSync(new URL(`../localization/${dir}/de.json`,import.meta.url),'utf8'))));
let browser,page;

before(async()=>{browser=await chromium.launch({headless:true,...(process.env.GROWTH_TEST_BROWSER_CHANNEL?{channel:process.env.GROWTH_TEST_BROWSER_CHANNEL}:{})});});
after(async()=>{await browser?.close();});
beforeEach(async()=>{
  page=await browser.newPage();
  // Mount the real panel markup and renderer without running the game or save APIs.
  await page.route('**/*',route=>route.abort());
  await page.evaluate(source=>{
    const doc=new DOMParser().parseFromString(source,'text/html');
    document.body.append(document.importNode(doc.getElementById('statPanel'),true));
    document.getElementById('statPanel').classList.add('on');
  },html);
  await page.addStyleTag({path:fileURLToPath(new URL('../stat-panel-ui.css',import.meta.url))});
  await page.addScriptTag({path:fileURLToPath(new URL('../lang_de.js',import.meta.url))});
  await page.addScriptTag({path:fileURLToPath(new URL('../stat-panel-ui.js',import.meta.url))});
  await page.evaluate(({passiveDefs,translations})=>{
    const table={..._DE,...translations};
    const state={stats:{},grit:0,passives:Object.fromEntries(passiveDefs.map(d=>[d.key,0])),sp:10,ap:10};
    const panel=ExoduserStatsPanel.mount({
      root:document.getElementById('statPanel'),passiveDefs,statDefs:[],caps:{},
      text:(ko,en)=>table[ko]||en||ko,strip:text=>text,icon:()=>'',state:()=>state,
      applyPlan:()=>{throw new Error('Search must not apply allocations');}
    });
    panel.render();
  },{passiveDefs,translations});
});
afterEach(async()=>{await page?.close();});

async function search(query){
  await page.locator('#growthSearch').fill(query);
  return page.locator('[data-passive]').evaluateAll(cards=>cards.map(card=>card.dataset.passive));
}

test('German effect labels find the passive whose detail displays them',async()=>{
  await page.locator('[data-passive="pMagic"]').click();
  assert.ok((await page.locator('#growthDetail').innerText()).includes('MP-Kostensenkung'));
  assert.deepEqual(await search('  MP-KOSTENSENKUNG  '),['pMagic']);
});

test('translated passive descriptions are searchable',async()=>{
  assert.ok(translations[passiveDefs.find(d=>d.key==='pMagic').desc].includes('Zaubertempo'));
  assert.deepEqual(await search('Zaubertempo'),['pMagic']);
});

test('Korean and English names and IDs remain searchable in a German panel',async()=>{
  for(const query of ['마력폭주','Mana Surge','pMagic']){
    assert.deepEqual(await search(query),['pMagic'],query);
  }
});

test('localized search still respects path filters and recovers after no match',async()=>{
  await page.locator('[data-path="assault"]').click();
  assert.deepEqual(await search('MP-Kostensenkung'),[]);
  await page.locator('[data-path="arcane"]').click();
  assert.deepEqual(await search('MP-Kostensenkung'),['pMagic']);
  assert.deepEqual(await search('no_such_passive_123'),[]);
  assert.equal(await page.locator('.growth-empty').count(),1);
  assert.deepEqual((await search('')).sort(),['pMRegen','pMagic','pVital']);
});

test('hover previews effects without changing selection or spending points',async()=>{
  const detail=await page.locator('#growthDetail').innerText();
  await page.locator('[data-passive="pMagic"]').hover();
  const preview=page.locator('#growthNodePreview');
  await preview.waitFor({state:'visible'});
  assert.match(await preview.innerText(),/MP-Kostensenkung/);
  assert.equal(await page.locator('#growthDetail').innerText(),detail);
  assert.equal(await page.locator('#growthApply').isDisabled(),true);
  const box=await preview.boundingBox(),viewport=await page.locator('#growthTreeViewport').boundingBox();
  assert.ok(box.x>=viewport.x&&box.y>=viewport.y&&box.x+box.width<=viewport.x+viewport.width+1&&box.y+box.height<=viewport.y+viewport.height+1);
});

test('pending ledger follows allocations and restores a filtered selection',async()=>{
  await page.locator('[data-passive="pMagic"]').click();
  await page.locator('#growthUpgrade').click();
  await page.locator('[data-path="assault"]').click();
  const entry=page.locator('#growthDraftList [data-draft-key="pMagic"]');
  await entry.waitFor({state:'visible'});
  assert.match(await entry.innerText(),/0 → 1/);
  await entry.click();
  assert.equal(await page.locator('[data-passive="pMagic"]').getAttribute('aria-pressed'),'true');
  await page.locator('#growthCancel').click();
  assert.equal(await page.locator('#growthDraftList').isHidden(),true);
  assert.equal(await page.locator('#growthApply').isDisabled(),true);
});

test('previews stay inside a narrow tree and clear when focus leaves',async()=>{
  await page.setViewportSize({width:960,height:720});
  for(const key of ['pMagic','pRage','pPierce','pMalice']){
    const node=page.locator(`[data-passive="${key}"]`);
    await node.hover();
    const tooltip=page.locator('#growthNodePreview');
    assert.equal(await tooltip.isVisible(),true);
    const b=await tooltip.boundingBox(),v=await page.locator('#growthTreeViewport').boundingBox(),n=await node.boundingBox();
    assert.ok(b.x>=v.x&&b.y>=v.y&&b.x+b.width<=v.x+v.width+1&&b.y+b.height<=v.y+v.height+1,key);
    assert.ok(b.x+b.width<=n.x||b.x>=n.x+n.width||b.y+b.height<=n.y||b.y>=n.y+n.height,key+' covered by preview');
    assert.equal(await node.getAttribute('aria-describedby'),'growthNodePreview');
  }
  await page.locator('#growthSearch').focus();
  await page.keyboard.press('Tab');
  await page.locator('[data-passive="pMagic"]').focus();
  assert.equal(await page.locator('#growthNodePreview').isVisible(),true);
  await page.locator('#growthSearch').focus();
  assert.equal(await page.locator('#growthNodePreview').isHidden(),true);
  assert.equal(await page.locator('#growthApply').isDisabled(),true);
});
