/** Explicit normalized source math only. No source formula or default is inferred. */
export const SOURCE_HEIGHT_PROGRAM_LIMITS = Object.freeze({
  version: 1, coordinates: 'tile-center-space', width: 200, height: 200, tileSize: 40,
  cells: 40000, jsonBytes: 65536, jsonDepth: 64, jsonVisits: 8192,
  expressionDepth: 32, expressionNodes: 256, resampleOperations: 10240000,
});
const RESERVED = new Set(['__proto__', 'prototype', 'constructor']);
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const bytes = value => new TextEncoder().encode(value).byteLength;
const OPS = Object.freeze({ constant: [0, 0], x: [1, 0], y: [2, 0],
  add: [3, 2], sub: [4, 2], mul: [5, 2], div: [6, 2], min: [7, 2], max: [8, 2],
  abs: [9, 1], sqrt: [10, 1], hypot: [11, 2], clamp: [12, 3], smoothstep: [13, 3] });

function safeEvaluatorJSON(input) {
  const fail = reason => ({ ok: false, errors: [`evaluator: ${reason}`], value: null });
  try {
    let value = input;
    if (typeof input === 'string') {
      if (input.length > SOURCE_HEIGHT_PROGRAM_LIMITS.jsonBytes || bytes(input) > SOURCE_HEIGHT_PROGRAM_LIMITS.jsonBytes) return fail('raw UTF-8 JSON exceeds65536bytes');
      try { value = JSON.parse(input); } catch { return fail('malformed JSON'); }
    }
    const stack = [{ value, depth: 0 }], ancestors = new Set();
    let visits = 0;
    while (stack.length) {
      const item = stack.pop(), current = item.value;
      if (item.leave) { ancestors.delete(current); continue; }
      if (++visits > SOURCE_HEIGHT_PROGRAM_LIMITS.jsonVisits || item.depth > SOURCE_HEIGHT_PROGRAM_LIMITS.jsonDepth) return fail('safe JSON depth64/visits8192 exceeded');
      if (current === null || typeof current === 'string' || typeof current === 'boolean') continue;
      if (typeof current === 'number' && Number.isFinite(current)) continue;
      if (typeof current !== 'object' || (!Array.isArray(current) && !plain(current))) return fail('finite plain JSON required');
      if (ancestors.has(current) || Object.getOwnPropertySymbols(current).length) return fail('cycle/symbol rejected');
      if (Array.isArray(current) && current.length > SOURCE_HEIGHT_PROGRAM_LIMITS.jsonVisits - visits) return fail('safe JSON visits8192 exceeded');
      const descriptors = Object.getOwnPropertyDescriptors(current), keys = Object.keys(descriptors);
      if (keys.length - (Array.isArray(current) ? 1 : 0) > SOURCE_HEIGHT_PROGRAM_LIMITS.jsonVisits - visits) return fail('safe JSON visits8192 exceeded');
      ancestors.add(current); stack.push({ value: current, leave: true });
      let entries = 0;
      for (const key of keys) {
        if (Array.isArray(current) && key === 'length') continue;
        const descriptor = descriptors[key];
        if (RESERVED.has(key) || !Object.hasOwn(descriptor, 'value') || !descriptor.enumerable) return fail('reserved/accessor/non-enumerable property rejected');
        if (Array.isArray(current)) {
          const index = Number(key);
          if (String(index) !== key || !Number.isSafeInteger(index) || index < 0 || index >= current.length) return fail('dense array indices required');
          entries++;
        }
        stack.push({ value: descriptor.value, depth: item.depth + 1 });
      }
      if (Array.isArray(current) && entries !== current.length) return fail('sparse array rejected');
    }
    const compact = JSON.stringify(value);
    if (bytes(compact) > SOURCE_HEIGHT_PROGRAM_LIMITS.jsonBytes) return fail('compact UTF-8 JSON exceeds65536bytes');
    return { ok: true, errors: [], value: JSON.parse(compact) };
  } catch { return fail('JSON inspection failed'); }
}

