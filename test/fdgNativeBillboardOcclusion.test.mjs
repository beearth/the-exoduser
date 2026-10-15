import test from 'node:test';
import assert from 'node:assert/strict';
import { createNativeWorldProjection, partitionProjectedTextureTriangle, partitionProjectedTextureContour } from '../engine/fdg/native-world-projection.js';
import { createWorldProjection } from '../engine/fdg/world-camera.js';
import { RUINED_FOREST_SCENE } from '../engine/fdg/ruined-forest-scene.js';

const camera = { ...RUINED_FOREST_SCENE.camera };
const enemy = Object.freeze({ x: 2580, y: 2060, r: 20, hp: 50, mhp: 100 });
const center = { x: enemy.x, y: enemy.y }, viewport = { width: 1280, height: 720 };
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-7, `${actual} != ${expected}`);
const bounds = vertices => ({ left: Math.min(...vertices.map(p => p.x)), right: Math.max(...vertices.map(p => p.x)),
  top: Math.min(...vertices.map(p => p.y)), bottom: Math.max(...vertices.map(p => p.y)) });

function harness(extra = {}) {
  let matrix = [1, 0, 0, 1, 0, 0], path = [];
  const stack = [], events = [];
  const styleKeys = ['globalAlpha', 'fillStyle', 'strokeStyle', 'globalCompositeOperation', 'filter', 'imageSmoothingEnabled'];
  const style = raw => Object.fromEntries(styleKeys.map(key => [key, raw[key]]));
  const raw = {
    projectiveTextureProjection: true, globalAlpha: 1, fillStyle: '#efefef', strokeStyle: '#111111',
    globalCompositeOperation: 'source-over', filter: 'none', imageSmoothingEnabled: true,
    save() { stack.push({ matrix: [...matrix], style: style(this) }); },
    restore() { const saved = stack.pop(); assert.ok(saved, 'native raw save/restore must balance'); matrix = saved.matrix; Object.assign(this, saved.style); },
    setTransform(...values) { matrix = [...values]; },
    beginPath() { path = []; }, moveTo(x, y) { path.push({ x, y }); }, lineTo(x, y) { path.push({ x, y }); }, closePath() {},
    fill() { events.push({ kind: 'fill', vertices: path.map(p => ({ ...p })), matrix: [...matrix], ...style(this) }); },
    get depth() { return stack.length; }, get matrix() { return [...matrix]; }
  };
  const adapter = createNativeWorldProjection({ drawTexturedTriangle: (ctx, image, vertices, alpha) => {
    events.push({ kind: 'texture', id: image.id, vertices: vertices.map(p => ({ ...p })), alpha, matrix: [...matrix], ...style(ctx) });
  } });
  const X = adapter.begin(raw, { camera, center, viewport, pixelScale: 2, deferBillboards: true, ...extra });
  return { raw, adapter, X, events };
}

function upright(h, { id, x, y, width = 480, height = 720 }) {
  h.adapter.pushBillboard(x, y);
  try {
    h.X.save();
    try { h.X.globalAlpha = 1; h.X.drawImage({ id, width: 64, height: 256 }, x - width / 2, y - height, width, height); }
    finally { h.X.restore(); }
  } finally { h.adapter.popBillboard(); }
}

function shadow(h, e) {
  h.X.globalAlpha = .2; h.X.fillStyle = '#000'; h.X.beginPath();
  h.X.ellipse(e.x, e.y + e.r * .6, e.r * 1.1, e.r * .25, 0, 0, Math.PI * 2); h.X.fill();
}

// The existing native ghoul ready-sprite / atlas / HP formulas, scoped as one body batch.
// This oracle does not claim the game caller is bracketed; ROOT verifies the actual caller.
function ghoul(h, e, { fallback = false, hit = false, image = true } = {}) {
  shadow(h, e);
  h.adapter.pushBillboard(e.x, e.y);
  try {
    if (image) {
      h.X.save();
      try {
        if (fallback) {
          const cell = 256, size = Math.max(e.r * 7, 80), column = 2, row = 3;
          h.X.translate(e.x, e.y); h.X.globalAlpha = .9; h.X.imageSmoothingEnabled = false;
          h.X.drawImage({ id: 'ghoul-atlas', width: 2048, height: 2048 }, column * cell, row * cell, cell, cell, -size / 2, -size / 2, size, size);
        } else {
          const sprite = { id: 'ghoul-ready', width: 128, height: 256 }, scale = e.r * 2.8 / sprite.width;
          const width = sprite.width * scale, height = sprite.height * scale, bob = 2;
          h.X.translate(e.x, e.y + bob - height * .15); h.X.globalAlpha = hit ? .5 : .9;
          h.X.drawImage(sprite, -width / 2, -height / 2, width, height);
        }
      } finally { h.X.restore(); }
    }
    h.X.globalAlpha = 1;
    const width = e.r * 2 + 6, left = e.x - width / 2, top = e.y - e.r - 14;
    h.X.fillStyle = 'rgba(0,0,0,.6)'; h.X.fillRect(left, top, width, 4);
    h.X.fillStyle = '#cc0000'; h.X.fillRect(left, top, width * (e.hp / e.mhp), 4);
  } finally { h.adapter.popBillboard(); }
}

