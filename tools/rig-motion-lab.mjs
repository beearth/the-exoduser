import * as THREE from 'three';
import { GLTFLoader } from '../assets/vendor/three-r160/examples/jsm/loaders/GLTFLoader.js';
import { RIG_MOTION_CONFIG as C, createRigMotionController, validateSkeletonContract } from './rig-motion-controller.mjs';

const $ = id => document.getElementById(id);
const controls = ['idle', 'walk', 'run', 'demo', 'rotate', 'skeleton', 'zoom', 'pause', 'reset'].map($);
const controller = createRigMotionController();
const sources = Object.freeze({
  idle: '../assets/3d/Meshy_AI_Vinebound_Sentinel_biped_Animation_Idle_withSkin.glb',
  walk: '../assets/3d/Meshy_AI_Vinebound_Sentinel_biped_Animation_Walking_withSkin.glb',
  run: '../assets/3d/Meshy_AI_Vinebound_Sentinel_biped_Animation_Running_withSkin.glb',
});
const modeLabels = { idle: '대기', walk: '걷기', run: '달리기' };
const state = { ready: false, error: null, contextLost: false, frames: 0,
  rafId: 0, maxPendingRaf: 0, previousTime: null, lastUi: 0,
  boneCount: 0, meshCount: 0, contractVerified: false, scale: 0, footOffset: 0,
  sourceClipNames: {}, disposedMotionModels: 0, loads: 0 };
const actions = {};
const bones = {};
let renderer, scene, camera, anchor, model, mixer, helper, shadow, heading;
let currentAction = null, restHipsXZ = null, resizeObserver = null;

function leaf(id, text) {
  const el = $(id);
  if (el && el.children.length === 0) el.textContent = text;
}
function loading(title, detail) {
  leaf('loading-title', title); leaf('loading-detail', detail);
  $('loading').hidden = false;
}
function cancelFrame() {
  if (state.rafId) cancelAnimationFrame(state.rafId);
  state.rafId = 0; state.previousTime = null;
}
function fail(error) {
  state.ready = false;
  state.error = error instanceof Error ? error.message : String(error);
  controller.setPaused(true); cancelFrame();
  controls.forEach(control => { control.disabled = true; });
  if (anchor) anchor.visible = false;
  if (helper) helper.visible = false;
  // Never render from a failure handler: shader-error callbacks may run inside renderer.render.
  loading('리깅 시험을 시작할 수 없습니다', state.error);
  leaf('loading-symbol', '!'); leaf('metric-mode', '중단');
  leaf('status', '모델을 다른 외형으로 대체하지 않았습니다. 문제를 확인한 뒤 이 시험 페이지를 다시 여세요.');
}

function describeSkeleton(object) {
  const meshes = [];
  object.traverse(node => { if (node.isSkinnedMesh) meshes.push(node); });
  if (meshes.length !== 1 || meshes[0].skeleton.bones.length !== 24) throw new Error('기존 모델의 메시 1개 / 본 24개 계약이 맞지 않습니다.');
  const skeleton = meshes[0].skeleton;
  return skeleton.bones.map((bone, i) => ({
    name: bone.name,
    parent: bone.parent?.isBone ? bone.parent.name : null,
    position: bone.position.toArray(), quaternion: bone.quaternion.toArray(), scale: bone.scale.toArray(),
    inverseBind: skeleton.boneInverses[i].elements.slice(),
  }));
}

function verifiedClip(gltf, id, signature) {
  const contract = validateSkeletonContract(signature, describeSkeleton(gltf.scene));
  if (!contract.ok) throw new Error(`${modeLabels[id]} 본 계약 오류: ${contract.problems.join(', ')}`);
  // The idle file also contains a 0.0667 s bind clip; choose the genuine longest motion.
  const original = gltf.animations.reduce((best, clip) => clip.duration > (best?.duration || 0) ? clip : best, null);
  if (!original || !Number.isFinite(original.duration) || original.duration < 0.1) throw new Error(`${modeLabels[id]} 애니메이션이 없습니다.`);
  const names = new Set(signature.map(bone => bone.name));
  const properties = { position: 3, quaternion: 4, scale: 3 };
  const bound = new Set();
  for (const track of original.tracks) {
    const parsed = THREE.PropertyBinding.parseTrackName(track.name);
    if (!names.has(parsed.nodeName) || parsed.objectName || parsed.objectIndex !== undefined
      || !properties[parsed.propertyName] || track.getValueSize() !== properties[parsed.propertyName]
      || !Array.from(track.values).every(Number.isFinite)) {
      throw new Error(`${modeLabels[id]} 트랙 연결 실패: ${track.name}`);
    }
    bound.add(parsed.nodeName);
  }
  if (original.tracks.length !== 72 || bound.size !== 24) throw new Error(`${modeLabels[id]} 72개 트랙 / 24개 본 연결이 맞지 않습니다.`);
  const clip = original.clone();
  state.sourceClipNames[id] = original.name;
  clip.name = `rig-lab-${id}`;
  return clip;
}

