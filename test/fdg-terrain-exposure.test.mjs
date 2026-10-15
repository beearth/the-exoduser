import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { SourcePreviewRuntime } from '../engine/fdg/source-preview-runtime.js';
import { validateSourcePreview, sampleSourcePreviewHeight, attachSourcePreviewAppearance } from '../engine/fdg/source-preview.js';
import { createSourcePreviewAppearance, validateSourcePreviewAppearance } from '../engine/fdg/source-preview-appearance.js';

// The owner supplies this unit's public-input candidate. No image bytes or old
// proof/test modules are read; all Canvas observations below are operation-level.
const qaPath = process.env.FDG_TERRAIN_EXPOSURE_QA || '/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-world-pilot-20261010/engine-stage0-terrain-exposure-final/ch1-1.terrain-exposure-engine-authoring.qa.fdg.json';
const project = existsSync(qaPath) ? JSON.parse(readFileSync(qaPath, 'utf8')) : null;
const options = { skip: project ? false : `Explicit terrain-exposure QA input unavailable: ${qaPath}` };
const actorFrame = { width: 96, height: 96, anchorX: 0.5, anchorY: 0.85 };
const epsilon = 1e-7;
const canvasModule = process.env.FDG_TERRAIN_TEST_CANVAS_MODULE || '/Users/fordeargamers/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@napi-rs/canvas';
const nativeCanvas = existsSync(`${canvasModule}/package.json`) ? createRequire(import.meta.url)(canvasModule) : null;