test('a participating ghoul body and HP paint after an overlapping farther upright, while nearer mass remains in front', () => {
  const h = harness();
  upright(h, { id: 'east-far-mass', x: 2600, y: 2040 });
  ghoul(h, enemy);
  upright(h, { id: 'near-mass', x: 2580, y: 2100, width: 60, height: 150 });
  const shadows = h.events.filter(event => event.kind === 'fill');
  assert.ok(shadows.length > 0, 'native ground shadow renders before deferred body flush');
  assert.ok(shadows.every(event => event.globalAlpha === .2 && event.fillStyle === '#000'));
  assert.equal(h.events.filter(event => event.kind === 'texture').length, 0);
  assert.equal(h.adapter.snapshot().pendingBillboardBatches, 3);
  h.adapter.flushBillboards();
  const deferred = h.events.slice(shadows.length);
  assert.deepEqual(deferred.map(event => event.kind === 'texture' ? event.id : event.fillStyle), [
    'east-far-mass', 'east-far-mass', 'ghoul-ready', 'ghoul-ready',
    'rgba(0,0,0,.6)', 'rgba(0,0,0,.6)', '#cc0000', '#cc0000', 'near-mass', 'near-mass'
  ]);
  const far = bounds(deferred.filter(event => event.id === 'east-far-mass').flatMap(event => event.vertices));
  const body = bounds(deferred.filter(event => event.id === 'ghoul-ready').flatMap(event => event.vertices));
  assert.ok(far.left < body.right && far.right > body.left && far.top < body.bottom && far.bottom > body.top, 'this is an actual projected overlap, not just unrelated depth labels');
  assert.ok(deferred.filter(event => event.id?.includes('mass')).every(event => event.alpha === 1), 'upright mass alpha is preserved');
  h.adapter.end(); assert.equal(h.raw.depth, 0);
});

test('ready ghoul bob/foot offsets and native source proportions use one uniform anchor scale and one SSAA transform', () => {
  const h = harness(), projection = createWorldProjection(camera, center, viewport), anchor = projection.project(enemy.x, enemy.y);
  ghoul(h, enemy); h.adapter.flushBillboards();
  const body = h.events.filter(event => event.id === 'ghoul-ready'), vertices = body.flatMap(event => event.vertices), box = bounds(vertices);
  const width = enemy.r * 2.8, height = width * 2, bob = 2;
  close(box.right - box.left, width * anchor.scale); close(box.bottom - box.top, height * anchor.scale);
  close((box.right - box.left) / (box.bottom - box.top), 128 / 256);
  close(box.left, anchor.x - width / 2 * anchor.scale);
  close(box.bottom, anchor.y + (bob + height * .35) * anchor.scale);
  const groundFoot = projection.project(enemy.x, enemy.y + bob + height * .35);
  assert.ok(Math.abs(box.bottom - groundFoot.y) > 1, 'body height must not flatten onto the tilted ground plane');
  assert.ok(vertices.every(vertex => Math.abs(vertex.w - 1 / anchor.scale) < 1e-10));
  assert.ok(body.every(event => event.matrix.join(',') === '2,0,0,2,0,0'), 'triangle XY stays logical; SSAA is applied once by raw');
  assert.deepEqual([...new Set(vertices.map(p => `${p.u}/${p.v}`))].sort(), ['0/0', '0/256', '128/0', '128/256']);
  const hp = bounds(h.events.filter(event => event.fillStyle === '#cc0000').flatMap(event => event.vertices));
  close(hp.top, anchor.y + (-enemy.r - 14) * anchor.scale);
  close(hp.right - hp.left, (enemy.r * 2 + 6) * (enemy.hp / enemy.mhp) * anchor.scale);
  h.adapter.end(); assert.equal(h.raw.depth, 0);
});

test('atlas fallback preserves cropped UV and HP batch ordering; native hit alpha and caller styles survive flush/early return', () => {
  for (const mode of [{ fallback: true }, { hit: true }, { image: false }]) {
    const h = harness(), original = { alpha: h.raw.globalAlpha, fillStyle: h.raw.fillStyle, filter: h.raw.filter, smoothing: h.raw.imageSmoothingEnabled };
    upright(h, { id: 'east-far-mass', x: 2600, y: 2040 }); ghoul(h, enemy, mode);
    const beforeFlush = { alpha: h.raw.globalAlpha, fillStyle: h.raw.fillStyle, filter: h.raw.filter, smoothing: h.raw.imageSmoothingEnabled };
    h.adapter.flushBillboards();
    assert.deepEqual({ alpha: h.raw.globalAlpha, fillStyle: h.raw.fillStyle, filter: h.raw.filter, smoothing: h.raw.imageSmoothingEnabled }, beforeFlush);
    const body = h.events.filter(event => event.id?.startsWith('ghoul'));
    const redHP = h.events.filter(event => event.fillStyle === '#cc0000');
    assert.equal(redHP.length, 2); assert.ok(redHP.every(event => event.globalAlpha === 1));
    if (mode.image === false) assert.equal(body.length, 0, 'missing sprite keeps native HP inside its anchor batch');
    else {
      assert.equal(body.length, 2);
      assert.ok(h.events.indexOf(redHP[0]) > h.events.indexOf(body.at(-1)), 'HP stays after its own body');
      if (mode.fallback) {
        const vertices = body.flatMap(event => event.vertices), box = bounds(vertices), anchor = h.adapter.project(enemy.x, enemy.y);
        assert.deepEqual([...new Set(vertices.map(p => `${p.u}/${p.v}`))].sort(), ['512/1024', '512/768', '768/1024', '768/768']);
        close(box.right - box.left, Math.max(enemy.r * 7, 80) * anchor.scale);
        close(box.bottom - box.top, box.right - box.left);
        assert.ok(body.every(event => event.alpha === .9 && event.imageSmoothingEnabled === false));
      } else assert.ok(body.every(event => event.alpha === .5), 'existing native hit blink alpha is preserved');
    }
    assert.equal(h.adapter.snapshot().billboardDepth, 0);
    assert.equal(h.adapter.snapshot().pendingBillboardCommands, 0);
    h.adapter.end(); assert.equal(h.raw.depth, 0);
    assert.deepEqual({ alpha: h.raw.globalAlpha, fillStyle: h.raw.fillStyle, filter: h.raw.filter, smoothing: h.raw.imageSmoothingEnabled }, original);
    assert.deepEqual(h.raw.matrix, [1, 0, 0, 1, 0, 0]);
  }
});

