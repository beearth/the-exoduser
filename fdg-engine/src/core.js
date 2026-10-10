/* FDG engine core: scene graph, explicit clocks, safe scene data and image cache. */
(function (global) {
  'use strict';
  const FDG = global.FDG || {};
  if (typeof FDG !== 'object' || FDG === null) throw new TypeError('FDG must be an object');
  const nodes = new WeakMap(), trees = new WeakMap();
  const forbidden = new Set(['__proto__', 'prototype', 'constructor']);
  let nextId = 1;

  function finite(value, label) {
    if (!Number.isFinite(value)) throw new TypeError(label + ' must be finite');
    return value;
  }
  function positive(value, label) {
    finite(value, label);
    if (value <= 0) throw new RangeError(label + ' must be positive');
    return value;
  }
  function text(value, label) {
    if (typeof value !== 'string' || !value.trim()) throw new TypeError(label + ' must be a nonempty string');
    return value;
  }
  function plain(value, label) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError(label + ' must be a plain object');
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) throw new TypeError(label + ' must be a plain object');
    return value;
  }
  function jsonCopy(value, active = new Set()) {
    if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
    if (typeof value === 'number') return finite(value, 'JSON number');
    if (!value || typeof value !== 'object') throw new TypeError('Scene values must be plain JSON');
    if (active.has(value)) throw new TypeError('Cyclic JSON is not supported');
    if (!Array.isArray(value)) plain(value, 'JSON object');
    active.add(value);
    const result = Array.isArray(value) ? [] : {};
    const keys = Reflect.ownKeys(value);
    for (const key of keys) {
      if (Array.isArray(value) && key === 'length') continue;
      if (typeof key !== 'string' || forbidden.has(key)) throw new TypeError('Unsafe JSON key');
      if (Array.isArray(value) && (!/^(0|[1-9][0-9]*)$/.test(key) || Number(key) >= value.length)) throw new TypeError('Array has non-JSON properties');
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor.enumerable || !Object.prototype.hasOwnProperty.call(descriptor, 'value')) throw new TypeError('JSON accessors and hidden properties are not supported');
      result[key] = jsonCopy(descriptor.value, active);
    }
    if (Array.isArray(value) && keys.length !== value.length + 1) throw new TypeError('Sparse JSON arrays are not supported');
    active.delete(value);
    return result;
  }
  function inputJSON(value) { return jsonCopy(typeof value === 'string' ? JSON.parse(value) : value); }
  function state(node) {
    const value = nodes.get(node);
    if (!value) throw new TypeError('Expected an FDG.Node');
    return value;
  }
  function collect(root) {
    const result = [], seen = new Set(), ids = new Set(), stack = [root];
    while (stack.length) {
      const node = stack.pop(), info = state(node);
      if (seen.has(node)) throw new TypeError('Cyclic or shared scene node');
      if (ids.has(info.id)) throw new TypeError('Duplicate scene id: ' + info.id);
      seen.add(node); ids.add(info.id); result.push(node);
      for (let i = info.children.length - 1; i >= 0; i--) {
        const child = info.children[i];
        if (state(child).parent !== node) throw new TypeError('Inconsistent scene parent');
        stack.push(child);
      }
    }
    return result;
  }
  function postorder(root) {
    const result = [], stack = [[root, false]];
    while (stack.length) {
      const [node, done] = stack.pop();
      if (done) { result.push(node); continue; }
      stack.push([node, true]);
      const children = state(node).children;
      for (let i = children.length - 1; i >= 0; i--) stack.push([children[i], false]);
    }
    return result;
  }
  function rootOf(node) {
    const seen = new Set();
    while (state(node).parent) {
      if (seen.has(node)) throw new TypeError('Cyclic parent chain');
      seen.add(node); node = state(node).parent;
    }
    return node;
  }
  function hookErrors(errors) {
    if (errors.length === 1) throw errors[0];
    if (errors.length) throw new AggregateError(errors, 'FDG lifecycle hooks failed');
  }
  function enter(root, tree) {
    const members = collect(root), info = trees.get(tree);
    for (const node of members) if (info.ids.has(node.id)) throw new TypeError('Duplicate scene id: ' + node.id);
    for (const node of members) { state(node).tree = tree; info.ids.set(node.id, node); }
    const errors = [];
    for (const node of postorder(root)) {
      const item = state(node);
      if (item.tree !== tree || item.ready) continue;
      item.ready = true;
      try { node._ready(); } catch (error) { errors.push(error); }
    }
    hookErrors(errors);
  }
  function leave(root, tree) {
    const members = collect(root), order = postorder(root), info = trees.get(tree);
    for (const node of members) {
      if (state(node).tree !== tree) continue;
      info.ids.delete(node.id); state(node).tree = null; state(node).ready = false;
    }
    const errors = [];
    for (const node of order) try { node._exitTree(); } catch (error) { errors.push(error); }
    hookErrors(errors);
  }
  function transform(node) {
    const p = plain(node.position, 'position'), s = plain(node.scale, 'scale');
    const x = finite(p.x, 'position.x'), y = finite(p.y, 'position.y'), z = finite(p.z, 'position.z');
    const sx = finite(s.x, 'scale.x'), sy = finite(s.y, 'scale.y'), angle = finite(node.rotation, 'rotation');
    const cosine = Math.cos(angle), sine = Math.sin(angle);
    return { a: cosine * sx, b: sine * sx, c: -sine * sy, d: cosine * sy, tx: x, ty: y, z };
  }

  class Node {
    constructor(options = {}) {
      plain(options, 'Node options');
      if (options.id === undefined && !Number.isSafeInteger(nextId)) throw new RangeError('Generated node id counter exhausted');
      const id = options.id === undefined ? 'fdg-node-' + nextId++ : text(options.id, 'id');
      const generatedPattern = /^fdg-node-([1-9][0-9]*)$/.exec(id);
      const reservedId = generatedPattern ? Number(generatedPattern[1]) : 0;
      if (options.id !== undefined && Number.isSafeInteger(reservedId) && reservedId >= nextId) nextId = reservedId + 1;
      nodes.set(this, { id, parent: null, tree: null, children: Object.freeze([]), ready: false });
      Object.defineProperties(this, {
        id: { enumerable: true, get: () => state(this).id },
        parent: { enumerable: false, get: () => state(this).parent },
        children: { enumerable: false, get: () => state(this).children },
        tree: { enumerable: false, get: () => state(this).tree }
      });
      this.name = options.name === undefined ? 'Node' : text(options.name, 'name');
      this.type = options.type === undefined ? 'Node' : text(options.type, 'type');
      this.position = { x: 0, y: 0, z: 0 }; this.rotation = 0; this.scale = { x: 1, y: 1 };
      this.visible = true; this.metadata = {}; this.properties = {};
    }
    addChild(child) {
      const childState = state(child), own = state(this);
      if (child === this) throw new TypeError('A node cannot parent itself');
      if (childState.parent === this) return child;
      if (childState.parent || childState.tree) throw new TypeError('Detach a node before giving it another parent');
      const incoming = collect(child);
      if (incoming.includes(this)) throw new TypeError('Scene parent cycle');
      const existing = new Set(collect(rootOf(this)).map(node => node.id));
      for (const node of incoming) if (existing.has(node.id)) throw new TypeError('Duplicate scene id: ' + node.id);
      own.children = Object.freeze([...own.children, child]); childState.parent = this;
      if (own.tree) enter(child, own.tree);
      return child;
    }
    removeChild(child) {
      const childState = state(child), own = state(this);
      if (childState.parent !== this) return null;
      const tree = own.tree;
      own.children = Object.freeze(own.children.filter(item => item !== child)); childState.parent = null;
      if (tree) leave(child, tree);
      return child;
    }
    worldTransform() {
      const chain = [], seen = new Set();
      for (let node = this; node; node = state(node).parent) {
        if (seen.has(node)) throw new TypeError('Cyclic parent chain');
        seen.add(node); chain.push(node);
      }
      let result = { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0, z: 0 };
      for (let i = chain.length - 1; i >= 0; i--) {
        const local = transform(chain[i]), parent = result;
        result = {
          a: parent.a * local.a + parent.c * local.b,
          b: parent.b * local.a + parent.d * local.b,
          c: parent.a * local.c + parent.c * local.d,
          d: parent.b * local.c + parent.d * local.d,
          tx: parent.a * local.tx + parent.c * local.ty + parent.tx,
          ty: parent.b * local.tx + parent.d * local.ty + parent.ty,
          z: parent.z + local.z
        };
        for (const [key, value] of Object.entries(result)) finite(value, 'worldTransform.' + key);
      }
      return result;
    }
    _ready() {}
    _exitTree() {}
    _physicsProcess(dt) {}
    _process(dt) {}
    _serializeProperties() { return this.properties; }
    _deserializeProperties(properties) { this.properties = jsonCopy(plain(properties, 'properties')); }
    toJSON() {
      collect(this);
      const records = new Map();
      for (const node of postorder(this)) {
        transform(node);
        if (typeof node.visible !== 'boolean') throw new TypeError('visible must be boolean');
        records.set(node, {
          type: text(node.type, 'type'), id: node.id, name: text(node.name, 'name'),
          position: jsonCopy(node.position), rotation: finite(node.rotation, 'rotation'), scale: jsonCopy(node.scale),
          visible: node.visible, metadata: jsonCopy(plain(node.metadata, 'metadata')),
          properties: jsonCopy(plain(node._serializeProperties(), 'properties')),
          children: state(node).children.map(child => records.get(child))
        });
      }
      return records.get(this);
    }
    static fromJSON(json, factories = {}) {
      const source = inputJSON(json); plain(factories, 'factories');
      for (const key of Reflect.ownKeys(factories)) if (typeof key !== 'string' || forbidden.has(key)) throw new TypeError('Unsafe factory key');
      const records = [], seenIds = new Set(), stack = [source];
      while (stack.length) {
        const record = stack.pop(); plain(record, 'node record');
        text(record.id, 'id'); text(record.type, 'type'); text(record.name, 'name');
        if (seenIds.has(record.id)) throw new TypeError('Duplicate scene id: ' + record.id);
        seenIds.add(record.id);
        transform({ position: record.position, rotation: record.rotation, scale: record.scale });
        if (typeof record.visible !== 'boolean' || !Array.isArray(record.children)) throw new TypeError('Invalid visible/children fields');
        plain(record.metadata, 'metadata'); plain(record.properties, 'properties'); records.push(record);
        for (let i = record.children.length - 1; i >= 0; i--) stack.push(record.children[i]);
      }
      const restored = new Map();
      for (const record of records) {
        const factory = Object.prototype.hasOwnProperty.call(factories, record.type) ? factories[record.type] : null;
        if (factory !== null && typeof factory !== 'function') throw new TypeError('Node factory must be a function');
        const node = factory ? factory(jsonCopy(record)) : new Node({ id: record.id, name: record.name, type: record.type });
        const info = state(node);
        if (info.parent || info.tree || info.children.length || node.id !== record.id) throw new TypeError('Factory must return an independent node with the same id');
        node.name = record.name; node.type = record.type; node.position = jsonCopy(record.position);
        node.rotation = record.rotation; node.scale = jsonCopy(record.scale); node.visible = record.visible;
        node.metadata = jsonCopy(record.metadata); node._deserializeProperties(jsonCopy(record.properties)); restored.set(record, node);
      }
      for (const record of records) for (const child of record.children) restored.get(record).addChild(restored.get(child));
      return restored.get(source);
    }
  }

  class SceneTree {
    constructor({ root = new Node({ name: 'Root' }), fixedStep = 1 / 60, maxFrameDelta = .25, maxSteps = 8 } = {}) {
      positive(fixedStep, 'fixedStep'); positive(maxFrameDelta, 'maxFrameDelta');
      if (!Number.isSafeInteger(maxSteps) || maxSteps <= 0) throw new RangeError('maxSteps must be a positive safe integer');
      if (!Number.isSafeInteger(Math.ceil(maxFrameDelta / fixedStep) + 1)) throw new RangeError('Clock step count must be representable');
      if (state(root).parent || state(root).tree) throw new TypeError('Scene root must be independent');
      collect(root);
      trees.set(this, { root, ids: new Map(), fixedStep, maxFrameDelta, maxSteps, paused: false, steps: 0, frames: 0, simulationTime: 0, accumulator: 0, droppedTime: 0, lastAdvance: null });
      enter(root, this);
    }
    get root() { return trees.get(this).root; }
    get fixedStep() { return trees.get(this).fixedStep; }
    get maxFrameDelta() { return trees.get(this).maxFrameDelta; }
    get maxSteps() { return trees.get(this).maxSteps; }
    get paused() { return trees.get(this).paused; }
    set paused(value) { if (typeof value !== 'boolean') throw new TypeError('paused must be boolean'); trees.get(this).paused = value; }
    get simulationTime() { return trees.get(this).simulationTime; }
    get steps() { return trees.get(this).steps; }
    get frameCount() { return trees.get(this).frames; }
    get accumulator() { return trees.get(this).accumulator; }
    get droppedTime() { return trees.get(this).droppedTime; }
    get lastAdvance() { return trees.get(this).lastAdvance; }
    getNode(id) { return trees.get(this).ids.get(id) || null; }
    _phase(hook, dt) {
      const errors = [];
      for (const node of collect(this.root)) {
        if (state(node).tree !== this) continue;
        try { node[hook](dt); } catch (error) { errors.push(error); }
      }
      hookErrors(errors);
    }
    _tick() {
      const info = trees.get(this);
      if (!Number.isSafeInteger(info.steps + 1)) throw new RangeError('Simulation step counter overflow');
      info.steps++; info.simulationTime = finite(info.steps * info.fixedStep, 'simulationTime');
      this._phase('_physicsProcess', info.fixedStep);
    }
    advance(dtSeconds) {
      finite(dtSeconds, 'dtSeconds'); if (dtSeconds < 0) throw new RangeError('dtSeconds must be nonnegative');
      const info = trees.get(this);
      if (info.paused) return info.lastAdvance = Object.freeze({ mode: 'advance', paused: true, inputDelta: dtSeconds, frameDelta: 0, steps: 0, totalSteps: info.steps, droppedDelta: 0, droppedSteps: 0, simulationTime: info.simulationTime });
      const accepted = Math.min(dtSeconds, info.maxFrameDelta), epsilon = info.fixedStep * 1e-9;
      info.accumulator += accepted;
      let steps = 0;
      while (info.accumulator + epsilon >= info.fixedStep && steps < info.maxSteps) {
        info.accumulator = Math.max(0, info.accumulator - info.fixedStep); this._tick(); steps++;
      }
      const droppedSteps = Math.floor((info.accumulator + epsilon) / info.fixedStep);
      info.accumulator = Math.max(0, info.accumulator - droppedSteps * info.fixedStep);
      const droppedDelta = dtSeconds - accepted + droppedSteps * info.fixedStep;
      info.droppedTime += droppedDelta; info.frames++; this._phase('_process', accepted);
      return info.lastAdvance = Object.freeze({ mode: 'advance', paused: false, inputDelta: dtSeconds, frameDelta: accepted, steps, totalSteps: info.steps, droppedDelta, droppedSteps, simulationTime: info.simulationTime });
    }
    stepOnce() {
      const info = trees.get(this); this._tick(); info.frames++; this._phase('_process', info.fixedStep);
      return info.lastAdvance = Object.freeze({ mode: 'manual', paused: info.paused, inputDelta: info.fixedStep, frameDelta: info.fixedStep, steps: 1, totalSteps: info.steps, droppedDelta: 0, droppedSteps: 0, simulationTime: info.simulationTime });
    }
    toJSON() {
      return { format: 'fdg-scene', version: 1, settings: { fixedStep: this.fixedStep, maxFrameDelta: this.maxFrameDelta, maxSteps: this.maxSteps, paused: this.paused }, root: this.root.toJSON() };
    }
    static fromJSON(json, factories = {}) {
      const source = inputJSON(json); plain(source, 'scene');
      if (source.format !== 'fdg-scene' || source.version !== 1) throw new TypeError('Unsupported FDG scene');
      const settings = source.settings === undefined ? {} : plain(source.settings, 'settings');
      if (settings.paused !== undefined && typeof settings.paused !== 'boolean') throw new TypeError('paused must be boolean');
      const tree = new SceneTree({ root: Node.fromJSON(source.root, factories), fixedStep: settings.fixedStep, maxFrameDelta: settings.maxFrameDelta, maxSteps: settings.maxSteps });
      if (settings.paused !== undefined) tree.paused = settings.paused;
      return tree;
    }
  }

  function imageSize(image) {
    if (!image || typeof image !== 'object') throw new TypeError('Expected an image');
    const natural = 'naturalWidth' in image || 'naturalHeight' in image;
    const width = natural ? image.naturalWidth : image.width, height = natural ? image.naturalHeight : image.height;
    if (!Number.isSafeInteger(width) || width <= 0 || !Number.isSafeInteger(height) || height <= 0) throw new TypeError('Image must have positive intrinsic dimensions');
  }
  class ResourceStore {
    constructor({ imageFactory } = {}) {
      if (imageFactory !== undefined && typeof imageFactory !== 'function') throw new TypeError('imageFactory must be a function');
      this._imageFactory = imageFactory || (() => { if (typeof global.Image !== 'function') throw new Error('Image is unavailable; inject imageFactory'); return new global.Image(); });
      this._entries = new Map(); this._leases = new WeakMap(); this._nextGeneration = 1;
    }
    _current(entry) {
      const current = this._entries.get(entry.url);
      return current === entry && current.generation === entry.generation;
    }
    _detach(entry) { const cleanup = entry.cleanup; entry.cleanup = null; if (cleanup) cleanup(); }
    _entry(url, pinned) {
      text(url, 'url');
      const cached = this._entries.get(url);
      if (cached) { if (pinned) cached.pinned = true; return cached; }
      if (!Number.isSafeInteger(this._nextGeneration)) throw new RangeError('Resource generation counter exhausted');
      const entry = { url, generation: this._nextGeneration++, state: 'loading', image: null, error: null, cleanup: null,
        resolve: null, reject: null, started: false, refCount: 0, pinned };
      entry.promise = new Promise((resolve, reject) => { entry.resolve = resolve; entry.reject = reject; });
      entry.promise.catch(() => {}); this._entries.set(url, entry);
      return entry;
    }
    _start(entry) {
      if (entry.started || !this._current(entry) || entry.state !== 'loading') return;
      entry.started = true;
      const fail = error => {
        if (!this._current(entry) || entry.state !== 'loading') return;
        this._detach(entry); entry.state = 'failed'; entry.error = error instanceof Error ? error : new Error('Image failed: ' + entry.url);
        entry.reject(entry.error); entry.resolve = null; entry.reject = null;
      };
      const ready = () => {
        if (!this._current(entry) || entry.state !== 'loading') return;
        try {
          imageSize(entry.image); this._detach(entry); entry.state = 'ready';
          entry.resolve(entry.image); entry.resolve = null; entry.reject = null;
        } catch (error) { fail(error); }
      };
      try {
        const image = this._imageFactory();
        if (!image || typeof image !== 'object') throw new TypeError('imageFactory must return an image');
        entry.image = image;
        if (typeof image.addEventListener === 'function' && typeof image.removeEventListener === 'function') {
          image.addEventListener('load', ready); image.addEventListener('error', fail);
          entry.cleanup = () => { image.removeEventListener('load', ready); image.removeEventListener('error', fail); };
        } else {
          const oldLoad = image.onload, oldError = image.onerror;
          const load = function (event) { try { if (typeof oldLoad === 'function') oldLoad.call(image, event); } finally { ready(); } };
          const error = function (event) { try { if (typeof oldError === 'function') oldError.call(image, event); } finally { fail(event); } };
          image.onload = load; image.onerror = error;
          entry.cleanup = () => { if (image.onload === load) image.onload = oldLoad; if (image.onerror === error) image.onerror = oldError; };
        }
        image.src = entry.url;
        if (image.complete) { try { imageSize(image); ready(); } catch (_) { /* Await the load/error event. */ } }
      } catch (error) { fail(error); }
    }
    loadImage(url) {
      const entry = this._entry(url, true); this._start(entry); return entry.promise;
    }
    acquireImage(url) {
      const entry = this._entry(url, false);
      if (!Number.isSafeInteger(entry.refCount + 1)) throw new RangeError('Image reference counter exhausted');
      let lease;
      lease = Object.freeze({ url: entry.url, generation: entry.generation, promise: entry.promise,
        release: () => this.releaseImage(lease), get released() { return store._leases.get(lease).released; } });
      const store = this;
      this._leases.set(lease, { entry, released: false }); entry.refCount++;
      this._start(entry); return lease;
    }
    releaseImage(lease) {
      const owner = this._leases.get(lease);
      if (!owner) throw new TypeError('Expected a lease from this ResourceStore');
      if (owner.released) return false;
      const entry = owner.entry; owner.released = true; owner.entry = null; entry.refCount--;
      if (!entry.refCount && !entry.pinned) this._remove(entry);
      return true;
    }
    _remove(entry) {
      if (!this._current(entry) || entry.refCount) return false;
      const pending = entry.state === 'loading', reject = entry.reject;
      this._entries.delete(entry.url); entry.state = 'released'; entry.pinned = false;
      try { this._detach(entry); }
      finally {
        entry.image = null; entry.resolve = null; entry.reject = null;
        if (pending) {
          const error = new Error('Image resource released: ' + entry.url);
          error.name = 'AbortError'; error.code = 'FDG_RESOURCE_RELEASED'; entry.error = error; reject(error);
        } else entry.error = null;
      }
      return true;
    }
    evictImage(url) {
      text(url, 'url'); const entry = this._entries.get(url); return entry ? this._remove(entry) : false;
    }
    clearUnused() {
      let count = 0;
      for (const entry of [...this._entries.values()]) if (this._remove(entry)) count++;
      return count;
    }
    registerImage(url, image) {
      text(url, 'url'); imageSize(image);
      const current = this._entries.get(url);
      if (current?.state === 'loading') {
        this._detach(current); current.pinned = true; current.image = image; current.state = 'ready'; current.started = true;
        current.resolve(image); current.resolve = null; current.reject = null; return image;
      }
      if (current) {
        current.pinned = true;
        if (current.state === 'ready' && current.image === image) return image;
        current.image = image; current.state = 'ready'; current.error = null; current.started = true; current.promise = Promise.resolve(image);
      } else {
        const entry = this._entry(url, true); entry.image = image; entry.state = 'ready'; entry.started = true;
        entry.resolve(image); entry.resolve = null; entry.reject = null;
      }
      return image;
    }
    getImage(url) { const entry = this._entries.get(url); return entry?.state === 'ready' ? entry.image : null; }
    getState(url) { return this._entries.get(url)?.state || 'missing'; }
    query(url) {
      const entry = this._entries.get(url);
      return Object.freeze({ url, state: entry?.state || 'missing', image: entry?.state === 'ready' ? entry.image : null,
        error: entry?.state === 'failed' ? entry.error : null, refCount: entry?.refCount || 0,
        pinned: entry?.pinned || false, generation: entry?.generation ?? null });
    }
    states() { return Object.freeze([...this._entries.keys()].map(url => this.query(url))); }
  }

  FDG.Node = Node; FDG.SceneTree = SceneTree; FDG.ResourceStore = ResourceStore;
  global.FDG = FDG;
  if (typeof module !== 'undefined' && module.exports) module.exports = FDG;
})(typeof globalThis !== 'undefined' ? globalThis : this);
