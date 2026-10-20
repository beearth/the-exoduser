import { LIMITS, validateProject } from './project.js?v=0.16.0';
import { WORLD_LIMITS, validateWorldProject } from './world-project.js';
import { validateSourceScene, sampleSourceHeight, SOURCE_SCENE_EXECUTION_CONTRACT } from './source-scene.js?v=0.10.0';
import { resampleSourceHeightProgram } from './source-height-program.js?v=0.11.0';
import { buildSourcePreview, attachSourcePreviewGround, attachSourcePreviewCollision } from './source-preview.js?v=0.16.0';
import { validateSourceColliders } from './source-scene.js?v=0.16.0';

/** Stage0 inspection and candidate production. Decode/install remain owner gates. */
export const MAP_SOURCE_LIMITS = Object.freeze({
  inputBytes: WORLD_LIMITS.fileBytes, projectBytes: LIMITS.fileBytes,
  worldBytes: WORLD_LIMITS.fileBytes, maxDepth: 64, maxVisits: 1000000,
});
const RESERVED = new Set(['__proto__', 'prototype', 'constructor']);
const NAV_FORMAT = 'RLE row-major (value,count) pairs; 1=walkable(polygon 내부), 0=non-walkable(외부)';
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const text = value => typeof value === 'string' && value.trim().length > 0;
const integer = (value, low, high) => Number.isSafeInteger(value) && value >= low && value <= high;
const pair = (value, check) => Array.isArray(value) && value.length === 2 && value.every(check);
const bytes = value => new TextEncoder().encode(value).byteLength;

/** Inspect descriptors before serialization so authored metadata cannot run hooks. */
export function inspectMapSourceJSON(input, { label = 'input', maxBytes = MAP_SOURCE_LIMITS.inputBytes } = {}) {
  const fail = reason => ({ ok: false, errors: [`${label}: ${reason}`], value: null, bytes: null });
  if (!integer(maxBytes, 1, MAP_SOURCE_LIMITS.inputBytes)) return fail('invalid JSON byte budget');
  let value = input, rawBytes = null;
  try {
    if (typeof input === 'string') {
      if (input.length > maxBytes || (rawBytes = bytes(input)) > maxBytes) return fail(`raw UTF-8 JSON exceeds ${maxBytes} bytes`);
      try { value = JSON.parse(input); } catch { return fail('malformed JSON'); }
    }
    const stack = [{ value, path: label, depth: 0 }], ancestors = new Set();
    let visited = 0;
    while (stack.length) {
      const item = stack.pop(), current = item.value;
      if (item.leave) { ancestors.delete(current); continue; }
      if (++visited > MAP_SOURCE_LIMITS.maxVisits || item.depth > MAP_SOURCE_LIMITS.maxDepth) return fail(`${item.path}: JSON inspection limit exceeded`);
      if (current === null || typeof current === 'string' || typeof current === 'boolean') continue;
      if (typeof current === 'number' && Number.isFinite(current)) continue;
      if (typeof current !== 'object' || (!Array.isArray(current) && !plain(current))) return fail(`${item.path}: finite plain JSON data required`);
      if (ancestors.has(current)) return fail(`${item.path}: cyclic JSON data rejected`);
      if (Object.getOwnPropertySymbols(current).length) return fail(`${item.path}: symbol keys rejected`);
      if (Array.isArray(current) && current.length > MAP_SOURCE_LIMITS.maxVisits - visited) return fail(`${item.path}: JSON inspection limit exceeded`);
      const descriptors = Object.getOwnPropertyDescriptors(current), keys = Object.keys(descriptors);
      if (keys.length - (Array.isArray(current) ? 1 : 0) > MAP_SOURCE_LIMITS.maxVisits - visited) return fail(`${item.path}: JSON inspection limit exceeded`);
      ancestors.add(current); stack.push({ ...item, leave: true });
      let arrayEntries = 0;
      for (const key of keys) {
        if (Array.isArray(current) && key === 'length') continue;
        const descriptor = descriptors[key];
        if (RESERVED.has(key)) return fail(`${item.path}.${key}: reserved key rejected`);
        if (!Object.hasOwn(descriptor, 'value') || !descriptor.enumerable) return fail(`${item.path}.${key}: enumerable JSON data property required`);
        if (Array.isArray(current)) {
          const index = Number(key);
          if (String(index) !== key || !integer(index, 0, current.length - 1)) return fail(`${item.path}.${key}: array index required`);
          arrayEntries++;
        }
        stack.push({ value: descriptor.value, path: `${item.path}.${key}`, depth: item.depth + 1 });
      }
      if (Array.isArray(current) && arrayEntries !== current.length) return fail(`${item.path}: sparse array rejected`);
    }
    const compact = JSON.stringify(value), compactBytes = bytes(compact);
    if (compactBytes > maxBytes) return fail(`compact UTF-8 JSON exceeds ${maxBytes} bytes`);
    return { ok: true, errors: [], value: JSON.parse(compact), bytes: rawBytes ?? compactBytes };
  } catch { return fail('JSON inspection or serialization failed'); }
}

function freezeJSON(value) {
  const stack = [value], seen = new Set();
  while (stack.length) {
    const current = stack.pop();
    if (current === null || typeof current !== 'object' || seen.has(current)) continue;
    seen.add(current);
    for (const child of Object.values(current)) stack.push(child);
    Object.freeze(current);
  }
  return value;
}