function typedImage(h, { kind, id, x, y, width, height, bottom = 0, alpha = 1 }) {
  h.adapter.pushBillboard(x, y, { kind }); h.X.save();
  try {
    h.X.globalAlpha = alpha;
    h.X.drawImage({ id, width: 100, height: 200 }, x - width / 2, y + bottom - height, width, height);
  } finally { h.X.restore(); h.adapter.popBillboard(); }
}
const area = vertices => Math.abs(vertices.reduce((sum, p, i) => {
  const next = vertices[(i + 1) % vertices.length]; return sum + p.x * next.y - next.x * p.y;
}, 0)) / 2;
const centroid = vertices => ({ x: vertices.reduce((sum, p) => sum + p.x, 0) / vertices.length,
  y: vertices.reduce((sum, p) => sum + p.y, 0) / vertices.length });

test('cutaway: default off and absent metadata retain original opaque painter commands', () => {
  for (const option of [undefined, false, true]) {
    const h = harness(option === undefined ? {} : { actorOcclusionCutaway: option });
    typedImage(h, { kind: option === true ? undefined : 'actor', id: 'body', x: enemy.x, y: enemy.y, width: 56, height: 112, alpha: .9 });
    typedImage(h, { kind: 'occluder', id: 'front-mass', x: enemy.x, y: enemy.y + 40, width: 300, height: 260 });
    h.adapter.flushBillboards();
    assert.equal(h.events.length, 4);
    assert.ok(h.events.filter(event => event.id === 'front-mass').every(event => event.alpha === 1));
    assert.equal(h.adapter.snapshot().cutawaySourceTriangles, 0);
    assert.deepEqual(h.adapter.snapshot().actorOcclusionBounds, []);
    h.adapter.end(); assert.equal(h.raw.depth, 0);
  }
  const h = harness({ actorOcclusionCutaway: true, deferBillboards: false });
  assert.equal(h.adapter.snapshot().actorOcclusionCutaway, false, 'immediate native rendering cannot activate the queue cutaway');
  h.adapter.end();
});

test('cutaway: only front upright image portions overlapping actor bounds change alpha; outside source area remains opaque', () => {
  const h = harness({ actorOcclusionCutaway: true });
  typedImage(h, { kind: 'occluder', id: 'back-mass', x: enemy.x, y: enemy.y - 40, width: 300, height: 260 });
  typedImage(h, { kind: 'actor', id: 'body', x: enemy.x, y: enemy.y, width: 56, height: 112, bottom: 10, alpha: .9 });
  h.X.filter = 'brightness(.8)'; h.X.globalCompositeOperation = 'source-over';
  typedImage(h, { kind: 'occluder', id: 'front-mass', x: enemy.x, y: enemy.y + 40, width: 300, height: 260 });
  const originalStyles = { filter: h.raw.filter, alpha: h.raw.globalAlpha, composite: h.raw.globalCompositeOperation };
  h.adapter.flushBillboards();
  const front = h.events.filter(event => event.id === 'front-mass'), low = front.filter(event => event.alpha === .2),
    reduced = front.filter(event => event.alpha < 1), opaque = front.filter(event => event.alpha === 1);
  assert.ok(low.length > 0); assert.ok(opaque.length > 0, 'the whole prop must not fade');
  assert.ok(h.events.filter(event => event.id === 'back-mass').every(event => event.alpha === 1), 'farther mass is unchanged');
  assert.ok(h.events.filter(event => event.id === 'body').every(event => event.alpha === .9), 'native actor alpha is unchanged');
  const snapshot = h.adapter.snapshot(), box = snapshot.actorOcclusionBounds[0];
  assert.equal(snapshot.actorCutawayMargin, 8); assert.equal(snapshot.actorCutawayAlpha, .2);
  assert.equal(snapshot.cutawayActorBounds, 1); assert.equal(snapshot.cutawayOccluderBatches, 1);
  assert.equal(snapshot.cutawaySourceTriangles, 2); assert.equal(snapshot.cutawayReducedTriangles, reduced.length);
  assert.equal(snapshot.cutawayExtraTriangles, front.length - 2);
  close(snapshot.cutawayReducedArea, reduced.reduce((sum, event) => sum + area(event.vertices), 0));
  assert.ok(low.every(event => event.vertices.every(p => insideConvex(p, ellipseContour(box.ellipse, 2)))));
  assert.ok(opaque.every(event => !insideConvex(centroid(event.vertices), ellipseContour(box.ellipse, 8))), 'opaque portions may remain inside the broadphase AABB but outside the outer ellipse');
  const anchor = h.adapter.project(enemy.x, enemy.y + 40), source = bounds(front.flatMap(event => event.vertices));
  close(front.reduce((sum, event) => sum + area(event.vertices), 0), 300 * 260 * anchor.scale ** 2);
  close(source.right - source.left, 300 * anchor.scale); close(source.bottom - source.top, 260 * anchor.scale);
  for (const event of front) for (const vertex of event.vertices) {
    close(vertex.u, (vertex.x - source.left) / (300 * anchor.scale) * 100);
    close(vertex.v, (vertex.y - source.top) / (260 * anchor.scale) * 200);
    close(vertex.w, 1 / anchor.scale);
  }
  assert.ok(front.every(event => event.filter === 'brightness(.8)' && event.globalCompositeOperation === 'source-over' && event.matrix.join(',') === '2,0,0,2,0,0'));
  assert.deepEqual({ filter: h.raw.filter, alpha: h.raw.globalAlpha, composite: h.raw.globalCompositeOperation }, originalStyles);
  assert.equal(snapshot.flushedBillboardCommands, 6, 'original queued command count is preserved; extra fragments have separate metrics');
  h.adapter.end(); assert.equal(h.raw.depth, 0);
});

