import { validateSourceColliders, querySourceColliderCircle } from './source-scene.js?v=0.16.0';

/** Explicit producer geometry subset only. No full-assembly, physical Z, visual85, or fallback collider claim. */
export const SOURCE_PREVIEW_COLLISION_LIMITS = Object.freeze({ version: 1, colliders: 512, unresolved: 32,
  fileBytes: 4194304, maxDepth: 64, maxVisits: 1000000 });
const RESERVED = new Set(['__proto__', 'prototype', 'constructor']);
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const text = value => typeof value === 'string' && value.trim().length > 0;
const clone = value => JSON.parse(JSON.stringify(value));
const sameJSON = (a, b) => {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every(key => Object.hasOwn(b, key) && sameJSON(a[key], b[key]));
};
const derived = count => ({ colliderCount: count, units: 'world-px', yawUnits: 'radians', sourceGeometryClaim: true, coverage: 'PARTIAL' });

function inspectJSON(root) {
  const fail = reason => ({ ok: false, errors: [`sourcePreview collision JSON: ${reason}`], pending: [] });
  try {
    const stack = [{ value: root, depth: 0 }], ancestors = new Set(); let visits = 0;
    while (stack.length) {
      const item = stack.pop(), value = item.value;
      if (item.leave) { ancestors.delete(value); continue; }
      if (++visits > SOURCE_PREVIEW_COLLISION_LIMITS.maxVisits || item.depth > SOURCE_PREVIEW_COLLISION_LIMITS.maxDepth) return fail('depth64/visits1000000 exceeded');
      if (value === null || typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))) continue;
      if (typeof value !== 'object' || (!Array.isArray(value) && !plain(value))) return fail('finite plain JSON required');
      if (ancestors.has(value) || Object.getOwnPropertySymbols(value).length) return fail('cycle/symbol rejected');
      if (Array.isArray(value) && value.length > SOURCE_PREVIEW_COLLISION_LIMITS.maxVisits - visits) return fail('visits1000000 exceeded');
      const descriptors = Object.getOwnPropertyDescriptors(value), keys = Object.keys(descriptors);
      if (keys.length - (Array.isArray(value) ? 1 : 0) > SOURCE_PREVIEW_COLLISION_LIMITS.maxVisits - visits) return fail('visits1000000 exceeded');
      ancestors.add(value); stack.push({ value, leave: true }); let count = 0;
      for (const key of keys) {
        if (Array.isArray(value) && key === 'length') continue;
        const descriptor = descriptors[key];
        if (RESERVED.has(key) || !Object.hasOwn(descriptor, 'value') || !descriptor.enumerable) return fail('reserved/accessor/non-enumerable rejected');
        if (Array.isArray(value)) {
          const index = Number(key);
          if (String(index) !== key || !Number.isSafeInteger(index) || index < 0 || index >= value.length) return fail('dense array indices required');
          count++;
        }
        stack.push({ value: descriptor.value, depth: item.depth + 1 });
      }
      if (Array.isArray(value) && count !== value.length) return fail('sparse array rejected');
    }
    if (new TextEncoder().encode(JSON.stringify(root)).byteLength > SOURCE_PREVIEW_COLLISION_LIMITS.fileBytes) return fail('compact UTF-8 exceeds4194304bytes');
    return { ok: true, errors: [], pending: [] };
  } catch { return fail('inspection/serialization failed'); }
}

