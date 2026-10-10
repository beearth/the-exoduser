'use strict';
// New resource ownership/disposal consumers only. No PNG decode or browser/GPU claim.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const engineDir = path.resolve(__dirname, '..');
const output = process.env.FDG_TEST_OUTPUT || path.join(require('node:os').tmpdir(), 'fdg-resource-lifecycle');
fs.mkdirSync(output, { recursive: true });
const witness = { scope: 'FDG_DEMO_RESOURCE_LIFECYCLE', checks: [], failures: [],
  productImageDecodes: 0, nativeBrowser: false, GPU: false };
const persist = () => fs.writeFileSync(path.join(output, 'demo-lifecycle-witness.json'), JSON.stringify(witness, null, 2));
function check(name, actual, expected) {
  witness.checks.push({ name, actual, expected }); persist();
  try { assert.deepEqual(actual, expected, name); }
  catch (error) { witness.failures.push({ name, error: error.message }); persist(); throw error; }
}
class EventHost {
  constructor() { this.listeners = new Map(); }
  addEventListener(type, fn) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(fn); }
  removeEventListener(type, fn) { this.listeners.get(type)?.delete(fn); }
  dispatch(type, data = {}) {
    for (const fn of [...(this.listeners.get(type) || [])]) fn(Object.assign({ target: this, currentTarget: this, preventDefault() {} }, data));
  }
  listenerCount() { return [...this.listeners.values()].reduce((sum, set) => sum + set.size, 0); }
}
class Element extends EventHost {
  constructor(tag, document) {
    super(); this.tagName = tag.toUpperCase(); this.ownerDocument = document; this.children = []; this.parentNode = null;
    this.dataset = {}; this.style = {}; this.attributes = {}; this.value = ''; this.classList = { toggle() {} }; this._text = '';
  }
  set textContent(value) { if (this.children.length) throw new Error('Parent text replacement'); this._text = value; }
  get textContent() { return this._text; }
  append(...values) { for (const value of values) this.appendChild(value); }
  appendChild(value) { value.remove(); this.children.push(value); value.parentNode = this; return value; }
  remove() { if (this.parentNode) { this.parentNode.children = this.parentNode.children.filter(x => x !== this); this.parentNode = null; } }
  replaceChildren(...values) { for (const child of [...this.children]) child.remove(); this.append(...values); }
  contains(value) { return this === value || this.children.some(child => child.contains(value)); }
  setAttribute(name, value) { this.attributes[name] = value; }
  click() { this.dispatch('click'); }
  focus() { this.ownerDocument.activeElement = this; }
  closest() { return this.tagName === 'BUTTON' ? this : this.parentNode?.closest() || null; }
}
const windowEvents = new EventHost(), document = new EventHost();
Object.assign(document, { activeElement: null, hidden: false, defaultView: {}, elements: new Map(),
  createElement(tag) { return new Element(tag, this); }, getElementById(id) { return this.elements.get(id); } });
for (const id of ['fdg-editor', 'fdg-projection', 'fdg-effect', 'fdg-camera-reset', 'fdg-stats']) {
  document.elements.set(id, document.createElement(id === 'fdg-editor' ? 'aside' : id === 'fdg-stats' ? 'p' : 'button'));
}
const hostChild = document.createElement('span'); hostChild.textContent = 'existing host child';
document.elements.get('fdg-editor').appendChild(hostChild);
const canvas = document.createElement('canvas'); canvas.width = 960; canvas.height = 600;
const context = new Proxy({}, { get(target, key) { return key in target ? target[key] : () => {}; }, set(target, key, value) { target[key] = value; return true; } });
canvas.getContext = () => context; canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 960, height: 600 });
canvas.setPointerCapture = () => {}; document.elements.set('fdg-viewport', canvas);
const frames = new Map(), cancelled = []; let nextFrame = 1;
global.document = document;
global.addEventListener = windowEvents.addEventListener.bind(windowEvents);
global.removeEventListener = windowEvents.removeEventListener.bind(windowEvents);
global.requestAnimationFrame = callback => { const id = nextFrame++; frames.set(id, callback); return id; };
global.cancelAnimationFrame = id => { cancelled.push(id); frames.delete(id); };
windowEvents.addEventListener('blur', () => {}); document.addEventListener('visibilitychange', () => {});
canvas.addEventListener('pointerdown', () => {});
const images = [];
global.Image = class ControlledImage {
  constructor() { this.width = this.naturalWidth = 3840; this.height = this.naturalHeight = 2560; this.complete = false; images.push(this); }
  set src(url) { this.url = url; }
  finish() { this.complete = true; if (this.onload) this.onload(); }
};
const next = timestamp => { const [id, callback] = frames.entries().next().value; frames.delete(id); callback(timestamp); };
const reduced = (store, url) => { const q = store.query(url); return [q.state, q.refCount, q.pinned]; };