test('cutaway: same-anchor body/windup text batches merge with the foot margin; overlapping actor ellipses count their union once', () => {
  const h = harness({ actorOcclusionCutaway: true });
  h.raw.font = '20px sans-serif'; h.raw.textAlign = 'left'; h.raw.textBaseline = 'alphabetic';
  h.raw.measureText = () => ({ width: 64, actualBoundingBoxLeft: 0, actualBoundingBoxRight: 64, actualBoundingBoxAscent: 14, actualBoundingBoxDescent: 2 });
  h.raw.fillText = (text, x, y) => h.events.push({ kind: 'text', text, x, y, matrix: h.raw.matrix });
  typedImage(h, { kind: 'actor', id: 'body', x: enemy.x, y: enemy.y, width: 32, height: 60, bottom: -40 });
  h.adapter.pushBillboard(enemy.x, enemy.y, { kind: 'actor' }); h.X.fillText('windup', enemy.x + 55, enemy.y - 140); h.adapter.popBillboard();
  typedImage(h, { kind: 'actor', id: 'second-body', x: enemy.x + 16, y: enemy.y, width: 32, height: 60, bottom: -40 });
  typedImage(h, { kind: 'occluder', id: 'front-mass', x: enemy.x + 40, y: enemy.y + 40, width: 300, height: 260 });
  h.adapter.flushBillboards();
  const snapshot = h.adapter.snapshot(), primary = snapshot.actorOcclusionBounds.find(box => box.x === enemy.x), anchor = h.adapter.project(enemy.x, enemy.y);
  assert.equal(snapshot.cutawayActorBounds, 2, 'same-anchor body and text form one body/foot bounding ellipse');
  close(primary.bodyBounds.left, anchor.x - 16 * anchor.scale);
  close(primary.bodyBounds.right, anchor.x + (55 + 64) * anchor.scale);
  close(primary.bodyBounds.top, anchor.y + (-140 - 14) * anchor.scale);
  close(primary.bodyBounds.bottom, anchor.y);
  close(primary.ellipse.centerX, (primary.bodyBounds.left + primary.bodyBounds.right) / 2);
  close(primary.ellipse.centerY, (primary.bodyBounds.top + primary.bodyBounds.bottom) / 2);
  close(primary.ellipse.radiusX, (primary.bodyBounds.right - primary.bodyBounds.left) / 2 * Math.SQRT2);
  close(primary.ellipse.radiusY, (primary.bodyBounds.bottom - primary.bodyBounds.top) / 2 * Math.SQRT2);
  close(primary.right, primary.ellipse.centerX + primary.ellipse.radiusX + 8);
  close(primary.top, primary.ellipse.centerY - primary.ellipse.radiusY - 8);
  close(primary.bottom, primary.ellipse.centerY + primary.ellipse.radiusY + 8);
  assert.ok(insideConvex(anchor, ellipseContour(primary.ellipse, 2)), 'foot anchor stays protected even when body image ends above it');
  assert.ok(h.events.some(event => event.kind === 'text' && event.text === 'windup'));
  const reduced = h.events.filter(event => event.id === 'front-mass' && event.alpha < 1);
  close(snapshot.cutawayReducedArea, reduced.reduce((sum, event) => sum + area(event.vertices), 0));
  for (const event of reduced) assert.ok(snapshot.actorOcclusionBounds.some(box => {
    return insideConvex(centroid(event.vertices), ellipseContour(box.ellipse, 8));
  }));
  assert.equal(snapshot.pendingBillboardCommands, 0); assert.equal(snapshot.billboardDepth, 0);
  h.adapter.end(); assert.equal(h.raw.depth, 0);
});

test('cutaway: screen partition preserves area and perspective-correct source UV/W across every intersection', () => {
  const triangle = [{ x: 0, y: 0, u: 0, v: 0, w: 1 }, { x: 100, y: 0, u: 200, v: 0, w: 2 }, { x: 0, y: 100, u: 0, v: 300, w: 4 }];
  const saved = structuredClone(triangle), rectangle = { left: 25, top: 25, right: 75, bottom: 75 };
  const split = partitionProjectedTextureTriangle(triangle, rectangle), all = [...split.outside, ...split.inside];
  close(all.reduce((sum, vertices) => sum + area(vertices), 0), 5000);
  close(split.inside.reduce((sum, vertices) => sum + area(vertices), 0), 1250);
  for (const vertices of all) for (const vertex of vertices) {
    const b = vertex.x / 100, c = vertex.y / 100, a = 1 - b - c, inverseW = a + b / 2 + c / 4;
    close(vertex.w, 1 / inverseW); close(vertex.u, (200 * b / 2) / inverseW); close(vertex.v, (300 * c / 4) / inverseW);
    assert.ok([vertex.x, vertex.y, vertex.u, vertex.v, vertex.w].every(Number.isFinite));
  }
  assert.deepEqual(triangle, saved);
  const canvas = triangle.map(({ w, ...vertex }) => vertex), linear = partitionProjectedTextureTriangle(canvas, rectangle);
  for (const vertices of [...linear.outside, ...linear.inside]) for (const vertex of vertices) {
    close(vertex.u, vertex.x * 2); close(vertex.v, vertex.y * 3); assert.equal(Object.hasOwn(vertex, 'w'), false);
  }
});

function insideConvex(point, contour) {
  return contour.every((a, index) => {
    const b = contour[(index + 1) % contour.length];
    return (b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x) >= -1e-7;
  });
}
function ellipseContour(ellipse, padding = 0) {
  return Array.from({ length: 16 }, (_, index) => ({
    x: ellipse.centerX + (ellipse.radiusX + padding) * Math.cos(index * Math.PI / 8),
    y: ellipse.centerY + (ellipse.radiusY + padding) * Math.sin(index * Math.PI / 8)
  }));
}
function textureAlphaAt(events, point) {
  const event = events.find(candidate => insideConvex(point, area(candidate.vertices) > 0 &&
    ((candidate.vertices[1].x - candidate.vertices[0].x) * (candidate.vertices[2].y - candidate.vertices[0].y)
      - (candidate.vertices[1].y - candidate.vertices[0].y) * (candidate.vertices[2].x - candidate.vertices[0].x)) > 0
    ? candidate.vertices : [...candidate.vertices].reverse()));
  assert.ok(event, `texture coverage at ${point.x}/${point.y}`); return event.alpha;
}

