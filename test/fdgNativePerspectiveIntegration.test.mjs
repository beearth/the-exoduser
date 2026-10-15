import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { createWorldProjection, WORLD_CAMERA_DEFAULTS } from '../engine/fdg/world-camera.js';
import { isNativePerspectiveEntry, nativePointerTarget, nativeScreenFacing, installNativePerspectiveQa } from '../engine/fdg/native-perspective-qa.js';
import { createNativeWorldProjection } from '../engine/fdg/native-world-projection.js';

const game = await readFile(new URL('../game.html', import.meta.url), 'utf8');
const near = (actual, expected, epsilon = 1e-9) => assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} != ${expected}`);
// Extract changed consumers without running native bootstrap or adding a parser dependency.
function bodyEnd(start) {
  const brace = game.indexOf('{', start);
  let depth = 0, quote = '', comment = '';
  for (let i = brace; i < game.length; i++) {
    const c = game[i], n = game[i + 1];
    if (comment === 'line') { if (c === '\n') comment = ''; continue; }
    if (comment === 'block') { if (c === '*' && n === '/') { comment = ''; i++; } continue; }
    if (quote) { if (c === '\\') i++; else if (c === quote) quote = ''; continue; }
    if (c === '/' && n === '/') { comment = 'line'; i++; continue; }
    if (c === '/' && n === '*') { comment = 'block'; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') depth++;
    if (c === '}' && --depth === 0) return i + 1;
  }
  assert.fail('Unterminated native consumer body');
}
function functionSource(name) {
  const start = game.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `Missing native consumer ${name}`);
  const source = game.slice(start, bodyEnd(start));
  new vm.Script(`(${source})`);
  return source;
}
function methodSource(name) {
  const start = game.indexOf(`${name}(`);
  assert.ok(start >= 0, `Missing native method ${name}`);
  const source = game.slice(start, bodyEnd(start));
  new vm.Script(`({${source}})`);
  return source;
}
function nativeContext(extra = {}) {
  return { Math, Number, URLSearchParams, window: {}, _gpActive: false, _EDITOR_MODE: false, _DEMO_MODE: false,
    _DEMO_LAST_STAGE: 3, G: { stage: 0, cam: { x: 4000, y: 7400 }, _camZoom: .5 },
    VW: 1280, VH: 720, mouse: { _screenX: 850, _screenY: 480, x: 12, y: 34 },
    _fdgNativePerspective: null, ...extra };
}

test('native loader installs only through the existing active r4 gate and exact perspective entry', async () => {
  const start = game.lastIndexOf('<script type="module">'), end = game.indexOf('</script>', start);
  const loader = game.slice(start + '<script type="module">'.length, end)
    .replace(/\bimport\(/g, '_import(');
  for (const [active, search, expected] of [[false, '?fdgPerspective=first', false],
    [undefined, '?fdgPerspective=first', false], [true, '', false],
    [true, '?fdgPerspective=second', false], [true, '?fdgPerspective=FIRST', false],
    [true, '?fdgPerspective=first', true]]) {
    assert.equal(isNativePerspectiveEntry(active, search), expected);
    let imports = 0, installations = 0;
    const result = { active: false };
    const context = nativeContext({ location: { search },
      window: { _FDGDruidQaStorage: { active } }, console, _FDG_RUINED_FOREST_FIRST: false,
      _import: async () => { imports++; return { installNativePerspectiveQa(options) {
        installations++; assert.equal(typeof options.getView, 'function');
        assert.equal(typeof options.getState, 'function'); return result;
      } }; } });
    vm.runInNewContext(loader, context);
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(imports, Number(expected)); assert.equal(installations, Number(expected));
    assert.equal(context._fdgNativePerspective, expected ? result : null);
    assert.equal(context.window._FDGNativePerspectiveQa, expected ? result : undefined);
  }
});

test('ground pointer inverse preserves native world target and attack atan2 across camera changes', () => {
  const viewport = { width: 1280, height: 720 }, center = { x: 4010, y: 7410 };
  const player = { x: 4048, y: 7513 }, target = { x: 4270, y: 7290 };
  const expected = Math.atan2(target.y - player.y, target.x - player.x);
  for (const projection of ['perspective', 'orthographic']) for (const yaw of [-.7, 0, .785])
    for (const pitch of [.6, .85, 1.1]) for (const zoom of [.5, 1.5]) {
      const p = createWorldProjection({ ...WORLD_CAMERA_DEFAULTS, projection, yaw, pitch, zoom }, center, viewport);
      const screen = p.project(target.x, target.y), pointer = nativePointerTarget(p, screen.x, screen.y, center, viewport);
      assert.ok(pointer); near(pointer.world.x, target.x); near(pointer.world.y, target.y);
      // Native consumers reconstruct world XY from virtual-screen mouse coordinates.
      near(pointer.x + center.x - viewport.width / 2, target.x);
      near(pointer.y + center.y - viewport.height / 2, target.y);
      near(Math.atan2(pointer.y - (player.y - center.y + viewport.height / 2),
        pointer.x - (player.x - center.x + viewport.width / 2)), expected);
    }
  const p = createWorldProjection(WORLD_CAMERA_DEFAULTS, center, viewport);
  const horizon = viewport.height / 2 - WORLD_CAMERA_DEFAULTS.distance * Math.tan(WORLD_CAMERA_DEFAULTS.pitch);
  assert.equal(nativePointerTarget(p, viewport.width / 2, horizon, center, viewport), null);
});

test('native mouse sync retains gamepad/default zoom behavior and safely ignores invalid perspective rays', () => {
  const source = functionSource('_syncDruidFinaleMouse');
  const run = context => vm.runInNewContext(`${source};_syncDruidFinaleMouse();`, context);
  const plain = nativeContext(); run(plain);
  assert.equal(plain.mouse.x, 850); assert.equal(plain.mouse.y, 480);
  const zoomed = nativeContext({ window: { _FDGDruidQaStorage: { active: true }, _FDGDruidEncounterQa: { combatFraming: true } } });
  run(zoomed); assert.equal(zoomed.mouse.x, 1060); assert.equal(zoomed.mouse.y, 600);
  const editor = nativeContext({ _EDITOR_MODE: true, window: zoomed.window });
  run(editor); assert.equal(editor.mouse.x, 850); assert.equal(editor.mouse.y, 480);
  let calls = 0;
  const perspective = nativeContext({ _fdgNativePerspective: { inversePointer(x, y) {
    calls++; assert.equal(x, 850); assert.equal(y, 480); return { x: 770, y: 390 };
  } } });
  run(perspective); assert.equal(perspective.mouse.x, 770); assert.equal(perspective.mouse.y, 390);
  perspective._gpActive = true; perspective.mouse.x = 21; run(perspective);
  assert.equal(calls, 1); assert.equal(perspective.mouse.x, 21);
  perspective._gpActive = false; perspective.mouse._screenX = NaN; run(perspective); assert.equal(calls, 1);
  perspective.mouse._screenX = 850; perspective._fdgNativePerspective.inversePointer = () => null;
  run(perspective); assert.equal(perspective.mouse.x, 21); assert.equal(perspective.mouse.y, 390);
});

test('GPU triangle uses existing sink, patches UV after batch flush, and applies SSAA exactly once', () => {
  const method = methodSource('drawProjectedTriangle');
  class Image { constructor() { this.complete = true; this.naturalWidth = this.width = 256; this.height = 128; } }
  class Canvas { constructor() { this.width = 256; this.height = 128; } }
  const vertices = [{ x: 10, y: 20, u: 64, v: 32, w: .5 }, { x: 30, y: 40, u: 192, v: 96, w: 1.25 }, { x: 50, y: 60, u: 16, v: 112, w: 2 }];
  const buffer = new Float32Array(1000).fill(-999), calls = [], texture = {};
  const context = { HTMLImageElement: Image, HTMLCanvasElement: Canvas, _FPV: 11,
    _buf: buffer, _bufOff: 1, _qCnt: 5, _mat: () => [2, 0, 0, 2, 0, 0],
    _getTex: img => { calls.push(['get', img]); return texture; },
    _setTex: tex => { assert.equal(tex, texture); calls.push(['set']); },
    _uploadCanvasTex: img => calls.push(['upload', img]),
    _flush() { calls.push(['flush']); context._bufOff = 7; context._qCnt = 0; },
    _quad(...args) { calls.push(['quad', ...args]); context._bufOff = 7; context._qCnt = 1; } };
  const sink = vm.runInNewContext(`({${method}}).drawProjectedTriangle`, context);
  sink(new Image(), vertices, .37);
  const quad = calls.find(c => c[0] === 'quad').slice(1);
  assert.deepEqual(quad.slice(0, 8), [20, 40, 60, 80, 100, 120, 100, 120]);
  near(quad[15], .37); assert.equal(quad[16], 5);
  const offset = 7 * 4 * 11;
  assert.deepEqual([2, 3, 13, 14, 24, 25, 35, 36].map(i => buffer[offset + i]), [.25, .25, .75, .75, .0625, .875, .0625, .875]);
  assert.deepEqual([10, 21, 32, 43].map(i => buffer[offset + i]), [.5, 1.25, 2, 2]);
  assert.equal(buffer[(1 + 5 - 1) * 4 * 11 + 2], -999, 'must not patch the stale pre-flush address');
  calls.length = 0; context._qCnt = 16383; sink(new Canvas(), vertices, .9);
  assert.deepEqual(calls.map(c => c[0]), ['upload', 'flush', 'quad']);
  calls.length = 0; const incomplete = new Image(); incomplete.complete = false;
  sink(incomplete, vertices, .8); assert.equal(calls.length, 0);
  sink(new Image(), vertices.map((v, i) => ({ ...v, w: [Infinity, -.5, undefined][i] })), .8);
  assert.deepEqual([10, 21, 32, 43].map(i => buffer[offset + i]), [1, 1, 1, 1]);
});

test('native homogeneous-W shader contract preserves default raster positions and projective ground UV', () => {
  const shaderTemplate = marker => {
    // The primary X GLSL follows the independent instancing shader using the same local name.
    const start = game.lastIndexOf(marker) + marker.length;
    assert.ok(start >= marker.length);
    const end = game.indexOf('`;', start);
    assert.ok(end > start);
    return game.slice(start, end + 1);
  };
  const wgslTemplate = shaderTemplate('const wgsl='), glslTemplate = shaderTemplate('const _VS=');
  const weights = {};
  for (const enabled of [false, true]) {
    const wgsl = vm.runInNewContext(wgslTemplate, { _fdgProjectiveTextureGate: enabled });
    const glsl = vm.runInNewContext(glslTemplate, { _fdgProjectiveTextureGate: enabled });
    assert.match(wgsl, /o\.p=vec4f\(n\.x\*w,-n\.y\*w,0\.0,w\)/);
    assert.match(glsl, /gl_Position=vec4\(c\*w,0\.0,w\)/);
    assert.match(wgsl, /o\.u=v\.u/); assert.match(glsl, /vU=aU/);
    const wgslExpression = wgsl.match(/let w=([^;]+);/)[1];
    const glslExpression = glsl.match(/float w=([^;]+);/)[1];
    const wgslWeight = (kind, parameter) => vm.runInNewContext(wgslExpression,
      { v: { s: kind, r: { y: parameter } }, select: (off, on, selected) => selected ? on : off });
    const glslWeight = (kind, parameter) => vm.runInNewContext(glslExpression,
      { aS: kind, aR: { y: parameter }, int: Math.trunc });
    for (const kind of [0, 1, 5]) for (const parameter of [-2, 0, .4, 3]) {
      const expected = enabled && kind === 5 && parameter > 0 ? parameter : 1;
      assert.equal(wgslWeight(kind, parameter), expected); assert.equal(glslWeight(kind, parameter), expected);
    }
    weights[enabled] = wgslWeight;
  }
  assert.match(game, /const _MQ=65536,_FPV=11;/, 'existing vertex layout must remain unchanged');
  const capability = vm.runInNewContext(`({get ${methodSource('projectiveTextureProjection')}}).projectiveTextureProjection`, { _fdgProjectiveTextureGate: true });
  assert.equal(capability, true);
  const gpuBuffer = new Float64Array(1000), triangles = [];
  const raw = { globalAlpha: .8, projectiveTextureProjection: capability,
    save() {}, restore() {}, setTransform(...args) { assert.deepEqual(args, [2, 0, 0, 2, 0, 0]); } };
  const context = { Number, HTMLImageElement: class {}, HTMLCanvasElement: class {},
    _buf: gpuBuffer, _bufOff: 0, _qCnt: 0, _FPV: 11, _mat: () => [2, 0, 0, 2, 0, 0],
    _getTex: () => ({}), _setTex() {}, _uploadCanvasTex() {}, _flush() { assert.fail('small test mesh should not flush'); },
    _quad(...args) {
      const o = context._qCnt * 4 * 11;
      for (let i = 0; i < 4; i++) { gpuBuffer[o + i * 11] = args[i * 2]; gpuBuffer[o + i * 11 + 1] = args[i * 2 + 1]; gpuBuffer[o + i * 11 + 8] = args[16]; }
      context._qCnt++;
    } };
  const sink = vm.runInNewContext(`({${methodSource('drawProjectedTriangle')}}).drawProjectedTriangle`, context);
  raw.drawProjectedTriangle = (image, vertices, alpha) => {
    sink(image, vertices, alpha);
    const base = (context._qCnt - 1) * 4 * 11;
    triangles.push([0, 1, 2].map(i => ({ x: gpuBuffer[base + i * 11] / 2, y: gpuBuffer[base + i * 11 + 1] / 2,
      u: gpuBuffer[base + i * 11 + 2], v: gpuBuffer[base + i * 11 + 3],
      kind: gpuBuffer[base + i * 11 + 8], w: gpuBuffer[base + i * 11 + 10] })));
  };
  const adapter = createNativeWorldProjection({ drawTexturedTriangle: (r, image, vertices, alpha) => r.drawProjectedTriangle(image, vertices, alpha) });
  const center = { x: 100, y: 200 }, viewport = { width: 1280, height: 720 };
  const camera = { ...WORLD_CAMERA_DEFAULTS, yaw: .45, pitch: .71, zoom: .9, distance: 900 };
  const image = { width: 512, height: 384 }, crop = { x: 32, y: 48, width: 320, height: 240 };
  const quad = { x: center.x - 360, y: center.y - 240, width: 720, height: 520 };
  adapter.begin(raw, { camera, center, viewport, pixelScale: 2 });
  adapter.context.drawImage(image, crop.x, crop.y, crop.width, crop.height, quad.x, quad.y, quad.width, quad.height);
  assert.equal(triangles.length, 2, 'GPU must consume the complete planar quad without CPU affine subdivisions');
  const p = createWorldProjection(camera, center, viewport), lambda = [.2, .35, .45];
  let affineError = 0;
  for (const triangle of triangles) {
    const screen = { x: triangle.reduce((sum, v, i) => sum + lambda[i] * v.x, 0), y: triangle.reduce((sum, v, i) => sum + lambda[i] * v.y, 0) };
    const world = p.unprojectGround(screen.x, screen.y); assert.ok(world);
    const denominator = triangle.reduce((sum, v, i) => sum + lambda[i] / weights.true(v.kind, v.w), 0);
    const uv = key => triangle.reduce((sum, v, i) => sum + lambda[i] * v[key] / weights.true(v.kind, v.w), 0) / denominator;
    const expectedU = (crop.x + crop.width * (world.x - quad.x) / quad.width) / image.width;
    const expectedV = (crop.y + crop.height * (world.y - quad.y) / quad.height) / image.height;
    near(uv('u'), expectedU); near(uv('v'), expectedV);
    const affineU = triangle.reduce((sum, v, i) => sum + lambda[i] * v.u, 0);
    affineError = Math.max(affineError, Math.abs(affineU - expectedU));
    for (const v of triangle) {
      const nativeWorld = p.unprojectGround(v.x, v.y), projected = p.project(nativeWorld.x, nativeWorld.y);
      near(v.w, 1 / projected.scale);
      const ndc = { x: v.x / viewport.width * 2 - 1, y: 1 - v.y / viewport.height * 2 };
      for (const enabled of [false, true]) {
        const w = weights[enabled](v.kind, v.w);
        near((ndc.x * w / w + 1) * viewport.width / 2, v.x);
        near((1 - ndc.y * w / w) * viewport.height / 2, v.y);
      }
    }
  }
  assert.ok(affineError > .01, 'oracle must distinguish perspective interpolation from the old affine UV path');
  adapter.end(); triangles.length = 0;
  adapter.begin(raw, { camera: { ...camera, yaw: 0 }, center, viewport, pixelScale: 2 });
  adapter.context.drawImage(image, center.x - 360, center.y - 300, 720, 1900);
  assert.ok(triangles.length > 0);
  assert.ok(triangles.flat().every(v => [v.x, v.y, v.u, v.v, v.w].every(Number.isFinite) && v.w > 0));
  assert.ok(triangles.flat().some(v => Math.abs(v.w - camera.near / (camera.zoom * camera.distance)) < 1e-9),
    'same GPU path must consume vertices on the actual near plane');
  assert.ok(Math.max(...triangles.flat().map(v => v.v)) < 1, 'clipped source UV must stop before the rejected far edge');
  adapter.end();
});

