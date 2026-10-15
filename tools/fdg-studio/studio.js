import { ProjectStore, validateProject, LIMITS, clone } from '../../engine/fdg/project.js?v=perspective-r1';
import { createDefaultProject } from '../../engine/fdg/catalog.js';
import { createCharacterDrafts } from '../../engine/fdg/character-drafts.js';
import { draftFrame, frameIndex, inspectCharacterPixels } from '../../engine/fdg/character-quality.js';
import { fitSpritePreview, spriteThumbnailPage } from '../../engine/fdg/sprite-preview.js?v=0.19.0';
import { exportFixedMap, importFixedMap } from '../../engine/fdg/legacy.js';
import { FDGRuntime, animationFrame } from '../../engine/fdg/runtime.js?v=perspective-r1-c';
import { applyRecommendation } from '../../engine/fdg/optimization.js';
import { OptimizationPanel } from './optimization-panel.js';
import { RigScenePanel } from './rig-scene-panel.js?v=perspective-r1-c';
import { WorkspaceLayout } from './workspace-layout.js';
import { TerrainScenePanel } from './terrain-scene-panel.js?v=perspective-r1';
import { WorldPanel, WORLD_STORAGE_KEY } from './world-panel.js?v=0.8.3';
import { validateWorldProject, WORLD_LIMITS } from '../../engine/fdg/world-project.js?v=0.8.2';
import { SourceScenePanel } from './source-scene-panel.js?v=0.16.0';
import { createMapSourcePreview, applyMapSourceHandColliderDelta } from '../../engine/fdg/map-source-adapter.js?v=0.16.1';
import { sampleSourceHeight } from '../../engine/fdg/source-scene.js?v=0.10.0';
import { sampleSourcePreviewHeight } from '../../engine/fdg/source-preview.js?v=0.17.1';
import { ProductionPanel } from './production-panel.js?v=0.18.1';
import { WorldCameraPanel } from './world-camera-panel.js?v=perspective-r1-b';
import { createPerspectiveProject } from '../../engine/fdg/perspective-project.js?v=perspective-r1-b';