test('feather: an ellipse protects full body/foot and four 2px bands soften the boundary without a rectangular cutout', () => {
  const h = harness({ actorOcclusionCutaway: true });
  typedImage(h, { kind: 'actor', id: 'body', x: enemy.x, y: enemy.y, width: 56, height: 112, bottom: 10, alpha: .9 });
  typedImage(h, { kind: 'occluder', id: 'front-mass', x: enemy.x, y: enemy.y + 40, width: 400, height: 400, bottom: 100 });
  h.adapter.flushBillboards();
  const snapshot = h.adapter.snapshot(), protectedBox = snapshot.actorOcclusionBounds[0], { ellipse, bodyBounds } = protectedBox;
  const front = h.events.filter(event => event.id === 'front-mass');
  assert.equal(snapshot.actorCutawaySegments, 16);
  assert.deepEqual(snapshot.actorCutawayBands, [{ padding: 2, alpha: .2 }, { padding: 4, alpha: .4 }, { padding: 6, alpha: .6 }, { padding: 8, alpha: .8 }]);
  close(ellipse.radiusX, (bodyBounds.right - bodyBounds.left) / 2 * Math.SQRT2);
  close(ellipse.radiusY, (bodyBounds.bottom - bodyBounds.top) / 2 * Math.SQRT2);
  for (const point of [{ x: bodyBounds.left, y: bodyBounds.top }, { x: bodyBounds.right, y: bodyBounds.top },
    { x: bodyBounds.left, y: bodyBounds.bottom }, { x: bodyBounds.right, y: bodyBounds.bottom }, h.adapter.project(enemy.x, enemy.y)]) {
    assert.equal(textureAlphaAt(front, point), .2, 'body corners and foot stay inside the core protection');
  }
  for (const [offset, alpha] of [[1, .2], [3, .4], [5, .6], [7, .8], [9, 1]]) {
    assert.equal(textureAlphaAt(front, { x: ellipse.centerX + ellipse.radiusX + offset, y: ellipse.centerY }), alpha);
  }
  const broadphaseCorner = { x: protectedBox.left + 1, y: protectedBox.top + 1 };
  assert.equal(textureAlphaAt(front, broadphaseCorner), 1, 'AABB corner is opaque, so the cutaway is not a rectangular window');
  assert.ok(h.events.filter(event => event.id === 'body').every(event => event.alpha === .9));
  const feather = front.filter(event => event.alpha > .2 && event.alpha < 1), reduced = front.filter(event => event.alpha < 1);
  assert.equal(snapshot.cutawayFeatherTriangles, feather.length);
  close(snapshot.cutawayFeatherArea, feather.reduce((sum, event) => sum + area(event.vertices), 0));
  assert.equal(snapshot.cutawayReducedTriangles, reduced.length);
  close(snapshot.cutawayReducedArea, reduced.reduce((sum, event) => sum + area(event.vertices), 0));
  const source = bounds(front.flatMap(event => event.vertices)), anchor = h.adapter.project(enemy.x, enemy.y + 40);
  close(front.reduce((sum, event) => sum + area(event.vertices), 0), 400 * 400 * anchor.scale ** 2);
  for (const event of front) for (const p of event.vertices) {
    close(p.u, (p.x - source.left) / (400 * anchor.scale) * 100);
    close(p.v, (p.y - source.top) / (400 * anchor.scale) * 200); close(p.w, 1 / anchor.scale);
  }
  assert.ok(front.every(event => event.matrix.join(',') === '2,0,0,2,0,0'));
  const copy = h.adapter.snapshot(); copy.actorOcclusionBounds[0].ellipse.radiusX = 0;
  assert.equal(h.adapter.snapshot().actorOcclusionBounds[0].ellipse.radiusX, ellipse.radiusX, 'snapshot does not alias the contour definition');
  h.adapter.end(); assert.equal(h.raw.depth, 0);
});

test('feather: convex ellipse partition preserves total coverage and rational UV/W with either contour winding', () => {
  const triangle = [{ x: -200, y: -200, u: 0, v: 0, w: 1 }, { x: 400, y: -200, u: 600, v: 0, w: 2 }, { x: -200, y: 400, u: 0, v: 600, w: 4 }];
  const contour = ellipseContour({ centerX: 0, centerY: 0, radiusX: 40, radiusY: 60 }), saved = structuredClone({ triangle, contour });
  for (const winding of [contour, [...contour].reverse()]) {
    const split = partitionProjectedTextureContour(triangle, winding), all = [...split.outside, ...split.inside];
    close(all.reduce((sum, vertices) => sum + area(vertices), 0), 180000);
    close(split.inside.reduce((sum, vertices) => sum + area(vertices), 0), 8 * 40 * 60 * Math.sin(Math.PI / 8));
    for (const vertices of all) for (const p of vertices) {
      const b = (p.x + 200) / 600, c = (p.y + 200) / 600, a = 1 - b - c, inverseW = a + b / 2 + c / 4;
      close(p.u, 600 * b / 2 / inverseW); close(p.v, 600 * c / 4 / inverseW); close(p.w, 1 / inverseW);
      assert.ok([p.x, p.y, p.u, p.v, p.w].every(Number.isFinite));
    }
  }
  assert.deepEqual({ triangle, contour }, saved);
});