function multiply(a, b) {
  return [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
}

function fakeContext() {
  const stack = [];
  let matrix = [1, 0, 0, 1, 0, 0], clipDepth = 0, path = [];
  const context = {
    globalAlpha: 1, filter: 'none', globalCompositeOperation: 'source-over', operations: [], onDraw: null,
    state() { return { alpha: this.globalAlpha, filter: this.filter, composite: this.globalCompositeOperation,
      matrix: [...matrix], clipDepth, stackDepth: stack.length }; },
    save() { stack.push(this.state()); },
    restore() {
      assert.ok(stack.length, 'Canvas restore must match save');
      const saved = stack.pop();
      this.globalAlpha = saved.alpha; this.filter = saved.filter; this.globalCompositeOperation = saved.composite;
      matrix = saved.matrix; clipDepth = saved.clipDepth;
    },
    beginPath() { path = []; },
    moveTo(...point) { path.push({ kind: 'moveTo', point }); },
    lineTo(...point) { path.push({ kind: 'lineTo', point }); },
    rect(...rect) { path.push({ kind: 'rect', rect }); },
    closePath() { path.push({ kind: 'closePath' }); },
    ellipse(...values) { path.push({ kind: 'ellipse', values }); },
    clip(rule) { clipDepth++; this.operations.push({ kind: 'clip', rule, path: structuredClone(path), ...this.state() }); },
    fill(rule) { this.operations.push({ kind: 'fill', rule, path: structuredClone(path), ...this.state() }); },
    clearRect(...rect) { this.operations.push({ kind: 'clearRect', rect, ...this.state() }); },
    getImageData(x, y, width, height) {
      this.operations.push({ kind: 'getImageData', rect: [x, y, width, height] });
      const data = new Uint8ClampedArray(width * height * 4);
      // Explicit deterministic hard-alpha fixture: two overlapping rectangles.
      // This is not a claim about the real source mask or source opaque pixels.
      for (let py = 100; py < 150; py++) for (let px = 120; px < 220; px++) {
        if ((px < 180 && py < 130) || (px >= 160 && py >= 115)) data[(py * width + px) * 4 + 3] = 255;
      }
      return { data, width, height };
    },
    transform(...values) { matrix = multiply(matrix, values); },
    translate(x, y) { this.transform(1, 0, 0, 1, x, y); },
    setTransform(...values) { matrix = values; },
    resetTransform() { matrix = [1, 0, 0, 1, 0, 0]; },
    drawImage(image, ...args) {
      const operation = { kind: 'drawImage', image, args, path: structuredClone(path), ...this.state() };
      this.operations.push(operation); this.onDraw?.(operation);
    },
  };
  return context;
}

function makeHarness(scene = project.sourcePreview, position = scene.actor.position) {
  const canvases = [];
  const canvasFactory = () => {
    const context = fakeContext();
    const canvas = { width: 0, height: 0, context, getContext: () => context };
    canvases.push(canvas); return canvas;
  };
  const runtime = new SourcePreviewRuntime(scene, project.map, { canvasFactory });
  const assets = new Map();
  for (const layer of [...scene.imageLayers, ...scene.groundLayers]) {
    assets.set(layer.src, { status: 'ready', image: { src: layer.src,
      naturalWidth: layer.sourceRect[2], naturalHeight: layer.sourceRect[3] } });
  }
  const [x, y] = position;
  const height = sampleSourcePreviewHeight(scene, x, y, { validated: true });
  assert.equal(height.ok, true);
  const owner = { assets, width: 772, height: 370, player: { x, y, z: height.engineFootZ, radius: 12 },
    camera: { x, y: y - height.engineFootZ, follow: true } };
  const context = fakeContext();
  return { runtime, owner, context, canvases };
}

function viewport(owner) {
  return { left: owner.camera.x - owner.width / 2, top: owner.camera.y - owner.height / 2 };
}

function build(harness, withActor = false) {
  return harness.runtime.draw(harness.context, harness.owner,
    withActor ? { actorFrame, drawActor() {} } : {});
}

function eligibleLayer(harness) {
  const { runtime, owner } = harness;
  const ground = runtime._heightGround;
  for (const entry of runtime._layers) {
    const image = owner.assets.get(entry.layer.src).image;
    if (ground.prepareExposedLayer(entry, image, owner)) return { entry, image };
  }
  assert.fail('The explicit current QA must include a prop in front of projected terrain coverage');
}

test('optional terrain authoring is explicit, strict, snapshot-matched and absent in legacy inputs', options, () => {
  const appearance = structuredClone(project.sourcePreview.appearancePreview);
  const cut = appearance.terrainCutaway;
  assert.equal(cut.kind, 'projected-height-region');
  assert.equal(cut.authority, 'ENGINE_AUTHORING');
  assert.equal(cut.foregroundOpacity, 0.10); assert.equal(cut.featherPx, 24);
  assert.equal(cut.depthPolicy, 'after-region-max-projected-depth');
  assert.equal(cut.sourcePhysicalZClaim, false); assert.ok(cut.authoredBy.trim());
  assert.equal(validateSourcePreviewAppearance(appearance).ok, true);
  for (const [key, value] of [['kind', 'whole-map'], ['authority', 'SOURCE'], ['foregroundOpacity', -0.01],
    ['foregroundOpacity', 1.01], ['featherPx', 0], ['featherPx', 65], ['depthPolicy', 'always'],
    ['authoredBy', ' '], ['sourcePhysicalZClaim', true]]) {
    const bad = structuredClone(appearance); bad.terrainCutaway[key] = value;
    assert.equal(validateSourcePreviewAppearance(bad).ok, false, `${key}=${value} must reject`);
  }
  const missing = structuredClone(appearance); delete missing.terrainCutaway.foregroundOpacity;
  assert.equal(createSourcePreviewAppearance(missing).ok, false, 'A missing value must not receive an authored default');
  const mismatch = structuredClone(project.sourcePreview);
  mismatch.provenance.appearanceEngineAuthoredInputSnapshot.terrainCutaway.foregroundOpacity = 0.20;
  assert.equal(validateSourcePreview(mismatch).ok, false);
  const legacyAppearance = structuredClone(appearance); delete legacyAppearance.terrainCutaway;
  const legacy = attachSourcePreviewAppearance(project.sourcePreview, { appearancePreview: legacyAppearance });
  assert.equal(legacy.ok, true);
  assert.equal(Object.hasOwn(legacy.sourcePreview.appearancePreview, 'terrainCutaway'), false);
  assert.deepEqual(legacy.sourcePreview.provenance.appearanceEngineAuthoredInputSnapshot, legacyAppearance);
  assert.deepEqual(project.sourcePreview.appearancePreview, appearance);
});

test('projected terrain coverage gates only deeper props and preserves the original actor and wall painter order', options, t => {
  const harness = makeHarness();
  const { runtime, owner } = harness;
  try {
    const counts = build(harness, true);
    const ground = runtime._heightGround;
    assert.ok(ground._terrainCoverage.length > 0);
    assert.ok(Number.isFinite(ground._terrainDepth));
    const points = ground._terrainCoverage.flat();
    assert.ok(points.every(point => point.length === 2 && point.every(Number.isFinite)));
    const projectedMax = Math.max(...points.map(point => point[1] + ground.bounds.y - ground.zMax));
    assert.ok(Math.abs(projectedMax - ground._terrainDepth) <= epsilon);
    const { entry, image } = eligibleLayer(harness);
    assert.equal(ground.prepareExposedLayer({ ...entry, depth: ground._terrainDepth }, image, owner), false);
    assert.equal(ground.prepareExposedLayer({ ...entry, depth: ground._terrainDepth - 1 }, image, owner), false);
    assert.equal(ground.prepareExposedLayer({ ...entry, depth: ground._terrainDepth + 1 }, image, owner), true);
    assert.ok(counts.terrainCutawayObjects > 0);
    assert.equal(counts.terrainCutawayScratchDrawCalls, counts.terrainCutawayObjects * 2);
    let actorCalls = 0;
    const order = [];
    const originalWall = ground.drawWall;
    ground.drawWall = function (ctx, wall, ...args) {
      order.push({ kind: 'wall', depth: wall.depth }); return originalWall.call(this, ctx, wall, ...args);
    };
    const originalPrepare = ground.prepareExposedLayer;
    ground.prepareExposedLayer = function (renderEntry, ...args) {
      order.push({ kind: 'prop', depth: renderEntry.depth });
      return originalPrepare.call(this, renderEntry, ...args);
    };
    try {
      runtime.draw(fakeContext(), owner, { actorFrame, drawActor() {
        actorCalls++; order.push({ kind: 'actor', depth: owner.player.y - owner.player.z });
      } });
    } finally { ground.drawWall = originalWall; ground.prepareExposedLayer = originalPrepare; }
    assert.equal(actorCalls, 1);
    const actorIndex = order.findIndex(event => event.kind === 'actor');
    for (const event of order.slice(0, actorIndex)) assert.ok(event.depth <= owner.player.y - owner.player.z);
    for (const event of order.slice(actorIndex + 1)) assert.ok(event.depth > owner.player.y - owner.player.z);
    const sequence = order.filter(event => event.kind !== 'actor');
    assert.ok(sequence.every((event, index) => !index || sequence[index - 1].depth <= event.depth));
    assert.deepEqual(runtime.scene, project.sourcePreview);
    const receipts = [];
    for (const [label, position] of [['mid', [5216, 3986.8]], ['summit', [5405.8, 3986.8]]]) {
      const view = makeHarness(project.sourcePreview, position);
      const accepted = [];
      const viewGround = view.runtime._heightGround;
      const original = viewGround.prepareExposedLayer;
      viewGround.prepareExposedLayer = function (renderEntry, ...args) {
        const result = original.call(this, renderEntry, ...args);
        if (result) accepted.push({ id: renderEntry.layer.id, projectedDepth: renderEntry.depth });
        return result;
      };
      try {
        const viewCounts = build(view, true);
        receipts.push({ label, viewport: [772, 370], actorWorld: position,
          actorEngineFootZ: view.owner.player.z, actorProjectedDepth: view.owner.player.y - view.owner.player.z,
          regionProjectedDepth: viewGround._terrainDepth, coveragePolygons: viewGround._terrainCoverage.length,
          terrainCutawayMaskReadbacks: viewGround.snapshot().terrainCutawayMaskReadbacks,
          deterministicFixtureClipRects: viewGround.snapshot().terrainCutawayClipRects,
          accepted, terrainCutawayObjects: viewCounts.terrainCutawayObjects,
          terrainCutawayDrawCalls: viewCounts.terrainCutawayDrawCalls,
          terrainCutawayScratchDrawCalls: viewCounts.terrainCutawayScratchDrawCalls,
          actorCutawayObjects: viewCounts.foregroundCutawayObjects, visualVerdict: 'NOT_ASSESSED_BY_FAKE_CANVAS' });
        assert.equal(accepted.length, viewCounts.terrainCutawayObjects);
        assert.ok(accepted.every(item => item.projectedDepth > viewGround._terrainDepth));
        assert.deepEqual(view.runtime.scene, project.sourcePreview);
      } finally { viewGround.prepareExposedLayer = original; view.runtime.dispose(); }
    }
    t.diagnostic(`TERRAIN_EXPOSURE ${JSON.stringify({ qaPath, renderingOnly: true, receipts })}`);
  } finally { runtime.dispose(); }
});

test('hard-mask overlap becomes a disjoint clip union, keeping direct PNG outside and source-colored scratch inside', options, () => {
  const harness = makeHarness();
  const { runtime, owner } = harness;
  try {
    const counts = build(harness);
    const ground = runtime._heightGround;
    const mask = ground.terrainMaskCanvas, scratch = ground.scratchCanvas;
    assert.ok(mask && scratch);
    const maskDraws = mask.context.operations.filter(operation => operation.kind === 'drawImage');
    const blurred = maskDraws.findIndex(operation => operation.filter === 'blur(24px)');
    const hard = maskDraws.findIndex(operation => operation.composite === 'destination-in');
    assert.ok(blurred >= 0 && hard > blurred, 'Blur must be multiplied by hard coverage to leave outside alpha zero');
    const polygonClip = scratch.context.operations.find(operation => operation.kind === 'clip');
    assert.equal(polygonClip.path.filter(item => ['moveTo', 'lineTo'].includes(item.kind)).length,
      project.sourcePreview.groundClip.polygon.length, 'Hard coverage retains the existing projected source polygon clip');
    assert.deepEqual(ground._terrainClipRects, [[120, 100, 60, 15], [120, 115, 100, 15], [160, 130, 60, 20]],
      'Overlapping alpha must form a row-run union, with identical runs merged vertically');
    assert.equal(ground.snapshot().terrainCutawayMaskReadbacks, 1);
    const { entry, image } = eligibleLayer(harness);
    scratch.context.operations.length = 0;
    assert.equal(ground.prepareExposedLayer(entry, image, owner), true);
    const scratchDraws = scratch.context.operations.filter(operation => operation.kind === 'drawImage');
    assert.equal(scratchDraws.length, 2);
    assert.equal(scratchDraws[0].image, image); assert.equal(scratchDraws[0].args.length, 8);
    assert.deepEqual(scratchDraws[0].args.slice(0, 4), entry.layer.sourceRect);
    assert.equal(scratchDraws[0].filter, `brightness(${entry.layer.brightness}) saturate(${entry.layer.saturation})`);
    assert.equal(scratchDraws[1].image, mask);
    assert.equal(scratchDraws[1].composite, 'destination-out'); assert.equal(scratchDraws[1].alpha, 0.90);
    const context = fakeContext(); const { left, top } = viewport(owner);
    context.filter = `brightness(${entry.layer.brightness}) saturate(${entry.layer.saturation})`;
    context.globalAlpha = entry.layer.opacity;
    assert.equal(ground.drawExposedLayer(context, owner, entry, image, left, top), 2);
    const draws = context.operations.filter(operation => operation.kind === 'drawImage');
    assert.equal(draws.length, 2); assert.equal(draws[0].image, image); assert.equal(draws[1].image, scratch);
    assert.equal(draws[0].filter, `brightness(${entry.layer.brightness}) saturate(${entry.layer.saturation})`);
    assert.equal(draws[0].alpha, entry.layer.opacity); assert.equal(draws[1].alpha, entry.layer.opacity);
    assert.equal(draws[1].filter, 'none', 'Native scratch colors must not be filtered a second time');
    const clips = context.operations.filter(operation => operation.kind === 'clip');
    assert.equal(clips.length, 2);
    assert.equal(clips[0].rule, 'evenodd'); assert.equal(clips[1].rule, 'nonzero');
    assert.deepEqual(clips[0].path.slice(1).map(item => item.rect), ground._terrainClipRects);
    assert.deepEqual(clips[1].path.map(item => item.rect), ground._terrainClipRects);
    assert.equal(clips[0].path.length, ground._terrainClipRects.length + 1,
      'Only the disjoint union and image exterior define the complement; cache bbox replacement is forbidden');
    assert.equal(counts.terrainCutawayDrawCalls, counts.terrainCutawayObjects * 2);
    assert.deepEqual(runtime.scene, project.sourcePreview);
  } finally { runtime.dispose(); }
});

test('floor, mask and scratch reuse three owner-local canvases; absent or opacity-one authoring allocates no exposure canvases', options, () => {
  const harness = makeHarness();
  const { runtime, canvases } = harness;
  const ground = runtime._heightGround;
  try {
    build(harness); build(harness);
    assert.equal(canvases.length, 3);
    const snapshot = ground.snapshot();
    assert.equal(snapshot.groundHeightCacheBuilds, 1);
    assert.equal(snapshot.terrainCutawayMaskBuilds, 1);
    assert.equal(snapshot.terrainCutawayMaskReadbacks, 1);
    assert.equal(snapshot.terrainCutawayClipRects, 3);
    assert.equal(snapshot.ownedTerrainCutawayCanvases, 2);
    assert.ok(snapshot.terrainCutawayCacheBytes > 0);
    assert.deepEqual(ground.visibleWalls(harness.owner, 10000, 10000), []);
    assert.equal(ground.draw(fakeContext(), harness.owner, harness.owner.assets.get(runtime._ground.src).image, 10000, 10000), 0);
    assert.equal(ground.snapshot().terrainCutawayMaskBuilds, 1);
    runtime.dispose();
    assert.ok(canvases.every(canvas => canvas.width === 0 && canvas.height === 0));
    assert.equal(ground.snapshot().ownedHeightCanvases, 0);
    assert.equal(ground.snapshot().ownedTerrainCutawayCanvases, 0);
    assert.equal(ground.snapshot().terrainCutawayCacheBytes, 0);
    assert.deepEqual(ground._terrainCoverage, []);
    assert.deepEqual(ground._terrainClipRects, []);
    assert.equal(ground._terrainClipPath, null);
    assert.equal(ground._terrainOutsidePaths.size, 0);
  } finally { runtime.dispose(); }
  for (const opacity of [undefined, 1]) {
    const appearance = structuredClone(project.sourcePreview.appearancePreview);
    if (opacity === undefined) delete appearance.terrainCutaway;
    else appearance.terrainCutaway.foregroundOpacity = opacity;
    const attached = attachSourcePreviewAppearance(project.sourcePreview, { appearancePreview: appearance });
    assert.equal(attached.ok, true);
    const legacy = makeHarness(attached.sourcePreview);
    try {
      const counts = build(legacy);
      assert.equal(legacy.canvases.length, 1);
      assert.equal(legacy.runtime._heightGround.snapshot().ownedTerrainCutawayCanvases, 0);
      assert.equal(counts.terrainCutawayObjects, 0);
    } finally { legacy.runtime.dispose(); }
  }
});

test('procedural DPR2 RGBA preserves sufficiently-outside pixels while applying exposure inside the actual projected union',
  { skip: !project ? options.skip : !nativeCanvas ? 'Explicit native Canvas test runtime unavailable' : false }, t => {
    const harness = makeHarness();
    const { runtime, owner } = harness;
    const ground = runtime._heightGround;
    const owned = [];
    ground.factory = () => { const canvas = nativeCanvas.createCanvas(1, 1); owned.push(canvas); return canvas; };
    owner.width = 770; owner.height = 371; owner.camera = { x: 5400, y: 3922.8, follow: true };
    const makeTexture = (width, height) => {
      const image = nativeCanvas.createCanvas(width, height), ctx = image.getContext('2d');
      image.naturalWidth = width; image.naturalHeight = height;
      ctx.fillStyle = '#314a57'; ctx.fillRect(0, 0, width, height);
      for (let y = 0; y < height; y += 8) for (let x = 0; x < width; x += 8) {
        ctx.fillStyle = (x / 8 + y / 8) % 2 ? '#e2b44c' : '#406473'; ctx.fillRect(x, y, 8, 8);
      }
      return image;
    };
    try {
      const soil = makeTexture(1024, 1024);
      ground._build(soil, owner);
      const entry = runtime._layers.find(item => item.layer.id === 'native-visual-072');
      assert.ok(entry);
      const image = makeTexture(entry.layer.sourceRect[2], entry.layer.sourceRect[3]);
      assert.equal(ground.prepareExposedLayer(entry, image, owner), true);
      const dpr = 2, width = owner.width * dpr, height = owner.height * dpr;
      const baseline = nativeCanvas.createCanvas(width, height), exposed = nativeCanvas.createCanvas(width, height);
      const { left, top } = viewport(owner);
      for (const canvas of [baseline, exposed]) {
        const ctx = canvas.getContext('2d'); ctx.fillStyle = '#293d49'; ctx.fillRect(0, 0, width, height);
        ctx.scale(dpr, dpr); ctx.globalAlpha = entry.layer.opacity;
        ctx.filter = `brightness(${entry.layer.brightness}) saturate(${entry.layer.saturation})`;
      }
      const [wx, wy, w, h] = entry.layer.worldRect;
      baseline.getContext('2d').drawImage(image, ...entry.layer.sourceRect, wx - left, wy - top - entry.z, w, h);
      assert.equal(ground.drawExposedLayer(exposed.getContext('2d'), owner, entry, image, left, top), 2);
      const hard = nativeCanvas.createCanvas(width, height), expanded = nativeCanvas.createCanvas(width, height);
      for (const [canvas, padding] of [[hard, 0], [expanded, 16]]) {
        const ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
        ctx.translate(ground.bounds.x - left, ground.bounds.y - top - ground.zMax); ctx.fillStyle = '#fff';
        for (const [x, y, rw, rh] of ground._terrainClipRects) ctx.fillRect(x - padding, y - padding, rw + padding * 2, rh + padding * 2);
      }
      const directPixels = baseline.getContext('2d').getImageData(0, 0, width, height).data;
      const exposedPixels = exposed.getContext('2d').getImageData(0, 0, width, height).data;
      const hardPixels = hard.getContext('2d').getImageData(0, 0, width, height).data;
      const expandedPixels = expanded.getContext('2d').getImageData(0, 0, width, height).data;
      let outsidePixels = 0, outsideChanged = 0, outsideMax = 0, insideChanged = 0;
      for (let offset = 0; offset < directPixels.length; offset += 4) {
        let delta = 0;
        for (let channel = 0; channel < 4; channel++) delta = Math.max(delta, Math.abs(directPixels[offset + channel] - exposedPixels[offset + channel]));
        if (!expandedPixels[offset + 3]) { outsidePixels++; outsideChanged += delta > 0; outsideMax = Math.max(outsideMax, delta); }
        if (hardPixels[offset + 3]) insideChanged += delta > 0;
      }
      assert.ok(outsidePixels > 1000);
      assert.ok(insideChanged > 0, 'Preservation must not disable the requested inside exposure');
      assert.ok(outsideMax <= 2, `Outside coverage must retain direct rendering; observed delta ${outsideMax}`);
      assert.equal(ground.snapshot().terrainCutawayMaskReadbacks, 1);
      assert.equal(owned.length, 3);
      assert.deepEqual(runtime.scene, project.sourcePreview);
      t.diagnostic(`PROCEDURAL_TERRAIN_PIXEL ${JSON.stringify({ dpr, imageBytesRead: 0, texture: 'procedural8px-checker',
        outsideMarginCssPx: 16, outsidePixels, outsideChanged, outsideMaxRgbaDelta: outsideMax,
        insideChanged, actualProjectedClipRects: ground._terrainClipRects.length, renderer: 'bundled @napi-rs/canvas',
        browserVisualVerdict: 'NOT_ASSESSED' })}`);
    } finally {
      runtime.dispose();
      // This native test backend coerces zero dimensions; the browser-like
      // fixture above verifies the actual width/height=0 calls separately.
      assert.equal(ground.canvas, null); assert.equal(ground.terrainMaskCanvas, null); assert.equal(ground.scratchCanvas, null);
      assert.equal(ground.snapshot().ownedHeightCanvases, 0);
      assert.equal(ground.snapshot().ownedTerrainCutawayCanvases, 0);
      assert.deepEqual(ground._terrainClipRects, []);
    }
  });

test('throwing scratch and main exposure draws restore composite, transform, clip, filter and alpha without changing source data', options, () => {
  const harness = makeHarness();
  const { runtime, owner } = harness;
  try {
    build(harness);
    const ground = runtime._heightGround;
    const { entry, image } = eligibleLayer(harness);
    const boom = new Error('terrain exposure draw failure');
    const mask = ground.terrainMaskCanvas.context;
    mask.globalAlpha = 0.31; mask.filter = 'brightness(0.87)'; mask.globalCompositeOperation = 'xor';
    mask.translate(3, 5);
    const maskBefore = mask.state();
    const hardBefore = ground.scratchCanvas.context.state();
    mask.onDraw = () => { throw boom; };
    try {
      assert.throws(() => ground._buildTerrainMask(owner), error => error === boom);
      assert.deepEqual(mask.state(), maskBefore);
      assert.deepEqual(ground.scratchCanvas.context.state(), hardBefore);
    } finally { mask.onDraw = null; }
    const scratch = ground.scratchCanvas.context;
    scratch.globalAlpha = 0.37; scratch.filter = 'saturate(0.73)'; scratch.globalCompositeOperation = 'xor';
    scratch.translate(11, 23);
    const before = scratch.state();
    scratch.onDraw = () => { throw boom; };
    try {
      assert.throws(() => ground.prepareExposedLayer(entry, image, owner), error => error === boom);
      assert.deepEqual(scratch.state(), before);
    } finally { scratch.onDraw = null; }
    assert.equal(ground.prepareExposedLayer(entry, image, owner), true);
    const { left, top } = viewport(owner);
    for (const failingImage of [image, ground.scratchCanvas]) {
      const context = fakeContext();
      context.globalAlpha = 0.41; context.filter = 'brightness(0.92)'; context.globalCompositeOperation = 'multiply';
      context.translate(7, 13);
      const initial = context.state();
      context.onDraw = operation => { if (operation.image === failingImage) throw boom; };
      assert.throws(() => ground.drawExposedLayer(context, owner, entry, image, left, top), error => error === boom);
      assert.deepEqual(context.state(), initial);
    }
    assert.deepEqual(runtime.scene, project.sourcePreview);
  } finally { runtime.dispose(); }
});
