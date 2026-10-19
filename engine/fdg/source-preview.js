import { createSourcePreviewHeight, validateSourcePreviewHeight, evaluateSourcePreviewHeight, sourcePreviewCliffBlocks } from './source-preview-height.js?v=0.14.0';
import { createSourcePreviewAppearance, validateSourcePreviewAppearance } from './source-preview-appearance.js?v=0.17.1';
import { createSourcePreviewCollision, validateSourcePreviewCollision, querySourcePreviewCollision } from './source-preview-collision.js?v=0.16.0';

/** UNADOPTED preview with optional source object subset; complete assembly and native physical Z remain pending. */
export const SOURCE_PREVIEW_LIMITS = Object.freeze({ schemaVersion: 1, stage: 0, width: 200, height: 200,
  tileSize: 40, worldSize: 8000, placements: 85, sourceAssets: 9, intrinsicSize: 32768,
  pictureCoordinate: 131072, pictureSize: 131072, fileBytes: 4194304, maxDepth: 64, maxVisits: 1000000, maxSweepSteps: 16384 });
const RESERVED = new Set(['__proto__', 'prototype', 'constructor']);
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value)
  && [Object.prototype, null].includes(Object.getPrototypeOf(value));
const finite = value => typeof value === 'number' && Number.isFinite(value);
const text = value => typeof value === 'string' && value.trim().length > 0;
const pair = value => Array.isArray(value) && value.length === 2 && value.every(finite);
const local = value => text(value) && value.length <= 512 && !value.startsWith('/') && !/[\\:%?#\x00-\x1f\x7f]/.test(value)
  && value.split('/').every(part => part !== '' && part !== '.' && part !== '..') && /\.(png|jpg|jpeg|webp)$/i.test(value);
const absolute = value => text(value) && value.startsWith('/') && !/[\\\x00-\x1f\x7f]/.test(value)
  && value.split('/').slice(1).every(part => part !== '' && part !== '.' && part !== '..');
const same = (a, b) => finite(a) && finite(b) && Math.abs(a - b) <= 1e-7;
const clone = value => JSON.parse(JSON.stringify(value));
const strictSourceURL = asset => `fdg-source/ch1-1/${asset.relative.split('/').at(-1)}`;
const assetValid = value => plain(value) && text(value.relative) && !value.relative.startsWith('/') && !/[\\\x00-\x1f\x7f]/.test(value.relative)
  && value.relative.split('/').every(part => part !== '' && part !== '.' && part !== '..') && /\.png$/i.test(value.relative)
  && absolute(value.canonicalAbsolutePath) && value.canonicalAbsolutePath.endsWith(`/${value.relative}`) && value.exists === true;
const sameJSON = (a, b) => {
  if (a === b) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a) !== Array.isArray(b)) return false;
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every(key => Object.hasOwn(b, key) && sameJSON(a[key], b[key]));
};
function freezeJSON(value) {
  if (value && typeof value === 'object') { for (const child of Object.values(value)) freezeJSON(child); Object.freeze(value); }
  return value;
}

function safeJSON(value) {
  const fail = reason => ({ ok: false, errors: [`sourcePreview JSON: ${reason}`] });
  try {
    const stack = [{ value, depth: 0 }], ancestors = new Set(); let visits = 0;
    while (stack.length) {
      const item = stack.pop(), current = item.value;
      if (item.leave) { ancestors.delete(current); continue; }
      if (++visits > SOURCE_PREVIEW_LIMITS.maxVisits || item.depth > SOURCE_PREVIEW_LIMITS.maxDepth) return fail('depth64/visits1000000 exceeded');
      if (current === null || typeof current === 'string' || typeof current === 'boolean' || finite(current)) continue;
      if (typeof current !== 'object' || (!Array.isArray(current) && !plain(current))) return fail('finite plain JSON required');
      if (ancestors.has(current) || Object.getOwnPropertySymbols(current).length) return fail('cycle/symbol rejected');
      if (Array.isArray(current) && current.length > SOURCE_PREVIEW_LIMITS.maxVisits - visits) return fail('visits1000000 exceeded');
      const descriptors = Object.getOwnPropertyDescriptors(current), keys = Object.keys(descriptors);
      if (keys.length - (Array.isArray(current) ? 1 : 0) > SOURCE_PREVIEW_LIMITS.maxVisits - visits) return fail('visits1000000 exceeded');
      ancestors.add(current); stack.push({ value: current, leave: true }); let entries = 0;
      for (const key of keys) {
        if (Array.isArray(current) && key === 'length') continue;
        const descriptor = descriptors[key];
        if (RESERVED.has(key) || !Object.hasOwn(descriptor, 'value') || !descriptor.enumerable) return fail('reserved/accessor/non-enumerable rejected');
        if (Array.isArray(current)) {
          const index = Number(key);
          if (String(index) !== key || !Number.isSafeInteger(index) || index < 0 || index >= current.length) return fail('dense array indices required');
          entries++;
        }
        stack.push({ value: descriptor.value, depth: item.depth + 1 });
      }
      if (Array.isArray(current) && entries !== current.length) return fail('sparse array rejected');
    }
    if (new TextEncoder().encode(JSON.stringify(value)).byteLength > SOURCE_PREVIEW_LIMITS.fileBytes) return fail('compact UTF-8 exceeds4194304bytes');
    return { ok: true, errors: [] };
  } catch { return fail('inspection/serialization failed'); }
}