test('feather: overlapping actor contours use the lowest cap without duplicate coverage or raising translucent source alpha', () => {
  for (const alpha of [1, .5]) {
    const h = harness({ actorOcclusionCutaway: true });
    typedImage(h, { kind: 'actor', id: 'body-a', x: enemy.x - 12, y: enemy.y, width: 56, height: 112 });
    typedImage(h, { kind: 'actor', id: 'body-b', x: enemy.x + 12, y: enemy.y, width: 56, height: 112 });
    h.X.filter = 'brightness(.8)';
    typedImage(h, { kind: 'occluder', id: 'front-mass', x: enemy.x, y: enemy.y + 40, width: 400, height: 400, bottom: 100, alpha });
    h.adapter.flushBillboards();
    const snapshot = h.adapter.snapshot(), front = h.events.filter(event => event.id === 'front-mass');
    assert.equal(snapshot.cutawayActorBounds, 2);
    for (const event of front) {
      const point = centroid(event.vertices);
      const caps = snapshot.actorOcclusionBounds.map(box => {
        const band = snapshot.actorCutawayBands.find(candidate => insideConvex(point, ellipseContour(box.ellipse, candidate.padding)));
        return band?.alpha ?? 1;
      });
      close(event.alpha, Math.min(alpha, ...caps));
      assert.ok(event.alpha <= alpha && event.filter === 'brightness(.8)');
    }
    const anchor = h.adapter.project(enemy.x, enemy.y + 40);
    close(front.reduce((sum, event) => sum + area(event.vertices), 0), 400 * 400 * anchor.scale ** 2);
    close(snapshot.cutawayReducedArea, front.filter(event => event.alpha < alpha).reduce((sum, event) => sum + area(event.vertices), 0));
    assert.equal(h.raw.filter, 'brightness(.8)'); assert.equal(h.raw.globalAlpha, 1);
    h.adapter.end(); assert.equal(h.raw.depth, 0); assert.equal(h.raw.filter, 'none');
  }
});

// Frozen inner-to-outer subdivision reference; used only by the new fragmentation oracle.
function innerToOuterReference(vertices, actors, originalAlpha) {
  let pieces = [{ vertices, alpha: originalAlpha }];
  for (const actor of actors) for (const band of [{ padding: 2, alpha: .2 }, { padding: 4, alpha: .4 }, { padding: 6, alpha: .6 }, { padding: 8, alpha: .8 }]) {
    const contour = ellipseContour(actor.ellipse, band.padding), next = [];
    for (const piece of pieces) {
      if (piece.alpha <= band.alpha || piece.vertices.every(p => p.x <= actor.left) || piece.vertices.every(p => p.x >= actor.right)
        || piece.vertices.every(p => p.y <= actor.top) || piece.vertices.every(p => p.y >= actor.bottom)) { next.push(piece); continue; }
      const split = partitionProjectedTextureContour(piece.vertices, contour);
      if (!split.inside.length) { next.push(piece); continue; }
      next.push(...split.outside.map(vertices => ({ vertices, alpha: piece.alpha })), ...split.inside.map(vertices => ({ vertices, alpha: band.alpha })));
    }
    pieces = next;
  }
  return pieces;
}

test('fragmentation: deferred convex polygons reduce triangle count while preserving the frozen alpha field, source coverage and styles', t => {
  for (const sourceAlpha of [1, .5]) {
    const h = harness({ actorOcclusionCutaway: true });
    shadow(h, enemy);
    assert.ok(h.events.length > 0 && h.events.every(event => event.globalAlpha === .2), 'ground shadow stays immediate');
    typedImage(h, { kind: 'actor', id: 'body-a', x: enemy.x - 12, y: enemy.y, width: 56, height: 112, alpha: .9 });
    typedImage(h, { kind: 'actor', id: 'body-b', x: enemy.x + 12, y: enemy.y, width: 56, height: 112, alpha: .9 });
    h.X.globalAlpha = 1; h.X.filter = 'brightness(.8)';
    typedImage(h, { kind: 'occluder', id: 'front-mass', x: enemy.x, y: enemy.y + 40, width: 400, height: 400, bottom: 100, alpha: sourceAlpha });
    h.adapter.flushBillboards();
    const snapshot = h.adapter.snapshot(), front = h.events.filter(event => event.id === 'front-mass'), source = bounds(front.flatMap(event => event.vertices));
    const anchor = h.adapter.project(enemy.x, enemy.y + 40), w = 1 / anchor.scale;
    const quad = [{ x: source.left, y: source.top, u: 0, v: 0, w }, { x: source.right, y: source.top, u: 100, v: 0, w },
      { x: source.right, y: source.bottom, u: 100, v: 200, w }, { x: source.left, y: source.bottom, u: 0, v: 200, w }];
    const reference = [[quad[0], quad[1], quad[2]], [quad[0], quad[2], quad[3]]]
      .flatMap(vertices => innerToOuterReference(vertices, snapshot.actorOcclusionBounds, sourceAlpha));
    assert.ok(front.length < reference.length, 'outer-to-inner polygon retention must reduce replayed triangle count');
    for (const alpha of [.2, .4, .5, .6, .8, 1]) {
      close(front.filter(event => event.alpha === alpha).reduce((sum, event) => sum + area(event.vertices), 0),
        reference.filter(event => event.alpha === alpha).reduce((sum, event) => sum + area(event.vertices), 0));
    }
    for (let row = 0; row < 15; row++) for (let column = 0; column < 15; column++) {
      const point = { x: source.left + (source.right - source.left) * (column + .37) / 15,
        y: source.top + (source.bottom - source.top) * (row + .63) / 15 };
      assert.equal(textureAlphaAt(front, point), textureAlphaAt(reference, point), 'same alpha coverage at the sampled screen point');
    }
    close(front.reduce((sum, event) => sum + area(event.vertices), 0), 400 * 400 * anchor.scale ** 2);
    for (const event of front) for (const p of event.vertices) {
      close(p.u, (p.x - source.left) / (400 * anchor.scale) * 100); close(p.v, (p.y - source.top) / (400 * anchor.scale) * 200); close(p.w, w);
      assert.ok([p.x, p.y, p.u, p.v, p.w].every(Number.isFinite));
    }
    assert.ok(front.every(event => event.filter === 'brightness(.8)' && event.globalCompositeOperation === 'source-over' && event.matrix.join(',') === '2,0,0,2,0,0'));
    assert.ok(h.events.filter(event => event.id?.startsWith('body')).every(event => event.alpha === .9));
    assert.equal(snapshot.cutawayExtraTriangles, front.length - 2); assert.equal(snapshot.flushedBillboardCommands, 6);
    t.diagnostic(JSON.stringify({ sourceAlpha, originalTextureTriangles: 2, frozenReferenceTriangles: reference.length, optimizedTriangles: front.length,
      frozenExtraTriangles: reference.length - 2, optimizedExtraTriangles: snapshot.cutawayExtraTriangles,
      reducedTriangles: snapshot.cutawayReducedTriangles, featherTriangles: snapshot.cutawayFeatherTriangles,
      reducedArea: snapshot.cutawayReducedArea, featherArea: snapshot.cutawayFeatherArea }));
    assert.equal(h.raw.filter, 'brightness(.8)'); assert.equal(h.raw.globalAlpha, 1);
    h.adapter.end(); assert.equal(h.raw.depth, 0); assert.equal(h.raw.filter, 'none');
  }
});

