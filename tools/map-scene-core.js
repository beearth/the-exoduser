/* Scene authoring contract. Coordinates are game world pixels, independent of image resolution. */
(function (root) {
  'use strict';
  const clone = value => JSON.parse(JSON.stringify(value));
  function serializedBytes(value) {
    const s = JSON.stringify(value); let size = s.length;
    if (!/[^\x00-\x7f]/.test(s)) return size;
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      if (c > 0x7f && c <= 0x7ff) size++;
      else if (c >= 0xd800 && c <= 0xdbff && s.charCodeAt(i+1) >= 0xdc00 && s.charCodeAt(i+1) <= 0xdfff) { size += 2; i++; }
      else if (c > 0x7ff) size += 2;
    }
    return size;
  }
  const number = (v, lo, hi, label) => {
    if (typeof v !== 'number' || !Number.isFinite(v) || v < lo || v > hi) throw new Error(label + ' 범위 오류');
    return v;
  };
  const string = (v, label, max = 160) => {
    if (typeof v !== 'string' || !v.trim() || v.length > max) throw new Error(label + ' 오류');
    return v;
  };
  function source(src) {
    string(src, '이미지 경로', 14000000);
    if (/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(src)) return src;
    if (!/^(assets|img)\/[A-Za-z0-9_./ -]+\.(png|jpe?g|webp)$/i.test(src) || src.split('/').includes('..')) throw new Error('프로젝트 이미지 경로만 사용하세요');
    return src;
  }
  function projectSource(src) {
    string(src, '씬 경로', 400);
    if (!/^assets\/map\/[A-Za-z0-9_./ -]+\.scene\.json$/.test(src) || src.split('/').includes('..')) throw new Error('assets/map 아래 씬 파일을 선택하세요');
    return src;
  }
  function decode(rle, size) {
    if (!Array.isArray(rle) || rle.length % 2) throw new Error('보행 RLE 오류');
    const out = []; let total = 0;
    for (let i = 0; i < rle.length; i += 2) {
      if (![0, 1].includes(rle[i]) || !Number.isInteger(rle[i + 1]) || rle[i + 1] < 1 || total + rle[i + 1] > size) throw new Error('보행 RLE 길이 오류');
      total += rle[i + 1]; for (let j = 0; j < rle[i + 1]; j++) out.push(rle[i]);
    }
    if (total !== size) throw new Error('보행 RLE 전체 길이 불일치');
    return out;
  }
  function encode(grid) {
    const out = []; let v = grid[0], n = 0;
    for (const next of grid) { if (next !== v) { out.push(v, n); v = next; n = 0; } n++; }
    if (n) out.push(v, n); return out;
  }
  function validate(input) {
    if (!input || input.format !== 'exoduser-map-scene' || input.version !== 1) throw new Error('EXODUSER 씬 v1 파일이 아닙니다');
    const p = clone(input), w = p.world;
    string(p.name, '씬 이름');
    if (!w || !Number.isInteger(w.cols) || !Number.isInteger(w.rows)) throw new Error('월드 크기 오류');
    number(w.cols, 10, 300, '가로 타일'); number(w.rows, 10, 300, '세로 타일'); number(w.tileSize, 8, 128, '타일 크기');
    if (!Array.isArray(p.assets) || p.assets.length > 128 || !Array.isArray(p.layers) || p.layers.length < 1 || p.layers.length > 24) throw new Error('에셋/레이어 목록 오류');
    const assetIds = new Set(), layerIds = new Set(), objectIds = new Set(); let count = 0;
    for (const a of p.assets) {
      string(a.id, '에셋 ID'); string(a.name, '에셋 이름'); source(a.src);
      if (assetIds.has(a.id)) throw new Error('중복 에셋 ID'); assetIds.add(a.id);
      number(a.width, 1, 8192, '원본 너비'); number(a.height, 1, 8192, '원본 높이');
      if (!a.crop) throw new Error('에셋 crop 누락');
      number(a.crop.x, 0, a.width - 1, 'crop x'); number(a.crop.y, 0, a.height - 1, 'crop y');
      number(a.crop.w, 1, a.width - a.crop.x, 'crop 너비'); number(a.crop.h, 1, a.height - a.crop.y, 'crop 높이');
    }
    for (const l of p.layers) {
      string(l.id, '레이어 ID'); string(l.name, '레이어 이름');
      if (layerIds.has(l.id)) throw new Error('중복 레이어 ID'); layerIds.add(l.id);
      if (typeof l.visible !== 'boolean' || typeof l.locked !== 'boolean' || !['flat', 'foot'].includes(l.sort)) throw new Error('레이어 설정 오류');
      number(l.parallax, 0, 1, '시차');
      if (!Array.isArray(l.objects) || (count += l.objects.length) > 2000) throw new Error('오브젝트 목록 오류');
      for (const o of l.objects) {
        string(o.id, '오브젝트 ID'); string(o.name, '오브젝트 이름');
        if (objectIds.has(o.id) || !assetIds.has(o.assetId)) throw new Error('중복 ID 또는 없는 에셋'); objectIds.add(o.id);
        number(o.x, -40000, 40000, 'x'); number(o.y, -40000, 40000, 'y');
        number(o.width, 1, 32000, '월드 너비'); number(o.height, 1, 32000, '월드 높이');
        number(o.pivotX, 0, 1, '기준점 x'); number(o.pivotY, 0, 1, '기준점 y');
        number(o.rotation, -360, 360, '회전'); number(o.opacity, 0, 1, '불투명도');
        if (typeof o.flipX !== 'boolean') throw new Error('반전 설정 오류');
        if (o.mask !== undefined) {
          if (!Array.isArray(o.mask) || o.mask.length < 3 || o.mask.length > 256) throw new Error('실루엣 마스크 오류');
          for (const v of o.mask) { if (!Array.isArray(v) || v.length !== 2) throw new Error('마스크 점 오류'); number(v[0], 0, 1, '마스크 x'); number(v[1], 0, 1, '마스크 y'); }
        }
        if (o.maskFeather !== undefined) { number(o.maskFeather, 0, 160, '마스크 경계'); if (!o.mask) throw new Error('부드러운 경계에는 마스크가 필요합니다'); }
        if (o.sourceParallax !== undefined) { number(o.sourceParallax, 0, 1, '이미지 시차'); if (!o.mask) throw new Error('이미지 시차에는 고정 마스크가 필요합니다'); }
      }
    }
    if (!Array.isArray(p.walkable) || p.walkable.length !== w.cols * w.rows || !p.walkable.every(v => v === 0 || v === 1)) throw new Error('보행 그리드 오류');
    for (const key of ['start', 'exit']) {
      if (!p[key]) throw new Error(key + ' 누락');
      number(p[key].x, 0, w.cols * w.tileSize - 1, key + ' x'); number(p[key].y, 0, w.rows * w.tileSize - 1, key + ' y');
    }
    if (!Array.isArray(p.cameras) || p.cameras.length > 32) throw new Error('카메라 목록 오류');
    const cameraIds = new Set();
    for (const c of p.cameras) { string(c.id, '카메라 ID'); if (cameraIds.has(c.id)) throw new Error('중복 카메라 ID'); cameraIds.add(c.id); string(c.name, '카메라 이름'); number(c.x, 0, w.cols * w.tileSize, '카메라 x'); number(c.y, 0, w.rows * w.tileSize, '카메라 y'); }
    if (serializedBytes(p) > 32000000) throw new Error('프로젝트가 32MB를 넘습니다');
    return p;
  }
  function local(o, x, y) {
    const a = -o.rotation * Math.PI / 180, dx = x - o.x, dy = y - o.y;
    return { x: (dx * Math.cos(a) - dy * Math.sin(a)) * (o.flipX ? -1 : 1) + o.width * o.pivotX, y: dx * Math.sin(a) + dy * Math.cos(a) + o.height * o.pivotY };
  }
  function hit(o, x, y) {
    const q = local(o, x, y); if (q.x < 0 || q.y < 0 || q.x > o.width || q.y > o.height) return false;
    if (!o.mask) return true;
    let inside = false; const x1 = q.x / o.width, y1 = q.y / o.height;
    for (let i = 0, j = o.mask.length - 1; i < o.mask.length; j = i++) { const a = o.mask[i], b = o.mask[j]; if ((a[1] > y1) !== (b[1] > y1) && x1 < (b[0] - a[0]) * (y1 - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside; }
    return inside;
  }
  function canWalk(p, x, y, radius = 12) {
    const w = p.world, t = w.tileSize;
    for (const [dx, dy] of [[0, 0], [-radius, -radius], [radius, -radius], [-radius, radius], [radius, radius]]) {
      const tx = Math.floor((x + dx) / t), ty = Math.floor((y + dy) / t);
      if (tx < 0 || ty < 0 || tx >= w.cols || ty >= w.rows || !p.walkable[ty * w.cols + tx]) return false;
    }
    return true;
  }
  function resize(o, x, y, aspect, step = 1) {
    const q = local(o, x, y), a = o.rotation * Math.PI / 180, sign = o.flipX ? -1 : 1;
    let width = Math.max(1, Math.min(32000, Math.round(q.x / step) * step)), height = Math.max(1, Math.min(32000, Math.round(q.y / step) * step));
    if (aspect) {
      let scale = Math.abs(width/o.width-1) >= Math.abs(height/o.height-1) ? width/o.width : height/o.height;
      scale = Math.max(1/Math.min(o.width,o.height), Math.min(32000/Math.max(o.width,o.height), scale));
      width = o.width * scale; height = o.height * scale;
    }
    const dx = (width-o.width)*o.pivotX*sign, dy = (height-o.height)*o.pivotY;
    return { width, height, x:o.x+dx*Math.cos(a)-dy*Math.sin(a), y:o.y+dx*Math.sin(a)+dy*Math.cos(a) };
  }
  // Move the anchor to another bitmap-local point while preserving every rendered point.
  // The caller applies this detached result in one History transaction; the asset is unchanged.
  function reanchor(o, pivotX, pivotY) {
    if (!o || typeof o !== 'object' || Array.isArray(o)) throw new Error('기준점 오브젝트 오류');
    number(pivotX, 0, 1, '새 기준점 x'); number(pivotY, 0, 1, '새 기준점 y');
    number(o.x, -40000, 40000, 'x'); number(o.y, -40000, 40000, 'y');
    number(o.width, 1, 32000, '월드 너비'); number(o.height, 1, 32000, '월드 높이');
    number(o.pivotX, 0, 1, '기준점 x'); number(o.pivotY, 0, 1, '기준점 y');
    number(o.rotation, -360, 360, '회전');
    if (typeof o.flipX !== 'boolean') throw new Error('반전 설정 오류');
    const angle = o.rotation * Math.PI / 180, sign = o.flipX ? -1 : 1;
    const dx = (pivotX - o.pivotX) * o.width * sign, dy = (pivotY - o.pivotY) * o.height;
    const x = o.x + dx * Math.cos(angle) - dy * Math.sin(angle);
    const y = o.y + dx * Math.sin(angle) + dy * Math.cos(angle);
    number(x, -40000, 40000, '새 기준점 위치 x'); number(y, -40000, 40000, '새 기준점 위치 y');
    return { x, y, pivotX, pivotY };
  }
  function route(p) {
    const w = p.world, t = w.tileSize, sx = Math.floor(p.start.x / t), sy = Math.floor(p.start.y / t), ex = Math.floor(p.exit.x / t), ey = Math.floor(p.exit.y / t);
    if (!canWalk(p, p.start.x, p.start.y) || !canWalk(p, p.exit.x, p.exit.y)) return { pass: false, visited: 0, reason: '시작점 또는 출구가 막혀 있습니다' };
    const seen = new Uint8Array(w.cols * w.rows), q = [sy * w.cols + sx]; seen[q[0]] = 1;
    for (let i = 0; i < q.length; i++) {
      const id = q[i], x = id % w.cols, y = Math.floor(id / w.cols);
      if (x === ex && y === ey) return { pass: true, visited: q.length, reason: '시작 → 출구 연결됨' };
      for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
        const nx = x + dx, ny = y + dy, n = ny * w.cols + nx;
        if (nx >= 0 && ny >= 0 && nx < w.cols && ny < w.rows && !seen[n] && canWalk(p, (nx + .5) * t, (ny + .5) * t)) { seen[n] = 1; q.push(n); }
      }
    }
    return { pass: false, visited: q.length, reason: '출구로 이어지는 보행 경로가 없습니다' };
  }
  class History {
    constructor(project) { this.project = validate(project); this.undoStack = []; this.redoStack = []; this.pending = null; }
    begin() { if (!this.pending) this.pending = clone(this.project); }
    end() {
      if (!this.pending) return false;
      const before = this.pending; this.pending = null;
      if (JSON.stringify(before) === JSON.stringify(this.project)) return false;
      this.undoStack.push(before);
      // Large imported images must not multiply into an unbounded undo history.
      let bytes = this.undoStack.reduce((sum,p) => sum+serializedBytes(p),0);
      while (this.undoStack.length > 40 || (bytes > 64000000 && this.undoStack.length > 1)) bytes -= serializedBytes(this.undoStack.shift());
      this.redoStack = []; return true;
    }
    change(fn) { this.begin(); try { fn(this.project); this.project = validate(this.project); return this.end(); } catch (e) { this.project = this.pending; this.pending = null; throw e; } }
    import(input) { const next = validate(input); this.change(() => { this.project = next; }); }
    undo() { this.end(); if (!this.undoStack.length) return false; this.redoStack.push(clone(this.project)); this.project = this.undoStack.pop(); return true; }
    redo() { this.end(); if (!this.redoStack.length) return false; this.undoStack.push(clone(this.project)); this.project = this.redoStack.pop(); return true; }
  }
  const api = { clone, validate, projectSource, decode, encode, local, hit, canWalk, resize, reanchor, route, History };
  root.MapSceneCore = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