/** Compile a bounded AST to fixed instructions, retaining all safe source metadata. */
export function compileSourceHeightProgram(evaluator) {
  const inspected = safeEvaluatorJSON(evaluator);
  const result = { ok: false, errors: [...inspected.errors], pending: [], program: null };
  if (!inspected.ok) return result;
  const input = inspected.value;
  if (!plain(input)) { result.errors.push('evaluator: explicit object required'); return result; }
  if (!Object.hasOwn(input, 'version') || !Object.hasOwn(input, 'coordinates')) {
    result.errors.push('evaluator: explicit version/coordinates required'); return result;
  }
  if (input.version !== 1 || input.coordinates !== 'tile-center-space') {
    result.pending.push({ field: 'evaluator', reason: 'Only version1 tile-center-space normalized math is implemented.', classification: 'ENGINE_IMPLEMENTATION' });
    return result;
  }
  const instructions = [];
  let nodes = 0;
  const build = (node, depth, path) => {
    if (++nodes > SOURCE_HEIGHT_PROGRAM_LIMITS.expressionNodes || depth > SOURCE_HEIGHT_PROGRAM_LIMITS.expressionDepth) {
      result.errors.push(`${path}: expression depth32/nodes256 exceeded`); return;
    }
    if (!plain(node) || typeof node.op !== 'string' || !node.op) { result.errors.push(`${path}: explicit op required`); return; }
    if (!Object.hasOwn(OPS, node.op)) {
      result.pending.push({ field: `${path}.op`, reason: `Unsupported normalized math op ${node.op}.`, classification: 'ENGINE_IMPLEMENTATION' }); return;
    }
    const [code, arity] = OPS[node.op];
    if (code === 0) {
      if (typeof node.value !== 'number' || !Number.isFinite(node.value) || Object.hasOwn(node, 'args')) { result.errors.push(`${path}: constant requires finite value and no args`); return; }
    } else if (arity === 0) {
      if (Object.hasOwn(node, 'args') || Object.hasOwn(node, 'value')) { result.errors.push(`${path}: x/y do not accept args/value`); return; }
    } else {
      if (!Array.isArray(node.args) || node.args.length !== arity || Object.hasOwn(node, 'value')) { result.errors.push(`${path}: ${node.op} requires exactly${arity} args and no value`); return; }
      for (let i = 0; i < arity; i++) build(node.args[i], depth + 1, `${path}.args[${i}]`);
    }
    instructions.push(Object.freeze({ code, value: code === 0 ? node.value : null }));
  };
  build(input.expression, 1, 'evaluator.expression');
  if (result.errors.length || result.pending.length) return result;
  const scratch = new Float64Array(instructions.length);
  const evaluate = (x, y) => {
    const fail = reason => ({ ok: false, value: null, reason });
    if (![x, y].every(value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 200)) return fail('tile-center-space coordinates must be finite0..200');
    let top = 0;
    for (const { code, value } of instructions) {
      let output;
      if (code <= 2) output = code === 0 ? value : code === 1 ? x : y;
      else if (code === 9 || code === 10) {
        const a = scratch[--top];
        if (code === 10 && a < 0) return fail('sqrt of negative value');
        output = code === 9 ? Math.abs(a) : Math.sqrt(a);
      } else if (code === 12 || code === 13) {
        const c = scratch[--top], b = scratch[--top], a = scratch[--top];
        if (code === 12) {
          if (b > c) return fail('clamp min exceeds max');
          output = Math.max(b, Math.min(c, a));
        } else {
          if (a >= b) return fail('smoothstep requires edge0<edge1');
          const width = b - a, distance = c - a;
          if (!Number.isFinite(width) || !Number.isFinite(distance)) return fail('nonfinite smoothstep arithmetic');
          const ratio = distance / width;
          if (!Number.isFinite(ratio)) return fail('nonfinite smoothstep arithmetic');
          const t = Math.max(0, Math.min(1, ratio));
          output = t * t * (3 - 2 * t);
        }
      } else {
        const b = scratch[--top], a = scratch[--top];
        switch (code) {
          case 3: output = a + b; break;
          case 4: output = a - b; break;
          case 5: output = a * b; break;
          case 6: if (b === 0) return fail('division by zero'); output = a / b; break;
          case 7: output = Math.min(a, b); break;
          case 8: output = Math.max(a, b); break;
          case 11: output = Math.hypot(a, b); break;
          default: return fail('invalid compiled instruction');
        }
      }
      if (!Number.isFinite(output)) return fail('nonfinite math result');
      scratch[top++] = output;
    }
    const output = scratch[0];
    if (output < 0 || output > 1) return fail('logical height outside0..1');
    return { ok: true, value: output };
  };
  result.program = Object.freeze({ version: 1, coordinates: input.coordinates, nodes, expressionSnapshot: input, evaluate });
  result.ok = true;
  return result;
}

/** One authoring-time resample; runtime retains its existing bilinear grid lookup. */
export function resampleSourceHeightProgram(evaluator) {
  const compiled = compileSourceHeightProgram(evaluator);
  const result = { ok: false, errors: [...compiled.errors], pending: [...compiled.pending], samples: null, provenance: null };
  if (!compiled.ok) return result;
  const samples = new Array(SOURCE_HEIGHT_PROGRAM_LIMITS.cells);
  for (let y = 0; y < 200; y++) for (let x = 0; x < 200; x++) {
    const value = compiled.program.evaluate(x + 0.5, y + 0.5);
    if (!value.ok) { result.errors.push(`evaluator at tile-center[${x + 0.5},${y + 0.5}]: ${value.reason}`); return result; }
    samples[y * 200 + x] = value.value;
  }
  result.samples = samples;
  result.provenance = { kind: 'engine-derived-logical-grid', coordinates: 'tile-center-space',
    grid: { width: 200, height: 200, tileSize: 40 }, sampleCount: 40000,
    sourceEvaluator: compiled.program.expressionSnapshot, sourcePhysicalZClaim: false };
  result.ok = true;
  return result;
}