test('world entry uses projection context alone and restores raw context before HUD', () => {
  const start = game.indexOf('  const _nativePerspective=_fdgNativePerspective;');
  const end = game.indexOf('  const _worldViewBounds=', start);
  const finish = game.lastIndexOf('  X.restore();', game.indexOf('  if(_wantPlateTest()){', end));
  const finishEnd = game.indexOf('  if(_wantPlateTest()){', finish);
  assert.ok(start >= 0 && end > start && finish > end && finishEnd > finish);
  for (const enabled of [false, true]) {
    const calls = [], make = label => Object.fromEntries(['save', 'restore', 'scale', 'translate'].map(name => [name, (...args) => calls.push([label, name, ...args])]));
    const raw = make('raw'), projected = make('projection');
    const perspective = { context: projected, begin(x, shake) { assert.equal(x, raw); calls.push(['begin', shake.x, shake.y]); },
      end() { calls.push(['end']); return raw; } };
    const context = nativeContext({ X: raw, _fdgNativePerspective: enabled ? perspective : null,
      _ssaa: 2, _tzoom: .5, sx: 3, sy: -2 });
    vm.runInNewContext(game.slice(start, end) + game.slice(finish, finishEnd), context);
    assert.equal(context.X, raw);
    if (enabled) assert.deepEqual(calls, [['begin', 3, -2], ['projection', 'save'], ['projection', 'restore'], ['end']]);
    else { assert.equal(calls.filter(c => c[1] === 'scale').length, 2); assert.equal(calls[0][1], 'save'); assert.equal(calls.at(-1)[1], 'restore'); }
  }
});

