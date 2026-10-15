import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSourceColliders, querySourceColliderCircle } from '../engine/fdg/source-scene.js';
import { createSourcePreviewCollision, validateSourcePreviewCollision, querySourcePreviewCollision } from '../engine/fdg/source-preview-collision.js';

const copy = value => JSON.parse(JSON.stringify(value));
const makeInput = () => ({
  sourceExecutionData: { completionId: 'UNIT producer geometry', control: 'UNIT explicit partial',
    baseRef: '/UNIT/not-fetched.json', unknownEnvelope: { retained: true }, visualMetadata: { visualCount: 85 },
    executionData: { objectColliderCount: 4, objectColliders: [
      { id: 'UNIT-circle', kind: 'circle', center: [100, 100], radius: 5, yaw: 'native extra metadata, irrelevant to a circle', unknownNative: { preserved: true } },
      { id: 'UNIT-ellipse', kind: 'ellipse', center: [180, 200], radii: [20, 5], yaw: Math.PI / 2 },
      { id: 'UNIT-part', kind: 'box', center: [300, 400], size: [30, 4], yaw: Math.PI / 4 },
      { id: 'UNIT-band', kind: 'ellipse-band', center: [400, 400], radii: [20, 10], yaw: 0, innerRatio: 0.5, outerRatio: 1,
        exceptions: [{ id: 'UNIT-band-opening', kind: 'circle', center: [419, 400], radius: 4, yaw: 'unknown extra' }] },
    ], unknownExecution: { preserve: true } } },
  scope: { kind: 'hand-authored-stage0-subset', coverage: 'PARTIAL', source: 'UNIT producer numeric expansion',
    unresolved: ['UNIT other assembly unknown', 'UNIT full collider count unknown'], authoredBy: 'UNIT explicit subset author', unknownScope: 'retain' },
});

test('collider-only wrappers consume exact world circle, rotated ellipse and rotated expanded box without circle-yaw poisoning', () => {
  const primitives = makeInput().sourceExecutionData.executionData.objectColliders, before = JSON.stringify(primitives);
  assert.equal(validateSourceColliders(primitives).ok, true);
  assert.deepEqual(querySourceColliderCircle(primitives, 105.5, 100, 0.5), { ok: true, blocked: true, colliderId: 'UNIT-circle', reason: 'collider:UNIT-circle' });
  assert.equal(querySourceColliderCircle(primitives, 106, 100, 0.5).blocked, false);
  assert.equal(querySourceColliderCircle(primitives, 100, 100, 0).blocked, true);
  assert.equal(querySourceColliderCircle(primitives, 180, 219, 2).colliderId, 'UNIT-ellipse');
  assert.equal(querySourceColliderCircle(primitives, 187, 200, 1).blocked, false);
  assert.equal(querySourceColliderCircle(primitives, 300 + 16 / Math.SQRT2, 400 + 16 / Math.SQRT2, 1).colliderId, 'UNIT-part');
  assert.equal(querySourceColliderCircle(primitives, 300 - 5 / Math.SQRT2, 400 + 5 / Math.SQRT2, 1).blocked, false);
  assert.equal(JSON.stringify(primitives), before);
});

test('band requires full-circle exception containment and errors fail closed with existing primitive/JSON limits', () => {
  const band = [makeInput().sourceExecutionData.executionData.objectColliders[3]];
  assert.equal(querySourceColliderCircle(band, 400, 400, 1).blocked, false);
  assert.equal(querySourceColliderCircle(band, 411, 400, 1).blocked, true);
  assert.equal(querySourceColliderCircle(band, 419, 400, 1).blocked, false);
  assert.equal(querySourceColliderCircle(band, 419, 400, 5).blocked, true);
  assert.equal(querySourceColliderCircle(band, 425, 400, 1).blocked, false);
  const duplicated = [{ id: 'same', kind: 'circle', center: [1, 1], radius: 1 }, { id: 'same', kind: 'circle', center: [2, 2], radius: 1 }];
  assert.equal(validateSourceColliders(duplicated).ok, false);
  assert.deepEqual(querySourceColliderCircle(duplicated, 1, 1, 1), { ok: false, blocked: true, colliderId: null, reason: 'invalid-colliders' });
  assert.equal(querySourceColliderCircle(band, -1, 400, 1).ok, false);
  assert.equal(querySourceColliderCircle(band, 400, 400, 20).blocked, true);
  const nonfinite = copy(band); nonfinite[0].radii[0] = NaN;
  assert.equal(validateSourceColliders(nonfinite).ok, false);
  const sparse = new Array(2); sparse[0] = duplicated[0];
  assert.equal(validateSourceColliders(sparse).ok, false);
  let reads = 0; const accessor = copy(band); Object.defineProperty(accessor[0], 'unknown', { enumerable: true, get() { reads++; return 1; } });
  assert.equal(querySourceColliderCircle(accessor, 400, 400, 1).ok, false); assert.equal(reads, 0);
  const nested = copy(band); nested[0].exceptions = [copy(band[0])];
  assert.equal(validateSourceColliders(nested).ok, false);
  const tooMany = Array.from({ length: 513 }, (_, i) => ({ id: `UNIT-${i}`, kind: 'circle', center: [i, 1], radius: 1 }));
  assert.equal(validateSourceColliders(tooMany).ok, false);
});

