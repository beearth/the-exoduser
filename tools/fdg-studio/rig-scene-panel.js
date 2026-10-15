import { createDefaultRigProject, validateRigProject, RIG_LIMITS } from '../../engine/fdg/rig-project.js?v=torso-depth-r7';
import { createRigScene } from '../../engine/fdg/rig-scene-project.js?v=torso-depth-r7';

const $ = id => document.getElementById(id);
const text = (node, value) => { if (node.children.length) throw new Error('Text target must be a leaf'); node.textContent = String(value); };
const copy = value => structuredClone(value), deg = value => value * 180 / Math.PI, rad = value => value * Math.PI / 180;
export class RigScenePanel {
  constructor({ getProject, getRuntime, getSelection, isRunning, isReady, change, select, status, loadSequence, sequenceControl }) {
    Object.assign(this, { getProject, getRuntime, getSelection, isRunning, isReady, change, select, status, loadSequence, sequenceControl });
    this.boneId = null; this.listeners = []; this.inspectorListeners = []; this.loadingSequence = false;
    const listen = (id, event, callback) => { const node = $(id); node.addEventListener(event, callback); this.listeners.push(() => node.removeEventListener(event, callback)); };
    listen('rig-scene-add', 'click', () => this.add(createDefaultRigProject()));
    listen('rig-scene-saved', 'click', () => {
      try {
        const saved = localStorage.getItem('fdg.studio.rig.v1');
        if (!saved) throw new Error('리깅 시험실에서 먼저 리그를 저장하세요.');
        if (new TextEncoder().encode(saved).length > RIG_LIMITS.fileBytes) throw new Error('리그 파일 한계2MiB 초과');
        this.add(JSON.parse(saved));
      } catch (error) { this.status(error.message, true); }
    });
    listen('rig-scene-delete', 'click', () => this.edit('장면 리그 노드 삭제', scene => {
      const id = this.node()?.id; scene.nodes = scene.nodes.filter(node => node.id !== id);
      if (scene.sequence?.nodeId === id) delete scene.sequence;
      const used = new Set(scene.nodes.map(node => node.resourceId)); scene.resources = scene.resources.filter(resource => used.has(resource.id));
    }));
    listen('rig-scene-focus', 'click', () => {
      const node = this.node(); if (!node) return;
      this.getRuntime().setCamera(node.position[0], node.position[1]);
      this.edit('리그 장면 카메라', scene => { const camera = this.getRuntime().camera; Object.assign(scene.camera, { x: camera.x, y: camera.y, follow: false }); });
    });
    listen('rig-scene-clip', 'change', () => this.live('장면 클립 전환', (runtime, id) => runtime.setRigClip(id, $('rig-scene-clip').value || null)));
    listen('rig-scene-material', 'change', () => this.live('장면 호환 재질', (runtime, id) => runtime.setRigMaterial(id, $('rig-scene-material').value)));
    listen('rig-scene-time', 'input', () => {
      if (this.isRunning()) return;
      this.live('장면 리그 시간', (runtime, id) => runtime.seekRig(id, Number($('rig-scene-time').value)));
    });
    listen('rig-sequence-load', 'click', async () => {
      if (this.loadingSequence || this.isRunning() || !this.isReady()) return;
      this.loadingSequence = true; this.refresh();
      try { await this.loadSequence($('rig-sequence-preset').value); }
      catch (error) { this.status(`시퀀스 불러오기 실패: ${error.message}`, true); }
      finally { this.loadingSequence = false; this.refresh(); }
    });
    for (const action of ['pause', 'stop', 'replay']) listen(`rig-sequence-${action}`, 'click', () => this.sequenceControl(action));
  }
  node(project = this.getProject()) { const selection = this.getSelection(); return selection.group === 'rigNodes' ? project.rigScene?.nodes.find(node => node.id === selection.id) : null; }
  resource() { const node = this.node(); return node && this.getProject().rigScene.resources.find(resource => resource.id === node.resourceId); }
  capture(next) {
    const scene = this.getRuntime()?.captureRigScene();
    if (next.rigScene && scene) next.rigScene = scene;
  }
  edit(label, mutate) {
    if (this.isRunning()) return;
    try { this.change(label, next => { this.capture(next); mutate(next.rigScene, next); }); }
    catch (error) { this.status(error.message, true); this.refresh(); }
  }
  live(label, action) {
    const node = this.node(), runtime = this.getRuntime(); if (!node || !this.isReady()) return;
    try {
      if (!action(runtime, node.id)) throw new Error('리그 리소스/노드 선택을 확인하세요.');
      this.change(label, next => this.capture(next), { live: true });
      this.refresh();
    } catch (error) { this.status(error.message, true); this.refresh(); }
  }
  add(rig) {
    if (this.isRunning() || !this.isReady()) return;
    try {
      const validation = validateRigProject(rig); if (!validation.ok) throw new Error(validation.errors[0]);
      const runtime = this.getRuntime(), position = [Math.min(8000, runtime.player.x + 130), Math.max(0, runtime.player.y - 60), 0];
      const resourceId = `rig_${crypto.randomUUID()}`, nodeId = `rig_node_${crypto.randomUUID()}`;
      const added = createRigScene(rig, { position, resourceId, nodeId, name: '3D 리그 시험 노드' });
      this.change('리그 장면 소비자 추가', next => {
        this.capture(next);
        if (next.rigScene) { next.rigScene.resources.push(added.resources[0]); next.rigScene.nodes.push(added.nodes[0]); Object.assign(next.rigScene.camera, { x: position[0], y: position[1], follow: false }); }
        else next.rigScene = added;
      });
      this.select(nodeId); this.status('실제 리그를 같은 FDG 장면 런타임에 연결했습니다.');
    } catch (error) { this.status(error.message, true); }
  }
  options(select, entries, value) {
    const fragment = document.createDocumentFragment();
    for (const [id, label] of entries) { const option = document.createElement('option'); option.value = id; text(option, label); fragment.append(option); }
    select.replaceChildren(fragment); select.value = value;
  }
  refresh() {
    const node = this.node(), rig = this.resource()?.project;
    const snapshot = node && this.getRuntime()?.getRigNodeSnapshot(node.id);
    const clipId = snapshot?.clipId !== undefined ? snapshot.clipId : node?.clipId;
    const materialId = snapshot?.materialId !== undefined ? snapshot.materialId : node?.materialId;
    for (const id of ['rig-scene-add', 'rig-scene-saved']) $(id).disabled = this.isRunning() || !this.isReady();
    for (const id of ['rig-scene-delete', 'rig-scene-focus']) $(id).disabled = !node || this.isRunning() || !this.isReady();
    for (const id of ['rig-scene-clip', 'rig-scene-material']) $(id).disabled = !node || !this.isReady();
    $('rig-scene-time').disabled = !node || this.isRunning() || !this.isReady();
    this.options($('rig-scene-clip'), rig ? [['', '바인드 포즈'], ...rig.clips.map(clip => [clip.id, clip.name])] : [], clipId || '');
    this.options($('rig-scene-material'), rig ? rig.materials.map(material => [material.id, material.name]) : [], materialId || '');
    $('rig-scene-time').max = rig?.clips.find(clip => clip.id === clipId)?.duration || 2;
    const sequence = this.getProject().rigScene?.sequence, sequenceState = this.getRuntime()?.getRigSequenceSnapshot?.();
    $('rig-sequence-load').disabled = this.isRunning() || !this.isReady() || this.loadingSequence;
    $('rig-sequence-preset').disabled = $('rig-sequence-load').disabled;
    $('rig-sequence-pause').disabled = !sequence || !this.isRunning() || !this.isReady();
    $('rig-sequence-stop').disabled = !sequence || !this.isReady() || sequenceState?.status !== 'active';
    $('rig-sequence-replay').disabled = !sequence || !this.isReady() || this.loadingSequence;
    text($('rig-sequence-replay'), sequence?.autoStart === false ? '공격 1회' : '처음부터 재생');
    this.updateStats();
  }
  updateStats() {
    const sequence = this.getProject().rigScene?.sequence, state = this.getRuntime()?.getRigSequenceSnapshot?.();
    if (sequence && state && state.status !== 'unavailable') {
      const status = { ready: sequence.autoStart === false ? '대기 · 공격 1회 버튼으로 시작' : '대기 · 저장 포즈 / 실행은0초 시작', active: this.isRunning() ? '재생' : '일시정지', completed: '단발 완료', stopped: '동작 정지 · FX 독립 수명' }[state.status] || state.status;
      const sheets = state.activeFx || [], frame = state.atlasActive && Number.isInteger(state.atlasFrame) && state.atlasFrame >= 0 ? `${state.atlasFrame + 1}/${sequence.atlas.frames}장` : '없음';
      const life = Number.isFinite(state.atlasLife) ? state.atlasLife : sequence.atlas.frames / sequence.atlas.fps;
      text($('rig-sequence-status'), `${status} · 회차 ${state.activationId || 0} · 동작 ${Number(state.elapsed || 0).toFixed(3)}초 · 이벤트 ${state.eventCount || 0}/1 @${Number(state.eventTime ?? sequence.startTime).toFixed(3)}초 · FX ${sheets.length} · 셀 ${frame} · 경과 ${Number(state.atlasAge || 0).toFixed(3)}/${life.toFixed(3)}초`);
      text($('rig-sequence-contract'), `본체 ENGINE_AUTHORING · FX ENGINE_FIXTURE · 데모 이벤트${sequence.startTime.toFixed(3)}초 · ${sequence.atlas.frames}장/${sequence.atlas.fps}FPS · native 시간 환산 없음`);
      $('rig-sequence-stop').disabled = !this.isReady() || state.status !== 'active';
    } else {
      const druid = this.resource()?.project.provenance?.subject === 'boss-dark-druid-NORMAL';
      text($('rig-sequence-status'), this.loadingSequence ? '데모 장면을 준비하고 있습니다.' : druid ? '다크드루이드 본체 · 동작에서 지팡이 타격 선택 → 대기 복귀' : '새 데모 장면 연결 · 상단 테스트 실행 / 장면1틱으로 시작');
      text($('rig-sequence-contract'), druid ? '보스 NORMAL · ENGINE_AUTHORING · 승인 원화355×541 · FX 없음 · 본편 전투 미적용' : '본체 ENGINE_AUTHORING · FX ENGINE_FIXTURE · 데모 이벤트0.900초 · native 시간 환산 없음');
    }
    const node = this.node(), snapshot = node && this.getRuntime()?.getRigNodeSnapshot(node.id);
    if (!snapshot) { text($('rig-scene-summary'), '리그 노드를 추가하세요 · 기존 FDG 장면 clock/camera 소비'); return; }
    $('rig-scene-clip').value = snapshot.clipId || '';
    $('rig-scene-material').value = snapshot.materialId;
    $('rig-scene-time').max = this.resource()?.project.clips.find(clip => clip.id === snapshot.clipId)?.duration || 2;
    if (node.returnTo) {
      $('rig-scene-clip').disabled = !this.isReady() || Boolean(snapshot.transition);
      $('rig-sequence-replay').disabled = !sequence || !this.isReady() || this.loadingSequence || Boolean(snapshot.transition);
    }
    $('rig-scene-time').value = snapshot.time;
    text($('rig-scene-summary'), `${snapshot.time.toFixed(3)}초 · ${snapshot.vertices.length} XYZ 정점 · ${snapshot.transition ? '클립 전환 중' : '포즈 평가'} · CPU LBS · 장면60Hz`);
  }
  clearInspectorListeners() { for (const remove of this.inspectorListeners) remove(); this.inspectorListeners = []; }
  inspector(form) {
    this.clearInspectorListeners();
    const listen = (node, callback) => { node.addEventListener('change', callback); this.inspectorListeners.push(() => node.removeEventListener('change', callback)); };
    const node = this.node(), rig = this.resource()?.project; if (!node || !rig) return;
    const field = (id, label, value, mutate, { type = 'number', step = .01, entries } = {}) => {
      const row = document.createElement('div'); row.className = 'field';
      const caption = document.createElement('label'); caption.htmlFor = id; text(caption, label);
      const input = document.createElement(entries ? 'select' : 'input'); input.id = id;
      if (entries) this.options(input, entries, value); else { input.type = type; input.value = value; input.step = step; }
      input.disabled = this.isRunning();
      listen(input, () => this.edit(label, (scene, project) => mutate(scene.nodes.find(item => item.id === node.id), scene, type === 'number' && !entries ? Number(input.value) : input.value, project)));
      row.append(caption, input); form.append(row);
    };
    const heading = label => { const title = document.createElement('h2'); title.className = 'field-heading'; text(title, label); form.append(title); };
    heading('3D SCENE INSTANCE');
    field('rig-scene-name', '노드 이름', node.name, (node, scene, value) => { node.name = value; }, { type: 'text' });
    for (let axis = 0; axis < 3; axis++) field(`rig-scene-position-${axis}`, `배치 ${['X', 'Y', '높이 Z'][axis]} · world px`, node.position[axis], (node, scene, value) => { node.position[axis] = value; });
    field('rig-scene-scale', '모델 단위 → px', node.scale, (node, scene, value) => { node.scale = value; });
    field('rig-scene-visible', '노드 표시', String(node.visible), (node, scene, value) => { node.visible = value === 'true'; }, { entries: [['true', '표시'], ['false', '숨김']] });
    if (node.returnTo) {
      heading('동작 종료 후 복귀');
      field('rig-scene-return-clip', '복귀 대기 클립', node.returnTo.clipId, (node, scene, value) => { node.returnTo.clipId = value; }, { entries: rig.clips.filter(clip => clip.loop).map(clip => [clip.id, clip.name]) });
      field('rig-scene-return-seconds', '복귀 전환 · 저작 초', node.returnTo.transitionSeconds, (node, scene, value) => { node.returnTo.transitionSeconds = value; });
    }
    heading('SHARED RIG POSE · 실제 LBS');
    if (!rig.skeleton.bones.some(bone => bone.id === this.boneId)) this.boneId = rig.skeleton.bones[1]?.id || rig.skeleton.bones[0].id;
    const boneRow = document.createElement('div'); boneRow.className = 'field'; const label = document.createElement('label'); text(label, '포즈 뼈'); label.htmlFor = 'rig-scene-bone';
    const bones = document.createElement('select'); bones.id = 'rig-scene-bone'; this.options(bones, rig.skeleton.bones.map(bone => [bone.id, bone.name]), this.boneId); bones.disabled = this.isRunning();
    listen(bones, () => { this.boneId = bones.value; form.replaceChildren(); this.inspector(form); }); boneRow.append(label, bones); form.append(boneRow);
    const pose = Object.hasOwn(rig.preview.pose, this.boneId) ? rig.preview.pose[this.boneId] : { translation: [0, 0, 0], rotation: [0, 0, 0] };
    for (const kind of ['translation', 'rotation']) for (let axis = 0; axis < 3; axis++) field(`rig-scene-pose-${kind}-${axis}`, `${kind === 'translation' ? '포즈 이동' : '포즈 회전 °'} ${'XYZ'[axis]}`, kind === 'rotation' ? deg(pose[kind][axis]).toFixed(3) : pose[kind][axis], (node, scene, value) => {
      const project = scene.resources.find(resource => resource.id === node.resourceId).project;
      if (!Object.hasOwn(project.preview.pose, this.boneId)) project.preview.pose[this.boneId] = { translation: [0, 0, 0], rotation: [0, 0, 0] };
      project.preview.pose[this.boneId][kind][axis] = kind === 'rotation' ? rad(value) : value;
    });
    heading('장면 중심 · 월드 좌표');
    if (rig.provenance?.subject === 'boss-dark-druid-NORMAL') {
      const bodyNote = document.createElement('p'); bodyNote.className = 'quality-note';
      text(bodyNote, '다크드루이드 NORMAL 승인 원화의 보이는 표면을 메시와 맞춤 뼈대로 제작했습니다. 대기·지팡이 타격에서 팔, 손, 지팡이, 외투의 움직임을 확인하세요. 작은 깊이와 단면은 저작 추정이며 뒤쪽·옷 속을 복원한 모델이 아닙니다.'); form.append(bodyNote);
    }
    if (rig.provenance?.depthAuthoring) {
      const depthNote = document.createElement('p'); depthNote.className = 'quality-note';
      text(depthNote, '흉곽·골반 앞면에 실제 Z 곡률과 짧은 옆단면을 저작했습니다. 좌우 22°·pitch 6°에서 확인하세요. 회색 옆면은 원화에 없는 저작 추정 면이며, 원화 복원이나 완전한 뒤쪽 모델이 아닙니다.'); form.append(depthNote);
    }
    for (const axis of ['x', 'y']) field(`rig-scene-camera-${axis}`, `카메라 ${axis.toUpperCase()} · world px`, this.getProject().rigScene.camera[axis], (node, scene, value) => { scene.camera[axis] = value; scene.camera.follow = false; });
    heading('모델 회전 · 월드 카메라와 별도');
    for (const axis of ['yaw', 'pitch']) field(`rig-scene-camera-${axis}`, `${axis === 'yaw' ? '모델 수평 회전' : '모델 기울기'} °`, deg(this.getProject().rigScene.camera[axis]).toFixed(3), (node, scene, value) => { scene.camera[axis] = rad(value); });
    const sequence = this.getProject().rigScene.sequence;
    if (sequence?.nodeId === node.id) {
      heading('DEMO SEQUENCE · ENGINE AUTHORING');
      if (sequence.entryTransitionSeconds !== undefined) field('rig-sequence-entry-seconds', '공격 진입 전환 · 저작 초', sequence.entryTransitionSeconds, (node, scene, value) => { scene.sequence.entryTransitionSeconds = value; });
      field('rig-sequence-scale', 'ENGINE_FIXTURE 임팩트 배율', sequence.atlas.scale, (node, scene, value) => { scene.sequence.atlas.scale = value; });
      for (let axis = 0; axis < 2; axis++) field(`rig-sequence-offset-${axis}`, `작성 임팩트 오프셋 ${'XY'[axis]} · world px`, sequence.offset[axis], (node, scene, value) => { scene.sequence.offset[axis] = value; });
      const contract = document.createElement('p'); contract.className = 'quality-note'; text(contract, sequence.autoStart === false ? '대기 2초·24FPS, 공격 3초·24FPS. 공격 1회 후 대기로 복귀합니다. 공격 0.900초에 임팩트 24장·16FPS가 자동 재생됩니다. 전환은 저작 초이며 본편 전투 시간과 별개입니다. 저장 포즈·전환 설정은 보존하고 재열기 실행 clock·공격 회차·FX는 초기화합니다.' : '본체 3초·24FPS, 데모0.900초에 승인 임팩트24장·16FPS·1.5초 단발. 이 offset/배율은 제작 설정이며 native 공격시각·피해·충돌과 연결되지 않습니다. 저장은 현재 포즈와 설정을 보존하고, 재열기 실행은0초·새 이벤트로 시작합니다.'); form.append(contract);
    }
    const note = document.createElement('p'); note.className = 'quality-note'; text(note, '본/메시/가중치/클립은 리그 리소스에 보존됩니다. 이 노드는 시각 전용이며 새 충돌·전투 판정이 없습니다. 같은 리그를 참조한 노드는 공유 포즈를 사용합니다.'); form.append(note);
  }
  dispose() { this.clearInspectorListeners(); for (const remove of this.listeners) remove(); this.listeners = []; }
}
