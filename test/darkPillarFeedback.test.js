import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const html = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
function fn(name) {
  const start = html.indexOf(`function ${name}(`);
  if (start < 0) return '';
  let depth = 0;
  for (let i = html.indexOf('{', start); i < html.length; i++) {
    if (html[i] === '{') depth++;
    if (html[i] === '}' && --depth === 0) return html.slice(start, i + 1);
  }
}
test('standalone pillars stay visible without additive light stacking', () => {
  const start = html.indexOf("}else if(fz.type==='darkPillar'){", html.indexOf('// 기둥 2레이어'));
  const end = html.indexOf("}else if(fz.type==='storm'||fz.type==='boneStorm'){", start);
  const body = html.slice(html.indexOf('{', start) + 1, end);
  for (const fused of [false, true]) {
    const draws = [], stack = [];
    const X = { globalAlpha: 1, globalCompositeOperation: 'source-over',
      save() { stack.push([this.globalAlpha, this.globalCompositeOperation]); },
      restore() { [this.globalAlpha, this.globalCompositeOperation] = stack.pop(); },
      drawImage(...args) { draws.push({ alpha: this.globalAlpha, blend: this.globalCompositeOperation, args }); } };
    const ctx = vm.createContext({ X, fz: { x: 0, y: 0, r: 125, t: 40, _pillarSpike: fused },
      _now: 0, _dtSp: 1, _fzFade: 1, _MM_EXP_FRAMES: 9,
      _MM_EXP_IMGS: Array.from({ length: 9 }, () => ({ complete: true, naturalWidth: 768 })) });
    vm.runInContext(fn('_drawDarkPillar') + body, ctx);
    assert.equal(draws.length, 1);
    assert.ok(draws[0].alpha >= .6, 'standalone pillar must not be almost transparent');
    assert.equal(draws[0].blend, 'source-over');
  }
});
test('standalone cast creates one pillar and eight delayed pillars with one summon sound', () => {
  const calls = [], noop = () => {};
  const ctx = vm.createContext({ P: { x: 0, y: 0, skills: { darkPillar: 1 } }, G: {}, EL: { D: 3 },
    magicRef: () => 20, statInt: () => 1, pMagicMul: () => 1, _skMul: () => 4,
    _isFused: () => false, _cdRed: () => 0, _addSkProf: noop, addTxt: noop, shake: noop,
    _T: s => s, _r: x => x, playSample: (...a) => calls.push(['sample', ...a]),
    playNoise: (...a) => calls.push(['noise', ...a]), playSub: (...a) => calls.push(['sub', ...a]),
    SFX: { magic: () => calls.push(['genericMagic']) } });
  vm.runInContext(fn('_playDarkPillarCastSound') + fn('activateDarkPillar'), ctx);
  ctx.activateDarkPillar();
  assert.equal(ctx.G._fireZones.length, 1);
  assert.equal(ctx.G._dpQueue.length, 8);
  assert.equal(ctx.G._fireZones[0].maxT, 300);
  assert.equal(ctx.G._fireZones[0].dmg, 80);
  assert.equal(ctx.G._fireZones[0].r, 125);
  assert.deepEqual(Array.from(ctx.G._dpQueue, q => q.delay), [10,20,30,40,50,60,70,80]);
  assert.equal(calls.filter(c => c[0] === 'genericMagic').length, 0);
  assert.equal(calls.filter(c => c[0] === 'sample' && c[1] === 'heavy_hit').length, 1);
  assert.equal(calls.filter(c => c[0] === 'sub').length, 1);
  assert.equal(calls.filter(c => c[0] === 'noise').length, 1);
});
