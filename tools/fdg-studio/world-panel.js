import { createWorldFixture, WorldProjectStore, validateWorldProject, WORLD_LIMITS } from '../../engine/fdg/world-project.js?v=0.8.2';
import { WorldRuntime } from '../../engine/fdg/world-runtime.js?v=0.8.2';
import { attachFixtureWaypoints } from '../../engine/fdg/world-waypoints.js?v=0.8.2';
import { WorldMapView } from './world-map-view.js?v=0.8.3';

const $ = id => document.getElementById(id);
const text = (node, value) => { if (node.children.length) throw new Error('Text target must be a leaf'); node.textContent = String(value); };
export const WORLD_STORAGE_KEY = 'fdg.studio.world.v1';
const reasons = { 'gate-closed': '진행 관문이 닫혀 있습니다. 출구 밖으로 나온 뒤 관문을 열고 다시 접근하세요.', 'disabled': '이 연결은 비활성 상태입니다.', 'unresolved-scene': '장면 리소스 연결 대기 · 원본 맵 등록 0', 'unresolved-arrival': '도착 XYZ 연결 대기', 'unsupported-scene': '현재 지역 소비자는 CPU 입체 지형만 지원합니다.', 'entry-failed': '장면 진입 실패', 'visit-limit': '방문 횟수 한도', 'not-open': '시험 프로젝트를 먼저 연결하세요.', 'undiscovered': '미발견 · 같은 지역에서 발견 반경 안으로 이동하세요.', 'inactive': '미활성 · 활성 반경 안에서 활성화하세요.', 'out-of-range': '활성 반경 밖 · 실제 이동으로 접근하세요.', 'already-active': '이미 활성화된 웨이포인트입니다.', 'wrong-area': '해당 지역에서 활성화하세요.', 'no-route': '현재 지역에서 연결 경로가 없습니다.', 'disabled-route': '연결 경로가 비활성 상태입니다.', 'unknown-waypoint': '등록된 웨이포인트가 없습니다.', 'arrival-blocked': '도착 위치의 지형 또는 바닥을 통과할 수 없습니다.' };

