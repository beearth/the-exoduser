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