function checkInputs(source, scope) {
  const errors = [], pending = [];
  const missing = (field, reason, classification = 'SOURCE_INPUT') => pending.push({ field, reason, classification });
  if (!plain(source) || !text(source.completionId) || !text(source.control))
    missing('sourceExecutionData', 'An explicit producer envelope with nonempty completionId/control is required.');
  const data = source?.executionData;
  if (!plain(data) || !Array.isArray(data.objectColliders) || data.objectColliderCount === undefined) {
    missing('sourceExecutionData.executionData.objectColliders', 'Actual collider array and explicit count are required; BLOCKED/UNKNOWN is never converted to an empty array.');
  } else {
    if (!Number.isSafeInteger(data.objectColliderCount) || data.objectColliderCount < 0 || data.objectColliderCount > 512
      || data.objectColliderCount !== data.objectColliders.length) errors.push('sourcePreview collision: explicit objectColliderCount0..512 must equal source array length');
    const validation = validateSourceColliders(data.objectColliders, { jsonValidated: true });
    errors.push(...validation.errors);
    if (!validation.ok) missing('sourceExecutionData.executionData.objectColliders', 'Collider schema is outside the supported canonical world-px primitive contract.', 'ENGINE_IMPLEMENTATION');
  }
  if (!plain(scope) || scope.kind !== 'hand-authored-stage0-subset' || scope.coverage !== 'PARTIAL' || !text(scope.source) || !text(scope.authoredBy)
    || !Array.isArray(scope.unresolved) || scope.unresolved.length < 1 || scope.unresolved.length > 32 || !scope.unresolved.every(text))
    errors.push('sourcePreview collision: explicit hand-authored-stage0-subset/PARTIAL/source/authoredBy/unresolved1..32 required');
  return { ok: errors.length === 0 && pending.length === 0, errors, pending };
}

export function createSourcePreviewCollision(input = {}) {
  const result = { ok: false, errors: [], pending: [], collisionPreview: null };
  const safe = inspectJSON(input); if (!safe.ok) { result.errors.push(...safe.errors); return result; }
  if (!plain(input)) { result.errors.push('sourcePreview collision: explicit plain input object required'); return result; }
  const checked = checkInputs(input.sourceExecutionData, input.scope);
  result.errors.push(...checked.errors); result.pending.push(...checked.pending); if (!checked.ok) return result;
  const contract = { version: 1, kind: 'native-object-collision-subset', sourceExecutionSnapshot: clone(input.sourceExecutionData),
    fullObjectColliderCount: null, sourcePhysicalZClaim: false, scope: clone(input.scope),
    colliders: clone(input.sourceExecutionData.executionData.objectColliders), engineDerived: derived(input.sourceExecutionData.executionData.objectColliderCount) };
  const validation = validateSourcePreviewCollision(contract); result.errors.push(...validation.errors); result.pending.push(...validation.pending);
  if (validation.ok) { result.ok = true; result.collisionPreview = contract; }
  return result;
}

export function validateSourcePreviewCollision(contract, { jsonValidated = false } = {}) {
  if (!jsonValidated) { const safe = inspectJSON(contract); if (!safe.ok) return safe; }
  if (!plain(contract)) return { ok: false, errors: ['sourcePreview collision: explicit collisionPreview object required'], pending: [] };
  const checked = checkInputs(contract.sourceExecutionSnapshot, contract.scope), errors = [...checked.errors], pending = [...checked.pending];
  if (contract.version !== 1 || contract.kind !== 'native-object-collision-subset' || contract.fullObjectColliderCount !== null || contract.sourcePhysicalZClaim !== false)
    errors.push('sourcePreview collision: version1/native-object-collision-subset/full count null/physical Z claim false required');
  const data = contract.sourceExecutionSnapshot?.executionData;
  if (!sameJSON(contract.colliders, data?.objectColliders)) errors.push('sourcePreview collision: collider records must exactly preserve the producer snapshot array');
  if (!sameJSON(contract.engineDerived, derived(data?.objectColliderCount))) errors.push('sourcePreview collision: derived count/units/radians/source geometry/PARTIAL must match the explicit producer count');
  return { ok: errors.length === 0 && pending.length === 0, errors, pending };
}

/** Source world XY, never projected screen Y or engine Z. Owner retains existing swept nav/height gates. */
export function querySourcePreviewCollision(contract, x, y, radius, { validated = false } = {}) {
  if (!validated && !validateSourcePreviewCollision(contract).ok)
    return { ok: false, blocked: true, colliderId: null, reason: 'invalid-collision-preview' };
  return querySourceColliderCircle(contract?.colliders, x, y, radius, { validated: true });
}
