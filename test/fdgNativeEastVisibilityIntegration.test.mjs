import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { createWorldProjection, WORLD_CAMERA_DEFAULTS } from '../engine/fdg/world-camera.js';
import { createNativeWorldProjection } from '../engine/fdg/native-world-projection.js';
import { RUINED_FOREST_SCENE } from '../engine/fdg/ruined-forest-scene.js';

const game = await readFile(new URL('../game.html', import.meta.url), 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
const near = (actual, expected, tolerance = 1e-8) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);

// Isolate the new native drawing consumers without running bootstrap or a save API.
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
  assert.fail('Unterminated native visibility consumer');
}
function ghoulSource() {
  const marker = game.indexOf('// ── 구울 전용 렌더 (3종 스프라이트) ──'), start = game.indexOf('if(e._isGhoul){', marker);
  assert.ok(marker > 0 && start > marker);
  const block = game.slice(start, bodyEnd(start));
  new vm.Script(`for(const e of ens){${block}}`);
  return block;
}

function renderer() {
  const commands = [], stack = [];
  const keys = ['globalAlpha', 'globalCompositeOperation', 'filter', 'fillStyle', 'strokeStyle', 'lineWidth', 'font', 'textAlign', 'textBaseline', 'imageSmoothingEnabled'];
  const raw = { globalAlpha: .83, globalCompositeOperation: 'source-over', filter: 'none', fillStyle: '#345', strokeStyle: '#789', lineWidth: 2,
    font: '16px sans-serif', textAlign: 'center', textBaseline: 'middle', imageSmoothingEnabled: true,
    projectiveTextureProjection: true, matrix: [1.5, 0, 0, 1.5, 13, 17],
    save() { stack.push({ matrix: [...this.matrix], style: Object.fromEntries(keys.map(key => [key, this[key]])) }); },
    restore() { const saved = stack.pop(); assert.ok(saved, 'Raw state stack must remain balanced'); this.matrix = saved.matrix; Object.assign(this, saved.style); },
    setTransform(...matrix) { this.matrix = matrix; }, getTransform() { const [a, b, c, d, e, f] = this.matrix; return { a, b, c, d, e, f }; },
    beginPath() {}, moveTo() {}, lineTo() {}, closePath() {}, clip() {},
    fill() { commands.push({ kind: 'fill', alpha: this.globalAlpha }); },
    fillText(text, x, y) { commands.push({ kind: 'text', text, x, y, matrix: [...this.matrix], alpha: this.globalAlpha }); },
    drawImage(image, ...args) { commands.push({ kind: 'raw-image', image, args, alpha: this.globalAlpha }); },
    getLineDash: () => [], setLineDash() {}
  };
  const initial = () => ({ matrix: [...raw.matrix], ...Object.fromEntries(keys.map(key => [key, raw[key]])) });
  const adapter = createNativeWorldProjection({ drawTexturedTriangle(r, image, vertices, alpha) {
    for (const v of vertices) assert.ok([v.x, v.y, v.u, v.v, v.w].every(Number.isFinite), 'Projected mesh values must stay finite');
    commands.push({ kind: 'texture', image, vertices: vertices.map(v => ({ ...v })), alpha, matrix: [...r.matrix] });
  } });
  return { raw, adapter, commands, initial, stack };
}

