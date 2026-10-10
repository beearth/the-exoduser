'use strict';
// A controlled DOM/Canvas fixture, not a browser UI or EXODUSER performance test.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const canvasLib = require(process.env.FDG_CANVAS_MODULE || '@napi-rs/canvas');
const engineDir = path.resolve(__dirname, '..');
const output = process.env.FDG_TEST_OUTPUT || path.join(require('node:os').tmpdir(), 'fdg-engine-integration');
fs.mkdirSync(output, { recursive: true });
const witness = { scope: 'NEW_FDG_ENGINE_INTEGRATION', browserUI: false, mainGame: false,
  productDecodes: 0, checks: [], failures: [] };
function persist() { fs.writeFileSync(path.join(output, 'integration-witness.json'), JSON.stringify(witness, null, 2)); }
function check(name, actual, expected) {
  witness.checks.push({ name, actual, expected }); persist();
  try { assert.deepEqual(actual, expected, name); }
  catch (error) { witness.failures.push({ name, error: error.message }); persist(); throw error; }
}
class Element {
  constructor(tag, document) {
    this.tagName = tag.toUpperCase(); this.ownerDocument = document; this.children = []; this.parentNode = null;
    this.dataset = {}; this.style = {}; this.attributes = {}; this.listeners = new Map(); this.value = '';
    this.classList = { toggle() {} }; this._text = '';
  }
  set textContent(value) { if (this.children.length) throw new Error('Parent text replacement in fixture'); this._text = value; }
  get textContent() { return this._text; }
  append(...values) { for (const value of values) this.appendChild(value); }
  appendChild(value) { value.remove(); this.children.push(value); value.parentNode = this; return value; }
  remove() { if (this.parentNode) { this.parentNode.children = this.parentNode.children.filter(x => x !== this); this.parentNode = null; } }
  replaceChildren(...values) { for (const child of [...this.children]) child.remove(); this.append(...values); }
  contains(value) { return this === value || this.children.some(child => child.contains(value)); }
  setAttribute(name, value) { this.attributes[name] = value; }
  addEventListener(type, listener) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(listener); }
  removeEventListener(type, listener) { this.listeners.get(type)?.delete(listener); }
  dispatch(type, data = {}) {
    const event = Object.assign({ target: this, currentTarget: this, preventDefault() {} }, data);
    for (const listener of this.listeners.get(type) || []) listener(event);
  }
  click() { this.dispatch('click'); }
  focus() { this.ownerDocument.activeElement = this; }
  closest() { return this.tagName === 'BUTTON' ? this : this.parentNode?.closest() || null; }
}
const document = {
  activeElement: null, hidden: false, defaultView: {}, elements: new Map(), listeners: new Map(),
  createElement(tag) { return new Element(tag, this); },
  getElementById(id) { return this.elements.get(id); },
  addEventListener(type, listener) { this.listeners.set(type, listener); }
};
for (const id of ['fdg-editor', 'fdg-projection', 'fdg-effect', 'fdg-camera-reset', 'fdg-stats']) {
  document.elements.set(id, document.createElement(id === 'fdg-editor' ? 'aside' : id === 'fdg-stats' ? 'p' : 'button'));
}
const savedChild = document.createElement('span'); savedChild.textContent = 'preserve';
document.elements.get('fdg-editor').appendChild(savedChild);
const nativeCanvas = canvasLib.createCanvas(960, 600);
const canvas = document.createElement('canvas');
canvas.width = 960; canvas.height = 600; canvas.getContext = () => nativeCanvas.getContext('2d');
canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 960, height: 600 });
canvas.setPointerCapture = () => {};
document.elements.set('fdg-viewport', canvas);
const callbacks = [];
global.document = document; global.addEventListener = () => {};
global.requestAnimationFrame = callback => { callbacks.push(callback); };
const sourceSetter = Object.getOwnPropertyDescriptor(canvasLib.Image.prototype, 'src').set;
global.Image = function () {
  witness.productDecodes++;
  const image = new canvasLib.Image();
  Object.defineProperty(image, 'src', { set(url) { sourceSetter.call(image, path.resolve(engineDir, url)); } });
  return image;
};

