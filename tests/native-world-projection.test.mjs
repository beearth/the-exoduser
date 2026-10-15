import test from 'node:test';
import assert from 'node:assert/strict';
import { createNativeWorldProjection, drawCanvasTexturedTriangle } from '../engine/fdg/native-world-projection.js';
import { WORLD_CAMERA_DEFAULTS } from '../engine/fdg/world-camera.js';

const camera = { ...WORLD_CAMERA_DEFAULTS };
const options = extra => ({ camera, center: { x: 0, y: 0 }, viewport: { width: 1280, height: 720 }, ...extra });
const close = (a, b, tolerance = 1e-7) => assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);
const mul = (a, b) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
function fakeContext() {
  const stack = [], calls = [], polygons = [], images = [];
  let matrix = [1, 0, 0, 1, 0, 0], path = [];
  const styles = ['globalAlpha', 'fillStyle', 'strokeStyle', 'lineWidth', 'font', 'globalCompositeOperation', 'filter', 'textAlign', 'textBaseline', 'imageSmoothingEnabled'];
  const raw = {
    calls, polygons, images, globalAlpha: 1, fillStyle: '#fff', strokeStyle: '#f00', lineWidth: 2, font: '12px sans-serif',
    globalCompositeOperation: 'source-over', filter: 'none', textAlign: 'left', textBaseline: 'alphabetic', imageSmoothingEnabled: true,
    save() { stack.push({ matrix: [...matrix], styles: Object.fromEntries(styles.map(key => [key, this[key]])) }); calls.push(['save']); },
    restore() { const state = stack.pop(); assert.ok(state, 'raw restore balanced'); matrix = state.matrix; Object.assign(this, state.styles); calls.push(['restore']); },
    setTransform(...m) { matrix = m; calls.push(['setTransform', ...m]); },
    transform(...m) { matrix = mul(matrix, m); calls.push(['transform', ...m]); },
    translate(x, y) { matrix = mul(matrix, [1, 0, 0, 1, x, y]); },
    scale(x, y) { matrix = mul(matrix, [x, 0, 0, y, 0, 0]); },
    rotate(a) { matrix = mul(matrix, [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0]); },
    beginPath() { path = []; }, moveTo(x, y) { path.push({ x, y }); }, lineTo(x, y) { path.push({ x, y }); }, closePath() {},
    fill() { polygons.push({ points: path.map(p => ({ ...p })), matrix: [...matrix], fillStyle: this.fillStyle,
      globalAlpha: this.globalAlpha, globalCompositeOperation: this.globalCompositeOperation, filter: this.filter }); },
    stroke() { calls.push(['stroke']); }, clip() { calls.push(['clip']); },
    fillRect(...args) { calls.push(['fillRect', ...args]); }, strokeRect(...args) { calls.push(['strokeRect', ...args]); },
    drawImage(...args) { images.push({ args, matrix: [...matrix] }); },
    fillText(...args) { calls.push(['fillText', ...args]); }, strokeText(...args) { calls.push(['strokeText', ...args]); },
    createLinearGradient(...args) { calls.push(['gradient', ...args]); return { addColorStop() {} }; },
    createRadialGradient(...args) { calls.push(['radial', ...args]); return { addColorStop() {} }; },
    getTransform() { const [a, b, c, d, e, f] = matrix; return { a, b, c, d, e, f }; },
    measureText(text) { return { width: text.length * 6 }; },
    get depth() { return stack.length; }, get matrix() { return [...matrix]; },
  };
  return raw;
}
function recorder() {
  const triangles = [];
  const adapter = createNativeWorldProjection({ drawTexturedTriangle: (raw, image, vertices, alpha) => triangles.push({ image, vertices, alpha, matrix: raw.matrix }) });
  return { adapter, triangles };
}
const bbox = points => ({ minX: Math.min(...points.map(p => p.x)), maxX: Math.max(...points.map(p => p.x)), minY: Math.min(...points.map(p => p.y)), maxY: Math.max(...points.map(p => p.y)) });