function fixture({ pack = true, perspective = true, etype = 101, mode = 'ready' } = {}) {
  const r = renderer(), { adapter } = r, calls = [], drawCalls = [];
  const original = r.initial();
  const enemy = Object.freeze({ _isGhoul: true, etype, x: 2031, y: 1578, r: 18, facing: 0, hp: 30, mhp: 70,
    eShield: 5, eShieldMax: 20, stunned: 30, _maxStunned: 90, s: 'idle', alive: true,
    _mob8Col: 2, _mob8Row: 1, _isMoving: true, _walkDist: 128, ai: 'native-ghoul-ai', atk: 9 });
  const images = Object.fromEntries(['south', 'east', 'walk-south', 'walk-east'].map(id => [id,
    Object.freeze({ id, complete: true, naturalWidth: mode === 'ready' ? 128 : id.startsWith('walk-') ? 8192 : 2048, naturalHeight: mode === 'ready' ? 256 : 1280 })]));
  const center = { x: enemy.x, y: enemy.y }, viewport = { width: 1280, height: 720 }, camera = RUINED_FOREST_SCENE.camera;
  adapter.begin(r.raw, { camera, center, viewport, pixelScale: 2, deferBillboards: true });
  const controller = { active: true,
    pushBillboard(x, y) { calls.push(['push', x, y]); return adapter.pushBillboard(x, y); },
    popBillboard() { calls.push(['pop']); return adapter.popBillboard(); },
    screenFacing(x, y, angle) { calls.push(['facing', x, y, angle]); return angle + Math.PI / 2; } };
  const X = new Proxy(adapter.context, {
    get(target, key) {
      const value = target[key]; if (typeof value !== 'function') return value;
      return (...args) => {
        if (['fill', 'fillRect', 'drawImage'].includes(key)) drawCalls.push({ method: key, args: [...args],
          role: adapter.snapshot().billboard, matrix: { ...adapter.context.getTransform() }, alpha: X.globalAlpha });
        return value(...args);
      };
    },
    set(target, key, value) { target[key] = value; return true; }
  });
  const dirs = Object.fromEntries(['south', 'east'].map(dir => [dir, { ready: true, img: images[dir] }]));
  const walkDirs = Object.fromEntries(['south', 'east'].map(dir => [dir, { ready: true, img: images['walk-' + dir] }]));
  const context = { X, _FDG_NATIVE_MAP_PACK_FIRST: pack, _nativePerspective: perspective ? controller : null,
    ens: [enemy], P: mode === 'ready' ? Object.freeze({ x: 1979, y: 1490, hp: 100, mhp: 100, s: 'idle', facing: .2 }) : null,
    _now: 350, GHOUL_DEFS: { 100: {}, 101: {}, 102: {} },
    _ghoulReady: { [etype]: mode === 'ready' }, _ghoulImgs: { [etype]: images },
    _ghoulDir: angle => angle > 1 ? 'east' : 'south', _mobFacingDir8: angle => angle > 1 ? 'east' : 'south',
    _MOB8_TOTAL: 40, _MOB8_COLS: 8,
    _ch8Atlas: mode === 'empty' ? {} : { 1: { dirs, walkDirs, meta: { cell: 256 },
      walkMeta: { framesPerMob: 4, _idxSet: new Set([10]) } } },
    reachedAfterGhoul: 0,
    projs: [Object.freeze({ x: 2040, y: 1543, vx: -4, vy: 1, life: 70, parryClass: 'magic' })],
    MAP_OBJS: [Object.freeze({ _fdgInstanceId: 'prop-035', x: 44 * 40, y: 62 * 40 })] };
  const world = plain({ player: context.P, enemies: context.ens, projectiles: context.projs, objects: context.MAP_OBJS });
  const run = () => vm.runInNewContext(`for(const e of ens){${ghoulSource()}reachedAfterGhoul++;}`, context);
  return { ...r, context, enemy, images, calls, drawCalls, world, run, center, viewport, camera, original };
}

test('native ghoul caller scopes only body and HP into the map-pack billboard and balances its early continue on ready, fallback, and empty paths', () => {
  const variants = [100, 101, 102].map(etype => ({ etype, mode: 'ready' })).concat([{ etype: 101, mode: 'fallback' }, { etype: 101, mode: 'empty' }]);
  for (const variant of variants) for (const [pack, perspective, enabled] of [[true, true, true], [false, true, false], [true, false, false]]) {
    const f = fixture({ ...variant, pack, perspective });
    try {
      f.run(); assert.equal(f.context.reachedAfterGhoul, 0, 'The native early continue must remain intact');
      const shadow = f.drawCalls.find(c => c.method === 'fill'); assert.ok(shadow); assert.equal(shadow.role, null); near(shadow.alpha, .2);
      const bodies = f.drawCalls.filter(c => c.method === 'drawImage'), bars = f.drawCalls.filter(c => c.method === 'fillRect');
      assert.ok(bars.length > 0, 'Damaged/shielded/stunned fixture must exercise native HP and status bars');
      for (const command of [...bodies, ...bars]) {
        assert.equal(!!command.role, enabled);
        if (enabled) { assert.equal(command.role.x, f.enemy.x); assert.equal(command.role.y, f.enemy.y); }
      }
      const pushes = f.calls.filter(c => c[0] === 'push'), pops = f.calls.filter(c => c[0] === 'pop');
      assert.equal(pushes.length, Number(enabled)); assert.equal(pops.length, Number(enabled));
      if (enabled) assert.deepEqual(pushes[0].slice(1), [f.enemy.x, f.enemy.y]);
      assert.equal(f.adapter.snapshot().billboardDepth, 0); assert.equal(f.adapter.snapshot().billboard, null); assert.equal(f.adapter.snapshot().saveDepth, 0);
      if (bodies.length) {
        const dir = enabled ? 'east' : 'south'; assert.equal(bodies[0].args[0], f.images[dir]);
        if (variant.mode === 'fallback') assert.equal(bodies[1].args[0], f.images['walk-' + dir], 'Walk and idle must consume the same displayed direction');
      }
      assert.deepEqual(plain({ player: f.context.P, enemies: f.context.ens, projectiles: f.context.projs, objects: f.context.MAP_OBJS }), f.world);
    } finally { f.adapter.end(); }
    assert.equal(f.stack.length, 0);
  }
});