test('fragmentation: convex polygons retained through nested bands keep nonuniform homogeneous W and affine fallback exact', () => {
  const mapping = (x, y) => {
    const inverseW = 1 + .002 * x + .001 * y;
    return { x, y, u: (.5 * x + .1 * y + 30) / inverseW, v: (.05 * x + .7 * y + 50) / inverseW, w: 1 / inverseW };
  };
  const polygon = [[-100, -100], [200, -100], [200, 200], [-100, 200]].map(([x, y]) => mapping(x, y)), saved = structuredClone(polygon);
  for (const padding of [8, 6, 4, 2]) {
    const split = partitionProjectedTextureContour(polygon, ellipseContour({ centerX: 30, centerY: 20, radiusX: 40, radiusY: 70 }, padding));
    const all = [...split.outside, ...split.inside];
    close(all.reduce((sum, vertices) => sum + area(vertices), 0), 90000);
    for (const vertices of all) for (const p of vertices) {
      const expected = mapping(p.x, p.y); close(p.u, expected.u); close(p.v, expected.v); close(p.w, expected.w);
    }
    const affine = polygon.map(({ x, y }) => ({ x, y, u: 2 * x + 10, v: 3 * y + 20 }));
    const linear = partitionProjectedTextureContour(affine, ellipseContour({ centerX: 30, centerY: 20, radiusX: 40, radiusY: 70 }, padding));
    for (const vertices of [...linear.outside, ...linear.inside]) for (const p of vertices) {
      close(p.u, 2 * p.x + 10); close(p.v, 3 * p.y + 20); assert.equal(Object.hasOwn(p, 'w'), false);
    }
  }
  assert.deepEqual(polygon, saved);
});

function styleReplayHarness({ mutateSink = false, throwSink = false } = {}) {
  const gradient = { id: 'same-native-gradient-reference' };
  const defaults = { globalAlpha: 1, globalCompositeOperation: 'source-over', filter: 'none', fillStyle: gradient,
    strokeStyle: '#111', font: '20px sans-serif', textAlign: 'left', textBaseline: 'alphabetic',
    imageSmoothingEnabled: true, lineDashOffset: 0 };
  let styles = { ...defaults }, dash = [4, 2], matrix = [1, 0, 0, 1, 0, 0], setterSource = 'renderer';
  const stack = [], events = [], setters = [], dashSetters = [], transforms = [];
  const state = () => ({ styles: { ...styles }, dash: [...dash], matrix: [...matrix] });
  const raw = {
    projectiveTextureProjection: true,
    save() { stack.push(state()); },
    // Internal restoration bypasses exposed setters; the counters measure adapter calls.
    restore() { const saved = stack.pop(); assert.ok(saved); styles = saved.styles; dash = saved.dash; matrix = saved.matrix; },
    setTransform(...values) { transforms.push([...values]); matrix = [...values]; },
    getLineDash() { return [...dash]; },
    setLineDash(values) { dashSetters.push({ source: setterSource, before: [...dash], value: [...values] }); dash = [...values]; },
    get depth() { return stack.length; }
  };
  for (const key of Object.keys(defaults)) Object.defineProperty(raw, key, {
    get() { return styles[key]; }, set(value) { setters.push({ source: setterSource, key, before: styles[key], value }); styles[key] = value; }
  });
  const adapter = createNativeWorldProjection({ drawTexturedTriangle(ctx, image, vertices, alpha) {
    events.push({ id: image.id, vertices: vertices.map(p => ({ ...p })), alpha, ...state() });
    if (!mutateSink) return;
    setterSource = 'sink';
    try {
      ctx.globalAlpha = .13; ctx.globalCompositeOperation = 'lighter'; ctx.filter = 'contrast(3)'; ctx.fillStyle = '#mutated';
      ctx.setLineDash([9, 9]); ctx.setTransform(3, 0, 0, 3, 11, 22);
    } finally { setterSource = 'renderer'; }
    if (throwSink) throw new Error('injected sink failure');
  } });
  const X = adapter.begin(raw, { camera, center, viewport, pixelScale: 2, deferBillboards: true, actorOcclusionCutaway: true });
  const resetCounters = () => { events.length = setters.length = dashSetters.length = transforms.length = 0; };
  return { raw, adapter, X, events, setters, dashSetters, transforms, state, resetCounters, gradient,
    styleKeyCount: Object.keys(defaults).length, defaults };
}