test('ground perspective shrinks far geometry and enlarges near geometry', () => {
  const raw = fakeContext(), { adapter, triangles } = recorder();
  const X = adapter.begin(raw, options());
  const image = { width: 32, height: 32 };
  X.drawImage(image, -16, -516, 32, 32); const far = bbox(triangles.splice(0).flatMap(t => t.vertices));
  X.drawImage(image, -16, 184, 32, 32); const near = bbox(triangles.flatMap(t => t.vertices));
  assert.ok(near.maxX - near.minX > far.maxX - far.minX);
  assert.ok(near.maxY - near.minY > far.maxY - far.minY);
  adapter.end(); assert.equal(raw.depth, 0);
});

test('sampled ellipse hazard stays on the common ground projection', () => {
  const raw = fakeContext(), adapter = createNativeWorldProjection();
  const X = adapter.begin(raw, options({ camera: { ...camera, yaw: 0.3 } }));
  X.beginPath(); X.ellipse(0, 0, 120, 60, 0, 0, Math.PI * 2); X.fill();
  const points = raw.polygons.flatMap(p => p.points), projected = adapter.project(120, 0);
  assert.ok(points.some(p => Math.hypot(p.x - projected.x, p.y - projected.y) < 1e-6));
  assert.ok(raw.polygons.every(p => p.points.length === 3));
  adapter.end();
});

test('source-pixel UVs interpolate exactly at the near clipping plane', () => {
  const raw = fakeContext(), { adapter, triangles } = recorder();
  const nearCamera = { ...camera, distance: 600, near: 128 };
  const planeY = (nearCamera.distance - nearCamera.near) / Math.cos(nearCamera.pitch);
  adapter.begin(raw, options({ camera: nearCamera, viewport: { width: 20000, height: 20000 } }));
  adapter.context.drawImage({ width: 200, height: 200 }, 10, 20, 100, 100, -30, planeY - 20, 60, 40);
  assert.ok(triangles.length > 0);
  const vertices = triangles.flatMap(t => t.vertices);
  assert.ok(vertices.some(v => Math.abs(v.v - 70) < 1e-6), 'clipped midpoint UV v=70');
  assert.ok(vertices.every(v => Object.values(v).every(Number.isFinite)));
  assert.ok(vertices.every(v => v.u >= 10 - 1e-7 && v.u <= 110 + 1e-7 && v.v <= 70 + 1e-7));
  adapter.end();
});

test('actor billboard preserves source ratio and native foot/model transforms', () => {
  const raw = fakeContext(), { adapter, triangles } = recorder();
  const X = adapter.begin(raw, options());
  X.save(); X.translate(100, 100); adapter.pushBillboard(100, 100);
  X.drawImage({ width: 100, height: 200 }, -50, -200, 100, 200);
  const body = bbox(triangles.flatMap(t => t.vertices)), foot = adapter.project(100, 100);
  close((body.maxY - body.minY) / (body.maxX - body.minX), 2);
  close(body.maxY, foot.y); close((body.minX + body.maxX) / 2, foot.x);
  adapter.popBillboard(); X.restore(); adapter.end(); assert.equal(raw.depth, 0);
});

test('forward/inverse matching accounts for yaw, shake and only one SSAA scale', () => {
  const raw = fakeContext(), { adapter, triangles } = recorder();
  adapter.begin(raw, options({ camera: { ...camera, yaw: -0.45 }, center: { x: 800, y: 1200 }, pixelScale: 2, shake: { x: 7, y: -3 } }));
  for (const point of [{ x: 800, y: 1200 }, { x: 910, y: 1120 }, { x: 680, y: 1360 }]) {
    const screen = adapter.project(point.x, point.y), inverse = adapter.unproject(screen.x, screen.y);
    close(inverse.x, point.x); close(inverse.y, point.y);
  }
  adapter.context.drawImage({ width: 16, height: 16 }, 792, 1192);
  assert.ok(triangles.length > 0); assert.deepEqual(triangles[0].matrix, [2, 0, 0, 2, 0, 0]);
  const b = bbox(triangles.flatMap(t => t.vertices)); assert.ok(b.minX < 647 && b.maxX > 647);
  adapter.end();
});

test('screen scope forwards native HUD operations and restores the world model', () => {
  const raw = fakeContext(), adapter = createNativeWorldProjection();
  const X = adapter.begin(raw, options({ pixelScale: 2 }));
  X.translate(10, 20); X.save(); X.setTransform(1, 0, 0, 1, 0, 0); X.fillRect(2, 3, 4, 5);
  assert.deepEqual(raw.calls.at(-1), ['fillRect', 2, 3, 4, 5]); assert.equal(adapter.snapshot().screen, true);
  X.restore(); assert.deepEqual(adapter.snapshot().model, [1, 0, 0, 1, 10, 20]); assert.equal(adapter.snapshot().screen, false);
  X.save(); X.setTransform(1, 0, 0, 1, 0, 0); adapter.resetWorld();
  assert.deepEqual(raw.matrix, [2, 0, 0, 2, 0, 0]); X.restore(); adapter.end(); assert.equal(raw.depth, 0);
});