const designAuthority = authority => plain(authority) && authority.kind === 'design-start' && authority.stage === 0 && authority.tileSizePx === 40
  && pair(authority.centerTile) && authority.centerTile[0] === 100.5 && authority.centerTile[1] === 185.5
  && pair(authority.worldPx) && authority.worldPx[0] === 4020 && authority.worldPx[1] === 7420
  && authority.source === 'CH1_WORLD_MAP_ORDER / 맵구성_1장.md:3' && authority.approvedBy === 'ROOT' && authority.runtimeSymbol === 'UNKNOWN';
const layoutValid = layout => plain(layout) && layout.anchorConvention === 'bottom-center' && layout.pixelsPerSourcePixel === 1 && text(layout.authoredBy);
const observationValid = value => plain(value) && absolute(value.canonicalAbsolutePath) && local(value.src)
  && Number.isSafeInteger(value.intrinsicWidth) && value.intrinsicWidth >= 1 && value.intrinsicWidth <= SOURCE_PREVIEW_LIMITS.intrinsicSize
  && Number.isSafeInteger(value.intrinsicHeight) && value.intrinsicHeight >= 1 && value.intrinsicHeight <= SOURCE_PREVIEW_LIMITS.intrinsicSize;

export const SOURCE_PREVIEW_GROUND_URL = 'fdg-source/ch1-1/ground/ground_dark_soil.png';
const SOIL_CANONICAL = '/Users/fordeargamers/Projects/exoduser-migration-20261001/assets/map/ch1/ground_dark_soil.png';
const UNUSED_GROUND_KEYS = ['mask', 'litter', 'commonSkin'];
const groundLayoutValid = value => plain(value) && value.kind === 'engine-authored-repeat' && value.materialKey === 'soil'
  && pair(value.origin) && value.origin[0] === 0 && value.origin[1] === 0
  && pair(value.tileWorldSize) && value.tileWorldSize[0] === 1024 && value.tileWorldSize[1] === 1024
  && value.opacity === 1 && text(value.authoredBy) && value.clipConvention === 'source-tile-corners';
const groundBoundaryValid = value => plain(value) && value.units === 'tile index' && value.points === 53
  && Array.isArray(value.data) && value.data.length === 53 && value.data.every(point => pair(point)
    && point.every(coordinate => Number.isSafeInteger(coordinate) && coordinate >= 0 && coordinate <= 200));
function groundReferences(provenance) {
  const items = provenance?.manifestSnapshot?.groundMaterials?.items;
  if (!Array.isArray(items)) return null;
  const refs = new Map();
  for (const key of ['soil', ...UNUSED_GROUND_KEYS]) {
    const matches = items.filter(item => plain(item) && item.key === key);
    if (matches.length !== 1 || matches[0].exists !== true || !absolute(matches[0].canonicalAbsolutePath)) return null;
    refs.set(key, matches[0]);
  }
  const soil = refs.get('soil');
  if (soil.file !== 'ground_dark_soil.png' || soil.canonicalAbsolutePath !== SOIL_CANONICAL
    || !plain(soil.values) || soil.values.file !== 'ground_dark_soil.png' || soil.values.brightness !== 0.85 || soil.values.saturation !== 0.48) return null;
  return refs;
}
function unusedGroundMaterials(refs) {
  return UNUSED_GROUND_KEYS.map(key => ({ key, canonicalAbsolutePath: refs.get(key).canonicalAbsolutePath, used: false,
    status: 'PENDING', reason: key === 'mask' ? 'SVG/mask composition is not consumed.' : 'Material placement/composition is not consumed.' }));
}
function validatePreviewGround(scene, check) {
  const p = scene.provenance;
  const present = Object.hasOwn(scene, 'groundLayers') || Object.hasOwn(scene, 'groundClip')
    || ['groundEngineAuthoredInputSnapshot', 'groundImageObservations', 'generatedGroundLayers', 'groundRuntimeStatus', 'unusedGroundMaterials', 'groundNativeUV']
      .some(key => Object.hasOwn(p, key));
  if (!present) return;
  const refs = groundReferences(p), input = p.groundEngineAuthoredInputSnapshot, observed = p.groundImageObservations;
  check(refs !== null, 'ground must consume the exact approved soil and preserve other3 material refs');
  check(plain(input) && groundLayoutValid(input.groundLayout) && plain(input.resourceBindings)
    && input.resourceBindings[SOIL_CANONICAL] === SOURCE_PREVIEW_GROUND_URL, 'explicit soil groundLayout/exact original binding required');
  check(p.groundNativeUV === 'UNKNOWN' && p.groundImageObservationRole === 'runtime-decoded-intrinsic', 'native ground UV UNKNOWN/runtime observation role required');
  const ready = p.groundRuntimeStatus === 'READY';
  check(ready || p.groundRuntimeStatus === 'RUNTIME_PENDING', 'ground runtime READY or RUNTIME_PENDING required');
  const obsValid = check(Array.isArray(observed) && observed.length === (ready ? 1 : 0)
    && observed.every(value => observationValid(value) && value.canonicalAbsolutePath === SOIL_CANONICAL && value.src === SOURCE_PREVIEW_GROUND_URL),
  'ground readiness must correspond to exactly1 intrinsic observation, or none while pending');
  check(groundBoundaryValid(p.sourceSnapshot?.boundaryPolygon) && plain(scene.groundClip)
    && scene.groundClip.convention === 'source-tile-corners' && scene.groundClip.tileSize === 40
    && sameJSON(scene.groundClip.polygon, p.sourceSnapshot?.boundaryPolygon?.data), 'ground clip must preserve exact source53 tile-index corners/T40');
  check(refs && sameJSON(p.unusedGroundMaterials, unusedGroundMaterials(refs)), 'mask/litter/commonSkin remain separately unused/PENDING');
  if (check(Array.isArray(scene.groundLayers) && scene.groundLayers.length === 1 && plain(scene.groundLayers[0]), 'exact1 optional soil repeat layer required')) {
    const layer = scene.groundLayers[0], layout = input?.groundLayout;
    check(layer.id === 'native-soil-repeat' && layer.materialKey === 'soil' && layer.canonicalAbsolutePath === SOIL_CANONICAL
      && layer.src === SOURCE_PREVIEW_GROUND_URL && layer.render === 'repeat' && layer.layer === 'ground'
      && layer.sourceRectMode === 'decoded-full' && sameJSON(layer.origin, layout?.origin) && sameJSON(layer.tileWorldSize, layout?.tileWorldSize)
      && layer.opacity === 1 && layer.brightness === 0.85 && layer.saturation === 0.48 && layer.clipConvention === 'source-tile-corners'
      && layer.role === 'engine-authored-ground-repeat' && layer.nativeUV === 'UNKNOWN' && layer.authoredBy === layout?.authoredBy,
    'exact native soil colors and explicit engine-authored repeat recipe required');
    if (ready && obsValid) check(sameJSON(layer.sourceRect, [0, 0, observed[0].intrinsicWidth, observed[0].intrinsicHeight]), 'READY ground full crop must equal decoded intrinsic size');
    else check(!Object.hasOwn(layer, 'sourceRect'), 'pending ground dimensions/crop must not be invented');
    check(sameJSON(p.generatedGroundLayers, scene.groundLayers), 'generated ground records must be preserved separately for save/review');
  }
}