function queueStyleReplayOverlap(h) {
  typedImage(h, { kind: 'actor', id: 'body-a', x: enemy.x - 12, y: enemy.y, width: 56, height: 112, alpha: .9 });
  h.X.setLineDash([4, 2]); // Equal contents in a different array must not trigger replay setters.
  typedImage(h, { kind: 'actor', id: 'body-b', x: enemy.x + 12, y: enemy.y, width: 56, height: 112, alpha: .9 });
  h.X.filter = 'brightness(.8)';
  typedImage(h, { kind: 'occluder', id: 'front-mass', x: enemy.x, y: enemy.y + 40, width: 400, height: 400, bottom: 100 });
}

test('style-replay-cost: repeated fragments avoid equal style setters and equal-content dash writes while preserving alpha order and final native state', t => {
  const h = styleReplayHarness(); queueStyleReplayOverlap(h);
  const before = h.state(); h.resetCounters(); h.adapter.flushBillboards();
  const front = h.events.filter(event => event.id === 'front-mass'), snapshot = h.adapter.snapshot();
  assert.ok(front.length > 50, 'the fixture exercises a fragmented overlapping foreground prop');
  assert.ok(h.setters.every(write => write.before !== write.value), 'adapter must never invoke a setter for an already equal live style');
  assert.equal(h.setters.filter(write => write.key === 'globalCompositeOperation').length, 0);
  assert.equal(h.setters.filter(write => write.key === 'fillStyle').length, 0, 'same gradient object reference stays untouched');
  assert.equal(h.dashSetters.length, 0, 'copied dash arrays with equal contents stay untouched');
  assert.ok(h.setters.filter(write => write.key === 'filter').length <= snapshot.flushedBillboardBatches,
    'unchanging filter is set at batch boundaries rather than for each fragment');
  for (const event of h.events) {
    assert.equal(event.styles.globalAlpha, event.alpha);
    assert.equal(event.styles.globalCompositeOperation, 'source-over'); assert.equal(event.styles.fillStyle, h.gradient);
    assert.deepEqual(event.dash, [4, 2]); assert.deepEqual(event.matrix, [2, 0, 0, 2, 0, 0]);
    if (event.id.startsWith('body')) assert.equal(event.alpha, .9);
    else {
      assert.equal(event.styles.filter, 'brightness(.8)');
      const caps = snapshot.actorOcclusionBounds.map(box => snapshot.actorCutawayBands
        .find(band => insideConvex(centroid(event.vertices), ellipseContour(box.ellipse, band.padding)))?.alpha ?? 1);
      close(event.alpha, Math.min(1, ...caps));
    }
  }
  const anchor = h.adapter.project(enemy.x, enemy.y + 40), source = bounds(front.flatMap(event => event.vertices));
  close(front.reduce((sum, event) => sum + area(event.vertices), 0), 400 * 400 * anchor.scale ** 2);
  for (const event of front) for (const p of event.vertices) {
    close(p.u, (p.x - source.left) / (400 * anchor.scale) * 100);
    close(p.v, (p.y - source.top) / (400 * anchor.scale) * 200); close(p.w, 1 / anchor.scale);
  }
  assert.deepEqual(h.state(), before); assert.equal(h.raw.depth, 1);
  const previousAllStyleWrites = (h.events.length + snapshot.flushedBillboardBatches) * h.styleKeyCount;
  assert.ok(h.setters.length < previousAllStyleWrites);
  assert.equal(h.transforms.length, h.events.length, 'per-fragment transform reset is retained for arbitrary sink safety');
  t.diagnostic(JSON.stringify({ replayedFragments: h.events.length, foregroundFragments: front.length,
    capturedStyleKeys: h.styleKeyCount, previousUnconditionalStyleWrites: previousAllStyleWrites,
    currentStyleWrites: h.setters.length, currentDashWrites: h.dashSetters.length,
    retainedTransformResets: h.transforms.length, cutawayExtraTriangles: snapshot.cutawayExtraTriangles }));
  h.adapter.end(); assert.equal(h.raw.depth, 0); assert.deepEqual(h.state().styles, h.defaults);
});

test('style-replay-cost: live style reads repair arbitrary sink mutations before every fragment and restore native state after sink success or throw', () => {
  for (const throwSink of [false, true]) {
    const h = styleReplayHarness({ mutateSink: true, throwSink }); queueStyleReplayOverlap(h);
    const before = h.state(); h.resetCounters();
    if (throwSink) assert.throws(() => h.adapter.flushBillboards(), /injected sink failure/);
    else h.adapter.flushBillboards();
    assert.ok(h.events.length > 0);
    for (const event of h.events) {
      assert.equal(event.styles.globalAlpha, event.alpha); assert.equal(event.styles.globalCompositeOperation, 'source-over');
      assert.equal(event.styles.fillStyle, h.gradient); assert.equal(event.styles.filter, event.id === 'front-mass' ? 'brightness(.8)' : 'none');
      assert.deepEqual(event.dash, [4, 2]); assert.deepEqual(event.matrix, [2, 0, 0, 2, 0, 0]);
    }
    assert.ok(h.setters.filter(write => write.source === 'renderer').every(write => write.before !== write.value));
    if (!throwSink) {
      assert.ok(h.setters.some(write => write.source === 'renderer' && write.key === 'filter' && write.before === 'contrast(3)'));
      assert.ok(h.dashSetters.some(write => write.source === 'renderer' && write.before.join() === '9,9' && write.value.join() === '4,2'));
    }
    assert.deepEqual(h.state(), before); assert.equal(h.raw.depth, 1);
    h.adapter.end(); assert.equal(h.raw.depth, 0); assert.deepEqual(h.state().styles, h.defaults);
  }
});
