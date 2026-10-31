import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function setup(extra = {}) {
  const images = [];
  class Image {
    constructor() { images.push(this); this.complete = false; this.naturalWidth = 0; }
    set src(value) { this.url = value; }
    get src() { return this.url; }
  }
  const context = { Image, innerWidth: 3840, innerHeight: 1080,
    EXODUSER_FULLSCREEN_ART: { 'img/test.jpg': { wide21: '21.webp', wide32: '32.webp' } }, ...extra };
  vm.runInNewContext(fs.readFileSync(new URL('../fullscreen-art.js', import.meta.url), 'utf8'), context);
  return { art: context.FullscreenArt, images, context };
}

test('selects original, 21:9 and 32:9 plates without changing unrelated loading assets', () => {
  const { art } = setup();
  assert.equal(art.select('img/test.jpg?v=old', 1920, 1080), 'img/test.jpg?v=old');
  assert.equal(art.select('img/test.jpg', 2560, 1600), 'img/test.jpg');
  assert.equal(art.select('img/test.jpg', 2560, 1080), '21.webp');
  assert.equal(art.select('img/test.jpg', 3840, 1080), '32.webp');
  assert.equal(art.select('img/lording/1.png', 3840, 1080), 'img/lording/1.png');
});

test('failed wide image falls back once to its original and does not retry forever', () => {
  const { art, images } = setup();
  const img = art.get('img/test.jpg', 3840, 1080);
  assert.equal(img.src, '32.webp');
  img.onerror();
  assert.equal(img.src, 'img/test.jpg');
  assert.equal(img.onerror, null);
  assert.equal(art.get('img/test.jpg', 3840, 1080), img);
  assert.equal(images.length, 1);
});

test('cover geometry uses one uniform scale and centers the full-height superwide plate', () => {
  const { art } = setup();
  const r = art.rect(5120, 1440, 3840, 1080);
  assert.deepEqual(Array.from(r), [0, 0, 3840, 1080]);
  const narrow = art.rect(2560, 1440, 2560, 1600);
  assert.equal(narrow[2] / 2560, narrow[3] / 1440);
  assert.equal(narrow[3], 1600);
});

test('late old background load cannot replace a newer character selection', () => {
  const { art, images } = setup();
  const el = { style: {}, dataset: {} };
  art.background(el, 'img/test.jpg');
  art.background(el, 'other.jpg');
  images[1].naturalWidth = 1920; images[1].onload();
  images[0].naturalWidth = 5120; images[0].onload();
  assert.equal(el.style.backgroundImage, 'url("other.jpg")');
});

test('a failed picture plate never marks the original fallback as a completed wide plate', () => {
  const { art } = setup();
  const el = { dataset: {}, naturalWidth: 2560, complete: false,
    getAttribute() { return this.src; } };
  art.picture(el, 'img/test.jpg');
  el.onerror();
  el.onload();
  assert.equal(el.src, 'img/test.jpg');
  assert.equal(el.dataset.wideReady, 'false');
  assert.equal(el.dataset.wideArt, 'original');
});

test('DOM video remains above its ready plate and follows the manifest center rather than viewport center', () => {
  const { art, context } = setup();
  art.setManifest({ assets: [{ source: 'img/test.jpg', original: { width: 2000, height: 1000 },
    outputs: [{ path: '32.webp', width: 4000, height: 1000, centerX: 600 }] }] });
  const plate = { style: {}, dataset: {}, naturalWidth: 4000, naturalHeight: 1000, complete: true,
    parentElement: { clientWidth: 3840, clientHeight: 1080 }, getAttribute() { return this.src; } };
  const video = { style: { setProperty(name, value) { this[name] = value; } }, dataset: {} };
  art.video(video, plate);
  art.picture(plate, 'img/test.jpg'); plate.onload();
  assert.equal(video.dataset.wideVideo, 'true');
  assert.equal(video.style['--wide-video-x'], '408px');
  assert.equal(video.style['--wide-video-w'], '2160px');
  assert.equal(video.style['--wide-video-h'], '1080px');
  context.innerWidth = 1920;
  plate.parentElement.clientWidth = 1920;
  art.picture(plate, 'img/test.jpg');
  assert.equal(video.dataset.wideVideo, 'false');
});

test('an unready or failed extension cannot crop or mask the existing original video', () => {
  const { art } = setup();
  const plate = { style: {}, dataset: {}, naturalWidth: 4000, naturalHeight: 1000, complete: false,
    getAttribute() { return this.src; } };
  const video = { style: { setProperty() {} }, dataset: {} };
  art.video(video, plate);
  art.picture(plate, 'img/test.jpg');
  assert.equal(video.dataset.wideVideo, 'false');
  plate.onerror();
  assert.equal(video.dataset.wideVideo, 'false');
});

test('atmosphere spans both extended wings, moves over time, and stops under reduced motion', () => {
  const query = { matches: false };
  const { art } = setup({ matchMedia: () => query });
  const frames = [];
  const cx = { save() {}, restore() {}, beginPath() {}, fill() {}, ellipse(x, y) { frames.push([x,y]); },
    arc(x,y) { frames.push([x,y]); }, createRadialGradient() { return { addColorStop() {} }; }, fillRect() {} };
  art.drawAtmosphere(cx, 3840, 1080, 0, 'ash');
  const first = frames.slice(); frames.length = 0;
  art.drawAtmosphere(cx, 3840, 1080, 10000, 'ash');
  assert(first.some(([x]) => x < 960));
  assert(first.some(([x]) => x > 2880));
  assert.notDeepEqual(frames, first);
  frames.length = 0; query.matches = true;
  art.drawAtmosphere(cx, 3840, 1080, 10000, 'ash');
  assert.equal(frames.length, 0);
  query.matches = false; art.setMotionPolicy(() => false);
  art.drawAtmosphere(cx, 3840, 1080, 10000, 'ash');
  assert.equal(frames.length, 0);
});

test('repeated atmosphere frames reuse the fog texture instead of rasterizing three new gradients', () => {
  let gradients = 0, images = 0;
  const texture = { createRadialGradient() { gradients++;return { addColorStop() {} }; }, fillRect() {} };
  const { art } = setup({ document: { createElement() { return { getContext() { return texture; } }; } } });
  const cx = { save() {}, restore() {}, beginPath() {}, fill() {}, ellipse() {}, arc() {}, fillRect() {},
    createRadialGradient() { gradients++;return { addColorStop() {} }; }, drawImage() { images++; } };
  art.drawAtmosphere(cx, 3840, 1080, 0, 'crypt');
  art.drawAtmosphere(cx, 3840, 1080, 10000, 'crypt');
  assert.equal(gradients, 1);
  assert.equal(images, 6);
});

test('a screen that becomes opaque through a CSS transition wakes its stopped atmosphere', () => {
  let opaque = false;
  const callbacks = [], listeners = {};
  const canvas = { hidden: false, setAttribute() {}, getContext() { return {}; } };
  const host = { isConnected: true, parentElement: null, getClientRects() { return [{}]; },
    checkVisibility() { return opaque; }, appendChild() {}, addEventListener(name, callback) { listeners[name] = callback; } };
  const { art } = setup({ document: { createElement() { return canvas; } },
    requestAnimationFrame(callback) { callbacks.push(callback);return callbacks.length; } });
  art.atmosphere(host);
  callbacks.shift()(0);
  assert.equal(canvas.hidden, true);
  assert.equal(callbacks.length, 0);
  opaque = true;
  assert.equal(typeof listeners.transitionend, 'function');
  listeners.transitionend();
  assert.equal(callbacks.length, 1);
});