function releaseMotionModel(gltf) {
  // Each sibling file was independently loaded (Three.Cache is not enabled). Keep only cloned clips.
  const geometries = new Set(), materials = new Set(), textures = new Set(), bitmaps = new Set(), skeletons = new Set();
  gltf.scene.traverse(node => {
    if (node.geometry) geometries.add(node.geometry);
    if (node.skeleton) skeletons.add(node.skeleton);
    const mats = Array.isArray(node.material) ? node.material : node.material ? [node.material] : [];
    for (const material of mats) {
      materials.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
    }
  });
  textures.forEach(texture => {
    const images = Array.isArray(texture.image) ? texture.image : [texture.image];
    images.forEach(image => { if (image && typeof image.close === 'function') bitmaps.add(image); });
    texture.dispose();
  });
  skeletons.forEach(skeleton => skeleton.dispose());
  geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose());
  bitmaps.forEach(bitmap => bitmap.close());
  state.disposedMotionModels++;
}

function buildStage() {
  renderer = new THREE.WebGLRenderer({ canvas: $('rig-canvas'), antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.debug.checkShaderErrors = true;
  renderer.debug.onShaderError = () => {
    if (!state.error) fail(new Error('GPU 셰이더를 연결하지 못해 시험을 중단했습니다. 이 페이지를 다시 열어 확인하세요.'));
  };
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, C.pixelRatioLimit));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.2;
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-4, 4, 3.4, -3.4, 0.1, 60);
  const elevation = C.cameraElevation * Math.PI / 180;
  camera.position.set(0, 0.75 + Math.sin(elevation) * 12, Math.cos(elevation) * 12);
  camera.lookAt(0, 0.75, 0);
  scene.add(new THREE.HemisphereLight(0xcfe4e2, 0x394128, 2.4));
  const key = new THREE.DirectionalLight(0xffe0ae, 3); key.position.set(-3, 7, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0x89b7d8, 2); rim.position.set(3, 4, -5); scene.add(rim);
  // A neutral calibration pad, not a map or production environment.
  const pad = new THREE.Mesh(new THREE.CircleGeometry(5.4, 80), new THREE.MeshStandardMaterial({ color: 0x1b2a31, roughness: 1, metalness: 0 }));
  pad.rotation.x = -Math.PI / 2; pad.position.y = -0.012; scene.add(pad);
  const grid = new THREE.GridHelper(8, 16, 0x667975, 0x304349);
  grid.material.transparent = true; grid.material.opacity = 0.42; grid.position.y = 0.002; scene.add(grid);
  const ring = new THREE.Mesh(new THREE.RingGeometry(3.9, 3.925, 80), new THREE.MeshBasicMaterial({ color: 0x9e875f, transparent: true, opacity: 0.7, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.y = 0.003; scene.add(ring);
  anchor = new THREE.Group(); anchor.visible = false; scene.add(anchor);
  shadow = new THREE.Mesh(new THREE.CircleGeometry(0.5, 36), new THREE.MeshBasicMaterial({ color: 0x081111, transparent: true, opacity: 0.6, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.scale.set(1, 0.65, 1); shadow.position.y = 0.006; scene.add(shadow);
  const footprint = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.237, 36), new THREE.MeshBasicMaterial({ color: 0xd4b272, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false }));
  footprint.rotation.x = -Math.PI / 2; footprint.position.y = 0.009; anchor.add(footprint);
  heading = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0.025, 0), 0.72, 0xdec492, 0.15, 0.1); anchor.add(heading);
  $('rig-canvas').addEventListener('webglcontextlost', event => {
    event.preventDefault(); state.contextLost = true;
    fail(new Error('WebGL 컨텍스트가 소실되어 시험을 중단했습니다. 이 페이지를 다시 열어 복구하세요.'));
  });
  resizeObserver = new ResizeObserver(resize); resizeObserver.observe($('rig-canvas').parentElement);
  resize();
}

function resize() {
  if (!renderer || state.contextLost || state.error) return;
  const rect = $('rig-canvas').parentElement.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width)), height = Math.max(1, Math.round(rect.height));
  renderer.setSize(width, height, false);
  const half = C.viewHeight / 2;
  camera.left = -half * width / height; camera.right = -camera.left;
  camera.top = half; camera.bottom = -half; camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}