async function run() {
  for (const file of ['core', 'animation', 'renderer', 'editor', 'demo']) require(path.join(engineDir, 'src', file + '.js'));
  const FDG = global.FDG, demo = global.FDGDemo, store = demo.renderer.resources;
  const url = demo.tree.getNode('effect').clip.imageUrl;
  next(0);
  check('sample draw owns one unpinned loading lease', [images.length, ...reduced(store, url)], [1, 'loading', 1, false]);
  const secondTree = new FDG.SceneTree();
  secondTree.root.addChild(new FDG.SpriteNode({ clip: demo.tree.getNode('effect').clip, width: 180, height: 180 }));
  const second = new FDG.Renderer25D(canvas, { tree: secondTree, resources: store }); second.render();
  check('another renderer shares sample image and adds its own lease', [images.length, ...reduced(store, url)], [1, 'loading', 2, false]);
  next(16); next(32);
  check('continued sample rendering does not add leases', reduced(store, url), ['loading', 2, false]);
  windowEvents.dispatch('pagehide', { persisted: true });
  check('back-forward cache pagehide preserves live sample', [demo.disposed, frames.size, ...reduced(store, url)], [false, 1, 'loading', 2, false]);
  images[0].finish(); await Promise.resolve();
  const staleFrame = frames.values().next().value;
  const steps = demo.tree.steps;
  check('sample owner disposal is first-call true', demo.dispose(), true);
  check('dispose releases sample lease but preserves other renderer', [demo.disposed, ...reduced(store, url)], [true, 'ready', 1, false]);
  check('sample RAF cancelled once and is not queued', [cancelled.length, frames.size], [1, 0]);
  staleFrame(1000);
  check('late RAF callback cannot advance or reschedule disposed sample', [demo.tree.steps, frames.size], [steps, 0]);
  check('foreign host child and input listeners survive teardown', [hostChild.parentNode === document.getElementById('fdg-editor'),
    document.getElementById('fdg-editor').children.length, windowEvents.listenerCount(), document.listenerCount(), canvas.listenerCount()], [true, 1, 1, 1, 1]);
  check('sample dispose is idempotent', [demo.dispose(), cancelled.length], [false, 1]);
  second.dispose();
  check('last managed renderer evicts image entry', reduced(store, url), ['missing', 0, false]);
  delete require.cache[require.resolve(path.join(engineDir, 'src/demo.js'))];
  require(path.join(engineDir, 'src/demo.js'));
  const pageDemo = global.FDGDemo; next(0);
  const pageStore = pageDemo.renderer.resources;
  windowEvents.dispatch('pagehide', { persisted: false }); await Promise.resolve();
  check('nonpersisted pagehide disposes pending sample ownership', [pageDemo.disposed, frames.size, ...reduced(pageStore, url)], [true, 0, 'missing', 0, false]);
  check('second sample teardown preserves foreign listeners', [windowEvents.listenerCount(), document.listenerCount(), canvas.listenerCount()], [1, 1, 1]);
  witness.imageConstructors = images.length; witness.pass = witness.checks.length; persist();
  console.log(JSON.stringify({ scope: witness.scope, pass: witness.pass, fail: witness.failures.length, productImageDecodes: 0 }));
}
run().catch(error => { witness.fatal = error.stack; persist(); process.exitCode = 1; });