/** Schema validation includes authoring/observation provenance, never physical adoption. */
export function validateSourcePreview(scene) {
  const safe = safeJSON(scene); if (!safe.ok) return safe;
  const errors = [], check = (condition, reason) => { if (!condition) errors.push(`sourcePreview: ${reason}`); return condition; };
  if (!check(plain(scene), 'object required')) return { ok: false, errors };
  check(scene.schemaVersion === 1 && scene.stage === 0 && scene.mode === 'UNADOPTED_VISUAL_PREVIEW', 'schema1/stage0/UNADOPTED_VISUAL_PREVIEW required');
  check(plain(scene.grid) && scene.grid.width === 200 && scene.grid.height === 200 && scene.grid.tileSize === 40, '200×200/T40 grid required');
  const navValid = check(plain(scene.nav) && scene.nav.scope === 'polygon-only' && Array.isArray(scene.nav.tiles) && scene.nav.tiles.length === 40000
    && scene.nav.tiles.every(tile => tile === 0 || tile === 1), 'unchanged polygon-only nav40000×0/1 required');
  check(!Object.hasOwn(scene, 'height') && !Object.hasOwn(scene, 'colliders'), 'physical height/collider implementation cannot be inserted into an UNADOPTED preview');
  const hasHeight = Object.hasOwn(scene, 'heightPreview'), hasCollision = Object.hasOwn(scene, 'collisionPreview');
  check(plain(scene.status) && scene.status.adoption === 'UNADOPTED'
    && scene.status.collision === (hasCollision ? 'SOURCE_SUBSET_CONSUMED' : 'SOURCE_PENDING')
    && scene.status.cliff === (hasHeight ? 'SOURCE_CONSUMED' : 'SOURCE_PENDING')
    && scene.status.logicalHeight === (hasHeight ? 'SOURCE_CONSUMED' : 'SOURCE_PENDING'), 'UNADOPTED/object collision pending or explicit subset, optional exact logical/cliff SOURCE_CONSUMED required');
  const p = scene.provenance;
  if (!check(plain(p), 'provenance required')) return { ok: false, errors };
  check(p.productionAdopted === false && p.visualPlacementCount === 85 && p.approvedSourceAssetCount === 9 && p.actualObjectColliderCount === null
    && p.nativeRuntimeStartSymbol === 'UNKNOWN' && p.nativeCrop === 'UNKNOWN' && p.nativeOrigin === 'UNKNOWN' && p.nativeAnchor === 'UNKNOWN'
    && p.sourcePhysicalLayoutClaim === false, '85 VISUAL/9 assets/native UNKNOWN/physical unadopted provenance required');
  check(plain(p.sourceSnapshot) && plain(p.manifestSnapshot) && p.imageObservationRole === 'runtime-decoded-intrinsic'
    && Array.isArray(p.nativeVisualPlacements) && p.nativeVisualPlacements.length === 85, 'original source/manifest/native85 and runtime observation provenance required');
  check(plain(p.engineAuthoredInputSnapshot) && layoutValid(p.engineAuthoredInputSnapshot.previewLayout) && designAuthority(p.engineAuthoredInputSnapshot.startAuthority), 'explicit approved ROOT start/layout input snapshot required');
  const approved = p.approvedSourceAssets, observations = p.imageObservations;
  const approvedValid = check(Array.isArray(approved) && approved.length === 9
    && approved.every(assetValid)
    && new Set(approved.map(value => value.canonicalAbsolutePath)).size === 9 && new Set(approved.map(value => value.relative)).size === 9,
  'exact9 approved original assets required');
  const observationsValid = check(Array.isArray(observations) && observations.length === 9 && observations.every(observationValid)
    && new Set(observations.map(value => value.canonicalAbsolutePath)).size === 9 && new Set(observations.map(value => value.src)).size === 9,
  'exact9 unique runtime intrinsic observations required');
  const observationMap = new Map(), assetMap = new Map();
  if (approvedValid) for (const value of approved) assetMap.set(value.canonicalAbsolutePath, value);
  if (observationsValid) for (const value of observations) {
    check(assetMap.has(value.canonicalAbsolutePath) && value.src === strictSourceURL(assetMap.get(value.canonicalAbsolutePath))
      && p.engineAuthoredInputSnapshot?.resourceBindings?.[value.canonicalAbsolutePath] === value.src,
      'observation canonical/src must match approved source and explicit binding'); observationMap.set(value.canonicalAbsolutePath, value);
  }
  const layers = scene.imageLayers;
  if (check(Array.isArray(layers) && layers.length === 85, 'all85 source VISUAL image layers required')) {
    const ids = new Set(), used = new Set();
    for (const [index, layer] of layers.entries()) {
      if (!check(plain(layer), 'image layer object required')) continue;
      const native = layer.native, observed = observationMap.get(layer.canonicalAbsolutePath), asset = assetMap.get(layer.canonicalAbsolutePath);
      check(sameJSON(native, p.nativeVisualPlacements?.[index]), 'native85 records must match their immutable source snapshot');
      check(text(layer.id) && layer.id.length <= 120 && !RESERVED.has(layer.id) && !ids.has(layer.id), 'unique layer id1..120 required'); ids.add(layer.id); used.add(layer.canonicalAbsolutePath);
      if (!check(observed && asset && layer.src === observed.src && plain(native) && native.file === asset.relative
        && finite(native.x) && finite(native.y) && finite(native.scale) && native.scale > 0 && finite(native.opacity) && native.opacity >= 0 && native.opacity <= 1
        && finite(native.brightness) && native.brightness >= 0 && finite(native.saturation) && native.saturation >= 0, 'original native fields and approved observation required')) continue;
      const footX = (native.x + 0.5) * 40, footY = (native.y + 0.5) * 40, width = observed.intrinsicWidth * native.scale, height = observed.intrinsicHeight * native.scale;
      check(Array.isArray(layer.sourceRect) && layer.sourceRect.length === 4 && layer.sourceRect[0] === 0 && layer.sourceRect[1] === 0
        && layer.sourceRect[2] === observed.intrinsicWidth && layer.sourceRect[3] === observed.intrinsicHeight, 'explicit observed full-source crop required');
      check(Array.isArray(layer.worldRect) && layer.worldRect.length === 4 && layer.worldRect.every(finite)
        && layer.worldRect.every(value => Math.abs(value) <= 131072) && layer.worldRect[2] > 0 && layer.worldRect[3] > 0
        && Math.abs(layer.worldRect[0] + layer.worldRect[2]) <= 131072 && Math.abs(layer.worldRect[1] + layer.worldRect[3]) <= 131072 && Math.abs(footX) <= 131072
        && same(layer.worldRect[0], footX - width / 2) && same(layer.worldRect[1], footY - height) && same(layer.worldRect[2], width) && same(layer.worldRect[3], height)
        && same(layer.depthY, footY) && Math.abs(footY) <= 131072, 'exact authored bottom-center/native-scale picture coordinates required');
      check(layer.opacity === native.opacity && layer.brightness === native.brightness && layer.saturation === native.saturation && layer.layer === 'world', 'native opacity/brightness/saturation preserved without clamp');
      check(plain(layer.layout) && layer.layout.anchorConvention === 'bottom-center' && layer.layout.pixelsPerSourcePixel === 1
        && layer.layout.role === 'engine-authored-preview-layout' && layer.layout.nativeAnchor === 'UNKNOWN'
        && layer.layout.authoredBy === p.engineAuthoredInputSnapshot?.previewLayout?.authoredBy, 'explicit engine-authored preview layout, native anchor UNKNOWN required');
    }
    check(used.size === 9, 'all9 approved image sources must be represented by native85');
    check(Array.isArray(p.generatedEngineImageLayers) && sameJSON(p.generatedEngineImageLayers, layers), 'generated engine image records must be preserved separately for save/review');
  }
  const actor = scene.actor;
  if (check(plain(actor) && pair(actor.position) && actor.position.every(value => value >= 0 && value < 8000)
    && !['z', 'height', 'logicalHeight'].some(key => Object.hasOwn(actor, key)), 'actor XY only, without invented Z')) {
    check(plain(actor.sourceStart) && pair(actor.sourceStart.rawTile) && actor.sourceStart.rawTile[0] === 100 && actor.sourceStart.rawTile[1] === 185
      && pair(actor.sourceStart.centerTile) && actor.sourceStart.centerTile[0] === 100.5 && actor.sourceStart.centerTile[1] === 185.5
      && pair(actor.sourceStart.worldPx) && actor.sourceStart.worldPx[0] === 4020 && actor.sourceStart.worldPx[1] === 7420, 'unchanged source raw/center/world START required');
    check(plain(actor.startAuthority) && actor.startAuthority.symbol === 'FDG_AUTHORED_CH1_1_START' && actor.startAuthority.kind === 'engine-authored-design-start'
      && actor.startAuthority.source === 'CH1_WORLD_MAP_ORDER / 맵구성_1장.md:3' && actor.startAuthority.approvedBy === 'ROOT'
      && actor.startAuthority.nativeRuntimeSymbol === 'UNKNOWN', 'approved engine symbol, native runtime UNKNOWN required');
    if (navValid) check(scene.nav.tiles[Math.min(199, Math.floor(actor.position[1] / 40)) * 200 + Math.min(199, Math.floor(actor.position[0] / 40))] === 1, 'actor on polygon-only floor required');
  }
  check(plain(scene.camera) && finite(scene.camera.x) && finite(scene.camera.y) && scene.camera.x >= 0 && scene.camera.x <= 8000
    && scene.camera.y >= 0 && scene.camera.y <= 8000 && typeof scene.camera.follow === 'boolean', 'explicit camera XY/follow required');
  validatePreviewGround(scene, check);
  if (hasHeight) {
    const validation = validateSourcePreviewHeight(scene.heightPreview, { jsonValidated: true });
    errors.push(...validation.errors);
    check(p.sourcePhysicalZClaim === false && p.heightSourceRole === 'normalized-native-logical'
      && sameJSON(p.heightEngineAuthoredInputSnapshot, { heightMapping: scene.heightPreview?.heightMapping, movement: scene.heightPreview?.movement }),
    'original normalized height and separate engine height authoring, physical source Z claim false required');
    const observation = p.heightRuntimeObservation;
    if (observation !== undefined && validation.ok && plain(actor) && pair(actor.position)) {
      const exact = evaluateSourcePreviewHeight(scene.heightPreview, actor.position[0], actor.position[1], { validated: true });
      check(plain(observation) && sameJSON(observation.worldPx, actor.position)
        && observation.observedBy === 'fdg-source-preview-height-v1' && observation.sourcePhysicalZClaim === false
        && same(observation.logicalHeight, exact.logicalHeight) && same(observation.engineFootZ, exact.engineFootZ)
        && same(observation.ramp, exact.ramp) && observation.bandBlocks === exact.bandBlocks
        && (observation.slope === undefined || same(observation.slope, exact.slope)), 'runtime-derived height observation must match current XY/exact evaluator/engine mapping');
    }
  } else check(!Object.hasOwn(p, 'heightRuntimeObservation') && !Object.hasOwn(p, 'heightEngineAuthoredInputSnapshot'), 'height observations/authoring require an explicit exact heightPreview');
  if (Object.hasOwn(scene, 'appearancePreview')) {
    check(hasHeight, 'appearance correction requires the explicit exact heightPreview');
    const appearance = validateSourcePreviewAppearance(scene.appearancePreview, { jsonValidated: true });
    errors.push(...appearance.errors);
    check(sameJSON(p.appearanceEngineAuthoredInputSnapshot, scene.appearancePreview), 'appearance correction must preserve its separate explicit ENGINE_AUTHORING snapshot');
  } else check(!Object.hasOwn(p, 'appearanceEngineAuthoredInputSnapshot'), 'appearance authoring snapshot requires an explicit appearancePreview');
  if (hasCollision) {
    check(hasHeight, 'native object subset requires the explicit exact heightPreview');
    const collision = validateSourcePreviewCollision(scene.collisionPreview, { jsonValidated: true });
    errors.push(...collision.errors);
    check(p.collisionSourceRole === 'native-object-world-px-subset'
      && p.supportedSourceObjectColliderCount === scene.collisionPreview?.engineDerived?.colliderCount
      && sameJSON(p.collisionEngineAuthoredInputSnapshot, { scope: scene.collisionPreview?.scope }),
    'native geometry subset count and separate explicit scope snapshot required; full count remains UNKNOWN');
    if (collision.ok && plain(actor) && pair(actor.position)) {
      const support = querySourcePreviewCollision(scene.collisionPreview, ...actor.position, 0, { validated: true });
      check(support.ok && !support.blocked, 'actor center must be outside the confirmed source object subset');
    }
  } else check(!['collisionSourceRole','supportedSourceObjectColliderCount','collisionEngineAuthoredInputSnapshot'].some(key=>Object.hasOwn(p,key)),
    'collision subset observations require an explicit collisionPreview');
  return { ok: errors.length === 0, errors };
}