test('perspective declines affine GL batching while actual VFX fallback still draws and enemy flags reset', () => {
  const calls = [], X = Object.fromEntries(['save', 'restore', 'translate', 'rotate', 'drawImage'].map(name => [name, (...args) => calls.push([name, ...args])]));
  const context = nativeContext({ X, _fdgNativePerspective: { active: true }, _vfxGLMode: true });
  vm.runInNewContext(`${functionSource('_queueVfxGL')}\n${functionSource('_drawTimedVfxFrame')}`, context);
  context._drawTimedVfxFrame({ x: 400, y: 500, ang: .3 }, { img: {}, cols: 4, fw: 32, fh: 64 }, 6, .63, 100, 200);
  assert.ok(calls.some(c => c[0] === 'drawImage')); near(X.globalAlpha, .63);
  assert.deepEqual(calls.find(c => c[0] === 'translate').slice(1), [400, 500]);
  const enemy = { _ensGLMode: 2 }, enemy2 = { _ensGLMode: 1 };
  Object.assign(context, { ens: [enemy, null, enemy2], _ens8GLCounts: new Uint16Array([4, 8]), _useGL: true,
    _dbgEnsGL: 2, _dbgEns8GL: 2, _dbgEns8GLDraws: 2, _ensGLCount: 10, _ens8GLTotal: 12 });
  vm.runInNewContext(`${functionSource('_prepEnemyInstanced')};_prepEnemyInstanced(0,1,0,1,0,1);`, context);
  assert.equal(enemy._ensGLMode, 0); assert.equal(enemy2._ensGLMode, 0);
  assert.equal(context._ensGLCount, 0); assert.equal(context._ens8GLTotal, 0);
  assert.deepEqual(Array.from(context._ens8GLCounts), [0, 0]);
});