test('inactive adapter forwards context calls and end unwinds unfinished saves', () => {
  const raw = fakeContext(), adapter = createNativeWorldProjection();
  assert.equal(adapter.active, false);
  adapter.begin(raw, options()); assert.equal(adapter.active, true);
  adapter.context.save(); adapter.context.save(); adapter.end(); assert.equal(adapter.active, false);
  assert.equal(raw.depth, 0);
  adapter.context.fillRect(1, 2, 3, 4); assert.deepEqual(raw.calls.at(-1), ['fillRect', 1, 2, 3, 4]);
  assert.equal(adapter.context.measureText('abc').width, 18);
  assert.deepEqual(raw.matrix, [1, 0, 0, 1, 0, 0]);
});

test('concave polygons are triangulated without covering their missing corner', () => {
  const raw = fakeContext(), adapter = createNativeWorldProjection();
  const X = adapter.begin(raw, options());
  adapter.pushBillboard(0, 0); X.beginPath();
  for (const [index, [x, y]] of [[0, 0], [100, 0], [100, 30], [30, 30], [30, 100], [0, 100]].entries()) index ? X.lineTo(x, y) : X.moveTo(x, y);
  X.closePath(); X.fill(); assert.equal(raw.polygons.length, 4);
  const area = raw.polygons.reduce((sum, polygon) => { const [a, b, c] = polygon.points; return sum + Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) / 2; }, 0);
  close(area, 5100); adapter.popBillboard(); adapter.end();
});

test('ground danger inside actor scope can explicitly return to ground projection', () => {
  const raw = fakeContext(), adapter = createNativeWorldProjection();
  const X = adapter.begin(raw, options()); adapter.pushBillboard(0, 0); X.translate(300, 400); X.scale(1.8, 1.8);
  adapter.withGround(() => X.fillRect(-100, -100, 200, 200));
  const top = adapter.project(-100, -100), p = raw.polygons.flatMap(t => t.points);
  assert.ok(p.some(v => Math.hypot(v.x - top.x, v.y - top.y) < 1e-6));
  assert.ok(adapter.snapshot().billboard); assert.deepEqual(adapter.snapshot().model, [1.8, 0, 0, 1.8, 300, 400]); adapter.popBillboard(); adapter.end();
});

test('nonfinite local operations are rejected without emitting GPU commands', () => {
  const raw = fakeContext(), { adapter, triangles } = recorder();
  const X = adapter.begin(raw, options()); X.translate(Infinity, 0); X.fillRect(NaN, 0, 1, 1);
  X.drawImage({ width: 10, height: 10 }, 0, 0, Infinity, 10); X.beginPath(); X.lineTo(0, NaN); X.fill();
  assert.equal(triangles.length, 0); assert.equal(raw.polygons.length, 0); assert.equal(adapter.snapshot().rejectedNonFinite, 4);
  adapter.end(); assert.equal(raw.depth, 0);
});

test('Canvas texture sink balances clip and applies source-to-screen transform', () => {
  const raw = fakeContext(); raw.setTransform(2, 0, 0, 2, 0, 0);
  const image = { width: 64, height: 64 };
  drawCanvasTexturedTriangle(raw, image, [{ x: 10, y: 20, u: 0, v: 0 }, { x: 110, y: 20, u: 50, v: 0 }, { x: 10, y: 120, u: 0, v: 50 }], 0.5);
  assert.deepEqual(raw.images[0].matrix, [4, 0, 0, 4, 20, 40]); assert.equal(raw.depth, 0);
  assert.deepEqual(raw.matrix, [2, 0, 0, 2, 0, 0]); assert.equal(raw.globalAlpha, 1);
});