/** Attach only the explicitly authored soil recipe; native UV/physical adoption remain unknown. */
export function attachSourcePreviewGround(existingScene, options = {}) {
  const result = { ok: false, errors: [], pending: [], sourcePreview: null };
  const safe = safeJSON({ existingScene, options });
  if (!safe.ok) { result.errors.push(...safe.errors); return result; }
  if (!plain(options)) { result.errors.push('sourcePreview ground: plain options object required'); return result; }
  const { groundLayout, resourceBindings, groundObservations } = options;
  const base = validateSourcePreview(existingScene); if (!base.ok) { result.errors.push(...base.errors); return result; }
  if (!groundLayoutValid(groundLayout)) result.errors.push('sourcePreview ground: explicit soil repeat/origin0/tile1024/opacity1/authoredBy/source-tile-corners layout required');
  if (!plain(resourceBindings) || resourceBindings[SOIL_CANONICAL] !== SOURCE_PREVIEW_GROUND_URL) result.errors.push('sourcePreview ground: exact original soil binding required');
  const refs = groundReferences(existingScene.provenance);
  if (!refs) result.errors.push('sourcePreview ground: approved manifest soil/native colors/other3 refs required');
  if (!groundBoundaryValid(existingScene.provenance.sourceSnapshot?.boundaryPolygon)) result.errors.push('sourcePreview ground: source53 tile-index boundary required; no synthesized clip');
  const observed = groundObservations === undefined ? [] : groundObservations;
  if (!Array.isArray(observed) || observed.length > 1 || !observed.every(value => observationValid(value)
    && value.canonicalAbsolutePath === SOIL_CANONICAL && value.src === SOURCE_PREVIEW_GROUND_URL)) result.errors.push('sourcePreview ground: zero pending or exactly1 canonical original intrinsic observation required');
  if (result.errors.length) return result;
  const scene = clone(existingScene), layout = clone(groundLayout), observations = clone(observed), ready = observations.length === 1;
  const layer = { id: 'native-soil-repeat', materialKey: 'soil', canonicalAbsolutePath: SOIL_CANONICAL, src: SOURCE_PREVIEW_GROUND_URL,
    render: 'repeat', layer: 'ground', sourceRectMode: 'decoded-full',
    ...(ready ? { sourceRect: [0, 0, observations[0].intrinsicWidth, observations[0].intrinsicHeight] } : {}),
    origin: clone(layout.origin), tileWorldSize: clone(layout.tileWorldSize), opacity: layout.opacity,
    brightness: refs.get('soil').values.brightness, saturation: refs.get('soil').values.saturation,
    clipConvention: layout.clipConvention, role: 'engine-authored-ground-repeat', nativeUV: 'UNKNOWN', authoredBy: layout.authoredBy };
  scene.groundLayers = [layer];
  scene.groundClip = { convention: layout.clipConvention, tileSize: 40, polygon: clone(scene.provenance.sourceSnapshot.boundaryPolygon.data) };
  Object.assign(scene.provenance, { groundEngineAuthoredInputSnapshot: { groundLayout: layout, resourceBindings: clone(resourceBindings) },
    groundImageObservations: observations, groundImageObservationRole: 'runtime-decoded-intrinsic', generatedGroundLayers: clone(scene.groundLayers),
    groundRuntimeStatus: ready ? 'READY' : 'RUNTIME_PENDING', groundNativeUV: 'UNKNOWN', unusedGroundMaterials: unusedGroundMaterials(refs) });
  const validation = validateSourcePreview(scene); result.errors.push(...validation.errors);
  if (!validation.ok) return result;
  if (!ready) result.pending.push({ field: 'groundObservations', reason: 'First runtime decode of the exact soil source is required before installation.', classification: 'ENGINE_IMPLEMENTATION', status: 'RUNTIME_PENDING' });
  result.ok = true; freezeJSON(scene.provenance); freezeJSON(scene.imageLayers); freezeJSON(scene.groundLayers); freezeJSON(scene.groundClip);
  result.sourcePreview = scene; return result;
}