test('actual ghoul sprite waits for native flush as a constant-depth body mesh while shadow remains ground and flush restores rendering state', () => {
  const f = fixture();
  // begin already saved the renderer's original state; compare flush with the state after native caller completion.
  try {
    f.run(); const body = f.drawCalls.find(c => c.method === 'drawImage'); assert.ok(body);
    assert.ok(f.commands.some(c => c.kind === 'fill'), 'Ground shadow must be submitted immediately');
    assert.ok(!f.commands.some(c => c.kind === 'texture' && c.image === body.args[0]), 'Body must wait in the existing deferred queue');
    assert.ok(f.adapter.snapshot().pendingBillboardBatches > 0);
    const beforeFlush = f.initial(), depthBefore = f.stack.length;
    f.adapter.flushBillboards();
    assert.deepEqual(f.initial(), beforeFlush); assert.equal(f.stack.length, depthBefore);
    assert.equal(f.adapter.snapshot().pendingBillboardBatches, 0); assert.equal(f.adapter.snapshot().billboard, null);
    const mesh = f.commands.filter(c => c.kind === 'texture' && c.image === body.args[0]); assert.equal(mesh.length, 2);
    const projection = createWorldProjection(f.camera, f.center, f.viewport), anchor = projection.project(f.enemy.x, f.enemy.y);
    const [_image, dx, dy, dw, dh] = body.args, m = body.matrix;
    const localCorners = [[dx, dy], [dx + dw, dy], [dx + dw, dy + dh], [dx, dy + dh]].map(([x, y]) => ({
      x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f }));
    const expected = localCorners.map(p => ({ x: anchor.x + (p.x - f.enemy.x) * anchor.scale,
      y: anchor.y + (p.y - f.enemy.y) * anchor.scale }));
    const vertices = mesh.flatMap(command => command.vertices);
    for (const v of vertices) {
      near(v.w, 1 / anchor.scale); assert.ok(expected.some(p => Math.hypot(p.x - v.x, p.y - v.y) < 1e-8));
      assert.ok([0, body.args[0].naturalWidth].includes(v.u)); assert.ok([0, body.args[0].naturalHeight].includes(v.v));
    }
    for (const command of mesh) { near(command.alpha, .9); assert.deepEqual(command.matrix, [2, 0, 0, 2, 0, 0]); }
    assert.deepEqual(plain({ player: f.context.P, enemies: f.context.ens, projectiles: f.context.projs, objects: f.context.MAP_OBJS }), f.world);
  } finally { f.adapter.end(); }
  assert.equal(f.stack.length, 0);
  assert.deepEqual(f.initial(), f.original);
});

function leafDocument() {
  const nodes = new Map();
  function element(tag) {
    return { tag, children: [], style: {}, listeners: {}, append(...children) { this.children.push(...children); },
      addEventListener(type, listener) { this.listeners[type] = listener; }, remove() { this.removed = true; },
      set id(id) { this._id = id; nodes.set(id, this); }, get id() { return this._id; },
      set textContent(value) { assert.equal(this.children.length, 0); this.text = String(value); } };
  }
  return { createElement: element, body: element('body'), getElementById: id => nodes.get(id) };
}