test('projected text works with native GPU raw context without transform()', () => {
  const raw = fakeContext(), adapter = createNativeWorldProjection(); delete raw.transform;
  const X = adapter.begin(raw, options({ pixelScale: 2 })); X.translate(100, 20); X.fillText('world label', 0, -10);
  assert.ok(raw.calls.some(c => c[0] === 'fillText' && c[1] === 'world label'));
  assert.deepEqual(raw.matrix, [2, 0, 0, 2, 0, 0]); adapter.end(); assert.equal(raw.depth, 0);
});

test('horizon-crossing viewport clips a bounded map instead of dropping far terrain', () => {
  const raw = fakeContext(), { adapter, triangles } = recorder();
  adapter.begin(raw, options({ camera: { ...camera, distance: 600, pitch: 0.35, zoom: 0.25 },
    center: { x: 4000, y: 4000 }, viewport: { width: 1920, height: 1080 },
    mapBounds: { left: 0, top: 0, right: 8000, bottom: 8000 } }));
  const bounds = adapter.visibleBounds(); assert.ok(bounds); assert.ok(Object.values(bounds).every(Number.isFinite));
  close(bounds.minY, 0); assert.ok(bounds.maxY < 4600 && bounds.maxY > 4000);
  adapter.context.drawImage({ width: 8192, height: 8192 }, 0, 0, 8000, 8000);
  assert.ok(triangles.length > 0);
  assert.ok(triangles.flatMap(t => t.vertices).every(v => v.v <= 8192 * bounds.maxY / 8000 + 1e-6), 'pre-seed cropping preserves UVs within the visible map bounds');
  assert.ok(triangles.flatMap(t => t.vertices).every(v => Object.values(v).every(Number.isFinite)));
  adapter.end();
});

test('adaptive ground mesh respects sampled error and reduces the measured native map draw count', () => {
  const view = options({ camera: { ...camera, zoom: 0.46307730303778716 }, center: { x: 2763.5546666666664, y: 2226.512 },
    mapBounds: { left: 0, top: 0, right: 5120, bottom: 4320 } });
  const image = { width: 5120, height: 4320 };
  const measure = extra => {
    const raw = fakeContext(); let count = 0;
    const adapter = createNativeWorldProjection({ ...extra, drawTexturedTriangle: () => count++ });
    adapter.begin(raw, view); adapter.context.drawImage(image, 0, 0, 5120, 4320);
    const snapshot = adapter.snapshot(); adapter.end();
    return { count, ...snapshot };
  };
  const adaptive = measure({}), baseline = measure({ cellSize: 64, maxTextureDepth: 0 });
  assert.ok(adaptive.count < baseline.count * 0.6, `${adaptive.count} adaptive / ${baseline.count} baseline`);
  assert.equal(adaptive.textureLimitCells, 0);
  assert.ok(adaptive.maxTextureError <= 0.75 + 1e-7);
  assert.ok(adaptive.textureSplits > 0);
});

test('capable native GPU emits a large floor as one near-clipped quad with projective weights', () => {
  const raw = fakeContext(), { adapter, triangles } = recorder(); raw.projectiveTextureProjection = true; raw.globalAlpha = 0.37;
  adapter.begin(raw, options({ camera: { ...camera, zoom: 0.46307730303778716 }, center: { x: 2763.5546666666664, y: 2226.512 },
    mapBounds: { left: 0, top: 0, right: 5120, bottom: 4320 }, pixelScale: 2 }));
  const image = { width: 8192, height: 8192 };
  adapter.context.drawImage(image, 128, 64, 4096, 3456, 0, 0, 5120, 4320);
  assert.equal(triangles.length, 2);
  assert.equal(adapter.snapshot().textureSplits, 0);
  assert.ok(triangles.every(t => t.image === image && t.alpha === 0.37));
  assert.ok(triangles.flatMap(t => t.vertices).every(v => Number.isFinite(v.w) && v.w > 0));
  assert.deepEqual(triangles[0].matrix, [2, 0, 0, 2, 0, 0]);
  adapter.end();
});