/** Attach the actual v4 logical/cliff input and separately authored mapping; never adopt physical source Z. */
export function attachSourcePreviewHeight(existingScene, options = {}) {
  const result = { ok: false, errors: [], pending: [], sourcePreview: null };
  const safe = safeJSON({ existingScene, options });
  if (!safe.ok) { result.errors.push(...safe.errors); return result; }
  if (!plain(options)) { result.errors.push('sourcePreview height: plain options object required'); return result; }
  const base = validateSourcePreview(existingScene); if (!base.ok) { result.errors.push(...base.errors); return result; }
  const built = createSourcePreviewHeight(options.sourceExecutionData, options.heightMapping, options.movement);
  result.errors.push(...built.errors); result.pending.push(...built.pending); if (!built.ok) return result;
  const scene = clone(existingScene); scene.heightPreview = built.heightPreview;
  scene.status.logicalHeight = 'SOURCE_CONSUMED'; scene.status.cliff = 'SOURCE_CONSUMED';
  Object.assign(scene.provenance, { heightSourceRole: 'normalized-native-logical', sourcePhysicalZClaim: false,
    heightEngineAuthoredInputSnapshot: { heightMapping: clone(options.heightMapping), movement: clone(options.movement) } });
  delete scene.provenance.heightRuntimeObservation;
  const validation = validateSourcePreview(scene); result.errors.push(...validation.errors); if (!validation.ok) return result;
  freezeJSON(scene.provenance); freezeJSON(scene.heightPreview); freezeJSON(scene.imageLayers);
  if (scene.groundLayers) freezeJSON(scene.groundLayers); if (scene.groundClip) freezeJSON(scene.groundClip);
  result.ok = true; result.sourcePreview = scene; return result;
}