function updateControls() {
  const s = controller.state;
  $('demo').checked = s.demo; $('rotate').checked = s.autoRotate;
  for (const id of ['idle', 'walk', 'run']) $(id).setAttribute('aria-pressed', String(!s.demo && !s.autoRotate && s.requestedMode === id));
  leaf('pause', s.paused ? '재생' : '일시정지');
}
function updateMetrics() {
  const s = controller.state;
  leaf('metric-mode', `${modeLabels[s.mode]}${s.paused ? ' · 정지' : ''}`);
  leaf('metric-direction', s.autoRotate ? '360° 회전' : `${controller.snapshot().directionLabel} · 8방향`);
  leaf('metric-position', `${s.x.toFixed(2)} / ${s.z.toFixed(2)}`);
}
function switchAction(id) {
  const next = actions[id];
  if (!next || currentAction === next) return;
  next.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).play();
  if (currentAction) currentAction.crossFadeTo(next, C.crossFadeSeconds, false);
  currentAction = next;
}
function renderFrame() {
  if (state.contextLost || state.error) return;
  renderer.render(scene, camera); state.frames++;
}
function schedule() {
  if (state.rafId || !state.ready || controller.state.paused || document.hidden || state.contextLost) return;
  state.rafId = requestAnimationFrame(tick); state.maxPendingRaf = Math.max(state.maxPendingRaf, 1);
}
function tick(time) {
  state.rafId = 0;
  if (!state.ready || controller.state.paused || document.hidden || state.contextLost) { state.previousTime = null; return; }
  const dt = state.previousTime === null ? 0 : (time - state.previousTime) / 1000;
  state.previousTime = time;
  controller.step(dt);
  switchAction(controller.state.mode);
  mixer.update(controller.state.delta);
  // Controller owns world X/Z. Preserve the source's Y bob, bone rotation and limb articulation.
  bones.Hips.position.x = restHipsXZ[0]; bones.Hips.position.z = restHipsXZ[1];
  anchor.position.set(controller.state.x, 0, controller.state.z); anchor.rotation.y = controller.state.yaw;
  shadow.position.set(controller.state.x, 0.006, controller.state.z);
  model.updateMatrixWorld(true);
  if (helper.visible) helper.updateMatrixWorld(true);
  renderFrame();
  if (time - state.lastUi >= 100) { updateMetrics(); state.lastUi = time; }
  schedule();
}

function pause(value) {
  if (!state.ready) return;
  controller.setPaused(value); cancelFrame(); updateControls(); updateMetrics();
  renderFrame(); schedule();
}
function restart() {
  if (!state.ready) return;
  cancelFrame(); controller.reset();
  mixer.stopAllAction(); mixer.setTime(0); currentAction = null; switchAction('idle'); mixer.update(0);
  bones.Hips.position.x = restHipsXZ[0]; bones.Hips.position.z = restHipsXZ[1];
  anchor.position.set(0, 0, 0); anchor.rotation.y = 0; shadow.position.set(0, 0.006, 0);
  model.updateMatrixWorld(true); updateControls(); updateMetrics(); renderFrame(); schedule();
}
function bindControls() {
  for (const id of ['idle', 'walk', 'run']) $(id).addEventListener('click', () => { controller.setMode(id); switchAction(id); updateControls(); updateMetrics(); });
  $('demo').addEventListener('change', () => { controller.setDemo($('demo').checked); updateControls(); });
  $('rotate').addEventListener('change', () => { controller.setAutoRotate($('rotate').checked); updateControls(); });
  $('skeleton').addEventListener('change', () => { helper.visible = $('skeleton').checked; renderFrame(); });
  $('zoom').addEventListener('input', () => { camera.zoom = Math.max(C.zoomMin, Math.min(C.zoomMax, Number($('zoom').value) / 100)); camera.updateProjectionMatrix(); leaf('zoom-label', `${Math.round(camera.zoom * 100)}%`); renderFrame(); });
  $('pause').addEventListener('click', () => pause(!controller.state.paused));
  $('reset').addEventListener('click', restart);
  window.addEventListener('keydown', event => {
    if (!state.ready || event.target instanceof HTMLInputElement) return;
    if (event.code === 'Space' && !(event.target instanceof HTMLButtonElement)) {
      event.preventDefault(); if (!event.repeat) pause(!controller.state.paused); return;
    }
    if (controller.setKey(event.code, true)) { event.preventDefault(); updateControls(); }
  });
  window.addEventListener('keyup', event => { if (controller.setKey(event.code, false)) event.preventDefault(); });
  window.addEventListener('blur', () => { controller.clearInput(); });
  document.addEventListener('visibilitychange', () => {
    controller.clearInput(); cancelFrame();
    if (!document.hidden) schedule();
  });
  window.addEventListener('pagehide', () => { cancelFrame(); controller.clearInput(); resizeObserver?.disconnect(); });
}