test('boss danger remains ground geometry and independent thorn shots own their billboard anchors', () => {
  let role = 'body'; const calls = [];
  const X = Object.fromEntries(['save', 'restore', 'translate', 'scale', 'rotate', 'beginPath', 'arc', 'moveTo', 'lineTo', 'closePath', 'fill', 'stroke'].map(name => [name, (...args) => calls.push([role, name, ...args])]));
  const perspective = { active: true, withGround(fn) { const previous = role; role = 'ground'; try { return fn(); } finally { role = previous; } },
    pushBillboard(x, y) { calls.push(['anchor', x, y]); role = 'shot'; }, popBillboard() { role = 'body'; } };
  const context = nativeContext({ X, _fdgNativePerspective: perspective, _isDruidFinale: () => true });
  // Execute the real body-to-ground call seam before the unrelated atlas selection.
  const bossSource = functionSource('_drawDruidBoss'), tellEnd = bossSource.indexOf('  const key=');
  assert.ok(tellEnd > 0);
  const bossTellEntry = bossSource.slice(0, tellEnd) + '}';
  vm.runInNewContext(`${functionSource('_drawDruidFinaleRing')}\n${functionSource('_drawDruidFinaleTell')}\n${functionSource('_drawDruidThornShot')}\n${bossTellEntry}`, context);
  const boss = { x: 400, y: 500, r: 80, s: 'bossChargeWind', facing: .3, _druidChargeLeft: 300 };
  context._drawDruidBoss(X, boss, 1, 0, {});
  assert.ok(calls.some(c => c[1] === 'stroke')); assert.ok(calls.filter(c => c[1] === 'stroke').every(c => c[0] === 'ground'));
  assert.equal(role, 'body');
  calls.length = 0;
  context._drawDruidThornShot({ x: 512, y: 710, vx: 2, vy: 1, parryClass: 'physical' }, .7);
  assert.deepEqual(calls[0], ['anchor', 512, 710]);
  assert.ok(calls.some(c => c[0] === 'shot' && c[1] === 'fill')); assert.equal(role, 'body');
  const playerStart = game.indexOf('pushBillboard(P.x,P.y)'), playerEnd = game.indexOf('popBillboard()', playerStart);
  const range = game.indexOf('_drawSilvertailChargeRange(X,P.x,P.y,');
  const attached = game.indexOf('_drawSilvertailBackBlade(X,_silvAtk)', playerStart);
  assert.ok(range > 0 && range < playerStart, 'world attack radius must stay outside body billboard');
  assert.ok(attached > playerStart && attached < playerEnd, 'attached weapon must retain the body local pose');
});