/** Validated fast path is used by owner caches/rendering; no whole-scene JSON inspection on each vertex. */
export function sampleSourcePreviewHeight(scene, x, y, { validated = false } = {}) {
  if ((!validated && !validateSourcePreview(scene).ok) || !Object.hasOwn(scene, 'heightPreview'))
    return { ok: false, logicalHeight: null, engineFootZ: null, slope: null, ramp: null, bandBlocks: null, sourcePhysicalZClaim: false };
  return evaluateSourcePreviewHeight(scene.heightPreview, x, y, { validated: true });
}

/** Optional explicit readability settings; original layers, source height, nav, and actor remain intact. */
export function attachSourcePreviewAppearance(existingScene, options = {}) {
  const result = { ok: false, errors: [], pending: [], sourcePreview: null };
  const safe = safeJSON({ existingScene, options }); if (!safe.ok) { result.errors.push(...safe.errors); return result; }
  if (!plain(options)) { result.errors.push('sourcePreview appearance: plain options object required'); return result; }
  const base = validateSourcePreview(existingScene); if (!base.ok) { result.errors.push(...base.errors); return result; }
  if (!Object.hasOwn(existingScene, 'heightPreview')) { result.errors.push('sourcePreview appearance: explicit exact heightPreview required'); return result; }
  const built = createSourcePreviewAppearance(options.appearancePreview);
  result.errors.push(...built.errors); result.pending.push(...built.pending); if (!built.ok) return result;
  const scene = clone(existingScene); scene.appearancePreview = built.appearancePreview;
  scene.provenance.appearanceEngineAuthoredInputSnapshot = clone(options.appearancePreview);
  const validation = validateSourcePreview(scene); result.errors.push(...validation.errors); if (!validation.ok) return result;
  freezeJSON(scene.appearancePreview); freezeJSON(scene.provenance); freezeJSON(scene.heightPreview); freezeJSON(scene.imageLayers);
  if (scene.groundLayers) freezeJSON(scene.groundLayers); if (scene.groundClip) freezeJSON(scene.groundClip);
  result.ok = true; result.sourcePreview = scene; return result;
}

