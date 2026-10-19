import { evaluateRig } from '../../engine/fdg/rig.js?v=torso-depth-r7';
import { drawRigTextureTriangle, drawRigAuthoringTriangle, sortRigFaces } from '../../engine/fdg/rig-texture.js?v=torso-depth-r7';

const STEP = 1 / 60;
const copy = value => structuredClone(value);
export class RigPreview {
  constructor(canvas, project, onStats = () => {}) {
    this.canvas = canvas; this.context = canvas.getContext('2d'); this.onStats = onStats;
    this.state = 'paused'; this.raf = null; this.lastTimestamp = null; this.accumulator = 0;
    this.frames = 0; this.cpuMs = 0; this.droppedSteps = 0; this.transition = null; this.selection = {};
    this.textures = new Map(); this.textureDraws = 0; this.authoringDraws = 0;
    this.showBones = true;
    this.setProject(project);
    this.observer = new ResizeObserver(() => this.render()); this.observer.observe(canvas.parentElement);
  }
  setProject(project) {
    if (this.state === 'disposed') return;
    this.project = copy(project); this.clipId = project.preview.clipId; this.time = project.preview.time;
    this.materialId = project.preview.materialId;
    this.camera = { yaw: -.65, pitch: .32, zoom: 1, ...project.preview.camera };
    this._syncTextures();
    if (this.transition && this.transition.fromClipId !== null && !project.clips.some(clip => clip.id === this.transition.fromClipId)) this.transition = null;
    this.render();
  }
  _syncTextures() {
    const wanted = new Map(this.project.materials.flatMap(material => material.texture ? [[material.texture.src, material.texture]] : []));
    for (const [src, record] of this.textures) {
      const texture = wanted.get(src);
      if (texture && texture.width === record.width && texture.height === record.height && record.status !== 'error') continue;
      this.textures.delete(src); record.cancel?.(); record.image = null;
    }
    for (const [src, texture] of wanted) {
      if (this.textures.has(src)) continue;
      const record = { src, width: texture.width, height: texture.height, status: 'loading', error: null, image: null, cancel: null };
      this.textures.set(src, record);
      const ImageClass = this.canvas.ownerDocument?.defaultView?.Image || globalThis.Image;
      if (!ImageClass) { record.status = 'error'; record.error = 'Image loading is unavailable.'; continue; }
      const image = new ImageClass();
      const current = () => this.state !== 'disposed' && this.textures.get(src) === record;
      const detach = () => { image.onload = null; image.onerror = null; };
      record.cancel = () => { detach(); image.removeAttribute?.('src'); record.image = null; };
      const finish = error => {
        if (!current()) return;
        detach(); record.cancel = null; record.status = error ? 'error' : 'ready';
        record.error = error ? error.message : null; record.image = error ? null : image;
        this.render();
      };
      image.onload = async () => {
        try {
          if (typeof image.decode === 'function') await image.decode();
          if (!current()) return;
          if (image.naturalWidth !== texture.width || image.naturalHeight !== texture.height) throw new Error(`Texture must decode exactly ${texture.width}×${texture.height}: ${src}`);
          finish(null);
        } catch (error) { finish(error instanceof Error ? error : new Error(String(error))); }
      };
      image.onerror = () => finish(new Error(`Could not load texture: ${src}`));
      try { image.src = src.startsWith('/') ? src : `/${src}`; } catch (error) { finish(error); }
    }
  }
  setSelection(selection) { if (this.state === 'disposed') return; this.selection = { ...selection }; this.render(); }
  transitionFrom(clipId, time, duration = .25) {
    if (this.state === 'disposed') return;
    this.transition = { fromClipId: clipId, fromTime: time, duration, elapsed: 0 }; this.render();
  }
  play() {
    if (this.state === 'disposed' || this.state === 'running') return;
    this.state = 'running'; this.lastTimestamp = null; this.accumulator = 0; this.schedule(); this.render();
  }
  pause() {
    if (this.state === 'disposed') return;
    this.state = 'paused'; if (this.raf !== null) cancelAnimationFrame(this.raf);
    this.raf = null; this.lastTimestamp = null; this.accumulator = 0; this.render();
  }
  advance(dt) {
    if (this.state === 'disposed') return;
    this.time += dt;
    const clip = this.project.clips.find(clip => clip.id === this.clipId);
    if (clip) this.time = clip.loop ? this.time % clip.duration : Math.min(this.time, clip.duration);
    if (this.transition) {
      this.transition.elapsed += dt; this.transition.fromTime += dt;
      if (this.transition.elapsed + 1e-9 >= this.transition.duration) this.transition = null;
    }
  }
  step() {
    if (this.state === 'disposed') return;
    this.pause(); const clip = this.project.clips.find(clip => clip.id === this.clipId);
    this.advance(1 / (clip?.fps || 24)); this.render();
  }
  schedule() {
    if (this.state !== 'running' || this.raf !== null) return;
    this.raf = requestAnimationFrame(timestamp => {
      this.raf = null; if (this.state !== 'running') return;
      if (this.lastTimestamp !== null) {
        const raw = Math.max(0, (timestamp - this.lastTimestamp) / 1000), elapsed = Math.min(.25, raw);
        this.accumulator += elapsed; let steps = 0;
        while (this.accumulator + 1e-9 >= STEP && steps < 6) { this.advance(STEP); this.accumulator -= STEP; steps++; }
        const dropped = Math.floor((this.accumulator + 1e-9) / STEP);
        if (dropped > 0) { this.accumulator -= dropped * STEP; this.droppedSteps += dropped; }
        this.droppedSteps += Math.floor(Math.max(0, raw - elapsed) / STEP);
      }
      this.lastTimestamp = timestamp; this.frames++; this.render(); this.schedule();
    });
  }
  render() {
    if (this.state === 'disposed') return;
    const started = performance.now(), rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = Math.max(1, rect.width); this.height = Math.max(1, rect.height); this.dpr = Math.min(2, devicePixelRatio || 1);
    const width = Math.round(this.width * this.dpr), height = Math.round(this.height * this.dpr);
    if (this.canvas.width !== width) this.canvas.width = width;
    if (this.canvas.height !== height) this.canvas.height = height;
    this.result = evaluateRig(this.project, { clipId: this.clipId, time: this.time, materialId: this.materialId,
      blend: this.transition ? { fromClipId: this.transition.fromClipId, fromTime: this.transition.fromTime,
        amount: Math.min(1, this.transition.elapsed / this.transition.duration) } : null });
    const ctx = this.context; ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = '#101821'; ctx.fillRect(0, 0, this.width, this.height);
    const { yaw, pitch, zoom } = this.camera, scale = Math.min(this.width / 7, this.height / 4.5) * zoom;
    const project = ([x, y, z]) => {
      const rx = Math.cos(yaw) * x + Math.sin(yaw) * z, rz = -Math.sin(yaw) * x + Math.cos(yaw) * z;
      return { x: this.width / 2 + rx * scale, y: this.height * .84 - (Math.cos(pitch) * y - Math.sin(pitch) * rz) * scale,
        z: Math.sin(pitch) * y + Math.cos(pitch) * rz };
    };
    const line = (a, b, color, thickness = 1) => {
      const p = project(a), q = project(b); ctx.strokeStyle = color; ctx.lineWidth = thickness;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
    };
    for (let i = -3; i <= 3; i++) { line([i, 0, -3], [i, 0, 3], '#253442'); line([-3, 0, i], [3, 0, i], '#253442'); }
    line([0, 0, 0], [1, 0, 0], '#bc6562', 2); line([0, 0, 0], [0, 0, 1], '#5e8fc3', 2);
    const vertices = this.result.vertices, projected = vertices.map(project);
    const faces = sortRigFaces(this.result.triangles, projected, this.result.drawOrder);
    this.textureDraws = 0; this.authoringDraws = 0;
    if (this.result.texture) {
      const texture = this.result.texture, record = this.textures.get(texture.src);
      if (record?.status === 'ready') for (const { triangle, index } of faces) {
        const color = this.result.faceColors?.[index];
        if (color) this.authoringDraws += drawRigAuthoringTriangle(ctx, { color, triangle, projected });
        else this.textureDraws += drawRigTextureTriangle(ctx, record.image, { texture, uvs: this.result.uvs, triangle, projected });
      }
      else {
        ctx.fillStyle = record?.status === 'error' ? '#f3a49a' : '#d7dfad'; ctx.font = '12px sans-serif';
        ctx.fillText(record?.status === 'error' ? `TEXTURE ERROR · ${record.error}` : `TEXTURE LOADING · ${texture.src}`, 14, 22);
      }
    } else {
    const rgb = this.result.color.slice(1).match(/../g).map(value => parseInt(value, 16));
    for (const { triangle, index } of faces) {
      const color = this.result.faceColors?.[index];
      if (color) { this.authoringDraws += drawRigAuthoringTriangle(ctx, { color, triangle, projected }); continue; }
      const [a, b, c] = triangle.map(index => vertices[index]), u = b.map((value, i) => value - a[i]), v = c.map((value, i) => value - a[i]);
      const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      const length = Math.hypot(...n) || 1, shade = .35 + .65 * Math.max(0, (-.4 * n[0] + .8 * n[1] + .6 * n[2]) / length / Math.sqrt(1.16));
      ctx.fillStyle = `rgb(${rgb.map(value => Math.round(value * shade)).join(',')})`; ctx.strokeStyle = '#17232ba0'; ctx.lineWidth = .8;
      ctx.beginPath(); triangle.forEach((index, i) => { const point = projected[index]; i ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y); }); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    }
    const bones = new Map(this.result.bonePositions.map(bone => [bone.id, bone]));
    if (this.showBones) for (const bone of bones.values()) {
      const selected = this.selection.boneId === bone.id;
      if (bone.parent) line(bones.get(bone.parent).position, bone.position, selected ? '#e5eb91' : '#81d5ce', 3);
      const p = project(bone.position); ctx.fillStyle = selected ? '#e5eb91' : '#81d5ce'; ctx.beginPath(); ctx.arc(p.x, p.y, selected ? 6 : 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#e1eeee'; ctx.font = '11px sans-serif'; ctx.fillText(this.project.skeleton.bones.find(item => item.id === bone.id).name, p.x + 9, p.y - 4);
    }
    const selectedVertex = projected[this.selection.vertexIndex];
    if (this.showBones && selectedVertex) { ctx.fillStyle = '#ffe595'; ctx.beginPath(); ctx.arc(selectedVertex.x, selectedVertex.y, 5, 0, Math.PI * 2); ctx.fill(); }
    this.cpuMs = performance.now() - started; this.onStats(this.snapshot());
  }
  snapshot() {
    return copy({ state: this.state, time: this.time, clipId: this.clipId, materialId: this.materialId, frames: this.frames,
      transition: this.transition, vertices: this.result?.vertices || [], bonePositions: this.result?.bonePositions || [],
      cpuMs: this.cpuMs, droppedSteps: this.droppedSteps, renderer: 'cpu-canvas-3d', rafPending: this.raf !== null,
      showBones: this.showBones, textureDraws: this.textureDraws, authoringDraws: this.authoringDraws, textures: [...this.textures.values()].map(({ src, width, height, status, error }) => ({ src, width, height, status, error })),
      observers: this.observer ? 1 : 0, viewport: { width: this.width, height: this.height, dpr: this.dpr } });
  }
  dispose() {
    if (this.state === 'disposed') return;
    this.pause(); this.state = 'disposed'; this.observer?.disconnect(); this.observer = null;
    for (const record of this.textures.values()) { record.cancel?.(); record.image = null; }
    this.textures.clear(); this.textureDraws = 0; this.authoringDraws = 0;
    this.project = null; this.result = null; this.context = null; this.transition = null;
  }
}