test('public camera controls are transient, use fresh native view for picking, and tear down their timer', () => {
  const nodes = new Map();
  function element(tag) {
    return { tag, style: {}, children: [], listeners: {}, append(...children) { this.children.push(...children); },
      addEventListener(type, fn) { this.listeners[type] = fn; }, emit(type) { this.listeners[type](); },
      remove() { this.removed = true; }, set id(value) { this._id = value; nodes.set(value, this); }, get id() { return this._id; },
      set textContent(value) { assert.equal(this.children.length, 0, 'only leaf nodes may replace text'); this.text = value; } };
  }
  const doc = { createElement: element, body: element('body') }, timers = [];
  const descriptors = new Map(['setInterval', 'clearInterval', 'localStorage', 'sessionStorage', 'fetch'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  let view = { center: { x: 4000, y: 7400 }, viewport: { width: 1280, height: 720 }, pixelScale: 2, nativeZoom: 1 };
  try {
    globalThis.setInterval = (fn, ms) => { assert.equal(ms, 200); timers.push({ fn, cleared: false }); return 1; };
    globalThis.clearInterval = id => { assert.equal(id, 1); timers[0].cleared = true; };
    for (const key of ['localStorage', 'sessionStorage', 'fetch']) Object.defineProperty(globalThis, key, { configurable: true, get() { throw new Error(`Transient controls accessed ${key}`); } });
    const qa = installNativePerspectiveQa({ document: doc, getView: () => view, getState: () => ({ player: { x: 4010, y: 7410 }, boss: null }) });
    assert.equal(qa.snapshot().persistence, 'transient-no-storage');
    const yaw = nodes.get('fdgNativeCamera-yaw'); yaw.value = '.5'; yaw.emit('input');
    const lens = nodes.get('fdgNativeCamera-distance'); lens.value = '1800'; lens.emit('input');
    const raw = { save() {}, restore() {}, setTransform(...args) { assert.deepEqual(args, [2, 0, 0, 2, 0, 0]); } };
    qa.begin(raw, { x: 5, y: -3 }); assert.equal(qa.active, true); assert.equal(qa.end(), raw); assert.equal(qa.active, false);
    // A draw may use interpolated center; the next input must rebuild from current native center.
    view = { ...view, center: { x: 4090, y: 7460 } };
    const snapshot = qa.snapshot(), p = createWorldProjection(snapshot.effectiveCamera, view.center, view.viewport);
    const target = { x: 4320, y: 7295 }, screen = p.project(target.x, target.y);
    const inverse = qa.inversePointer(screen.x + 5, screen.y - 3);
    near(inverse.world.x, target.x); near(inverse.world.y, target.y);
    assert.equal(snapshot.settings.yaw, .5); assert.equal(snapshot.settings.distance, 1800);
    assert.equal(snapshot.events.length, 2); timers[0].fn();
    const zoom = nodes.get('fdgNativeCamera-zoom'); zoom.value = '.5'; zoom.emit('input');
    view = { ...view, nativeZoom: .3 };
    assert.doesNotThrow(() => qa.snapshot(), 'public zoom limits must remain a valid common camera with native boss zoom');
    assert.ok(qa.snapshot().effectiveCamera.zoom >= .25);
    qa.uninstall(); assert.equal(timers[0].cleared, true); assert.equal(nodes.get('fdgNativePerspectivePanel').removed, true);
  } finally {
    for (const [key, descriptor] of descriptors) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; }
  }
});

test('screen-facing consumer selects projected sprite rows and flip while preserving native actor facing and velocity', async () => {
  const qaSource = await readFile(new URL('../engine/fdg/native-perspective-qa.js', import.meta.url), 'utf8');
  const controllerSource = qaSource.match(/^    screenFacing\(x, y, angle\) \{.*\},$/m)?.[0]?.trim().slice(0, -1);
  assert.ok(controllerSource, 'actual controller must expose the screen-facing consumer');
  const center = { x: 4020, y: 7420 }, viewport = { width: 1280, height: 720 };
  let projection, projectionReads = 0;
  const screenFacing = vm.runInNewContext(`({${controllerSource}}).screenFacing`, {
    nativeScreenFacing, inputProjection: () => { projectionReads++; return { p: projection }; }
  });
  const controller = { active: true, screenFacing }, dirMap = [6, 7, 0, 1, 2, 3, 4, 5];
  const dirNames = ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'];
  const ordinal = angle => ((Math.round(angle / (Math.PI / 4)) % 8) + 8) % 8;
  const immutable = value => new Proxy(Object.freeze(value), { set() { assert.fail('render direction must not modify native actor state'); } });
  const playerStart = game.indexOf('    const _spriteFacing='), playerEnd = game.indexOf('    if(!_apHasDir', playerStart);
  const flipStart = game.indexOf('    const _pFlip=!_apHasDir&&Math.abs(_spriteFacing)'), flipEnd = game.indexOf('\n', flipStart);
  assert.ok(playerStart > 0 && playerEnd > playerStart && flipStart > playerEnd);
  const playerSource = game.slice(playerStart, playerEnd) + game.slice(flipStart, flipEnd);
  const projectedRows = new Set(), projectedFlips = new Set();
  const cameras = [[0, .6], [0, 1.1], [-.7, .6], [.7, 1.1]];
  for (const [yaw, pitch] of cameras) {
    projection = createWorldProjection({ ...WORLD_CAMERA_DEFAULTS, yaw, pitch }, center, viewport);
    for (const angle of [.55, 2.1]) {
      // At the camera center the projected tangent has an independent analytical direction.
      const expectedAngle = Math.atan2(Math.sin(angle + yaw) * Math.sin(pitch), Math.cos(angle + yaw));
      near(nativeScreenFacing(projection, center.x, center.y, angle), expectedAngle);
      for (const hasDirectionalFrames of [true, false]) {
        const frames = hasDirectionalFrames ? Object.fromEntries(dirNames.map(name => ['idle_' + name, []])) : { idle: [] };
        const player = immutable({ x: center.x, y: center.y, facing: angle, vx: 7 * Math.cos(angle), vy: 7 * Math.sin(angle), _sa: { fm: frames } });
        const playerBefore = JSON.stringify(player);
        const result = vm.runInNewContext(`${functionSource('_facingDir8')}\n${playerSource}\n({row:_apDir,flip:_pFlip,spriteFacing:_spriteFacing});`, {
          P: player, _DIR8: dirNames, _fdgNativePerspective: controller, _apAnim: 'idle', _silvAtk: null
        });
        assert.equal(result.row, dirNames[ordinal(expectedAngle)]);
        assert.equal(result.flip, !hasDirectionalFrames && Math.abs(expectedAngle) > Math.PI / 2);
        assert.equal(JSON.stringify(player), playerBefore);
        if (angle === .55 && hasDirectionalFrames) projectedRows.add(result.row);
        if (angle === 2.1 && !hasDirectionalFrames) projectedFlips.add(result.flip);
      }
      for (const walking of [false, true]) {
        const enemy = immutable({ x: center.x, y: center.y, facing: walking ? -2.3 : angle,
          vx: walking ? Math.cos(angle) * 6 : 0, vy: walking ? Math.sin(angle) * 6 : 0, s: walking ? 'eWalk' : 'idle' });
        const enemyBefore = JSON.stringify(enemy);
        const row = vm.runInNewContext(`${functionSource('_druidDir')};_druidDir(e);`, {
          Math, _DRUID_DIRMAP: dirMap, _fdgNativePerspective: controller, e: enemy
        });
        assert.equal(row, dirMap[ordinal(expectedAngle)]);
        assert.equal(JSON.stringify(enemy), enemyBefore, 'world facing and movement vector must retain native values');
      }
    }
  }
  assert.ok(projectedRows.size >= 2, 'camera yaw/pitch must change the selected screen direction');
  assert.deepEqual([...projectedFlips].sort(), [false, true], 'sprite fallback flip must follow screen direction');
  assert.equal(projectionReads, cameras.length * 2 * 4, 'controller must consume current projection for each actor draw');
  const hiddenY = center.y + 10000, original = .55;
  assert.equal(nativeScreenFacing(projection, center.x, hiddenY, original), original, 'invisible projected tangent retains native direction');
  const defaultEnemy = immutable({ x: center.x, y: center.y, facing: original, vx: 0, vy: 0, s: 'idle' });
  const defaultRow = vm.runInNewContext(`${functionSource('_druidDir')};_druidDir(e);`, {
    Math, _DRUID_DIRMAP: dirMap, _fdgNativePerspective: null, e: defaultEnemy
  });
  assert.equal(defaultRow, dirMap[ordinal(original)]);
});
