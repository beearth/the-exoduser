import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadImage, createCanvas } from 'canvas';

const variants = [1, 2, 4, 3, 3, 4, 2, 1];
const positions = [[84,184],[80,150],[30,96],[80,36],[124,31],[176,96],[124,149],[124,179]];
const ids = Array.from({ length: 8 }, (_, i) => `m_ctree${13 + i}`);

function handTrees(source) {
  const block = source.match(/\/\/ CH1-1 HAND PROPS START([\s\S]*?)\/\/ CH1-1 HAND PROPS END/);
  assert.ok(block, 'CH1-1 authored prop block exists');
  return [...block[1].matchAll(/\{id:'(m_ctree\d+)',x:(\d+),y:(\d+),scale:([\d.]+)\}/g)]
    .map(([, id, x, y, scale]) => ({ id, x: +x, y: +y, scale: +scale }));
}

test('CH1-1 uses eight Sunburst trees at the preserved anchors in both builds', () => {
  for (const name of ['game.html', 'game-easy-test.html']) {
    const source = readFileSync(new URL(`../${name}`, import.meta.url), 'utf8');
    const trees = handTrees(source);
    assert.deepEqual(trees.map(({id,x,y}) => [id,x,y]), ids.map((id,i) => [id,...positions[i]]), name);
    assert.ok(new Set(trees.map(tree => tree.scale)).size >= 6, 'varied scales avoid repeated silhouettes');
    for (let i = 0; i < ids.length; i++) {
      const file = `sunburst_tree_0${variants[i]}.png`;
      assert.match(source, new RegExp(`\\{id:'${ids[i]}',file:'${file}',[^\\n]*stageMax:0[^\\n]*authoredOnly:1`), `${name}: ${ids[i]} is CH1-1 only`);
    }
  }
});

test('all four production tree assets have real alpha, including transparent corners', async () => {
  for (let variant = 1; variant <= 4; variant++) {
    const path = fileURLToPath(new URL(`../assets/map/ch1/collision/sunburst_tree_0${variant}.png`, import.meta.url));
    assert.ok(existsSync(path), `missing ${path}`);
    const image = await loadImage(path);
    assert.ok(image.width >= 1024 && image.height >= 1024, 'game-scale source retains 2x resolution');
    const canvas = createCanvas(image.width, image.height), ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    for (const [x,y] of [[0,0],[image.width-1,0],[0,image.height-1],[image.width-1,image.height-1]]) {
      assert.equal(ctx.getImageData(x,y,1,1).data[3], 0, 'corner must be transparent');
    }
    const pixels = ctx.getImageData(0,0,image.width,image.height).data;
    let opaque = 0;
    for (let p = 3; p < pixels.length; p += 4) if (pixels[p] > 200) opaque++;
    assert.ok(opaque > image.width * image.height * .08,
      'tree material must remain opaque while the arch may stay open');
  }
});