test('partial producer snapshot/count and unknown metadata survive independently, while stale saved geometry or full-adoption claims fail', () => {
  const input = makeInput(), before = JSON.stringify(input), built = createSourcePreviewCollision(input);
  assert.equal(built.ok, true, built.errors.join('\n'));
  const contract = built.collisionPreview;
  assert.equal(JSON.stringify(input), before);
  assert.deepEqual(contract.sourceExecutionSnapshot, input.sourceExecutionData);
  assert.deepEqual(contract.colliders, input.sourceExecutionData.executionData.objectColliders);
  assert.deepEqual(contract.scope, input.scope);
  assert.deepEqual(contract.engineDerived, { colliderCount: 4, units: 'world-px', yawUnits: 'radians', sourceGeometryClaim: true, coverage: 'PARTIAL' });
  assert.equal(contract.fullObjectColliderCount, null); assert.equal(contract.sourcePhysicalZClaim, false);
  assert.equal(contract.sourceExecutionSnapshot.visualMetadata.visualCount, 85);
  input.sourceExecutionData.executionData.objectColliders[0].radius = 99;
  assert.equal(contract.colliders[0].radius, 5); assert.equal(contract.sourceExecutionSnapshot.executionData.objectColliders[0].radius, 5);
  assert.equal(validateSourcePreviewCollision(copy(contract)).ok, true);
  assert.equal(querySourcePreviewCollision(contract, 100, 100, 1).colliderId, 'UNIT-circle');
  assert.equal(querySourcePreviewCollision(contract, 180, 219, 2, { validated: true }).colliderId, 'UNIT-ellipse');
  const changed = copy(contract); changed.colliders[0].radius = 9;
  assert.equal(validateSourcePreviewCollision(changed).ok, false);
  assert.equal(querySourcePreviewCollision(changed, 100, 100, 1).blocked, true);
  const count = copy(contract); count.engineDerived.colliderCount = 85;
  assert.equal(validateSourcePreviewCollision(count).ok, false);
  const complete = copy(contract); complete.scope.coverage = 'FULL'; complete.fullObjectColliderCount = 4;
  assert.equal(validateSourcePreviewCollision(complete).ok, false);
  const physical = copy(contract); physical.sourcePhysicalZClaim = true;
  assert.equal(validateSourcePreviewCollision(physical).ok, false);
});

test('BLOCKED or missing source stays pending, unsupported raw schema stays implementation pending, and explicit zero subset differs from guessed empty geometry', () => {
  const blocked = makeInput(); blocked.sourceExecutionData.executionData.objectColliders = { status: 'EXTRACTION_BLOCKED', objectColliderCount: 'UNKNOWN' };
  delete blocked.sourceExecutionData.executionData.objectColliderCount;
  const waiting = createSourcePreviewCollision(blocked);
  assert.equal(waiting.ok, false); assert.equal(waiting.collisionPreview, null); assert.deepEqual(waiting.errors, []);
  assert.ok(waiting.pending.some(value => value.classification === 'SOURCE_INPUT'));
  const missingCount = makeInput(); delete missingCount.sourceExecutionData.executionData.objectColliderCount;
  assert.equal(createSourcePreviewCollision(missingCount).collisionPreview, null);
  const mismatch = makeInput(); mismatch.sourceExecutionData.executionData.objectColliderCount = 85;
  assert.equal(createSourcePreviewCollision(mismatch).ok, false);
  const raw = makeInput(); raw.sourceExecutionData.executionData.objectColliders[0] = { id: 'UNIT-raw', kind: 'colParts', localOffsets: [1, 2] };
  const unsupported = createSourcePreviewCollision(raw);
  assert.equal(unsupported.collisionPreview, null); assert.ok(unsupported.pending.some(value => value.classification === 'ENGINE_IMPLEMENTATION'));
  const zero = makeInput(); zero.sourceExecutionData.executionData.objectColliders = []; zero.sourceExecutionData.executionData.objectColliderCount = 0;
  const explicit = createSourcePreviewCollision(zero);
  assert.equal(explicit.ok, true); assert.equal(explicit.collisionPreview.fullObjectColliderCount, null);
  assert.equal(querySourcePreviewCollision(explicit.collisionPreview, 100, 100, 0).blocked, false);
  const unsafe = makeInput(); unsafe.sourceExecutionData.unknown = JSON.parse('{"__proto__":1}');
  assert.equal(createSourcePreviewCollision(unsafe).ok, false);
  let reads = 0; const getter = makeInput(); Object.defineProperty(getter.sourceExecutionData, 'unknown', { enumerable: true, get() { reads++; return 1; } });
  assert.equal(createSourcePreviewCollision(getter).ok, false); assert.equal(reads, 0);
});
