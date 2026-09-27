import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Minimal DOM adapter: run the actual composition script before a player exists.
function setup() {
  class Element {
    constructor() {
      this.children = []; this.dataset = {}; this.attrs = {}; this.events = {};
      this.classList = {add() {}};
    }
    append(...nodes) { this.children.push(...nodes); }
    setAttribute(key, value) { this.attrs[key] = value; }
    addEventListener(key, callback) { this.events[key] = callback; }
    click() { this.events.click?.(); }
    before(node) { this.beforeNode = node; }
  }
  const root = new Element(), body = new Element(), equip = new Element();
  const ossuary = new Element(), storage = new Element(), crystals = new Element();
  crystals.id = 'invCrystalsPanel';
  ossuary.id = 'invOssuaryPanel'; storage.id = 'invStorageCol';
  root.querySelector = selector => ({'.inv-wrap':body,'.inv-equip':equip})[selector];
  const nodes = {invPanel:root, invOssuaryPanel:ossuary, invStorageCol:storage, invCrystalsPanel:crystals};
  let ready = false, changes = 0;
  const context = {
    document: {readyState:'complete', createElement:() => new Element(), getElementById:id => nodes[id]},
    _invChangeCategory() {
      assert.ok(ready, 'Initial composition must not render player inventory');
      changes++;
    }
  };
  vm.runInNewContext(fs.readFileSync(new URL('../ui-panels.js', import.meta.url), 'utf8'), context);
  return {root, body, equip, ossuary, storage, crystals, start:() => {ready = true;}, changes:() => changes};
}

test('inventory composition initializes selection without rendering an uncreated player', () => {
  const ui = setup();
  assert.equal(ui.root.dataset.inventoryPage, 'equipment');
  assert.equal(ui.body.beforeNode.children[0].attrs['aria-selected'], 'true');
  assert.equal(ui.equip.attrs['aria-hidden'], 'false');
  assert.equal(ui.ossuary.attrs['aria-hidden'], 'true');
  assert.equal(ui.changes(), 0);
});

test('subsequent category changes refresh inventory once; reselecting does not', () => {
  const ui = setup(); ui.start();
  ui.body.beforeNode.children[1].click();
  assert.equal(ui.root.dataset.inventoryPage, 'ossuary');
  assert.equal(ui.ossuary.attrs['aria-hidden'], 'false');
  assert.equal(ui.changes(), 1);
  ui.body.beforeNode.children[1].click();
  assert.equal(ui.changes(), 1);
  ui.body.beforeNode.children[0].click();
  assert.equal(ui.changes(), 2);
});

test('gems have a separate inventory tab and preserve the equipment and ossuary pages', () => {
  const ui = setup(); ui.start();
  const tab = ui.body.beforeNode.children.find(node => node.dataset.page === 'crystals');
  assert.ok(tab, 'A dedicated gems tab is available');
  tab.click();
  assert.equal(ui.root.dataset.inventoryPage, 'crystals');
  assert.equal(tab.attrs['aria-controls'], 'invCrystalsPanel');
  assert.equal(ui.crystals.attrs['aria-hidden'], 'false');
  assert.equal(ui.equip.attrs['aria-hidden'], 'true');
  assert.equal(ui.ossuary.attrs['aria-hidden'], 'true');
  ui.body.beforeNode.children[0].click();
  assert.equal(ui.crystals.attrs['aria-hidden'], 'true');
  assert.equal(ui.equip.attrs['aria-hidden'], 'false');
});
