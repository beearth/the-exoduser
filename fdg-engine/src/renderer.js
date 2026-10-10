(function (root) {
  'use strict';
  const FDG = root.FDG || (root.FDG = {});
  const ISO_X = Math.sqrt(3) / 2;
  const BLENDS = new Set(['source-over', 'lighter', 'multiply', 'screen']);

  class Renderer25D {
    constructor(canvas, options = {}) {
      if (!canvas || typeof canvas.getContext !== 'function') throw new TypeError('A Canvas is required');
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      if (!this.ctx) throw new Error('Canvas 2D is unavailable');
      this.tree = options.tree || null;
      this.resources = options.resources || new FDG.ResourceStore();
      this.camera = Object.assign({ x: 0, y: 0, zoom: 1, projection: 'isometric' }, options.camera);
      this.background = options.background || '#111722';
      this.selection = null;
      this.stats = {};
      this._hits = [];
      this._bound = new WeakMap();
    }

    setTree(tree) { this.tree = tree; this.selection = null; return this; }

    _validateCamera() {
      const c = this.camera;
      if (![c.x, c.y, c.zoom].every(Number.isFinite) || c.zoom <= 0) throw new RangeError('Invalid camera');
      if (c.projection !== 'isometric' && c.projection !== 'topdown') throw new RangeError('Unknown projection');
    }

    project(x, y, z = 0) {
      this._validateCamera();
      const c = this.camera;
      const px = c.projection === 'isometric' ? (x - y) * ISO_X : x;
      const py = c.projection === 'isometric' ? (x + y) * 0.5 - z : y - z;
      return { x: this.canvas.width / 2 + (px - c.x) * c.zoom,
        y: this.canvas.height * 0.58 + (py - c.y) * c.zoom };
    }

    screenToWorld(x, y, z = 0) {
      this._validateCamera();
      const c = this.camera;
      const px = (x - this.canvas.width / 2) / c.zoom + c.x;
      const py = (y - this.canvas.height * 0.58) / c.zoom + c.y + z;
      return c.projection === 'isometric'
        ? { x: py + px / (2 * ISO_X), y: py - px / (2 * ISO_X), z }
        : { x: px, y: py, z };
    }

    hitTest(x, y) {
      for (let i = this._hits.length - 1; i >= 0; i--) {
        const h = this._hits[i];
        const dx = x - h.x, dy = y - h.y;
        const det = h.a * h.d - h.b * h.c;
        const lx = (h.d * dx - h.c * dy) / det;
        const ly = (-h.b * dx + h.a * dy) / det;
        if (lx >= h.left && lx <= h.right && ly >= h.top && ly <= h.bottom) return h.node;
      }
      return null;
    }

    _collect(node, result) {
      if (!node.visible) return;
      const p = node.properties || {};
      if (typeof node.getDrawState === 'function' || p.shape) {
        const w = node.worldTransform();
        result.push({ node, w, order: result.length,
          depth: this.camera.projection === 'isometric' ? w.tx + w.ty : w.ty });
      }
      for (const child of node.children) this._collect(child, result);
    }

    _image(url) {
      const image = this.resources.getImage(url);
      if (image) return image;
      // ResourceStore shares both pending requests and failures. Render never retries a failure.
      if (this.resources.getState(url) === 'failed') { this.stats.errors++; return null; }
      this.resources.loadImage(url).catch(() => {});
      this.stats.pending++;
      return null;
    }

    _sprite(node) {
      const state = node.getDrawState();
      if (!state.imageUrl) return false;
      const image = this._image(state.imageUrl);
      if (!image) return false;
      const clip = node.clip;
      if (clip && this._bound.get(clip) !== image) {
        clip.bindImage(image);
        this._bound.set(clip, image);
      }
      const r = state.rect;
      const px = state.pivot.x * state.width, py = state.pivot.y * state.height;
      this.ctx.globalCompositeOperation = BLENDS.has(state.blend) ? state.blend : 'source-over';
      if (r) this.ctx.drawImage(image, r.x, r.y, r.width, r.height, -px, -py, state.width, state.height);
      else this.ctx.drawImage(image, -px, -py, state.width, state.height);
      this.stats.sprites++;
      return { left: -px, top: -py, right: state.width - px, bottom: state.height - py };
    }

    _shape(node) {
      const ctx = this.ctx, p = node.properties;
      const width = Number.isFinite(p.width) && p.width > 0 ? p.width : 36;
      const height = Number.isFinite(p.height) && p.height > 0 ? p.height : 64;
      ctx.fillStyle = typeof p.color === 'string' ? p.color : '#a9b8cf';
      ctx.strokeStyle = typeof p.stroke === 'string' ? p.stroke : '#e2eaf4';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (p.shape === 'ellipse') ctx.ellipse(0, 0, width / 2, height / 2, 0, 0, Math.PI * 2);
      else if (p.shape === 'actor') {
        ctx.moveTo(0, -height); ctx.lineTo(width / 2, -height * .22);
        ctx.lineTo(width * .3, 0); ctx.lineTo(-width * .3, 0); ctx.lineTo(-width / 2, -height * .22);
        ctx.closePath();
      } else ctx.rect(-width / 2, -height / 2, width, height);
      ctx.fill(); ctx.stroke();
      if (p.shape === 'actor') {
        ctx.fillStyle = '#eff4fa'; ctx.beginPath(); ctx.arc(0, -height * .78, width * .2, 0, Math.PI * 2); ctx.fill();
      }
      this.stats.shapes++;
      return { left: -width / 2, right: width / 2, top: p.shape === 'actor' ? -height : -height / 2,
        bottom: p.shape === 'actor' ? 0 : height / 2 };
    }

    render(tree = this.tree) {
      if (!tree || !tree.root) throw new TypeError('A SceneTree is required');
      this._validateCamera();
      const ctx = this.ctx, list = [];
      this.stats = { draws: 0, sprites: 0, shapes: 0, pending: 0, errors: 0, culled: 0 };
      this._hits = [];
      this._collect(tree.root, list);
      list.sort((a, b) => a.depth - b.depth || a.order - b.order);
      ctx.save();
      try {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = this.background; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (const item of list) {
          const { node, w } = item, point = this.project(w.tx, w.ty, w.z);
          const sx = Math.hypot(w.a, w.b) * this.camera.zoom;
          const sy = (w.a * w.d - w.b * w.c < 0 ? -1 : 1) * Math.hypot(w.c, w.d) * this.camera.zoom;
          if (!sx || !sy || !Number.isFinite(sx) || !Number.isFinite(sy)) continue;
          // Billboard bounds are tested conservatively; elevation does not change floor depth.
          const p = node.properties || {}, draw = typeof node.getDrawState === 'function' ? node.getDrawState() : null;
          const bound = Math.max(draw ? draw.width : p.width || 36, draw ? draw.height : p.height || 64) * Math.max(sx, Math.abs(sy));
          if (point.x + bound < 0 || point.y + bound < 0 || point.x - bound > this.canvas.width || point.y - bound > this.canvas.height) {
            this.stats.culled++; continue;
          }
          const a = w.a * this.camera.zoom, b = w.b * this.camera.zoom;
          const c = w.c * this.camera.zoom, d = w.d * this.camera.zoom;
          ctx.save();
          try {
            ctx.transform(a, b, c, d, point.x, point.y);
            ctx.globalAlpha = Number.isFinite(p.opacity) ? Math.max(0, Math.min(1, p.opacity)) : 1;
            const bounds = draw ? this._sprite(node) : this._shape(node);
            if (!bounds) continue;
            this.stats.draws++;
            this._hits.push(Object.assign({ node, x: point.x, y: point.y, a, b, c, d }, bounds));
            if (this.selection === node) {
              ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
              ctx.strokeStyle = '#ffcd78'; ctx.lineWidth = 1.5 / this.camera.zoom;
              ctx.strokeRect(bounds.left - 3, bounds.top - 3, bounds.right - bounds.left + 6, bounds.bottom - bounds.top + 6);
            }
          } catch (error) { this.stats.errors++; this.lastError = error; }
          finally { ctx.restore(); }
        }
      } finally { ctx.restore(); }
      return this.stats;
    }
  }

  FDG.Renderer25D = Renderer25D;
  if (typeof module !== 'undefined' && module.exports) module.exports = FDG;
})(typeof globalThis !== 'undefined' ? globalThis : this);