test('native GPU homogeneous UV interpolation matches the ground homography and inverse', () => {
  const raw = fakeContext(), { adapter, triangles } = recorder(); raw.projectiveTextureProjection = true;
  adapter.begin(raw, options({ camera: { ...camera, yaw: 0.23, zoom: 0.46307730303778716 },
    center: { x: 2763.5546666666664, y: 2226.512 } }));
  adapter.context.drawImage({ width: 8192, height: 8192 }, 128, 64, 4096, 3456, 0, 0, 5120, 4320);
  const barycentric = (point, vertices) => {
    const [a, b, c] = vertices, d = (b.y - c.y) * (a.x - c.x) + (c.x - b.x) * (a.y - c.y);
    const first = ((b.y - c.y) * (point.x - c.x) + (c.x - b.x) * (point.y - c.y)) / d;
    const second = ((c.y - a.y) * (point.x - c.x) + (a.x - c.x) * (point.y - c.y)) / d;
    return [first, second, 1 - first - second];
  };
  for (const world of [{ x: 1000, y: 1600 }, { x: 3000, y: 2100 }, { x: 4500, y: 2800 }]) {
    const point = adapter.project(world.x, world.y), triangle = triangles.find(t => barycentric(point, t.vertices).every(v => v >= -1e-8));
    assert.ok(triangle, 'projected world point lies in the emitted mesh');
    const weights = barycentric(point, triangle.vertices), denominator = weights.reduce((sum, b, i) => sum + b / triangle.vertices[i].w, 0);
    const u = weights.reduce((sum, b, i) => sum + b * triangle.vertices[i].u / triangle.vertices[i].w, 0) / denominator;
    const v = weights.reduce((sum, b, i) => sum + b * triangle.vertices[i].v / triangle.vertices[i].w, 0) / denominator;
    close(u, 128 + world.x * 0.8, 1e-6); close(v, 64 + world.y * 0.8, 1e-6);
    const inverse = adapter.unproject(point.x, point.y); close(inverse.x, world.x, 1e-6); close(inverse.y, world.y, 1e-6);
  }
  adapter.end();
});

test('native GPU near-plane vertices keep interpolated source UVs and reciprocal scale', () => {
  const raw = fakeContext(), { adapter, triangles } = recorder(); raw.projectiveTextureProjection = true;
  const nearCamera = { ...camera, distance: 600, near: 128 }, planeY = (600 - 128) / Math.cos(camera.pitch);
  adapter.begin(raw, options({ camera: nearCamera, viewport: { width: 20000, height: 20000 } }));
  adapter.context.drawImage({ width: 200, height: 200 }, 10, 20, 100, 100, -30, planeY - 20, 60, 40);
  const clipped = triangles.flatMap(t => t.vertices).filter(v => Math.abs(v.v - 70) < 1e-6);
  assert.ok(clipped.length > 0);
  for (const vertex of clipped) close(vertex.w, 128 / 600);
  assert.ok(triangles.flatMap(t => t.vertices).every(v => Object.values(v).every(Number.isFinite)));
  adapter.end();
});

test('near clipping counter detects a changed quad that remains four vertices', () => {
  const raw = fakeContext(), { adapter, triangles } = recorder(); raw.projectiveTextureProjection = true;
  const nearCamera = { ...camera, distance: 600, near: 128 }, planeY = (600 - 128) / Math.cos(camera.pitch);
  adapter.begin(raw, options({ camera: nearCamera, viewport: { width: 20000, height: 20000 } }));
  adapter.context.drawImage({ width: 100, height: 100 }, -30, planeY - 20, 60, 40);
  assert.equal(triangles.length, 2, 'clipped four-vertex quad remains a two-triangle fan');
  assert.equal(adapter.snapshot().clippedPolygons, 1);
  adapter.context.drawImage({ width: 100, height: 100 }, -30, planeY - 60, 60, 20);
  assert.equal(adapter.snapshot().clippedPolygons, 1, 'unchanged fully visible geometry does not increment');
  adapter.end();
});

test('deferred billboard batches sort far to near with stable ties and internal order', () => {
  const raw = fakeContext(), { adapter, triangles } = recorder(); raw.projectiveTextureProjection = true;
  adapter.begin(raw, options({ deferBillboards: true, pixelScale: 2 }));
  for (const [id, y] of [['near', 200], ['far', -200], ['tieA', 0], ['tieB', 0]]) {
    adapter.pushBillboard(0, y); adapter.context.drawImage({ id, width: 8, height: 8 }, -4, y - 8); adapter.popBillboard();
  }
  assert.equal(triangles.length, 0); assert.equal(adapter.snapshot().pendingBillboardBatches, 4);
  adapter.flushBillboards();
  assert.deepEqual(triangles.map(t => t.image.id), ['far', 'far', 'tieA', 'tieA', 'tieB', 'tieB', 'near', 'near']);
  assert.ok(triangles.every(t => t.matrix[0] === 2 && t.matrix[3] === 2));
  assert.equal(adapter.snapshot().deferredBillboardCommands, 8); assert.equal(adapter.snapshot().flushedBillboardCommands, 8);
  assert.equal(adapter.snapshot().pendingBillboardCommands, 0); adapter.end(); assert.equal(raw.depth, 0);
});

