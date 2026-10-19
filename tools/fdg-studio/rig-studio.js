import { createDefaultRigProject, validateRigProject, RigProjectStore, RIG_LIMITS } from '../../engine/fdg/rig-project.js?v=torso-depth-r7';
import { RigPreview } from './rig-preview.js?v=torso-depth-r7';

const $ = id => document.getElementById(id), KEY = 'fdg.studio.rig.v1';
const text = (node, value) => { if (node.children.length) throw new Error('Text target must be a leaf'); node.textContent = String(value); };
const status = (message, error = false) => { text($('rig-status'), message); $('rig-status').style.color = error ? '#ef9b91' : ''; };
const degrees = value => value * 180 / Math.PI, radians = value => value * Math.PI / 180;
let project = createDefaultRigProject(), restoreMessage = '';
try {
  const saved = localStorage.getItem(KEY);
  if (saved) { if (new Blob([saved]).size > 2 * 1048576) throw new Error('저장 자료가2MiB를 초과합니다.'); const candidate = JSON.parse(saved), validation = validateRigProject(candidate); if (!validation.ok) throw new Error(validation.errors[0]); project = candidate; }
} catch (error) { restoreMessage = `기존 리깅 저장 복원 실패: ${error.message}`; }
const store = new RigProjectStore(project);
let boneId = project.skeleton.bones[1]?.id || project.skeleton.bones[0].id, vertexIndex = Math.min(8, project.mesh.vertices.length - 1), keyIndex = 0, weightBone = boneId;
let preview, dirty = false, lastStats = -Infinity;
function capture() { const next = store.project; next.preview.time = preview.time; next.preview.playing = false; return next; }
function edit(label, mutate) {
  try { store.change(label, next => { next.preview.time = preview.time; next.preview.playing = false; mutate(next); }); }
  catch (error) { status(error.message, true); renderInspector(); }
}
function options(select, entries, value) {
  const fragment = document.createDocumentFragment();
  for (const [id, label] of entries) { const option = document.createElement('option'); option.value = id; text(option, label); fragment.append(option); }
  select.replaceChildren(fragment); select.value = value;
}
function field(form, id, label, value, { type = 'number', entries, min, max, step = .01, change } = {}) {
  const row = document.createElement('div'); row.className = 'rig-field';
  const caption = document.createElement('label'); caption.htmlFor = id; text(caption, label);
  const input = document.createElement(entries ? 'select' : 'input'); input.id = id;
  if (entries) options(input, entries, value);
  else { input.type = type; input.value = value; if (min !== undefined) input.min = min; if (max !== undefined) input.max = max; input.step = step; }
  input.addEventListener('change', () => change(type === 'number' && !entries ? Number(input.value) : input.value));
  row.append(caption, input); form.append(row); return input;
}
function title(form, label) { const heading = document.createElement('h2'); heading.className = 'field-heading'; text(heading, label); form.append(heading); }
function vector(form, prefix, label, values, change, angles = false) {
  for (let axis = 0; axis < 3; axis++) field(form, `${prefix}-${axis}`, `${label} ${'XYZ'[axis]}`, angles ? degrees(values[axis]).toFixed(3) : values[axis],
    { step: .01, change: value => change(axis, angles ? radians(value) : value) });
}
function currentBone(next = project) { return next.skeleton.bones.find(bone => bone.id === boneId); }
function renderInspector() {
  const form = $('rig-fields'); form.replaceChildren(); const bone = currentBone();
  text($('rig-bone-id'), bone.id);
  title(form, '뼈 · 계층 / BIND POSE');
  field(form, 'rig-bone-name', '뼈 이름', bone.name, { type: 'text', change: value => edit('뼈 이름', next => { currentBone(next).name = value; }) });
  field(form, 'rig-bone-parent', '부모 뼈', bone.parent || '', { entries: [['', '루트'], ...project.skeleton.bones.filter(other => other.id !== boneId).map(other => [other.id, other.name])], change: value => edit('뼈 부모', next => { currentBone(next).parent = value || null; }) });
  vector(form, 'rig-bind-position', '관절 위치', bone.translation, (axis, value) => edit('관절 위치', next => { currentBone(next).translation[axis] = value; }));
  vector(form, 'rig-bind-rotation', '바인드 회전 °', bone.rotation, (axis, value) => edit('바인드 회전', next => { currentBone(next).rotation[axis] = value; }), true);
  title(form, '선택 뼈 포즈 · 클립 뒤에 적용');
  const pose = Object.hasOwn(project.preview.pose, boneId) ? project.preview.pose[boneId] : { translation: [0, 0, 0], rotation: [0, 0, 0] };
  const poseEdit = (kind, axis, value) => edit('뼈 포즈', next => { if (!Object.hasOwn(next.preview.pose, boneId)) next.preview.pose[boneId] = { translation: [0, 0, 0], rotation: [0, 0, 0] }; next.preview.pose[boneId][kind][axis] = value; });
  vector(form, 'rig-pose-position', '포즈 이동', pose.translation, (axis, value) => poseEdit('translation', axis, value));
  vector(form, 'rig-pose-rotation', '포즈 회전 °', pose.rotation, (axis, value) => poseEdit('rotation', axis, value), true);
  title(form, '메시 정점 · SKIN WEIGHTS');
  field(form, 'rig-vertex', '편집할 정점', String(vertexIndex), { entries: project.mesh.vertices.map((vertex, index) => [String(index), `정점 ${index}`]), change: value => { vertexIndex = Number(value); renderInspector(); preview.setSelection({ boneId, vertexIndex }); } });
  vector(form, 'rig-vertex-position', '바인드 정점', project.mesh.vertices[vertexIndex], (axis, value) => edit('메시 정점', next => { next.mesh.vertices[vertexIndex][axis] = value; }));
  field(form, 'rig-weight-bone', '가중치 뼈', weightBone, { entries: project.skeleton.bones.map(bone => [bone.id, bone.name]), change: value => { weightBone = value; renderInspector(); } });
  const weight = project.mesh.weights[vertexIndex].find(influence => influence.boneId === weightBone)?.weight || 0;
  field(form, 'rig-weight', '선택 뼈 가중치 (0~1)', weight, { min: 0, max: 1, step: .05, change: value => edit('정점 가중치', next => {
    if (!Number.isFinite(value) || value < 0 || value > 1) throw new Error('가중치는0~1입니다.');
    let others = next.mesh.weights[vertexIndex].filter(influence => influence.boneId !== weightBone).slice(0, 3);
    if (value < 1 && !others.length) { const fallback = next.skeleton.bones.find(bone => bone.id !== weightBone); if (!fallback) throw new Error('한 뼈만 있으면 가중치는1이어야 합니다.'); others = [{ boneId: fallback.id, weight: 1 }]; }
    const sum = others.reduce((sum, influence) => sum + influence.weight, 0);
    next.mesh.weights[vertexIndex] = [...(value > 0 ? [{ boneId: weightBone, weight: value }] : []), ...others.map(influence => ({ boneId: influence.boneId, weight: (1 - value) * influence.weight / sum })).filter(influence => influence.weight > 0)];
  }) });
  const note = document.createElement('p'); note.className = 'rig-inspector-note'; text(note, `${project.mesh.weights[vertexIndex].map(influence => `${influence.boneId} ${influence.weight.toFixed(3)}`).join(' · ')}\n다른 뼈의 비율을 다시 분배해 합계1을 유지합니다. 자동 가중치 생성은 아닙니다.`); form.append(note);
  const clip = project.clips.find(clip => clip.id === project.preview.clipId);
  if (clip) {
    title(form, '클립 · 가변 FPS / 시간 보간');
    field(form, 'rig-clip-fps', '클립 FPS', clip.fps, { min: 1, max: 120, step: 1, change: value => edit('클립 FPS', next => { next.clips.find(item => item.id === clip.id).fps = value; }) });
    field(form, 'rig-clip-duration', '클립 길이 (초)', clip.duration, { min: .05, max: 120, change: value => edit('클립 길이', next => { const target = next.clips.find(item => item.id === clip.id); const oldDuration = target.duration; for (const track of target.tracks) for (const key of track.keys) key.time = key.time / oldDuration * value; target.duration = value; }) });
    const track = clip.tracks.find(track => track.boneId === boneId);
    if (track) {
      keyIndex = Math.min(keyIndex, track.keys.length - 1);
      field(form, 'rig-key', '동작 키', String(keyIndex), { entries: track.keys.map((key, index) => [String(index), `${key.time.toFixed(3)}초`]), change: value => { keyIndex = Number(value); renderInspector(); } });
      for (const kind of ['translation', 'rotation']) vector(form, `rig-key-${kind}`, kind === 'translation' ? '키 이동' : '키 회전 °', track.keys[keyIndex][kind],
        (axis, value) => edit('클립 키', next => { next.clips.find(item => item.id === clip.id).tracks.find(track => track.boneId === boneId).keys[keyIndex][kind][axis] = value; }), kind === 'rotation');
    } else {
      const button = document.createElement('button'); button.type = 'button'; button.id = 'rig-add-track'; text(button, '+ 선택 뼈 동작 채널');
      button.addEventListener('click', () => edit('동작 채널 추가', next => { const target = next.clips.find(item => item.id === clip.id); target.tracks.push({ boneId, keys: [0, target.duration].map(time => ({ time, translation: [0, 0, 0], rotation: [0, 0, 0] })) }); })); form.append(button);
    }
  }
}
function renderUI() {
  text($('rig-name'), project.name); text($('rig-bone-count'), `${project.skeleton.bones.length} bones`);
  const fragment = document.createDocumentFragment();
  for (const bone of project.skeleton.bones) {
    let depth = 0, parent = bone.parent;
    while (parent) { depth++; parent = project.skeleton.bones.find(bone => bone.id === parent).parent; }
    const button = document.createElement('button'); button.dataset.boneId = bone.id; button.classList.toggle('active', bone.id === boneId); button.style.paddingLeft = `${10 + depth * 14}px`; text(button, bone.name);
    button.addEventListener('click', () => { boneId = bone.id; weightBone = boneId; keyIndex = 0; renderUI(); }); fragment.append(button);
  }
  $('rig-bones').replaceChildren(fragment);
  options($('rig-clip'), [['', '바인드 · 포즈 검사'], ...project.clips.map(clip => [clip.id, `${clip.name} · ${clip.fps}FPS`])], project.preview.clipId || '');
  options($('rig-material'), project.materials.map(material => [material.id, material.name]), project.preview.materialId);
  const clip = project.clips.find(clip => clip.id === project.preview.clipId); $('rig-time').max = String(clip?.duration || 2);
  const camera = preview.camera; $('rig-yaw').value = degrees(camera.yaw); $('rig-pitch').value = degrees(camera.pitch); $('rig-zoom').value = camera.zoom;
  const sourceMesh = project.provenance?.modelKind === 'visible-source-2.5D-texture-mesh';
  text($('rig-caption'), sourceMesh ? '지옥기형 · 승인 텍스처 2.5D 리깅 · 가려진 면 복원 없음' : '엔진용 관절 메시 · 신규 캐릭터 디자인/완성 아님');
  text($('rig-view-scope'), sourceMesh ? '보이는 표면 2.5D · CPU Canvas' : '2.5D 직교 카메라 · 실제 XYZ 메시 · CPU Canvas');
  $('rig-source-gap').hidden = !sourceMesh;
  text($('rig-source-gap'), sourceMesh ? 'ENGINE_AUTHORING · 뒤쪽 몸통과 다리에 가린 꼬리 텍스처는 원본에 없습니다. 본편 전투 연결 전 추가 표면 자료가 필요합니다.' : '');
  $('rig-undo').disabled = !store.canUndo; $('rig-redo').disabled = !store.canRedo;
  renderInspector(); preview.setSelection({ boneId, vertexIndex });
  text($('rig-bytes'), `JSON ${new TextEncoder().encode(JSON.stringify(project)).length} bytes · 파일 크기이며 VRAM/실행 메모리 실측 아님`);
}
preview = new RigPreview($('rig-canvas'), project, snapshot => {
  if (snapshot.state === 'running' && performance.now() - lastStats < 100) return; lastStats = performance.now();
  $('rig-time').value = snapshot.time; text($('rig-time-value'), `${snapshot.time.toFixed(3)}초`);
  text($('rig-play'), snapshot.state === 'running' ? '⏸ 정지' : '▶ 재생');
  text($('rig-stats'), `${project.mesh.vertices.length} vertices · ${project.mesh.triangles.length} triangles · ${project.skeleton.bones.length} bones · CPU ${snapshot.cpuMs.toFixed(2)}ms · 누락 틱 ${snapshot.droppedSteps}`);
  text($('rig-transition'), snapshot.transition ? `클립 보간 전환 ${(Math.min(1, snapshot.transition.elapsed / snapshot.transition.duration) * 100).toFixed(0)}%` : '클립 전환 완료 · translation 선형 / rotation quaternion');
  const texture = snapshot.textures?.[0], phases = project.provenance?.phases;
  const phase = phases?.find(phase => snapshot.time >= phase.start && snapshot.time < phase.end)?.name || (phases ? '대기' : '');
  text($('rig-texture-state'), texture ? `텍스처 ${texture.status === 'ready' ? '준비됨' : texture.status === 'loading' ? '불러오는 중' : '오류'} · ${texture.width}×${texture.height} · 실제 텍스처 삼각형 ${snapshot.textureDraws || 0}${phase ? ` · ${phase}` : ''}${texture.error ? ` · ${texture.error}` : ''}` : '단색 메시 · 텍스처 없음');
});
if (project.provenance?.modelKind === 'visible-source-2.5D-texture-mesh') {
  preview.showBones = false; $('rig-show-bones').checked = false; preview.render();
}
store.signals.on('changed', ({ project: next, label }) => {
  project = next; dirty = true;
  if (!project.skeleton.bones.some(bone => bone.id === boneId)) boneId = project.skeleton.bones[0].id;
  if (!project.skeleton.bones.some(bone => bone.id === weightBone)) weightBone = boneId;
  vertexIndex = Math.min(vertexIndex, project.mesh.vertices.length - 1);
  preview.setProject(project); renderUI(); text($('rig-save-state'), '미저장 리깅 변경'); status(label);
});
$('rig-play').addEventListener('click', () => { preview.state === 'running' ? preview.pause() : preview.play(); lastStats = -Infinity; preview.render(); });
$('rig-show-bones').addEventListener('change', () => { preview.showBones = $('rig-show-bones').checked; preview.render(); });
$('rig-hell-aberrant').addEventListener('click', async () => {
  const button = $('rig-hell-aberrant'); button.disabled = true;
  try {
    const response = await fetch('fixtures/hell-aberrant-motion.rig.json?v=tail-continuity-r3-final');
    if (!response.ok) throw new Error(`리그 자료 HTTP ${response.status}`);
    const raw = await response.text(); if (new TextEncoder().encode(raw).length > RIG_LIMITS.fileBytes) throw new Error('리그 자료2MiB 초과');
    const candidate = JSON.parse(raw), validation = validateRigProject(candidate); if (!validation.ok) throw new Error(validation.errors[0]);
    preview.pause(); preview.transition = null; store.replace(candidate, '지옥기형 준비·꼬리 휩쓸기·회복 리그 불러오기');
    preview.showBones = false; $('rig-show-bones').checked = false; preview.render();
    status('승인 본체 텍스처와 실제 가중치 리그를 연결했습니다. 재생으로 준비·휩쓸기·회복을 확인하세요.');
  } catch (error) { status(error.message, true); } finally { button.disabled = false; }
});
$('rig-step').addEventListener('click', () => { preview.step(); lastStats = -Infinity; preview.render(); });
$('rig-clip').addEventListener('change', () => {
  const fromClip = preview.clipId, fromTime = preview.time, playing = preview.state === 'running', id = $('rig-clip').value || null;
  edit('클립 선택', next => { next.preview.clipId = id; next.preview.time = 0; });
  if (playing) { lastStats = -Infinity; preview.transitionFrom(fromClip, fromTime); }
});
$('rig-material').addEventListener('change', () => edit('호환 스킨 재질', next => { next.preview.materialId = $('rig-material').value; }));
$('rig-time').addEventListener('input', () => { const time = Number($('rig-time').value); preview.pause(); edit('동작 시간', next => { next.preview.time = time; }); });
for (const [id, axis, convert] of [['rig-yaw', 'yaw', radians], ['rig-pitch', 'pitch', radians], ['rig-zoom', 'zoom', Number]]) $(id).addEventListener('change', () => edit('2.5D 시점', next => { next.preview.camera = { ...preview.camera, [axis]: convert($(id).value) }; }));
$('rig-add-bone').addEventListener('click', () => edit('자식 뼈 추가', next => { next.skeleton.bones.push({ id: `bone_${crypto.randomUUID()}`, name: '새 관절', parent: boneId, translation: [0, .5, 0], rotation: [0, 0, 0] }); }));
$('rig-undo').addEventListener('click', () => { preview.pause(); store.undo(); }); $('rig-redo').addEventListener('click', () => { preview.pause(); store.redo(); });
function save() { try { preview.pause(); const next = capture(); store.replace(next, '리깅 재생 위치 저장'); localStorage.setItem(KEY, JSON.stringify(next)); dirty = false; text($('rig-save-state'), '저장됨 · FDG 리깅 전용'); status('메시·뼈대·가중치·재질·클립·포즈를 저장했습니다.'); } catch (error) { status(error.message, true); } }
$('rig-save').addEventListener('click', save);
$('rig-export').addEventListener('click', () => { const next = capture(); let json = JSON.stringify(next, null, 2); if (new TextEncoder().encode(json).length > RIG_LIMITS.fileBytes) json = JSON.stringify(next); const url = URL.createObjectURL(new Blob([json], { type: 'application/json' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'fdg-rig-project.json'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); });
$('rig-import').addEventListener('click', () => $('rig-file').click());
$('rig-file').addEventListener('change', async () => {
  const file = $('rig-file').files[0]; if (!file) return;
  try { if (file.size > 2 * 1048576) throw new Error('2MiB 이하 파일만 불러옵니다.'); const candidate = JSON.parse(await file.text()); const result = validateRigProject(candidate); if (!result.ok) throw new Error(result.errors[0]); preview.pause(); preview.transition = null; store.replace(candidate, '리깅 프로젝트 불러오기'); }
  catch (error) { status(`불러오기 거부: ${error.message}`, true); } finally { $('rig-file').value = ''; }
});
$('rig-fields').addEventListener('submit', event => event.preventDefault());
window.addEventListener('blur', () => preview.pause()); document.addEventListener('visibilitychange', () => { if (document.hidden) preview.pause(); });
window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
window.addEventListener('pagehide', event => { if (event.persisted) preview.pause(); else { preview.dispose(); store.dispose(); } });
window.addEventListener('pageshow', event => { if (event.persisted) { lastStats = -Infinity; preview.render(); } });
renderUI(); status(restoreMessage || '실제3D 리깅 시험물 준비 완료 · 바인드/포즈/가중치를 편집하세요.', !!restoreMessage);
Object.defineProperty(window, 'FDGRig', { value: Object.freeze({ get project() { return capture(); }, get snapshot() { return preview.snapshot(); }, preview, storageKey: KEY }), configurable: false });