const $ = id => document.getElementById(id);
const authoringId = new URL(location.href).searchParams.get('authoring');
const perspectiveAuthoring = authoringId === 'perspective-r1';
const druidContactAuthoring = authoringId === 'dark-druid-slam-contact-r5';
const darkDruidAuthoring = druidContactAuthoring || authoringId === 'dark-druid-body-r1' || authoringId === 'dark-druid-boss-slam-r3';
const druidSlamAuthoring = druidContactAuthoring || authoringId === 'dark-druid-boss-slam-r3';
const storageKey = perspectiveAuthoring ? 'fdg.studio.perspective.r1' : druidContactAuthoring ? 'fdg.studio.dark-druid.slam.contact.r5' : druidSlamAuthoring ? 'fdg.studio.dark-druid.slam.r3' : darkDruidAuthoring ? 'fdg.studio.dark-druid.body.r1' : 'fdg.studio.project.v1';
const druidAuthoringFixture = druidContactAuthoring ? './fixtures/dark-druid-slam-contact-r5.fdg.json?v=slam-contact-r5-b' : druidSlamAuthoring ? './fixtures/dark-druid-boss-slam-r3.fdg.json?v=boss-slam-r3-final' : './fixtures/dark-druid-normal-body.fdg.json?v=staff-readability-r2-crown-fixture';
const setText = (node, value) => { if (node.children.length !== 0) throw new Error('Text target must be a leaf'); node.textContent = String(value); };
const showStatus = (message, error = false) => { setText($('status'), message); $('status').style.color = error ? '#ef9b91' : ''; };
const groups = { map: { name: '씬 · 맵', icon: '◈' }, characters: { name: '캐릭터', icon: '♟' }, characterDrafts: { name: '신규 캐릭터 · 24장 제작', icon: '◉' }, skills: { name: '스킬', icon: 'ϟ' }, vfx: { name: 'VFX', icon: '✦' }, rigNodes: { name: '3D 장면 노드', icon: '◇' }, terrainNodes: { name: '입체 지형 시험', icon: '▱' } };
const propPalette = [
  { name: '시체나무', src: 'assets/map/ch1/collision/prop_corpsetree.png' },
  { name: '뼈 장식', src: 'docs/4.1맵디자인+설정/objects/deco_bones_02.png' },
  { name: '독 버섯', src: 'docs/4.1맵디자인+설정/objects/mushroom_glow_01.png' },
];
const images = new Map();
const imageErrors = new Map();
const imageDimensions = new Map();
function loadImage(src) {
  if (images.has(src)) return images.get(src);
  const pending = new Promise(resolve => {
    const image = new Image();
    image.onload = () => { if (images.get(src) === pending) { imageErrors.delete(src); imageDimensions.set(src, { width: image.naturalWidth, height: image.naturalHeight }); } resolve(image); };
    image.onerror = () => { if (images.get(src) === pending) { images.delete(src); imageDimensions.delete(src); imageErrors.set(src, `이미지 로드 실패: ${src}`); } resolve(null); };
    image.src = new URL('/' + src.replace(/^\//, ''), location.origin).href;
  });
  images.set(src, pending);
  return pending;
}

let project, store, runtime, validation;
let selected = { group: 'map', id: 'map' }, tab = 'map';
let mapView = 'scene';
let running = false, ready = false, dirty = false, gesture = null;
let animationPlaying = true, animationSeconds = 0, animationImage = null, animationRequest = 0;
let previewChoice = {}, lastStats = 0, lastDraw = 0, refreshRequest = 0;
let previewTimer = null;
let optimization = null, optimizationBurstTimer = null, optimizationOwnsPreview = false;
let rigScenePanel = null, rigLiveChange = false, animationRaf = null;
let terrainScenePanel = null;
let worldPanel = null;
let sourceScenePanel = null;
let productionPanel = null;
let worldCameraPanel = null;
let selectedProp = 0;
let referenceImage = null, qualityInspection = null, detailCenter = { x: .5, y: .5 };
let characterPreviewLayout = null, characterThumbnails = [];
const qualityCache = new Map();
const mapCanvas = $('map-canvas'), mapContext = mapCanvas.getContext('2d');
const charCanvas = $('character-canvas'), charContext = charCanvas.getContext('2d', { willReadFrequently: true });
const workspaceLayout = new WorkspaceLayout();

function resources(group) { return group === 'terrainNodes' ? project.terrainScene?.nodes || [] : group === 'rigNodes' ? project.rigScene?.nodes || [] : project[group] || []; }
function currentResource() { return selected.group === 'map' ? project.map : resources(selected.group).find(resource => resource.id === selected.id); }
function resourcePath(group, id) { return group === 'map' ? 'map' : `${group}.${id}`; }
function selectResource(group, id) {
  if (worldPanel?.active) { worldPanel.deactivate(); refreshRuntime().catch(error => showStatus(error.message, true)); }
  optimization?.stop('리소스 선택 변경으로 측정 종료');
  selected = { group, id }; tab = group === 'terrainNodes' ? 'terrainScene' : group === 'characterDrafts' ? 'characters' : group === 'rigNodes' ? 'rigScene' : group;
  if (['characters', 'skills', 'vfx'].includes(group)) {
    const key = { characters: 'characterId', skills: 'skillId', vfx: 'vfxId' }[group];
    previewChoice[key] = id;
    if (runtime) {
      if (group === 'characters') runtime.setCharacter(id);
      if (group === 'skills') runtime.setSkill(id);
    }
  }
  animationSeconds = 0; $('frame').value = '0'; detailCenter = { x: .5, y: .5 }; $('character-zoom').value = '1';
  renderTree(); renderInspector(); updateMode(); prepareCharacterPreview();
}
function renderTree() {
  if (tab === 'world' && worldPanel) { worldPanel.renderTree(); return; }
  const fragment = document.createDocumentFragment(), query = $('search').value.toLocaleLowerCase();
  for (const [group, info] of Object.entries(groups)) {
    const section = document.createElement('section'); section.className = 'tree-group';
    const title = document.createElement('h2'); title.className = 'tree-heading'; setText(title, info.name); section.append(title);
    const entries = group === 'map' ? [{ id: 'map', name: project.name }] : resources(group);
    for (const resource of entries) {
      if (query && !`${resource.name} ${resource.id}`.toLocaleLowerCase().includes(query)) continue;
      const button = document.createElement('button'); button.className = 'resource-row';
      button.dataset.group = group; button.dataset.id = resource.id;
      if (selected.group === group && selected.id === resource.id) button.classList.add('active');
      const icon = document.createElement('span'); icon.className = 'resource-icon'; setText(icon, info.icon);
      const label = document.createElement('span'); setText(label, resource.name); button.append(icon, label);
      button.addEventListener('click', () => selectResource(group, resource.id)); section.append(button);
    }
    fragment.append(section);
  }
  $('resource-tree').replaceChildren(fragment);
  $('duplicate').disabled = selected.group === 'map' || selected.group === 'rigNodes' || selected.group === 'terrainNodes' || running;
}

function sectionTitle(form, name) { const title = document.createElement('h2'); title.className = 'field-heading'; setText(title, name); form.append(title); }
function field(form, label, value, { type = 'text', min, max, step, unit, options, readonly = false, onChange } = {}) {
  const wrapper = document.createElement('div'); wrapper.className = 'field';
  const caption = document.createElement('label'); const title = document.createElement('span'); setText(title, label); caption.append(title);
  if (unit) { const hint = document.createElement('small'); setText(hint, unit); caption.append(hint); }
  const input = document.createElement(options ? 'select' : 'input'); input.id = `field-${form.children.length}`; caption.htmlFor = input.id;
  if (options) for (const option of options) {
    const element = document.createElement('option'); element.value = option.value; setText(element, option.label); input.append(element);
  }
  else { input.type = type; if (min !== undefined) input.min = min; if (max !== undefined) input.max = max; if (step !== undefined) input.step = step; input.readOnly = readonly; }
  input.value = value; input.disabled = running || (readonly && !!options);
  if (onChange) input.addEventListener('change', () => {
    if (running) return;
    const next = type === 'number' ? (input.value === '' ? NaN : Number(input.value)) : input.value;
    try { onChange(next); } catch (error) { showStatus(error.message, true); input.value = value; }
  });
  wrapper.append(caption, input); form.append(wrapper); return input;
}
function editSelected(label, path, value) {
  store.change(label, next => {
    let resource = selected.group === 'map' ? next.map : next[selected.group].find(item => item.id === selected.id);
    const keys = path.split('.');
    for (const key of keys.slice(0, -1)) resource = resource[key];
    resource[keys.at(-1)] = value;
  });
}
function renderInspector() {
  const resource = currentResource();
  const form = $('inspector-fields'); rigScenePanel?.clearInspectorListeners(); form.replaceChildren();
  if (tab === 'world') {
    setText($('resource-type'), 'WORLD PROJECT');
    setText($('selection-name'), worldPanel?.project?.name || '지역 전환');
    setText($('selection-id'), worldPanel?.selection || 'independent-world');
    worldPanel?.inspector(form, field, sectionTitle); return;
  }
  setText($('resource-type'), selected.group.toUpperCase());
  setText($('selection-name'), selected.group === 'map' ? project.name : resource.name);
  setText($('selection-id'), resourcePath(selected.group, selected.id));
  const bind = (label, path, value, options = {}) => field(form, label, value, { ...options, onChange: next => editSelected(`${label} 수정`, path, next) });
  if (selected.group === 'rigNodes') { rigScenePanel?.inspector(form); return; }
  if (selected.group === 'terrainNodes') { terrainScenePanel?.inspector(form,field,sectionTitle); return; }
  if (selected.group === 'map') {
    sectionTitle(form, 'SCENE');
    field(form, '프로젝트 이름', project.name, { onChange: name => store.change('프로젝트 이름 수정', next => { next.name = name; }) });
    field(form, '맵 크기', '200 × 200', { readonly: true }); field(form, '타일 크기', '40 px', { readonly: true });
    sectionTitle(form, '시작 · 출구');
    for (const key of ['start', 'exit']) for (const axis of ['x', 'y']) bind(`${key === 'start' ? '시작' : '출구'} ${axis.toUpperCase()}`, `${key}.${axis}`, resource[key][axis], { type: 'number', min: 0, max: 199, step: 1, unit: 'tile' });
    sectionTitle(form, 'VISUAL INSTANCES');
    field(form, '배치할 장식', String(selectedProp), { options: propPalette.map((prop, index) => ({ value: String(index), label: prop.name })), onChange: value => { selectedProp = Number(value); $('brush').value = 'object'; } });
    field(form, '배치 수', String(resource.objects.length), { readonly: true, unit: '/ 256' });
    field(form, '충돌', '장식 전용 · 타일 충돌 분리', { readonly: true });
  } else {
    sectionTitle(form, 'RESOURCE');
    field(form, '리소스 ID', resource.id, { readonly: true }); bind('표시 이름', 'name', resource.name);
    if (selected.group === 'characterDrafts') {
      sectionTitle(form, '24장 · 24FPS 제작 기준');
      field(form, '실제 참고 클립', `${resource.clip.frames}장 · ${resource.clip.fps}FPS · 1초`, { readonly: true });
      field(form, '클립 시트', `${resource.clip.columns} × ${resource.clip.rows} / ${resource.clip.frameWidth} × ${resource.clip.frameHeight}px`, { readonly: true });
      field(form, '원화 경로', resource.referenceSrc, { readonly: true });
      field(form, '원본 검수 상태', resource.provenance.reviewStatus === 'retouch' ? '수정 필요' : '사용자 검수 대기', { readonly: true });
      field(form, '모델·리깅', '게임용 모델 미확보', { readonly: true });
      field(form, '방향별 본체', '8방향 × 24장 제작 대기', { readonly: true });
      sectionTitle(form, '형태 · 모델링 기준');
      for (const lock of resource.designLocks) { const p = document.createElement('p'); p.className = 'design-lock'; setText(p, lock); form.append(p); }
      sectionTitle(form, '수동 품질 검수');
      for (const [key, label] of Object.entries({ silhouette: '실루엣', proportions: '신체 비율', face: '얼굴 일관성', weapon: '무기 구조', grip: '손·견착', feet: '발·접지' })) {
        field(form, label, resource.review?.[key] || 'pending', { options: [{ value: 'pending', label: '검수 대기' }, { value: 'retouch', label: '수정 필요' }, { value: 'pass', label: '참고 화면 통과' }], onChange: value => store.change(`${label} 검수 기록`, next => { const draft = next.characterDrafts.find(item => item.id === selected.id); draft.review ||= {}; draft.review[key] = value; }) });
      }
      const note = document.createElement('p'); note.className = 'quality-note'; setText(note, '기존 영상의 한 시점 참고 모션입니다. 배경 제거·8방향·게임용 모델/리깅·전투 동작은 아직 연결되지 않았습니다. 검수 기록은 이 참고 화면에만 적용됩니다.'); form.append(note);
    } else if (selected.group === 'characters') {
      sectionTitle(form, '캐릭터 이동');
      bind('이동 속도', 'speed', resource.speed, { type: 'number', min: 1, max: 1200, step: 1, unit: 'px / sec' });
      bind('충돌 반경', 'radius', resource.radius, { type: 'number', min: 1, max: 19, step: 1, unit: 'px' });
      sectionTitle(form, 'SPRITE');
      bind('이미지 경로', 'sprite.src', resource.sprite.src); bind('표시 배율', 'sprite.scale', resource.sprite.scale, { type: 'number', min: .1, max: 10, step: .1 });
      for (const [key, label, max] of [['frameWidth', '셀 너비', 4096], ['frameHeight', '셀 높이', 4096], ['columns', '시트 열', 256], ['rows', '시트 행', 256], ['frames', '실제 시트 장수', 4096]]) bind(label, `sprite.${key}`, resource.sprite[key], { type: 'number', min: 1, max, step: 1 });
      field(form, '방향 시트', `${Object.keys(resource.sprite.directions || {}).length}방향 / ${resource.sprite.columns}열`, { readonly: true });
      for (const [direction, src] of Object.entries(resource.sprite.directions || {})) bind(`${direction} 경로`, `sprite.directions.${direction}`, src);
      const animation = $('animation').value in resource.animations ? $('animation').value : 'idle';
      sectionTitle(form, `ANIMATION · ${animation.toUpperCase()}`);
      const data = resource.animations[animation];
      bind('시작 행', `animations.${animation}.row`, data.row, { type: 'number', min: 0, max: resource.sprite.rows - 1, step: 1 });
      bind('시작 열', `animations.${animation}.start`, data.start ?? 0, { type: 'number', min: 0, max: resource.sprite.columns - 1, step: 1 });
      bind('실제 프레임 수', `animations.${animation}.frames`, data.frames, { type: 'number', min: 1, max: 256, step: 1 });
      bind('재생 속도', `animations.${animation}.fps`, data.fps, { type: 'number', min: 1, max: 120, step: 1, unit: 'fps' });
      field(form, '24장 목표', `${data.frames}/24장 · ${(data.frames / data.fps).toFixed(3)}초`, { readonly: true });
    } else if (selected.group === 'skills') {
      sectionTitle(form, 'SKILL · 초안');
      bind('재사용 대기', 'cooldown', resource.cooldown, { type: 'number', min: 0, max: 600, step: .1, unit: 'sec' });
      bind('자원 소모', 'cost', resource.cost, { type: 'number', min: 0, max: 10000, step: 1 });
      bind('사거리', 'range', resource.range, { type: 'number', min: 0, max: 8000, step: 10, unit: 'px' });
      bind('피해 메타데이터', 'damage', resource.damage, { type: 'number', min: 0, max: 1000000, step: 1, unit: 'v1: 적 피해 미적용' });
      bind('연결 VFX', 'vfx', resource.vfx, { options: project.vfx.map(vfx => ({ value: vfx.id, label: vfx.name })) });
      sectionTitle(form, 'TEST RESOURCE');
      field(form, '최대 자원', project.preview.resourceMax, { type: 'number', min: 1, max: 10000, step: 1, onChange: value => store.change('미리보기 자원 수정', next => { next.preview.resourceMax = value; }) });
      field(form, '초당 회복', project.preview.resourceRegen, { type: 'number', min: 0, max: 1000, step: 1, unit: '/ sec', onChange: value => store.change('미리보기 자원 회복 수정', next => { next.preview.resourceRegen = value; }) });
    } else {
      sectionTitle(form, 'EMITTER');
      bind('타입', 'kind', resource.kind, { options: ['burst', 'ring', 'projectile'].map(kind => ({ value: kind, label: kind })) });
      bind('색상', 'color', resource.color, { type: 'color' });
      bind('입자 수', 'count', resource.count, { type: 'number', min: 1, max: 1024, step: 1 });
      bind('수명', 'life', resource.life, { type: 'number', min: .05, max: 10, step: .05, unit: 'sec' });
      bind('속도', 'speed', resource.speed, { type: 'number', min: 0, max: 2400, step: 10, unit: 'px / sec' });
      bind('크기', 'size', resource.size, { type: 'number', min: 1, max: 512, step: 1, unit: 'px' });
      bind('확산각', 'spread', resource.spread, { type: 'number', min: 0, max: Math.PI * 2, step: .1, unit: 'radians' });
      if (resource.sprite) {
        sectionTitle(form, 'EXISTING VFX SHEET'); bind('이미지 경로', 'sprite.src', resource.sprite.src);
        field(form, '시트 규격', `${resource.sprite.frameWidth} × ${resource.sprite.frameHeight} · ${resource.sprite.frames}f`, { readonly: true });
        bind('시트 재생 속도', 'sprite.fps', resource.sprite.fps, { type: 'number', min: 1, max: 120, step: 1, unit: 'clip FPS' });
        field(form, '시트 명목 길이', `${(resource.sprite.frames / resource.sprite.fps).toFixed(3)} sec`, { readonly: true, unit: 'frames / clip FPS' });
      }
    }
  }
}

function validate() {
  if (tab === 'world') {
    const world = worldPanel?.project;
    const result = world ? validateWorldProject(world) : { ok: false, errors: ['두 지역 시험을 생성하거나 WorldProject를 불러오세요.'] };
    setText($('validation-badge'), world ? (result.ok ? 'WORLD 구조 통과' : 'WORLD ERROR') : '지역 프로젝트 대기');
    $('validation-badge').classList.toggle('error', !!world && !result.ok);
    const p = document.createElement('p'); p.className = result.ok ? 'success' : '';
    setText(p, result.ok ? `${world.scope} · 본편 지역 등록/전환 0 · 월드 그래프/미니맵/웨이포인트 UI 제작 대기` : result.errors[0]);
    $('diagnostic-list').replaceChildren(p); return result;
  }
  validation = validateProject(project);
  setText($('validation-badge'), validation.ok ? '구조 통과' : `${validation.errors.length} ERROR`);
  $('validation-badge').classList.toggle('error', !validation.ok);
  const lines = [];
  if (validation.ok) lines.push({ text: `✓ 구조·리소스 연결·시작→출구 경로 통과 (${validation.route.path.length}타일)`, className: 'success' });
  lines.push(...validation.errors.map(text => ({ text: `✕ ${text}`, className: 'error' })));
  lines.push(...validation.warnings.map(text => ({ text: `△ ${text}`, className: '' })));
  lines.push(...[...imageErrors.values()].map(text => ({ text: `✕ ${text}`, className: 'error' })));
  const fragment = document.createDocumentFragment();
  for (const line of lines) { const p = document.createElement('p'); p.className = line.className; setText(p, line.text); fragment.append(p); }
  $('diagnostic-list').replaceChildren(fragment);
  if (!validation.ok || imageErrors.size) $('diagnostics-panel').open = true;
  $('play').disabled = !ready || (!validation.ok && !running) || (!running && selected.group === 'characterDrafts');
  return validation;
}
function updateMode() {
  worldCameraPanel?.refresh();
  for (const button of document.querySelectorAll('[data-tab]')) button.setAttribute('aria-selected', String(button.dataset.tab === tab));
  const ordinaryMap = !project.sourcePreview && !project.sourceScene && !project.terrainScene && !project.rigScene;
  const mapScene = tab === 'map' && ordinaryMap && mapView === 'scene';
  const showMap = !running && tab === 'map' && !mapScene, showCharacter = !running && tab === 'characters';
  mapCanvas.hidden = !showMap; charCanvas.hidden = !showCharacter; $('runtime-canvas').hidden = showMap || showCharacter;
  $('map-toolbar').hidden = !showMap; $('animation-toolbar').hidden = !showCharacter;
  $('map-view-toolbar').hidden = tab !== 'map' || !ordinaryMap;
  $('map-view-scene').setAttribute('aria-pressed', String(mapView === 'scene'));
  $('map-view-edit').setAttribute('aria-pressed', String(mapView === 'edit'));
  $('map-view-edit').disabled = running;
  $('rig-scene-toolbar').hidden = tab !== 'rigScene';
  $('rig-sequence-toolbar').hidden = tab !== 'rigScene';
  $('terrain-scene-toolbar').hidden = tab !== 'terrainScene';
  $('world-toolbar').hidden = tab !== 'world'; $('world-waypoint-toolbar').hidden = tab !== 'world'; $('world-hud').hidden = tab !== 'world';
  $('source-execution-toolbar').hidden = tab !== 'sourceScene';
  $('source-play-controls').hidden = tab !== 'sourceScene' || !(project.sourcePreview || project.sourceScene);
  $('source-execution-empty').hidden = tab !== 'sourceScene' || !!project.sourceScene || !!project.sourcePreview;
  if (tab === 'sourceScene' && !project.sourceScene && !project.sourcePreview) $('runtime-canvas').hidden = true;
  if (tab !== 'world') $('world-empty').hidden = true;
  const isDraft = showCharacter && selected.group === 'characterDrafts';
  $('quality-hud').hidden = !isDraft;
  $('direction').disabled = isDraft;
  $('animation').disabled = isDraft;
  $('character-view').disabled = !isDraft;
  $('character-zoom').disabled = !showCharacter;
  $('vfx-playback-hud').hidden = !ordinaryMap || worldPanel?.active || showMap || showCharacter || !['map', 'skills', 'vfx'].includes(tab);
  $('apply-24fps').disabled = running;
  $('sync-character-drafts').disabled = running;
  if (isDraft) $('play').disabled = true;
  setText($('mode-label'), running ? 'PLAY MODE · 60Hz' : 'AUTHORING');
  setText($('viewport-title'), tab === 'rigScene' ? 'FDG SCENE · ACTUAL 3D RIG CONSUMER' : running ? 'FDG · PLAYABLE PREVIEW' : isDraft ? 'CHARACTER QUALITY · 24 FRAMES / 24 FPS' : { map: '맵 · 충돌 편집', characters: '캐릭터 · 실제 클립 검수', skills: 'SKILL · RESOURCE / COOLDOWN TEST', vfx: 'VFX · PARTICLE PREVIEW' }[tab]);
  setText($('context-help'), running ? '캔버스 클릭 후 WASD / 방향키 이동 · Space / 클릭 스킬 · Esc 정지' : { map: '드래그: 타일 편집 · 시작 6시 / 출구 12시 · 장식 5타일 간격', characters: '방향·프레임·속도를 확인하고 인스펙터에서 편집', skills: '스킬 테스트: 자원 소모·대기시간·연결 VFX 확인', vfx: 'VFX 재생: 기존 시트 + 입자 효과 · 1프레임 수동 진행' }[tab]);
  setText($('play'), running ? '■ 테스트 정지' : '▶ 테스트 실행');
  if (tab === 'terrainScene') {
    setText($('viewport-title'),'입체 지형 · CPU XYZ / DEPTH');
    setText($('context-help'),'계단·경사·접지 시험 · WASD/방향키 또는 한걸음 · 본편 적용 대기');
    if (!project.terrainScene) $('play').disabled = true;
  }
  if (isDraft) setText($('context-help'), '원화·모션 비교 · 24장 스크럽 · 확대 후 클릭해 얼굴·무기·손·발 확인');
  if (tab === 'rigScene') setText($('context-help'), '같은 FDG 장면의 실제3D 소비자 · 재질/클립 전환 · 정지/장면1틱 · 전용 장면 저장');
  if (tab === 'rigScene' && project.rigScene?.sequence) {
    setText($('play'), running ? '⏸ 일시정지' : '▶ 시퀀스 실행');
    setText($('context-help'), '본체 ENGINE_AUTHORING / 임팩트 ENGINE_FIXTURE · 데모0.900초 이벤트1회 · 정지는 동작만 hold, 일시정지는 전체 clock 정지 · native 시간 환산 없음');
  }
  setText($('step'), tab === 'rigScene' || mapScene ? '장면 1틱 · 60Hz' : '1프레임');
  $('cast').disabled = !ready || optimization?.active || (tab === 'map' && !mapScene) || tab === 'characters' || tab === 'rigScene';
  $('emit').disabled = !ready || optimization?.active || (tab === 'map' && !mapScene) || tab === 'characters' || tab === 'rigScene';
  if (project.terrainScene || tab === 'terrainScene') { $('cast').disabled=true; $('emit').disabled=true; }
  if (tab === 'sourceScene') {
    setText($('viewport-title'), project.sourcePreview ? 'CH1-1 · 원본 이미지 제작 미리보기 · UNADOPTED' : 'CH1-1 · 원본 이미지 / 접지 장면');
    setText($('context-help'), project.sourcePreview ? project.sourcePreview.collisionPreview ? '원본 수동 배치 충돌 구간 · 전체 오브젝트 연결 대기 · 별도 QA 배치 / production 미인수' : project.sourcePreview.heightPreview ? '원본 높이 0..1 → 엔진 발 Z · 서쪽 경사로 / 절벽 조건 · 실제 오브젝트 충돌 SOURCE_PENDING · production 미인수' : 'polygon-only 이동 · WASD / 방향키 · 높이 / 실제 충돌 / 절벽: SOURCE_PENDING · production 미인수' : '원본 논리 높이와 엔진 환산을 분리 · WASD / 방향키 이동 · 편집 / 실행 / 정지 / 1프레임');
    $('play').disabled = project.sourcePreview ? !runtime?.sourcePreviewReady : !project.sourceScene || !runtime?.sourceSceneReady;
    $('cast').disabled = true; $('emit').disabled = true;
  }
  $('step').disabled = !ready || running || (tab === 'map' && !mapScene) || tab === 'characters';
  if (tab === 'sourceScene' && !runtime?.sourceSceneReady && !runtime?.sourcePreviewReady) $('step').disabled = true;
  if(tab==='terrainScene' && !project.terrainScene)$('step').disabled=true;
  $('undo').disabled = running || !store.canUndo; $('redo').disabled = running || !store.canRedo;
  if (tab === 'world') {
    setText($('viewport-title'), `지역 전환 · ${worldPanel?.project?.scope || '독립 프로젝트'} / 독립 저장`);
    setText($('context-help'), '실제 이동으로 웨이포인트 발견 → 범위 안에서 활성화 · 지도/연결 보기 · 독립 저장');
    setText($('project-name'), worldPanel?.project?.name || '독립 WorldProject');
    setText($('save-state'), worldPanel?.dirty ? '지역 프로젝트 미저장' : 'FDG World 전용 저장');
    $('play').disabled = !worldPanel?.playable;
    $('step').disabled = running || !worldPanel?.playable;
    $('cast').disabled = true; $('emit').disabled = true;
    $('undo').disabled = running || worldPanel?.loading || !worldPanel?.canUndo;
    $('redo').disabled = running || worldPanel?.loading || !worldPanel?.canRedo;
    $('save').disabled = !worldPanel?.project || worldPanel?.loading;
    $('export').disabled = !worldPanel?.project || worldPanel?.loading;
    $('import').disabled = running || worldPanel?.loading;
    $('duplicate').disabled = true; $('sync-character-drafts').disabled = true;
  } else { setText($('project-name'), project.name); setText($('save-state'), dirty ? 'FDG 프로젝트 미저장' : 'FDG 전용 로컬 저장'); $('save').disabled = false; $('export').disabled = false; $('import').disabled = running; }
  $('optimization-panel').hidden = tab === 'world';
  $('production-strip').hidden = tab === 'world';
  $('source-scene-open').disabled = running || !!worldPanel?.loading;
  if (sourceScenePanel?.openDialog) { $('play').disabled = true; $('step').disabled = true; }
  runtime?.setInputEnabled(running && tab !== 'rigScene' && !sourceScenePanel?.openDialog && !(tab === 'world' && worldPanel?.viewOpen));
  if (runtime && !showMap && !showCharacter) runtime.resize();
  workspaceLayout.fitCanvases();
  renderMap();
  optimization?.refresh();
  rigScenePanel?.refresh();
  terrainScenePanel?.refresh();
  worldPanel?.refresh();
  updateSourceState();
  if (mapScene && !running) {
    setText($('mode-label'), '장면 검수 · 일시정지');
    setText($('viewport-title'), 'EXODUSER · 실제 에셋 장면');
    setText($('context-help'), '정지: 방향당10px · 실행: 연속 이동 · 장면1틱: 1/60초 · 저장은 제작 데이터와 실행 조합을 보존');
    runtime?.renderOnce();
  }
  updateProductionState();
}
function updateProductionState() {
  if (!project) return;
  const names = [['characters','characterId'],['skills','skillId'],['vfx','vfxId']].map(([group,key]) => project[group].find(item => item.id === previewChoice[key])?.name || '미선택');
  setText($('production-combination'), names.join(' / '));
  const same = ['characterId','skillId','vfxId'].every(key => previewChoice[key] === project.preview[key]);
  $('preview-combination-save').disabled = running || tab === 'world' || same;
  $('project-copy').disabled = running || tab === 'world';
  const visible = tab === 'map' && !$('map-view-toolbar').hidden && (mapView === 'scene' || running);
  for (const direction of ['west','north','south','east']) {
    const button = $(`map-move-${direction}`); button.disabled = !ready || !visible;
    button.setAttribute('aria-pressed', String(visible && running && runtime?.moveInputDirection === direction));
  }
  $('map-input-stop').disabled = !visible || !running || !runtime?.moveInputDirection;
  const words = {west:'서쪽',north:'북쪽',south:'남쪽',east:'동쪽'};
  setText($('map-input-state'), running ? runtime?.moveInputDirection ? `${words[runtime.moveInputDirection]} 연속 이동` : '실행 · 방향을 누르면 연속 이동' : '정지 · 10px 한 걸음');
  if (runtime?.player) setText($('map-player-position'), `발 X ${runtime.player.x.toFixed(1)} · Y ${runtime.player.y.toFixed(1)}`);
  productionPanel?.refresh();
}
function updateSourceState() {
  const canMove = running && tab === 'sourceScene' && runtime?.state === 'running' && (runtime?.sourcePreviewReady || runtime?.sourceSceneReady);
  const directions = { west: '서쪽', north: '북쪽', south: '남쪽', east: '동쪽' };
  for (const direction of Object.keys(directions)) {
    const button = $(`source-play-${direction}`); button.disabled = !canMove;
    button.setAttribute('aria-pressed', String(canMove && runtime.moveInputDirection === direction));
  }
  $('source-input-stop').disabled = !canMove;
  $('source-delta-import').disabled = running || !project.sourcePreview?.collisionPreview || !!project.sourcePreview.collisionPreview.sourceExecutionSnapshot.nativeDeltaSnapshot;
  setText($('source-input-state'), canMove ? runtime.moveInputDirection ? `${directions[runtime.moveInputDirection]} 이동 중 · 이동 해제로 정지` : '이동 해제 · WASD / 방향키 사용 가능' : '일시정지 · 방향 입력 해제');
  const scene = project.sourceScene, snapshot = tab === 'sourceScene' ? runtime?.getSourceSceneSnapshot() : null;
  const preview = tab === 'sourceScene' ? runtime?.getSourcePreviewSnapshot() : null;
  const previewHeight=project.sourcePreview?.heightPreview;
  const heightReady=previewHeight&&Number.isFinite(preview?.logicalHeight)&&Number.isFinite(preview?.engineFootZ);
  const collisionText=preview?.collisionCoverage==='PARTIAL'&&Number.isInteger(preview.supportedSourceObjectColliderCount)
    ? `수동 배치 충돌 ${preview.supportedSourceObjectColliderCount}영역 · 전체 연결 대기` : '실제 오브젝트 충돌 SOURCE_PENDING';
  const mapping=previewHeight?.heightMapping||scene?.height.heightMapping;
  if (mapping && document.activeElement !== $('source-height-scale')) $('source-height-scale').value = String(mapping.scalePx);
  if (mapping && document.activeElement !== $('source-height-offset')) $('source-height-offset').value = String(mapping.offsetPx);
  for (const id of ['source-walk-west','source-walk-north','source-walk-south','source-walk-east','source-height-apply','source-height-scale','source-height-offset']) $(id).disabled = running || !(heightReady && runtime?.sourcePreviewReady || scene && runtime?.sourceSceneReady);
  if (project.sourcePreview) {
    if(!previewHeight){$('source-height-scale').value = ''; $('source-height-offset').value = '';}
    for (const id of ['source-walk-west','source-walk-north','source-walk-south','source-walk-east']) $(id).disabled = running || !runtime?.sourcePreviewReady;
  }
  setText($('source-execution-state'), preview ? `UNADOPTED · X ${preview.position[0].toFixed(1)} · Y ${preview.position[1].toFixed(1)} · 이미지 ${preview.visibleObjects}/${preview.imageLayers}${preview.groundLayers ? ` · 바닥 ${preview.groundRuntimeStatus === 'READY' ? '원본 soil · 작성 UV' : '디코드 대기'}` : ''}${heightReady ? ` · 원 높이 ${preview.logicalHeight.toFixed(4)} → 엔진 발 Z ${preview.engineFootZ.toFixed(2)} · ${collisionText}` : previewHeight ? ` · 높이 런타임 설치 중 · ${collisionText}` : ' · 높이·실충돌·절벽 SOURCE_PENDING'}${preview.blockedReason ? ` · 차단 ${preview.blockedReason}` : ''}` : snapshot ? `X ${snapshot.position[0].toFixed(1)} · Y ${snapshot.position[1].toFixed(1)} · 논리 ${snapshot.logicalHeight.toFixed(4)} → 엔진 Z ${snapshot.position[2].toFixed(2)} · 이미지 ${snapshot.visibleObjects}/${snapshot.imageLayers}${snapshot.blockedReason ? ` · 차단 ${snapshot.blockedReason}` : ''}` : '원본 실행 자료를 연결하세요 · source 입력 / 엔진 환산 분리');
}
function runtimeProject() { const next = clone(project); Object.assign(next.preview, previewChoice); return next; }
async function refreshRuntime() {
  if (!runtime) return;
  clearTimeout(previewTimer);
  const request = ++refreshRequest; ready = false; $('play').disabled = true;
  await runtime.setProject(runtimeProject());
  if (request !== refreshRequest) return;
  ready = true; runtime.pause(); runtime.renderOnce(); validate(); updateMode();
}
function changed({ project: next, label }) {
  optimization?.stop('프로젝트 변경으로 측정 종료');
  project = next; dirty = true;
  imageErrors.clear();
  if (selected.group !== 'map' && !resources(selected.group).some(resource => resource.id === selected.id)) { selected = { group: 'map', id: 'map' }; if (tab !== 'rigScene') tab = 'map'; }
  for (const [key, group] of [['characterId', 'characters'], ['skillId', 'skills'], ['vfxId', 'vfx']]) if (!project[group].some(r => r.id === previewChoice[key])) previewChoice[key] = project.preview[key];
  setText($('project-name'), project.name); setText($('save-state'), '미저장 변경 · JSON 내보내기로 보관');
  renderTree(); renderInspector(); validate(); updateMode(); prepareCharacterPreview();
  if (!rigLiveChange) refreshRuntime().catch(error => showStatus(error.message, true)); showStatus(label);
}

function renderMap(map = project?.map) {
  if (!map) return;
  const cell = mapCanvas.width / map.width; mapContext.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
  mapContext.fillStyle = '#111a20'; mapContext.fillRect(0, 0, mapCanvas.width, mapCanvas.height);
  for (let index = 0; index < map.tiles.length; index++) {
    if (map.tiles[index] === 1) { mapContext.fillStyle = '#35493f'; mapContext.fillRect((index % map.width) * cell, Math.floor(index / map.width) * cell, cell, cell); }
  }
  if ($('grid').checked) {
    mapContext.strokeStyle = '#b5cda414'; mapContext.lineWidth = .5; mapContext.beginPath();
    for (let i = 0; i <= map.width; i++) { mapContext.moveTo(i * cell, 0); mapContext.lineTo(i * cell, mapCanvas.height); mapContext.moveTo(0, i * cell); mapContext.lineTo(mapCanvas.width, i * cell); } mapContext.stroke();
  }
  if ($('route').checked && !gesture && validation?.route?.connected) {
    mapContext.strokeStyle = '#b2dd6d88'; mapContext.lineWidth = 2; mapContext.beginPath();
    validation.route.path.forEach((point, index) => { const x = (point.x + .5) * cell, y = (point.y + .5) * cell; if (index === 0) mapContext.moveTo(x, y); else mapContext.lineTo(x, y); }); mapContext.stroke();
  }
  for (const obj of map.objects) { mapContext.fillStyle = '#d8b178'; mapContext.beginPath(); mapContext.arc((obj.x + .5) * cell, (obj.y + .5) * cell, 3.5, 0, Math.PI * 2); mapContext.fill(); }
  for (const [point, label, color] of [[map.start, 'START', '#b2dd6d'], [map.exit, 'EXIT', '#79c3d2']]) {
    const x = (point.x + .5) * cell, y = (point.y + .5) * cell;
    mapContext.fillStyle = color; mapContext.beginPath(); mapContext.arc(x, y, 5, 0, Math.PI * 2); mapContext.fill();
    mapContext.font = '11px sans-serif'; mapContext.fillText(label, x + 9, y + 4);
  }
}
function tileAt(event) {
  const rect = mapCanvas.getBoundingClientRect();
  return { x: Math.max(0, Math.min(199, Math.floor((event.clientX - rect.left) / rect.width * 200))), y: Math.max(0, Math.min(199, Math.floor((event.clientY - rect.top) / rect.height * 200))) };
}
function paint(point) {
  if (!gesture) return;
  const map = gesture.project.map, tool = gesture.tool;
  if (tool === 'start' || tool === 'exit') map[tool] = point;
  else if (tool === 'object') {
    if (map.objects.length >= LIMITS.objects || map.objects.some(obj => Math.hypot(obj.x - point.x, obj.y - point.y) < 5)) return;
    const prop = propPalette[selectedProp];
    map.objects.push({ id: `prop_${crypto.randomUUID()}`, name: prop.name, x: point.x, y: point.y, src: prop.src, scale: .3, layer: 'world', collision: false });
  } else if (tool === 'erase-object') map.objects = map.objects.filter(obj => Math.hypot(obj.x - point.x, obj.y - point.y) > 3);
  else {
    const radius = Math.floor(gesture.size / 2);
    for (let y = Math.max(0, point.y - radius); y <= Math.min(199, point.y + radius); y++) for (let x = Math.max(0, point.x - radius); x <= Math.min(199, point.x + radius); x++) map.tiles[y * 200 + x] = Number(tool);
  }
  renderMap(map);
}
mapCanvas.addEventListener('pointerdown', event => {
  if (running || !project || event.button !== 0) return;
  gesture = { project: clone(project), tool: $('brush').value, size: Number($('brush-size').value), pointerId: event.pointerId, last: tileAt(event) };
  mapCanvas.setPointerCapture(event.pointerId); paint(gesture.last);
});
mapCanvas.addEventListener('pointermove', event => {
  const point = tileAt(event); setText($('cursor-position'), `tile ${point.x}, ${point.y} · 40px`);
  if (!gesture || gesture.pointerId !== event.pointerId) return;
  const previous = gesture.last, steps = Math.max(Math.abs(point.x - previous.x), Math.abs(point.y - previous.y));
  // Fill every crossed cell so a fast drag remains one continuous edit.
  for (let i = 1; i <= steps; i++) paint({ x: Math.round(previous.x + (point.x - previous.x) * i / steps), y: Math.round(previous.y + (point.y - previous.y) * i / steps) });
  gesture.last = point;
});
mapCanvas.addEventListener('pointerup', event => {
  if (!gesture || gesture.pointerId !== event.pointerId) return;
  const transaction = gesture; gesture = null;
  try { store.replace(transaction.project, '맵 브러시 편집'); } catch (error) { showStatus(error.message, true); }
  if (mapCanvas.hasPointerCapture(event.pointerId)) mapCanvas.releasePointerCapture(event.pointerId); renderMap();
});
mapCanvas.addEventListener('pointercancel', () => { gesture = null; renderMap(); });
mapCanvas.addEventListener('lostpointercapture', () => { if (gesture) { gesture = null; renderMap(); } });

async function prepareCharacterPreview() {
  if (!project) return;
  const request = ++animationRequest;
  animationImage = null; referenceImage = null; qualityInspection = null;
  if (selected.group === 'rigNodes' || tab === 'rigScene') return;
  if (selected.group === 'characterDrafts') {
    const draft = currentResource();
    for (const other of project.characterDrafts || []) if (other.id !== draft.id) { images.delete(other.clip.src); images.delete(other.referenceSrc); }
    setText($('quality-badge'), '검수 준비 중'); setText($('quality-summary'), '24장 원본 프레임을 확인하고 있습니다.');
    const [motion, reference] = await Promise.all([loadImage(draft.clip.src), loadImage(draft.referenceSrc)]);
    if (request !== animationRequest) return;
    animationImage = motion; referenceImage = reference;
    $('frame').max = '23'; $('frame').value = '0'; animationSeconds = 0;
    const key = JSON.stringify(draft.clip);
    try {
      if (motion && !qualityCache.has(key)) {
        await new Promise(resolve => requestAnimationFrame(resolve));
        if (request !== animationRequest) return;
        if (motion.naturalWidth * motion.naturalHeight > 16_000_000) throw new Error('검수 시트는 최대16,000,000픽셀입니다.');
        const canvas = document.createElement('canvas'); canvas.width = motion.naturalWidth; canvas.height = motion.naturalHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(motion, 0, 0);
        qualityCache.set(key, inspectCharacterPixels(ctx.getImageData(0, 0, canvas.width, canvas.height), draft.clip));
        canvas.width = canvas.height = 0;
      }
      qualityInspection = qualityCache.get(key) || null;
      setText($('quality-badge'), qualityInspection ? `24장 · 24FPS / TECH ${qualityInspection.technical.status.toUpperCase()}` : '이미지 오류');
      setText($('quality-summary'), qualityInspection ? `서로 다른 실제 프레임 ${qualityInspection.distinctFrameCount}/24 · 참고 모션 · 배경 포함 · 게임용 모델·8방향 제작 대기` : '원본 시트와 원화 경로를 확인하세요.');
    } catch (error) { setText($('quality-badge'), '검수 오류'); setText($('quality-summary'), error.message); showStatus(error.message, true); }
    renderCharacter(0); validate(); return;
  }
  const ch = project.characters.find(item => item.id === previewChoice.characterId) || project.characters[0];
  const available = Object.keys(ch.animations);
  const previousAnimation = $('animation').value;
  const fragment = document.createDocumentFragment();
  for (const name of available) { const option = document.createElement('option'); option.value = name; setText(option, { idle: '대기', walk: '이동', attack: '공격' }[name] || name); fragment.append(option); }
  $('animation').replaceChildren(fragment); $('animation').value = available.includes(previousAnimation) ? previousAnimation : 'idle';
  const src = ch.sprite.directions?.[$('direction').value] || ch.sprite.src;
  const loaded = await loadImage(src);
  if (request !== animationRequest) return;
  animationImage = loaded;
  const animation = ch.animations[$('animation').value] || ch.animations.idle;
  $('frame').max = String(animation.frames - 1); $('frame').value = '0'; animationSeconds = 0;
  renderCharacter(0); validate();
}
function renderCharacter(dt) {
  if (!project || charCanvas.hidden) return;
  if (selected.group === 'characterDrafts') { renderDraftCharacter(dt); return; }
  const ch = project.characters.find(item => item.id === previewChoice.characterId) || project.characters[0];
  const anim = ch.animations[$('animation').value] || ch.animations.idle;
  if (animationPlaying) animationSeconds += dt;
  const frame = animationPlaying ? animationFrame(ch.sprite, anim, animationSeconds) : null;
  const index = frame ? frame.index - anim.row * ch.sprite.columns - (anim.start ?? 0) : Number($('frame').value);
  setText($('frame-value'), `${index + 1} / ${anim.frames}`);
  if (frame) $('frame').value = String(index);
  if (frame?.finished) { animationPlaying = false; setText($('animate'), '▶ 애니메이션'); }
  const { width, height } = charCanvas; charContext.clearRect(0, 0, width, height);
  const mainHeight = height - 145, viewport = { x: 0, y: 0, width, height: mainHeight - 42 };
  characterPreviewLayout = null; characterThumbnails = [];
  charContext.fillStyle = '#11161d'; charContext.fillRect(0, 0, width, height);
  charContext.strokeStyle = '#29313d'; charContext.lineWidth = 1; charContext.beginPath();
  for (let x = 0; x < width; x += 40) { charContext.moveTo(x, 0); charContext.lineTo(x, height); }
  for (let y = 0; y < height; y += 40) { charContext.moveTo(0, y); charContext.lineTo(width, y); } charContext.stroke();
  const cx = width / 2;
  let previewScale = '—';
  if (animationImage) {
    const s = ch.sprite, fw = s.frameWidth, fh = s.frameHeight;
    const selectedFrame = animationFrame(s, { ...anim, loop: false }, index / anim.fps);
    const image = { width: animationImage.naturalWidth, height: animationImage.naturalHeight };
    try {
      const layout = fitSpritePreview({ cell: selectedFrame, image, viewport, anchor: { x: s.anchorX ?? .5, y: s.anchorY ?? 1 }, focus: detailCenter, zoom: Number($('character-zoom').value) });
      characterPreviewLayout = { ...layout, viewport }; previewScale = layout.scale.toFixed(3);
      charContext.save(); charContext.beginPath(); charContext.rect(viewport.x, viewport.y, viewport.width, viewport.height); charContext.clip();
      charContext.imageSmoothingEnabled = layout.scale < 1;
      charContext.drawImage(animationImage, selectedFrame.sx, selectedFrame.sy, fw, fh, layout.x, layout.y, layout.width, layout.height);
      charContext.strokeStyle = '#b0d866'; charContext.strokeRect(layout.x, layout.y, layout.width, layout.height);
      charContext.beginPath(); charContext.moveTo(layout.anchor.x - 8, layout.anchor.y); charContext.lineTo(layout.anchor.x + 8, layout.anchor.y); charContext.moveTo(layout.anchor.x, layout.anchor.y - 8); charContext.lineTo(layout.anchor.x, layout.anchor.y + 8); charContext.stroke(); charContext.restore();
      const page = spriteThumbnailPage({ frames: anim.frames, index, width, top: mainHeight + 8 });
      characterThumbnails = page.cells;
      for (const thumb of page.cells) {
        const cell = animationFrame(s, { ...anim, loop: false }, thumb.index / anim.fps);
        const fitted = fitSpritePreview({ cell, image, viewport: thumb, padding: 2 });
        charContext.fillStyle = thumb.index === index ? '#637e3f' : '#1b2431'; charContext.fillRect(thumb.x - 2, thumb.y - 2, thumb.width + 4, thumb.height + 4);
        charContext.imageSmoothingEnabled = fitted.scale < 1;
        charContext.drawImage(animationImage, cell.sx, cell.sy, fw, fh, fitted.x, fitted.y, fitted.width, fitted.height);
        charContext.fillStyle = '#000b'; charContext.fillRect(thumb.x, thumb.y, 24, 14); charContext.fillStyle = '#eaf1fb'; charContext.font = '11px sans-serif'; charContext.fillText(String(thumb.index + 1), thumb.x + 3, thumb.y + 11);
      }
      charContext.fillStyle = '#aebccf'; charContext.font = '11px sans-serif'; charContext.textAlign = 'center';
      charContext.fillText(`프레임 ${page.start + 1}–${page.end + 1} / ${anim.frames} · 썸네일 클릭으로 정지 검수`, cx, height - 8); charContext.textAlign = 'start';
    } catch (error) {
      characterPreviewLayout = null; characterThumbnails = [];
      charContext.fillStyle = '#ef9b91'; charContext.font = '14px sans-serif'; charContext.fillText(`셀 범위 오류: ${error.message}`, 20, 36);
    }
  } else {
    charContext.fillStyle = '#ef9b91'; charContext.font = '14px sans-serif'; charContext.fillText('이미지를 불러올 수 없습니다. 경로를 확인하세요.', cx - 170, viewport.height / 2);
  }
  charContext.fillStyle = '#aebccf'; charContext.font = '12px sans-serif'; charContext.textAlign = 'center';
  charContext.fillText(`${ch.name} · ${$('animation').value} · ${index + 1}/${anim.frames}장 · ${anim.fps}FPS · ${ch.sprite.frameWidth}×${ch.sprite.frameHeight}`, cx, mainHeight - 23);
  charContext.fillText(`보기 ${previewScale}× · 장면 배율 ${ch.sprite.scale}× · 앵커 ${ch.sprite.anchorX ?? .5}, ${ch.sprite.anchorY ?? 1} · 확대 후 클릭: 위치 이동`, cx, mainHeight - 6); charContext.textAlign = 'start';
}

function renderDraftCharacter(dt) {
  const draft = currentResource(), clip = draft.clip;
  if (animationPlaying) animationSeconds += dt;
  const index = animationPlaying ? frameIndex(animationSeconds, { frames: 24, fps: 24, loop: false }) : Math.max(0, Math.min(23, Number($('frame').value)));
  if (animationPlaying) $('frame').value = String(index);
  if (animationPlaying && animationSeconds >= 1) { animationPlaying = false; setText($('animate'), '▶ 애니메이션'); }
  setText($('frame-value'), `${index + 1} / 24`);
  const { width, height } = charCanvas, mainHeight = height - 125;
  charContext.clearRect(0, 0, width, height); charContext.fillStyle = '#101720'; charContext.fillRect(0, 0, width, height);
  const rect = draftFrame(clip, index), zoom = Number($('character-zoom').value), view = $('character-view').value;
  const paint = (image, source, alpha = 1) => {
    if (!image) return;
    const scale = Math.min((width - 28) / source.sw, (mainHeight - 12) / source.sh) * zoom;
    const dw = source.sw * scale, dh = source.sh * scale;
    charContext.save(); charContext.beginPath(); charContext.rect(0, 0, width, mainHeight); charContext.clip(); charContext.globalAlpha = alpha; charContext.imageSmoothingEnabled = true; charContext.imageSmoothingQuality = 'high';
    charContext.drawImage(image, source.sx, source.sy, source.sw, source.sh, width / 2 - detailCenter.x * dw, mainHeight / 2 - detailCenter.y * dh, dw, dh); charContext.restore();
  };
  if (view !== 'motion' && referenceImage) paint(referenceImage, { sx: 0, sy: 0, sw: referenceImage.naturalWidth, sh: referenceImage.naturalHeight });
  if (view !== 'reference') paint(animationImage, rect, view === 'compare' ? .5 : 1);
  charContext.font = '11px sans-serif'; charContext.fillStyle = '#b9cce0';
  charContext.fillText(`${draft.name} · ${index + 1}/24장 · 24FPS · 원화시점 참고 모션`, 18, mainHeight + 17);
  charContext.fillText('배경·인물 분리 / 8방향 본체 / 모델·리깅은 후속 제작', 18, height - 7);
  if (animationImage) {
    const thumbW = 64, thumbH = 36, gap = 10, start = (width - 12 * (thumbW + gap)) / 2;
    for (let i = 0; i < 24; i++) {
      const x = start + i % 12 * (thumbW + gap), y = mainHeight + 25 + Math.floor(i / 12) * (thumbH + 8), cell = draftFrame(clip, i);
      charContext.fillStyle = i === index ? '#b0d866' : '#344153'; charContext.fillRect(x - 2, y - 2, thumbW + 4, thumbH + 4);
      charContext.drawImage(animationImage, cell.sx, cell.sy, cell.sw, cell.sh, x, y, thumbW, thumbH);
      charContext.fillStyle = '#000b'; charContext.fillRect(x, y, 18, 13); charContext.fillStyle = '#eaf1fb'; charContext.fillText(String(i + 1), x + 3, y + 10);
    }
  }
}

function serialize(value, filename) {
  let json = value?.worldVersion === 1 ? JSON.stringify(value) : JSON.stringify(value, null, 2); if (new TextEncoder().encode(json).length > LIMITS.fileBytes) json = JSON.stringify(value);
  return { json, filename, byteLength: new TextEncoder().encode(json).byteLength };
}
function download(value, filename) { return downloadSerialized(serialize(value, filename)); }
function downloadSerialized(result) {
  const { json, filename } = result;
  const blob = new Blob([json], { type: 'application/json' }), url = URL.createObjectURL(blob);
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  return result;
}
function captureSceneProject() {
  const next = store.project; rigScenePanel?.capture(next); terrainScenePanel?.capture(next);
  if (next.sourceScene && !worldPanel?.active) next.sourceScene = runtime.captureSourceScene();
  if (next.sourcePreview && !worldPanel?.active) next.sourcePreview = runtime.captureSourcePreview();
  return next;
}
function save() {
  if (tab === 'world') { worldPanel?.save(); return; }
  if (project.rigScene || project.terrainScene || project.sourceScene || project.sourcePreview) { running = false; runtime.pause(); const next = captureSceneProject(); rigLiveChange = true; try { store.replace(next, '장면 재생 위치 저장'); } finally { rigLiveChange = false; } updateMode(); }
  const result = validateProject(project, { geometry: false });
  if (!result.ok) { showStatus(result.errors[0], true); return; }
  try { localStorage.setItem(storageKey, JSON.stringify(project)); dirty = false; setText($('save-state'), '저장됨 · FDG 전용 로컬 저장'); showStatus('프로젝트를 이 브라우저에 저장했습니다. JSON 내보내기로 별도 보관할 수 있습니다.'); }
  catch (error) { showStatus(`로컬 저장 실패: ${error.message}. JSON 내보내기를 사용하세요.`, true); }
}
async function importFile(file) {
  if (!file || running) return;
  if (file.size > WORLD_LIMITS.fileBytes) { showStatus('FDG 프로젝트 4MiB / WorldProject 8MiB 파일 한도를 확인하세요.', true); return; }
  let prepared = null;
  const previousProject = project;
  try {
    const data = JSON.parse(await file.text());
    if (data?.worldVersion !== undefined || tab === 'world') {
      await worldPanel.import(data);
      if (tab !== 'world') { tab = 'world'; await worldPanel.activate(); }
      renderInspector(); validate(); updateMode(); return;
    }
    if (file.size > LIMITS.fileBytes) throw new Error('FDG 프로젝트 파일은 4MiB 이하입니다.');
    const next = data?.schemaVersion !== undefined ? data : { ...clone(project), map: importFixedMap(data) };
    if (next.sourcePreview?.groundLayers?.length) {
      prepared = await runtime.prepareSourcePreview(next);
      if (running || project !== previousProject) throw new Error('프로젝트가 변경되어 바닥 연결을 취소했습니다.');
    }
    if (next.sourceScene || next.sourcePreview) { selected = { group: 'map', id: 'map' }; tab = 'sourceScene'; }
    if (prepared) {
      rigLiveChange = true;
      try { store.replace(next, '원본 바닥 제작 미리보기 불러오기'); } finally { rigLiveChange = false; }
      await refreshRuntime();
    } else store.replace(next, '프로젝트 불러오기');
    showStatus('불러오기 완료. 경로 검증 결과를 확인하세요.');
  } catch (error) { showStatus(`불러오기 실패: ${error.message}`, true); }
  finally { prepared?.release(); $('file-input').value = ''; }
}
function togglePlay() {
  if (tab === 'world') {
    if (!worldPanel?.playable) return;
    running = !running;
    if (running) runtime.start(); else runtime.pause();
    renderInspector(); updateMode(); if (running) $('runtime-canvas').focus(); return;
  }
  if (!ready) return;
  if (optimization?.active) { optimization.stop('테스트 정지'); if (!running) return; }
  clearTimeout(previewTimer);
  if (!running && !validate().ok) { showStatus('검증 오류를 해결한 뒤 테스트를 실행하세요.', true); return; }
  if (!running && tab === 'rigScene' && project.rigScene?.sequence && project.rigScene.sequence.autoStart !== false) {
    const sequence = runtime.getRigSequenceSnapshot();
    if (['stopped', 'completed'].includes(sequence.status) && !runtime.replayRigSequence()) return showStatus('시퀀스를 다시 시작하지 못했습니다.', true);
  }
  running = !running;
  if (running) { runtime.start(); if (tab !== 'rigScene' && !project.terrainScene) runtime.followCharacter(); }
  else { runtime.pause(); showStatus('테스트 정지. 편집을 계속할 수 있습니다.'); }
  renderTree(); renderInspector(); updateMode();
  if (running) $('runtime-canvas').focus();
}
async function loadRigSequencePreset(id) {
  const presets = {
    'hell-aberrant-tail-swipe-impact-r4': './fixtures/hell-aberrant-torso-side-finish.fdg.json?v=torso-side-finish-r8-fixture',
    'dark-druid-body-r1': './fixtures/dark-druid-normal-body.fdg.json?v=staff-readability-r2-crown-fixture',
    'dark-druid-boss-slam-r3': './fixtures/dark-druid-boss-slam-r3.fdg.json?v=boss-slam-r3-final',
    'dark-druid-slam-contact-r5': './fixtures/dark-druid-slam-contact-r5.fdg.json?v=slam-contact-r5-b',
  };
  if (!presets[id] || running || !ready) return;
  const before = project;
  const response = await fetch(new URL(presets[id], import.meta.url));
  if (!response.ok) throw new Error(`데모 파일 HTTP ${response.status}`);
  const raw = await response.text();
  if (new TextEncoder().encode(raw).length > LIMITS.fileBytes) throw new Error('장면 파일 한계4MiB 초과');
  const candidate = JSON.parse(raw), result = validateProject(candidate, { geometry: false });
  if (!result.ok) throw new Error(result.errors[0]);
  if (project !== before || running) throw new Error('프로젝트가 바뀌어 시퀀스 연결을 취소했습니다.');
  const druidPreset = id === 'dark-druid-body-r1' || id === 'dark-druid-boss-slam-r3' || id === 'dark-druid-slam-contact-r5';
  if (!candidate.rigScene?.nodes.length || (!druidPreset && !candidate.rigScene.sequence)) throw new Error('데모 노드/설정을 확인하세요.');
  worldPanel?.deactivate(); runtime.pause();
  selected = { group: 'rigNodes', id: candidate.rigScene.sequence?.nodeId || candidate.rigScene.nodes[0].id }; tab = 'rigScene'; previewChoice = clone(candidate.preview);
  rigLiveChange = true;
  try { store.replace(candidate, druidPreset ? '다크드루이드 NORMAL · 본체 제작 장면 연결' : '지옥기형 · 꼬리/임팩트 데모 장면 연결'); } finally { rigLiveChange = false; }
  await refreshRuntime();
  $('rig-sequence-preset').value = id;
  showStatus(id === 'dark-druid-slam-contact-r5' ? '다크드루이드 접촉 동작 제작. 테스트 실행 후 내려찍기를 선택하면 대기로 복귀합니다.' : id === 'dark-druid-boss-slam-r3' ? '다크드루이드 동작 제작. 테스트 실행 후 동작에서 내려찍기를 선택하면 대기로 복귀합니다. 본편 보스전 검증과 별도인 제작 장면입니다.' : id === 'dark-druid-body-r1' ? '다크드루이드 본체 연결. 테스트 실행 후 동작에서 지팡이 타격을 선택하면 대기로 복귀합니다. FX 없는 제작 사본입니다.' : '대기 동작 연결. 테스트 실행은 대기 재생, 공격 1회 버튼은 꼬리치기 후 대기로 복귀합니다.');
}
function controlRigSequence(action) {
  if (!ready || tab !== 'rigScene' || !project.rigScene?.sequence) return;
  clearTimeout(previewTimer);
  if (action === 'pause') { running = false; runtime.pause(); }
  else if (action === 'stop') {
    if (!runtime.stopRigSequence()) return;
    showStatus('본체 동작 정지. 실행 clock가 계속되는 동안 활성 FX는 독립 수명으로 끝납니다.');
  } else if (action === 'replay') {
    if (!runtime.replayRigSequence()) return;
    running = true; runtime.start(); $('runtime-canvas').focus();
    showStatus('0초부터 새 시퀀스 재생. 이전 활성 FX는 독립 수명을 유지합니다.');
  } else return;
  renderInspector(); updateMode(); runtime.renderOnce();
}
function cast() {
  if (!ready || optimization?.active) return;
  const id = previewChoice.skillId || project.preview.skillId;
  const result = runtime.triggerSkill(id, { x: runtime.player.x + 260, y: runtime.player.y - 100 });
  if (result?.ok === false) showStatus(`스킬 시전 불가: ${result.reason || '자원 또는 쿨다운'}`, true);
  else {
    showStatus('스킬 시전: 자원·쿨다운·연결 VFX를 확인하세요.');
    const skill = project.skills.find(item => item.id === id);
    const life = project.vfx.find(item => item.id === skill?.vfx)?.life || 0;
    if (!running && tab === 'map' && mapView === 'scene') { runtime.renderOnce(); updateProductionState(); }
    else if (!running) runTransientPreview(Math.max(3, life + .1));
  }
}
function emit() {
  if (!ready || optimization?.active) return;
  runtime.triggerVfx(previewChoice.vfxId || project.preview.vfxId, { x: runtime.player.x + 130, y: runtime.player.y - 60 });
  if (!running && tab === 'map' && mapView === 'scene') { runtime.renderOnce(); updateProductionState(); }
  else if (!running) runTransientPreview(Math.max(3, (project.vfx.find(vfx => vfx.id === (previewChoice.vfxId || project.preview.vfxId))?.life || 0) + .1));
  showStatus(!running && tab === 'map' ? 'VFX를 장면에 배치했습니다. 장면1틱 또는 테스트 실행으로 진행하세요.' : 'VFX 재생 시작. 1프레임 버튼으로 정지하고 한 단계씩 확인할 수 있습니다.');
}
function decodedDimensions() {
  const dimensions = Object.fromEntries(imageDimensions);
  for (const [src, asset] of runtime?.assets || []) if (asset.status === 'ready' && asset.image) {
    dimensions[src] = { width: asset.image.naturalWidth || asset.image.width, height: asset.image.naturalHeight || asset.image.height };
  }
  return dimensions;
}
async function startOptimizationPreview(scenario, settings) {
  clearTimeout(previewTimer); clearInterval(optimizationBurstTimer);
  optimizationOwnsPreview = !running || scenario === 'burst';
  if (scenario === 'burst' || !running) {
    running = false; runtime.pause(); await refreshRuntime();
    if (!optimization?.starting) return {};
    running = true; renderTree(); renderInspector(); updateMode(); runtime.start(); runtime.followCharacter();
  }
  runtime.setInputEnabled(scenario === 'live');
  const vfxId = previewChoice.vfxId || project.preview.vfxId;
  if (scenario === 'burst') {
    const vfx = project.vfx.find(effect => effect.id === vfxId);
    const burst = () => {
      for (let index = 0; index < settings.concurrentBursts; index++) runtime.triggerVfx(vfxId, { x: runtime.player.x + 130, y: runtime.player.y - 60 });
    };
    burst(); optimizationBurstTimer = setInterval(burst, (vfx.life + 1 / 60) * 1000);
  }
  return { vfxId: scenario === 'burst' ? vfxId : null, assetsReady: runtime.stats.assetErrors === 0,
    effectCounts: Object.fromEntries(project.vfx.map(effect => [effect.id, effect.count])),
    inputEnabled: scenario === 'live', effectIntervalSeconds: scenario === 'burst' ? project.vfx.find(effect => effect.id === vfxId).life + 1 / 60 : null };
}
function stopOptimizationPreview() {
  clearInterval(optimizationBurstTimer); optimizationBurstTimer = null;
  if (optimizationOwnsPreview) { running = false; runtime?.pause(); }
  optimizationOwnsPreview = false;
  if (store) { renderTree(); renderInspector(); updateMode(); }
}
function applyOptimizationRecommendation(tip) {
  if (running || optimization?.active) return;
  const next = clone(project);
  if (!applyRecommendation(next, tip)) { showStatus('추천값이 현재 프로젝트와 다릅니다. 다시 확인하세요.', true); optimization.refresh(); return; }
  store.replace(next, `VFX 장식 입자 ${tip.from}→${tip.to} 최적화`);
}
function runTransientPreview(seconds) {
  clearTimeout(previewTimer); runtime.setInputEnabled(false); runtime.resume();
  previewTimer = setTimeout(() => { if (!running) { runtime.pause(); runtime.renderOnce(); } }, seconds * 1000);
}

$('search').addEventListener('input', renderTree);
for (const button of document.querySelectorAll('[data-tab]')) button.addEventListener('click', () => {
  const group = button.dataset.tab;
  if (group === 'world') {
    if (!ready || worldPanel?.loading) return;
    optimization?.stop('지역 시험으로 측정 종료'); clearTimeout(previewTimer);
    running = false; runtime.pause(); tab = 'world';
    worldPanel.activate().catch(error => showStatus(error.message, true)); return;
  }
  if (worldPanel?.active) { worldPanel.deactivate(); refreshRuntime().catch(error => showStatus(error.message, true)); }
  if (group === 'sourceScene') { selected = { group: 'map', id: 'map' }; tab = 'sourceScene'; renderTree(); renderInspector(); updateMode(); return; }
  if (group === 'terrainScene') {
    const node=project.terrainScene?.nodes[0];
    if(node)selectResource('terrainNodes',node.id);
    else {selected={group:'map',id:'map'};tab='terrainScene';renderTree();renderInspector();updateMode();}
    return;
  }
  if (group === 'rigScene') {
    const node = project.rigScene?.nodes[0];
    if (node) selectResource('rigNodes', node.id);
    else { selected = { group: 'map', id: 'map' }; tab = 'rigScene'; renderTree(); renderInspector(); updateMode(); }
    return;
  }
  selectResource(group, group === 'map' ? 'map' : previewChoice[{ characters: 'characterId', skills: 'skillId', vfx: 'vfxId' }[group]] || project[group][0].id);
});
$('undo').addEventListener('click', () => { if (!running) { if (tab === 'world') worldPanel?.undo(); else store.undo(); } }); $('redo').addEventListener('click', () => { if (!running) { if (tab === 'world') worldPanel?.redo(); else store.redo(); } });
$('source-execution-open').addEventListener('click', () => sourceScenePanel?.open());
for (const [id,dx,dy] of [['source-walk-west',-10,0],['source-walk-north',0,-10],['source-walk-south',0,10],['source-walk-east',10,0]]) $(id).addEventListener('click', () => { if (running) return; if (runtime.sourcePreviewReady) runtime.moveSourcePreview(dx,dy); else if (runtime.sourceSceneReady) runtime.moveSource(dx,dy); updateSourceState(); });
for (const direction of ['west', 'north', 'south', 'east']) $(`source-play-${direction}`).addEventListener('click', () => {
  if (!running || tab !== 'sourceScene') return;
  runtime.setMoveInput(runtime.moveInputDirection === direction ? null : direction); updateSourceState();
});
$('source-input-stop').addEventListener('click', () => { runtime?.setMoveInput(null); updateSourceState(); });
document.addEventListener('focusin', event => {
  if (runtime?.moveInputDirection && event.target !== $('runtime-canvas') && !$('source-play-controls').contains(event.target) && !$('map-move-controls').contains(event.target)) {
    runtime.clearInput(); updateSourceState(); updateProductionState();
  }
});
for (const view of ['scene','edit']) $(`map-view-${view}`).addEventListener('click', () => {
  if (running) return;
  mapView = view; runtime?.clearInput(); updateMode();
});
for (const direction of ['west','north','south','east']) $(`map-move-${direction}`).addEventListener('click', () => {
  if (!ready || tab !== 'map' || mapView !== 'scene') return;
  if (running) runtime.setMoveInput(runtime.moveInputDirection === direction ? null : direction);
  else if (!runtime.walkMap(direction)) showStatus('발 충돌로 이동이 차단되었습니다.', true);
  updateProductionState();
});
$('map-input-stop').addEventListener('click', () => { runtime?.clearInput(); updateProductionState(); });
$('preview-combination-save').addEventListener('click', () => {
  if (running || tab === 'world') return;
  const combination = clone(previewChoice);
  store.change('현재 실행 조합 저장', next => { next.preview = combination; });
  showStatus('현재 캐릭터·스킬·VFX 조합을 제작 프로젝트에 기록했습니다. 저장하면 재열기 후 유지됩니다.');
});
$('project-copy').addEventListener('click', () => {
  if (running || tab === 'world') return;
  const sourceId = project.id;
  store.change('제작 작업 사본 만들기', next => {
    next.id = `fdg_${crypto.randomUUID()}`;
    next.name = 'EXODUSER · 제작 작업 사본';
    next.provenance = { ...next.provenance, authoringSourceProjectId: sourceId };
  });
  showStatus('별도 ID의 제작 사본을 만들었습니다. 현재 실행 조합을 기록하고 저장하세요.');
});
$('source-delta-import').addEventListener('click', () => { if (!running) $('source-delta-file').click(); });
$('source-delta-file').addEventListener('change', async () => {
  const file = $('source-delta-file').files[0], before = project;
  try {
    if (!file || running || !before.sourcePreview?.collisionPreview) return;
    if (file.size > LIMITS.fileBytes) throw new Error('추가 자료는 UTF-8 4MiB 이하로 입력하세요.');
    const delta = await file.text(); if (running || before !== project) throw new Error('장면이 바뀌어 추가 자료 적용을 취소했습니다.');
    const scope = { ...clone(before.sourcePreview.collisionPreview.scope), source: 'MAP/ch1-1.hand-colliders.execution-v6.json + MAP/ch1-1.hand-meta-two-types.delta-v7.json', authoredBy: 'FDG Studio explicit v7 delta import' };
    const result = applyMapSourceHandColliderDelta(captureSceneProject(), { delta, scope });
    if (!result.ok) throw new Error([...result.errors, ...result.pending.map(entry => entry.reason)].join('\n'));
    store.replace(result.candidateProject, '원본 수동 충돌 추가 자료 적용');
    showStatus('수동 배치 충돌14영역 연결. 전체 오브젝트 결합은 대기 상태입니다.');
  } catch (error) { showStatus(`추가 자료 적용 실패: ${error.message}`, true); }
  finally { $('source-delta-file').value = ''; }
});
$('source-height-apply').addEventListener('click', () => {
  if (running || !(project.sourceScene||project.sourcePreview?.heightPreview)) return;
  const scalePx=Number($('source-height-scale').value),offsetPx=Number($('source-height-offset').value);
  if (!$('source-height-scale').value || !$('source-height-offset').value || !Number.isFinite(scalePx) || scalePx<=0 || !Number.isFinite(offsetPx) || offsetPx<0 || scalePx+offsetPx>1024) return showStatus('엔진 환산은 양수 배율·0 이상 오프셋·합계 1024px 이하를 명시하세요.',true);
  const next=captureSceneProject();
  if(next.sourcePreview?.heightPreview){
    Object.assign(next.sourcePreview.heightPreview.heightMapping,{scalePx,offsetPx,authoredBy:'FDG Studio explicit height edit'});
    next.sourcePreview.provenance.heightEngineAuthoredInputSnapshot={heightMapping:clone(next.sourcePreview.heightPreview.heightMapping),movement:clone(next.sourcePreview.heightPreview.movement)};
    const [x,y]=next.sourcePreview.actor.position, ground=sampleSourcePreviewHeight(next.sourcePreview,x,y,{validated:true});
    next.sourcePreview.provenance.heightRuntimeObservation={worldPx:[x,y],logicalHeight:ground.logicalHeight,engineFootZ:ground.engineFootZ,
      ramp:ground.ramp,bandBlocks:ground.bandBlocks,observedBy:'fdg-source-preview-height-v1',sourcePhysicalZClaim:false};
    if(next.sourcePreview.camera.follow)next.sourcePreview.camera.y=Math.max(0,Math.min(8000,y-ground.engineFootZ));
  }else{
    Object.assign(next.sourceScene.height.heightMapping,{scalePx,offsetPx,authoredBy:'FDG Studio explicit height edit'});
    const ground=sampleSourceHeight(next.sourceScene,next.sourceScene.actor.position[0],next.sourceScene.actor.position[1],{validated:true});
    next.sourceScene.actor.position[2]=ground.height;
  }
  try { store.replace(next,'엔진 높이 환산 수정 · 원본 논리값 유지'); } catch(error) {showStatus(error.message,true);}
});
$('save').addEventListener('click', save); $('import').addEventListener('click', () => { if (!running) $('file-input').click(); });
$('file-input').addEventListener('change', () => importFile($('file-input').files[0]));
$('export').addEventListener('click', () => { if (tab === 'world') { worldPanel?.export(); return; } if (validate().ok) { download(captureSceneProject(), `${project.id.replace(/[^a-z0-9_-]/gi, '_')}.fdg.json`); showStatus('FDG 프로젝트 JSON을 내보냈습니다.'); } else showStatus('내보내기 전에 검증 오류를 해결하세요.', true); });
$('legacy-export').addEventListener('click', () => { if (!validate().ok) return showStatus('FIXED_MAP 초안 내보내기 전에 검증 오류를 해결하세요.', true); try { download(exportFixedMap(project.map), 'fdg-fixed-map-draft.json'); showStatus('FIXED_MAP 초안 내보내기 완료. 본편 적용에는 stage geometry 브리지가 필요합니다.'); } catch (error) { showStatus(error.message, true); } });
$('play').addEventListener('click', togglePlay); $('validate').addEventListener('click', () => { const result = validate(); renderMap(); showStatus(result.ok ? '기술 검증 통과. 본편 환경의 시각 승인은 별도입니다.' : result.errors[0], !result.ok); });
$('grid').addEventListener('change', () => renderMap()); $('route').addEventListener('change', () => renderMap());
$('cast').addEventListener('click', cast); $('emit').addEventListener('click', emit);
$('step').addEventListener('click', () => { if (ready && !running) { clearTimeout(previewTimer); runtime.pause(); runtime.step(1 / 60); runtime.renderOnce(); } });
$('focus-player').addEventListener('click', () => { runtime?.followCharacter(); runtime?.renderOnce(); });
$('direction').addEventListener('change', () => { runtime?.setDirection($('direction').value); prepareCharacterPreview(); });
$('animation').addEventListener('change', () => { runtime?.setAnimation($('animation').value); animationSeconds = 0; renderInspector(); prepareCharacterPreview(); });
$('frame').addEventListener('input', () => { animationPlaying = false; setText($('animate'), '▶ 애니메이션'); renderCharacter(0); });
$('animate').addEventListener('click', () => {
  animationPlaying = !animationPlaying;
  if (animationPlaying) {
    const ch = project.characters.find(item => item.id === previewChoice.characterId) || project.characters[0];
    const anim = selected.group === 'characterDrafts' ? { frames: 24, fps: 24 } : ch.animations[$('animation').value] || ch.animations.idle;
    const index = Number($('frame').value); animationSeconds = index >= anim.frames - 1 ? 0 : index / anim.fps;
  }
  setText($('animate'), animationPlaying ? '⏸ 애니메이션' : '▶ 애니메이션');
});
$('character-view').addEventListener('change', () => renderCharacter(0));
$('character-zoom').addEventListener('change', () => { if ($('character-zoom').value === '1') detailCenter = { x: .5, y: .5 }; renderCharacter(0); });
charCanvas.addEventListener('click', event => {
  const bounds = charCanvas.getBoundingClientRect(), x = (event.clientX - bounds.left) / bounds.width * charCanvas.width, y = (event.clientY - bounds.top) / bounds.height * charCanvas.height;
  if (selected.group !== 'characterDrafts') {
    const thumb = characterThumbnails.find(cell => x >= cell.x && x <= cell.x + cell.width && y >= cell.y && y <= cell.y + cell.height);
    if (thumb) { animationPlaying = false; $('frame').value = String(thumb.index); setText($('animate'), '▶ 애니메이션'); }
    else if (characterPreviewLayout && Number($('character-zoom').value) > 1 && y < characterPreviewLayout.viewport.height) {
      const layout = characterPreviewLayout;
      detailCenter = { x: Math.max(0, Math.min(1, detailCenter.x + (x - layout.center.x) / layout.width)), y: Math.max(0, Math.min(1, detailCenter.y + (y - layout.center.y) / layout.height)) };
    }
    renderCharacter(0); return;
  }
  const mainHeight = charCanvas.height - 125, thumbStart = (charCanvas.width - 12 * 74) / 2;
  if (y >= mainHeight + 25 && y < mainHeight + 105 && x >= thumbStart && x < thumbStart + 12 * 74) {
    const col = Math.floor((x - thumbStart) / 74), row = Math.floor((y - mainHeight - 25) / 44);
    if (row < 2) { animationPlaying = false; $('frame').value = String(row * 12 + col); setText($('animate'), '▶ 애니메이션'); }
  } else if (y < mainHeight) {
    const draft = currentResource(), useReference = $('character-view').value === 'reference' && referenceImage;
    const sw = useReference ? referenceImage.naturalWidth : draft.clip.frameWidth, sh = useReference ? referenceImage.naturalHeight : draft.clip.frameHeight;
    const scale = Math.min((charCanvas.width - 28) / sw, (mainHeight - 12) / sh) * Number($('character-zoom').value);
    detailCenter = { x: Math.max(0, Math.min(1, detailCenter.x + (x - charCanvas.width / 2) / (sw * scale))), y: Math.max(0, Math.min(1, detailCenter.y + (y - mainHeight / 2) / (sh * scale))) };
  }
  renderCharacter(0);
});
$('apply-24fps').addEventListener('click', () => {
  if (running) return;
  store.change('캐릭터 24FPS 적용', next => {
    next.characterQuality = { frames: 24, fps: 24 };
    for (const ch of next.characters) { ch.sprite.fps = 24; for (const animation of Object.values(ch.animations)) animation.fps = 24; }
  });
  showStatus('캐릭터 재생 속도24FPS 적용. 실제 원본 장수는 보존하고 부족한 클립을 진단에 표시합니다.');
});
$('sync-character-drafts').addEventListener('click', () => {
  if (running) return;
  store.change('신규 캐릭터 제작 자료 연결', next => {
    next.characterDrafts ||= [];
    for (const draft of createCharacterDrafts()) if (!next.characterDrafts.some(item => item.id === draft.id)) next.characterDrafts.push(draft);
    next.characterQuality = { frames: 24, fps: 24 };
  });
  const first = project.characterDrafts?.[0]; if (first) selectResource('characterDrafts', first.id);
  showStatus('변성술사·헬 헌터·아케인 랜서의 기존 원화와24장 참고 모션을 연결했습니다.');
});
$('duplicate').addEventListener('click', () => {
  if (running || selected.group === 'map' || selected.group === 'rigNodes' || selected.group === 'terrainNodes') return;
  const id = `draft_${crypto.randomUUID()}`, group = selected.group;
  try { store.change('리소스 복제', next => { const resource = clone(currentResource()); resource.id = id; resource.name += ' 사본'; next[group].push(resource); }); selectResource(group, id); }
  catch (error) { showStatus(error.message, true); }
});
$('inspector-fields').addEventListener('submit', event => event.preventDefault());
window.addEventListener('keydown', event => {
  if (event.key === 'Escape' && running) { event.preventDefault(); togglePlay(); return; }
  const editing = event.target instanceof HTMLElement && (['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName) || event.target.isContentEditable);
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') { event.preventDefault(); save(); return; }
  if (editing || running || !store) return;
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); const history = tab === 'world' ? worldPanel : store; if (event.shiftKey) history.redo(); else history.undo(); }
});
window.addEventListener('beforeunload', event => { runtime?.pause(); if (dirty || worldPanel?.dirty) { event.preventDefault(); event.returnValue = ''; } });
window.addEventListener('pagehide', event => {
  workspaceLayout.suspend();
  if (animationRaf !== null) cancelAnimationFrame(animationRaf); animationRaf = null;
  clearTimeout(previewTimer); clearInterval(optimizationBurstTimer);
  if (event.persisted) { optimization?.stop('페이지 보관'); runtime?.pause(); running = false; }
  else { workspaceLayout.dispose(); worldCameraPanel?.dispose(); productionPanel?.dispose(); optimization?.dispose(); rigScenePanel?.dispose(); terrainScenePanel?.dispose(); sourceScenePanel?.dispose(); worldPanel?.dispose(); runtime?.dispose(); store?.dispose(); }
});
window.addEventListener('pageshow', event => { if (event.persisted) { workspaceLayout.resume(); lastDraw = 0; if (animationRaf === null) animationRaf = requestAnimationFrame(draw); renderInspector(); updateMode(); } });
window.addEventListener('resize', () => { if (runtime && !$('runtime-canvas').hidden) { runtime.resize(); runtime.renderOnce(); } });

function draw(timestamp) {
  const dt = Math.min(.1, lastDraw ? (timestamp - lastDraw) / 1000 : 0); lastDraw = timestamp;
  if (animationPlaying) renderCharacter(dt); animationRaf = requestAnimationFrame(draw);
}
async function boot() {
  project = perspectiveAuthoring ? createPerspectiveProject() : createDefaultProject(); let restoreError = '';
  if (darkDruidAuthoring) {
    const response = await fetch(new URL(druidAuthoringFixture, import.meta.url));
    if (!response.ok) throw new Error(`다크드루이드 제작 파일 HTTP ${response.status}`);
    const candidate = await response.json(), result = validateProject(candidate, { geometry: false });
    if (!result.ok) throw new Error(result.errors[0]); project = candidate;
  }
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      if (new Blob([saved]).size > LIMITS.fileBytes) throw new Error('저장 파일이 4MB를 초과합니다.');
      const parsed = JSON.parse(saved), result = validateProject(parsed, { geometry: false });
      if (!result.ok) throw new Error(result.errors[0]); project = parsed;
    }
  } catch (error) { restoreError = `기존 FDG 로컬 저장을 복원하지 못했습니다: ${error.message}. 기본 프로젝트로 열었습니다.`; }
  previewChoice = clone(project.preview); store = new ProjectStore(project); store.signals.on('changed', changed);
  if (project.rigScene?.nodes.length) { selected = { group: 'rigNodes', id: project.rigScene.nodes[0].id }; tab = 'rigScene'; }
  if (project.provenance?.bodyAuthoring?.subject === 'boss-dark-druid-NORMAL') $('rig-sequence-preset').value = druidContactAuthoring ? 'dark-druid-slam-contact-r5' : druidSlamAuthoring ? 'dark-druid-boss-slam-r3' : 'dark-druid-body-r1';
  if (project.sourceScene || project.sourcePreview) { selected = { group: 'map', id: 'map' }; tab = 'sourceScene'; }
  setText($('project-name'), project.name); renderTree(); renderInspector(); validate(); renderMap();
  runtime = new FDGRuntime($('runtime-canvas'), runtimeProject(), {
    onStats: stats => {
      optimization?.sample(stats);
      rigScenePanel?.updateStats();
      terrainScenePanel?.updateStats();
      worldPanel?.updateStats();
      if (tab === 'sourceScene') updateSourceState();
      setText($('preview-time'), `${(stats.time || 0).toFixed(3)}초`);
      if (runtime?.state === 'running' && performance.now() - lastStats < 200) return; lastStats = performance.now();
      updateProductionState();
      const sheets = runtime?.getVfxPlaybackSnapshot() || [];
      setText($('vfx-playback-state'), sheets.length ? `활성 시트 ${sheets.length} · ${sheets.slice(0, 3).map(sheet => `${sheet.definitionId}: ${sheet.frameIndex + 1}/${sheet.frames}장 · ${sheet.fps}FPS · ${sheet.age.toFixed(3)}/${sheet.life.toFixed(3)}초 · α${sheet.alpha.toFixed(2)} · ${sheet.finished ? '마지막 셀 유지' : '단발 재생'}`).join(' / ')}${sheets.length > 3 ? ' …' : ''}` : '활성 시트 없음');
      const resource = stats.resource ?? runtime.skills?.resource ?? 0;
      setText($('stats'), `${Math.round(stats.fps || 0)} FPS · update ${(stats.updateMs || 0).toFixed(2)}ms · render ${(stats.renderMs || 0).toFixed(2)}ms · FX ${stats.particleCount || 0}/1024 · 자원 ${Math.round(resource)}`);
    },
    onError: error => { const message = error?.message || String(error); imageErrors.set(message, message); validate(); showStatus(message, true); },
  });
  rigScenePanel = new RigScenePanel({ getProject: () => project, getRuntime: () => runtime, getSelection: () => selected, isRunning: () => running, isReady: () => ready,
    change: (label, mutate, { live = false } = {}) => { rigLiveChange = live; try { store.change(label, mutate); } finally { rigLiveChange = false; } },
    select: id => selectResource('rigNodes', id), status: showStatus, loadSequence: loadRigSequencePreset, sequenceControl: controlRigSequence });
  terrainScenePanel = new TerrainScenePanel({getProject:()=>project,getRuntime:()=>runtime,getSelection:()=>selected,isRunning:()=>running,isReady:()=>ready,
    change:(label,mutate)=>{const before=project;store.change(label,mutate);return before!==project;},select:id=>selectResource('terrainNodes',id),status:showStatus,
    resetPreview:()=>refreshRuntime().catch(error=>showStatus(error.message,true))});
  worldCameraPanel = new WorldCameraPanel({ getProject: () => project, getRuntime: () => runtime,
    isRunning: () => running, isReady: () => ready, isWorld: () => tab === 'world' || !!worldPanel?.active,
    change: (label, mutate) => store.change(label, mutate), status: showStatus });
  renderInspector();
  await runtime.load(); runtime.pause(); ready = true; $('loading').hidden = true; updateMode(); validate();
  worldPanel = new WorldPanel({ getProject: () => project, getRuntime: () => runtime, isRunning: () => running,
    status: showStatus, download, downloadSerialized, serialize, pause: () => { running = false; runtime.pause(); },
    refreshUI: () => { renderTree(); renderInspector(); validate(); updateMode(); } });
  sourceScenePanel = new SourceScenePanel({ getProject: () => project,
    pause: () => { running = false; runtime.pause(); }, status: showStatus,
    refreshUI: () => { updateMode(); },
    installScene: async (candidate, { isCurrent }) => {
      const prepared = await runtime.prepareSourceScene(candidate);
      try {
        if (!isCurrent()) throw new Error('입력이 변경되거나 검토 창이 닫혀 장면 연결을 취소했습니다.');
        worldPanel?.deactivate(); selected = { group: 'map', id: 'map' }; tab = 'sourceScene';
        rigLiveChange = true;
        try { store.replace(candidate, 'CH1-1 원본 실행 장면 연결'); } finally { rigLiveChange = false; }
        await refreshRuntime();
      } finally { prepared.release(); }
    },
    installPreview: async (inspection, engineAuthored, { isCurrent }) => {
      const approved = inspection.approved9.map(item => item.canonicalAbsolutePath);
      const observed = await runtime.observeSourceImages(engineAuthored.resourceBindings, approved);
      let prepared;
      try {
        if (!isCurrent()) throw new Error('입력이 변경되어 연결을 취소했습니다.');
        const result = createMapSourcePreview(inspection, { previewProject: project, observations: observed.observations, engineAuthored });
        if (!result.ok || !result.candidateProject) throw new Error(result.errors.join('\n') || '제작 미리보기 입력이 미확정입니다.');
        prepared = await runtime.prepareSourcePreview(result.candidateProject);
        if (!isCurrent()) throw new Error('입력이 변경되거나 창이 닫혀 연결을 취소했습니다.');
        worldPanel?.deactivate(); selected = { group: 'map', id: 'map' }; tab = 'sourceScene';
        rigLiveChange = true;
        try { store.replace(result.candidateProject, 'CH1-1 원본 이미지 제작 미리보기 · UNADOPTED'); } finally { rigLiveChange = false; }
        await refreshRuntime();
      } finally { prepared?.release(); observed.release(); }
    } });
  await prepareCharacterPreview(); animationRaf = requestAnimationFrame(draw);
  optimization = new OptimizationPanel({ getProject: () => project, getImages: decodedDimensions, getRuntime: () => runtime,
    canStart: () => ready && tab !== 'world' && validation?.ok && !project.terrainScene && !project.sourceScene && !project.sourcePreview && selected.group !== 'characterDrafts' && runtime.stats.assetErrors === 0,
    canApply: () => ready && !running, startPreview: startOptimizationPreview, stopPreview: stopOptimizationPreview,
    apply: applyOptimizationRecommendation, download, status: showStatus });
  optimization.refresh();
  productionPanel = new ProductionPanel({ snapshot: () => ({ project, validation, assetReady: ready, assetErrors: [...imageErrors.values()], preview: previewChoice, profile: optimization?.measurement }),
    navigate: target => {
      if (running) togglePlay();
      if (target === 'optimization') { $('optimization-panel').open = true; return; }
      const id = target === 'map' ? 'map' : previewChoice[{characters:'characterId',skills:'skillId',vfx:'vfxId'}[target]] || project[target][0]?.id;
      if (id) selectResource(target, id);
    }, download });
  updateProductionState();
  showStatus(restoreError || (druidContactAuthoring ? '다크드루이드 내려찍기 접촉 동작 · 동작 선택에서 재생하세요.' : druidSlamAuthoring ? '전신 내려찍기 동작 제작 · 실제 보스전 검증은 대기 중입니다.' : '개발 중인 제작 도구 · 리소스를 선택하고 속성에서 편집하세요.'), !!restoreError);
  // Read-only QA handle; tests use the same public state as the visible editor.
  Object.defineProperty(window, 'FDGStudio', { value: Object.freeze({
    get project() { return store.project; }, get validation() { return clone(validation); }, get runtime() { return runtime; }, get running() { return running; },
    get selected() { return { ...selected }; }, storageKey,
    get characterInspection() { return qualityInspection ? clone(qualityInspection) : null; },
    get optimizationReport() { return optimization?.snapshot() || null; },
    get sceneProject() { return captureSceneProject(); }, get rigScene() { return runtime.getRigSceneSnapshot(); },
    get worldProject() { return worldPanel?.capture() || null; }, worldStorageKey: WORLD_STORAGE_KEY,
    get lifecycle() { return { editorRaf: animationRaf !== null, panelListeners: rigScenePanel.listeners.length + rigScenePanel.inspectorListeners.length }; },
  }), configurable: false });
}
boot().catch(error => { $('loading').hidden = true; showStatus(`초기화 실패: ${error.message}`, true); setText($('validation-badge'), 'LOAD ERROR'); $('validation-badge').classList.add('error'); });
