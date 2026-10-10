(function (root) {
  'use strict';
  if (typeof document === 'undefined') return;
  const FDG = root.FDG, canvas = document.getElementById('fdg-viewport');
  const keys = new Set();
  const listeners = [];
  let disposed = false, frameRequest = null;
  function listen(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    listeners.push(() => target.removeEventListener(type, handler, options));
  }
  class DemoActor extends FDG.Node {
    constructor(options = {}) { super(Object.assign({}, options, { type: 'DemoActor' })); }
    _physicsProcess(dt) {
      if (!this.properties.controlled) return;
      const dx = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'));
      const dy = Number(keys.has('s') || keys.has('arrowdown')) - Number(keys.has('w') || keys.has('arrowup'));
      const magnitude = Math.hypot(dx, dy) || 1;
      const speed = Number.isFinite(this.properties.speed) ? this.properties.speed : 120;
      this.position.x += dx / magnitude * speed * dt;
      this.position.y += dy / magnitude * speed * dt;
    }
  }
  const factories = { Sprite: payload => new FDG.SpriteNode({ id: payload.id, name: payload.name }),
    DemoActor: payload => new DemoActor({ id: payload.id, name: payload.name }) };
  let tree = new FDG.SceneTree();
  const actor = new DemoActor({ id: 'actor', name: '이동 테스트 노드' });
  actor.properties = { shape: 'actor', color: '#789eac', width: 42, height: 86, controlled: true, speed: 120 };
  tree.root.addChild(actor);
  const group = new FDG.Node({ id: 'group', name: '부모 변환 그룹' });
  group.position.x = 110; group.position.y = 20;
  tree.root.addChild(group);
  for (let i = 0; i < 3; i++) {
    const node = new FDG.Node({ id: 'marker-' + i, name: '자식 노드 ' + (i + 1) });
    node.position.x = i * 48; node.position.y = i * 36;
    node.properties = { shape: 'box', width: 28, height: 28, color: ['#deaa76', '#a7b583', '#b991ad'][i] };
    group.addChild(node);
  }
  const clip = new FDG.SpriteFrames({ imageUrl: '../assets/vfx/fieldboss/boss_fire_impact_24_20261010.png',
    frameWidth: 640, frameHeight: 640, columns: 6, rows: 4, frames: 24, fps: 16, loop: false });
  const effect = new FDG.SpriteNode({ id: 'effect', name: '24장 불꽃 효과', clip, width: 180, height: 180, blend: 'lighter' });
  effect.position.x = -130; effect.position.y = 55;
  tree.root.addChild(effect);
  const renderer = new FDG.Renderer25D(canvas, { tree });
  const editor = new FDG.Editor({ tree, renderer, rootElement: document.getElementById('fdg-editor'), factories,
    onTreeChange: next => { tree = next; renderer.setTree(next); } });
  editor.mount();
  editor.select(actor);
  const find = (id, node = tree.root) => {
    if (node.id === id) return node;
    for (const child of node.children) { const value = find(id, child); if (value) return value; }
    return null;
  };
  listen(document.getElementById('fdg-effect'), 'click', () => {
    const node = find('effect');
    if (node instanceof FDG.SpriteNode && node.clip) {
      node.animator.play(node.animator.name || 'default'); tree.paused = false; editor.refresh();
    }
  });
  listen(document.getElementById('fdg-projection'), 'click', event => {
    renderer.camera.projection = renderer.camera.projection === 'isometric' ? 'topdown' : 'isometric';
    event.currentTarget.textContent = renderer.camera.projection === 'isometric' ? '시점: 2.5D' : '시점: 탑다운';
  });
  listen(document.getElementById('fdg-camera-reset'), 'click', () => {
    Object.assign(renderer.camera, { x: 0, y: 0, zoom: 1 });
  });
  const position = event => { const rect = canvas.getBoundingClientRect(); return {
    x: (event.clientX - rect.left) * canvas.width / rect.width,
    y: (event.clientY - rect.top) * canvas.height / rect.height }; };
  let pan = null;
  listen(canvas, 'pointerdown', event => {
    canvas.focus();
    if (event.button === 1) { event.preventDefault(); pan = position(event); canvas.setPointerCapture(event.pointerId); }
    else if (event.button === 0) { const p = position(event); const node = renderer.hitTest(p.x, p.y); if (node) editor.select(node); }
  });
  listen(canvas, 'pointermove', event => {
    if (!pan) return;
    const p = position(event);
    renderer.camera.x -= (p.x - pan.x) / renderer.camera.zoom;
    renderer.camera.y -= (p.y - pan.y) / renderer.camera.zoom; pan = p;
  });
  const clearPan = () => { pan = null; };
  listen(canvas, 'pointerup', clearPan); listen(canvas, 'pointercancel', clearPan);
  listen(canvas, 'wheel', event => {
    event.preventDefault(); renderer.camera.zoom = Math.max(.25, Math.min(3, renderer.camera.zoom * Math.exp(-event.deltaY * .001)));
  }, { passive: false });
  const movementKeys = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright']);
  listen(canvas, 'keydown', event => { const key = event.key.toLowerCase(); if (movementKeys.has(key)) { keys.add(key); event.preventDefault(); } });
  listen(canvas, 'keyup', event => keys.delete(event.key.toLowerCase()));
  listen(canvas, 'blur', () => keys.clear());
  listen(root, 'blur', () => { keys.clear(); pan = null; });
  listen(document, 'visibilitychange', () => { if (document.hidden) { keys.clear(); previous = null; } });
  listen(root, 'pagehide', event => { if (!event.persisted) dispose(); });
  const statsLeaf = document.getElementById('fdg-stats');
  let previous = null, nextStats = 0;
  function dispose() {
    if (disposed) return false;
    disposed = true;
    if (frameRequest !== null && typeof root.cancelAnimationFrame === 'function') root.cancelAnimationFrame(frameRequest);
    frameRequest = null; keys.clear(); pan = null; previous = null;
    editor.destroy(); renderer.dispose();
    for (const remove of listeners.splice(0)) remove();
    return true;
  }
  function frame(timestamp) {
    if (disposed) return;
    const dt = previous === null ? 0 : (timestamp - previous) / 1000; previous = timestamp;
    tree.advance(dt);
    renderer.selection = editor.selected;
    const stats = renderer.render(tree);
    if (timestamp >= nextStats) {
      statsLeaf.textContent = '게임 시간 ' + tree.simulationTime.toFixed(2) + 's · 고정 틱 ' + (1 / tree.fixedStep).toFixed(1) + 'Hz · 표시 ' + stats.draws +
        ' · 아틀라스 ' + stats.sprites + ' · 로딩 대기 ' + stats.pending + ' · 오류 ' + stats.errors;
      nextStats = timestamp + 200;
      if (typeof editor.refresh === 'function') editor.refresh();
    }
    frameRequest = root.requestAnimationFrame(frame);
  }
  root.FDGDemo = { get tree() { return tree; }, get disposed() { return disposed; },
    renderer, editor, factories, report: () => tree.toJSON(), dispose };
  frameRequest = root.requestAnimationFrame(frame);
})(typeof globalThis !== 'undefined' ? globalThis : this);
