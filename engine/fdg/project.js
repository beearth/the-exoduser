// FDG resources are authored data. Production combat/slots/saves remain authoritative.
import { validateRigScene } from './rig-scene-project.js?v=torso-depth-r7';
import { validateTerrainScene, sampleTerrain, canMoveTerrain } from './terrain-scene.js';
import { validateSourceScene, canMoveSourceScene } from './source-scene.js?v=0.10.0';
import { validateSourcePreview, canMoveSourcePreview } from './source-preview.js?v=0.17.1';
import { validateWorldCamera } from './world-camera.js';

export const SCHEMA_VERSION = 1;
export const LIMITS = Object.freeze({ mapSize: 200, tileSize: 40, resources: 128, objects: 256, history: 80, fileBytes: 4 * 1024 * 1024 });
export const clone = value => structuredClone(value);
export const CHARACTER_TARGET = Object.freeze({ frames: 24, fps: 24 });

export class Signals {
  #listeners = new Map();
  on(name, callback) {
    if (!this.#listeners.has(name)) this.#listeners.set(name, new Set());
    this.#listeners.get(name).add(callback);
    return () => this.#listeners.get(name)?.delete(callback);
  }
  emit(name, value) { for (const callback of this.#listeners.get(name) || []) callback(value); }
  clear() { this.#listeners.clear(); }
}

export function isLocalAsset(src) {
  return typeof src === 'string' && src.length > 0 && src.length <= 512 &&
    !/[\\:%?#\x00-\x1f]/.test(src) && !src.startsWith('//') &&
    !src.split('/').some(part => part === '..' || part === '.') && /\.(png|jpg|jpeg|webp)$/i.test(src);
}

export function validateProject(project, { geometry = true } = {}) {
  const errors = [], warnings = [];
  const fail = message => errors.push(message);
  const text = (value, path, max = 120) => { if (typeof value !== 'string' || !value.trim() || value.length > max) fail(`${path}: 1~${max}자 문자열이 필요합니다.`); };
  const number = (value, path, min, max, integer = false) => {
    if (!Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) fail(`${path}: ${min}~${max}${integer ? ' 정수' : ''}가 필요합니다.`);
  };
  const point = (value, path) => {
    if (!value || typeof value !== 'object') { fail(`${path}: 좌표가 필요합니다.`); return; }
    number(value.x, `${path}.x`, 0, 199, true); number(value.y, `${path}.y`, 0, 199, true);
  };
  const sprite = (value, path) => {
    if (!value || typeof value !== 'object') { fail(`${path}: 스프라이트가 필요합니다.`); return; }
    if (!isLocalAsset(value.src)) fail(`${path}.src: 프로젝트의 이미지 경로가 필요합니다.`);
    for (const key of ['frameWidth', 'frameHeight']) number(value[key], `${path}.${key}`, 1, 4096, true);
    for (const key of ['columns', 'rows']) number(value[key], `${path}.${key}`, 1, 256, true);
    number(value.frames, `${path}.frames`, 1, 4096, true);
    if (value.frames > value.columns * value.rows) fail(`${path}: 프레임 수가 시트 용량을 초과합니다.`);
    number(value.fps, `${path}.fps`, 1, 120);
    number(value.scale, `${path}.scale`, 0.1, 10);
    number(value.anchorX, `${path}.anchorX`, 0, 1); number(value.anchorY, `${path}.anchorY`, 0, 1);
    if (value.directions !== undefined) {
      if (!value.directions || typeof value.directions !== 'object' || Array.isArray(value.directions)) fail(`${path}.directions: 방향별 경로가 필요합니다.`);
      else for (const [dir, src] of Object.entries(value.directions)) {
        if (!['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'].includes(dir) || !isLocalAsset(src)) fail(`${path}.directions.${dir}: 방향 또는 이미지 경로가 잘못되었습니다.`);
      }
    }
  };
  if (!project || typeof project !== 'object' || Array.isArray(project)) return { ok: false, errors: ['FDG 프로젝트 객체가 필요합니다.'], warnings, route: null };
  if (project.schemaVersion !== SCHEMA_VERSION) fail(`schemaVersion: 지원 버전은 ${SCHEMA_VERSION}입니다.`);
  text(project.id, 'id'); text(project.name, 'name');
  const map = project.map;
  if (!map || typeof map !== 'object') fail('map: 맵이 필요합니다.');
  else {
    if (map.width !== 200 || map.height !== 200 || map.tileSize !== 40) fail('맵 계약: 200×200, 타일 40px를 유지해야 합니다.');
    if (!Array.isArray(map.tiles) || map.tiles.length !== 40000 || map.tiles.some(t => !Number.isInteger(t) || t < 0 || t > 3)) fail('map.tiles: 0~3 값의 타일 40,000개가 필요합니다. (1=바닥)');
    point(map.start, 'map.start'); point(map.exit, 'map.exit');
    if (!Array.isArray(map.objects) || map.objects.length > LIMITS.objects) fail(`map.objects: 최대 ${LIMITS.objects}개입니다.`);
    else {
      const ids = new Set();
      for (const [index, obj] of map.objects.entries()) {
        const path = `map.objects[${index}]`;
        if (!obj || typeof obj !== 'object') { fail(`${path}: 오브젝트가 필요합니다.`); continue; }
        text(obj.id, `${path}.id`); text(obj.name, `${path}.name`); point(obj, path);
        if (ids.has(obj.id)) fail(`${path}: 중복 id입니다.`); ids.add(obj.id);
        if (!isLocalAsset(obj.src)) fail(`${path}.src: 로컬 이미지 경로가 필요합니다.`);
        number(obj.scale, `${path}.scale`, 0.1, 10);
        if (!['back', 'world', 'front'].includes(obj.layer)) fail(`${path}.layer: back/world/front 중 하나입니다.`);
        if (obj.collision !== false) fail(`${path}.collision: v1 장식은 false만 지원합니다.`);
      }
    }
  }
  const ids = {};
  for (const group of ['characters', 'skills', 'vfx']) {
    ids[group] = new Set();
    if (!Array.isArray(project[group]) || project[group].length < 1 || project[group].length > LIMITS.resources) { fail(`${group}: 1~${LIMITS.resources}개가 필요합니다.`); continue; }
    project[group].forEach((resource, index) => {
      const path = `${group}[${index}]`;
      if (!resource || typeof resource !== 'object') { fail(`${path}: 리소스가 필요합니다.`); return; }
      text(resource.id, `${path}.id`); text(resource.name, `${path}.name`);
      if (ids[group].has(resource.id)) fail(`${path}: 중복 id입니다.`); ids[group].add(resource.id);
      if (group === 'characters') {
        number(resource.speed, `${path}.speed`, 1, 1200); number(resource.radius, `${path}.radius`, 1, 19);
        sprite(resource.sprite, `${path}.sprite`);
        if (!resource.animations || typeof resource.animations !== 'object' || !resource.animations.idle || !resource.animations.walk) fail(`${path}.animations: idle/walk가 필요합니다.`);
        else for (const [name, anim] of Object.entries(resource.animations)) {
          if (!anim || typeof anim !== 'object') { fail(`${path}.animations.${name}: 애니메이션이 필요합니다.`); continue; }
          number(anim.row, `${path}.${name}.row`, 0, Math.max(0, (resource.sprite?.rows || 1) - 1), true);
          number(anim.start ?? 0, `${path}.${name}.start`, 0, 255, true);
          number(anim.frames, `${path}.${name}.frames`, 1, 256, true); number(anim.fps, `${path}.${name}.fps`, 1, 120);
          if ((anim.start ?? 0) >= (resource.sprite?.columns || 0) || anim.row * (resource.sprite?.columns || 0) + (anim.start ?? 0) + anim.frames > (resource.sprite?.frames || 0)) fail(`${path}.${name}: 실제 시트 프레임 범위를 초과합니다.`);
          if (typeof anim.loop !== 'boolean') fail(`${path}.${name}.loop: boolean이 필요합니다.`);
        }
      } else if (group === 'skills') {
        number(resource.cooldown, `${path}.cooldown`, 0, 600); number(resource.cost, `${path}.cost`, 0, 10000);
        number(resource.range, `${path}.range`, 0, 8000); number(resource.damage, `${path}.damage`, 0, 1000000); text(resource.vfx, `${path}.vfx`);
      } else {
        if (!['burst', 'ring', 'projectile'].includes(resource.kind)) fail(`${path}.kind: burst/ring/projectile 중 하나입니다.`);
        if (!/^#[\da-f]{6}$/i.test(resource.color)) fail(`${path}.color: #RRGGBB 색상이 필요합니다.`);
        number(resource.count, `${path}.count`, 1, 1024, true); number(resource.life, `${path}.life`, 0.05, 10);
        number(resource.speed, `${path}.speed`, 0, 2400); number(resource.size, `${path}.size`, 1, 512); number(resource.spread, `${path}.spread`, 0, Math.PI * 2);
        if (resource.sprite !== undefined) sprite(resource.sprite, `${path}.sprite`);
      }
    });
  }
  if (project.characterQuality !== undefined && (project.characterQuality?.frames !== 24 || project.characterQuality?.fps !== 24)) fail('characterQuality: 제작 목표는 24장·24FPS입니다.');
  if (project.characterDrafts !== undefined) {
    if (!Array.isArray(project.characterDrafts) || project.characterDrafts.length > LIMITS.resources) fail(`characterDrafts: 최대 ${LIMITS.resources}개 후보입니다.`);
    else {
      const draftIds = new Set();
      for (const [index, draft] of project.characterDrafts.entries()) {
        const path = `characterDrafts[${index}]`;
        if (!draft || typeof draft !== 'object') { fail(`${path}: 제작 후보가 필요합니다.`); continue; }
        text(draft.id, `${path}.id`); text(draft.name, `${path}.name`);
        if (draftIds.has(draft.id)) fail(`${path}: 중복 id입니다.`); draftIds.add(draft.id);
        if (!isLocalAsset(draft.referenceSrc)) fail(`${path}.referenceSrc: 로컬 원화 경로가 필요합니다.`);
        const clip = draft.clip;
        if (!clip || typeof clip !== 'object') fail(`${path}.clip: 24장 미리보기 시트가 필요합니다.`);
        else {
          sprite({ scale: 1, anchorX: .5, anchorY: .5, ...clip }, `${path}.clip`);
          if (clip.frames !== 24 || clip.fps !== 24) fail(`${path}.clip: 실제 24장·24FPS가 필요합니다.`);
          if (clip.columns * clip.rows > 256 || clip.frameWidth * clip.columns * clip.frameHeight * clip.rows > 16_000_000) fail(`${path}.clip: 검수 시트는 256셀·1600만 픽셀 이하여야 합니다.`);
        }
        if (!Array.isArray(draft.designLocks) || draft.designLocks.length < 1 || draft.designLocks.length > 16) fail(`${path}.designLocks: 1~16개 형태 기준이 필요합니다.`);
        else draft.designLocks.forEach((lock, i) => text(lock, `${path}.designLocks[${i}]`, 240));
        if (draft.provenance?.scope !== 'reference-motion' || draft.provenance?.gameplayApplied !== false || draft.provenance?.modelAvailable !== false || !['pending', 'retouch'].includes(draft.provenance?.reviewStatus)) fail(`${path}.provenance: 참고 모션·미이관·모델 미확보 상태를 명시해야 합니다.`);
        if (draft.review !== undefined) {
          if (!draft.review || typeof draft.review !== 'object' || Array.isArray(draft.review)) fail(`${path}.review: 검수 항목 객체가 필요합니다.`);
          else for (const [key, value] of Object.entries(draft.review)) if (!['silhouette', 'proportions', 'face', 'weapon', 'grip', 'feet'].includes(key) || !['pending', 'retouch', 'pass'].includes(value)) fail(`${path}.review.${key}: 검수 항목 또는 상태가 잘못되었습니다.`);
        }
      }
    }
  }
  if (project.viewCamera !== undefined) {
    for (const error of validateWorldCamera(project.viewCamera).errors) fail(error);
    if (project.terrainScene !== undefined || project.sourceScene !== undefined || project.sourcePreview !== undefined) fail('viewCamera: 공통 월드 카메라는 일반 맵/리그 장면에만 사용합니다. 높이/원본 장면의 카메라와 합성할 수 없습니다.');
  }
  if (project.rigScene !== undefined) for (const error of validateRigScene(project.rigScene).errors) fail(error);
  if (project.terrainScene !== undefined) {
    const terrainResult = validateTerrainScene(project.terrainScene);
    for (const error of terrainResult.errors) fail(error);
    if (terrainResult.ok && map?.start && Number.isFinite(map.tileSize)) {
      const position = project.terrainScene.actor?.position || [(map.start.x + .5) * map.tileSize, (map.start.y + .5) * map.tileSize, 0];
      const character = Array.isArray(project.characters) && project.characters.find(value => value?.id === project.preview?.characterId);
      if (position.slice(0,2).every(Number.isFinite) && Number.isFinite(character?.radius)) {
        const ground = sampleTerrain(project.terrainScene, position[0], position[1], { validated: true });
        const point = { x: position[0], y: position[1], z: ground.height };
        const support = canMoveTerrain(project.terrainScene, point, point, character.radius, { validated: true });
        if (!support.ok) fail(`terrainScene.actor: 플레이어 반경과 접지 조건을 만족해야 합니다 (${support.reason}).`);
      }
    }
    if (project.rigScene !== undefined) fail('terrainScene: 높이 시험과 리그 장면의 동시 합성은 아직 지원하지 않습니다.');
  }
  if (project.sourceScene !== undefined) {
    const result = validateSourceScene(project.sourceScene);
    for (const error of result.errors) fail(`sourceScene: ${error}`);
    if (project.rigScene !== undefined || project.terrainScene !== undefined) fail('sourceScene: 원본 이미지 장면은 리그/CPU 지형 시험과 동시에 사용할 수 없습니다.');
    if (result.ok && map) {
      const scene = project.sourceScene;
      if (map.width !== scene.grid.width || map.height !== scene.grid.height || map.tileSize !== scene.grid.tileSize || !Array.isArray(map.tiles) || map.tiles.some((tile, i) => tile !== scene.nav.tiles[i])) fail('sourceScene: map과 원본 nav의 크기·타일 의미가 일치해야 합니다.');
      if (map.start?.x !== scene.actor.sourceStart.rawTile[0] || map.start?.y !== scene.actor.sourceStart.rawTile[1]) fail('sourceScene: map.start는 원본 START의 raw tile을 유지해야 합니다.');
      const character = Array.isArray(project.characters) && project.characters.find(value => value?.id === project.preview?.characterId);
      if (Number.isFinite(character?.radius)) {
        const [x, y, z] = scene.actor.position;
        const support = canMoveSourceScene(scene, { x, y, z }, { x, y }, character.radius, { validated: true });
        if (!support.ok) fail(`sourceScene.actor: 캐릭터 반경과 원본 접지 조건을 만족해야 합니다 (${support.reason}).`);
      }
    }
  }
  if (project.sourcePreview !== undefined) {
    const result = validateSourcePreview(project.sourcePreview);
    for (const error of result.errors) fail(error);
    if (project.sourceScene !== undefined || project.rigScene !== undefined || project.terrainScene !== undefined) fail('sourcePreview: UNADOPTED 시각 미리보기는 원본 실행/리그/CPU 지형과 함께 사용할 수 없습니다.');
    if (result.ok && map) {
      const scene = project.sourcePreview;
      if (map.width !== 200 || map.height !== 200 || map.tileSize !== 40 || !Array.isArray(map.tiles) || map.tiles.some((tile, i) => tile !== scene.nav.tiles[i])) fail('sourcePreview: polygon-only map/nav를 그대로 유지해야 합니다.');
      if (map.start?.x !== scene.actor.sourceStart.rawTile[0] || map.start?.y !== scene.actor.sourceStart.rawTile[1]) fail('sourcePreview: map.start는 원본 raw START를 유지해야 합니다.');
      const character = Array.isArray(project.characters) && project.characters.find(value => value?.id === project.preview?.characterId);
      if (Number.isFinite(character?.radius)) {
        const [x, y] = scene.actor.position, support = canMoveSourcePreview(scene, { x, y }, { x, y }, character.radius, { validated: true });
        if (!support.ok) fail(`sourcePreview.actor: 원본 nav·절벽·연결된 오브젝트 발 충돌 조건이 필요합니다 (${support.reason}).`);
      }
    }
  }
  if (project.viewCamera !== undefined || project.rigScene !== undefined || project.terrainScene !== undefined || project.sourceScene !== undefined || project.sourcePreview !== undefined) {
    if (errors.length === 0) {
      try {
        // Optional scene resources share the full project's compact UTF-8 file budget.
        // Check descriptors so unknown authored metadata survives without toJSON hooks.
        const pending = [project], seen = new WeakSet();
        while (pending.length) {
          const value = pending.pop();
          if (value === null || typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))) continue;
          if (typeof value !== 'object' || (!Array.isArray(value) && ![Object.prototype, null].includes(Object.getPrototypeOf(value))) || Object.getOwnPropertySymbols(value).length) throw new TypeError('JSON 값만 저장할 수 있습니다.');
          if (seen.has(value)) continue;
          seen.add(value);
          for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
            if (Array.isArray(value) && key === 'length') continue;
            if (!Object.hasOwn(descriptor, 'value') || !descriptor.enumerable || (Array.isArray(value) && (String(Number(key)) !== key || !Number.isInteger(Number(key)) || Number(key) < 0 || Number(key) >= value.length))) throw new TypeError('JSON 데이터 속성만 저장할 수 있습니다.');
            pending.push(descriptor.value);
          }
        }
        const json = JSON.stringify(project, (_key, value) => {
          if (value === undefined) throw new TypeError('빈 배열 셀 또는 undefined는 저장할 수 없습니다.');
          return value;
        });
        if (new TextEncoder().encode(json).byteLength > LIMITS.fileBytes) fail(`프로젝트 파일: UTF-8 JSON ${LIMITS.fileBytes}bytes (4MiB) 이하여야 합니다.`);
      } catch (error) { fail(`프로젝트 JSON: ${error.message}`); }
    }
  }
  for (const skill of Array.isArray(project.skills) ? project.skills : []) if (skill && !ids.vfx.has(skill.vfx)) fail(`${skill.id}: 연결된 VFX '${skill.vfx}'가 없습니다.`);
  const preview = project.preview;
  if (!preview || typeof preview !== 'object') fail('preview: 미리보기 설정이 필요합니다.');
  else {
    for (const [key, group] of [['characterId', 'characters'], ['skillId', 'skills'], ['vfxId', 'vfx']]) if (!ids[group].has(preview[key])) fail(`preview.${key}: 리소스를 찾을 수 없습니다.`);
    number(preview.resourceMax, 'preview.resourceMax', 1, 10000); number(preview.resourceRegen, 'preview.resourceRegen', 0, 1000);
  }
  let route = null;
  if (errors.length === 0 && geometry) {
    if (map.tiles[map.start.y * 200 + map.start.x] !== 1) fail('시작점이 이동 가능한 바닥 위에 있어야 합니다.');
    if (map.tiles[map.exit.y * 200 + map.exit.x] !== 1) fail('출구가 이동 가능한 바닥 위에 있어야 합니다.');
    if (map.start.y < 100 || map.exit.y >= 100 || map.start.y <= map.exit.y) fail('시작은 6시(남쪽), 출구는 12시(북쪽)에 있어야 합니다.');
    const maxRadius = Math.max(...project.characters.map(ch => ch.radius));
    route = findRoute(map, maxRadius);
    if (!route.connected) fail('플레이어 반경을 고려한 시작→출구 경로가 끊어졌습니다.');
    if (map.objects.some((obj, i) => map.objects.slice(i + 1).some(other => Math.hypot(obj.x - other.x, obj.y - other.y) < 5))) warnings.push('장식 간격이 5타일 미만인 곳이 있습니다. 배치를 조정하세요.');
    warnings.push('기술용 맵 미리보기입니다. 본편 오브젝트·고지대 충돌과 완성 환경의 시각 QA는 별도로 확인해야 합니다.');
    if (project.sourceScene) warnings.push('원본 장면의 경로 표시는 polygon nav 기준입니다. 오브젝트·절벽·단차를 포함한 실제 보행은 실행 화면에서 확인하세요.');
    if (project.sourcePreview) warnings.push(project.sourcePreview.collisionPreview ? 'UNADOPTED 제작 미리보기입니다. 원본 수동 배치의 충돌 일부를 소비합니다. 전체 오브젝트 assembly·native 시각 앵커·본편 접지는 미인수입니다.' : project.sourcePreview.heightPreview ? 'UNADOPTED 제작 미리보기입니다. 원본 높이·절벽 조건을 소비하며 엔진 발 Z는 별도 작성 환산입니다. 실제 오브젝트 충돌은 SOURCE_PENDING입니다.' : 'UNADOPTED 시각 제작 미리보기입니다. polygon nav만 사용하며 실제 오브젝트 충돌·절벽·논리높이는 SOURCE_PENDING입니다.');
    for (const vfx of project.vfx) if (vfx.sprite && vfx.life < vfx.sprite.frames / vfx.sprite.fps) warnings.push(`${vfx.name}: 수명보다 시트 재생 길이가 길어 마지막 프레임까지 표시되지 않습니다. 수명 또는 clip FPS를 조정하세요.`);
    if (project.characterQuality) for (const ch of project.characters) {
      const short = Object.entries(ch.animations).filter(([, anim]) => anim.frames < 24).map(([name, anim]) => `${name} ${anim.frames}/24장`);
      if (short.length) warnings.push(`${ch.name}: 실제 원본 ${short.join(', ')}. 24장 방향별 본체 에셋은 제작 대기입니다.`);
      if (Object.values(ch.animations).some(anim => anim.fps !== 24)) warnings.push(`${ch.name}: 재생 속도가 24FPS와 다른 클립이 있습니다.`);
    }
  }
  return { ok: errors.length === 0, errors, warnings, route };
}

export function findRoute(map, radius = 12) {
  const { width: w, height: h, tiles, tileSize: t, start, exit } = map;
  const passable = (x, y) => {
    if (x < 0 || x >= w || y < 0 || y >= h || tiles[y * w + x] !== 1) return false;
    const px = (x + 0.5) * t, py = (y + 0.5) * t;
    for (const [dx, dy] of [[-radius, -radius], [radius, -radius], [-radius, radius], [radius, radius]]) {
      const tx = Math.floor((px + dx) / t), ty = Math.floor((py + dy) / t);
      if (tx < 0 || tx >= w || ty < 0 || ty >= h || tiles[ty * w + tx] !== 1) return false;
    }
    return true;
  };
  if (!passable(start.x, start.y) || !passable(exit.x, exit.y)) return { connected: false, visited: 0, path: [] };
  const parents = new Int32Array(w * h).fill(-1), queue = new Int32Array(w * h);
  const initial = start.y * w + start.x, target = exit.y * w + exit.x;
  let head = 0, tail = 1; queue[0] = initial; parents[initial] = initial;
  while (head < tail) {
    const index = queue[head++]; if (index === target) break;
    const x = index % w, y = Math.floor(index / w);
    for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
      const next = ny * w + nx;
      if (passable(nx, ny) && parents[next] === -1) { parents[next] = index; queue[tail++] = next; }
    }
  }
  const path = [];
  if (parents[target] !== -1) for (let index = target; ; index = parents[index]) {
    path.push({ x: index % w, y: Math.floor(index / w) }); if (index === initial) break;
  }
  return { connected: path.length > 0, visited: tail, path: path.reverse() };
}

export class ProjectStore {
  #project; #past = []; #future = [];
  signals = new Signals();
  constructor(project) { this.#assert(project); this.#project = clone(project); }
  #assert(project) {
    const result = validateProject(project, { geometry: false });
    if (!result.ok) throw new Error(result.errors.join('\n'));
  }
  get project() { return clone(this.#project); }
  get canUndo() { return this.#past.length > 0; }
  get canRedo() { return this.#future.length > 0; }
  change(label, mutate) {
    const next = clone(this.#project); mutate(next); this.replace(next, label);
  }
  replace(project, label = '프로젝트 불러오기') {
    this.#assert(project);
    if (JSON.stringify(project) === JSON.stringify(this.#project)) return false;
    this.#past.push({ project: this.#project, label });
    if (this.#past.length > LIMITS.history) this.#past.shift();
    this.#project = clone(project); this.#future = [];
    this.signals.emit('changed', { project: this.project, label }); return true;
  }
  undo() {
    if (!this.canUndo) return false;
    const item = this.#past.pop(); this.#future.push({ project: this.#project, label: item.label }); this.#project = item.project;
    this.signals.emit('changed', { project: this.project, label: `${item.label} 취소` }); return true;
  }
  redo() {
    if (!this.canRedo) return false;
    const item = this.#future.pop(); this.#past.push({ project: this.#project, label: item.label }); this.#project = item.project;
    this.signals.emit('changed', { project: this.project, label: `${item.label} 다시 실행` }); return true;
  }
  dispose() { this.signals.clear(); }
}
