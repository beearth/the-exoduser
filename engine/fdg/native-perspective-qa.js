import { createWorldProjection, WORLD_CAMERA_DEFAULTS } from './world-camera.js';
import { createNativeWorldProjection, drawCanvasTexturedTriangle } from './native-world-projection.js?v=map-pack-east-visibility-cost-final-20261012';

export function isNativePerspectiveEntry(storageActive, search) {
  return storageActive === true && new URLSearchParams(search).get('fdgPerspective') === 'first';
}

// Keep native aiming consumers in their existing virtual-screen representation.
export function nativePointerTarget(projection, x, y, center, viewport) {
  const world = projection.unprojectGround(x, y);
  return world ? { x: world.x - center.x + viewport.width / 2,
    y: world.y - center.y + viewport.height / 2, world } : null;
}

export function nativeScreenFacing(projection, x, y, angle) {
  const a = projection.project(x, y), b = projection.project(x + Math.cos(angle), y + Math.sin(angle));
  return a.visible && b.visible ? Math.atan2(b.y - a.y, b.x - a.x) : angle;
}

export function installNativePerspectiveQa({ getView, getState, initialCamera = WORLD_CAMERA_DEFAULTS, deferBillboards = false, actorOcclusionCutaway = false, sceneName = null, document: doc = globalThis.document }) {
  const settings = { ...WORLD_CAMERA_DEFAULTS, ...initialCamera };
  const events = [];
  let shake = { x: 0, y: 0 }, pointerValid = true, frame = 0, lastFrame = null, rawContext = null;
  const adapter = createNativeWorldProjection({
    drawTexturedTriangle(raw, img, vertices, alpha) {
      if (typeof raw.drawProjectedTriangle === 'function') {
        raw.drawProjectedTriangle(img, vertices, alpha);
        return true;
      }
      drawCanvasTexturedTriangle(raw, img, vertices, alpha);
    }
  });
  function view() {
    const v = getView();
    return { ...v, camera: { ...settings, zoom: Math.max(.25, Math.min(2, settings.zoom * Math.max(.3, v.nativeZoom || 1))) } };
  }
  function inputProjection() {
    const v = view();
    return { v, p: createWorldProjection(v.camera, v.center, v.viewport) };
  }
  function inversePointer(x, y) {
    const { v, p } = inputProjection();
    const t = nativePointerTarget(p, x - shake.x, y - shake.y, v.center, v.viewport);
    pointerValid = !!t;
    return t;
  }
  function state() {
    const { v, p } = inputProjection(), s = getState();
    const point = a => { if (!a) return null; const q = p.project(a.x, a.y, 0);
      return { world: { x: a.x, y: a.y }, screen: { x: q.x + shake.x, y: q.y + shake.y },
        scale: q.scale, depth: q.depth, visible: q.visible }; };
    return { active: true, frame, settings: { ...settings }, effectiveCamera: v.camera,
      center: { ...v.center }, viewport: { ...v.viewport }, pixelScale: v.pixelScale,
      shake: { ...shake }, pointerValid, player: point(s.player), boss: point(s.boss),
      source: sceneName ? 'existing-native-scene-assets' : 'existing-v3-camera-consumer-only', persistence: 'transient-no-storage',
      render: lastFrame, events: events.slice() };
  }
  const panel = doc.createElement('details'); panel.id = 'fdgNativePerspectivePanel';
  panel.style.cssText = 'position:fixed;left:12px;top:52px;z-index:9100;width:260px;padding:9px;background:#101914e8;border:1px solid #77917a;color:#ecf0dc;font:12px sans-serif;border-radius:5px';
  const title = doc.createElement('summary'); title.textContent = '네이티브 원근 카메라 · 조절'; panel.append(title);
  const note = doc.createElement('p'); note.textContent = sceneName ? sceneName+' 카메라. 임시 설정이며 재열기 시 초기화됩니다.' : '기존 모델로 카메라 연결 검수. 임시 설정이며 재열기 시 초기화됩니다.'; panel.append(note);
  function changed(key, value) {
    settings[key] = value;
    if (events.length === 64) events.shift();
    events.push({ type: 'camera-control', key, value, at: performance.now() });
  }
  const select = doc.createElement('select'); select.id = 'fdgNativeProjectionMode';
  for (const [value, text] of [['perspective','원근'],['orthographic','평행 비교']]) {
    const o = doc.createElement('option'); o.value = value; o.textContent = text; select.append(o);
  }
  select.addEventListener('change', () => changed('projection', select.value)); panel.append(select);
  const controls = [];
  for (const [key, label, min, max, step] of [
    ['yaw','회전',-.785,.785,.005], ['pitch','내려보는 각도',.6,1.1,.005],
    ['distance','렌즈 거리',900,6000,50], ['zoom','표시 배율',.5,1.5,.01]
  ]) {
    const row = doc.createElement('label'); row.style.cssText = 'display:block;margin-top:8px';
    const text = doc.createElement('span'), value = doc.createElement('output');
    text.textContent = label + ' '; value.textContent = String(settings[key]);
    const input = doc.createElement('input'); input.id = 'fdgNativeCamera-' + key;
    input.type = 'range'; input.min = min; input.max = max; input.step = step; input.value = settings[key];
    input.style.width = '100%'; input.addEventListener('input', () => {
      changed(key, Number(input.value)); value.textContent = input.value;
    });
    row.append(text, value, input); panel.append(row); controls.push({ key, input, value });
  }
  const reset = doc.createElement('button'); reset.textContent = '카메라 초기화';
  reset.addEventListener('click', () => { Object.assign(settings, WORLD_CAMERA_DEFAULTS, initialCamera);
    select.value = settings.projection;
    for (const c of controls) { c.input.value = settings[c.key]; c.value.textContent = c.input.value; }
    changed('projection', settings.projection);
  }); panel.append(reset);
  const status = doc.createElement('p'); status.id = 'fdgNativePerspectiveStatus'; panel.append(status);
  doc.body.append(panel);
  const timer = setInterval(() => { const s = state();
    status.textContent = `${s.settings.projection} · ${s.viewport.width}×${s.viewport.height} · 지면 클릭 ${s.pointerValid ? '유효' : '지평선 밖'}`;
  }, 200);
  return {
    get active() { return adapter.active; },
    get context() { return adapter.context; },
    begin(raw, frameShake) { const v = view(); rawContext = raw; shake = { ...frameShake }; frame++;
      return adapter.begin(raw, { ...v, shake, deferBillboards, actorOcclusionCutaway }); },
    end() { lastFrame = adapter.snapshot(); adapter.end(); return rawContext; },
    pushBillboard: (...args) => adapter.pushBillboard(...args),
    popBillboard: () => adapter.popBillboard(),
    flushBillboards: () => adapter.flushBillboards(),
    resetWorld: () => adapter.resetWorld(),
    withGround: fn => adapter.withGround(fn),
    bounds() { const b = adapter.visibleBounds(); return b ? { left: b.minX, top: b.minY, right: b.maxX, bottom: b.maxY } : null; },
    inversePointer, snapshot: state,
    screenFacing(x, y, angle) { const { p } = inputProjection(); return nativeScreenFacing(p, x, y, angle); },
    uninstall() { clearInterval(timer); panel.remove(); }
  };
}
