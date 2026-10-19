import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD_CAMERA_DEFAULTS, validateWorldCamera, createWorldProjection } from '../engine/fdg/world-camera.js';

const viewport = { width: 1090, height: 750 }, center = { x: 4020, y: 7420 };
const settings = values => ({ ...WORLD_CAMERA_DEFAULTS, ...values });
const camera = values => createWorldProjection(settings(values), center, viewport);
const near = (actual, expected, epsilon = 1e-9) => assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} != ${expected}`);

test('complete camera schema validates fixed limits and safely rejects malformed/nonfinite settings', () => {
  assert.deepEqual(WORLD_CAMERA_DEFAULTS, { projection: 'perspective', yaw: 0, pitch: 0.85, zoom: 1, distance: 1400, near: 32 });
  assert.equal(Object.isFrozen(WORLD_CAMERA_DEFAULTS), true); assert.equal(validateWorldCamera(WORLD_CAMERA_DEFAULTS).ok, true);
  for (const value of [null, undefined, [], 'perspective', { projection: 'perspective' }]) assert.equal(validateWorldCamera(value).ok, false);
  for (const [field, min, max] of [['yaw', -Math.PI, Math.PI], ['pitch', 0.35, 1.1], ['zoom', 0.25, 2], ['distance', 600, 6000], ['near', 8, 128]]) {
    for (const value of [min, max]) assert.equal(validateWorldCamera(settings({ [field]: value })).ok, true);
    for (const value of [min - 0.01, max + 0.01, NaN, Infinity, -Infinity, '1']) assert.equal(validateWorldCamera(settings({ [field]: value })).ok, false);
  }
  assert.match(validateWorldCamera(settings({ projection: 'pinhole' }), 'custom.camera').errors[0], /^custom\.camera\.projection:/);
  const getter = settings(); Object.defineProperty(getter, 'yaw', { get() { throw new Error('Must not execute authored accessors'); } });
  assert.equal(validateWorldCamera(getter).ok, false);
  assert.throws(() => createWorldProjection(settings({ near: 0 }), center, viewport), TypeError);
  assert.throws(() => createWorldProjection(settings(), center, { width: 0, height: 750 }), TypeError);
  assert.throws(() => createWorldProjection(settings(), { x: NaN, y: 0 }, viewport), TypeError);
});

test('perspective and orthographic ground rays roundtrip across yaw/pitch/zoom/distance', () => {
  for (const projection of ['perspective', 'orthographic']) for (const yaw of [-Math.PI, -0.7, 0, 1.2, Math.PI])
    for (const pitch of [0.35, 0.85, 1.1]) for (const zoom of [0.25, 2]) for (const distance of [600, 6000]) {
      const p = camera({ projection, yaw, pitch, zoom, distance });
      for (const [dx, dy] of [[0, 0], [140, -190], [-200, 170]]) {
        const screen = p.project(center.x + dx, center.y + dy);
        assert.equal(screen.visible, true); const world = p.unprojectGround(screen.x, screen.y);
        assert.ok(world); near(world.x, center.x + dx); near(world.y, center.y + dy); assert.equal(world.z, 0);
      }
    }
});

test('height rotation and perspective reciprocal depth follow the declared world XYZ equations', () => {
  const pitch = 0.85, p = camera({ yaw: Math.PI / 2, pitch });
  const v = p.toCamera(center.x + 10, center.y + 20, 30);
  near(v.x, -20); near(v.y, 10 * Math.sin(pitch) - 30 * Math.cos(pitch));
  near(v.depth, 10 * Math.cos(pitch) + 30 * Math.sin(pitch));
  const screen = p.projectCamera(v), d = 1400 - v.depth;
  near(screen.distance, d); near(screen.scale, 1400 / d); near(screen.depth, 1 / d);
  near(screen.x, viewport.width / 2 + v.x * 1400 / d); near(screen.y, viewport.height / 2 + v.y * 1400 / d);
  const straight = camera(), ground = straight.project(center.x, center.y, 0), raised = straight.project(center.x, center.y, 64);
  assert.ok(raised.y < ground.y); assert.ok(raised.scale > ground.scale); assert.ok(raised.depth > ground.depth);
});

test('near/far sizes vary in perspective while orthographic preserves scale and original depth', () => {
  for (const projection of ['perspective', 'orthographic']) {
    const p = camera({ projection, distance: 600 });
    const far = p.projectCamera({ x: 20, y: 10, depth: -200 }), mid = p.projectCamera({ x: 20, y: 10, depth: 0 }), close = p.projectCamera({ x: 20, y: 10, depth: 200 });
    assert.ok(far.depth < mid.depth && mid.depth < close.depth);
    if (projection === 'perspective') { near(far.scale, 0.75); near(mid.scale, 1); near(close.scale, 1.5); }
    else { assert.equal(far.scale, 1); assert.equal(mid.scale, 1); assert.equal(close.scale, 1); assert.equal(close.depth, 200); }
  }
});

test('near plane is visible and behind-near vertices produce finite harmless coordinates', () => {
  const p = camera({ distance: 600, near: 32, zoom: 2 });
  const boundary = p.projectCamera({ x: 5, y: -8, depth: 568 });
  assert.equal(boundary.visible, true); near(boundary.distance, 32); near(boundary.scale, 37.5); near(boundary.depth, 1 / 32);
  for (const depth of [568.0001, 600, 700, Number.MAX_VALUE]) {
    const point = p.projectCamera({ x: 100, y: 100, depth });
    assert.equal(point.visible, false); assert.equal(point.x, 0); assert.equal(point.y, 0); assert.equal(point.scale, 0);
    assert.ok(Object.values(point).filter(value => typeof value === 'number').every(Number.isFinite));
  }
  assert.throws(() => p.project(0, Infinity), TypeError);
  assert.throws(() => p.projectCamera({ x: 1, y: 2, depth: NaN }), TypeError);
});

test('ground inverse rejects the perspective horizon, backwards ray and near-plane intersections', () => {
  const config = settings({ distance: 600, near: 32 }), p = camera(config);
  const horizon = viewport.height / 2 - config.zoom * config.distance * Math.tan(config.pitch);
  assert.equal(p.unprojectGround(viewport.width / 2, horizon), null);
  assert.equal(p.unprojectGround(viewport.width / 2, horizon - 10), null);
  const d = config.near / 2, ry = (config.distance - d) / Math.cos(config.pitch);
  const behindNearY = viewport.height / 2 + ry * Math.sin(config.pitch) * config.zoom * config.distance / d;
  assert.equal(p.unprojectGround(viewport.width / 2, behindNearY), null);
  const ortho = camera({ projection: 'orthographic' });
  assert.ok(ortho.unprojectGround(viewport.width / 2, horizon));
  assert.throws(() => p.unprojectGround(NaN, 0), TypeError);
});

test('camera-space near clipping interpolates UV/all numeric attributes and returns finite projected vertices', () => {
  const p = camera({ distance: 600, near: 32 });
  const symbol = Symbol('weight');
  const vertices = [{ x: 0, y: 0, depth: 550, u: 0, v: 0, shade: 2, [symbol]: 10 },
    { x: 100, y: 0, depth: 586, u: 1, v: 0, shade: 6, [symbol]: 20 },
    { x: 0, y: 100, depth: 550, u: 0, v: 1, shade: 10, [symbol]: 30 }];
  vertices.forEach((vertex, index) => { Object.defineProperty(vertex, 'hiddenNumeric', { value: index * 10 }); Object.freeze(vertex); }); Object.freeze(vertices);
  const clipped = p.clipPolygon(vertices); assert.equal(clipped.length, 4);
  assert.deepEqual([clipped[1].x, clipped[1].y, clipped[1].depth, clipped[1].u, clipped[1].v, clipped[1].shade], [50, 0, 568, 0.5, 0, 4]);
  assert.deepEqual([clipped[2].x, clipped[2].y, clipped[2].depth, clipped[2].u, clipped[2].v, clipped[2].shade], [50, 50, 568, 0.5, 0.5, 8]);
  assert.equal(clipped[1][symbol], 15); assert.equal(clipped[2][symbol], 25);
  assert.equal(clipped[1].hiddenNumeric, 5); assert.equal(clipped[2].hiddenNumeric, 15);
  assert.equal(vertices[1].depth, 586); assert.equal(vertices[1].u, 1);
  for (const vertex of clipped) {
    const screen = p.projectCamera(vertex); assert.equal(screen.visible, true);
    assert.ok(Object.values(screen).filter(value => typeof value === 'number').every(Number.isFinite));
  }
  near(p.projectCamera(clipped[1]).depth, 1 / 32);
});

test('outside/orthographic clipping, returned vertex isolation and captured factory settings are stable', () => {
  const config = settings({ distance: 600 }), origin = { ...center }, size = { ...viewport };
  const p = createWorldProjection(config, origin, size), expected = p.project(center.x + 50, center.y - 50);
  config.zoom = 2; origin.x = 0; size.width = 1; assert.deepEqual(p.project(center.x + 50, center.y - 50), expected);
  const vertices = [{ x: 1, y: 2, depth: 590, u: 0 }, { x: 3, y: 4, depth: 700, u: 1 }, { x: 5, y: 6, depth: 600, u: 2 }];
  assert.deepEqual(p.clipPolygon(vertices), []); assert.deepEqual(p.clipPolygon([]), []);
  const ortho = camera({ projection: 'orthographic', distance: 600 }), copied = ortho.clipPolygon(vertices);
  assert.deepEqual(copied, vertices); assert.notEqual(copied, vertices); assert.notEqual(copied[0], vertices[0]);
  copied[0].u = 9; assert.equal(vertices[0].u, 0); assert.equal(ortho.projectCamera(vertices[1]).visible, true);
  assert.throws(() => p.clipPolygon([{ x: 1, y: 2, depth: 3, u: NaN }]), TypeError);
  assert.throws(() => p.clipPolygon(null), TypeError);
  assert.deepEqual(createWorldProjection(undefined, center, viewport).project(center.x, center.y), camera().project(center.x, center.y));
});
