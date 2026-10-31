import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function setup() {
  const images = [];
  class Image {
    constructor() { images.push(this); this.complete = false; this.naturalWidth = 0; }
    set src(value) { this.url = value; }
    get src() { return this.url; }
  }
  const context = { Image, innerWidth: 3840, innerHeight: 1080,
    EXODUSER_FULLSCREEN_ART: { 'img/test.jpg': { wide21: '21.webp', wide32: '32.webp' } } };
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