// Sync byte authority for public raw JSON input; never fetches baseRef.path.
function sha256UTF8(value) {
  const data = new TextEncoder().encode(value), length = Math.ceil((data.length + 9) / 64) * 64;
  const padded = new Uint8Array(length); padded.set(data); padded[data.length] = 128;
  const view = new DataView(padded.buffer), bitLength = data.length * 8;
  view.setUint32(length - 8, Math.floor(bitLength / 4294967296)); view.setUint32(length - 4, bitLength >>> 0);
  const constants = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  const state = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  const rotate = (word, amount) => (word >>> amount) | (word << (32 - amount)), words = new Uint32Array(64);
  for (let offset = 0; offset < length; offset += 64) {
    for (let i = 0; i < 16; i++) words[i] = view.getUint32(offset + i * 4);
    for (let i = 16; i < 64; i++) {
      const a = words[i - 15], b = words[i - 2];
      words[i] = (words[i - 16] + (rotate(a,7) ^ rotate(a,18) ^ (a >>> 3)) + words[i - 7] + (rotate(b,17) ^ rotate(b,19) ^ (b >>> 10))) >>> 0;
    }
    let [a,b,c,d,e,f,g,h] = state;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (rotate(e,6) ^ rotate(e,11) ^ rotate(e,25)) + ((e & f) ^ (~e & g)) + constants[i] + words[i]) >>> 0;
      const t2 = ((rotate(a,2) ^ rotate(a,13) ^ rotate(a,22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      [h,g,f,e,d,c,b,a] = [g,f,e,(d + t1) >>> 0,c,b,a,(t1 + t2) >>> 0];
    }
    for (const [i, value] of [a,b,c,d,e,f,g,h].entries()) state[i] = (state[i] + value) >>> 0;
  }
  return state.map(value => value.toString(16).padStart(8, '0')).join('');
}

/** Future mapped outputs still use canonical semantic validation and their own budgets. */
export function validateMapSourceOutput(project, world) {
  const errors = [];
  for (const [label, value, maxBytes, validate] of [
    ['project', project, MAP_SOURCE_LIMITS.projectBytes, validateProject],
    ['world', world, MAP_SOURCE_LIMITS.worldBytes, validateWorldProject],
  ]) {
    if (value === null || value === undefined) continue;
    const inspected = inspectMapSourceJSON(value, { label, maxBytes });
    if (!inspected.ok) errors.push(...inspected.errors);
    else {
      if (label === 'world' && Array.isArray(inspected.value?.scenes)) {
        for (let i = 0; i < inspected.value.scenes.length; i++) {
          const scene = inspected.value.scenes[i];
          if (scene?.project === null || scene?.project === undefined) continue;
          errors.push(...inspectMapSourceJSON(scene.project, {
            label: `world.scenes[${i}].project`, maxBytes: MAP_SOURCE_LIMITS.projectBytes,
          }).errors);
        }
      }
      errors.push(...validate(inspected.value).errors.map(reason => `${label}: ${reason}`));
    }
  }
  return { ok: errors.length === 0, errors };
}

/** Preserve both source documents; decode only the explicitly declared polygon nav. */
export function adaptMapSourceScene(source, manifest, { previewProject, engineAuthored, sourceRevision, manifestRevision } = {}) {
  const result = { ok: false, errors: [], pending: [], mapping: [], project: null, world: null,
    candidateProject: null, inspection: null, sourceRequired: [], engineAuthoredFields: [], pendingCounts: {} };
  const pending = (field, reason, classification = 'SOURCE_INPUT') => {
    if (!result.pending.some(item => item.field === field)) result.pending.push({ field, reason, classification });
  };
  const finish = () => {
    result.sourceRequired = result.pending.filter(item => item.classification === 'SOURCE_INPUT');
    result.engineAuthoredFields = result.pending.filter(item => item.classification === 'ENGINE_AUTHORING');
    for (const key of ['SOURCE_INPUT', 'ENGINE_AUTHORING', 'ENGINE_IMPLEMENTATION']) result.pendingCounts[key] = result.pending.filter(item => item.classification === key).length;
    freezeJSON(result.inspection); return result;
  };
  const check = (condition, field, reason) => { if (!condition) result.errors.push(`${field}: ${reason}`); return condition; };
  if (source === undefined || source === null || manifest === undefined || manifest === null) {
    pending('source-format-pending', 'Both exact stage0 source JSON and resource manifest are required; no format or geometry inferred.');
    pending('engineAuthored.resourceBindings', 'Approved same-origin src bindings are ENGINE_AUTHORING, not MAP physical/source values.', 'ENGINE_AUTHORING');
    return finish();
  }
  const sourceJSON = inspectMapSourceJSON(source, { label: 'source' });
  const manifestJSON = inspectMapSourceJSON(manifest, { label: 'manifest' });
  result.errors.push(...sourceJSON.errors, ...manifestJSON.errors);
  if (result.errors.length) return finish();
  const s = sourceJSON.value, m = manifestJSON.value;
  result.inspection = { sourceSnapshot: s, manifestSnapshot: m };
  if (!plain(s) || !plain(m)) {
    check(false, 'source/manifest', 'JSON object roots required'); return finish();
  }
  if (s.nativeContract?.symbol !== 'CH1_1_PRODUCTION' || s.nativeContract?.version !== '20260916-finish-1') {
    pending('source-format-pending', 'Only the delivered CH1_1_PRODUCTION / 20260916-finish-1 export is recognized.');
    pending('engineAuthored.executionContract', 'Explicit built-in execution option is ENGINE_AUTHORING.', 'ENGINE_AUTHORING');
    return finish();
  }
  const native = s.nativeContract, b = s.bounds, nav = s.nav, polygon = s.boundaryPolygon, start = s.start;
  check(native.stage === 0, 'nativeContract.stage', 'only stage0 is supported');
  for (const key of ['completionId', 'control']) check(text(s[key]) && m[key] === s[key], key, 'source/manifest nonempty headers must match');
  check(text(s.kind) && text(s.scope) && text(m.kind), 'source/manifest.header', 'kind and source scope are required');
  check(pair(native.size, value => value === 200) && native.tileSize === 40, 'nativeContract.size/tileSize', '200×200 / 40px required');
  check(plain(b) && pair(b.gridTiles, value => value === 200) && b.tileSizePx === native.tileSize
    && pair(b.worldSizePx, value => value === 8000) && pair(b.worldRangePx, value => value === 0 || value === 8000)
    && b.worldRangePx[0] === 0 && b.worldRangePx[1] === 8000 && b.chunkSizePx === 1024,
  'bounds', 'native grid/tile/world bounds and 1024px chunk must agree');
  check(plain(b) && typeof b.geometryHash === 'string' && /^[a-f0-9]{64}$/i.test(b.geometryHash),
    'bounds.geometryHash', 'source geometry hash required; this adapter does not recompute or verify source files');
  check(plain(s.units) && s.units.rawTile === '정수 tile index' && s.units.centerTile === 'rawTile+0.5 (tile)'
    && s.units.worldPx === 'centerTile*40 (px, 0..8000)', 'units', 'delivered raw/center/world coordinate declarations required');
  check(plain(polygon) && polygon.units === 'tile index' && Array.isArray(polygon.data)
    && polygon.data.length >= 3 && polygon.points === polygon.data.length
    && polygon.data.every(point => pair(point, value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 200)),
  'boundaryPolygon', 'declared count and finite tile-index point pairs required');
  let tiles = null, walkable = 0;
  if (check(plain(nav) && nav.format === NAV_FORMAT && Array.isArray(nav.data)
    && nav.data.length > 0 && nav.data.length % 2 === 0 && nav.rlePairs === nav.data.length / 2
    && nav.totalTiles === 40000, 'nav', 'explicit polygon-only 0/1 row-major RLE with matching pair/total counts required')) {
    const decoded = [];
    for (let i = 0; i < nav.data.length; i += 2) {
      const code = nav.data[i], count = nav.data[i + 1];
      if (!check((code === 0 || code === 1) && integer(count, 1, 40000) && decoded.length + count <= 40000,
        `nav.data[${i}]`, '0/1 value and positive bounded run required')) break;
      for (let cell = 0; cell < count; cell++) decoded.push(code);
      if (code === 1) walkable += count;
    }
    if (check(decoded.length === 40000 && walkable === nav.walkableTiles, 'nav.counts', 'decoded total/walkable counts must match metadata')) tiles = decoded;
  }
  const startValid = check(plain(start) && pair(start.rawTile, value => integer(value, 0, 199))
    && pair(start.centerTile, value => typeof value === 'number' && Number.isFinite(value))
    && pair(start.worldPx, value => typeof value === 'number' && Number.isFinite(value))
    && start.rawTile.every((value, i) => start.centerTile[i] === value + 0.5 && start.worldPx[i] === start.centerTile[i] * 40),
  'start', 'centerTile=rawTile+0.5 once; worldPx=centerTile×40 required');
  if (startValid && tiles) check(tiles[start.rawTile[1] * 200 + start.rawTile[0]] === 1, 'start.rawTile', 'source START must be on polygon nav floor');
  const g = s.gateExit;
  check(plain(g) && g.bossCx === 100 && g.gateY === 5 && g.exitY === 7
    && plain(g.gateTiles) && pair(g.gateTiles.x, value => value === 99 || value === 101)
    && g.gateTiles.x[0] === 99 && g.gateTiles.x[1] === 101 && g.gateTiles.y === 5 && g.gateTiles.value === 3
    && plain(g.exitTiles) && pair(g.exitTiles.x, value => value === 99 || value === 101)
    && g.exitTiles.x[0] === 99 && g.exitTiles.x[1] === 101 && g.exitTiles.y === 7 && g.exitTiles.value === 2
    && plain(g.clearRegion) && pair(g.clearRegion.x, value => value === 88 || value === 112)
    && g.clearRegion.x[0] === 88 && g.clearRegion.x[1] === 112 && pair(g.clearRegion.y, value => value === 2 || value === 35)
    && g.clearRegion.y[0] === 2 && g.clearRegion.y[1] === 35 && g.clearRegion.value === 0,
  'gateExit', 'native gate3/exit2/clear0 metadata must stay separate from polygon nav');
  const collision = s.collision, placements = m.placements;
  check(plain(collision) && plain(collision.objectColliders) && integer(collision.objectColliders.count, 0, 1000000)
    && text(collision.objectColliders.pointer) && plain(placements) && placements.count === collision.objectColliders.count && text(placements.pointer),
  'collision/placements', 'source collider and manifest placement pointer/count must agree');
  const resources = [], sourceAssets = m.sourceAssets, groundMaterials = m.groundMaterials;
  const validRelative = value => text(value) && !value.startsWith('/') && !/[\\\x00-\x1f\x7f]/.test(value)
    && value.split('/').every(part => part !== '' && part !== '.' && part !== '..');
  const validateAsset = (item, field, relative) => {
    if (!check(plain(item) && validRelative(relative) && text(item.canonicalAbsolutePath)
      && item.canonicalAbsolutePath.startsWith('/') && !/[\\\x00-\x1f\x7f]/.test(item.canonicalAbsolutePath)
      && item.canonicalAbsolutePath.split('/').slice(1).every(part => part !== '' && part !== '.' && part !== '..')
      && item.canonicalAbsolutePath.endsWith(`/${relative}`) && typeof item.exists === 'boolean' && text(item.role),
    field, 'explicit relative/canonical asset reference, existence metadata and role required')) return;
    resources.push({ role: item.role, path: item.canonicalAbsolutePath, exists: item.exists, placementReady: false });
    if (!item.exists) pending(`${field}.exists`, 'Source manifest reports this file unresolved; no filesystem lookup or fallback is performed.');
  };
  if (check(plain(sourceAssets) && Array.isArray(sourceAssets.items) && sourceAssets.count === sourceAssets.items.length,
    'sourceAssets', 'declared asset count must match items')) {
    const seen = new Set();
    for (let i = 0; i < sourceAssets.items.length; i++) {
      const item = sourceAssets.items[i];
      validateAsset(item, `sourceAssets.items[${i}]`, item?.relative);
      check(!seen.has(item?.relative), `sourceAssets.items[${i}].relative`, 'duplicate source asset reference'); seen.add(item?.relative);
    }
    check(sourceAssets.resolved === sourceAssets.items.filter(item => item?.exists === true).length, 'sourceAssets.resolved', 'resolved count must match existence metadata');
  }
  if (check(plain(groundMaterials) && Array.isArray(groundMaterials.items), 'groundMaterials', 'explicit ground material items required')) {
    const seen = new Set();
    for (let i = 0; i < groundMaterials.items.length; i++) {
      const item = groundMaterials.items[i], field = `groundMaterials.items[${i}]`;
      if (!check(plain(item) && text(item.key) && !seen.has(item.key), field, 'unique material key required')) continue;
      seen.add(item.key);
      if (item.key === 'collisionChanges' && item.values?.raw === false && item.file === null) continue;
      validateAsset(item, field, item.file);
    }
  }
  if (previewProject !== undefined) {
    // Pick only approved resource groups. Never copy the previous map/rig/terrain.
    if (!plain(previewProject)) check(false, 'previewProject', 'existing approved project object required');
    else {
      const selected = {};
      for (const key of ['characters', 'skills', 'vfx', 'preview']) {
        const descriptor = Object.getOwnPropertyDescriptor(previewProject, key);
        if (!descriptor || !Object.hasOwn(descriptor, 'value')) check(false, `previewProject.${key}`, 'resource data property required');
        else selected[key] = descriptor.value;
      }
      if (Object.keys(selected).length === 4) {
        const inspected = inspectMapSourceJSON(selected, { label: 'previewResources', maxBytes: MAP_SOURCE_LIMITS.projectBytes });
        result.errors.push(...inspected.errors);
        if (inspected.ok) {
          const groups = inspected.value, ids = {};
          for (const key of ['characters', 'skills', 'vfx']) {
            check(Array.isArray(groups[key]) && groups[key].length >= 1 && groups[key].length <= LIMITS.resources,
              `previewProject.${key}`, '1..128 existing approved resources required');
            ids[key] = new Set();
            for (const item of Array.isArray(groups[key]) ? groups[key] : []) {
              check(plain(item) && text(item.id) && !ids[key].has(item.id), `previewProject.${key}.id`, 'unique existing resource ID required');
              if (plain(item)) ids[key].add(item.id);
            }
          }
          check(plain(groups.preview), 'previewProject.preview', 'preview references required');
          for (const [key, group] of [['characterId', 'characters'], ['skillId', 'skills'], ['vfxId', 'vfx']])
            check(ids[group].has(groups.preview?.[key]), `previewProject.preview.${key}`, 'reference must resolve in supplied resources');
          for (const skill of Array.isArray(groups.skills) ? groups.skills : [])
            check(plain(skill) && ids.vfx.has(skill.vfx), 'previewProject.skills.vfx', 'VFX reference must resolve in supplied resources');
          result.inspection.previewResources = groups;
        }
      }
    }
  } else pending('previewProject', 'Existing approved character/skill/VFX/preview resources are required.', 'ENGINE_AUTHORING');
  if (!result.errors.length) {
    Object.assign(result.inspection, {
      stage: 0, gridSize: [200, 200], tileSize: 40, boundary: polygon.data,
      tiles, start: { rawTile: start.rawTile, centerTile: start.centerTile, worldPx: start.worldPx },
      gateExit: g, resources, navScope: 'polygon-only',
    });
    for (const [sourceField, fdgField, value] of [
      ['nativeContract.stage', 'inspection.stage', 0], ['bounds.gridTiles', 'inspection.gridSize', '200×200'],
      ['bounds.tileSizePx', 'inspection.tileSize', 40], ['boundaryPolygon.data', 'inspection.boundary', polygon.data.length],
      ['nav.data', 'inspection.tiles', tiles.length], ['nav.walkableTiles', 'inspection.polygonWalkableTiles', walkable],
      ['start.rawTile/centerTile/worldPx', 'inspection.start', 'center=raw+0.5; world=center×40'],
      ['gateExit', 'inspection.gateExit', 'gate3/exit2/clear0 preserved; nav unchanged'],
      ['sourceAssets/groundMaterials', 'inspection.resources', resources.length],
      ['source/manifest unknown JSON', 'inspection.sourceSnapshot/manifestSnapshot', 'preserved'],
    ]) result.mapping.push({ sourceField, fdgField, value, status: 'inspection-only' });
    result.inspection.polygonWalkableTiles = walkable;
    result.inspection.approved9 = sourceAssets.items.map(value => ({ ...value }));
  }
  let visualPlacementRecords = null, revisedColliders = false;
  if (sourceRevision !== undefined || manifestRevision !== undefined) {
    if (sourceRevision === undefined || manifestRevision === undefined) pending('revision-pair', 'Both sourceRevision and manifestRevision are required for the native overlay.');
    else {
      const revisions = [inspectMapSourceJSON(sourceRevision, { label: 'sourceRevision' }), inspectMapSourceJSON(manifestRevision, { label: 'manifestRevision' })];
      result.errors.push(...revisions.flatMap(value => value.errors));
      if (revisions.every(value => value.ok)) {
        const [sr, mr] = revisions.map(value => value.value);
        result.inspection.sourceRevisionSnapshot = sr; result.inspection.manifestRevisionSnapshot = mr;
        const verify = (revision, rawBase, base, label) => {
          if (!check(plain(revision) && text(revision.kind) && revision.kind.startsWith('native-field overlay') && plain(revision.changes)
            && revision.completionId === base.completionId && text(revision.control) && plain(revision.baseRef)
            && text(revision.baseRef.path) && integer(revision.baseRef.bytes, 1, MAP_SOURCE_LIMITS.inputBytes)
            && typeof revision.baseRef.sha256 === 'string' && /^[a-f0-9]{64}$/i.test(revision.baseRef.sha256), label, 'exact native overlay header/baseRef required')) return false;
          if (typeof rawBase !== 'string') { pending(`${label}.baseRef.rawBytes`, 'Raw base JSON is required to verify byte/SHA authority; baseRef.path is never loaded.'); return false; }
          return check(bytes(rawBase) === revision.baseRef.bytes && sha256UTF8(rawBase) === revision.baseRef.sha256.toLowerCase(), `${label}.baseRef`, 'raw base bytes/SHA256 mismatch');
        };
        const sourceBound = verify(sr, source, s, 'sourceRevision'), manifestBound = verify(mr, manifest, m, 'manifestRevision');
        check(sr.control === mr.control, 'revision.control', 'source/manifest overlay control must match');
        if (sourceBound && manifestBound && !result.errors.length) {
          const corrected = sr.changes['/collision/objectColliders']?.new;
          const visual = corrected?.placementsExpanded, usage = mr.changes['/sourceAssets/usage']?.new?.perAssetPlacementCounts;
          if (check(plain(corrected) && plain(visual) && plain(visual.byFile) && text(visual.units) && integer(visual.count, 0, 1000000)
            && visual.count === placements.count && plain(usage), 'revision.visualPlacements', 'explicit native byFile/count/usage required')) {
            const records = [], approvedRelative = new Set(sourceAssets.items.map(value => value.relative));
            for (const [file, instances] of Object.entries(visual.byFile)) {
              if (!check(approvedRelative.has(file) && Array.isArray(instances) && usage[file] === instances.length,
                `revision.visualPlacements.${file}`, 'approved base file and exact per-asset count required')) continue;
              for (const instance of instances) {
                check(plain(instance) && typeof instance.x === 'number' && Number.isFinite(instance.x)
                  && typeof instance.y === 'number' && Number.isFinite(instance.y) && typeof instance.scale === 'number' && Number.isFinite(instance.scale) && instance.scale > 0
                  && typeof instance.opacity === 'number' && Number.isFinite(instance.opacity) && instance.opacity >= 0 && instance.opacity <= 1
                  && typeof instance.brightness === 'number' && Number.isFinite(instance.brightness) && instance.brightness >= 0
                  && typeof instance.saturation === 'number' && Number.isFinite(instance.saturation) && instance.saturation >= 0,
                `revision.visualPlacements.${file}`, 'finite native VISUAL fields required; no tile-bound/brightness clamp');
                records.push({ file, ...instance });
              }
            }
            check(records.length === visual.count && Object.keys(usage).every(file => Object.hasOwn(visual.byFile, file))
              && Object.values(usage).reduce((sum, count) => sum + (Number.isSafeInteger(count) ? count : NaN), 0) === visual.count,
            'revision.visualPlacements.count', 'all byFile and usage counts must match');
            if (!result.errors.length) {
              visualPlacementRecords = records; revisedColliders = true;
              Object.assign(result.inspection, { visualPlacements: records, visualPlacementMetadata: { ...visual, role: 'VISUAL' }, sourceAssetUsage: usage,
                startAuthority: sr.changes['/start/sourceAuthority']?.new ?? null,
                altarCliffBand: sr.changes['/collision/altarCliffBand']?.new ?? null,
                materialFlags: mr.changes['/groundMaterials/flagSeparation']?.new ?? null,
                objectColliderStatus: corrected.status ?? null, realObjectColliderSource: corrected.realObjectColliderSource ?? null });
              result.mapping.push({ sourceField: 'native revision byFile', fdgField: 'inspection.visualPlacements', value: visual.count, status: 'VISUAL-only' });
            }
          }
        }
      }
    }
  }
  const execution = s.executionData;
  if (execution !== undefined && !plain(execution)) check(false, 'executionData', 'explicit source execution object required');
  if (plain(execution)) check(execution.version === 1, 'executionData.version', 'supported normalized export version1 required');
  const sourceFields = [
    ['logicalHeight', 'Source logical samples0..1×40000 or an explicit supported normalized evaluator and source reference are required; no formula is inferred.'],
    ['objectColliders', 'Expanded source circle/ellipse/box/ellipse-band colliders in world px are required.'],
    ['boundaryColliders', 'Explicit source altar/boundary primitives and exceptions are required; polygon nav is unchanged.'],
    ['placements', 'Expanded original placement records are required; pointer-only metadata is insufficient.'],
  ];
  for (const [key, reason] of sourceFields) if ((execution?.[key] === undefined || execution[key] === null) && !(key === 'placements' && visualPlacementRecords)) pending(`executionData.${key}`, reason);
  let authored = null;
  if (engineAuthored !== undefined && engineAuthored !== null) {
    const inspected = inspectMapSourceJSON(engineAuthored, { label: 'engineAuthored' });
    result.errors.push(...inspected.errors);
    if (inspected.ok && check(plain(inspected.value), 'engineAuthored', 'explicit authoring object required')) {
      authored = inspected.value; result.inspection.engineAuthoredSnapshot = authored;
    }
  }
  for (const key of ['heightMapping', 'camera', 'settings', 'resourceBindings', 'executionContract'])
    if (authored?.[key] === undefined || authored[key] === null) pending(`engineAuthored.${key}`, 'Explicit engine authoring option required; never inferred from MAP/source metadata.', 'ENGINE_AUTHORING');
  const sourceAuthority = execution?.startAuthority;
  let authority = sourceAuthority, designStart = false;
  if (sourceAuthority === undefined || sourceAuthority === null) {
    const design = authored?.startAuthority;
    if (design === undefined || design === null) pending('engineAuthored.startAuthority', 'Explicit ROOT-approved design START is required when the source runtime START authority is not supplied.', 'ENGINE_AUTHORING');
    else if (check(plain(design) && design.kind === 'design-start' && design.stage === 0 && design.tileSizePx === 40
      && pair(design.centerTile, value => typeof value === 'number' && Number.isFinite(value)) && design.centerTile[0] === 100.5 && design.centerTile[1] === 185.5
      && pair(design.worldPx, value => typeof value === 'number' && Number.isFinite(value)) && design.worldPx[0] === 4020 && design.worldPx[1] === 7420
      && design.centerTile.every((value, i) => value === start.centerTile[i] && design.worldPx[i] === value * design.tileSizePx)
      && design.source === 'CH1_WORLD_MAP_ORDER / 맵구성_1장.md:3' && design.approvedBy === 'ROOT' && design.runtimeSymbol === 'UNKNOWN',
    'engineAuthored.startAuthority', 'explicit approved design-start/stage0/center100.5,185.5/world4020,7420/T40/source/ROOT/runtimeSymbol UNKNOWN required')) {
      authority = { symbol: 'FDG_AUTHORED_CH1_1_START', source: design.source, kind: 'engine-authored-design-start', approvedBy: design.approvedBy, nativeRuntimeSymbol: 'UNKNOWN' };
      designStart = true;
      result.inspection.startResolution = { role: 'engine-authored-design-start', symbol: authority.symbol, nativeRuntimeSymbol: 'UNKNOWN', sourceStartUnchanged: true };
      result.mapping.push({ sourceField: 'engineAuthored.startAuthority', fdgField: 'candidateProject.sourceScene.actor.startAuthority', value: 'FDG_AUTHORED_CH1_1_START; native symbol UNKNOWN', status: 'engine-authored' });
    }
  }
  if (authority !== undefined && authority !== null) check(plain(authority) && text(authority.symbol) && text(authority.source)
    && !/^PENDING/i.test(authority.symbol) && !/^PENDING/i.test(authority.source),
  designStart ? 'engineAuthored.startAuthority' : 'executionData.startAuthority', 'explicit non-pending START authority required');
  const logical = execution?.logicalHeight;
  let logicalSamples = null, samplingProvenance = null;
  if (logical !== undefined && logical !== null) {
    if (check(plain(logical) && text(logical.source), 'executionData.logicalHeight', 'explicit logical height object/source required')) {
      const hasSamples = logical.samples !== undefined && logical.samples !== null, hasEvaluator = logical.evaluator !== undefined && logical.evaluator !== null;
      if (check(hasSamples !== hasEvaluator, 'executionData.logicalHeight', 'exactly one explicit samples array or normalized evaluator is required')) {
        if (hasSamples) {
          if (check(Array.isArray(logical.samples) && logical.samples.length === 40000
            && logical.samples.every(value => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1),
          'executionData.logicalHeight.samples', 'exact logical samples0..1×40000 required')) logicalSamples = [...logical.samples];
        } else {
          const sampled = resampleSourceHeightProgram(logical.evaluator);
          result.errors.push(...sampled.errors.map(reason => `executionData.logicalHeight.${reason}`));
          for (const item of sampled.pending) pending(`executionData.logicalHeight.${item.field}`, item.reason, item.classification);
          if (sampled.ok) { logicalSamples = sampled.samples; samplingProvenance = sampled.provenance; }
        }
        if (logicalSamples) {
          result.inspection.logicalHeightResolution = { kind: samplingProvenance ? 'engine-derived-logical-grid' : 'source-samples', sampleCount: 40000, source: logical.source,
            ...(samplingProvenance ? { coordinates: samplingProvenance.coordinates } : {}) };
          result.mapping.push({ sourceField: hasSamples ? 'executionData.logicalHeight.samples' : 'executionData.logicalHeight.evaluator', fdgField: 'inspection.logicalHeightResolution', value: 40000, status: samplingProvenance ? 'engine-derived-logical-grid' : 'source-samples' });
        }
      }
    }
  }
  const sourceImageLayers = execution?.imageLayers;
  const authoredImages = sourceImageLayers === undefined || sourceImageLayers === null;
  const inputImageLayers = authoredImages ? authored?.imageLayers : sourceImageLayers;
  if (inputImageLayers === undefined || inputImageLayers === null) pending('engineAuthored.imageLayers', 'Explicit engine-authored source asset crop/world placement/opacity/layer/depthY/authoredBy is required; native crop/anchor remains UNKNOWN.', 'ENGINE_AUTHORING');
  else if (check(Array.isArray(inputImageLayers) && inputImageLayers.length >= 1 && inputImageLayers.length <= 128,
    authoredImages ? 'engineAuthored.imageLayers' : 'executionData.imageLayers', 'at least1 and at most128 explicit image layers required') && authoredImages) {
    const approvedSourceAssets = new Set(sourceAssets.items.filter(value => value.exists).map(value => value.canonicalAbsolutePath));
    const rect = value => Array.isArray(value) && value.length === 4 && value.every(number => typeof number === 'number' && Number.isFinite(number)) && value[0] >= 0 && value[1] >= 0 && value[2] > 0 && value[3] > 0;
    for (let i = 0; i < inputImageLayers.length; i++) {
      const layer = inputImageLayers[i];
      check(plain(layer) && approvedSourceAssets.has(layer.canonicalAbsolutePath) && text(layer.authoredBy)
        && rect(layer.sourceRect) && rect(layer.worldRect) && layer.worldRect[0] + layer.worldRect[2] <= 8192 && layer.worldRect[1] + layer.worldRect[3] <= 8192
        && typeof layer.opacity === 'number' && Number.isFinite(layer.opacity) && layer.opacity >= 0 && layer.opacity <= 1
        && ['ground', 'world', 'front'].includes(layer.layer) && typeof layer.depthY === 'number' && Number.isFinite(layer.depthY) && layer.depthY >= 0 && layer.depthY <= 8192,
      `engineAuthored.imageLayers[${i}]`, 'approved sourceAssets image only; explicit finite crop/worldRect/opacity/layer/depthY/authoredBy required; no groundMaterials fallback');
    }
    result.inspection.imageLayoutResolution = { role: 'engine-authored-layout', count: inputImageLayers.length, nativeCrop: 'UNKNOWN', nativeOrigin: 'UNKNOWN', nativeAnchor: 'UNKNOWN', sourcePhysicalLayoutClaim: false };
  }
  if (plain(authored?.resourceBindings)) {
    if (!Array.isArray(inputImageLayers) || !inputImageLayers.length || !Object.keys(authored.resourceBindings).length)
      pending('engineAuthored.resourceBindings', 'Source image layers and explicit approved same-origin bindings are required; connections are verified after source layers arrive.', 'ENGINE_AUTHORING');
    else for (const layer of inputImageLayers) if (plain(layer) && text(layer.canonicalAbsolutePath) && !text(authored.resourceBindings[layer.canonicalAbsolutePath]))
      pending(`engineAuthored.resourceBindings.${layer.canonicalAbsolutePath}`, 'Explicit same-origin binding for this original source layer is missing.', 'ENGINE_AUTHORING');
  }
  if (result.errors.length || result.pending.length) return finish();
  const contract = authored.executionContract;
  check(Array.isArray(execution.objectColliders), 'executionData.objectColliders', 'expanded real source colliders required; visual placement count is not collider count');
  if (execution.objectColliderCount !== undefined) check(integer(execution.objectColliderCount, 0, 512)
    && execution.objectColliders.length === execution.objectColliderCount, 'executionData.objectColliderCount', 'explicit confirmed collider count must match export');
  if (revisedColliders && execution.objectColliderCount === undefined) pending('executionData.objectColliderCount', 'Native revision identifies old count as VISUAL; confirmed real collider count/export is required.');
  check(Array.isArray(execution.boundaryColliders) && execution.boundaryColliders.length >= 1,
    'executionData.boundaryColliders', 'explicit altar/boundary collision required');
  const expandedPlacements = execution.placements ?? visualPlacementRecords;
  check(Array.isArray(expandedPlacements) && expandedPlacements.length === placements.count
    && expandedPlacements.every(value => plain(value) && Object.keys(value).length > 0), 'executionData.placements', 'expanded native VISUAL records/count required');
  check(plain(contract) && contract.id === SOURCE_SCENE_EXECUTION_CONTRACT && contract.version === 1 && contract.stage === 0
    && contract.sourceSymbol === native.symbol && contract.sourceVersion === native.version
    && contract.loadDraw === 'same-origin-source-image-layers' && text(contract.authoredBy),
  'engineAuthored.executionContract', 'explicit supported engine-owned fdg-source-scene-v1 execution object required');
  check(plain(authored.resourceBindings), 'engineAuthored.resourceBindings', 'approved canonical path→same-origin local src dictionary required');
  if (result.errors.length || result.pending.length) return finish();
  const available = new Set(resources.filter(value => value.exists).map(value => value.path)), imageLayers = [];
  for (let i = 0; i < inputImageLayers.length; i++) {
    const layer = inputImageLayers[i], field = `${authoredImages ? 'engineAuthored' : 'executionData'}.imageLayers[${i}]`;
    if (!check(plain(layer) && available.has(layer.canonicalAbsolutePath), field, 'canonical image must reference an existing source manifest asset')) continue;
    const src = authored.resourceBindings[layer.canonicalAbsolutePath];
    if (!text(src)) { pending(`engineAuthored.resourceBindings.${layer.canonicalAbsolutePath}`, 'Explicit same-origin binding for this original source layer is missing.', 'ENGINE_AUTHORING'); continue; }
    imageLayers.push({ ...layer, src, layer: layer.layer ?? 'world',
      depthY: layer.depthY ?? (Array.isArray(layer.worldRect) ? layer.worldRect[1] + layer.worldRect[3] : NaN),
      engineDrawDefaults: { layer: layer.layer === undefined, depthY: layer.depthY === undefined },
      ...(authoredImages ? { layoutRole: 'engine-authored-layout', nativeCrop: 'UNKNOWN', nativeOrigin: 'UNKNOWN', nativeAnchor: 'UNKNOWN', sourcePhysicalLayoutClaim: false } : {}) });
  }
  if (result.errors.length || result.pending.length) return finish();
  if (!plain(authored.heightMapping)) check(false, 'engineAuthored.heightMapping', 'explicit mapping object required');
  if (result.errors.length) return finish();
  const height = { logicalSamples, source: logical.source,
    interpolation: 'bilinear-cell-centers', heightMapping: authored.heightMapping,
    ...(samplingProvenance ? { samplingProvenance } : {}) };
  const startHeight = sampleSourceHeight({ height }, start.worldPx[0], start.worldPx[1], { validated: true }).height;
  const scene = {
    schemaVersion: 1, stage: 0, grid: { width: 200, height: 200, tileSize: 40 },
    nav: { tiles: [...tiles], scope: 'polygon-plus-source-colliders' },
    height,
    colliders: [...execution.objectColliders.map(value => ({ ...value, sourceRole: 'object' })), ...execution.boundaryColliders.map(value => ({ ...value, sourceRole: 'boundary' }))],
    imageLayers, actor: { position: [start.worldPx[0], start.worldPx[1], startHeight], startAuthority: authority,
      sourceStart: { rawTile: [...start.rawTile], centerTile: [...start.centerTile], worldPx: [...start.worldPx] } },
    camera: authored.camera, settings: authored.settings,
    provenance: { nativeContract: native, sourceUnits: s.units, engineAuthored: authored, executionContract: contract, sourcePlacements: expandedPlacements,
      startAuthorityRole: designStart ? 'engine-authored-design-start' : 'source-runtime-authority', nativeStartRuntimeSymbol: designStart ? 'UNKNOWN' : authority.symbol,
      ...(authoredImages ? { imageLayoutRole: 'engine-authored-layout', nativeImageCrop: 'UNKNOWN', nativeImageOrigin: 'UNKNOWN', nativeImageAnchor: 'UNKNOWN', sourcePhysicalLayoutClaim: false } : {}) },
  };
  const validation = validateSourceScene(scene);
  result.errors.push(...validation.errors);
  if (result.errors.length) return finish();
  const groups = result.inspection.previewResources;
  const candidate = { schemaVersion: 1, id: 'fdg-source-stage0', name: 'CH1-1 원본 장면 후보',
    map: { width: 200, height: 200, tileSize: 40, tiles: [...tiles], start: { x: start.rawTile[0], y: start.rawTile[1] },
      exit: { x: g.bossCx, y: g.exitY }, objects: [] },
    characters: groups.characters, skills: groups.skills, vfx: groups.vfx, preview: groups.preview, sourceScene: scene,
    provenance: { sourceSnapshot: s, manifestSnapshot: m, engineAuthored: authored,
      ...(result.inspection.sourceRevisionSnapshot ? { sourceRevisionSnapshot: result.inspection.sourceRevisionSnapshot, manifestRevisionSnapshot: result.inspection.manifestRevisionSnapshot } : {}),
      candidateOnly: true, productionRegistered: false },
  };
  result.errors.push(...validateMapSourceOutput(candidate, null).errors);
  if (result.errors.length) return finish();
  result.candidateProject = candidate; result.ok = true;
  result.mapping.push({ sourceField: 'executionData + engineAuthored', fdgField: 'candidateProject.sourceScene', value: 'candidate validation only; decode/install owner gate pending', status: 'candidate-only' });
  return finish();
}

/** Explicit UNADOPTED preview only; physical source gate remains separately pending. */
export function createMapSourcePreview(inspection, { previewProject, observations, engineAuthored, groundObservations } = {}) {
  const result = { ok: false, errors: [], pending: [], candidateProject: null, sourcePreview: null, project: null, world: null, adoption: 'UNADOPTED' };
  const built = buildSourcePreview(inspection, observations, engineAuthored);
  result.errors.push(...built.errors); result.pending.push(...built.pending);
  if (!built.ok) return result;
  if (!plain(previewProject)) { result.pending.push({ field: 'previewProject', reason: 'Existing approved character/skill/VFX/preview resource groups required.', classification: 'ENGINE_AUTHORING' }); return result; }
  const selected = {};
  for (const key of ['characters', 'skills', 'vfx', 'preview']) {
    const descriptor = Object.getOwnPropertyDescriptor(previewProject, key);
    if (!descriptor || !Object.hasOwn(descriptor, 'value')) result.errors.push(`previewProject.${key}: resource data property required`);
    else selected[key] = descriptor.value;
  }
  if (result.errors.length) return result;
  const resources = inspectMapSourceJSON(selected, { label: 'previewResources', maxBytes: MAP_SOURCE_LIMITS.projectBytes });
  result.errors.push(...resources.errors); if (!resources.ok) return result;
  let scene = built.sourcePreview;
  if (Object.hasOwn(engineAuthored, 'groundLayout')) {
    const grounded = attachSourcePreviewGround(scene, { groundLayout: engineAuthored.groundLayout, resourceBindings: engineAuthored.resourceBindings,
      ...(groundObservations === undefined ? {} : { groundObservations }) });
    result.errors.push(...grounded.errors); result.pending.push(...grounded.pending);
    if (!grounded.ok) return result;
    scene = grounded.sourcePreview;
  }
  const g = inspection.gateExit;
  if (!plain(g) || g.bossCx !== 100 || g.exitY !== 7) { result.errors.push('inspection.gateExit: original stage0 exit metadata required'); return result; }
  const candidate = { schemaVersion: 1, id: 'fdg-stage0-unadopted-preview', name: 'CH1-1 제작 미리보기 · UNADOPTED',
    map: { width: 200, height: 200, tileSize: 40, tiles: [...scene.nav.tiles], start: { x: scene.actor.sourceStart.rawTile[0], y: scene.actor.sourceStart.rawTile[1] },
      exit: { x: g.bossCx, y: g.exitY }, objects: [] },
    ...resources.value, sourcePreview: scene,
    provenance: { role: 'engine-authored-preview-layout', productionRegistered: false, adoption: 'UNADOPTED',
      physicalSourceStatus: { collision: 'SOURCE_PENDING', cliff: 'SOURCE_PENDING', logicalHeight: 'SOURCE_PENDING' } } };
  result.errors.push(...validateMapSourceOutput(candidate, null).errors);
  if (result.errors.length) return result;
  result.ok = true; result.candidateProject = candidate; result.sourcePreview = scene;
  return result;
}

/** Connect an exact producer subset to an existing independent preview; no native full scene/World install. */
export function attachMapSourcePreviewCollision(previewProject, options) {
  const result = { ok:false,errors:[],pending:[],candidateProject:null,sourcePreview:null,project:null,world:null,adoption:'UNADOPTED' };
  const inspected = inspectMapSourceJSON(previewProject,{label:'previewProject',maxBytes:MAP_SOURCE_LIMITS.projectBytes});
  result.errors.push(...inspected.errors);if(!inspected.ok)return result;
  const validation=validateProject(inspected.value);result.errors.push(...validation.errors);if(!validation.ok)return result;
  if(!inspected.value.sourcePreview){result.errors.push('previewProject.sourcePreview: existing original preview required');return result;}
  const attached=attachSourcePreviewCollision(inspected.value.sourcePreview,options);
  result.errors.push(...attached.errors);result.pending.push(...attached.pending);if(!attached.ok)return result;
  const candidate=inspected.value;candidate.sourcePreview=attached.sourcePreview;
  result.errors.push(...validateMapSourceOutput(candidate,null).errors);if(result.errors.length)return result;
  result.ok=true;result.candidateProject=candidate;result.sourcePreview=candidate.sourcePreview;return result;
}

/** Native isW dimensions are radii, separate from the preview's full-foot/contact policy. */
export const MAP_HAND_COLLIDER_BINDING = Object.freeze({ version:1,kind:'native-isW-radii',
  source:'game.html _rebuildColObjs/isW',tileSizePx:40,
  worldCenter:'onFloor effectiveWorldIfOnFloor=(rawTile+.5)*40',
  dimensions:'colSz=radius; colW/colH=radii; source row dimensions already include scale; no divide by2',
  ellipseOffset:'centerY=effectiveWorldY+colOy; colOy is not scaled by native isW',
  rotation:'handProps 회전 입력 없음(0); native isW ellipse ignores object rotation',
  nativePointPolicy:'strict < point query',previewFootPolicy:'full circle, contact EPS1e-7, swept spacing<=min(10,radius)' });

/** Normalize explicit on-floor hand circle/ellipse rows; preserve the complete raw producer envelope. */
export function normalizeMapSourceHandColliders(input) {
  const result={ok:false,errors:[],pending:[],sourceExecutionData:null};
  const inspected=inspectMapSourceJSON(input,{label:'nativeHandColliders',maxBytes:LIMITS.fileBytes});
  if(!inspected.ok){result.errors.push(...inspected.errors);return result;}
  const native=inspected.value,data=native?.executionData;
  const wait=(field,reason,classification='SOURCE_INPUT')=>result.pending.push({field,reason,classification});
  if(!plain(native)||!text(native.completionId)||!text(native.control)||!plain(data)
    ||!Array.isArray(data.objectColliders)||!integer(data.objectColliderCount,0,512)||data.objectColliderCount!==data.objectColliders.length){
    wait('executionData.objectColliders','Explicit native hand collider array/count required; unknown is not zero.');return result;
  }
  if(native.transform?.rotation!=='handProps 회전 입력 없음(0)'
    ||native.transform?.worldFormula!=='x=(_nearFloor(H.x,H.y).x+.5)*T, y=(..y+.5)*T; T=40; +.5=YES(center)'
    ||data.units!=='rawTile=tile index; effectiveWorld=px; colW/colH/colSz=px(scale 적용); colOy=px offset'){
    wait('transform','Exact native hand transform, world-px scaled dimensions and no rotation binding required.');return result;
  }
  const colliders=[];
  for(const [index,row] of data.objectColliders.entries()){
    const field=`executionData.objectColliders[${index}]`;
    if(!plain(row)||!text(row.type)||!pair(row.rawTile,v=>integer(v,0,199))||!Number.isFinite(row.scale)||row.scale<=0){
      result.errors.push(`${field}: explicit native type/tile/positive scale required`);continue;
    }
    if(row.onFloor!==true||!pair(row.effectiveWorldIfOnFloor,v=>Number.isFinite(v)&&v>=0&&v<=8000)){
      wait(field,'Off-floor effective position needs exact _nearFloor expansion; no snap guess.');continue;
    }
    const center=row.effectiveWorldIfOnFloor;
    if(center.some((value,axis)=>value!==(row.rawTile[axis]+.5)*40)){
      result.errors.push(`${field}: explicit on-floor world must match tile-center transform`);continue;
    }
    const primitive={id:`native-hand-${index}-${row.type}`,center:[...center],nativeRowIndex:index,nativeType:row.type,
      nativeRawTile:[...row.rawTile],nativeScale:row.scale};
    if(row.shape==='circle'&&Number.isFinite(row.colSz)&&row.colSz>0){primitive.kind='circle';primitive.radius=row.colSz;}
    else if(row.shape==='ellipse'&&[row.colW,row.colH,row.colOy].every(Number.isFinite)&&row.colW>0&&row.colH>0){
      primitive.kind='ellipse';primitive.radii=[row.colW,row.colH];primitive.center[1]+=row.colOy;primitive.yaw=0;
    }else{wait(field,'Raw colParts or unexpanded/unsupported shape needs exact canonical primitives.','ENGINE_IMPLEMENTATION');continue;}
    colliders.push(primitive);
  }
  if(result.errors.length||result.pending.length)return result;
  const canonical=validateSourceColliders(colliders,{jsonValidated:true});result.errors.push(...canonical.errors);
  if(!canonical.ok)return result;
  result.sourceExecutionData={completionId:native.completionId,control:native.control,
    kind:'engine-normalized-native-hand-colliders',nativeExecutionSnapshot:native,normalizationBinding:{...MAP_HAND_COLLIDER_BINDING},
    executionData:{objectColliderCount:data.objectColliderCount,objectColliders:colliders}};
  result.ok=true;return result;
}

/** Apply the explicit v7 two-type resolution to an embedded normalized v6 subset only. */
export function applyMapSourceHandColliderDelta(previewProject, options = {}) {
  const result = { ok:false,errors:[],pending:[],candidateProject:null,sourcePreview:null,
    project:null,world:null,adoption:'UNADOPTED',inspection:null };
  const fail = reason => { result.errors.push(`native hand delta v7: ${reason}`); return result; };
  const project = inspectMapSourceJSON(previewProject,{label:'previewProject',maxBytes:MAP_SOURCE_LIMITS.projectBytes});
  result.errors.push(...project.errors); if(!project.ok)return result;
  const validProject = validateProject(project.value); result.errors.push(...validProject.errors); if(!validProject.ok)return result;
  const authored = inspectMapSourceJSON(options,{label:'nativeHandDelta.options'});
  result.errors.push(...authored.errors);if(!authored.ok)return result;
  if(!plain(authored.value))return fail('explicit delta/scope options required');
  const delta = inspectMapSourceJSON(authored.value.delta,{label:'nativeHandDelta',maxBytes:MAP_SOURCE_LIMITS.projectBytes});
  const scope = inspectMapSourceJSON(authored.value.scope,{label:'nativeHandDelta.scope',maxBytes:MAP_SOURCE_LIMITS.projectBytes});
  result.errors.push(...delta.errors,...scope.errors); if(!delta.ok||!scope.ok)return result;
  const scene=project.value.sourcePreview, collision=scene?.collisionPreview;
  const base=collision?.sourceExecutionSnapshot, native=base?.nativeExecutionSnapshot;
  if(!collision||!plain(base)||!plain(native)||base.kind!=='engine-normalized-native-hand-colliders'
    ||base.executionData?.objectColliderCount!==13||collision.colliders?.length!==13
    ||native.executionData?.objectColliderCount!==13
    ||!Object.entries(MAP_HAND_COLLIDER_BINDING).every(([key,value])=>base.normalizationBinding?.[key]===value))
    return fail('existing embedded normalized v6 subset13 and exact native radius binding required; replay is rejected');
  const oldBreakdown={circle:0,ellipse:0};
  for(const collider of collision.colliders)oldBreakdown[collider.kind]=(oldBreakdown[collider.kind]??0)+1;
  if(oldBreakdown.circle!==11||oldBreakdown.ellipse!==2||Object.keys(oldBreakdown).length!==2)
    return fail('v7 requires existing11 circle/2 ellipse; unrelated primitives are not rewritten');
  const d=delta.value, corpse=d?.resolution?.corpse, pit=d?.resolution?.pit_poison, added=d?.oldNew?.addedCollider;
  if(!plain(d)||!text(d.completionId)||!text(d.control)||d.completionId!==base.completionId
    ||!text(d.baseRef?.v6)||!text(d.kind)||!text(d.partialStatus)||!text(d.finalHandSubset?.scope))
    return fail('matching producer completionId/control, explicit baseRef.v6 and PARTIAL provenance required');
  if(!plain(corpse)||corpse.finalMeta?.sz!==40||corpse.col!==0||corpse.collision!==false||corpse.noCol!==false
    ||corpse.placements!==2||!text(corpse.source)||!text(corpse.physics)
    ||!Array.isArray(corpse.placementTiles)||corpse.placementTiles.length!==2
    ||!corpse.placementTiles.every(tile=>pair(tile,v=>integer(v,0,199))))
    return fail('explicit corpse2 noncollision resolution required; no corpse collider is synthesized');
  if(!plain(pit)||pit.finalMeta?.sz!==200||pit.finalMeta?.collision!==true||pit.col!==0||pit.collision!==true
    ||pit.finalMeta?.colW!==80||pit.finalMeta?.colH!==58||pit.finalMeta?.colOy!==7
    ||pit.noCol!==false||pit.colParts!==false||pit.colW!==80||pit.colH!==58||pit.colOy!==7||pit.colSz!==null
    ||pit.placements!==1||pit.shape!=='ellipse'||pit.onFloor!==true||!text(pit.source)||!text(pit.physics)
    ||pit.colliderDim?.colW!==80||pit.colliderDim?.colH!==58||pit.colliderDim?.colOy!==7
    ||pit.colliderDim?.unit!=='px radii; colOy px offset'||!text(pit.colliderDim?.formula)
    ||!pair(pit.rawTile,v=>integer(v,0,199))||!pair(pit.effectiveWorld,v=>Number.isFinite(v)&&v>=0&&v<=8000))
    return fail('explicit MAP-021 pit_poison ellipse/world-px radii80x58/offset7 resolution required; unsupported schemas have no fallback');
  if(!plain(added)||added.type!=='pit_poison'||added.shape!=='ellipse'
    ||added.colW!==pit.colliderDim.colW||added.colH!==pit.colliderDim.colH||added.colOy!==pit.colliderDim.colOy
    ||added.onFloor!==true||!pair(added.rawTile,v=>integer(v,0,199))||!pair(added.effectiveWorld,Number.isFinite)
    ||added.rawTile.some((value,axis)=>value!==pit.rawTile[axis])
    ||added.effectiveWorld.some((value,axis)=>value!==pit.effectiveWorld[axis]||(added.rawTile[axis]+.5)*40!==value)
    ||added.effectiveWorld[0]!==6500||added.effectiveWorld[1]!==5580)
    return fail('addedCollider must match explicit on-floor tile-center[162,139]/world[6500,5580]/ellipse80x58/offset7');
  const final=d.finalHandSubset;
  if(final.objectColliderCount!==14||final.breakdown?.circle!==11||final.breakdown?.ellipse!==3
    ||final.breakdown?.rotatedParts!==0||!final.scope.includes('PARTIAL'))
    return fail('explicit final hand14/11 circle/3 ellipse/0 rotatedParts/PARTIAL required; full count stays unknown');
  const primitive={id:'native-hand-13-pit_poison',kind:'ellipse',center:[added.effectiveWorld[0],added.effectiveWorld[1]+added.colOy],
    radii:[added.colW,added.colH],yaw:0,
    nativeType:added.type,nativeRawTile:[...added.rawTile],nativeDeltaControl:d.control,
    source:pit.source,normalizationRole:'explicit-native-v7-added-ellipse'};
  if(collision.colliders.some(collider=>collider.nativeType==='pit_poison'||collider.id===primitive.id))
    return fail('duplicate pit_poison or repeated delta is rejected');
  const envelope={...base,control:d.control,kind:'engine-normalized-native-hand-collider-delta-v7',
    baseSourceExecutionSnapshot:base,nativeDeltaSnapshot:d,
    nativeDeltaBinding:{version:1,kind:'native-hand-meta-two-types-v7',tileSizePx:40,
      baseResolution:'existing embedded v6 snapshot; baseRef fetch0',addedDimensions:'explicit colW/colH=world-px radii; colOy=world-px y offset; scale multiply0/divide2=0',
      excludedTypes:[{type:'corpse',placements:2,reason:'explicit source noncollision'}],
      fullObjectColliderCount:null,coverage:'PARTIAL',sourcePhysicalZClaim:false},
    executionData:{...base.executionData,objectColliderCount:14,objectColliders:[...collision.colliders,primitive]}};
  const attached=attachMapSourcePreviewCollision(project.value,{sourceExecutionData:envelope,scope:scope.value});
  result.errors.push(...attached.errors);result.pending.push(...attached.pending);if(!attached.ok)return result;
  Object.assign(result,{ok:true,candidateProject:attached.candidateProject,sourcePreview:attached.sourcePreview,
    inspection:{oldSubsetCount:13,supportedSourceObjectColliderCount:14,circleCount:11,ellipseCount:3,
      addedCollider:{id:primitive.id,type:primitive.nativeType,center:[...primitive.center],radii:[...primitive.radii],yaw:primitive.yaw,units:'world-px'},
      excludedTypes:[{type:'corpse',placements:2,collision:false}],coverage:'PARTIAL',fullObjectColliderCount:null,
      sourcePhysicalZClaim:false,actorPosition:[...scene.actor.position],scope:scope.value}});
  return result;
}