/** Source geometry only; the explicit hand subset scope never upgrades full native collision or physical Z. */
export function attachSourcePreviewCollision(existingScene, options = {}) {
  const result = { ok: false, errors: [], pending: [], sourcePreview: null };
  const safe = safeJSON({ existingScene, options }); if (!safe.ok) { result.errors.push(...safe.errors); return result; }
  const base = validateSourcePreview(existingScene); if (!base.ok) { result.errors.push(...base.errors); return result; }
  if (!plain(options) || !existingScene.heightPreview) { result.errors.push('sourcePreview collision: explicit options and exact heightPreview required'); return result; }
  const built = createSourcePreviewCollision(options); result.errors.push(...built.errors); result.pending.push(...built.pending);
  if (!built.ok) return result;
  const scene = clone(existingScene); scene.collisionPreview = built.collisionPreview;
  scene.status.collision = 'SOURCE_SUBSET_CONSUMED';
  Object.assign(scene.provenance, { collisionSourceRole: 'native-object-world-px-subset',
    supportedSourceObjectColliderCount: scene.collisionPreview.engineDerived.colliderCount,
    collisionEngineAuthoredInputSnapshot: { scope: clone(options.scope) } });
  const validation = validateSourcePreview(scene); result.errors.push(...validation.errors); if (!validation.ok) return result;
  freezeJSON(scene.collisionPreview); freezeJSON(scene.provenance);
  result.ok = true; result.sourcePreview = scene; return result;
}

/** Original approved source data + first-decode observations + explicit authoring only. */
export function buildSourcePreview(inspection, observations, authoring) {
  const result = { ok: false, errors: [], pending: [], sourcePreview: null };
  const safe = safeJSON({ inspection, observations, authoring }); if (!safe.ok) { result.errors.push(...safe.errors); return result; }
  const input = clone({ inspection, observations, authoring }), i = input.inspection, a = input.authoring, obs = input.observations;
  const pending = (field, reason, classification) => result.pending.push({ field, reason, classification });
  if (!plain(i) || !Array.isArray(i.visualPlacements) || i.visualPlacements.length !== 85) pending('inspection.visualPlacements', 'All85 actual native VISUAL placements are required.', 'SOURCE_INPUT');
  const approved = i?.approved9 ?? i?.manifestSnapshot?.sourceAssets?.items;
  if (!Array.isArray(approved) || approved.length !== 9) pending('inspection.approved9', 'Exact9 approved original source assets are required.', 'SOURCE_INPUT');
  if (!Array.isArray(obs) || obs.length !== 9) pending('observations', 'First-decoded canonical/src/intrinsicWidth/intrinsicHeight for all9 approved sources are required.', 'ENGINE_IMPLEMENTATION');
  if (!plain(a) || !layoutValid(a.previewLayout)) pending('engineAuthored.previewLayout', 'Explicit bottom-center/pixelsPerSourcePixel1/authoredBy preview convention required.', 'ENGINE_AUTHORING');
  if (!plain(a) || !designAuthority(a.startAuthority)) pending('engineAuthored.startAuthority', 'Exact ROOT-approved design START is required; native runtime symbol remains UNKNOWN.', 'ENGINE_AUTHORING');
  if (!plain(a?.resourceBindings)) pending('engineAuthored.resourceBindings', 'Exact9 approved source bindings are required.', 'ENGINE_AUTHORING');
  if (!plain(a?.camera)) pending('engineAuthored.camera', 'Explicit camera XY/follow required.', 'ENGINE_AUTHORING');
  if (result.pending.length) return result;
  if (i.stage !== 0 || !Array.isArray(i.gridSize) || i.gridSize[0] !== 200 || i.gridSize[1] !== 200 || i.tileSize !== 40
    || !Array.isArray(i.tiles) || i.tiles.length !== 40000 || !i.tiles.every(tile => tile === 0 || tile === 1)
    || !plain(i.start) || !plain(i.sourceSnapshot) || !plain(i.manifestSnapshot)
    || !approved.every(assetValid) || !obs.every(observationValid) || !i.visualPlacements.every(plain)) {
    result.errors.push('sourcePreview: exact inspected stage0 nav/start/snapshots/approved assets/observations/placements required'); return result;
  }
  const assetMap = new Map(approved.map(value => [value.relative, value])), observationMap = new Map(obs.map(value => [value.canonicalAbsolutePath, value]));
  const layers = [];
  for (let index = 0; index < i.visualPlacements.length; index++) {
    const native = i.visualPlacements[index], asset = assetMap.get(native.file), observed = asset && observationMap.get(asset.canonicalAbsolutePath);
    if (!asset || !observationValid(observed) || observed.src !== strictSourceURL(asset) || observed.src !== a.resourceBindings[asset.canonicalAbsolutePath]) {
      result.errors.push(`sourcePreview placement[${index}]: approved original asset and exact intrinsic/binding observation required`); continue;
    }
    const footX = (native.x + 0.5) * 40, footY = (native.y + 0.5) * 40, width = observed.intrinsicWidth * native.scale, height = observed.intrinsicHeight * native.scale;
    layers.push({ id: `native-visual-${String(index).padStart(3, '0')}`, canonicalAbsolutePath: asset.canonicalAbsolutePath, src: observed.src,
      sourceRect: [0, 0, observed.intrinsicWidth, observed.intrinsicHeight], worldRect: [footX - width / 2, footY - height, width, height],
      opacity: native.opacity, brightness: native.brightness, saturation: native.saturation, layer: 'world', depthY: footY, native,
      layout: { ...a.previewLayout, role: 'engine-authored-preview-layout', nativeAnchor: 'UNKNOWN' } });
  }
  if (result.errors.length) return result;
  const scene = { schemaVersion: 1, stage: 0, mode: 'UNADOPTED_VISUAL_PREVIEW', grid: { width: 200, height: 200, tileSize: 40 },
    nav: { tiles: [...i.tiles], scope: 'polygon-only' }, imageLayers: layers,
    actor: { position: [...a.startAuthority.worldPx], sourceStart: clone(i.start),
      startAuthority: { symbol: 'FDG_AUTHORED_CH1_1_START', source: a.startAuthority.source, kind: 'engine-authored-design-start', approvedBy: 'ROOT', nativeRuntimeSymbol: 'UNKNOWN' } },
    camera: clone(a.camera), status: { adoption: 'UNADOPTED', collision: 'SOURCE_PENDING', cliff: 'SOURCE_PENDING', logicalHeight: 'SOURCE_PENDING' },
    provenance: { visualPlacementCount: 85, approvedSourceAssetCount: 9, actualObjectColliderCount: null, productionAdopted: false,
      nativeRuntimeStartSymbol: 'UNKNOWN', nativeCrop: 'UNKNOWN', nativeOrigin: 'UNKNOWN', nativeAnchor: 'UNKNOWN', sourcePhysicalLayoutClaim: false,
      approvedSourceAssets: approved, imageObservations: obs, imageObservationRole: 'runtime-decoded-intrinsic',
      nativeVisualPlacements: clone(i.visualPlacements),
      engineAuthoredInputSnapshot: a, generatedEngineImageLayers: clone(layers),
      sourceSnapshot: i.sourceSnapshot, manifestSnapshot: i.manifestSnapshot,
      ...(i.sourceRevisionSnapshot ? { sourceRevisionSnapshot: i.sourceRevisionSnapshot, manifestRevisionSnapshot: i.manifestRevisionSnapshot } : {}) } };
  const validation = validateSourcePreview(scene); result.errors.push(...validation.errors);
  if (validation.ok) { result.ok = true; freezeJSON(scene.provenance); freezeJSON(scene.imageLayers); result.sourcePreview = scene; }
  return result;
}

