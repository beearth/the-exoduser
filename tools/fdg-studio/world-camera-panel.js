import { WORLD_CAMERA_DEFAULTS } from '../../engine/fdg/world-camera.js';

const $ = id => document.getElementById(id);
const degrees = value => value * 180 / Math.PI;

export class WorldCameraPanel {
  constructor({ getProject, getRuntime, isRunning, isReady, isWorld, change, status }) {
    Object.assign(this, { getProject, getRuntime, isRunning, isReady, isWorld, change, status });
    this.listeners = [];
    const listen = (id, callback) => {
      const node = $(id); node.addEventListener('change', callback);
      this.listeners.push(() => node.removeEventListener('change', callback));
    };
    listen('world-camera-projection', () => this.edit(next => {
      const mode = $('world-camera-projection').value;
      if (mode === 'legacy') delete next.viewCamera;
      else next.viewCamera = { ...WORLD_CAMERA_DEFAULTS, ...next.viewCamera, projection: mode };
    }));
    for (const key of ['distance', 'pitch', 'yaw', 'zoom']) listen(`world-camera-${key}`, () => this.edit(next => {
      const input = $(`world-camera-${key}`), value = input.value === '' ? NaN : Number(input.value);
      if (!next.viewCamera) return;
      let authored = ['pitch', 'yaw'].includes(key) ? value * Math.PI / 180 : value;
      // Degree/radian roundtrip at a valid endpoint must not create an invalid save.
      const bounds = key === 'pitch' ? [.35, 1.1] : key === 'yaw' ? [-Math.PI, Math.PI] : [];
      for (const bound of bounds) if (Math.abs(authored - bound) < 1e-12) authored = bound;
      next.viewCamera[key] = authored;
    }));
  }
  edit(mutate) {
    if (this.isRunning() || !this.isReady() || this.isWorld()) return;
    try {
      this.change('월드 카메라 저작', next => {
        const rig = this.getRuntime()?.captureRigScene();
        if (rig && next.rigScene) next.rigScene = rig;
        mutate(next);
      });
    } catch (error) { this.status(error.message, true); }
    this.refresh();
  }
  refresh() {
    const project = this.getProject();
    const incompatible = this.isWorld() || !!(project.sourcePreview || project.sourceScene || project.terrainScene);
    $('world-camera-toolbar').hidden = incompatible;
    const camera = project.viewCamera || WORLD_CAMERA_DEFAULTS;
    $('world-camera-projection').value = project.viewCamera?.projection || 'legacy';
    $('world-camera-projection').disabled = incompatible || this.isRunning() || !this.isReady();
    for (const key of ['distance', 'pitch', 'yaw', 'zoom']) {
      const input = $(`world-camera-${key}`);
      const angle = Number(degrees(camera[key]).toFixed(2));
      input.value = key === 'pitch' ? Math.max(degrees(.35), Math.min(degrees(1.1), angle)) : key === 'yaw' ? angle : camera[key];
      if (key === 'pitch') { input.min = degrees(.35); input.max = degrees(1.1); }
      input.disabled = !project.viewCamera || incompatible || this.isRunning() || !this.isReady();
    }
    const note = $('world-camera-state');
    if (note.children.length) throw new Error('Camera status must be a leaf');
    note.textContent = project.viewCamera ? '바닥·본체·FX 공통 시점 · WASD 이동' : '시점 선택으로 원근 카메라 연결';
  }
  dispose() { for (const remove of this.listeners) remove(); this.listeners = []; }
}
