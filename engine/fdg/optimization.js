import { CHARACTER_TARGET, isLocalAsset } from './project.js';

const MIB = 1024 * 1024;
const DEFAULTS = Object.freeze({ concurrentBursts: 4, particleBudget: 80, textureBudgetMiB: 128, maxTextureDimension: 4096 });
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const positiveInteger = value => Number.isSafeInteger(value) && value > 0;
const assetPath = value => isLocalAsset(value) ? value.replace(/^\/+/, '') : null;
const validId = value => typeof value === 'string' && value.trim().length > 0;

function dimensions(width, height) {
  return positiveInteger(width) && positiveInteger(height) && Number.isSafeInteger(width * height * 4)
    ? { width, height, bytes: width * height * 4 } : null;
}

function sheetDimensions(sheet) {
  if (!record(sheet) || !['frameWidth', 'frameHeight', 'columns', 'rows'].every(key => positiveInteger(sheet[key]))) return null;
  return dimensions(sheet.frameWidth * sheet.columns, sheet.frameHeight * sheet.rows);
}

/** Read-only authoring diagnostics. Byte values estimate one decoded RGBA image, not VRAM. */
export function analyzeProject(project, options = {}) {
  const issues = [], assetsBySrc = new Map(), effects = [], recommendations = [];
  const addIssue = (code, severity, message, asset) => {
    const issue = { code, severity, message };
    issues.push(issue);
    if (asset) asset.issues.push({ ...issue });
  };
  if (!record(options)) {
    addIssue('invalid-settings', 'error', '분석 설정은 객체여야 합니다. 기본 제작 예산을 사용합니다.');
    options = {};
  }
  const settings = {};
  for (const [key, fallback] of Object.entries(DEFAULTS)) {
    const value = options[key];
    const valid = key === 'textureBudgetMiB'
      ? Number.isFinite(value) && value > 0 && value * MIB <= Number.MAX_SAFE_INTEGER
      : positiveInteger(value);
    settings[key] = value === undefined || !valid ? fallback : value;
    if (value !== undefined && !valid) addIssue('invalid-setting', 'error', `${key}: 유효한 양수${key === 'textureBudgetMiB' ? '' : ' 정수'}가 필요합니다. 기본값 ${fallback}을 사용합니다.`);
  }
  const imageSizes = new Map();
  const images = options.images === undefined ? {} : options.images;
  if (!record(images)) addIssue('invalid-images', 'error', 'images는 src별 {width,height} 객체여야 합니다. 선언 치수로 분석합니다.');
  else for (const [key, image] of Object.entries(images)) {
    const src = assetPath(key), size = record(image) ? dimensions(image.width, image.height) : null;
    if (!src || !size) {
      addIssue('invalid-image-dimensions', 'error', `images[${key}]: 로컬 이미지 경로와 안전한 양의 정수 치수가 필요합니다.`);
      continue;
    }
    const previous = imageSizes.get(src);
    if (previous && (previous.width !== size.width || previous.height !== size.height)) {
      addIssue('decoded-dimension-conflict', 'error', `${src}: 같은 정규화 경로에 서로 다른 디코드 치수가 있습니다. 첫 유효 치수를 사용합니다.`);
    } else if (!previous) imageSizes.set(src, size);
  }
  if (!record(project)) {
    addIssue('invalid-project', 'error', '분석할 프로젝트 객체가 필요합니다.');
    project = {};
  }
  const resources = group => {
    if (project[group] === undefined) return [];
    if (!Array.isArray(project[group])) {
      addIssue('invalid-resource-group', 'error', `${group}: 리소스 배열이 필요합니다.`);
      return [];
    }
    return project[group];
  };
  const addAsset = (source, scope, owner, sheet) => {
    const src = assetPath(source);
    if (!src) {
      addIssue('invalid-asset-path', 'error', `${owner}: 로컬 이미지 경로가 필요합니다.`);
      return;
    }
    let asset = assetsBySrc.get(src);
    if (!asset) {
      asset = { src, scope, width: null, height: null, dimensionSource: 'unknown', rgbaBytes: null, owners: [], issues: [], declarations: [] };
      assetsBySrc.set(src, asset);
    }
    if (scope === 'runtime') asset.scope = 'runtime';
    if (!asset.owners.includes(owner)) asset.owners.push(owner);
    if (sheet !== undefined) {
      const declared = sheetDimensions(sheet);
      if (!declared) addIssue('invalid-sheet-dimensions', 'error', `${owner}: 안전한 셀 크기와 열·행이 필요합니다.`, asset);
      else if (!asset.declarations.some(size => size.width === declared.width && size.height === declared.height)) asset.declarations.push(declared);
    }
  };
  const addSheet = (sheet, scope, owner, required = false) => {
    if (!record(sheet)) {
      if (required || sheet !== undefined) addIssue('invalid-sprite', 'error', `${owner}: 스프라이트 객체가 필요합니다.`);
      return;
    }
    addAsset(sheet.src, scope, `${owner}.src`, sheet);
    if (sheet.directions !== undefined) {
      if (!record(sheet.directions)) addIssue('invalid-directions', 'error', `${owner}.directions: 방향별 경로 객체가 필요합니다.`);
      else for (const [direction, src] of Object.entries(sheet.directions)) addAsset(src, scope, `${owner}.directions.${direction}`, sheet);
    }
  };

  for (const [index, character] of resources('characters').entries()) {
    if (!record(character)) { addIssue('invalid-character', 'error', `characters[${index}]: 캐릭터 객체가 필요합니다.`); continue; }
    const owner = `characters[${validId(character.id) ? character.id : index}]`;
    addSheet(character.sprite, 'runtime', `${owner}.sprite`, true);
    if (!positiveInteger(character.sprite?.frames) || character.sprite.frames < CHARACTER_TARGET.frames) {
      addIssue('character-sheet-frames', 'warning', `${owner}: 본체의 선언 장수 ${character.sprite?.frames ?? '미확인'}; 동작당 실제 ${CHARACTER_TARGET.frames}장 제작이 필요합니다.`);
    }
    if (character.sprite?.fps !== CHARACTER_TARGET.fps) addIssue('character-fps-target', 'warning', `${owner}.sprite: ${CHARACTER_TARGET.fps}FPS 목표와 다릅니다.`);
    const animations = record(character.animations) ? character.animations : {};
    for (const name of ['idle', 'walk', 'attack']) {
      if (!record(animations[name])) addIssue('missing-playable-animation', 'warning', `${owner}.animations.${name}: 게임용 동작이 없습니다. 참고 모션으로 완료 처리하지 않습니다.`);
    }
    for (const [name, animation] of Object.entries(animations)) {
      const path = `${owner}.animations.${name}`;
      if (!record(animation)) { addIssue('invalid-animation', 'error', `${path}: 애니메이션 객체가 필요합니다.`); continue; }
      if (animation.frames !== CHARACTER_TARGET.frames) addIssue('character-frame-target', 'warning', `${path}: 선언 ${animation.frames ?? '미확인'}/${CHARACTER_TARGET.frames}장입니다. 실제 본체 셀 제작·검수가 필요합니다.`);
      if (animation.fps !== CHARACTER_TARGET.fps) addIssue('character-fps-target', 'warning', `${path}: ${CHARACTER_TARGET.fps}FPS 목표와 다릅니다.`);
      const sprite = character.sprite, start = animation.start ?? 0;
      if (record(sprite) && positiveInteger(sprite.columns) && positiveInteger(sprite.rows) && positiveInteger(sprite.frames) &&
          (!Number.isSafeInteger(animation.row) || animation.row < 0 || animation.row >= sprite.rows ||
           !Number.isSafeInteger(start) || start < 0 || start >= sprite.columns || !positiveInteger(animation.frames) ||
           !Number.isSafeInteger(animation.row * sprite.columns + start + animation.frames) || animation.row * sprite.columns + start + animation.frames > sprite.frames)) {
        addIssue('animation-frame-range', 'error', `${path}: 선언된 본체 시트 범위를 벗어납니다.`);
      }
    }
  }
  for (const [index, draft] of resources('characterDrafts').entries()) {
    if (!record(draft)) { addIssue('invalid-character-draft', 'error', `characterDrafts[${index}]: 참고 후보 객체가 필요합니다.`); continue; }
    const owner = `characterDrafts[${validId(draft.id) ? draft.id : index}]`;
    addSheet(draft.clip, 'reference', `${owner}.clip`, true);
    addAsset(draft.referenceSrc, 'reference', `${owner}.referenceSrc`);
    if (draft.clip?.frames !== CHARACTER_TARGET.frames) addIssue('draft-frame-target', 'warning', `${owner}.clip: 참고 모션의 선언 장수가 ${CHARACTER_TARGET.frames}장과 다릅니다.`);
    if (draft.clip?.fps !== CHARACTER_TARGET.fps) addIssue('draft-fps-target', 'warning', `${owner}.clip: 참고 모션의 재생 속도가 ${CHARACTER_TARGET.fps}FPS와 다릅니다.`);
  }
  if (project.characterQuality !== undefined && (project.characterQuality?.frames !== CHARACTER_TARGET.frames || project.characterQuality?.fps !== CHARACTER_TARGET.fps)) {
    addIssue('character-quality-target', 'warning', '캐릭터 제작 목표는 24장·24FPS입니다. 저장된 목표가 달라도 실제 셀과 재생 속도를 자동 변경하지 않습니다.');
  }
  if (project.map !== undefined && !record(project.map)) addIssue('invalid-map', 'error', 'map: 맵 객체가 필요합니다.');
  else if (record(project.map)) {
    if (project.map.groundSrc !== undefined) addAsset(project.map.groundSrc, 'runtime', 'map.groundSrc');
    if (project.map.objects !== undefined && !Array.isArray(project.map.objects)) addIssue('invalid-map-objects', 'error', 'map.objects: 오브젝트 배열이 필요합니다.');
    else for (const [index, object] of (project.map.objects || []).entries()) {
      if (!record(object)) { addIssue('invalid-map-object', 'error', `map.objects[${index}]: 오브젝트 객체가 필요합니다.`); continue; }
      addAsset(object.src, 'runtime', `map.objects[${validId(object.id) ? object.id : index}].src`);
    }
  }

  const vfx = resources('vfx'), idCounts = new Map();
  for (const effect of vfx) if (record(effect) && validId(effect.id)) idCounts.set(effect.id, (idCounts.get(effect.id) || 0) + 1);
  const countLimit = Math.max(1, Math.floor(settings.particleBudget / settings.concurrentBursts));
  if (settings.particleBudget < settings.concurrentBursts) addIssue('particle-budget-unreachable', 'warning', '각 버스트 최소 1입자라도 설정한 동시 버스트 수가 입자 예산을 초과합니다. 동시성은 진단 시나리오이며 공격 제한이 아닙니다.');
  for (const [index, effect] of vfx.entries()) {
    if (!record(effect)) { addIssue('invalid-vfx', 'error', `vfx[${index}]: VFX 객체가 필요합니다.`); continue; }
    const id = validId(effect.id) ? effect.id : null, name = typeof effect.name === 'string' ? effect.name : (id ?? `VFX ${index}`);
    const owner = `vfx[${id ?? index}]`;
    if (!id) addIssue('invalid-vfx-id', 'error', `${owner}: VFX id가 필요합니다.`);
    if (idCounts.get(id) > 1) addIssue('duplicate-vfx-id', 'error', `${owner}: 중복 id에는 감소 제안을 만들지 않습니다.`);
    addSheet(effect.sprite, 'runtime', `${owner}.sprite`);
    const count = positiveInteger(effect.count) ? effect.count : null;
    if (count === null) {
      addIssue('invalid-vfx-count', 'error', `${owner}.count: 양의 안전한 정수가 필요합니다.`);
      effects.push({ id, name, count: null, concurrentParticles: null, recommendedCount: null, overBudget: false });
      continue;
    }
    const total = count * settings.concurrentBursts;
    const concurrentParticles = Number.isSafeInteger(total) ? total : null;
    if (concurrentParticles === null) addIssue('particle-estimate-overflow', 'error', `${owner}: 동시 입자 수가 안전한 정수 범위를 초과합니다.`);
    const overBudget = count > settings.particleBudget / settings.concurrentBursts;
    const recommendedCount = Math.min(count, countLimit);
    effects.push({ id, name, count, concurrentParticles, recommendedCount, overBudget });
    if (overBudget) addIssue('particle-budget', 'warning', `${name}: ${count}입자 × 동시 ${settings.concurrentBursts}버스트가 제작 예산 ${settings.particleBudget}입자를 초과합니다.`);
    if (id && idCounts.get(id) === 1 && recommendedCount < count) recommendations.push({
      vfxId: id, from: count, to: recommendedCount, path: 'count',
      reason: `동시 ${settings.concurrentBursts}버스트 진단의 ${settings.particleBudget}입자 예산에 맞춰 장식 입자 수만 줄입니다.`,
    });
  }

  const memory = { runtimeBytes: 0, referenceBytes: 0, unknownRuntimeAssets: [] };
  const textureBudgetBytes = settings.textureBudgetMiB * MIB;
  const assets = [...assetsBySrc.values()].map(asset => {
    const decoded = imageSizes.get(asset.src);
    // Conflicting declarations remain advisory. Use the largest declared layout until decoding.
    const declared = asset.declarations.reduce((largest, next) => !largest || next.bytes > largest.bytes ? next : largest, null);
    if (asset.declarations.length > 1) addIssue('declared-dimension-conflict', 'warning', `${asset.src}: 선언 시트 치수가 서로 다릅니다. 디코드 전에는 가장 큰 선언 크기를 추정합니다.`, asset);
    if (decoded && asset.declarations.some(size => size.width !== decoded.width || size.height !== decoded.height)) {
      addIssue('decoded-declared-mismatch', 'warning', `${asset.src}: 디코드 ${decoded.width}×${decoded.height}와 선언 시트 치수가 다릅니다. 디코드 크기로 집계합니다.`, asset);
    }
    const size = decoded || declared;
    if (size) {
      asset.width = size.width; asset.height = size.height; asset.rgbaBytes = size.bytes;
      asset.dimensionSource = decoded ? 'decoded' : 'declared';
      if (Math.max(size.width, size.height) > settings.maxTextureDimension) addIssue('texture-dimension-budget', 'warning', `${asset.src} (${asset.scope}): ${size.width}×${size.height}는 제작 시트 목표 ${settings.maxTextureDimension}px를 초과합니다. 기기 최대치나 게임 로드 거부를 뜻하지 않습니다.`, asset);
      if (size.bytes > textureBudgetBytes) addIssue('asset-memory-budget', 'warning', `${asset.src} (${asset.scope}): 단일 RGBA 추정값이 제작 예산 ${settings.textureBudgetMiB}MiB를 초과합니다.`, asset);
      const key = asset.scope === 'runtime' ? 'runtimeBytes' : 'referenceBytes', sum = memory[key] + size.bytes;
      if (!Number.isSafeInteger(sum)) {
        if (memory[key] !== Number.MAX_SAFE_INTEGER) addIssue('memory-estimate-overflow', 'error', `${asset.scope}: 합산 RGBA byte가 안전한 정수 범위를 초과해 상한값으로 표시합니다.`);
        memory[key] = Number.MAX_SAFE_INTEGER;
      } else memory[key] = sum;
    } else {
      addIssue('unknown-image-dimensions', 'warning', `${asset.src} (${asset.scope}): 이미지 크기가 미확인입니다. 메모리 0으로 판정하지 않습니다.`, asset);
      if (asset.scope === 'runtime') memory.unknownRuntimeAssets.push(asset.src);
    }
    const { declarations, ...result } = asset;
    return result;
  });
  for (const [scope, key] of [['runtime', 'runtimeBytes'], ['reference', 'referenceBytes']]) {
    if (memory[key] > textureBudgetBytes) addIssue(`${scope}-memory-budget`, 'warning', `${scope}: 확인된 RGBA 합계가 제작 예산 ${settings.textureBudgetMiB}MiB를 초과합니다. 다른 scope와 합산하지 않으며 실제 VRAM 측정은 아닙니다.`);
  }
  return { settings, assets, memory, effects, issues, recommendations, characterTargets: { ...CHARACTER_TARGET } };
}

/** Mutates exactly one existing decorative VFX count. Call inside a ProjectStore transaction. */
export function applyRecommendation(project, recommendation) {
  if (!record(project) || !Array.isArray(project.vfx) || !record(recommendation) || recommendation.path !== 'count' ||
      !validId(recommendation.vfxId) || !positiveInteger(recommendation.from) || !positiveInteger(recommendation.to) || recommendation.to >= recommendation.from) return false;
  const matches = project.vfx.filter(effect => record(effect) && effect.id === recommendation.vfxId);
  if (matches.length !== 1) return false;
  const effect = matches[0], descriptor = Object.getOwnPropertyDescriptor(effect, 'count');
  if (!descriptor || !Object.hasOwn(descriptor, 'value') || !descriptor.writable || descriptor.value !== recommendation.from) return false;
  effect.count = recommendation.to;
  return true;
}