async function run() {
  for (const file of ['core', 'animation', 'renderer', 'editor', 'demo']) require(path.join(engineDir, 'src', file + '.js'));
  const { FDG, FDGDemo: demo } = global;
  check('script stack boots / host child preserved', [!!demo, savedChild.parentNode === document.getElementById('fdg-editor')], [true, true]);
  check('demo node count / editor ownership', [demo.editor.snapshot().nodeCount, demo.editor.tree === demo.tree], [7, true]);
  const frame = timestamp => { const callback = callbacks.shift(); assert(callback); callback(timestamp); };
  frame(0);
  await demo.renderer.resources.loadImage('../assets/vfx/fieldboss/boss_fire_impact_24_20261010.png');
  const actor = demo.tree.getNode('actor'), effect = demo.tree.getNode('effect');
  canvas.dispatch('keydown', { key: 'd' });
  for (let i = 1; i <= 30; i++) frame(i * 1000 / 60);
  canvas.dispatch('keyup', { key: 'd' });
  check('actual demo input / fixed physics / seconds', [Math.round(actor.position.x), Math.round(demo.tree.simulationTime * 100), effect.currentFrame()], [60, 50, 8]);
  // Independent row-major pixel oracle for the current native Canvas sprite output.
  const raster = canvasLib.createCanvas(960, 600), ctx = raster.getContext('2d');
  const cleanTree = new FDG.SceneTree();
  const sprite = new FDG.SpriteNode({ id: 'oracle-sprite', clip: effect.clip, width: 180, height: 180, blend: 'source-over' });
  cleanTree.root.addChild(sprite); cleanTree.advance(8 / 60);
  const renderer = new FDG.Renderer25D(raster, { tree: cleanTree, resources: demo.renderer.resources });
  const stats = renderer.render();
  const expected = canvasLib.createCanvas(960, 600), oracle = expected.getContext('2d');
  oracle.fillStyle = '#111722'; oracle.fillRect(0, 0, 960, 600);
  // Eight 60Hz physics steps at 16FPS reach frame2: source x1280/y0; display center 480,348.
  oracle.drawImage(demo.renderer.resources.getImage(effect.clip.imageUrl), 1280, 0, 640, 640, 390, 258, 180, 180);
  const actualPixels = Buffer.from(ctx.getImageData(0, 0, 960, 600).data);
  const expectedPixels = Buffer.from(oracle.getImageData(0, 0, 960, 600).data);
  check('renderer consumes sprite frame2 / independent pixels', [sprite.currentFrame(), stats.sprites, actualPixels.equals(expectedPixels)], [2, 1, true]);
  ctx.globalAlpha = .4; ctx.globalCompositeOperation = 'multiply'; ctx.translate(12, 8);
  const saved = [ctx.globalAlpha, ctx.globalCompositeOperation, ctx.getTransform().e, ctx.getTransform().f];
  renderer.render();
  check('renderer restores caller state', [ctx.globalAlpha, ctx.globalCompositeOperation, ctx.getTransform().e, ctx.getTransform().f], saved);
  const world = { x: 73, y: -34, z: 17 };
  for (const projection of ['isometric', 'topdown']) {
    Object.assign(renderer.camera, { projection, x: 11, y: -6, zoom: 1.7 });
    const projected = renderer.project(world.x, world.y, world.z), restored = renderer.screenToWorld(projected.x, projected.y, world.z);
    check('camera inverse ' + projection, [Math.abs(restored.x - world.x) < 1e-10, Math.abs(restored.y - world.y) < 1e-10], [true, true]);
  }
  const group = demo.tree.getNode('group'); group.rotation = .5; group.scale.x = 1.8;
  const child = demo.tree.getNode('marker-1'); child.rotation = .7;
  demo.renderer.render(); const hitPoint = demo.renderer.project(child.worldTransform().tx, child.worldTransform().ty);
  check('nested affine selection', demo.renderer.hitTest(hitPoint.x, hitPoint.y)?.id, child.id);
  const time = demo.tree.simulationTime; demo.editor.pause(); frame(1000);
  check('editor pause freezes actual sample clock', demo.tree.simulationTime, time);
  demo.editor.step();
  check('editor single step changes exactly one tick', [demo.tree.steps, demo.tree.paused], [31, true]);
  demo.editor.select(actor); demo.editor.fields.x.value = '84'; demo.editor.fields.x.dispatch('change');
  check('inspector edit uses actual node / remains paused', [actor.position.x, demo.tree.paused], [84, true]);
  const exported = demo.editor.exportJSON(), oldTree = demo.tree;
  const imported = demo.editor.importJSON(exported);
  check('import wires demo/renderer/editor to one new tree', [demo.tree === imported, demo.renderer.tree === imported, imported.getNode('effect') instanceof FDG.SpriteNode,
    imported.getNode('effect').currentFrame(), imported.getNode('actor').position.x], [true, true, true, 8, 84]);
  try { demo.editor.importJSON('{"format":"broken"}'); assert.fail('invalid import accepted'); } catch (error) { assert.notEqual(error.message, 'invalid import accepted'); }
  check('bad import preserves live scene', demo.tree === imported, true);
  try { demo.editor.select(oldTree.getNode('actor')); assert.fail('stale selection accepted'); } catch (error) { assert.notEqual(error.message, 'stale selection accepted'); }
  demo.editor.select(imported.root); const added = demo.editor.addNode();
  check('editor add linked node', added.tree === demo.tree, true); demo.editor.deleteSelected();
  check('editor delete detaches node', added.tree, null);
  document.getElementById('fdg-effect').click(); frame(1016.6666666667);
  check('effect replay button resumes new imported scene', [demo.tree.paused, demo.tree.getNode('effect').animator.elapsed < .02], [false, true]);
  check('one image reused through redraw/import', witness.productDecodes, 1);
  demo.renderer.selection = demo.tree.getNode('actor'); demo.renderer.render();
  fs.writeFileSync(path.join(output, 'fdg-viewport-proof.png'), nativeCanvas.toBuffer('image/png'));
  demo.editor.destroy();
  check('editor destroy preserves host child and removes own shell', [document.getElementById('fdg-editor').children.length, savedChild.parentNode !== null], [1, true]);
  witness.status = 'PASS'; witness.limit = 'Controlled DOM and native Canvas only. Browser, file URL execution, GPU and in-game migration unassessed.';
  persist(); console.log(JSON.stringify({ status: witness.status, checks: witness.checks.length, productDecodes: witness.productDecodes, output }));
}
run().catch(error => { witness.status = 'FAIL'; witness.error = error.stack; persist(); console.error(error.stack); process.exitCode = 1; });
