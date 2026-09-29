import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function restoredRenderer(file, opt = { resScale: 60 }, renderRes = null) {
  const html = readFileSync(new URL('../' + file, import.meta.url), 'utf8');
  const resize = html.match(/function rz\(\)\{[\s\S]*?\n\}/)[0];
  const preset = html.match(/function _loadPreset\(slot\)\{[\s\S]*?\n\}/)[0];
  const start = html.indexOf('// 게임 시작 시 자동 불러오기');
  const bootstrap = html.slice(start, html.indexOf("if($('resetBtn'))", start));
  const canvas = () => ({ width: 0, height: 0, style: {} });
  const C = canvas(), CT = canvas(), burst = canvas(), msg = { style: {} };
  const stored = new Map([['hellcave_settings', JSON.stringify({ opt: { ...opt, diffV2: 1 } })]]);
  const viewport = [];
  let bakes = 0;
  const context = vm.createContext({
    C, CT, X: null, GL: { viewport: (...args) => viewport.push(args) }, _bGL: null,
    innerWidth: 5626, innerHeight: 2524, IS_MOBILE: false,
    _MAP_QA_HIDPI: false, _dpr: 1, _ssaa: 1, VW: 0, VH: 0, _renderRes: renderRes,
    _lastRw: 0, _lastRh: 0, _lastCssW: '', _lastCssH: '',
    _fogCvs: null, _fogBotCvs: null, _fogTopCvs: null,
    document: { getElementById: id => id === 'burstCvs' ? burst : null },
    OPT: { resScale: 100, lang: 'ko', atmos: 2, fpsCap: 0, cursor: 0 },
    BINDS: {}, BINDS2: {}, _xbowEquipped: false,
    localStorage: { getItem: key => stored.get(key) ?? null },
    ExoduserI18n: { resolveLanguage: lang => lang || null }, BGM: { setVol() {} },
    _repairChainAttackBinds() {}, applyUIScale() {}, syncSettingsUI() {},
    renderSettings() {}, _applyCursor() {}, saveSettings() {},
    _bakeVignette() { bakes++; }, $: () => msg, _L: (ko, en) => ko, _T: text => text,
    setTimeout() {},
  });
  vm.runInContext(resize + '\n' + preset, context);
  context.rz();
  vm.runInContext(bootstrap, context);
  return { context, C, CT, burst, stored, viewport, bakes: () => bakes };
}

for (const file of ['game.html', 'game-easy-test.html']) {
  test(file + ': startup restores saved 60 percent to all render surfaces', () => {
    const r = restoredRenderer(file);
    assert.equal(r.context.OPT.resScale, 60);
    for (const c of [r.C, r.CT, r.burst]) assert.deepEqual([c.width, c.height], [3374, 1514]);
    assert.deepEqual([r.context.VW, r.context.VH], [3374, 1514]);
    assert.deepEqual(r.viewport.at(-1), [0, 0, 3374, 1514]);
    assert.equal(r.C.style.width, '5626px');
    assert.equal(r.C.style.height, '2524px');
  });
  test(file + ': preset changes actual render size while keeping CSS viewport', () => {
    const r = restoredRenderer(file);
    r.stored.set('hellcave_preset_2', JSON.stringify({ opt: { resScale: 100 } }));
    r.context._loadPreset(2);
    assert.deepEqual([r.C.width, r.C.height], [5626, 2524]);
    r.stored.set('hellcave_preset_2', JSON.stringify({ opt: { resScale: 70 } }));
    r.context._loadPreset(2);
    assert.deepEqual([r.C.width, r.C.height], [3938, 1766]);
    assert.deepEqual([r.CT.width, r.burst.width], [3938, 3938]);
    assert.equal(r.C.style.width, '5626px');
  });
  test(file + ': saved scale also applies to explicit package render resolution', () => {
    const r = restoredRenderer(file, { resScale: 60 }, { w: 1920, h: 1080 });
    assert.deepEqual([r.C.width, r.C.height], [1152, 648]);
    assert.equal(r.C.style.width, '100vw');
    assert.equal(r.C.style.height, '100vh');
  });
  test(file + ': restoring unchanged scale does not rebuild render surfaces', () => {
    const r = restoredRenderer(file, { resScale: 100 });
    assert.deepEqual([r.C.width, r.C.height], [5626, 2524]);
    assert.equal(r.bakes(), 1);
  });
}