export class WorldPanel {
  constructor({ getProject, getRuntime, isRunning, status, refreshUI, download, downloadSerialized, serialize, pause }) {
    Object.assign(this, { getProject, getRuntime, isRunning, status, refreshUI, download, downloadSerialized, serialize, pause });
    this.store = null; this.controller = null; this.active = false; this.dirty = false;
    this.mapView = new WorldMapView({ select: areaKey => { this.selection = areaKey; this.refreshUI(); }, pause: () => this.pause(), changed: () => this.refreshUI() });
    this.waypointSelection = null; this.exchangeFilename = 'world.fdg-world.json';
    this.listeners = []; this.selection = null; this._live = false; this._generation = 0; this._markers = '';
    const listen = (id, event, fn) => { const node = $(id); node.addEventListener(event, fn); this.listeners.push(() => node.removeEventListener(event, fn)); };
    listen('world-create', 'click', () => this.create());
    listen('world-area', 'change', () => { this.selection = $('world-area').value; this.refreshUI(); });
    listen('world-gate', 'change', () => {
      const key = $('world-gate').dataset.key;
      if (!this.controller?.setProgress(key, $('world-gate').checked)) this.refresh();
    });
    for (const direction of ['west', 'north', 'south', 'east']) listen(`world-walk-${direction}`, 'click', () => this.walk(direction));
    listen('world-waypoint-add', 'click', () => this.edit('시험 웨이포인트 연결', next => Object.assign(next, attachFixtureWaypoints(next))));
    listen('world-waypoint', 'change', () => { this.waypointSelection = $('world-waypoint').value; this._waypointHud(); });
    listen('world-waypoint-activate', 'click', () => this.activateWaypoint());
    listen('world-waypoint-travel', 'click', () => this.travelWaypoint());
    listen('world-json-review', 'click', () => this.reviewJSON());
    listen('world-json-close', 'click', () => $('world-json-dialog').close());
    listen('world-json-dialog', 'close', () => this.refreshUI());
    listen('world-json-apply', 'click', () => this.applyJSON());
    listen('world-json-download', 'click', () => {
      try { const result = this.readJSON(); this.downloadSerialized(result); text($('world-json-result'), `이 UTF-8 JSON ${result.byteLength} bytes의 파일 저장을 요청했습니다.`); }
      catch (error) { text($('world-json-result'), error.message); }
    });
    try {
      const saved = localStorage.getItem(WORLD_STORAGE_KEY);
      if (saved) {
        if (new TextEncoder().encode(saved).byteLength > WORLD_LIMITS.fileBytes) throw new Error('지역 저장이 8MiB를 초과합니다.');
        this._install(JSON.parse(saved)); this.dirty = false;
      }
    } catch (error) { this.status(`지역 프로젝트 복원 실패: ${error.message}`, true); }
  }
  get project() { return this.store?.project || null; }
  get viewOpen() { return !!this.mapView.mode || $('world-json-dialog').open; }
  get playable() { return this.canMove() && !this.viewOpen; }
  get loading() { return !!this.controller?.busy; }
  get canUndo() { return !!this.store?.canUndo; }
  get canRedo() { return !!this.store?.canRedo; }
  renderTree() {
    const world = this.project, fragment = document.createDocumentFragment(), query = $('search').value.toLocaleLowerCase();
    const section = document.createElement('section'); section.className = 'tree-group';
    const heading = document.createElement('h2'); heading.className = 'tree-heading'; text(heading, '지역 · 속성 편집'); section.append(heading);
    for (const area of world?.areas || []) {
      if (query && !`${area.name} ${area.areaKey}`.toLocaleLowerCase().includes(query)) continue;
      const button = document.createElement('button'); button.className = 'resource-row';
      if (this.selection === area.areaKey) button.classList.add('active');
      const icon = document.createElement('span'); icon.className = 'resource-icon'; text(icon, area.areaKey === world.state.activeAreaKey ? '●' : '⇄');
      const label = document.createElement('span'); text(label, area.name); button.append(icon, label);
      button.addEventListener('click', () => { this.selection = area.areaKey; this.refreshUI(); }); section.append(button);
    }
    fragment.append(section);
    const scenes = document.createElement('section'); scenes.className = 'tree-group';
    const title = document.createElement('h2'); title.className = 'tree-heading'; text(title, '참조 장면'); scenes.append(title);
    for (const scene of world?.scenes || []) {
      if (query && !`${scene.name} ${scene.id}`.toLocaleLowerCase().includes(query)) continue;
      const row = document.createElement('p'); row.className = 'resource-row'; text(row, `${scene.name} · ${scene.project?.terrainScene ? 'CPU 지형' : scene.project ? '미지원 형식' : '연결 대기'}`); scenes.append(row);
    }
    fragment.append(scenes); $('resource-tree').replaceChildren(fragment); $('duplicate').disabled = true;
  }
  _install(project) {
    const result = validateWorldProject(project);
    if (!result.ok) throw new Error(result.errors.join('\n'));
    this.controller?.dispose(); this.controller = null; this.store?.dispose();
    this.store = new WorldProjectStore(project);
    this.selection = project.state.activeAreaKey;
    this.store.signals.on('changed', () => {
      this.dirty = true;
      if (this._live) { this.refreshUI(); this._updateMarkers(); }
      else if (this.active) this._open().catch(error => this.status(error.message, true));
      else this.refreshUI();
    });
  }
  async create() {
    if (this.isRunning() || this.loading) return;
    try {
      this._install(createWorldFixture(this.getProject())); this.dirty = true;
      if (this.active) await this._open();
      this.status('ENGINE_FIXTURE · 두 지역 시험 생성. 동쪽 출구의 진행 관문은 닫혀 있습니다.');
      this.refreshUI();
    } catch (error) { this.status(error.message, true); }
  }
  async import(project) {
    if (this.loading) throw new Error('지역 전환을 마친 뒤 불러오세요.');
    this._install(project); this.dirty = true;
    if (this.active) await this._open();
    this.refreshUI();
  }
  async activate() { if (this.active) { this.refreshUI(); return; } this.active = true; this.pause(); if (this.store) await this._open(); this.refreshUI(); }
  deactivate() {
    this._generation++; this.pause();
    if (this.controller && !this.controller.busy) {
      this._live = true; try { this.store.replace(this.controller.capture(), '지역 이동 상태 보관'); } finally { this._live = false; }
    }
    this.active = false; this.controller?.dispose(); this.controller = null;
    this._markers = ''; this.getRuntime().setSceneExits([]);
  }
  async _open() {
    const generation = ++this._generation;
    this.pause(); this.controller?.dispose(); this._markers = '';
    this.controller = new WorldRuntime(this.getRuntime(), this.store.project, {
      onChange: (world, event) => {
        this._live = true;
        try { this.store.replace(world, `지역 ${event.type}`); } finally { this._live = false; }
        if (['transition', 'open', 'waypoint-travel'].includes(event.type)) this.pause();
      },
      onStatus: result => {
        const success = result.waypointId ? `웨이포인트 · ${result.waypointId}` : result.waypointIds?.length ? `웨이포인트 발견 · ${result.waypointIds.join(', ')}` : result.regionAreaKey ? `지역 상태 변경 · ${result.regionAreaKey}` : result.key ? `진행 입력 · ${result.key}=${result.value}` : `지역 연결 · ${result.areaKey}`;
        this.status(result.ok ? success : `${reasons[result.reason] || result.reason}${result.detail ? ': ' + result.detail : ''}`, !result.ok);
      },
    });
    this.refreshUI();
    await this.controller.open({ restore: true });
    if (generation !== this._generation || !this.active) return;
    this._updateMarkers(); this.refreshUI();
  }
  _updateMarkers() {
    if (!this.canMove()) return;
    const world = this.controller.getViewState(), area = world.areas.find(value => value.areaKey === world.state.activeAreaKey);
    const markers = area.exits.map(exit => {
      const transition = world.transitions.find(value => value.id === exit.transitionId);
      return { ...exit, open: transition.enabled && (transition.gateKey === null || world.progress[transition.gateKey]) };
    });
    const signature = JSON.stringify({ area: area.areaKey, markers });
    if (signature !== this._markers) { this._markers = signature; this.getRuntime().setSceneExits(markers); }
  }
  updateStats() {
    if (!this.active || !this.controller) return;
    const result = this.controller.observe();
    if (result instanceof Promise) result.then(() => { if (this.active) { this._updateMarkers(); this.refreshUI(); } });
    this._hud();
  }
  _hud() {
    const world = this.controller?.getViewState() || this.project;
    if (!world) { text($('world-state'), '두 지역 시험을 생성하세요'); return; }
    const areaKey = world.state.activeAreaKey, region = world.state.regions[areaKey];
    const player = this.canMove() ? this.getRuntime().player : null;
    const xyz = player ? ` · X ${player.x.toFixed(1)} Y ${player.y.toFixed(1)} Z ${(player.z || 0).toFixed(1)}` : '';
    text($('world-state'), `${areaKey} · 방문 ${region?.visits || 0}${xyz}`);
    const events = this.controller?.events || [], latest = events.at(-1);
    this._waypointHud();
    this.mapView.update(world, this.canMove() ? this.getRuntime() : null, this.active, this.selection);
    text($('world-events'), latest ? `#${latest.sequence} ${latest.type} · ${latest.transitionId || latest.waypointId || latest.waypointIds?.join(', ') || latest.areaKey} · ${latest.reason || '통과'}` : '연결 대기');
  }
  refresh() {
    const world = this.project, active = this.active, busy = this.loading;
    const list = $('world-area'), fragment = document.createDocumentFragment();
    for (const area of world?.areas || []) { const option = document.createElement('option'); option.value = area.areaKey; text(option, area.name); fragment.append(option); }
    list.replaceChildren(fragment); list.value = this.selection || world?.state.activeAreaKey || '';
    list.disabled = !world || busy || this.isRunning();
    $('world-create').disabled = busy || this.isRunning();
    const key = Object.keys(world?.progress || {})[0]; $('world-gate').dataset.key = key || '';
    $('world-gate').checked = key ? world.progress[key] : false;
    $('world-gate').disabled = !active || !key || busy || this.isRunning() || !this.controller;
    text($('world-gate-label'), key || '진행 키 없음');
    for (const direction of ['west', 'north', 'south', 'east']) $(`world-walk-${direction}`).disabled = !this.canMove() || this.isRunning() || this.viewOpen;
    const waypointList = $('world-waypoint'), waypointFragment = document.createDocumentFragment();
    for (const point of world?.waypoints || []) {
      const state = world.state.waypoints?.[point.id], option = document.createElement('option'); option.value = point.id;
      text(option, `${point.name} · ${state?.active ? '활성' : state?.discovered ? '발견' : '미발견'}`); waypointFragment.append(option);
    }
    waypointList.replaceChildren(waypointFragment);
    if (!(world?.waypoints || []).some(point => point.id === this.waypointSelection)) this.waypointSelection = world?.waypoints?.[0]?.id || null;
    waypointList.value = this.waypointSelection || ''; waypointList.disabled = !active || busy || this.isRunning();
    $('world-waypoint-add').hidden = !!world?.waypoints || world?.scope !== 'ENGINE_FIXTURE';
    $('world-waypoint-add').disabled = !active || busy || this.isRunning();
    for (const id of ['world-map-toggle', 'world-graph-toggle', 'world-json-review']) $(id).disabled = !world || busy;
    this._hud();
    text($('world-scope'), world ? `${world.scope} · 본편 지역 등록 0` : '독립 지역 프로젝트');
    $('world-empty').hidden = !active || this.canMove();
    text($('world-empty'), world ? (reasons[this.controller?.latestResult.reason] || '지역 장면 준비 중…') : '「두 지역 시험」으로 출입구 이동과 지역 저장을 시험하세요.');
  }
  canMove() { return this.active && !!this.controller && !this.controller.busy && this.controller.opened && !this.controller.disposed; }
  async walk(direction) {
    if (!this.canMove() || this.isRunning() || this.viewOpen) return;
    this.dirty = true;
    const result = await this.controller.walk(direction);
    this._updateMarkers(); this.refreshUI();
    if (!result.ok && reasons[result.reason]) this.status(reasons[result.reason], true);
  }
  _waypointHud() {
    const status = this.controller?.waypointStatus(this.waypointSelection);
    $('world-waypoint-activate').disabled = !status?.canActivate || this.isRunning() || this.viewOpen;
    $('world-waypoint-travel').disabled = !status?.canTravel || this.isRunning() || this.viewOpen;
        const brief = { 'gate-closed': '진행 관문 닫힘', 'unresolved-scene': '장면 연결 대기', 'unresolved-arrival': '도착 XYZ 대기', 'arrival-blocked': '도착 지형 차단', 'no-route': '연결 경로 없음', 'disabled-route': '연결 비활성', 'unsupported-scene': '장면 형식 미지원' };
    text($('world-waypoint-state'), !status?.exists ? '웨이포인트 없음 · 시험 연결 또는 JSON 정의' : !status.discovered ? '미발견 · 같은 지역에서 발견 반경 안으로 걸어 이동하세요' : !status.active ? `발견 · 미활성 · ${status.canActivate ? '활성 범위 안 · 활성화 가능' : status.activationReason === 'wrong-area' ? '해당 지역에서 접근하세요' : '활성 반경 안으로 접근하세요'}` : `활성 · ${status.canTravel ? '이동 가능' : brief[status.travelReason] || reasons[status.travelReason] || status.travelReason}`);
  }
  activateWaypoint() {
    if (this.isRunning() || this.viewOpen || !this.canMove()) return;
    const result = this.controller.activateWaypoint(this.waypointSelection);
    if (!result.ok) this.status(reasons[result.reason] || result.reason, true);
    this.refreshUI();
  }
  async travelWaypoint() {
    if (this.isRunning() || this.viewOpen || !this.canMove()) return;
    const pending = this.controller.travelWaypoint(this.waypointSelection); this.refreshUI();
    await pending; this._updateMarkers(); this.refreshUI();
  }
  reviewJSON() {
    if (!this.store || this.loading) return;
    this.pause(); const world = this.capture(), validation = validateWorldProject(world);
    if (!validation.ok) return this.status(validation.errors[0], true);
    this.showJSON(this.serialize(world, `${world.id.replace(/[^a-z0-9_-]/gi, '_')}.fdg-world.json`));
  }
  showJSON(result) {
    this.pause(); this.exchangeFilename = result.filename;
    $('world-json-text').value = result.json;
    text($('world-json-info'), `${result.filename} · UTF-8 ${result.byteLength} bytes · 한도 8388608 bytes`);
    text($('world-json-result'), '내보낸 UTF-8 내용을 검토하고 같은 내용 또는 수정한 JSON을 불러올 수 있습니다.');
    if (!$('world-json-dialog').open) $('world-json-dialog').showModal();
    this.refreshUI();
  }
  readJSON() {
    const json = $('world-json-text').value, byteLength = new TextEncoder().encode(json).byteLength;
    if (byteLength > WORLD_LIMITS.fileBytes) throw new Error('WorldProject JSON은 UTF-8 8MiB 이하입니다.');
    const world = JSON.parse(json), result = validateWorldProject(world);
    if (!result.ok) throw new Error(result.errors[0]);
    return { json, byteLength, filename: this.exchangeFilename, world };
  }
  async applyJSON() {
    if (this.loading || this.isRunning()) return;
    try {
      const result = this.readJSON(); await this.import(result.world);
      text($('world-json-result'), `UTF-8 ${result.byteLength} bytes 재입력 완료 · ${result.world.state.activeAreaKey} · 구조 검증 통과`);
      this.status('표시한 WorldProject JSON을 불러왔습니다.');
    } catch (error) { text($('world-json-result'), `불러오기 실패: ${error.message}`); this.status(error.message, true); }
  }
  capture() { return this.controller?.capture() || this.project; }
  save() {
    if (!this.store || this.loading) return this.status('지역 프로젝트를 연결하고 전환을 마친 뒤 저장하세요.', true);
    this.pause(); const next = this.capture(), result = validateWorldProject(next);
    if (!result.ok) return this.status(result.errors[0], true);
    try {
      localStorage.setItem(WORLD_STORAGE_KEY, JSON.stringify(next));
      this._live = true; try { this.store.replace(next, '지역 프로젝트 저장'); } finally { this._live = false; }
      this.dirty = false; this.refreshUI(); this.status('지역 프로젝트 저장됨 · 독립 FDG World 저장');
    } catch (error) { this.status(`지역 저장 실패: ${error.message}`, true); }
  }
  export() {
    if (!this.store || this.loading) return;
    const world = this.capture(), result = validateWorldProject(world);
    if (!result.ok) return this.status(result.errors[0], true);
    this.showJSON(this.download(world, `${world.id.replace(/[^a-z0-9_-]/gi, '_')}.fdg-world.json`));
    this.status('독립 WorldProject JSON을 내보냈습니다.');
  }
  undo() { if (!this.loading) this.store?.undo(); }
  redo() { if (!this.loading) this.store?.redo(); }
  edit(label, mutate) {
    if (!this.store || this.loading || this.isRunning()) return;
    const next = this.capture(); mutate(next); this.store.replace(next, label);
  }
  inspector(form, field, title) {
    const world = this.project;
    if (!world) { field(form, '제작 상태', '두 지역 시험을 생성하세요', { readonly: true }); return; }
    const area = world.areas.find(value => value.areaKey === this.selection) || world.areas[0];
    const changeArea = (label, mutate) => this.edit(label, next => mutate(next.areas.find(value => value.areaKey === area.areaKey)));
    const number = (label, value, onChange, max = 8000) => field(form, label, value, { type: 'number', min: 0, max, step: .1, onChange });
    title(form, 'WORLD · INDEPENDENT PROJECT');
    field(form, '프로젝트 이름', world.name, { onChange: value => this.edit('지역 프로젝트 이름', next => { next.name = value; }) });
    field(form, '구분', world.scope, { readonly: true });
    for (const [key, value] of Object.entries(world.progress)) field(form, `진행 ${key}`, String(value), { options: [{ value: 'true', label: '충족' }, { value: 'false', label: '미충족' }], onChange: choice => {
      if (!this.controller?.setProgress(key, choice === 'true')) this.edit('진행 입력', next => { next.progress[key] = choice === 'true'; });
    } });
    field(form, 'areaKey', area.areaKey, { readonly: true });
    field(form, '지역 이름', area.name, { onChange: value => changeArea('지역 이름', target => { target.name = value; }) });
    field(form, 'stageRef', area.stageRef, { onChange: value => changeArea('원본 stage 참조', target => { target.stageRef = value; }) });
    field(form, 'sceneId', area.sceneId || '', { options: [{ value: '', label: '연결 대기' }, ...world.scenes.map(scene => ({ value: scene.id, label: scene.name }))], onChange: value => changeArea('지역 장면 연결', target => { target.sceneId = value || null; }) });
    const sceneProject = world.scenes.find(scene => scene.id === area.sceneId)?.project;
    field(form, '장면 소비 상태', sceneProject?.terrainScene ? 'CPU 지형 소비 가능' : sceneProject ? '미지원 · 현재 소비자는 CPU 지형만' : 'PENDING · 장면 데이터 없음', { readonly: true });
    for (const entry of area.entrances) {
      title(form, `ARRIVAL · ${entry.id}`);
      if (entry.position) ['X', 'Y', 'Z'].forEach((axis, i) => number(`도착 ${axis}`, entry.position[i], value => changeArea('도착 좌표', target => { target.entrances.find(item => item.id === entry.id).position[i] = value; }), i === 2 ? 1024 : 8000));
      else field(form, '도착 위치', 'PENDING · null', { readonly: true });
      if (entry.position) field(form, '도착 카메라 정책', entry.camera ? (entry.camera.follow ? 'follow' : 'fixed') : 'default', { options: [{ value: 'default', label: '장면 기본값' }, { value: 'fixed', label: '위치 고정' }, { value: 'follow', label: '플레이어 추적' }], onChange: value => changeArea('도착 카메라 정책', target => {
        const arrival = target.entrances.find(item => item.id === entry.id);
        arrival.camera = value === 'default' ? null : { x: arrival.camera?.x ?? arrival.position[0], y: arrival.camera?.y ?? arrival.position[1], follow: value === 'follow' };
      }) });
      if (entry.camera) {
        ['x', 'y'].forEach(axis => number(`도착 카메라 ${axis.toUpperCase()}`, entry.camera[axis], value => changeArea('도착 카메라', target => { target.entrances.find(item => item.id === entry.id).camera[axis] = value; })));
        field(form, '카메라 추적', String(entry.camera.follow), { options: [{ value: 'true', label: '추적' }, { value: 'false', label: '고정' }], onChange: value => changeArea('도착 카메라 추적', target => { target.entrances.find(item => item.id === entry.id).camera.follow = value === 'true'; }) });
      } else field(form, '도착 카메라', '장면 기본값 · null', { readonly: true });
    }
    for (const exit of area.exits) {
      title(form, `EXIT · ${exit.id}`);
      if (exit.position) ['X', 'Y', 'Z'].forEach((axis, i) => number(`출구 ${axis}`, exit.position[i], value => changeArea('출구 좌표', target => { target.exits.find(item => item.id === exit.id).position[i] = value; }), i === 2 ? 1024 : 8000));
      else field(form, '출구 위치', 'PENDING · null', { readonly: true });
      field(form, '출구 반경', exit.radius, { type: 'number', min: 8, max: 160, step: 1, onChange: value => changeArea('출구 감지 반경', target => { target.exits.find(item => item.id === exit.id).radius = value; }) });
      const transition = world.transitions.find(value => value.id === exit.transitionId);
      field(form, '목적지', `${transition.to.areaKey} / ${transition.to.entranceId}`, { readonly: true });
      field(form, '진행 키', transition.gateKey || '', { options: [{ value: '', label: '관문 없음' }, ...Object.keys(world.progress).map(key => ({ value: key, label: key }))], onChange: value => this.edit('전환 진행 관문', next => { next.transitions.find(item => item.id === transition.id).gateKey = value || null; }) });
      field(form, '연결 활성', String(transition.enabled), { options: [{ value: 'true', label: '활성' }, { value: 'false', label: '비활성' }], onChange: value => this.edit('지역 연결 활성', next => { next.transitions.find(item => item.id === transition.id).enabled = value === 'true'; }) });
    }
    for (const point of world.waypoints || []) if (point.areaKey === area.areaKey) {
      title(form, `WAYPOINT · ${point.id}`);
      const changePoint = (label, mutate) => this.edit(label, next => mutate(next.waypoints.find(value => value.id === point.id)));
      field(form, '웨이포인트 이름', point.name, { onChange: value => changePoint('웨이포인트 이름', target => { target.name = value; }) });
      ['X', 'Y', 'Z'].forEach((axis, i) => number(`웨이포인트 ${axis}`, point.position[i], value => changePoint('웨이포인트 좌표', target => { target.position[i] = value; }), i === 2 ? 1024 : 8000));
      field(form, '발견 반경', point.discoveryRadius, { type: 'number', min: point.activationRadius, max: 160, step: .1, onChange: value => changePoint('발견 반경', target => { target.discoveryRadius = value; }) });
      field(form, '활성 반경', point.activationRadius, { type: 'number', min: 8, max: point.discoveryRadius, step: .1, onChange: value => changePoint('활성 반경', target => { target.activationRadius = value; }) });
      field(form, '도착 입구', point.arrivalId, { options: area.entrances.map(entry => ({ value: entry.id, label: entry.id })), onChange: value => changePoint('웨이포인트 도착', target => { target.arrivalId = value; }) });
      field(form, '이동 필수 진행', point.travelGateKeys.join(' · ') || '없음', { readonly: true });
      const state = world.state.waypoints?.[point.id];
      field(form, '발견 / 활성 상태', `${state?.discovered === true} / ${state?.active === true}`, { readonly: true });
    }
    title(form, 'REGION STATE');
    const region = world.state.regions[area.areaKey] || { visits: 0, data: {} };
    field(form, '방문 횟수', region.visits, { readonly: true });
    field(form, '지역 메모', typeof region.data?.memo === 'string' ? region.data.memo : '', { onChange: value => {
      const data = region.data && typeof region.data === 'object' && !Array.isArray(region.data) ? structuredClone(region.data) : { previousData: structuredClone(region.data) };
      data.memo = value;
      if (!this.controller?.setRegionData(area.areaKey, data)) this.edit('지역 상태', next => { (next.state.regions[area.areaKey] ||= { visits: 0, data: {} }).data = data; });
    } });
    field(form, '마지막 도착 결과', this.controller?.latestResult.reason || (this.controller?.opened ? '연결됨' : '연결 대기'), { readonly: true });
    field(form, '제작 대기', '실제 CH1 등록 · GPU · 이미지 lease · 전투/모델 제작', { readonly: true });
  }
  dispose() { this._generation++; this.active = false; this.controller?.dispose(); this.controller = null; this.store?.dispose(); this.mapView.dispose(); for (const remove of this.listeners) remove(); this.listeners = []; }
}
