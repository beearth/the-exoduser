// A separate visual trial. Units and input here do not alter game movement or combat.
export const RIG_MOTION_CONFIG = Object.freeze({
  walkSpeed: 1.35,
  runSpeed: 2.8,
  maxDelta: 0.05,
  turnResponse: 13,
  crossFadeSeconds: 0.22,
  worldLimit: 3.35,
  targetHeight: 2.2,
  demoPeriod: 16,
  orbitRadius: 1.65,
  rotationSpeed: 0.55,
  cameraElevation: 50,
  viewHeight: 6.8,
  pixelRatioLimit: 2,
  zoomMin: 0.7,
  zoomMax: 1.7,
});

export const MOVEMENT_CODES = Object.freeze([
  'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight',
  'ShiftLeft', 'ShiftRight',
]);

const TAU = Math.PI * 2;
const directionNames = ['남', '남동', '동', '북동', '북', '북서', '서', '남서'];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const shortestAngle = value => ((value + Math.PI) % TAU + TAU) % TAU - Math.PI;

export function createRigMotionController() {
  const keys = new Set();
  const state = {
    x: 0, z: 0, yaw: 0, targetYaw: 0, direction: 0,
    mode: 'idle', requestedMode: 'idle', speed: 0,
    paused: false, demo: true, autoRotate: false,
    elapsed: 0, delta: 0, inputCount: 0,
  };

  function clearInput() { keys.clear(); state.inputCount = 0; }
  function setKey(code, down) {
    if (MOVEMENT_CODES.indexOf(code) < 0) return false;
    if (down) {
      if (state.paused) return true;
      state.demo = false;
      state.autoRotate = false;
      state.requestedMode = 'idle';
      keys.add(code);
    } else keys.delete(code);
    state.inputCount = keys.size;
    return true;
  }
  function setPaused(value) { state.paused = Boolean(value); clearInput(); }
  function setDemo(value) {
    state.demo = Boolean(value); state.autoRotate = false;
    state.elapsed = 0; clearInput();
  }
  function setAutoRotate(value) {
    state.autoRotate = Boolean(value); state.demo = false; clearInput();
  }
  function setMode(mode) {
    if (['idle', 'walk', 'run'].indexOf(mode) < 0) throw new Error('지원하지 않는 모션');
    state.requestedMode = mode;
    state.demo = false; state.autoRotate = false; clearInput();
  }
  function reset() {
    const paused = state.paused;
    Object.assign(state, { x: 0, z: 0, yaw: 0, targetYaw: 0, direction: 0,
      mode: 'idle', requestedMode: 'idle', speed: 0, demo: true,
      autoRotate: false, elapsed: 0, delta: 0, paused });
    clearInput();
  }

  function step(seconds) {
    const dt = Number.isFinite(seconds) ? clamp(seconds, 0, RIG_MOTION_CONFIG.maxDelta) : 0;
    state.delta = state.paused ? 0 : dt;
    if (state.paused || dt === 0) return state;
    state.elapsed += dt;
    let vx = 0, vz = 0;
    let mode = state.requestedMode;
    if (state.demo) {
      const phase = state.elapsed % RIG_MOTION_CONFIG.demoPeriod;
      // 2 s idle, 6 s walking, 6 s running, 2 s idle. A circle keeps the trial on the pad.
      mode = phase < 2 || phase >= 14 ? 'idle' : phase < 8 ? 'walk' : 'run';
      if (mode !== 'idle') {
        const angle = Math.atan2(state.x, state.z);
        const radiusError = RIG_MOTION_CONFIG.orbitRadius - Math.hypot(state.x, state.z);
        vx = Math.cos(angle) + Math.sin(angle) * radiusError * 2;
        vz = -Math.sin(angle) + Math.cos(angle) * radiusError * 2;
      }
    } else {
      vx = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0)
        - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
      vz = (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0)
        - (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0);
      if (vx || vz) mode = keys.has('ShiftLeft') || keys.has('ShiftRight') ? 'run' : 'walk';
    }
    const length = Math.hypot(vx, vz);
    state.speed = length ? (mode === 'run' ? RIG_MOTION_CONFIG.runSpeed : RIG_MOTION_CONFIG.walkSpeed) : 0;
    if (length) {
      vx /= length; vz /= length;
      state.x = clamp(state.x + vx * state.speed * dt, -RIG_MOTION_CONFIG.worldLimit, RIG_MOTION_CONFIG.worldLimit);
      state.z = clamp(state.z + vz * state.speed * dt, -RIG_MOTION_CONFIG.worldLimit, RIG_MOTION_CONFIG.worldLimit);
      state.direction = (Math.round(Math.atan2(vx, vz) / (Math.PI / 4)) + 8) % 8;
      state.targetYaw = state.direction * Math.PI / 4;
    }
    if (state.autoRotate) state.targetYaw += RIG_MOTION_CONFIG.rotationSpeed * dt;
    state.yaw += shortestAngle(state.targetYaw - state.yaw) * (1 - Math.exp(-RIG_MOTION_CONFIG.turnResponse * dt));
    state.mode = mode;
    return state;
  }

  function snapshot() {
    return Object.freeze({ ...state, directionLabel: directionNames[state.direction], pressed: [...keys] });
  }
  return Object.freeze({ state, setKey, clearInput, setPaused, setDemo, setAutoRotate, setMode, reset, step, snapshot });
}

// Retargeting is allowed only for the already matching sibling skeleton, never by guessing.
export function validateSkeletonContract(base, candidate, epsilon = 0.00001) {
  const problems = [];
  if (!Array.isArray(base) || !Array.isArray(candidate) || base.length !== 24 || candidate.length !== 24) {
    return Object.freeze({ ok: false, problems: ['24개 본 계약 불일치'] });
  }
  for (let i = 0; i < base.length; i++) {
    const a = base[i], b = candidate[i];
    if (!a || !b || a.name !== b.name || a.parent !== b.parent) problems.push(`본 계층 불일치: ${i}`);
    for (const field of ['position', 'quaternion', 'scale', 'inverseBind']) {
      const av = a?.[field], bv = b?.[field];
      if (!Array.isArray(av) || !Array.isArray(bv) || av.length !== bv.length
        || av.some((v, k) => !Number.isFinite(v) || !Number.isFinite(bv[k]) || Math.abs(v - bv[k]) > epsilon)) {
        problems.push(`바인드 불일치: ${a?.name || i}/${field}`);
      }
    }
  }
  return Object.freeze({ ok: problems.length === 0, problems: Object.freeze(problems) });
}