test('deferred texture/fill/stroke/text capture submission styles and preserve caller state', () => {
  const raw = fakeContext(), records = [];
  raw.projectiveTextureProjection = true;
  const adapter = createNativeWorldProjection({ drawTexturedTriangle: (ctx, image, vertices, alpha) => records.push({ id: image.id, alpha,
    composite: ctx.globalCompositeOperation, filter: ctx.filter, smoothing: ctx.imageSmoothingEnabled }) });
  const X = adapter.begin(raw, options({ deferBillboards: true }));
  adapter.pushBillboard(0, 0); X.save();
  X.globalAlpha = 0.25; X.globalCompositeOperation = 'lighter'; X.filter = 'brightness(.7)'; X.imageSmoothingEnabled = false;
  X.drawImage({ id: 'body', width: 8, height: 8 }, 0, -8); X.fillStyle = '#123456'; X.fillRect(0, -8, 8, 8);
  X.strokeStyle = '#abcdef'; X.lineWidth = 3; X.strokeRect(0, -8, 8, 8); X.fillText('label', 0, -10);
  X.restore(); adapter.popBillboard(); X.globalAlpha = 0.9; X.filter = 'none';
  assert.equal(raw.polygons.length, 0); assert.ok(!raw.calls.some(c => c[0] === 'fillText'));
  adapter.flushBillboards();
  assert.ok(records.every(r => r.alpha === 0.25 && r.composite === 'lighter' && r.filter === 'brightness(.7)' && r.smoothing === false));
  assert.ok(raw.polygons.some(p => p.fillStyle === '#123456')); assert.ok(raw.polygons.some(p => p.fillStyle === '#abcdef'));
  assert.ok(raw.polygons.every(p => p.globalAlpha === 0.25 && p.globalCompositeOperation === 'lighter' && p.filter === 'brightness(.7)'));
  assert.ok(raw.calls.some(c => c[0] === 'fillText' && c[1] === 'label'));
  assert.equal(raw.globalAlpha, 0.9); assert.equal(raw.filter, 'none'); assert.equal(raw.globalCompositeOperation, 'source-over');
  adapter.end(); assert.equal(raw.depth, 0);
});

test('ground danger remains immediate inside a deferred actor and end flushes an open batch', () => {
  const raw = fakeContext(), { adapter, triangles } = recorder();
  const X = adapter.begin(raw, options({ deferBillboards: true }));
  adapter.pushBillboard(0, 0); X.save(); X.translate(50, 50);
  X.drawImage({ width: 8, height: 8 }, 0, -8);
  adapter.withGround(() => X.fillRect(-100, -100, 200, 200));
  assert.equal(triangles.length, 0); assert.equal(raw.polygons.length, 2);
  const expected = adapter.project(-100, -100);
  assert.ok(raw.polygons.flatMap(p => p.points).some(p => Math.hypot(p.x - expected.x, p.y - expected.y) < 1e-6));
  assert.deepEqual(adapter.snapshot().model, [1, 0, 0, 1, 50, 50]);
  adapter.end(); assert.equal(triangles.length, 2); assert.equal(raw.depth, 0); assert.equal(adapter.active, false);
});

test('deferred flushing restores raw styles even when native save omits a style property', () => {
  const raw = fakeContext(), save = raw.save.bind(raw), restore = raw.restore.bind(raw);
  raw.save = function () { const filter = this.filter; save(); this.filter = filter; };
  raw.restore = function () { const filter = this.filter; restore(); this.filter = filter; };
  const adapter = createNativeWorldProjection(); const X = adapter.begin(raw, options({ deferBillboards: true }));
  adapter.pushBillboard(0, 0); X.filter = 'brightness(.5)'; X.fillRect(-10, -10, 20, 20); adapter.popBillboard(); X.filter = 'none';
  adapter.flushBillboards(); assert.equal(raw.filter, 'none'); adapter.end(); assert.equal(raw.depth, 0);
});
