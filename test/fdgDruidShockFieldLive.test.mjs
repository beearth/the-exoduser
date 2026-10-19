import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('../game.html', import.meta.url), 'utf8');
const helper = html.match(/function _fdgDruidDecorAlpha\([^]*?\n\}/)[0];
const marker = "}else if(fz.type==='shockField'){";
const start = html.indexOf(marker, html.indexOf('function drawP')) + marker.length;
const body = html.slice(start, html.indexOf("}else if(fz.type==='darkPillar'){", start));

function render(active, age, life = 12) {
  const draw = [], stroke = [], stack = [];
  const X = {
    globalAlpha: 1, globalCompositeOperation: 'source-over',
    save() { stack.push(this.globalAlpha); },
    restore() { this.globalAlpha = stack.pop(); },
    translate() {}, rotate() {}, scale() {}, beginPath() {}, moveTo() {}, lineTo() {},
    drawImage(img, ...args) { draw.push({ image: img.id, alpha: this.globalAlpha, args }); },
    stroke() { stroke.push({ color: this.strokeStyle, alpha: this.globalAlpha, width: this.lineWidth }); },
  };
  const fz = { type: 'shockField', x: 2580, y: 2330, r: 120, t: age, maxT: 600,
    dmg: 116, defRed: .1, _spr: { f0: 1, f1: 3, f2: 2, sc: 2, rot: .2, flip: 1 },
    _thunder: [{ life, maxLife: 18, baseW: 20, pts: [{ x: 1, y: 1 }, { x: 2, y: 2 }],
      br: [[{ x: 3, y: 3 }, { x: 4, y: 4 }]] }] };
  const context = { X, fz, Math: Object.assign(Object.create(Math), { random: () => .25 }),
    _fzProg: age / 600, _fdgDruidLiveContactFix: active,
    _msStormImg1: { id: 'primary', width: 512, height: 512 },
    _msStormImg2: { id: 'decor', width: 512, height: 512 },
    _msStormImg3: { id: 'core', width: 255, height: 255 } };
  vm.runInNewContext(helper + '\n' + body, context);
  return { draw, stroke, fz: JSON.parse(JSON.stringify(fz)) };
}

test('actual consumer preserves every first-eight-tick draw', () => {
  assert.deepEqual(render(true, 8, 17), render(false, 8, 17));
});

test('actual late decoration consumes .12 gain and keeps core and primary', () => {
  const native = render(false, 33), fixed = render(true, 33);
  assert.equal(fixed.draw[1].alpha, .102);
  assert.deepEqual(fixed.draw[0], native.draw[0]);
  assert.deepEqual(fixed.draw[2], native.draw[2]);
  assert.deepEqual(fixed.draw[1].args, native.draw[1].args);
});

test('confirmed long colored line fades while white core and branches stay native', () => {
  const native = render(false, 33, 2), fixed = render(true, 33, 2);
  assert.ok(Math.abs(fixed.stroke[0].alpha / native.stroke[0].alpha - .12) < 1e-12);
  assert.deepEqual(fixed.stroke.slice(1), native.stroke.slice(1));
  assert.equal(fixed.stroke[0].width, native.stroke[0].width);
});

test('native expiration fade remains and geometry, damage, age, lifetime are identical', () => {
  const native = render(false, 570), fixed = render(true, 570);
  assert.ok(Math.abs(fixed.draw[1].alpha / native.draw[1].alpha - .12) < 1e-12);
  assert.deepEqual(fixed.fz, native.fz);
  assert.equal(fixed.fz._thunder[0].life, 11);
});

test('actual consumer has no live observation hook or broad rendering replacement', () => {
  assert.doesNotMatch(html, /FDG_LIVE_(?:POLY|IMAGE|SHOCK_DECOR)/);
  assert.equal(body.match(/_fdgDruidDecorAlpha/g).length, 2);
});

test('all classic inline scripts compile', () => {
  let count = 0;
  for (const match of html.matchAll(/<script\b([^>]*)>([^]*?)<\/script>/gi)) {
    if (/type\s*=\s*["'](?:module|importmap)["']|src\s*=/.test(match[1])) continue;
    new vm.Script(match[2]); count++;
  }
  assert.ok(count > 0);
});
