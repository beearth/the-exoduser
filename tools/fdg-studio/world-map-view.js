import { fitWorldMap, terrainFootprints, cameraGroundFootprint, worldGraph } from '../../engine/fdg/world-map.js';
const $ = id => document.getElementById(id);
const leaf = (node, value) => { if (node.children.length) throw new Error('Map label must be a leaf'); node.textContent = String(value); };

export class WorldMapView {
  constructor({ select, pause, changed }) {
    Object.assign(this, { select, pause, changed }); this.mode = null; this.live = null; this.geometry = null; this.footprints = [];
    this.listeners = [];
    const listen = (id, fn) => { $(id).addEventListener('click', fn); this.listeners.push(() => $(id).removeEventListener('click', fn)); };
    listen('world-map-toggle', () => this.toggle('region')); listen('world-graph-toggle', () => this.toggle('graph'));
    listen('world-map-close', () => this.toggle(null));
    this.resize = new ResizeObserver(() => this.draw()); this.resize.observe($('world-map-host'));
  }
  toggle(mode) {
    this.mode = this.mode === mode ? null : mode; this.pause(); this.changed(); this.draw();
  }
  update(world, owner, visible, selection) {
    this.live = { world, owner, visible, selection };
    const scene = visible && owner?.getTerrainSceneSnapshot() ? owner.project.terrainScene : null;
    if (scene !== this.geometry) { this.geometry = scene; this.footprints = scene ? terrainFootprints(scene) : []; }
    this.draw();
  }
  surface(canvas) {
    const rect = canvas.getBoundingClientRect(), width = Math.max(1, Math.round(rect.width)), height = Math.max(1, Math.round(rect.height));
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) { canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio); }
    const ctx = canvas.getContext('2d'); ctx.setTransform(ratio, 0, 0, ratio, 0, 0); ctx.clearRect(0, 0, width, height);
    return { ctx, width, height };
  }
  draw() {
    const live = this.live, show = live?.visible && !!live.world;
    $('world-map-host').hidden = !show; $('world-mini').hidden = !show || !this.geometry;
    $('world-map-overlay').hidden = !show || !this.mode;
    $('world-map-toggle').setAttribute('aria-pressed', String(this.mode === 'region'));
    $('world-graph-toggle').setAttribute('aria-pressed', String(this.mode === 'graph'));
    if (!show) return;
    if (this.geometry) this.drawRegion($('world-minimap'), true);
    if (!this.mode) return;
    leaf($('world-map-title'), this.mode === 'graph' ? '월드 연결 · 노드 선택은 속성 편집' : '현재 지역 지도 · 실제 이동 위치');
    $('world-graph-nodes').hidden = this.mode !== 'graph';
    if (this.mode === 'graph') this.drawGraph(); else this.drawRegion($('world-map-canvas'), false);
  }
  drawRegion(canvas, mini) {
    const { ctx, width, height } = this.surface(canvas), { world, owner } = this.live, scene = this.geometry;
    ctx.fillStyle = '#0b121a'; ctx.fillRect(0, 0, width, height);
    if (!scene) { ctx.fillStyle = '#d9b879'; ctx.font = '12px sans-serif'; ctx.fillText('장면 연결 대기', 15, 30); leaf($('world-map-position'), `${world.state.activeAreaKey} · 지형 연결 대기`); delete canvas.dataset.actorPosition; delete canvas.dataset.areaKey; return; }
    const fit = fitWorldMap(scene.bounds, width, height, mini ? 7 : 24), project = fit.project;
    const polygon = (points, fill, stroke, dash = []) => {
      ctx.beginPath(); points.forEach((point, index) => { const [x, y] = project(point); if (index) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); ctx.closePath();
      if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.setLineDash(dash); ctx.strokeStyle = stroke; ctx.stroke(); ctx.setLineDash([]); }
    };
    const b = scene.bounds, bounds = [[b.x, b.y], [b.x + b.width, b.y], [b.x + b.width, b.y + b.depth], [b.x, b.y + b.depth]];
    polygon(bounds, '#1c2a31', '#55717c'); ctx.save(); ctx.clip();
    for (const value of this.footprints) polygon(value.points, value.color, value.walkable ? '#c9d7c655' : '#ee978c');
    const snapshot = owner.getTerrainSceneSnapshot();
    if (snapshot) polygon(cameraGroundFootprint(owner.camera, snapshot.camera, owner.width, owner.height), '#7197ba12', '#7a9bbbaa', [3, 3]);
    ctx.restore();
    const labels = [];
    const mark = (position, color, radius, label, square = false) => {
      const [x, y] = project(position); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 1.5;
      ctx.beginPath(); if (square) ctx.rect(x - radius, y - radius, radius * 2, radius * 2); else ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.stroke();
      if (!mini && label) labels.push({ label, color });
    };
    const area = world.areas.find(value => value.areaKey === world.state.activeAreaKey);
    for (const entry of area.entrances) if (entry.position) mark(entry.position, '#8faab7', 3, `입구 ${entry.id}`, true);
    for (const exit of area.exits) if (exit.position) {
      const edge = world.transitions.find(value => value.id === exit.transitionId), open = edge.enabled && (edge.gateKey === null || world.progress[edge.gateKey]);
      mark(exit.position, open ? '#76c3b0' : '#dfbb79', Math.max(3, exit.radius * fit.scale), open ? '출구' : '잠긴 출구');
    }
    for (const point of world.waypoints || []) if (point.areaKey === area.areaKey) {
      const state = world.state.waypoints?.[point.id], color = state?.active ? '#8fe9df' : state?.discovered ? '#e7c782' : '#647681';
      mark(point.position, color, 4, `${point.name} · ${state?.active ? '활성' : state?.discovered ? '발견' : '미발견'}`, true);
      if (!mini) { mark(point.position, color + '66', point.discoveryRadius * fit.scale); mark(point.position, color + '99', point.activationRadius * fit.scale); }
    }
    if (snapshot) {
      const [x, y] = project(snapshot.position); ctx.fillStyle = '#eff7bd'; ctx.beginPath(); ctx.arc(x, y, mini ? 3 : 5, 0, Math.PI * 2); ctx.fill();
      const [cx, cy] = project([owner.camera.x, owner.camera.y]); ctx.strokeStyle = '#8ca9d3'; ctx.beginPath(); ctx.moveTo(cx - 4, cy); ctx.lineTo(cx + 4, cy); ctx.moveTo(cx, cy - 4); ctx.lineTo(cx, cy + 4); ctx.stroke();
      leaf($('world-map-position'), `${area.areaKey} · X ${snapshot.position[0].toFixed(1)} Y ${snapshot.position[1].toFixed(1)} Z ${snapshot.position[2].toFixed(1)} · 카메라 ${owner.camera.x.toFixed(1)}, ${owner.camera.y.toFixed(1)}`);
    }
    if (!mini) { ctx.font = '10px sans-serif'; labels.forEach(({ label, color }, index) => { ctx.fillStyle = color; ctx.fillText(label, 8, 15 + index * 15); }); }
    canvas.dataset.areaKey = area.areaKey;
    if (snapshot) canvas.dataset.actorPosition = snapshot.position.join(',');
  }
  drawGraph() {
    const { ctx, width, height } = this.surface($('world-map-canvas')), { world, selection } = this.live, graph = worldGraph(world);
    ctx.fillStyle = '#0b121a'; ctx.fillRect(0, 0, width, height);
    const nodeXY = node => [40 + node.x * Math.max(1, width - 80), 25 + node.y * Math.max(1, height - 50)], byKey = new Map(graph.nodes.map(node => [node.areaKey, node]));
    ctx.font = '11px sans-serif'; ctx.lineWidth = 2;
    for (let index = 0; index < graph.edges.length; index++) {
      const edge = graph.edges[index], [ax, ay] = nodeXY(byKey.get(edge.from)), [bx, by] = nodeXY(byKey.get(edge.to));
      const angle = Math.atan2(by - ay, bx - ax), offset = 8, x1 = ax + Math.cos(angle) * 24 - Math.sin(angle) * offset, y1 = ay + Math.sin(angle) * 24 + Math.cos(angle) * offset;
      const x2 = bx - Math.cos(angle) * 24 - Math.sin(angle) * offset, y2 = by - Math.sin(angle) * 24 + Math.cos(angle) * offset;
      ctx.strokeStyle = edge.open ? '#76c3b0' : '#dfbb79'; ctx.setLineDash(edge.enabled ? [] : [4, 4]);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x2 - 9 * Math.cos(angle - .45), y2 - 9 * Math.sin(angle - .45)); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 9 * Math.cos(angle + .45), y2 - 9 * Math.sin(angle + .45)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = ctx.strokeStyle; ctx.fillText(`${edge.id} · ${edge.open ? '통과' : '닫힘'}`, (ax + bx) / 2 - 48, (ay + by) / 2 + (index % 2 ? 32 : -24));
    }
    const signature = JSON.stringify({ nodes: graph.nodes, selection, width, height });
    if (signature !== this.graphSignature) {
      this.graphSignature = signature; const fragment = document.createDocumentFragment();
      for (const node of graph.nodes) {
        const button = document.createElement('button'); button.className = 'world-graph-node'; button.dataset.areaKey = node.areaKey;
        button.style.left = `${40 / width * 100 + node.x * (1 - 80 / width) * 100}%`; button.style.top = `${25 / height * 100 + node.y * (1 - 50 / height) * 100}%`;
        button.classList.toggle('current', node.active); button.classList.toggle('selected', selection === node.areaKey);
        leaf(button, `${node.active ? '● ' : ''}${node.name}`); button.addEventListener('click', () => this.select(node.areaKey)); fragment.append(button);
      }
      $('world-graph-nodes').replaceChildren(fragment);
    }
    leaf($('world-map-position'), `실제 연결 ${graph.edges.length}개 · 현재 ${world.state.activeAreaKey} · 편집 ${selection || '없음'}`);
  }
  dispose() { this.resize.disconnect(); for (const remove of this.listeners) remove(); this.listeners = []; this.live = null; this.geometry = null; this.footprints = []; $('world-graph-nodes').replaceChildren(); $('world-map-host').hidden = true; this.select = null; this.pause = null; this.changed = null; }
}