test('cutaway constructor receives map-pack-only opt-in from the native loader and forwards its explicit false default to begin', async () => {
  const qaSource = await readFile(new URL('../engine/fdg/native-perspective-qa.js', import.meta.url), 'utf8');
  const moduleStart = game.lastIndexOf('<script type="module">'), moduleEnd = game.indexOf('</script>', moduleStart);
  const loader = game.slice(moduleStart + '<script type="module">'.length, moduleEnd).replace(/\bimport\(/g, '_import(');
  const gateStart = game.indexOf('const _fdgProjectiveTextureGate='), gateEnd = game.indexOf('const _MQ=', gateStart);
  const baseQuery = '?test=1&testchar=1&bosstest=0&fdgDruidQa=r4&fdgPerspective=first&fdgScene=ruined-forest-first';
  for (const [active, search, expected, installed] of [[true, baseQuery + '&fdgMapPack=first', true, true],
    [true, baseQuery, false, true], [true, baseQuery + '&fdgMapPack=other', false, true],
    [true, baseQuery.replace('fdgScene=ruined-forest-first', 'fdgScene=other') + '&fdgMapPack=first', false, true],
    [false, baseQuery + '&fdgMapPack=first', false, false]]) {
    const beginnings = [], installations = [], timers = [];
    const adapter = { active: false, context: {}, snapshot: () => ({}) ,
      begin(raw, options) { beginnings.push(options); this.active = true; return this.context; }, end() { this.active = false; } };
    const constructor = { createWorldProjection, WORLD_CAMERA_DEFAULTS, createNativeWorldProjection: () => adapter,
      drawCanvasTexturedTriangle: () => assert.fail('The constructor-only oracle must not bypass begin'), URLSearchParams,
      setInterval(fn) { timers.push({ fn, cleared: false }); return timers.length; }, clearInterval(id) { timers[id - 1].cleared = true; } };
    vm.runInNewContext(qaSource.replace(/^import .*\n/gm, '').replace(/^export /gm, '')
      + '\nthis.install=installNativePerspectiveQa;', constructor);
    const player = Object.freeze({ x: 1920, y: 2240, hp: 71, facing: .2 });
    const context = { URLSearchParams, location: { search }, window: { _FDGDruidQaStorage: { active } }, console,
      G: { cam: { x: player.x, y: player.y }, _camZoom: 1, mw: 72, mh: 84 }, P: player, ens: [], T: 40, VW: 1280, VH: 720, _ssaa: 2,
      _fdgNativePerspective: null, _prepareNativeMapPack: async () => ({ scene: RUINED_FOREST_SCENE }),
      async _import(path) {
        if (path.includes('ruined-forest-scene')) return { RUINED_FOREST_SCENE };
        assert.match(path, /native-perspective-qa/);
        return { installNativePerspectiveQa(options) { installations.push(options); return constructor.install({ ...options, document: leafDocument() }); } };
      } };
    vm.runInNewContext(game.slice(gateStart, gateEnd) + '\n' + loader, context);
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(installations.length, Number(installed));
    if (installed) {
      assert.equal(Object.hasOwn(installations[0], 'actorOcclusionCutaway'), expected);
      context._fdgNativePerspective.begin({}, { x: 0, y: 0 });
      assert.equal(beginnings.length, 1); assert.equal(beginnings[0].actorOcclusionCutaway, expected);
      context._fdgNativePerspective.end(); context._fdgNativePerspective.uninstall(); assert.equal(timers[0].cleared, true);
    }
    assert.deepEqual(plain(player), { x: 1920, y: 2240, hp: 71, facing: .2 });
  }
});

test('cutaway native callers tag upright props and actor anchors while windup glyphs retain native source points and restore their roles', () => {
  const line = (marker, after = 0) => { const start = game.indexOf(marker, after); assert.ok(start >= 0); return game.slice(start, game.indexOf('\n', start)); };
  const propOpen = line('if(mo._fdgUpright&&_fdgNativePerspective?.active)_fdgNativePerspective.pushBillboard(');
  const propClose = line('if(mo._fdgUpright&&_fdgNativePerspective?.active)_fdgNativePerspective.popBillboard();');
  const ordinaryMarker = game.indexOf('// ── 일반 적 렌더링 (8dir 단일 경로) ──');
  const bodyOpen = line('_nativePerspective?.pushBillboard(e.x,e.y,', ordinaryMarker), bodyClose = line('if(!e.ib)_nativePerspective?.popBillboard();', ordinaryMarker);
  const playerOpen = line('if(_fdgNativePerspective?.active)_fdgNativePerspective.pushBillboard(P.x,P.y,'),
    playerClose = line('if(_fdgNativePerspective?.active){_fdgNativePerspective.popBillboard();_fdgNativePerspective.flushBillboards();}');
  const cueStart = game.indexOf('if(e._atkWindup>0){', ordinaryMarker), cue = game.slice(cueStart, bodyEnd(cueStart));
  for (const pack of [true, false]) {
    const f = fixture({ pack }), roles = [], metadata = [], texts = [], controller = f.context._nativePerspective;
    const e = Object.freeze({ ...f.enemy, ib: false, _atkWindup: 13 }), mo = Object.freeze({ x: 44 * 40, y: 62 * 40, _fdgUpright: true });
    Object.assign(f.context, { e, ens: [e], mo, _fdgNativePerspective: controller, propImg: f.images.south, sa: .63, phase: '' });
    controller.pushBillboard = (x, y, meta) => { metadata.push({ phase: f.context.phase, x, y, meta: meta && plain(meta) }); roles.push({ x, y, meta }); return f.adapter.pushBillboard(x, y, meta); };
    controller.popBillboard = () => { assert.ok(roles.pop(), 'A native caller must not pop another scope'); f.adapter.popBillboard(); };
    controller.flushBillboards = () => f.adapter.flushBillboards();
    const inner = f.context.X;
    f.context.X = new Proxy(inner, { get(target, key) { const value = target[key]; return key === 'fillText'
      ? (...args) => { texts.push({ phase: f.context.phase, args, role: roles.at(-1) || null }); return value(...args); } : value; },
      set(target, key, value) { target[key] = value; return true; } });
    const world = plain({ player: f.context.P, enemy: e, prop: mo, projectiles: f.context.projs });
    try {
      f.context.phase = 'prop'; vm.runInNewContext(`${propOpen}\nX.drawImage(propImg,mo.x-20,mo.y-40,40,80);\n${propClose}`, f.context);
      f.context.phase = 'ordinary'; vm.runInNewContext(`${bodyOpen}\nX.drawImage(propImg,e.x-20,e.y-40,40,80);\n${bodyClose}`, f.context);
      f.context.phase = 'player'; vm.runInNewContext(`${playerOpen}\nX.drawImage(propImg,P.x-20,P.y-40,40,80);\n${playerClose}`, f.context);
      for (const [phase, point, kind] of [['prop', mo, 'occluder'], ['ordinary', e, 'actor'], ['player', f.context.P, 'actor']]) {
        const entry = metadata.find(item => item.phase === phase); assert.ok(entry); assert.equal(entry.x, point.x); assert.equal(entry.y, point.y);
        assert.deepEqual(entry.meta, pack ? { kind } : undefined);
      }
      f.context.phase = 'ordinary-cue'; vm.runInNewContext(cue, f.context);
      const ordinaryCue = texts.find(text => text.phase === 'ordinary-cue'); assert.deepEqual(ordinaryCue.args, ['❗', e.x, e.y-e.r-8]);
      assert.equal(!!ordinaryCue.role, pack); near(f.context.X.globalAlpha, f.context.sa); assert.equal(roles.length, 0);
      f.context.e = Object.freeze({ ...e, _atkWindup: 0 }); const before = texts.length; vm.runInNewContext(cue, f.context);
      assert.equal(texts.length, before, 'Windup zero must not manufacture an attack cue'); f.context.e = e;
      f.context.phase = 'ghoul'; f.run();
      const ghoulCues = texts.filter(text => text.phase === 'ghoul'); assert.equal(ghoulCues.length, Number(pack));
      if (pack) { assert.deepEqual(ghoulCues[0].args, ['❗', e.x, e.y-e.r-8]); assert.equal(ghoulCues[0].role.meta.kind, 'actor');
        assert.deepEqual(metadata.find(item => item.phase === 'ghoul').meta, { kind: 'actor' }); }
      assert.equal(roles.length, 0); assert.equal(f.adapter.snapshot().billboardDepth, 0);
      assert.deepEqual(plain({ player: f.context.P, enemy: e, prop: mo, projectiles: f.context.projs }), world);
    } finally { f.adapter.end(); }
    assert.deepEqual(f.initial(), f.original);
  }
});
