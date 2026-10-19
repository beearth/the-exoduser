import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { SourcePreviewRuntime } from '../engine/fdg/source-preview-runtime.js';
import { sampleSourcePreviewHeight } from '../engine/fdg/source-preview.js';

// This regression consumes the approved QA JSON, not source images or old tests.
// A checkout without that explicit artifact reports a skip rather than inventing it.
const qaPath = process.env.FDG_HEIGHT_WALL_QA || '/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-world-pilot-20261010/engine-stage0-visual-r2-first/r2-ramp-mid.qa.fdg.json';
const project = existsSync(qaPath) ? JSON.parse(readFileSync(qaPath, 'utf8')) : null;
const options = { skip: project ? false : `Actual height-wall QA input unavailable: ${qaPath}` };
const actorFrame = { width: 96, height: 96, anchorX: 0.5, anchorY: 0.85 };
const epsilon = 1e-7;
const near = (a, b) => Math.abs(a - b) <= epsilon;

function multiply(a, b) {
  return [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
}

function fakeContext(onDraw = () => {}) {
  const stack = [];
  let matrix = [1, 0, 0, 1, 0, 0];
  let clipDepth = 0;
  const context = {
    globalAlpha: 1, filter: 'none', draws: [],
    save() { stack.push({ alpha: this.globalAlpha, filter: this.filter, matrix: [...matrix], clipDepth }); },
    restore() {
      assert.ok(stack.length, 'Canvas restore must match save');
      const saved = stack.pop();
      this.globalAlpha = saved.alpha; this.filter = saved.filter;
      matrix = saved.matrix; clipDepth = saved.clipDepth;
    },
    beginPath() {}, rect() {}, moveTo() {}, lineTo() {}, closePath() {}, ellipse() {},
    clip() { clipDepth++; },
    transform(...values) { matrix = multiply(matrix, values); },
    translate(x, y) { this.transform(1, 0, 0, 1, x, y); },
    drawImage(image, ...args) {
      const draw = { image, args, alpha: this.globalAlpha, filter: this.filter, matrix: [...matrix] };
      this.draws.push(draw); onDraw(draw);
    },
    state() { return { alpha: this.globalAlpha, filter: this.filter, matrix: [...matrix], clipDepth, stackDepth: stack.length }; },
  };
  return context;
}

function makeHarness(position = project.sourcePreview.actor.position) {
  const canvases = [];
  const cacheContexts = [];
  const canvasFactory = () => {
    const context = fakeContext();
    const canvas = { width: 0, height: 0, kind: 'owned-floor-cache', getContext: () => context };
    canvases.push(canvas); cacheContexts.push(context); return canvas;
  };
  const runtime = new SourcePreviewRuntime(project.sourcePreview, project.map, { canvasFactory });
  const assets = new Map();
  for (const layer of [...runtime.scene.imageLayers, ...runtime.scene.groundLayers]) {
    const image = { src: layer.src, naturalWidth: layer.sourceRect[2], naturalHeight: layer.sourceRect[3] };
    assets.set(layer.src, { status: 'ready', image });
  }
  const height = sampleSourcePreviewHeight(runtime.scene, ...position, { validated: true });
  assert.equal(height.ok, true);
  const owner = { width: 772, height: 370, assets,
    player: { x: position[0], y: position[1], z: height.engineFootZ, radius: 12 },
    camera: { x: position[0], y: position[1] - height.engineFootZ, follow: true } };
  return { runtime, owner, canvases, cacheContexts };
}

function bounds(owner) {
  return { left: owner.camera.x - owner.width / 2, top: owner.camera.y - owner.height / 2 };
}

function visibleProps(runtime, owner) {
  const { left, top } = bounds(owner);
  return runtime._layers.filter(({ layer, z }) => {
    const [wx, wy, width, height] = layer.worldRect;
    return layer.opacity && wx - left + width > 0 && wx - left < owner.width &&
      wy - top - z + height > 0 && wy - top - z < owner.height;
  });
}

function drawTracked(harness) {
  const { runtime, owner } = harness;
  const events = [];
  const { left, top } = bounds(owner);
  const context = fakeContext(({ image, args }) => {
    if (args.length !== 8 || !image.src || image.src === runtime._ground.src) return;
    const entry = runtime._layers.find(({ layer, z }) => image.src === layer.src &&
      near(args[4], layer.worldRect[0] - left) && near(args[5], layer.worldRect[1] - top - z) &&
      near(args[6], layer.worldRect[2]) && near(args[7], layer.worldRect[3]));
    assert.ok(entry, 'Prop draw must retain its actual authored rectangle');
    events.push({ kind: 'prop', id: entry.layer.id, depth: entry.depth });
  });
  const ground = runtime._heightGround;
  const original = ground.drawWall;
  ground.drawWall = function (ctx, entry, ...args) {
    events.push({ kind: 'wall', id: entry.id, depth: entry.depth });
    return original.call(this, ctx, entry, ...args);
  };
  try {
    const counts = runtime.draw(context, owner, {
      actorFrame, drawActor: () => events.push({ kind: 'actor', depth: owner.player.y - owner.player.z }),
    });
    return { events, counts, context };
  } finally { ground.drawWall = original; }
}

test('actual R2 walls merge with props around the projected actor once, with prop-first equal-depth order', options, t => {
  const receipts = [];
  for (const [label, position] of [['mid', project.sourcePreview.actor.position], ['summit', [5405.8, 3986.8]]]) {
    const harness = makeHarness(position);
    const { runtime, owner } = harness;
    try {
      const { events, counts, context } = drawTracked(harness);
      const actorEvents = events.filter(event => event.kind === 'actor');
      assert.equal(actorEvents.length, 1);
      const actorIndex = events.findIndex(event => event.kind === 'actor');
      const actorDepth = owner.player.y - owner.player.z;
      for (const event of events.slice(0, actorIndex)) assert.ok(event.depth <= actorDepth);
      for (const event of events.slice(actorIndex + 1)) assert.ok(event.depth > actorDepth);
      const painter = events.filter(event => event.kind !== 'actor');
      for (let i = 1; i < painter.length; i++) assert.ok(painter[i - 1].depth <= painter[i].depth);
      assert.ok(painter.some(event => event.kind === 'wall'));
      assert.ok(painter.some(event => event.kind === 'prop'));
      assert.equal(context.state().stackDepth, 0);
      const { left, top } = bounds(owner);
      const walls = runtime._heightGround.visibleWalls(owner, left, top);
      assert.equal(counts.visibleGroundWalls, walls.length);
      assert.equal(counts.groundWallDrawCalls, walls.reduce((sum, wall) => sum + wall.commands.length, 0));
      const props = visibleProps(runtime, owner);
      receipts.push({ label, viewport: [owner.width, owner.height], actorWorld: position,
        actorEngineFootZ: owner.player.z, actorProjectedDepth: actorDepth,
        visibleWalls: walls.length, wallDepthRange: [walls[0].depth, walls.at(-1).depth],
        walls: walls.map(wall => ({ id: wall.id, projectedDepth: wall.depth })),
        visibleProps: props.length, propDepthRange: [props[0].depth, props.at(-1).depth],
        props: props.map(entry => ({ id: entry.layer.id, projectedDepth: entry.depth })),
        groundWallDrawCalls: counts.groundWallDrawCalls, visualVerdict: 'NOT_ASSESSED_BY_FAKE_CANVAS' });

      // Tie only the derived render queues, retaining the actual scene and UV commands.
      const actualLayers = runtime._layers;
      const actualVisibleWalls = runtime._heightGround.visibleWalls;
      runtime._layers = [{ ...props[0], depth: actorDepth }];
      runtime._heightGround.visibleWalls = () => [{ ...walls[0], depth: actorDepth }];
      try {
        const tied = drawTracked(harness).events;
        assert.deepEqual(tied.map(event => event.kind), ['prop', 'wall', 'actor']);
      } finally {
        runtime._layers = actualLayers;
        runtime._heightGround.visibleWalls = actualVisibleWalls;
      }
    } finally { runtime.dispose(); }
  }
  t.diagnostic(`HEIGHT_WALL_VISIBILITY ${JSON.stringify({ qaPath, renderingOnly: true, receipts })}`);
});

test('wall commands keep original soil UV bounds and leave ground, native props, appearance, nav and height unchanged', options, () => {
  const original = structuredClone(project.sourcePreview);
  const harness = makeHarness();
  const { runtime, owner, cacheContexts } = harness;
  try {
    const { counts } = drawTracked(harness);
    const ground = runtime._heightGround;
    const image = owner.assets.get(runtime._ground.src).image;
    assert.ok(ground._walls.length > 0);
    let commandCount = 0;
    for (const wall of ground._walls) {
      assert.ok(Number.isFinite(wall.depth));
      assert.ok(wall.localBounds.width > 0 && wall.localBounds.height > 0);
      for (const command of wall.commands) {
        commandCount++;
        const [sx, sy, sw, sh] = command.source;
        assert.ok(sx >= -epsilon && sy >= -epsilon && sw > 0 && sh > 0);
        assert.ok(sx + sw <= image.naturalWidth + epsilon && sy + sh <= image.naturalHeight + epsilon);
        assert.equal(command.transform.length, 6);
        assert.ok(command.transform.every(Number.isFinite));
        assert.ok(command.points.flat().every(Number.isFinite));
        assert.deepEqual(command.destination.slice(0, 2), [0, 0]);
        assert.ok(command.destination[2] > 0 && command.destination[3] > 0);
        assert.equal(command.brightness, original.appearancePreview.frontWalls.brightness);
        assert.equal(command.opacity, original.appearancePreview.frontWalls.opacity);
      }
    }
    const snapshot = ground.snapshot();
    assert.equal(snapshot.groundHeightWallTriangles, commandCount);
    assert.equal(cacheContexts[0].draws.length, snapshot.groundHeightTriangles - commandCount,
      'Only floor triangles belong to the Canvas cache; walls remain static draw commands');
    assert.ok(cacheContexts[0].draws.every(draw => draw.image === image));
    const wallContext = fakeContext();
    const { left, top } = bounds(owner);
    const wall = ground.visibleWalls(owner, left, top)[0];
    assert.equal(ground.drawWall(wallContext, wall, image, left, top), wall.commands.length);
    assert.ok(wallContext.draws.every(draw => draw.image === image && draw.args.length === 8));
    assert.ok(counts.groundWallDrawCalls > 0);
    assert.deepEqual(runtime.scene, original);
    assert.deepEqual(project.sourcePreview, original);
  } finally { runtime.dispose(); }
});

test('one floor Canvas cache is reused, walls cull offscreen, and disposal clears both pixels and commands', options, () => {
  const harness = makeHarness();
  const { runtime, owner, canvases } = harness;
  const ground = runtime._heightGround;
  try {
    drawTracked(harness); drawTracked(harness);
    const snapshot = ground.snapshot();
    assert.equal(canvases.length, 1);
    assert.equal(snapshot.groundHeightCacheBuilds, 1);
    assert.equal(snapshot.ownedHeightCanvases, 1);
    assert.ok(snapshot.groundHeightCacheBytes > 0 && snapshot.groundHeightCacheBytes <= 4194304 * 4);
    const { left, top } = bounds(owner);
    const walls = ground.visibleWalls(owner, left, top);
    assert.ok(walls.length > 0);
    assert.ok(walls.every((wall, index) => !index || walls[index - 1].depth <= wall.depth));
    assert.deepEqual(ground.visibleWalls(owner, 10000, 10000), []);
    const context = fakeContext();
    const image = owner.assets.get(runtime._ground.src).image;
    assert.equal(ground.draw(context, owner, image, 10000, 10000), 0);
    assert.equal(context.draws.length, 0);
    assert.equal(ground.snapshot().groundHeightCacheBuilds, 1);
    runtime.dispose();
    assert.equal(canvases[0].width, 0); assert.equal(canvases[0].height, 0);
    assert.equal(ground.snapshot().ownedHeightCanvases, 0);
    assert.equal(ground.snapshot().groundHeightCacheBytes, 0);
    assert.deepEqual(ground._walls, []);
    assert.deepEqual(ground.visibleWalls(owner, left, top), []);
    assert.equal(ground.draw(context, owner, image, left, top), 0);
  } finally { runtime.dispose(); }
});

test('throwing wall texture draws restore clip, transform, alpha and filter in the helper and runtime', options, () => {
  const harness = makeHarness();
  const { runtime, owner } = harness;
  try {
    drawTracked(harness);
    const ground = runtime._heightGround;
    const { left, top } = bounds(owner);
    const wall = ground.visibleWalls(owner, left, top)[0];
    const image = owner.assets.get(runtime._ground.src).image;
    const boom = new Error('wall texture failure');
    const throwing = fakeContext(() => { throw boom; });
    throwing.globalAlpha = 0.37; throwing.filter = 'saturate(0.73)'; throwing.translate(11, 23);
    const before = throwing.state();
    assert.throws(() => ground.drawWall(throwing, wall, image, left, top,
      { alpha: 0.19, brightness: 0.83, saturation: 0.42 }), error => error === boom);
    assert.deepEqual(throwing.state(), before);

    let inWall = false;
    const context = fakeContext(() => { if (inWall) throw boom; });
    context.globalAlpha = 0.41; context.filter = 'brightness(0.92)'; context.translate(7, 13);
    const runtimeBefore = context.state();
    const original = ground.drawWall;
    ground.drawWall = function (...args) {
      inWall = true;
      try { return original.apply(this, args); } finally { inWall = false; }
    };
    try {
      assert.throws(() => runtime.draw(context, owner, { actorFrame, drawActor() {} }), error => error === boom);
      assert.deepEqual(context.state(), runtimeBefore);
      assert.deepEqual(runtime.scene, project.sourcePreview);
    } finally { ground.drawWall = original; }
  } finally { runtime.dispose(); }
});
