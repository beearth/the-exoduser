import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function hud(file) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const fn = html.match(/function _updateActionKeys\(\)\{[\s\S]*?\n\}/)[0];
  const helper = html.match(/function _hset\(el,prop,val\)\{[^\n]+/)[0];
  const writes = [];
  const style = name => new Proxy({}, {
    set(target, prop, value) { writes.push([name, prop, value]); target[prop] = value; return true; },
  });
  let labelText = '';
  const label = { style: style('label'), get textContent() { return labelText; },
    set textContent(value) { writes.push(['label', 'text', value]); labelText = value; } };
  const rage = { style: style('rage'), querySelector: () => label };
  const slot = { style: style('slot'), _skId: 'giantSlam', querySelector: selector => selector === '._rageBar' ? rage : null };
  const sandbox = {
    P: { s: 'idle', rage: 60, skills: {} }, SKILL_SLOTS: [null, null, null, null, 'giantSlam'],
    $: id => id === 'skSlot1' ? slot : null, _rageMax: () => 100, _updateSkBarKeyLabels() {},
  };
  vm.runInNewContext(`${helper}\n${fn}`, sandbox);
  return { update: sandbox._updateActionKeys, P: sandbox.P, slot, rage, label, writes };
}

for (const file of ['game.html', 'game-easy-test.html']) {
  test(`${file}: unchanged rage HUD causes no repeated DOM writes`, () => {
    const h = hud(file); h.update(); h.writes.length = 0;
    for (let i = 0; i < 30; i++) h.update();
    assert.equal(h.writes.length, 0);
  });
  test(`${file}: rage changes and outside style changes remain visible`, () => {
    const h = hud(file); h.update(); h.P.rage = 100; h.update();
    assert.equal(h.slot.style.borderColor, '#ff2200');
    assert.equal(h.slot.style.boxShadow, 'inset 0 0 12px rgba(255,30,0,.6)');
    assert.equal(h.rage.style.height, '100%');
    assert.equal(h.label.textContent, '100%');
    h.slot.style.borderColor = '#000'; h.update();
    assert.equal(h.slot.style.borderColor, '#ff2200');
    h.P.rage = 40; h.update();
    assert.equal(h.slot.style.borderColor, '#884400');
    assert.equal(h.slot.style.boxShadow, 'none');
    assert.equal(h.label.textContent, '40%');
  });
}
