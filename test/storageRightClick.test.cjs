const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

for (const file of ['game.html', 'game-easy-test.html']) {
  const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  function setup() {
    const item = {name:'test blade',slot:'weapon'};
    const store = [];
    const panel = {dataset:{inventoryPage:'storage'}};
    const calls = {render:0,save:0,persist:0,sound:0,equip:0,stats:0,bone:0,notices:[]};
    const context = vm.createContext({
      INV:{bag:[item],selected:0}, STORAGE_MAX:2, _getStore:()=>store,
      $:id=>id==='invPanel'?panel:null, _T:s=>s,
      notify:s=>calls.notices.push(s), SFX:{pickup:()=>calls.sound++},
      _persistSharedStorage:()=>calls.persist++, renderInv:()=>calls.render++,
      dbSaveNow:()=>calls.save++, equipItem:()=>calls.equip++,
      applyStats:()=>calls.stats++, registerBonePart:()=>calls.bone++
    });
    const start = html.indexOf('function depositStorage(');
    assert.ok(start >= 0, `${file} must expose storage deposit behavior`);
    const end = html.indexOf('function withdrawStorage(', start);
    assert.ok(end > start);
    vm.runInContext(html.slice(start, end), context);
    return {context,item,store,panel,calls};
  }

  test(`${file}: right-click in storage deposits one bag item and saves it`, () => {
    const {context,item,store,calls} = setup();
    context._invBagRightClick(0);
    assert.equal(context.INV.bag.length, 0);
    assert.equal(store[0], item);
    assert.equal(context.INV.selected, null);
    assert.equal(calls.persist, 1);
    assert.equal(calls.save, 1);
    assert.equal(calls.render, 1);
    assert.equal(calls.equip, 0);
  });

  test(`${file}: full storage and other inventory tabs keep their original behavior`, () => {
    const {context,item,store,panel,calls} = setup();
    store.push({}, {});
    context._invBagRightClick(0);
    assert.equal(context.INV.bag[0], item);
    assert.equal(calls.save, 0);
    assert.equal(calls.notices.length, 1);
    panel.dataset.inventoryPage = 'equipment';
    context._invBagRightClick(0);
    assert.equal(calls.equip, 1);
    assert.equal(calls.stats, 1);
    context.INV.bag[0] = {slot:'bonePart'};
    context._invBagRightClick(0);
    assert.equal(calls.bone, 1);
  });
}