function snapshot() {
  const clipState = {};
  for (const id of Object.keys(actions)) {
    const action = actions[id];
    clipState[id] = Object.freeze({ name: state.sourceClipNames[id], duration: action.getClip().duration,
      weight: action.getEffectiveWeight(), time: action.time, running: action.isRunning() });
  }
  const samples = {};
  for (const name of ['Hips', 'LeftLeg', 'RightLeg', 'LeftArm']) if (bones[name]) {
    samples[name] = Object.freeze({ position: Object.freeze(bones[name].position.toArray()), quaternion: Object.freeze(bones[name].quaternion.toArray()) });
  }
  return Object.freeze({ ready: state.ready, error: state.error, controller: controller.snapshot(), frames: state.frames,
    raf: Object.freeze({ pending: state.rafId ? 1 : 0, maxPending: state.maxPendingRaf }), clips: Object.freeze(clipState),
    skeleton: Object.freeze({ boneCount: state.boneCount, meshCount: state.meshCount, helperVisible: helper?.visible || false,
      contractVerified: state.contractVerified, hipsXZ: bones.Hips ? Object.freeze([bones.Hips.position.x, bones.Hips.position.z]) : null,
      restHipsXZ: restHipsXZ ? Object.freeze([...restHipsXZ]) : null, samples: Object.freeze(samples) }),
    model: Object.freeze({ targetHeight: C.targetHeight, scale: state.scale, footOffset: state.footOffset }),
    renderer: Object.freeze({ width: renderer?.domElement.width || 0, height: renderer?.domElement.height || 0,
      pixelRatio: renderer?.getPixelRatio() || 0, contextLost: state.contextLost }),
    assets: Object.freeze({ requests: state.loads, disposedMotionModels: state.disposedMotionModels, runtime: THREE.REVISION }),
  });
}
Object.defineProperty(window, '__rigMotionLab', { value: Object.freeze({ snapshot }), writable: false, configurable: false });

async function init() {
  try {
    buildStage();
    if (state.error || state.contextLost) return;
    const loader = new GLTFLoader();
    state.loads++;
    const idle = await loader.loadAsync(sources.idle);
    if (state.contextLost) { releaseMotionModel(idle); return; }
    model = idle.scene;
    const signature = describeSkeleton(model);
    const idleClip = verifiedClip(idle, 'idle', signature);
    model.traverse(node => {
      if (node.isBone) bones[node.name] = node;
      if (node.isSkinnedMesh) {
        state.meshCount++;
        node.frustumCulled = false;
        if (Array.isArray(node.material)) node.material.forEach(material => { material.side = THREE.DoubleSide; });
        else if (node.material) node.material.side = THREE.DoubleSide;
      }
    });
    state.boneCount = signature.length;
    restHipsXZ = [bones.Hips.position.x, bones.Hips.position.z];
    model.updateMatrixWorld(true);
    const originalBox = new THREE.Box3().setFromObject(model);
    const size = originalBox.getSize(new THREE.Vector3());
    if (!Number.isFinite(size.y) || size.y <= 0) throw new Error('모델 크기를 확인할 수 없습니다.');
    state.scale = C.targetHeight / size.y; model.scale.multiplyScalar(state.scale);
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model), center = box.getCenter(new THREE.Vector3());
    state.footOffset = -box.min.y;
    model.position.set(-center.x, state.footOffset, -center.z);
    anchor.add(model);
    mixer = new THREE.AnimationMixer(model); actions.idle = mixer.clipAction(idleClip);
    for (const id of ['walk', 'run']) {
      loading(`${modeLabels[id]} 본 계약 확인 중`, '동일한 24개 본과 바인드 포즈, 트랙 대상이 일치하는지 확인합니다.');
      state.loads++;
      const sibling = await loader.loadAsync(sources[id]);
      try {
        if (state.contextLost) return;
        const clip = verifiedClip(sibling, id, signature);
        actions[id] = mixer.clipAction(clip);
      } finally { releaseMotionModel(sibling); }
    }
    state.contractVerified = true;
    helper = new THREE.SkeletonHelper(model);
    helper.material.depthTest = false; helper.material.transparent = true; helper.material.opacity = 0.95;
    helper.renderOrder = 20; helper.visible = false; scene.add(helper);
    switchAction('idle'); mixer.update(0);
    bones.Hips.position.x = restHipsXZ[0]; bones.Hips.position.z = restHipsXZ[1];
    model.updateMatrixWorld(true);
    anchor.visible = true; state.ready = true; $('loading').hidden = true;
    controls.forEach(control => { control.disabled = false; });
    leaf('metric-bones', '24개 본 / 메시 1개');
    leaf('status', '동일 바인드·72개 트랙 연결 확인. 리깅 모션 3종 준비 완료. 본편 캐릭터는 그대로입니다.');
    bindControls(); updateControls(); updateMetrics(); renderFrame(); schedule();
  } catch (error) { fail(error); }
}
init();