function polygonSupport(scene, x, y, radius) {
  if (x - radius < 0 || y - radius < 0 || x + radius > 8000 || y + radius > 8000) return 'bounds';
  const minX = Math.max(0, Math.floor((x - radius) / 40)), maxX = Math.min(199, Math.floor((x + radius) / 40));
  const minY = Math.max(0, Math.floor((y - radius) / 40)), maxY = Math.min(199, Math.floor((y + radius) / 40));
  for (let ty = minY; ty <= maxY; ty++) for (let tx = minX; tx <= maxX; tx++) if (scene.nav.tiles[ty * 200 + tx] !== 1) {
    const dx = x - Math.max(tx * 40, Math.min((tx + 1) * 40, x)), dy = y - Math.max(ty * 40, Math.min((ty + 1) * 40, y));
    if (dx * dx + dy * dy <= radius * radius + 1e-7) return 'polygon-nav';
  }
  return null;
}

/** Original polygon foot support, optional exact source cliff/mapped height, and explicit object subset gates. */
export function canMoveSourcePreview(scene, from, to, radius, { validated = false } = {}) {
  if (!validated && !validateSourcePreview(scene).ok) return { ok: false, reason: 'invalid-preview' };
  if (!plain(from) || !plain(to) || ![from.x, from.y, to.x, to.y, radius].every(finite) || radius < 1 || radius > 19
    || [from.x, from.y, to.x, to.y].some(value => value < 0 || value > 8000)) return { ok: false, reason: 'invalid-query' };
  const distance = Math.hypot(to.x - from.x, to.y - from.y), steps = Math.max(1, Math.ceil(distance / Math.min(10, radius)));
  if (steps > SOURCE_PREVIEW_LIMITS.maxSweepSteps) return { ok: false, reason: 'query-budget' };
  let ground = null;
  for (let step = 0; step <= steps; step++) {
    const t = step / steps, x = from.x + (to.x - from.x) * t, y = from.y + (to.y - from.y) * t;
    const reason = polygonSupport(scene, x, y, radius);
    if (reason) return { ok: false, reason, ...(ground ?? {}) };
    if (scene.collisionPreview) {
      const hit = querySourcePreviewCollision(scene.collisionPreview, x, y, radius, { validated: true });
      if (!hit.ok || hit.blocked) return { ...(ground ?? {}), ok: false, reason: hit.reason, colliderId: hit.colliderId };
    }
    if (scene.heightPreview) {
      const next = sampleSourcePreviewHeight(scene, x, y, { validated: true }), cliff = sourcePreviewCliffBlocks(scene.heightPreview, x, y, radius, { validated: true });
      if (!next.ok || !cliff.ok) return { ...next, ok: false, reason: 'invalid-height-foot-query' };
      if (cliff.blocked) return { ...next, ok: false, reason: 'source-cliff-band' };
      if (step > 0 && next.slope > scene.heightPreview.movement.maxSlope + 1e-7) return { ...next, ok: false, reason: 'engine-height-slope' };
      if (ground && Math.abs(next.engineFootZ - ground.engineFootZ) > scene.heightPreview.movement.maxStep + 1e-7) return { ...next, ok: false, reason: 'engine-height-step' };
      ground = next;
    }
  }
  return { ...(ground ?? {}), ok: true, reason: scene.collisionPreview ? 'polygon-plus-source-cliff-and-object-subset' : ground ? 'polygon-plus-source-cliff' : 'polygon-only' };
}
